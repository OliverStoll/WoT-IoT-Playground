import {executeMethodActions, ExecuteActionData} from "./action_logic";
import {_Property, Condition, logging_info} from "../device";
import {LogType, sendLog} from "../logging/requests";


// dictionary of all execute action functions with action type as key
export const execute_action_functions: {[key: string]: (execute_action_data: ExecuteActionData) => void} = {
    'set': execute_action_set,
    'increment': execute_action_increment,
    'sleep': execute_action_sleep,
    'emit_event': execute_action_emit_event,
    'condition': execute_action_condition
}


export function execute_action_set(execute_action_data: ExecuteActionData) {
    let action = execute_action_data.action;
    let property = execute_action_data.property;
    let variables = execute_action_data.variables;
    // check if value or variable is given
    if (action.value) {
        property.value = action.value;
        sendLog(LogType.PROPERTY_CHANGED, property, logging_info);
    } else if (action.variable && variables[action.variable]) {
        property.value = variables[action.variable] as unknown as number | boolean | string;
        sendLog(LogType.PROPERTY_CHANGED, property, logging_info);
    } else {
        console.log(`No value or correct variable given for action ${action.action_type} on property ${action.property}`);
    }
}

export function execute_action_increment(execute_action_data: ExecuteActionData) {
    let action = execute_action_data.action;
    let property = execute_action_data.property;
    let variables = execute_action_data.variables;
    // check if property is number
    if (typeof property.value !== 'number') {
        console.log(`Property ${action.property} is not a number and cannot be incremented`);
        return;
    }

    // check if value or variable is given
    if (action.value) {
        property.value += action.value as number;
        sendLog(LogType.PROPERTY_CHANGED, property, logging_info);
    } else if (action.variable && variables[action.variable]) {
        if (typeof variables[action.variable] !== 'number') {
            console.log(`Variable ${action.variable} is not a number and cannot be used for incrementing`);
            return;
        }
        property.value += variables[action.variable] as unknown as number;
        sendLog(LogType.PROPERTY_CHANGED, property, logging_info);
    } else {
        console.log(`No value or correct variable given for action ${action.action_type} on property ${action.property}`);
    }
}

export function execute_action_sleep(execute_action_data: ExecuteActionData) {
    // TODO: fix sleep being async
    let action = execute_action_data.action;
    // check if value or variable is given
    setTimeout(() => {
        console.log(`Done waiting`)
    }, action.value as number * 1000);
}

export function execute_action_emit_event(execute_action_data: ExecuteActionData) {
    let action = execute_action_data.action;
    let properties_dict = execute_action_data.properties_dict;
    let thing = execute_action_data.thing;

    // check if property is given to be used as event payload
    let payload = {};
    if (action.payload_property) {
        payload = {
            name: action.payload_property,
            value: properties_dict[action.payload_property].value.toString()
        }
    }
    sendLog(LogType.EVENT_EMITTED, action.event_name, logging_info);  // TODO: other payload?
    thing.emitEvent(action.event_name, payload)
}

export function execute_action_condition(execute_action_data: ExecuteActionData) {
    let action = execute_action_data.action;
    let property = execute_action_data.property;
    let properties_dict = execute_action_data.properties_dict;
    let variables = execute_action_data.variables;
    let thing = execute_action_data.thing;

    if (evaluateCondition(action.condition, property)) {
        executeMethodActions(properties_dict, thing, action.condition.action_list_true, variables);
    } else if (action.condition.action_list_false) {
        executeMethodActions(properties_dict, thing, action.condition.action_list_false, variables);
    }
}

export function evaluateCondition(condition: Condition, property: _Property) {
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