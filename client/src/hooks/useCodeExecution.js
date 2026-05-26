import { useState } from 'react';
import { apiRequest } from '../utils/api';

const ERROR_MESSAGES = {
  LANGUAGE_MISSING: 'Language is missing.',
  SOURCE_MISSING: 'Source is empty.',
  UNSUPPORTED_LANGUAGE: 'Unsupported language.',
  EXECUTION_FAILED: 'Execution failed.',
  EXECUTION_TIMEOUT: 'Execution timed out.',
};

// 코드 실행 훅. POST /api/code/run 호출 + result/loading/error 상태 보관
export default function useCodeExecution() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async (language, source) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/code/run', {
        method: 'POST',
        body: JSON.stringify({ language, source }),
      });
      setResult(data);
    } catch (err) {
      const msg = ERROR_MESSAGES[err.errorCode] || err.message || 'Execution failed.';
      setError(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, run };
}
