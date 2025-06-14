export function interpolateParams(obj: any, context: Record<string, any>): any {
  if (typeof obj === "string") {
    // Cas 1 : toute la chaîne est une expression → retourner l'objet original
    const match = obj.match(/^\{\{(.*?)\}\}$/);
    if (match) {
      const key = match[1].trim();
      const value = key.split('.').reduce((acc, part) => acc?.[part], context);
      return value ?? "";
    }

    // Cas 2 : interpolation dans une chaîne plus complexe
    return obj.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      const value = key.trim().split('.').reduce((acc: any, part: any) => acc?.[part], context);
      return value ?? "";
    });
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => interpolateParams(item, context));
  }

  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, interpolateParams(v, context)])
    );
  }

  return obj;
}