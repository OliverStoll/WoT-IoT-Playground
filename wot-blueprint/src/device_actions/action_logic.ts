enum ActionType {
    SET = "set",
    INCREMENT = "increment",
    WAIT = "wait",
    TRIGGER_EVENT = "trigger_event",
    CONDITION = "condition",
}


export function executeMethodActions(device: any, actions: any[]) {
    for (const action of actions) {
        let property = device.properties[action.property];

        console.log(`Executing action: ${action}`);
        const action_type: ActionType = action.action;

        /* Here all supported action types are differentiated and given functionality */
        switch (action_type) {
            case 'set':
                property.value = action.value;
                break;

            case 'increment':
                property.value += action.value;
                break;

            case 'wait':
                setTimeout(() => {
                    console.log(`Done waiting`);
                }, action.duration * 1000);
                break;

            case 'trigger_event':
                // TODO: send event
                break;

            case 'condition':
                if (evaluateCondition(action.condition, property)) {
                    device.executeMethodActions(action.actions_true);
                } else {
                    device.executeMethodActions(action.actions_false);
                }
                break;

            default:
                console.log(`Unknown action type: ${action_type}`);
        }
    }
}