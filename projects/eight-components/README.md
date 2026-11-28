# 八个组件 / Eight Components

Version: **2.0.0**

八件可以上手的控件，摆在一张纸上：压印、拨钮、钤印、弦、旋钮、计数轮、浸瓶与键帽。

同一盏灯从左上方照下来，同一条弹性曲线，同一批材质——陶瓷、黄铜、漆面、玻璃。页面本身就是一张标本图版：物件直接落在纸面上，靠发丝线分栏，靠等宽字号标注序号，靠衬线字命名。

页面支持明暗主题、鼠标、触控与完整键盘操作，并尊重系统的「减少动态效果」偏好。

| # | 组件 | 材质 | 交互 |
|---|---|---|---|
| 01 | 压印 HOLD | 陶瓷 | 按住 0.9 秒填满刻线环，中途松手回弹 |
| 02 | 拨钮 TOGGLE | 黄铜 / 皮筋 | 拇指推着一根红皮筋走，越过卡位会被拽回来 |
| 03 | 钤印 STAMP | 纸 / 印泥 | 勾一行落一枚印，印迹边缘带毛 |
| 04 | 弦 STRING | 钢 | 拖动改张力，松手后按泛音列振动衰减 |
| 05 | 旋钮 KNOB | 铝 / 黄铜 | 绕圈拖动，刻度随数值点亮 |
| 06 | 计数轮 COUNTER | 机械数字轮 | 个位自由转，十位借个位带动，百位借十位带动 |
| 07 | 浸瓶 JAR | 玻璃 | 上下拖动改液面，液体会晃，气泡上浮 |
| 08 | 键帽 KEY | 镍 / 朱漆 | 真三维 WebGL，按下有回弹，WebGL 不可用时自动降级 |

## 独立体验

https://gsvegetable.github.io/gongshui-open-source/eight-components/

## 嵌入

```html
<script src="https://gsvegetable.github.io/gongshui-open-source/eight-components/embed.js"></script>
```

也可以预先放置容器：

```html
<div id="components" style="width:100%;height:620px"></div>
<script src="https://gsvegetable.github.io/gongshui-open-source/eight-components/embed.js" data-target="components"></script>
```

加载器使用独立 iframe 隔离样式和脚本。`embed=1` 会切换到「接触印相」版式：四列两行，八件物件同时铺满画面，适合放进首页卡片。

### 属性

| 属性 | 说明 | 默认值 |
|---|---|---|
| `data-target` | 指定挂载容器 | 自动创建 |
| `data-width` / `data-height` | 容器尺寸 | `100%` / `min(620px, 78vh)` |
| `data-label` | iframe 的无障碍标题 | `八个组件 · Eight Components` |
| `data-theme` | `light` / `dark` | 跟随系统 |
| `data-version` | 缓存版本号 | `2.0.0` |
| `data-embed-fill` | 铺满父容器高度 | — |

### API

容器上的 `gongshuiEmbed` 提供：

- `ready`：`Promise`，文档加载完成后 resolve；
- `setTheme(theme)`：切换明暗主题（`'light'` / `'dark'`）；
- `destroy()`：卸载嵌入内容并恢复宿主容器原状。

宿主也可以向 iframe 发送 `{ type: 'gongshui:embed:theme', theme: 'dark' }` 消息。

## 旧地址

作品原名「七个组件」。旧地址仍然可用并会自动跳转到新地址：

- https://gsvegetable.github.io/gongshui-open-source/seven-components/ → `/eight-components/`
- `seven-components/embed.js` 会加载新的加载器。

## 第三方依赖

`vendor/three.min.js` 是 three.js r128（MIT License, © 2010-2021 three.js authors），仅用于第 08 件「键帽」，本地托管、不依赖 CDN。

## 许可

本作品为宫水.com 的独立交互实验。three.js 按其 MIT 许可证使用。
