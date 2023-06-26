import {
    PropertiesDict,
    _Property,
    ActionStep,
    VariablesDict,
} from "../device";
import {execute_action_set, execute_action_increment, execute_action_sleep, execute_action_emit_event, execute_action_condition} from "./action_functions";
import {ExposedThing} from "@node-wot/core";

export interface ExecuteActionData {
    action: ActionStep;
    property?: _Property;
    properties_dict?: PropertiesDict;
    variables?: VariablesDict;
    thing?: ExposedThing;
}

// dictionary of all execute action functions with action type as key
const execute_action_functions: {[key: string]: (execute_action_data: ExecuteActionData) => void} = {
    'set': execute_action_set,
    'increment': execute_action_increment,
    'sleep': execute_action_sleep,
    'emit_event': execute_action_emit_event,
    'condition': execute_action_condition
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


