import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          padding: '24px',
          margin: '20px auto',
          maxWidth: '600px',
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#9f1239'
        }}>
          <AlertTriangle size={36} color="#e11d48" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700 }}>
            Đã có lỗi nhỏ xảy ra khi hiển thị thành phần này
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#be123c' }}>
            {this.state.error?.message || 'Vui lòng thử tải lại trang hoặc liên hệ quản trị viên.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (this.props.onReset) this.props.onReset();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: '#e11d48',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} /> Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

