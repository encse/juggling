const canvas = document.getElementById('gameCanvas');


const ctx = canvas.getContext('2d');
const gravity = 0.2

let juggler = {};
let balls = [];

let tutorialStep = 0;
const throwHistory = [];

// Game loop control
let lastTime = 0;

function isMacOS() {
    return navigator.userAgentData?.platform === 'macOS';
}


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


const cascadeTutorial = [{
    text: "Press ←",
    check: [
        { hand: "left" },
    ]
},
{
    text: "Press →",
    check: [
        { hand: "right" },
    ]
},
{
    text: "← →  ← →",
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
        { hand: "left" },
        { hand: "right" },
        { hand: "left" },
        { hand: "right" },
        { hand: "left" },
        { hand: "right" },
    ]
},
{
    text: "That's called a cascade",
    ballsAlternating: true,
    check: [
        { hand: "left" },
        { hand: "right" },
        { hand: "left" },
        { hand: "right" },
        { hand: "left" },
        { hand: "right" },
        { hand: "left" },
        { hand: "right" },
        { hand: "left" },
        { hand: "right" },
        { hand: "left" },
        { hand: "right" },
        { hand: "left" },
        { hand: "right" },
        { hand: "left" },
        { hand: "right" },
        { hand: "left" },
        { hand: "right" },
        { hand: "left" },
        { hand: "right" },
    ]
},
{
    text: "Now make a snake: ← ← ←, → → →",
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
    text: "Switch back to cascade: left-right-left-right",
    ballsAlternating: true,
    check: [
        { hand: "left" },
        { hand: "right" },
        { hand: "left" },
        { hand: "right" },
        { hand: "left" },
        { hand: "right" },
    ]
}];


