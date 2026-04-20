import { EditorContent, useEditor } from "@tiptap/react";
import CodeBlock from "@tiptap/extension-code-block";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { useNavigate } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
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
  attachedFiles: {
    id: string;
    name: string;
    size: number;
  }[];
  attachmentsError: string | null;
  canChangeSubject: boolean;
  canUploadAttachment: boolean;
  canDeleteNote: boolean;
  fileActionId: string | null;
  isFilesLoading: boolean;
  isUploadingAttachment: boolean;
  readingMinutes: number;
  saveError: string | null;
  saveState: "idle" | "saving" | "saved" | "error";
  selectedSubjectId: string;
  subjects: { id: string; name: string }[];
  wordsCount: number;
  onDeleteAttachment: (fileId: string) => void;
  onDownloadAttachment: (fileId: string, filename: string) => void;
  onSubjectChange: (subjectId: string) => void;
  onUploadAttachment: () => void;
  onDeleteNote: () => void;
};

function PropertiesPanel({
  attachedFiles,
  attachmentsError,
  canChangeSubject,
  canDeleteNote,
  canUploadAttachment,
  fileActionId,
  isFilesLoading,
  isUploadingAttachment,
  readingMinutes,
  saveError,
  saveState,
  selectedSubjectId,
  subjects,
  wordsCount,
  onDeleteAttachment,
  onDownloadAttachment,
  onSubjectChange,
  onUploadAttachment,
  onDeleteNote,
}: PropertiesPanelProps) {
  const saveStatusLabel =
    saveState === "saving"
      ? "Ukládám..."
      : saveState === "saved"
        ? "Uloženo"
        : saveState === "error"
          ? "Neuloženo"
          : "Koncept";

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
          disabled={!canChangeSubject}
          className="max-w-[calc(80%-3rem)] cursor-pointer rounded-md border border-[var(--border-card)] bg-[var(--card-bg)] px-2 py-1 text-right truncate text-[15px] text-[var(--color-primary)] outline-none [color-scheme:dark] disabled:cursor-not-allowed disabled:opacity-60"
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
      {!canChangeSubject ? (
        <p className="mt-2 text-sm text-[var(--text-darkgray)]">
          Po prvním uložení už předmět nejde změnit.
        </p>
      ) : null}
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
        <div className="flex items-center gap-2">
          <span className="text-[15px] text-[var(--text-semiwhite)]">{saveStatusLabel}</span>
          <span
            aria-label={saveStatusLabel}
            role="img"
            className={[
              "h-5 w-5",
              saveState === "error"
                ? "bg-red-400"
                : saveState === "saving"
                  ? "bg-[var(--text-darkgray)]"
                  : "bg-[var(--color-primary)]",
            ].join(" ")}
            style={{
              WebkitMaskImage:
                saveState === "error"
                  ? "url(/web_images/Close_MD.svg)"
                  : "url(/web_images/Cloud_Check.svg)",
              maskImage:
                saveState === "error"
                  ? "url(/web_images/Close_MD.svg)"
                  : "url(/web_images/Cloud_Check.svg)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
        </div>
      </div>
      {saveError ? (
        <p className="mt-3 text-sm text-red-400">{saveError}</p>
      ) : null}
      <h2 className="mt-7 text-lg font-medium tracking-[0.75px] text-[var(--text-darkgray)]">
        PŘÍLOHY
      </h2>
      <button
        type="button"
        onClick={onUploadAttachment}
        disabled={!canUploadAttachment || isUploadingAttachment}
        className="mt-4 flex cursor-pointer items-center gap-2 rounded-xl border border-[rgba(24,180,166,0.18)] px-3 py-2 text-left text-[15px] text-[var(--text-semiwhite)] disabled:cursor-not-allowed disabled:opacity-60"
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
        {isUploadingAttachment ? "Nahrávám..." : "Nahrát přílohu"}
      </button>
      {!canUploadAttachment ? (
        <p className="mt-3 text-sm text-[var(--text-darkgray)]">
          Přílohy lze nahrát až po prvním uložení poznámky.
        </p>
      ) : null}
      {attachmentsError ? (
        <p className="mt-3 text-sm text-red-400">{attachmentsError}</p>
      ) : null}
      {isFilesLoading ? (
        <p className="mt-3 text-sm text-[var(--text-darkgray)]">Načítám přílohy...</p>
      ) : null}
      {attachedFiles.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="rounded-xl border border-[rgba(24,180,166,0.18)] px-3 py-2"
            >
              <p className="truncate text-sm text-[var(--text-semiwhite)]">{file.name}</p>
              <p className="mt-1 text-xs text-[var(--text-darkgray)]">
                {formatFileSize(file.size)}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => onDownloadAttachment(file.id, file.name)}
                  disabled={fileActionId === file.id}
                  className="cursor-pointer text-[var(--color-primary)] disabled:opacity-50"
                >
                  Stáhnout
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteAttachment(file.id)}
                  disabled={fileActionId === file.id}
                  className="cursor-pointer text-red-400 disabled:opacity-50"
                >
                  Smazat
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : canUploadAttachment && !isFilesLoading ? (
        <p className="mt-3 text-sm text-[var(--text-darkgray)]">Zatím bez příloh.</p>
      ) : null}
      {canDeleteNote ? <div className="mt-auto pt-6" /> : null}
      {canDeleteNote ? (
        <button
          type="button"
          onClick={onDeleteNote}
          className="mt-4 flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/40 px-3 py-2 text-left text-[15px] text-red-400 justify-center content-center"
        >
          <span
            aria-hidden="true"
            className="h-5 w-5 shrink-0 bg-red-400"
            style={{
              WebkitMaskImage: "url(/web_images/Trash.svg)",
              maskImage: "url(/web_images/Trash.svg)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
          Smazat
        </button>
      ) : null}
    </>
  );
}

type ConfirmModalProps = {
  confirmLabel: string;
  confirmVariant?: "danger" | "primary";
  description: string;
  isLoading?: boolean;
  loadingLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
};

function ConfirmModal({
  confirmLabel,
  confirmVariant = "danger",
  description,
  isLoading = false,
  loadingLabel = "Mazání...",
  onCancel,
  onConfirm,
  title,
}: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] bg-[rgba(0,0,0,0.30)]"
      onClick={onCancel}
    >
      <div
        className="fixed left-[calc(3.5rem+0.75rem)] right-3 top-1/2 z-[70] w-auto -translate-y-1/2 rounded-2xl border border-[var(--border-card)] bg-[var(--card-bg-notp)] p-5 md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:w-[320px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-[var(--text-white)]">{title}</h3>
        <p className="mt-2 text-sm text-[var(--text-darkgray)]">{description}</p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-start">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="cursor-pointer rounded-lg border border-[var(--border-card)] px-3 py-1.5 text-sm text-[var(--text-semiwhite)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Zrušit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={[
              "cursor-pointer rounded-lg px-3 py-1.5 text-sm text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 font-bold",
              confirmVariant === "danger"
                ? "bg-red-500"
                : "bg-[var(--color-primary)]",
            ].join(" ")}
          >
            {isLoading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

type DashboardNewNotePageProps = {
  noteId?: string;
};

const EMPTY_EDITOR_JSON = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

function parseEditorContent(content: string) {
  if (!content.trim()) {
    return JSON.parse(EMPTY_EDITOR_JSON) as Record<string, unknown>;
  }

  try {
    const parsed = JSON.parse(content) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    // plain text/html fallback
  }

  return content;
}

function formatFileSize(size: number) {
  if (size <= 0) {
    return "0 B";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function DashboardNewNotePage({ noteId }: DashboardNewNotePageProps) {
  const navigate = useNavigate();
  const {
    subjects,
    notes,
    notesLoading,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    noteFilesByNoteId,
    filesLoadingNoteIds,
    loadFiles,
    uploadFile,
    deleteFile,
    downloadFile,
  } = useDashboardNotes();
  const [toolbarStateVersion, setToolbarStateVersion] = useState(0);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [draftName, setDraftName] = useState("");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(noteId ?? null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [attachmentsError, setAttachmentsError] = useState<string | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [fileActionId, setFileActionId] = useState<string | null>(null);
  const [pendingAttachmentDelete, setPendingAttachmentDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);
  const [isDeleteNoteConfirmOpen, setIsDeleteNoteConfirmOpen] = useState(false);
  const [isFirstNoteWarningOpen, setIsFirstNoteWarningOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isApplyingRemoteStateRef = useRef(false);
  const isSaveRequestInFlightRef = useRef(false);
  const pendingSaveAfterFlightRef = useRef(false);
  const hydratedNoteIdRef = useRef<string | null>(null);
  const hasInitializedNewDraftRef = useRef(false);
  const lastSavedDraftRef = useRef<{
    noteId: string | null;
    name: string;
    subjectId: string;
    content: string;
  }>({
    noteId: noteId ?? null,
    name: "",
    subjectId: "",
    content: EMPTY_EDITOR_JSON,
  });
  const existingNote = noteId ? getNoteById(noteId) : undefined;

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
    if (!noteId && !selectedSubjectId && subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [noteId, selectedSubjectId, subjects]);

  useEffect(() => {
    if (noteId || activeNoteId || notesLoading) {
      setIsFirstNoteWarningOpen(false);
      return;
    }

    setIsFirstNoteWarningOpen(notes.length === 0);
  }, [activeNoteId, noteId, notes.length, notesLoading]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (noteId) {
      hasInitializedNewDraftRef.current = false;

      if (!existingNote) {
        return;
      }

      if (hydratedNoteIdRef.current === noteId) {
        return;
      }

      isApplyingRemoteStateRef.current = true;
      hydratedNoteIdRef.current = noteId;
      setDraftName(existingNote.name);
      setSelectedSubjectId(existingNote.subjectId);
      setActiveNoteId(existingNote.id);
      editor.commands.setContent(parseEditorContent(existingNote.content), {
        emitUpdate: false,
      });
      lastSavedDraftRef.current = {
        noteId: existingNote.id,
        name: existingNote.name,
        subjectId: existingNote.subjectId,
        content: existingNote.content || EMPTY_EDITOR_JSON,
      };
      setSaveState("saved");
      setSaveError(null);
      queueMicrotask(() => {
        isApplyingRemoteStateRef.current = false;
      });
      return;
    }

    hydratedNoteIdRef.current = null;
    if (hasInitializedNewDraftRef.current) {
      return;
    }

    hasInitializedNewDraftRef.current = true;
    isApplyingRemoteStateRef.current = true;
    setDraftName("");
    setActiveNoteId(null);
    editor.commands.setContent(parseEditorContent(""), {
      emitUpdate: false,
    });
    lastSavedDraftRef.current = {
      noteId: null,
      name: "",
      subjectId: subjects[0]?.id ?? "",
      content: EMPTY_EDITOR_JSON,
    };
    setSaveState("idle");
    setSaveError(null);
    queueMicrotask(() => {
      isApplyingRemoteStateRef.current = false;
    });
  }, [editor, existingNote, noteId, subjects]);

  useEffect(() => {
    setAttachmentsError(null);

    if (!activeNoteId) {
      return;
    }

    void loadFiles(activeNoteId).catch((error) => {
      setAttachmentsError(
        (error as Error).message || "Nepodařilo se načíst přílohy.",
      );
    });
  }, [activeNoteId, loadFiles]);

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

  const serializedContent = useMemo(() => {
    if (!editor) {
      return EMPTY_EDITOR_JSON;
    }

    return JSON.stringify(editor.getJSON());
  }, [editor, toolbarStateVersion]);

  const wordsCount = editor?.getText().trim().split(/\s+/).filter(Boolean).length ?? 0;
  const readingMinutes = Math.max(1, Math.ceil(wordsCount / 180));
  const attachedFiles = activeNoteId ? noteFilesByNoteId[activeNoteId] ?? [] : [];
  const isFilesLoading = activeNoteId
    ? filesLoadingNoteIds.includes(activeNoteId)
    : false;
  const canChangeSubject = activeNoteId === null;
  const handleSubjectChange = (subjectId: string) => {
    if (!canChangeSubject) {
      return;
    }

    setSelectedSubjectId(subjectId);
  };

  useEffect(() => {
    if (!editor || isApplyingRemoteStateRef.current) {
      return;
    }

    const hasContent = editor.getText().trim().length > 0;
    if (!hasContent && !draftName.trim()) {
      if (!activeNoteId) {
        setSaveState("idle");
        setSaveError(null);
      }
      return;
    }

    if (!selectedSubjectId) {
      return;
    }

    if (!draftName.trim()) {
      setSaveState("error");
      setSaveError("Doplň název poznámky.");
      return;
    }

    const lastSaved = lastSavedDraftRef.current;
    if (
      lastSaved.noteId === activeNoteId &&
      lastSaved.name === draftName.trim() &&
      lastSaved.subjectId === selectedSubjectId &&
      lastSaved.content === serializedContent
    ) {
      return;
    }

    if (isSaveRequestInFlightRef.current) {
      pendingSaveAfterFlightRef.current = true;
      return;
    }

    setSaveState("saving");
    setSaveError(null);

    const timeoutId = window.setTimeout(() => {
      isSaveRequestInFlightRef.current = true;
      pendingSaveAfterFlightRef.current = false;

      void (async () => {
        try {
          if (activeNoteId) {
            const updatedNote = await updateNote(activeNoteId, {
              name: draftName.trim(),
              content: serializedContent,
            });

            lastSavedDraftRef.current = {
              noteId: updatedNote.id,
              name: updatedNote.name,
              subjectId: updatedNote.subjectId,
              content: updatedNote.content || serializedContent,
            };
            setSaveState("saved");
            return;
          }

          const createdNote = await createNote({
            name: draftName.trim(),
            subjectId: selectedSubjectId,
            content: serializedContent,
          });

          setActiveNoteId(createdNote.id);
          lastSavedDraftRef.current = {
            noteId: createdNote.id,
            name: createdNote.name,
            subjectId: createdNote.subjectId,
            content: createdNote.content || serializedContent,
          };
          setSaveState("saved");
          await navigate({
            to: "/dashboard/notes/$noteId",
            params: { noteId: createdNote.id },
            replace: true,
          });
        } catch (error) {
          setSaveState("error");
          setSaveError(
            (error as Error).message || "Nepodařilo se uložit poznámku.",
          );
        } finally {
          isSaveRequestInFlightRef.current = false;
          if (pendingSaveAfterFlightRef.current) {
            pendingSaveAfterFlightRef.current = false;
            setToolbarStateVersion((currentVersion) => currentVersion + 1);
          }
        }
      })();
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeNoteId,
    createNote,
    draftName,
    editor,
    navigate,
    selectedSubjectId,
    serializedContent,
    updateNote,
  ]);

  const handleUploadAttachment = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    event.target.value = "";

    if (!nextFile || !activeNoteId) {
      return;
    }

    setIsUploadingAttachment(true);
    setAttachmentsError(null);

    try {
      await uploadFile(activeNoteId, nextFile);
    } catch (error) {
      setAttachmentsError(
        (error as Error).message || "Nepodařilo se nahrát přílohu.",
      );
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const handleDeleteAttachment = async (fileId: string) => {
    if (!activeNoteId) {
      return;
    }

    setFileActionId(fileId);
    setAttachmentsError(null);

    try {
      await deleteFile(fileId, activeNoteId);
    } catch (error) {
      setAttachmentsError(
        (error as Error).message || "Nepodařilo se smazat přílohu.",
      );
    } finally {
      setFileActionId(null);
    }
  };

  const handleDeleteNote = async () => {
    if (!activeNoteId) {
      return;
    }

    setIsDeletingNote(true);
    setSaveError(null);

    try {
      await deleteNote(activeNoteId);
      setIsDeleteNoteConfirmOpen(false);
      await navigate({ to: "/dashboard/notes" });
    } catch (error) {
      setSaveState("error");
      setSaveError(
        (error as Error).message || "Nepodařilo se smazat poznámku.",
      );
    } finally {
      setIsDeletingNote(false);
    }
  };

  const handleDownloadAttachment = async (fileId: string, filename: string) => {
    setFileActionId(fileId);
    setAttachmentsError(null);

    try {
      await downloadFile(fileId, filename);
    } catch (error) {
      setAttachmentsError(
        (error as Error).message || "Nepodařilo se stáhnout přílohu.",
      );
    } finally {
      setFileActionId(null);
    }
  };

  if (noteId && !existingNote) {
    return (
      <div className="mx-auto w-full max-w-[1000px] pt-24 text-[var(--text-darkgray)]">
        {notesLoading ? "Načítám poznámku..." : "Poznámka nebyla nalezena."}
      </div>
    );
  }

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
                    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-transparent transition-colors duration-150 hover:bg-[rgba(255,255,255,0.04)] md:h-[34px] md:w-[34px] lg:h-9 lg:w-9",
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
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            className="w-full text-3xl font-bold text-[var(--text-white)] outline-none placeholder:text-[var(--text-darkgray)] sm:text-4xl lg:text-5xl"
          />
          <EditorContent editor={editor} className="note-editor mt-5" />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleUploadAttachment}
      />

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
              attachedFiles={attachedFiles}
              attachmentsError={attachmentsError}
              canChangeSubject={canChangeSubject}
              canDeleteNote={activeNoteId !== null}
              canUploadAttachment={activeNoteId !== null}
              fileActionId={fileActionId}
              isFilesLoading={isFilesLoading}
              isUploadingAttachment={isUploadingAttachment}
              readingMinutes={readingMinutes}
              saveError={saveError}
              saveState={saveState}
              selectedSubjectId={selectedSubjectId}
              subjects={subjects}
              wordsCount={wordsCount}
              onDeleteAttachment={(fileId) => {
                const targetFile = attachedFiles.find((file) => file.id === fileId);
                if (!targetFile) {
                  return;
                }
                setPendingAttachmentDelete({ id: targetFile.id, name: targetFile.name });
              }}
              onDownloadAttachment={handleDownloadAttachment}
              onDeleteNote={() => setIsDeleteNoteConfirmOpen(true)}
              onSubjectChange={handleSubjectChange}
              onUploadAttachment={() => fileInputRef.current?.click()}
            />
          </aside>
        </div>
      </div>

      {isMobilePanelOpen ? (
        <button
          type="button"
          onClick={() => setIsMobilePanelOpen(false)}
          className="fixed inset-0 z-20 cursor-pointer bg-black/40 md:hidden"
          aria-label="Zavřít panel"
        />
      ) : null}

      <aside className="fixed right-0 top-0 z-20 hidden h-full w-[200px] select-none flex-col border-l border-[#353535] bg-[var(--nav-bg)] px-4 pb-6 pt-5 md:flex">
        <PropertiesPanel
          attachedFiles={attachedFiles}
          attachmentsError={attachmentsError}
          canChangeSubject={canChangeSubject}
          canDeleteNote={activeNoteId !== null}
          canUploadAttachment={activeNoteId !== null}
          fileActionId={fileActionId}
          isFilesLoading={isFilesLoading}
          isUploadingAttachment={isUploadingAttachment}
          readingMinutes={readingMinutes}
          saveError={saveError}
          saveState={saveState}
          selectedSubjectId={selectedSubjectId}
          subjects={subjects}
          wordsCount={wordsCount}
          onDeleteAttachment={(fileId) => {
            const targetFile = attachedFiles.find((file) => file.id === fileId);
            if (!targetFile) {
              return;
            }
            setPendingAttachmentDelete({ id: targetFile.id, name: targetFile.name });
          }}
          onDownloadAttachment={handleDownloadAttachment}
          onDeleteNote={() => setIsDeleteNoteConfirmOpen(true)}
          onSubjectChange={handleSubjectChange}
          onUploadAttachment={() => fileInputRef.current?.click()}
        />
      </aside>

      {isFirstNoteWarningOpen ? (
        <ConfirmModal
          title="Nejdřív vyber předmět"
          description="Před začátkem si jako první vyber předmět. Jakmile se poznámka poprvé uloží, předmět už nepůjde změnit!"
          confirmLabel="Rozumím"
          confirmVariant="primary"
          loadingLabel="Potvrzuji..."
          onCancel={() => setIsFirstNoteWarningOpen(false)}
          onConfirm={() => setIsFirstNoteWarningOpen(false)}
        />
      ) : null}

      {pendingAttachmentDelete ? (
        <ConfirmModal
          title="Smazat přílohu?"
          description={`Tato akce je nevratná. Příloha "${pendingAttachmentDelete.name}" bude trvale odstraněna.`}
          confirmLabel="Smazat"
          isLoading={fileActionId === pendingAttachmentDelete.id}
          onCancel={() => {
            if (!fileActionId) {
              setPendingAttachmentDelete(null);
            }
          }}
          onConfirm={() => {
            void handleDeleteAttachment(pendingAttachmentDelete.id).finally(() => {
              setPendingAttachmentDelete(null);
            });
          }}
        />
      ) : null}

      {isDeleteNoteConfirmOpen ? (
        <ConfirmModal
          title="Smazat poznámku?"
          description={`Tato akce je nevratná. Poznámka "${draftName || "Bez názvu"}" bude trvale odstraněna.`}
          confirmLabel="Smazat"
          isLoading={isDeletingNote}
          onCancel={() => {
            if (!isDeletingNote) {
              setIsDeleteNoteConfirmOpen(false);
            }
          }}
          onConfirm={() => {
            void handleDeleteNote();
          }}
        />
      ) : null}
    </div>
  );
}
