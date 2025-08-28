import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Target,
  ArrowRight,
  ArrowLeft,
  Users,
  Trophy,
  Calendar,
  BarChart3,
} from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { setSelectedTest } from "../redux/selectedTestSlice";
import { useDispatch } from "react-redux";
import Layout from "../UI/layout";
import { decryptData } from "../utils/secureStorage";
const baseUrl = import.meta.env.VITE_BASE_URL;

function UnitTestList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { selectedUnit } = useSelector((state) => state.selectedTest);
  console.log("selectedUnit:", selectedUnit);

  const user = decryptData(localStorage.getItem("user"));

  useEffect(() => {
    const fetchTests = async () => {
      if (!selectedUnit.id) return;

      const formData = new FormData();
      formData.append("action", "test");
      formData.append("user_id", user.id);
      formData.append("chapter_id", selectedUnit.id);

      try {
        setLoading(true);
        const response = await axios.post(
          baseUrl,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 10000,
          }
        );

        console.log("Tests response:", response);
        console.log("Tests data:", response.data);
        console.log("Tests:", tests);

        if (
          response.data &&
          response.data[0] &&
          response.data[0]["chapter-test"] &&
          Array.isArray(response.data[0]["chapter-test"])
        ) {
          setTests(response.data[0]["chapter-test"]);
        } else {
          console.warn("Unexpected response format:", response.data);
          setTests([]);
        }
      } catch (error) {
        console.error("Failed to fetch tests:", error);
        setTests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [selectedUnit.id]);

  const handleTestClick = (test) => {
    // Navigate to the actual test page or start the test
    const testId = test.id || test.test_id || test.testid;
    console.log("Starting test:", testId, test);
    // You can implement the test starting logic here
    dispatch(setSelectedTest({ id: testId, data: test }));
    navigate(`/test-details`, { state: { from: location.pathname } });
  };

  const handleBackClick = () => {
    navigate("/practice/units"); // Go back to the previous page (units page)
  };

  if (loading) {
    return (
      <div>
        <Layout />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-orange-300 border-b-transparent rounded-full mx-auto animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Loading Tests
            </h3>
            <p className="text-gray-600">Preparing your test modules...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Layout />
      <div className="relative min-h-screen pb-10">
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-gray-200 to-gray-300" />
        {/* Tests Grid */}
        <div className="w-11/12 max-w-7xl mx-auto">
          {/* Modern Header Section */}
          <div className="mb-12 pt-8">
            <div className="rounded-3xl bg-white shadow-2xl p-8 mb-8 flex items-center justify-between max-xl:flex-wrap-reverse gap-4">
              <div>
                <h2 className="text-xl md:text-4xl font-bold drop-shadow-md mb-4 animate-fade-in">
                  {selectedUnit.name}
                </h2>
                <p className="text-l max-sm:text-sm font-medium backdrop-blur-sm text-gray-500">
                  Select a test to start practicing with our comprehensive
                  question bank
                </p>
              </div>
              {/* Back Button */}
              <div className="text-center">
                <button
                  onClick={handleBackClick}
                  className="flex items-center mx-auto bg-gradient-to-r from-orange-400 to-pink-500 text-white p-2 px-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group transform hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="font-semibold hidden md:block">
                    Back&nbsp;to&nbsp;Units
                  </span>
                  <span className="font-semibold hidden max-md:block">
                    Back
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tests.map((test, index) => {
              return (
                <div
                  key={test.id}
                  onClick={() => handleTestClick(test)}
                  className="group cursor-pointer transform hover:scale-105 transition-all duration-500"
                >
                  <div className="bg-white rounded-3xl p-8 shadow-xl text-gray-800 relative overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between backdrop-blur-sm">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 opacity-60"></div>
                    {/* Content */}
                    <div className=" z-10 relative">
                      {/* Header with Icon and Questions */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-3 flex items-center justify-center shadow-lg">
                          <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Questions
                          </div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                            {test.total_questions || test.questions || "NA"}
                          </div>
                        </div>
                      </div>
                      {/* Test Name */}
                      <h3 className="text-xl font-bold mb-4 text-gray-800 leading-tight">
                        {test.name || `Test ${index + 1}`}
                      </h3>
                      {/* Test Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center bg-white/70 rounded-lg px-3 py-2">
                            <Clock className="w-4 h-4 mr-2 text-orange-500" />
                            <span className="font-medium">
                              {test.minutes ? `${test.minutes} min` : "NA min"}
                            </span>
                          </div>
                          <div className="flex items-center bg-white/70 rounded-lg px-3 py-2">
                            <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                            <span className="font-medium">
                              {test.marks} Max&nbsp;Marks
                            </span>
                          </div>
                        </div>
                        {test.avg_time && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center bg-white/70 rounded-lg px-3 py-2">
                              <Clock className="w-4 h-4 mr-2 text-blue-500" />
                              <span className="font-medium">
                                {test.avg_time} avg
                              </span>
                            </div>
                            <div className="flex items-center bg-white/70 rounded-lg px-3 py-2">
                              <Users className="w-4 h-4 mr-2 text-green-500" />
                              <span className="font-medium">
                                {test.attend_count || 0} Attended
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div
                        className={`mt-4 ${
                          test.percentage > 0 ? "d-block" : "hidden"
                        }`}
                      >
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${test.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 font-medium">
                          {test.percentage}% Completed
                        </p>
                      </div>
                    </div>

                    {/* Footer with Status and Action */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              test.attended == 1
                                ? "bg-gradient-to-r from-green-400 to-green-600"
                                : "bg-gradient-to-r from-orange-400 to-orange-600"
                            } ${
                              test.attended == 1 ? "animate-pulse" : ""
                            } shadow-lg`}
                          ></div>
                          <span className="text-sm font-semibold text-gray-700">
                            Available
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 group-hover:translate-x-1 transition-transform duration-300">
                          <span className="text-sm font-semibold text-gray-700">
                            Start Test
                          </span>
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                            <ArrowRight className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Empty State */}
          {tests.length === 0 && !loading && (
            <div className="text-center mt-12">
              <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 border border-orange-200 rounded-3xl p-12 max-w-md mx-auto shadow-xl backdrop-blur-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-4 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  No Tests Available
                </h3>
                <p className="text-gray-600 bg-white/70 rounded-lg px-6 py-4 backdrop-blur-sm">
                  There are no tests available for this unit at the moment.
                  Please check back later.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UnitTestList;
