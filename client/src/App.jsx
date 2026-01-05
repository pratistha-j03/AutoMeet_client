import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Upload from './pages/UploadView';
import MeetingView from './pages/MeetingView';
import RecordMeeting from './pages/RecordMeeting';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '50px' }}>
              {/* Option 1: Upload File */}
              <Upload />
              
              {/* Option 2: Record Live */}
              <RecordMeeting />
            </div>
          }/>
        <Route path="/meeting/:id" element={<MeetingView />} />
      </Routes>
    </Router>
  );
}

export default App;