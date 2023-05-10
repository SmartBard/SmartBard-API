const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const router = express.Router();

const MAX_FILE_SIZE = 10485760;
const ALLOWED_FILE_EXTENSIONS = ['.png', '.jpeg', '.jpg', '.pdf', '.gif'];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploaded-assets/media/')
    },
    filename: function(req, file, cb) {
        cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname))
    }
})

const upload = multer({ 
    storage: storage, 
    limits: { 
        fileSize: MAX_FILE_SIZE 
    },
    fileFilter: (req, file, cb) => {
        if (!(ALLOWED_FILE_EXTENSIONS.includes(path.extname(file.originalname)))) {
            return cb(new Error('File extension not allowed'));
        }
        const fileSize = parseInt(req.headers['content-length']);
        if (fileSize > MAX_FILE_SIZE) {
            return cb(new Error('Greater than max file size.'));
        }
        cb(null, true);
    }
}).single("file");

router.post('/', async function(req, res, next) {
    const currentFiles = fs.readdirSync('uploaded-assets/media');
    for (const f of currentFiles) {
        const fileName = `uploaded-assets/media/${f}`;
        const stat = fs.statSync(fileName);
        // remove uploaded files that haven't been touched in 2 mins
        if (new Date() - new Date(stat.mtime) > 2 * 60 * 1000) {
            fs.rmSync(fileName);
        }
    }
    upload(req, res, (err) => {
        if (err) {
            res.status(500).send({ error: 'Unknown error.' });
        }
        if (res.statusCode !== 500) {
            res.status(200).send({ filename: req.file.filename });
        }
    });
});

module.exports = router;
