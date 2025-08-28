import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MathJax } from "better-react-mathjax";
import { decryptData } from "../utils/secureStorage";
import Layout from "../UI/layout";
const baseUrl = import.meta.env.VITE_BASE_URL;

function TestReview() {
  const navigate = useNavigate();

  // Redux selectors to get test data
  const { testResults } = useSelector((state) => state.selectedTest);
  console.log("testResults", testResults);

  const user = decryptData(localStorage.getItem("user"));

  // Local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [answersData, setAnswersData] = useState(null);

  useEffect(() => {
    const fetchTestReview = async () => {
      try {
        setLoading(true);
        setError(null);
        // Extract identifiers from testResults
        const sourceData =
          (testResults && testResults.data) || testResults || {};

        const extractedUserId = user.id;
        const extractedTestId = sourceData.id;
        const sourceAnswers = testResults.answers || [];
        console.log("answer", sourceAnswers);

        setAnswersData(sourceAnswers);

        if (!extractedUserId || !extractedTestId) {
          throw new Error("Missing user_id or test_id. Cannot load review.");
        }

        // Create form data for API request
        const formData = new FormData();
        formData.append("action", "review_question");
        formData.append("user_id", String(extractedUserId));
        formData.append("test_id", String(extractedTestId));

        const response = await axios.post(
          baseUrl,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 30000, // 30 second timeout
          }
        );
        // console.log("response", response, response.data);
        if (response.data && response.status === 200) {
          // Normalize review data to array of questions
          const serverData = response.data;
          const questionsArray = Array.isArray(serverData)
            ? serverData
            : serverData?.questions ||
              serverData?.data ||
              serverData?.result ||
              serverData?.list ||
              [];
          setReviewData(questionsArray);
        } else {
          throw new Error("Failed to fetch test review");
        }
      } catch (error) {
        console.error("Error fetching test review:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch test review. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTestReview();
  }, [testResults]);

  const handleGoBack = () => {
    navigate("/test-results");
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  // Function to format time in seconds to MM:SS format
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Extract options from various possible API shapes
  const extractOptions = (question) => {
    if (!question) return [];
    if (Array.isArray(question.options)) return question.options;
    if (question.options && typeof question.options === "object") {
      // Try to order by typical keys if present
      const keys = Object.keys(question.options);
      const order = ["a", "b", "c", "d", "e", "1", "2", "3", "4", "5"];
      const ordered = [];
      for (const marker of order) {
        const key = keys.find((k) =>
          new RegExp(`^(opt(ion)?_?|)${marker}$`, "i").test(k)
        );
        if (
          key &&
          question.options[key] != null &&
          String(question.options[key]).length
        ) {
          ordered.push(question.options[key]);
        }
      }
      const remaining = keys
        .filter((k) => !ordered.includes(question.options[k]))
        .map((k) => question.options[k]);
      return ordered.length ? ordered : remaining;
    }
    // Scan direct fields on question with many common variants
    const variants = [
      ["optiona", "optionb", "optionc", "optiond", "optione"],
      ["aoption", "boption", "coption", "doption", "eoption"],
    ];
    for (const group of variants) {
      const collected = group
        .map((k) => question[k])
        .filter((v) => v !== undefined && v !== null && String(v).length > 0);
      if (collected.length >= 2) return collected; // at least two options to be meaningful
    }
    return [];
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <Layout />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading test review...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Layout />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Error Loading Review
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={handleRetry}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={handleGoBack}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Layout />
      <div className="min-h-screen relative">
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-gray-200 to-gray-300" />
        {/* Results Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {/* In-card Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg">
                  📝
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Test Review & Solutions
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Detailed analysis of your test performance
                  </p>
                </div>
              </div>
              <button
                onClick={handleGoBack}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 text-sm"
              >
                Back to Results
              </button>
            </div>
            {/* Review Content */}
            <div className="p-6">
              {reviewData ? (
                <div className="space-y-6">
                  {/* Questions Review - Accordion */}
                  {Array.isArray(reviewData) && reviewData.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg test font-semibold text-gray-900">
                        Question Review
                      </h3>
                      <div className="space-y-3">
                        {reviewData.map((question, index) => {
                          // Normalize fields based on provided format
                          const questionHtml = question.question;
                          const questionId = question.id;
                          const answer = answersData.find(
                            (ans) => ans.ques_id === questionId
                          );
                          const questionNumber = index + 1;
                          // Extract options and map indices (1:A, 2:B, 3:C, 4:D)
                          const options = extractOptions(question);
                          const sOption = answer
                            ? answer.soption
                            : question.soption;
                          const cOption = question.answer;
                          const selectedOption = isNaN(parseInt(sOption, 10))
                            ? null
                            : parseInt(sOption, 10);
                          const correctOption = isNaN(parseInt(cOption, 10))
                            ? null
                            : parseInt(cOption, 10);
                          const userLetter =
                            selectedOption && selectedOption > 0
                              ? String.fromCharCode(64 + selectedOption)
                              : null;
                          const correctLetter =
                            correctOption && correctOption > 0
                              ? String.fromCharCode(64 + correctOption)
                              : null;
                          const astatus = String(
                            question.astatus || ""
                          ).toLowerCase();
                          const isCorrect =
                            (selectedOption != null &&
                              correctOption != null &&
                              selectedOption === correctOption) ||
                            astatus === "right" ||
                            astatus === "correct";
                          const notAttempted =
                            selectedOption == null || selectedOption < 1;
                          const explanation = question.solution || "";
                          const timeTaken = answer
                            ? answer.time
                            : question.atime || 0;
                          const avgTime = question.avg_time || 0;
                          return (
                            <div
                              key={index}
                              className={`border rounded-lg overflow-hidden ${
                                notAttempted
                                  ? "border-gray-200 bg-white"
                                  : isCorrect
                                  ? "border-green-200 bg-green-50"
                                  : "border-red-200 bg-red-50"
                              }`}
                            >
                              {/* Accordion Header */}
                              <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-80 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                      notAttempted
                                        ? "bg-gray-400 text-white"
                                        : isCorrect
                                        ? "bg-green-500 text-white"
                                        : "bg-red-500 text-white"
                                    }`}
                                  >
                                    Q{questionNumber}
                                  </div>
                                  <div className="text-left flex-1">
                                    <div className="font-medium text-gray-900 text-sm line-clamp-2">
                                      {"Question " + questionNumber}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1">
                                      <div className="text-xs text-blue-600">
                                        Time Taken : {formatTime(timeTaken)}s
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Avg Time : {formatTime(avgTime)}s
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {openAccordion === index ? "Hide" : "View"}
                                  </span>
                                  <svg
                                    className={`w-4 h-4 text-gray-500 transition-transform ${
                                      openAccordion === index
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </div>
                              </button>
                              {/* Accordion Content */}
                              {openAccordion === index && (
                                <div className="px-4 pb-4 border-t border-gray-200 bg-white">
                                  <div className="pt-4 space-y-3">
                                    {/* Question Text */}
                                    <div className="mb-3">
                                      <div className="font-medium text-gray-900 mb-2">
                                        Question:
                                      </div>
                                      <MathJax>
                                        <div
                                          className="text-s text-gray-800 bg-gray-50 p-3 rounded whitespace-pre-wrap"
                                          dangerouslySetInnerHTML={{
                                            __html:
                                              questionHtml ||
                                              "Question text not available",
                                          }}
                                        />
                                      </MathJax>
                                    </div>
                                    {/* Options Under Question */}
                                    {options && options.length > 0 && (
                                      <div className="mt-3">
                                        <div className="text-sm font-medium text-gray-700 mb-2">
                                          Options:
                                        </div>
                                        <div className="grid grid-cols-1 gap-1">
                                          {options.map((option, optIndex) => (
                                            <div
                                              key={optIndex}
                                              className={`text-sm p-2 rounded whitespace-pre-wrap ${
                                                correctOption === optIndex + 1
                                                  ? "bg-green-100 text-green-800 border border-green-200"
                                                  : selectedOption ===
                                                      optIndex + 1 && !isCorrect
                                                  ? "bg-red-100 text-red-800 border border-red-200"
                                                  : "bg-gray-50 text-gray-700"
                                              }`}
                                            >
                                              <MathJax>
                                                <div
                                                  id="option"
                                                  className="flex items-center gap-2"
                                                >
                                                  {String.fromCharCode(
                                                    65 + optIndex
                                                  )}
                                                  &nbsp;.
                                                  <span
                                                    dangerouslySetInnerHTML={{
                                                      __html: option,
                                                    }}
                                                  />
                                                </div>
                                              </MathJax>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {/* Explanation */}
                                    {explanation && (
                                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                        <div className="text-sm font-medium text-blue-900 mb-2">
                                          Review Summary
                                        </div>
                                        <div className="space-y-2 mb-3">
                                          <div className="text-sm text-gray-800">
                                            <span className="font-medium">
                                              Your Answer:{" "}
                                            </span>
                                            {notAttempted ? (
                                              <span>Not Attempted</span>
                                            ) : (
                                              <span className="inline-flex items-center gap-2">
                                                {userLetter && (
                                                  <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-800 text-xs">
                                                    {"Option " + userLetter}
                                                  </span>
                                                )}
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-sm text-gray-800">
                                            <span className="font-medium">
                                              Correct Option:{" "}
                                            </span>
                                            <span className="inline-flex items-center gap-2">
                                              {correctLetter && (
                                                <span className="px-1.5 py-0.5 rounded bg-green-200 text-green-900 text-xs">
                                                  {"Option " + correctLetter}
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="text-sm font-medium text-blue-900 mb-1">
                                          Explanation:
                                        </div>
                                        <MathJax dynamic>
                                          <div
                                            className="text-xs md:text-base  text-blue-800 whitespace-pre-wrap"
                                            dangerouslySetInnerHTML={{
                                              __html: explanation,
                                            }}
                                          />
                                        </MathJax>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-6xl mb-4">📋</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Review Data Available
                      </h3>
                      <p className="text-gray-600">
                        Detailed review information is not available for this
                        test.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Review Data
                  </h3>
                  <p className="text-gray-600">
                    Review data is not available for this test.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestReview;
