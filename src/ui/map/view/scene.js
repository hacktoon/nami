import { Point } from '/lib/point'


export class Scene {
    constructor(diagram, width, height) {
        this.frame = new Frame(diagram.tileSize, width, height)
        this.diagram = diagram
        this.width = width
        this.height = height
        this.tileSize = diagram.tileSize
        this.focus = diagram.focus
    }

    render(canvas, focusOffset) {
        const focus = this.focus.plus(focusOffset)
        this.#renderFrame(focus, (tilePoint, canvasPoint) => {
            const color = this.diagram.get(tilePoint)
            if (color == 'transparent') {
                canvas.clear(this.tileSize, canvasPoint)
            } else {
                canvas.rect(this.tileSize, canvasPoint, color)
            }
        })
    }

    renderCursor(canvas, cursor, focusOffset) {
        const focus = this.focus.plus(focusOffset)
        const canvasPoint = this.#renderPoint(cursor, focus)
        const color = 'rgba(255, 255, 255, .5)'

        canvas.cursor(this.tileSize, canvasPoint, color)
    }

    #renderFrame(focus, callback) {
        const {origin, target} = this.frame.rect(focus)
        for(let i = origin.x, x = 0; i <= target.x; i++, x += this.tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += this.tileSize) {
                const tilePoint = new Point(i, j)
                const canvasPoint = this.#buildCanvasPoint(new Point(x, y))
                callback(tilePoint, canvasPoint)
            }
        }
    }

    #renderPoint(point, focus) {
        const {origin} = this.frame.rect(focus)
        return point
            .minus(origin) // get tile at scene edge
            .multiply(this.tileSize)  // make it a canvas position
            .minus(this.frame.offset)  // apply viewport offset
    }

    #buildCanvasPoint(point) {
        return point.minus(this.frame.offset)
    }
}


class Frame {
    constructor(tileSize, width, height) {
        this.tileSize = tileSize
        this.eastPad = Math.floor(width / 2 - tileSize / 2)
        this.northPad = Math.floor(height / 2 - tileSize / 2)
        this.westPad = width - this.eastPad - tileSize
        this.southPad = height - this.northPad - tileSize
        const eastTileCount = Math.ceil(this.eastPad / tileSize)
        const northTileCount = Math.ceil(this.northPad / tileSize)
        const westTileCount = Math.ceil(this.westPad / tileSize)
        const southTileCount = Math.ceil(this.southPad / tileSize)
        this.origin = new Point(eastTileCount, northTileCount)
        this.target = new Point(westTileCount, southTileCount)
    }

    get offset() {
        const tileSize = this.tileSize
        const eastTileCount = Math.ceil(this.eastPad / tileSize)
        const northTileCount = Math.ceil(this.northPad / tileSize)
        const x = (eastTileCount * tileSize) - this.eastPad
        const y = (northTileCount * tileSize) - this.northPad
        return new Point(x, y)
    }

    rect(offset=new Point()) {
        const origin = offset.minus(this.origin)
        const target = offset.plus(this.target)
        return {origin, target}
    }

    tilePoint(mousePoint) {
        const {origin} = this.rect()
        const mouse = mousePoint.plus(this.offset)
        const x = Math.floor(mouse.x / this.tileSize)
        const y = Math.floor(mouse.y / this.tileSize)
        return new Point(x, y).plus(origin)
    }
}
