import { Color } from '/src/lib/color'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { NoiseTileMap } from '/src/model/tilemap/noise'
import { TerrainCollection } from './terrain'


const BASE_NOISE_TYPE = 'base'
const RELIEF_NOISE_TYPE = 'relief'
const EMPTY = null
const BASE_NOISE = {octaves: 6, resolution: .8, scale: .02}
const RELIEF_NOISE = {octaves: 6, resolution: .8, scale: .05}

const TERRAIN_TYPES = [
    {
        id: 0,
        name: 'Abyss',
        noise: BASE_NOISE_TYPE,
        ratio: 0,
        water: true,
        color: Color.fromHex('#1d5674'),
        erosion: false,
    },
    {
        id: 1,
        name: 'Ocean',
        noise: BASE_NOISE_TYPE,
        ratio: .2,
        water: true,
        color: Color.fromHex('#216384'),
        erosion: false,
    },
    {
        id: 2,
        name: 'Sea',
        noise: RELIEF_NOISE_TYPE,
        ratio: .45,
        water: true,
        color: Color.fromHex('#2878a0'),
        erosion: false,
    },
    {
        id: 3,
        name: 'Basin',
        noise: BASE_NOISE_TYPE,
        ratio: .55,
        water: false,
        color: Color.fromHex('#71b13e'),
        erosion: true,
    },
    {
        id: 4,
        name: 'Plain',
        noise: BASE_NOISE_TYPE,
        ratio: .6,
        water: false,
        color: Color.fromHex('#99d966'),
        erosion: true,
    },
    {
        id: 5,
        name: 'Plateau',
        noise: RELIEF_NOISE_TYPE,
        ratio: .5,
        water: false,
        color: Color.fromHex('#b6e491'),
        erosion: true,
    },
    {
        id: 6,
        name: 'Mountain',
        noise: RELIEF_NOISE_TYPE,
        ratio: .65,
        water: false,
        color: Color.fromHex('#c0b896'),
        erosion: true,
    },
    {
        id: 7,
        name: 'Peak',
        noise: RELIEF_NOISE_TYPE,
        ratio: .8,
        water: false,
        color: Color.fromHex('#DDD'),
        erosion: true,
    },
]


const PIPELINE = [
    {
        aboveRatio: '',
        belowRatio: '',
        ratio: .55,
    },
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

    #buildLayer(matrix, type, noiseMaps, isEmpty = () => true) {
        const noiseMap = noiseMaps[type.noise]
        return Matrix.fromRect(matrix.rect, point => {
            const noise = noiseMap.getNoise(point)
            if (noise >= type.ratio && isEmpty(point)) {
                for (let sidePoint of Point.adjacents(point)) {
                    const sideNoise = noiseMap.getNoise(sidePoint)
                    if (sideNoise < type.ratio) {
                        return -type.id  // border
                    }
                }
                return type.id
            }
            return EMPTY
        })
    }

    #buildBaseMap(rect, seed) {
        let baseType = TERRAIN_TYPES[0]
        const matrix = Matrix.fromRect(rect, point => baseType.id)
        const noiseMaps = {
            [BASE_NOISE_TYPE]: buildNoiseMap(rect, seed, BASE_NOISE),
            [RELIEF_NOISE_TYPE]: buildNoiseMap(rect, seed, RELIEF_NOISE),
        }
        // build first layer before loop
        let baseMap = this.#buildLayer(matrix, baseType, noiseMaps)
        // for (let type of TERRAIN_TYPES.slice(1)) {
        //     let map = this.#buildLayer(matrix, type, noiseMaps, point => {
        //         return baseMap.get(point) === EMPTY
        //     })
        //     baseMap = map
        // }
        return baseMap
    }

    constructor(rect, seed) {
        const typeMap = new Map(TERRAIN_TYPES.map(type => [type.id, type]))
        const baseMap = this.#buildBaseMap(rect, seed)
        this.#map = baseMap
        this.#typeMap = typeMap
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
