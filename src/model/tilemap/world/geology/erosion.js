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



class RegionHeightIndex {
    // for each height, stores all region ids in that height
    constructor() {
        this.map = new Map()
    }

    set(landform, regionId) {
        if (! this.map.has(landform.name)) {
            this.map.set(landform.name, [])
        }
        const regions = this.map.get(landform.name)
        regions.push(regionId)
    }

    get(landform) {
        if (! this.map.has(landform.name)) {
            return []
        }
        return this.map.get(landform.name)
    }
}
