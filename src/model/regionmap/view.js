import { Color } from '/lib/color'
import {
    NumberField,
    BooleanField,
    ColorField
} from '/lib/ui/form/field'


export class RegionMapView {
    constructor(regionMap) {
        this.regionMap = regionMap
        this.colorMap = buildColorMap(regionMap)
        this.fgColor = Color.fromHex('#06F')
        this.bgColor = Color.fromHex('#251')
        this.borderColor = this.fgColor.darken(40)
        this.tilesize = 5
        this.layer = 5
        this.wrapMode = false
        this.border = true
        this.origin = false
        this.fields = [
            {
                type: BooleanField,
                name: "wrapField",
                label: "Wrap grid",
                value: this.wrapMode,
            },
            {
                type: BooleanField,
                name: "borderField",
                label: "Show border",
                value: this.border,
            },
            {
                type: BooleanField,
                name: "originField",
                label: "Show origin",
                value: this.origin,
            },
            {
                type: NumberField,
                name: "tilesizeField",
                label: "Tile size",
                value: this.tilesize,
                step: 1,
                min: 1,
            },
            {
                type: NumberField,
                name: "layerField",
                label: "Layer",
                value: this.layer,
                step: 1,
                min: 0,
            },
            {
                type: ColorField,
                name: "fgColorField",
                label: "FG color",
                value: this.fgColor,
            },
            {
                type: ColorField,
                name: "bgColorField",
                label: "BG color",
                value: this.bgColor,
            },
            {
                type: ColorField,
                name: "borderColorField",
                label: "Border color",
                value: this.borderColor,
            }
        ]
    }

    get defaultValues() {
        return {
            bgColor: this.bgColor,
            border: this.border,
            borderColor: this.borderColor,
            fgColor: this.fgColor,
            layer: this.layer,
            origin: this.origin,
            tilesize: this.tilesize,
            wrapMode: this.wrapMode,
        }
    }

    colorAt(point, layer, border, origin) {
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
