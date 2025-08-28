import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTestResults } from "../redux/selectedTestSlice";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import bug from "../assets/bug.png";
import bookmark from "../assets/bookmark.png";
import unbookmark from "../assets/un_bookmark.png";
import BugReportModal from "../components/BugReportModal";
import { MathJax } from "better-react-mathjax";
import { Flag } from "lucide-react";
import { toast } from "react-toastify";
import { decryptData } from "../utils/secureStorage";
const baseUrl = import.meta.env.VITE_BASE_URL;

function Test() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  // Redux state
  const { startTestData, testDetails } = useSelector(
    (state) => state.selectedTest
  );
  // console.log("starting od test data ",startTestData, testDetails);

  const user = decryptData(localStorage.getItem("user"));

  // Local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [bugReportData, setBugReportData] = useState(null);
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState([]);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  // Subject name state
  const [subjectName, setSubjectName] = useState("");
  // Question timing and bookmark state
  const [questionTiming, setQuestionTiming] = useState({});
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());
  // Test session state
  const [testStarted, setTestStarted] = useState(false);
  // Subject year state
  const [subjectYear, setSubjectYear] = useState("");

  // Extract test ID and user ID from Redux state
  const testId = startTestData?.id || startTestData?.test_id;
  const testTime = startTestData?.testTime || startTestData?.test_time;
  const testName = startTestData?.testName || startTestData?.test_name;
  const item = testDetails.data;

  // Detect if this is a page reload and reset test
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        // Reset all test state
        setUserAnswers({});
        setFlaggedQuestions(new Set());
        setBookmarkedQuestions(new Set());
        setQuestionTiming({});
        setCurrentQuestionIndex(0);
        setTestStarted(false);
        // Redirect to home page if test was in progress
        if (!testCompleted && questions.length > 0) {
          alert(
            "Test session was interrupted. All progress has been lost. Please start the test again from the first question."
          );
          navigate("/test-cards");
        }
      }
    };

    const handlePopState = (e) => {
      // Prevent back/forward navigation during test
      if (!testCompleted && questions.length > 0) {
        e.preventDefault();
        window.history.pushState(null, null, window.location.pathname);
        alert(
          "Please do not use browser navigation during the test. All progress will be lost."
        );
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);

    // Push initial state to prevent back navigation
    if (!testCompleted && questions.length > 0) {
      window.history.pushState(null, null, window.location.pathname);
    }

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [testCompleted, questions.length, navigate]);

  // Prevent text selection and copying
  useEffect(() => {
    const preventSelection = (e) => {
      e.preventDefault();
      return false;
    };

    const preventCopy = (e) => {
      e.preventDefault();
      alert("Copying is disabled during the test for security reasons.");
      return false;
    };

    const preventCut = (e) => {
      e.preventDefault();
      alert("Cutting is disabled during the test for security reasons.");
      return false;
    };

    const preventPaste = (e) => {
      e.preventDefault();
      alert("Pasting is disabled during the test for security reasons.");
      return false;
    };

    // Add event listeners for text selection and clipboard operations
    document.addEventListener("selectstart", preventSelection);
    document.addEventListener("copy", preventCopy);
    document.addEventListener("cut", preventCut);
    document.addEventListener("paste", preventPaste);

    return () => {
      document.removeEventListener("selectstart", preventSelection);
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("cut", preventCut);
      document.removeEventListener("paste", preventPaste);
    };
  }, []);

  // Request fullscreen
  const enterFullscreen = (element) => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      // Firefox
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      // Chrome, Safari
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      // IE/Edge
      element.msRequestFullscreen();
    }
  };

  // Exit fullscreen
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  useEffect(() => {
    // Enter fullscreen when component mounts
    enterFullscreen(document.documentElement);

    // Listen if user tries to exit fullscreen manually
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // If they try to exit, force fullscreen again
        enterFullscreen(document.documentElement);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleBlur = () => {
      // User switched tabs or minimized
      toast.error("⚠ Test blocked: Tab switching is not allowed!");
      // optional: auto-submit test
      // handleSubmit();
    };

    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Prevent accidental reload/close while test is ongoing
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!testCompleted && questions.length > 0) {
        e.preventDefault();
        e.returnValue =
          "Are you sure you want to leave? All test progress will be lost and you will start from the first question.";
      }
    };

    const handleKeyDown = (e) => {
      // Prevent F5, Ctrl+R, Ctrl+Shift+R, Ctrl+F5, F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === "F5" ||
        e.key === "F12" ||
        e.key === "Escape" ||
        (e.ctrlKey && e.key === "r") ||
        (e.ctrlKey && e.shiftKey && e.key === "R") ||
        (e.ctrlKey && e.key === "F5") ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "u") ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
        toast.error(
          "Developer tools and page reload are disabled during the test for security reasons."
        );
        return false;
      }
    };

    const handleContextMenu = (e) => {
      // Prevent right-click context menu
      e.preventDefault();
      toast.error(
        "Right-click is disabled during the test for security reasons."
      );
      return false;
    };

    // Prevent developer tools detection
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        alert(
          "Developer tools detected! Please close them to continue with the test."
        );
        return true;
      }
      return false;
    };

    // Check for dev tools periodically
    const devToolsCheck = setInterval(() => {
      if (detectDevTools()) {
        clearInterval(devToolsCheck);
      }
    }, 1000);

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      clearInterval(devToolsCheck);
    };
  }, [testCompleted, questions.length]);

  const contentRef = useRef(null);

  // Fetch test questions on component mount
  useEffect(() => {
    if (testId && user.id) {
      fetchTestQuestions();
    } else {
      setError("Missing test ID or user ID");
      setLoading(false);
    }
  }, [testId, user.id]);

  // When questions load, initialize timer from testTime
  useEffect(() => {
    if (questions.length > 0 && testTime) {
      setTimeRemaining(Number(testTime) * 60);
    }
  }, [questions.length, testTime]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (timeRemaining > 0 && !testCompleted && questions.length > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTestSubmission();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeRemaining, testCompleted, questions.length]);

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Fetch test questions from API
  const fetchTestQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create form data for API request
      const formData = new FormData();
      formData.append("action", "question");
      formData.append("user_id", user.id);
      formData.append("test_id", testId);

      const response = await axios.post(
        "https://neetly.in/api/data_v1.php",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.data && response.status === 200) {
        // Handle response.data as array of objects
        const responseArray = Array.isArray(response.data)
          ? response.data
          : [response.data];

        // Extract test data from first object
        const firstItem = responseArray[0] || {};

        // Extract questions - handle different possible structures
        let extractedQuestions = [];
        if (firstItem.questions && Array.isArray(firstItem.questions)) {
          extractedQuestions = firstItem.questions;
        } else if (firstItem.question && Array.isArray(firstItem.question)) {
          extractedQuestions = firstItem.question;
        } else if (Array.isArray(firstItem)) {
          extractedQuestions = firstItem;
        } else {
          // If the entire response is an array of question objects
          extractedQuestions = responseArray;
        }

        setQuestions(extractedQuestions);

        // Extract subject name from response
        let extractedSubjectName = "";
        if (firstItem.subjectname) {
          extractedSubjectName = firstItem.subjectname;
        } else if (firstItem.subject) {
          extractedSubjectName = firstItem.subject;
        } else if (firstItem.test_name) {
          extractedSubjectName = firstItem.test_name;
        } else if (firstItem.name) {
          extractedSubjectName = firstItem.name;
        } else if (extractedQuestions.length > 0) {
          // Try to extract from first question if available
          const firstQuestion = extractedQuestions[0];
          if (firstQuestion.subject_name) {
            extractedSubjectName = firstQuestion.subject_name;
          } else if (firstQuestion.subject) {
            extractedSubjectName = firstQuestion.subject;
          }
        }

        setSubjectName(extractedSubjectName);

        let extractedSubjectYear = "";
        if (firstItem.subjectyear) {
          extractedSubjectYear = firstItem.subjectyear;
        } else if (firstItem.year) {
          extractedSubjectYear = firstItem.year;
        }
        setSubjectYear(extractedSubjectYear);
        console.log("Subject Info:", {
          subjectName: extractedSubjectName,
          subjectYear: extractedSubjectYear,
        });

        setLoading(false);
      } else {
        throw new Error(
          response.data?.message || "Failed to fetch test questions"
        );
      }
    } catch (error) {
      console.error("Error fetching test questions:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load test questions. Please try again."
      );
      setLoading(false);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, answer) => {
    console.log(`Question ${questionId}: Selected answer "${answer}"`);

    // Mark test as started when user first answers a question
    if (!testStarted) {
      setTestStarted(true);
    }

    // Record the time when question is answered
    const currentTime = Date.now();
    const questionStartTime =
      questionTiming[`${questionId}_start`] || currentTime;
    const timeSpent = Math.round((currentTime - questionStartTime) / 1000);

    // Add this time to the total time spent on this question
    setQuestionTiming((prev) => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + timeSpent,
      [`${questionId}_start`]: null, // Clear the start time
    }));

    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Track test progress
  const getTestProgress = () => {
    const answeredCount = Object.keys(userAnswers).length;
    const totalQuestions = questions.length;
    const progressPercentage =
      totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    const progress = {
      answered: answeredCount,
      total: totalQuestions,
      percentage: progressPercentage,
      remaining: totalQuestions - answeredCount,
    };

    return progress;
  };

  // Toggle flag for review
  const toggleFlagForReview = (questionId) => {
    // console.log(`Question ${questionId}: Toggling flag for review`);

    // Mark test as started when user first flags a question
    if (!testStarted) {
      setTestStarted(true);
    }
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Check if question is flagged
  const isQuestionFlagged = (questionId) => {
    return flaggedQuestions.has(questionId);
  };

  // Toggle bookmark for question
  const toggleBookmark = (questionId) => {
    // console.log(`Question ${questionId}: Toggling bookmark`);

    // Mark test as started when user first bookmarks a question
    if (!testStarted) {
      setTestStarted(true);
    }
    setBookmarkedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Check if question is bookmarked
  const isQuestionBookmarked = (questionId) => {
    return bookmarkedQuestions.has(questionId);
  };

  // Track when user starts viewing a question
  useEffect(() => {
    if (questions.length > 0 && !testCompleted) {
      const questionId =
        questions[currentQuestionIndex]?.id ||
        questions[currentQuestionIndex]?.question_id;

      if (questionId) {
        const isAnswered = userAnswers[questionId];

        // If question is not answered, start tracking time
        if (!isAnswered) {
          const currentTime = Date.now();
          setQuestionTiming((prev) => ({
            ...prev,
            [`${questionId}_start`]: currentTime,
          }));
        }
      }
    }
  }, [currentQuestionIndex, questions, testCompleted, userAnswers]);

  // Track time spent on current question with pause/resume logic
  useEffect(() => {
    if (questions.length > 0 && !testCompleted) {
      const questionId =
        questions[currentQuestionIndex]?.id ||
        questions[currentQuestionIndex]?.question_id;

      if (questionId) {
        const isAnswered = userAnswers[questionId];

        // If question is already answered, don't track time
        if (isAnswered) {
          return;
        }

        return () => {
          // When leaving the question, calculate time spent and add to total
          const currentTime = Date.now();
          const questionStartTime = questionTiming[`${questionId}_start`];

          if (questionStartTime) {
            const timeSpent = Math.round(
              (currentTime - questionStartTime) / 1000
            );

            setQuestionTiming((prev) => ({
              ...prev,
              [questionId]: (prev[questionId] || 0) + timeSpent,
              [`${questionId}_start`]: null, // Clear the start time
            }));
          }
        };
      }
    }
  }, [
    currentQuestionIndex,
    questions,
    testCompleted,
    userAnswers,
    questionTiming,
  ]);

  // Toggle review modal
  const toggleReviewModal = () => {
    setShowReviewModal(!showReviewModal);
  };

  // Close review modal
  const closeReviewModal = () => {
    setShowReviewModal(false);
  };

  // Toggle submit confirmation modal
  const toggleSubmitModal = () => {
    setShowSubmitModal(!showSubmitModal);
  };

  // Close submit confirmation modal
  const closeSubmitModal = () => {
    setShowSubmitModal(false);
  };

  // Handle submit confirmation
  const handleSubmitConfirm = () => {
    closeSubmitModal();
    handleTestSubmission();
  };

  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Go to specific question
  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Submit test answers
  const handleTestSubmission = async () => {
    try {
      setLoading(true);

      // Capture current viewing time for unanswered questions before submission
      const currentTime = Date.now();
      const updatedTiming = { ...questionTiming };

      questions.forEach((question) => {
        const questionId = question.id || question.question_id;
        const isAttempted = userAnswers.hasOwnProperty(questionId);

        if (!isAttempted) {
          const questionStartTime = questionTiming[`${questionId}_start`];
          if (questionStartTime) {
            const currentViewingTime = Math.round(
              (currentTime - questionStartTime) / 1000
            );
            updatedTiming[questionId] =
              (updatedTiming[questionId] || 0) + currentViewingTime;
            updatedTiming[`${questionId}_start`] = null;
          }
        }
      });

      setQuestionTiming(updatedTiming);

      // Calculate total time taken
      const totalTime = Number(testTime) * 60 - timeRemaining;
      setTotalTimeTaken(totalTime);

      // Prepare answers in the new format as requested
      const submitAnswers = questions.map((question) => {
        const questionId = question.id || question.question_id;
        const isAttempted = userAnswers.hasOwnProperty(questionId);
        let selectedOption = isAttempted ? userAnswers[questionId] : null;
        const totalTimeSpent = updatedTiming[questionId] || 0;
        const isBookmarked = bookmarkedQuestions.has(questionId) ? 1 : 0;

        // Reverse mapping (option key -> numeric)
        const optionToNumber = {
          optiona: 1,
          optionb: 2,
          optionc: 3,
          optiond: 4,
        };

        // Convert selected option to numeric
        if (selectedOption && optionToNumber[selectedOption] !== undefined) {
          selectedOption = optionToNumber[selectedOption];
        }

        // Get correct answer key in numeric
        const answerKeyNumeric = question.answer || null;
        // console.log("answerKeyNumeric:", answerKeyNumeric);

        let status;
        if (!isAttempted) {
          status = "not_attempt";
        } else if (selectedOption == answerKeyNumeric) {
          status = "right";
        } else {
          status = "wrong";
        }
        // console.log("status", selectedOption, status);

        return {
          ques_id: questionId,
          state: status,
          soption:
            selectedOption !== null && selectedOption !== undefined
              ? String(selectedOption)
              : "", // now numeric
          time: String(totalTimeSpent),
          bookmark: String(isBookmarked),
        };
      });

      setSubmittedAnswers(submitAnswers);
      setTestCompleted(true);

      // Create form data for submission
      const formData = new FormData();
      formData.append("action", "submit_answer");
      formData.append("test_id", testId);
      formData.append("user_id", user.id);
      formData.append("answer", JSON.stringify(submitAnswers));
      formData.append("is_live", 0);
      formData.append("total_time", totalTimeTaken);

      console.log("Submitting test data:", {
        testId,
        userId: user.id,
        totalQuestions: questions.length,
        answeredQuestions: Object.keys(userAnswers).length,
        flaggedQuestions: flaggedQuestions.size,
        bookmarkedQuestions: bookmarkedQuestions.size,
        submitAnswers,
      });

      const response = await axios.post(
        baseUrl,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );
      console.log(
        "response data:",
        response.data,
        response.data[0].scorecard_url
      );

      if (response.data && response.status === 200) {
        console.log("submitted test successfully");
        exitFullscreen();
        dispatch(
          setTestResults({
            scoreCard: response.data[0].scorecard_url,
            data: item,
            answers: submitAnswers,
          })
        );
        navigate("/test-results", {
          state: {
            from: location.pathname,
            prevPath: location.state?.from,
            previousPath: location.state?.prevPath,
          },
        });
      } else {
        throw new Error(response.data?.message || "Failed to submit test");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit test. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  //handle BugModal
  const handleModel = async () => {
    try {
      const formData = new FormData();
      formData.append("action", "get_report_masters");
      formData.append("userId", user.id);
      // Call your API
      const response = await axios.post(
        baseUrl,
        formData
      );
      console.log("response bug => ", response, response.data);
      const value = response.data; // assuming API returns the needed value

      if (response.status === 200 && response.data) {
        setBugReportData(value);
        setShowBugReportModal(true); // open modal with value
      } else {
        toast.error("Failed to fetch bug report data");
      }
    } catch (error) {
      toast.error("Error in opening the bug report modal");
    }
  };

  // Handle back navigation
  const handleGoBack = () => {
    if (!testCompleted && questions.length > 0) {
      if (
        window.confirm(
          "Submit the test before leaving or Your progress will be lost."
        )
      ) {
        navigate(-1);
      }
    } else {
      // navigate("/test-cards");
      navigate("/home-screen");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test questions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4">
            <div className="flex items-center justify-center mb-2">
              <svg
                className="w-6 h-6 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="font-bold">Error Loading Test</p>
            </div>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Test not started state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                No Questions Available
              </h1>
              {subjectName && (
                <h2 className="text-xl font-semibold text-blue-600 mb-4">
                  {subjectName}
                </h2>
              )}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Test Information
                </h2>
                <p className="text-gray-600">
                  No questions are available for this test.
                </p>
              </div>
              <button
                onClick={handleGoBack}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active test state
  const currentQuestion = questions[currentQuestionIndex];
  const testProgress = getTestProgress();

  return (
    <div className="min-h-screen bg-gray-100 select-none" ref={contentRef}>
      {/* Warning Banner */}
      {!testCompleted && questions.length > 0 && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center text-red-700 text-sm">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Warning:</span>
              <span className="ml-1">
                Do not reload the page or use browser navigation during the
                test. All progress will be lost.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header with timer and progress */}
      <div className="bg-white shadow-lg sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleGoBack}
                className="text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-110 p-2 rounded-lg hover:bg-gray-100"
                title="Go back to test list"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                {testName && (
                  <div className="mb-2">
                    <h1 className="text-xl font-bold text-gray-800">
                      {testName}
                    </h1>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
                <p className="text-xs text-gray-500">
                  Progress: {testProgress.answered}/{testProgress.total}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`text-xl font-bold ${
                  timeRemaining < 300
                    ? "text-red-600 animate-pulse"
                    : "text-gray-800"
                }`}
              >
                {timeRemaining !== null
                  ? formatTime(timeRemaining)
                  : "--:--:--"}
              </div>
              <p className="text-xs text-red-500">Remaining Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-4">
        {currentQuestion && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Question {currentQuestionIndex + 1}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      toggleBookmark(
                        currentQuestion.id || currentQuestion.question_id
                      )
                    }
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isQuestionBookmarked(
                        currentQuestion.id || currentQuestion.question_id
                      )
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                    title={
                      isQuestionBookmarked(
                        currentQuestion.id || currentQuestion.question_id
                      )
                        ? "Remove bookmark"
                        : "Add bookmark"
                    }
                  >
                    <img
                      src={
                        isQuestionBookmarked(
                          currentQuestion.id || currentQuestion.question_id
                        )
                          ? bookmark
                          : unbookmark
                      }
                      alt="Bookmark Icon"
                      className="w-6 h-6"
                    />
                    <span className="text-sm font-medium">
                      {isQuestionBookmarked(
                        currentQuestion.id || currentQuestion.question_id
                      )
                        ? "Bookmarked"
                        : "Bookmark"}
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      toggleFlagForReview(
                        currentQuestion.id || currentQuestion.question_id
                      )
                    }
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isQuestionFlagged(
                        currentQuestion.id || currentQuestion.question_id
                      )
                        ? "bg-orange-100 text-orange-700 border border-orange-300"
                        : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                    title={
                      isQuestionFlagged(
                        currentQuestion.id || currentQuestion.question_id
                      )
                        ? "Remove from review"
                        : "Flag for review"
                    }
                  >
                    <Flag className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {isQuestionFlagged(
                        currentQuestion.id || currentQuestion.question_id
                      )
                        ? "Flagged"
                        : "Flag"}
                    </span>
                  </button>
                  <button
                    onClick={handleModel} /*() => setShowBugReportModal(true) */
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 bg-red-100 text-red-600 border border-red-300 hover:bg-red-50 hover:text-red-700"
                    title="Report a bug for this question"
                  >
                    <img src={bug} alt="Bug IMage" className="w-6 h-6" />
                    <span className="text-sm font-medium">Report Bug</span>
                  </button>
                </div>
              </div>
              <MathJax>
                <div
                  className="text-gray-700 mb-6"
                  // style={{ whiteSpace: "normal" }}
                  dangerouslySetInnerHTML={{
                    __html:
                      currentQuestion.question ||
                      currentQuestion.question_text ||
                      currentQuestion.text ||
                      "",
                  }}
                />
              </MathJax>
            </div>

            {/* Answer options */}
            <div className="space-y-3">
              {["optiona", "optionb", "optionc", "optiond"].map(
                (optionKey, index) => {
                  const optionValue = currentQuestion[optionKey];
                  if (!optionValue || optionValue.trim() === "") return null;

                  const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected =
                    userAnswers[
                      currentQuestion.id || currentQuestion.question_id
                    ] === optionKey;

                  return (
                    <label
                      key={optionKey}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${
                          currentQuestion.id || currentQuestion.question_id
                        }`}
                        value={optionKey}
                        checked={isSelected}
                        onChange={() =>
                          handleAnswerSelect(
                            currentQuestion.id || currentQuestion.question_id,
                            optionKey
                          )
                        }
                        className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-200 text-gray-700 text-sm font-bold rounded-full mr-3">
                          {optionLabel}
                        </span>
                        {optionValue.length > 0 ? (
                          <MathJax>
                            <div
                              id="option"
                              className="text-gray-700 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: optionValue,
                              }}
                            />
                          </MathJax>
                        ) : (
                          "No options available"
                        )}
                      </div>
                    </label>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Question Navigation Group */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`w-32 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                  currentQuestionIndex === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-600 text-white hover:bg-gray-700 hover:scale-105"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Previous</span>
              </button>

              <button
                onClick={goToNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className={`w-32 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                  currentQuestionIndex === questions.length - 1
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
                }`}
              >
                <span>Next</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={toggleReviewModal}
              className="w-32 px-4 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
              title="Review all questions"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span>Review</span>
            </button>

            <button
              onClick={toggleSubmitModal}
              disabled={loading}
              className="w-32 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all duration-200 disabled:opacity-50 hover:scale-105 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit&nbsp;Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Question Review
              </h2>
              <button
                onClick={closeReviewModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Review Summary */}
              {flaggedQuestions.size > 0 && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-orange-800 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Flagged for Review ({flaggedQuestions.size})
                    </h4>
                    <button
                      onClick={() => setFlaggedQuestions(new Set())}
                      className="text-sm text-orange-600 hover:text-orange-800 underline"
                    >
                      Clear all flags
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(flaggedQuestions)
                      .map((questionId) => ({
                        questionId,
                        questionIndex: questions.findIndex(
                          (q) => (q.id || q.question_id) === questionId
                        ),
                      }))
                      .filter((q) => q.questionIndex !== -1)
                      .sort((a, b) => a.questionIndex - b.questionIndex)
                      .map(({ questionId, questionIndex }) => (
                        <div
                          key={questionId}
                          className="flex items-center space-x-1"
                        >
                          <button
                            onClick={() => {
                              goToQuestion(questionIndex);
                              closeReviewModal();
                            }}
                            className="px-3 py-2 bg-orange-200 text-orange-800 text-sm rounded-lg hover:bg-orange-300 transition-colors font-medium"
                          >
                            Q{questionIndex + 1}
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Bookmarked Questions Summary */}
              {bookmarkedQuestions.size > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-blue-800 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                      </svg>
                      Bookmarked Questions ({bookmarkedQuestions.size})
                    </h4>
                    <button
                      onClick={() => setBookmarkedQuestions(new Set())}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear all bookmarks
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(bookmarkedQuestions)
                      .map((questionId) => ({
                        questionId,
                        questionIndex: questions.findIndex(
                          (q) => (q.id || q.question_id) === questionId
                        ),
                      }))
                      .filter((q) => q.questionIndex !== -1)
                      .sort((a, b) => a.questionIndex - b.questionIndex)
                      .map(({ questionId, questionIndex }) => (
                        <div
                          key={questionId}
                          className="flex items-center space-x-1"
                        >
                          <button
                            onClick={() => {
                              goToQuestion(questionIndex);
                              closeReviewModal();
                            }}
                            className="px-3 py-2 bg-blue-200 text-blue-800 text-sm rounded-lg hover:bg-blue-300 transition-colors font-medium"
                          >
                            Q{questionIndex + 1}
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Progress Summary */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className=" text-center text-lg font-semibold text-blue-800 mb-3">
                  Test Progress
                </h4>
                <div className="w-24 bg-gray-200 rounded-full h-2 mx-auto mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) / questions.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-700 mb-4">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {testProgress.answered}
                    </p>
                    <p className="text-sm text-blue-700">Answered</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-600">
                      {testProgress.remaining}
                    </p>
                    <p className="text-sm text-gray-700">Remaining</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {testProgress.percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-green-700">Complete</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {flaggedQuestions.size}
                    </p>
                    <p className="text-sm text-orange-700">Flagged</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {bookmarkedQuestions.size}
                    </p>
                    <p className="text-sm text-blue-700">Bookmarked</p>
                  </div>
                </div>
              </div>

              {/* Question Navigation Grid */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  All Questions
                </h4>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 border-2 border-blue-600 bg-gray-100 rounded"></div>
                    <span>Current Question</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-700 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-orange-500 rounded"></div>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    <span>Bookmarked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-100 rounded"></div>
                    <span>Not Answered</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                  {questions.map((question, index) => {
                    const questionId = question.id || question.question_id;
                    const isAnswered = userAnswers[questionId];
                    const isCurrent = index === currentQuestionIndex;
                    const isFlagged = isQuestionFlagged(questionId);
                    const isBookmarked = isQuestionBookmarked(questionId);

                    return (
                      <div key={index} className="relative">
                        <div className="relative group">
                          <button
                            onClick={() => {
                              goToQuestion(index);
                              closeReviewModal();
                            }}
                            className={`w-12 h-12 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                              isCurrent
                                ? "border-2 border-blue-600 bg-blue-50 text-blue-700 shadow-lg scale-110"
                                : isFlagged && isBookmarked
                                ? "bg-gradient-to-br from-orange-500 to-blue-500 text-white hover:from-orange-600 hover:to-blue-600"
                                : isFlagged
                                ? "bg-orange-500 text-white hover:bg-orange-600"
                                : isBookmarked
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : isAnswered
                                ? "bg-green-700 text-white hover:bg-green-500"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-300 hover:scale-105"
                            }`}
                            title={`Question ${index + 1}${
                              isCurrent ? " (Current Question)" : ""
                            }${isAnswered ? " (Answered)" : " (Not Answered)"}${
                              isFlagged ? " (Flagged for review)" : ""
                            }${isBookmarked ? " (Bookmarked)" : ""}`}
                          >
                            {index + 1}
                            {/* Show indicators for flagged and bookmarked */}
                            {(isFlagged || isBookmarked) && (
                              <div className="absolute -top-1 -right-1 flex space-x-0.5">
                                {isFlagged && (
                                  <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
                                )}
                                {isBookmarked && (
                                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                                )}
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeReviewModal}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Submit Test</h2>
              <button
                onClick={closeSubmitModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Are you sure you want to submit?
                </h3>
                <p className="text-gray-600 mb-4">
                  Once submitted, you cannot change your answers. Please review
                  your test before submitting.
                </p>

                {/* Test Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Questions Answered</p>
                      <p className="font-semibold text-blue-600">
                        {testProgress.answered}/{testProgress.total}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Questions Remaining</p>
                      <p className="font-semibold text-gray-600">
                        {testProgress.remaining}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Flagged for Review</p>
                      <p className="font-semibold text-orange-600">
                        {flaggedQuestions.size}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Bookmarked</p>
                      <p className="font-semibold text-blue-600">
                        {bookmarkedQuestions.size}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeSubmitModal}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Continue Test
              </button>
              <button
                onClick={handleSubmitConfirm}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Submit Test</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bug Report Modal */}
      <BugReportModal
        isOpen={showBugReportModal}
        onClose={() => setShowBugReportModal(false)}
        questionId={currentQuestion?.id || currentQuestion?.question_id}
        testId={testId}
        value={bugReportData}
      />
    </div>
  );
}

export default Test;
