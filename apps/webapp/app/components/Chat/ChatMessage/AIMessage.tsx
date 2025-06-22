import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@justchat/ui/components/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import { useState, useMemo } from "react";
import { Button } from "@justchat/ui/components/button";
import { Badge } from "@justchat/ui/components/badge";
import { Card, CardContent } from "@justchat/ui/components/card";
import {
  CopyIcon,
  RefreshCwIcon,
  ExternalLink,
  Globe,
  Quote,
} from "@justchat/ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@justchat/ui/components/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@justchat/ui/components/tooltip";
import { useChat } from "~/contexts/chat";

interface Citation {
  number: number;
  title: string;
  url: string;
  domain: string;
}

const getFavicon = (domain: string) =>
  `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

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

function CitationLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  // Extract domain from URL for display
  const domain = useMemo(() => {
    try {
      return new URL(href).hostname.replace("www.", "");
    } catch {
      return href;
    }
  }, [href]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
    >
      {children}
      <ExternalLink className="size-3" />
    </a>
  );
}

function SourcesSection({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Sources
          </span>
          <Badge variant="outline" className="text-xs">
            {citations.length}
          </Badge>
        </div>
        <div className="flex flex-wrap ml-0.5 gap-2">
          {citations.map((citation) => (
            <Tooltip key={citation.number}>
              <TooltipTrigger asChild>
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="w-12 h-12 transition-all duration-200 hover:shadow-md hover:scale-105 border-2 flex items-center justify-center hover:border-blue-400 dark:hover:border-blue-600">
                    <img
                      src={getFavicon(citation.domain)}
                      alt={citation.domain}
                      className="w-6 h-6 object-contain"
                    />
                  </Card>
                </a>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs p-3 bg-background border border-border shadow-lg"
              >
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm leading-tight text-muted-foreground">
                    {citation.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="size-3" />
                    <span>{citation.domain}</span>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Click to open ↗
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function AIMessage({
  message,
  onRetry,
  isShared,
}: {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
  };
  onRetry: (model: string) => Promise<void>;
  isShared: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const { models } = useChat();

  // Extract citations from message content and process structured content
  const { mainContent, citations, hasSourcesSection } = useMemo(() => {
    let content = message.content;

    // Check if there's already a Sources section in the content
    const sourcesMatch = content.match(/#{1,3}\s*Sources?\s*$/m);
    const hasExistingSources = !!sourcesMatch;

    // Look for citations in the format [text](url)
    const citationRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    const foundCitations: Citation[] = [];
    const seenUrls = new Set<string>(); // Prevent duplicate citations
    let citationNumber = 1;

    // Extract all unique citations
    let match;
    while ((match = citationRegex.exec(content)) !== null) {
      const [, text, url] = match;

      if (seenUrls.has(url)) continue; // Skip duplicates
      seenUrls.add(url);

      // Try to extract domain
      let domain = "";
      try {
        domain = new URL(url).hostname.replace("www.", "");
      } catch {
        domain = url;
      }

      foundCitations.push({
        number: citationNumber++,
        title: text.length > 3 && !text.match(/^\d+$/) ? text : domain,
        url,
        domain,
      });
    }

    // If there's a Sources section in the content, remove it since we'll render it separately
    if (hasExistingSources && sourcesMatch) {
      const sourcesIndex = content.indexOf(sourcesMatch[0]);
      content = content.substring(0, sourcesIndex).trim();
    }

    return {
      mainContent: content,
      citations: foundCitations,
      hasSourcesSection: hasExistingSources,
    };
  }, [message.content]);

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
        {citations.length > 0 && (
          <Badge variant="outline" className="ml-auto">
            <Globe className="size-3 mr-1" />
            {citations.length} source{citations.length !== 1 ? "s" : ""}
          </Badge>
        )}
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
            a(props: any) {
              const { href, children } = props;
              if (href && href.startsWith("http")) {
                return <CitationLink href={href}>{children}</CitationLink>;
              }
              return <a {...props}>{children}</a>;
            },
            blockquote(props: any) {
              return (
                <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-950/20 rounded-r-md my-4">
                  <Quote className="size-4 text-blue-500 mb-2" />
                  <div className="text-blue-900 dark:text-blue-100">
                    {props.children}
                  </div>
                </blockquote>
              );
            },
            h2(props: any) {
              return (
                <h2 className="text-xl font-semibold mt-6 mb-4 text-foreground border-b border-border pb-2">
                  {props.children}
                </h2>
              );
            },
            h3(props: any) {
              return (
                <h3 className="text-lg font-medium mt-4 mb-3 text-foreground">
                  {props.children}
                </h3>
              );
            },
            ul(props: any) {
              return (
                <ul className="list-disc list-inside space-y-2 my-4">
                  {props.children}
                </ul>
              );
            },
            ol(props: any) {
              return (
                <ol className="list-decimal list-inside space-y-2 my-4">
                  {props.children}
                </ol>
              );
            },
            li(props: any) {
              return (
                <li className="text-foreground leading-relaxed">
                  {props.children}
                </li>
              );
            },
          }}
        >
          {mainContent}
        </ReactMarkdown>

        {/* Sources Section */}
        <SourcesSection citations={citations} />

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
                  {models.map((model, index) => (
                    <SelectItem key={index} value={model.model_name}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowModelSelect(true)}
                    disabled={isRetrying || isShared}
                  >
                    <RefreshCwIcon
                      className={`size-3.5 ${isRetrying ? "animate-spin" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Retry with another model</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}
