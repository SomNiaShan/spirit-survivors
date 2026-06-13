(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });

  const $ = (id) => document.getElementById(id);
  const ui = {
    hud: $("hud"),
    overlay: $("overlay"),
    menu: $("menuScreen"),
    character: $("characterScreen"),
    upgrade: $("upgradeScreen"),
    codex: $("codexScreen"),
    achievement: $("achievementScreen"),
    level: $("levelScreen"),
    chest: $("chestScreen"),
    pause: $("pauseScreen"),
    result: $("resultScreen"),
    timer: $("timer"),
    levelText: $("level"),
    wave: $("wave"),
    runCoins: $("runCoins"),
    totalCoins: $("totalCoins"),
    hpFill: $("hpFill"),
    hpText: $("hpText"),
    xpFill: $("xpFill"),
    xpText: $("xpText"),
    bossBar: $("bossBar"),
    bossFill: $("bossFill"),
    bossName: $("bossName"),
    bossText: $("bossText"),
    weaponList: $("weaponList"),
    passiveList: $("passiveList"),
    characterGrid: $("characterGrid"),
    metaGrid: $("metaGrid"),
    codexGrid: $("codexGrid"),
    achievementGrid: $("achievementGrid"),
    choiceGrid: $("choiceGrid"),
    chestReward: $("chestReward"),
    resultTitle: $("resultTitle"),
    resultStats: $("resultStats"),
    soundBtn: $("soundBtn"),
    menuSoundBtn: $("menuSoundBtn"),
    touchPad: $("touchPad"),
    touchStick: $("touchStick")
  };

  const TAU = Math.PI * 2;
  const RUN_DURATION = 15 * 60;
  const MAX_ENEMIES = 520;
  const QA_MODE = new URLSearchParams(window.location.search).has("qa");
  const STORAGE_KEY = QA_MODE ? "spirit-survivors-save-qa-v1" : "spirit-survivors-save-v2";

  const colors = {
    ink: "#f2ead7",
    muted: "#b9aa8d",
    gold: "#f1c66a",
    jade: "#7cd7af",
    danger: "#e45b55",
    violet: "#a88cff",
    blue: "#6aa9ff",
    frost: "#9ee7ff",
    poison: "#91d56f"
  };

  const characters = [
    {
      id: "sword",
      name: "青衣剑修",
      title: "飞剑开局",
      color: "#7cd7af",
      weapon: "flyingSword",
      hp: 118,
      speed: 245,
      damage: 1.08,
      cooldown: 0.98,
      pickup: 1,
      amount: 0,
      desc: "均衡稳定，飞剑穿透能力强，适合第一局熟悉节奏。"
    },
    {
      id: "talisman",
      name: "符箓道士",
      title: "符咒开局",
      color: "#f1c66a",
      weapon: "talisman",
      hp: 104,
      speed: 235,
      damage: 1,
      cooldown: 0.88,
      pickup: 1.05,
      amount: 0,
      desc: "冷却更快，擅长连续封印和控场。"
    },
    {
      id: "fox",
      name: "灵狐妖修",
      title: "灵火开局",
      color: "#e9818c",
      weapon: "spiritFire",
      hp: 96,
      speed: 278,
      damage: 1.02,
      cooldown: 0.94,
      pickup: 1.22,
      amount: 0,
      desc: "速度和拾取范围更高，靠走位滚起雪球。"
    },
    {
      id: "mechanist",
      name: "机关术士",
      title: "机关弩开局",
      color: "#9db3ff",
      weapon: "crossbow",
      hp: 126,
      speed: 220,
      damage: 0.96,
      cooldown: 1,
      pickup: 0.95,
      amount: 1,
      desc: "天生多一枚弹道，前期输出稳定。"
    }
  ];

  const passives = {
    powerCharm: {
      id: "powerCharm",
      name: "破军玉",
      stat: "攻击",
      max: 5,
      color: "#e9775e",
      desc: "每级提高 12% 伤害。"
    },
    cooldownJade: {
      id: "cooldownJade",
      name: "凝时玉",
      stat: "冷却",
      max: 5,
      color: "#7cd7af",
      desc: "每级减少 7% 冷却时间。"
    },
    windBoots: {
      id: "windBoots",
      name: "踏风履",
      stat: "移速",
      max: 5,
      color: "#9ee7ff",
      desc: "每级提高 8% 移动速度。"
    },
    lifeGourd: {
      id: "lifeGourd",
      name: "长生葫",
      stat: "生命",
      max: 5,
      color: "#f19a7d",
      desc: "每级增加 24 点最大生命并少量治疗。"
    },
    magnetBell: {
      id: "magnetBell",
      name: "摄灵铃",
      stat: "拾取",
      max: 5,
      color: "#f1c66a",
      desc: "每级提高 24% 经验吸附范围。"
    },
    splitPearl: {
      id: "splitPearl",
      name: "分光珠",
      stat: "弹道",
      max: 5,
      color: "#c6a2ff",
      desc: "每两级增加额外弹道。"
    },
    everlamp: {
      id: "everlamp",
      name: "长明灯",
      stat: "范围",
      max: 5,
      color: "#ffb36a",
      desc: "每级提高 10% 持续时间和范围。"
    },
    goldFang: {
      id: "goldFang",
      name: "招财牙",
      stat: "灵石",
      max: 5,
      color: "#e6d46b",
      desc: "每级提高 18% 灵石收益。"
    }
  };

  const weapons = {
    flyingSword: {
      id: "flyingSword",
      name: "飞剑",
      type: "weapon",
      max: 8,
      color: "#7cd7af",
      req: "powerCharm",
      evo: "thousandSword",
      desc: "向最近的敌人射出穿透飞剑。"
    },
    talisman: {
      id: "talisman",
      name: "镇妖符",
      type: "weapon",
      max: 8,
      color: "#f1c66a",
      req: "cooldownJade",
      evo: "voidSeal",
      desc: "发射追踪符咒，命中后小范围爆裂。"
    },
    spiritFire: {
      id: "spiritFire",
      name: "灵火",
      type: "weapon",
      max: 8,
      color: "#ff765b",
      req: "everlamp",
      evo: "fireSea",
      desc: "释放会燃烧路径的灵火。"
    },
    thunderPearl: {
      id: "thunderPearl",
      name: "雷珠",
      type: "weapon",
      max: 8,
      color: "#8fb7ff",
      req: "cooldownJade",
      evo: "thunderArray",
      desc: "随机雷击附近敌人。"
    },
    frostNeedle: {
      id: "frostNeedle",
      name: "冰针",
      type: "weapon",
      max: 8,
      color: "#9ee7ff",
      req: "splitPearl",
      evo: "glacierRain",
      desc: "扇形射出冰针并减速敌人。"
    },
    spinningBlade: {
      id: "spinningBlade",
      name: "旋刃",
      type: "weapon",
      max: 8,
      color: "#d6d2cb",
      req: "everlamp",
      evo: "moonWheel",
      desc: "围绕角色旋转切割。"
    },
    poisonMist: {
      id: "poisonMist",
      name: "毒雾",
      type: "weapon",
      max: 8,
      color: "#91d56f",
      req: "magnetBell",
      evo: "plagueDomain",
      desc: "生成持续伤害毒云。"
    },
    crossbow: {
      id: "crossbow",
      name: "机关弩",
      type: "weapon",
      max: 8,
      color: "#9db3ff",
      req: "windBoots",
      evo: "dragonRepeater",
      desc: "快速发射机关弩矢。"
    },
    thousandSword: {
      id: "thousandSword",
      name: "万剑归宗",
      type: "evolved",
      max: 1,
      base: "flyingSword",
      color: "#a4ffd3",
      desc: "飞剑化为剑潮，持续穿透大群敌人。"
    },
    voidSeal: {
      id: "voidSeal",
      name: "太虚镇印",
      type: "evolved",
      max: 1,
      base: "talisman",
      color: "#ffe08a",
      desc: "天印落下，持续封锁成片妖潮。"
    },
    fireSea: {
      id: "fireSea",
      name: "焚天火海",
      type: "evolved",
      max: 1,
      base: "spiritFire",
      color: "#ff9b5e",
      desc: "灵火铺成火海，灼烧路径与周身。"
    },
    thunderArray: {
      id: "thunderArray",
      name: "九霄雷阵",
      type: "evolved",
      max: 1,
      base: "thunderPearl",
      color: "#9cbcff",
      desc: "雷击连锁，并在屏幕内反复跳跃。"
    },
    glacierRain: {
      id: "glacierRain",
      name: "玄冰针雨",
      type: "evolved",
      max: 1,
      base: "frostNeedle",
      color: "#bff3ff",
      desc: "冰针从四面八方坠落，持续减速敌人。"
    },
    moonWheel: {
      id: "moonWheel",
      name: "满月天轮",
      type: "evolved",
      max: 1,
      base: "spinningBlade",
      color: "#f1eee5",
      desc: "大型月轮围绕角色高速切割。"
    },
    plagueDomain: {
      id: "plagueDomain",
      name: "瘴海妖域",
      type: "evolved",
      max: 1,
      base: "poisonMist",
      color: "#b4e66b",
      desc: "毒雾随身扩散，留下腐蚀妖域。"
    },
    dragonRepeater: {
      id: "dragonRepeater",
      name: "游龙连弩",
      type: "evolved",
      max: 1,
      base: "crossbow",
      color: "#b4c4ff",
      desc: "机关弩化为游龙齐射，连续锁定敌人。"
    }
  };

  const enemyTypes = [
    { id: "imp", name: "小妖", hp: 18, speed: 82, damage: 10, radius: 13, xp: 1, color: "#9a7d5f", weight: 10 },
    { id: "wolf", name: "狼妖", hp: 30, speed: 125, damage: 13, radius: 15, xp: 2, color: "#7f8c78", weight: 7 },
    { id: "wisp", name: "鬼火", hp: 22, speed: 96, damage: 12, radius: 12, xp: 2, color: "#6ca6ff", weight: 6 },
    { id: "bug", name: "飞虫", hp: 16, speed: 158, damage: 8, radius: 10, xp: 1, color: "#b99745", weight: 6 },
    { id: "brute", name: "盾妖", hp: 88, speed: 58, damage: 18, radius: 21, xp: 4, color: "#b96855", weight: 4 },
    { id: "runner", name: "快妖", hp: 34, speed: 188, damage: 14, radius: 13, xp: 3, color: "#d4b060", weight: 4 },
    { id: "spitter", name: "吐火妖", hp: 44, speed: 72, damage: 12, radius: 15, xp: 3, color: "#be6a45", weight: 3 },
    { id: "summoner", name: "唤妖师", hp: 70, speed: 60, damage: 10, radius: 18, xp: 5, color: "#8e72c5", weight: 2 },
    { id: "shadow", name: "影妖", hp: 46, speed: 144, damage: 16, radius: 14, xp: 4, color: "#565c75", weight: 3 },
    { id: "stone", name: "石灵", hp: 150, speed: 44, damage: 24, radius: 24, xp: 7, color: "#9c8d80", weight: 2 }
  ];

  const eliteTypes = [
    { id: "eliteBrute", name: "赤角妖将", hp: 620, speed: 70, damage: 24, radius: 31, xp: 30, color: "#da5d50" },
    { id: "eliteWisp", name: "幽蓝鬼王", hp: 460, speed: 112, damage: 20, radius: 27, xp: 28, color: "#5e9dff" },
    { id: "eliteSummoner", name: "万魂祭司", hp: 520, speed: 66, damage: 18, radius: 29, xp: 34, color: "#a88cff" }
  ];

  const bossType = {
    id: "boss",
    name: "灵潮妖君",
    hp: 9000,
    speed: 72,
    damage: 32,
    radius: 58,
    xp: 120,
    color: "#e45b55"
  };

  const metaUpgrades = [
    { id: "might", name: "剑意", max: 10, stat: "伤害", desc: "每级提高 4% 全局伤害。", cost: (lv) => 80 + lv * 55 },
    { id: "vitality", name: "根骨", max: 10, stat: "生命", desc: "每级提高 10 点最大生命。", cost: (lv) => 70 + lv * 45 },
    { id: "haste", name: "身法", max: 10, stat: "移速", desc: "每级提高 3% 移动速度。", cost: (lv) => 75 + lv * 50 },
    { id: "magnet", name: "灵嗅", max: 10, stat: "拾取", desc: "每级提高 6% 拾取范围。", cost: (lv) => 65 + lv * 45 },
    { id: "fortune", name: "财运", max: 10, stat: "灵石", desc: "每级提高 5% 灵石收益。", cost: (lv) => 85 + lv * 60 }
  ];

  const achievements = [
    { id: "firstRun", name: "初入妖潮", desc: "完成任意一局游戏。", reward: "解锁符箓道士", done: (save) => save.runs >= 1, unlock: "talisman" },
    { id: "hunter500", name: "斩妖五百", desc: "单局击杀达到 500。", reward: "解锁灵狐妖修", done: (save) => save.bestKills >= 500, unlock: "fox" },
    { id: "firstVictory", name: "妖君伏诛", desc: "取得 1 次胜利。", reward: "解锁机关术士", done: (save) => save.victories >= 1, unlock: "mechanist" },
    { id: "level30", name: "灵压成形", desc: "单局等级达到 30。", reward: "永久升级目标", done: (save) => save.bestLevel >= 30 },
    { id: "sixEvolved", name: "六器归真", desc: "单局拥有 6 个进化法宝。", reward: "高阶流派目标", done: (save) => save.bestEvolved >= 6 },
    { id: "rich3000", name: "灵石如雨", desc: "单局获得 3000 灵石。", reward: "财运挑战目标", done: (save) => save.bestRunCoins >= 3000 }
  ];

  const characterUnlockText = {
    sword: "初始角色",
    talisman: "完成任意一局解锁",
    fox: "单局击杀 500 解锁",
    mechanist: "首次胜利解锁"
  };

  const powerupTypes = {
    heal: { id: "heal", name: "回春丹", color: "#f19a7d", desc: "恢复生命" },
    magnet: { id: "magnet", name: "摄灵阵", color: "#7fe0d0", desc: "吸收全场经验和灵石" },
    bomb: { id: "bomb", name: "镇妖雷", color: "#f1c66a", desc: "轰击屏幕内妖潮" }
  };

  const state = {
    screen: "menu",
    save: loadSave(),
    selectedCharacter: characters[0].id,
    lastTime: 0,
    dt: 0,
    elapsed: 0,
    pausedReason: null,
    player: null,
    enemies: [],
    projectiles: [],
    enemyProjectiles: [],
    gems: [],
    coins: [],
    powerups: [],
    areas: [],
    texts: [],
    particles: [],
    chests: [],
    decorations: [],
    pendingLevels: 0,
    hudSignature: "",
    forceNextChestEvolution: false,
    lastResult: null,
    qa: { mode: null, autoChoices: false, autoMove: false, timeScale: 1, maxSteps: 1, syncRunning: false, syncSteps: 0, syncMs: 0, visualDone: false },
    wave: 1,
    spawnTimer: 0,
    eliteSchedule: [90, 180, 300, 450, 600, 760],
    eliteIndex: 0,
    bossSpawned: false,
    bossDefeated: false,
    runCoins: 0,
    kills: 0,
    camera: { x: 0, y: 0 },
    shake: 0,
    perf: { frames: 0, totalDt: 0, maxDt: 0 },
    audio: { ctx: null, master: null, ambient: [], muted: false, last: {} },
    mouseWorld: { x: 0, y: 0 },
    input: {
      keys: new Set(),
      pointerDown: false,
      pointerId: null,
      touchOrigin: { x: 0, y: 0 },
      touchVector: { x: 0, y: 0 },
      lastMove: { x: 1, y: 0 }
    }
  };

  function defaultSave() {
    const upgrades = {};
    for (const up of metaUpgrades) upgrades[up.id] = 0;
    return {
      coins: 0,
      bestTime: 0,
      bestKills: 0,
      bestLevel: 1,
      bestEvolved: 0,
      bestRunCoins: 0,
      runs: 0,
      victories: 0,
      muted: false,
      upgrades,
      unlockedCharacters: { sword: true },
      achievements: {},
      seenCodex: true
    };
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSave();
      const parsed = JSON.parse(raw);
      const base = defaultSave();
      return {
        ...base,
        ...parsed,
        upgrades: { ...base.upgrades, ...(parsed.upgrades || {}) },
        unlockedCharacters: { ...base.unlockedCharacters, ...(parsed.unlockedCharacters || {}) },
        achievements: { ...base.achievements, ...(parsed.achievements || {}) }
      };
    } catch {
      return defaultSave();
    }
  }

  function saveGame() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.save));
    ui.totalCoins.textContent = state.save.coins;
  }

  function syncAudioButtons() {
    const muted = state.audio.muted;
    if (ui.soundBtn) {
      ui.soundBtn.textContent = muted ? "×" : "♪";
      ui.soundBtn.title = muted ? "开启声音" : "关闭声音";
    }
    if (ui.menuSoundBtn) {
      ui.menuSoundBtn.textContent = muted ? "声音：关" : "声音：开";
    }
  }

  function ensureAudio() {
    if (QA_MODE || state.audio.muted) return null;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!state.audio.ctx) {
      const ctx = new AudioCtor();
      const master = ctx.createGain();
      master.gain.value = 0.18;
      master.connect(ctx.destination);
      state.audio.ctx = ctx;
      state.audio.master = master;
      startAmbientAudio();
    }
    if (state.audio.ctx.state === "suspended") state.audio.ctx.resume();
    return state.audio.ctx;
  }

  function startAmbientAudio() {
    const ctx = state.audio.ctx;
    if (!ctx || state.audio.ambient.length) return;
    const notes = [
      { freq: 82.41, gain: 0.018, type: "sine" },
      { freq: 123.47, gain: 0.01, type: "triangle" }
    ];
    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = note.type;
      osc.frequency.value = note.freq;
      gain.gain.value = note.gain;
      osc.connect(gain);
      gain.connect(state.audio.master);
      osc.start();
      state.audio.ambient.push({ osc, gain });
    }
  }

  function setMuted(muted) {
    state.audio.muted = muted;
    state.save.muted = muted;
    if (state.audio.master) {
      state.audio.master.gain.setTargetAtTime(muted ? 0 : 0.18, state.audio.ctx.currentTime, 0.02);
    }
    saveGame();
    syncAudioButtons();
    if (!muted) {
      ensureAudio();
      playSfx("select");
    }
  }

  function toggleAudio() {
    setMuted(!state.audio.muted);
  }

  function playTone(freq, duration, type = "sine", volume = 0.18, slide = 1) {
    const ctx = ensureAudio();
    if (!ctx || !state.audio.master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide !== 1) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), ctx.currentTime + duration);
    }
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(state.audio.master);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.02);
  }

  function playNoise(duration = 0.12, volume = 0.14, tone = 900) {
    const ctx = ensureAudio();
    if (!ctx || !state.audio.master) return;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    filter.type = "bandpass";
    filter.frequency.value = tone;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(state.audio.master);
    source.start();
  }

  function playSfx(name) {
    if (QA_MODE || state.audio.muted) return;
    const now = Date.now();
    const limits = { xp: 80, hit: 220, kill: 110, coin: 80 };
    const limit = limits[name] || 0;
    if (limit && now - (state.audio.last[name] || 0) < limit) return;
    state.audio.last[name] = now;
    switch (name) {
      case "start":
        playTone(196, 0.11, "triangle", 0.14, 1.5);
        playTone(392, 0.16, "sine", 0.1, 1.18);
        break;
      case "select":
        playTone(523.25, 0.055, "sine", 0.08, 1.08);
        break;
      case "xp":
        playTone(784, 0.04, "sine", 0.045, 1.14);
        break;
      case "level":
        playTone(392, 0.08, "triangle", 0.11, 1.25);
        setTimeout(() => playTone(587.33, 0.09, "triangle", 0.1, 1.18), 55);
        break;
      case "chest":
        playTone(261.63, 0.12, "triangle", 0.12, 1.9);
        playNoise(0.16, 0.05, 1800);
        break;
      case "evolve":
        playTone(174.61, 0.22, "sawtooth", 0.12, 2.6);
        setTimeout(() => playTone(698.46, 0.18, "triangle", 0.1, 1.4), 90);
        playNoise(0.28, 0.07, 1200);
        break;
      case "hit":
        playTone(110, 0.09, "square", 0.08, 0.72);
        playNoise(0.08, 0.08, 420);
        break;
      case "elite":
        playTone(146.83, 0.16, "sawtooth", 0.09, 0.78);
        playNoise(0.14, 0.08, 720);
        break;
      case "victory":
        [392, 523.25, 659.25, 783.99].forEach((freq, i) => setTimeout(() => playTone(freq, 0.18, "triangle", 0.12, 1.03), i * 95));
        break;
      case "defeat":
        playTone(220, 0.24, "sawtooth", 0.1, 0.62);
        setTimeout(() => playTone(146.83, 0.28, "sine", 0.08, 0.78), 120);
        break;
      case "coin":
        playTone(988, 0.045, "sine", 0.05, 1.08);
        break;
      case "kill":
        playNoise(0.045, 0.035, 980);
        break;
    }
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function chance(p) {
    return Math.random() < p;
  }

  function dist2(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function len(x, y) {
    return Math.hypot(x, y) || 1;
  }

  function normalize(x, y) {
    const l = len(x, y);
    return { x: x / l, y: y / l };
  }

  function hash2(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function formatTime(t) {
    const remain = Math.max(0, Math.ceil(RUN_DURATION - t));
    const m = Math.floor(remain / 60);
    const s = remain % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
    }
  }

  function showScreen(name) {
    state.screen = name;
    updateQaDataset();
    const screens = [ui.menu, ui.character, ui.upgrade, ui.codex, ui.achievement, ui.level, ui.chest, ui.pause, ui.result];
    for (const screen of screens) screen.classList.add("hidden");

    const inRun = ["playing", "level", "chest", "pause", "result"].includes(name);
    ui.hud.classList.toggle("hidden", !inRun);
    ui.overlay.classList.toggle("hidden", name === "playing");
    ui.touchPad.classList.toggle("hidden", !isTouchLikely() || name !== "playing");

    if (name === "menu") ui.menu.classList.remove("hidden");
    if (name === "character") ui.character.classList.remove("hidden");
    if (name === "upgrade") ui.upgrade.classList.remove("hidden");
    if (name === "codex") ui.codex.classList.remove("hidden");
    if (name === "achievement") ui.achievement.classList.remove("hidden");
    if (name === "level") ui.level.classList.remove("hidden");
    if (name === "chest") ui.chest.classList.remove("hidden");
    if (name === "pause") ui.pause.classList.remove("hidden");
    if (name === "result") ui.result.classList.remove("hidden");
  }

  function isTouchLikely() {
    return navigator.maxTouchPoints > 0 || window.innerWidth < 820;
  }

  function isCharacterUnlocked(id) {
    return QA_MODE || Boolean(state.save.unlockedCharacters[id]);
  }

  function countEvolvedWeapons(player = state.player) {
    if (!player) return 0;
    return Object.keys(player.weapons).filter((id) => weapons[id]?.type === "evolved").length;
  }

  function refreshAchievements() {
    const newlyCompleted = [];
    const newlyUnlocked = [];
    for (const achievement of achievements) {
      const done = achievement.done(state.save);
      if (done && !state.save.achievements[achievement.id]) {
        state.save.achievements[achievement.id] = true;
        newlyCompleted.push(achievement);
      }
      if (done && achievement.unlock && !state.save.unlockedCharacters[achievement.unlock]) {
        state.save.unlockedCharacters[achievement.unlock] = true;
        newlyUnlocked.push(achievement.unlock);
      }
    }
    return { newlyCompleted, newlyUnlocked };
  }

  function buildCharacterCards() {
    ui.characterGrid.innerHTML = "";
    for (const character of characters) {
      const unlocked = isCharacterUnlocked(character.id);
      const card = document.createElement("div");
      card.className = `card${unlocked ? "" : " locked"}`;
      card.innerHTML = `
        <h3>${unlocked ? character.name : "未解锁"}</h3>
        <p>${unlocked ? character.desc : characterUnlockText[character.id]}</p>
        <div class="tag-row">
          <span class="tag">${character.title}</span>
          <span class="tag">${unlocked ? `生命 ${character.hp}` : "锁定"}</span>
          <span class="tag">${unlocked ? `速度 ${character.speed}` : characterUnlockText[character.id]}</span>
        </div>
      `;
      card.addEventListener("click", () => {
        if (!isCharacterUnlocked(character.id)) {
          playSfx("hit");
          return;
        }
        state.selectedCharacter = character.id;
        startRun(character.id);
      });
      ui.characterGrid.appendChild(card);
    }
  }

  function buildMetaGrid() {
    ui.metaGrid.innerHTML = "";
    for (const up of metaUpgrades) {
      const lv = state.save.upgrades[up.id] || 0;
      const maxed = lv >= up.max;
      const cost = maxed ? 0 : up.cost(lv);
      const div = document.createElement("div");
      div.className = "upgrade";
      div.innerHTML = `
        <h3>${up.name} <span class="tag">Lv ${lv}/${up.max}</span></h3>
        <p>${up.desc}</p>
        <div class="save-row">
          <span>${up.stat}</span>
          <strong>${maxed ? "已满" : `${cost} 灵石`}</strong>
        </div>
      `;
      div.addEventListener("click", () => {
        if (maxed || state.save.coins < cost) return;
        ensureAudio();
        playSfx("coin");
        state.save.coins -= cost;
        state.save.upgrades[up.id] = lv + 1;
        saveGame();
        buildMetaGrid();
      });
      ui.metaGrid.appendChild(div);
    }
  }

  function buildCodex() {
    ui.codexGrid.innerHTML = "";
    const all = [
      ...Object.values(weapons).filter((w) => w.type === "weapon"),
      ...Object.values(weapons).filter((w) => w.type === "evolved"),
      ...Object.values(passives)
    ];
    for (const item of all) {
      const div = document.createElement("div");
      div.className = "codex";
      const req = item.req ? `<span class="tag">进化：${passives[item.req].name}</span>` : "";
      const base = item.base ? `<span class="tag">由 ${weapons[item.base].name} 进化</span>` : "";
      div.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <div class="tag-row">
          <span class="tag">${item.type === "evolved" ? "进化法宝" : item.type === "weapon" ? "法宝" : "心法"}</span>
          ${req}
          ${base}
        </div>
      `;
      ui.codexGrid.appendChild(div);
    }
  }

  function buildAchievementGrid() {
    ui.achievementGrid.innerHTML = "";
    refreshAchievements();
    for (const achievement of achievements) {
      const done = Boolean(state.save.achievements[achievement.id]) || achievement.done(state.save);
      const div = document.createElement("div");
      div.className = `achievement ${done ? "done" : "locked"}`;
      div.innerHTML = `
        <h3>${achievement.name}</h3>
        <p>${achievement.desc}</p>
        <div class="tag-row">
          <span class="tag">${done ? "已完成" : "未完成"}</span>
          <span class="tag">${achievement.reward}</span>
        </div>
      `;
      ui.achievementGrid.appendChild(div);
    }
  }

  function resetWorld() {
    state.elapsed = 0;
    state.enemies = [];
    state.projectiles = [];
    state.enemyProjectiles = [];
    state.gems = [];
    state.coins = [];
    state.powerups = [];
    state.areas = [];
    state.texts = [];
    state.particles = [];
    state.chests = [];
    state.decorations = [];
    state.pendingLevels = 0;
    state.hudSignature = "";
    state.forceNextChestEvolution = false;
    state.lastResult = null;
    state.wave = 1;
    state.spawnTimer = 0;
    state.eliteIndex = 0;
    state.bossSpawned = false;
    state.bossDefeated = false;
    state.runCoins = 0;
    state.kills = 0;
    state.shake = 0;
    for (let i = 0; i < 260; i++) {
      state.decorations.push({
        x: rand(-2400, 2400),
        y: rand(-2400, 2400),
        r: rand(8, 28),
        kind: Math.floor(rand(0, 4)),
        rot: rand(0, TAU)
      });
    }
  }

  function startRun(characterId) {
    ensureAudio();
    playSfx("start");
    resetWorld();
    const character = characters.find((c) => c.id === characterId) || characters[0];
    state.player = {
      x: 0,
      y: 0,
      r: 17,
      character,
      hp: 1,
      maxHp: 1,
      level: 1,
      xp: 0,
      xpNext: 10,
      weapons: {},
      passives: {},
      timers: {},
      invuln: 0,
      lastDir: { x: 1, y: 0 },
      hitFlash: 0
    };
    state.player.weapons[character.weapon] = { level: 1, evolved: false };
    applyStats(true);
    state.player.hp = state.player.maxHp;
    state.camera.x = 0;
    state.camera.y = 0;
    state.perf = { frames: 0, totalDt: 0, maxDt: 0 };
    for (let i = 0; i < 16; i++) spawnEnemy(false);
    updateHud();
    showScreen("playing");
  }

  function applyStats(keepHealthRatio = false) {
    const p = state.player;
    if (!p) return;
    const oldMax = p.maxHp || 1;
    const ratio = keepHealthRatio ? p.hp / oldMax : 1;
    const c = p.character;
    const meta = state.save.upgrades;
    const passiveLevel = (id) => p.passives[id]?.level || 0;

    p.damageMult =
      c.damage *
      (1 + (meta.might || 0) * 0.04) *
      (1 + passiveLevel("powerCharm") * 0.12);
    p.cooldownMult =
      c.cooldown *
      Math.max(0.38, 1 - passiveLevel("cooldownJade") * 0.07);
    p.speed =
      c.speed *
      (1 + (meta.haste || 0) * 0.03) *
      (1 + passiveLevel("windBoots") * 0.08);
    p.maxHp =
      c.hp +
      (meta.vitality || 0) * 10 +
      passiveLevel("lifeGourd") * 24;
    p.pickup =
      c.pickup *
      (1 + (meta.magnet || 0) * 0.06) *
      (1 + passiveLevel("magnetBell") * 0.24);
    p.amountBonus = c.amount + Math.floor(passiveLevel("splitPearl") / 2);
    p.areaMult = 1 + passiveLevel("everlamp") * 0.1;
    p.durationMult = 1 + passiveLevel("everlamp") * 0.1;
    p.greedy = 1 + (meta.fortune || 0) * 0.05 + passiveLevel("goldFang") * 0.18;
    p.hp = keepHealthRatio ? clamp(oldMax * ratio, 1, p.maxHp) : clamp(p.hp + 20, 1, p.maxHp);
  }

  function getWeaponLevel(id) {
    return state.player.weapons[id]?.level || 0;
  }

  function hasWeapon(id) {
    return Boolean(state.player.weapons[id]);
  }

  function hasPassive(id) {
    return Boolean(state.player.passives[id]);
  }

  function addWeapon(id) {
    const p = state.player;
    if (!p.weapons[id]) p.weapons[id] = { level: 1, evolved: weapons[id].type === "evolved" };
    else p.weapons[id].level = clamp(p.weapons[id].level + 1, 1, weapons[id].max);
  }

  function addPassive(id) {
    const p = state.player;
    if (!p.passives[id]) p.passives[id] = { level: 1 };
    else p.passives[id].level = clamp(p.passives[id].level + 1, 1, passives[id].max);
    applyStats(true);
  }

  function evolveWeapon(baseId) {
    const evoId = weapons[baseId].evo;
    if (!evoId || !state.player.weapons[baseId]) return false;
    delete state.player.weapons[baseId];
    state.player.weapons[evoId] = { level: 1, evolved: true };
    playSfx("evolve");
    burst(state.player.x, state.player.y, weapons[evoId].color, 48, 260);
    floatingText(state.player.x, state.player.y - 42, weapons[evoId].name, weapons[evoId].color, 22);
    return true;
  }

  function eligibleEvolutions() {
    const list = [];
    for (const [id, owned] of Object.entries(state.player.weapons)) {
      const w = weapons[id];
      if (!w || w.type !== "weapon" || owned.level < w.max) continue;
      if (w.req && !hasPassive(w.req)) continue;
      list.push(id);
    }
    return list;
  }

  function makeLevelChoices() {
    const p = state.player;
    const options = [];
    const weaponCount = Object.keys(p.weapons).length;
    const passiveCount = Object.keys(p.passives).length;

    for (const [id, owned] of Object.entries(p.weapons)) {
      const w = weapons[id];
      if (w.type === "weapon" && owned.level < w.max) {
        options.push({ kind: "weapon", id, level: owned.level + 1, weight: 7 });
      }
    }

    for (const [id, owned] of Object.entries(p.passives)) {
      if (owned.level < passives[id].max) {
        options.push({ kind: "passive", id, level: owned.level + 1, weight: 6 });
      }
    }

    if (weaponCount < 6) {
      for (const w of Object.values(weapons)) {
        if (w.type === "weapon" && !hasWeapon(w.id)) {
          options.push({ kind: "weapon", id: w.id, level: 1, weight: 4 });
        }
      }
    }

    if (passiveCount < 6) {
      for (const pa of Object.values(passives)) {
        if (!hasPassive(pa.id)) {
          options.push({ kind: "passive", id: pa.id, level: 1, weight: 4 });
        }
      }
    }

    const picked = [];
    const pool = options.slice();
    while (picked.length < 3 && pool.length) {
      const total = pool.reduce((sum, o) => sum + o.weight, 0);
      let roll = rand(0, total);
      let index = 0;
      for (; index < pool.length; index++) {
        roll -= pool[index].weight;
        if (roll <= 0) break;
      }
      picked.push(pool.splice(Math.min(index, pool.length - 1), 1)[0]);
    }

    if (picked.length === 0) {
      picked.push({ kind: "coins", id: "coins", level: 1, weight: 1 });
    }
    return picked;
  }

  function openLevelUp() {
    const choices = makeLevelChoices();
    if (state.qa.autoChoices) {
      applyLevelChoice(chooseQaLevelChoice(choices));
      state.pendingLevels = Math.max(0, state.pendingLevels - 1);
      updateHud();
      if (state.pendingLevels > 0) openLevelUp();
      else showScreen("playing");
      return;
    }

    showScreen("level");
    ui.choiceGrid.innerHTML = "";
    for (const choice of choices) {
      const isWeapon = choice.kind === "weapon";
      const item = getChoiceItem(choice);
      const div = document.createElement("div");
      div.className = `choice ${choice.kind === "coins" ? "passive" : isWeapon ? "weapon" : "passive"}`;
      div.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <div class="tag-row">
          <span class="tag">${choice.kind === "coins" ? "灵石" : isWeapon ? "法宝" : "心法"}</span>
          <span class="tag">${choice.kind === "coins" ? "奖励" : `Lv ${choice.level}`}</span>
          ${isWeapon && item.req ? `<span class="tag">进化配方：${passives[item.req].name}</span>` : ""}
        </div>
      `;
      div.addEventListener("click", () => {
        applyLevelChoice(choice);
        state.pendingLevels = Math.max(0, state.pendingLevels - 1);
        updateHud();
        if (state.pendingLevels > 0) openLevelUp();
        else showScreen("playing");
      });
      ui.choiceGrid.appendChild(div);
    }
  }

  function getChoiceItem(choice) {
    if (choice.kind === "weapon") return weapons[choice.id];
    if (choice.kind === "passive") return passives[choice.id];
    return {
      name: "灵石袋",
      desc: "所有法宝和心法已接近圆满，转化为额外灵石。",
      color: colors.gold
    };
  }

  function applyLevelChoice(choice) {
    if (!choice) return;
    if (choice.kind === "weapon") addWeapon(choice.id);
    else if (choice.kind === "passive") addPassive(choice.id);
    else if (choice.kind === "coins") {
      const value = Math.floor(55 * (state.player?.greedy || 1));
      state.runCoins += value;
      floatingText(state.player.x, state.player.y - 42, `+${value} 灵石`, colors.gold, 16);
    }
    playSfx("select");
  }

  function chooseQaLevelChoice(choices) {
    if (!choices.length) return null;
    const weaponPriority = ["flyingSword", "talisman", "spiritFire", "thunderPearl", "spinningBlade", "crossbow", "frostNeedle", "poisonMist"];
    const passivePriority = ["powerCharm", "cooldownJade", "everlamp", "windBoots", "magnetBell", "splitPearl", "lifeGourd", "goldFang"];
    const ownedWeaponIds = Object.keys(state.player.weapons);
    const neededPassives = new Set(
      ownedWeaponIds
        .map((id) => weapons[id]?.req)
        .filter(Boolean)
    );

    const score = (choice) => {
      if (choice.kind === "coins") return 1;
      if (choice.kind === "passive") {
        const base = passivePriority.length - passivePriority.indexOf(choice.id);
        const required = neededPassives.has(choice.id) ? 70 : 0;
        const survival = choice.id === "lifeGourd" && state.player.hp < state.player.maxHp * 0.55 ? 80 : 0;
        return 30 + base + required + survival + choice.level;
      }
      const current = state.player.weapons[choice.id]?.level || 0;
      const priority = weaponPriority.length - weaponPriority.indexOf(choice.id);
      const owned = current > 0 ? 90 : 45;
      const nearEvolution = current >= 6 ? 40 : 0;
      return owned + priority + nearEvolution + choice.level;
    };

    return choices.slice().sort((a, b) => score(b) - score(a))[0];
  }

  function openChest(chest) {
    const eligible = eligibleEvolutions();
    let reward;
    playSfx("chest");
    if (eligible.length && (state.qa.autoChoices || state.forceNextChestEvolution || chance(0.82))) {
      state.forceNextChestEvolution = false;
      const base = eligible[Math.floor(rand(0, eligible.length))];
      evolveWeapon(base);
      reward = {
        title: weapons[weapons[base].evo].name,
        desc: `${weapons[base].name} 已进化。`,
        color: weapons[weapons[base].evo].color
      };
    } else {
      const upgradableWeapons = Object.entries(state.player.weapons)
        .filter(([id, owned]) => weapons[id].type === "weapon" && owned.level < weapons[id].max);
      const upgradablePassives = Object.entries(state.player.passives)
        .filter(([id, owned]) => owned.level < passives[id].max);
      if (upgradableWeapons.length && chance(0.6)) {
        const [id, owned] = upgradableWeapons[Math.floor(rand(0, upgradableWeapons.length))];
        owned.level += 1;
        reward = {
          title: weapons[id].name,
          desc: `法宝提升到 Lv ${owned.level}。`,
          color: weapons[id].color
        };
      } else if (upgradablePassives.length) {
        const [id, owned] = upgradablePassives[Math.floor(rand(0, upgradablePassives.length))];
        owned.level += 1;
        applyStats(true);
        reward = {
          title: passives[id].name,
          desc: `心法提升到 Lv ${owned.level}。`,
          color: passives[id].color
        };
      } else {
        const coins = Math.floor(45 * state.player.greedy);
        state.runCoins += coins;
        reward = {
          title: `${coins} 灵石`,
          desc: "法宝已满，宝箱转化为灵石。",
          color: colors.gold
        };
      }
    }
    ui.chestReward.innerHTML = `<div><h3 style="color:${reward.color}">${reward.title}</h3><p>${reward.desc}</p></div>`;
    const idx = state.chests.indexOf(chest);
    if (idx >= 0) state.chests.splice(idx, 1);
    updateHud();
    if (state.qa.autoChoices) {
      showScreen("playing");
      return;
    }
    showScreen("chest");
  }

  function gainXp(value) {
    const p = state.player;
    p.xp += value;
    while (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level += 1;
      p.xpNext = Math.floor(12 + Math.pow(p.level, 1.42) * 7);
      state.pendingLevels += 1;
      playSfx("level");
      burst(p.x, p.y, colors.blue, 20, 160);
    }
    if (state.pendingLevels > 0 && state.screen === "playing") {
      openLevelUp();
    }
  }

  function spawnEnemy(elite = false, typeOverride = null) {
    if (!state.player || state.enemies.length >= MAX_ENEMIES) return;
    const t = typeOverride || (elite ? eliteTypes[Math.floor(rand(0, eliteTypes.length))] : pickEnemyType());
    const angle = rand(0, TAU);
    const dist = Math.max(window.innerWidth, window.innerHeight) * rand(0.68, 0.86);
    const x = state.player.x + Math.cos(angle) * dist;
    const y = state.player.y + Math.sin(angle) * dist;
    const scale = 1 + state.elapsed / 720;
    const eliteScale = elite || t.id === "boss" ? 1 : 0;
    state.enemies.push({
      x,
      y,
      vx: 0,
      vy: 0,
      type: t,
      name: t.name,
      hp: t.hp * (eliteScale ? 1 : scale),
      maxHp: t.hp * (eliteScale ? 1 : scale),
      speed: t.speed * (1 + Math.min(0.45, state.elapsed / 1300)),
      damage: t.damage * (1 + state.elapsed / 1150),
      r: t.radius,
      xp: t.xp,
      color: t.color,
      elite: elite || t.id === "boss",
      boss: t.id === "boss",
      hit: {},
      attackTimer: rand(0.5, 2),
      summonTimer: rand(2, 5),
      slow: 0,
      flash: 0
    });
  }

  function pickEnemyType() {
    const minute = Math.floor(state.elapsed / 60);
    const pool = enemyTypes.filter((_, i) => i <= clamp(2 + minute, 3, enemyTypes.length - 1));
    const total = pool.reduce((sum, e) => sum + e.weight, 0);
    let roll = rand(0, total);
    for (const e of pool) {
      roll -= e.weight;
      if (roll <= 0) return e;
    }
    return pool[0];
  }

  function updateSpawn(dt) {
    const minute = Math.floor(state.elapsed / 60);
    state.wave = minute + 1;
    const spawnRate = clamp(0.92 - state.elapsed / 2300, 0.14, 0.92);
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      const burstCount = 1 + Math.floor(minute * 0.75) + (state.elapsed > 600 ? 3 : 0);
      for (let i = 0; i < burstCount; i++) spawnEnemy(false);
      state.spawnTimer = spawnRate;
    }

    if (state.eliteIndex < state.eliteSchedule.length && state.elapsed >= state.eliteSchedule[state.eliteIndex]) {
      spawnEnemy(true);
      state.eliteIndex += 1;
      floatingText(state.player.x, state.player.y - 80, "精英妖将来袭", colors.gold, 22);
    }

    if (!state.bossSpawned && state.elapsed >= RUN_DURATION - 60) {
      state.bossSpawned = true;
      spawnEnemy(true, bossType);
      floatingText(state.player.x, state.player.y - 100, "灵潮妖君降临", colors.danger, 26);
      state.shake = 18;
    }
  }

  function updateInput(dt) {
    const p = state.player;
    let x = 0;
    let y = 0;
    if (state.input.keys.has("KeyW") || state.input.keys.has("ArrowUp")) y -= 1;
    if (state.input.keys.has("KeyS") || state.input.keys.has("ArrowDown")) y += 1;
    if (state.input.keys.has("KeyA") || state.input.keys.has("ArrowLeft")) x -= 1;
    if (state.input.keys.has("KeyD") || state.input.keys.has("ArrowRight")) x += 1;
    if (state.input.pointerDown) {
      x += state.input.touchVector.x;
      y += state.input.touchVector.y;
    }
    const l = Math.hypot(x, y);
    if (l > 0.05) {
      x /= l;
      y /= l;
      p.x += x * p.speed * dt;
      p.y += y * p.speed * dt;
      p.lastDir.x = x;
      p.lastDir.y = y;
      state.input.lastMove.x = x;
      state.input.lastMove.y = y;
    }
  }

  function nearestEnemy(range = Infinity, from = state.player, exclude = null) {
    let best = null;
    let bestD = range * range;
    for (const e of state.enemies) {
      if (e === exclude || e.hp <= 0) continue;
      const d = dist2(from, e);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  function randomEnemyOnScreen() {
    const visible = state.enemies.filter((e) => {
      const sx = e.x - state.camera.x + window.innerWidth / 2;
      const sy = e.y - state.camera.y + window.innerHeight / 2;
      return sx > -120 && sx < window.innerWidth + 120 && sy > -120 && sy < window.innerHeight + 120;
    });
    if (!visible.length) return nearestEnemy();
    return visible[Math.floor(rand(0, visible.length))];
  }

  function weaponTimer(id, cooldown, dt) {
    const timers = state.player.timers;
    timers[id] = (timers[id] || 0) - dt;
    if (timers[id] <= 0) {
      timers[id] = cooldown * state.player.cooldownMult;
      return true;
    }
    return false;
  }

  function updateWeapons(dt) {
    const p = state.player;
    for (const [id, owned] of Object.entries(p.weapons)) {
      const level = owned.level || 1;
      switch (id) {
        case "flyingSword":
          castFlyingSword(level, dt, false);
          break;
        case "thousandSword":
          castFlyingSword(10, dt, true);
          break;
        case "talisman":
          castTalisman(level, dt, false);
          break;
        case "voidSeal":
          castTalisman(10, dt, true);
          break;
        case "spiritFire":
          castSpiritFire(level, dt, false);
          break;
        case "fireSea":
          castSpiritFire(10, dt, true);
          break;
        case "thunderPearl":
          castThunder(level, dt, false);
          break;
        case "thunderArray":
          castThunder(10, dt, true);
          break;
        case "frostNeedle":
          castFrost(level, dt, false);
          break;
        case "glacierRain":
          castFrost(10, dt, true);
          break;
        case "spinningBlade":
          updateOrbitBlades(level, dt, false);
          break;
        case "moonWheel":
          updateOrbitBlades(10, dt, true);
          break;
        case "poisonMist":
          castPoison(level, dt, false);
          break;
        case "plagueDomain":
          castPoison(10, dt, true);
          break;
        case "crossbow":
          castCrossbow(level, dt, false);
          break;
        case "dragonRepeater":
          castCrossbow(10, dt, true);
          break;
      }
    }
  }

  function projectile(x, y, vx, vy, options) {
    state.projectiles.push({
      x,
      y,
      vx,
      vy,
      r: options.r || 6,
      damage: options.damage || 10,
      pierce: options.pierce || 1,
      life: options.life || 2,
      color: options.color || colors.ink,
      kind: options.kind || "bolt",
      slow: options.slow || 0,
      homing: options.homing || 0,
      area: options.area || 0,
      spin: rand(0, TAU)
    });
  }

  function castFlyingSword(level, dt, evolved) {
    const cd = evolved ? 0.34 : Math.max(0.42, 1.02 - level * 0.055);
    if (!weaponTimer(evolved ? "thousandSword" : "flyingSword", cd, dt)) return;
    const p = state.player;
    const count = (evolved ? 5 : 1 + Math.floor(level / 3)) + p.amountBonus;
    const target = nearestEnemy(950);
    const baseAngle = target ? Math.atan2(target.y - p.y, target.x - p.x) : Math.atan2(p.lastDir.y, p.lastDir.x);
    for (let i = 0; i < count; i++) {
      const spread = (i - (count - 1) / 2) * (evolved ? 0.16 : 0.1);
      const a = baseAngle + spread;
      projectile(p.x, p.y, Math.cos(a) * 820, Math.sin(a) * 820, {
        r: evolved ? 8 : 6,
        damage: (evolved ? 28 : 15 + level * 4) * p.damageMult,
        pierce: evolved ? 18 : 1 + Math.floor(level / 2),
        life: evolved ? 1.8 : 1.35,
        color: evolved ? weapons.thousandSword.color : weapons.flyingSword.color,
        kind: evolved ? "thousandSword" : "sword"
      });
    }
  }

  function castTalisman(level, dt, evolved) {
    const p = state.player;
    const id = evolved ? "voidSeal" : "talisman";
    const cd = evolved ? 0.72 : Math.max(0.62, 1.25 - level * 0.06);
    if (!weaponTimer(id, cd, dt)) return;
    const count = (evolved ? 3 : 1 + Math.floor(level / 4)) + p.amountBonus;
    for (let i = 0; i < count; i++) {
      const target = randomEnemyOnScreen() || nearestEnemy();
      if (!target) return;
      if (evolved) {
        addArea(target.x + rand(-44, 44), target.y + rand(-44, 44), {
          r: (78 + level * 4) * p.areaMult,
          life: 2.6 * p.durationMult,
          tick: 0.28,
          damage: 16 * p.damageMult,
          color: weapons.voidSeal.color,
          kind: "voidSeal",
          slow: 0.25
        });
      } else {
        const a = Math.atan2(target.y - p.y, target.x - p.x) + rand(-0.18, 0.18);
        projectile(p.x, p.y, Math.cos(a) * 520, Math.sin(a) * 520, {
          r: 8,
          damage: (12 + level * 3) * p.damageMult,
          pierce: 1,
          life: 2.3,
          color: weapons.talisman.color,
          kind: "talisman",
          homing: 3.6,
          area: 34 + level * 3
        });
      }
    }
  }

  function castSpiritFire(level, dt, evolved) {
    const p = state.player;
    const id = evolved ? "fireSea" : "spiritFire";
    const cd = evolved ? 0.48 : Math.max(0.7, 1.2 - level * 0.045);
    if (!weaponTimer(id, cd, dt)) return;
    const count = (evolved ? 3 : 1 + Math.floor(level / 3)) + p.amountBonus;
    for (let i = 0; i < count; i++) {
      const a = Math.atan2(p.lastDir.y, p.lastDir.x) + (i - (count - 1) / 2) * 0.5 + rand(-0.2, 0.2);
      projectile(p.x + Math.cos(a) * 12, p.y + Math.sin(a) * 12, Math.cos(a) * (evolved ? 430 : 380), Math.sin(a) * (evolved ? 430 : 380), {
        r: (evolved ? 16 : 11) * p.areaMult,
        damage: (evolved ? 18 : 11 + level * 2.5) * p.damageMult,
        pierce: evolved ? 8 : 3 + Math.floor(level / 2),
        life: (evolved ? 2.4 : 1.7) * p.durationMult,
        color: evolved ? weapons.fireSea.color : weapons.spiritFire.color,
        kind: evolved ? "fireSea" : "fire",
        area: evolved ? 42 : 0
      });
    }
    if (evolved) {
      addArea(p.x + rand(-90, 90), p.y + rand(-90, 90), {
        r: 72 * p.areaMult,
        life: 2.4 * p.durationMult,
        tick: 0.22,
        damage: 12 * p.damageMult,
        color: weapons.fireSea.color,
        kind: "fireSea"
      });
    }
  }

  function castThunder(level, dt, evolved) {
    const p = state.player;
    const id = evolved ? "thunderArray" : "thunderPearl";
    const cd = evolved ? 0.78 : Math.max(0.85, 1.65 - level * 0.075);
    if (!weaponTimer(id, cd, dt)) return;
    const strikes = (evolved ? 5 : 1 + Math.floor(level / 2)) + p.amountBonus;
    let previous = null;
    for (let i = 0; i < strikes; i++) {
      const target = previous && evolved ? nearestEnemy(260, previous, previous) : randomEnemyOnScreen();
      if (!target) break;
      lightning(target, (evolved ? 35 : 22 + level * 5) * p.damageMult, evolved);
      previous = target;
    }
  }

  function castFrost(level, dt, evolved) {
    const p = state.player;
    const id = evolved ? "glacierRain" : "frostNeedle";
    const cd = evolved ? 0.64 : Math.max(0.76, 1.1 - level * 0.04);
    if (!weaponTimer(id, cd, dt)) return;
    if (evolved) {
      const count = 14 + p.amountBonus * 2;
      for (let i = 0; i < count; i++) {
        const a = (TAU / count) * i + rand(-0.08, 0.08);
        projectile(p.x + Math.cos(a) * 160, p.y + Math.sin(a) * 160, Math.cos(a) * 560, Math.sin(a) * 560, {
          r: 6,
          damage: 20 * p.damageMult,
          pierce: 5,
          life: 1.4,
          color: weapons.glacierRain.color,
          kind: "glacierNeedle",
          slow: 0.46
        });
      }
    } else {
      const target = nearestEnemy(850);
      const base = target ? Math.atan2(target.y - p.y, target.x - p.x) : Math.atan2(p.lastDir.y, p.lastDir.x);
      const count = 3 + Math.floor(level / 2) + p.amountBonus;
      for (let i = 0; i < count; i++) {
        const a = base + (i - (count - 1) / 2) * 0.18;
        projectile(p.x, p.y, Math.cos(a) * 690, Math.sin(a) * 690, {
          r: 5,
          damage: (9 + level * 2.4) * p.damageMult,
          pierce: 1 + Math.floor(level / 3),
          life: 1.25,
          color: weapons.frostNeedle.color,
          kind: "needle",
          slow: 0.36
        });
      }
    }
  }

  function updateOrbitBlades(level, dt, evolved) {
    const p = state.player;
    const count = (evolved ? 5 : 2 + Math.floor(level / 2)) + p.amountBonus;
    const radius = (evolved ? 98 : 62 + level * 4) * p.areaMult;
    const bladeR = evolved ? 18 : 12;
    const speed = (evolved ? 3.1 : 2.2) + level * 0.08;
    const damage = (evolved ? 30 : 9 + level * 2.4) * p.damageMult;
    const t = performance.now() / 1000;
    for (let i = 0; i < count; i++) {
      const a = t * speed + (TAU / count) * i;
      const bx = p.x + Math.cos(a) * radius;
      const by = p.y + Math.sin(a) * radius;
      for (const e of state.enemies) {
        if (e.hp <= 0) continue;
        if ((e.hit[evolved ? "moonWheel" : "spinningBlade"] || 0) > 0) continue;
        const rr = e.r + bladeR;
        const dx = e.x - bx;
        const dy = e.y - by;
        if (dx * dx + dy * dy <= rr * rr) {
          damageEnemy(e, damage, evolved ? weapons.moonWheel.color : weapons.spinningBlade.color);
          e.hit[evolved ? "moonWheel" : "spinningBlade"] = evolved ? 0.18 : 0.32;
        }
      }
      state.particles.push({ x: bx, y: by, vx: 0, vy: 0, life: 0.08, max: 0.08, r: bladeR, color: evolved ? weapons.moonWheel.color : weapons.spinningBlade.color, kind: evolved ? "moonBlade" : "blade" });
    }
  }

  function castPoison(level, dt, evolved) {
    const p = state.player;
    const id = evolved ? "plagueDomain" : "poisonMist";
    const cd = evolved ? 0.92 : Math.max(1.2, 2.3 - level * 0.09);
    if (!weaponTimer(id, cd, dt)) return;
    const count = (evolved ? 3 : 1 + Math.floor(level / 4)) + p.amountBonus;
    for (let i = 0; i < count; i++) {
      const target = evolved ? { x: p.x + rand(-110, 110), y: p.y + rand(-110, 110) } : (randomEnemyOnScreen() || p);
      addArea(target.x + rand(-48, 48), target.y + rand(-48, 48), {
        r: (evolved ? 92 : 54 + level * 5) * p.areaMult,
        life: (evolved ? 4 : 3.2 + level * 0.15) * p.durationMult,
        tick: 0.34,
        damage: (evolved ? 17 : 8 + level * 2.2) * p.damageMult,
        color: evolved ? weapons.plagueDomain.color : weapons.poisonMist.color,
        kind: evolved ? "plagueDomain" : "poison",
        slow: 0.18
      });
    }
  }

  function castCrossbow(level, dt, evolved) {
    const p = state.player;
    const id = evolved ? "dragonRepeater" : "crossbow";
    const cd = evolved ? 0.22 : Math.max(0.32, 0.72 - level * 0.04);
    if (!weaponTimer(id, cd, dt)) return;
    const count = (evolved ? 3 : 1 + Math.floor(level / 3)) + p.amountBonus;
    const target = nearestEnemy(820);
    const base = target ? Math.atan2(target.y - p.y, target.x - p.x) : Math.atan2(p.lastDir.y, p.lastDir.x);
    for (let i = 0; i < count; i++) {
      const a = base + rand(-0.14, 0.14) + (i - (count - 1) / 2) * 0.08;
      projectile(p.x, p.y, Math.cos(a) * (evolved ? 900 : 760), Math.sin(a) * (evolved ? 900 : 760), {
        r: evolved ? 7 : 5,
        damage: (evolved ? 17 : 8 + level * 2.3) * p.damageMult,
        pierce: evolved ? 5 : 1 + Math.floor(level / 4),
        life: 1.2,
        color: evolved ? weapons.dragonRepeater.color : weapons.crossbow.color,
        kind: evolved ? "dragonBolt" : "bolt",
        homing: evolved ? 2.4 : 0
      });
    }
  }

  function addArea(x, y, options) {
    state.areas.push({
      x,
      y,
      r: options.r,
      life: options.life,
      maxLife: options.life,
      tick: options.tick,
      tickLeft: 0,
      damage: options.damage,
      color: options.color,
      kind: options.kind,
      slow: options.slow || 0
    });
  }

  function lightning(enemy, damage, evolved) {
    damageEnemy(enemy, damage, evolved ? weapons.thunderArray.color : weapons.thunderPearl.color);
    enemy.slow = Math.max(enemy.slow, 0.16);
    state.particles.push({
      x: enemy.x,
      y: enemy.y,
      vx: 0,
      vy: 0,
      life: 0.18,
      max: 0.18,
      r: evolved ? 74 : 52,
      color: evolved ? weapons.thunderArray.color : weapons.thunderPearl.color,
      kind: "lightning"
    });
    state.shake = Math.max(state.shake, evolved ? 7 : 4);
  }

  function updateProjectiles(dt) {
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const pr = state.projectiles[i];
      pr.life -= dt;
      pr.spin += dt * 8;
      if (pr.homing > 0) {
        const target = nearestEnemy(520, pr);
        if (target) {
          const desired = normalize(target.x - pr.x, target.y - pr.y);
          const speed = len(pr.vx, pr.vy);
          pr.vx += desired.x * pr.homing * speed * dt;
          pr.vy += desired.y * pr.homing * speed * dt;
          const n = normalize(pr.vx, pr.vy);
          pr.vx = n.x * speed;
          pr.vy = n.y * speed;
        }
      }
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      for (const e of state.enemies) {
        if (e.hp <= 0 || pr.pierce <= 0) continue;
        const rr = e.r + pr.r;
        const dx = e.x - pr.x;
        const dy = e.y - pr.y;
        if (dx * dx + dy * dy <= rr * rr) {
          damageEnemy(e, pr.damage, pr.color);
          if (pr.slow) e.slow = Math.max(e.slow, pr.slow);
          if (pr.area) {
            addArea(pr.x, pr.y, {
              r: pr.area * state.player.areaMult,
              life: 0.35,
              tick: 0.05,
              damage: pr.damage * 0.42,
              color: pr.color,
              kind: "burst",
              slow: pr.slow
            });
          }
          pr.pierce -= 1;
        }
      }
      if (pr.life <= 0 || pr.pierce <= 0) {
        if ((pr.kind === "fire" || pr.kind === "fireSea") && pr.area) {
          addArea(pr.x, pr.y, {
            r: pr.area * state.player.areaMult,
            life: 1.4 * state.player.durationMult,
            tick: 0.2,
            damage: pr.damage * 0.34,
            color: pr.color,
            kind: pr.kind
          });
        }
        state.projectiles.splice(i, 1);
      }
    }

    for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
      const pr = state.enemyProjectiles[i];
      pr.life -= dt;
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      const p = state.player;
      const rr = p.r + pr.r;
      if ((p.x - pr.x) ** 2 + (p.y - pr.y) ** 2 <= rr * rr) {
        hurtPlayer(pr.damage);
        state.enemyProjectiles.splice(i, 1);
        continue;
      }
      if (pr.life <= 0) state.enemyProjectiles.splice(i, 1);
    }
  }

  function updateAreas(dt) {
    for (let i = state.areas.length - 1; i >= 0; i--) {
      const area = state.areas[i];
      area.life -= dt;
      area.tickLeft -= dt;
      if (area.tickLeft <= 0) {
        area.tickLeft = area.tick;
        const r2 = area.r * area.r;
        for (const e of state.enemies) {
          if (e.hp <= 0) continue;
          const dx = e.x - area.x;
          const dy = e.y - area.y;
          if (dx * dx + dy * dy <= r2) {
            damageEnemy(e, area.damage, area.color, false);
            if (area.slow) e.slow = Math.max(e.slow, area.slow);
          }
        }
      }
      if (area.life <= 0) state.areas.splice(i, 1);
    }
  }

  function updateEnemies(dt) {
    const p = state.player;
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      e.flash = Math.max(0, e.flash - dt * 4);
      e.slow = Math.max(0, e.slow - dt * 0.65);
      for (const key of Object.keys(e.hit)) e.hit[key] -= dt;
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const slowMult = e.slow > 0 ? 0.52 : 1;
      e.vx = (dx / d) * e.speed * slowMult;
      e.vy = (dy / d) * e.speed * slowMult;
      e.x += e.vx * dt;
      e.y += e.vy * dt;

      if (e.type.id === "spitter") {
        e.attackTimer -= dt;
        if (e.attackTimer <= 0 && d < 560) {
          e.attackTimer = rand(2.4, 3.6);
          const n = normalize(dx, dy);
          state.enemyProjectiles.push({
            x: e.x,
            y: e.y,
            vx: n.x * 255,
            vy: n.y * 255,
            r: 7,
            damage: e.damage,
            life: 3,
            color: "#e88a5d"
          });
        }
      }

      if (e.type.id === "summoner" || e.type.id === "eliteSummoner") {
        e.summonTimer -= dt;
        if (e.summonTimer <= 0 && state.enemies.length < MAX_ENEMIES - 6) {
          e.summonTimer = e.elite ? 3.4 : 5.4;
          for (let j = 0; j < (e.elite ? 5 : 2); j++) {
            const small = enemyTypes[0];
            state.enemies.push({
              x: e.x + rand(-60, 60),
              y: e.y + rand(-60, 60),
              vx: 0,
              vy: 0,
              type: small,
              name: small.name,
              hp: small.hp * 0.9,
              maxHp: small.hp * 0.9,
              speed: small.speed * 1.2,
              damage: small.damage,
              r: small.radius,
              xp: 1,
              color: small.color,
              elite: false,
              boss: false,
              hit: {},
              attackTimer: 2,
              summonTimer: 4,
              slow: 0,
              flash: 0
            });
          }
        }
      }

      const touch = p.r + e.r;
      if (d <= touch) {
        const push = (touch - d) * 0.5;
        e.x -= (dx / d) * push;
        e.y -= (dy / d) * push;
        hurtPlayer(e.damage * 0.25);
      }

      if (e.hp <= 0) {
        killEnemy(e);
        state.enemies.splice(i, 1);
      } else if (Math.abs(e.x - p.x) > 1600 || Math.abs(e.y - p.y) > 1600) {
        if (!e.elite && state.enemies.length > 220) state.enemies.splice(i, 1);
      }
    }
  }

  function damageEnemy(e, amount, color, text = true) {
    e.hp -= amount;
    e.flash = 1;
    if (text && chance(0.22)) {
      floatingText(e.x, e.y - e.r, Math.ceil(amount).toString(), color, 12);
    }
  }

  function killEnemy(e) {
    state.kills += 1;
    const xpValue = Math.max(1, Math.round(e.xp * (e.elite ? 1.4 : 1)));
    const gemCount = e.elite ? 5 : chance(0.12) ? 2 : 1;
    for (let i = 0; i < gemCount; i++) {
      state.gems.push({
        x: e.x + rand(-10, 10),
        y: e.y + rand(-10, 10),
        value: Math.max(1, Math.round(xpValue / gemCount)),
        r: e.elite ? 7 : 5,
        color: e.elite ? colors.gold : colors.blue,
        vx: rand(-24, 24),
        vy: rand(-24, 24)
      });
    }
    if (chance(e.elite ? 0.9 : 0.08)) {
      const coinValue = e.elite ? 15 : 1 + Math.floor(rand(0, 3));
      state.coins.push({ x: e.x, y: e.y, value: coinValue, r: e.elite ? 8 : 5, vx: rand(-30, 30), vy: rand(-30, 30) });
    }
    maybeDropPowerup(e);
    if (e.elite) {
      state.chests.push({ x: e.x, y: e.y, r: 17, pulse: 0 });
      floatingText(e.x, e.y - 44, "宝箱", colors.gold, 18);
      playSfx("elite");
    } else {
      playSfx("kill");
    }
    if (e.boss) {
      state.bossDefeated = true;
      state.runCoins += Math.floor(180 * state.player.greedy);
      floatingText(e.x, e.y - 62, "妖君伏诛", colors.gold, 24);
      state.shake = Math.max(state.shake, 20);
    }
    burst(e.x, e.y, e.color, e.elite ? 20 : 7, e.elite ? 160 : 90);
  }

  function maybeDropPowerup(e) {
    if (state.powerups.length >= 16) return;
    if (e.boss) return;
    const roll = Math.random();
    let type = null;
    if (e.elite && roll < 0.45) {
      type = roll < 0.14 ? "bomb" : roll < 0.3 ? "magnet" : "heal";
    } else if (!e.elite && roll < 0.0035) {
      type = roll < 0.0008 ? "bomb" : roll < 0.002 ? "magnet" : "heal";
    }
    if (!type) return;
    state.powerups.push({
      x: e.x + rand(-12, 12),
      y: e.y + rand(-12, 12),
      type,
      r: 12,
      vx: rand(-38, 38),
      vy: rand(-38, 38),
      pulse: rand(0, TAU)
    });
  }

  function hurtPlayer(amount) {
    const p = state.player;
    if (p.invuln > 0) return;
    if (state.elapsed < 30) amount *= 0.12;
    else if (state.elapsed < 60) amount *= 0.45;
    p.hp -= amount;
    p.hitFlash = 1;
    playSfx("hit");
    state.shake = Math.max(state.shake, 5);
    p.invuln = amount > 8 ? 0.24 : 0.2;
    if (p.hp <= 0) {
      p.hp = 0;
      finishRun(false);
    }
  }

  function updatePickups(dt) {
    const p = state.player;
    const pickupR = 86 * p.pickup;
    for (let i = state.gems.length - 1; i >= 0; i--) {
      const g = state.gems[i];
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.vx *= 0.92;
      g.vy *= 0.92;
      const dx = p.x - g.x;
      const dy = p.y - g.y;
      const d = Math.hypot(dx, dy);
      if (d < pickupR) {
        const speed = clamp((pickupR - d) * 9, 120, 720);
        g.x += (dx / (d || 1)) * speed * dt;
        g.y += (dy / (d || 1)) * speed * dt;
      }
      if (d < p.r + g.r + 6) {
        gainXp(g.value);
        playSfx("xp");
        state.gems.splice(i, 1);
      }
    }

    for (let i = state.coins.length - 1; i >= 0; i--) {
      const c = state.coins[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vx *= 0.9;
      c.vy *= 0.9;
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      const d = Math.hypot(dx, dy);
      if (d < pickupR * 0.9) {
        const speed = clamp((pickupR - d) * 8, 110, 680);
        c.x += (dx / (d || 1)) * speed * dt;
        c.y += (dy / (d || 1)) * speed * dt;
      }
      if (d < p.r + c.r + 6) {
        const value = Math.max(1, Math.round(c.value * p.greedy));
        state.runCoins += value;
        playSfx("coin");
        floatingText(c.x, c.y - 12, `+${value}`, colors.gold, 12);
        state.coins.splice(i, 1);
      }
    }

    for (let i = state.powerups.length - 1; i >= 0; i--) {
      const item = state.powerups[i];
      item.pulse += dt * 5;
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.vx *= 0.9;
      item.vy *= 0.9;
      const dx = p.x - item.x;
      const dy = p.y - item.y;
      const d = Math.hypot(dx, dy);
      if (d < pickupR * 0.82) {
        const speed = clamp((pickupR - d) * 7.5, 120, 660);
        item.x += (dx / (d || 1)) * speed * dt;
        item.y += (dy / (d || 1)) * speed * dt;
      }
      if (d < p.r + item.r + 8) {
        applyPowerup(item.type);
        state.powerups.splice(i, 1);
      }
    }

    for (const chest of state.chests) {
      chest.pulse += dt;
      if (dist2(chest, p) < (p.r + chest.r + 8) ** 2 && state.screen === "playing") {
        openChest(chest);
        break;
      }
    }
  }

  function applyPowerup(type) {
    const p = state.player;
    if (!p) return;
    const info = powerupTypes[type];
    if (type === "heal") {
      const heal = Math.ceil(p.maxHp * 0.34);
      p.hp = clamp(p.hp + heal, 0, p.maxHp);
      floatingText(p.x, p.y - 48, `+${heal}`, info.color, 18);
      burst(p.x, p.y, info.color, 22, 140);
      playSfx("level");
      return;
    }
    if (type === "magnet") {
      let xpTotal = 0;
      for (const g of state.gems) xpTotal += g.value;
      let coinTotal = 0;
      for (const c of state.coins) coinTotal += Math.max(1, Math.round(c.value * p.greedy));
      state.gems = [];
      state.coins = [];
      if (xpTotal > 0) gainXp(xpTotal);
      if (coinTotal > 0) state.runCoins += coinTotal;
      floatingText(p.x, p.y - 54, "摄灵", info.color, 20);
      burst(p.x, p.y, info.color, 36, 240);
      playSfx("chest");
      return;
    }
    if (type === "bomb") {
      let hit = 0;
      for (const e of state.enemies) {
        const s = worldToScreen(e.x, e.y);
        const onScreen = s.x > -160 && s.x < window.innerWidth + 160 && s.y > -160 && s.y < window.innerHeight + 160;
        if (!onScreen) continue;
        const damage = e.boss ? 1200 : e.elite ? 900 : e.maxHp * 1.4;
        damageEnemy(e, damage, info.color, false);
        e.slow = Math.max(e.slow, 0.5);
        hit += 1;
      }
      addArea(p.x, p.y, {
        r: Math.max(window.innerWidth, window.innerHeight) * 0.55,
        life: 0.42,
        tick: 0.08,
        damage: 35 * p.damageMult,
        color: info.color,
        kind: "burst"
      });
      floatingText(p.x, p.y - 58, `镇妖雷 ${hit}`, info.color, 20);
      state.shake = Math.max(state.shake, 24);
      playSfx("evolve");
    }
  }

  function floatingText(x, y, text, color, size = 14) {
    state.texts.push({ x, y, text, color, size, life: 0.85, max: 0.85, vy: -32 });
  }

  function burst(x, y, color, count, speed) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU);
      const s = rand(speed * 0.25, speed);
      state.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rand(0.28, 0.62),
        max: 0.62,
        r: rand(2, 5),
        color,
        kind: "spark"
      });
    }
  }

  function updateFx(dt) {
    for (let i = state.texts.length - 1; i >= 0; i--) {
      const t = state.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      if (t.life <= 0) state.texts.splice(i, 1);
    }
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
    state.shake = Math.max(0, state.shake - dt * 28);
    if (state.player) {
      state.player.invuln = Math.max(0, state.player.invuln - dt);
      state.player.hitFlash = Math.max(0, state.player.hitFlash - dt * 5);
    }
  }

  function updateCamera(dt) {
    const p = state.player;
    state.camera.x += (p.x - state.camera.x) * clamp(dt * 7.5, 0, 1);
    state.camera.y += (p.y - state.camera.y) * clamp(dt * 7.5, 0, 1);
  }

  function finishRun(victory) {
    if (state.screen === "result") return;
    const survivalBonus = Math.floor(state.elapsed / 5);
    const killBonus = Math.floor(state.kills / 12);
    const victoryBonus = victory ? 250 : 0;
    const total = Math.floor((state.runCoins + survivalBonus + killBonus + victoryBonus) * (state.player?.greedy || 1));
    state.lastResult = { victory, total };
    playSfx(victory ? "victory" : "defeat");
    state.save.coins += total;
    state.save.runs += 1;
    if (victory) state.save.victories += 1;
    state.save.bestTime = Math.max(state.save.bestTime, Math.floor(state.elapsed));
    state.save.bestKills = Math.max(state.save.bestKills, state.kills);
    state.save.bestLevel = Math.max(state.save.bestLevel || 1, state.player?.level || 1);
    state.save.bestEvolved = Math.max(state.save.bestEvolved || 0, countEvolvedWeapons());
    state.save.bestRunCoins = Math.max(state.save.bestRunCoins || 0, total);
    const unlockResult = refreshAchievements();
    saveGame();
    buildCharacterCards();
    buildAchievementGrid();
    const unlockRows = [
      ...unlockResult.newlyCompleted.map((a) => `<div class="stat-row"><span>新成就</span><strong>${a.name}</strong></div>`),
      ...unlockResult.newlyUnlocked.map((id) => `<div class="stat-row"><span>新角色</span><strong>${characters.find((c) => c.id === id)?.name || id}</strong></div>`)
    ].join("");
    ui.resultTitle.textContent = victory ? "妖君伏诛" : "修行终止";
    ui.resultStats.innerHTML = `
      <div class="stat-row"><span>存活时间</span><strong>${Math.floor(state.elapsed / 60)}:${String(Math.floor(state.elapsed % 60)).padStart(2, "0")}</strong></div>
      <div class="stat-row"><span>击杀</span><strong>${state.kills}</strong></div>
      <div class="stat-row"><span>等级</span><strong>${state.player?.level || 1}</strong></div>
      <div class="stat-row"><span>进化法宝</span><strong>${countEvolvedWeapons()}</strong></div>
      <div class="stat-row"><span>本局灵石</span><strong>${total}</strong></div>
      <div class="stat-row"><span>总灵石</span><strong>${state.save.coins}</strong></div>
      ${unlockRows}
    `;
    showScreen("result");
  }

  function updateHud() {
    const p = state.player;
    if (!p) {
      ui.totalCoins.textContent = state.save.coins;
      return;
    }
    ui.timer.textContent = formatTime(state.elapsed);
    ui.levelText.textContent = p.level;
    ui.wave.textContent = state.wave;
    ui.runCoins.textContent = state.runCoins;
    ui.hpFill.style.width = `${clamp((p.hp / p.maxHp) * 100, 0, 100)}%`;
    ui.hpText.textContent = `${Math.ceil(p.hp)} / ${Math.ceil(p.maxHp)}`;
    ui.xpFill.style.width = `${clamp((p.xp / p.xpNext) * 100, 0, 100)}%`;
    ui.xpText.textContent = `${p.xp} / ${p.xpNext}`;

    const boss = state.enemies.find((e) => e.boss && e.hp > 0);
    ui.bossBar.classList.toggle("hidden", !boss);
    if (boss) {
      const pct = clamp(boss.hp / boss.maxHp, 0, 1);
      ui.bossName.textContent = boss.name;
      ui.bossText.textContent = `${Math.ceil(pct * 100)}%`;
      ui.bossFill.style.width = `${pct * 100}%`;
    }

    const signature = JSON.stringify({
      weapons: Object.entries(p.weapons).map(([id, owned]) => [id, owned.level]),
      passives: Object.entries(p.passives).map(([id, owned]) => [id, owned.level])
    });
    if (signature !== state.hudSignature) {
      state.hudSignature = signature;

      ui.weaponList.innerHTML = "";
      for (const [id, owned] of Object.entries(p.weapons)) {
        const item = weapons[id];
        const div = document.createElement("div");
        div.className = "slot";
        div.innerHTML = `<strong style="color:${item.color}">${item.name}</strong><span>${item.type === "evolved" ? "进化" : `Lv ${owned.level}/${item.max}`}</span>`;
        ui.weaponList.appendChild(div);
      }

      ui.passiveList.innerHTML = "";
      for (const [id, owned] of Object.entries(p.passives)) {
        const item = passives[id];
        const div = document.createElement("div");
        div.className = "slot";
        div.innerHTML = `<strong style="color:${item.color}">${item.name}</strong><span>Lv ${owned.level}/${item.max}</span>`;
        ui.passiveList.appendChild(div);
      }
    }
    updateQaDataset();
  }

  function updateQaDataset() {
    if (!QA_MODE) return;
    document.body.dataset.qaScreen = state.screen;
    document.body.dataset.qaElapsed = state.elapsed.toFixed(2);
    document.body.dataset.qaBossSpawned = state.bossSpawned ? "1" : "0";
    document.body.dataset.qaBossDefeated = state.bossDefeated ? "1" : "0";
    document.body.dataset.qaBossAlive = state.enemies.some((e) => e.boss && e.hp > 0) ? "1" : "0";
    document.body.dataset.qaEnemies = String(state.enemies.length);
    document.body.dataset.qaProjectiles = String(state.projectiles.length);
    document.body.dataset.qaEnemyProjectiles = String(state.enemyProjectiles.length);
    document.body.dataset.qaAreas = String(state.areas.length);
    document.body.dataset.qaGems = String(state.gems.length);
    document.body.dataset.qaCoins = String(state.coins.length);
    document.body.dataset.qaChests = String(state.chests.length);
    document.body.dataset.qaPowerups = String(state.powerups.length);
    const boss = state.enemies.find((e) => e.boss && e.hp > 0);
    document.body.dataset.qaBossHp = boss ? String(Math.ceil(boss.hp)) : "0";
    document.body.dataset.qaKills = String(state.kills);
    document.body.dataset.qaHp = String(Math.ceil(state.player?.hp || 0));
    document.body.dataset.qaMaxHp = String(Math.ceil(state.player?.maxHp || 0));
    document.body.dataset.qaLevel = String(state.player?.level || 0);
    document.body.dataset.qaRunCoins = String(state.runCoins);
    document.body.dataset.qaEvolved = String(countEvolvedWeapons());
    document.body.dataset.qaAchievements = String(Object.values(state.save.achievements || {}).filter(Boolean).length);
    document.body.dataset.qaUnlocked = Object.keys(state.save.unlockedCharacters || {}).filter((id) => state.save.unlockedCharacters[id]).join(",");
    document.body.dataset.qaMode = state.qa.mode || "";
    document.body.dataset.qaTimeScale = String(state.qa.timeScale || 1);
    document.body.dataset.qaVictory = state.lastResult ? (state.lastResult.victory ? "1" : "0") : "";
    document.body.dataset.qaResultCoins = state.lastResult ? String(state.lastResult.total) : "";
    document.body.dataset.qaSyncSteps = String(state.qa.syncSteps || 0);
    document.body.dataset.qaSyncMs = String(state.qa.syncMs || 0);
    document.body.dataset.qaAvgFrameMs = state.perf.frames ? ((state.perf.totalDt / state.perf.frames) * 1000).toFixed(2) : "0";
    document.body.dataset.qaMaxFrameMs = (state.perf.maxDt * 1000).toFixed(2);
  }

  function updateQaVisualDataset() {
    if (!QA_MODE || state.qa.visualDone || state.qa.mode !== "showcase") return;
    try {
      const w = canvas.width;
      const h = canvas.height;
      const image = ctx.getImageData(0, 0, w, h).data;
      const step = Math.max(1, Math.floor(Math.min(w, h) / 90));
      let samples = 0;
      let bright = 0;
      let dark = 0;
      let saturated = 0;
      let minR = 255;
      let maxR = 0;
      let minG = 255;
      let maxG = 0;
      let minB = 255;
      let maxB = 0;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const i = (y * w + x) * 4;
          const r = image[i];
          const g = image[i + 1];
          const b = image[i + 2];
          const lum = (r + g + b) / 3;
          samples += 1;
          if (lum > 180) bright += 1;
          if (lum < 35) dark += 1;
          if (Math.max(r, g, b) - Math.min(r, g, b) > 55) saturated += 1;
          minR = Math.min(minR, r);
          maxR = Math.max(maxR, r);
          minG = Math.min(minG, g);
          maxG = Math.max(maxG, g);
          minB = Math.min(minB, b);
          maxB = Math.max(maxB, b);
        }
      }
      const range = Math.max(maxR - minR, maxG - minG, maxB - minB);
      const brightRatio = bright / samples;
      const darkRatio = dark / samples;
      const saturatedRatio = saturated / samples;
      document.body.dataset.qaCanvasW = String(w);
      document.body.dataset.qaCanvasH = String(h);
      document.body.dataset.qaVisualSamples = String(samples);
      document.body.dataset.qaVisualBright = brightRatio.toFixed(3);
      document.body.dataset.qaVisualDark = darkRatio.toFixed(3);
      document.body.dataset.qaVisualSaturated = saturatedRatio.toFixed(3);
      document.body.dataset.qaVisualRange = String(range);
      document.body.dataset.qaVisualOk = samples > 1000 && range > 80 && saturatedRatio > 0.08 && brightRatio > 0.005 ? "1" : "0";
      state.qa.visualDone = true;
    } catch (err) {
      document.body.dataset.qaVisualOk = "0";
      document.body.dataset.qaVisualError = err.message || "visual sample failed";
      state.qa.visualDone = true;
    }
  }

  function update(dt) {
    if (state.screen !== "playing") {
      updateFx(dt);
      return;
    }
    recordQaStep(dt);
    state.elapsed += dt;
    updateSpawn(dt);
    updateQaAutoInput(dt);
    updateInput(dt);
    updateWeapons(dt);
    updateProjectiles(dt);
    updateAreas(dt);
    updateEnemies(dt);
    updatePickups(dt);
    updateFx(dt);
    updateCamera(dt);
    if (state.qa.syncRunning) {
      state.qa.syncSteps += 1;
      if (state.qa.syncSteps % 10 === 0) updateHud();
    } else {
      updateHud();
    }
    if (state.elapsed >= RUN_DURATION) {
      finishRun(true);
    }
  }

  function recordQaStep(dt) {
    if (!QA_MODE) return;
    state.perf.frames += 1;
    state.perf.totalDt += dt;
    state.perf.maxDt = Math.max(state.perf.maxDt, dt);
  }

  function updateQaAutoInput(dt) {
    if (!state.qa.autoMove || !state.player) return;
    const p = state.player;
    let x = Math.cos(state.elapsed * 0.75) * 0.25;
    let y = Math.sin(state.elapsed * 0.58) * 0.25;

    for (const e of state.enemies) {
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > 340) continue;
      const weight = ((340 - d) / 340) * (e.elite ? 2.2 : 1);
      x -= (dx / d) * weight;
      y -= (dy / d) * weight;
    }

    const targets = state.chests.length ? state.chests : state.powerups.length ? state.powerups : state.gems.length ? state.gems : state.coins;
    if (targets.length && p.hp > p.maxHp * 0.35) {
      let best = null;
      let bestD = Infinity;
      for (const target of targets) {
        const d = dist2(p, target);
        if (d < bestD) {
          bestD = d;
          best = target;
        }
      }
      if (best) {
        const dx = best.x - p.x;
        const dy = best.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        x += (dx / d) * 0.55;
        y += (dy / d) * 0.55;
      }
    }

    const n = Math.hypot(x, y);
    state.input.pointerDown = true;
    state.input.touchVector.x = n > 0.05 ? x / n : 0;
    state.input.touchVector.y = n > 0.05 ? y / n : 0;
  }

  function worldToScreen(x, y) {
    return {
      x: x - state.camera.x + window.innerWidth / 2,
      y: y - state.camera.y + window.innerHeight / 2
    };
  }

  function screenToWorld(x, y) {
    return {
      x: x + state.camera.x - window.innerWidth / 2,
      y: y + state.camera.y - window.innerHeight / 2
    };
  }

  function render() {
    resize();
    ctx.save();
    ctx.fillStyle = "#111417";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    if (state.shake > 0) {
      ctx.translate(rand(-state.shake, state.shake), rand(-state.shake, state.shake));
    }
    renderWorld();
    if (state.player) {
      renderPickups();
      renderAreas();
      renderProjectiles();
      renderEnemies();
      renderPlayer();
      renderParticles();
      renderTexts();
      renderVignette();
    } else {
      renderAttract();
    }
    ctx.restore();
    updateQaVisualDataset();
  }

  function renderAttract() {
    const t = performance.now() / 1000;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    for (let i = 0; i < 38; i++) {
      const a = i * 0.72 + t * 0.18;
      const r = 80 + (i % 9) * 34;
      ctx.fillStyle = i % 2 ? "rgba(124, 215, 175, 0.16)" : "rgba(241, 198, 106, 0.14)";
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a * 1.13) * r * 0.55, 3 + (i % 4), 0, TAU);
      ctx.fill();
    }
  }

  function renderWorld() {
    const camX = state.camera.x;
    const camY = state.camera.y;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#10181b");
    bg.addColorStop(0.45, "#151b1c");
    bg.addColorStop(1, "#0e1215");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const moon = ctx.createRadialGradient(w * 0.18, h * 0.08, 10, w * 0.18, h * 0.08, Math.max(w, h) * 0.72);
    moon.addColorStop(0, "rgba(124, 215, 175, 0.14)");
    moon.addColorStop(0.32, "rgba(124, 215, 175, 0.05)");
    moon.addColorStop(1, "rgba(124, 215, 175, 0)");
    ctx.fillStyle = moon;
    ctx.fillRect(0, 0, w, h);

    const tile = 112;
    const startX = Math.floor((camX - w / 2) / tile) * tile;
    const startY = Math.floor((camY - h / 2) / tile) * tile;

    ctx.lineWidth = 1;
    for (let x = startX; x < camX + w / 2 + tile; x += tile) {
      for (let y = startY; y < camY + h / 2 + tile; y += tile) {
        const sx = Math.round(x - camX + w / 2);
        const sy = Math.round(y - camY + h / 2);
        const hsh = hash2(Math.floor(x / tile), Math.floor(y / tile));
        ctx.fillStyle = hsh > 0.52 ? "rgba(255, 255, 255, 0.01)" : "rgba(0, 0, 0, 0.018)";
        ctx.fillRect(sx + 1, sy + 1, tile - 2, tile - 2);
        ctx.strokeStyle = hsh > 0.65 ? "rgba(241, 198, 106, 0.028)" : "rgba(242, 234, 215, 0.024)";
        ctx.strokeRect(sx + 0.5, sy + 0.5, tile, tile);
        if (hsh > 0.72) {
          ctx.strokeStyle = "rgba(242, 234, 215, 0.05)";
          ctx.beginPath();
          ctx.moveTo(sx + tile * 0.18, sy + tile * (0.25 + hsh * 0.2));
          ctx.lineTo(sx + tile * 0.52, sy + tile * (0.42 + hsh * 0.12));
          ctx.lineTo(sx + tile * 0.78, sy + tile * (0.36 + hsh * 0.18));
          ctx.stroke();
        }
      }
    }

    for (const d of state.decorations) {
      const s = worldToScreen(d.x, d.y);
      if (s.x < -80 || s.x > w + 80 || s.y < -80 || s.y > h + 80) continue;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(d.rot);
      if (d.kind === 0) {
        ctx.fillStyle = "rgba(87, 91, 78, 0.72)";
        ctx.fillRect(-d.r * 0.6, -d.r * 0.38, d.r * 1.2, d.r * 0.76);
      } else if (d.kind === 1) {
        ctx.fillStyle = "rgba(84, 99, 92, 0.62)";
        ctx.beginPath();
        ctx.moveTo(0, -d.r);
        ctx.lineTo(d.r * 0.72, d.r);
        ctx.lineTo(-d.r * 0.72, d.r);
        ctx.closePath();
        ctx.fill();
      } else if (d.kind === 2) {
        ctx.strokeStyle = "rgba(241, 198, 106, 0.16)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, d.r, 0, TAU);
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(75, 67, 62, 0.68)";
        ctx.beginPath();
        ctx.ellipse(0, 0, d.r, d.r * 0.58, 0, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    const fogOffset = performance.now() / 3600;
    for (let i = 0; i < 5; i++) {
      const y = h * (0.18 + i * 0.16) + Math.sin(fogOffset + i) * 10;
      const x = ((fogOffset * 58 + i * 211) % (w + 360)) - 180;
      const fog = ctx.createRadialGradient(x, y, 20, x, y, 230);
      fog.addColorStop(0, "rgba(124, 215, 175, 0.05)");
      fog.addColorStop(1, "rgba(124, 215, 175, 0)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function renderPlayer() {
    const p = state.player;
    const s = worldToScreen(p.x, p.y);
    ctx.save();
    ctx.translate(s.x, s.y);
    const flash = p.hitFlash > 0 ? "#ffffff" : p.character.color;
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 16, 18, 7, 0, 0, TAU);
    ctx.fill();
    ctx.shadowColor = p.character.color;
    ctx.shadowBlur = 14;
    ctx.fillStyle = flash;
    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(21, 23, 26, 0.52)";
    ctx.beginPath();
    ctx.moveTo(-p.r * 0.65, 7);
    ctx.quadraticCurveTo(0, p.r * 1.15, p.r * 0.65, 7);
    ctx.lineTo(p.r * 0.36, -4);
    ctx.quadraticCurveTo(0, 3, -p.r * 0.36, -4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#15171a";
    ctx.beginPath();
    ctx.arc(6, -5, 3, 0, TAU);
    ctx.arc(-6, -5, 3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(242, 234, 215, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, p.r + 6 + Math.sin(performance.now() / 220) * 2, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  function renderEnemies() {
    for (const e of state.enemies) {
      const s = worldToScreen(e.x, e.y);
      if (s.x < -120 || s.x > window.innerWidth + 120 || s.y < -120 || s.y > window.innerHeight + 120) continue;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.beginPath();
      ctx.ellipse(0, e.r * 0.78, e.r * 0.9, e.r * 0.34, 0, 0, TAU);
      ctx.fill();
      ctx.shadowColor = e.boss ? colors.danger : e.elite ? colors.gold : e.color;
      ctx.shadowBlur = e.elite ? 14 : 7;
      ctx.fillStyle = e.flash > 0 ? "#ffffff" : e.color;
      if (e.boss) {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = (TAU / 10) * i - Math.PI / 2;
          const r = i % 2 ? e.r * 0.72 : e.r;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(20, 8, 10, 0.72)";
        ctx.beginPath();
        ctx.arc(0, 0, e.r * 0.48, 0, TAU);
        ctx.fill();
      } else if (e.elite) {
        ctx.beginPath();
        ctx.moveTo(0, -e.r);
        ctx.lineTo(e.r, 0);
        ctx.lineTo(0, e.r);
        ctx.lineTo(-e.r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255, 232, 160, 0.22)";
        ctx.beginPath();
        ctx.arc(0, 0, e.r * 0.62, 0, TAU);
        ctx.fill();
      } else {
        drawEnemySilhouette(e);
      }
      ctx.shadowBlur = 0;
      if (!e.boss) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.38)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, e.r, 0, TAU);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(20, 20, 20, 0.85)";
      ctx.beginPath();
      ctx.arc(-e.r * 0.33, -e.r * 0.12, 2.2, 0, TAU);
      ctx.arc(e.r * 0.33, -e.r * 0.12, 2.2, 0, TAU);
      ctx.fill();
      if (e.elite) {
        const hpw = e.boss ? 96 : 56;
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(-hpw / 2, -e.r - 14, hpw, 6);
        ctx.fillStyle = e.boss ? colors.danger : colors.gold;
        ctx.fillRect(-hpw / 2, -e.r - 14, hpw * clamp(e.hp / e.maxHp, 0, 1), 6);
      }
      ctx.restore();
    }
  }

  function drawEnemySilhouette(e) {
    const r = e.r;
    switch (e.type.id) {
      case "wolf":
      case "runner":
        ctx.beginPath();
        ctx.moveTo(-r * 0.9, r * 0.1);
        ctx.quadraticCurveTo(-r * 0.45, -r * 0.85, r * 0.55, -r * 0.52);
        ctx.lineTo(r * 0.95, -r * 0.1);
        ctx.quadraticCurveTo(r * 0.5, r * 0.75, -r * 0.7, r * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(20,20,20,0.52)";
        ctx.beginPath();
        ctx.moveTo(-r * 0.4, -r * 0.52);
        ctx.lineTo(-r * 0.12, -r * 1.08);
        ctx.lineTo(r * 0.06, -r * 0.45);
        ctx.closePath();
        ctx.fill();
        break;
      case "wisp":
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.15);
        ctx.bezierCurveTo(r, -r * 0.55, r * 0.76, r * 0.82, 0, r);
        ctx.bezierCurveTo(-r * 0.76, r * 0.82, -r, -r * 0.55, 0, -r * 1.15);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.2, r * 0.24, 0, TAU);
        ctx.fill();
        break;
      case "bug":
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 0.75, r, 0, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(242,234,215,0.18)";
        ctx.beginPath();
        ctx.ellipse(-r * 0.72, -r * 0.08, r * 0.62, r * 0.26, -0.55, 0, TAU);
        ctx.ellipse(r * 0.72, -r * 0.08, r * 0.62, r * 0.26, 0.55, 0, TAU);
        ctx.fill();
        break;
      case "brute":
      case "stone":
        ctx.beginPath();
        ctx.moveTo(-r * 0.82, -r * 0.52);
        ctx.lineTo(r * 0.62, -r * 0.82);
        ctx.lineTo(r, r * 0.08);
        ctx.lineTo(r * 0.42, r * 0.9);
        ctx.lineTo(-r * 0.7, r * 0.72);
        ctx.lineTo(-r, -r * 0.02);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(-r * 0.35, -r * 0.55, r * 0.55, r * 0.18);
        break;
      case "spitter":
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(255,196,130,0.38)";
        ctx.beginPath();
        ctx.arc(r * 0.45, -r * 0.15, r * 0.34, 0, TAU);
        ctx.fill();
        break;
      case "summoner":
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.86, r * 0.42);
        ctx.lineTo(0, r * 0.78);
        ctx.lineTo(-r * 0.86, r * 0.42);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(241,198,106,0.28)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.52, 0, TAU);
        ctx.stroke();
        break;
      case "shadow":
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.08, r * 0.72, -0.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.arc(r * 0.15, -r * 0.05, r * 0.55, 0, TAU);
        ctx.fill();
        break;
      default:
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TAU);
        ctx.fill();
    }
  }

  function renderProjectiles() {
    for (const pr of state.projectiles) {
      const s = worldToScreen(pr.x, pr.y);
      if (s.x < -80 || s.x > window.innerWidth + 80 || s.y < -80 || s.y > window.innerHeight + 80) continue;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(Math.atan2(pr.vy, pr.vx) + pr.spin * 0.05);
      ctx.shadowColor = pr.color;
      ctx.shadowBlur = ["fire", "fireSea", "dragonBolt", "thousandSword"].includes(pr.kind) ? 18 : 10;
      ctx.fillStyle = pr.color;
      if (pr.kind === "thousandSword") {
        ctx.beginPath();
        ctx.moveTo(pr.r * 3.2, 0);
        ctx.lineTo(-pr.r * 0.4, pr.r * 0.9);
        ctx.lineTo(-pr.r * 1.45, pr.r * 0.28);
        ctx.lineTo(-pr.r * 0.7, 0);
        ctx.lineTo(-pr.r * 1.45, -pr.r * 0.28);
        ctx.lineTo(-pr.r * 0.4, -pr.r * 0.9);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.72)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-pr.r * 1.2, 0);
        ctx.lineTo(pr.r * 2.6, 0);
        ctx.stroke();
      } else if (pr.kind === "glacierNeedle") {
        ctx.beginPath();
        ctx.moveTo(pr.r * 2.8, 0);
        ctx.lineTo(-pr.r * 0.2, pr.r * 0.72);
        ctx.lineTo(-pr.r * 1.2, 0);
        ctx.lineTo(-pr.r * 0.2, -pr.r * 0.72);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.66)";
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (pr.kind === "dragonBolt") {
        ctx.beginPath();
        ctx.moveTo(pr.r * 2.6, 0);
        ctx.bezierCurveTo(pr.r * 0.9, pr.r * 1.1, -pr.r * 1.2, pr.r * 0.8, -pr.r * 1.55, 0);
        ctx.bezierCurveTo(-pr.r * 1.2, -pr.r * 0.8, pr.r * 0.9, -pr.r * 1.1, pr.r * 2.6, 0);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.52)";
        ctx.beginPath();
        ctx.arc(pr.r * 0.35, 0, pr.r * 0.34, 0, TAU);
        ctx.fill();
      } else if (pr.kind === "sword" || pr.kind === "needle" || pr.kind === "bolt") {
        ctx.beginPath();
        ctx.moveTo(pr.r * 2.2, 0);
        ctx.lineTo(-pr.r, pr.r * 0.55);
        ctx.lineTo(-pr.r * 0.45, 0);
        ctx.lineTo(-pr.r, -pr.r * 0.55);
        ctx.closePath();
        ctx.fill();
      } else if (pr.kind === "talisman") {
        ctx.fillRect(-pr.r * 0.75, -pr.r, pr.r * 1.5, pr.r * 2);
        ctx.strokeStyle = "#3a2812";
        ctx.strokeRect(-pr.r * 0.45, -pr.r * 0.65, pr.r * 0.9, pr.r * 1.3);
      } else if (pr.kind === "fireSea") {
        ctx.beginPath();
        ctx.moveTo(pr.r * 1.35, 0);
        for (let i = 1; i <= 7; i++) {
          const a = (TAU / 7) * i;
          const rr = i % 2 ? pr.r * 0.82 : pr.r * 1.35;
          ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(255,236,150,0.45)";
        ctx.beginPath();
        ctx.arc(0, 0, pr.r * 0.48, 0, TAU);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, pr.r, 0, TAU);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    for (const pr of state.enemyProjectiles) {
      const s = worldToScreen(pr.x, pr.y);
      ctx.fillStyle = pr.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, pr.r, 0, TAU);
      ctx.fill();
    }
  }

  function renderAreas() {
    for (const area of state.areas) {
      const s = worldToScreen(area.x, area.y);
      const alpha = clamp(area.life / area.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = area.kind === "voidSeal" ? 0.12 + alpha * 0.22 : 0.18 + alpha * 0.22;
      ctx.shadowColor = area.color;
      ctx.shadowBlur = area.kind === "plagueDomain" || area.kind === "fireSea" ? 26 : 18;
      ctx.fillStyle = area.color;
      ctx.beginPath();
      if (area.kind === "voidSeal") {
        for (let i = 0; i < 8; i++) {
          const a = (TAU / 8) * i + performance.now() / 1400;
          const r = i % 2 ? area.r * 0.82 : area.r;
          const x = s.x + Math.cos(a) * r;
          const y = s.y + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      } else {
        ctx.arc(s.x, s.y, area.r, 0, TAU);
      }
      ctx.fill();
      ctx.globalAlpha = 0.65;
      ctx.strokeStyle = area.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const pulseR = area.r * (0.84 + Math.sin(performance.now() / 160) * 0.04);
      ctx.arc(s.x, s.y, pulseR, 0, TAU);
      ctx.stroke();
      if (area.kind === "voidSeal" || area.kind === "plagueDomain") {
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < (area.kind === "voidSeal" ? 6 : 4); i++) {
          const a = (TAU / (area.kind === "voidSeal" ? 6 : 4)) * i + performance.now() / 900;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + Math.cos(a) * area.r * 0.9, s.y + Math.sin(a) * area.r * 0.9);
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  function renderPickups() {
    for (const g of state.gems) {
      const s = worldToScreen(g.x, g.y);
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - g.r);
      ctx.lineTo(s.x + g.r, s.y);
      ctx.lineTo(s.x, s.y + g.r);
      ctx.lineTo(s.x - g.r, s.y);
      ctx.closePath();
      ctx.fill();
    }
    for (const c of state.coins) {
      const s = worldToScreen(c.x, c.y);
      ctx.fillStyle = colors.gold;
      ctx.beginPath();
      ctx.arc(s.x, s.y, c.r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#6f4518";
      ctx.fillRect(s.x - 1, s.y - c.r * 0.6, 2, c.r * 1.2);
    }
    for (const item of state.powerups) {
      const info = powerupTypes[item.type];
      const s = worldToScreen(item.x, item.y);
      const pulse = Math.sin(item.pulse) * 2;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.shadowColor = info.color;
      ctx.shadowBlur = 14;
      ctx.fillStyle = info.color;
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 2;
      if (item.type === "heal") {
        ctx.beginPath();
        ctx.arc(-4, -2, 6 + pulse * 0.2, 0, TAU);
        ctx.arc(4, -2, 6 + pulse * 0.2, 0, TAU);
        ctx.moveTo(-10, 1);
        ctx.lineTo(0, 12 + pulse);
        ctx.lineTo(10, 1);
        ctx.fill();
      } else if (item.type === "magnet") {
        ctx.beginPath();
        ctx.arc(0, 0, 12 + pulse, Math.PI * 0.2, Math.PI * 1.8);
        ctx.stroke();
        ctx.fillRect(-12, -3, 5, 8);
        ctx.fillRect(7, -3, 5, 8);
      } else {
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (TAU / 8) * i + item.pulse * 0.18;
          const r = i % 2 ? 7 : 14 + pulse;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    for (const chest of state.chests) {
      const s = worldToScreen(chest.x, chest.y);
      const pulse = Math.sin(chest.pulse * 5) * 2;
      ctx.fillStyle = "#8b5726";
      ctx.fillRect(s.x - 15 - pulse, s.y - 10 - pulse, 30 + pulse * 2, 22 + pulse * 2);
      ctx.fillStyle = colors.gold;
      ctx.fillRect(s.x - 15 - pulse, s.y - 13 - pulse, 30 + pulse * 2, 7);
      ctx.strokeStyle = "rgba(255, 232, 160, 0.8)";
      ctx.strokeRect(s.x - 15 - pulse, s.y - 13 - pulse, 30 + pulse * 2, 25 + pulse * 2);
    }
  }

  function renderParticles() {
    for (const p of state.particles) {
      const s = worldToScreen(p.x, p.y);
      const alpha = clamp(p.life / p.max, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      if (p.kind === "blade" || p.kind === "moonBlade") {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.kind === "moonBlade" ? 18 : 8;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, p.r * (p.kind === "moonBlade" ? 1.25 : 1), p.r * (p.kind === "moonBlade" ? 0.48 : 0.35), performance.now() / 140, 0, TAU);
        ctx.stroke();
        if (p.kind === "moonBlade") {
          ctx.globalAlpha = alpha * 0.38;
          ctx.beginPath();
          ctx.arc(s.x, s.y, p.r * 1.05, 0, TAU);
          ctx.stroke();
        }
      } else if (p.kind === "lightning") {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - p.r);
        for (let i = 1; i < 7; i++) {
          ctx.lineTo(s.x + rand(-18, 18), s.y - p.r + (p.r * 2 * i) / 7);
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s.x, s.y, p.r * (1 - alpha * 0.4), 0, TAU);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, p.r * alpha, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function renderTexts() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const t of state.texts) {
      const s = worldToScreen(t.x, t.y);
      ctx.save();
      ctx.globalAlpha = clamp(t.life / t.max, 0, 1);
      ctx.font = `800 ${t.size}px "Microsoft YaHei", sans-serif`;
      ctx.fillStyle = "#000";
      ctx.fillText(t.text, s.x + 1, s.y + 1);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, s.x, s.y);
      ctx.restore();
    }
  }

  function renderVignette() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.72);
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(0.72, "rgba(0, 0, 0, 0.16)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.48)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  function loop(now) {
    const dt = Math.min(0.033, (now - state.lastTime) / 1000 || 0);
    state.lastTime = now;
    state.dt = dt;
    const timeScale = state.qa.timeScale || 1;
    let remaining = dt * timeScale;
    let steps = 0;
    const maxSteps = state.qa.maxSteps || 1;
    while (remaining > 0 && steps < maxSteps) {
      const step = Math.min(0.033, remaining);
      update(step);
      remaining -= step;
      steps += 1;
      if (state.screen === "result") break;
    }
    render();
    requestAnimationFrame(loop);
  }

  function bindEvents() {
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", (e) => {
      state.input.keys.add(e.code);
      if (e.code === "Escape") {
        if (state.screen === "playing") showScreen("pause");
        else if (state.screen === "pause") showScreen("playing");
      }
    });
    window.addEventListener("keyup", (e) => state.input.keys.delete(e.code));

    canvas.addEventListener("pointerdown", (e) => {
      if (state.screen !== "playing") return;
      canvas.setPointerCapture(e.pointerId);
      state.input.pointerDown = true;
      state.input.pointerId = e.pointerId;
      state.input.touchOrigin.x = e.clientX;
      state.input.touchOrigin.y = e.clientY;
      state.input.touchVector.x = 0;
      state.input.touchVector.y = 0;
      ui.touchPad.style.left = `${e.clientX - 52}px`;
      ui.touchPad.style.top = `${e.clientY - 52}px`;
      ui.touchPad.style.bottom = "auto";
      ui.touchPad.classList.toggle("hidden", !isTouchLikely());
    });

    canvas.addEventListener("pointermove", (e) => {
      state.mouseWorld = screenToWorld(e.clientX, e.clientY);
      if (!state.input.pointerDown || state.input.pointerId !== e.pointerId) return;
      const dx = e.clientX - state.input.touchOrigin.x;
      const dy = e.clientY - state.input.touchOrigin.y;
      const l = Math.hypot(dx, dy);
      const max = 42;
      state.input.touchVector.x = clamp(dx / max, -1, 1);
      state.input.touchVector.y = clamp(dy / max, -1, 1);
      if (l > max) {
        state.input.touchVector.x = dx / l;
        state.input.touchVector.y = dy / l;
      }
      ui.touchStick.style.transform = `translate(calc(-50% + ${state.input.touchVector.x * 31}px), calc(-50% + ${state.input.touchVector.y * 31}px))`;
    });

    const endPointer = (e) => {
      if (state.input.pointerId !== e.pointerId) return;
      state.input.pointerDown = false;
      state.input.pointerId = null;
      state.input.touchVector.x = 0;
      state.input.touchVector.y = 0;
      ui.touchStick.style.transform = "translate(-50%, -50%)";
      ui.touchPad.style.left = "24px";
      ui.touchPad.style.top = "auto";
      ui.touchPad.style.bottom = "28px";
    };
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);

    $("startBtn").addEventListener("click", () => {
      ensureAudio();
      playSfx("select");
      showScreen("character");
    });
    $("upgradeBtn").addEventListener("click", () => {
      ensureAudio();
      playSfx("select");
      buildMetaGrid();
      showScreen("upgrade");
    });
    $("achievementBtn").addEventListener("click", () => {
      ensureAudio();
      playSfx("select");
      buildAchievementGrid();
      showScreen("achievement");
    });
    $("codexBtn").addEventListener("click", () => {
      ensureAudio();
      playSfx("select");
      buildCodex();
      showScreen("codex");
    });
    $("backToMenuBtn").addEventListener("click", () => {
      playSfx("select");
      showScreen("menu");
    });
    $("backFromUpgradeBtn").addEventListener("click", () => {
      playSfx("select");
      showScreen("menu");
    });
    $("backFromCodexBtn").addEventListener("click", () => {
      playSfx("select");
      showScreen("menu");
    });
    $("backFromAchievementBtn").addEventListener("click", () => {
      playSfx("select");
      showScreen("menu");
    });
    $("pauseBtn").addEventListener("click", () => {
      playSfx("select");
      showScreen("pause");
    });
    $("resumeBtn").addEventListener("click", () => {
      playSfx("select");
      showScreen("playing");
    });
    $("quitBtn").addEventListener("click", () => finishRun(false));
    $("retryBtn").addEventListener("click", () => startRun(state.selectedCharacter));
    $("menuBtn").addEventListener("click", () => {
      playSfx("select");
      state.player = null;
      showScreen("menu");
    });
    $("chestContinueBtn").addEventListener("click", () => {
      playSfx("select");
      showScreen("playing");
    });
    $("soundBtn").addEventListener("click", toggleAudio);
    $("menuSoundBtn").addEventListener("click", toggleAudio);
    $("resetBtn").addEventListener("click", () => {
      if (!confirm("确认清空本地存档？")) return;
      state.save = defaultSave();
      state.audio.muted = state.save.muted;
      saveGame();
      syncAudioButtons();
      buildMetaGrid();
      buildAchievementGrid();
      buildCharacterCards();
    });
  }

  function grantQaBuild() {
    const p = state.player;
    if (!p) return;
    p.weapons = {
      flyingSword: { level: 8, evolved: false },
      talisman: { level: 8, evolved: false },
      spiritFire: { level: 8, evolved: false },
      thunderPearl: { level: 8, evolved: false },
      spinningBlade: { level: 8, evolved: false },
      crossbow: { level: 8, evolved: false }
    };
    p.passives = {
      powerCharm: { level: 5 },
      cooldownJade: { level: 5 },
      everlamp: { level: 5 },
      windBoots: { level: 5 },
      magnetBell: { level: 5 },
      splitPearl: { level: 5 }
    };
    applyStats(false);
    p.hp = p.maxHp;
    updateHud();
  }

  function grantQaEvolvedBuild() {
    const p = state.player;
    if (!p) return;
    p.weapons = {
      thousandSword: { level: 1, evolved: true },
      voidSeal: { level: 1, evolved: true },
      fireSea: { level: 1, evolved: true },
      thunderArray: { level: 1, evolved: true },
      moonWheel: { level: 1, evolved: true },
      dragonRepeater: { level: 1, evolved: true }
    };
    p.passives = {
      powerCharm: { level: 5 },
      cooldownJade: { level: 5 },
      everlamp: { level: 5 },
      windBoots: { level: 5 },
      magnetBell: { level: 5 },
      splitPearl: { level: 5 }
    };
    applyStats(false);
    p.hp = p.maxHp;
    updateHud();
  }

  function startQaMode() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("qa");
    if (!mode) return;
    state.qa.mode = mode;
    state.qa.autoChoices = mode === "soak" || mode === "powerups" || mode === "evolution";
    state.qa.autoMove = mode === "soak";
    state.qa.timeScale = mode === "soak" ? clamp(Number(params.get("speed")) || 40, 1, 80) : 1;
    state.qa.maxSteps = mode === "soak" ? clamp(Math.ceil(state.qa.timeScale), 1, 80) : 1;
    state.qa.syncSteps = 0;
    state.qa.syncMs = 0;
    state.qa.visualDone = false;
    startRun(params.get("character") || "sword");
    if (mode === "evolution") {
      state.player.weapons = { flyingSword: { level: 8, evolved: false } };
      state.player.passives = { powerCharm: { level: 1 } };
      state.forceNextChestEvolution = true;
      const chest = { x: state.player.x, y: state.player.y, r: 17, pulse: 0 };
      state.chests.push(chest);
      openChest(chest);
      updateHud();
      updateQaDataset();
      return;
    }
    grantQaBuild();
    if (mode === "boss") {
      state.elapsed = RUN_DURATION - 59;
      state.bossSpawned = true;
      spawnEnemy(true, bossType);
      updateHud();
      updateQaDataset();
      return;
    }
    if (mode === "powerups") {
      const p = state.player;
      p.hp = Math.max(1, Math.floor(p.maxHp * 0.45));
      state.enemies = [];
      for (let i = 0; i < 10; i++) {
        spawnEnemy(false);
        const e = state.enemies[state.enemies.length - 1];
        if (e) {
          const angle = (i / 10) * TAU;
          e.x = p.x + Math.cos(angle) * 170;
          e.y = p.y + Math.sin(angle) * 130;
        }
      }
      state.gems.push({ x: p.x + 210, y: p.y, value: 24, r: 6, color: colors.blue, vx: 0, vy: 0 });
      state.coins.push({ x: p.x + 230, y: p.y + 12, value: 11, r: 6, vx: 0, vy: 0 });
      state.powerups.push({ x: p.x, y: p.y, type: "bomb", r: 12, vx: 0, vy: 0, pulse: 0 });
      updatePickups(1 / 30);
      updateEnemies(0);
      state.powerups = [];
      state.powerups.push({ x: p.x, y: p.y, type: "magnet", r: 12, vx: 0, vy: 0, pulse: 0 });
      updatePickups(1 / 30);
      p.hp = Math.max(1, Math.floor(p.maxHp * 0.45));
      state.powerups.push({ x: p.x, y: p.y, type: "heal", r: 12, vx: 0, vy: 0, pulse: 0 });
      updatePickups(1 / 30);
      updateFx(1 / 30);
      state.qa.syncSteps = 3;
      updateHud();
      updateQaDataset();
      return;
    }
    if (mode === "victory") {
      state.elapsed = RUN_DURATION - 2;
      updateHud();
      return;
    }
    if (mode === "showcase") {
      grantQaEvolvedBuild();
      state.elapsed = RUN_DURATION - 260;
      for (let i = 0; i < 64; i++) spawnEnemy(false);
      spawnEnemy(true);
      const started = Date.now();
      state.qa.syncRunning = true;
      for (let i = 0; i < 120 && state.screen === "playing"; i++) update(1 / 30);
      state.qa.syncRunning = false;
      state.qa.syncMs = Date.now() - started;
      for (let i = 0; i < 52; i++) spawnEnemy(false);
      updateHud();
      render();
      return;
    }
    if (mode === "soak") {
      updateHud();
      runQaSoakSync();
    }
  }

  function runQaSoakSync() {
    const started = Date.now();
    const maxSteps = 36000;
    state.qa.syncRunning = true;
    try {
      while (state.screen !== "result" && state.qa.syncSteps < maxSteps) {
        update(1 / 30);
      }
    } finally {
      state.qa.syncRunning = false;
      state.qa.syncMs = Date.now() - started;
      updateHud();
      updateQaDataset();
    }
  }

  function exposeQaHooks() {
    if (!QA_MODE) return;
    window.__spiritQa = {
      snapshot() {
        return {
          screen: state.screen,
          elapsed: state.elapsed,
          wave: state.wave,
          bossSpawned: state.bossSpawned,
          bossAlive: state.enemies.some((e) => e.boss && e.hp > 0),
          enemies: state.enemies.length,
          projectiles: state.projectiles.length,
          enemyProjectiles: state.enemyProjectiles.length,
          areas: state.areas.length,
          gems: state.gems.length,
          powerups: state.powerups.length,
          chests: state.chests.length,
          runCoins: state.runCoins,
          kills: state.kills,
          player: state.player ? {
            hp: state.player.hp,
            maxHp: state.player.maxHp,
            level: state.player.level,
            weapons: Object.fromEntries(Object.entries(state.player.weapons).map(([id, owned]) => [id, owned.level])),
            passives: Object.fromEntries(Object.entries(state.player.passives).map(([id, owned]) => [id, owned.level]))
          } : null
        };
      }
    };
  }

  function init() {
    resize();
    state.audio.muted = Boolean(state.save.muted);
    syncAudioButtons();
    bindEvents();
    refreshAchievements();
    buildCharacterCards();
    buildMetaGrid();
    buildAchievementGrid();
    buildCodex();
    saveGame();
    exposeQaHooks();
    showScreen("menu");
    startQaMode();
    requestAnimationFrame((now) => {
      state.lastTime = now;
      requestAnimationFrame(loop);
    });
  }

  init();
})();
