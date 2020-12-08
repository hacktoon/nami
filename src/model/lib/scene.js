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
    constructor(diagram, width, height, focus, zoom, wrap) {
        this.frame = new Frame(width, height, focus, zoom, wrap)
        this.diagram = diagram
        this.width = width
        this.height = height
        this.tileSize = zoom
        this.focus = focus
        this.wrap = wrap
    }

    render(canvas, focusOffset) {
        const tileSize = this.tileSize
        const rect = this.frame.rect(this.frame.focus.plus(focusOffset))

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


class Frame {
    constructor(width, height, focus, zoom, wrap) {
        this.width = width
        this.height = height
        this.zoom = zoom
        this.eastPad = Math.floor(width / 2 - zoom / 2)
        this.northPad = Math.floor(height / 2 - zoom / 2)
        this.westPad = width - this.eastPad - zoom
        this.southPad = height - this.northPad - zoom
        const eastTileCount = Math.ceil(this.eastPad / zoom)
        const northTileCount = Math.ceil(this.northPad / zoom)
        const westTileCount = Math.ceil(this.westPad / zoom)
        const southTileCount = Math.ceil(this.southPad / zoom)
        this.origin = new Point(eastTileCount, northTileCount)
        this.target = new Point(westTileCount, southTileCount)
        this.focus = focus
        this.wrap = wrap
    }

    get offset() {
        const tileSize = this.zoom
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
        const x = Math.floor(mouse.x / this.zoom)
        const y = Math.floor(mouse.y / this.zoom)
        return new Point(x, y).plus(origin)
    }
}
