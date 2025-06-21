import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";
import { env } from "~/env.server";
import { webSearchService } from "./webSearch.server";
import { logger } from "@justchat/logger";

const groqClient = new OpenAI({
  apiKey: env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const webSearchTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "web_search",
    description:
      "Search the web for current information, news, facts, or any topic that requires up-to-date data. Use this when you need recent information or when the user's question would benefit from real-time web data.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to find relevant information",
        },
        search_depth: {
          type: "string",
          enum: ["basic", "advanced"],
          description:
            "The depth of search - basic for quick results, advanced for comprehensive search",
        },
        max_results: {
          type: "number",
          description: "Maximum number of search results to return (1-10)",
          minimum: 1,
          maximum: 10,
        },
      },
      required: ["query"],
    },
  },
};

async function executeWebSearch(args: {
  query: string;
  search_depth?: "basic" | "advanced";
  max_results?: number;
}) {
  try {
    logger.info(`🔍 Executing web search: ${args.query}`);

    const searchResponse = await webSearchService.search(args.query, {
      searchDepth: args.search_depth || "basic",
      maxResults: args.max_results || 5,
      includeAnswer: true,
    });

    let formattedResults = `Web Search Results for: "${args.query}"\n\n`;

    if (searchResponse.answer) {
      formattedResults += `QUICK SUMMARY: ${searchResponse.answer}\n\n`;
    }

    formattedResults += "DETAILED SOURCES:\n";
    formattedResults +=
      "Please use ALL of this information to provide a comprehensive response. Cite each source using [Source Title](URL) format.\n\n";

    searchResponse.results.forEach((result, index) => {
      formattedResults += `SOURCE ${index + 1}: ${result.title}\n`;
      formattedResults += `URL: ${result.url}\n`;
      if (result.publishedDate) {
        formattedResults += `Published: ${result.publishedDate}\n`;
      }
      formattedResults += `Content: ${result.content}\n`;
      formattedResults += `---\n\n`;
    });

    formattedResults +=
      "CRITICAL INSTRUCTION: You MUST structure your response exactly as follows:\n";
    formattedResults += "1. Start with a comprehensive overview paragraph\n";
    formattedResults +=
      "2. Organize information with clear headings (use ## for sections)\n";
    formattedResults +=
      "3. For EVERY fact, data point, or claim, include a citation in the format [Source Title](URL)\n";
    formattedResults +=
      "4. Include specific details: dates, numbers, quotes, locations\n";
    formattedResults +=
      "5. End with a 'Sources' section listing all references\n";
    formattedResults += "6. Use markdown formatting for better readability\n\n";
    formattedResults +=
      "CITATION FORMAT EXAMPLE: According to [BBC News](https://bbc.com/news/example), the event occurred on June 12, 2025.\n\n";

    logger.info(formattedResults);

    return {
      success: true,
      results: formattedResults,
      citations: searchResponse.results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.content.substring(0, 200) + "...",
      })),
    };
  } catch (error) {
    logger.error(`Web search failed: ${error}`);
    return {
      success: false,
      error: `Web search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function* streamGenerate(
  model: string,
  history: ChatCompletionMessageParam[],
  settings: Record<string, any> = {},
  enableTools: boolean = false
): AsyncGenerator<string, void, unknown> {
  const messages = [...history];
  let hasSearched = false; // Prevent multiple searches in the same conversation turn
  let lastFunctionCallId: string | null = null; // Track processed function calls

  const tools = enableTools ? [webSearchTool] : undefined;

  while (true) {
    const stream = await groqClient.chat.completions.create({
      model,
      messages,
      temperature: settings.temperature ?? 0.7,
      max_tokens: settings.max_tokens ?? (enableTools ? 2048 : 1024), // More tokens for web search responses
      tools,
      tool_choice: enableTools ? "auto" : undefined,
      stream: true,
    });

    let functionCall: {
      name: string;
      arguments: string;
    } | null = null;
    let functionArgs = "";
    let content = "";

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta;

      if (delta?.content) {
        content += delta.content;
        yield delta.content;
      }

      if (delta?.tool_calls?.[0]) {
        const toolCall = delta.tool_calls[0];

        if (toolCall.function?.name) {
          functionCall = {
            name: toolCall.function.name,
            arguments: toolCall.function.arguments || "",
          };
        } else if (toolCall.function?.arguments) {
          functionArgs += toolCall.function.arguments;
        }
      }
    }

    // Only process function calls if we don't already have content
    if (functionCall && enableTools && !content.trim()) {
      try {
        const completeArgs = functionCall.arguments + functionArgs;
        const parsedArgs = JSON.parse(completeArgs);

        if (functionCall.name === "web_search") {
          // Prevent duplicate searches in the same turn
          if (hasSearched) {
            logger.warn("Preventing duplicate web search in the same turn");
            break;
          }

          // Create a unique ID for this function call
          const currentCallId = `${functionCall.name}_${JSON.stringify(parsedArgs)}`;
          if (lastFunctionCallId === currentCallId) {
            logger.warn("Preventing duplicate function call processing");
            break;
          }

          hasSearched = true;
          lastFunctionCallId = currentCallId;
          yield `\n\nSearching for: "${parsedArgs.query}"...\n\n`;

          const searchResult = await executeWebSearch(parsedArgs);

          if (searchResult.success) {
            messages.push({
              role: "assistant",
              content: null,
              tool_calls: [
                {
                  id: `call_${Date.now()}`,
                  type: "function",
                  function: {
                    name: "web_search",
                    arguments: completeArgs,
                  },
                },
              ],
            });

            messages.push({
              role: "tool",
              content: searchResult.results || "No search results available",
              tool_call_id: `call_${Date.now()}`,
            });

            yield "Found current information. Here's a comprehensive summary:\n\n";

            continue;
          } else {
            yield `Search failed: ${searchResult.error}\n\nI'll answer based on my existing knowledge:\n\n`;
            break;
          }
        }
      } catch (error) {
        logger.error(`Function call execution failed: ${error}`);
        yield `\n\nThere was an issue with the web search. I'll answer based on my existing knowledge:\n\n`;
        break;
      }
    } else {
      break;
    }
  }
}

