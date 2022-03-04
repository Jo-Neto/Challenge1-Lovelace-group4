/*
module.exports = {
    secret: "wouldn'tyouliketoknow", 
    cookie: {
        maxAge: new Date(Date.now() + 3600), // 1 hour
        httpOnly: true, 
        secure: true, // Requires https connection
    }, 
    // Stores sessions in Mongo DB
    store: new MongoStore({
        host: mongo, 
        port: 27017, 
        db: 'iod', 
        collection: 'sessions'
    }),
    // Gets rid of the annoying deprecated messages
    resave: false, 
    saveUninitialized: false
};
*/