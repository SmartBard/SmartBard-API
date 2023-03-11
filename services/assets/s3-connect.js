var AWS = require('aws-sdk');
var fs = require('fs');
const path = require('path');

function createS3Object(accessToken, secretKey) {
    AWS.config.update({
        region: 'us-east-1',
        endpoint: 'https://s3.amazonaws.com'
    });

    AWS.config.credentials = new AWS.Credentials({
        accessKeyId: accessToken,
        secretAccessKey: secretKey
    });

    var s3 = new AWS.S3();
    return s3
}

async function uploadObjectToS3(s3, bucket, key) {

    var imagePath = path.join(process.cwd(), key);
    var imageBuffer = fs.readFileSync(imagePath);

    var params = {
        Bucket: bucket,
        Key: key,
        Body: imageBuffer
    };

    const result = s3.upload(params, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(`File uploaded successfully to ${bucket}/${key}`);
        }
    });

    return result;
}

async function deleteS3Object(s3, s3Path) {

    const pathParts = s3Path.split('/');
    let bucket = pathParts.slice(0, 2);
    bucket = bucket.join('/');
    let key = pathParts.slice(2, pathParts.length);
    key = key.join('/');
    
    const params = {
        Bucket: bucket,
        Key: key
    };

    const result = s3.deleteObject(params, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(`File at ${bucket}/${key} deleted successfully.`);
        }
    });

    return result;
}

async function getS3Object(s3, s3Path) {
    
    const pathParts = s3Path.split('/');
    let bucket = pathParts.slice(0, 2);
    bucket = bucket.join('/');
    let key = pathParts.slice(2, pathParts.length);
    key = key.join('/');

    const params = {
        Bucket: bucket,
        Key: key
    };

    const bufferData = s3.getObject(params, function (err, data) {
        if (err) {
            console.log(err);
        } 
    })

    return bufferData;
}

module.exports = {
    createS3Object,
    uploadObjectToS3,
    deleteS3Object,
    getS3Object
};