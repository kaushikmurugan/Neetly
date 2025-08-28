import { useState } from "react";
import { Menu, X, Home, BookOpen, Target, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import NeetIcon from "../assets/neet_icon.png";
import logo from "../assets/app_logo.png"; // Ensure this path is correct

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      title: "Home",
      icon: <Home className="w-5 h-5" />,
      navigate: "/home-screen",
    },
    {
      title: "Mock Test",
      icon: <BookOpen className="w-5 h-5" />,
      navigate: "/test-category",
    },
    {
      title: "Practice",
      icon: <Target className="w-5 h-5" />,
      navigate: "/practice",
    },
    {
      title: "Profile",
      icon: <User className="w-5 h-5" />,
      navigate: "/profile",
    },
  ];

  const safeNavigate = (path) => {
    if (location.pathname !== path) {
      navigate(path, { replace: true });
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-9 h-9 rounded-md" />
          <span className="text-xl font-bold text-gray-800">Neetly</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => safeNavigate(item.navigate)}
              className={`flex items-center gap-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition cursor-pointer ${
                location.pathname === item.navigate
                  ? "bg-indigo-50 text-indigo-600"
                  : ""
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.title}</span>
            </div>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md border-t">
          <div className="flex flex-col px-6 py-4 space-y-3">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  safeNavigate(item.navigate);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition cursor-pointer ${
                  location.pathname === item.navigate
                    ? "bg-indigo-50 text-indigo-600"
                    : ""
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
