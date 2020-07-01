import { repeat } from '/lib/function'
import { Random } from '/lib/random'
import { OrganicFill } from '/lib/flood-fill'
import { RegionGrid } from '/lib/grid/region'
import { Region } from './region'
import { RegionMapImage } from './image'
import { Schema } from '/lib/schema'


const SPEC = [
    {
        type: "number",
        name: "width",
        label: "Width",
        value: 200,
    },
    {
        type: "number",
        name: "height",
        label: "Height",
        value: 150,
    },
    {
        type: "number",
        name: "count",
        label: "Count",
        value: 8,
    },
    {
        type: "number",
        name: "layerGrowth",
        label: "Layer growth",
        value: 40,
        step: 1,
        min: 1
    },
    {
        type: "number",
        name: "growthChance",
        label: "Growth chance",
        value: 0.1,
        step: 0.2,
        min: 0.01
    },
    {
        type: "text",
        name: "seed",
        label: "Seed",
        value: '',
        sanitize: value => value.length ? value : Number(new Date())
    }
]


export class RegionMap {
    static schema = new Schema(SPEC)

    constructor(regions, grid, config) {
        this.width = config.width
        this.height = config.height
        this.regions = regions
        this.grid = grid
        this.seed = config.seed
        this.image = new RegionMapImage(this)
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


export function createRegionMap(config) {
    Random.seed = config.seed
    const grid = new RegionGrid(config.width, config.height)
    const points = createPoints(config.count, config.width, config.height)
    const regions = createRegions(points, grid, config.layerGrowth, config.growthChance)

    while(grid.hasEmptyPoints()) {
        regions.forEach(region => region.grow())
    }

    return new RegionMap(regions, grid, config)
}


function createPoints(count, width, height) {
    return repeat(count, () => Point.random(width, height))
}


function createRegions(points, grid, layerGrowth, growthChance) {
    return points.map((origin, id) => {
        const organicFill = createOrganicFill({
            id, origin, grid, layerGrowth, growthChance
        })
        // TODO: remove fill from region args
        return new Region(id, origin, organicFill)
    })
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