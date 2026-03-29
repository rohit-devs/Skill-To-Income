const express = require('express');

const { protect } = require('../middleware/auth');
const { uploadSubmission } = require('../services/cloudinary');

const router = express.Router();

const runMulter = (middleware, req, res) =>
  new Promise((resolve, reject) => {
    middleware(req, res, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });

router.post('/submission', protect, async (req, res) => {
  try {
    await runMulter(uploadSubmission.single('file'), req, res);

    if (!req.file) {
      return res.status(400).json({ message: 'Please choose a file to upload' });
    }

    return res.status(201).json({
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      resourceType: req.file.resource_type || req.file.mimetype || 'auto',
    });
  } catch (error) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? 'File must be 10MB or smaller'
        : error.message || 'File upload failed';

    return res.status(400).json({ message });
  }
});

module.exports = router;
