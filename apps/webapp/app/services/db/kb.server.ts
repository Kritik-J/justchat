import {
  MongoRepository,
  Collection,
  type IKnowledgebase,
} from "@justchat/database";

class KbService {
  #kbRepository: MongoRepository;

  constructor() {
    this.#kbRepository = new MongoRepository(Collection.KNOWLEDGE_BASE);
  }

  async findAll(query?: any, options?: any) {
    const kbs = await this.#kbRepository.find(query, options);
    return kbs;
  }

  async findOne(query: any, options?: any) {
    const kb = await this.#kbRepository.findOne(query, options);
    return kb;
  }

  async create(data: Partial<IKnowledgebase>) {
    const kb = await this.#kbRepository.create(data);
    return kb;
  }

  async update(query: any, data: Partial<IKnowledgebase>, options?: any) {
    const updatedKb = await this.#kbRepository.updateOne(query, data, options);
    return updatedKb;
  }

  async delete(query: any, options?: any) {
    await this.#kbRepository.deleteOne(query, options);
  }

  async count(query?: any) {
    const count = await this.#kbRepository.count(query);
    return count;
  }
}

export const kbService = new KbService();
