export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const assureString = (value: unknown, defaultValue = ''): string => {
  if (isString(value)) return value;

  console.log(
    'assureString mapper received a non-string value. Returning empty string',
    { receivedValue: value, outputValue: defaultValue },
  );

  return defaultValue;
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number';
};

export const assureNumber = (value: unknown, defaultValue = 0): number => {
  if (isNumber(value)) return value;

  console.log('assureNumber mapper received a non-number value. Returning 0', {
    receivedValue: value,
    outputValue: defaultValue,
  });

  return defaultValue;
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const assureBoolean = (
  value: unknown,
  defaultValue = false,
): boolean => {
  if (isBoolean(value)) return value;

  console.log(
    'assureBoolean mapper received a non-boolean value. Returning false',
    {
      receivedValue: value,
      outputValue: defaultValue,
    },
  );

  return defaultValue;
};
