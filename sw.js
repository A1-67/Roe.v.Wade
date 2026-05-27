// UI Manager and Scene Helper for Supreme Showdown
import Phaser from 'phaser';

/**
 * Renders the custom legal verdict screen based on the winner
 * @param {Phaser.Scene} scene 
 * @param {object} winnerData { id: 'roe'|'wade', name: string }
 * @param {object} loserData { id: 'roe'|'wade', name: string }
 * @param {function} onRestart callback
 */
export function showFinalVerdictScreen(scene, winnerData, loserData, onRestart) {
    const width = scene.scale.width;
    const height = scene.scale.height;

    // Dark backdrop overlay
    const overlay = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
    overlay.setDepth(100);

    // Main parchment scroll container
    const verdictContainer = scene.add.container(width / 2, height / 2);
    verdictContainer.setDepth(101);

    // Decorative mahogany background board
    const board = scene.add.rectangle(0, 0, 950, 680, 0x27272a);
    board.setStrokeStyle(8, 0xeab308); // Gold frame border
    verdictContainer.add(board);

    // Gold Supreme Court seal watermark or graphic
    const seal = scene.add.graphics();
    seal.lineStyle(4, 0xca8a04, 0.25);
    seal.strokeCircle(0, -50, 160);
    seal.strokeCircle(0, -50, 140);
    
    // Draw scales of justice watermark
    seal.lineBetween(-40, -50, 40, -50);
    seal.lineBetween(0, -90, 0, -20);
    seal.lineStyle(2, 0xca8a04, 0.25);
    seal.lineBetween(-30, -50, -30, -30);
    seal.lineBetween(30, -50, 30, -30);
    verdictContainer.add(seal);

    // HEADER: FINAL VERDICT
    const headerText = scene.add.text(0, -260, 'FINAL VERDICT', {
        fontFamily: '"Press Start 2P"',
        fontSize: '42px',
        fill: '#fde047',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center'
    }).setOrigin(0.5);
    verdictContainer.add(headerText);

    // Decorative line
    const divider = scene.add.graphics();
    divider.lineStyle(4, 0xca8a04, 0.8);
    divider.lineBetween(-300, -210, 300, -210);
    verdictContainer.add(divider);

    // Case caption style
    const captionText = scene.add.text(0, -170, `${winnerData.name.toUpperCase()}  v.  ${loserData.name.toUpperCase()}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '22px',
        fill: '#ffffff',
        align: 'center'
    }).setOrigin(0.5);
    verdictContainer.add(captionText);

    const captionSub = scene.add.text(0, -130, 'No. 2025-SHOWDOWN  |  SUPREME COURT OF THE UNITED STATES', {
        fontFamily: 'Arial',
        fontSize: '16px',
        fill: '#a1a1aa',
        align: 'center'
    }).setOrigin(0.5);
    verdictContainer.add(captionSub);

    // VERDICT DESCRIPTION TEXTS
    let opinionString = '';
    let legalConsequences = '';

    if (winnerData.id === 'roe') {
        opinionString = 'HELD: The fundamental right to personal privacy is firmly established under the Due Process Clause of the Fourteenth Amendment. Plaintiff prevails!';
        legalConsequences = 'CONSEQUENCE:\nPrivacy protections are fortified. Individual autonomy over personal, medical, and family decisions is legally shielded nationwide against overreaching state laws.';
    } else {
        opinionString = 'HELD: The regulatory powers of the State are recognized as broad, compelling, and valid under police powers. Defendant prevails!';
        legalConsequences = 'CONSEQUENCE:\nState regulatory authority is validated. Regional legislative assemblies retain broad authority to enact policies ensuring public health and general welfare.';
    }

    const opinionText = scene.add.text(0, -30, opinionString, {
        fontFamily: 'Georgia, serif',
        fontSize: '24px',
        fill: '#fef08a',
        align: 'center',
        wordWrap: { width: 800, useAdvancedWrap: true },
        lineSpacing: 8
    }).setOrigin(0.5);
    verdictContainer.add(opinionText);

    const consequenceBox = scene.add.graphics();
    consequenceBox.fillStyle(0x18181b, 0.9);
    consequenceBox.lineStyle(2, 0xca8a04, 0.5);
    consequenceBox.fillRoundedRect(-400, 50, 800, 140, 8);
    consequenceBox.strokeRoundedRect(-400, 50, 800, 140, 8);
    verdictContainer.add(consequenceBox);

    const consequenceText = scene.add.text(0, 120, legalConsequences, {
        fontFamily: 'Arial',
        fontSize: '18px',
        fill: '#e4e4e7',
        align: 'center',
        wordWrap: { width: 750, useAdvancedWrap: true },
        lineSpacing: 4
    }).setOrigin(0.5);
    verdictContainer.add(consequenceText);

    // Restart button
    const restartBtn = scene.add.rectangle(0, 260, 320, 60, 0x1d4ed8);
    restartBtn.setStrokeStyle(3, 0xffffff);
    restartBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, 320, 60), Phaser.Geom.Rectangle.Contains);
    restartBtn.input.cursor = 'pointer';

    const restartText = scene.add.text(0, 260, 'NEW LITIGATION', {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        fill: '#ffffff'
    }).setOrigin(0.5);
    verdictContainer.add([restartBtn, restartText]);

    // Button interactions
    restartBtn.on('pointerover', () => {
        restartBtn.setFillStyle(0x2563eb);
        restartText.setScale(1.05);
    });
    restartBtn.on('pointerout', () => {
        restartBtn.setFillStyle(0x1d4ed8);
        restartText.setScale(1.0);
    });
    restartBtn.on('pointerdown', () => {
        onRestart();
    });

    // Animate verdict container entrance
    verdictContainer.setScale(0.8);
    verdictContainer.alpha = 0;
    scene.tweens.add({
        targets: verdictContainer,
        scaleX: 1,
        scaleY: 1,
        alpha: 1,
        duration: 500,
        ease: 'Back.easeOut'
    });
}

/**
 * Creates the character selection UI
 * @param {Phaser.Scene} scene 
 * @param {function} onCompleteCallback callback with (p1Id, p2Id, isVsAI)
 */
export function createCharacterSelectUI(scene, onCompleteCallback) {
    const width = scene.scale.width;
    const height = scene.scale.height;

    const selectContainer = scene.add.container(width / 2, height / 2);
    selectContainer.setDepth(10);

    // Decorative wood backing panel
    const bgPanel = scene.add.rectangle(0, 0, 1100, 720, 0x18181b, 0.95);
    bgPanel.setStrokeStyle(5, 0xca8a04);
    selectContainer.add(bgPanel);

    // TITLE
    const title = scene.add.text(0, -300, 'CHOOSE YOUR ADVOCATE', {
        fontFamily: '"Press Start 2P"',
        fontSize: '32px',
        fill: '#fde047',
        stroke: '#000000',
        strokeThickness: 5
    }).setOrigin(0.5);
    selectContainer.add(title);

    // Game Mode selection toggle
    let isVsAI = true;
    const modeBtn = scene.add.rectangle(0, -220, 480, 50, 0x3f3f46);
    modeBtn.setStrokeStyle(2, 0xca8a04);
    modeBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, 480, 50), Phaser.Geom.Rectangle.Contains);
    modeBtn.input.cursor = 'pointer';

    const modeText = scene.add.text(0, -220, 'GAME MODE: VS AI (SOLO)', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        fill: '#ffffff'
    }).setOrigin(0.5);
    selectContainer.add([modeBtn, modeText]);

    modeBtn.on('pointerdown', () => {
        isVsAI = !isVsAI;
        modeText.setText(isVsAI ? 'GAME MODE: VS AI (SOLO)' : 'GAME MODE: LOCAL 2-PLAYER');
        scene.playSFX('gavel-hit');
    });

    // Selected state
    let selectedP1 = 'roe';
    let selectedP2 = 'wade';

    const characters = [
        {
            id: 'roe',
            name: 'Roe',
            title: 'Plaintiff / Advocate of Liberty',
            faction: 'Blue Faction',
            color: 0x3b82f6,
            textColor: '#60a5fa',
            special: 'Privacy Shield [S+J]',
            super: 'Fundamental Right [SPACE]',
            desc: 'Agile & reactive. Female advocate in modern blue pantsuit & Bill of Rights navy cloak.'
        },
        {
            id: 'wade',
            name: 'Wade',
            title: 'Defendant / Advocate of State',
            faction: 'Red Faction',
            color: 0xef4444,
            textColor: '#fca5a5',
            special: 'Sovereign Wall [Down+1]',
            super: 'Statutory Mandate [0]',
            desc: 'Rigid & heavy. Male advocate in charcoal 3-piece suit, crimson tie, carrying an oak gavel.'
        }
    ];

    const cards = [];
    const p1Markers = [];
    const p2Markers = [];

    // Render Character Cards (Centred for exactly 2 characters)
    characters.forEach((char, index) => {
        const cx = index === 0 ? -240 : 240;
        const cy = 20;

        const card = scene.add.rectangle(cx, cy, 380, 380, 0x27272a);
        card.setStrokeStyle(3, 0x4b5563);
        card.setInteractive(new Phaser.Geom.Rectangle(0, 0, 380, 380), Phaser.Geom.Rectangle.Contains);
        card.input.cursor = 'pointer';
        selectContainer.add(card);
        cards.push({ card, char });

        // Colored Header strip
        const cardHeader = scene.add.rectangle(cx, cy - 150, 376, 76, char.color);
        selectContainer.add(cardHeader);

        const cardName = scene.add.text(cx, cy - 165, char.name.toUpperCase(), {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        selectContainer.add(cardName);

        const cardTitle = scene.add.text(cx, cy - 130, char.title, {
            fontFamily: 'Arial',
            fontSize: '13px',
            fontStyle: 'bold',
            fill: '#ffffff'
        }).setOrigin(0.5);
        selectContainer.add(cardTitle);

        // Character Symbol illustration
        const symbolGraphics = scene.add.graphics();
        symbolGraphics.fillStyle(0x18181b, 0.6);
        symbolGraphics.fillCircle(cx, cy - 40, 50);
        
        // Custom graphic inside card
        symbolGraphics.lineStyle(3, char.color, 1);
        if (char.id === 'roe') {
            symbolGraphics.lineBetween(cx - 20, cy - 40, cx + 20, cy - 40);
            symbolGraphics.lineBetween(cx, cy - 65, cx, cy - 25);
        } else {
            symbolGraphics.lineBetween(cx - 15, cy - 25, cx + 15, cy - 55);
            symbolGraphics.fillStyle(char.color, 1);
            symbolGraphics.fillCircle(cx + 15, cy - 55, 12);
        }
        selectContainer.add(symbolGraphics);

        // Character details text
        const specName = scene.add.text(cx, cy + 30, `SPECIAL: ${char.special}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '9px',
            fill: '#e4e4e7',
            align: 'center'
        }).setOrigin(0.5);
        
        const superName = scene.add.text(cx, cy + 55, `SUPER: ${char.super}`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '9px',
            fill: char.textColor,
            align: 'center'
        }).setOrigin(0.5);
        selectContainer.add([specName, superName]);

        const descText = scene.add.text(cx, cy + 110, char.desc, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#d1d5db',
            align: 'center',
            wordWrap: { width: 330 }
        }).setOrigin(0.5);
        selectContainer.add(descText);

        // Markers for Player Select
        const p1Tag = scene.add.rectangle(cx - 80, cy - 210, 80, 30, 0x1d4ed8);
        p1Tag.setStrokeStyle(2, 0xffffff);
        const p1TagT = scene.add.text(cx - 80, cy - 210, 'P1', { fontFamily: '"Press Start 2P"', fontSize: '11px', fill: '#ffffff' }).setOrigin(0.5);
        selectContainer.add([p1Tag, p1TagT]);
        p1Markers.push({ id: char.id, bg: p1Tag, text: p1TagT });

        const p2Tag = scene.add.rectangle(cx + 80, cy - 210, 80, 30, 0xb91c1c);
        p2Tag.setStrokeStyle(2, 0xffffff);
        const p2TagT = scene.add.text(cx + 80, cy - 210, isVsAI ? 'AI' : 'P2', { fontFamily: '"Press Start 2P"', fontSize: '11px', fill: '#ffffff' }).setOrigin(0.5);
        selectContainer.add([p2Tag, p2TagT]);
        p2Markers.push({ id: char.id, bg: p2Tag, text: p2TagT });

        // Setup Selection Actions
        card.on('pointerdown', (pointer) => {
            scene.playSFX('gavel-hit');
            if (pointer.rightButtonDown() || pointer.button === 2) {
                // Secondary selection (P2)
                selectedP2 = char.id;
            } else {
                // Primary selection (P1)
                selectedP1 = char.id;
            }
            updateSelectionMarkers();
        });

        // Click selection handles left-click for P1, and also supports setting P2 if we click when P1 is already selected
        card.on('pointerdown', (pointer) => {
            if (pointer.button === 0) { // Left Click
                if (selectedP1 === char.id) {
                    // Toggle P2 if left click again
                    selectedP2 = char.id === 'roe' ? 'wade' : 'roe';
                } else {
                    selectedP1 = char.id;
                }
            } else { // Right click
                selectedP2 = char.id;
            }
            updateSelectionMarkers();
        });
    });

    function updateSelectionMarkers() {
        p1Markers.forEach(marker => {
            const isSel = marker.id === selectedP1;
            marker.bg.setVisible(isSel);
            marker.text.setVisible(isSel);
        });

        p2Markers.forEach(marker => {
            const isSel = marker.id === selectedP2;
            marker.bg.setVisible(isSel);
            marker.text.setVisible(isSel);
            marker.text.setText(isVsAI ? 'AI' : 'P2');
        });

        // Highlights around card
        cards.forEach(c => {
            if (c.char.id === selectedP1 && c.char.id === selectedP2) {
                // Both selected same character (Mirror Match!)
                c.card.setStrokeStyle(5, 0xca8a04); // Symmetrical gold border
            } else if (c.char.id === selectedP1) {
                c.card.setStrokeStyle(5, 0x3b82f6); // Glowing P1 blue
            } else if (c.char.id === selectedP2) {
                c.card.setStrokeStyle(5, 0xef4444); // Glowing P2 red
            } else {
                c.card.setStrokeStyle(3, 0x4b5563); // Muted grey
            }
        });
    }

    // Initial setup of markers
    updateSelectionMarkers();

    // START LITIGATION BUTTON
    const startBtn = scene.add.rectangle(0, 260, 400, 60, 0xeab308);
    startBtn.setStrokeStyle(3, 0xffffff);
    startBtn.setInteractive(new Phaser.Geom.Rectangle(0, 0, 400, 60), Phaser.Geom.Rectangle.Contains);
    startBtn.input.cursor = 'pointer';

    const startText = scene.add.text(0, 260, 'START LITIGATION', {
        fontFamily: '"Press Start 2P"',
        fontSize: '18px',
        fill: '#18181b'
    }).setOrigin(0.5);
    selectContainer.add([startBtn, startText]);

    startBtn.on('pointerover', () => {
        startBtn.setFillStyle(0xf59e0b);
        startText.setScale(1.05);
    });
    startBtn.on('pointerout', () => {
        startBtn.setFillStyle(0xeab308);
        startText.setScale(1);
    });
    startBtn.on('pointerdown', () => {
        scene.playSFX('gavel-hit');
        scene.playSFX('cheer-applause');
        
        // Fade out select screen
        scene.tweens.add({
            targets: selectContainer,
            y: height + 600,
            alpha: 0,
            duration: 600,
            ease: 'Back.easeIn',
            onComplete: () => {
                selectContainer.destroy();
                onCompleteCallback(selectedP1, selectedP2, isVsAI);
            }
        });
    });

    // Control Help Instructions at bottom
    const helpBox = scene.add.graphics();
    helpBox.fillStyle(0x27272a, 0.9);
    helpBox.fillRoundedRect(-500, 320, 1000, 60, 6);
    selectContainer.add(helpBox);

    const helpText = scene.add.text(0, 350, 'Controls | P1: A/D Move, W Jump, S+J Shield, J Combo, SPACE Super\nP2: Arrows Move/Jump/Shield, 1 Combo, 0 Super', {
        fontFamily: 'Arial',
        fontSize: '13px',
        fill: '#d1d5db',
        fontStyle: 'bold',
        align: 'center'
    }).setOrigin(0.5);
    selectContainer.add(helpText);

    // Initial entry animations
    selectContainer.setY(height + 1000);
    scene.tweens.add({
        targets: selectContainer,
        y: height / 2,
        duration: 800,
        ease: 'Back.easeOut'
    });
}
