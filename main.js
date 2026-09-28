const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 600;

// Keyboard presses
const keys = {};

// Game state (paused, playing, gameover)
let gameState = "waiting";
let missionStarted = false;

// Creating player and obstacles
const player = new Player(100, 300);
let score = 0;
let deliveries = 0;
let distance = 0;

let highScore = Number(localStorage.getItem("ecoDashHighScore")) || 0;

const obstacles = [
    new Obstacle(300, 300, 60, 60, "tree"),
    new Obstacle(500, 400, 80, 40, "pothole"),
    new Obstacle(650, 150, 120, 80, "river"),
    new Obstacle(400, 150, 150, 50, "construction")
];

const deliveryPoint = {
    x: 850,
    y: 150,
    width: 80,
    height: 80
};

let timeOfDay = 0;
let isNight = false;

// Event listeners for key presses
window.addEventListener("keydown", function(event) {

    keys[event.key] = true;

});

// Event listener for key releases
window.addEventListener("keyup", function(event) {

    keys[event.key] = false;

});

// Event listener for pause button (P key)
window.addEventListener("keydown", function(event) {

    if (event.key === "p" || event.key === "P") {

        if (gameState === "playing") {
            gameState = "paused";
        } else if (gameState === "paused") {
            gameState = "playing";
        }
    }
});


// Draw background
function drawBackground() {

    // Sky
    ctx.fillStyle = "#7cc2dd";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Ground
    ctx.fillStyle = "#b79e69";

    ctx.fillRect(
        0,
        canvas.height * 0.65,
        canvas.width,
        canvas.height * 0.35
    );

    // Road
    ctx.fillStyle = "#4a4a4a";

    ctx.fillRect(
        0,
        450,
        canvas.width,
        100
    );

    // Road stripes
    ctx.fillStyle = "white";

    for (let x = 0; x < canvas.width; x += 80) {

        ctx.fillRect(
            x,
            495,
            40,
            5
        );
    }

    // Night colour
    if (isNight) {

        ctx.fillStyle = "rgba(10, 20, 45, 0.65)";
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }
}

// Update day/night cycle
function updateDayNightCycle() {

    if (gameState !== "playing") {
        return;
    }

    timeOfDay += 0.0005;

    if (timeOfDay >= 1) {
        timeOfDay = 0;
    }

    // Night is the middle part of the cycle
    isNight = timeOfDay >= 0.5 && timeOfDay < 0.75;
}

// Draw a simple solar station
function drawSolarStation() {

    // Solar panel
    ctx.fillStyle = isNight ? "#202020" : "#1f4e79";

    ctx.fillRect(
        750,
        300,
        100,
        60
    );

    // Solar panel lines
    ctx.strokeStyle = "white";

    for (let x = 750; x <= 850; x += 25) {

        ctx.beginPath();

        ctx.moveTo(x, 300);
        ctx.lineTo(x, 360);

        ctx.stroke();
    }

    // Station label
    ctx.fillStyle = isNight ? "#979797" : "black";
    ctx.font = "18px Arial";

    ctx.fillText(
        isNight ? "OFF" : "SOLAR",
        770,
        325
    );

    ctx.fillText(
        isNight ? "NIGHT" : "STATION",
        760,
        350
    );
}


// Keep player inside Canvas
function keepPlayerInsideCanvas() {

    if (player.x < 0) {
        player.x = 0;
        player.velocityX = 0;
    }

    if (player.x + player.width > canvas.width) {

        player.x =
            canvas.width - player.width;

        player.velocityX = 0;
    }

    if (player.y < 0) {

        player.y = 0;
        player.velocityY = 0;
    }

    if (player.y + player.height > canvas.height) {

        player.y =
            canvas.height - player.height;

        player.velocityY = 0;
    }
}


// Update HUD
function updateHUD() {

    const scoreElement = document.getElementById("score");
    const batteryElement = document.getElementById("battery");
    const highScoreElement = document.getElementById("highScore");
    const distanceElement = document.getElementById("distance");

    if (scoreElement) {
        scoreElement.textContent = score;
    }

    if (batteryElement) {
        batteryElement.textContent = Math.round(player.battery);
    }

    if (highScoreElement) {
        highScoreElement.textContent = highScore;
    }

    if (distanceElement) {
        distanceElement.textContent = Math.round(distance);
    }
}

// Check for collisions with obstacles
function checkCollisions() {

    let collided = false;

    for (const obstacle of obstacles) {

        const collision =
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y;

        if (collision) {

            collided = true;

            // Return to the position before the collision
            player.x = player.previousX;
            player.y = player.previousY;

            // Stop current movement
            player.velocityX = 0;
            player.velocityY = 0;

            // Only apply battery damage when cooldown has expired
            if (player.collisionCooldown <= 0) {

                player.battery -= 20;

                if (player.battery < 0) {
                    player.battery = 0;
                }

                // 1.5 second collision protection
                player.collisionCooldown = 1.5;
            }

            break;
        }
    }

    // Reset collision state after leaving the obstacle
    if (!collided) {
        player.hasCollided = false;
    }
}

// Solar charging
function checkSolarCharging() {

    // Solar panels cannot charge at night
    if (isNight) {
        return;
    }

    const solarStation = {
        x: 750,
        y: 300,
        width: 100,
        height: 60
    };

    const touchingStation =
        player.x < solarStation.x + solarStation.width &&
        player.x + player.width > solarStation.x &&
        player.y < solarStation.y + solarStation.height &&
        player.y + player.height > solarStation.y;

    if (touchingStation) {

        player.recharge();

        if (player.battery > 100) {
            player.battery = 100;
        }
    }
}

