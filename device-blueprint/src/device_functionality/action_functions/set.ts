import {ExecuteActionData} from "../actions";
import {LogType, sendLog} from "../../logging/logging";
import {logging_info} from "../../device";

export function execute_action_set(execute_action_data: ExecuteActionData) {
    let action = execute_action_data.action;
    let property = execute_action_data.property;
    let variables = execute_action_data.variables;
    // check if value or variable is given
    try{
        if (action.value) {
            property.value = action.value;
            sendLog(LogType.PROPERTY_CHANGED, property, logging_info);
        } else if (action.variable && variables[action.variable]) {
            property.value = variables[action.variable] as unknown as number | boolean | string;
            sendLog(LogType.PROPERTY_CHANGED, property, logging_info);
        } else {
            console.log(`No value or correct variable given for action ${action.action_type} on property ${action.property}`);
        }
        return "Success"
    }catch(e){
        console.log(`Error: ${e}`)
        return "Error"
    }
}