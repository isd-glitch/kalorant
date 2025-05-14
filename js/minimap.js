import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Minimap {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.canvas = document.getElementById('minimapCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scale = 2; // マップのスケール

        // キャンバスのサイズを設定
        this.canvas.width = 200;
        this.canvas.height = 200;

        this.setupStyles();
    }

    setupStyles() {
        // 描画スタイルの設定
        this.styles = {
            background: '#1f1f1f',
            wall: '#ffffff',
            floor: '#3f3f3f',
            player: '#00ff87',
            playerDirection: '#00ff87'
        };
    }

    update() {
        this.clear();
        this.drawMap();
        this.drawPlayer();
    }

    clear() {
        // 背景をクリア
        this.ctx.fillStyle = this.styles.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMap() {
        // マップ要素の描画
        this.scene.traverse((object) => {
            if (object.isMesh) {
                const position = new THREE.Vector3();
                object.getWorldPosition(position);
                
                // オブジェクトの境界ボックスを取得
                const box = new THREE.Box3().setFromObject(object);
                const size = box.getSize(new THREE.Vector3());
                
                // ミニマップ上の座標に変換
                const x = this.worldToMinimapX(position.x);
                const y = this.worldToMinimapZ(position.z);
                const width = size.x * this.scale;
                const height = size.z * this.scale;
                
                // オブジェクトタイプに応じて色を設定
                if (object.material === this.scene.getObjectByName('GameMap')?.materials?.wall) {
                    this.ctx.fillStyle = this.styles.wall;
                } else if (object.material === this.scene.getObjectByName('GameMap')?.materials?.floor) {
                    this.ctx.fillStyle = this.styles.floor;
                } else {
                    return;
                }
                
                // オブジェクトを描画
                this.ctx.fillRect(
                    x - width/2, 
                    y - height/2, 
                    width, 
                    height
                );
            }
        });
    }

    drawPlayer() {
        // プレイヤーの位置を描画
        const x = this.worldToMinimapX(this.player.camera.position.x);
        const y = this.worldToMinimapZ(this.player.camera.position.z);
        
        // プレイヤーの位置を示す円を描画
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = this.styles.player;
        this.ctx.fill();
        
        // プレイヤーの向きを示す線を描画
        const angle = this.player.yaw;
        const directionLength = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
            x + Math.sin(-angle) * directionLength,
            y + Math.cos(-angle) * directionLength
        );
        this.ctx.strokeStyle = this.styles.playerDirection;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    worldToMinimapX(x) {
        return this.canvas.width/2 + x * this.scale;
    }

    worldToMinimapZ(z) {
        return this.canvas.height/2 + z * this.scale;
    }
}
