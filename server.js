//#region declarations
require('dotenv').config({path:"./config.env"});
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors=require('cors')
const mongoose = require('mongoose');
const adminRouter=require('./routes/adminRouter')
//#endregion


const app = new express;

//#region middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors)
app.use('/public',express.static('public'))
//#endregion

//#region Routing
app.use("/api/auth", require("./routes/auth"));
app.use('/api/admin',adminRouter)
//#endregion


//#region connection to database
const connectDB = () => {
     mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true,
        useUnifiedTopology:true
    });

    console.log("MongoDB connected");
}

connectDB();
//#endregion

//after frontend production build is built, uncomment the 4 lines below
// app.use(express.static(path.resolve(__dirname, "./client/build")));
// app.get("*", function (request, response) {
//     response.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
//   });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err, promise) => {
    console.log(`Logged Error: ${err}`);
    server.close(() => process.exit(1));
}) 