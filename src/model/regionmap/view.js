import { Color } from '/lib/color'

const DEFAULT_FG = '#06F'
const DEFAULT_BG = '#251'
const DEFAULT_BORDER = '#944'


export class RegionMapView {
    constructor(regionMap) {
        this.regionMap = regionMap
        this.bgColor = buildColor(DEFAULT_BG) || new Color()
        this.borderColor = buildColor(DEFAULT_BORDER) || this.fgColor.darken(40)
        this.fgColor = buildColor(DEFAULT_FG)
        this.colorMap = regionMap.colorMap
        this.layer = 5
        this.tilesize = 5
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


function buildColor(string) {
    if (string === '') return
    return Color.fromHex(string)
}


export function buildColorMap(regionMap) {
    return Object.fromEntries(
        regionMap.regions.map(region => [
            region.id, new Color()
        ])
    )
}
