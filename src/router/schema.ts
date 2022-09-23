import "reflect-metadata";

export interface IController {
  path: string;
}

export function Route(path: string) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(Symbol.for('PATH_METADATA'), path, descriptor.value);
  };
}