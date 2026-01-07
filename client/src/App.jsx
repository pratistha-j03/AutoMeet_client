import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Upload from './pages/UploadView';
import MeetingView from './pages/MeetingView';
import RecordMeeting from './pages/RecordMeeting';
import Login from './pages/Login';
import Register from './pages/Register';
import { Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
          }/>
        <Route path="/meeting/:id" element={ 
          <PrivateRoute>
            <MeetingView />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;