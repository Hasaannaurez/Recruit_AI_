import React, { useState, useEffect } from 'react';
import Navbar_Home from '../components/Navbar_Home';
import '../CssFiles/tokyo.css';
import { Link } from 'react-router-dom';
import { getRequest } from '../../utils/apiclient';
import JobRolesCarousel from '../components/JobRolesCarousel';

const Home = () => {
  const [JobRoles, setJobRoles] = useState([]);
  const [jobother, setJobother] = useState([]);
  const [user, setUser] = useState(''); 
  
  useEffect(() => {
    
    setUser(localStorage.getItem('username'));     

    const fetchJobroles = async () => {
      try {
        const response = await getRequest('job/home_all_job_details/');
        console.log(response);
        const otherresponse = await getRequest('job/home_other_details/');
        console.log(otherresponse);
        setJobother(otherresponse);
        // Ensure that each job role includes resume information

        const updatedRoles = response.map(role => ({
          ...role,
          resumes: role.resumes || [] // Ensure resumes is always an array
        }));
    
        
        setJobRoles(updatedRoles);
      } catch (err) {
        console.log(err);
      }
    };
    fetchJobroles();
  }, []);

  const handleRoleDelete = (deletedRoleId) => {
    // Update the local state to remove the deleted role
    setJobRoles(prevRoles => prevRoles.filter(role => role.id !== deletedRoleId));
  };

  return (
    <>
      <Navbar_Home />
      
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome in, Recruiter</h1>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stats-container">
          <div className="stat-card open-roles">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-number">14</div>
              <div className="stat-label">Open Roles</div>
              <div className="stat-sublabel">Actively Hiring</div>
            </div>
          </div>

          <div className="stat-card candidates">
            <div className="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.001 3.001 0 0 0 16.93 7H15.5c-.8 0-1.53.32-2.06.85l-7.51 7.51c-.39.39-.39 1.02 0 1.41l.71.71c.39.39 1.02.39 1.41 0L12 13.54V22h2v-6h2v6h4zm-11.5-9.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S7 10.17 7 11s.67 1.5 1.5 1.5zM5.5 22v-7.5H4V22h1.5zm3-2.25c-.41-.41-.66-.98-.66-1.62V13.5c0-1.1.9-2 2-2h.5v8.75H8.5z"/>
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-number">200</div>
              <div className="stat-label">Candidates</div>
              <div className="stat-sublabel">In Talent Pool</div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Roles Section */}
      <div className="main-content">
        <div className="job-roles-section">
          <div className="section-header">
            <h2>Job Roles</h2>
            <div className="header-actions">
              <div className="search-container">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5.5 12.49 5.5 10.5S7.01 7 9.5 7 13.5 8.51 13.5 10.5 11.99 14 9.5 14z"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="     Search roles..." 
                  className="search-input"
                />
              </div>
              <Link to="/Home/newrole" className="add-role-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add Role
              </Link>
            </div>
          </div>

          <div className="tab-navigation">
            <button className="tab-btn active">Active</button>
            <button className="tab-btn">Inactive</button>
          </div>

          <div className="job-roles-grid">
            {/* Mock job roles based on the design */}
            <div className="job-role-card">
              <div className="job-role-header">
                <h3>Sales and marketing</h3>
                <button className="more-options">⋯</button>
              </div>
              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '40%'}}></div>
                </div>
                <div className="progress-text">
                  <span>4/10</span>
                  <span className="hired-tag">Hired</span>
                </div>
              </div>
              <div className="job-stats">
                <div className="stat-item">
                  <div className="stat-icon-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <span className="stat-number">26</span>
                  <span className="stat-text">Applicants</span>
                </div>
                <div className="stat-item">
                  <div className="stat-icon-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3v2h18V4z"/>
                    </svg>
                  </div>
                  <span className="stat-number">2</span>
                  <span className="stat-text">Interviews</span>
                </div>
                <div className="stat-item">
                  <div className="stat-icon-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <span className="stat-number">0</span>
                  <span className="stat-text">Offers</span>
                </div>
              </div>
            </div>

            <div className="job-role-card">
              <div className="job-role-header">
                <h3>Sales and marketing</h3>
                <button className="more-options">⋯</button>
              </div>
              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '40%'}}></div>
                </div>
                <div className="progress-text">
                  <span>4/10</span>
                  <span className="hired-tag">Hired</span>
                </div>
              </div>
              <div className="job-stats">
                <div className="stat-item">
                  <div className="stat-icon-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <span className="stat-number">26</span>
                  <span className="stat-text">Applicants</span>
                </div>
                <div className="stat-item">
                  <div className="stat-icon-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3v2h18V4z"/>
                    </svg>
                  </div>
                  <span className="stat-number">2</span>
                  <span className="stat-text">Interviews</span>
                </div>
                <div className="stat-item">
                  <div className="stat-icon-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <span className="stat-number">0</span>
                  <span className="stat-text">Offers</span>
                </div>
              </div>
            </div>

            <div className="job-role-card">
              <div className="job-role-header">
                <h3>Sales and marketing</h3>
                <button className="more-options">⋯</button>
              </div>
              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '40%'}}></div>
                </div>
                <div className="progress-text">
                  <span>4/10</span>
                  <span className="hired-tag">Hired</span>
                </div>
              </div>
              <div className="job-stats">
                <div className="stat-item">
                  <div className="stat-icon-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <span className="stat-number">26</span>
                  <span className="stat-text">Applicants</span>
                </div>
                <div className="stat-item">
                  <div className="stat-icon-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3v2h18V4z"/>
                    </svg>
                  </div>
                  <span className="stat-number">2</span>
                  <span className="stat-text">Interviews</span>
                </div>
                <div className="stat-item">
                  <div className="stat-icon-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <span className="stat-number">0</span>
                  <span className="stat-text">Offers</span>
                </div>
              </div>
            </div>

            <div className="job-role-card">
              <div className="job-role-header">
                <h3>Sales and marketing</h3>
                <button className="more-options">⋯</button>
              </div>
              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '40%'}}></div>
                </div>
                <div className="progress-text">
                  <span>4/10</span>
                  <span className="hired-tag">Hired</span>
                </div>
              </div>
              <div className="job-stats">
                <div className="stat-item">
                  <div className="stat-icon-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <span className="stat-number">26</span>
                  <span className="stat-text">Applicants</span>
                </div>
                <div className="stat-item">
                  <div className="stat-icon-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3v2h18V4z"/>
                    </svg>
                  </div>
                  <span className="stat-number">2</span>
                  <span className="stat-text">Interviews</span>
                </div>
                <div className="stat-item">
                  <div className="stat-icon-small">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <span className="stat-number">0</span>
                  <span className="stat-text">Offers</span>
                </div>
              </div>
            </div>
          </div>

          <div className="view-all-container">
            <Link to='/Home/JobOpenings' className='view-all-link'>
              View All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Your existing carousel component */}
        {/* <div style={{display: 'none'}}>
          <JobRolesCarousel 
            JobRoles={JobRoles}
            onRoleDelete={handleRoleDelete}
            Jobother={jobother}
          />
        </div> */}
      </div>

      <div className="Carousel_otherdetails">
        <div className="Carousel_total_candidates">
          <h1>Total number of candidates: {jobother.total_no_of_candidates}</h1>
          <h2>Total number of Jobs: {jobother.total_no_of_jobs}</h2>
        </div>
      </div>
    </>
  );
};

export default Home;