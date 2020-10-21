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

    dragPoint(dragOffset) {
        const dragged = this.offset.plus(dragOffset)
        const x = Math.floor(dragged.x / this.scale)
        const y = Math.floor(dragged.y / this.scale)
        return new Point(x, y)
    }
}


export class Camera {
    constructor(diagram, frame, focus) {
        this.tileSize = diagram.tileSize
        this.diagram = diagram
        this.width = frame.width
        this.height = frame.height
        this.frame = frame
        this.focus = focus
    }

    render(canvas) {
        const {origin, target} = this.frame.rect(this.focus)
        for(let i = origin.x, x = 0; i <= target.x; i++, x += this.tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += this.tileSize) {
                const gridPoint = new Point(i, j)
                const color = this.diagram.get(gridPoint)
                const canvasPoint = new Point(x, y).minus(this.frame.offset)
                canvas.rect(this.tileSize, canvasPoint, color)
            }
        }
    }

    renderBackground(canvas) {
        const {origin, target} = this.frame.rect()
        for(let i = origin.x, x = 0; i <= target.x; i++, x += this.tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += this.tileSize) {
                const gridPoint = new Point(i, j)
                if ((gridPoint.x + gridPoint.y) % 2) {
                    const canvasPoint = new Point(x, y).minus(this.frame.offset)
                    canvas.rect(this.tileSize, canvasPoint, '#FFF')
                }
            }
        }
    }
}
