import { Color } from '/lib/color'
import { Grid } from '/lib/grid'
import { Schema } from '/lib/schema'


const SCHEMA = new Schema([
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
        value: false,
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
        value: 10,
        step: 1,
        min: 0,
    },
    {
        type: "color",
        name: "fgColor",
        label: "FG color",
        value: Color.fromHex('#251'),
    },
    {
        type: "color",
        name: "bgColor",
        label: "BG color",
        value: Color.fromHex('#059'),
    },
    {
        type: "color",
        name: "borderColor",
        label: "Border color",
        value: Color.fromHex('#04D'),
    }
])


export class RegionMapImage {
    static schema = SCHEMA

    constructor(regionMap, config) {
        this.regionMap = regionMap
        this.width = regionMap.width
        this.height = regionMap.height
        this.wrapMode = config.wrapMode
        this.tilesize = config.tilesize
        this.grid = new Grid(regionMap.width, regionMap.height, point => {
            if (config.border && regionMap.isBorder(point)) {
                return config.borderColor.toHex()
            }
            if (config.origin && regionMap.isOrigin(point)) {
                return config.fgColor.invert().toHex()
            }
            // draw seed
            if (regionMap.isLayer(point, config.layer)) {
                return config.fgColor.brighten(40).toHex()
            }
            // invert this check to get remaining spaces
            const pointLayer = regionMap.getLayer(point)
            if (regionMap.isOverLayer(point, config.layer)) {
                return config.bgColor.darken(pointLayer*5).toHex()
            } else {
                return config.fgColor.darken(pointLayer*5).toHex()
            }
        })
    }

    get(point) {
        return this.grid.get(point)
    }
}