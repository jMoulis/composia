import { z } from "zod";
import { IResourceDefinition } from "../../interfaces";

export function getZodSchemaFromResource(resource: IResourceDefinition) {
  const shape: Record<string, any> = {};

  for (const [key, field] of Object.entries(resource.fields)) {
    let zod = getZodFromType(field.type);

    if (field.required === false) {
      zod = zod.optional() as any;
    }

    if (field.validations) {
      for (const rule of field.validations) {
        zod = applyValidationRule(zod, rule);
      }
    }
    shape[key] = zod;
  }
  return z.object(shape);
}

function getZodFromType(type: string) {
  switch (type) {
    case "string": return z.string();
    case "number": return z.number();
    case "boolean": return z.boolean();
    case "date": return z.coerce.date(); // important
    default: return z.any();
  }
}

function applyValidationRule(schema: any, rule: { type: string, value?: any }) {
  switch (rule.type) {
    case "min": return schema.min(rule.value);
    case "max": return schema.max(rule.value);
    case "regex": return schema.regex(new RegExp(rule.value));
    case "isEmail": return schema.email();
    case "isDate": return z.coerce.date();
    default: return schema;
  }
}
