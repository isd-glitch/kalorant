import * as THREE from 'three';

export class TacticalKnife {
    constructor() {
        this.model = this.createKnifeModel();
        this.animations = {};
        this.currentAnimation = null;
        this.setupAnimations();
    }

    createKnifeModel() {
        const group = new THREE.Group();

        // 材質の定義
        const bladeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xc0c0c0,
            metalness: 0.9,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x303030,
            metalness: 0.8,
            roughness: 0.3
        });

        // ブレード（刃）部分
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(0, 0);
        bladeShape.lineTo(0.01, 0.15);  // 刃先
        bladeShape.lineTo(0, 0.145);    // 切っ先
        bladeShape.lineTo(-0.01, 0);    // 背

        const extrudeSettings = {
            steps: 1,
            depth: 0.004,
            bevelEnabled: true,
            bevelThickness: 0.002,
            bevelSize: 0.002,
            bevelSegments: 5
        };

        const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, extrudeSettings);
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        
        // 刃の光の反射エッジ
        const edgeGeometry = new THREE.BoxGeometry(0.001, 0.15, 0.001);
        const edgeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 1.0,
            roughness: 0.0,
            clearcoat: 1.0
        });
        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial);
        edge.position.x = 0.01;
        blade.add(edge);

        // ハンドル（柄）部分
        const handleGeometry = new THREE.CylinderGeometry(0.008, 0.01, 0.12, 8);
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.rotation.x = Math.PI / 2;
        handle.position.y = -0.04;

        // グリップテクスチャ（溝）
        const gripCount = 5;
        const gripMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x202020,
            metalness: 0.9,
            roughness: 0.4
        });

        for (let i = 0; i < gripCount; i++) {
            const gripGeometry = new THREE.CylinderGeometry(0.011, 0.011, 0.002, 8);
            const grip = new THREE.Mesh(gripGeometry, gripMaterial);
            grip.position.y = -0.02 - (i * 0.02);
            grip.rotation.x = Math.PI / 2;
            handle.add(grip);
        }

        // ガード（つば）部分
        const guardGeometry = new THREE.BoxGeometry(0.06, 0.008, 0.012);
        const guard = new THREE.Mesh(guardGeometry, bladeMaterial);
        guard.position.y = 0.02;

        // ポメル（柄頭）
        const pommelGeometry = new THREE.SphereGeometry(0.01, 8, 8);
        const pommel = new THREE.Mesh(pommelGeometry, bladeMaterial);
        pommel.position.y = -0.1;

        // パーツの組み立て
        blade.position.y = 0.1;
        
        group.add(blade);
        group.add(handle);
        group.add(guard);
        group.add(pommel);

        // モデルの位置とサイズの調整
        group.scale.set(0.8, 0.8, 0.8);
        group.position.set(0.4, -0.2, -0.3);
        group.rotation.set(0, -Math.PI / 4, Math.PI / 8);

        return group;
    }

    setupAnimations() {
        // 待機アニメーション
        this.animations.idle = {
            duration: 2000,
            update: (progress) => {
                const y = Math.sin(progress * Math.PI * 2) * 0.005;
                this.model.position.y = -0.2 + y;
            }
        };

        // 左クリック（スラッシュ）アニメーション
        this.animations.slash = {
            duration: 400,
            update: (progress) => {
                if (progress < 0.5) {
                    // 振り上げ
                    const p = progress * 2;
                    this.model.rotation.x = -Math.PI * 0.3 * p;
                    this.model.rotation.z = Math.PI * 0.2 * p;
                } else {
                    // 振り下ろし
                    const p = (progress - 0.5) * 2;
                    this.model.rotation.x = -Math.PI * 0.3 * (1 - p);
                    this.model.rotation.z = Math.PI * 0.2 * (1 - p);
                }
            },
            reset: () => {
                this.model.rotation.x = 0;
                this.model.rotation.z = 0;
            }
        };

        // 右クリック（突き）アニメーション
        this.animations.stab = {
            duration: 500,
            update: (progress) => {
                if (progress < 0.3) {
                    // 構え
                    const p = progress / 0.3;
                    this.model.position.z = -0.5 - 0.1 * p;
                    this.model.rotation.x = Math.PI * 0.1 * p;
                } else if (progress < 0.6) {
                    // 突き
                    const p = (progress - 0.3) / 0.3;
                    this.model.position.z = -0.6 + 0.3 * p;
                } else {
                    // 戻し
                    const p = (progress - 0.6) / 0.4;
                    this.model.position.z = -0.3 - 0.2 * p;
                }
            },
            reset: () => {
                this.model.position.z = -0.5;
                this.model.rotation.x = 0;
            }
        };

        // 装備アニメーション
        this.animations.equip = {
            duration: 600,
            update: (progress) => {
                if (progress < 1) {
                    const p = Math.sin(progress * Math.PI / 2);
                    this.model.position.x = 0.3 + (1 - p) * 0.3;
                    this.model.rotation.y = -Math.PI / 4 - (1 - p) * Math.PI;
                }
            }
        };
    }

    playAnimation(name) {
        if (this.currentAnimation) {
            if (this.currentAnimation.reset) {
                this.currentAnimation.reset();
            }
        }

        const animation = this.animations[name];
        if (animation) {
            this.currentAnimation = animation;
            const startTime = Date.now();

            const animate = () => {
                const now = Date.now();
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / animation.duration, 1);

                animation.update(progress);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    if (animation.reset) {
                        animation.reset();
                    }
                    this.currentAnimation = null;
                    // アイドルアニメーションに戻る
                    if (name !== 'idle') {
                        this.playAnimation('idle');
                    }
                }
            };

            animate();
        }
    }

    update() {
        // 必要に応じて追加の更新処理
    }
}
