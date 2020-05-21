import { OrganicFill } from '/lib/flood-fill'
import { PointHash } from '/lib/point'


export class Region {
    constructor(id, origin, grid) {
        this.id = id
        this.origin = origin
        this.gridFill = createGridFill(grid)
        this.layers = [new PointHash([origin])]
    }

    get size() {
        //return this.layers.size
    }

    get points() {
        //return this.layers.points
    }

    get seeds() {
        const lastIndex = this.layers.length - 1
        return this.layers[lastIndex].points
    }

    has(point) {
        return this.layers.has(point)
    }

    grow(layer) {
        return this.gridFill.fill(this.seeds, this.id, layer)
    }

    addSeeds(points=[]) {
        this.layers.push(new PointHash(points))
    }
}


function createGridFill(grid) {
    return new OrganicFill({
        isEmpty:    (point) => grid.isEmpty(point),
        isBorder:   (point, value) => {
            return !grid.isEmpty(point) && !grid.isValue(point, value)
        },
        setValue:    (point, value, layer) => {
            grid.setValue(point, value)
            grid.setLayer(point, layer)
        },
        setBorder:  (point) => grid.setBorder(point),
        maxFills:   () => Random.int(50),
        fillChance: .1,
    })
}