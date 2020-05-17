import React, { useState } from 'react'

import { TextField, NumberField } from '/lib/ui/field'
import { Form, Button } from '/lib/ui'
import {
    DEFAULT_COUNT,
    DEFAULT_WIDTH,
    DEFAULT_HEIGHT
} from '/model/region'


export default function ConfigMenu(props) {
    let [count, setCount] = useState(DEFAULT_COUNT)
    let [width, setWidth] = useState(DEFAULT_WIDTH)
    let [height, setHeight] = useState(DEFAULT_HEIGHT)
    let [seed, setSeed] = useState('')

    let onSubmit = event => {
        event.preventDefault()
        props.onChange({count, width, height, seed})
    }

    const onSeedChange = event => setSeed(event.target.value.trim())

    return <Form className="ConfigMenu" onSubmit={onSubmit}>
        <NumberField
            label="Width"
            value={width}
            onChange={event => setWidth(Number(event.target.value))}
            step={1}
            min={1}
        />
        <NumberField
            label="Height"
            value={height}
            onChange={event => setHeight(Number(event.target.value))}
            step={1}
            min={1}
        />
        <NumberField
            label="Count"
            value={count}
            onChange={event => setCount(Number(event.target.value))}
            step={1}
            min={1}
        />
        <TextField  label="Seed" onChange={onSeedChange} />
        <Button text="New" />
    </Form>
}
