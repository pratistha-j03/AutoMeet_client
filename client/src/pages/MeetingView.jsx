import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMeeting, getMeetingStatus } from '../api';

const STATUS_LABELS = {
  queued:       { text: 'Queued for processing',   color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   dot: 'bg-amber-400' },
  transcribing: { text: 'Transcribing audio',      color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',     dot: 'bg-blue-400' },
  summarizing:  { text: 'Generating summary',      color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20', dot: 'bg-violet-400' },
  completed:    { text: 'Processing complete',      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  failed:       { text: 'Processing failed',        color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',       dot: 'bg-red-400' },
};
const IconTranscript = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const IconSummary = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const IconActions = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const IconDecision = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconBack = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const IconClock = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconUser = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Spinner = ({ className = "h-4 w-4 text-blue-400" }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const SectionCard = ({ icon, title, badge, children, accent = 'blue' }) => {
  const accents = {
    blue:   'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
    violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400',
    emerald:'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
  };
  const iconBg = {
    blue:   'bg-blue-500/15 text-blue-400',
    violet: 'bg-violet-500/15 text-violet-400',
    emerald:'bg-emerald-500/15 text-emerald-400',
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
      {/* Card Header */}
      <div className={`px-6 py-4 bg-gradient-to-r ${accents[accent]} border-b border-slate-700/40 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-7 h-7 rounded-lg ${iconBg[accent]}`}>
            {icon}
          </div>
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">{title}</h2>
        </div>
        {badge && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-slate-700/60 ${iconBg[accent]}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

// ── Skeleton Loader ───────────────────────────────────────────────────────────
const SkeletonLine = ({ width = 'w-full', height = 'h-3' }) => (
  <div className={`${width} ${height} bg-slate-700/50 rounded-full animate-pulse`} />
);

const TranscriptSkeleton = () => (
  <div className="space-y-3">
    <SkeletonLine />
    <SkeletonLine width="w-5/6" />
    <SkeletonLine />
    <SkeletonLine width="w-4/6" />
    <SkeletonLine />
    <SkeletonLine width="w-3/4" />
  </div>
);

const SummarySkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <SkeletonLine />
      <SkeletonLine width="w-5/6" />
      <SkeletonLine width="w-4/5" />
    </div>
    <div className="pt-2 space-y-2">
      <SkeletonLine width="w-1/4" height="h-2.5" />
      <SkeletonLine width="w-3/4" />
      <SkeletonLine width="w-2/3" />
    </div>
  </div>
);

const MeetingView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [error, setError] = useState('');
  const [showFullTranscript, setShowFullTranscript] = useState(false);
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
        setError(res.data.error || 'Processing failed');
        clearInterval(pollRef.current);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchMeeting();
    pollRef.current = setInterval(pollStatus, 4000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  const isProcessing = jobStatus && !['completed', 'failed'].includes(jobStatus);
  const statusInfo = STATUS_LABELS[jobStatus] || null;
  const meeting = data?.responseData;
  const transcript = meeting?.transcript;
  const summary = meeting?.summary;
  const actionItems = summary?.actionItems || [];
  const decisions = summary?.decisions || [];

  // Format date
  const formattedDate = meeting?.createdAt
    ? new Date(meeting.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  if (!data) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-8 w-8 text-blue-400" />
        <p className="text-slate-400 text-sm">Loading meeting...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <header className="bg-slate-800/30 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg shadow-blue-500/20">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">AutoMeet</span>
            </div>

            <div className="w-px h-5 bg-slate-700" />

            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <IconBack />
              Dashboard
            </button>
          </div>

          {/* Status pill */}
          {statusInfo && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
              {isProcessing ? (
                <Spinner className="h-3 w-3" />
              ) : (
                <span className={`w-2 h-2 rounded-full ${statusInfo.dot} ${jobStatus === 'completed' ? '' : 'animate-pulse'}`} />
              )}
              {statusInfo.text}
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative max-w-5xl mx-auto px-6 py-10">

        <div className="mb-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
                {meeting?.title || 'Untitled Meeting'}
              </h1>
              <div className="flex items-center gap-4 text-slate-500 text-sm">
                {formattedDate && (
                  <span className="flex items-center gap-1.5">
                    <IconClock />
                    {formattedDate}
                  </span>
                )}
                <span className="flex items-center gap-1.5 font-mono text-xs bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded">
                  {id}
                </span>
              </div>
            </div>

            {/* Status badge — large */}
            <div className={`hidden md:flex flex-col items-center justify-center px-5 py-3 rounded-xl border ${
              jobStatus === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20' :
              jobStatus === 'failed'    ? 'bg-red-500/10 border-red-500/20' :
              jobStatus                 ? 'bg-blue-500/10 border-blue-500/20' :
                                          'bg-slate-800/60 border-slate-700/50'
            }`}>
              <span className={`text-xs uppercase tracking-widest font-semibold ${statusInfo?.color || 'text-slate-500'}`}>
                Status
              </span>
              <span className={`text-sm font-bold mt-0.5 ${statusInfo?.color || 'text-slate-400'}`}>
                {meeting?.status || 'uploaded'}
              </span>
            </div>
          </div>

          {/* Progress Steps */}
          {isProcessing && (
            <div className="mt-6 flex items-center gap-2">
              {['queued', 'transcribing', 'summarizing', 'completed'].map((step, i) => {
                const steps = ['queued', 'transcribing', 'summarizing', 'completed'];
                const currentIdx = steps.indexOf(jobStatus);
                const stepIdx = steps.indexOf(step);
                const isDone = stepIdx < currentIdx;
                const isActive = step === jobStatus;

                return (
                  <React.Fragment key={step}>
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                      isDone   ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                      isActive ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                                 'bg-slate-800/60 text-slate-600 border border-slate-700/40'
                    }`}>
                      {isDone && <span>✓</span>}
                      {isActive && <Spinner className="h-2.5 w-2.5" />}
                      <span className="capitalize">{step}</span>
                    </div>
                    {i < 3 && <div className={`flex-1 h-px max-w-8 ${isDone ? 'bg-emerald-500/40' : 'bg-slate-700/50'}`} />}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Grid Layout ── */}
        <div className="space-y-6">

          {/* Transcript */}
          <SectionCard
            icon={<IconTranscript />}
            title="Transcript"
            badge={transcript ? `${transcript.length.toLocaleString()} chars` : null}
            accent="blue"
          >
            {transcript ? (
              <div>
                <p className="text-slate-300 text-sm leading-7 font-mono bg-slate-900/40 rounded-xl p-4 border border-slate-700/30">
                  {showFullTranscript ? transcript : transcript.substring(0, 600)}
                  {!showFullTranscript && transcript.length > 600 && (
                    <span className="text-slate-500">...</span>
                  )}
                </p>
                {transcript.length > 600 && (
                  <button
                    onClick={() => setShowFullTranscript(!showFullTranscript)}
                    className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
                  >
                    {showFullTranscript ? '↑ Show less' : `↓ Show full transcript (${(transcript.length / 1000).toFixed(1)}k chars)`}
                  </button>
                )}
              </div>
            ) : (
              isProcessing ? <TranscriptSkeleton /> : (
                <p className="text-slate-500 text-sm">No transcript available.</p>
              )
            )}
          </SectionCard>

          {/* Summary + Decisions + Actions  */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Summary */}
            <SectionCard icon={<IconSummary />} title="Summary" accent="violet">
              {summary?.summaryText ? (
                <p className="text-slate-300 text-sm leading-7">
                  {summary.summaryText}
                </p>
              ) : (
                isProcessing
                  ? <SummarySkeleton />
                  : <p className="text-slate-500 text-sm">Summary will appear here once processing completes.</p>
              )}
            </SectionCard>

            {/* Decisions */}
            <SectionCard
              icon={<IconDecision />}
              title="Decisions"
              badge={decisions.length > 0 ? `${decisions.length}` : null}
              accent="emerald"
            >
              {decisions.length > 0 ? (
                <ul className="space-y-2.5">
                  {decisions.map((d, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold">
                        {i + 1}
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
              ) : (
                isProcessing
                  ? <SummarySkeleton />
                  : <p className="text-slate-500 text-sm">No decisions extracted yet.</p>
              )}
            </SectionCard>
          </div>

          {/* Action Items  */}
          <SectionCard
            icon={<IconActions />}
            title="Action Items"
            badge={actionItems.length > 0 ? `${actionItems.length} tasks` : null}
            accent="blue"
          >
            {actionItems.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {actionItems.map((item, i) => (
                  <div
                    key={i}
                    className="group bg-slate-900/40 hover:bg-slate-900/60 border border-slate-700/40 hover:border-slate-600/60 rounded-xl p-4 transition-all"
                  >
                    {/* Task number + description */}
                    <div className="flex items-start gap-3 mb-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 text-xs font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-slate-200 text-sm leading-relaxed">{item.description}</p>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {item.owner && item.owner !== 'N/A' && (
                        <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/40">
                          <IconUser />
                          {item.owner}
                        </span>
                      )}
                      {item.deadline && item.deadline !== 'N/A' && (
                        <span className="flex items-center gap-1.5 text-xs text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          <IconClock />
                          {item.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              isProcessing
                ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/30 space-y-3">
                        <SkeletonLine width="w-full" height="h-3" />
                        <SkeletonLine width="w-3/4" height="h-3" />
                        <div className="flex gap-2">
                          <SkeletonLine width="w-20" height="h-5" />
                          <SkeletonLine width="w-24" height="h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )
                : <p className="text-slate-500 text-sm">No action items extracted yet.</p>
            )}
          </SectionCard>
        </div>

        {error && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-red-400 text-sm font-medium">Processing Error</p>
              <p className="text-red-400/70 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div className="h-16" />
      </main>
    </div>
  );
};

export default MeetingView;
