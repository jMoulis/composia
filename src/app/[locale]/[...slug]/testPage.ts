import { IPageVersion } from "../admin/engine/interfaces";

export const testPage: IPageVersion = {
  "_id": "684d9279832dfa32ec43fdb2",
  "stores": [
    {
      "storeKey": "youths",
      "query": {
        "action": "list",
        "collection": "youths"
      }
    }
  ],
  "published": true,
  "snapshot": {
    "key": "list-block",
    "type": "block",
    "children": [
      {
        "key": "test-api-button",
        "type": "button",
        "params": {
          "label": "Test API Call",
        },
        "props": {
          "className": "bg-blue-500 text-white hover:bg-blue-600"
        },
        "events": {
          "onClick": [
            {
              "type": "callApi",
              "params": {
                "url": "/api/youths/update",
                "method": "POST",
                "body": "{{values}}"
              },
              "inputSchema": {
                "type": "object",
                "properties": {
                  "body": {
                    "type": "object",
                    "required": [
                      "_id",
                      "firstname",
                      "lastname"
                    ],
                    "properties": {
                      "_id": {
                        "type": "string"
                      },
                      "firstname": {
                        "type": "string"
                      },
                      "lastname": {
                        "type": "string"
                      }
                    }
                  }
                },
                "required": [
                  "body"
                ]
              },
              "expectedOutputSchema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "_id": {
                        "type": "string"
                      },
                      "message": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "_id",
                      "message"
                    ]
                  }
                },
                "required": [
                  "success",
                  "data"
                ]
              },
              "outputKey": "apiResponse",
              "outputTransform": {
                "success": "{{success}}",
                "message": "{{data.message}}",
                "updatedYouthId": "{{data._id}}"
              },
              "conditional": {
                "if": {
                  "expression": "!results.apiResponse || results.apiResponse.success === false",
                  "triggers": [
                    {
                      "type": "showToast",
                      "params": {
                        "variant": "warning",
                        "message": "L'API a répondu sans succès"
                      }
                    }
                  ]
                },
                "else": {
                  "type": "showToast",
                  "params": {
                    "variant": "success",
                    "message": "Jeune mis à jour avec succès {{results.apiResponse.message}}"
                  }
                }
              }
            },
            {
              "type": "parallel",
              "triggers": [
                {
                  "type": "callApi",
                  "params": {
                    "url": "/api/notifications",
                    "method": "POST",
                    "body": {
                      "userId": "{{results.apiResponse.updatedYouthId}}",
                      "message": "Votre fiche a été mise à jour avec succès"
                    }
                  },
                  "inputSchema": {
                    "type": "object",
                    "properties": {
                      "body": {
                        "type": "object",
                        "properties": {
                          "userId": {
                            "type": "string"
                          },
                          "message": {
                            "type": "string"
                          }
                        },
                        "required": [
                          "userId",
                          "message"
                        ]
                      }
                    },
                    "required": [
                      "body"
                    ]
                  },
                  "expectedOutputSchema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean"
                      },
                      "data": {
                        "type": "array",
                        "properties": {
                          "id": {
                            "type": "string"
                          },
                          "message": {
                            "type": "string"
                          },
                          "read": {
                            "type": "boolean"
                          }
                        },
                        "required": [
                          "id",
                          "message",
                          "read"
                        ]
                      }
                    },
                    "required": [
                      "data"
                    ]
                  },
                  "outputKey": "notificationResponse",
                  "outputTransform": {
                    "notificationCount": "$js(data.length)",
                    "notificationIds": "$js(data.map(item => item.id))"
                  }
                },
                {
                  "type": "executeDatabaseAction",
                  "params": {
                    "query": {
                      "action": "create",
                      "collection": "histories",
                      "data": {
                        "youthId": "{{results.apiResponse.updatedYouthId}}",
                        "action": "update",
                        "date": "{{now}}",
                        "details": "{{values}}"
                      }
                    }
                  },
                  "inputSchema": {
                    "type": "object",
                    "properties": {
                      "query": {
                        "type": "object",
                        "properties": {
                          "action": {
                            "type": "string",
                            "enum": [
                              "create"
                            ]
                          },
                          "collection": {
                            "type": "string",
                            "enum": [
                              "histories"
                            ]
                          },
                          "data": {
                            "type": "object",
                            "properties": {
                              "youthId": {
                                "type": "string"
                              },
                              "action": {
                                "type": "string"
                              },
                              "date": {
                                "type": "string",
                                "format": "date-time"
                              },
                              "details": {
                                "type": "object"
                              }
                            },
                            "required": [
                              "youthId",
                              "action",
                              "date"
                            ]
                          }
                        },
                        "required": [
                          "action",
                          "collection",
                          "data"
                        ]
                      }
                    },
                    "required": [
                      "query"
                    ]
                  },
                  "expectedOutputSchema": {
                    "type": "object",
                    "properties": {
                      "success": {
                        "type": "boolean"
                      },
                      "data": {
                        "type": "object"
                      }
                    },
                    "required": [
                      "success"
                    ]
                  },
                  "outputKey": "historyResponse"
                }
              ]
            },
            {
              "type": "log",
              "params": {
                "message": "API call completed",
                "data": "{{results}}"
              }
            }
          ]
        }
      },
      {
        "type": "form",
        "key": "form-test",
        "events": {
          "onSubmit": [
            {
              "type": "showToast",
              "params": {
                "variant": "success",
                "message": "{{values}}"
              }
            }
          ]
        },
        "children": [
          {
            "type": "select",
            "key": "select-theme",
            "params": {
              "label": "Sélectionnez un thème",
            },
            "props": {
              "className": "w-full",
              "placeholder": "Thème",
              "name": "select-theme"
            },
            "events": {
              "onChange": [
                {
                  "type": "showToast",
                  "params": {
                    "variant": "info",
                    "message": "Thème sélectionné : {{select-theme}}"
                  }
                },
                {
                  "type": "executeDatabaseAction",
                  "params": {
                    "query": {
                      "action": "list",
                      "collection": "sub-themes",
                      "filter": {
                        "parent": "{{select-theme}}"
                      },
                    }
                  },
                  "outputKey": "select-theme-query"
                },
                {
                  "type": "updateStore",
                  "params": {
                    "action": "set",
                    "storeName": "select-theme-query",
                    "data": "{{results.select-theme-query.data}}",
                    "dataType": "array"
                  }
                },
                {
                  "type": "log",
                  "params": {
                    "message": "Thème sélectionné",
                    "data": "{{results.select-theme-query.data}}",
                    "value": "{{value}}"
                  }
                }
              ]
            },
            "data": {
              "shouldResolvedSSR": true,
              "source": "static",
              "staticData": [{
                "label": "Light",
                "value": "light"
              }, {
                "label": "Dark",
                "value": "dark"
              }, {
                "label": "System",
                "value": "system"
              }]
            }
          },
          {
            "type": "select",
            "key": "select-theme-query",
            "params": {
              "label": "Sélectionnez un sous-thème"
            },
            "props": {
              "name": "select-theme-query",
              "className": "w-full",
              "placeholder": "Sous-thème",
            },
            "events": {
              "onChange": [
                {
                  "type": "showToast",
                  "params": {
                    "variant": "info",
                    "message": "Thème sélectionné : {{select-theme-query}}"
                  }
                }
              ]
            },
            "data": {
              "source": "store",
              "store": {
                "key": "select-theme-query"
              }
            }
          },
          {
            "key": "input-firstname",
            "type": "input",
            "props": {
              "name": "firstname",
              "placeholder": "Prénom",
              "className": "w-full"
            },
            "params": {
              "label": "Prénom"
            }
          },
          {
            "key": "input-lastname",
            "type": "input",
            "props": {
              "name": "lastname",
              "placeholder": "Nom",
              "className": "w-full"
            },
            "params": {
              "label": "Nom"
            }
          },
          {
            "key": "admin",
            "type": "checkbox",
            "props": {
              "name": "admin",
              "className": "flex-row"
            },
            "params": {
              "label": "Is admin"
            }
          },
          {
            "key": "date-input",
            "type": "date",
            "props": {
              "name": "dateOfBirth",
            },
            "params": {
              "label": "Date de naissance"
            }
          },
          {
            "key": "radio-group",
            "type": "radio",
            "props": {
              "name": "gender",
            },
            "params": {
              "label": "Genre"
            },
            "data": {
              "source": "static",
              "staticData": [
                { "label": "Homme", "value": "male" },
                { "label": "Femme", "value": "female" },
                { "label": "Autre", "value": "other" }
              ]
            }
          },
          {
            "key": "textarea-notes",
            "type": "textarea",
            "props": {
              "name": "notes",
              "placeholder": "Notes",
              "className": "w-full"
            },
            "params": {
              "label": "Notes"
            }
          },
          {
            "key": "switch",
            "type": "switch",
            "props": {
              "name": "present"
            },
            "params": {
              "label": "Présence"
            }
          },
          {
            "key": "slider",
            "type": "slider",
            "props": {
              "name": "sliderValue",
              "min": 0,
              "max": 100,
              "step": 1,
              "defaultValue": 50,
            },
            "params": {
              "label": "Présence"
            }
          },
          {
            "key": "select-multi",
            "type": "multi-checkbox",
            "props": {
              "name": "interests",
            },
            "params": {
              "label": "Centres d'intérêt"
            },
            "data": {
              "source": "static",
              "staticData": [
                { "label": "Sport", "value": "sport" },
                { "label": "Musique", "value": "music" },
                { "label": "Art", "value": "art" },
                { "label": "Technologie", "value": "technology" },
                { "label": "Voyage", "value": "travel" }
              ]
            }
          },
          {
            "key": "submit-btn",
            "type": "button",
            "props": {
              "type": "submit",
              "className": "bg-green-500 text-white hover:bg-green-600"
            },
            "params": {
              "label": "Submit Form"
            }
          }
        ]
      },

      {
        "key": "list-youths",
        "type": "list",
        "props": {
          "itemAlias": "youth",
          "indexAlias": "youthListIndex"
        },
        "data": {
          "source": "store",
          "shouldResolvedSSR": false,
          "store": {
            "key": "youths"
          }
        },
        "children": [
          {
            "key": "list-item",
            "type": "block",
            "bindings": {
              "youth": "stores.youths.data.[youthListIndex]"
            },
            "children": [
              {
                "key": "text-firstname",
                "type": "text",
                "params": {
                  "text": "{{youth.firstname}}"
                }
              },
              {
                "key": "dialog-button",
                "type": "dialog",
                "props": {
                  "triggerText": "Voir {{youth.firstname}}",
                  "description": "Edit detail youth",
                  "title": "Modifier le jeune"
                },
                "children": [
                  {
                    "key": "form-edit",
                    "type": "form",
                    "data": {
                      "source": "store",
                      "store": {
                        "key": "youths",
                        "resourceId": "youths"
                      }
                    },
                    "props": {
                      "formData": "{{youth}}"
                    },
                    "events": {
                      "onSubmit": [
                        {
                          "type": "executeDatabaseAction",
                          "params": {
                            "query": {
                              "action": "update",
                              "collection": "youths",
                              "filter": {
                                "_id": "{{youth._id}}"
                              },
                              "data": {
                                "$set": "{{values}}"
                              },
                              "options": {
                                "upsert": false,
                                "returnDocument": "after"
                              }
                            }
                          },
                          "inputSchema": {
                            "type": "object",
                            "properties": {
                              "query": {
                                "type": "object",
                                "properties": {
                                  "action": {
                                    "type": "string",
                                    "enum": [
                                      "update"
                                    ]
                                  },
                                  "collection": {
                                    "type": "string",
                                    "enum": [
                                      "youths"
                                    ]
                                  },
                                  "data": {
                                    "type": "object",
                                    "properties": {
                                      "$set": {
                                        "type": "object",
                                        "properties": {
                                          "firstname": {
                                            "type": "string"
                                          },
                                          "lastname": {
                                            "type": "string"
                                          }
                                        },
                                        "required": [
                                          "firstname",
                                          "lastname"
                                        ]
                                      }
                                    },
                                    "required": [
                                      "$set"
                                    ]
                                  }
                                },
                                "required": [
                                  "action",
                                  "collection",
                                  "data"
                                ]
                              }
                            },
                            "required": [
                              "query"
                            ]
                          },
                          "outputTransform": {
                            "updatedYouth": "{{response.data}}"
                          },
                          "expectedOutputSchema": {
                            "type": "object",
                            "properties": {
                              "success": {
                                "type": "boolean"
                              },
                              "response": {
                                "type": "object",
                                "properties": {
                                  "data": {
                                    "type": "object",
                                    "properties": {
                                      "_id": {
                                        "type": "string"
                                      },
                                      "firstname": {
                                        "type": "string"
                                      },
                                      "lastname": {
                                        "type": "string"
                                      }
                                    },
                                    "required": [
                                      "_id",
                                      "firstname",
                                      "lastname"
                                    ]
                                  }
                                },
                                "required": [
                                  "data"
                                ]
                              }
                            },
                            "required": [
                              "success",
                              "response"
                            ]
                          },
                          "conditional": {
                            "if": {
                              "expression": "results.updatedYouth._id",
                              "triggers": [
                                {
                                  "type": "showToast",
                                  "params": {
                                    "variant": "success",
                                    "message": "{{results.updatedYouth.firstname}} mis à jour avec succès"
                                  }
                                },
                                {
                                  "type": "updateStore",
                                  "params": {
                                    "action": "update",
                                    "dataType": "array",
                                    "storeName": "youths",
                                    "index": "{{youthListIndex}}",
                                    "data": "{{values}}"
                                  }
                                }
                              ]
                            },
                            "else": {
                              "type": "showToast",
                              "params": {
                                "variant": "error",
                                "message": "Échec de la mise à jour"
                              }
                            }
                          }
                        },
                        {
                          "type": "log",
                          "params": {
                            "message": "Form submitted",
                            "data": "{{results.updatedYouth}}"
                          }
                        }
                      ]
                    },
                    "children": [
                      {
                        "key": "form-group-firstName",
                        "type": "block",
                        "children": [
                          {
                            "key": "label-firstName",
                            "type": "text",
                            "params": {
                              "text": "Prénom"
                            }
                          },
                          {
                            "key": "input-firstName",
                            "type": "input",
                            "props": {
                              "name": "firstname"
                            }
                          }
                        ]
                      },
                      {
                        "key": "form-group-lastName",
                        "type": "block",
                        "children": [
                          {
                            "key": "label-lastName",
                            "type": "text",
                            "params": {
                              "text": "Nom"
                            }
                          },
                          {
                            "key": "input-lastName",
                            "type": "input",
                            "props": {
                              "name": "lastname"
                            }
                          }
                        ]
                      },
                      {
                        "key": "submit-btn",
                        "type": "button",
                        "props": {
                          "type": "submit"
                        },
                        "params": {
                          "label": "Mettre à jour"
                        },
                        "children": []
                      },
                      {
                        "key": "delete-btn",
                        "type": "button",
                        "params": {
                          "label": "Supprimer"
                        },
                        "props": {
                          "type": "button",
                          "className": "bg-red-500 text-white hover:bg-red-600"
                        },
                        "events": {
                          "onClick": [
                            {
                              "type": "executeDatabaseAction",
                              "params": {
                                "query": {
                                  "action": "delete",
                                  "collection": "youths",
                                  "_id": "{{youth._id}}"
                                }
                              }
                            },
                            {
                              "type": "showToast",
                              "params": {
                                "message": "Jeune édité avec succès",
                                "variant": "success"
                              }
                            },
                            {
                              "type": "updateStore",
                              "params": {
                                "action": "delete",
                                "storeName": "youths",
                                "index": "{{youthListIndex}}"
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}

