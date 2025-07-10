import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getRequest, postRequest } from '../../utils/apiclient';
import Swal from 'sweetalert2';
import '../CssFiles/QuestionarieSingle.css';

const QuestionnarieSingle = ({ id, onComplete }) => {
    const [questionnarie, setQuestionnarie] = useState(null);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [formErrors, setFormErrors] = useState({});
    const Navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const questionsResponse = await getRequest(`q/fetch-questions/${id}`);
                setQuestionnarie(questionsResponse || {});
                
                const answersResponse = await getRequest(`/q/fetch-answers/${id}/`);
                setAnswers(answersResponse.answers || {});
                
            } catch (err) {
                setError(err.message);
                console.error("Error fetching data:", err);
            } finally {  
                setLoading(false);
            }
        };
                                         
        fetchData();
    }, [id]);

    // Helper function to get questions data correctly
    const getQuestionsData = (questionnarie) => {
        if (!questionnarie || !questionnarie.questions) {
            return { categories: [] };
        }
        return typeof questionnarie.questions === 'string'
            ? JSON.parse(questionnarie.questions)
            : questionnarie.questions;
    };

    const handleInputChange = (categoryIndex, questionIndex, value) => {
        setAnswers(prevAnswers => ({
            ...prevAnswers,
            [`${categoryIndex}-${questionIndex}`]: value,
        }));
        
        // Clear the error for this field when user starts typing
        if (formErrors[`${categoryIndex}-${questionIndex}`]) {
            setFormErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[`${categoryIndex}-${questionIndex}`];
                return newErrors;
            });
        }
    };

    const validateForm = (questionsData) => {
        const newErrors = {};
        let isValid = true;
        
        questionsData.categories.forEach((category, categoryIndex) => {
            category.questions.forEach((question, questionIndex) => {
                const key = `${categoryIndex}-${questionIndex}`;
                if (!answers[key] || answers[key].trim() === '') {
                    newErrors[key] = "Please fill out this field";
                    isValid = false;
                }
            });
        });
        
        setFormErrors(newErrors);
        return isValid;
    };

    const handleLogout = () => {
        Swal.fire({ 
            title: "Are you sure?", 
            icon: "warning", 
            showCancelButton: true, 
            confirmButtonColor: "#3085d6", 
            cancelButtonColor: "#d33", 
            confirmButtonText: "Yes, Log Out!" 
        }).then((result) => { 
            if (result.isConfirmed) { 
                localStorage.removeItem('access_token');
                localStorage.removeItem('username');
                localStorage.removeItem('refresh_token');
                
                Swal.fire({ 
                    title: "Logged Out!",  
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.replace('/SignIN');
                });
            } 
        });
    }

    const handleRecruitAIClick = () => {
        Navigate('/Home');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const questionsData = getQuestionsData(questionnarie);
        
        // Validate all fields before submission
        if (!validateForm(questionsData)) {
            // Scroll to the first error
            const firstErrorField = document.querySelector('.error-message');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setLoading(true);
        try {
            const updatedAnswers = { ...answers };
            const payload = { answers: updatedAnswers };
            const response2 = await postRequest(`q/save-answers/${id}/`, payload);
            const response4 =  postRequest(`q/issues_fixes_and_aspects/${id}/`);
            
            // Show success alert
            Swal.fire({
                title: "Submitted Successfully!",
                icon: "success",
                showConfirmButton: false,
                timer: 2000
            });
            
            onComplete();
            
        } catch (error) {
            console.error("Error during submission:", error);
            alert("Submission failed! Please try again.");
        }
        setLoading(false);
    };

    const handleSavedraft = async (e) => {
        e.preventDefault();
    
        try {
            // No validation for draft saves
            const payload = { answers };
            console.log("Draft Save Payload:", JSON.stringify(payload, null, 2));
    
            const response = await postRequest(`/q/save-as-draft/${id}/`, payload);
            
            // Showing success alert
            Swal.fire({
                title: "Draft Saved Successfully!",
                icon: "success",
                showConfirmButton: false,
                timer: 1500
            });
    
            Navigate('/Home');
    
        } catch (error) {
            console.error("Error saving as draft:", error);
            alert("Draft save failed!");
        }
    };
    
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    
    const questionsData = getQuestionsData(questionnarie);

    return (
        <div>
            {/* Navbar */}
            <div className="job-role">
                <div className="div">
                    <div className="group">
                        <div className="frame">
                            {/* Left side - Recruit AI and navigation items */}
                            <div className="left-nav-section">
                                <div className="div-wrapper" onClick={handleRecruitAIClick} style={{ cursor: 'pointer' }}>
                                    <div className="text-wrapper">Recruit AI</div>
                                </div>

                                <div className="frame-2">
                                    <div className="frame-4">
                                        <div className="text-wrapper-2">
                                            <Link to="/Home">
                                                <li>Home</li>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="frame-4">
                                        <div className="text-wrapper-2">
                                            <Link to="/Home/profiles">
                                                <li>Candidate Profiles</li>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="frame-4">
                                        <div className="text-wrapper-2">
                                            <Link to="/Home/JobOpenings">
                                                <li>Job Openings</li>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Logout button */}
                            <div className="right-nav-section">
                                <div className="frame-5" onClick={handleLogout}>
                                    <div className="logout-content">
                                        <svg className="logout-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <div className="text-wrapper-4">
                                            <li>Log Out</li>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questionnaire Content */}
            <div className="questionnaire-container">
                <h1>Questionnaire</h1>
                <form onSubmit={handleSubmit}>
                    {questionsData.categories.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="category">
                            {category.name === "Missing Fields" ? (<h2>Required Data</h2>) : (<h2>{category.name}</h2>)}
                            
                            {category.questions.map((question, questionIndex) => {
                                const fieldKey = `${categoryIndex}-${questionIndex}`;
                                return (
                                    <div key={questionIndex} className="question">
                                        <label>{question}</label>
                                        <textarea
                                            placeholder="Your answer..."
                                            value={answers[fieldKey] || ''}
                                            onChange={(e) =>
                                                handleInputChange(categoryIndex, questionIndex, e.target.value)
                                            }
                                            className={formErrors[fieldKey] ? "input-error" : ""}
                                            rows="4"
                                        />
                                        {formErrors[fieldKey] && (
                                            <div className="error-message">{formErrors[fieldKey]}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    <div className="button-group">
                        <button type="submit" className="submit-button">Submit Responses</button>
                        <button type="button" onClick={handleSavedraft} className="submit-button">Save Draft</button>
                    </div>
                </form>
            </div>  
        </div>
    );
};

export default QuestionnarieSingle;