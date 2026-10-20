import { Link } from "react-router-dom";

export default function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Học Cùng trang chủ">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>
        học<span className="brand-accent">cùng</span>
      </span>
    </Link>
  );
}
