import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { setCurrentUser } from "../../services/authService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Mật khẩu cần có ít nhất 8 ký tự.");
      return;
    }

    setCurrentUser({
      id: email.trim().toLocaleLowerCase("vi"),
      name: name.trim(),
      email: email.trim(),
      role: "student",
    });
    navigate("/");
  };

  return (
    <AuthLayout
      title="Tạo tài khoản học sinh"
      description="Tham gia cộng đồng học tập và tìm gia sư phù hợp."
    >
      <form className="form-stack" onSubmit={handleSubmit}>
        {error && <div className="form-message form-message-error">{error}</div>}
        <label className="form-field">
          Họ và tên
          <input
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nguyễn Văn An"
          />
        </label>
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
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tối thiểu 8 ký tự"
          />
        </label>
        <button className="button button-orange form-submit" type="submit">
          Tạo tài khoản
        </button>
      </form>
      <p className="auth-switch">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
      <p className="demo-notice">
        Bản giao diện hiện tạo phiên học sinh demo trên trình duyệt; chưa lưu
        tài khoản lên máy chủ.
      </p>
    </AuthLayout>
  );
}