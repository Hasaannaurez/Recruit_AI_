import React from 'react'
import Navbar_Home from '../components/Navbar_Home'
import {Link} from 'react-router-dom'
import '../CssFiles/JobOpenings.css'
import { useState, useEffect } from 'react';
import { getRequest } from "../../utils/apiclient";

const JobOpenings = () => {
  const [jobRoles, setJobRoles] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'active', 'inactive'];

  useEffect(() => {
    const fetchJobRoles = async () => {
      try {
        const response = await getRequest('job/home_all_job_details/');
        setJobRoles(response);
        setFilteredJobs(response);
        console.log(response);
      } catch (err) {
        console.log(err);
      }
    }
    fetchJobRoles();
  }, []);

  useEffect(() => {
    let filtered = jobRoles;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(job => 
        job.is_active && job.is_active.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.company && job.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredJobs(filtered);
  }, [jobRoles, searchTerm, selectedCategory]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const formatSalary = (minSalary, maxSalary) => {
    if (minSalary && maxSalary) {
      return `$${(minSalary / 1000).toFixed(0)}K - $${(maxSalary / 1000).toFixed(0)}K`;
    }
    return 'Salary not specified';
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently posted';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  const getCategoryBadgeClass = (category) => {
    const categoryMap = {
      'Engineering': 'engineering',
      'Design': 'design',
      'Product': 'product',
      'Infrastructure': 'infrastructure',
      'Data & Analytics': 'data-analytics'
    };
    return categoryMap[category] || 'default';
  };

  return (
    <div>
      <Navbar_Home />
      
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H4C2.89 6 2.01 6.89 2.01 8L2 19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM10 4H14V6H10V4ZM20 19H4V8H20V19Z" fill="#4A90E2"/>
            </svg>
          </div>
          <h1 className="hero-title">Job Openings</h1>
          <p className="hero-subtitle">
           Discover top-tier talent with unmatched expertise. Hire smarter, faster.
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            {/* <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3S3 5.91 3 9.5S5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14Z" fill="#999"/>
            </svg> */}
            <input
              type="text"
              placeholder="Search jobs, companies, or locations..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-section">
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Section */}
      <div className="JobRoles">
        <div className="jobs-header">
          <h2>{filteredJobs.length} Jobs Found</h2>
        </div>
        
        <div className="jobs-grid">
          {filteredJobs.map((role) => (
            <Link to={`/Home/${role.id}`} >
            <div key={role.id} className='RoleBox'>
              <div className="job-header">
                <div className="job-title-section">
                  <Link to={`/Home/${role.id}`} className="job-title">
                    {role.title}
                  </Link>
                  <span className={`category-badge ${getCategoryBadgeClass(role.category)}`}>
                    {role.is_active || 'General'}
                  </span>
                </div>
              </div>
              
              <div className="job-company">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 7V3H2V21H22V7H12ZM6 19H4V17H6V19ZM6 15H4V13H6V15ZM6 11H4V9H6V11ZM6 7H4V5H6V7ZM10 19H8V17H10V19ZM10 15H8V13H10V15ZM10 11H8V9H10V11ZM10 7H8V5H10V7ZM20 19H12V17H14V15H12V13H14V11H12V9H20V19ZM18 11H16V13H18V11ZM18 15H16V17H18V15Z" fill="#666"/>
                </svg>
                {role.level_of_position} level
              </div>
              
              <div className="job-location">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z" fill="#666"/>
                </svg>
                {role.location || 'Location'}
              </div>
              
              <div className="job-salary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.5 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.5 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.5 11.8 10.9Z" fill="#666"/>
                </svg>
                {role.salary}
              </div>
              
              <div className="job-time">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22S22 17.5 22 12S17.5 2 12 2ZM17 13H11V7H12.5V11.5H17V13Z" fill="#666"/>
                </svg>
                {getTimeAgo(role.created_at)}
              </div>
              
              <div className="job-description">
                {role.description || 'Join our team and make a difference with your skills and expertise.'}
              </div>
              
              <div className="job-footer">
                <span className="job-type">
                  {role.role_type || 'Full-time'}
                </span>
                <span className="job-id">
                  ID: {role.job_unique_id}
                </span>
              </div>
            </div>
            </Link>
          ))}
        </div>
        
        {filteredJobs.length === 0 && (
          <div className="no-jobs">
            <p>No jobs found matching your criteria. Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default JobOpenings