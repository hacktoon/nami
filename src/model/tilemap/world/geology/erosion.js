import { Matrix } from '/lib/base/matrix'
import { FloodFill, MultiFill, FloodFillConfig } from '/lib/floodfill'
import { LANDFORMS, Landform } from './landform'


const EMPTY = null


export class ErosionModel {
    constructor(reGroupTileMap, plateModel) {
        const {width, height} = reGroupTileMap
        this.reGroupTileMap = reGroupTileMap
        this.plateModel = plateModel
        this.heightIndex = this._buildHeightIndex()
        this.landformMatrix = new Matrix(width, height, () => EMPTY)
        this._buildErosionMap()
    }

    _buildHeightIndex() {
        const index = new HeightIndex()
        this.reGroupTileMap.getRegions().forEach(region => {
            const landform = this.plateModel.getLandform(region.id)
            index.add(landform, region)
        })
        return index
    }

    _buildErosionMap() {
        const regions = this.heightIndex.get(LANDFORMS.PEAK)
        const fills = regions.map(region => {
            const fillConfig = new RegionFillConfig({
                reGroupTileMap: this.reGroupTileMap,
                plateModel: this.plateModel,
                landformMatrix: this.landformMatrix,
                region
            })
            return new FloodFill(region.origin, fillConfig)
        })
        new MultiFill(fills)
    }

}


class RegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.reGroupTileMap = data.reGroupTileMap
        this.landformMatrix = data.landformMatrix
        this.plateModel = data.plateModel
        this.region = data.region
    }

    isEmpty(point) {
        return this.landformMatrix.get(point) === EMPTY
    }

    setValue(point, level) {
        this.landformMatrix.set(point, 'xpto')
    }

    getNeighbors(point) {
        const region = this.reGroupTileMap.getRegion(point)
        const landform = this.plateModel.getLandform(region.id)
        const neighbors = point.adjacents()
        const higher = neighbors.filter(neighbor => {
            const ngbRegion = this.reGroupTileMap.getRegion(neighbor)
            const ngbLandform = this.plateModel.getLandform(ngbRegion.id)
            return Landform.isHigherEqualThan(landform, ngbLandform)
        })
        if (region.id == 4225) {
            console.log(point.hash, higher)
        }
        return higher
    }
}


class HeightIndex {
    // for each landform.height, add all region.id in that height to a list
    constructor() {
        this.map = new Map()
    }

    add(landform, region) {
        if (! this.map.has(landform.name)) {
            this.map.set(landform.name, [])
        }
        const regions = this.map.get(landform.name)
        regions.push(region)
    }

    get(landform) {
        if (! this.map.has(landform.name)) {
            return []
        }
        return this.map.get(landform.name)
    }
}
