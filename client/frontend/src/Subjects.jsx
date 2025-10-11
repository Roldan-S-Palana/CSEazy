import { useEffect, useState, useRef } from "react";

import balanceIcon from "/icons/balance.png";
import calculationIcon from "/icons/calculation.png";
import dataAnalyticsIcon from "/icons/data-analytics.png";
import englishIcon from "/icons/english.png";
import paperworkIcon from "/icons/paperwork.png";
import philippinesIcon from "/icons/philippines.png";

const iconMap = {
  "balance.png": balanceIcon,
  "calculation.png": calculationIcon,
  "data-analytics.png": dataAnalyticsIcon,
  "english.png": englishIcon,
  "paperwork.png": paperworkIcon,
  "philippines.png": philippinesIcon,
};

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showLessonForm, setShowLessonForm] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [showQuizForm, setShowQuizForm] = useState(null);
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizType, setQuizType] = useState("mcq");
  const [quizOptions, setQuizOptions] = useState(["", "", "", ""]);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [expandedLessons, setExpandedLessons] = useState(new Set());
  const [lessonImage, setLessonImage] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [expandedMobileTopics, setExpandedMobileTopics] = useState(new Set());
  const [fullscreenLesson, setFullscreenLesson] = useState(null);
  const [fullscreenQuiz, setFullscreenQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");
  const [subjectIcon, setSubjectIcon] = useState("");
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [topicName, setTopicName] = useState("");
  const [topicDescription, setTopicDescription] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        setSubjects(data);
        if (data.length > 0 && !selectedSubject) {
          setSelectedSubject(data[0]);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setIsMobile(true);
        setIsTablet(false);
      } else if (width >= 768 && width <= 1280) {
        setIsMobile(false);
        setIsTablet(true);
      } else {
        setIsMobile(false);
        setIsTablet(false);
      }

      console.log("checkScreen triggered:", width);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

   

  const handleAddLesson = async (e, topicId) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", lessonTitle);
    formData.append("content", lessonContent);
    formData.append("topic", topicId);
    if (lessonImage) {
      formData.append("image", lessonImage);
    }
    try {
      const response = await fetch("http://localhost:5000/api/lessons", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const lesson = await response.json();
        // Update the topic to include the new lesson
        await fetch(`http://localhost:5000/api/topics/${topicId}/lessons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId: lesson._id }),
        });
        setLessonTitle("");
        setLessonContent("");
        setLessonImage(null);
        setShowLessonForm(null);
        // Refresh subjects
        const res = await fetch("http://localhost:5000/api/subjects");
        const data = await res.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error adding lesson:", error);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/lessons/${lessonId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        // Refresh subjects
        const res = await fetch("http://localhost:5000/api/subjects");
        const data = await res.json();
        setSubjects(data);
        // Update selectedTopic with new data
        if (selectedTopic) {
          const updatedSubject = data.find(
            (s) => s._id === selectedSubject._id
          );
          if (updatedSubject) {
            const updatedTopic = updatedSubject.topics.find(
              (t) => t._id === selectedTopic._id
            );
            setSelectedTopic(updatedTopic);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
    }
  };

  const handleAddQuiz = async (e, lessonId) => {
    e.preventDefault();
    const question = {
      type: quizType,
      question: quizQuestion,
      options: quizType === "mcq" ? quizOptions : [],
      answer: quizAnswer,
    };
    try {
      const response = await fetch("http://localhost:5000/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson: lessonId, questions: [question] }),
      });
      if (response.ok) {
        const quiz = await response.json();
        // Update the lesson to include the new quiz
        await fetch(`http://localhost:5000/api/lessons/${lessonId}/quizzes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizId: quiz._id }),
        });
        setQuizQuestion("");
        setQuizType("mcq");
        setQuizOptions(["", "", "", ""]);
        setQuizAnswer("");
        setShowQuizForm(null);
        // Refresh subjects
        const res = await fetch("http://localhost:5000/api/subjects");
        const data = await res.json();
        setSubjects(data);
        // Update selectedTopic with new data
        if (selectedTopic) {
          const updatedSubject = data.find(
            (s) => s._id === selectedSubject._id
          );
          if (updatedSubject) {
            const updatedTopic = updatedSubject.topics.find(
              (t) => t._id === selectedTopic._id
            );
            setSelectedTopic(updatedTopic);
          }
        }
        // Update selectedTopic with new data
        if (selectedTopic) {
          const updatedSubject = data.find(
            (s) => s._id === selectedSubject._id
          );
          if (updatedSubject) {
            const updatedTopic = updatedSubject.topics.find(
              (t) => t._id === selectedTopic._id
            );
            setSelectedTopic(updatedTopic);
          }
        }
      }
    } catch (error) {
      console.error("Error adding quiz:", error);
    }
  };

  useEffect(() => {
    console.log(
      "isMobile:",
      isMobile,
      "isTablet:",
      isTablet,
      "width:",
      window.innerWidth
    );
  }, [isMobile, isTablet]);

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < fullscreenQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    fullscreenQuiz.questions.forEach((question, index) => {
      let userAnswer = selectedAnswers[index];
      let correctAnswer = question.answer;
      if (question.type === 'truefalse') {
        // Convert boolean to string if needed
        correctAnswer = correctAnswer === true ? 'true' : correctAnswer === false ? 'false' : correctAnswer;
      }
      if (userAnswer === correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowScore(true);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowScore(false);
    setScore(0);
    setFullscreenQuiz(null);
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: subjectName, description: subjectDescription, icon: subjectIcon }),
      });
      if (response.ok) {
        setSubjectName("");
        setSubjectDescription("");
        setSubjectIcon("");
        setShowAddSubject(false);
        // Refresh subjects
        const res = await fetch("http://localhost:5000/api/subjects");
        const data = await res.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: topicName, description: topicDescription, subject: selectedSubject._id }),
      });
      if (response.ok) {
        setTopicName("");
        setTopicDescription("");
        setShowAddTopic(false);
        // Refresh subjects
        const res = await fetch("http://localhost:5000/api/subjects");
        const data = await res.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error adding topic:", error);
    }
  };


  if (loading)
    return (
      <div className="text-center mt-10 animate-pulse">Loading subjects...</div>
    );

 
  return (
    <div className="flex w-full h-full bg-gray-50 dark:bg-gray-900">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 md:hidden z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Left Navigation - Subjects */}
      <div
        className={`fixed left-0 h-full bg-theme-100 dark:bg-theme-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto
              ${
                isMobile ? (isMobileMenuOpen ? "block" : "hidden") : "block"
              } z-[60]`}
        style={{ width: isTablet ? "80px" : "320px" }}
      >
        <div className="p-4">
          {!isTablet && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Subjects
            </h3>
          )}
          <div className={isTablet ? "space-y-1" : "space-y-2"}>
            {subjects.map((subj) => (
              <button
                key={subj._id}
                onClick={() => {
                  setSelectedSubject(subj);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full ${
                  isTablet ? "py-2" : "text-left px-4 py-3"
                } rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedSubject && selectedSubject._id === subj._id
                    ? isTablet
                      ? "bg-theme-100 dark:bg-theme-900"
                      : "bg-theme-100 dark:bg-theme-900 border-l-4 border-theme-500"
                    : ""
                }`}
              >
                {isTablet ? (
                  <div className="flex justify-center">
                    {subj.icon && (
                      <img
                        src={subj.icon.replace("/server/icons/", "/icons/")}
                        alt="icon"
                        className="w-9 h-10"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center">
                    {subj.icon && (
                      <img
                        src={subj.icon.replace("/server/icons/", "/icons/")}
                        alt="icon"
                        className="w-8 h-8 mr-3"
                      />
                    )}
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white block">
                        {subj.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {subj.description}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          {!isTablet && (
            <div className="mt-4">
              <button
                onClick={() => setShowAddSubject(true)}
                className="w-full px-4 py-3 bg-theme-500 text-white rounded-lg hover:bg-theme-700 transition-colors"
              >
                + Add Subject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Subject Title */}
        {selectedSubject && (
          <div className="bg-theme-100 dark:bg-theme-900 py-4 px-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center">
              {selectedSubject.icon && (
                <img
                  src={selectedSubject.icon.replace(
                    "/server/icons/",
                    "/icons/"
                  )}
                  alt="icon"
                  className="w-8 h-8 mr-3"
                />
              )}
              <span>{selectedSubject.name}</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-center">
              {selectedSubject.description}
            </p>
          </div>
        )}

        {/* Roadmap */}
        <div className="p-6">
          {selectedSubject &&
          selectedSubject.topics &&
          selectedSubject.topics.length > 0 ? (
            (() => {
              const spacing = isMobile ? 150 : 200;
              return (
                <div
                  className="relative bg-transparent rounded-lg p-4 z-10"
                  style={{
                    height: `${selectedSubject.topics.length * spacing}px`,
                  }}
                >
                  {selectedSubject.topics.map((topic, index) => {
                    const totalLessons = topic.lessons
                      ? topic.lessons.length
                      : 0;
                    const completedLessons = topic.lessons
                      ? topic.lessons.filter(
                          (lesson) =>
                            lesson.quizzes && lesson.quizzes.length > 0
                        ).length
                      : 0;
                    const progress =
                      totalLessons > 0
                        ? (completedLessons / totalLessons) * 100
                        : 0;

                    const isLeft = index % 2 === 0;
                    const topPosition = `${index * spacing}px`;
                    const offset = isMobile ? 0 : 5;
                    const leftPosition = isLeft
                      ? `${25 - offset}%`
                      : `${45 + offset}%`;

                    return (
                      <div
                        key={topic._id}
                        className={`absolute ${
                          isMobile || isTablet
                            ? "flex flex-col items-center"
                            : "flex items-center"
                        }`}
                        style={{
                          top: topPosition,
                          left: leftPosition,
                          width: "30%",
                        }}
                      >
                        {/* Topic Circle */}
                        <div
                          className="w-17 h-18 md:w-21 md:h-22 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg"
                          style={{
                            background:
                              "radial-gradient(circle at 50% 40%, var(--color-theme-500) 60%, var(--color-theme-900) 61%)",
                            boxShadow: "0 20px 20px -10px rgba(0, 0, 0, 0.5)",
                            textShadow:
                              "1px 1px 2px rgba(0,0,0,0.7), -1px -1px 2px rgba(255,255,255,0.3)",
                            perspective: "200px",
                          }}
                          onClick={() => {
                            if (isMobile || isTablet) {
                              const newExpanded = new Set(expandedMobileTopics);
                              if (newExpanded.has(topic._id)) {
                                newExpanded.delete(topic._id);
                              } else {
                                newExpanded.add(topic._id);
                              }
                              setExpandedMobileTopics(newExpanded);
                            } else {
                              setSelectedTopic(topic);
                            }
                          }}
                        >
                          <span
                            style={{
                              fontSize: "2.5rem",
                              transform: "rotateX(30deg) translateY(-10px)", // 👈 milder tilt
                              transformOrigin: "center bottom", // tilt from bottom edge
                              display: "inline-block",
                            }}
                          >
                            {index + 1}
                          </span>
                        </div>

                        {/* Topic Content */}
                        {(isMobile || isTablet) && expandedMobileTopics.has(topic._id) ? (
                          <div
                            className="fixed inset-0 z-50 flex items-center justify-center"
                            onClick={() => {
                              const newExpanded = new Set(expandedMobileTopics);
                              newExpanded.delete(topic._id);
                              setExpandedMobileTopics(newExpanded);
                            }}
                          >
                            <div
                              className="bg-theme-100 dark:bg-theme-900 p-4 rounded-lg shadow-lg max-w-sm w-full mx-4 max-h-96 overflow-y-auto"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {topic.name}
                                </h3>
                                <button
                                  onClick={() => {
                                    const newExpanded = new Set(
                                      expandedMobileTopics
                                    );
                                    newExpanded.delete(topic._id);
                                    setExpandedMobileTopics(newExpanded);
                                  }}
                                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                  ✕
                                </button>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mb-3">
                                {topic.description}
                              </p>
                              <div className="mb-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-theme-500 to-theme-900 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {completedLessons} of {totalLessons} lessons
                                  completed
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  className="px-3 py-1 bg-gradient-to-r from-theme-500 to-theme-500 text-white rounded-lg hover:from-theme-500 hover:to-theme-500 transition-all duration-300 hover:scale-105 shadow-md"
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
                        ) : (
                          <div
                            className={`${
                              isMobile || isTablet
                                ? "mt-4 w-full opacity-0 max-h-0 overflow-hidden"
                                : `ml-4 flex-1 ${
                                    isLeft ? "" : "order-first mr-4 ml-0"
                                  }`
                            } transition-all duration-300`}
                          >
                            <div
                              className="bg-theme-100 dark:bg-theme-900 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-300"
                              onClick={() => setSelectedTopic(topic)}
                            >
                              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {topic.name}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 mb-3">
                                {topic.description}
                              </p>
                              <div className="mb-2">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-theme-500 to-theme-900 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  {completedLessons} of {totalLessons} lessons
                                  completed
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  className="px-3 py-1 bg-gradient-to-r from-theme-500 to-theme-500 text-white rounded-lg hover:from-theme-500 hover:to-theme-500 transition-all duration-300 hover:scale-105 shadow-md"
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
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              {selectedSubject
                ? "No topics available for this subject."
                : "Select a subject to view topics."}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Topic Details */}
      {selectedTopic && (
        <div className="w-80 h-full fixed right-0 z-99  bg-theme-100 dark:bg-theme-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                {selectedTopic.name}
              </h2>
              <button
                onClick={() => setSelectedTopic(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {selectedTopic.description}
            </p>

            {/* Lessons */}
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Lessons
            </h3>
            {selectedTopic.lessons && selectedTopic.lessons.length > 0 ? (
              <div className="space-y-3">
                {selectedTopic.lessons.map((lesson) => {
                  const isExpanded = expandedLessons.has(lesson._id);
                  return (
                    <div
                      key={lesson._id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {lesson.title}
                        </span>
                        <button
                          onClick={() => setFullscreenLesson(lesson)}
                          className="text-theme-500 hover:text-theme-700 dark:text-theme-400 dark:hover:text-theme-300"
                        >
                          Fullscreen
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {lesson.content}
                          </p>
                          {lesson.image && (
                            <img
                              src={`http://localhost:5000${lesson.image}`}
                              alt="Lesson"
                              className="w-full h-32 object-cover mt-2 rounded"
                            />
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
              <p className="text-gray-500 dark:text-gray-400">
                No lessons available.
              </p>
            )}

            {/* Add Topic */}
            <div className="mt-6">
              {!showAddTopic ? (
                <button
                  onClick={() => setShowAddTopic(true)}
                  className="w-full px-4 py-3 bg-theme-500 text-white rounded-lg hover:bg-theme-700 transition-colors"
                >
                  + Add Topic
                </button>
              ) : (
                <form onSubmit={handleAddTopic} className="space-y-3">
                  <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Add New Topic</h4>
                  <input
                    type="text"
                    placeholder="Topic Name"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-theme-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                    required
                  />
                  <textarea
                    placeholder="Topic Description"
                    value={topicDescription}
                    onChange={(e) => setTopicDescription(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-theme-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                    rows="3"
                    required
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Add Topic
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddTopic(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Add Lesson Form */}
            {showLessonForm === selectedTopic._id && (
              <div className="mt-4">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Add New Lesson
                </h4>
                <form
                  onSubmit={(e) => handleAddLesson(e, selectedTopic._id)}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    placeholder="Lesson Title"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-theme-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                    required
                  />
                  <textarea
                    placeholder="Lesson Content"
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-theme-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                    rows="4"
                    required
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLessonImage(e.target.files[0])}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-theme-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 shadow-md"
                    >
                      Add Lesson
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLessonForm(null)}
                      className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 hover:scale-105 shadow-md"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Quiz Form */}
            {showQuizForm && (
              <div className="mt-4">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Add New Question
                </h4>
                <form
                  onSubmit={(e) => handleAddQuiz(e, showQuizForm)}
                  className="space-y-3"
                >
                  <select
                    value={quizType}
                    onChange={(e) => setQuizType(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-theme-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
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
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-theme-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                    required
                  />
                  {quizType === "mcq" && (
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
                          className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-theme-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                          required
                        />
                      ))}
                    </div>
                  )}
                  {quizType === 'truefalse' ? (
                    <div className="space-y-2">
                      <label className="block text-gray-700 dark:text-gray-300">Correct Answer:</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="quizAnswer"
                            value="true"
                            checked={quizAnswer === 'true'}
                            onChange={(e) => setQuizAnswer(e.target.value)}
                            className="mr-2"
                            required
                          />
                          True
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="quizAnswer"
                            value="false"
                            checked={quizAnswer === 'false'}
                            onChange={(e) => setQuizAnswer(e.target.value)}
                            className="mr-2"
                            required
                          />
                          False
                        </label>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Answer"
                      value={quizAnswer}
                      onChange={(e) => setQuizAnswer(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-theme-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                      required
                    />
                  )}
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-md"
                    >
                      Add Question
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuizForm(null)}
                      className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 hover:scale-105 shadow-md"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-theme-100 dark:bg-theme-900 border-t border-gray-200 dark:border-gray-700 flex justify-around py-2 z-50">
          {subjects.map((subj) => (
            <button
              key={subj._id}
              onClick={() => setSelectedSubject(subj)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                selectedSubject && selectedSubject._id === subj._id
                  ? "bg-theme-100 dark:bg-theme-900"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <img
                src={subj.icon.replace("/server/icons/", "/icons/")}
                alt={subj.name}
                className="w-8 h-8"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lesson Modal */}
      {fullscreenLesson && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-theme-100 dark:bg-theme-900 rounded-lg shadow-xl max-w-4xl w-full max-h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{fullscreenLesson.title}</h2>
                <button
                  onClick={() => setFullscreenLesson(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{fullscreenLesson.content}</p>
                {fullscreenLesson.image && (
                  <img
                    src={`http://localhost:5000${fullscreenLesson.image}`}
                    alt="Lesson"
                    className="w-full max-h-96 object-contain mt-4 rounded"
                  />
                )}
              </div>
              {fullscreenLesson.quizzes && fullscreenLesson.quizzes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quiz</h3>
                  <button
                    onClick={() => {
                      const allQuestions = fullscreenLesson.quizzes.flatMap(quiz => quiz.questions);
                      setFullscreenQuiz({ questions: allQuestions });
                    }}
                    className="px-4 py-2 bg-theme-500 text-white rounded-lg hover:bg-theme-700 transition-colors"
                  >
                    Take Quiz
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Quiz Modal */}
      {fullscreenQuiz && !showScore && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-theme-100 dark:bg-theme-900 rounded-lg shadow-xl max-w-2xl w-full max-h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Quiz - Question {currentQuestionIndex + 1} of {fullscreenQuiz.questions.length}
                </h2>
                <button
                  onClick={resetQuiz}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
              {fullscreenQuiz.questions && fullscreenQuiz.questions[currentQuestionIndex] && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {fullscreenQuiz.questions[currentQuestionIndex].question}
                  </h3>
                  {fullscreenQuiz.questions[currentQuestionIndex].type === 'mcq' && fullscreenQuiz.questions[currentQuestionIndex].options && (
                    <div className="space-y-2">
                      {fullscreenQuiz.questions[currentQuestionIndex].options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center">
                          <input
                            type="radio"
                            name={`question-${currentQuestionIndex}`}
                            value={option}
                            checked={selectedAnswers[currentQuestionIndex] === option}
                            onChange={() => handleAnswerSelect(currentQuestionIndex, option)}
                            className="mr-2"
                          />
                          <label className="text-gray-700 dark:text-gray-300">{option}</label>
                        </div>
                      ))}
                    </div>
                  )}
                  {fullscreenQuiz.questions[currentQuestionIndex].type === 'truefalse' && (
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value="true"
                          checked={selectedAnswers[currentQuestionIndex] === "true"}
                          onChange={() => handleAnswerSelect(currentQuestionIndex, "true")}
                          className="mr-2"
                        />
                        <label className="text-gray-700 dark:text-gray-300">True</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value="false"
                          checked={selectedAnswers[currentQuestionIndex] === "false"}
                          onChange={() => handleAnswerSelect(currentQuestionIndex, "false")}
                          className="mr-2"
                        />
                        <label className="text-gray-700 dark:text-gray-300">False</label>
                      </div>
                    </div>
                  )}
                  {fullscreenQuiz.questions[currentQuestionIndex].type === 'shortanswer' && (
                    <input
                      type="text"
                      placeholder="Your answer"
                      value={selectedAnswers[currentQuestionIndex] || ''}
                      onChange={(e) => handleAnswerSelect(currentQuestionIndex, e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                    />
                  )}
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <button
                  onClick={resetQuiz}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                {currentQuestionIndex < fullscreenQuiz.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    disabled={!selectedAnswers[currentQuestionIndex]}
                    className="px-4 py-2 bg-theme-500 text-white rounded-lg hover:bg-theme-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={!selectedAnswers[currentQuestionIndex]}
                    className="px-4 py-2 bg-theme-500 text-white rounded-lg hover:bg-theme-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Score Modal */}
      {showScore && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-theme-100 dark:bg-theme-900 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quiz Complete!</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                Your Score: {score} / {fullscreenQuiz.questions.length}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {score === fullscreenQuiz.questions.length ? 'Perfect! 🎉' : score > fullscreenQuiz.questions.length / 2 ? 'Good job! 👍' : 'Keep practicing! 💪'}
              </p>
              <button
                onClick={resetQuiz}
                className="px-4 py-2 bg-theme-500 text-white rounded-lg hover:bg-theme-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-theme-100 dark:bg-theme-900 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Subject</h2>
                <button
                  onClick={() => setShowAddSubject(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddSubject} className="space-y-4">
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-theme-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                  required
                />
                <textarea
                  placeholder="Subject Description"
                  value={subjectDescription}
                  onChange={(e) => setSubjectDescription(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-theme-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                  rows="3"
                  required
                />
                <input
                  type="text"
                  placeholder="Icon Path (e.g., /server/icons/subject.png)"
                  value={subjectIcon}
                  onChange={(e) => setSubjectIcon(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-theme-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white transition-all duration-300"
                  required
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add Subject
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSubject(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
