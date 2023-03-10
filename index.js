import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import multer from "multer"
import helmet from "helmet"
import morgan from "morgan"
import path from "path"
import { fileURLToPath } from "url"
import { register } from "./controllers/auth.js";
import authRoutes from "./routes/authRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import postsRoutes from "./routes/postsRoutes.js"
import conversationRoutes from "./routes/conversationRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"
import { verifyToken } from "./middleware/authMiddleware.js"
import { createPost } from "./controllers/posts.js"

/*Configs*/

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config();
const app = express();
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}))
app.use(morgan("common"))
app.use(bodyParser.json({limit: "30mb", extended: true}))
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}))
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, 'public/assets'))) //Set directory of assets

/*Configure File Storage*/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets")
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
})

const upload = multer({storage})

/*Routes using Middleware*/
app.post("/auth/register", upload.single("picture"), register) //Api route to register, upload picture middleware and then call controller Stays here because we need the middleware
app.post("/posts", verifyToken, upload.single("picture"), createPost)
/*Import Routes*/
app.use("/auth", authRoutes)
app.use("/users", userRoutes)
app.use("/posts", postsRoutes)
app.use("/conversation", conversationRoutes)
app.use("/message", messageRoutes)
/*Configure Mongoose*/

const PORT = process.env.PORT || 5000;

mongoose
    .set('strictQuery', false)
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        app.listen(PORT, () => console.log(`Server Port: ${PORT}`))
    })
    .catch((err) => console.log(`${err} did not connect`))
