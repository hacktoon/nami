import { RegionTileMap } from '/model/tilemap/region'


const TROPICAL = 0
const SUBTROPICAL = 1
const TEMPERATE = 2
const POLAR = 3


export class Temperature {
    constructor(seed, params) {
        const regionTileMap = buildRegionMap(seed, params)
        this.regionTileMap = regionTileMap
        this.radiation = params.get('radiation')
        this.frequency = params.get('frequency')
    }

    getTemperature(point) {
        const origin = this.regionTileMap.getRegionOrigin(point)
        const center = Math.round(this.regionTileMap.height / 2)
        const offset = this._calcOffset(origin)
        const distanceToCenter = Math.abs(origin[1] - center)
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

    _calcOffset(origin) {
        const offset = Math.sin(origin[0]) * this.frequency
        return Math.floor(offset + this.radiation)
    }
}


function buildRegionMap(seed, params) {
    return RegionTileMap.fromData({
        width: params.get('width'),
        height: params.get('height'),
        scale: params.get('scale'),
        seed: seed,
        growth: 1,
        chance: 0.1,
    })
}

