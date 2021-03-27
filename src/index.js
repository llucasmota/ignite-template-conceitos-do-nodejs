const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const userExist = users.find((user) => user.username === username);
  if (userExist) {
    request.user = userExist;
    return next();
  } else {
    return response.status(404).send();
  }
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  if (users.find((user) => user.username === username))
    return response.status(400).json({ error: "user already exists" });
  const id = uuidv4();
  let user = {
    name,
    username,
    id,
    todos: [],
  };
  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const findTodos = users.find((item) => item.username === user.username);
  return response.status(200).json(findTodos.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const findTodos = users.findIndex((item) => item.username === user.username);

  let createTodo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(createTodo);

  return response.status(201).json(createTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const targetTodo = user.todos.find((todo) => todo.id === id);

  if (!targetTodo) {
    return response.status(404).json({ error: "Todo inexistente" });
  }

  targetTodo.title = title;
  targetTodo.deadline = new Date(deadline);

  return response.status(200).json(targetTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const targetTodo = user.todos.find((todo) => todo.id === id);

  if (!targetTodo) {
    return response.status(404).json({ error: "Todo inexistente" });
  }
  targetTodo.done = true;

  return response.status(200).json(targetTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const targetTodo = user.todos.find((todo) => todo.id === id);

  if (!targetTodo) {
    return response.status(404).json({ error: "Todo inexistente" });
  }

  user.todos.splice(targetTodo.id, 1);

  return response.status(204).send();
});

module.exports = app;
