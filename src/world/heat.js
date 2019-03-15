

class HeatHeightMap {
    constructor(size, roughness=.17) {
        this.nullId1
        this.grid = new Grid(size, size, this.nullId)
        this.roughness = roughness
        this.size = size
        this._build()
    }

    _build () {
        const buildZones = (heat) => {
            let p1 = new Point(0, heat.y)
            let p2 = new Point(this.size - 1, heat.y)
            let setPoint = point => {
                    if (heat.id == HeatMap.get().length - 1) {
                        point.y = heat.y
                    }
                    fillColumn(point, heat.id)
                }
            MidpointDisplacement(p1, p2, this.size, this.roughness, setPoint)
        }

        const fillColumn = (point, id) => {
            let baseY = point.y
            while (baseY >= 0) {
                let pointAbove = new Point(point.x, baseY)
                let currentId = this.grid.get(pointAbove)
                if (currentId != this.nullId)
                    break
                this.grid.set(pointAbove, id)
                baseY--
            }
        }
        HeatMap.get().forEach(buildZones)
    }
}


class HeatMap {
    static get(id = null) {
        const _map = [
            { id: 0, temp: 0, y: 15, color: "white", name: "Polar" },
            { id: 1, temp: 1, y: 60, color: "blue", name: "Temperate" },
            { id: 2, temp: 2, y: 96, color: "yellow", name: "Subtropical" },
            { id: 3, temp: 3, y: 160, color: "red", name: "Tropical" },
            { id: 4, temp: 2, y: 196, color: "yellow", name: "Subtropical" },
            { id: 5, temp: 1, y: 241, color: "blue", name: "Temperate" },
            { id: 6, temp: 0, y: 256, color: "white", name: "Polar" }
        ]
        if (_.isNumber(id)) {
            let index = _.clamp(id, 0, _map.length - 1)
            return _map[index]
        }
        return _map
    }

    static getHottest() {
        return HeatMap.get(3)
    }

    static getColdest() {
        return HeatMap.get(0)
    }
}


class Heat {
    constructor(id) {
        this.heat = HeatMap.get(id)
    }

    get id() { return this.heat.id }
    get y() { return this.heat.y }
    get name() { return this.heat.name }
    get color() { return this.heat.color }
}
