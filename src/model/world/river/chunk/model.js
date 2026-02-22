import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointSet } from '/src/lib/geometry/point/set'
import { PointMap } from '/src/lib/geometry/point/map'
import { Point } from '/src/lib/geometry/point'
import { Random } from '/src/lib/random'
import { Direction } from '/src/lib/direction'
import { Grid } from '/src/lib/grid'


const MEANDER = 2

export const TYPE_RIVER = 1
export const TYPE_MARGIN = 2
export const TYPE_OTHER = 3


export function buildRiverGrid(context) {
    // reads the wire data and create points for chunk grid
    const {world, worldPoint, chunk, chunkRect} = context
    const pointMaskMap = buildPointMaskMap(context)
    // const river = world.river.get(worldPoint)
    // const basin = world.basin.get(worldPoint)
    return Grid.fromRect(chunkRect, chunkPoint => {
        if (pointMaskMap.has(chunkPoint)) {
            return TYPE_RIVER
        }
        return TYPE_OTHER
    })
}


function buildPointMaskMap(baseContext) {
    // reads the direction bitmask data and create points for chunk grid
    const {world, worldPoint, chunk, chunkRect} = baseContext
    const isLand = world.surface.isLand(worldPoint)
    const river = world.river.get(worldPoint)
    const pointMaskMap = new PointMap(chunkRect)
    if (isLand && ! river)
        return pointMaskMap
    const basin = world.basin.get(worldPoint)
    const midSize = Math.floor(chunk.size / 2)
    const source = basin.midpoint
    const directions = basin.directionBitmap
    for(let direction of directions) {
        const parentPoint = Point.atDirection(worldPoint, direction)
        if (! world.river.has(parentPoint) && ! world.surface.isBorder(worldPoint))
            continue
        const sideBasin = world.basin.get(parentPoint)
        const avgJoint = Math.floor((basin.joint + sideBasin.joint) / 2)
        const target = direction.axis.map(coord => {
            if (coord < 0) return 0
            if (coord > 0) return chunk.size - 1
            return avgJoint
        })
        const distance = Point.distance(source, target)
        const pointsTooClose = distance < midSize
        const distortion = pointsTooClose ? 0 : MEANDER
        midpointDisplacement(chunkRect, source, target, distortion, point => {
            pointMaskMap.set(point, TYPE_RIVER)
        })
    }
    return pointMaskMap
}

//  code for marking chunk corners
// for (let dir of cornerBitmap) {
//     const chunkPoint = dir.axis.map(coord => coord > 0 ? chunkSize-1 : 0)
//     fillMap.set(id++, {origin: chunkPoint, basinLevel: 1})
// }


function generateFlowPath(context, source, target, direction) {
    const {chunkRect, pointMaskMap} = context
    const deltaX = Math.abs(source[0] - target[0])
    const deltaY = Math.abs(source[1] - target[1])
    const fixedAxis = deltaX > deltaY ? 0 : 1  // 0 for x, 1 for y
    const displacedAxis = fixedAxis === 0 ? 1 : 0
    // distance between source and target to fill with path
    const size = Math.abs(target[fixedAxis] - source[fixedAxis])
    const points = [source]
    let current = source
    pointMaskMap.set(target, direction.id)
    const [tx, ty] = target
    while (Point.differs(current, target)) {
        let [x, y] = current
        const [cx, cy] = current
        if (Random.chance(.8))
            x = cx > tx ? cx - 1 : (cx < tx ? cx + 1 : cx)
        if (Random.chance(.8))
            y = cy > ty ? cy - 1 : (cy < ty ? cy + 1 : cy)
        // console.log(current);
        current = [x, y]
        pointMaskMap.set(current, direction.id)
    }
    return points
}



// class RiverFloodFill extends ConcurrentFill {
//     getGrowth(fill) { return 2 }
//     getChance(fill) { return .1 }

//     getNeighbors(fill, parentPoint) {
//         const {chunkRect} = fill.context
//         const points = Point.adjacents(parentPoint)
//         // avoid wrapping in chunk rect - flood fill from borders to center
//         return points.filter(p => chunkRect.isInside(p))
//     }

//     isEmpty(fill, fillPoint) {
//         return fill.context.levelGrid.get(fillPoint) === EMPTY
//     }

//     onFill(fill, fillPoint) {
//         const {levelGrid} = fill.context
//         let level = fill.level + fill.basinLevel
//         levelGrid.set(fillPoint, level)
//     }
// }
