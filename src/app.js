import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, RotateCcw, CheckCircle, XCircle, Clock, Trophy, Star, Zap, Brain, Target } from 'lucide-react';

// Quiz data with general knowledge questions
const quizData = [
  {
    id: 1,
    question: "What is 15 + 27?",
    options: ["40", "42", "44", "46"],
    correctAnswer: "42",
    category: "Mathematics",
    difficulty: "easy"
  },
  {
    id: 2,
    question: "Which color is created by mixing red and yellow?",
    options: ["Purple", "Orange", "Green", "Pink"],
    correctAnswer: "Orange",
    category: "General Knowledge",
    difficulty: "easy"
  },
  {
    id: 3,
    question: "How many days are there in a leap year?",
    options: ["365", "366", "367", "364"],
    correctAnswer: "366",
    category: "General Knowledge",
    difficulty: "medium"
  },
  {
    id: 4,
    question: "What is the result of 8 × 7?",
    options: ["54", "56", "58", "60"],
    correctAnswer: "56",
    category: "Mathematics",
    difficulty: "medium"
  },
  {
    id: 5,
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "6",
    category: "Mathematics",
    difficulty: "medium"
  },
  {
    id: 6,
    question: "What is 144 ÷ 12?",
    options: ["11", "12", "13", "14"],
    correctAnswer: "12",
    category: "Mathematics",
    difficulty: "hard"
  },
  {
    id: 7,
    question: "How many minutes are in 3 hours?",
    options: ["150", "160", "170", "180"],
    correctAnswer: "180",
    category: "Mathematics",
    difficulty: "hard"
  },
  {
    id: 8,
    question: "What comes next in the sequence: 2, 4, 8, 16, ?",
    options: ["24", "28", "30", "32"],
    correctAnswer: "32",
    category: "Mathematics",
    difficulty: "hard"
  }
];

