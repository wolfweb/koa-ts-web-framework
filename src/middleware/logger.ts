import {Context, Next} from "koa";
import { transports, format } from "winston";

const logger = (winstonInstance: any): any => {
  winstonInstance.configure({
      level: "debug",
      transports: [
          new transports.Console({
              format: format.combine(
                  format.colorize(),
                  format.simple()
              )
          })
      ]
  });

  return async (ctx: Context, next: Next): Promise<void> => {
      const start = new Date().getTime();

      await next();

      const ms = new Date().getTime() - start;

      let logLevel: string;
      if (ctx.status >= 500) {
          logLevel = "error";
      } else if (ctx.status >= 400) {
          logLevel = "warn";
      } else {
          logLevel = "info";
      }

      const msg = `${ctx.method} ${ctx.originalUrl} ${ctx.status} ${ms}ms`;

      winstonInstance.log(logLevel, msg);
  };
};

export default logger;