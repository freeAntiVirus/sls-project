const schema = {
    properties: {
      body: {
        type: 'object',
        properties: {
          familyName: {
            type: 'string',
          },
          capacity: {
            type: 'number',
          },
        },
        required: ['familyName', 'capacity'],
      },
    },
    required: ['body'],
  };
  
  export default schema;