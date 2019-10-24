import { describe, it } from 'mocha';
import * as assert from 'assert';
import lottieZip from '../src/index';
import * as fs from 'fs';
import * as path from 'path';
const data = fs.readFileSync(path.resolve(__dirname, 'fixtures/sage.json')).toString();

describe.only('lottieZip', () => {
  it('lottieZip', async () => {
    const lottieZipBuffer = await lottieZip(data, {
      zipPath: path.join(__dirname, 'zip'),
    });
    fs.writeFileSync(path.join(__dirname, 'lottie.zip'), lottieZipBuffer);
    console.log('lottieZipBuffer', lottieZipBuffer);
  });
  it('lottieJson is lottie json object', async () => {
    await lottieZip(JSON.parse(data), {
      zipPath: path.join(__dirname, 'zip'),
    });
  });
  it('lottieJson is empty string', async () => {
    const res = await lottieZip('', {
      zipPath: path.join(__dirname, 'zip'),
    });
    assert.equal(res, null);
  });
});
