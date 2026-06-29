import { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE = 'http://127.0.0.1:8000';

/* ─── SVG Icons ─── */
const Icons = {
  dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  ),
  workers: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  jobs: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
  resume: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  ),
  matching: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  ),
  roadmap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
  ),
  upload: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  ),
  check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  alert: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  ),
  mapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
  ),
  briefcase: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
  ),
  seed: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m7.8 16.2-2.9 2.9"/><path d="M6 12H2"/><path d="m7.8 7.8-2.9-2.9"/></svg>
  ),
  plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  arrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
  ),
  chevronRight: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  ),
  sparkles: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
  ),
  fileText: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
  ),
  zap: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  target: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  ),
  trendUp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
  ),
  award: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
  ),
  building: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 6h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/></svg>
  ),
  heart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  ),
  loader: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
  ),
};

/* ─── Animated Counter ─── */
function useCountUp(end, duration = 1500) {
  const [count, setCount] = useState(0);
  const frameRef = useRef();
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(Math.floor(p * end));
      if (p < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration]);
  return count;
}

function StatCard({ icon, label, value, color }) {
  const count = useCountUp(value);
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <h3>{count}</h3>
      <p>{label}</p>
    </div>
  );
}

/* ─── Skill Chip ─── */
function SkillChip({ skill, variant = 'neutral' }) {
  return (
    <span className={`skill-chip ${variant}`}>
      {skill}
    </span>
  );
}

