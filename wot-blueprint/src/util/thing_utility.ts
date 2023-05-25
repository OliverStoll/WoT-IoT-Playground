export function extractThingDescription(device_config: any, ip_port: string) {
    // TODO: implement fully

    // create a copy of the device config
    let thing_description = JSON.parse(JSON.stringify(device_config));

    // delete credentials from thing description
    delete thing_description.credentials;

    // delete values from thing description
    for (let property_name in thing_description.properties) {
        let property = thing_description.properties[property_name];
        delete property.value;
        delete property.start_value;

        property.observable = false;
        property.form = {
            "href": `http://${ip_port}/property/${property_name}`,
            "contentType": "application/json",
            "htv:methodName": "GET",
            "op": "readproperty"
        }
    }

    // delete actions from thing description
    for (let method_name in thing_description.methods) {
        let method = thing_description.methods[method_name];
        delete method.actions;

        // TODO: check if function is safe or idempotent
        // add a form info to the method
        method.form = {
            "href": `http://${ip_port}/method/${method_name}`,
            "contentType": "application/json",
            "htv:methodName": "GET",                   // TODO: replace with correct POST after testing
            "op": "invokeaction"
        }
    }

    for (let event_name in thing_description.events) {
        let event = thing_description.events[event_name];
        event.form = {
            "href": `http://${ip_port}/event/${event_name}`,
            "contentType": "application/json",
            "subprotocol": "longpoll",
            "op": "subscribeevent"
        }
    }

    return thing_description;
}


export function evaluateCondition(condition: any, property: any) {
    const operator = condition.operator;
    const value = condition.value;
    // console.log(`comparing ${property_cond.value} vs ${value}`);
    switch (operator) {
        case '==':
            if (property.value == value) {
                return true
            }
            break;
        case '!=':
            if (property.value != value) {
                return true
            }
            break;
        case '<':
            if (property.value < value) {
                return true
            }
            break;
        case '>':
            if (property.value > value) {
                return true
            }
            break;
        default:
            console.log(`Unknown condition operator: ${operator}`);
    }
    return false;
}
