import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Camera, Clock, ImagePlus, ImageUp, Lock, Maximize, MessageCircle, MessageSquareText, Minus, Pause, Play,
  Plus, RotateCcw, ScanSearch, Send, ShieldCheck, Square, Trash2, Volume2, X,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useVoice } from '../../context/VoiceContext';
import { useCapabilities } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import { api, del, post, upload } from '../../services/apiClient';
import { useResource } from '../../hooks/useResource';
import { announce } from '../../utils/announce';
import { useVoiceState } from '../../components/voice/voiceState';
import { Alert, Button, ConfirmDialog, ErrorState, IconButton, PageHeader, RiskBadge, Skeleton, riskMeta } from '../../components/ui';

const TYPE_TONE = { danger: 'danger', warn: 'warn', action: 'brand', input: 'info', navigation: 'brand', info: 'info' };
const MAX_BYTES = 8 * 1024 * 1024;

function formatBytes(n) {
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

function PrivacyNote({ t }) {
  return (
    <div className="privacy-note">
      <Lock aria-hidden="true" />
      <div className="stack" style={{ '--gap': '4px' }}>
        <p className="text-strong">{t('Your privacy', 'আপনার গোপনীয়তা', 'आपकी निजता', 'Quyền riêng tư của bạn')}</p>
        <ul className="privacy-list">
          <li>{t('The picture is kept for 30 minutes only, then deleted automatically.', 'ছবিটি মাত্র ৩০ মিনিট রাখা হয়, তারপর নিজে থেকেই মুছে যায়।', 'तस्वीर सिर्फ़ 30 मिनट रखी जाती है, फिर अपने आप हट जाती है।', 'Ảnh chỉ được giữ 30 phút, sau đó tự động bị xóa.')}</li>
          <li>{t('Hide passwords, PINs and card numbers before you share.', 'শেয়ার করার আগে পাসওয়ার্ড, পিন ও কার্ড নম্বর লুকিয়ে নিন।', 'साझा करने से पहले पासवर्ड, पिन और कार्ड नंबर छिपा लें।', 'Hãy che mật khẩu, mã PIN và số thẻ trước khi chia sẻ.')}</li>
          <li>{t('You can delete it yourself at any time.', 'আপনি যেকোনো সময় নিজেই মুছে দিতে পারেন।', 'आप कभी भी इसे खुद हटा सकते हैं।', 'Bạn có thể tự xóa bất cứ lúc nào.')}</li>
        </ul>
      </div>
    </div>
  );
}

export function ScreenUploadPage() {
  const { t, language, mode } = usePreferences();
  const caps = useCapabilities();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => {
    if (!busy) return undefined;
    const id = setInterval(() => setPhase((p) => Math.min(p + 1, 2)), 2600);
    return () => clearInterval(id);
  }, [busy]);

  const choose = (f) => {
    if (!f) return;
    setError('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type)) { setError(t('Please choose a PNG, JPEG or WEBP picture.', 'PNG, JPEG বা WEBP ছবি বেছে নিন।', 'PNG, JPEG या WEBP तस्वीर चुनें।', 'Vui lòng chọn ảnh PNG, JPEG hoặc WEBP.')); return; }
    if (f.size > MAX_BYTES) { setError(t('That picture is too large (max 8 MB).', 'ছবিটি খুব বড় (সর্বোচ্চ ৮ MB)।', 'तस्वीर बहुत बड़ी है (अधिकतम 8 MB)।', 'Ảnh quá lớn (tối đa 8 MB).')); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    announce(t('Picture selected.', 'ছবি বেছে নেওয়া হয়েছে।', 'तस्वीर चुनी गई।', 'Đã chọn ảnh.'));
  };

  const clear = () => { setFile(null); setPreview(''); if (fileRef.current) fileRef.current.value = ''; };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setPhase(0);
    setError('');
    const form = new FormData();
    form.append('screenshot', file);
    form.append('language', language);
    form.append('cognitiveState', mode.toUpperCase());
    if (question.trim()) form.append('question', question.trim());
    try {
      const data = await upload('/vision/analyze', form);
      announce(t('Your explanation is ready.', 'আপনার ব্যাখ্যা প্রস্তুত।', 'आपकी व्याख्या तैयार है।', 'Phần giải thích đã sẵn sàng.'));
      navigate(`/app/screen/${data.analysis.id}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const quick = [
    t('What should I press next?', 'এরপর কোথায় চাপব?', 'आगे क्या दबाऊं?', 'Tiếp theo tôi nên bấm gì?'),
    t('Is this safe?', 'এটা কি নিরাপদ?', 'क्या यह सुरक्षित है?', 'Cái này có an toàn không?'),
    t('What is this screen?', 'এটা কোন স্ক্রিন?', 'यह कौन सी स्क्रीन है?', 'Đây là màn hình gì?'),
    t('What should I check first?', 'আগে কী দেখব?', 'पहले क्या जांचूं?', 'Tôi nên kiểm tra gì trước?'),
  ];
  const phases = [
    t('Reading your screen…', 'আপনার স্ক্রিন পড়ছি…', 'आपकी स्क्रीन पढ़ रहा हूँ…', 'Đang đọc màn hình…'),
    t('Finding the buttons that matter…', 'জরুরি বোতামগুলো খুঁজছি…', 'ज़रूरी बटन ढूंढ रहा हूँ…', 'Đang tìm các nút quan trọng…'),
    t('Checking carefully for anything risky…', 'ঝুঁকির কিছু আছে কি না দেখছি…', 'कुछ खतरनाक तो नहीं, जांच रहा हूँ…', 'Đang kiểm tra kỹ xem có gì rủi ro…'),
  ];

  return (
    <div className="page screen-upload-page">
      <PageHeader
        eyebrow={t('Understand my screen', 'আমার স্ক্রিন বুঝুন', 'मेरी स्क्रीन समझें', 'Hiểu màn hình của tôi')}
        title={t('Show Guidia what you see', 'আপনি যা দেখছেন Guidia-কে দেখান', 'जो दिख रहा है वह Guidia को दिखाएं', 'Cho Guidia xem điều bạn thấy')}
        description={t('Share a screenshot. Guidia explains what it is, points to the right button and warns you about anything risky.', 'একটি স্ক্রিনশট দিন। Guidia বুঝিয়ে দেবে এটা কী, সঠিক বোতাম দেখাবে এবং ঝুঁকি থাকলে সতর্ক করবে।', 'स्क्रीनशॉट दें। Guidia बताएगा यह क्या है, सही बटन दिखाएगा और खतरे पर चेतावनी देगा।', 'Gửi ảnh màn hình. Guidia giải thích đó là gì, chỉ nút cần bấm và cảnh báo nếu có rủi ro.')}
      />

      {!caps.vision && (
        <Alert tone="info" title={t('Screen explanations are not available right now', 'স্ক্রিন বোঝানো এখন চালু নেই', 'स्क्रीन समझाना अभी उपलब्ध नहीं है', 'Hiện chưa thể giải thích màn hình')}
          actions={<><Button size="sm" variant="secondary" icon={MessageCircle} to="/app/ask">{t('Describe it to Guidia', 'Guidia-কে লিখে বলুন', 'Guidia को लिखकर बताएं', 'Mô tả cho Guidia')}</Button><Button size="sm" variant="ghost" icon={ShieldCheck} to="/app/safety">{t('Check a message', 'মেসেজ যাচাই', 'संदेश जांचें', 'Kiểm tra tin nhắn')}</Button></>}>
          {t('You can still describe what you see in words, or paste a message into the safety checker.', 'আপনি যা দেখছেন তা লিখে বলতে পারেন, বা নিরাপত্তা যাচাইয়ে মেসেজ পেস্ট করতে পারেন।', 'आप जो देख रहे हैं वह लिखकर बता सकते हैं, या सुरक्षा जांच में संदेश डाल सकते हैं।', 'Bạn vẫn có thể mô tả bằng lời, hoặc dán tin nhắn vào công cụ kiểm tra an toàn.')}
        </Alert>
      )}

      <form className="screen-workspace" onSubmit={submit}>
        <div className="card card-pad-lg stack screen-upload-card" style={{ '--gap': 'var(--s-5)' }}>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" id="screen-file" onChange={(e) => choose(e.target.files?.[0])} tabIndex={-1} aria-label={t('Choose a picture', 'ছবি বেছে নিন', 'तस्वीर चुनें', 'Chọn ảnh')} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => choose(e.target.files?.[0])} tabIndex={-1} aria-label={t('Take a photo', 'ছবি তুলুন', 'फोटो लें', 'Chụp ảnh')} />

          {busy ? (
            <div className="screen-analyzing" role="status" aria-live="polite">
              <div className="scan-frame">
                {preview && <img src={preview} alt="" />}
                <span className="scan-line" aria-hidden="true" />
              </div>
              <div className="stack" style={{ '--gap': 'var(--s-2)' }}>
                {phases.map((p, i) => (
                  <p key={p} className="scan-phase" data-state={i < phase ? 'done' : i === phase ? 'current' : 'todo'}>
                    <span className="scan-dot" aria-hidden="true" />{p}
                  </p>
                ))}
              </div>
            </div>
          ) : preview ? (
            <div className="screen-preview fade">
              <img src={preview} alt={t('Your screenshot', 'আপনার স্ক্রিনশট', 'आपका स्क्रीनशॉट', 'Ảnh chụp màn hình của bạn')} />
              <div className="screen-file-row">
                <ImagePlus aria-hidden="true" />
                <span className="stack grow" style={{ '--gap': 0 }}>
                  <span className="text-strong truncate">{file.name}</span>
                  <span className="text-subtle">{formatBytes(file.size)}</span>
                </span>
                <Button variant="quiet" size="sm" onClick={() => fileRef.current?.click()}>{t('Change', 'বদলান', 'बदलें', 'Đổi ảnh')}</Button>
                <IconButton icon={X} size="sm" label={t('Remove picture', 'ছবি সরান', 'तस्वीर हटाएं', 'Bỏ ảnh')} onClick={clear} />
              </div>
            </div>
          ) : (
            <div
              className="dropzone" data-dragging={dragging}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files?.[0]); }}
            >
              <span className="dropzone-icon" aria-hidden="true"><ImageUp /></span>
              <p className="h-section">{t('Drop a screenshot here', 'এখানে একটি স্ক্রিনশট রাখুন', 'स्क्रीनशॉट यहाँ छोड़ें', 'Thả ảnh chụp màn hình vào đây')}</p>
              <p className="text-muted">{t('PNG, JPEG or WEBP · up to 8 MB', 'PNG, JPEG বা WEBP · সর্বোচ্চ ৮ MB', 'PNG, JPEG या WEBP · अधिकतम 8 MB', 'PNG, JPEG hoặc WEBP · tối đa 8 MB')}</p>
              <div className="btn-group" style={{ justifyContent: 'center' }}>
                <Button icon={ImagePlus} onClick={() => fileRef.current?.click()}>{t('Choose a picture', 'ছবি বেছে নিন', 'तस्वीर चुनें', 'Chọn ảnh')}</Button>
                <Button variant="secondary" icon={Camera} onClick={() => cameraRef.current?.click()} className="show-md">{t('Take a photo', 'ছবি তুলুন', 'फोटो लें', 'Chụp ảnh')}</Button>
              </div>
            </div>
          )}

          {!busy && (
            <div className="field">
              <label className="label" htmlFor="screen-q">{t('Your question', 'আপনার প্রশ্ন', 'आपका सवाल', 'Câu hỏi của bạn')} <span className="label-optional">· {t('optional', 'ঐচ্ছিক', 'वैकल्पिक', 'không bắt buộc')}</span></label>
              <div className="row" style={{ '--gap': 'var(--s-2)' }}>
                {quick.map((q) => <button key={q} type="button" className="chip" aria-pressed={question === q} onClick={() => setQuestion((cur) => (cur === q ? '' : q))}>{q}</button>)}
              </div>
              <input id="screen-q" className="input" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={500} placeholder={t('Or type your own question', 'অথবা নিজের প্রশ্ন লিখুন', 'या अपना सवाल लिखें', 'Hoặc gõ câu hỏi của bạn')} />
            </div>
          )}

          {error && <Alert tone="warn">{error}</Alert>}

          <Button type="submit" size="lg" block icon={ScanSearch} disabled={!file || !caps.vision} state={busy ? 'loading' : 'idle'} loadingLabel={t('Looking carefully…', 'মন দিয়ে দেখছি…', 'ध्यान से देख रहा हूँ…', 'Đang xem kỹ…')}>
            {t('Explain my screen', 'আমার স্ক্রিন বুঝিয়ে দিন', 'मेरी स्क्रीन समझाएं', 'Giải thích màn hình')}
          </Button>
        </div>

        <aside className="stack screen-aside" style={{ '--gap': 'var(--s-4)' }}>
          <div className="card"><PrivacyNote t={t} /></div>
          <div className="card stack" style={{ '--gap': 'var(--s-3)' }}>
            <p className="h-card">{t('How to take a screenshot', 'কীভাবে স্ক্রিনশট নেবেন', 'स्क्रीनशॉट कैसे लें', 'Cách chụp màn hình')}</p>
            <ul className="how-list">
              <li><span className="badge">Android</span>{t('Press Power + Volume down together.', 'পাওয়ার ও ভলিউম কমানোর বোতাম একসঙ্গে চাপুন।', 'पावर + वॉल्यूम कम बटन साथ में दबाएं।', 'Nhấn cùng lúc nút Nguồn và Giảm âm lượng.')}</li>
              <li><span className="badge">iPhone</span>{t('Press the side button + Volume up together.', 'পাশের বোতাম ও ভলিউম বাড়ানোর বোতাম একসঙ্গে চাপুন।', 'साइड बटन + वॉल्यूम बढ़ाएं साथ में दबाएं।', 'Nhấn cùng lúc nút bên và Tăng âm lượng.')}</li>
              <li><span className="badge">{t('Computer', 'কম্পিউটার', 'कंप्यूटर', 'Máy tính')}</span>{t('Use the Guidia browser helper, or press Print Screen.', 'Guidia ব্রাউজার হেল্পার ব্যবহার করুন, বা Print Screen চাপুন।', 'Guidia ब्राउज़र हेल्पर इस्तेमाल करें, या Print Screen दबाएं।', 'Dùng tiện ích trình duyệt Guidia, hoặc nhấn Print Screen.')}</li>
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}

function useCountdown(expiresAt) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 60_000));
}

export function ScreenResultPage() {
  const { id } = useParams();
  const { t, mode } = usePreferences();
  const { speak, voiceControls } = useVoice();
  const voiceState = useVoiceState();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { data: analysis, error, loading, reload } = useResource(`/vision/${id}`, { select: (d) => d.analysis });
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const minutesLeft = useCountdown(analysis?.expiresAt);
  const itemRefs = useRef([]);
  const markerRefs = useRef([]);

  useEffect(() => {
    if (!analysis?.hasImage) return undefined;
    let url = '';
    let cancelled = false;
    api(`/vision/${id}/image`).then((blob) => { if (cancelled) return; url = URL.createObjectURL(blob); setImageUrl(url); }).catch(() => {});
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [analysis?.hasImage, id]);

  const r = analysis?.result;
  const pinned = useMemo(() => (r?.elements || []).map((el, i) => ({ ...el, n: i + 1 })).filter((el) => el.x != null && el.y != null), [r]);

  if (loading && !analysis) {
    return (
      <div className="page page-wide" aria-busy="true">
        <Skeleton variant="title" />
        <div className="screen-result"><Skeleton variant="card" height={460} /><Skeleton variant="card" height={460} /></div>
      </div>
    );
  }
  if (error) return <div className="page"><ErrorState card title={t('We could not open this explanation', 'এই ব্যাখ্যাটি খোলা যায়নি', 'यह व्याख्या नहीं खुल सकी', 'Không mở được phần giải thích này')} message={error.message} onRetry={reload} secondary={<Button variant="ghost" to="/app/screen">{t('New screenshot', 'নতুন স্ক্রিনশট', 'नया स्क्रीनशॉट', 'Ảnh mới')}</Button>} /></div>;
  if (!analysis) return null;
  if (!r) {
    return <div className="page"><ErrorState card title={t('This explanation did not finish', 'এই ব্যাখ্যাটি শেষ হয়নি', 'यह व्याख्या पूरी नहीं हुई', 'Phần giải thích chưa hoàn tất')} message={t('Please take a new screenshot and try again.', 'নতুন স্ক্রিনশট নিয়ে আবার চেষ্টা করুন।', 'नया स्क्रीनशॉट लेकर फिर कोशिश करें।', 'Hãy chụp màn hình mới và thử lại.')} secondary={<Button to="/app/screen">{t('New screenshot', 'নতুন স্ক্রিনশট', 'नया स्क्रीनशॉट', 'Ảnh mới')}</Button>} /></div>;
  }

  const listenAll = () => speak([r.summary, r.warning, r.nextAction && `${t('Next safe step', 'পরের নিরাপদ ধাপ', 'अगला सुरक्षित कदम', 'Bước an toàn tiếp theo')}: ${r.nextAction}`].filter(Boolean).join('. '));

  const pick = (i, from) => {
    setActive(i);
    const el = r.elements[i];
    if (el) announce(`${i + 1}. ${el.label}`);
    const target = from === 'marker' ? itemRefs.current[i] : markerRefs.current[i];
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  };

  const ask = async (text = question) => {
    const q = text.trim();
    if (!q) return;
    setAsking(true);
    setAskError('');
    try {
      const data = await post(`/vision/${id}/ask`, { question: q, cognitiveState: mode.toUpperCase() });
      setAnswers((a) => [...a, data]);
      setQuestion('');
      speak([data.answer.summary, data.answer.nextAction].filter(Boolean).join('. '));
      announce(t('Guidia answered.', 'Guidia উত্তর দিয়েছে।', 'Guidia ने जवाब दिया।', 'Guidia đã trả lời.'));
    } catch (err) {
      setAskError(err.message);
    } finally {
      setAsking(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await del(`/vision/${id}`);
      showToast(t('Screenshot deleted.', 'স্ক্রিনশট মুছে ফেলা হয়েছে।', 'स्क्रीनशॉट हटा दिया गया।', 'Đã xóa ảnh chụp màn hình.'), 'success');
      navigate('/app/screen');
    } catch (err) {
      showToast(err.message, 'danger');
      setDeleting(false);
    }
  };

  const prompts = [
    t('Where should I press?', 'কোথায় চাপব?', 'कहाँ दबाऊं?', 'Tôi nên bấm vào đâu?'),
    t('Is this safe?', 'এটা কি নিরাপদ?', 'क्या यह सुरक्षित है?', 'Cái này có an toàn không?'),
    t('What does this button mean?', 'এই বোতামের মানে কী?', 'इस बटन का मतलब क्या है?', 'Nút này nghĩa là gì?'),
    t('What should I check first?', 'আগে কী দেখব?', 'पहले क्या जांचूं?', 'Tôi nên kiểm tra gì trước?'),
  ];
  const { tone } = riskMeta(r.risk);
  const speaking = voiceState === 'speaking' || voiceState === 'processing';

  return (
    <div className="page page-wide screen-result-page">
      <div className="row-between rise">
        <Button variant="ghost" size="sm" icon={ArrowLeft} to="/app/screen">{t('New screenshot', 'নতুন স্ক্রিনশট', 'नया स्क्रीनशॉट', 'Ảnh mới')}</Button>
        <div className="row" style={{ '--gap': 'var(--s-2)' }}>
          {analysis.hasImage && minutesLeft != null && (
            <span className="badge"><Clock aria-hidden="true" /> {t(`Deletes itself in ${minutesLeft} min`, `${minutesLeft} মিনিটে নিজে মুছে যাবে`, `${minutesLeft} मिनट में अपने आप हटेगा`, `Tự xóa sau ${minutesLeft} phút`)}</span>
          )}
          <Button variant="danger-quiet" size="sm" icon={Trash2} onClick={() => setConfirmDelete(true)}>{t('Delete screenshot now', 'এখনই স্ক্রিনশট মুছুন', 'अभी स्क्रीनशॉट हटाएं', 'Xóa ảnh ngay')}</Button>
        </div>
      </div>

      <div className="screen-result">
        <section className="card screen-canvas-card rise" aria-label={t('Your screenshot', 'আপনার স্ক্রিনশট', 'आपका स्क्रीनशॉट', 'Ảnh chụp màn hình của bạn')}>
          {imageUrl ? (
            <>
              <div className="canvas-tools" role="group" aria-label={t('Zoom', 'জুম', 'ज़ूम', 'Thu phóng')}>
                <IconButton icon={Minus} size="sm" variant="quiet" label={t('Zoom out', 'ছোট করুন', 'छोटा करें', 'Thu nhỏ')} onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))} disabled={zoom <= 1} />
                <span className="text-strong num" aria-live="polite">{Math.round(zoom * 100)}%</span>
                <IconButton icon={Plus} size="sm" variant="quiet" label={t('Zoom in', 'বড় করুন', 'बड़ा करें', 'Phóng to')} onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))} disabled={zoom >= 2.5} />
                <Button variant="quiet" size="sm" icon={Maximize} onClick={() => setZoom(1)} disabled={zoom === 1}>{t('Fit', 'মানানসই', 'फ़िट', 'Vừa khung')}</Button>
              </div>
              <div className="screen-canvas-scroll">
                <div className="screen-canvas" style={{ width: `${zoom * 100}%` }}>
                  <img src={imageUrl} alt={t('Your screenshot with numbered markers', 'নম্বরসহ আপনার স্ক্রিনশট', 'नंबर वाले निशानों के साथ आपका स्क्रीनशॉट', 'Ảnh chụp màn hình có đánh số')} />
                  {pinned.map((el) => (
                    <button
                      key={el.n} ref={(node) => { markerRefs.current[el.n - 1] = node; }} type="button"
                      className={`screen-marker mk-${TYPE_TONE[el.type] || 'brand'}`} data-active={active === el.n - 1}
                      style={{ left: `${el.x}%`, top: `${el.y}%` }} onClick={() => pick(el.n - 1, 'marker')}
                      aria-label={`${el.n}. ${el.label}`} aria-pressed={active === el.n - 1}
                    >{el.n}</button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="state">
              <span className="state-icon" aria-hidden="true"><Lock /></span>
              <p>{t('The picture was deleted for your privacy. The explanation is still here.', 'গোপনীয়তার জন্য ছবিটি মুছে ফেলা হয়েছে। ব্যাখ্যাটি রয়ে গেছে।', 'गोपनीयता के लिए तस्वीर हटा दी गई। व्याख्या अभी भी यहाँ है।', 'Ảnh đã bị xóa để bảo vệ riêng tư. Phần giải thích vẫn còn.')}</p>
            </div>
          )}
          {imageUrl && r.elements.length > 0 && pinned.length === 0 && (
            <p className="text-subtle" style={{ marginTop: 'var(--s-3)' }}>{t('Guidia could not point to exact spots on this picture, so it describes them in the list instead.', 'Guidia এই ছবিতে ঠিক জায়গা দেখাতে পারেনি, তাই তালিকায় বর্ণনা করেছে।', 'Guidia इस तस्वीर पर सटीक जगह नहीं दिखा सका, इसलिए सूची में बताया है।', 'Guidia không chỉ được vị trí chính xác trên ảnh nên đã mô tả trong danh sách.')}</p>
          )}
        </section>

        <div className="stack screen-panel" style={{ '--gap': 'var(--s-4)' }}>
          <section className={`card risk-summary tone-${tone} rise`} style={{ '--i': 1 }} aria-labelledby="seeing">
            <div className="row-between">
              <RiskBadge severity={r.risk} t={t} size="lg" />
              {r.detectedApp && <span className="badge">{r.detectedApp}</span>}
            </div>
            <div className="stack" style={{ '--gap': '4px' }}>
              <p className="eyebrow" id="seeing">{t("What you're seeing", 'আপনি যা দেখছেন', 'आप क्या देख रहे हैं', 'Bạn đang thấy gì')}</p>
              <p className="screen-summary">{r.summary}</p>
            </div>
            {r.warning && (
              <Alert tone={r.risk === 'CRITICAL' ? 'danger' : 'risk'} title={t('What matters', 'যা জরুরি', 'जो ज़रूरी है', 'Điều quan trọng')}>{r.warning}</Alert>
            )}
            {r.nextAction && (
              <div className="next-step">
                <p className="eyebrow">{t('Next safe step', 'পরের নিরাপদ ধাপ', 'अगला सुरक्षित कदम', 'Bước an toàn tiếp theo')}</p>
                <p className="h-card">{r.nextAction}</p>
              </div>
            )}
            <div className="btn-group">
              {voiceState === 'paused' ? (
                <Button variant="tonal" icon={Play} onClick={voiceControls.resume}>{t('Resume', 'আবার চালু', 'जारी रखें', 'Tiếp tục')}</Button>
              ) : speaking ? (
                <Button variant="tonal" icon={Pause} onClick={voiceControls.pause}>{t('Pause', 'থামান', 'रोकें', 'Tạm dừng')}</Button>
              ) : (
                <Button variant="secondary" icon={Volume2} onClick={listenAll}>{t('Listen', 'শুনুন', 'सुनें', 'Nghe')}</Button>
              )}
              {(speaking || voiceState === 'paused') && <IconButton icon={Square} variant="quiet" label={t('Stop', 'বন্ধ', 'बंद', 'Dừng')} onClick={voiceControls.stop} />}
              <IconButton icon={RotateCcw} variant="quiet" label={t('Replay', 'আবার শুনুন', 'फिर सुनें', 'Nghe lại')} onClick={listenAll} />
            </div>
          </section>

          {r.elements.length > 0 && (
            <section className="card rise" style={{ '--i': 2 }} aria-labelledby="elements-h">
              <h2 id="elements-h" className="h-card" style={{ marginBottom: 'var(--s-3)' }}>{t('What is on this screen', 'এই স্ক্রিনে কী আছে', 'इस स्क्रीन पर क्या है', 'Trên màn hình có gì')}</h2>
              <ol className="element-list">
                {r.elements.map((el, i) => (
                  <li key={i}>
                    <button ref={(node) => { itemRefs.current[i] = node; }} type="button" className="element-item" data-active={active === i} aria-pressed={active === i} onClick={() => pick(i, 'list')}>
                      <span className={`element-num mk-${TYPE_TONE[el.type] || 'brand'}`} aria-hidden="true">{i + 1}</span>
                      <span className="stack" style={{ '--gap': '2px', textAlign: 'left' }}>
                        <span className="list-item-title">{el.label}</span>
                        <span className="text-muted text-sm">{el.description}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="card stack rise screen-ask" style={{ '--i': 3, '--gap': 'var(--s-3)' }} aria-labelledby="screen-ask-h">
            <h2 id="screen-ask-h" className="h-card row" style={{ '--gap': '8px' }}><MessageSquareText size={20} aria-hidden="true" /> {t('Ask about this screen', 'এই স্ক্রিন নিয়ে জিজ্ঞাসা করুন', 'इस स्क्रीन के बारे में पूछें', 'Hỏi về màn hình này')}</h2>
            {answers.map((a, i) => (
              <div key={i} className="screen-qa fade">
                <p className="screen-q">{a.question}</p>
                <div className="screen-a">
                  <p>{a.answer.summary}</p>
                  {a.answer.warning && <p className="text-strong" style={{ color: 'var(--risk-700)' }}>{a.answer.warning}</p>}
                  {a.answer.nextAction && <p className="screen-a-next"><span className="eyebrow">{t('Next', 'এরপর', 'आगे', 'Tiếp theo')}</span> {a.answer.nextAction}</p>}
                </div>
              </div>
            ))}
            {asking && <div className="screen-qa"><Skeleton height={64} /></div>}
            {askError && <Alert tone="warn">{askError}</Alert>}
            {analysis.hasImage ? (
              <>
                <div className="row" style={{ '--gap': 'var(--s-2)' }}>
                  {prompts.map((p) => <button key={p} type="button" className="chip" onClick={() => ask(p)} disabled={asking}>{p}</button>)}
                </div>
                <form className="row row-nowrap" style={{ '--gap': 'var(--s-2)' }} onSubmit={(e) => { e.preventDefault(); ask(); }}>
                  <label htmlFor="screen-ask-input" className="sr-only">{t('Your question', 'আপনার প্রশ্ন', 'आपका सवाल', 'Câu hỏi của bạn')}</label>
                  <input id="screen-ask-input" className="input" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={500} placeholder={t('Type a question about this screen', 'এই স্ক্রিন নিয়ে প্রশ্ন লিখুন', 'इस स्क्रीन के बारे में सवाल लिखें', 'Gõ câu hỏi về màn hình này')} />
                  <IconButton icon={Send} variant="primary" type="submit" label={t('Ask', 'জিজ্ঞাসা', 'पूछें', 'Hỏi')} disabled={asking || !question.trim()} />
                </form>
              </>
            ) : (
              <p className="text-muted">{t('To ask more, share a new screenshot — the old picture was deleted for your privacy.', 'আরও জানতে নতুন স্ক্রিনশট দিন — পুরোনো ছবিটি গোপনীয়তার জন্য মুছে ফেলা হয়েছে।', 'और पूछने के लिए नया स्क्रीनशॉट दें — पुरानी तस्वीर निजता के लिए हटा दी गई।', 'Để hỏi thêm, hãy gửi ảnh mới — ảnh cũ đã bị xóa để bảo vệ riêng tư.')}</p>
            )}
          </section>
          <div className="card card-tint"><PrivacyNote t={t} /></div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={remove} state={deleting ? 'loading' : 'idle'}
        title={t('Delete this screenshot now?', 'এখনই এই স্ক্রিনশট মুছবেন?', 'यह स्क्रीनशॉट अभी हटाएं?', 'Xóa ảnh chụp này ngay?')}
        consequences={[t('The picture and its explanation are removed straight away.', 'ছবি ও তার ব্যাখ্যা সঙ্গে সঙ্গে মুছে যাবে।', 'तस्वीर और उसकी व्याख्या तुरंत हट जाएंगी।', 'Ảnh và phần giải thích sẽ bị xóa ngay.')]}
        confirmLabel={t('Delete now', 'এখনই মুছুন', 'अभी हटाएं', 'Xóa ngay')}
      />
    </div>
  );
}
