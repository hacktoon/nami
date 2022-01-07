import { PairMap } from '/lib/map'
import { Direction } from '/lib/direction'
import { Point } from '/lib/point'


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


export class BoundaryModel {
    /*
        Reads the boundary table and translates to province.
        Converts boundary code like 'LLCT' to its numeric id, summing
        each character value.
    */

    #plateModel
    #regionTileMap
    #specMap
    #boundaryMap  // maps numeric id to boundary config

    constructor(regionTileMap, plateModel) {
        this.#plateModel = plateModel
        this.#regionTileMap = regionTileMap
        this.#specMap = this._buildBoundarySpecMap()
        // this.#boundaryMap = this._buildBoundaryMap(regionTileMap)
    }

    _buildBoundarySpecMap() {
        const map = new Map()
        // convert the boundary key
        // to a sum of its char int codes
        // Ex: LLCC = 0011 = 0 + 0 + 1 + 1 = 2
        BOUNDARY_TABLE.map(row => {
            const chars = Array.from(row.key)
            const id = chars.map(ch => IDMAP[ch]).reduce((a, b) => a + b, 0)
            map.set(id, {...row, id})
        })
        return map
    }

    _buildBoundaryMap(regionTileMap) {
        // DirectionMap
        // Maps a region X and a region Y to a direction between them
        const pairMap = new PairMap()

        for(let region of regionTileMap.getRegions()) {
            const origin = regionTileMap.getOriginById(region)
            for(let sideRegion of regionTileMap.getSideRegions(region)) {
                const sideOrigin = regionTileMap.getOriginById(sideRegion)
                const bdry = this._buildBoundary(
                    region, sideRegion, origin, sideOrigin
                )
                pairMap.set(region, sideRegion, bdry)
            }
        }
        return pairMap
    }

    _buildBoundary(region, sideRegion, origin, sideOrigin) {
        const _sideOrigin = this.#regionTileMap.rect.unwrapFrom(origin, sideOrigin)
        const boundaryId = this._buildBoundaryId(
            region, sideRegion,
            origin, _sideOrigin
        )
        const spec = this.#specMap.get(boundaryId)
        const heavier = spec.data[0]
        const lighter = spec.data.length === 1 ? heavier : spec.data[1]
        const realmWeight = this.#plateModel.getWeight(region)
        const neighborRealmWeight = this.#plateModel.getWeight(sideRegion)
        const data = realmWeight > neighborRealmWeight ? heavier : lighter
        return data.landscape
    }

    _buildBoundaryId(region, sideRegion, origin, sideOrigin) {
        const dirToSide = this._getDirection(origin, sideOrigin)
        const dirFromSide = this._getDirection(sideOrigin, origin)
        const plateDir = this.#plateModel.getDirection(region)
        const sidePlateDir = this.#plateModel.getDirection(sideRegion)
        const dotTo = Direction.dotProduct(plateDir, dirToSide)
        const dotFrom = Direction.dotProduct(sidePlateDir, dirFromSide)
        const directionTo = this._parseDir(dotTo)
        const directionFrom = this._parseDir(dotFrom)
        const isPlateOceanic = this.#plateModel.isOceanic(region)
        const isSidePlateOceanic = this.#plateModel.isOceanic(sideRegion)
        const type1 = isPlateOceanic ? PLATE_OCEANIC : PLATE_CONTINENTAL
        const type2 = isSidePlateOceanic ? PLATE_OCEANIC : PLATE_CONTINENTAL
        return type1 + type2 + directionTo + directionFrom
    }

    _getDirection(origin, sideOrigin) {
        const angle = Point.angle(origin, sideOrigin)
        return Direction.fromAngle(angle)
    }

    _parseDir(dir) {
        if (dir === 0) return DIR_TRANSFORM
        return dir > 0 ? DIR_CONVERGE : DIR_DIVERGE
    }
}


