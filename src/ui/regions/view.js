import React, { useState } from 'react'

import { GridDisplay } from '/lib/ui/grid'
import { Form } from '/lib/ui'
import { OutputField, NumberField, SwitchField } from '/lib/ui/field'


const DEFAULT_TILE_SIZE = 5


function getColor(regionMap, point, layer) {
    const region = regionMap.get(point)
    const color = region.color

    if (regionMap.getLayer(point) > Number(layer)) {
        return 'white'
    }
    if (regionMap.isBorder(point)) {
        return color.darken(40).toHex()
    }
    if (regionMap.isOrigin(point)) {
        return 'black'
    }
    return color.toHex()
}


export default function RegionMapView({regionMap}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [wrapMode, setWrapMode] = useState(false)
    const [layer, setLayer] = useState(0)

    return <section className="RegionMapView">
        <Menu
            onLayerChange={event => setLayer(Number(event.target.value))}
            onTilesizeChange={event => setTilesize(event.target.value)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            wrapMode={wrapMode}
            tilesize={tilesize}
            layer={layer}
            seed={regionMap.seed}
        />
        <GridDisplay
            width={regionMap.width}
            height={regionMap.height}
            colorAt={point => getColor(regionMap, point, layer)}
            tilesize={tilesize}
            wrapMode={wrapMode}
        />
    </section>
}


function Menu(props) {
    const onSubmit = event => event.preventDefault()

    return <Form className="Menu" onSubmit={onSubmit}>
        <OutputField label="Seed" value={props.seed} />
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
            min={0}
        />
    </Form>
}