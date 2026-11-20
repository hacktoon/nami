import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/math/point'
import { Direction } from '/src/lib/math/direction'
import { PointSet } from '/src/lib/math/point/set'


const MIDDLE_OFFSET = 1  // used to avoid midpoints on middle
const MIDPOINT_RATE = .4  // random point in 40% of chunkrect area around center point
const MEANDER = 5


export function buildErosionGatePoints(baseContext) {
    // Each chunk has gates on its sides. A gate connects two chunks
    // and is the same for both by averaging its joints
    const { world, worldPoint, chunk, chunkRect } = baseContext
    const basin = world.basin.get(worldPoint)
    const midPoint = buildChunkMidpoint(chunkRect)
    const gates = []
    for (let direction of basin.directions) {
        const parentPoint = Point.atDirection(worldPoint, direction)
        const sideBasin = world.basin.get(parentPoint)
        // get the point on chunk side
        const avgJoint = Math.floor((basin.joint + sideBasin.joint) / 2)
        // create point at chunk edge where it connects to neighbor chunk
        const gatePoint = direction.axis.map(coord => {
            if (coord < 0) return 0  // -1 means NORTH or EAST
            if (coord > 0) return chunk.size - 1  // +1 means SOUTH or WEST
            return avgJoint  //  0 means any value at chunk side
        })
        // current gate is same as the basin flow, so route is from midpoint to gate
        const isOutflow = basin.erosion.id == direction.id
        let source = isOutflow ? midPoint : gatePoint
        let target = isOutflow ? gatePoint : midPoint
        gates.push({source, target, direction, isOutflow})
    }
    return gates
}


export function _buildErosionPoints(gates, context) {
    // reads the direction bitmask data and create points for chunk grid
    const { chunkRect } = context
    const points = new PointSet(chunkRect)
    for (let {source, target} of gates) {
        midpointDisplacement(chunkRect, source, target, MEANDER, point => {
            points.add(point)
        })
    }
    return points
}


export function buildErosionPoints(gates, context) {
    // reads the direction bitmask data and create points for chunk grid
    const { chunkRect } = context
    const points = new PointSet(chunkRect)
    for (let gate of gates) {
        buildPoints(points, gate, context)
    }
    return points
}

//  TODO:
function buildPoints(erosionPoints, gate, context) {
    // reads the direction bitmask data and create points for chunk grid
    const { chunk, chunkRect, worldPoint } = context
    const { source, target, direction, isOutflow } = gate
    let currentPoint = source
    let prevPoint = source
    let maxIter = 1000  // avoid infinite loops
    if (worldPoint[0] != 37 && worldPoint[1] != 37) {
        return
    }
    while (true || maxIter > 0) {
        prevPoint = currentPoint
        currentPoint = getNextPoint(currentPoint, target, erosionPoints)
        --maxIter
        // console.log(maxIter, direction.name, prevPoint, ' => ', currentPoint, ' => ', target)
        try {
            if (Point.equals(currentPoint, target)) {
                break
            }
        } catch (error) {
            console.log('ERROR', direction.name, currentPoint, target)
            return
        }
    }
}


function getNextPoint(source, target, erosionPoints) {
    const [sx, sy] = source
    const [tx, ty] = target
    const candidates = []
    const add = (direction) => {
        const candidate = Point.atDirection(source, direction)
        // console.log(candidate, source);
        // console.log('candidate:', candidate, erosionPoints.has(candidate))

        if (1) {
            candidates.push(candidate)
        }
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




function buildChunkMidpoint(chunkRect) {
    const centerIndex = Math.floor(chunkRect.width / 2)
    // select random point in 60% of chunkrect area around center point
    const offset = Math.floor(centerIndex * MIDPOINT_RATE)
    const randX = Random.int(-offset, offset)
    const randY = Random.int(-offset, offset)
    // random offset distance from center
    const midRandX = Random.choice(-MIDDLE_OFFSET, MIDDLE_OFFSET)
    const midRandY = Random.choice(-MIDDLE_OFFSET, MIDDLE_OFFSET)
    // add some variation to center index
    const x = centerIndex + (randX != 0 ? randX : midRandX)
    const y = centerIndex + (randY != 0 ? randY : midRandY)
    return [x, y]
}


