import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
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
        const color = this.colorMap.get(plate)

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
        const entries = tilemap.map(plate => [plate.id, plate.color])
        this.map = Object.fromEntries(entries)
    }

    get(plate) {
        return this.map[plate.id]
    }
}
