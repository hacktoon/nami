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
    #directionMap
    #specTable = new Map() // maps numeric id to boundary config

    constructor(regionTileMap, plateModel) {
        this.#plateModel = plateModel
        this.#regionTileMap = regionTileMap
        this.#directionMap = this._buildDirectionMap(regionTileMap)
    }

    _buildDirectionMap(regionTileMap) {
        // DirectionMap
        // Maps a region X and a region Y to a direction between them
        const {rect} = regionTileMap
        const directionMap = new PairMap()

        for(let regionId of regionTileMap.getRegions()) {
            const origin = regionTileMap.getOriginById(regionId)
            const sideRegionIds = regionTileMap.getSideRegions(regionId)
            for(let sideRegionId of sideRegionIds) {
                const _sideOrigin = regionTileMap.getOriginById(sideRegionId)
                const sideOrigin = rect.unwrapFrom(origin, _sideOrigin)
                const angle = Point.angle(origin, sideOrigin)
                const direction = Direction.fromAngle(angle)
                directionMap.set(regionId, sideRegionId, direction)
            }
        }
        return directionMap
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
