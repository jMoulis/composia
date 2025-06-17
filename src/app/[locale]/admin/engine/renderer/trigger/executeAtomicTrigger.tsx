import {
  applyOutputTransform,
  assertValidWithSchema,
  evaluateExpression
} from './utils';
import { CustomExecutionError } from './CustomExecutionError';
import { executeDatabaseAction } from './actions/executeDatabaseAction';
import { callApi } from './actions/callApi';
import { toast } from 'sonner';
import { ITrigger } from '../../interfaces';
import { interpolateParams } from './interpolateParams';
import { createDebugService } from './createDebugService';

export async function executeTrigger(
  trigger: ITrigger | ITrigger[],
  provides: Record<string, any> = {},
  results: Record<string, any> = {}
): Promise<Record<string, any>> {
  const triggerList = Array.isArray(trigger) ? trigger : [trigger];
  for (const t of triggerList) {
    results = await executeAtomicTrigger(t, provides, results);
  }
  return results;
}

export async function executeAtomicTrigger(
  trigger: ITrigger,
  provides: Record<string, any>,
  results: Record<string, any>
): Promise<Record<string, any>> {
  const debug = createDebugService(process.env.NODE_ENV === 'development');
  debug.enter(`Trigger: ${trigger.type} (${trigger.outputKey || 'anonymous'})`);
  const context = { ...provides, results };

  try {
    // ⛔️ Exécution parallèle
    if (trigger.type === 'parallel' && Array.isArray(trigger.triggers)) {
      const parallelResults = await Promise.all(
        trigger.triggers.map((subTrigger) =>
          executeAtomicTrigger(subTrigger, provides, results)
        )
      );
      return Object.assign({}, results, ...parallelResults);
    }

    // 📦 Extraction
    const {
      type,
      params = {},
      inputSchema,
      expectedOutputSchema,
      outputKey,
      outputTransform
    } = trigger;

    // 🔄 Résolution des paramètres
    const resolvedParams = interpolateParams(params, context);

    // ✅ Validation des entrées si inputSchema présent
    if (inputSchema) {
      assertValidWithSchema(
        inputSchema,
        resolvedParams,
        `Trigger inputSchema: ${type}`,
        debug
      );
    }

    let output: any;

    // 🚀 Exécution métier
    switch (type) {
      case 'executeDatabaseAction':
        output = await executeDatabaseAction(resolvedParams.query);
        break;

      case 'callApi':
        output = await callApi(resolvedParams);
        break;

      case 'showToast': {
        const toastMap: Record<string, (msg: string) => void> = {
          error: toast.error,
          warning: toast.warning,
          info: toast.info,
          success: toast.success
        };

        const showToast = toastMap[resolvedParams.variant] ?? toast;
        const message = resolvedParams.message ?? 'Notification';
        showToast(message);
        break;
      }

      case 'updateStore': {
        const updateStore = provides.updateStore;
        if (!updateStore) {
          throw new CustomExecutionError({
            message: 'Missing updateStore in context',
            context: 'updateStore',
            errors: []
          });
        }
        await updateStore(
          resolvedParams.storeName,
          resolvedParams.data,
          resolvedParams.index,
          resolvedParams.action
        );
        break;
      }

      case 'log': {
        console.group('Log Trigger');
        console.info('Message', resolvedParams.message);
        console.info('Data', resolvedParams.data);
        console.groupEnd();
        break;
      }

      default:
        throw new CustomExecutionError({
          message: `Unknown trigger type: ${type}`,
          context: 'execution',
          errors: []
        });
    }

    // ✅ Validation de sortie si attendu
    if (expectedOutputSchema) {
      assertValidWithSchema(
        expectedOutputSchema,
        output,
        `Trigger expectedOutputSchema: ${type}`,
        debug
      );
    }

    // 🔁 Transformation éventuelle
    const mappedOutput = outputTransform
      ? applyOutputTransform(output, outputTransform, context, debug)
      : output;

    // 🧠 Merge résultats temporaires
    const nextResults = {
      ...results,
      ...(outputKey ? { [outputKey]: mappedOutput } : mappedOutput)
    };

    // 🧠 Exécution conditionnelle (if/else, try/catch/finally)
    if ('conditional' in trigger) {
      const {
        if: ifBlock,
        elseif = [],
        else: elseBlock,
        try: tryBlock,
        catch: catchBlock,
        finally: finallyBlock
      } = trigger.conditional ?? {};

      try {
        if (tryBlock) {
          const tryResults = await executeTrigger(
            tryBlock,
            provides,
            nextResults
          );
          if (finallyBlock) {
            return await executeTrigger(finallyBlock, provides, tryResults);
          }
          return tryResults;
        }

        if (ifBlock?.expression) {
          const conditionResult = evaluateExpression(
            ifBlock.expression,
            {
              ...context,
              results: nextResults
            },
            true,
            debug
          );
          if (conditionResult) {
            return await executeTrigger(
              ifBlock.triggers,
              provides,
              nextResults
            );
          }
        }

        for (const elseifBlock of elseif) {
          if (
            evaluateExpression(
              elseifBlock.expression,
              {
                ...context,
                results: nextResults
              },
              true,
              debug
            )
          ) {
            return await executeTrigger(
              elseifBlock.triggers,
              provides,
              nextResults
            );
          }
        }

        if (elseBlock) {
          return Array.isArray(elseBlock)
            ? await executeTrigger(elseBlock, provides, nextResults)
            : await executeAtomicTrigger(elseBlock, provides, nextResults);
        }

        return nextResults;
      } catch (error) {
        if (catchBlock) {
          const catchResults = await executeTrigger(
            catchBlock,
            provides,
            nextResults
          );
          if (finallyBlock) {
            return await executeTrigger(finallyBlock, provides, catchResults);
          }
          return catchResults;
        }

        if (finallyBlock) {
          return await executeTrigger(finallyBlock, provides, nextResults);
        }

        throw error;
      }
    }
    return nextResults;
  } catch (error) {
    debug.logError(`Error executing trigger: ${trigger.type}`, error);
    throw new CustomExecutionError({
      message: `Error executing trigger: ${trigger.type}`,
      context: `Trigger: ${trigger.type}`,
      errors: error instanceof CustomExecutionError ? error.errors : [],
      type: trigger.type
    });
  } finally {
    debug.exit(`Trigger: ${trigger.type}`);
  }
}
