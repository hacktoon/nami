
export default class WorldPainter {
    constructor (world, canvas, tilesize) {
        this.ctx = canvas.getContext("2d")
        this.world = world
        this.tilesize = tilesize
    }

    drawHeightMap() {
        this.world.iter(({point}) => {
            let color = this.world.reliefMap.heightMap.getColor(point)
            this.drawTile(point, color)
        })
    }

    drawRelief() {
        this.world.iter(({point}) => {
            let color = this.world.reliefMap.getColor(point)
            this.drawTile(point, color)
        })
    }

    drawHeat() {
        this.world.iter(tile => {
            const color = this.world.heatMap.getColor(tile.point)
            this.drawTile(tile.point, color)
        })
    }

    drawMoisture() {
        this.world.iter(tile => {
            const color = this.world.moistureMap.getColor(tile.point)
            this.drawTile(tile.point, color)
        })
    }

    drawWater() {
        this.world.iter((tile, point) => {
            let color = this.world.waterMap.getColor(point)
            this.drawTile(point, color)
        })
    }

    drawLandmass() {
        let defaultColor = "#444"
        this.world.iter(tile => {
            let color = tile.landmass ? tile.landmass.color : defaultColor
            this.drawTile(tile.point, color)
        })
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
}
