import { Link } from "react-router-dom";

export default function AuthLayout({ title, description, children }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="brand auth-brand">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          <span>
            học<span className="brand-accent">cùng</span>
          </span>
        </Link>
        <p className="eyebrow">
          <span className="eyebrow-line" />
          Cùng bạn học tốt hơn
        </p>
        <h1>{title}</h1>
        <p className="auth-description">{description}</p>
        {children}
      </section>
    </main>
  );
}