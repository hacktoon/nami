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
export function buildRiverModel(context, model) {
    const { rect } = context
    const stretchMap = new PointMap(rect)
    const riverLengths = new Map()
    const riverNames = new Map()
    const estuaries = new PointSet(rect)
    const directionBitmap = new DirectionBitMaskGrid(rect)
    const {riverGrid, riverSources} = buildRiverBase(context, model)
    fillRiverGrid({
        ...context, estuaries, riverGrid, riverLengths, riverNames,
        stretchMap, directionBitmap
    }, model, riverSources)
    return {
        riverGrid,
        riverLengths,
        riverNames,
        stretchMap,
        directionBitmap,
    }
}


function buildRiverBase(context, model) {
    const { rect, world } = context
    const riverSources = []
    // discover the river sources while building the river grid
    const riverGrid = Grid.fromRect(rect, point => {
        const rainsEnough = world.rain.canCreateRiver(point)
        const isDivide = model.directionBitmap.get(point).length === 1
        if (isDivide && rainsEnough) {
            riverSources.push(point)
        }
        return null
    })
    return { riverGrid, riverSources }
}


function fillRiverGrid(context, model, riverSources) {
    const { rect, world } = context
    // follow river paths from each source
    // create a list of pairs: (point, river length)
    riverSources.map(point => {
        const basinDistance = model.distance.get(point)
        return [point, basinDistance]
    })
    // in ascendent order to get longest rivers dominant
    // for starting rivers on basin divides (sources)
    .sort((a, b) => a[1] - b[1])
    .forEach((args, index) => buildRiver(index, args, model, context))
}


// TODO: split this function, calculate points first
function buildRiver(riverId, args, model, context) {
    // start from river source point. Follows the points
    // according to basin flow and builds a river.
    const [sourcePoint, basinDistance] = args
    const {
        world, rect, stretchMap, directionBitmap, estuaries,
        riverGrid, riverNames, riverLengths
    } = context
    let prevPoint = sourcePoint
    let nextPoint = sourcePoint
    // follow river down following next land points
    const basinMaxDistance = model.distance.get(sourcePoint)
    while (world.surface.isLand(nextPoint)) {
        const point = nextPoint
        const basinDistance = model.distance.get(point)
        const stretch = buildStretch(basinDistance, basinMaxDistance)
        // set river stretch by distance
        stretchMap.set(point, stretch.id)
        // erosion normalized
        const erosion = Direction.fromId(model.erosion.get(point))
        // set river bitmap with parent (inflow & outflow)
        directionBitmap.add(point, erosion)
        if (Point.differs(point, prevPoint)) {
            const parentDirection = Point.directionBetween(point, prevPoint)
            directionBitmap.add(point, parentDirection)
        }
        // overwrite previous river id at point
        riverGrid.set(point, riverId)
        // get next river point
        nextPoint = Point.atDirection(point, erosion)
        // save previous point for mouth detection
        prevPoint = point
    }
    // water point that receives river flow
    estuaries.add(rect.wrap(nextPoint))
    riverLengths.set(riverId, basinDistance)
    riverNames.set(riverId, Random.choiceFrom(HYDRO_NAMES))
}


function buildStretch(distance, maxDistance) {
    if (maxDistance < 2) return RiverStretch.FAST_COURSE
    let ratio = (distance / maxDistance).toFixed(1)
    if (ratio >= .8) return RiverStretch.HEADWATERS
    if (ratio >= .5) return RiverStretch.FAST_COURSE
    if (ratio >= .3) return RiverStretch.SLOW_COURSE
    return RiverStretch.DEPOSITIONAL
}
