import { Color } from '/lib/color'


export class RegionMapUI {
    constructor(regionMap, config={}) {
        this.regionMap = regionMap
        this.colorMap = buildColorMap(regionMap)
        this.fgColor = config.fgColor ?? Color.fromHex('#06F')
        this.bgColor = config.bgColor ?? Color.fromHex('#251')
        this.borderColor = config.borderColor ?? this.fgColor.darken(40)
        this.tilesize = config.tilesize ?? 5
        this.layer = config.layer ?? 0
        this.wrapMode = config.wrapMode ?? false
        this.border = config.border ?? true
        this.origin = config.origin ?? false
        this.fields = [
            {
                type: "boolean",
                name: "wrapMode",
                label: "Wrap grid",
                value: this.wrapMode,
            },
            {
                type: "boolean",
                name: "border",
                label: "Show border",
                value: this.border,
            },
            {
                type: "boolean",
                name: "origin",
                label: "Show origin",
                value: this.origin,
            },
            {
                type: "number",
                name: "tilesize",
                label: "Tile size",
                value: this.tilesize,
                step: 1,
                min: 1,
            },
            {
                type: "number",
                name: "layer",
                label: "Layer",
                value: this.layer,
                step: 1,
                min: 0,
            },
            {
                type: "color",
                name: "fgColor",
                label: "FG color",
                value: this.fgColor,
            },
            {
                type: "color",
                name: "bgColor",
                label: "BG color",
                value: this.bgColor,
            },
            {
                type: "color",
                name: "borderColor",
                label: "Border color",
                value: this.borderColor,
            }
        ]
    }

    buildRender(config) {
        // TODO: remove this method, move to renderMap
        // TODO: return canvas render map
        return new RegionMapUI(this.regionMap, config)
    }

    get defaultValues() {
        return Object.fromEntries(this.fields.map(
            field => [field.name, field.value]
        ))
    }

    // TODO: remove the second parameter
    colorAt(point) {
        const region = this.regionMap.get(point)
        const id = region.id
        const fgColor = this.fgColor ? this.fgColor : this.colorMap[id]
        const pointLayer = this.regionMap.getLayer(point)

        if (this.border && this.regionMap.isBorder(point)) {
            return this.borderColor.toHex()
        }
        if (this.origin && this.regionMap.isOrigin(point)) {
            return fgColor.invert().toHex()
        }
        // draw seed
        if (this.regionMap.isLayer(point, this.layer)) {
            return fgColor.brighten(50).toHex()
        }
        // invert this check to get remaining spaces
        if (!this.regionMap.isOverLayer(point, this.layer)) {
            return this.bgColor.toHex()
        }
        return fgColor.darken(pointLayer*10).toHex()
    }
}


function buildColorMap(regionMap) {
    return Object.fromEntries(
        regionMap.regions.map(region => [
            region.id, new Color()
        ])
    )
}
