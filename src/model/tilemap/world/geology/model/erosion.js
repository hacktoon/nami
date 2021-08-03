import { MultiFill, FloodFillConfig } from '/lib/floodfill'


export class ErosionModel {
    constructor(regionGroupTileMap, plateModel) {
        this.regionGroupTileMap = regionGroupTileMap
        this.plateModel = plateModel
    }

}



class PointFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.regionGroupTileMap = data.regionGroupTileMap

    }

    isEmpty(neighborPoint) {
        return
    }

    setValue(point, level) {

    }

    getNeighbors(point) {

    }
}