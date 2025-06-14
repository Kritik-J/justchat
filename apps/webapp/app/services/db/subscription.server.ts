import {
  MongoRepository,
  Collection,
  type ISubscription,
} from "@justchat/database";

class SubscriptionService {
  #subscriptionRepository: MongoRepository;

  constructor() {
    this.#subscriptionRepository = new MongoRepository(Collection.SUBSCRIPTION);
  }

  async findAll(query?: any, options?: any) {
    const subscriptions = await this.#subscriptionRepository.find(
      query,
      options
    );
    return subscriptions;
  }

  async findOne(query: any, options?: any) {
    const subscription = await this.#subscriptionRepository.findOne(
      query,
      options
    );
    return subscription;
  }

  async create(data: Partial<ISubscription>) {
    const subscription = await this.#subscriptionRepository.create(data);
    return subscription;
  }

  async update(query: any, data: Partial<ISubscription>, options?: any) {
    const updatedSubscription = await this.#subscriptionRepository.updateOne(
      query,
      data,
      options
    );
    return updatedSubscription;
  }

  async delete(query: any, options?: any) {
    await this.#subscriptionRepository.deleteOne(query, options);
  }

  async count(query?: any) {
    const count = await this.#subscriptionRepository.count(query);
    return count;
  }
}

export const subscriptionService = new SubscriptionService();
