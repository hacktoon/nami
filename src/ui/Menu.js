import React from 'react';


export default class Menu extends React.Component {
    render () {
        return <>
        <nav id="sub-menu">
            <label htmlFor="sizeInput">Size
                <select id="sizeInput">
                    <option value="257">257</option>
                    <option value="129">129</option>
                    <option value="65">65</option>
                    <option value="33">33</option>
                    <option value="17">17</option>
                    <option value="9">9</option>
                </select>
            </label>
            <label htmlFor="roughnessInput">Roughness
                <input id="roughnessInput" type="number" step="1" placeholder="8" />
            </label>

            <label htmlFor="tilesizeInput">Tile size
                <input id="tilesizeInput" type="number" min="1" step="1" placeholder="3" />
            </label>
        </nav>
        </>
    }
}

