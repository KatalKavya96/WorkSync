const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require("./auth/routes");
const userRoutes = require("./user/routes");
const {authenticate} = require("./auth/middleware");
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim()),
  credentials: true
}))
app.use(morgan('dev'));

app.use("/auth", authRoutes);
app.use(authenticate);
app.use("/", userRoutes);

app.listen(PORT, () => {
  console.log(`Server now running at port ${PORT}`);
})