# node-ts-mongodb-2021
## REST API utilizando as últimas features em Nodejs, utilizando Typescript, MongoDB e Expressjs.

### PARTE 3 - Models (DB), Services, Controllers e Middlewares. 

### Na parte 1, abordamos as configurações iniciais, inicializando nossa API. Agora, é hora de adicionar funcionalidades à nossa aplicação, como: criar, atualizar, ler e exclur usuários (CRUD).

### Para isso, temos alguns passos a realizar:

O primeiro deles é a configuração dos nossos usuários, como os dados que eles podem receber, atualizar etc.
Nessa parte, utilizaremos dos conceitos DAOs e DTOs.

Os DTOs são objetos que estão em conformidade com os modelos de dados e os DAOs são os serviços que os utilizam.

- Data Transfer Objects (DTOs)
    - É a nossa maneira de definir a estrutura de dados. Aqui, por exemplo, é onde dizemos que o usuário terá um nome, e-mail e senha.
- Data Access Objects (DAOs)
    - Estes são nossos métodos de acesso ao banco de dados. DAOs são responśaveis por conectar-se ao banco de dados, capturar os dados e retorná-los à camada que o chamou.

### Criando nossos DTOs de user

Primeiro, definiremos três DTOs para nosso `user`. Vamos criar uma pasta chamada `dto` dentro da `users`  e criar um arquivo chamado `create.user.dto.ts` contendo o seguinte:

```tsx
// Na criação de um usuário, temos os campos obrigatórios (id, email, password) e os opcionais (firstName, lastName, permissionLevel)
export interface CreateUserDto {
  id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  permissionLevel?: number;
}
```

Este DTO serve como modelo de informações que precisamos/podemos ter na **CRIAÇÃO** de um usuário. Mas, neste projeto, poderemos não só criar, mas também atualizar (`PUT` e `PATCH`)

Entendido isso, precisamos criar nossos outros DTOs. Agora é a vez do `PUT`

```tsx
// Na atualização (put) de um usuário, temos todos os campos obrigatórios, uma vez que para atualizar, precisamos atualizar por completo.
export interface PutUserDto {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  permissionLevel: number;
}
```

Além disso, temos nossa atualização parcial, que seria o PATCH. Para este caso, temos um elemento do Typescript que nos ajuda, seria o Partial.

```tsx
import { PutUserDto } from "./put.user.dto";

// No patch, atualizaremos informações **específicas** e não mais todo o objeto, como no put.
// Por isso, utilizamos a ferramenta Partial, to próprio Typescript.
export interface PatchUserDto extends Partial<PutUserDto> {}
```

Bom, temos os nossos DTOs, que são os modelos de dados. Agora, além dos modelos, precisamos dos `métodos` que teremos disponíveis nesse módulo (`users`). Como já dito, os métodos são os DAOs, então vamos criar o DAO de users.

Vamos criar uma pasta chamada `daos` dentro da `users`  e adicionar um arquivo chamado `users.dao.ts`.

Primeiro, vamos importar nosos DTOs:

```tsx
// Como os DAOs utilizam dos DTOs, precisamos importar neste arquivo os DTOs criados.
import { CreateUserDto } from "../dtos/create.user.dto";
import { PatchUserDto } from "../dtos/patch.user.dto";
import { PutUserDto } from "../dtos/put.user.dto";
```

Para gerarmos nossos IDs de usuário, usaremos a biblioteca `shortid` 

```tsx
yarn add shortid
yarn add @types/shortid -D

// npm i shortid
// npm i --save-dev @types/shortid
```

De volta ao `users.dao.ts`, vamos importar o shortid e nosso debug.

```tsx
// shortid nos ajuda a gerar o ID de usuário de forma fácil.
import shortid from "shortid";

// Debug para darmos o log no servidor.
import debug from "debug";

const log: debug.IDebugger = debug("app:in-memory-dao");
```

Temos os DTOs em mão, gerador de IDs também. É hora de fazermos os métodos de criação, edição, remoção e leitura.

