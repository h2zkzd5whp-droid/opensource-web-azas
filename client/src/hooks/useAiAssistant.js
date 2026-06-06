import { useState, useRef } from 'react';
import { apiRequest } from '../utils/api';

export const TAG_THEMES = [
  { badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
];

export default function useAiAssistant({ language, setSource, setDirty }) {
  const [activeTab, setActiveTab] = useState('explain'); // 'explain' | 'style' | 'optimize'
  const [aiData, setAiData] = useState({ explain: null, style: null, optimize: null });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  const setEditorInstance = (editor) => {
    editorRef.current = editor;
  };

  const getLatestSource = () => {
    return editorRef.current ? editorRef.current.getValue() : '';
  };

  const clearDecorations = () => {
    if (editorRef.current && decorationsRef.current.length > 0) {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  };

  const highlightEditorLine = (line, className) => {
    if (!editorRef.current || !window.monaco) return;
    const editor = editorRef.current;
    editor.revealLineInCenterIfOutsideViewport(line);
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
      {
        range: new window.monaco.Range(line, 1, line, 100),
        options: { isWholeLine: true, className }
      }
    ]);
  };

  const applySuggestedCode = (fixedCode) => {
    if (editorRef.current && fixedCode) {
      editorRef.current.setValue(fixedCode);
      setSource(fixedCode);
      setDirty(true);
    }
  };

  // [MODEL 1] 에러 해설 모델
  const triggerAiExplainer = async (errorLog) => {
    setAiLoading(true);
    clearDecorations();

    try {
      const currentSource = getLatestSource();
      const data = await apiRequest('/code/ai/explain-error', {
        method: 'POST',
        body: JSON.stringify({ code: currentSource, language, errorLog }),
      });
      if (!data || !data.errorCause) throw new Error('AI 응답 서식이 올바르지 않습니다.');
      
      setAiData(prev => ({ ...prev, explain: data }));
      if (data.line) {
        highlightEditorLine(data.line, 'bg-red-500/10 border-l-4 border-red-500');
      }
    } catch (err) {
      setAiError(`에러 해설 실패: ${err?.message || '오류 발생'}`);
    } finally {
      setAiLoading(false);
    }
  };

  // [MODEL 2] 스타일 리뷰 모델
  const triggerStyleReviewer = async () => {
    setAiLoading(true);
    try {
      const currentSource = getLatestSource();
      const data = await apiRequest('/code/ai/analyze-style', {
        method: 'POST',
        body: JSON.stringify({ code: currentSource, language }),
      });
      if (!data || typeof data.score !== 'number') throw new Error('AI 응답 서식이 올바르지 않습니다.');

      setAiData(prev => ({ ...prev, style: data }));

      if (data.annotations?.length > 0 && window.monaco) {
        const newDecorations = data.annotations.map(ann => ({
          range: new window.monaco.Range(ann.line, 1, ann.line, 100),
          options: {
            isWholeLine: true,
            className: ann.severity === 'warning' ? 'bg-amber-500/10 border-l-4 border-amber-500' : 'bg-blue-500/10 border-l-4 border-blue-500',
          }
        }));
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
      }
    } catch (err) {
      setAiError(`스타일 리뷰 실패: ${err?.message || '오류 발생'}`);
    } finally {
      setAiLoading(false);
    }
  };

  // [MODEL 3] 알고리즘 최적화 모델
  const triggerCodeOptimizer = async () => {
    setAiLoading(true);
    try {
      const currentSource = getLatestSource();
      const data = await apiRequest('/code/ai/optimize', {
        method: 'POST',
        body: JSON.stringify({ code: currentSource, language }),
      });
      if (!data || !data.optimizedCode) throw new Error('AI 응답 서식이 올바르지 않습니다.');

      setAiData(prev => ({ ...prev, optimize: data }));
    } catch (err) {
      setAiError(`알고리즘 최적화 실패: ${err?.message || '오류 발생'}`);
    } finally {
      setAiLoading(false);
    }
  };

  // 이제 탭을 바꿀 땐 순수하게 activeTab 상태만 변경합니다. (무한 튕김 차단)
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const resetAiState = () => {
    clearDecorations();
    setAiData({ explain: null, style: null, optimize: null });
    setAiError(null);
  };

  return {
    activeTab, setActiveTab, handleTabChange,
    aiData, aiLoading, aiError, setAiError,
    triggerAiExplainer, triggerStyleReviewer, triggerCodeOptimizer,
    highlightEditorLine, applySuggestedCode, resetAiState, setEditorInstance
  };
}