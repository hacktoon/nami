import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
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
        // console.log(worldPoint, " - ", context);

        if (! layers.river.has(worldPoint)) {
            return points
        }
        const river = layers.river.get(worldPoint)
        const midpoint = layers.basin.getMidpoint(worldPoint)
        const midSize = Math.floor(zoneRect.width / 2)
        let [mx, my] = midpoint
        for(let axis of river.erosionAxis) {
            const tx = midSize + (midSize * axis[0])
            const ty = midSize + (midSize * axis[1])
            let [x, y] = [tx, ty]
            while(Point.differs([x, y], midpoint)) {
                points.add([x, y])
                if (Random.chance(.5)) {
                    if (x > mx) {
                        x--
                    } else if (x < mx) {
                        x++
                    }
                } else {
                    if (y < my) {
                        y++
                    } else if (y > my) {
                        y--
                    }
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
