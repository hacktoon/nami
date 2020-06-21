import { Color } from '/lib/color'


export class RegionMapView {
    constructor(regionMap, config={}) {
        this.regionMap = regionMap
        this.colorMap = buildColorMap(regionMap)
        this.fgColor = Color.fromHex('#06F')
        this.bgColor = Color.fromHex('#251')
        this.borderColor = this.fgColor.darken(40)
        this.tilesize = Number(config.tilesize) || 5
        this.layer = Number(config.layer) || 5
        this.wrapMode = config.wrapMode != undefined ? config.wrapMode : false
        this.border = config.border != undefined ? config.border : true
        this.origin = config.origin != undefined ? config.origin : false
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

    build(config) {
        // TODO: return canvas render map
        console.log(config);
        return new RegionMapView(this.regionMap, config)

    }

    get defaultValues() {
        return Object.fromEntries(this.fields.map(
            field => [field.name, field.value]
        ))
    }

    // TODO: remove the second parameter
    colorAt(point, {layer, border, origin}) {
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
        if (this.regionMap.isLayer(point, layer)) {
            return fgColor.brighten(50).toHex()
        }
        // invert this check to get remaining spaces
        if (!this.regionMap.isOverLayer(point, layer)) {
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
