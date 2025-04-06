'use client';

import { useState } from 'react';

export default function Navigation({ onCategoryChange }) {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = [
    'All',
    'Basketball',
    'Football',
    'Tennis',
    'Baseball',
    'Soccer',
    'Golf',
    'Gymnastics',
    'Track & Field'
  ];
  
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    onCategoryChange(category);
  };
  
  return (
    <nav className="w-full overflow-x-auto py-3 px-2 bg-black/80 backdrop-blur-md border-b border-gray-800 shadow-lg z-20">
      <div className="flex space-x-2 min-w-max px-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={
              activeCategory === category
                ? "px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all bg-white text-black shadow-md"
                : "px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all bg-gray-800/50 text-white hover:bg-gray-700"
            }
          >
            {category}
          </button>
        ))}
      </div>
    </nav>
  );
}