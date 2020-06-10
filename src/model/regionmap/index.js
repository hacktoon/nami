import { repeat } from '/lib/function'
import { Random } from '/lib/random'
import { Color } from '/lib/color'
import { OrganicFill } from '/lib/flood-fill'
import { PointHash } from '/lib/point'
import { RegionGrid } from '/lib/grid/region'

export const DEFAULT_COUNT = 10
export const DEFAULT_WIDTH = 200
export const DEFAULT_HEIGHT = 150
export const DEFAULT_SEED = ''
export const DEFAULT_LAYER_GROWTH = 40
export const DEFAULT_GROWTH_CHANCE = .1


class RegionMap {
    constructor(seed, regions, grid) {
        this.regions = regions
        this.seed = seed
        this.grid = grid
        this.colorMap = buildColorMap(this)
    }

    view(...params) {
        return new RegionMapView(this, ...params)
    }

    get width() {
        return this.grid.width
    }

    get height() {
        return this.grid.height
    }

    get(point) {
        const id = this.grid.get(point).value
        return this.regions[id]
    }

    isOrigin(point) {
        return this.grid.isOrigin(point)
    }

    isSeed(point, value) {
        if (this.isEmpty(point))
            return false
        return this.grid.isSeed(point, value)
    }

    isEmpty(point) {
        return this.grid.isEmpty(point)
    }

    isBorder(point) {
        return this.grid.isBorder(point)
    }

    getLayer(point) {
        return this.grid.getLayer(point)
    }

    isLayer(point, layer) {
        return this.grid.isLayer(point, layer)
    }

    isOverLayer(point, layer) {
        return this.getLayer(point) > layer
    }
}


class RegionMapSpec {
    constructor(regionMap) {
        this.regionMap = regionMap
    }

    width() {

    }
}


class RegionMapView {
    constructor(regionMap, fgColor, bgColor, borderColor) {
        this.bgColor = buildColor(bgColor) || new Color()
        this.borderColor = buildColor(borderColor) || this.fgColor.darken(40)
        this.colorMap = regionMap.colorMap
        this.fgColor = buildColor(fgColor)
        this.regionMap = regionMap
    }

    colorAt(point, viewlayer, border, origin) {
        const region = this.regionMap.get(point)
        const id = region.id
        const fgColor = this.fgColor ? this.fgColor : this.colorMap[id]
        const pointLayer = this.regionMap.getLayer(point)

        if (border && this.regionMap.isBorder(point)) {
            return this.borderColor.toHex()
        }
        if (origin && this.regionMap.isOrigin(point)) {
            return fgColor.invert().toHex()
        }
        // draw seed
        if (this.regionMap.isLayer(point, viewlayer)) {
            return fgColor.brighten(50).toHex()
        }
        // invert this check to get remaining spaces
        if (!this.regionMap.isOverLayer(point, viewlayer)) {
            return this.bgColor.toHex()
        }
        return fgColor.darken(pointLayer*10).toHex()
    }
}


class Region {
    constructor(id, origin, organicFill) { // TODO: remove organicFill
        this.id = id
        this.origin = origin
        this.organicFill = organicFill
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


// FUNCTIONS ===================================

function buildColor(string) {
    if (string === '') return
    return Color.fromHex(string)
}


function buildColorMap(regionMap) {
    return Object.fromEntries(
        regionMap.regions.map(region => [
            region.id, new Color()
        ])
    )
}


export function createRegionMap(params={}) {
    const {
        seed, count, width, height, layerGrowth, growthChance
    } = createConfig(params)
    const grid = new RegionGrid(width, height)
    const points = createPoints(count, width, height)
    const regions = createRegions(points, grid, layerGrowth, growthChance)
    while(grid.hasEmptyPoints()) {
        regions.forEach(region => region.grow())
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
        seed: DEFAULT_SEED,
        layerGrowth: DEFAULT_LAYER_GROWTH,
        growthChance: DEFAULT_GROWTH_CHANCE
    }, params)
    config.seed = _normalizeSeed(config.seed)
    return config
}


function createPoints(count, width, height) {
    return repeat(count, () => Point.random(width, height))
}


function createRegions(points, grid, layerGrowth, growthChance) {
    return points.map((origin, id) => {
        const organicFill = createOrganicFill({
            id, origin, grid, layerGrowth, growthChance
        })
        return new Region(id, origin, organicFill)
    })
}


function createOrganicFill({
        id,
        origin,
        grid,
        layerGrowth,
        growthChance
    }) {
    return new OrganicFill(origin, {
        setBorder:  point => grid.setBorder(point),
        setOrigin:  point => grid.setOrigin(point),
        setSeed:    point => grid.setSeed(point, id),
        setValue:   point => grid.setValue(point, id),
        setLayer:   (point, layer) => grid.setLayer(point, layer),
        isEmpty:    point => grid.isEmpty(point),
        isSeed:     point => grid.isSeed(point, id),
        isBlocked:  point => grid.isBlocked(point, id),
        layerGrowth:  layerGrowth,
        growthChance: growthChance,
    })
}