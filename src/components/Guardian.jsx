import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle } from 'lucide-react';

export default function Guardian() {
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);

  return (
    <div style={{ padding: '24px', paddingBottom: '40px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }} className="animate-fade-in">
        <div style={{ background: 'var(--color-soft-blue)', color: 'white', padding: '12px', borderRadius: '16px' }}>
          <Shield size={32} />
        </div>
        <div>
          <h1 className="text-title" style={{ fontSize: '28px', margin: 0 }}>Guardian Portal</h1>
          <p className="text-body" style={{ fontSize: '16px' }}>Protecting your loved ones.</p>
        </div>
      </header>

      {!approved && !rejected ? (
        <div className="card animate-fade-in" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ background: 'rgba(255,179,123,0.2)', color: 'var(--color-warning-orange)', padding: '12px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', marginBottom: '16px' }}>
            Action Required
          </div>
          <h3 className="text-title" style={{ fontSize: '22px' }}>Transfer Approval Request</h3>
          <p className="text-body" style={{ marginBottom: '16px' }}>
            Mom is attempting to send <strong>5,000 BDT</strong> via bKash to an unknown number.
          </p>
          <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <p><strong>Recipient:</strong> 017XXXXXX45</p>
            <p><strong>Amount:</strong> 5,000 BDT</p>
            <p><strong>Risk Level:</strong> <span style={{ color: 'var(--color-safe-red)', fontWeight: 'bold' }}>High</span> (Number not in contacts)</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" style={{ background: 'var(--color-safe-red)', flex: 1 }} onClick={() => setRejected(true)}>
              Reject
            </button>
            <button className="btn-primary" style={{ background: 'var(--color-sage-green)', flex: 1 }} onClick={() => setApproved(true)}>
              Approve
            </button>
          </div>
        </div>
      ) : (
        <div className="card animate-fade-in" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px' }}>
          {approved ? (
            <CheckCircle size={64} color="var(--color-sage-green)" style={{ marginBottom: '16px' }} />
          ) : (
            <XCircle size={64} color="var(--color-safe-red)" style={{ marginBottom: '16px' }} />
          )}
          <h3 className="text-title" style={{ fontSize: '24px' }}>{approved ? 'Transfer Approved' : 'Transfer Blocked'}</h3>
          <p className="text-body">Mom has been safely notified.</p>
        </div>
      )}
    </div>
  );
}
