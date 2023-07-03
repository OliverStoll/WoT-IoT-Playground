import {useEffect, useState} from "react"
import './component_css/ThingRepresentationStyle.css'

const urlTD: string = 'http://localhost:5001/api/logs/thingDescriptions'
const urlConfig: string = 'http://localhost:5001/api/config'
const urlET: string = 'http://localhost:5001/api/call'

// important attributes you want to show inside the things
const att_keys: string[] = ["properties", "actions", "events"]
let config: string

/**
 Renders a component that fetches and displays a list of thing representations.
 The component periodically fetches thing descriptions and updates the list if there are changes.
 @returns {JSX.Element} The rendered component displaying the thing representations.
 */
const ThingRepresentation = () => {
    const [things, setThings] = useState<JSX.Element[]>([])
    useEffect(() : void => {
        // get config for security credentials
        fetchFiles(urlConfig).then(function (conf: string) :void {
            // if an error occurred or the config is empty-> return
            if (conf === "Error" || conf === "No config file found") return
            config = conf
        })
        // get all TD from backend
        fetchFiles(urlTD).then(function (thingDescriptions: string) :void {
            // if an error occurred or the list is empty-> return
            if (thingDescriptions === "Error" || thingDescriptions === "[]") return
            // parse the TD to show them
            setThings(getThings(JSON.parse(thingDescriptions)))
        })
    },[])

    // container will all things to display
    return <div className={"thing-container"} id="thing-container" onLoad={(): void => {
        // when a config is loaded, change the text of the upload div and show the kill button
        const div: HTMLElement | null = document.getElementById("upload")
        if (div) div.innerText = "Drag 'n' drop a playbook file here, or click to select file"
        const button: HTMLElement | null = document.getElementById("kill-button")
        if (button) button.style.display = "inline-block"
    }}>{things}</div>
}



//---------------------- functions that creates the things and their attributes-----------------------------------------

/**
 Converts a list of thing configurations into an array of JSX elements representing each thing.
 Each thing element includes an icon, along with selected attributes of the thing.
 @param {string[]} conf - The list of thing configurations.
 @returns {JSX.Element[]} An array of JSX elements representing the things.
 */
function getThings(conf: string[]): JSX.Element[] {
    return Array.from({length: conf.length}, function (_, index: number) {
        const thing = JSON.parse(conf[index])
        //create a button for the important attributes of every thing description
        const values: string[] = Object.keys(thing[att_keys[0]])
        const port: string = thing[att_keys[0]][values[0]]["form"]["href"].split("localhost:")[1].slice(0,4)
        const attributes: JSX.Element[] = Array.from({length: att_keys.length},
            function (_, ind: number): JSX.Element {
                return getAttributes(JSON.stringify(thing), att_keys[ind], ind, port)
            })
        // create div for every thing description with a symbol and all attributes
        return (
            <div id={thing["id"]} className={"thing"} key={index + "-thing"}>
                <div className={"thing-icon-container"}>
                    <img src="../../resources/control_icon.webp" alt="controll icon" className={"control-icon"}
                         id={thing["id"]+ "control"} onClick={(): void => displayOtherDevices(thing["id"])}
                    />
                    <img src="../../resources/wot_icon.png" alt="Thing icon" className={"thing-icon"}
                         onClick={(): void => {
                             const control: HTMLElement | null =
                                 document.getElementById(thing["id"] + "control")
                             // When control button is not there => thing is small => make it big and get the values
                             if (control && control.style.getPropertyValue("display") !== "block"){
                                 getValues(JSON.stringify(thing), "controller")
                                 displayAttributes(thing["id"], "none", "block")
                             }
                         }}
                    />
                </div>
                <div className={"thing-name"} key={index +  "-name"}>{thing["name"]}</div>
                <div className={"thing-attributes"} id={thing["id"]+ "attributes"}>{attributes}</div>
                {/*container with a list of all other devices for remote control*/}
                <div className={"thing-device-controller"} id={thing["id"]+ "device-controller"}>
                    {getOtherDevices(thing["id"], conf)}
                </div>
                <img src="../../resources/pngwing.com.png" alt="close icon" className={"close-icon"}
                     id={thing["id"]+ "exit"} onClick={() =>
                    displayAttributes(thing["id"], "block", "none")}
                />
            </div>
        )
    })
}

/**
 * Generates elements for displaying attributes of a thing. The buttons can trigger the corresponding request
 * and for properties the result is shown.
 * @param {string} thing_string - The thing configuration in string format.
 * @param {string} att_key - The attribute key.
 * @param {number} ind - The index of the attribute.
 * @param {string} sender - ID from the device that is calling the attribute or "controller" if direct call
 * @param {string} port - The port of the attribute.
 * @returns {JSX.Element} Element representing the attributes.
 */
