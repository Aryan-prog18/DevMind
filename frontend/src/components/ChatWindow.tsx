import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatWindowProps {
  sessionId: string;
  isRepositoryReady: boolean;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  answer?: string;
  detail?: string;
}

const SparkleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-6 w-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m12 3 1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Zm6.5 12 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z"
    />
  </svg>
);

export default function ChatWindow({
  sessionId,
  isRepositoryReady,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  async function typeMessage(text: string) {
  let current = "";

  setMessages((prev) => [
    ...prev,
    {
      role: "assistant",
      content: "",
    },
  ]);

  for (const char of text) {
    current += char;

    setMessages((prev) => {
      const updated = [...prev];

      updated[updated.length - 1] = {
        role: "assistant",
        content: current,
      };

      return updated;
    });

    await new Promise((resolve) => setTimeout(resolve, 8));
  }
}

  async function sendMessage() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isThinking || !isRepositoryReady) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmedQuestion,
      },
    ]);

    setQuestion("");
    setIsThinking(true);
    setMessages((prev) => [
  ...prev,
  {
    role: "assistant",
    content: "",
  },
]);

    try {
      const response = await fetch(
        "http://localhost:8000/api/chat/repository/stream",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            question: trimmedQuestion,
          }),
        }
      );
      if (!response.ok) {
  throw new Error("Failed to connect to DevMind.");
}

if (!response.body) {
  throw new Error("Streaming is not supported.");
}

const reader = response.body.getReader();
const decoder = new TextDecoder();

let assistantResponse = "";
let firstChunk = true;
let pendingUpdate = false;

while (true) {
  const { value, done } = await reader.read();

  if (done) break;

  const chunk = decoder.decode(value);

  const lines = chunk.split("\n");

  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;

    const text = line.replace("data: ", "");

    if (text === "[DONE]") {
      break;
    }
    if (firstChunk) {
  setIsThinking(false);
  firstChunk = false;
}

assistantResponse += text;

if (!pendingUpdate) {
  pendingUpdate = true;

  requestAnimationFrame(() => {
    pendingUpdate = false;

    setMessages((prev) => {
      const updated = [...prev];

      if (
        updated.length === 0 ||
        updated[updated.length - 1].role !== "assistant"
      ) {
        updated.push({
          role: "assistant",
          content: "",
        });
      }

      updated[updated.length - 1] = {
        role: "assistant",
        content: assistantResponse,
      };

      return updated;
    });
  });
}
  }
}
console.log(assistantResponse);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong while contacting DevMind.",
        },
      ]);
    } finally {
        if (isThinking) {
            setIsThinking(false);
  }
}
  }

  return (
    <section className="flex min-h-[520px] flex-col rounded-2xl border border-white/10 bg-[#141a27] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="font-semibold text-white">DevMind AI</h2>
          <p className="text-xs text-slate-500">
            Your project assistant
          </p>
        </div>

        <span className="text-xs text-emerald-400">
          {isRepositoryReady
            ? "🟢 Repository Ready"
            : "⚪ Waiting"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {!isRepositoryReady ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-2xl bg-cyan-500/10 p-4 text-cyan-300">
              <SparkleIcon />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              Upload a repository first
            </h3>

            <p className="mt-2 max-w-sm text-sm text-slate-400">
              Analyze a GitHub repository before chatting with
              DevMind.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-2xl bg-cyan-500/10 p-4 text-cyan-300">
              <SparkleIcon />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              Ask anything about your project
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Session: {sessionId.slice(0, 8)}...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.length === 0 && !isThinking && (
  <div className="mb-8 flex flex-col items-center text-center">
    <h2 className="mb-2 text-2xl font-bold text-white">
      👋 Welcome to DevMind
    </h2>

    <p className="mb-6 max-w-lg text-slate-400">
      Your AI-powered repository assistant. Ask anything about your uploaded codebase.
    </p>

    <div className="grid grid-cols-2 gap-3">
      {[
        "Explain this repository",
        "What is the project architecture?",
        "How do I run this project?",
        "Explain the main entry point",
      ].map((prompt) => (
        <button
          key={prompt}
          onClick={() => {
    setQuestion(prompt);
}}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm transition hover:border-cyan-400 hover:bg-slate-700"
        >
          {prompt}
        </button>
      ))}
    </div>
  </div>
)}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
               <div

  className={`max-w-[78%] rounded-2xl px-5 py-4 leading-7 ${
    message.role === "user"
      ? "bg-cyan-500 text-slate-950 text-[15px]"
      : "bg-slate-800 text-slate-100 text-[15px]"
  }`}
>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
components={{
  h1: ({ children }) => (
    <h1 className="mb-5 text-3xl font-bold text-white">
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2 className="mt-8 mb-3 text-2xl font-semibold text-cyan-300">
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 text-xl font-semibold text-cyan-200">
      {children}
    </h3>
  ),

  p: ({ children }) => (
    <p className="mb-4 leading-8 text-slate-200">
      {children}
    </p>
  ),

  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-6">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-6">
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className="leading-7">
      {children}
    </li>
  ),

  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-cyan-500 pl-4 italic text-slate-300">
      {children}
    </blockquote>
  ),

  table: ({ children }) => (
    <table className="my-4 w-full border-collapse overflow-hidden rounded-lg">
      {children}
    </table>
  ),

  th: ({ children }) => (
    <th className="border border-slate-700 bg-slate-800 px-3 py-2 text-left">
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td className="border border-slate-700 px-3 py-2">
      {children}
    </td>
  ),

  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");

    return match ? (
      <SyntaxHighlighter
        style={oneDark}
        language={match[1]}
        PreTag="div"
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code
        className="rounded bg-slate-900 px-1.5 py-0.5 text-cyan-300"
        {...props}
      >
        {children}
      </code>
    );
  },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-800 px-4 py-3 text-sm text-slate-300">
                  DevMind is thinking...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={!isRepositoryReady || isThinking}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void sendMessage();
              }
            }}
            placeholder={
              isRepositoryReady
                ? "Ask something about the repository..."
                : "Upload a repository first..."
            }
            className="flex-1 rounded-xl border border-slate-700 bg-[#0e131e] px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 disabled:opacity-50"
          />

          <button
    onClick={() => {
        if (question.trim()) {
            void sendMessage();
        }
    }}
            disabled={!isRepositoryReady || isThinking}
            className="rounded-xl bg-cyan-500 px-5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isThinking ? "Thinking..." : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}