// ゲームの設定
export const CONFIG = {
    // プレイヤー設定
    PLAYER: {
        HEIGHT: 1.8,
        EYE_HEIGHT: 1.7,
        SPEED: 5.4, // VALORANTの通常移動速度（5.4 m/s）
        RUN_SPEED: 3.6, // VALORANTの歩行速度（3.6 m/s）
        ACCELERATION: 0.3, // より素早い加速
        DECELERATION: 0.15, // 減速調整
        JUMP_FORCE: 1.4, // VALORANTのジャンプ初速
        GRAVITY: 0.4, // VALORANTの重力加速度
        MAX_FALL_SPEED: 20, // 最大落下速度
        COLLISION_RADIUS: 0.4, // プレイヤーの当たり判定半径
        COLLISION_MARGIN: 0.1  // 壁とのすり抜け防止マージン
    },

    // マップ設定
    MAP: {
        SIZE: 700, // マップサイズを約7倍に
        WALL_HEIGHT: 40, // 壁の高さも大幅に調整
        SITE_SIZE: 120, // サイトも大きく
        BOXES: {
            SMALL: { width: 3, height: 2, depth: 3 },
            MEDIUM: { width: 4, height: 3, depth: 4 },
            LARGE: { width: 6, height: 4, depth: 6 }
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
