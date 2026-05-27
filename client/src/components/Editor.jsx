import MonacoEditor from '@monaco-editor/react';

// light 모드에서 흰색 앱바/사이드와 구분이 가도록 살짝 회색을 입힌 커스텀 테마
const handleBeforeMount = (monaco) => {
  monaco.editor.defineTheme('ajas-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#f1f1ef',
    },
  });
};

// Monaco 에디터 래퍼. source/language/fontSize/theme 연결
export default function Editor({ source, language, fontSize, theme, onChange }) {
  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={source}
      onChange={(value) => onChange(value ?? '')}
      beforeMount={handleBeforeMount}
      theme={theme === 'light' ? 'ajas-light' : 'vs-dark'}
      options={{
        fontSize,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        tabSize: 2,
        padding: { top: 14, bottom: 8 },
        fontFamily: "ui-monospace, 'JetBrains Mono', Consolas, monospace",
      }}
    />
  );
}
