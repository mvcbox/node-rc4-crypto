import { RC4 } from './RC4';
import { Buffer } from 'buffer';
import { RC4TypeError } from './errors';
import { Transform, TransformOptions } from 'stream';

export class RC4Transform extends Transform {
  protected readonly _rc4: RC4;

  public constructor(key: Buffer | string, transformOptions?: TransformOptions) {
    super(Object.assign<TransformOptions, TransformOptions>({
      decodeStrings: true
    }, transformOptions ?? {}));

    this._rc4 = new RC4(key);
  }

  public _transform(chunk: Buffer, encoding: string, callback: Function): void {
    try {
      if (chunk instanceof Buffer) {
        callback(null, this._rc4.updateFromBuffer(chunk));
      } else {
        callback(new RC4TypeError('INVALID_CHUNK_TYPE'));
      }
    } catch (e) {
      callback(e);
    }
  }
}
