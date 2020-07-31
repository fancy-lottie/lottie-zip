import * as assert from 'assert';
import lottieZip from '../src/index';
import * as fs from 'fs';
import * as path from 'path';
const data = fs.readFileSync(path.resolve(__dirname, 'fixtures/sage.json')).toString();

describe('lottieZip', () => {
  it('lottieZip', async () => {
    const lottieZipBuffer = await lottieZip(data, {});
    fs.writeFileSync(path.join(__dirname, 'lottie.zip'), lottieZipBuffer);
    console.log('lottieZipBuffer', lottieZipBuffer);
  });
  it('lottieJson is lottie json object', async () => {
    await lottieZip(JSON.parse(data), {});
  });
  it('lottieJson is empty string', async () => {
    const res = await lottieZip('', {});
    assert.equal(res, null);
  });
});
