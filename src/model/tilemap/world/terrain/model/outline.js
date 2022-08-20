import { Color } from '/src/lib/color'
import { Point } from '/src/lib/point'
import { Matrix } from '/src/lib/matrix'
import { NoiseTileMap } from '/src/model/tilemap/noise'

const BASE_NOISE_TYPE = 'base'
const RELIEF_NOISE_TYPE = 'relief'

const BASE_NOISE = {octaves: 6, resolution: .8, scale: .02}
const RELIEF_NOISE = {octaves: 5, resolution: .6, scale: .06}


const TRENCH_TYPE = {
    id: 0,
    name: 'Trench',
    type: BASE_NOISE_TYPE,
    ratio: 0,
    water: true,
    color: Color.fromHex('#1d5674'),
}

const OCEAN_TYPE = {
    id: 1,
    name: 'Ocean',
    type: BASE_NOISE_TYPE,
    ratio: .2,
    water: true,
    color: Color.fromHex('#216384'),
}

const SEA_TYPE = {
    id: 2,
    name: 'Sea',
    type: BASE_NOISE_TYPE,
    ratio: .45,
    water: true,
    color: Color.fromHex('#2878a0'),
}

const BASIN_TYPE = {
    id: 3,
    name: 'Shore',
    type: BASE_NOISE_TYPE,
    ratio: .55,
    water: false,
    color: Color.fromHex('#71b13e'),
}

const PLAINS_TYPE = {
    id: 4,
    name: 'Plain',
    type: BASE_NOISE_TYPE,
    ratio: .65,
    water: false,
    color: Color.fromHex('#99d966'),
}

const PLATEAU_TYPE = {
    id: 5,
    name: 'Plateau',
    type: RELIEF_NOISE_TYPE,
    ratio: .45,
    water: false,
    color: Color.fromHex('#b6e491'),
}

const MOUNTAIN_TYPE = {
    id: 6,
    name: 'Mountain',
    type: RELIEF_NOISE_TYPE,
    ratio: .55,
    water: false,
    color: Color.fromHex('#b1b1b1'),
}

const PEAK_TYPE = {
    id: 7,
    name: 'Peak',
    type: RELIEF_NOISE_TYPE,
    ratio: .75,
    water: false,
    color: Color.fromHex('#DDD'),
}



function buildTerrainTypeMap(types) {
    const map = new Map()
    for(let type of types){

    }
    return map
}


function buildNoiseMap(rect, seed, params) {
    return NoiseTileMap.fromData({
        rect: rect.hash(),
        octaves: params.octaves,
        resolution: params.resolution,
        scale: params.scale,
        seed: seed,
    })
}


export class OutlineModel {
    #map

    #buildBaseMap(noiseMap, rect) {
        const outlineNoiseMap = noiseMap.base
        const reliefNoiseMap = noiseMap.relief
        return Matrix.fromRect(rect, point => {
            let outlineNoise = outlineNoiseMap.getNoise(point)
            let reliefNoise = reliefNoiseMap.getNoise(point)
            if (outlineNoise >= BASIN_TYPE.ratio) {
                // LAND ==============================
                if (outlineNoise >= PLAINS_TYPE.ratio) {
                    if (reliefNoise >= PEAK_TYPE.ratio) {
                        return PEAK_TYPE.id
                    }
                    if (reliefNoise >= MOUNTAIN_TYPE.ratio) {
                        return MOUNTAIN_TYPE.id
                    }
                    if (reliefNoise >= PLATEAU_TYPE.ratio) {
                        return PLATEAU_TYPE.id
                    }
                    return PLAINS_TYPE.id
                }
                return BASIN_TYPE.id
            }

            // WATER ==============================
            if (outlineNoise >= SEA_TYPE.ratio) {
                return SEA_TYPE.id
            }
            if (outlineNoise >= OCEAN_TYPE.ratio) {
                return OCEAN_TYPE.id
            }
            return TRENCH_TYPE.id
        })
    }

    constructor(rect, seed) {
        const noiseMap = {
            [BASE_NOISE_TYPE]: buildNoiseMap(rect, seed, BASE_NOISE),
            [RELIEF_NOISE_TYPE]: buildNoiseMap(rect, seed, RELIEF_NOISE),
        }
        const baseMap = this.#buildBaseMap(noiseMap, rect)
        this.#map = baseMap
    }

    get(point) {
        const id = this.#map.get(point)
        if (id === TRENCH_TYPE.id) return TRENCH_TYPE
        if (id === OCEAN_TYPE.id) return OCEAN_TYPE
        if (id === SEA_TYPE.id) return SEA_TYPE
        if (id === BASIN_TYPE.id) return BASIN_TYPE
        if (id === PLATEAU_TYPE.id) return PLATEAU_TYPE
        if (id === MOUNTAIN_TYPE.id) return MOUNTAIN_TYPE
        if (id === PEAK_TYPE.id) return PEAK_TYPE

        return PLAINS_TYPE
    }

    isLand(point) {
        return ! this.get(point).water
    }

    isWater(point) {
        return this.get(point).water
    }
}
