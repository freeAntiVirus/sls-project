const schema = {
  type: "object",
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      required: ['familyName', 'capacity'],
      properties: {
        familyName: { type: "string" },
        capacity: { type: "string" },
      },
    },
  },
};

export default schema;
