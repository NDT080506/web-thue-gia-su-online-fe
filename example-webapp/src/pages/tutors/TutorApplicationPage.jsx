import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getCurrentUser } from "../../services/authService";
import {
  getApplicationByUserId,
  submitTutorApplication,
} from "../../services/tutorService";

export default function TutorApplicationPage() {
  const user = getCurrentUser();
  const [application, setApplication] = useState(() =>
    user ? getApplicationByUserId(user.id) : null
  );
  const [error, setError] = useState("");

  if (!user || user.role !== "student") {
    return <Navigate to="/login" replace state={{ from: "/become-tutor" }} />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      const submittedApplication = submitTutorApplication({
        userId: user.id,
        name: user.name,
        email: user.email,
        subject: formData.get("subject"),
        experience: formData.get("experience"),
        education: formData.get("education"),
        location: formData.get("location"),
        price: Number(formData.get("price")),
        image: formData.get("image"),
        bio: formData.get("bio"),
        intro: formData.get("intro"),
      });
      setApplication(submittedApplication);
    } catch (submissionError) {
      setError(
        submissionError.message || "Không thể gửi hồ sơ. Vui lòng thử lại."
      );
    }
  };

  return (
    <MainLayout>
      <section className="page-container narrow-container">
        <div className="page-heading">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Dành cho học sinh
          </p>
          <h1>Trở thành gia sư</h1>
          <p>
            Điền thông tin chuyên môn. Hồ sơ sẽ được admin xem xét trước khi
            xuất hiện công khai.
          </p>
        </div>

        {application ? (
          <div className="application-status">
            <span
              className={`status-pill status-${application.status}`}
              role="status"
            >
              {application.status === "approved"
                ? "Đã được duyệt"
                : application.status === "rejected"
                  ? "Chưa được duyệt"
                  : "Đang chờ duyệt"}
            </span>
            <h2>Xin chào, {application.name}</h2>
            <p>
              {application.status === "approved"
                ? "Hồ sơ của bạn đã được duyệt và đang hiển thị trong danh sách gia sư."
                : application.status === "rejected"
                  ? "Admin chưa duyệt hồ sơ của bạn. Hãy liên hệ đội ngũ hỗ trợ để biết thêm thông tin."
                  : "Hồ sơ đã được gửi thành công. Bạn có thể quay lại sau khi admin xem xét."}
            </p>
            {application.status === "approved" ? (
              <Link
                className="button button-orange"
                to={`/tutors/${application.id}`}
              >
                Xem hồ sơ gia sư
              </Link>
            ) : (
              <Link className="button button-outline" to="/tutors">
                Khám phá gia sư
              </Link>
            )}
          </div>
        ) : (
          <form className="application-form form-stack" onSubmit={handleSubmit}>
            {error && <div className="form-message form-message-error">{error}</div>}
            <label className="form-field">
              Họ và tên
              <input value={user.name} readOnly />
            </label>
            <label className="form-field">
              Email
              <input value={user.email} readOnly />
            </label>
            <label className="form-field">
              Môn học giảng dạy
              <select name="subject" required defaultValue="">
                <option value="" disabled>
                  Chọn môn học
                </option>
                <option>Toán</option>
                <option>Tiếng Anh</option>
                <option>Vật lý</option>
                <option>Hóa học</option>
                <option>Ngữ văn</option>
                <option>Khác</option>
              </select>
            </label>
            <label className="form-field">
              Kinh nghiệm giảng dạy
              <input
                name="experience"
                required
                placeholder="Ví dụ: 3 năm dạy Toán cấp 2"
              />
            </label>
            <label className="form-field">
              Học vấn / bằng cấp
              <input
                name="education"
                required
                placeholder="Ví dụ: Cử nhân Sư phạm Toán"
              />
            </label>
            <label className="form-field">
              Khu vực giảng dạy
              <input
                name="location"
                required
                placeholder="Quận, thành phố"
              />
            </label>
            <label className="form-field">
              Học phí mỗi buổi (VNĐ)
              <input
                name="price"
                type="number"
                min="10000"
                step="10000"
                required
                placeholder="200000"
              />
            </label>
            <label className="form-field">
              Link ảnh đại diện (không bắt buộc)
              <input name="image" type="url" placeholder="https://" />
            </label>
            <label className="form-field">
              Giới thiệu ngắn
              <input
                name="intro"
                required
                maxLength={140}
                placeholder="Điểm nổi bật trong cách dạy của bạn"
              />
            </label>
            <label className="form-field">
              Thông tin chi tiết
              <textarea
                name="bio"
                required
                rows="5"
                placeholder="Chia sẻ phương pháp giảng dạy, đối tượng học viên phù hợp..."
              />
            </label>
            <button className="button button-orange form-submit" type="submit">
              Gửi hồ sơ xét duyệt
            </button>
          </form>
        )}
        <p className="demo-notice">
          Hồ sơ và trạng thái duyệt hiện được lưu trên trình duyệt này để demo,
          chưa đồng bộ với máy chủ.
        </p>
      </section>
    </MainLayout>
  );
}
