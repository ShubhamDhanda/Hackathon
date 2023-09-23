const express = require('express')
const connectToMongo = require('./db')
const PORT = 8080

connectToMongo();
// const helmet = require('helmet')
// const morgan = require('morgan')
const cors = require('cors')

const app = express();
app.use(express.json());

// app.use(helmet());
// app.use(
//   morgan(":method :url :status :res[content-length] - :response-time ms")
// );

app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );


//available routes
app.use('/api/auth',require('./routes/auth'));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// app.use("/api", require("./routes/projectRoutes"));
// app.use("/api", require("./routes/userRoutes"));


app.listen(PORT, () => {
    console.log(`App is listening on PORT : ${PORT}`);
});