import qs from 'qs';
import { AxiosCanceler } from './axiosCancel';
import { isFunction, cloneDeep } from 'lodash';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { RequestOptions, Result } from './axios';

export interface CreateAxiosOptions extends AxiosRequestConfig {
  authenticationScheme?: string;
  transform?: AxiosTransform;
  requestOptions?: RequestOptions;
}

export abstract class AxiosTransform {
  beforeRequestHook?: (config: AxiosRequestConfig, options: RequestOptions) => AxiosRequestConfig;

  transformResponseHook?: (res: AxiosResponse<Result>, options: RequestOptions) => any;

  requestCatchHook?: (e: Error, options: RequestOptions) => Promise<any>;

  requestInterceptors?: (
    config: AxiosRequestConfig,
    options: CreateAxiosOptions
  ) => AxiosRequestConfig;

  responseInterceptors?: (res: AxiosResponse<any>) => AxiosResponse<any>;

  requestInterceptorsCatch?: (error: Error) => void;

  responseInterceptorsCatch?: (axiosInstance: AxiosResponse, error: Error) => void;
}

export class Request {
  private instance: AxiosInstance;
  private readonly options: CreateAxiosOptions;

  constructor(options: CreateAxiosOptions) {
    this.options = options;
    this.instance = axios.create(options);
    this.setupInterceptors();
  }

  get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'GET' }, options);
  }

  post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'POST' }, options);
  }

  put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'PUT' }, options);
  }

  delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'DELETE' }, options);
  }

  request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    let conf: CreateAxiosOptions = cloneDeep(config);
    const transform = this.getTransform();

    const { requestOptions } = this.options;

    const opt: RequestOptions = Object.assign({}, requestOptions, options);

    const { beforeRequestHook, requestCatchHook, transformResponseHook } = transform || this.defaultTransform();
    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt);
    }
    conf.requestOptions = opt;

    conf = this.supportFormData(conf);

    return new Promise((resolve, reject) => {
      this.instance.request<any, AxiosResponse<Result>>(conf)
        .then((res: AxiosResponse<Result>) => {
          if (transformResponseHook && isFunction(transformResponseHook)) {
            try {
              const ret = transformResponseHook(res, opt);
              resolve(ret);
            } catch (err) {
              reject(err || new Error('request error!'));
            }
            return;
          }
          resolve(res as unknown as Promise<T>);
        })
        .catch((e: Error | AxiosError) => {
          if (requestCatchHook && isFunction(requestCatchHook)) {
            reject(requestCatchHook(e, opt));
            return;
          }

          if (axios.isAxiosError(e)) {
            // rewrite error message from axios in here
          }

          reject(e);
        });
    });
  }

  supportFormData(config: AxiosRequestConfig) {
    const headers = config.headers || this.options.headers;
    const contentType = headers?.['Content-Type'] || headers?.['content-type'];

    if ( contentType !== 'application/x-www-form-urlencoded;charset=UTF-8' || !Reflect.has(config, 'data') || config.method?.toUpperCase() === 'GET' ) {
      return config;
    }

    return {
      ...config,
      data: qs.stringify(config.data, { arrayFormat: 'brackets' }),
    };
  }

  private defaultTransform() : AxiosTransform {
    return {
      transformResponseHook: (res: AxiosResponse<Result>, options: RequestOptions) => {
        const { isTransformResponse, isReturnNativeResponse } = options;

        if (isReturnNativeResponse) {
          return res;
        }

        if (!isTransformResponse) {
          return res.data;
        }

        const { data } = res;

        if (!data) {
          throw new Error('获取接口数据异常');
        }

        const { code, message } = data;

        const hasSuccess = data && Reflect.has(data, 'code') && code === 200;
        if (hasSuccess) {
          return data.data;
        }

        throw new Error("接口请求异常：" + message);
      },
      beforeRequestHook: (config, options) => {
        const { urlPrefix } = options;
        if (urlPrefix) {
          config.url = `${urlPrefix}${config.url}`;
        }

        return config;
      },      
    }
  }

  private getTransform() {
    const { transform } = this.options;
    return transform;
  }

  private setupInterceptors() {
    const transform = this.getTransform();
    if (!transform) {
      return;
    }
    const {
      requestInterceptors,
      requestInterceptorsCatch,
      responseInterceptors,
      responseInterceptorsCatch,
    } = transform;

    const axiosCanceler = new AxiosCanceler();

    this.instance.interceptors.request.use((config: AxiosRequestConfig) => {
      // @ts-ignore
      const { ignoreCancelToken } = config.requestOptions;
      const ignoreCancel = ignoreCancelToken !== undefined ? ignoreCancelToken : this.options.requestOptions?.ignoreCancelToken;

      !ignoreCancel && axiosCanceler.addPending(config);
      if (requestInterceptors && isFunction(requestInterceptors)) {
        config = requestInterceptors(config, this.options);
      }
      return config;
    }, undefined);

    requestInterceptorsCatch &&
      isFunction(requestInterceptorsCatch) &&
      this.instance.interceptors.request.use(undefined, requestInterceptorsCatch);

    this.instance.interceptors.response.use((res: AxiosResponse<any>) => {
      res && axiosCanceler.removePending(res.config);
      if (responseInterceptors && isFunction(responseInterceptors)) {
        res = responseInterceptors(res);
      }
      return res;
    }, undefined);

    responseInterceptorsCatch &&
      isFunction(responseInterceptorsCatch) &&
      this.instance.interceptors.response.use(undefined, (error) => {
        // @ts-ignore
        return responseInterceptorsCatch(this.axiosInstance, error);
      });
  }
}