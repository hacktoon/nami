import React, { useState } from 'react';


export default function Header(props) {
    let [seed, setSeed] = useState('')

    const handleGenerate = (event) => {
        event.preventDefault()
        props.onGenerate(seed)
    }

    const onSeedChange = (event) => {
        setSeed(event.target.value)
    }

    return <>
    <header>
        <section id="header-title">Nami</section>
        <section id="header-menu">
            <section className="header-menu-item">
                <label htmlFor="seedInput">Seed</label>
                <input id="seedInput" type="text" onChange={onSeedChange} value={seed} />
            </section>
            <section className="header-menu-item">
                <button id="generateButton" onClick={handleGenerate}>Generate</button>
            </section>
        </section>
    </header>
    </>
}