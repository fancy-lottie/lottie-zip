import * as compressing from 'compressing';
import * as streamToBuffer from 'stream-to-buf';
import zip2json from './zip_to_json';

interface ILottieJSONAsset {
  id: string;
  u?: string;
  p?: string;
  e?: number;
  layers?: ILottieJSONLayer[];
}

interface ILottieJSONLayer {
  ty: number;
  nm: string;
  ks: any;
  ao: number;
  ddd: number;
  ind: number;
  ip: number;
  op: number;
  refId?: string;
}

interface ILottieJSON {
  // 版本
  v: string;
  // 帧率
  fr: number;
  // 起始关键帧
  ip: number;
  // 结束关键帧
  op: number;
  // 宽度
  w: number;
  // 高度
  h: number;
  // 合成名称
  nm: string;
  // 3d
  ddd: number;
  // 资源信息
  assets: ILottieJSONAsset[];
  // 图层信息
  layers: ILottieJSONLayer[];
  markers: ILottieJSONLayer[];
}

const zipJSON = async (lottieData: string | ILottieJSON, options?: object) => {
  let lottieObj;
  if (typeof lottieData === 'string') {
    try {
      lottieObj = JSON.parse(lottieData);
    } catch (error) {
      console.error(error);
      return null;
    }
  } else if (typeof lottieData === 'object') {
    lottieObj = JSON.parse(JSON.stringify(lottieData));
  }

  // 创建zip流
  const zipStream = new compressing.zip.Stream();

  const IMG_BASE64_RE = /^data:image\/(\S+);base64,(\S+)/i;
  lottieObj.assets.forEach(asset => {
    // 非 img 数据，则原数据返回
    if (!asset.p) {
      return;
    }
    // 不处理 base64 和 远程资源
    if (!asset.p.includes('base64,')) {
      return;
    }

    const matchData = asset.p.match(IMG_BASE64_RE) || [];
    const imgFileName = `img_${asset.id}.${matchData[1] || 'png'}`;
    const imageBase64 = matchData[2] || '';

    zipStream.addEntry(Buffer.from(imageBase64, 'base64'), {
      relativePath: 'images/' + imgFileName,
    });
    asset.u = 'images/';
    asset.p = imgFileName;
  });

  zipStream.addEntry(Buffer.from(JSON.stringify(lottieObj)), {
    relativePath: 'data.json',
  });

  return await streamToBuffer(zipStream);
};

const json2zip = zipJSON;

export default zipJSON;
export {
  zip2json,
  json2zip,
};
