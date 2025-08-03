import { PointSet } from '/src/lib/geometry/point/set'
import { midpointDisplacement } from '/src/lib/fractal/midpointdisplacement'
import { clamp } from '/src/lib/function'


const MEANDER = 2


export function buildRiverGrid(context) {
    // reads the wire data and create points for zone grid
    const {world, worldPoint, zoneRect} = context
    const points = new PointSet(zoneRect)

    if (! world.river.has(worldPoint)) {
        return points
    }
    const river = world.river.get(worldPoint)
    const source = river.midpoint
    const midSize = Math.floor(zoneRect.width / 2)
    for(let direction of river.flows) {
        const target = [
            midSize + (midSize * direction.axis[0]),
            midSize + (midSize * direction.axis[1])
        ]
        midpointDisplacement(source, target, MEANDER, ([x, y]) => {
            points.add([
                clamp(x, 0, zoneRect.width - 1),
                clamp(y, 0, zoneRect.height - 1),
            ])
        })
    }
    return points
}

