import { OrganicFill } from '/lib/flood-fill'
import { PointHash } from '/lib/point'


export class Region {
    constructor(id, origin, grid) {
        this.id = id
        this.origin = origin
        this.organicFill = createOrganicFill(id, origin, grid)
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
        const filled = this.organicFill.fill()
        this.pointHash.add(filled)
    }
}


function createOrganicFill(id, originPoint, grid) {
    return new OrganicFill(originPoint, {
        setBorder:  point => grid.setBorder(point),
        setOrigin:  point => grid.setOrigin(point),
        setSeed:    point => grid.setSeed(point, id),
        setValue:   point => grid.setValue(point, id),
        setLayer:   (point, layer) => grid.setLayer(point, layer),
        isEmpty:    point => grid.isEmpty(point),
        isSeed:     point => grid.isSeed(point, id),
        isBlocked:  point => grid.isBlocked(point, id),
        maxFills:   50,
        fillChance: .1,
    })
}