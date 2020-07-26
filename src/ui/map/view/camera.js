import { Point } from '/lib/point'


class Geometry {

}


export class Camera {
    constructor(diagram, width, height) {
        this.diagram = diagram
        this.width = width
        this.height = height

        const tileSize = this.diagram.tileSize
        this.eastSide = Math.floor(width / 2 - tileSize / 2)
        this.northSide = Math.floor(height / 2 - tileSize / 2)
        this.westSide = width - this.eastSide - tileSize
        this.southSide = height - this.northSide - tileSize
    }

    gridRect(focus) {
        const tileSize = this.diagram.tileSize
        const eastTileCount = Math.ceil(this.eastSide / tileSize)
        const northTileCount = Math.ceil(this.northSide / tileSize)
        const westTileCount = Math.ceil(this.westSide / tileSize)
        const southTileCount = Math.ceil(this.southSide / tileSize)

        const origin = focus.minus(new Point(eastTileCount, northTileCount))
        const target = focus.plus(new Point(westTileCount, southTileCount))
        const offset = new Point(
            (eastTileCount * tileSize) - this.eastSide,
            (northTileCount * tileSize) - this.northSide
        )
        return {origin, target, offset}
    }

    render(canvas, focus) {
        const tileSize = this.diagram.tileSize
        const {origin, target, offset} = this.gridRect(focus)

        for(let i = origin.x, x = 0; i <= target.x; i++, x += tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += tileSize) {
                const gridPoint = new Point(i, j)
                const color = this.diagram.get(gridPoint)
                const point = new Point(x, y).minus(offset)
                canvas.rect(this.diagram.tileSize, point, color)
            }
        }
    }

    renderBackground(canvas, focus) {
        const tileSize = this.diagram.tileSize
        const {origin, target, offset} = this.gridRect(focus)

        for(let i = origin.x, x = 0; i <= target.x; i++, x += tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += tileSize) {
                const gridPoint = new Point(i, j)
                if ((gridPoint.x + gridPoint.y) % 2) {
                    const point = new Point(x, y).minus(offset)
                    canvas.rect(this.diagram.tileSize, point, '#FFF')
                }
            }
        }
    }

    mouseTile(pixelDrag, mousePoint) {
        console.log(pixelDrag, mousePoint);
    }
}
