import { useState, useRef, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export const TAG_THEMES = [
  { badge: 'bg-red-500/20 text-red-400 border-red-500/30', color: '#ef4444', text: '①' },
  { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', color: '#3b82f6', text: '②' },
  { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', color: '#f59e0b', text: '③' },
  { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', color: '#10b981', text: '④' },
  { badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30', color: '#8b5cf6', text: '⑤' },
];

export default function useAiAssistant({ language}) {
  const [activeTab, setActiveTab] = useState('explain'); 
  const [aiData, setAiData] = useState({ explain: null, style: null }); 
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // 멀티 에러 제어용 코어 상태 장치
  const [selectedErrorIdx, setSelectedErrorIdx] = useState(0); // 현재 대시보드에 펼쳐진 에러 순번
  const [highlightedTag, setHighlightedTag] = useState(null);  // 클릭 활성화된 내부 태그 번호

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  // editor와 monaco 인스턴스를 onMount 시점에 함께 주입받아 ref로 보관한다.
  // 전역 window.monaco에 의존하면 F5 재마운트 시 비어 있어 데코레이션이 깨지므로 사용하지 않는다.
  const setEditorInstance = (editor, monaco) => {
    editorRef.current = editor;
    if (monaco) monacoRef.current = monaco;
  };

  const getLatestSource = () => { 
    return editorRef.current ? editorRef.current.getValue() : ''; 
  };

  const clearDecorations = () => {
    if (editorRef.current) {
      if (decorationsRef.current.length > 0) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
      if (lineHighlightRef.current.length > 0) {
        lineHighlightRef.current = editorRef.current.deltaDecorations(lineHighlightRef.current, []);
      }
    }
    setHighlightedTag(null);
  };

  useEffect(() => {
    const styleId = 'monaco-ai-gutter-multi-tags-style';
    if (document.getElementById(styleId)) return;

    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    
    let cssRules = '';
    TAG_THEMES.forEach((theme, index) => {
      const idx = index + 1;
      cssRules += `
        .ai-token-text-highlight-${idx} {
          color: ${theme.color} !important;
          font-weight: 800 !important;
          text-decoration: underline wavy ${theme.color}aa 2px !important;
          text-underline-offset: 4px !important;
        }
        .ai-gutter-tag-container-${idx} {
          position: relative !important;
        }
        .ai-gutter-tag-container-${idx}::before {
          content: "${theme.text}" !important;
          position: absolute !important;
          left: -30px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          color: ${theme.color} !important;
          font-weight: 900 !important;
          font-size: 12px !important;
          font-family: sans-serif !important;
          cursor: pointer !important;
          z-index: 10 !important;
        }
      `;
    });

    styleEl.innerHTML = cssRules;
    document.head.appendChild(styleEl);

    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current || !window.monaco || !aiData.explain?.errors) return;

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    // 현재 포커싱된 순번의 에러 단건 객체 추출
    const currentErrorObj = aiData.explain.errors[selectedErrorIdx];
    if (!currentErrorObj) return;

    const mappings = currentErrorObj.tagMappings || [];
    const newDecorations = [];

    mappings.forEach((item, index) => {
      const lineNum = item.line;
      const token = item.token;
      if (!lineNum || !token) return;

      const lineContent = model.getLineContent(lineNum) || '';
      let startCol = lineContent.indexOf(token);
      let endCol = startCol + token.length;

      if (startCol === -1) {
        startCol = 1;
        endCol = lineContent.length + 1;
      } else {
        startCol += 1;
        endCol += 1;
      }

      const themeIdx = index % TAG_THEMES.length;

      newDecorations.push({
        range: new window.monaco.Range(lineNum, startCol, lineNum, endCol),
        options: {
          inlineClassName: `ai-token-text-highlight-${themeIdx + 1}`,
          linesDecorationsClassName: `ai-gutter-tag-container-${themeIdx + 1}`,
          hoverMessage: { value: `**[태그 ${themeIdx + 1}]** '${token}' 해설 바인딩` }
        }
      });
    });

    if (currentErrorObj.errorLine) {
      editor.revealLineInCenterIfOutsideViewport(currentErrorObj.errorLine);
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [aiData.explain, selectedErrorIdx, editorReady]);

  useEffect(() => {
    if (!editorRef.current || !window.monaco || !aiData.explain?.errors) return;
    const editor = editorRef.current;

    const mouseDownDisposable = editor.onMouseDown((e) => {
      const target = e.target;
      const currentErrorObj = aiData.explain.errors[selectedErrorIdx];
      if (!target || !currentErrorObj) return;

      const mappings = currentErrorObj.tagMappings || [];
      const clickedLine = target.position?.lineNumber;
      if (!clickedLine) return;

      let matchedIdx = -1;

      const isGutterClick = target.type === window.monaco.editor.MouseTargetType.GUTTER_LINE_DECORATIONS;
      const isContentClick = target.type === window.monaco.editor.MouseTargetType.CONTENT_TEXT;

      if (isGutterClick) {
        matchedIdx = mappings.findIndex(m => m.line === clickedLine);
      } else if (isContentClick) {
        const clickedCol = target.position.column;
        matchedIdx = mappings.findIndex(m => {
          if (m.line !== clickedLine) return false;
          const model = editor.getModel();
          if (!model) return false;
          const lineContent = model.getLineContent(m.line) || '';
          const startCol = lineContent.indexOf(m.token) + 1;
          const endCol = startCol + m.token.length;
          return clickedCol >= startCol && clickedCol <= endCol;
        });
      }

      if (matchedIdx !== -1) {
        setHighlightedTag(matchedIdx + 1);
        setTimeout(() => setHighlightedTag(null), 3500);
      }
    });

    return () => {
      mouseDownDisposable.dispose();
    };
  }, [aiData.explain, selectedErrorIdx, editorReady]);

  const highlightEditorLine = (line, className) => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    editor.revealLineInCenterIfOutsideViewport(line);
    
    // decorationsRef가 아닌 lineHighlightRef를 표출하므로 태그 스티커가 소멸되지 않고 생존합니다.
    lineHighlightRef.current = editor.deltaDecorations(lineHighlightRef.current, [
      {
        range: new monacoRef.current.Range(line, 1, line, 100),
        options: { isWholeLine: true, className }
      }
    ]);
  };

  const triggerAiExplainer = async (errorLog) => {
    setAiLoading(true);
    setAiError(null); // 새로운 요청 시 이전 에러 초기화
    clearDecorations();
    setSelectedErrorIdx(0);

    try {
      const currentSource = getLatestSource();
      const data = await apiRequest('/code/ai/explain-error', {
        method: 'POST',
        body: JSON.stringify({ code: currentSource, language, errorLog }),
      });

      if (!data || !data.errors) throw new Error('AI 응답 서식이 올바르지 않습니다.');

      // 1. 에러 필터링 로직
      const filteredErrors = data.errors.filter(err => {
        const cause = err.errorCause; // err.errorCause safety load
        
        // error 키워드 파싱
        return (
          cause.includes('Error') || 
          cause.includes('Runtime') || 
          cause.includes('Traceback')
        );
      });

      setAiData(prev => ({
        ...prev, 
        explain: { ...data, errors: filteredErrors } 
      }));
      
    } catch (err) {
      setAiError(`에러 종합 진단 실패: ${err?.message || '오류 발생'}`);
    } finally {
      setAiLoading(false);
    }
  };

  const triggerStyleReviewer = async () => {
    setAiLoading(true);
    try {
      const currentSource = getLatestSource();
      const data = await apiRequest('/code/ai/analyze-style', {
        method: 'POST',
        body: JSON.stringify({ code: currentSource, language }),
      });
      if (!data || typeof data.readability !== 'number') throw new Error('AI 응답 서식이 올바르지 않습니다.');

      setAiData(prev => ({ ...prev, style: data }));

      // 에디터·monaco 인스턴스가 아직 준비되지 않았으면(예: F5 직후) 데코레이션만 건너뛴다.
      // 점수·텍스트 결과(setAiData)는 위에서 이미 반영되므로 리뷰 자체는 정상 표시된다.
      if (data.annotations && data.annotations.length > 0 && editorRef.current && monacoRef.current) {
        const newDecorations = data.annotations.map(ann => ({
          range: new monacoRef.current.Range(ann.line, 1, ann.line, 100),
          options: {
            isWholeLine: true,
            className: ann.severity === 'warning' ? 'bg-amber-500/10 border-l-4 border-amber-500' : 'bg-blue-500/10 border-l-4 border-blue-500',
          }
        }));
        lineHighlightRef.current = editorRef.current.deltaDecorations(lineHighlightRef.current, newDecorations);
      }
    } catch (err) {
      setAiError(`스타일 리뷰 실패: ${err?.message || '오류 발생'}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleTabChange = (tabId) => { setActiveTab(tabId); };

  const resetAiState = () => {
    clearDecorations();
    setAiData({ explain: null, style: null });
    setAiError(null);
    setSelectedErrorIdx(0);
  };

  return {
    activeTab, setActiveTab, handleTabChange,
    aiData, aiLoading, aiError, setAiError,
    triggerAiExplainer, triggerStyleReviewer,
    highlightEditorLine, resetAiState, setEditorInstance,
    highlightedTag, setHighlightedTag,
    selectedErrorIdx, setSelectedErrorIdx 
  };
}