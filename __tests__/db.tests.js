const { executeQuery, endConnection } = require('../db/connect');

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

const {
    getUserSettings,
    getUserSettingsById,
    createUserSettings,
    updateUserSettings,
    deleteUserSettings
  } = require('../db/db-user-settings-interface');

const {
    createAllTables
  } = require('../db/db-tables');

const Status = {
    REQUESTED: 'requested',
    APPROVED: 'approved',
    DENIED: 'denied',
    CHANGES: 'changes'
};
  

describe('TESTS: DB Connection', () => {
    beforeEach(() => {
        jest.mock('../db/connect', () => ({
            executeQuery: jest.fn()
        }));
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('executeQuery should execute given sql statement once', async () => {
        const queryString = 'SELECT * FROM public.users LIMIT 1';
        
        const result = await executeQuery(queryString);

        expect(result.rowCount).toEqual(1);
        expect(result.fields).toHaveLength(6);
    })

    it('executeQuery should catch errors', async () => {

        const queryString = 'SELECT * FROM public.nonexistent_table LIMIT 1';
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        try {
            await executeQuery(queryString);
        } catch (error) {
            expect(consoleLogSpy).toHaveBeenCalledWith(new Error('error: relation "public.nonexistent_table" does not exist'));
        }

        consoleLogSpy.mockRestore();

    });

    // it('endConnection exits with no errors', () => {
    //     const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    //     const mockPool = {
    //         end: jest.fn((callback) => {
    //             callback();
    //         })
    //     }

    //     const mockRequest = {};
    //     const mockResponse = {
    //         status: jest.fn().mockReturnThis(),
    //         send: jest.fn(),      
    //     };
    //     const mockNext = {};
    
    //     endConnection(mockRequest, mockResponse, mockNext);
    //     expect(consoleLogSpy).toHaveBeenCalledWith('calling endConnection');
    //     consoleLogSpy.mockRestore();

    //     // expect(mockResponse.status).toHaveBeenCalledWith(200);
    //     // expect(mockResponse.send).toHaveBeenCalledWith('client has disconnected');
    // });

    // it('endConnection should catch errors', () => {
    //     const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    //     const mockPool = {
    //         end: jest.fn((callback) => {
    //             callback();
    //         })
    //     }

    //     const mockRequest = {};
    //     const mockResponse = {
    //         status: jest.fn().mockReturnThis(),
    //         send: jest.fn(),      
    //     };
    //     const mockNext = {};
    
    //     endConnection(mockRequest, mockResponse, mockNext);
    //     expect(consoleLogSpy).toHaveBeenCalledWith('error during disconnection');
    //     consoleLogSpy.mockRestore();

        // expect(mockResponse.status).toHaveBeenCalledWith(200);
        // expect(mockResponse.send).toHaveBeenCalledWith('client has disconnected');
    // });
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

        const column = 'body';
        const newValue = 'New Body';
        const id = 2;
        
        const result = await updateAnnouncement(column, newValue, id);

        const selectQuery = {
            text: 'SELECT * FROM public.announcements WHERE announcementid = $1;',
            values: [id],
        };
          
        const selectResult = await executeQuery(selectQuery);
        expect(selectResult.rowCount).toBe(1);
        expect(selectResult.rows[0][column]).toBe(newValue);

    });

    it('deleteAnnouncement should delete record from db', async () => {

        const id = 1;
        const result = await deleteAnnouncement(id);

        const selectQuery = {
            text: 'SELECT * FROM public.announcements WHERE announcementid = $1;',
            values: [id],
        };
          
        const selectResult = await executeQuery(selectQuery);
        expect(selectResult.rowCount).toBe(0);
    })
})

// describe('TESTS: DB Audit Log Interface', () => {
//     beforeEach(() => {
//         jest.mock('../db/connect', () => ({
//             executeQuery: jest.fn()
//         }));
//     })

//     afterEach(() => {
//         jest.clearAllMocks();
//     })

//     it('addLog should insert record into auditlog table', async () => {

//         const timestamp = new Date().toISOString();
//         const result = await addLog(1, timestamp, 1, 'requested')

//         const rowCountQuery = {
//             text: 'SELECT COUNT(*) from public.auditlog'
//         }
//         const rowCount = await executeQuery(rowCountQuery);

//         const selectQuery = {
//             text: 'SELECT * FROM public.auditlog WHERE actionid = $1;',
//             values: [rowCount],
//         };
          
