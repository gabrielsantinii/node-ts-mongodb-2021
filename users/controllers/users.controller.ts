// Importamos o express para podermos adicionar as tipagens (Request e Response) para os controllers
import express from 'express';

// Importamos os services de usuários, que são de fato as ações que podemos realizar com os usuários
import usersService from '../services/users.service';

// Importamos o Argon2 que faz o hash (encripta) da senha.
import argon2 from 'argon2';

// Importamos o Debug para ambiente de desenvolvimento
import debug from 'debug';

const log: debug.IDebugger = debug('app:users-controller');
class UsersController {
    // Cada um dos controllers tem o papel de saber qual serviço ele deve chamar.

    // Listagem de usuários
    async listUsers(req: express.Request, res: express.Response) {
        const users = await usersService.list(100, 0);
        res.status(200).send(users);
    }

    // Usuário por Id
    async getUserById(req: express.Request, res: express.Response) {
        const user = await usersService.readById(req.body.id);
        res.status(200).send(user);
    }

    // Criar usuário
    async createUser(req: express.Request, res: express.Response) {
        req.body.password = await argon2.hash(req.body.password);
        const userId = await usersService.create(req.body);
        res.status(201).send({ id: userId });
    }

    // Atualizar campos específicos do usuário
    async patch(req: express.Request, res: express.Response) {
        if (req.body.password) {
            req.body.password = await argon2.hash(req.body.password);
        }
        log(await usersService.patchById(req.body.id, req.body));
        res.status(204).send();
    }

    // Atualizar todos campos do usuário
    async put(req: express.Request, res: express.Response) {
        req.body.password = await argon2.hash(req.body.password);
        log(await usersService.putById(req.body.id, req.body));
        res.status(204).send();
    }

    // Remover o usuário
    async removeUser(req: express.Request, res: express.Response) {
        log(await usersService.deleteById(req.body.id));
        res.status(204).send();
    }
}

export default new UsersController();