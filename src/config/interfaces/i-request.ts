import { jwtDecode } from "jwt-decode";
import { ObjectId } from "mongodb";
import { URL } from "url";
import type { User } from "../../models/user";

export class ServerRequest {
  originalRequest: Request;
  params: Record<string, string>;
  query: Record<string, string | string[]>;
  user?: User | null;

  constructor(request: Request) {
    this.originalRequest = request;
    this.params = {};
    this.query = this.parseQueryParams();
    this.user = this.getUserFromTokenSync();
  }

  private getUserFromTokenSync(): User | null {
    const authHeader = this.originalRequest.headers.get("authorization");
    if (!authHeader) return null;

    try {
      const token = authHeader.split(" ")[1];
      if (!token) return null;
      const decodedToken = jwtDecode<User>(token);
      decodedToken._id = new ObjectId(decodedToken._id);
      return decodedToken;
    } catch (error) {
      console.error("Token decode failed:", error);
      return null;
    }
  }

  private parseQueryParams(): Record<string, string | string[]> {
    const url = new URL(this.originalRequest.url);
    const query: Record<string, string | string[]> = {};

    url.searchParams.forEach((value, key) => {
      if (query[key]) {
        if (Array.isArray(query[key])) {
          (query[key] as string[]).push(value);
        } else {
          query[key] = [query[key] as string, value];
        }
      } else {
        query[key] = value;
      }
    });

    return query;
  }

  // Optional pass-through methods
  get method() {
    return this.originalRequest.method;
  }
  get url() {
    return this.originalRequest.url;
  }
  get headers() {
    return this.originalRequest.headers;
  }

  async json() {
    return this.originalRequest.json();
  }

  async text() {
    return this.originalRequest.text();
  }
}
