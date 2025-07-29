import { Point } from '/src/lib/geometry/point'
import { Random } from '/src/lib/random'
import { Grid } from '/src/lib/grid'
import { HYDRO_NAMES } from '/src/lib/names'

import { RiverStretch } from './data'


/*
    The shape fill starts from river sources
    following the direction and marking how much strong a
    river gets.
*/
export function buildRiverMap(context) {
    let riverId = 0
    const {rect, world} = context
    const riverSources = []
    const riverPoints = Grid.fromRect(rect, point => {
        const isDivide = world.basin.canCreateRiver(point)
        if (isDivide && world.rain.canCreateRiver(point)) {
            riverSources.push(point)
        }
        return null
    })
    const ctx = {...context, riverPoints}
    // create a list of pairs: (point, river distance to mouth)
    riverSources.map(point => [point, world.basin.get(point).distance])
        // in ascendent order to get longest rivers first
        // for starting rivers on basin divides
        .sort((a, b) => a[1] - b[1])
        .forEach(([point, ]) => {
            buildRiver(ctx, riverId++, point)
        })
    return riverPoints
}


export function buildMidpointGrid({rect, zoneRect}) {
    const RATE = .6  // 60 %
    const centerIndex = Math.floor(zoneRect.width / 2)
    const offset = Math.floor(centerIndex * RATE)

    return Grid.fromRect(rect, () => {
        const x = centerIndex + Random.int(-offset, offset)
        const y = centerIndex + Random.int(-offset, offset)
        return zoneRect.pointToIndex([x, y])
    })
}


function buildRiver(context, riverId, sourcePoint) {
    // start from river source point. Follows the points
    // according to basin flow and builds a river.
    const {
        rect, world, riverPoints, riverNames, riverMouths,
        stretchMap
    } = context
    let prevPoint = sourcePoint
    let currentPoint = sourcePoint
    // follow river down following next land points
    const riverLength = world.basin.get(sourcePoint).distance
    while (world.surface.isLand(currentPoint)) {
        // max size by basin if basin.
        const point = rect.wrap(currentPoint)
        // set river stretch by distance
        const basin = world.basin.get(point)
        const stretch = buildStretch(basin.distance, riverLength)

        stretchMap.set(point, stretch.id)
        // overwrite previous river id at point
        riverPoints.set(point, riverId)

        // get next river point
        currentPoint = Point.atDirection(point, basin.erosion)
        // save previous point for mouth detection
        prevPoint = point
    }
    // current (last) point is water, add previous as river mouth
    riverMouths.add(prevPoint)
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


