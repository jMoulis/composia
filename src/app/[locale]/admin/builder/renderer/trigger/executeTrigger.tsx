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

  switch (action) {
    case 'create': {
      if (!resolvedParams.data) {
        console.warn('No data provided for create action');
        return { success: false, error: 'No data provided for create action' };
      }

      const response = await createDocument<any>(
        collection,
        resolvedParams.data,
        resolvedParams.options || {}
      );
      return { success: true, ...response };
    }
    case 'update': {
      if (!resolvedParams.data) {
        console.warn('No data provided for create action');
        return { success: false, error: 'No data provided for create action' };
      }

      if (!resolvedParams.filter) {
        console.warn('No filter provided for create action');
        return {
          success: false,
          error: 'No filter provided for create action'
        };
      }
      const response = await upsertDocument<any>(
        collection,
        resolvedParams.filter,
        resolvedParams.data,
        resolvedParams.options || {}
      );
      return { success: true, ...response };
    }
    case 'delete':
      if (!resolvedParams.id) {
        console.warn('No ID provided for delete action');
        return { success: false, error: 'No ID provided for delete action' };
      }
      await deleteDocument(collection, resolvedParams.id);
      return { success: true, message: 'Document deleted successfully' };
    case 'list': {
      const documents = await getAllDocuments<any>(
        collection,
        resolvedParams.filter || {}
      );
      return {
        success: true,
        data: documents || []
      };
    }
    case 'aggregate': {
      if (!resolvedParams.pipeline || !Array.isArray(resolvedParams.pipeline)) {
        console.warn('No valid pipeline provided for aggregate action');
        return {
          success: false,
          error: 'No valid pipeline provided for aggregate action'
        };
      }
      const response = await aggregateDocuments(
        collection,
        resolvedParams.pipeline,
        resolvedParams.options || {}
      );
      return { success: true, ...response };
    }
    case 'get': {
      if (!resolvedParams.filter) {
        console.warn('No ID provided for get action');
        return { success: false, error: 'No ID provided for get action' };
      }
      const response = await getDocument(collection, resolvedParams.filter);
      return {
        success: true,
        data: response || null
      };
    }
    default:
      return {
        success: false,
        error: `Unsupported action: ${action}`
      };
  }
}