```tsx
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

  // // Para ler um usuário por E-mail. Isto é útil para evitar duplicidade de e-mails.
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
```

Podem perceber que não estamos conectando nossa API à nenhum banco de dados, por enquanto. Faremos isso na parte 3, utilizando o MongoDB e Mongoose. Então nesta parte os usuários ficarão salvos em memória, isto significa que a cada vez que rodarmos nosso código, os usuários serão resetados.

Como citado anteriormente, nossa aplicação funcionará como um CRUD. Isto significa que, durante toda a aplicação, teremos os métodos `GET`, `POST`, `PUT`, `PATCH` e `DELETE`.
Então, para que melhor que explicitarmos isso em toda a aplicação?

Como na parte 1, onde configuramos as rotas na pasta `common`, agora vamos configurar os métodos CRUD, em `common/interfaces`, criando o arquivo `crud.interface.ts`.

```tsx
// Todos módulos implementarão um CRUD. Este arquivo permite padronizarmos isso.
export interface CRUD {
    list: (limit: number, page: number) => Promise<any>;
    create: (resource: any) => Promise<any>;
    putById: (id: string, resource: any) => Promise<string>;
    readById: (id: string) => Promise<any>;
    deleteById: (id: string) => Promise<string>;
    patchById: (id: string, resource: any) => Promise<string>;
}
```

### Com os DTOs e DAOs criados, é hora de criarmos os Services. É nele que vamos Implementar nosso CRUD.

Dentro da pasta `users`, vamos criar a pasta `services`. Esta vai conter o `arquivo users.service.ts`.

```tsx
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
    return UsersDao.getUsers();
  }

  async patchById(id: string, resource: PatchUserDto) {
    return UsersDao.patchUserById(id, resource);
  }

  async readById(id: string) {
    return UsersDao.getUserById(id);
  }

  async putById(id: string, resource: PutUserDto) {
    return UsersDao.putUserById(id, resource);
  }

  async getUserByEmail(email: string) {
    return UsersDao.getUserByEmail(email);
  }
}

export default new UsersService();
```

A camada `service` pareceu algo repetitivo, em relação aos `DAOs`? Pois isso na verdade é a estruturação básica, que vai nos permitir, quando formos trocar para o `MongoDB` (parte 3), atualizarmos apenas **uma parte do código**, mantendo a **mesma estrutura** da aplicação.

### Serviços configurados, hora de criarmos nossos Controllers

> Os Controllers, como falamos, são responsáveis por chamar os Services, capturar uma resposta e repassá-la ao cliente. Isso quer dizer que, ele não tem papel de fazer verificações, validações etc. Apenas chama o Service e devolve uma resposta ao cliente.

Antes de começar, precisaremos instalar uma biblioteca para fazer o hash da senha do usuário com segurança:

```tsx
yarn add argon2

// npm i argon2
```

Vamos começar criando uma pasta chamada `controllers` dentro da `users`  e criando um arquivo chamado `users.controller.ts` nela:

```tsx
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
```

Bom, os Controllers parecem simples, né? Eles são mesmo. Mas eles só são simples assim, por conta de retirarmos toda a parte de validações de suas costas. Para esse tipo de ação, criamos os Middlewares.

### Middlewares, quando e por que criar?

> Na nossa aplicação, temos exemplos claros de que forma utilizar os middlewares. Por exemplo, para atualizarmos o `user`, o cliente deve mandar o ID do user como parâmetro, certo? Então, para que nosso `Service` chame o `DAO` para a conexão com o banco, o ID do user **jamais** pode estar vazio. Nesse caso, precisamos prevenir que isso aconteça. Para isso, utilizamos o Middleware. O legal de utilizarmos Middlewares é que eles podem ser reaproveitados em quantas rotas quisermos!

Os middlewares que criaremos em nossa aplicação são:

- Garantia  da presença de campos de usuário, como `email` e `password;`
- Garantia de que um determinado e-mail ainda não esteja em uso;
- Garantia de que não estamos alterando o `email`;
- Validar se um determinado usuário existe.

