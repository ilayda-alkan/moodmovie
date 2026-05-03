import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
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

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">MoodMovie</div>

        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Ana Sayfa
          </NavLink>

          <NavLink
            to="/analyze"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Duygu Analizi
          </NavLink>

          {!isGuestSession ? (
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              Favoriler
            </NavLink>
          ) : null}

          {!isGuestSession ? (
            <NavLink
              to="/feedbacks"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              Geri Bildirimler
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
