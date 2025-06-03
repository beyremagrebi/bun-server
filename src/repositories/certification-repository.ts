import type { ObjectId } from "mongodb";
import type { ICertificationRepository } from "../interfaces/skill/i-certification-repository";
import { CollectionsManager } from "../models/base/collection-manager";
import type { Certification } from "../models/certifications";

export class CertificationRepository implements ICertificationRepository {
  async findById(id: ObjectId): Promise<Certification | null> {
    return await this.collection.findOne({ _id: id });
  }

  private collection = CollectionsManager.certificationCollection;
  async addCertification(certification: Certification): Promise<Certification> {
    const result = await this.collection.insertOne(certification);
    return { ...certification, _id: result.insertedId };
  }

  async deleteOne(id: ObjectId): Promise<void> {
    await this.collection.deleteOne({ _id: id });
  }
}
