import { Frog } from '../entities/Enemy.js';

// ── CONSTANTS ───────────────────────────────────────────────────────────────
const MOVE_SPEED       = 250;
const JUMP_VEL         = -600;
const COYOTE_MS        = 150;   // grace window after leaving a platform edge
const COINS_TO_CONVERT = 15;    // coins required for one companion energy star

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });

    this.player            = null;
    this.groundLayer       = null;
    this.platformsGroup    = null;
    this.cursors           = null;
    this.wasd              = null;
    this.coyoteTimer       = 0;
    this.debugText         = null;
    this.keyG              = null;
    this.bgLayers          = [];

    this.attackZone        = null;
    this.attackState       = 'ready';
    this.attackIsKick      = false;
    this.keyJ              = null;
    this.keyK              = null;

    this.playerLives       = 3;
    this.coinCount         = 0;
    this.gemCount          = 0;
    this.keysCollected     = 0;
    this.totalKeys         = 0;
    this.levelComplete     = false;
    this.isInvincible      = false;
    this.isOnLadder        = false;
    this.doorCooldown      = false;

    this.blockGroup        = null;
    this.hazardGroup       = null;
    this.ladderGroup       = null;
    this.doorGroup         = null;
    this.collectiblesGroup = null;

    this.hudHearts          = [];
    this.hudCoinsText       = null;
    this.hudGemsText        = null;
    this.hudKeysText        = null;
    this.hudHeartBlink      = null;
    this.vignetteGfx        = null;
    this.hudCompanionHearts = [];
    this.hudStars           = [];
    this.starGlowTween      = null;

    this.isDead = false;

    this.companion               = null;
    this.companionIdleTime       = 0;
    this.companionIsFront        = false;
    this.companionLives          = 3;
    this.hudCompanionIcon        = null;
    this.companionStars          = 1;
    this.conversionAvailable     = false;
    this.companionReady          = false;
    this.companionOperating      = false;
    this.conversionPopupOpen     = false;
    this.conversionPending       = false;
    this.lastConversionThreshold = 0;
    this.conversionBannerObjs    = [];
    this.readyBannerObjs         = [];

    this.enemies = [];

    // ── Companion controls ─────────────────────────────────────────────────
    // MODE A (default): player controlled, companion follows
    // MODE B: companion controlled via cursors/wasd, player frozen
    // TAB switches modes — only when companionReady = true
    this.companionControlMode  = false;
    this.tabKey                = null;
    this.companionWASD         = null;
    this.modeIndicator         = null;
    this.companionSpeed        = 200;
    this.companionWalkTimer    = 0;
    this.companionEnergyTimer  = 0;
    this.COMPANION_STAR_DURATION = 180000;  // 3 minutes in ms
    this.mapFragmentFound      = false;
    this.lockUsed              = false;
    this.lockGroup             = null;
    this.lockHintCooldown      = false;
    this.sableTipShown         = false;
    this.helpPanelOpen         = false;
    this.helpElements          = [];
  }

  // ── PRELOAD ───────────────────────────────────────────────────────────────
  preload() {
    // ── Background layers — all 256×256px, tiled horizontally ──
    this.load.image('background_solid_sky',   'assets/backgrounds/background_solid_sky.png');
    this.load.image('background_clouds',      'assets/backgrounds/background_clouds.png');
    this.load.image('background_fade_hills',  'assets/backgrounds/background_fade_hills.png');
    this.load.image('background_color_hills', 'assets/backgrounds/background_color_hills.png');
    this.load.image('background_fade_trees',  'assets/backgrounds/background_fade_trees.png');
    this.load.image('background_color_trees', 'assets/backgrounds/background_color_trees.png');
    this.load.image('background_solid_grass', 'assets/backgrounds/background_solid_grass.png');

    // ── Level JSON ──────────────────────────────────────────────────────────
    this.load.json('level1', 'assets/tilemaps/level1.json');

    // ── Player spritesheet — femaleAdventurer, 96×128 px per frame ──
    this.load.spritesheet('player',
      'assets/sprites/character/Tilesheet/character_femaleAdventurer_sheet.png',
      { frameWidth: 96, frameHeight: 128 }
    );

    // ── Tile images — 64×64 px each ──
    this.load.image('block_blue', 'assets/sprites/tiles/block_blue.png');
    this.load.image('block_coin', 'assets/sprites/tiles/block_coin.png');
    this.load.image('block_coin_active', 'assets/sprites/tiles/block_coin_active.png');
    this.load.image('block_empty', 'assets/sprites/tiles/block_empty.png');
    this.load.image('block_empty_warning', 'assets/sprites/tiles/block_empty_warning.png');
    this.load.image('block_exclamation', 'assets/sprites/tiles/block_exclamation.png');
    this.load.image('block_exclamation_active', 'assets/sprites/tiles/block_exclamation_active.png');
    this.load.image('block_green', 'assets/sprites/tiles/block_green.png');
    this.load.image('block_plank', 'assets/sprites/tiles/block_plank.png');
    this.load.image('block_planks', 'assets/sprites/tiles/block_planks.png');
    this.load.image('block_red', 'assets/sprites/tiles/block_red.png');
    this.load.image('block_spikes', 'assets/sprites/tiles/block_spikes.png');
    this.load.image('block_strong_coin', 'assets/sprites/tiles/block_strong_coin.png');
    this.load.image('block_strong_coin_active', 'assets/sprites/tiles/block_strong_coin_active.png');
    this.load.image('block_strong_danger', 'assets/sprites/tiles/block_strong_danger.png');
    this.load.image('block_strong_danger_active', 'assets/sprites/tiles/block_strong_danger_active.png');
    this.load.image('block_strong_empty', 'assets/sprites/tiles/block_strong_empty.png');
    this.load.image('block_strong_empty_active', 'assets/sprites/tiles/block_strong_empty_active.png');
    this.load.image('block_strong_exclamation', 'assets/sprites/tiles/block_strong_exclamation.png');
    this.load.image('block_strong_exclamation_active', 'assets/sprites/tiles/block_strong_exclamation_active.png');
    this.load.image('block_yellow', 'assets/sprites/tiles/block_yellow.png');
    this.load.image('bomb', 'assets/sprites/tiles/bomb.png');
    this.load.image('bomb_active', 'assets/sprites/tiles/bomb_active.png');
    this.load.image('brick_brown', 'assets/sprites/tiles/brick_brown.png');
    this.load.image('brick_brown_diagonal', 'assets/sprites/tiles/brick_brown_diagonal.png');
    this.load.image('brick_grey', 'assets/sprites/tiles/brick_grey.png');
    this.load.image('brick_grey_diagonal', 'assets/sprites/tiles/brick_grey_diagonal.png');
    this.load.image('bricks_brown', 'assets/sprites/tiles/bricks_brown.png');
    this.load.image('bricks_grey', 'assets/sprites/tiles/bricks_grey.png');
    this.load.image('bridge', 'assets/sprites/tiles/bridge.png');
    this.load.image('bridge_logs', 'assets/sprites/tiles/bridge_logs.png');
    this.load.image('bush', 'assets/sprites/tiles/bush.png');
    this.load.image('cactus', 'assets/sprites/tiles/cactus.png');
    this.load.image('chain', 'assets/sprites/tiles/chain.png');
    this.load.image('coin_bronze', 'assets/sprites/tiles/coin_bronze.png');
    this.load.image('coin_bronze_side', 'assets/sprites/tiles/coin_bronze_side.png');
    this.load.image('coin_gold', 'assets/sprites/tiles/coin_gold.png');
    this.load.image('coin_gold_side', 'assets/sprites/tiles/coin_gold_side.png');
    this.load.image('coin_silver', 'assets/sprites/tiles/coin_silver.png');
    this.load.image('coin_silver_side', 'assets/sprites/tiles/coin_silver_side.png');
    this.load.image('conveyor', 'assets/sprites/tiles/conveyor.png');
    this.load.image('door_closed', 'assets/sprites/tiles/door_closed.png');
    this.load.image('door_closed_top', 'assets/sprites/tiles/door_closed_top.png');
    this.load.image('door_open', 'assets/sprites/tiles/door_open.png');
    this.load.image('door_open_top', 'assets/sprites/tiles/door_open_top.png');
    this.load.image('fence', 'assets/sprites/tiles/fence.png');
    this.load.image('fence_broken', 'assets/sprites/tiles/fence_broken.png');
    this.load.image('fireball', 'assets/sprites/tiles/fireball.png');
    this.load.image('flag_blue_a', 'assets/sprites/tiles/flag_blue_a.png');
    this.load.image('flag_blue_b', 'assets/sprites/tiles/flag_blue_b.png');
    this.load.image('flag_green_a', 'assets/sprites/tiles/flag_green_a.png');
    this.load.image('flag_green_b', 'assets/sprites/tiles/flag_green_b.png');
    this.load.image('flag_off', 'assets/sprites/tiles/flag_off.png');
    this.load.image('flag_red_a', 'assets/sprites/tiles/flag_red_a.png');
    this.load.image('flag_red_b', 'assets/sprites/tiles/flag_red_b.png');
    this.load.image('flag_yellow_a', 'assets/sprites/tiles/flag_yellow_a.png');
    this.load.image('flag_yellow_b', 'assets/sprites/tiles/flag_yellow_b.png');
    this.load.image('gem_blue', 'assets/sprites/tiles/gem_blue.png');
    this.load.image('gem_green', 'assets/sprites/tiles/gem_green.png');
    this.load.image('gem_red', 'assets/sprites/tiles/gem_red.png');
    this.load.image('gem_yellow', 'assets/sprites/tiles/gem_yellow.png');
    this.load.image('grass', 'assets/sprites/tiles/grass.png');
    this.load.image('grass_purple', 'assets/sprites/tiles/grass_purple.png');
    this.load.image('heart', 'assets/sprites/tiles/heart.png');
    this.load.image('hill', 'assets/sprites/tiles/hill.png');
    this.load.image('hill_top', 'assets/sprites/tiles/hill_top.png');
    this.load.image('hill_top_smile', 'assets/sprites/tiles/hill_top_smile.png');
    this.load.image('hud_character_0', 'assets/sprites/tiles/hud_character_0.png');
    this.load.image('hud_character_1', 'assets/sprites/tiles/hud_character_1.png');
    this.load.image('hud_character_2', 'assets/sprites/tiles/hud_character_2.png');
    this.load.image('hud_character_3', 'assets/sprites/tiles/hud_character_3.png');
    this.load.image('hud_character_4', 'assets/sprites/tiles/hud_character_4.png');
    this.load.image('hud_character_5', 'assets/sprites/tiles/hud_character_5.png');
    this.load.image('hud_character_6', 'assets/sprites/tiles/hud_character_6.png');
    this.load.image('hud_character_7', 'assets/sprites/tiles/hud_character_7.png');
    this.load.image('hud_character_8', 'assets/sprites/tiles/hud_character_8.png');
    this.load.image('hud_character_9', 'assets/sprites/tiles/hud_character_9.png');
    this.load.image('hud_character_multiply', 'assets/sprites/tiles/hud_character_multiply.png');
    this.load.image('hud_character_percent', 'assets/sprites/tiles/hud_character_percent.png');
    this.load.image('hud_coin', 'assets/sprites/tiles/hud_coin.png');
    this.load.image('hud_heart', 'assets/sprites/tiles/hud_heart.png');
    this.load.image('hud_heart_empty', 'assets/sprites/tiles/hud_heart_empty.png');
    this.load.image('hud_heart_half', 'assets/sprites/tiles/hud_heart_half.png');
    this.load.image('hud_key_blue', 'assets/sprites/tiles/hud_key_blue.png');
    this.load.image('hud_key_green', 'assets/sprites/tiles/hud_key_green.png');
    this.load.image('hud_key_red', 'assets/sprites/tiles/hud_key_red.png');
    this.load.image('hud_key_yellow', 'assets/sprites/tiles/hud_key_yellow.png');
    this.load.image('hud_player_beige', 'assets/sprites/tiles/hud_player_beige.png');
    this.load.image('hud_player_green', 'assets/sprites/tiles/hud_player_green.png');
    this.load.image('hud_player_helmet_beige', 'assets/sprites/tiles/hud_player_helmet_beige.png');
    this.load.image('hud_player_helmet_green', 'assets/sprites/tiles/hud_player_helmet_green.png');
    this.load.image('hud_player_helmet_pink', 'assets/sprites/tiles/hud_player_helmet_pink.png');
    this.load.image('hud_player_helmet_purple', 'assets/sprites/tiles/hud_player_helmet_purple.png');
    this.load.image('hud_player_helmet_yellow', 'assets/sprites/tiles/hud_player_helmet_yellow.png');
    this.load.image('hud_player_pink', 'assets/sprites/tiles/hud_player_pink.png');
    this.load.image('hud_player_purple', 'assets/sprites/tiles/hud_player_purple.png');
    this.load.image('hud_player_yellow', 'assets/sprites/tiles/hud_player_yellow.png');
    this.load.image('key_blue', 'assets/sprites/tiles/key_blue.png');
    this.load.image('key_green', 'assets/sprites/tiles/key_green.png');
    this.load.image('key_red', 'assets/sprites/tiles/key_red.png');
    this.load.image('key_yellow', 'assets/sprites/tiles/key_yellow.png');
    this.load.image('ladder_bottom', 'assets/sprites/tiles/ladder_bottom.png');
    this.load.image('ladder_middle', 'assets/sprites/tiles/ladder_middle.png');
    this.load.image('ladder_top', 'assets/sprites/tiles/ladder_top.png');
    this.load.image('lava', 'assets/sprites/tiles/lava.png');
    this.load.image('lava_top', 'assets/sprites/tiles/lava_top.png');
    this.load.image('lava_top_low', 'assets/sprites/tiles/lava_top_low.png');
    this.load.image('lever', 'assets/sprites/tiles/lever.png');
    this.load.image('lever_left', 'assets/sprites/tiles/lever_left.png');
    this.load.image('lever_right', 'assets/sprites/tiles/lever_right.png');
    this.load.image('lock_blue', 'assets/sprites/tiles/lock_blue.png');
    this.load.image('lock_green', 'assets/sprites/tiles/lock_green.png');
    this.load.image('lock_red', 'assets/sprites/tiles/lock_red.png');
    this.load.image('lock_yellow', 'assets/sprites/tiles/lock_yellow.png');
    this.load.image('mushroom_brown', 'assets/sprites/tiles/mushroom_brown.png');
    this.load.image('mushroom_red', 'assets/sprites/tiles/mushroom_red.png');
    this.load.image('ramp', 'assets/sprites/tiles/ramp.png');
    this.load.image('rock', 'assets/sprites/tiles/rock.png');
    this.load.image('rop_attached', 'assets/sprites/tiles/rop_attached.png');
    this.load.image('rope', 'assets/sprites/tiles/rope.png');
    this.load.image('saw', 'assets/sprites/tiles/saw.png');
    this.load.image('sign', 'assets/sprites/tiles/sign.png');
    this.load.image('sign_exit', 'assets/sprites/tiles/sign_exit.png');
    this.load.image('sign_left', 'assets/sprites/tiles/sign_left.png');
    this.load.image('sign_right', 'assets/sprites/tiles/sign_right.png');
    this.load.image('snow', 'assets/sprites/tiles/snow.png');
    this.load.image('spikes', 'assets/sprites/tiles/spikes.png');
    this.load.image('spring', 'assets/sprites/tiles/spring.png');
    this.load.image('spring_out', 'assets/sprites/tiles/spring_out.png');
    this.load.image('star', 'assets/sprites/tiles/star.png');
    this.load.image('switch_blue', 'assets/sprites/tiles/switch_blue.png');
    this.load.image('switch_blue_pressed', 'assets/sprites/tiles/switch_blue_pressed.png');
    this.load.image('switch_green', 'assets/sprites/tiles/switch_green.png');
    this.load.image('switch_green_pressed', 'assets/sprites/tiles/switch_green_pressed.png');
    this.load.image('switch_red', 'assets/sprites/tiles/switch_red.png');
    this.load.image('switch_red_pressed', 'assets/sprites/tiles/switch_red_pressed.png');
    this.load.image('switch_yellow', 'assets/sprites/tiles/switch_yellow.png');
    this.load.image('switch_yellow_pressed', 'assets/sprites/tiles/switch_yellow_pressed.png');
    this.load.image('terrain_dirt_block', 'assets/sprites/tiles/terrain_dirt_block.png');
    this.load.image('terrain_dirt_block_bottom', 'assets/sprites/tiles/terrain_dirt_block_bottom.png');
    this.load.image('terrain_dirt_block_bottom_left', 'assets/sprites/tiles/terrain_dirt_block_bottom_left.png');
    this.load.image('terrain_dirt_block_bottom_right', 'assets/sprites/tiles/terrain_dirt_block_bottom_right.png');
    this.load.image('terrain_dirt_block_center', 'assets/sprites/tiles/terrain_dirt_block_center.png');
    this.load.image('terrain_dirt_block_left', 'assets/sprites/tiles/terrain_dirt_block_left.png');
    this.load.image('terrain_dirt_block_right', 'assets/sprites/tiles/terrain_dirt_block_right.png');
    this.load.image('terrain_dirt_block_top', 'assets/sprites/tiles/terrain_dirt_block_top.png');
    this.load.image('terrain_dirt_block_top_left', 'assets/sprites/tiles/terrain_dirt_block_top_left.png');
    this.load.image('terrain_dirt_block_top_right', 'assets/sprites/tiles/terrain_dirt_block_top_right.png');
    this.load.image('terrain_dirt_cloud', 'assets/sprites/tiles/terrain_dirt_cloud.png');
    this.load.image('terrain_dirt_cloud_background', 'assets/sprites/tiles/terrain_dirt_cloud_background.png');
    this.load.image('terrain_dirt_cloud_left', 'assets/sprites/tiles/terrain_dirt_cloud_left.png');
    this.load.image('terrain_dirt_cloud_middle', 'assets/sprites/tiles/terrain_dirt_cloud_middle.png');
    this.load.image('terrain_dirt_cloud_right', 'assets/sprites/tiles/terrain_dirt_cloud_right.png');
    this.load.image('terrain_dirt_horizontal_left', 'assets/sprites/tiles/terrain_dirt_horizontal_left.png');
    this.load.image('terrain_dirt_horizontal_middle', 'assets/sprites/tiles/terrain_dirt_horizontal_middle.png');
    this.load.image('terrain_dirt_horizontal_overhang_left', 'assets/sprites/tiles/terrain_dirt_horizontal_overhang_left.png');
    this.load.image('terrain_dirt_horizontal_overhang_right', 'assets/sprites/tiles/terrain_dirt_horizontal_overhang_right.png');
    this.load.image('terrain_dirt_horizontal_right', 'assets/sprites/tiles/terrain_dirt_horizontal_right.png');
    this.load.image('terrain_dirt_ramp_long_a', 'assets/sprites/tiles/terrain_dirt_ramp_long_a.png');
    this.load.image('terrain_dirt_ramp_long_b', 'assets/sprites/tiles/terrain_dirt_ramp_long_b.png');
    this.load.image('terrain_dirt_ramp_long_c', 'assets/sprites/tiles/terrain_dirt_ramp_long_c.png');
    this.load.image('terrain_dirt_ramp_short_a', 'assets/sprites/tiles/terrain_dirt_ramp_short_a.png');
    this.load.image('terrain_dirt_ramp_short_b', 'assets/sprites/tiles/terrain_dirt_ramp_short_b.png');
    this.load.image('terrain_dirt_vertical_bottom', 'assets/sprites/tiles/terrain_dirt_vertical_bottom.png');
    this.load.image('terrain_dirt_vertical_middle', 'assets/sprites/tiles/terrain_dirt_vertical_middle.png');
    this.load.image('terrain_dirt_vertical_top', 'assets/sprites/tiles/terrain_dirt_vertical_top.png');
    this.load.image('terrain_grass_block', 'assets/sprites/tiles/terrain_grass_block.png');
    this.load.image('terrain_grass_block_bottom', 'assets/sprites/tiles/terrain_grass_block_bottom.png');
    this.load.image('terrain_grass_block_bottom_left', 'assets/sprites/tiles/terrain_grass_block_bottom_left.png');
    this.load.image('terrain_grass_block_bottom_right', 'assets/sprites/tiles/terrain_grass_block_bottom_right.png');
    this.load.image('terrain_grass_block_center', 'assets/sprites/tiles/terrain_grass_block_center.png');
    this.load.image('terrain_grass_block_left', 'assets/sprites/tiles/terrain_grass_block_left.png');
    this.load.image('terrain_grass_block_right', 'assets/sprites/tiles/terrain_grass_block_right.png');
    this.load.image('terrain_grass_block_top', 'assets/sprites/tiles/terrain_grass_block_top.png');
    this.load.image('terrain_grass_block_top_left', 'assets/sprites/tiles/terrain_grass_block_top_left.png');
    this.load.image('terrain_grass_block_top_right', 'assets/sprites/tiles/terrain_grass_block_top_right.png');
    this.load.image('terrain_grass_cloud', 'assets/sprites/tiles/terrain_grass_cloud.png');
    this.load.image('terrain_grass_cloud_background', 'assets/sprites/tiles/terrain_grass_cloud_background.png');
    this.load.image('terrain_grass_cloud_left', 'assets/sprites/tiles/terrain_grass_cloud_left.png');
    this.load.image('terrain_grass_cloud_middle', 'assets/sprites/tiles/terrain_grass_cloud_middle.png');
    this.load.image('terrain_grass_cloud_right', 'assets/sprites/tiles/terrain_grass_cloud_right.png');
    this.load.image('terrain_grass_horizontal_left', 'assets/sprites/tiles/terrain_grass_horizontal_left.png');
    this.load.image('terrain_grass_horizontal_middle', 'assets/sprites/tiles/terrain_grass_horizontal_middle.png');
    this.load.image('terrain_grass_horizontal_overhang_left', 'assets/sprites/tiles/terrain_grass_horizontal_overhang_left.png');
    this.load.image('terrain_grass_horizontal_overhang_right', 'assets/sprites/tiles/terrain_grass_horizontal_overhang_right.png');
    this.load.image('terrain_grass_horizontal_right', 'assets/sprites/tiles/terrain_grass_horizontal_right.png');
    this.load.image('terrain_grass_ramp_long_a', 'assets/sprites/tiles/terrain_grass_ramp_long_a.png');
    this.load.image('terrain_grass_ramp_long_b', 'assets/sprites/tiles/terrain_grass_ramp_long_b.png');
    this.load.image('terrain_grass_ramp_long_c', 'assets/sprites/tiles/terrain_grass_ramp_long_c.png');
    this.load.image('terrain_grass_ramp_short_a', 'assets/sprites/tiles/terrain_grass_ramp_short_a.png');
    this.load.image('terrain_grass_ramp_short_b', 'assets/sprites/tiles/terrain_grass_ramp_short_b.png');
    this.load.image('terrain_grass_vertical_bottom', 'assets/sprites/tiles/terrain_grass_vertical_bottom.png');
    this.load.image('terrain_grass_vertical_middle', 'assets/sprites/tiles/terrain_grass_vertical_middle.png');
    this.load.image('terrain_grass_vertical_top', 'assets/sprites/tiles/terrain_grass_vertical_top.png');
    this.load.image('terrain_purple_block', 'assets/sprites/tiles/terrain_purple_block.png');
    this.load.image('terrain_purple_block_bottom', 'assets/sprites/tiles/terrain_purple_block_bottom.png');
    this.load.image('terrain_purple_block_bottom_left', 'assets/sprites/tiles/terrain_purple_block_bottom_left.png');
    this.load.image('terrain_purple_block_bottom_right', 'assets/sprites/tiles/terrain_purple_block_bottom_right.png');
    this.load.image('terrain_purple_block_center', 'assets/sprites/tiles/terrain_purple_block_center.png');
    this.load.image('terrain_purple_block_left', 'assets/sprites/tiles/terrain_purple_block_left.png');
    this.load.image('terrain_purple_block_right', 'assets/sprites/tiles/terrain_purple_block_right.png');
    this.load.image('terrain_purple_block_top', 'assets/sprites/tiles/terrain_purple_block_top.png');
    this.load.image('terrain_purple_block_top_left', 'assets/sprites/tiles/terrain_purple_block_top_left.png');
    this.load.image('terrain_purple_block_top_right', 'assets/sprites/tiles/terrain_purple_block_top_right.png');
    this.load.image('terrain_purple_cloud', 'assets/sprites/tiles/terrain_purple_cloud.png');
    this.load.image('terrain_purple_cloud_background', 'assets/sprites/tiles/terrain_purple_cloud_background.png');
    this.load.image('terrain_purple_cloud_left', 'assets/sprites/tiles/terrain_purple_cloud_left.png');
    this.load.image('terrain_purple_cloud_middle', 'assets/sprites/tiles/terrain_purple_cloud_middle.png');
    this.load.image('terrain_purple_cloud_right', 'assets/sprites/tiles/terrain_purple_cloud_right.png');
    this.load.image('terrain_purple_horizontal_left', 'assets/sprites/tiles/terrain_purple_horizontal_left.png');
    this.load.image('terrain_purple_horizontal_middle', 'assets/sprites/tiles/terrain_purple_horizontal_middle.png');
    this.load.image('terrain_purple_horizontal_overhang_left', 'assets/sprites/tiles/terrain_purple_horizontal_overhang_left.png');
    this.load.image('terrain_purple_horizontal_overhang_right', 'assets/sprites/tiles/terrain_purple_horizontal_overhang_right.png');
    this.load.image('terrain_purple_horizontal_right', 'assets/sprites/tiles/terrain_purple_horizontal_right.png');
    this.load.image('terrain_purple_ramp_long_a', 'assets/sprites/tiles/terrain_purple_ramp_long_a.png');
    this.load.image('terrain_purple_ramp_long_b', 'assets/sprites/tiles/terrain_purple_ramp_long_b.png');
    this.load.image('terrain_purple_ramp_long_c', 'assets/sprites/tiles/terrain_purple_ramp_long_c.png');
    this.load.image('terrain_purple_ramp_short_a', 'assets/sprites/tiles/terrain_purple_ramp_short_a.png');
    this.load.image('terrain_purple_ramp_short_b', 'assets/sprites/tiles/terrain_purple_ramp_short_b.png');
    this.load.image('terrain_purple_vertical_bottom', 'assets/sprites/tiles/terrain_purple_vertical_bottom.png');
    this.load.image('terrain_purple_vertical_middle', 'assets/sprites/tiles/terrain_purple_vertical_middle.png');
    this.load.image('terrain_purple_vertical_top', 'assets/sprites/tiles/terrain_purple_vertical_top.png');
    this.load.image('terrain_sand_block', 'assets/sprites/tiles/terrain_sand_block.png');
    this.load.image('terrain_sand_block_bottom', 'assets/sprites/tiles/terrain_sand_block_bottom.png');
    this.load.image('terrain_sand_block_bottom_left', 'assets/sprites/tiles/terrain_sand_block_bottom_left.png');
    this.load.image('terrain_sand_block_bottom_right', 'assets/sprites/tiles/terrain_sand_block_bottom_right.png');
    this.load.image('terrain_sand_block_center', 'assets/sprites/tiles/terrain_sand_block_center.png');
    this.load.image('terrain_sand_block_left', 'assets/sprites/tiles/terrain_sand_block_left.png');
    this.load.image('terrain_sand_block_right', 'assets/sprites/tiles/terrain_sand_block_right.png');
    this.load.image('terrain_sand_block_top', 'assets/sprites/tiles/terrain_sand_block_top.png');
    this.load.image('terrain_sand_block_top_left', 'assets/sprites/tiles/terrain_sand_block_top_left.png');
    this.load.image('terrain_sand_block_top_right', 'assets/sprites/tiles/terrain_sand_block_top_right.png');
    this.load.image('terrain_sand_cloud', 'assets/sprites/tiles/terrain_sand_cloud.png');
    this.load.image('terrain_sand_cloud_background', 'assets/sprites/tiles/terrain_sand_cloud_background.png');
    this.load.image('terrain_sand_cloud_left', 'assets/sprites/tiles/terrain_sand_cloud_left.png');
    this.load.image('terrain_sand_cloud_middle', 'assets/sprites/tiles/terrain_sand_cloud_middle.png');
    this.load.image('terrain_sand_cloud_right', 'assets/sprites/tiles/terrain_sand_cloud_right.png');
    this.load.image('terrain_sand_horizontal_left', 'assets/sprites/tiles/terrain_sand_horizontal_left.png');
    this.load.image('terrain_sand_horizontal_middle', 'assets/sprites/tiles/terrain_sand_horizontal_middle.png');
    this.load.image('terrain_sand_horizontal_overhang_left', 'assets/sprites/tiles/terrain_sand_horizontal_overhang_left.png');
    this.load.image('terrain_sand_horizontal_overhang_right', 'assets/sprites/tiles/terrain_sand_horizontal_overhang_right.png');
    this.load.image('terrain_sand_horizontal_right', 'assets/sprites/tiles/terrain_sand_horizontal_right.png');
    this.load.image('terrain_sand_ramp_long_a', 'assets/sprites/tiles/terrain_sand_ramp_long_a.png');
    this.load.image('terrain_sand_ramp_long_b', 'assets/sprites/tiles/terrain_sand_ramp_long_b.png');
    this.load.image('terrain_sand_ramp_long_c', 'assets/sprites/tiles/terrain_sand_ramp_long_c.png');
    this.load.image('terrain_sand_ramp_short_a', 'assets/sprites/tiles/terrain_sand_ramp_short_a.png');
    this.load.image('terrain_sand_ramp_short_b', 'assets/sprites/tiles/terrain_sand_ramp_short_b.png');
    this.load.image('terrain_sand_vertical_bottom', 'assets/sprites/tiles/terrain_sand_vertical_bottom.png');
    this.load.image('terrain_sand_vertical_middle', 'assets/sprites/tiles/terrain_sand_vertical_middle.png');
    this.load.image('terrain_sand_vertical_top', 'assets/sprites/tiles/terrain_sand_vertical_top.png');
    this.load.image('terrain_snow_block', 'assets/sprites/tiles/terrain_snow_block.png');
    this.load.image('terrain_snow_block_bottom', 'assets/sprites/tiles/terrain_snow_block_bottom.png');
    this.load.image('terrain_snow_block_bottom_left', 'assets/sprites/tiles/terrain_snow_block_bottom_left.png');
    this.load.image('terrain_snow_block_bottom_right', 'assets/sprites/tiles/terrain_snow_block_bottom_right.png');
    this.load.image('terrain_snow_block_center', 'assets/sprites/tiles/terrain_snow_block_center.png');
    this.load.image('terrain_snow_block_left', 'assets/sprites/tiles/terrain_snow_block_left.png');
    this.load.image('terrain_snow_block_right', 'assets/sprites/tiles/terrain_snow_block_right.png');
    this.load.image('terrain_snow_block_top', 'assets/sprites/tiles/terrain_snow_block_top.png');
    this.load.image('terrain_snow_block_top_left', 'assets/sprites/tiles/terrain_snow_block_top_left.png');
    this.load.image('terrain_snow_block_top_right', 'assets/sprites/tiles/terrain_snow_block_top_right.png');
    this.load.image('terrain_snow_cloud', 'assets/sprites/tiles/terrain_snow_cloud.png');
    this.load.image('terrain_snow_cloud_background', 'assets/sprites/tiles/terrain_snow_cloud_background.png');
    this.load.image('terrain_snow_cloud_left', 'assets/sprites/tiles/terrain_snow_cloud_left.png');
    this.load.image('terrain_snow_cloud_middle', 'assets/sprites/tiles/terrain_snow_cloud_middle.png');
    this.load.image('terrain_snow_cloud_right', 'assets/sprites/tiles/terrain_snow_cloud_right.png');
    this.load.image('terrain_snow_horizontal_left', 'assets/sprites/tiles/terrain_snow_horizontal_left.png');
    this.load.image('terrain_snow_horizontal_middle', 'assets/sprites/tiles/terrain_snow_horizontal_middle.png');
    this.load.image('terrain_snow_horizontal_overhang_left', 'assets/sprites/tiles/terrain_snow_horizontal_overhang_left.png');
    this.load.image('terrain_snow_horizontal_overhang_right', 'assets/sprites/tiles/terrain_snow_horizontal_overhang_right.png');
    this.load.image('terrain_snow_horizontal_right', 'assets/sprites/tiles/terrain_snow_horizontal_right.png');
    this.load.image('terrain_snow_ramp_long_a', 'assets/sprites/tiles/terrain_snow_ramp_long_a.png');
    this.load.image('terrain_snow_ramp_long_b', 'assets/sprites/tiles/terrain_snow_ramp_long_b.png');
    this.load.image('terrain_snow_ramp_long_c', 'assets/sprites/tiles/terrain_snow_ramp_long_c.png');
    this.load.image('terrain_snow_ramp_short_a', 'assets/sprites/tiles/terrain_snow_ramp_short_a.png');
    this.load.image('terrain_snow_ramp_short_b', 'assets/sprites/tiles/terrain_snow_ramp_short_b.png');
    this.load.image('terrain_snow_vertical_bottom', 'assets/sprites/tiles/terrain_snow_vertical_bottom.png');
    this.load.image('terrain_snow_vertical_middle', 'assets/sprites/tiles/terrain_snow_vertical_middle.png');
    this.load.image('terrain_snow_vertical_top', 'assets/sprites/tiles/terrain_snow_vertical_top.png');
    this.load.image('terrain_stone_block', 'assets/sprites/tiles/terrain_stone_block.png');
    this.load.image('terrain_stone_block_bottom', 'assets/sprites/tiles/terrain_stone_block_bottom.png');
    this.load.image('terrain_stone_block_bottom_left', 'assets/sprites/tiles/terrain_stone_block_bottom_left.png');
    this.load.image('terrain_stone_block_bottom_right', 'assets/sprites/tiles/terrain_stone_block_bottom_right.png');
    this.load.image('terrain_stone_block_center', 'assets/sprites/tiles/terrain_stone_block_center.png');
    this.load.image('terrain_stone_block_left', 'assets/sprites/tiles/terrain_stone_block_left.png');
    this.load.image('terrain_stone_block_right', 'assets/sprites/tiles/terrain_stone_block_right.png');
    this.load.image('terrain_stone_block_top', 'assets/sprites/tiles/terrain_stone_block_top.png');
    this.load.image('terrain_stone_block_top_left', 'assets/sprites/tiles/terrain_stone_block_top_left.png');
    this.load.image('terrain_stone_block_top_right', 'assets/sprites/tiles/terrain_stone_block_top_right.png');
    this.load.image('terrain_stone_cloud', 'assets/sprites/tiles/terrain_stone_cloud.png');
    this.load.image('terrain_stone_cloud_background', 'assets/sprites/tiles/terrain_stone_cloud_background.png');
    this.load.image('terrain_stone_cloud_left', 'assets/sprites/tiles/terrain_stone_cloud_left.png');
    this.load.image('terrain_stone_cloud_middle', 'assets/sprites/tiles/terrain_stone_cloud_middle.png');
    this.load.image('terrain_stone_cloud_right', 'assets/sprites/tiles/terrain_stone_cloud_right.png');
    this.load.image('terrain_stone_horizontal_left', 'assets/sprites/tiles/terrain_stone_horizontal_left.png');
    this.load.image('terrain_stone_horizontal_middle', 'assets/sprites/tiles/terrain_stone_horizontal_middle.png');
    this.load.image('terrain_stone_horizontal_overhang_left', 'assets/sprites/tiles/terrain_stone_horizontal_overhang_left.png');
    this.load.image('terrain_stone_horizontal_overhang_right', 'assets/sprites/tiles/terrain_stone_horizontal_overhang_right.png');
    this.load.image('terrain_stone_horizontal_right', 'assets/sprites/tiles/terrain_stone_horizontal_right.png');
    this.load.image('terrain_stone_ramp_long_a', 'assets/sprites/tiles/terrain_stone_ramp_long_a.png');
    this.load.image('terrain_stone_ramp_long_b', 'assets/sprites/tiles/terrain_stone_ramp_long_b.png');
    this.load.image('terrain_stone_ramp_long_c', 'assets/sprites/tiles/terrain_stone_ramp_long_c.png');
    this.load.image('terrain_stone_ramp_short_a', 'assets/sprites/tiles/terrain_stone_ramp_short_a.png');
    this.load.image('terrain_stone_ramp_short_b', 'assets/sprites/tiles/terrain_stone_ramp_short_b.png');
    this.load.image('terrain_stone_vertical_bottom', 'assets/sprites/tiles/terrain_stone_vertical_bottom.png');
    this.load.image('terrain_stone_vertical_middle', 'assets/sprites/tiles/terrain_stone_vertical_middle.png');
    this.load.image('terrain_stone_vertical_top', 'assets/sprites/tiles/terrain_stone_vertical_top.png');
    this.load.image('torch_off', 'assets/sprites/tiles/torch_off.png');
    this.load.image('torch_on_a', 'assets/sprites/tiles/torch_on_a.png');
    this.load.image('torch_on_b', 'assets/sprites/tiles/torch_on_b.png');
    this.load.image('water', 'assets/sprites/tiles/water.png');
    this.load.image('water_top', 'assets/sprites/tiles/water_top.png');
    this.load.image('water_top_low', 'assets/sprites/tiles/water_top_low.png');
    this.load.image('weight', 'assets/sprites/tiles/weight.png');
    this.load.image('window', 'assets/sprites/tiles/window.png');

    // ── Companion sprites — 128×128px each ────────────────────────────────
    this.load.image('character_purple_idle',   'assets/sprites/companion/character_purple_idle.png');
    this.load.image('character_purple_front',  'assets/sprites/companion/character_purple_front.png');
    this.load.image('character_purple_walk_a', 'assets/sprites/companion/character_purple_walk_a.png');
    this.load.image('character_purple_walk_b', 'assets/sprites/companion/character_purple_walk_b.png');

    // ── Character head — from PNG/Parts/, used for HUD icon ───────────────
    this.load.image('char_head', 'assets/sprites/character/PNG/Parts/head.png');

    // ── Enemy sprites ──────────────────────────────────────────────────────
    this.load.image('frog',      'assets/sprites/enemy/frog.png');
    this.load.image('frog_leap', 'assets/sprites/enemy/frog_leap.png');
    this.load.image('frog_hit',  'assets/sprites/enemy/frog_hit.png');
    this.load.image('frog_dead', 'assets/sprites/enemy/frog_dead.png');

    // ── Map fragment image — placeholder used if file not present ──────────
    this.load.image('map_fragment_1', 'assets/images/map_fragment_1.png');
  }

  // ── CREATE ─────────────────────────────────────────────────────────────────
  create() {
    // ── Reset all game state — supports scene.scene.restart() ──────────────
    this.playerLives            = 3;
    this.coinCount              = 0;
    this.gemCount               = 0;
    this.keysCollected          = 0;
    this.totalKeys              = 0;
    this.levelComplete          = false;
    this.isInvincible           = false;
    this.isOnLadder             = false;
    this.doorCooldown           = false;
    this.isDead                 = false;
    this.bgLayers               = [];
    this.attackState            = 'ready';
    this.attackIsKick           = false;
    this.coyoteTimer            = 0;
    this.hudHeartBlink          = null;
    this.vignetteGfx            = null;
    this.hudHearts              = [];
    this.hudCompanionHearts     = [];
    this.companion              = null;
    this.companionIdleTime      = 0;
    this.companionIsFront       = false;
    this.companionLives         = 3;
    this.hudCompanionIcon       = null;
    this.companionStars         = 1;
    this.conversionAvailable    = false;
    this.companionReady         = false;
    this.companionOperating     = false;
    this.conversionPopupOpen    = false;
    this.conversionPending      = false;
    this.lastConversionThreshold = 0;
    this.hudStars               = [];
    this.starGlowTween          = null;
    this.conversionBannerObjs   = [];
    this.readyBannerObjs        = [];
    this.enemies                = [];
    this.companionControlMode   = false;
    this.modeIndicator          = null;
    this.companionSpeed         = 200;
    this.companionWalkTimer     = 0;
    this.companionEnergyTimer   = 0;
    this.COMPANION_STAR_DURATION = 180000;
    this.mapFragmentFound       = false;
    this.lockUsed               = false;
    this.lockGroup              = null;
    this.lockHintCooldown       = false;
    this.companionInvincible    = false;

    // ── Level dimensions from editor JSON ──────────────────────────────────
    const levelData = this.cache.json.get('level1');
    const T      = levelData.tileSize;    // 64
    const worldW = levelData.cols * T;    // 3200  (50 cols × 64)
    const worldH = levelData.rows * T;    // 896   (14 rows × 64)

    this.physics.world.setBounds(0, 0, worldW, worldH);

    // ── Parallax backgrounds ────────────────────────────────────────────────
    const BG_W = worldW * 2;
    const addBg = (key, factor, wx, wy, w, h) => {
      const s = this.add.tileSprite(wx, wy, w, h, key);
      s.setScrollFactor(factor);
      this.bgLayers.push({ sprite: s, factor });
    };

    addBg('background_solid_sky',   0,    640,  360, BG_W, 720);
    addBg('background_clouds',      0.05, 1600, 300, BG_W, 600);
    addBg('background_fade_hills',  0.1,  1600, 530, BG_W, 600);
    addBg('background_color_hills', 0.15, 1600, 527, BG_W, 400);
    addBg('background_fade_trees',  0.25, 1600, 585, BG_W, 400);
    addBg('background_color_trees', 0.35, 1600, 623, BG_W, 400);
    addBg('background_solid_grass', 0.5,  1600, 746, BG_W, 150);

    // ── Static groups ───────────────────────────────────────────────────────
    this.groundLayer       = this.physics.add.staticGroup();
    this.platformsGroup    = this.physics.add.staticGroup();
    this.blockGroup        = this.physics.add.staticGroup();
    this.hazardGroup       = this.physics.add.staticGroup();
    this.ladderGroup       = this.physics.add.staticGroup();
    this.doorGroup         = this.physics.add.staticGroup();
    this.collectiblesGroup = this.physics.add.staticGroup();
    this.lockGroup         = this.physics.add.staticGroup();

    // ── Count total key tiles ───────────────────────────────────────────────
    this.totalKeys = levelData.tiles.filter(t => t.key.startsWith('key_')).length;

    // ── Load tiles into groups ──────────────────────────────────────────────
    levelData.tiles.forEach(tile => {
      const cat = this.getTileCategory(tile.key);

      if (cat === 'backdrop') {
        this.add.image(tile.x, tile.y, tile.key).setDepth(0);
        return;
      }

      let s;
      if (cat === 'terrain' || cat === 'brick') {
        s = this.platformsGroup.create(tile.x, tile.y, tile.key);
      } else if (cat === 'block') {
        s = this.blockGroup.create(tile.x, tile.y, tile.key);
        s.triggered = false;
      } else if (cat === 'hazard') {
        s = this.hazardGroup.create(tile.x, tile.y, tile.key);
      } else if (cat === 'ladder') {
        s = this.ladderGroup.create(tile.x, tile.y, tile.key);
      } else if (cat === 'door') {
        s = this.doorGroup.create(tile.x, tile.y, tile.key);
      } else if (cat === 'collectible') {
        s = this.collectiblesGroup.create(tile.x, tile.y, tile.key);
      } else if (cat === 'lock') {
        s = this.lockGroup.create(tile.x, tile.y, tile.key);
      } else {
        s = this.platformsGroup.create(tile.x, tile.y, tile.key);
      }
      s.refreshBody();
    });

    // ── Enemies ─────────────────────────────────────────────────────────────
    // FROG 1 — patrol zone x 784–1184, centered x 984, ground y 690
    const frog1 = new Frog(this, 984, 748);
    frog1.patrolRange = 300;
    this.enemies.push(frog1);

    // FROG 2 — patrol zone x 1991–2391, centered x 2191, ground y 690
    const frog2 = new Frog(this, 2191, 748);
    frog2.patrolRange = 200;
    this.enemies.push(frog2);

    // FROG 3 — elevated patrol, centered x 1112, y 80
    const frog3 = new Frog(this, 1250, 108);
    frog3.patrolRange = 120;
    this.enemies.push(frog3);

    // ── Player ──────────────────────────────────────────────────────────────
    this.player = this.physics.add.sprite(100, 700, 'player');
    this.player.setScale(0.75);
    this.player.setDepth(10);
    this.player.body.setSize(56, 104);
    this.player.body.setOffset(20, 24);
    this.player.setCollideWorldBounds(true);

    // ── Companion — no physics, lerp-based follow ───────────────────────────
    this.companion = this.add.image(this.player.x - 80, this.player.y - 60, 'character_purple_idle')
      .setScale(0.5).setDepth(9);

    // ── Colliders ───────────────────────────────────────────────────────────
    this.physics.add.collider(this.player, this.groundLayer);
    this.physics.add.collider(this.player, this.platformsGroup);

    this.physics.add.collider(this.player, this.blockGroup, (playerObj, block) => {
      if (block.triggered || !this.player.body.blocked.up) return;
      block.triggered = true;
      this.onBlockHit(block);
    });

    this.physics.add.collider(this.player, this.doorGroup, this.onDoor, null, this);
    this.physics.add.collider(this.player, this.lockGroup);
    this.physics.add.overlap(this.player, this.hazardGroup, this.onHazard, null, this);
    this.physics.add.overlap(this.player, this.collectiblesGroup, this.onCollect, null, this);

    // ── Animations ──────────────────────────────────────────────────────────
    const anim = (key, frames, frameRate, repeat) =>
      this.anims.create({ key, frames: this.anims.generateFrameNumbers('player', { frames }), frameRate, repeat });

    anim('idle',     [0],                         6, -1);
    anim('jump',     [1],                         6,  0);
    anim('fall',     [2],                         6, -1);
    anim('run',      [24, 25, 26],               12, -1);
    anim('walk',     [36,37,38,39,40,41,42,43], 10, -1);
    anim('attack',   [27, 28, 29],               10,  0);
    anim('kick',     [19],                       10,  0);
    anim('hurt',     [33],                        6,  0);
    anim('climb',    [5, 6],                      8, -1);
    anim('fallDown', [44],                        6,  0);

    // ── Attack zone ─────────────────────────────────────────────────────────
    const atkGfx = this.make.graphics({ add: false });
    atkGfx.fillStyle(0xffffff, 1);
    atkGfx.fillRect(0, 0, 1, 1);
    atkGfx.generateTexture('attackTex', 1, 1);
    atkGfx.destroy();

    this.attackZone = this.physics.add.image(0, 0, 'attackTex');
    this.attackZone.setAlpha(0);
    this.attackZone.body.setAllowGravity(false);
    this.attackZone.body.enable = false;

    // ── Camera ──────────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, worldW, worldH);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // ── Input ────────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.keyG = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
    this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    // Dedicated companion keys — W/A/S/D for MODE B (player is frozen, no conflict)
    this.companionWASD = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      down:  Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // TAB — switches between MODE A (player) and MODE B (companion)
    // Only active when companionReady = true
    this.tabKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);

    // When attack animation finishes: disable hitbox, enter cooldown, then ready
    this.player.on('animationcomplete', (animObj) => {
      if (animObj.key === 'attack' || animObj.key === 'kick') {
        this.attackZone.body.enable = false;
        this.attackState = 'cooldown';
        this.time.delayedCall(200, () => { this.attackState = 'ready'; });
      }
    });

    // ── HUD ─────────────────────────────────────────────────────────────────
    //  Panel covers y: 6–248, x: 6–196
    //  Label "MAEVEA" y=8,  char_head + 3 hearts y=38
    //  Label "SABLE"  y=48, companion icon + 3 hearts y=74
    //  Stars y=96  |  Divider y=110
    //  Row 4 (y=128): coin icon + count
    //  Row 5 (y=158): gem icon + count
    //  Row 6 (y=188): key icon + count

    // Panel background
    this.hudPanel = this.add.graphics().setScrollFactor(0).setDepth(19);
    this.hudPanel.fillStyle(0x12001c, 0.88);
    this.hudPanel.fillRoundedRect(6, 6, 190, 242, 10);
    this.hudPanel.lineStyle(1, 0xd4c4e8, 0.3);
    this.hudPanel.lineBetween(14, 110, 188, 110);

    const hudTextStyle = {
      fontFamily: '"Press Start 2P"',
      fontSize: '10px',
      stroke: '#000000',
      strokeThickness: 3
    };

    // "MAEVEA" label
    this.add.text(18, 8, 'MAEVEA', {
      fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#ffecd8',
      resolution: 2
    }).setScrollFactor(0).setDepth(20);

    // Row 1: Maevea — char_head icon + 3 player hearts
    this.add.image(18, 38, 'char_head')
      .setScale(0.45).setScrollFactor(0).setDepth(20);
    for (let i = 0; i < 3; i++) {
      this.hudHearts.push(
        this.add.image(50 + i * 24, 38, 'hud_heart')
          .setScale(0.45).setScrollFactor(0).setDepth(20)
      );
    }

    // "SABLE" label
    this.add.text(18, 48, 'SABLE', {
      fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#d4c4e8',
      resolution: 2
    }).setScrollFactor(0).setDepth(20);

    // Row 2: Sable — companion icon + 3 companion hearts
    this.hudCompanionIcon = this.add.image(18, 74, 'hud_player_purple')
      .setScale(0.45).setScrollFactor(0).setDepth(20);
    for (let i = 0; i < 3; i++) {
      this.hudCompanionHearts.push(
        this.add.image(50 + i * 24, 74, 'hud_heart')
          .setScale(0.45).setScrollFactor(0).setDepth(20)
      );
    }

    // Row 4: Coins
    this.add.image(18, 128, 'coin_gold')
      .setScale(0.45).setScrollFactor(0).setDepth(20);
    this.hudCoinsText = this.add.text(52, 128, '0', {
      ...hudTextStyle, color: '#fac775'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(20);

    // Row 5: Gems
    this.add.image(18, 158, 'gem_yellow')
      .setScale(0.45).setScrollFactor(0).setDepth(20);
    this.hudGemsText = this.add.text(52, 158, '0', {
      ...hudTextStyle, color: '#d4c4e8'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(20);

    // Row 6: Keys
    this.add.image(18, 188, 'hud_key_yellow')
      .setScale(0.45).setScrollFactor(0).setDepth(20);
    this.hudKeysText = this.add.text(52, 188, `0/${this.totalKeys}`, {
      ...hudTextStyle, color: '#d4c4e8'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(20);

    this.updatePlayerHearts();
    this.updateCompanionHearts();
    this.updateHudStars();

    // ── Help button (? circle, top-right) ───────────────────────────────────
    const helpCircle = this.add.graphics().setScrollFactor(0).setDepth(50);
    helpCircle.fillStyle(0xcc2222, 1);
    helpCircle.fillCircle(1248, 29, 18);
    helpCircle.lineStyle(2, 0xff8888, 1);
    helpCircle.strokeCircle(1248, 29, 18);
    this.add.text(1248, 29, '?', {
      fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#ffffff',
      resolution: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this.helpPanelOpen) this.closeHelpPanel(); else this.showHelpPanel();
      });

    // ── Show help panel on every load ────────────────────────────────────────
    this.time.delayedCall(400, () => this.showHelpPanel());

    // ── H key — toggle help panel ────────────────────────────────────────────
    this.input.keyboard.on('keydown-H', () => {
      if (this.helpPanelOpen) { this.closeHelpPanel(); } else { this.showHelpPanel(); }
    });

    // ── ESC key — close help panel if open ───────────────────────────────────
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.helpPanelOpen) this.closeHelpPanel();
    });

    // ── Debug overlay ────────────────────────────────────────────────────────
    this.debugText = this.add.text(1270, 10, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#00ffcc',
      backgroundColor: '#00000099',
      padding: { x: 10, y: 8 },
      lineSpacing: 4
    })
      .setScrollFactor(0)
      .setOrigin(1, 0)
      .setDepth(100);
  }

  // ── UPDATE ─────────────────────────────────────────────────────────────────
  update(time, delta) {
    const onGround = this.player.body.blocked.down;

    // Parallax — shift tile texture to match camera position
    const camX = this.cameras.main.scrollX;
    for (const { sprite, factor } of this.bgLayers) {
      sprite.tilePositionX = camX * factor;
    }

    // Skip all input / physics during death sequence or popup
    if (this.isDead || this.conversionPopupOpen) return;

    // Companion follow — MODE A only (not when player is controlling companion)
    if (this.companion && !this.companionControlMode) {
      const targetX = this.player.x - 80;
      const targetY = this.player.y - 60;
      this.companion.x += (targetX - this.companion.x) * 0.04;
      this.companion.y += (targetY - this.companion.y) * 0.04;
      this.companion.y += Math.sin(time * 0.003) * 0.8;
      this.companion.setFlipX(this.player.flipX);

      const isPlayerIdle = this.player.body.velocity.x === 0 && onGround;
      if (isPlayerIdle) {
        this.companionIdleTime += delta;
        if (this.companionIdleTime >= 1000 && !this.companionIsFront) {
          this.companionIsFront = true;
          this.companion.setTexture('character_purple_front');
        }
      } else {
        this.companionIdleTime = 0;
        if (this.companionIsFront) {
          this.companionIsFront = false;
          this.companion.setTexture('character_purple_idle');
        }
      }
    }

    // ── Companion mode toggle (TAB) ───────────────────────────────────────
    if (this.companionReady &&
        Phaser.Input.Keyboard.JustDown(this.tabKey)) {
      this.companionControlMode = !this.companionControlMode;

      if (this.companionControlMode) {
        // Switched TO companion mode (MODE B)
        this.player.body.setVelocity(0, 0);
        this.player.body.moves = false;
        this.player.anims.play('idle', true);
        this.cameras.main.startFollow(this.companion, true, 0.1, 0.1);
        // Dismiss ready banner on first TAB press
        if (this.readyBannerObjs && this.readyBannerObjs.length > 0) {
          this.readyBannerObjs.forEach(e => e.destroy());
          this.readyBannerObjs = [];
        }
        this.showModeIndicator('SABLE');
        // One-time tooltip on first TAB to companion
        if (!this.sableTipShown) {
          this.sableTipShown = true;
          this.showFloatingText(this.companion.x, this.companion.y - 60,
            'WASD or ARROWS to move Sable!', '#aa88ff');
        }
      } else {
        // Switched BACK to player mode (MODE A)
        this.player.body.moves = true;
        this.companion.setTexture('character_purple_idle');
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.showModeIndicator('MAEVEA');
      }
    }

    // ── Companion direct control — MODE B ─────────────────────────────────
    if (this.companion && this.companionControlMode && this.companionReady) {
      const compSpeed = 220;
      const goLeft  = this.cursors.left.isDown  || this.companionWASD.left.isDown;
      const goRight = this.cursors.right.isDown || this.companionWASD.right.isDown;
      const goUp    = this.cursors.up.isDown    || this.companionWASD.up.isDown;
      const goDown  = this.cursors.down.isDown  || this.companionWASD.down.isDown;

      let cx = 0, cy = 0;
      if (goLeft)  cx = -compSpeed;
      if (goRight) cx =  compSpeed;
      if (goUp)    cy = -compSpeed;
      if (goDown)  cy =  compSpeed;

      this.companion.x += cx * (delta / 1000);
      this.companion.y += cy * (delta / 1000);

      // ── Clamp companion to world bounds ──
      const worldWidth  = this.physics.world.bounds.width;
      const worldHeight = this.physics.world.bounds.height;
      const pad = 32;
      this.companion.x = Phaser.Math.Clamp(this.companion.x, pad, worldWidth  - pad);
      this.companion.y = Phaser.Math.Clamp(this.companion.y, pad, worldHeight - pad);

      if (cx !== 0 || cy !== 0) {
        this.companionWalkTimer += delta;
        if (this.companionWalkTimer > 180) {
          this.companionWalkTimer = 0;
          const cur = this.companion.texture.key;
          this.companion.setTexture(
            cur === 'character_purple_walk_a'
              ? 'character_purple_walk_b'
              : 'character_purple_walk_a'
          );
        }
        if (cx < 0) this.companion.setFlipX(true);
        if (cx > 0) this.companion.setFlipX(false);
      } else {
        this.companionWalkTimer = 0;
        this.companion.setTexture('character_purple_idle');
      }
    }

    // ── Companion lava damage ─────────────────────────────────────────────
    if (this.companion && this.companionReady) {
      this.hazardGroup.getChildren().forEach(hazard => {
        const key = hazard.texture?.key || '';
        const isDangerous = key.startsWith('lava') || key === 'fireball';
        if (!isDangerous) return;

        const d = Phaser.Math.Distance.Between(
          this.companion.x, this.companion.y,
          hazard.x, hazard.y
        );

        if (d < 50 && !this.companionInvincible) {
          this.companionInvincible = true;
          this.companionLives--;
          this.updateCompanionHearts();

          if (this.companionLives <= 0) {
            this.triggerCompanionDeath();
          } else {
            this.tweens.add({
              targets: this.companion,
              alpha: 0.2,
              duration: 100,
              yoyo: true,
              repeat: 5,
              onComplete: () => {
                if (this.companion) this.companion.setAlpha(1);
                this.companionInvincible = false;
              }
            });
          }
        }
      });
    }

    // ── Energy timer + collectibles (runs whenever companionReady) ────────
    if (this.companion && this.companionReady) {
      // Energy timer — deplete one star per COMPANION_STAR_DURATION
      this.companionEnergyTimer += delta;
      if (this.companionEnergyTimer >= this.COMPANION_STAR_DURATION) {
        this.companionEnergyTimer = 0;
        if (this.companionStars > 1) {
          this.companionStars--;
          this.updateHudStars();
        } else {
          // No more stars — companion returns to follow mode
          this.companionStars = 1;
          this.updateHudStars();
          this.companionReady = false;
          this.companionOperating = false;
          this.companionControlMode = false;
          this.player.body.moves = true;
        }
      }

      // Companion collectibles — gems and keys
      this.collectiblesGroup.getChildren().forEach(item => {
        if (!item.active) return;
        const d = Phaser.Math.Distance.Between(
          this.companion.x, this.companion.y, item.x, item.y);
        if (d < 40) {
          const texKey = item.texture.key;
          if (texKey.startsWith('gem')) {
            item.setActive(false).setVisible(false);
            if (item.body) item.body.enable = false;
            this.gemCount++;
            if (this.hudGemsText)
              this.hudGemsText.setText(String(this.gemCount));
            this.showFloatingText(item.x, item.y - 30, '+GEM', '#88eeff');
          } else if (texKey.startsWith('key_')) {
            item.setActive(false).setVisible(false);
            if (item.body) item.body.enable = false;
            this.keysCollected++;
            if (this.hudKeysText)
              this.hudKeysText.setText(`${this.keysCollected}/${this.totalKeys}`);
            this.showFloatingText(item.x, item.y - 30, 'KEY FOUND!', '#ffd700');
            this.showKeyCollectedBanner();
          }
        }
      });
    }

    // ── Enemy update + player collision ───────────────────────────────────
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;

      enemy.update(time, delta);

      // Distance-based player contact check
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.sprite.x, enemy.sprite.y
      );

      if (dist < 48 && !this.isInvincible && !this.isDead) {
        // Stomp check — player falling and above enemy
        const stomping = this.player.body.velocity.y > 0 &&
                         this.player.y < enemy.sprite.y - 20;

        if (stomping) {
          this.player.setVelocityY(-350);
          enemy.takeDamage();
          this.coinCount++;
          if (this.hudCoinsText)
            this.hudCoinsText.setText(String(this.coinCount));
        } else {
          // Side/body contact — player takes damage
          this.onHazard(this.player, enemy.sprite);
        }
      }

      // Attack zone contact — J or K kills enemy
      if (this.attackState === 'active' && enemy.alive) {
        const attackDist = Phaser.Math.Distance.Between(
          this.attackZone.x, this.attackZone.y,
          enemy.sprite.x, enemy.sprite.y
        );
        if (attackDist < 80) {
          enemy.takeDamage();
          this.coinCount++;
          if (this.hudCoinsText)
            this.hudCoinsText.setText(String(this.coinCount));
        }
      }
    }

    // ── Lock proximity check (player mode only) ───────────────────────────
    if (!this.lockUsed && !this.companionControlMode && this.lockGroup) {
      this.lockGroup.getChildren().forEach(lockTile => {
        if (!lockTile.active || this.lockUsed) return;
        const d = Phaser.Math.Distance.Between(
          this.player.x, this.player.y, lockTile.x, lockTile.y
        );
        if (d < 64) {
          if (this.totalKeys === 0 || this.keysCollected >= this.totalKeys) {
            this.lockUsed = true;
            this.showLockPopup(lockTile);
          } else if (!this.lockHintCooldown) {
            this.lockHintCooldown = true;
            this.showFloatingText(lockTile.x, lockTile.y - 48, 'Need a key first!', '#ff4444');
            this.time.delayedCall(2000, () => { this.lockHintCooldown = false; });
          }
        }
      });
    }

    // Coyote time
    if (onGround) {
      this.coyoteTimer = COYOTE_MS;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }
    const canJump = this.coyoteTimer > 0;

    // ── Player input — only in MODE A (player controlled) ────────────────
    if (!this.companionControlMode) {
      // Ladder
      this.isOnLadder = this.physics.overlap(this.player, this.ladderGroup);
      if (this.isOnLadder) {
        this.player.body.setAllowGravity(false);
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
          this.player.setVelocityY(-200);
        } else if (this.cursors.down.isDown) {
          this.player.setVelocityY(200);
        } else {
          this.player.setVelocityY(0);
        }
      } else {
        this.player.body.setAllowGravity(true);
      }

      // Attack triggers
      if (this.attackState === 'ready') {
        if (Phaser.Input.Keyboard.JustDown(this.keyJ)) {
          this.attackState = 'active';
          this.attackIsKick = false;
          this.player.anims.play('attack', true);
          this.attackZone.body.enable = true;
        } else if (Phaser.Input.Keyboard.JustDown(this.keyK)) {
          this.attackState = 'active';
          this.attackIsKick = true;
          this.player.anims.play('kick', true);
          this.attackZone.body.enable = true;
        }
      }

      // Attack zone tracking
      if (this.attackState === 'active') {
        const range = this.attackIsKick ? 60 : 80;
        const dir = this.player.flipX ? -1 : 1;
        this.attackZone.setPosition(
          this.player.x + dir * (this.player.body.halfWidth + range / 2),
          this.player.y + 10
        );
        this.attackZone.body.setSize(range, 60, true);
      }

      // Horizontal movement
      const goLeft  = this.cursors.left.isDown  || this.wasd.left.isDown;
      const goRight = this.cursors.right.isDown || this.wasd.right.isDown;

      if (goLeft) {
        this.player.setVelocityX(-MOVE_SPEED);
        this.player.setFlipX(true);
      } else if (goRight) {
        this.player.setVelocityX(MOVE_SPEED);
        this.player.setFlipX(false);
      } else {
        this.player.setVelocityX(0);
      }

      // Jump
      const jumpPressed =
        Phaser.Input.Keyboard.JustDown(this.cursors.up)    ||
        Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
        Phaser.Input.Keyboard.JustDown(this.wasd.up);

      if (jumpPressed && canJump) {
        this.player.setVelocityY(JUMP_VEL);
        this.coyoteTimer = 0;
      }

      // Animation state (gated — don't override attack/kick)
      if (this.attackState === 'ready') {
        let moveAnim;
        if (this.isOnLadder) {
          moveAnim = this.player.body.velocity.y !== 0 ? 'climb' : 'idle';
        } else if (!onGround) {
          moveAnim = this.player.body.velocity.y < 0 ? 'jump' : 'fall';
        } else {
          moveAnim = this.player.body.velocity.x !== 0 ? 'run' : 'idle';
        }
        this.player.anims.play(moveAnim, true);
      }
    } // end !companionControlMode

    // G key — toggle physics hitbox overlay
    if (Phaser.Input.Keyboard.JustDown(this.keyG)) {
      this.physics.world.drawDebug = !this.physics.world.drawDebug;
      if (!this.physics.world.drawDebug) {
        this.physics.world.debugGraphic.clear();
      }
    }

    // Debug overlay
    const vx = Math.round(this.player.body.velocity.x);
    const vy = Math.round(this.player.body.velocity.y);
    const px = Math.round(this.player.x);
    const py = Math.round(this.player.y);
    const facing = this.player.flipX ? 'left' : 'right';

    let stateStr;
    if (this.attackState === 'active')        stateStr = this.attackIsKick ? 'kick' : 'attack';
    else if (this.attackState === 'cooldown') stateStr = 'cooldown';
    else if (this.isOnLadder)                 stateStr = 'ladder';
    else stateStr = !onGround ? (this.player.body.velocity.y < 0 ? 'jump' : 'fall')
                  : this.player.body.velocity.x !== 0 ? 'run' : 'idle';

    this.debugText.setText(
      `state:    ${stateStr}\n` +
      `grounded: ${onGround ? 'yes' : 'no'}  ladder: ${this.isOnLadder ? 'yes' : 'no'}\n` +
      `vel:      x:${String(vx).padStart(5)}  y:${String(vy).padStart(5)}\n` +
      `pos:      x:${String(px).padStart(5)}  y:${String(py).padStart(5)}\n` +
      `facing:   ${facing}\n` +
      `lives:${this.playerLives}  coins:${this.coinCount}  gems:${this.gemCount}  keys:${this.keysCollected}/${this.totalKeys}\n` +
      `\n[Z] attack  [X] kick  [G] hitboxes`
    );
  }

  // ── HELPER METHODS ──────────────────────────────────────────────────────────

  getTileCategory(key) {
    if (key.startsWith('flag') || key.startsWith('torch') ||
        key.startsWith('bush') || key.startsWith('cactus') ||
        key.startsWith('sign') || key.startsWith('mushroom') ||
        key.startsWith('rock') || key.startsWith('fence') ||
        key.startsWith('chain') || key.startsWith('window') ||
        key.startsWith('hill') || key.startsWith('grass') ||
        key.startsWith('hud'))
      return 'backdrop';
    if (key.startsWith('terrain')) return 'terrain';
    if (key.startsWith('block'))   return 'block';
    if (key.startsWith('brick'))   return 'brick';
    if (key.startsWith('lava') || key === 'spikes' ||
        key === 'saw' || key === 'fireball' || key.startsWith('bomb') ||
        key.startsWith('water'))   return 'hazard';
    if (key.startsWith('ladder'))  return 'ladder';
    if (key.startsWith('door'))    return 'door';
    if (key.startsWith('coin'))    return 'collectible';
    if (key.startsWith('gem'))     return 'collectible';
    if (key.startsWith('key_'))    return 'collectible';
    if (key.startsWith('lock'))    return 'lock';
    return 'terrain';
  }

  showFloatingText(x, y, msg, color) {
    const txt = this.add.text(x, y, msg, {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 1500,
      onComplete: () => { txt.destroy(); }
    });
  }

  updateHudLives() {
    this.updatePlayerHearts();
  }

  updatePlayerHearts() {
    const t = ['hud_heart_empty', 'hud_heart_empty', 'hud_heart_empty'];
    if (this.playerLives >= 3)      { t[0] = t[1] = t[2] = 'hud_heart'; }
    else if (this.playerLives === 2) { t[0] = t[1] = 'hud_heart'; }
    else if (this.playerLives === 1) { t[0] = 'hud_heart_half'; }
    for (let i = 0; i < 3; i++) {
      if (this.hudHearts[i]) this.hudHearts[i].setTexture(t[i]);
    }
    if (this.playerLives === 1) {
      if (!this.hudHeartBlink && this.hudHearts[0]) {
        this.hudHeartBlink = this.tweens.add({
          targets: this.hudHearts[0], alpha: 0.2, duration: 400, yoyo: true, repeat: -1
        });
      }
      if (!this.vignetteGfx) {
        this.vignetteGfx = this.add.graphics().setScrollFactor(0).setDepth(19);
        this.vignetteGfx.fillStyle(0xff0000, 0.25);
        this.vignetteGfx.fillRect(0,    0,   1280,  60);
        this.vignetteGfx.fillRect(0,    660, 1280,  60);
        this.vignetteGfx.fillRect(0,    0,   60,   720);
        this.vignetteGfx.fillRect(1220, 0,   60,   720);
      }
    } else if (this.playerLives > 1) {
      this.clearLastLifeWarning();
    }
  }

  updateCompanionHearts() {
    const t = ['hud_heart_empty', 'hud_heart_empty', 'hud_heart_empty'];
    if (this.companionLives >= 3)      { t[0] = t[1] = t[2] = 'hud_heart'; }
    else if (this.companionLives === 2) { t[0] = t[1] = 'hud_heart'; }
    else if (this.companionLives === 1) { t[0] = 'hud_heart_half'; }
    for (let i = 0; i < 3; i++) {
      if (this.hudCompanionHearts[i]) this.hudCompanionHearts[i].setTexture(t[i]);
    }
    if (this.companionLives <= 0) {
      if (this.hudCompanionIcon) { this.hudCompanionIcon.setTint(0x555555).setAlpha(0.5); }
      if (this.companion)        { this.companion.setTint(0x555555).setAlpha(0.5); }
    }
  }

  checkCoinConversion() {
    if (this.conversionPopupOpen || this.conversionPending || this.companionStars >= 3) return;
    const threshold = Math.floor(this.coinCount / COINS_TO_CONVERT);
    if (threshold > this.lastConversionThreshold) {
      this.lastConversionThreshold = threshold;
      this.conversionAvailable = true;
      this.showConversionPopup();
    }
  }

  showConversionPopup() {
    this.conversionPopupOpen = true;
    this.player.body.setVelocity(0, 0);
    this.player.body.moves = false;

    const PX = 640, PY = 360;
    const panel  = this.add.rectangle(PX, PY, 520, 190, 0x000033, 0.88)
      .setScrollFactor(0).setDepth(60);
    const border = this.add.graphics().setScrollFactor(0).setDepth(60);
    border.lineStyle(2, 0xaa88ff, 1);
    border.strokeRect(PX - 260, PY - 95, 520, 190);

    const line1 = this.add.text(PX, PY - 52, '\u2736 15 Coins collected!', {
      fontFamily: '"Press Start 2P"', fontSize: '13px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61);

    const line2 = this.add.text(PX, PY - 18, 'Convert to Companion Energy?', {
      fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61);

    const yesBtn = this.add.text(PX - 110, PY + 30, '[ Y \u2014 Convert ]', {
      fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#00ff88',
      stroke: '#000000', strokeThickness: 2, backgroundColor: '#003311',
      padding: { x: 8, y: 6 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61).setInteractive({ useHandCursor: true });

    const noBtn = this.add.text(PX + 110, PY + 30, '[ N \u2014 Skip ]', {
      fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ff6666',
      stroke: '#000000', strokeThickness: 2, backgroundColor: '#330011',
      padding: { x: 8, y: 6 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61).setInteractive({ useHandCursor: true });

    const hint = this.add.text(PX, PY + 68, 'Press Y or N', {
      fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#aaaaaa',
      resolution: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61);

    const elements = [panel, border, line1, line2, yesBtn, noBtn, hint];

    const keyY = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
    const keyN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N);

    const closePopup = () => {
      elements.forEach(e => e.destroy());
      keyY.destroy();
      keyN.destroy();
      this.conversionPopupOpen = false;
      this.player.body.moves = true;
    };

    const doYes = () => {
      closePopup();
      this.coinCount -= COINS_TO_CONVERT;
      if (this.hudCoinsText) this.hudCoinsText.setText(String(this.coinCount));
      this.lastConversionThreshold = Math.floor(this.coinCount / COINS_TO_CONVERT);
      this.companionStars = Math.min(3, this.companionStars + 1);
      this.updateHudStars();
      this.showReadyPopup();
    };

    const doNo = () => {
      closePopup();
      this.conversionAvailable = false;
      this.showConversionBanner();
    };

    yesBtn.on('pointerdown', doYes);
    noBtn.on('pointerdown', doNo);

    keyY.once('down', doYes);
    keyN.once('down', doNo);

    yesBtn.on('pointerover',  () => yesBtn.setColor('#ffffff'));
    yesBtn.on('pointerout',   () => yesBtn.setColor('#00ff88'));
    noBtn.on('pointerover',   () => noBtn.setColor('#ffffff'));
    noBtn.on('pointerout',    () => noBtn.setColor('#ff6666'));
  }

  showReadyPopup() {
    this.conversionPopupOpen = true;
    this.player.body.moves = false;

    const PX = 640, PY = 360;
    const panel  = this.add.rectangle(PX, PY, 420, 160, 0x000033, 0.88)
      .setScrollFactor(0).setDepth(60);
    const border = this.add.graphics().setScrollFactor(0).setDepth(60);
    border.lineStyle(2, 0xaa88ff, 1);
    border.strokeRect(PX - 210, PY - 80, 420, 160);

    const msg = this.add.text(PX, PY - 22, 'Companion ready\nto operate!', {
      fontFamily: '"Press Start 2P"', fontSize: '13px', color: '#aa88ff',
      stroke: '#000000', strokeThickness: 3, align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61);

    const okBtn = this.add.text(PX, PY + 44, '[ USE TAB TO SWITCH TO COMPANION ]', {
      fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 2, backgroundColor: '#332200',
      padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61).setInteractive({ useHandCursor: true });

    const elements = [panel, border, msg, okBtn];

    okBtn.on('pointerdown', () => {
      elements.forEach(e => e.destroy());
      this.conversionPopupOpen = false;
      this.player.body.moves = true;
      this.companionReady = true;
      this.showReadyBanner();
    });

    okBtn.on('pointerover', () => okBtn.setColor('#ffffff'));
    okBtn.on('pointerout',  () => okBtn.setColor('#ffd700'));
  }

  showHelpPanel() {
    if (this.helpPanelOpen) return;
    this.helpPanelOpen = true;

    const PX = 640, PY = 340;
    const D = 71;  // depth for all elements

    // ── Panel ──────────────────────────────────────────────────────────────
    const panel = this.add.graphics().setScrollFactor(0).setDepth(70);
    panel.fillStyle(0x12001c, 0.95);
    panel.fillRoundedRect(PX - 330, PY - 215, 660, 360, 14);
    panel.lineStyle(2, 0xf5d47a, 1);
    panel.strokeRoundedRect(PX - 330, PY - 215, 660, 360, 14);
    this.helpElements.push(panel);

    // ── Title ──────────────────────────────────────────────────────────────
    this.helpElements.push(
      this.add.text(PX, PY - 192, 'HOW TO PLAY', {
        fontFamily: '"Press Start 2P"', fontSize: '14px', color: '#f5d47a',
        stroke: '#000000', strokeThickness: 3, resolution: 2
      }).setOrigin(0.5).setScrollFactor(0).setDepth(D)
    );

    // ── Two-column rows ────────────────────────────────────────────────────
    //   Label column: x=345 (left-aligned)
    //   Value column: x=470 (left-aligned)
    const LX = 345, VX = 470;
    const fs = '8px';
    const push = (label, value, lc, vc, y) => {
      if (label) {
        this.helpElements.push(
          this.add.text(LX, y, label, {
            fontFamily: '"Press Start 2P"', fontSize: fs, color: lc, resolution: 2
          }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(D)
        );
      }
      this.helpElements.push(
        this.add.text(VX, y, value, {
          fontFamily: '"Press Start 2P"', fontSize: fs, color: vc, resolution: 2
        }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(D)
      );
    };

    const sep = (y) => {
      const g = this.add.graphics().setScrollFactor(0).setDepth(D);
      g.lineStyle(1, 0x4b1a60, 0.6);
      g.lineBetween(LX, y, PX + 290, y);
      this.helpElements.push(g);
    };

    // Controls
    push('MOVE',    'ARROW KEYS / WASD',                 '#888888', '#ffecd8', PY - 162);
    push('JUMP',    'SPACE',                              '#888888', '#ffecd8', PY - 140);
    push('ATTACK',  'Z KEY',                              '#888888', '#ffecd8', PY - 118);
    push('KICK',    'X KEY',                              '#888888', '#ffecd8', PY -  96);
    push('HELP',    'H KEY \u2014 THIS PANEL',            '#888888', '#888888', PY -  74);

    sep(PY - 56);

    // Characters
    push('MAEVEA',     '3 HEARTS \u00b7 ENEMIES, WATER, LAVA & FIRE DEAL DAMAGE', '#888888', '#ffecd8', PY - 44);
    push('SABLE',      '3 HEARTS \u00b7 LAVA & FIRE DEAL DAMAGE',                 '#888888', '#d4c4e8', PY - 22);
    push('SABLE DIES', 'TRIGGERS GAME OVER',                                       '#888888', '#ff8888', PY      );

    sep(PY + 16);

    // Mechanics
    push('COINS',   'COLLECT 15 COINS \u2192 PRESS Y TO CHARGE SABLE',  '#888888', '#fac775', PY + 30);
    push('TAB KEY', 'SWITCH BETWEEN MAEVEA \u2194 SABLE',                '#888888', '#aa88ff', PY + 52);
    push('',        'WASD / ARROWS CONTROL WHOEVER IS ACTIVE',           '#888888', '#aa88ff', PY + 68);
    push('WIN',     'KEY + MAP FRAGMENT + DOOR = ESCAPE',                '#888888', '#fac775', PY + 90);

    // ── Footer hint (non-interactive) ──────────────────────────────────────
    this.helpElements.push(
      this.add.text(PX, PY + 120, '\u2014 PRESS H TO OPEN AND CLOSE THIS \u2014', {
        fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#d4c4e8',
        resolution: 2
      }).setOrigin(0.5).setAlpha(0.7).setScrollFactor(0).setDepth(D)
    );

  }

  closeHelpPanel() {
    this.helpPanelOpen = false;
    this.helpElements.forEach(e => e.destroy());
    this.helpElements = [];
  }

  updateHudStars() {
    this.hudStars.forEach(s => s.destroy());
    this.hudStars = [];
    if (this.starGlowTween) { this.starGlowTween.stop(); this.starGlowTween = null; }

    for (let i = 0; i < 3; i++) {
      const star = this.add.image(50 + i * 20, 96, 'star')
        .setScale(0.35).setScrollFactor(0).setDepth(20);
      if (i < this.companionStars) {
        star.setTint(0xf5d47a);   // gold tint — earned
      } else {
        star.setAlpha(0.25);      // dim — unearned
      }
      this.hudStars.push(star);
    }

    if (this.companionStars === 3) {
      this.starGlowTween = this.tweens.add({
        targets: this.hudStars,
        scaleX: 0.40, scaleY: 0.40,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut'
      });
    }
  }

  showConversionBanner() {
    this.conversionPending = true;
    const CW = 1280;
    const bg  = this.add.rectangle(CW / 2, 20, CW, 40, 0x1a0a2e, 0.88)
      .setScrollFactor(0).setDepth(30);
    const txt = this.add.text(12, 20,
      '\u2736 Convert coins to companion energy?', {
        fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#f5c875'
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(30);
    const yesBtn = this.add.text(CW - 60, 20, '[ YES ]', {
      fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#44cc88'
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(30)
      .setInteractive({ useHandCursor: true });

    this.conversionBannerObjs = [bg, txt, yesBtn];

    yesBtn.on('pointerover', () => yesBtn.setTint(0xffff99));
    yesBtn.on('pointerout',  () => yesBtn.clearTint());
    yesBtn.on('pointerdown', () => {
      this.conversionBannerObjs.forEach(e => e.destroy());
      this.conversionBannerObjs = [];
      this.conversionPending = false;
      this.coinCount -= COINS_TO_CONVERT;
      if (this.hudCoinsText) this.hudCoinsText.setText(String(this.coinCount));
      this.lastConversionThreshold = Math.floor(this.coinCount / COINS_TO_CONVERT);
      this.companionStars = Math.min(3, this.companionStars + 1);
      this.updateHudStars();
      this.showReadyPopup();
    });
  }

  showReadyBanner() {
    const bannerY = this.conversionPending ? 44 : 0;
    const CW = 1280;
    const bg  = this.add.rectangle(CW / 2, bannerY + 20, CW, 40, 0x1a0a2e, 0.88)
      .setScrollFactor(0).setDepth(30);
    const txt = this.add.text(12, bannerY + 20,
      '\u2736 Companion ready!  Press TAB to switch control', {
        fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#c8aaff'
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(30);

    this.readyBannerObjs = [bg, txt];
  }

  showModeIndicator(name) {
    if (this.modeIndicator) {
      this.modeIndicator.forEach(e => e.destroy());
      this.modeIndicator = null;
    }
    const label = name === 'SABLE'
      ? '[ SABLE ]  TAB to switch back'
      : '[ MAEVEA ]  TAB to switch';
    const color = name === 'SABLE' ? '#c8aaff' : '#f5c8a0';
    const bg = this.add.rectangle(640, 708, 440, 28, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(25);
    const txt = this.add.text(640, 708, label, {
      fontFamily: '"Press Start 2P"', fontSize: '7px', color
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(26);
    this.modeIndicator = [bg, txt];
    this.time.delayedCall(2500, () => {
      if (this.modeIndicator) {
        this.modeIndicator.forEach(e => e.destroy());
        this.modeIndicator = null;
      }
    });
  }

  showKeyCollectedBanner() {
    const CW = 1280;
    const bg = this.add.rectangle(CW / 2, 20, CW, 40, 0x1a0a2e, 0.92)
      .setScrollFactor(0).setDepth(30);
    const txt = this.add.text(CW / 2, 20,
      '\u2736 Key obtained! Find the lock to unlock the exit.', {
        fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#ffd700'
      }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(30);
    this.time.delayedCall(4000, () => {
      bg.destroy();
      txt.destroy();
    });
  }

  clearLastLifeWarning() {
    if (this.hudHeartBlink) {
      this.hudHeartBlink.stop();
      this.hudHeartBlink = null;
      if (this.hudHearts[0]) this.hudHearts[0].setAlpha(1);
    }
    if (this.vignetteGfx) {
      this.vignetteGfx.destroy();
      this.vignetteGfx = null;
    }
  }

  triggerCompanionDeath() {
    if (this.isDead) return;
    this.isDead = true;

    // Switch camera back to player and restore player control
    this.companionControlMode = false;
    this.player.body.moves = false;
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Companion death tween — spin and fall
    if (this.companion) {
      this.tweens.add({
        targets: this.companion,
        angle: 360,
        y: this.companion.y + 250,
        alpha: 0,
        duration: 900,
        ease: 'Cubic.In',
        onComplete: () => {
          if (this.companion) this.companion.destroy();
          this.companion = null;
        }
      });
    }

    this.cameras.main.shake(400, 0.02);

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000)
      .setScrollFactor(0).setDepth(45).setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 0.7, duration: 1000 });

    this.time.delayedCall(1500, () => {
      const goText = this.add.text(640, 280, 'SABLE FELL...', {
        fontFamily: '"Press Start 2P"',
        fontSize: '36px',
        color: '#cc44ff',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setAlpha(0);

      const subText = this.add.text(640, 350, 'GAME OVER', {
        fontFamily: '"Press Start 2P"',
        fontSize: '24px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setAlpha(0);

      const retryText = this.add.text(640, 430, 'PRESS SPACE TO RETRY', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setAlpha(0);

      this.tweens.add({
        targets: [goText, subText, retryText],
        alpha: 1,
        duration: 500
      });

      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.restart();
      });
    });
  }

  triggerDeathSequence() {
    if (this.isDead) return;
    this.isDead = true;
    this.levelComplete = true;

    this.player.body.setVelocity(0, 0);
    this.player.body.moves = false;
    this.player.anims.play('fallDown', true);

    if (this.companion) {
      this.tweens.add({
        targets: this.companion,
        angle: 360,
        y: this.companion.y + 250,
        alpha: 0,
        duration: 900,
        ease: 'Cubic.In'
      });
    }

    this.cameras.main.shake(400, 0.02);

    // Black overlay fades in (depth 45 = below text at 50)
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000)
      .setScrollFactor(0).setDepth(45).setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 0.7, duration: 1000 });

    this.time.delayedCall(1500, () => {
      const goText = this.add.text(640, 310, 'GAME OVER', {
        fontFamily: '"Press Start 2P"',
        fontSize: '48px',
        color: '#ff0000',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setAlpha(0);

      const retryText = this.add.text(640, 410, 'PRESS SPACE TO RETRY', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setAlpha(0);

      this.tweens.add({ targets: [goText, retryText], alpha: 1, duration: 500 });

      this.input.keyboard.once('keydown-SPACE', () => {
        this.scene.restart();
      });
    });
  }

  onHazard(playerObj, hazard) {
    if (this.isInvincible || this.levelComplete) return;
    this.isInvincible = true;
    this.playerLives--;
    this.updateHudLives();

    if (this.playerLives <= 0) {
      this.triggerDeathSequence();
      return;
    }

    this.player.anims.play('hurt');

    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 9,
      onComplete: () => { this.player.setAlpha(1); this.isInvincible = false; }
    });
  }

  spawnSingleCoin(block) {
    const coin = this.add.image(block.x, block.y - 16, 'coin_gold')
      .setScale(0.6).setDepth(5);
    this.tweens.add({
      targets: coin,
      y: block.y - 80,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.Out',
      onComplete: () => { coin.destroy(); }
    });
    this.coinCount++;
    if (this.hudCoinsText) this.hudCoinsText.setText(String(this.coinCount));
    this.checkCoinConversion();
  }

  spawnCoinBurst(block, count) {
    this.coinCount += count;
    if (this.hudCoinsText) this.hudCoinsText.setText(String(this.coinCount));
    this.checkCoinConversion();
    this.showFloatingText(block.x, block.y - 48, `+${count}`, '#ffd700');

    for (let i = 0; i < count; i++) {
      const delay   = i * 25;
      const spreadX = (Math.random() - 0.5) * 140;
      const upDist  = 90 + Math.random() * 70;
      const coin    = this.add.image(block.x, block.y - 32, 'coin_gold')
        .setScale(0.5).setDepth(5).setAlpha(0);

      this.time.delayedCall(delay, () => {
        coin.setAlpha(1);
        this.tweens.add({
          targets: coin,
          x: block.x + spreadX,
          y: block.y - 32 - upDist,
          duration: 220,
          ease: 'Cubic.Out',
          onComplete: () => {
            this.tweens.add({
              targets: coin,
              y: block.y + 16,
              alpha: 0,
              duration: 380,
              ease: 'Cubic.In',
              onComplete: () => coin.destroy()
            });
          }
        });
      });
    }
  }

  onBlockHit(block) {
    const key   = block.texture.key;
    const origY = block.y;

    this.tweens.add({
      targets: block,
      y: origY - 8,
      duration: 80,
      yoyo: true,
      onComplete: () => { block.y = origY; block.refreshBody(); }
    });

    if (key === 'block_coin_active') {
      this.spawnSingleCoin(block);
      this.time.delayedCall(200, () => { block.setTexture('block_coin'); block.refreshBody(); });

    } else if (key === 'block_strong_coin_active') {
      this.spawnCoinBurst(block, 12);
      this.time.delayedCall(200, () => { block.setTexture('block_strong_coin'); block.refreshBody(); });

    } else if (key === 'block_exclamation_active') {
      const heart = this.add.image(block.x, block.y - 48, 'hud_heart')
        .setScale(0.5).setDepth(5);
      this.tweens.add({
        targets: heart, y: block.y - 96, alpha: 0, duration: 600,
        onComplete: () => { heart.destroy(); }
      });
      this.playerLives = Math.min(this.playerLives + 1, 9);
      this.updateHudLives();
      this.time.delayedCall(200, () => { block.setTexture('block_exclamation'); block.refreshBody(); });

    } else if (key === 'block_strong_exclamation_active') {
      if (!this.isInvincible) {
        this.isInvincible = true;
        this.showFloatingText(block.x, block.y - 48, 'SHIELD!', '#ffd700');
        this.player.setTint(0xffd700);
        const shieldTween = this.tweens.add({
          targets: this.player, alpha: 0.7, duration: 150, yoyo: true, repeat: -1
        });
        this.time.delayedCall(2000, () => {
          shieldTween.stop();
          this.player.clearTint();
          this.player.setAlpha(1);
          this.isInvincible = false;
        });
      }
      this.time.delayedCall(200, () => { block.setTexture('block_strong_exclamation'); block.refreshBody(); });

    } else if (key === 'block_yellow') {
      if (Math.random() < 0.6) this.spawnSingleCoin(block);
      this.time.delayedCall(200, () => { block.setTexture('block_empty'); block.refreshBody(); });
    }
  }

  showLockPopup(lockTile) {
    this.conversionPopupOpen = true;
    this.player.body.moves = false;

    const PX = 640, PY = 360;
    const panel  = this.add.rectangle(PX, PY, 480, 180, 0x000033, 0.88)
      .setScrollFactor(0).setDepth(60);
    const border = this.add.graphics().setScrollFactor(0).setDepth(60);
    border.lineStyle(2, 0xffd700, 1);
    border.strokeRect(PX - 240, PY - 90, 480, 180);

    const msg = this.add.text(PX, PY - 28, 'Map Fragment Found!\nUnlock the exit?', {
      fontFamily: '"Press Start 2P"', fontSize: '13px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3, align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61);

    const unlockBtn = this.add.text(PX, PY + 52, '[ UNLOCK ]', {
      fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#00ff88',
      stroke: '#000000', strokeThickness: 2, backgroundColor: '#003311',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61).setInteractive({ useHandCursor: true });

    const elements = [panel, border, msg, unlockBtn];

    unlockBtn.on('pointerdown', () => {
      elements.forEach(e => e.destroy());
      this.conversionPopupOpen = false;
      this.player.body.moves = true;
      lockTile.setActive(false).setVisible(false);
      if (lockTile.body) lockTile.body.enable = false;
      this.showMapFragmentPopup();
    });

    unlockBtn.on('pointerover', () => unlockBtn.setColor('#ffffff'));
    unlockBtn.on('pointerout',  () => unlockBtn.setColor('#00ff88'));
  }

  showMapFragmentPopup() {
    this.conversionPopupOpen = true;
    this.player.body.moves = false;

    const PX = 640, PY = 360;
    const elements = [];

    const panel = this.add.rectangle(PX, PY, 700, 450, 0x050f05, 0.95)
      .setScrollFactor(0).setDepth(60);
    elements.push(panel);

    const border = this.add.graphics().setScrollFactor(0).setDepth(60);
    border.lineStyle(2, 0xffd700, 1);
    border.strokeRect(PX - 350, PY - 225, 700, 450);
    elements.push(border);

    const title = this.add.text(PX, PY - 190, 'Map Fragment Recovered!', {
      fontFamily: '"Press Start 2P"', fontSize: '13px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61);
    elements.push(title);

    // Image area — use loaded asset if available, placeholder rect otherwise
    let glowTarget;
    if (this.textures.exists('map_fragment_1')) {
      glowTarget = this.add.image(PX, PY - 30, 'map_fragment_1')
        .setScrollFactor(0).setDepth(61).setDisplaySize(400, 260);
      elements.push(glowTarget);
    } else {
      const placeholder = this.add.rectangle(PX, PY - 30, 400, 260, 0x1a2a1a)
        .setScrollFactor(0).setDepth(61);
      elements.push(placeholder);
      glowTarget = placeholder;
      const placeholderTxt = this.add.text(PX, PY - 30, '[ Map Fragment ]', {
        fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#44aa44'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(62);
      elements.push(placeholderTxt);
    }

    // Golden glow tween on the image / placeholder
    this.tweens.add({
      targets: glowTarget,
      alpha: 0.6,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    const subText = this.add.text(PX, PY + 145, 'The path forward is revealed...', {
      fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61);
    elements.push(subText);

    const contBtn = this.add.text(PX, PY + 190, '[ CONTINUE ]', {
      fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffd700',
      stroke: '#000000', strokeThickness: 2, backgroundColor: '#332200',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61).setInteractive({ useHandCursor: true });
    elements.push(contBtn);

    contBtn.on('pointerdown', () => {
      this.tweens.killTweensOf(glowTarget);
      elements.forEach(e => e.destroy());
      this.conversionPopupOpen = false;
      this.player.body.moves = true;
      this.mapFragmentFound = true;
      this.showFloatingText(this.player.x, this.player.y - 80, 'EXIT UNLOCKED!', '#ffd700');
    });

    contBtn.on('pointerover', () => contBtn.setColor('#ffffff'));
    contBtn.on('pointerout',  () => contBtn.setColor('#ffd700'));
  }

  triggerWinSequence() {
    this.isDead = true;   // stops update() input processing

    this.player.body.moves = false;
    this.player.body.setVelocity(0, 0);
    this.companionReady = false;

    // White flash
    const flash = this.add.rectangle(640, 360, 1280, 720, 0xffffff)
      .setScrollFactor(0).setDepth(45).setAlpha(0);
    this.tweens.add({ targets: flash, alpha: 0.8, duration: 800 });

    this.time.delayedCall(1000, () => {
      flash.destroy();

      // ── Gradient sky background ──
      const winBg = this.add.graphics().setScrollFactor(0).setDepth(48);
      winBg.setAlpha(0);
      winBg.fillGradientStyle(0xc8a4d4, 0xc8a4d4, 0xe8b4c0, 0xe8b4c0, 1);
      winBg.fillRect(0, 0, 1280, 360);
      winBg.fillGradientStyle(0xf5c9a0, 0xf5c9a0, 0xd4875a, 0xd4875a, 1);
      winBg.fillRect(0, 360, 1280, 360);
      this.tweens.add({ targets: winBg, alpha: 1, duration: 400 });

      // ── Star scatter — top of screen ──
      const winStarGfx = this.add.graphics().setScrollFactor(0).setDepth(49);
      winStarGfx.fillStyle(0xffecd8, 1);
      for (let i = 0; i < 8; i++) {
        winStarGfx.fillCircle(
          Math.floor(Math.random() * 1260) + 10,
          Math.floor(Math.random() * 100) + 5,
          2
        );
      }
      winStarGfx.setAlpha(0.5);
      this.tweens.add({
        targets: winStarGfx, alpha: 0.1,
        duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut'
      });

      this.time.delayedCall(400, () => {
        // ── "YOU ESCAPED!" ──
        const winText = this.add.text(640, 160, 'YOU ESCAPED!', {
          fontFamily: '"Press Start 2P"',
          fontSize: '48px',
          color: '#f5d47a',
          stroke: '#8040c0',
          strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setAlpha(0);

        this.tweens.add({ targets: winText, alpha: 1, duration: 600, onComplete: () => {
          this.tweens.add({
            targets: winText, alpha: 0.7, duration: 1200,
            yoyo: true, repeat: -1, ease: 'Sine.InOut'
          });
        }});

        // ── Character icons ──
        const charHead = this.add.image(580, 280, 'char_head')
          .setScale(2.0).setScrollFactor(0).setDepth(50).setAlpha(0);
        const compHead = this.add.image(700, 280, 'hud_player_purple')
          .setScale(2.0).setScrollFactor(0).setDepth(50).setAlpha(0);

        this.tweens.add({ targets: [charHead, compHead], alpha: 1, duration: 600 });
        this.time.delayedCall(600, () => {
          this.tweens.add({
            targets: charHead, y: 268,
            duration: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut'
          });
          this.tweens.add({
            targets: compHead, y: 268,
            duration: 800, delay: 200, yoyo: true, repeat: -1, ease: 'Sine.InOut'
          });
        });

        // ── Narrative text — two lines ──
        const line1 = this.add.text(640, 370, 'Maevea and Sable made it out.', {
          fontFamily: '"Press Start 2P"',
          fontSize: '9px',
          color: '#ffecd8',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setAlpha(0);

        const line2 = this.add.text(640, 395, 'The Atlas awaits...', {
          fontFamily: '"Press Start 2P"',
          fontSize: '9px',
          color: '#ffecd8',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setAlpha(0);

        this.tweens.add({
          targets: [line1, line2], alpha: 1,
          duration: 800, delay: 600
        });

        // ── Play Again button with background rect ──
        const btnBg = this.add.graphics().setScrollFactor(0).setDepth(50);
        btnBg.fillStyle(0x8040c0, 0.8);
        btnBg.fillRoundedRect(530, 462, 220, 36, 8);
        btnBg.setAlpha(0);

        const playAgainBtn = this.add.text(640, 480, '[ PLAY AGAIN ]', {
          fontFamily: '"Press Start 2P"',
          fontSize: '14px',
          color: '#fac775',
          stroke: '#000000',
          strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setAlpha(0)
          .setInteractive({ useHandCursor: true });

        this.tweens.add({ targets: [btnBg, playAgainBtn], alpha: 1, duration: 600 });

        playAgainBtn.on('pointerdown', () => { this.scene.restart(); });
        playAgainBtn.on('pointerover',  () => playAgainBtn.setTint(0xffffff));
        playAgainBtn.on('pointerout',   () => playAgainBtn.clearTint());

        this.input.keyboard.once('keydown-SPACE', () => { this.scene.restart(); });
      });
    });
  }

  onCollect(playerObj, item) {
    if (!item.active) return;
    item.setActive(false);
    item.body.enable = false;
    const texKey = item.texture.key;

    this.tweens.add({
      targets: item,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 200,
      onComplete: () => { item.destroy(); }
    });

    if (texKey.startsWith('coin')) {
      this.coinCount++;
      if (this.hudCoinsText) this.hudCoinsText.setText(String(this.coinCount));
      this.checkCoinConversion();
    } else if (texKey.startsWith('gem')) {
      this.gemCount++;
      if (this.hudGemsText) this.hudGemsText.setText(String(this.gemCount));
    } else if (texKey.startsWith('key_')) {
      this.keysCollected++;
      if (this.hudKeysText) this.hudKeysText.setText(`${this.keysCollected}/${this.totalKeys}`);
      this.showFloatingText(item.x, item.y - 40, 'KEY COLLECTED', '#00ff88');
    }
  }

  onDoor(playerObj, door) {
    if (this.levelComplete || this.doorCooldown) return;
    this.doorCooldown = true;
    this.time.delayedCall(2000, () => { this.doorCooldown = false; });
    if (this.mapFragmentFound && this.keysCollected >= this.totalKeys) {
      this.levelComplete = true;
      this.triggerWinSequence();
    } else if (this.keysCollected < this.totalKeys) {
      this.showFloatingText(door.x, door.y - 64, 'Find the key first!', '#ff4444');
    } else {
      this.showFloatingText(door.x, door.y - 64, 'Find the map fragment first!', '#ff4444');
    }
  }
}
