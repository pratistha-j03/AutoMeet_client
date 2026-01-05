import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMeeting, transcribeMeeting, generateSummary } from '../api';

const MeetingView = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch data on load
  const refreshData = async () => {
    try {
      const res = await getMeeting(id);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load meeting.');
    }
  };

  useEffect(() => { refreshData(); }, [id]);

  // Handler for Transcription
  const handleTranscribe = async () => {
    setLoading(true);
    try {
      await transcribeMeeting(id);
      await refreshData(); // Reload to see the new text
    } catch (err) {
      alert("Transcription failed.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for Summarization
  const handleSummarize = async () => {
    setLoading(true);
    try {
      await generateSummary(id);
      await refreshData(); // Reload to see the summary
    } catch (err) {
      if(err.response?.status === 429) {
        alert("AI is busy (Rate Limit). Please wait 30s.");
      } else {
        alert("Summary failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="container">
      <header>
        <h1>Meeting Dashboard</h1>
        <p>ID: {id}</p>
      </header>

      {/* PHASE 1: TRANSCRIPTION */}
      <section className="card">
        <h2>1. Audio Transcription</h2>
        {data.responseData.transcript ? (
          <div className="text-box">
            <strong>Raw Text:</strong>
            <p>{data.responseData.transcript.substring(0, 500)}...</p> 
            <small>(Showing first 500 chars)</small>
          </div>
        ) : (
          <div className="action-area">
            <p>No transcript found.</p>
            <button onClick={handleTranscribe} disabled={loading}>
              {loading ? 'Processing...' : 'Start Transcription'}
            </button>
          </div>
        )}
      </section>

      {/* PHASE 2: SUMMARY (Only show if transcript exists) */}
      {data.transcript && (
        <section className="card">
          <h2>2. AI Intelligence</h2>
          {data.summary ? (
            <div className="summary-box">
              <h3>Summary</h3>
              <p>{data.summary.summaryText}</p>
              
              <h3>Action Items</h3>
              <ul>
                {data.summary.actionItems.map((item, i) => (
                  <li key={i}>
                    <strong>{item.owner}</strong>: {item.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="action-area">
              <p>Transcript ready. Generate insights?</p>
              <button onClick={handleSummarize} disabled={loading} className="btn-primary">
                {loading ? 'Analyzing...' : 'Generate Summary'}
              </button>
            </div>
          )}
        </section>
      )}
      
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default MeetingView;