//         const selectResult = await executeQuery(selectQuery);
//         expect(selectResult.rowCount).tobe(1);
//         expect(selectResult.rows[0].actiontype).toBe(Status.REQUESTED);
//     })

//     it('removeLogsOfAnnouncement should delete record from auditlog table', async () => {

//         const id = 1;
//         const result = await removeLogsOfAnnouncement(id);

//         const selectQuery = {
//             text: 'SELECT * FROM public.auditlog WHERE announcementid = $1;',
//             values: [id],
//         };
          
//         const selectResult = await executeQuery(selectQuery);
//         expect(selectResult.rowCount).toBe(0);
//     })
// })

describe('TESTS: DB User Interface', () => {
    beforeEach(() => {
        jest.mock('../db/connect', () => ({
            executeQuery: jest.fn()
        }));
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('getUserById should return requested user by userid field', async () => {

        const id = 1;
        const result = await getUserById(id);

        expect(result.rowCount).toEqual(1);
        expect(result.fields).toHaveLength(6);
    })

    it('getUserByEmail should return requested user by email', async () => {

        const email = 'smartbard.overbrook@gmail.com';
        const result = await getUserByEmail(email);

        expect(result.rowCount).toEqual(1);
        expect(result.fields).toHaveLength(6);
    })

    it('createNewUser should create new user in the database', async () => {
        const vals = [
            'cognitoid',
            'firstname',
            'lastname',
            'email@test.com',
            false
        ];
      
        const result = await createNewUser(vals);
        expect(result).toBeDefined();
    })

    it('createNewUser should throw error for incorrect params', async () => {      
        const vals = ['val1', 'val2'];

        try {
            await createNewUser(vals);
        } catch (error) {
            expect(error).toEqual(new Error('Invalid parameter'));
        }
    });

    it('updateUser should update values by email', async () => {

        const vals = [
            'firstname',
            'lastname',
            true,
            'email@test.com'
        ];
        
        const result = await updateUser(vals);

        const selectQuery = {
            text: 'SELECT * FROM public.users WHERE email = $1;',
            values: ['email@test.com'],
        };
          
        const selectResult = await executeQuery(selectQuery);
        expect(selectResult).toBeDefined();
        expect(selectResult.rows[0].admin).toBe(true);
    });

    it('updateUser should throw error for incorrect params', async () => {      
        const vals = ['val1', 'val2'];

        try {
            await updateUser(vals);
        } catch (error) {
            expect(error).toEqual(new Error('Invalid parameter'));
        }
    });

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

    it('createUserSettings should create new user settings record in the database', async () => {

        const vals = [
            2,
            2,
            3,
            4,
            5,
            6,
            'primarycolor',
            'secondarycolor'
        ];
      
        const result = await createUserSettings(vals);
        expect(result).toBeDefined();
        expect(result.fields).toHaveLength(9);
    })

    it('createUserSettings should throw error for incorrect params', async () => {      
        const vals = ['val1', 'val2'];

        try {
            await createUserSettings(vals);
        } catch (error) {
            expect(error).toEqual(new Error('Invalid parameter.'));
        }
    });

    it('getUserSettings should return valid user', async () => {      
        const id = 2;
        const result = await getUserSettings(2);

        expect(result.rowCount).toBeDefined();
    });

    it('getUserSettingsById should return valid user', async () => {      
        const rowCountQuery = {
            text: 'SELECT MAX(settingsid) from public.usersettings'
        }
        const id = await executeQuery(rowCountQuery);
        const result = await getUserSettingsById(id.rows[0].max);

        expect(result.rowCount).toBe(1);
    });

    it('updateUserSettings should update value by column', async () => {

        const rowCountQuery = {
            text: 'SELECT COUNT(*) from public.usersettings'
        }
        const rowCount = await executeQuery(rowCountQuery);

        const column = 'primarycolor';
        const newValue = 'new_primary'        
        const userid = 2;
        const result = await updateUserSettings(column, newValue, userid);

        const selectQuery = {
            text: 'SELECT * FROM public.usersettings WHERE userid = $1;',
            values: [userid],
        };
          
        const selectResult = await executeQuery(selectQuery);
        expect(selectResult).toBeDefined();
        expect(selectResult.rows[0][column]).toBe(newValue);
    });

    it('deleteUserSettings should delete record form database', async () => {      
        const id = 2;

        const result = await deleteUserSettings(id);

        expect(result.rowCount).toBeDefined();
    });
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

    it('createAllTables should create tables if one of them do not exist', async () => {      
        await createAllTables();
    });

})