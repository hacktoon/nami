import { Point } from '/src/lib/geometry/point'
import { PointSet } from '/src/lib/geometry/point/set'
import { Random } from '/src/lib/random'

import { ConcurrentFill } from '/src/lib/floodfill/concurrent'


const EMPTY = null

const FILL_GROWTH = [2, 1]
const FILL_CHANCE = .1



export function buildRiverGrid(context) {
    // reads the wire data and create points for zone grid
    const {world, worldPoint, zoneRect} = context
    const points = new PointSet(zoneRect)

    if (! world.river.has(worldPoint)) {
        return points
    }
    const river = world.river.get(worldPoint)
    const midSize = Math.floor(zoneRect.width / 2)
    const midpoint = world.river.get(worldPoint).midpoint
    const [mx, my] = midpoint
    for(let direction of river.flows) {
        const axis = direction.axis
        const targetX = midSize + (midSize * axis[0])
        const targetY = midSize + (midSize * axis[1])
        let [x, y] = [targetX, targetY]
        // target point is one of the grid sides
        while(Point.differs([x, y], midpoint)) {
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


class RiverFloodFill extends ConcurrentFill {
    getGrowth() { return Random.choiceFrom(FILL_GROWTH) }
    getChance() { return FILL_CHANCE }

    getNeighbors(fill, parentPoint) {
        const rect = fill.context.zoneRect
        const points = Point.adjacents(parentPoint)
        // avoid wrapping in zone rect - flood fill from borders to center
        return points.filter(p => rect.isInside(p))
    }

    isEmpty(fill, fillPoint) {
        return fill.context.regionGrid.get(fillPoint) === EMPTY
    }

    onFill(fill, fillPoint) {
        fill.context.regionGrid.set(fillPoint, fill.id)
    }
}