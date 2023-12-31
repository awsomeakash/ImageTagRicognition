const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();
require('dotenv').config(); // Load environment variables from .env file

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const rekognition = new AWS.Rekognition();

router.post('/classify', function(req, res, next) {
  if (!req.files || !req.files.file) {
    res.status(400).json({
      'error': 'No file uploaded'
    });
    return;
  }

  const params = {
    Image: {
      Bytes: req.files.file.data
    },
    MaxLabels: 10 
  };

  rekognition.detectLabels(params, (err, data) => {
    if (err) {
      console.error(err); // Log the error for debugging purposes

      if (err.code === 'InvalidParameterException') {
        // Handle specific error: Unsupported file format
        res.status(400).json({
          'error': err.message || 'Unsupported file format. Please upload a valid image file.'
        });
      } else {
        // Handle other errors with the error message from the server
        res.status(500).json({
          'error': err.message || 'Unable to process the request'
        });
      }
    } else {
      const labels = data.Labels.map(label => label.Name);
      res.json({
        'labels': labels
      });
    }
  });
});

module.exports = router;
