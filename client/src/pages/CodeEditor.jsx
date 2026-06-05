import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import LanguageSelector from '../components/LanguageSelector';
import Editor from '../components/Editor';
import ExecutionPanel from '../components/ExecutionPanel';
import ConfirmModal from '../components/ConfirmModal';
import LoadCodeModal from '../components/LoadCodeModal';
import ThemeApplier from '../components/ThemeApplier';
import useCodeExecution from '../hooks/useCodeExecution';
import { useAuth } from '../contexts/AuthContext';
import { SUPPORTED_LANGUAGES, DEFAULT_CODE } from '../utils/constants';
import { apiRequest } from '../utils/api';
import styles from '../styles/Editor.module.css';

const splitExt = (title) => {
  if (!title) return '';
  const i = title.lastIndexOf('.');
  return i > 0 ? title.slice(0, i) : title;
};

const TERM_MIN = 80;
const TERM_MAX_MARGIN = 200;

const TAG_THEMES = [
  { badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
];

export default function CodeEditor() {
  const { codeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [source, setSource] = useState(DEFAULT_CODE.javascript);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingLang, setPendingLang] = useState(null);
  const [loadOpen, setLoadOpen] = useState(false);
  const [termHeight, setTermHeight] = useState(220);
  const { result, loading: running, error: runError, run } = useCodeExecution();

  // AI 관련 상태 패턴 확장
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('explain'); // 'explain' | 'style' | 'optimize'
  const [aiData, setAiData] = useState({ explain: null, style: null, optimize: null });
  const [aiLoading, setAiLoading] = useState(false);

  const editorRef = useRef(null);
  const decorationsRef = useRef([]);
  const dragRef = useRef(null);

  const ext = SUPPORTED_LANGUAGES.find((l) => l.id === language)?.ext ?? '';
  const editorTheme = user?.theme === 'light' ? 'light' : 'dark';
  const editorFontSize = user?.fontSize ?? 14;

  useEffect(() => {
    if (!codeId) return;
    let active = true;
    apiRequest(`/code/${codeId}`)
      .then((data) => {
        if (!active) return;
        setLanguage(data.language);
        setSource(data.source);
        setName(splitExt(data.title));
        setDirty(false);
      })
      .catch((err) => {
        if (!active) return;
        if (err.errorCode === 'FORBIDDEN' || err.errorCode === 'NOT_FOUND') {
          navigate('/dashboard');
        } else {
          console.error('Load failed:', err);
        }
      });
    return () => { active = false; };
  }, [codeId, navigate]);

  //실행 에러 모니터링 자동 감지 트리거
  useEffect(() => {
    const hasError = runError || (result && result.success === false);
    const log = runError?.message || result?.terminal || result?.errorLog;

    if (hasError && log) {
      setActiveTab('explain');
      triggerAiExplainer(log);
    }
  }, [result, runError]);

  // 에러 해설 기능 호출 
  const triggerAiExplainer = async (errorLog) => {
    setAiLoading(true);
    setIsSidebarOpen(true);
    clearDecorations();

    try {
      const data = await apiRequest('/code/ai/explain-error', {
        method: 'POST',
        body: JSON.stringify({ code: source, language, errorLog }),
      });
      
      setAiData(prev => ({ ...prev, explain: data }));

      if (editorRef.current && data.line) {
        highlightEditorLine(data.line, 'bg-red-500/10 border-l-4 border-red-500');
      }
    } catch (err) {
      console.error('AI Explain failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  //스타일 가이드 리뷰 호출
  const triggerStyleReviewer = async () => {
    setAiLoading(true);
    setIsSidebarOpen(true);
    clearDecorations();

    try {
      const data = await apiRequest('/code/ai/analyze-style', {
        method: 'POST',
        body: JSON.stringify({ code: source, language }),
      });
      
      setAiData(prev => ({ ...prev, style: data }));

      // 스타일 위반 라인들에 다중 하이라이트 인덱싱 주입
      if (editorRef.current && data.annotations?.length > 0) {
        const editor = editorRef.current;
        const newDecorations = data.annotations.map(ann => ({
          range: new window.monaco.Range(ann.line, 1, ann.line, 100),
          options: {
            isWholeLine: true,
            className: ann.severity === 'warning' ? 'bg-amber-500/10 border-l-4 border-amber-500' : 'bg-blue-500/10 border-l-4 border-blue-500',
          }
        }));
        decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
      }
    } catch (err) {
      console.error('AI Style Review failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  //코드 최적화 알고리즘 분석 호출
  const triggerCodeOptimizer = async () => {
    setAiLoading(true);
    setIsSidebarOpen(true);
    clearDecorations();

    try {
      const data = await apiRequest('/code/ai/optimize', {
        method: 'POST',
        body: JSON.stringify({ code: source, language }),
      });
      
      setAiData(prev => ({ ...prev, optimize: data }));
    } catch (err) {
      console.error('AI Optimization failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // 에디터 특정 라인 이동 및 단일 데코레이션 헬퍼
  const highlightEditorLine = (line, className) => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    editor.revealLineInCenterIfOutsideViewport(line);
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
      {
        range: new window.monaco.Range(line, 1, line, 100),
        options: { isWholeLine: true, className, glyphMarginClassName: 'bg-red-500 rounded-full' }
      }
    ]);
  };

  const clearDecorations = () => {
    if (editorRef.current && decorationsRef.current.length > 0) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  };

  const applySuggestedCode = (fixedCode) => {
    if (editorRef.current && fixedCode) {
      editorRef.current.setValue(fixedCode);
      setSource(fixedCode);
      setDirty(true);
    }
  };

  const renderParsedExplanation = (text) => {
    if (!text) return null;
    const regex = /(\[TAG:\d+\])/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.match(/^\[TAG:(\d+)\]$/)) {
        const tagNum = parseInt(part.match(/\d+/)[0], 10);
        const theme = TAG_THEMES[(tagNum - 1) % TAG_THEMES.length];
        return (
          <span key={index} className={`inline-block px-1.5 py-0.5 mx-1 text-xs font-bold rounded border ${theme.badge}`}>
            태그 {tagNum}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleNameChange = (next) => { setName(next); setDirty(true); };
  const handleSourceChange = (next) => { setSource(next); setDirty(true); };

  const applyLanguageChange = useCallback((next) => {
    setLanguage(next);
    setSource(DEFAULT_CODE[next]);
    setName('');
    setDirty(false);
    clearDecorations();
    setAiData({ explain: null, style: null, optimize: null });
    setIsSidebarOpen(false);
    if (codeId) navigate('/code', { replace: true });
  }, [codeId, navigate]);

  const handleLanguageSelect = (next) => {
    if (next === language) return;
    if (dirty) { setPendingLang(next); return; }
    applyLanguageChange(next);
  };

  const confirmLanguageChange = () => {
    if (pendingLang) applyLanguageChange(pendingLang);
    setPendingLang(null);
  };
  const cancelLanguageChange = () => setPendingLang(null);

  const save = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    const title = `${name || 'Untitled'}.${ext}`;
    try {
      if (codeId) {
        await apiRequest(`/code/${codeId}`, {
          method: 'PUT',
          body: JSON.stringify({ title, language, source }),
        });
        setDirty(false);
      } else {
        const data = await apiRequest('/code', {
          method: 'POST',
          body: JSON.stringify({ title, language, source }),
        });
        setDirty(false);
        navigate(`/code/${data.codeId}`, { replace: true });
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [codeId, name, ext, language, source, saving, navigate]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const handleLoadSelect = (id) => { setLoadOpen(false); navigate(`/code/${id}`); };

  const startResize = (e) => {
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startHeight: termHeight };
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;
      const dy = e.clientY - dragRef.current.startY;
      const max = window.innerHeight - TERM_MAX_MARGIN;
      const next = Math.max(TERM_MIN, Math.min(max, dragRef.current.startHeight - dy));
      setTermHeight(next);
    };
    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [termHeight]);

  return (
    <div className={styles.page} style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <ThemeApplier theme={editorTheme} />
      <Navbar
        editor
        name={name}
        onNameChange={handleNameChange}
        ext={ext}
        dirty={dirty}
        onSave={save}
        onRun={() => run(language, source)}
        onLoad={() => setLoadOpen(true)}
        running={running}
      />
      
      <div className={styles.body} style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        <LanguageSelector language={language} onSelect={handleLanguageSelect} />
        
        {/* 메인 에디터 및 하단 콘솔 배치 */}
        <div className={styles.main} style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className={styles.editorArea} style={{ flex: 1, minHeight: 0 }}>
            <Editor
              source={source}
              language={language}
              fontSize={editorFontSize}
              theme={editorTheme}
              onChange={handleSourceChange}
              onMount={(editor) => { editorRef.current = editor; }}
            />
          </div>
          <div className={styles.resizer} role="separator" aria-orientation="horizontal" onMouseDown={startResize} />
          <ExecutionPanel result={result} loading={running} error={runError} height={termHeight} />
        </div>

        {/*복합 AI 분석 도우미 탭 기능 탑재 사이드바 */}
        <div style={{ display: 'flex', height: '100%' }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              position: 'absolute', right: isSidebarOpen ? '400px' : '0px', top: '16px',
              width: '32px', height: '40px', backgroundColor: '#27272a', color: '#a1a1aa',
              border: '1px solid #3f3f46', borderRight: 'none', borderRadius: '6px 0 0 6px',
              zIndex: 50, transition: 'right 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', cursor: 'pointer'
            }}
          >
            {isSidebarOpen ? '➔' : '🧠'}
          </button>

          <AnimatePresence initial={false}>
            {isSidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 190 }}
                style={{
                  height: '100%', backgroundColor: '#18181b', borderLeft: '1px solid #27272a',
                  display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 25px -5px rgba(0,0,0,0.5)',
                  overflow: 'hidden', color: '#f4f4f5'
                }}
              >
                {/* 탭 헤더 컨트롤러 */}
                <div style={{ display: 'flex', borderBottom: '1px solid #27272a', backgroundColor: '#111113' }}>
                  <button onClick={() => setActiveTab('explain')} style={{ flex: 1, padding: '12px 4px', fontSize: '12px', fontWeight: 600, color: activeTab === 'explain' ? '#818cf8' : '#71717a', borderBottom: activeTab === 'explain' ? '2px solid #6366f1' : 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>에러 분석</button>
                  <button onClick={() => { setActiveTab('style'); if(!aiData.style) triggerStyleReviewer(); }} style={{ flex: 1, padding: '12px 4px', fontSize: '12px', fontWeight: 600, color: activeTab === 'style' ? '#818cf8' : '#71717a', borderBottom: activeTab === 'style' ? '2px solid #6366f1' : 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>스타일 리뷰</button>
                  <button onClick={() => { setActiveTab('optimize'); if(!aiData.optimize) triggerCodeOptimizer(); }} style={{ flex: 1, padding: '12px 4px', fontSize: '12px', fontWeight: 600, color: activeTab === 'optimize' ? '#818cf8' : '#71717a', borderBottom: activeTab === 'optimize' ? '2px solid #6366f1' : 'none', backgroundColor: 'transparent', cursor: 'pointer' }}>코드 최적화</button>
                </div>

                {/* 메인 피드백 뷰포트 패널 */}
                <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {aiLoading ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#71717a' }}>
                      <div style={{ width: '24px', height: '24px', border: '3px solid #3f3f46', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      <p style={{ fontSize: '12px' }}>Gemini 인공지능 분석 중...</p>
                    </div>
                  ) : (
                    <>
                      {/* [1] 에러 해설 패널 */}
                      {activeTab === 'explain' && (
                        aiData.explain ? (
                          <>
                            <div style={{ backgroundColor: 'rgba(127,29,29,0.15)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px' }}>
                              <h4 style={{ fontSize: '11px', color: '#f87171', fontWeight: 700, marginBottom: '6px' }}>LINE {aiData.explain.line} 컴파일 실패 원인</h4>
                              <p style={{ fontSize: '13px', color: '#e4e4e7', lineHeight: 1.5 }}>{aiData.explain.errorCause}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <h4 style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 700 }}>입체 추적 도우미 가이드</h4>
                              <div style={{ fontSize: '13px', color: '#d4d4d8', lineHeight: '1.7', whiteSpace: 'pre-wrap', backgroundColor: '#09090b', padding: '14px', borderRadius: '12px', border: '1px solid #27272a' }}>
                                {renderParsedExplanation(aiData.explain.explanation)}
                              </div>
                            </div>
                            <button onClick={() => applySuggestedCode(aiData.explain.fixedCode)} style={{ width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: 'auto' }}>🎯 정답 코드 에디터에 반영</button>
                          </>
                        ) : (
                          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#52525b', fontSize: '12px', textAlign: 'center' }}>런타임/컴파일 에러가 비어있습니다.</div>
                        )
                      )}

                      {/* [2] 스타일 리뷰 패널 */}
                      {activeTab === 'style' && (
                        aiData.style ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ backgroundColor: '#1e1b4b', padding: '16px', borderRadius: '12px', border: '1px solid #312e81', textAlign: 'center' }}>
                              <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 700 }}>종합 서식 품질 점수</div>
                              <div style={{ fontSize: '32px', fontWeight: 800, color: '#818cf8', marginTop: '4px' }}>{aiData.style.score} / 100</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <h4 style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 700 }}>라인별 상세 개선 피드백</h4>
                              {aiData.style.annotations?.map((ann, idx) => (
                                <div key={idx} onClick={() => highlightEditorLine(ann.line, 'bg-amber-500/10 border-l-4 border-amber-500')} style={{ padding: '12px', backgroundColor: '#09090b', borderRadius: '8px', border: '1px solid #27272a', cursor: 'pointer' }}>
                                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8' }}>Line {ann.line}</span>
                                    <span style={{ fontSize: '10px', px: '1.5', py: '0.5', borderRadius: '4px', backgroundColor: ann.severity === 'warning' ? '#78350f' : '#1e3a8a', color: ann.severity === 'warning' ? '#f59e0b' : '#3b82f6', marginLeft: 'auto' }}>{ann.severity}</span>
                                  </div>
                                  <p style={{ fontSize: '12.5px', color: '#e4e4e7', lineHeight: 1.4 }}>{ann.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null
                      )}

                      {/* [3] 코드 최적화 패널 */}
                      {activeTab === 'optimize' && (
                        aiData.optimize ? (
                          <>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <div style={{ flex: 1, backgroundColor: '#27272a/40', padding: '10px', borderRadius: '8px', border: '1px solid #27272a', textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', color: '#a1a1aa' }}>현재 시간/공간 복잡도</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f87171', marginTop: '2px' }}>{aiData.optimize.currentComplexity}</div>
                              </div>
                              <div style={{ flex: 1, backgroundColor: '#27272a/40', padding: '10px', borderRadius: '8px', border: '1px solid #27272a', textAlign: 'center' }}>
                                <div style={{ fontSize: '10px', color: '#a1a1aa' }}>최적화 후 복잡도</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80', marginTop: '2px' }}>{aiData.optimize.optimizedComplexity}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <h4 style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 700 }}>리팩토링 변경 핵심 내역</h4>
                              <div style={{ fontSize: '13px', color: '#d4d4d8', lineHeight: '1.6', backgroundColor: '#09090b', padding: '14px', borderRadius: '12px', border: '1px solid #27272a', whiteSpace: 'pre-wrap' }}>
                                {aiData.optimize.description}
                              </div>
                            </div>
                            <button onClick={() => applySuggestedCode(aiData.optimize.optimizedCode)} style={{ width: '100%', padding: '12px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: 'auto' }}>🚀 최적화된 알고리즘 코드 전면 반영</button>
                          </>
                        ) : null
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmModal open={pendingLang !== null} title="Switch language?" message="Unsaved changes will be discarded. The saved record is not affected." confirmLabel="Switch" cancelLabel="Cancel" onConfirm={confirmLanguageChange} onCancel={cancelLanguageChange} />
      <LoadCodeModal open={loadOpen} onSelect={handleLoadSelect} onClose={() => setLoadOpen(false)} />
      <style>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
    </div>
  );
}