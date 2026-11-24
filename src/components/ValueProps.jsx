import React from 'react';
import { Video, ShieldCheck, Clock, MessageSquareQuote } from 'lucide-react';

export default function ValueProps() {
  const props = [
    {
      icon: Video,
      title: 'Video Bài Giảng & Gia Sư 1-1',
      desc: 'Học qua video bài giảng chất lượng cao kết hợp kết nối gia sư kèm riêng uy tín.'
    },
    {
      icon: ShieldCheck,
      title: 'Trạng Thái Xác Minh Hồ Sơ',
      desc: 'Trạng thái xác minh được hiển thị theo thông tin hiện có trên hệ thống.'
    },
    {
      icon: Clock,
      title: 'Lịch Học Tự Chủ Linh Hoạt',
      desc: 'Dễ dàng sắp xếp lịch học phù hợp với thời gian biểu cá nhân của bạn.'
    },
    {
      icon: MessageSquareQuote,
      title: 'Theo Dõi Thanh Toán',
      desc: 'Xem trạng thái giao dịch và các khoản thanh toán trong tài khoản của bạn.'
    }
  ];

  return (
    <section className="ud-value-props-section">
      <div className="container">
        <div className="ud-value-props-grid">
          {props.map((p, idx) => {
            const IconComponent = p.icon;
            return (
              <div key={idx} className="ud-prop-card">
                <div className="ud-prop-icon-wrapper">
                  <IconComponent size={24} />
                </div>
                <div className="ud-prop-text">
                  <h4 className="ud-prop-title">{p.title}</h4>
                  <p className="ud-prop-desc">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
