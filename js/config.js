// ゲームの設定
export const CONFIG = {
    // プレイヤー設定
    PLAYER: {
        HEIGHT: 1.8, // Valorantのプレイヤー身長（約1.8m）
        EYE_HEIGHT: 1.7, // 目線の高さ
        CROUCH_HEIGHT: 1.2, // しゃがみ時の高さ
        SPEED: 0.12, // 調整済み
        RUN_SPEED: 0.08, // 調整済み
        CROUCH_SPEED: 0.06, // 調整済み
        INITIAL_ACCELERATION: 0.15, // 初期加速度
        MAX_ACCELERATION: 0.3, // 最大加速度
        ACCELERATION_RATE: 0.1, // 加速度の増加率
        DECELERATION: 0.15, // 通常の減速度
        COUNTER_STRAFE_MULTIPLIER: 2.0, // 逆方向入力時の減速倍率
        JUMP_FORCE: 0.15,
        GRAVITY: 0.007,
        AIR_ACCELERATION: 0.05, // 空中での加速度（より制限的に）
        AIR_STRAFE_SPEED: 0.3, // 空中での方向転換速度（より制限的に）
        MAX_FALL_SPEED: 0.5,
        MOVEMENT_SMOOTHING: 0.85, // 移動のスムージング係数
        STOPPING_SMOOTHING: 0.92, // 停止時のスムージング係数
        DIAGONAL_SPEED_MULTIPLIER: 0.7071,
        STOPPING_DECELERATION: 0.25,
        STOPPING_THRESHOLD: 0.001,
        TAGGING_MULTIPLIER: 0.75, // 被弾時の減速係数
        COLLISION_RADIUS: 0.35,
        COLLISION_MARGIN: 0.05,
        COLLISION_HEIGHT: 1.8,
        COLLISION_SEGMENTS: 3
    },

    // マップ設定
    MAP: {
        SIZE: 100, // マップサイズ（Three.jsスケールに調整）
        WALL_HEIGHT: 6, // 壁の高さ
        SITE_SIZE: 20, // サイトサイズ
        SPAWN_POINTS: {
            ATTACKER: { x: 0, y: 1.8, z: -40 },
            DEFENDER: { x: 0, y: 1.8, z: 40 }
        },
        BOXES: {
            SMALL: { width: 1, height: 1, depth: 1 },
            MEDIUM: { width: 1.5, height: 1.5, depth: 1.5 },
            LARGE: { width: 2.5, height: 2, depth: 2.5 }
        }
    },

    // 武器設定
    WEAPONS: {
        CLASSIC: {
            damage: 26,
            fireRate: 0.4,
            magazine: 12,
            reserve: 36,
            switchTime: 0.75
        },
        VANDAL: {
            damage: 40,
            fireRate: 0.1,
            magazine: 25,
            reserve: 50,
            switchTime: 1.0
        },
        PHANTOM: {
            damage: 39,
            fireRate: 0.08,
            magazine: 30,
            reserve: 60,
            switchTime: 1.0
        },
        OPERATOR: {
            damage: 150,
            fireRate: 0.6,
            magazine: 5,
            reserve: 10,
            switchTime: 1.25
        },
        KNIFE: {
            damage: 50,
            switchTime: 0.5
        }
    }
};
