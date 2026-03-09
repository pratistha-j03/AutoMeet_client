import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getMeeting, processMeeting} from '../api';

const STATUS_LABELS = {
  queued: { text: 'Queued for processing...', color: 'text-yellow-400' },
  transcribing: { text: 'Transcribing audio...', color: 'text-blue-400' },
  summarizing: { text: 'Generating summary...', color: 'text-purple-400' },
  completed: { text: 'Processing complete', color: 'text-green-400' },
  failed: { text: 'Processing failed', color: 'text-red-400' },
};

const MeetingView = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  const fetchMeeting = async () => {
    try {
      const res = await getMeeting(id);
      setData(res.data);
    } catch (err) {
      setError('Failed to load meeting.');
    }
  };

  const pollStatus = async () => {
    try {
      const res = await getMeetingStatus(id);
      const status = res.data.status;
      setJobStatus(status);

      if (status === 'completed') {
        await fetchMeeting();
        clearInterval(pollRef.current);
      } else if (status === 'failed') {
        setError(`Processing failed: ${res.data.error || 'Unknown error'}`);
        clearInterval(pollRef.current);
      }
    } catch (err) {
      // Job not found in Redis yet — still starting up, keep polling
    }
  };

  useEffect(() => {
    fetchMeeting();
    // polling status every 4 seconds
    pollRef.current = setInterval(pollStatus, 4000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  if (!data) return <div className="text-white text-center mt-20">Loading...</div>;
  const isProcessing = jobStatus && !['completed', 'failed'].includes(jobStatus);
  const statusInfo = STATUS_LABELS[jobStatus] || null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{data.responseData?.title || 'Meeting Dashboard'}</h1>
        <p className="text-slate-400 text-sm mt-1">ID: {id}</p>
      </header>

      {/* ── Live Status Banner ── */}
      {statusInfo && (
        <div className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-lg border ${jobStatus === 'completed' ? 'bg-green-500/10 border-green-500/30' :
            jobStatus === 'failed' ? 'bg-red-500/10 border-red-500/30' :
              'bg-blue-500/10 border-blue-500/30'
          }`}>
          {isProcessing && (
            <svg className="animate-spin h-4 w-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          <span className={`text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>
      )}

      {/* ── Transcript Section ── */}
      <section className="mb-6 bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-lg font-semibold mb-4">Transcript</h2>
        {data.responseData?.transcript ? (
          <div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {data.responseData.transcript.substring(0, 500)}...
            </p>
            <p className="text-slate-500 text-xs mt-2">Showing first 500 characters</p>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">
            {isProcessing ? 'Transcript will appear here when ready...' : 'No transcript available.'}
          </p>
        )}
      </section>

      {/* ── Summary Section ── */}
      <section className="mb-6 bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        {data.responseData?.summary ? (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              {data.responseData.summary.summaryText}
            </p>

            {data.responseData.summary.decisions?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Decisions</h3>
                <ul className="list-disc list-inside space-y-1">
                  {data.responseData.summary.decisions.map((d, i) => (
                    <li key={i} className="text-slate-400 text-sm">{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {data.responseData.summary.actionItems?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Action Items</h3>
                <ul className="space-y-2">
                  {data.responseData.summary.actionItems.map((item, i) => (
                    <li key={i} className="bg-slate-700/50 rounded-lg px-4 py-2 text-sm">
                      <span className="text-blue-400 font-medium">{item.owner}</span>
                      <span className="text-slate-300">: {item.description}</span>
                      {item.deadline && (
                        <span className="text-slate-500 ml-2">· {item.deadline}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">
            {isProcessing ? 'Summary will appear here when ready...' : 'No summary available.'}
          </p>
        )}
      </section>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default MeetingView;