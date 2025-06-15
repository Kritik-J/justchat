import { MongoRepository, Collection, type IThread } from "@justchat/database";

class ThreadService {
  #threadRepository: MongoRepository;

  constructor() {
    this.#threadRepository = new MongoRepository(Collection.THREAD);
  }

  async findAll(query?: any, options?: any) {
    const threads = await this.#threadRepository.find(query, options);
    return threads;
  }

  async findOne(query: any, options?: any) {
    const thread = await this.#threadRepository.findOne(query, options);
    return thread;
  }

  async create(data: Partial<IThread>) {
    const thread = await this.#threadRepository.create(data);
    return thread;
  }

  async update(query: any, data: Partial<IThread>, options?: any) {
    const updatedThread = await this.#threadRepository.updateOne(
      query,
      data,
      options
    );
    return updatedThread;
  }

  async delete(query: any, options?: any) {
    await this.#threadRepository.deleteOne(query, options);
  }

  async count(query?: any) {
    const count = await this.#threadRepository.count(query);
    return count;
  }
}

export const threadService = new ThreadService();
