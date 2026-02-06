import express from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/config"
import { middleware, AuthRequest } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/common/types"
import { prismaClient } from "@repo/db/client";
import * as bcrypt from 'bcrypt';
const saltRounds = 10;

const app = express();
app.use(express.json())

app.post("/signup", async (req, res) => {

  const parseData = CreateUserSchema.safeParse(req.body)
  if (!parseData.success) {
    return res.status(400).json({
      message: "Invalid parseData"
    })
  }
  //db call

  try {
    const hashedPassword = await bcrypt.hash(parseData.data.password, saltRounds)
    const user = await prismaClient.user.create({
      data: {
        email: parseData.data?.username,
        password: hashedPassword,
        name: parseData.data.name,
      }
    })
    res.json({
      userId: user.id
    })
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "User creation failed"
    })
  }

})

app.post("/signin", async (req, res) => {
  const parseData = SigninSchema.safeParse(req.body)
  if (!parseData.success) {
    return res.status(400).json({
      message: "Invalid parseData"
    })
  }
  try {


    const user = await prismaClient.user.findUnique({
      where: {
        email: parseData.data.username
      }
    })

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      })
    }

    const isPassword = await bcrypt.compare(parseData.data.password, user.password)
    if (!isPassword) {
      return res.status(401).json({
        message: "invalid credentails"
      })
    }

    const token = jwt.sign({
      userId: user.id
    }, JWT_SECRET)
    res.json({
      token
    })
  } catch (error) {
    console.error("Error signing in:", error);
    res.status(500).json({
      message: "Sign in failed"
    })
  }

})
app.post("/room", middleware, async (req: AuthRequest, res) => {
  const parseData = CreateRoomSchema.safeParse(req.body)
  if (!parseData.success) {
    return res.status(400).json({
      message: "Invalid parseData",
      errors: parseData.error.issues
    })
  }

  const userId = req.userId;

  if (!userId) {
    return res.status(403).json({
      message: "User ID not found in token"
    })
  }

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parseData.data.name,
        adminId: userId
      }
    })

    res.json({
      roomId: room.id,
      slug: room.slug
    })
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({
      message: "Room creation failed"
    })
  }
})

app.get("/chats/:roomId",async (req,res)=>{
  const roomId=Number(req.params.roomId)
  try {
    const messages=await prismaClient.chat.findMany({
    where:{
      roomId:roomId
    },
    orderBy:{
      id:"desc"
    },
    take:50
    
  })
  res.json({
    messages
  })
  } catch (error) {
    console.log(`Error while fetching chat of room ${roomId}`,error)
    res.status(401).json({
      message:"Can't load chats"
    })
  }
  
})
app.listen(3001, () => {
  console.log("HTTP Backend is running on port 3001");
})