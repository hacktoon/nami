
export default class WorldPainter {
    constructor (world, canvas, tilesize) {
        this.ctx = canvas.getContext("2d")
        this.world = world
        this.tilesize = tilesize
    }

    draw(xOffset, yoffset) {
        this.drawRelief()
    }

    drawBiome() {
        this.world.iter(tile => {
            let color = tile.debug ? "red" : tile.biome.color
            this.drawTile(tile.point, color)
        })
    }

    drawTile(point, color) {
        let x = point.x * this.tilesize,
            y = point.y * this.tilesize

        this.ctx.fillStyle = color
        this.ctx.fillRect(x, y, this.tilesize, this.tilesize)
    }

    drawRelief() {
        this.world.iter(tile => {
            let color = tile.relief.debug ? "#000078" : tile.relief.color
            color = tile.relief.debugSource ? "#0ff" : color
            color = tile.relief.debugMouth ? "yellow" : color
            color = tile.relief.debugBlue ? "blue" : color
            this.drawTile(tile.point, color)
        })
    }

    drawHeat() {
        let defaultColor = "#444"
        this.world.iter(tile => {
            let color = tile.landmass ? tile.heat.color : defaultColor
            this.drawTile(tile.point, color)
        })
    }

    drawMoisture() {
        let defaultColor = "#444"
        this.world.iter(tile => {
            let color = tile.landmass ? tile.moisture.color : defaultColor
            this.drawTile(tile.point, color)
        })
    }

    drawWaterbody() {
        let defaultColor = "#444"
        this.world.iter(tile => {
            let color = tile.waterbody ? tile.waterbody.color : defaultColor
            this.drawTile(tile.point, color)
        })
    }

    drawLandmass() {
        let defaultColor = "#444"
        this.world.iter(tile => {
            let color = tile.landmass ? tile.landmass.color : defaultColor
            this.drawTile(tile.point, color)
        })
    }
}
