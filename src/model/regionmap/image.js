import { Color } from '/lib/color'


const SPEC = [
    {
        type: "boolean",
        name: "wrapMode",
        label: "Wrap grid",
        value: false,
    },
    {
        type: "boolean",
        name: "border",
        label: "Show border",
        value: true,
    },
    {
        type: "boolean",
        name: "origin",
        label: "Show origin",
        value: false,
    },
    {
        type: "number",
        name: "tilesize",
        label: "Tile size",
        value: 6,
        step: 1,
        min: 1,
    },
    {
        type: "number",
        name: "layer",
        label: "Layer",
        value: 3,
        step: 1,
        min: 0,
    },
    {
        type: "color",
        name: "fgColor",
        label: "FG color",
        value: Color.fromHex('#06F'),
    },
    {
        type: "color",
        name: "bgColor",
        label: "BG color",
        value: Color.fromHex('#251'),
    },
    {
        type: "color",
        name: "borderColor",
        label: "Border color",
        value: Color.fromHex('#04D'),
    }
]


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
        // TODO: return ColorMap
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


class RegionMapImageSpec {
    constructor(config={}, spec=SPEC) {
        this.fields =spec.map(field => {
            this[field.name] = config[field.name] ?? field.value
            return field
        })
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