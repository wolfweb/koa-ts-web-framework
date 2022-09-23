import { IController, Route } from '@/router/schema';
import { Context } from 'koa';

export default class HomeController implements IController {
  path: string = "/";
  
  async get(ctx : Context) {
    ctx.body = "Hello from HomeController";
  }

  @Route("aliasName")
  async getName(ctx : Context) {
    const { name } = ctx.query || {};
    ctx.body = {
      name: "Hello " + name
    };
  }
}