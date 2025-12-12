import { Injectable } from '@nestjs/common';

export interface Hl7ParsedResult {
  messageType: string;
  patientId?: string;
  patientName?: string;
  testCode?: string;
  result?: string;
  unit?: string;
  referenceRange?: string;
  timestamp?: Date;
  barcode?: string;
}

@Injectable()
export class Hl7ParserService {
  parseMessage(rawMessage: string): Hl7ParsedResult[] {
    const results: Hl7ParsedResult[] = [];
    const segments = rawMessage.split('\r').filter((seg) => seg.trim());

    let currentPatient: Partial<Hl7ParsedResult> = {};
    let currentOrder: Partial<Hl7ParsedResult> = {};

    for (const segment of segments) {
      if (segment.length < 3) continue;

      const segmentType = segment.substring(0, 3);

      switch (segmentType) {
        case 'MSH': // Message Header
          // Header bilgileri
          break;

        case 'PID': // Patient Identification
          currentPatient = this.parsePID(segment);
          break;

        case 'ORC': // Common Order
          currentOrder = this.parseORC(segment);
          break;

        case 'OBR': // Observation Request
          const obrData = this.parseOBR(segment);
          currentOrder = { ...currentOrder, ...obrData };
          break;

        case 'OBX': // Observation/Result
          const result = this.parseOBX(segment);
          if (currentPatient.patientId) {
            result.patientId = currentPatient.patientId;
            result.patientName = currentPatient.patientName;
          }
          if (currentOrder.barcode) {
            result.barcode = currentOrder.barcode;
          }
          results.push(result as Hl7ParsedResult);
          break;
      }
    }

    return results;
  }

  private parsePID(segment: string): Partial<Hl7ParsedResult> {
    const fields = segment.split('|');
    const patientId = fields[3]?.split('^')[0] || undefined;
    const lastName = fields[5]?.split('^')[0] || '';
    const firstName = fields[5]?.split('^')[1] || '';
    const patientName = `${firstName} ${lastName}`.trim() || undefined;

    return {
      messageType: 'PID',
      patientId,
      patientName,
    };
  }

  private parseORC(segment: string): Partial<Hl7ParsedResult> {
    const fields = segment.split('|');
    return {
      messageType: 'ORC',
      barcode: fields[2] || undefined,
    };
  }

  private parseOBR(segment: string): Partial<Hl7ParsedResult> {
    const fields = segment.split('|');
    return {
      messageType: 'OBR',
      testCode: fields[4]?.split('^')[0] || undefined,
      barcode: fields[2] || undefined,
    };
  }

  private parseOBX(segment: string): Partial<Hl7ParsedResult> {
    const fields = segment.split('|');
    const valueType = fields[2];
    const testCode = fields[3]?.split('^')[0] || undefined;
    const result = fields[5] || undefined;
    const unit = fields[6] || undefined;
    const referenceRange = fields[7] || undefined;

    return {
      messageType: 'OBX',
      testCode,
      result,
      unit,
      referenceRange,
      timestamp: fields[14] ? this.parseHL7Timestamp(fields[14]) : new Date(),
    };
  }

  private parseHL7Timestamp(timestampStr: string): Date {
    // HL7 timestamp formatı: YYYYMMDDHHmmss
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

