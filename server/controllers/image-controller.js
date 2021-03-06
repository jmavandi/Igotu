const fs = require('fs');
const s3 = require('../model/aws-upload');

const imageController = {};

imageController.upload = (req, res, next) => {
  res.locals.photo = req.body.photo;
  // check if a file was sent -> yes, do work -OR- no, next();
  console.log(`is there a file to upload? : ${req.file !== null}`);
  if (req.file === null) return next();


  const tempFilePath = req.file.path;

  const params = {
    // which bucket in S3 to store file in
    Bucket: process.env.AWSS3Bucket,
    // the image data
    Body: fs.createReadStream(tempFilePath),
    // figure out type vs disposition -> type is stored format?
    ContentType: 'image/jpeg',
    // the new key for the image -> helps generate unique URL
    Key: `images/${Date.now()}_${req.file.filename}`,
    // figure out type vs disposition -> disposition is incoming format?
    ContentDispositon: 'inline; filename=filename.png',
    // access control -> everyone can read
    ACL: 'public-read',
  };

  s3.upload(params)
    .promise()
    .then((data) => {
      // store returned URL on res.locals
      console.log(`uploaded photo, got back data: ${data.Location}`);
      res.locals.photo = data.Location;
    
    })
    .then(() => {
      console.log('removing file');
      fs.unlinkSync(tempFilePath, () => {
        console.log('removed file');
      });
    })
    .then(() => {
      console.log('moving on');
      next();
    })
    .catch((err) => {
      console.log(`WHOOPS! ${err}`);
      next();
    });
};


module.exports = imageController;
