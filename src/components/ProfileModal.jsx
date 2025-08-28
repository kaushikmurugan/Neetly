import React, { useState, useEffect } from "react";
import axios from "axios";
import { Upload } from "lucide-react";
import { toast } from "react-toastify";
const baseUrl = import.meta.env.VITE_BASE_URL;

export default function ProfileModal({ isOpen, onClose, userData, onSuccess }) {
  const [states, setStates] = useState([]);
  const [preview, setPreview] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    state: "",
    city: "",
    image: null,
  });

  // ✅ Load states
  useEffect(() => {
    const form = new URLSearchParams();
    form.append("action", "state");

    axios
      .post(baseUrl, form)
      .then((res) => {
        if (Array.isArray(res.data)) {
          const filtered = res.data.filter((item) => item.status === "Success");
          setStates(filtered);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch states:", err);
      });
  }, []);

  // ✅ Prefill user data
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        mobile: userData.mobile || "",
        state: userData.state || userData.state_id || "",
        city: userData.city || "",
        image: null,
      });

      if (userData.photo) {
        setPreview(userData.photo);
        setExistingPhoto(userData.photo); // keep old photo
      }
    }
  }, [userData]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, image: file });
      if (file) {
        setPreview(URL.createObjectURL(file));
        setExistingPhoto(null); // clear old if new uploaded
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Remove photo
  const handleRemoveImage = () => {
    setPreview(null);
    setFormData({ ...formData, image: null });
    setExistingPhoto(null);
  };

  // ✅ Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();

    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("mobile", formData.mobile);
    submitData.append("state", formData.state);
    submitData.append("city", formData.city);

    if (userData) {
      submitData.append("action", "registration");
      submitData.append("id", userData.id);
    } else {
      submitData.append("action", "registration");
    }

    // ✅ Handle image update
    if (formData.image) {
      submitData.append("photo", formData.image); // new upload
    } else if (existingPhoto) {
      submitData.append("local_photo_url", existingPhoto); // keep old photo
    }

    axios
      .post(baseUrl, submitData)
      .then((res) => {
        if (onSuccess) onSuccess(res.data);
        onClose();
        toast.success(
          userData?.status === "existing"
            ? "Profile updated successfully!"
            : "Registered successfully!"
        );
      })
      .catch(() => toast.error("Something went wrong!"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative">
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 text-gray-500 hover:text-gray-700 ${
            userData?.name ? "" : "hidden"
          }`}
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold text-center text-orange-600 mb-6">
          {userData?.status === "existing"
            ? "Update Profile"
            : "Register Profile"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:outline-none"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:outline-none"
            required
          />

          <input
            type="number"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            disabled
            className="w-full px-4 py-2 border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:outline-none"
          />

          <select
            name="state"
            value={formData.state || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-orange-300 rounded-md bg-white focus:ring-2 focus:ring-orange-300 focus:outline-none"
            required
          >
            <option value="">-- Select State --</option>
            {states.map((item) => (
              <option key={item.id} value={item.id}>
                {item.state || ""}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-300 focus:outline-none"
            required
          />

          {/* Upload + Preview */}
          <div className="space-y-6">
            <div className="p-6 border-2 border-dashed border-orange-500 rounded-xl text-center bg-orange-50 hover:border-black transition cursor-pointer">
              <label
                htmlFor="fileUpload"
                className="flex flex-col items-center gap-3 cursor-pointer text-black hover:text-orange-600"
              >
                <Upload className="w-10 h-10" />
                <span className="text-sm font-medium">
                  Click to Upload image
                </span>
              </label>
              <input
                id="fileUpload"
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </div>

            {preview && (
              <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-600">Preview</h3>
                <div className="w-28 h-28 overflow-hidden rounded-full border-2 border-orange-400 shadow">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-4 py-1.5 text-sm font-medium rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 hover:shadow-lg active:scale-95 transition"
                >
                  ✕ Remove Photo
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md transition duration-300"
          >
            {userData?.status === "existing" ? "Update" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
