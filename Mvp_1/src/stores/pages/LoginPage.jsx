import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../CssFiles/LoginPage.css';

const BASE_URL = import.meta.env.VITE_BASE_URL; // Your Django backend base URL
const image2 = "/assets/loginpage/image2br-removebg-preview.png"

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Add class to body when login page mounts
    document.body.classList.add('login-page-active');
    
    // Remove class when component unmounts
    return () => {
      document.body.classList.remove('login-page-active');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}api/token/`, {
        username,
        password,
      });

       console.log('Response from server:', response); // Log the response object
      if (response.data.access) {
        // Store the tokens in localStorage
        localStorage.setItem('username', username);
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // Set axios default Authorization header for all future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

        // Show success alert
        Swal.fire({
          title: "Login Successful",
          icon: "success",
          toast: true,
          timer: 2000,
          position: 'top-right',
          timerProgressBar: true,
          showConfirmButton: false,
        });
        // Redirect to the home page or a protected route after alert
        setTimeout(() => {
          navigate('/Home');
        }, 1500);
      }
    } catch (err) {
      // Handle error response from the backend
      if (err.response) {
          const message = err.response.data.detail || 'Invalid username or password';
          // setError(message);
          Swal.fire({
            title: message,
            icon: "error",
            toast: true,
            timer: 3000,
            position: 'center',
            timerProgressBar: true,
            showConfirmButton: false,
          });
        } else {
          const message = 'Unable to connect to the server. Please try again later.';
          // setError(message);
          Swal.fire({
            title: message,
            icon: "error",
            toast: true,
            timer: 3000,
            position: 'center',
            timerProgressBar: true,
            showConfirmButton: false,
          });
    } 

    } finally {
      setLoading(false); // Stop loading state
    }
  };

  // ADD THIS NEW FUNCTION
  const handleRegisterClick = (e) => {
    e.preventDefault();
    // Add animation class to trigger slide
    document.querySelector('.main').classList.add('slide-to-register');
    
    // Navigate after animation completes
    setTimeout(() => {
      navigate('/Register');
    }, 600); // Match this with CSS transition duration
  };

  return (
    <>
    {loading ? (
      <div className="register_loading_container">
      <div className="register_loading_heading">
        User is getting logged in...
      </div>
      
      {/* Horizontal oscillating loader */}
      <div className="register_loading-spinner"></div>
      
      {/* Horizontal bouncing dots */}
      <div className="register_loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      {/* Horizontal progress bar */}
      <div className="register_loading-progress"></div>
      
      <p className="register_loading_side">This may take a while</p>
      </div>
   ) : (
  <div className='entire'>
   <div className='main'>
    <div className="LoginPage">
      <div className="login-container">
        <p className='welcome'>welcome back !!!</p>
        <p className='login'>Log In</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group-1">
            <label htmlFor="username" className='username' >Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className='username-container'
            />
          </div>
          <div className="form-group-2">
            <label htmlFor="password" className='password'>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='password-container'
            />
          </div>
          {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
      <p className='dont'>
        Don't have an account? <span><a href="/Register" onClick={handleRegisterClick}>Create an Account</a></span>
      </p>
    </div>
    <div className='image-container'>
    <img src={image2} alt="My Image" className="image" />
    </div>
   </div>
   </div>
   )}
   </>
  );
};

export default LoginPage;