import { Color } from '/src/lib/color'
import { NoiseTileMap } from '/src/model/tilemap/noise'


const CLIMATE_TYPES = [
    {
        id: 3,
        ratio: .8,
        name: 'Polar',
        color: Color.fromHex('#c4fdff'),
    },
    {
        id: 2,
        ratio: .6,
        name: 'Temperate',
        color: Color.fromHex('#99d966'),
    },
    {
        id: 1,
        ratio: .4,
        name: 'Subtropical',
        color: Color.fromHex('#ffc600'),
    },
    {
        id: 0,
        ratio: 0,
        name: 'Tropical',
        color: Color.fromHex('#ff4444'),
    },
]

function buildNoiseTileMap(rect, seed) {
    return NoiseTileMap.fromData({
        rect: rect.hash(),
        octaves: 6,
        resolution: .7,
        scale: .02,
        seed: seed,
    })
}

export class ClimateModel {
    #noiseMap

    constructor(rect, seed) {
        const entries = CLIMATE_TYPES.map(climate => [climate.id, climate])
        this.idMap = new Map(entries)
        this.#noiseMap = buildNoiseTileMap(rect, seed)
    }

    getNoise(point) {
        return this.#noiseMap.getNoise(point)
    }

    climates() {
        return CLIMATE_TYPES
    }

    get(ratio) {
        // discover zone based on ratio value [0, 1]
        for (let type of CLIMATE_TYPES) {
            if (ratio >= type.ratio)
                return type
        }
        return CLIMATE_TYPES[CLIMATE_TYPES.length - 1]
    }

    fromId(id) {
        return this.idMap.get(id)
    }
}
