import React from 'react';
import './SkillsMatrix.css';

const extractSkill = (skillsArray, key) => {
  const obj = skillsArray.find(item =>
    Object.keys(item)[0].toLowerCase().includes(key.toLowerCase())
  );
  return obj ? Object.values(obj)[0].filter(skill => skill.trim() !== "") : [];
};

const TagList = ({ title, items, emptyText, className }) => (
  <div className="skill-group">
    <div className="group-title">{title}</div>
    {items?.length > 0 ? (
      <div className={`tag-container ${className}`}>
        {items.map((item, idx) => (
          <span key={idx} className={`tag ${className}`}>{item}</span>
        ))}
      </div>
    ) : (
      <div className="empty-text">{emptyText}</div>
    )}
  </div>
);

const SkillsMatrix = ({ skills }) => {
  if (!skills) return null;

  const tech = skills.technical_skills || [];

  const programming_languages = extractSkill(tech, 'Programming languages');
  const frameworks = extractSkill(tech, 'frameworks');
  const tools = extractSkill(tech, 'tools');
  const databases = extractSkill(tech, 'databases');
  const domain_skills = skills.domain_skills?.filter(skill => skill.trim() !== '') || [];
  const soft_skills = skills.soft_skills?.filter(skill => skill.trim() !== '') || [];

  return (
    <div className="skills-matrix-wrapper">
      <h3 className="skills-matrix-title">⚡ Skills Matrix</h3>

      <div className="s_section">
        <h4 className="s_section-title">💻 Technical Skills</h4>
        <TagList title="Programming Languages" items={programming_languages} className="green" emptyText="No programming languages listed" />
        <TagList title="Frameworks" items={frameworks} className="purple" emptyText="No frameworks listed" />
        <TagList title="Tools" items={tools} className="orange" emptyText="No tools listed" />
        <TagList title="Databases" items={databases} className="gray" emptyText="No databases listed" />
      </div>

      <div className="s_section">
        <h4 className="s_section-title">🎯 Domain Skills</h4>
        <TagList items={domain_skills} className="blue" emptyText="No domain skills listed" />
      </div>

      <div className="s_section">
        <h4 className="s_section-title">🤝 Soft Skills</h4>
        <TagList items={soft_skills} className="soft" emptyText="No soft skills listed" />
      </div>
    </div>
  );
};

export default SkillsMatrix;
