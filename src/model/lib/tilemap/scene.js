import { Point } from '/lib/base/point'
import { Rect } from '/lib/base/number'
import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'


export class TileMapScene {
    static schema = new Schema(
        'TileMapScene',
        Type.point('focus', "Focus", {default: '77,50'}),
        Type.boolean('wrap', "Wrap", {default: false}),
        Type.number('zoom', "Zoom", {default: 6, step: 1, min: 1, max: 100}),
    )

    static create(diagram, width, height, params) {
        return new TileMapScene(diagram, width, height, params)
    }

    constructor(diagram, width, height, params) {
        this.diagram = diagram
        this.width = width
        this.height = height
        this.wrap = params.get('wrap')
        this.focus = params.get('focus')
        this.zoom = params.get('zoom')
        this.frame = new Frame(width, height, this.focus, this.zoom)
        this.textQueue = []
    }

    render(canvas) {
        this.#renderFrame((tilePoint, canvasPoint) => {
            if (this.isWrappable(tilePoint)) {
                const color = this.diagram.get(tilePoint)
                const text = this.diagram.getText(tilePoint)
                canvas.rect(canvasPoint, this.zoom, color)
                if (text) {
                    this.textQueue.push([canvasPoint, text])
                }
            } else {
                canvas.clear(this.zoom, canvasPoint)
            }
        })
        for(let [canvasPoint, text] of this.textQueue) {
            canvas.text(canvasPoint, text, '#FFF')
        }
    }

    isWrappable(point) {
        if (this.wrap) return true
        const rect = new Rect(this.diagram.width, this.diagram.height)
        return rect.isInside(point)
    }

    renderCursor(canvas, cursor) {
        const canvasPoint = this.#canvasPoint(cursor, this.focus)
        canvas.cursor(this.zoom, canvasPoint, '#FFF')
    }

    #renderFrame(callback) {
        const {origin, target} = this.frame.rect(this.focus)
        for(let i = origin.x, x = 0; i <= target.x; i++, x += this.zoom) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += this.zoom) {
                const tilePoint = new Point(i, j)
                const canvasPoint = (new Point(x, y)).minus(this.frame.offset)
                callback(tilePoint, canvasPoint)
            }
        }
    }

    #canvasPoint(point, focus) {
        const {origin} = this.frame.rect(focus)
        return point
            .minus(origin) // get tile at scene edge
            .multiplyScalar(this.zoom)  // make it a canvas position
            .minus(this.frame.offset)  // apply viewport offset
    }
}


class Frame {
    constructor(width, height, focus, zoom) {
        this.width = width
        this.height = height
        this.focus = focus
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
    }

    get offset() {
        const eastTileCount = Math.ceil(this.eastPad / this.zoom)
        const northTileCount = Math.ceil(this.northPad / this.zoom)
        const x = (eastTileCount * this.zoom) - this.eastPad
        const y = (northTileCount * this.zoom) - this.northPad
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
