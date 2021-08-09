// shortid nos ajuda a gerar o ID de usuário de forma fácil.
import shortid from "shortid";

// Debug para darmos o log no servidor.
import debug from "debug";

// Mongoose
import mongooseService from "../../common/services/mongoose.service";

// Como os DAOs utilizam dos DTOs, precisamos importar neste arquivo os DTOs criados.
import { CreateUserDto } from "../dtos/create.user.dto";
import { PatchUserDto } from "../dtos/patch.user.dto";
import { PutUserDto } from "../dtos/put.user.dto";

const log: debug.IDebugger = debug("app:in-memory-dao");

class UsersDao {
  // Definimos que nossos users são uma lista de CreateUserDto (onde o firstName e lastName são opcionais).
  users: Array<CreateUserDto> = [];

  Schema = mongooseService.getMongoose().Schema;

  userSchema = new this.Schema(
    {
      _id: String,
      email: String,
      // o "select: false" em password irá ocultar este campo sempre que obtivermos um usuário ou listarmos todos os usuários.
      password: { type: String, select: false },
      firstName: String,
      lastName: String,
      permissionFlags: Number,
    },
    // desabilita a geração de ID automática, que o próprio mongoose faz.
    { id: false }
  );

  User = mongooseService.getMongoose().model("Users", this.userSchema);

  constructor() {
    log("Created new instance of UsersDao");
  }

  // Obs: Todas ações têm exec() no fim, isto é opcional mas é recomendado, então vamos seguir o padrão.

  // ---- CRIAÇÃO

  // // Para criar um usuário:
  async addUser(userFields: CreateUserDto) {
    const userId = shortid.generate();
    const user = new this.User({
      _id: userId,
      ...userFields,
      permissionFlags: 1,
    });
    await user.save();
    return userId;
  }

  // ---- LEITURA

  // // Para ler todos usuários.
  async getUsers(limit = 25, page = 0) {
    return this.User.find()
      .limit(limit)
      .skip(limit * page)
      .exec();
  }

  // // Para ler um usuário por Id.
  async getUserById(userId: string) {
    return this.User.findOne({ _id: userId }).populate("User").exec();
  }

  // // Para ler um usuário por E-mail. Isto pode ser útil para evitar duplicidade de e-mails.
  async getUserByEmail(email: string) {
    return this.User.findOne({ email: email }).exec();
  }

  // ---- ATUALIZAÇÃO

  // // Atualizar um usuário por completo ou parte dele (PUT ou PATCH), como referência seu ID.
  async updateUserById(userId: string, userFields: PatchUserDto | PutUserDto) {
    const existingUser = await this.User.findOneAndUpdate(
      { _id: userId },
      { $set: userFields },
      // A "new: true" significa que queremos que o Mongoose nos retorne o usuário após a atualização, e não como estava antes.
      { new: true }
    ).exec();

    return existingUser;
  }

  // ---- EXCLUSÃO
  // Excluir um usuário, como referência seu ID.
  async removeUserById(userId: string) {
    return this.User.deleteOne({ _id: userId }).exec();
  }

  async getUserByEmailWithPassword(email: string) {
    return this.User.findOne({ email: email })
      .select("_id email permissionFlags +password")
      .exec();
  }
}

export default new UsersDao();
