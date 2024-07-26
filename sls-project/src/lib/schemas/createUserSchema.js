const schema = {
    properties: {
      body: {
        type: 'object',
        properties: {
          userName: {
            type: 'string',
          },
          birthday: {
            type: 'string',
          },
        },
        required: ['userName'],
      },
    },
    required: ['body'],
  };
  
  export default schema;