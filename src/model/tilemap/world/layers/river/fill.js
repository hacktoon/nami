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

const RIVER_MEANDER_MIDDLE = .5

/*
    The shape fill starts from river sources
    following the direction and marking how much strong a
    river gets.
*/
export function buildRiverMap(context) {
    let riverId = 0
    const basinLayer = context.layers.basin
    const entries = basinLayer.getDividePoints()
        // crate a list of pairs (point and distance)
        .map(point => [point, basinLayer.getDistance(point)])
        // accept only points where there's enough rain
        .filter(([point]) => context.layers.rain.createsRivers(point))
        // in ascendent order: lower heights first
        .sort((a, b) => a[1] - b[1])

    entries.forEach(([source]) => {
        buildRiver(context, riverId++, source)
    })
}

function buildRiver(context, riverId, sourcePoint) {
    // start from river source point. Follows the points
    // according to basin flow and builds a river.
    const {
        rect, layers, riverPoints, riverNames,
        riverMouths, stretchMap
    } = context
    let currentPoint = sourcePoint
    let prevPoint = sourcePoint
    // go down river following next (land) points
    const maxDistance = layers.basin.getDistance(sourcePoint)
    while (layers.surface.isLand(currentPoint)) {
        let wrappedPoint = rect.wrap(currentPoint)
        buildRiverMeander(context, wrappedPoint)
        const stretch = getStretch(context, wrappedPoint, maxDistance)
        stretchMap.set(wrappedPoint, stretch.id)
        // overwrite previous river id at point
        riverPoints.set(wrappedPoint, riverId)
        currentPoint = getNextRiverPoint(context, wrappedPoint)
        // save previous point for mouth detection
        prevPoint = wrappedPoint
    }
    // current (last) point is water, add previous as river mouth
    riverMouths.add(prevPoint)
    riverNames.set(riverId, Random.choiceFrom(HYDRO_NAMES))
}


function buildRiverMeander(context, wrappedPoint) {
    const {layers, layoutMap, riverMeanders} = context
    const basin = layers.basin.get(wrappedPoint)
    const directionBitmask = buildDirectionBitmask(context, wrappedPoint)
    layoutMap.set(wrappedPoint, directionBitmask)
    riverMeanders.set(wrappedPoint, buildMeanderPoint(basin))
}


function buildDirectionBitmask(context, point) {
    const {rect, layers, layoutMap} = context
    const wrappedPoint = rect.wrap(point)
    const basin = layers.basin.get(wrappedPoint)
    // set the tile according to which direction is flowing
    let flowCode = DIRECTION_PATTERN_MAP.get(basin.erosion.id)
    // add flowCode for each neighbor that flows to this point
    Point.adjacents(point, (sidePoint, sideDirection) => {
        // ignore water neighbors
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

function buildMeanderPoint(basin) {
    // choose a relative point around the middle of a square at [.5, .5]
    // use erosion direction to steer point
    const axis = basin.erosion.axis  // direction axis ([-1, 0], [1, 1], etc)
    const coord = axis => {
        const offset = Random.floatRange(.1, .3)
        const axisToggle = axis === 0 ? Random.choice(1, -1) : axis
        const newCoord = RIVER_MEANDER_MIDDLE + (offset * axisToggle)
        // no need of a higher precision, return one decimal float
        return newCoord.toFixed(1)
    }
    return [coord(axis[0]), coord(axis[1])]
}


function getStretch(context, point, maxDistance) {
    const distance = context.layers.basin.getDistance(point)
    let ratio = (distance / maxDistance).toFixed(1)
    if (ratio >= .8) return RiverStretch.HEADWATERS
    if (ratio >= .5) return RiverStretch.FAST_COURSE
    if (ratio >= .3) return RiverStretch.SLOW_COURSE
    return RiverStretch.DEPOSITIONAL
}


function getNextRiverPoint(context, currentPoint) {
    const basin = context.layers.basin.get(context.rect.wrap(currentPoint))
    return Point.atDirection(currentPoint, basin.erosion)
}


function receivesFlow(context, sourcePoint, targetPoint) {
    // checks if sourcePoint erosion points to targetPoint
    const origin = context.rect.wrap(sourcePoint)
    const basin = context.layers.basin.get(origin)
    const pointAtDirection = Point.atDirection(sourcePoint, basin.erosion)
    return Point.equals(targetPoint, pointAtDirection)
}
