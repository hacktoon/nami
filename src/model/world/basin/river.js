import { Point } from '/src/lib/math/point'
import { PointMap } from '/src/lib/math/point/map'
import { Random } from '/src/lib/random'
import { Grid } from '/src/lib/grid'
import { PairMap } from '/src/lib/map'
import { Direction } from '/src/lib/math/direction'
import { HYDRO_NAMES } from '/src/lib/names'

import {
    SourceStretch,
    TransitionalStretch,
    DepositionalStretch
} from './type'


export function buildRiverModel(context, model) {
    const { rect } = context
    const riverNames = new Map()
    // iterate on grid to get river sources
    const riverSources = buildRiverSources(model, context)
    const riverPaths = buildRiverPaths(model, { ...context, riverSources })
    // init id grid for later use
    const riverGrid = Grid.fromRect(rect, _ => null)  // TODO: remove
    const { riverMap, riverStretchMap } = buildRiverStretchMap(riverPaths, model, context)
    // riverNames.set(id, Random.choice(HYDRO_NAMES))
    return { riverGrid, riverNames, riverMap, riverStretchMap }
}


function buildRiverSources(model, context) {
    // Start from river source point following the points
    // according to basin flow.
    const { world, rect } = context
    const sources = []
    rect.iterate((point, riverId) => {
        const isDivide = model.erosionDirectionBitmask.get(point).length == 1
        const isRainy = world.rain.canCreateRiver(point)
        if (isRainy && isDivide)
            sources.push([riverId, point])
    })
    return sources
}


function buildRiverPaths(model, context) {
    // Start from river source point following the points
    // according to basin flow, storing point and erosion path.
    const { world, riverSources } = context
    const paths = []
    for (let [riverId, point] of riverSources) {
        const points = []
        let nextPoint = point
        while (world.surface.isLand(nextPoint)) {
            const erosion = Direction.fromId(model.erosion.get(nextPoint))
            points.push([nextPoint, erosion])
            nextPoint = Point.atDirection(nextPoint, erosion)
        }
        paths.push([riverId, points])
    }
    return paths
}


function buildRiverStretchMap(riverPaths, model, context) {
    const riverMap = new PairMap(Direction.getAll().length)
    const riverStretchMap = new PairMap(Direction.getAll().length)
    const ctx = { ...context, riverMap, riverStretchMap }
    for (let path of riverPaths) {
        buildRiverStretch(path, model, ctx)
    }
    return { riverMap, riverStretchMap }
}


function buildRiverStretch(riverPath, model, context) {
    const { rect, riverMap, riverStretchMap } = context
    const [riverId, points] = riverPath
    const riverSize = points.length
    let jointLevel = 0  // up to 3 joints
    for (let i = 0; i < riverSize; i++) {
        const [point, outflowDirection] = points[i]
        if (i == 0) {  // source
            riverStretchMap.set(point, SourceStretch.id)
        } else if (i == riverSize - 1) {  // mouth
            const type = riverSize > 3 ? DepositionalStretch : TransitionalStretch
            riverStretchMap.set(point, type.id)
        } else {  // midcourse
            const parent = points[i - 1]
            const inflowDirection = Point.directionBetween(point, parent)
            const type = DepositionalStretch
            // need to get total inflows to decide if headwaters
            // more than 1 inflow -> outflow = transitional
            riverStretchMap.set(point, type.id)
            // set river stretch by distance
            // const stretch = buildStretch(basinDistance, riverSize)
            // stretchMap.set(source, stretch.id)
        }
    }
}


// TODO: split this function, calculate points first
function buildRiver(riverId, sourcePoint, model, context) {
    const riverPaths = []
    const { world, rect, stretchMap, riverGrid } = context
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
        riverPaths.push(point)
        const erosion = Direction.fromId(model.erosion.get(point))
        // set river bitmap with parent (inflow & outflow)
        // model.riverDirectionMap.add(point, erosion)
        if (Point.differs(point, prevPoint)) {
            const parentDirection = Point.directionBetween(point, prevPoint)
            // model.riverDirectionMap.add(point, parentDirection)
        }
        // overwrite previous river id at point
        riverGrid.set(point, riverId)
        // get next river point
        nextPoint = Point.atDirection(point, erosion)
        // save previous point for mouth detection
        prevPoint = point
    }
    return riverPaths
}


// function buildStretch(distance, maxDistance) {
//     if (maxDistance < 2) return RiverStretch.FAST_COURSE
//     let ratio = (distance / maxDistance).toFixed(1)
//     if (ratio >= .8) return RiverStretch.HEADWATERS
//     if (ratio >= .5) return RiverStretch.FAST_COURSE
//     if (ratio >= .3) return RiverStretch.SLOW_COURSE
//     return RiverStretch.DEPOSITIONAL
// }
