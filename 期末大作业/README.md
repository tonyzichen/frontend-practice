# 诗画杭州 信息与数据展示中心

这是一个杭州主题的前端课程作业。使用 HTML、CSS、JavaScript、Bootstrap、jQuery、ECharts 和 Three.js，没有后端和数据库。

## 运行方法

1. 安装 Git 和 Python 3。如果使用源码压缩包，可以直接解压，跳过克隆步骤。
2. 使用 `git clone https://github.com/tonyzichen/frontend-practice` 下载代码。
3. 在终端进入 `frontend-practice/期末大作业` 文件夹。
4. 执行 `python3 -m http.server 8000 --bind 127.0.0.1`。Windows 可以执行 `py -m http.server 8000 --bind 127.0.0.1`。
5. 在浏览器打开 http://127.0.0.1:8000/index.html 。
6. 用完后在终端按 Ctrl+C 停止服务。

不能直接双击 HTML，因为浏览器会限制本地 JSON 加载。也可以用 VS Code 的 Live Server 扩展打开 index.html。

## 第三方库

Bootstrap、jQuery、ECharts、Three.js 和 OrbitControls 保存在 libs 中。