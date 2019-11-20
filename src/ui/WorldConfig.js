import React, { useState } from 'react'


export default function WorldConfig(props) {
    let [roughness, setRoughness] = useState(8)
    let [seed, setSeed] = useState('')
    let [size, setSize] = useState(257)

    const onSizeChange = event => setSize(Number(event.target.value))
    const onRoughnessChange = event => setRoughness(Number(event.target.value))
    const onSeedChange = event => setSeed(event.target.value.trim())

    const onSubmit = event => {
        event.preventDefault()
        let config = { size, roughness, seed }
        console.log(`onSubmit: ${config.seed}, ${config.size}, ${config.roughness}`)
        props.onChange(config)
    }

    console.log(`render WorldConfig '${seed}', ${size}, ${roughness}`)
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
        <input id="seedInput" type="text" onChange={props.onChange} />
    </section>
}


function GenerateButton(props) {
    return <section className="config-field">
        <button id="generateButton" onClick={props.onClick}>Generate</button>
    </section>
}