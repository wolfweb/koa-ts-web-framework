import KoaRouter from "@koa/router";
import * as controllers from "@/controllers";

const routers = new KoaRouter();

const routeMappings = {
  "get": routers.get,
  "post": routers.post,
  "put": routers.put,
  "delete": routers.delete,
};

const getRoutePath = (basePath: string, funcName: string): string => {
  for (var it in routeMappings){
    const key = funcName.toString().toLowerCase() ;
    if(key === it) return basePath;

    if(key.startsWith(it)) return basePath + key.substring(it.length).toLowerCase();
  }

  return basePath;
}

for (var i in controllers) {
  //@ts-ignore
  const controller = new controllers[i];
  const prototype = Object.getPrototypeOf(controller);
  
  Reflect.ownKeys(controller.__proto__).forEach(key => {
    if (key !== 'constructor' && typeof controller[key] === 'function') {
      for (var it in routeMappings) {
        if (key.toString().toLowerCase().startsWith(it)) {
          const fn = prototype[key];
          const route = Reflect.getMetadata(Symbol.for('PATH_METADATA'), fn);
          let routePath = "";
          if(route){
            routePath = route.startsWith("~/") ? route.substring(1) : `${controller.path}${route}`;
          }else{
            routePath = getRoutePath(controller.path, key.toString());
          }
          console.log(`register {route: ${routePath}, method: ${it}}, path => ${routePath}, `);
          //@ts-ignore
          routeMappings[it].call(routers, routePath, async (ctx)=>{
            //@ts-ignore
            await controller[key](ctx);
          });
        }
      }
    }
  })
}


var router = [
  routers.routes(),
]

export default router;