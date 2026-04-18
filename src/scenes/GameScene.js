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
    this.load.image('character_purple_idle',  'assets/sprites/companion/character_purple_idle.png');
    this.load.image('character_purple_front', 'assets/sprites/companion/character_purple_front.png');

    // ── Character head — from PNG/Parts/, used for HUD icon ───────────────
    this.load.image('char_head', 'assets/sprites/character/PNG/Parts/head.png');
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
      } else {
        s = this.platformsGroup.create(tile.x, tile.y, tile.key);
      }
      s.refreshBody();
    });

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
    this.keyJ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.keyK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);

    // When attack animation finishes: disable hitbox, enter cooldown, then ready
    this.player.on('animationcomplete', (animObj) => {
      if (animObj.key === 'attack' || animObj.key === 'kick') {
        this.attackZone.body.enable = false;
        this.attackState = 'cooldown';
        this.time.delayedCall(200, () => { this.attackState = 'ready'; });
      }
    });

    // ── HUD ─────────────────────────────────────────────────────────────────
    //  Row 1 (y=16):  char_head icon  +  3× player hearts   spacing=28
    //  Row 2 (y=56):  companion icon  +  3× companion hearts spacing=28
    //  Row 2.5 (y=96): companion energy stars
    //  Row 3 (y=136): coins icon + count
    //  Row 4 (y=176): gems icon + count
    //  Row 5 (y=216): keys icon + count
    const hudStyle = {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    };

    // Row 1: Maevea — char_head icon + 3 player hearts
    this.add.image(16, 16, 'char_head')
      .setScale(0.5).setScrollFactor(0).setDepth(20);
    for (let i = 0; i < 3; i++) {
      this.hudHearts.push(
        this.add.image(44 + i * 28, 16, 'hud_heart')
          .setScale(0.5).setScrollFactor(0).setDepth(20)
      );
    }

    // Row 2: Sable — companion icon + 3 companion hearts
    this.hudCompanionIcon = this.add.image(16, 56, 'hud_player_purple')
      .setScale(0.5).setScrollFactor(0).setDepth(20);
    for (let i = 0; i < 3; i++) {
      this.hudCompanionHearts.push(
        this.add.image(44 + i * 28, 56, 'hud_heart')
          .setScale(0.5).setScrollFactor(0).setDepth(20)
      );
    }

    // Row 3: Coins
    this.add.image(16, 136, 'coin_gold')
      .setScale(0.5).setScrollFactor(0).setDepth(20);
    this.hudCoinsText = this.add.text(40, 136, '0', hudStyle)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(20);

    // Row 4: Gems
    this.add.image(16, 176, 'gem_yellow')
      .setScale(0.5).setScrollFactor(0).setDepth(20);
    this.hudGemsText = this.add.text(40, 176, '0', hudStyle)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(20);

    // Row 5: Keys
    this.add.image(16, 216, 'hud_key_yellow')
      .setScale(0.5).setScrollFactor(0).setDepth(20);
    this.hudKeysText = this.add.text(40, 216, `0/${this.totalKeys}`, hudStyle)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(20);

    this.updatePlayerHearts();
    this.updateCompanionHearts();
    this.updateHudStars();

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

    // Ready banner dismiss — triggers when companion first moves after OK
    if (this.companionReady && !this.companionOperating && Math.abs(this.player.body.velocity.x) > 5) {
      this.companionOperating = true;
      if (this.readyBannerObjs.length > 0) {
        this.readyBannerObjs.forEach(e => e.destroy());
        this.readyBannerObjs = [];
      }
      if (this.hudStars.length > 0) {
        if (this.starGlowTween) { this.starGlowTween.stop(); this.starGlowTween = null; }
        this.tweens.add({
          targets: this.hudStars,
          scaleX: 0.46, scaleY: 0.46,
          duration: 200,
          yoyo: true,
          ease: 'Sine.InOut',
          onComplete: () => {
            if (this.companionStars === 3 && this.hudStars.length > 0) {
              this.starGlowTween = this.tweens.add({
                targets: this.hudStars, scaleX: 0.44, scaleY: 0.44,
                duration: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut'
              });
            }
          }
        });
      }
    }

    // Companion follow
    if (this.companion) {
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

    // Coyote time
    if (onGround) {
      this.coyoteTimer = COYOTE_MS;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }
    const canJump = this.coyoteTimer > 0;

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
      `\n[J] attack  [K] kick  [G] hitboxes`
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
        key === 'saw' || key.startsWith('bomb') ||
        key.startsWith('water'))   return 'hazard';
    if (key.startsWith('ladder'))  return 'ladder';
    if (key.startsWith('door'))    return 'door';
    if (key.startsWith('coin'))    return 'collectible';
    if (key.startsWith('gem'))     return 'collectible';
    if (key.startsWith('key_'))    return 'collectible';
    if (key.startsWith('lock'))    return 'terrain';
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

    const yesBtn = this.add.text(PX - 110, PY + 38, '[ YES \u2014 Convert ]', {
      fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#00ff88',
      stroke: '#000000', strokeThickness: 2, backgroundColor: '#003311',
      padding: { x: 8, y: 6 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61).setInteractive({ useHandCursor: true });

    const noBtn = this.add.text(PX + 110, PY + 38, '[ Not Yet ]', {
      fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#ff6666',
      stroke: '#000000', strokeThickness: 2, backgroundColor: '#330011',
      padding: { x: 8, y: 6 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61).setInteractive({ useHandCursor: true });

    const elements = [panel, border, line1, line2, yesBtn, noBtn];

    const closePopup = () => {
      elements.forEach(e => e.destroy());
      this.conversionPopupOpen = false;
      this.player.body.moves = true;
    };

    yesBtn.on('pointerdown', () => {
      closePopup();
      this.coinCount -= COINS_TO_CONVERT;
      if (this.hudCoinsText) this.hudCoinsText.setText(String(this.coinCount));
      this.lastConversionThreshold = Math.floor(this.coinCount / COINS_TO_CONVERT);
      this.companionStars = Math.min(3, this.companionStars + 1);
      this.updateHudStars();
      this.showReadyPopup();
    });

    noBtn.on('pointerdown', () => {
      closePopup();
      this.conversionAvailable = false;
      this.showConversionBanner();
    });

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

    const okBtn = this.add.text(PX, PY + 44, '[ OK ]', {
      fontFamily: '"Press Start 2P"', fontSize: '12px', color: '#ffd700',
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

  updateHudStars() {
    this.hudStars.forEach(s => s.destroy());
    this.hudStars = [];
    if (this.starGlowTween) { this.starGlowTween.stop(); this.starGlowTween = null; }

    for (let i = 0; i < 3; i++) {
      const star = this.add.image(48 + i * 20, 96, 'star')
        .setScale(0.4).setScrollFactor(0).setDepth(20);
      if (i >= this.companionStars) star.setAlpha(0.3);
      this.hudStars.push(star);
    }

    if (this.companionStars === 3) {
      this.starGlowTween = this.tweens.add({
        targets: this.hudStars,
        scaleX: 0.44, scaleY: 0.44,
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
      '\u2736 Companion ready to operate!', {
        fontFamily: '"Press Start 2P"', fontSize: '7px', color: '#c8aaff'
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(30);

    this.readyBannerObjs = [bg, txt];
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

    this.time.delayedCall(1500, () => {
      this.scene.start('GameOverScene', {
        score: (this.coinCount || 0) + (this.gemCount || 0)
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
    if (this.keysCollected >= this.totalKeys) {
      this.levelComplete = true;
      this.time.delayedCall(50, () => { this.doorGroup.clear(true, true); });
      this.showFloatingText(door.x, door.y - 64, 'LEVEL COMPLETE!', '#ffff00');
      console.log('LEVEL COMPLETE');
    } else {
      this.showFloatingText(door.x, door.y - 64, 'FIND ALL KEYS FIRST', '#ff4444');
    }
  }
}
