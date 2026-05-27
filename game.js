import Phaser from 'phaser';
import { Fighter } from './entities.js';
import { AudioManager } from './audio.js';
import { createCharacterSelectUI, showFinalVerdictScreen } from './ui.js';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    init() {
        this.gameState = 'menu';
        this.fighters = [];
        this.floorY = 920;
        this.comboMeterGain = 12;
        this.demoMode = false;
        this.demoTimer = 0;
        this.roundTimerValue = 99;
        this.timerEvent = null;
    }

    preload() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        const loadingText = this.add.text(width / 2, height / 2 - 60, 'LOADING CONSTITUTIONAL EVIDENCE...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            fill: '#fde047'
        }).setOrigin(0.5);

        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x18181b, 0.8);
        progressBox.lineStyle(4, 0xeab308, 1);
        progressBox.fillRoundedRect(width / 2 - 400, height / 2 - 25, 800, 50, 6);
        progressBox.strokeRoundedRect(width / 2 - 400, height / 2 - 25, 800, 50, 6);

        const progressBar = this.add.graphics();

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xeab308, 1);
            progressBar.fillRoundedRect(width / 2 - 390, height / 2 - 15, 780 * value, 30, 4);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        this.load.image('courtroom-bg', 'assets/courtroom-bg.png');
        
        this.audioManager = new AudioManager(this);
        this.audioManager.preload();
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.audioManager.init();

        this.bg = this.add.image(width / 2, height / 2, 'courtroom-bg');
        this.bg.setDisplaySize(width, height);

        this.createCourtroomProps();
        this.createJudicialGallery();
        this.createMainMenu();

        this.input.once('pointerdown', () => {
            this.audioManager.playMusic();
        });

        this.input.keyboard.on('keydown-M', () => {
            this.toggleMute();
        });

        this.demoButton = this.add.text(20, 20, 'DEMO MODE', {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setInteractive().setScrollFactor(0);

        this.demoButton.on('pointerdown', () => {
            this.startDemoMode();
        });

        this.endDemoButton = this.add.text(20, 60, 'END DEMO', {
            fontSize: '24px',
            fill: '#ff4444',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setInteractive().setVisible(false).setScrollFactor(0);

        this.endDemoButton.on('pointerdown', () => {
            this.endDemoMode();
        });
    }

    createCourtroomProps() {
        const width = this.scale.width;
        const height = this.scale.height;
        
        const sunBeam1 = this.add.graphics();
        sunBeam1.fillStyle(0xfde047, 0.08);
        sunBeam1.beginPath();
        sunBeam1.moveTo(width / 2 - 250, 0);
        sunBeam1.lineTo(width / 2 + 250, 0);
        sunBeam1.lineTo(width / 2 + 480, height);
        sunBeam1.lineTo(width / 2 - 480, height);
        sunBeam1.closePath();
        sunBeam1.fillPath();

        const sunBeam2 = this.add.graphics();
        sunBeam2.fillStyle(0xfef08a, 0.04);
        sunBeam2.beginPath();
        sunBeam2.moveTo(width / 4 - 80, 0);
        sunBeam2.lineTo(width / 4 + 120, 0);
        sunBeam2.lineTo(width / 4 + 320, height);
        sunBeam2.lineTo(width / 4 - 180, height);
        sunBeam2.closePath();
        sunBeam2.fillPath();

        const floorReflection = this.add.rectangle(width / 2, this.floorY + 80, width, 160, 0x1e1b4b, 0.12);
        
        this.ground = this.add.rectangle(width / 2, this.floorY + 15, width, 30, 0x000000, 0);
        this.physics.add.existing(this.ground, true);
    }

    createJudicialGallery() {
        const width = this.scale.width;
        this.galleryJudges = [];

        const benchXStart = width / 2 - 320;
        const judgeCount = 7;

        for (let i = 0; i < judgeCount; i++) {
            const jx = benchXStart + (i * 110);
            const jy = 515;

            const judgeContainer = this.add.container(jx, jy);
            
            const body = this.add.graphics();
            body.fillStyle(0x111827, 1);
            body.fillRoundedRect(-25, 0, 50, 60, 6);
            
            const collar = this.add.graphics();
            collar.fillStyle(0xffffff, 1);
            collar.beginPath();
            collar.moveTo(-10, 0);
            collar.lineTo(0, 15);
            collar.lineTo(10, 0);
            collar.closePath();
            collar.fillPath();

            const head = this.add.graphics();
            head.fillStyle(0xfde047, 1);
            head.fillCircle(0, -15, 16);

            const wig = this.add.graphics();
            wig.fillStyle(0xf9fafb, 1);
            wig.lineStyle(2, 0xe5e7eb, 1);
            wig.fillCircle(-16, -18, 11);
            wig.strokeCircle(-16, -18, 11);
            wig.fillCircle(16, -18, 11);
            wig.strokeCircle(16, -18, 11);
            wig.fillCircle(0, -28, 15);
            wig.strokeCircle(0, -28, 15);

            const tinyGavel = this.add.graphics();
            tinyGavel.fillStyle(0x78350f, 1);
            tinyGavel.fillRect(15, -15, 5, 20);
            tinyGavel.fillStyle(0x451a03, 1);
            tinyGavel.fillRect(10, -22, 15, 8);

            judgeContainer.add([body, collar, head, wig, tinyGavel]);
            judgeContainer.tinyGavel = tinyGavel;

            this.add.existing(judgeContainer);
            this.galleryJudges.push(judgeContainer);

            this.tweens.add({
                targets: judgeContainer,
                y: jy + 6,
                duration: 900 + i * 150,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createMainMenu() {
        const width = this.scale.width;
        const height = this.scale.height;

        this.menuContainer = this.add.container(width / 2, height / 2);

        const logoBack = this.add.rectangle(0, -220, 950, 150, 0x18181b, 0.9);
        logoBack.setStrokeStyle(6, 0xeab308);

        const titleText = this.add.text(0, -250, 'SUPREME SHOWDOWN', {
            fontFamily: '"Press Start 2P"',
            fontSize: '54px',
            fill: '#fde047',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        const subTitleText = this.add.text(0, -170, 'CONSTITUTIONAL COMBAT', {
            fontFamily: '"Press Start 2P"',
            fontSize: '22px',
            fill: '#ef4444',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        this.menuContainer.add([logoBack, titleText, subTitleText]);

        const startBtn = this.add.rectangle(0, 40, 380, 70, 0x16a34a);
        startBtn.setStrokeStyle(4, 0xffffff);
        startBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, 380, 70), Phaser.Geom.Rectangle.Contains);
        startBtn.input.cursor = 'pointer';

        const startText = this.add.text(0, 40, 'START GAME', {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.menuContainer.add([startBtn, startText]);

        startBtn.on('pointerover', () => {
            startBtn.setFillStyle(0x15803d);
            startText.setScale(1.05);
        });
        startBtn.on('pointerout', () => {
            startBtn.setFillStyle(0x16a34a);
            startText.setScale(1.0);
        });
        startBtn.on('pointerdown', () => {
            this.playSFX('gavel-hit');
            this.audioManager.playMusic();
            this.transitionToCharacterSelect();
        });

        const controlPanel = this.add.graphics();
        controlPanel.fillStyle(0x18181b, 0.9);
        controlPanel.fillRoundedRect(-450, 140, 900, 180, 8);
        controlPanel.lineStyle(2.5, 0xeab308, 0.5);
        controlPanel.strokeRoundedRect(-450, 140, 900, 180, 8);
        this.menuContainer.add(controlPanel);

        const p1Label = this.add.text(-220, 165, 'PLAYER 1: ROE (Plaintiff)', { fontFamily: '"Press Start 2P"', fontSize: '11px', fill: '#60a5fa' }).setOrigin(0.5);
        const p1Controls = this.add.text(-220, 240, 'Move: A / D | Jump: W (Double-Jump)\nStandard Combo (3-Hit): J key\nPrivacy Shield (Block): Hold S + J\nSuper Substantive Liberty: SPACEBAR', { fontFamily: 'Arial', fontSize: '14px', fill: '#d1d5db', align: 'center', lineSpacing: 5 }).setOrigin(0.5);
        
        const p2Label = this.add.text(220, 165, 'PLAYER 2: WADE (Defendant)', { fontFamily: '"Press Start 2P"', fontSize: '11px', fill: '#fca5a5' }).setOrigin(0.5);
        const p2Controls = this.add.text(220, 240, 'Move: Left / Right | Jump: UP (Double-Jump)\nStandard Combo (3-Hit): 1 key\nSovereign Wall (Block): Hold DOWN + 1\nSuper Police Power: 0 key', { fontFamily: 'Arial', fontSize: '14px', fill: '#d1d5db', align: 'center', lineSpacing: 5 }).setOrigin(0.5);

        this.menuContainer.add([p1Label, p1Controls, p2Label, p2Controls]);

        this.menuScales = this.add.graphics();
        this.menuScales.lineStyle(4, 0xca8a04, 0.6);
        this.menuScales.lineBetween(-200, -80, 200, -80);
        this.menuScales.lineBetween(0, -110, 0, 0);
        this.menuContainer.add(this.menuScales);
    }

    transitionToCharacterSelect() {
        this.gameState = 'character_select';
        
        this.tweens.add({
            targets: this.menuContainer,
            scaleX: 0.8,
            scaleY: 0.8,
            alpha: 0,
            duration: 400,
            onComplete: () => {
                this.menuContainer.destroy();
                createCharacterSelectUI(this, (p1Id, p2Id, isVsAI) => {
                    this.startFight(p1Id, p2Id, isVsAI);
                });
            }
        });
    }

    startFight(p1Id, p2Id, isVsAI) {
        this.gameState = 'fight';

        this.player1 = new Fighter(this, 400, this.floorY, p1Id, false, false);
        this.player2 = new Fighter(this, 1520, this.floorY, p2Id, true, isVsAI);
        this.fighters = [this.player1, this.player2];

        this.physics.add.collider(this.player1, this.ground);
        this.physics.add.collider(this.player2, this.ground);

        this.setupControls();
        this.createHUD();
        this.announceRoundStart();

        this.roundTimerValue = 99;
        this.timerText.setText(this.roundTimerValue.toString());
        
        if (this.timerEvent) this.timerEvent.destroy();
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.gameState === 'fight' && this.roundTimerValue > 0) {
                    this.roundTimerValue--;
                    this.timerText.setText(this.roundTimerValue.toString());
                    
                    if (this.roundTimerValue === 0) {
                        this.handleTimeOut();
                    }
                }
            },
            loop: true
        });
    }

    setupControls() {
        const keyboard = this.input.keyboard;
        
        this.keysP1 = {
            left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            jump: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            attack: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
            super: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        };

        this.keysP2 = {
            left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
            right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
            down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
            jump: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
            attack: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
            attackNumpad: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE),
            super: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO),
            superNumpad: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO)
        };
    }

    announceRoundStart() {
        const width = this.scale.width;
        const height = this.scale.height;

        const banner = this.add.rectangle(width / 2, height / 2, width, 180, 0x18181b, 0.9);
        banner.setStrokeStyle(5, 0xeab308);
        banner.setDepth(15);

        const announcementText = this.add.text(width / 2, height / 2 - 20, 'ORAL ARGUMENT', {
            fontFamily: '"Press Start 2P"',
            fontSize: '52px',
            fill: '#fde047',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(16);

        const callText = this.add.text(width / 2, height / 2 + 40, 'Pleading Begins Now!', {
            fontFamily: '"Press Start 2P"',
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(16);

        banner.setScale(0, 1);
        announcementText.setScale(0);
        callText.setScale(0);

        this.tweens.add({
            targets: banner,
            scaleX: 1,
            duration: 350,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: [announcementText, callText],
                    scaleX: 1,
                    scaleY: 1,
                    duration: 250,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        this.time.delayedCall(1000, () => {
                            this.tweens.add({
                                targets: [banner, announcementText, callText],
                                scaleY: 0,
                                alpha: 0,
                                duration: 250,
                                ease: 'Quad.easeIn',
                                onComplete: () => {
                                    banner.destroy();
                                    announcementText.destroy();
                                    callText.destroy();
                                }
                            });
                        });
                    }
                });
            }
        });
    }

    createHUD() {
        const width = this.scale.width;
        this.hudContainer = this.add.container(0, 0);

        const topBar = this.add.rectangle(width / 2, 50, width, 100, 0x111827, 0.4);
        this.hudContainer.add(topBar);

        const p1Circle = this.add.circle(65, 65, 45, 0x1e3a8a);
        p1Circle.setStrokeStyle(4, 0x60a5fa);
        
        const p1CircleScales = this.add.graphics();
        p1CircleScales.lineStyle(2.5, 0x60a5fa, 1);
        p1CircleScales.lineBetween(45, 65, 85, 65);
        p1CircleScales.lineBetween(65, 45, 65, 85);
        p1CircleScales.strokeCircle(45, 75, 6);
        p1CircleScales.strokeCircle(85, 75, 6);
        
        this.hudP1Name = this.add.text(125, 25, 'ROE', {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            fill: '#60a5fa',
            stroke: '#000000',
            strokeThickness: 3
        });

        const h1Bg = this.add.rectangle(435, 60, 600, 30, 0x1f2937);
        h1Bg.setStrokeStyle(3.5, 0xeab308);
        this.h1Bar = this.add.rectangle(138, 48, 594, 24, 0x22c55e).setOrigin(0, 0);

        const s1Bg = this.add.rectangle(290, 93, 300, 14, 0x111827);
        s1Bg.setStrokeStyle(2, 0x4b5563);
        this.s1Bar = this.add.rectangle(142, 88, 0, 10, 0x6366f1).setOrigin(0, 0);
        this.s1Text = this.add.text(450, 88, 'METER  0%', { fontFamily: '"Press Start 2P"', fontSize: '10px', fill: '#a5b4fc' });

        this.hudContainer.add([p1Circle, p1CircleScales, this.hudP1Name, h1Bg, this.h1Bar, s1Bg, this.s1Bar, this.s1Text]);

        const p2Circle = this.add.circle(width - 65, 65, 45, 0x7f1d1d);
        p2Circle.setStrokeStyle(4, 0xef4444);

        const p2CircleGavel = this.add.graphics();
        p2CircleGavel.lineStyle(3, 0xfca5a5, 1);
        p2CircleGavel.lineBetween(width - 78, 78, width - 52, 52);
        p2CircleGavel.fillStyle(0xef4444, 1);
        p2CircleGavel.fillCircle(width - 52, 52, 10);

        this.hudP2Name = this.add.text(width - 125, 25, 'WADE', {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            fill: '#fca5a5',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0);

        const h2Bg = this.add.rectangle(width - 435, 60, 600, 30, 0x1f2937);
        h2Bg.setStrokeStyle(3.5, 0xeab308);
        this.h2Bar = this.add.rectangle(width - 138 - 594, 48, 594, 24, 0xf97316).setOrigin(0, 0);

        const s2Bg = this.add.rectangle(width - 290, 93, 300, 14, 0x111827);
        s2Bg.setStrokeStyle(2, 0x4b5563);
        this.s2Bar = this.add.rectangle(width - 142 - 294, 88, 0, 10, 0xec4899).setOrigin(0, 0);
        this.s2Text = this.add.text(width - 450, 88, 'METER  0%', { fontFamily: '"Press Start 2P"', fontSize: '10px', fill: '#fbcfe8' }).setOrigin(1, 0);

        this.hudContainer.add([p2Circle, p2CircleGavel, this.hudP2Name, h2Bg, this.h2Bar, s2Bg, this.s2Bar, this.s2Text]);

        const timerBgCircle = this.add.circle(width / 2, 60, 48, 0x1c1917);
        timerBgCircle.setStrokeStyle(5, 0xeab308);

        this.timerText = this.add.text(width / 2, 58, '99', {
            fontFamily: '"Press Start 2P"',
            fontSize: '34px',
            fill: '#fde047',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const roundCapsule = this.add.graphics();
        roundCapsule.fillStyle(0x27272a, 0.95);
        roundCapsule.lineStyle(2, 0xeab308, 0.85);
        roundCapsule.fillRoundedRect(width / 2 - 70, 112, 140, 30, 4);
        roundCapsule.strokeRoundedRect(width / 2 - 70, 112, 140, 30, 4);

        const roundLabel = this.add.text(width / 2, 127, 'ROUND 1', {
            fontFamily: '"Press Start 2P"',
            fontSize: '11px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.hudContainer.add([timerBgCircle, this.timerText, roundCapsule, roundLabel]);

        this.muteButton = this.add.text(width - 40, 150, '🔊 MUTE (M)', {
            fontFamily: '"Press Start 2P"',
            fontSize: '11px',
            fill: '#ffffff',
            backgroundColor: '#18181b',
            padding: { x: 8, y: 6 }
        }).setOrigin(1, 0).setInteractive();
        
        this.muteButton.on('pointerdown', () => this.toggleMute());
    }

    toggleMute() {
        const muted = this.audioManager.toggleMute();
        this.muteButton.setText(muted ? '🔇 UNMUTE (M)' : '🔊 MUTE (M)');
    }

    updateHUD() {
        const width = this.scale.width;

        const p1HWidth = (this.player1.health / this.player1.maxHealth) * 594;
        this.tweens.add({
            targets: this.h1Bar,
            width: p1HWidth,
            duration: 50,
            ease: 'Quad.easeOut'
        });

        const p2HWidth = (this.player2.health / this.player2.maxHealth) * 594;
        this.tweens.add({
            targets: this.h2Bar,
            x: width - 138 - p2HWidth,
            width: p2HWidth,
            duration: 50,
            ease: 'Quad.easeOut'
        });

        this.h1Bar.setFillStyle(this.player1.health < 30 ? 0xef4444 : (this.player1.health < 60 ? 0xeab308 : 0x22c55e));
        this.h2Bar.setFillStyle(this.player2.health < 30 ? 0xef4444 : (this.player2.health < 60 ? 0xeab308 : 0xf97316));

        const p1SWidth = (this.player1.superMeter / 100) * 294;
        this.s1Bar.width = p1SWidth;
        this.s1Text.setText(`METER  ${Math.floor(this.player1.superMeter)}%`);
        if (this.player1.superMeter >= 100) {
            this.s1Text.setText('SUPER READY! [SPACE]');
            this.s1Text.setFill('#fde047');
        } else {
            this.s1Text.setFill('#a5b4fc');
        }

        const p2SWidth = (this.player2.superMeter / 100) * 294;
        this.s2Bar.width = p2SWidth;
        this.s2Bar.x = width - 142 - p2SWidth;
        this.s2Text.setText(`METER  ${Math.floor(this.player2.superMeter)}%`);
        if (this.player2.superMeter >= 100) {
            this.s2Text.setText('SUPER READY! [0]');
            this.s2Text.setFill('#fde047');
        } else {
            this.s2Text.setFill('#fbcfe8');
        }
    }

    update(time, delta) {
        if (this.gameState !== 'fight') return;

        this.player1.update(this.player2);
        this.player2.update(this.player1);

        if (this.demoMode) {
            this.handleAIBehavior(this.player1, this.player2);
            this.handleAIBehavior(this.player2, this.player1);

            this.demoTimer -= delta;

            if (this.demoTimer <= 0) {
                this.endDemoMode();
            }

            this.checkAttackOverlaps();
            this.checkVictoryCondition();
            return;
        }

        // --- PLAYER 1 (ROE) INPUTS ---
        let p1XDir = 0;
        if (this.keysP1.left.isDown) p1XDir = -1;
        else if (this.keysP1.right.isDown) p1XDir = 1;
        this.player1.move(p1XDir);

        if (Phaser.Input.Keyboard.JustDown(this.keysP1.jump)) {
            this.player1.jump();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keysP1.attack)) {
            if (this.keysP1.down.isDown) {
                this.player1.triggerSpecialShield();
            } else {
                this.player1.triggerAttack();
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.keysP1.super)) {
            if (this.player1.superMeter >= 100) {
                this.triggerSuper(this.player1);
            }
        }

        // --- PLAYER 2 (WADE) / AI INPUTS ---
        if (this.player2.isAI) {
            this.handleAIBehavior(this.player2, this.player1);
        } else {
            let p2XDir = 0;
            if (this.keysP2.left.isDown) p2XDir = -1;
            else if (this.keysP2.right.isDown) p2XDir = 1;
            this.player2.move(p2XDir);

            if (Phaser.Input.Keyboard.JustDown(this.keysP2.jump)) {
                this.player2.jump();
            }

            const isP2AttackPressed = Phaser.Input.Keyboard.JustDown(this.keysP2.attack) || 
                                      Phaser.Input.Keyboard.JustDown(this.keysP2.attackNumpad);
            if (isP2AttackPressed) {
                if (this.keysP2.down.isDown) {
                    this.player2.triggerSpecialShield();
                } else {
                    this.player2.triggerAttack();
                }
            }

            const isP2SuperPressed = Phaser.Input.Keyboard.JustDown(this.keysP2.super) || 
                                     Phaser.Input.Keyboard.JustDown(this.keysP2.superNumpad);
            if (isP2SuperPressed) {
                if (this.player2.superMeter >= 100) {
                    this.triggerSuper(this.player2);
                }
            }
        }

        this.checkAttackOverlaps();
        this.checkVictoryCondition();
        this.updateHUD();
    }

    
handleAIBehavior(aiPlayer, targetPlayer) {
        const dist = Phaser.Math.Distance.Between(aiPlayer.x, aiPlayer.y, targetPlayer.x, targetPlayer.y);
        const now = this.time.now;

        if (aiPlayer.isStunned) return;

        if (dist > 180) {
            const dir = targetPlayer.x > aiPlayer.x ? 1 : -1;
            aiPlayer.move(dir);

            if (Math.random() < 0.008 && aiPlayer.isGrounded) {
                aiPlayer.jump();
            }
        } else {
            aiPlayer.body.setVelocityX(0);

            if (aiPlayer.superMeter >= 100 && Math.random() < 0.015) {
                this.triggerSuper(aiPlayer);
            } else if (targetPlayer.isAttacking && Math.random() < 0.12) {
                aiPlayer.triggerSpecialShield();
            } else if (now - aiPlayer.lastAttackTime > 900) {
                aiPlayer.triggerAttack();
            }
        }
    }

    startDemoMode() {
        this.demoMode = true;
        this.demoTimer = 300000;

        this.player1.isAI = true;
        this.player2.isAI = true;

        this.endDemoButton.setVisible(true);
    }

    endDemoMode() {
        this.demoMode = false;
        this.endDemoButton.setVisible(false);
        this.scene.restart();
    }

    checkAttackOverlaps() {
        // Player 1 hitting Player 2
        if (this.player1.isAttacking && !this.player2.isStunned) {
            const hitbox = this.player1.getAttackHitboxBounds();
            const p2Bounds = this.player2.getBounds();
            if (Phaser.Geom.Rectangle.Overlaps(hitbox, p2Bounds)) {
                this.player2.takeDamage(this.player1.damageNormal, this.player1.currentMove);
                this.player1.gainSuperMeter(this.comboMeterGain);
                this.playSFX('gavel-hit');
                this.cheerSpectators();
                this.player1.disableAttackHitbox();
            }
        }

        // Player 2 hitting Player 1
        if (this.player2.isAttacking && !this.player1.isStunned) {
            const hitbox = this.player2.getAttackHitboxBounds();
            const p1Bounds = this.player1.getBounds();
            if (Phaser.Geom.Rectangle.Overlaps(hitbox, p1Bounds)) {
                this.player1.takeDamage(this.player2.damageNormal, this.player2.currentMove);
                this.player2.gainSuperMeter(this.comboMeterGain);
                this.playSFX('gavel-hit');
                this.cheerSpectators();
                this.player2.disableAttackHitbox();
            }
        }
    }

    triggerSuper(fighter) {
        fighter.triggerSuperMove();
    }

    cheerSpectators() {
        this.galleryJudges.forEach((judge, idx) => {
            this.tweens.add({
                targets: judge,
                y: 515 - 45,
                duration: 150,
                yoyo: true,
                repeat: 1,
                ease: 'Back.easeOut'
            });

            if (judge.tinyGavel) {
                this.tweens.add({
                    targets: judge.tinyGavel,
                    angle: idx % 2 === 0 ? 35 : -35,
                    duration: 80,
                    yoyo: true,
                    repeat: 3
                });
            }
        });
    }

    playSFX(key) {
        this.audioManager.playSFX(key);
    }

    showPopupText(x, y, text, color) {
        const style = {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            fill: color,
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        };

        const t = this.add.text(x, y, text, style).setOrigin(0.5).setDepth(25);
        
        t.setScale(0);
        this.tweens.add({
            targets: t,
            scaleX: 1.1,
            scaleY: 1.1,
            y: y - 55,
            duration: 180,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({
                    targets: t,
                    alpha: 0,
                    scaleX: 0.8,
                    scaleY: 0.8,
                    y: y - 90,
                    delay: 550,
                    duration: 250,
                    onComplete: () => t.destroy()
                });
            }
        });
    }

    handleTimeOut() {
        this.gameState = 'verdict';
        this.audioManager.stopMusic();

        const winner = this.player1.health >= this.player2.health ? this.player1 : this.player2;
        const loser = winner === this.player1 ? this.player2 : this.player1;

        this.fighters.forEach(f => {
            f.body.setVelocity(0, 0);
            f.body.setAllowGravity(false);
        });

        showFinalVerdictScreen(this, 
            { id: winner.characterId, name: winner.charName },
            { id: loser.characterId, name: loser.charName },
            () => { this.restartBattle(); }
        );
    }

    checkVictoryCondition() {
        if (this.gameState !== 'fight') return;
        if (this.player1.health <= 0 || this.player2.health <= 0) {
            this.gameState = 'verdict';

            const winner = this.player1.health > 0 ? this.player1 : this.player2;
            const loser = winner === this.player1 ? this.player2 : this.player1;

            this.audioManager.stopMusic();

            this.fighters.forEach(f => {
                f.body.setVelocity(0, 0);
                f.body.setAllowGravity(false);
            });

            if (this.timerEvent) this.timerEvent.destroy();

            this.time.delayedCall(1200, () => {
                showFinalVerdictScreen(this, 
                    { id: winner.characterId, name: winner.charName },
                    { id: loser.characterId, name: loser.charName },
                    () => { this.restartBattle(); }
                );
            });
        }
    }

    restartBattle() {
        if (this.timerEvent) this.timerEvent.destroy();
        
        this.fighters.forEach(f => {
            f.disableAttackHitbox();
            f.destroy();
        });
        if (this.hudContainer) this.hudContainer.destroy();

        this.scene.restart();
    }
}
