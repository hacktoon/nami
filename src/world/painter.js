
export default class WorldPainter {
    constructor (world, canvas, tilesize) {
        this.ctx = canvas.getContext("2d")
        this.world = world
        this.tilesize = tilesize
    }

    draw () {
        this.world.iter(tile => {
            let color = tile.debug ? "red" : tile.relief.color
            this.drawPoint(tile.point, color)
        })
    }

    drawPoint (point, color) {
        let x = point.x * this.tilesize,
            y = point.y * this.tilesize

        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, this.tilesize, this.tilesize)
    }

    drawBlackWhite () {
        this.world.iter(tile => {
            let color = tile.relief.isBelowSeaLevel ? "#FFF" : "#000"
            this.drawPoint(tile.point, color)
        })
    }

    drawHeat() {
        this.world.iter(tile => {
            this.drawPoint(tile.point, tile.heat.color)
        })
    }

    drawMoisture() {
        this.world.iter(tile => {
            this.drawPoint(tile.point, tile.moisture.color)
        })
    }
}