export async function* streamGenerateWithWebSearch(
  model: string,
  history: ChatCompletionMessageParam[],
  settings: Record<string, any> = {},
  enableWebSearch: boolean = false
): AsyncGenerator<string, void, unknown> {
  if (enableWebSearch) {
    const systemPrompt = `You are a helpful AI assistant with access to real-time web search. When you receive web search results, you MUST provide structured, comprehensive responses with proper citations.

    MANDATORY RESPONSE STRUCTURE when using web search results:

    1. **Overview**: Start with a clear, comprehensive summary paragraph
    2. **Structured Content**: Use markdown headings (##) to organize information
    3. **Citations**: Every fact MUST have a citation: [Source Title](URL)
    4. **Details**: Include specific dates, numbers, quotes, and locations
    5. **Sources Section**: End with a ## Sources section listing all references

    CITATION RULES:
    - Format: [Source Name](URL) - never just (URL) or plain text
    - Cite EVERY fact, statistic, quote, or claim
    - Multiple sources for the same fact increase credibility
    - Use the exact source titles provided in the search results

    EXAMPLE FORMAT:
    The incident occurred on January 15, 2024, according to [BBC News](https://bbc.com/news), with [CNN](https://cnn.com) confirming the timeline.

    ## Key Details
    - **Location**: As reported by [Reuters](https://reuters.com)
    - **Impact**: [Associated Press](https://ap.org) noted significant effects

    ## Sources
    1. [BBC News](https://bbc.com/news) - Breaking news coverage
    2. [CNN](https://cnn.com) - Timeline confirmation
    3. [Reuters](https://reuters.com) - Location details

    REMEMBER: Structured format + comprehensive citations = professional response

    You have access to the following tools:
    - web_search: Search the web for current information`;

    const messagesWithSystem: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history,
    ];

    yield* streamGenerate(model, messagesWithSystem, settings, true);
  } else {
    yield* streamGenerate(model, history, settings, false);
  }
}
