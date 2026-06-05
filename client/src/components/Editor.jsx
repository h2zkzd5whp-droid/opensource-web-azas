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

// 부모로부터 주입받을 onMount 프롭 추가
export default function Editor({ source, language, fontSize, theme, onChange, onMount }) {
  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={source}
      onChange={(value) => onChange(value ?? '')}
      beforeMount={handleBeforeMount}
      
      // 모나코 마운트 시 부모 컴포넌트로 editor 인스턴스를 올려보냄
      onMount={(editor, monaco) => {
        if (onMount) {
          onMount(editor, monaco);
        }
      }}
      
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
        glyphMargin: true, // 에러가 났을 때 좌측 여백에 빨간 점 아이콘을 띄우려면 필수
      }}
    />
  );
}
