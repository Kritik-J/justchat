import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@justchat/ui/components/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import { Button } from "@justchat/ui/components/button";
import { CopyIcon, RefreshCwIcon } from "@justchat/ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@justchat/ui/components/select";

const models = [
  { id: "gemma2-9b-it", label: "Gemma 2 9B (Google)" },
  { id: "meta-llama/llama-guard-4-12b", label: "Llama Guard 4 12B (Meta)" },
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile (Meta)" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (Meta)" },
];

function CodeBlock({
  children,
  language,
  ...rest
}: {
  children: ReactNode;
  language: string;
  [key: string]: any;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(String(children));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="relative group">
      <SyntaxHighlighter language={language} PreTag="div" {...rest}>
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-muted hover:bg-accent transition z-10"
        type="button"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export default function AIMessage({
  message,
  onRetry,
}: {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
  };
  onRetry: (model: string) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showModelSelect, setShowModelSelect] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleModelSelect = async (model: string) => {
    setIsRetrying(true);
    try {
      await onRetry(model);
    } finally {
      setIsRetrying(false);
      setShowModelSelect(false);
    }
  };

  return (
    <div className="flex flex-col w-full justify-start p-4 gap-2">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src="https://github.com/Kritik-J.png" />
          <AvatarFallback>K</AvatarFallback>
        </Avatar>

        <span className="text-sm font-medium text-muted-foreground">
          Assistant
        </span>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-2xl overflow-x-auto relative group">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code(
              props: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
            ) {
              const { inline, className, children, ...rest } = props as any;
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <CodeBlock language={match[1]} {...rest}>
                  {children}
                </CodeBlock>
              ) : (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>

        <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
            <CopyIcon className="size-3" />
          </Button>
          {showModelSelect ? (
            <div className="flex gap-2 bg-background/80 backdrop-blur-sm p-1 rounded-md">
              <Select onValueChange={handleModelSelect} disabled={isRetrying}>
                <SelectTrigger className="w-[200px] h-8">
                  <SelectValue placeholder="Select model..." />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowModelSelect(true)}
              disabled={isRetrying}
            >
              <RefreshCwIcon
                className={`size-3 ${isRetrying ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
