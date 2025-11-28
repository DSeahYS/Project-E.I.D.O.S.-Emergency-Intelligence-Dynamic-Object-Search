import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import VideoWorkspace from './pages/VideoWorkspace';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-primary text-primary flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/video" element={<VideoWorkspace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
