export function createDebugService(enabled = true) {
  let level = 0;

  function indent() {
    return '│ '.repeat(level);
  }

  function logStep(step: string, details: any, context?: Record<string, any>) {
    if (!enabled) return;
    console.groupCollapsed(`${indent()}📌 ${step}`);
    if (context?.triggerType) console.info('🧩 Type:', context.triggerType);
    if (context?.triggerId) console.info('🆔 OutputKey:', context.triggerId);
    console.info('🧾 Détails:', details);
    console.groupEnd();
  }

  function logError(message: string, error: unknown, context?: Record<string, any>) {
    if (!enabled) return;
    console.group(`${indent()}❌ ${message}`);
    console.error('Erreur:', error);
    if (context) console.info('Context:', context);
    console.groupEnd();
  }

  function enter(label: string) {
    if (!enabled) return;
    console.group(`${indent()}📂 Entrée: ${label}`);
    level++;
  }

  function exit(label: string) {
    if (!enabled) return;
    level--;
    console.groupEnd();
    console.info(`${indent()}📁 Sortie: ${label}`);
  }

  return {
    logStep,
    logError,
    enter,
    exit,
  };
}
