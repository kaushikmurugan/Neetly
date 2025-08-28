import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MathJax } from "better-react-mathjax";
import bookmark from "../assets/bookmark.png";
import { decryptData } from "../utils/secureStorage";
import { BookmarkIcon, BookmarkX } from "lucide-react";
import { toast } from "react-toastify";
import Layout from "../UI/layout";
const baseUrl = import.meta.env.VITE_BASE_URL;

function Bookmark() {
  const navigate = useNavigate();
  const user = decryptData(localStorage.getItem("user"));
  console.log("user", user);

  // Local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkData, setBookmarkData] = useState(null);
  const [openIndex, setOpenIndex] = useState(null); // For accordion toggle

  useEffect(() => {
    const fetchTestReview = async () => {
      try {
        setLoading(true);
        setError(null);

        const extractedUserId = user.id;

        const formData = new FormData();
        formData.append("action", "view_bookmarks");
        formData.append("user_id", extractedUserId);

        const response = await axios.post(`${baseUrl}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        });

        console.log("response ==>", response.data);

        if (response.data && response.status === 200) {
          if (response.data[0].status != "failed") {
            const serverData = response.data;
            const questionsArray = Array.isArray(serverData)
              ? serverData
              : serverData?.questions ||
                serverData?.data ||
                serverData?.result ||
                serverData?.list ||
                [];
            console.log("questionsArray ==>", questionsArray);
            setBookmarkData(questionsArray);
          }
        } else {
          throw new Error("Failed to fetch test review");
        }
      } catch (error) {
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
  }, [setBookmarkData]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleUnbookmark = async (questionId, testId) => {
    try {
      const extractedUserId = user.id;
      console.log("question", questionId, extractedUserId);

      const formData = new FormData();
      formData.append("action", "un_bookmark");
      formData.append("user_id", extractedUserId);
      formData.append("ques_id", questionId);
      formData.append("test_id", testId);

      const response = await axios.post(
        `${baseUrl}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );

      console.log("bookmark response", response.data);

      if (response.status === 200) {
        toast.success("Bookmark removed!");
        setBookmarkData((prev) => prev.filter((q) => q.id !== questionId));
      }
    } catch (error) {
      console.error("Failed to unbookmark:", error);
      toast.error("Failed to remove bookmark. Please try again.");
    }
  };

  const extractOptions = (question) => {
    if (!question) return [];
    if (Array.isArray(question.options)) return question.options;
    if (question.options && typeof question.options === "object") {
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
    const variants = [
      ["optiona", "optionb", "optionc", "optiond", "optione"],
      ["aoption", "boption", "coption", "doption", "eoption"],
    ];
    for (const group of variants) {
      const collected = group
        .map((k) => question[k])
        .filter((v) => v !== undefined && v !== null && String(v).length > 0);
      if (collected.length >= 2) return collected;
    }
    return [];
  };

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test review...</p>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Layout />
      <div className="min-h-screen relative bg-gray-100">
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-gray-200 to-gray-300" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-3">
                <img src={bookmark} alt="bookmark" className="h-9 w-9" />
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Bookmarks
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Review your bookmarked questions
                  </p>
                </div>
              </div>
              <button
                onClick={handleGoBack}
                className="px-3 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
              >
                Back
              </button>
            </div>
            {/* Content */}
            <div className="p-6 space-y-6">
              {Array.isArray(bookmarkData) && bookmarkData.length > 0 ? (
                bookmarkData.map((question, index) => {
                  const options = extractOptions(question);
                  const sOption = parseInt(question.soption, 10);
                  const cOption = parseInt(question.answer, 10);
                  const isCorrect = sOption === cOption;
                  return (
                    <div
                      key={index}
                      className={`rounded-lg p-4 shadow-sm border ${
                        sOption
                          ? isCorrect
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      {/* Question */}
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold text-gray-900">
                          Q{index + 1}.
                        </div>
                        <div
                          onClick={() =>
                            handleUnbookmark(question.id, question.test_id)
                          }
                          className="py-1 px-2 min-md:p-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center"
                        >
                          <BookmarkIcon />
                          <button className="min-md:p-1 ">Unbookmark</button>
                        </div>
                      </div>
                      <MathJax>
                        <div
                          className="text-sm text-gray-700 bg-gray-50 p-3 rounded"
                          dangerouslySetInnerHTML={{
                            __html: question.question || "No question text",
                          }}
                        />
                      </MathJax>
                      {/* Options */}
                      {options.length > 0 && (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {options.map((opt, i) => (
                            <div
                              key={i}
                              className={`text-sm p-2 rounded border ${
                                cOption === i + 1
                                  ? "bg-green-100 border-green-300 text-green-800"
                                  : sOption === i + 1 && !isCorrect
                                  ? "bg-red-100 border-red-300 text-red-800"
                                  : "bg-gray-50 border-gray-200 text-gray-700"
                              }`}
                            >
                              <MathJax>
                                <div
                                  id="option"
                                  className="flex items-center gap-2"
                                >
                                  {String.fromCharCode(65 + i)}.{" "}
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: opt,
                                    }}
                                  />
                                </div>
                              </MathJax>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Accordion for Explanation */}
                      {question.solution && (
                        <div className="mt-4">
                          <button
                            onClick={() =>
                              setOpenIndex(openIndex === index ? null : index)
                            }
                            className="w-full flex justify-between items-center bg-blue-100 text-blue-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-200"
                          >
                            Explanation
                            <span>{openIndex === index ? "▲" : "▼"}</span>
                          </button>
                          {openIndex === index && (
                            <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-3">
                              <MathJax dynamic>
                                <div
                                  className="text-sm text-blue-800 whitespace-pre-wrap"
                                  dangerouslySetInnerHTML={{
                                    __html: question.solution,
                                  }}
                                />
                              </MathJax>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <BookmarkX className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700">
                    No bookmarked questions found
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Add bookmark questions to see them here.
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

export default Bookmark;
