const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  rollNo: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true, // One member upload once rule
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  course: {
    type: String,
    required: [true, 'Platform selection is required'],
    enum: {
      values: ['APSSDC', 'APSCHE', 'OTHER AICTE CERTIFICATES'],
      message: '{VALUE} is not a supported platform'
    }
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  fileName: {
    type: String,
    required: [true, 'Uploaded file name is required']
  },
  driveFolderId: {
    type: String,
    default: ''
  },
  driveFileUrl: {
    type: String,
    default: ''
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);
