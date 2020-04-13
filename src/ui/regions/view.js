import React, { useState } from 'react'

import { GridDisplay } from '/lib/ui/display'
import { Form, Button } from '/lib/ui'
import { EMPTY } from '/model/region'
import { NumberField, SwitchField } from '/lib/ui/field'
import { Color } from '/lib/color'


const DEFAULT_TILE_SIZE = 7


function getColor(regionMap, point, colors) {
    const regionID = regionMap.grid.get(point)
    const region = regionMap.regions[regionID]
    const color = colors[regionID]

    if (regionID == EMPTY) return 'white'
    // if (region.isCenter(point)) return 'black'
    // const layerIndex = region.layerIndex(point)
    // let amount = layerIndex * 20
    //let amount = layerIndex % 2 ? -layerIndex : layerIndex
    // return color.darken(amount).toHex()
    return color.toHex()
}


export default function RegionMapView({regionMap}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [gridMode, setGridMode] = useState(false)
    const [wrapMode, setWrapMode] = useState(false)
    const [layer, setLayer] = useState(0)

    const colors = regionMap.regions.map(() => new Color())
    /*
        put a list of current regions info
    */
    return <section className="RegionMapView">
        <Menu
            onLayerChange={() => setLayer(layer + 1)}
            onTilesizeChange={event => setTilesize(event.target.value)}
            onGridModeChange={() => setGridMode(!gridMode)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            gridMode={gridMode}
            wrapMode={wrapMode}
            tilesize={tilesize}
            layer={layer}
        />
        <GridDisplay
            width={regionMap.width}
            height={regionMap.height}
            colorAt={point => getColor(regionMap, point, colors)}
            tilesize={tilesize}
            gridMode={gridMode}
            wrapMode={wrapMode}
        />
    </section>
}


function Menu(props) {
    const onSubmit = event => event.preventDefault()

    return <Form className="Menu" onSubmit={onSubmit}>
        <SwitchField
            label="Draw grid"
            checked={props.gridMode}
            onChange={props.onGridModeChange}
        />
        <SwitchField
            label="Wrap grid"
            checked={props.wrapMode}
            onChange={props.onWrapModeChange}
        />
        <NumberField
            label="Tile size"
            value={props.tilesize}
            onChange={props.onTilesizeChange}
            step={1}
            min={1}
        />
        <NumberField
            label="Layer"
            value={props.layer}
            onChange={props.onLayerChange}
            step={1}
            min={1}
        />
    </Form>
}