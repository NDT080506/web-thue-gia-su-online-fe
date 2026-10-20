import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import {
  getTutorApplications,
  updateTutorApplicationStatus,
} from "../../services/tutorService";

export default function AdminTutorApplicationsPage() {
  const [applications, setApplications] = useState(getTutorApplications);
  const [error, setError] = useState("");

  const updateStatus = (applicationId, status) => {
    setError("");
    try {
      setApplications(
        updateTutorApplicationStatus(applicationId, status)
      );
    } catch (updateError) {
      setError(updateError.message || "Không thể cập nhật hồ sơ.");
    }
  };

  return (
    <MainLayout>
      <section className="page-container">
        <div className="page-heading">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Khu vực quản trị demo
          </p>
          <h1>Duyệt hồ sơ gia sư</h1>
          <p>
            Chấp nhận hồ sơ để công khai profile trong danh sách gia sư.
          </p>
        </div>
        <p className="demo-notice">
          Trang duyệt này chỉ phục vụ luồng demo phía trình duyệt, hiện chưa có
          xác thực quyền admin.
        </p>
        {error && <div className="form-message form-message-error">{error}</div>}
        {applications.length ? (
          <div className="application-list">
            {applications.map((application) => (
              <article className="application-card" key={application.id}>
                <div className="application-card-heading">
                  <div>
                    <span className="tutor-subject">{application.subject}</span>
                    <h2>{application.name}</h2>
                    <p>{application.email}</p>
                  </div>
                  <span
                    className={`status-pill status-${application.status}`}
                  >
                    {application.status === "approved"
                      ? "Đã duyệt"
                      : application.status === "rejected"
                        ? "Từ chối"
                        : "Chờ duyệt"}
                  </span>
                </div>
                <p>{application.bio}</p>
                <div className="profile-meta">
                  <span>{application.experience}</span>
                  <span>{application.education}</span>
                  <span>{application.location}</span>
                </div>
                {application.status === "pending" && (
                  <div className="application-actions">
                    <button
                      className="button button-orange"
                      type="button"
                      onClick={() =>
                        updateStatus(application.id, "approved")
                      }
                    >
                      Duyệt hồ sơ
                    </button>
                    <button
                      className="button button-outline"
                      type="button"
                      onClick={() =>
                        updateStatus(application.id, "rejected")
                      }
                    >
                      Từ chối
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-results page-empty">
            <h2>Chưa có hồ sơ chờ duyệt</h2>
            <p>Hồ sơ học sinh gửi sẽ xuất hiện tại đây.</p>
          </div>
        )}
      </section>
    </MainLayout>
  );
}
