// Enhanced DropDownContainer Component
import React, { useState, useRef, useEffect } from 'react';
import { postRequest } from '../../../utils/apiclient.jsx'; // Adjust the import path as necessary
import './DropDownContainer.css'; // Adjust the import path as necessary

const DropDownContainer = ({ id, refreshProfile }) => {
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
    
    // Validate all fields
    const subjects = Object.values(addcomments.subjects);
    const comments = Object.values(addcomments.comments);
    
    if (subjects.some(subject => !subject.trim()) || comments.some(comment => !comment.trim())) {
      setError('Please fill in all Subject and Comment fields');
      return;
    }

    console.log('Submitting comments:', addcomments);
    
    try {
      const response = await postRequest(`c/add_comments/${id}/`, addcomments);
      if (response.status === 200) {
        console.log('Comments added successfully:', response.data);
        setOpen(false);
        setAddcomments({
          subjects: { 0: "" },
          comments: { 0: "" }
        });
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
    <div className="dropdown-container" ref={dropdownRef}>
        <div className="cp_dropdown-content">
          <div className="cp_form-container">
            <div className="form-header">
              <h4 className="form-title">Add Your Comments</h4>
              <p className="form-subtitle">Share your feedback and observations</p>
            </div>
            
            <form className="comment-form" onSubmit={handleSubmit}>
              <div className="form-fields">
                {Object.keys(addcomments.subjects).map((index) => (
                  <div key={index} className="comment-field-group">
                    <div className="field-header">
                      <span className="field-number">#{parseInt(index) + 1}</span>
                      {Object.keys(addcomments.subjects).length > 1 && (
                        <button 
                          type="button" 
                          className="remove-field-btn" 
                          onClick={() => removeField(parseInt(index))}
                          title="Remove this comment"
                        >
                          <span className="btn-icon">🗑️</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input
                        type="text"
                        name={`subjects-${index}`}
                        value={addcomments.subjects[index] || ""}
                        onChange={(e) => handleChange(e, index, "subjects")}
                        required
                        className="form-input"
                        placeholder="Enter comment subject..."
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
                        placeholder="Enter your detailed comment here..."
                        rows="4"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="add-field-btn" 
                  onClick={addFields}
                >
                  <span className="btn-icon">➕</span>
                  Add More Comments
                </button>
                <button type="submit" className="submit-btn">
                  <span className="btn-icon">💾</span>
                  Save Comments
                </button>
              </div>
              
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
    </div>
  );
};

export default DropDownContainer;