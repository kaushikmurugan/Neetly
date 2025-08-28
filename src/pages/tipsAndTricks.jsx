import React from "react";
import Layout from "../UI/layout";

const tips = [
  {
    title: "✅ Preparation of Notes",
    image: "https://dnmm4pf2kwgss.cloudfront.net/Tips_Tricks/Notes.webp",
    points: [
      "Preparation of notes during reading will improve your memory skill and help with last-minute revisions.",
      "Notes may be in the form of points, charts, concept maps, tables, definitions for key words, etc.",
      "Use flash cards also for this purpose.",
    ],
  },
  {
    title: "✅ Hard Topics",
    image: "https://dnmm4pf2kwgss.cloudfront.net/Tips_Tricks/Hard_topics.webp",
    points: ["Use resources like websites and YouTube for topics you find difficult."],
  },
  {
    title: "✅ Preparation of Flow Charts",
    image: "https://dnmm4pf2kwgss.cloudfront.net/Tips_Tricks/Flow_charts.webp",
    points: ["Visual flowcharts are easy to understand and memorize."],
  },
  {
    title: "✅ Mnemonics",
    image: "https://dnmm4pf2kwgss.cloudfront.net/Tips_Tricks/Mnemonics.webp",
    points: [
      "To memorize hard topics and processes in order, use mnemonics that stay longer in your memory.",
      "Example: FON (Fluorine, Oxygen, Nitrogen) – elements of hydrogen bonding.",
    ],
  },
  {
    title: "✅ Preparation of Flash Cards",
    image: "https://dnmm4pf2kwgss.cloudfront.net/Tips_Tricks/Flash_cards.webp",
    points: [
      "For last-minute revision, prepare flash cards with important points, keywords, definitions, and formulas.",
    ],
  },
  {
    title: "✅ To Avoid Tension",
    image: "https://dnmm4pf2kwgss.cloudfront.net/Tips_Tricks/Tension.webp",
    points: ["Keep all notes and materials handy to avoid last-minute tension."],
  },
  {
    title: "✅ Preparation of Tables",
    image: "https://dnmm4pf2kwgss.cloudfront.net/Tips_Tricks/Tables.webp",
    points: ["Prepare unambiguous tables to help understand entire lessons clearly."],
  },
  {
    title: "✅ To Avoid Confusion",
    image: "https://dnmm4pf2kwgss.cloudfront.net/Tips_Tricks/Confusion.webp",
    points: [
      "Avoid referring to multiple books at the last minute. Stick to your textbooks for clarity.",
    ],
  },
  {
    title: "✅ To Keep in Memory",
    image: "https://dnmm4pf2kwgss.cloudfront.net/Tips_Tricks/Memory.webp",
    points: ["Relate applications to current situations to improve memory retention."],
  },
];

export default function TipsAndTricks() {
  return (
    <div>
      <Layout/>
      <div className="bg-gradient-to-br from-gray-200 to-gray-300 pt-8">
        <div>
          <h2 className="text-4xl font-bold text-center">Tips and Tricks</h2>
        </div>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 ">
        {tips.map((tip, index) => (
          <div key={index} className=" p-4 rounded-4xl shadow-md" style={{ backgroundColor: '#FFF9BF' }}>
            <h2 className="text-xl font-semibold text-green-700 mb-3">{tip.title}</h2>
            <div className="flex justify-center mb-4">
              <img src={tip.image} alt={tip.title} className="w-[300px] h-[150px] object-cover" />
            </div>
            <ul className="list-disc pl-5 text-blue-700 space-y-2">
              {tip.points.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
        <hr className="my-8 border-gray-400" />
      </div>
      </div>
    </div>
  );
}
