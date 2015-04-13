define('aurelia-path',['exports'], function (exports) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.relativeToFile = relativeToFile;
  exports.join = join;
  exports.buildQueryString = buildQueryString;
  function trimDots(ary) {
    var i, part;
    for (i = 0; i < ary.length; ++i) {
      part = ary[i];
      if (part === '.') {
        ary.splice(i, 1);
        i -= 1;
      } else if (part === '..') {
        if (i === 0 || i == 1 && ary[2] === '..' || ary[i - 1] === '..') {
          continue;
        } else if (i > 0) {
          ary.splice(i - 1, 2);
          i -= 2;
        }
      }
    }
  }

  function relativeToFile(name, file) {
    var lastIndex,
        normalizedBaseParts,
        fileParts = file && file.split('/');

    name = name.trim();
    name = name.split('/');

    if (name[0].charAt(0) === '.' && fileParts) {
      normalizedBaseParts = fileParts.slice(0, fileParts.length - 1);
      name = normalizedBaseParts.concat(name);
    }

    trimDots(name);

    return name.join('/');
  }

  function join(path1, path2) {
    var url1, url2, url3, i, ii, urlPrefix;

    if (!path1) {
      return path2;
    }

    if (!path2) {
      return path1;
    }

    urlPrefix = path1.indexOf('//') === 0 ? '//' : path1.indexOf('/') === 0 ? '/' : '';

    url1 = path1.split('/');
    url2 = path2.split('/');
    url3 = [];

    for (i = 0, ii = url1.length; i < ii; ++i) {
      if (url1[i] == '..') {
        url3.pop();
      } else if (url1[i] == '.' || url1[i] == '') {
        continue;
      } else {
        url3.push(url1[i]);
      }
    }

    for (i = 0, ii = url2.length; i < ii; ++i) {
      if (url2[i] == '..') {
        url3.pop();
      } else if (url2[i] == '.' || url2[i] == '') {
        continue;
      } else {
        url3.push(url2[i]);
      }
    }

    return urlPrefix + url3.join('/').replace(/\:\//g, '://');;
  }

  var r20 = /%20/g,
      rbracket = /\[\]$/,
      class2type = {};

  'Boolean Number String Function Array Date RegExp Object Error'.split(' ').forEach(function (name, i) {
    class2type['[object ' + name + ']'] = name.toLowerCase();
  });

  function type(obj) {
    if (obj == null) {
      return obj + '';
    }

    return typeof obj === 'object' || typeof obj === 'function' ? class2type[toString.call(obj)] || 'object' : typeof obj;
  }

  function buildQueryString(a, traditional) {
    var prefix,
        s = [],
        add = function add(key, value) {
      value = typeof value === 'function' ? value() : value == null ? '' : value;
      s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
    };

    for (prefix in a) {
      _buildQueryString(prefix, a[prefix], traditional, add);
    }

    return s.join('&').replace(r20, '+');
  }

  function _buildQueryString(prefix, obj, traditional, add) {
    var name;

    if (Array.isArray(obj)) {
      obj.forEach(function (v, i) {
        if (traditional || rbracket.test(prefix)) {
          add(prefix, v);
        } else {
          _buildQueryString(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, traditional, add);
        }
      });
    } else if (!traditional && type(obj) === 'object') {
      for (name in obj) {
        _buildQueryString(prefix + '[' + name + ']', obj[name], traditional, add);
      }
    } else {
      add(prefix, obj);
    }
  }
});
define('aurelia-loader/template-registry-entry',['exports', 'aurelia-path'], function (exports, _aureliaPath) {
  

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var TemplateDependency = function TemplateDependency(src, name) {
    _classCallCheck(this, TemplateDependency);

    this.src = src;
    this.name = name;
  };

  exports.TemplateDependency = TemplateDependency;

  var TemplateRegistryEntry = (function () {
    function TemplateRegistryEntry(id) {
      _classCallCheck(this, TemplateRegistryEntry);

      this.id = id;
      this.template = null;
      this.dependencies = null;
      this.resources = null;
      this.factory = null;
    }

    _createClass(TemplateRegistryEntry, [{
      key: 'templateIsLoaded',
      get: function () {
        return this.template !== null;
      }
    }, {
      key: 'isReady',
      get: function () {
        return this.factory !== null;
      }
    }, {
      key: 'setTemplate',
      value: function setTemplate(template) {
        var id = this.id,
            useResources,
            i,
            ii,
            current,
            src;

        this.template = template;
        useResources = template.content.querySelectorAll('require');
        this.dependencies = new Array(useResources.length);

        if (useResources.length === 0) {
          return;
        }

        for (i = 0, ii = useResources.length; i < ii; ++i) {
          current = useResources[i];
          src = current.getAttribute('from');

          if (!src) {
            throw new Error('<require> element in ' + this.id + ' has no "from" attribute.');
          }

          this.dependencies[i] = new TemplateDependency(_aureliaPath.relativeToFile(src, id), current.getAttribute('as'));

          if (current.parentNode) {
            current.parentNode.removeChild(current);
          }
        }
      }
    }, {
      key: 'setResources',
      value: function setResources(resources) {
        this.resources = resources;
      }
    }, {
      key: 'setFactory',
      value: function setFactory(factory) {
        this.factory = factory;
      }
    }]);

    return TemplateRegistryEntry;
  })();

  exports.TemplateRegistryEntry = TemplateRegistryEntry;
});
/*! core 2014-07-15 */
/**
 * The base module for the Core JS framework.
 * It provides helper methods for implementing OOP methodologies and basic utilities such as browser detection.
 *
 * @module core
 */
!function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+-new Date,v=a.document,w=0,x=0,y=gb(),z=gb(),A=gb(),B=function(a,b){return a===b&&(l=!0),0},C="undefined",D=1<<31,E={}.hasOwnProperty,F=[],G=F.pop,H=F.push,I=F.push,J=F.slice,K=F.indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(this[b]===a)return b;return-1},L="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",N="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",O=N.replace("w","w#"),P="\\["+M+"*("+N+")"+M+"*(?:([*^$|!~]?=)"+M+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+O+")|)|)"+M+"*\\]",Q=":("+N+")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|"+P.replace(3,8)+")*)|.*)\\)|)",R=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),S=new RegExp("^"+M+"*,"+M+"*"),T=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),U=new RegExp("="+M+"*([^\\]'\"]*?)"+M+"*\\]","g"),V=new RegExp(Q),W=new RegExp("^"+O+"$"),X={ID:new RegExp("^#("+N+")"),CLASS:new RegExp("^\\.("+N+")"),TAG:new RegExp("^("+N.replace("w","w*")+")"),ATTR:new RegExp("^"+P),PSEUDO:new RegExp("^"+Q),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+L+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Y=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,$=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ab=/[+~]/,bb=/'|\\/g,cb=new RegExp("\\\\([\\da-f]{1,6}"+M+"?|("+M+")|.)","ig"),db=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)};try{I.apply(F=J.call(v.childNodes),v.childNodes),F[v.childNodes.length].nodeType}catch(eb){I={apply:F.length?function(a,b){H.apply(a,J.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fb(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],!a||"string"!=typeof a)return d;if(1!==(k=b.nodeType)&&9!==k)return[];if(p&&!e){if(f=_.exec(a))if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode)return d;if(h.id===j)return d.push(h),d}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),d}else{if(f[2])return I.apply(d,b.getElementsByTagName(a)),d;if((j=f[3])&&c.getElementsByClassName&&b.getElementsByClassName)return I.apply(d,b.getElementsByClassName(j)),d}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=9===k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(bb,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--)o[l]=s+qb(o[l]);w=ab.test(a)&&ob(b.parentNode)||b,x=o.join(",")}if(x)try{return I.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}return i(a.replace(R,"$1"),b,d,e)}function gb(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function hb(a){return a[u]=!0,a}function ib(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function jb(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function kb(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||D)-(~a.sourceIndex||D);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function lb(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function mb(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function nb(a){return hb(function(b){return b=+b,hb(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function ob(a){return a&&typeof a.getElementsByTagName!==C&&a}c=fb.support={},f=fb.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=fb.setDocument=function(a){var b,e=a?a.ownerDocument||a:v,g=e.defaultView;return e!==n&&9===e.nodeType&&e.documentElement?(n=e,o=e.documentElement,p=!f(e),g&&g!==g.top&&(g.addEventListener?g.addEventListener("unload",function(){m()},!1):g.attachEvent&&g.attachEvent("onunload",function(){m()})),c.attributes=ib(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ib(function(a){return a.appendChild(e.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=$.test(e.getElementsByClassName)&&ib(function(a){return a.innerHTML="<div class='a'></div><div class='a i'></div>",a.firstChild.className="i",2===a.getElementsByClassName("i").length}),c.getById=ib(function(a){return o.appendChild(a).id=u,!e.getElementsByName||!e.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if(typeof b.getElementById!==C&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){var c=typeof a.getAttributeNode!==C&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return typeof b.getElementsByTagName!==C?b.getElementsByTagName(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return typeof b.getElementsByClassName!==C&&p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=$.test(e.querySelectorAll))&&(ib(function(a){a.innerHTML="<select class=''><option selected=''></option></select>",a.querySelectorAll("[class^='']").length&&q.push("[*^$]="+M+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+M+"*(?:value|"+L+")"),a.querySelectorAll(":checked").length||q.push(":checked")}),ib(function(a){var b=e.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+M+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=$.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ib(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",Q)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=$.test(o.compareDocumentPosition),t=b||$.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===e||a.ownerDocument===v&&t(v,a)?-1:b===e||b.ownerDocument===v&&t(v,b)?1:k?K.call(k,a)-K.call(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,f=a.parentNode,g=b.parentNode,h=[a],i=[b];if(!f||!g)return a===e?-1:b===e?1:f?-1:g?1:k?K.call(k,a)-K.call(k,b):0;if(f===g)return kb(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)i.unshift(c);while(h[d]===i[d])d++;return d?kb(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},e):n},fb.matches=function(a,b){return fb(a,null,null,b)},fb.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(U,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fb(b,n,null,[a]).length>0},fb.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fb.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&E.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fb.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fb.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fb.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fb.selectors={cacheLength:50,createPseudo:hb,match:X,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(cb,db),a[3]=(a[4]||a[5]||"").replace(cb,db),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fb.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fb.error(a[0]),a},PSEUDO:function(a){var b,c=!a[5]&&a[2];return X.CHILD.test(a[0])?null:(a[3]&&void 0!==a[4]?a[2]=a[4]:c&&V.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(cb,db).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+M+")"+a+"("+M+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||typeof a.getAttribute!==C&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fb.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fb.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?hb(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=K.call(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:hb(function(a){var b=[],c=[],d=h(a.replace(R,"$1"));return d[u]?hb(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:hb(function(a){return function(b){return fb(a,b).length>0}}),contains:hb(function(a){return function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:hb(function(a){return W.test(a||"")||fb.error("unsupported lang: "+a),a=a.replace(cb,db).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Z.test(a.nodeName)},input:function(a){return Y.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:nb(function(){return[0]}),last:nb(function(a,b){return[b-1]}),eq:nb(function(a,b,c){return[0>c?c+b:c]}),even:nb(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:nb(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:nb(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:nb(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=lb(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=mb(b);function pb(){}pb.prototype=d.filters=d.pseudos,d.setFilters=new pb,g=fb.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=S.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=T.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(R," ")}),h=h.slice(c.length));for(g in d.filter)!(e=X[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fb.error(a):z(a,i).slice(0)};function qb(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function rb(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function sb(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function tb(a,b,c){for(var d=0,e=b.length;e>d;d++)fb(a,b[d],c);return c}function ub(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function vb(a,b,c,d,e,f){return d&&!d[u]&&(d=vb(d)),e&&!e[u]&&(e=vb(e,f)),hb(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||tb(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ub(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ub(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?K.call(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ub(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):I.apply(g,r)})}function wb(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=rb(function(a){return a===b},h,!0),l=rb(function(a){return K.call(b,a)>-1},h,!0),m=[function(a,c,d){return!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d))}];f>i;i++)if(c=d.relative[a[i].type])m=[rb(sb(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return vb(i>1&&sb(m),i>1&&qb(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(R,"$1"),c,e>i&&wb(a.slice(i,e)),f>e&&wb(a=a.slice(e)),f>e&&qb(a))}m.push(c)}return sb(m)}function xb(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++])if(o(l,g,h)){i.push(l);break}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++])o(r,s,g,h);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=G.call(i));s=ub(s)}I.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&fb.uniqueSort(i)}return k&&(w=v,j=t),r};return c?hb(f):f}h=fb.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wb(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xb(e,d)),f.selector=a}return f},i=fb.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(cb,db),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=X.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(cb,db),ab.test(j[0].type)&&ob(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qb(j),!a)return I.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,ab.test(a)&&ob(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ib(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ib(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||jb("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ib(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||jb("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ib(function(a){return null==a.getAttribute("disabled")})||jb(L,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),"function"==typeof define&&define.amd?define('core-js/core.src',[],function(){return fb}):"undefined"!=typeof module&&module.exports?module.exports=fb:a.Sizzle=fb}(window);
(function(scope){

    /**
     * Function prototype extension in the core framework.
     *
     * @class Function
     * @constructor
     *
     */
    if(!Function.prototype.bind) {

        /**
         * Added support for older browser. Only applied when the method is not available. Returns a scope bound function.
         *
         * @method bind
         * @param {Object} scope The scope where the function is bound to
         * @return {Function} A scope bound function
         */
        Function.prototype.bind = function(oThis) {
            if( typeof this !== "function") {
                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
            }
            var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function() {
            }, fBound = function() {
                return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
            };
            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();
            return fBound;
        };
    }
    /**
     * Utility method for implementing prototypal inheritance within the core framework.
     *
     * @method inherits
     * @param {Object} obj The object where the prototype is going to be derived from.
     *
     */
    Function.prototype.inherits = function(obj){

        this.prototype = new obj({__inheriting__:true});

    };
    /**
     * Utility method for implementing mixins/augmentation/partial in the core framework
     *
     * @method mixin
     * @param {Object} obj The object where the prototype is going to be mix with.
     *
     */
    Function.prototype.augment = Function.prototype.mixin = Function.prototype.partial = function(obj){
        if(typeof obj == "function"){
            for(var prop in obj.prototype){
                this.prototype[prop] = obj.prototype[prop];
            }
        }
        if(typeof obj == "object"){
            for(var prop in obj){
                this.prototype[prop] = obj[prop];
            }
        }
    }
    if(!scope.core){
        /**
         * The main module and namespace used within the core framework.
         *
         * @class core
         *
         *
         */
        scope.core = {};
    }
    if(typeof navigator !== 'undefined'){
        var N= navigator.appName, ua=navigator.userAgent, tem;
        var M= ua.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*(\.?\d+(\.\d+)*)/i);
        if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
        M= M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];
        var br = {
            mobile: false,
            ios: false,
            iphone: false,
            ipad: false,
            android: false,
            webos: false,
            mac: false,
            windows: false,
            other: true,
            name: M[0].toLowerCase() == "trident" ? "msie" : M[0].toLowerCase(),
            version: M[1].split(".")[0],
            touch:'ontouchstart' in window,
            full_version:M[1]

        };
        function ver(re, index, replaceA, replaceB) {
            var v = re.exec(ua);
            if(v === null || typeof v !== 'object' || typeof v.length !== 'number') {
                return true;
            } else if(typeof v.length === 'number' && v.length >= (index + 1)) {
                if(replaceA && replaceB) return v[index].replace(replaceA, replaceB);
                else return v[index];
            } else {
                return true;
            }
        }
        if (/mobile/i.test(ua)) {
            br.mobile = true;
        }
        if (/like Mac OS X/.test(ua)) {
            br.ios 		= ver(/CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/, 2, /_/g, '.');
            br.iphone 	= /iPhone/.test(ua);
            br.ipad 		= /iPad/.test(ua);
        }
        if (/Android/.test(ua)) {
            br.android = ver(/Android ([0-9\.]+)[\);]/, 1);
        }

        if (/webOS\//.test(ua)) {
            br.webos = ver(/webOS\/([0-9\.]+)[\);]/, 1);
        }
        if (/(Intel|PPC) Mac OS X/.test(ua)) {
            br.mac = ver(/(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/, 2, /_/g, '.');
        }
        if (/Windows NT/.test(ua)) {
            br.windows = ver(/Windows NT ([0-9\._]+)[\);]/, 1);
        }
        for(var key in br) {
            if(key !== 'Other' && key !== 'Mobile' && br[key] !== false) {
                br.other = false;
            }
        }
        scope.core.browser = br;
        /**
         * Stored browser information based on the detection algorithm implemented within core.
         * @property browser
         * @type Object
         */
        scope.core.browser[M[0].toLowerCase() == "trident" ? "msie" : M[0].toLowerCase()] = {version:M[1].split(".")[0]};
        //
        // ### core.browser ######
        // Browser detection implementation
        // Creates a browser object in the core object containing browser information.

    }
    /**
     * Utility method for generating GUID
     * @method GUID
     * @returns String Returns a GUID string
     */
    scope.core.GUID = function() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";
        var uuid = s.join("");
        return uuid;
    };
    /**
     * Utility method for getting the bounding rect of the dom element - also adds support for IE8
     * @method rect
     * @returns Object Contains the rectangular information of a HTMLElement
     */
    scope.core.rect = function(targ){
        var o = {};
        if(targ instanceof Array){
            o = targ[0].getBoundingClientRect()

        }
        o = targ.getBoundingClientRect();
        if(typeof o.width == "undefined"){
            var x = o;
            o = {
                top: x.top,
                left: x.left,
                right: x.right,
                bottom: x.bottom
            }
            o.width = o.right - o.left;
            o.height = o.bottom + o.top;
        }else
        if(typeof o.right == "undefined"){
            o = {
                top: x.top,
                left: x.left,
                width: x.width,
                height: x.height
            }
            o.right = o.left+ o.width;
            o.bottom = o.top + o.height;
        }
        return o;
    };
    /**
     * Utility method for exposing objects in a namespaced fashion.
     * @method registerNamespace
     */
    scope.core.registerNamespace = function(nspace, obj){
        var parts = nspace.split(".");
        var root = parts.shift();

        if(!scope[root]) { scope[root] = {}; }
        var temp = scope[root];
        while(parts.length > 1){
            var sp = parts.shift();
            if(!temp[sp]){
                temp[sp] = {};
            }
            temp = temp[sp];
        }
        if(!parts.length){
            scope[root] = obj;
        }else{
            var last = parts.shift();
            if(last){
                temp[last] = obj || {};
            }
        }
    };
    /**
     * Utility method for referencing objects within the core framework. This also adds existence checking for the objects being referenced on import.
     * @method import
     * @param {String} package The namespace of the object being imported.
     * @returns Object The object being imported
     */
    scope.core._import = function(pack){
        var parts = pack.split(".");
        var sc = scope;
        while(parts.length){
            var sp = parts.shift();
            if(sc[sp]){
                sc = sc[sp];
            }else{
                return null;
            }
        }
        return sc;
    };
    /**
     * Utility method for performing dependency checks on core classes.
     * @method dependency
     * @param {String} object The object to check if its defined.
     * @param {String} message The message to display on warning when the object passed for checking is undefined.
     * @returns Object The object being imported
     */
    scope.core.dependency = function(obj, message){
        if(!scope[obj]){
            console.warn(message);
        }
    };
    /** browser support implementations **/

    // ### JSON ######
    // JSON implementation for browsers without support
    if(!scope.JSON){scope.JSON={}}(function(){function f(n){return n<10?"0"+n:n}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)}if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==="string"){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else{if(typeof space==="string"){indent=space}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":value})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}}());

    // ### addEventListener/removeEventListener/dispatchEvent ## //
    // EventListener implementation for browsers without support
    if(scope == window){
        !window.addEventListener && (function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
            WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
                var target = this;

                registry.unshift([target, type, listener, function (event) {
                    event.currentTarget = target;
                    event.preventDefault = function () { event.returnValue = false };
                    event.stopPropagation = function () { event.cancelBubble = true };
                    event.target = event.srcElement || target;

                    listener.call(target, event);
                }]);

                this.attachEvent("on" + type, registry[0][3]);
            };

            WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
                for (var index = 0, register; register = registry[index]; ++index) {
                    if (register[0] == this && register[1] == type && register[2] == listener) {
                        return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
                    }
                }
            };

            WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
                return this.fireEvent("on" + eventObject.type, eventObject);
            };
        })(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);
    }


})(typeof process !== "undefined" && process.arch !== undefined ? GLOBAL : window); //supports node js

if(!("console" in window)){
    console = {
        log:function(){},
        warn:function(){},
        trace:function(){}
    }
}

(function(){
    /**
     * The base object of all core based classes. Every object created within the Core framework derives from this class.
     *
     * @class Core
     * @namespace core
     * @constructor
     * @param {Object} opts An object containing configurations required by the Core class.
     * @param {HTMLElement} opts.el The node element included in the class composition.
     *
    */
    function Core(opts){
        //skips all process when instantiated from Function.inherits
        if(opts && opts.__inheriting__) return;
        if(opts){
            //`this.el property` a dom element context
            if(opts.el){
                /**
                 * The selected HTML element node reference.
                 *
                 * @property el
                 * @type HTMLElement
                 *
                 */
                this.el = opts.el;
            }
        }
        /**
         * Property for storing proxied function/methods
         *
         * @property proxyHandlers
         * @type Object
         *
         */
        this.proxyHandlers = {};
        this.construct(opts || {});
        var ref = this;
        setTimeout(function(){
            if(ref.delayedConstruct){
                ref.delayedConstruct(opts || {});
            }
        }, 0);

    }
    /**
     * Returns a scope bound function and stores it on the proxyHandlers property.
     *
     * @method getProxyHandler
     * @param {String} method The string equivalent of the defined method name of the class.
     * @return {Function} The scope bound function defined on the parameter.
     */
    Core.prototype._ = Core.prototype.getProxyHandler = function(str){
        if(!this.proxyHandlers[str]){
            if(typeof this[str] === "function" ){
                this.proxyHandlers[str] = this[str].bind(this);
            }else{
                console.warn("Warning: attempt to create non existing method as proxy " + str);
            }

        }
        return this.proxyHandlers[str];
    }
    // ### Core.clearProxyHandler ######
    // Core method for clearing proxied function methods.
    /**
     * Core method for clearing proxied function methods.
     *
     * @method clearProxyHandler
     * @param {String} method The string equivalent of the defined method to clear.
     */
    Core.prototype.clearProxyHandler = function(str){
        var ret = this.proxyHandlers[str];
        if(ret === null){
            console.warn("Warning: attempt to clear a non-existing proxy - "+str);
        }
        this.proxyHandlers[str] = null;
        delete this.proxyHandlers[str];
        return ret;
    }
    /**
     * Core method initialization. This is called automatically on core sub classes.
     *
     * @method construct
     * @param {Object} options The object passed on the constructor of a core based class.
     */
    Core.prototype.construct = function(opts){
    };
    /**
     * Core method initialization. This is called automatically on core sub classes. Adds delay when being called automatically, this allows
     * time to setup all the other classes and manage the sequence of instantiations.
     *
     * @method delayedConstruct
     * @param {Object} options The object passed on the constructor of a core based class.
     */
    Core.prototype.delayedConstruct = function(opts){
    };
    /**
     * Core method for destroying/cleaning up objects.
     *
     * @method dispose
     * @param {Boolean} removeNode If true and there is a node attached in the class (el property) that element is going to be removed upon disposal.
     */
    Core.prototype.dispose = function(removeNode){
        if(removeNode && this.el){
            try{
                this.el.parentNode.removeChild(this.el);
            }catch(err){}
        }
        this.el = null;
        for(var prop in this.proxyHandlers){
            this.proxyHandlers[prop] = null;
            delete this.proxyHandlers[prop];
        }
    };
    /**
     * Core method for searching sub node elements.
     *
     * @method find
     * @param {String} selector The selector used for searching sub nodes.
     * @returns {NodeList} An array of HTMLElements, please note that this is not jQuery selected nodes.
     */
    Core.prototype.find = function(selector){
        return Sizzle(selector, this.el)
    };
    /**
     * Core method for searching sub node elements within the document context.
     *
     * @method findAll
     * @param {String} selector The selector used for searching sub nodes within the document.
     * @returns {NodeList} An array of HTMLElements, please note that this is not jQuery selected nodes.
     */
    Core.prototype.findAll = function(selector){
        return Sizzle(selector)
    };

    core.registerNamespace("core.Core", Core);

})();

if(typeof module !== 'undefined' && module.exports){
    module.exports = core;
}
/**
 * The main class that implements broadcaster pattern. Ideally subclassed by objects that will perform broadcasting functions.
 *
 * @class EventDispatcher
 * @namespace core.events
 * @extends core.Core
 * @constructor
 * @param {Object} opts An object containing configurations required by the Core derived class.
 * @param {HTMLElement} opts.el The node element included in the class composition.
 *
 */
(function(){
    var Core = core.Core; //shorthand variable assignment.
    var __super__ = Core.prototype;
    function EventDispatcher(opts){
        if (opts && opts.__inheriting__) return;
        Core.call(this, opts);
    }
    EventDispatcher.inherits(Core);
    var proto = EventDispatcher.prototype;
    proto.construct = function(opts){
        __super__.construct.call(this, opts);
        this.events = {};
    };
    proto.dispose = function(){
        __super__.dispose.call(this);
        this.removeAll();
        this.events = null;

    };
    /**
     * Checks the array of listeners for existing scopes.
     *
     * @method containsScope
     * @param {Array} list Reference to the array of subscribed listeners
     * @param {Object} scope Reference to the scope being queried for existence
     * @private
     * @return {Booleans} Returns boolean indicating the existence of the scope passed on the parameters
     */
    var containsScope = function(arr, scope){
        var len = arr.length;
        for(var i = 0;i<len;i++){
            if(arr[i].scope === scope){
                return arr[i];
            }
        }
        scope.__core__signal__id__ = core.GUID();
        return -1;
    };
    /**
     * Private method handler for event registration.
     *
     * @method register
     * @param {String} eventName The event name being added on the listener list.
     * @param {Object} scope Reference to the scope of the event handler
     * @param {Function} method The method used by the scope to handle the event being broadcasted
     * @param {Boolean} once Specify whether the event should only be handled once by the scope and its event handler
     * @private
     */
    var register = function(evt, scope, method, once){
        var __sig_dispose__ = null;
        var exists = containsScope.call(this, this.events[evt+(once ? "_once" : "")], scope);
        if(exists === -1 && scope.dispose){
            __sig_dispose__ = scope.dispose;

            scope.dispose = (function(){
                var meth = Array.prototype.shift.call(arguments);
                var sig = Array.prototype.shift.call(arguments);
                sig.removeScope(this, scope);
                sig = null;
                meth = null;

                return __sig_dispose__.apply(this, arguments);
            }).bind(scope, method, this);
            //
            this.events[evt+(once ? "_once" : "")].push({method:method, scope:scope, dispose_orig:__sig_dispose__});
        }else{
            //if scope already exists, check if the method has already been added.
            if(exists !== -1){
                if(exists.method != method){
                    this.events[evt+(once ? "_once" : "")].push({method:method, scope:exists.scope, dispose_orig:exists.dispose_orig});
                }
            }else{

                this.events[evt+(once ? "_once" : "")].push({method:method, scope:scope, dispose_orig:null});
            }
        }
    };
    /**
     * Subscribe function. Called when adding a subscriber to the broadcasting object.
     *
     * @method on
     * @param {String} eventName The event name being subscribed to
     * @param {Function} method The method handler to trigger when the event specified is dispatched.
     * @param {core.Core} scope Reference to the scope of the event handler
     */
    proto.on = function(evt, method, scope){
        if(!this.events[evt]){
            this.events[evt] = [];
        }
        register.call(this, evt, scope, method);
    };
    /**
     * Subscribe once function. Called when adding a subscriber to the broadcasting object.
     *
     * @method once
     * @param {String} eventName The event name being subscribed to
     * @param {Function} method The method handler to trigger when the event specified is dispatched.
     * @param {core.Core} scope Reference to the scope of the event handler
     */
    proto.once = function(evt, method, scope){
        if(!this.events[evt+"_once"]){
            this.events[evt+"_once"] = [];
        }
        register.call(this, evt, scope, method, true);
    };
    /**
     * Private method handler for unregistering events
     *
     * @method unregister
     * @param {String} eventName The event name being added on the listener list.
     * @param {Object} scope Reference to the scope of the event handler
     * @param {Function} method The method used by the scope to handle the event being broadcasted
     * @param {Boolean} once Specify whether the event should only be handled once by the scope and its event handler
     * @private
     */
    var unregister = function(evt, scope, method){
        if(this.events[evt]){
            var len = this.events[evt].length;
            while(len--){
                if(this.events[evt][len].scope === scope && this.events[evt][len].method === method){
                    var o = this.events[evt].splice(len, 1).pop();
                    if(o.scope.dispose && o.dispose_orig){
                        o.scope.dispose = o.dispose_orig;
                    }
                    delete o.scope.__core__signal__id__;
                    o.scope = null;
                    o.dispose_orig = null;
                    delete o.dispose_orig;
                    o = null;

                }
            }
            if(this.events[evt].length === 0){
                delete this.events[evt];
            }
        }
    };
    /**
     * Unsubscribe function. Called when removing a subscriber from the broadcasting object.
     *
     * @method off
     * @param {String} eventName The event name unsubscribing from.
     * @param {Function} method The method handler to trigger when the event specified is dispatched.
     * @param {core.Core} scope Reference to the scope of the event handler
     */
    proto.off = function(evt, method, scope){
        unregister.call(this, evt, scope, method);
        unregister.call(this, evt+"_once", scope, method);
    };
    /**
     * Unsubscribe function - scope context. Unsubscribes a specific scope from ALL events
     *
     * @method removeScope
     * @param {core.Core} scope Reference to the scope subscriber being removed.
     */
    proto.removeScope = function(scope){
        for(var prop in this.events){
            var len = this.events[prop].length;
            while(len--){
                if(this.events[prop][len].scope === scope){
                    var o = this.events[prop].splice(len, 1).pop();
                    if(o.scope.dispose && o.dispose_orig){
                        o.scope.dispose = o.dispose_orig;
                    }
                    delete o.scope.__core__signal__id__;
                    o = null;
                }
            }
            if(this.events[prop].length === 0){
                delete this.events[prop];
            }
        }
    };
    /**
     * Removes all items from the listener list.
     *
     * @method removeAll
     */
    proto.removeAll = function(){
        for(var prop in this.events){
            var len = this.events[prop].length;
            while(this.events[prop].length){
                var o = this.events[prop].shift();
                if(o.scope.dispose && o.dispose_orig){
                    o.scope.dispose = o.dispose_orig;
                }
                delete o.__core__signal__id__;
                o = null;
            }
            if(this.events[prop].length === 0){
                delete this.events[prop];
            }
        }
        this.events = {};
    };
    /**
     * Broadcast functions. Triggers a broadcast on the EventDispatcher/derived object.
     *
     * @method trigger
     * @param {String} eventName The event name to trigger/broadcast.
     * @param {Object} variables An object to send upon broadcast
     */
    proto.trigger = function(evt, vars){
        var dis = vars || {};
        if(!dis.type){
            dis.type = evt;
        }
        if(this.events && this.events[evt]){
            var sevents = this.events[evt];
            var len = sevents.length;
            for(var i = 0;i<len;i++){
                var obj = sevents[i];
                obj.method.call(obj.scope, dis);
                obj = null;
            }
        }
        if(this.events && this.events[evt+"_once"]){
            var oevents = this.events[evt+"_once"];
            while(oevents.length){
                var obj = oevents.shift();
                obj.method.call(obj.scope, dis);
                obj = null;
            }
            if(!oevents.length){
                delete this.events[evt+"_once"];
            }
        }

        dis = null;
    };
    core.registerNamespace("core.events.EventDispatcher", EventDispatcher);
})();
/**
 * ** Singleton. ** <br>Allows a global object to be utilized for broadcasting events.<br><br>
 * ** Example: ** <br> <pre>EventBroadcaster.instance().on("eventName", scope._("someEvent"), scope);</pre>
 * @class EventBroadcaster
 * @namespace core.events
 * @extends core.events.EventDispatcher
 * @constructor
 * @param {Object} opts An object containing configurations required by the Core derived class.
 *
 */
(function () {
    var instance = null;
    var EventDispatcher = core.events.EventDispatcher;
    var __super__ = EventDispatcher.prototype;
    function EventBroadcaster(opts) {
        if (opts && opts.__inheriting__) return;
        EventDispatcher.call(this, opts);
    }
    EventBroadcaster.inherits(EventDispatcher);
    var proto = EventBroadcaster.prototype;
    proto.construct = function (opts) {
        //create
        __super__.construct.call(this, opts);
    };
    proto.dispose = function () {
        //clear
        __super__.dispose.call(this);
    };
    var o = {
        init:function () {
            if (instance == null) {
                instance = new EventBroadcaster();
            }
            return instance;
        }
    };
    o.instance = o.init;
    core.registerNamespace("core.events.EventBroadcaster", o);
})();
/**
 * ** Singleton. ** <br>The base object of all core based classes. Every object created within the Core framework derives from this class.
 *
 * @class XHR
 * @namespace core.net
 * @extends core.Core
 * @constructor
 * @param {Object} opts An object containing configurations required by the Core class.
 * @param {Object} opts.el The node element included in the class composition.
 *
 */
(function () {
    var instance = null;
    var Core = core.Core;
    var __super__ = Core.prototype;
    var __xhr__ = function( a ){
        for(a=0;a<4;a++)
            try {
                return a ? new ActiveXObject([,"Msxml2", "Msxml3", "Microsoft"][a] + ".XMLHTTP" ) : new XMLHttpRequest
            } catch(e){

            }
    };
    function XHR(opts) {
        if (opts && opts.__inheriting__) return;
        Core.call(this, opts);
    }
    XHR.inherits(Core);
    var proto = XHR.prototype;
    proto.construct = function (opts) {
        __super__.construct.call(this, opts);
        this.settingsCache = {};
    };
    proto.dispose = function () {
        instance = null;
        this.settingsCache = null;
        delete this.settingsCache;
        __super__.dispose.call(this);
    };
    var parseResponse = function(resp, format){
        if(format === "json"){
            try{
                return JSON.parse(resp);
            }catch(err){
                return null;
            }
        }
        if(format === "html"){
            return resp.trim();
        }
        return resp;
    };
    var applyConfig = function(o){
        for(var prop in this.settingsCache){
            if(!o[prop]){
                o[prop] = this.settingsCache[prop];
            }
        }
        return o;
    };
    proto.setConfig = function(o){
        this.settingsCache = o;
    };
    /**
     * Create and send http request using XHR (XMLHttpRequest).
     *
     * @method request
     * @param {Object} config The configuration object containing required properties for creating xml http requests.
     * @param {String} config.url The URL where the request is to be made.
     * @param {String} config.method "post"/"get"
     * @param {Object|String} config.data The data to send to the requested end point (string will be converted to "get")
     * @param {Boolean} config.async true/false whether to request asynchronously or synchronously respectively.
     * @param {String} config.dataType "plain"|"html"|"json" The data format to expect as a response from the request.
     * @param {String} config.contentType The content type to set on the request headers (i.e. "application/x-www-form-urlencoded")
     * @param {Function} config.callback The method handler to call after a successful request.
     * @param {Function} config.error The method handler to call after an error on the request.
     *
     */
    proto.request = function(o) {
        if(o == undefined) throw new Error("XHR:Invalid parameters");
        o = applyConfig.call(this, o);
        var req = __xhr__();
        var method = o.method || "get";
        o.location = o.url || o.location;
        var async = o.async = (typeof o.async != 'undefined' ? o.async : true);
        req.queryString = o.data || null;
        req.open(method, o.location+(o.nocache ? "?cache="+new Date().getTime() : ""), async);
        try{
            req.setRequestHeader('X-Requested-With','XMLHttpRequest');
        }catch(err){
            throw new Error("XHR: " + err);
        }
        var format = o.dataType || o.format || "plain";

        if (method.toLowerCase() === 'post') req.setRequestHeader('Content-Type', o.contentType || 'application/x-www-form-urlencoded');
        var rstate = function() {
            if(req.readyState===4) {
                if(req.status === 0 || req.status===200){
                    o.callback(parseResponse.call(this, req.responseText, format));
                }
                /*
                if((/^[45]/).test(req.status)) {
                    try{
                        o.error();
                    }catch(err){
                    }

                }*/
                req = null;
                o = null;
            }else{
                switch(req.readyState){
                    case 1:
                        try{
                            o.requestSetup();
                        }catch(err) {}
                        break;
                    case 2:
                        try{
                            o.requestSent();
                        }catch(err) {}
                        break;
                    case 3:
                        try{
                            o.requestInProcess();
                        }catch(err) {}
                }
            }
        }
        if(async){
            req.onreadystatechange = rstate;
            if(!async) rstate();
        }
        try{
            req.send(o.data || null);
        }catch(err){
            o.error(err);
            o = null;
            req = null;
        }

    };
    var o = {
        init:function () {
            if (instance == null) {
                instance = new XHR();
            }
            return instance;
        }
    };
    o.instance = o.init;
    core.registerNamespace("core.net.XHR", o);
})();
/**
 * The base object of all core based classes. Every object created within the Core framework derives from this class.
 *
 * @class Document
 * @namespace core.wirings
 * @extends core.events.EventDispatcher
 * @constructor
 * @param {Object} opts An object containing configurations required by the Core derived class.
 * @param {HTMLElement} opts.el The node element included in the class composition.
 *
 */
(function (scope) {
    var Core = core._import("core.Core"),
        __super__ = Core.prototype;

    function Document(opts) {
        if (opts && opts.__inheriting__) return;
        Core.call(this, opts);
    }
    Document.inherits(Core);
    function _isready(win, fn) {
        var done = false, top = true,

            doc = win.document, root = doc.documentElement,

            add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
            rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
            pre = doc.addEventListener ? '' : 'on',

            init = function(e) {
                if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
                (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
                if (!done && (done = true)) fn.call(win, e.type || e);
            },

            poll = function() {
                try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
                init('poll');
            };

        if (doc.readyState == 'complete') fn.call(win, 'lazy');
        else {
            if (doc.createEventObject && root.doScroll) {
                try { top = !win.frameElement; } catch(e) { }
                if (top) poll();
            }
            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            win[add](pre + 'load', init, false);
        }
    }
    var proto = Document.prototype;
    proto.construct = function (opts) {
        //create
        __super__.construct.call(this, opts);
        if(typeof document !== 'undefined'){
            _isready(window, this.getProxyHandler("onDocumentReady"));
        }
    };
    proto.dispose = function (removeNode) {
        //clear
        __super__.dispose.call(this, removeNode);
    };
    var findRootClass = function(){
        var root = document.body;
        if(root.hasAttribute("core-app") || root.hasAttribute("data-root")){
            var scope = typeof process !== "undefined" && process.arch !== undefined ? GLOBAL : window;
            var cls = Function.apply(scope, ["return "+(root.hasAttribute("core-app") ? root.getAttribute("core-app") : root.getAttribute("data-root"))])();
            var opts = root.getAttribute("data-params") ? JSON.parse(root.getAttribute("data-params")) : {};
            opts.el = root;
            window.__coreapp__ = new cls(opts);
        }else{
            doc = null;
        }
    };
    proto.onDocumentReady = function(automate){
        if(automate){
            findRootClass.call(this);
        }
    };
    setTimeout(function(){
        var doc = new Document();
    }, 1);

})(typeof process !== "undefined" && process.arch !== undefined ? GLOBAL : window);
/**
 * The base object of all core based classes. Every object created within the Core framework derives from this class.
 *
 * @class Module
 * @namespace core.wirings
 * @extends core.events.EventDispatcher
 * @constructor
 * @param {Object} opts An object containing configurations required by the Core derived class.
 * @param {HTMLElement} opts.el The node element included in the class composition.
 *
 */
(function (scope) {
    var EventDispatcher = core.events.EventDispatcher,
        __super__ = EventDispatcher.prototype;
    function Module(opts) {
        if (opts && opts.__inheriting__) return;
        if(opts && opts.parent){
            this.parent = opts.parent;
        }
        EventDispatcher.call(this, opts);
    }
    Module.inherits(EventDispatcher);
    var proto = Module.prototype;
    proto.delayedConstruct = function (opts) {
        //create
        findImmediateClasses.call(this, this.el);
        this.initialized(opts);
    };
    proto.dispose = function (removeNode) {
        //clear
        __super__.dispose.call(this, removeNode);
    };
    function findImmediateClasses(node) {
        var recurse = function(modules) {
            var i = -1,
                cls,
                opts,
                len = modules.length-1;
            while(i++ < len){
                var mod = modules[i];
                if(mod.nodeType == 1){
                    var cmod = mod.getAttribute("core-module");
                    var cid = mod.getAttribute("core-id");
                    var params = mod.getAttribute("core-params");
                    if(cmod && cid && !this[cid]){
                        cls = Function.apply(scope, ["return "+cmod])();
                        opts = params ? JSON.parse(params) : {};
                        opts.el = mod;
                        opts.parent = this;
                        this[cid] = new cls(opts);
                    }else if(cmod && !cid){
                        cls = Function.apply(scope, ["return "+cmod])();
                        opts = params ? JSON.parse(params) : {};
                        opts.parent = this;
                        opts.el = mod;
                        new cls(opts); //do not assign to any property
                    }else if(cmod && cid && this[cid]){
                        cls = Function.apply(scope, ["return "+cmod])();
                        opts = params ? JSON.parse(params) : {};
                        opts.el = mod;
                        opts.parent = this;
                        var o = new cls(opts);
                        try{
                            this[cid].push(o);
                        }catch(err){
                            this[cid] = [this[cid]];
                            this[cid].push(o);
                        }
                    }else if(mod.hasChildNodes()){
                        recurse.call(this, mod.childNodes);
                    }
                }
            }
        };
        recurse.call(this, node.childNodes);
    }
    core.registerNamespace("core.wirings.Module", Module);
})(typeof process !== "undefined" && process.arch !== undefined ? GLOBAL : window);
(function(scope) {
    // Overwrite requestAnimationFrame so it works across browsers
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !scope.requestAnimationFrame; ++x) {
        scope.requestAnimationFrame = scope[vendors[x]+'RequestAnimationFrame'];
        scope.cancelAnimationFrame =
            scope[vendors[x]+'CancelAnimationFrame'] || scope[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!scope.requestAnimationFrame)
        scope.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = scope.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!scope.cancelAnimationFrame)
        scope.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };

}(typeof process !== "undefined" && process.arch !== undefined ? GLOBAL : window));
// Math prototypes
// ----------------
// Additional methods to the Math prototype.
(function(){
    //
    //### Math.randomFloat ######
    //Generates a random float<br>
    if(!Math.randomFloat){
        Math.randomFloat = function(min, max){
            return (Math.random() * (max - min)) + min;
        };
    }

    //
    //### Math.randomFloat ######
    //Generates a random int<br>
    if(!Math.randomInt){
        Math.randomInt = function(min, max){
            return Math.min(max, Math.floor(Math.random() * (1 + max - min)) + min);
        };
    }
    //
    //### Math.aspectScaleHeight ######
    //Maintains scale ratio resizing using a target/intended height<br>
    Math.aspectScaleHeight = function(origW, origH, targH){
        return {height:targH, width:(targH/origH)*origW};
    };
    //### Math.aspectScaleWidth ######
    //Maintains scale ratio resizing using a target/intended width<br>
    Math.aspectScaleWidth = function(origW, origH, targW){
        return {height:(targW/origH)*oh, width:targW};
    };
})();

// String prototypes
// ----------------
// Additional methods to the String prototype.
(function(){

    if(typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        }
    }

})();
define('core-js', ['core-js/core.src'], function (main) { return main; });

define('aurelia-loader/loader',['exports', 'core-js', './template-registry-entry'], function (exports, _coreJs, _templateRegistryEntry) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var hasTemplateElement = ('content' in document.createElement('template'));

  function importElements(frag, link, callback) {
    document.head.appendChild(frag);

    if (window.Polymer && Polymer.whenReady) {
      Polymer.whenReady(callback);
    } else {
      link.addEventListener('load', callback);
    }
  }

  var Loader = (function () {
    function Loader() {
      _classCallCheck(this, Loader);

      this.templateRegistry = {};
    }

    _createClass(Loader, [{
      key: 'loadModule',
      value: function loadModule(id) {
        throw new Error('Loaders must implement loadModule(id).');
      }
    }, {
      key: 'loadAllModules',
      value: function loadAllModules(ids) {
        throw new Error('Loader must implement loadAllModules(ids).');
      }
    }, {
      key: 'loadTemplate',
      value: function loadTemplate(url) {
        throw new Error('Loader must implement loadTemplate(url).');
      }
    }, {
      key: 'getOrCreateTemplateRegistryEntry',
      value: function getOrCreateTemplateRegistryEntry(id) {
        var entry = this.templateRegistry[id];

        if (entry === undefined) {
          this.templateRegistry[id] = entry = new _templateRegistryEntry.TemplateRegistryEntry(id);
        }

        return entry;
      }
    }, {
      key: 'importDocument',
      value: function importDocument(url) {
        return new Promise(function (resolve, reject) {
          var frag = document.createDocumentFragment();
          var link = document.createElement('link');

          link.rel = 'import';
          link.href = url;
          frag.appendChild(link);

          importElements(frag, link, function () {
            return resolve(link['import']);
          });
        });
      }
    }, {
      key: 'importTemplate',
      value: function importTemplate(url) {
        var _this = this;

        return this.importDocument(url).then(function (doc) {
          return _this.findTemplate(doc, url);
        });
      }
    }, {
      key: 'findTemplate',
      value: function findTemplate(doc, url) {
        if (!hasTemplateElement) {
          HTMLTemplateElement.bootstrap(doc);
        }

        var template = doc.getElementsByTagName('template')[0];

        if (!template) {
          throw new Error('There was no template element found in \'' + url + '\'.');
        }

        return template;
      }
    }]);

    return Loader;
  })();

  exports.Loader = Loader;
});
define('aurelia-loader/index',['exports', './template-registry-entry', './loader'], function (exports, _templateRegistryEntry, _loader) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, 'TemplateRegistryEntry', {
    enumerable: true,
    get: function get() {
      return _templateRegistryEntry.TemplateRegistryEntry;
    }
  });
  Object.defineProperty(exports, 'TemplateDependency', {
    enumerable: true,
    get: function get() {
      return _templateRegistryEntry.TemplateDependency;
    }
  });
  Object.defineProperty(exports, 'Loader', {
    enumerable: true,
    get: function get() {
      return _loader.Loader;
    }
  });
});
define('aurelia-loader', ['aurelia-loader/index'], function (main) { return main; });

define('aurelia-metadata/origin',['exports', 'core-js'], function (exports, _coreJs) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var originStorage = new Map();

  function ensureType(value) {
    if (value instanceof Origin) {
      return value;
    }

    return new Origin(value);
  }

  var Origin = (function () {
    function Origin(moduleId, moduleMember) {
      _classCallCheck(this, Origin);

      this.moduleId = moduleId;
      this.moduleMember = moduleMember;
    }

    _createClass(Origin, null, [{
      key: 'get',
      value: function get(fn) {
        var origin = originStorage.get(fn);

        if (origin !== undefined) {
          return origin;
        }

        if (typeof fn.origin === 'function') {
          originStorage.set(fn, origin = ensureType(fn.origin()));
        } else if (fn.origin !== undefined) {
          originStorage.set(fn, origin = ensureType(fn.origin));
        }

        return origin;
      }
    }, {
      key: 'set',
      value: function set(fn, origin) {
        if (Origin.get(fn) === undefined) {
          originStorage.set(fn, origin);
        }
      }
    }]);

    return Origin;
  })();

  exports.Origin = Origin;
});
define('aurelia-metadata/resource-type',['exports'], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var ResourceType = (function () {
    function ResourceType() {
      _classCallCheck(this, ResourceType);
    }

    _createClass(ResourceType, [{
      key: 'load',
      value: function load(container, target) {
        return Promise.resolve(this);
      }
    }, {
      key: 'register',
      value: function register(registry, name) {
        throw new Error('All descendents of "ResourceType" must implement the "register" method.');
      }
    }]);

    return ResourceType;
  })();

  exports.ResourceType = ResourceType;
});
define('aurelia-metadata/metadata',['exports', 'core-js'], function (exports, _coreJs) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var metadataStoreLookup = new Map(),
      locateMetadataElsewhere;

  var MetadataStore = (function () {
    function MetadataStore(owner) {
      _classCallCheck(this, MetadataStore);

      this._owner = owner;
      this._first = null;
      this._second = null;
      this._third = null;
      this._rest = null;
    }

    _createClass(MetadataStore, [{
      key: 'first',
      value: function first(type, searchPrototype) {
        var potential, i, ii, rest;

        if (this._first instanceof type) {
          return this._first;
        }

        if (this._second instanceof type) {
          return this._second;
        }

        if (this._third instanceof type) {
          return this._third;
        }

        rest = this._rest;
        if (rest !== null) {
          for (i = 0, ii = rest.length; i < ii; ++i) {
            potential = rest[i];
            if (potential instanceof type) {
              return potential;
            }
          }
        }

        if (searchPrototype && this._owner !== undefined) {
          return Metadata.on(Object.getPrototypeOf(this._owner)).first(type, searchPrototype);
        }

        return null;
      }
    }, {
      key: 'has',
      value: function has(type, searchPrototype) {
        return this.first(type, searchPrototype) !== null;
      }
    }, {
      key: 'all',
      value: function all(type, searchPrototype) {
        var potential,
            i,
            ii,
            rest,
            found = [];

        if (this._first instanceof type) {
          found.push(this._first);
        }

        if (this._second instanceof type) {
          found.push(this._second);
        }

        if (this._third instanceof type) {
          found.push(this._third);
        }

        rest = this._rest;
        if (rest !== null) {
          for (i = 0, ii = rest.length; i < ii; ++i) {
            potential = rest[i];
            if (potential instanceof type) {
              found.push(potential);
            }
          }
        }

        if (searchPrototype && this._owner !== undefined) {
          found = found.concat(Metadata.on(Object.getPrototypeOf(this._owner)).all(type, searchPrototype));
        }

        return found;
      }
    }, {
      key: 'firstOrAdd',
      value: function firstOrAdd(type, searchPrototype) {
        var existing = this.first(type, searchPrototype);
        if (existing === null) {
          existing = new type();
          this.add(existing);
        }
        return existing;
      }
    }, {
      key: 'add',
      value: function add(instance) {
        if (this._first === null) {
          this._first = instance;
          return;
        }

        if (this._second === null) {
          this._second = instance;
          return;
        }

        if (this._third === null) {
          this._third = instance;
          return;
        }

        if (this._rest === null) {
          this._rest = [];
        }

        this._rest.push(instance);

        return this;
      }
    }]);

    return MetadataStore;
  })();

  exports.MetadataStore = MetadataStore;
  var Metadata = {
    none: Object.freeze(new MetadataStore()),
    on: function on(owner) {
      var metadata;

      if (!owner) {
        return this.none;
      }

      metadata = metadataStoreLookup.get(owner);
      if (metadata !== undefined && metadata._owner === owner) {
        return metadata;
      }

      metadata = new MetadataStore(owner);
      metadataStoreLookup.set(owner, metadata);

      if (owner.hasOwnProperty('decorators')) {
        var applicator;

        if (typeof owner.decorators === 'function') {
          applicator = owner.decorators();
        } else {
          applicator = owner.decorators;
        }

        if (typeof applicator._decorate === 'function') {
          applicator._decorate(owner);
        } else {
          throw new Error('The return value of your decorator\'s method was not valid.');
        }
      } else if (locateMetadataElsewhere !== undefined) {
        locateMetadataElsewhere(owner, metadata);
      }

      return metadata;
    },
    configure: {
      locator: function locator(loc) {
        if (locateMetadataElsewhere === undefined) {
          locateMetadataElsewhere = loc;
          return;
        }

        var original = locateMetadataElsewhere;
        locateMetadataElsewhere = function (fn, meta) {
          original(fn, meta);
          loc(fn, meta);
        };
      }
    }
  };
  exports.Metadata = Metadata;
});
define('aurelia-metadata/decorator-applicator',['exports', './metadata'], function (exports, _metadata) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var DecoratorApplicator = (function () {
    function DecoratorApplicator() {
      _classCallCheck(this, DecoratorApplicator);

      this._first = null;
      this._second = null;
      this._third = null;
      this._rest = null;
    }

    _createClass(DecoratorApplicator, [{
      key: 'decorator',
      value: (function (_decorator) {
        function decorator(_x) {
          return _decorator.apply(this, arguments);
        }

        decorator.toString = function () {
          return _decorator.toString();
        };

        return decorator;
      })(function (decorator) {
        if (this._first === null) {
          this._first = decorator;
          return this;
        }

        if (this._second === null) {
          this._second = decorator;
          return this;
        }

        if (this._third === null) {
          this._third = decorator;
          return this;
        }

        if (this._rest === null) {
          this._rest = [];
        }

        this._rest.push(decorator);

        return this;
      })
    }, {
      key: '_decorate',
      value: function _decorate(target) {
        var i, ii, rest;

        if (this._first !== null) {
          this._first(target);
        }

        if (this._second !== null) {
          this._second(target);
        }

        if (this._third !== null) {
          this._third(target);
        }

        rest = this._rest;
        if (rest !== null) {
          for (i = 0, ii = rest.length; i < ii; ++i) {
            rest[i](target);
          }
        }
      }
    }]);

    return DecoratorApplicator;
  })();

  exports.DecoratorApplicator = DecoratorApplicator;
});
define('aurelia-metadata/decorators',['exports', './decorator-applicator'], function (exports, _decoratorApplicator) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var Decorators = {
    configure: {
      parameterizedDecorator: function parameterizedDecorator(name, decorator) {
        Decorators[name] = function () {
          var applicator = new _decoratorApplicator.DecoratorApplicator();
          return applicator[name].apply(applicator, arguments);
        };

        _decoratorApplicator.DecoratorApplicator.prototype[name] = function () {
          var result = decorator.apply(null, arguments);
          return this.decorator(result);
        };
      },
      simpleDecorator: function simpleDecorator(name, decorator) {
        Decorators[name] = function () {
          return new _decoratorApplicator.DecoratorApplicator().decorator(decorator);
        };

        _decoratorApplicator.DecoratorApplicator.prototype[name] = function () {
          return this.decorator(decorator);
        };
      }
    }
  };
  exports.Decorators = Decorators;
});
define('aurelia-metadata/index',['exports', './origin', './resource-type', './metadata', './decorators'], function (exports, _origin, _resourceType, _metadata, _decorators) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, 'Origin', {
    enumerable: true,
    get: function get() {
      return _origin.Origin;
    }
  });
  Object.defineProperty(exports, 'ResourceType', {
    enumerable: true,
    get: function get() {
      return _resourceType.ResourceType;
    }
  });
  Object.defineProperty(exports, 'Metadata', {
    enumerable: true,
    get: function get() {
      return _metadata.Metadata;
    }
  });
  Object.defineProperty(exports, 'Decorators', {
    enumerable: true,
    get: function get() {
      return _decorators.Decorators;
    }
  });
});
define('aurelia-metadata', ['aurelia-metadata/index'], function (main) { return main; });

define('aurelia-loader-default',['exports', 'aurelia-metadata', 'aurelia-loader'], function (exports, _aureliaMetadata, _aureliaLoader) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  if (!window.System || !window.System['import']) {
    var sys = window.System = window.System || {};

    sys.polyfilled = true;
    sys.map = {};

    sys['import'] = function (moduleId) {
      return new Promise(function (resolve, reject) {
        require([moduleId], resolve, reject);
      });
    };

    sys.normalize = function (url) {
      return Promise.resolve(url);
    };
  }

  function ensureOriginOnExports(executed, name) {
    var target = executed,
        key,
        exportedValue;

    if (target.__useDefault) {
      target = target['default'];
    }

    _aureliaMetadata.Origin.set(target, new _aureliaMetadata.Origin(name, 'default'));

    for (key in target) {
      exportedValue = target[key];

      if (typeof exportedValue === 'function') {
        _aureliaMetadata.Origin.set(exportedValue, new _aureliaMetadata.Origin(name, key));
      }
    }

    return executed;
  }

  var DefaultLoader = (function (_Loader) {
    function DefaultLoader() {
      _classCallCheck(this, DefaultLoader);

      _get(Object.getPrototypeOf(DefaultLoader.prototype), 'constructor', this).call(this);

      this.moduleRegistry = {};
      var that = this;

      if (System.polyfilled) {
        define('view', [], {
          load: function load(name, req, onload, config) {
            var entry = that.getOrCreateTemplateRegistryEntry(name),
                address;

            if (entry.templateIsLoaded) {
              onload(entry);
              return;
            }

            address = req.toUrl(name);

            that.importTemplate(address).then(function (template) {
              entry.setTemplate(template);
              onload(entry);
            });
          }
        });
      } else {
        System.set('view', System.newModule({
          fetch: (function (_fetch) {
            function fetch(_x, _x2) {
              return _fetch.apply(this, arguments);
            }

            fetch.toString = function () {
              return _fetch.toString();
            };

            return fetch;
          })(function (load, fetch) {
            var id = load.name.substring(0, load.name.indexOf('!'));
            var entry = load.metadata.templateRegistryEntry = that.getOrCreateTemplateRegistryEntry(id);

            if (entry.templateIsLoaded) {
              return '';
            }

            return that.importTemplate(load.address).then(function (template) {
              entry.setTemplate(template);
              return '';
            });
          }),
          instantiate: function instantiate(load) {
            return load.metadata.templateRegistryEntry;
          }
        }));
      }
    }

    _inherits(DefaultLoader, _Loader);

    _createClass(DefaultLoader, [{
      key: 'loadModule',
      value: function loadModule(id) {
        var _this = this;

        return System.normalize(id).then(function (newId) {
          var existing = _this.moduleRegistry[newId];
          if (existing) {
            return existing;
          }

          return System['import'](newId).then(function (m) {
            _this.moduleRegistry[newId] = m;
            return ensureOriginOnExports(m, newId);
          });
        });
      }
    }, {
      key: 'loadAllModules',
      value: function loadAllModules(ids) {
        var loads = [];

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = ids[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var id = _step.value;

            loads.push(this.loadModule(id));
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return Promise.all(loads);
      }
    }, {
      key: 'loadTemplate',
      value: function loadTemplate(url) {
        if (System.polyfilled) {
          return System['import']('view!' + url);
        } else {
          return System['import'](url + '!view');
        }
      }
    }]);

    return DefaultLoader;
  })(_aureliaLoader.Loader);

  exports.DefaultLoader = DefaultLoader;

  window.AureliaLoader = DefaultLoader;
});
define('aurelia-task-queue',['exports'], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var BrowserMutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var hasSetImmediate = typeof setImmediate === 'function';

  function makeRequestFlushFromMutationObserver(flush) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, { characterData: true });
    return function requestFlush() {
      toggle = -toggle;
      node.data = toggle;
    };
  }

  function makeRequestFlushFromTimer(flush) {
    return function requestFlush() {
      var timeoutHandle = setTimeout(handleFlushTimer, 0);

      var intervalHandle = setInterval(handleFlushTimer, 50);
      function handleFlushTimer() {
        clearTimeout(timeoutHandle);
        clearInterval(intervalHandle);
        flush();
      }
    };
  }

  var TaskQueue = (function () {
    function TaskQueue() {
      var _this = this;

      _classCallCheck(this, TaskQueue);

      this.microTaskQueue = [];
      this.microTaskQueueCapacity = 1024;
      this.taskQueue = [];

      if (typeof BrowserMutationObserver === 'function') {
        this.requestFlushMicroTaskQueue = makeRequestFlushFromMutationObserver(function () {
          return _this.flushMicroTaskQueue();
        });
      } else {
        this.requestFlushMicroTaskQueue = makeRequestFlushFromTimer(function () {
          return _this.flushMicroTaskQueue();
        });
      }

      this.requestFlushTaskQueue = makeRequestFlushFromTimer(function () {
        return _this.flushTaskQueue();
      });
    }

    _createClass(TaskQueue, [{
      key: 'queueMicroTask',
      value: function queueMicroTask(task) {
        if (this.microTaskQueue.length < 1) {
          this.requestFlushMicroTaskQueue();
        }

        this.microTaskQueue.push(task);
      }
    }, {
      key: 'queueTask',
      value: function queueTask(task) {
        if (this.taskQueue.length < 1) {
          this.requestFlushTaskQueue();
        }

        this.taskQueue.push(task);
      }
    }, {
      key: 'flushTaskQueue',
      value: function flushTaskQueue() {
        var queue = this.taskQueue,
            index = 0,
            task;

        this.taskQueue = [];

        while (index < queue.length) {
          task = queue[index];

          try {
            task.call();
          } catch (error) {
            this.onError(error, task);
          }

          index++;
        }
      }
    }, {
      key: 'flushMicroTaskQueue',
      value: function flushMicroTaskQueue() {
        var queue = this.microTaskQueue,
            capacity = this.microTaskQueueCapacity,
            index = 0,
            task;

        while (index < queue.length) {
          task = queue[index];

          try {
            task.call();
          } catch (error) {
            this.onError(error, task);
          }

          index++;

          if (index > capacity) {
            for (var scan = 0; scan < index; scan++) {
              queue[scan] = queue[scan + index];
            }

            queue.length -= index;
            index = 0;
          }
        }

        queue.length = 0;
      }
    }, {
      key: 'onError',
      value: function onError(error, task) {
        if ('onError' in task) {
          task.onError(error);
        } else if (hasSetImmediate) {
          setImmediate(function () {
            throw error;
          });
        } else {
          setTimeout(function () {
            throw error;
          }, 0);
        }
      }
    }]);

    return TaskQueue;
  })();

  exports.TaskQueue = TaskQueue;
});
define('aurelia-logging',['exports'], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.AggregateError = AggregateError;
  exports.getLogger = getLogger;
  exports.addAppender = addAppender;
  exports.setLevel = setLevel;

  function AggregateError(msg, inner, skipIfAlreadyAggregate) {
    if (inner) {
      if (inner.innerError && skipIfAlreadyAggregate) {
        return inner;
      }

      if (inner.stack) {
        msg += '\n------------------------------------------------\ninner error: ' + inner.stack;
      }
    }

    var err = new Error(msg);
    if (inner) {
      err.innerError = inner;
    }

    return err;
  }

  var levels = {
    none: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4
  };

  exports.levels = levels;
  var loggers = {},
      logLevel = levels.none,
      appenders = [],
      slice = Array.prototype.slice,
      loggerConstructionKey = {};

  function log(logger, level, args) {
    var i = appenders.length,
        current;

    args = slice.call(args);
    args.unshift(logger);

    while (i--) {
      current = appenders[i];
      current[level].apply(current, args);
    }
  }

  function debug() {
    if (logLevel < 4) {
      return;
    }

    log(this, 'debug', arguments);
  }

  function info() {
    if (logLevel < 3) {
      return;
    }

    log(this, 'info', arguments);
  }

  function warn() {
    if (logLevel < 2) {
      return;
    }

    log(this, 'warn', arguments);
  }

  function error() {
    if (logLevel < 1) {
      return;
    }

    log(this, 'error', arguments);
  }

  function connectLogger(logger) {
    logger.debug = debug;
    logger.info = info;
    logger.warn = warn;
    logger.error = error;
  }

  function createLogger(id) {
    var logger = new Logger(id, loggerConstructionKey);

    if (appenders.length) {
      connectLogger(logger);
    }

    return logger;
  }

  function getLogger(id) {
    return loggers[id] || (loggers[id] = createLogger(id));
  }

  function addAppender(appender) {
    appenders.push(appender);

    if (appenders.length === 1) {
      for (var key in loggers) {
        connectLogger(loggers[key]);
      }
    }
  }

  function setLevel(level) {
    logLevel = level;
  }

  var Logger = (function () {
    function Logger(id, key) {
      _classCallCheck(this, Logger);

      if (key !== loggerConstructionKey) {
        throw new Error('You cannot instantiate "Logger". Use the "getLogger" API instead.');
      }

      this.id = id;
    }

    _createClass(Logger, [{
      key: 'debug',
      value: function debug() {}
    }, {
      key: 'info',
      value: function info() {}
    }, {
      key: 'warn',
      value: function warn() {}
    }, {
      key: 'error',
      value: function error() {}
    }]);

    return Logger;
  })();

  exports.Logger = Logger;
});
define('aurelia-logging-console',['exports'], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  (function (global) {
    
    global.console = global.console || {};
    var con = global.console;
    var prop, method;
    var empty = {};
    var dummy = function dummy() {};
    var properties = 'memory'.split(',');
    var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' + 'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' + 'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',');
    while (prop = properties.pop()) if (!con[prop]) con[prop] = empty;
    while (method = methods.pop()) if (!con[method]) con[method] = dummy;
  })(typeof window === 'undefined' ? undefined : window);

  var ConsoleAppender = (function () {
    function ConsoleAppender() {
      _classCallCheck(this, ConsoleAppender);
    }

    _createClass(ConsoleAppender, [{
      key: 'debug',
      value: function debug(logger, message) {
        for (var _len = arguments.length, rest = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          rest[_key - 2] = arguments[_key];
        }

        console.debug.apply(console, ['DEBUG [' + logger.id + '] ' + message].concat(rest));
      }
    }, {
      key: 'info',
      value: function info(logger, message) {
        for (var _len2 = arguments.length, rest = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          rest[_key2 - 2] = arguments[_key2];
        }

        console.info.apply(console, ['INFO [' + logger.id + '] ' + message].concat(rest));
      }
    }, {
      key: 'warn',
      value: function warn(logger, message) {
        for (var _len3 = arguments.length, rest = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
          rest[_key3 - 2] = arguments[_key3];
        }

        console.warn.apply(console, ['WARN [' + logger.id + '] ' + message].concat(rest));
      }
    }, {
      key: 'error',
      value: function error(logger, message) {
        for (var _len4 = arguments.length, rest = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
          rest[_key4 - 2] = arguments[_key4];
        }

        console.error.apply(console, ['ERROR [' + logger.id + '] ' + message].concat(rest));
      }
    }]);

    return ConsoleAppender;
  })();

  exports.ConsoleAppender = ConsoleAppender;
});
define('aurelia-history',['exports'], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var History = (function () {
    function History() {
      _classCallCheck(this, History);
    }

    _createClass(History, [{
      key: 'activate',
      value: function activate() {
        throw new Error('History must implement activate().');
      }
    }, {
      key: 'deactivate',
      value: function deactivate() {
        throw new Error('History must implement deactivate().');
      }
    }, {
      key: 'navigate',
      value: function navigate() {
        throw new Error('History must implement navigate().');
      }
    }, {
      key: 'navigateBack',
      value: function navigateBack() {
        throw new Error('History must implement navigateBack().');
      }
    }]);

    return History;
  })();

  exports.History = History;
});
define('aurelia-history-browser',['exports', 'core-js', 'aurelia-history'], function (exports, _coreJs, _aureliaHistory) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.install = install;

  var _core = _interopRequire(_coreJs);

  var routeStripper = /^[#\/]|\s+$/g;

  var rootStripper = /^\/+|\/+$/g;

  var isExplorer = /msie [\w.]+/;

  var trailingSlash = /\/$/;

  function updateHash(location, fragment, replace) {
    if (replace) {
      var href = location.href.replace(/(javascript:|#).*$/, '');
      location.replace(href + '#' + fragment);
    } else {
      location.hash = '#' + fragment;
    }
  }

  var BrowserHistory = (function (_History) {
    function BrowserHistory() {
      _classCallCheck(this, BrowserHistory);

      _get(Object.getPrototypeOf(BrowserHistory.prototype), 'constructor', this).call(this);

      this.interval = 50;
      this.active = false;
      this.previousFragment = '';
      this._checkUrlCallback = this.checkUrl.bind(this);

      if (typeof window !== 'undefined') {
        this.location = window.location;
        this.history = window.history;
      }
    }

    _inherits(BrowserHistory, _History);

    _createClass(BrowserHistory, [{
      key: 'getHash',
      value: function getHash(window) {
        var match = (window || this).location.href.match(/#(.*)$/);
        return match ? match[1] : '';
      }
    }, {
      key: 'getFragment',
      value: function getFragment(fragment, forcePushState) {
        var root;

        if (!fragment) {
          if (this._hasPushState || !this._wantsHashChange || forcePushState) {
            fragment = this.location.pathname + this.location.search;
            root = this.root.replace(trailingSlash, '');
            if (!fragment.indexOf(root)) {
              fragment = fragment.substr(root.length);
            }
          } else {
            fragment = this.getHash();
          }
        }

        return fragment.replace(routeStripper, '');
      }
    }, {
      key: 'activate',
      value: function activate(options) {
        if (this.active) {
          throw new Error('History has already been activated.');
        }

        this.active = true;

        this.options = Object.assign({}, { root: '/' }, this.options, options);
        this.root = this.options.root;
        this._wantsHashChange = this.options.hashChange !== false;
        this._wantsPushState = !!this.options.pushState;
        this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);

        var fragment = this.getFragment();

        this.root = ('/' + this.root + '/').replace(rootStripper, '/');

        if (this._hasPushState) {
          window.onpopstate = this._checkUrlCallback;
        } else if (this._wantsHashChange && 'onhashchange' in window) {
          window.addEventListener('hashchange', this._checkUrlCallback);
        } else if (this._wantsHashChange) {
          this._checkUrlInterval = setInterval(this._checkUrlCallback, this.interval);
        }

        this.fragment = fragment;

        var loc = this.location;
        var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

        if (this._wantsHashChange && this._wantsPushState) {
          if (!this._hasPushState && !atRoot) {
            this.fragment = this.getFragment(null, true);
            this.location.replace(this.root + this.location.search + '#' + this.fragment);

            return true;
          } else if (this._hasPushState && atRoot && loc.hash) {
            this.fragment = this.getHash().replace(routeStripper, '');
            this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
          }
        }

        if (!this.options.silent) {
          return this.loadUrl();
        }
      }
    }, {
      key: 'deactivate',
      value: function deactivate() {
        window.onpopstate = null;
        window.removeEventListener('hashchange', this._checkUrlCallback);
        clearInterval(this._checkUrlInterval);
        this.active = false;
      }
    }, {
      key: 'checkUrl',
      value: function checkUrl() {
        var current = this.getFragment();

        if (current === this.fragment && this.iframe) {
          current = this.getFragment(this.getHash(this.iframe));
        }

        if (current === this.fragment) {
          return false;
        }

        if (this.iframe) {
          this.navigate(current, false);
        }

        this.loadUrl();
      }
    }, {
      key: 'loadUrl',
      value: function loadUrl(fragmentOverride) {
        var fragment = this.fragment = this.getFragment(fragmentOverride);

        return this.options.routeHandler ? this.options.routeHandler(fragment) : false;
      }
    }, {
      key: 'navigate',
      value: function navigate(fragment, options) {
        if (fragment && fragment.indexOf('://') != -1) {
          window.location.href = fragment;
          return true;
        }

        if (!this.active) {
          return false;
        }

        if (options === undefined) {
          options = {
            trigger: true
          };
        } else if (typeof options === 'boolean') {
          options = {
            trigger: options
          };
        }

        fragment = this.getFragment(fragment || '');

        if (this.fragment === fragment) {
          return;
        }

        this.fragment = fragment;

        var url = this.root + fragment;

        if (fragment === '' && url !== '/') {
          url = url.slice(0, -1);
        }

        if (this._hasPushState) {
          this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);
        } else if (this._wantsHashChange) {
          updateHash(this.location, fragment, options.replace);

          if (this.iframe && fragment !== this.getFragment(this.getHash(this.iframe))) {
            if (!options.replace) {
              this.iframe.document.open().close();
            }

            updateHash(this.iframe.location, fragment, options.replace);
          }
        } else {
          return this.location.assign(url);
        }

        if (options.trigger) {
          return this.loadUrl(fragment);
        } else {
          this.previousFragment = fragment;
        }
      }
    }, {
      key: 'navigateBack',
      value: function navigateBack() {
        this.history.back();
      }
    }]);

    return BrowserHistory;
  })(_aureliaHistory.History);

  exports.BrowserHistory = BrowserHistory;

  function install(aurelia) {
    aurelia.withSingleton(_aureliaHistory.History, BrowserHistory);
  }
});
define('aurelia-event-aggregator',['exports'], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.includeEventsIn = includeEventsIn;
  exports.install = install;

  var Handler = (function () {
    function Handler(messageType, callback) {
      _classCallCheck(this, Handler);

      this.messageType = messageType;
      this.callback = callback;
    }

    _createClass(Handler, [{
      key: 'handle',
      value: function handle(message) {
        if (message instanceof this.messageType) {
          this.callback.call(null, message);
        }
      }
    }]);

    return Handler;
  })();

  var EventAggregator = (function () {
    function EventAggregator() {
      _classCallCheck(this, EventAggregator);

      this.eventLookup = {};
      this.messageHandlers = [];
    }

    _createClass(EventAggregator, [{
      key: 'publish',
      value: function publish(event, data) {
        var subscribers, i;

        if (typeof event === 'string') {
          subscribers = this.eventLookup[event];
          if (subscribers) {
            subscribers = subscribers.slice();
            i = subscribers.length;

            while (i--) {
              subscribers[i](data, event);
            }
          }
        } else {
          subscribers = this.messageHandlers.slice();
          i = subscribers.length;

          while (i--) {
            subscribers[i].handle(event);
          }
        }
      }
    }, {
      key: 'subscribe',
      value: function subscribe(event, callback) {
        var subscribers, handler;

        if (typeof event === 'string') {
          subscribers = this.eventLookup[event] || (this.eventLookup[event] = []);

          subscribers.push(callback);

          return function () {
            subscribers.splice(subscribers.indexOf(callback), 1);
          };
        } else {
          handler = new Handler(event, callback);
          subscribers = this.messageHandlers;

          subscribers.push(handler);

          return function () {
            subscribers.splice(subscribers.indexOf(handler), 1);
          };
        }
      }
    }, {
      key: 'subscribeOnce',
      value: function subscribeOnce(event, callback) {
        var sub = this.subscribe(event, function (data, event) {
          sub();
          return callback(data, event);
        });
        return sub;
      }
    }]);

    return EventAggregator;
  })();

  exports.EventAggregator = EventAggregator;

  function includeEventsIn(obj) {
    var ea = new EventAggregator();

    obj.subscribe = function (event, callback) {
      return ea.subscribe(event, callback);
    };

    obj.publish = function (event, data) {
      ea.publish(event, data);
    };

    return ea;
  }

  function install(aurelia) {
    aurelia.withInstance(EventAggregator, includeEventsIn(aurelia));
  }
});
define('aurelia-dependency-injection/metadata',['exports', 'core-js'], function (exports, _coreJs) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var Registration = (function () {
    function Registration() {
      _classCallCheck(this, Registration);
    }

    _createClass(Registration, [{
      key: 'register',
      value: function register(container, key, fn) {
        throw new Error('A custom Registration must implement register(container, key, fn).');
      }
    }]);

    return Registration;
  })();

  exports.Registration = Registration;

  var TransientRegistration = (function (_Registration) {
    function TransientRegistration(key) {
      _classCallCheck(this, TransientRegistration);

      _get(Object.getPrototypeOf(TransientRegistration.prototype), 'constructor', this).call(this);
      this.key = key;
    }

    _inherits(TransientRegistration, _Registration);

    _createClass(TransientRegistration, [{
      key: 'register',
      value: function register(container, key, fn) {
        container.registerTransient(this.key || key, fn);
      }
    }]);

    return TransientRegistration;
  })(Registration);

  exports.TransientRegistration = TransientRegistration;

  var SingletonRegistration = (function (_Registration2) {
    function SingletonRegistration(keyOrRegisterInChild) {
      var registerInChild = arguments[1] === undefined ? false : arguments[1];

      _classCallCheck(this, SingletonRegistration);

      _get(Object.getPrototypeOf(SingletonRegistration.prototype), 'constructor', this).call(this);

      if (typeof keyOrRegisterInChild === 'boolean') {
        this.registerInChild = keyOrRegisterInChild;
      } else {
        this.key = keyOrRegisterInChild;
        this.registerInChild = registerInChild;
      }
    }

    _inherits(SingletonRegistration, _Registration2);

    _createClass(SingletonRegistration, [{
      key: 'register',
      value: function register(container, key, fn) {
        var destination = this.registerInChild ? container : container.root;
        destination.registerSingleton(this.key || key, fn);
      }
    }]);

    return SingletonRegistration;
  })(Registration);

  exports.SingletonRegistration = SingletonRegistration;

  var Resolver = (function () {
    function Resolver() {
      _classCallCheck(this, Resolver);
    }

    _createClass(Resolver, [{
      key: 'get',
      value: function get(container) {
        throw new Error('A custom Resolver must implement get(container) and return the resolved instance(s).');
      }
    }]);

    return Resolver;
  })();

  exports.Resolver = Resolver;

  var Lazy = (function (_Resolver) {
    function Lazy(key) {
      _classCallCheck(this, Lazy);

      _get(Object.getPrototypeOf(Lazy.prototype), 'constructor', this).call(this);
      this.key = key;
    }

    _inherits(Lazy, _Resolver);

    _createClass(Lazy, [{
      key: 'get',
      value: function get(container) {
        var _this = this;

        return function () {
          return container.get(_this.key);
        };
      }
    }], [{
      key: 'of',
      value: function of(key) {
        return new Lazy(key);
      }
    }]);

    return Lazy;
  })(Resolver);

  exports.Lazy = Lazy;

  var All = (function (_Resolver2) {
    function All(key) {
      _classCallCheck(this, All);

      _get(Object.getPrototypeOf(All.prototype), 'constructor', this).call(this);
      this.key = key;
    }

    _inherits(All, _Resolver2);

    _createClass(All, [{
      key: 'get',
      value: function get(container) {
        return container.getAll(this.key);
      }
    }], [{
      key: 'of',
      value: function of(key) {
        return new All(key);
      }
    }]);

    return All;
  })(Resolver);

  exports.All = All;

  var Optional = (function (_Resolver3) {
    function Optional(key) {
      var checkParent = arguments[1] === undefined ? false : arguments[1];

      _classCallCheck(this, Optional);

      _get(Object.getPrototypeOf(Optional.prototype), 'constructor', this).call(this);
      this.key = key;
      this.checkParent = checkParent;
    }

    _inherits(Optional, _Resolver3);

    _createClass(Optional, [{
      key: 'get',
      value: function get(container) {
        if (container.hasHandler(this.key, this.checkParent)) {
          return container.get(this.key);
        }

        return null;
      }
    }], [{
      key: 'of',
      value: function of(key) {
        var checkParent = arguments[1] === undefined ? false : arguments[1];

        return new Optional(key, checkParent);
      }
    }]);

    return Optional;
  })(Resolver);

  exports.Optional = Optional;

  var Parent = (function (_Resolver4) {
    function Parent(key) {
      _classCallCheck(this, Parent);

      _get(Object.getPrototypeOf(Parent.prototype), 'constructor', this).call(this);
      this.key = key;
    }

    _inherits(Parent, _Resolver4);

    _createClass(Parent, [{
      key: 'get',
      value: function get(container) {
        return container.parent ? container.parent.get(this.key) : null;
      }
    }], [{
      key: 'of',
      value: function of(key) {
        return new Parent(key);
      }
    }]);

    return Parent;
  })(Resolver);

  exports.Parent = Parent;

  var InstanceActivator = (function () {
    function InstanceActivator() {
      _classCallCheck(this, InstanceActivator);
    }

    _createClass(InstanceActivator, [{
      key: 'invoke',
      value: function invoke(fn, args) {
        throw new Error('A custom Activator must implement invoke(fn, args).');
      }
    }]);

    return InstanceActivator;
  })();

  exports.InstanceActivator = InstanceActivator;

  var ClassActivator = (function (_InstanceActivator) {
    function ClassActivator() {
      _classCallCheck(this, ClassActivator);

      if (_InstanceActivator != null) {
        _InstanceActivator.apply(this, arguments);
      }
    }

    _inherits(ClassActivator, _InstanceActivator);

    _createClass(ClassActivator, [{
      key: 'invoke',
      value: function invoke(fn, args) {
        return Reflect.construct(fn, args);
      }
    }]);

    return ClassActivator;
  })(InstanceActivator);

  exports.ClassActivator = ClassActivator;

  var FactoryActivator = (function (_InstanceActivator2) {
    function FactoryActivator() {
      _classCallCheck(this, FactoryActivator);

      if (_InstanceActivator2 != null) {
        _InstanceActivator2.apply(this, arguments);
      }
    }

    _inherits(FactoryActivator, _InstanceActivator2);

    _createClass(FactoryActivator, [{
      key: 'invoke',
      value: function invoke(fn, args) {
        return fn.apply(undefined, args);
      }
    }]);

    return FactoryActivator;
  })(InstanceActivator);

  exports.FactoryActivator = FactoryActivator;
});
define('aurelia-dependency-injection/container',['exports', 'core-js', 'aurelia-metadata', 'aurelia-logging', './metadata'], function (exports, _coreJs, _aureliaMetadata, _aureliaLogging, _metadata) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var emptyParameters = Object.freeze([]),
      defaultActivator = new _metadata.ClassActivator();

  function test() {}
  if (!test.name) {
    Object.defineProperty(Function.prototype, 'name', {
      get: function get() {
        var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];

        Object.defineProperty(this, 'name', { value: name });
        return name;
      }
    });
  }

  var Container = (function () {
    function Container(constructionInfo) {
      _classCallCheck(this, Container);

      this.constructionInfo = constructionInfo || new Map();
      this.entries = new Map();
      this.root = this;
    }

    _createClass(Container, [{
      key: 'addParameterInfoLocator',
      value: function addParameterInfoLocator(locator) {
        if (this.locateParameterInfoElsewhere === undefined) {
          this.locateParameterInfoElsewhere = locator;
          return;
        }

        var original = this.locateParameterInfoElsewhere;
        this.locateParameterInfoElsewhere = function (fn) {
          return original(fn) || locator(fn);
        };
      }
    }, {
      key: 'registerInstance',
      value: function registerInstance(key, instance) {
        this.registerHandler(key, function (x) {
          return instance;
        });
      }
    }, {
      key: 'registerTransient',
      value: function registerTransient(key, fn) {
        fn = fn || key;
        this.registerHandler(key, function (x) {
          return x.invoke(fn);
        });
      }
    }, {
      key: 'registerSingleton',
      value: function registerSingleton(key, fn) {
        var singleton = null;
        fn = fn || key;
        this.registerHandler(key, function (x) {
          return singleton || (singleton = x.invoke(fn));
        });
      }
    }, {
      key: 'autoRegister',
      value: function autoRegister(fn, key) {
        var registration;

        if (fn === null || fn === undefined) {
          throw new Error('fn cannot be null or undefined.');
        }

        registration = _aureliaMetadata.Metadata.on(fn).first(_metadata.Registration, true);

        if (registration) {
          registration.register(this, key || fn, fn);
        } else {
          this.registerSingleton(key || fn, fn);
        }
      }
    }, {
      key: 'autoRegisterAll',
      value: function autoRegisterAll(fns) {
        var i = fns.length;
        while (i--) {
          this.autoRegister(fns[i]);
        }
      }
    }, {
      key: 'registerHandler',
      value: function registerHandler(key, handler) {
        this.getOrCreateEntry(key).push(handler);
      }
    }, {
      key: 'unregister',
      value: function unregister(key) {
        this.entries['delete'](key);
      }
    }, {
      key: 'get',
      value: function get(key) {
        var entry;

        if (key === null || key === undefined) {
          throw new Error('key cannot be null or undefined.');
        }

        if (key instanceof _metadata.Resolver) {
          return key.get(this);
        }

        if (key === Container) {
          return this;
        }

        entry = this.entries.get(key);

        if (entry !== undefined) {
          return entry[0](this);
        }

        if (this.parent) {
          return this.parent.get(key);
        }

        this.autoRegister(key);
        entry = this.entries.get(key);

        return entry[0](this);
      }
    }, {
      key: 'getAll',
      value: function getAll(key) {
        var _this = this;

        var entry;

        if (key === null || key === undefined) {
          throw new Error('key cannot be null or undefined.');
        }

        entry = this.entries.get(key);

        if (entry !== undefined) {
          return entry.map(function (x) {
            return x(_this);
          });
        }

        if (this.parent) {
          return this.parent.getAll(key);
        }

        return [];
      }
    }, {
      key: 'hasHandler',
      value: function hasHandler(key) {
        var checkParent = arguments[1] === undefined ? false : arguments[1];

        if (key === null || key === undefined) {
          throw new Error('key cannot be null or undefined.');
        }

        return this.entries.has(key) || checkParent && this.parent && this.parent.hasHandler(key, checkParent);
      }
    }, {
      key: 'createChild',
      value: function createChild() {
        var childContainer = new Container(this.constructionInfo);
        childContainer.parent = this;
        childContainer.root = this.root;
        childContainer.locateParameterInfoElsewhere = this.locateParameterInfoElsewhere;
        return childContainer;
      }
    }, {
      key: 'invoke',
      value: function invoke(fn) {
        try {
          var info = this.getOrCreateConstructionInfo(fn),
              keys = info.keys,
              args = new Array(keys.length),
              i,
              ii;

          for (i = 0, ii = keys.length; i < ii; ++i) {
            args[i] = this.get(keys[i]);
          }

          return info.activator.invoke(fn, args);
        } catch (e) {
          throw _aureliaLogging.AggregateError('Error instantiating ' + fn.name + '.', e, true);
        }
      }
    }, {
      key: 'getOrCreateEntry',
      value: function getOrCreateEntry(key) {
        var entry;

        if (key === null || key === undefined) {
          throw new Error('key cannot be null or undefined.');
        }

        entry = this.entries.get(key);

        if (entry === undefined) {
          entry = [];
          this.entries.set(key, entry);
        }

        return entry;
      }
    }, {
      key: 'getOrCreateConstructionInfo',
      value: function getOrCreateConstructionInfo(fn) {
        var info = this.constructionInfo.get(fn);

        if (info === undefined) {
          info = this.createConstructionInfo(fn);
          this.constructionInfo.set(fn, info);
        }

        return info;
      }
    }, {
      key: 'createConstructionInfo',
      value: function createConstructionInfo(fn) {
        var info = { activator: _aureliaMetadata.Metadata.on(fn).first(_metadata.InstanceActivator) || defaultActivator };

        if (fn.inject !== undefined) {
          if (typeof fn.inject === 'function') {
            info.keys = fn.inject();
          } else {
            info.keys = fn.inject;
          }

          return info;
        }

        if (this.locateParameterInfoElsewhere !== undefined) {
          info.keys = this.locateParameterInfoElsewhere(fn) || emptyParameters;
        } else {
          info.keys = emptyParameters;
        }

        return info;
      }
    }]);

    return Container;
  })();

  exports.Container = Container;
});
define('aurelia-dependency-injection/index',['exports', 'aurelia-metadata', './metadata', './container'], function (exports, _aureliaMetadata, _metadata, _container) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.inject = inject;
  exports.transient = transient;
  exports.singleton = singleton;
  exports.factory = factory;
  Object.defineProperty(exports, 'Registration', {
    enumerable: true,
    get: function get() {
      return _metadata.Registration;
    }
  });
  Object.defineProperty(exports, 'TransientRegistration', {
    enumerable: true,
    get: function get() {
      return _metadata.TransientRegistration;
    }
  });
  Object.defineProperty(exports, 'SingletonRegistration', {
    enumerable: true,
    get: function get() {
      return _metadata.SingletonRegistration;
    }
  });
  Object.defineProperty(exports, 'Resolver', {
    enumerable: true,
    get: function get() {
      return _metadata.Resolver;
    }
  });
  Object.defineProperty(exports, 'Lazy', {
    enumerable: true,
    get: function get() {
      return _metadata.Lazy;
    }
  });
  Object.defineProperty(exports, 'All', {
    enumerable: true,
    get: function get() {
      return _metadata.All;
    }
  });
  Object.defineProperty(exports, 'Optional', {
    enumerable: true,
    get: function get() {
      return _metadata.Optional;
    }
  });
  Object.defineProperty(exports, 'Parent', {
    enumerable: true,
    get: function get() {
      return _metadata.Parent;
    }
  });
  Object.defineProperty(exports, 'InstanceActivator', {
    enumerable: true,
    get: function get() {
      return _metadata.InstanceActivator;
    }
  });
  Object.defineProperty(exports, 'FactoryActivator', {
    enumerable: true,
    get: function get() {
      return _metadata.FactoryActivator;
    }
  });
  Object.defineProperty(exports, 'Container', {
    enumerable: true,
    get: function get() {
      return _container.Container;
    }
  });

  function inject() {
    for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
      rest[_key] = arguments[_key];
    }

    return function (target) {
      target.inject = rest;
    };
  }

  function transient(key) {
    return function (target) {
      _aureliaMetadata.Metadata.on(target).add(new _metadata.TransientRegistration(key));
    };
  }

  function singleton(keyOrRegisterInChild) {
    var registerInChild = arguments[1] === undefined ? false : arguments[1];

    return function (target) {
      _aureliaMetadata.Metadata.on(target).add(new _metadata.SingletonRegistration(keyOrRegisterInChild, registerInChild));
    };
  }

  function factory(target) {
    _aureliaMetadata.Metadata.on(target).add(new _metadata.FactoryActivator());
  }

  _aureliaMetadata.Decorators.configure.parameterizedDecorator('inject', inject);
  _aureliaMetadata.Decorators.configure.parameterizedDecorator('transient', transient);
  _aureliaMetadata.Decorators.configure.parameterizedDecorator('singleton', singleton);
  _aureliaMetadata.Decorators.configure.parameterizedDecorator('factory', factory);
});
define('aurelia-dependency-injection', ['aurelia-dependency-injection/index'], function (main) { return main; });

define('aurelia-framework/plugins',['exports', 'core-js', 'aurelia-logging', 'aurelia-metadata'], function (exports, _coreJs, _aureliaLogging, _aureliaMetadata) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var logger = _aureliaLogging.getLogger('aurelia');

  function loadPlugin(aurelia, loader, info) {
    logger.debug('Loading plugin ' + info.moduleId + '.');

    aurelia.currentPluginId = info.moduleId;

    return loader.loadModule(info.moduleId).then(function (exportedValue) {
      if ('install' in exportedValue) {
        var result = exportedValue.install(aurelia, info.config || {});

        if (result) {
          return result.then(function () {
            aurelia.currentPluginId = null;
            logger.debug('Installed plugin ' + info.moduleId + '.');
          });
        } else {
          logger.debug('Installed plugin ' + info.moduleId + '.');
        }
      } else {
        logger.debug('Loaded plugin ' + info.moduleId + '.');
      }

      aurelia.currentPluginId = null;
    });
  }

  var Plugins = (function () {
    function Plugins(aurelia) {
      _classCallCheck(this, Plugins);

      this.aurelia = aurelia;
      this.info = [];
      this.processed = false;
    }

    _createClass(Plugins, [{
      key: 'plugin',
      value: (function (_plugin) {
        function plugin(_x, _x2) {
          return _plugin.apply(this, arguments);
        }

        plugin.toString = function () {
          return _plugin.toString();
        };

        return plugin;
      })(function (moduleId, config) {
        var plugin = { moduleId: moduleId, config: config || {} };

        if (this.processed) {
          loadPlugin(this.aurelia, this.aurelia.loader, plugin);
        } else {
          this.info.push(plugin);
        }

        return this;
      })
    }, {
      key: 'es5',
      value: function es5() {
        Function.prototype.computed = function (computedProperties) {
          for (var key in computedProperties) {
            if (computedProperties.hasOwnProperty(key)) {
              Object.defineProperty(this.prototype, key, { get: computedProperties[key], enumerable: true });
            }
          }
        };

        return this;
      }
    }, {
      key: '_process',
      value: function _process() {
        var _this = this;

        var aurelia = this.aurelia,
            loader = aurelia.loader,
            info = this.info,
            current;

        if (this.processed) {
          return;
        }

        var next = (function (_next) {
          function next() {
            return _next.apply(this, arguments);
          }

          next.toString = function () {
            return _next.toString();
          };

          return next;
        })(function () {
          if (current = info.shift()) {
            return loadPlugin(aurelia, loader, current).then(next);
          }

          _this.processed = true;
          return Promise.resolve();
        });

        return next();
      }
    }]);

    return Plugins;
  })();

  exports.Plugins = Plugins;
});
define('aurelia-binding/value-converter',['exports', 'core-js', 'aurelia-metadata'], function (exports, _coreJs, _aureliaMetadata) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  function camelCase(name) {
    return name.charAt(0).toLowerCase() + name.slice(1);
  }

  var ValueConverterResource = (function (_ResourceType) {
    function ValueConverterResource(name) {
      _classCallCheck(this, ValueConverterResource);

      _get(Object.getPrototypeOf(ValueConverterResource.prototype), 'constructor', this).call(this);
      this.name = name;
    }

    _inherits(ValueConverterResource, _ResourceType);

    _createClass(ValueConverterResource, [{
      key: 'analyze',
      value: function analyze(container, target) {
        this.instance = container.get(target);
      }
    }, {
      key: 'register',
      value: function register(registry, name) {
        registry.registerValueConverter(name || this.name, this.instance);
      }
    }, {
      key: 'load',
      value: function load(container, target) {
        return Promise.resolve(this);
      }
    }], [{
      key: 'convention',
      value: function convention(name) {
        if (name.endsWith('ValueConverter')) {
          return new ValueConverterResource(camelCase(name.substring(0, name.length - 14)));
        }
      }
    }]);

    return ValueConverterResource;
  })(_aureliaMetadata.ResourceType);

  exports.ValueConverterResource = ValueConverterResource;
});
define('aurelia-binding/event-manager',['exports'], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var DefaultEventStrategy = (function () {
    function DefaultEventStrategy() {
      _classCallCheck(this, DefaultEventStrategy);

      this.delegatedEvents = {};
    }

    _createClass(DefaultEventStrategy, [{
      key: 'ensureDelegatedEvent',
      value: function ensureDelegatedEvent(eventName) {
        if (this.delegatedEvents[eventName]) {
          return;
        }

        this.delegatedEvents[eventName] = true;
        document.addEventListener(eventName, this.handleDelegatedEvent.bind(this), false);
      }
    }, {
      key: 'handleCallbackResult',
      value: function handleCallbackResult(result) {}
    }, {
      key: 'handleDelegatedEvent',
      value: function handleDelegatedEvent(event) {
        event = event || window.event;
        var target = event.target || event.srcElement,
            callback;

        while (target && !callback) {
          if (target.delegatedEvents) {
            callback = target.delegatedEvents[event.type];
          }

          if (!callback) {
            target = target.parentNode;
          }
        }

        if (callback) {
          this.handleCallbackResult(callback(event));
        }
      }
    }, {
      key: 'createDirectEventCallback',
      value: function createDirectEventCallback(callback) {
        var _this = this;

        return function (event) {
          _this.handleCallbackResult(callback(event));
        };
      }
    }, {
      key: 'subscribeToDelegatedEvent',
      value: function subscribeToDelegatedEvent(target, targetEvent, callback) {
        var lookup = target.delegatedEvents || (target.delegatedEvents = {});

        this.ensureDelegatedEvent(targetEvent);
        lookup[targetEvent] = callback;

        return function () {
          lookup[targetEvent] = null;
        };
      }
    }, {
      key: 'subscribeToDirectEvent',
      value: function subscribeToDirectEvent(target, targetEvent, callback) {
        var directEventCallback = this.createDirectEventCallback(callback);
        target.addEventListener(targetEvent, directEventCallback, false);

        return function () {
          target.removeEventListener(targetEvent, directEventCallback);
        };
      }
    }, {
      key: 'subscribe',
      value: function subscribe(target, targetEvent, callback, delegate) {
        if (delegate) {
          return this.subscribeToDirectEvent(target, targetEvent, callback);
        } else {
          return this.subscribeToDelegatedEvent(target, targetEvent, callback);
        }
      }
    }]);

    return DefaultEventStrategy;
  })();

  var EventManager = (function () {
    function EventManager() {
      _classCallCheck(this, EventManager);

      this.elementHandlerLookup = {};
      this.eventStrategyLookup = {};

      this.registerElementConfig({
        tagName: 'input',
        properties: {
          value: ['change', 'input'],
          checked: ['change', 'input']
        }
      });

      this.registerElementConfig({
        tagName: 'textarea',
        properties: {
          value: ['change', 'input']
        }
      });

      this.registerElementConfig({
        tagName: 'select',
        properties: {
          value: ['change']
        }
      });

      this.defaultEventStrategy = new DefaultEventStrategy();
    }

    _createClass(EventManager, [{
      key: 'registerElementConfig',
      value: function registerElementConfig(config) {
        var tagName = config.tagName.toLowerCase(),
            properties = config.properties,
            propertyName;
        this.elementHandlerLookup[tagName] = {};
        for (propertyName in properties) {
          if (properties.hasOwnProperty(propertyName)) {
            this.registerElementPropertyConfig(tagName, propertyName, properties[propertyName]);
          }
        }
      }
    }, {
      key: 'registerElementPropertyConfig',
      value: function registerElementPropertyConfig(tagName, propertyName, events) {
        this.elementHandlerLookup[tagName][propertyName] = {
          subscribe: function subscribe(target, callback) {
            events.forEach(function (changeEvent) {
              target.addEventListener(changeEvent, callback, false);
            });

            return function () {
              events.forEach(function (changeEvent) {
                target.removeEventListener(changeEvent, callback);
              });
            };
          }
        };
      }
    }, {
      key: 'registerElementHandler',
      value: function registerElementHandler(tagName, handler) {
        this.elementHandlerLookup[tagName.toLowerCase()] = handler;
      }
    }, {
      key: 'registerEventStrategy',
      value: function registerEventStrategy(eventName, strategy) {
        this.eventStrategyLookup[eventName] = strategy;
      }
    }, {
      key: 'getElementHandler',
      value: function getElementHandler(target, propertyName) {
        var tagName,
            lookup = this.elementHandlerLookup;
        if (target.tagName) {
          tagName = target.tagName.toLowerCase();
          if (lookup[tagName] && lookup[tagName][propertyName]) {
            return lookup[tagName][propertyName];
          }
          if (propertyName === 'textContent' || propertyName === 'innerHTML') {
            return lookup.input.value;
          }
        }

        return null;
      }
    }, {
      key: 'addEventListener',
      value: function addEventListener(target, targetEvent, callback, delegate) {
        return (this.eventStrategyLookup[targetEvent] || this.defaultEventStrategy).subscribe(target, targetEvent, callback, delegate);
      }
    }]);

    return EventManager;
  })();

  exports.EventManager = EventManager;
});
define('aurelia-binding/array-change-records',['exports'], function (exports) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.calcSplices = calcSplices;
  exports.projectArraySplices = projectArraySplices;
  function isIndex(s) {
    return +s === s >>> 0;
  }

  function toNumber(s) {
    return +s;
  }

  function newSplice(index, removed, addedCount) {
    return {
      index: index,
      removed: removed,
      addedCount: addedCount
    };
  }

  var EDIT_LEAVE = 0;
  var EDIT_UPDATE = 1;
  var EDIT_ADD = 2;
  var EDIT_DELETE = 3;

  function ArraySplice() {}

  ArraySplice.prototype = {
    calcEditDistances: function calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd) {
      var rowCount = oldEnd - oldStart + 1;
      var columnCount = currentEnd - currentStart + 1;
      var distances = new Array(rowCount);
      var i, j, north, west;

      for (i = 0; i < rowCount; ++i) {
        distances[i] = new Array(columnCount);
        distances[i][0] = i;
      }

      for (j = 0; j < columnCount; ++j) {
        distances[0][j] = j;
      }

      for (i = 1; i < rowCount; ++i) {
        for (j = 1; j < columnCount; ++j) {
          if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1])) distances[i][j] = distances[i - 1][j - 1];else {
            north = distances[i - 1][j] + 1;
            west = distances[i][j - 1] + 1;
            distances[i][j] = north < west ? north : west;
          }
        }
      }

      return distances;
    },
    spliceOperationsFromEditDistances: function spliceOperationsFromEditDistances(distances) {
      var i = distances.length - 1;
      var j = distances[0].length - 1;
      var current = distances[i][j];
      var edits = [];
      while (i > 0 || j > 0) {
        if (i == 0) {
          edits.push(EDIT_ADD);
          j--;
          continue;
        }
        if (j == 0) {
          edits.push(EDIT_DELETE);
          i--;
          continue;
        }
        var northWest = distances[i - 1][j - 1];
        var west = distances[i - 1][j];
        var north = distances[i][j - 1];

        var min;
        if (west < north) min = west < northWest ? west : northWest;else min = north < northWest ? north : northWest;

        if (min == northWest) {
          if (northWest == current) {
            edits.push(EDIT_LEAVE);
          } else {
            edits.push(EDIT_UPDATE);
            current = northWest;
          }
          i--;
          j--;
        } else if (min == west) {
          edits.push(EDIT_DELETE);
          i--;
          current = west;
        } else {
          edits.push(EDIT_ADD);
          j--;
          current = north;
        }
      }

      edits.reverse();
      return edits;
    },
    calcSplices: function calcSplices(current, currentStart, currentEnd, old, oldStart, oldEnd) {
      var prefixCount = 0;
      var suffixCount = 0;

      var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
      if (currentStart == 0 && oldStart == 0) prefixCount = this.sharedPrefix(current, old, minLength);

      if (currentEnd == current.length && oldEnd == old.length) suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);

      currentStart += prefixCount;
      oldStart += prefixCount;
      currentEnd -= suffixCount;
      oldEnd -= suffixCount;

      if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0) {
        return [];
      }if (currentStart == currentEnd) {
        var splice = newSplice(currentStart, [], 0);
        while (oldStart < oldEnd) splice.removed.push(old[oldStart++]);

        return [splice];
      } else if (oldStart == oldEnd) {
        return [newSplice(currentStart, [], currentEnd - currentStart)];
      }var ops = this.spliceOperationsFromEditDistances(this.calcEditDistances(current, currentStart, currentEnd, old, oldStart, oldEnd));

      var splice = undefined;
      var splices = [];
      var index = currentStart;
      var oldIndex = oldStart;
      for (var i = 0; i < ops.length; ++i) {
        switch (ops[i]) {
          case EDIT_LEAVE:
            if (splice) {
              splices.push(splice);
              splice = undefined;
            }

            index++;
            oldIndex++;
            break;
          case EDIT_UPDATE:
            if (!splice) splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
          case EDIT_ADD:
            if (!splice) splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;
            break;
          case EDIT_DELETE:
            if (!splice) splice = newSplice(index, [], 0);

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
        }
      }

      if (splice) {
        splices.push(splice);
      }
      return splices;
    },

    sharedPrefix: function sharedPrefix(current, old, searchLength) {
      for (var i = 0; i < searchLength; ++i) if (!this.equals(current[i], old[i])) {
        return i;
      }return searchLength;
    },

    sharedSuffix: function sharedSuffix(current, old, searchLength) {
      var index1 = current.length;
      var index2 = old.length;
      var count = 0;
      while (count < searchLength && this.equals(current[--index1], old[--index2])) count++;

      return count;
    },

    calculateSplices: function calculateSplices(current, previous) {
      return this.calcSplices(current, 0, current.length, previous, 0, previous.length);
    },

    equals: function equals(currentValue, previousValue) {
      return currentValue === previousValue;
    }
  };

  var arraySplice = new ArraySplice();

  function calcSplices(current, currentStart, currentEnd, old, oldStart, oldEnd) {
    return arraySplice.calcSplices(current, currentStart, currentEnd, old, oldStart, oldEnd);
  }

  function intersect(start1, end1, start2, end2) {
    if (end1 < start2 || end2 < start1) {
      return -1;
    }
    if (end1 == start2 || end2 == start1) {
      return 0;
    }
    if (start1 < start2) {
      if (end1 < end2) {
        return end1 - start2;
      } else {
        return end2 - start2;
      }
    } else {
      if (end2 < end1) {
        return end2 - start1;
      } else {
        return end1 - start1;
      }
    }
  }

  function mergeSplice(splices, index, removed, addedCount) {
    var splice = newSplice(index, removed, addedCount);

    var inserted = false;
    var insertionOffset = 0;

    for (var i = 0; i < splices.length; i++) {
      var current = splices[i];
      current.index += insertionOffset;

      if (inserted) continue;

      var intersectCount = intersect(splice.index, splice.index + splice.removed.length, current.index, current.index + current.addedCount);

      if (intersectCount >= 0) {

        splices.splice(i, 1);
        i--;

        insertionOffset -= current.addedCount - current.removed.length;

        splice.addedCount += current.addedCount - intersectCount;
        var deleteCount = splice.removed.length + current.removed.length - intersectCount;

        if (!splice.addedCount && !deleteCount) {
          inserted = true;
        } else {
          var removed = current.removed;

          if (splice.index < current.index) {
            var prepend = splice.removed.slice(0, current.index - splice.index);
            Array.prototype.push.apply(prepend, removed);
            removed = prepend;
          }

          if (splice.index + splice.removed.length > current.index + current.addedCount) {
            var append = splice.removed.slice(current.index + current.addedCount - splice.index);
            Array.prototype.push.apply(removed, append);
          }

          splice.removed = removed;
          if (current.index < splice.index) {
            splice.index = current.index;
          }
        }
      } else if (splice.index < current.index) {

        inserted = true;

        splices.splice(i, 0, splice);
        i++;

        var offset = splice.addedCount - splice.removed.length;
        current.index += offset;
        insertionOffset += offset;
      }
    }

    if (!inserted) splices.push(splice);
  }

  function createInitialSplices(array, changeRecords) {
    var splices = [];

    for (var i = 0; i < changeRecords.length; i++) {
      var record = changeRecords[i];
      switch (record.type) {
        case 'splice':
          mergeSplice(splices, record.index, record.removed.slice(), record.addedCount);
          break;
        case 'add':
        case 'update':
        case 'delete':
          if (!isIndex(record.name)) continue;
          var index = toNumber(record.name);
          if (index < 0) continue;
          mergeSplice(splices, index, [record.oldValue], record.type === 'delete' ? 0 : 1);
          break;
        default:
          console.error('Unexpected record type: ' + JSON.stringify(record));
          break;
      }
    }

    return splices;
  }

  function projectArraySplices(array, changeRecords) {
    var splices = [];

    createInitialSplices(array, changeRecords).forEach(function (splice) {
      if (splice.addedCount == 1 && splice.removed.length == 1) {
        if (splice.removed[0] !== array[splice.index]) splices.push(splice);

        return;
      };

      splices = splices.concat(calcSplices(array, splice.index, splice.index + splice.addedCount, splice.removed, 0, splice.removed.length));
    });

    return splices;
  }
});
define('aurelia-binding/map-change-records',['exports'], function (exports) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getChangeRecords = getChangeRecords;
  function newRecord(type, object, key, oldValue) {
    return {
      type: type,
      object: object,
      key: key,
      oldValue: oldValue
    };
  }

  function getChangeRecords(map) {
    var entries = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = map.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        entries.push(newRecord('added', map, key));
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return entries;
  }
});
define('aurelia-binding/collection-observation',['exports', './array-change-records', './map-change-records'], function (exports, _arrayChangeRecords, _mapChangeRecords) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var ModifyCollectionObserver = (function () {
    function ModifyCollectionObserver(taskQueue, collection) {
      _classCallCheck(this, ModifyCollectionObserver);

      this.taskQueue = taskQueue;
      this.queued = false;
      this.callbacks = [];
      this.changeRecords = [];
      this.oldCollection = null;
      this.collection = collection;
      this.lengthPropertyName = collection instanceof Map ? 'size' : 'length';
    }

    _createClass(ModifyCollectionObserver, [{
      key: 'subscribe',
      value: function subscribe(callback) {
        var callbacks = this.callbacks;
        callbacks.push(callback);
        return function () {
          callbacks.splice(callbacks.indexOf(callback), 1);
        };
      }
    }, {
      key: 'addChangeRecord',
      value: function addChangeRecord(changeRecord) {
        if (this.callbacks.length === 0) {
          return;
        }

        this.changeRecords.push(changeRecord);

        if (!this.queued) {
          this.queued = true;
          this.taskQueue.queueMicroTask(this);
        }
      }
    }, {
      key: 'reset',
      value: function reset(oldCollection) {
        if (!this.callbacks.length) {
          return;
        }

        this.oldCollection = oldCollection;

        if (!this.queued) {
          this.queued = true;
          this.taskQueue.queueMicroTask(this);
        }
      }
    }, {
      key: 'getObserver',
      value: function getObserver(propertyName) {
        if (propertyName == this.lengthPropertyName) {
          return this.lengthObserver || (this.lengthObserver = new CollectionLengthObserver(this.collection, this.lengthPropertyName));
        } else {
          throw new Error('You cannot observe the ' + propertyName + ' property of an array.');
        }
      }
    }, {
      key: 'call',
      value: function call() {
        var callbacks = this.callbacks,
            i = callbacks.length,
            changeRecords = this.changeRecords,
            oldCollection = this.oldCollection,
            records;

        this.queued = false;
        this.changeRecords = [];
        this.oldCollection = null;

        if (i) {
          if (oldCollection) {
            if (this.collection instanceof Map) {
              records = _mapChangeRecords.getChangeRecords(oldCollection);
            } else {
              records = _arrayChangeRecords.calcSplices(this.collection, 0, this.collection.length, oldCollection, 0, oldCollection.length);
            }
          } else {
            if (this.collection instanceof Map) {
              records = changeRecords;
            } else {
              records = _arrayChangeRecords.projectArraySplices(this.collection, changeRecords);
            }
          }

          while (i--) {
            callbacks[i](records);
          }
        }

        if (this.lengthObserver) {
          this.lengthObserver(this.array.length);
        }
      }
    }]);

    return ModifyCollectionObserver;
  })();

  exports.ModifyCollectionObserver = ModifyCollectionObserver;

  var CollectionLengthObserver = (function () {
    function CollectionLengthObserver(collection) {
      _classCallCheck(this, CollectionLengthObserver);

      this.collection = collection;
      this.callbacks = [];
      this.lengthPropertyName = collection instanceof Map ? 'size' : 'length';
      this.currentValue = collection[this.lengthPropertyName];
    }

    _createClass(CollectionLengthObserver, [{
      key: 'getValue',
      value: function getValue() {
        return this.collection[this.lengthPropertyName];
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        this.collection[this.lengthPropertyName] = newValue;
      }
    }, {
      key: 'subscribe',
      value: function subscribe(callback) {
        var callbacks = this.callbacks;
        callbacks.push(callback);
        return function () {
          callbacks.splice(callbacks.indexOf(callback), 1);
        };
      }
    }, {
      key: 'call',
      value: function call(newValue) {
        var callbacks = this.callbacks,
            i = callbacks.length,
            oldValue = this.currentValue;

        while (i--) {
          callbacks[i](newValue, oldValue);
        }

        this.currentValue = newValue;
      }
    }]);

    return CollectionLengthObserver;
  })();

  exports.CollectionLengthObserver = CollectionLengthObserver;
});
define('aurelia-binding/array-observation',['exports', './array-change-records', './collection-observation'], function (exports, _arrayChangeRecords, _collectionObservation) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getArrayObserver = getArrayObserver;

  var arrayProto = Array.prototype,
      hasArrayObserve = (function detectArrayObserve() {
    if (typeof Array.observe !== 'function') {
      return false;
    }

    var records = [];

    function callback(recs) {
      records = recs;
    }

    var arr = [];
    Array.observe(arr, callback);
    arr.push(1, 2);
    arr.length = 0;

    Object.deliverChangeRecords(callback);
    if (records.length !== 2) {
      return false;
    }if (records[0].type != 'splice' || records[1].type != 'splice') {
      return false;
    }

    Array.unobserve(arr, callback);

    return true;
  })();

  function getArrayObserver(taskQueue, array) {
    if (hasArrayObserve) {
      return new ArrayObserveObserver(array);
    } else {
      return ModifyArrayObserver.create(taskQueue, array);
    }
  }

  var ModifyArrayObserver = (function (_ModifyCollectionObserver) {
    function ModifyArrayObserver(taskQueue, array) {
      _classCallCheck(this, ModifyArrayObserver);

      _get(Object.getPrototypeOf(ModifyArrayObserver.prototype), 'constructor', this).call(this, taskQueue, array);
    }

    _inherits(ModifyArrayObserver, _ModifyCollectionObserver);

    _createClass(ModifyArrayObserver, null, [{
      key: 'create',
      value: function create(taskQueue, array) {
        var observer = new ModifyArrayObserver(taskQueue, array);

        array.pop = function () {
          var methodCallResult = arrayProto.pop.apply(array, arguments);
          observer.addChangeRecord({
            type: 'delete',
            object: array,
            name: array.length,
            oldValue: methodCallResult
          });
          return methodCallResult;
        };

        array.push = function () {
          var methodCallResult = arrayProto.push.apply(array, arguments);
          observer.addChangeRecord({
            type: 'splice',
            object: array,
            index: array.length - arguments.length,
            removed: [],
            addedCount: arguments.length
          });
          return methodCallResult;
        };

        array.reverse = function () {
          var oldArray = array.slice();
          var methodCallResult = arrayProto.reverse.apply(array, arguments);
          observer.reset(oldArray);
          return methodCallResult;
        };

        array.shift = function () {
          var methodCallResult = arrayProto.shift.apply(array, arguments);
          observer.addChangeRecord({
            type: 'delete',
            object: array,
            name: 0,
            oldValue: methodCallResult
          });
          return methodCallResult;
        };

        array.sort = function () {
          var oldArray = array.slice();
          var methodCallResult = arrayProto.sort.apply(array, arguments);
          observer.reset(oldArray);
          return methodCallResult;
        };

        array.splice = function () {
          var methodCallResult = arrayProto.splice.apply(array, arguments);
          observer.addChangeRecord({
            type: 'splice',
            object: array,
            index: arguments[0],
            removed: methodCallResult,
            addedCount: arguments.length > 2 ? arguments.length - 2 : 0
          });
          return methodCallResult;
        };

        array.unshift = function () {
          var methodCallResult = arrayProto.unshift.apply(array, arguments);
          observer.addChangeRecord({
            type: 'splice',
            object: array,
            index: 0,
            removed: [],
            addedCount: arguments.length
          });
          return methodCallResult;
        };

        return observer;
      }
    }]);

    return ModifyArrayObserver;
  })(_collectionObservation.ModifyCollectionObserver);

  var ArrayObserveObserver = (function () {
    function ArrayObserveObserver(array) {
      _classCallCheck(this, ArrayObserveObserver);

      this.array = array;
      this.callbacks = [];
      this.observing = false;
    }

    _createClass(ArrayObserveObserver, [{
      key: 'subscribe',
      value: function subscribe(callback) {
        var _this = this;

        var callbacks = this.callbacks;

        callbacks.push(callback);

        if (!this.observing) {
          this.observing = true;
          Array.observe(this.array, function (changes) {
            return _this.handleChanges(changes);
          });
        }

        return function () {
          callbacks.splice(callbacks.indexOf(callback), 1);
        };
      }
    }, {
      key: 'getObserver',
      value: function getObserver(propertyName) {
        if (propertyName == 'length') {
          return this.lengthObserver || (this.lengthObserver = new _collectionObservation.CollectionLengthObserver(this.array));
        } else {
          throw new Error('You cannot observe the ' + propertyName + ' property of an array.');
        }
      }
    }, {
      key: 'handleChanges',
      value: function handleChanges(changeRecords) {
        var callbacks = this.callbacks,
            i = callbacks.length,
            splices;

        if (!i) {
          return;
        }

        splices = _arrayChangeRecords.projectArraySplices(this.array, changeRecords);

        while (i--) {
          callbacks[i](splices);
        }

        if (this.lengthObserver) {
          this.lengthObserver.call(this.array.length);
        }
      }
    }]);

    return ArrayObserveObserver;
  })();
});
define('aurelia-binding/map-observation',['exports', 'core-js', './map-change-records', './collection-observation'], function (exports, _coreJs, _mapChangeRecords, _collectionObservation) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.getMapObserver = getMapObserver;

  var _core = _interopRequire(_coreJs);

  var mapProto = Map.prototype;

  function getMapObserver(taskQueue, map) {
    return ModifyMapObserver.create(taskQueue, map);
  }

  var ModifyMapObserver = (function (_ModifyCollectionObserver) {
    function ModifyMapObserver(taskQueue, map) {
      _classCallCheck(this, ModifyMapObserver);

      _get(Object.getPrototypeOf(ModifyMapObserver.prototype), 'constructor', this).call(this, taskQueue, map);
    }

    _inherits(ModifyMapObserver, _ModifyCollectionObserver);

    _createClass(ModifyMapObserver, null, [{
      key: 'create',
      value: function create(taskQueue, map) {
        var observer = new ModifyMapObserver(taskQueue, map);

        map.set = function () {
          var oldValue = map.get(arguments[0]);
          var type = oldValue ? 'update' : 'add';
          var methodCallResult = mapProto.set.apply(map, arguments);
          observer.addChangeRecord({
            type: type,
            object: map,
            key: arguments[0],
            oldValue: oldValue
          });
          return methodCallResult;
        };

        map['delete'] = function () {
          var oldValue = map.get(arguments[0]);
          var methodCallResult = mapProto['delete'].apply(map, arguments);
          observer.addChangeRecord({
            type: 'delete',
            object: map,
            key: arguments[0],
            oldValue: oldValue
          });
          return methodCallResult;
        };

        map.clear = function () {
          var methodCallResult = mapProto.clear.apply(map, arguments);
          observer.addChangeRecord({
            type: 'clear',
            object: map
          });
          return methodCallResult;
        };

        return observer;
      }
    }]);

    return ModifyMapObserver;
  })(_collectionObservation.ModifyCollectionObserver);
});
define('aurelia-binding/dirty-checking',["exports"], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var DirtyChecker = (function () {
    function DirtyChecker() {
      _classCallCheck(this, DirtyChecker);

      this.tracked = [];
      this.checkDelay = 120;
    }

    _createClass(DirtyChecker, [{
      key: "addProperty",
      value: function addProperty(property) {
        var tracked = this.tracked;

        tracked.push(property);

        if (tracked.length === 1) {
          this.scheduleDirtyCheck();
        }
      }
    }, {
      key: "removeProperty",
      value: function removeProperty(property) {
        var tracked = this.tracked;
        tracked.splice(tracked.indexOf(property), 1);
      }
    }, {
      key: "scheduleDirtyCheck",
      value: function scheduleDirtyCheck() {
        var _this = this;

        setTimeout(function () {
          return _this.check();
        }, this.checkDelay);
      }
    }, {
      key: "check",
      value: function check() {
        var tracked = this.tracked,
            i = tracked.length;

        while (i--) {
          var current = tracked[i];

          if (current.isDirty()) {
            current.call();
          }
        }

        if (tracked.length) {
          this.scheduleDirtyCheck();
        }
      }
    }]);

    return DirtyChecker;
  })();

  exports.DirtyChecker = DirtyChecker;

  var DirtyCheckProperty = (function () {
    function DirtyCheckProperty(dirtyChecker, obj, propertyName) {
      _classCallCheck(this, DirtyCheckProperty);

      this.dirtyChecker = dirtyChecker;
      this.obj = obj;
      this.propertyName = propertyName;
      this.callbacks = [];
      this.isSVG = obj instanceof SVGElement;
    }

    _createClass(DirtyCheckProperty, [{
      key: "getValue",
      value: function getValue() {
        return this.obj[this.propertyName];
      }
    }, {
      key: "setValue",
      value: function setValue(newValue) {
        if (this.isSVG) {
          this.obj.setAttributeNS(null, this.propertyName, newValue);
        } else {
          this.obj[this.propertyName] = newValue;
        }
      }
    }, {
      key: "call",
      value: function call() {
        var callbacks = this.callbacks,
            i = callbacks.length,
            oldValue = this.oldValue,
            newValue = this.getValue();

        while (i--) {
          callbacks[i](newValue, oldValue);
        }

        this.oldValue = newValue;
      }
    }, {
      key: "isDirty",
      value: function isDirty() {
        return this.oldValue !== this.getValue();
      }
    }, {
      key: "beginTracking",
      value: function beginTracking() {
        this.tracking = true;
        this.oldValue = this.newValue = this.getValue();
        this.dirtyChecker.addProperty(this);
      }
    }, {
      key: "endTracking",
      value: function endTracking() {
        this.tracking = false;
        this.dirtyChecker.removeProperty(this);
      }
    }, {
      key: "subscribe",
      value: function subscribe(callback) {
        var callbacks = this.callbacks,
            that = this;

        callbacks.push(callback);

        if (!this.tracking) {
          this.beginTracking();
        }

        return function () {
          callbacks.splice(callbacks.indexOf(callback), 1);
          if (callbacks.length === 0) {
            that.endTracking();
          }
        };
      }
    }]);

    return DirtyCheckProperty;
  })();

  exports.DirtyCheckProperty = DirtyCheckProperty;
});
define('aurelia-binding/property-observation',['exports', 'core-js'], function (exports, _coreJs) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var SetterObserver = (function () {
    function SetterObserver(taskQueue, obj, propertyName) {
      _classCallCheck(this, SetterObserver);

      this.taskQueue = taskQueue;
      this.obj = obj;
      this.propertyName = propertyName;
      this.callbacks = [];
      this.queued = false;
      this.observing = false;
    }

    _createClass(SetterObserver, [{
      key: 'getValue',
      value: function getValue() {
        return this.obj[this.propertyName];
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        this.obj[this.propertyName] = newValue;
      }
    }, {
      key: 'getterValue',
      value: function getterValue() {
        return this.currentValue;
      }
    }, {
      key: 'setterValue',
      value: function setterValue(newValue) {
        var oldValue = this.currentValue;

        if (oldValue != newValue) {
          if (!this.queued) {
            this.oldValue = oldValue;
            this.queued = true;
            this.taskQueue.queueMicroTask(this);
          }

          this.currentValue = newValue;
        }
      }
    }, {
      key: 'call',
      value: function call() {
        var callbacks = this.callbacks,
            i = callbacks.length,
            oldValue = this.oldValue,
            newValue = this.currentValue;

        this.queued = false;

        while (i--) {
          callbacks[i](newValue, oldValue);
        }
      }
    }, {
      key: 'subscribe',
      value: function subscribe(callback) {
        var callbacks = this.callbacks;
        callbacks.push(callback);

        if (!this.observing) {
          this.convertProperty();
        }

        return function () {
          callbacks.splice(callbacks.indexOf(callback), 1);
        };
      }
    }, {
      key: 'convertProperty',
      value: function convertProperty() {
        this.observing = true;
        this.currentValue = this.obj[this.propertyName];
        this.setValue = this.setterValue;
        this.getValue = this.getterValue;

        try {
          Object.defineProperty(this.obj, this.propertyName, {
            configurable: true,
            enumerable: true,
            get: this.getValue.bind(this),
            set: this.setValue.bind(this)
          });
        } catch (_) {}
      }
    }]);

    return SetterObserver;
  })();

  exports.SetterObserver = SetterObserver;

  var OoObjectObserver = (function () {
    function OoObjectObserver(obj, observerLocator) {
      _classCallCheck(this, OoObjectObserver);

      this.obj = obj;
      this.observers = {};
      this.observerLocator = observerLocator;
    }

    _createClass(OoObjectObserver, [{
      key: 'subscribe',
      value: function subscribe(propertyObserver, callback) {
        var _this = this;

        var callbacks = propertyObserver.callbacks;
        callbacks.push(callback);

        if (!this.observing) {
          this.observing = true;
          try {
            Object.observe(this.obj, function (changes) {
              return _this.handleChanges(changes);
            }, ['update', 'add']);
          } catch (_) {}
        }

        return function () {
          callbacks.splice(callbacks.indexOf(callback), 1);
        };
      }
    }, {
      key: 'getObserver',
      value: function getObserver(propertyName, descriptor) {
        var propertyObserver = this.observers[propertyName];
        if (!propertyObserver) {
          if (descriptor) {
            propertyObserver = this.observers[propertyName] = new OoPropertyObserver(this, this.obj, propertyName);
          } else {
            propertyObserver = this.observers[propertyName] = new UndefinedPropertyObserver(this, this.obj, propertyName);
          }
        }
        return propertyObserver;
      }
    }, {
      key: 'handleChanges',
      value: function handleChanges(changeRecords) {
        var updates = {},
            observers = this.observers,
            i = changeRecords.length;

        while (i--) {
          var change = changeRecords[i],
              name = change.name;

          if (!(name in updates)) {
            var observer = observers[name];
            updates[name] = true;
            if (observer) {
              observer.trigger(change.object[name], change.oldValue);
            }
          }
        }
      }
    }]);

    return OoObjectObserver;
  })();

  exports.OoObjectObserver = OoObjectObserver;

  var OoPropertyObserver = (function () {
    function OoPropertyObserver(owner, obj, propertyName) {
      _classCallCheck(this, OoPropertyObserver);

      this.owner = owner;
      this.obj = obj;
      this.propertyName = propertyName;
      this.callbacks = [];
    }

    _createClass(OoPropertyObserver, [{
      key: 'getValue',
      value: function getValue() {
        return this.obj[this.propertyName];
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        this.obj[this.propertyName] = newValue;
      }
    }, {
      key: 'trigger',
      value: function trigger(newValue, oldValue) {
        var callbacks = this.callbacks,
            i = callbacks.length;

        while (i--) {
          callbacks[i](newValue, oldValue);
        }
      }
    }, {
      key: 'subscribe',
      value: function subscribe(callback) {
        return this.owner.subscribe(this, callback);
      }
    }]);

    return OoPropertyObserver;
  })();

  exports.OoPropertyObserver = OoPropertyObserver;

  var UndefinedPropertyObserver = (function () {
    function UndefinedPropertyObserver(owner, obj, propertyName) {
      _classCallCheck(this, UndefinedPropertyObserver);

      this.owner = owner;
      this.obj = obj;
      this.propertyName = propertyName;
      this.callbackMap = new Map();
      this.callbacks = [];
    }

    _createClass(UndefinedPropertyObserver, [{
      key: 'getValue',
      value: function getValue() {
        if (this.actual) {
          return this.actual.getValue();
        }
        return this.obj[this.propertyName];
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        if (this.actual) {
          this.actual.setValue(newValue);
          return;
        }

        this.obj[this.propertyName] = newValue;
        this.trigger(newValue, undefined);
      }
    }, {
      key: 'trigger',
      value: function trigger(newValue, oldValue) {
        var callback;

        if (this.subscription) {
          this.subscription();
        }

        this.getObserver();

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.callbackMap.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            callback = _step.value;

            callback(newValue, oldValue);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }, {
      key: 'getObserver',
      value: function getObserver() {
        var callback, observerLocator;

        if (!Object.getOwnPropertyDescriptor(this.obj, this.propertyName)) {
          return;
        }

        observerLocator = this.owner.observerLocator;
        delete this.owner.observers[this.propertyName];
        delete observerLocator.getObserversLookup(this.obj, observerLocator)[this.propertyName];
        this.actual = observerLocator.getObserver(this.obj, this.propertyName);

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.callbackMap.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            callback = _step2.value;

            this.callbackMap.set(callback, this.actual.subscribe(callback));
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
              _iterator2['return']();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }, {
      key: 'subscribe',
      value: function subscribe(callback) {
        var _this2 = this;

        if (!this.actual) {
          this.getObserver();
        }

        if (this.actual) {
          return this.actual.subscribe(callback);
        }

        if (!this.subscription) {
          this.subscription = this.owner.subscribe(this);
        }

        this.callbackMap.set(callback, null);

        return function () {
          var actualDispose = _this2.callbackMap.get(callback);
          if (actualDispose) actualDispose();
          _this2.callbackMap['delete'](callback);
        };
      }
    }]);

    return UndefinedPropertyObserver;
  })();

  exports.UndefinedPropertyObserver = UndefinedPropertyObserver;
});
define('aurelia-binding/element-observation',['exports'], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var XLinkAttributeObserver = (function () {
    function XLinkAttributeObserver(element, propertyName, attributeName) {
      _classCallCheck(this, XLinkAttributeObserver);

      this.element = element;
      this.propertyName = propertyName;
      this.attributeName = attributeName;
    }

    _createClass(XLinkAttributeObserver, [{
      key: 'getValue',
      value: function getValue() {
        return this.element.getAttributeNS('http://www.w3.org/1999/xlink', this.attributeName);
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        return this.element.setAttributeNS('http://www.w3.org/1999/xlink', this.attributeName, newValue);
      }
    }, {
      key: 'subscribe',
      value: function subscribe(callback) {
        throw new Error('Observation of an Element\'s "' + this.propertyName + '" property is not supported.');
      }
    }]);

    return XLinkAttributeObserver;
  })();

  exports.XLinkAttributeObserver = XLinkAttributeObserver;

  var DataAttributeObserver = (function () {
    function DataAttributeObserver(element, propertyName) {
      _classCallCheck(this, DataAttributeObserver);

      this.element = element;
      this.propertyName = propertyName;
    }

    _createClass(DataAttributeObserver, [{
      key: 'getValue',
      value: function getValue() {
        return this.element.getAttribute(this.propertyName);
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        return this.element.setAttribute(this.propertyName, newValue);
      }
    }, {
      key: 'subscribe',
      value: function subscribe(callback) {
        throw new Error('Observation of an Element\'s "' + this.propertyName + '" property is not supported.');
      }
    }]);

    return DataAttributeObserver;
  })();

  exports.DataAttributeObserver = DataAttributeObserver;

  var StyleObserver = (function () {
    function StyleObserver(element, propertyName) {
      _classCallCheck(this, StyleObserver);

      this.element = element;
      this.propertyName = propertyName;
    }

    _createClass(StyleObserver, [{
      key: 'getValue',
      value: function getValue() {
        return this.element.style.cssText;
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        if (newValue instanceof Object) {
          newValue = this.flattenCss(newValue);
        }
        this.element.style.cssText = newValue;
      }
    }, {
      key: 'subscribe',
      value: function subscribe(callback) {
        throw new Error('Observation of an Element\'s "' + this.propertyName + '" property is not supported.');
      }
    }, {
      key: 'flattenCss',
      value: function flattenCss(object) {
        var s = '';
        for (var propertyName in object) {
          if (object.hasOwnProperty(propertyName)) {
            s += propertyName + ': ' + object[propertyName] + '; ';
          }
        }
        return s;
      }
    }]);

    return StyleObserver;
  })();

  exports.StyleObserver = StyleObserver;

  var ValueAttributeObserver = (function () {
    function ValueAttributeObserver(element, propertyName, handler) {
      _classCallCheck(this, ValueAttributeObserver);

      this.element = element;
      this.propertyName = propertyName;
      this.handler = handler;
      this.callbacks = [];
    }

    _createClass(ValueAttributeObserver, [{
      key: 'getValue',
      value: function getValue() {
        return this.element[this.propertyName];
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        this.element[this.propertyName] = newValue;
        this.call();
      }
    }, {
      key: 'call',
      value: function call() {
        var callbacks = this.callbacks,
            i = callbacks.length,
            oldValue = this.oldValue,
            newValue = this.getValue();

        while (i--) {
          callbacks[i](newValue, oldValue);
        }

        this.oldValue = newValue;
      }
    }, {
      key: 'subscribe',
      value: function subscribe(callback) {
        var that = this;

        if (!this.disposeHandler) {
          this.oldValue = this.getValue();
          this.disposeHandler = this.handler.subscribe(this.element, this.call.bind(this));
        }

        this.callbacks.push(callback);

        return this.unsubscribe.bind(this, callback);
      }
    }, {
      key: 'unsubscribe',
      value: function unsubscribe(callback) {
        var callbacks = this.callbacks;
        callbacks.splice(callbacks.indexOf(callback), 1);
        if (callbacks.length === 0) {
          this.disposeHandler();
          this.disposeHandler = null;
        }
      }
    }]);

    return ValueAttributeObserver;
  })();

  exports.ValueAttributeObserver = ValueAttributeObserver;

  var SelectValueObserver = (function () {
    function SelectValueObserver(element, handler, observerLocator) {
      _classCallCheck(this, SelectValueObserver);

      this.element = element;
      this.handler = handler;
      this.observerLocator = observerLocator;
    }

    _createClass(SelectValueObserver, [{
      key: 'getValue',
      value: function getValue() {
        return this.value;
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        var _this = this;

        if (newValue !== null && newValue !== undefined && this.element.multiple && !Array.isArray(newValue)) {
          throw new Error('Only null or Array instances can be bound to a multi-select.');
        }
        if (this.value === newValue) {
          return;
        }

        if (this.arraySubscription) {
          this.arraySubscription();
          this.arraySubscription = null;
        }

        if (Array.isArray(newValue)) {
          this.arraySubscription = this.observerLocator.getArrayObserver(newValue).subscribe(this.synchronizeOptions.bind(this));
        }

        this.value = newValue;
        this.synchronizeOptions();

        if (this.element.options.length > 0 && !this.initialSync) {
          this.initialSync = true;
          this.observerLocator.taskQueue.queueMicroTask({ call: function call() {
              return _this.synchronizeOptions();
            } });
        }
      }
    }, {
      key: 'synchronizeOptions',
      value: function synchronizeOptions() {
        var value = this.value,
            i,
            options,
            option,
            optionValue,
            clear,
            isArray;

        if (value === null || value === undefined) {
          clear = true;
        } else if (Array.isArray(value)) {
          isArray = true;
        }

        options = this.element.options;
        i = options.length;
        while (i--) {
          option = options.item(i);
          if (clear) {
            option.selected = false;
            continue;
          }
          optionValue = option.hasOwnProperty('model') ? option.model : option.value;
          if (isArray) {
            option.selected = value.indexOf(optionValue) !== -1;
            continue;
          }
          option.selected = value === optionValue;
        }
      }
    }, {
      key: 'synchronizeValue',
      value: function synchronizeValue() {
        var options = this.element.options,
            option,
            i,
            ii,
            count = 0,
            value = [];

        for (i = 0, ii = options.length; i < ii; i++) {
          option = options.item(i);
          if (!option.selected) {
            continue;
          }
          value[count] = option.hasOwnProperty('model') ? option.model : option.value;
          count++;
        }

        if (!this.element.multiple) {
          if (count === 0) {
            value = null;
          } else {
            value = value[0];
          }
        }

        this.oldValue = this.value;
        this.value = value;
        this.call();
      }
    }, {
      key: 'call',
      value: function call() {
        var callbacks = this.callbacks,
            i = callbacks.length,
            oldValue = this.oldValue,
            newValue = this.value;

        while (i--) {
          callbacks[i](newValue, oldValue);
        }
      }
    }, {
      key: 'subscribe',
      value: function subscribe(callback) {
        if (!this.callbacks) {
          this.callbacks = [];
          this.disposeHandler = this.handler.subscribe(this.element, this.synchronizeValue.bind(this, false));
        }

        this.callbacks.push(callback);
        return this.unsubscribe.bind(this, callback);
      }
    }, {
      key: 'unsubscribe',
      value: function unsubscribe(callback) {
        var callbacks = this.callbacks;
        callbacks.splice(callbacks.indexOf(callback), 1);
        if (callbacks.length === 0) {
          this.disposeHandler();
          this.disposeHandler = null;
          this.callbacks = null;
        }
      }
    }, {
      key: 'bind',
      value: function bind() {
        this.domObserver = new MutationObserver(this.synchronizeOptions.bind(this));
        this.domObserver.observe(this.element, { childList: true, subtree: true });
      }
    }, {
      key: 'unbind',
      value: function unbind() {
        this.domObserver.disconnect();
        this.domObserver = null;

        if (this.arraySubscription) {
          this.arraySubscription();
          this.arraySubscription = null;
        }
      }
    }]);

    return SelectValueObserver;
  })();

  exports.SelectValueObserver = SelectValueObserver;

  var CheckedObserver = (function () {
    function CheckedObserver(element, handler, observerLocator) {
      _classCallCheck(this, CheckedObserver);

      this.element = element;
      this.handler = handler;
      this.observerLocator = observerLocator;
    }

    _createClass(CheckedObserver, [{
      key: 'getValue',
      value: function getValue() {
        return this.value;
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        var _this2 = this;

        if (this.value === newValue) {
          return;
        }

        if (this.arraySubscription) {
          this.arraySubscription();
          this.arraySubscription = null;
        }

        if (this.element.type === 'checkbox' && Array.isArray(newValue)) {
          this.arraySubscription = this.observerLocator.getArrayObserver(newValue).subscribe(this.synchronizeElement.bind(this));
        }

        this.value = newValue;
        this.synchronizeElement();

        if (!this.element.hasOwnProperty('model') && !this.initialSync) {
          this.initialSync = true;
          this.observerLocator.taskQueue.queueMicroTask({ call: function call() {
              return _this2.synchronizeElement();
            } });
        }
      }
    }, {
      key: 'synchronizeElement',
      value: function synchronizeElement() {
        var value = this.value,
            element = this.element,
            elementValue = element.hasOwnProperty('model') ? element.model : element.value,
            isRadio = element.type === 'radio';

        element.checked = isRadio && value === elementValue || !isRadio && value === true || !isRadio && Array.isArray(value) && value.indexOf(elementValue) !== -1;
      }
    }, {
      key: 'synchronizeValue',
      value: function synchronizeValue() {
        var value = this.value,
            element = this.element,
            elementValue = element.hasOwnProperty('model') ? element.model : element.value,
            index;

        if (element.type === 'checkbox') {
          if (Array.isArray(value)) {
            index = value.indexOf(elementValue);
            if (element.checked && index === -1) {
              value.push(elementValue);
            } else if (!element.checked && index !== -1) {
              value.splice(index, 1);
            }

            return;
          } else {
            value = element.checked;
          }
        } else if (element.checked) {
          value = elementValue;
        } else {
          return;
        }

        this.oldValue = this.value;
        this.value = value;
        this.call();
      }
    }, {
      key: 'call',
      value: function call() {
        var callbacks = this.callbacks,
            i = callbacks.length,
            oldValue = this.oldValue,
            newValue = this.value;

        while (i--) {
          callbacks[i](newValue, oldValue);
        }
      }
    }, {
      key: 'subscribe',
      value: function subscribe(callback) {
        if (!this.callbacks) {
          this.callbacks = [];
          this.disposeHandler = this.handler.subscribe(this.element, this.synchronizeValue.bind(this, false));
        }

        this.callbacks.push(callback);
        return this.unsubscribe.bind(this, callback);
      }
    }, {
      key: 'unsubscribe',
      value: function unsubscribe(callback) {
        var callbacks = this.callbacks;
        callbacks.splice(callbacks.indexOf(callback), 1);
        if (callbacks.length === 0) {
          this.disposeHandler();
          this.disposeHandler = null;
          this.callbacks = null;
        }
      }
    }, {
      key: 'unbind',
      value: function unbind() {
        if (this.arraySubscription) {
          this.arraySubscription();
          this.arraySubscription = null;
        }
      }
    }]);

    return CheckedObserver;
  })();

  exports.CheckedObserver = CheckedObserver;
});
define('aurelia-binding/computed-observation',['exports'], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.hasDeclaredDependencies = hasDeclaredDependencies;
  exports.declarePropertyDependencies = declarePropertyDependencies;

  var ComputedPropertyObserver = (function () {
    function ComputedPropertyObserver(obj, propertyName, descriptor, observerLocator) {
      _classCallCheck(this, ComputedPropertyObserver);

      this.obj = obj;
      this.propertyName = propertyName;
      this.descriptor = descriptor;
      this.observerLocator = observerLocator;
      this.callbacks = [];
    }

    _createClass(ComputedPropertyObserver, [{
      key: 'getValue',
      value: function getValue() {
        return this.obj[this.propertyName];
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        throw new Error('Computed properties cannot be assigned.');
      }
    }, {
      key: 'trigger',
      value: function trigger(newValue, oldValue) {
        var callbacks = this.callbacks,
            i = callbacks.length;

        while (i--) {
          callbacks[i](newValue, oldValue);
        }
      }
    }, {
      key: 'evaluate',
      value: function evaluate() {
        var newValue = this.getValue();
        if (this.oldValue === newValue) {
          return;
        }this.trigger(newValue, this.oldValue);
        this.oldValue = newValue;
      }
    }, {
      key: 'subscribe',
      value: function subscribe(callback) {
        var _this = this;

        var dependencies, i, ii;

        this.callbacks.push(callback);

        if (this.oldValue === undefined) {
          this.oldValue = this.getValue();
          this.subscriptions = [];

          dependencies = this.descriptor.get.dependencies;
          for (i = 0, ii = dependencies.length; i < ii; i++) {
            this.subscriptions.push(this.observerLocator.getObserver(this.obj, dependencies[i]).subscribe(function () {
              return _this.evaluate();
            }));
          }
        }

        return function () {
          _this.callbacks.splice(_this.callbacks.indexOf(callback), 1);
          if (_this.callbacks.length > 0) return;
          while (_this.subscriptions.length) {
            _this.subscriptions.pop()();
          }
          _this.oldValue = undefined;
        };
      }
    }]);

    return ComputedPropertyObserver;
  })();

  exports.ComputedPropertyObserver = ComputedPropertyObserver;

  function hasDeclaredDependencies(descriptor) {
    return descriptor && descriptor.get && !descriptor.set && descriptor.get.dependencies && descriptor.get.dependencies.length;
  }

  function declarePropertyDependencies(ctor, propertyName, dependencies) {
    var descriptor = Object.getOwnPropertyDescriptor(ctor.prototype, propertyName);
    if (descriptor.set) throw new Error('The property cannot have a setter function.');
    descriptor.get.dependencies = dependencies;
  }
});
define('aurelia-binding/observer-locator',['exports', 'aurelia-task-queue', './array-observation', './map-observation', './event-manager', './dirty-checking', './property-observation', './element-observation', 'aurelia-dependency-injection', './computed-observation'], function (exports, _aureliaTaskQueue, _arrayObservation, _mapObservation, _eventManager, _dirtyChecking, _propertyObservation, _elementObservation, _aureliaDependencyInjection, _computedObservation) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  if (typeof Object.getPropertyDescriptor !== 'function') {
    Object.getPropertyDescriptor = function (subject, name) {
      var pd = Object.getOwnPropertyDescriptor(subject, name);
      var proto = Object.getPrototypeOf(subject);
      while (typeof pd === 'undefined' && proto !== null) {
        pd = Object.getOwnPropertyDescriptor(proto, name);
        proto = Object.getPrototypeOf(proto);
      }
      return pd;
    };
  }

  var hasObjectObserve = (function detectObjectObserve() {
    if (typeof Object.observe !== 'function') {
      return false;
    }

    var records = [];

    function callback(recs) {
      records = recs;
    }

    var test = {};
    Object.observe(test, callback);
    test.id = 1;
    test.id = 2;
    delete test.id;

    Object.deliverChangeRecords(callback);
    if (records.length !== 3) {
      return false;
    }if (records[0].type != 'add' || records[1].type != 'update' || records[2].type != 'delete') {
      return false;
    }

    Object.unobserve(test, callback);

    return true;
  })();

  function createObserversLookup(obj) {
    var value = {};

    try {
      Object.defineProperty(obj, '__observers__', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: value
      });
    } catch (_) {}

    return value;
  }

  function createObserverLookup(obj, observerLocator) {
    var value = new _propertyObservation.OoObjectObserver(obj, observerLocator);

    try {
      Object.defineProperty(obj, '__observer__', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: value
      });
    } catch (_) {}

    return value;
  }

  var ObserverLocator = (function () {
    function ObserverLocator(taskQueue, eventManager, dirtyChecker, observationAdapters) {
      _classCallCheck(this, ObserverLocator);

      this.taskQueue = taskQueue;
      this.eventManager = eventManager;
      this.dirtyChecker = dirtyChecker;
      this.observationAdapters = observationAdapters;
    }

    _createClass(ObserverLocator, [{
      key: 'getObserversLookup',
      value: function getObserversLookup(obj) {
        return obj.__observers__ || createObserversLookup(obj);
      }
    }, {
      key: 'getObserver',
      value: function getObserver(obj, propertyName) {
        var observersLookup = this.getObserversLookup(obj);

        if (propertyName in observersLookup) {
          return observersLookup[propertyName];
        }

        return observersLookup[propertyName] = this.createPropertyObserver(obj, propertyName);
      }
    }, {
      key: 'getObservationAdapter',
      value: function getObservationAdapter(obj, propertyName, descriptor) {
        var i, ii, observationAdapter;
        for (i = 0, ii = this.observationAdapters.length; i < ii; i++) {
          observationAdapter = this.observationAdapters[i];
          if (observationAdapter.handlesProperty(obj, propertyName, descriptor)) {
            return observationAdapter;
          }
        }
        return null;
      }
    }, {
      key: 'createPropertyObserver',
      value: function createPropertyObserver(obj, propertyName) {
        var observerLookup, descriptor, handler, observationAdapter, xlinkResult;

        if (obj instanceof Element) {
          handler = this.eventManager.getElementHandler(obj, propertyName);
          if (propertyName === 'value' && obj.tagName.toLowerCase() === 'select') {
            return new _elementObservation.SelectValueObserver(obj, handler, this);
          }
          if (propertyName === 'checked' && obj.tagName.toLowerCase() === 'input') {
            return new _elementObservation.CheckedObserver(obj, handler, this);
          }
          if (handler) {
            return new _elementObservation.ValueAttributeObserver(obj, propertyName, handler);
          }
          xlinkResult = /^xlink:(.+)$/.exec(propertyName);
          if (xlinkResult) {
            return new _elementObservation.XLinkAttributeObserver(obj, propertyName, xlinkResult[1]);
          }
          if (/^\w+:|^data-|^aria-/.test(propertyName) || obj instanceof SVGElement) {
            return new _elementObservation.DataAttributeObserver(obj, propertyName);
          }
          if (propertyName === 'style' || propertyName === 'css') {
            return new _elementObservation.StyleObserver(obj, propertyName);
          }
        }

        descriptor = Object.getPropertyDescriptor(obj, propertyName);

        if (_computedObservation.hasDeclaredDependencies(descriptor)) {
          return new _computedObservation.ComputedPropertyObserver(obj, propertyName, descriptor, this);
        }

        if (descriptor && (descriptor.get || descriptor.set)) {
          observationAdapter = this.getObservationAdapter(obj, propertyName, descriptor);
          if (observationAdapter) {
            return observationAdapter.getObserver(obj, propertyName, descriptor);
          }return new _dirtyChecking.DirtyCheckProperty(this.dirtyChecker, obj, propertyName);
        }

        if (hasObjectObserve) {
          observerLookup = obj.__observer__ || createObserverLookup(obj, this);
          return observerLookup.getObserver(propertyName, descriptor);
        }

        if (obj instanceof Array) {
          observerLookup = this.getArrayObserver(obj);
          return observerLookup.getObserver(propertyName);
        } else if (obj instanceof Map) {
          observerLookup = this.getMapObserver(obj);
          return observerLookup.getObserver(propertyName);
        }

        return new _propertyObservation.SetterObserver(this.taskQueue, obj, propertyName);
      }
    }, {
      key: 'getArrayObserver',
      value: (function (_getArrayObserver) {
        function getArrayObserver(_x) {
          return _getArrayObserver.apply(this, arguments);
        }

        getArrayObserver.toString = function () {
          return _getArrayObserver.toString();
        };

        return getArrayObserver;
      })(function (array) {
        if ('__array_observer__' in array) {
          return array.__array_observer__;
        }

        return array.__array_observer__ = _arrayObservation.getArrayObserver(this.taskQueue, array);
      })
    }, {
      key: 'getMapObserver',
      value: (function (_getMapObserver) {
        function getMapObserver(_x2) {
          return _getMapObserver.apply(this, arguments);
        }

        getMapObserver.toString = function () {
          return _getMapObserver.toString();
        };

        return getMapObserver;
      })(function (map) {
        if ('__map_observer__' in map) {
          return map.__map_observer__;
        }

        return map.__map_observer__ = _mapObservation.getMapObserver(this.taskQueue, map);
      })
    }], [{
      key: 'inject',
      value: function inject() {
        return [_aureliaTaskQueue.TaskQueue, _eventManager.EventManager, _dirtyChecking.DirtyChecker, _aureliaDependencyInjection.All.of(ObjectObservationAdapter)];
      }
    }]);

    return ObserverLocator;
  })();

  exports.ObserverLocator = ObserverLocator;

  var ObjectObservationAdapter = (function () {
    function ObjectObservationAdapter() {
      _classCallCheck(this, ObjectObservationAdapter);
    }

    _createClass(ObjectObservationAdapter, [{
      key: 'handlesProperty',
      value: function handlesProperty(object, propertyName, descriptor) {
        throw new Error('BindingAdapters must implement handlesProperty(object, propertyName).');
      }
    }, {
      key: 'getObserver',
      value: function getObserver(object, propertyName, descriptor) {
        throw new Error('BindingAdapters must implement createObserver(object, propertyName).');
      }
    }]);

    return ObjectObservationAdapter;
  })();

  exports.ObjectObservationAdapter = ObjectObservationAdapter;
});
define('aurelia-binding/binding-modes',["exports"], function (exports) {
  

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var ONE_WAY = 1;
  exports.ONE_WAY = ONE_WAY;
  var TWO_WAY = 2;
  exports.TWO_WAY = TWO_WAY;
  var ONE_TIME = 3;
  exports.ONE_TIME = ONE_TIME;
});
define('aurelia-binding/lexer',['exports'], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var Token = (function () {
    function Token(index, text) {
      _classCallCheck(this, Token);

      this.index = index;
      this.text = text;
    }

    _createClass(Token, [{
      key: 'withOp',
      value: function withOp(op) {
        this.opKey = op;
        return this;
      }
    }, {
      key: 'withGetterSetter',
      value: function withGetterSetter(key) {
        this.key = key;
        return this;
      }
    }, {
      key: 'withValue',
      value: function withValue(value) {
        this.value = value;
        return this;
      }
    }, {
      key: 'toString',
      value: function toString() {
        return 'Token(' + this.text + ')';
      }
    }]);

    return Token;
  })();

  exports.Token = Token;

  var Lexer = (function () {
    function Lexer() {
      _classCallCheck(this, Lexer);
    }

    _createClass(Lexer, [{
      key: 'lex',
      value: function lex(text) {
        var scanner = new Scanner(text);
        var tokens = [];
        var token = scanner.scanToken();

        while (token) {
          tokens.push(token);
          token = scanner.scanToken();
        }

        return tokens;
      }
    }]);

    return Lexer;
  })();

  exports.Lexer = Lexer;

  var Scanner = (function () {
    function Scanner(input) {
      _classCallCheck(this, Scanner);

      this.input = input;
      this.length = input.length;
      this.peek = 0;
      this.index = -1;

      this.advance();
    }

    _createClass(Scanner, [{
      key: 'scanToken',
      value: function scanToken() {
        while (this.peek <= $SPACE) {
          if (++this.index >= this.length) {
            this.peek = $EOF;
            return null;
          } else {
            this.peek = this.input.charCodeAt(this.index);
          }
        }

        if (isIdentifierStart(this.peek)) {
          return this.scanIdentifier();
        }

        if (isDigit(this.peek)) {
          return this.scanNumber(this.index);
        }

        var start = this.index;

        switch (this.peek) {
          case $PERIOD:
            this.advance();
            return isDigit(this.peek) ? this.scanNumber(start) : new Token(start, '.');
          case $LPAREN:
          case $RPAREN:
          case $LBRACE:
          case $RBRACE:
          case $LBRACKET:
          case $RBRACKET:
          case $COMMA:
          case $COLON:
          case $SEMICOLON:
            return this.scanCharacter(start, String.fromCharCode(this.peek));
          case $SQ:
          case $DQ:
            return this.scanString();
          case $PLUS:
          case $MINUS:
          case $STAR:
          case $SLASH:
          case $PERCENT:
          case $CARET:
          case $QUESTION:
            return this.scanOperator(start, String.fromCharCode(this.peek));
          case $LT:
          case $GT:
          case $BANG:
          case $EQ:
            return this.scanComplexOperator(start, $EQ, String.fromCharCode(this.peek), '=');
          case $AMPERSAND:
            return this.scanComplexOperator(start, $AMPERSAND, '&', '&');
          case $BAR:
            return this.scanComplexOperator(start, $BAR, '|', '|');
          case $NBSP:
            while (isWhitespace(this.peek)) {
              this.advance();
            }

            return this.scanToken();
        }

        var character = String.fromCharCode(this.peek);
        this.error('Unexpected character [' + character + ']');
        return null;
      }
    }, {
      key: 'scanCharacter',
      value: function scanCharacter(start, text) {
        assert(this.peek === text.charCodeAt(0));
        this.advance();
        return new Token(start, text);
      }
    }, {
      key: 'scanOperator',
      value: function scanOperator(start, text) {
        assert(this.peek === text.charCodeAt(0));
        assert(OPERATORS.indexOf(text) !== -1);
        this.advance();
        return new Token(start, text).withOp(text);
      }
    }, {
      key: 'scanComplexOperator',
      value: function scanComplexOperator(start, code, one, two) {
        assert(this.peek === one.charCodeAt(0));
        this.advance();

        var text = one;

        if (this.peek === code) {
          this.advance();
          text += two;
        }

        if (this.peek === code) {
          this.advance();
          text += two;
        }

        assert(OPERATORS.indexOf(text) != -1);

        return new Token(start, text).withOp(text);
      }
    }, {
      key: 'scanIdentifier',
      value: function scanIdentifier() {
        assert(isIdentifierStart(this.peek));
        var start = this.index;

        this.advance();

        while (isIdentifierPart(this.peek)) {
          this.advance();
        }

        var text = this.input.substring(start, this.index);
        var result = new Token(start, text);

        if (OPERATORS.indexOf(text) !== -1) {
          result.withOp(text);
        } else {
          result.withGetterSetter(text);
        }

        return result;
      }
    }, {
      key: 'scanNumber',
      value: function scanNumber(start) {
        assert(isDigit(this.peek));
        var simple = this.index === start;
        this.advance();

        while (true) {
          if (isDigit(this.peek)) {} else if (this.peek === $PERIOD) {
            simple = false;
          } else if (isExponentStart(this.peek)) {
            this.advance();

            if (isExponentSign(this.peek)) {
              this.advance();
            }

            if (!isDigit(this.peek)) {
              this.error('Invalid exponent', -1);
            }

            simple = false;
          } else {
            break;
          }

          this.advance();
        }

        var text = this.input.substring(start, this.index);
        var value = simple ? parseInt(text) : parseFloat(text);
        return new Token(start, text).withValue(value);
      }
    }, {
      key: 'scanString',
      value: function scanString() {
        assert(this.peek === $SQ || this.peek === $DQ);

        var start = this.index;
        var quote = this.peek;

        this.advance();

        var buffer;
        var marker = this.index;

        while (this.peek !== quote) {
          if (this.peek === $BACKSLASH) {
            if (buffer === null) {
              buffer = [];
            }

            buffer.push(this.input.substring(marker, this.index));
            this.advance();

            var unescaped;

            if (this.peek === $u) {
              var hex = this.input.substring(this.index + 1, this.index + 5);

              if (!/[A-Z0-9]{4}/.test(hex)) {
                this.error('Invalid unicode escape [\\u' + hex + ']');
              }

              unescaped = parseInt(hex, 16);

              for (var i = 0; i < 5; ++i) {
                this.advance();
              }
            } else {
              unescaped = decodeURIComponent(this.peek);
              this.advance();
            }

            buffer.push(String.fromCharCode(unescaped));
            marker = this.index;
          } else if (this.peek === $EOF) {
            this.error('Unterminated quote');
          } else {
            this.advance();
          }
        }

        var last = this.input.substring(marker, this.index);
        this.advance();
        var text = this.input.substring(start, this.index);

        var unescaped = last;

        if (buffer != null) {
          buffer.push(last);
          unescaped = buffer.join('');
        }

        return new Token(start, text).withValue(unescaped);
      }
    }, {
      key: 'advance',
      value: function advance() {
        if (++this.index >= this.length) {
          this.peek = $EOF;
        } else {
          this.peek = this.input.charCodeAt(this.index);
        }
      }
    }, {
      key: 'error',
      value: function error(message) {
        var offset = arguments[1] === undefined ? 0 : arguments[1];

        var position = this.index + offset;
        throw new Error('Lexer Error: ' + message + ' at column ' + position + ' in expression [' + this.input + ']');
      }
    }]);

    return Scanner;
  })();

  exports.Scanner = Scanner;

  var OPERATORS = ['undefined', 'null', 'true', 'false', '+', '-', '*', '/', '%', '^', '=', '==', '===', '!=', '!==', '<', '>', '<=', '>=', '&&', '||', '&', '|', '!', '?'];

  var $EOF = 0;
  var $TAB = 9;
  var $LF = 10;
  var $VTAB = 11;
  var $FF = 12;
  var $CR = 13;
  var $SPACE = 32;
  var $BANG = 33;
  var $DQ = 34;
  var $$ = 36;
  var $PERCENT = 37;
  var $AMPERSAND = 38;
  var $SQ = 39;
  var $LPAREN = 40;
  var $RPAREN = 41;
  var $STAR = 42;
  var $PLUS = 43;
  var $COMMA = 44;
  var $MINUS = 45;
  var $PERIOD = 46;
  var $SLASH = 47;
  var $COLON = 58;
  var $SEMICOLON = 59;
  var $LT = 60;
  var $EQ = 61;
  var $GT = 62;
  var $QUESTION = 63;

  var $0 = 48;
  var $9 = 57;

  var $A = 65;
  var $E = 69;
  var $Z = 90;

  var $LBRACKET = 91;
  var $BACKSLASH = 92;
  var $RBRACKET = 93;
  var $CARET = 94;
  var $_ = 95;

  var $a = 97;
  var $e = 101;
  var $f = 102;
  var $n = 110;
  var $r = 114;
  var $t = 116;
  var $u = 117;
  var $v = 118;
  var $z = 122;

  var $LBRACE = 123;
  var $BAR = 124;
  var $RBRACE = 125;
  var $NBSP = 160;

  function isWhitespace(code) {
    return code >= $TAB && code <= $SPACE || code === $NBSP;
  }

  function isIdentifierStart(code) {
    return $a <= code && code <= $z || $A <= code && code <= $Z || code === $_ || code === $$;
  }

  function isIdentifierPart(code) {
    return $a <= code && code <= $z || $A <= code && code <= $Z || $0 <= code && code <= $9 || code === $_ || code === $$;
  }

  function isDigit(code) {
    return $0 <= code && code <= $9;
  }

  function isExponentStart(code) {
    return code === $e || code === $E;
  }

  function isExponentSign(code) {
    return code === $MINUS || code === $PLUS;
  }

  function unescape(code) {
    switch (code) {
      case $n:
        return $LF;
      case $f:
        return $FF;
      case $r:
        return $CR;
      case $t:
        return $TAB;
      case $v:
        return $VTAB;
      default:
        return code;
    }
  }

  function assert(condition, message) {
    if (!condition) {
      throw message || 'Assertion failed';
    }
  }
});
define('aurelia-binding/path-observer',["exports"], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var PathObserver = (function () {
    function PathObserver(leftObserver, getRightObserver, value) {
      var _this = this;

      _classCallCheck(this, PathObserver);

      this.leftObserver = leftObserver;

      this.disposeLeft = leftObserver.subscribe(function (newValue) {
        var newRightValue = _this.updateRight(getRightObserver(newValue));
        _this.notify(newRightValue);
      });

      this.updateRight(getRightObserver(value));
    }

    _createClass(PathObserver, [{
      key: "updateRight",
      value: function updateRight(observer) {
        var _this2 = this;

        this.rightObserver = observer;

        if (this.disposeRight) {
          this.disposeRight();
        }

        if (!observer) {
          return null;
        }

        this.disposeRight = observer.subscribe(function (newValue) {
          return _this2.notify(newValue);
        });
        return observer.getValue();
      }
    }, {
      key: "subscribe",
      value: function subscribe(callback) {
        var that = this;
        that.callback = callback;
        return function () {
          that.callback = null;
        };
      }
    }, {
      key: "notify",
      value: function notify(newValue) {
        var callback = this.callback;

        if (callback) {
          callback(newValue);
        }
      }
    }, {
      key: "dispose",
      value: function dispose() {
        if (this.disposeLeft) {
          this.disposeLeft();
        }

        if (this.disposeRight) {
          this.disposeRight();
        }
      }
    }]);

    return PathObserver;
  })();

  exports.PathObserver = PathObserver;
});
define('aurelia-binding/composite-observer',["exports"], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var CompositeObserver = (function () {
    function CompositeObserver(observers, evaluate) {
      var _this = this;

      _classCallCheck(this, CompositeObserver);

      this.subscriptions = new Array(observers.length);
      this.evaluate = evaluate;

      for (var i = 0, ii = observers.length; i < ii; i++) {
        this.subscriptions[i] = observers[i].subscribe(function (newValue) {
          _this.notify(_this.evaluate());
        });
      }
    }

    _createClass(CompositeObserver, [{
      key: "subscribe",
      value: function subscribe(callback) {
        var that = this;
        that.callback = callback;
        return function () {
          that.callback = null;
        };
      }
    }, {
      key: "notify",
      value: function notify(newValue) {
        var callback = this.callback;

        if (callback) {
          callback(newValue);
        }
      }
    }, {
      key: "dispose",
      value: function dispose() {
        var subscriptions = this.subscriptions;

        var i = subscriptions.length;
        while (i--) {
          subscriptions[i]();
        }
      }
    }]);

    return CompositeObserver;
  })();

  exports.CompositeObserver = CompositeObserver;
});
define('aurelia-binding/ast',['exports', './path-observer', './composite-observer'], function (exports, _pathObserver, _compositeObserver) {
  

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var Expression = (function () {
    function Expression() {
      _classCallCheck(this, Expression);

      this.isChain = false;
      this.isAssignable = false;
    }

    _createClass(Expression, [{
      key: 'evaluate',
      value: function evaluate() {
        throw new Error('Cannot evaluate ' + this);
      }
    }, {
      key: 'assign',
      value: function assign() {
        throw new Error('Cannot assign to ' + this);
      }
    }, {
      key: 'toString',
      value: function toString() {
        return Unparser.unparse(this);
      }
    }]);

    return Expression;
  })();

  exports.Expression = Expression;

  var Chain = (function (_Expression) {
    function Chain(expressions) {
      _classCallCheck(this, Chain);

      _get(Object.getPrototypeOf(Chain.prototype), 'constructor', this).call(this);

      this.expressions = expressions;
      this.isChain = true;
    }

    _inherits(Chain, _Expression);

    _createClass(Chain, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters) {
        var result,
            expressions = this.expressions,
            length = expressions.length,
            i,
            last;

        for (i = 0; i < length; ++i) {
          last = expressions[i].evaluate(scope, valueConverters);

          if (last !== null) {
            result = last;
          }
        }

        return result;
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitChain(this);
      }
    }]);

    return Chain;
  })(Expression);

  exports.Chain = Chain;

  var ValueConverter = (function (_Expression2) {
    function ValueConverter(expression, name, args, allArgs) {
      _classCallCheck(this, ValueConverter);

      _get(Object.getPrototypeOf(ValueConverter.prototype), 'constructor', this).call(this);

      this.expression = expression;
      this.name = name;
      this.args = args;
      this.allArgs = allArgs;
    }

    _inherits(ValueConverter, _Expression2);

    _createClass(ValueConverter, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters) {
        var converter = valueConverters(this.name);
        if (!converter) {
          throw new Error('No ValueConverter named "' + this.name + '" was found!');
        }

        if ('toView' in converter) {
          return converter.toView.apply(converter, evalList(scope, this.allArgs, valueConverters));
        }

        return this.allArgs[0].evaluate(scope, valueConverters);
      }
    }, {
      key: 'assign',
      value: function assign(scope, value, valueConverters) {
        var converter = valueConverters(this.name);
        if (!converter) {
          throw new Error('No ValueConverter named "' + this.name + '" was found!');
        }

        if ('fromView' in converter) {
          value = converter.fromView.apply(converter, [value].concat(evalList(scope, this.args, valueConverters)));
        }

        return this.allArgs[0].assign(scope, value, valueConverters);
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitValueConverter(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        var _this = this;

        var observer,
            childObservers = [],
            i,
            ii,
            exp,
            expInfo;

        for (i = 0, ii = this.allArgs.length; i < ii; ++i) {
          exp = this.allArgs[i];
          expInfo = exp.connect(binding, scope);

          if (expInfo.observer) {
            childObservers.push(expInfo.observer);
          }
        }

        if (childObservers.length) {
          observer = new _compositeObserver.CompositeObserver(childObservers, function () {
            return _this.evaluate(scope, binding.valueConverterLookupFunction);
          });
        }

        return {
          value: this.evaluate(scope, binding.valueConverterLookupFunction),
          observer: observer
        };
      }
    }]);

    return ValueConverter;
  })(Expression);

  exports.ValueConverter = ValueConverter;

  var Assign = (function (_Expression3) {
    function Assign(target, value) {
      _classCallCheck(this, Assign);

      _get(Object.getPrototypeOf(Assign.prototype), 'constructor', this).call(this);

      this.target = target;
      this.value = value;
    }

    _inherits(Assign, _Expression3);

    _createClass(Assign, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters) {
        return this.target.assign(scope, this.value.evaluate(scope, valueConverters));
      }
    }, {
      key: 'accept',
      value: function accept(vistor) {
        vistor.visitAssign(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        return { value: this.evaluate(scope, binding.valueConverterLookupFunction) };
      }
    }]);

    return Assign;
  })(Expression);

  exports.Assign = Assign;

  var Conditional = (function (_Expression4) {
    function Conditional(condition, yes, no) {
      _classCallCheck(this, Conditional);

      _get(Object.getPrototypeOf(Conditional.prototype), 'constructor', this).call(this);

      this.condition = condition;
      this.yes = yes;
      this.no = no;
    }

    _inherits(Conditional, _Expression4);

    _createClass(Conditional, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters) {
        return !!this.condition.evaluate(scope) ? this.yes.evaluate(scope) : this.no.evaluate(scope);
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitConditional(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        var _this2 = this;

        var conditionInfo = this.condition.connect(binding, scope),
            yesInfo = this.yes.connect(binding, scope),
            noInfo = this.no.connect(binding, scope),
            childObservers = [],
            observer;

        if (conditionInfo.observer) {
          childObservers.push(conditionInfo.observer);
        }

        if (yesInfo.observer) {
          childObservers.push(yesInfo.observer);
        }

        if (noInfo.observer) {
          childObservers.push(noInfo.observer);
        }

        if (childObservers.length) {
          observer = new _compositeObserver.CompositeObserver(childObservers, function () {
            return _this2.evaluate(scope, binding.valueConverterLookupFunction);
          });
        }

        return {
          value: !!conditionInfo.value ? yesInfo.value : noInfo.value,
          observer: observer
        };
      }
    }]);

    return Conditional;
  })(Expression);

  exports.Conditional = Conditional;

  var AccessScope = (function (_Expression5) {
    function AccessScope(name) {
      _classCallCheck(this, AccessScope);

      _get(Object.getPrototypeOf(AccessScope.prototype), 'constructor', this).call(this);

      this.name = name;
      this.isAssignable = true;
    }

    _inherits(AccessScope, _Expression5);

    _createClass(AccessScope, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters) {
        return scope[this.name];
      }
    }, {
      key: 'assign',
      value: function assign(scope, value) {
        return scope[this.name] = value;
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitAccessScope(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        var observer = binding.getObserver(scope, this.name);

        return {
          value: observer.getValue(),
          observer: observer
        };
      }
    }]);

    return AccessScope;
  })(Expression);

  exports.AccessScope = AccessScope;

  var AccessMember = (function (_Expression6) {
    function AccessMember(object, name) {
      _classCallCheck(this, AccessMember);

      _get(Object.getPrototypeOf(AccessMember.prototype), 'constructor', this).call(this);

      this.object = object;
      this.name = name;
      this.isAssignable = true;
    }

    _inherits(AccessMember, _Expression6);

    _createClass(AccessMember, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters) {
        var instance = this.object.evaluate(scope, valueConverters);
        return instance === null || instance === undefined ? instance : instance[this.name];
      }
    }, {
      key: 'assign',
      value: function assign(scope, value) {
        var instance = this.object.evaluate(scope);

        if (instance === null || instance === undefined) {
          instance = {};
          this.object.assign(scope, instance);
        }

        return instance[this.name] = value;
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitAccessMember(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        var _this3 = this;

        var info = this.object.connect(binding, scope),
            objectInstance = info.value,
            objectObserver = info.observer,
            observer;

        if (objectObserver) {
          observer = new _pathObserver.PathObserver(objectObserver, function (value) {
            if (value == null || value == undefined) {
              return value;
            }

            return binding.getObserver(value, _this3.name);
          }, objectInstance);
        } else {
          observer = binding.getObserver(objectInstance, this.name);
        }

        return {
          value: objectInstance == null ? null : objectInstance[this.name],
          observer: observer
        };
      }
    }]);

    return AccessMember;
  })(Expression);

  exports.AccessMember = AccessMember;

  var AccessKeyed = (function (_Expression7) {
    function AccessKeyed(object, key) {
      _classCallCheck(this, AccessKeyed);

      _get(Object.getPrototypeOf(AccessKeyed.prototype), 'constructor', this).call(this);

      this.object = object;
      this.key = key;
      this.isAssignable = true;
    }

    _inherits(AccessKeyed, _Expression7);

    _createClass(AccessKeyed, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters) {
        var instance = this.object.evaluate(scope, valueConverters);
        var lookup = this.key.evaluate(scope, valueConverters);
        return getKeyed(instance, lookup);
      }
    }, {
      key: 'assign',
      value: function assign(scope, value) {
        var instance = this.object.evaluate(scope);
        var lookup = this.key.evaluate(scope);
        return setKeyed(instance, lookup, value);
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitAccessKeyed(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        var _this4 = this;

        var objectInfo = this.object.connect(binding, scope),
            keyInfo = this.key.connect(binding, scope),
            childObservers = [],
            observer;

        if (objectInfo.observer) {
          childObservers.push(objectInfo.observer);
        }

        if (keyInfo.observer) {
          childObservers.push(keyInfo.observer);
        }

        if (childObservers.length) {
          observer = new _compositeObserver.CompositeObserver(childObservers, function () {
            return _this4.evaluate(scope, binding.valueConverterLookupFunction);
          });
        }

        return {
          value: this.evaluate(scope, binding.valueConverterLookupFunction),
          observer: observer
        };
      }
    }]);

    return AccessKeyed;
  })(Expression);

  exports.AccessKeyed = AccessKeyed;

  var CallScope = (function (_Expression8) {
    function CallScope(name, args) {
      _classCallCheck(this, CallScope);

      _get(Object.getPrototypeOf(CallScope.prototype), 'constructor', this).call(this);

      this.name = name;
      this.args = args;
    }

    _inherits(CallScope, _Expression8);

    _createClass(CallScope, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters, args) {
        args = args || evalList(scope, this.args, valueConverters);
        return ensureFunctionFromMap(scope, this.name).apply(scope, args);
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitCallScope(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        var _this5 = this;

        var observer,
            childObservers = [],
            i,
            ii,
            exp,
            expInfo;

        for (i = 0, ii = this.args.length; i < ii; ++i) {
          exp = this.args[i];
          expInfo = exp.connect(binding, scope);

          if (expInfo.observer) {
            childObservers.push(expInfo.observer);
          }
        }

        if (childObservers.length) {
          observer = new _compositeObserver.CompositeObserver(childObservers, function () {
            return _this5.evaluate(scope, binding.valueConverterLookupFunction);
          });
        }

        return {
          value: this.evaluate(scope, binding.valueConverterLookupFunction),
          observer: observer
        };
      }
    }]);

    return CallScope;
  })(Expression);

  exports.CallScope = CallScope;

  var CallMember = (function (_Expression9) {
    function CallMember(object, name, args) {
      _classCallCheck(this, CallMember);

      _get(Object.getPrototypeOf(CallMember.prototype), 'constructor', this).call(this);

      this.object = object;
      this.name = name;
      this.args = args;
    }

    _inherits(CallMember, _Expression9);

    _createClass(CallMember, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters, args) {
        var instance = this.object.evaluate(scope, valueConverters);
        args = args || evalList(scope, this.args, valueConverters);
        return ensureFunctionFromMap(instance, this.name).apply(instance, args);
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitCallMember(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        var _this6 = this;

        var observer,
            objectInfo = this.object.connect(binding, scope),
            childObservers = [],
            i,
            ii,
            exp,
            expInfo;

        if (objectInfo.observer) {
          childObservers.push(objectInfo.observer);
        }

        for (i = 0, ii = this.args.length; i < ii; ++i) {
          exp = this.args[i];
          expInfo = exp.connect(binding, scope);

          if (expInfo.observer) {
            childObservers.push(expInfo.observer);
          }
        }

        if (childObservers.length) {
          observer = new _compositeObserver.CompositeObserver(childObservers, function () {
            return _this6.evaluate(scope, binding.valueConverterLookupFunction);
          });
        }

        return {
          value: this.evaluate(scope, binding.valueConverterLookupFunction),
          observer: observer
        };
      }
    }]);

    return CallMember;
  })(Expression);

  exports.CallMember = CallMember;

  var CallFunction = (function (_Expression10) {
    function CallFunction(func, args) {
      _classCallCheck(this, CallFunction);

      _get(Object.getPrototypeOf(CallFunction.prototype), 'constructor', this).call(this);

      this.func = func;
      this.args = args;
    }

    _inherits(CallFunction, _Expression10);

    _createClass(CallFunction, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters, args) {
        var func = this.func.evaluate(scope, valueConverters);

        if (typeof func !== 'function') {
          throw new Error('' + this.func + ' is not a function');
        } else {
          return func.apply(null, args || evalList(scope, this.args, valueConverters));
        }
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitCallFunction(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        var _this7 = this;

        var observer,
            funcInfo = this.func.connect(binding, scope),
            childObservers = [],
            i,
            ii,
            exp,
            expInfo;

        if (funcInfo.observer) {
          childObservers.push(funcInfo.observer);
        }

        for (i = 0, ii = this.args.length; i < ii; ++i) {
          exp = this.args[i];
          expInfo = exp.connect(binding, scope);

          if (expInfo.observer) {
            childObservers.push(expInfo.observer);
          }
        }

        if (childObservers.length) {
          observer = new _compositeObserver.CompositeObserver(childObservers, function () {
            return _this7.evaluate(scope, binding.valueConverterLookupFunction);
          });
        }

        return {
          value: this.evaluate(scope, binding.valueConverterLookupFunction),
          observer: observer
        };
      }
    }]);

    return CallFunction;
  })(Expression);

  exports.CallFunction = CallFunction;

  var Binary = (function (_Expression11) {
    function Binary(operation, left, right) {
      _classCallCheck(this, Binary);

      _get(Object.getPrototypeOf(Binary.prototype), 'constructor', this).call(this);

      this.operation = operation;
      this.left = left;
      this.right = right;
    }

    _inherits(Binary, _Expression11);

    _createClass(Binary, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters) {
        var left = this.left.evaluate(scope);

        switch (this.operation) {
          case '&&':
            return !!left && !!this.right.evaluate(scope);
          case '||':
            return !!left || !!this.right.evaluate(scope);
        }

        var right = this.right.evaluate(scope);

        switch (this.operation) {
          case '==':
            return left == right;
          case '===':
            return left === right;
          case '!=':
            return left != right;
          case '!==':
            return left !== right;
        }

        if (left === null || right === null) {
          switch (this.operation) {
            case '+':
              if (left != null) {
                return left;
              }if (right != null) {
                return right;
              }return 0;
            case '-':
              if (left != null) {
                return left;
              }if (right != null) {
                return 0 - right;
              }return 0;
          }

          return null;
        }

        switch (this.operation) {
          case '+':
            return autoConvertAdd(left, right);
          case '-':
            return left - right;
          case '*':
            return left * right;
          case '/':
            return left / right;
          case '%':
            return left % right;
          case '<':
            return left < right;
          case '>':
            return left > right;
          case '<=':
            return left <= right;
          case '>=':
            return left >= right;
          case '^':
            return left ^ right;
          case '&':
            return left & right;
        }

        throw new Error('Internal error [' + this.operation + '] not handled');
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitBinary(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        var _this8 = this;

        var leftInfo = this.left.connect(binding, scope),
            rightInfo = this.right.connect(binding, scope),
            childObservers = [],
            observer;

        if (leftInfo.observer) {
          childObservers.push(leftInfo.observer);
        }

        if (rightInfo.observer) {
          childObservers.push(rightInfo.observer);
        }

        if (childObservers.length) {
          observer = new _compositeObserver.CompositeObserver(childObservers, function () {
            return _this8.evaluate(scope, binding.valueConverterLookupFunction);
          });
        }

        return {
          value: this.evaluate(scope, binding.valueConverterLookupFunction),
          observer: observer
        };
      }
    }]);

    return Binary;
  })(Expression);

  exports.Binary = Binary;

  var PrefixNot = (function (_Expression12) {
    function PrefixNot(operation, expression) {
      _classCallCheck(this, PrefixNot);

      _get(Object.getPrototypeOf(PrefixNot.prototype), 'constructor', this).call(this);

      this.operation = operation;
      this.expression = expression;
    }

    _inherits(PrefixNot, _Expression12);

    _createClass(PrefixNot, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters) {
        return !this.expression.evaluate(scope);
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitPrefix(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        var _this9 = this;

        var info = this.expression.connect(binding, scope),
            observer;

        if (info.observer) {
          observer = new _compositeObserver.CompositeObserver([info.observer], function () {
            return _this9.evaluate(scope, binding.valueConverterLookupFunction);
          });
        }

        return {
          value: !info.value,
          observer: observer
        };
      }
    }]);

    return PrefixNot;
  })(Expression);

  exports.PrefixNot = PrefixNot;

  var LiteralPrimitive = (function (_Expression13) {
    function LiteralPrimitive(value) {
      _classCallCheck(this, LiteralPrimitive);

      _get(Object.getPrototypeOf(LiteralPrimitive.prototype), 'constructor', this).call(this);

      this.value = value;
    }

    _inherits(LiteralPrimitive, _Expression13);

    _createClass(LiteralPrimitive, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters) {
        return this.value;
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitLiteralPrimitive(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        return { value: this.value };
      }
    }]);

    return LiteralPrimitive;
  })(Expression);

  exports.LiteralPrimitive = LiteralPrimitive;

  var LiteralString = (function (_Expression14) {
    function LiteralString(value) {
      _classCallCheck(this, LiteralString);

      _get(Object.getPrototypeOf(LiteralString.prototype), 'constructor', this).call(this);

      this.value = value;
    }

    _inherits(LiteralString, _Expression14);

    _createClass(LiteralString, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters) {
        return this.value;
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitLiteralString(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        return { value: this.value };
      }
    }]);

    return LiteralString;
  })(Expression);

  exports.LiteralString = LiteralString;

  var LiteralArray = (function (_Expression15) {
    function LiteralArray(elements) {
      _classCallCheck(this, LiteralArray);

      _get(Object.getPrototypeOf(LiteralArray.prototype), 'constructor', this).call(this);

      this.elements = elements;
    }

    _inherits(LiteralArray, _Expression15);

    _createClass(LiteralArray, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters) {
        var elements = this.elements,
            length = elements.length,
            result = [],
            i;

        for (i = 0; i < length; ++i) {
          result[i] = elements[i].evaluate(scope, valueConverters);
        }

        return result;
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitLiteralArray(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        var _this10 = this;

        var observer,
            childObservers = [],
            results = [],
            i,
            ii,
            exp,
            expInfo;

        for (i = 0, ii = this.elements.length; i < ii; ++i) {
          exp = this.elements[i];
          expInfo = exp.connect(binding, scope);

          if (expInfo.observer) {
            childObservers.push(expInfo.observer);
          }

          results[i] = expInfo.value;
        }

        if (childObservers.length) {
          observer = new _compositeObserver.CompositeObserver(childObservers, function () {
            return _this10.evaluate(scope, binding.valueConverterLookupFunction);
          });
        }

        return {
          value: results,
          observer: observer
        };
      }
    }]);

    return LiteralArray;
  })(Expression);

  exports.LiteralArray = LiteralArray;

  var LiteralObject = (function (_Expression16) {
    function LiteralObject(keys, values) {
      _classCallCheck(this, LiteralObject);

      _get(Object.getPrototypeOf(LiteralObject.prototype), 'constructor', this).call(this);

      this.keys = keys;
      this.values = values;
    }

    _inherits(LiteralObject, _Expression16);

    _createClass(LiteralObject, [{
      key: 'evaluate',
      value: function evaluate(scope, valueConverters) {
        var instance = {},
            keys = this.keys,
            values = this.values,
            length = keys.length,
            i;

        for (i = 0; i < length; ++i) {
          instance[keys[i]] = values[i].evaluate(scope, valueConverters);
        }

        return instance;
      }
    }, {
      key: 'accept',
      value: function accept(visitor) {
        visitor.visitLiteralObject(this);
      }
    }, {
      key: 'connect',
      value: function connect(binding, scope) {
        var _this11 = this;

        var observer,
            childObservers = [],
            instance = {},
            keys = this.keys,
            values = this.values,
            length = keys.length,
            i,
            valueInfo;

        for (i = 0; i < length; ++i) {
          valueInfo = values[i].connect(binding, scope);

          if (valueInfo.observer) {
            childObservers.push(valueInfo.observer);
          }

          instance[keys[i]] = valueInfo.value;
        }

        if (childObservers.length) {
          observer = new _compositeObserver.CompositeObserver(childObservers, function () {
            return _this11.evaluate(scope, binding.valueConverterLookupFunction);
          });
        }

        return {
          value: instance,
          observer: observer
        };
      }
    }]);

    return LiteralObject;
  })(Expression);

  exports.LiteralObject = LiteralObject;

  var Unparser = (function () {
    function Unparser(buffer) {
      _classCallCheck(this, Unparser);

      this.buffer = buffer;
    }

    _createClass(Unparser, [{
      key: 'write',
      value: function write(text) {
        this.buffer.push(text);
      }
    }, {
      key: 'writeArgs',
      value: function writeArgs(args) {
        var i, length;

        this.write('(');

        for (i = 0, length = args.length; i < length; ++i) {
          if (i !== 0) {
            this.write(',');
          }

          args[i].accept(this);
        }

        this.write(')');
      }
    }, {
      key: 'visitChain',
      value: function visitChain(chain) {
        var expressions = chain.expressions,
            length = expressions.length,
            i;

        for (i = 0; i < length; ++i) {
          if (i !== 0) {
            this.write(';');
          }

          expressions[i].accept(this);
        }
      }
    }, {
      key: 'visitValueConverter',
      value: function visitValueConverter(converter) {
        var args = converter.args,
            length = args.length,
            i;

        this.write('(');
        converter.expression.accept(this);
        this.write('|' + converter.name);

        for (i = 0; i < length; ++i) {
          this.write(' :');
          args[i].accept(this);
        }

        this.write(')');
      }
    }, {
      key: 'visitAssign',
      value: function visitAssign(assign) {
        assign.target.accept(this);
        this.write('=');
        assign.value.accept(this);
      }
    }, {
      key: 'visitConditional',
      value: function visitConditional(conditional) {
        conditional.condition.accept(this);
        this.write('?');
        conditional.yes.accept(this);
        this.write(':');
        conditional.no.accept(this);
      }
    }, {
      key: 'visitAccessScope',
      value: function visitAccessScope(access) {
        this.write(access.name);
      }
    }, {
      key: 'visitAccessMember',
      value: function visitAccessMember(access) {
        access.object.accept(this);
        this.write('.' + access.name);
      }
    }, {
      key: 'visitAccessKeyed',
      value: function visitAccessKeyed(access) {
        access.object.accept(this);
        this.write('[');
        access.key.accept(this);
        this.write(']');
      }
    }, {
      key: 'visitCallScope',
      value: function visitCallScope(call) {
        this.write(call.name);
        this.writeArgs(call.args);
      }
    }, {
      key: 'visitCallFunction',
      value: function visitCallFunction(call) {
        call.func.accept(this);
        this.writeArgs(call.args);
      }
    }, {
      key: 'visitCallMember',
      value: function visitCallMember(call) {
        call.object.accept(this);
        this.write('.' + call.name);
        this.writeArgs(call.args);
      }
    }, {
      key: 'visitPrefix',
      value: function visitPrefix(prefix) {
        this.write('(' + prefix.operation);
        prefix.expression.accept(this);
        this.write(')');
      }
    }, {
      key: 'visitBinary',
      value: function visitBinary(binary) {
        this.write('(');
        binary.left.accept(this);
        this.write(binary.operation);
        binary.right.accept(this);
        this.write(')');
      }
    }, {
      key: 'visitLiteralPrimitive',
      value: function visitLiteralPrimitive(literal) {
        this.write('' + literal.value);
      }
    }, {
      key: 'visitLiteralArray',
      value: function visitLiteralArray(literal) {
        var elements = literal.elements,
            length = elements.length,
            i;

        this.write('[');

        for (i = 0; i < length; ++i) {
          if (i !== 0) {
            this.write(',');
          }

          elements[i].accept(this);
        }

        this.write(']');
      }
    }, {
      key: 'visitLiteralObject',
      value: function visitLiteralObject(literal) {
        var keys = literal.keys,
            values = literal.values,
            length = keys.length,
            i;

        this.write('{');

        for (i = 0; i < length; ++i) {
          if (i !== 0) {
            this.write(',');
          }

          this.write('\'' + keys[i] + '\':');
          values[i].accept(this);
        }

        this.write('}');
      }
    }, {
      key: 'visitLiteralString',
      value: function visitLiteralString(literal) {
        var escaped = literal.value.replace(/'/g, '\'');
        this.write('\'' + escaped + '\'');
      }
    }], [{
      key: 'unparse',
      value: function unparse(expression) {
        var buffer = [],
            visitor = new Unparser(buffer);

        expression.accept(visitor);

        return buffer.join('');
      }
    }]);

    return Unparser;
  })();

  exports.Unparser = Unparser;

  var evalListCache = [[], [0], [0, 0], [0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0, 0]];

  function evalList(scope, list, valueConverters) {
    var length = list.length,
        cacheLength,
        i;

    for (cacheLength = evalListCache.length; cacheLength <= length; ++cacheLength) {
      evalListCache.push([]);
    }

    var result = evalListCache[length];

    for (i = 0; i < length; ++i) {
      result[i] = list[i].evaluate(scope, valueConverters);
    }

    return result;
  }

  function autoConvertAdd(a, b) {
    if (a != null && b != null) {
      if (typeof a == 'string' && typeof b != 'string') {
        return a + b.toString();
      }

      if (typeof a != 'string' && typeof b == 'string') {
        return a.toString() + b;
      }

      return a + b;
    }

    if (a != null) {
      return a;
    }

    if (b != null) {
      return b;
    }

    return 0;
  }

  function ensureFunctionFromMap(obj, name) {
    var func = obj[name];

    if (typeof func === 'function') {
      return func;
    }

    if (func === null) {
      throw new Error('Undefined function ' + name);
    } else {
      throw new Error('' + name + ' is not a function');
    }
  }

  function getKeyed(obj, key) {
    if (Array.isArray(obj)) {
      return obj[parseInt(key)];
    } else if (obj) {
      return obj[key];
    } else if (obj === null) {
      throw new Error('Accessing null object');
    } else {
      return obj[key];
    }
  }

  function setKeyed(obj, key, value) {
    if (Array.isArray(obj)) {
      var index = parseInt(key);

      if (obj.length <= index) {
        obj.length = index + 1;
      }

      obj[index] = value;
    } else {
      obj[key] = value;
    }

    return value;
  }
});
define('aurelia-binding/parser',['exports', './lexer', './ast'], function (exports, _lexer, _ast) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var EOF = new _lexer.Token(-1, null);

  var Parser = (function () {
    function Parser() {
      _classCallCheck(this, Parser);

      this.cache = {};
      this.lexer = new _lexer.Lexer();
    }

    _createClass(Parser, [{
      key: 'parse',
      value: function parse(input) {
        input = input || '';

        return this.cache[input] || (this.cache[input] = new ParserImplementation(this.lexer, input).parseChain());
      }
    }]);

    return Parser;
  })();

  exports.Parser = Parser;

  var ParserImplementation = (function () {
    function ParserImplementation(lexer, input) {
      _classCallCheck(this, ParserImplementation);

      this.index = 0;
      this.input = input;
      this.tokens = lexer.lex(input);
    }

    _createClass(ParserImplementation, [{
      key: 'peek',
      get: function () {
        return this.index < this.tokens.length ? this.tokens[this.index] : EOF;
      }
    }, {
      key: 'parseChain',
      value: function parseChain() {
        var isChain = false,
            expressions = [];

        while (this.optional(';')) {
          isChain = true;
        }

        while (this.index < this.tokens.length) {
          if (this.peek.text === ')' || this.peek.text === '}' || this.peek.text === ']') {
            this.error('Unconsumed token ' + this.peek.text);
          }

          var expr = this.parseValueConverter();
          expressions.push(expr);

          while (this.optional(';')) {
            isChain = true;
          }

          if (isChain && expr instanceof _ast.ValueConverter) {
            this.error('cannot have a value converter in a chain');
          }
        }

        return expressions.length === 1 ? expressions[0] : new _ast.Chain(expressions);
      }
    }, {
      key: 'parseValueConverter',
      value: function parseValueConverter() {
        var result = this.parseExpression();

        while (this.optional('|')) {
          var name = this.peek.text,
              args = [];

          this.advance();

          while (this.optional(':')) {
            args.push(this.parseExpression());
          }

          result = new _ast.ValueConverter(result, name, args, [result].concat(args));
        }

        return result;
      }
    }, {
      key: 'parseExpression',
      value: function parseExpression() {
        var start = this.peek.index,
            result = this.parseConditional();

        while (this.peek.text === '=') {
          if (!result.isAssignable) {
            var end = this.index < this.tokens.length ? this.peek.index : this.input.length;
            var expression = this.input.substring(start, end);

            this.error('Expression ' + expression + ' is not assignable');
          }

          this.expect('=');
          result = new _ast.Assign(result, this.parseConditional());
        }

        return result;
      }
    }, {
      key: 'parseConditional',
      value: function parseConditional() {
        var start = this.peek.index,
            result = this.parseLogicalOr();

        if (this.optional('?')) {
          var yes = this.parseExpression();

          if (!this.optional(':')) {
            var end = this.index < this.tokens.length ? this.peek.index : this.input.length;
            var expression = this.input.substring(start, end);

            this.error('Conditional expression ' + expression + ' requires all 3 expressions');
          }

          var no = this.parseExpression();
          result = new _ast.Conditional(result, yes, no);
        }

        return result;
      }
    }, {
      key: 'parseLogicalOr',
      value: function parseLogicalOr() {
        var result = this.parseLogicalAnd();

        while (this.optional('||')) {
          result = new _ast.Binary('||', result, this.parseLogicalAnd());
        }

        return result;
      }
    }, {
      key: 'parseLogicalAnd',
      value: function parseLogicalAnd() {
        var result = this.parseEquality();

        while (this.optional('&&')) {
          result = new _ast.Binary('&&', result, this.parseEquality());
        }

        return result;
      }
    }, {
      key: 'parseEquality',
      value: function parseEquality() {
        var result = this.parseRelational();

        while (true) {
          if (this.optional('==')) {
            result = new _ast.Binary('==', result, this.parseRelational());
          } else if (this.optional('!=')) {
            result = new _ast.Binary('!=', result, this.parseRelational());
          } else if (this.optional('===')) {
            result = new _ast.Binary('===', result, this.parseRelational());
          } else if (this.optional('!==')) {
            result = new _ast.Binary('!==', result, this.parseRelational());
          } else {
            return result;
          }
        }
      }
    }, {
      key: 'parseRelational',
      value: function parseRelational() {
        var result = this.parseAdditive();

        while (true) {
          if (this.optional('<')) {
            result = new _ast.Binary('<', result, this.parseAdditive());
          } else if (this.optional('>')) {
            result = new _ast.Binary('>', result, this.parseAdditive());
          } else if (this.optional('<=')) {
            result = new _ast.Binary('<=', result, this.parseAdditive());
          } else if (this.optional('>=')) {
            result = new _ast.Binary('>=', result, this.parseAdditive());
          } else {
            return result;
          }
        }
      }
    }, {
      key: 'parseAdditive',
      value: function parseAdditive() {
        var result = this.parseMultiplicative();

        while (true) {
          if (this.optional('+')) {
            result = new _ast.Binary('+', result, this.parseMultiplicative());
          } else if (this.optional('-')) {
            result = new _ast.Binary('-', result, this.parseMultiplicative());
          } else {
            return result;
          }
        }
      }
    }, {
      key: 'parseMultiplicative',
      value: function parseMultiplicative() {
        var result = this.parsePrefix();

        while (true) {
          if (this.optional('*')) {
            result = new _ast.Binary('*', result, this.parsePrefix());
          } else if (this.optional('%')) {
            result = new _ast.Binary('%', result, this.parsePrefix());
          } else if (this.optional('/')) {
            result = new _ast.Binary('/', result, this.parsePrefix());
          } else {
            return result;
          }
        }
      }
    }, {
      key: 'parsePrefix',
      value: function parsePrefix() {
        if (this.optional('+')) {
          return this.parsePrefix();
        } else if (this.optional('-')) {
          return new _ast.Binary('-', new _ast.LiteralPrimitive(0), this.parsePrefix());
        } else if (this.optional('!')) {
          return new _ast.PrefixNot('!', this.parsePrefix());
        } else {
          return this.parseAccessOrCallMember();
        }
      }
    }, {
      key: 'parseAccessOrCallMember',
      value: function parseAccessOrCallMember() {
        var result = this.parsePrimary();

        while (true) {
          if (this.optional('.')) {
            var name = this.peek.text;

            this.advance();

            if (this.optional('(')) {
              var args = this.parseExpressionList(')');
              this.expect(')');
              result = new _ast.CallMember(result, name, args);
            } else {
              result = new _ast.AccessMember(result, name);
            }
          } else if (this.optional('[')) {
            var key = this.parseExpression();
            this.expect(']');
            result = new _ast.AccessKeyed(result, key);
          } else if (this.optional('(')) {
            var args = this.parseExpressionList(')');
            this.expect(')');
            result = new _ast.CallFunction(result, args);
          } else {
            return result;
          }
        }
      }
    }, {
      key: 'parsePrimary',
      value: function parsePrimary() {
        if (this.optional('(')) {
          var result = this.parseExpression();
          this.expect(')');
          return result;
        } else if (this.optional('null') || this.optional('undefined')) {
          return new _ast.LiteralPrimitive(null);
        } else if (this.optional('true')) {
          return new _ast.LiteralPrimitive(true);
        } else if (this.optional('false')) {
          return new _ast.LiteralPrimitive(false);
        } else if (this.optional('[')) {
          var elements = this.parseExpressionList(']');
          this.expect(']');
          return new _ast.LiteralArray(elements);
        } else if (this.peek.text == '{') {
          return this.parseObject();
        } else if (this.peek.key != null) {
          return this.parseAccessOrCallScope();
        } else if (this.peek.value != null) {
          var value = this.peek.value;
          this.advance();
          return isNaN(value) ? new _ast.LiteralString(value) : new _ast.LiteralPrimitive(value);
        } else if (this.index >= this.tokens.length) {
          throw new Error('Unexpected end of expression: ' + this.input);
        } else {
          this.error('Unexpected token ' + this.peek.text);
        }
      }
    }, {
      key: 'parseAccessOrCallScope',
      value: function parseAccessOrCallScope() {
        var name = this.peek.key;

        this.advance();

        if (!this.optional('(')) {
          return new _ast.AccessScope(name);
        }

        var args = this.parseExpressionList(')');
        this.expect(')');
        return new _ast.CallScope(name, args);
      }
    }, {
      key: 'parseObject',
      value: function parseObject() {
        var keys = [],
            values = [];

        this.expect('{');

        if (this.peek.text !== '}') {
          do {
            var value = this.peek.value;
            keys.push(typeof value === 'string' ? value : this.peek.text);

            this.advance();
            this.expect(':');

            values.push(this.parseExpression());
          } while (this.optional(','));
        }

        this.expect('}');

        return new _ast.LiteralObject(keys, values);
      }
    }, {
      key: 'parseExpressionList',
      value: function parseExpressionList(terminator) {
        var result = [];

        if (this.peek.text != terminator) {
          do {
            result.push(this.parseExpression());
          } while (this.optional(','));
        }

        return result;
      }
    }, {
      key: 'optional',
      value: function optional(text) {
        if (this.peek.text === text) {
          this.advance();
          return true;
        }

        return false;
      }
    }, {
      key: 'expect',
      value: function expect(text) {
        if (this.peek.text === text) {
          this.advance();
        } else {
          this.error('Missing expected ' + text);
        }
      }
    }, {
      key: 'advance',
      value: function advance() {
        this.index++;
      }
    }, {
      key: 'error',
      value: function error(message) {
        var location = this.index < this.tokens.length ? 'at column ' + (this.tokens[this.index].index + 1) + ' in' : 'at the end of the expression';

        throw new Error('Parser Error: ' + message + ' ' + location + ' [' + this.input + ']');
      }
    }]);

    return ParserImplementation;
  })();

  exports.ParserImplementation = ParserImplementation;
});
define('aurelia-binding/binding-expression',['exports', './binding-modes'], function (exports, _bindingModes) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var BindingExpression = (function () {
    function BindingExpression(observerLocator, targetProperty, sourceExpression, mode, valueConverterLookupFunction, attribute) {
      _classCallCheck(this, BindingExpression);

      this.observerLocator = observerLocator;
      this.targetProperty = targetProperty;
      this.sourceExpression = sourceExpression;
      this.mode = mode;
      this.valueConverterLookupFunction = valueConverterLookupFunction;
      this.attribute = attribute;
      this.discrete = false;
    }

    _createClass(BindingExpression, [{
      key: 'createBinding',
      value: function createBinding(target) {
        return new Binding(this.observerLocator, this.sourceExpression, target, this.targetProperty, this.mode, this.valueConverterLookupFunction);
      }
    }]);

    return BindingExpression;
  })();

  exports.BindingExpression = BindingExpression;

  var Binding = (function () {
    function Binding(observerLocator, sourceExpression, target, targetProperty, mode, valueConverterLookupFunction) {
      _classCallCheck(this, Binding);

      this.observerLocator = observerLocator;
      this.sourceExpression = sourceExpression;
      this.targetProperty = observerLocator.getObserver(target, targetProperty);
      this.mode = mode;
      this.valueConverterLookupFunction = valueConverterLookupFunction;
    }

    _createClass(Binding, [{
      key: 'getObserver',
      value: function getObserver(obj, propertyName) {
        return this.observerLocator.getObserver(obj, propertyName);
      }
    }, {
      key: 'bind',
      value: function bind(source) {
        var _this = this;

        var targetProperty = this.targetProperty,
            info;

        if ('bind' in targetProperty) {
          targetProperty.bind();
        }

        if (this.mode == _bindingModes.ONE_WAY || this.mode == _bindingModes.TWO_WAY) {
          if (this._disposeObserver) {
            if (this.source === source) {
              return;
            }

            this.unbind();
          }

          info = this.sourceExpression.connect(this, source);

          if (info.observer) {
            this._disposeObserver = info.observer.subscribe(function (newValue) {
              var existing = targetProperty.getValue();
              if (newValue !== existing) {
                targetProperty.setValue(newValue);
              }
            });
          }

          if (info.value !== undefined) {
            targetProperty.setValue(info.value);
          }

          if (this.mode == _bindingModes.TWO_WAY) {
            this._disposeListener = targetProperty.subscribe(function (newValue) {
              _this.sourceExpression.assign(source, newValue, _this.valueConverterLookupFunction);
            });
          }

          this.source = source;
        } else {
          var value = this.sourceExpression.evaluate(source, this.valueConverterLookupFunction);

          if (value !== undefined) {
            targetProperty.setValue(value);
          }
        }
      }
    }, {
      key: 'unbind',
      value: function unbind() {
        if ('unbind' in this.targetProperty) {
          this.targetProperty.unbind();
        }
        if (this._disposeObserver) {
          this._disposeObserver();
          this._disposeObserver = null;
        }

        if (this._disposeListener) {
          this._disposeListener();
          this._disposeListener = null;
        }
      }
    }]);

    return Binding;
  })();
});
define('aurelia-binding/listener-expression',["exports"], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var ListenerExpression = (function () {
    function ListenerExpression(eventManager, targetEvent, sourceExpression, delegate, preventDefault) {
      _classCallCheck(this, ListenerExpression);

      this.eventManager = eventManager;
      this.targetEvent = targetEvent;
      this.sourceExpression = sourceExpression;
      this.delegate = delegate;
      this.discrete = true;
      this.preventDefault = preventDefault;
    }

    _createClass(ListenerExpression, [{
      key: "createBinding",
      value: function createBinding(target) {
        return new Listener(this.eventManager, this.targetEvent, this.delegate, this.sourceExpression, target, this.preventDefault);
      }
    }]);

    return ListenerExpression;
  })();

  exports.ListenerExpression = ListenerExpression;

  var Listener = (function () {
    function Listener(eventManager, targetEvent, delegate, sourceExpression, target, preventDefault) {
      _classCallCheck(this, Listener);

      this.eventManager = eventManager;
      this.targetEvent = targetEvent;
      this.delegate = delegate;
      this.sourceExpression = sourceExpression;
      this.target = target;
      this.preventDefault = preventDefault;
    }

    _createClass(Listener, [{
      key: "bind",
      value: function bind(source) {
        var _this = this;

        if (this._disposeListener) {
          if (this.source === source) {
            return;
          }

          this.unbind();
        }

        this.source = source;
        this._disposeListener = this.eventManager.addEventListener(this.target, this.targetEvent, function (event) {
          var prevEvent = source.$event;
          source.$event = event;
          var result = _this.sourceExpression.evaluate(source);
          source.$event = prevEvent;
          if (result !== true && _this.preventDefault) {
            event.preventDefault();
          }
          return result;
        }, this.delegate);
      }
    }, {
      key: "unbind",
      value: function unbind() {
        if (this._disposeListener) {
          this._disposeListener();
          this._disposeListener = null;
        }
      }
    }]);

    return Listener;
  })();
});
define('aurelia-binding/name-expression',['exports'], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var NameExpression = (function () {
    function NameExpression(name, mode) {
      _classCallCheck(this, NameExpression);

      this.property = name;
      this.discrete = true;
      this.mode = (mode || 'view-model').toLowerCase();
    }

    _createClass(NameExpression, [{
      key: 'createBinding',
      value: function createBinding(target) {
        return new NameBinder(this.property, target, this.mode);
      }
    }]);

    return NameExpression;
  })();

  exports.NameExpression = NameExpression;

  var NameBinder = (function () {
    function NameBinder(property, target, mode) {
      _classCallCheck(this, NameBinder);

      this.property = property;

      switch (mode) {
        case 'element':
          this.target = target;
          break;
        case 'view-model':
          this.target = target.primaryBehavior ? target.primaryBehavior.executionContext : target;
          break;
        default:
          throw new Error('Name expressions do not support mode: ' + mode);
      }
    }

    _createClass(NameBinder, [{
      key: 'bind',
      value: function bind(source) {
        if (this.source) {
          if (this.source === source) {
            return;
          }

          this.unbind();
        }

        this.source = source;
        source[this.property] = this.target;
      }
    }, {
      key: 'unbind',
      value: function unbind() {
        this.source[this.property] = null;
      }
    }]);

    return NameBinder;
  })();
});
define('aurelia-binding/call-expression',["exports"], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var CallExpression = (function () {
    function CallExpression(observerLocator, targetProperty, sourceExpression, valueConverterLookupFunction) {
      _classCallCheck(this, CallExpression);

      this.observerLocator = observerLocator;
      this.targetProperty = targetProperty;
      this.sourceExpression = sourceExpression;
      this.valueConverterLookupFunction = valueConverterLookupFunction;
    }

    _createClass(CallExpression, [{
      key: "createBinding",
      value: function createBinding(target) {
        return new Call(this.observerLocator, this.sourceExpression, target, this.targetProperty, this.valueConverterLookupFunction);
      }
    }]);

    return CallExpression;
  })();

  exports.CallExpression = CallExpression;

  var Call = (function () {
    function Call(observerLocator, sourceExpression, target, targetProperty, valueConverterLookupFunction) {
      _classCallCheck(this, Call);

      this.sourceExpression = sourceExpression;
      this.target = target;
      this.targetProperty = observerLocator.getObserver(target, targetProperty);
      this.valueConverterLookupFunction = valueConverterLookupFunction;
    }

    _createClass(Call, [{
      key: "bind",
      value: function bind(source) {
        var _this = this;

        if (this.source === source) {
          return;
        }

        if (this.source) {
          this.unbind();
        }

        this.source = source;
        this.targetProperty.setValue(function () {
          for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
            rest[_key] = arguments[_key];
          }

          return _this.sourceExpression.evaluate(source, _this.valueConverterLookupFunction, rest);
        });
      }
    }, {
      key: "unbind",
      value: function unbind() {
        this.targetProperty.setValue(null);
      }
    }]);

    return Call;
  })();
});
define('aurelia-binding/index',['exports', 'aurelia-metadata', './value-converter', './event-manager', './observer-locator', './array-change-records', './binding-modes', './parser', './binding-expression', './listener-expression', './name-expression', './call-expression', './dirty-checking', './map-change-records', './computed-observation'], function (exports, _aureliaMetadata, _valueConverter, _eventManager, _observerLocator, _arrayChangeRecords, _bindingModes, _parser, _bindingExpression, _listenerExpression, _nameExpression, _callExpression, _dirtyChecking, _mapChangeRecords, _computedObservation) {
  

  var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

  var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.valueConverter = valueConverter;
  exports.computedFrom = computedFrom;
  Object.defineProperty(exports, 'EventManager', {
    enumerable: true,
    get: function get() {
      return _eventManager.EventManager;
    }
  });
  Object.defineProperty(exports, 'ObserverLocator', {
    enumerable: true,
    get: function get() {
      return _observerLocator.ObserverLocator;
    }
  });
  Object.defineProperty(exports, 'ObjectObservationAdapter', {
    enumerable: true,
    get: function get() {
      return _observerLocator.ObjectObservationAdapter;
    }
  });
  Object.defineProperty(exports, 'ValueConverterResource', {
    enumerable: true,
    get: function get() {
      return _valueConverter.ValueConverterResource;
    }
  });
  Object.defineProperty(exports, 'calcSplices', {
    enumerable: true,
    get: function get() {
      return _arrayChangeRecords.calcSplices;
    }
  });

  _defaults(exports, _interopRequireWildcard(_bindingModes));

  Object.defineProperty(exports, 'Parser', {
    enumerable: true,
    get: function get() {
      return _parser.Parser;
    }
  });
  Object.defineProperty(exports, 'BindingExpression', {
    enumerable: true,
    get: function get() {
      return _bindingExpression.BindingExpression;
    }
  });
  Object.defineProperty(exports, 'ListenerExpression', {
    enumerable: true,
    get: function get() {
      return _listenerExpression.ListenerExpression;
    }
  });
  Object.defineProperty(exports, 'NameExpression', {
    enumerable: true,
    get: function get() {
      return _nameExpression.NameExpression;
    }
  });
  Object.defineProperty(exports, 'CallExpression', {
    enumerable: true,
    get: function get() {
      return _callExpression.CallExpression;
    }
  });
  Object.defineProperty(exports, 'DirtyChecker', {
    enumerable: true,
    get: function get() {
      return _dirtyChecking.DirtyChecker;
    }
  });
  Object.defineProperty(exports, 'getChangeRecords', {
    enumerable: true,
    get: function get() {
      return _mapChangeRecords.getChangeRecords;
    }
  });
  Object.defineProperty(exports, 'ComputedPropertyObserver', {
    enumerable: true,
    get: function get() {
      return _computedObservation.ComputedPropertyObserver;
    }
  });
  Object.defineProperty(exports, 'declarePropertyDependencies', {
    enumerable: true,
    get: function get() {
      return _computedObservation.declarePropertyDependencies;
    }
  });

  function valueConverter(name) {
    return function (target) {
      _aureliaMetadata.Metadata.on(target).add(new _valueConverter.ValueConverterResource(name));
      return target;
    };
  }

  _aureliaMetadata.Decorators.configure.parameterizedDecorator('valueConverter', valueConverter);

  function computedFrom() {
    for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
      rest[_key] = arguments[_key];
    }

    return function (target, key, descriptor) {
      if (descriptor.set) {
        throw new Error('The computed property "' + key + '" cannot have a setter function.');
      }
      descriptor.get.dependencies = rest;
      return descriptor;
    };
  }
});
define('aurelia-binding', ['aurelia-binding/index'], function (main) { return main; });

define('aurelia-templating/view-strategy',['exports', 'aurelia-metadata', 'aurelia-path'], function (exports, _aureliaMetadata, _aureliaPath) {
  

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var ViewStrategy = (function () {
    function ViewStrategy() {
      _classCallCheck(this, ViewStrategy);
    }

    _createClass(ViewStrategy, [{
      key: 'makeRelativeTo',
      value: function makeRelativeTo(baseUrl) {}
    }, {
      key: 'loadViewFactory',
      value: function loadViewFactory(viewEngine, options) {
        throw new Error('A ViewStrategy must implement loadViewFactory(viewEngine, options).');
      }
    }], [{
      key: 'normalize',
      value: function normalize(value) {
        if (typeof value === 'string') {
          value = new UseViewStrategy(value);
        }

        if (value && !(value instanceof ViewStrategy)) {
          throw new Error('The view must be a string or an instance of ViewStrategy.');
        }

        return value;
      }
    }, {
      key: 'getDefault',
      value: function getDefault(target) {
        var strategy, annotation;

        if (typeof target !== 'function') {
          target = target.constructor;
        }

        annotation = _aureliaMetadata.Origin.get(target);
        strategy = _aureliaMetadata.Metadata.on(target).first(ViewStrategy);

        if (!strategy) {
          if (!annotation) {
            throw new Error('Cannot determinte default view strategy for object.', target);
          }

          strategy = new ConventionalViewStrategy(annotation.moduleId);
        } else if (annotation) {
          strategy.moduleId = annotation.moduleId;
        }

        return strategy;
      }
    }]);

    return ViewStrategy;
  })();

  exports.ViewStrategy = ViewStrategy;

  var UseViewStrategy = (function (_ViewStrategy) {
    function UseViewStrategy(path) {
      _classCallCheck(this, UseViewStrategy);

      _get(Object.getPrototypeOf(UseViewStrategy.prototype), 'constructor', this).call(this);
      this.path = path;
    }

    _inherits(UseViewStrategy, _ViewStrategy);

    _createClass(UseViewStrategy, [{
      key: 'loadViewFactory',
      value: function loadViewFactory(viewEngine, options) {
        if (!this.absolutePath && this.moduleId) {
          this.absolutePath = _aureliaPath.relativeToFile(this.path, this.moduleId);
        }

        return viewEngine.loadViewFactory(this.absolutePath || this.path, options, this.moduleId);
      }
    }, {
      key: 'makeRelativeTo',
      value: function makeRelativeTo(file) {
        this.absolutePath = _aureliaPath.relativeToFile(this.path, file);
      }
    }]);

    return UseViewStrategy;
  })(ViewStrategy);

  exports.UseViewStrategy = UseViewStrategy;

  var ConventionalViewStrategy = (function (_ViewStrategy2) {
    function ConventionalViewStrategy(moduleId) {
      _classCallCheck(this, ConventionalViewStrategy);

      _get(Object.getPrototypeOf(ConventionalViewStrategy.prototype), 'constructor', this).call(this);
      this.moduleId = moduleId;
      this.viewUrl = ConventionalViewStrategy.convertModuleIdToViewUrl(moduleId);
    }

    _inherits(ConventionalViewStrategy, _ViewStrategy2);

    _createClass(ConventionalViewStrategy, [{
      key: 'loadViewFactory',
      value: function loadViewFactory(viewEngine, options) {
        return viewEngine.loadViewFactory(this.viewUrl, options, this.moduleId);
      }
    }], [{
      key: 'convertModuleIdToViewUrl',
      value: function convertModuleIdToViewUrl(moduleId) {
        return moduleId + '.html';
      }
    }]);

    return ConventionalViewStrategy;
  })(ViewStrategy);

  exports.ConventionalViewStrategy = ConventionalViewStrategy;

  var NoViewStrategy = (function (_ViewStrategy3) {
    function NoViewStrategy() {
      _classCallCheck(this, NoViewStrategy);

      if (_ViewStrategy3 != null) {
        _ViewStrategy3.apply(this, arguments);
      }
    }

    _inherits(NoViewStrategy, _ViewStrategy3);

    _createClass(NoViewStrategy, [{
      key: 'loadViewFactory',
      value: function loadViewFactory() {
        return Promise.resolve(null);
      }
    }]);

    return NoViewStrategy;
  })(ViewStrategy);

  exports.NoViewStrategy = NoViewStrategy;

  var TemplateRegistryViewStrategy = (function (_ViewStrategy4) {
    function TemplateRegistryViewStrategy(moduleId, registryEntry) {
      _classCallCheck(this, TemplateRegistryViewStrategy);

      _get(Object.getPrototypeOf(TemplateRegistryViewStrategy.prototype), 'constructor', this).call(this);
      this.moduleId = moduleId;
      this.registryEntry = registryEntry;
    }

    _inherits(TemplateRegistryViewStrategy, _ViewStrategy4);

    _createClass(TemplateRegistryViewStrategy, [{
      key: 'loadViewFactory',
      value: function loadViewFactory(viewEngine, options) {
        if (this.registryEntry.isReady) {
          return Promise.resolve(this.registryEntry.factory);
        }

        return viewEngine.loadViewFactory(this.registryEntry, options, this.moduleId);
      }
    }]);

    return TemplateRegistryViewStrategy;
  })(ViewStrategy);

  exports.TemplateRegistryViewStrategy = TemplateRegistryViewStrategy;
});
define('aurelia-templating/resource-registry',['exports', 'aurelia-path'], function (exports, _aureliaPath) {
  

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function register(lookup, name, resource, type) {
    if (!name) {
      return;
    }

    var existing = lookup[name];
    if (existing) {
      if (existing != resource) {
        throw new Error('Attempted to register ' + type + ' when one with the same name already exists. Name: ' + name + '.');
      }

      return;
    }

    lookup[name] = resource;
  }

  var ResourceRegistry = (function () {
    function ResourceRegistry() {
      _classCallCheck(this, ResourceRegistry);

      this.attributes = {};
      this.elements = {};
      this.valueConverters = {};
      this.attributeMap = {};
      this.baseResourceUrl = '';
    }

    _createClass(ResourceRegistry, [{
      key: 'registerElement',
      value: function registerElement(tagName, behavior) {
        register(this.elements, tagName, behavior, 'an Element');
      }
    }, {
      key: 'getElement',
      value: function getElement(tagName) {
        return this.elements[tagName];
      }
    }, {
      key: 'registerAttribute',
      value: function registerAttribute(attribute, behavior, knownAttribute) {
        this.attributeMap[attribute] = knownAttribute;
        register(this.attributes, attribute, behavior, 'an Attribute');
      }
    }, {
      key: 'getAttribute',
      value: function getAttribute(attribute) {
        return this.attributes[attribute];
      }
    }, {
      key: 'registerValueConverter',
      value: function registerValueConverter(name, valueConverter) {
        register(this.valueConverters, name, valueConverter, 'a ValueConverter');
      }
    }, {
      key: 'getValueConverter',
      value: function getValueConverter(name) {
        return this.valueConverters[name];
      }
    }]);

    return ResourceRegistry;
  })();

  exports.ResourceRegistry = ResourceRegistry;

  var ViewResources = (function (_ResourceRegistry) {
    function ViewResources(parent, viewUrl) {
      _classCallCheck(this, ViewResources);

      _get(Object.getPrototypeOf(ViewResources.prototype), 'constructor', this).call(this);
      this.parent = parent;
      this.viewUrl = viewUrl;
      this.valueConverterLookupFunction = this.getValueConverter.bind(this);
    }

    _inherits(ViewResources, _ResourceRegistry);

    _createClass(ViewResources, [{
      key: 'relativeToView',
      value: function relativeToView(path) {
        return _aureliaPath.relativeToFile(path, this.viewUrl);
      }
    }, {
      key: 'getElement',
      value: function getElement(tagName) {
        return this.elements[tagName] || this.parent.getElement(tagName);
      }
    }, {
      key: 'mapAttribute',
      value: function mapAttribute(attribute) {
        return this.attributeMap[attribute] || this.parent.attributeMap[attribute];
      }
    }, {
      key: 'getAttribute',
      value: function getAttribute(attribute) {
        return this.attributes[attribute] || this.parent.getAttribute(attribute);
      }
    }, {
      key: 'getValueConverter',
      value: function getValueConverter(name) {
        return this.valueConverters[name] || this.parent.getValueConverter(name);
      }
    }]);

    return ViewResources;
  })(ResourceRegistry);

  exports.ViewResources = ViewResources;
});
define('aurelia-templating/view',["exports"], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var View = (function () {
    function View(fragment, behaviors, bindings, children, systemControlled, contentSelectors) {
      _classCallCheck(this, View);

      this.fragment = fragment;
      this.behaviors = behaviors;
      this.bindings = bindings;
      this.children = children;
      this.systemControlled = systemControlled;
      this.contentSelectors = contentSelectors;
      this.firstChild = fragment.firstChild;
      this.lastChild = fragment.lastChild;
      this.isBound = false;
      this.isAttached = false;
    }

    _createClass(View, [{
      key: "created",
      value: function created(executionContext) {
        var i,
            ii,
            behaviors = this.behaviors;
        for (i = 0, ii = behaviors.length; i < ii; ++i) {
          behaviors[i].created(executionContext);
        }
      }
    }, {
      key: "bind",
      value: function bind(executionContext, systemUpdate) {
        var context, behaviors, bindings, children, i, ii;

        if (systemUpdate && !this.systemControlled) {
          context = this.executionContext || executionContext;
        } else {
          context = executionContext || this.executionContext;
        }

        if (this.isBound) {
          if (this.executionContext === context) {
            return;
          }

          this.unbind();
        }

        this.isBound = true;
        this.executionContext = context;

        if (this.owner) {
          this.owner.bind(context);
        }

        bindings = this.bindings;
        for (i = 0, ii = bindings.length; i < ii; ++i) {
          bindings[i].bind(context);
        }

        behaviors = this.behaviors;
        for (i = 0, ii = behaviors.length; i < ii; ++i) {
          behaviors[i].bind(context);
        }

        children = this.children;
        for (i = 0, ii = children.length; i < ii; ++i) {
          children[i].bind(context, true);
        }
      }
    }, {
      key: "addBinding",
      value: function addBinding(binding) {
        this.bindings.push(binding);

        if (this.isBound) {
          binding.bind(this.executionContext);
        }
      }
    }, {
      key: "unbind",
      value: function unbind() {
        var behaviors, bindings, children, i, ii;

        if (this.isBound) {
          this.isBound = false;

          if (this.owner) {
            this.owner.unbind();
          }

          bindings = this.bindings;
          for (i = 0, ii = bindings.length; i < ii; ++i) {
            bindings[i].unbind();
          }

          behaviors = this.behaviors;
          for (i = 0, ii = behaviors.length; i < ii; ++i) {
            behaviors[i].unbind();
          }

          children = this.children;
          for (i = 0, ii = children.length; i < ii; ++i) {
            children[i].unbind();
          }
        }
      }
    }, {
      key: "insertNodesBefore",
      value: function insertNodesBefore(refNode) {
        var parent = refNode.parentNode;
        parent.insertBefore(this.fragment, refNode);
      }
    }, {
      key: "appendNodesTo",
      value: function appendNodesTo(parent) {
        parent.appendChild(this.fragment);
      }
    }, {
      key: "removeNodes",
      value: function removeNodes() {
        var start = this.firstChild,
            end = this.lastChild,
            fragment = this.fragment,
            next;

        var current = start,
            loop = true,
            nodes = [];

        while (loop) {
          if (current === end) {
            loop = false;
          }

          next = current.nextSibling;
          this.fragment.appendChild(current);
          current = next;
        }
      }
    }, {
      key: "attached",
      value: function attached() {
        var behaviors, children, i, ii;

        if (this.isAttached) {
          return;
        }

        this.isAttached = true;

        if (this.owner) {
          this.owner.attached();
        }

        behaviors = this.behaviors;
        for (i = 0, ii = behaviors.length; i < ii; ++i) {
          behaviors[i].attached();
        }

        children = this.children;
        for (i = 0, ii = children.length; i < ii; ++i) {
          children[i].attached();
        }
      }
    }, {
      key: "detached",
      value: function detached() {
        var behaviors, children, i, ii;

        if (this.isAttached) {
          this.isAttached = false;

          if (this.owner) {
            this.owner.detached();
          }

          behaviors = this.behaviors;
          for (i = 0, ii = behaviors.length; i < ii; ++i) {
            behaviors[i].detached();
          }

          children = this.children;
          for (i = 0, ii = children.length; i < ii; ++i) {
            children[i].detached();
          }
        }
      }
    }]);

    return View;
  })();

  exports.View = View;
});
define('aurelia-templating/content-selector',['exports', 'core-js'], function (exports, _coreJs) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  if (Element && !Element.prototype.matches) {
    var proto = Element.prototype;
    proto.matches = proto.matchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector || proto.webkitMatchesSelector;
  }

  var placeholder = [];

  function findInsertionPoint(groups, index) {
    var insertionPoint;

    while (!insertionPoint && index >= 0) {
      insertionPoint = groups[index][0];
      index--;
    }

    return insertionPoint || anchor;
  }

  var ContentSelector = (function () {
    function ContentSelector(anchor, selector) {
      _classCallCheck(this, ContentSelector);

      this.anchor = anchor;
      this.selector = selector;
      this.all = !this.selector;
      this.groups = [];
    }

    _createClass(ContentSelector, [{
      key: 'copyForViewSlot',
      value: function copyForViewSlot() {
        return new ContentSelector(this.anchor, this.selector);
      }
    }, {
      key: 'matches',
      value: function matches(node) {
        return this.all || node.nodeType === 1 && node.matches(this.selector);
      }
    }, {
      key: 'add',
      value: function add(group) {
        var anchor = this.anchor,
            parent = anchor.parentNode,
            i,
            ii;

        for (i = 0, ii = group.length; i < ii; ++i) {
          parent.insertBefore(group[i], anchor);
        }

        this.groups.push(group);
      }
    }, {
      key: 'insert',
      value: function insert(index, group) {
        if (group.length) {
          var anchor = findInsertionPoint(this.groups, index) || this.anchor,
              parent = anchor.parentNode,
              i,
              ii;

          for (i = 0, ii = group.length; i < ii; ++i) {
            parent.insertBefore(group[i], anchor);
          }
        }

        this.groups.splice(index, 0, group);
      }
    }, {
      key: 'removeAt',
      value: function removeAt(index, fragment) {
        var group = this.groups[index],
            i,
            ii;

        for (i = 0, ii = group.length; i < ii; ++i) {
          fragment.appendChild(group[i]);
        }

        this.groups.splice(index, 1);
      }
    }], [{
      key: 'applySelectors',
      value: function applySelectors(view, contentSelectors, callback) {
        var currentChild = view.fragment.firstChild,
            contentMap = new Map(),
            nextSibling,
            i,
            ii,
            contentSelector;

        while (currentChild) {
          nextSibling = currentChild.nextSibling;

          if (currentChild.viewSlot) {
            var viewSlotSelectors = contentSelectors.map(function (x) {
              return x.copyForViewSlot();
            });
            currentChild.viewSlot.installContentSelectors(viewSlotSelectors);
          } else {
            for (i = 0, ii = contentSelectors.length; i < ii; i++) {
              contentSelector = contentSelectors[i];
              if (contentSelector.matches(currentChild)) {
                var elements = contentMap.get(contentSelector);
                if (!elements) {
                  elements = [];
                  contentMap.set(contentSelector, elements);
                }

                elements.push(currentChild);
                break;
              }
            }
          }

          currentChild = nextSibling;
        }

        for (i = 0, ii = contentSelectors.length; i < ii; ++i) {
          contentSelector = contentSelectors[i];
          callback(contentSelector, contentMap.get(contentSelector) || placeholder);
        }
      }
    }]);

    return ContentSelector;
  })();

  exports.ContentSelector = ContentSelector;
});
define('aurelia-templating/animator',["exports"], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var Animator = (function () {
    function Animator() {
      _classCallCheck(this, Animator);
    }

    _createClass(Animator, [{
      key: "move",
      value: function move() {
        return Promise.resolve(false);
      }
    }, {
      key: "enter",
      value: function enter(element) {
        return Promise.resolve(false);
      }
    }, {
      key: "leave",
      value: function leave(element) {
        return Promise.resolve(false);
      }
    }, {
      key: "removeClass",
      value: function removeClass(element, className) {
        return Promise.resolve(false);
      }
    }, {
      key: "addClass",
      value: function addClass(element, className) {
        return Promise.resolve(false);
      }
    }], [{
      key: "configureDefault",
      value: function configureDefault(container, animatorInstance) {
        container.registerInstance(Animator, Animator.instance = animatorInstance || new Animator());
      }
    }]);

    return Animator;
  })();

  exports.Animator = Animator;
});
define('aurelia-templating/view-slot',['exports', './content-selector', './animator'], function (exports, _contentSelector, _animator) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var ViewSlot = (function () {
    function ViewSlot(anchor, anchorIsContainer, executionContext) {
      var animator = arguments[3] === undefined ? _animator.Animator.instance : arguments[3];

      _classCallCheck(this, ViewSlot);

      this.anchor = anchor;
      this.viewAddMethod = anchorIsContainer ? 'appendNodesTo' : 'insertNodesBefore';
      this.executionContext = executionContext;
      this.animator = animator;
      this.children = [];
      this.isBound = false;
      this.isAttached = false;
      anchor.viewSlot = this;
    }

    _createClass(ViewSlot, [{
      key: 'transformChildNodesIntoView',
      value: function transformChildNodesIntoView() {
        var parent = this.anchor;

        this.children.push({
          fragment: parent,
          firstChild: parent.firstChild,
          lastChild: parent.lastChild,
          removeNodes: function removeNodes() {
            var last;

            while (last = parent.lastChild) {
              parent.removeChild(last);
            }
          },
          created: function created() {},
          bind: function bind() {},
          unbind: function unbind() {},
          attached: function attached() {},
          detached: function detached() {}
        });
      }
    }, {
      key: 'bind',
      value: function bind(executionContext) {
        var i, ii, children;

        if (this.isBound) {
          if (this.executionContext === executionContext) {
            return;
          }

          this.unbind();
        }

        this.isBound = true;
        this.executionContext = executionContext = executionContext || this.executionContext;

        children = this.children;
        for (i = 0, ii = children.length; i < ii; ++i) {
          children[i].bind(executionContext, true);
        }
      }
    }, {
      key: 'unbind',
      value: function unbind() {
        var i,
            ii,
            children = this.children;
        this.isBound = false;

        for (i = 0, ii = children.length; i < ii; ++i) {
          children[i].unbind();
        }
      }
    }, {
      key: 'add',
      value: function add(view) {
        view[this.viewAddMethod](this.anchor);
        this.children.push(view);

        if (this.isAttached) {
          view.attached();

          var element = view.firstChild ? view.firstChild.nextElementSibling : null;
          if (view.firstChild && view.firstChild.nodeType === 8 && element && element.nodeType === 1 && element.classList.contains('au-animate')) {
            this.animator.enter(element);
          }
        }
      }
    }, {
      key: 'insert',
      value: function insert(index, view) {
        if (index === 0 && !this.children.length || index >= this.children.length) {
          this.add(view);
        } else {
          view.insertNodesBefore(this.children[index].firstChild);
          this.children.splice(index, 0, view);

          if (this.isAttached) {
            view.attached();
          }
        }
      }
    }, {
      key: 'remove',
      value: function remove(view) {
        view.removeNodes();

        this.children.splice(this.children.indexOf(view), 1);

        if (this.isAttached) {
          view.detached();
        }
      }
    }, {
      key: 'removeAt',
      value: function removeAt(index) {
        var _this = this;

        var view = this.children[index];

        var removeAction = function removeAction() {
          view.removeNodes();
          _this.children.splice(index, 1);

          if (_this.isAttached) {
            view.detached();
          }

          return view;
        };

        var element = view.firstChild && view.firstChild.nextElementSibling ? view.firstChild.nextElementSibling : null;
        if (view.firstChild && view.firstChild.nodeType === 8 && element && element.nodeType === 1 && element.classList.contains('au-animate')) {
          return this.animator.leave(element).then(function () {
            return removeAction();
          });
        } else {
          return removeAction();
        }
      }
    }, {
      key: 'removeAll',
      value: function removeAll() {
        var _this2 = this;

        var children = this.children,
            ii = children.length,
            i;

        var rmPromises = [];

        children.forEach(function (child) {
          var element = child.firstChild ? child.firstChild.nextElementSibling : null;
          if (child.firstChild && child.firstChild.nodeType === 8 && element && element.nodeType === 1 && element.classList.contains('au-animate')) {
            rmPromises.push(_this2.animator.leave(element).then(function () {
              child.removeNodes();
            }));
          } else {
            child.removeNodes();
          }
        });

        var removeAction = function removeAction() {
          if (_this2.isAttached) {
            for (i = 0; i < ii; ++i) {
              children[i].detached();
            }
          }

          _this2.children = [];
        };

        if (rmPromises.length > 0) {
          return Promise.all(rmPromises).then(function () {
            removeAction();
          });
        } else {
          removeAction();
        }
      }
    }, {
      key: 'swap',
      value: function swap(view) {
        var _this3 = this;

        var removeResponse = this.removeAll();
        if (removeResponse !== undefined) {
          removeResponse.then(function () {
            _this3.add(view);
          });
        } else {
          this.add(view);
        }
      }
    }, {
      key: 'attached',
      value: function attached() {
        var i, ii, children, child;

        if (this.isAttached) {
          return;
        }

        this.isAttached = true;

        children = this.children;
        for (i = 0, ii = children.length; i < ii; ++i) {
          child = children[i];
          child.attached();

          var element = child.firstChild ? child.firstChild.nextElementSibling : null;
          if (child.firstChild && child.firstChild.nodeType === 8 && element && element.nodeType === 1 && element.classList.contains('au-animate')) {
            this.animator.enter(element);
          }
        }
      }
    }, {
      key: 'detached',
      value: function detached() {
        var i, ii, children;

        if (this.isAttached) {
          this.isAttached = false;
          children = this.children;
          for (i = 0, ii = children.length; i < ii; ++i) {
            children[i].detached();
          }
        }
      }
    }, {
      key: 'installContentSelectors',
      value: function installContentSelectors(contentSelectors) {
        this.contentSelectors = contentSelectors;
        this.add = this.contentSelectorAdd;
        this.insert = this.contentSelectorInsert;
        this.remove = this.contentSelectorRemove;
        this.removeAt = this.contentSelectorRemoveAt;
        this.removeAll = this.contentSelectorRemoveAll;
      }
    }, {
      key: 'contentSelectorAdd',
      value: function contentSelectorAdd(view) {
        _contentSelector.ContentSelector.applySelectors(view, this.contentSelectors, function (contentSelector, group) {
          return contentSelector.add(group);
        });

        this.children.push(view);

        if (this.isAttached) {
          view.attached();
        }
      }
    }, {
      key: 'contentSelectorInsert',
      value: function contentSelectorInsert(index, view) {
        if (index === 0 && !this.children.length || index >= this.children.length) {
          this.add(view);
        } else {
          _contentSelector.ContentSelector.applySelectors(view, this.contentSelectors, function (contentSelector, group) {
            return contentSelector.insert(index, group);
          });

          this.children.splice(index, 0, view);

          if (this.isAttached) {
            view.attached();
          }
        }
      }
    }, {
      key: 'contentSelectorRemove',
      value: function contentSelectorRemove(view) {
        var index = this.children.indexOf(view),
            contentSelectors = this.contentSelectors,
            i,
            ii;

        for (i = 0, ii = contentSelectors.length; i < ii; ++i) {
          contentSelectors[i].removeAt(index, view.fragment);
        }

        this.children.splice(index, 1);

        if (this.isAttached) {
          view.detached();
        }
      }
    }, {
      key: 'contentSelectorRemoveAt',
      value: function contentSelectorRemoveAt(index) {
        var view = this.children[index],
            contentSelectors = this.contentSelectors,
            i,
            ii;

        for (i = 0, ii = contentSelectors.length; i < ii; ++i) {
          contentSelectors[i].removeAt(index, view.fragment);
        }

        this.children.splice(index, 1);

        if (this.isAttached) {
          view.detached();
        }

        return view;
      }
    }, {
      key: 'contentSelectorRemoveAll',
      value: function contentSelectorRemoveAll() {
        var children = this.children,
            contentSelectors = this.contentSelectors,
            ii = children.length,
            jj = contentSelectors.length,
            i,
            j,
            view;

        for (i = 0; i < ii; ++i) {
          view = children[i];

          for (j = 0; j < jj; ++j) {
            contentSelectors[j].removeAt(i, view.fragment);
          }
        }

        if (this.isAttached) {
          for (i = 0; i < ii; ++i) {
            children[i].detached();
          }
        }

        this.children = [];
      }
    }]);

    return ViewSlot;
  })();

  exports.ViewSlot = ViewSlot;
});
define('aurelia-templating/view-factory',['exports', 'aurelia-dependency-injection', './view', './view-slot', './content-selector', './resource-registry'], function (exports, _aureliaDependencyInjection, _view, _viewSlot, _contentSelector, _resourceRegistry) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function elementContainerGet(key) {
    if (key === Element) {
      return this.element;
    }

    if (key === BoundViewFactory) {
      return this.boundViewFactory || (this.boundViewFactory = new BoundViewFactory(this, this.instruction.viewFactory, this.executionContext));
    }

    if (key === _viewSlot.ViewSlot) {
      if (this.viewSlot === undefined) {
        this.viewSlot = new _viewSlot.ViewSlot(this.element, this.instruction.anchorIsContainer, this.executionContext);
        this.children.push(this.viewSlot);
      }

      return this.viewSlot;
    }

    if (key === _resourceRegistry.ViewResources) {
      return this.viewResources;
    }

    return this.superGet(key);
  }

  function createElementContainer(parent, element, instruction, executionContext, children, resources) {
    var container = parent.createChild(),
        providers,
        i;

    container.element = element;
    container.instruction = instruction;
    container.executionContext = executionContext;
    container.children = children;
    container.viewResources = resources;

    providers = instruction.providers;
    i = providers.length;

    while (i--) {
      container.registerSingleton(providers[i]);
    }

    container.superGet = container.get;
    container.get = elementContainerGet;

    return container;
  }

  function applyInstructions(containers, executionContext, element, instruction, behaviors, bindings, children, contentSelectors, resources) {
    var behaviorInstructions = instruction.behaviorInstructions,
        expressions = instruction.expressions,
        elementContainer,
        i,
        ii,
        current,
        instance;

    if (instruction.contentExpression) {
      bindings.push(instruction.contentExpression.createBinding(element.nextSibling));
      element.parentNode.removeChild(element);
      return;
    }

    if (instruction.contentSelector) {
      contentSelectors.push(new _contentSelector.ContentSelector(element, instruction.selector));
      return;
    }

    if (behaviorInstructions.length) {
      containers[instruction.injectorId] = elementContainer = createElementContainer(containers[instruction.parentInjectorId], element, instruction, executionContext, children, resources);

      for (i = 0, ii = behaviorInstructions.length; i < ii; ++i) {
        current = behaviorInstructions[i];
        instance = current.type.create(elementContainer, current, element, bindings);

        if (instance.contentView) {
          children.push(instance.contentView);
        }

        behaviors.push(instance);
      }
    }

    for (i = 0, ii = expressions.length; i < ii; ++i) {
      bindings.push(expressions[i].createBinding(element));
    }
  }

  var BoundViewFactory = (function () {
    function BoundViewFactory(parentContainer, viewFactory, executionContext) {
      _classCallCheck(this, BoundViewFactory);

      this.parentContainer = parentContainer;
      this.viewFactory = viewFactory;
      this.executionContext = executionContext;
      this.factoryOptions = { behaviorInstance: false };
    }

    _createClass(BoundViewFactory, [{
      key: 'create',
      value: function create(executionContext) {
        var childContainer = this.parentContainer.createChild(),
            context = executionContext || this.executionContext;

        this.factoryOptions.systemControlled = !executionContext;

        return this.viewFactory.create(childContainer, context, this.factoryOptions);
      }
    }]);

    return BoundViewFactory;
  })();

  exports.BoundViewFactory = BoundViewFactory;

  var defaultFactoryOptions = {
    systemControlled: false,
    suppressBind: false
  };

  var ViewFactory = (function () {
    function ViewFactory(template, instructions, resources) {
      _classCallCheck(this, ViewFactory);

      this.template = template;
      this.instructions = instructions;
      this.resources = resources;
    }

    _createClass(ViewFactory, [{
      key: 'create',
      value: function create(container, executionContext) {
        var options = arguments[2] === undefined ? defaultFactoryOptions : arguments[2];

        var fragment = this.template.cloneNode(true),
            instructables = fragment.querySelectorAll('.au-target'),
            instructions = this.instructions,
            resources = this.resources,
            behaviors = [],
            bindings = [],
            children = [],
            contentSelectors = [],
            containers = { root: container },
            i,
            ii,
            view;

        for (i = 0, ii = instructables.length; i < ii; ++i) {
          applyInstructions(containers, executionContext, instructables[i], instructions[i], behaviors, bindings, children, contentSelectors, resources);
        }

        view = new _view.View(fragment, behaviors, bindings, children, options.systemControlled, contentSelectors);
        view.created(executionContext);

        if (!options.suppressBind) {
          view.bind(executionContext);
        }

        return view;
      }
    }]);

    return ViewFactory;
  })();

  exports.ViewFactory = ViewFactory;
});
define('aurelia-templating/binding-language',['exports'], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var BindingLanguage = (function () {
    function BindingLanguage() {
      _classCallCheck(this, BindingLanguage);
    }

    _createClass(BindingLanguage, [{
      key: 'inspectAttribute',
      value: function inspectAttribute(resources, attrName, attrValue) {
        throw new Error('A BindingLanguage must implement inspectAttribute(...)');
      }
    }, {
      key: 'createAttributeInstruction',
      value: function createAttributeInstruction(resources, element, info, existingInstruction) {
        throw new Error('A BindingLanguage must implement createAttributeInstruction(...)');
      }
    }, {
      key: 'parseText',
      value: function parseText(resources, value) {
        throw new Error('A BindingLanguage must implement parseText(...)');
      }
    }]);

    return BindingLanguage;
  })();

  exports.BindingLanguage = BindingLanguage;
});
define('aurelia-templating/view-compiler',['exports', './resource-registry', './view-factory', './binding-language'], function (exports, _resourceRegistry, _viewFactory, _bindingLanguage) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var nextInjectorId = 0,
      defaultCompileOptions = { targetShadowDOM: false },
      hasShadowDOM = !!HTMLElement.prototype.createShadowRoot;

  function getNextInjectorId() {
    return ++nextInjectorId;
  }

  function configureProperties(instruction, resources) {
    var type = instruction.type,
        attrName = instruction.attrName,
        attributes = instruction.attributes,
        property,
        key,
        value;

    var knownAttribute = resources.mapAttribute(attrName);
    if (knownAttribute && attrName in attributes && knownAttribute !== attrName) {
      attributes[knownAttribute] = attributes[attrName];
      delete attributes[attrName];
    }

    for (key in attributes) {
      value = attributes[key];

      if (typeof value !== 'string') {
        property = type.attributes[key];

        if (property !== undefined) {
          value.targetProperty = property.name;
        } else {
          value.targetProperty = key;
        }
      }
    }
  }

  function makeIntoInstructionTarget(element) {
    var value = element.getAttribute('class');
    element.setAttribute('class', value ? value += ' au-target' : 'au-target');
  }

  var ViewCompiler = (function () {
    function ViewCompiler(bindingLanguage) {
      _classCallCheck(this, ViewCompiler);

      this.bindingLanguage = bindingLanguage;
    }

    _createClass(ViewCompiler, [{
      key: 'compile',
      value: function compile(templateOrFragment, resources) {
        var options = arguments[2] === undefined ? defaultCompileOptions : arguments[2];

        var instructions = [],
            targetShadowDOM = options.targetShadowDOM,
            content;

        targetShadowDOM = targetShadowDOM && hasShadowDOM;

        if (options.beforeCompile) {
          options.beforeCompile(templateOrFragment);
        }

        if (templateOrFragment.content) {
          content = document.adoptNode(templateOrFragment.content, true);
        } else {
          content = templateOrFragment;
        }

        this.compileNode(content, resources, instructions, templateOrFragment, 'root', !targetShadowDOM);

        content.insertBefore(document.createComment('<view>'), content.firstChild);
        content.appendChild(document.createComment('</view>'));

        return new _viewFactory.ViewFactory(content, instructions, resources);
      }
    }, {
      key: 'compileNode',
      value: function compileNode(node, resources, instructions, parentNode, parentInjectorId, targetLightDOM) {
        switch (node.nodeType) {
          case 1:
            return this.compileElement(node, resources, instructions, parentNode, parentInjectorId, targetLightDOM);
          case 3:
            var expression = this.bindingLanguage.parseText(resources, node.textContent);
            if (expression) {
              var marker = document.createElement('au-marker');
              marker.className = 'au-target';
              (node.parentNode || parentNode).insertBefore(marker, node);
              node.textContent = ' ';
              instructions.push({ contentExpression: expression });
            }
            return node.nextSibling;
          case 11:
            var currentChild = node.firstChild;
            while (currentChild) {
              currentChild = this.compileNode(currentChild, resources, instructions, node, parentInjectorId, targetLightDOM);
            }
            break;
        }

        return node.nextSibling;
      }
    }, {
      key: 'compileElement',
      value: function compileElement(node, resources, instructions, parentNode, parentInjectorId, targetLightDOM) {
        var tagName = node.tagName.toLowerCase(),
            attributes = node.attributes,
            expressions = [],
            behaviorInstructions = [],
            providers = [],
            bindingLanguage = this.bindingLanguage,
            liftingInstruction,
            viewFactory,
            type,
            elementInstruction,
            elementProperty,
            i,
            ii,
            attr,
            attrName,
            attrValue,
            instruction,
            info,
            property,
            knownAttribute;

        if (tagName === 'content') {
          if (targetLightDOM) {
            instructions.push({
              parentInjectorId: parentInjectorId,
              contentSelector: true,
              selector: node.getAttribute('select'),
              suppressBind: true
            });
            makeIntoInstructionTarget(node);
          }
          return node.nextSibling;
        } else if (tagName === 'template') {
          viewFactory = this.compile(node, resources);
        } else {
          type = resources.getElement(tagName);
          if (type) {
            elementInstruction = { type: type, attributes: {} };
            behaviorInstructions.push(elementInstruction);
          }
        }

        for (i = 0, ii = attributes.length; i < ii; ++i) {
          attr = attributes[i];
          attrName = attr.name;
          attrValue = attr.value;
          info = bindingLanguage.inspectAttribute(resources, attrName, attrValue);
          type = resources.getAttribute(info.attrName);
          elementProperty = null;

          if (type) {
            knownAttribute = resources.mapAttribute(info.attrName);
            if (knownAttribute) {
              property = type.attributes[knownAttribute];

              if (property) {
                info.defaultBindingMode = property.defaultBindingMode;

                if (!info.command && !info.expression) {
                  info.command = property.hasOptions ? 'options' : null;
                }
              }
            }
          } else if (elementInstruction) {
            elementProperty = elementInstruction.type.attributes[info.attrName];
            if (elementProperty) {
              info.defaultBindingMode = elementProperty.defaultBindingMode;

              if (!info.command && !info.expression) {
                info.command = elementProperty.hasOptions ? 'options' : null;
              }
            }
          }

          if (elementProperty) {
            instruction = bindingLanguage.createAttributeInstruction(resources, node, info, elementInstruction);
          } else {
            instruction = bindingLanguage.createAttributeInstruction(resources, node, info);
          }

          if (instruction) {
            if (instruction.alteredAttr) {
              type = resources.getAttribute(instruction.attrName);
            }

            if (instruction.discrete) {
              expressions.push(instruction);
            } else {
              if (type) {
                instruction.type = type;
                configureProperties(instruction, resources);

                if (type.liftsContent) {
                  instruction.originalAttrName = attrName;
                  liftingInstruction = instruction;
                  break;
                } else {
                  behaviorInstructions.push(instruction);
                }
              } else if (elementProperty) {
                elementInstruction.attributes[info.attrName].targetProperty = elementProperty.name;
              } else {
                expressions.push(instruction.attributes[instruction.attrName]);
              }
            }
          } else {
            if (type) {
              instruction = { attrName: attrName, type: type, attributes: {} };
              instruction.attributes[resources.mapAttribute(attrName)] = attrValue;

              if (type.liftsContent) {
                instruction.originalAttrName = attrName;
                liftingInstruction = instruction;
                break;
              } else {
                behaviorInstructions.push(instruction);
              }
            } else if (elementProperty) {
              elementInstruction.attributes[attrName] = attrValue;
            }
          }
        }

        if (liftingInstruction) {
          liftingInstruction.viewFactory = viewFactory;
          node = liftingInstruction.type.compile(this, resources, node, liftingInstruction, parentNode);
          makeIntoInstructionTarget(node);
          instructions.push({
            anchorIsContainer: false,
            parentInjectorId: parentInjectorId,
            expressions: [],
            behaviorInstructions: [liftingInstruction],
            viewFactory: liftingInstruction.viewFactory,
            providers: [liftingInstruction.type.target]
          });
        } else {
          for (i = 0, ii = behaviorInstructions.length; i < ii; ++i) {
            instruction = behaviorInstructions[i];
            instruction.type.compile(this, resources, node, instruction, parentNode);
            providers.push(instruction.type.target);
          }

          var injectorId = behaviorInstructions.length ? getNextInjectorId() : false;

          if (expressions.length || behaviorInstructions.length) {
            makeIntoInstructionTarget(node);
            instructions.push({
              anchorIsContainer: true,
              injectorId: injectorId,
              parentInjectorId: parentInjectorId,
              expressions: expressions,
              behaviorInstructions: behaviorInstructions,
              providers: providers
            });
          }

          if (elementInstruction && elementInstruction.type.skipContentProcessing) {
            return node.nextSibling;
          }

          var currentChild = node.firstChild;
          while (currentChild) {
            currentChild = this.compileNode(currentChild, resources, instructions, node, injectorId || parentInjectorId, targetLightDOM);
          }
        }

        return node.nextSibling;
      }
    }], [{
      key: 'inject',
      value: function inject() {
        return [_bindingLanguage.BindingLanguage];
      }
    }]);

    return ViewCompiler;
  })();

  exports.ViewCompiler = ViewCompiler;
});
define('aurelia-templating/util',["exports"], function (exports) {
  

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.hyphenate = hyphenate;
  var capitalMatcher = /([A-Z])/g;

  function addHyphenAndLower(char) {
    return "-" + char.toLowerCase();
  }

  function hyphenate(name) {
    return (name.charAt(0).toLowerCase() + name.slice(1)).replace(capitalMatcher, addHyphenAndLower);
  }
});
define('aurelia-templating/module-analyzer',['exports', 'aurelia-metadata', 'aurelia-loader', 'aurelia-binding', './html-behavior', './view-strategy', './util'], function (exports, _aureliaMetadata, _aureliaLoader, _aureliaBinding, _htmlBehavior, _viewStrategy, _util) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var ResourceModule = (function () {
    function ResourceModule(moduleId) {
      _classCallCheck(this, ResourceModule);

      this.id = moduleId;
      this.moduleInstance = null;
      this.mainResource = null;
      this.resources = null;
      this.viewStrategy = null;
      this.isAnalyzed = false;
    }

    _createClass(ResourceModule, [{
      key: 'analyze',
      value: function analyze(container) {
        var current = this.mainResource,
            resources = this.resources,
            viewStrategy = this.viewStrategy,
            i,
            ii,
            metadata;

        if (this.isAnalyzed) {
          return;
        }

        this.isAnalyzed = true;

        if (current) {
          metadata = current.metadata;
          metadata.viewStrategy = viewStrategy;

          if ('analyze' in metadata && !metadata.isAnalyzed) {
            metadata.isAnalyzed = true;
            metadata.analyze(container, current.value);
          }
        }

        for (i = 0, ii = resources.length; i < ii; ++i) {
          current = resources[i];
          metadata = current.metadata;
          metadata.viewStrategy = viewStrategy;

          if ('analyze' in metadata && !metadata.isAnalyzed) {
            metadata.isAnalyzed = true;
            metadata.analyze(container, current.value);
          }
        }
      }
    }, {
      key: 'register',
      value: function register(registry, name) {
        var i,
            ii,
            resources = this.resources;

        if (this.mainResource) {
          this.mainResource.metadata.register(registry, name);
          name = null;
        }

        for (i = 0, ii = resources.length; i < ii; ++i) {
          resources[i].metadata.register(registry, name);
          name = null;
        }
      }
    }, {
      key: 'load',
      value: function load(container) {
        var current = this.mainResource,
            resources = this.resources,
            i,
            ii,
            metadata,
            loads;

        if (this.isLoaded) {
          return Promise.resolve();
        }

        this.isLoaded = true;
        loads = [];

        if (current) {
          metadata = current.metadata;

          if ('load' in metadata && !metadata.isLoaded) {
            metadata.isLoaded = true;
            loads.push(metadata.load(container, current.value));
          }
        }

        for (i = 0, ii = resources.length; i < ii; ++i) {
          current = resources[i];
          metadata = current.metadata;

          if ('load' in metadata && !metadata.isLoaded) {
            metadata.isLoaded = true;
            loads.push(metadata.load(container, current.value));
          }
        }

        return Promise.all(loads);
      }
    }]);

    return ResourceModule;
  })();

  var ResourceDescription = function ResourceDescription(key, exportedValue, allMetadata, resourceTypeMeta) {
    _classCallCheck(this, ResourceDescription);

    if (!resourceTypeMeta) {
      if (!allMetadata) {
        allMetadata = _aureliaMetadata.Metadata.on(exportedValue);
      }

      resourceTypeMeta = allMetadata.first(_aureliaMetadata.ResourceType);

      if (!resourceTypeMeta) {
        resourceTypeMeta = new _htmlBehavior.HtmlBehaviorResource();
        resourceTypeMeta.elementName = _util.hyphenate(key);
        allMetadata.add(resourceTypeMeta);
      }
    }

    if (resourceTypeMeta instanceof _htmlBehavior.HtmlBehaviorResource) {
      if (resourceTypeMeta.elementName === undefined) {
        resourceTypeMeta.elementName = _util.hyphenate(key);
      } else if (resourceTypeMeta.attributeName === undefined) {
        resourceTypeMeta.attributeName = _util.hyphenate(key);
      } else if (resourceTypeMeta.attributeName === null && resourceTypeMeta.elementName === null) {
        _htmlBehavior.HtmlBehaviorResource.convention(key, resourceTypeMeta);
      }
    } else if (!resourceTypeMeta.name) {
      resourceTypeMeta.name = _util.hyphenate(key);
    }

    this.metadata = resourceTypeMeta;
    this.value = exportedValue;
  };

  var ModuleAnalyzer = (function () {
    function ModuleAnalyzer() {
      _classCallCheck(this, ModuleAnalyzer);

      this.cache = {};
    }

    _createClass(ModuleAnalyzer, [{
      key: 'getAnalysis',
      value: function getAnalysis(moduleId) {
        return this.cache[moduleId];
      }
    }, {
      key: 'analyze',
      value: function analyze(moduleId, moduleInstance, viewModelMember) {
        var mainResource,
            fallbackValue,
            fallbackKey,
            fallbackMetadata,
            resourceTypeMeta,
            key,
            allMetadata,
            exportedValue,
            resources = [],
            conventional,
            viewStrategy,
            resourceModule;

        resourceModule = this.cache[moduleId];
        if (resourceModule) {
          return resourceModule;
        }

        resourceModule = new ResourceModule(moduleId);
        this.cache[moduleId] = resourceModule;

        if (typeof moduleInstance === 'function') {
          moduleInstance = { 'default': moduleInstance };
        }

        if (viewModelMember) {
          mainResource = new ResourceDescription(viewModelMember, moduleInstance[viewModelMember]);
        }

        for (key in moduleInstance) {
          exportedValue = moduleInstance[key];

          if (key === viewModelMember || typeof exportedValue !== 'function') {
            continue;
          }

          allMetadata = _aureliaMetadata.Metadata.on(exportedValue);
          resourceTypeMeta = allMetadata.first(_aureliaMetadata.ResourceType);

          if (resourceTypeMeta) {
            if (resourceTypeMeta.attributeName === null && resourceTypeMeta.elementName === null) {
              _htmlBehavior.HtmlBehaviorResource.convention(key, resourceTypeMeta);
            }

            if (resourceTypeMeta.attributeName === null && resourceTypeMeta.elementName === null) {
              resourceTypeMeta.elementName = _util.hyphenate(key);
            }

            if (!mainResource && resourceTypeMeta instanceof _htmlBehavior.HtmlBehaviorResource && resourceTypeMeta.elementName !== null) {
              mainResource = new ResourceDescription(key, exportedValue, allMetadata, resourceTypeMeta);
            } else {
              resources.push(new ResourceDescription(key, exportedValue, allMetadata, resourceTypeMeta));
            }
          } else if (exportedValue instanceof _viewStrategy.ViewStrategy) {
            viewStrategy = exportedValue;
          } else if (exportedValue instanceof _aureliaLoader.TemplateRegistryEntry) {
            viewStrategy = new _viewStrategy.TemplateRegistryViewStrategy(moduleId, exportedValue);
          } else {
            if (conventional = _htmlBehavior.HtmlBehaviorResource.convention(key)) {
              if (conventional.elementName !== null && !mainResource) {
                mainResource = new ResourceDescription(key, exportedValue, allMetadata, conventional);
              } else {
                resources.push(new ResourceDescription(key, exportedValue, allMetadata, conventional));
              }

              allMetadata.add(conventional);
            } else if (conventional = _aureliaBinding.ValueConverterResource.convention(key)) {
              resources.push(new ResourceDescription(key, exportedValue, allMetadata, conventional));
              allMetadata.add(conventional);
            } else if (!fallbackValue) {
              fallbackValue = exportedValue;
              fallbackKey = key;
              fallbackMetadata = allMetadata;
            }
          }
        }

        if (!mainResource && fallbackValue) {
          mainResource = new ResourceDescription(fallbackKey, fallbackValue, fallbackMetadata);
        }

        resourceModule.moduleInstance = moduleInstance;
        resourceModule.mainResource = mainResource;
        resourceModule.resources = resources;
        resourceModule.viewStrategy = viewStrategy;

        return resourceModule;
      }
    }]);

    return ModuleAnalyzer;
  })();

  exports.ModuleAnalyzer = ModuleAnalyzer;
});
define('aurelia-templating/view-engine',['exports', 'core-js', 'aurelia-logging', 'aurelia-metadata', 'aurelia-loader', 'aurelia-dependency-injection', './view-compiler', './resource-registry', './module-analyzer'], function (exports, _coreJs, _aureliaLogging, _aureliaMetadata, _aureliaLoader, _aureliaDependencyInjection, _viewCompiler, _resourceRegistry, _moduleAnalyzer) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var logger = _aureliaLogging.getLogger('templating');

  function ensureRegistryEntry(loader, urlOrRegistryEntry) {
    if (urlOrRegistryEntry instanceof _aureliaLoader.TemplateRegistryEntry) {
      return Promise.resolve(urlOrRegistryEntry);
    }

    return loader.loadTemplate(urlOrRegistryEntry);
  }

  var ViewEngine = (function () {
    function ViewEngine(loader, container, viewCompiler, moduleAnalyzer, appResources) {
      _classCallCheck(this, ViewEngine);

      this.loader = loader;
      this.container = container;
      this.viewCompiler = viewCompiler;
      this.moduleAnalyzer = moduleAnalyzer;
      this.appResources = appResources;
    }

    _createClass(ViewEngine, [{
      key: 'loadViewFactory',
      value: function loadViewFactory(urlOrRegistryEntry, compileOptions, associatedModuleId) {
        var _this = this;

        return ensureRegistryEntry(this.loader, urlOrRegistryEntry).then(function (viewRegistryEntry) {
          if (viewRegistryEntry.isReady) {
            return viewRegistryEntry.factory;
          }

          return _this.loadTemplateResources(viewRegistryEntry, associatedModuleId).then(function (resources) {
            if (viewRegistryEntry.isReady) {
              return viewRegistryEntry.factory;
            }

            viewRegistryEntry.setResources(resources);

            var viewFactory = _this.viewCompiler.compile(viewRegistryEntry.template, resources, compileOptions);
            viewRegistryEntry.setFactory(viewFactory);
            return viewFactory;
          });
        });
      }
    }, {
      key: 'loadTemplateResources',
      value: function loadTemplateResources(viewRegistryEntry, associatedModuleId) {
        var resources = new _resourceRegistry.ViewResources(this.appResources, viewRegistryEntry.id),
            dependencies = viewRegistryEntry.dependencies,
            importIds,
            names;

        if (dependencies.length === 0 && !associatedModuleId) {
          return Promise.resolve(resources);
        }

        importIds = dependencies.map(function (x) {
          return x.src;
        });
        names = dependencies.map(function (x) {
          return x.name;
        });
        logger.debug('importing resources for ' + viewRegistryEntry.id, importIds);

        return this.importViewResources(importIds, names, resources, associatedModuleId);
      }
    }, {
      key: 'importViewModelResource',
      value: function importViewModelResource(moduleImport, moduleMember) {
        var _this2 = this;

        return this.loader.loadModule(moduleImport).then(function (viewModelModule) {
          var normalizedId = _aureliaMetadata.Origin.get(viewModelModule).moduleId,
              resourceModule = _this2.moduleAnalyzer.analyze(normalizedId, viewModelModule, moduleMember);

          if (!resourceModule.mainResource) {
            throw new Error('No view model found in module "' + moduleImport + '".');
          }

          resourceModule.analyze(_this2.container);

          return resourceModule.mainResource;
        });
      }
    }, {
      key: 'importViewResources',
      value: function importViewResources(moduleIds, names, resources, associatedModuleId) {
        var _this3 = this;

        return this.loader.loadAllModules(moduleIds).then(function (imports) {
          var i,
              ii,
              analysis,
              normalizedId,
              current,
              associatedModule,
              container = _this3.container,
              moduleAnalyzer = _this3.moduleAnalyzer,
              allAnalysis = new Array(imports.length);

          for (i = 0, ii = imports.length; i < ii; ++i) {
            current = imports[i];
            normalizedId = _aureliaMetadata.Origin.get(current).moduleId;

            analysis = moduleAnalyzer.analyze(normalizedId, current);
            analysis.analyze(container);
            analysis.register(resources, names[i]);

            allAnalysis[i] = analysis;
          }

          if (associatedModuleId) {
            associatedModule = moduleAnalyzer.getAnalysis(associatedModuleId);

            if (associatedModule) {
              associatedModule.register(resources);
            }
          }

          for (i = 0, ii = allAnalysis.length; i < ii; ++i) {
            allAnalysis[i] = allAnalysis[i].load(container);
          }

          return Promise.all(allAnalysis).then(function () {
            return resources;
          });
        });
      }
    }], [{
      key: 'inject',
      value: function inject() {
        return [_aureliaLoader.Loader, _aureliaDependencyInjection.Container, _viewCompiler.ViewCompiler, _moduleAnalyzer.ModuleAnalyzer, _resourceRegistry.ResourceRegistry];
      }
    }]);

    return ViewEngine;
  })();

  exports.ViewEngine = ViewEngine;
});
define('aurelia-templating/bindable-property',['exports', 'core-js', './util', 'aurelia-binding'], function (exports, _coreJs, _util, _aureliaBinding) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  function getObserver(behavior, instance, name) {
    var lookup = instance.__observers__;

    if (lookup === undefined) {
      lookup = behavior.observerLocator.getObserversLookup(instance);
      behavior.ensurePropertiesDefined(instance, lookup);
    }

    return lookup[name];
  }

  var BindableProperty = (function () {
    function BindableProperty(nameOrConfig) {
      _classCallCheck(this, BindableProperty);

      if (typeof nameOrConfig === 'string') {
        this.name = nameOrConfig;
      } else {
        Object.assign(this, nameOrConfig);
      }

      this.attribute = this.attribute || _util.hyphenate(this.name);
      this.defaultBindingMode = this.defaultBindingMode || _aureliaBinding.ONE_WAY;
      this.changeHandler = this.changeHandler || null;
      this.owner = null;
    }

    _createClass(BindableProperty, [{
      key: 'registerWith',
      value: function registerWith(target, behavior) {
        behavior.properties.push(this);
        behavior.attributes[this.attribute] = this;
        this.owner = behavior;
      }
    }, {
      key: 'defineOn',
      value: function defineOn(target, behavior) {
        var name = this.name,
            handlerName;

        if (this.changeHandler === null) {
          handlerName = name + 'Changed';
          if (handlerName in target.prototype) {
            this.changeHandler = handlerName;
          }
        }

        Object.defineProperty(target.prototype, name, {
          configurable: true,
          enumerable: true,
          get: function get() {
            return getObserver(behavior, this, name).getValue();
          },
          set: function set(value) {
            getObserver(behavior, this, name).setValue(value);
          }
        });
      }
    }, {
      key: 'createObserver',
      value: function createObserver(executionContext) {
        var _this = this;

        var selfSubscriber = null;

        if (this.hasOptions) {
          return;
        }

        if (this.changeHandler !== null) {
          selfSubscriber = function (newValue, oldValue) {
            return executionContext[_this.changeHandler](newValue, oldValue);
          };
        }

        return new BehaviorPropertyObserver(this.owner.taskQueue, executionContext, this.name, selfSubscriber);
      }
    }, {
      key: 'initialize',
      value: function initialize(executionContext, observerLookup, attributes, behaviorHandlesBind, boundProperties) {
        var selfSubscriber, observer, attribute;

        if (this.isDynamic) {
          for (var key in attributes) {
            this.createDynamicProperty(executionContext, observerLookup, behaviorHandlesBind, key, attributes[key], boundProperties);
          }
        } else if (!this.hasOptions) {
          observer = observerLookup[this.name];

          if (attributes !== undefined) {
            selfSubscriber = observer.selfSubscriber;
            attribute = attributes[this.attribute];

            if (behaviorHandlesBind) {
              observer.selfSubscriber = null;
            }

            if (typeof attribute === 'string') {
              executionContext[this.name] = attribute;
              observer.call();
            } else if (attribute) {
              boundProperties.push({ observer: observer, binding: attribute.createBinding(executionContext) });
            } else if (this.defaultValue !== undefined) {
              executionContext[this.name] = this.defaultValue;
              observer.call();
            }

            observer.selfSubscriber = selfSubscriber;
          }

          observer.publishing = true;
        }
      }
    }, {
      key: 'createDynamicProperty',
      value: function createDynamicProperty(executionContext, observerLookup, behaviorHandlesBind, name, attribute, boundProperties) {
        var changeHandlerName = name + 'Changed',
            selfSubscriber = null,
            observer,
            info;

        if (changeHandlerName in executionContext) {
          selfSubscriber = function (newValue, oldValue) {
            return executionContext[changeHandlerName](newValue, oldValue);
          };
        } else if ('dynamicPropertyChanged' in executionContext) {
          selfSubscriber = function (newValue, oldValue) {
            return executionContext.dynamicPropertyChanged(name, newValue, oldValue);
          };
        }

        observer = observerLookup[name] = new BehaviorPropertyObserver(this.owner.taskQueue, executionContext, name, selfSubscriber);

        Object.defineProperty(executionContext, name, {
          configurable: true,
          enumerable: true,
          get: observer.getValue.bind(observer),
          set: observer.setValue.bind(observer)
        });

        if (behaviorHandlesBind) {
          observer.selfSubscriber = null;
        }

        if (typeof attribute === 'string') {
          executionContext[name] = attribute;
          observer.call();
        } else if (attribute) {
          info = { observer: observer, binding: attribute.createBinding(executionContext) };
          boundProperties.push(info);
        }

        observer.publishing = true;
        observer.selfSubscriber = selfSubscriber;
      }
    }]);

    return BindableProperty;
  })();

  exports.BindableProperty = BindableProperty;

  var BehaviorPropertyObserver = (function () {
    function BehaviorPropertyObserver(taskQueue, obj, propertyName, selfSubscriber) {
      _classCallCheck(this, BehaviorPropertyObserver);

      this.taskQueue = taskQueue;
      this.obj = obj;
      this.propertyName = propertyName;
      this.callbacks = [];
      this.notqueued = true;
      this.publishing = false;
      this.selfSubscriber = selfSubscriber;
    }

    _createClass(BehaviorPropertyObserver, [{
      key: 'getValue',
      value: function getValue() {
        return this.currentValue;
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        var oldValue = this.currentValue;

        if (oldValue != newValue) {
          if (this.publishing && this.notqueued) {
            this.notqueued = false;
            this.taskQueue.queueMicroTask(this);
          }

          this.oldValue = oldValue;
          this.currentValue = newValue;
        }
      }
    }, {
      key: 'call',
      value: function call() {
        var callbacks = this.callbacks,
            i = callbacks.length,
            oldValue = this.oldValue,
            newValue = this.currentValue;

        this.notqueued = true;

        if (newValue != oldValue) {
          if (this.selfSubscriber !== null) {
            this.selfSubscriber(newValue, oldValue);
          }

          while (i--) {
            callbacks[i](newValue, oldValue);
          }

          this.oldValue = newValue;
        }
      }
    }, {
      key: 'subscribe',
      value: function subscribe(callback) {
        var callbacks = this.callbacks;
        callbacks.push(callback);
        return function () {
          callbacks.splice(callbacks.indexOf(callback), 1);
        };
      }
    }]);

    return BehaviorPropertyObserver;
  })();
});
define('aurelia-templating/behavior-instance',["exports"], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var BehaviorInstance = (function () {
    function BehaviorInstance(behavior, executionContext, instruction) {
      _classCallCheck(this, BehaviorInstance);

      this.behavior = behavior;
      this.executionContext = executionContext;
      this.isAttached = false;

      var observerLookup = behavior.observerLocator.getObserversLookup(executionContext),
          handlesBind = behavior.handlesBind,
          attributes = instruction.attributes,
          boundProperties = this.boundProperties = [],
          properties = behavior.properties,
          i,
          ii;

      behavior.ensurePropertiesDefined(executionContext, observerLookup);

      for (i = 0, ii = properties.length; i < ii; ++i) {
        properties[i].initialize(executionContext, observerLookup, attributes, handlesBind, boundProperties);
      }
    }

    _createClass(BehaviorInstance, [{
      key: "created",
      value: function created(context) {
        if (this.behavior.handlesCreated) {
          this.executionContext.created(context);
        }
      }
    }, {
      key: "bind",
      value: function bind(context) {
        var skipSelfSubscriber = this.behavior.handlesBind,
            boundProperties = this.boundProperties,
            i,
            ii,
            x,
            observer,
            selfSubscriber;

        for (i = 0, ii = boundProperties.length; i < ii; ++i) {
          x = boundProperties[i];
          observer = x.observer;
          selfSubscriber = observer.selfSubscriber;
          observer.publishing = false;

          if (skipSelfSubscriber) {
            observer.selfSubscriber = null;
          }

          x.binding.bind(context);
          observer.call();

          observer.publishing = true;
          observer.selfSubscriber = selfSubscriber;
        }

        if (skipSelfSubscriber) {
          this.executionContext.bind(context);
        }

        if (this.view) {
          this.view.bind(this.executionContext);
        }
      }
    }, {
      key: "unbind",
      value: function unbind() {
        var boundProperties = this.boundProperties,
            i,
            ii;

        if (this.view) {
          this.view.unbind();
        }

        if (this.behavior.handlesUnbind) {
          this.executionContext.unbind();
        }

        for (i = 0, ii = boundProperties.length; i < ii; ++i) {
          boundProperties[i].binding.unbind();
        }
      }
    }, {
      key: "attached",
      value: function attached() {
        if (this.isAttached) {
          return;
        }

        this.isAttached = true;

        if (this.behavior.handlesAttached) {
          this.executionContext.attached();
        }

        if (this.view) {
          this.view.attached();
        }
      }
    }, {
      key: "detached",
      value: function detached() {
        if (this.isAttached) {
          this.isAttached = false;

          if (this.view) {
            this.view.detached();
          }

          if (this.behavior.handlesDetached) {
            this.executionContext.detached();
          }
        }
      }
    }]);

    return BehaviorInstance;
  })();

  exports.BehaviorInstance = BehaviorInstance;
});
define('aurelia-templating/html-behavior',['exports', 'aurelia-metadata', 'aurelia-binding', 'aurelia-task-queue', './view-strategy', './view-engine', './content-selector', './util', './bindable-property', './behavior-instance'], function (exports, _aureliaMetadata, _aureliaBinding, _aureliaTaskQueue, _viewStrategy, _viewEngine, _contentSelector, _util, _bindableProperty, _behaviorInstance) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var defaultInstruction = { suppressBind: false },
      contentSelectorFactoryOptions = { suppressBind: true },
      hasShadowDOM = !!HTMLElement.prototype.createShadowRoot;

  var HtmlBehaviorResource = (function (_ResourceType) {
    function HtmlBehaviorResource() {
      _classCallCheck(this, HtmlBehaviorResource);

      _get(Object.getPrototypeOf(HtmlBehaviorResource.prototype), 'constructor', this).call(this);
      this.elementName = null;
      this.attributeName = null;
      this.liftsContent = false;
      this.targetShadowDOM = false;
      this.skipContentProcessing = false;
      this.usesShadowDOM = false;
      this.childExpression = null;
      this.hasDynamicOptions = false;
      this.properties = [];
      this.attributes = {};
    }

    _inherits(HtmlBehaviorResource, _ResourceType);

    _createClass(HtmlBehaviorResource, [{
      key: 'analyze',
      value: function analyze(container, target) {
        var proto = target.prototype,
            properties = this.properties,
            attributeName = this.attributeName,
            i,
            ii,
            current;

        this.observerLocator = container.get(_aureliaBinding.ObserverLocator);
        this.taskQueue = container.get(_aureliaTaskQueue.TaskQueue);

        this.target = target;
        this.usesShadowDOM = this.targetShadowDOM && hasShadowDOM;
        this.handlesCreated = 'created' in proto;
        this.handlesBind = 'bind' in proto;
        this.handlesUnbind = 'unbind' in proto;
        this.handlesAttached = 'attached' in proto;
        this.handlesDetached = 'detached' in proto;
        this.apiName = (this.elementName || this.attributeName).replace(/-([a-z])/g, function (m, w) {
          return w.toUpperCase();
        });

        if (attributeName !== null) {
          if (properties.length === 0) {
            new _bindableProperty.BindableProperty({
              name: 'value',
              changeHandler: 'valueChanged' in proto ? 'valueChanged' : null,
              attribute: attributeName
            }).registerWith(target, this);
          }

          current = properties[0];

          if (properties.length === 1 && current.name === 'value') {
            current.isDynamic = current.hasOptions = this.hasDynamicOptions;
            current.defineOn(target, this);
          } else {
            for (i = 0, ii = properties.length; i < ii; ++i) {
              properties[i].defineOn(target, this);
            }

            current = new _bindableProperty.BindableProperty({
              name: 'value',
              changeHandler: 'valueChanged' in proto ? 'valueChanged' : null,
              attribute: attributeName
            });

            current.hasOptions = true;
            current.registerWith(target, this);
          }
        } else {
          for (i = 0, ii = properties.length; i < ii; ++i) {
            properties[i].defineOn(target, this);
          }
        }
      }
    }, {
      key: 'load',
      value: function load(container, target, viewStrategy, transientView) {
        var _this = this;

        var options;

        if (this.elementName !== null) {
          viewStrategy = viewStrategy || this.viewStrategy || _viewStrategy.ViewStrategy.getDefault(target);
          options = {
            targetShadowDOM: this.targetShadowDOM,
            beforeCompile: target.beforeCompile
          };

          if (!viewStrategy.moduleId) {
            viewStrategy.moduleId = _aureliaMetadata.Origin.get(target).moduleId;
          }

          return viewStrategy.loadViewFactory(container.get(_viewEngine.ViewEngine), options).then(function (viewFactory) {
            if (!transientView) {
              _this.viewFactory = viewFactory;
            }

            return viewFactory;
          });
        }

        return Promise.resolve(this);
      }
    }, {
      key: 'register',
      value: function register(registry, name) {
        if (this.attributeName !== null) {
          registry.registerAttribute(name || this.attributeName, this, this.attributeName);
        }

        if (this.elementName !== null) {
          registry.registerElement(name || this.elementName, this);
        }
      }
    }, {
      key: 'compile',
      value: function compile(compiler, resources, node, instruction, parentNode) {
        if (this.liftsContent) {
          if (!instruction.viewFactory) {
            var template = document.createElement('template'),
                fragment = document.createDocumentFragment();

            node.removeAttribute(instruction.originalAttrName);

            if (node.parentNode) {
              node.parentNode.replaceChild(template, node);
            } else if (window.ShadowDOMPolyfill) {
              ShadowDOMPolyfill.unwrap(parentNode).replaceChild(ShadowDOMPolyfill.unwrap(template), ShadowDOMPolyfill.unwrap(node));
            } else {
              parentNode.replaceChild(template, node);
            }

            fragment.appendChild(node);

            instruction.viewFactory = compiler.compile(fragment, resources);
            node = template;
          }
        } else if (this.elementName !== null && !this.usesShadowDOM && !this.skipContentProcessing && node.hasChildNodes()) {
          var fragment = document.createDocumentFragment(),
              currentChild = node.firstChild,
              nextSibling;

          while (currentChild) {
            nextSibling = currentChild.nextSibling;
            fragment.appendChild(currentChild);
            currentChild = nextSibling;
          }

          instruction.contentFactory = compiler.compile(fragment, resources);
        }

        instruction.suppressBind = true;
        return node;
      }
    }, {
      key: 'create',
      value: function create(container, _x, _x2, bindings) {
        var instruction = arguments[1] === undefined ? defaultInstruction : arguments[1];
        var element = arguments[2] === undefined ? null : arguments[2];

        var executionContext = instruction.executionContext || container.get(this.target),
            behaviorInstance = new _behaviorInstance.BehaviorInstance(this, executionContext, instruction),
            viewFactory,
            host;

        if (this.liftsContent) {
          element.primaryBehavior = behaviorInstance;
        } else if (this.elementName !== null) {
          viewFactory = instruction.viewFactory || this.viewFactory;

          if (viewFactory) {
            behaviorInstance.view = viewFactory.create(container, behaviorInstance.executionContext, instruction);
          }

          if (element) {
            element.primaryBehavior = behaviorInstance;

            if (behaviorInstance.view) {
              if (this.usesShadowDOM) {
                host = element.createShadowRoot();
              } else {
                host = element;

                if (instruction.contentFactory) {
                  var contentView = instruction.contentFactory.create(container, null, contentSelectorFactoryOptions);

                  _contentSelector.ContentSelector.applySelectors(contentView, behaviorInstance.view.contentSelectors, function (contentSelector, group) {
                    return contentSelector.add(group);
                  });

                  behaviorInstance.contentView = contentView;
                }
              }

              if (this.childExpression) {
                behaviorInstance.view.addBinding(this.childExpression.createBinding(host, behaviorInstance.executionContext));
              }

              behaviorInstance.view.appendNodesTo(host);
            }
          } else if (behaviorInstance.view) {
            behaviorInstance.view.owner = behaviorInstance;
          }
        } else if (this.childExpression) {
          bindings.push(this.childExpression.createBinding(element, behaviorInstance.executionContext));
        }

        if (element && !(this.apiName in element)) {
          element[this.apiName] = behaviorInstance.executionContext;
        }

        return behaviorInstance;
      }
    }, {
      key: 'ensurePropertiesDefined',
      value: function ensurePropertiesDefined(instance, lookup) {
        var properties, i, ii, observer;

        if ('__propertiesDefined__' in lookup) {
          return;
        }

        lookup.__propertiesDefined__ = true;
        properties = this.properties;

        for (i = 0, ii = properties.length; i < ii; ++i) {
          observer = properties[i].createObserver(instance);

          if (observer !== undefined) {
            lookup[observer.propertyName] = observer;
          }
        }
      }
    }], [{
      key: 'convention',
      value: function convention(name, existing) {
        var behavior;

        if (name.endsWith('CustomAttribute')) {
          behavior = existing || new HtmlBehaviorResource();
          behavior.attributeName = _util.hyphenate(name.substring(0, name.length - 15));
        }

        if (name.endsWith('CustomElement')) {
          behavior = existing || new HtmlBehaviorResource();
          behavior.elementName = _util.hyphenate(name.substring(0, name.length - 13));
        }

        return behavior;
      }
    }]);

    return HtmlBehaviorResource;
  })(_aureliaMetadata.ResourceType);

  exports.HtmlBehaviorResource = HtmlBehaviorResource;
});
define('aurelia-templating/children',["exports"], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var noMutations = [];

  var ChildObserver = (function () {
    function ChildObserver(property, changeHandler, selector) {
      _classCallCheck(this, ChildObserver);

      this.selector = selector;
      this.changeHandler = changeHandler;
      this.property = property;
    }

    _createClass(ChildObserver, [{
      key: "createBinding",
      value: function createBinding(target, behavior) {
        return new ChildObserverBinder(this.selector, target, this.property, behavior, this.changeHandler);
      }
    }]);

    return ChildObserver;
  })();

  exports.ChildObserver = ChildObserver;

  var ChildObserverBinder = (function () {
    function ChildObserverBinder(selector, target, property, behavior, changeHandler) {
      _classCallCheck(this, ChildObserverBinder);

      this.selector = selector;
      this.target = target;
      this.property = property;
      this.behavior = behavior;
      this.changeHandler = changeHandler;
      this.observer = new MutationObserver(this.onChange.bind(this));
    }

    _createClass(ChildObserverBinder, [{
      key: "bind",
      value: function bind(source) {
        var items,
            results,
            i,
            ii,
            node,
            behavior = this.behavior;

        this.observer.observe(this.target, { childList: true, subtree: true });

        items = behavior[this.property];
        if (!items) {
          items = behavior[this.property] = [];
        } else {
          items.length = 0;
        }

        results = this.target.querySelectorAll(this.selector);

        for (i = 0, ii = results.length; i < ii; ++i) {
          node = results[i];
          items.push(node.primaryBehavior ? node.primaryBehavior.executionContext : node);
        }

        if (this.changeHandler) {
          this.behavior[this.changeHandler](noMutations);
        }
      }
    }, {
      key: "unbind",
      value: function unbind() {
        this.observer.disconnect();
      }
    }, {
      key: "onChange",
      value: function onChange(mutations) {
        var items = this.behavior[this.property],
            selector = this.selector;

        mutations.forEach(function (record) {
          var added = record.addedNodes,
              removed = record.removedNodes,
              prev = record.previousSibling,
              i,
              ii,
              primary,
              index,
              node;

          for (i = 0, ii = removed.length; i < ii; ++i) {
            node = removed[i];
            if (node.nodeType === 1 && node.matches(selector)) {
              primary = node.primaryBehavior ? node.primaryBehavior.executionContext : node;
              index = items.indexOf(primary);
              if (index != -1) {
                items.splice(index, 1);
              }
            }
          }

          for (i = 0, ii = added.length; i < ii; ++i) {
            node = added[i];
            if (node.nodeType === 1 && node.matches(selector)) {
              primary = node.primaryBehavior ? node.primaryBehavior.executionContext : node;
              index = 0;

              while (prev) {
                if (prev.nodeType === 1 && prev.matches(selector)) {
                  index++;
                }

                prev = prev.previousSibling;
              }

              items.splice(index, 0, primary);
            }
          }
        });

        if (this.changeHandler) {
          this.behavior[this.changeHandler](mutations);
        }
      }
    }]);

    return ChildObserverBinder;
  })();

  exports.ChildObserverBinder = ChildObserverBinder;
});
define('aurelia-templating/element-config',['exports', 'aurelia-metadata', 'aurelia-binding'], function (exports, _aureliaMetadata, _aureliaBinding) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var ElementConfigResource = (function (_ResourceType) {
    function ElementConfigResource() {
      _classCallCheck(this, ElementConfigResource);

      if (_ResourceType != null) {
        _ResourceType.apply(this, arguments);
      }
    }

    _inherits(ElementConfigResource, _ResourceType);

    _createClass(ElementConfigResource, [{
      key: 'load',
      value: function load(container, target) {
        var config = new target(),
            eventManager = container.get(_aureliaBinding.EventManager);

        eventManager.registerElementConfig(config);
        return Promise.resolve(this);
      }
    }, {
      key: 'register',
      value: function register() {}
    }]);

    return ElementConfigResource;
  })(_aureliaMetadata.ResourceType);

  exports.ElementConfigResource = ElementConfigResource;
});
define('aurelia-templating/composition-engine',['exports', 'aurelia-metadata', './view-strategy', './view-engine', './html-behavior'], function (exports, _aureliaMetadata, _viewStrategy, _viewEngine, _htmlBehavior) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var CompositionEngine = (function () {
    function CompositionEngine(viewEngine) {
      _classCallCheck(this, CompositionEngine);

      this.viewEngine = viewEngine;
    }

    _createClass(CompositionEngine, [{
      key: 'activate',
      value: function activate(instruction) {
        if (instruction.skipActivation || typeof instruction.viewModel.activate !== 'function') {
          return Promise.resolve();
        }

        return instruction.viewModel.activate(instruction.model) || Promise.resolve();
      }
    }, {
      key: 'createBehaviorAndSwap',
      value: function createBehaviorAndSwap(instruction) {
        return this.createBehavior(instruction).then(function (behavior) {
          behavior.view.bind(behavior.executionContext);
          instruction.viewSlot.swap(behavior.view);

          if (instruction.currentBehavior) {
            instruction.currentBehavior.unbind();
          }

          return behavior;
        });
      }
    }, {
      key: 'createBehavior',
      value: function createBehavior(instruction) {
        var childContainer = instruction.childContainer,
            viewModelResource = instruction.viewModelResource,
            viewModel = instruction.viewModel,
            metadata;

        return this.activate(instruction).then(function () {
          var doneLoading, viewStrategyFromViewModel, origin;

          if ('getViewStrategy' in viewModel && !instruction.view) {
            viewStrategyFromViewModel = true;
            instruction.view = _viewStrategy.ViewStrategy.normalize(viewModel.getViewStrategy());
          }

          if (instruction.view) {
            if (viewStrategyFromViewModel) {
              origin = _aureliaMetadata.Origin.get(viewModel.constructor);
              if (origin) {
                instruction.view.makeRelativeTo(origin.moduleId);
              }
            } else if (instruction.viewResources) {
              instruction.view.makeRelativeTo(instruction.viewResources.viewUrl);
            }
          }

          if (viewModelResource) {
            metadata = viewModelResource.metadata;
            doneLoading = metadata.load(childContainer, viewModelResource.value, instruction.view, true);
          } else {
            metadata = new _htmlBehavior.HtmlBehaviorResource();
            metadata.elementName = 'dynamic-element';
            doneLoading = metadata.load(childContainer, viewModel.constructor, instruction.view, true);
          }

          return doneLoading.then(function (viewFactory) {
            return metadata.create(childContainer, {
              executionContext: viewModel,
              viewFactory: viewFactory,
              suppressBind: true
            });
          });
        });
      }
    }, {
      key: 'createViewModel',
      value: function createViewModel(instruction) {
        var childContainer = instruction.childContainer || instruction.container.createChild();

        instruction.viewModel = instruction.viewResources ? instruction.viewResources.relativeToView(instruction.viewModel) : instruction.viewModel;

        return this.viewEngine.importViewModelResource(instruction.viewModel).then(function (viewModelResource) {
          childContainer.autoRegister(viewModelResource.value);
          instruction.viewModel = childContainer.viewModel = childContainer.get(viewModelResource.value);
          instruction.viewModelResource = viewModelResource;
          return instruction;
        });
      }
    }, {
      key: 'compose',
      value: function compose(instruction) {
        var _this = this;

        instruction.childContainer = instruction.childContainer || instruction.container.createChild();
        instruction.view = _viewStrategy.ViewStrategy.normalize(instruction.view);

        if (instruction.viewModel) {
          if (typeof instruction.viewModel === 'string') {
            return this.createViewModel(instruction).then(function (instruction) {
              return _this.createBehaviorAndSwap(instruction);
            });
          } else {
            return this.createBehaviorAndSwap(instruction);
          }
        } else if (instruction.view) {
          if (instruction.viewResources) {
            instruction.view.makeRelativeTo(instruction.viewResources.viewUrl);
          }

          return instruction.view.loadViewFactory(this.viewEngine).then(function (viewFactory) {
            var result = viewFactory.create(instruction.childContainer, instruction.executionContext);
            instruction.viewSlot.swap(result);
            return result;
          });
        } else if (instruction.viewSlot) {
          instruction.viewSlot.removeAll();
          return Promise.resolve(null);
        }
      }
    }], [{
      key: 'inject',
      value: function inject() {
        return [_viewEngine.ViewEngine];
      }
    }]);

    return CompositionEngine;
  })();

  exports.CompositionEngine = CompositionEngine;
});
define('aurelia-templating/decorators',['exports', 'core-js', 'aurelia-metadata', './bindable-property', './children', './element-config', './view-strategy', './html-behavior'], function (exports, _coreJs, _aureliaMetadata, _bindableProperty, _children, _elementConfig, _viewStrategy, _htmlBehavior) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.behavior = behavior;
  exports.customElement = customElement;
  exports.customAttribute = customAttribute;
  exports.templateController = templateController;
  exports.bindable = bindable;
  exports.dynamicOptions = dynamicOptions;
  exports.syncChildren = syncChildren;
  exports.useShadowDOM = useShadowDOM;
  exports.skipContentProcessing = skipContentProcessing;
  exports.useView = useView;
  exports.noView = noView;
  exports.elementConfig = elementConfig;

  var _core = _interopRequire(_coreJs);

  function behavior(override) {
    return function (target) {
      var meta = _aureliaMetadata.Metadata.on(target);

      if (override instanceof _htmlBehavior.HtmlBehaviorResource) {
        meta.add(override);
      } else {
        var resource = meta.firstOrAdd(_htmlBehavior.HtmlBehaviorResource);
        Object.assign(resource, override);
      }
    };
  }

  _aureliaMetadata.Decorators.configure.parameterizedDecorator('behavior', behavior);

  function customElement(name) {
    return function (target) {
      var resource = _aureliaMetadata.Metadata.on(target).firstOrAdd(_htmlBehavior.HtmlBehaviorResource);
      resource.elementName = name;
    };
  }

  _aureliaMetadata.Decorators.configure.parameterizedDecorator('customElement', customElement);

  function customAttribute(name) {
    return function (target) {
      var resource = _aureliaMetadata.Metadata.on(target).firstOrAdd(_htmlBehavior.HtmlBehaviorResource);
      resource.attributeName = name;
    };
  }

  _aureliaMetadata.Decorators.configure.parameterizedDecorator('customAttribute', customAttribute);

  function templateController(target) {
    var deco = function deco(target) {
      var resource = _aureliaMetadata.Metadata.on(target).firstOrAdd(_htmlBehavior.HtmlBehaviorResource);
      resource.liftsContent = true;
    };

    return target ? deco(target) : deco;
  }

  _aureliaMetadata.Decorators.configure.simpleDecorator('templateController', templateController);

  function bindable(nameOrConfigOrTarget, key, descriptor) {
    var deco = function deco(target, key, descriptor) {
      var resource = _aureliaMetadata.Metadata.on(target).firstOrAdd(_htmlBehavior.HtmlBehaviorResource),
          prop;

      if (key) {
        nameOrConfigOrTarget = nameOrConfigOrTarget || {};
        nameOrConfigOrTarget.name = key;
      }

      prop = new _bindableProperty.BindableProperty(nameOrConfigOrTarget);
      prop.registerWith(target, resource);
    };

    if (!nameOrConfigOrTarget) {
      return deco;
    }

    if (key) {
      var target = nameOrConfigOrTarget.constructor;
      nameOrConfigOrTarget = null;
      return deco(target, key, descriptor);
    }

    return deco;
  }

  _aureliaMetadata.Decorators.configure.parameterizedDecorator('bindable', bindable);

  function dynamicOptions(target) {
    var deco = function deco(target) {
      var resource = _aureliaMetadata.Metadata.on(target).firstOrAdd(_htmlBehavior.HtmlBehaviorResource);
      resource.hasDynamicOptions = true;
    };

    return target ? deco(target) : deco;
  }

  _aureliaMetadata.Decorators.configure.simpleDecorator('dynamicOptions', dynamicOptions);

  function syncChildren(property, changeHandler, selector) {
    return function (target) {
      var resource = _aureliaMetadata.Metadata.on(target).firstOrAdd(_htmlBehavior.HtmlBehaviorResource);
      resource.childExpression = new _children.ChildObserver(property, changeHandler, selector);
    };
  }

  _aureliaMetadata.Decorators.configure.parameterizedDecorator('syncChildren', syncChildren);

  function useShadowDOM(target) {
    var deco = function deco(target) {
      var resource = _aureliaMetadata.Metadata.on(target).firstOrAdd(_htmlBehavior.HtmlBehaviorResource);
      resource.useShadowDOM = true;
    };

    return target ? deco(target) : deco;
  }

  _aureliaMetadata.Decorators.configure.simpleDecorator('useShadowDOM', useShadowDOM);

  function skipContentProcessing(target) {
    var deco = function deco(target) {
      var resource = _aureliaMetadata.Metadata.on(target).firstOrAdd(_htmlBehavior.HtmlBehaviorResource);
      resource.skipContentProcessing = true;
    };

    return target ? deco(target) : deco;
  }

  _aureliaMetadata.Decorators.configure.simpleDecorator('skipContentProcessing', skipContentProcessing);

  function useView(path) {
    return function (target) {
      _aureliaMetadata.Metadata.on(target).add(new _viewStrategy.UseViewStrategy(path));
    };
  }

  _aureliaMetadata.Decorators.configure.parameterizedDecorator('useView', useView);

  function noView(target) {
    var deco = function deco(target) {
      _aureliaMetadata.Metadata.on(target).add(new _viewStrategy.NoViewStrategy());
    };

    return target ? deco(target) : deco;
  }

  _aureliaMetadata.Decorators.configure.simpleDecorator('noView', noView);

  function elementConfig(target) {
    var deco = function deco(target) {
      _aureliaMetadata.Metadata.on(target).add(new _elementConfig.ElementConfigResource());
    };

    return target ? deco(target) : deco;
  }

  _aureliaMetadata.Decorators.configure.simpleDecorator('elementConfig', elementConfig);
});
define('aurelia-templating/index',['exports', './html-behavior', './bindable-property', './resource-registry', './children', './element-config', './view-strategy', './view-compiler', './view-engine', './view-factory', './view-slot', './binding-language', './composition-engine', './animator', './decorators'], function (exports, _htmlBehavior, _bindableProperty, _resourceRegistry, _children, _elementConfig, _viewStrategy, _viewCompiler, _viewEngine, _viewFactory, _viewSlot, _bindingLanguage, _compositionEngine, _animator, _decorators) {
  

  var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

  var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, 'HtmlBehaviorResource', {
    enumerable: true,
    get: function get() {
      return _htmlBehavior.HtmlBehaviorResource;
    }
  });
  Object.defineProperty(exports, 'BindableProperty', {
    enumerable: true,
    get: function get() {
      return _bindableProperty.BindableProperty;
    }
  });
  Object.defineProperty(exports, 'ResourceRegistry', {
    enumerable: true,
    get: function get() {
      return _resourceRegistry.ResourceRegistry;
    }
  });
  Object.defineProperty(exports, 'ViewResources', {
    enumerable: true,
    get: function get() {
      return _resourceRegistry.ViewResources;
    }
  });
  Object.defineProperty(exports, 'ChildObserver', {
    enumerable: true,
    get: function get() {
      return _children.ChildObserver;
    }
  });
  Object.defineProperty(exports, 'ElementConfigResource', {
    enumerable: true,
    get: function get() {
      return _elementConfig.ElementConfigResource;
    }
  });
  Object.defineProperty(exports, 'ViewStrategy', {
    enumerable: true,
    get: function get() {
      return _viewStrategy.ViewStrategy;
    }
  });
  Object.defineProperty(exports, 'UseViewStrategy', {
    enumerable: true,
    get: function get() {
      return _viewStrategy.UseViewStrategy;
    }
  });
  Object.defineProperty(exports, 'ConventionalViewStrategy', {
    enumerable: true,
    get: function get() {
      return _viewStrategy.ConventionalViewStrategy;
    }
  });
  Object.defineProperty(exports, 'NoViewStrategy', {
    enumerable: true,
    get: function get() {
      return _viewStrategy.NoViewStrategy;
    }
  });
  Object.defineProperty(exports, 'ViewCompiler', {
    enumerable: true,
    get: function get() {
      return _viewCompiler.ViewCompiler;
    }
  });
  Object.defineProperty(exports, 'ViewEngine', {
    enumerable: true,
    get: function get() {
      return _viewEngine.ViewEngine;
    }
  });
  Object.defineProperty(exports, 'ViewFactory', {
    enumerable: true,
    get: function get() {
      return _viewFactory.ViewFactory;
    }
  });
  Object.defineProperty(exports, 'BoundViewFactory', {
    enumerable: true,
    get: function get() {
      return _viewFactory.BoundViewFactory;
    }
  });
  Object.defineProperty(exports, 'ViewSlot', {
    enumerable: true,
    get: function get() {
      return _viewSlot.ViewSlot;
    }
  });
  Object.defineProperty(exports, 'BindingLanguage', {
    enumerable: true,
    get: function get() {
      return _bindingLanguage.BindingLanguage;
    }
  });
  Object.defineProperty(exports, 'CompositionEngine', {
    enumerable: true,
    get: function get() {
      return _compositionEngine.CompositionEngine;
    }
  });
  Object.defineProperty(exports, 'Animator', {
    enumerable: true,
    get: function get() {
      return _animator.Animator;
    }
  });

  _defaults(exports, _interopRequireWildcard(_decorators));
});
define('aurelia-templating', ['aurelia-templating/index'], function (main) { return main; });

define('aurelia-framework/aurelia',['exports', 'core-js', 'aurelia-logging', 'aurelia-dependency-injection', 'aurelia-loader', 'aurelia-path', './plugins', 'aurelia-templating'], function (exports, _coreJs, _aureliaLogging, _aureliaDependencyInjection, _aureliaLoader, _aureliaPath, _plugins, _aureliaTemplating) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var logger = _aureliaLogging.getLogger('aurelia'),
      slice = Array.prototype.slice;

  if (!window.CustomEvent || typeof window.CustomEvent !== 'function') {
    var CustomEvent = function CustomEvent(event, params) {
      var params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };

      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    };

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
  }

  function preventActionlessFormSubmit() {
    document.body.addEventListener('submit', function (evt) {
      var target = evt.target;
      var action = target.action;

      if (target.tagName.toLowerCase() === 'form' && !action) {
        evt.preventDefault();
      }
    });
  }

  function loadResources(container, resourcesToLoad, appResources) {
    var viewEngine = container.get(_aureliaTemplating.ViewEngine),
        importIds = Object.keys(resourcesToLoad),
        names = new Array(importIds.length),
        i,
        ii;

    for (i = 0, ii = importIds.length; i < ii; ++i) {
      names[i] = resourcesToLoad[importIds[i]];
    }

    return viewEngine.importViewResources(importIds, names, appResources);
  }

  var Aurelia = (function () {
    function Aurelia(loader, container, resources) {
      _classCallCheck(this, Aurelia);

      this.loader = loader || new window.AureliaLoader();
      this.container = container || new _aureliaDependencyInjection.Container();
      this.resources = resources || new _aureliaTemplating.ResourceRegistry();
      this.use = new _plugins.Plugins(this);
      this.resourcesToLoad = {};

      this.withInstance(Aurelia, this);
      this.withInstance(_aureliaLoader.Loader, this.loader);
      this.withInstance(_aureliaTemplating.ResourceRegistry, this.resources);
    }

    _createClass(Aurelia, [{
      key: 'withInstance',
      value: function withInstance(type, instance) {
        this.container.registerInstance(type, instance);
        return this;
      }
    }, {
      key: 'withSingleton',
      value: function withSingleton(type, implementation) {
        this.container.registerSingleton(type, implementation);
        return this;
      }
    }, {
      key: 'globalizeResources',
      value: function globalizeResources(resources) {
        var toAdd = Array.isArray(resources) ? resources : arguments,
            i,
            ii,
            pluginPath = this.currentPluginId || '',
            path,
            internalPlugin = pluginPath.startsWith('./');

        for (i = 0, ii = toAdd.length; i < ii; ++i) {
          path = internalPlugin ? _aureliaPath.relativeToFile(toAdd[i], pluginPath) : _aureliaPath.join(pluginPath, toAdd[i]);

          this.resourcesToLoad[path] = this.resourcesToLoad[path];
        }

        return this;
      }
    }, {
      key: 'renameGlobalResource',
      value: function renameGlobalResource(resourcePath, newName) {
        this.resourcesToLoad[resourcePath] = newName;
        return this;
      }
    }, {
      key: 'start',
      value: function start() {
        var _this = this;

        if (this.started) {
          return Promise.resolve(this);
        }

        this.started = true;
        logger.info('Aurelia Starting');

        preventActionlessFormSubmit();

        return this.use._process().then(function () {
          if (!_this.container.hasHandler(_aureliaTemplating.BindingLanguage)) {
            var message = 'You must configure Aurelia with a BindingLanguage implementation.';
            logger.error(message);
            throw new Error(message);
          }

          if (!_this.container.hasHandler(_aureliaTemplating.Animator)) {
            _aureliaTemplating.Animator.configureDefault(_this.container);
          }

          return loadResources(_this.container, _this.resourcesToLoad, _this.resources).then(function () {
            logger.info('Aurelia Started');
            var evt = new window.CustomEvent('aurelia-started', { bubbles: true, cancelable: true });
            document.dispatchEvent(evt);
            return _this;
          });
        });
      }
    }, {
      key: 'setRoot',
      value: function setRoot() {
        var _this2 = this;

        var root = arguments[0] === undefined ? 'app' : arguments[0];
        var applicationHost = arguments[1] === undefined ? null : arguments[1];

        var compositionEngine,
            instruction = {};

        if (!applicationHost || typeof applicationHost == 'string') {
          this.host = document.getElementById(applicationHost || 'applicationHost') || document.body;
        } else {
          this.host = applicationHost;
        }

        this.host.aurelia = this;
        this.container.registerInstance(Element, this.host);

        compositionEngine = this.container.get(_aureliaTemplating.CompositionEngine);
        instruction.viewModel = root;
        instruction.container = instruction.childContainer = this.container;
        instruction.viewSlot = new _aureliaTemplating.ViewSlot(this.host, true);
        instruction.viewSlot.transformChildNodesIntoView();

        return compositionEngine.compose(instruction).then(function (root) {
          _this2.root = root;
          instruction.viewSlot.attached();
          var evt = new window.CustomEvent('aurelia-composed', { bubbles: true, cancelable: true });
          setTimeout(function () {
            return document.dispatchEvent(evt);
          }, 1);
          return _this2;
        });
      }
    }]);

    return Aurelia;
  })();

  exports.Aurelia = Aurelia;
});
define('aurelia-framework/index',['exports', 'aurelia-logging', './aurelia', 'aurelia-dependency-injection', 'aurelia-binding', 'aurelia-metadata', 'aurelia-templating', 'aurelia-loader', 'aurelia-task-queue'], function (exports, _aureliaLogging, _aurelia, _aureliaDependencyInjection, _aureliaBinding, _aureliaMetadata, _aureliaTemplating, _aureliaLoader, _aureliaTaskQueue) {
  

  var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

  var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, 'Aurelia', {
    enumerable: true,
    get: function get() {
      return _aurelia.Aurelia;
    }
  });

  _defaults(exports, _interopRequireWildcard(_aureliaDependencyInjection));

  _defaults(exports, _interopRequireWildcard(_aureliaBinding));

  _defaults(exports, _interopRequireWildcard(_aureliaMetadata));

  _defaults(exports, _interopRequireWildcard(_aureliaTemplating));

  _defaults(exports, _interopRequireWildcard(_aureliaLoader));

  _defaults(exports, _interopRequireWildcard(_aureliaTaskQueue));

  var LogManager = _aureliaLogging;
  exports.LogManager = LogManager;
});
define('aurelia-framework', ['aurelia-framework/index'], function (main) { return main; });

define('aurelia-route-recognizer/dsl',['exports', 'core-js'], function (exports, _coreJs) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.map = map;

  var _core = _interopRequire(_coreJs);

  var Target = (function () {
    function Target(path, matcher, delegate) {
      _classCallCheck(this, Target);

      this.path = path;
      this.matcher = matcher;
      this.delegate = delegate;
    }

    _createClass(Target, [{
      key: 'to',
      value: function to(target, callback) {
        var delegate = this.delegate;

        if (delegate && delegate.willAddRoute) {
          target = delegate.willAddRoute(this.matcher.target, target);
        }

        this.matcher.add(this.path, target);

        if (callback) {
          if (callback.length === 0) {
            throw new Error('You must have an argument in the function passed to `to`');
          }
          this.matcher.addChild(this.path, target, callback, this.delegate);
        }
        return this;
      }
    }]);

    return Target;
  })();

  var Matcher = (function () {
    function Matcher(target) {
      _classCallCheck(this, Matcher);

      this.routes = {};
      this.children = {};
      this.target = target;
    }

    _createClass(Matcher, [{
      key: 'add',
      value: function add(path, handler) {
        this.routes[path] = handler;
      }
    }, {
      key: 'addChild',
      value: function addChild(path, target, callback, delegate) {
        var matcher = new Matcher(target);
        this.children[path] = matcher;

        var match = generateMatch(path, matcher, delegate);

        if (delegate && delegate.contextEntered) {
          delegate.contextEntered(target, match);
        }

        callback(match);
      }
    }]);

    return Matcher;
  })();

  function generateMatch(startingPath, matcher, delegate) {
    return function (path, nestedCallback) {
      var fullPath = startingPath + path;

      if (nestedCallback) {
        nestedCallback(generateMatch(fullPath, matcher, delegate));
      } else {
        return new Target(startingPath + path, matcher, delegate);
      }
    };
  }

  function addRoute(routeArray, path, handler) {
    var len = 0;
    for (var i = 0, l = routeArray.length; i < l; i++) {
      len += routeArray[i].path.length;
    }

    path = path.substr(len);
    var route = { path: path, handler: handler };
    routeArray.push(route);
  }

  function eachRoute(baseRoute, matcher, callback, binding) {
    var routes = matcher.routes;

    for (var path in routes) {
      if (routes.hasOwnProperty(path)) {
        var routeArray = baseRoute.slice();
        addRoute(routeArray, path, routes[path]);

        if (matcher.children[path]) {
          eachRoute(routeArray, matcher.children[path], callback, binding);
        } else {
          callback.call(binding, routeArray);
        }
      }
    }
  }

  function map(callback, addRouteCallback) {
    var matcher = new Matcher();

    callback(generateMatch('', matcher, this.delegate));

    eachRoute([], matcher, function (route) {
      if (addRouteCallback) {
        addRouteCallback(this, route);
      } else {
        this.add(route);
      }
    }, this);
  }
});
define('aurelia-route-recognizer/index',['exports', 'core-js', './dsl'], function (exports, _coreJs, _dsl) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];

  var escapeRegex = new RegExp('(\\' + specials.join('|\\') + ')', 'g');

  var StaticSegment = (function () {
    function StaticSegment(string) {
      _classCallCheck(this, StaticSegment);

      this.string = string;
    }

    _createClass(StaticSegment, [{
      key: 'eachChar',
      value: function eachChar(callback) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.string[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var ch = _step.value;

            callback({ validChars: ch });
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }, {
      key: 'regex',
      value: function regex() {
        return this.string.replace(escapeRegex, '\\$1');
      }
    }, {
      key: 'generate',
      value: function generate() {
        return this.string;
      }
    }]);

    return StaticSegment;
  })();

  var DynamicSegment = (function () {
    function DynamicSegment(name) {
      _classCallCheck(this, DynamicSegment);

      this.name = name;
    }

    _createClass(DynamicSegment, [{
      key: 'eachChar',
      value: function eachChar(callback) {
        callback({ invalidChars: '/', repeat: true });
      }
    }, {
      key: 'regex',
      value: function regex() {
        return '([^/]+)';
      }
    }, {
      key: 'generate',
      value: function generate(params, consumed) {
        consumed[this.name] = true;
        return params[this.name];
      }
    }]);

    return DynamicSegment;
  })();

  var StarSegment = (function () {
    function StarSegment(name) {
      _classCallCheck(this, StarSegment);

      this.name = name;
    }

    _createClass(StarSegment, [{
      key: 'eachChar',
      value: function eachChar(callback) {
        callback({ invalidChars: '', repeat: true });
      }
    }, {
      key: 'regex',
      value: function regex() {
        return '(.+)';
      }
    }, {
      key: 'generate',
      value: function generate(params, consumed) {
        consumed[this.name] = true;
        return params[this.name];
      }
    }]);

    return StarSegment;
  })();

  var EpsilonSegment = (function () {
    function EpsilonSegment() {
      _classCallCheck(this, EpsilonSegment);
    }

    _createClass(EpsilonSegment, [{
      key: 'eachChar',
      value: function eachChar() {}
    }, {
      key: 'regex',
      value: function regex() {
        return '';
      }
    }, {
      key: 'generate',
      value: function generate() {
        return '';
      }
    }]);

    return EpsilonSegment;
  })();

  function parse(route, names, types) {
    if (route.charAt(0) === '/') {
      route = route.substr(1);
    }

    var results = [];

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = route.split('/')[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var segment = _step2.value;

        var match = undefined;

        if (match = segment.match(/^:([^\/]+)$/)) {
          results.push(new DynamicSegment(match[1]));
          names.push(match[1]);
          types.dynamics++;
        } else if (match = segment.match(/^\*([^\/]+)$/)) {
          results.push(new StarSegment(match[1]));
          names.push(match[1]);
          types.stars++;
        } else if (segment === '') {
          results.push(new EpsilonSegment());
        } else {
          results.push(new StaticSegment(segment));
          types.statics++;
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return results;
  }

  var State = (function () {
    function State(charSpec) {
      _classCallCheck(this, State);

      this.charSpec = charSpec;
      this.nextStates = [];
    }

    _createClass(State, [{
      key: 'get',
      value: function get(charSpec) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.nextStates[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var child = _step3.value;

            var isEqual = child.charSpec.validChars === charSpec.validChars && child.charSpec.invalidChars === charSpec.invalidChars;

            if (isEqual) {
              return child;
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3['return']) {
              _iterator3['return']();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
    }, {
      key: 'put',
      value: function put(charSpec) {
        var state = this.get(charSpec);

        if (state) {
          return state;
        }

        state = new State(charSpec);

        this.nextStates.push(state);

        if (charSpec.repeat) {
          state.nextStates.push(state);
        }

        return state;
      }
    }, {
      key: 'match',
      value: function match(ch) {
        var nextStates = this.nextStates,
            results = [],
            child,
            charSpec,
            chars;

        for (var i = 0, l = nextStates.length; i < l; i++) {
          child = nextStates[i];

          charSpec = child.charSpec;

          if (typeof (chars = charSpec.validChars) !== 'undefined') {
            if (chars.indexOf(ch) !== -1) {
              results.push(child);
            }
          } else if (typeof (chars = charSpec.invalidChars) !== 'undefined') {
            if (chars.indexOf(ch) === -1) {
              results.push(child);
            }
          }
        }

        return results;
      }
    }]);

    return State;
  })();

  ;

  function sortSolutions(states) {
    return states.sort(function (a, b) {
      if (a.types.stars !== b.types.stars) {
        return a.types.stars - b.types.stars;
      }

      if (a.types.stars) {
        if (a.types.statics !== b.types.statics) {
          return b.types.statics - a.types.statics;
        }
        if (a.types.dynamics !== b.types.dynamics) {
          return b.types.dynamics - a.types.dynamics;
        }
      }

      if (a.types.dynamics !== b.types.dynamics) {
        return a.types.dynamics - b.types.dynamics;
      }

      if (a.types.statics !== b.types.statics) {
        return b.types.statics - a.types.statics;
      }

      return 0;
    });
  }

  function recognizeChar(states, ch) {
    var nextStates = [];

    for (var i = 0, l = states.length; i < l; i++) {
      var state = states[i];

      nextStates = nextStates.concat(state.match(ch));
    }

    return nextStates;
  }

  var RecognizeResults = function RecognizeResults(queryParams) {
    _classCallCheck(this, RecognizeResults);

    this.splice = Array.prototype.splice;
    this.slice = Array.prototype.slice;
    this.push = Array.prototype.push;
    this.length = 0;
    this.queryParams = queryParams || {};
  };

  function findHandler(state, path, queryParams) {
    var handlers = state.handlers,
        regex = state.regex;
    var captures = path.match(regex),
        currentCapture = 1;
    var result = new RecognizeResults(queryParams);

    for (var i = 0, l = handlers.length; i < l; i++) {
      var handler = handlers[i],
          names = handler.names,
          params = {};

      for (var j = 0, m = names.length; j < m; j++) {
        params[names[j]] = captures[currentCapture++];
      }

      result.push({ handler: handler.handler, params: params, isDynamic: !!names.length });
    }

    return result;
  }

  function addSegment(currentState, segment) {
    segment.eachChar(function (ch) {
      currentState = currentState.put(ch);
    });

    return currentState;
  }

  var RouteRecognizer = (function () {
    function RouteRecognizer() {
      _classCallCheck(this, RouteRecognizer);

      this.map = _dsl.map;
      this.rootState = new State();
      this.names = {};
    }

    _createClass(RouteRecognizer, [{
      key: 'add',
      value: function add(route) {
        if (Array.isArray(route)) {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = route[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var r = _step4.value;

              this.add(r);
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                _iterator4['return']();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          return;
        }

        var currentState = this.rootState,
            regex = '^',
            types = { statics: 0, dynamics: 0, stars: 0 },
            names = [],
            routeName = route.handler.name,
            isEmpty = true;

        var segments = parse(route.path, names, types);
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = segments[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var segment = _step5.value;

            if (segment instanceof EpsilonSegment) {
              continue;
            }

            isEmpty = false;

            currentState = currentState.put({ validChars: '/' });
            regex += '/';

            currentState = addSegment(currentState, segment);
            regex += segment.regex();
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5['return']) {
              _iterator5['return']();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        if (isEmpty) {
          currentState = currentState.put({ validChars: '/' });
          regex += '/';
        }

        var handlers = [{ handler: route.handler, names: names }];

        if (routeName) {
          this.names[routeName] = {
            segments: segments,
            handlers: handlers
          };
        }

        currentState.handlers = handlers;
        currentState.regex = new RegExp(regex + '$');
        currentState.types = types;

        return currentState;
      }
    }, {
      key: 'handlersFor',
      value: function handlersFor(name) {
        var route = this.names[name],
            result = [];

        if (!route) {
          throw new Error('There is no route named ' + name);
        }

        for (var i = 0, l = route.handlers.length; i < l; i++) {
          result.push(route.handlers[i]);
        }

        return result;
      }
    }, {
      key: 'hasRoute',
      value: function hasRoute(name) {
        return !!this.names[name];
      }
    }, {
      key: 'generate',
      value: function generate(name, params) {
        params = Object.assign({}, params);

        var route = this.names[name],
            consumed = {},
            output = '';

        if (!route) {
          throw new Error('There is no route named ' + name);
        }

        var segments = route.segments;

        for (var i = 0, l = segments.length; i < l; i++) {
          var segment = segments[i];

          if (segment instanceof EpsilonSegment) {
            continue;
          }

          output += '/';
          var segmentValue = segment.generate(params, consumed);
          if (segmentValue === null || segmentValue === undefined) {
            throw new Error('A value is required for route parameter \'' + segment.name + '\' in route \'' + name + '\'.');
          }

          output += segmentValue;
        }

        if (output.charAt(0) !== '/') {
          output = '/' + output;
        }

        for (var param in consumed) {
          delete params[param];
        }

        output += this.generateQueryString(params);

        return output;
      }
    }, {
      key: 'generateQueryString',
      value: function generateQueryString(params) {
        var pairs = [],
            keys = [],
            encode = encodeURIComponent;

        for (var key in params) {
          if (params.hasOwnProperty(key)) {
            keys.push(key);
          }
        }

        keys.sort();
        for (var i = 0, len = keys.length; i < len; i++) {
          key = keys[i];
          var value = params[key];
          if (value === null || value === undefined) {
            continue;
          }

          if (Array.isArray(value)) {
            var arrayKey = '' + encode(key) + '[]';
            for (var j = 0, l = value.length; j < l; j++) {
              pairs.push('' + arrayKey + '=' + encode(value[j]));
            }
          } else {
            pairs.push('' + encode(key) + '=' + encode(value));
          }
        }

        if (pairs.length === 0) {
          return '';
        }

        return '?' + pairs.join('&');
      }
    }, {
      key: 'parseQueryString',
      value: function parseQueryString(queryString) {
        var queryParams = {};
        if (!queryString || typeof queryString !== 'string') {
          return queryParams;
        }

        if (queryString.charAt(0) === '?') {
          queryString = queryString.substr(1);
        }

        var pairs = queryString.split('&');
        for (var i = 0; i < pairs.length; i++) {
          var pair = pairs[i].split('='),
              key = decodeURIComponent(pair[0]),
              keyLength = key.length,
              isArray = false,
              value;

          if (!key) {
            continue;
          } else if (pair.length === 1) {
            value = true;
          } else {
            if (keyLength > 2 && key.slice(keyLength - 2) === '[]') {
              isArray = true;
              key = key.slice(0, keyLength - 2);
              if (!queryParams[key]) {
                queryParams[key] = [];
              }
            }
            value = pair[1] ? decodeURIComponent(pair[1]) : '';
          }
          if (isArray) {
            queryParams[key].push(value);
          } else {
            queryParams[key] = value;
          }
        }
        return queryParams;
      }
    }, {
      key: 'recognize',
      value: function recognize(path) {
        var states = [this.rootState],
            pathLen,
            i,
            l,
            queryStart,
            queryParams = {},
            isSlashDropped = false;

        queryStart = path.indexOf('?');
        if (queryStart !== -1) {
          var queryString = path.substr(queryStart + 1, path.length);
          path = path.substr(0, queryStart);
          queryParams = this.parseQueryString(queryString);
        }

        path = decodeURI(path);

        if (path.charAt(0) !== '/') {
          path = '/' + path;
        }

        pathLen = path.length;
        if (pathLen > 1 && path.charAt(pathLen - 1) === '/') {
          path = path.substr(0, pathLen - 1);
          isSlashDropped = true;
        }

        for (i = 0, l = path.length; i < l; i++) {
          states = recognizeChar(states, path.charAt(i));
          if (!states.length) {
            break;
          }
        }

        var solutions = [];
        for (i = 0, l = states.length; i < l; i++) {
          if (states[i].handlers) {
            solutions.push(states[i]);
          }
        }

        states = sortSolutions(solutions);

        var state = solutions[0];
        if (state && state.handlers) {
          if (isSlashDropped && state.regex.source.slice(-5) === '(.+)$') {
            path = path + '/';
          }
          return findHandler(state, path, queryParams);
        }
      }
    }]);

    return RouteRecognizer;
  })();

  exports.RouteRecognizer = RouteRecognizer;
});
define('aurelia-route-recognizer', ['aurelia-route-recognizer/index'], function (main) { return main; });

define('aurelia-router/navigation-commands',['exports', 'core-js'], function (exports, _coreJs) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.isNavigationCommand = isNavigationCommand;

  var _core = _interopRequire(_coreJs);

  function isNavigationCommand(obj) {
    return obj && typeof obj.navigate === 'function';
  }

  var Redirect = (function () {
    function Redirect(url, options) {
      _classCallCheck(this, Redirect);

      this.url = url;
      this.options = Object.assign({ trigger: true, replace: true }, options || {});
      this.shouldContinueProcessing = false;
    }

    _createClass(Redirect, [{
      key: 'setRouter',
      value: function setRouter(router) {
        this.router = router;
      }
    }, {
      key: 'navigate',
      value: function navigate(appRouter) {
        var navigatingRouter = this.options.useAppRouter ? appRouter : this.router || appRouter;
        navigatingRouter.navigate(this.url, this.options);
      }
    }]);

    return Redirect;
  })();

  exports.Redirect = Redirect;
});
define('aurelia-router/navigation-plan',['exports', './navigation-commands'], function (exports, _navigationCommands) {
  

  var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.buildNavigationPlan = buildNavigationPlan;
  var NO_CHANGE = 'no-change';
  exports.NO_CHANGE = NO_CHANGE;
  var INVOKE_LIFECYCLE = 'invoke-lifecycle';
  exports.INVOKE_LIFECYCLE = INVOKE_LIFECYCLE;
  var REPLACE = 'replace';

  exports.REPLACE = REPLACE;

  function buildNavigationPlan(navigationContext, forceLifecycleMinimum) {
    var prev = navigationContext.prevInstruction;
    var next = navigationContext.nextInstruction;
    var plan = {},
        viewPortName;

    if (prev) {
      var newParams = hasDifferentParameterValues(prev, next);
      var pending = [];

      for (viewPortName in prev.viewPortInstructions) {
        var prevViewPortInstruction = prev.viewPortInstructions[viewPortName];
        var nextViewPortConfig = next.config.viewPorts[viewPortName];
        var viewPortPlan = plan[viewPortName] = {
          name: viewPortName,
          config: nextViewPortConfig,
          prevComponent: prevViewPortInstruction.component,
          prevModuleId: prevViewPortInstruction.moduleId
        };

        if (prevViewPortInstruction.moduleId != nextViewPortConfig.moduleId) {
          viewPortPlan.strategy = REPLACE;
        } else if ('determineActivationStrategy' in prevViewPortInstruction.component.executionContext) {
          var _prevViewPortInstruction$component$executionContext;

          viewPortPlan.strategy = (_prevViewPortInstruction$component$executionContext = prevViewPortInstruction.component.executionContext).determineActivationStrategy.apply(_prevViewPortInstruction$component$executionContext, _toConsumableArray(next.lifecycleArgs));
        } else if (newParams || forceLifecycleMinimum) {
          viewPortPlan.strategy = INVOKE_LIFECYCLE;
        } else {
          viewPortPlan.strategy = NO_CHANGE;
        }

        if (viewPortPlan.strategy !== REPLACE && prevViewPortInstruction.childRouter) {
          var path = next.getWildcardPath();
          var task = prevViewPortInstruction.childRouter.createNavigationInstruction(path, next).then(function (childInstruction) {
            viewPortPlan.childNavigationContext = prevViewPortInstruction.childRouter.createNavigationContext(childInstruction);

            return buildNavigationPlan(viewPortPlan.childNavigationContext, viewPortPlan.strategy == INVOKE_LIFECYCLE).then(function (childPlan) {
              viewPortPlan.childNavigationContext.plan = childPlan;
            });
          });

          pending.push(task);
        }
      }

      return Promise.all(pending).then(function () {
        return plan;
      });
    } else {
      for (viewPortName in next.config.viewPorts) {
        plan[viewPortName] = {
          name: viewPortName,
          strategy: REPLACE,
          config: next.config.viewPorts[viewPortName]
        };
      }

      return Promise.resolve(plan);
    }
  }

  var BuildNavigationPlanStep = (function () {
    function BuildNavigationPlanStep() {
      _classCallCheck(this, BuildNavigationPlanStep);
    }

    _createClass(BuildNavigationPlanStep, [{
      key: 'run',
      value: function run(navigationContext, next) {
        if (navigationContext.nextInstruction.config.redirect) {
          return next.cancel(new _navigationCommands.Redirect(navigationContext.nextInstruction.config.redirect));
        }

        return buildNavigationPlan(navigationContext).then(function (plan) {
          navigationContext.plan = plan;
          return next();
        })['catch'](next.cancel);
      }
    }]);

    return BuildNavigationPlanStep;
  })();

  exports.BuildNavigationPlanStep = BuildNavigationPlanStep;

  function hasDifferentParameterValues(prev, next) {
    var prevParams = prev.params,
        nextParams = next.params,
        nextWildCardName = next.config.hasChildRouter ? next.getWildCardName() : null;

    for (var key in nextParams) {
      if (key == nextWildCardName) {
        continue;
      }

      if (prevParams[key] != nextParams[key]) {
        return true;
      }
    }

    return false;
  }
});
define('aurelia-router/navigation-context',['exports', './navigation-plan'], function (exports, _navigationPlan) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var NavigationContext = (function () {
    function NavigationContext(router, nextInstruction) {
      _classCallCheck(this, NavigationContext);

      this.router = router;
      this.nextInstruction = nextInstruction;
      this.currentInstruction = router.currentInstruction;
      this.prevInstruction = router.currentInstruction;
    }

    _createClass(NavigationContext, [{
      key: 'getAllContexts',
      value: function getAllContexts() {
        var acc = arguments[0] === undefined ? [] : arguments[0];

        acc.push(this);
        if (this.plan) {
          for (var key in this.plan) {
            this.plan[key].childNavigationContext && this.plan[key].childNavigationContext.getAllContexts(acc);
          }
        }
        return acc;
      }
    }, {
      key: 'nextInstructions',
      get: function () {
        return this.getAllContexts().map(function (c) {
          return c.nextInstruction;
        }).filter(function (c) {
          return c;
        });
      }
    }, {
      key: 'currentInstructions',
      get: function () {
        return this.getAllContexts().map(function (c) {
          return c.currentInstruction;
        }).filter(function (c) {
          return c;
        });
      }
    }, {
      key: 'prevInstructions',
      get: function () {
        return this.getAllContexts().map(function (c) {
          return c.prevInstruction;
        }).filter(function (c) {
          return c;
        });
      }
    }, {
      key: 'commitChanges',
      value: function commitChanges(waitToSwap) {
        var next = this.nextInstruction,
            prev = this.prevInstruction,
            viewPortInstructions = next.viewPortInstructions,
            router = this.router,
            loads = [],
            delaySwaps = [];

        router.currentInstruction = next;

        if (prev) {
          prev.config.navModel.isActive = false;
        }

        next.config.navModel.isActive = true;

        router.refreshBaseUrl();
        router.refreshNavigation();

        for (var viewPortName in viewPortInstructions) {
          var viewPortInstruction = viewPortInstructions[viewPortName];
          var viewPort = router.viewPorts[viewPortName];

          if (!viewPort) {
            throw new Error('There was no router-view found in the view for ' + viewPortInstruction.moduleId + '.');
          }

          if (viewPortInstruction.strategy === _navigationPlan.REPLACE) {
            if (waitToSwap) {
              delaySwaps.push({ viewPort: viewPort, viewPortInstruction: viewPortInstruction });
            }

            loads.push(viewPort.process(viewPortInstruction, waitToSwap).then(function (x) {
              if ('childNavigationContext' in viewPortInstruction) {
                return viewPortInstruction.childNavigationContext.commitChanges();
              }
            }));
          } else {
            if ('childNavigationContext' in viewPortInstruction) {
              loads.push(viewPortInstruction.childNavigationContext.commitChanges(waitToSwap));
            }
          }
        }

        return Promise.all(loads).then(function () {
          delaySwaps.forEach(function (x) {
            return x.viewPort.swap(x.viewPortInstruction);
          });
        });
      }
    }, {
      key: 'buildTitle',
      value: function buildTitle() {
        var separator = arguments[0] === undefined ? ' | ' : arguments[0];

        var next = this.nextInstruction,
            title = next.config.navModel.title || '',
            viewPortInstructions = next.viewPortInstructions,
            childTitles = [];

        for (var viewPortName in viewPortInstructions) {
          var viewPortInstruction = viewPortInstructions[viewPortName];

          if ('childNavigationContext' in viewPortInstruction) {
            var childTitle = viewPortInstruction.childNavigationContext.buildTitle(separator);
            if (childTitle) {
              childTitles.push(childTitle);
            }
          }
        }

        if (childTitles.length) {
          title = childTitles.join(separator) + (title ? separator : '') + title;
        }

        if (this.router.title) {
          title += (title ? separator : '') + this.router.title;
        }

        return title;
      }
    }]);

    return NavigationContext;
  })();

  exports.NavigationContext = NavigationContext;

  var CommitChangesStep = (function () {
    function CommitChangesStep() {
      _classCallCheck(this, CommitChangesStep);
    }

    _createClass(CommitChangesStep, [{
      key: 'run',
      value: function run(navigationContext, next) {
        return navigationContext.commitChanges(true).then(function () {
          var title = navigationContext.buildTitle();
          if (title) {
            document.title = title;
          }

          return next();
        });
      }
    }]);

    return CommitChangesStep;
  })();

  exports.CommitChangesStep = CommitChangesStep;
});
define('aurelia-router/navigation-instruction',["exports"], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var NavigationInstruction = (function () {
    function NavigationInstruction(fragment, queryString, params, queryParams, config, parentInstruction) {
      _classCallCheck(this, NavigationInstruction);

      this.fragment = fragment;
      this.queryString = queryString;
      this.params = params || {};
      this.queryParams = queryParams;
      this.config = config;
      this.lifecycleArgs = [params, queryParams, config, this];
      this.viewPortInstructions = {};

      if (parentInstruction) {
        this.params.$parent = parentInstruction.params;
      }
    }

    _createClass(NavigationInstruction, [{
      key: "addViewPortInstruction",
      value: function addViewPortInstruction(viewPortName, strategy, moduleId, component) {
        return this.viewPortInstructions[viewPortName] = {
          name: viewPortName,
          strategy: strategy,
          moduleId: moduleId,
          component: component,
          childRouter: component.executionContext.router,
          lifecycleArgs: this.lifecycleArgs.slice()
        };
      }
    }, {
      key: "getWildCardName",
      value: function getWildCardName() {
        var wildcardIndex = this.config.route.lastIndexOf("*");
        return this.config.route.substr(wildcardIndex + 1);
      }
    }, {
      key: "getWildcardPath",
      value: function getWildcardPath() {
        var wildcardName = this.getWildCardName(),
            path = this.params[wildcardName];

        if (this.queryString) {
          path += "?" + this.queryString;
        }

        return path;
      }
    }, {
      key: "getBaseUrl",
      value: function getBaseUrl() {
        if (!this.params) {
          return this.fragment;
        }

        var wildcardName = this.getWildCardName(),
            path = this.params[wildcardName];

        if (!path) {
          return this.fragment;
        }

        return this.fragment.substr(0, this.fragment.lastIndexOf(path));
      }
    }]);

    return NavigationInstruction;
  })();

  exports.NavigationInstruction = NavigationInstruction;
});
define('aurelia-router/route-filters',['exports', 'aurelia-dependency-injection'], function (exports, _aureliaDependencyInjection) {
  

  var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.createRouteFilterStep = createRouteFilterStep;

  var RouteFilterContainer = (function () {
    function RouteFilterContainer(container) {
      _classCallCheck(this, RouteFilterContainer);

      this.container = container;
      this.filters = {};
      this.filterCache = {};
    }

    _createClass(RouteFilterContainer, [{
      key: 'addStep',
      value: function addStep(name, step) {
        var index = arguments[2] === undefined ? -1 : arguments[2];

        var filter = this.filters[name];
        if (!filter) {
          filter = this.filters[name] = [];
        }

        if (index === -1) {
          index = filter.length;
        }

        filter.splice(index, 0, step);
        this.filterCache = {};
      }
    }, {
      key: 'getFilterSteps',
      value: function getFilterSteps(name) {
        if (this.filterCache[name]) {
          return this.filterCache[name];
        }

        var steps = [];
        var filter = this.filters[name];
        if (!filter) {
          return steps;
        }

        for (var i = 0, l = filter.length; i < l; i++) {
          if (typeof filter[i] === 'string') {
            steps.push.apply(steps, _toConsumableArray(this.getFilterSteps(filter[i])));
          } else {
            steps.push(this.container.get(filter[i]));
          }
        }

        return this.filterCache[name] = steps;
      }
    }], [{
      key: 'inject',
      value: function inject() {
        return [_aureliaDependencyInjection.Container];
      }
    }]);

    return RouteFilterContainer;
  })();

  exports.RouteFilterContainer = RouteFilterContainer;

  function createRouteFilterStep(name) {
    function create(routeFilterContainer) {
      return new RouteFilterStep(name, routeFilterContainer);
    };
    create.inject = function () {
      return [RouteFilterContainer];
    };
    return create;
  }

  var RouteFilterStep = (function () {
    function RouteFilterStep(name, routeFilterContainer) {
      _classCallCheck(this, RouteFilterStep);

      this.name = name;
      this.routeFilterContainer = routeFilterContainer;
      this.isMultiStep = true;
    }

    _createClass(RouteFilterStep, [{
      key: 'getSteps',
      value: function getSteps() {
        return this.routeFilterContainer.getFilterSteps(this.name);
      }
    }]);

    return RouteFilterStep;
  })();
});
define('aurelia-router/router-configuration',['exports', './route-filters'], function (exports, _routeFilters) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var RouterConfiguration = (function () {
    function RouterConfiguration() {
      _classCallCheck(this, RouterConfiguration);

      this.instructions = [];
      this.options = {};
      this.pipelineSteps = [];
    }

    _createClass(RouterConfiguration, [{
      key: 'addPipelineStep',
      value: function addPipelineStep(name, step) {
        this.pipelineSteps.push({ name: name, step: step });
      }
    }, {
      key: 'map',
      value: function map(route, config) {
        if (Array.isArray(route)) {
          for (var i = 0; i < route.length; i++) {
            this.map(route[i]);
          }

          return this;
        }

        if (typeof route == 'string') {
          if (!config) {
            config = {};
          } else if (typeof config == 'string') {
            config = { moduleId: config };
          }

          config.route = route;
        } else {
          config = route;
        }

        return this.mapRoute(config);
      }
    }, {
      key: 'mapRoute',
      value: function mapRoute(config) {
        var _this = this;

        this.instructions.push(function (router) {
          if (Array.isArray(config.route)) {
            var navModel = {},
                i,
                ii,
                current;

            for (i = 0, ii = config.route.length; i < ii; ++i) {
              current = Object.assign({}, config);
              current.route = config.route[i];
              _this.configureRoute(router, current, navModel);
            }
          } else {
            _this.configureRoute(router, Object.assign({}, config));
          }
        });

        return this;
      }
    }, {
      key: 'mapUnknownRoutes',
      value: function mapUnknownRoutes(config) {
        this.unknownRouteConfig = config;
        return this;
      }
    }, {
      key: 'exportToRouter',
      value: function exportToRouter(router) {
        var instructions = this.instructions,
            pipelineSteps = this.pipelineSteps,
            i,
            ii,
            filterContainer;

        for (i = 0, ii = instructions.length; i < ii; ++i) {
          instructions[i](router);
        }

        if (this.title) {
          router.title = this.title;
        }

        if (this.unknownRouteConfig) {
          router.handleUnknownRoutes(this.unknownRouteConfig);
        }

        router.options = this.options;

        if (pipelineSteps.length) {
          if (!router.isRoot) {
            throw new Error('Pipeline steps can only be added to the root router');
          }

          filterContainer = router.container.get(_routeFilters.RouteFilterContainer);
          for (i = 0, ii = pipelineSteps.length; i < ii; ++i) {
            var _pipelineSteps$i = pipelineSteps[i];
            var name = _pipelineSteps$i.name;
            var step = _pipelineSteps$i.step;

            filterContainer.addStep(name, step);
          }
        }
      }
    }, {
      key: 'configureRoute',
      value: function configureRoute(router, config, navModel) {
        this.ensureDefaultsForRouteConfig(config);
        router.addRoute(config, navModel);
      }
    }, {
      key: 'ensureDefaultsForRouteConfig',
      value: function ensureDefaultsForRouteConfig(config) {
        config.name = ensureConfigValue(config, 'name', this.deriveName);
        config.route = ensureConfigValue(config, 'route', this.deriveRoute);
        config.title = ensureConfigValue(config, 'title', this.deriveTitle);
        config.moduleId = ensureConfigValue(config, 'moduleId', this.deriveModuleId);
      }
    }, {
      key: 'deriveName',
      value: function deriveName(config) {
        return config.title || (config.route ? stripParametersFromRoute(config.route) : config.moduleId);
      }
    }, {
      key: 'deriveRoute',
      value: function deriveRoute(config) {
        return config.moduleId || config.name;
      }
    }, {
      key: 'deriveTitle',
      value: function deriveTitle(config) {
        var value = config.name;
        return value ? value.substr(0, 1).toUpperCase() + value.substr(1) : null;
      }
    }, {
      key: 'deriveModuleId',
      value: function deriveModuleId(config) {
        return stripParametersFromRoute(config.route);
      }
    }]);

    return RouterConfiguration;
  })();

  exports.RouterConfiguration = RouterConfiguration;

  function ensureConfigValue(config, property, getter) {
    var value = config[property];

    if (value || value === '') {
      return value;
    }

    return getter(config);
  }

  function stripParametersFromRoute(route) {
    var colonIndex = route.indexOf(':');
    var length = colonIndex > 0 ? colonIndex - 1 : route.length;
    return route.substr(0, length);
  }
});
define('aurelia-router/util',['exports'], function (exports) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.processPotential = processPotential;

  function processPotential(obj, resolve, reject) {
    if (obj && typeof obj.then === 'function') {
      var dfd = obj.then(resolve);

      if (typeof dfd['catch'] === 'function') {
        return dfd['catch'](reject);
      } else if (typeof dfd.fail === 'function') {
        return dfd.fail(reject);
      }

      return dfd;
    } else {
      try {
        return resolve(obj);
      } catch (error) {
        return reject(error);
      }
    }
  }
});
define('aurelia-router/router',['exports', 'core-js', 'aurelia-route-recognizer', 'aurelia-path', './navigation-context', './navigation-instruction', './router-configuration', './util'], function (exports, _coreJs, _aureliaRouteRecognizer, _aureliaPath, _navigationContext, _navigationInstruction, _routerConfiguration, _util) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var Router = (function () {
    function Router(container, history) {
      _classCallCheck(this, Router);

      this.container = container;
      this.history = history;
      this.viewPorts = {};
      this.reset();
      this.baseUrl = '';
      this.isConfigured = false;
    }

    _createClass(Router, [{
      key: 'isRoot',
      get: function () {
        return false;
      }
    }, {
      key: 'registerViewPort',
      value: function registerViewPort(viewPort, name) {
        name = name || 'default';
        this.viewPorts[name] = viewPort;
      }
    }, {
      key: 'refreshBaseUrl',
      value: function refreshBaseUrl() {
        if (this.parent) {
          var baseUrl = this.parent.currentInstruction.getBaseUrl();
          this.baseUrl = this.parent.baseUrl + baseUrl;
        }
      }
    }, {
      key: 'refreshNavigation',
      value: function refreshNavigation() {
        var nav = this.navigation;

        for (var i = 0, length = nav.length; i < length; i++) {
          var current = nav[i];

          if (!this.history._hasPushState) {
            if (this.baseUrl[0] == '/') {
              current.href = '#' + this.baseUrl;
            } else {
              current.href = '#/' + this.baseUrl;
            }
          } else {
            current.href = '/' + this.baseUrl;
          }

          if (current.href[current.href.length - 1] != '/') {
            current.href += '/';
          }

          current.href += current.relativeHref;
        }
      }
    }, {
      key: 'configure',
      value: function configure(callbackOrConfig) {
        this.isConfigured = true;

        if (typeof callbackOrConfig == 'function') {
          var config = new _routerConfiguration.RouterConfiguration();
          callbackOrConfig(config);
          config.exportToRouter(this);
        } else {
          callbackOrConfig.exportToRouter(this);
        }

        return this;
      }
    }, {
      key: 'navigate',
      value: function navigate(fragment, options) {
        if (!this.isConfigured && this.parent) {
          return this.parent.navigate(fragment, options);
        }

        fragment = _aureliaPath.join(this.baseUrl, fragment);
        if (fragment === '') fragment = '/';
        return this.history.navigate(fragment, options);
      }
    }, {
      key: 'navigateBack',
      value: function navigateBack() {
        this.history.navigateBack();
      }
    }, {
      key: 'createChild',
      value: function createChild(container) {
        var childRouter = new Router(container || this.container.createChild(), this.history);
        childRouter.parent = this;
        return childRouter;
      }
    }, {
      key: 'createNavigationInstruction',
      value: function createNavigationInstruction() {
        var url = arguments[0] === undefined ? '' : arguments[0];
        var parentInstruction = arguments[1] === undefined ? null : arguments[1];

        var results = this.recognizer.recognize(url);
        var fragment, queryIndex, queryString;

        if (!results || !results.length) {
          results = this.childRecognizer.recognize(url);
        }

        fragment = url;
        queryIndex = fragment.indexOf('?');

        if (queryIndex != -1) {
          fragment = url.substr(0, queryIndex);
          queryString = url.substr(queryIndex + 1);
        }

        if ((!results || !results.length) && this.catchAllHandler) {
          results = [{
            config: {
              navModel: {}
            },
            handler: this.catchAllHandler,
            params: {
              path: fragment
            }
          }];
        }

        if (results && results.length) {
          var first = results[0],
              fragment = url,
              queryIndex = fragment.indexOf('?'),
              queryString;

          if (queryIndex != -1) {
            fragment = url.substr(0, queryIndex);
            queryString = url.substr(queryIndex + 1);
          }

          var instruction = new _navigationInstruction.NavigationInstruction(fragment, queryString, first.params, first.queryParams || results.queryParams, first.config || first.handler, parentInstruction);

          if (typeof first.handler == 'function') {
            return first.handler(instruction).then(function (instruction) {
              if (!('viewPorts' in instruction.config)) {
                instruction.config.viewPorts = {
                  'default': {
                    moduleId: instruction.config.moduleId
                  }
                };
              }

              return instruction;
            });
          }

          return Promise.resolve(instruction);
        } else {
          return Promise.reject(new Error('Route Not Found: ' + url));
        }
      }
    }, {
      key: 'createNavigationContext',
      value: function createNavigationContext(instruction) {
        return new _navigationContext.NavigationContext(this, instruction);
      }
    }, {
      key: 'generate',
      value: function generate(name, params, options) {
        options = options || {};
        if ((!this.isConfigured || !this.recognizer.hasRoute(name)) && this.parent) {
          return this.parent.generate(name, params, options);
        }

        var root = '';
        var path = this.recognizer.generate(name, params);
        if (options.absolute) {
          root = (this.history.root || '') + this.baseUrl;
        }

        return root + path;
      }
    }, {
      key: 'addRoute',
      value: function addRoute(config) {
        var navModel = arguments[1] === undefined ? {} : arguments[1];

        validateRouteConfig(config);

        if (!('viewPorts' in config)) {
          config.viewPorts = {
            'default': {
              moduleId: config.moduleId,
              view: config.view
            }
          };
        }

        navModel.title = navModel.title || config.title;
        navModel.settings = config.settings || (config.settings = {});

        this.routes.push(config);
        var state = this.recognizer.add({ path: config.route, handler: config });

        if (config.route) {
          var withChild,
              settings = config.settings;
          delete config.settings;
          withChild = JSON.parse(JSON.stringify(config));
          config.settings = settings;
          withChild.route += '/*childRoute';
          withChild.hasChildRouter = true;
          this.childRecognizer.add({
            path: withChild.route,
            handler: withChild
          });

          withChild.navModel = navModel;
          withChild.settings = config.settings;
        }

        config.navModel = navModel;

        if ((config.nav || 'order' in navModel) && this.navigation.indexOf(navModel) === -1) {
          navModel.order = navModel.order || config.nav;
          navModel.href = navModel.href || config.href;
          navModel.isActive = false;
          navModel.config = config;

          if (!config.href) {
            if (state.types.dynamics || state.types.stars) {
              throw new Error('Invalid route config: dynamic routes must specify an href to be included in the navigation model.');
            }

            navModel.relativeHref = config.route;
            navModel.href = '';
          }

          if (typeof navModel.order != 'number') {
            navModel.order = ++this.fallbackOrder;
          }

          this.navigation.push(navModel);
          this.navigation = this.navigation.sort(function (a, b) {
            return a.order - b.order;
          });
        }
      }
    }, {
      key: 'hasRoute',
      value: function hasRoute(name) {
        return !!(this.recognizer.hasRoute(name) || this.parent && this.parent.hasRoute(name));
      }
    }, {
      key: 'hasOwnRoute',
      value: function hasOwnRoute(name) {
        return this.recognizer.hasRoute(name);
      }
    }, {
      key: 'handleUnknownRoutes',
      value: function handleUnknownRoutes(config) {
        var callback = function callback(instruction) {
          return new Promise(function (resolve, reject) {
            function done(inst) {
              inst = inst || instruction;
              inst.config.route = inst.params.path;
              resolve(inst);
            }

            if (!config) {
              instruction.config.moduleId = instruction.fragment;
              done(instruction);
            } else if (typeof config == 'string') {
              instruction.config.moduleId = config;
              done(instruction);
            } else if (typeof config == 'function') {
              _util.processPotential(config(instruction), done, reject);
            } else {
              instruction.config = config;
              done(instruction);
            }
          });
        };

        this.catchAllHandler = callback;
      }
    }, {
      key: 'reset',
      value: function reset() {
        this.fallbackOrder = 100;
        this.recognizer = new _aureliaRouteRecognizer.RouteRecognizer();
        this.childRecognizer = new _aureliaRouteRecognizer.RouteRecognizer();
        this.routes = [];
        this.isNavigating = false;
        this.navigation = [];
        this.isConfigured = false;
      }
    }]);

    return Router;
  })();

  exports.Router = Router;

  function validateRouteConfig(config) {
    var isValid = typeof config === 'object' && (config.moduleId || config.redirect) && config.route !== null && config.route !== undefined;

    if (!isValid) {
      throw new Error('Invalid Route Config: You must have at least a route and a moduleId or redirect.');
    }
  }
});
define('aurelia-router/pipeline',['exports', 'core-js'], function (exports, _coreJs) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  function createResult(ctx, next) {
    return {
      status: next.status,
      context: ctx,
      output: next.output,
      completed: next.status == COMPLETED
    };
  }

  var COMPLETED = 'completed';
  exports.COMPLETED = COMPLETED;
  var CANCELLED = 'cancelled';
  exports.CANCELLED = CANCELLED;
  var REJECTED = 'rejected';
  exports.REJECTED = REJECTED;
  var RUNNING = 'running';

  exports.RUNNING = RUNNING;

  var Pipeline = (function () {
    function Pipeline() {
      _classCallCheck(this, Pipeline);

      this.steps = [];
    }

    _createClass(Pipeline, [{
      key: 'withStep',
      value: function withStep(step) {
        var run, steps, i, l;

        if (typeof step == 'function') {
          run = step;
        } else if (step.isMultiStep) {
          steps = step.getSteps();
          for (i = 0, l = steps.length; i < l; i++) {
            this.withStep(steps[i]);
          }

          return this;
        } else {
          run = step.run.bind(step);
        }

        this.steps.push(run);

        return this;
      }
    }, {
      key: 'run',
      value: function run(ctx) {
        var index = -1,
            steps = this.steps,
            next,
            currentStep;

        next = function () {
          index++;

          if (index < steps.length) {
            currentStep = steps[index];

            try {
              return currentStep(ctx, next);
            } catch (e) {
              return next.reject(e);
            }
          } else {
            return next.complete();
          }
        };

        next.complete = function (output) {
          next.status = COMPLETED;
          next.output = output;
          return Promise.resolve(createResult(ctx, next));
        };

        next.cancel = function (reason) {
          next.status = CANCELLED;
          next.output = reason;
          return Promise.resolve(createResult(ctx, next));
        };

        next.reject = function (error) {
          next.status = REJECTED;
          next.output = error;
          return Promise.reject(createResult(ctx, next));
        };

        next.status = RUNNING;

        return next();
      }
    }]);

    return Pipeline;
  })();

  exports.Pipeline = Pipeline;
});
define('aurelia-router/route-loading',['exports', './navigation-plan'], function (exports, _navigationPlan) {
  

  var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.loadNewRoute = loadNewRoute;

  var RouteLoader = (function () {
    function RouteLoader() {
      _classCallCheck(this, RouteLoader);
    }

    _createClass(RouteLoader, [{
      key: 'loadRoute',
      value: function loadRoute(router, config) {
        throw Error('Route loaders must implment "loadRoute(router, config)".');
      }
    }]);

    return RouteLoader;
  })();

  exports.RouteLoader = RouteLoader;

  var LoadRouteStep = (function () {
    function LoadRouteStep(routeLoader) {
      _classCallCheck(this, LoadRouteStep);

      this.routeLoader = routeLoader;
    }

    _createClass(LoadRouteStep, [{
      key: 'run',
      value: function run(navigationContext, next) {
        return loadNewRoute([], this.routeLoader, navigationContext).then(next)['catch'](next.cancel);
      }
    }], [{
      key: 'inject',
      value: function inject() {
        return [RouteLoader];
      }
    }]);

    return LoadRouteStep;
  })();

  exports.LoadRouteStep = LoadRouteStep;

  function loadNewRoute(routers, routeLoader, navigationContext) {
    var toLoad = determineWhatToLoad(navigationContext);
    var loadPromises = toLoad.map(function (current) {
      return loadRoute(routers, routeLoader, current.navigationContext, current.viewPortPlan);
    });

    return Promise.all(loadPromises);
  }

  function determineWhatToLoad(navigationContext, toLoad) {
    var plan = navigationContext.plan;
    var next = navigationContext.nextInstruction;

    toLoad = toLoad || [];

    for (var viewPortName in plan) {
      var viewPortPlan = plan[viewPortName];

      if (viewPortPlan.strategy == _navigationPlan.REPLACE) {
        toLoad.push({
          viewPortPlan: viewPortPlan,
          navigationContext: navigationContext
        });

        if (viewPortPlan.childNavigationContext) {
          determineWhatToLoad(viewPortPlan.childNavigationContext, toLoad);
        }
      } else {
        var viewPortInstruction = next.addViewPortInstruction(viewPortName, viewPortPlan.strategy, viewPortPlan.prevModuleId, viewPortPlan.prevComponent);

        if (viewPortPlan.childNavigationContext) {
          viewPortInstruction.childNavigationContext = viewPortPlan.childNavigationContext;
          determineWhatToLoad(viewPortPlan.childNavigationContext, toLoad);
        }
      }
    }

    return toLoad;
  }

  function loadRoute(routers, routeLoader, navigationContext, viewPortPlan) {
    var moduleId = viewPortPlan.config.moduleId;
    var next = navigationContext.nextInstruction;

    routers.push(navigationContext.router);

    return loadComponent(routeLoader, navigationContext, viewPortPlan.config).then(function (component) {
      var viewPortInstruction = next.addViewPortInstruction(viewPortPlan.name, viewPortPlan.strategy, moduleId, component);

      var controller = component.executionContext;

      if (controller.router && controller.router.isConfigured && routers.indexOf(controller.router) === -1) {
        var path = next.getWildcardPath();

        return controller.router.createNavigationInstruction(path, next).then(function (childInstruction) {
          viewPortPlan.childNavigationContext = controller.router.createNavigationContext(childInstruction);

          return _navigationPlan.buildNavigationPlan(viewPortPlan.childNavigationContext).then(function (childPlan) {
            viewPortPlan.childNavigationContext.plan = childPlan;
            viewPortInstruction.childNavigationContext = viewPortPlan.childNavigationContext;

            return loadNewRoute(routers, routeLoader, viewPortPlan.childNavigationContext);
          });
        });
      }
    });
  }

  function loadComponent(routeLoader, navigationContext, config) {
    var router = navigationContext.router,
        lifecycleArgs = navigationContext.nextInstruction.lifecycleArgs;
    return routeLoader.loadRoute(router, config).then(function (component) {
      if ('configureRouter' in component.executionContext) {
        var _component$executionContext;

        var result = (_component$executionContext = component.executionContext).configureRouter.apply(_component$executionContext, _toConsumableArray(lifecycleArgs)) || Promise.resolve();
        return result.then(function () {
          return component;
        });
      }

      component.router = router;
      component.config = config;
      return component;
    });
  }
});
define('aurelia-router/activation',['exports', './navigation-plan', './navigation-commands', './util'], function (exports, _navigationPlan, _navigationCommands, _util) {
  

  var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  var affirmations = ['yes', 'ok', 'true'];

  exports.affirmations = affirmations;

  var CanDeactivatePreviousStep = (function () {
    function CanDeactivatePreviousStep() {
      _classCallCheck(this, CanDeactivatePreviousStep);
    }

    _createClass(CanDeactivatePreviousStep, [{
      key: 'run',
      value: function run(navigationContext, next) {
        return processDeactivatable(navigationContext.plan, 'canDeactivate', next);
      }
    }]);

    return CanDeactivatePreviousStep;
  })();

  exports.CanDeactivatePreviousStep = CanDeactivatePreviousStep;

  var CanActivateNextStep = (function () {
    function CanActivateNextStep() {
      _classCallCheck(this, CanActivateNextStep);
    }

    _createClass(CanActivateNextStep, [{
      key: 'run',
      value: function run(navigationContext, next) {
        return processActivatable(navigationContext, 'canActivate', next);
      }
    }]);

    return CanActivateNextStep;
  })();

  exports.CanActivateNextStep = CanActivateNextStep;

  var DeactivatePreviousStep = (function () {
    function DeactivatePreviousStep() {
      _classCallCheck(this, DeactivatePreviousStep);
    }

    _createClass(DeactivatePreviousStep, [{
      key: 'run',
      value: function run(navigationContext, next) {
        return processDeactivatable(navigationContext.plan, 'deactivate', next, true);
      }
    }]);

    return DeactivatePreviousStep;
  })();

  exports.DeactivatePreviousStep = DeactivatePreviousStep;

  var ActivateNextStep = (function () {
    function ActivateNextStep() {
      _classCallCheck(this, ActivateNextStep);
    }

    _createClass(ActivateNextStep, [{
      key: 'run',
      value: function run(navigationContext, next) {
        return processActivatable(navigationContext, 'activate', next, true);
      }
    }]);

    return ActivateNextStep;
  })();

  exports.ActivateNextStep = ActivateNextStep;

  function processDeactivatable(plan, callbackName, next, ignoreResult) {
    var infos = findDeactivatable(plan, callbackName),
        i = infos.length;

    function inspect(val) {
      if (ignoreResult || shouldContinue(val)) {
        return iterate();
      } else {
        return next.cancel(val);
      }
    }

    function iterate() {
      if (i--) {
        try {
          var controller = infos[i];
          var result = controller[callbackName]();
          return _util.processPotential(result, inspect, next.cancel);
        } catch (error) {
          return next.cancel(error);
        }
      } else {
        return next();
      }
    }

    return iterate();
  }

  function findDeactivatable(plan, callbackName, list) {
    list = list || [];

    for (var viewPortName in plan) {
      var viewPortPlan = plan[viewPortName];
      var prevComponent = viewPortPlan.prevComponent;

      if ((viewPortPlan.strategy == _navigationPlan.INVOKE_LIFECYCLE || viewPortPlan.strategy == _navigationPlan.REPLACE) && prevComponent) {

        var controller = prevComponent.executionContext;

        if (callbackName in controller) {
          list.push(controller);
        }
      }

      if (viewPortPlan.childNavigationContext) {
        findDeactivatable(viewPortPlan.childNavigationContext.plan, callbackName, list);
      } else if (prevComponent) {
        addPreviousDeactivatable(prevComponent, callbackName, list);
      }
    }

    return list;
  }

  function addPreviousDeactivatable(component, callbackName, list) {
    var controller = component.executionContext;

    if (controller.router && controller.router.currentInstruction) {
      var viewPortInstructions = controller.router.currentInstruction.viewPortInstructions;

      for (var viewPortName in viewPortInstructions) {
        var viewPortInstruction = viewPortInstructions[viewPortName];
        var prevComponent = viewPortInstruction.component;
        var prevController = prevComponent.executionContext;

        if (callbackName in prevController) {
          list.push(prevController);
        }

        addPreviousDeactivatable(prevComponent, callbackName, list);
      }
    }
  }

  function processActivatable(navigationContext, callbackName, next, ignoreResult) {
    var infos = findActivatable(navigationContext, callbackName),
        length = infos.length,
        i = -1;

    function inspect(val, router) {
      if (ignoreResult || shouldContinue(val, router)) {
        return iterate();
      } else {
        return next.cancel(val);
      }
    }

    function iterate() {
      i++;

      if (i < length) {
        try {
          var _current$controller;

          var current = infos[i];
          var result = (_current$controller = current.controller)[callbackName].apply(_current$controller, _toConsumableArray(current.lifecycleArgs));
          return _util.processPotential(result, function (val) {
            return inspect(val, current.router);
          }, next.cancel);
        } catch (error) {
          return next.cancel(error);
        }
      } else {
        return next();
      }
    }

    return iterate();
  }

  function findActivatable(navigationContext, callbackName, list, router) {
    var plan = navigationContext.plan;
    var next = navigationContext.nextInstruction;

    list = list || [];

    Object.keys(plan).filter(function (viewPortName) {
      var viewPortPlan = plan[viewPortName];
      var viewPortInstruction = next.viewPortInstructions[viewPortName];
      var controller = viewPortInstruction.component.executionContext;

      if ((viewPortPlan.strategy === _navigationPlan.INVOKE_LIFECYCLE || viewPortPlan.strategy === _navigationPlan.REPLACE) && callbackName in controller) {
        list.push({
          controller: controller,
          lifecycleArgs: viewPortInstruction.lifecycleArgs,
          router: router
        });
      }

      if (viewPortPlan.childNavigationContext) {
        findActivatable(viewPortPlan.childNavigationContext, callbackName, list, controller.router || router);
      }
    });

    return list;
  }

  function shouldContinue(output, router) {
    if (output instanceof Error) {
      return false;
    }

    if (_navigationCommands.isNavigationCommand(output)) {
      if (typeof output.setRouter === 'function') {
        output.setRouter(router);
      }

      return !!output.shouldContinueProcessing;
    }

    if (typeof output === 'string') {
      return affirmations.indexOf(output.toLowerCase()) !== -1;
    }

    if (typeof output === 'undefined') {
      return true;
    }

    return output;
  }
});
define('aurelia-router/pipeline-provider',['exports', 'aurelia-dependency-injection', './pipeline', './navigation-plan', './route-loading', './navigation-context', './activation', './route-filters'], function (exports, _aureliaDependencyInjection, _pipeline, _navigationPlan, _routeLoading, _navigationContext, _activation, _routeFilters) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var PipelineProvider = (function () {
    function PipelineProvider(container) {
      _classCallCheck(this, PipelineProvider);

      this.container = container;
      this.steps = [_navigationPlan.BuildNavigationPlanStep, _activation.CanDeactivatePreviousStep, _routeLoading.LoadRouteStep, _routeFilters.createRouteFilterStep('authorize'), _routeFilters.createRouteFilterStep('modelbind'), _activation.CanActivateNextStep, _activation.DeactivatePreviousStep, _activation.ActivateNextStep, _routeFilters.createRouteFilterStep('precommit'), _navigationContext.CommitChangesStep];
    }

    _createClass(PipelineProvider, [{
      key: 'createPipeline',
      value: function createPipeline(navigationContext) {
        var _this = this;

        var pipeline = new _pipeline.Pipeline();
        this.steps.forEach(function (step) {
          return pipeline.withStep(_this.container.get(step));
        });
        return pipeline;
      }
    }], [{
      key: 'inject',
      value: function inject() {
        return [_aureliaDependencyInjection.Container];
      }
    }]);

    return PipelineProvider;
  })();

  exports.PipelineProvider = PipelineProvider;
});
define('aurelia-router/app-router',['exports', 'core-js', 'aurelia-dependency-injection', 'aurelia-history', './router', './pipeline-provider', './navigation-commands', 'aurelia-event-aggregator'], function (exports, _coreJs, _aureliaDependencyInjection, _aureliaHistory, _router, _pipelineProvider, _navigationCommands, _aureliaEventAggregator) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var AppRouter = (function (_Router) {
    function AppRouter(container, history, pipelineProvider, events) {
      _classCallCheck(this, AppRouter);

      _get(Object.getPrototypeOf(AppRouter.prototype), 'constructor', this).call(this, container, history);
      this.pipelineProvider = pipelineProvider;
      document.addEventListener('click', handleLinkClick.bind(this), true);
      this.events = events;
    }

    _inherits(AppRouter, _Router);

    _createClass(AppRouter, [{
      key: 'isRoot',
      get: function () {
        return true;
      }
    }, {
      key: 'loadUrl',
      value: function loadUrl(url) {
        var _this = this;

        return this.createNavigationInstruction(url).then(function (instruction) {
          return _this.queueInstruction(instruction);
        })['catch'](function (error) {
          console.error(error);

          if (_this.history.previousFragment) {
            _this.navigate(_this.history.previousFragment, false);
          }
        });
      }
    }, {
      key: 'queueInstruction',
      value: function queueInstruction(instruction) {
        var _this2 = this;

        return new Promise(function (resolve) {
          instruction.resolve = resolve;
          _this2.queue.unshift(instruction);
          _this2.dequeueInstruction();
        });
      }
    }, {
      key: 'dequeueInstruction',
      value: function dequeueInstruction() {
        var _this3 = this;

        if (this.isNavigating) {
          return;
        }

        var instruction = this.queue.shift();
        this.queue = [];

        if (!instruction) {
          return;
        }

        this.isNavigating = true;
        this.events.publish('router:navigation:processing', instruction);

        var context = this.createNavigationContext(instruction);
        var pipeline = this.pipelineProvider.createPipeline(context);

        pipeline.run(context).then(function (result) {
          _this3.isNavigating = false;

          if (!(result && 'completed' in result && 'output' in result)) {
            throw new Error('Expected router pipeline to return a navigation result, but got [' + JSON.stringify(result) + '] instead.');
          }

          if (result.completed) {
            _this3.history.previousFragment = instruction.fragment;
          }

          if (result.output instanceof Error) {
            console.error(result.output);
            _this3.events.publish('router:navigation:error', { instruction: instruction, result: result });
          }

          if (_navigationCommands.isNavigationCommand(result.output)) {
            result.output.navigate(_this3);
          } else if (!result.completed) {
            _this3.navigate(_this3.history.previousFragment || '', false);
            _this3.events.publish('router:navigation:cancelled', instruction);
          }

          instruction.resolve(result);
          _this3.dequeueInstruction();
        }).then(function (result) {
          return _this3.events.publish('router:navigation:complete', instruction);
        })['catch'](function (error) {
          console.error(error);
        });
      }
    }, {
      key: 'registerViewPort',
      value: function registerViewPort(viewPort, name) {
        var _this4 = this;

        _get(Object.getPrototypeOf(AppRouter.prototype), 'registerViewPort', this).call(this, viewPort, name);

        if (!this.isActive) {
          if ('configureRouter' in this.container.viewModel) {
            var result = this.container.viewModel.configureRouter() || Promise.resolve();
            return result.then(function () {
              return _this4.activate();
            });
          } else {
            this.activate();
          }
        } else {
          this.dequeueInstruction();
        }
      }
    }, {
      key: 'activate',
      value: function activate(options) {
        if (this.isActive) {
          return;
        }

        this.isActive = true;
        this.options = Object.assign({ routeHandler: this.loadUrl.bind(this) }, this.options, options);
        this.history.activate(this.options);
        this.dequeueInstruction();
      }
    }, {
      key: 'deactivate',
      value: function deactivate() {
        this.isActive = false;
        this.history.deactivate();
      }
    }, {
      key: 'reset',
      value: function reset() {
        _get(Object.getPrototypeOf(AppRouter.prototype), 'reset', this).call(this);
        this.queue = [];
        this.options = null;
      }
    }], [{
      key: 'inject',
      value: function inject() {
        return [_aureliaDependencyInjection.Container, _aureliaHistory.History, _pipelineProvider.PipelineProvider, _aureliaEventAggregator.EventAggregator];
      }
    }]);

    return AppRouter;
  })(_router.Router);

  exports.AppRouter = AppRouter;

  function findAnchor(el) {
    while (el) {
      if (el.tagName === 'A') {
        return el;
      }el = el.parentNode;
    }
  }

  function handleLinkClick(evt) {
    if (!this.isActive) {
      return;
    }

    var target = findAnchor(evt.target);
    if (!target) {
      return;
    }

    if (this.history._hasPushState) {
      if (!evt.altKey && !evt.ctrlKey && !evt.metaKey && !evt.shiftKey && targetIsThisWindow(target)) {
        var href = target.getAttribute('href');

        if (href !== null && !(href.charAt(0) === '#' || /^[a-z]+:/i.test(href))) {
          evt.preventDefault();
          this.history.navigate(href);
        }
      }
    }
  }

  function targetIsThisWindow(target) {
    var targetWindow = target.getAttribute('target');

    return !targetWindow || targetWindow === window.name || targetWindow === '_self' || targetWindow === 'top' && window === window.top;
  }
});
define('aurelia-router/index',['exports', './router', './app-router', './pipeline-provider', './navigation-commands', './route-loading', './router-configuration', './navigation-plan', './route-filters'], function (exports, _router, _appRouter, _pipelineProvider, _navigationCommands, _routeLoading, _routerConfiguration, _navigationPlan, _routeFilters) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, 'Router', {
    enumerable: true,
    get: function get() {
      return _router.Router;
    }
  });
  Object.defineProperty(exports, 'AppRouter', {
    enumerable: true,
    get: function get() {
      return _appRouter.AppRouter;
    }
  });
  Object.defineProperty(exports, 'PipelineProvider', {
    enumerable: true,
    get: function get() {
      return _pipelineProvider.PipelineProvider;
    }
  });
  Object.defineProperty(exports, 'Redirect', {
    enumerable: true,
    get: function get() {
      return _navigationCommands.Redirect;
    }
  });
  Object.defineProperty(exports, 'RouteLoader', {
    enumerable: true,
    get: function get() {
      return _routeLoading.RouteLoader;
    }
  });
  Object.defineProperty(exports, 'RouterConfiguration', {
    enumerable: true,
    get: function get() {
      return _routerConfiguration.RouterConfiguration;
    }
  });
  Object.defineProperty(exports, 'NO_CHANGE', {
    enumerable: true,
    get: function get() {
      return _navigationPlan.NO_CHANGE;
    }
  });
  Object.defineProperty(exports, 'INVOKE_LIFECYCLE', {
    enumerable: true,
    get: function get() {
      return _navigationPlan.INVOKE_LIFECYCLE;
    }
  });
  Object.defineProperty(exports, 'REPLACE', {
    enumerable: true,
    get: function get() {
      return _navigationPlan.REPLACE;
    }
  });
  Object.defineProperty(exports, 'RouteFilterContainer', {
    enumerable: true,
    get: function get() {
      return _routeFilters.RouteFilterContainer;
    }
  });
  Object.defineProperty(exports, 'createRouteFilterStep', {
    enumerable: true,
    get: function get() {
      return _routeFilters.createRouteFilterStep;
    }
  });
});
define('aurelia-router', ['aurelia-router/index'], function (main) { return main; });

define('aurelia-templating-binding/syntax-interpreter',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var SyntaxInterpreter = (function () {
    function SyntaxInterpreter(parser, observerLocator, eventManager) {
      _classCallCheck(this, SyntaxInterpreter);

      this.parser = parser;
      this.observerLocator = observerLocator;
      this.eventManager = eventManager;
    }

    _createClass(SyntaxInterpreter, [{
      key: 'interpret',
      value: function interpret(resources, element, info, existingInstruction) {
        if (info.command in this) {
          return this[info.command](resources, element, info, existingInstruction);
        }

        return this.handleUnknownCommand(resources, element, info, existingInstruction);
      }
    }, {
      key: 'handleUnknownCommand',
      value: function handleUnknownCommand(resources, element, info, existingInstruction) {
        var attrName = info.attrName,
            command = info.command;

        var instruction = this.options(resources, element, info, existingInstruction);

        instruction.alteredAttr = true;
        instruction.attrName = 'global-behavior';
        instruction.attributes.aureliaAttrName = attrName;
        instruction.attributes.aureliaCommand = command;

        return instruction;
      }
    }, {
      key: 'determineDefaultBindingMode',
      value: function determineDefaultBindingMode(element, attrName) {
        var tagName = element.tagName.toLowerCase();

        if (tagName === 'input') {
          return attrName === 'value' || attrName === 'checked' ? _aureliaBinding.TWO_WAY : _aureliaBinding.ONE_WAY;
        } else if (tagName == 'textarea' || tagName == 'select') {
          return attrName == 'value' ? _aureliaBinding.TWO_WAY : _aureliaBinding.ONE_WAY;
        } else if (attrName === 'textcontent' || attrName === 'innerhtml') {
          return element.contentEditable === 'true' ? _aureliaBinding.TWO_WAY : _aureliaBinding.ONE_WAY;
        }

        return _aureliaBinding.ONE_WAY;
      }
    }, {
      key: 'bind',
      value: function bind(resources, element, info, existingInstruction) {
        var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

        instruction.attributes[info.attrName] = new _aureliaBinding.BindingExpression(this.observerLocator, this.attributeMap[info.attrName] || info.attrName, this.parser.parse(info.attrValue), info.defaultBindingMode || this.determineDefaultBindingMode(element, info.attrName), resources.valueConverterLookupFunction);

        return instruction;
      }
    }, {
      key: 'trigger',
      value: function trigger(resources, element, info) {
        return new _aureliaBinding.ListenerExpression(this.eventManager, info.attrName, this.parser.parse(info.attrValue), false, true);
      }
    }, {
      key: 'delegate',
      value: function delegate(resources, element, info) {
        return new _aureliaBinding.ListenerExpression(this.eventManager, info.attrName, this.parser.parse(info.attrValue), true, true);
      }
    }, {
      key: 'call',
      value: function call(resources, element, info, existingInstruction) {
        var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

        instruction.attributes[info.attrName] = new _aureliaBinding.CallExpression(this.observerLocator, info.attrName, this.parser.parse(info.attrValue), resources.valueConverterLookupFunction);

        return instruction;
      }
    }, {
      key: 'options',
      value: function options(resources, element, info, existingInstruction) {
        var instruction = existingInstruction || { attrName: info.attrName, attributes: {} },
            attrValue = info.attrValue,
            language = this.language,
            name = null,
            target = '',
            current,
            i,
            ii;

        for (i = 0, ii = attrValue.length; i < ii; ++i) {
          current = attrValue[i];

          if (current === ';') {
            info = language.inspectAttribute(resources, name, target.trim());
            language.createAttributeInstruction(resources, element, info, instruction);

            if (!instruction.attributes[info.attrName]) {
              instruction.attributes[info.attrName] = info.attrValue;
            }

            target = '';
            name = null;
          } else if (current === ':' && name === null) {
            name = target.trim();
            target = '';
          } else {
            target += current;
          }
        }

        if (name !== null) {
          info = language.inspectAttribute(resources, name, target.trim());
          language.createAttributeInstruction(resources, element, info, instruction);

          if (!instruction.attributes[info.attrName]) {
            instruction.attributes[info.attrName] = info.attrValue;
          }
        }

        return instruction;
      }
    }], [{
      key: 'inject',
      value: function inject() {
        return [_aureliaBinding.Parser, _aureliaBinding.ObserverLocator, _aureliaBinding.EventManager];
      }
    }]);

    return SyntaxInterpreter;
  })();

  exports.SyntaxInterpreter = SyntaxInterpreter;

  SyntaxInterpreter.prototype['for'] = function (resources, element, info, existingInstruction) {
    var parts = info.attrValue.split(' of ');

    if (parts.length !== 2) {
      throw new Error('Incorrect syntax for "for". The form is: "$local of $items".');
    }

    var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

    if (parts[0].match(/[[].+[,]\s.+[\]]/)) {
      var firstPart = parts[0];
      parts[0] = firstPart.substr(1, firstPart.indexOf(',') - 1);
      parts.splice(1, 0, firstPart.substring(firstPart.indexOf(', ') + 2, firstPart.length - 1));
      instruction.attributes.key = parts[0];
      instruction.attributes.value = parts[1];
    } else {
      instruction.attributes.local = parts[0];
    }

    instruction.attributes.items = new _aureliaBinding.BindingExpression(this.observerLocator, 'items', this.parser.parse(parts[parts.length - 1]), _aureliaBinding.ONE_WAY, resources.valueConverterLookupFunction);

    return instruction;
  };

  SyntaxInterpreter.prototype['two-way'] = function (resources, element, info, existingInstruction) {
    var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

    instruction.attributes[info.attrName] = new _aureliaBinding.BindingExpression(this.observerLocator, info.attrName, this.parser.parse(info.attrValue), _aureliaBinding.TWO_WAY, resources.valueConverterLookupFunction);

    return instruction;
  };

  SyntaxInterpreter.prototype['one-way'] = function (resources, element, info, existingInstruction) {
    var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

    instruction.attributes[info.attrName] = new _aureliaBinding.BindingExpression(this.observerLocator, this.attributeMap[info.attrName] || info.attrName, this.parser.parse(info.attrValue), _aureliaBinding.ONE_WAY, resources.valueConverterLookupFunction);

    return instruction;
  };

  SyntaxInterpreter.prototype['one-time'] = function (resources, element, info, existingInstruction) {
    var instruction = existingInstruction || { attrName: info.attrName, attributes: {} };

    instruction.attributes[info.attrName] = new _aureliaBinding.BindingExpression(this.observerLocator, this.attributeMap[info.attrName] || info.attrName, this.parser.parse(info.attrValue), _aureliaBinding.ONE_TIME, resources.valueConverterLookupFunction);

    return instruction;
  };

  SyntaxInterpreter.prototype['view-model'] = function (resources, element, info) {
    return new _aureliaBinding.NameExpression(info.attrValue, 'view-model');
  };
});
define('aurelia-templating-binding/binding-language',['exports', 'aurelia-templating', 'aurelia-binding', './syntax-interpreter', 'aurelia-logging'], function (exports, _aureliaTemplating, _aureliaBinding, _syntaxInterpreter, _aureliaLogging) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var info = {},
      logger = _aureliaLogging.getLogger('templating-binding');

  var TemplatingBindingLanguage = (function (_BindingLanguage) {
    function TemplatingBindingLanguage(parser, observerLocator, syntaxInterpreter) {
      _classCallCheck(this, TemplatingBindingLanguage);

      _get(Object.getPrototypeOf(TemplatingBindingLanguage.prototype), 'constructor', this).call(this);
      this.parser = parser;
      this.observerLocator = observerLocator;
      this.syntaxInterpreter = syntaxInterpreter;
      this.emptyStringExpression = this.parser.parse('\'\'');
      syntaxInterpreter.language = this;
      this.attributeMap = syntaxInterpreter.attributeMap = {
        'class': 'className',
        'for': 'htmlFor',
        tabindex: 'tabIndex',
        textcontent: 'textContent',
        innerhtml: 'innerHTML',
        maxlength: 'maxLength',
        minlength: 'minLength',
        formaction: 'formAction',
        formenctype: 'formEncType',
        formmethod: 'formMethod',
        formnovalidate: 'formNoValidate',
        formtarget: 'formTarget' };
    }

    _inherits(TemplatingBindingLanguage, _BindingLanguage);

    _createClass(TemplatingBindingLanguage, [{
      key: 'inspectAttribute',
      value: function inspectAttribute(resources, attrName, attrValue) {
        var parts = attrName.split('.');

        info.defaultBindingMode = null;

        if (parts.length == 2) {
          info.attrName = parts[0].trim();
          info.attrValue = attrValue;
          info.command = parts[1].trim();
          info.expression = null;
        } else if (attrName == 'ref') {
          info.attrName = attrName;
          info.attrValue = attrValue;
          info.command = null;
          info.expression = new _aureliaBinding.NameExpression(attrValue, 'element');
        } else {
          info.attrName = attrName;
          info.attrValue = attrValue;
          info.command = null;
          info.expression = this.parseContent(resources, attrName, attrValue);
        }

        return info;
      }
    }, {
      key: 'createAttributeInstruction',
      value: function createAttributeInstruction(resources, element, info, existingInstruction) {
        var instruction;

        if (info.expression) {
          if (info.attrName === 'ref') {
            return info.expression;
          }

          instruction = existingInstruction || { attrName: info.attrName, attributes: {} };
          instruction.attributes[info.attrName] = info.expression;
        } else if (info.command) {
          instruction = this.syntaxInterpreter.interpret(resources, element, info, existingInstruction);
        }

        return instruction;
      }
    }, {
      key: 'parseText',
      value: function parseText(resources, value) {
        return this.parseContent(resources, 'textContent', value);
      }
    }, {
      key: 'parseContent',
      value: function parseContent(resources, attrName, attrValue) {
        var i = attrValue.indexOf('${', 0),
            ii = attrValue.length,
            char,
            pos = 0,
            open = 0,
            quote = null,
            interpolationStart,
            parts,
            partIndex = 0;
        while (i >= 0 && i < ii - 2) {
          open = 1;
          interpolationStart = i;
          i += 2;

          do {
            char = attrValue[i];
            i++;
            switch (char) {
              case '\'':
              case '"':
                if (quote === null) {
                  quote = char;
                } else if (quote === char) {
                  quote = null;
                }
                continue;
              case '\\':
                i++;
                continue;
            }

            if (quote !== null) {
              continue;
            }

            if (char === '{') {
              open++;
            } else if (char === '}') {
              open--;
            }
          } while (open > 0 && i < ii);

          if (open === 0) {
            parts = parts || [];
            if (attrValue[interpolationStart - 1] === '\\' && attrValue[interpolationStart - 2] !== '\\') {
              parts[partIndex] = attrValue.substring(pos, interpolationStart - 1) + attrValue.substring(interpolationStart, i);
              partIndex++;
              parts[partIndex] = this.emptyStringExpression;
              partIndex++;
            } else {
              parts[partIndex] = attrValue.substring(pos, interpolationStart);
              partIndex++;
              parts[partIndex] = this.parser.parse(attrValue.substring(interpolationStart + 2, i - 1));
              partIndex++;
            }
            pos = i;
            i = attrValue.indexOf('${', i);
          } else {
            break;
          }
        }

        if (partIndex === 0) {
          return null;
        }

        parts[partIndex] = attrValue.substr(pos);

        return new InterpolationBindingExpression(this.observerLocator, this.attributeMap[attrName] || attrName, parts, _aureliaBinding.ONE_WAY, resources.valueConverterLookupFunction, attrName);
      }
    }], [{
      key: 'inject',
      value: function inject() {
        return [_aureliaBinding.Parser, _aureliaBinding.ObserverLocator, _syntaxInterpreter.SyntaxInterpreter];
      }
    }]);

    return TemplatingBindingLanguage;
  })(_aureliaTemplating.BindingLanguage);

  exports.TemplatingBindingLanguage = TemplatingBindingLanguage;

  var InterpolationBindingExpression = (function () {
    function InterpolationBindingExpression(observerLocator, targetProperty, parts, mode, valueConverterLookupFunction, attribute) {
      _classCallCheck(this, InterpolationBindingExpression);

      this.observerLocator = observerLocator;
      this.targetProperty = targetProperty;
      this.parts = parts;
      this.mode = mode;
      this.valueConverterLookupFunction = valueConverterLookupFunction;
      this.attribute = attribute;
      this.discrete = false;
    }

    _createClass(InterpolationBindingExpression, [{
      key: 'createBinding',
      value: function createBinding(target) {
        return new InterpolationBinding(this.observerLocator, this.parts, target, this.targetProperty, this.mode, this.valueConverterLookupFunction);
      }
    }]);

    return InterpolationBindingExpression;
  })();

  exports.InterpolationBindingExpression = InterpolationBindingExpression;

  var InterpolationBinding = (function () {
    function InterpolationBinding(observerLocator, parts, target, targetProperty, mode, valueConverterLookupFunction) {
      _classCallCheck(this, InterpolationBinding);

      if (targetProperty === 'style') {
        logger.info('Internet Explorer does not support interpolation in "style" attributes.  Use the style attribute\'s alias, "css" instead.');
      } else if (target.parentElement && target.parentElement.nodeName === 'TEXTAREA' && targetProperty === 'textContent') {
        throw new Error('Interpolation binding cannot be used in the content of a textarea element.  Use <textarea value.bind="expression"></textarea> instead.');
      }
      this.observerLocator = observerLocator;
      this.parts = parts;
      this.targetProperty = observerLocator.getObserver(target, targetProperty);
      this.mode = mode;
      this.valueConverterLookupFunction = valueConverterLookupFunction;
      this.toDispose = [];
    }

    _createClass(InterpolationBinding, [{
      key: 'getObserver',
      value: function getObserver(obj, propertyName) {
        return this.observerLocator.getObserver(obj, propertyName);
      }
    }, {
      key: 'bind',
      value: function bind(source) {
        this.source = source;

        if (this.mode == _aureliaBinding.ONE_WAY) {
          this.unbind();
          this.connect();
          this.setValue();
        } else {
          this.setValue();
        }
      }
    }, {
      key: 'setValue',
      value: function setValue() {
        var value = this.interpolate();
        this.targetProperty.setValue(value);
      }
    }, {
      key: 'connect',
      value: function connect() {
        var _this = this;

        var info,
            parts = this.parts,
            source = this.source,
            toDispose = this.toDispose = [],
            i,
            ii;

        for (i = 0, ii = parts.length; i < ii; ++i) {
          if (i % 2 === 0) {} else {
            info = parts[i].connect(this, source);
            if (info.observer) {
              toDispose.push(info.observer.subscribe(function (newValue) {
                _this.setValue();
              }));
            }
          }
        }
      }
    }, {
      key: 'interpolate',
      value: function interpolate() {
        var value = '',
            parts = this.parts,
            source = this.source,
            valueConverterLookupFunction = this.valueConverterLookupFunction,
            i,
            ii,
            temp;

        for (i = 0, ii = parts.length; i < ii; ++i) {
          if (i % 2 === 0) {
            value += parts[i];
          } else {
            temp = parts[i].evaluate(source, valueConverterLookupFunction);
            value += typeof temp !== 'undefined' && temp !== null ? temp.toString() : '';
          }
        }

        return value;
      }
    }, {
      key: 'unbind',
      value: function unbind() {
        var i,
            ii,
            toDispose = this.toDispose;

        if (toDispose) {
          for (i = 0, ii = toDispose.length; i < ii; ++i) {
            toDispose[i]();
          }
        }

        this.toDispose = null;
      }
    }]);

    return InterpolationBinding;
  })();
});
define('aurelia-templating-binding/index',['exports', 'aurelia-templating', './binding-language', './syntax-interpreter'], function (exports, _aureliaTemplating, _bindingLanguage, _syntaxInterpreter) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function install(aurelia) {
    var instance,
        getInstance = function getInstance(c) {
      return instance || (instance = c.invoke(_bindingLanguage.TemplatingBindingLanguage));
    };

    if (aurelia.container.hasHandler(_bindingLanguage.TemplatingBindingLanguage)) {
      instance = aurelia.container.get(_bindingLanguage.TemplatingBindingLanguage);
    } else {
      aurelia.container.registerHandler(_bindingLanguage.TemplatingBindingLanguage, getInstance);
    }

    aurelia.container.registerHandler(_aureliaTemplating.BindingLanguage, getInstance);
  }

  exports.TemplatingBindingLanguage = _bindingLanguage.TemplatingBindingLanguage;
  exports.SyntaxInterpreter = _syntaxInterpreter.SyntaxInterpreter;
  exports.install = install;
});
define('aurelia-templating-binding', ['aurelia-templating-binding/index'], function (main) { return main; });

define('aurelia-templating-resources/compose',['exports', 'aurelia-dependency-injection', 'aurelia-templating'], function (exports, _aureliaDependencyInjection, _aureliaTemplating) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var Compose = (function () {
    function Compose(container, compositionEngine, viewSlot, viewResources) {
      _classCallCheck(this, _Compose);

      this.container = container;
      this.compositionEngine = compositionEngine;
      this.viewSlot = viewSlot;
      this.viewResources = viewResources;
    }

    var _Compose = Compose;

    _createClass(_Compose, [{
      key: 'bind',
      value: function bind(executionContext) {
        this.executionContext = executionContext;
        processInstruction(this, { view: this.view, viewModel: this.viewModel, model: this.model });
      }
    }, {
      key: 'modelChanged',
      value: function modelChanged(newValue, oldValue) {
        var vm = this.currentViewModel;

        if (vm && typeof vm.activate === 'function') {
          vm.activate(newValue);
        }
      }
    }, {
      key: 'viewChanged',
      value: function viewChanged(newValue, oldValue) {
        processInstruction(this, { view: newValue, viewModel: this.currentViewModel || this.viewModel, model: this.model });
      }
    }, {
      key: 'viewModelChanged',
      value: function viewModelChanged(newValue, oldValue) {
        processInstruction(this, { viewModel: newValue, view: this.view, model: this.model });
      }
    }]);

    Compose = _aureliaDependencyInjection.inject(_aureliaDependencyInjection.Container, _aureliaTemplating.CompositionEngine, _aureliaTemplating.ViewSlot, _aureliaTemplating.ViewResources)(Compose) || Compose;
    Compose = _aureliaTemplating.noView(Compose) || Compose;
    Compose = _aureliaTemplating.bindable('viewModel')(Compose) || Compose;
    Compose = _aureliaTemplating.bindable('view')(Compose) || Compose;
    Compose = _aureliaTemplating.bindable('model')(Compose) || Compose;
    Compose = _aureliaTemplating.customElement('compose')(Compose) || Compose;
    return Compose;
  })();

  exports.Compose = Compose;

  function processInstruction(composer, instruction) {
    composer.compositionEngine.compose(Object.assign(instruction, {
      executionContext: composer.executionContext,
      container: composer.container,
      viewSlot: composer.viewSlot,
      viewResources: composer.viewResources,
      currentBehavior: composer.currentBehavior
    })).then(function (next) {
      composer.currentBehavior = next;
      composer.currentViewModel = next ? next.executionContext : null;
    });
  }
});
define('aurelia-templating-resources/if',['exports', 'aurelia-templating', 'aurelia-dependency-injection'], function (exports, _aureliaTemplating, _aureliaDependencyInjection) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var If = (function () {
    function If(viewFactory, viewSlot) {
      _classCallCheck(this, _If);

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.showing = false;
    }

    var _If = If;

    _createClass(_If, [{
      key: 'valueChanged',
      value: function valueChanged(newValue) {
        if (!newValue) {
          if (this.view) {
            this.viewSlot.remove(this.view);
            this.view.unbind();
          }

          this.showing = false;
          return;
        }

        if (!this.view) {
          this.view = this.viewFactory.create();
        }

        if (!this.showing) {
          this.showing = true;

          if (!this.view.bound) {
            this.view.bind();
          }

          this.viewSlot.add(this.view);
        }
      }
    }]);

    If = _aureliaDependencyInjection.inject(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot)(If) || If;
    If = _aureliaTemplating.templateController(If) || If;
    If = _aureliaTemplating.customAttribute('if')(If) || If;
    return If;
  })();

  exports.If = If;
});
define('aurelia-templating-resources/with',['exports', 'aurelia-dependency-injection', 'aurelia-templating'], function (exports, _aureliaDependencyInjection, _aureliaTemplating) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var With = (function () {
    function With(viewFactory, viewSlot) {
      _classCallCheck(this, _With);

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
    }

    var _With = With;

    _createClass(_With, [{
      key: 'valueChanged',
      value: function valueChanged(newValue) {
        if (!this.view) {
          this.view = this.viewFactory.create(newValue);
          this.viewSlot.add(this.view);
        } else {
          this.view.bind(newValue);
        }
      }
    }]);

    With = _aureliaDependencyInjection.inject(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot)(With) || With;
    With = _aureliaTemplating.templateController(With) || With;
    With = _aureliaTemplating.customAttribute('with')(With) || With;
    return With;
  })();

  exports.With = With;
});
define('aurelia-templating-resources/repeat',['exports', 'aurelia-dependency-injection', 'aurelia-binding', 'aurelia-templating'], function (exports, _aureliaDependencyInjection, _aureliaBinding, _aureliaTemplating) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var Repeat = (function () {
    function Repeat(viewFactory, viewSlot, observerLocator) {
      _classCallCheck(this, _Repeat);

      this.viewFactory = viewFactory;
      this.viewSlot = viewSlot;
      this.observerLocator = observerLocator;
      this.local = 'item';
      this.key = 'key';
      this.value = 'value';
    }

    var _Repeat = Repeat;

    _createClass(_Repeat, [{
      key: 'bind',
      value: function bind(executionContext) {
        var _this = this;

        var items = this.items,
            observer;

        this.executionContext = executionContext;

        if (!items) {
          if (this.oldItems) {
            this.viewSlot.removeAll();
          }

          return;
        }

        if (this.oldItems === items) {
          if (items instanceof Map) {
            var records = _aureliaBinding.getChangeRecords(items);
            observer = this.observerLocator.getMapObserver(items);

            this.handleMapChangeRecords(items, records);

            this.disposeSubscription = observer.subscribe(function (records) {
              _this.handleMapChangeRecords(items, records);
            });
          } else {
            var splices = _aureliaBinding.calcSplices(items, 0, items.length, this.lastBoundItems, 0, this.lastBoundItems.length);
            observer = this.observerLocator.getArrayObserver(items);

            this.handleSplices(items, splices);
            this.lastBoundItems = this.oldItems = null;

            this.disposeSubscription = observer.subscribe(function (splices) {
              _this.handleSplices(items, splices);
            });
          }
        } else {
          this.processItems();
        }
      }
    }, {
      key: 'unbind',
      value: function unbind() {
        this.oldItems = this.items;

        if (this.items instanceof Array) {
          this.lastBoundItems = this.items.slice(0);
        }

        if (this.disposeSubscription) {
          this.disposeSubscription();
          this.disposeSubscription = null;
        }
      }
    }, {
      key: 'itemsChanged',
      value: function itemsChanged() {
        this.processItems();
      }
    }, {
      key: 'processItems',
      value: function processItems() {
        var items = this.items,
            viewSlot = this.viewSlot;

        if (this.disposeSubscription) {
          this.disposeSubscription();
          viewSlot.removeAll();
        }

        if (!items) {
          return;
        }

        if (items instanceof Map) {
          this.processMapEntries(items);
        } else {
          this.processArrayItems(items);
        }
      }
    }, {
      key: 'processArrayItems',
      value: function processArrayItems(items) {
        var _this2 = this;

        var viewFactory = this.viewFactory,
            viewSlot = this.viewSlot,
            i,
            ii,
            row,
            view,
            observer;

        observer = this.observerLocator.getArrayObserver(items);

        for (i = 0, ii = items.length; i < ii; ++i) {
          row = this.createFullExecutionContext(items[i], i, ii);
          view = viewFactory.create(row);
          viewSlot.add(view);
        }

        this.disposeSubscription = observer.subscribe(function (splices) {
          _this2.handleSplices(items, splices);
        });
      }
    }, {
      key: 'processMapEntries',
      value: function processMapEntries(items) {
        var _this3 = this;

        var viewFactory = this.viewFactory,
            viewSlot = this.viewSlot,
            index = 0,
            row,
            view,
            observer;

        observer = this.observerLocator.getMapObserver(items);

        items.forEach(function (value, key) {
          row = _this3.createFullExecutionKvpContext(key, value, index, items.size);
          view = viewFactory.create(row);
          viewSlot.add(view);
          ++index;
        });

        this.disposeSubscription = observer.subscribe(function (record) {
          _this3.handleMapChangeRecords(items, record);
        });
      }
    }, {
      key: 'createBaseExecutionContext',
      value: function createBaseExecutionContext(data) {
        var context = {};
        context[this.local] = data;
        context.$parent = this.executionContext;
        return context;
      }
    }, {
      key: 'createBaseExecutionKvpContext',
      value: function createBaseExecutionKvpContext(key, value) {
        var context = {};
        context[this.key] = key;
        context[this.value] = value;
        context.$parent = this.executionContext;
        return context;
      }
    }, {
      key: 'createFullExecutionContext',
      value: function createFullExecutionContext(data, index, length) {
        var context = this.createBaseExecutionContext(data);
        return this.updateExecutionContext(context, index, length);
      }
    }, {
      key: 'createFullExecutionKvpContext',
      value: function createFullExecutionKvpContext(key, value, index, length) {
        var context = this.createBaseExecutionKvpContext(key, value);
        return this.updateExecutionContext(context, index, length);
      }
    }, {
      key: 'updateExecutionContext',
      value: function updateExecutionContext(context, index, length) {
        var first = index === 0,
            last = index === length - 1,
            even = index % 2 === 0;

        context.$index = index;
        context.$first = first;
        context.$last = last;
        context.$middle = !(first || last);
        context.$odd = !even;
        context.$even = even;

        return context;
      }
    }, {
      key: 'handleSplices',
      value: function handleSplices(array, splices) {
        var viewSlot = this.viewSlot,
            spliceIndexLow = splices[0].index,
            view,
            i,
            ii,
            j,
            jj,
            row,
            splice,
            addIndex,
            end,
            itemsLeftToAdd,
            removed,
            model,
            children,
            length;

        for (i = 0, ii = splices.length; i < ii; ++i) {
          splice = splices[i];
          addIndex = splice.index;
          itemsLeftToAdd = splice.addedCount;
          end = splice.index + splice.addedCount;
          removed = splice.removed;
          if (spliceIndexLow > splice.index) {
            spliceIndexLow = splice.index;
          }

          for (j = 0, jj = removed.length; j < jj; ++j) {
            if (itemsLeftToAdd > 0) {
              view = viewSlot.children[splice.index + j];
              view.executionContext[this.local] = array[addIndex + j];
              --itemsLeftToAdd;
            } else {
              view = viewSlot.removeAt(addIndex + splice.addedCount);
            }
          }

          addIndex += removed.length;

          for (; 0 < itemsLeftToAdd; ++addIndex) {
            model = array[addIndex];
            row = this.createBaseExecutionContext(model);
            view = this.viewFactory.create(row);
            viewSlot.insert(addIndex, view);
            --itemsLeftToAdd;
          }
        }

        children = this.viewSlot.children;
        length = children.length;

        if (spliceIndexLow > 0) {
          spliceIndexLow = spliceIndexLow - 1;
        }

        for (; spliceIndexLow < length; ++spliceIndexLow) {
          this.updateExecutionContext(children[spliceIndexLow].executionContext, spliceIndexLow, length);
        }
      }
    }, {
      key: 'handleMapChangeRecords',
      value: function handleMapChangeRecords(map, records) {
        var viewSlot = this.viewSlot,
            key,
            i,
            ii,
            view,
            children,
            length,
            row,
            removeIndex,
            record;

        for (i = 0, ii = records.length; i < ii; ++i) {
          record = records[i];
          key = record.key;
          switch (record.type) {
            case 'update':
              removeIndex = this.getViewIndexByKey(key);
              viewSlot.removeAt(removeIndex);
              row = this.createBaseExecutionKvpContext(key, map.get(key));
              view = this.viewFactory.create(row);
              viewSlot.insert(removeIndex, view);
              break;
            case 'add':
              row = this.createBaseExecutionKvpContext(key, map.get(key));
              view = this.viewFactory.create(row);
              viewSlot.insert(map.size, view);
              break;
            case 'delete':
              if (!record.oldValue) {
                return;
              }
              removeIndex = this.getViewIndexByKey(key);
              viewSlot.removeAt(removeIndex);
              break;
            case 'clear':
              viewSlot.removeAll();
          }
        }

        children = viewSlot.children;
        length = children.length;

        for (i = 0; i < length; i++) {
          this.updateExecutionContext(children[i].executionContext, i, length);
        }
      }
    }, {
      key: 'getViewIndexByKey',
      value: function getViewIndexByKey(key) {
        var viewSlot = this.viewSlot,
            i,
            ii,
            child;

        for (i = 0, ii = viewSlot.children.length; i < ii; ++i) {
          child = viewSlot.children[i];
          if (child.bindings[0].source[this.key] === key) {
            return i;
          }
        }
      }
    }]);

    Repeat = _aureliaDependencyInjection.inject(_aureliaTemplating.BoundViewFactory, _aureliaTemplating.ViewSlot, _aureliaBinding.ObserverLocator)(Repeat) || Repeat;
    Repeat = _aureliaTemplating.templateController(Repeat) || Repeat;
    Repeat = _aureliaTemplating.bindable('key')(Repeat) || Repeat;
    Repeat = _aureliaTemplating.bindable('local')(Repeat) || Repeat;
    Repeat = _aureliaTemplating.bindable('items')(Repeat) || Repeat;
    Repeat = _aureliaTemplating.customAttribute('repeat')(Repeat) || Repeat;
    return Repeat;
  })();

  exports.Repeat = Repeat;
});
define('aurelia-templating-resources/show',['exports', 'aurelia-dependency-injection', 'aurelia-templating'], function (exports, _aureliaDependencyInjection, _aureliaTemplating) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function addStyleString(str) {
    var node = document.createElement('style');
    node.innerHTML = str;
    node.type = 'text/css';
    document.head.appendChild(node);
  }

  addStyleString('.aurelia-hide { display:none !important; }');

  var Show = (function () {
    function Show(element) {
      _classCallCheck(this, _Show);

      this.element = element;
    }

    var _Show = Show;

    _createClass(_Show, [{
      key: 'valueChanged',
      value: function valueChanged(newValue) {
        if (newValue) {
          this.element.classList.remove('aurelia-hide');
        } else {
          this.element.classList.add('aurelia-hide');
        }
      }
    }]);

    Show = _aureliaDependencyInjection.inject(Element)(Show) || Show;
    Show = _aureliaTemplating.customAttribute('show')(Show) || Show;
    return Show;
  })();

  exports.Show = Show;
});
define('aurelia-templating-resources/global-behavior',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-logging'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaLogging) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var GlobalBehavior = (function () {
    function GlobalBehavior(element) {
      _classCallCheck(this, _GlobalBehavior);

      this.element = element;
    }

    var _GlobalBehavior = GlobalBehavior;

    _createClass(_GlobalBehavior, [{
      key: 'bind',
      value: function bind() {
        var handler = GlobalBehavior.handlers[this.aureliaAttrName];

        if (!handler) {
          throw new Error('Conventional binding handler not found for ' + this.aureliaAttrName + '.');
        }

        try {
          this.handler = handler.bind(this, this.element, this.aureliaCommand) || handler;
        } catch (error) {
          throw _aureliaLogging.AggregateError('Conventional binding handler failed.', error);
        }
      }
    }, {
      key: 'attached',
      value: function attached() {
        if (this.handler && 'attached' in this.handler) {
          this.handler.attached(this, this.element);
        }
      }
    }, {
      key: 'detached',
      value: function detached() {
        if (this.handler && 'detached' in this.handler) {
          this.handler.detached(this, this.element);
        }
      }
    }, {
      key: 'unbind',
      value: function unbind() {
        if (this.handler && 'unbind' in this.handler) {
          this.handler.unbind(this, this.element);
        }

        this.handler = null;
      }
    }]);

    GlobalBehavior = _aureliaDependencyInjection.inject(Element)(GlobalBehavior) || GlobalBehavior;
    GlobalBehavior = _aureliaTemplating.dynamicOptions(GlobalBehavior) || GlobalBehavior;
    GlobalBehavior = _aureliaTemplating.customAttribute('global-behavior')(GlobalBehavior) || GlobalBehavior;
    return GlobalBehavior;
  })();

  exports.GlobalBehavior = GlobalBehavior;

  GlobalBehavior.createSettingsFromBehavior = function (behavior) {
    var settings = {};

    for (var key in behavior) {
      if (key === 'aureliaAttrName' || key === 'aureliaCommand' || !behavior.hasOwnProperty(key)) {
        continue;
      }

      settings[key] = behavior[key];
    }

    return settings;
  };

  GlobalBehavior.jQueryPlugins = {};

  GlobalBehavior.handlers = {
    jquery: {
      bind: function bind(behavior, element, command) {
        var settings = GlobalBehavior.createSettingsFromBehavior(behavior);
        var pluginName = GlobalBehavior.jQueryPlugins[command] || command;
        var jqueryElement = window.jQuery(element);

        if (!jqueryElement[pluginName]) {
          _aureliaLogging.getLogger('templating-resources').warn('Could not find the jQuery plugin ' + pluginName + ', possibly due to case mismatch. Trying to enumerate jQuery methods in lowercase. Add the correctly cased plugin name to the GlobalBehavior to avoid this performance hit.');

          for (var prop in jqueryElement) {
            if (prop.toLowerCase() === pluginName) {
              pluginName = prop;
            }
          }
        }

        behavior.plugin = jqueryElement[pluginName](settings);
      },
      unbind: function unbind(behavior, element) {
        if (typeof behavior.plugin.destroy === 'function') {
          behavior.plugin.destroy();
          behavior.plugin = null;
        }
      }
    }
  };
});
define('aurelia-templating-resources/sanitize-html',['exports', 'aurelia-binding'], function (exports, _aureliaBinding) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

  var SanitizeHtmlValueConverter = (function () {
    function SanitizeHtmlValueConverter() {
      _classCallCheck(this, _SanitizeHtmlValueConverter);

      this.sanitizer = SanitizeHtmlValueConverter.defaultSanitizer;
    }

    var _SanitizeHtmlValueConverter = SanitizeHtmlValueConverter;

    _createClass(_SanitizeHtmlValueConverter, [{
      key: 'toView',
      value: function toView(untrustedMarkup) {
        if (untrustedMarkup === null) {
          return null;
        }

        return this.sanitizer(untrustedMarkup);
      }
    }], [{
      key: 'defaultSanitizer',
      value: function defaultSanitizer(untrustedMarkup) {
        return untrustedMarkup.replace(SCRIPT_REGEX, '');
      }
    }]);

    SanitizeHtmlValueConverter = _aureliaBinding.valueConverter('sanitizeHtml')(SanitizeHtmlValueConverter) || SanitizeHtmlValueConverter;
    return SanitizeHtmlValueConverter;
  })();

  exports.SanitizeHtmlValueConverter = SanitizeHtmlValueConverter;
});
define('aurelia-templating-resources/index',['exports', './compose', './if', './with', './repeat', './show', './global-behavior', './sanitize-html'], function (exports, _compose, _if, _with, _repeat, _show, _globalBehavior, _sanitizeHtml) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function install(aurelia) {
    aurelia.globalizeResources('./compose', './if', './with', './repeat', './show', './global-behavior', './sanitize-html');
  }

  exports.Compose = _compose.Compose;
  exports.If = _if.If;
  exports.With = _with.With;
  exports.Repeat = _repeat.Repeat;
  exports.Show = _show.Show;
  exports.SanitizeHtmlValueConverter = _sanitizeHtml.SanitizeHtmlValueConverter;
  exports.GlobalBehavior = _globalBehavior.GlobalBehavior;
  exports.install = install;
});
define('aurelia-templating-resources', ['aurelia-templating-resources/index'], function (main) { return main; });

define('aurelia-templating-router/route-loader',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-router', 'aurelia-path', 'aurelia-metadata'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaRouter, _aureliaPath, _aureliaMetadata) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var TemplatingRouteLoader = (function (_RouteLoader) {
    function TemplatingRouteLoader(compositionEngine) {
      _classCallCheck(this, _TemplatingRouteLoader);

      _get(Object.getPrototypeOf(_TemplatingRouteLoader.prototype), 'constructor', this).call(this);
      this.compositionEngine = compositionEngine;
    }

    _inherits(TemplatingRouteLoader, _RouteLoader);

    var _TemplatingRouteLoader = TemplatingRouteLoader;

    _createClass(_TemplatingRouteLoader, [{
      key: 'loadRoute',
      value: function loadRoute(router, config) {
        var childContainer = router.container.createChild(),
            instruction = {
          viewModel: _aureliaPath.relativeToFile(config.moduleId, _aureliaMetadata.Origin.get(router.container.viewModel.constructor).moduleId),
          childContainer: childContainer,
          view: config.view || config.viewStrategy
        },
            childRouter;

        childContainer.registerHandler(_aureliaRouter.Router, function (c) {
          return childRouter || (childRouter = router.createChild(childContainer));
        });

        return this.compositionEngine.createViewModel(instruction).then(function (instruction) {
          instruction.executionContext = instruction.viewModel;
          instruction.router = router;
          return instruction;
        });
      }
    }]);

    TemplatingRouteLoader = _aureliaDependencyInjection.inject(_aureliaTemplating.CompositionEngine)(TemplatingRouteLoader) || TemplatingRouteLoader;
    return TemplatingRouteLoader;
  })(_aureliaRouter.RouteLoader);

  exports.TemplatingRouteLoader = TemplatingRouteLoader;
});
define('aurelia-templating-router/router-view',['exports', 'aurelia-dependency-injection', 'aurelia-templating', 'aurelia-router', 'aurelia-metadata'], function (exports, _aureliaDependencyInjection, _aureliaTemplating, _aureliaRouter, _aureliaMetadata) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var RouterView = (function () {
    function RouterView(element, container, viewSlot, router) {
      _classCallCheck(this, _RouterView);

      this.element = element;
      this.container = container;
      this.viewSlot = viewSlot;
      this.router = router;
      router.registerViewPort(this, element.getAttribute('name'));
    }

    var _RouterView = RouterView;

    _createClass(_RouterView, [{
      key: 'process',
      value: function process(viewPortInstruction, waitToSwap) {
        var _this = this;

        var component = viewPortInstruction.component,
            viewStrategy = component.view,
            childContainer = component.childContainer,
            viewModel = component.executionContext,
            viewModelResource = component.viewModelResource,
            metadata = viewModelResource.metadata;

        if (!viewStrategy && 'getViewStrategy' in viewModel) {
          viewStrategy = viewModel.getViewStrategy();
        }

        if (viewStrategy) {
          viewStrategy = _aureliaTemplating.ViewStrategy.normalize(viewStrategy);
          viewStrategy.makeRelativeTo(_aureliaMetadata.Origin.get(component.router.container.viewModel.constructor).moduleId);
        }

        return metadata.load(childContainer, viewModelResource.value, viewStrategy, true).then(function (viewFactory) {
          viewPortInstruction.behavior = metadata.create(childContainer, {
            executionContext: viewModel,
            viewFactory: viewFactory,
            suppressBind: true
          });

          if (waitToSwap) {
            return;
          }

          _this.swap(viewPortInstruction);
        });
      }
    }, {
      key: 'swap',
      value: function swap(viewPortInstruction) {
        viewPortInstruction.behavior.view.bind(viewPortInstruction.behavior.executionContext);
        this.viewSlot.swap(viewPortInstruction.behavior.view);

        if (this.view) {
          this.view.unbind();
        }

        this.view = viewPortInstruction.behavior.view;
      }
    }]);

    RouterView = _aureliaDependencyInjection.inject(Element, _aureliaDependencyInjection.Container, _aureliaTemplating.ViewSlot, _aureliaRouter.Router)(RouterView) || RouterView;
    RouterView = _aureliaTemplating.noView(RouterView) || RouterView;
    RouterView = _aureliaTemplating.customElement('router-view')(RouterView) || RouterView;
    return RouterView;
  })();

  exports.RouterView = RouterView;
});
define('aurelia-templating-router/index',['exports', 'aurelia-router', './route-loader', './router-view'], function (exports, _aureliaRouter, _routeLoader, _routerView) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  function install(aurelia) {
    aurelia.withSingleton(_aureliaRouter.RouteLoader, _routeLoader.TemplatingRouteLoader).withSingleton(_aureliaRouter.Router, _aureliaRouter.AppRouter).globalizeResources('./router-view');
  }

  exports.TemplatingRouteLoader = _routeLoader.TemplatingRouteLoader;
  exports.RouterView = _routerView.RouterView;
  exports.install = install;
});
define('aurelia-templating-router', ['aurelia-templating-router/index'], function (main) { return main; });

define('aurelia-http-client/headers',['exports'], function (exports) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var Headers = (function () {
    function Headers() {
      var headers = arguments[0] === undefined ? {} : arguments[0];

      _classCallCheck(this, Headers);

      this.headers = headers;
    }

    _createClass(Headers, [{
      key: 'add',
      value: function add(key, value) {
        this.headers[key] = value;
      }
    }, {
      key: 'get',
      value: function get(key) {
        return this.headers[key];
      }
    }, {
      key: 'clear',
      value: function clear() {
        this.headers = {};
      }
    }, {
      key: 'configureXHR',
      value: function configureXHR(xhr) {
        var headers = this.headers,
            key;

        for (key in headers) {
          xhr.setRequestHeader(key, headers[key]);
        }
      }
    }], [{
      key: 'parse',
      value: function parse(headerStr) {
        var headers = new Headers();
        if (!headerStr) {
          return headers;
        }

        var headerPairs = headerStr.split('\r\n');
        for (var i = 0; i < headerPairs.length; i++) {
          var headerPair = headerPairs[i];

          var index = headerPair.indexOf(': ');
          if (index > 0) {
            var key = headerPair.substring(0, index);
            var val = headerPair.substring(index + 2);
            headers.add(key, val);
          }
        }

        return headers;
      }
    }]);

    return Headers;
  })();

  exports.Headers = Headers;
});
define('aurelia-http-client/http-response-message',["exports", "./headers"], function (exports, _headers) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var HttpResponseMessage = (function () {
    function HttpResponseMessage(requestMessage, xhr, responseType, reviver) {
      _classCallCheck(this, HttpResponseMessage);

      this.requestMessage = requestMessage;
      this.statusCode = xhr.status;
      this.response = xhr.response;
      this.isSuccess = xhr.status >= 200 && xhr.status < 400;
      this.statusText = xhr.statusText;
      this.reviver = reviver;
      this.mimeType = null;

      if (xhr.getAllResponseHeaders) {
        try {
          this.headers = _headers.Headers.parse(xhr.getAllResponseHeaders());
        } catch (err) {
          if (xhr.requestHeaders) this.headers = { headers: xhr.requestHeaders };
        }
      } else {
        this.headers = new _headers.Headers();
      }

      var contentType;
      if (this.headers && this.headers.headers) contentType = this.headers.headers["Content-Type"];
      if (contentType) {
        this.mimeType = responseType = contentType.split(";")[0].trim();
        if (mimeTypes.hasOwnProperty(this.mimeType)) responseType = mimeTypes[this.mimeType];
      }
      this.responseType = responseType;
    }

    _createClass(HttpResponseMessage, [{
      key: "content",
      get: function () {
        try {
          if (this._content !== undefined) {
            return this._content;
          }

          if (this.response === undefined || this.response === null) {
            return this._content = this.response;
          }

          if (this.responseType === "json") {
            return this._content = JSON.parse(this.response, this.reviver);
          }

          if (this.reviver) {
            return this._content = this.reviver(this.response);
          }

          return this._content = this.response;
        } catch (e) {
          if (this.isSuccess) {
            throw e;
          }

          return this._content = null;
        }
      }
    }]);

    return HttpResponseMessage;
  })();

  exports.HttpResponseMessage = HttpResponseMessage;
  var mimeTypes = {
    "text/html": "html",
    "text/javascript": "js",
    "application/javascript": "js",
    "text/json": "json",
    "application/json": "json",
    "application/rss+xml": "rss",
    "application/atom+xml": "atom",
    "application/xhtml+xml": "xhtml",
    "text/markdown": "md",
    "text/xml": "xml",
    "text/mathml": "mml",
    "application/xml": "xml",
    "text/yml": "yml",
    "text/csv": "csv",
    "text/css": "css",
    "text/less": "less",
    "text/stylus": "styl",
    "text/scss": "scss",
    "text/sass": "sass",
    "text/plain": "txt"
  };
  exports.mimeTypes = mimeTypes;
});
define('aurelia-http-client/request-message-processor',['exports', 'core-js', './http-response-message', 'aurelia-path'], function (exports, _coreJs, _httpResponseMessage, _aureliaPath) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  function buildFullUri(message) {
    var uri = _aureliaPath.join(message.baseUri, message.uri),
        qs;

    if (message.params) {
      qs = _aureliaPath.buildQueryString(message.params);
      uri = qs ? '' + uri + '?' + qs : uri;
    }

    message.fullUri = uri;
  }

  var RequestMessageProcessor = (function () {
    function RequestMessageProcessor(xhrType, transformers) {
      _classCallCheck(this, RequestMessageProcessor);

      this.XHRType = xhrType;
      this.transformers = transformers;
    }

    _createClass(RequestMessageProcessor, [{
      key: 'abort',
      value: function abort() {
        if (this.xhr) {
          this.xhr.abort();
        }
      }
    }, {
      key: 'process',
      value: function process(client, message) {
        var _this = this;

        return new Promise(function (resolve, reject) {
          var xhr = _this.xhr = new _this.XHRType(),
              transformers = _this.transformers,
              i,
              ii;

          buildFullUri(message);
          xhr.open(message.method, message.fullUri, true);

          for (i = 0, ii = transformers.length; i < ii; ++i) {
            transformers[i](client, _this, message, xhr);
          }

          xhr.onload = function (e) {
            var response = new _httpResponseMessage.HttpResponseMessage(message, xhr, message.responseType, message.reviver);
            if (response.isSuccess) {
              resolve(response);
            } else {
              reject(response);
            }
          };

          xhr.ontimeout = function (e) {
            reject(new _httpResponseMessage.HttpResponseMessage(message, {
              response: e,
              status: xhr.status,
              statusText: xhr.statusText
            }, 'timeout'));
          };

          xhr.onerror = function (e) {
            reject(new _httpResponseMessage.HttpResponseMessage(message, {
              response: e,
              status: xhr.status,
              statusText: xhr.statusText
            }, 'error'));
          };

          xhr.onabort = function (e) {
            reject(new _httpResponseMessage.HttpResponseMessage(message, {
              response: e,
              status: xhr.status,
              statusText: xhr.statusText
            }, 'abort'));
          };

          xhr.send(message.content);
        });
      }
    }]);

    return RequestMessageProcessor;
  })();

  exports.RequestMessageProcessor = RequestMessageProcessor;
});
define('aurelia-http-client/transformers',['exports'], function (exports) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.timeoutTransformer = timeoutTransformer;
  exports.callbackParameterNameTransformer = callbackParameterNameTransformer;
  exports.credentialsTransformer = credentialsTransformer;
  exports.progressTransformer = progressTransformer;
  exports.responseTypeTransformer = responseTypeTransformer;
  exports.headerTransformer = headerTransformer;
  exports.contentTransformer = contentTransformer;

  function timeoutTransformer(client, processor, message, xhr) {
    if (message.timeout !== undefined) {
      xhr.timeout = message.timeout;
    }
  }

  function callbackParameterNameTransformer(client, processor, message, xhr) {
    if (message.callbackParameterName !== undefined) {
      xhr.callbackParameterName = message.callbackParameterName;
    }
  }

  function credentialsTransformer(client, processor, message, xhr) {
    if (message.withCredentials !== undefined) {
      xhr.withCredentials = message.withCredentials;
    }
  }

  function progressTransformer(client, processor, message, xhr) {
    if (message.progressCallback) {
      xhr.upload.onprogress = message.progressCallback;
    }
  }

  function responseTypeTransformer(client, processor, message, xhr) {
    var responseType = message.responseType;

    if (responseType === 'json') {
      responseType = 'text';
    }

    xhr.responseType = responseType;
  }

  function headerTransformer(client, processor, message, xhr) {
    message.headers.configureXHR(xhr);
  }

  function contentTransformer(client, processor, message, xhr) {
    if (window.FormData && message.content instanceof FormData) {
      return;
    }

    if (window.Blob && message.content instanceof Blob) {
      return;
    }

    if (window.ArrayBufferView && message.content instanceof ArrayBufferView) {
      return;
    }

    if (message.content instanceof Document) {
      return;
    }

    if (typeof message.content === 'string') {
      return;
    }

    if (message.content === null || message.content === undefined) {
      return;
    }

    message.content = JSON.stringify(message.content, message.replacer);
  }
});
define('aurelia-http-client/http-request-message',['exports', './headers', './request-message-processor', './transformers'], function (exports, _headers, _requestMessageProcessor, _transformers) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.createHttpRequestMessageProcessor = createHttpRequestMessageProcessor;

  var HttpRequestMessage = function HttpRequestMessage(method, uri, content, headers) {
    _classCallCheck(this, HttpRequestMessage);

    this.method = method;
    this.uri = uri;
    this.content = content;
    this.headers = headers || new _headers.Headers();
    this.responseType = 'json';
  };

  exports.HttpRequestMessage = HttpRequestMessage;

  function createHttpRequestMessageProcessor() {
    return new _requestMessageProcessor.RequestMessageProcessor(XMLHttpRequest, [_transformers.timeoutTransformer, _transformers.credentialsTransformer, _transformers.progressTransformer, _transformers.responseTypeTransformer, _transformers.headerTransformer, _transformers.contentTransformer]);
  }
});
define('aurelia-http-client/jsonp-request-message',['exports', './headers', './request-message-processor', './transformers'], function (exports, _headers, _requestMessageProcessor, _transformers) {
  

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.createJSONPRequestMessageProcessor = createJSONPRequestMessageProcessor;

  var JSONPRequestMessage = function JSONPRequestMessage(uri, callbackParameterName) {
    _classCallCheck(this, JSONPRequestMessage);

    this.method = 'JSONP';
    this.uri = uri;
    this.content = undefined;
    this.headers = new _headers.Headers();
    this.responseType = 'jsonp';
    this.callbackParameterName = callbackParameterName;
  };

  exports.JSONPRequestMessage = JSONPRequestMessage;

  var JSONPXHR = (function () {
    function JSONPXHR() {
      _classCallCheck(this, JSONPXHR);
    }

    _createClass(JSONPXHR, [{
      key: 'open',
      value: function open(method, uri) {
        this.method = method;
        this.uri = uri;
        this.callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
      }
    }, {
      key: 'send',
      value: function send() {
        var _this = this;

        var uri = this.uri + (this.uri.indexOf('?') >= 0 ? '&' : '?') + this.callbackParameterName + '=' + this.callbackName;

        window[this.callbackName] = function (data) {
          delete window[_this.callbackName];
          document.body.removeChild(script);

          if (_this.status === undefined) {
            _this.status = 200;
            _this.statusText = 'OK';
            _this.response = data;
            _this.onload(_this);
          }
        };

        var script = document.createElement('script');
        script.src = uri;
        document.body.appendChild(script);

        if (this.timeout !== undefined) {
          setTimeout(function () {
            if (_this.status === undefined) {
              _this.status = 0;
              _this.ontimeout(new Error('timeout'));
            }
          }, this.timeout);
        }
      }
    }, {
      key: 'abort',
      value: function abort() {
        if (this.status === undefined) {
          this.status = 0;
          this.onabort(new Error('abort'));
        }
      }
    }, {
      key: 'setRequestHeader',
      value: function setRequestHeader() {}
    }]);

    return JSONPXHR;
  })();

  function createJSONPRequestMessageProcessor() {
    return new _requestMessageProcessor.RequestMessageProcessor(JSONPXHR, [_transformers.timeoutTransformer, _transformers.callbackParameterNameTransformer]);
  }
});
define('aurelia-http-client/request-builder',['exports', 'aurelia-path', './http-request-message', './jsonp-request-message'], function (exports, _aureliaPath, _httpRequestMessage, _jsonpRequestMessage) {
  

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var RequestBuilder = (function () {
    function RequestBuilder(client) {
      _classCallCheck(this, RequestBuilder);

      this.client = client;
      this.transformers = client.requestTransformers.slice(0);
      this.useJsonp = false;
    }

    _createClass(RequestBuilder, [{
      key: 'send',
      value: function send() {
        var message = this.useJsonp ? new _jsonpRequestMessage.JSONPRequestMessage() : new _httpRequestMessage.HttpRequestMessage();
        return this.client.send(message, this.transformers);
      }
    }], [{
      key: 'addHelper',
      value: function addHelper(name, fn) {
        RequestBuilder.prototype[name] = function () {
          this.transformers.push(fn.apply(this, arguments));
          return this;
        };
      }
    }]);

    return RequestBuilder;
  })();

  exports.RequestBuilder = RequestBuilder;

  RequestBuilder.addHelper('asDelete', function () {
    return function (client, processor, message) {
      message.method = 'DELETE';
    };
  });

  RequestBuilder.addHelper('asGet', function () {
    return function (client, processor, message) {
      message.method = 'GET';
    };
  });

  RequestBuilder.addHelper('asHead', function () {
    return function (client, processor, message) {
      message.method = 'HEAD';
    };
  });

  RequestBuilder.addHelper('asOptions', function () {
    return function (client, processor, message) {
      message.method = 'OPTIONS';
    };
  });

  RequestBuilder.addHelper('asPatch', function () {
    return function (client, processor, message) {
      message.method = 'PATCH';
    };
  });

  RequestBuilder.addHelper('asPost', function () {
    return function (client, processor, message) {
      message.method = 'POST';
    };
  });

  RequestBuilder.addHelper('asPut', function () {
    return function (client, processor, message) {
      message.method = 'PUT';
    };
  });

  RequestBuilder.addHelper('asJsonp', function (callbackParameterName) {
    this.useJsonp = true;
    return function (client, processor, message) {
      message.callbackParameterName = callbackParameterName;
    };
  });

  RequestBuilder.addHelper('withUri', function (uri) {
    return function (client, processor, message) {
      message.uri = uri;
    };
  });

  RequestBuilder.addHelper('withContent', function (content) {
    return function (client, processor, message) {
      message.content = content;
    };
  });

  RequestBuilder.addHelper('withBaseUri', function (baseUri) {
    return function (client, processor, message) {
      message.baseUri = baseUri;
    };
  });

  RequestBuilder.addHelper('withParams', function (params) {
    return function (client, processor, message) {
      message.params = params;
    };
  });

  RequestBuilder.addHelper('withResponseType', function (responseType) {
    return function (client, processor, message) {
      message.responseType = responseType;
    };
  });

  RequestBuilder.addHelper('withTimeout', function (timeout) {
    return function (client, processor, message) {
      message.timeout = timeout;
    };
  });

  RequestBuilder.addHelper('withHeader', function (key, value) {
    return function (client, processor, message) {
      message.headers.add(key, value);
    };
  });

  RequestBuilder.addHelper('withCredentials', function (value) {
    return function (client, processor, message) {
      message.withCredentials = value;
    };
  });

  RequestBuilder.addHelper('withReviver', function (reviver) {
    return function (client, processor, message) {
      message.reviver = reviver;
    };
  });

  RequestBuilder.addHelper('withReplacer', function (replacer) {
    return function (client, processor, message) {
      message.replacer = replacer;
    };
  });

  RequestBuilder.addHelper('withProgressCallback', function (progressCallback) {
    return function (client, processor, message) {
      message.progressCallback = progressCallback;
    };
  });

  RequestBuilder.addHelper('withCallbackParameterName', function (callbackParameterName) {
    return function (client, processor, message) {
      message.callbackParameterName = callbackParameterName;
    };
  });
});
define('aurelia-http-client/http-client',['exports', 'core-js', './headers', './request-builder', './http-request-message', './jsonp-request-message'], function (exports, _coreJs, _headers, _requestBuilder, _httpRequestMessage, _jsonpRequestMessage) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  function trackRequestStart(client, processor) {
    client.pendingRequests.push(processor);
    client.isRequesting = true;
  }

  function trackRequestEnd(client, processor) {
    var index = client.pendingRequests.indexOf(processor);

    client.pendingRequests.splice(index, 1);
    client.isRequesting = client.pendingRequests.length > 0;

    if (!client.isRequesting) {
      var evt = new window.CustomEvent('aurelia-http-client-requests-drained', { bubbles: true, cancelable: true });
      setTimeout(function () {
        return document.dispatchEvent(evt);
      }, 1);
    }
  }

  var HttpClient = (function () {
    function HttpClient() {
      _classCallCheck(this, HttpClient);

      this.requestTransformers = [];
      this.requestProcessorFactories = new Map();
      this.requestProcessorFactories.set(_httpRequestMessage.HttpRequestMessage, _httpRequestMessage.createHttpRequestMessageProcessor);
      this.requestProcessorFactories.set(_jsonpRequestMessage.JSONPRequestMessage, _jsonpRequestMessage.createJSONPRequestMessageProcessor);
      this.pendingRequests = [];
      this.isRequesting = false;
    }

    _createClass(HttpClient, [{
      key: 'configure',
      value: function configure(fn) {
        var builder = new _requestBuilder.RequestBuilder(this);
        fn(builder);
        this.requestTransformers = builder.transformers;
        return this;
      }
    }, {
      key: 'createRequest',
      value: function createRequest(uri) {
        var builder = new _requestBuilder.RequestBuilder(this);

        if (uri) {
          builder.withUri(uri);
        }

        return builder;
      }
    }, {
      key: 'send',
      value: function send(message, transformers) {
        var _this = this;

        var createProcessor = this.requestProcessorFactories.get(message.constructor),
            processor,
            promise,
            i,
            ii;

        if (!createProcessor) {
          throw new Error('No request message processor factory for ' + message.constructor + '.');
        }

        processor = createProcessor();
        trackRequestStart(this, processor);

        transformers = transformers || this.requestTransformers;

        for (i = 0, ii = transformers.length; i < ii; ++i) {
          transformers[i](this, processor, message);
        }

        promise = processor.process(this, message).then(function (response) {
          trackRequestEnd(_this, processor);
          return response;
        })['catch'](function (response) {
          trackRequestEnd(_this, processor);
          throw response;
        });

        promise.abort = promise.cancel = function () {
          processor.abort();
        };

        return promise;
      }
    }, {
      key: 'delete',
      value: function _delete(uri) {
        return this.createRequest(uri).asDelete().send();
      }
    }, {
      key: 'get',
      value: function get(uri) {
        return this.createRequest(uri).asGet().send();
      }
    }, {
      key: 'head',
      value: function head(uri) {
        return this.createRequest(uri).asHead().send();
      }
    }, {
      key: 'jsonp',
      value: function jsonp(uri) {
        var callbackParameterName = arguments[1] === undefined ? 'jsoncallback' : arguments[1];

        return this.createRequest(uri).asJsonp(callbackParameterName).send();
      }
    }, {
      key: 'options',
      value: function options(uri) {
        return this.createRequest(uri).asOptions().send();
      }
    }, {
      key: 'put',
      value: function put(uri, content) {
        return this.createRequest(uri).asPut().withContent(content).send();
      }
    }, {
      key: 'patch',
      value: function patch(uri, content) {
        return this.createRequest(uri).asPatch().withContent(content).send();
      }
    }, {
      key: 'post',
      value: function post(uri, content) {
        return this.createRequest(uri).asPost().withContent(content).send();
      }
    }]);

    return HttpClient;
  })();

  exports.HttpClient = HttpClient;
});
define('aurelia-http-client/index',['exports', './http-client', './http-request-message', './http-response-message', './jsonp-request-message', './headers', './request-builder'], function (exports, _httpClient, _httpRequestMessage, _httpResponseMessage, _jsonpRequestMessage, _headers, _requestBuilder) {
  

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  Object.defineProperty(exports, 'HttpClient', {
    enumerable: true,
    get: function get() {
      return _httpClient.HttpClient;
    }
  });
  Object.defineProperty(exports, 'HttpRequestMessage', {
    enumerable: true,
    get: function get() {
      return _httpRequestMessage.HttpRequestMessage;
    }
  });
  Object.defineProperty(exports, 'HttpResponseMessage', {
    enumerable: true,
    get: function get() {
      return _httpResponseMessage.HttpResponseMessage;
    }
  });
  Object.defineProperty(exports, 'mimeTypes', {
    enumerable: true,
    get: function get() {
      return _httpResponseMessage.mimeTypes;
    }
  });
  Object.defineProperty(exports, 'JSONPRequestMessage', {
    enumerable: true,
    get: function get() {
      return _jsonpRequestMessage.JSONPRequestMessage;
    }
  });
  Object.defineProperty(exports, 'Headers', {
    enumerable: true,
    get: function get() {
      return _headers.Headers;
    }
  });
  Object.defineProperty(exports, 'RequestBuilder', {
    enumerable: true,
    get: function get() {
      return _requestBuilder.RequestBuilder;
    }
  });
});
define('aurelia-http-client', ['aurelia-http-client/index'], function (main) { return main; });

define('aurelia-bootstrapper',['exports', 'core-js', 'aurelia-framework', 'aurelia-logging-console'], function (exports, _coreJs, _aureliaFramework, _aureliaLoggingConsole) {
  

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.bootstrap = bootstrap;

  var _core = _interopRequire(_coreJs);

  var logger = _aureliaFramework.LogManager.getLogger('bootstrapper');

  var readyQueue = [];
  var isReady = false;

  function onReady(callback) {
    return new Promise(function (resolve, reject) {
      if (!isReady) {
        readyQueue.push(function () {
          try {
            resolve(callback());
          } catch (e) {
            reject(e);
          }
        });
      } else {
        resolve(callback());
      }
    });
  }

  function bootstrap(configure) {
    return onReady(function () {
      var loader = new window.AureliaLoader(),
          aurelia = new _aureliaFramework.Aurelia(loader);

      return configureAurelia(aurelia).then(function () {
        return configure(aurelia);
      });
    });
  }

  function ready(global) {
    return new Promise(function (resolve, reject) {
      if (global.document.readyState === 'complete') {
        resolve(global.document);
      } else {
        global.document.addEventListener('DOMContentLoaded', completed, false);
        global.addEventListener('load', completed, false);
      }

      function completed() {
        global.document.removeEventListener('DOMContentLoaded', completed, false);
        global.removeEventListener('load', completed, false);
        resolve(global.document);
      }
    });
  }

  function ensureLoader() {
    if (!window.AureliaLoader) {
      return System.normalize('aurelia-bootstrapper').then(function (bootstrapperName) {
        return System.normalize('aurelia-loader-default', bootstrapperName).then(function (loaderName) {
          return System['import'](loaderName);
        });
      });
    }

    return Promise.resolve();
  }

  function preparePlatform() {
    return System.normalize('aurelia-bootstrapper').then(function (bootstrapperName) {
      return System.normalize('aurelia-framework', bootstrapperName).then(function (frameworkName) {
        System.map['aurelia-framework'] = frameworkName;

        return System.normalize('aurelia-loader', frameworkName).then(function (loaderName) {
          var toLoad = [];

          if (!System.polyfilled) {
            logger.debug('loading core-js');
            toLoad.push(System.normalize('core-js', loaderName).then(function (name) {
              return System['import'](name);
            }));
          }

          toLoad.push(System.normalize('aurelia-depedency-injection', frameworkName).then(function (name) {
            System.map['aurelia-depedency-injection'] = name;
          }));

          toLoad.push(System.normalize('aurelia-router', bootstrapperName).then(function (name) {
            System.map['aurelia-router'] = name;
          }));

          toLoad.push(System.normalize('aurelia-logging-console', bootstrapperName).then(function (name) {
            System.map['aurelia-logging-console'] = name;
          }));

          if (!('import' in document.createElement('link'))) {
            logger.debug('loading the HTMLImports polyfill');
            toLoad.push(System.normalize('webcomponentsjs/HTMLImports.min', loaderName).then(function (name) {
              return System['import'](name);
            }));
          }

          if (!('content' in document.createElement('template'))) {
            logger.debug('loading the HTMLTemplateElement polyfill');
            toLoad.push(System.normalize('aurelia-html-template-element', loaderName).then(function (name) {
              return System['import'](name);
            }));
          }

          return Promise.all(toLoad);
        });
      });
    });
  }

  var installedDevelopmentLogging = false;

  function configureAurelia(aurelia) {
    return System.normalize('aurelia-bootstrapper').then(function (bName) {
      var toLoad = [];

      toLoad.push(System.normalize('aurelia-templating-binding', bName).then(function (templatingBinding) {
        aurelia.use.defaultBindingLanguage = function () {
          aurelia.use.plugin(templatingBinding);
          return this;
        };
      }));

      toLoad.push(System.normalize('aurelia-history-browser', bName).then(function (historyBrowser) {
        return System.normalize('aurelia-templating-router', bName).then(function (templatingRouter) {
          aurelia.use.router = function () {
            aurelia.use.plugin(historyBrowser);
            aurelia.use.plugin(templatingRouter);
            return this;
          };
        });
      }));

      toLoad.push(System.normalize('aurelia-templating-resources', bName).then(function (name) {
        System.map['aurelia-templating-resources'] = name;
        aurelia.use.defaultResources = function () {
          aurelia.use.plugin(name);
          return this;
        };
      }));

      toLoad.push(System.normalize('aurelia-event-aggregator', bName).then(function (eventAggregator) {
        System.map['aurelia-event-aggregator'] = eventAggregator;
        aurelia.use.eventAggregator = function () {
          aurelia.use.plugin(eventAggregator);
          return this;
        };
      }));

      aurelia.use.standardConfiguration = function () {
        aurelia.use.defaultBindingLanguage().defaultResources().router().eventAggregator();
        return this;
      };

      aurelia.use.developmentLogging = function () {
        if (!installedDevelopmentLogging) {
          installedDevelopmentLogging = true;
          _aureliaFramework.LogManager.addAppender(new _aureliaLoggingConsole.ConsoleAppender());
          _aureliaFramework.LogManager.setLevel(_aureliaFramework.LogManager.levels.debug);
        }
        return this;
      };

      return Promise.all(toLoad);
    });
  }

  function runningLocally() {
    return window.location.protocol !== 'http' && window.location.protocol !== 'https';
  }

  function handleApp(appHost) {
    var configModuleId = appHost.getAttribute('aurelia-app'),
        aurelia,
        loader;

    if (configModuleId) {
      loader = new window.AureliaLoader();

      return loader.loadModule(configModuleId).then(function (m) {
        aurelia = new _aureliaFramework.Aurelia(loader);
        return configureAurelia(aurelia).then(function () {
          return m.configure(aurelia);
        });
      })['catch'](function (e) {
        setTimeout(function () {
          throw e;
        }, 0);
      });
    } else {
      aurelia = new _aureliaFramework.Aurelia();

      return configureAurelia(aurelia).then(function () {
        if (runningLocally()) {
          aurelia.use.developmentLogging();
        }

        aurelia.use.standardConfiguration();

        if (appHost.hasAttribute('es5')) {
          aurelia.use.es5();
        }

        return aurelia.start().then(function (a) {
          return a.setRoot(undefined, appHost);
        });
      })['catch'](function (e) {
        setTimeout(function () {
          throw e;
        }, 0);
      });
    }
  }

  function run() {
    return ready(window).then(function (doc) {
      var appHost = doc.querySelectorAll('[aurelia-app]');

      return ensureLoader().then(function () {
        return preparePlatform().then(function () {
          var i, ii;

          for (i = 0, ii = appHost.length; i < ii; ++i) {
            handleApp(appHost[i]);
          }

          isReady = true;
          for (i = 0, ii = readyQueue.length; i < ii; ++i) {
            readyQueue[i]();
          }
          readyQueue = [];
        });
      });
    });
  }

  run();
});
(function(global){
  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
  var hasTemplateElement = typeof HTMLTemplateElement !== 'undefined';

  function isSVGTemplate(el) {
    return el.tagName == 'template' &&
           el.namespaceURI == 'http://www.w3.org/2000/svg';
  }

  function isHTMLTemplate(el) {
    return el.tagName == 'TEMPLATE' &&
           el.namespaceURI == 'http://www.w3.org/1999/xhtml';
  }

  function isTemplate(el) {
    if (el.isTemplate_ === undefined)
      el.isTemplate_ = el.tagName == 'TEMPLATE';

    return el.isTemplate_;
  }
  
  function extractTemplateFromSVGTemplate(el) {
    var template = el.ownerDocument.createElement('template');
    el.parentNode.insertBefore(template, el);

    var attribs = el.attributes;
    var count = attribs.length;
    while (count-- > 0) {
      var attrib = attribs[count];
      template.setAttribute(attrib.name, attrib.value);
      el.removeAttribute(attrib.name);
    }

    el.parentNode.removeChild(el);
    return template;
  }


  function forAllTemplatesFrom(node, fn) {
    var subTemplates = node.querySelectorAll('template');

    if (isTemplate(node))
      fn(node);

    forEach(subTemplates, fn);
  }

  function bootstrapTemplatesRecursivelyFrom(node) {
    function bootstrap(template) {
      if (!HTMLTemplateElement.decorate(template))
        bootstrapTemplatesRecursivelyFrom(template.content);
    }

    forAllTemplatesFrom(node, bootstrap);
  }

  if (!hasTemplateElement) {
    /**
     * This represents a <template> element.
     * @constructor
     * @extends {HTMLElement}
     */
    global.HTMLTemplateElement = function() {
      throw TypeError('Illegal constructor');
    };
  }

  function getOrCreateTemplateContentsOwner(template) {
    var doc = template.ownerDocument;
    if (!doc.defaultView)
      return doc;
    var d = doc.templateContentsOwner_;
    if (!d) {
      // TODO(arv): This should either be a Document or HTMLDocument depending
      // on doc.
      d = doc.implementation.createHTMLDocument('');
      while (d.lastChild) {
        d.removeChild(d.lastChild);
      }
      doc.templateContentsOwner_ = d;
    }
    return d;
  }

  function liftNonNativeTemplateChildrenIntoContent(template, el, useRoot) {
    var content = template.content;
    if (useRoot) {
      content.appendChild(el);
      return;
    }

    var child;
    while (child = el.firstChild) {
      content.appendChild(child);
    }
  }

  var hasProto = '__proto__' in {};

  function mixin(to, from) {
    Object.getOwnPropertyNames(from).forEach(function(name) {
      Object.defineProperty(to, name, Object.getOwnPropertyDescriptor(from, name));
    });
  }

  function fixTemplateElementPrototype(el) {
    if (hasProto)
      el.__proto__ = HTMLTemplateElement.prototype;
    else
      mixin(el, HTMLTemplateElement.prototype);
  }

  HTMLTemplateElement.decorate = function(el, opt_instanceRef) {
    if (el.templateIsDecorated_)
      return false;

    var templateElement = el;
    templateElement.templateIsDecorated_ = true;

    var isNativeHTMLTemplate = isHTMLTemplate(templateElement) &&
                               hasTemplateElement;
    var bootstrapContents = isNativeHTMLTemplate;
    var liftContents = !isNativeHTMLTemplate;
    var liftRoot = false;

    if (!isNativeHTMLTemplate) {
      if (isSVGTemplate(templateElement)) {
        templateElement = extractTemplateFromSVGTemplate(el);
        templateElement.templateIsDecorated_ = true;
        isNativeHTMLTemplate = hasTemplateElement;
      }
    }

    if (!isNativeHTMLTemplate) {
      fixTemplateElementPrototype(templateElement);
      var doc = getOrCreateTemplateContentsOwner(templateElement);
      templateElement.content_ = doc.createDocumentFragment();
    }

    if (opt_instanceRef) {
      // template is contained within an instance, its direct content must be
      // empty
      templateElement.instanceRef_ = opt_instanceRef;
    } else if (liftContents) {
      liftNonNativeTemplateChildrenIntoContent(templateElement,
                                               el,
                                               liftRoot);
    } else if (bootstrapContents) {
      bootstrapTemplatesRecursivelyFrom(templateElement.content);
    }

    return true;
  };

  var htmlElement = global.HTMLUnknownElement || HTMLElement;

  var contentDescriptor = {
    get: function() {
      return this.content_;
    },
    enumerable: true,
    configurable: true
  };

  if (!hasTemplateElement) {
    // Gecko is more picky with the prototype than WebKit. Make sure to use the
    // same prototype as created in the constructor.
    HTMLTemplateElement.prototype = Object.create(htmlElement.prototype);

    Object.defineProperty(HTMLTemplateElement.prototype, 'content', contentDescriptor);
  }

  HTMLTemplateElement.bootstrap = bootstrapTemplatesRecursivelyFrom;
}(window));

define("aurelia-html-template-element", function(){});

define("aurelia-bundle-manifest", [
  'aurelia-path',
  'aurelia-loader',
  'aurelia-loader-default',
  'aurelia-task-queue',
  'aurelia-logging',
  'aurelia-logging-console',
  'aurelia-history',
  'aurelia-history-browser',
  'aurelia-event-aggregator',
  'aurelia-framework',
  'aurelia-metadata',
  'aurelia-binding',
  'aurelia-templating',
  'aurelia-dependency-injection',
  'aurelia-router',
  'aurelia-templating-binding',
  'aurelia-templating-resources',
  'aurelia-templating-router',
  'aurelia-route-recognizer',
  'aurelia-http-client',
  'aurelia-bootstrapper',
  'aurelia-html-template-element',
  'core-js'
  ], function(_path,
  _loader,
  _loader_default,
  _task_queue,
  _logging,
  _logging_console,
  _history,
  _history_browser,
  _event_aggregator,
  _framework,
  _metadata,
  _binding,
  _templating,
  _dependency_injection,
  _router,
  _templating_binding,
  _templating_resources,
  _templating_router,
  _route_recognizer,
  _http_client,
  _bootstrapper,
  _html_template_element,
  _core_js
){
    alert(_dependency_injection.inject)
  });

