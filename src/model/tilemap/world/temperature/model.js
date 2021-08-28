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
        this.radiation = params.get('radiation')
    }

    getRegion(point) {
        return this.regionTileMap.getRegion(point)
    }

    getTemperature(point) {
        const region = this.regionTileMap.getRegion(point)
        const center = Math.round(this.regionTileMap.height / 2)
        const offset = this._calcOffset(region)
        const distanceToCenter = Math.abs(region.origin[1] - center)
        const temperature = distanceToCenter + offset
        const fraction = center / 100
        let zone = POLAR
        if (temperature < 90 * fraction) zone = TEMPERATE
        if (temperature < 60 * fraction) zone = SUBTROPICAL
        if (temperature < 35 * fraction) zone = TROPICAL
        return {
            zone: zone,
            temp: temperature
        }
    }

    _calcOffset(region) {
        const offset = Math.sin(region.origin[0]) * 4
        return Math.floor(offset - this.radiation)
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
        scale: params.get('scale'),
        seed: seed,
        growth: 20,
        chance: 0.1,
    })
}

