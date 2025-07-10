import React, { useState } from 'react';
import { FaLaptopCode, FaExternalLinkAlt } from 'react-icons/fa'; // Import necessary icons
import './NameCard.css';
import JobDetailsModal from './JobDetailsModal';

const NameCard = ({ candidate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Helper to safely get nested data, considering multiple potential paths
  const getNested = (obj, paths, defaultValue = '') => {
    for (const path of paths) {
      const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
      if (value !== undefined && value !== null && value !== "") { // Check for non-empty string too
        return value;
      }
    }
    return defaultValue;
  };

  const candidateName = getNested(candidate, ['name', 'general_details.personal_info.name']);
  const jobTitle = getNested(candidate, ['job_title', 'score_details.job_role', 'general_details.personal_info.job_title']);
  const JobId = getNested(candidate, ['job_unique_id']);
  const experienceLevel = getNested(candidate, ['job_level_of_position', 'general_details.personal_info.experience_level']);
  const employmentType = getNested(candidate, ['job_role_type', 'general_details.personal_info.employment_type']);
  const location = getNested(candidate, ['job_location', 'general_details.personal_info.location']);
  const status = getNested(candidate, ['job_is_active', 'general_details.personal_info.status']);

  const jobPortalLink = getNested(candidate, ['job_details.job_portal_link']); // Placeholder, adjust path if needed

  // Filter out contact details that have empty values
  const filteredContactDetails = (candidate.general_details?.personal_info?.contact_details || []).filter(
    contact => Object.values(contact)[0] !== ""
  );

  return (
    <>
      <div className="cp_n_name-card cp_n_section-box">
        {/* Candidate Name Section (TOP HEADER) */}
        <div className="cp_n_candidate-name-section">
          <h1 className="cp_n_candidate-name">{candidateName}</h1>
        </div>

        {/* Job Role, Status, and View Details Button */}
        <div className="cp_n_job-info-row"> {/* New wrapper for this entire row */}
          {/* Status Badge (Leftmost) */}
          <div className="cp_n_status-info-inline">
            <span className={`cp_n_status-badge cp_n_${status ? status.toLowerCase() : 'active'}`}>
              {status || 'active'}
            </span>
          </div>

          {/* Job Title and External Link */}
          <div className="cp_n_job-title-main"> {/* Grouping Job Title and External Link */}
            <FaLaptopCode className="cp_n_role-icon" />
            <span className="cp_n_role-title">{jobTitle}</span>
            {jobPortalLink && (
              <a href={jobPortalLink} target="_blank" rel="noopener noreferrer" className="cp_n_external-link">
                <FaExternalLinkAlt />
              </a>
            )}
          </div>
          
          {/* View Details Button (Right of Job Title with gap) */}
          <button className="cp_n_view-details-btn" onClick={handleViewDetails}>
            View Details
          </button>
        </div>

        {/* Role Details - ID, Level, Type, Location */}
        <div className="cp_n_role-details">
          <span className="cp_n_role-detail-item">Job Id: {JobId}</span>
          {experienceLevel && <span className="cp_n_role-detail-item">{experienceLevel}</span>}
          {employmentType && <span className="cp_n_role-detail-item">{employmentType}</span>}
          {location && <span className="cp_n_role-detail-item">{location}</span>}
        </div>

        {/* Contact Info in a Row */}
        <div className="cp_n_contact-info">
          {filteredContactDetails.map((contact, index) => {
            const [type, value] = Object.entries(contact)[0];

            let icon;
            if (type === 'email') {
              icon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
            } else if (type === 'phone') {
              icon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
            } else if (type === 'address') {
              icon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
            } else if (type === 'linkedin') {
              icon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
            } else if (type === 'portfolio') {
              icon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-globe"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
            } else if (type === 'other' && value) {
              icon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L9.5 3.5"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L14.5 20.5"></path></svg>;
            }

            return (
              <div key={index} className="cp_n_contact-item">
                <div className="cp_n_contact-icon">{icon}</div>
                <span className="cp_n_contact-value">
                  {type === 'linkedin' && value === 'LinkedIn' ? 'LinkedIn' :
                   type === 'portfolio' && value === 'Portfolio' ? 'Portfolio' : value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <JobDetailsModal
        candidate={candidate}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default NameCard;