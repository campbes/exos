/**
 * @license Copyright (c) 2013 Stuart Campbell | Licensed under The MIT License (MIT)
 */

var Exos = (function () {

    "use strict";

    var enabled = false,
        eventTypes = ["click", "mousedown", "mouseup", "mouseover", "mouseout", "mouseenter", "mouseleave", "keypress", "keydown", "keyup"],
        explicitEvents = ["focus", "blur", "change", "submit"],
        eventTypesLength = eventTypes.length,
        behaviours = null,
        body = document.body;

    var events = (function () {


        function checkEvent(type) {
            if (!type) {
                return null;
            }
            if (type.substr(0, 2) === "on") {
                type = type.substr(2);
            }
            return type;
        }

        function add(obj, type, fn) {
            if (obj && type && fn) {
                type = checkEvent(type);
                if (obj.addEventListener) {// Standard browsers
                    obj.addEventListener(type, fn, false);
                    return true;
                }
                if (obj.attachEvent) { // Microsoft
                    obj.attachEvent(type, fn);
                    return true;
                }
            }
            return false;
        }

        function removeAll(obj, type) {
            if (obj && type) {
                type = checkEvent(type);
                obj[type] = null;
                return true;
            }
            return false;
        }

        return {

            add: add,
            removeAll: removeAll

        };

    }());

    var objects = (function () {
        function isArray(obj) {
            return (typeof obj === "object" && obj.constructor === Array);
        }

        function copy(obj) {
            if (!obj || typeof obj !== "object") {
                return null;
            }
            var copied = (isArray(obj) ? [] : {}),
                i = null,
                val = null;

            for (i in obj) {
                if (obj.hasOwnProperty(i)) {
                    val = obj[i];
                    if (typeof val === "object" && val !== null) {
                        copied[i] = copy(val);
                    } else {
                        copied[i] = val;
                    }
                }
            }
            return copied;
        }

        function copyArray(arr) {
            return [].concat(arr);
        }

        function mergeArray(arr, newArr) {

            var merged = copyArray(arr),
                toMerge = copyArray(newArr),
                i = -1,
                j = -1;

            for (i = merged.length - 1; i >= 0; i--) {
                for (j = toMerge.length; j >= 0; j--) {
                    if (merged[i] === toMerge[j]) {
                        toMerge.splice(j, 1);
                    }
                }
            }
            return merged.concat(toMerge);
        }

        function merge(obj, newObj, cfg) {

            if (typeof obj !== "object") {
                return null;
            }
            if (typeof newObj !== "object") {
                // return the original untouched - log that this happened
                return obj;
            }
            cfg = cfg || {};

            var merged = copy(obj),
                i = null,
                val = null;

            for (i in newObj) {
                if (newObj.hasOwnProperty(i)) {
                    val = newObj[i];
                    if (String(typeof merged[i]) === String(typeof val)) {
                        if (isArray(val)) {
                            merged[i] = mergeArray(merged[i], copyArray(val));
                        } else if (typeof val === "object") {
                            merged[i] = merge(merged[i], copy(val), cfg);
                        } else {
                            merged[i] = val;
                        }
                    } else if (merged[i] === null || merged[i] === undefined || val === null || cfg.noTypeCheck) {
                        merged[i] = val;
                    }
                }
            }
            return merged;
        }

        return {

            copy: copy,
            merge: merge,
            copyArray: copyArray,
            mergeArray: mergeArray,
            isArray: isArray

        };

    }());

    function reportBehaviours() {
        Exos.behaviours = behaviours;
    }

    function get(type, ident, bType) {
        if (!behaviours) {
            return null;
        }
        var bhvr = behaviours[bType];
        if (!bhvr) {
            return null;
        }
        bhvr = bhvr[ident];
        if (!bhvr) {
            return null;
        }
        bhvr = bhvr[type];
        if (!bhvr) {
            return null;
        }
        return bhvr;
    }

    function preventDefault(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.returnValue = false;
    }

    function run(e, target, behaviour) {

        var prevDef = behaviour.preventDefault,
            func = behaviour.fn;

        if ((target.tagName === "A" && prevDef !== false) || prevDef) {
            preventDefault(e);
        }

        if (typeof func === "function") {
            func.apply(target, [e, target]);
        }

        return target;
    }

    function handle(e, target) {
        target = target || e.target || e.srcElement;

        var type = e.type,
            bhvrArray = null,
            bhvrArrayLength = -1,
            behaviour = null,
            bubble = null,
            breakchain = null,
            classes = "",
            classes_length = 0,
            i = -1,
            x = -1,
            parent = target.parentNode,
            related = e.relatedTarget,
            phase = null;

        function qualify(obj,el) {
            if(obj.id && obj.id !== el.id) {
                return false;
            }
            if(obj.className && obj.className !== el.className) {
                return false;
            }
            if(obj.tagName && obj.tagName !== el.tagName) {
                return false;
            }
            if(obj.attribute) {
                if(!el.hasAttribute(obj.attribute.key)) {
                    return false;
                }
                if(obj.attribute.value && obj.attribute.value !== target.getAttribute(obj.attribute.key)) {
                    return false;
                }
            }
            if(obj.parent) {
                return qualify(obj.parent,el.parentNode);
            }
            if(obj.ancestor) {
                var ancestor = el.parentNode;
                while(ancestor !== body) {
                    if(qualify(obj.ancestor,ancestor)) {
                        return true;
                    }
                    ancestor = ancestor.parentNode;
                }
                return false;
            }
            return true;
        }

        function runBehaviour(type) {
            if (!behaviour) {
                return false;
            }

            var qualified = qualify(behaviour,target);
            if(!qualified) {
                return false;
            }

            // when moving from node to child node, want to ensure mouseover/out
            // events are not fired
            if(behaviour.rel) {
                while(related !== null){
                    if(related === target){
                        return false;
                    }
                    related = related.parentNode;
                }
            }

            run(e, target, behaviour);

            // bubble starts as null (which in this context means "default" - bubble up
            // a behaviour explicitly sets it to true, or implicitly sets it to false
            // once its been set by a behaviour, it cannot be overridden by a subsequent behaviour in the same chain -
            // because behaviours are executed in order of specificity - id > class > tag
            // if there are multiple behaviours of the same type (eg id), then bubble can be overridden (where true
            // will always win)
            if (bubble === null) {
                bubble = behaviour.bb || false;
            }
            if(behaviour.bb && type === phase) {
                bubble = behaviour.bb;
            }
            // breakchain only needs setting if true
            breakchain = behaviour.bc;

            // set the phase as the last action of running a behaviour
            phase = type;

            return true;
        }

        // if its got an id, use it. Good chance this handler will kill the event so only carry on if it doesn't
        if (target.id) {
            bhvrArray = [].concat(get(type, target.id, "id"));
            bhvrArrayLength = bhvrArray.length;
            for(x =0; x<bhvrArrayLength; x++) {
                behaviour = bhvrArray[x];
                runBehaviour("id");
            }
        }

        if (!breakchain && target.className) {
            classes = target.className.split(" ");
            classes_length = classes.length;
            for (i = 0; i < classes_length; i += 1) {
                if (breakchain) {
                    break;
                }
                bhvrArray = [].concat(get(type, classes[i], "className"));
                bhvrArrayLength = bhvrArray.length;
                for(x =0; x<bhvrArrayLength; x++) {
                    behaviour = bhvrArray[x];
                    runBehaviour("className");
                }
            }
        }
        if (!breakchain) {
            bhvrArray = [].concat(get(type, target.tagName, "tagName", target));
            bhvrArrayLength = bhvrArray.length;
            for(x =0; x<bhvrArrayLength; x++) {
                behaviour = bhvrArray[x];
                runBehaviour("tagName");
            }
        }

        // bubble up unless the bubble has been set to false by a behaviour
        if (target !== body && parent && bubble !== false) {
            handle(e, parent);
        }
    }

    function setExplicit(bhvrs, rem) {
        // set the unique handlers that can't be handled by the behaviour layer
        var idbhvrs = bhvrs.id,
            i = null,
            el = null,
            j = -1,
            evt = null;

        for (i in idbhvrs) {
            if (idbhvrs.hasOwnProperty(i)) {
                el = document.getElementById(i);
                if (!el) {
                    continue;
                }
                for (j = explicitEvents.length - 1; j >= 0; j -= 1) {
                    evt = explicitEvents[j];
                    if (idbhvrs[i].hasOwnProperty(evt)) {
                        if (rem) {
                            events.removeAll(el, evt);
                        } else {
                            events.add(el, evt, handle);
                        }
                    }
                }
            }
        }
    }

    function init() {
        var i = null;
        for (i = eventTypesLength; i >= 0; i--) {
            events.add(body, eventTypes[i], handle);
        }
        setExplicit(behaviours, false);
    }

    function destroy() {
        var i = null;
        for (i = eventTypesLength; i >= 0; i--) {
            events.removeAll(body, eventTypes[i]);
        }
        setExplicit(behaviours, true);
    }

    function disable(purge) {
        if (!enabled) {
            return false;
        }
        destroy();
        if (purge) {
            behaviours = null;
        }
        enabled = false;
        reportBehaviours();
        return true;
    }

    function isEnabled() {
        return enabled;
    }

    function interpret(cfg) {

        var bhvrs = {};
        var cfgLength = cfg.length;
        var i = null,
            j = null,
            n = null,
            x = null,
            y = null,
            cfgItem = null,
            bhvrsItem = null,
            bhvrArray = null,
            bhvr = null,
            interpreted = null,
            selObj = null,
            primarySel = null,
            evtType = null;

        for (i = 0; i <= cfgLength; i++) {
            cfgItem = cfg[i];
            for (j in cfgItem) {
                if (cfgItem.hasOwnProperty(j)) {
                    interpreted = Exos.interpreter.interpret(j);
                    for(n=interpreted.length-1; n>=0; n--){
                        bhvrsItem = null;
                        selObj = interpreted[n];
                        primarySel = null;
                        if(selObj.id) {
                            primarySel = "id";
                        } else if (selObj.className) {
                            primarySel = "className";
                        } else if (selObj.tagName) {
                            primarySel = "tagName";
                        }
                        if(!bhvrs[primarySel]) {
                            bhvrs[primarySel] = {};
                        }
                        if(!bhvrs[primarySel][selObj[primarySel]]) {
                            bhvrs[primarySel][selObj[primarySel]] = {};
                        }

                        bhvrsItem = bhvrs[primarySel][selObj[primarySel]];

                        for (x = eventTypes.length - 1; x >= 0; x--) {
                            evtType = eventTypes[x];
                            bhvrArray = cfgItem[j][evtType];

                            if(!objects.isArray(bhvrArray)) {
                                bhvrArray = [bhvrArray];
                            }

                            for(y = 0; y<bhvrArray.length; y++) {
                                bhvr = bhvrArray[y];

                                if (typeof bhvr === "function") {
                                    bhvr = {
                                        fn : bhvr
                                    };
                                }
                                if (bhvr) {
                                    if(!bhvrsItem[evtType]) {
                                        bhvrsItem[evtType] = [];
                                    }
                                    if(primarySel !== "className" && selObj.className) {
                                        bhvr.className = selObj.className;
                                    }
                                    if(primarySel !== "tagName" && selObj.tagName) {
                                        bhvr.tagName = selObj.tagName;
                                    }
                                    if(selObj.attribute) {
                                        bhvr.attribute = selObj.attribute;
                                    }
                                    if(selObj.parent) {
                                        bhvr.parent = selObj.parent;
                                    } else if(selObj.ancestor) {
                                        bhvr.ancestor = selObj.ancestor;
                                    }
                                    bhvrsItem[evtType].push(bhvr);
                                }
                            }
                        }
                    }
                }
            }
        }
        return bhvrs;
    }

    function tweakEventSupport(bhvrs) {

        var i, j, bhvrType, bhvr;

        if(!document.body.addEventListener) {
            return bhvrs;
        }

        function modify(bhvr,type,replaceType) {
            if(!bhvr[type]) {
                return;
            }
            for(var i=bhvr[type].length-1; i>=0; i--) {
                bhvr[type][i].rel = true;

            }
            bhvr[replaceType] = bhvr[replaceType] || [];
            bhvr[replaceType] = objects.merge(bhvr[replaceType],bhvr[type]);
            delete bhvr[type];
        }

        for( i in bhvrs) {
            if(bhvrs.hasOwnProperty(i)) {
                bhvrType = bhvrs[i];
                for( j in bhvrType) {
                    if(bhvrType.hasOwnProperty(j)) {
                        bhvr = bhvrType[j];
                        modify(bhvr,"mouseenter","mouseover");
                        modify(bhvr,"mouseleave","mouseout");
                    }
                }
            }
        }

        return bhvrs;
    }

    function convertBhvrFormat(bhvrs) {

        var i = 0,
            j = 0,
            k = 0,
            selType = null,
            ident = null;

        for(i in bhvrs) {
            if(bhvrs.hasOwnProperty(i)) {
                selType = bhvrs[i];
                for(j in selType) {
                    if(selType.hasOwnProperty(j)) {
                        ident = selType[j];
                        for(k in ident) {
                            if(ident.hasOwnProperty(k)) {
                                if(!objects.isArray(ident[k])) {
                                    ident[k] = [ident[k]];
                                }
                            }
                        }
                    }
                }
            }
        }

        return bhvrs;
    }

    function add(bhvrs) {
        if (objects.isArray(bhvrs)) {
            bhvrs = interpret(bhvrs);
        }
        bhvrs = tweakEventSupport(bhvrs);
        bhvrs = convertBhvrFormat(bhvrs);
        behaviours = objects.merge(behaviours, bhvrs);
        if (isEnabled()) {
            setExplicit(bhvrs, false);
        }
        reportBehaviours();
    }

    function enable(bhvrs) {

        if (enabled && bhvrs) {
            add(bhvrs);
            return true;
        }

        if (objects.isArray(bhvrs)) {
            bhvrs = interpret(bhvrs);
        }

        // here's where to do the tweak for mouseenter/leave - change to mouseover/out
        // and set the "related" flag
        bhvrs = tweakEventSupport(bhvrs);

        // convert old style single behaviours into behaviour arrays - maintain backwards compatibility
        bhvrs = convertBhvrFormat(bhvrs);

        var win = window;
        behaviours = bhvrs || {};
        if (body) {
            init();
        } else {
            events.add(win, "load", init);
        }
        events.add(win, "unload", destroy);
        enabled = true;
        reportBehaviours();
        return true;
    }


    return {

        isEnabled: isEnabled,
        enable: enable,
        disable: disable,
        add: add,
        behaviours: null

    };

}());