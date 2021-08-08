# node-ts-mongodb-2021
Latest features in nodejs, using typescript, express and mongodb

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
