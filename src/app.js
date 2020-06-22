const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4"); // Cria Lib para criação de uuid e validação de uuid

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

// Middleware para validação de uuid
function validadeRepId(request, response, next) {
    const { id } = request.params;
    if (!isUuid(id)) {
        return response.status(400).json({ error: "Invalid repository ID." });
    }
    return next();
}

// Get simples, sem filtros por não constarem nos requisitos do projeto
// Apenas lista todos reps
app.get("/repositories", (request, response) => {
    return response.json(repositories);
});

// Criação de novos reps
app.post("/repositories", (request, response) => {
    const { title, url, techs } = request.body;
    const rep = { id: uuid(), title, url, techs, likes:0 };
    repositories.push(rep);
    return response.json(rep);
});

// Update de um rep sem deixar alterar likes
app.put("/repositories/:id", validadeRepId, (request, response) => {
    const { id } = request.params;
    const { title, url, techs } = request.body;
    // A validação se o rep existe poderia ser um middleware para reaproveitar o código
    const repIndex = repositories.findIndex((rep) => rep.id == id);
    if (repIndex < 0) {
        return response.status(400).json({ error: "Repository not found." });
    }
    const rep = { id, title, url, techs, "likes":repositories[repIndex].likes };
    repositories[repIndex] = rep;

    return response.json(rep);
});

// Delete
app.delete("/repositories/:id", validadeRepId, (request, response) => {
    const { id } = request.params;
    // Olha a repetição do código
    const repIndex = repositories.findIndex((rep) => rep.id == id);
    if (repIndex < 0) {
        return response.status(400).json({ error: "Repository not found." });
    }
    repositories.splice(repIndex, 1);
    return response.status(204).send();
});


// Incremento de likes de um rep
app.post("/repositories/:id/like", validadeRepId, (request, response) => {
    const { id } = request.params;
    // Mais uma vez
    const repIndex = repositories.findIndex((rep) => rep.id == id);
    if (repIndex < 0) {
      return response.status(400).json({ error: "Repository not found." });
    }
    const rep = {
      id: repositories[repIndex].id,
      title: repositories[repIndex].title,
      url: repositories[repIndex].url,
      techs: repositories[repIndex].techs,
      likes: repositories[repIndex].likes+1,
    };
    repositories[repIndex] = rep;

    return response.json(rep);
});

module.exports = app;
