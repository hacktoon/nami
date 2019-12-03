import React from 'react'


export default function AppInput({ apps, current, setApp }) {
    const onChange = event => {
        const id = event.target.value
        setApp(apps[id])
    }

    return <label htmlFor="appInput" className="field">
        App
        <select id="appInput" value={current.id} onChange={onChange}>
            {Object.entries(apps).map((entry, i) => {
                const [id, app] = entry
                return <option key={i} value={id}>{app.name}</option>
            })}
        </select>
    </label>
}
