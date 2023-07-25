import {ExecuteActionData, executeEntireAction} from "../device_functionality/actions";
import {_Property, Condition} from "../device";

export function execute_action_condition(execute_action_data: ExecuteActionData) {
    let action = execute_action_data.action;
    let property = execute_action_data.property;
    let properties_dict = execute_action_data.properties_dict;
    let variables = execute_action_data.variables;
    let thing = execute_action_data.thing;

    if (evaluateCondition(action.condition, property)) {
        executeEntireAction(properties_dict, thing, action.condition.action_list_true, variables);
        return "True"
    } else if (action.condition.action_list_false) {
        executeEntireAction(properties_dict, thing, action.condition.action_list_false, variables);
        return "False"
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
