
// for each property in config_backup.json, initialize the property values
import {_Property, PropertiesDict} from "../device";

export function initializePropertyValues(properties_dict: PropertiesDict): PropertiesDict {

    for (let property_name in properties_dict) {
        let property: _Property = properties_dict[property_name];

        // check if property exists
        if (!property) {
            throw new Error(`Property ${property_name} does not exist`);
        }
        // check if property has type
        if (!property.hasOwnProperty("type")) {
            throw new Error(`Property ${property_name} does not have a type`);
        }

        // add name to property
        property['name'] = property_name;

        switch (property.type) {
            case "number":
                // define the type of property.value as number
                property.value = 0.0 as number;
                break;
            case "boolean":
                property.value = false as boolean;
                break;
            case "string":
                property.value = "" as string;
                break;
            default:
                throw new Error(`Unknown type ${property.type}`);
        }

        if (property.hasOwnProperty("startValue")) {
            property.value = property.startValue as _Property["value"];
        }
    }
    console.log(properties_dict);
    return properties_dict;
}