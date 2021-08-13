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
            const landform = this.plateModel.getLandform(region.id)
            const fillConfig = new ErosionFillConfig({
                reGroupTileMap: this.reGroupTileMap,
                erosionMatrix: this.erosionMatrix,
                plateModel: this.plateModel,
                landform
            })
            return new FloodFill(region.origin, fillConfig)
        })
        new MultiFill(fills)
    }

}


class ErosionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.reGroupTileMap = data.reGroupTileMap
        this.erosionMatrix = data.erosionMatrix
        this.plateModel = data.plateModel
        this.landform = data.landform
    }

    isEmpty(point) {
        return this.erosionMatrix.get(point) === EMPTY
    }

    setValue(point) {
        const landform = this.plateModel.getLandformByPoint(point)
        this.erosionMatrix.set(point, landform)
    }

    getNeighbors(centerPoint) {
        const sidePoints = centerPoint.adjacents()
        return sidePoints.filter(sidePoint => {
            const debug = centerPoint.hash == '127,39' ? true : false
            const centerLandform = this.plateModel.getLandformByPoint(centerPoint)
            const sideLandform = this.plateModel.getLandformByPoint(sidePoint)
            if (sideLandform.height + 1 < centerLandform.height) {
                const name = centerLandform.erodesTo
                const erodedLandform = LANDFORMS[name] ?? sideLandform
                this.erosionMatrix.set(sidePoint, erodedLandform)
                if (debug) {
                    // console.log(
                    //     `${sideLandform.name} => ${erodedLandform.name}`
                    // )
                }
            }
            return sideLandform.name === centerLandform.name
        })
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
