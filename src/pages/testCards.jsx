import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setSelectedTest, setTestResults } from "../redux/selectedTestSlice";
import { decryptData } from "../utils/secureStorage";
import Layout from "../UI/layout";
const baseUrl = import.meta.env.VITE_BASE_URL;

export default function PreviousTests() {
  const [previousData, setPreviousData] = useState([]);
  const [upcomingData, setUpcomingData] = useState([]);
  const [liveData, setLiveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { testCategory } = useSelector((state) => state.selectedTest);

  const user = decryptData(localStorage.getItem("user"));

  const naturalSortByName = (a, b) => {
    return (
      a.name?.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      }) || 0
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      const formData = new FormData();
      formData.append("action", "test");
      formData.append("user_id", user.id);
      formData.append("category", testCategory.id);

      try {
        const response = await axios.post(
          baseUrl,
          formData
        );
        console.log("response.data", response.data);

        let prev = [];
        let upc = [];
        let live = [];

        response.data.forEach((item) => {
          if (item.previous) prev = item.previous;
          if (item.upcoming) upc = item.upcoming;
          if (item.live) live = item.live;
        });

        prev.sort(naturalSortByName);
        live.sort(naturalSortByName);
        upc.sort((a, b) => {
          const timeA = new Date(a.start_time).getTime();
          const timeB = new Date(b.start_time).getTime();
          return timeA - timeB;
        });

        setPreviousData(prev || []);
        setUpcomingData(upc || []);
        setLiveData(live || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id, testCategory.id, setLiveData, setUpcomingData, setPreviousData]);

  // Countdown updater for upcoming tests
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const newCountdowns = {};

      upcomingData.forEach((test) => {
        if (test.start_time) {
          const startTime = new Date(test.start_time).getTime();
          const diff = startTime - now;

          if (diff > 0) {
            newCountdowns[test.id || test.test_id] = formatTime(diff);
          } else {
            newCountdowns[test.id || test.test_id] = "00:00:00";
          }
        }
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(timer);
  }, [upcomingData]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${String(hours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const getSubjectStyle = (testName) => {
    if (!testName)
      return {
        gradient: "from-gray-500 to-gray-600",
        leftIcon: "📚",
        rightIcon: "📖",
      };

    const name = testName.toLowerCase();

    if (name.includes("math") || name.includes("mathematics"))
      return {
        gradient: "from-blue-500 to-indigo-600",
        leftIcon: "🔢",
        rightIcon: "📐",
      };
    if (name.includes("physics"))
      return {
        gradient: "from-purple-500 to-blue-600",
        leftIcon: "⚡",
        rightIcon: "🔬",
      };
    if (name.includes("chemistry"))
      return {
        gradient: "from-orange-500 to-red-600",
        leftIcon: "🧪",
        rightIcon: "⚗️",
      };
    if (name.includes("biology"))
      return {
        gradient: "from-purple-500 to-emerald-600",
        leftIcon: "🧬",
        rightIcon: "🔬",
      };
    if (name.includes("english"))
      return {
        gradient: "from-red-500 to-pink-600",
        leftIcon: "📝",
        rightIcon: "📖",
      };

    return {
      gradient: "from-emerald-500 to-teal-600",
      leftIcon: "📚",
      rightIcon: "📖",
    };
  };

  const handleViewDetails = (item) => {
    const testId = item.id || item.test_id || item.testid;
    if (user.id && testId) {
      dispatch(setSelectedTest({ id: testId, data: item }));
      console.log("check path from cards", location.pathname);

      navigate(`/test-details`, {
        state: { from: location.pathname },
      });
    }
  };

  const handleCheckResult = (item) => {
    const scoreCard = item.scorecard_url;
    const testId = item.id || item.test_id || item.testid;

    if ((user.id === item.user_id) && testId && scoreCard) {
      dispatch(setTestResults({ scoreCard, data: item }));
      console.log("check path from cards", location.pathname);

      navigate(`/test-results`, { state: { from: location.pathname } });
    }
  };

  const renderTestCard = (item, index, isUpcoming = false, isLive = false) => {
    const subjectStyle = getSubjectStyle(item.name);
    const key = item.id || item.test_id || `index-${index}`;
    const isAttended = item.attended && parseInt(item.attended) > 0;
    const startTime = item.start_time
      ? new Date(item.start_time).getTime()
      : null;
    const now = new Date().getTime();
    const isUpcomingLocked = isUpcoming && startTime && startTime > now;
    const countdown = countdowns[item.id || item.test_id];

    // ✅ Live test attendable condition
    const canAttendLive =
      isLive &&
      item.live_time_minutes != null &&
      Number(item.live_time_minutes) !== 0;

    return (
      <div
        key={key}
        className="group relative overflow-hidden bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
      >
        {/* Card Header */}
        <div
          className={`bg-gradient-to-r ${subjectStyle.gradient} flex justify-center p-6 text-white relative`}
        >
          <div className="absolute top-4 left-4 w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">
            {subjectStyle.leftIcon}
          </div>
          <div className="absolute top-4 right-4 w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">
            {subjectStyle.rightIcon}
          </div>
          <div className="z-10 ">
            <h2 className="text-xl font-bold">
              {item.name || `Test ${index + 1}`}
            </h2>
            <p className="text-white text-opacity-80 text-sm">Test Session</p>
          </div>
        </div>
        {/* Card Body */}
        <div className="p-4 space-y-3">
          {(item.total_question || item.total_questions) && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <span className="font-semibold text-gray-700">
                Total Questions
              </span>
              <span className="text-xl font-semibold text-blue-600">
                {item.total_question || item.total_questions}
              </span>
            </div>
          )}
          {(item.duration || item.time_limit || item.minutes) && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
              <span className="font-semibold text-gray-700">Time Limit</span>
              <span className="text-xl font-semibold text-purple-600">
                {item.duration || item.time_limit || item.minutes} min
              </span>
            </div>
          )}
          {isUpcomingLocked ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-50 rounded-2xl border border-purple-100">
                <span className="font-semibold text-gray-700">
                  Test Starts In :
                </span>
                <span className="text-m font-semibold text-gray-600">
                  {item.start_time_text?.split(/ (.+)/)[0] || ""}
                  <br />
                  {item.start_time_text?.split(/ (.+)/)[1] || ""}
                </span>
              </div>
              <div className="text-center text-red-600 font-semibold py-3 border border-red-300 rounded-xl bg-red-50">
                Test Starts in: {countdown || "Calculating..."}
              </div>
            </div>
          ) : isAttended ? (
            <div className="flex space-x-3">
              <button
                onClick={() => handleCheckResult(item)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-2xl font-semibold hover:scale-105 shadow-lg"
              >
                Check Result
              </button>
              <button
                onClick={() => handleViewDetails(item)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:scale-105 shadow-lg"
              >
                Retry Test
              </button>
            </div>
          ) : isLive && !canAttendLive ? (
            <div className="w-full bg-gray-400 text-white py-3 rounded-2xl font-semibold text-center">
              Not Attendable
            </div>
          ) : (
            <button
              onClick={() => handleViewDetails(item)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:scale-105 shadow-lg"
            >
              Start Test
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Layout />
      <div className="flex justify-center min-h-screen relative pt-10 p-4">
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-gray-200 to-gray-300" />
        <div className="max-w-6xl w-full">
          {loading ? (
            <div className="text-center text-gray-600">Loading...</div>
          ) : (
            <>
              {/* Live Tests */}
              {liveData.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-gray-500">
                    Live Tests
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {liveData.map((item, i) =>
                      renderTestCard(item, i, false, true)
                    )}
                  </div>
                </>
              )}
              {/* Upcoming Tests */}
              {upcomingData.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-gray-500">
                    Upcoming Tests
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {upcomingData.map((item, i) =>
                      renderTestCard(item, i, true)
                    )}
                  </div>
                </>
              )}
              {/* Previous Tests */}
              {previousData.length > 0 && (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-gray-500">
                    Previous Tests
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {previousData.map((item, i) => renderTestCard(item, i))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
