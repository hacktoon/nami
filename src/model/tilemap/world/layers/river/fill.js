import { Point } from '/src/lib/point'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'

import { HYDRO_NAMES } from '../../names'
import { RiverStretch } from './data'


// bitmask value => point in matrix 3x3
/*
       1(N)
 2(W)         8 (E)
       16(S)
*/
// detect matrix in source file
export const DIRECTION_PATTERN_MAP = new Map([
    [Direction.NORTH.id, 1],
    [Direction.WEST.id, 2],
    [Direction.EAST.id, 8],
    [Direction.SOUTH.id, 16],
])

const MAX_RIVER_SIZE = 2
const RIVER_MEANDER_MIDDLE = .5
const OFFSET_RANGE = [.1, .3]


/*
    The shape fill starts from river sources
    following the direction and marking how much strong a
    river gets.
*/
export function buildRiverMap(context) {
    let riverId = 0
    const basinLayer = context.layers.basin
    basinLayer.getDividePoints()
        // create a list of pairs = (point, basin distance to mouth)
        .map(point => [point, basinLayer.getDistance(point)])
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
        stretchMap, waterPoints, layoutMap, riverMeanders
    } = context
    let prevPoint = sourcePoint
    let currentPoint = sourcePoint
    // follow river down following next land points
    const maxDistance = layers.basin.getDistance(sourcePoint)
    const rainsOnSource = layers.rain.canCreateRiver(sourcePoint)
    if (maxDistance < MAX_RIVER_SIZE) return
    while (layers.surface.isLand(currentPoint)) {
        const wrappedPoint = rect.wrap(currentPoint)
        const meander = buildMeander(context, wrappedPoint)
        const directionBitmask = buildDirectionBitmask(context, wrappedPoint)
        const stretch = buildStretch(context, wrappedPoint, maxDistance)
        riverMeanders.set(wrappedPoint, meander)
        layoutMap.set(wrappedPoint, directionBitmask)
        stretchMap.set(wrappedPoint, stretch.id)
        // overwrite previous river id at point
        riverPoints.set(wrappedPoint, riverId)
        if (rainsOnSource) {
            waterPoints.add(wrappedPoint)
        }
        // get next river point
        currentPoint = getNextRiverPoint(context, wrappedPoint)
        // save previous point for mouth detection
        prevPoint = wrappedPoint
    }
    // current (last) point is water, add previous as river mouth
    riverMouths.add(prevPoint)
    riverNames.set(riverId, Random.choiceFrom(HYDRO_NAMES))
}


function buildMeander(context, wrappedPoint) {
    // direction axis ([-1, 0], [1, 1], etc)
    const axis = context.layers.basin.getErosionAxis(wrappedPoint)
    const rand = (axisDirection) => {
        const offset = Random.floatRange(...OFFSET_RANGE)
        const axisToggle = axisDirection === 0
                           ? Random.choice(-1, 1)
                           : axisDirection
        return RIVER_MEANDER_MIDDLE + (offset * axisToggle)
    }
    return [rand(axis[0]), rand(axis[1])]
}


function buildDirectionBitmask(context, point) {
    const {rect, layers, layoutMap} = context
    const wrappedPoint = rect.wrap(point)
    const basin = layers.basin.get(wrappedPoint)
    // set the tile according to which direction is flowing
    let flowCode = DIRECTION_PATTERN_MAP.get(basin.erosionOutput.id)
    // add flowCode for each neighbor that flows to this point
    Point.adjacents(point, (sidePoint, sideDirection) => {
        const wrappedSidePoint = rect.wrap(sidePoint)
        // ignore adjacent water tiles
        if (layers.surface.isWater(sidePoint)) { return }
        // neighbor basin flows here?
        if (! receivesFlow(context, sidePoint, point)) { return }
        // if it has a pattern, it's already a river point
        if (layoutMap.has(wrappedSidePoint)) {
            flowCode += DIRECTION_PATTERN_MAP.get(sideDirection.id)
        }
    })
    return flowCode
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
    return Point.atDirection(currentPoint, basin.erosionOutput)
}


function receivesFlow(context, sourcePoint, targetPoint) {
    // checks if sourcePoint erosion points to targetPoint
    const origin = context.rect.wrap(sourcePoint)
    const basin = context.layers.basin.get(origin)
    const pointAtDirection = Point.atDirection(sourcePoint, basin.erosionOutput)
    return Point.equals(targetPoint, pointAtDirection)
}
