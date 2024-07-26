const schema = {
    properties: {
      body: {
        type: 'object',
        properties: {
          familyId: {
            type: 'string',
          },
          users: {
            type: 'array',
          },
        },
        required: ['familyId', 'users'],
      },
    },
    required: ['body'],
  };
  
  export default schema;