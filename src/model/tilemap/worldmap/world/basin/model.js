import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Point } from '/src/lib/geometry/point'

import {
    EndorheicSeaBasin,
    EndorheicLakeBasin,
    ExorheicBasin,
    DiffuseLandBasin,
    Basin,
    EMPTY,
} from './type'


const FILL_CHANCE = .1  // chance of fill growing
const FILL_GROWTH = 10  // make fill basins grow bigger than others


export function buildBasinGrid(baseContext) {
    const {rect, world, typeMap} = baseContext

    // init basin id counter
    let basinId = 0
    // get surface border points and setup basin types and fill
    const fillMap = new Map()
    const surveyMap = new Map()
    const basinGrid = Grid.fromRect(rect, point => {
        // reuse the process of basinGrid creation to determine river mouths
        // is this point an erosion path (possible river mouth)?
        const survey = surveyNeighbors(baseContext, point)
        if (world.surface.isLand(point)) {
            if (world.surface.isBorder(point)) {
                // set type on init
                const type = buildBasinType(world, survey)
                typeMap.set(basinId, type.id)
                surveyMap.set(basinId, survey)
                fillMap.set(basinId, {origin: point})
                basinId++
            }
        }
        return EMPTY
    })
    const context = {...baseContext, basinGrid, surveyMap}
    // returns a grid storing basin ids
    // ocean and lake/sea borders must grow at same time
    // but lakes/seas are delayed to grow less
    new BasinGridFill(fillMap, context).complete()
    return basinGrid
}


class BasinGridFill extends ConcurrentFill {
    onInitFill(fill, fillPoint) {
        const {surveyMap} = fill.context
        const survey = surveyMap.get(fill.id)
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

    onFill(fill, fillPoint, parentPoint) {
        const {distanceGrid, erosionMaskGrid} = fill.context
        // distance to source by point
        const currentDistance = distanceGrid.wrapGet(parentPoint)
        distanceGrid.wrapSet(fillPoint, currentDistance + 1)
        // update parent point erosion path
        const upstream = Point.directionBetween(parentPoint, fillPoint)
        erosionMaskGrid.add(parentPoint, upstream)
        this._fillBasin(fill, fillPoint, parentPoint)
    }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    _fillBasin(fill, fillPoint, parentPoint) {
        const {erosionGrid, erosionMaskGrid, basinGrid} = fill.context
        // basin id is the same as fill id
        basinGrid.set(fillPoint, fill.id)
        // set erosion flow to parent
        const direction = Point.directionBetween(fillPoint, parentPoint)
        erosionGrid.wrapSet(fillPoint, direction.id)
        erosionMaskGrid.add(fillPoint, direction)
    }

    isEmpty(fill, fillPoint, parentPoint) {
        const {world, basinGrid, typeMap} = fill.context
        const basin = Basin.parse(typeMap.get(fill.id))
        if (basinGrid.get(fillPoint) !== EMPTY) return false
        if (world.surface.isBorder(fillPoint)) return false
        if (fill.level >= basin.reach) return false
        // avoid erosion flow on land borders
        const target = world.surface.get(fillPoint)
        const parent = world.surface.get(parentPoint)
        // avoid fill if different types
        return target.isWater == parent.isWater
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
    let type = ExorheicBasin
    if (world.surface.isLake(survey.oppositeBorder)) {
        type = EndorheicLakeBasin
    }
    if (world.surface.isSea(survey.oppositeBorder)) {
        type = EndorheicSeaBasin
    }
    if (survey.isRiverCapable) {
        return type
    }
    return DiffuseLandBasin
}
