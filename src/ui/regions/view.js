import React, { useState } from 'react'

import { GridDisplay } from '/lib/ui/display'
import { Form, Button } from '/lib/ui'
import { EMPTY } from '/model/region'
import { NumberField, SwitchField } from '/lib/ui/field'


const DEFAULT_TILE_SIZE = 7


function getColor(regionMap, point) {
    const regionID = regionMap.grid.get(point)
    const region = regionMap.regions[regionID]
    const color = regionMap.colors[regionID]

    if (regionID == EMPTY) return 'white'
    if (region.isCenter(point)) return 'black'
    const layerIndex = region.layerIndex(regionMap.grid.wrap(point))
    let amount = layerIndex * 20
    //let amount = layerIndex % 2 ? -layerIndex : layerIndex
    // return color.darken(amount).toHex()
    return color.toHex()
}


export default function RegionMapView({regionMap}) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [gridMode, setGridMode] = useState(false)
    const [wrapMode, setWrapMode] = useState(false)
    const [step, setStep] = useState(0)

    /*
        put a list of current regions info
    */
    return <section className="RegionMapView">
        <Menu
            onGrow={() => {
                regionMap.grow()
                setStep(step + 1)
            }}
            onGrowRandom={() => {
                regionMap.growRandom()
                setStep(step + 1)
            }}
            onTilesizeChange={event => setTilesize(event.target.value)}
            onGridModeChange={() => setGridMode(!gridMode)}
            onWrapModeChange={() => setWrapMode(!wrapMode)}
            gridMode={gridMode}
            wrapMode={wrapMode}
            tilesize={tilesize}
        />
        <GridDisplay
            width={regionMap.width}
            height={regionMap.height}
            colorAt={point => getColor(regionMap, point)}
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
        <Button text="Grow" onClick={props.onGrow}/>
        <Button text="Grow random" onClick={props.onGrowRandom}/>
    </Form>
}