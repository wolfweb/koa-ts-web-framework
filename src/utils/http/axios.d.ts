export interface RequestOptions {
  apiUrl?: string;
  joinTime?: boolean;
  urlPrefix?: string;
  withToken?: boolean;
  joinPrefix?: boolean;
  formatDate?: boolean;
  responseType?: string;
  retryRequest?: RetryRequest;
  joinParamsToUrl?: boolean;
  errorMessageMode?: ErrorMessageMode;
  ignoreCancelToken?: boolean;
  isTransformResponse?: boolean;
  isReturnNativeResponse?: boolean;
}

export interface Result<T = any> {
  code: number;
  message: string;
  data?: T;
}

export interface UploadFileParams {
  data?: Recordable;
  name?: string;
  file: File | Blob;
  filename?: string;
  [key: string]: any;
}
