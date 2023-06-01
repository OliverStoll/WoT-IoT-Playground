import {useEffect, useState} from "react";
import './component_css/ThingRepresentationStyle.css'

const url: string = 'http://localhost:5001/api/logs/thingDescriptions'


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
                <div className={"thing-attributes"} id={thing["id"]+ "attributes"}>
                    {attributes}
                    <img src="../../resources/pngwing.com.png" alt="Close icon" className={"close-icon"}
                         onClick={() => displayAttributes(thing["id"], "block", "none")}/>
                </div>
            </div>
        )
    })
}

/**
 * Generates buttons for displaying attributes of a thing. The buttons can trigger the corresponding request
 * and for properties the result is shown.
 * @param {string} thing_string - The thing configuration in string format.
 * @param {string} att_key - The attribute key.
 * @param {number} ind - The index of the attribute.
 * @param {string} port - The port of the attribute.
 * @returns {JSX.Element} Button representing the attributes.
 */
function getAttributes(thing_string: string, att_key: string, ind: number, port: string): JSX.Element {
    let thing = JSON.parse(thing_string)
    let values: string[] = Object.keys(thing[att_key])
    let endpoints: string[] = Array.from({length: values.length}, function (_, i: number): string {
        if(thing[att_key][values[i]]["form"]) return thing[att_key][values[i]]["form"]["href"]
        return "http://localhost:"+port+"/action/"+ values[i]
        //return ""
    })
    let buttons: JSX.Element[] = Array.from({length: values.length}, function (_, i: number): JSX.Element {
        let bId: string = thing["id"] + "-" + values[i] + "-" + "button"
        return (
            <button id={bId} onClick={() => {
                triggerRequest(endpoints[i]).then((result: string): void => {
                    let button: HTMLElement | null = document.getElementById(bId)
                    if (att_key == "properties" && button) button.innerText = values[i] +": " + result
                })
            }} key={i} className={"button"}>{values[i]}
            </button>)
    })
    return (<div id={thing["id"] + "-" + att_key} key={ind}> {att_key}: {buttons}</div>)
}

/**
 Triggers requests for an attribute of a specified Thing and returns the answer as a string.
 @param {string} thingAddress - The address of the thing.
 @returns {Promise<string>} A promise that resolves to the fetched answer as a string.
 */
async function triggerRequest(thingAddress: string): Promise<string> {
    try {
        const response: Response = await fetch(thingAddress);
        return  await response.text()
    } catch (error) {
        return "Error"
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
        const response: Response = await fetch(url);
        return await response.text()
    } catch (error) {
        console.error('Error fetching thing descriptions:', error);
        return "Error"
    }
}
export default ThingRepresentation