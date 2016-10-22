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

    return this.each(function() {
        var _self = this;

        var loadSuccess = function() {
            if (jQuery.module[moduleName]) {
                if (typeof options == "function") {
                    jQuery.module[moduleName](_self, options(_self));
                } else {
                    jQuery.module[moduleName](_self, options);
                }
            }
        }

        if (jQuery.module._loaded[moduleName]) {
            loadSuccess();
        } else {
            jQuery.module._loaded[moduleName] = true;
            $(document).trigger("jqueryModuleLoadStart", [moduleName]);

            $.getScript(jQuery.module._dir + moduleUri + ".js")
                .done(function(script, textStatus) {
                    loadSuccess();
                    $(document).trigger("jqueryModuleLoadSuccess", [moduleName]);

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
    });
}
