const canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');

const gravity = 0.9
const verticalSpeeds = [5, 20, 25];

let juggler = {
    streak: 0,
    mood: 'regular',
    x: 0,
    y: 0,
    handRadius: 30,
    hands: {
        left: { x: -100, y: 180, dx: 0, dy: 0, active: false, phase: 0, amplitude: 10 },
        right: { x: 130, y: 180, dx: 0, dy: 0, active: false, phase: 90, amplitude: 10 }
    },
    face: {
        x: -233,
        y: -300,
        width: 466,
        height: 600,
        imgIndex: 1,
        images: {
            dropped: [],
            regular: [],
            smile: [],
        }
    },
}

const keyMap = {
    KeyQ: { hand: "left", outer: true, height: 2 },
    KeyW: { hand: "left", outer: false, height: 2 },
    KeyE: { hand: "right", outer: false, height: 2 },
    KeyR: { hand: "right", outer: true, height: 2 },

    KeyA: { hand: "left", outer: true, height: 1 },
    KeyS: { hand: "left", outer: false, height: 1 },
    KeyD: { hand: "right", outer: false, height: 1 },
    KeyF: { hand: "right", outer: true, height: 1 },

    KeyZ: { hand: "left", outer: false, height: 0 },
    KeyX: { hand: "left", outer: false, height: 0 },
    KeyC: { hand: "right", outer: false, height: 0 },
    KeyV: { hand: "right", outer: false, height: 0 },
}

let balls = [];
let tutorialStep = -1;
let throwHistory = [];
let lastTime = 0;

