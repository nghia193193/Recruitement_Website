import swaggerJsDoc from 'swagger-jsdoc';

const options: swaggerJsDoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
        description: 'Description of my API',
      },
    },
    apis: ['../routes/*.ts'], // Đường dẫn đến các tệp chứa thông tin API

};

const swaggerSpec = swaggerJsDoc(options);

export default swaggerSpec;