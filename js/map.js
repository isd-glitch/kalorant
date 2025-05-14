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
                color: 0xff4655, // VALORANTの赤
                roughness: 0.3,
                metalness: 0.7
            }),
            site: new THREE.MeshStandardMaterial({
                color: 0x101823, // VALORANTのダークブルー
                roughness: 0.4,
                metalness: 0.6
            })
        };
    }

    create() {
        this.createBase();
        this.createMid();
        this.createASite();
        this.createBSite();
        this.createRamps();
        this.createHeaven();
    }

    createBase() {
        // メインフロア
        this.createFloor();

        // 外周の壁
        this.createWall(CONFIG.MAP.SIZE, CONFIG.MAP.WALL_HEIGHT, 2, 0, CONFIG.MAP.WALL_HEIGHT/2, -CONFIG.MAP.SIZE/2);
        this.createWall(CONFIG.MAP.SIZE, CONFIG.MAP.WALL_HEIGHT, 2, 0, CONFIG.MAP.WALL_HEIGHT/2, CONFIG.MAP.SIZE/2);
        this.createWall(2, CONFIG.MAP.WALL_HEIGHT, CONFIG.MAP.SIZE, -CONFIG.MAP.SIZE/2, CONFIG.MAP.WALL_HEIGHT/2, 0);
        this.createWall(2, CONFIG.MAP.WALL_HEIGHT, CONFIG.MAP.SIZE, CONFIG.MAP.SIZE/2, CONFIG.MAP.WALL_HEIGHT/2, 0);
    }

    createMid() {
        // ミッド中央の段差
        this.createElevatedPlatform(30, 2, 20, 0, 1, 0);
        
        // ミッドの両サイドの壁
        this.createWall(2, CONFIG.MAP.WALL_HEIGHT, 30, -15, CONFIG.MAP.WALL_HEIGHT/2, 0);
        this.createWall(2, CONFIG.MAP.WALL_HEIGHT, 30, 15, CONFIG.MAP.WALL_HEIGHT/2, 0);
        
        // ベント（通路）
        this.createVent(-20, 2, -10, 5, 3, 15);
        this.createVent(20, 2, 10, 5, 3, 15);
    }

    createASite() {
        // Aサイトのメインエリア
        this.createElevatedPlatform(30, 1, 30, -35, 0.5, -35);
        
        // ボックスとカバー
        this.createBox(4, 4, 4, -30, 2, -30);
        this.createBox(6, 3, 2, -40, 1.5, -35);
        
        // Aメイン
        this.createWall(2, CONFIG.MAP.WALL_HEIGHT, 40, -20, CONFIG.MAP.WALL_HEIGHT/2, -20);
        this.createWall(30, CONFIG.MAP.WALL_HEIGHT, 2, -35, CONFIG.MAP.WALL_HEIGHT/2, 0);
    }

    createBSite() {
        // Bサイトのメインエリア
        this.createElevatedPlatform(30, 1, 30, 35, 0.5, 35);
        
        // サイト内のカバー
        this.createBox(5, 5, 5, 30, 2.5, 30);
        this.createBox(2, 3, 8, 40, 1.5, 35);
        
        // Bメイン
        this.createWall(40, CONFIG.MAP.WALL_HEIGHT, 2, 20, CONFIG.MAP.WALL_HEIGHT/2, 20);
        this.createWall(2, CONFIG.MAP.WALL_HEIGHT, 30, 40, CONFIG.MAP.WALL_HEIGHT/2, 35);
    }

    createRamps() {
        // Aサイドのランプ
        this.createRamp(-25, -15, -30, 3);
        
        // Bサイドのランプ
        this.createRamp(25, 15, 30, 3);
    }

    createHeaven() {
        // Aヘブン
        this.createElevatedPlatform(20, 4, 20, -40, 4, -40);
        this.createBox(3, 2, 10, -35, 5, -45);
        
        // Bヘブン
        this.createElevatedPlatform(20, 4, 20, 40, 4, 40);
        this.createBox(10, 2, 3, 45, 5, 35);
    }

    createElevatedPlatform(width, height, depth, x, y, z) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const platform = new THREE.Mesh(geometry, this.materials.floor);
        platform.position.set(x, y, z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        platform.userData.isCollider = true;  // コリジョンフラグを追加
        platform.userData.isFloor = true;     // 床であることを示すフラグを追加
        this.scene.add(platform);
        return platform;
    }

    createBox(width, height, depth, x, y, z) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const box = new THREE.Mesh(geometry, this.materials.accent);
        box.position.set(x, y, z);
        box.castShadow = true;
        box.receiveShadow = true;
        box.userData.isCollider = true;  // コリジョンフラグを設定
        this.scene.add(box);
        return box;
    }

    createWall(width, height, depth, x, y, z) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const wall = new THREE.Mesh(geometry, this.materials.wall);
        wall.position.set(x, y, z);
        wall.castShadow = true;
        wall.receiveShadow = true;
        wall.userData.isCollider = true;  // コリジョンフラグを設定
        this.scene.add(wall);
        return wall;
    }

    createVent(x, y, z, width, height, depth) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const vent = new THREE.Mesh(geometry, this.materials.wall);
        vent.position.set(x, y, z);
        vent.castShadow = true;
        vent.receiveShadow = true;
        this.scene.add(vent);
    }

    createRamp(x, y, z, height) {
        const shape = new THREE.Shape();
        shape.moveTo(-5, 0);
        shape.lineTo(5, height);
        shape.lineTo(5, 0);
        shape.lineTo(-5, 0);

        const extrudeSettings = {
            steps: 1,
            depth: 10,
            bevelEnabled: false
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const ramp = new THREE.Mesh(geometry, this.materials.floor);
        ramp.position.set(x, y, z);
        ramp.castShadow = true;
        ramp.receiveShadow = true;
        this.scene.add(ramp);
    }

    createFloor() {
        // スポーンエリアを除外した床の作成
        const spawnAreaSize = 10; // スポーンエリアのサイズ

        // 床を4つのセクションに分けて作成
        const sections = [
            // 左側の床
            {x: -CONFIG.MAP.SIZE/4 - spawnAreaSize/2, z: 0, width: CONFIG.MAP.SIZE/2 - spawnAreaSize, height: CONFIG.MAP.SIZE},
            // 右側の床
            {x: CONFIG.MAP.SIZE/4 + spawnAreaSize/2, z: 0, width: CONFIG.MAP.SIZE/2 - spawnAreaSize, height: CONFIG.MAP.SIZE},
            // 上側の床
            {x: 0, z: -CONFIG.MAP.SIZE/4 - spawnAreaSize/2, width: spawnAreaSize, height: CONFIG.MAP.SIZE/2 - spawnAreaSize},
            // 下側の床
            {x: 0, z: CONFIG.MAP.SIZE/4 + spawnAreaSize/2, width: spawnAreaSize, height: CONFIG.MAP.SIZE/2 - spawnAreaSize}
        ];

        sections.forEach(section => {
            const geometry = new THREE.PlaneGeometry(section.width, section.height);
            const floor = new THREE.Mesh(geometry, this.materials.floor);
            floor.rotation.x = -Math.PI / 2;
            floor.position.set(section.x, 0, section.z);
            floor.receiveShadow = true;
            floor.userData.isCollider = true;
            this.scene.add(floor);
        });
    }
}
