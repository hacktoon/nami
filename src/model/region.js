import { OrganicFill } from '/lib/flood-fill'
import { PointHash } from '/lib/point'


export class Region {
    constructor(id, origin, grid) {
        this.id = id
        this.origin = origin
        this.gridFill = createOrganicFill(id, origin, grid)
        this.pointHash = new PointHash([origin])
    }

    get size() {
        return this.pointHash.size
    }

    get points() {
        return this.pointHash.points
    }

    has(point) {
        return this.pointHash.has(point)
    }

    grow() {
        return this.gridFill.fill()
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