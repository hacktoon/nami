import React, { useState } from 'react'

import { TextField, NumberField, MultiOptionField } from '../lib/field'
import { WorldConfig } from '../../model/world'


export default function ConfigPanel(props) {
    let [roughness, setRoughness] = useState(WorldConfig.DEFAULT_ROUGHNESS)
    let [size, setSize] = useState(WorldConfig.DEFAULT_SIZE)
    let [seed, setSeed] = useState('')

    const onSizeChange = event => setSize(Number(event.target.value))
    const onRoughnessChange = event => {
        const roughness = Number(event.target.value)
        const config = new WorldConfig({ size, roughness, seed })
        setRoughness(roughness)
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

    return <section id="world-config">
        <form onSubmit={onSubmit}>
            <section className="Fieldset Horizontal">
                <MultiOptionField label="Size" value={size}
                    axis="H" onChange={onSizeChange} options={sizeOptions} />
                <NumberField axis="H" label="Roughness"
                    value={roughness} step={1} onChange={onRoughnessChange} />
                <TextField axis="H" label="Seed" onChange={onSeedChange} />
                <Button onClick={onSubmit} />
            </section>
        </form>
    </section>
}


function Button(props) {
    return <section>
        <button className="Button" type="submit">Build</button>
    </section>
}
