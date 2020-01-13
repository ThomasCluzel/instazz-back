// Services for users

import User from "./model";

//Create
export async function createUser(user) {
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
