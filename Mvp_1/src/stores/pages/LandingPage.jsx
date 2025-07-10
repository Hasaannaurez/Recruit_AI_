import React from 'react';
import { Link } from 'react-router-dom';
import '../CssFiles/LandingPage.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo">
          <h1>RecruitAI</h1>
        </div>
        <div className="nav-links">
          <Link to="#features">Features</Link>
          <Link to="#process">How It Works</Link>
          <Link to="#testimonials">Testimonials</Link>
          <Link to="#pricing">Pricing</Link>
          <Link to="#contact">Contact</Link>
        </div>
        <div className="nav-buttons">
          <Link to="/SignIN" className="btn btn-secondary">Log In</Link>
          <Link to="/demo" className="btn btn-primary">Request Demo</Link>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>Hire Smarter, Not Harder</h1>
          <p>Stop wasting time sifting through stacks of resumes. Our AI-powered scoring and filtering system instantly evaluates candidates based on job-specific criteria and company preferences, bringing the most qualified talent to the forefront.</p>
          <div className="hero-buttons">
            <Link to="/get-started" className="btn btn-primary">Get Started</Link>
            <Link to="/demo" className="btn btn-secondary">Watch Demo</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="src/stores/images/candidateprofile.png" alt="AI Recruitment Platform Dashboard" />
        </div>
      </div>
    </section>
  );
};

const FeaturesHighlights = () => {
  return (
    <section className="features-highlights">
      <div className="container">
        <div className="feature-card">
          <div className="feature-icon">
            <i className="fas fa-brain"></i>
          </div>
          <h3>AI-Driven Precision</h3>
          <p>Assess candidates beyond keywords—analyze project complexity, relevance, education, and soft skills.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <i className="fas fa-user-circle"></i>
          </div>
          <h3>All-in-One Candidate Profile</h3>
          <p>A centralized, shareable, and editable profile with AI-generated summaries, scorecards, and key hiring insights.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">
            <i className="fas fa-filter"></i>
          </div>
          <h3>Effortless Shortlisting</h3>
          <p>Identify top talent instantly with dynamic, job-specific ranking tailored to your needs.</p>
        </div>
      </div>
    </section>
  );
};

