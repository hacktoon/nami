import { Random } from '/lib/random'
import { PairMap } from '/lib/map'
import { Direction } from '/lib/direction'
import { Point } from '/lib/point'

import { Feature, TectonicsTable } from './table'


export class BoundaryModel {
    /*
        Reads the boundary table and build boundary data relative to plates.
        Converts boundary code like 'LLCT' to its numeric id, summing
        each character value.
    */

    #tectonicsTable
    #plateModel
    #surfaceModel
    #provinceMap
    #centralProvinceMap = new Map()

    constructor(regionTileMap, tectonicsTable, plateModel, surfaceModel) {
        this.#plateModel = plateModel
        this.#surfaceModel = surfaceModel
        this.#tectonicsTable = tectonicsTable
        this.#provinceMap = this._buildProvinceMap(regionTileMap)
    }

    getProvince(region, sideRegion) {
        return this.#provinceMap.get(region, sideRegion)
    }

    getCentralProvince(region) {
        const id = this.#centralProvinceMap.get(region)
        let options
        if (this.#plateModel.isOceanic(region)) {
            options = [
                Feature.TRENCH,
                Feature.OCEANIC_PLAIN,
            ]
        } else {
            options = [
                Feature.MOUNTAIN,
                Feature.PLATFORM,
                Feature.PLAIN,
                Feature.DEPRESSION,
                Feature.RIFT_SEA,
                Feature.HILL,
            ]
        }
        const feature = Random.choiceFrom(options)
        return this.#tectonicsTable.getCentralProvince(id, feature)
    }

    _buildProvinceMap(regionTileMap) {
        const provinceMap = new PairMap()
        let provinceId = 0
        for(let region of regionTileMap.getRegions()) {
            const origin = regionTileMap.getOriginById(region)
            for(let sideRegion of regionTileMap.getSideRegions(region)) {
                let sideOrigin = regionTileMap.getOriginById(sideRegion)
                sideOrigin = regionTileMap.rect.unwrapFrom(origin, sideOrigin)
                const params = {region, sideRegion, origin, sideOrigin}
                const boundary = this._getBoundary(params)
                const province = this._buildProvince(region, sideRegion, boundary)
                const provinceData = {...province, id: provinceId++}
                provinceMap.set(region, sideRegion, provinceData)
            }
            // for each region's central province, set its id
            this.#centralProvinceMap.set(region, provinceId++)
        }
        return provinceMap
    }

    _getBoundary({region, sideRegion, origin, sideOrigin}) {
        const dirToSide = this._getDirection(origin, sideOrigin)
        const dirFromSide = this._getDirection(sideOrigin, origin)
        const plateDir = this.#plateModel.getDirection(region)
        const sidePlateDir = this.#plateModel.getDirection(sideRegion)
        const dotTo = Direction.dotProduct(plateDir, dirToSide)
        const dotFrom = Direction.dotProduct(sidePlateDir, dirFromSide)
        const directionTo = this._parseDir(dotTo)
        const directionFrom = this._parseDir(dotFrom)
        const type1 = this.#plateModel.isOceanic(region)
            ? TectonicsTable.PLATE_OCEANIC
            : TectonicsTable.PLATE_CONTINENTAL
        const type2 = this.#plateModel.isOceanic(sideRegion)
            ? TectonicsTable.PLATE_OCEANIC
            : TectonicsTable.PLATE_CONTINENTAL
        const id = type1 + type2 + directionTo + directionFrom
        return this.#tectonicsTable.getBoundary(id)
    }

    _getDirection(origin, sideOrigin) {
        const angle = Point.angle(origin, sideOrigin)
        return Direction.fromAngle(angle)
    }

    _parseDir(dir) {
        if (dir === 0)
            return TectonicsTable.DIR_TRANSFORM
        return dir > 0 ? TectonicsTable.DIR_CONVERGE : TectonicsTable.DIR_DIVERGE
    }

    _buildProvince(region, sideRegion, boundary) {
        const plateWeight = this.#plateModel.getWeight(region)
        const sidePlateWeight = this.#plateModel.getWeight(sideRegion)
        const [heavier, lighter] = boundary.provinces
        return plateWeight > sidePlateWeight ? heavier : lighter
    }
}
