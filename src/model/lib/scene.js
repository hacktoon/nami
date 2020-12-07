import { Point } from '/lib/point'
import { Rect } from '/lib/number'
import { Schema, Type } from '/lib/schema'


export class MapScene {
    static schema = new Schema(
        Type.point('focus', "Focus", new Point(0, 0)),
        Type.boolean('wrap', "Wrap", false),
        Type.number('zoom', "Zoom", 20, {step: 1, min: 1}),
    )

    static create(diagram, width, height, params) {
        return new MapScene(diagram, params)
    }

    constructor(diagram, params) {
        this.diagram = diagram
        // TODO: set `this.data` and add attributes dynamically
        this.wrap = params.get('wrap')
        this.focus = params.get('focus')
        this.zoom = params.get('zoom')

    }
}


export class Scene {
    constructor(diagram, frame) {
        this.diagram = diagram
        this.frame = frame
        this.width = frame.width
        this.height = frame.height
        this.tileSize = frame.zoom
        this.focus = frame.focus
        this.wrap = frame.wrap
    }

    render(canvas, focus, focusOffset) {
        const tileSize = this.tileSize
        const rect = this.frame.rect(focus.plus(focusOffset))
        console.log();
        this.#renderFrame(rect, tileSize, (tilePoint, canvasPoint) => {
            if (this.isWrappable(tilePoint)) {
                const color = this.diagram.get(tilePoint)
                canvas.rect(tileSize, canvasPoint, color)
            } else {
                canvas.clear(tileSize, canvasPoint)
            }
        })
    }

    isWrappable(point) {
        if (this.wrap) return true
        return new Rect(this.diagram.width, this.diagram.height).inside(point)
    }

    renderCursor(canvas, cursor) {
        const canvasPoint = this.#canvasPoint(cursor, this.focus)
        const color = 'rgba(255, 255, 255, .5)'

        canvas.cursor(this.tileSize, canvasPoint, color)
    }

    #renderFrame(rect, tileSize, callback) {
        const {origin, target} = rect
        for(let i = origin.x, x = 0; i <= target.x; i++, x += tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += tileSize) {
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

