import _ from 'lodash'

import { Grid } from '../../lib/grid'
import { HeightMap } from '../../lib/heightmap'
import { Direction } from '../../lib/base'

const TRENCH = 0
const DEEP = 1
const SHALLOW = 2
const BASIN = 3
const PLATFORM = 4
const HIGHLAND = 5
const MOUNTAIN = 6
const PEAK = 7

const RELIEF_TABLE = [
    { id: TRENCH, height: 0, color: "#000045", name: "Trench"},
    { id: DEEP, height: 1, color: "#000045",  name: "Deep"},
    { id: SHALLOW, height: 120, color: "#000078", name: "Shallow"},
    { id: BASIN, height: 170, color: "#0a5816", name: "Basin" },
    { id: PLATFORM, height: 190, color: "#31771a", name: "Platform" },
    { id: HIGHLAND, height: 235, color: "#6f942b", name: "Highland" },
    { id: MOUNTAIN, height: 254,  color: "#AAAAAA", name: "Mountain" },
    { id: PEAK, height: 257,  color: "#EEEEEE", name: "Peak" }
]


class Relief {
    constructor(id) {
        this.data = RELIEF_TABLE[id]
    }

    get id() { return this.data.id }
    get color () { return this.data.color }
    get name () { return this.data.name }
    get isWater () { return this.data.id <= SHALLOW }
    get isLand() { return ! this.isWater }
    get isMiddle () {
        let middle = Math.floor(RELIEF_TABLE.length / 2)
        return this.data.id == middle
    }

    raise (amount=1) {
        let newId = this.data.id + amount
        let id = _.clamp(newId, 0, RELIEF_TABLE.length-1)
        this.data = RELIEF_TABLE[id]
    }

    lower (amount=1) {
        let newId = this.data.id - amount
        let id = _.clamp(newId, 0, RELIEF_TABLE.length-1)
        this.data = RELIEF_TABLE[id]
    }

    level(newId) {
        let oldId = this.data.id
        let id = _.clamp(newId, 0, RELIEF_TABLE.length - 1)
        if (oldId > id) {
            this.data = RELIEF_TABLE[id]
        }
    }

    get isTrench() { return this.data.id == TRENCH }
    get isDeep() { return this.data.id == DEEP }
    get isShallow() { return this.data.id == SHALLOW }
    get isBasin() { return this.data.id == BASIN }
    get isPlatform() { return this.data.id == PLATFORM }
    get isHighland() { return this.data.id == HIGHLAND }
    get isMountain() { return this.data.id == MOUNTAIN }
    get isPeak() { return this.data.id == PEAK }

    get isRiverPossible() { return this.isHighland }
}


export class ReliefMap {
    constructor(size, roughness) {
        this.grid = new Grid(size, size)
        this.gridMask = new HeightMap(size, roughness)

        new HeightMap(size, roughness, (point, height) => {
            let relief = this.buildRelief(point, height)
            this.grid.set(point, relief)
        })

        this.filterMap()
    }

    get(point) {
        return this.grid.get(point)
    }

    iter(callback) {
        this.grid.forEach(callback)
    }

    filterMap() {
        /*
            DIRECTION PATTERN
            1  2  4
            8     16
            32 64 128

            Ex: 2 + 64 = NORTH + SOUTH
        */
       const filterByAdjacentTiles = (relief, point) => {
           const adjacentTilesSum = 2 + 8 + 16 + 64
            let higherTileSum = 0
            let lowerTileSum = 0

            point.adjacentPoints((neighborPoint, dir) => {
                let neighborId = this.get(neighborPoint).id
                if (neighborId > relief.id) higherTileSum += dir
                if (neighborId < relief.id) lowerTileSum += dir
            })

            // fill one-tile holes
            if (higherTileSum == adjacentTilesSum) relief.raise()
            if (lowerTileSum == adjacentTilesSum) relief.lower()
        }

        const filterByTilesAround = (relief, point) => {
            const totalSum = 255
            let lowerTileSum = 0
            let sameOrHigherTileSum = 0

            point.pointsAround((neighborPoint, dir) => {
                let neighborId = this.get(neighborPoint).id
                if (neighborId < relief.id) lowerTileSum += dir
                if (neighborId >= relief.id) sameOrHigherTileSum += dir
            })

            /*
            remove pointy edges
            . . .
            . 1 1  -- lower the middle point
            . . .
             */
            if ([totalSum - Direction.NORTH, totalSum - Direction.WEST,
                totalSum - Direction.EAST, totalSum - Direction.SOUTH
            ].includes(lowerTileSum)) relief.lower()

            /*
            remove pointy corners
            . 1 1
            . 1 1  -- lower the middle point
            . . .
             */
            if ([
                Direction.NORTHEAST + Direction.NORTH + Direction.EAST,
                Direction.NORTHWEST + Direction.NORTH + Direction.WEST,
                Direction.SOUTHEAST + Direction.SOUTH + Direction.EAST,
                Direction.SOUTHWEST + Direction.SOUTH + Direction.WEST
            ].includes(sameOrHigherTileSum)) relief.lower()

            /*
            remove bridges
            . . .
            1 1 1  -- lower the middle point
            . . .
             */
            if ([
                Direction.NORTH + Direction.SOUTH,
                Direction.EAST + Direction.WEST,
            ].includes(sameOrHigherTileSum)) relief.lower()
        }

        this.iter((relief, point) => {
            filterByAdjacentTiles(relief, point)
            filterByTilesAround(relief, point)
        })
    }

    buildRelief(point, height) {
        let id = this.getReliefId(height)
        let relief = new Relief(id)
        let maskRelief = this.buildMaskRelief(point)

        return this.filterRelief(relief, maskRelief)
    }

    getReliefId(height) {
        let id = TRENCH
        for (let reliefData of RELIEF_TABLE) {
            if (height >= reliefData.height) {
                id = reliefData.id
            } else {
                break
            }
        }
        return id
    }

    buildMaskRelief(point) {
        let height = this.gridMask.get(point)
        let id = this.getReliefId(height)
        return new Relief(id)
    }

    filterRelief(relief, maskRelief) {
        // remove mountains
        if (maskRelief.id > PLATFORM) {
            relief.level(HIGHLAND)
        }
        if (maskRelief.id == TRENCH) {
            relief.level(PLATFORM)
        }
        if (maskRelief.isMiddle) {
            relief.lower()
        }
        if (relief.isPeak && maskRelief.id > DEEP) {
            relief.lower()
        }

        return relief
    }
}
