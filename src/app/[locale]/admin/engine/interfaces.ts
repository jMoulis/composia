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

export interface IStoreDefinition {
  data: any;
  storeKey: string;
  definition: IResourceDefinition | null;
}

export interface IStore {
  storeKey: string;
  query: IQueryDefinition; // requête pour récupérer les données
  data?: Record<string, any>; // données récupérées (optionnel)
}
export interface IPageVersion {
  _id: string; // identifiant unique de la version
  snapshot: IComponentNode; // état complet du composant racine
  published: boolean; // si cette version est publiée
  stores: IStore[]; // ressources utilisées par cette version
}
export interface IComponentNode {
  key: string; // identifiant unique dans l’arbre
  type: string; // ex: "form", "table", "input", "block", "tabs", "modal", etc.

  isFormContext?: boolean; // si le composant est dans un contexte de formulaire
  data?: IComponentData; // logique de ressource liée (optionnelle)
  props?: Record<string, any>; // options visuelles ou comportementales
  events?: Record<string, ITrigger | ITrigger[]>; // ex: onClick, onSubmit, onRowClick

  params?: Record<string, any>; // paramètres passés au composant

  bindings?: Record<string, string>; // injection descendante
  provides?: Record<string, string>; // exposition vers les enfants
  condition?: string; // ex: "role == 'admin'"

  children?: IComponentNode[]; // arbre récursif
}

export interface IStoreData {
  key: string;
  resourceId?: string; // identifiant de la ressource liée
  fieldKey?: string; // clé du champ à afficher
}
export interface IComponentData {
  source?: 'store' | 'query' | 'static' | 'api' | 'session' | 'params' | 'computed' | 'form';
  form?: {
    key: string; // clé du formulaire
    fieldKey?: string; // clé du champ à afficher
  }
  shouldResolvedSSR?: boolean; // si les données doivent être résolues côté serveur
  store?: IStoreData; // données liées à un store
  query?: IQueryDefinition;
  api?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
  }
  session?: {
    key: string; // clé de session
  }
  params?: {
    key: string; // clé de paramètre d’URL
  }
  computed?: string; // expression ou fonction de calcul
  staticData?: Array<{ label: string, value?: any }>; // valeur statique à afficher
  resolvedData?: Record<string, any>; // données résolues après interpolation
}


export interface IQueryDefinition {
  action: 'create' | 'update' | 'delete' | 'list' | 'aggregate' | 'get'; // action à exécuter
  collection: string; // nom de la collection Mongo
  data?: Record<string, any>; // données à envoyer (pour create/update)
  pipeline?: Record<string, any>[]; // pour les actions aggregate
  filter?: Record<string, any>; // pour les actions list/get
  options?: Record<string, any>; // options supplémentaires (ex: { returnDocument: "after" })
  bindings?: Record<string, string>; // pour injecter des valeurs dynamiques
  _id?: string; // identifiant unique de la requête (optionnel)
}
export interface ITriggerParams {
  query?: IQueryDefinition;
  [key: string]: any; // paramètres dynamiques passés au trigger
}
export interface ITrigger {
  type: string; // ex: "submitForm", "openComponent", "callApi", "showToast", etc.
  collection?: string; // pour les actions liées à une ressource
  params?: ITriggerParams; // options passées au trigger
  condition?: string; // ex: "formIsValid"
  expression?: string;
  inputSchema?: any; // ZodSchema ou JSONSchema pour valider les entrées
  expectedOutputSchema?: any; // ZodSchema ou JSONSchema pour valider les sorties
  outputTransform?: Record<string, string>;
  conditional?: {
    if?: {
      expression: string; // expression conditionnelle (ex: "role == 'admin'")
      triggers: ITrigger | ITrigger[];
    }; // condition d’exécution (ex: "role == 'admin'")
    else?: ITrigger | ITrigger[]; // actions alternatives si la condition n’est pas remplie
    elseif?: {
      expression: string; // expression conditionnelle (ex: "role == 'user'")
      triggers: ITrigger | ITrigger[];
    }[]; // liste d’alternatives
    try?: ITrigger | ITrigger[]; // bloc try
    catch?: ITrigger | ITrigger[]; // bloc catch
    finally?: ITrigger | ITrigger[]; // bloc finally
  },
  outputKey?: string; // clé pour stocker le résultat du trigger
  triggers?: ITrigger[]; // liste de triggers à exécuter
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
