// Services for users

import User from "./model";

//Create
export async function createUser(user) {
    user.password = hashString(user.password)
    console.log("[user] - Creation");
    return User.create({ ...user })
};

//Read
export async function getByPage(page, per_page) {
    const start = (page - 1) * per_page;
    let result = await User.find({})
        .skip(start)
        .limit(per_page)

    return result;
};

//Connection
export async function signIn(body){
    let result = await User.findOne({"pseudo": body.pseudo})
    body.password = hashString(body.password)
    if(body.password == result.password){
        console.log("User "+body.pseudo+" connected.")
        return body;
    }
    else{
        throw Error("Wrong user or password");
    }
}

//Hash a string
function hashString(password) {
    let hash = 0, i, chr;
    if (password.length === 0) 
        return hash;
    for (i = 0; i < password.length; i++) {
      chr   = password.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
};