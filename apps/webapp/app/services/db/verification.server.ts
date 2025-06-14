import {
  MongoRepository,
  Collection,
  type IVerification,
} from "@justchat/database";

class VerificationService {
  #verificationRepository: MongoRepository;

  constructor() {
    this.#verificationRepository = new MongoRepository(Collection.VERIFICATION);
  }

  async findAll(query?: any, options?: any) {
    const verifications = await this.#verificationRepository.find(
      query,
      options
    );
    return verifications;
  }

  async findOne(query: any, options?: any) {
    const verification = await this.#verificationRepository.findOne(
      query,
      options
    );
    return verification;
  }

  async create(data: Partial<IVerification>) {
    const newVerification = await this.#verificationRepository.create(data);
    return newVerification;
  }

  async update(query: any, data: Partial<IVerification>, options?: any) {
    const updatedVerification = await this.#verificationRepository.updateOne(
      query,
      data,
      options
    );
    return updatedVerification;
  }

  async delete(query: any, options?: any) {
    await this.#verificationRepository.deleteOne(query, options);
  }

  async count(query?: any) {
    const count = await this.#verificationRepository.count(query);
    return count;
  }
}

export const verificationService = new VerificationService();
