import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export const QuestionLog = () => {
  return (
    <div className="text-center">
      <h1 className="font-sixtyfour my-5 text-4xl font-bold text-green-400 md:text-5xl">
        QUESTION LOG
      </h1>

      <div className="my-4 border-t border-green-700" />

      <div className="max-h-96 space-y-4 overflow-y-auto">
        {[
          {
            id: 1,
            code: '#include <stdio.h>\n\nint main() {\n    char str[] = "Piscine42";\n    printf("%c\\n", *(str + 4));\n    return 0;\n}',
            choices: ["P", "i", "n", "e"],
            answer: "i",
          },
          {
            id: 2,
            code: '#include <stdio.h>\n\nint main() {\n    char *s = "hello";\n    s[0] = \'H\';\n    printf("%s\\n", s);\n    return 0;\n}',
            choices: [
              "Hello",
              "hello",
              "Segmentation fault",
              "Compilation error",
            ],
            answer: "Segmentation fault",
          },
          {
            id: 3,
            code: '#include <stdio.h>\n\nvoid f() {\n    static int n = 0;\n    n++;\n    printf("%d ", n);\n}\n\nint main() {\n    f(); f(); f();\n    return 0;\n}',
            choices: ["1 1 1", "1 2 3", "0 1 2", "3 3 3"],
            answer: "1 2 3",
          },
          {
            id: 4,
            code: '#include <stdio.h>\n\nint main() {\n    int arr[5] = {1, 2, 3, 4, 5};\n    int *p = arr;\n    printf("%d\\n", *(p + 2));\n    return 0;\n}',
            choices: ["1", "2", "3", "4"],
            answer: "3",
          },
          {
            id: 5,
            code: '#include <stdio.h>\n\nint main() {\n    int a = 10;\n    int *p1 = &a;\n    int **p2 = &p1;\n    printf("%d\\n", **p2);\n    return 0;\n}',
            choices: [
              "Address of a",
              "Address of p1",
              "10",
              "Compilation error",
            ],
            answer: "10",
          },
          {
            id: 6,
            code: '#include <stdio.h>\n\nint main() {\n    int x = 5;\n    printf("%d\\n", x++);\n    return 0;\n}',
            choices: ["5", "6", "Compilation error", "Undefined behavior"],
            answer: "5",
          },
          {
            id: 7,
            code: '#include <stdio.h>\n\nint main() {\n    printf("%zu\\n", sizeof("hello!"));\n    return 0;\n}',
            choices: ["5", "6", "7", "8"],
            answer: "7",
          },
          {
            id: 8,
            code: '#include <stdio.h>\n\nint main() {\n    char s1[] = "world";\n    char *s2 = "world";\n    if (s1 == s2) {\n        printf("Same");\n    } else {\n        printf("Different");\n    }\n    return 0;\n}',
            choices: [
              "Same",
              "Different",
              "Compilation error",
              "Undefined behavior",
            ],
            answer: "Different",
          },
          {
            id: 9,
            code: '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x = 10, y = 20;\n    swap(&x, &y);\n    printf("%d %d\\n", x, y);\n    return 0;\n}',
            choices: ["10 20", "20 10", "10 10", "20 20"],
            answer: "20 10",
          },
          {
            id: 10,
            code: '#include <stdio.h>\n\nint main() {\n    int i = 0;\n    int result = i++ + ++i;\n    printf("%d\\n", result);\n    return 0;\n}',
            choices: ["0", "1", "2", "Undefined behavior"],
            answer: "Undefined behavior",
          },
        ].map((q, index) => (
          <div key={q.id} className="rounded bg-black/60 p-5 text-left">
            <div className="mb-2 font-bold text-green-400">Question {q.id}</div>
            <pre className="mb-3 overflow-x-auto text-sm text-gray-300">
              <SyntaxHighlighter
                language="c"
                style={vscDarkPlus}
                className="overflow-x-auto rounded-sm"
              >
                {q.code}
              </SyntaxHighlighter>
            </pre>
            <div className="grid grid-cols-2 gap-1 mb-2">
              {q.choices.map((choice, idx) => (
                <div key={idx} className="text-sm text-gray-400 flex items-center gap-2">
                  <span>{String.fromCharCode(65 + idx)}.</span>
                  <span>{choice}</span>
                </div>
              ))}
            </div>
            <div className="font-bold text-yellow-400">Answer: {q.answer}</div>
            {index < 9 && <div className="border-t border-green-700" />}
          </div>
        ))}
      </div>
    </div>
  );
};
