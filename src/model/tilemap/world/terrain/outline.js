import { Color } from '/src/lib/color'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { NoiseTileMap } from '/src/model/tilemap/noise'
import { TerrainTypeMap } from './terrain'


const EMPTY = null
const NOISE_SPEC = {
    outline: {id: 'outline', octaves: 6, resolution: .8, scale: .02},
    secondary: {id: 'secondary', octaves: 6, resolution: .8, scale: .05},
}

const PIPELINE = [
    {
        name: 'Land/water outline',
        ratio: .55,
        noise: NOISE_SPEC.outline,
        aboveRatio: TerrainTypeMap.types.PLAIN,
        belowRatio: TerrainTypeMap.types.SEA,
    },
    // {
    //     id: 1,
    //     name: 'Ocean',
    //     noise: BASE_NOISE_TYPE,
    //     ratio: .2,
    //     water: true,
    //     color: Color.fromHex('#216384'),
    //     erosion: false,
    // },
    // {
    //     id: 2,
    //     name: 'Sea',
    //     noise: RELIEF_NOISE_TYPE,
    //     ratio: .45,
    //     water: true,
    //     color: Color.fromHex('#2878a0'),
    //     erosion: false,
    // },
    // {
    //     id: 3,
    //     name: 'Basin',
    //     noise: BASE_NOISE_TYPE,
    //     ratio: .55,
    //     water: false,
    //     color: Color.fromHex('#71b13e'),
    //     erosion: true,
    // },
    // {
    //     id: 4,
    //     name: 'Plain',
    //     noise: BASE_NOISE_TYPE,
    //     ratio: .6,
    //     water: false,
    //     color: Color.fromHex('#99d966'),
    //     erosion: true,
    // },
    // {
    //     id: 5,
    //     name: 'Plateau',
    //     noise: RELIEF_NOISE_TYPE,
    //     ratio: .5,
    //     water: false,
    //     color: Color.fromHex('#b6e491'),
    //     erosion: true,
    // },
    // {
    //     id: 6,
    //     name: 'Mountain',
    //     noise: RELIEF_NOISE_TYPE,
    //     ratio: .65,
    //     water: false,
    //     color: Color.fromHex('#c0b896'),
    //     erosion: true,
    // },
    // {
    //     id: 7,
    //     name: 'Peak',
    //     noise: RELIEF_NOISE_TYPE,
    //     ratio: .8,
    //     water: false,
    //     color: Color.fromHex('#DDD'),
    //     erosion: true,
    // },
]


export class OutlineModel {
    #terrainMap
    #typeMap = new TerrainTypeMap()

    #buildNoiseMaps(rect, seed) {
        const noiseMaps = new Map()
        for(let [id, spec] of Object.entries(NOISE_SPEC)) {
            const map = NoiseTileMap.fromData({
                rect: rect.hash(),
                octaves: spec.octaves,
                resolution: spec.resolution,
                scale: spec.scale,
                seed: seed,
            })
            noiseMaps.set(id, map)
        }
        return noiseMaps
    }

    #buildLayer(baseMap, step, noiseMap) {
        return Matrix.fromRect(baseMap.rect, point => {
            const value = baseMap.get(point)
            if (value !== EMPTY && value >= 0) {
                return value
            }
            const noise = noiseMap.getNoise(point)
            if (noise >= step.ratio) {
                for (let sidePoint of Point.adjacents(point)) {
                    const sideNoise = noiseMap.getNoise(sidePoint)
                    if (sideNoise < step.ratio) {
                        return step.aboveRatio  // border
                    }
                }
                return -step.aboveRatio
            }
            return step.belowRatio === undefined ? value : -step.belowRatio
        })
    }

    #buildMap(rect, noiseMaps) {
        let baseMap = Matrix.fromRect(rect, () => EMPTY)
        for(let step of PIPELINE) {
            const noiseMap = noiseMaps.get(step.noise.id)
            baseMap = this.#buildLayer(baseMap, step, noiseMap)
        }
        return baseMap
    }

    constructor(rect, seed) {
        const noiseMaps = this.#buildNoiseMaps(rect, seed)
        // const baseMap = Matrix.fromRect(rect, point => 3)
        const baseMap = this.#buildMap(rect, noiseMaps)
        this.#terrainMap = baseMap
    }

    get(point) {
        const id = this.#terrainMap.get(point)
        return this.#typeMap.get(Math.abs(id))
    }

    isLand(point) {
        return ! this.get(point).water
    }

    isWater(point) {
        return this.get(point).water
    }
}
