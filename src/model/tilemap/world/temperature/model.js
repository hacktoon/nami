import { RegionTileMap } from '/model/tilemap/region'


export class Temperature {
    constructor(seed, params) {
        const regionTileMap = buildRegionMap(seed, params)
        this.index = new Map()
        regionTileMap.forEach(region => {
            this.index.set(region.id, region)
        })
        this.regionTileMap = regionTileMap
    }

    getRegion(point) {
        return this.regionTileMap.getRegion(point)
    }

    getTemperature(point) {
        const region = this.regionTileMap.getRegion(point)
        const y = region.origin.y
        return Math.floor(this.regionTileMap.height / y)
    }

    map(callback) {
        return this.regionTileMap.map(callback)
    }

    forEach(callback) {
        this.regionTileMap.forEach(callback)
    }
}


function buildRegionMap(seed, params) {
    return RegionTileMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        seed: seed,
        scale: 3,
        growth: 1,
        chance: 0.1,
    })
}

