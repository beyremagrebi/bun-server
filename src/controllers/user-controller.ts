import { userCollection } from "../config/connection-database";
import type { User } from "../models/user";
import { Get, Post, Route } from "../routes/router-manager";
import { ResponseHelper } from "../utils/response-helper";


@Route("/user")
class UserController {

  @Get("/getAll")
  async getAllUsers(req: Request): Promise<Response> {
    try {
      const users = await userCollection.find().toArray();

      return ResponseHelper.success(users)
    } catch (error) {
      return ResponseHelper.serverError()
    }
  }
@Post("/add-user")
async createUser(req: Request): Promise<Response> {
  try {
    const body = await req.json() as Omit<User, "_id">;

    if (!body.email || !body.firstName) {
      return ResponseHelper.error("Email and name are required");
    }

    const { insertedId } = await userCollection.insertOne(body);

    return ResponseHelper.success({
      id: insertedId,
      email: body.email,
      firstName: body.firstName,
    });
  } catch (error) {
    return ResponseHelper.serverError();
  }
}

}

export default UserController
