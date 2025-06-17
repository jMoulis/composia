import { aggregateDocuments, createDocument, deleteDocument, getAllDocuments, getDocument, upsertDocument } from "@/lib/mongodb/actions";
import { IQueryDefinition } from "../../../interfaces";

export async function executeDatabaseAction(
  resolvedQuery: IQueryDefinition
): Promise<{
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  message?: string;
}> {
  if (!resolvedQuery) {
    console.warn('No query defined for database action');
    return { success: false, error: 'No query defined' };
  }

  const { action, collection } = resolvedQuery;

  if (!collection) {
    console.warn('No collection specified for database action');
    return { success: false, error: 'No collection specified' };
  }

  if (!action) {
    console.warn('No action specified for database action');
    return { success: false, error: 'No action specified' };
  }

  type ActionHandler = (
    query: IQueryDefinition
  ) => Promise<Record<string, any>>;

  const actionHandlers: Record<
    'create' | 'update' | 'delete' | 'list' | 'aggregate' | 'get',
    ActionHandler
  > = {
    async create(query) {
      if (!query.data) {
        console.warn('No data provided for create action');
        return { success: false, error: 'No data provided for create action' };
      }

      const response = await createDocument<any>(
        collection,
        query.data,
        query.options || {}
      );
      return { success: true, ...response };
    },
    async update(query) {
      if (!query?.data) {
        console.warn('No data provided for update action');
        return { success: false, error: 'No data provided for update action' };
      }

      if (!query?.filter) {
        console.warn('No filter provided for update action');
        return {
          success: false,
          error: 'No filter provided for update action'
        };
      }

      const response = await upsertDocument<any>(
        collection,
        query.filter,
        query.data,
        query.options || {}
      );
      return { success: true, response };
    },
    async delete(query) {
      if (!query._id) {
        console.warn('No ID provided for delete action');
        return { success: false, error: 'No ID provided for delete action' };
      }
      await deleteDocument(collection, query._id);
      return { success: true, message: 'Document deleted successfully' };
    },
    async list(query) {
      const documents = await getAllDocuments<any>(
        collection,
        query.filter || {}
      );
      return {
        success: true,
        data: documents || []
      };
    },
    async aggregate(query) {
      if (!query.pipeline || !Array.isArray(query.pipeline)) {
        console.warn('No valid pipeline provided for aggregate action');
        return {
          success: false,
          error: 'No valid pipeline provided for aggregate action'
        };
      }

      const response = await aggregateDocuments(
        collection,
        query.pipeline,
        query.options || {}
      );
      return { success: true, ...response };
    },
    async get(query) {
      if (!Object.keys(query.filter || {}).length) {
        console.warn('No ID provided for get action');
        return { success: false, error: 'No ID provided for get action' };
      }

      const response = await getDocument(collection, query.filter);
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

  return handler(resolvedQuery) as Promise<{
    success: boolean;
    data?: Record<string, any>;
    error?: string;
    message?: string;
  }>;
}
