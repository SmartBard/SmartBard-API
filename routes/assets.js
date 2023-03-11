const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploaded-assets/media/'}).single("file");

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
