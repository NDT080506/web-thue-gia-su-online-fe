import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { setCurrentUser } from "../../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    const name = email.split("@")[0].replace(/[._-]+/g, " ");
    setCurrentUser({
      id: email.trim().toLocaleLowerCase("vi"),
      name: name.replace(/\b\w/g, (letter) => letter.toLocaleUpperCase("vi")),
      email: email.trim(),
      role: "student",
    });
    navigate(location.state?.from || "/");
  };

  return (
    <AuthLayout
      title="Chào mừng bạn trở lại"
      description="Đăng nhập để tiếp tục hành trình học tập của bạn."
    >
      <form className="form-stack" onSubmit={handleSubmit}>
        {error && <div className="form-message form-message-error">{error}</div>}
        <label className="form-field">
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ban@email.com"
          />
        </label>
        <label className="form-field">
          Mật khẩu
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu"
          />
        </label>
        <button className="button button-orange form-submit" type="submit">
          Đăng nhập
        </button>
      </form>
      <p className="auth-switch">
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
      <p className="demo-notice">
        Bản giao diện hiện dùng đăng nhập demo trên trình duyệt; chưa xác thực
        với máy chủ.
      </p>
    </AuthLayout>
  );
}