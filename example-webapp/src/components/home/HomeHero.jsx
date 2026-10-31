import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

export default function HomeHero({ tutors }) {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    const searchQuery = searchText.trim();
    navigate(
      searchQuery ? `/tutors?query=${encodeURIComponent(searchQuery)}` : "/tutors"
    );
  };

  return (
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
            Một người thầy phù hợp có thể thay đổi cả hành trình học tập. Tìm
            gia sư hiểu bạn, học theo nhịp của riêng mình.
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
                <img
                  key={tutor.id}
                  src={
                    tutor.image ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=85"
                  }
                  alt=""
                />
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
          <span className="hero-scribble" aria-hidden="true">
            ✳
          </span>
        </div>
      </div>
      <div className="hero-bottom-rule" />
    </section>
  );
}
