export class Feature {
    // land features
    static MOUNTAIN = 0
    static PLATFORM = 1 // plateaus and hills
    static HILL = 2
    static PLAIN = 3
    static DEPRESSION = 4 // must have province border
    static RIFT_SEA = 5
    // water features
    static ISLAND_ARC = 6
    static SEAMOUNT = 7
    static OCEANIC_RIDGE = 8
    static OCEANIC_PLAIN = 9
    static TRENCH = 10
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
            range: [0, .5]
        },
        {feature: Feature.MOUNTAIN,
            range: [0, .4]
        },
    ]},

    {boundary: 'LLCT', provinces: [
        {feature: Feature.PLATFORM,
            range: [.1, .3]
        },
        {feature: Feature.HILL,
            range: [0, .1]
        },
    ]},

    {boundary: 'LLCD', provinces: [
        {feature: Feature.HILL,
            range: [.1, .3]
        },
        {feature: Feature.DEPRESSION,
            range: [0, .2]
        },
    ]},

    {boundary: 'LLDT', provinces: [
        {feature: Feature.RIFT_SEA,
            range: [0, .5]
        },
        {feature: Feature.HILL,
            range: [0, .3]
        },
    ]},

    {boundary: 'LLDD', provinces: [
        {feature: Feature.RIFT_SEA,
            range: [0, .5]
        },
        {feature: Feature.RIFT_SEA,
            range: [0, .6]
        },
    ]},

    {boundary: 'LLTT', provinces: [
        {feature: Feature.HILL,
            range: [0, .2]
        },
        {feature: Feature.HILL,
            range: [.1, .2]
        },
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'LWCC', provinces: [
        {feature: Feature.TRENCH,
            range: [.1, .2]
        },
        {feature: Feature.MOUNTAIN,
            range: [.1, .5]
        },
    ]},

    {boundary: 'LWCT', provinces: [
        {feature: Feature.TRENCH,
            range: [.1, .2]
        },
        {feature: Feature.HILL,
            range: [.1, .4]
        },
    ]},

    {boundary: 'LWCD', provinces: [
        {feature: Feature.OCEANIC_RIDGE,
            range: [0, .2]
        },
        {feature: Feature.RIFT_SEA,
            range: [0, .5]
        },
    ]},

    {boundary: 'LWDD', provinces: [
        {feature: Feature.ISLAND_ARC,
            range: [.1, .2]
        },
        {feature: Feature.HILL,
            range: [.1, .4]
        },
    ]},

    {boundary: 'LWDT', provinces: [
        {feature: Feature.OCEANIC_RIDGE,
            range: [0, .4]
        },
        {feature: Feature.HILL,
            range: [0, .5]
        },
    ]},

    {boundary: 'LWTT', provinces: [
        {feature: Feature.ISLAND_ARC,
            range: [.2, .3]
        },
        {feature: Feature.RIFT_SEA,
            range: [.2, .5]
        },
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'WWCC', provinces: [
        {feature: Feature.TRENCH,
            range: [.1, .3]
        },
        {feature: Feature.ISLAND_ARC,
            range: [.1, .5]
        },
    ]},

    {boundary: 'WWCT', provinces: [
        {feature: Feature.ISLAND_ARC,
            range: [0, .1]
        },
        {feature: Feature.SEAMOUNT,
            range: [.1, .3]
        },
    ]},

    {boundary: 'WWCD', provinces: [
        {feature: Feature.ISLAND_ARC,
            range: [.1, .5]
        },
        {feature: Feature.OCEANIC_PLAIN,
            range: [.1, .3]
        },
    ]},

    {boundary: 'WWDD', provinces: [
        {feature: Feature.OCEANIC_RIDGE,
            range: [0, .3]
        },
    ]},

    {boundary: 'WWDT', provinces: [
        {feature: Feature.TRENCH,
            range: [0, .2]
        },
        {feature: Feature.SEAMOUNT,
            range: [0, .2]
        },
    ]},

    {boundary: 'WWTT', provinces: [
        {feature: Feature.SEAMOUNT,
            range: [.1, .4]
        },
    ]},
]
