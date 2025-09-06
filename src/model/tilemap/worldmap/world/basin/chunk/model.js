import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointSet } from '/src/lib/geometry/point/set'
import { Point } from '/src/lib/geometry/point'
import { clamp } from '/src/lib/function'


const MEANDER = 3


export function buildErosionGrid(context) {
    // reads the wire data and create points for chunk grid
    const {world, worldPoint, chunkRect, chunkSize} = context
    const points = new PointSet(chunkRect)
    if (! (world.river.has(worldPoint) || world.surface.isWater(worldPoint))) {
        return points
    }
    const basin = world.basin.get(worldPoint)
    const joint = basin.joint
    const source = basin.midpoint
    const midSize = Math.floor(chunkSize / 2)
    for(let direction of basin.directionBitmap) {
        const parentPoint = Point.atDirection(worldPoint, direction)
        const isParentLand = world.surface.isLand(parentPoint)
        if (isParentLand && ! world.river.has(parentPoint))
            continue
        const target = [
            midSize + (midSize * direction.axis[0]),
            midSize + (midSize * direction.axis[1])
        ]
        const distance = Math.floor(Point.distance(source, target))
        const pointsTooClose = distance < midSize
        const distortion = pointsTooClose ? 1 : MEANDER
        midpointDisplacement(source, target, distortion, point => {
            const [x, y] = point
            points.add([
                clamp(x, 0, chunkSize - 1),
                clamp(y, 0, chunkSize - 1),
            ])
        })
    }
    return points
}


// class RiverFloodFill extends ConcurrentFill {
//     getGrowth() { return 1 }
//     getChance() { return .5 }

//     getNeighbors(fill, parentPoint) {
//         const rect = fill.context.chunkRect
//         const points = Point.adjacents(parentPoint)
//         // avoid wrapping in chunk rect - flood fill from borders to center
//         return points.filter(p => rect.isInside(p))
//     }

//     isEmpty(fill, fillPoint) {
//         return fill.context.watermaskGrid.get(fillPoint) === EMPTY
//     }

//     onFill(fill, fillPoint) {
//         fill.context.watermaskGrid.set(fillPoint, fill.id)
//     }
// }