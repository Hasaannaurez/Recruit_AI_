import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../CssFiles/Navbar_Home.css';

const Navbar_Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({ 
      title: "Are you sure?", 
      icon: "warning", 
      showCancelButton: true, 
      confirmButtonColor: "#3085d6", 
      cancelButtonColor: "#d33", 
      confirmButtonText: "Yes, Log Out!" 
    }).then((result) => { 
      if (result.isConfirmed) { 
        // Clear the access token from localStorage
        localStorage.removeItem('access_token');
        // Redirect to the landing page or login page
        localStorage.removeItem('username');
        localStorage.removeItem('refresh_token');
        
        Swal.fire({ 
          title: "Logged Out!",  
          icon: "success",
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          window.location.replace('/SignIN');
        });
      } 
    });
  }

  const handleRecruitAIClick = () => {
    // Navigate to home page when Recruit AI is clicked
    navigate('/Home');
  }

  return (
    <div className="job-role">
      <div className="div">
        <div className="group">
          <div className="frame">
            {/* Left side - Recruit AI and navigation items */}
            <div className="left-nav-section">
              <div className="div-wrapper" onClick={handleRecruitAIClick} style={{ cursor: 'pointer' }}>
                <div className="text-wrapper">Recruit AI</div>
              </div>

              <div className="frame-2">
                <Link to="/Home" className="frame-4-link">
                  <div className="frame-4">
                    <div className="text-wrapper-2">
                      <li>Home</li>
                    </div>
                  </div>
                </Link>

                <Link to="/Home/profiles" className="frame-4-link">
                  <div className="frame-4">
                    <div className="text-wrapper-2">
                      <li>Candidate Profiles</li>
                    </div>
                  </div>
                </Link>

                <Link to="/Home/JobOpenings" className="frame-4-link">
                  <div className="frame-4">
                    <div className="text-wrapper-2">
                      <li>Job Openings</li>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Right side - Logout button */}
            <div className="right-nav-section">
              <div className="frame-5" onClick={handleLogout}>
              <div className="logout-content">
                <svg className="logout-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="text-wrapper-4">
                  <li>Log Out</li>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar_Home;