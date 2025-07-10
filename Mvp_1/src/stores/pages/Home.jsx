import React, { useState, useEffect } from 'react';
import Navbar_Home from '../components/Navbar_Home';
import '../CssFiles/Home.css';
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

        const updatedRoles = response.map(role => ({
          ...role,
          resumes: role.resumes || []
        }));
        setJobRoles(updatedRoles);
      } catch (err) {
        console.log(err);
      }
    };
    fetchJobroles();
  }, []);

  const handleRoleDelete = (deletedRoleId) => {
    setJobRoles(prevRoles => prevRoles.filter(role => role.id !== deletedRoleId));
  };

  return (
    <>
      <Navbar_Home />

      <div className="Home_welcome-section">
        <div className="Home_welcome-content">
          <p className='user_welcome'>Welcome {user},</p>
          <p>Your intelligent recruitment platform is ready to help you find exceptional talent</p>
        </div>
      </div>

      {/* NEW: Wrapper for the main content area with two columns */}
      <div className="Home_main-content-grid"> {/* This will be our 2-column container */}

        {/* Column 1: Job Roles Carousel */}
        <div className="Home_JobRoles-carousel-wrapper"> {/* New wrapper for the carousel */}
          <JobRolesCarousel
            JobRoles={JobRoles}
            onRoleDelete={handleRoleDelete}
            Jobother={jobother}
          />
        </div>

        {/* Column 2: Stats Overview */}
        <div className="Home_stats-overview-wrapper"> {/* New wrapper for the stats */}
          <div className="Home_stats-overview">
            <div className="Home_stats-container">
              <div className="Home_stat-card Home_open-roles">
                <div className="Home_stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
                  </svg>
                </div>
                <div className="Home_stat-info">
                  <div className="Home_stat-number-label-group">
                    <div className="Home_stat-number">{jobother.total_no_of_jobs}</div>
                    <div className="Home_stat-label">Open Roles</div>
                  </div>
                  <div className="Home_stat-sublabel">Actively Hiring</div>
                </div>
              </div>

              <div className="Home_stat-card Home_candidates">
                <div className="Home_stat-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.001 3.001 0 0 0 16.93 7H15.5c-.8 0-1.53.32-2.06.85l-7.51 7.51c-.39.39-.39 1.02 0 1.41l.71.71c.39.39 1.02.39 1.41 0L12 13.54V22h2v-6h2v6h4zm-11.5-9.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S7 10.17 7 11s.67 1.5 1.5 1.5zM5.5 22v-7.5H4V22h1.5zm3-2.25c-.41-.41-.66-.98-.66-1.62V13.5c0-1.1.9-2 2-2h.5v8.75H8.5z"/>
                  </svg>
                </div>
                <div className="Home_stat-info">
                  <div className="Home_stat-number-label-group">
                    <div className="Home_stat-number">{jobother.total_no_of_candidates}</div>
                    <div className="Home_stat-label">Candidates</div>
                  </div>
                  <div className="Home_stat-sublabel">In Talent Pool</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
