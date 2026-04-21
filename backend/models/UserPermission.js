const mongoose = require('mongoose');

const userPermissionSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    ref: 'User'
  },
  allowedTabs: [{
    type: String,
    enum: ['dashboard', 'samples', 'tests', 'results', 'complaints', 'complaintsAnalytics', 'userManagement', 'clinicalTrials', 'clinicalSample']
  }],
  description: {
    type: String,
    default: ''
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
userPermissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserPermission', userPermissionSchema);
