const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploaded-assets/media/')
    },
    filename: function(req, file, cb) {
        cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage }).single("file");

router.post('/', async function(req, res, next) {
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
