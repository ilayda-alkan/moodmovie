import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { createGuestSessionRequest } from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const isGuestSession = localStorage.getItem("session_mode") === "guest";

  const [isLogin, setIsLogin] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const switchMode = (nextIsLogin) => {
    setIsLogin(nextIsLogin);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const token = response.data.access_token;
        if (!token) {
          throw new Error("Token donmedi.");
        }

        localStorage.removeItem("guest_token");
        localStorage.setItem("session_mode", "user");
        localStorage.setItem("token", token);
        navigate("/");
        return;
      }

      await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setSuccess("Kayıt başarılı. Şimdi giriş yapabilirsiniz.");
      setIsLogin(true);
    } catch (err) {
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err.message ||
        "Bir hata olustu.";

      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await createGuestSessionRequest();
      if (!data?.guest_token) {
        throw new Error("Misafir oturumu olusturulamadi.");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.setItem("guest_token", data.guest_token);
      localStorage.setItem("session_mode", "guest");
      navigate("/");
    } catch (err) {
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err.message ||
        "Misafir oturumu baslatilamadi.";

      setError(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-hero">
          <span className="auth-badge">MoodMovie</span>
          <h1>Duyguna göre film deneyimini kişiselleştir.</h1>
          <p>Giriş yaparak film önerilerine ve favorilerine tek yerden ulaşabilirsin.</p>

          <div className="auth-feature-list">
            <div className="auth-feature-card">
              <strong>Anlık duygu analizi</strong>
              <span>Yazdığın metinden ruh halini hızlıca tespit eder.</span>
            </div>
            <div className="auth-feature-card">
              <strong>Akıllı öneriler</strong>
              <span>Duyguna uygun film listesini saniyeler içinde hazırlar.</span>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card-head">
            <h2>{isLogin ? "Hesabına giriş yap" : "Yeni hesap oluştur"}</h2>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <label className="auth-field">
                <span>Kullanıcı adı</span>
                <input
                  type="text"
                  name="username"
                  placeholder="Kullanıcı adın"
                  value={formData.username}
                  onChange={handleChange}
                  className="auth-input"
                  required
                />
              </label>
            )}

            <label className="auth-field">
              <span>E-posta</span>
              <input
                type="email"
                name="email"
                placeholder="örnek@mail.com"
                value={formData.email}
                onChange={handleChange}
                className="auth-input"
                required
              />
            </label>

            <label className="auth-field">
              <span>Şifre</span>
              <div className="auth-password-control">
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  placeholder="Şifreni gir"
                  value={formData.password}
                  onChange={handleChange}
                  className="auth-input auth-password-input"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  aria-label={passwordVisible ? "Sifreyi gizle" : "Sifreyi goster"}
                  title={passwordVisible ? "Sifreyi gizle" : "Sifreyi goster"}
                >
                  {passwordVisible ? (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="auth-password-icon"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.7 5.1A10.9 10.9 0 0 1 12 5c5 0 8.5 4.2 9.7 5.9.4.6.4 1.2 0 1.8-.4.6-1.1 1.5-2.1 2.4" />
                      <path d="M6.7 6.7A15.2 15.2 0 0 0 2.3 11c-.4.6-.4 1.2 0 1.8C3.5 14.6 7 18.8 12 18.8c1.7 0 3.2-.5 4.5-1.2" />
                      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="auth-password-icon"
                    >
                      <path d="M2.3 11.1C3.5 9.4 7 5.2 12 5.2s8.5 4.2 9.7 5.9c.4.6.4 1.2 0 1.8-1.2 1.7-4.7 5.9-9.7 5.9s-8.5-4.2-9.7-5.9c-.4-.6-.4-1.2 0-1.8Z" />
                      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {error && <p className="auth-message auth-error">{error}</p>}
            {success && <p className="auth-message auth-success">{success}</p>}

            <div className="auth-action-row">
              <button
                type={isLogin ? "submit" : "button"}
                className={`auth-submit-button ${isLogin ? "" : "secondary"}`}
                disabled={loading && isLogin}
                onClick={isLogin ? undefined : () => switchMode(true)}
              >
                {loading && isLogin ? "Yükleniyor..." : "Giriş Yap"}
              </button>

              <button
                type={!isLogin ? "submit" : "button"}
                className={`auth-submit-button ${!isLogin ? "" : "secondary"}`}
                disabled={loading && !isLogin}
                onClick={!isLogin ? undefined : () => switchMode(false)}
              >
                {loading && !isLogin ? "Yükleniyor..." : "Kayıt Ol"}
              </button>
            </div>

            <button
              type="button"
              className={`auth-submit-button auth-guest-button ${
                isGuestSession ? "" : "secondary"
              }`}
              onClick={handleContinueAsGuest}
              disabled={loading}
            >
              {loading ? "Yukleniyor..." : "Misafir Olarak Devam Et"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
