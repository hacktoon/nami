import React, { useState } from 'react'

import { TextField, NumberField } from '/lib/ui/field'
import { Form, Button } from '/lib/ui'
import {
    DEFAULT_COUNT,
    DEFAULT_WIDTH,
    DEFAULT_HEIGHT,
    DEFAULT_SEED,
} from '/model/tectonicmap'


export default function MapAppMenu(props) {
    let [width, setWidth] = useState(DEFAULT_WIDTH)
    let [height, setHeight] = useState(DEFAULT_HEIGHT)
    let [count, setCount] = useState(DEFAULT_COUNT)
    let [seed, setSeed] = useState(DEFAULT_SEED)

    let onSubmit = event => {
        event.preventDefault()
        props.onChange({width, height, count, seed})
    }

    const onSeedChange = event => setSeed(event.target.value.trim())

    return <Form className="MapAppMenu" onSubmit={onSubmit}>
        <NumberField
            label="Width"
            value={width}
            onChange={({value}) => setWidth(value)}
            step={1}
            min={1}
        />
        <NumberField
            label="Height"
            value={height}
            onChange={({value}) => setHeight(value)}
            step={1}
            min={1}
        />
        <NumberField
            label="Count"
            value={count}
            onChange={({value}) => setCount(value)}
            step={1}
            min={1}
        />
        <TextField  label="Seed" onChange={onSeedChange} value={seed} />
        <Button text="New" />
    </Form>
}
