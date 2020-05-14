import { repeat } from '/lib/function'
import { Random } from '/lib/random'
import { OrganicFill } from '/lib/flood-fill'
import { PointHash } from '/lib/point'
import { Color } from '/lib/color'
import { RegionGrid } from './grid'


export const DEFAULT_COUNT = 15
export const DEFAULT_WIDTH = 150
export const DEFAULT_HEIGHT = 150


export class RegionMap {
    constructor(regions, grid) {
        this.regions = regions
        this.grid = grid
        this.width = grid.width
        console.log(grid.width);

        this.height = grid.height
    }

    get(point) {
        const id = this.grid.get(point)
        return this.regions[id]
    }
}


class Region {
    constructor(id, origin, points) {
        this.id = id
        this.origin = origin
        this.layers = [new PointHash(points)]
        this.color = new Color()
    }

    get size() {
        //return this.layers.size
    }

    get points() {
        //return this.layers.points
    }

    get lastPoints() {
        const lastIndex = this.layers.length - 1
        return this.layers[lastIndex].points
    }

    isOrigin(point) {
        return this.origin.equals(point)
    }

    has(point) {
        return this.layers.has(point)
    }

    grow(newPoints=[]) {
        this.layers.push(new PointHash(newPoints))
    }
}


// FUNCTIONS ===================================

export function createRegionMap(params={}) {
    const {count, width, height} = createConfig(params)
    const points = createPoints(count, width, height)
    const grid = new RegionGrid(width, height)
    const regions = createRegions(points, grid)
    const gridFill = createGridFill(grid)
    while(grid.hasEmptyPoints()) {
        growRegions(regions, gridFill)
    }
    return new RegionMap(regions, grid)
}


function createConfig(params={}) {
    return Object.assign({
        count: DEFAULT_COUNT,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT
    }, params)
}


function createGridFill(grid) {
    return new OrganicFill({
        onFill:     (point, value) => grid.set(point, value),
        canFill:    point => grid.isEmpty(point),
        //onBorder: (point, value) => grid.setBorder(point, value),
        maxFills:   () => Random.int(50),
        fillChance: .2,
    })
}


function createPoints(count, width, height) {
    return repeat(count, () => Point.random(width, height))
}


function createRegions(points) {
    return points.map((point, id) => new Region(id, point, [point]))
}


function growRegions(regions, gridFill) {
    for(let region of regions) {
        const newPoints = gridFill.fill(region.lastPoints, region.id)
        region.grow(newPoints)
    }
}