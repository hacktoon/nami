import { PairMap } from '/lib/map'
import { Direction } from '/lib/direction'
import { Point } from '/lib/point'
import { Random } from '/lib/random'

import { TectonicsTable } from './table'


export class BoundaryModel {
    /*
        Reads the boundary table and build boundary data relative to plates.
        Converts boundary code like 'LLCT' to its numeric id, summing
        each character value.
    */

    #tectonicsTable
    #plateModel
    #provinceMap
    #centralProvinceMap = new Map()

    constructor(regionTileMap, tectonicsTable, plateModel) {
        this.#plateModel = plateModel
        this.#tectonicsTable = tectonicsTable
        this.#provinceMap = this._buildProvinceMap(regionTileMap)
    }

    getProvince(region, sideRegion) {
        return this.#provinceMap.get(region, sideRegion)
    }

    getCentralProvince(region) {
        const provinceId = this.#centralProvinceMap.get(region)
        return {
                id: provinceId,
                feature: 'Central province',
                range: [Random.chance(.5) ? [.8, 1] : [.5, .8], null]
        }
    }

    _buildProvinceMap(regionTileMap) {
        let provinceId = 0
        const provinceMap = new PairMap()
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
