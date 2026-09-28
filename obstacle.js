class Obstacle {

    constructor(x, y, width, height, type) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    draw(ctx) {

        if (this.type === "tree") {

            // Tree trunk
            ctx.fillStyle = "brown";
            ctx.fillRect(
                this.x + 15,
                this.y + 25,
                15,
                40
            );

            // Tree leaves
            ctx.fillStyle = "green";
            ctx.beginPath();

            ctx.arc(
                this.x + 22,
                this.y + 20,
                30,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        else if (this.type === "pothole") {

            ctx.fillStyle = "black";

            ctx.beginPath();

            ctx.ellipse(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width / 2,
                this.height / 2,
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        else if (this.type === "river") {

            ctx.fillStyle = "#1c80dd";

            ctx.fillRect(
                this.x,
                this.y,
                this.width,
                this.height
            );
            
            ctx.fillStyle = "black";
            ctx.font = "14px Arial";

            ctx.fillText(
                "RIVER",
                this.x + 40,
                this.y + 45
            ); 
        }

        else if (this.type === "construction") {

            ctx.fillStyle = "orange";

            ctx.fillRect(
                this.x,
                this.y,
                this.width,
                this.height
            );

            ctx.fillStyle = "black";
            ctx.font = "14px Arial";

            ctx.fillText(
                "CONSTRUCTION",
                this.x + 18,
                this.y + 30
            );
        }
    }
}