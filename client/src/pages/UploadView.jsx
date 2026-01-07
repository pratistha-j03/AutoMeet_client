import React, { useState } from 'react';
import { uploadMeeting } from '../api'; 
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
    <div className="container center">
      <h1>AutoMeet Upload</h1>
      
      {/* Title Input */}
      <div style={{ marginBottom: '15px' }}>
        <input 
          type="text" 
          placeholder="Meeting Title (Optional)" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: '8px', width: '300px' }}
        />
      </div>

      {/* File Input */}
      <div style={{ marginBottom: '15px' }}>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          accept="audio/*" 
        />
      </div>

      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload & Start'}
      </button>
    </div>
  );
};

export default Upload;