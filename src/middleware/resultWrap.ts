import { Context, Next } from "koa";

export default async (ctx: Context, next: Next) => {
  await next();
  
  if (ctx.state.type === 'html') {
    return;
  }

  const body = ctx.body;
  if (body && typeof body === "object") {
    ctx.body = {
      code: ctx.status,
      data: body,
    };
  }
}