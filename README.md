# node-ts-mongodb-2021
Latest features in nodejs, using typescript, express and mongodb

1. Para iniciar o projeto, podemos dar o comando init.

```jsx
yarn init // npm init
```

1. Para nosso projeto, teremos 4 bibliotecas que ajudam bastante no momento de desenvolvimento da API.
- Debug
    - É um módulo que usaremos para evitar a chamada de console.log () durante o desenvolvimento de nosso aplicativo. Dessa forma, podemos filtrar facilmente as instruções de depuração durante a solução de problemas.
- Winstonis
    - Responsável por registrar solicitações para nossa API e as respostas (e erros) retornadas.
    - express-winston
        - Integra-se diretamente com Express.js, de forma que todo o código de registro winston relacionado à API padrão já está feito.
- Cors
    - Cors é uma parte do middleware Express.js que nos permite habilitar o compartilhamento de recursos de origem cruzada. Sem isso, nossa API só poderia ser usada em front-ends servidos exatamente no **mesmo** subdomínio de nosso back-end.

1. É importante sabermos o porquê de utilizarmos cada biblioteca. Agora que entendemos, podemos fazer a **instalação**.

```jsx
yarn add express debug winston express-winston cors
// npm i express debug winston express-winston cors
```

1. Além de instalarmos essas bibliotecas, temos algumas dependências de desenvolvimento que nos ajuda enquanto estamos produzindo nossa API.

