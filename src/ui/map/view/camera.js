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

    rect(center=new Point()) {
        const eastTileCount = Math.ceil(this.eastPad / this.scale)
        const northTileCount = Math.ceil(this.northPad / this.scale)
        const westTileCount = Math.ceil(this.westPad / this.scale)
        const southTileCount = Math.ceil(this.southPad / this.scale)
        const topLeftPoint = new Point(eastTileCount, northTileCount)
        const bottomRightPoint = new Point(westTileCount, southTileCount)
        const origin = center.minus(topLeftPoint)
        const target = center.plus(bottomRightPoint)
        return {origin, target}
    }

    offset() {
        const eastTileCount = Math.ceil(this.eastPad / this.scale)
        const northTileCount = Math.ceil(this.northPad / this.scale)
        const offsetX = (eastTileCount * this.scale) - this.eastPad
        const offsetY = (northTileCount * this.scale) - this.northPad
        return new Point(offsetX, offsetY)
    }

    tilePoint(mousePoint) {
        const {origin} = this.rect()
        const offset = this.offset()
        const mouse = mousePoint.plus(offset)
        const x = Math.floor(mouse.x / this.tileSize)
        const y = Math.floor(mouse.y / this.tileSize)
        return new Point(x, y).plus(origin)
    }

    dragPoint(dragOffset) {
        const offset = this.offset()
        const dragged = offset.plus(dragOffset)
        const x = Math.floor(dragged.x / this.tileSize)
        const y = Math.floor(dragged.y / this.tileSize)
        return new Point(x, y)
    }
}


export class Camera {
    constructor(diagram, width, height, focus) {
        this.tileSize = diagram.tileSize
        this.diagram = diagram
        this.width = width
        this.height = height
        this.focus = focus
        this.eastSide = Math.floor(width / 2 - this.tileSize / 2)
        this.northSide = Math.floor(height / 2 - this.tileSize / 2)
        this.westSide = width - this.eastSide - this.tileSize
        this.southSide = height - this.northSide - this.tileSize
    }

    render(canvas, cursorPoint) {
        const {origin, target} = this.rect(this.focus)
        const offset = this.offset()

        for(let i = origin.x, x = 0; i <= target.x; i++, x += this.tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += this.tileSize) {
                const gridPoint = new Point(i, j)
                const color = this.diagram.get(gridPoint)
                const canvasPoint = new Point(x, y).minus(offset)
                canvas.rect(this.tileSize, canvasPoint, color)
                if (cursorPoint.equals(gridPoint)) {
                    canvas.rectBorder(this.tileSize, canvasPoint)
                }
            }
        }
    }

    renderBackground(canvas) {
        const {origin, target} = this.rect()
        const offset = this.offset(this.tileSize)

        for(let i = origin.x, x = 0; i <= target.x; i++, x += this.tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += this.tileSize) {
                const gridPoint = new Point(i, j)
                if ((gridPoint.x + gridPoint.y) % 2) {
                    const canvasPoint = new Point(x, y).minus(offset)
                    canvas.rect(this.tileSize, canvasPoint, '#FFF')
                }
            }
        }
    }

    rect(offset=new Point()) {
        const eastTileCount = Math.ceil(this.eastSide / this.tileSize)
        const northTileCount = Math.ceil(this.northSide / this.tileSize)
        const westTileCount = Math.ceil(this.westSide / this.tileSize)
        const southTileCount = Math.ceil(this.southSide / this.tileSize)
        const topLeftPoint = new Point(eastTileCount, northTileCount)
        const bottomRightPoint = new Point(westTileCount, southTileCount)
        const origin = offset.minus(topLeftPoint)
        const target = offset.plus(bottomRightPoint)
        return {origin, target}
    }

    offset() {
        const eastTileCount = Math.ceil(this.eastSide / this.tileSize)
        const northTileCount = Math.ceil(this.northSide / this.tileSize)
        const offsetX = (eastTileCount * this.tileSize) - this.eastSide
        const offsetY = (northTileCount * this.tileSize) - this.northSide
        return new Point(offsetX, offsetY)
    }

    tilePoint(mousePoint) {
        const {origin} = this.rect()
        const offset = this.offset()
        const mouse = mousePoint.plus(offset)
        const x = Math.floor(mouse.x / this.tileSize)
        const y = Math.floor(mouse.y / this.tileSize)
        return new Point(x, y).plus(origin)
    }

    dragPoint(dragOffset) {
        const offset = this.offset()
        const dragged = offset.plus(dragOffset)
        const x = Math.floor(dragged.x / this.tileSize)
        const y = Math.floor(dragged.y / this.tileSize)
        return new Point(x, y)
    }
}
