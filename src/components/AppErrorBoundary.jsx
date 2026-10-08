import { Component } from 'react';
import { Home, RefreshCw } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';
import { Button, EmptyState } from './ui';

function Fallback({ onRetry, homeTo }) {
  const { t } = usePreferences();
  return (
    <div className="page page-narrow">
      <EmptyState
        card tone="warn" icon={RefreshCw}
        title={t('Something on this page stopped working', 'এই পেজের কিছু একটা কাজ করা বন্ধ করেছে', 'इस पेज का कुछ हिस्सा काम करना बंद कर गया', 'Một phần của trang này đã ngừng hoạt động')}
        action={(
          <>
            <Button icon={RefreshCw} onClick={onRetry}>{t('Try again', 'আবার চেষ্টা করুন', 'फिर कोशिश करें', 'Thử lại')}</Button>
            <Button variant="secondary" icon={Home} href={homeTo}>{t('Go home', 'হোমে যান', 'होम पर जाएं', 'Về trang chủ')}</Button>
          </>
        )}
      >
        {t('Nothing you did caused this, and nothing was lost. Try again, or go back to the home page.', 'আপনার কোনো ভুলে এটা হয়নি, কিছু হারায়নি। আবার চেষ্টা করুন বা হোম পেজে ফিরে যান।', 'यह आपकी किसी गलती से नहीं हुआ, कुछ खोया नहीं। फिर कोशिश करें या होम पेज पर लौटें।', 'Đây không phải lỗi của bạn và không có gì bị mất. Hãy thử lại hoặc quay về trang chủ.')}
      </EmptyState>
    </div>
  );
}

// Catches rendering errors so one broken widget never blanks the whole
// app. Keyed by route in the shell, so navigating away resets it.
export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Technical detail stays in the console for developers, never on screen.
    console.error('[Guidia] UI error', error, info?.componentStack);
  }

  render() {
    if (this.state.error) return <Fallback onRetry={() => this.setState({ error: null })} homeTo={this.props.homeTo || '/'} />;
    return this.props.children;
  }
}
