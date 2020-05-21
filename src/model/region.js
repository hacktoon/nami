import { OrganicFill } from '/lib/flood-fill'
import { PointHash } from '/lib/point'


export class Region {
    constructor(id, origin, grid) {
        this.id = id
        this.origin = origin
        this.gridFill = createOrganicFill(id, origin, grid)
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

    grow() {
        return this.gridFill.fill(this.seeds)
    }

    addSeeds(points=[]) {
        this.layers.push(new PointHash(points))
    }
}


function createOrganicFill(id, point, grid) {
    return new OrganicFill(point, {
        isEmpty:    point => grid.isEmpty(point),
        isBlocked:  point => !grid.isEmpty(point) && !grid.isValue(point, id),
        setValue:   point => grid.setValue(point, id),
        setLayer:   (point, layer) => grid.setLayer(point, layer),
        setBorder:  point => grid.setBorder(point),
        setOrigin:  point => grid.setOrigin(point),
        maxFills:   () => Random.int(50),
        fillChance: .1,
    })
}