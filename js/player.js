import * as THREE from 'three';
import { CONFIG } from './config.js';

export class Player {
    constructor(camera) {
        this.camera = camera;
        this.velocity = new THREE.Vector3();
        this.height = CONFIG.PLAYER.HEIGHT;
        this.eyeHeight = CONFIG.PLAYER.EYE_HEIGHT;
        this.speed = CONFIG.PLAYER.SPEED;
        this.runSpeed = CONFIG.PLAYER.RUN_SPEED;
        this.acceleration = CONFIG.PLAYER.ACCELERATION;
        this.deceleration = CONFIG.PLAYER.DECELERATION;
        this.jumpForce = CONFIG.PLAYER.JUMP_FORCE;
        this.gravity = CONFIG.PLAYER.GRAVITY;
        this.maxFallSpeed = CONFIG.PLAYER.MAX_FALL_SPEED;
        this.canJump = true;
        this.isRunning = false;
        this.health = 100;
        this.shield = 50;

        this.setupControls();
    }

    setupControls() {
        this.keys = {};
        this.yaw = 0;
        this.pitch = 0;

        document.addEventListener('keydown', event => {
            this.keys[event.key] = true;
            if (event.key === ' ' && this.canJump) {
                this.jump();
            }
        });

        document.addEventListener('keyup', event => this.keys[event.key] = false);

        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === document.body) {
                this.yaw -= event.movementX * 0.002;
                this.pitch -= event.movementY * 0.002;
                this.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.pitch));
                
                this.camera.rotation.order = 'YXZ';
                this.camera.rotation.y = this.yaw;
                this.camera.rotation.x = this.pitch;
            }
        });

        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
    }

    jump() {
        this.velocity.y = this.jumpForce;
        this.canJump = false;
    }

    update() {
        if (!document.pointerLockElement) return;

        const direction = this.getMovementDirection();
        this.updateVelocity(direction);
        this.updatePosition();
    }

    getMovementDirection() {
        const direction = new THREE.Vector3();
        
        if (this.keys['w']) {
            direction.z = -Math.cos(this.yaw);
            direction.x = -Math.sin(this.yaw);
        }
        if (this.keys['s']) {
            direction.z = Math.cos(this.yaw);
            direction.x = Math.sin(this.yaw);
        }
        if (this.keys['a']) {
            direction.x = -Math.cos(this.yaw);
            direction.z = Math.sin(this.yaw);
        }
        if (this.keys['d']) {
            direction.x = Math.cos(this.yaw);
            direction.z = -Math.sin(this.yaw);
        }
        
        return direction.normalize();
    }

    updateVelocity(direction) {
        this.isRunning = this.keys['Shift'];
        const currentSpeed = this.isRunning ? this.runSpeed : this.speed;

        if (direction.length() > 0) {
            this.velocity.x += direction.x * this.acceleration;
            this.velocity.z += direction.z * this.acceleration;
        } else {
            this.velocity.x *= (1 - this.deceleration);
            this.velocity.z *= (1 - this.deceleration);
        }

        const horizontalVelocity = new THREE.Vector2(this.velocity.x, this.velocity.z);
        if (horizontalVelocity.length() > currentSpeed) {
            horizontalVelocity.normalize();
            horizontalVelocity.multiplyScalar(currentSpeed);
            this.velocity.x = horizontalVelocity.x;
            this.velocity.z = horizontalVelocity.y;
        }

        this.velocity.y = Math.max(-this.maxFallSpeed, this.velocity.y - this.gravity);
    }

    updatePosition() {
        // Y軸の移動を先に適用（重力と跳躍）
        const nextY = this.camera.position.y + this.velocity.y;
        if (nextY < this.eyeHeight) {
            this.camera.position.y = this.eyeHeight;
            this.velocity.y = 0;
            this.canJump = true;
        } else {
            this.camera.position.y = nextY;
        }

        // 水平方向の移動を計算
        const horizontalMove = new THREE.Vector3(
            this.velocity.x,
            0,
            this.velocity.z
        );

        if (horizontalMove.length() > 0) {
            // まず試しに移動
            const nextPosition = this.camera.position.clone().add(horizontalMove);
            
            // 衝突判定
            if (this.checkCollision(nextPosition)) {
                // 衝突した場合、X軸とZ軸を個別にチェック
                const xMove = new THREE.Vector3(this.velocity.x, 0, 0);
                const zMove = new THREE.Vector3(0, 0, this.velocity.z);
                
                const xNextPos = this.camera.position.clone().add(xMove);
                if (!this.checkCollision(xNextPos)) {
                    this.camera.position.x = xNextPos.x;
                }
                
                const zNextPos = this.camera.position.clone().add(zMove);
                if (!this.checkCollision(zNextPos)) {
                    this.camera.position.z = zNextPos.z;
                }
            } else {
                // 衝突がない場合は通常通り移動
                this.camera.position.add(horizontalMove);
            }
        }

        // 移動後に再度地面との衝突をチェック
        if (this.camera.position.y < this.eyeHeight) {
            this.camera.position.y = this.eyeHeight;
            this.velocity.y = 0;
            this.canJump = true;
        }
    }

    checkCollision(position) {
        const playerRadius = CONFIG.PLAYER.COLLISION_RADIUS;
        const margin = CONFIG.PLAYER.COLLISION_MARGIN;
        
        // プレイヤーのカプセル型当たり判定（円柱+上下の半球）
        const playerCapsule = new THREE.Line3(
            new THREE.Vector3(position.x, position.y - this.height/2 + playerRadius, position.z),
            new THREE.Vector3(position.x, position.y + this.height/2 - playerRadius, position.z)
        );

        // 全てのコリジョンオブジェクトをチェック
        const colliders = this.getColliders();
        for (const collider of colliders) {
            if (this.checkObjectCollision(playerCapsule, collider, playerRadius + margin)) {
                return true;
            }
        }

        return false;
    }

    checkObjectCollision(playerCapsule, object, radius) {
        // オブジェクトの境界ボックスを取得
        const box = new THREE.Box3().setFromObject(object);
        
        // まず大まかな判定（境界球での判定）
        const sphereCenter = playerCapsule.getCenter(new THREE.Vector3());
        const sphereRadius = playerCapsule.distance() / 2 + radius;
        if (!box.intersectsSphere(new THREE.Sphere(sphereCenter, sphereRadius))) {
            return false;
        }

        // より詳細な判定
        // 1. カプセルの中心軸とボックスの最近接点を計算
        const boxCenter = box.getCenter(new THREE.Vector3());
        const direction = playerCapsule.delta(new THREE.Vector3());
        const boxHalfSize = box.getSize(new THREE.Vector3()).multiplyScalar(0.5);

        // ボックスの各面との距離を計算
        const faces = [
            { normal: new THREE.Vector3(1, 0, 0), d: boxHalfSize.x },
            { normal: new THREE.Vector3(-1, 0, 0), d: boxHalfSize.x },
            { normal: new THREE.Vector3(0, 1, 0), d: boxHalfSize.y },
            { normal: new THREE.Vector3(0, -1, 0), d: boxHalfSize.y },
            { normal: new THREE.Vector3(0, 0, 1), d: boxHalfSize.z },
            { normal: new THREE.Vector3(0, 0, -1), d: boxHalfSize.z }
        ];

        for (const face of faces) {
            const dist = Math.abs(face.normal.dot(sphereCenter.sub(boxCenter))) - face.d;
            if (dist <= radius) {
                return true;
            }
        }

        return false;
    }

    getColliders() {
        // シーン内の全コリジョンオブジェクトを取得
        const colliders = [];
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.isMesh && 
                    (object.material === this.scene.getObjectByName('GameMap')?.materials?.wall ||
                     object.material === this.scene.getObjectByName('GameMap')?.materials?.floor)) {
                    colliders.push(object);
                }
            });
        }
        return colliders;
    }

    // シーンの初期化時に呼び出す
    setScene(scene) {
        this.scene = scene;
    }
}