function getAttributes(thing_string: string, att_key: string, ind: number, port: string, sender: string = "controller"): JSX.Element {
    const thing = JSON.parse(thing_string)
    const values: string[] = Object.keys(thing[att_key])
    const attributes: JSX.Element[] = Array.from({length: values.length},
        function (_, i: number): JSX.Element {
            if (att_key == "properties") {
                // handle properties
                const pId: string = thing["id"] + "-" + values[i] + "-" + "field-" + sender
                return (
                    //input field for values => shows current value and sets new value on enter
                    <div key={i} className={"thing-properties"}>
                        {/*name of the property*/}
                        {values[i]}:
                        <input id={pId} className={"properties-input"}
                               onKeyDown={(event): void => {
                                   if (event.key == "Enter") {
                                       const type: string = thing[att_key][values[i]]["type"]
                                       // check if the input value is valid (always a string but should have right content)
                                       if (checkType(event.currentTarget.value, type)) {
                                           const form = thing[att_key][values[i]]["form"]
                                           // transform new value to correct type and add to body
                                           form["value"] = changeType(event.currentTarget.value, type)
                                           form["sender"] = sender
                                           const credentials: string[] = getCredentials(thing["id"])
                                           // send request to change value
                                           if (credentials[0] === "basic" && credentials[1] === "header"
                                               && credentials.length === 4) {
                                               triggerRequestBasic(JSON.stringify(form), credentials)
                                                   .then((result: string): void => {
                                                       if (result !== "Error" && JSON.parse(result).value) {
                                                           console.log("Property " + values[i] + " was changed to \""
                                                               + JSON.parse(result).value + "\" by " + sender)
                                                           const property: HTMLInputElement | null =
                                                               document.getElementById(pId) as HTMLInputElement
                                                           if (property) property.value = JSON.parse(result).value
                                                           alert("Values can't be set in the moment.")
                                                       }
                                                   })
                                           } else alert("No correct security definition.")
                                       }
                                       else alert("Wrong input type, please try again.")
                                   }
                               }}
                        />
                    </div>
                )
            }
            if (att_key == "actions" || (att_key == "events" && sender !== "controller")) {
                // handle actions or events if they are called by another device
                const bId: string = thing["id"] + "-" + values[i] + "-" + "button- " + sender
                return (
                    <button id={bId} onClick={(): void => {
                        let form = thing[att_key][values[i]]["form"]
                        if (!form) {
                            form = JSON.parse("{\"href\": \"http://localhost:" + port + "/action/" + values[i]
                                + "\",\"contentType\":\"application/json\",\"htv:methodName\":\"GET\",\"op\":\"callaction\"}")
                        }
                        form["sender"] = sender
                        const credentials: string[] = getCredentials(thing["id"])
                        if (credentials[0] === "basic" && credentials[1] === "header" && credentials.length === 4) {
                            if (att_key === "events"){
                                // the answer will only come when the Event happened, so we have to do this before.
                                console.log(sender + " subscribed to event from " + thing["name"])
                                displayAttributes(sender, "block", "none")
                            }
                            triggerRequestBasic(JSON.stringify(form), credentials).then((result: string): void => {
                                if (att_key == "actions" && result !== "Error" && JSON.parse(result).name) {
                                    console.log(att_key.slice(0, -1) + ": " + JSON.parse(result).name +
                                        " was called by " + sender)
                                    displayAttributes(thing["id"], "block", "none")
                                } else if (att_key == "events" && result !== "Error") {
                                    console.log(thing["title"] + "emitted event \"" + values[i] + "\" and "
                                        + sender + " received it.")
                                }else alert("Something went wrong. Please try again.")
                            })
                        } else alert("No correct security definition.")
                    }} key={i} className={"button"}>{values[i]}
                    </button>
                )
            }
            // handle other attributes
            const aId: string = thing["id"] + "-" + values[i] + "-" + att_key + "-" + sender
            return (<div id={aId} key={i} className={"thing-others"}>{values[i]}</div>)
        })
    return (<div id={thing["id"] + "-" + att_key + "-" + sender} key={ind}> {att_key}: {attributes}</div>)
}

/**
 * Create buttons for all the other devices for the remote control.
 * @param {string} thing - The id of the current thing
 * @param {string[]} devices - An array with all the other devices
 * @returns {JSX.Element[]} - An array with buttons for the other devices.
 */
