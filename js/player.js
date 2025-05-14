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
        this.isCrouching = false;
        this.inAir = false;
        this.health = 100;
        this.shield = 50;
        this.currentAcceleration = CONFIG.PLAYER.INITIAL_ACCELERATION;
        this.lastMoveDirection = new THREE.Vector3();
        this.smoothedVelocity = new THREE.Vector3();
        this.isTagged = false; // 被弾状態
        this.spawnPoint = CONFIG.MAP.SPAWN_POINTS.ATTACKER;
        this.respawn();

        this.setupControls();
        this.setupCollisionSystem();
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
            // しゃがみ制御
            if (event.key === 'Control') {
                this.toggleCrouch(true);
            }
        });

        document.addEventListener('keyup', event => {
            this.keys[event.key] = false;
            // しゃがみ解除
            if (event.key === 'Control') {
                this.toggleCrouch(false);
            }
        });

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

    setupCollisionSystem() {
        // 当たり判定用のレイキャスターを作成
        this.collisionRays = [];
        const segments = CONFIG.PLAYER.COLLISION_SEGMENTS;
        
        // 水平方向の当たり判定レイ
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const direction = new THREE.Vector3(
                Math.cos(angle),
                0,
                Math.sin(angle)
            );
            this.collisionRays.push({
                direction: direction,
                raycaster: new THREE.Raycaster(
                    new THREE.Vector3(),
                    direction,
                    0,
                    CONFIG.PLAYER.COLLISION_RADIUS + CONFIG.PLAYER.COLLISION_MARGIN
                )
            });
        }

        // 上下方向の当たり判定レイ
        this.verticalRays = {
            up: new THREE.Raycaster(
                new THREE.Vector3(),
                new THREE.Vector3(0, 1, 0),
                0,
                CONFIG.PLAYER.HEIGHT - CONFIG.PLAYER.CROUCH_HEIGHT + 0.1
            ),
            down: new THREE.Raycaster(
                new THREE.Vector3(),
                new THREE.Vector3(0, -1, 0),
                0,
                CONFIG.PLAYER.HEIGHT
            )
        };
    }

    toggleCrouch(crouch) {
        if (crouch && !this.isCrouching) {
            this.isCrouching = true;
            this.height = CONFIG.PLAYER.CROUCH_HEIGHT;
            this.eyeHeight = CONFIG.PLAYER.CROUCH_HEIGHT - 0.1;
            this.camera.position.y = this.eyeHeight;
        } else if (!crouch && this.isCrouching) {
            // 頭上の衝突チェック
            if (!this.checkCeilingCollision()) {
                this.isCrouching = false;
                this.height = CONFIG.PLAYER.HEIGHT;
                this.eyeHeight = CONFIG.PLAYER.EYE_HEIGHT;
                this.camera.position.y = this.eyeHeight;
            }
        }
    }

    checkCeilingCollision() {
        // 頭上の空間をチェック
        const upRay = new THREE.Raycaster(
            this.camera.position,
            new THREE.Vector3(0, 1, 0),
            0,
            CONFIG.PLAYER.HEIGHT - CONFIG.PLAYER.CROUCH_HEIGHT
        );
        const colliders = this.getColliders();
        const intersects = upRay.intersectObjects(colliders);
        return intersects.length > 0;
    }

    jump() {
        this.velocity.y = this.jumpForce;
        this.canJump = false;
        this.inAir = true;
    }

    update() {
        if (!document.pointerLockElement) return;

        const direction = this.getMovementDirection();
        this.updateVelocity(direction);
        this.updatePosition();
    }

    getMovementDirection() {
        const direction = new THREE.Vector3();
        let moveCount = 0;
        
        if (this.keys['w']) {
            direction.z -= Math.cos(this.yaw);
            direction.x -= Math.sin(this.yaw);
            moveCount++;
        }
        if (this.keys['s']) {
            direction.z += Math.cos(this.yaw);
            direction.x += Math.sin(this.yaw);
            moveCount++;
        }
        if (this.keys['a']) {
            direction.x -= Math.cos(this.yaw);
            direction.z += Math.sin(this.yaw);
            moveCount++;
        }
        if (this.keys['d']) {
            direction.x += Math.cos(this.yaw);
            direction.z -= Math.sin(this.yaw);
            moveCount++;
        }
        
        if (moveCount > 1) {
            // 斜め移動時は速度を調整
            direction.multiplyScalar(CONFIG.PLAYER.DIAGONAL_SPEED_MULTIPLIER);
        }
        
        return direction.normalize();
    }

    updateVelocity(direction) {
        this.isRunning = this.keys['Shift'];
        let currentSpeed;
        if (this.isCrouching) {
            currentSpeed = CONFIG.PLAYER.CROUCH_SPEED;
        } else if (this.isRunning) {
            currentSpeed = CONFIG.PLAYER.RUN_SPEED;
        } else {
            currentSpeed = CONFIG.PLAYER.SPEED;
        }

        // 被弾時の減速
        if (this.isTagged) {
            currentSpeed *= CONFIG.PLAYER.TAGGING_MULTIPLIER;
        }

        const hasInput = direction.length() > 0;
        let horizontalVelocity = new THREE.Vector2(this.velocity.x, this.velocity.z);
        
        if (hasInput) {
            // 移動方向が逆転したかチェック（カウンターストレイフ）
            const dotProduct = direction.dot(this.lastMoveDirection);
            if (dotProduct < -0.5 && !this.inAir) {
                // 地上での逆方向入力時の急停止
                horizontalVelocity.multiplyScalar(0.1);
                this.currentAcceleration = CONFIG.PLAYER.INITIAL_ACCELERATION;
            }

            // 加速度の更新
            if (!this.inAir) {
                this.currentAcceleration = Math.min(
                    this.currentAcceleration + CONFIG.PLAYER.ACCELERATION_RATE,
                    CONFIG.PLAYER.MAX_ACCELERATION
                );
            }

            // 移動力の計算
            let moveForce = new THREE.Vector2(direction.x, direction.z);
            const accelerationMultiplier = this.inAir ? 
                CONFIG.PLAYER.AIR_ACCELERATION : 
                this.currentAcceleration;

            moveForce.multiplyScalar(accelerationMultiplier);

            // 速度に加算
            horizontalVelocity.add(moveForce);

            // 現在の移動方向を保存
            this.lastMoveDirection.copy(direction);
        } else {
            // 入力がない場合の減速
            this.currentAcceleration = CONFIG.PLAYER.INITIAL_ACCELERATION;
            const stoppingDeceleration = this.inAir ? 
                CONFIG.PLAYER.DECELERATION * 0.5 : 
                CONFIG.PLAYER.STOPPING_DECELERATION;

            horizontalVelocity.multiplyScalar(1 - stoppingDeceleration);

            // 速度が閾値以下なら停止
            if (horizontalVelocity.length() < CONFIG.PLAYER.STOPPING_THRESHOLD) {
                horizontalVelocity.set(0, 0);
            }
        }

        // 最大速度制限
        if (horizontalVelocity.length() > currentSpeed) {
            horizontalVelocity.normalize().multiplyScalar(currentSpeed);
        }

        // 直接速度を適用（スムージングを簡略化）
        this.velocity.x = horizontalVelocity.x;
        this.velocity.z = horizontalVelocity.y;

        // 重力の適用（空中にいる時のみ）
        if (this.inAir) {
            this.velocity.y = Math.max(-this.maxFallSpeed, this.velocity.y - this.gravity);
        }
    }

    updatePosition() {
        let nextPosition = this.camera.position.clone();
        let collision = false;

        // Y軸の移動を適用（重力と跳躍）
        nextPosition.y += this.velocity.y;
        const minHeight = this.isCrouching ? CONFIG.PLAYER.CROUCH_HEIGHT : CONFIG.PLAYER.EYE_HEIGHT;
        
        // 床との衝突判定
        const floorRaycaster = new THREE.Raycaster(
            new THREE.Vector3(nextPosition.x, nextPosition.y + 1, nextPosition.z),
            new THREE.Vector3(0, -1, 0),
            0,
            this.height * 2
        );

        const colliders = this.getColliders();
        const intersects = floorRaycaster.intersectObjects(colliders);

        if (intersects.length > 0) {
            // 床との衝突があった場合
            const floorHeight = intersects[0].point.y;
            if (nextPosition.y < floorHeight + minHeight) {
                nextPosition.y = floorHeight + minHeight;
                this.velocity.y = 0;
                this.canJump = true;
                this.inAir = false;
            }
        } else if (nextPosition.y < minHeight) {
            // スポーンエリアでの最小高さの保持
            nextPosition.y = minHeight;
            this.velocity.y = 0;
            this.canJump = true;
            this.inAir = false;
        }

        // 水平方向の移動を分割して適用（X軸とZ軸を個別にチェック）
        const xMove = new THREE.Vector3(this.velocity.x, 0, 0);
        const zMove = new THREE.Vector3(0, 0, this.velocity.z);

        // X軸の移動をチェック
        let xNextPos = this.camera.position.clone().add(xMove);
        xNextPos.y = nextPosition.y;
        if (!this.checkCollisions(xNextPos)) {
            nextPosition.x = xNextPos.x;
        } else {
            this.velocity.x = 0;
            collision = true;
        }

        // Z軸の移動をチェック
        let zNextPos = nextPosition.clone().add(zMove);
        if (!this.checkCollisions(zNextPos)) {
            nextPosition.z = zNextPos.z;
        } else {
            this.velocity.z = 0;
            collision = true;
        }

        // 最終位置を適用
        this.camera.position.copy(nextPosition);

        return collision;
    }

    checkCollisions(position) {
        const colliders = this.getColliders();
        if (!colliders.length) return false;

        // プレイヤーのカプセル型判定用のパラメータ
        const radius = CONFIG.PLAYER.COLLISION_RADIUS;
        const height = this.isCrouching ? CONFIG.PLAYER.CROUCH_HEIGHT : CONFIG.PLAYER.HEIGHT;
        const margin = CONFIG.PLAYER.COLLISION_MARGIN;

        // プレイヤーの上部と下部の位置
        const playerBottom = position.y - height/2;
        const playerTop = position.y + height/2;

        for (const collider of colliders) {
            const box = new THREE.Box3().setFromObject(collider);
            
            // XZ平面での距離チェック
            const boxCenterX = (box.max.x + box.min.x) / 2;
            const boxCenterZ = (box.max.z + box.min.z) / 2;
            const dx = position.x - boxCenterX;
            const dz = position.z - boxCenterZ;
            const boxHalfWidth = (box.max.x - box.min.x) / 2;
            const boxHalfDepth = (box.max.z - box.min.z) / 2;

            // XZ平面での最近接点を計算
            const closestX = Math.max(box.min.x - margin, Math.min(position.x, box.max.x + margin));
            const closestZ = Math.max(box.min.z - margin, Math.min(position.z, box.max.z + margin));

            // XZ平面での距離を計算
            const distanceXZ = Math.sqrt(
                Math.pow(position.x - closestX, 2) +
                Math.pow(position.z - closestZ, 2)
            );

            // 水平方向の衝突判定
            if (distanceXZ < radius + margin) {
                // 垂直方向の衝突判定
                if (playerBottom < box.max.y && playerTop > box.min.y) {
                    // 衝突からの押し戻し
                    if (Math.abs(dx) > Math.abs(dz)) {
                        // X軸方向の押し戻し
                        const pushX = dx > 0 ? 
                            box.max.x + radius + margin - position.x :
                            box.min.x - radius - margin - position.x;
                        position.x += pushX;
                    } else {
                        // Z軸方向の押し戻し
                        const pushZ = dz > 0 ?
                            box.max.z + radius + margin - position.z :
                            box.min.z - radius - margin - position.z;
                        position.z += pushZ;
                    }
                    return true;
                }
            }
        }

        return false;
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

    // 被弾時に呼び出すメソッド
    applyTagging() {
        this.isTagged = true;
        setTimeout(() => {
            this.isTagged = false;
        }, 500); // 500ms後に回復
    }

    respawn() {
        this.camera.position.set(
            this.spawnPoint.x,
            this.spawnPoint.y,
            this.spawnPoint.z
        );
        this.velocity.set(0, 0, 0);
        this.canJump = true;
        this.inAir = false;
        this.health = 100;
        this.shield = 50;
    }
}
