// components/cp/Certifications.jsx
import React from 'react';
import { FaTrophy, FaInfoCircle } from 'react-icons/fa'; // Using FontAwesome icons
import './Certifications.css';

const Certifications = ({ generalDetails }) => {
  const certifications = generalDetails?.certifications || [];
  const additional_info = generalDetails?.additional_info || [];

  const hasContent = (certifications && certifications.length > 0 && certifications[0].name) ||
                     (additional_info && additional_info.length > 0);

  if (!hasContent) {
    return (
      <div className="cp_certifications-container">
        <div className="cp_section-header">
          <h3>Certifications & Additional Info</h3>
        </div>
        <div className="cp_no-data-message">
          No certifications or additional information available.
        </div>
      </div>
    );
  }

  return (
    <div className="cp_certifications-container">

      {/* Certifications Section */}
      <div className="cp_certifications-section">
        <h4 className="cp_subsection-title">Certifications:</h4>
        {certifications && certifications.length > 0 && certifications[0].name ? (
          <div className="cp_certifications-list">
            {certifications.map((cert, index) => (
              <div key={index} className="cp_certification-item">
                <span className="cp_certification-name">{cert.name}</span>
                {cert.organization && (
                  <span className="cp_certification-org"> - {cert.organization}</span>
                )}
                {cert.year && (
                  <span className="cp_certification-year"> ({cert.year})</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="cp_no-data-message-small">
            No certifications available
          </div>
        )}
      </div>

      {/* Additional Info Section */}
      <div className="cp_additional-info-section">
        <div className="cp_info-header">
          <h4>ℹ️ Additional Information</h4>
        </div>
        {additional_info && additional_info.length > 0 ? (
          <ul className="cp_additional-info-list">
            {additional_info.map((info, index) => (
              <li key={index} className="cp_additional-info-item">
                {info}
              </li>
            ))}
          </ul>
        ) : (
          <div className="cp_no-data-message-small">
            No additional information available
          </div>
        )}
      </div>
    </div>
  );
};

export default Certifications;