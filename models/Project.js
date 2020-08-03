const mongoose = require('mongoose');

const ProjectSchema = mongoose.Schema({
  code: {
    type: String,
    required:true
  }

});

module.exports = mongoose.model('Project', ProjectSchema);