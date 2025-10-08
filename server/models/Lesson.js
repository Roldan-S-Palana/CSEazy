const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  image: String, // URL or path to image
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }]
});

module.exports = mongoose.model('Lesson', LessonSchema);
