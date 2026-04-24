import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

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

          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Favoriler
          </NavLink>

          <NavLink
            to="/feedbacks"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            Geri Bildirimler
          </NavLink>
        </nav>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        Çıkış Yap
      </button>
    </aside>
  );
}
