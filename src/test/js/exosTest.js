var TEST = {};

TEST.event = function(obj,type) {
    if(document.createEvent) {
        if(type.substr(0,2)==="on") {
            type = type.substr(2);
        }
        var evtType = "Mouse";
        if(type === "change") {
            evtType = "HTML";
        }
        var evt = document.createEvent(evtType+'Events');
        evt.initEvent(type,true,true);
        obj.dispatchEvent(evt);
        return evt;
    } else if(document.createEventObject) {
        obj.fireEvent(type);
        return event;
    }
};

var behaviourTest = TestCase("behaviourTest");

behaviourTest.prototype.testModule = function() {
    assertFunction(Exos.isEnabled);
    assertFunction(Exos.enable);
    assertFunction(Exos.disable);
    assertFunction(Exos.add);
    assertObject(Exos.behaviours);
};

behaviourTest.prototype.testEnable = function() {
    Exos.disable();
    assertEquals(false,Exos.isEnabled());
    Exos.enable();
    assertEquals(true,Exos.isEnabled());
};

behaviourTest.prototype.testDisable = function() {
    assertEquals(true,Exos.isEnabled());
    Exos.disable();
    assertEquals(false,Exos.isEnabled());
};

behaviourTest.prototype.testEnablewithBhvrs = function() {
    var bhvrs = {
        id : {
            "test" : {
                click : {
                    fn : function() {
                        behaviourTest.output = "test>clicked";
                    }
                }
            },
            "test2" : {
                mouseover : {
                    fn : function() {
                        return null;
                    }
                }
            }
        },
        className : {
            "link" : {
                keypress : {
                    fn : function() {
                        return null;
                    }
                }
            }
        },
        tagName : {
            "div" : {
                mouseout : {
                    fn : function() {
                        return null;
                    }
                }
            }
        }
    };
    Exos.disable();
    assertEquals(Exos.enable(bhvrs),true);
    var obj = Exos.behaviours;
    assertObject(obj);
    assertObject(obj.id);
    assertObject(obj.id.test);
    assertObject(obj.id.test.click);
    assertFunction(obj.id.test.click.fn);
    assertObject(obj.id.test2);
    assertObject(obj.id.test2.mouseover);
    assertFunction(obj.id.test2.mouseover.fn);
    assertObject(obj.className);
    assertObject(obj.className.link);
    assertObject(obj.className.link.keypress);
    assertFunction(obj.className.link.keypress.fn);
    assertObject(obj.tagName);
    assertObject(obj.tagName.div);
    assertObject(obj.tagName.div.mouseout);
    assertFunction(obj.tagName.div.mouseout.fn);
};

behaviourTest.prototype.testBehaviour = function() {
    /*:DOC += <div id="test"></div>*/
    behaviourTest.output = "";
    TEST.event(document.getElementById("test"),"onclick");
    assertEquals("test>clicked",behaviourTest.output);
};

behaviourTest.prototype.testPurge = function() {
    assertEquals(true,Exos.isEnabled());
    assertObject(Exos.behaviours);
    Exos.disable(true);
    assertEquals(false,Exos.isEnabled());
    assertNull(Exos.behaviours);
};



behaviourTest.bhvrs = {
    id : {
        "chaintest" : {
            click : {
                fn : function() {
                    behaviourTest.output = "chaintestid";
                }
            }
        }
    },
    className : {
        "chaintest" : {
            click : {
                fn : function() {
                    behaviourTest.output += " chaintestclass";
                }
            }
        }
    },
    tagName : {
        "DIV" : {
            click : {
                fn : function() {
                    behaviourTest.output += " chaintesttag";
                }
            }
        }
    }
};

behaviourTest.prototype.testChain = function() {
    /*:DOC += <div id="chaintest" class="chaintest"></div>*/
    behaviourTest.output = "";
    var bhvrs = behaviourTest.bhvrs;
    Exos.disable(true);
    Exos.enable(bhvrs);
    TEST.event(document.getElementById("chaintest"),"onclick");
    assertEquals("chaintestid chaintestclass chaintesttag",behaviourTest.output);
};

behaviourTest.prototype.testBreakChain = function() {
    /*:DOC += <div id="chaintest" class="chaintest"></div>*/
    behaviourTest.output = "";
    var bhvrs = behaviourTest.bhvrs;
    bhvrs.id.chaintest.click.bc = true;
    Exos.disable(true);
    Exos.enable(bhvrs);
    TEST.event(document.getElementById("chaintest"),"onclick");
    assertEquals("chaintestid",behaviourTest.output);
};

