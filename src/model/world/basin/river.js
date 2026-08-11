import { Point } from '/src/lib/math/point'
import { PointSet } from '/src/lib/math/point/set'
import { Random } from '/src/lib/random'
import { Grid } from '/src/lib/grid'
import { Direction } from '/src/lib/math/direction'
import { HYDRO_NAMES } from '/src/lib/names'
import { PointMap } from '/src/lib/math/point/map'
import { DirectionBitMaskGrid } from '/src/lib/bitmask'


import { RiverStretch } from './type'


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
    // const estuaries = new PointSet(rect)
    const erosionDirectionBitmask = new DirectionBitMaskGrid(rect)
    const {riverGrid, riverSources} = initRivers(context, model)
    fillRivers({
        ...context, riverGrid, riverLengths, riverNames,
        stretchMap, erosionDirectionBitmask
    }, model, riverSources)
    return {
        riverGrid,
        riverLengths,
        riverNames,
        stretchMap,
        erosionDirectionBitmask,
    }
}


function initRivers(context, model) {
    const { rect, world } = context
    const riverSources = []
    // discover the river sources while building the river grid
    const riverGrid = Grid.fromRect(rect, point => {
        if (world.rain.canCreateRiver(point)) {
            riverSources.push(point)
        }
        return null
    })
    return { riverGrid, riverSources }
}


function fillRivers(context, model, riverSources) {
    const { rect, world, riverNames, riverLengths } = context
    // follow river paths from each source
    // create a list of pairs: (point, river length)
    // REEDIT
    // riverSources deve conter apenas os pontos do rio descendo
    riverSources.map(point => {
        const basinDistance = model.distance.get(point)
        return [point, basinDistance]
    })
    .sort((a, b) => {
        // in ascendent order to get longest rivers dominant
        // for starting rivers on basin divides (sources)
        return a[1] - b[1]
    })
    .forEach((args, index) => {
        const [_, basinDistance] = args
        riverNames.set(index, Random.choiceFrom(HYDRO_NAMES))
        riverLengths.set(index, basinDistance)
        buildRiver(index, args, model, context)
        // water point that receives river flow
        // estuaries.add(rect.wrap(nextPoint))
    })
}


// TODO: split this function, calculate points first
function buildRiver(riverId, args, model, context) {
    // start from river source point. Follows the points
    // according to basin flow and builds a river.
    const riverPoints = []
    const [sourcePoint, basinDistance] = args
    const {world, rect, stretchMap, erosionDirectionBitmask, riverGrid} = context
    let prevPoint = sourcePoint
    let nextPoint = sourcePoint
    // follow river down following next land points
    const basinMaxDistance = model.distance.get(sourcePoint)
    while (world.surface.isLand(nextPoint)) {
        const point = nextPoint
        // esse trecho do stretch deve ser retirado
        const basinDistance = model.distance.get(point)
        const stretch = buildStretch(basinDistance, basinMaxDistance)
        // set river stretch by distance
        stretchMap.set(point, stretch.id)
        riverPoints.push(point)
        // erosion normalized
        const erosion = Direction.fromId(model.erosion.get(point))
        // set river bitmap with parent (inflow & outflow)
        erosionDirectionBitmask.add(point, erosion)
        if (Point.differs(point, prevPoint)) {
            const parentDirection = Point.directionBetween(point, prevPoint)
            erosionDirectionBitmask.add(point, parentDirection)
        }
        // overwrite previous river id at point
        riverGrid.set(point, riverId)
        // get next river point
        nextPoint = Point.atDirection(point, erosion)
        // save previous point for mouth detection
        prevPoint = point
    }
    return riverPoints
}


function buildStretch(distance, maxDistance) {
    if (maxDistance < 2) return RiverStretch.FAST_COURSE
    let ratio = (distance / maxDistance).toFixed(1)
    if (ratio >= .8) return RiverStretch.HEADWATERS
    if (ratio >= .5) return RiverStretch.FAST_COURSE
    if (ratio >= .3) return RiverStretch.SLOW_COURSE
    return RiverStretch.DEPOSITIONAL
}
