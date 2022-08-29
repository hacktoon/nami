import { Color } from '/src/lib/color'
import { Matrix } from '/src/lib/matrix'
import { NoiseTileMap } from '/src/model/tilemap/noise'


const BASE_NOISE_TYPE = 'base'
const RELIEF_NOISE_TYPE = 'relief'

const BASE_NOISE = {octaves: 6, resolution: .8, scale: .02}
const RELIEF_NOISE = {octaves: 6, resolution: .8, scale: .05}


const TERRAIN_TYPES = [
    {
        id: 7,
        name: 'Peak',
        noise: RELIEF_NOISE_TYPE,
        baseRatio: .6,
        ratio: .8,
        water: false,
        color: Color.fromHex('#DDD'),
    },
    {
        id: 6,
        name: 'Mountain',
        noise: RELIEF_NOISE_TYPE,
        baseRatio: .6,
        ratio: .65,
        water: false,
        color: Color.fromHex('#c0b896'),
    },
    {
        id: 5,
        name: 'Plateau',
        noise: RELIEF_NOISE_TYPE,
        baseRatio: .6,
        ratio: .5,
        water: false,
        color: Color.fromHex('#b6e491'),
    },
    {
        id: 4,
        name: 'Plain',
        noise: BASE_NOISE_TYPE,
        baseRatio: 0,
        ratio: .6,
        water: false,
        color: Color.fromHex('#99d966'),
    },
    {
        id: 3,
        name: 'Basin',
        noise: BASE_NOISE_TYPE,
        baseRatio: 0,
        ratio: .55,
        water: false,
        color: Color.fromHex('#71b13e'),
    },
    {
        id: 2,
        name: 'Sea',
        noise: BASE_NOISE_TYPE,
        baseRatio: 0,
        ratio: .45,
        water: true,
        color: Color.fromHex('#2878a0'),
    },
    {
        id: 1,
        name: 'Ocean',
        noise: BASE_NOISE_TYPE,
        baseRatio: 0,
        ratio: .2,
        water: true,
        color: Color.fromHex('#216384'),
    },
    {
        id: 0,
        name: 'Abyss',
        noise: BASE_NOISE_TYPE,
        baseRatio: 0,
        ratio: 0,
        water: true,
        color: Color.fromHex('#1d5674'),
    }
]


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
    #typeMap

    #buildBaseMap(rect, seed) {
        const noiseTypeMap = {
            [BASE_NOISE_TYPE]: buildNoiseMap(rect, seed, BASE_NOISE),
            [RELIEF_NOISE_TYPE]: buildNoiseMap(rect, seed, RELIEF_NOISE),
        }
        const baseTileMap = noiseTypeMap[BASE_NOISE_TYPE]
        return Matrix.fromRect(rect, point => {
            for (let type of TERRAIN_TYPES) {
                const baseNoise = baseTileMap.getNoise(point)
                const reliefNoise = noiseTypeMap[type.noise].getNoise(point)
                if (baseNoise >= type.baseRatio && reliefNoise >= type.ratio)
                    return type.id
            }
            // default value = lowest type
            return TERRAIN_TYPES[TERRAIN_TYPES.length - 1].id
        })
    }

    constructor(rect, seed) {
        const entries = TERRAIN_TYPES.map(type => [type.id, type])
        this.#typeMap = new Map(entries)
        this.#map = this.#buildBaseMap(rect, seed)
    }

    get(point) {
        const id = this.#map.get(point)
        return this.#typeMap.get(id)
    }

    isLand(point) {
        return ! this.get(point).water
    }

    isWater(point) {
        return this.get(point).water
    }
}
