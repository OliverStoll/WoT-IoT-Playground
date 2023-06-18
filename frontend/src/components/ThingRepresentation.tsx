import {useEffect, useState} from "react";
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
    let oldConf: string
    useEffect(() => {
        const interval: number = setInterval(function (): void {
            fetchThingDescriptions().then(function (res: string): void {
                // if an error occurred, the list is empty or nothing has changed -> return
                if (res === "Error" || res === "[]" || res === oldConf) return
                oldConf = res
                setThings(getThings(JSON.parse(res)))
            })
        }, 5000);
        return () => {
            clearInterval(interval);
        };
    },[]);
    return <div className={"thing-container"}>{things}</div>
}

/**
 Converts a list of thing configurations into an array of JSX elements representing each thing.
 Each thing element includes an icon, along with selected attributes of the thing.
 @param {string[]} conf - The list of thing configurations.
 @returns {JSX.Element[]} An array of JSX elements representing the things.
 */
function getThings(conf: string[]): JSX.Element[] {
    return Array.from({length: conf.length}, function (_, index: number) {
        let thing = JSON.parse(conf[index])
        // important attributes you want to show
        let attToShow: string[] = ["actions", "properties", "events"]
        let att_keys: string[] = Object.keys(thing)
            .filter(function (key: string){ return attToShow.includes(key)})
        //create a button for the important attributes of every thing description
        let values: string[] = Object.keys(thing[att_keys[0]])
        let port: string = thing[att_keys[0]][values[0]]["form"]["href"].split("localhost:")[1].slice(0,4)
        let attributes: JSX.Element[] = Array.from({length: att_keys.length},
            function (_, ind: number): JSX.Element {
            return getAttributes(JSON.stringify(thing), att_keys[ind], ind, port)
        })
        // create div for every thing description with a symbol and all attributes
        return (
            <div id={thing["id"]} className={"thing"} key={index + "-thing"}>
                <img src="../../resources/wot_icon.png" alt="Thing icon" className={"thing-icon"}
                     onClick={() => displayAttributes(thing["id"], "none", "block")}/>
                <div className={"thing-name"} key={index +  "-name"}>{thing["name"]}</div>
                <div className={"thing-attributes"} id={thing["id"]+ "attributes"}
                     onLoad={():void => {getInitialValues(JSON.stringify(thing))}}>
                    {attributes}
                    <img src="../../resources/pngwing.com.png" alt="Close icon" className={"close-icon"}
                         onClick={() => displayAttributes(thing["id"], "block", "none")}/>
                </div>
            </div>
        )
    })
}


/**
 * Retrieves and sets the initial values for the properties of a thing.
 * @param {string} thing_string - The thing configuration in string format.
 */
function getInitialValues(thing_string: string): void {
    let thing = JSON.parse(thing_string)
    let values: string[] = Object.keys(thing["properties"])
    for (let i: number = 0; i < values.length; i++) {
        let aId: string = thing["id"] + "-" + values[i] + "-" + "field"
        triggerRequest(JSON.stringify(thing["properties"][values[i]]["form"])).then((result: any): void => {
            let attribute: HTMLElement | null = document.getElementById(aId)
            if (attribute) attribute.setAttribute("value", result.value)
        })
    }
}

/**
 * Generates elements for displaying attributes of a thing. The buttons can trigger the corresponding request
 * and for properties the result is shown.
 * @param {string} thing_string - The thing configuration in string format.
 * @param {string} att_key - The attribute key.
 * @param {number} ind - The index of the attribute.
 * @param {string} port - The port of the attribute.
 * @returns {JSX.Element} Element representing the attributes.
 */
function getAttributes(thing_string: string, att_key: string, ind: number, port: string): JSX.Element {
    let thing = JSON.parse(thing_string)
    let values: string[] = Object.keys(thing[att_key])
    let attributes: JSX.Element[] = Array.from({length: values.length}, function (_, i: number): JSX.Element {
        if (att_key == "properties") {
            let aId: string = thing["id"] + "-" + values[i] + "-" + "field"
            return (
                //input field for values => shows current value and sets new value on enter
                <div key={i} className={"thing-properties"}>
                    {values[i]}:
                    <input id={aId} className={"properties-input"} onKeyDown={(event): void => {
                        if (event.key == "Enter") {
                            let form = thing[att_key][values[i]]["form"]
                            form["htv:methodName"] = "POST"
                            form["value"] = event.currentTarget.value
                            triggerRequest(JSON.stringify(form)).then((result: string): void => {console.log(result)})
                        }
                    }}/>
                </div>
            )
        }
        let bId: string = thing["id"] + "-" + values[i] + "-" + "button"
        return (
            <button id={bId} onClick={(): void => {
                let form: string = JSON.stringify(thing[att_key][values[i]]["form"])
                if (!form) {
                    form = "{\"href\": \"http://localhost:" + port + "/action/" + values[i]
                        + "\",\"contentType\":\"application/json\",\"htv:methodName\":\"GET\",\"op\":\"callaction\"}"
                }
                triggerRequest(form).then((result: string): void => {console.log(result)})
            }} key={i} className={"button"}>{values[i]}
            </button>)
    })
    return (<div id={thing["id"] + "-" + att_key} key={ind}> {att_key}: {attributes}</div>)
}

/**
//  Triggers requests for an attribute of a specified Thing and returns the answer as a string.
//  @param {string} form - The form parameter of the thing.
//  @param {string} altAddress
//  @returns {Promise<string>} A promise that resolves to the fetched answer as a string.
//  */
// async function triggerRequest(form: any, altAddress: string): Promise<string> {
//     try {
//         if (JSON.stringify(form["href"]).startsWith("http")){
//             // thing communicates with http
//             const response: Response = await fetch(form["href"] ? form["href"] : altAddress, {
//                 method: form["htv:methodName"] ? form["htv:methodName"] : 'GET',
//                 headers: { 'Content-Type': form["contentType"] ? form["contentType"] : 'application/json' },
//             })
//             if (response.ok) return await response.text()
//         }
//         // toDo: thing communicates with another protocol
//         return "Error"
//     } catch (error) {
//         return "Error"
//     }
// }

/**
 Triggers requests for an attribute of a specified Thing to the backend and returns the answer as a string.
 The Backend triggers a request to the Thing and forwards the answer back to this function.
 @param {string} form - The form parameter of the thing.
 @returns {Promise<string>} A promise that resolves to the fetched answer as a string.
 */

async function triggerRequest(form: string): Promise<any> {
    try {
        const response: Response = await fetch(urlET, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: form
        })
        if (response.ok) return await response.json()
        return "Fehler"
    } catch (error) {
        console.log(error)
        return "Error erorrr"
    }
}

/**
 Toggles the display of attributes for a specific thing and hides all the other things or the other way around
 @param {string} thing - The identifier of the thing.
 @param {string} disOthers - Display value for the other things
 @param {string} disThing - Display value for the specific thing
 */
function displayAttributes(thing: string, disOthers: string, disThing:string): void {
    let things: HTMLCollectionOf<Element> = document.getElementsByClassName("thing")
    for (let i: number = 0; i<things.length; i++){
        let th: HTMLElement | null =  document.getElementById(things[i].id)
        if (things[i].id !== thing && th !== null) th.style.display = disOthers
    }
    let thingAttributes: HTMLElement | null = document.getElementById(thing + "attributes")
    if (thingAttributes !== null)thingAttributes.style.display = disThing
    let thingContainer: HTMLElement | null = document.getElementById(thing)
    if (thingContainer !== null){
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