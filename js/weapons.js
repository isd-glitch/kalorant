import { CONFIG } from './config.js';

export class WeaponSystem {
    constructor() {
        this.current = 'classic';
        this.lastPrimary = null;
        this.inventory = {
            primary: null,
            secondary: 'classic',
            knife: 'tactical-knife'
        };
        this.stats = CONFIG.WEAPONS;
        this.switching = false;
        
        this.setupControls();
    }

    setupControls() {
        // 数字キーでの切り替え
        document.addEventListener('keydown', event => {
            if (this.switching) return;

            if (event.key === '1' && this.inventory.primary) {
                this.switchWeapon('primary');
            } else if (event.key === '2') {
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
    }

    switchWeapon(slot) {
        const weapon = this.inventory[slot];
        if (!weapon || weapon === this.current || this.switching) return;

        this.switching = true;
        const switchTime = this.stats[weapon.toUpperCase()].switchTime;

        if (slot === 'primary') {
            this.lastPrimary = weapon;
        }

        setTimeout(() => {
            this.current = weapon;
            this.switching = false;
            this.onWeaponSwitch();
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

    // コールバック設定
    setWeaponSwitchCallback(callback) {
        this.onWeaponSwitch = callback;
    }
}
