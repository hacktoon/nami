import { Color } from '/src/lib/color'


const CLIMATE_TABLE = [
    {
        id: 0,
        ratio: 0,
        name: 'Tropical',
        color: Color.fromHex('#ff4444'),
    },
    {
        id: 1,
        ratio: .4,
        name: 'Subtropical',
        color: Color.fromHex('#ffc600'),
    },
    {
        id: 2,
        ratio: .6,
        name: 'Temperate',
        color: Color.fromHex('#99d966'),
    },
    {
        id: 3,
        ratio: .8,
        name: 'Polar',
        color: Color.fromHex('#c4fdff'),
    },
]


export class ClimateModel {
    constructor() {
        const entries = CLIMATE_TABLE.map(climate => [climate.id, climate])
        this.idMap = new Map(entries)
    }

    climates() {
        return CLIMATE_TABLE
    }

    climateByRatio(ratio) {
        // discover zone based on ratio value [0, 1]
        let item = CLIMATE_TABLE[0]
        for (let climate of CLIMATE_TABLE) {
            if (ratio >= climate.ratio)
                item = climate
        }
        return item
    }

    fromId(id) {
        return this.idMap.get(id)
    }
}
