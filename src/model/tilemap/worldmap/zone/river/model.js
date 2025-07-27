import { Point } from '/src/lib/geometry/point'
import { PointSet } from '/src/lib/geometry/point/set'
import { Random } from '/src/lib/random'


export function buildRiverPoints(context) {
    // reads the wire data and create points for zone grid
    const {world, worldPoint, zoneRect} = context
    const points = new PointSet(zoneRect)

    if (! world.river.has(worldPoint)) {
        return points
    }
    const river = world.river.get(worldPoint)
    const midSize = Math.floor(zoneRect.width / 2)
    const midpoint = buildMidpoint(zoneRect)
    let [mx, my] = midpoint
    for(let direction of river.flows) {
        const axis = direction.axis
        const targetX = midSize + (midSize * axis[0])
        const targetY = midSize + (midSize * axis[1])
        let [x, y] = [targetX, targetY]
        // target point is one of the grid sides
        while(Point.differs([x, y], midpoint)) {
            // let chance = Random.float()
            points.add([x, y])
            if (Random.chance(.5)) {
                if (x > mx) x--
                else if (x < mx) x++
            } else {
                if (y < my) y++
                else if (y > my) y--
            }
        }
    }
    points.add(midpoint)
    return points
}


function buildMidpoint(zoneRect) {
    const diff = Math.floor(zoneRect.width / 8)
    const x = Random.int(diff, zoneRect.width - diff)  // avoid edges
    const y = Random.int(diff, zoneRect.height - diff)
    return [x, y]
}