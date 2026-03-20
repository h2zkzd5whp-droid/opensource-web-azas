export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', judge0Id: 63 },
  { id: 'python',     label: 'Python',     judge0Id: 71 },
  { id: 'java',       label: 'Java',       judge0Id: 62 },
];

export const DEFAULT_CODE = {
  javascript: '// 여기에 코드를 작성하세요\nconsole.log("Hello, World!");',
  python: '# 여기에 코드를 작성하세요\nprint("Hello, World!")',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
};