import * as assert from 'assert';
import * as fs from 'fs';
import zipToJSON from '../src/zip_to_json';

const zipStream = fs.createReadStream(__dirname + '/fixtures/lottie_unzipper.zip');

describe('zip_to_json', () => {
  it('zipToJSON success', async () => {
    const bufs: any = await zipToJSON(zipStream);
    assert(bufs.length);
    const buf = bufs[0];
    assert(typeof buf.assets[0].p === 'string');
  });

  it('zipToJSON error', async () => {
    try {
      await zipToJSON(fs.createReadStream(__dirname + '/fixtures/lottie_error.zip'));
    } catch (err) {
      assert(err instanceof Error);
    }
  });
});
