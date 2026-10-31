import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import Brand from "../common/Brand";
import { clearCurrentUser, getCurrentUser } from "../../services/authService";

export default function MainHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    clearCurrentUser();
    closeMobileMenu();
    navigate("/");
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className={`main-nav ${mobileMenuOpen ? "is-open" : ""}`}>
          <NavLink to="/tutors" onClick={closeMobileMenu}>
            Tìm gia sư
          </NavLink>
          <Link to="/#how-it-works" onClick={closeMobileMenu}>
            Cách học
          </Link>
          <Link to="/#subjects" onClick={closeMobileMenu}>
            Môn học
          </Link>
        </nav>
        <div className="header-actions">
          {currentUser ? (
            <>
              <span className="header-login">{currentUser.name}</span>
              <button
                className="button button-outline"
                type="button"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link
                className="header-login"
                to="/login"
                onClick={closeMobileMenu}
              >
                Đăng nhập
              </Link>
              <Link
                className="button button-dark header-cta"
                to="/become-tutor"
                onClick={closeMobileMenu}
              >
                Trở thành gia sư <ArrowForwardRoundedIcon fontSize="small" />
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          className="mobile-menu-button"
          aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
        </button>
      </div>
    </header>
  );
}