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
}: {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
  };
}) {
  return (
    <div className="flex flex-col w-full justify-start p-4 gap-2">
      <div className="flex items-center gap-2">
        <Avatar className="rounded-sm">
          <AvatarImage src="https://github.com/Kritik-J.png" />
          <AvatarFallback>K</AvatarFallback>
        </Avatar>

        <span className="text-sm font-medium text-muted-foreground">
          Assistant
        </span>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-2xl overflow-x-auto">
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
      </div>
    </div>
  );
}
