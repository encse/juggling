const canvas = document.getElementById('gameCanvas');


const ctx = canvas.getContext('2d');
const gravity = 0.2


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

let juggler = {};
let balls = [];

let tutorialStep = -1;
const throwHistory = [];

// Game loop control
let lastTime = 0;

function isMacOS() {
    return navigator.userAgentData?.platform === 'macOS';
}


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
        text: "S,D,S,D...",
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
            { hand: "left", height: 0 },
            { hand: "right", height: 0 },
            { hand: "left", height: 0 },
            { hand: "right", height: 0 },
        ]
    },

    {
        text: "Now combine X throws with R throws. That's a 'shower' pattern.",
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
        text: "So far so good. Switch back to regular cascade now (S, D)",
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
        text: "Remember the wide throws (A, F)?",
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
        text: "Let's play in one hand now. Add 'Shift' to make vertical throws",
        check: [
            { up: true },
            { up: true },
            { up: true },
        ]
    },

    {
        text: "Keep playing with two balls in your left",
        check: [
            { ball: 'x', hand: 'left', up: true },
            { ball: 'y', hand: 'left', up: true },
            { ball: 'x', hand: 'left', up: true },
            { ball: 'y', hand: 'left', up: true },
        ]
    },
    {
        text: "Make an inward circle using Shift+A",
        check: [
            { ball: 'x', hand: 'left', up: true, outer: true },
            { ball: 'y', hand: 'left', up: true, outer: true },
            { ball: 'x', hand: 'left', up: true, outer: true },
            { ball: 'y', hand: 'left', up: true, outer: true },
        ]
    },
    {
        text: "Make columns with Shift+A, Shift+S",
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
        text: "Quickly alternate in and out throws (Shift+D, Shift+F)",
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
            { ball: 'x', hand: 'right', up: true, outer: true },
            { ball: 'y', hand: 'right', up: true, outer: false },
            { ball: 'z', hand: 'right', up: true, outer: true },
            { ball: 'x', hand: 'right', up: true, outer: false },
            { ball: 'y', hand: 'right', up: true, outer: true },
            { ball: 'z', hand: 'right', up: true, outer: false },
        ]
    },

    {
        text: "Something more challenging. Start with two balls in your right. Repeat S,C,D,X",
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
        text: "That's called rectangular juggling! Go higher with W,C,E,X",
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
        text: "Aim for keeping two balls in the air!",
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
        text: "That's a wrap! Get some balls and learn juggling for real.",
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
    juggler = {
        x: canvas.clientWidth / 2,
        y: canvas.clientHeight - 150,
        handOffsetX: 50,
        handOffsetY: 20,
        handRadius: 20,
        hands: {
            left: { x: 0, y: 0, active: false },
            right: { x: 0, y: 0, active: false }
        }
    }
    balls = [
        { id: "a", x: 0, y: 0, vx: 0, vy: 0, radius: 10, caught: true, hand: 'left', color: "#f12f34" },
        { id: "b", x: 0, y: 0, vx: 0, vy: 0, radius: 10, caught: true, hand: 'left', color: "#515c90" },
        { id: "c", x: 0, y: 0, vx: 0, vy: 0, radius: 10, caught: true, hand: 'right', color: "#32936f" },
    ];

}




// Update juggler hands
function updateJugglerHands() {
    juggler.hands.left.x = juggler.x - juggler.handOffsetX;
    juggler.hands.left.y = juggler.y - juggler.handOffsetY;
    juggler.hands.right.x = juggler.x + juggler.handOffsetX;
    juggler.hands.right.y = juggler.y - juggler.handOffsetY;

    // Position balls in the hands initially
    balls.forEach(ball => {
        if (ball.caught) {
            if (ball.hand === 'left') {
                ball.x = juggler.hands.left.x;
                ball.y = juggler.hands.left.y;
            } else if (ball.hand === 'right') {
                ball.x = juggler.hands.right.x;
                ball.y = juggler.hands.right.y;
            }
        }
    });
}

// Check ball collision with hand
function closeToHand(ball, hand) {
    const dist1 = Math.sqrt((ball.x - hand.x) ** 2 + (ball.y - hand.y) ** 2);
    const dist2 = Math.sqrt((ball.x + ball.vx - hand.x) ** 2 + (ball.y + ball.vy - hand.y) ** 2);
    // console.log(ball.id, dist1, dist2);
    return dist2 <= dist1 && dist1 < ball.radius + juggler.handRadius;
}


// Update balls
function updateBalls() {
    balls.forEach(ball => {
        if (!ball.caught) {
            // Apply gravity
            ball.vy += gravity;
            ball.x += ball.vx;
            ball.y += ball.vy;

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
                }
            }

        }
    });
}

// Render the juggler and balls
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    // Draw juggler hands
    ctx.fillStyle = '#f1c27d';
    ctx.beginPath();
    ctx.arc(juggler.hands.left.x, juggler.hands.left.y, juggler.handRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(juggler.hands.right.x, juggler.hands.right.y, juggler.handRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw balls
    balls.forEach(ball => {
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}


function releaseBall(hand, height, outer, up) {
    let vx = balls.length % 2 == 0 ? 0 : 1;
    let vy;
    let dx = outer ? -15 : 15;

    vy = [2, 7, 9][height];

    if (height == 0) {
        up = false;
    }

    if (outer && !up) {
        vy *= 1.1;
    }

    const otherHand = hand == "left" ? "right" : "left"

    for (let ball of balls) {
        if (ball.caught && ball.hand === hand) {
            ball.vx = hand == "left" ? vx : -vx;
            ball.vy = -vy;
            ball.x = juggler.hands[hand].x + (hand == "left" ? dx : -dx);

            if (up) {
                dx = juggler.hands[hand].x - ball.x
            } else {
                dx = juggler.hands[otherHand].x - ball.x
            }
            const t = vy * 2 / gravity;
            ball.vx = dx / t;

            ball.caught = false;
            ball.hand == "";

            throwHistory.push({ "ball": ball.id, hand, height, outer, up })
            console.log(throwHistory[throwHistory.length - 1])
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

    console.log(actual);
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
    if (back) {
        tutorialStep = Math.max(0, tutorialStep - 1);
    } else {
        tutorialStep = Math.min(tutorialStep + 1, tutorial.length-1);
    }

    const message = document.getElementById('popupMessage');
    if (tutorialStep == tutorial.length) {
        setTimeout(() => {
            message.classList.add('fade-out');
            setTimeout(() => {
                message.classList.remove('show', 'fade-out');
            }, 1000);
        }, 1000);
        return;
    }

    tutorial[tutorialStep].init?.();
    throwHistory.splice(0)
    message.innerHTML = tutorial[tutorialStep].text;
    message.classList.add('show');
}


window.addEventListener("resize", initCanvas);
window.addEventListener("orientationchange", initCanvas);

document.addEventListener('keydown', function (e) {
    console.log(e.code)
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

    updateJugglerHands();
    updateBalls(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

initCanvas();
advanceTutorial();
requestAnimationFrame(gameLoop);
