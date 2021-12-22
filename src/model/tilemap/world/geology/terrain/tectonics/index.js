import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'
import { PairMap } from '/lib/map'
import { Direction } from '/lib/direction'
import { Point } from '/lib/point'


import { Landform } from '../landform'
import { BoundaryTable } from './table'


export class TectonicsModel {
    #regionBoundaryMap = new Map()
    #landformMap = new Map()
    #boundaries = []
    #boundaryName = []
    #boundaryLandscape = []

    constructor(realmTileMap, plateModel) {
        const borderRegions = realmTileMap.getBorderRegions()
        this.realmTileMap = realmTileMap
        this.plateModel = plateModel
        this.directions = this._buildDirections(realmTileMap)
        this.boundaryTable = new BoundaryTable(plateModel)
        this._buildBoundaries(borderRegions)
    }

    _buildBoundaries(borderRegionIds) {
        const mapFill = new TectonicsMultiFill(this, borderRegionIds)
        for(let id = 0; id < borderRegionIds.length; id ++) {
            const regionId = borderRegionIds[id]
            const [boundaryName, landscape] = this._getRegionBoundary(regionId)
            this.#boundaries.push(id)
            this.#boundaryName.push(boundaryName)
            this.#boundaryLandscape.push(landscape)
        }
        mapFill.fill()
    }

    _getRegionBoundary(regionId) {
        const realmId = this.realmTileMap.getRealmByRegion(regionId)
        const sideRegionIds = this.realmTileMap.getSideRegions(regionId)
        for(let sideRegionId of sideRegionIds) {
            const sideRealmId = this.realmTileMap.getRealmByRegion(sideRegionId)
            if (realmId !== sideRealmId) {
                return this._buildBoundary(realmId, sideRealmId)
            }
        }
    }

    _buildBoundary(realmId, sideRealmId) {
        const dirToSide = this.directions.get(realmId, sideRealmId)
        const dirFromSide = this.directions.get(sideRealmId, realmId)
        const plateDir = this.plateModel.getDirection(realmId)
        const sidePlateDir = this.plateModel.getDirection(sideRealmId)
        const dotTo = Direction.dotProduct(plateDir, dirToSide)
        const dotFrom = Direction.dotProduct(sidePlateDir, dirFromSide)
        return this.boundaryTable.get(realmId, sideRealmId, dotTo, dotFrom)
    }

    _buildDirections(realmTileMap) {
        const origins = realmTileMap.origins
        const rect = realmTileMap.rect
        const directions = new PairMap()
        for(let id=0; id<origins.length; id++) {
            const origin = origins[id]
            const neighbors = realmTileMap.graph.getEdges(id)
            for(let neighborId of neighbors) {
                const neighborOrigin = origins[neighborId]
                const sideOrigin = rect.unwrapFrom(origin, neighborOrigin)
                const angle = Point.angle(origin, sideOrigin)
                const direction = Direction.fromAngle(angle)
                directions.set(id, neighborId, direction)
            }
        }
        return directions
    }

    getBoundaries() {
        return this.#boundaries
    }

    setBoundaryByRegion(regionId, boundaryId) {
        return this.#regionBoundaryMap.set(regionId, boundaryId)
    }

    getBoundaryByRegion(regionId) {
        return this.#regionBoundaryMap.get(regionId)
    }

    getBoundaryName(regionId) {
        const boundaryId = this.#regionBoundaryMap.get(regionId)
        return this.#boundaryName[boundaryId]
    }

    getLandformByLevel(id, level) {
        let name
        const landscape = this.#boundaryLandscape[id]
        for(let i=0; i<landscape.length; i++) {
            name = landscape[i]
            if (level <= i)
                break
        }
        return Landform.get(name)
    }

    hasLandform(regionId) {
        return this.#landformMap.has(regionId)
    }

    setLandform(regionId, landform) {
        return this.#landformMap.set(regionId, landform)
    }

    getLandform(regionId) {
        return this.#landformMap.get(regionId)
    }
}


class TectonicsFloodFill extends ConcurrentFillUnit {
    setValue(fillId, regionId, level) {
        const landform = this.model.getLandformByLevel(fillId, level)
        this.model.setLandform(regionId, landform)
        this.model.setBoundaryByRegion(regionId, fillId)
    }

    isEmpty(sideRegionId) {
        return !this.model.hasLandform(sideRegionId)
    }

    getNeighbors(regionId) {
        return this.model.realmTileMap.getSideRegions(regionId)
    }
}


class TectonicsMultiFill extends ConcurrentFill {
    constructor(model, borderRegions) {
        super(borderRegions, model, TectonicsFloodFill)
    }

    getChance(fillId, regionId) {
        return .5
    }

    getGrowth(fillId, regionId) {
        return 5
    }
}
