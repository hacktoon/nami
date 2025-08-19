import { ConcurrentFill } from '/src/lib/floodfill/concurrent'
import { Grid } from '/src/lib/grid'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/geometry/point'

import { DirectionBitMaskGrid } from '/src/model/tilemap/lib/bitmask'

import {
    Basin,
    EndorheicSeaBasin,
    EndorheicLakeBasin,
    ExorheicBasin,
    WaterBasin,
    DiffuseBasin,
} from './type'


const NO_BASIN_ID = -1
const FILL_CHANCE = .2  // chance of fill growing
const FILL_GROWTH = 3  // make fill basins grow bigger than others
const MIDPOINT_RATE = .6


export function buildBasinModel(context) {
    const model = {}
    // map basin type for creating rivers or other features
    model.type = new Map()
    // grid of erosion direction ids
    model.erosion = buildErosionGrid(context)
    // random midpoint in each zone rect
    model.midpoint = buildMidpointGrid(context)
    // the walk distance of each basin starting from shore
    model.distance = buildDistanceGrid(context)
    // map a point to a basin zone direction bitmask
    model.directionBitmask = new DirectionBitMaskGrid(context.rect)
    // grid of basin ids
    model.basin = buildBasinGrid({...context, model})
    return model
}


export function buildErosionGrid({rect}) {
    return Grid.fromRect(rect, () => Direction.random().id)
}


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


export function buildDistanceGrid({rect}) {
    // Initial value 0 is used to determine river stretch
    return Grid.fromRect(rect, () => 0)
}


function buildBasinGrid(context) {
    const {world, rect, model} = context
    const surveyMap = new Map()
    const landFillMap = new Map()
    const waterFillMap = new Map()
    let basinId = 0
    const basinGrid = Grid.fromRect(rect, point => {
        const isBorder = world.surface.isBorder(point)
        const isLand = world.surface.isLand(point)
        if (isBorder && isLand) {
            const survey = surveyNeighbors(context, point)
            const type = detectLandBasinType(world, survey)
            surveyMap.set(basinId, survey)
            model.type.set(basinId, type.id)
            landFillMap.set(basinId, {origin: point, retry: true})
            basinId++
        } else if (isBorder && ! isLand) {
            const type = WaterBasin
            model.type.set(basinId, type.id)
            waterFillMap.set(basinId, {origin: point, type})
            basinId++
        }
        // return default basin id (as empty cell) before flood fill
        model.type.set(NO_BASIN_ID, DiffuseBasin.id)
        return NO_BASIN_ID
    })
    // start flood fills from each border, both land && water
    const fillContext = {...context, basinGrid, surveyMap}
    new LandBasinFill(landFillMap, fillContext).complete()
    new WaterBasinFill(waterFillMap, fillContext).complete()
    return basinGrid
}


function surveyNeighbors(context, point) {
    // point is on land
    const {world} = context
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
    return {oppositeBorder}
}


function detectLandBasinType(world, survey) {
    if (world.surface.isLake(survey.oppositeBorder)) {
        return EndorheicLakeBasin
    }
    if (world.surface.isSea(survey.oppositeBorder)) {
        return EndorheicSeaBasin
    }
    return ExorheicBasin
}


class LandBasinFill extends ConcurrentFill {
    getChance(fill) { return FILL_CHANCE }
    getGrowth(fill) { return FILL_GROWTH }

    onInitFill(fill, fillPoint) {
        const {surveyMap} = fill.context
        const survey = surveyMap.get(fill.id)
        // the basin opposite border is the parentPoint
        // update erosion path
        this._fillBasin(fill, fillPoint, survey.oppositeBorder)
    }

    onFill(fill, fillPoint, parentPoint) {
        const {model} = fill.context
        // distance to source by point
        const currentDistance = model.distance.get(parentPoint)
        model.distance.wrapSet(fillPoint, currentDistance + 1)
        // update parent point erosion path
        const upstream = Point.directionBetween(parentPoint, fillPoint)
        model.directionBitmask.add(parentPoint, upstream)
        this._fillBasin(fill, fillPoint, parentPoint)
    }

    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
    }

    isEmpty(fill, fillPoint, parentPoint) {
        const {world, model, basinGrid} = fill.context
        const basin = Basin.parse(model.type.get(fill.id))
        if (basinGrid.get(fillPoint) !== NO_BASIN_ID) return false
        // avoid erosion flow on land borders
        if (world.surface.isBorder(fillPoint)) return false
        if (fill.level >= basin.reach) {
            // basinGrid.set(fillPoint, fill.id)
            return false
        }
        const target = world.surface.get(fillPoint)
        const parent = world.surface.get(parentPoint)
        // avoid fill if different types
        return target.isWater == parent.isWater
    }

    _fillBasin(fill, fillPoint, parentPoint) {
        const {model, basinGrid} = fill.context
        // basin id is the same as fill id
        basinGrid.set(fillPoint, fill.id)
        // set erosion flow to parent
        const direction = Point.directionBetween(fillPoint, parentPoint)
        model.erosion.wrapSet(fillPoint, direction.id)
        model.directionBitmask.add(fillPoint, direction)
    }
}


class WaterBasinFill extends ConcurrentFill {
    getChance(fill) { return FILL_CHANCE }
    getGrowth(fill) { return FILL_GROWTH }

    getNeighbors(fill, parentPoint) {
        return Point.around(parentPoint)
    }

    onInitFill(fill, fillPoint) {
        const { world, model, basinGrid } = fill.context
        basinGrid.set(fillPoint, fill.id)  // basin id is the same as fill id
        // discover adjacent river and water tiles
        Point.adjacents(fillPoint, (sidePoint, direction) => {
            if (world.surface.isLand(sidePoint)) {
                const sideDirection = Direction.fromId(model.erosion.get(sidePoint))
                const mouth = Point.atDirection(sidePoint, sideDirection)
                if (Point.equals(mouth, fillPoint)) {
                    model.directionBitmask.add(fillPoint, direction)
                    model.erosion.set(fillPoint, direction.id)
                }
            } else {
                model.directionBitmask.add(fillPoint, direction)
            }
        })
        // diagonals later
        Point.diagonals(fillPoint, (sidePoint, direction) => {
            if (world.surface.isLand(sidePoint)) return
            if (! world.surface.isBorder(sidePoint)) return
            model.directionBitmask.add(fillPoint, direction)
        })
    }

    isEmpty(fill, point) {
        const { world, basinGrid } = fill.context
        const basinIsEmpty = basinGrid.get(point) === NO_BASIN_ID
        const isWater = world.surface.isWater(point)
        return isWater && basinIsEmpty
    }

    onFill(fill, fillPoint, parentPoint) {
        const { world, model, basinGrid } = fill.context
        const upstream = Point.directionBetween(fillPoint, parentPoint)
        model.erosion.set(fillPoint, upstream.id)
        // calculate downstream directions
        Point.adjacents(fillPoint, (sidePoint, direction) => {
            if (world.surface.isWater(sidePoint)) {
                model.directionBitmask.add(fillPoint, direction)
            }
        })
        basinGrid.set(fillPoint, fill.id)
    }
}