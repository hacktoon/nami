
export function callArray(num, callback) {
    let items = []
    for(let i=0; i<num; i++) {
        items.push(callback(i))
    }
    return items
}