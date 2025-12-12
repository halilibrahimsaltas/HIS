import { Injectable } from '@nestjs/common';

export interface AstmParsedResult {
  messageType: string; // H, P, O, R, L
  sequenceNumber?: string;
  patientId?: string;
  patientName?: string;
  testCode?: string;
  result?: string;
  unit?: string;
  referenceRange?: string;
  flags?: string[];
  timestamp?: Date;
  barcode?: string;
}

@Injectable()
export class AstmParserService {
  parseMessage(rawMessage: string): AstmParsedResult[] {
    const results: AstmParsedResult[] = [];
    const lines = rawMessage.split(/\r\n|\r|\n/).filter((line) => line.trim());

    let currentPatient: Partial<AstmParsedResult> = {};
    let currentOrder: Partial<AstmParsedResult> = {};

    for (const line of lines) {
      if (line.length < 1) continue;

      const recordType = line[0];

      switch (recordType) {
        case 'H': // Header
          // Header bilgileri
          break;

        case 'P': // Patient
          currentPatient = this.parsePatientRecord(line);
          break;

        case 'O': // Order
          currentOrder = this.parseOrderRecord(line);
          if (currentPatient.patientId) {
            currentOrder.patientId = currentPatient.patientId;
            currentOrder.patientName = currentPatient.patientName;
          }
          break;

        case 'R': // Result
          const result = this.parseResultRecord(line);
          if (currentOrder.testCode) {
            result.testCode = currentOrder.testCode;
            result.barcode = currentOrder.barcode;
          }
          if (currentPatient.patientId) {
            result.patientId = currentPatient.patientId;
            result.patientName = currentPatient.patientName;
          }
          results.push(result as AstmParsedResult);
          break;

        case 'L': // Terminator
          // Mesaj sonu
          break;
      }
    }

    return results;
  }

  private parsePatientRecord(line: string): Partial<AstmParsedResult> {
    const fields = line.split('|');
    return {
      messageType: 'P',
      patientId: fields[2] || undefined,
      patientName: fields[5] ? `${fields[5]}^${fields[6] || ''}`.replace(/\^/g, ' ') : undefined,
    };
  }

  private parseOrderRecord(line: string): Partial<AstmParsedResult> {
    const fields = line.split('|');
    return {
      messageType: 'O',
      sequenceNumber: fields[1],
      barcode: fields[2] || fields[3] || undefined,
      testCode: fields[4] || undefined,
    };
  }

  private parseResultRecord(line: string): Partial<AstmParsedResult> {
    const fields = line.split('|');
    const flags: string[] = [];

    // Flag kontrolü (fields[10] genellikle flag alanı)
    if (fields[10]) {
      if (fields[10].includes('H')) flags.push('HIGH');
      if (fields[10].includes('L')) flags.push('LOW');
      if (fields[10].includes('A')) flags.push('ABNORMAL');
    }

    return {
      messageType: 'R',
      sequenceNumber: fields[1],
      testCode: fields[2],
      result: fields[3] || undefined,
      unit: fields[4] || undefined,
      referenceRange: fields[5] || undefined,
      flags: flags.length > 0 ? flags : undefined,
      timestamp: fields[12] ? this.parseTimestamp(fields[12]) : new Date(),
    };
  }

  private parseTimestamp(timestampStr: string): Date {
    // ASTM timestamp formatı: YYYYMMDDHHmmss
    if (timestampStr.length >= 14) {
      const year = parseInt(timestampStr.substring(0, 4));
      const month = parseInt(timestampStr.substring(4, 6)) - 1;
      const day = parseInt(timestampStr.substring(6, 8));
      const hour = parseInt(timestampStr.substring(8, 10));
      const minute = parseInt(timestampStr.substring(10, 12));
      const second = parseInt(timestampStr.substring(12, 14));
      return new Date(year, month, day, hour, minute, second);
    }
    return new Date();
  }
}

