import {
  MongoRepository,
  Collection,
  type IConfiguration,
} from "@justchat/database";

class ConfigurationService {
  #configurationRepository: MongoRepository;

  constructor() {
    this.#configurationRepository = new MongoRepository(
      Collection.CONFIGURATION
    );
  }

  async findAll(query?: any, options?: any) {
    const configurations = await this.#configurationRepository.find(
      query,
      options
    );
    return configurations;
  }

  async findOne(query: any, options?: any) {
    const configuration = await this.#configurationRepository.findOne(
      query,
      options
    );
    return configuration;
  }

  async create(data: Partial<IConfiguration>) {
    const configuration = await this.#configurationRepository.create(data);
    return configuration;
  }

  async update(query: any, data: Partial<IConfiguration>, options?: any) {
    const updatedConfiguration = await this.#configurationRepository.updateOne(
      query,
      data,
      options
    );
    return updatedConfiguration;
  }

  async delete(query: any, options?: any) {
    await this.#configurationRepository.deleteOne(query, options);
  }

  async count(query?: any) {
    const count = await this.#configurationRepository.count(query);
    return count;
  }
}

export const configurationService = new ConfigurationService();
