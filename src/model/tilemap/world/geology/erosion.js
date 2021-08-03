import { MultiFill, FloodFillConfig } from '/lib/floodfill'
import { RegionGroupTileMap } from '/model/tilemap/regiongroup'


export class ErosionModel {
    constructor(seed, params) {

    }

}


class RegionFillConfig extends FloodFillConfig {
    constructor(data) {
        super()
        this.deform = data.deform

        this.chance = data.deform.chance
        this.growth = data.deform.growth
    }

    isEmpty(neighborRegion) {
        return !this.stressMap.has(neighborRegion.id)
    }

    setValue(region, level) {
        const stress = this.maxStressMap.get(this.group.id)
        const landform = this.deform.get(level)
        if (level > stress) {
            this.maxStressMap.set(this.group.id, level)
        }
        this.regionLandformMap.set(region.id, landform)
        this.stressMap.set(region.id, level)
    }

    getNeighbors(region) {
        return this.regionGroupTileMap.getNeighborRegions(region)
    }
}
