import Koa from "koa";
import winston from "winston";
import KoaBody from "koa-body";
import KoaCors from "@koa/cors";
import KoaLogger from "koa-logger";
import KoaHelmet from "koa-helmet";
import KoaCompose from "koa-compose";
import logger from "@/middleware/logger";
import exception from '@/middleware/exception';
import resultWrap from '@/middleware/resultWrap';
import authenticate from "@/middleware/authenticate";

import router from "@/router";

const App = new Koa();

const useCompose: any = [
  KoaCors(),
  KoaHelmet(),
  KoaBody({
    multipart: true,
  }),
  KoaLogger(),
  
  exception,
  logger(winston),
  authenticate,
  resultWrap,
  
  ...router,
];

App.use(KoaCompose(useCompose));

export default App;
