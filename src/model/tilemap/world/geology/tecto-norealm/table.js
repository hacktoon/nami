
export class TectonicsTable {
    static PLATE_CONTINENTAL = 0
    static PLATE_OCEANIC = 100
    static DIR_CONVERGE = 1
    static DIR_TRANSFORM = 4
    static DIR_DIVERGE = 16
    static INT_MAP = {
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
        const intMap = TectonicsTable.INT_MAP
        TECTONICS_TABLE.map(row => {
            const ints = Array.from(row.boundary).map(ch => intMap[ch])
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
        {name: 'Orogeny', features: [0, .6]},
        {name: 'Low mountains', features: [0, .5]},
    ]},

    {boundary: 'LLCT', provinces: [
        {name: 'Low mountains', features: [.1, .3]},
        {name: 'Low mountains', features: [0, .1]},
    ]},

    {boundary: 'LLCD', provinces: [
        {name: 'Low mountains', features: [.1, .3]},
        {name: 'Rift', features: [0, .2]},
    ]},

    {boundary: 'LLDT', provinces: [
        {name: 'Rift', features: [0, .2]},
    ]},

    {boundary: 'LLDD', provinces: [
        {name: 'Rift Sea', features: [0, .5]},
    ]},

    {boundary: 'LLTT', provinces: [
        {name: 'Low mountains', features: [0, .2]},
        {name: 'Low mountains', features: [.1, .2]},
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'LWCC', provinces: [
        {name: 'Oceanic trench',
            granularity: 0,
            features: [.1, .2]
        },
        {name: 'Orogeny',
            granularity: 0,
            features: [.1, .5]
        },
    ]},

    {boundary: 'LWCT', provinces: [
        {name: 'Oceanic trench',
            granularity: 0,
            features: [.1, .3]
        },
        {name: 'Orogeny',
            granularity: 0,
            features: [.1, .6]
        },
    ]},

    {boundary: 'LWCD', provinces: [
        {name: 'Oceanic rift',
            granularity: 0,
            features: [0, .2]
        },
        {name: 'Passive margin',
            granularity: 0,
            features: [.2, 1]
        },
    ]},

    {boundary: 'LWDD', provinces: [
        {name: 'Oceanic Rift',
            granularity: 0,
            features: [0, .5]
        },
        {name: 'Passive margin',
            granularity: 0,
            features: [.4, 1]
        },
    ]},

    {boundary: 'LWDT', provinces: [
        {name: 'Oceanic Rift',
            granularity: 0,
            features: [0, .4]
        },
        {name: 'Passive margin',
            granularity: 0,
            features: [.3, 1]
        },
    ]},

    {boundary: 'LWTT', provinces: [
        {name: 'Oceanic mountains',
            granularity: 0,
            features: [.1, .3]
        },
        {name: 'Island arc basin',
            granularity: 0,
            features: [.1, .3]
        },
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'WWCC', provinces: [
        {name: 'Oceanic trench',
            granularity: 0,
            features: [.1, .3]
        },
        {name: 'Island arc',
            granularity: 0,
            features: [.2, .5]
        },
    ]},

    {boundary: 'WWCT', provinces: [
        {name: 'Oceanic trench',
            granularity: 0,
            features: [.1, .2]
        },
        {name: 'Island arc',
            granularity: 0,
            features: [.2, .3]
        },
    ]},

    {boundary: 'WWCD', provinces: [
        {name: 'Oceanic basin',
            granularity: 0,
            features: [.1, .6]
        },
        {name: 'Oceanic mountains',
            granularity: 0,
            features: [.1, .3]
        },
    ]},

    {boundary: 'WWDD', provinces: [
        {name: 'Oceanic rift',
            granularity: 0,
            features: [0, .3]
        },
    ]},

    {boundary: 'WWDT', provinces: [
        {name: 'Oceanic rift',
            granularity: 0,
            features: [0, .2]
        },
    ]},

    {boundary: 'WWTT', provinces: [
        {name: 'Oceanic mountains',
            granularity: 0,
            features: [.1, .4]
        },
    ]},
]
