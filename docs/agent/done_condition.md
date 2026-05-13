# done_condition.md

## 공통 완료 조건

- [ ] 요청된 기능이 구현됐다
- [ ] 변경이 관련 문서를 따른다
- [ ] lint 통과
- [ ] typecheck 통과
- [ ] 관련 unit test 통과
- [ ] 관련 integration test 통과
- [ ] build 통과
- [ ] 관련 없는 파일이 수정되지 않았다
- [ ] 계약 변경이 있으면 문서에 반영됐다

## 작업 유형별 추가 조건

### 백엔드 API 작업

- [ ] API 응답 형식이 `api_spec.md`와 일치한다
- [ ] DB 변경이 있으면 마이그레이션 파일이 존재한다

### 프론트엔드 작업

- [ ] 디자인 초안(`design.html`)과 유사하다
- [ ] 컴포넌트 구조가 `component_structure.md`와 일치한다

### DB 스키마 작업

- [ ] 마이그레이션 파일이 존재한다
- [ ] `db_schema.md`가 업데이트됐다
