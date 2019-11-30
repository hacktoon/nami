import React from 'react'

import { TextField, NumberField } from '../../lib/field'


export function OptionsPanel(props) {
    return <section className="options-panel">
        <p className="item">Name: {props.world.name}</p>
        <p className="item">Seed: {props.world.seed}</p>
        <NumberField id="tilesize"
            label="Tile size"
            value={props.tilesize}
            onChange={props.onTilesizeChange}
            step={1}
            min={1}
        />
        <LayerInput />

    </section>
}

export function LayerInput() {
    return <label className="item field" htmlFor="viewInput">
        View
        <select id="viewInput">
            <option value="heightmap">Heightmap</option>
            <option value="relief">Relief</option>
            <option value="heat">Heat</option>
            <option value="moisture">Moisture</option>
            <option value="water">Water</option>
            <option value="biome">Biome</option>
            <option value="landmass">Landmass</option>
        </select>
    </label>
}
