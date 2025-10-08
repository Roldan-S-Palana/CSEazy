const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }
});

module.exports = mongoose.model('Topic', TopicSchema);
