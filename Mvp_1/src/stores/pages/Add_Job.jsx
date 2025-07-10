import React, { useState } from 'react';
import Navbar_Home from '../components/Navbar_Home';
import '../CssFiles/Add_Job.css';
import { postRequest } from '../../utils/apiclient';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
const Add_Job = () => {
    const [jobData, setJobData] = useState({
        job_unique_id: '',
        title: '',
        role_type: '',
        level_of_position: '',
        domain: '',
        department: '',
        role_definition: {
            job_summary: '',
            key_responsibilities: ''
        },
        candidate_requirements: '',
        evaluation_metrics: '',
        additional_inputs: '',
        user: localStorage.getItem('username') || '',
    });
    

    const navigate = useNavigate();
    const [questionnaire, setQuestionnaire] = useState({
        title: '',
        domain: '',
        level_of_position: '',
        role_type: '',
        department: '',
        role_definition: {
            job_summary: '',
            key_responsibilities: ''
        },
        candidate_requirements: '',
        evaluation_metrics: '',
        additional_inputs: '',
    });
    

    const [error, setError] = useState('');
    const [expandedExamples, setExpandedExamples] = useState({});

    const toggleExample = (exampleId) => {
        setExpandedExamples(prev => ({
            ...prev,
            [exampleId]: !prev[exampleId]
        }));
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // For jobData state
        setJobData((prevState) => {
            // Create a copy of the state
            const newState = { ...prevState };
            
            // Handle nested properties
            if (name === 'job_summary') {
                newState.role_definition = {
                    ...prevState.role_definition,
                    job_summary: value
                };
            } else if (name === 'key_responsibilities') {
                newState.role_definition = {
                    ...prevState.role_definition,
                    key_responsibilities: value
                };
            } else {
                newState[name] = value;
            }
            
            return newState;
        });
    
        // For questionnaire state
        setQuestionnaire((prevState) => {
            // Create a copy of the state
            const newState = { ...prevState };
            
            // Handle role_definition nested properties
            if (name === 'job_summary') {
                newState.role_definition = {
                    ...prevState.role_definition,
                    job_summary: value
                };
            } else if (name === 'key_responsibilities') {
                newState.role_definition = {
                    ...prevState.role_definition,
                    key_responsibilities: value
                };
            }
            // For regular fields, update normally
            else if(name !== 'job_unique_id') {
                newState[name] = value;
            }
            
            return newState;
        });
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
      
        if (!jobData.user) {
            setError('User information is missing. Please log in again.');
          
            return;
        }

        try {
            // Post job data
            const jobResponse = await postRequest('job/save_1st_form/', jobData);
            if (jobResponse.status !== 200) {
                throw new Error('Failed to add job');
            }

            console.log('jobResponse:', jobResponse.data);

            const updatedQuestionnaire = {
                ...questionnaire,
                job_id: jobResponse.data.job_id, // Pass the job ID
            };

            const questionnairePayload = JSON.stringify(updatedQuestionnaire);
            // Post questionnaire data
           console.log('updatedQuestionnaire:', questionnairePayload);

           postRequest('q/questionnaire', questionnairePayload);
           Swal.fire({
                      title: "Job Role Created Succesfully",
                      icon: "success",
                      toast: true,
                      timer: 2000,
                      position: 'top-right',
                      timerProgressBar: true,
                      showConfirmButton: false,
            });
            navigate('/Home');
        } catch (err) {
            console.error('Job Creation Error:', err);
            setError(err?.response?.data?.detail || err.message || 'An error occurred while adding the job');
        }
    };

    return (
        <>
            <Navbar_Home />
            <div className="add-job-container">
                <div className="header">
                    <h1>
                        <span className="header-icon">📋</span>
                        Job Role Creation Form
                    </h1>
                    <p className="header-subtitle">Create a comprehensive job posting with detailed requirements and evaluation criteria</p>
                </div>

                <div className="role-form-container">
                    <div className="progress-indicator">
                        <div className="progress-step active">
                            <div className="step-number">1</div>
                            <span>Basic Details</span>
                        </div>
                        <div className="progress-step active">
                            <div className="step-number">2</div>
                            <span>Role Definition</span>
                        </div>
                        <div className="progress-step active">
                            <div className="step-number">3</div>
                            <span>Requirements</span>
                        </div>
                    </div>
                    
                    <form className="role-form" onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h2 className="section-title">
                                <span className="section-icon">🏢</span>
                                Basic Job Details
                            </h2>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        Unique Job ID
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="job_unique_id"
                                        value={jobData.job_unique_id}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="e.g., SWE-2024-001"
                                    />
                                    <p className="field-description">A unique identifier to distinguish between job roles, especially those with the same title.</p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Job Title
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={jobData.title}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                        placeholder="e.g., Senior Software Engineer"
                                    />
                                    <p className="field-description">The official title of the position.</p>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        Role Type
                                        <span className="required">*</span>
                                    </label>
                                    <select
                                        className="form-input"
                                        name="role_type"
                                        value={jobData.role_type}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Full-Time">Full-Time</option>
                                        <option value="Part-Time">Part-Time</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Level of Position
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="level_of_position"
                                        value={jobData.level_of_position}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                        placeholder="e.g., Senior, Mid-Level"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        Domain
                                        <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="domain"
                                        value={jobData.domain}
                                        onChange={handleChange}
                                        required
                                        className="form-input"
                                        placeholder="e.g., AI/ML, Finance, Cybersecurity"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={jobData.department}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="e.g., Engineering, Sales"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h2 className="section-title">
                                <span className="section-icon">📝</span>
                                Role Definition
                            </h2>
                            
                            <div className="form-group">
                                <label className="form-label">
                                    Job Summary
                                    <span className="required">*</span>
                                </label>
                                <textarea
                                    name="job_summary"
                                    value={jobData.role_definition.job_summary}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Provide a brief overview of the role, highlighting its purpose and significance"
                                    rows="4"
                                />
                                <p className="field-description">A brief overview of the role, highlighting its purpose and significance within the organization.</p>
                                
                                <div className="example-toggle" onClick={() => toggleExample('jobSummary')}>
                                    <span className="toggle-icon">{expandedExamples.jobSummary ? '📖' : '💡'}</span>
                                    View Example {expandedExamples.jobSummary ? '▼' : '▶'}
                                </div>
                                {expandedExamples.jobSummary && (
                                    <div className="example-text">
                                        <p style={{ textAlign: "left" }}><em>As a Senior Software Engineer, you will be responsible for designing, developing, and optimizing scalable web applications. You will collaborate with cross-functional teams to build robust, high-performance systems that support our growing user base. Your work will directly impact product efficiency and customer experience.</em></p>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Key Responsibilities
                                    <span className="required">*</span>
                                </label>
                                <textarea
                                    name="key_responsibilities"
                                    value={jobData.role_definition.key_responsibilities}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="List the primary duties and tasks associated with the job"
                                    rows="6"
                                />
                                <p className="field-description">A detailed list of the primary duties and tasks associated with the job.</p>
                                
                                <div className="example-toggle" onClick={() => toggleExample('keyResponsibilities')}>
                                    <span className="toggle-icon">{expandedExamples.keyResponsibilities ? '📖' : '💡'}</span>
                                    View Example {expandedExamples.keyResponsibilities ? '▼' : '▶'}
                                </div>
                                {expandedExamples.keyResponsibilities && (
                                    <div className="example-text">
                                        <p style={{ textAlign: "left" }}><em>Develop and maintain scalable backend services using Node.js and MongoDB.<br/>
                                        Work closely with the product team to understand business requirements and translate them into technical solutions.<br/>
                                        Ensure application security, performance, and reliability.<br/>
                                        Lead and mentor junior developers.<br/>
                                        Collaborate with DevOps to optimize deployment pipelines and cloud infrastructure.</em></p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-section requirements-section">
                            <div className="requirements-intro">
                                <h3>💡 AI-Powered Hiring Foundation</h3>
                                <p style={{ textAlign: "left" }}>The sections below (Candidate Requirements and Evaluation Metrics) are the foundation of your hiring process. A well-defined structure ensures the AI accurately evaluates, scores, and shortlists candidates, automating the most time-consuming aspects of hiring.</p>
                                <p style={{ textAlign: "left" }}><strong>Pro Tip:</strong> Precise inputs lead to reliable, unbiased, and high-quality shortlists, while unclear criteria can result in misranked or overlooked candidates.</p>
                            </div>

                            <h2 className="section-title">
                                <span className="section-icon">👤</span>
                                Candidate Requirements
                            </h2>
                            
                            <div className="example-toggle" onClick={() => toggleExample('candidateRequirements')}>
                                <span className="toggle-icon">{expandedExamples.candidateRequirements ? '📖' : '💡'}</span>
                                View Example {expandedExamples.candidateRequirements ? '▼' : '▶'}
                            </div>
                            {expandedExamples.candidateRequirements && (
                                <div className="example-text full-width">
                                    <p style={{ textAlign: "left" }}><em>Education: Bachelor's or Master's degree in Computer Science, Software Engineering, or a related field.</em></p>
                                    <p style={{ textAlign: "left" }}><em>Experience:<br/>
                                    Backend Development (5+ years): Hands-on experience in designing, developing, and maintaining scalable backend systems.<br/>
                                    System Architecture: Experience in architecting distributed systems, microservices, and API-driven applications.<br/>
                                    Performance Optimization: Proven ability to optimize database queries, reduce latency, and enhance system efficiency.<br/>
                                    Production-Scale Experience: Experience working on high-traffic applications with real-world deployment in cloud environments.</em></p>
                                    <p style={{ textAlign: "left" }}><em>Technical Skills:<br/>
                                    Proficiency in JavaScript and Node.js, with experience in backend frameworks (e.g., Express.js, NestJS).<br/>
                                    Strong expertise in database technologies such as MongoDB, PostgreSQL, and Redis.<br/>
                                    Deep understanding of RESTful API design, authentication mechanisms (OAuth, JWT), and GraphQL.<br/>
                                    Familiarity with event-driven architecture, message queues (Kafka, RabbitMQ), and caching strategies.</em></p>
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label className="form-label">Candidate Requirements</label>
                                <textarea
                                    name="candidate_requirements"
                                    value={jobData.candidate_requirements}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Outline the necessary education, relevant experience, skills, specific knowledge, and any certifications required for the role"
                                    rows="10"
                                />
                                <p className="field-description">Outline the necessary education, relevant experience, skills, specific knowledge, and any certifications or licenses required for the role.</p>
                            </div>
                        </div>

                        <div className="form-section evaluation-section">
                            <h2 className="section-title">
                                <span className="section-icon">📊</span>
                                Evaluation Metrics & Shortlisting Strategy
                            </h2>
                            
                            <div className="criteria-explanation">
                                <div className="criteria-card essential">
                                    <div className="criteria-header">
                                        <span className="criteria-icon">⭐</span>
                                        <h3>Essential Criteria</h3>
                                    </div>
                                    <p>Must-have qualifications for consideration (specific skills, experience level, technical knowledge)</p>
                                </div>
                                <div className="criteria-card desirable">
                                    <div className="criteria-header">
                                        <span className="criteria-icon">✨</span>
                                        <h3>Desirable Criteria</h3>
                                    </div>
                                    <p>Good-to-have qualifications that make candidates stronger fits (additional skills, certifications, achievements)</p>
                                </div>
                            </div>

                            <div className="example-toggle" onClick={() => toggleExample('evaluationMetrics')}>
                                <span className="toggle-icon">{expandedExamples.evaluationMetrics ? '📖' : '💡'}</span>
                                View Example {expandedExamples.evaluationMetrics ? '▼' : '▶'}
                            </div>
                            {expandedExamples.evaluationMetrics && (
                                <div className="example-text full-width">
                                    <div className="example-section">
                                        <h4 style={{ textAlign: "left" }}>🔴 Essential:</h4>
                                        <p style={{ textAlign: "left" }}><em>Education: Minimum of a Bachelor's degree in Computer Science, Software Engineering, or a related field.<br/><br/>
                                        Experience:<br/>
                                        5+ years of hands-on experience in backend development with a focus on building scalable applications.<br/>
                                        Proven track record of developing and maintaining production-level backend systems.<br/>
                                        Experience in architecting and optimizing high-performance APIs and microservices.<br/><br/>
                                        Technical Skills:<br/>
                                        Strong proficiency in JavaScript/TypeScript and Node.js.<br/>
                                        Experience with databases (SQL - PostgreSQL, MySQL; NoSQL - MongoDB, Redis).<br/>
                                        Expertise in designing RESTful APIs and GraphQL APIs.<br/>
                                        Solid understanding of system design, scalability, and performance optimization.<br/>
                                        Hands-on experience with cloud platforms (AWS, GCP, or Azure) and containerization tools like Docker & Kubernetes.</em></p>
                                    </div>
                                    
                                    <div className="example-section">
                                        <h4 style={{ textAlign: "left" }}>🟢 Desirable:</h4>
                                        <p style={{ textAlign: "left" }}><em>Advanced Education: Master's degree in Computer Science, Data Engineering, or related fields.<br/><br/>
                                        Additional Technical Skills:<br/>
                                        Knowledge of Go, Python, or Rust in addition to JavaScript/TypeScript.<br/>
                                        Familiarity with event-driven architectures (Kafka, RabbitMQ, or Pub/Sub).<br/>
                                        Experience implementing CI/CD pipelines and automated testing strategies.<br/><br/>
                                        Leadership & Growth:<br/>
                                        Led a team of developers or mentored junior engineers.<br/>
                                        Contributed to open-source projects or published technical blogs.<br/><br/>
                                        Certifications: AWS Certified Solutions Architect (or relevant cloud certification) is highly preferred.</em></p>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Evaluation Metrics</label>
                                <textarea
                                    name="evaluation_metrics"
                                    value={jobData.evaluation_metrics}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Define the key aspects to assess candidates, including skills, experience, education, achievements, certifications, and other performance metrics"
                                    rows="10"
                                />
                                <p className="field-description">Define the key aspects to assess candidates, including skills, experience, education, achievements, certifications, and other performance metrics. Provide clear evaluation guidelines to ensure accurate scoring and shortlisting.</p>
                            </div>
                        </div>

                        <div className="form-section">
                            <h2 className="section-title">
                                <span className="section-icon">➕</span>
                                Additional Inputs
                            </h2>
                            
                            <div className="form-group">
                                <label className="form-label">Additional Specifications</label>
                                <textarea
                                    name="additional_inputs"
                                    value={jobData.additional_inputs}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Any further specifications, preferences, role-specific conditions, or other instructions"
                                    rows="4"
                                />
                                <p className="field-description">Any further specifications, preferences, role-specific conditions, or other instructions on how you want candidates to be evaluated to ensure precise candidate evaluation.</p>
                            </div>
                        </div>

                        {error && (
                            <div className="error">
                                <span className="error-icon">⚠</span>
                                {error}
                            </div>
                        )}

                        <div className="submit-section">
                            <button type="submit" className="submit-btn">
                                Create Job Role
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Add_Job;