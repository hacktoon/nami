import { Grid } from '/src/lib/grid'
import { Direction } from '/src/lib/math/direction'
import { Random } from '/src/lib/random'
import { Point } from '/src/lib/math/point'
import {
    DirectionBitMaskGrid,
    PointDirectionBitMaskMap
} from '/src/lib/bitmask'

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
    // grid of erosion direction ids
    model.erosion = Grid.fromRect(rect, () => Direction.random().id)
    // random joint value to connect chunks
    // choose a value at chunk sides, avoiding edges
    model.joint = Grid.fromRect(rect, () => Random.int(2, chunkSize - 3))
    // the walk distance of each basin starting from shore
    // Initial value 1 is used to determine river stretch
    model.distance = Grid.fromRect(rect, () => INITIAL_DISTANCE)
    // map a point to a basin chunk direction bitmask
    model.erosionDirectionBitmask = new DirectionBitMaskGrid(rect)
    // map a point to a basin chunk corner connections (for diagonals)
    // used to detect erosion/channels passing on neighbor diagonals
    // init grid of basin base information
    const basins = initBasins(context)
    model.type = buildTypeMap(context, basins)
    model.basin = buildBasinGrid(context, model, basins)
    // mark a point to direction bitmask (N, SE, W...) marking as river
    model.riverDirectionMap = new PointDirectionBitMaskMap(rect)
    // mark chunk paths from river sources
    model.river = buildRiverModel(context, model)
    return model
}


function initBasins(context) {
    const { world, rect } = context
    const basins = []
    let basinId = 0
    // detect land/water borders
    Grid.fromRect(rect, point => {
        if (!world.surface.isBorder(point))
            return
        let type, opposite
        const isLand = world.surface.isLand(point)
        for (let sidePoint of Point.adjacents(point)) {
            const landWater = isLand && world.surface.isWater(sidePoint)
            const waterLand = !isLand && world.surface.isLand(sidePoint)
            if (landWater || waterLand) {
                opposite = sidePoint
                break
            }
        }
        basins.push({ basinId, point, opposite })
        basinId++
    })
    return basins
}


function buildTypeMap(context, basins) {
    const { world } = context
    const typeMap = new Map()
    for (let { basinId, point, opposite } of basins) {
        let type
        // detect type by border, the last ones are chosen
        if (world.surface.isLand(point)) {
            type = ExorheicBasin
            if (world.surface.isLake(opposite)) type = EndorheicLakeBasin
            if (world.surface.isSea(opposite)) type = EndorheicSeaBasin
        } else {
            type = OceanBasin
        }
        typeMap.set(basinId, type.id)
    }
    return typeMap
}


function buildBasinGrid(context, model, basins) {
    const { world, rect } = context
    const landFillMap = new Map()
    const waterFillMap = new Map()
    for (let { basinId, point, opposite } of basins) {
        const fillData = { origin: point, opposite }
        if (world.surface.isLand(point)) {
            landFillMap.set(basinId, fillData)
        } else {
            waterFillMap.set(basinId, fillData)
        }
    }
    const basinGrid = Grid.fromRect(rect, point => NO_BASIN_ID)
    const fillContext = { ...context, model, basinGrid }
    // Start flood fills from each border, both land && water
    new LandBasinFill(rect, landFillMap, fillContext).complete()
    new WaterBasinFill(rect, waterFillMap, fillContext).complete()
    return basinGrid
}
