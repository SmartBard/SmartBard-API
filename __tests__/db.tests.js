const { executeQuery } = require('../db/connect');

const {
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getUserActivity
} = require('../db/db-announcements-interface');

const {
    addLog,
    retrieveLogPage,
    removeLogsOfAnnouncement
} = require('../db/db-auditlog-interface');

const {
    getUserById,
    getUserByEmail,
    createNewUser,
    updateUser
} = require('../db/db-user-interface');

const Status = {
    REQUESTED: 'requested',
    APPROVED: 'approved',
    DENIED: 'denied',
    CHANGES: 'changes'
};
  

describe('TESTS: DB Connection', () => {

})

describe('TESTS: DB Announcement Interface', () => {
    beforeEach(() => {
        jest.mock('../db/connect', () => ({
            executeQuery: jest.fn()
        }));
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    // it('getAnnouncements should ', async () => {
    //     expect.assertions(1);

    //     const mockResponse = [{ id: 1, title: 'Announcement 1' }];
    //     executeQuery.mockResolvedValueOnce(mockResponse);

    //     const cols = ['datefrom'];
    //     const vals = [null];

    //     const expectedQuery = {
    //       text: 'SELECT * FROM announcements WHERE datefrom < now();',
    //       values: [],
    //     };

    //     const result = await getAnnouncements(cols, vals);

    //     expect(result).toEqual(mockResponse);
    //     expect(executeQuery).toHaveBeenCalledWith(expectedQuery);
    //   });

    it('getAnnouncements should throw an error for invalid arguments', async () => {
        expect.assertions(1);

        const cols = ['col1'];
        const vals = ['val1', 'val2'];

        try {
            await getAnnouncements(cols, vals);
        } catch (error) {
            expect(error).toEqual(new Error('Invalid args'));
        }
    });

    it('createAnnouncement should insert record into db with status in `requested`', async ()=> {

        const mockResponse = [{announcementId: 1, status: Status.REQUESTED}];

        const timestamp = new Date().toISOString();
        const vals = [
            'Title',
            'Body',
            'Media',
            timestamp,
            timestamp,
            1,
            Status.REQUESTED,
            false,
            timestamp,
            1,
            timestamp
        ];
      
        const result = await createAnnouncement(vals);
        expect(result.status).toEqual(mockResponse.status);
    })

    it('createAnnouncement should throw an error for incorrect number of params', async () => {
        expect.assertions(1);

        const vals = ['incorrect params'];
        try {
            await createAnnouncement(vals);
        } catch (error) {
            expect(error).toEqual(new Error('Invalid parameter'));
        }
    });

    it('updateAnnouncement should update value in specified column', async () => {
        expect.assertions(2);

        const column = 'body';
        const newValue = 'New Body';
        const id = 1;
        
        const result = await updateAnnouncement(column, newValue, id);

        const selectQuery = {
            text: 'SELECT * FROM public.announcements WHERE announcementid = $1;',
            values: [id],
        };
          
        const selectResult = await executeQuery(selectQuery);
        expect(selectResult.rowCount).toBe(1);
        expect(selectResult.rows[0][column]).toBe(newValue);

    });

    // it('deleteAnnouncement should delete record from db', async () => {

    //     const id = 1;
    //     const result = await deleteAnnouncement(id);

    //     const selectQuery = {
    //         text: 'SELECT * FROM public.announcements WHERE announcementid = $1;',
    //         values: [id],
    //     };
          
    //     const selectResult = await executeQuery(selectQuery);
    //     expect(selectResult.rowCount).toBe(0);
    // })
})

describe('TESTS: DB Audit Log Interface', () => {
    beforeEach(() => {
        jest.mock('../db/connect', () => ({
            executeQuery: jest.fn()
        }));
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('addLog should insert record into auditlog table', async () => {

        const timestamp = new Date().toISOString();
        const result = await addLog(1, timestamp, 1, 'requested')

        const rowCountQuery = {
            text: 'SELECT COUNT(*) from public.auditlog'
        }
        const rowCount = await executeQuery(rowCountQuery);

        const selectQuery = {
            text: 'SELECT * FROM public.auditlog WHERE actionid = $1;',
            values: [rowCount],
        };
          
        const selectResult = await executeQuery(selectQuery);
        // expect(length(selectResult.rows)).toBe(1);
        // expect(selectResult.rows[0].actiontype).toBe(Status.REQUESTED);
        expect(selectResult.rows[0].actiontime).tobe(timestamp);
    })

    it('removeLogsOfAnnouncement should delete record from auditlog table', async () => {

        const id = 1;
        const result = await removeLogsOfAnnouncement(id);

        const selectQuery = {
            text: 'SELECT * FROM public.auditlog WHERE announcementid = $1;',
            values: [id],
        };
          
        const selectResult = await executeQuery(selectQuery);
        expect(selectResult.rowCount).toBe(0);
    })
})

describe('TESTS: DB User Interface', () => {
    beforeEach(() => {
        jest.mock('../db/connect', () => ({
            executeQuery: jest.fn()
        }));
    })

    afterEach(() => {
        jest.clearAllMocks();
    })



})

describe('TESTS: DB User Settings Interface', () => {
    beforeEach(() => {
        jest.mock('../db/connect', () => ({
            executeQuery: jest.fn()
        }));
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

})

describe('TESTS: DB Tables', () => {
    beforeEach(() => {
        jest.mock('../db/connect', () => ({
            executeQuery: jest.fn()
        }));
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

})