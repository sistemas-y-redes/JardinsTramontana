/**
 * @file api/models/projects.model.js
 * @description Modelo que contiene todas las funciones relacionadas con la gestión de proyectos y tareas en Filemaker
 * @author Sistemas y Redes <departamentoweb@syr.es>
 */

const projectsModel = {};
const jwt = require("jsonwebtoken");
const axios = require("axios");
const moment = require("moment");
const https = require("https");
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

projectsModel.fmtoken = "";

/**
 * @name        getProjects
 * @description Obtenemos un listado de proyectos
 * @returns     {bool}
 */
projectsModel.getProjects = async (id = "*", search = "") => {
  let query = [];

  if (search) {
    const searchFields = ["NombreEmpresa", "DescripcionProyecto", "ProyectoNumero"];
    searchFields.forEach((field) => {
      let obj = {
        ResponsableCodigo: id,
      };
      obj[field] = search;
      query.push(obj);
    });
  } else {
    query.push({
      ResponsableCodigo: id,
    });
  }

  try {
    let respuesta = await axios.get(
      `https://${process.env.FM_SERVER}/fmi/data/v1/databases/${process.env.FM_DATABASE}/layouts/ProyectosAPI/records`,
      {
        httpsAgent: httpsAgent,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${projectsModel.fmtoken}`,
        },
      }
    );
    const proyectos = respuesta.data;
    return proyectos;
  } catch (error) {
    console.log("Error en encontrar proyectos: " + error);
    return false;
  }
};

/**
 * @name        getTasks
 * @description Obtenemos un listado de las tareas
 * @returns     {bool}
 */
projectsModel.getTasks = (id = "*", search = "") => {
  let query = [];

  if (search) {
    const searchFields = ["Accion", "Nota", "NombreComercial"];
    searchFields.forEach((field) => {
      let obj = {
        Estado: "==PENDIENTE",
        Fin: "=",
        Usuario: id,
      };
      obj[field] = search;
      query.push(obj);
    });
  } else {
    query.push({
      Estado: "==PENDIENTE",
      Fin: "=",
      Usuario: id,
    });
  }

  return axios
    .post(
      `https://${process.env.FM_SERVER}/fmi/data/v1/databases/${process.env.FM_DATABASE}/layouts/TareasAPI/_find`,
      {
        query: query,
        sort: [
          {
            fieldName: "Fecha",
            sortOrder: "ascend",
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${projectsModel.fmtoken}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      return response.data.response.data
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
};

/**
 * @name        getTasksFromUser
 * @description Obtenemos un listado de las tareas
 * @param       {string}  id  El ID del usuario a buscar
 * @returns     {bool}
 */
projectsModel.getTasksFromUser = (id) => {
  let query = [{
    Estado: "==PENDIENTE",
    Inicio: "*",
    Fin: "=",
    Usuario: id,
    Proyecto: "*"
  }];

  return axios
    .post(
      `https://${process.env.FM_SERVER}/fmi/data/v1/databases/${process.env.FM_DATABASE}/layouts/TareasAPI/_find`,
      {
        query: query,
        sort: [
          {
            fieldName: "Fecha",
            sortOrder: "ascend",
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${projectsModel.fmtoken}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      return response.data.response.data
    })
    .catch((error) => {
      console.log(error);
      return false;
    });
};


/**
 * @name        insertTaskIntoProject
 * @description Inserta una nueva tarea de un proyecto en FileMaker
 * @param       {object} task El objeto de la tarea a insertar
 * @returns     {bool}
 */
projectsModel.insertTaskIntoProject = async ({
  Fecha,
  Usuario,
  Inicio,
  Fin,
  Proyecto,
  Nota,
  Accion,
}) => {
  // Insertamos el registro en la tabla de tareas
  const fieldData = {
    fieldData: { Fecha, Usuario, Inicio, Fin, Proyecto, Nota, Accion, Estado: "PENDIENTE" },
  };

  const insert = await axios.post(
    `https://${process.env.FM_SERVER}/fmi/data/v1/databases/${process.env.FM_DATABASE}/layouts/TareasAPI/records`,
    fieldData,
    {
      headers: {
        Authorization: `Bearer ${projectsModel.fmtoken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return insert ? { recordId: insert.data.response.recordId, fieldData: fieldData } : false;
}
/**
 * @name        insertLocation
 * @description Guarda la ubicación en la tabla de InformeSatUbicaciones
 * @param       {object} location   El objeto con las coordenadas de posición
 * @param       {string} username   El ID del usuario del que tenemos que almacenar la ubicación
 * @param       {string} action     La acción realizada. En este caso "INICIO HORAS" o "FINALIZAR VISITA"
 * @returns     {bool}
 */
projectsModel.insertLocation = async ({ longitude, latitude, altitude }, action) => {
  // Insertamos el registro en la tabla de tareas
  const fieldData = {
    fieldData: { Ubicación: `+${latitude}, +${longitude}, +${altitude}`, Cliente: action, FechaHora: moment().format("MM/DD/YYYY HH:mm:ss")},
  };
  const insert = await axios.post(
    `https://${process.env.FM_SERVER}/fmi/data/v1/databases/${process.env.FM_DATABASE}/layouts/UbicacionesAPI/records`,
    fieldData,
    {
      headers: {
        Authorization: `Bearer ${projectsModel.fmtoken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return insert ? { recordId: insert.data.response.recordId, fieldData: fieldData } : false;
};

/**
 * @name        updateTask
 * @description Actualiza una tarea en Filemaker
 * @param       {string} id         El RecordId de la tarea de FM a modificar
 * @param       {object} data       Los datos a modificar
 * @returns     {bool}
 */
projectsModel.updateTask = async (recordId, data) => {
  const fieldData = { fieldData: data };

  const update = await axios.patch(
    `https://${process.env.FM_SERVER}/fmi/data/v1/databases/${process.env.FM_DATABASE}/layouts/TareasAPI/records/${recordId}`,
    fieldData,
    {
      headers: {
        Authorization: `Bearer ${projectsModel.fmtoken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return update ? true : false;
};

module.exports = projectsModel;
