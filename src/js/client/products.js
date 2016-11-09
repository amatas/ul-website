// Basic "products" component for the Unified Listing
/* global fluid */
(function () {
    "use strict";

    // The wrapper component that wires together all controls.
    fluid.defaults("gpii.ul.products", {
        gradeNames: ["gpii.handlebars.ajaxCapable", "gpii.handlebars.templateAware"],
        ajaxOptions: {
            url:      "/api/products",
            method:   "GET",
            dataType: "json",
            headers: {
                accept: "application/json"
            }
        },
        rules: {
            successResponseToModel: {
                "":           "notfound",
                products:     "responseJSON.products", // The "products" component will handle displaying products.
                totalRows:    "responseJSON.products.length",
                errorMessage: { literalValue: false }
            },
            errorResponseToModel: {
                successMessage: { literalValue: false },
                totalRows:      { literalValue: 0 },
                products:       { literalValue: [] }
            },
            modelToRequestPayload: {
                "": {
                    transform: {
                        type: "gpii.ul.transforms.filterAndEncode",
                        inputPath: ""
                    }
                }
            }
        },
        params: {
            status:         [ "new", "active", "discontinued", "deleted"],
            sortBy:         "/name",
            unified:        true,
            includeSources: true
        },
        model: {
            status:         "{that}.options.params.status",
            sortBy:         "{that}.options.params.sortBy",
            offset:         0,
            limit:          25,
            totalRows:      0,
            unified:        "{that}.options.params.unified",
            includeSources: "{that}.options.params.includeSources",
            sources:        "{that}.options.params.sources",
            products:       []
        },
        modelListeners: {
            products: {
                func: "{that}.applier.change",
                args: ["totalRows", "{that}.model.products.length"]
            },
            sortBy: {
                func: "{that}.makeRequest",
                excludeSource: "init"
            },
            status: {
                func: "{that}.makeRequest",
                excludeSource: "init"
            }
        },
        components: {
            // The component that relays changes between the URL, browser history, and model
            relay: {
                type: "gpii.locationBar",
                options: {
                    model: {
                        "sources":        "{gpii.ul.products}.model.sources",
                        "status":         "{gpii.ul.products}.model.status",
                        "sortBy":         "{gpii.ul.products}.model.sortBy",
                        "unified":        "{gpii.ul.products}.model.unified",
                        "includeSources": "{gpii.ul.products}.model.includeSources"
                    }
                }
            },
            // The products, if any
            products: {
                type:          "gpii.ul.productsTable",
                createOnEvent: "{gpii.ul.products}.events.onDomChange",
                container:     "{gpii.ul.products}.dom.products",
                options: {
                    model: {
                        products: "{gpii.ul.products}.model.products",
                        offset:   "{gpii.ul.products}.model.offset",
                        limit:    "{gpii.ul.products}.model.limit"
                    },
                    listeners: {
                        "onCreate.pageAndRender": {
                            func: "{that}.pageAndRender"
                        }
                    }
                }
            },
            // The top pagination bar.
            topnav: {
                type:          "gpii.ul.navbar",
                createOnEvent: "{gpii.ul.products}.events.onDomChange",
                container:     "{gpii.ul.products}.dom.topnav",
                options: {
                    listeners: {
                        "onCreate.pageAndRender": {
                            func: "{topnav}.generatePagingData"
                        }
                    },
                    model: {
                        totalRows: "{gpii.ul.products}.model.totalRows",
                        offset:    "{gpii.ul.products}.model.offset",
                        limit:     "{gpii.ul.products}.model.limit"
                    }
                }
            },
            // The bottom pagination bar
            bottomnav: {
                type:          "gpii.ul.navbar",
                createOnEvent: "{gpii.ul.products}.events.onDomChange",
                container:     "{gpii.ul.products}.dom.bottomnav",
                options: {
                    listeners: {
                        "onCreate.pageAndRender": {
                            func: "{bottomnav}.generatePagingData"
                        }
                    },
                    model: {
                        totalRows: "{gpii.ul.products}.model.totalRows",
                        offset:    "{gpii.ul.products}.model.offset",
                        limit:     "{gpii.ul.products}.model.limit"
                    }
                }
            },
            // The sort controls
            sortBy: {
                type:          "gpii.ul.sortBy",
                createOnEvent: "{gpii.ul.products}.events.onDomChange",
                container:     "{gpii.ul.products}.dom.sortBy",
                options: {
                    model: {
                        select:   "{gpii.ul.products}.model.sortBy"
                    }
                }
            },
            // The status filtering controls
            status: {
                type:          "gpii.ul.statuses",
                createOnEvent: "{gpii.ul.products}.events.onDomChange",
                container:     "{gpii.ul.products}.dom.status",
                options: {
                    model: {
                        checkboxValue: "{gpii.ul.products}.model.status"
                    }
                }
            },
            // The "products per page" controls
            limit: {
                type:          "gpii.ul.limit",
                createOnEvent: "{gpii.ul.products}.events.onDomChange",
                container:     "{gpii.ul.products}.dom.limit",
                options: {
                    model: {
                        select:   "{gpii.ul.products}.model.limit"
                    }
                }
            },
            // A toggle to show/hide our options
            optionsToggle: {
                type: "gpii.ul.toggle",
                createOnEvent: "{gpii.ul.products}.events.onDomChange",
                container:     "{gpii.ul.products}.container",
                options: {
                    selectors: {
                        toggle:    ".products-options-toggle",
                        container: ".products-options"
                    },
                    toggles: {
                        container: true
                    },
                    listeners: {
                        "onCreate.applyBindings": "{that}.events.onRefresh"
                    }
                }
            }
        },
        selectors: {
            initial:   ".products-viewport",
            success:   ".products-success",
            error:     ".products-error",
            form:      ".products-query",
            topnav:    ".products-topnav",
            products:  ".products-products",
            sortBy:    ".products-sortBy",
            status:    ".products-statuses",
            limit:     ".products-limit",
            bottomnav: ".products-bottomnav"
        },
        templates: {
            "initial": "products-viewport"
        },
        invokers: {
            renderInitialMarkup: {
                func: "{that}.renderMarkup",
                args: [ "initial", "{that}.options.templates.initial", "{that}.model"]
            }
        }
    });

    fluid.defaults("gpii.ul.products.hasUserControls", {
        gradeNames: ["gpii.ul.products", "gpii.ul.hasUserControls"]
    });
})();
