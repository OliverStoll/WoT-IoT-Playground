import {useEffect, useState} from "react"
import './component_css/ThingRepresentationStyle.css'

const urlTD: string = 'http://localhost:5001/api/logs/thingDescriptions'
const urlET: string = 'http://localhost:5001/api/call'

/**
 Renders a component that fetches and displays a list of thing representations.
 The component periodically fetches thing descriptions and updates the list if there are changes.
 @returns {JSX.Element} The rendered component displaying the thing representations.
 */
const ThingRepresentation = () => {
    const [things, setThings] = useState<JSX.Element[]>([])
    useEffect(() : void => {
        // get all TD from backend
        fetchThingDescriptions().then(function (res: string) :void {
            // if an error occurred or the list is empty-> return
            if (res === "Error" || res === "[]") return
            // parse the TD to show them
            setThings(getThings(JSON.parse(res)))
        })
    },[]);
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
        // important attributes you want to show
        const attToShow: string[] = ["actions", "properties", "events"]
        const att_keys: string[] = Object.keys(thing)
            .filter(function (key: string){ return attToShow.includes(key)})
        //create a button for the important attributes of every thing description
        const attributes: JSX.Element[] = Array.from({length: att_keys.length},
            function (_, ind: number): JSX.Element {
            return getAttributes(JSON.stringify(thing), att_keys[ind], ind)
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
                             getValues(JSON.stringify(thing))
                             displayAttributes(thing["id"], "none", "block")
                         }}
                    />
                </div>
                <div className={"thing-name"} key={index +  "-name"}>{thing["title"]}</div>
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
 * @returns {JSX.Element} Element representing the attributes.
 */
function getAttributes(thing_string: string, att_key: string, ind: number): JSX.Element {
    const thing = JSON.parse(thing_string)
    const values: string[] = Object.keys(thing[att_key])
    const attributes: JSX.Element[] = Array.from({length: values.length},
        function (_, i: number): JSX.Element {
            if (att_key == "properties") {
                // handle properties
                const aId: string = thing["id"] + "-" + values[i] + "-" + "field"
                return (
                    //input field for values => shows current value and sets new value on enter
                    <div key={i} className={"thing-properties"}>
                        {/*name of the property*/}
                        {values[i]}:
                        <input id={aId} className={"properties-input"}
                               onKeyDown={(event): void => {
                               if (event.key == "Enter") {
                                   const type: string = thing[att_key][values[i]]["type"]
                                   // check if the input value is valid (always a string but should have right content)
                                   if (checkType(event.currentTarget.value, type)) {
                                       const form = thing[att_key][values[i]]["forms"][0]
                                       // transform new value to correct type and add to body
                                       form["value"] = changeType(event.currentTarget.value, type)
                                       // send request to change value
                                       triggerRequest(JSON.stringify(form)).then((result: string): void => {
                                           console.log("Property "+ values[i] +" was changed to: "
                                               + JSON.parse(result).value)
                                           const attribute: HTMLInputElement| null =
                                               document.getElementById(aId) as HTMLInputElement
                                           if (attribute) attribute.value = JSON.parse(result).value
                                           alert("Values can't be set in the moment.")
                                       })
                                   }
                                   else alert("Wrong input type, please try again.")
                               }
                               }}
                        />
                    </div>
                )
            }
            // handle events
            if (att_key == "events") {
                const eId: string = thing["id"] + "-" + values[i] + "-" + "event"
                return (<div id={eId} key={i} className={"thing-events"}>{values[i]}</div>)
            }
            // handle actions
            const bId: string = thing["id"] + "-" + values[i] + "-" + "button"
            return (
                <button id={bId} onClick={(): void => {
                    let form: string = JSON.stringify(thing[att_key][values[i]]["forms"][0])
                    triggerRequest(form).then((result: string): void =>
                        console.log(att_key.slice(0, -1) + ": " + JSON.parse(result).name + " was called."))
                    displayAttributes(thing["id"], "block", "none")
                }} key={i} className={"button"}>{values[i]}
                </button>
            )
        })
    return (<div id={thing["id"] + "-" + att_key} key={ind}> {att_key}: {attributes}</div>)
}

/**
 * Create buttons for all the other devices for the remote control.
 * @param {string} thing - The id of the current thing
 * @param {string[]} devices - An array with all the other devices
 * @returns {JSX.Element[]} - An array with buttons for the other devices.
 */
function getOtherDevices(thing: string, devices: string[]): JSX.Element {
    const deviceButtons: JSX.Element[] = []
    for (let i: number = 0; i< devices.length; i++){
        const currentDevice = JSON.parse(devices[i])
        // don't show the own device inside the thing
        if (currentDevice["id"] === thing) continue
        const button: JSX.Element =
            <button className={"button"} key={i} onClick={(): void => {
                const deviceName: HTMLElement | null = document.getElementById(thing + "device-name")
                if (deviceName) deviceName.innerHTML = currentDevice["title"] + ": "
                const deviceAttr: HTMLElement | null = document.getElementById(thing + "device-attributes")
                if (deviceAttr) deviceAttr.style.display = "block"
                const thingDevices: HTMLElement | null = document.getElementById(thing + "devices")
                if (thingDevices) thingDevices.style.display = "none"
            }}>{currentDevice["title"]}
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
            </div>
        </div>
    )
}



/**
 * Retrieves and sets the values for the properties of a thing.
 * @param {string} thing_string - The thing configuration in string format.
 */
function getValues(thing_string: string): void {
    const thing = JSON.parse(thing_string)
    const values: string[] = Object.keys(thing["properties"])
    for (let i: number = 0; i < values.length; i++) {
        const aId: string = thing["id"] + "-" + values[i] + "-" + "field"
        const form = thing["properties"][values[i]]["forms"][0]
        triggerRequest(JSON.stringify(form)).then((result: string): void => {
            const attribute: HTMLInputElement | null = document.getElementById(aId) as HTMLInputElement
            if (attribute) attribute.value = result
        })
    }
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
function changeType(value: string, type: string) {
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
 @param {string} form - The form parameter of the thing.
 @returns {Promise<string>} A promise that resolves to the fetched answer as a string.
 */
async function triggerRequest(form: string): Promise<string>{
    try {
        const response: Response = await fetch(urlET, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: form
        })
        if (response.ok) return await response.text()
        return "ERROR"
    } catch (error) {
        return "Error"
    }
}

/**
 Fetches thing descriptions from a specified URL and returns them as a string.
 @returns {Promise<string>} A promise that resolves to the fetched thing descriptions as a string.
 */
async function fetchThingDescriptions(): Promise <string> {
    try {
        const response: Response = await fetch(urlTD);
        if (response.ok) return await response.text()
        else return "Error"
    } catch (error) {
        console.error('Error fetching thing descriptions:', error);
        return "Error"
    }
}

export default ThingRepresentation