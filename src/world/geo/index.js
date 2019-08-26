import {
    TRENCH,
    ABYSSAL,
    DEEP,
    SHALLOW,
    BANKS,
    BASIN,
    PLAIN,
    HIGHLAND,
    TABLE,
    HILL,
    MOUNTAIN,
    VOLCANO,
    DEPRESSION,
    RELIEF_MAP,
    ReliefCodeMap,
} from './relief'


export class ReliefMap {
    constructor(size, roughness) {
        this.codeMap = new ReliefCodeMap(size, roughness)
        //TODO: this.regionMap = new RegionMap()
        this.roughness = roughness
        this.size = size
    }

    isTrench(pt) { return this.get(pt) == TRENCH }
    isAbyss(pt) { return this.get(pt) == ABYSSAL }
    isDeep(pt) { return this.get(pt) == DEEP }
    isShallow(pt) { return this.get(pt) == SHALLOW }
    isBanks(pt) { return this.get(pt) == BANKS }
    isBasin(pt) { return this.get(pt) == BASIN }
    isPlain(pt) { return this.get(pt) == PLAIN }
    isHighland(pt) { return this.get(pt) == HIGHLAND }
    isTable(pt) { return this.get(pt) == TABLE }
    isHill(pt) { return this.get(pt) == HILL }
    isMountain(pt) { return this.get(pt) == MOUNTAIN }
    isVolcano(pt) { return this.get(pt) == VOLCANO }
    isDepression(pt) { return this.get(pt) == DEPRESSION }

    isWater(pt) { return this.get(pt) <= BANKS } // TODO: remove
    isLand(pt) { return !this.isWater(pt) }

    getName(point) {
        const code = this.get(point)
        return RELIEF_MAP[code].name
    }

    getHeight(point) {
        return this.codeMap.heightMap.get(point) // TODO: normalize height
    }

    getColor(point) {
        const code = this.get(point)
        return RELIEF_MAP[code].color
    }

    get(point) {
        return this.codeMap.get(point)
    }
}



export class TerrainMap {
    constructor(size, roughness) {
        this.relief = new ReliefMap(size, roughness)
        this.size = size
    }

    isWater(pt) { return this.get(pt) <= BANKS }
    isLand(pt) { return !this.isWater(pt) }

    get(point) {
        return
    }
}
