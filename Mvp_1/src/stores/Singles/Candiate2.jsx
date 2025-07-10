import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../CssFiles/CandidateSingle3.css'; // This CSS will now contain the column layout
import { getRequest } from '../../utils/apiclient'; // Removed postRequest as it's not used here
import Navbar_Home from '../components/Navbar_Home';
import AIFeedback from '../components/cp/AIFeedback.jsx';
import SkillsMatrix from '../components/cp/SkillsMatrix.jsx';
import WorkExperience from '../components/cp/WorkExperience.jsx';
import ProjectSection from '../components/cp/ProjectSection.jsx';
import Scorecard from '../components/cp/Scorecard.jsx';
import CertificationsAchievements from '../components/cp/Certifications.jsx';
import Achievements from '../components/cp/Achievements.jsx';
import NameCard from '../components/cp/NameCard.jsx';
import ProfileSummary from '../components/cp/ProfileSummary.jsx';
import Education from '../components/cp/Education.jsx';
import UnifiedCommentsBox from '../components/cp/FeedbackBox.jsx';
const Candidate2 = () => {
  const { profiles_id, id } = useParams();
  const [candidate, setCandidate] = useState(null);

  const fetchCandidate = async () => {
    try {
      const response = await getRequest(`c/candidate/${id}`);
      setCandidate(response);
      console.log("Candidate loaded:", response);
    } catch (error) {
      console.error("Error fetching candidate:", error);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [id, profiles_id]);

  if (!candidate) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading candidate profile...</p>
      </div>
    );
  }

  return (
    <div className="candidate-page">
      <Navbar_Home/>

      <div className="candidate-content-wrapper">
        {/* Main two-column layout for dynamic content */}

        <div className="cp_main-columns">

          <div className="cp_left-column">
            {/* Top three sections */}
            <NameCard candidate={candidate} />
            <ProfileSummary candidate={candidate} />
            <Education candidate={candidate} />
            
            {/* Cards for the left column */}
            <WorkExperience workExperience={candidate.general_details.work_experience}/>
            <ProjectSection projects={candidate.general_details.projects}/>
            <Achievements achievements={candidate.general_details.key_achievement}/>
          </div>

          <div className="cp_right-column">
            {/* Cards for the right column */}
            <Scorecard
              scoreDetails={candidate.score_details}
              scoresLookup={candidate.scores_lookup}
            />
            <SkillsMatrix skills={candidate.general_details.skills}/>
            <CertificationsAchievements generalDetails={candidate.general_details} />
          </div>
        </div>

        {/* AIFeedback - below the columns, spanning full width */}
        <AIFeedback feedback={candidate.feedback_details} />
        <UnifiedCommentsBox candidate={candidate} id={id} refreshProfile={fetchCandidate} />
      </div>
    </div>
  );
};

export default Candidate2;