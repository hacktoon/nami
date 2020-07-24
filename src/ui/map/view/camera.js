import { Point } from '/lib/point'


class Geometry {

}


export class Camera {
    constructor(image) {
        this.image = image
    }

    gridRect(width, height, focus) {
        const tileSize = this.image.tileSize
        const eastSide = Math.floor(width / 2 - tileSize / 2)
        const northSide = Math.floor(height / 2 - tileSize / 2)
        const westSide = width - eastSide - tileSize
        const southSide = height - northSide - tileSize

        const eastTileCount = tilesPerLength(eastSide, tileSize)
        const northTileCount = tilesPerLength(northSide, tileSize)
        const westTileCount = tilesPerLength(westSide, tileSize)
        const southTileCount = tilesPerLength(southSide, tileSize)

        const origin = focus.minus(new Point(eastTileCount, northTileCount))
        const target = focus.plus(new Point(westTileCount, southTileCount))
        const offset = new Point(
            (eastTileCount * tileSize) - eastSide,
            (northTileCount * tileSize) - northSide
        )
        return { origin, target, offset}
    }

    render(canvas, focus) {
        const {width, height} = canvas
        const tileSize = this.image.tileSize
        const {origin, target, offset} = this.gridRect(width, height, focus)

        for(let i = origin.x, x = 0; i <= target.x; i++, x += tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += tileSize) {
                const gridPoint = new Point(i, j)
                const color = this.image.get(gridPoint)
                const point = new Point(x, y).minus(offset)
                canvas.rect(this.image.tileSize, point, color)
            }
        }
    }

    renderBackground(canvas, focus) {
        const {width, height} = canvas
        const tileSize = this.image.tileSize
        const {origin, target, offset} = this.gridRect(width, height, focus)

        for(let i = origin.x, x = 0; i <= target.x; i++, x += tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += tileSize) {
                const gridPoint = new Point(i, j)
                if ((gridPoint.x + gridPoint.y) % 2) {
                    const point = new Point(x, y).minus(offset)
                    canvas.rect(this.image.tileSize, point, '#FFF')
                }
            }
        }
    }

    mouseTile(mousePoint, focus) {

        // console.log(mousePoint, focus);
    }

    // focusOffset(focus, pixelOffset) {
    //     const point = pixelOffset.apply(c => Math.floor(c / this.image.tileSize))
    //     console.log(point);
    //     // const newFocus = point.plus(focus)
    //     // return newFocus.differs(focus) ? newFocus : focus
    // }
}


function tilesPerLength(pixelSize, tileSize) {
    return Math.ceil(pixelSize / tileSize)
}