const tutorial = [
    ...cascadeTutorial,
    {
        text: "Keep the rtythm. Now use <ALT> for outer throws",
        ballsAlternating: true,
        check: [
            { hand: "left", inner: false },
            { hand: "right", inner: false },
            { hand: "left", inner: false },
            { hand: "right", inner: false },
            { hand: "left", inner: false },
            { hand: "right", inner: false },
        ]
    },
    {
        text: "Try this pattern: outer, inner, inner",
        ballsAlternating: true,
        check: [
            { inner: false, high: false },
            { inner: true, high: false },
            { inner: true, high: false },
            { inner: false, high: false },
            { inner: true, high: false },
            { inner: true, high: false },
        ]
    },
    {
        text: "You are getting it, keep pushing",
        ballsAlternating: true,
        check: [
            { inner: false, high: false },
            { inner: true, high: false },
            { inner: true, high: false },
            { inner: false, high: false },
            { inner: true, high: false },
            { inner: true, high: false },
            { inner: false, high: false },
            { inner: true, high: false },
            { inner: true, high: false },
            { inner: false, high: false },
            { inner: true, high: false },
            { inner: true, high: false },
            { inner: false, high: false },
            { inner: true, high: false },
            { inner: true, high: false },
        ]
    },
    {
        text: "<SHIFT> for higher throws",
        ballsAlternating: false,
        check: [
            { high: true },
            { high: true },
            { high: true },
            { high: true },
            { high: true },
            { high: true },
        ]
    },
    {
        text: "Try forming a circle throwing high balls with your right hand",
        ballsAlternating: true,
        check: [
            { hand: "left", high: false },
            { hand: "right", high: true },
            { hand: "left", high: false },
            { hand: "right", high: true },
        ]
    },
    {
        text: "Continue",
        ballsAlternating: true,
        check: [
            { hand: "left", high: false },
            { hand: "right", high: true },
            { hand: "left", high: false },
            { hand: "right", high: true },
            { hand: "left", high: false },
            { hand: "right", high: true },
            { hand: "left", high: false },
            { hand: "right", high: true },
            { hand: "left", high: false },
            { hand: "right", high: true },
        ]
    },
    {
        text: "Press <CTRL> for vertical throws",
        ballsAlternating: false,
        check: [
            { up: true },
            { up: true },
            { up: true },
            { up: true },
        ]
    },
    {
        text: "Each ball in your left, throw them up vertically",
        ballsAlternating: true,
        check: [
            { hand: "left", up: true },
            { hand: "left", up: true },
            { hand: "left", up: true },
        ]
    },
    {
        text: "To make an outer vertical, press <CTRL> <ALT>",
        ballsAlternating: true,
        check: [
            { inner: false, up: true },
            { inner: false, up: true },
            { inner: false, up: true },
            { inner: false, up: true },
            { inner: false, up: true },
            { inner: false, up: true },
        ]
    },
    {
        text: "Form columns in your left hand. 3 vertical throws inside, 3 vertical outside",
        ballsAlternating: true,
        check: [
            { hand: "left", inner: true, up: true },
            { hand: "left", inner: true, up: true },
            { hand: "left", inner: true, up: true },
            { hand: "left", inner: false, up: true },
            { hand: "left", inner: false, up: true },
            { hand: "left", inner: false, up: true },
            { hand: "left", inner: true, up: true },
            { hand: "left", inner: true, up: true },
            { hand: "left", inner: true, up: true },
        ]
    },

    {
        text: "Switch hands now. Throw the balls up in your right.",
        ballsAlternating: true,
        check: [
            { hand: "right", up: true },
            { hand: "right", up: true },
            { hand: "right", up: true },
        ]
    },

    {
        text: "Still in your right hand start throwing up one ball inside (<CTRL>), then one ball outside (<CTRL> <ALT>)",
        ballsAlternating: true,
        check: [
            { hand: "right", up: true, inner: true},
            { hand: "right", up: true, inner: false},
            { hand: "right", up: true, inner: true},
            { hand: "right", up: true, inner: false},
        ]
    },
    {
        text: "This is a mini-cascade in your right hand now! Keep going",
        ballsAlternating: true,
        check: [
            { hand: "right", up: true, inner: true},
            { hand: "right", up: true, inner: false},
            { hand: "right", up: true, inner: true},
            { hand: "right", up: true, inner: false},
            { hand: "right", up: true, inner: true},
            { hand: "right", up: true, inner: false},
            { hand: "right", up: true, inner: true},
            { hand: "right", up: true, inner: false},
            { hand: "right", up: true, inner: true},
            { hand: "right", up: true, inner: false},
            { hand: "right", up: true, inner: true},
            { hand: "right", up: true, inner: false},
        ]
    },
    {
        text: "Switch back to cascade now: left-right-left-right",
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
        text: "Now try this. Only one ball changes hands, the other two moves vertically (<CTRL>)",
        ballsAlternating: false,
        check: [
            { hand: "left", up: true },
            { hand: "left", up: false },
            { hand: "right", up: true },
            { hand: "right", up: false },
        ]
    },
    {
        text: "Good, continue",
        ballsAlternating: false,
        check: [
            { hand: "left", up: true },
            { hand: "left", up: false },
            { hand: "right", up: true },
            { hand: "right", up: false },
            { hand: "left", up: true },
            { hand: "left", up: false },
            { hand: "right", up: true },
            { hand: "right", up: false },
            { hand: "left", up: true },
            { hand: "left", up: false },
            { hand: "right", up: true },
            { hand: "right", up: false },
        ]
    },

    {
        text: "Try up-up-toss up-up-toss",
        ballsAlternating: false,
        check: [
            { hand: "left", up: true },
            { hand: "left", up: true },
            { hand: "left", up: false },
            { hand: "right", up: true },
            { hand: "right", up: true },
            { hand: "right", up: false },
            { hand: "left", up: true },
            { hand: "left", up: true },
            { hand: "left", up: false },
        ]
    },
    {
        text: "Do it some more",
        ballsAlternating: false,
        check: [
            { hand: "left", up: true },
            { hand: "left", up: true },
            { hand: "left", up: false },
            { hand: "right", up: true },
            { hand: "right", up: true },
            { hand: "right", up: false },
            { hand: "left", up: true },
            { hand: "left", up: true },
            { hand: "left", up: false },
            { hand: "right", up: true },
            { hand: "right", up: true },
            { hand: "right", up: false },
            { hand: "left", up: true },
            { hand: "left", up: true },
            { hand: "left", up: false },
        ]
    },
    {
        text: "Now all balls in your left hand, throw them up once, then throw them to the right",
        ballsAlternating: false,
        check: [
            { hand: "left", up: true },
            { hand: "left", up: true },
            { hand: "left", up: true },
            { hand: "left", up: false },
            { hand: "left", up: false },
            { hand: "left", up: false },
        ]
    },
    {
        text: "And back.... up-up-up toss-toss-toss",
        ballsAlternating: false,
        check: [
            { hand: "right", up: true },
            { hand: "right", up: true },
            { hand: "right", up: true },
            { hand: "right", up: false },
            { hand: "right", up: false },
            { hand: "right", up: false },
        ]
    },
    {
        text: "And the snake forms again. ",
        ballsAlternating: false,
        check: [
            { hand: "left", up: true },
            { hand: "left", up: true },
            { hand: "left", up: true },
            { hand: "left", up: false },
            { hand: "left", up: false },
            { hand: "left", up: false },
            { hand: "right", up: true },
            { hand: "right", up: true },
            { hand: "right", up: true },
            { hand: "right", up: false },
            { hand: "right", up: false },
            { hand: "right", up: false },
            { hand: "left", up: true },
            { hand: "left", up: true },
            { hand: "left", up: true },
            { hand: "left", up: false },
            { hand: "left", up: false },
            { hand: "left", up: false },
            { hand: "right", up: true },
            { hand: "right", up: true },
            { hand: "right", up: true },
            { hand: "right", up: false },
            { hand: "right", up: false },
            { hand: "right", up: false },
        ]
    },
    {
        text: "Keep playing!",
        check: []
    },

]



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


