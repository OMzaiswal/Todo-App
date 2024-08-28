const express = require('express');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { User, Todo } = require('./db');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { error } = require('console');
const { authenticateJwt } = require('./middleware/auth');
const { z } = require('zod');


const app = express();

mongoose.connect( process.env.DB_URL, { dbName: process.env.DB_NAME })

app.use(cors());
app.use(bodyParser.json());

let signupProps = z.object({
    username: z.string().min(4),
    password: z.string().min(4)
})

app.post('/signup', async (req,res) => {
    const parsedDetails = signupProps.safeParse(req.headers)
    if (!parsedDetails.success){
        return res.json({message: parsedDetails.error})
    }
    const { username, password } = parsedDetails.data;
    const user = await User.findOne({username});
    if (user) {
        res.json({message: "User already exist!"})
    } else {
        const newUser = new User({ username, password});
        await newUser.save();
        const token = jwt.sign({id: newUser._id}, process.env.SECRET_KEY, {expiresIn:'2h'})
        res.json({message: "User created successfully", token})
    }
})

app.post('/login', async (req, res) => {
    const parsedDetails = signupProps.safeParse(req.headers)
    if (!parsedDetails.success){
        return res.json({message: parsedDetails.error})
    }
    const { username, password } = parsedDetails.data;
    const user = await User.findOne({ username, password });
    if (user) {
        const token = jwt.sign({id: user._id}, process.env.SECRET_KEY , {expiresIn:'2h'})
        res.json({message: "Logged in successfully", token})
    } else {
        res.json({message: "Invalid username or password"});
    }
})

app.get('/me', authenticateJwt, async (req, res) => {
    const user = await User.findById(req.userId);
    if (user) {
        res.json({ username: user.username});
    } else {
        res.json({ message: "User not logged in"});
    }

})

app.get('/todos', authenticateJwt, async (req, res) => {
    const todos = await Todo.find({ userId: req.userId })
    if (todos) {
        res.json(todos)
    } else {
        res.json({error: 'Failed to retrieve todos'})
    }
})

app.get('/todos/:id', authenticateJwt, async (req, res) => {
    const todoId = req.params.id;
    const userId = req.userId;
    const todo = await Todo.findOne({ _id: todoId, userId });
    if (todo) {
        res.json(todo)
    } else {
        res.status(404);
    }
})

app.post('/todos', authenticateJwt, async (req, res) => {
    const newTodo = {
        title: req.body.title,
        description: req.body.description,
        userId: req.userId,
    };
    const todo = new Todo(newTodo);
    await todo.save();
    res.json({message: "New todo added successfully", todo:todo});
});

// app.put('/todos/:id', authenticateJwt, async (req, res) => {
//    const todoId = req.params.id;
//    const userId = req.userId;
//    const todo = Todo.findByIdAndUpdate({ _id: todoId, userId }, {}, {new: true})
// })

app.delete('/todos/:id', authenticateJwt, async (req, res) => {
    const todoId = req.params.id;
    const userId = req.userId;
    const deletedTodo = await Todo.findOneAndDelete({ _id: todoId, userId })
    if (deletedTodo) {
        res.json(deletedTodo);
    } else {
        res.status(405);
    }
})

// for all other routes, return 404
app.use((req, res, next) => {
    res.status(404).send("Route does not exist!");
})

app.listen(3000, () => {
    console.log("App is listening at port 3000");
})
