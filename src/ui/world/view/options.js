import React from 'react'


export function OptionsPanel(props) {
    return <section className="options-panel">
        <p className="item">Name: {props.world.name}</p>
        <p className="item">Seed: {props.world.seed}</p>
        <label className="item field" id="tilesizeField" htmlFor="tilesizeInput">
            Tile size:
            <input type="number" id="tilesizeInput"
                onChange={props.onTilesizeChange}
                value={props.tilesize}
                min="1"
                step="1"
            />
        </label>
        <LayerInput />
    </section>
}

export  function LayerInput() {
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
