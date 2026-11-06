import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <img src={logo} alt="" width="30" height="30" />
            <span>MoodMatch</span>
          </div>
          <p>Books and movies that match how you feel right now.</p>
        </div>

        <nav className="footer__links" aria-label="Footer">
          <Link to="/">Home</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          {isAuthenticated ? <Link to="/dashboard">Dashboard</Link> : <Link to="/login">Login</Link>}
        </nav>

        <p className="footer__note">
          CDAC PG-CPAC Web Programming Technologies mini project.
          <br />
          Built with React, Node.js, Express and MySQL.
        </p>
      </div>
      <div className="footer__bottom">© {new Date().getFullYear()} MoodMatch. All rights reserved.</div>
    </footer>
  );
}
