// @ts-nocheck

import { logger } from "@justchat/logger";
import { UserModel } from "./schemas/user";
import { VerificationModel } from "./schemas/verification";
import { ThreadModel } from "./schemas/thread";
import { ConfigurationModel } from "./schemas/configuration";
import { MessageModel } from "./schemas/message";
import { PlanModel } from "./schemas/plan";
import { SubscriptionModel } from "./schemas/subscription";
import { PaymentModel } from "./schemas/payment";
import { Collection } from "./enums";
import { LLMModel } from "./schemas/llm";

const MODEL_MAP = {
  [Collection.USER]: UserModel,
  [Collection.VERIFICATION]: VerificationModel,
  [Collection.CONFIGURATION]: ConfigurationModel,
  [Collection.THREAD]: ThreadModel,
  [Collection.MESSAGE]: MessageModel,
  [Collection.PLAN]: PlanModel,
  [Collection.SUBSCRIPTION]: SubscriptionModel,
  [Collection.PAYMENT]: PaymentModel,
  [Collection.LLM]: LLMModel,
};

export class MongoRepository {
  #model;
  #modelName;

  constructor(modelName) {
    if (!modelName) {
      throw new Error("Model name is required");
    }

    if (!MODEL_MAP[modelName]) {
      throw new Error(`Model not found for collection: ${modelName}`);
    }

    this.#model = MODEL_MAP[modelName];
    this.#modelName = modelName;
  }

  /**
   * Clean mongoose document
   */
  cleanDoc(doc) {
    if (!doc) return null;

    // If it's a mongoose document with _doc
    if (doc._doc) {
      return { ...doc._doc };
    }

    // If it's already a plain object
    return { ...doc };
  }

  /**
   * Count documents
   */
  async count(query = {}) {
    try {
      const count = await this.#model.countDocuments(query);
      return count;
    } catch (error) {
      logger.error(`Error in count: ${this.#modelName}`, error);
      throw error;
    }
  }

  /**
   * Create a new document
   */
  async create(data) {
    try {
      const doc = await this.#model.create(data);
      return this.cleanDoc(doc);
    } catch (error) {
      logger.error(`Error in create: ${this.#modelName}`, error);
      throw error;
    }
  }
  /**
   * Create multiple documents
   */
  async createMany(dataArray) {
    try {
      const docs = await this.#model.insertMany(dataArray);
      return docs.map((doc) => this.cleanDoc(doc));
    } catch (error) {
      logger.error(`Error in createMany: ${this.#modelName}`, error);
      throw error;
    }
  }

  /**
   * Find one document
   */
  async findOne(query, options = {}) {
    try {
      const { select = "", lean = true, populate = [], sort = {} } = options;

      // Build the query chain properly
      let queryChain = this.#model.findOne(query);

      // Apply sort if provided
      if (Object.keys(sort).length > 0) {
        queryChain = queryChain.sort(sort);
      }

      // Apply select if provided
      if (select) {
        queryChain = queryChain.select(select);
      }

      // Apply populate if provided
      if (populate.length > 0) {
        queryChain = queryChain.populate(populate);
      }

      // Execute query with lean option
      const result = await queryChain.lean(lean);

      logger.debug(`Query result: ${this.#modelName}`, !!result);
      return result;
    } catch (error) {
      logger.error(`Error in findOne: ${this.#modelName}`, error);
      throw error;
    }
  }

  /**
   * Find multiple documents
   */
  async find(query = {}, options = {}) {
    try {
      const {
        select = "",
        lean = true,
        populate = [],
        sort = {},
        page = 1,
        limit = 10,
        pagination = false,
      } = options;

      const result = await this.#model.paginate(query, {
        select,
        lean,
        populate,
        sort,
        ...(pagination && {
          skip: limit > 0 ? (page - 1) * limit : 0,
          limit: limit > 0 ? limit : undefined,
        }),
      });

      logger.debug(`Documents found: ${this.#modelName}`, result.docs);

