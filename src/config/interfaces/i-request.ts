import type { Blob } from "buffer";
import { jwtDecode } from "jwt-decode";
import { ObjectId } from "mongodb";
import type {
  FormData,
  Headers,
  ReferrerPolicy,
  Request,
  RequestCache,
  RequestCredentials,
  RequestDestination,
  RequestMode,
  RequestRedirect,
} from "undici-types";
import { URL } from "url";
import type { User } from "../../models/user";

export class ServerRequest implements Request {
  // Wrapped original request
  private original: Request;

  // Custom properties
  params: Record<string, string> = {};
  query: Record<string, string | string[]> = {};
  user: User | null = null;

  // Required properties from Request interface
  headers: Headers;
  method: string;
  url: string;
  body: ReadableStream<Uint8Array> | null;
  bodyUsed: boolean;
  cache: RequestCache;
  credentials: RequestCredentials;
  destination: RequestDestination;
  integrity: string;
  mode: RequestMode;
  redirect: RequestRedirect;
  referrer: string;
  referrerPolicy: ReferrerPolicy;
  signal: AbortSignal;
  keepalive: boolean;
  readonly duplex = "half" as const;

  constructor(original: Request) {
    this.original = original;

    // Copying properties from original request
    this.headers = original.headers;
    this.method = original.method;
    this.url = original.url;
    this.body = original.body;
    this.bodyUsed = original.bodyUsed;
    this.cache = original.cache;
    this.credentials = original.credentials;
    this.destination = original.destination;
    this.integrity = original.integrity;
    this.mode = original.mode;
    this.redirect = original.redirect;
    this.referrer = original.referrer;
    this.referrerPolicy = original.referrerPolicy;
    this.signal = original.signal;
    this.keepalive = original.keepalive;

    // Custom logic
    this.query = this.parseQueryParams();
    this.user = this.getUserFromTokenSync();
  }
  blob(): Promise<Blob> {
    return this.original.blob();
  }

  clone(): Request {
    return this.original.clone();
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return this.original.arrayBuffer();
  }

  formData(): Promise<FormData> {
    return this.original.formData();
  }

  json(): Promise<unknown> {
    return this.original.json();
  }

  text(): Promise<string> {
    return this.original.text();
  }

  private parseQueryParams(): Record<string, string | string[]> {
    const url = new URL(this.url);
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

  private getUserFromTokenSync(): User | null {
    const authHeader = this.headers.get("authorization");
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
}
