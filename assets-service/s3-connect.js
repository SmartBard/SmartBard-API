var AWS = require('aws-sdk');
var fs = require('fs');

function createS3Object(accessToken) {
    AWS.config.update({
        region: 'us-east-1',
        endpoint: 'https://s3.amazonaws.com'
    });

    AWS.config.credentials = new AWS.Credentials({
        accessKeyId: accessToken,
        secretAccessKey: ''
    });

    var s3 = new AWS.S3();
    return s3
}

async function uploadObjectToS3(s3, bucket, key, file) {

    var fileStream = fs.createReadStream(file);
    fileStream.on('error', function (err) {
        console.log('File Error', err);
    });

    var params = {
        Bucket: bucket,
        Key: key,
        Body: fileStream
    };

    const result = await s3.upload(params, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log('File uploaded successfully.');
        }
    });

    return result;
}

async function deleteS3Object(s3, bucket, key) {

    const params = {
        Bucket: bucket,
        Key: key
    };

    const result = await s3.deleteObject(params, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log('File deleted successfully.');
        }
    });

    return result;
}

module.exports = {
    createS3Object,
    uploadObjectToS3,
    deleteS3Object,
};