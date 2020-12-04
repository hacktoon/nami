import { Point } from '/lib/point'


export class Frame {
    constructor(tileSize, width, height) {
        this.width = width
        this.height = height
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
