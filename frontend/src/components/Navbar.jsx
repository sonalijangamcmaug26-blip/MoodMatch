import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/moodmatch-logo.png';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setOpen(false);
  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const linkClass = ({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`;

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__brand" onClick={closeMenu}>
          <img src={logo} alt="MoodMatch" />
        </Link>

        <button
          type="button"
          className="nav__toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span /><span />
        </button>

        <nav className={`nav__links ${open ? 'nav__links--open' : ''}`}>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={linkClass} onClick={closeMenu}>Dashboard</NavLink>
              {user.role === 'ADMIN' && <NavLink to="/admin" className={linkClass} onClick={closeMenu}>Admin Panel</NavLink>}
              <NavLink to="/moods" className={linkClass} onClick={closeMenu}>Discover</NavLink>
              <NavLink to="/favourites" className={linkClass} onClick={closeMenu}>Favourites</NavLink>
              <NavLink to="/history" className={linkClass} onClick={closeMenu}>History</NavLink>
              <NavLink to="/about" className={linkClass} onClick={closeMenu}>About Us</NavLink>
              <NavLink to="/contact" className={linkClass} onClick={closeMenu}>Contact Us</NavLink>
              <span className="nav__user">Hi, {user.full_name.split(' ')[0]}</span>
              <button type="button" className="btn btn--ghost btn--small" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" end className={linkClass} onClick={closeMenu}>Home</NavLink>
              <NavLink to="/about" className={linkClass} onClick={closeMenu}>About Us</NavLink>
              <NavLink to="/contact" className={linkClass} onClick={closeMenu}>Contact Us</NavLink>
              <NavLink to="/login" className={linkClass} onClick={closeMenu}>Login</NavLink>
              <Link to="/register" className="btn btn--primary btn--small" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
