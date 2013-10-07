var inTest = TestCase("inTest");

inTest.prototype.testTag = function() {
    var sel = "A";
    var result = Exos.interpreter.interpret(sel);
    assertEquals([{tagName : 'A'}],result);
};

inTest.prototype.testId = function() {
    var sel = "#test";
    var result = Exos.interpreter.interpret(sel);
    assertEquals([{id : 'test'}],result);
};

inTest.prototype.testClass = function() {
    var sel = ".test";
    var result = Exos.interpreter.interpret(sel);
    assertEquals([{className : 'test'}],result);
};

inTest.prototype.testTagAndClass = function() {
    var sel = "A.test";
    var result = Exos.interpreter.interpret(sel);
    assertEquals([{tagName : 'A', className : 'test'}],result);
};

inTest.prototype.testParent = function() {
    var sel = "DIV.parent > span.child";
    var result = Exos.interpreter.interpret(sel);
    assertEquals([{tagName : 'SPAN', className : 'child', parent : {
        tagName : 'DIV',
        className : 'parent'
    }}],result);
};

inTest.prototype.testAncestor = function() {
    var sel = "DIV.ancestor span.child";
    var result = Exos.interpreter.interpret(sel);
    assertEquals([{tagName : 'SPAN', className : 'child', ancestor : {
        tagName : 'DIV',
        className : 'ancestor'
    }}],result);
};

inTest.prototype.testMultiParent = function() {
    var sel = "DIV.top > P.middle > span.bottom";
    var result = Exos.interpreter.interpret(sel);
    assertEquals([{tagName : 'SPAN', className : 'bottom', parent : {
        tagName : 'P',
        className : 'middle',
        parent : {
            tagName : 'DIV',
            className : 'top'
        }
    }}],result);
};

inTest.prototype.testDeepNesting = function() {
    var sel = "UL.ul > LI.li DIV.div P.p > SPAN.span";
    var result = Exos.interpreter.interpret(sel);
    assertEquals([{
        tagName : 'SPAN',
        className : 'span',
            parent : {
                tagName : 'P',
                className : 'p',
                    ancestor : {
                        tagName : 'DIV',
                        className : 'div',
                        ancestor : {
                            tagName : 'LI',
                            className : 'li',
                            parent : {
                                tagName : 'UL',
                                className : 'ul'
                            }
                        }
                    }
    }}],result);
};

inTest.prototype.testMultipleSelectors = function() {
    var sel = "h1, h2.h2, h3 > span";
    var result = Exos.interpreter.interpret(sel);
    assertEquals([{
        tagName : 'H1'
    },{
        tagName : 'H2',
        className : 'h2'
    },{
        tagName : 'SPAN',
        parent : {
            tagName : 'H3'
        }
    }],result);
};

inTest.prototype.testAttributes = function() {
    var sel = "DIV[stu=cool]";
    var result = Exos.interpreter.interpret(sel);
    assertEquals([{tagName : 'DIV', attribute : {
        key : 'stu',
        operator : '=',
        value : 'cool'
    }
    }],result);
};