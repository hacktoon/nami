import { Point } from '/lib/point'


export class Camera {
    constructor(diagram, width, height) {
        const tileSize = diagram.tileSize
        this.diagram = diagram
        this.width = width
        this.height = height
        this.eastSide = Math.floor(width / 2 - tileSize / 2)
        this.northSide = Math.floor(height / 2 - tileSize / 2)
        this.westSide = width - this.eastSide - tileSize
        this.southSide = height - this.northSide - tileSize
    }

    render(canvas, focusPoint, cursorPoint) {
        const tileSize = this.diagram.tileSize
        const {origin, target, offset} = this.geometry(focusPoint)

        for(let i = origin.x, x = 0; i <= target.x; i++, x += tileSize) {
            for(let j = origin.y, y = 0; j <= target.y; j++, y += tileSize) {
                const gridPoint = new Point(i, j)
                const color = this.diagram.get(gridPoint)
                const point = new Point(x, y).minus(offset)
                canvas.rect(this.diagram.tileSize, point, color)
                if (cursorPoint.equals(gridPoint)) {
                    canvas.rectBorder(this.diagram.tileSize, point)
                }
            }
        }
    }

    renderBackground(canvas, focusPoint) {
        const tileSize = this.diagram.tileSize
        const {origin, target, offset} = this.geometry(focusPoint)

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

    geometry(focusPoint) {
        const tileSize = this.diagram.tileSize
        const eastTileCount = Math.ceil(this.eastSide / tileSize)
        const northTileCount = Math.ceil(this.northSide / tileSize)
        const westTileCount = Math.ceil(this.westSide / tileSize)
        const southTileCount = Math.ceil(this.southSide / tileSize)
        const topLeftPoint = new Point(eastTileCount, northTileCount)
        const bottomRightPoint = new Point(westTileCount, southTileCount)
        const origin = focusPoint.minus(topLeftPoint)
        const target = focusPoint.plus(bottomRightPoint)
        const offsetX = (eastTileCount * tileSize) - this.eastSide
        const offsetY = (northTileCount * tileSize) - this.northSide
        const offset = new Point(offsetX, offsetY)
        return {origin, target, offset}
    }

    tilePoint(focusPoint, mousePoint) {
        const {origin, offset} = this.geometry(focusPoint)
        const tileSize = this.diagram.tileSize
        const mouse = mousePoint.plus(offset)
        const point = new Point(
            Math.floor(mouse.x / tileSize),
            Math.floor(mouse.y / tileSize)
        )
        return point.plus(origin)
    }

    dragPoint(focusPoint, dragOffset) {
        const {offset} = this.geometry(focusPoint)
        const tileSize = this.diagram.tileSize
        const dragged = offset.plus(dragOffset)
        const point = new Point(
            Math.floor(dragged.x / tileSize),
            Math.floor(dragged.y / tileSize)
        )
        return focusPoint.plus(point)
    }
}
