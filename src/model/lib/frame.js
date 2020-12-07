import { Point } from '/lib/point'


export class Frame {
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
