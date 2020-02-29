import React from 'react'

import { NumberField, SelectField, OutputField } from '/ui/lib/field'
import { Form } from '/ui/lib'


export function Menu(props) {
    return <Form className="Menu">
        <OutputField label="Name" value={props.world.name} />
        <OutputField label="Seed" value={props.world.seed} />
        <NumberField
            label="Tile size"
            value={props.tilesize}
            onChange={props.onTilesizeChange}
            step={1}
            min={1}
        />
        <SelectField label="Layer" options={{
            heightmap: "Heightmap",
            relief: "Relief",
            heat: "Heat",
            moisture: "Moisture",
            water: "Water",
            biome: "Biome",
            landmass: "Landmass",
        }} />
    </Form>
}