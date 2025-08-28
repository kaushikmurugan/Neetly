import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../UI/layout";
import { decryptData } from "../utils/secureStorage";

function TestResults() {
  const navigate = useNavigate();
  const location = useLocation();

  // Redux selectors to get userId and testId
  const { testResults } = useSelector((state) => state.selectedTest);
  console.log("testResults = ", testResults);

  const user = decryptData(localStorage.getItem("user"));

  // Local state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine URL from state (supports string or object forms)
  const extractUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value.url || value.result_url || value.link || null;
    }
    return null;
  };

  const resultUrl = extractUrl(
    testResults.scoreCard 
  );

  useEffect(() => {
    // When we have a URL, show loader until iframe finishes
    console.log(
      "check location from results",
      location.state?.from,
      location.state?.prevPath,
      location.state?.previousPath
    );

    if (resultUrl) {
      setError(null);
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [resultUrl]);

  const handleGoBack = () => {
    const path = location.state?.from || localStorage.getItem("Path") || "/";
    const prevPath =
      location.state?.prevPath || localStorage.getItem("prevPath") || "/";
    const previousPath =
      location.state?.previousPath ||
      localStorage.getItem("previousPath") ||
      "/";
    // console.log("Results Paths check", path, prevPath, previousPath);

    if (path === "/test-cards" && prevPath === "/" && previousPath === "/") {
      navigate("/test-cards");
    } else if (
      path === "/test" &&
      prevPath === "/test-details" &&
      previousPath === "/practice/units/test"
    ) {
      navigate("/practice/units/test");
    } else if (
      path === "/test" &&
      prevPath === "/test-details" &&
      previousPath === "/test-cards"
    ) {
      navigate("/test-cards");
    } else if (
      path === "/test" &&
      prevPath === "/test-cards" &&
      previousPath === "/"
    ) {
      navigate("/test-cards");
    } else {

      navigate("/home-screen");
    }
    ["Path", "prevPath", "previousPath"].forEach((key) =>
      localStorage.removeItem(key)
    );
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const handleReview = () => {
    console.log(
      "review clicked",
      location.state?.from,
      location.state?.prevPath
    );
    if (
      location.state?.from ||
      location.state?.prevPath ||
      location.state?.previousPath
    ) {
      localStorage.setItem("Path", location.state.from);
      localStorage.setItem(
        "prevPath",
        location.state.prevPath ? location.state.prevPath : "/"
      );
      localStorage.setItem(
        "previousPath",
        location.state.previousPath ? location.state.previousPath : "/"
      );
      navigate("/test-review");
    } else {
      navigate("/test-review");
    }
  };

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
                Error Loading Results
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

  // No data state
  if (!resultUrl) {
    return (
      <div>
        <Layout />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-yellow-500 text-6xl mb-4">📝</div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                No Test Data Found
              </h2>
              <p className="text-gray-600 mb-6">
                Please start a test first to view results.
              </p>
              <button
                onClick={handleGoBack}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
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
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg">
                  🏆
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Test Results
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReview}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
                >
                  Review
                </button>
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 text-sm"
                >
                  Back
                </button>
              </div>
            </div>
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading test results...</p>
                </div>
              </div>
            )}
            <iframe
              title="Test Results"
              src={resultUrl}
              className="w-full"
              style={{ minHeight: "80vh" }}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError("Failed to load results page.");
              }}
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestResults;
