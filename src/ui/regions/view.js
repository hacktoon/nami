import React, { useState } from 'react'

import { GridDisplay } from '/lib/ui/display'
import { Form, Button } from '/lib/ui'
import { NumberField, SwitchField } from '/lib/ui/field'


const DEFAULT_TILE_SIZE = 10


export default function RegionMapView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [gridMode, setGridMode] = useState(false)
    const [step, setStep] = useState(0)

    return <section className="RegionMapView">
        <Menu
            onGrow={() => {
                props.regionMap.grow()
                setStep(step + 1)
            }}
            onGrowRandom={() => {
                props.regionMap.growRandom()
                setStep(step + 1)
            }}
            onTilesizeChange={event => setTilesize(event.target.value)}
            onGridModeChange={() => setGridMode(!gridMode)}
            gridMode={gridMode}
            tilesize={tilesize}
        />
        <GridDisplay
            colorAt={point => props.regionMap.getColor(point)}
            tilesize={tilesize}
            gridMode={gridMode}
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