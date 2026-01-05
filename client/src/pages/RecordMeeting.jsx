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
    <div className="card" style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd' }}>
      <h2>🔴 Record Meeting</h2>
      <p>Share a browser tab to capture its audio.</p>
      
      {!isRecording ? (
        <button onClick={startRecording} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Start Recording
        </button>
      ) : (
        <button onClick={stopRecording} style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#e74c3c', color: 'white' }}>
          Stop & Save
        </button>
      )}
    </div>
  );
};

export default RecordMeeting;