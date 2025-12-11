import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatBot } from './components/ChatBot';
import { Home } from './pages/Home';
import { Requirements } from './pages/Requirements';
import { Apply } from './pages/Apply';
import { Status } from './pages/Status';
import { Admin } from './pages/Admin';
import { Exam } from './pages/Exam';
import { Interview } from './pages/Interview';
import { SuperAdmin } from './pages/SuperAdmin';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/requirements" element={<Requirements />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/status" element={<Status />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/super-admin" element={<SuperAdmin />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/interview" element={<Interview />} />
          </Routes>
        </main>
        <Footer />
        <ChatBot />
      </div>
    </Router>
  );
};

export default App;