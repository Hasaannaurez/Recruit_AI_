// import React, { useState, useEffect } from 'react';
// import Navbar_Home from '../components/Navbar_Home';
// import useFetch from '../CustomHooks/useFetch';
// import '../CssFiles/Home.css';
// import { Link } from 'react-router-dom';

// const Home = () => {
//   const { data: JobRoles, error, isPending } = useFetch('http://127.0.0.1:8000/api/jobs');
  
//   const [startIndex, setStartIndex] = useState(0);
//   const Number = 20;

//   const handleNext = () => {
//     if (JobRoles && startIndex < JobRoles.length - Number) {
//       setStartIndex(startIndex + Number);
//     }
//   };

//   const handlePrev = () => {
//     if (startIndex > 0) {
//       setStartIndex(startIndex - Number);
//     }
//   };

//   return (
//     <>
//       <Navbar_Home />
//       <div className="Welcome">
//         <h1>Welcome Rohith</h1>
//       </div>
//       <div className="Status">
//         <div className="JobRoles">
//           <h2>Your Job Roles</h2>
//           <h3>{error}</h3>
//           <div className="carousel-container">
//             {startIndex > 0 && (
//               <button className="arrow-btn left" onClick={handlePrev}>
//                 <span className="arrow-icon">&#8592;</span>
//               </button>
//             )}
//             <div className="Role-list">
//               <div 
//                 className="role-slider" 
//                 style={{ transform: `translateX(-${startIndex * (390)}px)` }}
//               >
//                 {JobRoles && JobRoles.slice(startIndex, startIndex + Number).map((Role) => (
//                   <div className="role-card" key={Role.id}>
//                     <h3 className="role-title">{Role.title}</h3>
//                     <p className="hiring-deadline">{Role.hiringDeadline} hires</p>
//                     <div className="stats">
//                       <div className="stat-item">
//                         <span className="stat-number">{Role.stats.activeJobs}</span>
//                         <span className="stat-label">Active Jobs</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-number">{Role.stats.applicants}</span>
//                         <span className="stat-label">Applicants</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-number">{Role.stats.interviews}</span>
//                         <span className="stat-label">Interviews</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-number">{Role.stats.submissions}</span>
//                         <span className="stat-label">Submissions</span>
//                       </div>
//                       <div className="stat-item">
//                         <span className="stat-number">{Role.stats.offers}</span>
//                         <span className="stat-label">Offers</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             {JobRoles && startIndex + Number < JobRoles.length && (
//               <button className="arrow-btn right" onClick={handleNext}>
//                 <span className="arrow-icon">&#8594;</span>
//               </button>
//             )}
//           </div>
//           <Link to='/Home/JobOpenings' className='Hi'>view all roles....</Link>
//         </div>
//         <div className="CurrentStatus">
//           <h1>Current Status</h1>
//           <div>
//             <p><h1>20</h1> AI analysis are running</p>
//           </div>
//           <div className="Status-Card">
//             <div className="Status-Card-1">
//               <h2>Active Jobs</h2>
//               <p>Currently Active</p>
//               <h3>0</h3>
//             </div>
//             <div className="Status-Card-2">
//               <h2>Applications</h2>
//               <p>Applications Received</p>
//               <h3>0</h3>
//             </div>
//             <div className="Status-Card-3">
//               <h2>Interviews</h2>
//               <p>Interviews Scheduled</p>
//               <h3>0</h3>
//             </div>
//             <div className="Status-Card-4">
//               <h2>Offers</h2>
//               <p>Offers Made</p>
//               <h3>0</h3>
//             </div>
//             <div className="Status-Card-5">
//               <h2>Hired</h2>
//               <p>Hires Made</p>
//               <h3>0</h3>
//             </div>
//             <div className="Status-Card-6">
//               <h2>Rejected</h2>
//               <p>Rejections</p>
//               <h3>0</h3>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Home;




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar_Home from '../stores/components/Navbar_Home';
import useFetch from '../stores/CustomHooks/useFetch';
// import '../CssFiles/Home.css';


// Utility function to fetch user's username (adjust based on your API)
const getUserInfo = () => {
  // This function assumes the username is stored in localStorage after login
  return localStorage.getItem('username');
};

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({ title: '', description: '', active: true });
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch the jobs created by the user
//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const token = localStorage.getItem('access_token'); // Get the token from localStorage
//         const response = await fetch('http://127.0.0.1:8000/api/jobs', {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!response.ok) {
//           throw new Error('Error fetching jobs');
//         }

//         const data = await response.json();
//         setJobs(data); // Set the jobs data from the backend
//         setIsPending(false);
//       } catch (err) {
//         setError(err.message);
//         setIsPending(false);
//       }
//     };

//     fetchJobs();
//   }, []);


useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('access_token'); // Get token from localStorage
        console.log('Fetching jobs with token:', token); // Debug log
  
        const response = await fetch('http://127.0.0.1:8000/api/jobs', {
          headers: { Authorization: `Bearer ${token}` },
          

          
        });
  
        console.log('Response:', response); // Debug log
  
        if (!response.ok) {
          throw new Error('Error fetching jobs');
        }
  
        const data = await response.json();
        console.log('Jobs data:', data); // Debug log
  
        setJobs(data);
        setIsPending(false);
      } catch (err) {
        console.error('Error:', err.message); // Log error message
        setError(err.message);
        setIsPending(false);
      }
    };
  
    fetchJobs();
  }, []);
  

  // Add a new job
  const handleAddJob = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newJob),
      });

      if (!response.ok) {
        throw new Error('Failed to add job');
      }

      // After adding a job, re-fetch the jobs list
      const addedJob = await response.json();
      setJobs((prevJobs) => [...prevJobs, addedJob]);
      setNewJob({ title: '', description: '', active: true }); // Reset the form
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle job active status
  const handleToggleActive = async (jobId) => {
    try {
      const token = localStorage.getItem('access_token');
      const jobToUpdate = jobs.find((job) => job.id === jobId);

      const response = await fetch(`http://127.0.0.1:8000/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !jobToUpdate.active }),
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      // Update job status in the state
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, active: !job.active } : job
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a job
  const handleDeleteJob = async (jobId) => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(`http://127.0.0.1:8000/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
         
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      // Remove the deleted job from the state
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <Navbar_Home />
      <div className="Welcome">
        <h1>Hi, {getUserInfo()}</h1>
      </div>

      <div className="JobRoles">
        <h2>Your Job Roles</h2>
        <h3>{error}</h3>
        {isPending && <p>Loading jobs...</p>}
        <div className="JobList">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="job-card">
                <h3>{job.title}</h3>
                <p>{job.description}</p>
                <p>Status: {job.active ? 'Active' : 'Inactive'}</p>
                <button onClick={() => handleToggleActive(job.id)}>
                  {job.active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDeleteJob(job.id)}>Delete Job</button>
              </div>
            ))
          ) : (
            <p>No jobs created yet!</p>
          )}
        </div>
        <form onSubmit={handleAddJob}>
          <h3>Add a New Job</h3>
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Description:</label>
            <textarea
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              required
            />
          </div>
          <div>
            <label>Active:</label>
            <input
              type="checkbox"
              checked={newJob.active}
              onChange={(e) => setNewJob({ ...newJob, active: e.target.checked })}
            />
          </div>
          <button type="submit">Add Job</button>
        </form>
      </div>
    </>
  );
};

export default Home;
