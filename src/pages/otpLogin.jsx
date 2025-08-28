import React, { useState } from "react";
import image from "../assets/NloginImage.jpg";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { encryptData } from "../utils/secureStorage";
import { decryptData } from "../utils/secureStorage";
import ProfileModal from "../components/ProfileModal";
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;
const baseUrl = import.meta.env.VITE_BASE_URL;
console.log("SECRET_KEY:", SECRET_KEY);

// Mobile OTP Login Component
function MobileOtpLogin() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newUserData, setNewUserData] = useState(null);

  const navigate = useNavigate();
  const mobileRegex = /^[6-9]\d{9}$/;

  const handleSendOrSubmit = async (e) => {
    e.preventDefault();

    if (!otpSent) {
      if (!mobileRegex.test(mobile)) {
        const msg =
          "Please enter a valid 10-digit mobile number starting with 6-9.";
        setError(msg);
        toast.error(msg);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("action", "check");
        formData.append("mobile", mobile);
        formData.append("send_otp", "1");

        const response = await axios.post(
          baseUrl,
          formData
        );

        if (
          response.data &&
          (response.status === 200 || response.data.status === "success")
        ) {
          const msg = `OTP sent successfully to ${mobile}`;
          setMessage(msg);
          toast.success(msg);
          setOtpSent(true);
        } else {
          const msg = response.data.message || "Failed to send OTP.";
          setError(msg);
          toast.error(msg);
        }
      } catch (error) {
        const msg = "Failed to send OTP. Please try again.";
        setError(msg);
        toast.error(msg);
        console.error("OTP send error:", error);
      }
    } else {
      if (otp.trim().length === 0) {
        const msg = "Please enter the OTP.";
        setMessage(msg);
        toast.error(msg);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("action", "otp_verify");
        formData.append("mobile", mobile);
        formData.append("otp", otp);

        const response = await axios.post(
          baseUrl,
          formData
        );
        console.log("response:", response);

        const parsedData =
          typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;

        if (!Array.isArray(parsedData) || parsedData.length === 0) {
          const msg = "Invalid response from server.";
          setError(msg);
          toast.error(msg);
          return;
        }

        const user = parsedData[0];

        if (!user.name && user.status === "existing") {
          const msg = "Incomplete user data.";
          setError(msg);
          toast.error(msg);
          return;
        }

        if (user.status === "existing") {
          localStorage.setItem("user", encryptData(user));
          toast.success("OTP verified successfully!");
          navigate("/home-screen");
        } else if (user.status === "new") {
          setNewUserData(user); // store new user data for modal
          setShowProfileModal(true); // open modal instead of navigate
        } else {
          toast.warn("Unknown user status.");
        }
      } catch (error) {
        const msg = "OTP verification failed. Please try again.";
        setError(msg);
        toast.error(msg);
        console.error("OTP verify error:", error);
      }
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        OTP Login
      </h2>

      {(message || error) && (
        <div
          className={`mb-4 text-sm text-center font-medium rounded p-2 ${
            message
              ? "text-green-700 bg-green-50 border border-green-200"
              : "text-red-700 bg-red-50 border border-red-200"
          }`}
        >
          {message || error}
        </div>
      )}

      <form onSubmit={handleSendOrSubmit} className="space-y-5">
        {/* Mobile Input */}
        <div>
          <label
            htmlFor="mobile"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mobile Number
          </label>
          <input
            type="text"
            inputMode="tel"
            id="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Enter mobile number"
            required
            maxLength="10"
            disabled={otpSent}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        {/* OTP Input */}
        {otpSent && (
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter received OTP"
              maxLength="6"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        )}

        {/* Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-transform transform hover:scale-[1.02] active:scale-95"
        >
          {otpSent ? "Verify OTP" : "Send OTP"}
        </button>
      </form>

      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userData={newUserData}
          onSuccess={() => {
            setShowProfileModal(false);
            localStorage.setItem("user", encryptData(user));
            navigate("/home-screen"); // after profile update go home
          }}
        />
      )}
    </div>
  );
}

// Main Page with Split Layout
export default function HomePage() {
  const location = useLocation();
  const hour = new Date().getHours();
  let greetingText = "Hello";
  if (hour >= 1 && hour <= 11) {
    greetingText = "Good Morning";
  } else if (hour === 12) {
    greetingText = "Good Noon";
  } else if (hour >= 13 && hour <= 15) {
    greetingText = "Good Afternoon";
  } else if (hour >= 16 && hour <= 21) {
    greetingText = "Good Evening";
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Banner */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 relative items-center justify-center">
        <img
          src={image}
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 text-white text-center px-10">
          <h1 className="text-4xl font-extrabold mb-4 drop-shadow-lg">
            Welcome to Neetly
          </h1>
          <p className="text-lg opacity-90">
            Fast • Secure • Hassle-free OTP Login
          </p>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-gray-50 p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-800">Welcome</h1>
          <p className="text-md text-gray-500">{greetingText}</p>
        </div>
        <MobileOtpLogin />
      </div>
    </div>
  );
}
