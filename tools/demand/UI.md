六、官方照片&背景图&图标&UI（给你“直接能用”的东西）
1、官方链接汇总（做站页脚/导航可直接挂这些）
text
复制代码
Official site (Team NINJA): https://teamninja-studio.com/nioh3/us/
Official demo info: https://teamninja-studio.com/nioh3/us/news/trial.html
PlayStation game page (US): https://www.playstation.com/en-us/games/nioh-3/
PlayStation Store concept (US): https://store.playstation.com/concept/10014010

3、鼠标滑动时“箭头位置特效”（简单、稳定、好看；可直接抄）
① 效果：鼠标一个小白点 + 一个红色呼吸圆环；悬停按钮时圆环放大并更亮（很“妖气/刀光”）。
② 代码（纯前端，不依赖库）
html

<!-- 放在 body 里 -->
<div id="cursorDot"></div
>
<div id="cursorRing"></div
>

<style>
  html, body { cursor
: none; }
  #cursorDot, #cursorRing
{
    position: fixed; left: 0; top: 0; pointer-events: none; z-index: 99999
;
    transform: translate(-50%, -50%
);
  }
  #cursorDot
{
    width: 6px; height: 6px; border-radius: 999px; background: #f3f4f6
;
  }
  #cursorRing
{
    width: 34px; height: 34px; border-radius: 999px
;
    border: 2px solid rgba(209,59,47,0.75
);
    box-shadow: 0 0 18px rgba(209,59,47,0.35
);
    transition: width .12s ease, height .12s ease, box-shadow .12s ease, border-color .12s
 ease;
  }
  .cursor-hover #cursorRing
{
    width: 46px; height: 46px
;
    border-color: rgba(209,59,47,0.95
);
    box-shadow: 0 0 26px rgba(209,59,47,0.55
);
  }
</style
>

<script>
  const dot = document.getElementById('cursorDot'
);
  const ring = document.getElementById('cursorRing'
);
  let x = 0, y = 0, rx = 0, ry = 0
;

  window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY
; });
  function raf(
){
    // ring 做一点“缓动跟随”，更高级
    rx += (x - rx) * 
0.18
;
    ry += (y - ry) * 
0.18
;
    dot.
style.transform = `translate(${x}px, ${y}
px) translate(-50%, -50%)`;
    ring.
style.transform = `translate(${rx}px, ${ry}
px) translate(-50%, -50%)`;
    requestAnimationFrame
(raf);
  }
  raf
();

  // 只要是可点击元素就触发 hover
  const hoverSel = 'a, button, [role="button"], input, textarea, select'
;
  document.addEventListener('pointerover', (e
) => {
    if (e.target.closest(hoverSel)) document.documentElement.classList.add('cursor-hover'
);
  });
  document.addEventListener('pointerout', (e
) => {
    if (e.target.closest(hoverSel)) document.documentElement.classList.remove('cursor-hover'
);
  });
</script
>
4、画风说明（你做 UI 的“定调”）
① 关键词：暗黑战国、妖怪、刀光、火焰/血色点缀、古日本纹样（家纹/纸灯/鸟居）、整体偏写实。
PlayStation
+1
② UI 建议：底色别纯黑，用“墨黑偏蓝”；文字用偏白灰；强调色用“血红/朱红 + 金色”，这样既像题材又保证对比度。
5、适合该网站的风格 UI JSON（保证对比度，不会出现“字体看不见”）
json

{
  "themeName": "nioh3-dark-sengoku",
  "colors": {
    "bg": "#0B0B0E",
    "bg2": "#11111A",
    "card": "#141420",
    "card2": "#1A1A27",
    "border": "#2A2A3A",
    "text": "#F3F4F6",
    "text2": "#C7CBD1",
    "muted": "#9AA3AF",
    "danger": "#D13B2F",
    "gold": "#C9A24A",
    "link": "#93C5FD",
    "success": "#34D399",
    "shadow": "rgba(0,0,0,0.45)"
  },
  "radius": { "sm": 10, "md": 14, "lg": 18 },
  "space": { "xs": 6, "sm": 10, "md": 14, "lg": 18, "xl": 26 },
  "typography": {
    "baseSize": 16,
    "lineHeight": 1.6,
    "titleWeight": 700,
    "bodyWeight": 500
  },
  "components": {
    "buttonPrimary": {
      "bg": "#D13B2F",
      "text": "#FFFFFF",
      "hoverBg": "#E0493D",
      "focusRing": "rgba(209,59,47,0.35)"
    },
    "buttonSecondary": {
      "bg": "#1A1A27",
      "text": "#F3F4F6",
      "hoverBg": "#232339",
      "border": "#2A2A3A"
    },
    "tag": {
      "bg": "#1A1A27",
      "text": "#C7CBD1",
      "border": "#2A2A3A"
    },
    "codeBadge": {
      "bg": "#0F0F16",
      "text": "#F3F4F6",
      "border": "#2A2A3A"
    }
  }
}
6、Hero 图（3–5 个“直接能在浏览器打开”的高清官方图下载地址）
text
复制代码
https://teamninja-studio.com/nioh3/assets/img/world/world-bg.jpg
https://teamninja-studio.com/nioh3/assets/img/world/edo-ss1.jpg
https://teamninja-studio.com/nioh3/assets/img/world/sengoku-ss1.jpg
https://teamninja-studio.com/nioh3/assets/img/world/heian-ss1.jpg
https://teamninja-studio.com/nioh3/assets/img/world/bakumatsu-ss1.jpg
补充：官方 Logo（做 favicon/OG 图/站点 header 很好用）
text
复制代码
https://teamninja-studio.com/nioh3/assets/img/common/logo-large.png
七、你要的 YouTube（4 个）与 Reddit（2 个）具体链接
1、YouTube（4 个）
text
复制代码
https://www.youtube.com/watch?v=KXGm-JaxY54  (Official Announcement Trailer | PS5 Games)
https://www.youtube.com/watch?v=MyenuEg-z1w  (Launch Date Announcement Trailer | PS5 Games)
https://www.youtube.com/watch?v=bL_umw0ScIA  (Features Trailer | PS5 Games)
https://www.youtube.com/watch?v=Z3Yfi8qJ49w  (PooferLlama - Nioh 3 Demo gameplay / impressions)
2、Reddit（2 个，r/Nioh 内更贴近“攻略/配装/机制”）
text
复制代码
https://www.reddit.com/r/Nioh/comments/1qpsq9p/nioh_3_demo_is_out_megathread/
https://www.reddit.com/r/Nioh/comments/1qpsmnx/demo_is_out/