const tutorial = [
    {
        text: "Let's learn to juggle! Press S.",
        check: [
            { hand: "left" },
        ]
    },
    {
        text: "Now press D.",
        check: [
            { hand: "right" },
        ]
    },
    {
        text: "S, D, S, D...",
        check: [
            { hand: "left" },
            { hand: "right" },
            { hand: "left" },
            { hand: "right" },
        ]
    },
    {
        text: "Keep one ball in the air, alternate hands!",
        ballsAlternating: true,
        check: [
            { hand: "left" },
            { hand: "right" },
            { hand: "left" },
            { hand: "right" },
            { hand: "left" },
            { hand: "right" },
        ]
    },
    {
        text: "That's called a cascade.",
        ballsAlternating: true,
        check: [
            { hand: "left" },
            { hand: "right" },
            { hand: "left" },
            { hand: "right" },
            { hand: "left" },
            { hand: "right" },
        ]
    },
    {
        text: "Let's make a snake. S, S, S, D, D, D",
        ballsAlternating: true,
        check: [
            { hand: "left" },
            { hand: "left" },
            { hand: "left" },
            { hand: "right" },
            { hand: "right" },
            { hand: "right" },
        ]
    },
    {
        text: "Switch back to cascade.",
        ballsAlternating: true,
        check: [
            { hand: "left" },
            { hand: "right" },
            { hand: "left" },
            { hand: "right" },
            { hand: "left" },
            { hand: "right" },
        ]
    },
    {
        text: "Keep the rtythm. Use A and F for wider throws.",
        ballsAlternating: true,
        check: [
            { hand: "left", outer: true },
            { hand: "right", outer: true },
            { hand: "left", outer: true },
            { hand: "right", outer: true },
            { hand: "left", outer: true },
            { hand: "right", outer: true },
        ]
    },
    {
        text: "You can go higher using Q, W, E and R.",
        ballsAlternating: true,
        check: [
            { height: 2 },
            { height: 2 },
            { height: 2 },
            { height: 2 },
        ]
    },
    {
        text: "Make a basic 'circle' using R and S.",
        ballsAlternating: true,
        check: [
            { hand: "left", height: 1 },
            { hand: "right", height: 2, outer: true },
            { hand: "left", height: 1 },
            { hand: "right", height: 2, outer: true },
            { hand: "left", height: 1 },
            { hand: "right", height: 2, outer: true },
        ]
    },

    {
        text: "This looks a bit odd, but we can make it better. Use X and C for quick low-pass throws",
        ballsAlternating: false,
        check: [
            { height: 0 },
            { height: 0 },
            { height: 0 },
            { height: 0 },
        ]
    },

    {
        text: "Combine X throws with R throws for a nice circle (also known as the shower).",
        check: [
            { ball: 'x', hand: "left", height: 0 },
            { ball: 'x', hand: "right", height: 2, outer: true },
            { ball: 'y', hand: "left", height: 0 },
            { ball: 'y', hand: "right", height: 2, outer: true },
            { ball: 'z', hand: "left", height: 0 },
            { ball: 'z', hand: "right", height: 2, outer: true },
        ]
    },

    {
        text: "Great! Switch back to regular cascade now (S, D)",
        check: [
            { ball: 'x', hand: "left", height: 1 },
            { ball: 'y', hand: "right", height: 1 },
            { ball: 'z', hand: "left", height: 1 },
            { ball: 'x', hand: "right", height: 1 },
            { ball: 'y', hand: "left", height: 1 },
            { ball: 'z', hand: "right", height: 1 },
        ]
    },

    {
        text: "Remember the wide throws A and F?",
        check: [
            { ball: 'x', hand: "left", outer: true, height: 1 },
            { ball: 'y', hand: "right", outer: true, height: 1 },
            { ball: 'z', hand: "left", outer: true, height: 1 },
        ]
    },
    {
        text: "Focus on the blue ball! Try throwing it outside, while keeping the other two inside.",
        check: [
            { ball: 'x', outer: true },
            { ball: 'y', outer: false },
            { ball: 'z', outer: false },
            { ball: 'x', outer: true },
            { ball: 'y', outer: false },
            { ball: 'z', outer: false },
            { ball: 'x', outer: true },
            { ball: 'y', outer: false },
            { ball: 'z', outer: false },
        ]
    },
    {
        text: "That's also known as the 'over the top' pattern",
        check: [
            { ball: 'x', outer: true },
            { ball: 'y', outer: false },
            { ball: 'z', outer: false },
            { ball: 'x', outer: true },
            { ball: 'y', outer: false },
            { ball: 'z', outer: false },
        ]
    },

    {
        text: "Let's play in one hand now. The 'Shift' key changes your throws vertical",
        check: [
            { up: true },
            { up: true },
            { up: true },
        ]
    },

    {
        text: "Juggle two balls in your left!",
        check: [
            { ball: 'x', hand: 'left', up: true },
            { ball: 'y', hand: 'left', up: true },
            { ball: 'x', hand: 'left', up: true },
            { ball: 'y', hand: 'left', up: true },
        ]
    },
    {
        text: "Make an inward circle using Shift+A.",
        check: [
            { ball: 'x', hand: 'left', up: true, outer: true },
            { ball: 'y', hand: 'left', up: true, outer: true },
            { ball: 'x', hand: 'left', up: true, outer: true },
            { ball: 'y', hand: 'left', up: true, outer: true },
        ]
    },
    {
        text: "Make columns with Shift+A, Shift+S.",
        check: [
            { ball: 'x', hand: 'left', up: true, outer: false },
            { ball: 'y', hand: 'left', up: true, outer: true },
            { ball: 'x', hand: 'left', up: true, outer: false },
            { ball: 'y', hand: 'left', up: true, outer: true },
        ]
    },

    {
        text: "Pass all balls to the right now (S). Form a circle with 3 balls using Shift+D.",
        check: [
            { ball: 'x', hand: 'right', up: true },
            { ball: 'y', hand: 'right', up: true },
            { ball: 'z', hand: 'right', up: true },
            { ball: 'x', hand: 'right', up: true },
            { ball: 'y', hand: 'right', up: true },
            { ball: 'z', hand: 'right', up: true },
        ]
    },

    {
        text: "Quickly alternate in and out throws with Shift+D, Shift+F.",
        check: [
            { ball: 'x', hand: 'right', up: true, outer: true },
            { ball: 'y', hand: 'right', up: true, outer: false },
            { ball: 'z', hand: 'right', up: true, outer: true },
            { ball: 'x', hand: 'right', up: true, outer: false },
            { ball: 'y', hand: 'right', up: true, outer: true },
            { ball: 'z', hand: 'right', up: true, outer: false },
        ]
    },
    {
        text: "A mini cascade in your right!",
        check: [
            { ball: 'x', hand: 'right', up: true, outer: true },
            { ball: 'y', hand: 'right', up: true, outer: false },
            { ball: 'z', hand: 'right', up: true, outer: true },
            { ball: 'x', hand: 'right', up: true, outer: false },
            { ball: 'y', hand: 'right', up: true, outer: true },
            { ball: 'z', hand: 'right', up: true, outer: false },
        ]
    },
    {
        text: "CapsLock turns on vertical mode. No need to press Shift anymore.",
        check: [
            { up: true },
            { up: true },
            { up: true },
        ]
    },

    {
        text: "Something more challenging. Start with two balls in your right. Repeat S, C, D, X (CapsLock on)",
        check: [
            { ball: 'x', hand: 'left', up: true },
            { ball: 'y', hand: 'right', height: 0 },
            { ball: 'z', hand: 'right', up: true },
            { ball: 'y', hand: 'left', height: 0 },
            { ball: 'x', hand: 'left', up: true },
            { ball: 'y', hand: 'right', height: 0 },
            { ball: 'z', hand: 'right', up: true },
            { ball: 'y', hand: 'left', height: 0 },
        ]
    },
    {
        text: "That's called rectangular juggling! Go higher with W, C, E, X (CapsLock on)",
        check: [
            { ball: 'x', hand: 'left', height: 2, up: true },
            { ball: 'y', hand: 'right', height: 0 },
            { ball: 'z', hand: 'right', height: 2, up: true },
            { ball: 'y', hand: 'left', height: 0 },
            { ball: 'x', hand: 'left', height: 2, up: true },
            { ball: 'y', hand: 'right', height: 0 },
            { ball: 'z', hand: 'right', height: 2, up: true },
            { ball: 'y', hand: 'left', height: 0 },
        ]
    },
    {
        text: "Aim to keep two balls in the air!",
        check: [
            { ball: 'x', hand: 'left', height: 2, up: true },
            { ball: 'y', hand: 'right', height: 0 },
            { ball: 'z', hand: 'right', height: 2, up: true },
            { ball: 'y', hand: 'left', height: 0 },
            { ball: 'x', hand: 'left', height: 2, up: true },
            { ball: 'y', hand: 'right', height: 0 },
            { ball: 'z', hand: 'right', height: 2, up: true },
            { ball: 'y', hand: 'left', height: 0 },
        ]
    },
    {
        text: "It's a wrap! Get 3 balls and learn juggling for real now.",
        check: [
            { ball: 'x', hand: 'left', height: 2, up: true },
            { ball: 'y', hand: 'right', height: 0 },
            { ball: 'z', hand: 'right', height: 2, up: true },
            { ball: 'y', hand: 'left', height: 0 },
            { ball: 'x', hand: 'left', height: 2, up: true },
            { ball: 'y', hand: 'right', height: 0 },
            { ball: 'z', hand: 'right', height: 2, up: true },
            { ball: 'y', hand: 'left', height: 0 },
        ]
    },
]

function initCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx = canvas.getContext('2d');

    const loadImage = (url, appendTo) => {
        let image = new Image();
        image.onload = () => {
            appendTo.push(image);
        }
        image.src = url;
    }
    loadImage("faceO.svg", juggler.face.images.dropped);
    loadImage("faceA1.svg", juggler.face.images.regular);
    loadImage("faceA2.svg", juggler.face.images.regular);
    loadImage("faceA3.svg", juggler.face.images.regular);
    loadImage("faceB1.svg", juggler.face.images.smile);
    loadImage("faceB2.svg", juggler.face.images.smile);
    loadImage("faceB3.svg", juggler.face.images.smile);


    leftHand = new Image();
    leftHand.onload = () => {
        juggler.hands.left.img = leftHand;
    }
    leftHand.src = `lefthand.svg`;


    rightHand = new Image();
    rightHand.onload = () => {
        juggler.hands.right.img = rightHand;
    }
    rightHand.src = `righthand.svg`;


    balls = [
        { id: "a", x: 0, y: 0, vx: 0, vy: 0, radius: 20, caught: true, hand: 'left', color: "#f12f34" },
        { id: "b", x: 0, y: 0, vx: 0, vy: 0, radius: 20, caught: true, hand: 'left', color: "#515c90" },
        { id: "c", x: 0, y: 0, vx: 0, vy: 0, radius: 20, caught: true, hand: 'right', color: "#32936f" },
    ];

}

