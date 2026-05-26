import MonacoEditor from '@monaco-editor/react';

// Monaco 에디터 래퍼. source/language/fontSize/theme 연결
export default function Editor({ source, language, fontSize, theme, onChange }) {
  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={source}
      onChange={(value) => onChange(value ?? '')}
      theme={theme === 'light' ? 'vs' : 'vs-dark'}
      options={{
        fontSize,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        tabSize: 2,
        fontFamily: "ui-monospace, 'JetBrains Mono', Consolas, monospace",
      }}
    />
  );
}
