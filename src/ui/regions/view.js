import React, { useState } from 'react'

import { GridDisplay } from '/lib/ui/display'
import { Form, Button } from '/lib/ui'
import { NumberField, SwitchField } from '/lib/ui/field'


const DEFAULT_TILE_SIZE = 7


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
            colorAt={point => regionMap.getColor(point)}
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