import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox'); 
  const [isComposeOpen, setIsComposeOpen] = useState(false); 
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Local state for features not in backend (Simulation)
  const [starredIds, setStarredIds] = useState([]);
  const [trashIds, setTrashIds] = useState([]);

  //  FETCH DATA 
  useEffect(() => {
    const fetchEmails = () => {
      fetch('http://localhost:5000/api/emails')
        .then(res => res.json())
        .then(data => setEmails(data))
        .catch(err => console.error("Error:", err));
    };

    fetchEmails();
    const intervalId = setInterval(fetchEmails, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // --- FILTERING LOGIC ---
  const getFilteredEmails = () => {
    let filtered = emails;

    // 1. Filter by Tab
    if (activeTab === 'inbox') {
      // Show emails that are NOT trash and NOT sent by me (assuming "Me" or "Apoorv")
      filtered = filtered.filter(email => !trashIds.includes(email._id) && !email.from.includes('Apoorv'));
    } 
    else if (activeTab === 'starred') {
      filtered = filtered.filter(email => starredIds.includes(email._id) && !trashIds.includes(email._id));
    } 
    else if (activeTab === 'sent') {
      // Logic: Show emails where sender is 'Apoorv' (Assuming user is Apoorv based on screenshots)
      filtered = filtered.filter(email => email.from.includes('Apoorv') && !trashIds.includes(email._id));
    } 
    else if (activeTab === 'trash') {
      filtered = filtered.filter(email => trashIds.includes(email._id));
    }

    // 2. Filter by Search Query
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter(email => 
        email.subject.toLowerCase().includes(lowerQ) ||
        email.from.toLowerCase().includes(lowerQ) ||
        email.body.toLowerCase().includes(lowerQ)
      );
    }

    return filtered;
  };

  const displayedEmails = getFilteredEmails();

  // --- ACTIONS ---

  const toggleStar = (e, id) => {
    e.stopPropagation();
    if (starredIds.includes(id)) {
      setStarredIds(starredIds.filter(sid => sid !== id));
    } else {
      setStarredIds([...starredIds, id]);
    }
  };

  const moveToTrash = (e, id) => {
    e.stopPropagation();
    if (activeTab === 'trash') {
      // Permanently Delete
      deleteEmailPermanently(id);
    } else {
      // Move to Trash (Soft Delete)
      if (!trashIds.includes(id)) {
        setTrashIds([...trashIds, id]);
        if (selectedEmail?._id === id) setSelectedEmail(null);
      }
    }
  };

  const deleteEmailPermanently = async (id) => {
    if(!window.confirm("Permanently delete this email?")) return;
    try {
      await fetch(`http://localhost:5000/api/emails/${id}`, { method: 'DELETE' });
      setEmails(prev => prev.filter(email => email._id !== id));
      if (selectedEmail?._id === id) setSelectedEmail(null);
    } catch (err) {
      alert("Delete failed");
    }
  };

  const openCompose = () => {
    setComposeData({ to: '', subject: '', body: '' });
    setIsComposeOpen(true);
  };

  const handleReply = (email) => {
    setComposeData({
      to: email.from.match(/<(.+)>/)?.[1] || email.from,
      subject: `Re: ${email.subject}`,
      body: `\n\n  On ${new Date(email.date).toLocaleString()} the mail contained: \n${email.body}`
    });
    setIsComposeOpen(true);
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composeData),
      });
      if (res.ok) {
        alert("Email Sent!");
        setIsComposeOpen(false);
        // Refresh list to show sent item immediately (optional)
      } else {
        alert("Failed to send.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      {/* HEADER: */}
      <header className="top-bar">
        <div className="logo-section">
          <span className="menu-icon">☰</span>
          {/* UPDATED LOGO & NAME */}
          <div className="mymail-brand">
            <span className="brand-icon">📨</span>
            <span>MyMail</span>
          </div>
        </div>
        
        {/* WORKING SEARCH BAR */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder={`Search in ${activeTab}...`} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="user-profile">
          <div className="user-avatar" title="Apoorv">A</div>
        </div>
      </header>

      <div className="main-body">
        {/* COL 1: SIDEBAR NAVIGATION */}
        <div className="sidebar">
         <button className="compose-btn" onClick={openCompose}>
            <span className="pencil">✏️</span> Compose
          </button>
          
          <div className="nav-items">
            <div 
              className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('inbox'); setSelectedEmail(null); }}
            >
              <span className="icon">📥</span> Inbox 
            </div>
            <div 
              className={`nav-item ${activeTab === 'starred' ? 'active' : ''}`}
              onClick={() => { setActiveTab('starred'); setSelectedEmail(null); }}
            >
              <span className="icon">⭐</span> Starred
              {starredIds.length > 0 && <span className="count">{starredIds.length}</span>}
            </div>
            <div 
              className={`nav-item ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => { setActiveTab('sent'); setSelectedEmail(null); }}
            >
              <span className="icon">📤</span> Sent
            </div>
            <div 
              className={`nav-item ${activeTab === 'trash' ? 'active' : ''}`}
              onClick={() => { setActiveTab('trash'); setSelectedEmail(null); }}
            >
              <span className="icon">🗑️</span> Trash
              {trashIds.length > 0 && <span className="count">{trashIds.length}</span>}
            </div>
          </div>
        </div>

        {/* COL 2: EMAIL LIST (Dynamic based on Tab) */}
        <div className="email-list-panel">
          {displayedEmails.length === 0 ? (
             <div style={{padding: '20px', textAlign: 'center', color: '#888'}}>
               {searchQuery ? 'No search results found' : 'Nothing here yet'}
             </div>
          ) : (
            displayedEmails.map(email => (
              <div 
                key={email._id} 
                className={`email-row ${selectedEmail?._id === email._id ? 'selected' : ''}`}
                onClick={() => setSelectedEmail(email)}
              >
                <div className="row-content">
                  <div className="sender-name">
                    {email.from.split('<')[0]}
                  </div>
                  <div className="email-preview">
                    <span className="subject">{email.subject}</span>
                    <span className="separator">-</span>
                    <span className="snippet">{email.body.substring(0, 50)}...</span>
                  </div>
                </div>
                
                <div className="row-actions">
                  <span className="time">
                    {new Date(email.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                  </span>
                  <div className="action-btn-group">
                    <button 
                      className={`icon-btn ${starredIds.includes(email._id) ? 'active' : ''}`}
                      onClick={(e) => toggleStar(e, email._id)}
                      title="Star"
                    >
                      {starredIds.includes(email._id) ? '★' : '☆'}
                    </button>
                    <button 
                      className="icon-btn"
                      onClick={(e) => moveToTrash(e, email._id)}
                      title={activeTab === 'trash' ? "Delete Forever" : "Move to Trash"}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* COL 3: READING PANE */}
        <div className="reading-pane-container">
          {selectedEmail ? (
            <div className="email-card">
              <div className="email-header">
                <h2>{selectedEmail.subject}</h2>
                <div className="email-meta">
                  <div className="avatar-circle">{selectedEmail.from.charAt(0).toUpperCase()}</div>
                  <div className="meta-text">
                    <strong>{selectedEmail.from}</strong>
                    <span className="meta-date">{new Date(selectedEmail.date).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="email-body">
                <pre>{selectedEmail.body}</pre>
              </div>
              <div className="email-actions" style={{marginTop: '30px', borderTop:'1px solid #eee', paddingTop:'20px'}}>
                <button className="reply-btn" onClick={() => handleReply(selectedEmail)}>
                  ↩️ Reply
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-view">
              <div className="empty-icon">📨</div>
              <p>Select an email to read</p>
            </div>
          )}
        </div>
      </div>

      {/* PROFESSIONAL CENTERED COMPOSE MODAL */}
      {isComposeOpen && (
        <div className="modal-overlay" onClick={() => setIsComposeOpen(false)}>
          <div className="compose-modal" onClick={e => e.stopPropagation()}>
            <div className="compose-header">
              <span>New Message</span>
              <button className="close-btn" onClick={() => setIsComposeOpen(false)}>✖</button>
            </div>
            <form onSubmit={sendEmail} className="compose-form">
              <div className="input-group">
                <input 
                  type="email" 
                  placeholder="To" 
                  value={composeData.to}
                  onChange={e => setComposeData({...composeData, to: e.target.value})}
                  required 
                />
              </div>
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Subject" 
                  value={composeData.subject}
                  onChange={e => setComposeData({...composeData, subject: e.target.value})}
                  required 
                />
              </div>
              <textarea 
                placeholder="Write your message here..." 
                value={composeData.body}
                onChange={e => setComposeData({...composeData, body: e.target.value})}
              ></textarea>
              <div className="compose-footer">
                <button type="submit" className="send-btn">Send Email</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;