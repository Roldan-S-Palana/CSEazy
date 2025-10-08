const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: String,
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }]
});

module.exports = mongoose.model('Subject', SubjectSchema);
