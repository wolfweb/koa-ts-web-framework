import { Request } from '@/utils/http/index';

export class UserProxy {
  private curl: Request;

  constructor(host: string) {
    this.curl = new Request({
      requestOptions:{
        urlPrefix: host,
        isTransformResponse: true
      }
    });
  }

  async getUserByToken(token: string) {
    const result = await this.curl.get({
      url: `/api/v1/token/${token}`,
    });

    return result;
  }
}