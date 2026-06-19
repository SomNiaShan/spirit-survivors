(() => {
  "use strict";

  const pairs = [
    ["Spirit Survivors", "尸潮炮线"],
    ["灵潮幸存者", "尸潮炮线"],
    ["Auto-cast through a demon tide and survive until dawn.", "自动开火，守住防线，熬到天亮。"],
    ["自动施法，万妖围城，活到天明。", "自动开火，守住防线，熬到天亮。"],
    ["Start Run", "开始防守"],
    ["开始修行", "开始防守"],
    ["Choose Character", "选择守卫"],
    ["选择角色", "选择守卫"],
    ["Artifacts", "武器"],
    ["法宝", "武器"],
    ["Talents", "模块"],
    ["心法", "模块"],
    ["Spiritual Surge", "补给投放"],
    ["灵气涌动", "补给投放"],
    ["Choose one upgrade.", "选择一项强化。"],
    ["Demon Core Chest", "精英补给箱"],
    ["妖丹宝箱", "精英补给箱"],
    ["Spirit Stones", "零件"],
    ["Spirit Stone", "零件"],
    ["Total Spirit Stones", "总零件"],
    ["Run Stones", "本局零件"],
    ["灵石", "零件"],
    ["Demon Lord", "尸潮母体"],
    ["Tide Demon Lord", "尸潮母体"],
    ["灵潮妖君", "尸潮母体"],
    ["妖君", "母体"],
    ["Demon Lord Defeated", "防线守住了"],
    ["Run Ended", "防线失守"],
    ["Stage", "波次"],
    ["妖潮", "波次"],
    ["Verdant Gate", "废城街口"],
    ["青岚山门", "废城街口"],
    ["Toxic Marsh Path", "地铁检疫站"],
    ["幽沼毒径", "地铁检疫站"],
    ["Frostbone Crypt", "医院隔离区"],
    ["寒骨地宫", "医院隔离区"],
    ["Void Rift Altar", "工厂炉心"],
    ["虚空裂坛", "工厂炉心"],
    ["Blood Moon Citadel", "黎明防线"],
    ["血月妖城", "黎明防线"],
    ["Azure Sword Adept", "机动枪手"],
    ["青衣剑修", "机动枪手"],
    ["Flying Sword Start", "步枪开局"],
    ["符咒开局", "电网开局"],
    ["机关弩开局", "连发炮开局"],
    ["单局击杀 500 解锁", "单局击杀 500 个感染体解锁"],
    ["速度", "移速"],
    ["Talisman Mystic", "战术工程师"],
    ["符箓道士", "战术工程师"],
    ["Seal Start", "电网开局"],
    ["Spirit Fox Adept", "疾行侦察兵"],
    ["灵狐妖修", "疾行侦察兵"],
    ["Spirit Flame Start", "燃烧弹开局"],
    ["Arcane Mechanist", "重装炮手"],
    ["机关术士", "重装炮手"],
    ["Repeater Start", "连发炮开局"],
    ["Flying Sword", "自动步枪"],
    ["飞剑", "自动步枪"],
    ["Demon-Sealing Talisman", "电磁封锁网"],
    ["镇妖符", "电磁封锁网"],
    ["Spirit Flame", "燃烧弹"],
    ["灵火", "燃烧弹"],
    ["Thunder Pearl", "特斯拉线圈"],
    ["雷珠", "特斯拉线圈"],
    ["Frost Needles", "冷冻针幕"],
    ["寒霜针", "冷冻针幕"],
    ["Spinning Blades", "旋刃无人机"],
    ["Poison Mist", "腐蚀雾罐"],
    ["Venom Mist", "腐蚀雾罐"],
    ["Clockwork Repeater", "连发机炮"],
    ["机关连弩", "连发机炮"],
    ["Ten Thousand Swords", "弹幕风暴"],
    ["万剑归宗", "弹幕风暴"],
    ["Great Void Seal", "天基电磁锁"],
    ["Skyfire Sea", "凝固汽油火海"],
    ["Ninefold Thunder Array", "连锁电弧阵"],
    ["Glacier Needle Rain", "低温弹雨"],
    ["Full Moon Wheel", "高速切割盘"],
    ["Plague Domain", "腐蚀封锁区"],
    ["Coiling Dragon Repeater", "龙息连发炮"],
    ["Supply Crate", "补给箱"],
    ["Chest", "补给箱"],
    ["宝箱", "补给箱"],
    ["Spring Pill", "急救包"],
    ["回血", "急救包"],
    ["Vacuum", "回收磁场"],
    ["Soul-Gathering Field", "回收磁场"],
    ["全图吸附", "回收磁场"],
    ["Thunder Bomb", "空袭信标"],
    ["Demon-Quelling Thunder", "空袭信标"],
    ["镇妖雷", "空袭信标"],
    ["demon", "infected"],
    ["Demon", "Infected"]
  ];

  const title = "尸潮炮线";
  const subtitle = "自动开火，守住防线，熬到天亮。";
  let queued = false;

  function replaceText(value) {
    let next = value;
    for (const [from, to] of pairs) next = next.split(from).join(to);
    return next;
  }

  function patchText(root = document.body) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const next = replaceText(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  }

  function patchStatic() {
    document.documentElement.lang = "zh-CN";
    document.title = title;
    const brandTitle = document.querySelector("#brandTitle");
    const brandSubtitle = document.querySelector("#brandSubtitle");
    if (brandTitle) brandTitle.textContent = title;
    if (brandSubtitle) brandSubtitle.textContent = subtitle;
    const language = document.querySelector("#languageSelect");
    if (language && language.children.length !== 2) {
      language.innerHTML = '<option value="zh">中文</option><option value="en">English</option>';
      language.value = "zh";
    }
    for (const el of document.querySelectorAll("[title],[aria-label]")) {
      if (el.title) el.title = replaceText(el.title);
      const aria = el.getAttribute("aria-label");
      if (aria) el.setAttribute("aria-label", replaceText(aria));
    }
  }

  function patch() {
    queued = false;
    patchStatic();
    patchText();
  }

  function schedulePatch() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(patch);
  }

  try {
    localStorage.setItem("spirit-survivors-language-v1", "zh");
  } catch (_) {
    // Ignore private-mode storage failures.
  }

  patch();
  new MutationObserver(schedulePatch).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
})();
