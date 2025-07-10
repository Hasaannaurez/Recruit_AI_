import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../CssFiles/RegisterPage.css'; // Optional for styling
import { postRequest } from '../../utils/apiclient';

const RegisterPage = () => {
  const [company_email, setCompany_Email] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [user_name, setUserName] = useState('');
  const [company_name, setCompanyName] = useState('');
 const [last_name, setLastName] = useState('');
  const [confirmed, setConfirmed] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const minlength = 8; // Minimum password length
  const hasUpperCase = /[A-Z]/.test(password); // At least one uppercase letter
  const hasLowerCase = /[a-z]/.test(password); 
  const hasNumber = /[0-9]/.test(password); // At least one number
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // At least one special character


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate name and password confirmation
    if ((name || last_name).includes(' ')) {
        setError('Name should not contain spaces');
        return;
    }
    if (password !== confirmed) {
        setError('Passwords do not match');
        return;
    }
   
    if( password.length < minlength ||
        !hasUpperCase || !hasLowerCase ||
        !hasNumber || !hasSpecialChar) {
        setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        return;
        }
    // Reset error state
    setError('');

    try {
        const userData = {
            username: user_name,
            email: company_email,
            password: password,
            password2: confirmed,
            first_name: name, 
            last_name: last_name, 
            company: company_name
        };

        // Make POST request to register the user
        const response = await postRequest('api/register/', userData); // Adjust URL if needed
         
        if (response.status === 201) {
            // Registration successful, now fetch tokens
            const tokenResponse = await axios.post('http://localhost:8000/api/token/', {
              username: user_name,
              password: password,
            });

            if (tokenResponse.data.access) {
                // Store tokens in localStorage
                localStorage.setItem('username', name);
                localStorage.setItem('access_token', tokenResponse.data.access);
                localStorage.setItem('refresh_token', tokenResponse.data.refresh);

                // Set axios default Authorization header
                axios.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.access}`;

                // Navigate to home page
                navigate('/Home');
            }
        }
    } catch (err) {
        // Handle errors (e.g., username or email already taken)
        if (err.response && err.response.data) {
            setError(err.response.data.detail || 'An error occurred during registration');
        } else {
            setError('Something went wrong. Please try again later.');
        }
    }
  };

  return (
    <div className="register-page">
      <div className="background-overlay">
        <div className="brand-text">RecruitAI</div>
        <div className="floating-icons">
          <div className="icon icon-1">👥</div>
          <div className="icon icon-2">💼</div>
          <div className="icon icon-3">🎯</div>
          <div className="icon icon-4">📊</div>
          <div className="icon icon-5">🚀</div>
          <div className="icon icon-6">⭐</div>
        </div>
      </div>
      
      <div className="register-container">
        <h2>CREATE ACCOUNT</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="First Name"
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              id="lastname"
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Last Name"
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              id="username"
              value={user_name}
              onChange={(e) => setUserName(e.target.value)}
              required
              placeholder="Username"
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              id="company"
              value={company_name}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              placeholder="Company Name"
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              id="email"
              value={company_email}
              onChange={(e) => setCompany_Email(e.target.value)}
              required
              placeholder="Your Email"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="confirm-password"
              value={confirmed}
              onChange={(e) => setConfirmed(e.target.value)}
              required
              placeholder="Repeat your password"
            />
          </div>

          {error && <div className="error">{error}</div>}
          
          <button type="submit" className="register-button">
            SIGN UP
          </button>
        </form>
        
        <div className="login-link">
          <p>Have already an account? <Link to="/SignIN">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;