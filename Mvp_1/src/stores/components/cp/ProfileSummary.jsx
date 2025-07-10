import React from 'react';
import './ProfileSummary.css';

const ProfileSummary = ({ candidate }) => (
  <div className="cp_p_profile-summary cp_p_section-box">
    <div className="cp_p_section-header">
      <h3 className="cp_p_section-title">📋 Profile Summary</h3>
    </div>
    <div className="cp_p_summary-content">
      <p className="cp_p_summary-text">
        {candidate.general_details?.profile_summary}
      </p>
    </div>
  </div>
);

export default ProfileSummary;