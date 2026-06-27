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
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#0c0b0a] text-[11px] font-bold text-white">
          AI
        </div>
      ) : null}
      <div
        className={`max-w-3xl rounded-xl px-4 py-3 ${
          isAssistant
            ? "border border-[#e8e6e1] bg-white text-[#3a3a37]"
            : "bg-[#0c0b0a] text-white"
        }`}
      >
        <div className="prose prose-sm max-w-none prose-headings:text-current prose-strong:text-current prose-p:text-current">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        {isAssistant && citations?.length ? (
          <div className="mt-3 rounded-lg border border-[#eeece7] bg-[#fcfbf9] p-3 text-xs">
            <p className="mb-1.5 font-mono uppercase tracking-[0.16em] text-[#a8a39a]">Citations</p>
            {citations.map((c, idx) => (
              <p key={`${c.source}-${idx}`} className="text-[#6b665d]">
                <span className="font-medium text-[#161513]">{c.source}:</span> {c.excerpt}
              </p>
            ))}
          </div>
        ) : null}
        {isAssistant ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 -ml-1.5 h-7 px-2 text-xs text-[#78736b]"
            onClick={() => navigator.clipboard.writeText(content)}
          >
            <Copy className="mr-1 h-3 w-3" strokeWidth={1.75} />
            Copy
          </Button>
        ) : null}
      </div>
      {!isAssistant ? (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#e8e6e1] bg-white text-[#161513]">
          <UserRound className="h-4 w-4" strokeWidth={1.75} />
        </div>
      ) : null}
    </div>
  );
}
