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
  const ENEMY_GRID_CELL = 192;
  const MAX_PARTICLES = 720;
  const MAX_GEMS = 720;
  const MAX_COINS = 420;
  const DETAIL_ENEMY_LIMIT = 260;
  const SWARM_RENDER_LIMIT = 420;
  const DENSE_AREA_LIMIT = 48;
  const HIGH_FX_LIMIT = 560;
  const GROUND_DECAL_DENSE_LIMIT = 18;
  const QA_MODE = new URLSearchParams(window.location.search).has("qa");
  const STORAGE_KEY = QA_MODE ? "spirit-survivors-save-qa-v1" : "spirit-survivors-save-v2";
  const SWARM_IMPOSTOR_BASE_R = 18;
  const SWARM_IMPOSTOR_CANVAS = 128;
  const SWARM_CLUSTER_CELL = 164;
  const SWARM_CLUSTER_LIMIT = 18;
  const ENABLE_LEGACY_RUNTIME_ART = false;
  const ENABLE_SECONDARY_COMBAT_OVERLAYS = false;
  const swarmImpostorCache = new Map();

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

  const visualAtlas = ENABLE_LEGACY_RUNTIME_ART && typeof Image !== "undefined" ? new Image() : null;
  if (visualAtlas) {
    visualAtlas.decoding = "async";
    visualAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    visualAtlas.src = "assets/premium-combat-fx-atlas-v3.png";
  }

  const premiumProjectileAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (premiumProjectileAtlas) {
    premiumProjectileAtlas.decoding = "async";
    premiumProjectileAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    premiumProjectileAtlas.src = "assets/premium-projectile-atlas-v1.png";
  }

  const premiumMotionTrailAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (premiumMotionTrailAtlas) {
    premiumMotionTrailAtlas.decoding = "async";
    premiumMotionTrailAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    premiumMotionTrailAtlas.src = "assets/premium-motion-trail-atlas-v1.png";
  }

  const premiumSwarmPressureAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (premiumSwarmPressureAtlas) {
    premiumSwarmPressureAtlas.decoding = "async";
    premiumSwarmPressureAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    premiumSwarmPressureAtlas.src = "assets/premium-swarm-pressure-atlas-v1.png";
  }

  const hostileProjectileAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (hostileProjectileAtlas) {
    hostileProjectileAtlas.decoding = "async";
    hostileProjectileAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    hostileProjectileAtlas.src = "assets/premium-hostile-projectile-atlas-v1.png";
  }

  const creatureAtlas = ENABLE_LEGACY_RUNTIME_ART && typeof Image !== "undefined" ? new Image() : null;
  if (creatureAtlas) {
    creatureAtlas.decoding = "async";
    creatureAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    creatureAtlas.src = "assets/creature-atlas-v1.png";
  }

  const premiumCreatureAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (premiumCreatureAtlas) {
    premiumCreatureAtlas.decoding = "async";
    premiumCreatureAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    premiumCreatureAtlas.src = "assets/premium-boss-elite-atlas-v1.png";
  }

  const premiumMinionAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (premiumMinionAtlas) {
    premiumMinionAtlas.decoding = "async";
    premiumMinionAtlas.onload = () => {
      swarmImpostorCache.clear();
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    premiumMinionAtlas.src = "assets/premium-minion-atlas-v3.png";
  }

  const premiumHordeAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (premiumHordeAtlas) {
    premiumHordeAtlas.decoding = "async";
    premiumHordeAtlas.onload = () => {
      swarmImpostorCache.clear();
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    premiumHordeAtlas.src = "assets/premium-horde-atlas-v2.png";
  }

  const premiumPlayerAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (premiumPlayerAtlas) {
    premiumPlayerAtlas.decoding = "async";
    premiumPlayerAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    premiumPlayerAtlas.src = "assets/premium-player-atlas-v3.png";
  }

  const premiumUnitAuraAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (premiumUnitAuraAtlas) {
    premiumUnitAuraAtlas.decoding = "async";
    premiumUnitAuraAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    premiumUnitAuraAtlas.src = "assets/premium-unit-aura-atlas-v1.png";
  }

  const premiumPickupAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (premiumPickupAtlas) {
    premiumPickupAtlas.decoding = "async";
    premiumPickupAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    premiumPickupAtlas.src = "assets/premium-pickup-atlas-v1.png";
  }

  const groundDecalAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (groundDecalAtlas) {
    groundDecalAtlas.decoding = "async";
    groundDecalAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    groundDecalAtlas.src = "assets/premium-ground-decal-atlas-v2.png";
  }

  const environmentPropAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (environmentPropAtlas) {
    environmentPropAtlas.decoding = "async";
    environmentPropAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    environmentPropAtlas.src = "assets/premium-environment-prop-atlas-v1.png";
  }

  const atmosphereAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (atmosphereAtlas) {
    atmosphereAtlas.decoding = "async";
    atmosphereAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    atmosphereAtlas.src = "assets/premium-atmosphere-atlas-v1.png";
  }

  const premiumHeroFxAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (premiumHeroFxAtlas) {
    premiumHeroFxAtlas.decoding = "async";
    premiumHeroFxAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    premiumHeroFxAtlas.src = "assets/premium-hero-fx-atlas-v1.png";
  }

  const premiumScreenStrikeAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (premiumScreenStrikeAtlas) {
    premiumScreenStrikeAtlas.decoding = "async";
    premiumScreenStrikeAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    premiumScreenStrikeAtlas.src = "assets/premium-screen-strike-atlas-v1.png";
  }

  const premiumUltimateCastAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (premiumUltimateCastAtlas) {
    premiumUltimateCastAtlas.decoding = "async";
    premiumUltimateCastAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    premiumUltimateCastAtlas.src = "assets/premium-ultimate-cast-atlas-v1.png";
  }

  const premiumAreaEventAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (premiumAreaEventAtlas) {
    premiumAreaEventAtlas.decoding = "async";
    premiumAreaEventAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    premiumAreaEventAtlas.src = "assets/premium-area-event-atlas-v1.png";
  }

  const hitAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (hitAtlas) {
    hitAtlas.decoding = "async";
    hitAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    hitAtlas.src = "assets/premium-hit-atlas-v1.png";
  }

  const threatAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (threatAtlas) {
    threatAtlas.decoding = "async";
    threatAtlas.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    threatAtlas.src = "assets/premium-threat-atlas-v1.png";
  }

  const itemIconAtlas = typeof Image !== "undefined" ? new Image() : null;
  if (itemIconAtlas) {
    itemIconAtlas.decoding = "async";
    itemIconAtlas.onload = () => {
      if (!QA_MODE) return;
      updateQaDataset();
    };
    itemIconAtlas.src = "assets/item-icon-atlas-v1.png";
  }

  const arenaBackground = typeof Image !== "undefined" ? new Image() : null;
  if (arenaBackground) {
    arenaBackground.decoding = "async";
    arenaBackground.onload = () => {
      if (!QA_MODE) return;
      state.qa.visualDone = false;
      updateQaDataset();
      render();
    };
    arenaBackground.src = "assets/arena-bg-readable-v1.png";
  }

  const atlasFrames = {
    swordFan: { x: 0, y: 0, w: 384, h: 512 },
    talismanWheel: { x: 384, y: 0, w: 384, h: 512 },
    spiritFire: { x: 768, y: 0, w: 384, h: 512 },
    voidSeal: { x: 1152, y: 0, w: 384, h: 512 },
    frostBurst: { x: 0, y: 512, w: 384, h: 512 },
    plaguePool: { x: 384, y: 512, w: 384, h: 512 },
    dragonBolt: { x: 768, y: 512, w: 384, h: 512 },
    thunderSigil: { x: 1152, y: 512, w: 384, h: 512 }
  };

  const premiumProjectileFrames = {
    swordLance: { x: 0, y: 0, w: 384, h: 512 },
    talismanDart: { x: 384, y: 0, w: 384, h: 512 },
    spiritComet: { x: 768, y: 0, w: 384, h: 512 },
    dragonBolt: { x: 1152, y: 0, w: 384, h: 512 },
    frostVolley: { x: 0, y: 512, w: 384, h: 512 },
    moonWheelArc: { x: 384, y: 512, w: 384, h: 512 },
    plagueSkull: { x: 768, y: 512, w: 384, h: 512 },
    thunderPearl: { x: 1152, y: 512, w: 384, h: 512 }
  };

  const premiumMotionTrailFrames = {
    jadeSwordWake: { x: 0, y: 0, w: 512, h: 512 },
    talismanWake: { x: 512, y: 0, w: 512, h: 512 },
    spiritFlameWake: { x: 1024, y: 0, w: 512, h: 512 },
    thunderWake: { x: 1536, y: 0, w: 512, h: 512 },
    frostWake: { x: 0, y: 512, w: 512, h: 512 },
    voidWake: { x: 512, y: 512, w: 512, h: 512 },
    poisonWake: { x: 1024, y: 512, w: 512, h: 512 },
    crescentWake: { x: 1536, y: 512, w: 512, h: 512 }
  };

  const hostileProjectileFrames = {
    emberBile: { x: 0, y: 0, w: 512, h: 512 },
    soulOrb: { x: 512, y: 0, w: 512, h: 512 },
    boneShard: { x: 0, y: 512, w: 512, h: 512 },
    shadowCrescent: { x: 512, y: 512, w: 512, h: 512 }
  };

  const creatureFrames = {
    heroSword: { x: 0, y: 0, w: 443, h: 443 },
    heroTalisman: { x: 443, y: 0, w: 444, h: 443 },
    imp: { x: 887, y: 0, w: 443, h: 443 },
    wolf: { x: 1330, y: 0, w: 444, h: 443 },
    wisp: { x: 0, y: 443, w: 443, h: 444 },
    stone: { x: 443, y: 443, w: 444, h: 444 },
    summoner: { x: 887, y: 443, w: 443, h: 444 },
    boss: { x: 1330, y: 443, w: 444, h: 444 }
  };

  const premiumCreatureFrames = {
    eliteDemon: { x: 0, y: 0, w: 768, h: 512 },
    eliteWispKing: { x: 768, y: 0, w: 768, h: 512 },
    eliteSoulPriest: { x: 0, y: 512, w: 768, h: 512 },
    tideDemonLord: { x: 768, y: 512, w: 768, h: 512 }
  };

  const premiumMinionFrames = {
    impFiend: { x: 0, y: 0, w: 512, h: 512 },
    lavaWolf: { x: 512, y: 0, w: 512, h: 512 },
    frostWisp: { x: 1024, y: 0, w: 512, h: 512 },
    plagueCrawler: { x: 0, y: 512, w: 512, h: 512 },
    stoneBrute: { x: 512, y: 512, w: 512, h: 512 },
    voidSummoner: { x: 1024, y: 512, w: 512, h: 512 }
  };

  const premiumHordeFrames = {
    impAssassin: { x: 0, y: 0, w: 384, h: 512 },
    armoredWolf: { x: 384, y: 0, w: 384, h: 512 },
    spectralWisp: { x: 768, y: 0, w: 384, h: 512 },
    goldScarab: { x: 1152, y: 0, w: 384, h: 512 },
    boneShieldBrute: { x: 0, y: 512, w: 384, h: 512 },
    clawRunner: { x: 384, y: 512, w: 384, h: 512 },
    emberSpitter: { x: 768, y: 512, w: 384, h: 512 },
    shadowCultist: { x: 1152, y: 512, w: 384, h: 512 }
  };

  const premiumPlayerFrames = {
    heroSword: { x: 0, y: 0, w: 512, h: 512 },
    heroTalisman: { x: 512, y: 0, w: 512, h: 512 },
    heroFox: { x: 0, y: 512, w: 512, h: 512 },
    heroMechanist: { x: 512, y: 512, w: 512, h: 512 }
  };

  const unitAuraFrames = {
    swordFootSigil: { x: 0, y: 0, w: 443, h: 443 },
    talismanOrbitBase: { x: 443, y: 0, w: 444, h: 443 },
    foxFireCrescent: { x: 887, y: 0, w: 443, h: 443 },
    mechanistGearRing: { x: 1330, y: 0, w: 444, h: 443 },
    demonClawShadow: { x: 0, y: 443, w: 443, h: 444 },
    emberFootprints: { x: 443, y: 443, w: 444, h: 444 },
    spectralMistBase: { x: 887, y: 443, w: 443, h: 444 },
    bloodMoonPressure: { x: 1330, y: 443, w: 444, h: 444 }
  };

  const premiumPickupFrames = {
    xpCrystal: { x: 0, y: 0, w: 512, h: 512 },
    spiritCoin: { x: 512, y: 0, w: 512, h: 512 },
    treasureChest: { x: 1024, y: 0, w: 512, h: 512 },
    healGourd: { x: 0, y: 512, w: 512, h: 512 },
    magnetArray: { x: 512, y: 512, w: 512, h: 512 },
    thunderBomb: { x: 1024, y: 512, w: 512, h: 512 }
  };

  const groundDecalFrames = {
    swordScar: { x: 0, y: 0, w: 512, h: 512 },
    infernoScorch: { x: 512, y: 0, w: 512, h: 512 },
    voidRift: { x: 1024, y: 0, w: 512, h: 512 },
    talismanSeal: { x: 1536, y: 0, w: 512, h: 512 },
    frostCrater: { x: 0, y: 512, w: 512, h: 512 },
    plagueMiasma: { x: 512, y: 512, w: 512, h: 512 },
    lightningSigil: { x: 1024, y: 512, w: 512, h: 512 },
    soulVortex: { x: 1536, y: 512, w: 512, h: 512 }
  };

  const environmentPropFrames = {
    obelisk: { x: 0, y: 0, w: 512, h: 512 },
    ringRuin: { x: 512, y: 0, w: 512, h: 512 },
    spiritCrystals: { x: 1024, y: 0, w: 512, h: 512 },
    boneAltar: { x: 1536, y: 0, w: 512, h: 512 },
    talismanLantern: { x: 0, y: 512, w: 512, h: 512 },
    mossRubble: { x: 512, y: 512, w: 512, h: 512 },
    voidShard: { x: 1024, y: 512, w: 512, h: 512 },
    sigilPlate: { x: 1536, y: 512, w: 512, h: 512 }
  };

  const environmentPropIds = Object.keys(environmentPropFrames);

  const atmosphereFrames = {
    ghostFog: { x: 0, y: 0, w: 443, h: 443 },
    spiritEmbers: { x: 443, y: 0, w: 444, h: 443 },
    moonbeam: { x: 887, y: 0, w: 443, h: 443 },
    dangerPulse: { x: 1330, y: 0, w: 444, h: 443 },
    ashMotes: { x: 0, y: 443, w: 443, h: 444 },
    lowMist: { x: 443, y: 443, w: 444, h: 444 },
    bossAura: { x: 887, y: 443, w: 443, h: 444 },
    sparkleCluster: { x: 1330, y: 443, w: 444, h: 444 }
  };

  const swarmPressureFrames = {
    bloodEdge: { x: 0, y: 0, w: 1024, h: 512 },
    soulMist: { x: 1024, y: 0, w: 1024, h: 512 },
    runeWeb: { x: 0, y: 512, w: 1024, h: 512 },
    voidCracks: { x: 1024, y: 512, w: 1024, h: 512 }
  };

  const heroFxFrames = {
    heroMandala: { x: 0, y: 0, w: 512, h: 512 },
    swordStorm: { x: 512, y: 0, w: 512, h: 512 },
    fireDragon: { x: 1024, y: 0, w: 512, h: 512 },
    thunderRune: { x: 1536, y: 0, w: 512, h: 512 },
    voidBlossom: { x: 0, y: 512, w: 512, h: 512 },
    frostLotus: { x: 512, y: 512, w: 512, h: 512 },
    soulShield: { x: 1024, y: 512, w: 512, h: 512 },
    emberImpact: { x: 1536, y: 512, w: 512, h: 512 }
  };

  const screenStrikeFrames = {
    jadeCrescent: { x: 0, y: 0, w: 443, h: 443 },
    talismanBurst: { x: 443, y: 0, w: 444, h: 443 },
    flameRing: { x: 887, y: 0, w: 443, h: 443 },
    lightningBurst: { x: 1330, y: 0, w: 444, h: 443 },
    voidRupture: { x: 0, y: 443, w: 443, h: 444 },
    frostNova: { x: 443, y: 443, w: 444, h: 444 },
    plagueSplash: { x: 887, y: 443, w: 443, h: 444 },
    bloodMoonShock: { x: 1330, y: 443, w: 444, h: 444 }
  };

  const ultimateCastFrames = {
    thousandSwordGate: { x: 0, y: 0, w: 418, h: 470 },
    voidSealDrop: { x: 418, y: 0, w: 418, h: 470 },
    fireSeaEruption: { x: 836, y: 0, w: 418, h: 470 },
    thunderArrayStorm: { x: 1254, y: 0, w: 418, h: 470 },
    glacierRainPortal: { x: 0, y: 470, w: 418, h: 471 },
    moonWheelBloom: { x: 418, y: 470, w: 418, h: 471 },
    plagueDomainBloom: { x: 836, y: 470, w: 418, h: 471 },
    dragonRepeaterGear: { x: 1254, y: 470, w: 418, h: 471 }
  };

  const areaEventFrames = {
    fireDragonField: { x: 0, y: 0, w: 576, h: 384 },
    thunderPearlArray: { x: 576, y: 0, w: 576, h: 384 },
    frostLotusField: { x: 0, y: 384, w: 576, h: 384 },
    voidCrackField: { x: 576, y: 384, w: 576, h: 384 },
    talismanSealField: { x: 0, y: 768, w: 576, h: 384 },
    plagueMireField: { x: 576, y: 768, w: 576, h: 384 }
  };

  const hitFrames = {
    hitSpark: { x: 0, y: 0, w: 443, h: 443 },
    spectralSlash: { x: 443, y: 0, w: 444, h: 443 },
    criticalBurst: { x: 887, y: 0, w: 443, h: 443 },
    lightningImpact: { x: 1330, y: 0, w: 444, h: 443 },
    soulRupture: { x: 0, y: 443, w: 443, h: 444 },
    poisonSplash: { x: 443, y: 443, w: 444, h: 444 },
    iceFracture: { x: 887, y: 443, w: 443, h: 444 },
    lootPop: { x: 1330, y: 443, w: 444, h: 444 }
  };

  const threatFrames = {
    bossSigil: { x: 0, y: 0, w: 443, h: 443 },
    eliteCrown: { x: 443, y: 0, w: 444, h: 443 },
    dangerReticle: { x: 887, y: 0, w: 443, h: 443 },
    shockwaveRing: { x: 1330, y: 0, w: 444, h: 443 },
    summonPortal: { x: 0, y: 443, w: 443, h: 444 },
    ghostHalo: { x: 443, y: 443, w: 444, h: 444 },
    bloodRune: { x: 887, y: 443, w: 443, h: 444 },
    phaseBurst: { x: 1330, y: 443, w: 444, h: 444 }
  };

  const itemIconFrames = {
    flyingSword: [0, 0],
    talisman: [1, 0],
    spiritFire: [2, 0],
    thunderPearl: [3, 0],
    frostNeedle: [4, 0],
    spinningBlade: [5, 0],
    poisonMist: [0, 1],
    crossbow: [1, 1],
    thousandSword: [2, 1],
    voidSeal: [3, 1],
    fireSea: [4, 1],
    thunderArray: [5, 1],
    glacierRain: [0, 2],
    moonWheel: [1, 2],
    plagueDomain: [2, 2],
    dragonRepeater: [3, 2],
    powerCharm: [4, 2],
    cooldownJade: [5, 2],
    windBoots: [0, 3],
    lifeGourd: [1, 3],
    magnetBell: [2, 3],
    splitPearl: [3, 3],
    everlamp: [4, 3],
    goldFang: [5, 3],
    coins: [5, 3]
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
    enemyGrid: new Map(),
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
    ultimateFxCooldowns: Object.create(null),
    orbitFxNextAt: 0,
    pendingLevels: 0,
    hudSignature: "",
    nextHudUpdate: 0,
    forceNextChestEvolution: false,
    lastResult: null,
    quality: { pressure: 0, avgWorkMs: 0 },
    qa: { mode: null, autoChoices: false, autoMove: false, timeScale: 1, maxSteps: 1, syncRunning: false, syncSteps: 0, syncMs: 0, visualDone: false, groundDecalDraws: 0, areaEventDraws: 0, areaFxDraws: 0, environmentPropDraws: 0, atmosphereDraws: 0, swarmPressureDraws: 0, swarmClusterDraws: 0, swarmClusteredEnemies: 0, heroFxDraws: 0, screenStrikeDraws: 0, ultimateCastDraws: 0, unitAuraDraws: 0, hitAtlasDraws: 0, threatDraws: 0, hordeSpriteDraws: 0, hordeSpritesSkipped: 0, hordeRenderBudget: 0, hordeBudgetUsed: 0, projectileSpriteDraws: 0, projectilesSkipped: 0, projectileRenderBudget: 0, motionTrailDraws: 0, motionTrailRenderBudget: 0, hostileProjectileDraws: 0, hostileProjectilesSkipped: 0, hostileProjectileRenderBudget: 0, particlesRendered: 0, particlesCulled: 0, swarmImpostorDraws: 0, legacyWorldOverlays: 0, legacyVectorOverlays: 0, legacyAreaFallbackDraws: 0, legacyFallbackFx: 0, legacyCombatAtlasDraws: 0, premiumAtlasFxDraws: 0, renderDpr: 1 },
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
    perf: { frames: 0, totalDt: 0, maxDt: 0, workFrames: 0, totalWorkMs: 0, maxWorkMs: 0 },
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

  function targetRenderDpr() {
    const nativeDpr = Math.max(1, window.devicePixelRatio || 1);
    const compact = Math.min(window.innerWidth, window.innerHeight) < 560;
    const enemies = state?.enemies?.length || 0;
    if (enemies >= SWARM_RENDER_LIMIT) return Math.min(nativeDpr, compact ? 1.2 : 1.45);
    if (enemies > DETAIL_ENEMY_LIMIT) return Math.min(nativeDpr, compact ? 1.35 : 1.65);
    return Math.min(nativeDpr, compact ? 1.6 : 2);
  }

  function resize() {
    const dpr = Math.max(1, targetRenderDpr());
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
    }
    if (QA_MODE) state.qa.renderDpr = dpr;
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
        <div class="entry-head">${itemIconMarkup(item.id, item)}<h3>${item.name}</h3></div>
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
    state.enemyGrid.clear();
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
    state.ultimateFxCooldowns = Object.create(null);
    state.orbitFxNextAt = 0;
    state.pendingLevels = 0;
    state.hudSignature = "";
    state.forceNextChestEvolution = false;
    state.lastResult = null;
    state.quality.pressure = 0;
    state.quality.avgWorkMs = 0;
    state.qa.groundDecalDraws = 0;
    state.qa.areaEventDraws = 0;
    state.qa.areaFxDraws = 0;
    state.qa.environmentPropDraws = 0;
    state.qa.atmosphereDraws = 0;
    state.qa.swarmPressureDraws = 0;
    state.qa.swarmClusterDraws = 0;
    state.qa.swarmClusteredEnemies = 0;
    state.qa.heroFxDraws = 0;
    state.qa.screenStrikeDraws = 0;
    state.qa.ultimateCastDraws = 0;
    state.qa.unitAuraDraws = 0;
    state.qa.hitAtlasDraws = 0;
    state.qa.threatDraws = 0;
    state.qa.hordeSpriteDraws = 0;
    state.qa.hordeSpritesSkipped = 0;
    state.qa.hordeRenderBudget = 0;
    state.qa.hordeBudgetUsed = 0;
    state.qa.projectileSpriteDraws = 0;
    state.qa.projectilesSkipped = 0;
    state.qa.projectileRenderBudget = 0;
    state.qa.motionTrailDraws = 0;
    state.qa.motionTrailRenderBudget = 0;
    state.qa.hostileProjectileDraws = 0;
    state.qa.hostileProjectilesSkipped = 0;
    state.qa.hostileProjectileRenderBudget = 0;
    state.qa.particlesRendered = 0;
    state.qa.particlesCulled = 0;
    state.qa.legacyWorldOverlays = 0;
    state.qa.legacyVectorOverlays = 0;
    state.qa.legacyAreaFallbackDraws = 0;
    state.qa.legacyFallbackFx = 0;
    state.qa.legacyCombatAtlasDraws = 0;
    state.qa.premiumAtlasFxDraws = 0;
    state.qa.swarmImpostorDraws = 0;
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
        kind: Math.floor(rand(0, environmentPropIds.length)),
        rot: rand(-0.16, 0.16)
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
    state.perf = { frames: 0, totalDt: 0, maxDt: 0, workFrames: 0, totalWorkMs: 0, maxWorkMs: 0 };
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
    emitUltimateCastFx(evolvedCastFrame(evoId), state.player.x, state.player.y, 145, weapons[evoId].color, 0.1, 1.3, 1.2);
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
        <div class="entry-head">${itemIconMarkup(choice.id, item, choice.kind === "coins" ? "coin-icon" : "")}<h3>${item.name}</h3></div>
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
    if (QA_MODE && (state.qa.mode === "minions" || state.qa.mode === "loot")) {
      state.wave = 1;
      return;
    }
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

  function playerMovingForVisuals() {
    return (
      state.input.pointerDown ||
      state.input.keys.has("KeyW") ||
      state.input.keys.has("ArrowUp") ||
      state.input.keys.has("KeyS") ||
      state.input.keys.has("ArrowDown") ||
      state.input.keys.has("KeyA") ||
      state.input.keys.has("ArrowLeft") ||
      state.input.keys.has("KeyD") ||
      state.input.keys.has("ArrowRight") ||
      Boolean(state.qa.autoMove)
    );
  }

  function nearestEnemy(range = Infinity, from = state.player, exclude = null) {
    let best = null;
    let bestD = range * range;
    const visit = (e) => {
      if (e === exclude || e.hp <= 0) return;
      const d = dist2(from, e);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    };
    if (Number.isFinite(range) && state.enemyGrid.size) {
      forEnemiesNear(from.x, from.y, range + 96, visit);
    } else {
      for (const e of state.enemies) visit(e);
    }
    return best;
  }

  function randomEnemyOnScreen() {
    let picked = null;
    let count = 0;
    const range = Math.hypot(window.innerWidth, window.innerHeight) * 0.62 + 180;
    const visit = (e) => {
      const sx = e.x - state.camera.x + window.innerWidth / 2;
      const sy = e.y - state.camera.y + window.innerHeight / 2;
      if (sx <= -120 || sx >= window.innerWidth + 120 || sy <= -120 || sy >= window.innerHeight + 120) return;
      count += 1;
      if (Math.random() < 1 / count) picked = e;
    };
    if (state.enemyGrid.size) forEnemiesNear(state.camera.x, state.camera.y, range, visit);
    else for (const e of state.enemies) if (e.hp > 0) visit(e);
    return picked || nearestEnemy();
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

  function evolvedCastFrame(id) {
    switch (id) {
      case "thousandSword":
        return "thousandSwordGate";
      case "voidSeal":
        return "voidSealDrop";
      case "fireSea":
        return "fireSeaEruption";
      case "thunderArray":
        return "thunderArrayStorm";
      case "glacierRain":
        return "glacierRainPortal";
      case "moonWheel":
        return "moonWheelBloom";
      case "plagueDomain":
        return "plagueDomainBloom";
      case "dragonRepeater":
        return "dragonRepeaterGear";
      default:
        return null;
    }
  }

  function emitUltimateCastFx(frame, x, y, radius, color, cooldown = 0.52, scaleX = 1, scaleY = 1) {
    if (!frame || !premiumUltimateCastAtlasReady() || !state.player) return false;
    const dense = state.enemies.length >= SWARM_RENDER_LIMIT;
    const crowded = state.enemies.length > DETAIL_ENEMY_LIMIT;
    if (!hasParticleRoom(dense ? 42 : crowded ? 30 : 18)) return false;
    const now = state.elapsed;
    const key = `ultimate:${frame}`;
    const crowdCooldown = cooldown * (dense ? 1.45 : crowded ? 1.18 : 1);
    if ((state.ultimateFxCooldowns[key] || 0) > now) return false;
    state.ultimateFxCooldowns[key] = now + crowdCooldown;
    const size = radius * (dense ? 0.86 : crowded ? 0.94 : 1);
    state.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: dense ? 0.36 : 0.46,
      max: dense ? 0.36 : 0.46,
      r: size,
      w: size * 2 * scaleX,
      h: size * 2 * scaleY,
      color,
      kind: "ultimateCast",
      castFrame: frame,
      angle: rand(-0.09, 0.09),
      flip: chance(0.5) ? -1 : 1
    });
    return true;
  }

  function castFlyingSword(level, dt, evolved) {
    const cd = evolved ? 0.34 : Math.max(0.42, 1.02 - level * 0.055);
    if (!weaponTimer(evolved ? "thousandSword" : "flyingSword", cd, dt)) return;
    const p = state.player;
    if (evolved) emitUltimateCastFx("thousandSwordGate", p.x + p.lastDir.x * 30, p.y + p.lastDir.y * 30, 128, weapons.thousandSword.color, 0.58, 1.38, 1.12);
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
        emitUltimateCastFx("voidSealDrop", target.x, target.y, 118 * p.areaMult, weapons.voidSeal.color, 0.68, 1.18, 1.18);
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
    if (evolved) emitUltimateCastFx("fireSeaEruption", p.x + p.lastDir.x * 48, p.y + p.lastDir.y * 48, 130 * p.areaMult, weapons.fireSea.color, 0.62, 1.35, 1.02);
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
      if (evolved && i === 0) emitUltimateCastFx("thunderArrayStorm", target.x, target.y, 116 * p.areaMult, weapons.thunderArray.color, 0.74, 1.16, 1.16);
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
      emitUltimateCastFx("glacierRainPortal", p.x, p.y, 142 * p.areaMult, weapons.glacierRain.color, 0.68, 1.25, 1.38);
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
    if (evolved) emitUltimateCastFx("moonWheelBloom", p.x, p.y, 118 * p.areaMult, weapons.moonWheel.color, 0.82, 1.18, 1.18);
    const denseOrbitFx = state.enemies.length >= SWARM_RENDER_LIMIT;
    const crowdedOrbitFx = state.enemies.length > DETAIL_ENEMY_LIMIT;
    const canEmitOrbitFx = t >= state.orbitFxNextAt && hasParticleRoom(denseOrbitFx ? 16 : 8);
    if (canEmitOrbitFx) state.orbitFxNextAt = t + (denseOrbitFx ? 0.08 : crowdedOrbitFx ? 0.05 : 0.028);
    const orbitFxStride = denseOrbitFx ? 3 : crowdedOrbitFx ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const a = t * speed + (TAU / count) * i;
      const bx = p.x + Math.cos(a) * radius;
      const by = p.y + Math.sin(a) * radius;
      forEnemiesNear(bx, by, bladeR + 64, (e) => {
        if (e.hp <= 0) return;
        if ((e.hit[evolved ? "moonWheel" : "spinningBlade"] || 0) > 0) return;
        const rr = e.r + bladeR;
        const dx = e.x - bx;
        const dy = e.y - by;
        if (dx * dx + dy * dy <= rr * rr) {
          damageEnemy(e, damage, evolved ? weapons.moonWheel.color : weapons.spinningBlade.color);
          e.hit[evolved ? "moonWheel" : "spinningBlade"] = evolved ? 0.18 : 0.32;
        }
      });
      if (canEmitOrbitFx && i % orbitFxStride === 0) {
        state.particles.push({ x: bx, y: by, vx: 0, vy: 0, life: 0.08, max: 0.08, r: bladeR, color: evolved ? weapons.moonWheel.color : weapons.spinningBlade.color, kind: evolved ? "moonBlade" : "blade" });
      }
    }
  }

  function castPoison(level, dt, evolved) {
    const p = state.player;
    const id = evolved ? "plagueDomain" : "poisonMist";
    const cd = evolved ? 0.92 : Math.max(1.2, 2.3 - level * 0.09);
    if (!weaponTimer(id, cd, dt)) return;
    const count = (evolved ? 3 : 1 + Math.floor(level / 4)) + p.amountBonus;
    if (evolved) emitUltimateCastFx("plagueDomainBloom", p.x, p.y, 136 * p.areaMult, weapons.plagueDomain.color, 0.88, 1.18, 1.18);
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
    if (evolved) emitUltimateCastFx("dragonRepeaterGear", p.x + Math.cos(base) * 42, p.y + Math.sin(base) * 42, 118, weapons.dragonRepeater.color, 0.42, 1.55, 0.98);
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
      kind: "lightning",
      jag: Array.from({ length: 6 }, () => rand(-18, 18))
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
      forEnemiesNear(pr.x, pr.y, pr.r + 96, (e) => {
        if (e.hp <= 0 || pr.pierce <= 0) return;
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
      });
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
        forEnemiesNear(area.x, area.y, area.r + 96, (e) => {
          if (e.hp <= 0) return;
          const dx = e.x - area.x;
          const dy = e.y - area.y;
          if (dx * dx + dy * dy <= r2) {
            damageEnemy(e, area.damage, area.color, false);
            if (area.slow) e.slow = Math.max(e.slow, area.slow);
          }
        });
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
      for (const key in e.hit) {
        e.hit[key] -= dt;
        if (e.hit[key] < -1) delete e.hit[key];
      }
      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const d2 = dx * dx + dy * dy;
      const d = Math.sqrt(d2) || 1;
      const invD = 1 / d;
      const slowMult = e.slow > 0 ? 0.52 : 1;
      e.vx = dx * invD * e.speed * slowMult;
      e.vy = dy * invD * e.speed * slowMult;
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
            color: "#e88a5d",
            kind: "emberBile"
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
        e.x -= dx * invD * push;
        e.y -= dy * invD * push;
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
    const premiumTarget = hasPremiumEnemyArt(e);
    const suppressLegacyFx = suppressLegacyEnemyFx(e);
    const denseDamageText = state.enemies.length >= SWARM_RENDER_LIMIT;
    const criticalDamageText = amount > e.maxHp * 0.08;
    const textChance = e.boss ? 0.62 : e.elite ? 0.34 : denseDamageText ? 0.012 : state.enemies.length > DETAIL_ENEMY_LIMIT ? 0.045 : 0.18;
    if (text && state.texts.length < damageTextLimit() && chance(criticalDamageText ? Math.min(0.72, textChance * 2.2) : textChance)) {
      floatingText(
        e.x + rand(-e.r * 0.18, e.r * 0.18),
        e.y - e.r * (criticalDamageText ? 1.15 : 0.92),
        Math.ceil(amount).toString(),
        color,
        criticalDamageText ? 14 : denseDamageText ? 10 : 12,
        { kind: "damage", critical: criticalDamageText }
      );
    }
    if (premiumTarget && hitAtlasReady() && hasParticleRoom(14)) {
      const dense = state.enemies.length >= SWARM_RENDER_LIMIT;
      const hitChance = e.boss ? 0.72 : e.elite ? 0.46 : dense ? 0 : state.enemies.length > DETAIL_ENEMY_LIMIT ? 0.045 : 0.18;
      if (chance(text ? hitChance : hitChance * 0.45)) {
        const from = state.player || { x: e.x - 1, y: e.y };
        const angle = Math.atan2(e.y - from.y, e.x - from.x) + rand(-0.38, 0.38);
        state.particles.push({
          x: e.x + rand(-e.r * 0.24, e.r * 0.24),
          y: e.y + rand(-e.r * 0.24, e.r * 0.24),
          vx: 0,
          vy: 0,
          life: e.boss ? 0.22 : 0.16,
          max: e.boss ? 0.22 : 0.16,
          r: e.r * (e.boss ? rand(0.72, 1.05) : rand(0.68, 0.96)),
          color,
          kind: "premiumHit",
          hitFrame: amount > e.maxHp * 0.08 ? "criticalBurst" : hitFrameId(color, chance(0.32) ? "slash" : "impact"),
          angle
        });
      }
    }
    if (!premiumTarget && !suppressLegacyFx && hasParticleRoom(8) && allowHighFx() && chance(text ? 0.36 : 0.09)) {
      const from = state.player || { x: e.x - 1, y: e.y };
      const angle = Math.atan2(e.y - from.y, e.x - from.x) + rand(-0.42, 0.42);
      state.particles.push({
        x: e.x + rand(-e.r * 0.24, e.r * 0.24),
        y: e.y + rand(-e.r * 0.24, e.r * 0.24),
        vx: 0,
        vy: 0,
        life: 0.16,
        max: 0.16,
        r: e.r * rand(0.85, 1.35),
        color,
        kind: "slash",
        angle
      });
    }
    if (!premiumTarget && !suppressLegacyFx && hasParticleRoom() && chance(text ? 0.28 : 0.08)) {
      state.particles.push({
        x: e.x + rand(-e.r * 0.4, e.r * 0.4),
        y: e.y + rand(-e.r * 0.4, e.r * 0.4),
        vx: 0,
        vy: 0,
        life: 0.18,
        max: 0.18,
        r: rand(e.r * 0.42, e.r * 0.82),
        color,
        kind: "impact"
      });
    }
  }

  function killEnemy(e) {
    state.kills += 1;
    const xpValue = Math.max(1, Math.round(e.xp * (e.elite ? 1.4 : 1)));
    const gemCount = e.elite ? 5 : chance(0.12) ? 2 : 1;
    if (state.gems.length >= MAX_GEMS && state.gems.length) {
      const g = state.gems[Math.floor(rand(0, state.gems.length))];
      g.value += xpValue;
      g.r = Math.min(11, g.r + 0.2);
      g.color = colors.gold;
    } else {
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
    }
    if (chance(e.elite ? 0.9 : 0.08)) {
      const coinValue = e.elite ? 15 : 1 + Math.floor(rand(0, 3));
      if (state.coins.length >= MAX_COINS && state.coins.length) {
        const c = state.coins[Math.floor(rand(0, state.coins.length))];
        c.value += coinValue;
        c.r = Math.min(10, c.r + 0.15);
      } else {
        state.coins.push({ x: e.x, y: e.y, value: coinValue, r: e.elite ? 8 : 5, vx: rand(-30, 30), vy: rand(-30, 30) });
      }
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
    const premiumDeath = hasPremiumEnemyArt(e);
    const suppressLegacyFx = suppressLegacyEnemyFx(e);
    spawnDeathSprite(e);
    if (premiumDeath && hitAtlasReady() && hasParticleRoom(6) && (e.elite || e.boss || state.enemies.length < DETAIL_ENEMY_LIMIT)) {
      state.particles.push({
        x: e.x,
        y: e.y,
        vx: 0,
        vy: 0,
        life: e.boss ? 0.48 : e.elite ? 0.36 : 0.28,
        max: e.boss ? 0.48 : e.elite ? 0.36 : 0.28,
        r: e.r * (e.boss ? 2.0 : e.elite ? 1.65 : 1.18),
        color: e.elite ? colors.gold : e.color,
        kind: "premiumDeath",
        hitFrame: e.elite ? "lootPop" : hitFrameId(e.color, "death"),
        angle: rand(-0.16, 0.16)
      });
    }
    if (!suppressLegacyFx) {
      if (premiumDeath) {
        burst(e.x, e.y, e.color, e.elite ? 10 : 3, e.elite ? 130 : 72, { impact: false, minR: 1.4, maxR: 3.2, life: 0.42 });
      } else {
        burst(e.x, e.y, e.color, e.elite ? 20 : 7, e.elite ? 160 : 90);
      }
    }
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
      const scanR = Math.max(window.innerWidth, window.innerHeight) * 0.82 + 220;
      forEnemiesNear(p.x, p.y, scanR, (e) => {
        const s = worldToScreen(e.x, e.y);
        const onScreen = s.x > -160 && s.x < window.innerWidth + 160 && s.y > -160 && s.y < window.innerHeight + 160;
        if (!onScreen) return;
        const damage = e.boss ? 1200 : e.elite ? 900 : e.maxHp * 1.4;
        damageEnemy(e, damage, info.color, false);
        e.slow = Math.max(e.slow, 0.5);
        hit += 1;
      });
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

  function damageTextLimit() {
    const compact = Math.min(window.innerWidth, window.innerHeight) < 560;
    if (state.enemies.length >= SWARM_RENDER_LIMIT) return compact ? 18 : 26;
    if (state.enemies.length > DETAIL_ENEMY_LIMIT) return compact ? 28 : 44;
    return compact ? 48 : 72;
  }

  function floatingText(x, y, text, color, size = 14, options = {}) {
    const max = options.kind === "damage" ? (options.critical ? 0.58 : 0.48) : 0.85;
    state.texts.push({
      x,
      y,
      text,
      color,
      size,
      life: max,
      max,
      vy: options.kind === "damage" ? (options.critical ? -40 : -30) : -32,
      kind: options.kind || "info",
      critical: Boolean(options.critical)
    });
  }

  function burst(x, y, color, count, speed, options = {}) {
    const minR = options.minR || 2;
    const maxR = options.maxR || 5;
    const maxLife = options.life || 0.62;
    for (let i = 0; i < count; i++) {
      if (!hasParticleRoom(1)) break;
      const a = rand(0, TAU);
      const s = rand(speed * 0.25, speed);
      state.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rand(Math.min(0.24, maxLife), maxLife),
        max: maxLife,
        r: rand(minR, maxR),
        color,
        kind: chance(0.28) ? "streak" : "spark"
      });
    }
    if (options.impact === false || !hasParticleRoom()) return;
    state.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0.24,
      max: 0.24,
      r: Math.max(18, speed * 0.18),
      color,
      kind: "impact"
    });
  }

  function updateFx(dt) {
    for (let i = state.texts.length - 1; i >= 0; i--) {
      const t = state.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      if (t.life <= 0) state.texts.splice(i, 1);
    }
    const textLimit = damageTextLimit() + 32;
    if (state.texts.length > textLimit) {
      state.texts.splice(0, state.texts.length - textLimit);
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
    const particleLimit = fxParticleLimit();
    if (state.particles.length > particleLimit) {
      state.particles.splice(0, state.particles.length - particleLimit);
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

  function updateHud(force = true) {
    const p = state.player;
    if (!p) {
      ui.totalCoins.textContent = state.save.coins;
      return;
    }
    if (!force && state.screen === "playing" && state.elapsed < state.nextHudUpdate) {
      return;
    }
    const hudStep = state.enemies.length >= SWARM_RENDER_LIMIT ? 0.16 : state.enemies.length > DETAIL_ENEMY_LIMIT ? 0.13 : 0.1;
    state.nextHudUpdate = state.elapsed + hudStep;
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
        div.innerHTML = `${itemIconMarkup(id, item, "small")}<div class="slot-copy"><strong style="color:${item.color}">${item.name}</strong><span>${item.type === "evolved" ? "进化" : `Lv ${owned.level}/${item.max}`}</span></div>`;
        ui.weaponList.appendChild(div);
      }

      ui.passiveList.innerHTML = "";
      for (const [id, owned] of Object.entries(p.passives)) {
        const item = passives[id];
        const div = document.createElement("div");
        div.className = "slot";
        div.innerHTML = `${itemIconMarkup(id, item, "small")}<div class="slot-copy"><strong style="color:${item.color}">${item.name}</strong><span>Lv ${owned.level}/${item.max}</span></div>`;
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
    document.body.dataset.qaGridCells = String(state.enemyGrid.size);
    document.body.dataset.qaProjectiles = String(state.projectiles.length);
    document.body.dataset.qaEnemyProjectiles = String(state.enemyProjectiles.length);
    document.body.dataset.qaAreas = String(state.areas.length);
    document.body.dataset.qaParticles = String(state.particles.length);
    document.body.dataset.qaTexts = String(state.texts.length);
    let deathSprites = 0;
    let slashParticles = 0;
    let impactParticles = 0;
    let premiumHitParticles = 0;
    let premiumDeathParticles = 0;
    let sparkParticles = 0;
    let streakParticles = 0;
    for (const particle of state.particles) {
      if (particle.kind === "deathSprite") deathSprites += 1;
      else if (particle.kind === "slash") slashParticles += 1;
      else if (particle.kind === "impact") impactParticles += 1;
      else if (particle.kind === "premiumHit") premiumHitParticles += 1;
      else if (particle.kind === "premiumDeath") premiumDeathParticles += 1;
      else if (particle.kind === "spark") sparkParticles += 1;
      else if (particle.kind === "streak") streakParticles += 1;
    }
    document.body.dataset.qaDeathSprites = String(deathSprites);
    document.body.dataset.qaSlashParticles = String(slashParticles);
    document.body.dataset.qaImpactParticles = String(impactParticles);
    document.body.dataset.qaPremiumHitParticles = String(premiumHitParticles);
    document.body.dataset.qaPremiumDeathParticles = String(premiumDeathParticles);
    document.body.dataset.qaSparkParticles = String(sparkParticles);
    document.body.dataset.qaStreakParticles = String(streakParticles);
    document.body.dataset.qaGems = String(state.gems.length);
    document.body.dataset.qaCoins = String(state.coins.length);
    document.body.dataset.qaChests = String(state.chests.length);
    document.body.dataset.qaPowerups = String(state.powerups.length);
    document.body.dataset.qaAtlasReady = atlasReady() ? "1" : "0";
    document.body.dataset.qaCreatureAtlasReady = creatureAtlasReady() ? "1" : "0";
    document.body.dataset.qaPremiumCreatureAtlasReady = premiumCreatureAtlasReady() ? "1" : "0";
    document.body.dataset.qaPremiumMinionAtlasReady = premiumMinionAtlasReady() ? "1" : "0";
    document.body.dataset.qaPremiumHordeAtlasReady = premiumHordeAtlasReady() ? "1" : "0";
    document.body.dataset.qaPremiumPlayerAtlasReady = premiumPlayerAtlasReady() ? "1" : "0";
    document.body.dataset.qaPremiumPickupAtlasReady = premiumPickupAtlasReady() ? "1" : "0";
    document.body.dataset.qaGroundDecalAtlasReady = groundDecalAtlasReady() ? "1" : "0";
    document.body.dataset.qaGroundDecalDraws = String(state.qa.groundDecalDraws || 0);
    document.body.dataset.qaPremiumAreaEventAtlasReady = premiumAreaEventAtlasReady() ? "1" : "0";
    document.body.dataset.qaAreaEventDraws = String(state.qa.areaEventDraws || 0);
    document.body.dataset.qaAreaFxDraws = String(state.qa.areaFxDraws || 0);
    document.body.dataset.qaEnvironmentPropAtlasReady = environmentPropAtlasReady() ? "1" : "0";
    document.body.dataset.qaEnvironmentPropDraws = String(state.qa.environmentPropDraws || 0);
    document.body.dataset.qaAtmosphereAtlasReady = atmosphereAtlasReady() ? "1" : "0";
    document.body.dataset.qaAtmosphereDraws = String(state.qa.atmosphereDraws || 0);
    document.body.dataset.qaPremiumSwarmPressureAtlasReady = premiumSwarmPressureAtlasReady() ? "1" : "0";
    document.body.dataset.qaSwarmPressureDraws = String(state.qa.swarmPressureDraws || 0);
    document.body.dataset.qaSwarmClusterDraws = String(state.qa.swarmClusterDraws || 0);
    document.body.dataset.qaSwarmClusteredEnemies = String(state.qa.swarmClusteredEnemies || 0);
    document.body.dataset.qaPremiumHeroFxAtlasReady = premiumHeroFxAtlasReady() ? "1" : "0";
    document.body.dataset.qaHeroFxDraws = String(state.qa.heroFxDraws || 0);
    document.body.dataset.qaPremiumScreenStrikeAtlasReady = premiumScreenStrikeAtlasReady() ? "1" : "0";
    document.body.dataset.qaScreenStrikeDraws = String(state.qa.screenStrikeDraws || 0);
    document.body.dataset.qaPremiumUltimateCastAtlasReady = premiumUltimateCastAtlasReady() ? "1" : "0";
    document.body.dataset.qaUltimateCastDraws = String(state.qa.ultimateCastDraws || 0);
    document.body.dataset.qaPremiumUnitAuraAtlasReady = premiumUnitAuraAtlasReady() ? "1" : "0";
    document.body.dataset.qaUnitAuraDraws = String(state.qa.unitAuraDraws || 0);
    document.body.dataset.qaHitAtlasReady = hitAtlasReady() ? "1" : "0";
    document.body.dataset.qaHitAtlasDraws = String(state.qa.hitAtlasDraws || 0);
    document.body.dataset.qaThreatAtlasReady = threatAtlasReady() ? "1" : "0";
    document.body.dataset.qaThreatDraws = String(state.qa.threatDraws || 0);
    document.body.dataset.qaPremiumProjectileAtlasReady = premiumProjectileAtlasReady() ? "1" : "0";
    document.body.dataset.qaProjectileSpriteDraws = String(state.qa.projectileSpriteDraws || 0);
    document.body.dataset.qaProjectilesSkipped = String(state.qa.projectilesSkipped || 0);
    document.body.dataset.qaProjectileRenderBudget = String(state.qa.projectileRenderBudget || 0);
    document.body.dataset.qaPremiumMotionTrailAtlasReady = premiumMotionTrailAtlasReady() ? "1" : "0";
    document.body.dataset.qaMotionTrailDraws = String(state.qa.motionTrailDraws || 0);
    document.body.dataset.qaMotionTrailRenderBudget = String(state.qa.motionTrailRenderBudget || 0);
    document.body.dataset.qaHostileProjectileAtlasReady = hostileProjectileAtlasReady() ? "1" : "0";
    document.body.dataset.qaHostileProjectileDraws = String(state.qa.hostileProjectileDraws || 0);
    document.body.dataset.qaHostileProjectilesSkipped = String(state.qa.hostileProjectilesSkipped || 0);
    document.body.dataset.qaHostileProjectileRenderBudget = String(state.qa.hostileProjectileRenderBudget || 0);
    document.body.dataset.qaHordeSpriteDraws = String(state.qa.hordeSpriteDraws || 0);
    document.body.dataset.qaHordeSpritesSkipped = String(state.qa.hordeSpritesSkipped || 0);
    document.body.dataset.qaHordeRenderBudget = String(state.qa.hordeRenderBudget || 0);
    document.body.dataset.qaHordeBudgetUsed = String(state.qa.hordeBudgetUsed || 0);
    document.body.dataset.qaParticlesRendered = String(state.qa.particlesRendered || 0);
    document.body.dataset.qaParticlesCulled = String(state.qa.particlesCulled || 0);
    document.body.dataset.qaParticleLimit = String(fxParticleLimit());
    document.body.dataset.qaParticleRenderBudget = String(fxParticleRenderBudget());
    document.body.dataset.qaSwarmImpostorDraws = String(state.qa.swarmImpostorDraws || 0);
    document.body.dataset.qaLegacyWorldOverlays = String(state.qa.legacyWorldOverlays || 0);
    document.body.dataset.qaLegacyVectorOverlays = String(state.qa.legacyVectorOverlays || 0);
    document.body.dataset.qaLegacyAreaFallbackDraws = String(state.qa.legacyAreaFallbackDraws || 0);
    document.body.dataset.qaLegacyFallbackFx = String(state.qa.legacyFallbackFx || 0);
    document.body.dataset.qaLegacyCombatAtlasDraws = String(state.qa.legacyCombatAtlasDraws || 0);
    document.body.dataset.qaPremiumAtlasFxDraws = String(state.qa.premiumAtlasFxDraws || 0);
    document.body.dataset.qaItemAtlasReady = itemIconAtlasReady() ? "1" : "0";
    document.body.dataset.qaArenaReady = arenaBackgroundReady() ? "1" : "0";
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
    document.body.dataset.qaWorkFrames = String(state.perf.workFrames || 0);
    document.body.dataset.qaAvgWorkMs = state.perf.workFrames ? (state.perf.totalWorkMs / state.perf.workFrames).toFixed(2) : "0";
    document.body.dataset.qaMaxWorkMs = state.perf.maxWorkMs.toFixed(2);
    document.body.dataset.qaRenderDpr = String(state.qa.renderDpr || 1);
    document.body.dataset.qaRenderPressure = renderLoadPressure().toFixed(3);
    document.body.dataset.qaRenderBudgetScale = renderBudgetScale().toFixed(3);
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
      let colored = 0;
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
          const chroma = Math.max(r, g, b) - Math.min(r, g, b);
          samples += 1;
          if (lum > 180) bright += 1;
          if (lum < 35) dark += 1;
          if (chroma > 55) saturated += 1;
          if (chroma > 32) colored += 1;
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
      const coloredRatio = colored / samples;
      document.body.dataset.qaCanvasW = String(w);
      document.body.dataset.qaCanvasH = String(h);
      document.body.dataset.qaVisualSamples = String(samples);
      document.body.dataset.qaVisualBright = brightRatio.toFixed(3);
      document.body.dataset.qaVisualDark = darkRatio.toFixed(3);
      document.body.dataset.qaVisualSaturated = saturatedRatio.toFixed(3);
      document.body.dataset.qaVisualColored = coloredRatio.toFixed(3);
      document.body.dataset.qaVisualRange = String(range);
      const vividEnough = saturatedRatio > 0.08 || (saturatedRatio > 0.06 && coloredRatio > 0.11);
      document.body.dataset.qaVisualOk = samples > 1000 && range > 80 && brightRatio > 0.005 && vividEnough ? "1" : "0";
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
    rebuildEnemyGrid();
    updateWeapons(dt);
    updateProjectiles(dt);
    updateAreas(dt);
    updateEnemies(dt);
    updatePickups(dt);
    updateFx(dt);
    updateCamera(dt);
    if (state.qa.syncRunning) {
      state.qa.syncSteps += 1;
      if (state.qa.syncSteps % 10 === 0) updateHud(false);
    } else {
      updateHud(false);
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

  function enemyGridKey(cx, cy) {
    return `${cx},${cy}`;
  }

  function rebuildEnemyGrid() {
    state.enemyGrid.clear();
    for (const e of state.enemies) {
      if (e.hp <= 0) continue;
      const cx = Math.floor(e.x / ENEMY_GRID_CELL);
      const cy = Math.floor(e.y / ENEMY_GRID_CELL);
      const key = enemyGridKey(cx, cy);
      let bucket = state.enemyGrid.get(key);
      if (!bucket) {
        bucket = [];
        state.enemyGrid.set(key, bucket);
      }
      bucket.push(e);
    }
  }

  function forEnemiesNear(x, y, radius, fn) {
    if (!state.enemyGrid.size) {
      for (const e of state.enemies) {
        if (e.hp > 0) fn(e);
      }
      return;
    }
    const minX = Math.floor((x - radius) / ENEMY_GRID_CELL);
    const maxX = Math.floor((x + radius) / ENEMY_GRID_CELL);
    const minY = Math.floor((y - radius) / ENEMY_GRID_CELL);
    const maxY = Math.floor((y + radius) / ENEMY_GRID_CELL);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cy = minY; cy <= maxY; cy++) {
        const bucket = state.enemyGrid.get(enemyGridKey(cx, cy));
        if (!bucket) continue;
        for (const e of bucket) {
          if (e.hp > 0) fn(e);
        }
      }
    }
  }

  function render() {
    resize();
    state.qa.legacyWorldOverlays = 0;
    state.qa.legacyVectorOverlays = 0;
    state.qa.legacyAreaFallbackDraws = 0;
    state.qa.legacyFallbackFx = 0;
    state.qa.legacyCombatAtlasDraws = 0;
    state.qa.premiumAtlasFxDraws = 0;
    state.qa.atmosphereDraws = 0;
    state.qa.swarmPressureDraws = 0;
    state.qa.swarmClusterDraws = 0;
    state.qa.swarmClusteredEnemies = 0;
    state.qa.heroFxDraws = 0;
    state.qa.screenStrikeDraws = 0;
    state.qa.ultimateCastDraws = 0;
    state.qa.unitAuraDraws = 0;
    state.qa.areaEventDraws = 0;
    state.qa.areaFxDraws = 0;
    state.qa.hitAtlasDraws = 0;
    state.qa.threatDraws = 0;
    state.qa.hordeSpriteDraws = 0;
    state.qa.hordeSpritesSkipped = 0;
    state.qa.hordeRenderBudget = 0;
    state.qa.hordeBudgetUsed = 0;
    state.qa.projectileSpriteDraws = 0;
    state.qa.projectilesSkipped = 0;
    state.qa.projectileRenderBudget = 0;
    state.qa.motionTrailDraws = 0;
    state.qa.motionTrailRenderBudget = 0;
    state.qa.hostileProjectileDraws = 0;
    state.qa.hostileProjectilesSkipped = 0;
    state.qa.hostileProjectileRenderBudget = 0;
    state.qa.particlesRendered = 0;
    state.qa.particlesCulled = 0;
    ctx.save();
    ctx.fillStyle = "#111417";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    if (state.shake > 0) {
      ctx.translate(rand(-state.shake, state.shake), rand(-state.shake, state.shake));
    }
    renderWorld();
    if (state.player) {
      renderAtmosphereBack();
      renderPickups();
      renderAreas();
      renderThreatsBack();
      renderProjectiles();
      renderEnemies();
      renderPlayer();
      renderParticles();
      renderTexts();
      renderAtmosphereFront();
      renderVignette();
    } else {
      renderAttract();
    }
    ctx.restore();
    updateQaDataset();
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

  function renderArenaTexture(camX, camY, w, h) {
    if (!arenaBackgroundReady()) return;
    const tileW = arenaBackground.naturalWidth * 1.08;
    const tileH = arenaBackground.naturalHeight * 1.08;
    const left = camX - w / 2;
    const top = camY - h / 2;
    const originX = -tileW / 2;
    const originY = -tileH / 2;
    const startX = Math.floor((left - originX) / tileW) * tileW + originX;
    const startY = Math.floor((top - originY) / tileH) * tileH + originY;
    ctx.save();
    ctx.globalAlpha = 0.78;
    for (let x = startX; x < left + w + tileW; x += tileW) {
      for (let y = startY; y < top + h + tileH; y += tileH) {
        const tileX = Math.round(x / tileW);
        const tileY = Math.round(y / tileH);
        const flipX = Math.abs(tileX) % 2 === 1;
        const flipY = Math.abs(tileY) % 2 === 1;
        const sx = Math.round(x - camX + w / 2);
        const sy = Math.round(y - camY + h / 2);
        ctx.save();
        ctx.translate(sx + (flipX ? tileW : 0), sy + (flipY ? tileH : 0));
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.drawImage(arenaBackground, 0, 0, tileW, tileH);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
    const shade = ctx.createRadialGradient(w * 0.5, h * 0.45, Math.min(w, h) * 0.12, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
    shade.addColorStop(0, "rgba(0, 0, 0, 0.08)");
    shade.addColorStop(0.62, "rgba(0, 0, 0, 0.18)");
    shade.addColorStop(1, "rgba(0, 0, 0, 0.48)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  function colorAlpha(color, alpha) {
    if (!color || color[0] !== "#") return color || `rgba(255,255,255,${alpha})`;
    const hex = color.slice(1);
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
    const value = parseInt(full, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function drawGlow(x, y, r, color, alpha = 0.45) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r);
    glow.addColorStop(0, colorAlpha(color, alpha));
    glow.addColorStop(0.48, colorAlpha(color, alpha * 0.22));
    glow.addColorStop(1, colorAlpha(color, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }

  function drawStar(cx, cy, spikes, outer, inner, rot = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const a = rot + (Math.PI / spikes) * i;
      const r = i % 2 ? inner : outer;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function capsulePath(x, y, w, h) {
    const r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function shouldDrawEnemyHealthBar(e) {
    if (!e.elite) return false;
    const ratio = clamp(e.hp / e.maxHp, 0, 1);
    return e.boss || ratio < 0.985 || e.flash > 0.05;
  }

  function drawEnemyHealthBar(e, width, y) {
    if (!shouldDrawEnemyHealthBar(e)) return;
    const ratio = clamp(e.hp / e.maxHp, 0, 1);
    const h = e.boss ? 7 : 5;
    const x = -width / 2;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 7;
    capsulePath(x - 2, y - 1, width + 4, h + 2);
    ctx.fillStyle = "rgba(5, 7, 10, 0.68)";
    ctx.fill();
    ctx.shadowBlur = 0;
    capsulePath(x, y, width, h);
    ctx.fillStyle = "rgba(12, 14, 17, 0.82)";
    ctx.fill();
    const fillW = Math.max(h, width * ratio);
    capsulePath(x, y, fillW, h);
    const fill = ctx.createLinearGradient(x, y, x + width, y + h);
    if (e.boss) {
      fill.addColorStop(0, "#f1a46a");
      fill.addColorStop(0.45, "#e45b55");
      fill.addColorStop(1, "#a82f44");
    } else {
      fill.addColorStop(0, "#fff0a0");
      fill.addColorStop(0.48, "#f1c66a");
      fill.addColorStop(1, "#b97636");
    }
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = e.boss ? "rgba(255, 203, 160, 0.58)" : "rgba(255, 236, 165, 0.48)";
    ctx.lineWidth = 1;
    capsulePath(x - 0.5, y - 0.5, width + 1, h + 1);
    ctx.stroke();
    if (ratio < 0.35 || e.boss) {
      ctx.globalCompositeOperation = "lighter";
      drawGlow(0, y + h * 0.5, width * 0.52, e.boss ? colors.danger : colors.gold, e.boss ? 0.09 : 0.045);
    }
    ctx.restore();
  }

  function renderLoadPressure() {
    return clamp(state.quality?.pressure || 0, 0, 1);
  }

  function renderBudgetScale(minScale = 0.62) {
    return 1 - renderLoadPressure() * (1 - minScale);
  }

  function scaledRenderBudget(value, minBudget = 0, minScale = 0.62) {
    if (!Number.isFinite(value)) return value;
    return Math.max(minBudget, Math.floor(value * renderBudgetScale(minScale)));
  }

  function updateRenderLoad(workMs) {
    if (!state.quality) return;
    const compact = Math.min(window.innerWidth, window.innerHeight) < 560;
    const targetMs = compact ? 12.5 : 14.5;
    const avg = state.quality.avgWorkMs ? state.quality.avgWorkMs * 0.92 + workMs * 0.08 : workMs;
    const overload = Math.max(workMs, avg) - targetMs;
    const desired = clamp(overload / (compact ? 9 : 12), 0, 1);
    const pressure = state.quality.pressure || 0;
    const rise = desired > pressure ? 0.24 : 0.07;
    state.quality.avgWorkMs = avg;
    state.quality.pressure = clamp(pressure + (desired - pressure) * rise, 0, 1);
    if (state.enemies.length < 180 && desired < 0.01) {
      state.quality.pressure *= 0.88;
    }
  }

  function allowHighFx() {
    return state.enemies.length < DETAIL_ENEMY_LIMIT && state.particles.length < HIGH_FX_LIMIT;
  }

  function fxParticleLimit() {
    const compact = Math.min(window.innerWidth, window.innerHeight) < 560;
    let budget;
    if (state.enemies.length >= SWARM_RENDER_LIMIT) budget = compact ? 180 : 280;
    else if (state.enemies.length > DETAIL_ENEMY_LIMIT) budget = compact ? 230 : 360;
    else if (state.enemies.length > 180) budget = compact ? 320 : 420;
    else budget = compact ? 560 : MAX_PARTICLES;
    return scaledRenderBudget(budget, compact ? 120 : 190, 0.66);
  }

  function hasParticleRoom(buffer = 0) {
    return state.particles.length < fxParticleLimit() - buffer;
  }

  function fxParticleRenderBudget() {
    const compact = Math.min(window.innerWidth, window.innerHeight) < 560;
    let budget;
    if (state.enemies.length >= SWARM_RENDER_LIMIT) budget = compact ? 48 : 70;
    else if (state.enemies.length > DETAIL_ENEMY_LIMIT) budget = compact ? 62 : 108;
    else if (state.enemies.length > 180) budget = compact ? 140 : 220;
    else budget = compact ? 240 : 420;
    return scaledRenderBudget(budget, compact ? 28 : 42, 0.6);
  }

  function projectileRenderBudget() {
    const compact = Math.min(window.innerWidth, window.innerHeight) < 560;
    let budget = Infinity;
    if (state.enemies.length >= SWARM_RENDER_LIMIT) budget = compact ? 120 : 190;
    else if (state.enemies.length > DETAIL_ENEMY_LIMIT) budget = compact ? 150 : 240;
    else if (state.projectiles.length > 220) budget = compact ? 180 : 300;
    if (Number.isFinite(budget)) return scaledRenderBudget(budget, compact ? 72 : 122, 0.64);
    return Infinity;
  }

  function motionTrailRenderBudget() {
    const compact = Math.min(window.innerWidth, window.innerHeight) < 560;
    let budget;
    if (state.enemies.length >= SWARM_RENDER_LIMIT) budget = compact ? 18 : 44;
    else if (state.enemies.length > DETAIL_ENEMY_LIMIT) budget = compact ? 30 : 72;
    else if (state.projectiles.length > 220) budget = compact ? 52 : 118;
    else budget = compact ? 86 : 180;
    return scaledRenderBudget(budget, compact ? 10 : 24, 0.55);
  }

  function hostileProjectileRenderBudget() {
    const compact = Math.min(window.innerWidth, window.innerHeight) < 560;
    let budget = Infinity;
    if (state.enemies.length >= SWARM_RENDER_LIMIT) budget = compact ? 48 : 86;
    else if (state.enemies.length > DETAIL_ENEMY_LIMIT) budget = compact ? 64 : 120;
    else if (state.enemyProjectiles.length > 120) budget = compact ? 84 : 160;
    if (Number.isFinite(budget)) return scaledRenderBudget(budget, compact ? 30 : 52, 0.64);
    return Infinity;
  }

  function hordeSpriteRenderBudget() {
    const compact = Math.min(window.innerWidth, window.innerHeight) < 560;
    let budget = Infinity;
    if (state.enemies.length >= SWARM_RENDER_LIMIT) budget = compact ? 88 : 160;
    else if (state.enemies.length > DETAIL_ENEMY_LIMIT) budget = compact ? 112 : 220;
    if (Number.isFinite(budget)) return scaledRenderBudget(budget, compact ? 54 : 96, 0.62);
    return Infinity;
  }

  function atlasReady() {
    return Boolean(visualAtlas && visualAtlas.complete && visualAtlas.naturalWidth > 0);
  }

  function premiumProjectileAtlasReady() {
    return Boolean(premiumProjectileAtlas && premiumProjectileAtlas.complete && premiumProjectileAtlas.naturalWidth > 0);
  }

  function premiumMotionTrailAtlasReady() {
    return Boolean(premiumMotionTrailAtlas && premiumMotionTrailAtlas.complete && premiumMotionTrailAtlas.naturalWidth > 0);
  }

  function premiumSwarmPressureAtlasReady() {
    return Boolean(premiumSwarmPressureAtlas && premiumSwarmPressureAtlas.complete && premiumSwarmPressureAtlas.naturalWidth > 0);
  }

  function hostileProjectileAtlasReady() {
    return Boolean(hostileProjectileAtlas && hostileProjectileAtlas.complete && hostileProjectileAtlas.naturalWidth > 0);
  }

  function creatureAtlasReady() {
    return Boolean(creatureAtlas && creatureAtlas.complete && creatureAtlas.naturalWidth > 0);
  }

  function premiumCreatureAtlasReady() {
    return Boolean(premiumCreatureAtlas && premiumCreatureAtlas.complete && premiumCreatureAtlas.naturalWidth > 0);
  }

  function premiumMinionAtlasReady() {
    return Boolean(premiumMinionAtlas && premiumMinionAtlas.complete && premiumMinionAtlas.naturalWidth > 0);
  }

  function premiumHordeAtlasReady() {
    return Boolean(premiumHordeAtlas && premiumHordeAtlas.complete && premiumHordeAtlas.naturalWidth > 0);
  }

  function premiumPlayerAtlasReady() {
    return Boolean(premiumPlayerAtlas && premiumPlayerAtlas.complete && premiumPlayerAtlas.naturalWidth > 0);
  }

  function premiumUnitAuraAtlasReady() {
    return Boolean(premiumUnitAuraAtlas && premiumUnitAuraAtlas.complete && premiumUnitAuraAtlas.naturalWidth > 0);
  }

  function premiumPickupAtlasReady() {
    return Boolean(premiumPickupAtlas && premiumPickupAtlas.complete && premiumPickupAtlas.naturalWidth > 0);
  }

  function groundDecalAtlasReady() {
    return Boolean(groundDecalAtlas && groundDecalAtlas.complete && groundDecalAtlas.naturalWidth > 0);
  }

  function environmentPropAtlasReady() {
    return Boolean(environmentPropAtlas && environmentPropAtlas.complete && environmentPropAtlas.naturalWidth > 0);
  }

  function atmosphereAtlasReady() {
    return Boolean(atmosphereAtlas && atmosphereAtlas.complete && atmosphereAtlas.naturalWidth > 0);
  }

  function premiumHeroFxAtlasReady() {
    return Boolean(premiumHeroFxAtlas && premiumHeroFxAtlas.complete && premiumHeroFxAtlas.naturalWidth > 0);
  }

  function premiumScreenStrikeAtlasReady() {
    return Boolean(premiumScreenStrikeAtlas && premiumScreenStrikeAtlas.complete && premiumScreenStrikeAtlas.naturalWidth > 0);
  }

  function premiumUltimateCastAtlasReady() {
    return Boolean(premiumUltimateCastAtlas && premiumUltimateCastAtlas.complete && premiumUltimateCastAtlas.naturalWidth > 0);
  }

  function premiumAreaEventAtlasReady() {
    return Boolean(premiumAreaEventAtlas && premiumAreaEventAtlas.complete && premiumAreaEventAtlas.naturalWidth > 0);
  }

  function hitAtlasReady() {
    return Boolean(hitAtlas && hitAtlas.complete && hitAtlas.naturalWidth > 0);
  }

  function threatAtlasReady() {
    return Boolean(threatAtlas && threatAtlas.complete && threatAtlas.naturalWidth > 0);
  }

  function itemIconAtlasReady() {
    return Boolean(itemIconAtlas && itemIconAtlas.complete && itemIconAtlas.naturalWidth > 0);
  }

  function arenaBackgroundReady() {
    return Boolean(arenaBackground && arenaBackground.complete && arenaBackground.naturalWidth > 0);
  }

  function imageStillLoading(image) {
    return Boolean(image && !image.complete);
  }

  function imageReady(image) {
    return Boolean(image && image.complete && image.naturalWidth > 0);
  }

  function premiumFxAssetsLoading() {
    return [
      visualAtlas,
      premiumProjectileAtlas,
      premiumMotionTrailAtlas,
      premiumSwarmPressureAtlas,
      hostileProjectileAtlas,
      groundDecalAtlas,
      hitAtlas,
      threatAtlas,
      premiumHeroFxAtlas,
      premiumScreenStrikeAtlas,
      premiumUltimateCastAtlas,
      premiumAreaEventAtlas,
      premiumUnitAuraAtlas
    ].some(imageStillLoading);
  }

  function premiumFxAssetsReady() {
    return [
      visualAtlas,
      premiumProjectileAtlas,
      premiumMotionTrailAtlas,
      premiumSwarmPressureAtlas,
      hostileProjectileAtlas,
      groundDecalAtlas,
      hitAtlas,
      threatAtlas,
      premiumHeroFxAtlas,
      premiumScreenStrikeAtlas,
      premiumUltimateCastAtlas,
      premiumAreaEventAtlas,
      premiumUnitAuraAtlas
    ].some(imageReady);
  }

  function allowLegacyFallbackFx() {
    return ENABLE_LEGACY_RUNTIME_ART && !premiumFxAssetsLoading() && !premiumFxAssetsReady();
  }

  function allowLegacyPickupFallback() {
    return ENABLE_LEGACY_RUNTIME_ART && !imageStillLoading(premiumPickupAtlas) && !premiumPickupAtlasReady();
  }

  function allowAtlasFx() {
    return ENABLE_LEGACY_RUNTIME_ART && !premiumFxAssetsLoading() && !premiumFxAssetsReady() && atlasReady();
  }

  function allowCreatureAtlas(unitCount = state.enemies.length) {
    return ENABLE_LEGACY_RUNTIME_ART && creatureAtlasReady() && unitCount <= 150;
  }

  function drawAtlasFrame(id, x, y, w, h, alpha = 1, rotation = 0, blend = "lighter") {
    const frame = atlasFrames[id];
    if (!frame || !atlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(visualAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.legacyCombatAtlasDraws = (state.qa.legacyCombatAtlasDraws || 0) + 1;
    return true;
  }

  function drawPremiumProjectileFrame(id, x, y, w, h, alpha = 1, rotation = 0, blend = "source-over") {
    const frame = premiumProjectileFrames[id];
    if (!frame || !premiumProjectileAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(premiumProjectileAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.projectileSpriteDraws += 1;
    return true;
  }

  function drawMotionTrailFrame(id, x, y, w, h, alpha = 1, rotation = 0, blend = "lighter", flip = 1) {
    const frame = premiumMotionTrailFrames[id];
    if (!frame || !premiumMotionTrailAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(premiumMotionTrailAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.motionTrailDraws += 1;
    return true;
  }

  function drawHostileProjectileFrame(id, x, y, w, h, alpha = 1, rotation = 0, blend = "source-over") {
    const frame = hostileProjectileFrames[id];
    if (!frame || !hostileProjectileAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(hostileProjectileAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.hostileProjectileDraws += 1;
    return true;
  }

  function drawCreatureSprite(id, x, y, w, h, alpha = 0.9, rotation = 0, flip = 1) {
    const frame = creatureFrames[id];
    if (!frame || !creatureAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(creatureAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  function drawPremiumCreatureSprite(id, x, y, w, h, alpha = 0.9, rotation = 0, flip = 1) {
    const frame = premiumCreatureFrames[id];
    if (!frame || !premiumCreatureAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(premiumCreatureAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  function drawPremiumMinionSprite(id, x, y, w, h, alpha = 0.88, rotation = 0, flip = 1) {
    const frame = premiumMinionFrames[id];
    if (!frame || !premiumMinionAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(premiumMinionAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  function drawPremiumHordeSprite(id, x, y, w, h, alpha = 0.9, rotation = 0, flip = 1) {
    const frame = premiumHordeFrames[id];
    if (!frame || !premiumHordeAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(premiumHordeAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.hordeSpriteDraws += 1;
    return true;
  }

  function drawPremiumPlayerSprite(id, x, y, w, h, alpha = 0.95, rotation = 0, flip = 1) {
    const frame = premiumPlayerFrames[id];
    if (!frame || !premiumPlayerAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(premiumPlayerAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  function drawUnitAuraFrame(id, x, y, w, h, alpha = 0.8, rotation = 0, blend = "lighter", flip = 1) {
    const frame = unitAuraFrames[id];
    if (!frame || !premiumUnitAuraAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(premiumUnitAuraAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.unitAuraDraws += 1;
    return true;
  }

  function drawPremiumPickupSprite(id, x, y, w, h, alpha = 0.95, rotation = 0) {
    const frame = premiumPickupFrames[id];
    if (!frame || !premiumPickupAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(premiumPickupAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  function drawGroundDecalFrame(id, x, y, w, h, alpha = 0.7, rotation = 0, blend = "source-over") {
    const frame = groundDecalFrames[id];
    if (!frame || !groundDecalAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.drawImage(groundDecalAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  function drawEnvironmentPropFrame(id, x, y, w, h, alpha = 0.9, rotation = 0, flip = 1) {
    const frame = environmentPropFrames[id];
    if (!frame || !environmentPropAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(environmentPropAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  function drawAtmosphereFrame(id, x, y, w, h, alpha = 1, rotation = 0, blend = "source-over", flip = 1) {
    const frame = atmosphereFrames[id];
    if (!frame || !atmosphereAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(atmosphereAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.atmosphereDraws += 1;
    return true;
  }

  function drawSwarmPressureFrame(id, x, y, w, h, alpha = 1, rotation = 0, blend = "source-over", flip = 1) {
    const frame = swarmPressureFrames[id];
    if (!frame || !premiumSwarmPressureAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(premiumSwarmPressureAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.swarmPressureDraws += 1;
    return true;
  }

  function drawHeroFxFrame(id, x, y, w, h, alpha = 1, rotation = 0, blend = "lighter", flip = 1) {
    const frame = heroFxFrames[id];
    if (!frame || !premiumHeroFxAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(premiumHeroFxAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.heroFxDraws += 1;
    return true;
  }

  function drawScreenStrikeFrame(id, x, y, w, h, alpha = 1, rotation = 0, blend = "lighter", flip = 1) {
    const frame = screenStrikeFrames[id];
    if (!frame || !premiumScreenStrikeAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(premiumScreenStrikeAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.screenStrikeDraws += 1;
    return true;
  }

  function drawUltimateCastFrame(id, x, y, w, h, alpha = 1, rotation = 0, blend = "lighter", flip = 1) {
    const frame = ultimateCastFrames[id];
    if (!frame || !premiumUltimateCastAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(premiumUltimateCastAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.ultimateCastDraws += 1;
    return true;
  }

  function drawAreaEventFrame(id, x, y, w, h, alpha = 1, rotation = 0, blend = "source-over", flip = 1) {
    const frame = areaEventFrames[id];
    if (!frame || !premiumAreaEventAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(premiumAreaEventAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.areaEventDraws += 1;
    return true;
  }

  function drawHitFrame(id, x, y, w, h, alpha = 1, rotation = 0, blend = "source-over", flip = 1) {
    const frame = hitFrames[id];
    if (!frame || !hitAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(hitAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.hitAtlasDraws += 1;
    return true;
  }

  function drawThreatFrame(id, x, y, w, h, alpha = 1, rotation = 0, blend = "source-over", flip = 1) {
    const frame = threatFrames[id];
    if (!frame || !threatAtlasReady()) return false;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.globalCompositeOperation = blend;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flip, 1);
    ctx.drawImage(threatAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, -h / 2, w, h);
    ctx.restore();
    if (QA_MODE) state.qa.threatDraws += 1;
    return true;
  }

  function drawSoftProjectileFallback(pr, alpha = 0.16) {
    if (!allowLegacyFallbackFx()) return false;
    recordLegacyFallbackFx();
    const length = Math.max(8, pr.r * 3.2);
    const width = Math.max(4, pr.r * 1.05);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    drawGlow(0, 0, Math.max(length, width) * 1.05, pr.color, alpha);
    ctx.fillStyle = colorAlpha(pr.color, alpha * 0.78);
    ctx.beginPath();
    ctx.ellipse(0, 0, length * 0.58, width * 0.62, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = colorAlpha("#ffffff", alpha * 0.5);
    ctx.beginPath();
    ctx.ellipse(pr.r * 0.35, 0, width * 0.36, width * 0.22, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    return true;
  }

  function drawSoftParticleFallback(x, y, r, color, alpha = 0.14, rotation = 0, stretch = 1) {
    if (!allowLegacyFallbackFx()) return false;
    recordLegacyFallbackFx();
    const radius = Math.max(3, r);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    drawGlow(x, y, radius * 1.75, color, alpha);
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = colorAlpha(color, alpha * 0.82);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * stretch, radius * 0.58, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = colorAlpha("#ffffff", alpha * 0.34);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.24, 0, TAU);
    ctx.fill();
    ctx.restore();
    return true;
  }

  function drawSoftAreaFallback(area, x, y, alpha, now, compact = false) {
    if (!allowLegacyFallbackFx()) return false;
    recordLegacyFallbackFx();
    if (QA_MODE) state.qa.legacyAreaFallbackDraws = (state.qa.legacyAreaFallbackDraws || 0) + 1;
    const stretch = area.kind === "plagueDomain" || area.kind === "poison" || area.kind === "fireSea" ? 1.18 : 1;
    const radius = area.r * (compact ? 0.82 : 1);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha *= alpha;
    drawGlow(x, y, radius * 1.35, area.color, compact ? 0.14 : 0.2);
    ctx.translate(x, y);
    ctx.rotate((area.x * 0.001 + area.y * 0.0017) + now / (area.kind === "voidSeal" ? 2800 : 3600));
    ctx.fillStyle = colorAlpha(area.color, compact ? 0.22 : 0.28);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * stretch, radius * (compact ? 0.56 : 0.68), 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = colorAlpha("#ffffff", compact ? 0.035 : 0.05);
    ctx.beginPath();
    ctx.ellipse(-radius * 0.16, -radius * 0.1, radius * 0.36, radius * 0.18, 0.18, 0, TAU);
    ctx.fill();
    ctx.restore();
    return true;
  }

  function premiumPlayerSprite(characterId) {
    if (characterId === "sword") return "heroSword";
    if (characterId === "talisman") return "heroTalisman";
    if (characterId === "fox") return "heroFox";
    if (characterId === "mechanist") return "heroMechanist";
    return null;
  }

  function playerUnitAuraFrame(characterId) {
    if (characterId === "sword") return "swordFootSigil";
    if (characterId === "talisman") return "talismanOrbitBase";
    if (characterId === "fox") return "foxFireCrescent";
    if (characterId === "mechanist") return "mechanistGearRing";
    return "swordFootSigil";
  }

  function playerCreatureSprite(characterId) {
    if (characterId === "sword") return "heroSword";
    if (characterId === "talisman") return "heroTalisman";
    return null;
  }

  function enemyCreatureSprite(e) {
    if (e.boss) return "boss";
    if (e.elite) {
      if (e.type.id === "eliteWisp") return "wisp";
      if (e.type.id === "eliteSummoner") return "summoner";
      return "boss";
    }
    switch (e.type.id) {
      case "imp":
      case "runner":
      case "spitter":
      case "bug":
        return "imp";
      case "wolf":
        return "wolf";
      case "wisp":
        return "wisp";
      case "brute":
      case "stone":
        return "stone";
      case "summoner":
      case "shadow":
        return "summoner";
      default:
        return null;
    }
  }

  function premiumEnemySprite(e) {
    if (!premiumCreatureAtlasReady()) return null;
    if (e.boss) return "tideDemonLord";
    if (e.elite && e.type.id === "eliteBrute") return "eliteDemon";
    if (e.elite && e.type.id === "eliteWisp") return "eliteWispKing";
    if (e.elite && e.type.id === "eliteSummoner") return "eliteSoulPriest";
    return null;
  }

  function premiumMinionSprite(e) {
    if (!premiumMinionAtlasReady()) return null;
    switch (e.type.id) {
      case "imp":
        return "impFiend";
      case "runner":
      case "wolf":
        return "lavaWolf";
      case "wisp":
      case "eliteWisp":
        return "frostWisp";
      case "bug":
      case "spitter":
        return "plagueCrawler";
      case "brute":
      case "eliteBrute":
      case "stone":
        return "stoneBrute";
      case "summoner":
      case "eliteSummoner":
      case "shadow":
        return "voidSummoner";
      default:
        return null;
    }
  }

  function premiumHordeSprite(e) {
    if (!premiumHordeAtlasReady() || e.boss || e.elite) return null;
    switch (e.type.id) {
      case "imp":
        return "impAssassin";
      case "wolf":
        return "armoredWolf";
      case "wisp":
        return "spectralWisp";
      case "bug":
        return "goldScarab";
      case "brute":
      case "stone":
        return "boneShieldBrute";
      case "runner":
        return "clawRunner";
      case "spitter":
        return "emberSpitter";
      case "summoner":
      case "shadow":
        return "shadowCultist";
      default:
        return null;
    }
  }

  function enemyUnitAuraFrame(e, premiumHordeId = null, premiumMinionId = null) {
    if (e.boss || e.elite) return "bloodMoonPressure";
    const id = premiumHordeId || premiumMinionId;
    if (id === "armoredWolf" || id === "lavaWolf" || id === "clawRunner" || e.type.id === "wolf" || e.type.id === "runner") return "emberFootprints";
    if (id === "spectralWisp" || id === "frostWisp" || e.type.id === "wisp") return "spectralMistBase";
    if (id === "emberSpitter" || e.type.id === "spitter") return "foxFireCrescent";
    if (id === "shadowCultist" || id === "voidSummoner" || e.type.id === "summoner" || e.type.id === "shadow") return "talismanOrbitBase";
    return "demonClawShadow";
  }

  function suppressLegacyEnemyFx(e) {
    return hasPremiumEnemyArt(e);
  }

  function recordLegacyEnemyFallback(e) {
    if (QA_MODE && suppressLegacyEnemyFx(e)) state.qa.legacyVectorOverlays += 1;
  }

  function recordLegacyFallbackFx() {
    if (QA_MODE) state.qa.legacyFallbackFx = (state.qa.legacyFallbackFx || 0) + 1;
  }

  function hasPremiumEnemyArt(e) {
    if (e.boss) return true;
    if (e.elite) return true;
    switch (e.type.id) {
      case "imp":
      case "runner":
      case "wolf":
      case "wisp":
      case "eliteWisp":
      case "bug":
      case "spitter":
      case "brute":
      case "eliteBrute":
      case "stone":
      case "summoner":
      case "eliteSummoner":
      case "shadow":
        return true;
      default:
        return false;
    }
  }

  function itemIconMarkup(id, item, extraClass = "") {
    const frame = itemIconFrames[id] || itemIconFrames.coins;
    const x = frame[0] * 20;
    const y = frame[1] * (100 / 3);
    const color = item?.color || colors.gold;
    return `<span class="item-icon ${extraClass}" style="--icon-x:${x}%;--icon-y:${y}%;--icon-color:${color}"></span>`;
  }

  function creatureSpriteScale(id) {
    if (id === "wolf") return [7.2, 4.7];
    if (id === "stone") return [5.9, 5.2];
    if (id === "wisp") return [5.6, 5.6];
    if (id === "summoner") return [5.1, 5.7];
    if (id === "boss") return [4.7, 4.5];
    return [4.9, 4.9];
  }

  function premiumEnemySpriteScale(id) {
    if (id === "tideDemonLord") return [6.05, 5.25];
    if (id === "eliteDemon") return [5.05, 5.35];
    if (id === "eliteWispKing") return [5.55, 5.65];
    if (id === "eliteSoulPriest") return [5.55, 5.75];
    return [4.6, 5.2];
  }

  function premiumEnemySpriteY(id, r) {
    if (id === "tideDemonLord") return -r * 0.22;
    if (id === "eliteWispKing") return -r * 0.5;
    if (id === "eliteSoulPriest") return -r * 0.42;
    return -r * 0.38;
  }

  function premiumMinionSpriteScale(id) {
    if (id === "lavaWolf") return [8.15, 5.35];
    if (id === "plagueCrawler") return [7.45, 5.25];
    if (id === "stoneBrute") return [5.85, 5.85];
    if (id === "frostWisp") return [5.85, 6.35];
    if (id === "voidSummoner") return [5.25, 6.45];
    return [5.55, 5.65];
  }

  function premiumHordeSpriteScale(id) {
    if (id === "armoredWolf") return [8.2, 5.55];
    if (id === "goldScarab") return [8.0, 5.2];
    if (id === "boneShieldBrute") return [6.15, 6.45];
    if (id === "spectralWisp") return [6.1, 6.7];
    if (id === "shadowCultist") return [5.65, 6.9];
    if (id === "clawRunner") return [6.45, 6.2];
    if (id === "emberSpitter") return [6.7, 6.2];
    return [6.0, 5.9];
  }

  function premiumHordeLowProfile(id) {
    return id === "armoredWolf" || id === "goldScarab" || id === "clawRunner" || id === "emberSpitter";
  }

  function premiumHordeSpriteY(id, r) {
    if (id === "shadowCultist") return -r * 0.44;
    if (id === "spectralWisp") return -r * 0.24;
    if (id === "boneShieldBrute") return -r * 0.18;
    return premiumHordeLowProfile(id) ? -r * 0.06 : -r * 0.14;
  }

  function getSwarmImpostorSprite(id, flip) {
    const frame = premiumMinionFrames[id];
    if (!frame || !premiumMinionAtlasReady() || typeof document === "undefined") return null;
    const key = `${id}:${flip}`;
    const cached = swarmImpostorCache.get(key);
    if (cached) return cached;
    const canvasEl = document.createElement("canvas");
    canvasEl.width = SWARM_IMPOSTOR_CANVAS;
    canvasEl.height = SWARM_IMPOSTOR_CANVAS;
    const g = canvasEl.getContext("2d");
    if (!g) return null;
    const r = SWARM_IMPOSTOR_BASE_R;
    const scale = premiumMinionSpriteScale(id);
    const lowProfile = id === "lavaWolf" || id === "plagueCrawler";
    const spriteY = lowProfile ? -r * 0.05 : id === "voidSummoner" ? -r * 0.38 : -r * 0.16;
    const w = r * scale[0] * 0.88;
    const h = r * scale[1] * 0.88;
    const cx = SWARM_IMPOSTOR_CANVAS / 2;
    const cy = SWARM_IMPOSTOR_CANVAS / 2;

    g.save();
    g.translate(cx, cy);
    g.fillStyle = "rgba(0, 0, 0, 0.24)";
    g.beginPath();
    g.ellipse(0, r * 0.84, r * 1.06, r * 0.34, 0, 0, TAU);
    g.fill();
    g.globalAlpha = 0.88;
    g.scale(flip, 1);
    g.drawImage(premiumMinionAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, spriteY - h / 2, w, h);
    g.restore();

    swarmImpostorCache.set(key, canvasEl);
    return canvasEl;
  }

  function getHordeImpostorSprite(id, flip) {
    const frame = premiumHordeFrames[id];
    if (!frame || !premiumHordeAtlasReady() || typeof document === "undefined") return null;
    const key = `horde:${id}:${flip}`;
    const cached = swarmImpostorCache.get(key);
    if (cached) return cached;
    const canvasEl = document.createElement("canvas");
    canvasEl.width = SWARM_IMPOSTOR_CANVAS;
    canvasEl.height = SWARM_IMPOSTOR_CANVAS;
    const g = canvasEl.getContext("2d");
    if (!g) return null;
    const r = SWARM_IMPOSTOR_BASE_R;
    const scale = premiumHordeSpriteScale(id);
    const spriteY = premiumHordeSpriteY(id, r);
    const w = r * scale[0] * 0.86;
    const h = r * scale[1] * 0.86;
    const cx = SWARM_IMPOSTOR_CANVAS / 2;
    const cy = SWARM_IMPOSTOR_CANVAS / 2;

    g.save();
    g.translate(cx, cy);
    g.fillStyle = "rgba(0, 0, 0, 0.23)";
    g.beginPath();
    g.ellipse(0, r * 0.86, r * 1.08, r * 0.34, 0, 0, TAU);
    g.fill();
    g.globalAlpha = 0.9;
    g.scale(flip, 1);
    g.drawImage(premiumHordeAtlas, frame.x, frame.y, frame.w, frame.h, -w / 2, spriteY - h / 2, w, h);
    g.restore();

    swarmImpostorCache.set(key, canvasEl);
    return canvasEl;
  }

  function premiumPlayerSpriteScale(id) {
    if (id === "heroSword") return [5.95, 5.95];
    if (id === "heroTalisman") return [5.75, 5.75];
    if (id === "heroFox") return [6.15, 6.15];
    if (id === "heroMechanist") return [6.05, 6.05];
    return [5.8, 5.8];
  }

  function spawnDeathSprite(e) {
    const premiumSprite = premiumEnemySprite(e);
    if (premiumSprite) {
      const allowPremium = e.boss || e.elite || (state.enemies.length < 150 && hasParticleRoom(40) && chance(0.42));
      if (!allowPremium) return;
      const scale = premiumEnemySpriteScale(premiumSprite);
      const max = e.boss ? 0.9 : 0.62;
      state.particles.push({
        x: e.x,
        y: e.y,
        vx: 0,
        vy: e.boss ? -18 : -12,
        life: max,
        max,
        r: e.r,
        w: e.r * scale[0],
        h: e.r * scale[1],
        color: e.color,
        kind: "deathSprite",
        premiumSprite,
        rot: rand(-0.06, 0.06)
      });
      return;
    }
    const premiumHordeId = premiumHordeSprite(e);
    if (premiumHordeId) {
      const allowPremiumHorde = state.enemies.length < 210 && hasParticleRoom(40) && chance(0.45);
      if (!allowPremiumHorde) return;
      const scale = premiumHordeSpriteScale(premiumHordeId);
      const max = 0.4;
      state.particles.push({
        x: e.x,
        y: e.y,
        vx: 0,
        vy: -10,
        life: max,
        max,
        r: e.r,
        w: e.r * scale[0],
        h: e.r * scale[1],
        color: e.color,
        kind: "deathSprite",
        premiumHordeSprite: premiumHordeId,
        flip: premiumHordeLowProfile(premiumHordeId) && state.player && e.x < state.player.x ? -1 : 1,
        rot: rand(-0.07, 0.07)
      });
      return;
    }
    const premiumMinionId = premiumMinionSprite(e);
    if (premiumMinionId) {
      const allowPremiumMinion = e.elite || (state.enemies.length < 180 && hasParticleRoom(40) && chance(0.5));
      if (!allowPremiumMinion) return;
      const scale = premiumMinionSpriteScale(premiumMinionId);
      const max = e.elite ? 0.62 : 0.38;
      state.particles.push({
        x: e.x,
        y: e.y,
        vx: 0,
        vy: e.elite ? -13 : -10,
        life: max,
        max,
        r: e.r,
        w: e.r * scale[0],
        h: e.r * scale[1],
        color: e.color,
        kind: "deathSprite",
        premiumMinionSprite: premiumMinionId,
        flip: (premiumMinionId === "lavaWolf" || premiumMinionId === "plagueCrawler") && state.player && e.x < state.player.x ? -1 : 1,
        rot: rand(-0.07, 0.07)
      });
      return;
    }
    if (hasPremiumEnemyArt(e)) return;
    const sprite = enemyCreatureSprite(e);
    if (!sprite || !creatureAtlasReady()) return;
    const allow = e.boss || e.elite || (state.enemies.length < 150 && hasParticleRoom(40) && chance(0.42));
    if (!allow) return;
    const scale = creatureSpriteScale(sprite);
    const max = e.boss ? 0.86 : e.elite ? 0.58 : 0.34;
    state.particles.push({
      x: e.x,
      y: e.y,
      vx: 0,
      vy: e.boss ? -18 : -10,
      life: max,
      max,
      r: e.r,
      w: e.r * scale[0],
      h: e.r * scale[1],
      color: e.color,
      kind: "deathSprite",
      sprite,
      flip: sprite === "wolf" && state.player && e.x < state.player.x ? -1 : 1,
      rot: rand(-0.08, 0.08)
    });
  }

  function projectileAtlasFrameId(kind) {
    switch (kind) {
      case "thousandSword":
      case "sword":
        return "swordFan";
      case "glacierNeedle":
      case "needle":
        return "frostBurst";
      case "talisman":
        return "talismanWheel";
      case "fireSea":
      case "fire":
        return "spiritFire";
      case "dragonBolt":
      case "bolt":
        return "dragonBolt";
      default:
        return null;
    }
  }

  function projectileAtlasSpec(pr) {
    const id = projectileAtlasFrameId(pr.kind);
    if (!id) return null;
    switch (pr.kind) {
      case "sword":
        return { id, x: -pr.r * 0.15, y: 0, w: pr.r * 6.2, h: pr.r * 3.0, alpha: 0.72, rotation: 0 };
      case "needle":
        return { id, x: 0, y: 0, w: pr.r * 4.8, h: pr.r * 2.4, alpha: 0.6, rotation: 0 };
      case "bolt":
        return { id, x: pr.r * 0.08, y: 0, w: pr.r * 6.6, h: pr.r * 3.3, alpha: 0.62, rotation: 0 };
      case "thousandSword":
        return { id, x: -pr.r * 0.55, y: 0, w: pr.r * 10.8, h: pr.r * 7.4, alpha: 0.8, rotation: 0 };
      case "glacierNeedle":
        return { id, x: 0, y: 0, w: pr.r * 6.2, h: pr.r * 4.6, alpha: 0.76, rotation: 0 };
      case "dragonBolt":
        return { id, x: pr.r * 0.12, y: 0, w: pr.r * 8.4, h: pr.r * 5.4, alpha: 0.84, rotation: 0 };
      case "talisman":
        return { id, x: 0, y: 0, w: pr.r * 5.4, h: pr.r * 5.4, alpha: 0.8, rotation: -performance.now() / 900 };
      case "fireSea":
        return { id, x: 0, y: 0, w: pr.r * 7.2, h: pr.r * 5.6, alpha: 0.8, rotation: 0 };
      case "fire":
        return { id, x: -pr.r * 0.12, y: 0, w: pr.r * 5.6, h: pr.r * 3.9, alpha: 0.76, rotation: 0 };
      default:
        return null;
    }
  }

  function premiumProjectileFrameId(kind) {
    switch (kind) {
      case "thousandSword":
      case "sword":
        return "swordLance";
      case "talisman":
        return "talismanDart";
      case "fireSea":
      case "fire":
        return "spiritComet";
      case "dragonBolt":
      case "bolt":
        return "dragonBolt";
      case "glacierNeedle":
      case "needle":
        return "frostVolley";
      default:
        return null;
    }
  }

  function motionTrailFrameId(kind, color = "") {
    switch (kind) {
      case "thousandSword":
      case "sword":
      case "slash":
        return "jadeSwordWake";
      case "talisman":
        return "talismanWake";
      case "fireSea":
      case "fire":
        return "spiritFlameWake";
      case "dragonBolt":
      case "bolt":
      case "lightning":
        return "thunderWake";
      case "glacierNeedle":
      case "needle":
        return "frostWake";
      case "poison":
      case "plagueDomain":
        return "poisonWake";
      default:
        if (color === colors.violet || color === weapons.voidSeal.color) return "voidWake";
        if (color === colors.poison || color === weapons.poisonMist.color || color === weapons.plagueDomain.color) return "poisonWake";
        return null;
    }
  }

  function projectileMotionTrailSpec(pr) {
    const id = motionTrailFrameId(pr.kind, pr.color);
    if (!id || !premiumMotionTrailAtlasReady()) return null;
    const dense = state.enemies.length >= SWARM_RENDER_LIMIT;
    const alphaScale = dense ? 0.72 : state.enemies.length > DETAIL_ENEMY_LIMIT ? 0.84 : 1;
    switch (pr.kind) {
      case "thousandSword":
        return { id, x: -pr.r * 2.1, y: 0, w: pr.r * 15.8, h: pr.r * 7.4, alpha: 0.24 * alphaScale, rotation: 0, flip: -1 };
      case "sword":
        return { id, x: -pr.r * 1.65, y: 0, w: pr.r * 11.5, h: pr.r * 5.5, alpha: 0.2 * alphaScale, rotation: 0, flip: -1 };
      case "talisman":
        return { id, x: -pr.r * 1.25, y: 0, w: pr.r * 9.2, h: pr.r * 5.9, alpha: 0.17 * alphaScale, rotation: 0, flip: -1 };
      case "fireSea":
        return { id, x: -pr.r * 1.4, y: 0, w: pr.r * 11.8, h: pr.r * 7.0, alpha: 0.24 * alphaScale, rotation: 0, flip: -1 };
      case "fire":
        return { id, x: -pr.r * 1.15, y: 0, w: pr.r * 9.8, h: pr.r * 5.9, alpha: 0.22 * alphaScale, rotation: 0, flip: -1 };
      case "dragonBolt":
        return { id, x: -pr.r * 1.65, y: 0, w: pr.r * 12.8, h: pr.r * 6.4, alpha: 0.22 * alphaScale, rotation: 0, flip: -1 };
      case "bolt":
        return { id, x: -pr.r * 1.25, y: 0, w: pr.r * 10.4, h: pr.r * 5.4, alpha: 0.18 * alphaScale, rotation: 0, flip: -1 };
      case "glacierNeedle":
        return { id, x: -pr.r * 1.3, y: 0, w: pr.r * 11.2, h: pr.r * 5.45, alpha: 0.2 * alphaScale, rotation: 0, flip: -1 };
      case "needle":
        return { id, x: -pr.r * 1.05, y: 0, w: pr.r * 9.5, h: pr.r * 4.8, alpha: 0.16 * alphaScale, rotation: 0, flip: -1 };
      default:
        return null;
    }
  }

  function playerMotionTrailFrame(characterId) {
    switch (characterId) {
      case "talisman":
        return "talismanWake";
      case "fox":
        return "spiritFlameWake";
      case "mechanist":
        return "thunderWake";
      case "sword":
      default:
        return "jadeSwordWake";
    }
  }

  function premiumProjectileAtlasSpec(pr) {
    const id = premiumProjectileFrameId(pr.kind);
    if (!id) return null;
    switch (pr.kind) {
      case "sword":
        return { id, premium: true, x: pr.r * 0.2, y: 0, w: pr.r * 8.9, h: pr.r * 4.35, alpha: 0.86, rotation: 0 };
      case "needle":
        return { id, premium: true, x: pr.r * 0.16, y: 0, w: pr.r * 8.4, h: pr.r * 4.25, alpha: 0.78, rotation: 0 };
      case "bolt":
        return { id, premium: true, x: pr.r * 0.1, y: 0, w: pr.r * 8.8, h: pr.r * 4.55, alpha: 0.78, rotation: 0 };
      case "thousandSword":
        return { id, premium: true, x: pr.r * 0.15, y: 0, w: pr.r * 13.8, h: pr.r * 6.8, alpha: 0.9, rotation: 0 };
      case "glacierNeedle":
        return { id, premium: true, x: pr.r * 0.12, y: 0, w: pr.r * 10.4, h: pr.r * 5.3, alpha: 0.86, rotation: 0 };
      case "dragonBolt":
        return { id, premium: true, x: pr.r * 0.18, y: 0, w: pr.r * 10.8, h: pr.r * 5.8, alpha: 0.9, rotation: 0 };
      case "talisman":
        return { id, premium: true, x: 0, y: 0, w: pr.r * 8.8, h: pr.r * 5.7, alpha: 0.88, rotation: Math.sin(performance.now() / 130 + pr.spin) * 0.04 };
      case "fireSea":
        return { id, premium: true, x: pr.r * 0.1, y: 0, w: pr.r * 8.6, h: pr.r * 5.8, alpha: 0.9, rotation: 0 };
      case "fire":
        return { id, premium: true, x: pr.r * 0.06, y: 0, w: pr.r * 7.8, h: pr.r * 4.9, alpha: 0.86, rotation: 0 };
      default:
        return null;
    }
  }

  function drawProjectileSpec(spec) {
    if (!spec) return false;
    if (spec.premium) {
      if (state.enemies.length < DETAIL_ENEMY_LIMIT) {
        drawPremiumProjectileFrame(spec.id, spec.x, spec.y, spec.w * 1.16, spec.h * 1.2, spec.alpha * 0.32, spec.rotation, "lighter");
      }
      return drawPremiumProjectileFrame(spec.id, spec.x, spec.y, spec.w, spec.h, spec.alpha, spec.rotation, "source-over");
    }
    return drawAtlasFrame(spec.id, spec.x, spec.y, spec.w, spec.h, spec.alpha, spec.rotation, "source-over");
  }

  function enemyProjectileAtlasSpec(pr) {
    if (!hostileProjectileAtlasReady()) return null;
    switch (pr.kind) {
      case "soulOrb":
        return { id: "soulOrb", w: pr.r * 8.4, h: pr.r * 5.6, alpha: 0.9 };
      case "boneShard":
        return { id: "boneShard", w: pr.r * 8.9, h: pr.r * 4.0, alpha: 0.88 };
      case "shadowCrescent":
        return { id: "shadowCrescent", w: pr.r * 8.8, h: pr.r * 5.1, alpha: 0.9 };
      case "emberBile":
      default:
        return { id: "emberBile", w: pr.r * 8.7, h: pr.r * 5.4, alpha: 0.9 };
    }
  }

  function drawProjectileTrail(pr) {
    if (!allowLegacyFallbackFx()) return false;
    recordLegacyFallbackFx();
    const fast = len(pr.vx, pr.vy);
    const longKinds = ["thousandSword", "dragonBolt", "glacierNeedle", "fireSea", "fire"];
    const trail = clamp(fast * 0.055, 18, longKinds.includes(pr.kind) ? 108 : 64);
    const wide = pr.r * (pr.kind === "fireSea" || pr.kind === "dragonBolt" ? 1.9 : 1.15);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const grad = ctx.createLinearGradient(-trail, 0, pr.r * 2.4, 0);
    grad.addColorStop(0, colorAlpha(pr.color, 0));
    grad.addColorStop(0.52, colorAlpha(pr.color, 0.16));
    grad.addColorStop(1, colorAlpha(pr.color, 0.72));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(pr.r * 1.4, 0);
    ctx.quadraticCurveTo(-trail * 0.45, wide, -trail, 0);
    ctx.quadraticCurveTo(-trail * 0.45, -wide, pr.r * 1.4, 0);
    ctx.fill();
    if (pr.kind === "dragonBolt" || pr.kind === "fireSea") {
      ctx.strokeStyle = colorAlpha("#ffffff", 0.28);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-trail * 0.75, -wide * 0.5);
      ctx.quadraticCurveTo(-trail * 0.35, 0, pr.r * 1.8, wide * 0.32);
      ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  function environmentPropSpec(id, r) {
    switch (id) {
      case "obelisk":
        return { w: r * 5.1, h: r * 5.7, y: -r * 0.3, glow: colors.jade, glowA: 0.08 };
      case "ringRuin":
        return { w: r * 6.2, h: r * 4.8, y: r * 0.05, glow: colors.gold, glowA: 0.035 };
      case "spiritCrystals":
        return { w: r * 5.2, h: r * 4.7, y: -r * 0.08, glow: colors.frost, glowA: 0.13 };
      case "boneAltar":
        return { w: r * 6.3, h: r * 4.9, y: 0, glow: colors.danger, glowA: 0.08 };
      case "talismanLantern":
        return { w: r * 5.6, h: r * 4.2, y: r * 0.08, glow: colors.gold, glowA: 0.11 };
      case "mossRubble":
        return { w: r * 5.4, h: r * 4.25, y: r * 0.05, glow: colors.poison, glowA: 0.055 };
      case "voidShard":
        return { w: r * 5.05, h: r * 5.05, y: -r * 0.1, glow: colors.violet, glowA: 0.12 };
      case "sigilPlate":
        return { w: r * 6.5, h: r * 4.6, y: r * 0.05, glow: colors.gold, glowA: 0.035 };
      default:
        return { w: r * 5, h: r * 4.5, y: 0, glow: colors.jade, glowA: 0.05 };
    }
  }

  function drawEnvironmentProp(id, d, s, texturedArena, withGlow = true) {
    if (!environmentPropAtlasReady()) return false;
    const spec = environmentPropSpec(id, d.r);
    const flip = hash2(Math.floor(d.x / 97), Math.floor(d.y / 103)) > 0.5 ? -1 : 1;
    const alpha = texturedArena ? 0.34 : 0.72;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = texturedArena ? "rgba(0, 0, 0, 0.16)" : "rgba(0, 0, 0, 0.22)";
    ctx.beginPath();
    ctx.ellipse(s.x, s.y + spec.h * 0.24, spec.w * 0.31, spec.h * 0.13, d.rot, 0, TAU);
    ctx.fill();
    drawEnvironmentPropFrame(id, s.x, s.y + spec.y, spec.w, spec.h, alpha, d.rot, flip);
    if (withGlow && !texturedArena && spec.glowA > 0) {
      ctx.globalCompositeOperation = "lighter";
      drawGlow(s.x, s.y + spec.y, Math.max(spec.w, spec.h) * 0.44, spec.glow, spec.glowA);
    }
    ctx.restore();
    return true;
  }

  function renderWorld() {
    const camX = state.camera.x;
    const camY = state.camera.y;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const now = performance.now();
    const t = now / 1000;
    const texturedArena = arenaBackgroundReady();
    const useLegacyWorldFallback = ENABLE_LEGACY_RUNTIME_ART && !texturedArena && (!arenaBackground || arenaBackground.complete);
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#101722");
    bg.addColorStop(0.45, "#161c1c");
    bg.addColorStop(1, "#090b12");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    renderArenaTexture(camX, camY, w, h);

    const moon = ctx.createRadialGradient(w * 0.18, h * 0.08, 10, w * 0.18, h * 0.08, Math.max(w, h) * 0.72);
    moon.addColorStop(0, "rgba(124, 215, 175, 0.22)");
    moon.addColorStop(0.26, "rgba(124, 215, 175, 0.07)");
    moon.addColorStop(1, "rgba(124, 215, 175, 0)");
    ctx.fillStyle = moon;
    ctx.fillRect(0, 0, w, h);

    const ember = ctx.createRadialGradient(w * 0.82, h * 0.18, 8, w * 0.82, h * 0.18, Math.max(w, h) * 0.56);
    ember.addColorStop(0, "rgba(255, 118, 91, 0.13)");
    ember.addColorStop(0.42, "rgba(168, 140, 255, 0.045)");
    ember.addColorStop(1, "rgba(255, 118, 91, 0)");
    ctx.fillStyle = ember;
    ctx.fillRect(0, 0, w, h);

    if (useLegacyWorldFallback) {
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
          if (hsh > 0.88) {
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.strokeStyle = "rgba(124, 215, 175, 0.10)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(sx + tile * 0.5, sy + tile * 0.5, tile * (0.12 + hsh * 0.08), 0, TAU);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      const altar = worldToScreen(0, 0);
      if (altar.x > -420 && altar.x < w + 420 && altar.y > -320 && altar.y < h + 320) {
        ctx.save();
        ctx.translate(altar.x, altar.y);
        ctx.scale(1, 0.58);
        ctx.globalCompositeOperation = "lighter";
        const altarGlow = ctx.createRadialGradient(0, 0, 18, 0, 0, 330);
        altarGlow.addColorStop(0, "rgba(124,215,175,0.16)");
        altarGlow.addColorStop(0.46, "rgba(241,198,106,0.05)");
        altarGlow.addColorStop(1, "rgba(124,215,175,0)");
        ctx.fillStyle = altarGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 330, 0, TAU);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "rgba(174, 160, 119, 0.18)";
        ctx.lineWidth = 3;
        for (const rr of [96, 148, 214, 286]) {
          ctx.beginPath();
          ctx.arc(0, 0, rr, 0, TAU);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(124, 215, 175, 0.12)";
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 24; i++) {
          const a = (TAU / 24) * i + t * 0.02;
          const r1 = i % 3 === 0 ? 78 : 132;
          const r2 = i % 2 === 0 ? 278 : 226;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
          ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(242, 234, 215, 0.12)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 18; i++) {
          const a = i * 1.37;
          const r1 = 90 + (i % 5) * 28;
          const r2 = r1 + 44 + (i % 4) * 16;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
          ctx.lineTo(Math.cos(a + 0.14) * r2, Math.sin(a + 0.14) * r2);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 7; i++) {
        const y = (h * (0.12 + i * 0.14) + Math.sin(t * 0.35 + i) * 18) | 0;
        const grad = ctx.createLinearGradient(0, y - 26, w, y + 26);
        grad.addColorStop(0, "rgba(124,215,175,0)");
        grad.addColorStop(0.34, "rgba(124,215,175,0.035)");
        grad.addColorStop(0.58, "rgba(241,198,106,0.035)");
        grad.addColorStop(1, "rgba(124,215,175,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = -40; x <= w + 40; x += 42) {
          const yy = y + Math.sin((x + camX * 0.08) * 0.012 + i * 1.7 + t * 0.55) * 18;
          if (x === -40) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
      ctx.restore();
      if (QA_MODE) state.qa.legacyWorldOverlays += 1;
    }

    const compactWorld = Math.min(w, h) < 560;
    const basePropBudget = compactWorld ? 2 : state.enemies.length >= SWARM_RENDER_LIMIT ? 8 : 18;
    const propBudget = scaledRenderBudget(basePropBudget, compactWorld ? 1 : 5, 0.68);
    let propDraws = 0;
    for (const d of state.decorations) {
      const s = worldToScreen(d.x, d.y);
      if (s.x < -130 || s.x > w + 130 || s.y < -130 || s.y > h + 130) continue;
      const propId = environmentPropIds[d.kind % environmentPropIds.length];
      if (propDraws < propBudget && drawEnvironmentProp(propId, d, s, texturedArena, !compactWorld)) {
        propDraws += 1;
      }
    }
    if (QA_MODE) state.qa.environmentPropDraws = propDraws;

    const fogOffset = now / 3600;
    for (let i = 0; i < 5; i++) {
      const y = h * (0.18 + i * 0.16) + Math.sin(fogOffset + i) * 10;
      const x = ((fogOffset * 58 + i * 211) % (w + 360)) - 180;
      const fog = ctx.createRadialGradient(x, y, 20, x, y, 230);
      fog.addColorStop(0, i % 2 ? "rgba(168, 140, 255, 0.045)" : "rgba(124, 215, 175, 0.06)");
      fog.addColorStop(1, "rgba(124, 215, 175, 0)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function renderAtmosphereBack() {
    if (!atmosphereAtlasReady()) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const t = performance.now() / 1000;
    const compact = Math.min(w, h) < 560;
    const dense = state.enemies.length >= SWARM_RENDER_LIMIT;
    const detail = compact ? 0.72 : dense ? 0.82 : 1;
    drawAtmosphereFrame(
      "moonbeam",
      w * 0.19 + Math.sin(t * 0.1) * 18,
      h * 0.22,
      Math.min(w * 0.72, compact ? 360 : 620),
      Math.min(h * 1.05, compact ? 520 : 820),
      0.06 * detail,
      Math.sin(t * 0.18) * 0.025,
      "lighter"
    );

    const mistCount = compact ? 2 : dense ? 3 : 4;
    for (let i = 0; i < mistCount; i++) {
      const phase = i * 0.31 + t * 0.018;
      const x = (phase % 1) * (w + 420) - 210;
      const y = h * (0.55 + i * 0.11) + Math.sin(t * 0.38 + i * 1.7) * 14;
      const width = Math.min(w * (compact ? 0.9 : 0.66), compact ? 380 : 620);
      drawAtmosphereFrame("lowMist", x, y, width, width * 0.42, 0.16 * detail, Math.sin(t * 0.2 + i) * 0.035, "source-over", i % 2 ? -1 : 1);
    }

    const fogCount = compact || dense ? 1 : 2;
    for (let i = 0; i < fogCount; i++) {
      const x = w * (0.25 + i * 0.5) + Math.sin(t * 0.16 + i * 2.4) * w * 0.08;
      const y = h * (0.22 + i * 0.32) + Math.cos(t * 0.13 + i) * h * 0.06;
      const size = Math.min(Math.max(w, h) * 0.34, compact ? 260 : 440);
      drawAtmosphereFrame("ghostFog", x, y, size, size * 0.92, 0.09 * detail, Math.sin(t * 0.12 + i) * 0.26, "source-over", i % 2 ? -1 : 1);
    }

    const boss = state.enemies.find((e) => e.boss && e.hp > 0);
    if (boss) {
      const s = worldToScreen(boss.x, boss.y);
      if (s.x > -260 && s.x < w + 260 && s.y > -260 && s.y < h + 260) {
        const pulse = 1 + Math.sin(t * 2.1) * 0.05;
        drawAtmosphereFrame("bossAura", s.x, s.y + boss.r * 0.12, boss.r * 8.2 * pulse, boss.r * 6.6 * pulse, 0.18 * detail, t * 0.08, "lighter");
      }
    }
  }

  function renderAtmosphereFront() {
    if (!atmosphereAtlasReady() || !state.player) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const t = performance.now() / 1000;
    const compact = Math.min(w, h) < 560;
    const dense = state.enemies.length >= SWARM_RENDER_LIMIT;
    const detail = compact ? 0.7 : dense ? 0.78 : 1;
    const p = state.player;
    const pScreen = worldToScreen(p.x, p.y);

    drawAtmosphereFrame("spiritEmbers", pScreen.x + Math.sin(t * 1.5) * 7, pScreen.y - p.r * 1.1, p.r * 6.0, p.r * 5.4, 0.1 * detail, t * 0.06, "lighter");

    const moteCount = compact ? 2 : dense ? 3 : 4;
    for (let i = 0; i < moteCount; i++) {
      const x = ((i * 0.29 + t * (0.018 + i * 0.002)) % 1) * (w + 260) - 130;
      const y = h * (0.18 + i * 0.19) + Math.sin(t * 0.52 + i * 2.1) * 26;
      const size = compact ? 120 + i * 18 : 150 + i * 24;
      drawAtmosphereFrame(i % 2 ? "sparkleCluster" : "ashMotes", x, y, size, size, (i % 2 ? 0.1 : 0.075) * detail, Math.sin(t * 0.22 + i) * 0.35, "lighter", i % 2 ? -1 : 1);
    }

    const boss = state.enemies.find((e) => e.boss && e.hp > 0);
    const hpRatio = p.maxHp ? p.hp / p.maxHp : 1;
    const crowdDanger = dense ? clamp((state.enemies.length - SWARM_RENDER_LIMIT) / 280, 0, 1) : 0;
    const dangerAlpha = boss ? 0.2 : hpRatio < 0.36 ? 0.16 : crowdDanger * 0.12;
    if (dangerAlpha > 0) {
      const target = boss ? worldToScreen(boss.x, boss.y) : pScreen;
      const visible = target.x > -260 && target.x < w + 260 && target.y > -260 && target.y < h + 260;
      const x = visible ? target.x : w / 2;
      const y = visible ? target.y : h / 2;
      const size = boss ? Math.min(560, Math.max(300, boss.r * 8.6)) : Math.min(360, Math.max(220, Math.min(w, h) * 0.58));
      drawAtmosphereFrame("dangerPulse", x, y, size, size * 0.72, dangerAlpha * detail * (0.9 + Math.sin(t * 2.6) * 0.1), -t * 0.12, "lighter");
    }
    renderSwarmPressureOverlay(w, h, t, hpRatio, Boolean(boss), compact);
  }

  function renderSwarmPressureOverlay(w, h, t, hpRatio, bossAlive, compact) {
    if (!premiumSwarmPressureAtlasReady()) return;
    const crowd = clamp((state.enemies.length - DETAIL_ENEMY_LIMIT) / Math.max(1, MAX_ENEMIES - DETAIL_ENEMY_LIMIT), 0, 1);
    const danger = Math.max(crowd, bossAlive ? 0.84 : 0, hpRatio < 0.36 ? 0.72 : 0);
    if (danger <= 0.06) return;
    const pressure = renderLoadPressure();
    const budget = pressure > 0.7 || compact ? 2 : danger > 0.72 ? 4 : 3;
    const cx = w / 2;
    const cy = h / 2;
    const wide = Math.max(w * 1.12, h * 1.55);
    const tall = Math.max(h * 0.76, w * 0.42);
    const alphaScale = (compact ? 0.74 : 1) * (1 - pressure * 0.22);
    let draws = 0;
    if (drawSwarmPressureFrame("bloodEdge", cx, cy + h * 0.03, wide * 1.08, tall * 1.16, (0.055 + danger * 0.09) * alphaScale, Math.sin(t * 0.12) * 0.018, "source-over")) draws += 1;
    if (draws < budget && drawSwarmPressureFrame("soulMist", cx + Math.sin(t * 0.17) * w * 0.05, h * 0.76, wide * 0.98, tall * 0.72, (0.06 + crowd * 0.105) * alphaScale, Math.sin(t * 0.1) * 0.015, "lighter")) draws += 1;
    if (draws < budget && !compact && danger > 0.36 && drawSwarmPressureFrame("runeWeb", cx, h * 0.72, wide * 0.86, tall * 0.74, (0.035 + danger * 0.045) * alphaScale, Math.sin(t * 0.08) * 0.018, "lighter")) draws += 1;
    if (draws < budget && (bossAlive || danger > 0.78) && drawSwarmPressureFrame("voidCracks", cx, h * 0.84, wide * 1.04, tall * 0.82, (0.04 + danger * 0.045) * alphaScale, -Math.sin(t * 0.09) * 0.02, "source-over")) draws += 1;
  }

  function eliteThreatFrame(e) {
    if (e.boss) return "bossSigil";
    if (e.type.id === "eliteSummoner") return "summonPortal";
    if (e.type.id === "eliteWisp") return "ghostHalo";
    return "eliteCrown";
  }

  function currentHeroFxFrame(p) {
    const owned = p?.weapons || {};
    if (owned.thunderArray || owned.thunderPearl) return "thunderRune";
    if (owned.fireSea || owned.spiritFire) return "fireDragon";
    if (owned.voidSeal || owned.talisman) return "voidBlossom";
    if (owned.glacierRain || owned.frostNeedle) return "frostLotus";
    if (owned.moonWheel || owned.spinningBlade) return "soulShield";
    if (owned.thousandSword || owned.flyingSword) return "swordStorm";
    if (owned.dragonRepeater || owned.crossbow) return "emberImpact";
    return "heroMandala";
  }

  function renderHeroAura(p, t) {
    if (!premiumHeroFxAtlasReady()) return;
    const dense = state.enemies.length >= SWARM_RENDER_LIMIT;
    const compact = Math.min(window.innerWidth, window.innerHeight) < 560;
    const frame = currentHeroFxFrame(p);
    const baseSize = p.r * (compact ? 6.2 : dense ? 6.4 : 7.2);
    const pulse = 1 + Math.sin(t * 2.4) * 0.035;
    const alpha = compact ? 0.15 : dense ? 0.13 : 0.24;
    drawHeroFxFrame(frame, 0, -2, baseSize * pulse, baseSize * pulse, alpha, t * 0.035, "lighter");
    if (ENABLE_SECONDARY_COMBAT_OVERLAYS && !dense && frame !== "heroMandala") {
      drawHeroFxFrame("heroMandala", 0, -4, p.r * 5.35, p.r * 5.35, compact ? 0.055 : 0.075, -t * 0.024, "lighter");
    }
  }

  function renderThreatsBack() {
    if (!threatAtlasReady()) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const t = performance.now() / 1000;
    const compact = Math.min(w, h) < 560;
    let budget = compact ? 5 : 9;
    for (const e of state.enemies) {
      if ((!e.boss && !e.elite) || e.hp <= 0 || budget <= 0) continue;
      const s = worldToScreen(e.x, e.y);
      const cull = e.r * 7.5;
      if (s.x < -cull || s.x > w + cull || s.y < -cull || s.y > h + cull) continue;
      if (premiumEnemySprite(e)) continue;
      const hpRatio = clamp(e.hp / e.maxHp, 0, 1);
      const pulse = 1 + Math.sin(t * (e.boss ? 1.8 : 2.4) + e.x * 0.003) * 0.045;
      if (e.boss) {
        drawScreenStrikeFrame("bloodMoonShock", s.x, s.y + e.r * 0.2, e.r * 7.6 * pulse, e.r * 6.15 * pulse, 0.18, t * 0.04, "lighter");
        drawThreatFrame("bossSigil", s.x, s.y + e.r * 0.2, e.r * 8.0 * pulse, e.r * 6.25 * pulse, 0.38, -t * 0.08, "source-over");
        budget -= 1;
        if (budget <= 0) continue;
        drawThreatFrame("shockwaveRing", s.x, s.y + e.r * 0.22, e.r * 8.8 * (1.02 - hpRatio * 0.05), e.r * 5.8, 0.18, t * 0.12, "lighter");
        budget -= 1;
        if (hpRatio < 0.42 && budget > 0) {
          drawThreatFrame("phaseBurst", s.x, s.y - e.r * 0.08, e.r * 6.6, e.r * 5.2, 0.24 * (1.1 - hpRatio), t * 0.04, "lighter");
          budget -= 1;
        }
      } else {
        const frame = eliteThreatFrame(e);
        const width = e.r * (frame === "summonPortal" ? 5.5 : frame === "ghostHalo" ? 5.0 : 4.75) * pulse;
        const height = e.r * (frame === "summonPortal" ? 5.3 : frame === "ghostHalo" ? 4.55 : 3.7) * pulse;
        drawThreatFrame(frame, s.x, s.y + e.r * 0.1, width, height, compact ? 0.18 : 0.25, frame === "eliteCrown" ? 0 : t * 0.08, frame === "eliteCrown" ? "lighter" : "source-over");
        budget -= 1;
      }
    }
  }

  function renderPlayer() {
    const p = state.player;
    const s = worldToScreen(p.x, p.y);
    const t = performance.now() / 1000;
    const face = Math.atan2(p.lastDir.y, p.lastDir.x);
    const atlasFx = allowAtlasFx();
    const premiumPlayer = premiumPlayerSprite(p.character.id);
    const usePremiumPlayerSprite = premiumPlayer && premiumPlayerAtlasReady();
    const hasPremiumPlayerArt = Boolean(premiumPlayer);
    const playerSprite = playerCreatureSprite(p.character.id);
    const usePlayerSprite = usePremiumPlayerSprite || (!hasPremiumPlayerArt && playerSprite && creatureAtlasReady());
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(face * 0.06);
    const main = p.hitFlash > 0 ? "#ffffff" : p.character.color;
    ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
    ctx.beginPath();
    ctx.ellipse(0, 18, 24, 8, 0, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = "lighter";
    const moving = playerMovingForVisuals();
    if (moving && state.enemies.length < SWARM_RENDER_LIMIT && premiumMotionTrailAtlasReady()) {
      const moveAngle = Math.atan2(state.input.lastMove.y || p.lastDir.y, state.input.lastMove.x || p.lastDir.x);
      const compact = Math.min(window.innerWidth, window.innerHeight) < 560;
      ctx.save();
      ctx.rotate(moveAngle - face * 0.06);
      drawMotionTrailFrame(playerMotionTrailFrame(p.character.id), -p.r * 1.45, 10, p.r * (compact ? 5.0 : 6.1), p.r * (compact ? 2.45 : 2.9), compact ? 0.065 : 0.09, 0, "lighter", -1);
      ctx.restore();
    }
    const unitAuraId = playerUnitAuraFrame(p.character.id);
    const auraPulse = 1 + Math.sin(t * 2.2) * 0.035;
    drawUnitAuraFrame(unitAuraId, 0, 14, p.r * 5.35 * auraPulse, p.r * 3.6 * auraPulse, usePremiumPlayerSprite ? 0.26 : 0.18, t * 0.05, "lighter", p.lastDir.x < -0.08 ? -1 : 1);
    if (!usePremiumPlayerSprite) {
      drawGlow(0, 2, 44 + Math.sin(t * 4) * 3, p.character.color, 0.28);
    }
    renderHeroAura(p, t);
    ctx.globalCompositeOperation = "source-over";

    ctx.save();
    ctx.rotate(-face * 0.06);
    if (!usePremiumPlayerSprite && !hasPremiumPlayerArt) drawSoftParticleFallback(0, 1, p.r + 8, p.character.color, 0.12, t * 0.35, 1.18);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (!usePremiumPlayerSprite && !hasPremiumPlayerArt && atlasFx) drawAtlasFrame("swordFan", 0, 2, p.r * 5.6, p.r * 4.0, 0.12, -face * 0.35);
    if (!usePlayerSprite && !hasPremiumPlayerArt) {
      for (let i = 0; i < 4; i++) {
        const a = t * 1.25 + i * (TAU / 4);
        const rr = p.r * (1.55 + Math.sin(t * 2 + i) * 0.08);
        ctx.save();
        ctx.translate(Math.cos(a) * rr, Math.sin(a) * rr * 0.62);
        ctx.rotate(a + Math.PI / 2);
        drawSoftParticleFallback(0, 0, p.r * 0.72, p.character.color, 0.08, 0, 1.45);
        ctx.restore();
      }
    }
    ctx.restore();

    if (usePlayerSprite) {
      const bob = Math.sin(t * 5.2) * 1.7;
      const lean = clamp(p.lastDir.x * 0.055, -0.07, 0.07);
      const flip = p.lastDir.x < -0.08 ? -1 : 1;
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      if (usePremiumPlayerSprite) {
        const scale = premiumPlayerSpriteScale(premiumPlayer);
        drawPremiumPlayerSprite(premiumPlayer, 0, -8 + bob, p.r * scale[0], p.r * scale[1], p.hitFlash > 0 ? 0.98 : 0.95, lean - face * 0.025, flip);
      } else {
        drawCreatureSprite(playerSprite, 0, -5 + bob, p.r * 5.05, p.r * 5.05, p.hitFlash > 0 ? 0.94 : 0.9, lean - face * 0.03, flip);
      }
      ctx.restore();
      if (p.hitFlash > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        drawGlow(0, -5, p.r * 2.35, p.character.color, 0.1 * p.hitFlash);
        ctx.restore();
      }
      ctx.restore();
      return;
    }

    if (hasPremiumPlayerArt) {
      ctx.restore();
      return;
    }
    if (!ENABLE_LEGACY_RUNTIME_ART) {
      ctx.restore();
      return;
    }

    ctx.shadowColor = p.character.color;
    ctx.shadowBlur = 18;
    const robe = ctx.createLinearGradient(0, -p.r, 0, p.r + 12);
    robe.addColorStop(0, colorAlpha(main, 0.95));
    robe.addColorStop(0.48, colorAlpha(main, 0.62));
    robe.addColorStop(1, "rgba(16, 18, 24, 0.96)");
    ctx.fillStyle = robe;
    ctx.beginPath();
    ctx.moveTo(0, -p.r * 1.12);
    ctx.bezierCurveTo(p.r * 0.82, -p.r * 0.72, p.r * 0.78, p.r * 0.55, p.r * 0.3, p.r * 1.18);
    ctx.lineTo(-p.r * 0.3, p.r * 1.18);
    ctx.bezierCurveTo(-p.r * 0.78, p.r * 0.55, -p.r * 0.82, -p.r * 0.72, 0, -p.r * 1.12);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(5, 8, 12, 0.78)";
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * p.r * 0.18, -p.r * 0.2);
      ctx.bezierCurveTo(i * p.r * 1.4, p.r * 0.9, i * p.r * 0.82, p.r * 2.2, i * p.r * 0.12, p.r * 1.42);
      ctx.bezierCurveTo(i * p.r * 0.02, p.r * 0.7, -i * p.r * 0.1, p.r * 0.3, i * p.r * 0.18, -p.r * 0.2);
      ctx.fill();
    }
    ctx.strokeStyle = colorAlpha(p.character.color, 0.42);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-p.r * 0.48, -p.r * 0.1);
    ctx.quadraticCurveTo(0, p.r * 1.58, p.r * 0.48, -p.r * 0.1);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "rgba(14, 17, 24, 0.72)";
    ctx.beginPath();
    ctx.moveTo(-p.r * 0.86, 2);
    ctx.quadraticCurveTo(-p.r * 0.2, p.r * 1.45, p.r * 0.74, p.r * 0.42);
    ctx.lineTo(p.r * 0.36, -p.r * 0.18);
    ctx.quadraticCurveTo(0, p.r * 0.36, -p.r * 0.36, -p.r * 0.18);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#f1ddc5";
    ctx.beginPath();
    ctx.arc(0, -p.r * 0.76, p.r * 0.42, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#141821";
    ctx.beginPath();
    ctx.moveTo(-p.r * 0.42, -p.r * 1.02);
    ctx.quadraticCurveTo(0, -p.r * 1.34, p.r * 0.46, -p.r * 1.0);
    ctx.quadraticCurveTo(p.r * 0.18, -p.r * 0.72, -p.r * 0.18, -p.r * 0.72);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#111318";
    ctx.beginPath();
    ctx.arc(-p.r * 0.15, -p.r * 0.78, 1.8, 0, TAU);
    ctx.arc(p.r * 0.24, -p.r * 0.78, 1.8, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = colorAlpha("#ffffff", 0.72);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-p.r * 0.52, -p.r * 0.1);
    ctx.quadraticCurveTo(0, p.r * 0.2, p.r * 0.52, -p.r * 0.1);
    ctx.stroke();

    if (p.character.id === "sword") {
      ctx.strokeStyle = colorAlpha(p.character.color, 0.9);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.r * 0.72, -p.r * 0.82);
      ctx.lineTo(p.r * 1.55, -p.r * 1.42);
      ctx.stroke();
    } else if (p.character.id === "talisman") {
      ctx.fillStyle = colorAlpha(colors.gold, 0.88);
      ctx.fillRect(p.r * 0.62, -p.r * 1.1, 8, 16);
      ctx.strokeStyle = "rgba(55, 34, 10, 0.7)";
      ctx.strokeRect(p.r * 0.62, -p.r * 1.1, 8, 16);
    } else if (p.character.id === "fox") {
      ctx.fillStyle = colorAlpha(p.character.color, 0.55);
      ctx.beginPath();
      ctx.moveTo(-p.r * 0.68, p.r * 0.5);
      ctx.bezierCurveTo(-p.r * 1.68, p.r * 0.02, -p.r * 1.04, -p.r * 1.06, -p.r * 0.3, -p.r * 0.62);
      ctx.fill();
    } else {
      ctx.strokeStyle = colorAlpha(p.character.color, 0.86);
      ctx.lineWidth = 2;
      ctx.strokeRect(p.r * 0.56, -p.r * 0.82, p.r * 0.62, p.r * 0.48);
      ctx.beginPath();
      ctx.moveTo(p.r * 0.72, -p.r * 0.34);
      ctx.lineTo(p.r * 1.46, -p.r * 0.22);
      ctx.stroke();
    }
    ctx.restore();
  }

  function recordSwarmCluster(clusters, e, sx, sy, halfW, halfH) {
    if (!clusters || e.boss || e.elite) return false;
    if (Math.abs(sx - halfW) < 96 && Math.abs(sy - halfH) < 132) return false;
    const key = `${Math.floor(sx / SWARM_CLUSTER_CELL)}:${Math.floor(sy / SWARM_CLUSTER_CELL)}`;
    let cluster = clusters.get(key);
    if (!cluster) {
      cluster = { x: 0, y: 0, count: 0, radius: 0, heat: 0 };
      clusters.set(key, cluster);
    }
    cluster.x += sx;
    cluster.y += sy;
    cluster.count += 1;
    cluster.radius += e.r;
    cluster.heat += e.flash > 0 ? 1.5 : e.type.id === "spitter" ? 0.8 : e.type.id === "wisp" ? 0.45 : 0.25;
    return true;
  }

  function renderSwarmClusters(clusters, t, compactViewport) {
    if (!clusters || !clusters.size || !premiumSwarmPressureAtlasReady()) return { draws: 0, clustered: 0 };
    const pressure = renderLoadPressure();
    const budget = scaledRenderBudget(compactViewport ? 7 : SWARM_CLUSTER_LIMIT, compactViewport ? 3 : 8, 0.58);
    const entries = Array.from(clusters.values()).sort((a, b) => b.count - a.count).slice(0, budget);
    let draws = 0;
    let clustered = 0;
    for (let i = 0; i < entries.length; i++) {
      const cluster = entries[i];
      const count = cluster.count;
      const x = cluster.x / count;
      const y = cluster.y / count;
      const radius = cluster.radius / count;
      const mass = clamp(count / (compactViewport ? 10 : 16), 0.34, 1.45);
      const heat = clamp(cluster.heat / count, 0, 1);
      const width = Math.max(96, radius * (compactViewport ? 7.2 : 8.6) * (0.78 + mass * 0.36));
      const height = Math.max(58, width * (0.42 + mass * 0.05));
      const alpha = (0.055 + mass * 0.052 + heat * 0.018) * (1 - pressure * 0.24);
      const frame = heat > 0.58 ? "bloodEdge" : i % 3 === 0 ? "voidCracks" : "soulMist";
      const blend = frame === "soulMist" ? "lighter" : "source-over";
      if (drawSwarmPressureFrame(frame, x, y + radius * 1.1, width, height, alpha, Math.sin(t * 0.22 + x * 0.01) * 0.035, blend, i % 2 ? -1 : 1)) {
        draws += 1;
        clustered += count;
      }
    }
    return { draws, clustered };
  }

  function renderEnemies() {
    const t = performance.now() / 1000;
    const swarmMode = state.enemies.length >= SWARM_RENDER_LIMIT;
    const camX = state.camera.x;
    const camY = state.camera.y;
    const halfW = window.innerWidth / 2;
    const halfH = window.innerHeight / 2;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    let swarmImpostorDraws = 0;
    let hordeSpritesSkipped = 0;
    const swarmClusters = swarmMode && premiumSwarmPressureAtlasReady() ? new Map() : null;
    const hordeBudget = hordeSpriteRenderBudget();
    const hordeNearExtraBudget = Math.min(28, Math.max(14, Math.floor(hordeBudget * 0.1)));
    const compactViewport = Math.min(viewW, viewH) < 560;
    const unitAuraBudget = premiumUnitAuraAtlasReady() ? (compactViewport || swarmMode ? 0 : 36) : 0;
    let hordeBudgetUsed = 0;
    let hordeNearExtraUsed = 0;
    let unitAuraBudgetUsed = 0;
    for (const e of state.enemies) {
      const sx = e.x - camX + halfW;
      const sy = e.y - camY + halfH;
      if (sx < -120 || sx > viewW + 120 || sy < -120 || sy > viewH + 120) continue;
      const pulse = Math.sin(t * (e.boss ? 2.6 : e.elite ? 3.2 : 4.5) + e.x * 0.01 + e.y * 0.01);
      const detailed = e.boss || e.elite || state.enemies.length <= DETAIL_ENEMY_LIMIT;
      const hasPremiumArt = hasPremiumEnemyArt(e);
      const premiumHordeId = premiumHordeSprite(e);
      const premiumMinionId = premiumMinionSprite(e);
      if (!e.boss && !e.elite && (swarmMode || !detailed)) {
        const nearPlayer = Math.abs(sx - halfW) < 72 && Math.abs(sy - halfH) < 108;
        if (hordeBudgetUsed >= hordeBudget) {
          if (nearPlayer && hordeNearExtraUsed < hordeNearExtraBudget) {
            hordeNearExtraUsed += 1;
          } else {
            recordSwarmCluster(swarmClusters, e, sx, sy, halfW, halfH);
            hordeSpritesSkipped += 1;
            continue;
          }
        }
        hordeBudgetUsed += 1;
        if (nearPlayer && unitAuraBudgetUsed < unitAuraBudget && (hordeBudgetUsed % 3 === 0 || e.flash > 0)) {
          if (drawEnemyUnitAuraAt(e, sx, sy, t, premiumHordeId, premiumMinionId, compactViewport ? 0.72 : 0.82)) unitAuraBudgetUsed += 1;
        }
        if (premiumHordeId) {
          if (drawSwarmHordeImpostorEnemyAt(e, sx, sy, t, premiumHordeId)) swarmImpostorDraws += 1;
          else drawHordeSpriteEnemyAt(e, sx, sy, t, premiumHordeId);
        }
        else if (premiumMinionId) {
          if (drawSwarmImpostorEnemyAt(e, sx, sy, t, premiumMinionId)) swarmImpostorDraws += 1;
          else drawSwarmSpriteEnemyAt(e, sx, sy, t, premiumMinionId);
        }
        else if (!hasPremiumArt && ENABLE_LEGACY_RUNTIME_ART) {
          recordLegacyEnemyFallback(e);
          drawSwarmEnemyAt(e, sx, sy, t);
        }
        continue;
      }
      ctx.save();
      ctx.translate(sx, sy);
      const premiumEnemyId = premiumEnemySprite(e);
      const atlasCreatureId = enemyCreatureSprite(e);
      const usePremiumHordeSprite = premiumHordeId && !premiumEnemyId;
      const usePremiumMinionSprite = premiumMinionId && !premiumEnemyId;
      const useCreatureSprite = Boolean(premiumEnemyId || usePremiumHordeSprite || usePremiumMinionSprite || (!hasPremiumArt && atlasCreatureId && allowCreatureAtlas()));
      if (useCreatureSprite) {
        drawSpriteEnemy(e, atlasCreatureId, t, pulse, usePremiumMinionSprite ? premiumMinionId : null, usePremiumHordeSprite ? premiumHordeId : null);
        ctx.restore();
        continue;
      }
      if (hasPremiumArt) {
        ctx.restore();
        continue;
      }
      if (!ENABLE_LEGACY_RUNTIME_ART) {
        ctx.restore();
        continue;
      }
      ctx.fillStyle = e.boss ? "rgba(0, 0, 0, 0.46)" : "rgba(0, 0, 0, 0.32)";
      ctx.beginPath();
      ctx.ellipse(0, e.r * 0.84, e.r * 1.08, e.r * 0.36, 0, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "lighter";
      drawGlow(0, 0, e.boss ? e.r * 2.65 : e.elite ? e.r * 2.05 : e.r * 1.35, e.boss ? colors.danger : e.elite ? colors.gold : e.color, e.boss ? 0.22 : e.elite ? 0.16 : 0.055);
      ctx.globalCompositeOperation = "source-over";
      ctx.shadowColor = e.boss ? colors.danger : e.elite ? colors.gold : e.color;
      ctx.shadowBlur = e.boss ? 26 : e.elite ? 18 : 8;
      const enemyColor = e.flash > 0 ? "#ffffff" : e.color;
      if (e.boss) {
        if (!drawThreatFrame("dangerReticle", 0, 0, e.r * 3.15, e.r * 3.15, 0.2, -t * 0.15, "lighter")) {
          drawSoftParticleFallback(0, 0, e.r * 1.45, colors.danger, 0.14, -t * 0.15, 1.12);
        }
        ctx.fillStyle = colorAlpha(colors.danger, 0.28);
        for (let i = 0; i < 8; i++) {
          const a = (TAU / 8) * i + t * 0.4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * e.r * 0.72, Math.sin(a) * e.r * 0.72);
          ctx.quadraticCurveTo(Math.cos(a + 0.28) * e.r * 1.45, Math.sin(a + 0.28) * e.r * 1.45, Math.cos(a + 0.56) * e.r * 0.92, Math.sin(a + 0.56) * e.r * 0.92);
          ctx.lineWidth = 6;
          ctx.strokeStyle = colorAlpha(colors.danger, 0.24);
          ctx.stroke();
        }
        const bossGrad = ctx.createRadialGradient(-e.r * 0.18, -e.r * 0.2, e.r * 0.1, 0, 0, e.r);
        bossGrad.addColorStop(0, "#ffebe6");
        bossGrad.addColorStop(0.22, enemyColor);
        bossGrad.addColorStop(1, "#320b13");
        ctx.fillStyle = bossGrad;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = (TAU / 10) * i - Math.PI / 2;
          const r = i % 2 ? e.r * 0.68 : e.r * (1 + pulse * 0.02);
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 214, 160, 0.42)";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.fillStyle = "rgba(20, 8, 10, 0.76)";
        ctx.beginPath();
        ctx.arc(0, 0, e.r * 0.48, 0, TAU);
        ctx.fill();
        ctx.globalCompositeOperation = "lighter";
        drawStar(0, 0, 7, e.r * 0.34, e.r * 0.14, t);
        ctx.fillStyle = colorAlpha(colors.gold, 0.34);
        ctx.fill();
        drawGlow(0, 0, e.r * 0.9, colors.danger, 0.2);
        ctx.globalCompositeOperation = "source-over";
      } else if (e.elite) {
        if (!drawThreatFrame("eliteCrown", 0, -e.r * 0.1, e.r * 3.0, e.r * 2.45, 0.2, 0, "lighter")) {
          drawSoftParticleFallback(0, 0, e.r * 1.22, colors.gold, 0.12, t * 0.08, 1.08);
        }
        const eliteGrad = ctx.createLinearGradient(-e.r, -e.r, e.r, e.r);
        eliteGrad.addColorStop(0, "#fff1ae");
        eliteGrad.addColorStop(0.28, enemyColor);
        eliteGrad.addColorStop(1, "#2a1f18");
        ctx.fillStyle = eliteGrad;
        ctx.beginPath();
        ctx.moveTo(0, -e.r);
        ctx.lineTo(e.r, 0);
        ctx.lineTo(0, e.r);
        ctx.lineTo(-e.r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = colorAlpha(colors.gold, 0.65);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 232, 160, 0.22)";
        ctx.beginPath();
        ctx.arc(0, 0, e.r * 0.62, 0, TAU);
        ctx.fill();
        ctx.fillStyle = colorAlpha(colors.gold, 0.55);
        ctx.beginPath();
        ctx.moveTo(-e.r * 0.45, -e.r * 0.55);
        ctx.lineTo(-e.r * 0.16, -e.r * 1.12);
        ctx.lineTo(e.r * 0.02, -e.r * 0.45);
        ctx.moveTo(e.r * 0.45, -e.r * 0.55);
        ctx.lineTo(e.r * 0.16, -e.r * 1.12);
        ctx.lineTo(-e.r * 0.02, -e.r * 0.45);
        ctx.fill();
        if (detailed) {
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = colorAlpha("#fff2a8", 0.32);
          ctx.lineWidth = 1.4;
          for (let i = 0; i < 4; i++) {
            const a = t * 0.8 + i * TAU / 4;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * e.r * 0.22, Math.sin(a) * e.r * 0.22);
            ctx.lineTo(Math.cos(a) * e.r * 1.32, Math.sin(a) * e.r * 1.32);
            ctx.stroke();
          }
          ctx.globalCompositeOperation = "source-over";
        }
      } else {
        recordLegacyEnemyFallback(e);
        const body = ctx.createRadialGradient(-e.r * 0.24, -e.r * 0.28, e.r * 0.12, 0, 0, e.r * 1.2);
        body.addColorStop(0, colorAlpha("#ffffff", 0.32));
        body.addColorStop(0.32, enemyColor);
        body.addColorStop(1, colorAlpha("#05060a", 0.92));
        ctx.fillStyle = body;
        drawEnemySilhouette(e, detailed);
      }
      ctx.shadowBlur = 0;
      if (!e.boss) {
        ctx.strokeStyle = e.elite ? colorAlpha(colors.gold, 0.42) : "rgba(0, 0, 0, 0.46)";
        ctx.lineWidth = e.elite ? 2.4 : 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, e.r * (e.elite ? 1.1 : 0.96), 0, TAU);
        ctx.stroke();
      }
      ctx.fillStyle = e.boss ? "rgba(255, 242, 210, 0.92)" : "rgba(18, 12, 16, 0.92)";
      ctx.beginPath();
      ctx.arc(-e.r * 0.33, -e.r * 0.12, e.boss ? 4.6 : 2.3, 0, TAU);
      ctx.arc(e.r * 0.33, -e.r * 0.12, e.boss ? 4.6 : 2.3, 0, TAU);
      ctx.fill();
      if (e.boss || e.elite) {
        ctx.strokeStyle = e.boss ? colorAlpha(colors.danger, 0.85) : colorAlpha(colors.gold, 0.75);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-e.r * 0.52, e.r * 0.16);
        ctx.quadraticCurveTo(0, e.r * 0.38, e.r * 0.52, e.r * 0.16);
        ctx.stroke();
      }
      if (e.elite) {
        const hpw = e.boss ? 96 : 56;
        drawEnemyHealthBar(e, hpw, -e.r - 15);
      }
      ctx.restore();
    }
    const clusterStats = renderSwarmClusters(swarmClusters, t, compactViewport);
    if (QA_MODE) {
      state.qa.swarmImpostorDraws = swarmImpostorDraws;
      state.qa.swarmClusterDraws = clusterStats.draws;
      state.qa.swarmClusteredEnemies = clusterStats.clustered;
    }
    if (QA_MODE) {
      state.qa.hordeSpritesSkipped = hordeSpritesSkipped;
      state.qa.hordeRenderBudget = Number.isFinite(hordeBudget) ? hordeBudget : 0;
      state.qa.hordeBudgetUsed = hordeBudgetUsed;
    }
  }

  function drawEnemyUnitAuraAt(e, x, y, t, premiumHordeId = null, premiumMinionId = null, alphaScale = 1) {
    if (!premiumUnitAuraAtlasReady()) return false;
    const id = enemyUnitAuraFrame(e, premiumHordeId, premiumMinionId);
    const lowProfile = premiumHordeLowProfile(premiumHordeId) || premiumMinionId === "lavaWolf" || premiumMinionId === "plagueCrawler" || e.type.id === "wolf" || e.type.id === "runner" || e.type.id === "bug";
    const pulse = 1 + Math.sin(t * (e.boss ? 1.5 : e.elite ? 2.1 : 3.2) + e.x * 0.006 + e.y * 0.004) * 0.035;
    const width = e.r * (e.boss ? 8.4 : e.elite ? 6.0 : lowProfile ? 4.35 : 3.75) * pulse;
    const height = e.r * (e.boss ? 5.8 : e.elite ? 4.2 : lowProfile ? 2.45 : 2.85) * pulse;
    const alpha = (e.boss ? 0.22 : e.elite ? 0.18 : e.flash > 0 ? 0.16 : 0.09) * alphaScale;
    const flip = lowProfile && state.player && e.x < state.player.x ? -1 : 1;
    return drawUnitAuraFrame(id, x, y + e.r * 0.72, width, height, alpha, e.x * 0.0013 + t * (e.boss ? 0.04 : 0.08), "lighter", flip);
  }

  function drawSwarmEnemyAt(e, x, y, t) {
    const r = e.r;
    const flash = e.flash > 0;
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.78, r * 0.82, r * 0.22, 0, 0, TAU);
    ctx.fill();

    ctx.globalAlpha = flash ? 0.98 : 0.72;
    ctx.fillStyle = flash ? "#fff6d5" : e.color;
    ctx.strokeStyle = flash ? "rgba(255, 246, 190, 0.66)" : "rgba(5, 7, 10, 0.52)";
    ctx.lineWidth = flash ? 2 : 1;
    const lean = clamp((e.vx || 0) * 0.00038, -0.08, 0.08);
    const pulse = 1 + Math.sin(t * 4.5 + e.x * 0.011 + e.y * 0.009) * 0.025;

    ctx.beginPath();
    switch (e.type.id) {
      case "wolf":
      case "runner":
        ctx.ellipse(x, y, r * 0.98 * pulse, r * 0.52, lean, 0, TAU);
        break;
      case "stone":
      case "brute":
        ctx.moveTo(x, y - r * 0.92);
        ctx.lineTo(x + r * 0.78, y - r * 0.1);
        ctx.lineTo(x + r * 0.46, y + r * 0.82);
        ctx.lineTo(x - r * 0.5, y + r * 0.76);
        ctx.lineTo(x - r * 0.82, y - r * 0.06);
        ctx.closePath();
        break;
      case "wisp":
      case "shadow":
        ctx.moveTo(x, y - r);
        ctx.bezierCurveTo(x + r * 0.82, y - r * 0.28, x + r * 0.58, y + r * 0.82, x, y + r);
        ctx.bezierCurveTo(x - r * 0.58, y + r * 0.82, x - r * 0.82, y - r * 0.28, x, y - r);
        break;
      default:
        ctx.ellipse(x, y, r * 0.68, r * 0.86 * pulse, lean, 0, TAU);
        break;
    }
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawSwarmImpostorEnemyAt(e, x, y, t, premiumMinionId) {
    const flip = (premiumMinionId === "lavaWolf" || premiumMinionId === "plagueCrawler") && state.player && e.x < state.player.x ? -1 : 1;
    const sprite = getSwarmImpostorSprite(premiumMinionId, flip);
    if (!sprite) return false;
    const r = e.r;
    const gait = Math.sin(t * 5.2 + e.x * 0.013 + e.y * 0.011);
    const lowProfile = premiumMinionId === "lavaWolf" || premiumMinionId === "plagueCrawler";
    const bob = lowProfile ? gait * r * 0.025 : -Math.abs(gait) * r * 0.035;
    const size = SWARM_IMPOSTOR_CANVAS * (r / SWARM_IMPOSTOR_BASE_R) * (1 + gait * 0.006);
    ctx.save();
    ctx.globalAlpha = e.flash > 0 ? 0.96 : 0.8;
    ctx.drawImage(sprite, x - size / 2, y + bob - size / 2, size, size);
    if (e.flash > 0) {
      ctx.globalCompositeOperation = "lighter";
      drawGlow(x, y - r * 0.08, r * 1.05, e.color, 0.08 * e.flash);
    }
    ctx.restore();
    return true;
  }

  function drawSwarmHordeImpostorEnemyAt(e, x, y, t, premiumHordeId) {
    const flip = premiumHordeLowProfile(premiumHordeId) && state.player && e.x < state.player.x ? -1 : 1;
    const sprite = getHordeImpostorSprite(premiumHordeId, flip);
    if (!sprite) return false;
    const r = e.r;
    const gait = Math.sin(t * 5.2 + e.x * 0.013 + e.y * 0.011);
    const bob = premiumHordeLowProfile(premiumHordeId) ? gait * r * 0.023 : -Math.abs(gait) * r * 0.034;
    const size = SWARM_IMPOSTOR_CANVAS * (r / SWARM_IMPOSTOR_BASE_R) * (1 + gait * 0.006);
    ctx.save();
    ctx.globalAlpha = e.flash > 0 ? 0.98 : 0.84;
    ctx.drawImage(sprite, x - size / 2, y + bob - size / 2, size, size);
    if (e.flash > 0) {
      ctx.globalCompositeOperation = "lighter";
      drawGlow(x, y - r * 0.08, r * 1.08, e.color, 0.1 * e.flash);
    }
    ctx.restore();
    if (QA_MODE) state.qa.hordeSpriteDraws += 1;
    return true;
  }

  function drawSwarmSpriteEnemyAt(e, x, y, t, premiumMinionId) {
    const r = e.r;
    const gait = Math.sin(t * 5.2 + e.x * 0.013 + e.y * 0.011);
    const scale = premiumMinionSpriteScale(premiumMinionId);
    const lean = clamp((e.vx || 0) * 0.00045, -0.06, 0.06);
    const flip = (premiumMinionId === "lavaWolf" || premiumMinionId === "plagueCrawler") && state.player && e.x < state.player.x ? -1 : 1;
    const lowProfile = premiumMinionId === "lavaWolf" || premiumMinionId === "plagueCrawler";
    const bob = lowProfile ? gait * r * 0.025 : -Math.abs(gait) * r * 0.035;
    const spriteY = (lowProfile ? -r * 0.05 : premiumMinionId === "voidSummoner" ? -r * 0.38 : -r * 0.16) + bob;
    const alpha = e.flash > 0 ? 0.92 : 0.78;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.ellipse(0, r * 0.84, r * 0.95, r * 0.3, 0, 0, TAU);
    ctx.fill();
    drawPremiumMinionSprite(
      premiumMinionId,
      0,
      spriteY,
      r * scale[0] * 0.88 * (1 + gait * 0.018),
      r * scale[1] * 0.88 * (1 - gait * 0.012),
      alpha,
      lean,
      flip
    );
    if (e.flash > 0) {
      ctx.globalCompositeOperation = "lighter";
      drawGlow(0, -r * 0.08, r * 1.05, e.color, 0.08 * e.flash);
    }
    ctx.restore();
  }

  function drawHordeSpriteEnemyAt(e, x, y, t, premiumHordeId) {
    const r = e.r;
    const gait = Math.sin(t * 5.2 + e.x * 0.013 + e.y * 0.011);
    const scale = premiumHordeSpriteScale(premiumHordeId);
    const lean = clamp((e.vx || 0) * 0.00045, -0.07, 0.07);
    const flip = premiumHordeLowProfile(premiumHordeId) && state.player && e.x < state.player.x ? -1 : 1;
    const bob = premiumHordeLowProfile(premiumHordeId) ? gait * r * 0.023 : -Math.abs(gait) * r * 0.034;
    const spriteY = premiumHordeSpriteY(premiumHordeId, r) + bob;
    const alpha = e.flash > 0 ? 0.95 : 0.84;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "rgba(0, 0, 0, 0.21)";
    ctx.beginPath();
    ctx.ellipse(0, r * 0.86, r * 1.02, r * 0.31, 0, 0, TAU);
    ctx.fill();
    drawPremiumHordeSprite(
      premiumHordeId,
      0,
      spriteY,
      r * scale[0] * 0.88 * (1 + gait * 0.018),
      r * scale[1] * 0.88 * (1 - gait * 0.012),
      alpha,
      lean,
      flip
    );
    if (e.flash > 0) {
      ctx.globalCompositeOperation = "lighter";
      drawGlow(0, -r * 0.08, r * 1.12, e.color, 0.1 * e.flash);
    }
    ctx.restore();
  }

  function drawSpriteEnemy(e, creatureId, t, pulse, premiumMinionId = null, premiumHordeId = null) {
    const premiumSprite = premiumEnemySprite(e);
    const cleanPremiumSprite = Boolean(premiumSprite || premiumHordeId || premiumMinionId);
    ctx.fillStyle = e.boss ? "rgba(0, 0, 0, 0.42)" : e.elite ? "rgba(0, 0, 0, 0.30)" : "rgba(0, 0, 0, 0.18)";
    ctx.beginPath();
    ctx.ellipse(0, e.r * 0.88, e.r * 1.08, e.r * 0.36, 0, 0, TAU);
    ctx.fill();

    const suppressEnemyAura = (Math.min(window.innerWidth, window.innerHeight) < 560 || state.enemies.length >= SWARM_RENDER_LIMIT) && !e.boss;
    if (!suppressEnemyAura) drawEnemyUnitAuraAt(e, 0, 0, t, premiumHordeId, premiumMinionId, e.boss || e.elite ? 1 : 0.74);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    if (!cleanPremiumSprite) {
      drawGlow(
        0,
        0,
        e.boss ? e.r * 2.1 : e.elite ? e.r * 1.62 : e.r * 1.05,
        e.boss ? colors.danger : e.elite ? colors.gold : e.color,
        e.boss ? 0.18 : e.elite ? 0.12 : 0.035
      );
    }
    if (!premiumSprite && e.boss) {
      if (!drawThreatFrame("dangerReticle", 0, 0, e.r * 3.25, e.r * 3.25, 0.22, -t * 0.15, "lighter")) {
        drawSoftParticleFallback(0, 0, e.r * 1.5, colors.danger, 0.14, -t * 0.15, 1.12);
      }
    } else if (!premiumSprite && e.elite) {
      const threatId = eliteThreatFrame(e);
      if (!drawThreatFrame(threatId, 0, -e.r * 0.1, e.r * (threatId === "summonPortal" ? 3.35 : 3.0), e.r * (threatId === "summonPortal" ? 3.4 : 2.45), 0.2, threatId === "eliteCrown" ? 0 : t * 0.08, "lighter")) {
        drawSoftParticleFallback(0, 0, e.r * 1.22, colors.gold, 0.12, t * 0.08, 1.08);
      }
    }
    ctx.restore();

    const scale = premiumSprite ? premiumEnemySpriteScale(premiumSprite) : premiumHordeId ? premiumHordeSpriteScale(premiumHordeId) : premiumMinionId ? premiumMinionSpriteScale(premiumMinionId) : creatureSpriteScale(creatureId);
    const gait = Math.sin(t * (e.boss ? 2.2 : e.elite ? 3.2 : 5.4) + e.x * 0.013 + e.y * 0.011);
    const squash = e.boss ? 0.012 : e.elite ? 0.018 : 0.026;
    const bob = premiumSprite ? -Math.abs(gait) * e.r * 0.025 : premiumHordeId ? (premiumHordeLowProfile(premiumHordeId) ? gait * e.r * 0.023 : -Math.abs(gait) * e.r * 0.034) : premiumMinionId ? -Math.abs(gait) * e.r * 0.035 : creatureId === "wolf" ? gait * e.r * 0.04 : -Math.abs(gait) * e.r * 0.052;
    const lean = clamp((e.vx || 0) * 0.00065, -0.08, 0.08);
    const baseAlpha = e.boss ? 0.94 : e.elite ? 0.9 : premiumHordeId ? 0.88 : premiumMinionId ? 0.86 : 0.8;
    const alpha = e.flash > 0 ? Math.min(0.98, baseAlpha + 0.08) : baseAlpha;
    const flip = ((premiumHordeId && premiumHordeLowProfile(premiumHordeId)) || premiumMinionId === "lavaWolf" || premiumMinionId === "plagueCrawler" || creatureId === "wolf") && state.player && e.x < state.player.x ? -1 : 1;
    if (premiumSprite) {
      const y = premiumEnemySpriteY(premiumSprite, e.r) + bob;
      drawPremiumCreatureSprite(premiumSprite, 0, y, e.r * scale[0] * (1 + gait * squash), e.r * scale[1] * (1 - gait * squash * 0.72), alpha, lean, 1);
    } else if (premiumHordeId) {
      const y = premiumHordeSpriteY(premiumHordeId, e.r) + bob;
      drawPremiumHordeSprite(premiumHordeId, 0, y, e.r * scale[0] * (1 + gait * squash), e.r * scale[1] * (1 - gait * squash * 0.72), alpha, lean, flip);
    } else if (premiumMinionId) {
      const y = (premiumMinionId === "lavaWolf" || premiumMinionId === "plagueCrawler" ? -e.r * 0.08 : premiumMinionId === "voidSummoner" ? -e.r * 0.42 : -e.r * 0.18) + bob;
      drawPremiumMinionSprite(premiumMinionId, 0, y, e.r * scale[0] * (1 + gait * squash), e.r * scale[1] * (1 - gait * squash * 0.72), alpha, lean, flip);
    } else {
      drawCreatureSprite(creatureId, 0, (creatureId === "wolf" ? -e.r * 0.12 : 0) + bob, e.r * scale[0] * (1 + gait * squash), e.r * scale[1] * (1 - gait * squash * 0.72), alpha, lean, flip);
    }

    if (e.flash > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      drawGlow(0, -e.r * 0.16, e.r * (e.boss ? 1.8 : e.elite ? 1.45 : 1.1), e.boss ? colors.danger : e.elite ? colors.gold : e.color, 0.09 * e.flash);
      ctx.restore();
    }

    if (e.elite) {
      const hpw = e.boss ? 96 : 56;
      drawEnemyHealthBar(e, hpw, -e.r - 15);
    }
  }

  function drawEnemySilhouette(e, detailed = true) {
    const r = e.r;
    const t = performance.now() / 1000;
    switch (e.type.id) {
      case "imp":
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TAU);
        ctx.fill();
        ctx.fillStyle = colorAlpha("#16120e", 0.72);
        ctx.beginPath();
        ctx.moveTo(-r * 0.56, -r * 0.6);
        ctx.lineTo(-r * 0.22, -r * 1.08);
        ctx.lineTo(-r * 0.02, -r * 0.54);
        ctx.moveTo(r * 0.56, -r * 0.6);
        ctx.lineTo(r * 0.22, -r * 1.08);
        ctx.lineTo(r * 0.02, -r * 0.54);
        ctx.fill();
        ctx.strokeStyle = colorAlpha(e.color, 0.55);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.62, Math.PI * 0.12, Math.PI * 0.88);
        ctx.stroke();
        if (detailed) {
          ctx.fillStyle = colorAlpha("#ffdf9a", 0.62);
          ctx.beginPath();
          ctx.arc(-r * 0.28, -r * 0.16, r * 0.1, 0, TAU);
          ctx.arc(r * 0.28, -r * 0.16, r * 0.1, 0, TAU);
          ctx.fill();
        }
        break;
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
        ctx.strokeStyle = colorAlpha("#f5e7b5", 0.35);
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(-r * 0.28 + i * r * 0.23, -r * 0.28);
          ctx.lineTo(-r * 0.4 + i * r * 0.22, r * 0.28);
          ctx.stroke();
        }
        if (e.type.id === "runner") {
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = colorAlpha(e.color, 0.55);
          ctx.beginPath();
          ctx.moveTo(-r * 1.04, r * 0.5);
          ctx.lineTo(-r * 1.55, r * 0.68 + Math.sin(t * 8) * 3);
          ctx.stroke();
          ctx.globalCompositeOperation = "source-over";
        }
        if (detailed) {
          ctx.strokeStyle = colorAlpha(e.color, 0.42);
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(r * 0.35, -r * 0.5);
          ctx.quadraticCurveTo(r * 1.25, -r * 0.9, r * 1.42, -r * 0.1);
          ctx.stroke();
        }
        break;
      case "wisp":
        ctx.globalCompositeOperation = "lighter";
        drawGlow(0, 0, r * 2.1, e.color, 0.22);
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.15);
        ctx.bezierCurveTo(r, -r * 0.55, r * 0.76, r * 0.82, 0, r);
        ctx.bezierCurveTo(-r * 0.76, r * 0.82, -r, -r * 0.55, 0, -r * 1.15);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.2, r * 0.24, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = colorAlpha("#ffffff", 0.36);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.45, r * 0.35);
        ctx.quadraticCurveTo(0, r * 0.86, r * 0.42, r * 0.32);
        ctx.stroke();
        if (detailed) {
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = colorAlpha("#ffffff", 0.18);
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 1.12, r * 0.74, t * 0.8, 0, TAU);
          ctx.stroke();
          ctx.globalCompositeOperation = "source-over";
        }
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
        ctx.strokeStyle = colorAlpha("#231c0b", 0.65);
        ctx.lineWidth = 1.3;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(i * r * 0.22, -r * 0.7);
          ctx.lineTo(i * r * 0.16, r * 0.72);
          ctx.stroke();
        }
        if (detailed) {
          ctx.strokeStyle = colorAlpha(e.color, 0.52);
          ctx.beginPath();
          ctx.moveTo(-r * 0.9, r * 0.52);
          ctx.lineTo(-r * 1.22, r * 0.88);
          ctx.moveTo(r * 0.9, r * 0.52);
          ctx.lineTo(r * 1.22, r * 0.88);
          ctx.stroke();
        }
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
        ctx.strokeStyle = colorAlpha("#f2ead7", 0.18);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r * 0.62, -r * 0.05);
        ctx.lineTo(r * 0.56, -r * 0.16);
        ctx.moveTo(-r * 0.32, r * 0.36);
        ctx.lineTo(r * 0.32, r * 0.5);
        ctx.stroke();
        if (detailed) {
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = colorAlpha(e.type.id === "stone" ? colors.poison : colors.danger, 0.22);
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.24, 0, TAU);
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";
        }
        break;
      case "spitter":
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(255,196,130,0.38)";
        ctx.beginPath();
        ctx.arc(r * 0.45, -r * 0.15, r * 0.34, 0, TAU);
        ctx.fill();
        ctx.globalCompositeOperation = "lighter";
        drawGlow(r * 0.46, -r * 0.14, r * 0.82, "#ff9b5e", 0.22);
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = colorAlpha("#ffe0a0", 0.45);
        ctx.beginPath();
        ctx.arc(r * 0.45, -r * 0.15, r * 0.28 + Math.sin(t * 5) * 1.2, 0, TAU);
        ctx.stroke();
        if (detailed) {
          ctx.fillStyle = "rgba(22, 10, 6, 0.5)";
          ctx.beginPath();
          ctx.arc(r * 0.45, -r * 0.15, r * 0.12, 0, TAU);
          ctx.fill();
        }
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
        drawStar(0, 0, 5, r * 0.46, r * 0.18, t);
        ctx.fillStyle = colorAlpha("#fff2a8", 0.18);
        ctx.fill();
        if (detailed) drawSoftParticleFallback(0, 0, r * 0.82, e.color, 0.08, -t * 0.08, 1.05);
        break;
      case "shadow":
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.08, r * 0.72, -0.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.arc(r * 0.15, -r * 0.05, r * 0.55, 0, TAU);
        ctx.fill();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = colorAlpha("#a88cff", 0.28);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(-r * 0.22, 0, r * 1.22, r * 0.54, -0.3, 0, TAU);
        ctx.stroke();
        if (detailed) {
          ctx.beginPath();
          ctx.ellipse(r * 0.16, -r * 0.04, r * 0.72, r * 0.28, 0.45, 0, TAU);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
        break;
      default:
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TAU);
        ctx.fill();
    }
  }

  function renderProjectiles() {
    const now = performance.now();
    const highFx = allowHighFx();
    const atlasFx = allowAtlasFx();
    const renderBudget = projectileRenderBudget();
    const motionBudget = motionTrailRenderBudget();
    let projectileDraws = 0;
    let projectilesSkipped = 0;
    let motionTrailDraws = 0;
    for (const pr of state.projectiles) {
      const s = worldToScreen(pr.x, pr.y);
      if (s.x < -80 || s.x > window.innerWidth + 80 || s.y < -80 || s.y > window.innerHeight + 80) continue;
      if (projectileDraws >= renderBudget) {
        projectilesSkipped += 1;
        continue;
      }
      projectileDraws += 1;
      const premiumProjectileSpec = premiumProjectileAtlasReady() ? premiumProjectileAtlasSpec(pr) : null;
      const atlasProjectileSpec = !premiumProjectileSpec && atlasFx ? projectileAtlasSpec(pr) : null;
      const projectileSpec = premiumProjectileSpec || atlasProjectileSpec;
      const hasPremiumProjectileArt = Boolean(premiumProjectileSpec);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(Math.atan2(pr.vy, pr.vx) + pr.spin * 0.05);
      ctx.shadowColor = pr.color;
      ctx.shadowBlur = ["fire", "fireSea", "dragonBolt", "thousandSword", "glacierNeedle"].includes(pr.kind) ? 22 : 12;
      ctx.fillStyle = pr.color;
      if (!projectileSpec) drawProjectileTrail(pr);
      else if (!hasPremiumProjectileArt) {
        ctx.globalCompositeOperation = "lighter";
        drawGlow(pr.r * 0.35, 0, pr.r * 3.25, pr.color, 0.11);
        ctx.globalCompositeOperation = "source-over";
      }
      const motionSpec = projectileMotionTrailSpec(pr);
      if (motionSpec && motionTrailDraws < motionBudget) {
        if (drawMotionTrailFrame(motionSpec.id, motionSpec.x, motionSpec.y, motionSpec.w, motionSpec.h, motionSpec.alpha, motionSpec.rotation, "lighter", motionSpec.flip)) {
          motionTrailDraws += 1;
        }
      }
      if (pr.kind === "thousandSword") {
        ctx.globalCompositeOperation = "lighter";
        if (!hasPremiumProjectileArt) drawGlow(pr.r * 0.8, 0, pr.r * 4.5, pr.color, 0.18);
        const drewAtlas = drawProjectileSpec(projectileSpec);
        if (drewAtlas) state.qa.premiumAtlasFxDraws += 1;
        ctx.globalCompositeOperation = "source-over";
        if (!drewAtlas) drawSoftProjectileFallback(pr, highFx ? 0.18 : 0.12);
      } else if (pr.kind === "glacierNeedle") {
        ctx.globalCompositeOperation = "lighter";
        if (!hasPremiumProjectileArt) drawGlow(0, 0, pr.r * 4, pr.color, 0.16);
        const drewAtlas = drawProjectileSpec(projectileSpec);
        if (drewAtlas) state.qa.premiumAtlasFxDraws += 1;
        ctx.globalCompositeOperation = "source-over";
        if (!drewAtlas) drawSoftProjectileFallback(pr, highFx ? 0.16 : 0.11);
      } else if (pr.kind === "dragonBolt") {
        ctx.globalCompositeOperation = "lighter";
        if (!hasPremiumProjectileArt) drawGlow(pr.r * 0.4, 0, pr.r * 5, pr.color, 0.2);
        const drewAtlas = drawProjectileSpec(projectileSpec);
        if (drewAtlas) state.qa.premiumAtlasFxDraws += 1;
        ctx.globalCompositeOperation = "source-over";
        if (!drewAtlas) drawSoftProjectileFallback(pr, highFx ? 0.2 : 0.13);
      } else if (pr.kind === "sword" || pr.kind === "needle" || pr.kind === "bolt") {
        const drewAtlas = drawProjectileSpec(projectileSpec);
        if (drewAtlas) state.qa.premiumAtlasFxDraws += 1;
        if (!drewAtlas) drawSoftProjectileFallback(pr, 0.13);
      } else if (pr.kind === "talisman") {
        ctx.save();
        ctx.rotate(Math.sin(now / 120 + pr.spin) * 0.08);
        const drewAtlas = drawProjectileSpec(projectileSpec);
        if (drewAtlas) state.qa.premiumAtlasFxDraws += 1;
        if (!drewAtlas) drawSoftProjectileFallback(pr, highFx ? 0.15 : 0.11);
        ctx.restore();
      } else if (pr.kind === "fireSea") {
        ctx.globalCompositeOperation = "lighter";
        if (!hasPremiumProjectileArt) drawGlow(0, 0, pr.r * 3.8, pr.color, 0.22);
        const drewAtlas = drawProjectileSpec(projectileSpec);
        if (drewAtlas) state.qa.premiumAtlasFxDraws += 1;
        ctx.globalCompositeOperation = "source-over";
        if (!drewAtlas) drawSoftProjectileFallback(pr, highFx ? 0.2 : 0.14);
      } else if (pr.kind === "fire") {
        const drewAtlas = drawProjectileSpec(projectileSpec);
        if (drewAtlas) state.qa.premiumAtlasFxDraws += 1;
        if (!drewAtlas) drawSoftProjectileFallback(pr, highFx ? 0.18 : 0.12);
      } else if (allowLegacyFallbackFx()) {
        recordLegacyFallbackFx();
        ctx.beginPath();
        ctx.arc(0, 0, pr.r, 0, TAU);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    if (QA_MODE) {
      state.qa.projectileRenderBudget = Number.isFinite(renderBudget) ? renderBudget : 0;
      state.qa.motionTrailRenderBudget = Number.isFinite(motionBudget) ? motionBudget : 0;
      state.qa.projectileSpriteDraws = state.qa.projectileSpriteDraws || 0;
      state.qa.projectilesSkipped = projectilesSkipped;
    }
    const hostileRenderBudget = hostileProjectileRenderBudget();
    let hostileDraws = 0;
    let hostileSkipped = 0;
    for (const pr of state.enemyProjectiles) {
      const s = worldToScreen(pr.x, pr.y);
      if (s.x < -90 || s.x > window.innerWidth + 90 || s.y < -90 || s.y > window.innerHeight + 90) continue;
      if (hostileDraws >= hostileRenderBudget) {
        hostileSkipped += 1;
        continue;
      }
      hostileDraws += 1;
      const angle = Math.atan2(pr.vy, pr.vx);
      const hostileSpec = enemyProjectileAtlasSpec(pr);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(angle);
      if (hostileSpec) {
        drawHostileProjectileFrame(hostileSpec.id, 0, 0, hostileSpec.w, hostileSpec.h, hostileSpec.alpha, 0, "source-over");
      } else if (allowLegacyFallbackFx()) {
        recordLegacyFallbackFx();
        ctx.globalCompositeOperation = "lighter";
        drawGlow(0, 0, pr.r * 4, pr.color, 0.18);
        ctx.strokeStyle = colorAlpha(pr.color, 0.26);
        ctx.lineWidth = Math.max(1, pr.r * 0.7);
        ctx.beginPath();
        ctx.moveTo(-len(pr.vx, pr.vy) * 0.035, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.fillStyle = pr.color;
        ctx.shadowColor = pr.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, pr.r, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.restore();
    }
    if (QA_MODE) {
      state.qa.hostileProjectileRenderBudget = Number.isFinite(hostileRenderBudget) ? hostileRenderBudget : 0;
      state.qa.hostileProjectileDraws = state.qa.hostileProjectileDraws || 0;
      state.qa.hostileProjectilesSkipped = hostileSkipped;
    }
  }

  function areaAtlasSpec(area, now) {
    switch (area.kind) {
      case "voidSeal":
        return { id: "voidSeal", w: area.r * 2.05, h: area.r * 2.05, alpha: 0.82, rotation: -now / 1400 };
      case "plagueDomain":
        return { id: "plaguePool", w: area.r * 2.25, h: area.r * 1.76, alpha: 0.8, rotation: now / 2200 };
      case "fireSea":
        return { id: "spiritFire", w: area.r * 2.08, h: area.r * 1.5, alpha: 0.78, rotation: now / 1800 };
      case "poison":
        return { id: "plaguePool", w: area.r * 1.96, h: area.r * 1.44, alpha: 0.72, rotation: -now / 2400 };
      case "burst":
        return { id: "frostBurst", w: area.r * 1.94, h: area.r * 1.5, alpha: 0.78, rotation: now / 1600 };
      default:
        return null;
    }
  }

  function areaHeroFxSpec(area, now) {
    switch (area.kind) {
      case "voidSeal":
        return { id: "voidBlossom", w: area.r * 2.45, h: area.r * 2.25, alpha: 0.52, rotation: -now / 2600 };
      case "fireSea":
        return { id: "fireDragon", w: area.r * 2.9, h: area.r * 2.05, alpha: 0.46, rotation: now / 3600 };
      case "plagueDomain":
      case "poison":
        return { id: "voidBlossom", w: area.r * 2.25, h: area.r * 1.9, alpha: 0.32, rotation: -now / 3200 };
      case "burst":
        if (area.color === weapons.thunderArray.color || area.color === weapons.thunderPearl.color) {
          return { id: "thunderRune", w: area.r * 2.05, h: area.r * 2.05, alpha: 0.48, rotation: now / 1800 };
        }
        if (area.slow || area.color === weapons.frostNeedle.color || area.color === weapons.glacierRain.color || area.color === colors.frost) {
          return { id: "frostLotus", w: area.r * 2.2, h: area.r * 1.95, alpha: 0.5, rotation: now / 2400 };
        }
        if (area.color === weapons.spiritFire.color || area.color === weapons.fireSea.color || area.color === colors.danger) {
          return { id: "emberImpact", w: area.r * 2.35, h: area.r * 2.0, alpha: 0.5, rotation: now / 2800 };
        }
        if (area.color === weapons.talisman.color || area.color === weapons.voidSeal.color || area.color === colors.gold || area.color === colors.violet) {
          return { id: "heroMandala", w: area.r * 2.15, h: area.r * 2.15, alpha: 0.42, rotation: -now / 2600 };
        }
        return { id: "soulShield", w: area.r * 2.0, h: area.r * 2.0, alpha: 0.34, rotation: now / 3000 };
      default:
        return null;
    }
  }

  function impactAtlasFrameId(color) {
    if (color === weapons.thunderArray.color || color === weapons.thunderPearl.color) return "thunderSigil";
    if (color === weapons.frostNeedle.color || color === weapons.glacierRain.color || color === colors.frost) return "frostBurst";
    if (color === weapons.poisonMist.color || color === weapons.plagueDomain.color || color === colors.poison) return "plaguePool";
    if (color === weapons.talisman.color || color === weapons.voidSeal.color || color === colors.gold || color === colors.violet) return "talismanWheel";
    if (color === weapons.spiritFire.color || color === weapons.fireSea.color || color === colors.danger) return "spiritFire";
    return "swordFan";
  }

  function hitFrameId(color, kind = "impact") {
    if (kind === "slash") return "spectralSlash";
    if (kind === "death") return color === colors.gold ? "lootPop" : "soulRupture";
    if (color === weapons.thunderArray.color || color === weapons.thunderPearl.color || color === colors.blue) return "lightningImpact";
    if (color === weapons.frostNeedle.color || color === weapons.glacierRain.color || color === colors.frost) return "iceFracture";
    if (color === weapons.poisonMist.color || color === weapons.plagueDomain.color || color === colors.poison) return "poisonSplash";
    if (color === weapons.spiritFire.color || color === weapons.fireSea.color || color === colors.danger) return "criticalBurst";
    if (color === weapons.talisman.color || color === weapons.voidSeal.color || color === colors.violet) return "soulRupture";
    return kind === "spark" ? "hitSpark" : "criticalBurst";
  }

  function screenStrikeFrameId(color, kind = "impact") {
    if (kind === "slash" || color === weapons.flyingSword.color || color === weapons.thousandSword.color) return "jadeCrescent";
    if (color === weapons.thunderArray.color || color === weapons.thunderPearl.color || color === colors.blue) return "lightningBurst";
    if (color === weapons.frostNeedle.color || color === weapons.glacierRain.color || color === colors.frost) return "frostNova";
    if (color === weapons.poisonMist.color || color === weapons.plagueDomain.color || color === colors.poison) return "plagueSplash";
    if (color === weapons.spiritFire.color || color === weapons.fireSea.color || color === colors.danger) return kind === "boss" ? "bloodMoonShock" : "flameRing";
    if (color === weapons.talisman.color || color === weapons.voidSeal.color || color === colors.gold) return "talismanBurst";
    if (color === colors.violet) return "voidRupture";
    return "jadeCrescent";
  }

  function areaScreenStrikeSpec(area, now) {
    if (!premiumScreenStrikeAtlasReady()) return null;
    let id = null;
    if (area.kind === "voidSeal") id = "voidRupture";
    else if (area.kind === "plagueDomain" || area.kind === "poison") id = "plagueSplash";
    else if (area.kind === "fireSea") id = "flameRing";
    else if (area.kind === "burst") id = screenStrikeFrameId(area.color, area.slow ? "frost" : "impact");
    if (!id) return null;
    const pulse = 1 + Math.sin(now / 260 + area.x * 0.01) * 0.025;
    const base = area.kind === "fireSea" ? 2.55 : area.kind === "voidSeal" ? 2.35 : area.kind === "plagueDomain" ? 2.42 : 2.12;
    return {
      id,
      w: area.r * base * pulse,
      h: area.r * (id === "jadeCrescent" ? 1.45 : base) * pulse,
      alpha: area.kind === "burst" ? 0.36 : 0.28,
      rotation: id === "jadeCrescent" ? area.x * 0.002 + now / 900 : area.x * 0.0017 + area.y * 0.0013 + now / 2600
    };
  }

  function areaEventFrameId(area) {
    let id = null;
    if (area.kind === "voidSeal") id = "voidCrackField";
    else if (area.kind === "plagueDomain" || area.kind === "poison") id = "plagueMireField";
    else if (area.kind === "fireSea") id = "fireDragonField";
    else if (area.kind === "burst") {
      if (area.color === weapons.thunderArray.color || area.color === weapons.thunderPearl.color || area.color === colors.blue) id = "thunderPearlArray";
      else if (area.slow || area.color === weapons.frostNeedle.color || area.color === weapons.glacierRain.color || area.color === colors.frost) id = "frostLotusField";
      else if (area.color === weapons.spiritFire.color || area.color === weapons.fireSea.color || area.color === colors.danger) id = "fireDragonField";
      else if (area.color === weapons.poisonMist.color || area.color === weapons.plagueDomain.color || area.color === colors.poison) id = "plagueMireField";
      else if (area.color === weapons.talisman.color || area.color === weapons.voidSeal.color || area.color === colors.gold || area.color === colors.violet) id = "talismanSealField";
    }
    return id;
  }

  function areaEventSpec(area, now, id = areaEventFrameId(area)) {
    if (!premiumAreaEventAtlasReady()) return null;
    if (!id) return null;
    const pulse = 1 + Math.sin(now / 360 + area.x * 0.013 + area.y * 0.007) * 0.018;
    const wideField = id === "fireDragonField" || id === "plagueMireField" || id === "voidCrackField";
    const base = area.kind === "burst" ? 2.05 : area.kind === "fireSea" ? 2.18 : area.kind === "voidSeal" ? 2.22 : 2.16;
    return {
      id,
      w: area.r * base * (wideField ? 1.18 : 1.06) * pulse,
      h: area.r * base * (wideField ? 0.84 : 0.94) * pulse,
      alpha: area.kind === "burst" ? 0.78 : 0.72,
      rotation: (area.x * 0.0011 + area.y * 0.0014) + (id === "voidCrackField" ? -now / 4200 : now / 6200)
    };
  }

  function areaGroundDecalSpec(area, now) {
    let id = null;
    if (area.kind === "voidSeal") id = "voidRift";
    else if (area.kind === "plagueDomain" || area.kind === "poison") id = "plagueMiasma";
    else if (area.kind === "fireSea") id = "infernoScorch";
    else if (area.kind === "burst") {
      if (area.color === weapons.talisman.color || area.color === weapons.voidSeal.color || area.color === colors.gold) id = "talismanSeal";
      else if (area.color === weapons.thunderArray.color || area.color === weapons.thunderPearl.color) id = "lightningSigil";
      else if (area.slow || area.color === weapons.frostNeedle.color || area.color === weapons.glacierRain.color || area.color === colors.frost) id = "frostCrater";
      else id = "soulVortex";
    }
    if (!id) return null;
    const base = area.kind === "voidSeal" ? 2.28 : area.kind === "plagueDomain" ? 2.2 : area.kind === "fireSea" ? 2.05 : 2.0;
    return {
      id,
      w: area.r * base,
      h: area.r * base,
      alpha: area.kind === "burst" ? 0.5 : 0.62,
      rotation: (area.x * 0.0017 + area.y * 0.0021) + (area.kind === "voidSeal" ? -now / 3600 : now / 5200)
    };
  }

  function renderAreas() {
    const now = performance.now();
    const atlasFx = allowAtlasFx();
    const denseAreas = state.areas.length >= DENSE_AREA_LIMIT || state.enemies.length >= SWARM_RENDER_LIMIT;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const compactViewport = Math.min(viewW, viewH) < 560;
    const groundDecalBudget = scaledRenderBudget(compactViewport ? 8 : denseAreas ? GROUND_DECAL_DENSE_LIMIT : 160, compactViewport ? 4 : denseAreas ? 9 : 42, 0.62);
    const areaEventBudget = premiumAreaEventAtlasReady() ? scaledRenderBudget(compactViewport ? 3 : denseAreas ? 6 : 24, compactViewport ? 1 : denseAreas ? 3 : 10, 0.62) : 0;
    const heroFxAreaBudget = premiumHeroFxAtlasReady() ? scaledRenderBudget(compactViewport ? 1 : denseAreas ? 2 : 8, compactViewport ? 1 : 1, 0.68) : 0;
    const screenStrikeAreaBudget = premiumScreenStrikeAtlasReady() ? scaledRenderBudget(compactViewport ? 1 : denseAreas ? 2 : 10, compactViewport ? 1 : 1, 0.68) : 0;
    const areaFxBudget = compactViewport ? scaledRenderBudget(10, 5, 0.62) : denseAreas ? scaledRenderBudget(18, 8, 0.62) : Infinity;
    let groundDecalDraws = 0;
    let areaEventDraws = 0;
    let heroFxAreaDraws = 0;
    let screenStrikeAreaDraws = 0;
    let areaFxDraws = 0;
    for (let i = state.areas.length - 1; i >= 0; i--) {
      const area = state.areas[i];
      const s = worldToScreen(area.x, area.y);
      const cull = area.r * 2.4;
      if (s.x < -cull || s.x > viewW + cull || s.y < -cull || s.y > viewH + cull) continue;
      const alpha = clamp(area.life / area.maxLife, 0, 1);
      ctx.save();
      if (areaFxDraws >= areaFxBudget) {
        ctx.restore();
        continue;
      }
      let premiumAreaOverlayDrawn = false;
      const premiumAreaEventId = premiumAreaEventAtlasReady() ? areaEventFrameId(area) : null;
      const eventSpec = premiumAreaEventId && areaEventDraws < areaEventBudget ? areaEventSpec(area, now, premiumAreaEventId) : null;
      if (eventSpec && drawAreaEventFrame(eventSpec.id, s.x, s.y, eventSpec.w, eventSpec.h, eventSpec.alpha * alpha, eventSpec.rotation, "source-over")) {
        areaFxDraws += 1;
        areaEventDraws += 1;
        ctx.restore();
        continue;
      }
      if (premiumAreaEventId) {
        ctx.restore();
        continue;
      }
      const groundSpec = groundDecalDraws < groundDecalBudget ? areaGroundDecalSpec(area, now) : null;
      if (groundSpec && drawGroundDecalFrame(groundSpec.id, s.x, s.y, groundSpec.w, groundSpec.h, groundSpec.alpha * alpha, groundSpec.rotation, "source-over")) {
        groundDecalDraws += 1;
      }
      const strikeSpec = screenStrikeAreaDraws < screenStrikeAreaBudget ? areaScreenStrikeSpec(area, now) : null;
      if (strikeSpec && drawScreenStrikeFrame(strikeSpec.id, s.x, s.y, strikeSpec.w, strikeSpec.h, strikeSpec.alpha * alpha, strikeSpec.rotation, "lighter")) {
        areaFxDraws += 1;
        screenStrikeAreaDraws += 1;
        premiumAreaOverlayDrawn = true;
        if (denseAreas) {
          ctx.restore();
          continue;
        }
      }
      const heroSpec = (!premiumAreaOverlayDrawn || ENABLE_SECONDARY_COMBAT_OVERLAYS) && heroFxAreaDraws < heroFxAreaBudget ? areaHeroFxSpec(area, now) : null;
      if (heroSpec && drawHeroFxFrame(heroSpec.id, s.x, s.y, heroSpec.w, heroSpec.h, heroSpec.alpha * alpha, heroSpec.rotation, "lighter")) {
        areaFxDraws += 1;
        heroFxAreaDraws += 1;
        premiumAreaOverlayDrawn = true;
        if (denseAreas) {
          ctx.restore();
          continue;
        }
      }
      if (premiumAreaOverlayDrawn && !ENABLE_SECONDARY_COMBAT_OVERLAYS) {
        ctx.restore();
        continue;
      }
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = area.kind === "voidSeal" ? 0.18 + alpha * 0.26 : 0.16 + alpha * 0.24;
      ctx.shadowColor = area.color;
      ctx.shadowBlur = area.kind === "plagueDomain" || area.kind === "fireSea" ? 34 : 24;
      const atlasSpec = heroSpec ? null : atlasFx ? areaAtlasSpec(area, now) : null;
      if (denseAreas) {
        if (atlasSpec && drawAtlasFrame(atlasSpec.id, s.x, s.y, atlasSpec.w, atlasSpec.h, atlasSpec.alpha * alpha * 0.78, atlasSpec.rotation, "source-over")) {
          areaFxDraws += 1;
          ctx.restore();
          continue;
        }
        if (drawSoftAreaFallback(area, s.x, s.y, alpha, now, true)) areaFxDraws += 1;
        ctx.restore();
        continue;
      }
      if (atlasSpec && drawAtlasFrame(atlasSpec.id, s.x, s.y, atlasSpec.w, atlasSpec.h, atlasSpec.alpha * alpha, atlasSpec.rotation, "source-over")) {
        areaFxDraws += 1;
        drawGlow(s.x, s.y, area.r * 1.22, area.color, 0.16 * alpha);
        ctx.shadowBlur = 0;
        ctx.restore();
        continue;
      }
      if (drawSoftAreaFallback(area, s.x, s.y, alpha, now, false)) areaFxDraws += 1;
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    if (QA_MODE) {
      state.qa.groundDecalDraws = groundDecalDraws;
      state.qa.areaEventDraws = areaEventDraws;
      state.qa.areaFxDraws = areaFxDraws;
    }
  }

  function renderPickups() {
    const now = performance.now() / 1000;
    const usePremiumSmallPickups = premiumPickupAtlasReady();
    const usePremiumLoot = premiumPickupAtlasReady();
    const useLegacyPickupFallback = allowLegacyPickupFallback();
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    for (const g of state.gems) {
      const s = worldToScreen(g.x, g.y);
      if (s.x < -70 || s.x > viewW + 70 || s.y < -70 || s.y > viewH + 70) continue;
      const bob = Math.sin(now * 4.6 + g.x * 0.012 + g.y * 0.01) * 1.1;
      if (!usePremiumSmallPickups) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        drawGlow(s.x, s.y, g.r * 4.5, g.color, 0.14);
        ctx.restore();
      }
      if (usePremiumSmallPickups) {
        drawPremiumPickupSprite("xpCrystal", s.x, s.y + bob, g.r * 6.4, g.r * 7.1, 0.88, Math.sin(now * 2.2 + g.x * 0.01) * 0.12);
      } else if (useLegacyPickupFallback) {
        ctx.fillStyle = g.color;
        ctx.shadowColor = g.color;
        ctx.shadowBlur = 9;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - g.r);
        ctx.lineTo(s.x + g.r, s.y);
        ctx.lineTo(s.x, s.y + g.r);
        ctx.lineTo(s.x - g.r, s.y);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,0.48)";
        ctx.beginPath();
        ctx.arc(s.x - g.r * 0.18, s.y - g.r * 0.22, Math.max(1.2, g.r * 0.24), 0, TAU);
        ctx.fill();
      }
    }
    for (const c of state.coins) {
      const s = worldToScreen(c.x, c.y);
      if (s.x < -70 || s.x > viewW + 70 || s.y < -70 || s.y > viewH + 70) continue;
      const bob = Math.sin(now * 4.2 + c.x * 0.013 + c.y * 0.009) * 0.9;
      if (!usePremiumSmallPickups) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        drawGlow(s.x, s.y, c.r * 4.2, colors.gold, 0.16);
        ctx.restore();
      }
      if (usePremiumSmallPickups) {
        drawPremiumPickupSprite("spiritCoin", s.x, s.y + bob, c.r * 6.2, c.r * 6.2, 0.9, Math.sin(now * 3 + c.x * 0.01) * 0.1);
      } else if (useLegacyPickupFallback) {
        ctx.fillStyle = colors.gold;
        ctx.shadowColor = colors.gold;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, c.r, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#6f4518";
        ctx.fillRect(s.x - 1, s.y - c.r * 0.6, 2, c.r * 1.2);
      }
    }
    for (const item of state.powerups) {
      const info = powerupTypes[item.type];
      const s = worldToScreen(item.x, item.y);
      if (s.x < -90 || s.x > viewW + 90 || s.y < -90 || s.y > viewH + 90) continue;
      const pulse = Math.sin(item.pulse) * 2;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.shadowColor = info.color;
      ctx.shadowBlur = 14;
      ctx.fillStyle = info.color;
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 2;
      if (usePremiumLoot) {
        const sprite = item.type === "heal" ? "healGourd" : item.type === "magnet" ? "magnetArray" : "thunderBomb";
        ctx.restore();
        drawPremiumPickupSprite(sprite, s.x, s.y - 2 + pulse * 0.25, item.r * 4.5 + pulse, item.r * 4.5 + pulse, 0.95, item.type === "magnet" ? item.pulse * 0.08 : Math.sin(item.pulse * 0.4) * 0.08);
        continue;
      } else if (!useLegacyPickupFallback) {
        ctx.restore();
        continue;
      } else if (item.type === "heal") {
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
      if (s.x < -100 || s.x > viewW + 100 || s.y < -100 || s.y > viewH + 100) continue;
      const pulse = Math.sin(chest.pulse * 5) * 2;
      if (!usePremiumLoot) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        drawGlow(s.x, s.y, 42 + pulse * 2, colors.gold, 0.2);
        ctx.restore();
      }
      if (usePremiumLoot) {
        drawPremiumPickupSprite("treasureChest", s.x, s.y - 4 + pulse * 0.25, chest.r * 4.35 + pulse * 2, chest.r * 3.65 + pulse * 2, 0.96, Math.sin(chest.pulse * 1.3) * 0.04);
      } else if (useLegacyPickupFallback) {
        ctx.shadowColor = colors.gold;
        ctx.shadowBlur = 14;
        ctx.fillStyle = "#8b5726";
        ctx.fillRect(s.x - 15 - pulse, s.y - 10 - pulse, 30 + pulse * 2, 22 + pulse * 2);
        ctx.fillStyle = colors.gold;
        ctx.fillRect(s.x - 15 - pulse, s.y - 13 - pulse, 30 + pulse * 2, 7);
        ctx.strokeStyle = "rgba(255, 232, 160, 0.8)";
        ctx.strokeRect(s.x - 15 - pulse, s.y - 13 - pulse, 30 + pulse * 2, 25 + pulse * 2);
        ctx.shadowBlur = 0;
      }
    }
  }

  function renderParticles() {
    const atlasFx = allowAtlasFx();
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const compact = Math.min(viewW, viewH) < 560;
    const dense = state.enemies.length >= SWARM_RENDER_LIMIT;
    const renderBudget = fxParticleRenderBudget();
    const screenStrikeParticleBudget = premiumScreenStrikeAtlasReady() ? (compact ? 2 : dense ? 2 : 14) : 0;
    const ultimateCastParticleBudget = premiumUltimateCastAtlasReady() ? (compact ? 1 : dense ? 2 : 6) : 0;
    const premiumHitParticleBudget = hitAtlasReady() ? (dense ? 0 : compact ? 5 : state.enemies.length > DETAIL_ENEMY_LIMIT ? 22 : 64) : 0;
    let renderedParticles = 0;
    let culledParticles = 0;
    let screenStrikeParticleDraws = 0;
    let ultimateCastParticleDraws = 0;
    let premiumHitParticleDraws = 0;
    const nowMs = performance.now();
    const tryDrawParticleStrike = (id, x, y, width, height, alpha, rotation = 0, flip = 1) => {
      if (screenStrikeParticleDraws >= screenStrikeParticleBudget) return false;
      const drew = drawScreenStrikeFrame(id, x, y, width, height, alpha, rotation, "lighter", flip);
      if (drew) screenStrikeParticleDraws += 1;
      return drew;
    };
    for (const p of state.particles) {
      const s = worldToScreen(p.x, p.y);
      const cull = p.kind === "deathSprite" ? Math.max(p.w || 0, p.h || 0, p.r * 5) * 0.55 : Math.max(86, p.r * 5.8);
      const particleCull = p.kind === "ultimateCast" ? Math.max(p.w || 0, p.h || 0, p.r * 4.4) * 0.58 : cull;
      if (s.x < -particleCull || s.x > viewW + particleCull || s.y < -particleCull || s.y > viewH + particleCull) {
        culledParticles += 1;
        continue;
      }
      if (p.kind === "ultimateCast" && ultimateCastParticleDraws >= ultimateCastParticleBudget) {
        culledParticles += 1;
        continue;
      }
      if ((p.kind === "premiumHit" || p.kind === "premiumDeath") && premiumHitParticleDraws >= premiumHitParticleBudget) {
        culledParticles += 1;
        continue;
      }
      const lowPriority = p.kind === "spark" || p.kind === "streak" || p.kind === "impact" || !p.kind;
      const budgetedPremiumFx = state.enemies.length > DETAIL_ENEMY_LIMIT && (p.kind === "premiumHit" || p.kind === "premiumDeath");
      if ((lowPriority || budgetedPremiumFx) && renderedParticles >= renderBudget) {
        culledParticles += 1;
        continue;
      }
      renderedParticles += 1;
      const alpha = clamp(p.life / p.max, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.shadowColor = p.color;
      if (p.kind === "ultimateCast") {
        const age = 1 - alpha;
        const pulse = 0.86 + Math.sin(age * Math.PI) * 0.18 + age * 0.1;
        const drawAlpha = (dense ? 0.44 : compact ? 0.5 : 0.62) * clamp(alpha * 1.35, 0, 1);
        const width = (p.w || p.r * 2.4) * pulse;
        const height = (p.h || p.r * 2.2) * pulse;
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = 0;
        const drew = drawUltimateCastFrame(p.castFrame, s.x, s.y, width, height, drawAlpha, (p.angle || 0) + age * 0.04, "lighter", p.flip || 1);
        if (drew) {
          ultimateCastParticleDraws += 1;
        }
      } else if (p.kind === "premiumHit") {
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = 18;
        const hitAlphaScale = dense ? 0.42 : compact ? 0.58 : state.enemies.length > DETAIL_ENEMY_LIMIT ? 0.66 : 1;
        const frame = p.hitFrame || hitFrameId(p.color, "impact");
        const size = p.hitFrame === "spectralSlash" ? [p.r * 3.8, p.r * 2.0] : [p.r * 3.15, p.r * 2.65];
        const strikeId = p.hitFrame === "spectralSlash" ? "jadeCrescent" : screenStrikeFrameId(p.color, "impact");
        if (ENABLE_SECONDARY_COMBAT_OVERLAYS) {
          tryDrawParticleStrike(strikeId, s.x, s.y, p.r * (p.hitFrame === "spectralSlash" ? 4.8 : 4.05), p.r * (p.hitFrame === "spectralSlash" ? 2.75 : 3.55), 0.22 * alpha, p.angle || 0);
        }
        const drewHit = drawHitFrame(frame, s.x, s.y, size[0], size[1], 0.68 * hitAlphaScale, p.angle || 0, "source-over");
        if (drewHit) {
          premiumHitParticleDraws += 1;
        }
      } else if (p.kind === "premiumDeath") {
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = 22;
        const deathAlphaScale = dense ? 0.5 : compact ? 0.68 : state.enemies.length > DETAIL_ENEMY_LIMIT ? 0.78 : 1;
        const frame = p.hitFrame || hitFrameId(p.color, "death");
        const size = p.hitFrame === "lootPop" ? [p.r * 3.4, p.r * 3.1] : [p.r * 3.0, p.r * 3.45];
        if (ENABLE_SECONDARY_COMBAT_OVERLAYS) {
          tryDrawParticleStrike(screenStrikeFrameId(p.color, "death"), s.x, s.y, p.r * 3.85, p.r * 3.55, 0.18 * alpha, (p.angle || 0) + (1 - alpha) * 0.16);
        }
        const drewHit = drawHitFrame(frame, s.x, s.y, size[0], size[1], 0.58 * deathAlphaScale, (p.angle || 0) + (1 - alpha) * 0.12, "source-over");
        if (drewHit) {
          premiumHitParticleDraws += 1;
        }
      } else if (p.kind === "blade" || p.kind === "moonBlade") {
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = p.kind === "moonBlade" ? 16 : 8;
        if (atlasFx || premiumProjectileAtlasReady()) {
          const scale = p.kind === "moonBlade" ? 1.22 : 1;
          const rotation = (p.x + p.y) * 0.013 + nowMs / 240;
          const drewAtlas = (
            premiumProjectileAtlasReady() &&
            drawPremiumProjectileFrame("moonWheelArc", s.x, s.y, p.r * 5.5 * scale, p.r * 3.25 * scale, p.kind === "moonBlade" ? 0.58 : 0.46, rotation, "source-over")
          ) || drawAtlasFrame("swordFan", s.x, s.y, p.r * 4.8 * scale, p.r * 2.65 * scale, p.kind === "moonBlade" ? 0.5 : 0.42, rotation, "source-over");
          if (drewAtlas) state.qa.premiumAtlasFxDraws += 1;
          else drawSoftParticleFallback(s.x, s.y, p.r * (p.kind === "moonBlade" ? 1.35 : 1.08), p.color, 0.1 * alpha, nowMs / 140, p.kind === "moonBlade" ? 1.45 : 1.18);
        } else {
          drawSoftParticleFallback(s.x, s.y, p.r * (p.kind === "moonBlade" ? 1.35 : 1.08), p.color, 0.1 * alpha, nowMs / 140, p.kind === "moonBlade" ? 1.45 : 1.18);
        }
      } else if (p.kind === "lightning") {
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = 24;
        const rotation = (p.x + p.y) * 0.0018 + nowMs / 980;
        if (ENABLE_SECONDARY_COMBAT_OVERLAYS) {
          tryDrawParticleStrike("lightningBurst", s.x, s.y, p.r * 4.2, p.r * 3.7, 0.2 * alpha, rotation);
        }
        const drewAtlas = (
          premiumProjectileAtlasReady() &&
          drawPremiumProjectileFrame("thunderPearl", s.x, s.y, p.r * 3.45, p.r * 2.8, 0.62, rotation, "source-over")
        ) || (atlasFx && drawAtlasFrame("thunderSigil", s.x, s.y, p.r * 2.12, p.r * 2.12, 0.62, rotation, "source-over"));
        if (drewAtlas) {
          state.qa.premiumAtlasFxDraws += 1;
        } else {
          drawSoftParticleFallback(s.x, s.y, p.r * 1.28, p.color, 0.15 * alpha, (p.x + p.y) * 0.0018, 1.15);
        }
      } else if (p.kind === "spark") {
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = 12;
        const rotation = (p.x + p.y) * 0.017 + alpha * 1.7;
        const hitFrame = hitFrameId(p.color, "spark");
        const drewHit = drawHitFrame(hitFrame, s.x, s.y, p.r * 3.45, p.r * 2.85, 0.24, rotation, "source-over");
        if (!drewHit) {
          const sparkFrame = impactAtlasFrameId(p.color);
          const drewAtlas = atlasFx && drawAtlasFrame(sparkFrame, s.x, s.y, p.r * 3.8, p.r * 2.7, 0.28, rotation, "source-over");
          if (drewAtlas) {
            state.qa.premiumAtlasFxDraws += 1;
          } else {
            drawSoftParticleFallback(s.x, s.y, p.r * 1.08, p.color, 0.13 * alpha, rotation, 1.15);
          }
        }
      } else if (p.kind === "impact") {
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = 14;
        const rotation = (p.x + p.y) * 0.002 + nowMs / 1500;
        const hitFrame = hitFrameId(p.color, "impact");
        if (ENABLE_SECONDARY_COMBAT_OVERLAYS && (!dense || p.r >= 6)) tryDrawParticleStrike(screenStrikeFrameId(p.color, "impact"), s.x, s.y, p.r * 3.25, p.r * 2.9, 0.15 * alpha, rotation);
        const drewHit = drawHitFrame(hitFrame, s.x, s.y, p.r * 2.72, p.r * 2.46, 0.34, rotation, "source-over");
        if (!drewHit) {
          const impactFrame = impactAtlasFrameId(p.color);
          const drewAtlas = atlasFx && drawAtlasFrame(impactFrame, s.x, s.y, p.r * 2.7, p.r * 2.2, 0.36, rotation, "source-over");
          if (drewAtlas) {
            state.qa.premiumAtlasFxDraws += 1;
          } else {
            drawSoftParticleFallback(s.x, s.y, p.r * 1.16, p.color, 0.13 * alpha, rotation, 1.05);
          }
        }
      } else if (p.kind === "slash") {
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = 18;
        if (ENABLE_SECONDARY_COMBAT_OVERLAYS) {
          tryDrawParticleStrike("jadeCrescent", s.x, s.y, p.r * 4.6, p.r * 2.55, 0.26 * alpha, p.angle || 0);
        }
        const drewHit = drawHitFrame("spectralSlash", s.x, s.y, p.r * 3.75, p.r * 1.95, 0.42, p.angle || 0, "source-over");
        if (!drewHit) {
          const drewAtlas = atlasFx && drawAtlasFrame("swordFan", s.x, s.y, p.r * 3.4, p.r * 1.75, 0.5, p.angle || 0, "source-over");
          if (drewAtlas) {
            state.qa.premiumAtlasFxDraws += 1;
          } else {
            drawSoftParticleFallback(s.x, s.y, p.r * 1.18, p.color, 0.13 * alpha, p.angle || 0, 1.8);
          }
        }
      } else if (p.kind === "deathSprite") {
        const fade = 1 - alpha;
        const scale = 1 + fade * 0.32;
        ctx.globalCompositeOperation = "source-over";
        if (p.premiumSprite) {
          drawPremiumCreatureSprite(p.premiumSprite, s.x, s.y - fade * p.r * 0.82, p.w * scale, p.h * scale, alpha * 0.68, (p.rot || 0) + fade * 0.06, 1);
        } else if (p.premiumHordeSprite) {
          drawPremiumHordeSprite(p.premiumHordeSprite, s.x, s.y - fade * p.r * 0.72, p.w * scale, p.h * scale, alpha * 0.64, (p.rot || 0) + fade * 0.08, p.flip || 1);
        } else if (p.premiumMinionSprite) {
          drawPremiumMinionSprite(p.premiumMinionSprite, s.x, s.y - fade * p.r * 0.72, p.w * scale, p.h * scale, alpha * 0.62, (p.rot || 0) + fade * 0.08, p.flip || 1);
        } else {
          drawCreatureSprite(p.sprite, s.x, s.y - fade * p.r * 0.72, p.w * scale, p.h * scale, alpha * 0.62, (p.rot || 0) + fade * 0.08, p.flip || 1);
        }
        if (!p.premiumSprite && !p.premiumHordeSprite && !p.premiumMinionSprite) {
          ctx.globalCompositeOperation = "lighter";
          drawGlow(s.x, s.y, p.r * (2.2 + fade * 1.4), p.color, 0.12 * alpha);
        }
      } else if (p.kind === "streak") {
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = 12;
        const streakAngle = Math.atan2(p.vy || 0, p.vx || 1);
        const drewHit = drawHitFrame(hitFrameId(p.color, "spark"), s.x, s.y, Math.max(10, p.r * 3.8), Math.max(7, p.r * 2.2), 0.16, streakAngle, "source-over");
        if (!drewHit) {
          const streakFrame = impactAtlasFrameId(p.color);
          const drewAtlas = atlasFx && drawAtlasFrame(streakFrame, s.x, s.y, Math.max(10, p.r * 4.4), Math.max(6, p.r * 2.2), 0.2, streakAngle, "source-over");
          if (drewAtlas) {
            state.qa.premiumAtlasFxDraws += 1;
          } else {
            drawSoftParticleFallback(s.x, s.y, p.r * 0.9, p.color, 0.1 * alpha, streakAngle, 1.7);
          }
        }
      } else {
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowBlur = 10;
        const rotation = (p.x + p.y) * 0.001 + nowMs / 1300;
        const drewHit = drawHitFrame(hitFrameId(p.color, "impact"), s.x, s.y, p.r * 2.2, p.r * 1.95, 0.14, rotation, "source-over");
        if (!drewHit) {
          const fallbackFrame = impactAtlasFrameId(p.color);
          const drewAtlas = atlasFx && drawAtlasFrame(fallbackFrame, s.x, s.y, p.r * 2.4, p.r * 2.0, 0.18, rotation, "source-over");
          if (drewAtlas) {
            state.qa.premiumAtlasFxDraws += 1;
          } else {
            drawSoftParticleFallback(s.x, s.y, p.r * 0.92, p.color, 0.09 * alpha, rotation, 1.05);
          }
        }
      }
      ctx.restore();
    }
    if (QA_MODE) {
      state.qa.particlesRendered = renderedParticles;
      state.qa.particlesCulled = culledParticles;
    }
  }

  function renderTexts() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const compact = Math.min(viewW, viewH) < 560;
    const damageRenderLimit = state.enemies.length >= SWARM_RENDER_LIMIT ? (compact ? 16 : 24) : (compact ? 34 : 58);
    let damageRendered = 0;
    for (const t of state.texts) {
      const s = worldToScreen(t.x, t.y);
      if (s.x < -60 || s.x > viewW + 60 || s.y < -60 || s.y > viewH + 60) continue;
      const isDamage = t.kind === "damage";
      if (isDamage && damageRendered >= damageRenderLimit) continue;
      if (isDamage) damageRendered += 1;
      const fade = clamp(t.life / t.max, 0, 1);
      const pop = isDamage ? 0.92 + Math.sin((1 - fade) * Math.PI) * (t.critical ? 0.18 : 0.08) : 1;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.scale(pop, pop);
      ctx.globalAlpha = isDamage ? Math.min(0.9, fade * 0.92) : fade;
      ctx.font = `${isDamage ? 800 : 700} ${t.size}px "Microsoft YaHei", sans-serif`;
      ctx.lineWidth = isDamage ? (t.critical ? 3.4 : 2.4) : 2.2;
      ctx.strokeStyle = isDamage ? "rgba(7, 9, 12, 0.82)" : "rgba(0, 0, 0, 0.72)";
      ctx.strokeText(t.text, 0, 0);
      const fill = isDamage ? ctx.createLinearGradient(0, -t.size * 0.6, 0, t.size * 0.65) : null;
      if (fill) {
        fill.addColorStop(0, t.critical ? "#fff8d0" : "#f9fff4");
        fill.addColorStop(0.52, t.color);
        fill.addColorStop(1, colorAlpha(t.color, 0.72));
        ctx.fillStyle = fill;
      } else {
        ctx.fillStyle = t.color;
      }
      ctx.fillText(t.text, 0, 0);
      ctx.restore();
    }
  }

  function renderVignette() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.72);
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(0.62, "rgba(16, 20, 24, 0.12)");
    vignette.addColorStop(1, "rgba(2, 3, 8, 0.54)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
    const top = ctx.createLinearGradient(0, 0, 0, h);
    top.addColorStop(0, "rgba(124,215,175,0.055)");
    top.addColorStop(0.42, "rgba(124,215,175,0)");
    top.addColorStop(1, "rgba(168,140,255,0.035)");
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, w, h);
  }

  function loop(now) {
    const frameStart = performance.now();
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
    const workMs = performance.now() - frameStart;
    state.perf.workFrames += 1;
    state.perf.totalWorkMs += workMs;
    state.perf.maxWorkMs = Math.max(state.perf.maxWorkMs, workMs);
    updateRenderLoad(workMs);
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

  function setupQaMinionGallery() {
    const p = state.player;
    if (!p) return;
    p.weapons = {};
    p.passives = {};
    applyStats(false);
    p.hp = p.maxHp;
    state.elapsed = 180;
    state.enemies = [];
    state.enemyGrid.clear();
    state.projectiles = [];
    state.enemyProjectiles = [];
    state.areas = [];
    state.particles = [];
    state.gems = [];
    state.coins = [];
    state.powerups = [];
    const ids = ["imp", "wolf", "wisp", "bug", "stone", "summoner"];
    const positions = [
      [-210, -96],
      [0, -122],
      [214, -94],
      [-210, 116],
      [0, 132],
      [214, 118]
    ];
    ids.forEach((id, i) => {
      const type = enemyTypes.find((candidate) => candidate.id === id);
      if (!type) return;
      spawnEnemy(false, type);
      const e = state.enemies[state.enemies.length - 1];
      if (!e) return;
      e.x = p.x + positions[i][0];
      e.y = p.y + positions[i][1];
      e.hp = type.hp * 20;
      e.maxHp = e.hp;
      e.speed = 0;
      e.damage = 0;
      e.vx = 0;
      e.vy = 0;
      e.attackTimer = 9999;
      e.summonTimer = 9999;
    });
    rebuildEnemyGrid();
    updateHud();
    updateQaDataset();
    render();
  }

  function setupQaLootGallery() {
    const p = state.player;
    if (!p) return;
    p.weapons = {};
    p.passives = {};
    applyStats(false);
    p.hp = p.maxHp;
    state.elapsed = 90;
    state.enemies = [];
    state.enemyGrid.clear();
    state.projectiles = [];
    state.enemyProjectiles = [];
    state.areas = [];
    state.particles = [];
    state.gems = [];
    state.coins = [];
    state.powerups = [];
    state.chests = [];
    state.gems.push({ x: p.x - 260, y: p.y - 90, value: 24, r: 7, color: colors.blue, vx: 0, vy: 0 });
    state.coins.push({ x: p.x - 150, y: p.y - 88, value: 12, r: 6, vx: 0, vy: 0 });
    state.chests.push({ x: p.x, y: p.y - 112, r: 17, pulse: 0 });
    state.powerups.push({ x: p.x + 150, y: p.y - 88, type: "heal", r: 12, vx: 0, vy: 0, pulse: 1.2 });
    state.powerups.push({ x: p.x + 260, y: p.y - 90, type: "magnet", r: 12, vx: 0, vy: 0, pulse: 2.4 });
    state.powerups.push({ x: p.x, y: p.y + 178, type: "bomb", r: 12, vx: 0, vy: 0, pulse: 3.1 });
    updateHud();
    updateQaDataset();
    render();
  }

  function startQaMode() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("qa");
    if (!mode) return;
    state.qa.mode = mode;
    state.qa.autoChoices = mode === "soak" || mode === "powerups" || mode === "evolution" || mode === "stress";
    state.qa.autoMove = mode === "soak";
    state.qa.timeScale = mode === "soak" ? clamp(Number(params.get("speed")) || 40, 1, 80) : 1;
    state.qa.maxSteps = mode === "soak" ? clamp(Math.ceil(state.qa.timeScale), 1, 80) : 1;
    state.qa.syncSteps = 0;
    state.qa.syncMs = 0;
    state.qa.visualDone = false;
    startRun(params.get("character") || "sword");
    if (mode === "levelup") {
      state.pendingLevels = 1;
      openLevelUp();
      updateQaDataset();
      return;
    }
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
    if (mode === "minions") {
      setupQaMinionGallery();
      return;
    }
    if (mode === "loot") {
      setupQaLootGallery();
      return;
    }
    grantQaBuild();
    if (mode === "boss") {
      state.elapsed = RUN_DURATION - 59;
      state.bossSpawned = true;
      spawnEnemy(true, bossType);
      const boss = state.enemies.find((e) => e.boss);
      if (boss) {
        boss.x = state.player.x + 230;
        boss.y = state.player.y - 20;
        boss.hp = 900000;
        boss.maxHp = 900000;
        boss.speed *= 0.35;
        boss.damage = 0;
      }
      updateHud();
      updateQaDataset();
      return;
    }
    if (mode === "powerups") {
      const p = state.player;
      p.hp = Math.max(1, Math.floor(p.maxHp * 0.45));
      state.enemies = [];
      state.enemyGrid.clear();
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
      rebuildEnemyGrid();
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
      for (let i = 0; i < 15 && state.screen === "playing"; i++) update(1 / 30);
      state.qa.syncRunning = false;
      state.qa.syncMs = Date.now() - started;
      for (let i = 0; i < 52; i++) spawnEnemy(false);
      updateHud();
      render();
      return;
    }
    if (mode === "stress") {
      grantQaEvolvedBuild();
      state.elapsed = RUN_DURATION - 190;
      state.enemies = [];
      state.enemyGrid.clear();
      const p = state.player;
      p.maxHp = 9999;
      p.hp = p.maxHp;
      for (let i = 0; i < 460; i++) {
        spawnEnemy(i % 55 === 0);
        const e = state.enemies[state.enemies.length - 1];
        if (!e) continue;
        const a = (i * 2.399963) % TAU;
        const band = 170 + (i % 12) * 48;
        e.x = p.x + Math.cos(a) * band + rand(-24, 24);
        e.y = p.y + Math.sin(a) * band * 0.78 + rand(-24, 24);
        e.hp *= 280;
        e.maxHp *= 280;
        e.speed *= 0.42;
        e.damage = 0;
      }
      const started = Date.now();
      state.qa.syncRunning = true;
      for (let i = 0; i < 2 && state.screen === "playing"; i++) update(1 / 30);
      state.qa.syncRunning = false;
      state.qa.syncMs = Date.now() - started;
      updateHud();
      updateQaDataset();
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
          particleKinds: state.particles.reduce((counts, p) => {
            const key = p.kind || "unknown";
            counts[key] = (counts[key] || 0) + 1;
            return counts;
          }, {}),
          runCoins: state.runCoins,
          kills: state.kills,
          visuals: {
            atmosphereReady: atmosphereAtlasReady(),
            atmosphereDraws: state.qa.atmosphereDraws || 0,
            swarmPressureReady: premiumSwarmPressureAtlasReady(),
            swarmPressureDraws: state.qa.swarmPressureDraws || 0,
            swarmClusterDraws: state.qa.swarmClusterDraws || 0,
            swarmClusteredEnemies: state.qa.swarmClusteredEnemies || 0,
            heroFxReady: premiumHeroFxAtlasReady(),
            heroFxDraws: state.qa.heroFxDraws || 0,
            screenStrikeReady: premiumScreenStrikeAtlasReady(),
            screenStrikeDraws: state.qa.screenStrikeDraws || 0,
            ultimateCastReady: premiumUltimateCastAtlasReady(),
            ultimateCastDraws: state.qa.ultimateCastDraws || 0,
            areaEventReady: premiumAreaEventAtlasReady(),
            areaEventDraws: state.qa.areaEventDraws || 0,
            unitAuraReady: premiumUnitAuraAtlasReady(),
            unitAuraDraws: state.qa.unitAuraDraws || 0,
            areaFxDraws: state.qa.areaFxDraws || 0,
            hitReady: hitAtlasReady(),
            hitDraws: state.qa.hitAtlasDraws || 0,
            threatReady: threatAtlasReady(),
            threatDraws: state.qa.threatDraws || 0,
            projectileReady: premiumProjectileAtlasReady(),
            projectileSpriteDraws: state.qa.projectileSpriteDraws || 0,
            projectilesSkipped: state.qa.projectilesSkipped || 0,
            projectileRenderBudget: state.qa.projectileRenderBudget || 0,
            motionTrailReady: premiumMotionTrailAtlasReady(),
            motionTrailDraws: state.qa.motionTrailDraws || 0,
            motionTrailRenderBudget: state.qa.motionTrailRenderBudget || 0,
            hostileProjectileReady: hostileProjectileAtlasReady(),
            hostileProjectileDraws: state.qa.hostileProjectileDraws || 0,
            hostileProjectilesSkipped: state.qa.hostileProjectilesSkipped || 0,
            hostileProjectileRenderBudget: state.qa.hostileProjectileRenderBudget || 0,
            hordeReady: premiumHordeAtlasReady(),
            hordeSpriteDraws: state.qa.hordeSpriteDraws || 0,
            hordeSpritesSkipped: state.qa.hordeSpritesSkipped || 0,
            hordeRenderBudget: state.qa.hordeRenderBudget || 0,
            hordeBudgetUsed: state.qa.hordeBudgetUsed || 0,
            particlesRendered: state.qa.particlesRendered || 0,
            particlesCulled: state.qa.particlesCulled || 0,
            particleLimit: fxParticleLimit(),
            particleRenderBudget: fxParticleRenderBudget(),
            legacyWorldOverlays: state.qa.legacyWorldOverlays || 0,
            legacyVectorOverlays: state.qa.legacyVectorOverlays || 0,
            legacyAreaFallbackDraws: state.qa.legacyAreaFallbackDraws || 0,
            legacyFallbackFx: state.qa.legacyFallbackFx || 0,
            legacyCombatAtlasDraws: state.qa.legacyCombatAtlasDraws || 0,
            premiumAtlasFxDraws: state.qa.premiumAtlasFxDraws || 0,
            renderDpr: state.qa.renderDpr || 1,
            renderPressure: renderLoadPressure(),
            renderBudgetScale: renderBudgetScale()
          },
          perf: {
            frames: state.perf.frames,
            workFrames: state.perf.workFrames,
            avgWorkMs: state.perf.workFrames ? state.perf.totalWorkMs / state.perf.workFrames : 0,
            maxWorkMs: state.perf.maxWorkMs
          },
          player: state.player ? {
            hp: state.player.hp,
            maxHp: state.player.maxHp,
            level: state.player.level,
            weapons: Object.fromEntries(Object.entries(state.player.weapons).map(([id, owned]) => [id, owned.level])),
            passives: Object.fromEntries(Object.entries(state.player.passives).map(([id, owned]) => [id, owned.level]))
          } : null
        };
      },
      resetPerf() {
        state.perf = { frames: 0, totalDt: 0, maxDt: 0, workFrames: 0, totalWorkMs: 0, maxWorkMs: 0 };
        state.qa.groundDecalDraws = 0;
        state.qa.areaEventDraws = 0;
        state.qa.areaFxDraws = 0;
        state.qa.environmentPropDraws = 0;
        state.qa.atmosphereDraws = 0;
        state.qa.swarmPressureDraws = 0;
        state.qa.swarmClusterDraws = 0;
        state.qa.swarmClusteredEnemies = 0;
        state.qa.heroFxDraws = 0;
        state.qa.screenStrikeDraws = 0;
        state.qa.ultimateCastDraws = 0;
        state.qa.unitAuraDraws = 0;
        state.qa.hitAtlasDraws = 0;
        state.qa.threatDraws = 0;
        state.qa.hordeSpriteDraws = 0;
        state.qa.hordeSpritesSkipped = 0;
        state.qa.hordeRenderBudget = 0;
        state.qa.hordeBudgetUsed = 0;
        state.qa.projectileSpriteDraws = 0;
        state.qa.projectilesSkipped = 0;
        state.qa.projectileRenderBudget = 0;
        state.qa.motionTrailDraws = 0;
        state.qa.motionTrailRenderBudget = 0;
        state.qa.hostileProjectileDraws = 0;
        state.qa.hostileProjectilesSkipped = 0;
        state.qa.hostileProjectileRenderBudget = 0;
        state.qa.particlesRendered = 0;
        state.qa.particlesCulled = 0;
        state.qa.swarmImpostorDraws = 0;
        state.qa.legacyWorldOverlays = 0;
        state.qa.legacyVectorOverlays = 0;
        state.qa.legacyAreaFallbackDraws = 0;
        state.qa.legacyFallbackFx = 0;
        state.qa.legacyCombatAtlasDraws = 0;
        state.qa.premiumAtlasFxDraws = 0;
        state.quality.pressure = 0;
        state.quality.avgWorkMs = 0;
        updateQaDataset();
        return true;
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
