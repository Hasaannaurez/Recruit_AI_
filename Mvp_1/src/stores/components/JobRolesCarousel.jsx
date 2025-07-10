import { deleteRequest, getRequest } from '../../utils/apiclient';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import '../CssFiles/Carousel.css'; // Make sure to update class names in this CSS file too
import Swal from 'sweetalert2';

const JobRolesCarousel = ({ JobRoles, onRoleDelete }) => {
  const navigate = useNavigate();

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 }
      }
    ]
  };

  const [allJobRoles, setAllJobRoles] = useState(() => [...JobRoles]);
  const [activeTab, setActiveTab] = useState('active');
  const [hoveredRole, setHoveredRole] = useState(null);
  const [isActive, setIsActive] = useState(true);
  useEffect(() => {
    setAllJobRoles([...JobRoles]);
  }, [JobRoles]);

const togleRoleStatus = async (Id) => {
  const result = await Swal.fire({
    title: "Are you sure you want to change the status of this job role?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes!",
    cancelButtonText: "Cancel"
  });
  if (!result.isConfirmed) return;

  // Call API and update local state
  getRequest(`api/jobs/${Id}/toggle-status/`);
  setAllJobRoles(prev =>
    prev.map(r =>
      r.id === Id ? { ...r, is_active: r.is_active === 'active' ? 'inactive' : 'active' } : r
    )
  );

  // ✅ Add this sweet alert success toast here
  Swal.fire({
    title: "Status Changed",
    icon: "success",
    toast: true,
    timer: 1500,
    position: 'center',
    timerProgressBar: true,
    showConfirmButton: false
  });
};

  const handleactiveTabs = () => {
    setActiveTab('active');
    setIsActive(true);
  }

  const handleinactiveTabs = () => {
    setActiveTab('inactive');
    setIsActive(false);
  }

  const filteredRoles = allJobRoles.filter(role => role.is_active === activeTab);

  const handleDelete = async (roleId) => {
  try {
    // Show confirmation prompt using SweetAlert2
    const result = await Swal.fire({
      title: "Are you sure you want to delete this job role?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    // If user cancels, exit early
    if (!result.isConfirmed) return;

    // Proceed with API call
    await deleteRequest(`api/jobs/${roleId}/`);

    // Show success toast
    Swal.fire({
      title: "Job role deleted successfully",
      icon: "success",
      toast: true,
      timer: 2000,
      position: 'center',
      timerProgressBar: true,
      showConfirmButton: false
    });

    // Trigger callback and navigation
    if (onRoleDelete) {
      onRoleDelete(roleId);
    }
    navigate('/Home');

  } catch (error) {
    console.error('Error deleting job role:', error);

    // Show error toast
    Swal.fire({
      title: "Failed to delete job role. Please try again.",
      icon: "error",
      toast: true,
      timer: 3000,
      position: 'center',
      timerProgressBar: true,
      showConfirmButton: false
    });
  }
};

  return (
    <>
      <div className="Carousel_main-content">
        <div className="Carousel_job-roles-section">
          <div className="Carousel_section-header">
            <h2>Job Roles</h2>
            <div className="Carousel_header-actions">
              <Link to="/Home/newrole" className="Carousel_add-role-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Add Role
              </Link>
            </div>
          </div>
          <div className="Carousel_tab-navigation">
            <button className= {`button ${isActive ? "Carousel_tab-btn active" : "Carousel_tab-btn inactive"}`} onClick={handleactiveTabs}>Active</button>
            <button className={`button ${ !isActive ? "Carousel_tab-btn active" : "Carousel_tab-btn inactive"}`} onClick={handleinactiveTabs}>Inactive</button>
          </div>
          <div className="Carousel_job-roles__grid">
            <Slider {...settings}>
              {filteredRoles.map((Role) => {
                const percentage = Role.candidates_required ? (Role.phase_counts?.Hired / Role.candidates_required) * 100 : 0;
                return (
                  <div className="Carousel_job-role-card" key={Role.id}>
                    <Link to={`/Home/${Role.id}`} className="Carousel_job-role-link">
                      <div className="Carousel_job-role-header">
                        <h3>{Role.title}</h3>
                        <p>{Role.job_unique_id}</p>
                      </div>
                      <div className="Carousel_progress-section">
                        <div className="Carousel_progress-bar">
                          <div className="Carousel_progress-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <div className="Carousel_progress-text">
                          <span>{Role.phase_counts?.Hired ?? 0}/{Role.candidates_required}</span>
                          <span className="Carousel_hired-tag">Hired</span>
                        </div>
                      </div>
                      <div className="Carousel_job-stats">
                        <div className="Carousel_stat-item">
                          <div className="Carousel_stat-icon-small">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          </div>
                          <span className="Carousel_stat-number">{Role.total_candidates}</span>
                          <span className="Carousel_stat-text">Applicants</span>
                        </div>
                        <div className="Carousel_stat-item">
                          <div className="Carousel_stat-icon-small">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3v2h18V4z" />
                            </svg>
                          </div>
                          <span className="Carousel_stat-number">{Role.phase_counts?.Interview ?? 0}</span>
                          <span className="Carousel_stat-text">Interviews</span>
                        </div>
                      </div>
                    </Link>

                    <button
                      onClick={() => handleDelete(Role.id)}
                      className="Carousel_deleteBtn"
                    >
                      Delete Role
                    </button>

                    <button
                      className="Carousel_ActiveBtn"
                      onClick={() => togleRoleStatus(Role.id)}
                      onMouseEnter={() => setHoveredRole(Role.id)}
                      onMouseLeave={() => setHoveredRole(null)}
                    >
                      {Role.is_active}
                    </button>

                    {hoveredRole === Role.id && (
                      <div className="Carousel_hover-tooltip">
                        {Role.is_active === "active" ? 'Make Inactive' : 'Make Active'}
                      </div>
                    )}
                  </div>
                );
              })}
            </Slider>
          </div>
          <div className="Carousel_view-all-container">
            <Link to='/Home/JobOpenings' className='Carousel_view-all-link'>
              View All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobRolesCarousel;