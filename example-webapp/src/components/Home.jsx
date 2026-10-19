import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

const tutors = [
  {
    id: 1,
    name: "Nguyễn Minh Anh",
    initials: "MA",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=85",
    subject: "Toán",
    experience: "8 năm kinh nghiệm",
    rating: "4.98",
    reviews: 126,
    lessons: 840,
    location: "Cầu Giấy, Hà Nội",
    price: 250000,
    badge: "Gia sư nổi bật",
    intro: "Giúp em hiểu bản chất, tự tin chinh phục điểm 9+",
    schedule: "Tối nay · 19:30",
    color: "peach",
  },
  {
    id: 2,
    name: "Trần Quốc Bảo",
    initials: "QB",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=85",
    subject: "Tiếng Anh",
    experience: "6 năm kinh nghiệm",
    rating: "4.96",
    reviews: 98,
    lessons: 612,
    location: "Đống Đa, Hà Nội",
    price: 220000,
    badge: "Phản hồi nhanh",
    intro: "Luyện giao tiếp và IELTS theo lộ trình riêng",
    schedule: "Ngày mai · 18:00",
    color: "blue",
  },
  {
    id: 3,
    name: "Lê Thu Hà",
    initials: "TH",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=85",
    subject: "Vật lý",
    experience: "5 năm kinh nghiệm",
    rating: "4.93",
    reviews: 74,
    lessons: 426,
    location: "Thanh Xuân, Hà Nội",
    price: 200000,
    badge: "Được yêu thích",
    intro: "Học Vật lý qua ví dụ thực tế, nhớ lâu và dễ áp dụng",
    schedule: "Tối nay · 20:00",
    color: "green",
  },
  {
    id: 4,
    name: "Phạm Hoàng Nam",
    initials: "HN",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=85",
    subject: "Hóa học",
    experience: "7 năm kinh nghiệm",
    rating: "4.97",
    reviews: 111,
    lessons: 735,
    location: "Ba Đình, Hà Nội",
    price: 230000,
    badge: "Top gia sư",
    intro: "Ôn thi THPTQG có chiến lược, học đến đâu chắc đến đó",
    schedule: "Thứ 7 · 09:00",
    color: "lilac",
  },
];

const subjects = [
  { label: "Tất cả môn học", value: "Tất cả" },
  { label: "Toán học", value: "Toán" },
  { label: "Tiếng Anh", value: "Tiếng Anh" },
  { label: "Vật lý", value: "Vật lý" },
  { label: "Hóa học", value: "Hóa học" },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("vi-VN").format(price);

export default function Home() {
  const [query, setQuery] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("recommended");
  const [favorites, setFavorites] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleTutors = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");
    const filteredTutors = tutors.filter((tutor) => {
      const matchesSubject =
        selectedSubject === "Tất cả" || tutor.subject === selectedSubject;
      const matchesQuery =
        !normalizedQuery ||
        `${tutor.name} ${tutor.subject} ${tutor.intro}`
          .toLocaleLowerCase("vi")
          .includes(normalizedQuery);
      return matchesSubject && matchesQuery;
    });

    if (sortBy === "price-low") {
      return [...filteredTutors].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "rating") {
      return [...filteredTutors].sort(
        (a, b) => Number(b.rating) - Number(a.rating)
      );
    }
    return filteredTutors;
  }, [query, selectedSubject, sortBy]);

  const handleSearch = (event) => {
    event.preventDefault();
    setQuery(searchText);
    document.getElementById("tutors")?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleFavorite = (tutorId) => {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(tutorId)
        ? currentFavorites.filter((id) => id !== tutorId)
        : [...currentFavorites, tutorId]
    );
  };

  return (
    <div className="tutor-app">
      <div className="announcement">
        <span className="announcement-dot" />
        <span>Buổi học đầu tiên chỉ từ 99.000đ</span>
        <a href="#how-it-works">
          Tìm hiểu thêm <ArrowForwardRoundedIcon fontSize="inherit" />
        </a>
      </div>

      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="Học Cùng home">
            <span className="brand-mark">
              <span />
              <span />
              <span />
            </span>
            <span>học<span className="brand-accent">cùng</span></span>
          </Link>

          <nav className={`main-nav ${mobileMenuOpen ? "is-open" : ""}`}>
            <a href="#tutors" onClick={() => setMobileMenuOpen(false)}>
              Tìm gia sư
            </a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
              Cách học
            </a>
            <a href="#subjects" onClick={() => setMobileMenuOpen(false)}>
              Môn học
            </a>
          </nav>

          <div className="header-actions">
            <Link className="header-login" to="/login">
              Đăng nhập
            </Link>
            <Link className="button button-dark header-cta" to="/login">
              Bắt đầu học <ArrowForwardRoundedIcon fontSize="small" />
            </Link>
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

      <main>
        <section className="hero">
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-line" />
                Học theo cách của bạn
              </div>
              <h1>
                Gặp đúng thầy.
                <br />
                <span>Học đúng điều.</span>
              </h1>
              <p className="hero-description">
                Một người thầy phù hợp có thể thay đổi cả hành trình học tập.
                Tìm gia sư hiểu bạn, học theo nhịp của riêng mình.
              </p>

              <form className="hero-search" onSubmit={handleSearch}>
                <SearchRoundedIcon className="search-icon" />
                <input
                  aria-label="Tìm gia sư hoặc môn học"
                  placeholder="Bạn muốn học môn gì?"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
                <button className="button button-orange" type="submit">
                  Tìm gia sư
                </button>
              </form>

              <div className="hero-proof">
                <div className="avatar-stack" aria-hidden="true">
                  {tutors.slice(0, 3).map((tutor) => (
                    <img key={tutor.id} src={tutor.image} alt="" />
                  ))}
                  <span>+</span>
                </div>
                <p>
                  <strong>2.400+</strong> gia đình đã tìm được người đồng hành
                </p>
              </div>
            </div>

            <div className="hero-art" aria-label="Gia sư đang hướng dẫn học sinh">
              <div className="hero-photo-wrap">
                <img
                  className="hero-photo"
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1100&q=90"
                  alt="Gia sư thân thiện đang giảng bài"
                />
                <div className="photo-caption">
                  <span className="caption-check">✓</span>
                  <span>
                    <strong>Học vui, hiểu thật</strong>
                    <small>Bắt đầu từ một người thầy tốt</small>
                  </span>
                </div>
              </div>
              <div className="hero-note note-top">
                <span className="note-star">✳</span>
                <span>
                  <strong>4.9/5</strong>
                  <small>từ học viên</small>
                </span>
              </div>
              <div className="hero-note note-bottom">
                <span className="note-calendar">↗</span>
                <span>
                  <strong>Lịch học linh hoạt</strong>
                  <small>Online hoặc tại nhà</small>
                </span>
              </div>
              <span className="hero-scribble" aria-hidden="true">✳</span>
            </div>
          </div>
          <div className="hero-bottom-rule" />
        </section>

        <section className="subject-strip" id="subjects">
          <div className="subject-strip-inner">
            <span className="strip-label">ĐANG ĐƯỢC QUAN TÂM</span>
            <div className="subject-links">
              {["Toán", "Tiếng Anh", "Vật lý", "Hóa học", "IELTS"].map(
                (subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => {
                      setSelectedSubject(
                        subjects.some((item) => item.value === subject)
                          ? subject
                          : "Tất cả"
                      );
                      document
                        .getElementById("tutors")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {subject}
                    <ArrowForwardRoundedIcon fontSize="inherit" />
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        <section className="tutors-section" id="tutors">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                Kết nối tri thức
              </div>
              <h2>Gia sư dành cho bạn</h2>
              <p>
                Không chỉ giỏi chuyên môn — mà còn hiểu cách bạn muốn học.
              </p>
            </div>
            <a className="text-link" href="#how-it-works">
              Xem cách chọn gia sư <ArrowForwardRoundedIcon fontSize="small" />
            </a>
          </div>

          <div className="tutor-layout">
            <aside className="filter-panel">
              <div className="filter-title">
                <h3>Lọc gia sư</h3>
                <span>{visibleTutors.length} kết quả</span>
              </div>
              <div className="filter-group">
                <h4>Môn học</h4>
                {subjects.map((subject) => (
                  <label className="filter-option" key={subject.value}>
                    <input
                      type="radio"
                      name="subject"
                      value={subject.value}
                      checked={selectedSubject === subject.value}
                      onChange={() => setSelectedSubject(subject.value)}
                    />
                    <span>{subject.label}</span>
                  </label>
                ))}
              </div>
              <div className="filter-group filter-group-last">
                <h4>Hình thức học</h4>
                <label className="filter-option">
                  <input type="checkbox" defaultChecked />
                  <span>Học trực tuyến</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" />
                  <span>Học tại nhà</span>
                </label>
              </div>
              <div className="filter-aside-note">
                <span className="note-doodle">✳</span>
                <p>
                  <strong>Chưa biết chọn ai?</strong>
                  Đội ngũ Học Cùng sẵn sàng giúp bạn tìm người phù hợp.
                </p>
                <a href="#how-it-works">Nhờ tư vấn <ArrowForwardRoundedIcon fontSize="inherit" /></a>
              </div>
            </aside>

            <div className="tutor-results">
              <div className="results-toolbar">
                <p>
                  <strong>{visibleTutors.length} gia sư</strong>
                  {query ? ` phù hợp với “${query}”` : " được chọn lọc kỹ"}
                </p>
                <label className="sort-control">
                  <span>Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    aria-label="Sắp xếp gia sư"
                  >
                    <option value="recommended">Phù hợp nhất</option>
                    <option value="rating">Đánh giá cao</option>
                    <option value="price-low">Học phí thấp</option>
                  </select>
                </label>
              </div>

              {visibleTutors.length ? (
                <div className="tutor-list">
                  {visibleTutors.map((tutor) => (
                    <article className="tutor-card" key={tutor.id}>
                      <div className={`tutor-photo ${tutor.color}`}>
                        <img src={tutor.image} alt={tutor.name} />
                        <span className="tutor-badge">{tutor.badge}</span>
                      </div>
                      <div className="tutor-info">
                        <div className="tutor-heading">
                          <div>
                            <div className="tutor-subject">{tutor.subject}</div>
                            <h3>{tutor.name}</h3>
                          </div>
                          <button
                            type="button"
                            className={`favorite-button ${
                              favorites.includes(tutor.id) ? "is-favorite" : ""
                            }`}
                            aria-label={
                              favorites.includes(tutor.id)
                                ? `Bỏ lưu ${tutor.name}`
                                : `Lưu ${tutor.name}`
                            }
                            onClick={() => toggleFavorite(tutor.id)}
                          >
                            {favorites.includes(tutor.id) ? (
                              <FavoriteRoundedIcon />
                            ) : (
                              <FavoriteBorderRoundedIcon />
                            )}
                          </button>
                        </div>
                        <p className="tutor-intro">{tutor.intro}</p>
                        <div className="tutor-meta">
                          <span>
                            <StarRoundedIcon className="rating-star" />
                            <strong>{tutor.rating}</strong>
                            <span className="meta-muted">({tutor.reviews})</span>
                          </span>
                          <span>{tutor.experience}</span>
                          <span className="location-meta">
                            <PlaceOutlinedIcon />
                            {tutor.location}
                          </span>
                        </div>
                        <div className="tutor-footer">
                          <div className="tutor-price">
                            <strong>{formatPrice(tutor.price)}đ</strong>
                            <span>/ buổi 60 phút</span>
                          </div>
                          <div className="tutor-actions">
                            <span className="availability">
                              <AccessTimeRoundedIcon />
                              {tutor.schedule}
                            </span>
                            <button
                              type="button"
                              className="button button-outline"
                              onClick={() => setSelectedTutor(tutor)}
                            >
                              Xem hồ sơ
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-results">
                  <span>◌</span>
                  <h3>Chưa tìm thấy gia sư phù hợp</h3>
                  <p>Thử đổi từ khóa hoặc chọn một môn học khác nhé.</p>
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => {
                      setSearchText("");
                      setQuery("");
                      setSelectedSubject("Tất cả");
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
              <div className="more-tutors">
                <span>Chúng tôi đang kết nối thêm gia sư chất lượng.</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubject("Tất cả");
                    setQuery("");
                    setSearchText("");
                  }}
                >
                  Khám phá tất cả <ArrowForwardRoundedIcon fontSize="small" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <div className="how-intro">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              Đơn giản từ buổi đầu
            </div>
            <h2>Học tốt hơn, bắt đầu từ một cuộc trò chuyện.</h2>
            <p>
              Bạn không cần biết chính xác mình cần gì. Chỉ cần bắt đầu — chúng
              tôi sẽ cùng bạn tìm ra cách học phù hợp.
            </p>
            <Link to="/login" className="button button-orange">
              Tìm gia sư phù hợp <ArrowForwardRoundedIcon fontSize="small" />
            </Link>
          </div>
          <div className="steps-list">
            <div className="step-item">
              <span className="step-number">01</span>
              <div>
                <h3>Nói điều bạn đang cần</h3>
                <p>Môn học, mục tiêu, thời gian — bắt đầu từ điều đơn giản nhất.</p>
              </div>
              <span className="step-arrow">↗</span>
            </div>
            <div className="step-item">
              <span className="step-number">02</span>
              <div>
                <h3>Gặp người thầy phù hợp</h3>
                <p>Xem hồ sơ, đọc đánh giá và chọn người khiến bạn thấy tin tưởng.</p>
              </div>
              <span className="step-arrow">↗</span>
            </div>
            <div className="step-item">
              <span className="step-number">03</span>
              <div>
                <h3>Thử một buổi học đầu tiên</h3>
                <p>Trải nghiệm cách dạy trước khi cùng nhau lên lộ trình dài hơn.</p>
              </div>
              <span className="step-arrow">↗</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <Link to="/" className="brand" aria-label="Học Cùng home">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          <span>học<span className="brand-accent">cùng</span></span>
        </Link>
        <p>Mỗi người học một cách. Mỗi người thầy một điều đặc biệt.</p>
        <span className="footer-copy">© 2024 Học Cùng</span>
      </footer>

      {selectedTutor && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedTutor(null);
          }}
        >
          <section
            className="tutor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Đóng"
              onClick={() => setSelectedTutor(null)}
            >
              <CloseRoundedIcon />
            </button>
            <img
              className="modal-photo"
              src={selectedTutor.image}
              alt={selectedTutor.name}
            />
            <div className="modal-content">
              <span className="tutor-subject">{selectedTutor.subject}</span>
              <h2 id="modal-title">{selectedTutor.name}</h2>
              <div className="modal-rating">
                <StarRoundedIcon className="rating-star" />
                <strong>{selectedTutor.rating}</strong>
                <span>({selectedTutor.reviews} đánh giá)</span>
                <span>·</span>
                <span>{selectedTutor.lessons} buổi học</span>
              </div>
              <p>{selectedTutor.intro}.</p>
              <div className="modal-details">
                <span>{selectedTutor.experience}</span>
                <span>{selectedTutor.location}</span>
                <span>
                  {formatPrice(selectedTutor.price)}đ / buổi 60 phút
                </span>
              </div>
              <div className="modal-login-note">
                <strong>Sẵn sàng cho buổi học đầu tiên?</strong>
                <span>Đăng nhập để liên hệ và đặt lịch với gia sư.</span>
              </div>
              <Link
                className="button button-orange modal-cta"
                to="/login"
                onClick={() => setSelectedTutor(null)}
              >
                Đăng nhập để đặt lịch <ArrowForwardRoundedIcon fontSize="small" />
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
