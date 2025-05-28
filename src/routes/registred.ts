import type { BaseController } from "../controllers/base/base-controller";
import { Router } from "./router";
import type { BaseModel } from "../models/base/base-model";

export class Registred<T extends BaseModel> {
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