function releaseBall(hand, high, outer, up, horiz) {
    inner = !outer;
    let vx = balls.length % 2 == 0 ? 0 : 1;
    let vy;
    let dx = inner ? +15 : -15;

    if (horiz) {
        vy = -2;
    } else {
        vy = -8;

        if (up) {
            vy *= 1.1;
        }

        if (high) {
            vy *= 1.2;
        }

        if (inner) {
            vy *= 0.9;
        }

    }

    const otherHand = hand == "left" ? "right" : "left"

    for (let ball of balls) {
        if (ball.caught && ball.hand === hand) {
            ball.vx = hand == "left" ? vx : -vx;
            ball.vy = vy;
            ball.x = juggler.hands[hand].x + (hand == "left" ? dx : -dx);

            if (up) {
                dx = juggler.hands[hand].x - ball.x
            } else {
                dx = juggler.hands[otherHand].x - ball.x
            }
            const t = Math.abs(vy) * 2 / gravity;
            ball.vx = dx / t;

            ball.caught = false;
            ball.hand == "";

            throwHistory.push({ "ball": ball.id, hand, high, inner, up })
            console.log(throwHistory[throwHistory.length-1])
            break;
        }
    }

    if (tutorialStep < tutorial.length && match(tutorial[tutorialStep])) {
        tutorialStep++;
        showPopup();
    }
}

function match(step) {
    const pattern = step.check

    const actual = throwHistory.slice(- pattern.length);
    if (actual.length < pattern.length) {
        return false
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

function translateText(text) {
    if (isMacOS()) {
        text = text.replaceAll("<CTRL>", "^");
        text = text.replaceAll("<ALT>", "⌥");
        text = text.replaceAll("<SHIFT>", "⇧");
    } else {
        text = text.replaceAll("<CTRL>", "Ctrl");
        text = text.replaceAll("<ALT>", "Alt");
        text = text.replaceAll("<SHIFT>", "Shift");
    }
    return text;
}

function showPopup() {
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
    message.textContent = translateText(tutorial[tutorialStep].text);
    message.classList.add('show');
}


window.addEventListener("resize", initCanvas);
window.addEventListener("orientationchange", initCanvas);

document.addEventListener('keydown', function (e) {
    if (e.key === "ArrowLeft") {
        releaseBall("left", e.shiftKey || e.getModifierState("CapsLock"), e.altKey, e.ctrlKey, false);
    } else if (e.key === "ArrowRight") {
        releaseBall("right", e.shiftKey || e.getModifierState("CapsLock"), e.altKey, e.ctrlKey, false);
    } else if (e.key === "1") {
        releaseBall("left", false, false, false, true);
    } else if (e.key === "3") {
        releaseBall("right", false, false, false, true);
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
showPopup();
requestAnimationFrame(gameLoop);
