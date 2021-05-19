import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'

import { TectonicsModel } from './model'
import { TectonicsTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'TectonicsTileMap',
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 36, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 32, step: 1, min: 1, max: 100}),
    Type.text('seed', 'Seed', {default: ''})
)


export class TectonicsTileMap extends TileMap {
    static id = 'TectonicsTileMap'
    static diagram = TectonicsTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new TectonicsTileMap(params)
    }

    constructor(params) {
        super(params)
        this.model = new TectonicsModel(this.seed, params)
    }

    get(point) {
        const plate = this.getPlate(point)
        const deformation = this.getDeformation(point)
        const neighborGroups = this.model.getNeighborGroups(point)
        return `Plate ${plate.id}, area ${plate.area},
            type ${plate.type},
            neighborGroups ${neighborGroups.map(g=>g.id).join(', ')},
            deformation ${deformation}`
    }

    getPlateCount() {
        return this.model.getPlateCount()
    }

    getPlate(point) {
        return this.model.getPlate(point)
    }

    getGeology(point) {
        return this.model.getGeology(point)
    }

    isPlateBorder(point) {
        return this.model.isPlateBorder(point)
    }

    getDeformation(point) {
        return this.model.getDeformation(point)
    }

    map(callback) {
        return this.model.map(plate => callback(plate))
    }

    forEach(callback) {
        this.model.forEach(callback)
    }
}

// _buildLayerMap(params) {
//     const borderRegions = this.model.getRegionsAtBorders()
//     const floodFills = borderRegions.map(region => {
//         const fillConfig = new RegionLayerFillConfig({
//             groupChance: params.get('groupChance'),
//             groupGrowth: params.get('groupGrowth'),
//             model: this.model,
//             region
//         })
//         return new OrganicFloodFill(region, fillConfig)
//     })
//     new MultiFill(floodFills).fill()
// }

// export class RegionLayerFillConfig {
//     constructor(params) {
//         this.chance = 0.01
//         this.growth = 30
//         this.currentRegion = params.region
//         this.model = params.model
//     }

//     isEmpty(region) {
//         return ! this.model.hasRegionLayer(region)
//     }

//     setValue(region, layer) {
//         this.model.setRegionLayer(region, layer)
//     }

//     checkNeighbor(neighborRegion, region) {
//         // if (! this.isEmpty(neighborRegion)) return
//         // if (this.model.hasParentLayerRegion(neighborRegion)) return
//         // this.model.setParentLayerRegion(neighborRegion, region)
//     }

//     getNeighbors(region) {
//         return this.model.regionTileMap.getNeighborRegions(region)
//     }
// }
