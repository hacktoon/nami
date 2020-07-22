
export class Camera {
    constructor(image, focus) {
        this.focus = focus
        this.image = image
    }

    pixelFocus(width, height) {
        // get the pixel point in canvas
        const tileSize = this.image.tileSize
        const x = Math.floor(width / 2 - tileSize / 2)
        const y = Math.floor(height / 2 - tileSize / 2)
        return new Point(x, y)
    }

    gridRect(width, height) {
        const tileSize = this.image.tileSize
        const eastSide = Math.floor(width / 2 - tileSize / 2)
        const northSide = Math.floor(height / 2 - tileSize / 2)
        const westSide = width - eastSide - tileSize
        const southSide = height - northSide - tileSize

        const eastTileCount = tilesPerLength(eastSide, tileSize)
        const northTileCount = tilesPerLength(northSide, tileSize)
        const westTileCount = tilesPerLength(westSide, tileSize)
        const southTileCount = tilesPerLength(southSide, tileSize)

        const origin = this.focus.minus(new Point(eastTileCount, northTileCount))
        const target = this.focus.plus(new Point(westTileCount, southTileCount))
        const offset = new Point(
            (eastTileCount * tileSize) - eastSide,
            (northTileCount * tileSize) - northSide
        )

        return {origin, target, offset}
    }

    render({width, height}, callback) {
        const tileSize = this.image.tileSize
        const {origin, target, offset} = this.gridRect(width, height)

        for(let i = origin.x, x = 0; i <= target.x; i++, x += tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += tileSize) {
                const gridPoint = new Point(i, j)
                const color = this.image.get(gridPoint)
                const point = new Point(x, y).minus(offset)
                callback(gridPoint, point, color)
            }
        }
    }
}


function tilesPerLength(pixelSize, tileSize) {
    return Math.ceil(pixelSize / tileSize)
}