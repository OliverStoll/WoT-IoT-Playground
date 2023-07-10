import {ExecuteActionData} from "../actions";
import {LogType, sendLog} from "../../logging/logging";
import {logging_info} from "../../device";

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

    return "Success"
}