import { NavLink, useNavigate } from "react-router-dom";

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
            aria-label={isOpen ? "MenÃ¼yÃ¼ kapat" : "MenÃ¼yÃ¼ aÃ§"}
            title={isOpen ? "MenÃ¼yÃ¼ kapat" : "MenÃ¼yÃ¼ aÃ§"}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={getLinkClassName}
            onClick={onClose}
          >
            Ana Sayfa
          </NavLink>

          <NavLink
            to="/analyze"
            className={getLinkClassName}
            onClick={onClose}
          >
            Duygu Analizi
          </NavLink>

          {!isGuestSession ? (
            <NavLink
              to="/favorites"
              className={getLinkClassName}
              onClick={onClose}
            >
              Favorilerim
            </NavLink>
          ) : null}

          {!isGuestSession ? (
            <NavLink
              to="/feedbacks"
              className={getLinkClassName}
              onClick={onClose}
            >
              Geri Bildirimlerim
            </NavLink>
          ) : null}
        </nav>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Çıkış Yap
      </button>
    </aside>
  );
}
