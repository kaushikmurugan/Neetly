import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, ArrowRight } from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUnit } from "../redux/selectedTestSlice";
import Layout from "../UI/layout";
import { decryptData } from "../utils/secureStorage";
const baseUrl = import.meta.env.VITE_BASE_URL;

function Units() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedSubject } = useSelector((state) => state.selectedTest);
  console.log("selectedSubject:", selectedSubject);
  const user = decryptData(localStorage.getItem("user")); 


  useEffect(() => {
    const fetchUnits = async () => {
      if (!selectedSubject.id) return;

      const formData = new FormData();
      formData.append("action", "chapter");
      formData.append("user_id", user.id);
      formData.append("subject_id", selectedSubject.id);

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

        console.log("response:", response);
        console.log("response.data:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setUnits(response.data);
          // Try to get subject name from first unit if available
          if (response.data.length > 0 && response.data[0].subject_name) {
            setSubjectName(response.data[0].subject_name);
          }
        } else {
          console.warn("Unexpected response format:", response.data);
          setUnits([]);
        }
      } catch (error) {
        console.error("Failed to fetch units:", error);
        setUnits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [selectedSubject.id]);

  const handleUnitClick = (unit) => {
    const unitId = unit.id;
    const unitName = unit.name;
    dispatch(setSelectedUnit({ id: unitId, name: unitName }));
    navigate(`/practice/units/test`);
  };

  if (loading) {
    return (
      <div>
        <Layout />
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 -z-20 bg-gradient-to-br from-gray-300 to-gray-400" />
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/80 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-fuchsia-300/70 border-b-transparent rounded-full mx-auto animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold mb-2 drop-shadow">
              Loading Units
            </h3>
            <p className="text-fuchsia-100">
              Preparing your learning modules...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Layout />
      <div className="relative min-h-screen pb-16">
        {/* Background from-indigo-600 via-purple-600 to-pink-600 */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-gray-200 to-gray-300" />
        <div className="w-11/12 max-w-7xl mx-auto pt-8">
          {/* Header Section */}
          <div className="text-center mb-12 w-max mx-auto">
            <div className="bg-white backdrop-blur-md rounded-3xl shadow-2xl ring-1 ring-white/20 p-8 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold  mb-3 drop-shadow-lg">
                {selectedSubject.name}
              </h1>
              <p className="text-l text-gray-500 font-semibold max-w-2xl mx-auto">
                Select a unit to start practicing with our comprehensive
                question bank
              </p>
            </div>
          </div>

          {/* Units Grid - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {units.map((unit) => (
              <div
                key={unit.id}
                onClick={() => handleUnitClick(unit)}
                className="group cursor-pointer transform hover:scale-[1.02] transition-all duration-500"
              >
                <div className="bg-white rounded-3xl p-4 shadow-xl text-gray-800 relative overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 h-full flex flex-col justify-between backdrop-blur-sm">
                  <div className="absolute inset-0  opacity-60"></div>
                  <div
                    className={`rounded-3xl h-full w-full bg-white/85 p-6 text-gray-900 relative overflow-hidden border border-white/30 flex flex-col`}
                  >
                    {/* Glow */}
                    <div className="pointer-events-none absolute -top-24 right-[-4rem] h-64 w-64 rounded-full bg-fuchsia-300/30 blur-3xl" />
                    {/* Shine */}
                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute -top-1/2 -left-1/3 h-[200%] w-1/3 rotate-12 bg-gradient-to-b from-white/30 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex-grow">
                      <div className="mb-6">
                        <h3 className="text-l md:text-xl font-semibold mb-1 tracking-tight">
                          {unit.name}
                        </h3>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto relative z-10">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-500">Available</span>
                      </div>
                      <div className="flex items-center space-x-2 group-hover:translate-x-1 transition-transform duration-300">
                        <span className="text-sm font-semibold">
                          {unit.count} Test
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {units.length === 0 && (
            <div className="text-center mt-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 max-w-md mx-auto">
                <BookOpen className="w-16 h-16 text-white/80 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">
                  No Units Available
                </h3>
                <p className="text-fuchsia-100">
                  There are no units available for this subject at the moment.
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

export default Units;
