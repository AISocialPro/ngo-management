'use client';

import { useState } from 'react';

export default function HelpSupportPage() {
  const [activeFAQ, setActiveFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I create a new event?",
      answer: "To create a new event, go to the Events section from the main menu and click the 'Add New Event' button. Fill in the event details, set the date and time, and specify the location. You can then assign volunteers and set up donation options if needed."
    },
    {
      id: 2,
      question: "How can I generate donation reports?",
      answer: "Navigate to the Donations section and click on the 'Reports' tab. You can filter by date range, donation type, or campaign. Once you've set your filters, click 'Generate Report' to view or export the data."
    },
    {
      id: 3,
      question: "How do I add new volunteers to the system?",
      answer: "In the Volunteers section, click 'Add Volunteer' and fill in their details. You can assign them to specific events or campaigns and set their permissions based on their role in your organization."
    },
    {
      id: 4,
      question: "Can I customize donation amounts for campaigns?",
      answer: "Yes, when creating or editing a campaign in the Campaigns/Projects section, you can set suggested donation amounts or allow donors to enter custom amounts. You can also set up recurring donation options."
    }
  ];

  const toggleFAQ = (id) => {
    setActiveFAQ(activeFAQ === id ? null : id);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const searchTerm = e.target.value.trim();
      if (searchTerm) {
        alert(`Searching for: ${searchTerm}`);
      }
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <style jsx global>{`
        :root {
          --primary: #3498db;
          --secondary: #2ecc71;
          --accent: #e74c3c;
          --warning: #f39c12;
          --light: #f8f9fa;
          --dark: #343a40;
          --sidebar-width: 250px;
          --header-height: 70px;
          --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          --transition: all 0.3s ease;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        body {
          background-color: #f5f7f9;
          color: #333;
          display: flex;
          min-height: 100vh;
        }

        /* Sidebar */
        .sidebar {
          width: var(--sidebar-width);
          background: linear-gradient(to bottom, var(--primary), #2980b9);
          color: white;
          height: 100vh;
          position: fixed;
          transition: var(--transition);
          z-index: 1000;
          overflow-y: auto;
        }

        .sidebar-header {
          padding: 20px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidebar-header h2 {
          font-size: 1.5rem;
          margin-top: 10px;
        }

        .sidebar-menu {
          padding: 20px 0;
        }

        .menu-item {
          padding: 15px 20px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: var(--transition);
          border-left: 4px solid transparent;
        }

        .menu-item:hover, .menu-item.active {
          background-color: rgba(255, 255, 255, 0.1);
          border-left: 4px solid white;
        }

        .menu-item i {
          margin-right: 10px;
          font-size: 1.2rem;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: var(--sidebar-width);
          transition: var(--transition);
        }

        /* Header */
        .header {
          height: var(--header-height);
          background-color: white;
          box-shadow: var(--card-shadow);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background-color: var(--light);
          border-radius: 20px;
          padding: 8px 15px;
          width: 300px;
          position: relative;
        }

        .search-bar input {
          border: none;
          background: transparent;
          outline: none;
          margin-left: 10px;
          width: 100%;
        }

        .header-right {
          display: flex;
          align-items: center;
        }

        .notification {
          position: relative;
          margin-right: 20px;
          cursor: pointer;
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: var(--accent);
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-profile {
          display: flex;
          align-items: center;
        }

        .user-profile img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 10px;
          object-fit: cover;
        }

        /* Dashboard Content */
        .dashboard {
          padding: 20px;
        }

        .section-title {
          margin-bottom: 20px;
          color: var(--dark);
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Help & Support Styles */
        .help-container {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: var(--card-shadow);
          margin-bottom: 30px;
        }

        .help-search {
          margin-bottom: 30px;
          position: relative;
        }

        .help-search input {
          width: 100%;
          padding: 15px 20px 15px 50px;
          border: 1px solid #ddd;
          border-radius: 30px;
          font-size: 1rem;
          outline: none;
          transition: var(--transition);
        }

        .help-search input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }

        .help-search i {
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          color: #6c757d;
        }

        .help-categories {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .help-category {
          background: var(--light);
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          transition: var(--transition);
          cursor: pointer;
        }

        .help-category:hover {
          transform: translateY(-5px);
          box-shadow: var(--card-shadow);
        }

        .help-category i {
          font-size: 2.5rem;
          color: var(--primary);
          margin-bottom: 15px;
        }

        .help-category h3 {
          margin-bottom: 10px;
          color: var(--dark);
        }

        .help-category p {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .faq-section {
          margin-bottom: 30px;
        }

        .faq-item {
          margin-bottom: 15px;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
        }

        .faq-question {
          padding: 15px 20px;
          background: #f8f9fa;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          font-weight: 500;
        }

        .faq-answer {
          padding: 0 20px;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .faq-answer.active {
          padding: 15px 20px;
          max-height: 300px;
        }

        .contact-methods {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .contact-method {
          background: white;
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
        }

        .contact-method i {
          font-size: 2rem;
          color: var(--primary);
          margin-bottom: 15px;
        }

        .contact-method h3 {
          margin-bottom: 10px;
          color: var(--dark);
        }

        .contact-method p {
          color: #6c757d;
          margin-bottom: 15px;
        }

        .contact-btn {
          background-color: var(--primary);
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 5px;
          cursor: pointer;
          display: inline-block;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .resources-section {
          margin-bottom: 30px;
        }

        .resources-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .resource-card {
          background: white;
          border: 1px solid #eee;
          border-radius: 10px;
          overflow: hidden;
          transition: var(--transition);
        }

        .resource-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--card-shadow);
        }

        .resource-icon {
          background: var(--light);
          padding: 20px;
          text-align: center;
          font-size: 2rem;
          color: var(--primary);
        }

        .resource-content {
          padding: 20px;
        }

        .resource-content h3 {
          margin-bottom: 10px;
          color: var(--dark);
        }

        .resource-content p {
          color: #6c757d;
          margin-bottom: 15px;
          font-size: 0.9rem;
        }

        .resource-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 70px;
            overflow: hidden;
          }
          
          .sidebar-header h2, .menu-item span {
            display: none;
          }
          
          .menu-item {
            justify-content: center;
            padding: 15px;
          }
          
          .menu-item i {
            margin-right: 0;
          }
          
          .main-content {
            margin-left: 70px;
          }
          
          .search-bar {
            width: 200px;
          }
          
          .help-categories, .contact-methods, .resources-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/3713/3713765.png" 
              alt="NGO Logo" 
              width="50"
              style={{ width: '50px', height: 'auto' }}
            />
            <h2>NGO Connect</h2>
          </div>
          <div className="sidebar-menu">
            {[
              { iconClass: 'fas fa-home', text: 'Dashboard' },
              { iconClass: 'fas fa-code-branch', text: 'Branches' },
              { iconClass: 'fas fa-project-diagram', text: 'Campaigns/Projects' },
              { iconClass: 'fas fa-donate', text: 'Donations' },
              { iconClass: 'fas fa-users', text: 'Donors' },
              { iconClass: 'fas fa-hands-helping', text: 'Volunteers' },
              { iconClass: 'fas fa-hand-holding-heart', text: 'Beneficiaries' },
              { iconClass: 'fas fa-calendar-alt', text: 'Events' },
              { iconClass: 'fas fa-cog', text: 'Settings' },
              { iconClass: 'fas fa-question-circle', text: 'Help & Support', active: true }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`menu-item ${item.active ? 'active' : ''}`}
              >
                <i className={item.iconClass}></i>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <div className="header">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search for help..." />
            </div>
            <div className="header-right">
              <div className="notification">
                <i className="fas fa-bell"></i>
                <div className="notification-badge">3</div>
              </div>
              <div className="user-profile">
                <img 
                  src="https://randomuser.me/api/portraits/women/44.jpg" 
                  alt="User" 
                  width={40}
                  height={40}
                />
                <div>
                  <h4>Sarah Johnson</h4>
                  <p>Program Coordinator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="dashboard">
            <div className="section-title">
              <h2>Help & Support</h2>
              <p>{formattedDate}</p>
            </div>

            {/* Help Container */}
            <div className="help-container">
              <div className="help-search">
                <i className="fas fa-search"></i>
                <input 
                  type="text" 
                  placeholder="How can we help you today?" 
                  onKeyUp={handleSearch}
                />
              </div>

              <div className="help-categories">
                {[
                  { iconClass: 'fas fa-book', title: 'Knowledge Base', desc: 'Browse articles and guides' },
                  { iconClass: 'fas fa-video', title: 'Video Tutorials', desc: 'Watch step-by-step guides' },
                  { iconClass: 'fas fa-question-circle', title: 'FAQs', desc: 'Find answers to common questions' },
                  { iconClass: 'fas fa-headset', title: 'Contact Support', desc: 'Get help from our team' }
                ].map((category, index) => (
                  <div key={index} className="help-category">
                    <i className={category.iconClass}></i>
                    <h3>{category.title}</h3>
                    <p>{category.desc}</p>
                  </div>
                ))}
              </div>

              <div className="faq-section">
                <h3>Frequently Asked Questions</h3>
                {faqs.map((faq) => (
                  <div key={faq.id} className="faq-item">
                    <div 
                      className="faq-question"
                      onClick={() => toggleFAQ(faq.id)}
                    >
                      {faq.question}
                      <i className={`fas fa-chevron-${activeFAQ === faq.id ? 'up' : 'down'}`}></i>
                    </div>
                    <div className={`faq-answer ${activeFAQ === faq.id ? 'active' : ''}`}>
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>

              <div className="contact-section">
                <h3>Contact Support</h3>
                <div className="contact-methods">
                  {[
                    { 
                      iconClass: 'fas fa-envelope', 
                      title: 'Email Support', 
                      desc: 'Get help via email within 24 hours',
                      action: 'Send Email',
                      link: 'mailto:support@ngoconnect.org'
                    },
                    { 
                      iconClass: 'fas fa-phone', 
                      title: 'Phone Support', 
                      desc: 'Mon-Fri, 9AM-5PM EST',
                      action: 'Call Now',
                      link: 'tel:+15551234567'
                    },
                    { 
                      iconClass: 'fas fa-comments', 
                      title: 'Live Chat', 
                      desc: 'Chat with our support team in real-time',
                      action: 'Start Chat',
                      link: '#'
                    }
                  ].map((method, index) => (
                    <div key={index} className="contact-method">
                      <i className={method.iconClass}></i>
                      <h3>{method.title}</h3>
                      <p>{method.desc}</p>
                      {method.link === '#' ? (
                        <button className="contact-btn">{method.action}</button>
                      ) : (
                        <a href={method.link} className="contact-btn">{method.action}</a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="resources-section">
                <h3>Helpful Resources</h3>
                <div className="resources-grid">
                  {[
                    { 
                      iconClass: 'fas fa-file-pdf', 
                      title: 'User Guide', 
                      desc: 'Complete guide to using NGO Connect',
                      linkText: 'Download PDF',
                      linkIcon: 'fas fa-download'
                    },
                    { 
                      iconClass: 'fas fa-film', 
                      title: 'Video Tutorials', 
                      desc: 'Step-by-step video guides',
                      linkText: 'Watch Videos',
                      linkIcon: 'fas fa-arrow-right'
                    },
                    { 
                      iconClass: 'fas fa-calendar', 
                      title: 'Webinars', 
                      desc: 'Join our live training sessions',
                      linkText: 'View Schedule',
                      linkIcon: 'fas fa-arrow-right'
                    }
                  ].map((resource, index) => (
                    <div key={index} className="resource-card">
                      <div className="resource-icon">
                        <i className={resource.iconClass}></i>
                      </div>
                      <div className="resource-content">
                        <h3>{resource.title}</h3>
                        <p>{resource.desc}</p>
                        <a href="#" className="resource-link">
                          {resource.linkText} <i className={resource.linkIcon}></i>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}