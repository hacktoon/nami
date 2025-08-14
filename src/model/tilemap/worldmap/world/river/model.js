import { Point } from '/src/lib/geometry/point'
import { PointSet } from '/src/lib/geometry/point/set'
import { Random } from '/src/lib/random'
import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { HYDRO_NAMES } from '/src/lib/names'

import { RiverStretch } from './data'


const FILL_CHANCE = .1
const FILL_GROWTH = 4
const MIDPOINT_RATE = .6  // 60% around center point

/*
    The shape fill starts from river sources
    following the direction and marking how much strong a
    river gets.
*/
export function buildRiverModel(context) {
    const {rect, world} = context
    const riverSources = []
    const estuaries = new PointSet(rect)
    const riverGrid = Grid.fromRect(rect, point => {
        const basin = world.basin.get(point)
        const isDivide = basin.type.hasRivers && basin.isDivide

        if (isDivide && world.rain.canCreateRiver(point)) {
            riverSources.push(point)
        }
        return null
    })
    const ctx = {...context, riverGrid, riverSources, estuaries}
    buildRivers(ctx)
    // buildWaterPaths(ctx)
    return riverGrid
}


export function buildMidpointGrid({rect, zoneRect}) {
    const centerIndex = Math.floor(zoneRect.width / 2)
    const offset = Math.floor(centerIndex * MIDPOINT_RATE)

    return Grid.fromRect(rect, () => {
        const x = centerIndex + Random.int(-offset, offset)
        const y = centerIndex + Random.int(-offset, offset)
        return zoneRect.pointToIndex([x, y])
    })
}


function buildRivers(context) {
    let riverId = 0
    const {world, riverSources, riverNames} = context
    // create a list of pairs: (point, river distance to mouth)
    riverSources.map(point => {
        const distance = world.basin.get(point).distance
        return [point, distance]
    })
    // in ascendent order to get longest rivers first
    // for starting rivers on basin divides
    .sort((a, b) => a[1] - b[1])
    .forEach(([point, ]) => {
        buildRiverPath(context, riverId, point)
        riverNames.set(riverId, Random.choiceFrom(HYDRO_NAMES))
        riverId++
    })
}


// TODO: split this function
function buildRiverPath(context, riverId, sourcePoint) {
    // start from river source point. Follows the points
    // according to basin flow and builds a river.
    const {
        world, rect, riverGrid, estuaries, stretchMap,
    } = context
    let prevPoint = sourcePoint
    let nextPoint = sourcePoint
    // follow river down following next land points
    const riverLength = world.basin.get(sourcePoint).distance
    while (world.surface.isLand(nextPoint)) {
        // max size by basin if basin.
        const point = nextPoint
        // set river stretch by distance
        const basin = world.basin.get(point)
        const stretch = buildStretch(basin.distance, riverLength)
        stretchMap.set(point, stretch.id)
        // overwrite previous river id at point
        riverGrid.set(point, riverId)
        // get next river point
        nextPoint = Point.atDirection(point, basin.erosion)
        // save previous point for mouth detection
        prevPoint = point
    }
    // current (last) point is water, add previous as river mouth
    // riverMouthPointSet.add(prevPoint)
    estuaries.add(rect.wrap(nextPoint))

}


function buildStretch(distance, maxDistance) {
    if (maxDistance < 2) return RiverStretch.FAST_COURSE
    let ratio = (distance / maxDistance).toFixed(1)
    if (ratio >= .8) return RiverStretch.HEADWATERS
    if (ratio >= .5) return RiverStretch.FAST_COURSE
    if (ratio >= .3) return RiverStretch.SLOW_COURSE
    return RiverStretch.DEPOSITIONAL
}


function buildWaterPaths(context) {
    const {estuaries} = context
    const fillMap = new Map()
    estuaries.forEach((point, index) => {
        fillMap.set(index, {origin: point})
    })
    // new WaterMaskFill(fillMap, context).complete()
}


class WaterMaskFill extends ConcurrentFill {
    getChance(fill) { return FILL_CHANCE }
    getGrowth(fill) { return FILL_GROWTH }

    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
    }

    onInitFill(fill, fillPoint) {
        const { rect, riverGrid } = fill.context
        // check neighbor rivers

        // set negative value to indicate water
        // riverGrid.set(fillPoint, -)
    }

    onFill(fill, fillPoint, parentPoint) {
        const { waterMaskPoints } = fill.context
        // distance to source by point
        waterMaskPoints.add(fillPoint)
    }

    isEmpty(fill, fillPoint, parentPoint) {
        const {world, waterMaskPoints} = fill.context
        if (world.surface.isLand(fillPoint)) return false
        return ! waterMaskPoints.has(fillPoint)
    }
}