behaviourTest.prototype.testBreakChainMid = function() {
    /*:DOC += <div id="chaintest" class="chaintest"></div>*/
    behaviourTest.output = "";
    var bhvrs = behaviourTest.bhvrs;
    bhvrs.id.chaintest.click.bc = false;
    bhvrs.className.chaintest.click.bc = true;
    Exos.disable(true);
    Exos.enable(bhvrs);
    TEST.event(document.getElementById("chaintest"),"onclick");
    assertEquals("chaintestid chaintestclass",behaviourTest.output);
};

behaviourTest.prototype.testBreakChainEnd = function() {
    /*:DOC += <div id="chaintest" class="chaintest"></div>*/
    behaviourTest.output = "";
    var bhvrs = behaviourTest.bhvrs;
    bhvrs.id.chaintest.click.bc = false;
    bhvrs.className.chaintest.click.bc = false;
    bhvrs.tagName.DIV.click.bc = true;
    Exos.disable(true);
    Exos.enable(bhvrs);
    TEST.event(document.getElementById("chaintest"),"onclick");
    assertEquals("chaintestid chaintestclass chaintesttag",behaviourTest.output);
};

behaviourTest.prototype.testBreakChainMultiClass = function() {
    /*:DOC += <div id="chaintest" class="firstclass secondclass"></div>*/
    behaviourTest.output = "";
    var bhvrs = {
        className : {
            "firstclass" : {
                click : {
                    fn : function() {
                        behaviourTest.output += "firstclass";
                    },
                    bc: true
                }
            },
            "secondclass" : {
                click : {
                    fn : function() {
                        behaviourTest.output = " secondclass";
                    }
                }
            }
        }
    };
    Exos.disable(true);
    Exos.enable(bhvrs);
    TEST.event(document.getElementById("chaintest"),"onclick");
    assertEquals("firstclass",behaviourTest.output);
};

behaviourTest.prototype.testNoBubble = function() {
    /*:DOC += <div id="parent" ><div id="child"></div></div>*/
    behaviourTest.output = "";
    var bhvrs = {
        id : {
            "parent" : {
                click : {
                    fn : function() {
                        behaviourTest.output += " parent";
                    }
                }
            },
            "child" : {
                click : {
                    fn : function() {
                        behaviourTest.output = "child";
                    }
                }
            }
        }
    };
    Exos.disable(true);
    Exos.enable(bhvrs);
    TEST.event(document.getElementById("child"),"onclick");
    assertEquals("child",behaviourTest.output);
};

behaviourTest.prototype.testBubble = function() {
    /*:DOC += <div id="parent" ><div id="child"></div></div>*/
    behaviourTest.output = "";
    var bhvrs = {
        id : {
            "parent" : {
                click : {
                    fn : function() {
                        behaviourTest.output += " parent";
                    }
                }
            },
            "child" : {
                click : {
                    fn : function() {
                        behaviourTest.output = "child";
                    },
                    bb : true
                }
            }
        }
    };
    Exos.disable(true);
    Exos.enable(bhvrs);
    TEST.event(document.getElementById("child"),"onclick");
    assertEquals("child parent",behaviourTest.output);
};

behaviourTest.prototype.testMultiBubble = function() {
    /*:DOC += <div id="parent" class="parent"><div id="child" class="child"></div></div>*/
    behaviourTest.output = "";
    var bhvrs = {
        id : {
            "parent" : {
                click : {
                    fn : function() {
                        behaviourTest.output += " parent";
                    }
                }
            },
            "child" : {
                click : {
                    fn : function() {
                        behaviourTest.output = "child";
                    },
                    bb : true
                }
            }
        },
        className : {
            "parent" : {
                click : {
                    fn : function() {
                        behaviourTest.output += " parentclass";
                    }
                }
            },
            "child" : {
                click : {
                    fn : function() {
                        behaviourTest.output += " childclass";
                    }
                }
            }
        }
    };
    Exos.disable(true);
    Exos.enable(bhvrs);
    TEST.event(document.getElementById("child"),"onclick");
    assertEquals("child childclass parent parentclass",behaviourTest.output);
};

behaviourTest.prototype.testMissingHandlers = function() {
    /*:DOC += <div id="test"></div>*/
    behaviourTest.output = "";
    Exos.disable(true);
    Exos.enable(behaviourTest.bhvrs);
    TEST.event(document.getElementById("test"),"onmouseover");
    assertEquals("",behaviourTest.output);
};

