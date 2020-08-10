const mongoose = require('mongoose');

const ProjectSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  projectName: {
    type: String,
    required:true
  },
  code: {
    type: String,
    required:true
  }
});

module.exports = mongoose.model('Project', ProjectSchema);