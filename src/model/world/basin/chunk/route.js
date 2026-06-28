import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/math/point'
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
    for (let gateDirection of basin.directionBitmap) {
        const parentPoint = Point.atDirection(worldPoint, gateDirection)
        const sideBasin = world.basin.get(parentPoint)
        // get the point on chunk side
        const avgJoint = Math.floor((basin.joint + sideBasin.joint) / 2)
        // create point at chunk edge where it connects to neighbor chunk
        const gatePoint = gateDirection.axis.map(coord => {
            if (coord < 0) return 0  // -1 means NORTH or EAST
            if (coord > 0) return chunk.size - 1  // +1 means SOUTH or WEST
            return avgJoint  //  0 means any value at chunk side
        })
        // current gate is same as the basin flow, so route is from midpoint to gate
        const isOutflow = basin.erosion.id == gateDirection.id
        let source = isOutflow ? midPoint : gatePoint
        let target = isOutflow ? gatePoint : midPoint
        gates.push({source, target, isOutflow})
    }
    return gates
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


export function buildErosionMask(gates, context) {
    // reads the direction bitmask data and create points for chunk grid
    const { chunk, chunkRect, worldPoint } = context
    const points = new PointSet(chunkRect)
    for (let {source, target} of gates) {
        midpointDisplacement(chunkRect, source, target, MEANDER, point => {
            points.add(point)
        })
    }
    return points
}