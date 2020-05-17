import { repeat } from '/lib/function'
import { Random } from '/lib/random'
import { OrganicFill } from '/lib/flood-fill'
import { PointHash } from '/lib/point'
import { Color } from '/lib/color'
import { RegionGrid } from './grid'


export const DEFAULT_COUNT = 15
export const DEFAULT_WIDTH = 150
export const DEFAULT_HEIGHT = 150


class RegionMap {
    constructor(seed, regions, grid) {
        this.seed = seed
        this.regions = regions
        this.grid = grid
        this.width = grid.width
        this.height = grid.height
    }

    get(point) {
        const id = this.grid.get(point).value
        return this.regions[id]
    }

    isOrigin(point) {
        return this.grid.isOrigin(point)
    }

    isBorder(point) {
        return this.grid.isBorder(point)
    }

    getLayer(point) {
        return this.grid.getLayer(point)
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

    has(point) {
        return this.layers.has(point)
    }

    grow(newPoints=[]) {
        this.layers.push(new PointHash(newPoints))
    }
}


// FUNCTIONS ===================================

export function createRegionMap(params={}) {
    const {count, width, height, seed} = createConfig(params)
    const points = createPoints(count, width, height)
    const grid = new RegionGrid(width, height)
    const regions = createRegions(points, grid)
    const gridFill = createGridFill(grid)
    let layer = 0
    while(grid.hasEmptyPoints()) {
        growRegions(layer++, regions, gridFill)
    }
    return new RegionMap(seed, regions, grid)
}


function createConfig(params={}) {
    function _normalizeSeed(seed) {
        seed = String(seed).length ? seed : Number(new Date())
        Random.seed = seed
        return seed
    }

    const config = Object.assign({
        count: DEFAULT_COUNT,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        seed: ''
    }, params)
    config.seed = _normalizeSeed(config.seed)
    return config
}


function createGridFill(grid) {
    return new OrganicFill({
        isEmpty:    (point) => grid.isEmpty(point),
        isBorder:   (point, value) => {
            return !grid.isEmpty(point) && !grid.isValue(point, value)
        },
        setFill:    (point, value, layer) => {
            grid.setValue(point, value)
            grid.setLayer(point, layer)
        },
        setBorder:  (point) => grid.setBorder(point),
        maxFills:   () => Random.int(50),
        fillChance: .1,
    })
}


function createPoints(count, width, height) {
    return repeat(count, () => Point.random(width, height))
}


function createRegions(points, grid) {
    return points.map((point, id) => {
        grid.setOrigin(point)
        grid.setValue(point, id)
        return new Region(id, point, [point])
    })
}


function growRegions(layer, regions, gridFill) {
    for(let region of regions) {
        const points = region.lastPoints
        const newPoints = gridFill.fill(points, region.id, layer)
        region.grow(newPoints)
    }
}