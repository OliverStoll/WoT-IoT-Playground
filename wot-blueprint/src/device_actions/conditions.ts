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