const QuizApp = () => {
  const [gameState, setGameState] = useState('menu'); // 'menu', 'quiz', 'results'
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [difficulty, setDifficulty] = useState('all');
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameState === 'quiz' && timeLeft > 0 && !isAnswerLocked) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'quiz' && !isAnswerLocked) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, isAnswerLocked]);

  // Load high scores from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem('quizHighScores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);

  const startQuiz = useCallback((selectedDifficulty = 'all') => {
    let filteredQuestions = quizData;
    if (selectedDifficulty !== 'all') {
      filteredQuestions = quizData.filter(q => q.difficulty === selectedDifficulty);
    }
    
    setQuestions(filteredQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setUserAnswers([]);
    setScore(0);
    setTimeLeft(30);
    setIsAnswerLocked(false);
    setShowFeedback(false);
    setGameState('quiz');
  }, []);

  const handleTimeUp = useCallback(() => {
    if (!isAnswerLocked) {
      setIsAnswerLocked(true);
      setShowFeedback(true);
      
      const newAnswer = {
        questionId: questions[currentQuestionIndex].id,
        selectedAnswer: '',
        correctAnswer: questions[currentQuestionIndex].correctAnswer,
        isCorrect: false,
        timeTaken: 30
      };
      
      setUserAnswers(prev => [...prev, newAnswer]);
      
      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    }
  }, [currentQuestionIndex, questions, isAnswerLocked]);

  const handleAnswerSelect = (answer) => {
    if (isAnswerLocked) return;
    
    setSelectedAnswer(answer);
    setIsAnswerLocked(true);
    setShowFeedback(true);
    
    const isCorrect = answer === questions[currentQuestionIndex].correctAnswer;
    const timeTaken = 30 - timeLeft;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    const newAnswer = {
      questionId: questions[currentQuestionIndex].id,
      selectedAnswer: answer,
      correctAnswer: questions[currentQuestionIndex].correctAnswer,
      isCorrect,
      timeTaken
    };
    
    setUserAnswers(prev => [...prev, newAnswer]);
    
    setTimeout(() => {
      moveToNextQuestion();
    }, 2000);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setTimeLeft(30);
      setIsAnswerLocked(false);
      setShowFeedback(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const finalScore = {
      score: score + (selectedAnswer === questions[currentQuestionIndex]?.correctAnswer ? 1 : 0),
      total: questions.length,
      difficulty,
      date: new Date().toISOString()
    };
    
    const updatedHighScores = [...highScores, finalScore]
      .sort((a, b) => (b.score / b.total) - (a.score / a.total))
      .slice(0, 10);
    
    setHighScores(updatedHighScores);
    localStorage.setItem('quizHighScores', JSON.stringify(updatedHighScores));
    
    setGameState('results');
  };

  const resetQuiz = () => {
    setGameState('menu');
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setUserAnswers([]);
    setScore(0);
    setTimeLeft(30);
    setIsAnswerLocked(false);
    setShowFeedback(false);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'from-emerald-500 to-green-600';
    if (percentage >= 60) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-600';
  };

  const getDifficultyIcon = (diff) => {
    switch(diff) {
      case 'easy': return <Star className="w-4 h-4" />;
      case 'medium': return <Zap className="w-4 h-4" />;
      case 'hard': return <Brain className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 border border-gray-600 rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-700 border border-gray-600 rounded-2xl mb-4">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                QuizMaster
              </h1>
              <p className="text-gray-300 text-lg font-medium">
                Test your knowledge with style
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <h3 className="text-white font-semibold text-lg mb-4">Select Difficulty:</h3>
              {[
                { key: 'all', label: 'All Questions', icon: <Target className="w-5 h-5" /> },
                { key: 'easy', label: 'Easy', icon: <Star className="w-5 h-5" /> },
                { key: 'medium', label: 'Medium', icon: <Zap className="w-5 h-5" /> },
                { key: 'hard', label: 'Hard', icon: <Brain className="w-5 h-5" /> }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`w-full p-4 rounded-2xl transition-all duration-300 flex items-center justify-between font-medium ${
                    difficulty === key
                      ? 'bg-slate-700 border border-gray-600 text-white'
                      : 'bg-slate-700/50 border border-gray-600/50 text-gray-300 hover:bg-slate-700/70 hover:border-gray-600/70'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {icon}
                    {label}
                  </span>
                  {difficulty === key && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => startQuiz(difficulty)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 text-lg"
            >
              <Trophy className="w-6 h-6" />
              Start Quiz
            </button>

            {highScores.length > 0 && (
              <div className="mt-8 p-4 bg-slate-700 rounded-2xl border border-gray-600">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Best Score: {Math.round((highScores[0].score / highScores[0].total) * 100)}%
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'quiz') {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800 border border-gray-600 rounded-3xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-white">
                  {getDifficultyIcon(currentQuestion.difficulty)}
                  <span className="font-semibold">{currentQuestion.category}</span>
                </div>
                <span className="text-gray-300">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  timeLeft <= 10 ? 'bg-red-600 text-red-200 border border-red-500' : 'bg-slate-700 text-gray-300 border border-gray-600'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">{timeLeft}s</span>
                </div>
                <div className="text-white font-semibold">
                  Score: {score}/{currentQuestionIndex}
                </div>
              </div>
            </div>

            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-800 border border-gray-600 rounded-3xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "w-full p-6 rounded-2xl border transition-all duration-300 text-left font-medium text-lg ";
                
                if (showFeedback) {
                  if (option === currentQuestion.correctAnswer) {
                    buttonClass += "bg-emerald-600 border-emerald-500 text-white";
                  } else if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
                    buttonClass += "bg-red-600 border-red-500 text-white";
                  } else {
                    buttonClass += "bg-slate-700 border-gray-600 text-gray-400";
                  }
                } else if (selectedAnswer === option) {
                  buttonClass += "bg-blue-600 border-blue-500 text-white";
                } else {
                  buttonClass += "bg-slate-700 border-gray-600 text-white hover:bg-slate-600 hover:border-gray-500 transform hover:scale-105";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswerLocked}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showFeedback && option === currentQuestion.correctAnswer && (
                        <CheckCircle className="w-6 h-6 text-emerald-200" />
                      )}
                      {showFeedback && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                        <XCircle className="w-6 h-6 text-red-200" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div className="mt-6 p-4 bg-slate-700 rounded-2xl border border-gray-600">
                <div className="flex items-center gap-3">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                      <span className="text-emerald-100 font-semibold">Correct! Well done!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-400" />
                      <span className="text-red-100 font-semibold">
                        {selectedAnswer ? 'Incorrect.' : 'Times up!'} The correct answer was: {currentQuestion.correctAnswer}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800 border border-gray-600 rounded-3xl p-8 mb-6 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-500 rounded-2xl mb-6">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Quiz Complete!
            </h1>
            
            <div className={`inline-block px-8 py-4 rounded-2xl ${
              percentage >= 80 ? 'bg-emerald-600' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-600'
            }`}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {finalScore} / {questions.length}
              </div>
              <div className="text-xl text-white">
                {percentage}% Correct
              </div>
            </div>

            <p className="text-gray-300 text-xl mt-4 font-medium">
              {percentage >= 80 ? "Outstanding! You're a quiz master!" :
               percentage >= 60 ? "Great job! Well done!" :
               "Keep practicing! You'll improve!"}
            </p>
          </div>

          <div className="bg-slate-800 border border-gray-600 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Target className="w-8 h-8" />
              Detailed Results
            </h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {userAnswers.map((answer, index) => {
                const question = questions.find(q => q.id === answer.questionId);
                return (
                  <div 
                    key={answer.questionId}
                    className="p-4 bg-slate-700 rounded-2xl border border-gray-600"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {answer.isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-2">
                          Q{index + 1}: {question?.question}
                        </h3>
                        
                        <div className="space-y-1 text-sm">
                          <div className="flex flex-wrap gap-4">
                            <span className={`px-3 py-1 rounded-full ${
                              answer.isCorrect 
                                ? 'bg-emerald-600 text-emerald-100 border border-emerald-500' 
                                : 'bg-red-600 text-red-100 border border-red-500'
                            }`}>
                              Your answer: {answer.selectedAnswer || 'No answer'}
                            </span>
                            
                            <span className="px-3 py-1 rounded-full bg-blue-600 text-blue-100 border border-blue-500">
                              Correct: {answer.correctAnswer}
                            </span>
                            
                            <span className="px-3 py-1 rounded-full bg-slate-600 text-gray-300 border border-gray-500">
                              Time: {answer.timeTaken}s
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetQuiz}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
              
              <button
                onClick={() => setGameState('menu')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white border border-gray-600 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <ChevronLeft className="w-5 h-5" />
                Main Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
const App = QuizApp;
export default App;