// Check ball collision with hand
function closeToHand(ball, hand) {
    const dist1 = Math.sqrt((ball.x - hand.x) ** 2 + (ball.y - hand.y) ** 2);
    const dist2 = Math.sqrt((ball.x + ball.vx - hand.x) ** 2 + (ball.y + ball.vy - hand.y) ** 2);
    return dist2 <= dist1 && dist1 < ball.radius + juggler.handRadius;
}


// Update balls
function advanceTime(deltaMs) {

    for (; deltaMs > 0; deltaMs -= 16) {
        dt = deltaMs >= 16 ? 16 : deltaMs;

        for (let khand of ['left', 'right']) {
            let hand = juggler.hands[khand];

            hand.amplitude = Math.max(0, hand.amplitude * 0.8);
            hand.phase++;
            let sign = khand == 'left' ? 1 : -1;
            hand.dx = sign * hand.amplitude * Math.cos(4 * hand.phase / 180 * Math.PI);
            hand.dy = -3 * hand.amplitude * Math.sin(4 * hand.phase / 180 * Math.PI);
        }

        for (let ball of balls) {
            if (ball.caught) {
                if (ball.hand === 'left') {
                    ball.x = juggler.hands.left.x + juggler.hands.left.dx;
                    ball.y = juggler.hands.left.y + juggler.hands.left.dy;
                } else if (ball.hand === 'right') {
                    ball.x = juggler.hands.right.x + juggler.hands.right.dx;
                    ball.y = juggler.hands.right.y + juggler.hands.right.dy;
                }
            } else {
                ball.vy += gravity * dt / 16;
                ball.x += ball.vx * dt / 16;
                ball.y += ball.vy * dt / 16;

                // Ball off-screen - Game over logic could be added here
                if (ball.y > canvas.clientHeight) {
                    ball.y = canvas.clientHeight - 50;
                    ball.vy = -ball.vy * 0.7;
                }

                // Check if the ball is caught
                for (let hand of ['left', 'right']) {
                    if (closeToHand(ball, juggler.hands[hand])) {
                        ball.caught = true;
                        ball.hand = hand;

                        ball.vx = 0;
                        ball.vy = 0;

                        const reset = balls.filter(ball => ball.caught && ball.hand === hand).length > 1;
                        if (reset) {
                            juggler.streak = 0;
                            setMood();
                        } else {
                            juggler.streak++;
                            if (juggler.streak % 5 == 0) {
                                createFloatingLabel(juggler.streak, canvas.width / 2, canvas.height / 2);
                            }
                        }
                    }
                }
            }
        }
    }
}

