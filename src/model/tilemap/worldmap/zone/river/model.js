import { PointSet } from '/src/lib/geometry/point/set'
import { Point } from '/src/lib/geometry/point'
import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { clamp } from '/src/lib/function'


const MEANDER = 3


export function buildRiverGrid(context) {
    // reads the wire data and create points for zone grid
    const {world, worldPoint, zoneRect} = context
    const points = new PointSet(zoneRect)

    if (! world.river.has(worldPoint)) {
        return points
    }
    const river = world.river.get(worldPoint)
    const source = river.midpoint
    const basin = world.basin.get(worldPoint)
    const midSize = Math.floor(zoneRect.width / 2)
    for(let direction of basin.directionBitmap) {
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
                clamp(x, 0, zoneRect.width - 1),
                clamp(y, 0, zoneRect.height - 1),
            ])
        })
    }
    return points
}

