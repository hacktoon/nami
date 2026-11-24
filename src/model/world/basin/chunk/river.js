import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { PointSet } from '/src/lib/math/point/set'
import { PointMap } from '/src/lib/math/point/map'
import { Point } from '/src/lib/math/point'
import { Random } from '/src/lib/random'
import { Direction } from '/src/lib/math/direction'
import { Grid } from '/src/lib/grid'


export const TYPE_RIVER = 1
export const TYPE_RIVER_SIDE = 2
export const TYPE_OTHER = 3


export function buildRiverGrid(context) {
    // reads the wire data and create points for chunk grid
    const {world, worldPoint, chunk, chunkRect} = context
    const pointMaskMap = buildPointMaskMap(context)
    return Grid.fromRect(chunkRect, chunkPoint => {
        if (pointMaskMap.has(chunkPoint)) {
            return TYPE_RIVER
        }
        return TYPE_OTHER
    })
}



export function buildRiverPoints(gates, context) {
    // reads the direction bitmask data and create points for chunk grid
    const { world, chunkRect, worldPoint } = context
    const gateMap = new Map(gates.map(gate => [gate.direction.id, gate]))
    const points = new PointSet(chunkRect)
    for (let river of world.basin.getRivers(worldPoint)) {
        const gate = gateMap.get(river.direction.id)
        buildPoints(points, gate, context)
    }
    // if (worldPoint[0] == 37 && worldPoint[1] == 37) {

    // }
    return points
}


function buildPoints(erosionPoints, gate, baseContext) {
    // reads the direction bitmask data and create points for chunk grid
    const { source, target, direction, isOutflow } = gate
    let currentPoint = source
    let prevPoint = source
    const context = {...baseContext, erosionPoints}
    let maxIter = 1000  // avoid infinite loops
    while (true || maxIter > 0) {
        prevPoint = currentPoint
        erosionPoints.add(currentPoint)
        currentPoint = getNextPoint(currentPoint, target, context)
        --maxIter
        // console.log(maxIter, direction.name, prevPoint, ' => ', currentPoint, ' => ', target)
        try {
            if (Point.equals(currentPoint, target)) {
                erosionPoints.add(currentPoint)
                break
            }
        } catch (error) {
            console.log('ERROR', direction.name, currentPoint, target)
            return
        }
    }
}


function getNextPoint(source, target, context) {
    const { chunk, chunkRect, worldPoint } = context
    const { erosionPoints } = context
    const [sx, sy] = source
    const [tx, ty] = target
    const candidates = []
    const add = (direction) => {
        const candidate = Point.atDirection(source, direction)
        const isEdge = chunkRect.isEdge(candidate)
        const isCorner = chunkRect.isCorner(candidate)
        const isTarget = Point.equals(candidate, target)
        if (isTarget || ! isEdge )
            candidates.push(candidate)
    }
    if (sx < tx) add(Direction.EAST)
    if (sx > tx) add(Direction.WEST)
    if (sy < ty) add(Direction.SOUTH)
    if (sy > ty) add(Direction.NORTH)
    if (sx < tx && sy < ty) add(Direction.SOUTHEAST)
    if (sx > tx && sy < ty) add(Direction.SOUTHWEST)
    if (sx < tx && sy > ty) add(Direction.NORTHEAST)
    if (sx > tx && sy > ty) add(Direction.NORTHWEST)
    return Random.choiceFrom(candidates)
}






// function generateFlowPath(context, source, target, direction) {
//     const {chunkRect, pointMaskMap} = context
//     const deltaX = Math.abs(source[0] - target[0])
//     const deltaY = Math.abs(source[1] - target[1])
//     const fixedAxis = deltaX > deltaY ? 0 : 1  // 0 for x, 1 for y
//     const displacedAxis = fixedAxis === 0 ? 1 : 0
//     // distance between source and target to fill with path
//     const size = Math.abs(target[fixedAxis] - source[fixedAxis])
//     const points = [source]
//     let current = source
//     pointMaskMap.set(target, direction.id)
//     const [tx, ty] = target
//     while (Point.differs(current, target)) {
//         let [x, y] = current
//         const [cx, cy] = current
//         if (Random.chance(.8))
//             x = cx > tx ? cx - 1 : (cx < tx ? cx + 1 : cx)
//         if (Random.chance(.8))
//             y = cy > ty ? cy - 1 : (cy < ty ? cy + 1 : cy)
//         // console.log(current);
//         current = [x, y]
//         pointMaskMap.set(current, direction.id)
//     }
//     return points
// }

