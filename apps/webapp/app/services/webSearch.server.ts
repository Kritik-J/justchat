import { env } from "~/env.server";
import { logger } from "@justchat/logger";

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  searchTime: number;
  totalResults: number;
  answer?: string;
  sources: string[];
}

export interface TavilySearchOptions {
  searchDepth?: "basic" | "advanced";
  includeAnswer?: boolean;
  includeImages?: boolean;
  includeRawContent?: boolean;
  maxResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  days?: number;
}

class WebSearchService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.tavily.com";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(
    query: string,
    options: TavilySearchOptions = {}
  ): Promise<SearchResponse> {
    const startTime = Date.now();

    try {
      const requestBody = {
        query,
        search_depth: options.searchDepth || "basic",
        include_answer: options.includeAnswer ?? true,
        include_images: options.includeImages ?? false,
        include_raw_content: options.includeRawContent ?? false,
        max_results: options.maxResults || 5,
        include_domains: options.includeDomains,
        exclude_domains: options.excludeDomains,
        days: options.days,
      };

      const response = await fetch(`${this.baseUrl}/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Tavily API error: ${response.status} - ${errorText}`);
        throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const searchTime = Date.now() - startTime;
      const searchResponse: SearchResponse = {
        query,
        results:
          data.results?.map((result: any) => ({
            title: result.title,
            url: result.url,
            content: result.content,
            score: result.score,
            publishedDate: result.published_date,
          })) || [],
        searchTime,
        totalResults: data.results?.length || 0,
        answer: data.answer,
        sources: data.results?.map((result: any) => result.url) || [],
      };

      logger.info(
        `Search completed in ${searchTime}ms with ${searchResponse.totalResults} results`
      );
      return searchResponse;
    } catch (error) {
      logger.error(`Web search failed: ${error}`);
      throw error;
    }
  }

  async getSearchContext(
    query: string,
    options: TavilySearchOptions = {}
  ): Promise<string> {
    const searchResponse = await this.search(query, options);

    if (searchResponse.results.length === 0) {
      return `No search results found for: "${query}"`;
    }

    let context = `Search results for: "${query}"\n\n`;

    if (searchResponse.answer) {
      context += `Summary: ${searchResponse.answer}\n\n`;
    }

    context += "Sources:\n";
    searchResponse.results.forEach((result, index) => {
      context += `${index + 1}. ${result.title}\n`;
      context += `   URL: ${result.url}\n`;
      context += `   Content: ${result.content}\n`;
      if (result.publishedDate) {
        context += `   Published: ${result.publishedDate}\n`;
      }
      context += "\n";
    });

    return context;
  }

  async getSearchWithCitations(
    query: string,
    options: TavilySearchOptions = {}
  ): Promise<{
    context: string;
    citations: Array<{
      title: string;
      url: string;
      snippet: string;
      publishedDate?: string;
    }>;
    answer?: string;
  }> {
    const searchResponse = await this.search(query, options);

    const context = await this.getSearchContext(query, options);

    const citations = searchResponse.results.map((result) => ({
      title: result.title,
      url: result.url,
      snippet: result.content.substring(0, 200) + "...",
      publishedDate: result.publishedDate,
    }));

    return {
      context,
      citations,
      answer: searchResponse.answer,
    };
  }
}

export const webSearchService = new WebSearchService(env.TAVILY_API_KEY);

export { WebSearchService };
