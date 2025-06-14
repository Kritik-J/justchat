import { MongoRepository, Collection, type IUser } from "@justchat/database";

class UserService {
  #userRepository: MongoRepository;

  constructor() {
    this.#userRepository = new MongoRepository(Collection.USER);
  }

  async findAll(query?: any, options?: any) {
    const users = await this.#userRepository.find(query, options);
    return users;
  }

  async findOne(query: any, options?: any) {
    const user = await this.#userRepository.findOne(query, options);
    return user;
  }

  async create(data: Partial<IUser>) {
    const newUser = await this.#userRepository.create(data);
    return newUser;
  }

  async update(query: any, data: Partial<IUser>, options?: any) {
    const updatedUser = await this.#userRepository.updateOne(
      query,
      data,
      options
    );
    return updatedUser;
  }

  async delete(query: any, options?: any) {
    await this.#userRepository.deleteOne(query, options);
  }

  async count(query?: any) {
    const count = await this.#userRepository.count(query);
    return count;
  }
}

export const userService = new UserService();
