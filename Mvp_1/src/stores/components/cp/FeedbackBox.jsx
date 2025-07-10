// Unified Comments Component
import React, { useState, useRef, useEffect } from 'react';
import { postRequest } from '../../../utils/apiclient.jsx';
import './FeedbackBox.css';

const UnifiedCommentsBox = ({ candidate, id, refreshProfile }) => {
  const [selectedComments, setSelectedComments] = useState([]);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  // dropdownRef and showAddForm state are now effectively unused if the form is always visible and there's no toggle
  const [error, setError] = useState('');
  const [addCommentData, setAddCommentData] = useState({ // Renamed state for clarity
    subject: "",
    comment: ""
  });

  const handleCommentSelect = (key) => {
    setSelectedComments(prev => {
      const newSelected = prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key];
      setShowDeleteButton(newSelected.length > 0);
      return newSelected;
    });
  };

  const handleDeleteComments = async () => {
    if (selectedComments.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedComments.length} comment(s)?`)) {
      try {
        const deleteData = {
          indices: selectedComments
        };

        const response = await postRequest(`c/delete_comments/${id}/`, deleteData);
        console.log('Delete response:', response);

        setSelectedComments([]);
        setShowDeleteButton(false);
        await refreshProfile();
      } catch (error) {
        console.error('Error deleting comments:', error);
        alert('Failed to delete comments. Check console for details.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!addCommentData.subject.trim() || !addCommentData.comment.trim()) {
      setError('Please fill in both Subject and Comment fields');
      return;
    }

    // The API expects `subjects` and `comments` as objects with numeric keys,
    // so we need to transform our single entry into that format.
    const payload = {
        subjects: { 0: addCommentData.subject },
        comments: { 0: addCommentData.comment }
    };

    try {
      const response = await postRequest(`c/add_comments/${id}/`, payload);
      if (response.status === 200) {
        setAddCommentData({ // Reset form fields
          subject: "",
          comment: ""
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddCommentData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  // The useEffect for dropdownRef and handleClickOutside is not needed if the form is always visible.
  // It was previously commented out, keeping it that way.

  const hasExistingComments = candidate.comments && Object.keys(candidate.comments.comments).length > 0;

  return (
    <div className="cp_co_unified-comments-box">
      <div className="cp_co_comments-header">
        <div className="cp_co_header-left">
          <h3 className="cp_co_section-title">
            <span className="cp_co_title-icon">💬</span>
            Comments
          </h3>
          {selectedComments.length > 0 && (
            <span className="cp_co_selection-badge">{selectedComments.length} selected</span>
          )}
        </div>
        <div className="cp_co_header-actions">
          {showDeleteButton && (
            <button className="cp_co_delete-selected-btn" onClick={handleDeleteComments}>
              <span className="cp_co_btn-icon">🗑️</span>
              Delete Selected
            </button>
          )}
        </div>
      </div>

      {/* Existing comments display section */}
      <div className="cp_co_comments-display-section">
        {hasExistingComments ? (
          <div className="cp_co_comments-grid">
            {Object.keys(candidate.comments.comments).map((key) => (
              <div
                key={key}
                className={`cp_co_comment-card ${selectedComments.includes(key) ? 'cp_co_selected' : ''}`}
                onClick={() => handleCommentSelect(key)}
              >
                <div className="cp_co_comment-content">
                  <h4 className="cp_co_comment-subject">{candidate.comments.subjects[key]}</h4>
                  <p className="cp_co_comment-text">{candidate.comments.comments[key]}</p>
                </div>
                {selectedComments.includes(key) && (
                  <div className="cp_co_selection-indicator">
                    <span className="cp_co_checkmark">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="cp_co_no-comments">
            <div className="cp_co_no-comments-text">No comments yet - be the first to add feedback</div>
            {/* The image doesn't show an icon here, just the text */}
            {/* <div className="cp_co_no-comments-icon">💭</div> */}
            {/* <p className="cp_co_no-comments-text">No comments yet</p> */}
            {/* <span className="cp_co_no-comments-subtext">Start by adding your insights below!</span> */}
          </div>
        )}
      </div>

      <div className="cp_co_add-comments-section"> {/* This section is for the new comment input, always visible */}
        <div className="cp_co_form-container">
          <form className="cp_co_comment-form" onSubmit={handleSubmit}>
            <div className="cp_co_form-group">
              <input
                type="text"
                name="subject"
                value={addCommentData.subject}
                onChange={handleChange}
                required
                className="cp_co_form-input"
                placeholder="Comment subject..."
              />
            </div>

            <div className="cp_co_form-group">
              <textarea
                name="comment"
                value={addCommentData.comment}
                onChange={handleChange}
                required
                className="cp_co_form-textarea"
                placeholder="Add your comment content..."
                rows="4"
              />
            </div>
            
            {error && (
              <div className="cp_co_error-message">
                <span className="cp_co_error-icon">⚠️</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`cp_co_submit-btn ${
                !addCommentData.subject.trim() || !addCommentData.comment.trim()
                  ? 'cp_co_disabled'
                  : ''
              }`}
              disabled={!addCommentData.subject.trim() || !addCommentData.comment.trim()}
            >
              Post Comment
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default UnifiedCommentsBox;
