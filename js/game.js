import * as THREE from 'three';
import { GameMap } from './map.js';
import { Player } from './player.js';
import { WeaponSystem } from './weapons.js';
import { GameUI } from './ui.js';

export class Game {
    constructor() {
        this.setupScene();
        this.setupLighting();
        this.initializeGameComponents();
        this.animate();

        // ウィンドウリサイズへの対応
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 150);

        // カメラのセットアップ
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.8, 0);

        // レンダラーのセットアップ
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        // 環境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        // メインの指向性ライト
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(50, 200, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);

        // 補助光
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-50, 100, -100);
        this.scene.add(fillLight);
    }

    initializeGameComponents() {
        // マップの作成
        this.map = new GameMap(this.scene);
        this.map.create();

        // プレイヤーの作成
        this.player = new Player(this.camera);
        this.player.setScene(this.scene);

        // 武器システムの作成
        this.weapons = new WeaponSystem(this.scene, this.camera);
        
        // 初期武器の設定
        setTimeout(() => {
            this.weapons.switchWeapon('knife');
        }, 100);

        // UIの作成
        this.ui = new GameUI(this.player, this.weapons);

        // ラウンドの状態
        this.gameState = {
            round: 1,
            phase: 'buy',
            timeLeft: 100,
            money: 800
        };
    }

    update() {
        // プレイヤーの更新
        this.player.update();

        // UIの更新
        this.ui.update();
        this.ui.updateRoundInfo(this.gameState.round, this.gameState.timeLeft);
        this.ui.updateMoney(this.gameState.money);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}
