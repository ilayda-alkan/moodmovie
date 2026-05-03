import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const closeSidebarOnMobile = () => {
    if (window.matchMedia("(max-width: 900px)").matches) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`app-shell ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
        onClose={closeSidebarOnMobile}
      />
      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="MenÃ¼yÃ¼ kapat"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className="main-content">
        <button
          type="button"
          className="sidebar-floating-toggle"
          onClick={() => setSidebarOpen((open) => !open)}
          aria-label={sidebarOpen ? "MenÃ¼yÃ¼ kapat" : "MenÃ¼yÃ¼ aÃ§"}
          title={sidebarOpen ? "MenÃ¼yÃ¼ kapat" : "MenÃ¼yÃ¼ aÃ§"}
        >
          <span />
          <span />
          <span />
        </button>
        <Outlet />
      </main>
    </div>
  );
}