      return {
        documents: result.docs,
        page_stat: result.page_stat,
      };
    } catch (error) {
      logger.error(`Error in find: ${this.#modelName}`, error);
      throw error;
    }
  }

  /**
   * Update one document
   */
  async updateOne(query, update, options = {}) {
    try {
      const {
        lean = true,
        new: returnNew = true,
        runValidators = true,
        populate = [],
      } = options;

      const updateOptions = {
        new: returnNew,
        runValidators,
        lean,
      };

      let result = await this.#model.findOneAndUpdate(
        query,
        update,
        updateOptions
      );

      // Handle population if needed
      if (populate.length > 0 && result) {
        result = await this.#model.populate(result, populate);
      }

      logger.debug(`Document updated: ${this.#modelName}`, !!result);
      return result;
    } catch (error) {
      logger.error(`Error in updateOne: ${this.#modelName}`, error);
      throw error;
    }
  }

  /**
   * Update many documents
   */
  async updateMany(query, update, options = {}) {
    try {
      const { lean = true, runValidators = true } = options;

      const result = await this.#model.updateMany(query, update, {
        lean,
        runValidators,
      });

      logger.debug(
        `Updated ${result.modifiedCount} documents in the ${
          this.#modelName
        } collection.`
      );
      return result;
    } catch (error) {
      logger.error(`Error in updateMany: ${this.#modelName}`, error);
      throw error;
    }
  }

  /**
   * Delete one document
   */
  async deleteOne(query, options = {}) {
    try {
      const { lean = true } = options;

      const result = await this.#model.findOneAndDelete(query, {
        lean,
      });

      logger.debug(`Document deleted: ${this.#modelName}`, !!result);
      return result;
    } catch (error) {
      logger.error(`Error in deleteOne: ${this.#modelName}`, error);
      throw error;
    }
  }

  /**
   * Delete many documents
   */
  async deleteMany(query, options = {}) {
    try {
      const { lean = true } = options;

      const result = await this.#model.deleteMany(query, { lean });

      logger.debug(
        `Deleted ${result.deletedCount} documents from the ${
          this.#modelName
        } collection.`
      );
      return result;
    } catch (error) {
      logger.error(`Error in deleteMany: ${this.#modelName}`, error);
      throw error;
    }
  }

  /**
   * Upsert one document
   */
  async upsertOne(query, update, options = {}) {
    try {
      const result = await this.#model.findOneAndUpdate(query, update, {
        ...options,
        upsert: true,
      });
      return result;
    } catch (error) {
      logger.error(`Error in upsertOne: ${this.#modelName}`, error);
      throw error;
    }
  }

  /**
   * Upsert many documents
   */
  async upsertMany(query, update, options = {}) {
    try {
      const result = await this.#model.updateMany(query, update, {
        ...options,
        upsert: true,
      });
      return result;
    } catch (error) {
      logger.error(`Error in upsertMany: ${this.#modelName}`, error);
      throw error;
    }
  }

  /**
   * Check if document exists
   */
  async exists(query) {
    try {
      const result = await this.#model.exists(query);
      return !!result;
    } catch (error) {
      logger.error(`Error in exists: ${this.#modelName}`, error);
      throw error;
    }
  }

  /**
   * Aggregate documents
   */
  async aggregate(pipeline) {
    try {
      const result = await this.#model.aggregate(pipeline);
      return result;
    } catch (error) {
      logger.error(`Error in aggregate: ${this.#modelName}`, error);
      throw error;
    }
  }

  /**
   * Get distinct values
   */
  async distinct(field, query = {}) {
    try {
      const result = await this.#model.distinct(field, query);
      return result;
    } catch (error) {
      logger.error(`Error in distinct: ${this.#modelName}`, error);
      throw error;
    }
  }
}

/**
 * Transaction Manager Class
 */
export class TransactionManager {
  constructor() {
    this.session = null;
  }

  /**
   * Start a new transaction
   */
  async start() {
    this.session = await mongoose.startSession();
    this.session.startTransaction();
    return this.session;
  }

  /**
   * Commit the transaction
   */
  async commit() {
    if (this.session) {
      await this.session.commitTransaction();
      await this.session.endSession();
      this.session = null;
    }
  }

  /**
   * Abort/rollback the transaction
   */
  async abort() {
    if (this.session) {
      await this.session.abortTransaction();
      await this.session.endSession();
      this.session = null;
    }
  }

  /**
   * Execute operations within a transaction
   */
  async execute(callback) {
    try {
      await this.start();
      const result = await callback(this.session);
      await this.commit();
      return result;
    } catch (error) {
      await this.abort();
      throw error;
    }
  }
}
