import {useEffect, useState} from "react";

const url: string = 'http://localhost:5000/api/logs/thingDescriptions'

const ThingRepresentation = () => {
    const [things, setThings] = useState<JSX.Element[]>([])
    let confString: string
    useEffect(() => {
        const interval = setInterval(function () {
            fetchThingDescriptions().then(function (res: string) {
                if (res === "Error" || res === "No config file found" || res === confString) return
                confString = res
                let conf: object = JSON.parse(res)
                setThings(getThings(conf))
            })
        }, 5000);
        return () => {
            clearInterval(interval);
        };
    },[]);
    return <div>{things}</div>
}

function getThings(conf) {
    let thing_keys: string[] = Object.keys(conf)
    let things: JSX.Element[] = []
    try {
        things = Array.from({length: thing_keys.length}, function (_, index: number) {
            let att_keys: string[] = Object.keys(conf[thing_keys[index]])
            let attributes: JSX.Element[] = Array.from({length: att_keys.length}, (_, ind: number) => (
                <div key={conf[thing_keys[index]]["id"] + "-" + att_keys[ind]}>
                    {att_keys[ind]}: {conf[thing_keys[index]][att_keys[ind]]}
                </div>
            ))
            return (
                <div key={conf[thing_keys[index]]["id"]}>
                    <img src="../../resources/wot_icon.png" alt="Thing icon" height={"100"}/>
                    <div>{attributes}</div>
                </div>
            )
        })
    }catch (error) {things = [<div>Wrong Format</div>]}
    return things
}

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