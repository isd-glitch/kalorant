import * as THREE from 'three';
import { CONFIG } from './config.js';

export class GameMap {
    constructor(scene) {
        this.scene = scene;
        this.materials = this.createMaterials();
    }

    createMaterials() {
        return {
            floor: new THREE.MeshStandardMaterial({
                color: 0xe0e0e0,
                roughness: 0.8,
                metalness: 0.2
            }),
            wall: new THREE.MeshStandardMaterial({
                color: 0xf5f5f5,
                roughness: 0.6,
                metalness: 0.2
            }),
            accent: new THREE.MeshStandardMaterial({
                color: 0x00ff87,
                roughness: 0.3,
                metalness: 0.7
            }),
            site: new THREE.MeshStandardMaterial({
                color: 0x00ff87,
                roughness: 0.4,
                metalness: 0.6
            })
        };
    }

    create() {
        this.createFloor();
        this.createWalls();
        this.createSites();
        this.createTacticalElements();
    }

    createFloor() {
        const geometry = new THREE.PlaneGeometry(CONFIG.MAP.SIZE, CONFIG.MAP.SIZE);
        const floor = new THREE.Mesh(geometry, this.materials.floor);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    createWall(width, height, depth, x, y, z) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const wall = new THREE.Mesh(geometry, this.materials.wall);
        wall.position.set(x, y, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        this.scene.add(wall);
        return wall;
    }

    createWalls() {
        const walls = [
            { width: CONFIG.MAP.SIZE, height: CONFIG.MAP.WALL_HEIGHT, depth: 2, x: 0, y: 8, z: -CONFIG.MAP.SIZE/2 },
            { width: CONFIG.MAP.SIZE, height: CONFIG.MAP.WALL_HEIGHT, depth: 2, x: 0, y: 8, z: CONFIG.MAP.SIZE/2 },
            { width: 2, height: CONFIG.MAP.WALL_HEIGHT, depth: CONFIG.MAP.SIZE, x: -CONFIG.MAP.SIZE/2, y: 8, z: 0 },
            { width: 2, height: CONFIG.MAP.WALL_HEIGHT, depth: CONFIG.MAP.SIZE, x: CONFIG.MAP.SIZE/2, y: 8, z: 0 }
        ];

        walls.forEach(wall => this.createWall(wall.width, wall.height, wall.depth, wall.x, wall.y, wall.z));
    }

    createSites() {
        // サイトA
        const siteA = this.createWall(20, 0.5, 20, -30, 0.25, -30);
        siteA.material = this.materials.site;
        this.createWall(2, 4, 8, -25, 2, -25);
        this.createWall(8, 4, 2, -35, 2, -35);

        // サイトの文字A
        this.createSiteText('A', -30, -30);

        // サイトB
        const siteB = this.createWall(20, 0.5, 20, 30, 0.25, 30);
        siteB.material = this.materials.site;
        this.createWall(2, 4, 8, 25, 2, 25);
        this.createWall(8, 4, 2, 35, 2, 35);

        // サイトの文字B
        this.createSiteText('B', 30, 30);
    }

    createSiteText(letter, x, z) {
        const textGeometry = new THREE.BoxGeometry(3, 0.5, 0.2);
        const textMesh = new THREE.Mesh(textGeometry, this.materials.accent);
        textMesh.position.set(x, 0.3, z);
        textMesh.rotation.x = -Math.PI / 2;
        this.scene.add(textMesh);
    }

    createTacticalElements() {
        // ミッドエリア
        this.createMidArea();
        
        // Aサイト
        this.createASite();
        
        // Bサイト
        this.createBSite();
        
        // コネクター
        this.createConnectors();
        
        // 各スポーン地点
        this.createSpawnAreas();
    }

    createMidArea() {
        // メインミッド中央
        this.createWall(80, 8, 4, 0, 4, 0); // メイン壁
        this.createWall(4, 8, 40, -30, 4, 0); // 左サイドの壁
        this.createWall(4, 8, 40, 30, 4, 0); // 右サイドの壁

        // ミッドボックス
        this.createWall(20, 6, 20, 0, 3, -20); // 中央ボックス
        
        // ミッドマーケット（拡張）
        this.createWall(60, CONFIG.MAP.WALL_HEIGHT, 4, -90, CONFIG.MAP.WALL_HEIGHT/2, -40);
        this.createWall(4, CONFIG.MAP.WALL_HEIGHT, 80, -120, CONFIG.MAP.WALL_HEIGHT/2, 0);
        
        // ピザショップ
        this.createWall(40, CONFIG.MAP.WALL_HEIGHT, 4, 80, CONFIG.MAP.WALL_HEIGHT/2, -60);
        this.createWall(4, CONFIG.MAP.WALL_HEIGHT, 40, 100, CONFIG.MAP.WALL_HEIGHT/2, -40);
        
        // キャットウォーク
        this.createWall(4, 2, 80, 60, 12, -80);
        this.createWall(4, 12, 4, 60, 6, -40); // サポート柱
    }

    createASite() {
        // メインサイト
        const siteA = this.createWall(CONFIG.MAP.SITE_SIZE, 1, CONFIG.MAP.SITE_SIZE, -200, 0.5, -200);
        siteA.material = this.materials.site;

        // ジェネレーター
        this.createWall(30, 8, 30, -180, 4, -180);
        
        // ヘブン
        this.createWall(40, CONFIG.MAP.WALL_HEIGHT, 4, -220, CONFIG.MAP.WALL_HEIGHT/2, -160);
        this.createWall(4, CONFIG.MAP.WALL_HEIGHT, 40, -240, CONFIG.MAP.WALL_HEIGHT/2, -180);
        
        // A-メイン
        this.createWall(4, 8, 60, -160, 4, -120);
        this.createWall(40, 8, 4, -180, 4, -90);
    }

    createBSite() {
        // メインサイト
        const siteB = this.createWall(CONFIG.MAP.SITE_SIZE, 1, CONFIG.MAP.SITE_SIZE, 200, 0.5, 200);
        siteB.material = this.materials.site;

        // スタック
        this.createWall(40, 12, 40, 180, 6, 180);
        
        // B-バックサイト
        this.createWall(60, CONFIG.MAP.WALL_HEIGHT, 4, 220, CONFIG.MAP.WALL_HEIGHT/2, 160);
        this.createWall(4, CONFIG.MAP.WALL_HEIGHT, 60, 250, CONFIG.MAP.WALL_HEIGHT/2, 190);
        
        // B-ロング
        this.createWall(4, 8, 120, 160, 4, 80);
        this.createWall(80, 8, 4, 200, 4, 20);
    }

    createConnectors() {
        // A-コネクター
        this.createWall(4, 8, 60, -80, 4, -60);
        this.createWall(40, 8, 4, -100, 4, -30);
        
        // B-コネクター
        this.createWall(4, 8, 60, 80, 4, 60);
        this.createWall(40, 8, 4, 100, 4, 30);
        
        // 各所の小さなカバー
        const tacticalBoxes = [
            { x: -120, z: -120, size: 'MEDIUM' }, // Aサイト近く
            { x: 120, z: 120, size: 'MEDIUM' },   // Bサイト近く
            { x: -40, z: -40, size: 'SMALL' },    // ミッド寄りA
            { x: 40, z: 40, size: 'SMALL' },      // ミッド寄りB
            { x: 0, z: -80, size: 'SMALL' },      // ミッド上部
            { x: 0, z: 80, size: 'SMALL' }        // ミッド下部
        ];

        tacticalBoxes.forEach(box => {
            const size = CONFIG.MAP.BOXES[box.size];
            this.createWall(
                size.width,
                size.height,
                size.depth,
                box.x,
                size.height/2,
                box.z
            );
        });
    }

    createSpawnAreas() {
        // アタッカースポーン
        this.createWall(120, CONFIG.MAP.WALL_HEIGHT, 4, 0, CONFIG.MAP.WALL_HEIGHT/2, -320);
        this.createWall(4, CONFIG.MAP.WALL_HEIGHT, 80, -60, CONFIG.MAP.WALL_HEIGHT/2, -280);
        this.createWall(4, CONFIG.MAP.WALL_HEIGHT, 80, 60, CONFIG.MAP.WALL_HEIGHT/2, -280);
        
        // ディフェンダースポーン
        this.createWall(120, CONFIG.MAP.WALL_HEIGHT, 4, 0, CONFIG.MAP.WALL_HEIGHT/2, 320);
        this.createWall(4, CONFIG.MAP.WALL_HEIGHT, 80, -60, CONFIG.MAP.WALL_HEIGHT/2, 280);
        this.createWall(4, CONFIG.MAP.WALL_HEIGHT, 80, 60, CONFIG.MAP.WALL_HEIGHT/2, 280);
    }
}
