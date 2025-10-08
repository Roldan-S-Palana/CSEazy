require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const upload = multer({ dest: 'uploads/' });

// Connect MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedDatabase();
  })
  .catch(err => console.error(err));

// Seed database with predefined subjects and topics
async function seedDatabase() {
  const subjectCount = await Subject.countDocuments();
  if (subjectCount > 0) return; // Already seeded

  const subjectsData = [
    {
      name: 'Verbal Ability (English)',
      description: 'English verbal skills',
      icon: '/icons/english.png',
      topics: [
        { name: 'Word meaning', description: 'Understanding word meanings'},
        { name: 'Sentence completion', description: 'Completing sentences' },
        { name: 'Error recognition', description: 'Identifying errors in sentences' },
        { name: 'Sentence structure', description: 'Understanding sentence structure' },
        { name: 'Paragraph organization', description: 'Organizing paragraphs' },
        { name: 'Reading comprehension', description: 'Comprehending reading passages' }
      ]
    },
    {
      name: 'Verbal Ability (Filipino)',
      description: 'Filipino verbal skills',
      icon: '/icons/philippines.png',
      topics: [
        { name: 'Word meaning', description: 'Understanding word meanings' },
        { name: 'Sentence completion', description: 'Completing sentences' },
        { name: 'Error recognition', description: 'Identifying errors in sentences' },
        { name: 'Sentence structure', description: 'Understanding sentence structure' },
        { name: 'Paragraph organization', description: 'Organizing paragraphs' },
        { name: 'Reading comprehension', description: 'Comprehending reading passages' }
      ]
    },
    {
      name: 'Numerical Ability',
      description: 'Mathematical skills',
      icon: '/icons/calculation.png',
      topics: [
        { name: 'Basic Operations', description: 'Addition, subtraction, multiplication, division' },
        { name: 'Number sequence', description: 'Identifying number patterns' },
        { name: 'Word problems', description: 'Solving word-based math problems' }
      ]
    },
    {
      name: 'General Information',
      description: 'General knowledge topics',
      icon: '/icons/balance.png',
      topics: [
        { name: 'Philippine Constitutions', description: 'Knowledge of Philippine laws' },
        { name: 'Code of Conduct and Ethical Standards for Public Officials and Employees (R.A. 6713)', description: 'Ethical standards for officials' },
        { name: 'Peace and Human Rights Issues and Concepts', description: 'Peace and human rights' },
        { name: 'Environment Management and Protection', description: 'Environmental protection' }
      ]
    },
    {
      name: 'Clerical Ability',
      description: 'Administrative skills',
      icon: '/icons/paperwork.png',
      topics: [
        { name: 'Filing', description: 'Filing documents' },
        { name: 'Spelling', description: 'Correct spelling' }
      ]
    },
    {
      name: 'Analytical Ability',
      description: 'Analytical thinking skills',
      icon: '/icons/data-analytics.png',
      topics: [
        { name: 'Word analogy', description: 'Understanding word relationships' },
        { name: 'Symbolic logic/abstract reasoning', description: 'Logical reasoning' },
        { name: 'Identifying assumptions and drawing conclusions', description: 'Critical thinking' },
        { name: 'Data interpretation', description: 'Interpreting data' }
      ]
    }
  ];

  for (const subjData of subjectsData) {
    const subject = new Subject({ name: subjData.name, description: subjData.description, icon: subjData.icon });
    await subject.save();

    for (const topicData of subjData.topics) {
      const topic = new Topic({ name: topicData.name, description: topicData.description, subject: subject._id });
      await topic.save();
      subject.topics.push(topic._id);
    }
    await subject.save();
  }

  console.log("✅ Database seeded with subjects and topics");
}

// Models
const User = require('./models/User');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');

// Subjects
app.get('/api/subjects', async (req, res) => {
  const subjects = await Subject.find().populate({
    path: 'topics',
    populate: {
      path: 'lessons',
      populate: 'quizzes'
    }
  });
  res.json(subjects);
});
app.post('/api/subjects', async (req, res) => {
  const subject = new Subject(req.body);
  await subject.save();
  res.status(201).json(subject);
});

// Topics
app.get('/api/topics', async (req, res) => {
  const topics = await Topic.find().populate('lessons');
  res.json(topics);
});
app.post('/api/topics', async (req, res) => {
  const topic = new Topic(req.body);
  await topic.save();
  res.status(201).json(topic);
});
app.put('/api/topics/:id', async (req, res) => {
  const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(topic);
});
app.post('/api/topics/:id/lessons', async (req, res) => {
  const topic = await Topic.findById(req.params.id);
  topic.lessons.push(req.body.lessonId);
  await topic.save();
  res.status(201).json(topic);
});

// Lessons
app.get('/api/lessons', async (req, res) => {
  const lessons = await Lesson.find().populate('quizzes');
  res.json(lessons);
});
app.post('/api/lessons', upload.single('image'), async (req, res) => {
  const lessonData = { ...req.body };
  if (req.file) {
    lessonData.image = `/uploads/${req.file.filename}`;
  }
  const lesson = new Lesson(lessonData);
  await lesson.save();
  res.status(201).json(lesson);
});
app.delete('/api/lessons/:id', async (req, res) => {
  const topic = await Topic.findOne({ lessons: req.params.id });
  if (topic) {
    topic.lessons.pull(req.params.id);
    await topic.save();
  }
  await Lesson.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
app.put('/api/lessons/:id', async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(lesson);
});
app.post('/api/lessons/:id/quizzes', async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  lesson.quizzes.push(req.body.quizId);
  await lesson.save();
  res.status(201).json(lesson);
});

// Quizzes
app.get('/api/quizzes', async (req, res) => {
  const quizzes = await Quiz.find();
  res.json(quizzes);
});
app.post('/api/quizzes', async (req, res) => {
  const quiz = new Quiz(req.body);
  await quiz.save();
  res.status(201).json(quiz);
});

// User Progress
app.get('/api/users/:id/progress', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user ? user.progress : []);
});
app.post('/api/users/:id/progress', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.progress.push(req.body);
    await user.save();
    res.status(201).json(user.progress);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
