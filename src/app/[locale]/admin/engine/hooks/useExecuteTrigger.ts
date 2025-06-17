import { useCallback, useState } from "react"
import { IComponentNode } from "../interfaces";
import { useStoresContext } from "@/app/[locale]/[...slug]/stores/StoreContext";
import { toast } from "sonner";
import { CustomExecutionError } from "../renderer/trigger/CustomExecutionError";
import { executeTrigger } from "../renderer/trigger/executeAtomicTrigger";


type Props = {
  node: IComponentNode;
}

function useExecuteTrigger({ node }: Props) {
  const [loading, setLoading] = useState(false);
  const updateStore = useStoresContext((state) => state.updateStore);

  const execute = useCallback(async (triggerName: string, provides: Record<string, any>) => {
    try {
      setLoading(true);
      const trigger = node.events?.[triggerName];
      await executeTrigger(trigger || [], { ...provides, updateStore });
    } catch (error) {
      toast.error(`Error executing trigger: ${error instanceof CustomExecutionError ? error.type : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [node.events, updateStore]);

  return {
    execute,
    loading
  }
}

export default useExecuteTrigger