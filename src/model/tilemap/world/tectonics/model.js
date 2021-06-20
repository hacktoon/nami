import { PairMap } from '/lib/base'
import { Random } from '/lib/base/random'
import { MultiFill, FloodFillConfig } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { Direction } from '/lib/base/direction'
import { SimplexNoise } from '/lib/fractal/noise'

import { RegionGroupTileMap } from '/model/tilemap/regiongroup'
import { Boundary } from './boundary'


const TYPE_OCEANIC = 'O'
const TYPE_CONTINENTAL = 'C'


export class Plate {
    constructor(id, origin, type, area) {
        this.id = id
        this.type = type
        this.area = area
        this.origin = origin
        this.direction = Direction.random()
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
        this.plates = data.plates
        this.stressLevels = data.stressLevels
        this.boundaries = data.boundaries
    }

    _build(seed, params) {
        const regionGroupTileMap = this._buildRegionGroupMap(seed, params)
        const plates = this._buildPlates(regionGroupTileMap)
        const borderRegions = regionGroupTileMap.getBorderRegions()
        const boundaryMap = new BoundaryMap(plates, regionGroupTileMap)
        const boundaries = new Map()
        const stressLevels = new Map()
        const visitedRegions = new Set()
        const fills = borderRegions.map(region => {
            const group = regionGroupTileMap.getGroupByRegion(region)
            const fillConfig = new BoundaryRegionFillConfig({
                id: group.id,
                boundaries,
                boundaryMap,
                stressLevels,
                regionGroupTileMap,
                visitedRegions,
                plates,
            })
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills)
        // leave noise map for final matrix rendering
        // const noiseMap = new NoiseMap()

        return {regionGroupTileMap, plates, boundaries, stressLevels}
    }

    _buildRegionGroupMap(seed, params) {
        return RegionGroupTileMap.fromData({
            width: params.get('width'),
            height: params.get('height'),
            seed: seed,
            groupScale: params.get('scale'),
            groupGrowth: params.get('growth'),
            groupChance: 0.1,
            scale: 2,
            growth: 0,
            chance: 0.1,
        })
    }

    _buildPlates(regionGroupTileMap) {
        const plates = new Map()
        const cmpDescendingCount = (g0, g1) => g1.count - g0.count
        const groups = regionGroupTileMap.getGroups().sort(cmpDescendingCount)
        const halfWorldArea = Math.floor(regionGroupTileMap.area / 2)
        let totalOceanicArea = 0
        groups.forEach(group => {
            totalOceanicArea += group.area
            const isOceanic = totalOceanicArea < halfWorldArea
            const type = isOceanic ? TYPE_OCEANIC : TYPE_CONTINENTAL
            const plate = new Plate(group.id, group.origin, type, group.area)
            plates.set(plate.id, plate)
        })
        return plates
    }

    map(callback) {
        return Array.from(this.plates.values()).map(plate => callback(plate))
    }

    forEach(callback) {
        this.plates.forEach(callback)
    }
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


class BoundaryRegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.id = data.id
        this.data = data

        this.energy = data.plates.get(data.id).speed
        this.chance = .5
        this.growth = 2
    }

    isEmpty(region) {
        return !this.data.visitedRegions.has(region.id)
    }

    setValue(region, level) {
        this.data.visitedRegions.add(region.id)
        this.data.stressLevels.set(region.id, level)
    }

    checkNeighbor(neighborRegion, region) {
        if (this.isEmpty(neighborRegion)) return
        const neighborGroup = this.data.regionGroupTileMap.getGroupByRegion(neighborRegion)
        if (neighborGroup.id === this.id) {
            if (this.data.boundaries.has(region.id) && this.energy > 0) {
                const boundary = this.data.boundaries.get(region.id)
                this.energy--
                this.data.boundaries.set(neighborRegion.id, boundary)
            }
        } else {
            const boundary = this.data.boundaryMap.get(region, neighborRegion)
            this.data.boundaries.set(region.id, boundary)
        }
    }

    getNeighbors(region) {
        return this.data.regionGroupTileMap.getNeighborRegions(region)
    }
}


class BoundaryMap {
    constructor(plates, regionGroups) {
        this.plates = plates
        this.regionGroups= regionGroups
    }

    get(region, neighborRegion) {
        const rgrp = this.regionGroups
        const group = rgrp.getGroupByRegion(region)
        const neighborGroup = rgrp.getGroupByRegion(neighborRegion)
        return this.getGroupBoundary(group, neighborGroup)
    }

    getGroupBoundary(group, neighborGroup) {
        const rgrp = this.regionGroups
        const plate = this.plates.get(group.id)
        const otherPlate = this.plates.get(neighborGroup.id)
        const dirToNeighbor = rgrp.getGroupDirection(group, neighborGroup)
        const dirFromNeighbor = rgrp.getGroupDirection(neighborGroup, group)
        // calc the dot product for each plate direction to another
        const dotTo = Direction.dotProduct(plate.direction, dirToNeighbor)
        const dotFrom = Direction.dotProduct(otherPlate.direction, dirFromNeighbor)
        return this._buildBoundary(plate, otherPlate, dotTo, dotFrom)
    }

    _buildBoundary(plate, otherPlate, dotTo, dotFrom) {
        if (dotTo > 0 && dotFrom > 0) {
            return this._buildConvergentBoundary(plate, otherPlate)
        }
        if (dotTo < 0 && dotFrom < 0) {
            return this._buildDivergentBoundary(plate, otherPlate)
        }
        return this._buildTransformBoundary(plate, otherPlate)
    }

    _buildConvergentBoundary(plate, otherPlate) {
        if (plate.isContinental()) {
            if (otherPlate.isContinental())
                return Boundary.OROGENY
            else
                return Boundary.OROGENY
        } else {
            if (otherPlate.isContinental())
                return Boundary.OCEANIC_TRENCH
            return Boundary.OCEANIC_RIFT
        }
    }

    _buildDivergentBoundary(plate, otherPlate) {
        if (plate.isContinental()) {
            return Boundary.PASSIVE_MARGIN
        }
        return Boundary.OCEANIC_RIFT
    }

    _buildTransformBoundary(plate, otherPlate) {
        if (plate.isContinental()) {
            return Boundary.TRANSFORM_FAULT
        }
        return Boundary.OCEANIC_FAULT
    }
}
