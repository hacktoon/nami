const PLATE_CONTINENTAL = 0
const PLATE_OCEANIC = 100
const DIR_CONVERGE = 1
const DIR_TRANSFORM = 4
const DIR_DIVERGE = 16
const IDMAP = {
    L: PLATE_CONTINENTAL,
    W: PLATE_OCEANIC,
    C: DIR_CONVERGE,
    D: DIR_DIVERGE,
    T: DIR_TRANSFORM,
}


export class BoundaryTable {
    /*
        Reads the boundary table and translates to manageable data.
        Converts boundary code like 'LLCT' to its numeric id, summing
        each character value.
    */

    #codeTable = new Map() // maps numeric id to boundary config

    constructor(plateModel) {
        this._plateModel = plateModel
        BOUNDARY_TABLE.map(row => {
            const key = Array.from(row.key)
            const id = key.map(ch => IDMAP[ch]).reduce((a, b) => a + b, 0)
            this.#codeTable.set(id, {...row, id})
        })
    }

    get(realmId, sideRealmId, dotTo, dotFrom) {
        const isPlateOceanic = this._plateModel.isOceanic(realmId)
        const isSidePlateOceanic = this._plateModel.isOceanic(sideRealmId)
        const type1 = isPlateOceanic ? PLATE_OCEANIC : PLATE_CONTINENTAL
        const type2 = isSidePlateOceanic ? PLATE_OCEANIC : PLATE_CONTINENTAL
        const dir = this._parseDir(dotTo) + this._parseDir(dotFrom)
        const spec = this.#codeTable.get(type1 + type2 + dir)
        const landscape = this._getLandscape(spec, realmId, sideRealmId)
        return [spec.name, landscape]
    }

    _parseDir(dir) {
        if (dir === 0) return DIR_TRANSFORM
        return dir > 0 ? DIR_CONVERGE : DIR_DIVERGE
    }

    _getLandscape(spec, realmId, sideRealmId) {
        const first = spec.data[0]
        const second = spec.data.length === 1 ? first : spec.data[1]
        const realmWeight = this._plateModel.getWeight(realmId)
        const neighborRealmWeight = this._plateModel.getWeight(sideRealmId)
        const data = realmWeight > neighborRealmWeight ? first : second
        return data.landscape
    }
}


const BOUNDARY_TABLE = [
    // ==============================================
    // CONTINENTAL-CONTINENTAL
    // ==============================================
    {key: 'LLCC', name: 'Continental collision',
    data: [
        {landscape: ['PEAK', 'MOUNTAIN', 'HILL', 'PLAIN']},
        {landscape: ['MOUNTAIN', 'HILL', 'PLAIN']},
    ]},
    // ==============================================
    {key: 'LLCT', name: 'Old mountains',
    data: [
        {landscape: ['MOUNTAIN', 'HILL', 'PLAIN']},
        {landscape: ['HILL', 'PLAIN']},
    ]},
    // ==============================================
    {key: 'LLCD', name: 'Rift valley',
    data: [
        {landscape: ['DEPRESSION', 'PLAIN', 'HILL', 'PLAIN']},
        {landscape: ['PLAIN', 'HILL', 'PLAIN']},
    ]},
    // ==============================================
    {key: 'LLDT', name: 'Early rift sea',
    data: [
        {landscape: ['SHALLOW_SEA', 'PLAIN']},
        {landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL', 'PLAIN']}
    ]},
    // ==============================================
    {key: 'LLDD', name: 'Rift sea',
    data: [
        {landscape: ['DEEP_SEA', 'SHALLOW_SEA', 'PLAIN']},
        {landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL', 'PLAIN']}
    ]},
    // ==============================================
    {key: 'LLTT', name: 'Transform Fault',
    data: [
        {landscape: ['PLAIN', 'HILL', 'PLAIN']}
    ]},


    // ==============================================
    // CONTINENTAL-OCEANIC
    // ==============================================
    {key: 'LWCC', name: 'Cordillera',
    data: [
        {landscape: ['TRENCH', 'DEEP_SEA']},
        {landscape: ['PLAIN', 'PEAK', 'MOUNTAIN', 'HILL']},
    ]},
    // ==============================================
    {key: 'LWCT', name: 'Early cordillera',
    data: [
        {landscape: ['TRENCH', 'DEEP_SEA']},
        {landscape: ['PLAIN', 'MOUNTAIN', 'HILL', 'PLAIN']},
    ]},
    // ==============================================
    {key: 'LWCD', name: 'Early passive margin',
    data: [
        {landscape: ['SHALLOW_SEA', 'DEEP_SEA']},
        {landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL', 'PLAIN']},
    ]},
    // ==============================================
    {key: 'LWDD', name: 'Passive margin',
    data: [
        {landscape: ['SHALLOW_SEA', 'DEEP_SEA',]},
        {landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL', 'PLAIN',]},
    ]},
    // ==============================================
    {key: 'LWDT', name: 'Island arc basin',
    data: [
        {landscape: ['SHALLOW_SEA', 'ISLAND', 'DEEP_SEA']},
        {landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL', 'PLAIN']},
    ]},
    // ==============================================
    {key: 'LWTT', name: 'Coastal fault',
    data: [
        {landscape: ['TRENCH', 'DEEP_SEA']},
        {landscape: ['DEEP_SEA', 'PLAIN', 'HILL']},
    ]},


    // ==============================================
    // OCEANIC-OCEANIC
    // ==============================================
    {key: 'WWCC', name: 'Island arc',
    data: [
        {landscape: ['TRENCH', 'DEEP_SEA']},
        {landscape: ['SHALLOW_SEA', 'ISLAND', 'DEEP_SEA']},
    ]},
    // ==============================================
    {key: 'WWCT', name: 'Early island arc',
    data: [
        {landscape: ['DEEP_SEA']},
        {landscape: ['SHALLOW_SEA', 'ISLAND', 'DEEP_SEA',]},
    ]},
    // ==============================================
    {key: 'WWCD', name: 'Abyssal plains',
    data: [
        {landscape: ['DEEP_SEA']},
    ]},
    // ==============================================
    {key: 'WWDD', name: 'Oceanic rift',
    data: [
        {landscape: ['TRENCH', 'DEEP_SEA',]},
        {landscape: ['DEEP_SEA']}
    ]},
    // ==============================================
    {key: 'WWDT', name: 'Early oceanic rift',
    data: [
        {landscape: ['DEEP_SEA']},
    ]},
    // ==============================================
    {key: 'WWTT', name: 'Oceanic fault',
    data: [
        {landscape: ['SHALLOW_SEA', 'DEEP_SEA']},
        {landscape: ['DEEP_SEA']}
    ]},
]