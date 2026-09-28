class Player {

    constructor(x, y) {

        // Player position
        this.x = x;
        this.y = y;

        // Player size
        this.width = 40;
        this.height = 30;

        // Movement
        this.velocityX = 0;
        this.velocityY = 0;

        this.acceleration = 0.4;
        this.maxSpeed = 5;
        this.friction = 0.90;

        // Direction
        this.angle = 0;

        // Battery
        this.battery = 100;

        this.hasCollided = false;
        this.previousX = x;
        this.previousY = y;
        this.collisionCooldown = 0;

        // Continuous battery drain
        this.batteryDrainRate = 0.01;
    }

    update(keys) {

        this.previousX = this.x;
        this.previousY = this.y;

        // Reduce collision cooldown
        if (this.collisionCooldown > 0) {
            this.collisionCooldown -= 1 / 60;

            if (this.collisionCooldown < 0) {
                this.collisionCooldown = 0;
            }
        }

        // Move up 
        let inputX = 0;
        let inputY = 0;

        if (keys["ArrowUp"] || keys["w"]) inputY -= 1;
        if (keys["ArrowDown"] || keys["s"]) inputY += 1;
        if (keys["ArrowLeft"] || keys["a"]) inputX -= 1;
        if (keys["ArrowRight"] || keys["d"]) inputX += 1;

        // Normalise diagonal movement
        if (inputX !== 0 || inputY !== 0) {

            const magnitude = Math.sqrt(
                inputX * inputX +
                inputY * inputY
            );

            inputX /= magnitude;
            inputY /= magnitude;

            this.velocityX += inputX * this.acceleration;
            this.velocityY += inputY * this.acceleration;
        }

        // Limit horizontal speed
        if (this.velocityX > this.maxSpeed) {
            this.velocityX = this.maxSpeed;
        }

        if (this.velocityX < -this.maxSpeed) {
            this.velocityX = -this.maxSpeed;
        }

        // Limit vertical speed
        if (this.velocityY > this.maxSpeed) {
            this.velocityY = this.maxSpeed;
        }

        if (this.velocityY < -this.maxSpeed) {
            this.velocityY = -this.maxSpeed;
        }

        // Apply friction
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Calculate direction angle
        if (this.velocityX !== 0 || this.velocityY !== 0) {

            this.angle = Math.atan2(
                this.velocityY,
                this.velocityX
            );
        }

        // Battery drains continuously while the mission is active
        this.battery -= this.batteryDrainRate;

        // Prevent battery going below zero
        if (this.battery < 0) {
            this.battery = 0;
        }
    }

    draw(ctx) {

        ctx.save();

        // Move canvas origin to player
        ctx.translate(
            this.x + this.width / 2,
            this.y + this.height / 2
        );

        // Rotate drone according to movement direction
        ctx.rotate(this.angle);

        // Drone body
        ctx.fillStyle = "#3b3b3b";
        ctx.fillRect(
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );

        // Drone wings
        ctx.fillStyle = "yellow";

        ctx.fillRect(
            -5,
            -20,
            10,
            10
        );

        ctx.fillRect(
            -5,
            10,
            10,
            10
        );

        ctx.fillRect(
            -25,
            -5,
            10,
            10
        );

        ctx.fillRect(
            15,
            -5,
            10,
            10
        );

        // Drone centre
        ctx.fillStyle = "white";

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            6,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
    }

    // Recharge the battery when the player is at a solar station
    recharge() {

        this.battery += 0.5;

        if (this.battery > 100) {
            this.battery = 100;
        }
    }
}