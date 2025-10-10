import { useState, useEffect } from "react";
import "./App.css";
import Subjects from "./Subjects.jsx";

const themes = [
  { name: 'Ocean', colors: { 100: 'oklch(0.9 0.05 240)', 500: 'oklch(0.55 0.15 240)', 900: 'oklch(0.2 0.1 240)' } },
  { name: 'Forest', colors: { 100: 'oklch(0.9 0.05 140)', 500: 'oklch(0.45 0.12 140)', 900: 'oklch(0.2 0.08 140)' } },
  { name: 'Sunset', colors: { 100: 'oklch(0.95 0.08 30)', 500: 'oklch(0.65 0.18 30)', 900: 'oklch(0.25 0.12 30)' } },
  { name: 'Lavender', colors: { 100: 'oklch(0.95 0.04 290)', 500: 'oklch(0.75 0.1 290)', 900: 'oklch(0.3 0.07 290)' } },
  { name: 'Coral', colors: { 100: 'oklch(0.95 0.08 20)', 500: 'oklch(0.7 0.2 20)', 900: 'oklch(0.25 0.15 20)' } },
  { name: 'Mint', colors: { 100: 'oklch(0.95 0.05 178)', 500: 'oklch(0.72 0.11 178)', 900: 'oklch(0.28 0.08 178)' } },
  { name: 'Amber', colors: { 100: 'oklch(0.95 0.08 70)', 500: 'oklch(0.76 0.19 70)', 900: 'oklch(0.3 0.13 70)' } },
  { name: 'Slate', colors: { 100: 'oklch(0.9 0.02 250)', 500: 'oklch(0.55 0.05 250)', 900: 'oklch(0.2 0.03 250)' } },
  { name: 'Rose', colors: { 100: 'oklch(0.95 0.1 15)', 500: 'oklch(0.64 0.25 15)', 900: 'oklch(0.25 0.18 15)' } },
  { name: 'Indigo', colors: { 100: 'oklch(0.9 0.08 275)', 500: 'oklch(0.58 0.23 275)', 900: 'oklch(0.22 0.15 275)' } },
];

function App() {
  // Load saved theme or default to dark
  const [darkMode, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && true);
  });

  // Load saved color theme or default to 0
  const [colorThemeIndex, setColorThemeIndex] = useState(() => {
    const saved = localStorage.getItem("colorTheme");
    return saved ? parseInt(saved) : 0;
  });

  // Save theme preference
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Save color theme preference
  useEffect(() => {
    localStorage.setItem("colorTheme", colorThemeIndex.toString());
  }, [colorThemeIndex]);

  // Apply color theme
  useEffect(() => {
    const root = document.documentElement;
    const theme = themes[colorThemeIndex];
    root.style.setProperty('--color-theme-100', theme.colors[100]);
    root.style.setProperty('--color-theme-500', theme.colors[500]);
    root.style.setProperty('--color-theme-900', theme.colors[900]);
  }, [colorThemeIndex]);

  // Apply dark class to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 h-16 bg-theme-100 dark:bg-theme-900 border-b border-gray-300 dark:border-gray-700">
        <h1 className="text-xl font-bold italic">
          <span className="text-theme-500">C</span>
          <span className="text-red-500">S</span>
          <span className="text-theme-500">E</span>
          <span className="text-red-500">a</span>
          <span className="text-theme-500">z</span>
          <span className="text-red-500">y</span>
        </h1>

        <div className="flex space-x-2">
          <button
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 text-white dark:from-gray-200 dark:to-gray-300 dark:text-gray-900 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => setDark((prev) => !prev)}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-theme-500 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={() => setColorThemeIndex((prev) => (prev + 1) % themes.length)}
          >
            🎨 {themes[colorThemeIndex].name}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full flex-1 overflow-auto pt-16">
        <Subjects />
      </main>
    </div>
  );
}

export default App;
