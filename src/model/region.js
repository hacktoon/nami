import { OrganicFill } from '/lib/flood-fill'
import { PointHash } from '/lib/point'


export class Region {
    constructor(id, origin, grid) {
        this.id = id
        this.origin = origin
        this.gridFill = createGridFill(id, origin, grid)
        this.layers = [new PointHash([origin])]
        this.layer = 0
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

    grow() {
        return this.gridFill.fill(this.seeds, this.layer++)
    }

    addSeeds(points=[]) {
        this.layers.push(new PointHash(points))
    }
}


function createGridFill(id, point, grid) {
    grid.setOrigin(point)
    return new OrganicFill({
        isEmpty:    point => grid.isEmpty(point),
        isBorder:   point => !grid.isEmpty(point) && !grid.isValue(point, id),
        setValue:   point => grid.setValue(point, id),
        setLayer:   (point, layer) => grid.setLayer(point, layer),
        setBorder:  point => grid.setBorder(point),
        maxFills:   () => Random.int(50),
        fillChance: .1,
    })
}