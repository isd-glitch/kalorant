// DOMContentLoadedイベントで初期化を行う
document.addEventListener('DOMContentLoaded', () => {
    // マウスポインターをロック
    document.addEventListener('click', () => {
        document.body.requestPointerLock();
    });

    // Three.jsのシーンをセットアップ
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // 背景色を設定

    // カメラをセットアップ（プレイヤーの目線の高さを1.8に設定）
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.8, 0);

    // レンダラーをセットアップ
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // 環境光を追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 平行光源を追加
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 0);
    scene.add(directionalLight);

    // 床を作成
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x555555,
        roughness: 0.8,
        metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // 壁を追加
    function createWall(width, height, depth, x, y, z) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x888888,
            roughness: 0.6,
            metalness: 0.2
        });
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(x, y, z);
        scene.add(wall);
        return wall;
    }

    // 周囲の壁を作成
    createWall(50, 5, 1, 0, 2.5, -25); // 奥の壁
    createWall(50, 5, 1, 0, 2.5, 25);  // 手前の壁
    createWall(1, 5, 50, -25, 2.5, 0); // 左の壁
    createWall(1, 5, 50, 25, 2.5, 0);  // 右の壁

    // バリアを追加
    function createBarrier(x, z) {
        const geometry = new THREE.BoxGeometry(2, 4, 0.1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3
        });
        const barrier = new THREE.Mesh(geometry, material);
        barrier.position.set(x, 2, z);
        scene.add(barrier);
    }

    // いくつかのバリアを配置
    createBarrier(-10, -5);
    createBarrier(10, 5);

    // 爆弾設置場所を作成
    const bombSiteGeometry = new THREE.CircleGeometry(3, 32);
    const bombSiteMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff4655,
        emissive: 0xff0000,
        emissiveIntensity: 0.2
    });

    const bombSiteA = new THREE.Mesh(bombSiteGeometry, bombSiteMaterial);
    bombSiteA.position.set(-10, 0.01, -10);
    bombSiteA.rotation.x = -Math.PI / 2;
    scene.add(bombSiteA);

    const bombSiteB = new THREE.Mesh(bombSiteGeometry, bombSiteMaterial);
    bombSiteB.position.set(10, 0.01, 10);
    bombSiteB.rotation.x = -Math.PI / 2;
    scene.add(bombSiteB);

    // プレイヤーの視点制御
    let rotationX = 0;
    let rotationY = 0;
    document.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body) {
            rotationY -= event.movementX * 0.002;
            rotationX -= event.movementY * 0.002;
            rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));
            
            camera.rotation.order = 'YXZ';
            camera.rotation.y = rotationY;
            camera.rotation.x = rotationX;
        }
    });

    // キー入力の管理
    const keys = {};
    window.addEventListener('keydown', (event) => keys[event.key] = true);
    window.addEventListener('keyup', (event) => keys[event.key] = false);

    // プレイヤーの移動
    function movePlayer() {
        if (!document.pointerLockElement) return;

        const speed = 0.15;
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        // 前後移動
        forward.setFromMatrixColumn(camera.matrix, 0);
        forward.crossVectors(camera.up, forward);
        
        // 左右移動
        right.setFromMatrixColumn(camera.matrix, 0);

        if (keys['w']) camera.position.addScaledVector(forward, speed);
        if (keys['s']) camera.position.addScaledVector(forward, -speed);
        if (keys['a']) camera.position.addScaledVector(right, -speed);
        if (keys['d']) camera.position.addScaledVector(right, speed);
    }

    // リサイズ処理
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // アニメーションループ
    function animate() {
        requestAnimationFrame(animate);
        movePlayer();
        renderer.render(scene, camera);
    }

    // アニメーションを開始
    animate();
});
