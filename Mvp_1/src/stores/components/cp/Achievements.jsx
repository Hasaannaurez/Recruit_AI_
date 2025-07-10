// components/cp/Achievements.jsx
import React from 'react';
import { FaAward } from 'react-icons/fa'; // Icon for Achievements
import './Achievements.css'; // New CSS file for achievements

const Achievements = ({ achievements }) => {
  if (!achievements || achievements.length === 0) {
    return (
      <div className="cp_achievements-container">
        <div className="cp_achievements-header">
          <h3>🏆 Key Achievements</h3>
        </div>
        <div className="cp_no-achievements-message">
          No key achievements listed.
        </div>
      </div>
    );
  }

  return (
    <div className="cp_achievements-container">
      <div className="cp_achievements-header">
          <h3>🏆 Key Achievements</h3>
      </div>
      <ul className="cp_achievements-list">
        {achievements.map((achievement, index) => (
          <li key={index} className="cp_achievement-item">
            {achievement}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Achievements;