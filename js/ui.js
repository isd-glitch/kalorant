export class GameUI {
    constructor(player, weaponSystem) {
        this.player = player;
        this.weaponSystem = weaponSystem;
        this.setupWeaponUI();
        this.setupUIElements();
        
        // 武器切り替え時のコールバックを設定
        this.weaponSystem.setWeaponSwitchCallback(() => this.updateWeaponDisplay());
    }

    setupUIElements() {
        this.elements = {
            health: document.getElementById('health'),
            shield: document.getElementById('shield'),
            money: document.getElementById('money'),
            roundInfo: document.getElementById('round-info'),
            timer: document.getElementById('timer')
        };
    }

    setupWeaponUI() {
        // 武器UIコンテナの作成
        this.weaponContainer = document.createElement('div');
        this.weaponContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 10px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(this.weaponContainer);

        // 武器スロットの作成
        this.weaponSlots = {
            primary: this.createWeaponSlot('primary'),
            secondary: this.createWeaponSlot('secondary'),
            knife: this.createWeaponSlot('knife')
        };

        // フェードアウトタイマー
        this.fadeTimeout = null;
    }

    createWeaponSlot(type) {
        const slot = document.createElement('div');
        slot.className = 'weapon-slot';
        slot.style.cssText = `
            padding: 8px 15px;
            background-color: rgba(0, 0, 0, 0.5);
            color: rgba(255, 255, 255, 0.7);
            border-radius: 5px;
            font-family: 'Arial', sans-serif;
            font-size: 16px;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateX(20px);
        `;
        this.weaponContainer.appendChild(slot);
        return slot;
    }

    updateWeaponDisplay() {
        const inventory = this.weaponSystem.inventory;
        const current = this.weaponSystem.current;

        // UIコンテナを表示
        this.showWeaponUI();

        // すべてのスロットを更新
        ['primary', 'secondary', 'knife'].forEach(type => {
            const weapon = inventory[type];
            const slot = this.weaponSlots[type];
            
            if (weapon) {
                slot.textContent = this.formatWeaponName(weapon);
                slot.style.opacity = '1';
                slot.style.transform = 'translateX(0)';
                
                if (weapon === current) {
                    slot.style.backgroundColor = 'rgba(0, 255, 135, 0.3)';
                    slot.style.color = '#ffffff';
                } else {
                    slot.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    slot.style.color = 'rgba(255, 255, 255, 0.7)';
                }
            } else {
                slot.style.opacity = '0';
                slot.style.transform = 'translateX(20px)';
            }
        });
    }

    showWeaponUI() {
        // 既存のフェードアウトタイマーをクリア
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
        }

        // UIコンテナを表示
        this.weaponContainer.style.opacity = '1';

        // 3秒後にフェードアウト
        this.fadeTimeout = setTimeout(() => {
            this.weaponContainer.style.opacity = '0';
        }, 3000);
    }

    formatWeaponName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');
    }

    update() {
        // HP・シールドの更新
        this.elements.health.textContent = `${this.player.health} HP`;
        this.elements.shield.textContent = `${this.player.shield} SHIELD`;
        
        // 武器情報の更新
        this.updateWeaponDisplay();
    }

    updateRoundInfo(round, timeLeft) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        this.elements.roundInfo.textContent = `Round ${round}`;
        this.elements.timer.textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    updateMoney(money) {
        this.elements.money.textContent = `${money}¢`;
    }
}