// Draw delivery point
function drawDeliveryPoint() {

    ctx.fillStyle = "#08aa10";

    ctx.fillRect(
        deliveryPoint.x,
        deliveryPoint.y,
        deliveryPoint.width,
        deliveryPoint.height
    );

    ctx.fillStyle = "white";
    ctx.font = "16px Arial";

    ctx.fillText(
        "DELIVERY",
        deliveryPoint.x + 1,
        deliveryPoint.y + 45
    );
}

// Check if player has reached the delivery point
function checkDelivery() {

    if (
        player.x < deliveryPoint.x + deliveryPoint.width &&
        player.x + player.width > deliveryPoint.x &&
        player.y < deliveryPoint.y + deliveryPoint.height &&
        player.y + player.height > deliveryPoint.y
    ) {

        score += 100;
        
        if (score > highScore) {

            highScore = score;

            localStorage.setItem(
                "ecoDashHighScore",
                highScore
            );
        }
        
        deliveries += 1;

        // Give drone 10% battery on successful delivery
        player.battery += 10;

        if (player.battery > 100) {
            player.battery = 100;
        }

        // Move delivery point to a new location
        deliveryPoint.x = 100 + Math.random() * 750;
        deliveryPoint.y = 100 + Math.random() * 350;
    }
}

// Check if the game is over (battery empty)
function checkGameOver() {

    if (player.battery <= 0) {

        player.battery = 0;

        gameState = "gameover";

        if (pauseButton) {
            pauseButton.textContent = "PAUSE";
        }
    }
}

// Start mission
function startMission() {

    if (missionStarted) {
        return;
    }

    missionStarted = true;
    gameState = "playing";

    player.x = 100;
    player.y = 300;

    player.velocityX = 0;
    player.velocityY = 0;

    player.battery = 100;

    score = 0;
    deliveries = 0;
    distance = 0;

    deliveryPoint.x = 850;
    deliveryPoint.y = 150;

    timeOfDay = 0;
    isNight = false;
}

// Pause/resume game
function togglePause() {

    if (!missionStarted) {
        return;
    }

    if (gameState === "playing") {

        gameState = "paused";

        if (pauseButton) {
            pauseButton.textContent = "Resume";
        }

    } else if (gameState === "paused") {

        gameState = "playing";

        if (pauseButton) {
            pauseButton.textContent = "Pause";
        }
    }
}

// Restart game
function restartGame() {

    // Reset mission state
    missionStarted = false;
    gameState = "waiting";

    // Reset player
    player.x = 100;
    player.y = 300;

    player.velocityX = 0;
    player.velocityY = 0;

    player.battery = 100;

    player.hasCollided = false;
    player.collisionCooldown = 0;

    // Reset score
    score = 0;
    deliveries = 0;
    distance = 0;

    // Reset delivery location
    deliveryPoint.x = 850;
    deliveryPoint.y = 150;

    timeOfDay = 0;
    isNight = false;

    // Change pause button back to PAUSE
    if (pauseButton) {
        pauseButton.textContent = "PAUSE";
    }
}

const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const restartButton = document.getElementById("restartButton");

if (startButton) {
    startButton.addEventListener("click", startMission);
}

if (pauseButton) {
    pauseButton.addEventListener("click", togglePause);
}

if (restartButton) {
    restartButton.addEventListener("click", restartGame);
}

// Draw game state messages (waiting, paused, gameover)
function drawGameState() {

    if (gameState === "waiting") {

        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "MISSION READY",
            canvas.width / 2,
            canvas.height / 2
        );

        ctx.font = "22px Arial";

        ctx.fillText(
            "Press START MISSION to begin",
            canvas.width / 2,
            canvas.height / 2 + 45
        );

        ctx.textAlign = "left";
    }


    if (gameState === "paused") {

        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "PAUSED",
            canvas.width / 2,
            canvas.height / 2
        );

        ctx.font = "22px Arial";

        ctx.fillText(
            "Press P or PAUSE to continue",
            canvas.width / 2,
            canvas.height / 2 + 45
        );

        ctx.textAlign = "left";
    }


    if (gameState === "gameover") {

        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "GAME OVER",
            canvas.width / 2,
            canvas.height / 2
        );

        ctx.font = "22px Arial";

        ctx.fillText(
            "Your battery is empty",
            canvas.width / 2,
            canvas.height / 2 + 45
        );

        ctx.textAlign = "left";
    }
}

// Main game loop
function gameLoop() {

    drawBackground();

    drawSolarStation();

    drawDeliveryPoint();

    for (const obstacle of obstacles) {
        obstacle.draw(ctx);
    }

    if (gameState === "playing") {

        player.update(keys);

        const movementX = player.x - player.previousX;
        const movementY = player.y - player.previousY;

        const movementDistance = Math.sqrt(
            movementX * movementX +
            movementY * movementY
        );

        distance += movementDistance;

        updateDayNightCycle();

        keepPlayerInsideCanvas();

        checkCollisions();

        checkDelivery();

        checkSolarCharging();

        checkGameOver();
    }

    player.draw(ctx);

    updateHUD();

    drawGameState();

    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();