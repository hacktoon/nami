import React, { useState } from 'react'

import { GridDisplay } from '/ui/lib/display'
import { Form, Button } from '/ui/lib'
import { NumberField, TextField } from '/ui/lib/field'


const DEFAULT_TILE_SIZE = 10


export default function RegionMapView(props) {
    const [tilesize, setTilesize] = useState(DEFAULT_TILE_SIZE)
    const [step, setStep] = useState(0)

    return <section className="RegionMapView">
        <Menu
            onGrow={() => {
                props.regionMap.growAll()
                setStep(step+1)
            }}
            onTilesizeChange={event => setTilesize(event.target.value)}
            tilesize={tilesize}
        />
        <GridDisplay
            colorAt={point => props.regionMap.getColor(point)}
            tilesize={tilesize}
            drawGrid
        />
    </section>
}


function Menu(props) {

    const onSubmit = event => event.preventDefault()

    return <Form className="Menu" onSubmit={onSubmit}>
        <NumberField
            label="Tile size"
            value={props.tilesize}
            onChange={props.onTilesizeChange}
            step={1}
            min={1}
        />
        <TextField label="Fill color" />
        <TextField label="Border color" />
        <Button text="Grow" onClick={props.onGrow}/>
    </Form>
}