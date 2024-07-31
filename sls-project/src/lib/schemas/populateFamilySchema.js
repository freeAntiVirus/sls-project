const schema = {
  type: "object",
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      required: ['familyId', 'users'],
      properties: {
        familyId: { type: "string" },
        users: { type: "array" },
      },
    },
  },
};

export default schema;