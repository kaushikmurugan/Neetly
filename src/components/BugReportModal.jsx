import React, { useEffect, useState } from "react";
import axios from "axios";
import { decryptData } from "../utils/secureStorage";
import { toast } from "react-toastify";
const baseUrl = import.meta.env.VITE_BASE_URL;

export default function BugReportModal({
  value,
  isOpen,
  onClose,
  questionId,
  testId,
}) {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [photo, setPhoto] = useState(null);
  const [bugReportData, setBugReportData] = useState(null);

  useEffect(() => {
    if (value) {
      setBugReportData(value);
    }
  }, [value]);
  const [formData, setFormData] = useState({
    bookTitle: "",
    authorName: "",
    publisherName: "",
    publicationYear: "",
    editionNumber: "",
    pageNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedReason) {
      toast.error("Please select a reason for the bug.");
      return;
    }

    const user = decryptData(localStorage.getItem("user"));
    console.log("Decrypted user:", user);

    if (!user) {
      toast.error("User not found. Please log in again.");
      return;
    }

    const {
      bookTitle,
      authorName,
      publisherName,
      publicationYear,
      editionNumber,
      pageNumber,
    } = formData;

    const data = new FormData();
    data.append("action", "report_question_detail");
    data.append("user_id", user.id);
    data.append("name", user.name);
    data.append("mobile", user.mobile);
    // data.append('androidid', 'web');

    data.append("test_id", testId);
    data.append("ques_id", questionId);
    data.append("rmid", selectedReason);

    data.append("reason", selectedReason === "5" ? otherReason : "");
    data.append("book_title", bookTitle);
    data.append("author_name", authorName);
    data.append("publisher_name", publisherName);
    data.append("year_of_publication", publicationYear);
    data.append("edition_no", editionNumber);
    data.append("page_no", pageNumber);

    if (photo) {
      data.append("reportimg", photo);
    }

    console.log("Submitting Bug Report FormData:");
    for (let pair of data.entries()) {
      console.log(pair[0], ":", pair[1]);
    }

    try {
      setIsSubmitting(true);
      const res = await axios.post(`${baseUrl}`, data);
      console.log("Bug submission response:", res.data);
      toast.success("Bug report submitted successfully!");

      // Reset form
      setFormData({
        bookTitle: "",
        authorName: "",
        publisherName: "",
        publicationYear: "",
        editionNumber: "",
        pageNumber: "",
      });
      setSelectedReason("");
      setPhoto(null);
      onClose();
    } catch (error) {
      console.error("Bug submission failed:", error);
      toast.error("Failed to submit bug report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      bookTitle: "",
      authorName: "",
      publisherName: "",
      publicationYear: "",
      editionNumber: "",
      pageNumber: "",
    });
    setSelectedReason("");
    setPhoto(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-orange-500">Report a Bug</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-6">
            <p className="font-medium mb-2">What's the issue?</p>
            <div className="space-y-2">
              {bugReportData &&
                bugReportData.map((item) => (
                  <label key={item.id} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="bugReason"
                      value={item.id}
                      checked={selectedReason === item.id}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="accent-indigo-600"
                      required
                    />
                    <span>{item.rname}</span>
                  </label>
                ))}
              <div>
                {selectedReason === "5" && (
                  <textarea
                    id="5"
                    name="others"
                    rows="3"
                    placeholder="Enter the Other issues"
                    value={otherReason} // bind to state
                    onChange={(e) => setOtherReason(e.target.value)} // update state
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 
               focus:outline-none focus:ring-2 focus:ring-indigo-400 
               resize-none shadow-sm text-gray-700 placeholder-orange-500 placeholder:italic"
                  ></textarea>
                )}
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            encType="multipart/form-data"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Book Title"
                name="bookTitle"
                value={formData.bookTitle}
                onChange={handleInputChange}
                placeholder="Enter Book Title"
              />
              <InputField
                label="Author Name"
                name="authorName"
                value={formData.authorName}
                onChange={handleInputChange}
                placeholder="Enter Author Name"
              />
              <InputField
                label="Publisher Name"
                name="publisherName"
                value={formData.publisherName}
                onChange={handleInputChange}
                placeholder="Enter Publisher Name"
              />
              <InputField
                label="Year Of Publication"
                name="publicationYear"
                value={formData.publicationYear}
                onChange={handleInputChange}
                placeholder="Enter Year Of Publication"
              />
              <InputField
                label="Edition Number"
                name="editionNumber"
                value={formData.editionNumber}
                onChange={handleInputChange}
                placeholder="Enter Edition Number"
              />
              <InputField
                label="Page Number"
                name="pageNumber"
                value={formData.pageNumber}
                onChange={handleInputChange}
                placeholder="Enter Page Number"
              />
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Upload Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="border border-gray-300 rounded px-3 py-2 bg-white"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-evenly space-x-3 py-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedReason}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                <span>Submit Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable input field component
function InputField({ label, name, value, placeholder, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-orange-500 placeholder:italic"
      />
    </div>
  );
}
