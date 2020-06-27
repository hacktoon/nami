import React, { useState } from 'react'

import { Form } from '/lib/ui/form'
import { Button } from '/lib/ui/form/button'
import { TextField, NumberField, SelectField } from '/lib/ui/form/field'
import { WorldConfig } from '/model/worldmap'


export default function WorldMenu(props) {
    let [roughness, setRoughness] = useState(WorldConfig.DEFAULT_ROUGHNESS)
    let [size, setSize] = useState(WorldConfig.DEFAULT_SIZE)
    let [seed, setSeed] = useState('')

    const onSizeChange = value => setSize(Number(value))

    const onRoughnessChange = ({value}) => {
        const config = new WorldConfig({ size, value, seed })
        setRoughness(value)
        props.onChange(config)
    }

    const onSeedChange = event => setSeed(event.target.value.trim())

    const onSubmit = event => {
        const config = new WorldConfig({ size, roughness, seed })
        event.preventDefault()
        props.onChange(config)
    }

    const sizeOptions = {
        257: 257,
        129: 129,
        65: 65,
    }

    return <Form className="MapAppMenu" onSubmit={onSubmit}>
        <SelectField label="Size" value={size}
            onChange={onSizeChange} options={sizeOptions} />
        <NumberField
            label="Roughness"
            value={roughness}
            onChange={onRoughnessChange}
            step={1}
            min={1}
        />
        <TextField  label="Seed" onChange={onSeedChange} />
        <Button onClick={onSubmit} text="New" />
    </Form>
}
