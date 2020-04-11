import React, { useState } from 'react'

import { SelectField, NumberField } from '/lib/ui/field'
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
    let [growth, setGrowth] = useState('organic')

    const growthOptions = {
        normal: 'Normal',
        organic: 'Organic',
    }

    let onSubmit = event => {
        event.preventDefault()
        props.onChange({count, width, height, growth})
    }

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
        <SelectField label="Growth" value={growth}
            onChange={event => setGrowth(event.target.value)}
            options={growthOptions} />
        {/* <NumberField
            label="Overgrowth chance"
            value={1}
            step={1}
            min={1}
        /> */}
        <Button text="New" />
    </Form>
}
