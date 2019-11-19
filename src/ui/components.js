import React from 'react'


export function SeedInput(props) {
    let timer = null

    const onChange = event => {
        let value = event.target.value.trim()
        clearTimeout(timer)
        timer = setTimeout(() => {
            props.onChange(value)
        }, 500)
    }

    return <section className="header-menu-item">
        <label htmlFor="seedInput">Seed</label>
        <input id="seedInput" type="text" onChange={onChange} />
    </section>
}

export function GenerateButton(props) {
    return <section className="header-menu-item">
        <button id="generateButton" onClick={props.onClick}>Generate</button>
    </section>
}
