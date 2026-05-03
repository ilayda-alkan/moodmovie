import { NavLink, useNavigate } from "react-router-dom";

const sidebarLinks = [
  { to: "/dashboard", label: "Ana Sayfa", icon: "A", guest: true },
  { to: "/analyze", label: "Duygu Analizi", icon: "D", guest: true },
  { to: "/favorites", label: "Favorilerim", icon: "F", guest: false },
  { to: "/feedbacks", label: "Geri Bildirimlerim", icon: "G", guest: false },
];

export default function Sidebar({ isOpen, onToggle, onClose }) {
  const navigate = useNavigate();
  const isGuestSession = localStorage.getItem("session_mode") === "guest";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("guest_token");
    localStorage.removeItem("session_mode");

    navigate("/login");
  };

  const getLinkClassName = ({ isActive }) =>
    isActive ? "sidebar-link active" : "sidebar-link";

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div>
        <div className="sidebar-header">
          <div className="sidebar-brand">MoodMovie</div>
          <button
            type="button"
            className="sidebar-toggle-button"
            onClick={onToggle}
            aria-label={isOpen ? "Menuyu kapat" : "Menuyu ac"}
            title={isOpen ? "Menuyu kapat" : "Menuyu ac"}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className="sidebar-nav">
          {sidebarLinks
            .filter((link) => link.guest || !isGuestSession)
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={getLinkClassName}
                onClick={onClose}
                title={link.label}
              >
                <span className="sidebar-link-icon">{link.icon}</span>
                <span className="sidebar-link-text">{link.label}</span>
              </NavLink>
            ))}
        </nav>
      </div>

      <button className="logout-button" onClick={handleLogout} title="Cikis Yap">
        <span className="logout-icon" aria-hidden="true">
          X
        </span>
        <span className="logout-text">Cikis Yap</span>
      </button>
    </aside>
  );
}
