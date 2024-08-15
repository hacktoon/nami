import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'
import { Direction } from '/src/lib/direction'


export class ZoneRiver {
    #points

    constructor(worldPoint, params) {
        // rect scaled to world size, for noise locality
        const ctx = {...params, worldPoint}
        // const points = new PointSet()
        this.#buildPoints(ctx)
    }

    #buildPoints(context) {
        // reads the wire data and create points for zone grid
        const {layers, worldPoint, zoneRect} = context
        const midSize = Math.floor(zoneRect.width / 2)
        const midpoint = layers.basin.getMidpoint(worldPoint)
        const directions = layers.basin.getWirePath(worldPoint)
        let x = midSize
        let y = midSize
        for(let direction of directions) {
            const [xa, ya] = direction.axis
            const xf = x + midSize * xa
            const yf = y + midSize * ya
            if (Point.equals(worldPoint, [38, 18])) {
                console.log('from ', xf, yf, " to ", midpoint);
            }
        }
    }

    has(point) {

    }
}
