import {ExecuteActionData} from "../actions";

export async function execute_action_sleep(execute_action_data: ExecuteActionData) {
    // TODO: fix sleep being async
    let action = execute_action_data.action;
    // check if value or variable is given
    await wait(action.value as number);
}

function wait(s) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(s * 1000);
            console.log("Done waiting");
        }, s)
    })
}