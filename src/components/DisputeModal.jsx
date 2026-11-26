import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ClipboardList, ExternalLink, Link2, Loader2, MessageSquareWarning, Send, X } from 'lucide-react';
import { courseApi, disputeApi } from '../services/api';
import './DisputeModal.css';

const statusLabels = {
  UNDER_REVIEW: 'Đang xem xét',
  REFUND_PENDING: 'Chờ hoàn tiền',
  APPROVED: 'Đã hoàn tiền',
  REJECTED: 'Đã bác bỏ',
  CANCELLED: 'Đã rút khiếu nại',
};

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const dateFormat = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' });
const isEvidenceLink = (url) => /^https?:\/\//i.test(url || '');

export default function DisputeModal({ bookingId, courseId, targetLabel, onClose }) {
  const dialogRef = useRef(null);
  const [disputes, setDisputes] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [reason, setReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

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
  const canSubmit = (bookingId || (enrollment?.status === 'ACTIVE' && enrollment.pricePaid > 0))
    && !visibleDisputes.some(({ status }) => ['UNDER_REVIEW', 'REFUND_PENDING'].includes(status));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || saving || !reason.trim()) return;
    const evidence = evidenceUrl.trim();
    if (evidence && !isEvidenceLink(evidence)) {
      setError('Đường dẫn bằng chứng phải bắt đầu bằng https:// hoặc http://.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const dispute = await disputeApi.createDispute({
        ...(bookingId ? { bookingId } : { enrollmentId: enrollment.id }),
        reason: reason.trim(),
        ...(evidence && { evidenceUrl: evidence }),
      });
      setDisputes((items) => [dispute, ...items]);
      setReason('');
      setEvidenceUrl('');
      setNotice('Đã gửi khiếu nại để quản trị viên xem xét.');
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
    setNotice('');
    try {
      await disputeApi.cancelDispute(id);
      setDisputes((items) => items.map((item) =>
        item.id === id ? { ...item, status: 'CANCELLED' } : item));
      setNotice('Đã rút khiếu nại.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const close = () => { if (!saving) onClose(); };
  const isTargeted = Boolean(bookingId || courseId);
  const targetId = bookingId || enrollment?.id;

  return (
    <dialog
      ref={dialogRef}
      className="dispute-dialog"
      aria-labelledby="dispute-title"
      onCancel={(event) => { event.preventDefault(); close(); }}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
    >
      <header className="dispute-header">
        <span className="dispute-header-icon" aria-hidden="true">
          {isTargeted ? <MessageSquareWarning size={23} /> : <ClipboardList size={23} />}
        </span>
        <div>
          <h2 id="dispute-title">{isTargeted ? 'Khiếu nại giao dịch' : 'Khiếu nại của tôi'}</h2>
          {isTargeted && <p>{bookingId ? 'Đơn kết nối gia sư' : 'Học phí khóa học'}</p>}
        </div>
        <button type="button" className="dispute-close" aria-label="Đóng khiếu nại" disabled={saving} onClick={close}>
          <X size={20} />
        </button>
      </header>
      <div className="dispute-body">
        {isTargeted && (targetLabel || targetId) && (
          <div className="dispute-target">
            <strong>{targetLabel || (bookingId ? 'Đơn kết nối gia sư' : 'Ghi danh khóa học')}</strong>
            {targetId && <code>#{targetId.slice(0, 8)}</code>}
          </div>
        )}
        {error && <p className="auth-alert error" role="alert">{error}</p>}
        {notice && <p className="auth-alert success" role="status"><CheckCircle2 size={16} /> {notice}</p>}
        {loading ? (
          <p className="dispute-empty" role="status"><Loader2 size={18} className="animate-spin" /> Đang tải khiếu nại…</p>
        ) : !loadFailed && (
          <div className="dispute-content">
            {canSubmit && (
              <form onSubmit={handleSubmit} className="dispute-form">
                <label htmlFor="dispute-reason">Lý do khiếu nại <span aria-hidden="true">*</span></label>
                <textarea id="dispute-reason" rows={5} required disabled={saving} placeholder="Mô tả sự việc và cách bạn muốn xử lý giao dịch…" value={reason} onChange={(event) => setReason(event.target.value)} />
                <label htmlFor="dispute-evidence">Đường dẫn bằng chứng <small>Không bắt buộc</small></label>
                <div className="dispute-evidence">
                  <Link2 size={17} aria-hidden="true" />
                  <input id="dispute-evidence" type="url" disabled={saving} placeholder="https://…" aria-describedby="dispute-evidence-help" value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} />
                </div>
                <p id="dispute-evidence-help">Nếu gửi ảnh chụp hoặc tài liệu, hãy dùng liên kết mà quản trị viên có thể mở.</p>
                <div className="dispute-actions">
                  <button type="button" className="btn btn-outline" disabled={saving} onClick={close}>Đóng</button>
                  <button type="submit" className="btn btn-primary" disabled={saving || !reason.trim()}>
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {saving ? 'Đang gửi…' : 'Gửi khiếu nại'}
                  </button>
                </div>
              </form>
            )}
            {!canSubmit && !visibleDisputes.length && (
              <p className="dispute-empty">{courseId ? 'Ghi danh hiện tại chưa đủ điều kiện gửi khiếu nại.' : 'Bạn chưa có khiếu nại nào.'}</p>
            )}
            {visibleDisputes.length > 0 && (
              <div className="dispute-history">
                {isTargeted && <h3>Lịch sử khiếu nại</h3>}
                {visibleDisputes.map((item) => (
                  <article key={item.id} className="dispute-record">
                    <div className="dispute-record-heading">
                      <strong>{item.bookingId ? 'Đơn kết nối' : 'Ghi danh khóa học'} #{(item.bookingId || item.enrollmentId)?.slice(0, 8)}</strong>
                      <span className="dispute-status" data-status={item.status}>{statusLabels[item.status] ?? item.status}</span>
                    </div>
                    {item.createdAt && <time dateTime={item.createdAt}>{dateFormat.format(new Date(item.createdAt))}</time>}
                    <p className="dispute-reason">{item.reason}</p>
                    {item.status === 'APPROVED' && item.refundAmount > 0 && (
                      <p className="dispute-refund">Đã hoàn {currency.format(item.refundAmount)}</p>
                    )}
                    <div className="dispute-record-actions">
                      {isEvidenceLink(item.evidenceUrl) && (
                        <a href={item.evidenceUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Xem bằng chứng</a>
                      )}
                      {item.status === 'UNDER_REVIEW' && (
                        <button type="button" className="btn btn-outline" disabled={saving} onClick={() => handleCancel(item.id)}>
                          Rút khiếu nại
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}
