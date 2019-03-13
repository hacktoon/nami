
class TerrainMap {
    static get (id=null) {
        const _map = [
            { id: 0, height: 0,   color: "#000056", name: "Abyssal waters", isWater: true },
            { id: 1, height: 80,  color: "#1a3792", name: "Deep waters",    isWater: true },
            { id: 2, height: 120, color: "#3379a6", name: "Shallow waters", isWater: true },
            { id: 3, height: 150, color: "#0a5816", name: "Coastal plains" },
            { id: 4, height: 190, color: "#31771a", name: "Plains" },
            { id: 5, height: 240, color: "#6f942b", name: "Hills" },
            { id: 6, height: 255, color: "#d5cab4", name: "Mountains" }
        ]
        if (_.isNumber(id)) {
            let index = _.clamp(id, 0, _map.length-1)
            return _map[index]
        }
        return _map
    }

    static getHighest () {
        return _.last(TerrainMap.get()).id
    }

    static getLowest () {
        return _.first(TerrainMap.get()).id
    }
}


class Terrain {
    constructor (height) {
        const _map = TerrainMap.get()
        for(let i = 0; i < _map.length; i++) {
            let terrainData = _map[i]
            if (height >= terrainData.height) {
                this.terrain = terrainData
            } else {
                break
            }
        }
    }

    get id () { return this.terrain.id }
    get name () { return this.terrain.name }
    get height () { return this.terrain.height }
    get color () { return this.terrain.color }
    get isWater () { return Boolean(this.terrain.isWater) }
    get isLand () { return !this.isWater }

    raise (amount=1) {
        this.terrain = TerrainMap.get(this.id + amount)
    }

    lower (amount=1) {
        this.terrain = TerrainMap.get(this.id - amount)
    }

    isLower (terrain) {
        return this.id < terrain.id
    }

    isHigher (terrain) {
        return this.id > terrain.id
    }

    isLowest () {
        return this.id === TerrainMap.getLowest()
    }

    isHighest () {
        return this.id === TerrainMap.getHighest()
    }
}
