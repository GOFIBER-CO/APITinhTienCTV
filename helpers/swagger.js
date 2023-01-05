const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require("swagger-jsdoc");
//const YAML = require('yamljs');
//const swaggerDocument = YAML.load('./swagger.yaml');

// router.use('/', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
          title: "Library API",
          version: "1.0.0",
          description: "A simple Express Library API",
          termsOfService: "http://example.com/terms/",
          contact: {
            name: "API Support",
            url: "http://www.exmaple.com/support",
            email: "support@example.com",
          },
        },
    
        servers: [
          {
            url: "http://localhost:8000",
            description: "My API Documentation",
          },
        ],
      },
      apis: ["../routers/*.js"],
}
const specs = swaggerJsDoc(options);
router.use('/',swaggerUI.serve, swaggerUI.setup(specs, {explorer: true}))

module.exports = router;