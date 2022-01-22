
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
            this.#map.set(id, row)
        })
    }

    get(boundaryId) {
        return this.#map.get(boundaryId)
    }
}


export const TECTONICS_TABLE = [
    ////////////////////////////////////////////////////////
    // CONTINENTAL-CONTINENTAL
    ////////////////////////////////////////////////////////
    {boundary: 'LLCC', provinces: [
        {name: 'Orogeny', deformation: [0, 8]},
        {name: 'Low mountains', deformation: [0, 4]},
    ]},

    {boundary: 'LLCT', provinces: [
        {name: 'Low mountains', deformation: [1, 3]},
        {name: 'Low mountains', deformation: [0, 1]},
    ]},

    {boundary: 'LLCD', provinces: [
        {name: 'Low mountains', deformation: [1, 2]},
        {name: 'Rift', deformation: [0, 2]},
    ]},

    {boundary: 'LLDT', provinces: [
        {name: 'Rift', deformation: [0, 2]},
    ]},

    {boundary: 'LLDD', provinces: [
        {name: 'Rift Sea', deformation: [0, 10]},
    ]},

    {boundary: 'LLTT', provinces: [
        {name: 'Low mountains', deformation: [0, 2]},
        {name: 'Low mountains', deformation: [1, 2]},
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'LWCC', provinces: [
        {name: 'Oceanic trench', deformation: [1, 2]},
        {name: 'Orogeny', deformation: [1, 5]},
    ]},

    {boundary: 'LWCT', provinces: [
        {name: 'Oceanic trench', deformation: [1, 2]},
        {name: 'Orogeny', deformation: [1, 3]},
    ]},

    {boundary: 'LWCD', provinces: [
        {name: 'Oceanic rift', deformation: [0, 2]},
        {name: 'Passive margin', deformation: [0, 5]},
    ]},

    {boundary: 'LWDD', provinces: [
        {name: 'Oceanic Rift', deformation: [0, 3]},
        {name: 'Passive margin', deformation: [0, 13]},
    ]},

    {boundary: 'LWDT', provinces: [
        {name: 'Oceanic Rift', deformation: [1, 2]},
        {name: 'Passive margin', deformation: [0, 10]},
    ]},

    {boundary: 'LWTT', provinces: [
        {name: 'Oceanic mountains', deformation: [1, 2]},
        {name: 'Island arc basin', deformation: [1, 2]},
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {boundary: 'WWCC', provinces: [
        {name: 'Oceanic trench', deformation: [1, 3]},
        {name: 'Island arc', deformation: [2, 5]},
    ]},

    {boundary: 'WWCT', provinces: [
        {name: 'Oceanic trench', deformation: [1, 2]},
        {name: 'Island arc', deformation: [2, 3]},
    ]},

    {boundary: 'WWCD', provinces: [
        {name: 'Oceanic basin', deformation: [1, 10]},
        {name: 'Oceanic mountains', deformation: [1, 2]},
    ]},

    {boundary: 'WWDD', provinces: [
        {name: 'Oceanic rift', deformation: [0, 2]},
    ]},

    {boundary: 'WWDT', provinces: [
        {name: 'Oceanic rift', deformation: [0, 1]},
    ]},

    {boundary: 'WWTT', provinces: [
        {name: 'Oceanic mountains', deformation: [1, 4]},
    ]},
]
