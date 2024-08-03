import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Direction } from '/src/lib/direction'
import { Point } from '/src/lib/point'


const EMPTY = null


export class RegionFloodFill extends ConcurrentFill {
    getChance(fill) { return 0.2 }
    getGrowth(fill) { return 3 }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - carve from borders to inside
        return points.filter(p => rect.isInside(p))
    }

    canFill(fill, point, center) {
        return fill.context.regionGrid.get(point) === EMPTY
    }

    onFill(fill, point, center) {
        const  {zoneRect, regionGrid, regionSidesMap} = fill.context
        const directions = regionSidesMap.get(fill.id) ?? new Set()
        if (zoneRect.isEdge(point)) {
            const direction = getEdgeDirection(zoneRect, point)
            directions.add(direction.id)
        }
        regionSidesMap.set(fill.id, directions)
        regionGrid.set(point, fill.id)
    }
}


function getEdgeDirection(rect, point) {
    const [x, y] = point
    const {width, height} = rect
    // Normalize coordinates to [-1, 1] range for matching Direction
    const normalizedX = x / (width - 1) * 2 - 1
    const normalizedY = y / (height - 1) * 2 - 1

    // Calculate the angle of the point from the center of the square
    const angle = Math.atan2(normalizedY, normalizedX)

    // Convert angle to direction vector using sine and cosine
    const directionX = Math.cos(angle)
    const directionY = Math.sin(angle)

    // Round direction vector to nearest integer
    const axis = [Math.round(directionX), Math.round(directionY)]
    return Direction.fromAxis(axis)
  }
