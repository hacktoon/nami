
class TectonicsPainter {
    constructor (canvas) {
        this.ctx = canvas.getContext("2d")
        this.tectonics = undefined
    }

    drawPoint (point, color, tilesize) {
        let ts = tilesize
        point = this.tectonics.grid.wrap(point)
        this.ctx.fillStyle = color
        this.ctx.fillRect(point.x * ts, point.y * ts, ts, ts)
    }

    drawEdges (tectonics, color, tilesize) {
        tectonics.plates.forEach(plate => {
            plate.forEachSeed(point => {
                this.drawPoint(point, "red", tilesize)
            })
            plate.forEachEdge(point => {
                this.drawPoint(point, color, tilesize)
            })
        })
    }

    draw (tectonics, tilesize) {
        this.tectonics = tectonics
        this.drawEdges(tectonics, "black", tilesize)
        this.drawLabel(tilesize)
    }

    drawLabel (tilesize){
        this.tectonics.plates.forEach(plate => {
            let symbol = Direction.getSymbol(plate.direction),
                text = symbol + plate.speed +"S/"+plate.density+"D",
                point = plate.region.startPoint,
                x = tilesize * point.x,
                y = tilesize * point.y
            this.ctx.fillStyle = "black"
            this.ctx.fillRect(x, y, tilesize, tilesize)
            this.ctx.font = "15px Arial"
            this.ctx.strokeStyle = "black"
            this.ctx.lineWidth = 4
            this.ctx.strokeText(text, x, y)
            this.ctx.fillStyle = "white"
            this.ctx.fillText(text, x, y)
        })
    }
}
