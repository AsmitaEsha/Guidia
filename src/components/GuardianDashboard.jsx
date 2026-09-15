import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { Shield, Check, X, AlertTriangle, Clock, DollarSign, Info, UserPlus, Mail } from 'lucide-react';
import GuidiaLoadingState from './ui/GuidiaLoadingState';

const STATUS_COLORS = { PENDING:'var(--warn)', ACTIVE:'var(--success)', REVOKED:'var(--text-3)', APPROVED:'var(--success)', REJECTED:'var(--danger)', FLAGGED:'var(--warn)' };
const STATUS_BG     = { PENDING:'var(--warn-light)', ACTIVE:'var(--success-light)', REVOKED:'var(--surface-2)', APPROVED:'var(--success-light)', REJECTED:'var(--danger-light)', FLAGGED:'var(--warn-light)' };

export default function GuardianDashboard() {
  const { t, showToast } = useApp();
  const { user, authedFetch, ApiError } = useAuth();
  const [activeSection, setActiveSection] = useState('guardians'); // guardians|approvals
  const [relationships, setRelationships] = useState([]);
  const [myApprovals, setMyApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteThreshold, setInviteThreshold] = useState('1000');
  const [inviting, setInviting] = useState(false);

  // Shared fetch used both by the initial-load effect and by every mutation
  // handler below to refresh afterwards. Not called directly from the
  // effect body (kept as an inline fetch there instead) so a static setState
  // analysis doesn't need to trace through a cross-boundary function call.
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ relationships: rels }, { approvals }] = await Promise.all([
        authedFetch('/guardians'),
        authedFetch('/guardians/approvals/mine'),
      ]);
      setRelationships(rels);
      setMyApprovals(approvals);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t('Could not load guardian info.', 'গার্ডিয়ান তথ্য লোড করা যায়নি।'), 'danger');
    } finally {
      setLoading(false);
    }
  }, [authedFetch, ApiError, showToast, t]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([authedFetch('/guardians'), authedFetch('/guardians/approvals/mine')])
      .then(([{ relationships: rels }, { approvals }]) => {
        if (cancelled) return;
        setRelationships(rels);
        setMyApprovals(approvals);
      })
      .catch((err) => {
        if (cancelled) return;
        showToast(err instanceof ApiError ? err.message : t('Could not load guardian info.', 'গার্ডিয়ান তথ্য লোড করা যায়নি।'), 'danger');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const asSenior = relationships.filter(r => r.senior?.id === user?.id);
  const pendingForMe = relationships.filter(r => r.status === 'PENDING' && r.guardian === null && r.guardianEmail?.toLowerCase() === user?.email?.toLowerCase());
  const pendingApprovalCount = myApprovals.filter(a => a.status === 'PENDING').length;

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await authedFetch('/guardians/invite', {
        method: 'POST',
        body: { guardianEmail: inviteEmail.trim(), approvalThreshold: Number(inviteThreshold) || 0 },
      });
      setInviteEmail('');
      showToast(t('Invitation sent!', 'আমন্ত্রণ পাঠানো হয়েছে!'), 'success');
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t('Could not send invite.', 'আমন্ত্রণ পাঠানো যায়নি।'), 'danger');
    } finally {
      setInviting(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await authedFetch(`/guardians/${id}/accept`, { method: 'POST' });
      showToast(t('You are now a guardian. Thank you for helping keep them safe.', 'আপনি এখন একজন গার্ডিয়ান।'), 'success');
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t('Could not accept invitation.', 'আমন্ত্রণ গ্রহণ করা যায়নি।'), 'danger');
    }
  };

  const handleRevoke = async (id) => {
    try {
      await authedFetch(`/guardians/${id}/revoke`, { method: 'POST' });
      showToast(t('Relationship ended.', 'সম্পর্ক শেষ হয়েছে।'), 'info');
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t('Could not update that.', 'আপডেট করা যায়নি।'), 'danger');
    }
  };

  const handleResolveApproval = async (id, status) => {
    try {
      await authedFetch(`/guardians/approvals/${id}/resolve`, { method: 'POST', body: { status } });
      showToast(
        status === 'APPROVED' ? t('Approved.', 'অনুমোদিত।') : status === 'REJECTED' ? t('Rejected.', 'প্রত্যাখ্যাত।') : t('Flagged for review.', 'পর্যালোচনার জন্য চিহ্নিত।'),
        status === 'APPROVED' ? 'success' : 'info'
      );
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t('Could not resolve that request.', 'অনুরোধ সমাধান করা যায়নি।'), 'danger');
    }
  };

  if (loading) {
    return <GuidiaLoadingState/>;
  }

  return (
    <div>
      <div className="section-header">
        <div className="flex items-center gap-16">
          <div className="icon-wrap iw-md ic-blue"><Shield size={26}/></div>
          <div>
            <h1 className="t-title anim-up">{t('Guardian', 'গার্ডিয়ান')}</h1>
            <p className="t-sub anim-up d1" style={{ marginTop:4 }}>{t('Trusted people, and the people you protect', 'বিশ্বস্ত মানুষ এবং যাদের আপনি সুরক্ষা দেন')}</p>
          </div>
        </div>
        <div className="section-divider"/>
      </div>

      {/* Pending invitations addressed to me */}
      {pendingForMe.length > 0 && (
        <div className="flex-col gap-12 anim-up" style={{ marginBottom:24 }}>
          {pendingForMe.map(r => (
            <div key={r.id} className="card" style={{ padding:20, borderLeft:'5px solid var(--warn)', background:'var(--warn-light)' }}>
              <p style={{ fontWeight:800, fontSize:17, marginBottom:6 }}>
                {t(`${r.senior.fullName} wants you to be their guardian`, `${r.senior.fullName} আপনাকে গার্ডিয়ান হতে বলেছেন`)}
              </p>
              <p className="t-sub" style={{ marginBottom:14 }}>{r.senior.email}</p>
              <div className="flex gap-12">
                <button className="btn btn-success btn-sm flex-1" onClick={() => handleAccept(r.id)}><Check size={18}/> {t('Accept', 'গ্রহণ করুন')}</button>
                <button className="btn btn-danger btn-sm flex-1" onClick={() => handleRevoke(r.id)}><X size={18}/> {t('Decline', 'প্রত্যাখ্যান')}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="segment anim-up d1" style={{ marginBottom:24 }}>
        <button className={`seg-btn ${activeSection==='guardians'?'active':''}`} onClick={() => setActiveSection('guardians')}>{t('My Guardians', 'আমার গার্ডিয়ান')}</button>
        <button className={`seg-btn ${activeSection==='approvals'?'active':''}`} onClick={() => setActiveSection('approvals')}>
          {t('Approval Requests', 'অনুমোদনের অনুরোধ')} {pendingApprovalCount > 0 ? `(${pendingApprovalCount})` : ''}
        </button>
      </div>

      {/* My Guardians tab */}
      {activeSection === 'guardians' && (
        <div className="flex-col gap-16 anim-up">
          <div className="card" style={{ padding:20 }}>
            <p style={{ fontWeight:800, fontSize:17, marginBottom:4 }}><UserPlus size={18} style={{ verticalAlign:'-3px', marginRight:6 }}/>{t('Invite a Guardian', 'গার্ডিয়ান আমন্ত্রণ করুন')}</p>
            <p className="t-sub" style={{ marginBottom:14 }}>{t('They will need to accept before they can approve anything for you.', 'অনুমোদন করার আগে তাদের আমন্ত্রণ গ্রহণ করতে হবে।')}</p>
            <div className="flex-col gap-10">
              <input className="input-field" type="email" placeholder={t('Guardian\'s email address', 'গার্ডিয়ানের ইমেইল')} value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              <div>
                <label style={{ fontWeight:600, fontSize:14, display:'block', marginBottom:6 }}>{t('Ask for approval above (৳)', 'এর বেশি হলে অনুমোদন চান (৳)')}</label>
                <input className="input-field" type="number" min="0" value={inviteThreshold} onChange={e => setInviteThreshold(e.target.value)} />
              </div>
              <button className="btn btn-primary btn-full" disabled={inviting || !inviteEmail.trim()} onClick={handleInvite}>
                <Mail size={18}/> {inviting ? t('Sending…', 'পাঠানো হচ্ছে…') : t('Send Invitation', 'আমন্ত্রণ পাঠান')}
              </button>
            </div>
          </div>

          {asSenior.length === 0 ? (
            <div className="card text-center" style={{ padding:32 }}>
              <p className="t-sub">{t('You have not invited a guardian yet.', 'আপনি এখনো কোনো গার্ডিয়ান আমন্ত্রণ করেননি।')}</p>
            </div>
          ) : asSenior.map((r, i) => (
            <div key={r.id} className={`card anim-up d${i+1}`} style={{ padding:18, borderLeft:`5px solid ${STATUS_COLORS[r.status]}`, background:STATUS_BG[r.status] }}>
              <div className="flex items-center gap-14">
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:800, fontSize:16 }}>{r.guardian?.fullName || r.guardianEmail}</p>
                  <p className="t-tiny">{r.guardianEmail}</p>
                </div>
                <span className="badge" style={{ background:STATUS_COLORS[r.status]+'22', color:STATUS_COLORS[r.status] }}>{r.status}</span>
              </div>
              {r.status !== 'REVOKED' && (
                <button className="btn btn-ghost btn-sm" style={{ marginTop:12, color:'var(--danger)' }} onClick={() => handleRevoke(r.id)}>
                  {t('End this relationship', 'সম্পর্ক শেষ করুন')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Approval Requests tab (things I've been asked to approve as a guardian) */}
      {activeSection === 'approvals' && (
        <div className="flex-col gap-14 anim-up">
          {myApprovals.length === 0 && (
            <div className="card text-center" style={{ padding:40 }}>
              <p style={{ fontWeight:700, fontSize:18 }}>{t('No approval requests yet.', 'এখনো কোনো অনুমোদনের অনুরোধ নেই।')}</p>
              <p className="t-sub" style={{ marginTop:6 }}>{t('You will see requests here once someone you guard needs your approval.', 'যাদের আপনি সুরক্ষা দেন তাদের অনুমোদন প্রয়োজন হলে এখানে দেখাবে।')}</p>
            </div>
          )}
          {myApprovals.map((a, i) => (
            <div key={a.id} className={`card anim-up d${i+1}`} style={{ padding:20, borderLeft:`5px solid ${STATUS_COLORS[a.status]}`, background:STATUS_BG[a.status] }}>
              <div className="flex items-start gap-14" style={{ marginBottom: a.status==='PENDING' ? 16 : 0 }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:STATUS_BG[a.status], color:STATUS_COLORS[a.status], display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <DollarSign size={18}/>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:800, fontSize:16 }}>{a.senior?.fullName} — {a.summary.what}</p>
                  <p className="t-sub" style={{ marginTop:2 }}>{t('To', 'প্রতি')}: {a.summary.who} · {a.summary.amountOrData}</p>
                  <div className="flex items-center gap-10" style={{ marginTop:6 }}>
                    <Clock size={14} color="var(--text-3)"/>
                    <p className="t-tiny">{new Date(a.createdAt).toLocaleString()}</p>
                    <span className="badge" style={{ background:STATUS_COLORS[a.status]+'22', color:STATUS_COLORS[a.status], fontSize:12 }}>{a.status}</span>
                  </div>
                </div>
              </div>
              {a.status === 'PENDING' && (
                <div className="flex gap-10">
                  <button className="btn btn-success btn-sm flex-1" onClick={() => handleResolveApproval(a.id, 'APPROVED')}><Check size={16}/> {t('Approve', 'অনুমোদন')}</button>
                  <button className="btn btn-danger btn-sm flex-1" onClick={() => handleResolveApproval(a.id, 'REJECTED')}><X size={16}/> {t('Reject', 'প্রত্যাখ্যান')}</button>
                  <button className="btn btn-ghost btn-sm flex-1" onClick={() => handleResolveApproval(a.id, 'FLAGGED')}><AlertTriangle size={16}/> {t('Flag', 'চিহ্নিত করুন')}</button>
                </div>
              )}
            </div>
          ))}
          {myApprovals.length === 0 && asSenior.length === 0 && (
            <p className="t-tiny flex items-center gap-6" style={{ marginTop:4 }}><Info size={14}/> {t('Approval requests are created automatically from Safe Practice — for example, sending money in the bKash simulation.', 'নিরাপদ অনুশীলন থেকে স্বয়ংক্রিয়ভাবে অনুমোদনের অনুরোধ তৈরি হয়।')}</p>
          )}
        </div>
      )}
    </div>
  );
}
