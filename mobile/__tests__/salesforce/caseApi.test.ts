jest.mock('react-native-force', () => ({
    net: {
        query: jest.fn(),
        retrieve: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
}));

import { net } from 'react-native-force';
import { createCase, getCase, listCases, updateCase } from '../../src/salesforce/caseApi';

describe('caseApi', () => {
    afterEach(() => jest.resetAllMocks());

    it('listCases queries Case records and returns the records array', async () => {
        (net.query as jest.Mock).mockImplementation((_soql, success) =>
            success({ totalSize: 1, done: true, records: [{ Id: '500x', CaseNumber: '00001' }] }),
        );

        const records = await listCases();

        expect(records).toEqual([{ Id: '500x', CaseNumber: '00001' }]);
        expect(net.query).toHaveBeenCalledWith(expect.stringContaining('FROM Case'), expect.any(Function), expect.any(Function));
    });

    it('listCases rejects when the query fails', async () => {
        (net.query as jest.Mock).mockImplementation((_soql, _success, fail) => fail('query failed'));

        await expect(listCases()).rejects.toBe('query failed');
    });

    it('getCase retrieves a single Case by Id', async () => {
        (net.retrieve as jest.Mock).mockImplementation((_objtype, _id, success) => success({ Id: '500x' }));

        const record = await getCase('500x');

        expect(record).toEqual({ Id: '500x' });
        expect(net.retrieve).toHaveBeenCalledWith('Case', '500x', expect.any(Function), expect.any(Function));
    });

    it('createCase posts the given fields', async () => {
        (net.create as jest.Mock).mockImplementation((_objtype, _fields, success) => success({ id: '500new' }));

        const result = await createCase({ Subject: 'Test' });

        expect(result).toEqual({ id: '500new' });
        expect(net.create).toHaveBeenCalledWith('Case', { Subject: 'Test' }, expect.any(Function), expect.any(Function));
    });

    it('updateCase patches the given fields and resolves with no value', async () => {
        (net.update as jest.Mock).mockImplementation((_objtype, _id, _fields, success) => success());

        await expect(updateCase('500x', { Status: 'Closed' })).resolves.toBeUndefined();
        expect(net.update).toHaveBeenCalledWith('Case', '500x', { Status: 'Closed' }, expect.any(Function), expect.any(Function));
    });

    it('updateCase rejects on failure', async () => {
        (net.update as jest.Mock).mockImplementation((_objtype, _id, _fields, _success, fail) => fail('update failed'));

        await expect(updateCase('500x', { Status: 'Closed' })).rejects.toBe('update failed');
    });
});
