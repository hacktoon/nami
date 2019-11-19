import React, { useState, useEffect } from 'react'

export default function WorldConfig(props) {
    let [size, setSize] = useState(257)
    let [roughness, setRoughness] = useState(8)

    const onSizeChange = event => {
        let newSize = event.target.value
        setSize(newSize)
        props.onChange({size: newSize, roughness})
    }

    const onRoughnessChange = event => {
        let newRoughness = event.target.value
        setRoughness(newRoughness)
        props.onChange({roughness: newRoughness, size})
    }

    return <>
        <nav id="world-config">
            <label htmlFor="sizeInput">
                Size
                <select id="sizeInput" value={size} onChange={onSizeChange}>
                    <option value="257" defaultValue>257</option>
                    <option value="129">129</option>
                    <option value="65">65</option>
                    <option value="33">33</option>
                    <option value="17">17</option>
                    <option value="9">9</option>
                </select>
            </label>

            <label htmlFor="roughnessInput">
                Roughness
                <input id="roughnessInput"
                    onChange={onRoughnessChange}
                    type="number" step="1" value={roughness} />
            </label>
        </nav>
    </>
}