Precisaremos de um novo arquivo `users/middlewares/users.middleware.ts`:

```tsx
import express from "express";
import userService from "../services/users.service";
import debug from "debug";

const log: debug.IDebugger = debug("app:users-controller");
class UsersMiddleware {
// Os middlewares contam com a req, res e **next**
// O next permite que a requisição avance para a próxima rota.
// Então em um middleware podemos tanto retornar um erro ao usuário, como dizer para o app "okay, pode seguir".
  async validateRequiredUserBodyFields(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (req.body && req.body.email && req.body.password) {
      next();
    } else {
      res.status(400).send({
        error: `Missing required fields email and password`,
      });
    }
  }

  async validateSameEmailDoesntExist(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await userService.getUserByEmail(req.body.email);
    if (user) {
      res.status(400).send({ error: `User email already exists` });
    } else {
      next();
    }
  }

  async validateSameEmailBelongToSameUser(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await userService.getUserByEmail(req.body.email);
    if (user && user.id === req.params.userId) {
      next();
    } else {
      res.status(400).send({ error: `Invalid email` });
    }
  }

  // Here we need to use an arrow function to bind `this` correctly
  validatePatchEmail = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (req.body.email) {
      log("Validating email", req.body.email);

      this.validateSameEmailBelongToSameUser(req, res, next);
    } else {
      next();
    }
  };

  async validateUserExists(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    const user = await userService.readById(req.params.userId);
    if (user) {
      next();
    } else {
      res.status(404).send({
        error: `User ${req.params.userId} not found`,
      });
    }
  }

// Este middleware é interessante pois ele capta o ID dos parâmetros (que estão na URL) e joga-o para o corpo (body) da requisição,
// facilitando a vida dos controllers!
  async extractUserId(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    req.body.id = req.params.userId;
    next();
  }
}

export default new UsersMiddleware();
```

### Bom, nós criamos bastante coisa aqui. Hora de atualizarmos nossas Rotas!

Antes de atualizarmos, vamos recapitular:

> Criamos nossos Controllers, que chamam Serviços, que chamam DAOs que acessam os dados. Criamos também os Middlewares para as verificações e validações de dados. Mas, se pararmos pra pensar, está tudo meio solto, tanto os Controllers como os Middlewares. Então, agora é hora de juntar tudo isso e ver a mágica acontecer.
No nosso arquivo `users.routes.config.ts`, que criamos na parte 1, vamos conectar os `Controllers` e os `Middlewares`, definindo assim, o **Fluxo de toda a requisição**.

Então, em `users.routes.config.ts`, teremos este resultado final, que combina tudo que evoluímos neste capítulo:

```tsx
import { CommonRoutesConfig } from "../common/common.routes.config";
import UsersController from "./controllers/users.controller";
import UsersMiddleware from "./middlewares/users.middleware";
import express from "express";

export class UsersRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, "UsersRoutes");
  }

  configureRoutes(): express.Application {
    this.app
      .route(`/users`)
      .get(UsersController.listUsers)
      .post(
        UsersMiddleware.validateRequiredUserBodyFields,
        UsersMiddleware.validateSameEmailDoesntExist,
        UsersController.createUser
      );

    // O middleware leva o parâmetro ID para o Body, isso facilita para as operações que necessitam do userId 
    this.app.param(`userId`, UsersMiddleware.extractUserId);
    this.app
      .route(`/users/:userId`)
      .all(UsersMiddleware.validateUserExists)
      .get(UsersController.getUserById)
      .delete(UsersController.removeUser);

    this.app.put(`/users/:userId`, [
      UsersMiddleware.validateRequiredUserBodyFields,
      UsersMiddleware.validateSameEmailBelongToSameUser,
      UsersController.put,
    ]);

    this.app.patch(`/users/:userId`, [
      UsersMiddleware.validatePatchEmail,
      UsersController.patch,
    ]);

    return this.app;
  }
}
```

Agora, teste tudo isso, em resumo você consegue cadastrar usuários, listar eles, atualizar e até mesmo excluir. Muito massa!