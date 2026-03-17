import { useState, useRef, useCallback, useEffect } from 'react';
import Head from 'next/head';

function ScoreRing({ score }) {
  const size = 154, sw = 11, r = (size - sw) / 2, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#4db87a' : score >= 60 ? '#c9a84c' : score >= 40 ? '#d4834a' : '#d95555';
  const label = score >= 90 ? 'Exceptional' : score >= 75 ? 'Strong' : score >= 60 ? 'Adequate' : score >= 40 ? 'Weak' : 'Critical';
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <div style={{ position:'relative', width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a2c45" strokeWidth={sw}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition:'stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1)' }}/>
        </svg>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
          <div style={{ fontSize:'2.4rem', fontWeight:700, color, fontFamily:'var(--font-display)', lineHeight:1 }}>{score}</div>
          <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:2 }}>/ 100</div>
        </div>
      </div>
      <div style={{ fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.15em', color, padding:'3px 10px', background:`${color}18`, border:`1px solid ${color}35`, borderRadius:20 }}>{label}</div>
    </div>
  );
}

function RiskBadge({ level }) {
  const map = { LOW:{color:'#4db87a',bg:'#4db87a15',border:'#4db87a30'}, MEDIUM:{color:'#c9a84c',bg:'#c9a84c15',border:'#c9a84c30'}, HIGH:{color:'#d4834a',bg:'#d4834a15',border:'#d4834a30'}, CRITICAL:{color:'#d95555',bg:'#d9555515',border:'#d9555530'} };
  const s = map[level] || map.MEDIUM;
  return <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:s.color, background:s.bg, border:`1px solid ${s.border}`, borderRadius:20, padding:'3px 10px' }}><span style={{ width:6, height:6, borderRadius:'50%', background:s.color, animation:level==='CRITICAL'?'pulse 1s infinite':'none' }}/>{level} RISK</span>;
}

function EnforceBadge({ level }) {
  const map = { STRONG:{color:'#4db87a',label:'✓ Enforceable'}, MODERATE:{color:'#c9a84c',label:'~ Moderate'}, QUESTIONABLE:{color:'#d4834a',label:'⚠ Questionable'}, INVALID:{color:'#d95555',label:'✗ Invalid'} };
  const s = map[level] || map.MODERATE;
  return <span style={{ fontSize:'0.7rem', fontWeight:600, color:s.color, background:`${s.color}15`, border:`1px solid ${s.color}30`, borderRadius:20, padding:'3px 10px' }}>{s.label}</span>;
}

