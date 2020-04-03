
export function repeat(num, callback) {
    let items = []
    for(let i=0; i<num; i++) {
        items.push(callback(i))
    }
    return items
}