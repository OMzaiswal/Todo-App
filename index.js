const express = require('express');
// const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { error } = require('console');

const app = express();
  
app.use(cors());

app.use(bodyParser.json());

app.get('/todos',(req, res) => {
    fs.readFile('txt.json','utf-8',(err, data) => {
        if (err) throw error;
        res.json(JSON.parse(data));
    })
})

app.get('/todos/:id', (req, res) => {
    fs.readFile('txt.json', 'utf-8', (err, data) => {
        if (err) {
            res.send("todo not found");
        } else {
            const Todos = JSON.parse(data);
            const todo = Todos.find(t => t.id === parseInt(req.params.id));

            if (todo) {
                res.json(todo);
            } else {
                res.status(404).send("Todo not found");
            }
        }
    })
    
})

app.post('/todos', (req, res) => {
    const newTodo = {
        id: Math.floor(Math.random()*100000),
        title: req.body.title,
        desc: req.body.desc
    };
    fs.readFile('txt.json', 'utf-8', (err, data) => {
        if(err) throw error;
        const Todos = JSON.parse(data);
        Todos.push(newTodo);
        fs.writeFile('txt.json',JSON.stringify(Todos), (err) => {
            if (err) throw error;
            res.status(201).json(newTodo);
        })
    })
});

app.put('/todos/:id', (req, res) => {
    fs.readFile('txt.json', 'utf-8', (err, data) => {
        if(err) throw error;
        const Todos = JSON.parse(data);
        const todoIndex = Todos.findIndex(t => t.id === parseInt(req.params.id));
        if (todoIndex === -1) {
            res.status(404).send("Record with such id is not found");
        } else {
            Todos[todoIndex].title = req.body.title;
            Todos[todoIndex].desc = req.body.desc;
        }
        fs.writeFile('txt.json', JSON.stringify(Todos), (err) => {
            if (err) throw error;
            res.json(Todos[todoIndex]);
        })
    })
   
})

app.delete('/todos/:id', (req, res) => {
    fs.readFile('txt.json', 'utf-8', (err, data) => {
        if(err) throw error;
        const Todos = JSON.parse(data);
        const todoIndex = Todos.findIndex(t => t.id === parseInt(req.params.id));
        if (todoIndex === -1) {
            res.status(404).send("The todo you want to delete, doesn't even exist");
        } else {
            Todos.splice(todoIndex, 1);
        }
        fs.writeFile('txt.json', JSON.stringify(Todos), (err) => {
            if (err) throw error;
            res.status(200).send("Todo deleted successfully!")
        })
    })
})

// for all other routes, return 404
app.use((req, res, next) => {
    res.status(404).send("Route does not exist!");
})

app.listen(3000, () => {
    console.log("App is listening at port 3000");
})
