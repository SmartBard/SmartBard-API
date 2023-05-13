const {
    createS3Object,
    uploadObjectToS3,
    deleteS3Object,
    getS3Object
} = require('../services/assets/s3-connect');

describe('TESTS: S3 Connection', () => {
    beforeEach(() => {
        jest.mock('aws-sdk', () => ({
            config: {
                update: jest.fn(),
                credentials: {
                    accessKeyId: '',
                    secretAccessKey: ''
                },
            },
            S3: jest.fn()
        }));
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

})
