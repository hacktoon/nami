import _ from 'lodash'


class BiomeMap {
    static get (id=null) {
        const _map = [
            { id: 0, color: "", name: "Ocean" },
            { id: 1, color: "", name: "River" },
            { id: 2, color: "", name: "Lake" },
            { id: 3, color: "", name: "Ice" },
            { id: 4, color: "", name: "Tundra" },
            { id: 5, color: "", name: "Taiga" },
            { id: 6, color: "", name: "Steppe" },
            { id: 7, color: "", name: "Grassland" },
            { id: 8, color: "", name: "Forest" },
            { id: 9, color: "", name: "Rainforest" },
            { id: 10, color: "", name: "Savanna" },
            { id: 11, color: "", name: "Shrubland" },
            { id: 12, color: "", name: "Desert" }
        ]
        if (_.isNumber(id)) {
            let index = _.clamp(id, 0, _map.length-1)
            return _map[index]
        }
        return _map
    }
}


export class Biome {
    constructor () {
        const _map = BiomeMap.get()
    }

    get id () { return this.biome.id }
    get name () { return this.biome.name }
    get color () { return this.biome.color }
}
