import { repeat } from '/lib/function'
import { Random } from '/lib/random'
import { Point } from '/lib/point'
import { OrganicFill } from '/lib/flood-fill'
import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'

import { Region } from './region'
import { RegionGrid } from './grid'
import { Diagram } from './diagram'


export default class RegionMap {
    static meta = new MetaClass(
        Type.number("Width", 200),
        Type.number("Height", 150),
        Type.number("Count", 8),
        Type.number("Layer growth", 40, {step: 1, min: 1}),
        Type.number("Growth chance", 0.1, {step: 0.01, min: 0.01}),
        Type.seed("Seed", '')
    )
    static Diagram = Diagram

    static create(data) {
        const config = RegionMap.meta.parseConfig(data)
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
        this.config = {...config, seed: ''} // FIXME: abstract this on meta
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