import { Link } from "react-router-dom";
import '../CssFiles/ApplicantsPage.css';
import { useState,useEffect } from 'react'
import React from 'react'


const CandidateList = ({profiles, title}) => {

    const [sortedprofiles, setSortedprofiles] = useState([])

    useEffect(() => {
        const sorted = [...profiles].sort((a, b) => b.overallScore.percentage - a.overallScore.percentage);
        setSortedprofiles(sorted);
    }, [profiles]);
    
    console.log("sortedprofiles:", sortedprofiles);

return (
    <div className="candidate-list">
        <h1>{title}</h1>
        {sortedprofiles.map((profile) => (
            <div className="profile-preview" key={profile.generalDetails.name}>
            <Link to ={`/Home/profiles/${profile.generalDetails.name}`}>
        <h2>{ profile.generalDetails.name }</h2>
        </Link>
        {/* <button onClick={() => BlogDelete(blog.id)}>delete blog</button> */}
        </div>
        ))}
    </div>
  )
}
export default CandidateList