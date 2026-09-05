import { Point } from '/src/lib/math/point'
import { PointSet } from '/src/lib/math/point/set'
import { Random } from '/src/lib/random'
import { Rect } from '/src/lib/math/rect'
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
    const { world, rect } = context
    const riverNames = new Map()
    const stretchMap = new PointMap(rect)
    const specs = []
    // init id grid for later use
    const riverGrid = Grid.fromRect(rect, _ => null)
    const riverPaths = buildRiverPaths(model, context)
    // iterate on grid to get river sources

    // stretch is mapped by point and direction
    // REMOVE  BITMASK, USE  LIST OF COORDINATES FOR RIVER PATHS
    for (let [id, points] of specs) {
        riverNames.set(id, Random.choice(HYDRO_NAMES))
        buildRiverStretch(id, points, model, {...context, stretchMap})
    }
    return { riverGrid, riverNames, stretchMap }
}


function buildRiverPaths(model, context) {
    // Start from river source point following the points
    // according to basin flow.
    const { world, rect } = context
    let riverId = 0
    const paths = []
    rect.iterate(point => {
        const isSource = isDivide(point, model) && world.rain.canCreateRiver(point)
        if (! isSource)
            return
        const points = []
        let nextPoint = point
        while (world.surface.isLand(nextPoint)) {
            const erosion = Direction.fromId(model.erosion.get(nextPoint))
            points.push([nextPoint, erosion])
            nextPoint = Point.atDirection(nextPoint, erosion)
        }
        paths.push([riverId++, points])
    })
    return paths
}


function buildRiverStretch(id, points, model, context) {
    const { stretchMap } = context
    const riverSize = points.length
    for (let i = 0; i < points.length; i++) {
        const [point, erosion] = points[i]
        if (i == 0) {  // source

        } else if (i == points.length - 1) {  // mouth

        } else {
            // set river stretch by distance
            // const stretch = buildStretch(basinDistance, riverSize)
            // stretchMap.set(source, stretch.id)
        }
    }
}

function isDivide(sourcePoint, model) {
    return model.erosionDirectionBitmask.get(sourcePoint).length == 1
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
    return riverPaths
}



function buildStretch(distance, maxDistance) {
    if (maxDistance < 2) return RiverStretch.FAST_COURSE
    let ratio = (distance / maxDistance).toFixed(1)
    if (ratio >= .8) return RiverStretch.HEADWATERS
    if (ratio >= .5) return RiverStretch.FAST_COURSE
    if (ratio >= .3) return RiverStretch.SLOW_COURSE
    return RiverStretch.DEPOSITIONAL
}
