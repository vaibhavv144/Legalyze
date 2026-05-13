import { Copy, UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";

export function ChatBubble({
  role,
  content,
  citations,
}: {
  role: "user" | "assistant";
  content: string;
  citations?: { source: string; excerpt: string }[];
}) {
  const isAssistant = role === "assistant";
  return (
    <div className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}>
      {isAssistant ? (
        <div className="h-8 w-8 rounded-full bg-blue-600/10 text-blue-600 grid place-items-center font-bold text-xs">AI</div>
      ) : null}
      <div
        className={`max-w-3xl rounded-2xl px-4 py-3 ${
          isAssistant
            ? "border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
        }`}
      >
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        {isAssistant && citations?.length ? (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-1 font-semibold">Citations</p>
            {citations.map((c, idx) => (
              <p key={`${c.source}-${idx}`} className="text-slate-600 dark:text-slate-300">
                {c.source}: {c.excerpt}
              </p>
            ))}
          </div>
        ) : null}
        {isAssistant ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => navigator.clipboard.writeText(content)}
          >
            <Copy className="mr-1 h-3 w-3" />
            Copy
          </Button>
        ) : null}
      </div>
      {!isAssistant ? (
        <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 grid place-items-center dark:bg-slate-700 dark:text-slate-100">
          <UserRound className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}
