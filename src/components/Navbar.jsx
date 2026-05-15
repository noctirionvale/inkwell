import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import LouisesCornerModal from './LouisesCornerModal';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [louiseModalOpen, setLouiseModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const openLouiseModal = () => {
    setLouiseModalOpen(true);
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button className="navbar-logo" onClick={goHome} aria-label="Go to top">
            <img src="/logo-icon.png" alt="Inkwell" className="navbar-logo-icon" />
            INKWELL
          </button>
        </div>

        {/* Desktop nav links – removed LIBRARY */}
        <div className="navbar-center">
          <Link to="/reading-list" className="navbar-tag">READING LIST</Link>
          <span className="navbar-tag">POETRY</span>
          <span className="navbar-tag">FLASH FICTION</span>
          <span className="navbar-tag" onClick={openLouiseModal} style={{ cursor: 'pointer' }}>
            LOUISE'S CORNER
          </span>
          <span 
            className="navbar-tag" 
            onClick={() => document.getElementById('genre-section')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ cursor: 'pointer' }}
          >
            BROWSE BY GENRE
          </span>
        </div>

        <div className="navbar-right">
          <button className="hamburger" onClick={() => setMobileMenuOpen(true)} aria-label="Menu">
            <span /><span />
          </button>
          {menuOpen && user && (
  <div className="dropdown">
    {user.user_metadata?.avatar_url && (
      <img src={user.user_metadata.avatar_url} alt="avatar" className="dropdown-avatar" />
    )}
    <p className="dropdown-email">{user.email}</p>
    <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile Settings</Link>
    <button onClick={() => { supabase.auth.signOut(); setMenuOpen(false); }}>Sign Out</button>
    <button onClick={() => { openLouiseModal(); setMenuOpen(false); }}>Louise's Corner</button>
  </div>
)}
        </div>
      </nav>

      {/* Mobile menu – removed LIBRARY link */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <button className="mobile-menu-close" onClick={closeMobileMenu}>✕</button>
        <Link to="/reading-list" onClick={closeMobileMenu}>READING LIST</Link>
        <span onClick={openLouiseModal} style={{ cursor: 'pointer' }}>LOUISE'S CORNER</span>
        <span className="navbar-tag">POETRY</span>
        <span className="navbar-tag">FLASH FICTION</span>
        <span 
          className="navbar-tag" 
          onClick={() => document.getElementById('genre-section')?.scrollIntoView({ behavior: 'smooth' })}
          style={{ cursor: 'pointer' }}
        >
          BROWSE BY GENRE
        </span>
        {!user && <button className="mobile-signin" onClick={() => { setAuthOpen(true); closeMobileMenu(); }}>SIGN IN</button>}
        {user && <button onClick={() => { supabase.auth.signOut(); closeMobileMenu(); }}>SIGN OUT</button>}
      </div>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {louiseModalOpen && <LouisesCornerModal onClose={() => setLouiseModalOpen(false)} />}
    </>
  );
}