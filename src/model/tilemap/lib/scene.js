import { Point } from '/src/lib/point'
import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'


const ZOOM_INCREMENT = 5


export class TileMapScene {
    static schema = new Schema(
        'TileMapScene',
        Type.point('focus', "Focus", {default: '50,51'}),
        Type.boolean('wrap', "Wrap", {default: false}),
        Type.number('zoom', "Zoom", {
            default: 10,
            min: 5,
            max: 500,
            step: ZOOM_INCREMENT,
        }),
    )

    static create(diagram, viewport, params) {
        return new TileMapScene(diagram, viewport, params)
    }

    constructor(diagram, viewport, params) {
        const [focus, wrap, zoom] = params.get('focus', 'wrap', 'zoom')
        this.frame = new Frame(viewport, zoom)
        this.diagram = diagram
        this.textQueue = []
        this.focus = focus
        this.wrap = wrap
        this.zoom = zoom
        this.zoomIncrement = ZOOM_INCREMENT
        this.viewport = viewport  // TODO: needed only in UITileMapMouse, delete

        // TODO: send params to render method, avoid buildind an
        // instance on every UI action
    }

    render(canvas) {
        const {origin, target} = this.frame.tileWindow(this.focus)
        for(let i = origin[0], x = 0; i <= target[0]; i++, x += this.zoom) {
            for(let j = origin[1], y = 0; j <= target[1]; j++, y += this.zoom) {
                const canvasPoint = Point.minus([x, y], this.frame.offset)
                const tilePoint = [i, j]
                if (this.isWrappable(tilePoint)) {
                    const context = {
                        canvas, tilePoint, canvasPoint, tileSize: this.zoom,
                    }
                    this.diagram.draw(context)
                } else {
                    canvas.clear(this.zoom, canvasPoint)
                }
            }
        }
    }

    isWrappable(point) {
        if (this.wrap) return true
        return this.diagram.rect.isInside(point)
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
    constructor(viewport, zoom) {
        const westPad = Math.floor(viewport.width / 2 - zoom / 2)
        const northPad = Math.floor(viewport.height / 2 - zoom / 2)
        const xTileCount = Math.ceil(westPad / zoom)
        const yTileCount = Math.ceil(northPad / zoom)
        this.center = [xTileCount, yTileCount]
        this.offset = [
            (xTileCount * zoom) - westPad,
            (yTileCount * zoom) - northPad
        ]
        this.width = viewport.width
        this.height = viewport.height
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
