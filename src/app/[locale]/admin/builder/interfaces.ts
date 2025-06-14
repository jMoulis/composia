// import { ZodSchema } from "zod";

export interface IPage {
  pageKey: string;
  route: string; // ex: "/youths", "/youths/:id"
  title?: string;
  publishedVersionId?: string; // version publiée (optionnel)
  versions?: string[];
  context: {
    route: string; // route complète pour la page
  }
}

export interface IPageVersion {
  _id: string; // identifiant unique de la version
  snapshot: IComponentNode; // état complet du composant racine
  published: boolean; // si cette version est publiée
}
export interface IComponentNode {
  key: string; // identifiant unique dans l’arbre
  type: string; // ex: "form", "table", "input", "block", "tabs", "modal", etc.

  data?: IComponentData; // logique de ressource liée (optionnelle)
  props?: Record<string, any>; // options visuelles ou comportementales
  events?: Record<string, ITrigger | ITrigger[]>; // ex: onClick, onSubmit, onRowClick

  bindings?: Record<string, string>; // injection descendante
  provides?: Record<string, string>; // exposition vers les enfants

  layout?: string; // ex: "horizontal", "vertical", "grid", etc.
  className?: string;
  condition?: string; // ex: "role == 'admin'"

  children?: IComponentNode[]; // arbre récursif
}

export interface IComponentData {
  // Cas simple : lié à une resource + un mode
  resourceId?: string; // ex: "youth"
  fieldKey?: string;   // pour un champ spécifique (input, date, etc.)
  mode?: "view" | "edit" | "create";

  // Cas avancé : pipeline Mongo sécurisé
  resourceQuery?: IResourceQuery;
}

export interface IResourceQuery {
  collection: string; // ex: "youth"
  pipeline: Record<string, any>[]; // ex: [ { $match: {...} }, { $sort: {...} } ]
  bindings?: Record<string, string>; // facultatif : injecté côté backend avant exécution
}

export interface ITrigger {
  type: string; // ex: "submitForm", "openComponent", "callApi", "showToast", etc.
  target?: string; // ex: key d’un composant, route, modal
  collection?: string; // pour les actions liées à une ressource
  query?: {
    action: 'create' | 'update' | 'delete' | 'list' | 'aggregate' | 'get'; // action à exécuter
    collection: string; // nom de la collection Mongo
    data?: string | Record<string, any>; // données à envoyer (pour create/update)
    filter?: Record<string, any>; // pour les actions list/get
    options?: Record<string, any>; // options supplémentaires (ex: { returnDocument: "after" })
  }; // pour les actions callApi ou database
  params?: Record<string, any>; // options passées au trigger
  condition?: string; // ex: "formIsValid"
}

export interface IComponentDefinitionDocument {
  // _id: string; // eg. "form", "button"
  label: string; // affiché dans le builder
  type: string; // identifiant technique
  isContainer: boolean;
  allowedEvents?: string[];
  defaultProps?: Record<string, any>;
  // editSchema?: ZodSchema | JSONSchema; // facultatif
  category?: string;
  icon?: string;
}

export interface IComponentDefinition extends IComponentDefinitionDocument {
  component: React.ComponentType<any>; // Résolu à partir de type
}

export interface IComponentRegistryProps {
  node: IComponentNode;
  bindings: Record<string, any>;
  events: Record<string, any>;
  provides?: Record<string, any>; // données exposées aux enfants
}
export interface IResourceDefinition {
  resourceKey: string; // ex: "youth"
  label: string; // ex: "Jeune"
  fields: Record<string, IResourceField>;
}

export interface IResourceField {
  label: string;
  type: "string" | "number" | "boolean" | "date" | "array" | "object"; // extensible si besoin
  required?: boolean;
  component?: string; // ex: "input", "select", "datePicker"
  props?: Record<string, any>; // props par défaut injectées dans le champ
  validations?: IValidationRule[]; // règles de validation Zod-friendly
}
export interface IValidationRule {
  type: string; // ex: "min", "max", "regex", "isEmail", "isDate", etc.
  value?: any; // valeur associée si nécessaire
}
