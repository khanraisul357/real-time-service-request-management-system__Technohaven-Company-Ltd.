import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import Icon from '../common/Icon';
import Logo from '../common/Logo';
import RoleSwitcher from './RoleSwitcher';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isSupervisor } = useRole();
  const location = useLocation();

  // Close the drawer after navigating, and on Escape.
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const linkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <>
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" aria-label="TechnohavenServicing24 – home">
          <Logo />
        </Link>
        <div className="nav-right">
          <RoleSwitcher />
          <button
            className="icon-btn nav-toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="side-drawer"
          >
            <Icon name="menu" size={22} />
          </button>
        </div>
      </div>
    </header>

      <div className={`drawer-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <aside id="side-drawer" className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="drawer-head">
          <Logo />
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close navigation menu">
            <Icon name="x" size={20} />
          </button>
        </div>
        <nav className="nav-links">
          <NavLink to="/" end className={linkClass}>
            <Icon name="grid" size={16} /> Dashboard
          </NavLink>
          <NavLink to="/requests/new" className={linkClass}>
            <Icon name="plus" size={16} /> New request
          </NavLink>
          {isSupervisor && (
            <NavLink to="/monitor" className={linkClass}>
              <Icon name="activity" size={16} /> Live monitor
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  );
}