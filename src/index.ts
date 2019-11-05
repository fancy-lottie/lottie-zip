import * as compressing from 'compressing';
import * as os from 'os';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as pump from 'pump';
import { rimraf } from 'mz-modules';

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

// 压缩文件夹里面的lottie内容 zip 到指定目录
const packLottie = async (source: string, dest: string) => {
  // 创建zip流
  const zipStream = new compressing.zip.Stream();
  // 添加json数据
  zipStream.addEntry(path.join(source, 'data.json'));
  // 添加images文件夹
  zipStream.addEntry(path.join(source, 'images'));
  // 输出流
  const destStream = fs.createWriteStream(dest);
  // 等待流执行完毕返回
  return new Promise((resolve, reject) => {
    pump(zipStream, destStream, (err) => {
      if (err) { return reject(err); }
      resolve();
    });
  });
};

// 生成随机目录
const randomSavePath = (pathname: string): string => {
  const hash = crypto.randomBytes(7).toString('hex');
  const basePath = path.join(pathname, hash, 'lottiezip');
  fse.ensureDirSync(basePath);
  fse.ensureDirSync(basePath + '/images');
  return basePath;
};

const zipJSON = async (lottieData: string, options?: object) => {
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
  const zipPath = os.tmpdir();
  const defaultOptions = {
    zipPath,
    rmZipDir: false,
    ...options,
  };
  const tempDist = randomSavePath(defaultOptions.zipPath);
  // 抽取json的图片 base64
  lottieObj.assets = await Promise.all(
    lottieObj.assets.map(async asset => {
      // 非 img 数据，则原数据返回
      if (!asset.p) {
        return asset;
      }
      // 不处理 base64 和 远程资源
      if (!asset.p.includes('base64,')) {
        return asset;
      }
      const imgFileName = `img_${asset.id}.png`;
      const imageBase64 = asset.p.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(path.join(tempDist, 'images/', imgFileName), imageBase64, 'base64');
      return {
        ...asset,
        e: 1,
        u: 'images/',
        p: imgFileName,
      };
    }),
  );
  // json 转 buffer
  const compressLottieBuffer = Buffer.from(JSON.stringify(lottieObj));
  // buffer 写入临时文件
  const lottieFilePath = path.join(tempDist, 'data.json');
  fs.writeFileSync(lottieFilePath, compressLottieBuffer);
  // 压缩文件
  const zipDist = path.join(defaultOptions.zipPath, 'lottie-compress.zip');
  await packLottie(tempDist, zipDist);
  const zipBuffer = fs.readFileSync(zipDist);
  // 删除临时文件
  if (defaultOptions.rmZipDir) {
    await rimraf(tempDist);
    await rimraf(path.dirname(zipDist));
  }
  // 返回压缩文件的buffer
  return zipBuffer;
};

export default zipJSON;
