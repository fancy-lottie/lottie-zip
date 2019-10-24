## lottie-zip

将 lottie 单 json 文件压缩为zip, 目录结构如下

```bash
├── lottie.zip
├── lottie
│   ├── data.json
│   └── images
│       ├── img_0.png
│       ├── img_1.png
│       ├── img_2.png
│       ├── img_3.png
│       ├── img_4.png
│       ├── img_5.png
│       ├── img_6.png
│       ├── img_7.png
│       ├── img_8.png
│       ├── img_9.png
│       ├── img_a.png
│       ├── img_b.png
│       ├── img_c.png
│       └── img_d.png
```

## Install

```bash
npm i -S lottie-zip
```

## Usage

```bash
import lottieZip from 'lottie-zip';

(async () => {
  const lottieZipBuffer = await lottieZip(data, {
    zipPath: path.join(__dirname, 'zip'),
  });
  fs.writeFileSync(path.join(__dirname, 'lottie.zip'), lottieZipBuffer);
})();
```