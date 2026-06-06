import { SUPPORTED_LANGUAGES, DEFAULT_CODE } from '../utils/constants';
import { LANG_ICONS } from '../utils/languageIcons.jsx';

// 지원 언어 목록과 보조 매핑(기본 코드·아이콘)이 어긋나지 않도록 강제하는 회귀 테스트.
// 새 언어 추가 시 한 곳만 채우고 나머지를 빠뜨리면 여기서 실패한다.

const EXPECTED_IDS = ['javascript', 'python', 'java', 'typescript', 'cpp', 'go', 'ruby'];

describe('supported languages — registry consistency', () => {
  test('모든 기대 언어가 SUPPORTED_LANGUAGES에 존재한다', () => {
    const ids = SUPPORTED_LANGUAGES.map((l) => l.id);
    for (const id of EXPECTED_IDS) {
      expect(ids).toContain(id);
    }
  });

  test('각 언어는 id·label·ext를 갖는다', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(lang.id).toBeTruthy();
      expect(lang.label).toBeTruthy();
      expect(lang.ext).toBeTruthy();
    }
  });

  test('각 언어는 DEFAULT_CODE 시작 코드를 갖는다', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(typeof DEFAULT_CODE[lang.id]).toBe('string');
      expect(DEFAULT_CODE[lang.id].length).toBeGreaterThan(0);
    }
  });

  test('각 언어는 LANG_ICONS 아이콘 컴포넌트를 갖는다', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(typeof LANG_ICONS[lang.id]).toBe('function');
    }
  });
});
