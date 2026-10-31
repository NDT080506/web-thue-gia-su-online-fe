import { Link, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getPublicTutorById } from "../../services/tutorService";

const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price);

export default function TutorDetailPage() {
  const { id } = useParams();
  const tutor = getPublicTutorById(id);

  if (!tutor) {
    return (
      <MainLayout>
        <section className="page-container page-empty">
          <h1>Hồ sơ chưa khả dụng</h1>
          <p>
            Hồ sơ này chưa được admin duyệt hoặc không còn tồn tại.
          </p>
          <Link className="button button-orange" to="/tutors">
            Quay lại danh sách gia sư
          </Link>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="page-container">
        <Link className="back-link" to="/tutors">
          ← Danh sách gia sư
        </Link>
        <article className="tutor-profile">
          <img
            className="tutor-profile-image"
            src={
              tutor.image ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85"
            }
            alt={tutor.name}
          />
          <div className="tutor-profile-content">
            <span className="tutor-subject">{tutor.subject}</span>
            <h1>{tutor.name}</h1>
            <p className="profile-intro">{tutor.intro}</p>
            <div className="profile-meta">
              <span>{tutor.experience || "Gia sư mới"}</span>
              <span>{tutor.education || "Thông tin học vấn đang cập nhật"}</span>
              <span>{tutor.location || "Chưa cập nhật địa điểm"}</span>
            </div>
            <div className="profile-bio">
              <h2>Giới thiệu</h2>
              <p>{tutor.bio || tutor.intro}</p>
            </div>
            <div className="profile-price">
              <strong>{formatPrice(tutor.price)}đ</strong>
              <span>/ buổi 60 phút</span>
            </div>
            <Link className="button button-orange" to="/login">
              Đăng nhập để liên hệ
            </Link>
          </div>
        </article>
      </section>
    </MainLayout>
  );
}