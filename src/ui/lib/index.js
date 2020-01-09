import React from 'react'


// HELPER FUNCTIONS ==============================================


// GENERIC WIDGETS ===============================================

export function Row(props) {
    return <section className='Row' {...props}>
        {props.children}
    </section>
}

export function Column(props) {
    return <section className='Column' {...props}>
        {props.children}
    </section>
}

// PUBLIC WIDGETS =================================================