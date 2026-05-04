import { NavLink, useNavigate } from "react-router-dom";

function SidebarIcon({ type }) {
  const icons = {
    home: (
      <>
        <path d="M3 10.8 12 3l9 7.8" />
        <path d="M5.5 9.2V21h13V9.2" />
        <path d="M9.5 21v-6h5v6" />
      </>
    ),
    analyze: (
      <>
        <path d="M4 13.5a8 8 0 0 1 16 0" />
        <path d="M7 13.5a5 5 0 0 1 10 0" />
        <path d="M12 13.5v4" />
        <path d="M9 18h6" />
        <path d="M8 5.5 6.5 3" />
        <path d="M16 5.5 17.5 3" />
      </>
    ),
    favorite: (
      <path d="M20.8 8.4c0 5-8.8 10.2-8.8 10.2S3.2 13.4 3.2 8.4A4.6 4.6 0 0 1 12 6.5a4.6 4.6 0 0 1 8.8 1.9Z" />
    ),
    feedback: (
      <>
        <path d="M5 5h14v10H8l-3 3V5Z" />
        <path d="M8.5 9h7" />
        <path d="M8.5 12h4.5" />
      </>
    ),
    logout: (
      <>
        <path d="M9 4H5v16h4" />
        <path d="M13 8l4 4-4 4" />
        <path d="M17 12H9" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="sidebar-icon-svg">
      {icons[type]}
    </svg>
  );
}

const sidebarLinks = [
  { to: "/dashboard", label: "Ana Sayfa", icon: "home", guest: true },
  { to: "/analyze", label: "Duygu Analizi", icon: "analyze", guest: true },
  { to: "/favorites", label: "Favorilerim", icon: "favorite", guest: false },
  { to: "/feedbacks", label: "Geri Bildirimlerim", icon: "feedback", guest: false },
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
      <div className="sidebar-main">
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
                <span className="sidebar-link-icon">
                  <SidebarIcon type={link.icon} />
                </span>
                <span className="sidebar-link-text">{link.label}</span>
              </NavLink>
            ))}
        </nav>
      </div>

      <button className="logout-button" onClick={handleLogout} title="Çıkış Yap">
        <span className="logout-icon" aria-hidden="true">
          <SidebarIcon type="logout" />
        </span>
        <span className="logout-text">Çıkış Yap</span>
      </button>
    </aside>
  );
}
