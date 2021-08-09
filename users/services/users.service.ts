// Modelo de CRUD que percorre entre a aplicação
import { CRUD } from "../../common/interfaces/crud.interface";

// DTOs (modelos)
import { CreateUserDto } from "../dtos/create.user.dto";
import { PutUserDto } from "../dtos/put.user.dto";
import { PatchUserDto } from "../dtos/patch.user.dto";

// Os métodos que o nosso banco de dados suporta
import UsersDao from "../daos/user.dao";

// Não só o usersService, mas qualquer outro módulo implementaria o CRUD, mantendo o padrão entre a aplicação. Perfeito!!
class UsersService implements CRUD {
  // Em cada um dos serviços disponibilizados, temos o DTO relacionado. Isto para o banco de dados saber o tipo de dados que ele deve aceitar.
  // Todos os serviços são async (assíncronos), isto porque as requisições em banco têm um tempo de carregamento.

  async create(resource: CreateUserDto) {
    return UsersDao.addUser(resource);
  }

  async deleteById(id: string) {
    return UsersDao.removeUserById(id);
  }

  // Limite e página caso tenhamos um front, por exemplo, e queremos carregar usuários por página (para não fica pesada a request).
  async list(limit: number, page: number) {
    return UsersDao.getUsers(limit, page);
  }

  async patchById(id: string, resource: PatchUserDto) {
    return UsersDao.updateUserById(id, resource);
  }

  async readById(id: string) {
    return UsersDao.getUserById(id);
  }

  async putById(id: string, resource: PutUserDto) {
    return UsersDao.updateUserById(id, resource);
  }

  async getUserByEmail(email: string) {
    return UsersDao.getUserByEmail(email);
  }
}

export default new UsersService();
