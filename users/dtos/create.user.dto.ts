// Na criação de um usuário, temos os campos obrigatórios (id, email, password) e os opcionais (firstName, lastName, permissionLevel)
export interface CreateUserDto {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  permissionLevel?: number;
}
