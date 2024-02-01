/**
 * @file api/controllers/projects.controller.js
 * @description Controlador de rutas para las llamadas a la API relacionadas con la gestión de tareas y proyectos
 * @author Sistemas y Redes <departamentoweb@syr.es>
 */

// Importar modelos necesarios para el controlador
const projectsModel = require('../models/projects.model.js');

// Importamos los módulos necesarios para el funcionamiento del controlador

const { Router } = require('express')
const auth = require("../auth.js");

const router = Router()
const bodyParser = require('body-parser')
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
// const moment = require('moment');

// moment().format()


/**
 * @url /api/projects/
 * @method  GET
 * @description Llamada para obtener todos los proyectos de un usuario
 * @return {JSON}
 */
router.get("/", [auth.validateAccess], async (req, res) => {
    
    projectsModel.fmtoken = req.user.fmtoken;
    
    const id = "*";
    const search = "";
    const projects = await projectsModel.getProjects(id, search);

    if (!projects) {
        res.writeHead(500)
        res.end()
        return
    }

    if (projects.length < 0) {
        res.writeHead(500)
        res.end()
        return
    }
    res.end(JSON.stringify(projects))

    // res.status(200);
    // res.send( { code: 200, projects } );
})

/**
 * @url /api/projects/tasks/
 * @method  GET
 * @description Llamada para obtener el listado de tareas
 * @return {JSON}
 */
router.get("/tasks/", [auth.validateAccess], async (req, res) => {
    if (req.user.group == "") {
        res.status(403);
        res.send( { code: 403, message: "No tienes acceso a la sección de tareas" } );
        return;
    }

    projectsModel.fmtoken = req.user.fmtoken;
    
    const id = req.user.username;
    const search = req.query.search || "";
    const tasks = await projectsModel.getTasks(id, search);

    if (!tasks) {
        res.status(500);
        res.send( { code: 500, message: "Error obteniendo listado de tareas" } );
        return;
    }

    if (tasks.length < 0) {
        res.status(404);
        res.send( { code: 404, message: "No se ha encontrado ningún registro" } );
        return;
    }

    res.status(200);
    res.send( { code: 200, tasks } );
})

/**
 * @url /api/projects/user
 * @method  GET
 * @description Llamada para obtener listado de tareas según el usuario
 * @return {JSON}
 */
router.get("/user", [auth.validateAccess], async (req, res) => {
    if (req.user.group == "") {
        res.status(403);
        res.send( { code: 403, message: "No tienes acceso a la sección de tareas" } );
        return;
    }

    projectsModel.fmtoken = req.user.fmtoken;
    
    const id = req.user.username;

    const tasks = await projectsModel.getTasksFromUser(id);

    if (!tasks) {
        res.status(500);
        res.send( { code: 500, message: "Error obteniendo listado de tareas" } );
        return;
    }

    if (tasks.length < 0) {
        res.status(404);
        res.send( { code: 404, message: "No se ha encontrado ningún registro" } );
        return;
    }

    res.status(200);
    res.send( { code: 200, tasks } );
})

/**
 * @url /api/projects/tasks/new
 * @method  POST
 * @description Llamada que introduce una nueva tarea en FileMaker
 * @return {JSON}
 */
router.post("/tasks/new", [auth.validateAccess], async (req, res) => {
    projectsModel.fmtoken = req.user.fmtoken;

    // Comprobamos que los campos necesarios se han rellenado
    if (!req.body.start || !req.body.projectToAddTask) {
        res.status(400);
        res.send( { code: 400, message: "No se ha relleando toda la información requerida para esta acción" } );
        return;
    }
    
    // Creamos el objeto de la tarea a introducir en FileMaker
    const task = { 
        Fecha: moment().format("MM/DD/YYYY"),  
        Usuario: req.user.username,
        Inicio: req.body.start,
        Proyecto: req.body.projectToAddTask,

    }

    const data = await projectsModel.insertTaskIntoProject(task);

    if (data == null || data == false) {
        res.status(500);
        res.send( { code: 500, message: "Error insertando la tarea en Filemaker", task } );
        return;
    }

    // Guardamos la ubicación de usuario
    const action = "INICIO HORAS"
    const saveLocation = projectsModel.insertLocation(req.body.Location, action)
    
    if (!saveLocation) {
        res.status(200);
        res.send( { code: 200, message: "Tarea insertada pero ubicación de usuario no guardada" } );
        return;
    }

    res.status(201);
    // Devuelvo la tarea creada para poder finalizarla en la misma pantalla sin actualizar
    res.send( { code: 201, message: "Tarea correctamente insertada en el proyecto " + req.body.projectToAddTask, data } );
});




