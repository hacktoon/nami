import { MultiFill, FloodFillConfig } from '/lib/floodfill'


class ErosionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.regionGroupTileMap = data.regionGroupTileMap
        this.regionLandformMap = data.regionLandformMap
        this.maxStressMap = data.maxStressMap
        this.stressMap = data.stressMap
    }

    isEmpty(neighborRegion) {
        return !this.stressMap.has(neighborRegion.id)
    }

    setValue(region, level) {
        const stress = this.maxStressMap.get(this.group.id)
        if (level > stress) this.maxStressMap.set(this.group.id, level)
        const landform = this.deform.get(level)
        this.regionLandformMap.set(region.id, landform)
        this.stressMap.set(region.id, level)
    }

    getNeighbors(region) {
        return this.regionGroupTileMap.getNeighborRegions(region)
    }
}
