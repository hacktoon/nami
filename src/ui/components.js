import React from 'react'


export function ViewInput(props) {
    return <>
        <label htmlFor="viewInput">View
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
    </>
}
