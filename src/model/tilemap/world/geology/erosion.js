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
        this.erosionMatrix = new Matrix(width, height, () => EMPTY)
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
                erosionMatrix: this.erosionMatrix,
                plateModel: this.plateModel,
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
        this.erosionMatrix = data.erosionMatrix
        this.plateModel = data.plateModel
    }

    isEmpty(point) {
        return this.erosionMatrix.get(point) === EMPTY
    }

    setValue(point) {
        const region = this.reGroupTileMap.getRegion(point)
        const landform = this.plateModel.getLandform(region.id)
        this.erosionMatrix.set(point, landform.name)
    }

    checkNeighbor(neighborPoint, point) {
        const debug = point.hash == '127,39' ? true : false
        const centerRegion = this.reGroupTileMap.getRegion(point)
        const centerLandform = this.plateModel.getLandform(centerRegion.id)
        const ngbRegion = this.reGroupTileMap.getRegion(neighborPoint)
        const ngbLandform = this.plateModel.getLandform(ngbRegion.id)
        const isErosion = Landform.isHigher(centerLandform, ngbLandform)
        if (debug) {
            console.log(
                `higher=${isErosion}`,
                `${centerLandform.name} => ${ngbLandform.name}`
            )
        }
    }

    getNeighbors(point) {
        return point.adjacents()
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
