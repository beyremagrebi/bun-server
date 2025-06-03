import type { Certification } from "../../models/certifications";

export interface ICertificationRepository {
  addCertification(certification: Certification): Promise<Certification>;
}