behaviourTest.prototype.testNonFunctions = function() {
    /*:DOC += <div id="test"></div>*/
    behaviourTest.output = "";
    Exos.disable(true);
    var bhvrs = {
        id : {
            "test" : {
                click : {
                    fn : "do it!"
                }
            }
        }
    };

    Exos.enable(bhvrs);
    TEST.event(document.getElementById("test"),"onclick");
    assertEquals("",behaviourTest.output);
};

behaviourTest.prototype.testPreventDefault = function() {
    /*:DOC += <a href="test.html" id="testlink">link</a>*/
    behaviourTest.output = "";
    Exos.disable(true);
    var bhvrs = {
        id : {
            "testlink" : {
                click : {
                    fn : function() {
                        behaviourTest.output = "testlink";
                    }
                }
            }
        }
    };

    Exos.enable(bhvrs);
    TEST.event(document.getElementById("testlink"),"onclick");
    assertEquals("testlink",behaviourTest.output);
    assertNotEquals("test.html",location.href);
};

behaviourTest.prototype.testAssignables = function() {
    /*:DOC += <select id="testselect"><option value="1">1</option><option value="2">2</option></select>*/
    behaviourTest.output = "";
    Exos.disable(true);
    var bhvrs = {
        id : {
            "testselect" : {
                change : {
                    fn : function() {
                        behaviourTest.output = this.options[this.selectedIndex].value;
                    }
                }
            }
        }
    };
    Exos.enable(bhvrs);
    TEST.event(document.getElementById("testselect"),"onchange");
    assertEquals("1",behaviourTest.output);
};

behaviourTest.prototype.testRemoveAssignables = function() {
    /*:DOC += <select id="testselect"><option value="1">1</option><option value="2">2</option></select>*/
    behaviourTest.output = "";
    Exos.disable(true);
    var bhvrs = {
        id : {
            "testselect" : {
                change : {
                    fn : function() {
                        behaviourTest.output = this.options[this.selectedIndex].value;
                    }
                }
            }
        }
    };
    Exos.enable(bhvrs);
    Exos.disable(true);
    TEST.event(document.getElementById("testselect"),"onchange");
    assertEquals("",behaviourTest.output);
};

behaviourTest.prototype.testAlreadyEnabled = function() {
    Exos.disable(true);
    Exos.enable();
    assertTrue(Exos.enable());
    assertTrue(Exos.isEnabled());
};

behaviourTest.prototype.testAdd = function() {
    /*:DOC += <div id="test" class="test"></div>*/
    behaviourTest.output = "";
    Exos.disable(true);
    var bhvrs = {
        id : {
            "test" : {
                click : {
                    fn : function() {
                        behaviourTest.output = "id";
                    }
                }
            }
        }
    };
    Exos.enable(bhvrs);
    var newbhvr = {
        className : {
            "test" : {
                click : {
                    fn : function() {
                        behaviourTest.output += "class";
                    }
                }
            }
        }
    };
    Exos.add(newbhvr);
    //assertFunction(Exos.inspect().className.test.click.fn);
    TEST.event(document.getElementById("test"),"onclick");
    assertEquals("idclass",behaviourTest.output);
};

// now with bubble on class - but id will have implicitly killed it already
behaviourTest.prototype.testBubbleOnClass = function() {
    /*:DOC += <div id="test3"><div id="test2"><div id="test" class="test"></div></div></div>*/
    behaviourTest.output = "";
    Exos.disable(true);

    var bhvrs = {
        id : {
            "test" : {
                click : {
                    fn : function() {
                        behaviourTest.output += "id";
                    }
                }
            },
            "test2" : {
                click : {
                    fn : function() {
                        behaviourTest.output += "id2";
                    }
                }
            }
        },
        className : {
            "test" : {
                click : {
                    fn : function() {
                        behaviourTest.output += "class";
                    },
                    bb : true
                }
            }
        }
    };
    Exos.enable(bhvrs);
    // older IE versions seem to have some timing issues when we keep cramming stuff in and re-enabling then
    // firing the event immediately.

        TEST.event(document.getElementById("test"),"onclick");
        assertEquals("idclass",behaviourTest.output);

};

