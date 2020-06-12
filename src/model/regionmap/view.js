import { Color } from '/lib/color'


export class RegionMapView {
    constructor(regionMap, {fgColor, bgColor, borderColor}) {
        this.regionMap = regionMap
        this.bgColor = buildColor(bgColor) || new Color()
        this.borderColor = buildColor(borderColor) || this.fgColor.darken(40)
        this.colorMap = regionMap.colorMap
        this.fgColor = buildColor(fgColor)
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
