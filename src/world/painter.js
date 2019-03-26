
export default class WorldPainter {
    constructor (world, canvas, tilesize) {
        this.world = world
        this.tilesize = tilesize
        this.ctx = canvas.getContext("2d")
    }

    draw () {
        this.world.grid.forEach((tile, point) => {
            let color = tile.elevation.color
            if (tile.isRiverSource){
                color = "purple"
            }
            this.drawPoint(point, color)
        })
    }

    drawPoint (point, color) {
        let x = point.x * this.tilesize,
            y = point.y * this.tilesize

        // if (this.world.getTile(point).debug) { color = "red" }
        // if (this.world.getTile(point).debug2) { color = "yellow" }
        if (this.world.getTile(point).isVolcano) { color = 'red' }
        if (this.world.getTile(point).isSwamp) { color = 'lightseagreen' }
        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, this.tilesize, this.tilesize)
    }

    drawBlackWhite () {
        this.world.grid.forEach((tile, point) => {
            let color = tile.elevation.isBelowSeaLevel ? "#FFF" : "#000"
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
