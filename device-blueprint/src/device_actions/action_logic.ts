enum ActionType {
    SET = "set",
    INCREMENT = "increment",
    SLEEP = "sleep",
    TRIGGER_EVENT = "emit_event",
    CONDITION = "condition",
}


export function executeMethodActions(properties_dict: any, thing: any, action_list: any[], variables: any) {
    for (const action of action_list) {
        let property = properties_dict[action.property];

        console.log(`Executing action: ${JSON.stringify(action, null, 2)}`);
        const action_type: ActionType = action.action_type;

        /* Here all supported action types are differentiated and given functionality */
        switch (action_type) {
            case 'set':
                // check if value or variable is given
                if (action.value) {
                    property.value = action.value;
                } else if (action.variable && variables[action.variable]) {
                    property.value = variables[action.variable];
                } else {
                    console.log(`No value or correct variable given for action ${action_type} on property ${action.property}`);
                }
                break;

            case 'increment':
                // check if property is number
                if (typeof property.value !== 'number') {
                    console.log(`Property ${action.property} is not a number and cannot be incremented`);
                    break;
                }

                // check if value or variable is given
                if (action.value) {
                    property.value += action.value;
                } else if (action.variable && variables[action.variable]) {
                    if (typeof variables[action.variable] !== 'number') {
                        console.log(`Variable ${action.variable} is not a number and cannot be used for incrementing`);
                        break;
                    }
                    property.value += variables[action.variable];
                } else {
                    console.log(`No value or correct variable given for action ${action_type} on property ${action.property}`);
                }
                break;

            case 'sleep':
                // check if value or variable is given
                setTimeout(() => {
                    console.log(`Done waiting`)
                }, action.value * 1000);
                break;

            case 'emit_event':
                // check if property is given to be used as event payload
                if (action.payload_property) {
                    let payload = {
                        name: action.payload_property,
                        value: properties_dict[action.payload_property].value.toString()
                    }
                    thing.emitEvent(action.event_name, payload)
                } else {
                    thing.emitEvent(action.event_name)
                }
                break;

            case 'condition':
                if (evaluateCondition(action.condition, property)) {
                    executeMethodActions(properties_dict, thing, action.action_list_true, variables);
                } else if (action.action_list_false) {
                    executeMethodActions(properties_dict, thing, action.action_list_false, variables);
                }
                break;

            default:
                console.log(`Unknown action type: ${action_type}`);
        }
    }
}


export function evaluateCondition(condition: any, property: any) {
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