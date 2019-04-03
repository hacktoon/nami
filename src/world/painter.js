
export default class WorldPainter {
    constructor (world, canvas, tilesize) {
        this.ctx = canvas.getContext("2d")
        this.world = world
        this.tilesize = tilesize
    }

    draw () {
        this.world.iter(tile => {
            let color = tile.debug ? "red" : tile.type.color
            this.drawTile(tile.point, color)
        })
    }

    drawTile (point, color) {
        let x = point.x * this.tilesize,
            y = point.y * this.tilesize

        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, this.tilesize, this.tilesize)
    }

    drawRelief () {
        this.world.iter(tile => {
            this.drawTile(tile.point, tile.relief.color)
        })
    }

    drawHeat() {
        this.world.iter(tile => {
            this.drawTile(tile.point, tile.heat.color)
        })
    }

    drawMoisture() {
        this.world.iter(tile => {
            this.drawTile(tile.point, tile.moisture.color)
        })
    }
}
