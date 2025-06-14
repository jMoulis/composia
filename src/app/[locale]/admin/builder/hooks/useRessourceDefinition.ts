import { useEffect, useState } from "react";
import { IResourceDefinition } from "../interfaces";
import { getDocument } from "@/lib/mongodb/actions";
import { SYSTEM_COLLECTIONS } from "@/lib/mongodb/system-collections";

export const useResourceDefinition = (ressourceKey?: string): IResourceDefinition | null => {
  const [ressourceDefinition, setResourceDefinition] = useState<IResourceDefinition | null>(null);
  const fetchRessourceDefinition = async (resourceKey: string): Promise<IResourceDefinition | null> => {
    // Simulate fetching from a database or API
    try {
      const response = await getDocument<IResourceDefinition>(SYSTEM_COLLECTIONS.RESOURCES, {
        resourceKey
      });
      return response;

    } catch (error: any) {
      console.error(`Error fetching resource definition for key ${resourceKey}:`, error);
      return null
    }
  }
  useEffect(() => {
    if (ressourceKey) {
      fetchRessourceDefinition(ressourceKey).then(definition => {
        setResourceDefinition(definition);
      });
    }
  }, [ressourceKey]);

  return ressourceDefinition;
};