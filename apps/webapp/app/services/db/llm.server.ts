import { MongoRepository, Collection, type IMessage } from "@justchat/database";

class LLMService {
  #llmRepository: MongoRepository;

  constructor() {
    this.#llmRepository = new MongoRepository(Collection.LLM);
  }

  async findAll(query?: any, options?: any) {
    const llms = await this.#llmRepository.find(query, options);
    return llms;
  }

  async findOne(query: any, options?: any) {
    const llm = await this.#llmRepository.findOne(query, options);
    return llm;
  }

  async create(data: Partial<IMessage>) {
    const llm = await this.#llmRepository.create(data);
    return llm;
  }

  async update(query: any, data: Partial<IMessage>, options?: any) {
    const updatedLLM = await this.#llmRepository.updateOne(
      query,
      data,
      options
    );
    return updatedLLM;
  }

  async delete(query: any, options?: any) {
    await this.#llmRepository.deleteOne(query, options);
  }

  async count(query?: any) {
    const count = await this.#llmRepository.count(query);
    return count;
  }
}

export const llmService = new LLMService();
