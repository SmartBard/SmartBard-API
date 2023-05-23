const { CognitoJwtVerifier } = require('aws-jwt-verify');

const {
    isValidToken,
    getUserEmailFromToken,
    isUserAdmin
} = require('../services/auth/token-validation');

describe('TESTS: Token Validation', () => {
    beforeEach(() => {
        jest.mock('aws-jwt-verify');
        jest.mock('../db/db-user-interface');
        jest.mock('../services/log/cloudwatch');
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('isValidToken should verify token provided in requests', async () => {
        const header = 'Bearer valid-token';

        const mockVerifier = {
            verify: jest.fn().mockResolvedValueOnce(header)
        };
  
        CognitoJwtVerifier.create = jest.fn(() => mockVerifier);

        const result = await isValidToken(header);

        expect(mockVerifier.verify).toHaveBeenCalledTimes(1);

    })
})