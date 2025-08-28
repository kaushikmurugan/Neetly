import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import coinsImage from "../assets/more_coin.png";
import axios from "axios";
import {
  User,
  Loader2,
  Edit2,
  Phone,
  Mail,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { decryptData, encryptData } from "../utils/secureStorage";
import ProfileModal from "../components/ProfileModal";
import Layout from "../UI/layout";
const baseUrl = import.meta.env.VITE_BASE_URL;

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    state_name: "",
    city: "",
    profileImage: null,
  });

  const navigate = useNavigate();
  const user = decryptData(localStorage.getItem("user"));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("action", "check");
        formData.append("mobile", user.mobile);
        const res = await axios.post(baseUrl, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 10000,
        });

        setProfile(res.data[0]);
        setFormData(res.data[0]);
        setFormData({
          email: res.data[0].email,
          mobile: res.data[0].mobile,
          state_name: res.data[0].state_name || "",
          city: res.data[0].city || "",
          profileImage: res.data[0].photo || null,
        });
        if (res.data[0].photo) setPreview(res.data[0].photo);
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [editOpen]);

  if (loading) {
    return (
      <div>
        <Layout />
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Layout />
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 p-4">
        <div className="bg-white shadow-2xl rounded-3xl w-full max-w-3xl max-sm:p-2 p-10 relative">
          {/* Navigation Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition"
          >
            <ArrowLeft size={22} />
            <span className="hidden sm:inline">Back</span>
          </button>
          {/* Edit button */}
          <button
            onClick={() => setEditOpen(true)}
            className="absolute top-4 right-4 text-gray-500 hover:text-indigo-600 transition"
          >
            <Edit2 size={22} />
          </button>
          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-36 h-36 bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center rounded-full shadow-xl mb-4 overflow-hidden">
              {preview || profile?.photo ? (
                <img
                  src={preview || profile?.photo}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-20 h-20 text-white" />
              )}
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-1">
              {profile?.name || "User"}
            </h2>
            <p className="text-gray-500">User Profile</p>
          </div>
          {/* Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-semibold">
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
              <Phone className="w-6 h-6 text-green-600" />
              <span>{profile?.mobile}</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
              <Mail className="w-6 h-6 text-blue-600" />
              <span>{profile?.email}</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
              <MapPin className="w-6 h-6 text-purple-600" />
              <span>
                {profile?.city}, {profile?.state_name}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
              <img
                src={coinsImage}
                alt="coins image"
                className="w-8 h-8 text-yellow-500"
              />
              <span>{"Coming Soon . . ."}</span>
            </div>
          </div>
        </div>
        <ProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          userData={profile}
          onSuccess={(updated) => {
            setProfile(updated);
            localStorage.setItem("user", encryptData(updated[0]));
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }}
        />
      </div>
    </div>
  );
}
