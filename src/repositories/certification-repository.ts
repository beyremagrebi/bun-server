import type { ICertificationRepository } from "../interfaces/skill/i-certification-repository";
import { CollectionsManager } from "../models/base/collection-manager";
import type { Certification } from "../models/certifications";

export class CertificationRepository implements ICertificationRepository {
  private collection = CollectionsManager.certificationCollection;
  async addCertification(certification: Certification): Promise<Certification> {
    const result = await this.collection.insertOne(certification);
    return { ...certification, _id: result.insertedId };
  }
}
