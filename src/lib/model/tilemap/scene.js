import { Point } from '/lib/base/point'
import { Rect } from '/lib/base/number'
import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { createCanvas } from '/ui/canvas'


export class TileMapScene {
    static schema = new Schema(
        'TileMapScene',
        Type.point('focus', "Focus", {default: '77,50'}),
        Type.boolean('wrap', "Wrap", {default: false}),
        Type.number('zoom', "Zoom", {default: 6, step: 1, min: 1, max: 100}),
    )

    static create(diagram, rect, params) {
        return new TileMapScene(diagram, rect, params)
    }

    constructor(diagram, rect, params) {
        const [focus, wrap, zoom] = params.get('focus', 'wrap', 'zoom')
        this.frame = new Frame(rect, zoom)
        this.diagram = diagram
        this.textQueue = []
        this.markQueue = []
        this.focus = focus
        this.wrap = wrap
        this.zoom = zoom
        this.rect = rect  // TODO: needed only in UITileMapMouse, delete

        // TODO: send params to render method, avoid buildind an
        // instance on every UI action
    }

    render(canvas) {
        const offscreenCanvas = createCanvas(this.width, this.height)
        const markSize = Math.round(this.zoom / 4)
        const markCenter = Math.floor(this.zoom / 2)

        this.#renderFrame((tilePoint, canvasPoint) => {
            if (this.isWrappable(tilePoint)) {
                const color = this.diagram.get(tilePoint)
                const text = this.diagram.getText(tilePoint)
                const mark = this.diagram.getMark(tilePoint)
                canvas.rect(canvasPoint, this.zoom, color)
                if (text) {
                    this.textQueue.push([canvasPoint, text])
                }
                if (mark) {
                    this.markQueue.push([canvasPoint, mark])
                }

            } else {
                canvas.clear(this.zoom, canvasPoint)
            }
        })
        for(let [canvasPoint, mark] of this.markQueue) {
            const offset = markCenter - markSize / 2
            const markPoint = Point.plus(canvasPoint, [offset, offset])
            canvas.mark(markPoint, markSize, mark)
        }
        for(let [canvasPoint, text] of this.textQueue) {
            canvas.text(canvasPoint, text, '#FFF')
        }
    }

    #renderFrame(callback) {
        const {origin, target} = this.frame.tileWindow(this.focus)
        for(let i = origin[0], x = 0; i <= target[0]; i++, x += this.zoom) {
            for(let j = origin[1], y = 0; j <= target[1]; j++, y += this.zoom) {
                const tilePoint = [i, j]
                const canvasPoint = Point.minus([x, y], this.frame.offset)
                callback(tilePoint, canvasPoint)
            }
        }
    }

    isWrappable(point) {
        if (this.wrap) return true
        const rect = new Rect(this.diagram.width, this.diagram.height)
        return rect.isInside(point)
    }

    renderCursor(canvas, cursor) {
        const {origin} = this.frame.tileWindow(this.focus)
        // get tile at scene edge
        let canvasPoint = Point.minus(cursor, origin)
        // make it a canvas position
        canvasPoint = Point.multiplyScalar(canvasPoint, this.zoom)
        // apply viewport offset
        canvasPoint = Point.minus(canvasPoint, this.frame.offset)
        canvas.cursor(this.zoom, canvasPoint, '#FFF')
    }
}


class Frame {
    constructor(rect, zoom) {
        const westPad = Math.floor(rect.width / 2 - zoom / 2)
        const northPad = Math.floor(rect.height / 2 - zoom / 2)
        const xTileCount = Math.ceil(westPad / zoom)
        const yTileCount = Math.ceil(northPad / zoom)
        this.center = [xTileCount, yTileCount]
        this.offset = [
            (xTileCount * zoom) - westPad,
            (yTileCount * zoom) - northPad
        ]
        this.width = rect.width
        this.height = rect.height
        this.zoom = zoom
    }

    tileWindow(offset) {
        // focus defaults to 0,0.
        const point = offset ?? [0, 0]
        return {
            origin: Point.minus(point, this.center),
            target: Point.plus(point, this.center)
        }
    }

    tilePoint(mousePoint) {
        const {origin} = this.tileWindow()
        const mouse = Point.plus(mousePoint, this.offset)
        const x = Math.floor(mouse[0] / this.zoom)
        const y = Math.floor(mouse[1] / this.zoom)
        return Point.plus(origin, [x, y])
    }
}
