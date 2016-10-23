jQuery.module = jQuery.module || {
    _loaded: {},
    _dir: ""
};

jQuery.fn.module = jQuery.fn.module || function(moduleUri, options, parentDestroyCallback) {
    if (moduleUri.slice(-3) == ".js") {
        moduleUri = moduleUri.slice(0, moduleUri.length - 3);
    }

    var moduleName = moduleUri.split("/");
    moduleName = moduleName[moduleName.length - 1];

    var callbackList = [];

    if ( ! jQuery.module._loaded[moduleName]) {
        
        var moduleUrl = jQuery.module._dir + moduleUri + ".js";

        $(document).trigger("jqueryModuleLoadStart", [moduleUrl]);

        $.getScript(moduleUrl)
            .done(function(script, textStatus) {

                jQuery.each(callbackList, function(index, value) {
                    value();
                });

                $(document).trigger("jqueryModuleLoadSuccess", [moduleUrl]);
                jQuery.module._loaded[moduleName] = true;
            })
            .fail(function(jqxhr, settings, exception) {
                $(document).trigger("jqueryModuleLoadFail", [moduleUrl]);
            });
    } else {
        setTimeout(function() {
            jQuery.each(callbackList, function(index, value) {
                value();
            });
        }, 0);
    }

    destroyCallback = [];

    this.each(function() {
        var _self = this;

        callbackList.push(function() {
            if (jQuery.module[moduleName]) {
                if (typeof options == "function") {
                    calledOptions = options();
                } else {
                    calledOptions = options;
                }

                jQuery.module[moduleName](_self, calledOptions, destroyCallback);
            }
        });
    });

    var doDestroyCallback = function() {
        setTimeout(function() {
            $.each(destroyCallback, function(index, value) {
                if (parentDestroyCallback) {
                    var parentDestroyCallbackIndex = parentDestroyCallback.indexOf(value);

                    if (parentDestroyCallbackIndex != -1) {
                        parentDestroyCallback.splice(parentDestroyCallbackIndex, 1);
                    }
                }

                value();
            });
        }, 0);
    }

    if (parentDestroyCallback) {
        parentDestroyCallback.unshift(doDestroyCallback);
    }

    var destroyModulesArray = this.data("destroyModules") || [];
    destroyModulesArray.unshift(doDestroyCallback);
    this.data("destroyModules", destroyModulesArray);

    return doDestroyCallback;
}

jQuery.fn.destroyModules = function() {
    var destroyCallback = this.data("destroyModules");

    if (destroyCallback) {
        $.each(destroyCallback, function(index, value) {
            value();
        });

        this.data("destroyModules", []);
    }

    return this;
}
