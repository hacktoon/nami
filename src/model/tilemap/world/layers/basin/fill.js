import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/geometry/point'

import {
    EndorheicSeaBasin,
    EndorheicLakeBasin,
    ExorheicRiverBasin,
    Basin,
    EMPTY,
} from './data'


const FILL_CHANCE = .1  // chance of fill growing
const FILL_GROWTH = 10  // make fill basins grow bigger than others
const FILL_SKIP_COUNT = 5
const ZONE_MIDDLE = 5
const ZONE_OFFSET_RANGE = [1, 3]


export function buildBasinGrid(baseContext) {
    const {rect, layers} = baseContext

    // init basin id counter
    let basinId = 0
    // get surface border points and setup basin types and fill
    const fillMap = new Map()
    const basinGrid = Grid.fromRect(rect, point => {
        if (layers.surface.isLand(point) && layers.surface.isBorder(point)) {
            fillMap.set(basinId++, {origin: point})
        }
        return EMPTY
    })
    const context = {...baseContext, basinGrid}
    // returns a grid storing basin ids
    // ocean and lake/sea borders must grow at same time
    // but lakes/seas are delayed to grow less
    new BasinGridFill(fillMap, context).complete()
    return basinGrid
}


class BasinGridFill extends ConcurrentFill {
    onInitFill(fill, fillPoint, neighbors) {
        const {typeMap} = fill.context
        const survey = surveyNeighbors(fill.context, neighbors, fillPoint)
        // set type on init
        const type = buildBasinType(fill.context.layers, survey)
        typeMap.set(fill.id, type.id)
        // the basin opposite border is the parentPoint
        // update erosion path
        this._fillBasin(fill, fillPoint, survey.oppositeBorder)
    }

    getChance(fill) { return FILL_CHANCE }

    getGrowth(fill) {
        const {typeMap} = fill.context
        const basin = Basin.parse(typeMap.get(fill.id))
        return basin.isEndorheic ? 1 : FILL_GROWTH
    }

    getSkip(fill) {
        const {typeMap} = fill.context
        const basin = Basin.parse(typeMap.get(fill.id))
        return fill.level >= basin.reach ? FILL_SKIP_COUNT : 0
    }

    onFill(fill, fillPoint, parentPoint) {
        const {distanceGrid, erosionGridMask} = fill.context
        // distance to source by point
        const currentDistance = distanceGrid.wrapGet(parentPoint)
        distanceGrid.wrapSet(fillPoint, currentDistance + 1)
        // update parent point erosion path
        const upstream = Point.directionBetween(parentPoint, fillPoint)
        erosionGridMask.add(parentPoint, upstream)
        this._fillBasin(fill, fillPoint, parentPoint)
    }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    _fillBasin(fill, fillPoint, parentPoint) {
        const {
            erosionGrid, erosionGridMask, basinGrid,
            midpointIndexGrid, zoneRect
        } = fill.context
        // set erosion flow to parent
        const direction = Point.directionBetween(fillPoint, parentPoint)
        erosionGrid.wrapSet(fillPoint, direction.id)
        erosionGridMask.add(fillPoint, direction)
        basinGrid.set(fillPoint, fill.id)
        // terrain offset to add variance
        const midpoint = buildMidpoint(direction)
        const midpointIndex = zoneRect.pointToIndex(midpoint)
        midpointIndexGrid.wrapSet(fillPoint, midpointIndex)
    }

    isEmpty(fill, fillPoint, parentPoint) {
        const {layers, basinGrid} = fill.context
        if (basinGrid.get(fillPoint) !== EMPTY) {
            return false
        }
        const target = layers.surface.get(fillPoint)
        const parent = layers.surface.get(parentPoint)
        // avoid fill if different types
        return target.water == parent.water
    }
}


function surveyNeighbors(context, neighbors, point) {
    const {layers} = context
    const isLand = layers.surface.isLand(point)
    let oppositeBorder = null
    let waterNeighbors = 0
    for (let neighbor of neighbors) {
        const isNeighborLand = layers.surface.isLand(neighbor)
        if (! isNeighborLand) waterNeighbors++
        if (isLand === isNeighborLand) continue
        oppositeBorder = neighbor
    }
    return {oppositeBorder}
}


function buildBasinType(layers, survey) {
    let type = ExorheicRiverBasin
    if (layers.surface.isLake(survey.oppositeBorder)) {
        type = EndorheicLakeBasin
    }
    if (layers.surface.isSea(survey.oppositeBorder)) {
        type = EndorheicSeaBasin
    }
    return type
}


function buildMidpoint() {
    const rand = () => {
        const offset = Random.int(...ZONE_OFFSET_RANGE)
        return ZONE_MIDDLE + (offset * Random.choice(-1, 1))
    }
    return [rand(), rand()]
}
