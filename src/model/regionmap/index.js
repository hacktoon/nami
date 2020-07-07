import { repeat } from '/lib/function'
import { Random } from '/lib/random'
import { OrganicFill } from '/lib/flood-fill'
import { Region } from './region'
import { RegionGrid } from './grid'

// typology
import { Schema } from '/lib/schema'


const SCHEMA = new Schema(
    Schema.number("Width", 200),
    Schema.number("Height", 150),
    Schema.number("Count", 8),
    Schema.number("Layer growth", 40, {step: 1, min: 1}),
    Schema.number("Growth chance", 0.1, {step: 0.01, min: 0.01}),
    Schema.seed("Seed", '')
)


export class RegionMap {
    static schema = SCHEMA

    static create(data) {
        const config = RegionMap.schema.parse(data)
        Random.seed = config.seed
        const grid = new RegionGrid(config.width, config.height)
        const points = createPoints(config.count, config.width, config.height)
        const regions = createRegions(points, grid, config.layerGrowth, config.growthChance)
        return new RegionMap(regions, grid, config)
    }

    constructor(regions, grid, config) {
        this.seed = config.seed
        this.width = config.width
        this.height = config.height
        this.regions = regions
        this.grid = grid
    }

    get(point) {
        const id = this.grid.get(point).value
        return this.regions[id]
    }

    isOrigin(point) {
        return this.grid.isOrigin(point)
    }

    isSeed(point, value) {
        if (this.isEmpty(point))
            return false
        return this.grid.isSeed(point, value)
    }

    isEmpty(point) {
        return this.grid.isEmpty(point)
    }

    isBorder(point) {
        return this.grid.isBorder(point)
    }

    getLayer(point) {
        return this.grid.getLayer(point)
    }

    isLayer(point, layer) {
        return this.grid.isLayer(point, layer)
    }

    isOverLayer(point, layer) {
        return this.getLayer(point) > layer
    }
}


// FUNCTIONS ===================================

function createPoints(count, width, height) {
    return repeat(count, () => Point.random(width, height))
}


function createRegions(points, grid, layerGrowth, growthChance) {
    const regions = points.map((origin, id) => {
        const organicFill = createOrganicFill({
            id, origin, grid, layerGrowth, growthChance
        })
        // TODO: remove fill from region args
        return new Region(id, origin, organicFill)
    })
    while(grid.hasEmptyPoints()) {
        regions.forEach(region => region.grow())
    }
    return regions
}


function createOrganicFill({
        id,
        origin,
        grid,
        layerGrowth,
        growthChance
    }) {
    return new OrganicFill(origin, {
        setBorder:  point => grid.setBorder(point),
        setOrigin:  point => grid.setOrigin(point),
        setSeed:    point => grid.setSeed(point, id),
        setValue:   point => grid.setValue(point, id),
        setLayer:   (point, layer) => grid.setLayer(point, layer),
        isEmpty:    point => grid.isEmpty(point),
        isSeed:     point => grid.isSeed(point, id),
        isBlocked:  point => grid.isBlocked(point, id),
        layerGrowth,
        growthChance,
    })
}