import { useEffect, useState } from 'react';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showLessonForm, setShowLessonForm] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [showQuizForm, setShowQuizForm] = useState(null);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizType, setQuizType] = useState('mcq');
  const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [expandedLessons, setExpandedLessons] = useState(new Set());
  const [lessonImage, setLessonImage] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/subjects')
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        if (data.length > 0 && !selectedSubject) {
          setSelectedSubject(data[0]);
        }
        setLoading(false);
      });
  }, []);

  const handleAddLesson = async (e, topicId) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', lessonTitle);
    formData.append('content', lessonContent);
    formData.append('topic', topicId);
    if (lessonImage) {
      formData.append('image', lessonImage);
    }
    try {
      const response = await fetch('http://localhost:5000/api/lessons', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const lesson = await response.json();
        // Update the topic to include the new lesson
        await fetch(`http://localhost:5000/api/topics/${topicId}/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId: lesson._id })
        });
        setLessonTitle('');
        setLessonContent('');
        setLessonImage(null);
        setShowLessonForm(null);
        // Refresh subjects
        const res = await fetch('http://localhost:5000/api/subjects');
        const data = await res.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/lessons/${lessonId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        // Refresh subjects
        const res = await fetch('http://localhost:5000/api/subjects');
        const data = await res.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  const handleAddQuiz = async (e, lessonId) => {
    e.preventDefault();
    const question = {
      type: quizType,
      question: quizQuestion,
      options: quizType === 'mcq' ? quizOptions : [],
      answer: quizAnswer
    };
    try {
      const response = await fetch('http://localhost:5000/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson: lessonId, questions: [question] })
      });
      if (response.ok) {
        const quiz = await response.json();
        // Update the lesson to include the new quiz
        await fetch(`http://localhost:5000/api/lessons/${lessonId}/quizzes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quizId: quiz._id })
        });
        setQuizQuestion('');
        setQuizType('mcq');
        setQuizOptions(['', '', '', '']);
        setQuizAnswer('');
        setShowQuizForm(null);
        // Refresh subjects
        const res = await fetch('http://localhost:5000/api/subjects');
        const data = await res.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error adding quiz:', error);
    }
  };

  if (loading) return <div className="text-center mt-10 animate-pulse">Loading subjects...</div>;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Side Navigation */}
      <div className="hidden md:block w-80 md:w-96 bg-white dark:bg-gray-800">
        <div className="py-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subjects</h3>
          <div className="space-y-2">
            {subjects.map(subj => (
              <button
                key={subj._id}
                onClick={() => setSelectedSubject(subj)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${
                  selectedSubject && selectedSubject._id === subj._id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="font-medium flex items-center">
                  {subj.name}
                  {subj.icon && (
                    <img src={`/icons/${subj.icon.replace(/^\/+/, '')}`} alt="icon" className="w-6 h-6 ml-2" />
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{subj.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Subject Title */}
        {selectedSubject && (
          <div className="bg-white dark:bg-gray-800 py-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center">
              {selectedSubject.icon && (
                <img src={`/icons/${selectedSubject.icon.replace(/^\/+/, '')}`} alt="icon" className="w-8 h-8 md:hidden" />
              )}
              <span className="hidden md:block">{selectedSubject.name}</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedSubject.description}</p>
          </div>
        )}

        {/* Roadmap */}
        <div className="flex-1 py-2 overflow-y-auto">
          {selectedSubject && selectedSubject.topics && selectedSubject.topics.length > 0 ? (
            <div className="relative">
              {selectedSubject.topics.map((topic, index) => {
                const totalLessons = topic.lessons ? topic.lessons.length : 0;
                const completedLessons = topic.lessons ? topic.lessons.filter(lesson => lesson.quizzes && lesson.quizzes.length > 0).length : 0;
                const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

                return (
                  <div key={topic._id} className="flex items-center mb-8">
                    {/* Connecting Line */}
                    {index < selectedSubject.topics.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300 dark:bg-gray-600"></div>
                    )}

                    {/* Topic Circle */}
                    <div
                      className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:scale-110 transition-all duration-300 shadow-lg"
                      onClick={() => setSelectedTopic(topic)}
                    >
                      {index + 1}
                    </div>

                    {/* Topic Content */}
                    <div className="ml-4 flex-1">
                      <div
                        className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-300"
                        onClick={() => setSelectedTopic(topic)}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{topic.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{topic.description}</p>
                        <div className="mb-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{completedLessons} of {totalLessons} lessons completed</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-md"
                            onClick={() => setSelectedTopic(topic)}
                          >
                            View Details
                          </button>
                          <button
                            className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 shadow-md"
                            onClick={() => setShowLessonForm(topic._id)}
                          >
                            Add Lesson
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              {selectedSubject ? 'No topics available for this subject.' : 'Select a subject to view topics.'}
            </div>
          )}
        </div>
      </div>

      {/* Topic Details Panel */}
      {selectedTopic && (
        <div className="hidden md:block w-80 md:w-96 bg-white dark:bg-gray-800 overflow-y-auto">
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTopic.name}</h2>
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedTopic.description}</p>

            {/* Lessons */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Lessons</h3>
            {selectedTopic.lessons && selectedTopic.lessons.length > 0 ? (
              <div className="space-y-3">
                {selectedTopic.lessons.map(lesson => {
                  const isExpanded = expandedLessons.has(lesson._id);
                  return (
                    <div key={lesson._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-white">{lesson.title}</span>
                        <button
                          onClick={() => {
                            const newExpanded = new Set(expandedLessons);
                            if (isExpanded) {
                              newExpanded.delete(lesson._id);
                            } else {
                              newExpanded.add(lesson._id);
                            }
                            setExpandedLessons(newExpanded);
                          }}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {isExpanded ? 'Hide' : 'View'}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <p className="text-sm text-gray-700 dark:text-gray-300">{lesson.content}</p>
                          {lesson.image && (
                            <img src={`http://localhost:5000${lesson.image}`} alt="Lesson" className="w-full h-32 object-cover mt-2 rounded" />
                          )}
                        </div>
                      )}
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => setShowQuizForm(lesson._id)}
                          className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                        >
                          Add Question
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No lessons available.</p>
            )}

            {/* Add Lesson Form */}
            {showLessonForm === selectedTopic._id && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Add New Lesson</h4>
                <form onSubmit={(e) => handleAddLesson(e, selectedTopic._id)} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Lesson Title"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                    required
                  />
                  <textarea
                    placeholder="Lesson Content"
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                    rows="4"
                    required
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLessonImage(e.target.files[0])}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                  />
                  <div className="flex space-x-2">
                    <button type="submit" className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 shadow-md">
                      Add Lesson
                    </button>
                    <button type="button" onClick={() => setShowLessonForm(null)} className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 hover:scale-105 shadow-md">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Quiz Form */}
            {showQuizForm && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Add New Question</h4>
                <form onSubmit={(e) => handleAddQuiz(e, showQuizForm)} className="space-y-3">
                  <select
                    value={quizType}
                    onChange={(e) => setQuizType(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="truefalse">True/False</option>
                    <option value="shortanswer">Short Answer</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Question"
                    value={quizQuestion}
                    onChange={(e) => setQuizQuestion(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                    required
                  />
                  {quizType === 'mcq' && (
                    <div className="space-y-2">
                      {quizOptions.map((opt, idx) => (
                        <input
                          key={idx}
                          type="text"
                          placeholder={`Option ${idx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...quizOptions];
                            newOpts[idx] = e.target.value;
                            setQuizOptions(newOpts);
                          }}
                          className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          required
                        />
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Answer"
                    value={quizAnswer}
                    onChange={(e) => setQuizAnswer(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                    required
                  />
                  <div className="flex space-x-2">
                    <button type="submit" className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-md">
                      Add Question
                    </button>
                    <button type="button" onClick={() => setShowQuizForm(null)} className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 hover:scale-105 shadow-md">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
