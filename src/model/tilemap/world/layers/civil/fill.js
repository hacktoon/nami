import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Point } from '/src/lib/point'


const CHANCE = .1  // chance of fill growing
const GROWTH = 10  // make fill basins grow bigger than others


export function buildRealmGrid(rect, layers, capitalPoints) {
    const fill = new RealmFill()
    fill.start(capitalPoints.points, {rect, layers})
}


class RealmFill extends ConcurrentFill {
    getChance(fill) { return CHANCE }

    getGrowth(fill) {
        return GROWTH
    }

    onInitFill(fill, fillPoint, neighbors) {
        const {
            rect, layers, basinMap, typeMap, distanceMap, erosionMap
        } = fill.context
        const wrappedFillPoint = rect.wrap(fillPoint)
        // count neighbor water types

        distanceMap.set(wrappedFillPoint, 0)
    }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    canFill(fill, fillPoint, parentPoint) {
        const {rect, basinMap} = fill.context
        const wrappedPoint = rect.wrap(fillPoint)
        return ! basinMap.has(wrappedPoint)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {
            rect, basinMap, distanceMap, erosionMap
        } = fill.context
        const direction = getDirectionBetween(fillPoint, parentPoint)
        const wrappedPoint = rect.wrap(fillPoint)
        const wrappedParentPoint = rect.wrap(parentPoint)
        // distance to source by point
        const currentDistance = distanceMap.get(wrappedParentPoint)
        distanceMap.set(wrappedPoint, currentDistance + 1)
        // use basin value from parent point
        const parentBasin = basinMap.get(wrappedParentPoint)
        basinMap.set(wrappedPoint, parentBasin)
        // set erosion flow to parent
        erosionMap.set(wrappedPoint, direction.id)
    }
}
