
export default class WorldPainter {
    constructor (world, canvas, tilesize) {
        this.world = world
        this.tilesize = tilesize
        this.ctx = canvas.getContext("2d")
    }

    draw () {
        this.world.grid.forEach((tile, point) => {
            let color = tile.relief.color
            if (this.world.get(point).debug)
                color = "red"
            this.drawPoint(point, color)
        })
    }

    drawPoint (point, color) {
        let x = point.x * this.tilesize,
            y = point.y * this.tilesize

        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, this.tilesize, this.tilesize)
    }

    drawBlackWhite () {
        this.world.grid.forEach((tile, point) => {
            let color = tile.relief.isBelowSeaLevel ? "#FFF" : "#000"
            this.drawPoint(point, color)
        })
    }

    drawHeat() {
        this.world.grid.forEach((tile, point) => {
            this.drawPoint(point, tile.heat.color)
        })
    }

    drawMoisture() {
        this.world.grid.forEach((tile, point) => {
            this.drawPoint(point, tile.moisture.color)
        })
    }
}
