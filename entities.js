import Phaser from 'phaser';

// ─────────────────────────────────────────────────────────────────────────────
//  Fighter  –  Supreme Showdown: Constitutional Combat
//  Both characters have fully-articulated limbs (arms + legs as separate
//  graphics containers) so every move visually deforms the body.
// ─────────────────────────────────────────────────────────────────────────────
export class Fighter extends Phaser.GameObjects.Container {

    constructor(scene, x, y, characterId, isPlayer2 = false, isAI = false) {
        super(scene, x, y);
        this.scene       = scene;
        this.characterId = characterId;
        this.isPlayer2   = isPlayer2;
        this.isAI        = isAI;

        // ── stats ──────────────────────────────────────────────────────────
        this.maxHealth = 100;
        this.health    = 100;
        this.superMeter = 0;

        this.isStunned = false;
        this.stunTween = null;

        this.speed           = characterId === 'roe' ? 540 : 420;
        this.jumpForce       = characterId === 'roe' ? -1000 : -860;
        this.doubleJumpForce = characterId === 'roe' ? -900  : -750;
        this.jumpsRemaining  = 2;
        this.isGrounded      = false;

        this.isAttacking  = false;
        this.isSuperActive = false;
        this.facingRight   = !isPlayer2;

        this.lastAttackTime   = 0;
        this.attackCooldown   = 650;
        this.isBlocking       = false;

        this.comboStep        = 0;
        this.lastComboTime    = 0;
        this.comboResetDelay  = 900;

        this.isPrivacyShieldActive = false;
        this.isSovereignWallActive = false;

        // current move being executed  ('idle'|'kick'|'slash'|'teleport'|'tackle'|'special'|'super')
        this.currentMove = 'idle';

        this.setupStats();
        this.createVisuals();

        this.speechBubble = null;

        // ── physics ────────────────────────────────────────────────────────
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setCollideWorldBounds(true);
        this.body.setGravityY(2300);
        this.body.setDragX(1300);
        this.body.setSize(100, 210);
        this.body.setOffset(-50, -150);
    }

