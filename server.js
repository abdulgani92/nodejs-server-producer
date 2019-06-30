const express = require('express');
const aws = require('aws-sdk');
const bodyParser = require('body-parser');
const multer = require('multer');
const multerS3 = require('multer-s3');
const cors = require('cors');
const config = require('config');
const QUEUE_NAME = config.get('queue_name');

const queue = require('./producer/send');

let fileName = '';
const PORT = config.get('port') || 3000;

if (config) {
    let awsConfig = {
        "secretAccessKey": config.get('aws.config.secretAccessKey'),
        "accessKeyId": config.get('aws.config.accessKeyId'),
        "region": config.get('aws.config.region')
    }
    aws.config.update(awsConfig);
} else {
    process.exit();
}

const app = express();
const s3 = new aws.S3({});

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: `${config.get('aws.bucket_name')}`,
        acl: 'public-read',
        key: function (req, file, cb) {
            fileName = `${Date.now().toString()}/original.${file.mimetype.split('/')[1]}`;
            cb(null, `${fileName}`);
        }
    })
});

//use by upload form
app.post('/upload', upload.array('upl', 1), function (req, res, next) {

    var URL = 'https://knowhere-video-bucket.s3.ap-south-1.amazonaws.com';
    const message = `${URL}/${fileName}`;
    queue.getChannel().sendToQueue(QUEUE_NAME, Buffer.from(message));
    res.send({ message: "Congratulation! In S3 Bucket, Your video has been uploaded Successfully...", success: true });
});

app.listen(PORT, function () {
    console.log(`Example app listening on port ${PORT}`);
});