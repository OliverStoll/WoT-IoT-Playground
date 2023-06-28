import {
    PropertiesDict,
    _Property,
    ActionStep,
    VariablesDict,
} from "../device";
import {execute_action_functions} from "./action_functions";
import {ExposedThing} from "@node-wot/core";

export interface ExecuteActionData {
    action: ActionStep;
    property?: _Property;
    properties_dict?: PropertiesDict;
    variables?: VariablesDict;
    thing?: ExposedThing;
}


export function executeMethodActions(properties_dict: PropertiesDict, thing: ExposedThing, action_list: ActionStep[], variables: VariablesDict) {
    for (const action of action_list) {
        let property: _Property = properties_dict[action.property];

        console.log(`Executing action: ${JSON.stringify(action, null, 2)}`);

        let execute_action_data: ExecuteActionData = {
            action: action,
            property: property,
            properties_dict: properties_dict,
            variables: variables,
            thing: thing
        }

        /* Here all supported action types are differentiated and given functionality */
        let execute_action_function = execute_action_functions[action.action_type];
        // TODO: log
        if (execute_action_function) {
            execute_action_function(execute_action_data);
        }
        else {
            console.log(`Action type ${action.action_type} is not supported`);
        }
    }
}