    // ─────────────────────────────────────────────────────────────────────────
    setupStats() {
        if (this.characterId === 'roe') {
            this.charName     = 'Roe';
            this.color        = 0x2563eb;
            this.glowingColor = 0x60a5fa;
            this.damageNormal = 8;
            this.voiceLines   = [
                "Precedent, not restriction!",
                "Due Process is absolute!",
                "The individual must be free!",
                "Privacy is a fundamental right!"
            ];
        } else {
            this.characterId  = 'wade';
            this.charName     = 'Wade';
            this.color        = 0xd92626;
            this.glowingColor = 0xfca5a5;
            this.damageNormal = 13;
            this.voiceLines   = [
                "Order must prevail!",
                "The State has authority!",
                "To preserve the union!",
                "The law is absolute!"
            ];
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  VISUALS  –  articulated body with separate limb containers
    // ─────────────────────────────────────────────────────────────────────────
    createVisuals() {
        // ground shadow
        this.shadow = this.scene.add.ellipse(0, 0, 120, 22, 0x000000, 0.45);
        this.add(this.shadow);

        this.spriteBody = this.scene.add.container(0, 0);
        this.add(this.spriteBody);

        // super aura
        this.aura = this.scene.add.graphics();
        this.aura.fillStyle(this.glowingColor, 0.14);
        this.aura.fillCircle(0, -95, 115);
        this.aura.lineStyle(3, this.glowingColor, 0.5);
        this.aura.strokeCircle(0, -95, 115);
        this.aura.setVisible(false);
        this.spriteBody.add(this.aura);

        if (this.characterId === 'roe') {
            this._buildRoe();
        } else {
            this._buildWade();
        }

        // shared: eyes & brows drawn over head
        this.eyes = this.scene.add.graphics();
        this._drawEyes();
        this.spriteBody.add(this.eyes);

        // shield gfx
        this.shieldGraphics = this.scene.add.graphics();
        this.shieldGraphics.setVisible(false);
        this.add(this.shieldGraphics);
    }

    // ── ROE ──────────────────────────────────────────────────────────────────
    _buildRoe() {
        // back cloak
        this.cloak = this.scene.add.graphics();
        this.cloak.fillStyle(0x1e3a8a, 1);
        this.cloak.lineStyle(2, 0x93c5fd, 0.85);
        this.cloak.beginPath();
        this.cloak.moveTo(-14, -128);
        this.cloak.lineTo(-72, -20);
        this.cloak.lineTo(-28, -4);
        this.cloak.lineTo(4, -114);
        this.cloak.closePath();
        this.cloak.fillPath(); this.cloak.strokePath();
        // Bill-of-Rights gold stars
        [[-45,-72],[-60,-44],[-34,-34],[-50,-100]].forEach(([cx,cy]) => {
            this.cloak.fillStyle(0xfde047, 0.9);
            this.cloak.fillCircle(cx, cy, 4);
        });
        this.spriteBody.add(this.cloak);

        // ── BACK ARM (left arm when facing right) ──
        this.armBackContainer = this.scene.add.container(-18, -95);
        const armBack = this.scene.add.graphics();
        armBack.fillStyle(0x1d4ed8, 1);
        armBack.fillRoundedRect(-6, 0, 12, 38, 5);        // upper arm
        armBack.fillStyle(0xfde047, 1);
        armBack.fillRoundedRect(-5, 36, 11, 22, 4);       // forearm/fist
        this.armBackContainer.add(armBack);
        this.spriteBody.add(this.armBackContainer);

        // ── BACK LEG ──
        this.legBackContainer = this.scene.add.container(-12, -40);
        const legBack = this.scene.add.graphics();
        legBack.fillStyle(0x312e81, 1);
        legBack.lineStyle(2, 0x1e1b4b, 1);
        legBack.fillRoundedRect(-10, 0, 18, 42, 5);       // thigh
        legBack.strokeRoundedRect(-10, 0, 18, 42, 5);
        legBack.fillStyle(0x1e1b4b, 1);
        legBack.fillRoundedRect(-10, 40, 20, 12, 3);      // boot
        this.legBackContainer.add(legBack);
        this.spriteBody.add(this.legBackContainer);

        // ── TORSO ──
        this.torso = this.scene.add.graphics();
        this.torso.fillStyle(0x2563eb, 1);
        this.torso.lineStyle(3, 0x1d4ed8, 1);
        this.torso.fillRoundedRect(-24, -130, 48, 90, 6);
        this.torso.strokeRoundedRect(-24, -130, 48, 90, 6);
        // sash belt
        this.torso.fillStyle(0x1d4ed8, 1);
        this.torso.fillRect(-22, -52, 44, 10);
        this.torso.lineStyle(1.5, 0x93c5fd, 1);
        this.torso.strokeRect(-22, -52, 44, 10);
        this.spriteBody.add(this.torso);

        // ── FRONT LEG ──
        this.legFrontContainer = this.scene.add.container(10, -40);
        const legFront = this.scene.add.graphics();
        legFront.fillStyle(0x3730a3, 1);
        legFront.lineStyle(2, 0x1e1b4b, 1);
        legFront.fillRoundedRect(-10, 0, 18, 42, 5);
        legFront.strokeRoundedRect(-10, 0, 18, 42, 5);
        legFront.fillStyle(0x1e1b4b, 1);
        legFront.fillRoundedRect(-10, 40, 20, 12, 3);
        this.legFrontContainer.add(legFront);
        this.spriteBody.add(this.legFrontContainer);

        // ── HEAD ──
        this.backHair = this.scene.add.graphics();
        this.backHair.fillStyle(0x111827, 1);
        this.backHair.fillCircle(-18, -148, 20);
        this.backHair.fillCircle(-32, -128, 18);
        this.backHair.fillCircle(-38, -104, 14);
        this.spriteBody.add(this.backHair);

        this.head = this.scene.add.graphics();
        this.head.fillStyle(0xfde047, 1);
        this.head.lineStyle(2.5, 0x1e3a8a, 1);
        this.head.fillCircle(0, -142, 21);
        this.head.strokeCircle(0, -142, 21);
        this.spriteBody.add(this.head);

        this.frontHair = this.scene.add.graphics();
        this.frontHair.fillStyle(0x111827, 1);
        this.frontHair.fillCircle(10, -152, 14);
        this.frontHair.fillCircle(-12, -156, 14);
        this.frontHair.fillRect(-18, -167, 36, 12);
        this.spriteBody.add(this.frontHair);

        // ── FRONT ARM (right arm when facing right, holds scales) ──
        this.armFrontContainer = this.scene.add.container(22, -100);
        this.armFrontGfx = this.scene.add.graphics();
        this._drawRoeFrontArm();
        this.armFrontContainer.add(this.armFrontGfx);
        this.spriteBody.add(this.armFrontContainer);

        // idle breathe tween
        this.scene.tweens.add({
            targets: this.spriteBody,
            scaleY: 1.03, scaleX: 0.99, y: 4,
            duration: 450, yoyo: true, repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    _drawRoeFrontArm() {
        this.armFrontGfx.clear();
        this.armFrontGfx.fillStyle(0x1d4ed8, 1);
        this.armFrontGfx.fillRoundedRect(-6, 0, 12, 36, 5);   // upper arm
        this.armFrontGfx.fillStyle(0xfde047, 1);
        this.armFrontGfx.fillRoundedRect(-5, 34, 11, 20, 4);  // fist
        // scales-of-justice (weapon in hand)
        this.armFrontGfx.lineStyle(2.5, 0x93c5fd, 1);
        this.armFrontGfx.lineBetween(0, 52, 36, 38);          // pole out
        this.armFrontGfx.lineStyle(2, 0x60a5fa, 1);
        this.armFrontGfx.lineBetween(14, 30, 50, 30);         // beam
        this.armFrontGfx.lineStyle(1.5, 0xd1d5db, 1);
        [[14,30],[50,30]].forEach(([px,py]) => {
            this.armFrontGfx.lineBetween(px-6, py, px-6, py+12);
            this.armFrontGfx.lineBetween(px+6, py, px+6, py+12);
        });
        this.armFrontGfx.fillStyle(0x93c5fd, 1);
        this.armFrontGfx.fillTriangle(8, 42, 14, 46, 20, 42);
        this.armFrontGfx.fillTriangle(44, 42, 50, 46, 56, 42);
    }

    // ── WADE ─────────────────────────────────────────────────────────────────
    _buildWade() {
        // crimson cape
        this.cape = this.scene.add.graphics();
        this.cape.fillStyle(0xb91c1c, 1);
        this.cape.lineStyle(2.5, 0x7f1d1d, 1);
        this.cape.beginPath();
        this.cape.moveTo(-18, -128);
        this.cape.lineTo(-68, -12);
        this.cape.lineTo(6, -4);
        this.cape.lineTo(20, -118);
        this.cape.closePath();
        this.cape.fillPath(); this.cape.strokePath();
        this.spriteBody.add(this.cape);

        // ── BACK ARM ──
        this.armBackContainer = this.scene.add.container(-22, -100);
        const armBack = this.scene.add.graphics();
        armBack.fillStyle(0x374151, 1);
        armBack.fillRoundedRect(-7, 0, 14, 36, 4);
        armBack.fillStyle(0xfde047, 1);
        armBack.fillRoundedRect(-6, 34, 13, 20, 4);
        this.armBackContainer.add(armBack);
        this.spriteBody.add(this.armBackContainer);

        // ── BACK LEG ──
        this.legBackContainer = this.scene.add.container(-12, -40);
        const legBack = this.scene.add.graphics();
        legBack.fillStyle(0x1f2937, 1);
        legBack.lineStyle(2, 0x111827, 1);
        legBack.fillRoundedRect(-10, 0, 18, 42, 3);
        legBack.strokeRoundedRect(-10, 0, 18, 42, 3);
        legBack.fillStyle(0x111827, 1);
        legBack.fillRoundedRect(-10, 40, 20, 12, 2);
        this.legBackContainer.add(legBack);
        this.spriteBody.add(this.legBackContainer);

        // ── TORSO / SUIT ──
        this.torso = this.scene.add.graphics();
        this.torso.fillStyle(0x374151, 1);
        this.torso.lineStyle(3.5, 0x111827, 1);
        this.torso.fillRoundedRect(-28, -135, 56, 96, 5);
        this.torso.strokeRoundedRect(-28, -135, 56, 96, 5);
        this.torso.fillStyle(0xffffff, 1);
        this.torso.fillTriangle(-12, -135, 0, -108, 12, -135);
        this.spriteBody.add(this.torso);

        // crimson tie
        this.tie = this.scene.add.graphics();
        this.tie.fillStyle(0xef4444, 1);
        this.tie.beginPath();
        this.tie.moveTo(-4, -124); this.tie.lineTo(4, -124);
        this.tie.lineTo(5, -84);  this.tie.lineTo(0, -74);
        this.tie.lineTo(-5, -84); this.tie.closePath();
        this.tie.fillPath();
        this.spriteBody.add(this.tie);

        // ── FRONT LEG ──
        this.legFrontContainer = this.scene.add.container(10, -40);
        const legFront = this.scene.add.graphics();
        legFront.fillStyle(0x1f2937, 1);
        legFront.lineStyle(2, 0x111827, 1);
        legFront.fillRoundedRect(-10, 0, 18, 42, 3);
        legFront.strokeRoundedRect(-10, 0, 18, 42, 3);
        legFront.fillStyle(0x111827, 1);
        legFront.fillRoundedRect(-10, 40, 20, 12, 2);
        this.legFrontContainer.add(legFront);
        this.spriteBody.add(this.legFrontContainer);

        // ── HEAD ──
        this.head = this.scene.add.graphics();
        this.head.fillStyle(0xfde047, 1);
        this.head.lineStyle(3.5, 0x111827, 1);
        this.head.fillRoundedRect(-20, -164, 40, 40, 6);
        this.head.strokeRoundedRect(-20, -164, 40, 40, 6);
        this.hair = this.scene.add.graphics();
        this.hair.fillStyle(0x9ca3af, 1);
        this.hair.fillRoundedRect(-22, -172, 44, 14, 4);
        this.hair.fillCircle(-20, -148, 8);
        this.hair.fillCircle(20, -148, 8);
        this.spriteBody.add([this.head, this.hair]);

        // ── FRONT ARM + GAVEL ──
        this.armFrontContainer = this.scene.add.container(24, -105);
        this.armFrontGfx = this.scene.add.graphics();
        this._drawWadeFrontArm();
        this.armFrontContainer.add(this.armFrontGfx);
        this.spriteBody.add(this.armFrontContainer);

        // idle breathe
        this.scene.tweens.add({
            targets: this.spriteBody,
            scaleY: 1.015, scaleX: 1.005, y: 1.5,
            duration: 650, yoyo: true, repeat: -1,
            ease: 'Quad.easeInOut'
        });
    }

    _drawWadeFrontArm() {
        this.armFrontGfx.clear();
        this.armFrontGfx.fillStyle(0x374151, 1);
        this.armFrontGfx.fillRoundedRect(-7, 0, 14, 36, 4);
        this.armFrontGfx.fillStyle(0xfde047, 1);
        this.armFrontGfx.fillRoundedRect(-6, 34, 13, 20, 4);
        // gavel
        this.armFrontGfx.lineStyle(5, 0x78350f, 1);
        this.armFrontGfx.lineBetween(0, 52, 30, 38);
        this.armFrontGfx.fillStyle(0x451a03, 1);
        this.armFrontGfx.lineStyle(3, 0xeab308, 1);
        this.armFrontGfx.fillRoundedRect(22, 24, 20, 38, 3);
        this.armFrontGfx.strokeRoundedRect(22, 24, 20, 38, 3);
        this.armFrontGfx.fillStyle(0xeab308, 1);
        this.armFrontGfx.fillRect(22, 38, 20, 8);
    }

    _drawEyes() {
        this.eyes.clear();
        const yOff = this.characterId === 'roe' ? -144 : -148;
        this.eyes.fillStyle(0x111827, 1);
        this.eyes.fillRect(-8, yOff, 4, 4);
        this.eyes.fillRect(4, yOff, 4, 4);
        this.eyes.lineStyle(2.5, 0x111827, 1);
        this.eyes.lineBetween(-12, yOff - 6, -2, yOff - 3);
        this.eyes.lineBetween(2, yOff - 3, 12, yOff - 6);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  AUTO-FACE
    // ─────────────────────────────────────────────────────────────────────────
    updateDirection(opponent) {
        if (this.isStunned) return;
        if (opponent) this.facingRight = opponent.x > this.x;
        this.spriteBody.scaleX = this.facingRight
            ? Math.abs(this.spriteBody.scaleX)
            : -Math.abs(this.spriteBody.scaleX);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  MOVE
    // ─────────────────────────────────────────────────────────────────────────
    move(dir) {
        if (this.isStunned || this.isAttacking || this.isPrivacyShieldActive || this.isSovereignWallActive) return;
        const opp = this.scene.fighters.find(f => f !== this);
        const holdsAway = opp ? (opp.x > this.x ? dir < 0 : dir > 0) : false;
        this.isBlocking = holdsAway && this.isGrounded;
        this.body.setVelocityX(dir * this.speed);
        this.spriteBody.angle = dir !== 0 ? dir * 6 : 0;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  JUMP  (double-jump)
    // ─────────────────────────────────────────────────────────────────────────
    jump() {
        if (this.isStunned || this.isAttacking || this.isPrivacyShieldActive || this.isSovereignWallActive) return;
        if (this.isGrounded) {
            this.body.setVelocityY(this.jumpForce);
            this.jumpsRemaining = 1;
            this.isGrounded = false;
            this._jumpFx();
        } else if (this.jumpsRemaining > 0) {
            this.body.setVelocityY(this.doubleJumpForce);
            this.jumpsRemaining = 0;
            this._jumpFx(true);
        }
    }

    _jumpFx(isDouble = false) {
        this.scene.tweens.add({
            targets: this.spriteBody,
            scaleY: isDouble ? 1.25 : 1.15,
            scaleX: isDouble ? 0.75 : 0.85,
            duration: 110, yoyo: true, ease: 'Quad.easeOut'
        });
        const dust = this.scene.add.circle(this.x, this.y, isDouble ? 24 : 14, 0xffffff, 0.5);
        this.scene.tweens.add({
            targets: dust, scaleX: 2.4, scaleY: 0.2, y: this.y + 10, alpha: 0,
            duration: 180, onComplete: () => dust.destroy()
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  MOVE 1: KICK
    //  Roe  → blazing flying roundhouse kick with cyan energy trail
    //  Wade → stomping low sweep kick that creates a shockwave on ground
    // ─────────────────────────────────────────────────────────────────────────
    doKick() {
        if (!this._canAttack()) return;
        this._startAttack('kick');
        const dir = this.facingRight ? 1 : -1;

        if (this.characterId === 'roe') {
            // Front leg shoots out horizontally
            this.scene.tweens.add({
                targets: this.legFrontContainer,
                x: this.legFrontContainer.x + dir * 55,
                y: this.legFrontContainer.y - 30,
                angle: dir * -50,
                duration: 130, yoyo: true, ease: 'Back.easeOut',
                onStart: () => {
                    this.enableAttackHitbox();
                    this._hitFlash(0x60a5fa);
                    this._spawnKickTrail();
                    this.scene.showPopupText(this.x, this.y - 195, 'DUE PROCESS KICK!', '#60a5fa');
                },
                onComplete: () => this._endAttack()
            });
        } else {
            // Wade low sweep: leg swings forward-low + shockwave
            this.scene.tweens.add({
                targets: this.legFrontContainer,
                x: this.legFrontContainer.x + dir * 60,
                y: this.legFrontContainer.y + 10,
                angle: dir * 40,
                duration: 150, yoyo: true, ease: 'Sine.easeOut',
                onStart: () => {
                    this.enableAttackHitbox();
                    this._hitFlash(0xfca5a5);
                    this._spawnGroundShockwave();
                    this.scene.showPopupText(this.x, this.y - 195, 'STATUTORY SWEEP!', '#ef4444');
                },
                onComplete: () => this._endAttack()
            });
        }

        if (Math.random() < 0.45) this.speakLine();
    }

    _spawnKickTrail() {
        for (let i = 0; i < 4; i++) {
            const trail = this.scene.add.graphics();
            trail.lineStyle(4 - i, 0x60a5fa, 0.7 - i * 0.15);
            const ox = this.facingRight ? -i * 18 : i * 18;
            trail.lineBetween(this.x + ox, this.y - 80, this.x + ox + (this.facingRight ? 80 : -80), this.y - 50);
            this.scene.tweens.add({ targets: trail, alpha: 0, duration: 200 + i * 40, onComplete: () => trail.destroy() });
        }
    }

    _spawnGroundShockwave() {
        const sw = this.scene.add.graphics();
        sw.lineStyle(4, 0xef4444, 0.9);
        sw.strokeEllipse(this.x + (this.facingRight ? 80 : -80), this.y - 5, 10, 10);
        this.scene.tweens.add({
            targets: sw, scaleX: 9, scaleY: 2, alpha: 0, duration: 320,
            onComplete: () => sw.destroy()
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  MOVE 2: SLASH / HEAVY WEAPON STRIKE
    //  Roe  → horizontal energy-scale slash (3-hit chain)
    //  Wade → overhead gavel slam with crack effect
    // ─────────────────────────────────────────────────────────────────────────
    doSlash() {
        if (!this._canAttack()) return;
        this._startAttack('slash');

        if (this.characterId === 'roe') {
            const now = this.scene.time.now;
            if (now - this.lastComboTime > this.comboResetDelay) this.comboStep = 0;
            this.lastComboTime = now;

            const angles   = [70, -70, 100];
            const xOffsets = [50, -40, 60];
            const labels   = ['DUE PROCESS STRIKE!', 'IMPROVEMENT IMPULSE!', 'RIGHTS REVOLUTION!'];
            const angle  = this.facingRight ? angles[this.comboStep] : -angles[this.comboStep];
            const xOff   = this.facingRight ? xOffsets[this.comboStep] : -xOffsets[this.comboStep];

            this.scene.tweens.add({
                targets: this.armFrontContainer,
                angle: angle, x: this.armFrontContainer.x + xOff,
                duration: 110, yoyo: true, ease: 'Back.easeOut',
                onStart: () => {
                    this.enableAttackHitbox();
                    this._hitFlash(0x60a5fa);
                    this._spawnSlashArc(0x60a5fa);
                    this.scene.showPopupText(this.x, this.y - 195, labels[this.comboStep], '#60a5fa');
                },
                onComplete: () => {
                    this.comboStep = (this.comboStep + 1) % 3;
                    this._endAttack();
                }
            });
        } else {
            // Wade overhead gavel slam
            this.scene.tweens.add({
                targets: this.armFrontContainer,
                angle: this.facingRight ? 110 : -110,
                x: this.armFrontContainer.x + (this.facingRight ? 55 : -55),
                y: this.armFrontContainer.y + 30,
                duration: 160, yoyo: true, ease: 'Back.easeOut',
                onStart: () => {
                    this.enableAttackHitbox();
                    this._hitFlash(0xef4444);
                    this._spawnSlashArc(0xef4444);
                    this.scene.showPopupText(this.x, this.y - 195, 'STATE AUTHORITY SLAM!', '#ef4444');
                },
                onComplete: () => {
                    this.scene.cameras.main.shake(120, 0.008);
                    this._endAttack();
                }
            });
        }

        if (Math.random() < 0.4) this.speakLine();
    }

    _spawnSlashArc(color) {
        const g = this.scene.add.graphics();
        g.lineStyle(5, color, 0.85);
        const ox = this.facingRight ? 60 : -60;
        g.beginPath();
        g.arc(this.x + ox, this.y - 85, 55,
            this.facingRight ? -Math.PI / 2 : Math.PI / 2,
            this.facingRight ? Math.PI / 3 : (2 * Math.PI / 3),
            !this.facingRight);
        g.strokePath();
        this.scene.tweens.add({ targets: g, alpha: 0, scaleX: 1.3, scaleY: 1.3, duration: 220, onComplete: () => g.destroy() });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  MOVE 3: TELEPORT DASH
    //  Roe  → cyan afterimage blink behind opponent, emerges with a blue burst
    //  Wade → crimson warp-step through the opponent, ends with a gavel stun
    // ─────────────────────────────────────────────────────────────────────────
    doTeleport() {
        if (!this._canAttack()) return;
        this._startAttack('teleport');

        const opp    = this.scene.fighters.find(f => f !== this);
        const gap    = 100;
        const targetX = opp
            ? (opp.x > this.x ? opp.x - gap : opp.x + gap)
            : this.x + (this.facingRight ? 350 : -350);

        if (this.characterId === 'roe') {
            this.scene.showPopupText(this.x, this.y - 200, 'LIBERTY BLINK!', '#60a5fa');
            this._leaveAfterimage(0x60a5fa);
        } else {
            this.scene.showPopupText(this.x, this.y - 200, 'JURISDICTION WARP!', '#ef4444');
            this._leaveAfterimage(0xef4444);
        }

        // Flash out
        this.scene.tweens.add({
            targets: this.spriteBody, alpha: 0, scaleX: 0, duration: 80, ease: 'Quad.easeIn',
            onComplete: () => {
                // Reposition
                this.x = targetX;
                // Flash in
                this.scene.tweens.add({
                    targets: this.spriteBody, alpha: 1, scaleX: this.facingRight ? 1 : -1,
                    duration: 100, ease: 'Back.easeOut',
                    onComplete: () => {
                        // burst damage
                        this.enableAttackHitbox();
                        this._hitFlash(this.glowingColor);
                        if (opp && !opp.isStunned) {
                            const dist = Math.abs(this.x - opp.x);
                            if (dist < 160) {
                                opp.takeDamage(this.damageNormal + 2, this.characterId === 'roe' ? 'LIBERTY BLINK!' : 'JURISDICTION WARP!');
                                this.gainSuperMeter(10);
                                this.scene.playSFX('gavel-hit');
                                this.scene.cheerSpectators();
                            }
                        }
                        this.scene.time.delayedCall(120, () => this._endAttack());
                    }
                });
            }
        });

        if (Math.random() < 0.5) this.speakLine();
    }

    _leaveAfterimage(color) {
        const ghost = this.scene.add.graphics();
        ghost.fillStyle(color, 0.35);
        ghost.fillRoundedRect(this.x - 18, this.y - 170, 36, 140, 8);
        ghost.fillCircle(this.x, this.y - 142, 20);
        this.scene.tweens.add({ targets: ghost, alpha: 0, scaleY: 1.1, duration: 400, onComplete: () => ghost.destroy() });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  MOVE 4: TACKLE / SHOULDER CHARGE
    //  Roe  → fast dashing shoulder strike with blue momentum trail
    //  Wade → heavy bull-charge that launches enemy upward on contact
    // ─────────────────────────────────────────────────────────────────────────
    doTackle() {
        if (!this._canAttack()) return;
        this._startAttack('tackle');
        const dir = this.facingRight ? 1 : -1;

        if (this.characterId === 'roe') {
            this.scene.showPopupText(this.x, this.y - 200, 'PRECEDENT RUSH!', '#60a5fa');
            // Lunge body tilt + velocity burst
            this.scene.tweens.add({
                targets: this.spriteBody, angle: dir * 28, duration: 100, yoyo: true, ease: 'Quad.easeOut'
            });
            this.body.setVelocityX(dir * 1400);
            this.body.setVelocityY(-180);
            this.enableAttackHitbox();
            this._spawnTackleTrail(0x60a5fa);
            this.scene.time.delayedCall(280, () => this._endAttack());
        } else {
            this.scene.showPopupText(this.x, this.y - 200, 'POLICE POWER CHARGE!', '#ef4444');
            // Wade heavy charge
            this.scene.tweens.add({
                targets: this.spriteBody, angle: dir * 22, duration: 120, yoyo: true
            });
            this.body.setVelocityX(dir * 1100);
            this.body.setVelocityY(-80);
            this.enableAttackHitbox();
            this.scene.cameras.main.shake(200, 0.012);
            this._spawnTackleTrail(0xef4444);
            this.scene.time.delayedCall(340, () => this._endAttack());
        }

        if (Math.random() < 0.4) this.speakLine();
    }

    _spawnTackleTrail(color) {
        for (let i = 0; i < 5; i++) {
            const t = this.scene.add.rectangle(
                this.x - (this.facingRight ? 1 : -1) * i * 22,
                this.y - 95, 18, 130, color, 0.25 - i * 0.04
            );
            this.scene.tweens.add({ targets: t, alpha: 0, duration: 200 + i * 50, onComplete: () => t.destroy() });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  SPECIAL SHIELDS
    // ─────────────────────────────────────────────────────────────────────────
    triggerSpecialShield() {
        if (this.isStunned || this.isAttacking || this.isPrivacyShieldActive || this.isSovereignWallActive) return;

        const duration = this.characterId === 'roe' ? 1400 : 1200;
        this.body.setVelocityX(0);
        this.scene.playSFX('super-charge');

        if (this.characterId === 'roe') {
            this.isPrivacyShieldActive = true;
            this.speakLine("Precedent, not restriction!");
            this.scene.showPopupText(this.x, this.y - 195, 'ZONE OF PRIVACY!', '#60a5fa');
        } else {
            this.isSovereignWallActive = true;
            this.speakLine("Order must prevail!");
            this.scene.showPopupText(this.x, this.y - 195, '10th AMENDMENT DEFENSE!', '#ef4444');
        }

        this.shieldGraphics.clear();
        this.shieldGraphics.setVisible(true);
        this.shieldGraphics.alpha = 0.95;
        const ox = this.facingRight ? 80 : -80;
        this.shieldGraphics.x = ox;
        this.shieldGraphics.y = -80;

        if (this.characterId === 'roe') {
            this.shieldGraphics.lineStyle(4, 0x60a5fa, 1);
            this.shieldGraphics.fillStyle(0x1d4ed8, 0.65);
            this.shieldGraphics.beginPath();
            [[-0,-65],[45,-30],[45,30],[0,65],[-45,30],[-45,-30]].forEach(([px,py], i) =>
                i === 0 ? this.shieldGraphics.moveTo(px,py) : this.shieldGraphics.lineTo(px,py));
            this.shieldGraphics.closePath();
            this.shieldGraphics.fillPath();
            this.shieldGraphics.strokePath();
        } else {
            this.shieldGraphics.lineStyle(4, 0xef4444, 1);
            this.shieldGraphics.fillStyle(0x451a03, 0.9);
            this.shieldGraphics.fillRoundedRect(-40, -75, 80, 150, 6);
            this.shieldGraphics.strokeRoundedRect(-40, -75, 80, 150, 6);
            this.shieldGraphics.lineStyle(2.5, 0xeab308, 1);
            this.shieldGraphics.strokeCircle(0, 0, 22);
            this.shieldGraphics.lineBetween(-15, 0, 15, 0);
            this.shieldGraphics.lineBetween(0, -15, 0, 15);
        }

        this.scene.time.delayedCall(duration, () => {
            this.isPrivacyShieldActive = false;
            this.isSovereignWallActive = false;
            this.scene.tweens.add({ targets: this.shieldGraphics, alpha: 0, duration: 130,
                onComplete: () => this.shieldGraphics.setVisible(false) });
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  SUPER MOVES
    // ─────────────────────────────────────────────────────────────────────────
    triggerSuperMove() {
        if (this.superMeter < 100 || this.isStunned || this.isSuperActive) return;

        this.superMeter = 0;
        this.isSuperActive = true;
        this.aura.setVisible(true);

        this.scene.playSFX('super-charge');
        this.scene.cameras.main.shake(450, 0.03);
        this.speakLine(this.characterId === 'roe' ? "The individual must be free!" : "The law is absolute!");

        const superLabel = this.characterId === 'roe' ? 'SUPER: SUBSTANTIVE LIBERTY!!' : 'SUPER: POLICE POWER!!';
        this.scene.showPopupText(this.x, this.y - 240, superLabel, this.characterId === 'roe' ? '#60a5fa' : '#ef4444');

        if (this.characterId === 'roe') {
            for (let i = 0; i < 4; i++) {
                const burst = this.scene.add.circle(this.x, this.y - 80, 15, 0x60a5fa, 0.22);
                this.scene.physics.add.existing(burst);
                burst.body.setAllowGravity(false);
                burst.body.setImmovable(true);

                this.scene.tweens.add({
                    targets: burst, scaleX: 26, scaleY: 26, alpha: 0,
                    delay: i * 200, duration: 1000,
                    onUpdate: () => {
                        const opp = this.scene.fighters.find(f => f !== this);
                        if (opp) {
                            const dist = Phaser.Math.Distance.Between(burst.x, burst.y, opp.x, opp.y - 80);
                            if (dist < burst.scaleX * 15 && !opp.isStunned)
                                opp.takeDamage(11, 'SUPER: SUBSTANTIVE LIBERTY!!');
                        }
                    },
                    onComplete: () => {
                        burst.destroy();
                        if (i === 3) { this.isSuperActive = false; this.aura.setVisible(false); }
                    }
                });
            }
        } else {
            const opp = this.scene.fighters.find(f => f !== this);
            const tx  = opp ? opp.x : this.x + (this.facingRight ? 350 : -350);

            const gavel = this.scene.add.container(tx, this.y - 680);
            const gg = this.scene.add.graphics();
            gg.fillStyle(0x7f1d1d, 1); gg.lineStyle(7, 0xfca5a5, 1);
            gg.fillRoundedRect(-60, -110, 120, 170, 12);
            gg.strokeRoundedRect(-60, -110, 120, 170, 12);
            gg.lineStyle(12, 0x451a03, 1);
            gg.lineBetween(0, -110, 0, -280);
            gavel.add(gg);

            this.scene.tweens.add({
                targets: gavel, y: this.y - 80, duration: 500, ease: 'Bounce.easeOut',
                onComplete: () => {
                    this.scene.cameras.main.shake(300, 0.03);
                    this.scene.playSFX('gavel-hit');
                    this.scene.cheerSpectators();
                    if (opp && Math.abs(opp.x - tx) < 200)
                        opp.takeDamage(45, 'SUPER: POLICE POWER!!');
                    this.scene.time.delayedCall(500, () => {
                        gavel.destroy();
                        this.isSuperActive = false;
                        this.aura.setVisible(false);
                    });
                }
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  DAMAGE / BLOCKING
    // ─────────────────────────────────────────────────────────────────────────
    takeDamage(amount, reason = null) {
        if (this.health <= 0) return;

        if (this.isBlocking && !reason?.startsWith('SUPER')) {
            amount = Math.round(amount * 0.15);
            this._showBlockSparks();
            if (amount === 0) return;
        }
        if (this.isPrivacyShieldActive || this.isSovereignWallActive) {
            this._showBlockSparks(true);
            return;
        }

        this.health = Math.max(0, this.health - amount);
        this.isStunned = true;
        this.body.setVelocityX(this.facingRight ? -260 : 260);

        // Cancel any existing stun tween so overlapping hits don't clear stun early
        if (this.stunTween) {
            this.stunTween.stop();
            this.spriteBody.alpha = 1;
        }
        this.stunTween = this.scene.tweens.add({
            targets: this.spriteBody, alpha: 0.1, yoyo: true, repeat: 4, duration: 50,
            onComplete: () => { this.spriteBody.alpha = 1; this.isStunned = false; this.stunTween = null; }
        });

        this.gainSuperMeter(amount * 0.4);
        this._showDamageNumbers(amount, reason);
    }

    _showBlockSparks(special = false) {
        const px = this.x + (this.facingRight ? -40 : 40);
        const py = this.y - 90;
        const sp = this.scene.add.graphics();
        sp.lineStyle(2.5, special ? this.glowingColor : 0xffffff, 1);
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            sp.lineBetween(px, py, px + Math.cos(a) * 36, py + Math.sin(a) * 36);
        }
        this.scene.tweens.add({ targets: sp, alpha: 0, scaleX: 1.4, scaleY: 1.4, duration: 180, onComplete: () => sp.destroy() });
        this.scene.showPopupText(this.x, this.y - 175, special ? 'JURISDICTIONAL RECOVERY!' : 'BLOCKED!', special ? '#ef4444' : '#ffffff');
    }

    gainSuperMeter(amount) {
        if (this.superMeter >= 100) return;
        const old = this.superMeter;
        this.superMeter = Math.min(100, this.superMeter + amount);
        if (this.superMeter >= 100 && old < 100) {
            this.scene.playSFX('super-charge');
            this._flashSuperReady();
        }
    }

    _flashSuperReady() {
        const t = this.scene.add.text(0, -225, 'SUPER READY!', {
            fontFamily: '"Press Start 2P"', fontSize: '15px',
            fill: '#fde047', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5);
        this.add(t);
        this.scene.tweens.add({ targets: t, scaleX: 1.2, scaleY: 1.2, yoyo: true, repeat: 3, duration: 140,
            onComplete: () => t.destroy() });
    }

    _showDamageNumbers(amount, reason) {
        const px = this.x + Phaser.Math.Between(-28, 28);
        const py = this.y - 185;
        const t = this.scene.add.text(px, py, `-${amount} HP`, {
            fontFamily: '"Press Start 2P"', fontSize: '17px', fill: '#ef4444',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
        this.scene.tweens.add({ targets: t, y: py - 60, alpha: 0, duration: 600, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
        if (reason) {
            this.scene.showPopupText(px, py - 40, reason, this.characterId === 'roe' ? '#60a5fa' : '#ef4444');
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  SPEECH BUBBLE
    // ─────────────────────────────────────────────────────────────────────────
    speakLine(phrase = null) {
        if (this.speechBubble) { this.speechBubble.destroy(); }
        const line = phrase || Phaser.Utils.Array.GetRandom(this.voiceLines);

        this.speechBubble = this.scene.add.container(0, -225);
        this.add(this.speechBubble);

        const bg = this.scene.add.graphics();
        bg.fillStyle(0xffffff, 1);
        bg.lineStyle(3, 0x111827, 1);
        bg.fillRoundedRect(-140, -40, 280, 55, 6);
        bg.strokeRoundedRect(-140, -40, 280, 55, 6);
        bg.beginPath();
        bg.moveTo(-10, 15); bg.lineTo(0, 28); bg.lineTo(10, 15);
        bg.closePath(); bg.fillPath(); bg.strokePath();
        this.speechBubble.add(bg);

        const txt = this.scene.add.text(0, -12, line, {
            fontFamily: 'Arial', fontSize: '14px', fontStyle: 'bold',
            fill: '#111827', align: 'center', wordWrap: { width: 260 }
        }).setOrigin(0.5);
        this.speechBubble.add(txt);

        this.scene.time.delayedCall(1600, () => {
            if (this.speechBubble && this.speechBubble.active) {
                this.scene.tweens.add({
                    targets: this.speechBubble, alpha: 0, scaleY: 0.2, duration: 200,
                    onComplete: () => { if (this.speechBubble) { this.speechBubble.destroy(); this.speechBubble = null; } }
                });
            }
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    // Cycles through kick → slash → teleport → tackle on repeated presses
    triggerAttack() {
        if (!this._canAttack()) return;
        const now = this.scene.time.now;
        // Reset combo if too much time has passed
        if (now - this.lastComboTime > this.comboResetDelay) this.comboStep = 0;
        this.lastComboTime = now;
        const move = this.comboStep % 4;
        if (move === 0)      this.doKick();
        else if (move === 1) this.doSlash();
        else if (move === 2) this.doTeleport();
        else                 this.doTackle();
        // doSlash manages comboStep internally for Roe's 3-hit chain; advance it for all other moves
        if (move !== 1) this.comboStep = (this.comboStep + 1) % 4;
    }

    _canAttack() {
        const now = this.scene.time.now;
        return !this.isStunned && !this.isAttacking &&
               !this.isPrivacyShieldActive && !this.isSovereignWallActive &&
               (now - this.lastAttackTime >= this.attackCooldown);
    }

    _startAttack(moveName) {
        this.isAttacking   = true;
        this.currentMove   = moveName;
        this.lastAttackTime = this.scene.time.now;
    }

    _endAttack() {
        this.isAttacking = false;
        this.currentMove = 'idle';
        this.disableAttackHitbox();
    }

    _hitFlash(color) {
        const fx = this.x + (this.facingRight ? 85 : -85);
        const fy = this.y - 75;
        const f  = this.scene.add.circle(fx, fy, 42, color, 0.7);
        this.scene.tweens.add({ targets: f, scaleX: 1.9, scaleY: 1.9, alpha: 0, duration: 130, onComplete: () => f.destroy() });
    }

    enableAttackHitbox() {
        this.isAttacking = true;
    }

    disableAttackHitbox() {
        this.isAttacking = false;
    }

    getAttackHitboxBounds() {
        const off = this.facingRight ? 92 : -92;
        // Returns a geometric rectangle centered on the attack zone
        return new Phaser.Geom.Rectangle(this.x + off - 90, this.y - 75 - 60, 180, 120);
    }

    // ─────────────────────────────────────────────────────────────────────────
    update(opponent) {
        this.isGrounded = this.body.blocked.down;
        if (this.isGrounded) this.jumpsRemaining = 2;
        this.updateDirection(opponent);

        if (this.shadow) {
            const ratio = Math.max(0, 1 - (this.y - this.scene.floorY) / 600);
            this.shadow.setScale(ratio);
            this.shadow.alpha = 0.45 * ratio;
            this.shadow.y     = -this.y + (this.scene.floorY || 920);
        }
    }
}
