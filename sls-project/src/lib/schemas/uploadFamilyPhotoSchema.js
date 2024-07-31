const schema = {
    required: ['body'],
    properties: {
      body: {
        type: 'string',
        minLength: 1,
      },
    },
  };
  
  export default schema;

