import { EditorContent, useEditor } from "@tiptap/react";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { useDashboardNotes } from "../context/DashboardNotesContext";

const noteToolbarGroups = [
  [
    { icon: "/web_images/notes/Bold.svg", alt: "bold", type: "bold" },
    { icon: "/web_images/notes/Italic.svg", alt: "italic", type: "italic" },
    { icon: "/web_images/notes/Underline.svg", alt: "underline", type: "underline" },
    { icon: "/web_images/notes/Strikethrough.svg", alt: "strikethrough", type: "strike" },
  ],
  [
    { icon: "/web_images/notes/Text_Align_Left.svg", alt: "align left", type: "align-left" },
    { icon: "/web_images/notes/Text_Align_Center.svg", alt: "align center", type: "align-center" },
    { icon: "/web_images/notes/Text_Align_Right.svg", alt: "align right", type: "align-right" },
    { icon: "/web_images/notes/Link_Horizontal.svg", alt: "link", type: "link" },
  ],
  [
    { icon: "/web_images/notes/List_Unordered.svg", alt: "unordered list", type: "bullet-list" },
    { icon: "/web_images/notes/List_Ordered.svg", alt: "ordered list", type: "ordered-list" },
    { icon: "/web_images/notes/Double_Quotes_R.svg", alt: "quote", type: "blockquote" },
    { icon: "/web_images/notes/Code.svg", alt: "code", type: "code-block" },
  ],
] as const;

type ToolbarAction = (typeof noteToolbarGroups)[number][number]["type"];

const toolbarActionLabels: Record<ToolbarAction, string> = {
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strike: "Strike",
  "align-left": "Align Left",
  "align-center": "Align Center",
  "align-right": "Align Right",
  link: "Link",
  "bullet-list": "Bullet List",
  "ordered-list": "Ordered List",
  blockquote: "Blockquote",
  "code-block": "Code Block",
};

