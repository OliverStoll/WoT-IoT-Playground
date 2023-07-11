/**
 * Check if given device is external or internal.
 * @param href - The href url of the device
 * @param thingDescriptions - The list of thingDescriptions (all: internal and external)
 * @returns True if the href belongs to a external device else false
 */
function isRemoteDevice(href: string, thingDescriptions: string[]): boolean {
    const filteredDescription: string[] = thingDescriptions.filter((description: string): boolean => {
        return description.includes(href)
    })
    if(filteredDescription.length > 1){
        console.log(`Error: There are ${filteredDescription.length} devices with href: ${href}`)
        return false
    }
    try {
        const obj = JSON.parse(filteredDescription[0])
        return obj.hasOwnProperty("external") && obj.external === true

    } catch (error) {
        console.error("Error while parsing thingDescription: ", error)
        return false
    }

}

module.exports = isRemoteDevice
