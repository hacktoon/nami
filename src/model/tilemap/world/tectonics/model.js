import { Color } from '/lib/base/color'
import { SimplexNoise } from '/lib/fractal/noise'

import { RegionGroupTileMap } from '/model/tilemap/regiongroup'
import { buildGeoMatrix } from './matrix'

/*
TODO
- make different map for platform and continent
- need to get regions data to create the elevation map in borders
*/

const NO_DEFORMATION = null
export const DEFORMATION_OROGENY = 1
export const DEFORMATION_TRENCH = 2
export const DEFORMATION_RIFT = 3

const EMPTY = null

const TYPE_OCEANIC = 'O'
const TYPE_CONTINENTAL = 'C'


export class Plate {
    constructor(id, type, area) {
        this.id = id
        this.type = type
        this.area = area
        this.color = new Color()
    }

    isOceanic() {
        return this.type === TYPE_OCEANIC
    }

    isContinental() {
        return this.type === TYPE_CONTINENTAL
    }
}


export class TectonicsModel {
    constructor(seed, params) {
        const data = this._build(seed, params)
        this.regionGroupTileMap = data.regionGroupTileMap
        this.deformations = data.deformations
        this.plates = data.plates
    }

    _build(seed, params) {
        const regionGroupTileMap = buildRegionGroupMap(seed, params)
        const plates = this._buildPlates(regionGroupTileMap)
        const deformations = this._buildPlateDeformations(plates, regionGroupTileMap)

        // leave noise map for final matrix rendering
        // const noiseMap = new NoiseMap()

        return {regionGroupTileMap, plates, deformations}
    }

    _buildPlates(regionGroupTileMap) {
        const plates = new Map()
        const groups = regionGroupTileMap.getGroupsDescOrder()
        const halfRegionCount = Math.floor(regionGroupTileMap.area / 2)
        let oceanicArea = 0
        groups.forEach(group => {
            oceanicArea += group.area
            let type = oceanicArea < halfRegionCount ? TYPE_OCEANIC : TYPE_CONTINENTAL
            const plate = new Plate(group.id, type, group.area)
            plates.set(plate.id, plate)
        })
        return plates
    }

    _buildPlateDeformations(plates, regionGroupTileMap) {
        const graph = regionGroupTileMap.getGraph()
        const deformations = new Map()
        plates.forEach(plate => {
            const neighborMap = new Map()
            graph.getEdges(plate.id).forEach(id => {
                const neighborPlate = plates.get(id)
                const deformation =this._buildDeformation(plate, neighborPlate)
                neighborMap.set(neighborPlate.id, deformation)
            })
            deformations.set(plate.id, neighborMap)
        })
        return deformations
    }

    _buildDeformation(plate, neighborPlate) {
        if (neighborPlate.id % 3 === 0)
            return DEFORMATION_RIFT
        if (neighborPlate.id % 2 === 0)
            return DEFORMATION_OROGENY
        return DEFORMATION_TRENCH
    }

    getPlateCount() {
        return this.plates.size
    }

    getPlate(point) {
        const group = this.regionGroupTileMap.getGroup(point)
        return this.plates.get(group.id)
    }

    getGeology(point) {
        const group = this.regionGroupTileMap.getGroup(point)
        const plate = this.plates.get(group.id)
        return plate.isOceanic() ? 0 : 1
    }

    isPlateBorder(point) {
        return this.regionGroupTileMap.isGroupBorderPoint(point)
    }

    getNeighborGroups(point) {
        return this.regionGroupTileMap.getNeighborGroups(point)
    }

    getDeformation(point) {
        const region = this.regionGroupTileMap.getRegion(point)
        const group = this.regionGroupTileMap.getGroup(point)
        const neighborRegions = this.regionGroupTileMap.getNeighborRegions(region)
        const neighborGroups = this.regionGroupTileMap.getGroupsForRegions(neighborRegions)
        const plateDeformations = this.deformations.get(group.id)
        for (let neighborGroup of neighborGroups) {
            if (neighborGroup.id !== group.id) {
                return plateDeformations.get(neighborGroup.id)
            }
        }
        return NO_DEFORMATION
    }

    map(callback) {
        return Array.from(this.plates.values()).map(callback)
    }

    forEach(callback) {
        this.plates.forEach(callback)
    }
}


function buildRegionGroupMap(seed, params) {
    return RegionGroupTileMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        seed: seed,
        groupScale: params.get('scale'),
        groupChance: 0.1,
        groupGrowth: params.get('growth'),
        scale: 2,
        growth: 0,
        chance: 0.1,
    })
}


class NoiseMap {
    constructor() {
        this.default = new SimplexNoise(6, 0.8, 0.02)
        this.coast   = new SimplexNoise(7, 0.6, 0.04)
    }

    get(point) {
        return this.default.get(point)
    }

    getCoast(point) {
        return this.coast.get(point)
    }
}

