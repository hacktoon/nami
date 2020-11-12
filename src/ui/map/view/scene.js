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

    renderCursor(canvas, {prevCursor, cursor, focusOffset, prevFrameOffset}) {
        const focus = this.focus.plus(focusOffset)

        this.#renderFrame(focus, (tilePoint, canvasPoint) => {
            if (tilePoint.equals(prevCursor)) {
                canvas.clear(this.tileSize, canvasPoint)
            }
            if (tilePoint.equals(cursor)) {
                const color = 'rgba(255, 255, 255, .5)'
                canvas.border(this.tileSize, canvasPoint, color)
            }
        })
    }

    #renderFrame(focus, callback) {
        const {origin, target} = this.frame.rect(focus)
        for(let i = origin.x, x = 0; i <= target.x; i++, x += this.tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += this.tileSize) {
                const tilePoint = new Point(i, j)
                const canvasPoint = this.#buildCanvasPoint(x, y, this.frame.offset)
                callback(tilePoint, canvasPoint)
            }
        }
    }

    #buildCanvasPoint(x, y, offset) {
        return new Point(x, y).minus(offset)
    }
}


class Frame {
    constructor(tileSize, width, height) {
        this.tileSize = tileSize
        this.eastPad = Math.floor(width / 2 - tileSize / 2)
        this.northPad = Math.floor(height / 2 - tileSize / 2)
        this.westPad = width - this.eastPad - tileSize
        this.southPad = height - this.northPad - tileSize
        this.eastTileCount = Math.ceil(this.eastPad / tileSize)
        this.northTileCount = Math.ceil(this.northPad / tileSize)
        this.westTileCount = Math.ceil(this.westPad / tileSize)
        this.southTileCount = Math.ceil(this.southPad / tileSize)
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
        const topLeftPoint = new Point(this.eastTileCount, this.northTileCount)
        const bottomRightPoint = new Point(this.westTileCount, this.southTileCount)
        const origin = offset.minus(topLeftPoint)
        const target = offset.plus(bottomRightPoint)
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
