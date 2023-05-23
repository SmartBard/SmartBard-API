var fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const {
    createS3Object,
    uploadObjectToS3,
    deleteS3Object,
    getS3Object

} = require('../services/assets/s3-connect')

describe('TESTS: S3 Connection', () => {
    beforeAll(() => {
        bucket = 'example-bucket';
        key = path.join('__tests__', 'example_inputs', 'sample_img.jpg');
    })

    it('should create an S3 object', () => {
        const mockS3 = {
          upload: jest.fn(),
          deleteObject: jest.fn(),
          getObject: jest.fn()
        };

        jest.spyOn(AWS, 'S3').mockImplementation(() => mockS3);
    
        const accessToken = '';
        const secretKey = '';
        const region = '';
    
        const result = createS3Object(accessToken, secretKey, region);
        expect(result).toBe(mockS3);
      });
    });
    

    it('should upload an object to S3', async () => {
        const consoleLogSpy = jest.spyOn(console, 'log');

        const mockS3 = {
            upload: jest.fn().mockImplementation((params, callback) => {
              callback(null, { Location: `https://s3.amazonaws.com/${bucket}/${key}` });
            }),
        };
      

        const mockCreateS3Object = jest.fn(() => mockS3);

        jest.mock('../services/assets/s3-connect', () => {
            return {
                createS3Object: mockCreateS3Object,
                uploadObjectToS3: require('../services/assets/s3-connect').uploadObjectToS3, 
            };
        });

        const result = await uploadObjectToS3(mockS3, bucket, key);

        expect(consoleLogSpy).toHaveBeenCalledTimes(1); 
        expect(mockS3.upload).toHaveBeenCalledTimes(1);
        expect(mockS3.upload).toHaveBeenCalledWith(
            expect.objectContaining({
                Bucket: bucket,
                Key: key,
                Body: expect.any(Buffer),
            }),
            expect.any(Function)
        );

        consoleLogSpy.mockRestore();

    });

    it('should delete an object to S3', async () => {
        const consoleLogSpy = jest.spyOn(console, 'log');

        const s3Path = `${bucket}/${key}`;

        const mockS3 = {
            deleteObject: jest.fn().mockImplementation((params, callback) => {
              callback(null, { Location: `https://s3.amazonaws.com/${bucket}/${key}` });
            }),
        };

        const mockCreateS3Object = jest.fn(() => mockS3);

        jest.mock('../services/assets/s3-connect', () => {
            return {
                createS3Object: mockCreateS3Object,
                deleteS3Object: require('../services/assets/s3-connect').deleteObject, 
            };
        });

        const result = await deleteS3Object(mockS3, s3Path);

        expect(mockS3.deleteObject).toHaveBeenCalledTimes(1);
        expect(consoleLogSpy).toHaveBeenCalledTimes(1); 
        consoleLogSpy.mockRestore();

    });

    it('should get an object to S3', async () => {
        const s3Path = `${bucket}/${key}`;
        const mockS3 = {
            getObject: jest.fn(),
        };

        const mockCreateS3Object = jest.fn(() => mockS3);

        jest.mock('../services/assets/s3-connect', () => {
            return {
                createS3Object: mockCreateS3Object,
                getS3Object: require('../services/assets/s3-connect').getS3Object, 
            };
        });

        const result = await getS3Object(mockS3, s3Path);

        expect(mockS3.getObject).toHaveBeenCalledTimes(1);
    });
