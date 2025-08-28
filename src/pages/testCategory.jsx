import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { decryptData } from "../utils/secureStorage";
import {
  BookOpen,
  FlaskConical,
  Atom,
  Brain,
  Star,
  ArrowRight,
} from "lucide-react";
import { setTestCategory } from "../redux/selectedTestSlice";
import { useDispatch } from "react-redux";
import Layout from "../UI/layout";
const baseUrl = import.meta.env.VITE_BASE_URL;

const categoryConfig = {
  Physics: { icon: Atom, gradient: "from-blue-500 via-blue-600 to-indigo-600" },
  Chemistry: {
    icon: FlaskConical,
    gradient: "from-pink-500 via-pink-600 to-rose-600",
  },
  Biology: {
    icon: Brain,
    gradient: "from-emerald-500 via-emerald-600 to-green-600",
  },
  Mock: {
    icon: Star,
    gradient: "from-yellow-400 via-yellow-500 to-orange-500",
  },
  Others: {
    icon: BookOpen,
    gradient: "from-gray-500 via-gray-600 to-gray-700",
  },
};

export default function TestCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Secure user check
  const user = decryptData(localStorage.getItem("user"));

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const formData = new FormData();
      formData.append("action", "get_test_category");
      formData.append("user_id", user.id);
      try {
        const response = await axios.post(
          baseUrl,
          formData
        );
        console.log("response.data:", response.data);

        // Assume response.data is an array of categories: [{id, name, ...}]
        setCategories(response.data || []);
      } catch (error) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Modern card click handler
  const handleCategoryClick = (category) => {
    // You can dispatch or navigate as needed
    dispatch(
      setTestCategory({
        id: category.category_id,
        name: category.name,
      })
    );
    navigate("/test-cards");
  };


  if (loading) {
    return (
      <div>
        <Layout />
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Layout />
      <div className="relative min-h-screen">
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-gray-200 to-gray-300" />
        <div className="max-w-5xl mx-auto pt-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
              Test Categories
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-10">
            {categories.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 text-lg">
                No categories found.
              </div>
            ) : (
              categories.map((cat, idx) => {
                const config =
                  categoryConfig[cat.name] || categoryConfig["Others"];
                const Icon = config.icon;
                return (
                  <div
                    key={cat.id || idx}
                    onClick={() => handleCategoryClick(cat)}
                    className="group relative cursor-pointer rounded-2xl bg-white/60 backdrop-blur-xl border border-gray-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden"
                  >
                    {/* Animated gradient background overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-700"></div>

                    {/* Glow border on hover */}
                    <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-indigo-400/50 transition-all duration-500"></div>

                    {/* Card Content */}
                    <div className="relative p-8 flex flex-col h-full justify-between items-center text-center">
                      {/* Floating Icon */}
                      <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                        <Icon className="w-10 h-10" />
                      </div>

                      {/* Category Name */}
                      <h3 className="mt-6 text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-500">
                        {cat.name}
                      </h3>

                      {/* Small description */}
                      <p className="mt-2 text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                        Explore tests and challenges in {cat.name}.
                      </p>

                      {/* Button */}
                      <div className="mt-6">
                        <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-indigo-500/50 hover:scale-105 transition-transform duration-300">
                          View Tests
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
