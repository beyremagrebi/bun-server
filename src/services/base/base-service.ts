import type {
  Collection,
  Filter,
  ObjectId,
  OptionalUnlessRequiredId,
  WithId,
} from "mongodb";
import type { BaseModel } from "../../models/base/base-model";

export class BaseService<T extends BaseModel> {
  protected collection: Collection<T>;

  constructor(collection: Collection<T>) {
    this.collection = collection;
  }

  async getAll(skip?: number, limit?: number): Promise<WithId<T>[]> {
    let cursor = this.collection.find();
    if (typeof skip === "number" && typeof limit === "number") {
      cursor = cursor.skip(skip).limit(limit);
    }
    return cursor.toArray();
  }

  async countAll(): Promise<number> {
    return this.collection.countDocuments();
  }

  async create(
    data: OptionalUnlessRequiredId<T>,
  ): Promise<{ insertedId: ObjectId; data: OptionalUnlessRequiredId<T> }> {
    const result = await this.collection.insertOne(data);
    if (!result.insertedId) {
      throw new Error("Failed to insert document: insertedId is undefined");
    }
    return { insertedId: result.insertedId, data };
  }

  async getById(_id: ObjectId): Promise<WithId<T> | null> {
    const filter: Filter<T> = { _id } as Filter<T>;
    return this.collection.findOne(filter);
  }

  async deleteAll(): Promise<void> {
    await this.collection.deleteMany();
  }
}
