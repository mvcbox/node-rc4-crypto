import { Buffer } from 'buffer';

export class RC4 {
  protected _i: number = 0;
  protected _j: number = 0;
  protected readonly _box: Buffer;

  public constructor(key: Buffer | string) {
    if (!(key instanceof Buffer)) {
      key = Buffer.from ? Buffer.from(key) : new Buffer(key);
    }

    this._box = Buffer.allocUnsafe ? Buffer.allocUnsafe(0x100) : new Buffer(0x100);
    let l = 0;

    for (let k = 0; k < 0x100; ++k) {
      this._box[k] = k;
    }

    for (let k = 0; k < 0x100; ++k) {
      l = (l + this._box[k] + key[k % key.length]) % 0x100;
      let s = this._box[k];
      this._box[k] = this._box[l];
      this._box[l] = s;
    }
  }

  public update(data: Buffer | string): Buffer {
    if (!(data instanceof Buffer)) {
      data = Buffer.from ? Buffer.from(data) : new Buffer(data);
    }

    return this.updateFromBuffer(data);
  }

  public updateFromBuffer(data: Buffer): Buffer {
    for (let k = 0; k < data.length; ++k) {
      let i = (this._i + 1) % 0x100;
      let j = (this._j + this._box[i]) % 0x100;
      let s = this._box[i];
      this._box[i] = this._box[j];
      this._box[j] = s;
      data[k] ^= this._box[(this._box[i] + this._box[j]) % 0x100];
      this._i = i;
      this._j = j;
    }

    return data;
  }

  public skip(length: number): void {
    for (let k = 0; k < length; ++k) {
      let i = (this._i + 1) % 0x100;
      let j = (this._j + this._box[i]) % 0x100;
      let s = this._box[i];
      this._box[i] = this._box[j];
      this._box[j] = s;
      this._i = i;
      this._j = j;
    }
  }
}