function getOtherDevices(thing: string, devices: string[]): JSX.Element {
    const deviceButtons: JSX.Element[] = []
    for (let i: number = 0; i < devices.length; i++){
        const currentDevice = JSON.parse(devices[i])
        // don't show the own device inside the thing
        if (currentDevice["id"] === thing) continue
        const button: JSX.Element =
            <button className={"button"} key={i} onClick={(): void => {
                const deviceName: HTMLElement | null = document.getElementById(thing + "device-name")
                if (deviceName) deviceName.innerHTML = currentDevice["name"] + ": "
                const deviceAttr: HTMLElement | null = document.getElementById(thing + "device-attributes")
                if (deviceAttr) deviceAttr.style.display = "block"
                const thingDevices: HTMLElement | null = document.getElementById(thing + "devices")
                if (thingDevices) thingDevices.style.display = "none"
                //create a representation of every attribute of the thing
                const values: string[] = Object.keys(currentDevice[att_keys[0]])
                const port: string = currentDevice["properties"][values[0]]["form"]["href"].split("localhost:")[1].slice(0,4)
                const attributes: JSX.Element[] = Array.from({length: att_keys.length},
                    function (_, ind: number): JSX.Element {
                        return getAttributes(devices[i], att_keys[ind], ind, port, thing)
                    })
                getValues(devices[i], thing)
                console.log(attributes)
            }}>{currentDevice["name"]}
            </button>
        deviceButtons.push(button)
    }
    // div for the remote control. Can switch between showing all the other devices and show the attributes of one
    return (
        <div>
            <div id={thing + "devices"}>
                <div>Other Devices:</div>
                {deviceButtons}
            </div>
            <div id={thing + "device-attributes"} className={"device-attributes"}>
                <div id={thing + "device-name"}></div>
                <div></div>
            </div>
        </div>
    )
}

/**
 * Retrieves and sets the values for the properties of a thing.
 * @param {string} thing_string - The thing configuration in string format.
 * @param {string} sender - ID from the device that is calling the property or "controller" if direct call
 */
function getValues(thing_string: string, sender: string = "controller"): void {
    const thing = JSON.parse(thing_string)
    const values: string[] = Object.keys(thing["properties"])
    for (let i: number = 0; i < values.length; i++) {
        const aId: string = thing["id"] + "-" + values[i] + "-" + "field-" + sender
        const form = thing["properties"][values[i]]["form"]
        form["sender"] = sender
        const credentials: string[] = getCredentials(thing["id"])
        if (credentials[0] === "basic" && credentials[1] === "header" && credentials.length === 4){
            triggerRequestBasic(JSON.stringify(form), credentials).then((result: string): void => {
                if (result !== "Error" && JSON.parse(result).value){
                    const attribute: HTMLInputElement | null = document.getElementById(aId) as HTMLInputElement
                    if (attribute) attribute.value = JSON.parse(result).value
                }else alert("Somthing went wrong. Please try again.")
            })
        }else alert("No correct security definition.")
    }
}

/**
 * Gets the security type and credentials for a specific device from the configuration file.
 * @param {string} thing - The ID of the thing.
 * @return {string[]} - Array with the security type, the way of transmitting and the credentials.
 */
function getCredentials(thing: string): string[]{
    const credentials: string[] = []
    if (config){
        const devices = JSON.parse(config)["devices"]
        for (let i: number = 0; i < devices.length; i++){
            const device = devices[i]
            if (device["id"] === thing){
                // basic security definition
                if(device["securityDefinitions"]["basic_sc"]
                    && device["securityDefinitions"]["basic_sc"]["scheme"] === "basic"){
                    credentials.push(device["securityDefinitions"]["basic_sc"]["scheme"])
                    credentials.push(device["securityDefinitions"]["basic_sc"]["in"])
                    credentials.push(device["credentials"]["basic_sc"]["username"])
                    credentials.push(device["credentials"]["basic_sc"]["password"])
                }
                //toDo implement other security definitions
            }
        }
    }
    return credentials
}



//---------------------- functions that handle what is displayed in the frontend ---------------------------------------

/**
 Toggles the display of the other devices inside a specific thing for the remote control.
 @param {string} thing - The identifier of the thing.
 */
function displayOtherDevices(thing: string): void {
    const thingAttributes: HTMLElement | null = document.getElementById(thing + "attributes")
    const deviceController: HTMLElement | null = document.getElementById(thing + "device-controller")
    const deviceAttr: HTMLElement | null = document.getElementById(thing + "device-attributes")
    const thingDevices: HTMLElement | null = document.getElementById(thing + "devices")
    if (thingDevices) thingDevices.style.display = "none"
    if (thingAttributes && thingDevices && deviceAttr && deviceController) {
        if (thingAttributes.style.display === "block") {
            thingAttributes.style.display = "none"
            thingDevices.style.display = "block"
            deviceController.style.display = "block"
        } else {
            thingAttributes.style.display = "block"
            thingDevices.style.display = "none"
            deviceAttr.style.display = "none"
        }
    }
}

