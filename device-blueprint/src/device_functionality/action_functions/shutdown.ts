import {ExecuteActionData} from "../actions";
import {LogType, sendLog} from "../../logging/logging";
import {logging_info} from "../../device";

export function execute_action_shutdown(execute_action_data: ExecuteActionData) {
    let thing = execute_action_data.thing;
    sendLog(LogType.DELETED, thing.getThingDescription(), logging_info);  //
    thing.destroy().then(() => {
        console.log("\n\n\nTHING DESTROYED: EXITING..");
        process.exit(0);
    });
}