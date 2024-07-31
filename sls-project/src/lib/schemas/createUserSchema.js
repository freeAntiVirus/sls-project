const schema = {
  type: "object",
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      required: ['userName', 'birthday'],
      properties: {
        userName: { type: "string" },
        birthday: { type: "string" },
      },
    },
  },
};

export default schema;
