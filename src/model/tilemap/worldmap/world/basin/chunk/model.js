import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { PointSet } from '/src/lib/geometry/point/set'
import { Point } from '/src/lib/geometry/point'
import { clamp } from '/src/lib/function'


const MEANDER = 3


export function buildBasinGrid(context) {
    // reads the wire data and create points for chunk grid
    const {world, worldPoint, chunk, chunkRect} = context
    const points = new PointSet(chunkRect)
    const basin = world.basin.get(worldPoint)
    const source = basin.midpoint
    const midSize = Math.floor(chunk.size / 2)
    for(let direction of basin.directionBitmap) {
        const parentPoint = Point.atDirection(worldPoint, direction)
        const sideBasin = world.basin.get(parentPoint)
        const avgJoint = Math.floor((basin.joint + sideBasin.joint) / 2)
        const target = direction.axis.map(coord => {
            if (coord < 0) return 0
            if (coord > 0) return chunk.size - 1
            return avgJoint
        })
        const distance = Math.floor(Point.distance(source, target))
        const pointsTooClose = distance < midSize
        const distortion = pointsTooClose ? 1 : MEANDER
        midpointDisplacement(source, target, distortion, point => {
            const [x, y] = point
            points.add([
                clamp(x, 0, chunk.size - 1),
                clamp(y, 0, chunk.size - 1),
            ])
        })
    }
    return points
}