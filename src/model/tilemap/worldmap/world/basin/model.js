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


const NO_BASIN_ID = null
const FILL_CHANCE = .2  // chance of fill growing
const FILL_GROWTH = 3
const MIDPOINT_RATE = .6  //random point in 60% of chunkrect area around center point
const MIDDLE_OFFSET = 2  // used to avoid midpoints on middle


export function buildBasinModel(context) {
    const model = {}
    // map basin type for creating rivers or other features
    model.type = new Map()
    // grid of erosion direction ids
    model.erosion = buildErosionGrid(context)
    // random midpoint in each chunk rect
    model.midpoint = buildMidpointGrid(context)
    // random joint value to connect chunks
    model.joint = buildJointGrid(context)
    // the walk distance of each basin starting from shore
    model.distance = buildDistanceGrid(context)
    // map a point to a basin chunk direction bitmask
    model.directionBitmap = new DirectionBitMaskGrid(context.rect)
    // grid of basin ids
    model.basin = buildBasinGrid({...context, model})
    return model
}


export function buildErosionGrid({rect}) {
    return Grid.fromRect(rect, () => Direction.random().id)
}


export function buildMidpointGrid({rect, chunkRect}) {
    const centerIndex = Math.floor(chunkRect.width / 2)
    // select random point in 60% of chunkrect area around center point
    const offset = Math.floor(centerIndex * MIDPOINT_RATE)
    return Grid.fromRect(rect, () => {
        const randX = Random.int(-offset, offset)
        const randY = Random.int(-offset, offset)
        // random offset distance from center
        const midRandX = Random.choice(-MIDDLE_OFFSET, MIDDLE_OFFSET)
        const midRandY = Random.choice(-MIDDLE_OFFSET, MIDDLE_OFFSET)
        const x = centerIndex + (randX != 0 ? randX : midRandX)
        const y = centerIndex + (randY != 0 ? randY : midRandY)
        return chunkRect.pointToIndex([x, y])
    })
}


export function buildJointGrid({rect, chunkSize}) {
    return Grid.fromRect(rect, () => {
        return Random.int(1, chunkSize - 2)
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
        // prepare data for flood fill at each point
        const isBorder = world.surface.isBorder(point)
        const isLand = world.surface.isLand(point)
        // basins start on borders and fill up grid
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
    const waterNeighbors = []
    let oppositeBorder = null
    const neighbors = Point.adjacents(point)
    for (let neighbor of neighbors) {
        const isNeighborWater = world.surface.isWater(neighbor)
        if (isNeighborWater) {
            waterNeighbors.push(neighbor)
            // parent point for erosion algorithm
            oppositeBorder = neighbor
        }
    }
    // chess pattern to avoid rivers getting too close
    return {oppositeBorder, waterNeighbors}
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
        const {model, surveyMap} = fill.context
        const survey = surveyMap.get(fill.id)
        // the basin opposite border is the parentPoint
        this._fillBasin(fill, fillPoint, survey.oppositeBorder)
        // update erosion path
        for (let neighbor of survey.waterNeighbors) {
            const direction = Point.directionBetween(fillPoint, neighbor)
            model.directionBitmap.add(fillPoint, direction)
        }
    }

    onFill(fill, fillPoint, parentPoint) {
        const {model} = fill.context
        // distance to source by point
        const currentDistance = model.distance.get(parentPoint)
        model.distance.wrapSet(fillPoint, currentDistance + 1)
        // update parent point erosion path
        const upstream = Point.directionBetween(parentPoint, fillPoint)
        model.directionBitmap.add(parentPoint, upstream)
        this._fillBasin(fill, fillPoint, parentPoint)
    }

    getNeighbors(fill, parentPoint) {
        return Point.adjacents(parentPoint)
    }

    isEmpty(fill, fillPoint, parentPoint) {
        const {world, model, basinGrid} = fill.context
        const basin = Basin.parse(model.type.get(fill.id))
        if (basinGrid.get(fillPoint) !== NO_BASIN_ID)
            return false
        // avoid erosion flow on land borders
        if (world.surface.isBorder(fillPoint))
            return false
        if (fill.level >= basin.reach) {
            return false
        }
        const target = world.surface.get(fillPoint)
        const parent = world.surface.get(parentPoint)
        // avoid fill if different types
        return target.isWater == parent.isWater
    }

    _fillBasin(fill, fillPoint, parentPoint) {
        const {model, basinGrid} = fill.context
        const direction = Point.directionBetween(fillPoint, parentPoint)
        // basin id is the same as fill id
        basinGrid.set(fillPoint, fill.id)
        // set erosion flow to parent
        model.erosion.set(fillPoint, direction.id)
        // mark the direction the erosion flows
        model.directionBitmap.add(fillPoint, direction)
        // update midpoint to account erosion
        this._updateMidpoint(fill, fillPoint, direction)
    }

    _updateMidpoint(fill, fillPoint, direction) {
        const {model, chunkRect, chunkSize} = fill.context
        const [midX, midY] = [Math.floor(chunkSize / 2), Math.floor(chunkSize / 2)]
        // const [chunkX, chunkY] = chunkRect.indexToPoint(index)
        const [chunkX, chunkY] = chunkRect.indexToPoint(model.midpoint.get(fillPoint))
        const [axisX, axisY] = direction.axis
        const offset = 3
        // rescale direction axis to rect corners
        const cornerX = axisX < 0 ? offset : (axisX == 0 ? chunkX : chunkSize - offset)
        const cornerY = axisY < 0 ? offset : (axisY == 0 ? chunkY : chunkSize - offset)
        const chunkPoint = [
            Random.int(cornerX, midX),
            Random.int(cornerY, midY),
        ]
        const newIndex = chunkRect.pointToIndex(chunkPoint)
        model.midpoint.set(fillPoint, newIndex)
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
                model.erosion.set(fillPoint, direction.id)
            }
            model.directionBitmap.add(fillPoint, direction)
        })
        // diagonals later, only to non-border water sides
        Point.diagonals(fillPoint, (sidePoint, direction) => {
            if (world.surface.isLand(sidePoint)) return
            if (! world.surface.isBorder(sidePoint)) return
            model.directionBitmap.add(fillPoint, direction)
        })
    }

    isEmpty(fill, point) {
        const { world, basinGrid } = fill.context
        const basinIsEmpty = basinGrid.get(point) === NO_BASIN_ID
        const isWater = world.surface.isWater(point)
        return isWater && basinIsEmpty
    }

    onFill(fill, fillPoint, parentPoint) {
        const { model, basinGrid } = fill.context
        const upstream = Point.directionBetween(fillPoint, parentPoint)
        // const joint = model.joint.get(fillPoint)
        // calculate downstream directions
        Point.adjacents(fillPoint, (sidePoint, direction) => {
            // const sideJoint = model.joint.get(sidePoint)
            model.directionBitmap.add(fillPoint, direction)
        })
        basinGrid.set(fillPoint, fill.id)
        model.erosion.set(fillPoint, upstream.id)
    }
}
