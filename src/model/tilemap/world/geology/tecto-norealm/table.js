
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
        let provinceId = 0
        TECTONICS_TABLE.map(row => {
            const ints = Array.from(row.boundary).map(ch => intMap[ch])
            const id = ints.reduce((a, b) => a + b, 0)
            const provinces = row.provinces
            const heavier = provinces[0]
            const lighter = provinces.length > 1 ? provinces[1] : heavier
            const provincesList = [
                {...heavier, id: provinceId++},
                {...lighter, id: provinceId++},
            ]
            this.#map.set(id, {...row, provinces: provincesList})
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
        {name: 'Orogeny', features: [0, 8]},
        {name: 'Low mountains', features: [0, 4]},
    ]},

    {boundary: 'LLCT', provinces: [
        {name: 'Low mountains', features: [1, 3]},
        {name: 'Low mountains', features: [0, 1]},
    ]},

    {boundary: 'LLCD', provinces: [
        {name: 'Low mountains', features: [1, 2]},
        {name: 'Rift', features: [0, 2]},
    ]},

    {boundary: 'LLDT', provinces: [
        {name: 'Rift', features: [0, 2]},
    ]},

    {boundary: 'LLDD', provinces: [
        {name: 'Rift Sea', features: [0, 10]},
    ]},

    {boundary: 'LLTT', provinces: [
        {name: 'Low mountains', features: [0, 2]},
        {name: 'Low mountains', features: [1, 2]},
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'LWCC', provinces: [
        {name: 'Oceanic trench', features: [1, 3]},
        {name: 'Orogeny', features: [1, 5]},
    ]},

    {boundary: 'LWCT', provinces: [
        {name: 'Oceanic trench', features: [1, 3]},
        {name: 'Orogeny', features: [1, 6]},
    ]},

    {boundary: 'LWCD', provinces: [
        {name: 'Oceanic rift', features: [0, 2]},
        {name: 'Passive margin', features: [0, 5]},
    ]},

    {boundary: 'LWDD', provinces: [
        {name: 'Oceanic Rift', features: [0, 3]},
        {name: 'Passive margin', features: [0, 13]},
    ]},

    {boundary: 'LWDT', provinces: [
        {name: 'Oceanic Rift', features: [1, 2]},
        {name: 'Passive margin', features: [0, 10]},
    ]},

    {boundary: 'LWTT', provinces: [
        {name: 'Oceanic mountains', features: [1, 2]},
        {name: 'Island arc basin', features: [1, 2]},
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'WWCC', provinces: [
        {name: 'Oceanic trench', features: [1, 3]},
        {name: 'Island arc', features: [2, 5]},
    ]},

    {boundary: 'WWCT', provinces: [
        {name: 'Oceanic trench', features: [1, 2]},
        {name: 'Island arc', features: [2, 3]},
    ]},

    {boundary: 'WWCD', provinces: [
        {name: 'Oceanic basin', features: [1, 10]},
        {name: 'Oceanic mountains', features: [1, 2]},
    ]},

    {boundary: 'WWDD', provinces: [
        {name: 'Oceanic rift', features: [0, 2]},
    ]},

    {boundary: 'WWDT', provinces: [
        {name: 'Oceanic rift', features: [0, 1]},
    ]},

    {boundary: 'WWTT', provinces: [
        {name: 'Oceanic mountains', features: [1, 4]},
    ]},
]
