import React, { useState } from 'react';
import '../CssFiles/LoginPage.css'; // Optional for styling
import { Link } from 'react-router-dom';
import { getRequest,postRequest } from '../../utils/apiclient';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic, e.g., API call
    console.log('Email:', email);
    console.log('Password:', password);
    alert('Login successful!');
  };

  return (
    <div className='LoginPage'>
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="Email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">Login</button>
      </form>
    </div>
    <p>Didn't have an account</p>
    <p>No worries {<Link to ='/Register'>Create an Account</Link>}</p>
    </div>
  );
};

export default LoginPage;