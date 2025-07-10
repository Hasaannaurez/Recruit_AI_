import React from 'react';
import './JobDetailsModal.css';

const JobDetailsModal = ({ candidate, isOpen, onClose }) => {
  if (!isOpen) return null;

  const jobDetails = candidate || {};

  const jobUniqueId = jobDetails.job_unique_id || 'N/A';
  const jobTitle = jobDetails.job_title || jobDetails.score_details?.job_role || candidate.job_title || 'Software Developer';
  const jobRoleType = jobDetails.job_role_type || 'N/A';
  const jobDomain = jobDetails.job_domain || 'N/A';
  const jobLevelOfPosition = jobDetails.job_level_of_position || 'N/A';
  const jobDepartment = jobDetails.job_department || 'N/A';
  const jobSummary = jobDetails.job_job_summary || 'No job summary provided.';
  const keyResponsibilities = jobDetails.job_key_responsibilities?.split('\r\n').filter(Boolean) || [];
  const candidateRequirements = jobDetails.job_candidate_requirements?.split('\r\n').filter(Boolean) || [];
  const evaluationMetrics = jobDetails.job_evaluation_metrics || 'No evaluation metrics provided.';
  const additionalInputs = jobDetails.job_additional_inputs || '';

  // --- Start of New/Modified Location Logic ---
  const rawJobLocation = jobDetails.job_location;
  const jobOnsiteDetails = jobDetails.job_onsite || {};

  let displayJobLocation;
  if (rawJobLocation && rawJobLocation.toLowerCase() === 'remote') {
    displayJobLocation = 'Remote';
  } else {
    // Construct the onsite location string
    const city = jobOnsiteDetails.city || '';
    const state = jobOnsiteDetails.State || ''; // Note: "State" with capital S
    const country = jobOnsiteDetails.country || '';

    const parts = [city, state, country].filter(Boolean); // Filter out empty strings
    displayJobLocation = parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }
  // --- End of New/Modified Location Logic ---

  const jobSalary = jobDetails.job_salary || 'Not specified';
  const jobIsActive = jobDetails.job_is_active || 'inactive';

  const renderListContent = (contentArray, defaultText) => {
    if (contentArray && contentArray.length > 0) {
      return (
        <ul className="cp_m_list-items">
          {contentArray.map((item, index) => (
            <li key={index} className="cp_m_list-item">{item}</li>
          ))}
        </ul>
      );
    }
    return <p className="cp_m_text-content">{defaultText}</p>;
  };

  return (
    <div className="cp_m_modal-overlay" onClick={onClose}>
      <div className="cp_m_modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cp_m_modal-header">
          <h2 className="cp_m_modal-title">Job Details</h2>
          <button className="cp_m_modal-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="cp_m_modal-body">
          <div className="cp_m_job-main-info">
            <div className="cp_m_job-title-section">
              <h3 className="cp_m_job-title">{jobTitle}</h3>
              <p className="cp_m_job-id">ID: {jobUniqueId}</p>
              <div className="cp_m_job-meta-details">
                <span className="cp_m_meta-item">Type: {jobRoleType}</span>
                <span className="cp_m_meta-item">Level: {jobLevelOfPosition}</span>
                <span className="cp_m_meta-item">Department: {jobDepartment}</span>
                <span className="cp_m_meta-item">Salary: {jobSalary}</span>
                
                {/* --- Location with Icon --- */}
                <span className="cp_m_meta-item cp_m_location-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {displayJobLocation}
                </span>
                {/* --- End Location with Icon --- */}

                <span className={`cp_m_status-badge cp_m_${jobIsActive.toLowerCase()}`}>
                  {jobIsActive}
                </span>
              </div>
            </div>
          </div>

          <div className="cp_m_section">
            <h4 className="cp_m_section-title">Job Summary</h4>
            <p className="cp_m_text-content">{jobSummary}</p>
          </div>

          <div className="cp_m_section">
            <h4 className="cp_m_section-title">Key Responsibilities</h4>
            {renderListContent(keyResponsibilities, 'No key responsibilities listed.')}
          </div>

          <div className="cp_m_section">
            <h4 className="cp_m_section-title">Candidate Requirements</h4>
            {renderListContent(candidateRequirements, 'No candidate requirements listed.')}
          </div>

          <div className="cp_m_section">
            <h4 className="cp_m_section-title">Evaluation Metrics</h4>
            <p className="cp_m_text-content">{evaluationMetrics}</p>
          </div>

          {additionalInputs && (
            <div className="cp_m_section">
              <h4 className="cp_m_section-title">Additional Inputs</h4>
              <p className="cp_m_text-content">{additionalInputs}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;