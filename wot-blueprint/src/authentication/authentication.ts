export function checkAuthentication(req: any, credentials: any, security: any) {
    // check if "basic_sc" is contained in security list
    if (security.includes('basic_sc')) {
        return checkAuthenticationBasic(req, credentials);
    } else {
        console.log(`Unknown security configuration`);
        return false;
    }
}

function checkAuthenticationBasic(req: any, credentials: any) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return false;
    }
    const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    // console.log("username: " + username + " password: " + password);

    return username === credentials.username && password === credentials.password;
}