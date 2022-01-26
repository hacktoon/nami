export class Feature {
    static PEAK = 0
    static MOUNTAIN = 1
    static HILL = 2
    static PLAIN = 3
    static DEPRESSION = 4
    static ARCHIPELAGO = 5
    static RIDGE = 6
    static SHALLOW_WATER = 7
    static DEEP_WATER = 8
    static TRENCH = 9
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
        {name: 'Orogeny',
            border: false, // avoid putting features on border
            features: [[0, .5], Feature.UPLIFT]
        },
        {name: 'Orogeny',
            features: [[0, .4], Feature.MOUNTAIN]
        },
    ]},

    {boundary: 'LLCT', provinces: [
        {name: 'Low mountains',
            features: [[.1, .3], Feature.MOUNTAIN]
        },
        {name: 'Low mountains',
            features: [[0, .1], Feature.MOUNTAIN]
        },
    ]},

    {boundary: 'LLCD', provinces: [
        {name: 'Low mountains',
            features: [[.1, .3], Feature.MOUNTAIN]
        },
        {name: 'Rift',
            features: [[0, .2], Feature.DEPRESSION]
        },
    ]},

    {boundary: 'LLDT', provinces: [
        {name: 'Rift',
            features: [[0, .2], Feature.DEPRESSION]
        },
    ]},

    {boundary: 'LLDD', provinces: [
        {name: 'Rift Sea',
            features: [[0, .5], Feature.SHALLOW_WATER]
        },
    ]},

    {boundary: 'LLTT', provinces: [
        {name: 'Low mountains',
            features: [[0, .2], Feature.MOUNTAIN]
        },
        {name: 'Low mountains',
            features: [[.1, .2], Feature.MOUNTAIN]
        },
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'LWCC', provinces: [
        {name: 'Oceanic trench',
            features: [[.1, .2], Feature.TRENCH]
        },
        {name: 'Orogeny',
            features: [[.1, .5], Feature.UPLIFT]
        },
    ]},

    {boundary: 'LWCT', provinces: [
        {name: 'Early oceanic trench',
            features: [[.1, .2], Feature.TRENCH]
        },
        {name: 'Early orogeny',
            features: [[.1, .4], Feature.UPLIFT]
        },
    ]},

    {boundary: 'LWCD', provinces: [
        {name: 'Early oceanic ridge',
            features: [[0, .2], Feature.RIDGE]
        },
        {name: 'Passive margin',
            features: [[0, .3], Feature.SHALLOW_WATER]
        },
    ]},

    {boundary: 'LWDD', provinces: [
        {name: 'Oceanic ridge',
            features: [[0, .5], Feature.RIDGE]
        },
        {name: 'Passive margin',
            features: [[0, .4], Feature.SHALLOW_WATER]
        },
    ]},

    {boundary: 'LWDT', provinces: [
        {name: 'Oceanic Ridge',
            features: [[0, .4], Feature.RIDGE]
        },
        {name: 'Passive margin',
            features: [[0, .5], Feature.SHALLOW_WATER]
        },
    ]},

    {boundary: 'LWTT', provinces: [
        {name: 'Oceanic mountains',
            features: [[.1, .3], Feature.UPLIFT]
        },
        {name: 'Island arc basin',
            features: [[.1, .4], Feature.ARCHIPELAGO]
        },
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'WWCC', provinces: [
        {name: 'Oceanic trench',
            features: [[.1, .3], Feature.TRENCH]
        },
        {name: 'Island arc',
            features: [[.1, .5], Feature.ARCHIPELAGO]
        },
    ]},

    {boundary: 'WWCT', provinces: [
        {name: 'Early oceanic trench',
            features: [[0, .1], Feature.TRENCH]
        },
        {name: 'Early island arc',
            features: [[.1, .3], Feature.ARCHIPELAGO]
        },
    ]},

    {boundary: 'WWCD', provinces: [
        {name: 'Oceanic basin',
            features: [[.1, .6], Feature.UPLIFT]
        },
        {name: 'Oceanic mountains',
            features: [[.1, .3], Feature.UPLIFT]
        },
    ]},

    {boundary: 'WWDD', provinces: [
        {name: 'Oceanic rift',
            features: [[0, .3], Feature.UPLIFT]
        },
    ]},

    {boundary: 'WWDT', provinces: [
        {name: 'Oceanic rift',
            features: [[0, .2], Feature.UPLIFT]
        },
    ]},

    {boundary: 'WWTT', provinces: [
        {name: 'Oceanic mountains',
            features: [[.1, .4], Feature.UPLIFT]
        },
    ]},
]
