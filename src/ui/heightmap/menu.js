import React, { useState } from 'react'

import { TextField, NumberField } from '/lib/ui/field'
import { Form, Button } from '/lib/ui'
import {
    DEFAULT_RESOLUTION,
    DEFAULT_WIDTH,
    DEFAULT_HEIGHT
} from '/model/regionmap'


export default function ConfigMenu(props) {
    let [resolution, setResolution] = useState(DEFAULT_RESOLUTION)
    let [width, setWidth] = useState(DEFAULT_WIDTH)
    let [height, setHeight] = useState(DEFAULT_HEIGHT)
    let [seed, setSeed] = useState('')

    let onSubmit = event => {
        event.preventDefault()
        props.onChange({resolution, width, height, seed})
    }

    const onSeedChange = event => setSeed(event.target.value.trim())

    return <Form className="ConfigMenu" onSubmit={onSubmit}>
        <NumberField
            label="Width"
            value={width}
            onChange={event => setWidth(Number(event.target.value))}
            step={1}
            min={1}
            max={1000}
        />
        <NumberField
            label="Height"
            value={height}
            onChange={event => setHeight(Number(event.target.value))}
            step={1}
            min={1}
            max={1000}
        />
        <NumberField
            label="Resolution"
            value={resolution}
            onChange={event => setResolution(Number(event.target.value))}
            step={1}
            min={1}
            max={10}
        />
        <TextField  label="Seed" onChange={onSeedChange} />
        <Button text="New" />
    </Form>
}
