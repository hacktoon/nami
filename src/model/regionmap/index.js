import { Random } from '/lib/random'
import {
    RandomPointDistribution,
    EvenPointDistribution
} from '/lib/point/distribution'

import { OrganicFill } from '/lib/flood-fill'
import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'

import { Region } from './region'
import { RegionGrid } from './grid'
import { Diagram } from './diagram'


export default class RegionMap {
    static meta = new MetaClass(
        Type.number("Width", 200, {step: 1, min: 1}),
        Type.number("Height", 150, {step: 1, min: 1}),
        Type.number("Count", 80, {step: 1, min: 1}),
        Type.number("Layer growth", 40, {step: 1, min: 1}),
        Type.number("Growth chance", 0.1, {step: 0.01, min: 0.01}),
        Type.seed("Seed", '')
    )
    static Diagram = Diagram

    static create(data) {
        const config = RegionMap.meta.parseConfig(data)
        const {width, height, count, seed, layerGrowth, growthChance} = config
        Random.seed = seed
        const grid = new RegionGrid(width, height)
        const points = EvenPointDistribution.create(count, width, height)
        const regions = createRegions(points, grid, layerGrowth, growthChance)
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

function createRegions(points, grid, layerGrowth, growthChance) {
    const fillerMap = {}
    const regions = points.map((origin, id) => {
        fillerMap[id] = createOrganicFill({
            id, origin, grid, layerGrowth, growthChance
        })
        return new Region(id, origin)
    })

    while(grid.hasEmptyPoints()) {
        regions.forEach(region => {
            const points = fillerMap[region.id].fill()
            region.grow(points)
        })
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
        setBorder:  (point, neighbor) => grid.setBorder(point, neighbor),
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