export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', ext: 'js' },
  { id: 'python',     label: 'Python',     ext: 'py' },
  { id: 'java',       label: 'Java',       ext: 'java' },
  { id: 'typescript', label: 'TypeScript', ext: 'ts' },
  { id: 'cpp',        label: 'C++',        ext: 'cpp' },
  { id: 'go',         label: 'Go',         ext: 'go' },
  { id: 'ruby',       label: 'Ruby',       ext: 'rb' },
];

export const DEFAULT_CODE = {
  javascript: '// 여기에 코드를 작성하세요\nconsole.log("Hello, World!");',
  python: '# 여기에 코드를 작성하세요\nprint("Hello, World!")',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  typescript: '// 여기에 코드를 작성하세요\nconst message: string = "Hello, World!";\nconsole.log(message);',
  cpp: '// 여기에 코드를 작성하세요\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  go: '// 여기에 코드를 작성하세요\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
  ruby: '# 여기에 코드를 작성하세요\nputs "Hello, World!"',
};