import { MongoRepository, Collection, type IMessage } from "@justchat/database";

class MessageService {
  #messageRepository: MongoRepository;

  constructor() {
    this.#messageRepository = new MongoRepository(Collection.MESSAGE);
  }

  async findAll(query?: any, options?: any) {
    const messages = await this.#messageRepository.find(query, options);
    return messages;
  }

  async findOne(query: any, options?: any) {
    const message = await this.#messageRepository.findOne(query, options);
    return message;
  }

  async create(data: Partial<IMessage>) {
    const message = await this.#messageRepository.create(data);
    return message;
  }

  async update(query: any, data: Partial<IMessage>, options?: any) {
    const updatedMessage = await this.#messageRepository.updateOne(
      query,
      data,
      options
    );
    return updatedMessage;
  }

  async delete(query: any, options?: any) {
    await this.#messageRepository.deleteOne(query, options);
  }

  async count(query?: any) {
    const count = await this.#messageRepository.count(query);
    return count;
  }
}

export const messageService = new MessageService();
