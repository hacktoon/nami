
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
            let color = tile.debug ? "red" : tile.relief.color
            this.drawTile(tile.point, color)
        })
    }

    drawHeat() {
        this.world.iter(tile => {
            this.drawTile(tile.point, tile.heat.color)
            if (tile.isLitoral)
                this.drawTile(tile.point, "black")
        })
    }

    drawMoisture() {
        this.world.iter(tile => {
            this.drawTile(tile.point, tile.moisture.color)
        })
    }

    drawWaterbody() {
        this.world.iter(tile => {
            let defaultColor = "#000"
            let color = tile.waterbody ? tile.waterbody.color : defaultColor
            this.drawTile(tile.point, color)
        })
    }

    drawLandmass() {
        this.world.iter(tile => {
            let defaultColor = "#000"
            let color = tile.landmass ? tile.landmass.color : defaultColor
            this.drawTile(tile.point, color)
        })
    }
}
