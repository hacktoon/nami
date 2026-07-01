import { Point } from '/src/lib/math/point'
import { PointSet } from '/src/lib/math/point/set'
import { Random } from '/src/lib/random'
import { Grid } from '/src/lib/grid'
import { Direction } from '/src/lib/math/direction'
import { HYDRO_NAMES } from '/src/lib/names'
import { PointMap } from '/src/lib/math/point/map'
import { DirectionBitMaskGrid } from '/src/lib/bitmask'

import { RiverStretch } from './type'


const EMPTY = null
const FILL_CHANCE = .1
const FILL_GROWTH = 4
const MIDPOINT_RATE = .6  // 60% around center point

/*
    The shape fill starts from river sources
    following the direction and marking how much strong a
    river gets.
*/
export function buildRiverModel(context) {
    const {rect} = context
    const stretchMap = new PointMap(rect)
    const riverLengths = new Map()
    const riverNames = new Map()
    const estuaries = new PointSet(rect)
    const directionBitmap = new DirectionBitMaskGrid(rect)
    const riverGrid = buildRiverGrid({
        ...context, estuaries, riverLengths, riverNames,
        stretchMap, directionBitmap
    })
    return {
        riverGrid,
        riverLengths,
        riverNames,
        stretchMap,
        directionBitmap,
    }
}


function buildRiverGrid(context) {
    const {rect, world} = context
    const riverSources = []
    // STEP 1 - discover the river sources
    const riverGrid = Grid.fromRect(rect, point => {
        const basin = world.basin.get(point)
        const rainsEnough = world.rain.canCreateRiver(point)
        if (basin.isDivide && rainsEnough) {
            riverSources.push(point)
        }
        return null
    })
    // STEP 2 - follow river paths from each source
    const ctx = {...context, riverGrid}
    // create a list of pairs: (point, river length)
    riverSources.map(point => {
        const basin = world.basin.get(point)
        return [point, basin.distance]
    })
    // in ascendent order to get longest rivers dominant
    // for starting rivers on basin divides (sources)
    .sort((a, b) => a[1] - b[1])
    .forEach((args, index) => buildRiver(ctx, ...args, index))
    return riverGrid
}

// TODO: split this function, calculate points first
function buildRiver(context, sourcePoint, distance, riverId) {
    // start from river source point. Follows the points
    // according to basin flow and builds a river.
    const {world, rect, stretchMap, directionBitmap, riverGrid} = context
    let prevPoint = sourcePoint
    let nextPoint = sourcePoint
    // follow river down following next land points
    const riverLength = world.basin.get(sourcePoint).distance
    while (world.surface.isLand(nextPoint)) {
        const point = nextPoint
        const basin = world.basin.get(point)
        const stretch = buildStretch(basin.distance, riverLength)
        // set river stretch by distance
        stretchMap.set(point, stretch.id)
        // set river bitmap with parent (inflow & outflow)
        directionBitmap.add(point, basin.erosion)
        if (Point.differs(point, prevPoint)) {
            const parentDirection = Point.directionBetween(point, prevPoint)
            directionBitmap.add(point, parentDirection)
        }
        // overwrite previous river id at point
        riverGrid.set(point, riverId)
        // get next river point
        nextPoint = Point.atDirection(point, basin.erosion)
        // save previous point for mouth detection
        prevPoint = point
    }
    // water point that receives river flow
    context.estuaries.add(rect.wrap(nextPoint))
    context.riverLengths.set(riverId, distance)
    context.riverNames.set(riverId, Random.choiceFrom(HYDRO_NAMES))
}


function buildStretch(distance, maxDistance) {
    if (maxDistance < 2) return RiverStretch.FAST_COURSE
    let ratio = (distance / maxDistance).toFixed(1)
    if (ratio >= .8) return RiverStretch.HEADWATERS
    if (ratio >= .5) return RiverStretch.FAST_COURSE
    if (ratio >= .3) return RiverStretch.SLOW_COURSE
    return RiverStretch.DEPOSITIONAL
}
