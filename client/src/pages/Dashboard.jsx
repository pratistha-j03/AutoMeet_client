import React from 'react';
import { useNavigate } from 'react-router-dom';
import Upload from './UploadView';
import RecordMeeting from './RecordMeeting';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login'); 
  };

  return (
    <div className="container">
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 40px', 
        borderBottom: '1px solid #ddd' 
      }}>
        <h2>AutoMeet Dashboard</h2>
        <button 
          onClick={handleLogout} 
          style={{ 
            color: 'red', 
            border: 'none', 
            padding: '8px 16px', 
            cursor: 'pointer', 
            borderRadius: '4px',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </header>

      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '50px' }}>
        <Upload />
        <RecordMeeting />
      </div>
    </div>
  );
};

export default Dashboard;