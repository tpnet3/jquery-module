jQuery.module = {
    _loaded: {},
    _dir: ""
};

jQuery.fn.module = function(moduleUri, options, parentDestroyCallback) {
    if (moduleUri.slice(-3) == ".js") {
        moduleUri = moduleUri.slice(0, moduleUri.length - 3);
    }

    var moduleName = moduleUri.split("/");
    moduleName = moduleName[moduleName.length - 1];

    var callbackList = [];

    if ( ! jQuery.module._loaded[moduleName]) {
        $(document).trigger("jqueryModuleLoadStart", [moduleName]);

        $.getScript(jQuery.module._dir + moduleUri + ".js")
            .done(function(script, textStatus) {

                jQuery.each(callbackList, function(index, value) {
                    value();
                });

                $(document).trigger("jqueryModuleLoadSuccess", [moduleName]);
                jQuery.module._loaded[moduleName] = true;
            })
            .fail(function(jqxhr, settings, exception) {
                $(document).trigger("jqueryModuleLoadFail", [moduleName]);
            });
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
                var parentDestroyCallbackIndex = parentDestroyCallback.indexOf(value);

                if (parentDestroyCallbackIndex != -1) {
                    parentDestroyCallback.splice(parentDestroyCallbackIndex, 1);
                }

                value();
            });
        }, 0);
    }

    if (parentDestroyCallback) {
        parentDestroyCallback.unshift(doDestroyCallback);
    }

    return doDestroyCallback;
}
