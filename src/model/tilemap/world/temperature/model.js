import { RegionTileMap } from '/model/tilemap/region'


const ZONE_COUNT = 4

const TROPICAL = 0
const SUBTROPICAL = 1
const TEMPERATE = 2
const POLAR = 3


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
        const center = Math.round(this.regionTileMap.height / 2)
        const offset =  Math.floor(Math.sin(region.origin.x) * 4)
        const distanceToCenter = Math.abs(region.origin.y - center) + offset
        let zone = POLAR
        if (distanceToCenter < (90 * center)/100) zone = TEMPERATE
        if (distanceToCenter < (60 * center)/100) zone = SUBTROPICAL
        if (distanceToCenter < (35 * center)/100) zone = TROPICAL
        return {
            zone: zone,
            temp: distanceToCenter
        }
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
        scale: 4,
        growth: 20,
        chance: 0.1,
    })
}

