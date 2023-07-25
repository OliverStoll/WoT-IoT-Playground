import {_Property, ActionStep, PropertiesDict, VariablesDict,} from "../device";

import {ExposedThing} from "@node-wot/core";
import {execute_action_set} from "../action_functions/set";
import {execute_action_increment} from "../action_functions/increment";
import {execute_action_sleep} from "../action_functions/sleep";
import {execute_action_emit_event} from "../action_functions/emit_event";
import {execute_action_condition} from "../action_functions/condition";
import {execute_action_shutdown} from "../action_functions/shutdown";
import {execute_action_make_request} from "../action_functions/make_request";

export interface ExecuteActionData {
    action: ActionStep;
    property?: _Property;
    properties_dict?: PropertiesDict;
    variables?: VariablesDict;
    thing?: ExposedThing;
}

// dictionary of all execute action functions with action type as key
const execute_action_functions: {[key: string]: (execute_action_data: ExecuteActionData) => any} = {
    'set': execute_action_set,
    'increment': execute_action_increment,
    'sleep': execute_action_sleep,
    'emit_event': execute_action_emit_event,
    'condition': execute_action_condition,
    'shutdown': execute_action_shutdown,
    'make_request': execute_action_make_request
}


export async function executeEntireAction(properties_dict: PropertiesDict, thing: ExposedThing, action_list: ActionStep[], variables: VariablesDict) {
    let return_values = [];
    for (const action of action_list) {
        let property: _Property = properties_dict[action.property];

        console.log(`\tACTION STEP: ${JSON.stringify(action)}`);

        let execute_action_data: ExecuteActionData = {
            action: action,
            property: property,
            properties_dict: properties_dict,
            variables: variables,
            thing: thing
        }

        /* Here all supported action types are differentiated and given functionality */
        let execute_action_function = execute_action_functions[action.action_type];
        if (execute_action_function) {
            let return_value = await execute_action_function(execute_action_data);
            return_values.push(return_value);
            // console.log(`Action ${action.action_type} returned: ${return_value}`);
        }
        else {
            return_values.push("Action type not supported");
            console.log(`Action type ${action.action_type} is not supported`);
        }
    }
    return return_values;
}


