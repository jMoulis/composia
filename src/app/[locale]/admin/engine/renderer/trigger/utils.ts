import Ajv from 'ajv';
import { CustomExecutionError } from './CustomExecutionError'; // ou adapte le chemin
import { interpolateParams } from './interpolateParams';
import { createDebugService } from './createDebugService';

const isSafeExpression = (expression: string): boolean => {
  if (typeof expression === 'boolean') return true;

  const blacklist = [
    'window',
    'global',
    'process',
    'Function',
    'eval',
    'require',
    'import'
  ];
  return !blacklist.some((keyword) => expression.includes(keyword));
};

export function evaluateExpression(
  expression: string,
  context: Record<string, any>,
  returnBoolean: boolean = true,
  debug?: ReturnType<typeof createDebugService>
): boolean {
  try {
    if (!isSafeExpression(expression)) {
      debug?.logStep('Expression bloquée', expression);
      return false;
    }
    const func = new Function(
      'context',
      `with (context) { return (${expression}); }`
    );
    const result = func(context);
    debug?.logStep('Résultat expression', { expression, result });
    return returnBoolean ? Boolean(result) : result;
  } catch (e) {
    debug?.logError('Erreur d’évaluation de l’expression', e, { expression });
    return false;
  }
}

export function applyOutputTransform(
  output: any,
  transform: string | Record<string, any>,
  context: Record<string, any> = {},
  debug?: ReturnType<typeof createDebugService>

): Record<string, any> {
  const transformContext = { ...context, ...output };

  // Cas simple : transform est une string (ex: "{{data.message}}")
  if (typeof transform === 'string') {
    const result = interpolateParams(transform, transformContext);
    debug?.logStep('Transform string simple', { transform, result });
    return { value: result };
  }

  // Cas complet : transform est un objet avec des chemins
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(transform)) {
    if (typeof value === 'string' && value.trim().startsWith('$js(')) {
      const expression = value.trim().slice(4, -1); // Remove "$eval(" and ")"
      try {
        result[key] = evaluateExpression(expression, transformContext, false);
        continue;
      } catch (err) {
        debug?.logError(`Erreur d’évaluation dans transform`, err);
        result[key] = undefined;
      }
    } else {
      try {
        result[key] = interpolateParams(value, transformContext);
        debug?.logStep(`Interpolation transform.${key}`, result[key]);
      } catch (err) {
        debug?.logError(`Erreur interpolation transform.${key}`, err);
        result[key] = undefined;
      }
    }
  }

  return result;
}

export function assertValidWithSchema<T = any>(
  schema: object,
  data: unknown,
  context: string = 'Validation',
  debug?: ReturnType<typeof createDebugService>
): asserts data is T {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);
  const isValid = validate(data);
  debug?.logStep(`Validation schema ${context}`, {
    context,
    isValid,
    data,
    errors: validate.errors
  });
  if (!isValid) {
    debug?.logError(`Validation échoué ${context}`, validate.errors, { context });
    throw new CustomExecutionError({
      message: `${context} failed`,
      errors: validate.errors ?? [],
      context,
    });
  }
}