/**
 * @url /api/projects/tasks/:id
 * @method  PATCH
 * @description Llamada que añade tiempo a las tareas en FileMaker
 * @return {JSON}
 */
router.patch("/tasks/:id", [auth.validateAccess], async (req, res) => {
    projectsModel.fmtoken = req.user.fmtoken;
    
    // Comprobamos que los campos necesarios se han rellenado
    if (!req.params.id || !req.body.Fecha || (!req.body.Inicio && !req.body.Fin)) {
        res.status(400);
        res.send( { code: 400, message: "No se ha relleando toda la información requerida para esta acción" } );
        return;
    }
    
    // Generamos el cuerpo de la llamada a la API de FileMaker que ejecutará posteriormente el model
    let fieldData = { Fecha: req.body.Fecha }

    if (req.body.Inicio) fieldData.Inicio = req.body.Inicio
    if (req.body.Fin) {
        fieldData.Fin = req.body.Fin;
        fieldData.Estado = "REALIZADO";
        fieldData.Nota = req.body.TrabajoRealizado
    }

    // Actualizamos la tarea
    const update = projectsModel.updateTask(req.params.id, fieldData);

    if (!update) {
        res.status(500);
        res.send( { code: 500, message: "Error actualizando la tarea en Filemaker" } );
        return;
    }

    // Guardamos la ubicación de usuario
    const action = req.body.Fin ? "FINALIZAR VISITA" : "INICIO HORAS"
    const saveLocation = projectsModel.insertLocation(req.body.Location, action)
    
    if (!saveLocation) {
        res.status(200);
        res.send( { code: 200, message: "Tarea actualizada pero ubicación de usuario no guardada" } );
        return;
    }

    res.status(200);
    res.send( { code: 200, message: "Tarea actualizada correctamente"} );
})

/**
 * @url /api/projects/taskFromProject/:id
 * @method  PATCH
 * @description Llamada que finaliza la tarea de un proyecto en FileMaker
 * @return {JSON}
 */
router.patch("/taskFromProject/:id", [auth.validateAccess], async (req, res) => {
    projectsModel.fmtoken = req.user.fmtoken;
    
    // Comprobamos que los campos necesarios se han rellenado
    if (!req.params.id || !req.body.Fecha || !req.body.Accion || !req.body.Nota || (!req.body.Inicio && !req.body.Fin)) {
        res.status(400);
        res.send( { code: 400, message: "No se ha relleando toda la información requerida para esta acción" } );
        return;
    }
    
    let fieldData = { Fecha: req.body.Fecha,
                      Accion: req.body.Accion,
                      Nota: req.body.Nota }

    if (req.body.Inicio) fieldData.Inicio = req.body.Inicio
    if (req.body.Fin) {
        fieldData.Fin = req.body.Fin;
        fieldData.Estado = "REALIZADO";
    }

    const update = projectsModel.updateTask(req.params.id, fieldData);

    if (!update) {
        res.status(500);
        res.send( { code: 500, message: "Error actualizando la tarea en Filemaker" } );
        return;
    }

    // Guardamos la ubicación de usuario
    const action = "FINALIZAR VISITA"
    const saveLocation = projectsModel.insertLocation(req.body.Location, action)
    
    if (!saveLocation) {
        res.status(200);
        res.send( { code: 200, message: "Tarea actualizada pero ubicación de usuario no guardada" } );
        return;
    }

    res.status(201);
    res.send( { code: 201, message: "Tarea actualizada correctamente"} );
})


module.exports = router;