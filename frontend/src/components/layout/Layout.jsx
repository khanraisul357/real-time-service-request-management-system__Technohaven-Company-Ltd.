import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          © {new Date().getFullYear()} TechnohavenServicing24 · IT equipment repair request management
        </div>
      </footer>
    </div>
  );
}
