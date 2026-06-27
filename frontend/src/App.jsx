import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

function App() {
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState(null);
  const [careerAdvice, setCareerAdvice] = useState(null);

const [resumeFile, setResumeFile] = useState(null);
const [resumeData, setResumeData] = useState(null);

const uploadResume = async (e) => {
  e.preventDefault();
  if (!resumeFile) return;
  const formData = new FormData();
  formData.append("file", resumeFile);
  const res = await axios.post(`${API}/upload-resume`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  setResumeData(res.data);
};

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

  useEffect(() => {
    fetchWorkers();
    fetchJobs();
  }, []);

  const fetchWorkers = async () => {
    const res = await axios.get(`${API}/workers`);
    setWorkers(res.data);
  };

  const fetchJobs = async () => {
    const res = await axios.get(`${API}/jobs`);
    setJobs(res.data);
  };

  const addWorker = async (e) => {
    e.preventDefault();

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
  };

  const addJob = async (e) => {
    e.preventDefault();

    await axios.post(`${API}/jobs`, {
      ...jobForm,
      salary: Number(jobForm.salary),
    });

    setJobForm({
      title: "",
      company: "",
      location: "",
      required_skill: "",
      salary: "",
    });

    fetchJobs();
  };

  const findMatches = async (workerId) => {
    const res = await axios.get(`${API}/match-jobs/${workerId}`);
    setMatches(res.data);
  };

  const getCareerAdvice = async (workerId) => {
    const res = await axios.get(`${API}/career-advice/${workerId}`);
    setCareerAdvice(res.data);
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "40px auto",
        fontFamily: "Arial",
        padding: "20px",
      }}
    >
      <h1>B-WIN Dashboard</h1>

      <h2>Statistics</h2>
      <p>Total Workers: {workers.length}</p>
      <p>Total Jobs: {jobs.length}</p>

      <hr />

      <h2>Register Worker</h2>

      <form onSubmit={addWorker}>
        <input
          placeholder="Name"
          value={workerForm.name}
          onChange={(e) =>
            setWorkerForm({ ...workerForm, name: e.target.value })
          }
        />
        <br /><br />

        <input
          type="number"
          placeholder="Age"
          value={workerForm.age}
          onChange={(e) =>
            setWorkerForm({ ...workerForm, age: e.target.value })
          }
        />
        <br /><br />

        <input
          placeholder="Location"
          value={workerForm.location}
          onChange={(e) =>
            setWorkerForm({ ...workerForm, location: e.target.value })
          }
        />
        <br /><br />

        <input
          placeholder="Skills (comma separated)"
          value={workerForm.skill}
          onChange={(e) =>
            setWorkerForm({ ...workerForm, skill: e.target.value })
          }
        />
        <br /><br />

        <button type="submit">Register Worker</button>
      </form>

      <hr />

      <h2>Create Job</h2>

      <form onSubmit={addJob}>
        <input
          placeholder="Job Title"
          value={jobForm.title}
          onChange={(e) =>
            setJobForm({ ...jobForm, title: e.target.value })
          }
        />
        <br /><br />

        <input
          placeholder="Company"
          value={jobForm.company}
          onChange={(e) =>
            setJobForm({ ...jobForm, company: e.target.value })
          }
        />
        <br /><br />

        <input
          placeholder="Location"
          value={jobForm.location}
          onChange={(e) =>
            setJobForm({ ...jobForm, location: e.target.value })
          }
        />
        <br /><br />

        <input
          placeholder="Required Skills"
          value={jobForm.required_skill}
          onChange={(e) =>
            setJobForm({
              ...jobForm,
              required_skill: e.target.value,
            })
          }
        />
        <br /><br />

        <input
          type="number"
          placeholder="Salary"
          value={jobForm.salary}
          onChange={(e) =>
            setJobForm({ ...jobForm, salary: e.target.value })
          }
        />
        <br /><br />

        <button type="submit">Create Job</button>
      </form>


<hr />

<h2>Resume Upload</h2>

<form onSubmit={uploadResume}>
  <input
    type="file"
    accept=".pdf,.doc,.docx,.txt"
    onChange={(e)=>setResumeFile(e.target.files[0])}
  />
  <br /><br />
  <button type="submit">Upload Resume</button>
</form>

{resumeData && (
  <div style={{border:"1px solid #999",padding:"15px",marginTop:"15px",borderRadius:"10px"}}>
    <p><strong>Filename:</strong> {resumeData.filename}</p>
    <p><strong>Total Skills:</strong> {resumeData.total_skills}</p>
    <p><strong>Detected Skills:</strong>{" "}{resumeData.skills.join(", ")}</p>
    <h4>Resume Preview</h4>
    <pre style={{whiteSpace:"pre-wrap"}}>{resumeData.resume_preview}</pre>
  </div>
)}

      <hr />

      <h2>Workers</h2>

      {workers.map((worker) => (
        <div
          key={worker.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <h3>{worker.name}</h3>

          <p><strong>Skills:</strong> {worker.skill}</p>

          <p><strong>Location:</strong> {worker.location}</p>

          <p><strong>Age:</strong> {worker.age}</p>

          <button onClick={() => findMatches(worker.id)}>
            Find Matching Jobs
          </button>

          <button
            onClick={() => getCareerAdvice(worker.id)}
            style={{ marginLeft: "10px" }}
          >
            Career Advice
          </button>
        </div>
      ))}

      <hr />

      <h2>Matching Results</h2>

      {matches && (
        <>
          <h3>{matches.worker.name}</h3>

          <p>
            <strong>Skills:</strong> {matches.worker.skills}
          </p>

          <p>
            <strong>Total Matches:</strong> {matches.total_matches}
          </p>

          {matches.matched_jobs.map((job) => (
            <div
              key={job.id}
              style={{
                border: "2px solid #2563eb",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px",
                background: "#f8fafc",
              }}
            >
              <h3>{job.title}</h3>

              <p><strong>Company:</strong> {job.company}</p>

              <p><strong>Location:</strong> {job.location}</p>

              <p>
                <strong>Salary:</strong> ₹{job.salary.toLocaleString()}
              </p>

              <p>
                <strong>Match Score:</strong> {job.match_percentage}%
              </p>

              <div
                style={{
                  width: "100%",
                  height: "14px",
                  background: "#ddd",
                  borderRadius: "10px",
                  overflow: "hidden",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: `${job.match_percentage}%`,
                    height: "100%",
                    background: "#22c55e",
                  }}
                />
              </div>

              <p>
                <strong>Matched Skills:</strong>{" "}
                {job.matched_skills.join(", ")}
              </p>

              <p>
                <strong>Missing Skills:</strong>{" "}
                {job.missing_skills.length > 0
                  ? job.missing_skills.join(", ")
                  : "None"}
              </p>
            </div>
          ))}
        </>
      )}

      <hr />

      <h2>Career Advice</h2>

      {careerAdvice && (
        <div
          style={{
            border: "2px solid orange",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
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
        </div>
      )}

      <hr />

      <h2>Jobs</h2>

      {jobs.map((job) => (
        <div
          key={job.id}
          style={{
            border: "1px solid green",
            borderRadius: "10px",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <h3>{job.title}</h3>

          <p><strong>Company:</strong> {job.company}</p>

          <p><strong>Required Skills:</strong> {job.required_skill}</p>

          <p><strong>Location:</strong> {job.location}</p>

          <p>
            <strong>Salary:</strong> ₹{job.salary.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default App;