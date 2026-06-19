# 灵潮幸存者

原创修仙题材 Survivors-like 网页游戏原型。核心循环包括角色选择、自动施法、妖潮围攻、经验升级、三选一强化、精英宝箱、法宝进化、Boss、灵石结算和永久升级。

## 运行

可以直接打开 `index.html`，也可以在本目录启动静态服务：

```powershell
python -m http.server 4173
```

然后访问 `http://localhost:4173`。

## 操作

- 电脑：`WASD` 或方向键移动，`Esc` 暂停。
- 手机：按住并拖动移动。

## 首版内容

- 4 个角色
- 12 种基础法宝
- 8 种心法
- 12 种进化法宝
- 15 种普通妖物
- 3 种精英妖将
- 1 个最终 Boss
- 12 分钟标准局拆成 5 个连续关卡：青岚山门、幽沼毒径、寒骨地宫、虚空裂坛、血月妖城，每关有不同妖潮池、精英池和出潮节奏
- 本地存档和永久升级
- 原创菜单背景图和程序化战斗视觉
- 高品质视觉方向稿 `assets/concept-visual-target.png`
- 历史战斗资源参考图 `assets/combat-asset-reference-v1.png`（不参与运行时加载）
- 高级主角/怪潮透明图集 `assets/premium-player-atlas-v3.png`、`assets/premium-horde-atlas-v2.png`、`assets/premium-minion-atlas-v3.png`
- 法宝/心法 UI 图标图集 `assets/item-icon-atlas-v1.png`
- 低干扰实战战场底图 `assets/arena-bg-readable-v1.png`
- 高级屏幕冲击/斩击特效图集 `assets/premium-screen-strike-atlas-v1.png`
- 单位脚下/移动存在感特效图集 `assets/premium-unit-aura-atlas-v1.png`
- 进化技能释放瞬间特效图集 `assets/premium-ultimate-cast-atlas-v1.png`
- 高级技能领域/地面事件图集 `assets/premium-area-event-atlas-v1.png`
- 高级弹道拖尾/主角移动残影图集 `assets/premium-motion-trail-atlas-v1.png`
- 高级怪潮压迫感屏幕叠层图集 `assets/premium-swarm-pressure-atlas-v1.png`
- 程序化音效、氛围音和静音开关
- 成就系统和角色解锁
- 回血、全图吸附、清屏三类场上道具；摄灵阵会随机掉落，拾取后瞬间吸收全场经验、灵石，并把宝箱和其他道具拉到身边
- 新增玄铁重斩、虚空黑洞、剑灵召唤、莲花雷印四条技能线，对应裂空天斩、归墟裂隙、万剑侍从、九霄雷莲四种进化
- 菜单内置语言选择，支持中文、英文、日文和法文核心界面文本

## 声音

游戏使用 Web Audio 生成轻量音效，不依赖外部音频文件。升级、宝箱、进化、受击、拾取、胜利和失败都会触发不同反馈。菜单和战斗 HUD 都有声音开关，状态会保存在本地存档中。

## 美术方向