// Render the juggler and balls
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    let s = Math.max(canvas.width / 1600, canvas.height / 900);
    ctx.translate(canvas.clientWidth / 2, canvas.clientHeight);
    ctx.scale(s, s);
    ctx.translate(0, -300);
    // // Set line style (optional)
    // ctx.strokeStyle = 'black';
    // ctx.lineWidth = 2;

    // // Draw horizontal axis
    // ctx.beginPath();
    // ctx.moveTo(0, -height/2); // Start at the left middle
    // ctx.lineTo(0, height / 2); // Draw to the right middle
    // ctx.stroke();

    // // Draw vertical axis
    // ctx.beginPath();
    // ctx.moveTo(-width / 2, 0); // Start at the top middle
    // ctx.lineTo(width / 2, 0); // Draw to the bottom middle
    // ctx.stroke();


    let faceImages = juggler.face.images[juggler.mood];
    if (faceImages.length > 0) {
        let img = faceImages[juggler.face.imgIndex % faceImages.length];
        ctx.drawImage(img, juggler.x + juggler.face.x, juggler.y + juggler.face.y, juggler.face.width, juggler.face.height);
    }


    // Draw balls
    balls.forEach(ball => {
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    const handSize = 70;
    for (let hand of [juggler.hands.left, juggler.hands.right]) {
        if (hand.img) {
            ctx.save();
            ctx.translate(hand.x + hand.dx - handSize / 2, hand.y + hand.dy - handSize / 3)
            ctx.drawImage(hand.img, 0, 0, handSize, handSize * .75);
            ctx.restore();
        }
    }

    ctx.restore();
}


function setMood() {
    if (juggler.streak == 0 && juggler.mood == 'smile') {
        juggler.mood = 'dropped'
    } else if (juggler.streak < 10) {
        juggler.mood = 'regular';
    } else {
        juggler.mood = 'smile';
    }
}

function animateJuggler() {
    setMood();
    juggler.face.imgIndex++;
}


function releaseBall(hand, height, outer, up) {
    let vx = balls.length % 2 == 0 ? 0 : 1;
    let vy;
    let dx = outer ? -15 : 15;

    vy = verticalSpeeds[height];

    if (height == 0) {
        up = false;
    }

    if (outer && !up) {
        vy *= 1.1;
    }

    const otherHand = hand == "left" ? "right" : "left"

    for (let ball of [...balls].reverse()) {
        if (ball.caught && ball.hand === hand) {
            ball.vx = hand == "left" ? vx : -vx;
            ball.vy = -vy;
            ball.x = juggler.hands[hand].x + (hand == "left" ? dx : -dx);

            juggler.hands[hand].phase = 0;
            juggler.hands[hand].amplitude = 10;
            if (up) {
                dx = juggler.hands[hand].x - ball.x
            } else {
                dx = juggler.hands[otherHand].x - ball.x
            }
            const t = vy * 2 / gravity;
            ball.vx = dx / t;

            ball.caught = false;
            ball.hand == "";
            throwHistory.push({ "ball": ball.id, hand, height, outer, up });
            break;
        }
    }

    if (tutorialStep < tutorial.length && match(tutorial[tutorialStep])) {
        advanceTutorial();
    }
}

function match(step) {
    const pattern = JSON.parse(JSON.stringify(step.check));

    const actual = throwHistory.slice(- pattern.length);
    if (actual.length < pattern.length) {
        return false
    }

    const ballMap = new Map();
    for (let i = 0; i < pattern.length; i++) {
        let patternBall = pattern[i].ball;
        let actualBall = actual[i].ball;
        if (patternBall) {
            if (!ballMap.get(patternBall)) {
                if ([...ballMap.values(ballMap)].includes(actualBall)) {
                    return false;
                }
                ballMap.set(patternBall, actualBall)
            }
            pattern[i].ball = ballMap.get(patternBall);
        }
    }

    for (let i = 0; i < pattern.length; i++) {
        for (let key of Object.keys(pattern[i])) {
            if (actual[i][key] != pattern[i][key]) {
                return false
            }
        }
    }

    if (step.ballsAlternating && pattern.length >= 3) {
        if (
            actual[0].ball == actual[1].ball ||
            actual[1].ball == actual[2].ball ||
            actual[0].ball == actual[2].ball
        ) {
            return false
        }

        for (let i = 3; i < pattern.length; i++) {
            if (actual[i - 3].ball != actual[i].ball) {
                return false;
            }
        }
    }

    return true;
}

function advanceTutorial(back) {
    throwHistory.splice(0);

    if (back) {
        tutorialStep = Math.max(0, tutorialStep - 1);
    } else {
        tutorialStep = Math.min(tutorialStep + 1, tutorial.length - 1);
    }

    const progress = document.getElementById('progress');
    const message = document.getElementById('popupMessage');

    progress.style.width = `${tutorialStep / (tutorial.length - 1) * 100}%`;
    message.innerText = tutorial[tutorialStep].text;
}


window.addEventListener("resize", initCanvas);
window.addEventListener("orientationchange", initCanvas);

document.addEventListener('keydown', function (e) {
    if (e.code == "Tab") {
        advanceTutorial(e.shiftKey);
        e.preventDefault();
        return true;
    }

    up = e.shiftKey ^ e.getModifierState("CapsLock");
    combo = keyMap[e.code]
    if (combo) {
        releaseBall(combo.hand, combo.height, combo.outer, up);
        return true;
    }
});


// Main game loop
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    advanceTime(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

function createFloatingLabel(number, x, y) {
    const label = document.createElement('div');
    label.className = 'floating-label';
    label.textContent = number;
    document.body.appendChild(label);

    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    label.style.transform = 'translate(-50%, -50%)';

    // Remove the label from the DOM after the animation completes
    label.addEventListener('animationend', () => {
        label.remove();
    });
}


setInterval(() => {
    animateJuggler();
}, 3000);

initCanvas();
advanceTutorial();
requestAnimationFrame(gameLoop);
