export class Feature {
    // land features
    static MOUNTAIN = 0
    static PLATFORM = 1 // plateaus and hills
    static HILL = 2
    static PLAIN = 3
    static DEPRESSION = 4 // must have province border
    static PASSIVE_MARGIN = 5
    // water features
    static RIFT_SEA = 5
    static ISLAND_ARC = 5
    static OCEANIC_HILL = 5
    static OCEANIC_RIDGE = 5
    static OCEANIC_PLAIN = 5
    static OCEANIC_TRENCH = 5
}


export class TectonicsTable {
    static PLATE_CONTINENTAL = 0
    static PLATE_OCEANIC = 100
    static DIR_CONVERGE = 1
    static DIR_TRANSFORM = 4
    static DIR_DIVERGE = 16
    static BOUNDARY_CODE = {
        L: TectonicsTable.PLATE_CONTINENTAL,
        W: TectonicsTable.PLATE_OCEANIC,
        C: TectonicsTable.DIR_CONVERGE,
        D: TectonicsTable.DIR_DIVERGE,
        T: TectonicsTable.DIR_TRANSFORM,
    }

    #map = new Map()

    constructor() {
        // convert the boundary to a sum of its char int codes
        // Ex: LLCC = 0011 = 0 + 0 + 1 + 1 = 2
        TECTONICS_TABLE.map(row => {
            const ints = Array.from(row.boundary).map(ch => {
                // convert each letter to its integer value
                return TectonicsTable.BOUNDARY_CODE[ch]
            })
            const id = ints.reduce((a, b) => a + b, 0)
            const provinces = row.provinces
            const heavier = provinces[0]
            const lighter = provinces.length > 1 ? provinces[1] : heavier
            this.#map.set(id, {...row, provinces: [heavier, lighter]})
        })
    }

    getBoundary(boundaryId) {
        return this.#map.get(boundaryId)
    }
}


const TECTONICS_TABLE = [
    ////////////////////////////////////////////////////////
    // CONTINENTAL-CONTINENTAL
    ////////////////////////////////////////////////////////
    {boundary: 'LLCC', provinces: [
        {feature: Feature.MOUNTAIN,
            features: [[0, .5]]
        },
        {feature: Feature.MOUNTAIN,
            features: [[0, .4]]
        },
    ]},

    {boundary: 'LLCT', provinces: [
        {feature: Feature.MOUNTAIN,
            features: [[.1, .3]]
        },
        {feature: Feature.MOUNTAIN,
            features: [[0, .1]]
        },
    ]},

    {boundary: 'LLCD', provinces: [
        {feature: Feature.MOUNTAIN,
            features: [[.1, .3]]
        },
        {feature: Feature.DEPRESSION,
            features: [[0, .2]]
        },
    ]},

    {boundary: 'LLDT', provinces: [
        {feature: Feature.DEPRESSION,
            features: [[0, .2]]
        },
    ]},

    {boundary: 'LLDD', provinces: [
        {feature: Feature.SHALLOW_WATER,
            features: [[0, .5]]
        },
    ]},

    {boundary: 'LLTT', provinces: [
        {feature: Feature.MOUNTAIN,
            features: [[0, .2]]
        },
        {feature: Feature.MOUNTAIN,
            features: [[.1, .2]]
        },
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'LWCC', provinces: [
        {feature: Feature.TRENCH,
            features: [[.1, .2]]
        },
        {feature: Feature.UPLIFT,
            features: [[.1, .5]]
        },
    ]},

    {boundary: 'LWCT', provinces: [
        {feature: Feature.TRENCH,
            features: [[.1, .2]]
        },
        {feature: Feature.UPLIFT,
            features: [[.1, .4]]
        },
    ]},

    {boundary: 'LWCD', provinces: [
        {feature: Feature.RIDGE,
            features: [[0, .2]]
        },
        {feature: Feature.SHALLOW_WATER,
            features: [[0, .3]]
        },
    ]},

    {boundary: 'LWDD', provinces: [
        {feature: Feature.RIDGE,
            features: [[0, .5]]
        },
        {feature: Feature.SHALLOW_WATER,
            features: [[0, .4]]
        },
    ]},

    {boundary: 'LWDT', provinces: [
        {feature: Feature.RIDGE,
            features: [[0, .4]]
        },
        {feature: Feature.SHALLOW_WATER,
            features: [[0, .5]]
        },
    ]},

    {boundary: 'LWTT', provinces: [
        {feature: Feature.UPLIFT,
            features: [[.1, .3]]
        },
        {feature: Feature.ARCHIPELAGO,
            features: [[.1, .4]]
        },
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'WWCC', provinces: [
        {feature: Feature.TRENCH,
            features: [[.1, .3]]
        },
        {feature: Feature.ARCHIPELAGO,
            features: [[.1, .5]]
        },
    ]},

    {boundary: 'WWCT', provinces: [
        {feature: Feature.TRENCH,
            features: [[0, .1]]
        },
        {feature: Feature.ARCHIPELAGO,
            features: [[.1, .3]]
        },
    ]},

    {boundary: 'WWCD', provinces: [
        {feature: Feature.UPLIFT,
            features: [[.1, .6]]
        },
        {feature: Feature.UPLIFT,
            features: [[.1, .3]]
        },
    ]},

    {boundary: 'WWDD', provinces: [
        {feature: Feature.UPLIFT,
            features: [[0, .3]]
        },
    ]},

    {boundary: 'WWDT', provinces: [
        {feature: Feature.UPLIFT,
            features: [[0, .2]]
        },
    ]},

    {boundary: 'WWTT', provinces: [
        {feature: Feature.UPLIFT,
            features: [[.1, .4]]
        },
    ]},
]