当前目标是暗黑修仙题材的高可读 2.5D 幸存者画面：深色战场、强轮廓怪潮、中心法阵、粗亮弹道、清晰颜色分区和大面积技能领域。`assets/concept-visual-target.png` 是整体氛围方向稿，`assets/arena-bg-readable-v1.png` 是当前实战战场底图，保留石板、祭坛和法阵氛围，但压低了容易被误看成妖物或掉落物的青色晶体、红色裂缝和金色小法阵细节。运行时还会在背景和背景雾之后、所有妖物/掉落物/弹道之前加一层低透明可读性遮罩，让背景稳定退到舞台层。`assets/premium-horde-atlas-v2.png` 是当前普通怪潮主图集，强化了符甲、尸傀、青铜虫甲、魂火和黑金法袍等暗黑修仙元素。`assets/premium-projectile-atlas-v1.png`、`assets/premium-motion-trail-atlas-v1.png`、`assets/premium-swarm-pressure-atlas-v1.png`、`assets/premium-hit-atlas-v1.png`、`assets/premium-screen-strike-atlas-v1.png`、`assets/premium-hero-fx-atlas-v1.png`、`assets/premium-unit-aura-atlas-v1.png` 和 `assets/premium-ultimate-cast-atlas-v1.png` 是当前运行时战斗特效主资源；其中 motion trail 图集为飞剑、符咒、火焰、冰雷和主角移动提供受预算控制的拖尾/残影层，swarm pressure 图集在高怪量时用少量屏幕级血雾、魂雾、符纹和裂纹叠层营造压迫感，避免靠无限粒子堆画面。进化法宝在释放和进化瞬间会触发受预算控制的大招图集爆发；怪潮密集时会自动减少大招层数量、弹道拖尾数量、怪潮贴图预算、区域特效预算和月轮/旋刃视觉粒子创建频率，伤害判定不降级。主角、普通怪潮、精英和 Boss 使用 premium 系列透明图集绘制；旧的 `assets/creature-atlas-v1.png`、`assets/premium-combat-fx-atlas-v3.png` 与早期参考图只保留为历史资源，默认运行时不再加载、预加载或叠加绘制，避免粗糙旧动画压在高级贴图上。同一对象只允许一个主贴图视觉层：弹道、命中、拾取物、怪潮缓存和主角不再额外叠加旧式 canvas 径向光球，必要的亮度由同一 premium 贴图的低透明外光承担。战斗区域和命中特效现在只保留一个主视觉叠层，避免命中、屏幕冲击、英雄光环和地面贴图在同一位置重复堆叠。UI 使用同一套图集边饰，但菜单、卡片、血条和装备槽的装饰透明度已压低，让战斗特效和可操作信息优先。`assets/item-icon-atlas-v1.png` 是法宝/心法 UI 图标图集，已用于 HUD 装备栏、升级选择和图鉴条目。

## 成就与解锁

初始只有青衣剑修可用。完成任意一局、单局击杀 500、首次胜利等目标会解锁其他角色。成就页会显示长期目标，结算页会显示本局触发的新成就和新角色。

## 区域技能视觉

`assets/premium-area-event-atlas-v1.png` 是当前区域技能主视觉图集，用于火海、雷阵、冰莲、虚空裂隙、金符封印和毒瘴池。运行时这个 premium 地面事件层是独占主视觉；命中后不再叠加旧地面贴花、屏幕冲击、英雄光环或 canvas 兜底椭圆。高怪量或手机视口下会降低绘制预算，避免区域技能视觉糊成一片。

## 高密度怪潮性能

高怪量下普通小怪会优先保留近身威胁、精英和 Boss 的完整贴图；超出绘制预算的远处小怪会按屏幕网格合并为 `premium-swarm-pressure-atlas-v1.png` 敌潮团块。这样减少大量逐只 `drawImage`，同时避免怪潮凭空消失，保留压迫感和画面层次。

## 验证入口

以下地址只用于开发验证，使用独立 QA 存档，不影响正常试玩存档：

- `http://localhost:4173/?qa=evolution`：快速验证宝箱和法宝进化。
- `http://localhost:4173/?qa=powerups`：分阶段验证回血、吸附和清屏道具。
- `http://localhost:4173/?qa=magnet`：验证全图吸附道具会瞬间收走远处经验、灵石，并处理宝箱和其他道具。
- `http://localhost:4173/?qa=stages`：验证 5 个关卡配置、关卡名和不同妖潮池。
- `http://localhost:4173/?qa=boss`：快速进入最终 Boss 阶段。
- `http://localhost:4173/?qa=levelup`：直接打开升级三选一界面，验证升级卡片和图标布局。
- `http://localhost:4173/?qa=victory`：快速验证 12 分钟胜利结算。
- `http://localhost:4173/?qa=soak&speed=80`：同步自动跑完整 12 分钟局，自动走位、自动升级并验证 Boss、进化和结算。
- `http://localhost:4173/?qa=showcase`：预热一段后展示进化法宝、怪潮和领域特效，用于视觉回归。
- `http://localhost:4173/?qa=stress`：生成高密度怪潮和特效，用于性能压测。

QA 模式会把关键状态写到 `document.body.dataset`，包括 Boss 是否生成/击败、生命、灵石、掉落、对象数量、空间网格数量、平均帧耗、同步测试步数、同步耗时和结算状态，方便反复回归。`showcase` 还会写入画布像素采样结果，用于判断画面是否空白、单色或视觉异常。
