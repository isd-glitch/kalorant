import { CONFIG } from './config.js';
import { TacticalKnife } from './weapons/knife.js';

export class WeaponSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.current = 'knife';
        this.lastPrimary = null;
        this.inventory = {
            primary: null,
            secondary: null,
            knife: 'tactical-knife'
        };
        this.stats = CONFIG.WEAPONS;
        this.switching = false;
        
        // 武器モデルの初期化
        this.models = {};
        this.initializeWeapons();
        
        this.setupControls();
    }

    initializeWeapons() {
        // タクティカルナイフの初期化
        this.models['tactical-knife'] = new TacticalKnife();
        
        // 初期武器を装備
        requestAnimationFrame(() => {
            this.equipWeapon('knife');
        });
    }

    setupControls() {
        // 数字キーでの切り替え
        document.addEventListener('keydown', event => {
            if (this.switching) return;

            if (event.key === '1' && this.inventory.primary) {
                this.switchWeapon('primary');
            } else if (event.key === '2' && this.inventory.secondary) {
                this.switchWeapon('secondary');
            } else if (event.key === '3') {
                this.switchWeapon('knife');
            } else if (event.key === 'q') {
                this.quickSwitch();
            }
        });

        // マウスホイールでの切り替え
        document.addEventListener('wheel', (event) => {
            if (this.switching) return;

            if (event.deltaY > 0) {
                this.switchToNextWeapon();
            } else {
                this.switchToPreviousWeapon();
            }
        });

        // マウスボタンのイベントリスナーを追加
        document.addEventListener('mousedown', (event) => {
            if (!this.switching && this.current === 'knife') {
                if (event.button === 0) { // 左クリック
                    this.models[this.inventory.knife].playAnimation('slash');
                } else if (event.button === 2) { // 右クリック
                    this.models[this.inventory.knife].playAnimation('stab');
                }
            }
        });

        // 右クリックメニューを無効化
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    }

    equipWeapon(slot) {
        // 前の武器をシーンから削除
        if (this.currentModel) {
            this.scene.remove(this.currentModel.model);
        }

        // 新しい武器をシーンに追加
        const weaponType = this.inventory[slot];
        if (weaponType && this.models[weaponType]) {
            this.currentModel = this.models[weaponType];
            this.scene.add(this.currentModel.model);
            this.currentModel.playAnimation('equip');
            
            // カメラの子要素として追加して視点に追従
            this.camera.add(this.currentModel.model);
        }
    }

    switchWeapon(slot) {
        const weapon = this.inventory[slot];
        if (!weapon || weapon === this.current || this.switching) return;

        this.switching = true;
        const switchTime = this.stats[weapon.toUpperCase()]?.switchTime || 0.5;

        if (this.currentModel) {
            // 現在の武器を非表示
            this.scene.remove(this.currentModel.model);
        }

        setTimeout(() => {
            this.current = weapon;
            this.equipWeapon(weapon);
            this.switching = false;
            this.onWeaponSwitch?.();
        }, switchTime * 1000);
    }

    quickSwitch() {
        if (this.current === this.inventory.knife) {
            if (this.lastPrimary) {
                this.switchWeapon('primary');
            } else {
                this.switchWeapon('secondary');
            }
        } else if (this.current === this.inventory.primary) {
            this.switchWeapon('secondary');
        } else {
            if (this.inventory.primary) {
                this.switchWeapon('primary');
            } else {
                this.switchWeapon('knife');
            }
        }
    }

    switchToNextWeapon() {
        if (this.current === this.inventory.primary) {
            this.switchWeapon('secondary');
        } else if (this.current === this.inventory.secondary) {
            this.switchWeapon('knife');
        } else {
            if (this.inventory.primary) {
                this.switchWeapon('primary');
            } else {
                this.switchWeapon('secondary');
            }
        }
    }

    switchToPreviousWeapon() {
        if (this.current === this.inventory.knife) {
            this.switchWeapon('secondary');
        } else if (this.current === this.inventory.secondary) {
            if (this.inventory.primary) {
                this.switchWeapon('primary');
            } else {
                this.switchWeapon('knife');
            }
        } else {
            this.switchWeapon('knife');
        }
    }

    getCurrentWeaponStats() {
        return this.stats[this.current.toUpperCase()];
    }

    update() {
        // 現在装備している武器のアニメーションを更新
        if (this.currentModel) {
            this.currentModel.update();
        }
    }

    // コールバック設定
    setWeaponSwitchCallback(callback) {
        this.onWeaponSwitch = callback;
    }
}
