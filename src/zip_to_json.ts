import * as fs from 'fs';
import * as path from 'path';
import * as compressing from 'compressing';
import * as streamToBuf from 'stream-to-buf';

const zipToJSON = (stream: any) => {
  return new Promise((resolve, reject) => {
    const imageStreams = {};
    const jsonStreams = {};

    new compressing.zip.UncompressStream({
      source: stream,
    })
    .on('error', (err: any) => {
      reject(err);
    })
    .on('entry', (header, stream, next) => {
      if (header.name.includes('__MACOSX') || header.name.includes('.DS_Store')) {
        next();
        return;
      }

      if (header.type === 'file') {
        if (path.extname(header.name) === '.json') {
          const jsonPath = path.dirname(header.name);
          jsonStreams[jsonPath] = stream;
        } else {
          imageStreams[header.name] = stream;
        }
      }
      next();
    })
    .on('finish', () => {
      const bufList = Object.keys(jsonStreams).map(async jsonPath => {
        const jsonStream = jsonStreams[jsonPath];
        const jsonBuf = await streamToBuf(jsonStream);
        const lottieJson = JSON.parse(jsonBuf.toString());

        // NOTE 防御非 Lottie json 数据
        if (!lottieJson.assets || !lottieJson.layers) {
          return null;
        }

        lottieJson.assets = await Promise.all(
          lottieJson.assets.map(async (asset: any) => {
            if (!asset.u && !asset.p) { return asset; }
            // 不处理 base64 和远程资源
            if (asset.p.includes('base64,') || asset.p.includes('http')) { return asset; }

            const extname = path.extname(asset.p).substr(1) || 'png';
            const imgPath = path.join(jsonPath, asset.u, asset.p);

            if (!imageStreams[imgPath]) {
              return asset;
            }

            const imageBuffer = await streamToBuf(imageStreams[imgPath]);
            return {
              ...asset,
              e: 1,
              u: '',
              p: 'data:image/' + extname + ';base64,' + imageBuffer.toString('base64'),
            };
          }),
        );

        return lottieJson;
      });

      Promise.all(bufList).then(bufs => {
        resolve(bufs.filter(buf => !!buf));
      });
    });
  });
};

export default zipToJSON;
