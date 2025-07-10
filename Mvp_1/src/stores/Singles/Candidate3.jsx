import React, { useState, useEffect, useRef } from 'react';
import { useParams} from 'react-router-dom';
import { getRequest, postRequest } from '../../utils/apiclient';
import '../CssFiles/CandidateSingle2.css';
import Navbar_Home from '../components/Navbar_Home'; // Assuming Navbar_Home is in the same directory
import Swal from 'sweetalert2';
// ScoreMeter Component: Renders the arc meter with overall score.
// ScoreMeter Component: Renders the arc meter with overall score.
const ScoreMeter = ({ candidate }) => {
  const [showScoresPopup, setShowScoresPopup] = useState(false);
  const overall_score = candidate.score_details.o_score;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * ((100 - overall_score) / 100);
  
  return (
    <>
      <div className="overall-score section-box">
        <div className="score-header">
          <div className="score-circle">
            <svg className="arc-meter" width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="arc-bg"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                className="arc-progress"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                transform="rotate(-90 60 60)"
              />
              <text
                x="60"
                y="55"
                fontSize="23"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#4F46E5"
              >
                {overall_score}%
              </text>
              <text
                x="60"
                y="75"
                fontSize="12"
                fontWeight="500"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#6B7280"
              >
                Overall Score
              </text>
            </svg>
          </div>
          <button 
            className="view-more-details-btn"
            onClick={() => setShowScoresPopup(true)}
          >
            View More Details
          </button>
        </div>
      </div>

      {/* Scores Lookup Popup */}
      {showScoresPopup && (
        <div className="scores-popup-overlay" onClick={() => setShowScoresPopup(false)}>
          <div className="scores-popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="scores-popup-header">
              <h3>Scores Lookup</h3>
              <button 
                className="close-popup-btn"
                onClick={() => setShowScoresPopup(false)}
              >
                ×
              </button>
            </div>
            <div className="scores-lookup-grid">
              {candidate.scores_lookup && Object.entries(candidate.scores_lookup).map(([key, value], index) => (
                <div key={index} className="score-lookup-item">
                  <span className="score-lookup-label">{key}</span>
                  <span className="score-lookup-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
// PersonalDetails Component: Renders the candidate's personal info.
const PersonalDetails = ({ candidate }) => (
  <div className="personal-info section-box">
    <div className="profile-header">
      <div className="profile-avatar">
        <div className="avatar-circle">
          {candidate.general_details?.personal_info?.name?.charAt(0) || 'U'}
        </div>
      </div>
      <div className="profile-info">
        <h1 className="candidate-name">{candidate.general_details?.personal_info?.name}</h1>
        <p className="candidate-title">{candidate.job_title || candidate.score_details?.job_role || 'Candidate'} Candidate</p>
        <div className="contact-info">
          {candidate.general_details?.personal_info?.contact_details?.map((contact, index) =>
            Object.entries(contact)[0][1] && (
              <div key={index} className="contact-item">
                <div className="contact-icon">
                  {Object.entries(contact)[0][0] === 'email' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  )}
                  {Object.entries(contact)[0][0] === 'phone' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  )}
                  {Object.entries(contact)[0][0] === 'address' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  )}
                </div>
                <span className="contact-value">{Object.entries(contact)[0][1]}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  </div>
);
// Profile Summary Component: Renders the profile summary.
const ProfileSummary = ({ candidate }) => (
  candidate.general_details?.profile_summary && (
    <div className="profile-summary section-box">
      <h3 className="section-title">Profile Summary</h3>
      <p className="summary-text">{candidate.general_details.profile_summary}</p>
    </div>
  )
);
// Education Component: Renders the education details.
const Education = ({ candidate }) => (
  <div className="education-section section-box">
    <h3 className="section-title">Education</h3>
    <div className="highest-degree-badge">
      <span>Highest Degree: {candidate.general_details?.highest_degree}</span>
    </div>
    <div className="education-list">
      {candidate.general_details?.education?.map((edu, index) => (
        <div key={index} className="education-item">
          <h4 className="degree-title">{edu.degree}</h4>
        <div className="edu-main-content">
          <div className="edu-left">
            <p className="institution">{edu.institution}</p>
            <div className="grade-info">
              <span className="grade-label">Grade:</span>
              <span className="grade-value">{edu.grade}</span>
            </div>
          </div>
          <div className="graduation-year">
            Expected {edu.graduation_year}
          </div>
        </div>
        </div>
      ))}
    </div>
  </div>
);

// ScoreDetails Component: Renders evaluation scores with progress bars.
const ScoreDetails = ({ candidate }) => {
  const scoreDetails = candidate.score_details;

  return (
    <div className="score-details section-box">
      <h3 className="section-title">Evaluation Scores</h3>
      <p className="job-role">Job Role: {candidate.job_title || scoreDetails?.job_role}</p>
      <div className="scores-grid">
        {scoreDetails && Object.entries(scoreDetails).map(([key, value], index) => {
          if (key !== 'o_score' && key !== 'job_role') {
            const displayName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return (
              <div key={index} className="score-item">
                <div className="score-header">
                  <span className="score-label">{displayName}</span>
                  <span className="score-percentage">{value}%</span>
                </div>
                <div className="score-bar">
                  <div className="score-fill" style={{width: `${value}%`}}></div>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

// WorkExperience Component: Renders work experience.
const WorkExperience = ({ candidate }) => {
  const [showDetails, setShowDetails] = useState([]);

  useEffect(() => {
    const length = candidate?.general_details?.work_experience?.length || 0;
    setShowDetails(new Array(length).fill(false));
  }, [candidate?.general_details?.work_experience?.length]);

  const toggleDetails = (index) => {
    const updated = [...showDetails];
    updated[index] = !updated[index];
    setShowDetails(updated);
  };

  return (
    <div className="work-experience section-box">
      <h3 className="section-title">Work Experience</h3>
      {candidate.general_details?.work_experience && candidate.general_details.work_experience.length > 0 ? (
        <div className="experience-timeline">
          {candidate.general_details.work_experience.map((exp, index) => (
            <div key={index} className="experience-item">
              <div className="experience-header">
                <h4 className="job-title">{exp.job_title || 'Position Not Specified'}</h4>
                <button
                  className="show-details-btn"
                  onClick={() => toggleDetails(index)}
                >
                  {showDetails[index] ? 'Show Less' : 'Show More'}
                </button>
              </div>
              
              <div className="experience-basic-info">
                <p className="company-name">
                  <strong>Company:</strong> {exp.company || 'Company Not Specified'}
                </p>
                <p className="duration">
                  <strong>Duration:</strong> {exp.duration || 'Duration Not Specified'}
                </p>
              </div>
              
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="work-tech">
                  <h5>Technologies Used:</h5>
                  <div className="tech-tags">
                    {exp.technologies.map((tech, i) => (
                      <span key={i} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {exp.short_summary && (
                <p className="work-summary">
                  <strong>Summary:</strong> {exp.short_summary}
                </p>
              )}

              <div className={`work-details-box ${showDetails[index] ? 'visible' : ''}`}>
                {exp.description && (
                  <div className="job-description-section">
                    <h4>Job Description:</h4>
                    <p className="job-description">{exp.description}</p>
                  </div>
                )}

                {exp.highlights && exp.highlights.length > 0 && (
                  <div className="highlights-section">
                    <h4>Highlights:</h4>
                    <ul className="highlights-list">
                      {exp.highlights.map((highlight, i) => (
                        <li key={i} className="highlight-item">{i+1}. {highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="achievements-section">
                    <h4>Achievements:</h4>
                    <ul className="achievements-list">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="achievement-item">{i+1}. {achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-experience">
          <div className="no-experience-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <p className="no-experience-text">No work experience available</p>
          <p className="no-experience-subtext">This candidate hasn't added any work experience yet.</p>
        </div>
      )}
    </div>
  );
};
// Projects Component: Renders candidate projects.
const Projects = ({ candidate }) => {
  const [showDescList, setShowDescList] = useState([]);

  useEffect(() => {
    const length = candidate?.general_details?.projects?.length || 0;
    setShowDescList(new Array(length).fill(false));
  }, [candidate?.general_details?.projects?.length]);

  const toggleDescription = (index) => {
    const updated = [...showDescList];
    updated[index] = !updated[index];
    setShowDescList(updated);
  };

  return (
    <div className="projects-section section-box">
      <h3 className="section-title">Projects</h3>
      <div className="projects-grid">
        {candidate.general_details?.projects?.map((project, index) => (
          <div key={index} className="project-card">
            <div className="project-header">
              <h4 className="project-title">{project.title}</h4>
              <button
                className="show-more-btn"
                onClick={() => toggleDescription(index)}
              >
                {showDescList[index] ? 'Show Less' : 'Show More'}
              </button>
            </div>
            <p className="project-summary">Summary: {project.short_summary}</p>

            <div className={`project-description-box ${showDescList[index] ? 'visible' : ''}`}>
              <p className="project-description">Description: {project.description}</p>
            </div>

            <div className="project-tech">
              <h5>Technologies Used:</h5>
              <div className="tech-tags">
                {project.technologies.map((tech, i) => (
                  <span key={i} className="tech-tag">{tech}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// KeyAchievements Component: Renders key achievements.
const KeyAcheivements = ({ candidate }) => (
  candidate.general_details?.key_achievements && (
    <div className="key-achievements section-box">
      <h3 className="section-title">Key Achievements</h3>
      <div className="achievements-list">
        {candidate.general_details.key_achievements.map((achievement, index) => (
          <div key={index} className="achievement-item">
            <div className="achievement-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
            </div>
            <span className="achievement-text">{achievement}</span>
          </div>
        ))}
      </div>
    </div>
  )
);

const JobDetails = ({ candidate }) => {
  return (
    <div className="Candidate_job-details section-box">
      <h3 className="Candidate_section-title">Job Details</h3>
      
      <div className="Candidate_job-info-grid">
        <div className="Candidate_job-role">
          <span className="Candidate_job-role-label">Job Level:</span>
          <span className="Candidate_job-role-value">{candidate.job_level_of_position || 'Not specified'}</span>
        </div>
        
        <div className="Candidate_job-location">
          <span className="Candidate_job-location-label">Location:</span>
          <span className="Candidate_job-location-value">{candidate.job_location || 'Not specified'}</span>
        </div>
        
        <div className="Candidate_job-salary">
          <span className="Candidate_job-salary-label">Salary:</span>
          <span className="Candidate_job-salary-value">{candidate.job_salary || 'Not specified'}</span>
        </div>
        
        <div className="Candidate_job-status">
          <span className="Candidate_job-status-label">Status:</span>
          <span className={`Candidate_job-status-value ${candidate.job_active ? 'active' : 'inactive'}`}>
            {candidate.job_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
      
      <div className="Candidate_job-description">
        <span className="Candidate_job-description-label">Description:</span>
        <p className="Candidate_job-description-value">{candidate.job_job_summary || 'No description available'}</p>
      </div>
    </div>
  );
}
// Skills Component: Renders technical, domain, and soft skills.
const Skills = ({ candidate }) => (
  <div className="skills-section section-box">
    <h3 className="section-title">Skills</h3>
    
    <div className="technical-skills">
      <h4 className="skill-category-title">Technical Skills</h4>
      {candidate.general_details?.skills?.technical_skills?.map((skillCategory, index) => (
        <div key={index} className="skill-category">
          {Object.entries(skillCategory).map(([category, skills]) => (
            <div key={category} className="skill-subcategory">
              <h5 className="skill-subcategory-title">{category.toUpperCase()}</h5>
              <div className="skill-tags">
                {Array.isArray(skills)
                  ? skills.map((skill, i) => <span key={i} className="skill-tag technical">{skill}</span>)
                  : <span className="skill-tag technical">No skills listed</span>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
    
    <div className="domain-skills">
      <h4 className="skill-category-title">Domain Skills</h4>
      <div className="skill-tags">
        {candidate.general_details?.skills?.domain_skills?.map((skill, index) => (
          <span key={index} className="skill-tag domain">{skill}</span>
        ))}
      </div>
    </div>
    
    <div className="soft-skills">
      <h4 className="skill-category-title">Soft Skills</h4>
      <div className="skill-tags">
        {candidate.general_details?.skills?.soft_skills?.map((skill, index) => (
          <span key={index} className="skill-tag soft">{skill}</span>
        ))}
      </div>
    </div>
  </div>
);
// Certifications Component: Renders certifications.
const Certifications = ({ candidate }) => (
  candidate.general_details?.certifications && candidate.general_details.certifications.length > 0 && (
    <div className="certifications-section section-box">
      <h3 className="section-title">Certifications</h3>
      <div className="certifications-list">
        {candidate.general_details.certifications.map((cert, index) => (
          <div key={index} className="certification-item">
            <h4 className="cert-name">{cert.name}</h4>
            <p className="cert-organization">{cert.organization}</p>
            <span className="cert-year">{cert.year}</span>
          </div>
        ))}
      </div>
    </div>
  )
);
// AdditionalInfo Component: Renders additional information.
const AdditionalInfo = ({ candidate }) => (
  candidate.general_details?.additional_info && candidate.general_details.additional_info.length > 0 && (
    <div className="additional-info-section section-box">
      <h3 className="section-title">Additional Information</h3>
      <div className="additional-info-list">
        {candidate.general_details.additional_info.map((info, index) => (
          <div key={index} className="additional-info-item">
            <div className="info-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"/>
                <path d="M12,17h0"/>
              </svg>
            </div>
            <span className="info-text">{info}</span>
          </div>
        ))}
      </div>
    </div>
  )
);
const AIFeedback = ({ feedback }) => {
     const [showadvantages, setShowadvantages] = useState(false);
  const [showdisadvantages, setShowdisadvantages] = useState(false);
  const [showfitoverview, setShowfitoverview] = useState(false);
  const [showrecommendations, setShowrecommendations] = useState(false);
  const [showredflags, setShowredflags] = useState(false);
  return(
    <div className="candidate_AI_feedback">
      <h3 className="candidate_section-title">AI Feedback</h3>
      <div className="candidate_AI_feedback-content">
        {feedback ? (
          <div className="feedback-details">

            <button className="feedback-toggle advantages-toggle" onClick={() => setShowadvantages(!showadvantages)}>
              {showadvantages ? 'Hide Advantages' : 'Show Advantages'}
            </button>

            {feedback.advantages && feedback.advantages.length > 0  && showadvantages && (
              <div className="feedback-advantages">
                <h4 className="feedback-title">Advantages</h4>
                <ul className="feedback-list">
                  {feedback.advantages.map((advantage, index) => (
                    <li key={index} className="feedback-item">{advantage}</li>
                  ))}
                </ul>
              </div>
            )}
            <button className="feedback-toggle disadvantages-toggle" onClick={() => setShowdisadvantages(!showdisadvantages)}>
              {showdisadvantages ? 'Hide Disadvantages' : 'Show Disadvantages'}
            </button>

            {feedback.disadvantages && feedback.disadvantages.length > 0 && showdisadvantages && (
              <div className="feedback-disadvantages">
                <h4 className="feedback-title">Disadvantages</h4>
                <ul className="feedback-list">
                  {feedback.disadvantages.map((disadvantage, index) => (
                    <li key={index} className="feedback-item">{disadvantage}</li>
                  ))}
                </ul>
              </div>
            )}

            <button className="feedback-toggle fit-overview-toggle" onClick={() => setShowfitoverview(!showfitoverview)}>
              {showfitoverview ? 'Hide Fit Overview' : 'Show Fit Overview'}
            </button>

            {feedback.fit_overview && showfitoverview && (
              <div className="feedback-fit-overview">
                <h4 className="feedback-title">Fit Overview</h4>
                <p className="feedback-text">{feedback.fit_overview}</p>
              </div>
            )}
 
            <button className="feedback-toggle recommendations-toggle" onClick={() => setShowrecommendations(!showrecommendations)}>
              {showrecommendations ? 'Hide Recommendations' : 'Show Recommendations'}
            </button>
            {feedback.recommendations && feedback.recommendations.length > 0 && showrecommendations && (
              <div className="feedback-recommendations">
                <h4 className="feedback-title">Recommendations</h4>
                <ul className="feedback-list">
                  {feedback.recommendations.map((Recomendation, index) => (
                    <li key={index} className="feedback-item">{Recomendation}</li>
                  ))}
                </ul>
              </div>
            )}

            <button className="feedback-toggle red-flags-toggle" onClick={() => setShowredflags(!showredflags)}>
              {showredflags ? 'Hide Red Flags' : 'Show Red Flags'}
            </button>

            {feedback.red_flags && feedback.red_flags.length > 0 && showredflags && (
              <div className="feedback-red-flags">
                <h4 className="feedback-title">Red Flags</h4>
                <ul className="feedback-list">
                  {feedback.red_flags.map((redFlag, index) => (
                    <li key={index} className="feedback-item">{redFlag}</li>
                  ))}
                </ul>
               </div>
            )}
          </div>

        ) : (
          <p className="no-feedback">No AI feedback available</p>
        )}
        </div>
    </div>
  )
}


// FeedbackBox Component: Renders the comments section.
const FeedbackBox = ({ candidate, id, refreshProfile }) => {
  const [selectedComments, setSelectedComments] = useState([]);
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const handleCommentSelect = (key) => {
    setSelectedComments(prev => {
      const newSelected = prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key];
      setShowDeleteButton(newSelected.length > 0);
      return newSelected;
    });
  };

  const handleDeleteComments = async () => {
  try {
    // Try different request formats - use whichever works with your API
    const deleteData = {
      keys_to_delete: selectedComments  // or try comment_keys if that's what your API expects
    };
    
    const response = await postRequest(`c/delete_comments/${id}/`, deleteData);
    console.log('Delete response:', response); // Check what response you get
    
    setSelectedComments([]);
    setShowDeleteButton(false);
    await refreshProfile();
  } catch (error) {
    console.error('Error deleting comments:', error);
    alert('Failed to delete comments. Check console for details.');
  }
};

  return (
    <div className="comments-box section-box">
      <h3 className="section-title">Comments</h3>
      {candidate.comments && Object.keys(candidate.comments.comments).length > 0 ? (
        <div className="comments-list">
          {Object.keys(candidate.comments.comments).map((key) => (
            <div 
  key={key} 
  className="comment-card" 
  style={{textAlign: 'left', cursor: 'pointer'}}
  onClick={() => handleCommentSelect(key)}
  >
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
            <div style={{flex: 1}}>
              <h4 className="comment-subject">{candidate.comments.subjects[key]}</h4>
              <p className="comment-text">{candidate.comments.comments[key]}</p>
            </div>
          </div>
        </div>
          ))}
        </div>
      ) : (
        <div className="no-comments">
          <p>No comments available</p>
        </div>
      )}
    </div>
  );
};
// DropDownContainer Component: Renders the comment submission dropdown.
const DropDownContainer = ({id, refreshProfile}) => {
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [addcomments, setAddcomments] = useState({
  subjects: { 0: "" },
  comments: { 0: "" }
});



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!addcomments.subjects || !addcomments.comments) {
      setError('Please enter both Subject and Comment');
      return;
    }
      console.log('Submitting comments:', addcomments);
    try {
      const response = await postRequest(`c/add_comments/${id}/`, addcomments);
      if (response.status === 200) {
        console.log('Comments added successfully:', response.data);
        setOpen(false);
        setAddcomments( {subjects: { 0: "" },
                         comments: { 0: "" }});
        await refreshProfile();
      } else {
        throw new Error(`Failed to add comments: ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.response?.data?.detail || err.message || 'An error occurred while adding the comment');
    }
  };

  const addFields = () => {
    const newIndex = Object.keys(addcomments.subjects).length;
    setAddcomments((prevState) => ({
      subjects: { ...prevState.subjects, [newIndex]: "" },
      comments: { ...prevState.comments, [newIndex]: "" }
    }));
  };

  const removeField = (indexToRemove) => {
    setAddcomments((prevState) => {
      const newSubjects = {};
      const newComments = {};
      
      Object.keys(prevState.subjects).forEach((key, index) => {
        if (index !== indexToRemove) {
          const newIndex = index > indexToRemove ? index - 1 : index;
          newSubjects[newIndex] = prevState.subjects[key];
          newComments[newIndex] = prevState.comments[key];
        }
      });
      
      return {
        subjects: newSubjects,
        comments: newComments
      };
    });
  };

  const handleChange = (e, index, field) => {
    const { value } = e.target;
    setAddcomments((prevState) => ({
      ...prevState,
      [field]: {
        ...prevState[field],
        [index]: value
      }
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown-container section-box" ref={dropdownRef}>
      <button className="dropdown-button" onClick={() => setOpen(!open)}>
        <svg className="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        {open ? "Hide" : "Add"} Comments
      </button>
      {open && (
        <div className="dropdown-content">
          <div className="role-form-container">
            <h4 className="form-title">Add Your Comments</h4>
            <form className="role-form" onSubmit={handleSubmit}>
              {Object.keys(addcomments.subjects).map((index) => (
                <div key={index} className="comment-form-group">
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      name={`subjects-${index}`}
                      value={addcomments.subjects[index] || ""}
                      onChange={(e) => handleChange(e, index, "subjects")}
                      required
                      className="form-input"
                      placeholder="Enter Subject"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comment</label>
                    <textarea
                      name={`comments-${index}`}
                      value={addcomments.comments[index] || ""}
                      onChange={(e) => handleChange(e, index, "comments")}
                      required
                      className="form-textarea"
                      placeholder="Enter your comment here."
                      rows="3"
                    />
                  </div>
                  {Object.keys(addcomments.subjects).length > 1 && (
                    <button 
                      type="button" 
                      className="delete-btn" 
                      onClick={() => removeField(parseInt(index))}
                    >
                      <svg className="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addFields}>
                <svg className="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add More
              </button>
              <button type="submit" className="submit-btn">
                Add Comments
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


const ShareButton = ({id, collaborators}) => {
  
  const [showemail, setShowemail] = useState(false);
   const [emaildata, setEmaildata] = useState({
      email: '',
      access_level: 'view',
   })
   const [showcollaborators, setShowcollaborators] = useState(false);
   
   const [showShareOptions, setShowShareOptions] = useState(false);


  const handlecopylink = async (e) => {
     
    setShowShareOptions(false);

    e.preventDefault();
    const linkToCopy = `http://localhost:5173/Home/cp?id=${id}`;
   try {
      await navigator.clipboard.writeText(linkToCopy);
      Swal.fire({
        title: "Link Copied to Dashboard, Note: Only collaborators can view this link",
        icon: "success",
        toast: true,
        timer: 2000,
        position: 'top-right',
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
    }

  };
     
   const handleSubmit = async (e) => {
      e.preventDefault();
     
     setShowemail(false);

      if (!emaildata.email) {
        alert("Please enter an email address.");
        return;
      }

    
      console.log("Email data:", emaildata);
      try {
           const response = await postRequest(`c/share_cp/${id}/`, emaildata);
           console.log('Response:', response);
             if (response.status === 200) {
            Swal.fire({
            title: "Candidate profile shared successfully!",
            icon: "success",
            toast: true,
            timer: 2000,
            position: 'top-right',
            timerProgressBar: true,
            showConfirmButton: false,
      });
          }
          }
          catch (error) {
           console.error('Error sharing candidate profile:', error);
           }
  
   }
  
   const handleChange = (e) => {
      const {name, value} = e.target;
      setEmaildata((prevState) => ({
          ...prevState,
          [name]: value,
      })) 
   }


  return (
    <div className="share-button-container">
      <button 
        className="top-share-button"
        onClick={() => setShowShareOptions(!showShareOptions)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Share
      </button>
      {showShareOptions && (
        <div className="share-dropdown">
            <button
              className="share-option"
              onClick={handlecopylink}
              >
              Copy Link
            </button>
         
         <button
              className="share-option"
              onMouseEnter={() => setShowcollaborators(true)}
              onMouseLeave={() => setShowcollaborators(false)}
            >
              Already shared with
            </button>
             {showcollaborators && (
              <div className="collaborators-list">
                <h4>Collaborators:</h4>
                <ul>
                  {collaborators.map((collaborator, index) => (
                    <li key={index} className="collaborator-item">
                      <span className="collaborator-email">{collaborator}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
           <button
              className="share-option"
              onClick={() => {
                setShowemail(!showemail);
              }}
            >
              Add more collaborators
            </button>

         {showemail && (
            <form className="share-cp-content" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={emaildata.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Access Level</label>
                <select
                  name="access_level"
                  value={emaildata.access_level}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="view">View</option>
                  <option value="edit">Edit</option>
                </select>
              </div>
              <button className="submit-button" type="submit">
                Submit
              </button>
            </form>
          )}
            
        </div>
      )}
    </div>
  );
};
// Main Candidate2 Component
const Candidate3 = () => {
  const { profiles_id, id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [ishovered, setIshovered] = useState(false);
  const [showJobDetails, setShowJobDetails] = useState(false); 

  const fetchprofiles = async () => {
    try {
      const response = await getRequest(`c/candidate/${id}`);
      setCandidate(response);
      console.log(response);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  useEffect(() => {
    fetchprofiles();
  }, [profiles_id, id]);

  if (!candidate) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading candidate profile...</p>
      </div>
    );
  }

return (
    <div className="candidate-main-container">
      <Navbar_Home />
      
      <div className="candidate-container">
        <div className="page-header">
          <div className="page-title">
            <h2>{candidate.job_title || candidate.score_details?.job_role || 'Job Role'}</h2>
            <div className="Candidate_info-wrapper">
              <button 
                className='Candidate_info-button' 
                onMouseEnter={() => setIshovered(true)} 
                onMouseLeave={() => setIshovered(false)}
                onClick={() => setShowJobDetails(!showJobDetails)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9,9h0a3,3,0,0,1,6,0c0,2-3,3-3,3"/>
                  <path d="M12,17h0"/>
                </svg>
              </button>
              {(ishovered && !showJobDetails) && (
                <div className="tooltip">Click on the icon for viewing job details</div>
              )}
              {showJobDetails && <JobDetails candidate={candidate} />}
            </div>
          </div>
          <ShareButton id={id} collaborators={candidate.shared_with}/>
        </div>
        
        <div className="upper">
          <div className="left-column">
  <PersonalDetails candidate={candidate} />
  <ProfileSummary candidate={candidate} />
  <Education candidate={candidate} />
  <WorkExperience candidate={candidate} />
  <KeyAcheivements candidate={candidate} />
</div>
          
          <div className="right-column">
  <ScoreMeter candidate={candidate} />
  <ScoreDetails candidate={candidate} />
  <Skills candidate={candidate} />
  <Certifications candidate={candidate} />
  <AdditionalInfo candidate={candidate} />
</div>
        </div>
        
        <div className="lower">
          <Projects candidate={candidate} />
          <div className="bottom-section">
            <div className="top-section">
            <AIFeedback feedback={candidate.feeback_details} />
            </div>

            <div className="left-section">
              <FeedbackBox candidate={candidate} id={id} refreshProfile={fetchprofiles} />
            </div>
            <div className="right-section">
              <DropDownContainer id={id} refreshProfile={fetchprofiles} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Candidate3;