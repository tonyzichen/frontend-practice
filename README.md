# Frontend Practice · 前端课程练习

这个仓库记录了我的前端课程练习，包括 8 次课堂作业、3 个综合作业和期末项目。大部分页面以杭州为主题，练习内容涵盖 HTML 结构、CSS 响应式布局、JavaScript 交互、本地存储、异步数据加载、图表和三维场景。

各作业按目录独立保存，可以分别运行和查看源码。想先看综合效果，可以打开 [期末大作业「诗画杭州」](期末大作业/index.html)。

## 本地运行

项目使用静态 HTML、CSS 和 JavaScript，无需安装 npm 依赖或执行构建。推荐通过本地 HTTP 服务访问，保证 JSON 数据能够正常加载。

在仓库根目录执行以下命令，需要已安装 Python 3。

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Windows 可以使用：

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

在浏览器打开 [http://127.0.0.1:8000/](http://127.0.0.1:8000/)，通过目录列表进入对应作业。期末项目的入口是 [http://127.0.0.1:8000/期末大作业/index.html](http://127.0.0.1:8000/期末大作业/index.html)。使用完毕后，在终端按 `Ctrl+C` 停止服务。

也可以用 VS Code 的 Live Server 扩展打开对应 HTML 文件。早期的简单页面可以直接双击查看；涉及 Fetch 或 Ajax 加载 JSON 的页面应通过 HTTP 服务访问，避免浏览器对 `file://` 的限制。

## 课堂练习

| 目录 | 练习内容 | 页面入口 |
| --- | --- | --- |
| `class1/` | HTML 基础、个人介绍、杭州城市介绍 | [个人主页](class1/introduceMyself.html) · [杭州介绍](class1/introduceMyHometown.html) |
| `class2/` | 表单控件、信息收集、纯 CSS 表单状态与折叠效果 | [课程反馈](class2/index.html) · [失物招领](class2/CampusLostandFoundRegistration.html) · [杭州信息收集](class2/HangzhouInfoCollection.html) |
| `class3/` | CSS 布局、响应式设计、Bootstrap、深色模式与打印样式 | [诗画杭州](class3/hangzhou.html) · [纯 CSS 课程展示](class3/响应式纯css.html) · [Bootstrap 版](class3/bootstrap.html) |
| `class4/` | JavaScript 基础、成绩统计与预算计算 | [成绩统计](class4/班级成绩统计.html) · [一日游预算](class4/杭州一日游预算工具.html) |
| `class5/` | DOM 操作、事件委托、localStorage、JSON 导出与存储容错 | [任务清单](class5/class5案例复现.html) · [杭州地点收藏](class5/hangzhou.html) |
| `class6/` | 异步加载 JSON、ECharts 与 Chart.js、并行请求和图表联动 | [图书馆看板](class6/library.html) · [西湖客流看板](class6/hangzhou-dashboard.html) |
| `class7/` | Three.js、A-Frame、轨道控制器、点击拾取与性能实验 | [杭州三维场景](class7/my-scene.html) · [旋转展示台](class7/class7复现.html) · [校园场景](class7/campus.html) |
| `class8/` | 多页面整合、景点搜索、数据看板、三维展示与网页质量实验 | [诗画杭州](class8/index.html) · [校园信息中心复现](class8/复现/index.html) |

部分目录还保留了案例复现、选做题和独立研究页面，可直接进入目录查看。`class4/班级成绩统计.html` 的计算结果输出在浏览器开发者工具的 Console 中。

## 综合作业

| 目录 | 项目 | 主要内容 |
| --- | --- | --- |
| `大作业一/` | [人间天堂杭州综合展示](大作业一/index.html) | 城市概况、景点、美食与信息收集表单，结合 Bootstrap 和自定义样式排版 |
| `大作业二/` | [杭州游览助手](大作业二/index.html) | 城市介绍、一日游预算、地点收藏、筛选、本地存储与 JSON 导出 |
| `大作业三/` | [走进杭州](大作业三/index.html) | 异步景点查询、ECharts 和 Chart.js 图表、Three.js 西湖场景与 A-Frame 展示 |
| `期末大作业/` | [诗画杭州 · 信息与数据展示中心](期末大作业/index.html) | 将城市介绍、景点探索、行程管理、数据看板和三维展示整合为多页面项目 |

## 期末项目「诗画杭州」

期末项目使用 HTML、CSS、JavaScript、Bootstrap、jQuery、ECharts 和 Three.js，没有后端或数据库。

| 页面 | 功能 |
| --- | --- |
| [城市首页](期末大作业/index.html) | 杭州概况、推荐景点和各功能入口 |
| [景点探索](期末大作业/explore.html) | 关键词搜索、景点分类与收藏状态筛选，支持收藏、标记打卡和加入行程，并展示杭帮菜介绍 |
| [我的行程](期末大作业/planner.html) | 调整游览顺序、管理收藏、设置预算、记录分类消费、载入费用样例、导出 JSON 和打印 |
| [数据看板](期末大作业/dashboard.html) | 月度客流柱状图与趋势图，以及个人消费分类和收藏状态统计 |
| [三维展示](期末大作业/scene.html) | 西湖、雷峰塔和断桥的几何示意场景，支持旋转、缩放和点击选择地标 |

项目内的文件按用途组织：

```text
期末大作业/
├── index.html          # 城市首页
├── explore.html        # 景点探索
├── planner.html        # 我的行程
├── dashboard.html      # 数据看板
├── scene.html          # 三维展示
├── css/                # 公共样式与各页面样式
├── js/                 # 公共逻辑、本地存储与各页面交互
├── data/               # 景点、美食、客流和费用样例 JSON
├── images/             # 图片与标识
├── libs/               # 本地第三方库
└── README.md           # 项目运行说明
```

更多运行说明见 [期末项目 README](期末大作业/README.md)。

## 技术与数据说明

仓库主要使用原生 HTML、CSS 和 JavaScript。Bootstrap 用于部分页面布局，jQuery 用于 DOM 操作与 Ajax，ECharts 和 Chart.js 用于图表，Three.js、OrbitControls 和 A-Frame 用于三维展示。不同作业使用的库有所区别，以各页面实际引用为准。

多数第三方库保存在对应作业的 `libs/` 目录中。`class3/bootstrap.html` 和 `大作业一/index.html` 通过 CDN 加载 Bootstrap，访问这些页面时需要联网。

客流、借阅统计和费用样例等数据用于课堂演示，具体来源见各页面或数据文件说明。期末项目的客流为模拟数据，景点票价和样例费用也不是实时价格；三维模型为几何示意，不代表真实形制或测绘比例。

收藏、行程、预算和消费记录保存在当前浏览器的 `localStorage` 中。更换浏览器、切换访问地址或清除站点数据后，原记录不会自动同步。需要保留记录时，可以在「我的行程」页面导出 JSON。
