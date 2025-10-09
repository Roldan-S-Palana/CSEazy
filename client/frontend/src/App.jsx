import { useState, useEffect } from "react";
import "./App.css";
import Subjects from "./Subjects.jsx";

function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(dark));
  }, [dark]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-100 flex justify-between items-center px-6 h-16 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        <h1 className="left-20 text-xl font-bold">Nutty Pad</h1>

        <button
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 text-white dark:from-gray-200 dark:to-gray-300 dark:text-gray-900 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          onClick={() => setDark((prev) => !prev)}
        >
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </nav>

      {/* Main Content */}
      <main className="w-full flex-1 overflow-auto pt-16">
        <Subjects />
      </main>
    </div>
  );
}

export default App;
