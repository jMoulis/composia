import {
  aggregateDocuments,
  createDocument,
  deleteDocument,
  getAllDocuments,
  getDocument,
  upsertDocument
} from '@/lib/mongodb/actions';
import { ITrigger } from '../../interfaces';
import { interpolateParams } from './interpolateParams';
import { toast } from 'sonner';

export async function executeTrigger(
  trigger: ITrigger,
  context: Record<string, any> = {}
) {
  const { type, target, params = {}, query = {} } = trigger;
  const resolvedParams = interpolateParams(
    { ...params, ...query },
    { ...context, testId: '684c507b41b08defe95fc7bb' }
  );

  switch (type) {
    case 'executeDatabaseAction':
      return executeDatabaseAction(trigger, resolvedParams);
    case 'callApi':
      return callApi(target!, resolvedParams);
    case 'navigate':
      return window.location.assign(target!); // à adapter si router
    case 'showToast': {
      console.log('showToast', resolvedParams);
      switch (resolvedParams.variant) {
        case 'error':
          toast.error(
            resolvedParams.message ||
              'An error occurred while processing your request'
          );
          return;
        case 'warning':
          toast.warning(
            resolvedParams.message || 'Warning: Please check your input'
          );
          return;
        case 'info':
          toast.info(
            resolvedParams.message || 'Information: Please note the following'
          );
          return;
        case 'success':
          if (!resolvedParams.message) {
            console.warn('No message provided for success toast');
            return;
          }
          toast.success(
            resolvedParams.message || 'Action completed successfully'
          );
          return;
        default:
          return toast('An unexpected error occurred. Please try again later.');
      }
    }
    default:
      console.warn('Unhandled trigger type:', type);
  }
}

async function callApi(_url: string, _options: Record<string, any>) {
  // console.log(url, options);
}

async function executeDatabaseAction(
  trigger: ITrigger,
  resolvedParams: Record<string, any>
) {
  if (!trigger.query) {
    console.warn('No query defined for database action');
    return { success: false, error: 'No query defined' };
  }

  const { action, collection } = trigger.query;

  if (!collection) {
    console.warn('No collection specified for database action');
    return { success: false, error: 'No collection specified' };
  }

  if (!action) {
    console.warn('No action specified for database action');
    return { success: false, error: 'No action specified' };
  }

  type ActionHandler = (
    params: Record<string, any>
  ) => Promise<Record<string, any>>;

  const actionHandlers: Record<
    'create' | 'update' | 'delete' | 'list' | 'aggregate' | 'get',
    ActionHandler
  > = {
    async create(params) {
      if (!params.data) {
        console.warn('No data provided for create action');
        return { success: false, error: 'No data provided for create action' };
      }

      const response = await createDocument<any>(
        collection,
        params.data,
        params.options || {}
      );
      return { success: true, ...response };
    },
    async update(params) {
      if (!params.data) {
        console.warn('No data provided for create action');
        return { success: false, error: 'No data provided for create action' };
      }

      if (!params.filter) {
        console.warn('No filter provided for create action');
        return {
          success: false,
          error: 'No filter provided for create action'
        };
      }

      const response = await upsertDocument<any>(
        collection,
        params.filter,
        params.data,
        params.options || {}
      );
      return { success: true, ...response };
    },
    async delete(params) {
      if (!params.id) {
        console.warn('No ID provided for delete action');
        return { success: false, error: 'No ID provided for delete action' };
      }
      await deleteDocument(collection, params.id);
      return { success: true, message: 'Document deleted successfully' };
    },
    async list(params) {
      const documents = await getAllDocuments<any>(
        collection,
        params.filter || {}
      );
      return {
        success: true,
        data: documents || []
      };
    },
    async aggregate(params) {
      if (!params.pipeline || !Array.isArray(params.pipeline)) {
        console.warn('No valid pipeline provided for aggregate action');
        return {
          success: false,
          error: 'No valid pipeline provided for aggregate action'
        };
      }

      const response = await aggregateDocuments(
        collection,
        params.pipeline,
        params.options || {}
      );
      return { success: true, ...response };
    },
    async get(params) {
      if (!params.filter) {
        console.warn('No ID provided for get action');
        return { success: false, error: 'No ID provided for get action' };
      }

      const response = await getDocument(collection, params.filter);
      return {
        success: true,
        data: response || null
      };
    }
  };

  const handler = actionHandlers[action];

  if (!handler) {
    return {
      success: false,
      error: `Unsupported action: ${action}`
    };
  }

  return handler(resolvedParams);
}
