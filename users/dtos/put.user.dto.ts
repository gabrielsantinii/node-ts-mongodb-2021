// Na atualização (put) de um usuário, temos todos os campos obrigatórios, uma vez que para atualizar, precisamos atualizar por completo.
export interface PutUserDto {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  permissionLevel: number;
}
