import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { decryptData } from "../utils/secureStorage";
import Layout from "../UI/layout";
import { toast } from "react-toastify";
const baseUrl = import.meta.env.VITE_BASE_URL;

export default function FeedbackModal({ onClose }) {
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Please enter feedback before submitting.");
      return;
    }

    const user = decryptData(localStorage.getItem("user"));

    const formData = new FormData();
    formData.append("action", "insert_feedback");
    formData.append("feedback", feedback);
    formData.append("user_id", user.id);

    try {
      const response = await axios.post(baseUrl, formData);
      console.log("Response:", response.data);
      toast.success("Feedback submitted successfully!");

      setFeedback("");
      if (onClose) onClose(); // hide modal if needed
      navigate("/home-screen"); // go to home
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate("/home-screen");
  };

  return (
    <div>
      <Layout />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-orange-100 via-yellow-100 to-cyan-100 backdrop-blur-sm">
        <div className="bg-white/90 w-full max-w-md mx-4 rounded-2xl shadow-2xl border border-orange-200 animate-fade-in relative">
          {/* Decorative Icon */}
          <div className="flex justify-center -mt-10">
            <div className="bg-orange-100 rounded-full p-4 shadow-lg border-4 border-white -mb-4">
              <span className="text-4xl">📝</span>
            </div>
          </div>
          {/* Header */}
          <div className="border-b px-6 pt-8 pb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-orange-600 flex items-center gap-2">
              Share Your Feedback
            </h2>
            <button
              onClick={onClose ? onClose : () => navigate("/home-screen")}
              className="text-gray-400 hover:text-orange-500 text-3xl font-bold transition-colors"
              aria-label="Close feedback modal"
            >
              &times;
            </button>
          </div>
          {/* Body */}
          <div className="p-6">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="We'd love to hear your thoughts!"
              className="w-full h-32 border border-orange-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-orange-50/60 text-gray-800 resize-none shadow-inner"
            />
          </div>
          {/* Footer */}
          <div className="border-t px-6 py-4 flex justify-end space-x-2 bg-orange-50/40 rounded-b-2xl">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white rounded-lg font-semibold shadow-md transition-all duration-200"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
