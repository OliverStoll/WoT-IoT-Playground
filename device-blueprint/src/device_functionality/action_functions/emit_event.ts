import {ExecuteActionData} from "../actions";
import {LogType, sendLog} from "../../logging/logging";
import {logging_info} from "../../device";

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
    sendLog(LogType.EVENT_EMITTED, action.event_name, logging_info);  // other payload?

    // try to emit event
    try {
        thing.emitEvent(action.event_name, payload)
        return "Success"
    }
    catch (e) {
        console.log(`Event ${action.event_name} could not be emitted`);
        return "Error"
    }
}