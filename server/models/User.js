const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  progress: [{
    subject: String,
    topic: String,
    lesson: String,
    score: Number,
    completed: Boolean
  }]
});

module.exports = mongoose.model('User', UserSchema);
