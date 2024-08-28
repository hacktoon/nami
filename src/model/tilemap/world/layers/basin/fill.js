import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'

import {
    EndorheicSeaBasin,
    EndorheicLakeBasin,
    ExorheicRiverBasin,
    OceanicBasin,
    Basin,
    EMPTY,
} from './data'


const FILL_CHANCE = .1  // chance of fill growing
const FILL_GROWTH = 10  // make fill basins grow bigger than others
const ZONE_MIDDLE = 5
const ZONE_OFFSET_RANGE = [1, 3]
const BRANCH_CHANCE = .5  // chance of erosion branching


export function buildBasinGrid(baseContext) {
    const {rect, layers, typeMap} = baseContext
    const oppositeBorderMap = new Map()
    // init basin id counter
    let basinId = 0
    // get surface border points and setup basin types and fill
    const fillMap = new Map()
    const basinGrid = Grid.fromRect(rect, point => {
        if (layers.surface.isBorder(point)) {
            const oppositeBorder = getOppositeBorder(point, baseContext)
            oppositeBorderMap.set(basinId, oppositeBorder)
            // typeMap must be initialized before fill
            const type = buildType(point, {...baseContext, oppositeBorder})
            typeMap.set(basinId, type.id)
            fillMap.set(basinId, point)
            basinId++
        }
        return EMPTY
    })
    const context = {...baseContext, basinGrid, oppositeBorderMap}
    // returns a grid storing basin ids
    // ocean and lake/sea borders must grow at same time
    // but lakes/seas are delayed to grow less
    new BasinGridFill(fillMap, context).complete()
    return basinGrid
}


class BasinGridFill extends ConcurrentFill {
    getChance(fill) { return FILL_CHANCE }
    getGrowth(fill) { return FILL_GROWTH }

    isDelayed(fill) {
        const {typeMap} = fill.context
        const basin = Basin.parse(typeMap.get(fill.id))
        return fill.level >= basin.reach
    }

    onInitFill(fill, fillPoint, neighbors) {
        const {oppositeBorderMap} = fill.context
        const oppositeBorder = oppositeBorderMap.get(fill.id)
        this.fillBasin(fill, fillPoint, oppositeBorder)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {distanceGrid, erosionGridMask} = fill.context
        // distance to source by point
        const currentDistance = distanceGrid.wrapGet(parentPoint)
        distanceGrid.wrapSet(fillPoint, currentDistance + 1)
        // update parent point erosion path
        const upstream = Point.directionBetween(parentPoint, fillPoint)
        erosionGridMask.add(parentPoint, upstream)
        this.fillBasin(fill, fillPoint, parentPoint)
    }

    getNeighbors(fill, parentPoint) {
        const {layers, basinGrid, typeMap} = fill.context
        // get only empty neighbors
        const allSides = Point.adjacents(parentPoint)
        const emptySides = allSides.filter(pt => basinGrid.get(pt) === EMPTY)
        // return if there are no points empty or parent point is water
        if (emptySides.length === 0 || layers.surface.isWater(parentPoint)) {
            return emptySides
        }
        // parent is land, check random sides to vary erosion paths
        // if choose enough random neighbors, return them
        // randomize branches to reduce erosion range
        // mark fill if it reached max distance
        const parentBasin = Basin.parse(typeMap.get(fill.id))
        const hasReachedMax = fill.level >= parentBasin.reach

        if (fill.level >= parentBasin.reach) {
            // if (fill.level %2==0 && emptySides.length === 1)
            //     return emptySides
            return []
        } else {
            const randomEmptySides = emptySides.filter(_ => Random.chance(BRANCH_CHANCE))
            if (randomEmptySides.length > 0)
                return randomEmptySides
        }
        // otherwise, return at least one of the empty neighbors
        return [Random.choiceFrom(emptySides)]
    }

    fillBasin(fill, fillPoint, parentPoint) {
        const {
            erosionGrid, erosionGridMask, basinGrid,
            midpointIndexGrid, zoneRect
        } = fill.context
        // set erosion flow to parent
        const direction = Point.directionBetween(fillPoint, parentPoint)
        erosionGrid.wrapSet(fillPoint, direction.id)
        // update erosion path
        erosionGridMask.add(fillPoint, direction)
        basinGrid.set(fillPoint, fill.id)
        // terrain offset to add variance
        const midpoint = buildMidpoint(direction)
        const midpointIndex = zoneRect.pointToIndex(midpoint)
        midpointIndexGrid.wrapSet(fillPoint, midpointIndex)
    }

    isEmpty(fill, fillPoint, parentPoint) {
        const {layers, typeMap} = fill.context
        // const basin = Basin.parse(typeMap.get(fill.id))
        const target = layers.surface.get(fillPoint)
        const parent = layers.surface.get(parentPoint)
        // avoid fill if different types
        if (target.water != parent.water) return false
        return true
    }
}


function getOppositeBorder(point, context) {
    const {layers} = context
    const isLand = layers.surface.isLand(point)
    for (let neighbor of Point.adjacents(point)) {
        const isNeighborLand = layers.surface.isLand(neighbor)
        if (isLand && ! isNeighborLand || ! isLand && isNeighborLand) {
            return neighbor
        }
    }
}


function buildType(point, context) {
    const {layers, oppositeBorder} = context
    const isLand = layers.surface.isLand(point)
    let type = isLand ? ExorheicRiverBasin : OceanicBasin
    if (layers.surface.isLake(oppositeBorder)) {
        type = EndorheicLakeBasin
    }
    if (layers.surface.isSea(oppositeBorder)) {
        type = EndorheicSeaBasin
    }
    return type
}


function buildMidpoint(direction) {
    // direction axis ([-1, 0], [1, 1], etc)
    const rand = (coordAxis) => {
        const offset = Random.int(...ZONE_OFFSET_RANGE)
        const axisToggle = coordAxis === 0 ? Random.choice(-1, 1) : coordAxis
        return ZONE_MIDDLE + (offset * axisToggle)
    }
    return direction.axis.map(coord => rand(coord))
}
