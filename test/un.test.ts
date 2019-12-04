import * as assert from 'assert';
import * as fs from 'fs';
import { zip2json } from '../src/index';

const zipStream = fs.createReadStream(__dirname + '/fixtures/lottie_unzipper.zip');

describe('zip_to_json', () => {
  it('zipToJSON success', async () => {
    const bufs: any = await zip2json(zipStream);
    assert(bufs.length);
    const buf = bufs[0];
    assert(typeof buf.assets[0].p === 'string');
  });

  it('zipToJSON json name not data.json success', async () => {
    const notName = fs.createReadStream(__dirname + '/fixtures/lottie_name_not_data.zip');
    const bufs: any = await zip2json(notName);
    assert(bufs.length);
    const buf = bufs[0];
    assert(typeof buf.assets[0].p === 'string');
  });

  it('zipToJSON error', async () => {
    try {
      await zip2json(fs.createReadStream(__dirname + '/fixtures/lottie_error.zip'));
    } catch (err) {
      assert(err instanceof Error);
    }
  });
});
