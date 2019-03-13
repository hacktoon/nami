
class WorldPainter {
    constructor (canvas) {
        this.ctx = canvas.getContext("2d")
    }

    draw (world, tilesize) {
        world.grid.forEach((tile, point) => {
            this.drawPoint(point, tilesize, tile.terrain.color)
        })
    }

    drawPoint (point, tilesize, color) {
        let x = point.x * tilesize,
            y = point.y * tilesize

        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, tilesize, tilesize)
    }

    drawBlackWhite (world, tilesize) {
        world.grid.forEach((tile, point) => {
            let x = point.x * tilesize,
                y = point.y * tilesize

            this.ctx.fillStyle = tile.terrain.isWater ? "#FFF" : "#000"
            this.ctx.fillRect(x, y, tilesize, tilesize)
        })
    }

    drawTectonics (world, tilesize) {
        world.grid.forEach((tile, point) => {
            let x = point.x * tilesize,
                y = point.y * tilesize

            if (tile.isPlateEdge) {
                this.ctx.fillStyle = "red"
            } else {
                this.ctx.fillStyle = tile.terrain.color
            }
            this.ctx.fillRect(x, y, tilesize, tilesize)
        })
    }

    drawBorders (world, tilesize) {
        let previousIsWater = false
        world.grid.forEach((tile, point) => {
            let x = point.x * tilesize,
            y = point.y * tilesize

            let color = "#FFF"
            if (!tile.terrain.isWater && previousIsWater) {
                color = "#000"
            }
            previousIsWater = tile.terrain.isWater
            this.ctx.fillStyle = color
            this.ctx.fillRect(x, y, tilesize, tilesize)
        })
    }
}


var isBeach = function (point) {
    var neighbors = new PointNeighborhood(point),
        found = false;
    neighbors.adjacent(function (neighbor) {
        var isLand = grid.get(point) > world.seaLevel;
        //var hasWaterNeighbor = grid.get(neighbor) <= world.seaLevel;
        var diff = grid.get(point) - grid.get(neighbor);
        if (isLand && hasWaterNeighbor && diff < 8) {
            found = true;
            return
        }
    })
    return found;
};
