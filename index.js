import express from 'express';
import cors from 'cors'
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import connectDB from './Database/config.js';
import bodyParser from 'body-parser';
import exerciseRoutes from './src/Routes/exerciseRoutes.js'
import goalRoutes from './src/Routes/goalRoutes.js'
import authRoutes from './src/Routes/authRoutes.js'
import adminRoutes from './src/Routes/adminRoutes.js'
import foodRoutes from './src/Routes/FoodRoutes.js'

dotenv.config()
const app = express();
connectDB()
const port=process.env.PORT
 app.use(cors())

app.use(cookieParser()); 
app.use(bodyParser.json());
 app.use('/api/food',foodRoutes)
app.use('/api/auth',authRoutes)
app.use('/api/admin',adminRoutes)
app.use('/api/exercises', exerciseRoutes)
app.use('/api/goals',goalRoutes)
app.get('/',(req,res)=>{
    res.send(`<h1>Welcome to Health and Wellness</h1>`)
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})