const AIAgent = () => {
  return (
    <section className="ai-agent">
      <div className="container">
        <div className="ai-agent-image">
          <img src="src/stores/images/temp2.png" alt="AI Agent Visualization" />
        </div>
        <div className="ai-agent-content">
          <h2>AI That Understands Talent Like You Do</h2>
          <p>Our advanced AI doesn't just scan resumes—it analyzes, understands, and evaluates candidates the way an experienced recruiter would.</p>
          <ul className="ai-features-list">
            <li>
              <span className="feature-title">Tailored Job Understanding:</span>
              <span className="feature-desc">AI starts with a custom questionnaire to grasp role-specific needs, ensuring precise and relevant candidate evaluation.</span>
            </li>
            <li>
              <span className="feature-title">Multi-Point Evaluation:</span>
              <span className="feature-desc">AI scores candidates on essential and favorable criteria based on the role, ensuring a robust, context-based selection.</span>
            </li>
            <li>
              <span className="feature-title">Deep Candidate Insights:</span>
              <span className="feature-desc">Instantly understand strengths, weaknesses, and job fit.</span>
            </li>
          </ul>
          <p className="ai-agent-footer">With AI doing the heavy lifting, you can hire with confidence and speed.</p>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  return (
    <section id="features" className="features">
      <div className="container">
        <div className="section-header">
          <h2>One-Stop Solution for the Entire Hiring Process</h2>
          <p>Our AI-driven platform goes beyond resume analysis, streamlining the entire hiring process with smart automation and user-friendly tools.</p>
        </div>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-chart-bar"></i>
            </div>
            <h3>Robust Scoring</h3>
            <p>Multi-level scoring system that describes the level of skills based on projects, work, and education. Not just keyword-based matching, but dynamically generated multi-aspect evaluation specific to role requirements and company preferences.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-robot"></i>
            </div>
            <h3>AI Feedback</h3>
            <p>Concise summaries relevant to the job role, highlighting the advantages and disadvantages of choosing each candidate, providing credible insights for better decision-making.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-id-card"></i>
            </div>
            <h3>Candidate Profile</h3>
            <p>Easily shareable profiles between HRs with a simple link. Includes current state in the process, all data points, AI summary, and general details in one convenient view.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-question-circle"></i>
            </div>
            <h3>Interview Question Suggestions</h3>
            <p>AI-generated interview questions tailored to each candidate's profile and job requirements, helping you conduct more effective interviews.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <h3>Automatic Interview Scheduling</h3>
            <p>Seamlessly schedule interviews by allowing candidates to select from available slots. Events are automatically added to both HR's and candidate's calendars.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <h3>Effortless Communication</h3>
            <p>Send customizable emails to multiple candidates at any stage—whether it's scheduling interviews, updating application status, or sending personalized messages.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Process = () => {
  return (
    <section id="process" className="process">
      <div className="container">
        <div className="section-header">
          <h2>The Complete Hiring Process, Simplified</h2>
          <p>Our platform streamlines your entire recruitment workflow from job posting to final hire.</p>
        </div>
        <div className="process-steps">
          <div className="process-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Job Role Creation</h3>
              <p>Add a job role with a brief description. Our AI generates questions to understand your specific requirements.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Custom Evaluation Metrics</h3>
              <p>AI creates 3-5 tailored metrics for candidate evaluation. You can adjust these to match your priorities.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Resume Processing</h3>
              <p>Upload resumes in bulk. Our AI parses and analyzes each one, evaluating project complexity, relevance, education, and soft skills.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Comprehensive Scoring</h3>
              <p>Receive detailed scorecards and concise summaries for each candidate, with advantages and disadvantages clearly highlighted.</p>
            </div>
          </div>
          <div className="process-step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Interview & Feedback</h3>
              <p>Schedule interviews, get AI-suggested questions, and collect structured feedback all in one place.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// const CTA = () => {
//   return (
//     <section className="cta">
//       <div className="container">
//         <h2>Cut through the noise and focus on hiring the best, faster.</h2>
//         <p>Join hundreds of companies already transforming their hiring process with RecruitAI.</p>
//         <div className="cta-buttons">
//           <Link to="/demo" className="btn btn-primary">Request Demo</Link>
//           <Link to="/learn-more" className="btn btn-secondary">Learn More</Link>
//         </div>
//       </div>
//     </section>
//   );
// };

// const Testimonials = () => {
//   return (
//     <section id="testimonials" className="testimonials">
//       <div className="container">
//         <div className="section-header">
//           <h2>Trusted by Leading Companies</h2>
//           <p>See how RecruitAI is transforming the hiring process for businesses of all sizes.</p>
//         </div>
//         <div className="testimonials-grid">
//           <div className="testimonial-card">
//             <div className="testimonial-content">
//               <p>"RecruitAI reduced our time-to-hire by 60% and helped us find candidates who were a perfect cultural fit. The AI scoring system is remarkably accurate."</p>
//             </div>
//             <div className="testimonial-author">
//               <img src="/placeholder.svg?height=60&width=60" alt="Testimonial Author" />
//               <div className="author-info">
//                 <h4>Sarah Johnson</h4>
//                 <p>HR Director, Tech Solutions Inc.</p>
//               </div>
//             </div>
//           </div>
//           <div className="testimonial-card">
//             <div className="testimonial-content">
//               <p>"The candidate profiles and AI summaries have transformed how our hiring team collaborates. We're making better decisions, faster."</p>
//             </div>
//             <div className="testimonial-author">
//               <img src="/placeholder.svg?height=60&width=60" alt="Testimonial Author" />
//               <div className="author-info">
//                 <h4>Michael Chen</h4>
//                 <p>Talent Acquisition Manager, Global Innovations</p>
//               </div>
//             </div>
//           </div>
//           <div className="testimonial-card">
//             <div className="testimonial-content">
//               <p>"The interview question suggestions are spot-on. They've helped us conduct more effective interviews and identify the right candidates consistently."</p>
//             </div>
//             <div className="testimonial-author">
//               <img src="/placeholder.svg?height=60&width=60" alt="Testimonial Author" />
//               <div className="author-info">
//                 <h4>Emily Rodriguez</h4>
//                 <p>Recruiting Lead, Startup Ventures</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

const Pricing = () => {
  return (
    <section id="pricing" className="pricing">
      <div className="container">
        <div className="section-header">
          <h2>Transparent, Scalable Pricing</h2>
          <p>
            Our plans are designed to balance powerful AI-driven candidate evaluations with rising server costs. Choose the plan that fits your hiring needs and pay only for what you use.
          </p>
        </div>
        <div className="pricing-cards">
          {/* Free Plan */}
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Free Plan</h3>
              <div className="price">
                <span className="amount">₹0</span>
                <span className="period">/month</span>
              </div>
            </div>
            <div className="pricing-features">
              <ul>
                <li>1-month free trial</li>
                <li>AI evaluation of up to 100 resumes</li>
                <li>Manage up to 5 job roles</li>
                <li>Basic candidate analytics</li>
                <li>1 admin user</li>
                <li>Essential email templates</li>
              </ul>
            </div>
            <div className="pricing-footer">
              <Link to="/get-started" className="btn btn-secondary">
                Get Started
              </Link>
            </div>
          </div>
          {/* Basic Plan */}
          <div className="pricing-card featured">
            <div className="pricing-header">
              <h3>Basic Plan</h3>
              <div className="price">
                <span className="amount">₹1,089</span>
                <span className="period">/user/month</span>
              </div>
            </div>
            <div className="pricing-features">
              <ul>
                <li>AI evaluation of up to 400 resumes/month</li>
                <li>Manage up to 10 job roles</li>
                <li>Standard candidate analytics dashboard</li>
                <li>Customizable email templates</li>
                <li>Interview scheduling</li>
                <li>Up to 3 team members</li>
              </ul>
            </div>
            <div className="pricing-footer">
              <Link to="/get-started" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          </div>
          {/* Premium Plan */}
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Premium Plan</h3>
              <div className="price">
                <span className="amount">₹2,589</span>
                <span className="period">/user/month</span>
              </div>
            </div>
            <div className="pricing-features">
              <ul>
                <li>AI evaluation of up to 1000 resumes/month</li>
                <li>Unlimited job roles</li>
                <li>Advanced candidate analytics & reporting</li>
                <li>API integrations & custom workflows</li>
                <li>Priority support & scheduling features</li>
                <li>Up to 10 team members</li>
              </ul>
            </div>
            <div className="pricing-footer">
              <Link to="/contact-sales" className="btn btn-secondary">
                Contact Sales
              </Link>
            </div>
          </div>
          {/* Enterprise Plan */}
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Enterprise Plan</h3>
              <div className="price">
                <span className="amount">Custom Pricing</span>
              </div>
            </div>
            <div className="pricing-features">
              <ul>
                <li>Unlimited job roles & advanced ATS features</li>
                <li>Full candidate analytics suite</li>
                <li>Custom integrations, white-labeling & dedicated support</li>
                <li>Tailored onboarding & training</li>
                <li>Volume discounts for high evaluation usage</li>
              </ul>
            </div>
            <div className="pricing-footer">
              <Link to="/contact-sales" className="btn btn-secondary">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="contact-content">
          <div className="contact-info">
            <h2>Ready to transform your hiring process?</h2>
            <p>Get in touch with our team to schedule a personalized demo and see how RecruitAI can help you find the best talent faster.</p>
            <div className="contact-details">
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>info@recruitai.com</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>+91 93985 xxxxx</span>
              </div>
            </div>
          </div>
          <div className="contact-form">
            <form>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input type="text" id="company" name="company" required />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows="4" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>RecruitAI</h2>
            <p>Hire Smarter, Not Harder</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h3>Product</h3>
              <ul>
                <li><Link to="#">Features</Link></li>
                <li><Link to="#">Pricing</Link></li>
                <li><Link to="#">Integrations</Link></li>
                <li><Link to="#">Updates</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Resources</h3>
              <ul>
                <li><Link to="#">Blog</Link></li>
                <li><Link to="#">Documentation</Link></li>
                <li><Link to="#">Guides</Link></li>
                <li><Link to="#">Webinars</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Company</h3>
              <ul>
                <li><Link to="#">About Us</Link></li>
                <li><Link to="#">Careers</Link></li>
                <li><Link to="#">Contact</Link></li>
                <li><Link to="#">Press</Link></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Legal</h3>
              <ul>
                <li><Link to="#">Privacy Policy</Link></li>
                <li><Link to="#">Terms of Service</Link></li>
                <li><Link to="#">Security</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} RecruitAI. All rights reserved.</p>
          <div className="social-links">
            <Link to="#"><i className="fab fa-twitter"></i></Link>
            <Link to="#"><i className="fab fa-linkedin"></i></Link>
            <Link to="#"><i className="fab fa-facebook"></i></Link>
            <Link to="#"><i className="fab fa-instagram"></i></Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <FeaturesHighlights />
      <AIAgent />
      <Features />
      <Process />
      {/* <CTA /> */}
      {/* <Testimonials /> */}
      {/* <Pricing /> */}
      <Contact />
      <Footer />
    </div>
  );
};

export default LandingPage;