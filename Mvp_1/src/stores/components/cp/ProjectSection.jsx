import React, { useState } from 'react'; // Import useState
import { FaRocket } from 'react-icons/fa'; // Icon for Projects
import './ProjectSection.css'; // Make sure this path is correct

const ProjectSection = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return <p className="cp_no-projects">No project details available.</p>;
  }

  return (
    <div className="cp_projects-wrapper">
      <h3 className="cp_projects-section-title">
        🚀 Projects Portfolio
      </h3>
      <div className="cp_projects-grid">
        {projects.map((project, index) => ( // Added index for key if no unique ID
          <ProjectCard key={project.title + index} project={project} />
        ))}
      </div>
    </div>
  );
};

const ProjectCard = ({ project }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  // Determine which content to display
  const displayContent = showFullDescription ? project.description : project.short_summary;

  // Check if there's a full description different from the short summary to justify a toggle
  const shouldShowToggleButton = project.description && project.description !== project.short_summary;

  return (
    <div className="cp_project-card">
      <div className="cp_project-card-header">
        <h4 className="cp_project-title">{project.title}</h4>
        {shouldShowToggleButton && (
          <span
            className={`cp_project-dropdown-arrow ${showFullDescription ? 'open' : ''}`}
            onClick={toggleDescription}
            aria-expanded={showFullDescription}
            aria-controls={`project-description-${project.title.replace(/\s+/g, '-')}`} // For accessibility
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </span>
        )}
      </div>

      {project.technologies && project.technologies.length > 0 && (
        <div className="cp_project-technologies">
          {project.technologies.map((tech, idx) => (
            <span key={idx} className="cp_project-tech-tag">{tech}</span>
          ))}
        </div>
      )}

      {/* Display either short_summary or description based on state */}
      <p
        className="cp_project-text-content"
        id={`project-description-${project.title.replace(/\s+/g, '-')}`} // For accessibility
      >
        {displayContent}
      </p>
    </div>
  );
};

export default ProjectSection;