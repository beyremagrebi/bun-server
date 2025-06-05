import type {
  Collection,
  Document,
  Filter,
  ObjectId,
  OptionalUnlessRequiredId,
  WithId,
} from "mongodb";
import type { BaseModel } from "../../models/base/base-model";
export interface LookupConfig {
  from: string; // Target collection name
  localField: string; // Field in the current collection
  foreignField: string; // Field in the target collection
  as: string; // Output field name
  unwind?: boolean; // Optional: Unwind joined array
  select?: string[];
}

export class BaseService<T extends BaseModel> {
  protected collection: Collection<T>;

  constructor(collection: Collection<T>) {
    this.collection = collection;
  }

  async getAll(
    skip?: number,
    limit?: number,
    lookups?: LookupConfig[],
  ): Promise<WithId<T>[]> {
    const pipeline: Document[] = [];

    if (lookups) {
      for (const lookup of lookups) {
        pipeline.push({
          $lookup: {
            from: lookup.from,
            localField: lookup.localField,
            foreignField: lookup.foreignField,
            as: lookup.as,
          },
        });

        if (lookup.unwind) {
          pipeline.push({
            $unwind: {
              path: `$${lookup.as}`,
              preserveNullAndEmptyArrays: true,
            },
          });
        }

        if (lookup.select) {
          // Keep only selected fields in the joined doc
          const projectedFields: Record<string, unknown> = {};
          for (const field of lookup.select) {
            projectedFields[`${lookup.as}.${field}`] = 1;
          }

          // Always preserve root-level fields
          projectedFields["_id"] = 1;

          pipeline.push({ $project: projectedFields });
        }
      }
    }

    if (typeof skip === "number") pipeline.push({ $skip: skip });
    if (typeof limit === "number") pipeline.push({ $limit: limit });

    return this.collection.aggregate(pipeline).toArray() as Promise<
      WithId<T>[]
    >;
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
