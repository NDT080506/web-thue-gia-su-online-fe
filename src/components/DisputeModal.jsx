import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { courseApi, disputeApi } from '../services/api';

const statusLabels = {
  UNDER_REVIEW: 'Đang xem xét',
  REFUND_PENDING: 'Chờ hoàn tiền',
  APPROVED: 'Đã hoàn tiền',
  REJECTED: 'Đã bác bỏ',
  CANCELLED: 'Đã rút khiếu nại',
};

export default function DisputeModal({ bookingId, courseId, onClose }) {
  const [disputes, setDisputes] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [reason, setReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    Promise.all([
      disputeApi.getMyDisputes(),
      courseId ? courseApi.getMyEnrollmentByCourse(courseId) : null,
    ]).then(([items, currentEnrollment]) => {
      if (ignore) return;
      setDisputes(items);
      setEnrollment(currentEnrollment);
    }).catch((err) => {
      if (ignore) return;
      setLoadFailed(true);
      setError(err.message);
    }).finally(() => {
      if (!ignore) setLoading(false);
    });
    return () => { ignore = true; };
  }, [courseId]);

  const visibleDisputes = disputes.filter((item) => {
    if (bookingId) return item.bookingId === bookingId;
    if (courseId) return enrollment && item.enrollmentId === enrollment.id;
    return true;
  });
  const canSubmit = (bookingId || enrollment?.status === 'ACTIVE')
    && !visibleDisputes.some(({ status }) => ['UNDER_REVIEW', 'REFUND_PENDING'].includes(status));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || saving || !reason.trim()) return;
    const evidence = evidenceUrl.trim();
    if (evidence && !/^https?:\/\//i.test(evidence)) {
      setError('Đường dẫn bằng chứng phải bắt đầu bằng https:// hoặc http://.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const dispute = await disputeApi.createDispute({
        ...(bookingId ? { bookingId } : { enrollmentId: enrollment.id }),
        reason: reason.trim(),
        ...(evidence && { evidenceUrl: evidence }),
      });
      setDisputes((items) => [dispute, ...items]);
      setReason('');
      setEvidenceUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (saving || !window.confirm('Bạn có muốn rút khiếu nại này?')) return;
    setSaving(true);
    setError('');
    try {
      await disputeApi.cancelDispute(id);
      setDisputes((items) => items.map((item) =>
        item.id === id ? { ...item, status: 'CANCELLED' } : item));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const close = () => { if (!saving) onClose(); };

  return (
    <div className="ud-modal-backdrop" onClick={close} style={{ zIndex: 1260 }}>
      <div
        className="ud-detail-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dispute-title"
        style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="ud-modal-close" aria-label="Đóng" disabled={saving} onClick={close}>
          <X size={20} />
        </button>
        <h2 id="dispute-title">{bookingId || courseId ? 'Khiếu nại giao dịch' : 'Khiếu nại của tôi'}</h2>
        {error && <p className="auth-alert error" role="alert">{error}</p>}
        {loading && <p role="status">Đang tải khiếu nại…</p>}
        {!loading && !loadFailed && (
          <>
            {canSubmit && (
              <form onSubmit={handleSubmit} className="auth-form">
                <label htmlFor="dispute-reason">Lý do khiếu nại</label>
                <textarea id="dispute-reason" rows={4} required value={reason} onChange={(event) => setReason(event.target.value)} />
                <label htmlFor="dispute-evidence">Đường dẫn bằng chứng (nếu có)</label>
                <input id="dispute-evidence" type="url" value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} />
                <button type="submit" className="btn btn-primary" disabled={saving || !reason.trim()}>
                  Gửi khiếu nại
                </button>
              </form>
            )}
            {!canSubmit && !visibleDisputes.length && (
              <p>{courseId ? 'Ghi danh hiện tại chưa đủ điều kiện gửi khiếu nại.' : 'Bạn chưa có khiếu nại nào.'}</p>
            )}
            {visibleDisputes.map((item) => (
              <article key={item.id} style={{ borderTop: '1px solid #e2e8f0', paddingBlock: 12 }}>
                <strong>{statusLabels[item.status] ?? item.status}</strong>
                <p>{item.bookingId ? 'Đơn kết nối' : 'Ghi danh khóa học'} #{(item.bookingId || item.enrollmentId)?.slice(0, 8)}</p>
                <p style={{ overflowWrap: 'anywhere' }}>{item.reason}</p>
                {item.status === 'APPROVED' && item.refundAmount > 0 && (
                  <p>Đã hoàn {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.refundAmount)}</p>
                )}
                {item.status === 'UNDER_REVIEW' && (
                  <button type="button" className="btn btn-outline" disabled={saving} onClick={() => handleCancel(item.id)}>
                    Rút khiếu nại
                  </button>
                )}
              </article>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
