import { Component } from 'react';
import { RotateCcw } from 'lucide-react';

// If a practice app ever breaks, only the phone screen shows a calm
// "start again" message; the task panel and the rest of the page keep working.
export default class SimBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[Guidia] practice app error', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const { t, onRestart } = this.props;
    return (
      <div className="sim-success" role="alert">
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{t('This practice app needs a fresh start', 'অনুশীলনের অ্যাপটা নতুন করে শুরু করতে হবে', 'अभ्यास ऐप को फिर से शुरू करना होगा', 'Ứng dụng luyện tập cần mở lại')}</p>
        <p style={{ margin: 0, color: '#555' }}>{t('Nothing you did caused this. Your progress is saved.', 'এটা আপনার কোনো ভুলে হয়নি। আপনার অগ্রগতি রাখা আছে।', 'यह आपकी गलती से नहीं हुआ। आपकी प्रगति सुरक्षित है।', 'Đây không phải lỗi của bạn. Tiến độ đã được lưu.')}</p>
        <button type="button" className="btn btn-primary" onClick={() => { this.setState({ error: null }); onRestart(); }}>
          <RotateCcw size={18} aria-hidden="true" /> {t('Start the app again', 'অ্যাপটি আবার শুরু করুন', 'ऐप फिर से शुरू करें', 'Mở lại ứng dụng')}
        </button>
      </div>
    );
  }
}
