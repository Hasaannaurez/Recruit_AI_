import { useState, useEffect } from 'react';
import Navbar_Home from '../components/Navbar_Home';
import {getRequest, postRequest} from '../../utils/apiclient';
import Dropzone from '../components/Dropzone';
import '../CssFiles/ApplicantsPage.css';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
const ApplicantPage = ({id}) => {
   const [selectedTab, setSelectedTab] = useState('All');
  const [profiles, setProfiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("processing");
  const [phases, setPhases] = useState([]); 
  const [jobtitle, setJobtitle] = useState(''); // State to hold job title
  const [jobspecificId, setJobspecificId] = useState(''); // State to hold job ID
  const [aspects, setAspects] = useState([]);
  const [scoresort, setScoresort] = useState('o_score')
  const tabs = ['All', ...phases]
  const changephasetabs = [...phases]
    const [changephase, setChangephase] =  useState({
          final_phase: ' '            
      })
const [candIds, setCandIds] = useState([]);
const [uploadbut,setUploadbut] = useState(true);
const [processing, setProcessing] = useState(false);
const [showProcessingModal, setShowProcessingModal] = useState(false);


  const fetchCandidates = async () => {
   try{
    
    const response = await getRequest(`c/candidates/?job_ids=${id}&sorted_by=${scoresort}`); 
    const response2 = await getRequest(`c/get_job_phase/${id}`) 
    const response3 = await getRequest(`c/get_all_groups/${id}`)
    console.log("Response from get_all_groups:", response3);
    console.log("Response from get_job_phase:", response2);
    console.log("Response from candidates_job:", response); 
    setProfiles(response.candidates);
    setPhases(response2.phases);
    setJobtitle(response2.job_title); // Set job title from response
    setJobspecificId(response2.job_unique_id); // Set job ID from response
    setAspects(response3.group_aspects_name_list)
      // Set phases from response
   } catch (error) {
    console.error("Error fetching candidates:", error);
   }
  };
  
  const checkProcessingStatus = async () => {
    try {
        const response = await getRequest(`c/check_status/${id}`);
        console.log("Current Status:", response.status);
        if (response.status === "processing") {
            setProcessing(true);
        }else {
            setProcessing(false); 
        }
        if (response.status === "completed") {  // Use response.status directly
            fetchCandidates();
        }

        setStatus(response.status);  // Update state after checking
    } catch (error) {
        console.error("Error checking status:", error);
    }
};

 const getPhaseStyle = (phase) => {
    switch (phase) {
      case "new_applicant":
        return "applicant_phase-new-applicant";
      case "Hired":
        return "applicant_phase-hired";
       case "Rejected":
      case "rejected":
        return "applicant_phase-rejected";
      default:
        // Check if phase contains "Interview" (case insensitive)
        if (phase && phase.toLowerCase().includes("interview")) {
          return "applicant_phase-interview-round1";
        }
        return "";
    }
  };  

  const handleFilesAdded = (newFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
        alert("Please add at least one PDF file before uploading.");
        return;
    }
    setShowModal(false);
    setUploadbut(true);
    setProcessing(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("resumes", file));  
    formData.append("job_id", id);

    console.log("Job ID in FormData:", formData.get("job_id"));
     
    
    try {
        // ❗ Await the post request
        setFiles([])
        const response = await postRequest(`c/upload/`, formData);
        console.log("Upload Response:", response);
        // 🟢 Update the UI only after a successful upload
        if (response.status === 200) {
             Swal.fire({
            title: "Resumes Uploaded successfully!",
            icon: "success",
            toast: true,
            timer: 2400,
            position: 'top-right',
            timerProgressBar: true,
            showConfirmButton: false,
        });
            setShowModal(false);
            setFiles([]);  // Clear the file list only after success
            fetchCandidates();  // 🔄 Refresh the candidate list
        } else {
            console.error("Upload error:", response);
            Swal.fire({
            title: "Upload failed! Please try again.",
            icon: "error",
            toast: true,
            timer: 2400,
            position: 'top-right',
            timerProgressBar: true,
            showConfirmButton: false,
        });
        }
    } catch (error) {
        console.error("Error uploading files:", error);
        alert("Upload failed! Please try again.");
    }
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

     const phasechange = async () => {
                try {
                    const response = await postRequest(`c/change_phase/?candidate_ids=${candIds}`, changephase);
                    console.log(response);
                }  catch (error){
                    console.log(error);
    
                }
                setCandIds([]);
                setChangephase({ final_phase: ' '});
                fetchCandidates();
            }

    // Add the row click handler like in GlobalPage
    const handleRowClick = (applicantId) => {
        window.location.href = `/Home/profiles/${applicantId}`;
    };

    // Add the select cell click handler like in GlobalPage
    const handleSelectCellClick = (applicantId, e) => {
        e.stopPropagation();
        handlePhasechange(applicantId);
    };
    

    // Filter profiles based on selected tab
    const filteredProfiles = selectedTab.length === 0 || selectedTab === 'All'
        ? profiles
        : profiles.filter(profile => profile.phase === selectedTab)
        
        const handleDelete = async () => {
          try{
              const response = await postRequest(`c/delete_candidates/?candidate_ids=${candIds}`)
              console.log(response);
              setCandIds([]);
              fetchCandidates();
          }catch (err){
              console.log(err);
          }
      }


    useEffect(() => {
  fetchCandidates();

  const interval = setInterval(() => {
    checkProcessingStatus();
  }, 5000); // Poll every 5 seconds

  return () => clearInterval(interval);
}, [id]);

    useEffect(() => {
        fetchCandidates();
    }, [scoresort])

  return (
    <>
      <Navbar_Home />
      <div className="applicant_job-container">
        <div className="applicant_job-header">
            <div className="applicant_job-title-section">
           <h1>{jobtitle}</h1>
            <p className="applicant_job-id">Job_ID: {jobspecificId}</p>
            </div>
             
             <Link to = {`/Home/aspects/${id}`} ><button className = "applicant_aspects_btn">Scoring Aspects</button></Link>

            {uploadbut && (<button className="applicant_upload-resumes-btn"onClick={() => {setShowModal(true)
    setUploadbut(false);
 }}>
            ⬆ Upload Resumes
          </button>)}
           {showModal && (
          <div className="applicant_modal-overlay">
            <div className="applicant_modal-content">
              <h2>Upload Resumes</h2>
              <div className="applicant_dropzone">
              <Dropzone onFilesAdded={handleFilesAdded} />
              <p>Number of files added: <strong>{files.length}</strong></p>
              </div>
              <button onClick={handleUpload}>Upload</button>
              <button className="applicant_close-button" onClick={() => {setShowModal(false) 
                setUploadbut(true)}}>Close</button>
            </div>
          </div>
        )}
        {processing && (
  <div className="applicant_processing-float-btn" onClick={() => setShowProcessingModal(true)}>
    <div className="applicant_processing-pulse"></div>
    <div className="applicant_processing-icon">⚙️</div>
    <span className="applicant_processing-text">Processing...</span>
  </div>
)}

{/* PROCESSING DETAILS MODAL */}
{showProcessingModal && processing && (
  <div className="applicant_modal-overlay">
    <div className="applicant_modal-content applicant_processing-modal">
      <div className="applicant_processing-header">
        <div className="applicant_processing-spinner"></div>
        <h2>Processing Resumes</h2>
      </div>
      
      <div className="applicant_processing-details">
        <p>📄 Analyzing uploaded resumes...</p>
        <p>🔍 Extracting candidate information...</p>
        <p>📊 Calculating compatibility scores...</p>
        <p>⏱️ This process may take 2-5 minutes</p>
      </div>
      
      <div className="applicant_processing-progress">
        <div className="applicant_processing-bar">
          <div className="applicant_processing-bar-fill"></div>
        </div>
        <p className="applicant_processing-status">You can navigate to the website till then</p>
      </div>
      
      <div className="applicant_processing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <button 
        className="applicant_proccessing_close-button" 
        onClick={() => setShowProcessingModal(false)}
      >
        ✕
      </button>
    </div>
  </div>
)}
            </div>
     <div className="applicant_main-content">
      <div className="applicant_sidebar">
       <div className="applicant_filter-section">
       <div className="applicant_filter-header">
         <h2>Sort by</h2>
        <button className="applicant_clear-all" onClick={() => setSelectedTab('All')}>Clear All</button>
          </div>
       <div className="applicant_filter-group">
  <div className="applicant_filter-group-header">
    <h3>Phase</h3>
    <span className="applicant_expand-icon">⌄</span>
  </div>
  <div className="applicant_filter-options">
    {tabs.map((tab) => (
      <p key={tab} className="applicant_filter-option" onClick={() => setSelectedTab(tab)}>
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

<div className="applicant_filter-group">
                <div className="applicant_filter-group-header">
                  <h3>Score</h3>
                  <span className="applicant_expand-icon">⌄</span>
                </div>
                <div className="applicant_filter-options">
                   <p  className="applicant_filter-option">
                      <input type="radio" checked={scoresort === "o_score"} onChange={() => setScoresort("o_score")} />
                      Overall Score
                    </p>
                  {aspects.map(aspect => (
                    <p key={aspect} className="applicant_filter-option">
                      <input type="radio" value={aspect} checked={scoresort === aspect} onChange={() => setScoresort(aspect)} />
                      {aspect.replace(/([A-Z])/g, ' $1')}
                    </p>
                  ))}
                </div>
              </div>
              </div>
            </div>

             <div className="applicant_applicants-section">
                    <div className="applicant_phase-section">
                    <select 
                         className = "applicant_phase-select"
                          value = {changephase.final_phase}
                            onChange = {
                                (e) => setChangephase({ final_phase: e.target.value})
                            }
                            >
                               {changephasetabs.map((tab) => (
                                    <option key={tab} value={tab}>
                                        {tab}
                                    </option>
                                ))}
                            </select>
                            <button className="applicant_phase-button" onClick={phasechange}>Update Phase</button>
                            </div> 
             {/* you've to implement wrong buttons too */}
              <div className="applicant_selection-info">
              <button className="applicant_delete-selected" onClick={handleDelete}>Delete 🗑</button>
            </div>
            <div className="applicant_applicants-table">
              <div className="applicant_table-header">
                <div className="applicant_header-cell applicant_rank-cell">Select</div>
                <div className="applicant_header-cell applicant_rank-cell">Rank</div>
                <div className="applicant_header-cell applicant_name-cell">Name</div>
                <div className="applicant_header-cell applicant_education-cell">Education</div>
                <div className="applicant_header-cell applicant_score-cell">🔽 Score</div>
                <div className="applicant_header-cell applicant_phase-cell">Phase</div>
              </div>
                 {filteredProfiles.map((applicant,index) => (
                                 <div key={applicant.id} className="applicant_table-row" onClick={() => handleRowClick(applicant.id)} style={{cursor: 'pointer'}}>
                                   <div className="applicant_table-cell applicant_checkbox-cell" onClick={(e) => handleSelectCellClick(applicant.id, e)} style={{cursor: 'pointer'}}>
                                     <input
                                       type="checkbox"
                                       checked={candIds.includes(applicant.id)}
                                       onChange={() => handlePhasechange(applicant.id)}
                                       onClick={(e) => e.stopPropagation()}
                                     />
                                   </div>
                                   <div className="applicant_table-cell applicant_rank-cell">{index+1}</div>
                                   <div className="applicant_table-cell applicant_name-cell">
                                     <Link to={`/Home/profiles/${applicant.id}`} className="applicant_applicant-name" onClick={(e) => e.stopPropagation()}>
                                       {applicant.name}
                                     </Link>
                                   </div>
                                   <div className="applicant_table-cell applicant_education-cell">{applicant.highest_degree}</div>
                                   <div className="applicant_table-cell applicant_score-cell">{applicant.overall_score} %</div>
                                   <div className="applicant_table-cell applicant_phase-cell">
                                     <span className={`applicant_phase-badge ${getPhaseStyle(applicant.phase)}`}>
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
};

export default ApplicantPage;