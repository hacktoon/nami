import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { NoiseTileMap } from '/src/model/tilemap/noise'
import { TerrainTypeMap } from './terrain'


const EMPTY = null
const NOISE_SPEC = {
    outline: {id: 'outline', octaves: 6, resolution: .8, scale: .02},
    secondary: {id: 'secondary', octaves: 6, resolution: .8, scale: .05},
}


class Layer {

}


const PIPELINE = [
    {
        name: 'Land/water outline',
        ratio: .55,
        noise: NOISE_SPEC.outline,
        buildLayer: (step, noiseMap) => {
            const aboveRatio = TerrainTypeMap.types.PLAIN
            const belowRatio = TerrainTypeMap.types.SEA
            return Matrix.fromRect(noiseMap.rect, point => {
                const noise = noiseMap.getNoise(point)
                // check if is margin
                for (let sidePoint of Point.adjacents(point)) {
                    const sideNoise = noiseMap.getNoise(sidePoint)
                    if (noise >= step.ratio && sideNoise < step.ratio) {
                        return aboveRatio
                    }
                    if (noise < step.ratio && sideNoise >= step.ratio) {
                        return belowRatio
                    }
                }
                // not a margin
                if (noise >= step.ratio)
                    return -aboveRatio
                else
                    return -belowRatio
            })
        }
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


export class TerrainModel {
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

    #buildMap(noiseMaps) {
        let baseMap
        for(let step of PIPELINE) {
            const noiseMap = noiseMaps.get(step.noise.id)
            baseMap = step.buildLayer(step, noiseMap)
        }
        return baseMap
    }

    constructor(rect, seed) {
        const noiseMaps = this.#buildNoiseMaps(rect, seed)
        // const baseMap = Matrix.fromRect(rect, point => 3)
        const baseMap = this.#buildMap(noiseMaps)
        this.#terrainMap = baseMap
    }

    get(point) {
        const id = this.#terrainMap.get(point)
        return this.#typeMap.get(Math.abs(id))
    }

    isMargin(point) {
        const id = this.#terrainMap.get(point)
        return id >= 0
    }

    isLand(point) {
        return ! this.get(point).water
    }

    isWater(point) {
        return this.get(point).water
    }
}
