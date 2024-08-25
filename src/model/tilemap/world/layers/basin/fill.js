import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'

import {
    EndorheicSeaBasin,
    EndorheicLakeBasin,
    ExorheicBasin,
    OceanicBasin,
} from './data'


const FILL_CHANCE = .1  // chance of fill growing
const JOINT_CHANCE = .5  // chance of increase or decrease
const FILL_GROWTH = 10  // make fill basins grow bigger than others
const ZONE_MIDDLE = 5
const EMPTY = null
const OFFSET_RANGE = [1, 3]
const JOINT_RANGE = [0, 3]
const BRANCH_CHANCE = .5  // chance of erosion branching


export function buildBasinGrid(baseContext) {
    const {rect, layers, typeMap, jointGrid} = baseContext
    const oppositeBorderMap = new Map()
    // maps the endorheic types for the total of fill skips
    const fillSkipMap = new Map([
        [EndorheicSeaBasin.id, 5],
        [EndorheicLakeBasin.id, 7],
    ])
    const fillMap = new Map()
    // init basin id counter
    let basinId = 0
    // get surface border points and setup basin fill
    const basinGrid = Grid.fromRect(rect, point => {
        const jointValue = Random.int(...JOINT_RANGE) * Random.chance(JOINT_CHANCE) ? 1 : -1
        jointGrid.set(point, jointValue)
        if (layers.surface.isBorder(point)) {
            const oppositeBorder = getOppositeBorder(point, baseContext)
            const type = buildType(point, {...baseContext, oppositeBorder})
            oppositeBorderMap.set(basinId, oppositeBorder)
            fillMap.set(basinId, point)
            typeMap.set(basinId, type.id)
            basinId++
        }
        return EMPTY
    })
    const context = {...baseContext, fillSkipMap, basinGrid, oppositeBorderMap}
    // returns a grid storing basin ids
    // ocean and lake/sea borders must grow at same time
    // but lakes/seas are delayed to grow less
    new BasinGridFill(fillMap, context).complete()
    return basinGrid
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
    let type = isLand ? ExorheicBasin : OceanicBasin
    if (layers.surface.isLake(oppositeBorder)) {
        type = EndorheicLakeBasin
    }
    if (layers.surface.isSea(oppositeBorder)) {
        type = EndorheicSeaBasin
    }
    return type
}


class BasinGridFill extends ConcurrentFill {
    getChance(fill) { return FILL_CHANCE }
    getGrowth(fill) { return FILL_GROWTH }
    getSkip(fill) {
        // skip fill n times on endorheic basins (lake, sea)
        const {typeMap, fillSkipMap} = fill.context
        const typeId = typeMap.get(fill.id)  // fill.id is basinId
        return fillSkipMap.get(typeId) ?? 0
    }

    onInitFill(fill, fillPoint, neighbors) {
        const parentPoint = fill.context.oppositeBorderMap.get(fill.id)
        this.fillBaseData(fill, fillPoint, parentPoint)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {distanceGrid, erosionGridMask} = fill.context
        // distance to source by point
        const currentDistance = distanceGrid.wrapGet(parentPoint)
        distanceGrid.wrapSet(fillPoint, currentDistance + 1)
        // update parent point erosion path
        const upstream = Point.directionBetween(parentPoint, fillPoint)
        erosionGridMask.add(parentPoint, upstream)
        this.fillBaseData(fill, fillPoint, parentPoint)
    }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint).filter(_=>Random.chance(BRANCH_CHANCE))
    }

    fillBaseData(fill, fillPoint, parentPoint) {
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
        const midpoint = this.buildMidpoint(direction)
        const midpointIndex = zoneRect.pointToIndex(midpoint)
        midpointIndexGrid.wrapSet(fillPoint, midpointIndex)
    }

    isEmpty(fill, fillPoint, parentPoint) {
        const {layers, basinGrid} = fill.context
        const target = layers.surface.get(fillPoint)
        const parent = layers.surface.get(parentPoint)
        return target.water === parent.water && basinGrid.get(fillPoint) === EMPTY
    }

    buildMidpoint(direction) {
        // direction axis ([-1, 0], [1, 1], etc)
        const rand = (coordAxis) => {
            const offset = Random.int(...OFFSET_RANGE)
            const axisToggle = coordAxis === 0 ? Random.choice(-1, 1) : coordAxis
            return ZONE_MIDDLE + (offset * axisToggle)
        }
        return direction.axis.map(coord => rand(coord))
    }
}
