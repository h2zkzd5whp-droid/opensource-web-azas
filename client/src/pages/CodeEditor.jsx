import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Toolbar from '../components/Toolbar';
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

// 파일명에서 확장자 분리. ".py" 같은 경우 base="" 방지 위해 i > 0
const splitExt = (title) => {
  if (!title) return '';
  const i = title.lastIndexOf('.');
  return i > 0 ? title.slice(0, i) : title;
};

const TERM_MIN = 80;
const TERM_MAX_MARGIN = 200;

// 코드 에디터 페이지. 편집·실행·저장 흐름을 다룸
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

  const ext = SUPPORTED_LANGUAGES.find((l) => l.id === language)?.ext ?? '';
  const editorTheme = user?.theme === 'light' ? 'light' : 'dark';
  const editorFontSize = user?.fontSize ?? 14;

  // codeId 진입 시 서버에서 로드. 403/404는 대시보드로 보냄
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

  // 파일명 변경 시 dirty 플래그 켬
  const handleNameChange = (next) => {
    setName(next);
    setDirty(true);
  };

  // 에디터 내용 변경 시 source 갱신 + dirty 플래그 켬
  const handleSourceChange = (next) => {
    setSource(next);
    setDirty(true);
  };

  // 언어 변경 = 새 코드 시작. 기존 codeId 레코드는 그대로 두고 /code로 이동
  const applyLanguageChange = useCallback((next) => {
    setLanguage(next);
    setSource(DEFAULT_CODE[next]);
    setName('');
    setDirty(false);
    if (codeId) navigate('/code', { replace: true });
  }, [codeId, navigate]);

  // 언어 선택 핸들러. dirty면 확인 모달, 아니면 즉시
  const handleLanguageSelect = (next) => {
    if (next === language) return;
    if (dirty) {
      setPendingLang(next);
      return;
    }
    applyLanguageChange(next);
  };

  const confirmLanguageChange = () => {
    if (pendingLang) applyLanguageChange(pendingLang);
    setPendingLang(null);
  };

  const cancelLanguageChange = () => setPendingLang(null);

  // 저장. 신규면 POST 후 /code/:id로 navigate, 기존이면 PUT
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

  // Ctrl/Cmd+S 글로벌 키 바인딩. 브라우저 기본 동작 차단
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

  // 모달에서 코드 선택 시 해당 페이지로 이동
  const handleLoadSelect = (id) => {
    setLoadOpen(false);
    navigate(`/code/${id}`);
  };

  // 터미널 높이 드래그 리사이즈. 핸들에서 mousedown → 윈도우 listener로 추적
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
    <div className={styles.page}>
      <ThemeApplier theme={editorTheme} />
      <Toolbar
        name={name}
        onNameChange={handleNameChange}
        extension={ext}
        dirty={dirty}
        onSave={save}
        onRun={() => run(language, source)}
        onLoad={() => setLoadOpen(true)}
        onDashboard={() => navigate('/dashboard')}
        onHome={() => navigate('/')}
        running={running}
      />
      <div className={styles.body}>
        <LanguageSelector language={language} onSelect={handleLanguageSelect} />
        <div className={styles.main}>
          <div className={styles.editorArea}>
            <Editor
              source={source}
              language={language}
              fontSize={editorFontSize}
              theme={editorTheme}
              onChange={handleSourceChange}
            />
          </div>
          <div
            className={styles.resizer}
            role="separator"
            aria-orientation="horizontal"
            onMouseDown={startResize}
          />
          <ExecutionPanel
            result={result}
            loading={running}
            error={runError}
            height={termHeight}
          />
        </div>
      </div>
      <ConfirmModal
        open={pendingLang !== null}
        title="Switch language?"
        message="Unsaved changes will be discarded. The saved record is not affected."
        confirmLabel="Switch"
        cancelLabel="Cancel"
        onConfirm={confirmLanguageChange}
        onCancel={cancelLanguageChange}
      />
      <LoadCodeModal
        open={loadOpen}
        onSelect={handleLoadSelect}
        onClose={() => setLoadOpen(false)}
      />
    </div>
  );
}
