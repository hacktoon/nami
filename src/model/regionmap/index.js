import { RandomPointDistribution } from '/lib/point/distribution'
import { BaseMap } from '/model/lib/map'

import { OrganicFill } from '/lib/flood-fill'
import { Schema, Type } from '/lib/schema'

import { Region } from './region'
import { RegionGrid } from './grid'
import { MapDiagram } from './diagram'


export default class RegionMap extends BaseMap {
    static id = 'RegionMap'

    static schema = new Schema(
        Type.number('width', 'Width', 200, {step: 1, min: 1}),
        Type.number('height', 'Height', 150, {step: 1, min: 1}),
        Type.number('count', 'Count', 12, {step: 1, min: 1}),
        Type.number('layerGrowth', 'Layer growth', 30, {step: 1, min: 1}),
        Type.number('growthChance', 'Growth chance', 0.1, {step: 0.01, min: 0.01}),
        Type.text('seed', 'Seed', '')
    )
    static diagram = MapDiagram

    static create(params) {
        return new RegionMap(params)
    }

    static fromData(data) {
        const params = new Map(Object.entries(data))
        return new RegionMap(params)
    }

    constructor(params) {
        super(params)
        this.grid = new RegionGrid(this.width, this.height)
        this.regions = createRegions(this.grid, params)
        createDistanceField(this.grid, this.regions)
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

function createDistanceField(grid, regions) {
    //const borders = regions.map(region => region.borders)
}

function createRegions(grid, config) {
    const points = RandomPointDistribution.create(
        config.get('count'),
        config.get('width'),
        config.get('height')
    )
    const regions = points.map((origin, id) => new Region(id, origin))
    const fillerMap = createFillMap(regions, grid, config)

    while(grid.hasEmptyPoints()) {
        regions.forEach(region => {
            const points = fillerMap.get(region.id).fill()
            region.grow(points)
        })
    }
    return regions
}


function createFillMap(regions, grid, config){
    const layerGrowth = config.get('layerGrowth')
    const growthChance = config.get('growthChance')
    const entries = regions.map(region => {
        const params = {region, grid, layerGrowth, growthChance}
        return [region.id, createOrganicFill(params)]
    })
    return new Map(entries)
}

function createOrganicFill(params){
    const {region, grid, layerGrowth, growthChance} = params
    return new OrganicFill(region.origin, {
        setBorder:  (point, neighbor) => grid.setBorder(point, neighbor),
        setOrigin:  point => grid.setOrigin(point),
        setSeed:    point => grid.setSeed(point, region.id),
        setValue:   point => grid.setValue(point, region.id),
        setLayer:   (point, layer) => grid.setLayer(point, layer),
        isEmpty:    point => grid.isEmpty(point),
        isSeed:     point => grid.isSeed(point, region.id),
        isBlocked:  point => grid.isBlocked(point, region.id),
        layerGrowth,
        growthChance,
    })
}