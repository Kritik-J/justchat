import { useState, useRef } from "react";
import { Button } from "@justchat/ui/components/button";
import {
  Paperclip,
  SendIcon,
  Search,
  Globe,
  X,
  FileText,
  MessageSquare,
} from "@justchat/ui/icons";
import type { ILLM } from "@justchat/database";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@justchat/ui/components/select";
import { useChat } from "~/contexts/chat";

// Quick question suggestions for uploaded documents
const DOCUMENT_QUESTIONS = [
  "What is the main topic of this document?",
  "Can you summarize the key points?",
  "What are the most important details?",
  "Are there any specific dates or numbers mentioned?",
  "What conclusions can we draw from this?",
];

export default function ChatInput({
  onSend,
  models,
  isShared,
}: {
  onSend: (
    input: string,
    model: string,
    options: { enableWebSearch: boolean; enableRAG: boolean }
  ) => void;
  models: ILLM[];
  isShared?: boolean;
}) {
  const { activeModel, setActiveModel } = useChat();
  const [input, setInput] = useState("");
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [enableRAG, setEnableRAG] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ fileId: string; filename: string }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (isShared || !input.trim()) return;
    // Auto-enable RAG if files are uploaded, regardless of toggle state
    const shouldEnableRAG = uploadedFiles.length > 0;

    onSend(input, activeModel?.model_name!, {
      enableWebSearch,
      enableRAG: shouldEnableRAG,
    });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleWebSearch = () => {
    setEnableWebSearch(!enableWebSearch);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/files/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.fileId) {
        setUploadedFiles((prev) => [
          ...prev,
          { fileId: result.fileId, filename: file.name },
        ]);
        setEnableRAG(true); // Auto-enable RAG when files are uploaded
        setShowSuggestions(true); // Show question suggestions
      } else {
        console.error("Upload failed:", result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.fileId !== fileId));
    if (uploadedFiles.length <= 1) {
      setEnableRAG(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-full w-full flex flex-col gap-2 border border-border rounded-md p-2 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-col gap-2 p-2 bg-muted/50 rounded border">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>
              {uploadedFiles.length} document
              {uploadedFiles.length !== 1 ? "s" : ""} attached
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {uploadedFiles.map((file) => (
              <div
                key={file.fileId}
                className="flex items-center gap-1 bg-background px-2 py-1 rounded text-xs border"
              >
                <span className="truncate max-w-[120px]">{file.filename}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => removeFile(file.fileId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Suggestions */}
      {showSuggestions && uploadedFiles.length > 0 && !isShared && (
        <div className="flex flex-col gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
            <MessageSquare className="h-4 w-4" />
            <span>Ask about your documents:</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 ml-auto"
              onClick={() => setShowSuggestions(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {DOCUMENT_QUESTIONS.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2 bg-white dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/70 border-blue-300 dark:border-blue-700"
                onClick={() => handleSuggestionClick(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      <textarea
        className="w-full h-full resize-none text-sm border-none outline-none"
        placeholder={
          isShared
            ? "This is a shared chat. You cannot send messages. Fork it to continue the conversation."
            : enableRAG && uploadedFiles.length > 0
              ? `Ask questions about your ${uploadedFiles.length} document${uploadedFiles.length !== 1 ? "s" : ""}... Try: "What is this about?" or "Summarize the key points"`
              : enableWebSearch
                ? "Ask me anything... (Web search enabled)"
                : "Ask me anything..."
        }
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isShared}
      />

      {/* Web search indicator */}
      {enableWebSearch && !isShared && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
          <Search className="size-3" />
          <span>Web search enabled</span>
        </div>
      )}

      {/* RAG indicator */}
      {enableRAG && uploadedFiles.length > 0 && !isShared && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded">
          <Paperclip className="size-3" />
          <span>
            Document search enabled ({uploadedFiles.length} file
            {uploadedFiles.length !== 1 ? "s" : ""})
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        {models.length > 0 && (
          <Select
            value={activeModel?.model_name}
            onValueChange={(value) =>
              setActiveModel(models.find((m) => m.model_name === value)!)
            }
            disabled={isShared}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model, index) => (
                <SelectItem key={index} value={model.model_name}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={toggleWebSearch}
            className={
              enableWebSearch
                ? "bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700"
                : ""
            }
            title={enableWebSearch ? "Disable web search" : "Enable web search"}
            disabled={isShared}
          >
            <Globe
              className={`size-4 ${enableWebSearch ? "text-blue-600 dark:text-blue-400" : ""}`}
            />
          </Button>

          {/* Question suggestions toggle */}
          {uploadedFiles.length > 0 && !isShared && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className={
                showSuggestions
                  ? "bg-purple-100 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700"
                  : ""
              }
              title={
                showSuggestions
                  ? "Hide question suggestions"
                  : "Show question suggestions"
              }
            >
              <MessageSquare
                className={`size-4 ${showSuggestions ? "text-purple-600 dark:text-purple-400" : ""}`}
              />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon-sm"
            disabled={isShared || isUploading}
            onClick={openFileDialog}
            className={
              uploadedFiles.length > 0
                ? "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700"
                : ""
            }
            title={
              uploadedFiles.length > 0
                ? `${uploadedFiles.length} file(s) attached`
                : "Attach file"
            }
          >
            <Paperclip
              className={`size-4 ${uploadedFiles.length > 0 ? "text-green-600 dark:text-green-400" : ""}`}
            />
          </Button>

          <Button size="sm" onClick={handleSend} disabled={isShared}>
            <SendIcon className="size-4" />
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.txt,.csv,.md"
        onChange={handleFileUpload}
      />
    </div>
  );
}
