import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getPublicTutors } from "../../services/tutorService";

const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

export default function TutorListPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [subject, setSubject] = useState("Tất cả");
  const tutors = useMemo(() => getPublicTutors(), []);
  const subjects = ["Tất cả", ...new Set(tutors.map((tutor) => tutor.subject))];
  const filteredTutors = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");
    return tutors.filter((tutor) => {
      const matchesSubject = subject === "Tất cả" || tutor.subject === subject;
      const matchesQuery = `${tutor.name} ${tutor.subject} ${tutor.intro}`
        .toLocaleLowerCase("vi")
        .includes(normalizedQuery);
      return matchesSubject && matchesQuery;
    });
  }, [query, subject, tutors]);

  return (
    <MainLayout>
      <section className="page-container">
        <div className="page-heading">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Kết nối tri thức
          </p>
          <h1>Tìm gia sư phù hợp</h1>
          <p>Khám phá hồ sơ gia sư đã được xác nhận và chọn người đồng hành.</p>
        </div>
        <div className="list-controls">
          <label className="form-field">
            Tìm theo tên hoặc môn học
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ví dụ: Toán, IELTS..."
            />
          </label>
          <label className="form-field">
            Môn học
            <select
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            >
              {subjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="list-count">{filteredTutors.length} gia sư</p>
        {filteredTutors.length ? (
          <div className="page-tutor-grid">
            {filteredTutors.map((tutor) => (
              <article className="page-tutor-card" key={tutor.id}>
                <img
                  src={
                    tutor.image ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85"
                  }
                  alt={tutor.name}
                />
                <div className="page-tutor-content">
                  <span className="tutor-subject">{tutor.subject}</span>
                  <h2>{tutor.name}</h2>
                  <p>{tutor.intro}</p>
                  <div className="profile-meta">
                    <span>{tutor.experience || "Gia sư mới"}</span>
                    <span>{tutor.location || "Chưa cập nhật địa điểm"}</span>
                  </div>
                  <strong className="page-tutor-price">
                    {formatPrice(tutor.price)}đ{" "}
                    <span>/ buổi 60 phút</span>
                  </strong>
                  <Link
                    className="button button-outline"
                    to={`/tutors/${tutor.id}`}
                  >
                    Xem hồ sơ
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-results page-empty">
            <h2>Chưa tìm thấy gia sư phù hợp</h2>
            <p>Thử đổi từ khóa hoặc chọn môn học khác nhé.</p>
          </div>
        )}
      </section>
    </MainLayout>
  );
}