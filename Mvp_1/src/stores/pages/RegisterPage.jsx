import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../CssFiles/RegisterPage.css';
import { postRequest } from '../../utils/apiclient';
import Swal from 'sweetalert2';

const BASE_URL = import.meta.env.VITE_BASE_URL; // Your Django backend base URL
const image2 = "/assets/loginpage/image2br-removebg-preview.png"

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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  useEffect(() => {
    document.body.classList.add('register-page-active');
    document.querySelector('.main-register').classList.add('slide-from-login');
    setTimeout(() => {
      document.querySelector('.main-register').classList.remove('slide-from-login');
    }, 600);
    return () => {
      document.body.classList.remove('register-page-active');
    };
  }, []);

  const minlength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password); 
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((name || last_name).includes(' ')) {
        setError('Name should not contain spaces');
        return;
    }
    if (password !== confirmed) {
        setError('Passwords do not match');
        return;
    }
    if( password.length < minlength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        return;
    }
    setError('');
   
    setLoading(true);

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

        const response = await postRequest('api/register/', userData);
        console.log(response);
        if (response.status === 201) {
            const tokenResponse = await axios.post(`${BASE_URL}api/token/`, {
              username: user_name,
              password: password,
            });
            console.log(tokenResponse.data);

            if (tokenResponse.data.access) {
                localStorage.setItem('username', name);
                localStorage.setItem('access_token', tokenResponse.data.access);
                localStorage.setItem('refresh_token', tokenResponse.data.refresh);
                axios.defaults.headers.common['Authorization'] = `Bearer ${tokenResponse.data.access}`;

                Swal.fire({
                  title: "Registration Successful",
                  icon: "success",
                  toast: true,
                  position: "top-end",
                  timer: 2000,
                  timerProgressBar: true,
                  showConfirmButton: false,
                });
                 
                

                setTimeout(() => {
                  navigate('/Home');
                }, 1500);
            }
        }
    } catch (err) {
        let message = 'An unknown error occurred.';
        if (err.response) {
            message = err.response.data.detail || 'Invalid username or password';
        } else {
            message = 'Unable to connect to the server. Please try again later.';
        }

        Swal.fire({
          title: "Registration Failed",
          text: message,
          icon: "error",
          position: "center",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
    } 
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    document.querySelector('.main-register').classList.add('slide-to-login');
    setTimeout(() => {
      navigate('/SignIN');
    }, 600);
  };

  return (
     <>
     {loading ? (
      <div className="register_loading_container">
      <div className="register_loading_heading">
        User is getting registered...
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
    <div className='entire-register'>
      <div className='main-register'>
        <div className='image-container-register'>
          <img src={image2} alt="My Image" className="image-register" />
        </div>
        <div className="RegisterPage">
          <p className='welcome-register'>join us today !!!</p>
          <p className='register-title'>Create Account</p>
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row-register">
              <div className="form-group-half-register">
                <label htmlFor="name" className='label-register'>First Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className='input-container-register' />
              </div>
              <div className="form-group-half-register">
                <label htmlFor="lastname" className='label-register'>Last Name</label>
                <input type="text" id="lastname" value={last_name} onChange={(e) => setLastName(e.target.value)} required className='input-container-register' />
              </div>
            </div>

            <div className="form-group-register">
              <label htmlFor="username" className='label-register'>Username</label>
              <input type="text" id="username" value={user_name} onChange={(e) => setUserName(e.target.value)} required className='input-container-register' />
            </div>

            <div className="form-group-register">
              <label htmlFor="company" className='label-register'>Company Name</label>
              <input type="text" id="company" value={company_name} onChange={(e) => setCompanyName(e.target.value)} required className='input-container-register' />
            </div>

            <div className="form-group-register">
              <label htmlFor="email" className='label-register'>Email</label>
              <input type="email" id="email" value={company_email} onChange={(e) => setCompany_Email(e.target.value)} required className='input-container-register' />
            </div>

           <div className="form-row-register">
  <div className="form-group-half-register password-field">
    <label htmlFor="password" className='label-register'>Password</label>
    <div className="input-wrapper">
      <input
        type={showPassword ? "text" : "password"}
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className='input-container-register'
      />
      {password && (
        <span
          className="toggle-icon"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "🙈" : "👁️"}
        </span>
      )}
    </div>
  </div>

  <div className="form-group-half-register password-field">
    <label htmlFor="confirm-password" className='label-register'>Confirm Password</label>
    <div className="input-wrapper">
      <input
        type={showConfirmPassword ? "text" : "password"}
        id="confirm-password"
        value={confirmed}
        onChange={(e) => setConfirmed(e.target.value)}
        required
        className='input-container-register'
      />
      {confirmed && (
        <span
          className="toggle-icon"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? "🙈" : "👁️"}
        </span>
      )}
    </div>
  </div>
</div>


            {error && <div className="error-register">{error}</div>}
          </form>

          <div className="register-button-container">
            <button type="submit" className="register-button-alt" onClick={handleSubmit}>Sign Up</button>
            <p className='login-link-register-alt'>
              Already have an account? <span><Link to="/SignIN" onClick={handleLoginClick}>Login here</Link></span>
            </p>
          </div>
        </div>
      </div>
    </div>
      )}
    </>
  );
};

export default RegisterPage;