import React from 'react';
import MorphingAnimation from './components/MorphingAnimation';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black overflow-hidden flex flex-col">
      {/* Minimal Header */}
      <header className="p-8 flex justify-between items-center z-30">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.5em] font-black opacity-40">Formula 1</span>
          <span className="text-xl font-bold tracking-tighter">MERCEDES</span>
        </div>
        <div className="hidden md:flex gap-8 text-[10px] uppercase tracking-widest font-bold opacity-40">
          <a href="https://www.linkedin.com/in/hsuanwu/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">LinkedIn</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center relative">
        <div className="w-full max-w-4xl px-2 sm:px-6">
          <MorphingAnimation />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 flex justify-between items-center text-[9px] uppercase tracking-[0.2em] font-bold opacity-20 z-30">
        <span>© Yi-Hsuan Wu</span>
        <div className="flex gap-4">
          <span>Morphing Effect creating by Chakib Mazouni</span>
        </div>
      </footer>
    </div>
  );
}
