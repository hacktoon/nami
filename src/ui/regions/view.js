import React, { useState } from 'react'

import { GridDisplay } from '/lib/ui/grid'
import { Form } from '/lib/ui'
import { NumberField, SwitchField } from '/lib/ui/field'


const DEFAULT_TILE_SIZE = 4


function getColor(regionMap, point) {
    const [region, isBorder] = regionMap.get(point)
    const color = region.color.toHex()

    /*
    TODO: set all possible info for each regionMap cell:
    {
        type:  normal|border|origin,
        value: regionId
    }
    and refactor out this abomination:
    */
    if (region.isOrigin(regionMap.grid.grid.wrap(point))) {
        return 'black'
    }

    if (isBorder) {
        return 'red'
    }


    // return color.darken(amount).toHex()

    return color
}


export default function RegionMapView({regionMap}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [wrapMode, setWrapMode] = useState(false)
    const [layer, setLayer] = useState(0)

    return <section className="RegionMapView">
        <Menu
            onLayerChange={event => setLayer(event.target.value)}
            onTilesizeChange={event => setTilesize(event.target.value)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            wrapMode={wrapMode}
            tilesize={tilesize}
            layer={layer}
        />
        <GridDisplay
            width={regionMap.width}
            height={regionMap.height}
            colorAt={point => getColor(regionMap, point)}
            tilesize={tilesize}
            wrapMode={wrapMode}
        />
    </section>
}


function Menu(props) {
    const onSubmit = event => event.preventDefault()

    return <Form className="Menu" onSubmit={onSubmit}>
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