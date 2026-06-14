import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useAiAssistant from '../hooks/useAiAssistant';

vi.mock('../utils/api', () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from '../utils/api';

// Minimal fakes for the Monaco editor + monaco namespace.
// The real instances are injected via setEditorInstance(editor, monaco) at onMount time.
function makeFakeMonaco() {
  // Range is the only monaco member the hook touches.
  return {
    Range: vi.fn(function Range(sl, sc, el, ec) {
      this.startLineNumber = sl;
      this.startColumn = sc;
      this.endLineNumber = el;
      this.endColumn = ec;
    }),
  };
}

function makeFakeEditor() {
  return {
    getValue: vi.fn(() => 'const a = 1;'),
    deltaDecorations: vi.fn(() => ['dec-id']),
    revealLineInCenterIfOutsideViewport: vi.fn(),
  };
}

const hookArgs = () => ({
  language: 'javascript',
  setSource: vi.fn(),
  setDirty: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
  // Ensure the unreliable global is absent — the bug surfaced exactly when
  // window.monaco was undefined after an F5 remount.
  delete window.monaco;
});

describe('useAiAssistant — monaco instance injection (no window.monaco global)', () => {
  test('triggerStyleReviewer draws decorations using the injected monaco, not window.monaco', async () => {
    const editor = makeFakeEditor();
    const monaco = makeFakeMonaco();

    apiRequest.mockResolvedValueOnce({
      readability: 80,
      performance: 70,
      maintainability: 75,
      safety: 90,
      annotations: [{ line: 1, severity: 'warning' }],
    });

    const { result } = renderHook(() => useAiAssistant(hookArgs()));

    act(() => {
      result.current.setEditorInstance(editor, monaco);
    });

    await act(async () => {
      await result.current.triggerStyleReviewer();
    });

    // No error must be surfaced even though window.monaco is undefined.
    expect(result.current.aiError).toBeNull();
    expect(result.current.aiData.style).toMatchObject({ readability: 80 });
    // Decoration must be built from the injected monaco's Range.
    expect(monaco.Range).toHaveBeenCalledWith(1, 1, 1, 100);
    expect(editor.deltaDecorations).toHaveBeenCalled();
  });

  test('triggerStyleReviewer does not throw when monaco is not injected yet (still returns score data)', async () => {
    apiRequest.mockResolvedValueOnce({
      readability: 60,
      performance: 60,
      maintainability: 60,
      safety: 60,
      annotations: [{ line: 2, severity: 'info' }],
    });

    const { result } = renderHook(() => useAiAssistant(hookArgs()));

    // No setEditorInstance call — instance not ready.
    await act(async () => {
      await result.current.triggerStyleReviewer();
    });

    expect(result.current.aiError).toBeNull();
    expect(result.current.aiData.style).toMatchObject({ readability: 60 });
  });

  test('highlightEditorLine uses the injected monaco instance', () => {
    const editor = makeFakeEditor();
    const monaco = makeFakeMonaco();

    const { result } = renderHook(() => useAiAssistant(hookArgs()));

    act(() => {
      result.current.setEditorInstance(editor, monaco);
    });

    act(() => {
      result.current.highlightEditorLine(3, 'cls');
    });

    expect(editor.revealLineInCenterIfOutsideViewport).toHaveBeenCalledWith(3);
    expect(monaco.Range).toHaveBeenCalledWith(3, 1, 3, 100);
    expect(editor.deltaDecorations).toHaveBeenCalled();
  });
});
