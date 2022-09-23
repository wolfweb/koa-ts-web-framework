import { Context, Next } from "koa";
import { UserProxy } from '@/backendProxy/userProxy';

function getCustomAuthorizationToken(headerName:string, type: string, ctx: Context) {
  const authorization = ctx.request.header[headerName] as string;
  if(authorization){
    const arr = authorization.split(" ");
    return arr[1];
  }
  return null;
}

function getAuthorizationToken(type: string, ctx: Context) {
    const authorization = ctx.request.header.authorization;
    if(authorization){
      const arr = authorization.split(" ");
      if(arr[0] === type) return arr[1];
    }
    return null;
}

function getCookieToken(name:string, ctx: Context) {
    return ctx.cookies.get(name);
}

export default async (ctx: Context, next: Next) => {
  let token : string | null | undefined;
  token = getAuthorizationToken("_token", ctx);

  if(!token) token = getCookieToken("_token", ctx);

  if (token) {
    const proxy = new UserProxy("");
    const user = await proxy.getUserByToken(token);
    console.log(`get user ${JSON.stringify(user)}`);
    ctx.state.user = user;
  }

  await next();
}