# 尸潮炮线

原创尸潮防守/割草网页游戏原型，灵感来自“自动开火、刷怪、升级三选一、局外养成”的手游循环，但使用独立世界观、名称和素材。

## 在线试玩

公开链接：`https://somniashan.github.io/spirit-survivors/`

把这个链接发给别人，对方在浏览器里点开就能玩。

## 本地运行

可以直接打开 `index.html`。如果浏览器限制本地资源，也可以在本目录启动静态服务：

```powershell
python -m http.server 4173
```

然后访问 `http://localhost:4173`。

## 操作

- 电脑：`WASD` 或方向键移动，`Esc` 暂停。
- 手机：按住屏幕左下摇杆并拖动移动。

## 当前内容

- 4 个守卫：机动枪手、战术工程师、疾行侦察兵、重装炮手。
- 12 种基础武器、8 种被动模块、12 种超载武器。
- 普通感染体、精英感染体、最终 Boss“尸潮母体”。
- 12 分钟标准局，拆成 5 段尸潮压力：废城街口、地铁检疫站、医院隔离区、工厂炉心、黎明防线。
- 自动攻击、经验升级、三选一强化、精英补给箱、超载配方、本地存档、永久升级、成就解锁。
- 场上道具：急救包、回收磁场、空袭信标。
- 已接入多张运行时视觉素材图集和程序化音效。

## QA 入口

这些地址使用独立 QA 存档，不影响正常试玩：

- `https://somniashan.github.io/spirit-survivors/?qa=levelup`：直接打开升级三选一界面。
- `https://somniashan.github.io/spirit-survivors/?qa=evolution`：快速验证补给箱和武器超载。
- `https://somniashan.github.io/spirit-survivors/?qa=powerups`：验证急救包、回收磁场和空袭信标。
- `https://somniashan.github.io/spirit-survivors/?qa=boss`：快速进入最终 Boss 阶段。
- `https://somniashan.github.io/spirit-survivors/?qa=victory`：快速验证胜利结算。
- `https://somniashan.github.io/spirit-survivors/?qa=showcase`：展示高密度尸潮、超载武器和特效。
- `https://somniashan.github.io/spirit-survivors/?qa=stress`：生成高密度敌人和特效，用于性能压测。
