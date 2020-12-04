import { Point } from '/lib/point'
import { Schema, Type } from '/lib/schema'


export class MapScene {
    static schema = new Schema(
        Type.point('focus', "Focus", new Point(0, 0)),
        Type.boolean('wrap', "Wrap", false),
        Type.number('zoom', "Zoom", 20, {step: 1, min: 1}),
    )
}


export class Scene {
    constructor(diagram, frame) {
        this.diagram = diagram
        this.frame = frame
        this.width = frame.width
        this.height = frame.height
        this.tileSize = diagram.tileSize
        this.focus = diagram.focus
    }

    render(canvas, focusOffset, zoom) {
        const tileSize = this.tileSize + zoom
        const focus = this.focus.plus(focusOffset)
        this.#renderFrame(focus, (tilePoint, canvasPoint) => {
            const color = this.diagram.get(tilePoint)
            if (color == 'transparent') {
                canvas.clear(tileSize, canvasPoint)
            } else {
                canvas.rect(tileSize, canvasPoint, color)
            }
        })
    }

    renderCursor(canvas, cursor) {
        const canvasPoint = this.#canvasPoint(cursor, this.focus)
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

    #canvasPoint(point, focus) {
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

