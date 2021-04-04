import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Color } from '/lib/base/color'

import { TileMapDiagram } from '/model/lib/tilemap'


export class TectonicsTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'TectonicsTileMapDiagram',
        Type.boolean('showPlates', 'Show plates', {default: true}),
    )

    static create(tilemap, params) {
        return new TectonicsTileMapDiagram(tilemap, params)
    }

    constructor(tilemap, params) {
        super(tilemap)
        this.colorMap = new PlateColorMap(tilemap)
    }

    get(point) {
        const plate = this.tilemap.getPlate(point)
        // let color = this.colorMap.get(plate)
        const continent = this.tilemap.table.geologicMap.get(point)
        if (continent === 0) return '#27A'  // ocean
        if (continent === 1) return '#0d85db'   // platform
        if (continent === 2) return '#26a11f' // cont


        // if (this.showPlates && this.tilemap.isPlateBorder(point)) {
        //     return color.darken(50).toHex()
        // }
        // // if (this.showProvinces && isBorderProvince) {
        // //     return color.darken(50).toHex()
        // // }
        // if (this.showProvinces && isBorderProvince) {
        //     const borderRegion = this.tilemap.getBorderProvinceRegion(point)
        //     const defColor = this.colorMap.get(borderRegion)
        //     return defColor.toHex()
        // }

        return color.toHex()
    }
    // get(point) {
    //     if (this.showBorder && this.tilemap.isBorder(point)) {
    //         return this.borderColor.toHex()
    //     }
    //     const value = this.tilemap.get(point)
    //     const ocean = this.ocean.toHex()
    //     const continent = this.continent.toHex()
    //     if (value === 0) return ocean
    //     if (value === 1) return '#27A'
    //     if (value === 2) return continent
    // }
}


class PlateColorMap {
    constructor(tilemap) {
        const entries = tilemap.map(plate => {
            let color =  new Color(0, 250, 0).average(plate.color)
            if (plate.isOceanic()) {
                color = new Color(0, 0, 200)
            }
            return [plate.id, color]
        })
        this.map = Object.fromEntries(entries)
    }

    get(plate) {
        return this.map[plate.id]
    }
}