function ItemList({ items, accent }) {
  if (!items || items.length === 0) return <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', fontStyle:'italic' }}>None identified.</p>;
  return (
    <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', animation:`fadeIn 0.3s ease ${i*0.04}s both` }}>
          <span style={{ flexShrink:0, marginTop:4, width:6, height:6, borderRadius:'50%', background:accent, boxShadow:`0 0 6px ${accent}60` }}/>
          <span style={{ fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:1.6 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ChatMessage({ msg }) {
  const isAI = msg.role === 'assistant';
  const renderContent = (text) => text.split('\n').map((line, i) => {
    if (!line.trim()) return <br key={i}/>;
    const html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} style={{ marginBottom:4, lineHeight:1.6 }} dangerouslySetInnerHTML={{ __html: html }}/>;
  });
  return (
    <div style={{ display:'flex', gap:10, alignItems:'flex-start', justifyContent:isAI?'flex-start':'flex-end', animation:'fadeIn 0.3s ease' }}>
      {isAI && <div style={{ flexShrink:0, width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#c9a84c,#e8cb6b)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700, color:'#07090f' }}>⚖</div>}
      <div style={{ maxWidth:'82%', background:isAI?'var(--bg-card-2)':'linear-gradient(135deg,#c9a84c20,#c9a84c10)', border:isAI?'1px solid var(--border)':'1px solid var(--accent-gold-glow)', borderRadius:isAI?'4px 12px 12px 12px':'12px 4px 12px 12px', padding:'10px 14px', fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6 }}>
        {renderContent(msg.content)}
      </div>
    </div>
  );
}

function AnalysisSkeleton() {
  return (
    <div style={{ padding:28, display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', gap:20, alignItems:'center' }}>
        <div className="skeleton" style={{ width:154, height:154, borderRadius:'50%' }}/>
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
          <div className="skeleton" style={{ height:22, width:'60%' }}/><div className="skeleton" style={{ height:14, width:'80%' }}/><div className="skeleton" style={{ height:14, width:'70%' }}/>
          <div style={{ display:'flex', gap:8 }}><div className="skeleton" style={{ height:26, width:80, borderRadius:20 }}/><div className="skeleton" style={{ height:26, width:100, borderRadius:20 }}/></div>
        </div>
      </div>
      {[...Array(3)].map((_,i)=><div key={i} style={{ display:'flex', flexDirection:'column', gap:8 }}><div className="skeleton" style={{ height:14, width:'30%' }}/><div className="skeleton" style={{ height:12, width:'90%' }}/><div className="skeleton" style={{ height:12, width:'75%' }}/></div>)}
    </div>
  );
}

export default function LexAI() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [revisedDoc, setRevisedDoc] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [activeTab, setActiveTab] = useState('cons');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role:'assistant', content:'Hello. I\'m LexAI — your AI legal assistant.\n\nUpload a document and I\'ll analyze it instantly. You can also ask me any legal question. I specialize in Ontario and Canadian law, contracts, construction, real estate, corporate matters, and dispute strategy.' }]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [reviseError, setReviseError] = useState('');
  const [showRevised, setShowRevised] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [dlLoading, setDlLoading] = useState('');

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [chatMessages, isTyping]);

  const toBase64 = (f) => new Promise((res,rej) => { const r=new FileReader(); r.readAsDataURL(f); r.onload=()=>res(r.result.split(',')[1]); r.onerror=rej; });

  const extractPdfText = async (f) => {
    try {
      const lib = window['pdfjs-dist/build/pdf'];
      if (!lib) return '';
      lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const ab = await f.arrayBuffer();
      const pdf = await lib.getDocument({ data: ab }).promise;
      let text = '';
      for (let i=1; i<=Math.min(pdf.numPages,150); i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(x=>x.str).join(' ') + '\n\n';
      }
      return text;
    } catch { return ''; }
  };

  const extractTextFile = (f) => new Promise(res => { const r=new FileReader(); r.onload=e=>res(e.target.result); r.onerror=()=>res(''); r.readAsText(f,'utf-8'); });

  const processFile = async (f) => {
    if (!f) return;
    if (f.size > 50*1024*1024) { setError('File too large. Maximum 50MB.'); return; }
    setFile(f); setAnalysis(null); setRevisedDoc(''); setExtractedText(''); setError(''); setReviseError(''); setShowRevised(false); setIsAnalyzing(true);
    try {
      const base64 = await toBase64(f);
      let clientText = '';
      if (f.type === 'application/pdf') clientText = await extractPdfText(f);
      else if (f.type === 'text/plain' || f.type === 'text/markdown' || f.name.match(/\.(txt|md|rtf)$/i)) clientText = await extractTextFile(f);
      if (clientText) setExtractedText(clientText);

      const resp = await fetch('/api/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fileBase64:base64, mimeType:f.type, fileName:f.name, extractedText:clientText }) });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Analysis failed');
      setAnalysis(data.analysis);
      if (data.extractedText) setExtractedText(data.extractedText);
      setChatMessages(prev => [...prev, { role:'assistant', content:`Document analyzed: **${data.analysis.documentType}**\n\nScore: ${data.analysis.score}/100 — ${data.analysis.riskLevel} Risk\n\n${data.analysis.summary}\n\nAsk me anything about this document.` }]);
    } catch(err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally { setIsAnalyzing(false); }
  };

  const handleDrop = useCallback((e) => { e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files[0]; if(f) processFile(f); }, []);
  const handleFileInput = (e) => { if(e.target.files[0]) processFile(e.target.files[0]); };

  const generateRevision = async () => {
    if (!analysis) return;
    setIsRevising(true); setReviseError('');
    try {
      const resp = await fetch('/api/revise', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ documentText: extractedText || '[No text extracted]', analysis, fileName: file?.name || 'document' }) });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Revision failed');
      setRevisedDoc(data.revisedText); setShowRevised(true);
    } catch(err) { setReviseError(err.message || 'Revision failed.'); }
    finally { setIsRevising(false); }
  };

  const downloadPDF = () => {
    if (!revisedDoc || dlLoading) return;
    setDlLoading('pdf');
    try {
      const { jsPDF } = window.jspdf;
      if (!jsPDF) { alert('PDF library not loaded. Refresh and try again.'); setDlLoading(''); return; }
      const doc = new jsPDF({ orientation:'p', unit:'mm', format:'letter' });
      const margin=22, pageW=doc.internal.pageSize.getWidth(), usable=pageW-margin*2;
      let y=margin;
      const check=(n=8)=>{ if(y+n>doc.internal.pageSize.getHeight()-margin){ doc.addPage(); y=margin; } };
      doc.setFillColor(7,11,23); doc.rect(0,0,pageW,14,'F');
      doc.setFont('times','normal'); doc.setFontSize(8); doc.setTextColor(120,140,180);
      doc.text(`LEXAI LEGAL — ${(file?.name||'DOCUMENT').toUpperCase()} — REVISED — CONFIDENTIAL`, margin, 9);
      y=22;
      for (const raw of revisedDoc.split('\n')) {
        const t=raw.trim(); check(10);
        if (!t){ y+=4; continue; }
        const isH1 = t.match(/^# /) || (t===t.toUpperCase()&&t.length>4&&t.length<80&&!t.match(/^\d/));
        if (isH1) { y+=4; check(14); doc.setFont('times','bold'); doc.setFontSize(14); doc.setTextColor(200,215,235); doc.text(t.replace(/^# /,''),margin,y); doc.setDrawColor(201,168,76); doc.setLineWidth(0.3); doc.line(margin,y+2,margin+usable,y+2); y+=10; continue; }
        if (t.match(/^## /)) { y+=3; doc.setFont('times','bold'); doc.setFontSize(12); doc.setTextColor(180,195,220); doc.text(t.replace(/^## /,''),margin,y); y+=9; continue; }
        if (t.match(/^[-•*] /)) { const wrapped=doc.splitTextToSize(`• ${t.replace(/^[-•*] /,'')}`,usable-6); doc.setFont('times','normal'); doc.setFontSize(10.5); doc.setTextColor(200,210,225); check(wrapped.length*5+2); doc.text(wrapped,margin+4,y); y+=wrapped.length*5.5+2; continue; }
        const wrapped=doc.splitTextToSize(t,usable); doc.setFont('times','normal'); doc.setFontSize(10.5); doc.setTextColor(200,210,225); check(wrapped.length*5+2); doc.text(wrapped,margin,y); y+=wrapped.length*5.5+2;
      }
      const total=doc.internal.getNumberOfPages();
      for (let p=1;p<=total;p++){ doc.setPage(p); doc.setFont('times','normal'); doc.setFontSize(8); doc.setTextColor(80,100,130); doc.text(`Generated by LexAI  |  Page ${p} of ${total}`, pageW/2, doc.internal.pageSize.getHeight()-8, {align:'center'}); }
      doc.save(`${(file?.name||'document').replace(/\.[^/.]+$/,'')}-revised.pdf`);
    } catch(err){ alert('PDF error: '+err.message); }
    finally { setDlLoading(''); }
  };

  const downloadDOCX = async () => {
    if (!revisedDoc || dlLoading) return;
    setDlLoading('docx');
    try {
      const resp = await fetch('/api/download/docx', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text:revisedDoc, fileName:file?.name||'document', documentType:analysis?.documentType||'Legal Document' }) });
      if (!resp.ok) { const e=await resp.json(); throw new Error(e.error||'DOCX failed'); }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=`${(file?.name||'document').replace(/\.[^/.]+$/,'')}-revised.docx`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch(err){ alert('DOCX error: '+err.message); }
    finally { setDlLoading(''); }
  };

  const copyRevised = async () => { if(!revisedDoc) return; await navigator.clipboard.writeText(revisedDoc); setCopySuccess(true); setTimeout(()=>setCopySuccess(false),2000); };

  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg || isChatting) return;
    const newMsgs = [...chatMessages, { role:'user', content:msg }];
    setChatMessages(newMsgs); setChatInput(''); setIsChatting(true); setIsTyping(true);
    try {
      const resp = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ messages: newMsgs.map(m=>({role:m.role,content:m.content})), documentContext: extractedText?extractedText.substring(0,6000):'', analysisContext: analysis||null }) });
      const data = await resp.json();
      setIsTyping(false);
      if (!resp.ok) throw new Error(data.error||'Chat failed');
      setChatMessages(prev=>[...prev,{role:'assistant',content:data.message}]);
    } catch(err) { setIsTyping(false); setChatMessages(prev=>[...prev,{role:'assistant',content:`⚠ Error: ${err.message}`}]); }
    finally { setIsChatting(false); }
  };

  const handleChatKey = (e) => { if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendChat(); } };
  const resetAll = () => { setFile(null); setExtractedText(''); setAnalysis(null); setRevisedDoc(''); setError(''); setReviseError(''); setShowRevised(false); setIsAnalyzing(false); setIsRevising(false); };

  const TABS = [
    { id:'cons', label:'Issues', count:analysis?.cons?.length },
    { id:'pros', label:'Strengths', count:analysis?.pros?.length },
    { id:'critical', label:'Critical', count:analysis?.criticalIssues?.length },
    { id:'recs', label:'Recommendations', count:analysis?.recommendations?.length },
    { id:'missing', label:'Missing Clauses', count:analysis?.missingClauses?.length },
    { id:'legal', label:'Legal Refs', count:analysis?.legalReferences?.length },
  ];
  const tabAccents = { cons:'#d95555', pros:'#4db87a', critical:'#ff4444', recs:'#c9a84c', missing:'#d4834a', legal:'#4a8cdb' };
  const tabContent = analysis ? { cons:analysis.cons, pros:analysis.pros, critical:analysis.criticalIssues, recs:analysis.recommendations, missing:analysis.missingClauses, legal:analysis.legalReferences } : {};

  const S = {
    card:{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden' },
    btn:{ display:'inline-flex', alignItems:'center', gap:8, padding:'9px 18px', borderRadius:8, cursor:'pointer', fontSize:'0.8rem', fontWeight:600, fontFamily:'var(--font-body)', border:'none', transition:'all 0.2s', letterSpacing:'0.02em' },
    btnPrimary:{ background:'linear-gradient(135deg,#c9a84c,#e8cb6b)', color:'#07090f', boxShadow:'0 2px 12px rgba(201,168,76,0.25)' },
    btnSecondary:{ background:'var(--bg-card-2)', color:'var(--text-secondary)', border:'1px solid var(--border-mid)' },
    btnGhost:{ background:'transparent', color:'var(--text-muted)', border:'1px solid var(--border)' },
  };

  return (
    <>
      <Head>
        <title>LexAI — Legal Document Analyzer</title>
        <meta name="description" content="AI-powered legal document analysis and revision"/>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚖</text></svg>"/>
      </Head>
      <div style={{ minHeight:'100vh', background:'var(--bg-void)', display:'flex', flexDirection:'column' }}>

        {/* HEADER */}
        <header style={{ borderBottom:'1px solid var(--border)', background:'var(--bg-secondary)', padding:'0 28px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(20px)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:'linear-gradient(135deg,#c9a84c,#e8cb6b)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', boxShadow:'0 2px 12px rgba(201,168,76,0.3)' }}>⚖</div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:600, color:'var(--text-primary)', letterSpacing:'0.02em' }}>LexAI</div>
              <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.15em' }}>Legal Document Intelligence</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {file && <button onClick={resetAll} style={{ ...S.btn, ...S.btnGhost, fontSize:'0.75rem' }}>↩ New Document</button>}
            <button onClick={()=>setChatOpen(!chatOpen)} style={{ ...S.btn, background:chatOpen?'var(--accent-gold-dim)':'var(--bg-card-2)', color:chatOpen?'var(--accent-gold)':'var(--text-secondary)', border:chatOpen?'1px solid var(--accent-gold-glow)':'1px solid var(--border-mid)' }}>
              ⚖ LexAI Chat {chatOpen?'▲':'▼'}
            </button>
          </div>
        </header>

        {/* FULL PAGE UPLOAD */}
        {!file ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:40, gap:32 }}>
            <div style={{ textAlign:'center', animation:'fadeInUp 0.5s ease' }}>
              <div style={{ fontSize:'3.2rem', marginBottom:12, fontFamily:'var(--font-display)', background:'linear-gradient(135deg,#c9a84c,#e8cb6b,#c9a84c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Legal Intelligence, Instantly.
              </div>
              <p style={{ color:'var(--text-secondary)', fontSize:'1rem', maxWidth:520, margin:'0 auto' }}>
                Upload any legal document for instant AI analysis, strength scoring, risk assessment, and a professionally revised version.
              </p>
            </div>
            <div onDrop={handleDrop} onDragOver={(e)=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onClick={()=>fileInputRef.current?.click()}
              style={{ width:'100%', maxWidth:580, minHeight:260, border:dragOver?'2px dashed var(--accent-gold)':'2px dashed var(--border-mid)', borderRadius:16, cursor:'pointer', transition:'all 0.25s', background:dragOver?'var(--accent-gold-dim)':'var(--bg-card)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, padding:40, boxShadow:dragOver?'var(--glow-gold)':'none', animation:'fadeInUp 0.5s ease 0.1s both' }}>
              <div style={{ width:64, height:64, borderRadius:14, background:dragOver?'var(--accent-gold)':'var(--bg-card-2)', border:'1px solid var(--border-mid)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', transition:'all 0.2s', animation:'float 3s ease-in-out infinite' }}>{dragOver?'⚖':'📄'}</div>
              <div style={{ textAlign:'center' }}>
                <p style={{ color:'var(--text-primary)', fontWeight:600, fontSize:'1rem', marginBottom:4 }}>Drop your document here</p>
                <p style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>or click to browse files</p>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center' }}>
                {['PDF','Word','TXT','Images','RTF'].map(t=><span key={t} style={{ fontSize:'0.68rem', fontWeight:600, padding:'3px 9px', background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:20, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{t}</span>)}
              </div>
              <p style={{ color:'var(--text-muted)', fontSize:'0.72rem' }}>Max 50MB</p>
            </div>
            {error && <div style={{ background:'var(--accent-red-dim)', border:'1px solid #d9555540', borderRadius:10, padding:'12px 16px', color:'#d95555', fontSize:'0.85rem', maxWidth:580, width:'100%' }}>⚠ {error}</div>}
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center', animation:'fadeInUp 0.5s ease 0.2s both' }}>
              {[{icon:'📊',text:'Strength Score /100'},{icon:'🔍',text:'Risk Assessment'},{icon:'⚖',text:'Ontario Law References'},{icon:'✍',text:'AI Document Revision'},{icon:'📥',text:'PDF & Word Download'},{icon:'💬',text:'Legal AI Chat'}].map(f=>(
                <div key={f.text} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 13px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, fontSize:'0.78rem', color:'var(--text-secondary)' }}><span>{f.icon}</span>{f.text}</div>
              ))}
            </div>
            <input ref={fileInputRef} type="file" style={{ display:'none' }} accept=".pdf,.doc,.docx,.txt,.md,.rtf,.jpg,.jpeg,.png,.gif,.webp,.tiff" onChange={handleFileInput}/>
          </div>
        ) : (
          /* TWO/THREE COLUMN LAYOUT */
          <div style={{ display:'grid', gridTemplateColumns:chatOpen?'340px 1fr 380px':'340px 1fr', height:'calc(100vh - 60px)', overflow:'hidden' }}>

            {/* LEFT PANEL - File preview */}
            <div style={{ borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-secondary)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:'var(--bg-card)', border:'1px solid var(--border-mid)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>
                    {file.type==='application/pdf'?'📑':file.type.startsWith('image/')?'🖼':'📄'}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</p>
                    <p style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{(file.size/1024/1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={()=>fileInputRef.current?.click()} style={{ ...S.btn, ...S.btnGhost, fontSize:'0.72rem', padding:'6px 12px', width:'100%', justifyContent:'center' }}>↑ Upload Different Document</button>
                <input ref={fileInputRef} type="file" style={{ display:'none' }} accept=".pdf,.doc,.docx,.txt,.md,.rtf,.jpg,.jpeg,.png,.gif,.webp,.tiff" onChange={handleFileInput}/>
              </div>
              <div style={{ flex:1, overflow:'auto', padding:16 }}>
                <p style={{ fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--text-muted)', marginBottom:10 }}>Document Preview</p>
                {extractedText
                  ? <pre style={{ fontSize:'0.73rem', color:'var(--text-muted)', lineHeight:1.7, whiteSpace:'pre-wrap', fontFamily:'var(--font-body)' }}>{extractedText.substring(0,4000)}{extractedText.length>4000?'\n\n[... continues ...]':''}</pre>
                  : <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', fontStyle:'italic' }}>{isAnalyzing?'Extracting content...':'Preview not available for this file type.'}</p>
                }
              </div>
            </div>

            {/* CENTER PANEL - Analysis */}
            <div style={{ overflow:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:20 }}>
              {error && <div style={{ background:'var(--accent-red-dim)', border:'1px solid #d9555540', borderRadius:10, padding:'12px 16px', color:'#d95555', fontSize:'0.85rem' }}>⚠ {error} <button onClick={()=>setError('')} style={{ float:'right', background:'none', border:'none', color:'#d95555', cursor:'pointer' }}>✕</button></div>}

              {isAnalyzing && (
                <div style={{ ...S.card, animation:'fadeIn 0.3s ease' }}>
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--accent-gold)', animation:'pulse 1s infinite' }}/>
                    <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--accent-gold)' }}>Analyzing Document...</span>
                  </div>
                  <AnalysisSkeleton/>
                  <div style={{ padding:'0 20px 16px', display:'flex', flexDirection:'column', gap:6 }}>
                    {['Reading document structure','Identifying legal clauses','Searching Ontario legal database','Assessing risk factors','Generating score & recommendations'].map((step,i)=>(
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:8, animation:`fadeIn 0.3s ease ${i*0.3}s both` }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent-gold)', animation:'pulse 1s infinite' }}/>
                        <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis && !isAnalyzing && (
                <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'fadeInUp 0.4s ease' }}>
                  {/* Score Card */}
                  <div style={S.card}>
                    <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--text-muted)' }}>Analysis Complete</span>
                      <div style={{ display:'flex', gap:6 }}><RiskBadge level={analysis.riskLevel}/>{analysis.enforceability&&<EnforceBadge level={analysis.enforceability}/>}</div>
                    </div>
                    <div style={{ padding:20, display:'flex', gap:24, alignItems:'flex-start' }}>
                      <ScoreRing score={analysis.score}/>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--accent-gold)', background:'var(--accent-gold-dim)', border:'1px solid var(--accent-gold-glow)', borderRadius:6, padding:'3px 8px', marginBottom:8 }}>{analysis.documentType}</div>
                        <p style={{ fontSize:'0.9rem', color:'var(--text-primary)', fontWeight:500, marginBottom:6, fontFamily:'var(--font-display)', lineHeight:1.5 }}>{analysis.summary}</p>
                        <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:10 }}>{analysis.scoreExplanation}</p>
                        {analysis.jurisdiction&&<span style={{ fontSize:'0.7rem', color:'var(--text-muted)', background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:6, padding:'2px 8px' }}>📍 {analysis.jurisdiction}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Key Info Row */}
                  {(analysis.keyParties?.length>0||analysis.keyDates?.length>0||analysis.keyFinancialTerms?.length>0) && (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                      {[{label:'Parties',items:analysis.keyParties,icon:'👤'},{label:'Key Dates',items:analysis.keyDates,icon:'📅'},{label:'Financial Terms',items:analysis.keyFinancialTerms,icon:'💰'}].map(({label,items,icon})=>items?.length>0&&(
                        <div key={label} style={{ ...S.card, padding:'14px 16px' }}>
                          <p style={{ fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.12em', color:'var(--text-muted)', marginBottom:8 }}>{icon} {label}</p>
                          <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:5 }}>
                            {(items||[]).slice(0,4).map((item,i)=><li key={i} style={{ fontSize:'0.78rem', color:'var(--text-secondary)', lineHeight:1.4 }}>{item}</li>)}
                            {items?.length>4&&<li style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>+{items.length-4} more</li>}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tabs */}
                  <div style={S.card}>
                    <div style={{ display:'flex', borderBottom:'1px solid var(--border)', overflowX:'auto' }}>
                      {TABS.map(tab=>(
                        <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ padding:'12px 14px', background:'none', border:'none', cursor:'pointer', fontSize:'0.75rem', fontWeight:activeTab===tab.id?700:500, color:activeTab===tab.id?tabAccents[tab.id]:'var(--text-muted)', borderBottom:activeTab===tab.id?`2px solid ${tabAccents[tab.id]}`:'2px solid transparent', display:'flex', alignItems:'center', gap:5, transition:'all 0.2s', whiteSpace:'nowrap', fontFamily:'var(--font-body)' }}>
                          {tab.label}
                          {tab.count>0&&<span style={{ fontSize:'0.65rem', fontWeight:700, borderRadius:20, padding:'1px 6px', background:activeTab===tab.id?`${tabAccents[tab.id]}25`:'var(--bg-secondary)', color:activeTab===tab.id?tabAccents[tab.id]:'var(--text-muted)' }}>{tab.count}</span>}
                        </button>
                      ))}
                    </div>
                    <div style={{ padding:18, maxHeight:300, overflow:'auto' }}>
                      <ItemList items={tabContent[activeTab]} accent={tabAccents[activeTab]}/>
                    </div>
                  </div>

                  {/* Generate Revision */}
                  {!showRevised && (
                    <div style={{ ...S.card, padding:20, background:'linear-gradient(135deg,var(--bg-card),var(--bg-card-2))', border:'1px solid var(--accent-gold-glow)' }}>
                      <p style={{ fontSize:'0.95rem', fontFamily:'var(--font-display)', fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>Generate Revised Document</p>
                      <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:12 }}>AI will produce a fully revised version addressing all {(analysis.criticalIssues?.length||0)+(analysis.cons?.length||0)} issues identified.</p>
                      {reviseError&&<p style={{ fontSize:'0.8rem', color:'var(--accent-red)', marginBottom:10 }}>⚠ {reviseError}</p>}
                      <button onClick={generateRevision} disabled={isRevising} style={{ ...S.btn, ...S.btnPrimary, opacity:isRevising?0.7:1, cursor:isRevising?'not-allowed':'pointer' }}>
                        {isRevising?<><span style={{ display:'inline-block', animation:'spin 1s linear infinite' }}>⟳</span> Drafting Revised Document...</>:'✍ Generate Revised Document'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Revised Document */}
              {showRevised && revisedDoc && (
                <div style={{ ...S.card, animation:'fadeInUp 0.4s ease' }}>
                  <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                    <div>
                      <span style={{ fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--accent-gold)', fontWeight:700 }}>✍ Revised Document Ready</span>
                      <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>All issues addressed · Missing clauses added · Professionally reformatted</p>
                    </div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      <button onClick={copyRevised} style={{ ...S.btn, ...S.btnGhost, fontSize:'0.75rem', padding:'7px 12px' }}>{copySuccess?'✓ Copied!':'⎘ Copy'}</button>
                      <button onClick={downloadPDF} disabled={!!dlLoading} style={{ ...S.btn, background:'var(--accent-red-dim)', color:'#e05252', border:'1px solid #e0525230', fontSize:'0.75rem', padding:'7px 12px', opacity:dlLoading?0.7:1, cursor:dlLoading?'not-allowed':'pointer' }}>{dlLoading==='pdf'?'⟳ Generating...':'↓ Download PDF'}</button>
                      <button onClick={downloadDOCX} disabled={!!dlLoading} style={{ ...S.btn, background:'var(--accent-blue-dim)', color:'var(--accent-blue)', border:'1px solid #4a8cdb30', fontSize:'0.75rem', padding:'7px 12px', opacity:dlLoading?0.7:1, cursor:dlLoading?'not-allowed':'pointer' }}>{dlLoading==='docx'?'⟳ Generating...':'↓ Download Word'}</button>
                    </div>
                  </div>
                  <div style={{ padding:20, maxHeight:520, overflow:'auto' }}>
                    <pre style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.75, whiteSpace:'pre-wrap', fontFamily:'inherit' }}>{revisedDoc}</pre>
                  </div>
                  <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border)' }}>
                    <button onClick={generateRevision} disabled={isRevising} style={{ ...S.btn, ...S.btnSecondary, fontSize:'0.73rem', padding:'6px 12px' }}>{isRevising?'⟳ Re-drafting...':'↺ Regenerate'}</button>
                  </div>
                </div>
              )}

              {!analysis&&!isAnalyzing&&(
                <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', minHeight:400 }}>
                  <div style={{ textAlign:'center', color:'var(--text-muted)' }}>
                    <div style={{ fontSize:'3rem', marginBottom:12, animation:'float 3s ease-in-out infinite' }}>⚖</div>
                    <p style={{ fontSize:'0.9rem', fontFamily:'var(--font-display)' }}>Analysis will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* CHAT PANEL */}
            {chatOpen && (
              <div style={{ borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', background:'var(--bg-secondary)', animation:'slideInRight 0.3s ease' }}>
                <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#c9a84c,#e8cb6b)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem' }}>⚖</div>
                    <div>
                      <p style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--text-primary)' }}>LexAI Assistant</p>
                      <p style={{ fontSize:'0.65rem', color:'var(--accent-green)' }}>● Online — Legal AI</p>
                    </div>
                  </div>
                  <button onClick={()=>setChatMessages([chatMessages[0]])} style={{ ...S.btn, ...S.btnGhost, fontSize:'0.65rem', padding:'4px 8px' }}>Clear</button>
                </div>
                <div style={{ flex:1, overflow:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:14 }}>
                  {chatMessages.map((msg,i)=><ChatMessage key={i} msg={msg}/>)}
                  {isTyping&&(
                    <div style={{ display:'flex', gap:10, alignItems:'center', animation:'fadeIn 0.3s ease' }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#c9a84c,#e8cb6b)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem' }}>⚖</div>
                      <div style={{ background:'var(--bg-card-2)', border:'1px solid var(--border)', borderRadius:'4px 12px 12px 12px', padding:'10px 14px', display:'flex', gap:4, alignItems:'center' }}>
                        {[1,2,3].map(d=><div key={d} className="typing-dot" style={{ width:6, height:6, borderRadius:'50%', background:'var(--text-muted)' }}/>)}
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef}/>
                </div>
                {analysis&&(
                  <div style={{ padding:'8px 14px', borderTop:'1px solid var(--border)', display:'flex', gap:6, overflowX:'auto' }}>
                    {['What are the biggest risks?','Explain the critical issues','What clauses should be added?'].map(q=>(
                      <button key={q} onClick={()=>{setChatInput(q);}} style={{ ...S.btn, ...S.btnGhost, fontSize:'0.68rem', padding:'5px 10px', whiteSpace:'nowrap' }}>{q}</button>
                    ))}
                  </div>
                )}
                <div style={{ padding:'12px 14px', borderTop:'1px solid var(--border)', display:'flex', gap:8, background:'var(--bg-void)' }}>
                  <textarea value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={handleChatKey} placeholder="Ask any legal question..." disabled={isChatting} rows={2}
                    style={{ flex:1, resize:'none', background:'var(--bg-input)', border:'1px solid var(--border-mid)', borderRadius:8, padding:'8px 12px', color:'var(--text-primary)', fontSize:'0.82rem', fontFamily:'var(--font-body)', outline:'none', lineHeight:1.5 }}/>
                  <button onClick={sendChat} disabled={!chatInput.trim()||isChatting} style={{ ...S.btn, ...S.btnPrimary, padding:'8px 14px', opacity:(!chatInput.trim()||isChatting)?0.5:1, cursor:(!chatInput.trim()||isChatting)?'not-allowed':'pointer', alignSelf:'flex-end' }}>
                    {isChatting?'⟳':'→'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Chat Button */}
        {!chatOpen && file && (
          <button onClick={()=>setChatOpen(true)} style={{ position:'fixed', bottom:24, right:24, zIndex:200, width:52, height:52, borderRadius:'50%', border:'none', background:'linear-gradient(135deg,#c9a84c,#e8cb6b)', color:'#07090f', fontSize:'1.2rem', cursor:'pointer', boxShadow:'0 4px 24px rgba(201,168,76,0.4)', display:'flex', alignItems:'center', justifyContent:'center', animation:'glow 3s ease-in-out infinite' }} title="Open LexAI Chat">⚖</button>
        )}
      </div>
    </>
  );
}
