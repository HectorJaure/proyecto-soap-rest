const soap = require('soap');
const fs = require('fs');
const path = require('path');

// Base de datos temporal para REST
let database = [{ id: 1, nombre: "Item Inicial" }];

// Lógica del servicio SOAP
const soapService = {
  CalculadoraService: {
    CalculadoraPort: {
      Sumar: function(args) {
        return { resultado: parseFloat(args.a) + parseFloat(args.b) };
      }
    }
  }
};

export default function handler(req, res) {
  const { method, query } = req;

  // --- LÓGICA SOAP ---
  // Si la petición viene con un Header SOAP o es a la ruta de SOAP
  if (req.headers['soapaction'] || method === 'POST' && !req.body.id && !req.body.nombre) {
    const xmlPath = path.join(process.cwd(), 'example.wsdl');
    const xml = fs.readFileSync(xmlPath, 'utf8');
    return soap.listen(res, '/api/index', soapService, xml);
  }

  // --- LÓGICA REST ---
  switch (method) {
    case 'GET':
      return res.status(200).json(database);
    
    case 'POST':
      const nuevo = { id: database.length + 1, nombre: req.body.nombre || "Sin nombre" };
      database.push(nuevo);
      return res.status(201).json(nuevo);
    
    case 'PUT':
      const { id } = query;
      database = database.map(item => item.id == id ? { ...item, nombre: req.body.nombre } : item);
      return res.status(200).json({ mensaje: "Actualizado" });
    
    case 'DELETE':
      const deleteId = query.id;
      database = database.filter(item => item.id != deleteId);
      return res.status(200).json({ mensaje: "Eliminado" });

    default:
      res.status(405).send("Método no permitido");
  }
}