/* ─── Progress Bar ─── */
function ProgressBar({ value, max = 100 }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className="progress">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ─── Match Score Circle ─── */
function MatchScore({ score }) {
  return (
    <div className="match-score">
      {score}%
    </div>
  );
}

/* ─── Toast Notification ─── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`toast toast-${type}`}>
      <span>{type === 'success' ? <Icons.check /> : <Icons.alert />}</span>
      {message}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState(null);
  const [careerData, setCareerData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const [workerForm, setWorkerForm] = useState({ name: '', age: '', location: '', skill: '' });
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: '', required_skill: '', salary: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);

  /* ─── Load Data ─── */
  const fetchWorkers = async () => {
    try {
      const res = await fetch(`${API_BASE}/workers`);
      const data = await res.json();
      setWorkers(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs`);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchWorkers();
    fetchJobs();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  /* ─── Seed Demo Data ─── */
  const seedDemoData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/seed-demo-data`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to seed data');
      await fetchWorkers();
      await fetchJobs();
      showToast('Demo data loaded successfully!', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Register Worker ─── */
  const registerWorker = async (e) => {
    e.preventDefault();
    setError('');
    const age = Number(workerForm.age);
    if (!age || age < 18 || age > 65) {
      setError('Age must be between 18 and 65.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...workerForm, age }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to register worker');
      setWorkerForm({ name: '', age: '', location: '', skill: '' });
      await fetchWorkers();
      showToast('Worker registered successfully!', 'success');
      setActiveTab('workers');
    } catch (e) {
      setError(e.message);
    }
  };

  /* ─── Create Job ─── */
  const createJob = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to create job');
      setJobForm({ title: '', company: '', location: '', required_skill: '', salary: '' });
      await fetchJobs();
      showToast('Job created successfully!', 'success');
      setActiveTab('jobs');
    } catch (e) {
      setError(e.message);
    }
  };

  /* ─── Find Matches ─── */
  const findMatches = async (workerId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/match-jobs/${workerId}`);
      const data = await res.json();
      setMatches(data);
      setSelectedWorker(workerId);
      setActiveTab('matching');
    } catch (e) {
      showToast('Failed to find matches', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Career Advice ─── */
  const getCareerAdvice = async (workerId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/career-advice/${workerId}`);
      const data = await res.json();
      setCareerData(data);
      setSelectedWorker(workerId);
      setActiveTab('roadmap');
    } catch (e) {
      showToast('Failed to get career advice', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Upload Resume ─── */
  const uploadResume = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const res = await fetch(`${API_BASE}/upload-resume`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Upload failed');
      setResumeData(data);
      showToast('Resume analyzed successfully!', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Sidebar Items ─── */
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'workers', label: 'Workers', icon: Icons.workers },
    { id: 'jobs', label: 'Jobs', icon: Icons.jobs },
    { id: 'resume', label: 'Resume Analyzer', icon: Icons.resume },
    { id: 'matching', label: 'AI Matching', icon: Icons.matching },
    { id: 'roadmap', label: 'Career Roadmap', icon: Icons.roadmap },
  ];

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="app">
      {/* ─── Toast ─── */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ─── Sidebar ─── */}
      <aside className="sidebar">
        <div className="logo">B-WIN</div>
        <nav>
          <ul>
            {sidebarItems.map((item) => (
              <li
                key={item.id}
                className={activeTab === item.id ? 'active' : ''}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon />
                {item.label}
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <p>Bridging the gap between talent and opportunity</p>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="main">
        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner">
              <Icons.loader />
              <p>Processing...</p>
            </div>
          </div>
        )}

        {/* ═══════ DASHBOARD TAB ═══════ */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <div className="navbar">
              <div className="navbar-header">
                <div>
                  <h2>AI Workforce Dashboard</h2>
                  <p>Bridge to Workforce with Intelligent Navigation</p>
                </div>
                <button className="seed-btn" onClick={seedDemoData} disabled={loading}>
                  <Icons.seed /> Load Demo Data
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <StatCard icon={<Icons.workers />} label="Total Workers" value={workers.length} color="blue" />
              <StatCard icon={<Icons.jobs />} label="Total Jobs" value={jobs.length} color="green" />
              <StatCard icon={<Icons.matching />} label="AI Matches" value={matches ? matches.total_matches : resumeData ? resumeData.total_matches || 0 : 0} color="orange" />
              <StatCard icon={<Icons.sparkles />} label="Skills Detected" value={resumeData ? resumeData.total_skills : 0} color="purple" />
            </div>

            <div className="mission-banner">
              <div className="mission-content">
                <h3><Icons.heart /> Our Mission</h3>
                <p>India has <strong>500 million informal workers</strong> with no career guidance. B-WIN uses AI to bridge that gap — connecting blue-collar talent with opportunity through skill matching, career roadmaps, and real-time job recommendations.</p>
              </div>
            </div>

            <div className="two-column">
              <div className="card">
                <h2><Icons.workers /> Recent Workers</h2>
                {workers.length === 0 ? (
                  <div className="empty-state">No workers registered yet. Click "Load Demo Data" or go to Workers tab.</div>
                ) : (
                  workers.slice(0, 5).map((w) => (
                    <div key={w.id} className="worker-card compact">
                      <h3>{w.name}</h3>
                      <p><Icons.mapPin /> {w.location} · Age {w.age}</p>
                      <div className="skills">
                        {w.skill.split(',').map((s, i) => (
                          <SkillChip key={i} skill={s.trim()} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="card">
                <h2><Icons.jobs /> Recent Jobs</h2>
                {jobs.length === 0 ? (
                  <div className="empty-state">No jobs posted yet. Click "Load Demo Data" or go to Jobs tab.</div>
                ) : (
                  jobs.slice(0, 5).map((j) => (
                    <div key={j.id} className="job-card compact">
                      <div className="job-header">
                        <div>
                          <h3>{j.title}</h3>
                          <p><Icons.briefcase /> {j.company} · <Icons.mapPin /> {j.location}</p>
                        </div>
                      </div>
                      <div className="skills">
                        {j.required_skill.split(',').map((s, i) => (
                          <SkillChip key={i} skill={s.trim()} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ WORKERS TAB ═══════ */}
        {activeTab === 'workers' && (
          <div className="tab-content">
            <div className="navbar">
              <h2>Workers</h2>
              <p>Register and manage blue-collar workforce profiles</p>
            </div>

            <div className="two-column">
              {/* Registration Form */}
              <div className="card">
                <h2><Icons.plus /> Register New Worker</h2>
                {error && (
                  <div className="error-banner">
                    <Icons.alert /> {error}
                  </div>
                )}
                <form onSubmit={registerWorker}>
                  <input
                    placeholder="Full Name"
                    value={workerForm.name}
                    onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Age (18–65)"
                    min="18"
                    max="65"
                    value={workerForm.age}
                    onChange={(e) => setWorkerForm({ ...workerForm, age: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Location (e.g., Chennai, Mumbai)"
                    value={workerForm.location}
                    onChange={(e) => setWorkerForm({ ...workerForm, location: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Skills (comma separated, e.g., welding, plumbing, driving)"
                    rows="3"
                    value={workerForm.skill}
                    onChange={(e) => setWorkerForm({ ...workerForm, skill: e.target.value })}
                    required
                  />
                  <button type="submit"><Icons.plus /> Register Worker</button>
                </form>
              </div>

              {/* Worker List */}
              <div className="card">
                <h2><Icons.workers /> Registered Workers ({workers.length})</h2>
                {workers.length === 0 ? (
                  <div className="empty-state">No workers yet. Register one or load demo data from Dashboard.</div>
                ) : (
                  workers.map((w) => (
                    <div key={w.id} className="worker-card">
                      <h3>{w.name}</h3>
                      <p><Icons.mapPin /> {w.location} · Age {w.age}</p>
                      <div className="skills">
                        {w.skill.split(',').map((s, i) => (
                          <SkillChip key={i} skill={s.trim()} />
                        ))}
                      </div>
                      <div className="button-row">
                        <button className="secondary" onClick={() => findMatches(w.id)}>
                          <Icons.search /> Find Matches
                        </button>
                        <button className="secondary" onClick={() => getCareerAdvice(w.id)}>
                          <Icons.roadmap /> Career Advice
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ JOBS TAB ═══════ */}
        {activeTab === 'jobs' && (
          <div className="tab-content">
            <div className="navbar">
              <h2>Jobs</h2>
              <p>Post and manage job opportunities for blue-collar workers</p>
            </div>

            <div className="two-column">
              {/* Job Form */}
              <div className="card">
                <h2><Icons.plus /> Post New Job</h2>
                {error && (
                  <div className="error-banner">
                    <Icons.alert /> {error}
                  </div>
                )}
                <form onSubmit={createJob}>
                  <input
                    placeholder="Job Title (e.g., Senior Electrician)"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Company Name"
                    value={jobForm.company}
                    onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Location"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    required
                  />
                  <textarea
                    placeholder="Required Skills (comma separated)"
                    rows="3"
                    value={jobForm.required_skill}
                    onChange={(e) => setJobForm({ ...jobForm, required_skill: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Salary Range (e.g., ₹18,000 - ₹25,000)"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  />
                  <button type="submit"><Icons.plus /> Post Job</button>
                </form>
              </div>

              {/* Job List */}
              <div className="card">
                <h2><Icons.jobs /> Active Jobs ({jobs.length})</h2>
                {jobs.length === 0 ? (
                  <div className="empty-state">No jobs posted yet. Create one or load demo data from Dashboard.</div>
                ) : (
                  jobs.map((j) => (
                    <div key={j.id} className="job-card">
                      <div className="job-header">
                        <div>
                          <h3>{j.title}</h3>
                          <p><Icons.briefcase /> {j.company} · <Icons.mapPin /> {j.location}</p>
                          {j.salary && <p className="salary-tag">{j.salary}</p>}
                        </div>
                      </div>
                      <div className="skills">
                        {j.required_skill.split(',').map((s, i) => (
                          <SkillChip key={i} skill={s.trim()} />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ RESUME ANALYZER TAB ═══════ */}
        {activeTab === 'resume' && (
          <div className="tab-content">
            <div className="navbar">
              <h2>Resume Analyzer</h2>
              <p>Upload a resume PDF to extract skills and find matching jobs</p>
            </div>

            <div className="two-column">
              {/* Upload */}
              <div className="card">
                <h2><Icons.upload /> Upload Resume</h2>
                <form onSubmit={uploadResume}>
                  <div className="file-dropzone">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload">
                      <Icons.upload />
                      <span>{selectedFile ? selectedFile.name : 'Click to upload PDF resume'}</span>
                    </label>
                  </div>
                  <button type="submit" disabled={!selectedFile || loading}>
                    <Icons.sparkles /> Analyze Resume
                  </button>
                </form>
              </div>

              {/* Results */}
              <div className="card">
                <h2><Icons.fileText /> Analysis Results</h2>
                {!resumeData ? (
                  <div className="empty-state">Upload a resume to see AI-powered skill extraction and job matching.</div>
                ) : (
                  <>
                    <div className="result-section">
                      <h4><Icons.sparkles /> Detected Skills ({resumeData.total_skills})</h4>
                      <div className="skills">
                        {resumeData.skills.map((s, i) => (
                          <SkillChip key={i} skill={s} variant="success" />
                        ))}
                      </div>
                    </div>

                    <div className="result-section">
                      <h4><Icons.target /> Top Job Matches ({resumeData.total_matches})</h4>
                      {resumeData.matched_jobs.length === 0 ? (
                        <div className="empty-state">No matching jobs found. Try uploading a different resume or adding more jobs.</div>
                      ) : (
                        resumeData.matched_jobs.map((job, idx) => (
                          <div key={idx} className="job-card">
                            <div className="job-header">
                              <div>
                                <h3>{job.title}</h3>
                                <p><Icons.briefcase /> {job.company} · <Icons.mapPin /> {job.location}</p>
                              </div>
                              <MatchScore score={job.match_score} />
                            </div>
                            <div className="match-detail">
                              <span className="match-label">Match Score</span>
                              <ProgressBar value={job.match_score} />
                            </div>
                            <div className="skills">
                              {job.required_skills?.map((s, i) => (
                                <SkillChip
                                  key={i}
                                  skill={s}
                                  variant={job.matched_skills?.includes(s) ? 'success' : 'danger'}
                                />
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="result-section">
                      <h4><Icons.roadmap /> Career Advice</h4>
                      <div className="advice-box">{resumeData.career_advice}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ AI MATCHING TAB ═══════ */}
        {activeTab === 'matching' && (
          <div className="tab-content">
            <div className="navbar">
              <h2>AI Job Matching</h2>
              <p>Intelligent skill-based matching between workers and opportunities</p>
            </div>

            {!matches ? (
              <div className="card empty-state-card">
                <div className="empty-state-large">
                  <Icons.matching />
                  <h3>No Active Match Session</h3>
                  <p>Go to the <strong>Workers</strong> tab, select a worker, and click <strong>"Find Matches"</strong> to see AI-powered job recommendations with skill gap analysis.</p>
                  <button onClick={() => setActiveTab('workers')}>
                    <Icons.workers /> Go to Workers
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="card worker-summary">
                  <h2><Icons.workers /> Worker Profile</h2>
                  <div className="worker-summary-content">
                    <div>
                      <h3>{matches.worker.name}</h3>
                      <p>Skills: {matches.worker.skills}</p>
                    </div>
                    <div className="match-badge">
                      <span>{matches.total_matches}</span>
                      <small>Matches Found</small>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h2><Icons.matching /> Matched Jobs</h2>
                  {matches.matched_jobs.length === 0 ? (
                    <div className="empty-state">No matching jobs found for this worker.</div>
                  ) : (
                    matches.matched_jobs.map((job, idx) => (
                      <div key={idx} className="job-card match-card">
                        <div className="job-header">
                          <div>
                            <h3>{job.title}</h3>
                            <p><Icons.briefcase /> {job.company} · <Icons.mapPin /> {job.location}</p>
                          </div>
                          <MatchScore score={job.match_score} />
                        </div>

                        <div className="match-detail">
                          <span className="match-label">Match Score</span>
                          <ProgressBar value={job.match_score} />
                        </div>

                        <div className="match-breakdown">
                          <div className="breakdown-section">
                            <h4><Icons.check /> Matched Skills</h4>
                            <div className="skills">
                              {job.matched_skills?.map((s, i) => (
                                <SkillChip key={i} skill={s} variant="success" />
                              )) || <span className="empty-skill">None</span>}
                            </div>
                          </div>
                          <div className="breakdown-section">
                            <h4><Icons.alert /> Missing Skills</h4>
                            <div className="skills">
                              {job.missing_skills?.map((s, i) => (
                                <SkillChip key={i} skill={s} variant="danger" />
                              )) || <span className="empty-skill">None — Perfect Match!</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════ CAREER ROADMAP TAB ═══════ */}
        {activeTab === 'roadmap' && (
          <div className="tab-content">
            <div className="navbar">
              <h2>Career Roadmap</h2>
              <p>AI-generated career paths, salary projections, and skill development plans</p>
            </div>

            {!careerData ? (
              <div className="card empty-state-card">
                <div className="empty-state-large">
                  <Icons.roadmap />
                  <h3>No Career Roadmap Generated</h3>
                  <p>Go to the <strong>Workers</strong> tab, select a worker, and click <strong>"Career Advice"</strong> to see a personalized career path with salary growth and certifications.</p>
                  <button onClick={() => setActiveTab('workers')}>
                    <Icons.workers /> Go to Workers
                  </button>
                </div>
              </div>
            ) : (
              <div className="roadmap-layout">
                {/* Career Path */}
                <div className="card">
                  <h2><Icons.trendUp /> Career Progression</h2>
                  <div className="career-path">
                    {careerData.advice?.career_path?.map((step, i) => (
                      <div key={i} className={`path-step ${i === 0 ? 'start' : i === careerData.advice.career_path.length - 1 ? 'end' : 'mid'}`}>
                        <div className="step-marker">{i + 1}</div>
                        <div className="step-content">
                          <h4>{step}</h4>
                          {i < careerData.advice.career_path.length - 1 && <Icons.chevronRight />}
                        </div>
                      </div>
                    )) || (
                      <div className="advice-box">{careerData.advice}</div>
                    )}
                  </div>
                </div>

                <div className="two-column">
                  {/* Salary Card */}
                  {careerData.advice?.salary_range && (
                    <div className="card salary-card">
                      <h2><Icons.zap /> Salary Growth</h2>
                      <div className="salary-display">
                        <span className="salary-from">{careerData.advice.salary_range.from}</span>
                        <Icons.arrowRight />
                        <span className="salary-to">{careerData.advice.salary_range.to}</span>
                      </div>
                      <p className="salary-note">Potential earnings growth with skill development</p>
                    </div>
                  )}

                  {/* Certifications */}
                  {careerData.advice?.certifications && (
                    <div className="card">
                      <h2><Icons.award /> Recommended Certifications</h2>
                      <ul className="cert-list">
                        {careerData.advice.certifications.map((cert, i) => (
                          <li key={i}><Icons.check /> {cert}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Target Companies */}
                {careerData.advice?.target_companies && (
                  <div className="card">
                    <h2><Icons.building /> Target Companies</h2>
                    <div className="company-grid">
                      {careerData.advice.target_companies.map((comp, i) => (
                        <div key={i} className="company-chip">
                          <Icons.building /> {comp}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Impact */}
                {careerData.advice?.social_impact && (
                  <div className="card impact-card">
                    <h2><Icons.heart /> Social Impact</h2>
                    <p>{careerData.advice.social_impact}</p>
                  </div>
                )}

                {/* Raw Advice Fallback */}
                {typeof careerData.advice === 'string' && (
                  <div className="card">
                    <h2><Icons.sparkles /> Career Advice</h2>
                    <div className="advice-box">{careerData.advice}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}