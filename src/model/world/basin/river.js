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
    const riverDirectionBitmask = new DirectionBitMaskGrid(rect)
    const {riverGrid, riverSources} = initRivers(context, model)
    // stretch is mapped by  point and direction
    const ctx = {
        ...context, riverGrid, riverLengths, riverNames,
        stretchMap, riverDirectionBitmask
    }
    // in ascendent order to get longest rivers dominant
    // for starting rivers on basin divides (sources)
    //.sort((a, b) => a[1] - b[1])
    // REMOVE  BITMASK, USE  LIST OF COORDINATES FOR RIVER PATHS
    //
    riverSources.forEach(([id, sourcePoint]) => {
        const basinDistance = model.distance.get(sourcePoint)
        // const rp = buildRiver2(index, sourcePoint, model, context)
        riverNames.set(id, 'a')
        riverLengths.set(id, basinDistance)
        buildRiver(id, sourcePoint, model, ctx)
        // console.log(rp)
        // water point that receives river flow:  rect.wrap(nextPoint)
    })

    return {
        riverGrid,
        riverLengths,
        riverNames,
        stretchMap,
        riverDirectionBitmask,
    }
}


function initRivers(context, model) {
    // Initialize rivers data
    const { rect, world } = context
    const riverSources = []
    // discover the river sources while initializing an empty river id grid
    let id = 0
    const riverGrid = Grid.fromRect(rect, sourcePoint => {
        const isDivide = model.erosionDirectionBitmask.get(sourcePoint) == 1
        if (world.rain.canCreateRiver(sourcePoint)) {
            riverSources.push([id++, sourcePoint])
        }
        return null
    })
    // build rivers from their sources
    for(let [id, sourcePoint] of riverSources) {
        const points = buildRiverPoints(sourcePoint, model, context)
        const riverSize = points.length
        // console.log(id, `${sourcePoint}`, riverSize, points)
    }
    return { riverGrid, riverSources }
}


function buildRiverPoints(sourcePoint, model, context) {
    // start from river source point. Follows the points
    // according to basin flow and builds a river.
    const { world } = context
    let nextPoint = sourcePoint
    const points = []
    // follow river down following erosion direction
    while (world.surface.isLand(nextPoint)) {
        const erosion = Direction.fromId(model.erosion.get(nextPoint))
        points.push([nextPoint, erosion])
        nextPoint = Point.atDirection(nextPoint, erosion)
    }
    return points
}


// TODO: split this function, calculate points first
function buildRiver(riverId, sourcePoint, model, context) {
    // start from river source point. Follows the points
    // according to basin flow and builds a river.
    const riverPoints = []
    const {world, rect, stretchMap, riverGrid} = context
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
        const erosion = Direction.fromId(model.erosion.get(point))
        // set river bitmap with parent (inflow & outflow)
        model.riverDirectionMap.add(point, erosion)
        if (Point.differs(point, prevPoint)) {
            const parentDirection = Point.directionBetween(point, prevPoint)
            model.riverDirectionMap.add(point, parentDirection)
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
