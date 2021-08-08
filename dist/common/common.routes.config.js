"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonRoutesConfig = void 0;
// Abstract força a rota que extender a common, a implementar as funcionalidades que têm abstract ao lado, no caso a configureRoutes.
class CommonRoutesConfig {
    constructor(app, name) {
        this.app = app;
        this.name = name;
        this.configureRoutes();
    }
    getName() {
        return this.name;
    }
}
exports.CommonRoutesConfig = CommonRoutesConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLnJvdXRlcy5jb25maWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9jb21tb24vY29tbW9uLnJvdXRlcy5jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEscUlBQXFJO0FBQ3JJLE1BQXNCLGtCQUFrQjtJQUl0QyxZQUFZLEdBQXdCLEVBQUUsSUFBWTtRQUNoRCxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBQ0QsT0FBTztRQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNuQixDQUFDO0NBR0Y7QUFkRCxnREFjQyJ9