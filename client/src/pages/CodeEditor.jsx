import { useState } from 'react';
import Toolbar from '../components/Toolbar';
import LanguageSelector from '../components/LanguageSelector';
import Editor from '../components/Editor';
import { SUPPORTED_LANGUAGES, DEFAULT_CODE } from '../utils/constants';
import styles from '../styles/Editor.module.css';

// 코드 에디터 페이지. 편집·실행·저장 흐름을 다룸
export default function CodeEditor() {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [source, setSource] = useState(DEFAULT_CODE.javascript);
  const [dirty, setDirty] = useState(false);

  const ext = SUPPORTED_LANGUAGES.find((l) => l.id === language)?.ext ?? '';

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

  return (
    <div className={styles.page}>
      <Toolbar
        name={name}
        onNameChange={handleNameChange}
        extension={ext}
        language={language}
        dirty={dirty}
        onSave={() => console.log('save')}
        onRun={() => console.log('run')}
        running={false}
      />
      <div className={styles.body}>
        <LanguageSelector language={language} onSelect={setLanguage} />
        <div className={styles.main}>
          <div className={styles.editorArea}>
            <Editor
              source={source}
              language={language}
              fontSize={14}
              theme="dark"
              onChange={handleSourceChange}
            />
          </div>
          <div className={styles.terminal} />
        </div>
      </div>
    </div>
  );
}
