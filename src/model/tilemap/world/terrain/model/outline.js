import { Color } from '/src/lib/color'
import { Point } from '/src/lib/point'
import { Matrix } from '/src/lib/matrix'
import { NoiseTileMap } from '/src/model/tilemap/noise'


const OUTLINE_RATE = .55
const SEA_RATE = .5

const OCEAN_TYPE = {
    id: 0,
    name: 'Ocean',
    water: true,
    color: Color.fromHex('#216384'),
}

const SEA_TYPE = {
    id: 1,
    name: 'Sea',
    water: true,
    color: Color.fromHex('#2878a0'),
}

const SHORE_TYPE = {
    id: 2,
    name: 'Shore',
    water: false,
    color: Color.fromHex('#71b13e'),
}

const PLAINS_TYPE = {
    id: 3,
    name: 'Plain',
    water: false,
    color: Color.fromHex('#99d966'),
}

const PLATEAU_TYPE = {
    id: 4,
    name: 'Plateau',
    water: false,
    color: Color.fromHex('#789d70'),
}

const MOUNTAIN_TYPE = {
    id: 5,
    name: 'Mountain',
    water: false,
    color: Color.fromHex('#9ebf97'),
}


const BASE_NOISE = {octaves: 6, resolution: .8, scale: .02}
const SEA_NOISE = {octaves: 6, resolution: .8, scale: .02}
const PLATEAU_NOISE = {octaves: 6, resolution: .8, scale: .03}
const MOUNTAIN_NOISE = {octaves: 6, resolution: .8, scale: .03}


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
    #landCount = 0

    #buildBaseMap(noiseMap, rect) {
        const outlineNoiseMap = noiseMap.base
        return Matrix.fromRect(rect, point => {
            let outlineNoise = outlineNoiseMap.getNoise(point)
            // LAND TILE ----------------------------------------
            if (outlineNoise >= OUTLINE_RATE) { // is land
                this.#landCount += 1
                // detect adjacent water points
                for(let sidePoint of Point.adjacents(point)) {
                    let sideNoise = outlineNoiseMap.getNoise(sidePoint)
                    if (sideNoise < OUTLINE_RATE) {  // is side water
                        return SHORE_TYPE.id
                    }
                }
                return PLAINS_TYPE.id
            }
            // WATER TILE ----------------------------------------
            for(let sidePoint of Point.adjacents(point)) {
                let sideNoise = outlineNoiseMap.getNoise(sidePoint)
                if (sideNoise >= OUTLINE_RATE) {  // is side land
                    return SEA_TYPE.id
                }
            }

            return OCEAN_TYPE.id
        })
    }

    #buildPlateauMap(baseMap, noiseMap, rect) {
        const plateauNoiseMap = noiseMap.plateau
        return Matrix.fromRect(rect, point => {
            let plateauNoise = plateauNoiseMap.getNoise(point)
            let baseOutlineId = baseMap.get(point)
            if (baseOutlineId !== PLAINS_TYPE.id) {
                return baseOutlineId
            }
            for(let sidePoint of Point.adjacents(point)) {
                let sideBaseOutlineId = baseMap.get(sidePoint)
                if (sideBaseOutlineId === SHORE_TYPE.id) {
                    return PLAINS_TYPE.id
                }
            }
            if (plateauNoise > .5) {
                return PLATEAU_TYPE.id
            }
            return PLAINS_TYPE.id
        })
    }

    constructor(rect, seed) {
        const noiseMap = {
            base: buildNoiseMap(rect, seed, BASE_NOISE),
            sea: buildNoiseMap(rect, seed, SEA_NOISE),
        }
        const baseMap = this.#buildBaseMap(noiseMap, rect)
        this.#map = baseMap
    }

    get(point) {
        const id = this.#map.get(point)
        if (id === OCEAN_TYPE.id) return OCEAN_TYPE
        if (id === SEA_TYPE.id) return SEA_TYPE
        if (id === SHORE_TYPE.id) return SHORE_TYPE
        if (id === PLATEAU_TYPE.id) return PLATEAU_TYPE
        if (id === MOUNTAIN_TYPE.id) return MOUNTAIN_TYPE

        return PLAINS_TYPE
    }

    get landCount() {
        return this.#landCount
    }

    isLand(point) {
        return ! this.get(point).water
    }

    isWater(point) {
        return this.get(point).water
    }
}
