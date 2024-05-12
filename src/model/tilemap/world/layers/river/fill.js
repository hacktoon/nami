import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { HYDRO_NAMES } from '/src/lib/names'

import { RiverStretch } from './data'


const MAX_RIVER_SIZE = 2

/*
    The shape fill starts from river sources
    following the direction and marking how much strong a
    river gets.
*/
export function buildRiverMap(context) {
    let riverId = 0
    const layers = context.layers
    layers.basin.getDividePoints()
        .filter(point => (
            layers.rain.canCreateRiver(point)
        ))
        // create a list of pairs: (point, river distance to mouth)
        .map(point => [point, layers.basin.getDistance(point)])
        // in ascendent order to get longest rivers first
        // for starting rivers on basin divides
        .sort((a, b) => a[1] - b[1])
        .forEach(([point, ]) => {
            buildRiver(context, riverId++, point)
        })
}


function buildRiver(context, riverId, sourcePoint) {
    // start from river source point. Follows the points
    // according to basin flow and builds a river.
    const {
        rect, layers, riverPoints, riverNames, riverMouths,
        stretchMap
    } = context
    let prevPoint = sourcePoint
    let currentPoint = sourcePoint
    // follow river down following next land points
    const maxDistance = layers.basin.getDistance(sourcePoint)
    if (maxDistance < MAX_RIVER_SIZE) return
    while (layers.surface.isLand(currentPoint)) {
        const wrappedPoint = rect.wrap(currentPoint)
        // set direction mask grid
        buildDirectionMask(context, currentPoint)
        // set river stretch by distance
        const stretch = buildStretch(context, wrappedPoint, maxDistance)
        stretchMap.set(wrappedPoint, stretch.id)
        // overwrite previous river id at point
        riverPoints.set(wrappedPoint, riverId)
        // get next river point
        currentPoint = getNextRiverPoint(context, wrappedPoint)
        // save previous point for mouth detection
        prevPoint = wrappedPoint
    }
    // current (last) point is water, add previous as river mouth
    riverMouths.add(prevPoint)
    riverNames.set(riverId, Random.choiceFrom(HYDRO_NAMES))
}


function buildDirectionMask(context, point) {
    const {rect, layers, directionMaskGrid} = context
    const wrappedPoint = rect.wrap(point)
    const basin = layers.basin.get(wrappedPoint)
    // set the tile according to which direction is flowing
    directionMaskGrid.add(point, basin.erosion)
    // add flowCode for each neighbor that flows to this point
    Point.adjacents(point, (sidePoint, sideDirection) => {
        const wrappedSidePoint = rect.wrap(sidePoint)
        // ignore adjacent water tiles
        if (layers.surface.isWater(sidePoint)) return
        // neighbor basin flows here?
        const basin = context.layers.basin.get(wrappedSidePoint)
        // does side point points to this current point?
        const flowTargetPoint = Point.atDirection(sidePoint, basin.erosion)
        if (Point.equals(point, flowTargetPoint)) {
            directionMaskGrid.add(point, sideDirection)
        }
    })
}


function buildStretch(context, point, maxDistance) {
    const distance = context.layers.basin.getDistance(point)
    let ratio = (distance / maxDistance).toFixed(1)
    if (ratio >= .8) return RiverStretch.HEADWATERS
    if (ratio >= .5) return RiverStretch.FAST_COURSE
    if (ratio >= .3) return RiverStretch.SLOW_COURSE
    return RiverStretch.DEPOSITIONAL
}


function getNextRiverPoint(context, currentPoint) {
    const basin = context.layers.basin.get(currentPoint)
    return Point.atDirection(currentPoint, basin.erosion)
}
