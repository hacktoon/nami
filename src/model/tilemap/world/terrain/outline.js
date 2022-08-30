import { Color } from '/src/lib/color'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
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
        erosion: true,
    },
    {
        id: 6,
        name: 'Mountain',
        noise: RELIEF_NOISE_TYPE,
        baseRatio: .6,
        ratio: .65,
        water: false,
        color: Color.fromHex('#c0b896'),
        erosion: true,
    },
    {
        id: 5,
        name: 'Plateau',
        noise: RELIEF_NOISE_TYPE,
        baseRatio: .6,
        ratio: .5,
        water: false,
        color: Color.fromHex('#b6e491'),
        erosion: true,
    },
    {
        id: 4,
        name: 'Plain',
        noise: BASE_NOISE_TYPE,
        baseRatio: 0,
        ratio: .6,
        water: false,
        color: Color.fromHex('#99d966'),
        erosion: true,
    },
    {
        id: 3,
        name: 'Basin',
        noise: BASE_NOISE_TYPE,
        baseRatio: 0,
        ratio: .55,
        water: false,
        color: Color.fromHex('#71b13e'),
        erosion: true,
    },
    {
        id: 2,
        name: 'Sea',
        noise: BASE_NOISE_TYPE,
        baseRatio: 0,
        ratio: .45,
        water: true,
        color: Color.fromHex('#2878a0'),
        erosion: false,
    },
    {
        id: 1,
        name: 'Ocean',
        noise: BASE_NOISE_TYPE,
        baseRatio: 0,
        ratio: .2,
        water: true,
        color: Color.fromHex('#216384'),
        erosion: false,
    },
    {
        id: 0,
        name: 'Abyss',
        noise: BASE_NOISE_TYPE,
        baseRatio: 0,
        ratio: 0,
        water: true,
        color: Color.fromHex('#1d5674'),
        erosion: false,
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


class TypePointsMap {
    // store a list of points for each type id
    #map

    constructor() {
        this.#map = new Map()
    }

    add(typeId, point) {
        if (! this.#map.has(typeId)) {
            this.#map.set(typeId, [])
        }
        this.#map.get(typeId).push(point)
    }

    forEach(callback) {
        const ids = Array.from(this.#map.keys())
        const cmp = (id0, id1) => id1 - id0
        // sort from highest to lowest type
        for(let id of ids.sort(cmp)) {
            callback(id, this.#map.get(id))
        }
    }
}


export class OutlineModel {
    #map
    #typeMap

    #buildBaseMaps(rect, seed) {
        const noiseTypeMap = {
            [BASE_NOISE_TYPE]: buildNoiseMap(rect, seed, BASE_NOISE),
            [RELIEF_NOISE_TYPE]: buildNoiseMap(rect, seed, RELIEF_NOISE),
        }
        const baseTileMap = noiseTypeMap[BASE_NOISE_TYPE]
        const typePointsMap = new TypePointsMap()
        const matrix = Matrix.fromRect(rect, point => {
            const baseNoise = baseTileMap.getNoise(point)
            for (let type of TERRAIN_TYPES) {
                const reliefNoise = noiseTypeMap[type.noise].getNoise(point)
                if (baseNoise >= type.baseRatio && reliefNoise >= type.ratio) {
                    if (type.erosion)
                        typePointsMap.add(type.id, point)
                    return type.id
                }
            }
        })
        return [matrix, typePointsMap]
    }

    #buildErosionMap(baseMap, typePointsMap) {
        typePointsMap.forEach((typeId, points) => {
            for (let point of points) {
                for (let sidePoint of Point.adjacents(point)) {
                    const sideTypeId = baseMap.get(sidePoint)
                    // get only neighbors with cliffs
                    if (typeId > sideTypeId + 1) {
                        // get next lower level
                        const nextLowerId = typeId - 1 >= 0 ? typeId - 1 : typeId
                        baseMap.set(sidePoint, nextLowerId)
                        typePointsMap.add(nextLowerId, sidePoint)
                    }
                }
            }
        })
        return baseMap
    }

    constructor(rect, seed) {
        const typeMap = new Map(TERRAIN_TYPES.map(type => [type.id, type]))
        const [baseMap, typePointsMap] = this.#buildBaseMaps(rect, seed)
        // this.#map = baseMap
        this.#map = this.#buildErosionMap(baseMap, typePointsMap)
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
