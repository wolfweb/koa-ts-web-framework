import { Readable } from 'stream';

export class stringStream extends Readable {
  private _done: boolean;
  private _str: string;
  constructor(str: string) {
    super();
    this._str = str;
    this._done = false;
  }
  _read() {
    if (!this._done) {
      this._done = true;
      this.push(this._str);
      this.push(null);
    }
  }
}

export function stream2String(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    stream.setEncoding('utf8');
    stream.on('data', (chunk) => {
      chunks.push(chunk.toString());
    }).on('end', () => {
      resolve(chunks.join(''));
    }).on('error', (err) => {
      reject(err);
    });
  });
}

export function stream2Base64(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    stream.on('data', (chunk) => {
      chunks.push(chunk.toString());
    }).on('end', () => {
      resolve(Buffer.from(chunks.join('')).toString('base64'));
    }).on('error', (err) => {
      reject(err);
    });
  });
}
