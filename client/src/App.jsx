import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Upload from './pages/UploadView';
import MeetingView from './pages/MeetingView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/meeting/:id" element={<MeetingView />} />
      </Routes>
    </Router>
  );
}

export default App;