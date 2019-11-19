import React from 'react'


export function SeedInput(props) {
    return <section className="header-menu-item">
        <label htmlFor="seedInput">Seed</label>
        <input id="seedInput" type="text" onChange={props.onChange} />
    </section>
}

export function GenerateButton(props) {
    return <section className="header-menu-item">
        <button id="generateButton" onClick={props.onClick}>Generate</button>
    </section>
}
