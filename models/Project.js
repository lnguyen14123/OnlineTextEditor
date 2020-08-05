const mongoose = require('mongoose');

const ProjectSchema = mongoose.Schema({

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