import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [workers, setWorkers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState(null);

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

  const fetchWorkers = async () => {
    const res = await axios.get("http://127.0.0.1:8000/workers");
    setWorkers(res.data);
  };

  const fetchJobs = async () => {
    const res = await axios.get("http://127.0.0.1:8000/jobs");
    setJobs(res.data);
  };

  const findMatches = async (workerId) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/match-jobs/${workerId}`
      );
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkers();
    fetchJobs();
  }, []);

  const addWorker = async (e) => {
    e.preventDefault();

    await axios.post("http://127.0.0.1:8000/workers", {
      ...workerForm,
      age: parseInt(workerForm.age),
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

    await axios.post("http://127.0.0.1:8000/jobs", {
      ...jobForm,
      salary: parseInt(jobForm.salary),
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

  return (
    <div
      style={{
        padding: "30px",
        fontFamily: "Arial",
        maxWidth: "1200px",
        margin: "0 auto",
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
            setWorkerForm({
              ...workerForm,
              name: e.target.value,
            })
          }
        />
        <br /><br />

        <input
          type="number"
          placeholder="Age"
          value={workerForm.age}
          onChange={(e) =>
            setWorkerForm({
              ...workerForm,
              age: e.target.value,
            })
          }
        />
        <br /><br />

        <input
          placeholder="Location"
          value={workerForm.location}
          onChange={(e) =>
            setWorkerForm({
              ...workerForm,
              location: e.target.value,
            })
          }
        />
        <br /><br />

        <input
          placeholder="Skill"
          value={workerForm.skill}
          onChange={(e) =>
            setWorkerForm({
              ...workerForm,
              skill: e.target.value,
            })
          }
        />
        <br /><br />

        <button type="submit">
          Add Worker
        </button>
      </form>

      <hr />

      <h2>Create Job</h2>

      <form onSubmit={addJob}>
        <input
          placeholder="Job Title"
          value={jobForm.title}
          onChange={(e) =>
            setJobForm({
              ...jobForm,
              title: e.target.value,
            })
          }
        />
        <br /><br />

        <input
          placeholder="Company"
          value={jobForm.company}
          onChange={(e) =>
            setJobForm({
              ...jobForm,
              company: e.target.value,
            })
          }
        />
        <br /><br />

        <input
          placeholder="Location"
          value={jobForm.location}
          onChange={(e) =>
            setJobForm({
              ...jobForm,
              location: e.target.value,
            })
          }
        />
        <br /><br />

        <input
          placeholder="Required Skill"
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
            setJobForm({
              ...jobForm,
              salary: e.target.value,
            })
          }
        />
        <br /><br />

        <button type="submit">
          Add Job
        </button>
      </form>

      <hr />

      <h2>Workers</h2>

      {workers.map((worker) => (
        <div
          key={worker.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <h3>{worker.name}</h3>
          <p>Skill: {worker.skill}</p>
          <p>Location: {worker.location}</p>
          <p>Age: {worker.age}</p>

          <button
            onClick={() => findMatches(worker.id)}
          >
            Find Matching Jobs
          </button>
        </div>
      ))}

      <hr />

      <h2>Matching Results</h2>

      {matches && (
        <div>
          <h3>
            {matches.worker.name} ({matches.worker.skill})
          </h3>

          <p>
            Total Matches: {matches.total_matches}
          </p>

          {matches.matched_jobs.map((job) => (
            <div
              key={job.id}
              style={{
                border: "2px solid blue",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h4>{job.title}</h4>
              <p>Company: {job.company}</p>
              <p>Location: {job.location}</p>
              <p>Salary: ₹{job.salary}</p>
            </div>
          ))}
        </div>
      )}

      <hr />

      <h2>Jobs</h2>

      {jobs.map((job) => (
        <div
          key={job.id}
          style={{
            border: "1px solid green",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "8px",
          }}
        >
          <h3>{job.title}</h3>
          <p>Company: {job.company}</p>
          <p>Required Skill: {job.required_skill}</p>
          <p>Location: {job.location}</p>
          <p>Salary: ₹{job.salary}</p>
        </div>
      ))}
    </div>
  );
}

export default App;