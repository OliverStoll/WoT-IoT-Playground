import {useEffect, useState} from "react";
import './component_css/ThingRepresentationStyle.css'

const url: string = 'http://localhost:5000/api/logs/thingDescriptions'


/**
 Renders a component that fetches and displays a list of thing representations.
 The component periodically fetches thing descriptions and updates the list if there are changes.
 @returns {JSX.Element} The rendered component displaying the thing representations.
 */
const ThingRepresentation = () => {
    const [things, setThings] = useState<JSX.Element[]>([])
    let oldConf: string
    useEffect(() => {
        const interval: number = setInterval(function () {
            fetchThingDescriptions().then(function (res: string) {
                // if an error occurred, the list is empty or nothing has changed -> return
                if (res === "Error" || res === "[]" || res === oldConf) return
                oldConf = res
                console.log(res)
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
        let attToShow: string[] = ["id", "title", "actions", "properties"]
        let att_keys: string[] = Object.keys(thing)
            .filter(function (key: string){ return attToShow.includes(key)})
        //create a div for the important attributes of every thing description
        let attributes: JSX.Element[] = Array.from({length: att_keys.length}, function (_, ind: number): JSX.Element {
            // show id and title
            if (att_keys[ind] === "id" || att_keys[ind] === "title" ){
                return (
                    <div key={thing["id"] + "-" + att_keys[ind]} className={"thing-attributes"}>
                        {att_keys[ind]}: {thing[att_keys[ind]]}
                    </div>
                )
            }
            // show other attributes with nice JSON format
            let value: string= JSON.stringify(thing[att_keys[ind]],null, " ")
                .replaceAll(/["{}\[\]]/g, "")
                .replaceAll(/^\s*$(?:\r\n?|\n)/gm, "")
            return (
                <div key={thing["id"] + "-" + att_keys[ind]} className={"thing-attributes"}>
                    {att_keys[ind]}: <pre>{value}</pre>
                </div>
            )
        })
        // create div for every thing description with a symbol and all attributes
        return (
            <div key={thing["id"]} className={"thing"}>
                <img src="../../resources/wot_icon.png" alt="Thing icon" height={"100"}/>
                <div>{attributes}</div>
            </div>
        )
    })
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