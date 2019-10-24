import { describe, it } from 'mocha';
import * as assert from 'assert';
import zipJSON from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

describe.only('zipJSON', () => {
  it('zipJSON', async () => {
    const data = fs.readFileSync(path.resolve(__dirname, 'fixtures/sage.json')).toString();
    // console.log(data);
    const lottieJSON = await zipJSON(data, {
      zipPath: path.join(__dirname, 'zip'),
    });
    fs.writeFileSync(path.join(__dirname, 'lottie.zip'), lottieJSON);
    console.log('lottieJSON', lottieJSON);
  });
});
