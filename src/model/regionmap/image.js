import { Color } from '/lib/color'
import { Grid } from '/lib/grid'
import { Schema } from '/lib/schema'


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
        value: Color.fromHex('#06F'),
    },
    {
        type: "color",
        name: "borderColor",
        label: "Border color",
        value: Color.fromHex('#04D'),
    }
]


export class RegionMapImage {
    constructor(regionMap) {
        this.schema = new Schema(SPEC) //TODO: remove
        this.regionMap = regionMap
    }

    renderMap(config) {
        const regionMap = this.regionMap
        const colorMap = Object.fromEntries(
            this.regionMap.regions.map(region => [
                region.id, new Color()
            ])
        )

        function init(point) {
            const region = regionMap.get(point)
            const fgColor = config.fgColor ?? colorMap[region.id]
            const pointLayer = regionMap.getLayer(point)

            if (config.border && regionMap.isBorder(point)) {
                return config.borderColor.toHex()
            }
            if (config.origin && regionMap.isOrigin(point)) {
                return fgColor.invert().toHex()
            }
            // draw seed
            if (regionMap.isLayer(point, config.layer)) {
                return fgColor.brighten(40).toHex()
            }
            // invert this check to get remaining spaces
            if (!regionMap.isOverLayer(point, config.layer)) {
                return config.bgColor.toHex()
            }
            return fgColor.darken(pointLayer*5).toHex()
        }

        const {width, height} = this.regionMap
        const grid = new Grid(width, height, init)

        return {
            wrapMode: config.wrapMode,
            tilesize: config.tilesize,
            width: width,
            height: height,
            get: point => grid.get(point)
        }
    }
}