import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setStartTestData } from "../redux/selectedTestSlice";
import { decryptData } from "../utils/secureStorage";
import NeetIcon from "../assets/app_logo_round.png";
import axios from "axios";
const baseUrl = import.meta.env.VITE_BASE_URL;

export default function TestDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const { testDetails } = useSelector((state) => state.selectedTest);
  console.log("selectedTest", testDetails);
  const dispatch = useDispatch();

  const user = decryptData(localStorage.getItem("user"));
  // console.log("user", user);

  // Extract specific fields from testDetails
  const testData = testDetails.data;
  const testName =
    testData.test_name || testData.name || "Test Name Not Available";
  const numberOfQuestions =
    testData.no_of_questions ||
    testData.questions_count ||
    testData.total_questions ||
    "Not specified";
  const timeToComplete =
    testData.minutes ||
    testData.duration ||
    testData.test_duration ||
    "Not specified";
  const instructions =
    testData.instruction ||
    testData.test_instructions ||
    "No instructions available";

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleStartTest = async () => {
    // Navigate to the test page with the test ID
    const test_id = testData.id;
    if (test_id && user.id && timeToComplete && testName) {
      const formData = new FormData();
      formData.append("action", "insert_start_test");
      formData.append("user_id", user.id);
      formData.append("test_id", test_id);
      formData.append("is_live", 0);
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
      console.log(response, response.data);

      if (response.status === 200) {
        dispatch(
          setStartTestData({
            id: test_id,
            data: user.id,
            testTime: timeToComplete,
            testName: testName,
          })
        );
        console.log("check location from details", location.state?.from);

        navigate(`/test`, {
          state: { from: location.pathname, prevPath: location.state?.from },
        });
      }
    } else {
      console.error("Missing user ID or test ID for navigation");
    }
  };

  // Check if testDetails is null, undefined, or doesn't have data
  if (!testDetails || !testDetails.data) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-4 max-w-md">
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
              <p className="font-bold text-lg">No Test Data Found</p>
            </div>
            <p className="text-sm">
              {error ||
                "Unable to load test details. The test may not exist or there was an error fetching the data."}
            </p>
          </div>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 mx-auto"
          >
            <svg
              className="w-5 h-5"
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
            <span>Back to Tests</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-gray-200 to-gray-300" />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <img src={NeetIcon} alt="Neet Icon" className="w-14 h-14" />
              <h1 className="text-xl md:text-3xl font-bold text-gray-800">
                Test Details
              </h1>
            </div>
            <button
              onClick={handleGoBack}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
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
              <span className="max-md:block hidden">Back</span>
              <span className="hidden md:block">Back&nbsp;to&nbsp;Tests</span>
            </button>
          </div>
        </div>

        {/* Test Information Card */}
        {testDetails && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Test Information
            </h2>

            <div className="space-y-6">
              {/* Test Name */}
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Test Name
                  </h3>
                  <p className="text-gray-700">{testName}</p>
                </div>
              </div>

              {/* Number of Questions */}
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Number of Questions
                  </h3>
                  <p className="text-gray-700">{numberOfQuestions}</p>
                </div>
              </div>

              {/* Time to Complete */}
              <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Time to Complete
                  </h3>
                  <p className="text-gray-700">{timeToComplete} min</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    Instructions
                  </h3>
                  <div
                    className="text-gray-700 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: instructions }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start Test Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Ready to Start?
            </h3>
            <p className="text-gray-600 mb-6">
              Make sure you have read all the instructions carefully before
              beginning the test.
            </p>
            <button
              onClick={handleStartTest}
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto text-lg font-semibold shadow-lg"
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
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Start Test</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
