import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/geometry/point'

import {
    EndorheicSeaBasin,
    EndorheicLakeBasin,
    ExorheicBasin,
    DiffuseLandBasin,
    Basin,
    EMPTY,
    WaterBasin,
} from './type'


const FILL_CHANCE = .1  // chance of fill growing
const FILL_GROWTH = 4  // make fill basins grow bigger than others
const MIDPOINT_RATE = .6


export function buildMidpointGrid({rect, zoneRect}) {
    const centerIndex = Math.floor(zoneRect.width / 2)
    // 60% around center point
    const offset = Math.floor(centerIndex * MIDPOINT_RATE)

    return Grid.fromRect(rect, () => {
        const x = centerIndex + Random.int(-offset, offset)
        const y = centerIndex + Random.int(-offset, offset)
        return zoneRect.pointToIndex([x, y])
    })
}


export function buildBasinModel(baseContext) {
    const {rect, world, typeMap} = baseContext
    // init basin id counter
    let basinId = 0
    // get surface border points and setup basin types and fill
    const landFillMap = new Map()
    const waterFillMap = new Map()
    const surveyMap = new Map()
    const basinGrid = Grid.fromRect(rect, point => {
        // reuse the process of basinGrid creation to determine river mouths
        // is this point an erosion path (possible river mouth)?
        if (world.surface.isBorder(point)) {
            if (world.surface.isLand(point)) {
                const survey = surveyNeighbors(baseContext, point)
                surveyMap.set(basinId, survey)
                const type = buildBasinType(world, survey)
                typeMap.set(basinId, type.id)
                landFillMap.set(basinId, {origin: point})
            } else {
                typeMap.set(basinId, WaterBasin.id)
                waterFillMap.set(basinId, {origin: point})
            }
            basinId++
        }
        return EMPTY
    })
    const context = {...baseContext, basinGrid, surveyMap}
    new LandBasinFill(landFillMap, context).complete()
    new WaterBasinFill(waterFillMap, context).complete()
    return basinGrid
}


class LandBasinFill extends ConcurrentFill {
    getChance(fill) { return FILL_CHANCE }

    getGrowth(fill) {
        const {typeMap} = fill.context
        const basin = Basin.parse(typeMap.get(fill.id))
        return basin.isEndorheic ? 1 : FILL_GROWTH
    }

    onInitFill(fill, fillPoint) {
        const {surveyMap} = fill.context
        const survey = surveyMap.get(fill.id)
        // the basin opposite border is the parentPoint
        // update erosion path
        this._fillBasin(fill, fillPoint, survey.oppositeBorder)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {distanceGrid, directionBitmask} = fill.context
        // distance to source by point
        const currentDistance = distanceGrid.get(parentPoint)
        distanceGrid.wrapSet(fillPoint, currentDistance + 1)
        // update parent point erosion path
        const upstream = Point.directionBetween(parentPoint, fillPoint)
        directionBitmask.add(parentPoint, upstream)
        this._fillBasin(fill, fillPoint, parentPoint)
    }

    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
    }

    isEmpty(fill, fillPoint, parentPoint) {
        const {world, basinGrid, typeMap} = fill.context
        const basin = Basin.parse(typeMap.get(fill.id))
        if (basinGrid.get(fillPoint) !== EMPTY) return false
        // avoid erosion flow on land borders
        if (world.surface.isBorder(fillPoint)) return false
        if (fill.level >= basin.reach) return false
        const target = world.surface.get(fillPoint)
        const parent = world.surface.get(parentPoint)
        // avoid fill if different types
        return target.isWater == parent.isWater
    }

    _fillBasin(fill, fillPoint, parentPoint) {
        const {erosionGrid, directionBitmask, basinGrid} = fill.context
        // basin id is the same as fill id
        basinGrid.set(fillPoint, fill.id)
        // set erosion flow to parent
        const direction = Point.directionBetween(fillPoint, parentPoint)
        erosionGrid.wrapSet(fillPoint, direction.id)
        directionBitmask.add(fillPoint, direction)
    }
}


function surveyNeighbors(context, point) {
    // point is on land
    const {world} = context
    const [x, y] = point
    let waterNeighbors = 0
    let oppositeBorder = null
    const neighbors = Point.adjacents(point)
    for (let neighbor of neighbors) {
        const isNeighborWater = world.surface.isWater(neighbor)
        if (isNeighborWater) {
            waterNeighbors++
            // parent point for erosion algorithm
            oppositeBorder = neighbor
        }
    }
    // chess pattern to avoid rivers getting too close
    const onMinDistance = (x + y) % 2 === 0
    const isRiverCapable = waterNeighbors === 1 && onMinDistance
    return {oppositeBorder, isRiverCapable}
}


function buildBasinType(world, survey) {
    if (world.surface.isLake(survey.oppositeBorder)) {
        return EndorheicLakeBasin
    }
    if (world.surface.isSea(survey.oppositeBorder)) {
        return EndorheicSeaBasin
    }
    if (survey.isRiverCapable) {
        return ExorheicBasin
    }
    return DiffuseLandBasin
}


class WaterBasinFill extends ConcurrentFill {
    getChance(fill) { return FILL_CHANCE }
    getGrowth(fill) { return FILL_GROWTH }

    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
    }

    onInitFill(fill, fillPoint) {
        const { world, erosionGrid, directionBitmask, basinGrid, typeMap } = fill.context
        // basin id is the same as fill id
        let riverDirection
        basinGrid.set(fillPoint, fill.id)
        Point.adjacents(fillPoint, (sidePoint, direction) => {
            if (world.surface.isLand(sidePoint)) {
                const sideId = basinGrid.get(sidePoint)
                const sideType = Basin.parse(typeMap.get(sideId))
                if (sideType && sideType.hasRivers) {
                    riverDirection = Point.directionBetween(sidePoint, fillPoint)
                    directionBitmask.add(fillPoint, direction)
                }
            } else {
                directionBitmask.add(fillPoint, direction)
            }
        })
        const erosionDirection = riverDirection || Direction.randomCardinal()
        erosionGrid.set(fillPoint, erosionDirection.id)
    }

    isEmpty(fill, point) {
        const {world, basinGrid} = fill.context
        const basinIsEmpty = basinGrid.get(point) === EMPTY
        const isWater = world.surface.isWater(point)
        return isWater && basinIsEmpty
    }

    onFill(fill, fillPoint, parentPoint) {
        const {basinGrid, erosionGrid, directionBitmask} = fill.context
        // update parent point erosion path
        const upstream = Point.directionBetween(fillPoint, parentPoint)
        const downstream = Point.directionBetween(parentPoint, fillPoint)
        directionBitmask.add(fillPoint, upstream)
        directionBitmask.add(parentPoint, downstream)
        erosionGrid.set(fillPoint, upstream.id)
        basinGrid.set(fillPoint, fill.id)
    }
}