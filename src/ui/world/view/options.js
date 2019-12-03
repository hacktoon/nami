import React from 'react'

import { NumberInput, OptionInput, Output } from '../../lib/field'


export function OptionsPanel(props) {
    return <section className="options-panel">
        <Output label="Name" value={props.world.name} />
        <Output label="Seed" value={props.world.seed} />
        <NumberInput id="tilesize"
            label="Tile size"
            value={props.tilesize}
            onChange={props.onTilesizeChange}
            step={1}
            min={1}
        />
        <OptionInput label="Layer" options={{
            heightmap: "Heightmap",
            relief: "Relief",
            heat: "Heat",
            moisture: "Moisture",
            water: "Water",
            biome: "Biome",
            landmass: "Landmass",
        }} />
    </section>
}