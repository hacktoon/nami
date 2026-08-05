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
    // init grid of basin ids
    const borders = detectBorders(context)
    model.basin = buildBasinGrid(context, model, borders)
    // mark chunk paths from river sources
    model.river = buildRiverModel(context, model)
    return model
}


function detectBorders(context) {
    const { world, rect } = context
    const land = []
    const water = []
    // detect land/water borders
    const grid = Grid.fromRect(rect, point => {
        const isBorder = world.surface.isBorder(point)
        const isWater = world.surface.isWater(point)
        let landBorder = null
        let waterBorder = null
        // detect borders by type, the last ones are chosen
        if (isBorder) {
            for (let border of Point.adjacents(point)) {
                if (world.surface.isWater(border)) {
                    waterBorder = border
                } else {
                    landBorder = border
                }
            }
        }
        if (isBorder && isWater) {
            water.push({ point, landBorder })
        }
        if (isBorder && !isWater) {
            land.push({ point, waterBorder })
        }
        return NO_BASIN_ID
    })
    return { land, water }
}


function buildBasinGrid(context, model, borders) {
    const { world, rect } = context
    const landFillMap = new Map()
    const waterFillMap = new Map()
    let basinId = 0
    for (let {point, waterBorder} of borders.land) {
        const type = detectBasinType(context, point)
        model.type.set(basinId, type.id)
        landFillMap.set(basinId, { origin: point })
        basinId++
    }
    for (let {point, landBorder} of borders.water) {
        const type = OceanBasin
        model.type.set(basinId, type.id)
        waterFillMap.set(basinId, { origin: point })
        basinId++
    }
    const basinGrid = Grid.fromRect(rect, () => NO_BASIN_ID)
    const fillContext = { ...context, model, basinGrid }
    // Start flood fills from each border, both land && water
    new LandBasinFill(rect, landFillMap, fillContext).complete()
    new WaterBasinFill(rect, waterFillMap, fillContext).complete()
    return basinGrid
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


function detectBasinType(context, waterBorder) {
    const { world } = context
    if (world.surface.isLake(waterBorder)) {
        return EndorheicLakeBasin
    }
    if (world.surface.isSea(waterBorder)) {
        return EndorheicSeaBasin
    }
    return ExorheicBasin
}
