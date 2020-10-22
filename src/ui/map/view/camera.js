import { Point } from '/lib/point'


export class Frame {
    constructor(scale, width, height) {
        this.scale = scale
        this.width = width
        this.height = height
        this.eastPad = Math.floor(width / 2 - scale / 2)
        this.northPad = Math.floor(height / 2 - scale / 2)
        this.westPad = width - this.eastPad - scale
        this.southPad = height - this.northPad - scale
    }

    get offset() {
        const eastTileCount = Math.ceil(this.eastPad / this.scale)
        const northTileCount = Math.ceil(this.northPad / this.scale)
        const x = (eastTileCount * this.scale) - this.eastPad
        const y = (northTileCount * this.scale) - this.northPad
        return new Point(x, y)
    }

    rect(offset=new Point()) {
        const eastTileCount = Math.ceil(this.eastPad / this.scale)
        const northTileCount = Math.ceil(this.northPad / this.scale)
        const westTileCount = Math.ceil(this.westPad / this.scale)
        const southTileCount = Math.ceil(this.southPad / this.scale)
        const topLeftPoint = new Point(eastTileCount, northTileCount)
        const bottomRightPoint = new Point(westTileCount, southTileCount)
        const origin = offset.minus(topLeftPoint)
        const target = offset.plus(bottomRightPoint)
        return {origin, target}
    }

    tilePoint(mousePoint) {
        const {origin} = this.rect()
        const mouse = mousePoint.plus(this.offset)
        const x = Math.floor(mouse.x / this.scale)
        const y = Math.floor(mouse.y / this.scale)
        return new Point(x, y).plus(origin)
    }
}


export class Camera {
    constructor(diagram, frame, focus) {
        this.diagram = diagram
        this.tileSize = diagram.tileSize
        this.width = frame.width
        this.height = frame.height
        this.frame = frame
        this.focus = focus
    }

    renderFrame(callback, offset) {
        const {origin, target} = this.frame.rect(offset)
        for(let i = origin.x, x = 0; i <= target.x; i++, x += this.tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += this.tileSize) {
                const tilePoint = new Point(i, j)
                const canvasPoint = new Point(x, y).minus(this.frame.offset)
                callback(tilePoint, canvasPoint)
            }
        }
    }

    render(canvas, offset) {
        const focusOffset = this.focus.plus(offset)
        this.renderFrame((tilePoint, canvasPoint) => {
            const color = this.diagram.get(tilePoint)
            if (color == 'transparent') {
                canvas.clear(this.tileSize, canvasPoint)
            } else {
                canvas.rect(this.tileSize, canvasPoint, color)
            }
        }, focusOffset)
    }

    renderBackground(canvas) {
        this.renderFrame((tilePoint, canvasPoint) => {
            const isEven = (tilePoint.x + tilePoint.y) % 2
            const color = isEven ? '#DDD' : '#FFF'
            canvas.rect(this.tileSize, canvasPoint, color)
        })
    }
}