/**
 Toggles the display of attributes for a specific thing and hides all the other things or the other way around
 @param {string} thing - The identifier of the thing.
 @param {string} disOthers - Display value for the other things
 @param {string} disThing - Display value for the specific thing
 */
function displayAttributes(thing: string, disOthers: string, disThing:string): void {
    //change display type of all the other things
    const things: HTMLCollectionOf<Element> = document.getElementsByClassName("thing")
    for (let i: number = 0; i<things.length; i++){
        const th: HTMLElement | null =  document.getElementById(things[i].id)
        if (things[i].id !== thing && th) th.style.display = disOthers
    }
    //change display type of the current thing
    const thingAttributes: HTMLElement | null = document.getElementById(thing + "attributes")
    if (thingAttributes) thingAttributes.style.display = disThing
    const thingControlIcon: HTMLElement | null = document.getElementById(thing + "control")
    if (thingControlIcon) thingControlIcon.style.display = disThing
    const thingExitIcon: HTMLElement | null = document.getElementById(thing + "exit")
    if (thingExitIcon) thingExitIcon.style.display = disThing
    const otherDevices: HTMLElement | null = document.getElementById(thing + "device-controller")
    if (otherDevices) otherDevices.style.display = "none"
    const otherDeviceAttribute: HTMLElement | null = document.getElementById(thing + "device-attributes")
    if (otherDeviceAttribute) otherDeviceAttribute.style.display = "none"
    const thingContainer: HTMLElement | null = document.getElementById(thing)
    if (thingContainer){
        if (disThing === "block") {
            thingContainer.style.width = "-webkit-fill-available"
            thingContainer.style.flex = "none"
        }
        if (disThing === "none"){
            thingContainer.style.width = "fit-content"
            thingContainer.style.flex = "0 0 calc(33.33% - 20px)"
        }
    }
}



//---------------------------- functions that handle text input --------------------------------------------------------

/**
 * Checks if the input value has the correct type.
 * @param {string} value - The new value that has to be checked
 * @param {string} type - The type the value should have
 * @returns {boolean} Boolean if the type is correct or not.
 */
function checkType(value: string, type: string): boolean {
    // initial value is true since all other values are handled as strings
    let bool: boolean = true
    switch (type){
        case "number": {
            if (Number.isNaN(Number(value))) bool = false
            break
        }
        case "boolean": {
            if (value.toLowerCase() !== "false" && value.toLowerCase() !== "true") bool = false
        }
        //todo: other possible types
    }
    return bool
}

/**
 * Transforms the input value to the correct type.
 * @param {string} value - The new value that has to be transformed
 * @param {string} type - The type the value should have
 * @returns The transformed value
 */
function changeType(value: string, type: string): string | number | boolean {
    let transformedValue
    switch (type){
        case "number": {
            transformedValue = Number(value)
            break
        }
        case "boolean": {
            transformedValue = (value.toLowerCase() === "true")
            break
        }
        //todo: other possible types
        default: {
            // default value is string since all other values are handled as strings.
            transformedValue = value
        }
    }
    return transformedValue
}



//--------------------- functions for requests to backend --------------------------------------------------------------

/**
 Triggers requests for an attribute of a specified Thing to the backend and returns the answer as a string.
 The Backend triggers a request to the Thing and forwards the answer back to this function.
 This function works with the basic WoT security definition with the credentials in the header
 toDo: function for other definitions.
 @param {string} form - The form parameter of the thing.
 @param {string[]} credentials - Credentials to access the device
 @returns {Promise<string>} A promise that resolves to the fetched answer as a string.
 */
async function triggerRequestBasic(form: string, credentials: string[]): Promise<string>{
    console.log(credentials)
    try {
        const response: Response = await fetch(urlET, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'username': credentials[2], 'password': credentials[3]},
            body: form
        })
        if (response.ok) return await response.text()
        return "Error"
    } catch (error) {
        return "Error"
    }
}

/**
 Fetches thing descriptions or config file from a specified URL and returns them as a string.
 @param {string} url - Url to get the specific file
 @returns {Promise<string>} A promise that resolves to the fetched thing descriptions or config file as a string.
 */
async function fetchFiles(url: string): Promise <string> {
    try {
        const response: Response = await fetch(url);
        if (response.ok) return await response.text()
        else return "Error"
    } catch (error) {
        return "Error"
    }
}

export default ThingRepresentation