
import { useState, useEffect } from 'react';

import './App.css';
import Subjects from './Subjects.jsx';

function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(dark));
  }, [dark]);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <div className="h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Learning App</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800 text-white dark:from-gray-200 dark:to-gray-300 dark:text-gray-900 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => {
                console.log('Button clicked');
                setDark((d) => !d);
              }}
            >
              {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>
      </nav>

      <Subjects />
    </div>
  );
}

export default App