As dependências @types/bilbioteca se fazem necessárias por conta de estarmos utilizando Typescript. [Typescript](https://www.typescriptlang.org/) é a ferramenta de desenvolvimento que nos ajuda a escrever o melhor código, prevenindo erros inesperados quando a API estiver em produção.

```jsx
yarn add @types/cors @types/express @types/debug source-map-support tslint typescript -D
// npm i --save-dev @types/cors @types/express @types/debug source-map-support tslint typescript
```

1. Feito isso, nosso package.json, deve estar da seguinte maneira:

```json
"dependencies": {
    "debug": "^4.2.0",
    "express": "^4.17.1",
    "express-winston": "^4.0.5",
    "winston": "^3.3.3",
    "cors": "^2.8.5"
},
"devDependencies": {
    "@types/cors": "^2.8.7",
    "@types/debug": "^4.1.5",
    "@types/express": "^4.17.2",
    "source-map-support": "^0.5.16",
    "tslint": "^6.0.0",
    "typescript": "^3.7.5"
}
```

1. Teremos nossa aplicação separada por módulos. Isto é, para cada parte de nossa aplicação, teremos uma estrutura específica. Em cada um dos módulos, teremos o seguinte modelo:

- **Route configuration**
    - Para definir as rotas que nossa API aceitará.
- **Services**
    - Para tarefas que nosso back-end realizará. Por exemplo, consultas à banco de dados, conexão com serviços de terceiros etc.
- **Middleware**
    - Para realizar validações específicas ao meio de cada requisição. Por exemplo, uma validação de uma rota que necessita de um usuário logado para acessar.
- **Models**
    - Para definir os dados que o banco de dados receberá, isso nos ajuda a entender quais dados a API pode receber e enviar.
- **Controllers**
    - Para separar a configuração da rota (**Route configuration**) e o código final. Os **Controllers** chamam os **Services,** obtém o retorno e **dão uma resposta ao cliente**.

1. Além dos módulos, temos as configurações padrões, que servem para a aplicação como um todo. Esse tipo de configuração, armazenaremos na pata **common**.

### Agora, vamos começar a desenhar a estrutura da aplicação.

Vamos trabalhar com uma API de usuários, então vamos criar duas pastas agora:

- common
    - Nossa configuração que percorre por toda a API.
- users
    - Nosso módulo de usuários, que vai conter toda a estrutura citada anteriormente.

> Em common, criaremos nosso arquivo `common.routes.config.ts` de configuração de rota único, este servirá para todas as rotas dos módulos da aplicação.
Neste arquivo, obrigaremos que todas rotas trabalhe com rotas da MESMA forma. Para isso, utilizamos a classe com `abstract`

```tsx
import express from "express";

// Abstract força a rota que extender a common, a implementar as funcionalidades que têm abstract ao lado, no caso a configureRoutes.
export abstract class CommonRoutesConfig {
  app: express.Application;
  name: string;

  constructor(*app*: express.Application, *name*: string) {
    this.app = *app*;
    this.name = *name*;
    this.configureRoutes();
  }
  getName() {
    return this.name;
  }

  abstract configureRoutes(): express.Application;
}
```

> Este arquivo, utilizaremos no nosso primeiro módulo, o de `users`
Em nossa pasta users, teremos um arquivo `users.routes.config.ts` que terá as declarações de todas rotas relacionadas à usuários.

```tsx
import { CommonRoutesConfig } from "../common/common.routes.config";
import express from "express";

// Reaproveita a common routes, visto que a common percorre como uma configuração entre a aplicação como um todo.
export class UsersRoutes extends CommonRoutesConfig {
  constructor(*app*: express.Application) {
    super(*app*, "UsersRoutes");
  }

  configureRoutes() {
    this.app
      .route(`/users`)
      .get((req: express.Request, res: express.Response) => {
        res.status(200).send(`List of users`);
      })
      .post((req: express.Request, res: express.Response) => {
        res.status(200).send(`Post to users`);
      });

    this.app
      .route(`/users/:userId`)
      .all(
        (
          req: express.Request,
          res: express.Response,
          next: express.NextFunction
        ) => {
          // Estamos deixando nosso middleware já pronto
          next();
        }
      )
      .get((req: express.Request, res: express.Response) => {
        res.status(200).send(`GET requested for id ${req.params.userId}`);
      })
      .put((req: express.Request, res: express.Response) => {
        res.status(200).send(`PUT requested for id ${req.params.userId}`);
      })
      .patch((req: express.Request, res: express.Response) => {
        res.status(200).send(`PATCH requested for id ${req.params.userId}`);
      })
      .delete((req: express.Request, res: express.Response) => {
        res.status(200).send(`DELETE requested for id ${req.params.userId}`);
      });

    return this.app;
  }
}
```

> Agora, temos nossas configurações feitas em `common`, bem como nosso primeiro módulo `users`. Com isso, devemos configurar o `app.ts`, que incializará o servidor.

```tsx
import express from "express";
import * as http from "http";

import * as winston from "winston";
import * as expressWinston from "express-winston";
import cors from "cors";
import { CommonRoutesConfig } from "./common/common.routes.config";
import { UsersRoutes } from "./users/users.routes.config";
import debug from "debug";

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = 3000;
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug("app");

// Aqui estamos colocando JSON como middleware para que todas requests venham em JSON.
app.use(express.json());

// Aqui estamos adicionando CORS como middleware, assim qualquer origem pode nos enviar requests.
app.use(cors());

// Aqui configuramos o express-winston para logar no nosso console as requisições.
const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true })
  ),
};

if (!process.env.DEBUG) {
  loggerOptions.meta = false; // Quando não estamos debugando, desativa o debug (configurado no package.json, nos scripts).
}

// Aqui adicionamos o Winston como middleware na aplicação para realizar os Logs.
app.use(expressWinston.logger(loggerOptions));

// Aqui adicionamos o módulo de usuários ao nosso array de rotas.
routes.use(new UsersRoutes(app));

const runningMessage = `Server is running!`;
server.listen(port, () => {
  debugLog(`Length of modules: ${routes.length}`);
  routes.forEach((route: CommonRoutesConfig) => {
    debugLog(`Routes configured for ${route.getName()}`);
  });

  console.log(runningMessage);
});
```

> Além da configuração, temos que definir nossos `scripts`. Estes ficam no `package.json`
Então, no package.json, adicionamos os seguintes scripts:

```json
"scripts": {
    "start": "tsc && node --unhandled-rejections=strict ./dist/app.js",
    "debug": "export DEBUG=* && yarn start",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
```
