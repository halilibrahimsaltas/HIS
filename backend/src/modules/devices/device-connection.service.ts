import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as net from 'net';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { DeviceProtocol, ConnectionType } from '@prisma/client';

interface DeviceConnection {
  deviceId: number;
  socket?: net.Socket;
  serialPort?: SerialPort;
  isConnected: boolean;
}

@Injectable()
export class DeviceConnectionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DeviceConnectionService.name);
  private connections: Map<number, DeviceConnection> = new Map();

  constructor(
    private prisma: PrismaService,
    @InjectQueue('device-results') private deviceQueue: Queue,
  ) {}

  async onModuleInit() {
    // Uygulama başladığında aktif cihazları bağla
    const activeDevices = await this.prisma.device.findMany({
      where: { isActive: true },
    });

    for (const device of activeDevices) {
      await this.connect(device.id);
    }
  }

  async onModuleDestroy() {
    // Uygulama kapanırken tüm bağlantıları kapat
    for (const [deviceId] of this.connections) {
      await this.disconnect(deviceId);
    }
  }

  async connect(deviceId: number) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new Error('Cihaz bulunamadı');
    }

    // Zaten bağlıysa tekrar bağlanma
    if (this.connections.has(deviceId)) {
      const conn = this.connections.get(deviceId);
      if (conn?.isConnected) {
        this.logger.warn(`Cihaz ${deviceId} zaten bağlı`);
        return;
      }
    }

    try {
      if (device.connectionType === ConnectionType.TCP_IP) {
        await this.connectTcp(device);
      } else if (device.connectionType === ConnectionType.SERIAL) {
        await this.connectSerial(device);
      } else if (device.connectionType === ConnectionType.FILE) {
        this.logger.log(`Cihaz ${deviceId} file-based bağlantı (henüz desteklenmiyor)`);
      }

      await this.prisma.device.update({
        where: { id: deviceId },
        data: { lastConnected: new Date() },
      });
    } catch (error) {
      this.logger.error(`Cihaz ${deviceId} bağlantı hatası: ${error.message}`);
      throw error;
    }
  }

  private async connectTcp(device: any) {
    return new Promise<void>((resolve, reject) => {
      if (!device.host || !device.port) {
        reject(new Error('TCP/IP için host ve port gerekli'));
        return;
      }

      const socket = new net.Socket();
      const connection: DeviceConnection = {
        deviceId: device.id,
        socket,
        isConnected: false,
      };

      socket.connect(device.port, device.host, () => {
        this.logger.log(`Cihaz ${device.id} (${device.name}) TCP/IP bağlantısı kuruldu`);
        connection.isConnected = true;
        this.connections.set(device.id, connection);
        resolve();
      });

      socket.on('data', (data) => {
        this.handleDeviceData(device.id, data.toString());
      });

      socket.on('error', (error) => {
        this.logger.error(`Cihaz ${device.id} TCP/IP hatası: ${error.message}`);
        connection.isConnected = false;
        this.handleDisconnection(device.id);
      });

      socket.on('close', () => {
        this.logger.warn(`Cihaz ${device.id} TCP/IP bağlantısı kapandı`);
        connection.isConnected = false;
        this.handleDisconnection(device.id);
      });

      // Bağlantı timeout
      setTimeout(() => {
        if (!connection.isConnected) {
          socket.destroy();
          reject(new Error('Bağlantı timeout'));
        }
      }, 10000);
    });
  }

  private async connectSerial(device: any) {
    return new Promise<void>((resolve, reject) => {
      if (!device.serialPort) {
        reject(new Error('Serial port için port adı gerekli'));
        return;
      }

      const serialPort = new SerialPort({
        path: device.serialPort,
        baudRate: device.baudRate || 9600,
        autoOpen: false,
      });

      const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n', encoding: 'utf8' }));
      const connection: DeviceConnection = {
        deviceId: device.id,
        serialPort,
        isConnected: false,
      };

      serialPort.open((error) => {
        if (error) {
          reject(error);
          return;
        }

        this.logger.log(`Cihaz ${device.id} (${device.name}) Serial port bağlantısı kuruldu`);
        connection.isConnected = true;
        this.connections.set(device.id, connection);

        parser.on('data', (data) => {
          this.handleDeviceData(device.id, data.toString());
        });

        resolve();
      });

      serialPort.on('error', (error) => {
        this.logger.error(`Cihaz ${device.id} Serial port hatası: ${error.message}`);
        connection.isConnected = false;
        this.handleDisconnection(device.id);
      });

      serialPort.on('close', () => {
        this.logger.warn(`Cihaz ${device.id} Serial port bağlantısı kapandı`);
        connection.isConnected = false;
        this.handleDisconnection(device.id);
      });
    });
  }

  private async handleDeviceData(deviceId: number, data: string) {
    try {
      // Ham veriyi queue'ya ekle
      const queueItem = await this.prisma.deviceResultQueue.create({
        data: {
          deviceId,
          rawMessage: data,
          status: 'PENDING',
        },
      });

      // Queue'ya işleme için ekle
      await this.deviceQueue.add('process-result', {
        queueId: queueItem.id,
        deviceId,
        rawMessage: data,
      });

      this.logger.debug(`Cihaz ${deviceId} veri alındı: ${data.substring(0, 100)}`);
    } catch (error) {
      this.logger.error(`Cihaz ${deviceId} veri işleme hatası: ${error.message}`);
    }
  }

  private async handleDisconnection(deviceId: number) {
    const connection = this.connections.get(deviceId);
    if (connection) {
      if (connection.socket) {
        connection.socket.destroy();
      }
      if (connection.serialPort) {
        connection.serialPort.close();
      }
      this.connections.delete(deviceId);
    }

    // Cihaz durumunu güncelle
    await this.prisma.device.update({
      where: { id: deviceId },
      data: { isActive: false },
    });
  }

  async disconnect(deviceId: number) {
    const connection = this.connections.get(deviceId);
    if (!connection) {
      return;
    }

    if (connection.socket) {
      connection.socket.destroy();
    }
    if (connection.serialPort) {
      connection.serialPort.close();
    }

    this.connections.delete(deviceId);
    this.logger.log(`Cihaz ${deviceId} bağlantısı kesildi`);
  }

  isConnected(deviceId: number): boolean {
    const connection = this.connections.get(deviceId);
    return connection?.isConnected || false;
  }
}

