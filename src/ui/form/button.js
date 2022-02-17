import { React } from 'react'


export function Button(props) {
    return <button className="Button" onClick={props.onClick}>
        {props.label}
    </button>
}
