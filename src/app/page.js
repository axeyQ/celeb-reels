'use client';

import { useState } from 'react';
import ReelContainer from '../components/ReelContainer';
import Navigation from '../components/Navigation';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };
  
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <header className="w-full py-3 px-4 fixed top-0 z-30 bg-gradient-to-b from-black via-black/80 to-transparent">
        <h1 className="text-xl font-bold text-center">Sports Celebrity Reels</h1>
      </header>
      
      <div className="fixed top-12 left-0 right-0 z-20">
        <Navigation onCategoryChange={handleCategoryChange} />
      </div>
      
      {/* Main content - positioned to take full remaining screen */}
      <div className="absolute inset-0 pt-24 w-full h-full">
        <ReelContainer category={selectedCategory} />
      </div>
    </div>
  );
}