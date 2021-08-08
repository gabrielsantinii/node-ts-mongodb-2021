import express from "express";

// Abstract força a rota que extender a common, a implementar as funcionalidades que têm abstract ao lado, no caso a configureRoutes.
export abstract class CommonRoutesConfig {
  app: express.Application;
  name: string;

  constructor(app: express.Application, name: string) {
    this.app = app;
    this.name = name;
    this.configureRoutes();
  }
  getName() {
    return this.name;
  }

  abstract configureRoutes(): express.Application;
}
