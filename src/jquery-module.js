jQuery.module = {
    _loaded: {},
    _dir: ""
};

jQuery.fn.module = function(moduleUri, options, callback) {
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

                if (typeof callback == "function") {
                    callback(true);
                }
            })
            .fail(function(jqxhr, settings, exception) {
                $(document).trigger("jqueryModuleLoadFail", [moduleName]);

                if (typeof callback == "function") {
                    callback(false);
                }
            });
    }

    var destroyCallback = [];

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

    return function() {
        setTimeout(function() {
            $.each(destroyCallback, function(index, value) {
                value();
            });
        }, 0);
    }
}
