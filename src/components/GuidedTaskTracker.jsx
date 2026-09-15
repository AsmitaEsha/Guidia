import React, { useState } from 'react';
import { useApp } from '../context/AppStateContext';
import { Check, ArrowLeft, Volume2, Shield } from 'lucide-react';
import { PRACTICE_TASKS } from '../data/hardcoded';

export default function GuidedTaskTracker({ appKey, onClose, children }) {
  const { t, language, speak } = useApp();
  const [task, setTask] = useState(null);
  const [step, setStep] = useState(0);

  const tasks = PRACTICE_TASKS[appKey] || [];

  // Pick display text for a task item (title + level)
  const taskTitle = (tItem) =>
    language === 'bn' ? tItem.titleBn
    : language === 'hi' ? (tItem.titleHi || tItem.title)
    : tItem.title;

  const taskLevel = (tItem) =>
    language === 'bn' ? tItem.levelBn
    : language === 'hi' ? (tItem.levelHi || tItem.level)
    : tItem.level;

  if (!task) {
    return (
      <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
        {/* Task Selection Header */}
        <div style={{ padding:'20px 24px', background:'var(--surface)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
          <button onClick={onClose} className="btn btn-icon btn-ghost"><ArrowLeft size={22}/></button>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:800, fontSize:17 }}>{t('Choose a Practice Mode','একটি চর্চার মোড বেছে নিন','एक अभ्यास मोड चुनें')}</p>
            <p className="t-tiny">{t('Or just explore the app below','অথবা নিচের অ্যাপটি নিজে দেখুন','या नीचे ऐप को स्वयं देखें')}</p>
          </div>
        </div>

        {/* Task List Overlay */}
        <div style={{ padding:'16px 24px', background:'var(--blue-light)', borderBottom:'1px solid var(--border)' }}>
          <p style={{ fontWeight:700, fontSize:14, marginBottom:10, color:'var(--blue-dark)' }}>
            {t('GUIDED TASKS:','নির্দেশিত কাজ:','निर्देशित कार्य:')}
          </p>
          <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:8 }}>
            {tasks.map(tItem => (
              <button key={tItem.id} className="card card-btn"
                style={{ padding:'10px 14px', minWidth:200, display:'flex', flexDirection:'column', alignItems:'flex-start', border:'2px solid var(--blue)' }}
                onClick={() => { 
                  setTask(tItem); 
                  setStep(0); 
                  const firstStep = (tItem.steps[language] || tItem.steps.en)[0];
                  speak(`${taskTitle(tItem)}. ${firstStep}`); 
                }}>
                <span className={`badge ${tItem.level==='Beginner'?'badge-success':tItem.level==='Intermediate'?'badge-blue':'badge-danger'}`}
                  style={{ marginBottom:6, fontSize:11 }}>
                  {taskLevel(tItem)}
                </span>
                <p style={{ fontWeight:700, fontSize:15, textAlign:'left' }}>{taskTitle(tItem)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Free Explore Area */}
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
          {children}
          <div style={{ position:'absolute', top:20, right:20, background:'rgba(0,0,0,0.5)', color:'#fff', padding:'6px 12px', borderRadius:20, fontSize:12, fontWeight:700, pointerEvents:'none' }}>
            {t('Free Explore Mode','ফ্রি এক্সপ্লোর মোড','फ्री एक्सप्लोर मोड')}
          </div>
        </div>
      </div>
    );
  }

  // Active Task Mode
  const stepList = task.steps[language] || task.steps.en;
  const isDone = step >= stepList.length;

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      {/* Active Task Header */}
      <div style={{ padding:'16px 20px', background:'var(--surface)', borderBottom:'2px solid var(--blue)', flexShrink:0 }}>
        <div className="flex items-center justify-between" style={{ marginBottom:12 }}>
          <div className="flex items-center gap-12">
            <button onClick={() => setTask(null)} className="btn btn-icon btn-ghost"><ArrowLeft size={20}/></button>
            <p style={{ fontWeight:800, fontSize:16 }}>{taskTitle(task)}</p>
          </div>
          <span className="badge badge-blue">{step+1} / {stepList.length}</span>
        </div>

        {!isDone ? (
          <div className="card anim-scale" style={{ background:'linear-gradient(135deg,var(--blue-light),var(--teal-light))', padding:16, borderLeft:'4px solid var(--blue)', display:'flex', alignItems:'center', gap:12 }}>
            <div className="icon-wrap iw-sm" style={{ background:'white', color:'var(--blue)' }}><Volume2 size={18}/></div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700, fontSize:15 }}>{stepList[step]}</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => { 
              const nextStepIdx = step + 1;
              if (nextStepIdx < stepList.length) {
                speak(stepList[nextStepIdx]);
                setStep(nextStepIdx);
              } else {
                speak(language === 'bn' ? 'কাজটি নিরাপদে সম্পন্ন হয়েছে!' : language === 'hi' ? 'कार्य सुरक्षित रूप से पूरा हुआ!' : 'Task completed safely!');
                setStep(nextStepIdx);
              }
            }}>
              {t('Next Step','পরের ধাপ','अगला चरण')} <Check size={16}/>
            </button>
          </div>
        ) : (
          <div className="card anim-scale" style={{ background:'var(--success-light)', padding:16, borderLeft:'4px solid var(--success)', display:'flex', alignItems:'center', gap:12 }}>
            <div className="icon-wrap iw-sm ic-success"><Shield size={18}/></div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:700, fontSize:15, color:'var(--success)' }}>
                {t('Task completed safely!','কাজটি নিরাপদে সম্পন্ন হয়েছে!','कार्य सुरक्षित रूप से पूरा हुआ!')}
              </p>
            </div>
            <button className="btn btn-success btn-sm" onClick={() => setTask(null)}>
              {t('Finish','শেষ করুন','समाप्त करें')}
            </button>
          </div>
        )}
      </div>

      {/* Simulator */}
      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
        {children}
      </div>
    </div>
  );
}
