import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function LoginPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
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
              <input
                type="password"
                name="password"
                placeholder="Şifreni gir"
                value={formData.password}
                onChange={handleChange}
                className="auth-input"
                required
              />
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
          </form>
        </section>
      </div>
    </div>
  );
}
