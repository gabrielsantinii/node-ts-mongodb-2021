// shortid nos ajuda a gerar o ID de usuário de forma fácil.
import shortid from "shortid";

// Debug para darmos o log no servidor.
import debug from "debug";

// Como os DAOs utilizam dos DTOs, precisamos importar neste arquivo os DTOs criados.
import { CreateUserDto } from "../dtos/create.user.dto";
import { PatchUserDto } from "../dtos/patch.user.dto";
import { PutUserDto } from "../dtos/put.user.dto";

const log: debug.IDebugger = debug("app:in-memory-dao");

class UsersDao {
  // Definimos que nossos users são uma lista de CreateUserDto (onde o firstName e lastName são opcionais).
  users: Array<CreateUserDto> = [];

  constructor() {
    log("Created new instance of UsersDao");
  }

  // ---- CRIAÇÃO

  // // Para criar um usuário:
  async addUser(user: CreateUserDto) {
    user.id = shortid.generate();
    this.users.push(user);
    return user.id;
  }

  // ---- LEITURA

  // // Para ler todos usuários.
  async getUsers() {
    return this.users;
  }

  // // Para ler um usuário por Id.
  async getUserById(userId: string) {
    return this.users.find((user: { id: string }) => user.id === userId);
  }

  // // Para ler um usuário por E-mail. Isto pode ser útil para evitar duplicidade de e-mails.
  async getUserByEmail(email: string) {
    const objIndex = this.users.findIndex(
      (obj: { email: string }) => obj.email === email
    );
    let currentUser = this.users[objIndex];
    if (currentUser) {
      return currentUser;
    } else {
      return null;
    }
  }

  // ---- ATUALIZAÇÃO

  // // Atualizar um usuário por completo, como referência seu ID.
  async putUserById(userId: string, user: PutUserDto) {
    const objIndex = this.users.findIndex(
      (obj: { id: string }) => obj.id === userId
    );
    this.users.splice(objIndex, 1, user);
    return `${user.id} updated via put`;
  }

  // // Atualizar campos específicos do usuário, como referência seu ID.
  async patchUserById(userId: string, user: PatchUserDto) {
    const objIndex = this.users.findIndex(
      (obj: { id: string }) => obj.id === userId
    );
    let currentUser = this.users[objIndex];
    const allowedPatchFields = [
      "password",
      "firstName",
      "lastName",
      "permissionLevel",
    ];
    for (let field of allowedPatchFields) {
      if (field in user) {
        // @ts-ignore
        currentUser[field] = user[field];
      }
    }
    this.users.splice(objIndex, 1, currentUser);
    return `${user.id} patched`;
  }

  // ---- EXCLUSÃO
  // Excluir um usuário, como referência seu ID.
  async removeUserById(userId: string) {
    const objIndex = this.users.findIndex(
      (obj: { id: string }) => obj.id === userId
    );
    this.users.splice(objIndex, 1);
    return `${userId} removed`;
  }
}

export default new UsersDao();
