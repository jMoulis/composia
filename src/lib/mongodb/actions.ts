'use server';

import { ObjectId, Document, Filter, UpdateFilter, FindOneAndUpdateOptions, AggregateOptions, Abortable } from "mongodb";
import { getDb } from "./connection";
import superjson from 'superjson';

export async function getDocument<T>(collection: string, filter: Filter<Document> = {}
) {
  try {

    const matchedFilter = { ...filter };
    if (matchedFilter._id && typeof matchedFilter._id === 'string') {
      // Convert string _id to ObjectId
      matchedFilter._id = ObjectId.createFromHexString(matchedFilter._id);
    } else if (matchedFilter._id && matchedFilter._id instanceof ObjectId) {
      // Ensure _id is an ObjectId
      matchedFilter._id = matchedFilter._id;
    }
    const db = await getDb();

    const document = await db.collection(collection).findOne(matchedFilter);
    if (!document) {
      return null; // or throw an error if preferred
    }
    const serializedDocument = superjson.stringify(document);
    return JSON.parse(serializedDocument)?.json as T;
  } catch (error) {
    console.error(`Error fetching document from ${collection}:`, error);
    throw new Error(`Failed to fetch document from ${collection}`);
  }
}

export async function getAllDocuments<T>(collection: string, query: Partial<T> = {}) {
  try {
    const db = await getDb();
    const documents = await db.collection(collection).find(query).toArray();
    const serializedDocuments = superjson.stringify(documents);
    return JSON.parse(serializedDocuments)?.json as T[] ?? [] as T[];
  } catch (error) {
    console.error(`Error fetching all documents from ${collection}:`, error);
    throw new Error(`Failed to fetch documents from ${collection}`);
  }
}

export async function aggregateDocuments<T>(
  collection: string,
  pipeline: Document[],
  options?: AggregateOptions & Abortable
): Promise<T[]> {
  try {
    const db = await getDb();
    const matchedPipeline = pipeline.map(stage => {
      if (stage.$match && stage.$match._id && typeof stage.$match._id === 'string') {
        // Convert string _id to ObjectId
        stage.$match._id = ObjectId.createFromHexString(stage.$match._id);
      } else if (stage.$match && stage.$match._id && stage.$match._id instanceof ObjectId) {
        // Ensure _id is an ObjectId
        stage.$match._id = stage.$match._id;
      }
      return stage;
    });
    const documents = await db.collection(collection).aggregate(matchedPipeline, options).toArray();
    const serializedDocuments = superjson.stringify(documents);
    return JSON.parse(serializedDocuments)?.json as T[];
  } catch (error) {
    console.error(`Error aggregating documents from ${collection}:`, error);
    throw new Error(`Failed to aggregate documents from ${collection}`);
  }
}

export async function createDocument<T>(
  collection: string,
  document: Partial<T>,
  options = {}
): Promise<T> {
  try {
    const db = await getDb();
    const result = await db.collection(collection).insertOne(document, options);
    if (!result.acknowledged) {
      throw new Error(`Failed to create document in ${collection}`);
    }

    const serializedDocument = superjson.stringify({ _id: result.insertedId, ...document });
    return JSON.parse(serializedDocument)?.json as T;
  } catch (error: any) {
    console.error(`Error creating document in ${collection}:`, error);
    throw new Error(`Failed to create document in ${collection}: ${error.message}`);
  }
}
export async function upsertDocument<T>(
  collection: string,
  filter: Filter<Document> = {},
  update: Document[] | UpdateFilter<Document>,
  options: FindOneAndUpdateOptions = {}
): Promise<T> {
  try {
    const db = await getDb();

    const matchedFilter = { ...filter };
    if (matchedFilter._id && typeof matchedFilter._id === 'string') {
      // Convert string _id to ObjectId
      matchedFilter._id = ObjectId.createFromHexString(matchedFilter._id);
    } else if (matchedFilter._id && matchedFilter._id instanceof ObjectId) {
      // Ensure _id is an ObjectId
      matchedFilter._id = matchedFilter._id;
    }
    const result = await db.collection(collection).findOneAndUpdate(
      matchedFilter,
      update,
      { returnDocument: 'after', ...options }
    );

    if (!result) {
      throw new Error(`Failed to upsert document in ${collection}`);
    }
    const serializedDocument = superjson.stringify({ data: result });
    return JSON.parse(serializedDocument)?.json as T;
  } catch (error: any) {
    throw new Error(`Failed to upsert document in ${collection}: ${error.message}`);
  }
}

export async function deleteDocument(collection: string, id: string): Promise<void> {
  try {
    const db = await getDb();
    const objectId = ObjectId.createFromHexString(id);
    const result = await db.collection(collection).deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      throw new Error(`No document found with id ${id} in ${collection}`);
    }
  } catch (error) {
    console.error(`Error deleting document from ${collection}:`, error);
    throw new Error(`Failed to delete document from ${collection}`);
  }
}