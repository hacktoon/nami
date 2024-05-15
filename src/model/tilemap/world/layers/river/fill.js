import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { HYDRO_NAMES } from '/src/lib/names'

import { RiverStretch } from './data'


/*
    The shape fill starts from river sources
    following the direction and marking how much strong a
    river gets.
*/
export function buildRiverMap(context) {
    let riverId = 0
    const layers = context.layers
    layers.basin.getDividePoints()
        .filter(point => canBuildRiver(layers, point))
        // create a list of pairs: (point, river distance to mouth)
        .map(point => [point, layers.basin.getDistance(point)])
        // in ascendent order to get longest rivers first
        // for starting rivers on basin divides
        .sort((a, b) => a[1] - b[1])
        .forEach(([point, ]) => {
            buildRiver(context, riverId++, point)
        })
}


function canBuildRiver(layers, point) {
    const isBorder = layers.surface.isBorder(point)
    return isBorder || layers.rain.canCreateRiver(point)
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
    const riverLength = layers.basin.getDistance(sourcePoint)
    while (layers.surface.isLand(currentPoint)) {
        // max size by basin if basin.
        const point = rect.wrap(currentPoint)
        // set river stretch by distance
        const currentDistance = layers.basin.getDistance(point)
        const stretch = buildStretch(currentDistance, riverLength)
        stretchMap.set(point, stretch.id)
        // overwrite previous river id at point
        riverPoints.set(point, riverId)
        // set river directions grid
        buildRiverPaths(context, currentPoint)
        // get next river point
        const erosion = layers.basin.getErosion(point)
        currentPoint = Point.atDirection(point, erosion)
        // save previous point for mouth detection
        prevPoint = point
    }
    // current (last) point is water, add previous as river mouth
    riverMouths.add(prevPoint)
    riverNames.set(riverId, Random.choiceFrom(HYDRO_NAMES))
}


function buildRiverPaths(context, point) {
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


function buildStretch(distance, maxDistance) {
    if (maxDistance < 2) return RiverStretch.FAST_COURSE
    let ratio = (distance / maxDistance).toFixed(1)
    if (ratio >= .8) return RiverStretch.HEADWATERS
    if (ratio >= .5) return RiverStretch.FAST_COURSE
    if (ratio >= .3) return RiverStretch.SLOW_COURSE
    return RiverStretch.DEPOSITIONAL
}