// id should (implicitly) kill the bubble and prevent the rest of the chain from overriding it
behaviourTest.prototype.testBubbleOnId = function() {
    /*:DOC += <div id="test2"><div id="testOnId" class="testOnId"></div></div>*/
    behaviourTest.output = "";
    Exos.disable(true);
    var bhvrs = {
        id : {
            "testOnId" : {
                click : {
                    fn : function() {
                        behaviourTest.output += "id";
                    }
                }
            }
        },
        className : {
            "testOnId" : {
                click : {
                    fn : function() {
                        behaviourTest.output += "class";
                    },
                    bb : true
                }
            }
        }
    };

    Exos.enable(bhvrs);
    // older IE versions seem to have some timing issues when we keep cramming stuff in and re-enabling then
    // firing the event immediately.

        TEST.event(document.getElementById("testOnId"),"onclick");
        assertEquals("idclass",behaviourTest.output);

};

behaviourTest.prototype.testselectorFormat = function() {

    function myFunc() {
        return true;
    }

    var cfg = {'#testOnId': {'click' : myFunc}};
    var cfgExt = {'.testOnId' : {'click': {fn : myFunc, bb : true, bc: true}}};
    var cfgTag = {'SPAN': {'click' : myFunc}};
    var cfgArray = [cfg,cfgExt,cfgTag];

    var bhvrs = {
        id : {
            "testOnId" : {
                click : {
                    fn : myFunc
                }
            }
        },
        className : {
            "testOnId" : {
                click : {
                    fn : myFunc,
                    bb : true,
                    bc : true
                }
            }

        },
        tagName : {
            "SPAN" : {
                click : {
                    fn : myFunc
                }
            }
        }
    };
    Exos.disable();
    Exos.enable(bhvrs);
    var traditional = Exos.behaviours;
    Exos.disable();
    Exos.enable(cfgArray);
    var interpreted = Exos.behaviours;
    Exos.disable();
    assertEquals(traditional,interpreted);
};


behaviourTest.prototype.testQualifiers = function() {
    /*:DOC += <div id="testFalse"></div><div id="testTrue" class="testClass"></div>*/

    var bhvrs = {
        tagName : {
            "DIV" : {
                click : {
                    fn : function() {
                        behaviourTest.output = "tested";
                    },
                    className : 'testClass'
                }
            }
        }
    };

    var cfg = [{'DIV.testClass': {'click' : function() {
        behaviourTest.output = "tested";
    }}}];

    Exos.disable();
    Exos.enable(bhvrs);
    behaviourTest.output = "";
    TEST.event(document.getElementById("testFalse"),"onclick");
    assertEquals("",behaviourTest.output);
    TEST.event(document.getElementById("testTrue"),"onclick");
    assertEquals("tested",behaviourTest.output);

    Exos.disable();
    Exos.enable(cfg);
    behaviourTest.output = "";
    TEST.event(document.getElementById("testFalse"),"onclick");
    assertEquals("",behaviourTest.output);
    TEST.event(document.getElementById("testTrue"),"onclick");
    assertEquals("tested",behaviourTest.output);

};

behaviourTest.prototype.testMultipleSelectors = function() {
    /*:DOC += <div id="testDiv"></div><h1 id="testH1">stuff</h1>*/
    var cfg = [{'DIV, h1': {'click' : function() {
        behaviourTest.output = "tested";
    }}}];
    Exos.disable();
    Exos.enable(cfg);

    behaviourTest.output = "";
    TEST.event(document.getElementById("testDiv"),"onclick");
    assertEquals("tested",behaviourTest.output);
    behaviourTest.output = "";
    TEST.event(document.getElementById("testH1"),"onclick");
    assertEquals("tested",behaviourTest.output);

};

behaviourTest.prototype.testComplexQualifier = function() {

    /*:DOC += <div class="one"><ul><li><p id="paraOne"></p></li></ul></div><div class="two"><ul><li><p id="paraTwo"></p></li></ul></div><div class="one"><li><p id="paraThree"></p></li></div>*/

    var cfg = [{'div.one > ul p': {'click' : function() {
        behaviourTest.output = "tested";
    }}}];

    Exos.disable();
    Exos.enable(cfg);
    behaviourTest.output = "";
    TEST.event(document.getElementById("paraOne"),"onclick");
    assertEquals("tested",behaviourTest.output);
    TEST.event(document.getElementById("paraTwo"),"onclick");
    assertEquals("tested",behaviourTest.output);
    TEST.event(document.getElementById("paraThree"),"onclick");
    assertEquals("tested",behaviourTest.output);
};