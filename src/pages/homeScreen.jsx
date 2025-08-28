import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import tipsImage from "../assets/tips_1.png";
import mockTestImage from "../assets/mock_tests_1.png";
import practiceImage from "../assets/quiz.png";
import profileIcon from "../assets/update_profile_page_icon.png";
import bookmarkIcon from "../assets/un_bookmark.png";
import feedbackIcon from "../assets/feedback.png";
import policyIcon from "../assets/policy_icon.png";
import SideNavLogo from "../assets/nav_header.png";
import CloseImage from "../assets/clo_clo.png";
import TermsandConditionsIcon from "../assets/navi_term.png";
import logo from "../assets/app_logo.png";
import { decryptData } from "../utils/secureStorage";

export default function HomeScreen() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sidebar items
  const sidebarItems = [
    { label: "Profile", icon: profileIcon, path: "/profile" },
    { label: "Bookmark Questions", icon: bookmarkIcon, path: "/bookmark" },
    { label: "Feedback", icon: feedbackIcon, path: "/feedback" },
    {
      label: "Terms & Conditions",
      icon: TermsandConditionsIcon,
      path: "https://neetly.in/tems_contition.php",
    },
    {
      label: "Privacy Policy",
      icon: policyIcon,
      path: "https://neetly.in/privacy_policy.php",
    },
  ];

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    alert("Logged out!");
    navigate("/");
    setSidebarOpen(false);
  };

  // Card data for main area
  const cards = [
    {
      label: "Practice",
      image: practiceImage,
      path: "/practice",
      info: "Sharpen your skills with topic-wise practice questions and instant feedback.",
    },
    {
      label: "Mock Test",
      image: mockTestImage,
      path: "/test-category",
      info: "Experience the real exam conditions with full-length mock tests and get your score.",
    },
    {
      label: "Tips and Tricks",
      image: tipsImage,
      path: "/tips-and-tricks",
      info: "Boost your performance with expert tips, shortcuts, and exam strategies.",
    },
  ];

  // Greeting
  const hour = new Date().getHours();
  const greetingText =
    hour < 12
      ? "🌅 Good Morning"
      : hour < 16
      ? "🌤️ Good Afternoon"
      : hour < 22
      ? "🌇 Good Evening"
      : "🌃 Hello";

  const user = decryptData(localStorage.getItem("user"));
  console.log(user);

  const usersName = user && user.name ? user.name : "Learner";

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-gray-200 to-gray-300" />{" "}
      {/*from-indigo-600 via-purple-600 to-pink-600*/}
      {/* Subtle grid overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(white,transparent_70%)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>
      {/* Soft radial blobs */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl -z-10" />
      <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-fuchsia-300/20 blur-3xl -z-10" />
      {/* Top Navbar */}
      <header className="w-full fixed top-0 left-0 z-40">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 mt-3 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="Website Logo" className="w-10 h-10" />
            {/* <span className="text-xl font-extrabold text-white tracking-wide">
              Neetly
            </span> */}
          </div>

          {/* Center headline */}
          <div className="hidden text-gray-700 md:block text-center">
            <h4 className="text-2xl font-bold tracking-tight">Welcome</h4>
          </div>

          {/* Profile icon */}
          <button
            className="focus:outline-none hover:scale-105 transition"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <img
              src={profileIcon}
              alt="Profile"
              className="w-10 h-10 rounded-full ring-2 ring-white/40"
            />
          </button>
        </div>
      </header>
      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full bg-white/80 backdrop-blur-lg shadow-2xl border-l border-white/30 z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex">
          <div>
            <img src={SideNavLogo} alt="navbar icon" />
          </div>
          {/* Close */}
          <img
            src={CloseImage}
            alt="close image"
            className="absolute top-2 right-1 w-8 h-8 cursor-pointer "
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        </div>
        <div className="flex flex-col h-full pt-6">
          {/* Sidebar navigation */}
          <nav className="flex flex-col gap-2 px-4">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-white hover:text-black rounded-lg transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <img src={item.icon} alt={item.label} className="w-6 h-6" />
                <span className="text-base font-medium">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="mt-2 flex items-center gap-3 px-3 py-2 text-rose-700 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                />
              </svg>
              <span className="text-base font-medium">Logout</span>
            </button>
          </nav>
        </div>
      </aside>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main Content */}
      <main
        className={`relative flex-1 flex flex-col items-center text-center pt-30 px-4 transition-all duration-300 ${
          sidebarOpen ? "filter blur-[1px]" : ""
        }`}
      >
        {/* Hero */}
        <div className="max-w-5xl w-full mb-12 text-gray-700">
          <p className="inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-xl font-semibold ring-1 ring-white/30 bg-white/10">
            <span className="h-2 w-2 text rounded-full bg-emerald-300 animate-pulse" />
            {greetingText},<span className="text-pink-600">{usersName}</span>
          </p>
          <h1 className="mt-5 text-2xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-100 to-white drop-shadow">
            What do you want to do today ?
          </h1>
          <p className="mt-4 text-lg font-semibold">
            Start practicing, take a mock test, or learn smart shortcuts.
          </p>
        </div>

        {/* Cards */}

        <section className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {cards.map((card) => (
            <div
              key={card.label}
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 border border-gray-200 overflow-hidden hover:-translate-y-1"
            >
              {/* Banner Section */}
              <div className="relative h-28 bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center overflow-hidden">
                {/* Subtle diagonal pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.04)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.04)_50%,rgba(0,0,0,0.04)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />

                {/* Floating image card */}
                <div className="relative bg-white rounded-xl p-3 shadow-md group-hover:shadow-lg transition">
                  <img
                    src={card.image}
                    alt={card.label}
                    className="w-14 h-14 object-contain transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight group-hover:text-indigo-600 transition">
                  {card.label}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  <span className="px-3 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Curated
                  </span>
                  <span className="px-3 py-0.5 text-xs font-medium rounded-full bg-pink-50 text-pink-700 border border-pink-100">
                    Updated
                  </span>
                </div>

                {/* Info */}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {card.info}
                </p>

                {/* Button */}
                <button
                  className="mt-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium shadow-md hover:shadow-lg hover:bg-indigo-700 hover:cursor-pointer transition"
                  onClick={
                    card.label === "Privacy Policy" ||
                    card.label === "Terms and Conditions"
                      ? () => window.open(card.path) // opens in new tab
                      : () => navigate(card.path) // navigates inside React app
                  }
                >
                  Explore
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* CTA Buttons */}
        <div className="mt-12 mb-16 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => alert("Sharing coins feature coming soon!")}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold shadow-md transition hover:-translate-y-0.5"
          >
            🎁 Share App and Earn Coins
          </button>
          <button
            onClick={() => navigate("/feedback")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-md transition hover:-translate-y-0.5"
          >
            ✍️ Give Us Your Thoughts
          </button>
        </div>
      </main>
    </div>
  );
}
