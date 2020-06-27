import React from 'react'


export function Button(props) {
    return <button className="Button" onClick={props.onClick}>
        {props.text}
    </button>
}

export function SubmitButton(props) {
    return <button className="Button" type="submit">
        {props.text}
    </button>
}
