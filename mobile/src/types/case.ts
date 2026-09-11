export interface CaseRecord {
    Id: string;
    CaseNumber: string;
    Subject: string;
    Status: string;
    Priority: string;
    Origin: string;
    Description?: string | null;
}

export type CaseInput = Partial<Pick<CaseRecord, 'Subject' | 'Status' | 'Priority' | 'Origin' | 'Description'>>;

export interface SoqlResponse<T> {
    totalSize: number;
    done: boolean;
    records: T[];
    nextRecordsUrl?: string;
}
