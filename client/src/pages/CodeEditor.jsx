import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LanguageSelector from '../components/LanguageSelector';
import Editor from '../components/Editor';
import ExecutionPanel from '../components/ExecutionPanel';
import ConfirmModal from '../components/ConfirmModal';
import LoadCodeModal from '../components/LoadCodeModal';
import ThemeApplier from '../components/ThemeApplier';
import useCodeExecution from '../hooks/useCodeExecution';
import useAiAssistant from '../hooks/useAiAssistant'; 
import AiSidebar from '../components/AiSidebar';       
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
  
  // 런타임 컴파일러 훅
  const { result, loading: running, error: runError, run } = useCodeExecution();

  // AI 어시스턴트 통합 제어 훅
  const {
    activeTab, setActiveTab, handleTabChange,
    aiData, aiLoading, aiError, setAiError,
    triggerAiExplainer, highlightEditorLine, applySuggestedCode,
    resetAiState, setEditorInstance,triggerStyleReviewer,triggerCodeOptimizer, 
  } = useAiAssistant({ language, setSource, setDirty });

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

  const handleExecuteAndAnalyze = async () => {
  try {
    // 1. 실행 전 에러 및 이전 로딩 상태 초기화
    setAiError(null); 

    // 2. 런타임 코드 컴파일/실행 우선 처리
    const execResult = await run(language, source);
    
    // 3. 실행 결과에서 에러 로그 추출
    const targetResult = execResult || result;
    const errorLog = runError?.message || targetResult?.stderr || targetResult?.errorLog || (targetResult?.success === false ? targetResult?.terminal : null);

    console.log('전체 AI 분석 일괄 요청 시작...');

    // 4. [핵심 변경] 3가지 AI 분석을 Promise.all로 한 번에 동시에 호출 (병렬 처리)
    // 에러 로그가 없더라도 분석이 돌 수 있도록 가짜 에러 로그(fallback) 처리
    const activeErrorLog = errorLog || '정상 실행 완료 (잠재적 에러 없음)';

    await Promise.all([
      triggerAiExplainer(activeErrorLog),
      triggerStyleReviewer(),
      triggerCodeOptimizer()
    ]);

    console.log('모든 AI 분석 결과 수신 완료. 탭을 이동하며 결과를 확인하세요.');

  } catch (err) {
    console.error('All-in-one Execution or AI Trigger failed:', err);
    setAiError(err?.message || '통합 실행 중 오류가 발생했습니다.');
  }
};

  const handleNameChange = (next) => { setName(next); setDirty(true); };
  const handleSourceChange = (next) => { setSource(next); setDirty(true); };

  const applyLanguageChange = useCallback((next) => {
    setLanguage(next);
    setSource(DEFAULT_CODE[next]);
    setName('');
    setDirty(false);
    resetAiState(); 
    if (codeId) navigate('/code', { replace: true });
  }, [codeId, navigate, resetAiState]);

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

  const dragRef = useRef(null);
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
  }, []);

  return (
    <div className={styles.page} style={{ display: 'flex', flexDirection: 'column', height: '100vh',width: '100vw', overflow: 'hidden' }}>
      <ThemeApplier theme={editorTheme} />
      <Navbar
        editor
        name={name}
        onNameChange={handleNameChange}
        ext={ext}
        dirty={dirty}
        onSave={save}
        onRun={handleExecuteAndAnalyze} // 새로 통합한 핸들러 연결
        onLoad={() => setLoadOpen(true)}
        running={running}
        activeTab={activeTab}
      />
      
      <div className={styles.body} style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        <LanguageSelector language={language} onSelect={handleLanguageSelect} />
        
        {/* [왼쪽 영역]: 코드 에디터 + 하단 실행 터미널 패널 */}
        <div className={styles.main} style={{ flex: '0 0 70%', display: 'flex', flexDirection: 'column', minWidth: 0, borderRight: '1px solid #27272a' }}>
          <div className={styles.editorArea} style={{ flex: 1, minHeight: 0 }}>
            <Editor
              source={source}
              language={language}
              fontSize={editorFontSize}
              theme={editorTheme}
              onChange={handleSourceChange}
              onMount={(editor) => setEditorInstance(editor)} 
            />
          </div>
          <div className={styles.resizer} role="separator" aria-orientation="horizontal" onMouseDown={startResize} />
          <ExecutionPanel result={result} loading={running} error={runError} height={termHeight} />
        </div>

        {/* [오른쪽 영역]: 30% 비율로 항시 상주하는 AI 분석 및 가이드 대시보드 컴포넌트 */}
        <div style={{ flex: '0 0 27%', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative',overflow: 'hidden'}}>
          {/*기존에 꼼수로 공중에 띄워져 있던 button 태그 삭제 완료 */}
          <AiSidebar 
            isOpen={true} 
            activeTab={activeTab}
            onTabChange={handleTabChange}
            aiData={aiData}
            aiLoading={aiLoading}
            aiError={aiError}
            setAiError={setAiError}
            applySuggestedCode={applySuggestedCode}
            highlightEditorLine={highlightEditorLine}
          />
        </div>
      </div>

      <ConfirmModal open={pendingLang !== null} title="Switch language?" message="Unsaved changes will be discarded. The saved record is not affected." confirmLabel="Switch" cancelLabel="Cancel" onConfirm={confirmLanguageChange} onCancel={cancelLanguageChange} />
      <LoadCodeModal open={loadOpen} onSelect={handleLoadSelect} onClose={() => setLoadOpen(false)} />
      <style>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
    </div>
  );
}