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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/30 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AutoMeet Dashboard</h2>
                <p className="text-xs text-slate-400">Manage your meetings</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg transition-all font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Welcome Back</h1>
          <p className="text-slate-400">Choose how you'd like to capture your meeting</p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Upload />
          <RecordMeeting />
        </div>

        {/* Quick Stats or Info Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 text-center">
            <div className="text-3xl font-bold text-white mb-1">0</div>
            <div className="text-slate-400 text-sm">Meetings Processed</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 text-center">
            <div className="text-3xl font-bold text-white mb-1">0</div>
            <div className="text-slate-400 text-sm">Action Items</div>
          </div>
          <div className="bg-slate-800/30 backdrop-blur-xl rounded-xl border border-slate-700/50 p-6 text-center">
            <div className="text-3xl font-bold text-white mb-1">0</div>
            <div className="text-slate-400 text-sm">Hours Saved</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;