import { MongoRepository, Collection, type IPlan } from "@justchat/database";

class PlanService {
  #planRepository: MongoRepository;

  constructor() {
    this.#planRepository = new MongoRepository(Collection.PLAN);
  }

  async findAll(query?: any, options?: any) {
    const plans = await this.#planRepository.find(query, options);
    return plans;
  }

  async findOne(query: any, options?: any) {
    const plan = await this.#planRepository.findOne(query, options);
    return plan;
  }

  async create(data: Partial<IPlan>) {
    const plan = await this.#planRepository.create(data);
    return plan;
  }

  async update(query: any, data: Partial<IPlan>, options?: any) {
    const updatedPlan = await this.#planRepository.updateOne(
      query,
      data,
      options
    );
    return updatedPlan;
  }

  async delete(query: any, options?: any) {
    await this.#planRepository.deleteOne(query, options);
  }

  async count(query?: any) {
    const count = await this.#planRepository.count(query);
    return count;
  }
}

export const planService = new PlanService();
