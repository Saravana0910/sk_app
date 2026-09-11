import { net } from 'react-native-force';
import type { CaseRecord, CaseInput, SoqlResponse } from '../types/case';

const CASE_FIELDS = 'Id, CaseNumber, Subject, Status, Priority, Origin, Description';

export function listCases(limit = 50): Promise<CaseRecord[]> {
    return new Promise((resolve, reject) => {
        net.query<SoqlResponse<CaseRecord>>(
            `SELECT ${CASE_FIELDS} FROM Case ORDER BY CreatedDate DESC LIMIT ${Number(limit)}`,
            (response) => resolve(response.records),
            (error: unknown) => reject(error),
        );
    });
}

export function getCase(id: string): Promise<CaseRecord> {
    return new Promise((resolve, reject) => {
        net.retrieve<CaseRecord>(
            'Case',
            id,
            (record) => resolve(record),
            (error: unknown) => reject(error),
        );
    });
}

export function createCase(fields: CaseInput): Promise<{ id: string }> {
    return new Promise((resolve, reject) => {
        net.create<{ id: string }>(
            'Case',
            fields,
            (response) => resolve(response),
            (error: unknown) => reject(error),
        );
    });
}

export function updateCase(id: string, fields: CaseInput): Promise<void> {
    return new Promise((resolve, reject) => {
        net.update<void>(
            'Case',
            id,
            fields,
            () => resolve(),
            (error: unknown) => reject(error),
        );
    });
}
