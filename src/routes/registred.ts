import type { Document } from "mongodb";
import type { BaseController } from "../controllers/base-controller";
import { Router } from "./router";

export class Registred<T extends Document> {
  protected Controllers: Array<new () => BaseController<T>> = [];
  public router: Router<T>;

  constructor(controllers: Array<new () => BaseController<T>>) {
    this.router = new Router<T>();
    this.Controllers = controllers;
    this.init();
  }

  init() {
    this.router.registerControllers(this.Controllers);
  }
}
