import { Grid } from '/src/lib/grid'
import { Direction } from '/src/lib/math/direction'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/math/point'
import { DirectionBitMaskGrid } from '/src/lib/bitmask'

import { buildRiverModel } from './river'
import {
    LandBasinFill,
    WaterBasinFill
} from './fill'

import {
    Basin,
    EndorheicSeaBasin,
    EndorheicLakeBasin,
    ExorheicBasin,
    OceanBasin,
    RiverStretch,
} from './type'


const NO_BASIN_ID = null
const FILL_CHANCE = .2
const FILL_GROWTH = 3
const INITIAL_DISTANCE = 1


export function buildBasinModel(context) {
    const { rect, chunkSize } = context
    const model = {}
    // map basin type for creating rivers or other features
    model.type = new Map()
    // grid of erosion direction ids
    model.erosion = Grid.fromRect(rect, () => Direction.random().id)
    // random joint value to connect chunks
    // choose a value at chunk sides, avoiding edges
    model.joint = Grid.fromRect(rect, () => Random.int(2, chunkSize - 3))
    // the walk distance of each basin starting from shore
    // Initial value 1 is used to determine river stretch
    model.distance = Grid.fromRect(rect, () => INITIAL_DISTANCE)
    // map a point to a basin chunk direction bitmask
    model.directionBitmap = new DirectionBitMaskGrid(rect)
    // map a point to a basin chunk corner connections (for diagonals)
    // used to detect erosion/channels passing on neighbor diagonals
    model.riverCornerBitmap = new DirectionBitMaskGrid(rect)
    model.waterCornerBitmap = new DirectionBitMaskGrid(rect)
    // mark which direction has a river (N, SE, W...)
    // model.erosionRiverMap = new Map()
    model.basin = Grid.fromRect(rect, () => NO_BASIN_ID)
    const { landBorders, waterBorders } = detectBorders(context)
    // init grid of basin ids
    buildBasinGrid(context, landBorders, waterBorders, model)
    // mark chunk paths from river sources
    model.river = buildRiverModel(context, model)
    return model
}


function detectBorders(context) {
    const { world, rect } = context
    const landBorders = []
    const waterBorders = []
    Grid.fromRect(rect, point => {
        // Prepare data for flood fill at each point
        if(! world.surface.isBorder(point)) return
        const borders = world.surface.isLand(point) ? landBorders : waterBorders
        borders.push(point)
    })
    return { landBorders, waterBorders }
}


function buildBasinGrid(context, landBorders, waterBorders, model) {
    const { world, rect } = context
    const surveyMap = new Map()
    const landFillMap = new Map()
    const waterFillMap = new Map()
    let basinId = 0
    for (let border of landBorders) {
        const survey = surveyNeighbors(context, border)
        const type = detectLandBasinType(world, survey)
        surveyMap.set(basinId, survey)
        model.type.set(basinId, type.id)
        landFillMap.set(basinId, { origin: border })
        basinId++
    }
    for (let border of waterBorders) {
        const type = OceanBasin
        model.type.set(basinId, type.id)
        waterFillMap.set(basinId, { origin: border, type })
        basinId++
    }
    // Start flood fills from each border, both land && water
    const fillContext = { ...context, model, surveyMap }
    new LandBasinFill(rect, landFillMap, fillContext).complete()
    new WaterBasinFill(rect, waterFillMap, fillContext).complete()
}


function buildRiverBase(context, model) {
    const { rect, world } = context
    const riverSources = []
    // discover the river sources while building the river grid
    const riverGrid = Grid.fromRect(rect, point => {
        const rainsEnough = world.rain.canCreateRiver(point)
        const isDivide = model.directionBitmap.get(point).length === 1
        if (isDivide && rainsEnough) {
            riverSources.push(point)
        }
        return null
    })
    return { riverGrid, riverSources }
}


function surveyNeighbors(context, point) {
    // point is on land
    const { world } = context
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
    return { oppositeBorder, waterNeighbors }
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