function detectCodeLanguage(code: string) {
  const source = code.trim();

  if (!source) {
    return "";
  }

  if (
    /^\s*using\s+[A-Z]/m.test(source) ||
    /\bnamespace\s+[A-Z]/.test(source) ||
    /\bpublic\s+(class|interface|enum|record)\b/.test(source) ||
    /\b(Console\.WriteLine|DateTime|List<|var\s+\w+\s*=)\b/.test(source)
  ) {
    return "csharp";
  }

  if (
    /^\s*(def |class |import |from |if __name__ == ["']__main__["'])/m.test(source) ||
    /\b(print|elif|lambda|None|True|False)\b/.test(source)
  ) {
    return "python";
  }

  if (
    /^\s*#!\/.*\b(bash|sh|zsh)\b/.test(source) ||
    /^\s*(echo|fi|then|elif|export|sudo|apt|npm|pnpm|yarn|cd)\b/m.test(source) ||
    /\$\{?[A-Z_][A-Z0-9_]*\}?/.test(source)
  ) {
    return "bash";
  }

  if (
    /\binterface\s+\w+/.test(source) ||
    /\btype\s+\w+\s*=/.test(source) ||
    /\b(as|implements|readonly):?\b/.test(source)
  ) {
    return "typescript";
  }

  if (
    /\b(function|const|let|var|=>|console\.log)\b/.test(source) ||
    /\b(document|window)\./.test(source)
  ) {
    return "javascript";
  }

  if (/<[a-z][\s\S]*?>/i.test(source) && /<\/[a-z]+>/i.test(source)) {
    return "html";
  }

  if (/[.#]?[a-z0-9_-]+\s*\{[\s\S]*:[\s\S]*;\s*\}/i.test(source)) {
    return "css";
  }

  if (/^\s*[\[{]/.test(source) && /"\w+"\s*:/.test(source)) {
    return "json";
  }

  if (
    /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|CREATE TABLE)\b/i.test(source)
  ) {
    return "sql";
  }

  return "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function highlightWithRegex(
  code: string,
  regex: RegExp,
  classMap: Record<string, string>,
) {
  let result = "";
  let lastIndex = 0;
  const matcher = new RegExp(regex.source, regex.flags);

  for (const match of code.matchAll(matcher)) {
    const matchIndex = match.index ?? 0;
    const groups = match.groups ?? {};
    const matchedGroupName = Object.keys(groups).find((groupName) => groups[groupName] !== undefined);

    result += escapeHtml(code.slice(lastIndex, matchIndex));

    if (matchedGroupName && classMap[matchedGroupName]) {
      result += `<span class="${classMap[matchedGroupName]}">${escapeHtml(match[0])}</span>`;
    } else {
      result += escapeHtml(match[0]);
    }

    lastIndex = matchIndex + match[0].length;
  }

  result += escapeHtml(code.slice(lastIndex));
  return result;
}

const tokenClassMap = {
  comment: "token-comment",
  string: "token-string",
  keyword: "token-keyword",
  number: "token-number",
  function: "token-function",
  variable: "token-variable",
  command: "token-command",
  tag: "token-tag",
  attr: "token-attr",
  selector: "token-selector",
  property: "token-property",
  key: "token-key",
  boolean: "token-boolean",
} as const;

const javascriptRegex =
  /(?<comment>\/\*[\s\S]*?\*\/|\/\/.*$)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(?<keyword>\b(?:async|await|break|case|catch|class|const|continue|default|delete|else|export|extends|finally|for|from|function|if|import|in|instanceof|let|new|null|return|super|switch|this|throw|try|typeof|undefined|var|while|yield)\b)|(?<number>\b\d+(?:\.\d+)?\b)|(?<function>\b[A-Za-z_$][\w$]*(?=\s*\())/gm;

const typescriptRegex =
  /(?<comment>\/\*[\s\S]*?\*\/|\/\/.*$)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(?<keyword>\b(?:abstract|any|as|async|await|boolean|break|case|catch|class|const|continue|declare|default|delete|else|enum|export|extends|false|finally|for|from|function|if|implements|import|in|infer|interface|is|keyof|let|module|namespace|never|new|null|readonly|return|string|super|switch|this|throw|true|try|type|typeof|undefined|unknown|var|void|while)\b)|(?<number>\b\d+(?:\.\d+)?\b)|(?<function>\b[A-Za-z_$][\w$]*(?=\s*\())/gm;

const pythonRegex =
  /(?<comment>#.*$)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<keyword>\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|False|finally|for|from|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield)\b)|(?<number>\b\d+(?:\.\d+)?\b)|(?<function>\b[A-Za-z_]\w*(?=\s*\())/gm;

const bashRegex =
  /(?<comment>#.*$)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<variable>\$\{?[A-Za-z_][A-Za-z0-9_]*\}?)|(?<keyword>\b(?:if|then|else|elif|fi|for|do|done|case|esac|while|in|function|export)\b)|(?<command>^(?:sudo\s+)?[A-Za-z_][\w-]*)|(?<number>\b\d+\b)/gm;

const csharpRegex =
  /(?<comment>\/\*[\s\S]*?\*\/|\/\/.*$)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<keyword>\b(?:abstract|async|await|bool|break|case|catch|class|const|decimal|default|else|enum|false|finally|float|for|foreach|if|int|interface|internal|namespace|new|null|private|protected|public|record|return|static|string|struct|switch|this|throw|true|try|using|var|void|while)\b)|(?<number>\b\d+(?:\.\d+)?\b)|(?<function>\b[A-Za-z_]\w*(?=\s*\())/gm;

const cssRegex =
  /(?<comment>\/\*[\s\S]*?\*\/)|(?<selector>^[^{\n]+(?=\s*\{))|(?<property>\b[a-z-]+(?=\s*:))|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(?<number>#(?:[0-9a-fA-F]{3,8})\b|\b\d+(?:\.\d+)?(?:px|rem|em|vh|vw|%)?\b)/gm;

const jsonRegex =
  /(?<key>"(?:\\.|[^"\\])*"(?=\s*:))|(?<string>"(?:\\.|[^"\\])*")|(?<boolean>\b(?:true|false|null)\b)|(?<number>-?\b\d+(?:\.\d+)?\b)/gm;

const sqlRegex =
  /(?<comment>--.*$|\/\*[\s\S]*?\*\/)|(?<string>'(?:\\.|[^'\\])*')|(?<keyword>\b(?:SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|GROUP BY|ORDER BY|LIMIT|AND|OR|NOT|NULL|AS|DISTINCT)\b)|(?<number>\b\d+(?:\.\d+)?\b)|(?<function>\b[A-Za-z_]\w*(?=\s*\())/gim;

function highlightHtmlCode(code: string) {
  let escaped = escapeHtml(code);
  escaped = escaped.replace(
    /(&lt;!--[\s\S]*?--&gt;)/g,
    '<span class="token-comment">$1</span>',
  );
  escaped = escaped.replace(
    /(&lt;\/?[A-Za-z][\w:-]*)/g,
    '<span class="token-tag">$1</span>',
  );
  escaped = escaped.replace(
    /(\b[A-Za-z_:][-A-Za-z0-9_:.]*)(=)/g,
    '<span class="token-attr">$1</span>$2',
  );
  escaped = escaped.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g,
    '<span class="token-string">$1</span>',
  );

  return escaped;
}

function highlightCode(code: string, language: string) {
  switch (language) {
    case "javascript":
      return highlightWithRegex(code, javascriptRegex, tokenClassMap);
    case "typescript":
      return highlightWithRegex(code, typescriptRegex, tokenClassMap);
    case "python":
      return highlightWithRegex(code, pythonRegex, tokenClassMap);
    case "bash":
      return highlightWithRegex(code, bashRegex, tokenClassMap);
    case "csharp":
      return highlightWithRegex(code, csharpRegex, tokenClassMap);
    case "html":
      return highlightHtmlCode(code);
    case "css":
      return highlightWithRegex(code, cssRegex, tokenClassMap);
    case "json":
      return highlightWithRegex(code, jsonRegex, tokenClassMap);
    case "sql":
      return highlightWithRegex(code, sqlRegex, tokenClassMap);
    default:
      return highlightWithRegex(
        code,
        /(?<comment>\/\*[\s\S]*?\*\/|\/\/.*$|#.*$)|(?<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(?<number>\b\d+(?:\.\d+)?\b)/gm,
        tokenClassMap,
      );
  }
}

const StudyDashCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ({ node }) => {
      const preElement = document.createElement("pre");
      const gutterElement = document.createElement("span");
      const syntaxElement = document.createElement("code");
      const codeElement = document.createElement("code");

      gutterElement.className = "code-block-gutter";
      gutterElement.contentEditable = "false";
      gutterElement.setAttribute("aria-hidden", "true");

      syntaxElement.className = "code-block-syntax";
      syntaxElement.contentEditable = "false";
      syntaxElement.setAttribute("aria-hidden", "true");

      codeElement.className = "code-block-input";

      const syncChrome = (currentNode: typeof node) => {
        const codeText = currentNode.textContent ?? "";
        const lineCount = Math.max(1, codeText.split("\n").length);
        const language = detectCodeLanguage(codeText);

        gutterElement.innerHTML = Array.from(
          { length: lineCount },
          (_, index) => `<span>${index + 1}</span>`,
        ).join("");
        syntaxElement.innerHTML = highlightCode(codeText, language);

        if (!gutterElement.isConnected) {
          preElement.appendChild(gutterElement);
        }

        if (!syntaxElement.isConnected) {
          preElement.appendChild(syntaxElement);
        }
      };

      preElement.appendChild(codeElement);
      syncChrome(node);

      return {
        dom: preElement,
        contentDOM: codeElement,
        update: (updatedNode) => {
          if (updatedNode.type.name !== "codeBlock") {
            return false;
          }

          syncChrome(updatedNode);
          return true;
        },
        ignoreMutation: (mutation) => {
          return mutation.target === preElement || mutation.target === gutterElement;
        },
      };
    };
  },
});

type PropertiesPanelProps = {
  readingMinutes: number;
  selectedSubjectId: string;
  subjects: { id: string; name: string }[];
  wordsCount: number;
  onSubjectChange: (subjectId: string) => void;
};

function PropertiesPanel({
  readingMinutes,
  selectedSubjectId,
  subjects,
  wordsCount,
  onSubjectChange,
}: PropertiesPanelProps) {
  return (
    <>
      <h2 className="text-lg font-medium tracking-[0.75px] text-[var(--text-darkgray)]">
        VLASTNOSTI
      </h2>
      <div className="mt-3 flex flex-row items-center justify-between gap-3">
        <p className="text-[15px] text-[var(--text-darkgray)]">Předmět:</p>
        <select
          value={selectedSubjectId}
          onChange={(event) => onSubjectChange(event.target.value)}
          className="max-w-[calc(80%-3rem)] text-right truncate bg-transparent text-[15px] text-[var(--color-primary)] outline-none"
        >
          {subjects.length === 0 ? (
            <option value="">Žádný</option>
          ) : (
            subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))
          )}
        </select>
      </div>
      <div className="mt-3 flex flex-row items-center justify-between">
        <p className="text-[15px] text-[var(--text-darkgray)]">Počet slov:</p>
        <p className="text-[15px] text-[var(--text-semiwhite)]">{wordsCount} slov</p>
      </div>
      <div className="mt-3 flex flex-row items-center justify-between">
        <p className="text-[15px] text-[var(--text-darkgray)]">Čas čtení:</p>
        <p className="text-[15px] text-[var(--text-semiwhite)]">~{readingMinutes} min</p>
      </div>
      <div className="mt-3 flex flex-row items-center justify-between">
        <p className="text-[15px] text-[var(--text-darkgray)]">Stav:</p>
        <span
          aria-label="Uloženo"
          role="img"
          className="h-5 w-5 bg-[var(--color-primary)]"
          style={{
            WebkitMaskImage: "url(/web_images/Cloud_Check.svg)",
            maskImage: "url(/web_images/Cloud_Check.svg)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
      </div>
      <h2 className="mt-7 text-lg font-medium tracking-[0.75px] text-[var(--text-darkgray)]">
        PŘÍLOHY
      </h2>
      <button
        type="button"
        className="mt-4 flex items-center gap-2 rounded-xl border border-[rgba(24,180,166,0.18)] px-3 py-2 text-left text-[15px] text-[var(--text-semiwhite)]"
      >
        <span
          aria-hidden="true"
          className="h-5 w-5 shrink-0 bg-[var(--color-primary)]"
          style={{
            WebkitMaskImage: "url(/web_images/Cloud_Upload.svg)",
            maskImage: "url(/web_images/Cloud_Upload.svg)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskSize: "contain",
            maskSize: "contain",
          }}
        />
        Nahrát přílohu
      </button>
    </>
  );
}

export function DashboardNewNotePage() {
  const { subjects } = useDashboardNotes();
  const [, setToolbarStateVersion] = useState(0);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      StudyDashCodeBlock,
      Underline,
      Placeholder.configure({
        placeholder: "Začněte psát...",
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: "<p></p>",
    editorProps: {
      attributes: {
        class: "min-h-[320px] w-full outline-none",
        spellcheck: "false",
        autocorrect: "off",
        autocapitalize: "off",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const syncToolbarState = () => {
      setToolbarStateVersion((currentVersion) => currentVersion + 1);
    };

    editor.on("selectionUpdate", syncToolbarState);
    editor.on("transaction", syncToolbarState);
    editor.on("focus", syncToolbarState);
    editor.on("blur", syncToolbarState);

    return () => {
      editor.off("selectionUpdate", syncToolbarState);
      editor.off("transaction", syncToolbarState);
      editor.off("focus", syncToolbarState);
      editor.off("blur", syncToolbarState);
    };
  }, [editor]);

  useEffect(() => {
    if (!selectedSubjectId && subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [selectedSubjectId, subjects]);

  const handleToolbarAction = (action: ToolbarAction) => {
    if (!editor) {
      return;
    }

    switch (action) {
      case "bold":
        editor.chain().focus().toggleBold().run();
        return;
      case "italic":
        editor.chain().focus().toggleItalic().run();
        return;
      case "underline":
        editor.chain().focus().toggleUnderline().run();
        return;
      case "strike":
        editor.chain().focus().toggleStrike().run();
        return;
      case "align-left":
        editor.chain().focus().setTextAlign("left").run();
        return;
      case "align-center":
        editor.chain().focus().setTextAlign("center").run();
        return;
      case "align-right":
        editor.chain().focus().setTextAlign("right").run();
        return;
      case "link": {
        const previousUrl = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("Zadej URL", previousUrl ?? "https://");

        if (url === null) {
          return;
        }

        if (!url.trim()) {
          editor.chain().focus().extendMarkRange("link").unsetLink().run();
          return;
        }

        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url.trim() })
          .run();
        return;
      }
      case "bullet-list":
        editor.chain().focus().toggleBulletList().run();
        return;
      case "ordered-list":
        editor.chain().focus().toggleOrderedList().run();
        return;
      case "blockquote":
        editor.chain().focus().toggleBlockquote().run();
        return;
      case "code-block":
        editor.chain().focus().toggleCodeBlock().run();
        return;
    }
  };

  const isToolbarActionActive = (action: ToolbarAction) => {
    if (!editor) {
      return false;
    }

    switch (action) {
      case "bold":
        return editor.isActive("bold");
      case "italic":
        return editor.isActive("italic");
      case "underline":
        return editor.isActive("underline");
      case "strike":
        return editor.isActive("strike");
      case "align-left":
        return editor.isActive({ textAlign: "left" });
      case "align-center":
        return editor.isActive({ textAlign: "center" });
      case "align-right":
        return editor.isActive({ textAlign: "right" });
      case "link":
        return editor.isActive("link");
      case "bullet-list":
        return editor.isActive("bulletList");
      case "ordered-list":
        return editor.isActive("orderedList");
      case "blockquote":
        return editor.isActive("blockquote");
      case "code-block":
        return editor.isActive("codeBlock");
    }
  };

  const wordsCount = editor?.getText().trim().split(/\s+/).filter(Boolean).length ?? 0;
  const readingMinutes = Math.max(1, Math.ceil(wordsCount / 180));

  const renderToolbar = () => (
    <>
      {noteToolbarGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="flex items-center">
          <div className="flex items-center gap-1 md:gap-[3px] lg:gap-1.5">
            {group.map((item) => (
              <div key={item.alt} className="group relative flex">
                <button
                  type="button"
                  onClick={() => handleToolbarAction(item.type)}
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-lg bg-transparent transition-colors duration-150 hover:bg-[rgba(255,255,255,0.04)] md:h-[34px] md:w-[34px] lg:h-9 lg:w-9",
                    isToolbarActionActive(item.type)
                      ? "bg-[rgba(255,255,255,0.06)]"
                      : "",
                  ].join(" ")}
                  aria-label={toolbarActionLabels[item.type]}
                  title={toolbarActionLabels[item.type]}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "h-5 w-5 md:h-6 md:w-6 lg:h-[27px] lg:w-[27px]",
                      isToolbarActionActive(item.type)
                        ? "bg-[var(--text-semiwhite)]"
                        : "bg-[var(--text-darkgray)]",
                    ].join(" ")}
                    style={{
                      WebkitMaskImage: `url(${item.icon})`,
                      maskImage: `url(${item.icon})`,
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                    }}
                  />
                </button>
                <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md border border-[rgba(24,180,166,0.18)] bg-[rgba(21,22,22,0.96)] px-2 py-1 text-xs text-[var(--text-semiwhite)] opacity-0 shadow-lg invisible transition-all duration-150 delay-[2000ms] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {toolbarActionLabels[item.type]}
                </span>
              </div>
            ))}
          </div>
          {groupIndex < noteToolbarGroups.length - 1 ? (
            <img
              src="/web_images/dot.svg"
              alt="separator"
              className="mx-1.5 h-[5px] w-[5px] opacity-60 lg:mx-2"
            />
          ) : null}
        </div>
      ))}
    </>
  );

  return (
    <div className="relative w-full">
      <div className="fixed left-[88px] right-4 top-4 z-30 md:hidden">
        <div className="flex h-11 w-fit max-w-full items-center justify-start overflow-x-auto overflow-y-hidden rounded-xl border border-[rgba(24,180,166,0.18)] bg-[var(--card-bg)] px-2">
          <div className="flex min-w-max items-center">{renderToolbar()}</div>
        </div>
      </div>

      <div className="fixed left-[96px] right-[216px] top-4 z-30 hidden md:block">
        <div className="mx-auto flex h-12 w-full max-w-[560px] items-center justify-center overflow-hidden rounded-xl border border-[rgba(24,180,166,0.18)] bg-[var(--card-bg)] px-2">
          <div className="flex items-center">{renderToolbar()}</div>
        </div>
      </div>

      <div
        className="mx-auto w-full max-w-[1000px] pb-10 pt-22 truncate sm:px-6 md:px-4 md:pr-[240px] lg:px-8 lg:pr-[240px]"
      >
        <div className="w-full min-w-0">
          <input
            type="text"
            name="nazev"
            id="nazev"
            placeholder="Název poznámky"
            spellCheck={false}
            className="w-full text-3xl font-bold text-[var(--text-white)] outline-none placeholder:text-[var(--text-darkgray)] sm:text-4xl lg:text-5xl"
          />
          <EditorContent editor={editor} className="note-editor mt-5" />
        </div>
      </div>

      <div className="fixed right-0 top-0 z-40 flex h-full w-fit items-center md:hidden">
        <button
          type="button"
          onClick={() => setIsMobilePanelOpen((currentState) => !currentState)}
          className="flex h-[45px] w-[25px] shrink-0 cursor-pointer items-center justify-center transition-all duration-150 hover:scale-105"
          aria-label={isMobilePanelOpen ? "Zavřít panel vlastností" : "Otevřít panel vlastností"}
        >
          <img
            src={isMobilePanelOpen ? "/web_images/Arrow_Right.svg" : "/web_images/Arrow_Left.svg"}
            alt=""
            className="h-[45px] w-[25px] shrink-0"
          />
        </button>

        <div
          className={[
            "h-full overflow-hidden transition-[width,opacity] duration-200 ease-in-out",
            isMobilePanelOpen ? "w-[260px] opacity-100" : "w-0 opacity-0",
          ].join(" ")}
        >
          <aside className="flex h-full w-[260px] select-none flex-col border-l border-[#353535] bg-[#151616] px-4 pb-6 pt-5">
            <PropertiesPanel
              readingMinutes={readingMinutes}
              selectedSubjectId={selectedSubjectId}
              subjects={subjects}
              wordsCount={wordsCount}
              onSubjectChange={setSelectedSubjectId}
            />
          </aside>
        </div>
      </div>

      {isMobilePanelOpen ? (
        <button
          type="button"
          onClick={() => setIsMobilePanelOpen(false)}
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          aria-label="Zavřít panel"
        />
      ) : null}

      <aside className="fixed right-0 top-0 z-20 hidden h-full w-[200px] select-none flex-col border-l border-[#353535] bg-[var(--nav-bg)] px-4 pb-6 pt-5 md:flex">
        <PropertiesPanel
          readingMinutes={readingMinutes}
          selectedSubjectId={selectedSubjectId}
          subjects={subjects}
          wordsCount={wordsCount}
          onSubjectChange={setSelectedSubjectId}
        />
      </aside>
    </div>
  );
}
