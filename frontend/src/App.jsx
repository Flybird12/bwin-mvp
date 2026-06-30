import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./App.css";

import {
  FaUsers,
  FaBriefcase,
  FaUpload,
  FaRobot,
  FaChartLine,
  FaBuilding,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaUserPlus,
  FaGraduationCap,
  FaLightbulb,
  FaFileAlt,
} from "react-icons/fa";

import { motion, AnimatePresence } from "framer-motion";

const API = "http://127.0.0.1:8000";

function App() {
  // -----------------------------
  // STATES
  // -----------------------------

  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState(null);
  const [careerData, setCareerData] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState('');

  const [workerForm, setWorkerForm] = useState({
    name: "",
    age: "",
    location: "",
    skill: "",
  });

  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    required_skill: "",
    salary: "",
  });

  const [activeSection, setActiveSection] = useState("dashboard");

  // -----------------------------
  // SECTION REFS (for sidebar scroll navigation only — UI only, no API impact)
  // -----------------------------

  const dashboardRef = useRef(null);
  const workersRef = useRef(null);
  const jobsRef = useRef(null);
  const resumeRef = useRef(null);
  const matchingRef = useRef(null);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaChartLine />, ref: dashboardRef },
    { id: "workers", label: "Workers", icon: <FaUsers />, ref: workersRef },
    { id: "jobs", label: "Jobs", icon: <FaBriefcase />, ref: jobsRef },
    { id: "resume", label: "Resume", icon: <FaUpload />, ref: resumeRef },
    { id: "matching", label: "AI Matching", icon: <FaRobot />, ref: matchingRef },
  ];

  const scrollToSection = (id, ref) => {
    setActiveSection(id);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // -----------------------------
  // LOAD DATA
  // -----------------------------

  useEffect(() => {
    fetchWorkers(true);
    fetchJobs(true);
  }, []);

  // -----------------------------
  // FETCH WORKERS
  // -----------------------------

  const fetchWorkers = async () => {
    try {
      const res = await axios.get(`${API}/workers`);
      setWorkers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------
  // FETCH JOBS
  // -----------------------------

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API}/jobs`);
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ─── Register Worker ─── */
  const registerWorker = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/workers`, {
        ...workerForm,
        age: Number(workerForm.age),
      });

      setWorkerForm({
        name: "",
        age: "",
        location: "",
        skill: "",
      });

      fetchWorkers();
    } catch (err) {
      console.error(err);
    }
  };

  /* ─── Create Job ─── */
  const createJob = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm),
      });

      setJobForm({
        title: "",
        company: "",
        location: "",
        required_skill: "",
        salary: "",
      });

      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------
  // UPLOAD RESUME
  // -----------------------------

  const uploadResume = async (e) => {
    e.preventDefault();

    if (!resumeFile) return;

    const formData = new FormData();
    formData.append("file", resumeFile);

    try {
      const res = await axios.post(`${API}/upload-resume`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResumeData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------
  // MATCH JOBS
  // -----------------------------

  const findMatches = async (id) => {
    try {
      const res = await axios.get(`${API}/match-jobs/${id}`);
      setMatches(res.data);
      setActiveSection("matching");
      matchingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------
  // CAREER ADVICE
  // -----------------------------

  const getCareerAdvice = async (id) => {
    try {
      const res = await axios.get(`${API}/career-advice/${id}`);
      setCareerAdvice(res.data);
      setActiveSection("matching");
      matchingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.error(err);
    }
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="app">
      {/* ================= Sidebar ================= */}

      <aside className="sidebar">
        <motion.h1
          className="logo"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          B-WIN
        </motion.h1>

        <ul>
          {navItems.map((item, i) => (
            <motion.li
              key={item.id}
              className={activeSection === item.id ? "active" : ""}
              onClick={() => scrollToSection(item.id, item.ref)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 6 }}
              whileTap={{ scale: 0.97 }}
            >
              {item.icon} {item.label}
            </motion.li>
          ))}
        </ul>
      </aside>

      {/* ================= Main ================= */}

      <main className="main">
        {/* ================= Navbar ================= */}

        <motion.div
          className="navbar"
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h2>AI Workforce Dashboard</h2>
            <p>Bridge to Workforce with Intelligent Navigation</p>
          </div>
        </motion.div>

        {/* ================= Dashboard / Statistics ================= */}

        <div className="stats-grid" ref={dashboardRef}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="stat-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <FaUsers className="stat-icon blue" />
            <h3>{workers.length}</h3>
            <p>Total Workers</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04 }}
            className="stat-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FaBriefcase className="stat-icon green" />
            <h3>{jobs.length}</h3>
            <p>Total Jobs</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04 }}
            className="stat-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <FaRobot className="stat-icon orange" />
            <h3>
              {matches
                ? matches.total_matches
                : resumeData
                ? resumeData.total_matches || 0
                : 0}
            </h3>
            <p>AI Matches</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04 }}
            className="stat-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FaChartLine className="stat-icon purple" />
            <h3>{resumeData ? resumeData.total_skills : 0}</h3>
            <p>Skills Detected</p>
          </motion.div>
        </div>

        {/* ================= Workers Section ================= */}

        <section ref={workersRef}>
          <div className="two-column">
            {/* Worker Registration */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2>
                <FaUserPlus /> Register Worker
              </h2>

              <form onSubmit={addWorker}>
                <input
                  placeholder="Full Name"
                  value={workerForm.name}
                  onChange={(e) =>
                    setWorkerForm({ ...workerForm, name: e.target.value })
                  }
                />

                <input
                  type="number"
                  placeholder="Age"
                  value={workerForm.age}
                  onChange={(e) =>
                    setWorkerForm({ ...workerForm, age: e.target.value })
                  }
                />

                <input
                  placeholder="Location"
                  value={workerForm.location}
                  onChange={(e) =>
                    setWorkerForm({ ...workerForm, location: e.target.value })
                  }
                />

                <textarea
                  rows="4"
                  placeholder="Skills (comma separated)"
                  value={workerForm.skill}
                  onChange={(e) =>
                    setWorkerForm({ ...workerForm, skill: e.target.value })
                  }
                />

                <button type="submit">Register Worker</button>
              </form>
            </motion.div>

            {/* Registered Workers */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <h2>
                <FaUsers /> Registered Workers
              </h2>

              {workers.length === 0 ? (
                <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
                  No workers registered yet. Use the form to add one.
                </p>
              ) : (
                workers.map((worker) => (
                  <motion.div
                    key={worker.id}
                    className="worker-card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h3>{worker.name}</h3>
                    <p>📍 {worker.location}</p>
                    <p>🎯 {worker.skill}</p>

                    <div className="button-row">
                      <button onClick={() => findMatches(worker.id)}>
                        Find Matches
                      </button>

                      <button
                        className="secondary"
                        onClick={() => getCareerAdvice(worker.id)}
                      >
                        Career Advice
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </section>

        {/* ================= Jobs Section ================= */}

        <section ref={jobsRef}>
          <div className="two-column">
            {/* Job Creation */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2>
                <FaBriefcase /> Create Job
              </h2>

              <form onSubmit={addJob}>
                <input
                  placeholder="Job Title"
                  value={jobForm.title}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, title: e.target.value })
                  }
                />

                <input
                  placeholder="Company"
                  value={jobForm.company}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, company: e.target.value })
                  }
                />

                <input
                  placeholder="Location"
                  value={jobForm.location}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, location: e.target.value })
                  }
                />

                <textarea
                  rows="4"
                  placeholder="Required Skills"
                  value={jobForm.required_skill}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, required_skill: e.target.value })
                  }
                />

                <input
                  type="number"
                  placeholder="Salary"
                  value={jobForm.salary}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, salary: e.target.value })
                  }
                />

                <button type="submit">Create Job</button>
              </form>
            </motion.div>

            {/* Available Jobs */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <h2>
                <FaBriefcase /> Available Jobs
              </h2>

              {jobs.length === 0 ? (
                <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
                  No jobs posted yet. Use the form to create one.
                </p>
              ) : (
                jobs.map((job) => (
                  <motion.div
                    className="job-card"
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h3>{job.title}</h3>

                    <p>
                      <FaBuilding /> {job.company}
                    </p>

                    <p>
                      <FaMapMarkerAlt /> {job.location}
                    </p>

                    <p>
                      <strong>Required Skills:</strong> {job.required_skill}
                    </p>

                    <p>
                      <FaMoneyBillWave /> ₹{job.salary.toLocaleString()}
                    </p>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </section>

        {/* ================= Resume Section ================= */}

        <section ref={resumeRef}>
          <div className="two-column">
            {/* Resume Upload */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2>
                <FaUpload /> Resume Analyzer
              </h2>

              <form onSubmit={uploadResume}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />

                <button type="submit">Analyze Resume</button>
              </form>
            </motion.div>

            {/* Resume Analysis */}
            <AnimatePresence mode="wait">
              {resumeData ? (
                <motion.div
                  key="resume-data"
                  className="card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2>
                    <FaFileAlt /> Resume Analysis
                  </h2>

                  <p>
                    <strong>Filename:</strong> {resumeData.filename}
                  </p>

                  <p>
                    <strong>Total Skills:</strong> {resumeData.total_skills}
                  </p>

                  <div className="skills">
                    {resumeData.skills.map((skill) => (
                      <span className="skill-chip" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <h3>Preview</h3>
                  <pre>{resumeData.resume_preview}</pre>
                </motion.div>
              ) : (
                <motion.div
                  key="resume-empty"
                  className="card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2>
                    <FaFileAlt /> Resume Analysis
                  </h2>
                  <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
                    Upload a resume to see extracted skills and a preview here.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ================= AI Matching Section ================= */}

        <section ref={matchingRef}>
          <AnimatePresence>
            {matches && (
              <motion.div
                key="matches"
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h2>
                  <FaRobot /> AI Job Matches
                </h2>

                {matches.matched_jobs.map((job) => (
                  <div className="job-card" key={job.id}>
                    <div className="job-header">
                      <div>
                        <h3>{job.title}</h3>
                        <p>
                          <FaBuilding /> {job.company}
                        </p>
                        <p>
                          <FaMapMarkerAlt /> {job.location}
                        </p>
                      </div>

                      <div className="match-score">{job.match_percentage}%</div>
                    </div>

                    <div className="progress">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${job.match_percentage}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>

                    <p>
                      <strong>Salary:</strong> <FaMoneyBillWave /> ₹
                      {job.salary.toLocaleString()}
                    </p>

                    <p>
                      <strong>Matched Skills:</strong>
                    </p>

                    <div className="skills">
                      {job.matched_skills.map((skill) => (
                        <span key={skill} className="skill-chip success">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <p>
                      <strong>Missing Skills:</strong>
                    </p>

                    <div className="skills">
                      {job.missing_skills.map((skill) => (
                        <span key={skill} className="skill-chip danger">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {careerAdvice && (
              <motion.div
                key="advice"
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h2>
                  <FaGraduationCap /> Career Advice
                </h2>

                <h3>{careerAdvice.worker}</h3>

                <p>
                  <strong>Current Skills:</strong> {careerAdvice.skill}
                </p>

                <h4>Recommended Skills</h4>
                <ul>
                  {careerAdvice.advice.next_skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>

                <h4>Salary Growth</h4>
                <p>{careerAdvice.advice.salary_growth}</p>

                <h4>Target Companies</h4>
                <ul>
                  {careerAdvice.advice.companies.map((company) => (
                    <li key={company}>{company}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {!matches && !careerAdvice && (
            <div className="card">
              <h2>
                <FaRobot /> AI Job Matching &amp; Career Advice
              </h2>
              <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
                <FaLightbulb /> Go to the Workers section and click "Find
                Matches" or "Career Advice" on a worker to see AI-powered
                insights here.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}