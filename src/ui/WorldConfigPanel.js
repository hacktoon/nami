import React, { useState } from 'react'

import { WorldConfig } from '../world'


export default function WorldConfigPanel(props) {
    let [roughness, setRoughness] = useState(8)
    let [seed, setSeed] = useState('')
    let [size, setSize] = useState(257)

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

    return <section id="world-config">
        <form onSubmit={onSubmit}>
            <label htmlFor="sizeInput" className="config-field">
                Size
                <select id="sizeInput" value={size} onChange={onSizeChange}>
                    <option value="257">257</option>
                    <option value="129">129</option>
                    <option value="65">65</option>
                    <option value="33">33</option>
                    <option value="17">17</option>
                    <option value="9">9</option>
                </select>
            </label>

            <label htmlFor="roughnessInput" className="config-field">
                Roughness
                <input id="roughnessInput"
                    onChange={onRoughnessChange}
                    type="number" step="1" value={roughness} />
            </label>

            <SeedInput onChange={onSeedChange} />
            <GenerateButton onClick={onSubmit} />
        </form>
    </section>
}


function SeedInput(props) {
    return <section className="config-field">
        <label htmlFor="seedInput">Seed</label>
        <input id="seedInput" type="text" onChange={props.onChange} autoComplete="off" />
    </section>
}


function GenerateButton(props) {
    return <section className="config-field">
        <button id="generateButton" type="submit">Generate</button>
    </section>
}