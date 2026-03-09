import React, { useState } from 'react';
import { processMeeting, uploadMeeting } from '../api'; 
import { useNavigate } from 'react-router-dom';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(''); 
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('audio', file); 
    formData.append('title', title || file.name); 

    try {
      const res = await uploadMeeting(formData);
      
      // Ensure we actually have an ID before navigating
      if (res.data && res.data.meetingId) {
        await processMeeting(res.data.meetingId);
        navigate(`/meeting/${res.data.meetingId}`);
      } else {
        throw new Error("No meeting ID returned from server");
      }

    } catch (err) {
      console.error("Upload Failed Details:", err); 
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl mb-4">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Upload Recording</h1>
        <p className="text-slate-400 text-sm">Upload your meeting audio or video file for analysis</p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
            Meeting Title <span className="text-slate-500">(Optional)</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Q1 Strategy Meeting"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* File Input */}
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-slate-300 mb-2">
            Audio File
          </label>
          <input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="audio/*"
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 file:cursor-pointer cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload & Start
            </>
          )}
        </button>
      </div>

      {/* Info Section */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="flex items-start gap-3 text-left">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-slate-300 text-sm font-medium mb-1">Processing Info</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Your file will be transcribed and analyzed to generate meeting summaries and action items automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;