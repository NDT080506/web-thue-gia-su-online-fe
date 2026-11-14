
import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  BookOpen,
  Package,
  Pencil,
  Trash2,
  Save,
  XCircle,
  Loader2,
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  RefreshCw
} from 'lucide-react';

import {
  courseApi,
  brokeragePackageApi
} from '../services/api';

const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount || 0);
};

export default function TutorCoursePackageManager({
  isOpen,
  onClose,
  currentUser,
  onWalletUpdated,
  onDataChanged
}) {
  const [activeTab, setActiveTab] = useState('courses');

  const [courses, setCourses] = useState([]);
  const [packages, setPackages] = useState([]);
  const [enrollments, setEnrollments] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    title: '',
    name: '',
    price: '',
    platformFeePercent: 10,
    active: true
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ==================== LOAD DATA ====================

  const loadData = useCallback(async () => {
    if (!isOpen || !currentUser?.id) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const [courseResult, packageResult] = await Promise.allSettled([
        courseApi.getCoursesByTutor(currentUser.id),
        brokeragePackageApi.getPackagesByTutor(currentUser.id)
      ]);

      const tutorCourses =
        courseResult.status === 'fulfilled'
          ? courseResult.value || []
          : [];

      const tutorPackages =
        packageResult.status === 'fulfilled'
          ? packageResult.value || []
          : [];

      setCourses(tutorCourses);
      setPackages(tutorPackages);

      // Lấy danh sách học viên của từng khóa học
      const enrollmentResults = await Promise.all(
        tutorCourses.map(async (course) => {
          try {
            const result = await courseApi.getEnrollmentsByCourse(
              course.id
            );

            return [course.id, result || []];
          } catch (error) {
            console.error(
              `Không lấy được học viên khóa học ${course.id}:`,
              error
            );

            return [course.id, []];
          }
        })
      );

      setEnrollments(
        Object.fromEntries(enrollmentResults)
      );

      if (
        courseResult.status === 'rejected' &&
        packageResult.status === 'rejected'
      ) {
        throw courseResult.reason;
      }

    } catch (error) {
      setErrorMsg(
        error.data?.message ||
        error.message ||
        'Không thể tải dữ liệu quản lý.'
      );
    } finally {
      setLoading(false);
    }
  }, [isOpen, currentUser?.id]);

  useEffect(() => {
    if (isOpen) {
      setEditing(null);
      setSuccessMsg('');
      loadData();
    }
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  // ==================== EDIT ====================

  const handleEditCourse = (course) => {
    setEditing({
      type: 'course',
      id: course.id
    });

    setForm({
      title: course.title || '',
      name: '',
      price: course.price ?? 0,

      // CourseResponse của backend không trả
      // platformFeePercent, cần nhập lại mức đang áp dụng.
      platformFeePercent: 10,

      active: course.active !== false
    });

    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleEditPackage = (pkg) => {
    setEditing({
      type: 'package',
      id: pkg.id
    });

    setForm({
      title: '',
      name: pkg.name || '',
      price: pkg.price ?? 0,
      platformFeePercent: pkg.platformFeePercent ?? 10,
      active: pkg.active !== false
    });

    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCancelEdit = () => {
    setEditing(null);

    setForm({
      title: '',
      name: '',
      price: '',
      platformFeePercent: 10,
      active: true
    });

    setErrorMsg('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (!editing) return;

    const titleOrName =
      editing.type === 'course'
        ? form.title.trim()
        : form.name.trim();

    const price = Number(form.price);
    const fee = Number(form.platformFeePercent);

    if (!titleOrName) {
      setErrorMsg('Vui lòng nhập tên hoặc tiêu đề.');
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setErrorMsg('Giá không hợp lệ.');
      return;
    }

    if (!Number.isInteger(fee) || fee < 0 || fee > 100) {
      setErrorMsg('Phí nền tảng phải từ 0 đến 100%.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      if (editing.type === 'course') {
        await courseApi.updateCourse(editing.id, {
          title: form.title.trim(),
          price,
          platformFeePercent: fee,
          active: form.active
        });

        setSuccessMsg('Cập nhật khóa học thành công!');

      } else {
        await brokeragePackageApi.updatePackage(
          editing.id,
          {
            name: form.name.trim(),
            price,
            platformFeePercent: fee,
            active: true
          },
          currentUser.role
        );

        setSuccessMsg('Cập nhật gói môi giới thành công!');
      }

      setEditing(null);

      await loadData();

      if (onDataChanged) {
        await onDataChanged();
      }

    } catch (error) {
      setErrorMsg(
        error.data?.message ||
        error.message ||
        'Không thể cập nhật dữ liệu.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================== DELETE ====================

  const handleDeleteCourse = async (course) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa khóa học "${course.title}"?`
    );

    if (!confirmed) return;

    setProcessingId(course.id);
    setErrorMsg('');

    try {
      await courseApi.deleteCourse(course.id);

      setSuccessMsg('Đã xóa khóa học.');

      await loadData();

      if (onDataChanged) {
        await onDataChanged();
      }

    } catch (error) {
      setErrorMsg(
        error.data?.message ||
        error.message ||
        'Không thể xóa khóa học.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeletePackage = async (pkg) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa gói "${pkg.name}"?`
    );

    if (!confirmed) return;

    setProcessingId(pkg.id);
    setErrorMsg('');

    try {
      await brokeragePackageApi.deletePackage(pkg.id);

      setSuccessMsg('Đã xóa gói dịch vụ.');

      await loadData();

      if (onDataChanged) {
        await onDataChanged();
      }

    } catch (error) {
      setErrorMsg(
        error.data?.message ||
        error.message ||
        'Không thể xóa gói dịch vụ.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==================== COMPLETE ENROLLMENT ====================

  const handleCompleteEnrollment = async (enrollment) => {
    const confirmed = window.confirm(
      'Xác nhận học viên đã hoàn thành khóa học?\n\n' +
      'Hệ thống sẽ giải ngân khoản tiền đang giữ ' +
      'cho gia sư và chuyển phí nền tảng.'
    );

    if (!confirmed) return;

    setProcessingId(enrollment.id);
    setErrorMsg('');

    try {
      await courseApi.completeEnrollment(enrollment.id);

      setSuccessMsg(
        'Đã hoàn thành khóa học và giải ngân tiền cho gia sư!'
      );

      await loadData();

      if (onWalletUpdated) {
        await onWalletUpdated();
      }

    } catch (error) {
      setErrorMsg(
        error.data?.message ||
        error.message ||
        'Không thể hoàn thành khóa học.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==================== RENDER ====================

  return (
    <div
      className="ud-modal-backdrop"
      onClick={onClose}
      style={{ zIndex: 1400 }}
    >
      <div
        className="ud-detail-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 1050,
          width: '96%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: 24
        }}
      >
        {/* HEADER */}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 22
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
              Quản lý khóa học và gói môi giới
            </h2>

            <p style={{
              color: '#64748b',
              fontSize: '0.85rem',
              margin: '6px 0 0'
            }}>
              Quản lý nội dung, học viên và doanh thu của bạn.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <X size={23} />
          </button>
        </div>

        {/* TAB */}

        <div style={{
          display: 'flex',
          gap: 10,
          borderBottom: '1px solid #e2e8f0',
          marginBottom: 20,
          paddingBottom: 12
        }}>
          <button
            onClick={() => {
              setActiveTab('courses');
              setEditing(null);
              setErrorMsg('');
            }}
            style={{
              padding: '10px 18px',
              borderRadius: 7,
              border: 'none',
              background: activeTab === 'courses' ? '#7e22ce' : '#f1f5f9',
              color: activeTab === 'courses' ? '#fff' : '#334155',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            <BookOpen size={16} style={{
              verticalAlign: 'middle',
              marginRight: 6
            }} />
            Khóa học ({courses.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('packages');
              setEditing(null);
              setErrorMsg('');
            }}
            style={{
              padding: '10px 18px',
              borderRadius: 7,
              border: 'none',
              background: activeTab === 'packages' ? '#7e22ce' : '#f1f5f9',
              color: activeTab === 'packages' ? '#fff' : '#334155',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            <Package size={16} style={{
              verticalAlign: 'middle',
              marginRight: 6
            }} />
            Gói môi giới ({packages.length})
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            style={{
              marginLeft: 'auto',
              border: '1px solid #ddd',
              background: '#fff',
              borderRadius: 7,
              padding: '8px 12px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* ALERTS */}

        {errorMsg && (
          <div style={{
            padding: 12,
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: 7,
            marginBottom: 14
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: 12,
            background: '#dcfce7',
            color: '#166534',
            borderRadius: 7,
            marginBottom: 14
          }}>
            <CheckCircle2
              size={16}
              style={{ verticalAlign: 'middle', marginRight: 6 }}
            />
            {successMsg}
          </div>
        )}

        {/* EDIT FORM */}

        {editing && (
          <form
            onSubmit={handleSaveEdit}
            style={{
              padding: 20,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              marginBottom: 22
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              {editing.type === 'course'
                ? 'Sửa thông tin khóa học'
                : 'Sửa thông tin gói môi giới'}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14
            }}>
              <label>
                <span>
                  {editing.type === 'course'
                    ? 'Tiêu đề khóa học'
                    : 'Tên gói môi giới'}
                </span>

                <input
                  required
                  value={
                    editing.type === 'course'
                      ? form.title
                      : form.name
                  }
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    [editing.type === 'course' ? 'title' : 'name']:
                      e.target.value
                  }))}
                  style={inputStyle}
                />
              </label>

              <label>
                <span>Giá (VNĐ)</span>

                <input
                  type="number"
                  min="0"
                  required
                  value={form.price}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    price: e.target.value
                  }))}
                  style={inputStyle}
                />
              </label>

              {editing.type === 'package' && (
                <label>
                  <span>Phí nền tảng (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={form.platformFeePercent}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      platformFeePercent: e.target.value
                    }))}
                    style={inputStyle}
                  />
                </label>
              )}
            </div>

            {editing.type === 'course' && (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                marginTop: 16
              }}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    active: e.target.checked
                  }))}
                />
                Cho phép học viên đăng ký khóa học
              </label>
            )}

            <p style={{
              fontSize: '0.8rem',
              color: '#64748b',
              marginTop: 12
            }}>
              Khi sửa khóa học, hãy nhập đúng mức phí nền tảng đang áp dụng.
              Backend hiện không trả trường này trong CourseResponse.
            </p>

            <div style={{
              display: 'flex',
              gap: 10,
              marginTop: 16
            }}>
              <button
                type="submit"
                disabled={saving}
                style={primaryButton}
              >
                {saving
                  ? <Loader2 size={16} />
                  : <Save size={16} />}
                Lưu thay đổi
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                style={secondaryButton}
              >
                <XCircle size={16} />
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* LOADING */}

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: 45,
            color: '#64748b'
          }}>
            <Loader2
              size={32}
              className="animate-spin"
              style={{ margin: '0 auto 10px' }}
            />
            Đang tải dữ liệu...
          </div>
        ) : (
          <>
            {/* COURSE TAB */}

            {activeTab === 'courses' && (
              <div>
                {courses.length === 0 ? (
                  <EmptyMessage text="Bạn chưa có khóa học nào." />
                ) : (
                  courses.map((course) => {
                    const courseEnrollments =
                      enrollments[course.id] || [];

                    return (
                      <div
                        key={course.id}
                        style={cardStyle}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 12
                        }}>
                          <div>
                            <h3 style={{ margin: '0 0 8px' }}>
                              {course.title}
                            </h3>

                            <div style={{
                              color: '#64748b',
                              fontSize: '0.85rem'
                            }}>
                              Giá: {formatVND(course.price)}
                            </div>

                            <div style={{
                              marginTop: 7,
                              fontSize: '0.8rem',
                              color: course.active ? '#15803d' : '#dc2626'
                            }}>
                              {course.active
                                ? 'Đang hoạt động'
                                : 'Đã ngừng hoạt động'}
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'center'
                          }}>
                            <button
                              onClick={() => handleEditCourse(course)}
                              style={editButton}
                            >
                              <Pencil size={15} />
                              Sửa
                            </button>

                            <button
                              disabled={processingId === course.id}
                              onClick={() => handleDeleteCourse(course)}
                              style={deleteButton}
                            >
                              <Trash2 size={15} />
                              Xóa
                            </button>
                          </div>
                        </div>

                        {/* ENROLLMENTS */}

                        <div style={{
                          marginTop: 18,
                          borderTop: '1px solid #e2e8f0',
                          paddingTop: 14
                        }}>
                          <h4 style={{
                            margin: '0 0 12px',
                            fontSize: '0.95rem'
                          }}>
                            <Users size={16} style={{
                              verticalAlign: 'middle',
                              marginRight: 6
                            }} />
                            Học viên ghi danh ({courseEnrollments.length})
                          </h4>

                          {courseEnrollments.length === 0 ? (
                            <div style={{
                              fontSize: '0.84rem',
                              color: '#94a3b8'
                            }}>
                              Chưa có học viên.
                            </div>
                          ) : (
                            courseEnrollments.map((enrollment) => (
                              <div
                                key={enrollment.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                  gap: 12,
                                  background: '#f8fafc',
                                  borderRadius: 7,
                                  padding: 12,
                                  marginBottom: 8
                                }}
                              >
                                <div>
                                  <div style={{
                                    fontSize: '0.86rem',
                                    fontWeight: 600
                                  }}>
                                    Học viên: {enrollment.studentId}
                                  </div>

                                  <div style={{
                                    fontSize: '0.82rem',
                                    color: '#64748b',
                                    marginTop: 5
                                  }}>
                                    {formatVND(enrollment.pricePaid)}
                                    {' • '}
                                    Trạng thái: {enrollment.status}
                                  </div>
                                </div>

                                {enrollment.status === 'ACTIVE' &&
                                  Number(enrollment.pricePaid) > 0 && (
                                  <button
                                    disabled={processingId === enrollment.id}
                                    onClick={() =>
                                      handleCompleteEnrollment(enrollment)
                                    }
                                    style={primaryButton}
                                  >
                                    {processingId === enrollment.id
                                      ? <Loader2 size={15} />
                                      : <CheckCircle2 size={15} />}
                                    Xác nhận hoàn thành
                                  </button>
                                )}

                                {enrollment.status === 'PENDING' && (
                                  <span style={{
                                    color: '#b45309',
                                    fontSize: '0.8rem'
                                  }}>
                                    <Clock size={14} style={{
                                      verticalAlign: 'middle',
                                      marginRight: 5
                                    }} />
                                    Chưa thanh toán
                                  </span>
                                )}

                                {enrollment.status === 'ACTIVE' &&
                                  Number(enrollment.pricePaid) === 0 && (
                                  <span style={{
                                    color: '#15803d',
                                    fontSize: '0.8rem'
                                  }}>
                                    Khóa học miễn phí
                                  </span>
                                )}

                                {enrollment.status === 'COMPLETED' && (
                                  <span style={{
                                    color: '#15803d',
                                    fontSize: '0.8rem',
                                    fontWeight: 700
                                  }}>
                                    <CheckCircle2 size={15} style={{
                                      verticalAlign: 'middle',
                                      marginRight: 5
                                    }} />
                                    Đã hoàn thành và giải ngân
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* PACKAGE TAB */}

            {activeTab === 'packages' && (
              <div>
                {packages.length === 0 ? (
                  <EmptyMessage text="Bạn chưa có gói môi giới đang hoạt động." />
                ) : (
                  packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      style={cardStyle}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 12
                      }}>
                        <div>
                          <h3 style={{ margin: '0 0 8px' }}>
                            {pkg.name}
                          </h3>

                          <div style={{
                            color: '#64748b',
                            fontSize: '0.85rem'
                          }}>
                            Giá: {formatVND(pkg.price)}
                          </div>

                          <div style={{
                            color: '#64748b',
                            fontSize: '0.85rem',
                            marginTop: 5
                          }}>
                            Phí nền tảng: {pkg.platformFeePercent}%
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center'
                        }}>
                          <button
                            onClick={() => handleEditPackage(pkg)}
                            style={editButton}
                          >
                            <Pencil size={15} />
                            Sửa
                          </button>

                          <button
                            disabled={processingId === pkg.id}
                            onClick={() => handleDeletePackage(pkg)}
                            style={deleteButton}
                          >
                            <Trash2 size={15} />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 20
        }}>
          <button
            onClick={onClose}
            style={secondaryButton}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== STYLES ====================

const inputStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: 7,
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  fontSize: '0.9rem'
};

const cardStyle = {
  padding: 18,
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  marginBottom: 14,
  background: '#fff'
};

const primaryButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  padding: '9px 14px',
  border: 'none',
  borderRadius: 6,
  background: '#7e22ce',
  color: '#fff',
  fontWeight: 600,
  cursor: 'pointer'
};

const secondaryButton = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  padding: '9px 14px',
  border: '1px solid #cbd5e1',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer'
};

const editButton = {
  ...secondaryButton,
  color: '#2563eb',
  borderColor: '#bfdbfe'
};

const deleteButton = {
  ...secondaryButton,
  color: '#dc2626',
  borderColor: '#fecaca'
};

function EmptyMessage({ text }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: 40,
      color: '#64748b',
      background: '#f8fafc',
      borderRadius: 8
    }}>
      {text}
    </div>
  );
}
