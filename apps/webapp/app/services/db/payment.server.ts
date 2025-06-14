import { MongoRepository, Collection, type IPayment } from "@justchat/database";

class PaymentService {
  #paymentRepository: MongoRepository;

  constructor() {
    this.#paymentRepository = new MongoRepository(Collection.PAYMENT);
  }

  async findAll(query?: any, options?: any) {
    const payments = await this.#paymentRepository.find(query, options);
    return payments;
  }

  async findOne(query: any, options?: any) {
    const payment = await this.#paymentRepository.findOne(query, options);
    return payment;
  }

  async create(data: Partial<IPayment>) {
    const payment = await this.#paymentRepository.create(data);
    return payment;
  }

  async update(query: any, data: Partial<IPayment>, options?: any) {
    const updatedPayment = await this.#paymentRepository.updateOne(
      query,
      data,
      options
    );
    return updatedPayment;
  }

  async delete(query: any, options?: any) {
    await this.#paymentRepository.deleteOne(query, options);
  }

  async count(query?: any) {
    const count = await this.#paymentRepository.count(query);
    return count;
  }
}

export const paymentService = new PaymentService();
