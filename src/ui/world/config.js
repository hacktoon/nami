import React, { useState } from 'react'

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

    return <section id="world-config">
        <form onSubmit={onSubmit}>
            <SizeInput size={size} onChange={onSizeChange}/>
            <RoughnessInput roughness={roughness} onChange={onRoughnessChange}/>
            <SeedInput onChange={onSeedChange} />
            <BuildButton onClick={onSubmit} />
        </form>
    </section>
}


function RoughnessInput(props) {
    return <label htmlFor="roughnessInput" className="field">
        Roughness
        <input id="roughnessInput"
            onChange={props.onChange}
            type="number" step="1" value={props.roughness} />
    </label>
}


function SizeInput(props) {
    return <label htmlFor="sizeInput" className="field">
        Size
        <select id="sizeInput" value={props.size} onChange={props.onChange}>
            <option value="257">257</option>
            <option value="129">129</option>
            <option value="65">65</option>
        </select>
    </label>
}


function SeedInput(props) {
    return <section className="field">
        <label htmlFor="seedInput">Seed</label>
        <input id="seedInput" type="text" onChange={props.onChange} autoComplete="off" />
    </section>
}


function BuildButton(props) {
    return <section className="field">
        <button id="generateButton" type="submit">Build</button>
    </section>
}
