import Navbar_Home from "../components/Navbar_Home";
import { useState, useEffect } from 'react';
import { getRequest, postRequest } from "../../utils/apiclient";
import '../CssFiles/Globalpage.css';
import { Link } from "react-router-dom";

const GlobalPage = () => {
    const [status, setStatus] = useState();
    const [jobRoles, setJobRoles] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedTab, setSelectedTab] = useState('All');
    const [allCandidates, setAllCandidates] = useState([]);
    const [changephase, setChangephase] = useState({
        final_phase: ' ' 
    })
    const [candIds, setCandIds] = useState([]);
    const [phases, setPhases] = useState([]);
    const [allphases, setAllphases] = useState([]);
    const tabs = ['All', ...phases];
    
    const fetchcandidates = async () => {
        try {
            const response = await getRequest(`c/candidates/?job_ids=${selectedIds}`);
            console.log(response);

            setCandidates(response.candidates);
            setPhases(response.phases)
        } catch (error) {
            console.log(error);
        }
    }

    const handleCheckboxChange = (jobId) => {
        setSelectedIds((prevSelectedIds) => {
            if (prevSelectedIds.includes(jobId)) {
                return prevSelectedIds.filter((id) => id !== jobId);
            } else {
                return [...prevSelectedIds, jobId];
            }
        });        
    };

    const handlePhasechange = (jobId) => {
        setCandIds((prevSelectedIds) => {
            if (prevSelectedIds.includes(jobId)) {
                return prevSelectedIds.filter((id) => id !== jobId);
            } else {
                return [...prevSelectedIds, jobId];
            }
        });        
    };

    const handleClearAll = () => {
        setSelectedTab('All');
        setSelectedIds([]);
    };

    const handleRowClick = (applicantId) => {
        window.location.href = `/Home/profiles/${applicantId}`;
    };

    const handleSelectCellClick = (applicantId, e) => {
        e.stopPropagation();
        handlePhasechange(applicantId);
    };

    const getPhaseStyle = (phase) => {
        switch (phase) {
            case "new_applicant":
                return "Global_phase-new-applicant";
            case "Hired":
                return "Global_phase-hired";
            case "Rejected":
            case "rejected":
                return "Global_phase-rejected";
            default:
                if (phase && phase.toLowerCase().includes("interview")) {
                    return "Global_phase-interview-round1";
                }
                return "";
        }
    };

    const filteredCandidates = selectedTab.length === 0 || selectedTab.includes('All')
        ? candidates
        : candidates.filter(profile => selectedTab.includes(profile.phase));

    const phasechange = async () => {
        try {
            const response = await postRequest(`c/change_phase/?candidate_ids=${candIds}`, changephase);
            console.log(response);
        } catch (error) {
            console.log(error);
        }
        setCandIds([]);
        fetchcandidates();
    }

    const handleDelete = async () => {
        try {
            const response = await postRequest(`c/delete_candidates/?candidate_ids=${candIds}`)
            console.log(response);
            setCandIds([]);
            fetchcandidates();
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (selectedIds.length === 0) {
            setCandidates(allCandidates);
            setPhases(allphases);
        } else {
            fetchcandidates();
        } 
    }, [selectedIds]);

    useEffect(() => {
        const getJobRoles = async () => {
            try {
                const response = await getRequest('c/job_data/');
                setJobRoles(response.jobs);
                const response2 = await getRequest('c/candidates/');
                console.log(response2);
                setAllCandidates(response2.candidates);
                setCandidates(response2.candidates);
                setPhases(response2.phases)
                setAllphases(response2.phases)
            } catch (error) {
                console.log(error);
            }
        }
        getJobRoles();
    }, []);

    return (
        <>
            <Navbar_Home />
            <div className="Global_job-container">
                <div className="Global_job-header">
                    <div className="Global_job-title-section">
                        <h1>All Applications</h1>
                    </div>
                </div>
                <div className="Global_main-content">
                    <div className="Global_sidebar">
                        <div className="Global_filter-section">
                            <div className="Global_filter-header">
                                <h2>Sort by</h2>
                                <button className="Global_clear-all" onClick={handleClearAll}>Clear All</button>
                            </div>
                            <div className="Global_filter-group">
                                <div className="Global_filter-group-header">
                                    <h3>Phase</h3>
                                    <span className="Global_expand-icon">⌄</span>
                                </div>
                                <div className="Global_filter-options">
                                    {tabs.map((tab) => (
                                            <p key={tab} className="Global_filter-option" onClick={() => setSelectedTab(tab)}>
                                                <input
                                                    type="radio"
                                                    name="phaseFilter"
                                                    value={tab}
                                                    checked={selectedTab === tab}
                                                    onChange={() => setSelectedTab(tab)}
                                                />
                                                {tab.replace(/([A-Z])/g, ' $1')}
                                            </p>
                                        ))}
                                </div>
                            </div>
                            <div className="Global_filter-group">
                                <div className="Global_filter-group-header">
                                    <h3>JobRoles</h3>
                                    <span className="Global_expand-icon">⌄</span>
                                </div>
                                <div className="Global_filter-options">
                                    {jobRoles.map(role => (
                                        <p key={role.job_id} className="Global_filter-option" onClick={() => handleCheckboxChange(role.job_id)}>
                                            <input type="checkbox" checked={selectedIds.includes(role.job_id)} onChange={() => handleCheckboxChange(role.job_id)} />
                                            {role.job_title.replace(/([A-Z])/g, ' $1')}
                                        </p>
                                    ))}
                                </div>
                            </div>  
                        </div>
                    </div>
                    <div className="Global_applicants-section">
                        <div className="Global_phase-section">
                            <select 
                                className="Global_phase-select"
                                value={changephase.final_phase}
                                onChange={(e) => setChangephase({ final_phase: e.target.value })}
                            >
                                {phases.map((tab) => (
                                    <option key={tab} value={tab}>
                                        {tab}
                                    </option>
                                ))}
                            </select>
                            <button className="Global_phase-button" onClick={phasechange}>Update Phase</button>
                        </div> 
                        <div className="Global_selection-info">
                            <button className="Global_delete-selected" onClick={handleDelete}>Delete 🗑</button>
                        </div>
                        <div className="Global_applicants-table">
                            <div className="Global_table-header">
                                <div className="Global_header-cell Global_rank-cell">Select</div>
                                <div className="Global_header-cell Global_name-cell">Name</div>
                                <div className="Global_header-cell Global_education-cell">Job Title</div>
                                <div className="Global_header-cell Global_phase-cell">Phase</div>
                            </div>
                            {filteredCandidates.map((applicant, index) => (
                                <div key={applicant.id} className="Global_table-row" onClick={() => handleRowClick(applicant.id)} style={{cursor: 'pointer'}}>
                                    <div className="Global_table-cell Global_checkbox-cell" onClick={(e) => handleSelectCellClick(applicant.id, e)} style={{cursor: 'pointer'}}>
                                        <input
                                            type="checkbox"
                                            checked={candIds.includes(applicant.id)}
                                            onChange={() => handlePhasechange(applicant.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className="Global_table-cell Global_name-cell">
                                        <Link to={`/Home/profiles/${applicant.id}`} className="Global_applicant-name" onClick={(e) => e.stopPropagation()}>
                                            {applicant.name}
                                        </Link>
                                    </div> 
                                    <div className="Global_table-cell Global_education-cell">{applicant.job_title}</div>     
                                    <div className="Global_table-cell Global_phase-cell">
                                        <span className={`Global_phase-badge ${getPhaseStyle(applicant.phase)}`}>
                                            {applicant.phase === "new_applicant" && "👤"}
                                            {applicant.phase && applicant.phase.toLowerCase().includes("interview") && "❄️"}
                                            {applicant.phase === "Hired" && "✓"}
                                            {(applicant.phase === "Rejected" || applicant.phase === "rejected") && "❌"}
                                            {" " + applicant.phase}
                                        </span>
                                    </div>
                                </div>    
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GlobalPage;