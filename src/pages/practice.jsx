import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import photo from "../assets/neet_choose.png";
import Physics11 from "../assets/choose_phy.png";
import Physics12 from "../assets/choose_pht.png";
import Chemistry11 from "../assets/coose_cho.png";
import Chemistry12 from "../assets/choose_cht.png";
import Biology11 from "../assets/coose_bio.png";
import Biology12 from "../assets/coose_bit.png";
import { useDispatch } from "react-redux";
import { setSelectedSubject } from "../redux/selectedTestSlice";
import { ArrowRight, BookOpen, Star, Target } from "lucide-react";
import Layout from "../UI/layout";
const baseUrl = import.meta.env.VITE_BASE_URL;

function Practice() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Enhanced subject configuration with different styling
  const subjectConfig = {
    "11th Physics": {
      icon: Physics11,
      gradient: "from-red-600 to-red-500",
    },
    "11th Chemistry": {
      icon: Chemistry11,
      gradient: "from-rose-600 to-rose-500 ",
    },
    "11th Biology": {
      icon: Biology11,
      gradient: "from-green-800  to-green-600",
    },
    "12th Physics": {
      icon: Physics12,
      gradient: "from-purple-900 to-purple-700",
    },
    "12th Chemistry": {
      icon: Chemistry12,
      gradient: "from-orange-700 to-amber-600",
    },
    "12th Biology": {
      icon: Biology12,
      gradient: "from-cyan-700 to-teal-600",
    },
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      const formData = new FormData();
      formData.append("action", "subject");
      formData.append("course_id", "3");

      try {
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

        console.log("response:", response);
        console.log("response.data:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setSubjects(response.data);
        } else {
          console.warn("Unexpected response format:", response.data);
          setSubjects([]);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubjectClick = (subject) => {
    // Navigate to the units page for this subject
    const subjectId = subject.id;
    const subjectName = subject.name;
    console.log("subject:", subjectId, subjectName);

    dispatch(setSelectedSubject({ id: subjectId, name: subjectName }));
    navigate(`/practice/units`);
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-gray-200 to-gray-300" />
        <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(white,transparent_70%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-fuchsia-300/70 border-b-transparent rounded-full mx-auto animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2 drop-shadow">
            Loading Subjects
          </h3>
          <p className="text-fuchsia-100">Preparing your learning modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Layout />
      <div className="relative min-h-screen pb-16">
        {/* Background from-indigo-300 via-purple-600 to-pink-300*/}
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-gray-200 to-gray-300" />
        <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(white,transparent_70%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        {/* Hero Banner */}
        <div className="w-11/12 max-w-7xl mx-auto pt-8 mb-20">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-gray-900 via-indigo-900 to-black">
            {/* Background Image Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url(${photo})` }}
            ></div>
            {/* Decorative Gradient Glows */}
            <div className="absolute inset-0">
              <div className="absolute -top-12 -left-12 w-60 h-60 bg-indigo-500/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl"></div>
            </div>
            {/* Content Layout */}
            <div className="relative flex flex-col md:flex-row items-center md:items-center justify-between px-8 md:px-16 py-20 gap-12">
              {/* Left Section */}
              <div className="text-white max-w-xl">
                {/* Badge */}
                <p className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium bg-white/10 backdrop-blur-md ring-1 ring-white/20 mb-5">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                  Jump into Practice
                </p>
                {/* Heading */}
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-yellow-100 to-white drop-shadow-lg">
                  Choose Your Subject <br /> for{" "}
                  <span className="text-orange-300">NEET Prep</span>
                </h1>
                {/* Subtext */}
                <p className="mt-5 text-lg text-gray-200/90 leading-relaxed">
                  Master every topic with structured questions, curated content,
                  and progress tracking — built to help you succeed in NEET.
                </p>
              </div>
              {/* Right Feature Section */}
              <div className="flex flex-col space-y-5 w-full md:w-1/3">
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/10 backdrop-blur-md shadow-md hover:shadow-lg transition">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-white/90">
                    High-Quality Subject Content
                  </span>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/10 backdrop-blur-md shadow-md hover:shadow-lg transition">
                  <Target className="w-6 h-6 text-green-400" />
                  <span className="text-sm font-medium text-white/90">
                    NEET-Focused Practice Sets
                  </span>
                </div>
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/10 backdrop-blur-md shadow-md hover:shadow-lg transition">
                  <ArrowRight className="w-6 h-6 text-blue-400" />
                  <span className="text-sm font-medium text-white/90">
                    Track Progress & Improve
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Subjects Grid - Enhanced */}
        <div className="w-11/12 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-600 mb-3 drop-shadow">
              Available Subjects
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Select a subject to start practicing with our comprehensive
              question bank
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((subject) => {
                const config =
                  subjectConfig[subject.name] || subjectConfig["11th Physics"];
                const IconComponent = config.icon;
                return (
                  <div
                    key={subject.id}
                    onClick={() => handleSubjectClick(subject)}
                    className="group cursor-pointer transform hover:scale-[1.02] transition-all duration-500"
                  >
                    <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-white/40 via-fuchsia-300/40 to-pink-300/40 shadow-xl hover:shadow-2xl transition duration-300">
                      <div
                        className={`rounded-3xl h-full w-full bg-white/80 dark:bg-white/70 p-3 px-4 text-gray-900 relative overflow-hidden border border-white/20`}
                      >
                        {/* Glow blob */}
                        <div className="pointer-events-none absolute -top-24 right-[-4rem] h-64 w-64 rounded-full bg-fuchsia-300/30 blur-3xl" />
                        {/* Shine */}
                        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute -top-1/2 -left-1/3 h-[200%] w-1/3 rotate-12 bg-gradient-to-b from-white/30 to-transparent" />
                        </div>
                        {/* Content */}
                        <div
                          className={`relative z-10 rounded-2xl p-6 shadow-xl bg-gradient-to-r ${
                            subjectConfig[subject.name]?.gradient
                          } text-white hover:scale-105 transform transition-all duration-300`}
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="w-16 h-16 rounded-2xl p-4 flex items-center justify-center bg-white/20 shadow-lg backdrop-blur-md">
                              <img
                                src={subjectConfig[subject.name]?.icon}
                                className="w-8 h-8"
                                alt={`${subject.name} icon`}
                              />
                            </div>
                            <h3 className="text-2xl font-extrabold tracking-tight drop-shadow-lg">
                              {subject.name}
                            </h3>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium">
                                Available
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 group-hover:translate-x-1 transition-transform duration-300">
                              <span className="text-sm font-semibold">
                                {subject.count} chapters
                              </span>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          {/* Empty State */}
          {subjects.length === 0 && (
            <div className="text-center mt-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 max-w-md mx-auto">
                <BookOpen className="w-16 h-16 text-white/80 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  No Subjects Available
                </h3>
                <p className="text-fuchsia-100">
                  There are no subjects available at the moment. Please check
                  back later.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Practice;
