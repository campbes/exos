/*global Exos, Slick*/

Exos.interpreter = (function(){

    "use strict";

    function construct(exp,expSet,index) {
        var res = {},
            attrs = exp.attributes,
            attr = null,
            prev = index-1;
        if(exp.tag !== "*") {
            res.tagName = exp.tag.toUpperCase();
        }
        if (exp.id) {
            res.id = exp.id;
        }
        if(exp.classList) {
            res.className = exp.classList[0];
        }
        if(attrs) {
            attr = attrs[0];
            res.attribute = {
                key : attr.key,
                operator : attr.operator,
                value : attr.value
            };
        }
        if(exp.combinator === ">") {
            res.parent = construct(expSet[prev],expSet,prev);
        } else if(exp.combinator === " " && index > 0) {
            res.ancestor = construct(expSet[prev],expSet,prev);
        }
        return res;
    }

    function interpret(sel) {
        var slick = Slick.parse(sel),
            exps = slick.expressions,
            expsLength = exps.length,
            i = null,
            j = null,
            expSet = null,
            expSetLength = null,
            exp = null,
            results = [];

        for(i=0; i<expsLength; i++) {
            expSet = exps[i];
            expSetLength = expSet.length;
            for(j=expSetLength-1; j>=0; j--) {
                exp = expSet[j];
                if(expSetLength === 1 || j === expSetLength-1 || exp.combinator === ",") {
                    results[results.length] = construct(exp,expSet,j);
                }
            }

        }

        return results;

    }

    return {
        interpret : interpret
    };
}());