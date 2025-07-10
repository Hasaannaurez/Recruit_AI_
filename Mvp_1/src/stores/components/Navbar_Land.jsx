import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="nav-section">
      <ul>
        <li><button>Home</button></li>
        <li><button>Who are we</button></li>
        <li><button>What do we do</button></li>
        <li><button>About us</button></li>
        
        {/* SignIn/SignUp link */}
        <li><Link to="/SignIN">SignIn/SignUp</Link></li>
      </ul>
    </div>
  );
};

export default Navbar;
