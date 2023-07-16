import {useEffect, useState} from "react"
import './component_css/ThingRepresentationStyle.css'

const urlTD = 'http://localhost:5001/api/logs/thingDescriptions'
const urlConfig = 'http://localhost:5001/api/config'
const urlET = 'http://localhost:5001/api/call'

// important attributes you want to show inside the things
const att_keys: string[] = ["properties", "actions", "events"]
// config for the playground
let config: string
//list of all Thing Descriptions
let thingDescriptions: string[]
// preferred protocol for API calls
const preferredProtocol = "http"

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
        fetchFiles(urlTD).then(function (tD: string) :void {
            // if an error occurred or the list is empty-> return
            if (tD === "Error" || tD === "[]") return
            // parse the TD to show them
            thingDescriptions = JSON.parse(tD)
            setThings(getThings())
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
 @returns {JSX.Element[]} An array of JSX elements representing the things.
 */
function getThings(): JSX.Element[] {
    return Array.from({length: thingDescriptions.length}, function (_, index: number) {
        const thing = JSON.parse(thingDescriptions[index])
        //create a button for the important attributes of every thing description
        const attributes: JSX.Element[] = Array.from({length: att_keys.length},
            function (_, ind: number): JSX.Element {
                return getAttributes(JSON.stringify(thing), att_keys[ind], ind)
            })
        // change icon depending on local or remote device
        const icon: string = thing["external"] ? "../../resources/wot_remote.png" : "../../resources/wot_icon.png"
        // create div for every thing description with a symbol and all attributes
        return (
            <div id={thing["id"]} className={"thing"} key={index + "-thing"}>
                <div className={"thing-icon-container"}>
                    <img src="../../resources/control_icon.webp" alt="control icon" className={"control-icon"}
                         id={thing["id"]+ "control"} onClick={(): void => displayOtherDevices(thing["id"])}
                    />
                    <img src={icon} alt="Thing icon" className={"thing-icon"}
                         onClick={(): void => {
                             const control: HTMLElement | null =
                                 document.getElementById(thing["id"] + "control")
                             // When control button is not there => thing is small => make it big and get the values
                             if (control && control.style.getPropertyValue("display") !== "block"){
                                 // we also need credentials here because we want to get the properties
                                 const credentials: string[] = getCredentials(thingDescriptions[index])
                                 if (credentials.length > 0) {
                                     // No, or basic security definition
                                     getValues(JSON.stringify(thing), "controller")
                                     displayAttributes(thing["id"], "none", "block")
                                 }else alert("No correct security definition.")
                             }
                         }}
                    />
                </div>
                <div className={"thing-name"} key={index +  "-name"}>{thing["title"]}</div>
                <div className={"thing-attributes"} id={thing["id"]+ "attributes"}>{attributes}</div>
                {/*container with a list of all other devices for remote control*/}
                <div className={"thing-device-controller"} id={thing["id"]+ "device-controller"}>
                    {getOtherDevices(thing["id"])}
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
 * @returns {JSX.Element} Element representing the attributes.
 */
function getAttributes(thing_string: string, att_key: string, ind: number, sender = "controller"): JSX.Element {
    const thing = JSON.parse(thing_string)
    // get all the attribute names except the "shutdown" and "make_request" action, they are only for internal usage.
    const values: string[] = Object.keys(thing[att_key]).filter((value: string) => value !== "shutdown"
        && value !== "make_request")
    // current device to hide when action is called
    const currentDevice: string = sender === "controller" ? thing["id"] : sender
    const attributes: JSX.Element[] = Array.from({length: values.length},
        function (_, i: number): JSX.Element {
            const form = getForm(thing[att_key][values[i]])
            if (att_key == "properties") {
                // handle properties
                const pId: string = thing["id"] + "-" + values[i] + "-" + sender
                return (
                    //input field for values => shows current value and sets new value on enter
                    <div id={pId} key={i} className={"thing-properties"}>
                        {/*name of the property*/}
                        {values[i]}:
                        <input id={pId + "-field"} className={"properties-input"}
                               onKeyDown={(event): void => {
                                   if (event.key == "Enter") {
                                       if (!thing[att_key][values[i]]["readOnly"]) {
                                           const type: string = thing[att_key][values[i]]["type"]
                                           const value: string = event.currentTarget.value
                                           // check if the input value is valid (always string but should have right content)
                                           if (checkType(value, type)) {
                                               // transform new value to correct type and add to body
                                               form["value"] = changeType(value, type)
                                               form["sender"] = sender
                                               if (preferredProtocol === "http") {
                                                   // if http protocol we have to change the method
                                                   // to be able to set a value
                                                   form["htv:methodName"] = "PUT"
                                                   if (sender !== "controller") {
                                                       // when sender is another device => set property with
                                                       // make_request action from the other device
                                                       form["htv:methodName"] = "POST"
                                                       form["href"] = getMakeRequestHref(sender, "PUT")
                                                           + form["href"]
                                                   }
                                               }
                                               //toDo implement set property for other protocols
                                               const credentials: string[] = getCredentials(thing_string)
                                               // send request to change value
                                               if (credentials.length > 0) {
                                                   // No, or basic security definition
                                                   triggerRequest(JSON.stringify(form), credentials)
                                                       .then((result: string): void => {
                                                           if (result !== "Error") {
                                                               console.log("Property \"" + values[i] + "\" from "
                                                                   + thing["title"] + " got changed to \""
                                                                   + value + "\" by " + sender)
                                                           }
                                                       })
                                               } else alert("No correct security definition.")
                                           } else alert("Wrong input type! Input should be from type: " + type)
                                       } else alert("This property is read only!")
                                       displayAttributes(currentDevice, "block", "none")
                                   }
                               }}
                        />
                    </div>
                )
            }
            if (form && (!thing[att_key][values[i]]["uriVariables"]
                    || (thing[att_key][values[i]]["uriVariables"] && Object.keys(thing[att_key][values[i]]["uriVariables"].length === 0)))
                && (att_key == "actions" || (att_key == "events" && sender !== "controller"))) {
                // generate button for actions, or events if they are accessed by another device
                const bId: string = thing["id"] + "-" + values[i] + "-" + "button- " + sender
                return (
                    <button id={bId} onClick={(): void => {
                        form["sender"] = sender
                        if (sender !== "controller" && preferredProtocol === "http") {
                            // when sender is another device => call action with make_request action from the other device
                            if(att_key === "events"){
                                form["href"] = getMakeRequestHref(sender, "GET") + form["href"]
                                form["htv:methodName"] = "POST"
                            }
                            else form["href"] = getMakeRequestHref(sender, "POST") + form["href"]

                        }
                        const credentials: string[] = getCredentials(thing_string)
                        if (credentials.length > 0) {
                            // No, or basic security definition
                            if (att_key === "events") {
                                // the answer will only come when the Event happened, so we have to do this before.
                                console.log(getSenderTitle(sender) + " subscribed to event \"" + values[i] + "\" from " + thing["title"])
                                displayAttributes(currentDevice, "block", "none")
                            }
                            triggerRequest(JSON.stringify(form), credentials).then((result: string): void => {
                                if (att_key == "actions" && result !== "Error") {
                                    console.log(att_key.slice(0, -1) + " \"" + values[i] + "\" from " + thing["title"]
                                        + " got called by " + getSenderTitle(sender))
                                    displayAttributes(currentDevice, "block", "none")
                                } else if (att_key == "events" && result !== "Error") {
                                    if (result.includes("Success")){
                                        alert(thing["title"] + " emitted event \"" + values[i] + "\" and "
                                            + getSenderTitle(sender) + " received it.")
                                    }
                                    else (console.log("The subscription from " + getSenderTitle(sender)+ " to event \""
                                        + values[i] + "\" timed out."))
                                } else alert("Something went wrong. Please try again.")
                            })
                        } else alert("No correct security definition.")
                    }} key={i} className={"button"}>{values[i]}
                    </button>
                )
            }
            const parameterForm = getForm(thing[att_key][values[i]], true)
            // add input field for actions with uri parameter
            if (att_key === "actions" && parameterForm) {
                const iId: string = thing["id"] + "-" + values[i] + "-" + "input- " + sender
                // get beginning of the address of the thing
                //toDo add actions with parameters in input field and for other protocols
                if (preferredProtocol === "http"){
                    let baseAddress: string = parameterForm["href"].split("actions/")[0] + "actions/"
                    if (sender !== "controller") {
                        // when sender is another device and protocol http => get make request href
                        baseAddress = getMakeRequestHref(sender, "POST") + baseAddress
                    }
                    let input = values[i] + "?"
                    const variables: string[] = Object.keys(thing[att_key][values[i]]["uriVariables"])
                    for (let i = 0; i < variables.length; i++){
                        if (i <variables.length-1) input = input.concat(variables[i] + "=&")
                        else input = input.concat(variables[i] + "=")
                    }
                    return (
                        <input id={iId} className={"action-input"}
                               defaultValue={input} key={"action-input"}
                               onKeyDown={(event): void => {
                                   if (event.key == "Enter") {
                                       const value: string = event.currentTarget.value
                                       const credentials: string[] = getCredentials(thing_string)
                                       const inputField: HTMLInputElement | null = document.getElementById(iId) as HTMLInputElement
                                       if (inputField) inputField.value = input
                                       if (credentials.length > 0) {
                                           // No, or basic security definition
                                           parameterForm["href"] = baseAddress + value
                                           parameterForm["sender"] = sender
                                           triggerRequest(JSON.stringify(parameterForm), credentials).then((result: string): void => {
                                               if (result !== "Error") {
                                                   console.log("action from " + thing["title"] + " got called by " + getSenderTitle(sender))
                                                   displayAttributes(currentDevice, "block", "none")
                                               }
                                           })
                                       }
                                   }
                               }}>
                        </input>
                    )
                }
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
 * @returns {JSX.Element[]} - An array with buttons for the other devices.
 */
function getOtherDevices(thing: string): JSX.Element {
    // if device current device is a remote device, don't get control icon
    if (checkIfRemote(thing)){
        const controlIcon: HTMLElement | null = document.getElementById(thing+ "control")
        if (controlIcon) controlIcon.style.visibility = "hidden"
        return <div/>
    }
    const deviceButtons: JSX.Element[] = []
    const otherDeviceAttributes: JSX.Element[] = []
    for (let i = 0; i < thingDescriptions.length; i++){
        const currentDevice = JSON.parse(thingDescriptions[i])
        // don't show the own device inside the thing
        if (currentDevice["id"] === thing) continue
        //create a representation of every attribute of the thing
        const attributes: JSX.Element[] = Array.from({length: att_keys.length},
            function (_, ind: number): JSX.Element {
                return getAttributes(thingDescriptions[i], att_keys[ind], ind, thing)
            })
        otherDeviceAttributes.push(
            <div id={thing + "_" + currentDevice["id"] + "_remote"} className={"other-device-attributes"} key={i}>
                <div>{currentDevice["title"]}: </div>
                {attributes}
            </div>
        )
        const button: JSX.Element =
            <button className={"button"} key={i} onClick={(): void => {
                const deviceAttr: HTMLElement | null =
                    document.getElementById(thing + "_" + currentDevice["id"] + "_remote")
                if (deviceAttr) deviceAttr.style.display = "block"
                const thingDevices: HTMLElement | null = document.getElementById(thing + "devices")
                if (thingDevices) thingDevices.style.display = "none"
                getValues(thingDescriptions[i], thing)
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
            <div>{otherDeviceAttributes}</div>
        </div>
    )
}

/**
 * Retrieves and sets the values for the properties of a thing.
 * @param {string} thing_string - The thing configuration in string format.
 * @param {string} sender - ID from the device that is calling the property or "controller" if direct call
 */
function getValues(thing_string: string, sender = "controller"): void {
    const thing = JSON.parse(thing_string)
    const values: string[] = Object.keys(thing["properties"])
    for (let i = 0; i < values.length; i++) {
        const aId: string = thing["id"] + "-" + values[i] + "-" + sender
        // show property attribute
        const property: HTMLElement | null = document.getElementById(aId)
        // show property again, maybe it was hidden the last time because of an error
        if(property) property.style.display = "inline-block"
        const form = getForm(thing["properties"][values[i]])
        if (preferredProtocol === "http" && sender !== "controller" && form) {
            // when sender is another device => get property with make_request action from the other device
            // if http protocol we have to change the method to call the make_request action
            form["htv:methodName"] = "POST"
            form["href"] = getMakeRequestHref(sender, "GET") + form["href"]
            //toDo implement make_request for other protocols
        }
        // if there is no form with the right protocol hide the property
        if (!form && property) property.style.display = "none"
        else {
            form["sender"] = sender
            const credentials: string[] = getCredentials(thing_string)
            if (credentials.length > 0) {
                // No, or basic security definition
                triggerRequest(JSON.stringify(form), credentials).then((result: string): void => {
                    if (result !== "Error"){
                        if (result !== ""){
                            const attribute: HTMLInputElement | null =
                                document.getElementById(aId + "-field") as HTMLInputElement
                            if (attribute) attribute.value = sender !== "controller"? JSON.parse(result): result
                        }else if (property){
                            // if property has no value, hide it
                            property.style.display = "none"
                        }
                    }else alert("Something went wrong. Please try again.")
                })
            }else alert("No correct security definition.")
        }
    }
}

/**
 * Gets the security type and credentials for a specific device from the configuration file.
 * @param {string} thing_string - The string representation of the Thing
 * @return {string[]} - Array with the security type, the way of transmitting and the credentials.
 */
function getCredentials(thing_string: string): string[]{
    const credentials: string[] = []
    const thing = JSON.parse(thing_string)
    // no security definition
    if (thing["security"][0] === "nosec_sc") credentials.push("none")
    else if (config){
        // if we have a security definition we have to get the credentials from the config
        const devices = JSON.parse(config)["devices"]
        for (let i = 0; i < devices.length; i++){
            const device = devices[i]
            // correct thing
            if (device["title"] === thing["title"]){
                // check if field exists
                if (device["securityDefinitions"]){
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
    }
    return credentials
}

/**
 * Gets the href property from the make_request function of the Thing. With the make_request function you can get
 * properties or call action from other devices. => for http only
 * @param {string} sender - The ID of the device that wants to call the action
 * @param {string} method - The ID of the device that wants to call the action
 * @return {string} - The href properties of the action
 */
function getMakeRequestHref(sender: string, method: string): string {
    // make_requests is an automatically created action to communicate with another Thing
    let href = ""
    for (let i = 0; i < thingDescriptions.length; i++) {
        const currentDevice = JSON.parse(thingDescriptions[i])
        if (currentDevice["id"] === sender) {
            // the first form is always http in this function
            href = currentDevice["actions"]["make_request"]["forms"][0]["href"].split("{")[0]
                + "?method=" + method + "&url="
        }
    }
    return href
}

/**
 * Gets the form for a specific protocol for an API call
 * @param {any} attribute - The attribute where you want to get the form
 * @param {boolean} withInput - Specifies if we want a form with inputs or not
 * @return The form property for the specified protocol
 */
function getForm(attribute: any, withInput = false) {
    const forms = attribute["forms"]
    for (let i = 0; i < forms.length; i++){
        const form: any = forms[i]
        // we only support input over uriVariables not over body input
        if (form["href"].startsWith(preferredProtocol) && !attribute["input"]){
            // every action has a caller parameter, it is also ignored since it is only needed internally
            if (attribute["uriVariables"] && attribute["uriVariables"]["caller"]) delete attribute["uriVariables"]["caller"]
            // only form with the right protocol, and a correct implementation of uriVariables or without any parameter
            if (!form["href"].includes("{?") || (attribute["uriVariables"] &&
                (Object.keys(attribute["uriVariables"]).length === 0 || (withInput && form["href"].includes("{?"))))) {
                if (attribute["uriVariables"] && Object.keys(attribute["uriVariables"]).length === 0){
                    form["href"] = form["href"].split("{?")[0]
                }
                return form
            }
        }
    }
    return
}


/**
 * Gets title of a sending device by its ID, or "controller" if the device is not existing
 * @param {string} sender - the ID of the device that is sending a request
 * @return The title of the device
 */
function getSenderTitle(sender: string): string {
    for (let i = 0; i < thingDescriptions.length; i++) {
        const thing = JSON.parse(thingDescriptions[i])
        if (thing["id"] === sender) return thing["title"]
    }
    return "controller"
}



//---------------------- functions that handle what is displayed in the frontend ---------------------------------------

/**
 Toggles the display of the other devices inside a specific thing for the remote control.
 @param {string} thing - The identifier of the thing.
 */
function displayOtherDevices(thing: string): void {
    const thingAttributes: HTMLElement | null = document.getElementById(thing + "attributes")
    const deviceController: HTMLElement | null = document.getElementById(thing + "device-controller")
    const deviceAttr: HTMLCollectionOf<Element> = document.getElementsByClassName("other-device-attributes")
    const thingDevices: HTMLElement | null = document.getElementById(thing + "devices")
    if (thingDevices) thingDevices.style.display = "none"
    if (thingAttributes && thingDevices && deviceController) {
        if (thingAttributes.style.display === "block") {
            thingAttributes.style.display = "none"
            thingDevices.style.display = "block"
            deviceController.style.display = "block"
        } else {
            thingAttributes.style.display = "block"
            thingDevices.style.display = "none"
            for (const element of deviceAttr){
                const device: HTMLElement | null = document.getElementById(element.id)
                if (device) device.style.display = "none"
            }
        }
    }
}

/**
 Toggles the display of attributes for a specific thing and hides all the other things or the other way around
 @param {string} thing - The ID of the thing.
 @param {string} disOthers - Display value for the other things
 @param {string} disThing - Display value for the specific thing
 */
function displayAttributes(thing: string, disOthers: string, disThing:string): void {
    //change display type of all the other things
    const things: HTMLCollectionOf<Element> = document.getElementsByClassName("thing")
    for (let i = 0; i<things.length; i++){
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
    const deviceAttr: HTMLCollectionOf<Element> = document.getElementsByClassName("other-device-attributes")
    for (const element of deviceAttr){
        const device: HTMLElement | null = document.getElementById(element.id)
        if (device) device.style.display = "none"
    }
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



//---------------------------- functions that handle text input or check something -------------------------------------

/**
 * Checks if the input value has the correct type.
 * @param {string} value - The new value that has to be checked
 * @param {string} type - The type the value should have
 * @returns {boolean} Boolean if the type is correct or not.
 */
function checkType(value: string, type: string): boolean {
    // initial value is true since all other values are handled as strings
    let bool= true
    switch (type){
        case "number": {
            if (Number.isNaN(Number(value))) bool = false
            break
        }
        case "integer": {
            if (!Number.isInteger(Number(value))) bool = false
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
        case "integer": {
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

/**
 * Checks if a given Thing is a remote device or not
 * @param {string} thing- ID of the Thing
 * @returns A boolean depending on if the Thing is remote or not
 */
function checkIfRemote(thing: string): boolean{
    for (let i = 0; i < thingDescriptions.length; i++){
        const currentDevice = JSON.parse(thingDescriptions[i])
        if (currentDevice["id"] === thing){
            return currentDevice["external"]
        }
    }
    return false
}



//--------------------- functions for requests to backend --------------------------------------------------------------

/**
 Triggers requests for an attribute of a specified Thing to the backend and returns the answer as a string.
 The Backend triggers a request to the Thing and forwards the answer back to this function.
 @param {string} form - The form parameter of the thing.
 @param {string[]} credentials - Credentials to access the device
 @returns {Promise<string>} A promise that resolves to the fetched answer as a string.
 */
async function triggerRequest(form: string, credentials: string[]): Promise<string>{
    try {
        let response: Response = new Response()
        if (credentials[0] === "none"){
            // no security definition
            response = await fetch(urlET, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json'},
                body: form
            })
        }
        else if (credentials[0] === "basic" && credentials[1] === "header"){
            // basic in header security definition in config
            response= await fetch(urlET, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'username': credentials[2], 'password': credentials[3]},
                body: form
            })
        }
        // toDo implement other security definitions
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