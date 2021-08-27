import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'
import { RegionGroupTileMap } from '/model/tilemap/regiongroup'

import { GeologyTileMapDiagram } from './diagram'
import { PlateModel } from './plate'
import { ErosionModel } from './erosion'


const ID = 'GeologyTileMap'
const SCHEMA = new Schema(
    ID,
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 20, step: 1, min: 1, max: 100}),
    Type.number('growth', 'Growth', {default: 40, step: 1, min: 1, max: 100}),
    Type.text('seed', 'Seed', {default: ''})
)


export class GeologyTileMap extends TileMap {
    static id = ID
    static diagram = GeologyTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new GeologyTileMap(params)
    }

    constructor(params) {
        super(params)
        const start = performance.now()
        this.reGroupTileMap = this._buildRegionGroupMap(this.seed, params)
        console.log('region group', Math.floor(performance.now() - start) / 1000)
        this.plateModel = new PlateModel(this.reGroupTileMap)
        console.log('plate model', Math.floor(performance.now() - start) / 1000)
        this.erosionModel = new ErosionModel(this.reGroupTileMap, this.plateModel)
        console.log('erosion model', Math.floor(performance.now() - start) / 1000)
    }

    _buildRegionGroupMap(seed, params) {
        return RegionGroupTileMap.fromData({
            width: params.get('width'),
            height: params.get('height'),
            groupScale: params.get('scale'),
            groupGrowth: params.get('growth'),
            groupChance: .1,
            seed: seed,
            chance: .1,
            growth: 0,
            scale: 1,
        })
    }

    get(point) {
        const plate = this.getPlate(point)
        const region = this.reGroupTileMap.getRegion(point)
        const landform = this.getLandform(point)
        const boundary = this.plateModel.getBoundary(region.id)
        const eroded = this.getErodedLandform(point)
        return [
            `point: ${point.hash}`,
            `, plate: ${plate.id}, region: ${region.id}@${region.origin.hash}`,
            `, boundary: ${boundary.name}`,
            `, landform: ${eroded.name} (was ${landform.name})`
        ].join('')
    }

    getPlate(point) {
        const group = this.reGroupTileMap.getGroup(point)
        return this.plateModel.get(group.id)
    }

    isPlateOrigin(plate, point) {
        // TODO: eliminate this dependency
        const matrix = this.reGroupTileMap.regionTileMap.regionMatrix
        return plate.origin.equals(matrix.wrap(point))
    }

    isPlateBorder(point) {
        return this.reGroupTileMap.isGroupBorder(point)
    }

    getLandform(point) {
        return this.erosionModel.get(point)
    }

    getErodedLandform(point) {
        return this.erosionModel.getErodedLandform(point)
    }

    getDescription() {
        return `${this.plateModel.size} plates`
    }
}
