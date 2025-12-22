[![npm version](https://badge.fury.io/js/rc4-crypto.svg)](https://badge.fury.io/js/rc4-crypto)

# rc4-crypto

A tiny Node.js / TypeScript library that implements the **RC4** stream cipher and provides a convenient **Transform stream** for piping data through RC4.

> ⚠️ **Security note:** RC4 is considered *cryptographically weak* and has been deprecated in many modern protocols. Use this library only for **legacy compatibility**, not for new security-sensitive designs.

## Install

```bash
npm install rc4-crypto
```

## Quick start

RC4 is a stream cipher: **encryption and decryption are the same operation**. If you encrypt with a key, you decrypt by running RC4 again with the **same key**.

```ts
import { RC4 } from 'rc4-crypto';

const key = 'my-secret-key';
const plaintext = 'Hello, RC4!';

// Encrypt
const enc = new RC4(key);
const ciphertext = enc.update(plaintext); // Buffer
console.log(ciphertext.toString('hex'));

// Decrypt (same key)
const dec = new RC4(key);
const decrypted = dec.update(ciphertext);
console.log(decrypted.toString('utf8')); // -> "Hello, RC4!"
```

## API

### `class RC4`

#### `new RC4(key: Buffer | string)`
Creates a new RC4 cipher instance and initializes it with the given key.

- If `key` is a string, it is converted to a `Buffer` using Node’s default encoding (`utf8`).

#### `update(data: Buffer | string): Buffer`
Encrypts/decrypts `data` and returns it as a `Buffer`.

- If `data` is a string, it is converted to a `Buffer` (`utf8`) before processing.
- **Important:** this operation mutates the underlying buffer in-place.

#### `updateFromBuffer(data: Buffer): Buffer`
Same as `update`, but accepts **only** a `Buffer`.

- **Important:** the passed buffer is modified in-place and the same buffer is returned.

#### `skip(length: number): void`
Advances the RC4 keystream by `length` bytes without producing output.

This can be used for “RC4-dropN” style usage (dropping the first N bytes of keystream) when working with legacy systems that expect it.

---

### `class RC4Transform extends stream.Transform`

A Node.js `Transform` stream that applies RC4 to every incoming chunk.

#### `new RC4Transform(key: Buffer | string, transformOptions?: TransformOptions)`
Creates a transform stream.

- The transform is configured with `decodeStrings: true` by default.
- Incoming chunks must be `Buffer`s. If a chunk is not a `Buffer`, an `RC4TypeError` is emitted.

## Errors

- `RC4Error extends Error`
- `RC4TypeError extends RC4Error`

The library currently uses `RC4TypeError` to report invalid chunk types in `RC4Transform`.

## Examples

### 1) Encrypt to hex, decrypt back

```js
const { RC4 } = require('rc4-crypto');

const key = 'k';
const text = 'secret message';

const cipher = new RC4(key);
const encrypted = cipher.update(text); // Buffer
const hex = encrypted.toString('hex');

const decipher = new RC4(key);
const decrypted = decipher.update(Buffer.from(hex, 'hex'));

console.log(hex);
console.log(decrypted.toString());
```

### 2) Avoid in-place mutation (copy the buffer)

`updateFromBuffer()` modifies the buffer you pass in. If you need to keep the original, copy it first:

```ts
import { RC4 } from 'rc4-crypto';

const rc4 = new RC4('key');
const original = Buffer.from('data');

const working = Buffer.from(original); // copy
const out = rc4.updateFromBuffer(working);

console.log(original.toString()); // still "data"
console.log(out.toString('hex'));
```

### 3) Encrypt/decrypt files using streams

```js
const fs = require('fs');
const { pipeline } = require('stream');
const { RC4Transform } = require('rc4-crypto');

const key = 'file-key';

// Encrypt: input.bin -> encrypted.bin
pipeline(
  fs.createReadStream('input.bin'),
  new RC4Transform(key),
  fs.createWriteStream('encrypted.bin'),
  (err) => {
    if (err) console.error('encrypt failed:', err);
    else console.log('encrypted.bin written');
  }
);

// Decrypt: encrypted.bin -> output.bin
pipeline(
  fs.createReadStream('encrypted.bin'),
  new RC4Transform(key),
  fs.createWriteStream('output.bin'),
  (err) => {
    if (err) console.error('decrypt failed:', err);
    else console.log('output.bin written');
  }
);
```

### 4) Drop the first N bytes of keystream (legacy)

Some legacy systems discard the first bytes of RC4 output.

```ts
import { RC4 } from 'rc4-crypto';

const rc4 = new RC4('key');
rc4.skip(1024); // drop first 1024 bytes

const out = rc4.update('hello');
console.log(out.toString('hex'));
```

## Compatibility

- Node.js: `>= 6.0.0` (as declared in `package.json`)
- Output module format: CommonJS (`require`) with TypeScript type declarations.

## License

MIT