const BOUNDARY_TABLE = [
    ////////////////////////////////////////////////////////
    // CONTINENTAL-CONTINENTAL
    ////////////////////////////////////////////////////////
    {key: 'LLCC', data: [
        {name: 'High mountains',
            landscape: ['PEAK', 'MOUNTAIN', 'HILL', 'PLAIN']},
        {name: 'Low mountains',
            landscape: ['MOUNTAIN', 'HILL', 'PLAIN']},
    ]},

    {key: 'LLCT', data: [
        {name: 'Low mountains',
            landscape: ['MOUNTAIN', 'HILL', 'PLAIN']},
        {name: 'Platform',
            landscape: ['HILL', 'PLAIN']},
    ]},

    {key: 'LLCD', data: [
        {name: 'Low mountains',
            landscape: ['DEPRESSION', 'PLAIN']},
        {name: 'Rift',
            landscape: ['PLAIN', 'HILL', 'PLAIN']},
    ]},

    {key: 'LLDT', name: 'Early rift sea', data: [
        {name: 'Rift',
            landscape: ['SHALLOW_SEA', 'PLAIN']},
        {name: 'Rift',
            landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL', 'PLAIN']}
    ]},

    {key: 'LLDD', name: 'Rift sea', data: [
        {name: 'Rift',
            landscape: ['DEEP_SEA', 'SHALLOW_SEA', 'PLAIN']},
        {name: 'Rift',
            landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL', 'PLAIN']}
    ]},

    {key: 'LLTT', name: 'Transform Fault', data: [
        {name: 'Basin',
            landscape: ['PLAIN']},
        {name: 'Basin',
            landscape: ['PLAIN', 'HILL', 'PLAIN']}
    ]},


    ////////////////////////////////////////////////////////
    // CONTINENTAL-OCEANIC
    ////////////////////////////////////////////////////////
    {key: 'LWCC', name: 'Cordillera', data: [
        {name: 'Oceanic trench',
            landscape: ['TRENCH', 'DEEP_SEA']},
        {name: 'Orogeny',
            landscape: ['HILL', 'MOUNTAIN', 'PEAK', 'MOUNTAIN', 'HILL']},
    ]},

    {key: 'LWCT', name: 'Early cordillera', data: [
        {name: 'Oceanic trench',
            landscape: ['TRENCH', 'DEEP_SEA']},
        {name: 'Orogeny',
            landscape: ['PLAIN', 'MOUNTAIN', 'HILL', 'PLAIN']},
    ]},

    {key: 'LWCD', name: 'Early passive margin', data: [
        {name: 'Passive margin',
            landscape: ['SHALLOW_SEA', 'DEEP_SEA']},
        {name: 'Passive margin',
            landscape: ['SHALLOW_SEA', 'PLAIN']},
    ]},

    {key: 'LWDD', name: 'Passive margin', data: [
        {name: 'Passive margin',
            landscape: ['SHALLOW_SEA', 'DEEP_SEA',]},
        {name: 'Passive margin',
            landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL', 'PLAIN',]},
    ]},

    {key: 'LWDT', name: 'Island arc basin', data: [
        {name: 'Island arc',
            landscape: ['SHALLOW_SEA', 'ISLAND', 'DEEP_SEA', 'TRENCH', 'DEEP_SEA']},
        {name: 'Passive margin',
            landscape: ['SHALLOW_SEA', 'PLAIN', 'HILL']},
    ]},

    {key: 'LWTT', name: 'Coastal fault', data: [
        {name: 'Oceanic basin',
            landscape: ['TRENCH', 'DEEP_SEA']},
        {name: 'Oceanic basin',
            landscape: ['DEEP_SEA', 'PLAIN', 'HILL']},
    ]},


    ////////////////////////////////////////////////////////
    // OCEANIC-OCEANIC
    ////////////////////////////////////////////////////////
    {key: 'WWCC', name: 'Island arc', data: [
        {name: 'Oceanic trench',
            landscape: ['TRENCH', 'DEEP_SEA']},
        {name: 'Island arc',
            landscape: ['SHALLOW_SEA', 'ISLAND', 'DEEP_SEA']},
    ]},

    {key: 'WWCT', name: 'Early island arc', data: [
        {name: 'Island arc',
            landscape: ['DEEP_SEA']},
        {name: 'Island arc',
            landscape: ['SHALLOW_SEA', 'ISLAND', 'DEEP_SEA',]},
    ]},

    {key: 'WWCD', name: 'Abyssal plains', data: [
        {name: 'Oceanic basin',
            landscape: ['DEEP_SEA']},
    ]},

    {key: 'WWDD', name: 'Oceanic rift', data: [
        {name: 'Oceanic rift',
            landscape: ['TRENCH', 'DEEP_SEA',]},
        {name: 'Oceanic basin',
            landscape: ['DEEP_SEA']}
    ]},

    {key: 'WWDT', name: 'Early oceanic rift', data: [
        {name: 'Oceanic rift',
            landscape: ['DEEP_SEA']},
    ]},

    {key: 'WWTT', name: 'Oceanic fault', data: [
        {name: 'Oceanic basin',
            landscape: ['SHALLOW_SEA', 'DEEP_SEA']},
        {name: 'Oceanic basin',
            landscape: ['DEEP_SEA']}
    ]},
]
