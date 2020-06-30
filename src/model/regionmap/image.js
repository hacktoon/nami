import { Color } from '/lib/color'


export class RegionMapImage {
    constructor(regionMap, config={}) {
        this.spec = new RegionMapImageSpec(config)
        this.regionMap = regionMap
        this.colorMap = buildColorMap(regionMap)
    }

    get fields() {
        return this.spec.fields
    }

    get defaultValues() {
        return this.spec.defaultValues
    }

    build(config) {
        // TODO: return canvas render map
        return new RegionMapImage(this.regionMap, config)
    }

    colorAt(point) {
        const region = this.regionMap.get(point)
        const fgColor = this.spec.fgColor ?? this.colorMap[region.id]
        const pointLayer = this.regionMap.getLayer(point)

        if (point.x == 0 || point.y == 0) {
            return fgColor.darken(pointLayer*10).toHex()
        }
        if (this.spec.border && this.regionMap.isBorder(point)) {
            return this.spec.borderColor.toHex()
        }
        if (this.spec.origin && this.regionMap.isOrigin(point)) {
            return fgColor.invert().toHex()
        }
        // draw seed
        if (this.regionMap.isLayer(point, this.spec.layer)) {
            return fgColor.brighten(50).toHex()
        }
        // invert this check to get remaining spaces
        if (!this.regionMap.isOverLayer(point, this.spec.layer)) {
            return this.spec.bgColor.toHex()
        }
        return fgColor.darken(pointLayer*5).toHex()
    }
}


export class RegionMapImageSpec {
    constructor(config={}) {
        this.fgColor = config.fgColor ?? Color.fromHex('#06F')
        this.bgColor = config.bgColor ?? Color.fromHex('#251')
        this.borderColor = config.borderColor ?? Color.fromHex('#04D')
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
                default: false,
            },
            {
                type: "boolean",
                name: "border",
                label: "Show border",
                value: this.border,
                default: true,
            },
            {
                type: "boolean",
                name: "origin",
                label: "Show origin",
                value: this.origin,
                default: false,
            },
            {
                type: "number",
                name: "tilesize",
                label: "Tile size",
                value: this.tilesize,
                default: this.tilesize,
                step: 1,
                min: 1,
            },
            {
                type: "number",
                name: "layer",
                label: "Layer",
                value: this.layer,
                default: this.layer,
                step: 1,
                min: 0,
            },
            {
                type: "color",
                name: "fgColor",
                label: "FG color",
                value: this.fgColor,
                default: this.fgColor,
            },
            {
                type: "color",
                name: "bgColor",
                label: "BG color",
                value: this.bgColor,
                default: this.bgColor,
            },
            {
                type: "color",
                name: "borderColor",
                label: "Border color",
                value: this.borderColor,
                default: this.borderColor,
            }
        ]
    }

    get defaultValues() {
        return Object.fromEntries(this.fields.map(
            field => [field.name, field.value]
        ))
    }
}


function buildColorMap(regionMap) {
    return Object.fromEntries(
        regionMap.regions.map(region => [
            region.id, new Color()
        ])
    )
}