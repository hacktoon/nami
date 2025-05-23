import { Point } from '/src/lib/geometry/point'
import { PointSet } from '/src/lib/geometry/point/set'
import { Random } from '/src/lib/random'


export class ZoneRiver {
    #points

    constructor(worldPoint, params) {
        const ctx = {...params, worldPoint}
        this.#points = this.#buildPoints(ctx)
    }

    #buildPoints(context) {
        // reads the wire data and create points for zone grid
        const {layers, worldPoint, zoneRect} = context
        const points = new PointSet(zoneRect)

        if (! layers.river.has(worldPoint)) {
            return points
        }
        const river = layers.river.get(worldPoint)
        const midpoint = layers.basin.getMidpoint(worldPoint)
        const joint = layers.topology.getJoint(worldPoint)
        const midSize = Math.floor(zoneRect.width / 2)
        let [mx, my] = midpoint
        for(let direction of river.flows) {
            const axis = direction.axis
            const worldSidePoint = Point.atDirection(worldPoint, direction)
            const sideJoint = layers.topology.getJoint(worldSidePoint)
            const signal = (joint < 0 || sideJoint < 0) ? -1 : 1
            const offset = Math.round((joint + sideJoint) / 2) * signal
            const offsetX = axis[0] === 0 ? offset : 0
            const offsetY = axis[1] === 0 ? offset : 0
            const targetX = midSize + (midSize * axis[0]) + offsetX
            const targetY = midSize + (midSize * axis[1]) + offsetY
            let [x, y] = [targetX, targetY]
            // if (Point.equals([40,31], worldPoint)) {
            //     console.log('40,31', direction.name, [x, y], joint, sideJoint);
            // }
            // if (Point.equals([40,30], worldPoint)) {
            //     console.log('40,30', direction.name, [x, y], joint, sideJoint);
            // }
            // target point is one of the grid sides
            while(Point.differs([x, y], midpoint)) {
                points.add([x, y])
                if (Random.chance(.5)) {
                    if (x > mx) x--
                    else if (x < mx) x++
                    // else y = y + (Random.chance(.5) ? 1 : -1 )
                } else {
                    if (y < my) y++
                    else if (y > my) y--
                    // else x = x + (Random.chance(.5) ? 1 : -1 )
                }
            }
        }
        points.add(midpoint)
        return points
    }

    has(point) {
        return this.#points.has(point)
    }
}
