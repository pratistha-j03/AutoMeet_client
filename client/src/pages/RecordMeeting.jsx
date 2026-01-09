import React, { useState, useRef } from 'react';
import { uploadMeeting } from '../api';
import { useNavigate } from 'react-router-dom';

const RecordMeeting = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const navigate = useNavigate();

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const startRecording = async () => {
    try {
      //Requesting tab access with audio
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true, 
        audio: true 
      });
      // Verifying user shared audio
      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length === 0) {
        alert("No audio detected. Please restart and ensure 'Share tab audio' is checked.");
        mediaStream.getTracks().forEach(t => t.stop());
        return;
      }
      const audioStream = new MediaStream([audioTracks[0]]);
      chunksRef.current = [];

      // Looking for Supported MimeType
      const mimeType = getSupportedMimeType();
      console.log(`Using MIME type: ${mimeType || 'default'}`);

      // Recorder with dynamic mimeType
      const options = mimeType ? { mimeType } : {};

      // Setup Recorder
      const recorder = new MediaRecorder(audioStream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        // Creating File from Blobs
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        const ext = mimeType.includes('mp4') ? 'm4a' : 'webm';
        const file = new File([blob], `recorded_meeting.${ext}`, { type: mimeType || 'audio/webm' });

        // Auto-Upload to Backend
        await handleUpload(file);
        
        // Cleanup tracks (stops the "Sharing this tab" banner)
        mediaStream.getTracks().forEach(track => track.stop());
        audioStream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);

    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); // This triggers 'onstop' above
      setIsRecording(false);
    }
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('title', `Live Recording ${new Date().toLocaleTimeString()}`);

    try {
      console.log("Uploading to Cloudinary...");
      const res = await uploadMeeting(formData);
      
      // Navigate to the Meeting Dashboard
      navigate(`/meeting/${res.data.meetingId}`);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload recording.");
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500/20 to-purple-500/20 rounded-xl mb-4 relative">
          {isRecording && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
          )}
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {isRecording ? '🔴 Recording in Progress' : 'Record Meeting'}
        </h2>
        <p className="text-slate-400 text-sm">
          {isRecording 
            ? 'Capturing audio from your browser tab'
            : 'Share a browser tab to capture its audio'
          }
        </p>
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 text-red-400">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording Active</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start Recording
        </button>
      ) : (
        <button
          onClick={stopRecording}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
          Stop & Save
        </button>
      )}

      {/* Info Section */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="flex items-start gap-3 text-left">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-slate-300 text-sm font-medium mb-1">How it works</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Click "Start Recording" and select a browser tab to share. Audio will be captured and automatically processed for summaries and action items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordMeeting;