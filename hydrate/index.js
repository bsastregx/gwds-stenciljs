'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*!
 Stencil Mock Doc v2.17.1 | MIT Licensed | https://stenciljs.com
 */
const CONTENT_REF_ID = 'r';
const ORG_LOCATION_ID = 'o';
const SLOT_NODE_ID = 's';
const TEXT_NODE_ID = 't';
const XLINK_NS = 'http://www.w3.org/1999/xlink';

const attrHandler = {
  get(obj, prop) {
    if (prop in obj) {
      return obj[prop];
    }
    if (typeof prop !== 'symbol' && !isNaN(prop)) {
      return obj.__items[prop];
    }
    return undefined;
  },
};
const createAttributeProxy = (caseInsensitive) => new Proxy(new MockAttributeMap(caseInsensitive), attrHandler);
class MockAttributeMap {
  constructor(caseInsensitive = false) {
    this.caseInsensitive = caseInsensitive;
    this.__items = [];
  }
  get length() {
    return this.__items.length;
  }
  item(index) {
    return this.__items[index] || null;
  }
  setNamedItem(attr) {
    attr.namespaceURI = null;
    this.setNamedItemNS(attr);
  }
  setNamedItemNS(attr) {
    if (attr != null && attr.value != null) {
      attr.value = String(attr.value);
    }
    const existingAttr = this.__items.find((a) => a.name === attr.name && a.namespaceURI === attr.namespaceURI);
    if (existingAttr != null) {
      existingAttr.value = attr.value;
    }
    else {
      this.__items.push(attr);
    }
  }
  getNamedItem(attrName) {
    if (this.caseInsensitive) {
      attrName = attrName.toLowerCase();
    }
    return this.getNamedItemNS(null, attrName);
  }
  getNamedItemNS(namespaceURI, attrName) {
    namespaceURI = getNamespaceURI(namespaceURI);
    return (this.__items.find((attr) => attr.name === attrName && getNamespaceURI(attr.namespaceURI) === namespaceURI) || null);
  }
  removeNamedItem(attr) {
    this.removeNamedItemNS(attr);
  }
  removeNamedItemNS(attr) {
    for (let i = 0, ii = this.__items.length; i < ii; i++) {
      if (this.__items[i].name === attr.name && this.__items[i].namespaceURI === attr.namespaceURI) {
        this.__items.splice(i, 1);
        break;
      }
    }
  }
  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => ({
        done: i === this.length,
        value: this.item(i++),
      }),
    };
  }
  get [Symbol.toStringTag]() {
    return 'MockAttributeMap';
  }
}
function getNamespaceURI(namespaceURI) {
  return namespaceURI === XLINK_NS ? null : namespaceURI;
}
function cloneAttributes(srcAttrs, sortByName = false) {
  const dstAttrs = new MockAttributeMap(srcAttrs.caseInsensitive);
  if (srcAttrs != null) {
    const attrLen = srcAttrs.length;
    if (sortByName && attrLen > 1) {
      const sortedAttrs = [];
      for (let i = 0; i < attrLen; i++) {
        const srcAttr = srcAttrs.item(i);
        const dstAttr = new MockAttr(srcAttr.name, srcAttr.value, srcAttr.namespaceURI);
        sortedAttrs.push(dstAttr);
      }
      sortedAttrs.sort(sortAttributes).forEach((attr) => {
        dstAttrs.setNamedItemNS(attr);
      });
    }
    else {
      for (let i = 0; i < attrLen; i++) {
        const srcAttr = srcAttrs.item(i);
        const dstAttr = new MockAttr(srcAttr.name, srcAttr.value, srcAttr.namespaceURI);
        dstAttrs.setNamedItemNS(dstAttr);
      }
    }
  }
  return dstAttrs;
}
function sortAttributes(a, b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}
class MockAttr {
  constructor(attrName, attrValue, namespaceURI = null) {
    this._name = attrName;
    this._value = String(attrValue);
    this._namespaceURI = namespaceURI;
  }
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
  }
  get value() {
    return this._value;
  }
  set value(value) {
    this._value = String(value);
  }
  get nodeName() {
    return this._name;
  }
  set nodeName(value) {
    this._name = value;
  }
  get nodeValue() {
    return this._value;
  }
  set nodeValue(value) {
    this._value = String(value);
  }
  get namespaceURI() {
    return this._namespaceURI;
  }
  set namespaceURI(namespaceURI) {
    this._namespaceURI = namespaceURI;
  }
}

class MockCustomElementRegistry {
  constructor(win) {
    this.win = win;
  }
  define(tagName, cstr, options) {
    if (tagName.toLowerCase() !== tagName) {
      throw new Error(`Failed to execute 'define' on 'CustomElementRegistry': "${tagName}" is not a valid custom element name`);
    }
    if (this.__registry == null) {
      this.__registry = new Map();
    }
    this.__registry.set(tagName, { cstr, options });
    if (this.__whenDefined != null) {
      const whenDefinedResolveFns = this.__whenDefined.get(tagName);
      if (whenDefinedResolveFns != null) {
        whenDefinedResolveFns.forEach((whenDefinedResolveFn) => {
          whenDefinedResolveFn();
        });
        whenDefinedResolveFns.length = 0;
        this.__whenDefined.delete(tagName);
      }
    }
    const doc = this.win.document;
    if (doc != null) {
      const hosts = doc.querySelectorAll(tagName);
      hosts.forEach((host) => {
        if (upgradedElements.has(host) === false) {
          tempDisableCallbacks.add(doc);
          const upgradedCmp = createCustomElement(this, doc, tagName);
          for (let i = 0; i < host.childNodes.length; i++) {
            const childNode = host.childNodes[i];
            childNode.remove();
            upgradedCmp.appendChild(childNode);
          }
          tempDisableCallbacks.delete(doc);
          if (proxyElements.has(host)) {
            proxyElements.set(host, upgradedCmp);
          }
        }
        fireConnectedCallback(host);
      });
    }
  }
  get(tagName) {
    if (this.__registry != null) {
      const def = this.__registry.get(tagName.toLowerCase());
      if (def != null) {
        return def.cstr;
      }
    }
    return undefined;
  }
  upgrade(_rootNode) {
    //
  }
  clear() {
    if (this.__registry != null) {
      this.__registry.clear();
    }
    if (this.__whenDefined != null) {
      this.__whenDefined.clear();
    }
  }
  whenDefined(tagName) {
    tagName = tagName.toLowerCase();
    if (this.__registry != null && this.__registry.has(tagName) === true) {
      return Promise.resolve(this.__registry.get(tagName).cstr);
    }
    return new Promise((resolve) => {
      if (this.__whenDefined == null) {
        this.__whenDefined = new Map();
      }
      let whenDefinedResolveFns = this.__whenDefined.get(tagName);
      if (whenDefinedResolveFns == null) {
        whenDefinedResolveFns = [];
        this.__whenDefined.set(tagName, whenDefinedResolveFns);
      }
      whenDefinedResolveFns.push(resolve);
    });
  }
}
function createCustomElement(customElements, ownerDocument, tagName) {
  const Cstr = customElements.get(tagName);
  if (Cstr != null) {
    const cmp = new Cstr(ownerDocument);
    cmp.nodeName = tagName.toUpperCase();
    upgradedElements.add(cmp);
    return cmp;
  }
  const host = new Proxy({}, {
    get(obj, prop) {
      const elm = proxyElements.get(host);
      if (elm != null) {
        return elm[prop];
      }
      return obj[prop];
    },
    set(obj, prop, val) {
      const elm = proxyElements.get(host);
      if (elm != null) {
        elm[prop] = val;
      }
      else {
        obj[prop] = val;
      }
      return true;
    },
    has(obj, prop) {
      const elm = proxyElements.get(host);
      if (prop in elm) {
        return true;
      }
      if (prop in obj) {
        return true;
      }
      return false;
    },
  });
  const elm = new MockHTMLElement(ownerDocument, tagName);
  proxyElements.set(host, elm);
  return host;
}
const proxyElements = new WeakMap();
const upgradedElements = new WeakSet();
function connectNode(ownerDocument, node) {
  node.ownerDocument = ownerDocument;
  if (node.nodeType === 1 /* ELEMENT_NODE */) {
    if (ownerDocument != null && node.nodeName.includes('-')) {
      const win = ownerDocument.defaultView;
      if (win != null && typeof node.connectedCallback === 'function' && node.isConnected) {
        fireConnectedCallback(node);
      }
      const shadowRoot = node.shadowRoot;
      if (shadowRoot != null) {
        shadowRoot.childNodes.forEach((childNode) => {
          connectNode(ownerDocument, childNode);
        });
      }
    }
    node.childNodes.forEach((childNode) => {
      connectNode(ownerDocument, childNode);
    });
  }
  else {
    node.childNodes.forEach((childNode) => {
      childNode.ownerDocument = ownerDocument;
    });
  }
}
function fireConnectedCallback(node) {
  if (typeof node.connectedCallback === 'function') {
    if (tempDisableCallbacks.has(node.ownerDocument) === false) {
      try {
        node.connectedCallback();
      }
      catch (e) {
        console.error(e);
      }
    }
  }
}
function disconnectNode(node) {
  if (node.nodeType === 1 /* ELEMENT_NODE */) {
    if (node.nodeName.includes('-') === true && typeof node.disconnectedCallback === 'function') {
      if (tempDisableCallbacks.has(node.ownerDocument) === false) {
        try {
          node.disconnectedCallback();
        }
        catch (e) {
          console.error(e);
        }
      }
    }
    node.childNodes.forEach(disconnectNode);
  }
}
function attributeChanged(node, attrName, oldValue, newValue) {
  attrName = attrName.toLowerCase();
  const observedAttributes = node.constructor.observedAttributes;
  if (Array.isArray(observedAttributes) === true &&
    observedAttributes.some((obs) => obs.toLowerCase() === attrName) === true) {
    try {
      node.attributeChangedCallback(attrName, oldValue, newValue);
    }
    catch (e) {
      console.error(e);
    }
  }
}
function checkAttributeChanged(node) {
  return node.nodeName.includes('-') === true && typeof node.attributeChangedCallback === 'function';
}
const tempDisableCallbacks = new Set();

function dataset(elm) {
  const ds = {};
  const attributes = elm.attributes;
  const attrLen = attributes.length;
  for (let i = 0; i < attrLen; i++) {
    const attr = attributes.item(i);
    const nodeName = attr.nodeName;
    if (nodeName.startsWith('data-')) {
      ds[dashToPascalCase(nodeName)] = attr.nodeValue;
    }
  }
  return new Proxy(ds, {
    get(_obj, camelCaseProp) {
      return ds[camelCaseProp];
    },
    set(_obj, camelCaseProp, value) {
      const dataAttr = toDataAttribute(camelCaseProp);
      elm.setAttribute(dataAttr, value);
      return true;
    },
  });
}
function toDataAttribute(str) {
  return ('data-' +
    String(str)
      .replace(/([A-Z0-9])/g, (g) => ' ' + g[0])
      .trim()
      .replace(/ /g, '-')
      .toLowerCase());
}
function dashToPascalCase(str) {
  str = String(str).slice(5);
  return str
    .split('-')
    .map((segment, index) => {
    if (index === 0) {
      return segment.charAt(0).toLowerCase() + segment.slice(1);
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  })
    .join('');
}

// Sizzle 2.3.6
const Sizzle = (function() {
const window = {
  document: {
  createElement() {
    return {};
  },
  nodeType: 9,
  documentElement: {
    nodeType: 1,
    nodeName: 'HTML'
  }
  }
};
const module = { exports: {} };

/*! Sizzle v2.3.6 | (c) JS Foundation and other contributors | js.foundation */
!function(e){var t,n,r,i,o,u,l,a,c,s,d,f,p,h,g,m,y,v,w,b="sizzle"+1*new Date,N=e.document,C=0,x=0,E=ae(),A=ae(),S=ae(),D=ae(),T=function(e,t){return e===t&&(d=!0),0},L={}.hasOwnProperty,q=[],I=q.pop,B=q.push,R=q.push,$=q.slice,k=function(e,t){for(var n=0,r=e.length;n<r;n++)if(e[n]===t)return n;return -1},H="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",P="(?:\\\\[\\da-fA-F]{1,6}"+M+"?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+",z="\\["+M+"*("+P+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+P+"))|)"+M+"*\\]",F=":("+P+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+z+")*)|.*)\\)|)",O=new RegExp(M+"+","g"),j=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),G=new RegExp("^"+M+"*,"+M+"*"),U=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),V=new RegExp(M+"|>"),X=new RegExp(F),J=new RegExp("^"+P+"$"),K={ID:new RegExp("^#("+P+")"),CLASS:new RegExp("^\\.("+P+")"),TAG:new RegExp("^("+P+"|[*])"),ATTR:new RegExp("^"+z),PSEUDO:new RegExp("^"+F),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+H+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Q=/HTML$/i,W=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Z=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ee=/[+~]/,te=new RegExp("\\\\[\\da-fA-F]{1,6}"+M+"?|\\\\([^\\r\\n\\f])","g"),ne=function(e,t){var n="0x"+e.slice(1)-65536;return t||(n<0?String.fromCharCode(n+65536):String.fromCharCode(n>>10|55296,1023&n|56320))},re=/([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,ie=function(e,t){return t?"\0"===e?"\ufffd":e.slice(0,-1)+"\\"+e.charCodeAt(e.length-1).toString(16)+" ":"\\"+e},oe=function(){f();},ue=ve(function(e){return !0===e.disabled&&"fieldset"===e.nodeName.toLowerCase()},{dir:"parentNode",next:"legend"});try{R.apply(q=$.call(N.childNodes),N.childNodes),q[N.childNodes.length].nodeType;}catch(e){R={apply:q.length?function(e,t){B.apply(e,$.call(t));}:function(e,t){var n=e.length,r=0;while(e[n++]=t[r++]);e.length=n-1;}};}function le(e,t,r,i){var o,l,c,s,d,h,y,v=t&&t.ownerDocument,N=t?t.nodeType:9;if(r=r||[],"string"!=typeof e||!e||1!==N&&9!==N&&11!==N)return r;if(!i&&(f(t),t=t||p,g)){if(11!==N&&(d=_.exec(e)))if(o=d[1]){if(9===N){if(!(c=t.getElementById(o)))return r;if(c.id===o)return r.push(c),r}else if(v&&(c=v.getElementById(o))&&w(t,c)&&c.id===o)return r.push(c),r}else {if(d[2])return R.apply(r,t.getElementsByTagName(e)),r;if((o=d[3])&&n.getElementsByClassName&&t.getElementsByClassName)return R.apply(r,t.getElementsByClassName(o)),r}if(n.qsa&&!D[e+" "]&&(!m||!m.test(e))&&(1!==N||"object"!==t.nodeName.toLowerCase())){if(y=e,v=t,1===N&&(V.test(e)||U.test(e))){(v=ee.test(e)&&ge(t.parentNode)||t)===t&&n.scope||((s=t.getAttribute("id"))?s=s.replace(re,ie):t.setAttribute("id",s=b)),l=(h=u(e)).length;while(l--)h[l]=(s?"#"+s:":scope")+" "+ye(h[l]);y=h.join(",");}try{return R.apply(r,v.querySelectorAll(y)),r}catch(t){D(e,!0);}finally{s===b&&t.removeAttribute("id");}}}return a(e.replace(j,"$1"),t,r,i)}function ae(){var e=[];function t(n,i){return e.push(n+" ")>r.cacheLength&&delete t[e.shift()],t[n+" "]=i}return t}function ce(e){return e[b]=!0,e}function se(e){var t=p.createElement("fieldset");try{return !!e(t)}catch(e){return !1}finally{t.parentNode&&t.parentNode.removeChild(t),t=null;}}function de(e,t){var n=e.split("|"),i=n.length;while(i--)r.attrHandle[n[i]]=t;}function fe(e,t){var n=t&&e,r=n&&1===e.nodeType&&1===t.nodeType&&e.sourceIndex-t.sourceIndex;if(r)return r;if(n)while(n=n.nextSibling)if(n===t)return -1;return e?1:-1}function pe(e){return function(t){return "form"in t?t.parentNode&&!1===t.disabled?"label"in t?"label"in t.parentNode?t.parentNode.disabled===e:t.disabled===e:t.isDisabled===e||t.isDisabled!==!e&&ue(t)===e:t.disabled===e:"label"in t&&t.disabled===e}}function he(e){return ce(function(t){return t=+t,ce(function(n,r){var i,o=e([],n.length,t),u=o.length;while(u--)n[i=o[u]]&&(n[i]=!(r[i]=n[i]));})})}function ge(e){return e&&void 0!==e.getElementsByTagName&&e}n=le.support={},o=le.isXML=function(e){var t=e&&e.namespaceURI,n=e&&(e.ownerDocument||e).documentElement;return !Q.test(t||n&&n.nodeName||"HTML")},f=le.setDocument=function(e){var t,i,u=e?e.ownerDocument||e:N;return u!=p&&9===u.nodeType&&u.documentElement?(p=u,h=p.documentElement,g=!o(p),N!=p&&(i=p.defaultView)&&i.top!==i&&(i.addEventListener?i.addEventListener("unload",oe,!1):i.attachEvent&&i.attachEvent("onunload",oe)),n.scope=se(function(e){return h.appendChild(e).appendChild(p.createElement("div")),void 0!==e.querySelectorAll&&!e.querySelectorAll(":scope fieldset div").length}),n.attributes=se(function(e){return e.className="i",!e.getAttribute("className")}),n.getElementsByTagName=se(function(e){return e.appendChild(p.createComment("")),!e.getElementsByTagName("*").length}),n.getElementsByClassName=Z.test(p.getElementsByClassName),n.getById=se(function(e){return h.appendChild(e).id=b,!p.getElementsByName||!p.getElementsByName(b).length}),n.getById?(r.filter.ID=function(e){var t=e.replace(te,ne);return function(e){return e.getAttribute("id")===t}},r.find.ID=function(e,t){if(void 0!==t.getElementById&&g){var n=t.getElementById(e);return n?[n]:[]}}):(r.filter.ID=function(e){var t=e.replace(te,ne);return function(e){var n=void 0!==e.getAttributeNode&&e.getAttributeNode("id");return n&&n.value===t}},r.find.ID=function(e,t){if(void 0!==t.getElementById&&g){var n,r,i,o=t.getElementById(e);if(o){if((n=o.getAttributeNode("id"))&&n.value===e)return [o];i=t.getElementsByName(e),r=0;while(o=i[r++])if((n=o.getAttributeNode("id"))&&n.value===e)return [o]}return []}}),r.find.TAG=n.getElementsByTagName?function(e,t){return void 0!==t.getElementsByTagName?t.getElementsByTagName(e):n.qsa?t.querySelectorAll(e):void 0}:function(e,t){var n,r=[],i=0,o=t.getElementsByTagName(e);if("*"===e){while(n=o[i++])1===n.nodeType&&r.push(n);return r}return o},r.find.CLASS=n.getElementsByClassName&&function(e,t){if(void 0!==t.getElementsByClassName&&g)return t.getElementsByClassName(e)},y=[],m=[],(n.qsa=Z.test(p.querySelectorAll))&&(se(function(e){var t;h.appendChild(e).innerHTML="<a id='"+b+"'></a><select id='"+b+"-\r\\' msallowcapture=''><option selected=''></option></select>",e.querySelectorAll("[msallowcapture^='']").length&&m.push("[*^$]="+M+"*(?:''|\"\")"),e.querySelectorAll("[selected]").length||m.push("\\["+M+"*(?:value|"+H+")"),e.querySelectorAll("[id~="+b+"-]").length||m.push("~="),(t=p.createElement("input")).setAttribute("name",""),e.appendChild(t),e.querySelectorAll("[name='']").length||m.push("\\["+M+"*name"+M+"*="+M+"*(?:''|\"\")"),e.querySelectorAll(":checked").length||m.push(":checked"),e.querySelectorAll("a#"+b+"+*").length||m.push(".#.+[+~]"),e.querySelectorAll("\\\f"),m.push("[\\r\\n\\f]");}),se(function(e){e.innerHTML="<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";var t=p.createElement("input");t.setAttribute("type","hidden"),e.appendChild(t).setAttribute("name","D"),e.querySelectorAll("[name=d]").length&&m.push("name"+M+"*[*^$|!~]?="),2!==e.querySelectorAll(":enabled").length&&m.push(":enabled",":disabled"),h.appendChild(e).disabled=!0,2!==e.querySelectorAll(":disabled").length&&m.push(":enabled",":disabled"),e.querySelectorAll("*,:x"),m.push(",.*:");})),(n.matchesSelector=Z.test(v=h.matches||h.webkitMatchesSelector||h.mozMatchesSelector||h.oMatchesSelector||h.msMatchesSelector))&&se(function(e){n.disconnectedMatch=v.call(e,"*"),v.call(e,"[s!='']:x"),y.push("!=",F);}),m=m.length&&new RegExp(m.join("|")),y=y.length&&new RegExp(y.join("|")),t=Z.test(h.compareDocumentPosition),w=t||Z.test(h.contains)?function(e,t){var n=9===e.nodeType?e.documentElement:e,r=t&&t.parentNode;return e===r||!(!r||1!==r.nodeType||!(n.contains?n.contains(r):e.compareDocumentPosition&&16&e.compareDocumentPosition(r)))}:function(e,t){if(t)while(t=t.parentNode)if(t===e)return !0;return !1},T=t?function(e,t){if(e===t)return d=!0,0;var r=!e.compareDocumentPosition-!t.compareDocumentPosition;return r||(1&(r=(e.ownerDocument||e)==(t.ownerDocument||t)?e.compareDocumentPosition(t):1)||!n.sortDetached&&t.compareDocumentPosition(e)===r?e==p||e.ownerDocument==N&&w(N,e)?-1:t==p||t.ownerDocument==N&&w(N,t)?1:s?k(s,e)-k(s,t):0:4&r?-1:1)}:function(e,t){if(e===t)return d=!0,0;var n,r=0,i=e.parentNode,o=t.parentNode,u=[e],l=[t];if(!i||!o)return e==p?-1:t==p?1:i?-1:o?1:s?k(s,e)-k(s,t):0;if(i===o)return fe(e,t);n=e;while(n=n.parentNode)u.unshift(n);n=t;while(n=n.parentNode)l.unshift(n);while(u[r]===l[r])r++;return r?fe(u[r],l[r]):u[r]==N?-1:l[r]==N?1:0},p):p},le.matches=function(e,t){return le(e,null,null,t)},le.matchesSelector=function(e,t){if(f(e),n.matchesSelector&&g&&!D[t+" "]&&(!y||!y.test(t))&&(!m||!m.test(t)))try{var r=v.call(e,t);if(r||n.disconnectedMatch||e.document&&11!==e.document.nodeType)return r}catch(e){D(t,!0);}return le(t,p,null,[e]).length>0},le.contains=function(e,t){return (e.ownerDocument||e)!=p&&f(e),w(e,t)},le.attr=function(e,t){(e.ownerDocument||e)!=p&&f(e);var i=r.attrHandle[t.toLowerCase()],o=i&&L.call(r.attrHandle,t.toLowerCase())?i(e,t,!g):void 0;return void 0!==o?o:n.attributes||!g?e.getAttribute(t):(o=e.getAttributeNode(t))&&o.specified?o.value:null},le.escape=function(e){return (e+"").replace(re,ie)},le.error=function(e){throw new Error("Syntax error, unrecognized expression: "+e)},le.uniqueSort=function(e){var t,r=[],i=0,o=0;if(d=!n.detectDuplicates,s=!n.sortStable&&e.slice(0),e.sort(T),d){while(t=e[o++])t===e[o]&&(i=r.push(o));while(i--)e.splice(r[i],1);}return s=null,e},i=le.getText=function(e){var t,n="",r=0,o=e.nodeType;if(o){if(1===o||9===o||11===o){if("string"==typeof e.textContent)return e.textContent;for(e=e.firstChild;e;e=e.nextSibling)n+=i(e);}else if(3===o||4===o)return e.nodeValue}else while(t=e[r++])n+=i(t);return n},(r=le.selectors={cacheLength:50,createPseudo:ce,match:K,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(e){return e[1]=e[1].replace(te,ne),e[3]=(e[3]||e[4]||e[5]||"").replace(te,ne),"~="===e[2]&&(e[3]=" "+e[3]+" "),e.slice(0,4)},CHILD:function(e){return e[1]=e[1].toLowerCase(),"nth"===e[1].slice(0,3)?(e[3]||le.error(e[0]),e[4]=+(e[4]?e[5]+(e[6]||1):2*("even"===e[3]||"odd"===e[3])),e[5]=+(e[7]+e[8]||"odd"===e[3])):e[3]&&le.error(e[0]),e},PSEUDO:function(e){var t,n=!e[6]&&e[2];return K.CHILD.test(e[0])?null:(e[3]?e[2]=e[4]||e[5]||"":n&&X.test(n)&&(t=u(n,!0))&&(t=n.indexOf(")",n.length-t)-n.length)&&(e[0]=e[0].slice(0,t),e[2]=n.slice(0,t)),e.slice(0,3))}},filter:{TAG:function(e){var t=e.replace(te,ne).toLowerCase();return "*"===e?function(){return !0}:function(e){return e.nodeName&&e.nodeName.toLowerCase()===t}},CLASS:function(e){var t=E[e+" "];return t||(t=new RegExp("(^|"+M+")"+e+"("+M+"|$)"))&&E(e,function(e){return t.test("string"==typeof e.className&&e.className||void 0!==e.getAttribute&&e.getAttribute("class")||"")})},ATTR:function(e,t,n){return function(r){var i=le.attr(r,e);return null==i?"!="===t:!t||(i+="","="===t?i===n:"!="===t?i!==n:"^="===t?n&&0===i.indexOf(n):"*="===t?n&&i.indexOf(n)>-1:"$="===t?n&&i.slice(-n.length)===n:"~="===t?(" "+i.replace(O," ")+" ").indexOf(n)>-1:"|="===t&&(i===n||i.slice(0,n.length+1)===n+"-"))}},CHILD:function(e,t,n,r,i){var o="nth"!==e.slice(0,3),u="last"!==e.slice(-4),l="of-type"===t;return 1===r&&0===i?function(e){return !!e.parentNode}:function(t,n,a){var c,s,d,f,p,h,g=o!==u?"nextSibling":"previousSibling",m=t.parentNode,y=l&&t.nodeName.toLowerCase(),v=!a&&!l,w=!1;if(m){if(o){while(g){f=t;while(f=f[g])if(l?f.nodeName.toLowerCase()===y:1===f.nodeType)return !1;h=g="only"===e&&!h&&"nextSibling";}return !0}if(h=[u?m.firstChild:m.lastChild],u&&v){w=(p=(c=(s=(d=(f=m)[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]||[])[0]===C&&c[1])&&c[2],f=p&&m.childNodes[p];while(f=++p&&f&&f[g]||(w=p=0)||h.pop())if(1===f.nodeType&&++w&&f===t){s[e]=[C,p,w];break}}else if(v&&(w=p=(c=(s=(d=(f=t)[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]||[])[0]===C&&c[1]),!1===w)while(f=++p&&f&&f[g]||(w=p=0)||h.pop())if((l?f.nodeName.toLowerCase()===y:1===f.nodeType)&&++w&&(v&&((s=(d=f[b]||(f[b]={}))[f.uniqueID]||(d[f.uniqueID]={}))[e]=[C,w]),f===t))break;return (w-=i)===r||w%r==0&&w/r>=0}}},PSEUDO:function(e,t){var n,i=r.pseudos[e]||r.setFilters[e.toLowerCase()]||le.error("unsupported pseudo: "+e);return i[b]?i(t):i.length>1?(n=[e,e,"",t],r.setFilters.hasOwnProperty(e.toLowerCase())?ce(function(e,n){var r,o=i(e,t),u=o.length;while(u--)e[r=k(e,o[u])]=!(n[r]=o[u]);}):function(e){return i(e,0,n)}):i}},pseudos:{not:ce(function(e){var t=[],n=[],r=l(e.replace(j,"$1"));return r[b]?ce(function(e,t,n,i){var o,u=r(e,null,i,[]),l=e.length;while(l--)(o=u[l])&&(e[l]=!(t[l]=o));}):function(e,i,o){return t[0]=e,r(t,null,o,n),t[0]=null,!n.pop()}}),has:ce(function(e){return function(t){return le(e,t).length>0}}),contains:ce(function(e){return e=e.replace(te,ne),function(t){return (t.textContent||i(t)).indexOf(e)>-1}}),lang:ce(function(e){return J.test(e||"")||le.error("unsupported lang: "+e),e=e.replace(te,ne).toLowerCase(),function(t){var n;do{if(n=g?t.lang:t.getAttribute("xml:lang")||t.getAttribute("lang"))return (n=n.toLowerCase())===e||0===n.indexOf(e+"-")}while((t=t.parentNode)&&1===t.nodeType);return !1}}),target:function(t){var n=e.location&&e.location.hash;return n&&n.slice(1)===t.id},root:function(e){return e===h},focus:function(e){return e===p.activeElement&&(!p.hasFocus||p.hasFocus())&&!!(e.type||e.href||~e.tabIndex)},enabled:pe(!1),disabled:pe(!0),checked:function(e){var t=e.nodeName.toLowerCase();return "input"===t&&!!e.checked||"option"===t&&!!e.selected},selected:function(e){return e.parentNode&&e.parentNode.selectedIndex,!0===e.selected},empty:function(e){for(e=e.firstChild;e;e=e.nextSibling)if(e.nodeType<6)return !1;return !0},parent:function(e){return !r.pseudos.empty(e)},header:function(e){return Y.test(e.nodeName)},input:function(e){return W.test(e.nodeName)},button:function(e){var t=e.nodeName.toLowerCase();return "input"===t&&"button"===e.type||"button"===t},text:function(e){var t;return "input"===e.nodeName.toLowerCase()&&"text"===e.type&&(null==(t=e.getAttribute("type"))||"text"===t.toLowerCase())},first:he(function(){return [0]}),last:he(function(e,t){return [t-1]}),eq:he(function(e,t,n){return [n<0?n+t:n]}),even:he(function(e,t){for(var n=0;n<t;n+=2)e.push(n);return e}),odd:he(function(e,t){for(var n=1;n<t;n+=2)e.push(n);return e}),lt:he(function(e,t,n){for(var r=n<0?n+t:n>t?t:n;--r>=0;)e.push(r);return e}),gt:he(function(e,t,n){for(var r=n<0?n+t:n;++r<t;)e.push(r);return e})}}).pseudos.nth=r.pseudos.eq;for(t in {radio:!0,checkbox:!0,file:!0,password:!0,image:!0})r.pseudos[t]=function(e){return function(t){return "input"===t.nodeName.toLowerCase()&&t.type===e}}(t);for(t in {submit:!0,reset:!0})r.pseudos[t]=function(e){return function(t){var n=t.nodeName.toLowerCase();return ("input"===n||"button"===n)&&t.type===e}}(t);function me(){}me.prototype=r.filters=r.pseudos,r.setFilters=new me,u=le.tokenize=function(e,t){var n,i,o,u,l,a,c,s=A[e+" "];if(s)return t?0:s.slice(0);l=e,a=[],c=r.preFilter;while(l){n&&!(i=G.exec(l))||(i&&(l=l.slice(i[0].length)||l),a.push(o=[])),n=!1,(i=U.exec(l))&&(n=i.shift(),o.push({value:n,type:i[0].replace(j," ")}),l=l.slice(n.length));for(u in r.filter)!(i=K[u].exec(l))||c[u]&&!(i=c[u](i))||(n=i.shift(),o.push({value:n,type:u,matches:i}),l=l.slice(n.length));if(!n)break}return t?l.length:l?le.error(e):A(e,a).slice(0)};function ye(e){for(var t=0,n=e.length,r="";t<n;t++)r+=e[t].value;return r}function ve(e,t,n){var r=t.dir,i=t.next,o=i||r,u=n&&"parentNode"===o,l=x++;return t.first?function(t,n,i){while(t=t[r])if(1===t.nodeType||u)return e(t,n,i);return !1}:function(t,n,a){var c,s,d,f=[C,l];if(a){while(t=t[r])if((1===t.nodeType||u)&&e(t,n,a))return !0}else while(t=t[r])if(1===t.nodeType||u)if(d=t[b]||(t[b]={}),s=d[t.uniqueID]||(d[t.uniqueID]={}),i&&i===t.nodeName.toLowerCase())t=t[r]||t;else {if((c=s[o])&&c[0]===C&&c[1]===l)return f[2]=c[2];if(s[o]=f,f[2]=e(t,n,a))return !0}return !1}}function we(e){return e.length>1?function(t,n,r){var i=e.length;while(i--)if(!e[i](t,n,r))return !1;return !0}:e[0]}function be(e,t,n){for(var r=0,i=t.length;r<i;r++)le(e,t[r],n);return n}function Ne(e,t,n,r,i){for(var o,u=[],l=0,a=e.length,c=null!=t;l<a;l++)(o=e[l])&&(n&&!n(o,r,i)||(u.push(o),c&&t.push(l)));return u}function Ce(e,t,n,r,i,o){return r&&!r[b]&&(r=Ce(r)),i&&!i[b]&&(i=Ce(i,o)),ce(function(o,u,l,a){var c,s,d,f=[],p=[],h=u.length,g=o||be(t||"*",l.nodeType?[l]:l,[]),m=!e||!o&&t?g:Ne(g,f,e,l,a),y=n?i||(o?e:h||r)?[]:u:m;if(n&&n(m,y,l,a),r){c=Ne(y,p),r(c,[],l,a),s=c.length;while(s--)(d=c[s])&&(y[p[s]]=!(m[p[s]]=d));}if(o){if(i||e){if(i){c=[],s=y.length;while(s--)(d=y[s])&&c.push(m[s]=d);i(null,y=[],c,a);}s=y.length;while(s--)(d=y[s])&&(c=i?k(o,d):f[s])>-1&&(o[c]=!(u[c]=d));}}else y=Ne(y===u?y.splice(h,y.length):y),i?i(null,u,y,a):R.apply(u,y);})}function xe(e){for(var t,n,i,o=e.length,u=r.relative[e[0].type],l=u||r.relative[" "],a=u?1:0,s=ve(function(e){return e===t},l,!0),d=ve(function(e){return k(t,e)>-1},l,!0),f=[function(e,n,r){var i=!u&&(r||n!==c)||((t=n).nodeType?s(e,n,r):d(e,n,r));return t=null,i}];a<o;a++)if(n=r.relative[e[a].type])f=[ve(we(f),n)];else {if((n=r.filter[e[a].type].apply(null,e[a].matches))[b]){for(i=++a;i<o;i++)if(r.relative[e[i].type])break;return Ce(a>1&&we(f),a>1&&ye(e.slice(0,a-1).concat({value:" "===e[a-2].type?"*":""})).replace(j,"$1"),n,a<i&&xe(e.slice(a,i)),i<o&&xe(e=e.slice(i)),i<o&&ye(e))}f.push(n);}return we(f)}function Ee(e,t){var n=t.length>0,i=e.length>0,o=function(o,u,l,a,s){var d,h,m,y=0,v="0",w=o&&[],b=[],N=c,x=o||i&&r.find.TAG("*",s),E=C+=null==N?1:Math.random()||.1,A=x.length;for(s&&(c=u==p||u||s);v!==A&&null!=(d=x[v]);v++){if(i&&d){h=0,u||d.ownerDocument==p||(f(d),l=!g);while(m=e[h++])if(m(d,u||p,l)){a.push(d);break}s&&(C=E);}n&&((d=!m&&d)&&y--,o&&w.push(d));}if(y+=v,n&&v!==y){h=0;while(m=t[h++])m(w,b,u,l);if(o){if(y>0)while(v--)w[v]||b[v]||(b[v]=I.call(a));b=Ne(b);}R.apply(a,b),s&&!o&&b.length>0&&y+t.length>1&&le.uniqueSort(a);}return s&&(C=E,c=N),w};return n?ce(o):o}l=le.compile=function(e,t){var n,r=[],i=[],o=S[e+" "];if(!o){t||(t=u(e)),n=t.length;while(n--)(o=xe(t[n]))[b]?r.push(o):i.push(o);(o=S(e,Ee(i,r))).selector=e;}return o},a=le.select=function(e,t,n,i){var o,a,c,s,d,f="function"==typeof e&&e,p=!i&&u(e=f.selector||e);if(n=n||[],1===p.length){if((a=p[0]=p[0].slice(0)).length>2&&"ID"===(c=a[0]).type&&9===t.nodeType&&g&&r.relative[a[1].type]){if(!(t=(r.find.ID(c.matches[0].replace(te,ne),t)||[])[0]))return n;f&&(t=t.parentNode),e=e.slice(a.shift().value.length);}o=K.needsContext.test(e)?0:a.length;while(o--){if(c=a[o],r.relative[s=c.type])break;if((d=r.find[s])&&(i=d(c.matches[0].replace(te,ne),ee.test(a[0].type)&&ge(t.parentNode)||t))){if(a.splice(o,1),!(e=i.length&&ye(a)))return R.apply(n,i),n;break}}}return (f||l(e,p))(i,t,!g,n,!t||ee.test(e)&&ge(t.parentNode)||t),n},n.sortStable=b.split("").sort(T).join("")===b,n.detectDuplicates=!!d,f(),n.sortDetached=se(function(e){return 1&e.compareDocumentPosition(p.createElement("fieldset"))}),se(function(e){return e.innerHTML="<a href='#'></a>","#"===e.firstChild.getAttribute("href")})||de("type|href|height|width",function(e,t,n){if(!n)return e.getAttribute(t,"type"===t.toLowerCase()?1:2)}),n.attributes&&se(function(e){return e.innerHTML="<input/>",e.firstChild.setAttribute("value",""),""===e.firstChild.getAttribute("value")})||de("value",function(e,t,n){if(!n&&"input"===e.nodeName.toLowerCase())return e.defaultValue}),se(function(e){return null==e.getAttribute("disabled")})||de(H,function(e,t,n){var r;if(!n)return !0===e[t]?t.toLowerCase():(r=e.getAttributeNode(t))&&r.specified?r.value:null});var Ae=e.Sizzle;le.noConflict=function(){return e.Sizzle===le&&(e.Sizzle=Ae),le},"function"==typeof define&&define.amd?define(function(){return le}):"undefined"!=typeof module&&module.exports?module.exports=le:e.Sizzle=le;}(window);
//# sourceMappingURL=sizzle.min.map

return module.exports;
})();

function matches(selector, elm) {
  const r = Sizzle.matches(selector, [elm]);
  return r.length > 0;
}
function selectOne(selector, elm) {
  const r = Sizzle(selector, elm);
  return r[0] || null;
}
function selectAll(selector, elm) {
  return Sizzle(selector, elm);
}

class MockClassList {
  constructor(elm) {
    this.elm = elm;
  }
  add(...classNames) {
    const clsNames = getItems(this.elm);
    let updated = false;
    classNames.forEach((className) => {
      className = String(className);
      validateClass(className);
      if (clsNames.includes(className) === false) {
        clsNames.push(className);
        updated = true;
      }
    });
    if (updated) {
      this.elm.setAttributeNS(null, 'class', clsNames.join(' '));
    }
  }
  remove(...classNames) {
    const clsNames = getItems(this.elm);
    let updated = false;
    classNames.forEach((className) => {
      className = String(className);
      validateClass(className);
      const index = clsNames.indexOf(className);
      if (index > -1) {
        clsNames.splice(index, 1);
        updated = true;
      }
    });
    if (updated) {
      this.elm.setAttributeNS(null, 'class', clsNames.filter((c) => c.length > 0).join(' '));
    }
  }
  contains(className) {
    className = String(className);
    return getItems(this.elm).includes(className);
  }
  toggle(className) {
    className = String(className);
    if (this.contains(className) === true) {
      this.remove(className);
    }
    else {
      this.add(className);
    }
  }
  get length() {
    return getItems(this.elm).length;
  }
  item(index) {
    return getItems(this.elm)[index];
  }
  toString() {
    return getItems(this.elm).join(' ');
  }
}
function validateClass(className) {
  if (className === '') {
    throw new Error('The token provided must not be empty.');
  }
  if (/\s/.test(className)) {
    throw new Error(`The token provided ('${className}') contains HTML space characters, which are not valid in tokens.`);
  }
}
function getItems(elm) {
  const className = elm.getAttribute('class');
  if (typeof className === 'string' && className.length > 0) {
    return className
      .trim()
      .split(' ')
      .filter((c) => c.length > 0);
  }
  return [];
}

class MockCSSStyleDeclaration {
  constructor() {
    this._styles = new Map();
  }
  setProperty(prop, value) {
    prop = jsCaseToCssCase(prop);
    if (value == null || value === '') {
      this._styles.delete(prop);
    }
    else {
      this._styles.set(prop, String(value));
    }
  }
  getPropertyValue(prop) {
    prop = jsCaseToCssCase(prop);
    return String(this._styles.get(prop) || '');
  }
  removeProperty(prop) {
    prop = jsCaseToCssCase(prop);
    this._styles.delete(prop);
  }
  get length() {
    return this._styles.size;
  }
  get cssText() {
    const cssText = [];
    this._styles.forEach((value, prop) => {
      cssText.push(`${prop}: ${value};`);
    });
    return cssText.join(' ').trim();
  }
  set cssText(cssText) {
    if (cssText == null || cssText === '') {
      this._styles.clear();
      return;
    }
    cssText.split(';').forEach((rule) => {
      rule = rule.trim();
      if (rule.length > 0) {
        const splt = rule.split(':');
        if (splt.length > 1) {
          const prop = splt[0].trim();
          const value = splt.slice(1).join(':').trim();
          if (prop !== '' && value !== '') {
            this._styles.set(jsCaseToCssCase(prop), value);
          }
        }
      }
    });
  }
}
function createCSSStyleDeclaration() {
  return new Proxy(new MockCSSStyleDeclaration(), cssProxyHandler);
}
const cssProxyHandler = {
  get(cssStyle, prop) {
    if (prop in cssStyle) {
      return cssStyle[prop];
    }
    prop = cssCaseToJsCase(prop);
    return cssStyle.getPropertyValue(prop);
  },
  set(cssStyle, prop, value) {
    if (prop in cssStyle) {
      cssStyle[prop] = value;
    }
    else {
      cssStyle.setProperty(prop, value);
    }
    return true;
  },
};
function cssCaseToJsCase(str) {
  // font-size to fontSize
  if (str.length > 1 && str.includes('-') === true) {
    str = str
      .toLowerCase()
      .split('-')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('');
    str = str.slice(0, 1).toLowerCase() + str.slice(1);
  }
  return str;
}
function jsCaseToCssCase(str) {
  // fontSize to font-size
  if (str.length > 1 && str.includes('-') === false && /[A-Z]/.test(str) === true) {
    str = str
      .replace(/([A-Z])/g, (g) => ' ' + g[0])
      .trim()
      .replace(/ /g, '-')
      .toLowerCase();
  }
  return str;
}

class MockEvent {
  constructor(type, eventInitDict) {
    this.bubbles = false;
    this.cancelBubble = false;
    this.cancelable = false;
    this.composed = false;
    this.currentTarget = null;
    this.defaultPrevented = false;
    this.srcElement = null;
    this.target = null;
    if (typeof type !== 'string') {
      throw new Error(`Event type required`);
    }
    this.type = type;
    this.timeStamp = Date.now();
    if (eventInitDict != null) {
      Object.assign(this, eventInitDict);
    }
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
  stopPropagation() {
    this.cancelBubble = true;
  }
  stopImmediatePropagation() {
    this.cancelBubble = true;
  }
  composedPath() {
    const composedPath = [];
    let currentElement = this.target;
    while (currentElement) {
      composedPath.push(currentElement);
      if (!currentElement.parentElement && currentElement.nodeName === "#document" /* DOCUMENT_NODE */) {
        // the current element doesn't have a parent, but we've detected it's our root document node. push the window
        // object associated with the document onto the path
        composedPath.push(currentElement.defaultView);
        break;
      }
      currentElement = currentElement.parentElement;
    }
    return composedPath;
  }
}
class MockCustomEvent extends MockEvent {
  constructor(type, customEventInitDic) {
    super(type);
    this.detail = null;
    if (customEventInitDic != null) {
      Object.assign(this, customEventInitDic);
    }
  }
}
class MockKeyboardEvent extends MockEvent {
  constructor(type, keyboardEventInitDic) {
    super(type);
    this.code = '';
    this.key = '';
    this.altKey = false;
    this.ctrlKey = false;
    this.metaKey = false;
    this.shiftKey = false;
    this.location = 0;
    this.repeat = false;
    if (keyboardEventInitDic != null) {
      Object.assign(this, keyboardEventInitDic);
    }
  }
}
class MockMouseEvent extends MockEvent {
  constructor(type, mouseEventInitDic) {
    super(type);
    this.screenX = 0;
    this.screenY = 0;
    this.clientX = 0;
    this.clientY = 0;
    this.ctrlKey = false;
    this.shiftKey = false;
    this.altKey = false;
    this.metaKey = false;
    this.button = 0;
    this.buttons = 0;
    this.relatedTarget = null;
    if (mouseEventInitDic != null) {
      Object.assign(this, mouseEventInitDic);
    }
  }
}
class MockEventListener {
  constructor(type, handler) {
    this.type = type;
    this.handler = handler;
  }
}
function addEventListener(elm, type, handler) {
  const target = elm;
  if (target.__listeners == null) {
    target.__listeners = [];
  }
  target.__listeners.push(new MockEventListener(type, handler));
}
function removeEventListener(elm, type, handler) {
  const target = elm;
  if (target != null && Array.isArray(target.__listeners) === true) {
    const elmListener = target.__listeners.find((e) => e.type === type && e.handler === handler);
    if (elmListener != null) {
      const index = target.__listeners.indexOf(elmListener);
      target.__listeners.splice(index, 1);
    }
  }
}
function resetEventListeners(target) {
  if (target != null && target.__listeners != null) {
    target.__listeners = null;
  }
}
function triggerEventListener(elm, ev) {
  if (elm == null || ev.cancelBubble === true) {
    return;
  }
  const target = elm;
  ev.currentTarget = elm;
  if (Array.isArray(target.__listeners) === true) {
    const listeners = target.__listeners.filter((e) => e.type === ev.type);
    listeners.forEach((listener) => {
      try {
        listener.handler.call(target, ev);
      }
      catch (err) {
        console.error(err);
      }
    });
  }
  if (ev.bubbles === false) {
    return;
  }
  if (elm.nodeName === "#document" /* DOCUMENT_NODE */) {
    triggerEventListener(elm.defaultView, ev);
  }
  else {
    triggerEventListener(elm.parentElement, ev);
  }
}
function dispatchEvent(currentTarget, ev) {
  ev.target = currentTarget;
  triggerEventListener(currentTarget, ev);
  return true;
}

function serializeNodeToHtml(elm, opts = {}) {
  const output = {
    currentLineWidth: 0,
    indent: 0,
    isWithinBody: false,
    text: [],
  };
  if (opts.prettyHtml) {
    if (typeof opts.indentSpaces !== 'number') {
      opts.indentSpaces = 2;
    }
    if (typeof opts.newLines !== 'boolean') {
      opts.newLines = true;
    }
    opts.approximateLineWidth = -1;
  }
  else {
    opts.prettyHtml = false;
    if (typeof opts.newLines !== 'boolean') {
      opts.newLines = false;
    }
    if (typeof opts.indentSpaces !== 'number') {
      opts.indentSpaces = 0;
    }
  }
  if (typeof opts.approximateLineWidth !== 'number') {
    opts.approximateLineWidth = -1;
  }
  if (typeof opts.removeEmptyAttributes !== 'boolean') {
    opts.removeEmptyAttributes = true;
  }
  if (typeof opts.removeAttributeQuotes !== 'boolean') {
    opts.removeAttributeQuotes = false;
  }
  if (typeof opts.removeBooleanAttributeQuotes !== 'boolean') {
    opts.removeBooleanAttributeQuotes = false;
  }
  if (typeof opts.removeHtmlComments !== 'boolean') {
    opts.removeHtmlComments = false;
  }
  if (typeof opts.serializeShadowRoot !== 'boolean') {
    opts.serializeShadowRoot = false;
  }
  if (opts.outerHtml) {
    serializeToHtml(elm, opts, output, false);
  }
  else {
    for (let i = 0, ii = elm.childNodes.length; i < ii; i++) {
      serializeToHtml(elm.childNodes[i], opts, output, false);
    }
  }
  if (output.text[0] === '\n') {
    output.text.shift();
  }
  if (output.text[output.text.length - 1] === '\n') {
    output.text.pop();
  }
  return output.text.join('');
}
function serializeToHtml(node, opts, output, isShadowRoot) {
  if (node.nodeType === 1 /* ELEMENT_NODE */ || isShadowRoot) {
    const tagName = isShadowRoot ? 'mock:shadow-root' : getTagName(node);
    if (tagName === 'body') {
      output.isWithinBody = true;
    }
    const ignoreTag = opts.excludeTags != null && opts.excludeTags.includes(tagName);
    if (ignoreTag === false) {
      const isWithinWhitespaceSensitiveNode = opts.newLines || opts.indentSpaces > 0 ? isWithinWhitespaceSensitive(node) : false;
      if (opts.newLines && !isWithinWhitespaceSensitiveNode) {
        output.text.push('\n');
        output.currentLineWidth = 0;
      }
      if (opts.indentSpaces > 0 && !isWithinWhitespaceSensitiveNode) {
        for (let i = 0; i < output.indent; i++) {
          output.text.push(' ');
        }
        output.currentLineWidth += output.indent;
      }
      output.text.push('<' + tagName);
      output.currentLineWidth += tagName.length + 1;
      const attrsLength = node.attributes.length;
      const attributes = opts.prettyHtml && attrsLength > 1
        ? cloneAttributes(node.attributes, true)
        : node.attributes;
      for (let i = 0; i < attrsLength; i++) {
        const attr = attributes.item(i);
        const attrName = attr.name;
        if (attrName === 'style') {
          continue;
        }
        let attrValue = attr.value;
        if (opts.removeEmptyAttributes && attrValue === '' && REMOVE_EMPTY_ATTR.has(attrName)) {
          continue;
        }
        const attrNamespaceURI = attr.namespaceURI;
        if (attrNamespaceURI == null) {
          output.currentLineWidth += attrName.length + 1;
          if (opts.approximateLineWidth > 0 && output.currentLineWidth > opts.approximateLineWidth) {
            output.text.push('\n' + attrName);
            output.currentLineWidth = 0;
          }
          else {
            output.text.push(' ' + attrName);
          }
        }
        else if (attrNamespaceURI === 'http://www.w3.org/XML/1998/namespace') {
          output.text.push(' xml:' + attrName);
          output.currentLineWidth += attrName.length + 5;
        }
        else if (attrNamespaceURI === 'http://www.w3.org/2000/xmlns/') {
          if (attrName !== 'xmlns') {
            output.text.push(' xmlns:' + attrName);
            output.currentLineWidth += attrName.length + 7;
          }
          else {
            output.text.push(' ' + attrName);
            output.currentLineWidth += attrName.length + 1;
          }
        }
        else if (attrNamespaceURI === XLINK_NS) {
          output.text.push(' xlink:' + attrName);
          output.currentLineWidth += attrName.length + 7;
        }
        else {
          output.text.push(' ' + attrNamespaceURI + ':' + attrName);
          output.currentLineWidth += attrNamespaceURI.length + attrName.length + 2;
        }
        if (opts.prettyHtml && attrName === 'class') {
          attrValue = attr.value = attrValue
            .split(' ')
            .filter((t) => t !== '')
            .sort()
            .join(' ')
            .trim();
        }
        if (attrValue === '') {
          if (opts.removeBooleanAttributeQuotes && BOOLEAN_ATTR.has(attrName)) {
            continue;
          }
          if (opts.removeEmptyAttributes && attrName.startsWith('data-')) {
            continue;
          }
        }
        if (opts.removeAttributeQuotes && CAN_REMOVE_ATTR_QUOTES.test(attrValue)) {
          output.text.push('=' + escapeString(attrValue, true));
          output.currentLineWidth += attrValue.length + 1;
        }
        else {
          output.text.push('="' + escapeString(attrValue, true) + '"');
          output.currentLineWidth += attrValue.length + 3;
        }
      }
      if (node.hasAttribute('style')) {
        const cssText = node.style.cssText;
        if (opts.approximateLineWidth > 0 &&
          output.currentLineWidth + cssText.length + 10 > opts.approximateLineWidth) {
          output.text.push(`\nstyle="${cssText}">`);
          output.currentLineWidth = 0;
        }
        else {
          output.text.push(` style="${cssText}">`);
          output.currentLineWidth += cssText.length + 10;
        }
      }
      else {
        output.text.push('>');
        output.currentLineWidth += 1;
      }
    }
    if (EMPTY_ELEMENTS.has(tagName) === false) {
      if (opts.serializeShadowRoot && node.shadowRoot != null) {
        output.indent = output.indent + opts.indentSpaces;
        serializeToHtml(node.shadowRoot, opts, output, true);
        output.indent = output.indent - opts.indentSpaces;
        if (opts.newLines &&
          (node.childNodes.length === 0 ||
            (node.childNodes.length === 1 &&
              node.childNodes[0].nodeType === 3 /* TEXT_NODE */ &&
              node.childNodes[0].nodeValue.trim() === ''))) {
          output.text.push('\n');
          output.currentLineWidth = 0;
          for (let i = 0; i < output.indent; i++) {
            output.text.push(' ');
          }
          output.currentLineWidth += output.indent;
        }
      }
      if (opts.excludeTagContent == null || opts.excludeTagContent.includes(tagName) === false) {
        const childNodes = tagName === 'template' ? node.content.childNodes : node.childNodes;
        const childNodeLength = childNodes.length;
        if (childNodeLength > 0) {
          if (childNodeLength === 1 &&
            childNodes[0].nodeType === 3 /* TEXT_NODE */ &&
            (typeof childNodes[0].nodeValue !== 'string' || childNodes[0].nodeValue.trim() === '')) ;
          else {
            const isWithinWhitespaceSensitiveNode = opts.newLines || opts.indentSpaces > 0 ? isWithinWhitespaceSensitive(node) : false;
            if (!isWithinWhitespaceSensitiveNode && opts.indentSpaces > 0 && ignoreTag === false) {
              output.indent = output.indent + opts.indentSpaces;
            }
            for (let i = 0; i < childNodeLength; i++) {
              serializeToHtml(childNodes[i], opts, output, false);
            }
            if (ignoreTag === false) {
              if (opts.newLines && !isWithinWhitespaceSensitiveNode) {
                output.text.push('\n');
                output.currentLineWidth = 0;
              }
              if (opts.indentSpaces > 0 && !isWithinWhitespaceSensitiveNode) {
                output.indent = output.indent - opts.indentSpaces;
                for (let i = 0; i < output.indent; i++) {
                  output.text.push(' ');
                }
                output.currentLineWidth += output.indent;
              }
            }
          }
        }
        if (ignoreTag === false) {
          output.text.push('</' + tagName + '>');
          output.currentLineWidth += tagName.length + 3;
        }
      }
    }
    if (opts.approximateLineWidth > 0 && STRUCTURE_ELEMENTS.has(tagName)) {
      output.text.push('\n');
      output.currentLineWidth = 0;
    }
    if (tagName === 'body') {
      output.isWithinBody = false;
    }
  }
  else if (node.nodeType === 3 /* TEXT_NODE */) {
    let textContent = node.nodeValue;
    if (typeof textContent === 'string') {
      const trimmedTextContent = textContent.trim();
      if (trimmedTextContent === '') {
        // this text node is whitespace only
        if (isWithinWhitespaceSensitive(node)) {
          // whitespace matters within this element
          // just add the exact text we were given
          output.text.push(textContent);
          output.currentLineWidth += textContent.length;
        }
        else if (opts.approximateLineWidth > 0 && !output.isWithinBody) ;
        else if (!opts.prettyHtml) {
          // this text node is only whitespace, and it's not
          // within a whitespace sensitive element like <pre> or <code>
          // so replace the entire white space with a single new line
          output.currentLineWidth += 1;
          if (opts.approximateLineWidth > 0 && output.currentLineWidth > opts.approximateLineWidth) {
            // good enough for a new line
            // for perf these are all just estimates
            // we don't care to ensure exact line lengths
            output.text.push('\n');
            output.currentLineWidth = 0;
          }
          else {
            // let's keep it all on the same line yet
            output.text.push(' ');
          }
        }
      }
      else {
        // this text node has text content
        const isWithinWhitespaceSensitiveNode = opts.newLines || opts.indentSpaces > 0 || opts.prettyHtml ? isWithinWhitespaceSensitive(node) : false;
        if (opts.newLines && !isWithinWhitespaceSensitiveNode) {
          output.text.push('\n');
          output.currentLineWidth = 0;
        }
        if (opts.indentSpaces > 0 && !isWithinWhitespaceSensitiveNode) {
          for (let i = 0; i < output.indent; i++) {
            output.text.push(' ');
          }
          output.currentLineWidth += output.indent;
        }
        let textContentLength = textContent.length;
        if (textContentLength > 0) {
          // this text node has text content
          const parentTagName = node.parentNode != null && node.parentNode.nodeType === 1 /* ELEMENT_NODE */
            ? node.parentNode.nodeName
            : null;
          if (NON_ESCAPABLE_CONTENT.has(parentTagName)) {
            // this text node cannot have its content escaped since it's going
            // into an element like <style> or <script>
            if (isWithinWhitespaceSensitive(node)) {
              output.text.push(textContent);
            }
            else {
              output.text.push(trimmedTextContent);
              textContentLength = trimmedTextContent.length;
            }
            output.currentLineWidth += textContentLength;
          }
          else {
            // this text node is going into a normal element and html can be escaped
            if (opts.prettyHtml && !isWithinWhitespaceSensitiveNode) {
              // pretty print the text node
              output.text.push(escapeString(textContent.replace(/\s\s+/g, ' ').trim(), false));
              output.currentLineWidth += textContentLength;
            }
            else {
              // not pretty printing the text node
              if (isWithinWhitespaceSensitive(node)) {
                output.currentLineWidth += textContentLength;
              }
              else {
                // this element is not a whitespace sensitive one, like <pre> or <code> so
                // any whitespace at the start and end can be cleaned up to just be one space
                if (/\s/.test(textContent.charAt(0))) {
                  textContent = ' ' + textContent.trimLeft();
                }
                textContentLength = textContent.length;
                if (textContentLength > 1) {
                  if (/\s/.test(textContent.charAt(textContentLength - 1))) {
                    if (opts.approximateLineWidth > 0 &&
                      output.currentLineWidth + textContentLength > opts.approximateLineWidth) {
                      textContent = textContent.trimRight() + '\n';
                      output.currentLineWidth = 0;
                    }
                    else {
                      textContent = textContent.trimRight() + ' ';
                    }
                  }
                }
                output.currentLineWidth += textContentLength;
              }
              output.text.push(escapeString(textContent, false));
            }
          }
        }
      }
    }
  }
  else if (node.nodeType === 8 /* COMMENT_NODE */) {
    const nodeValue = node.nodeValue;
    if (opts.removeHtmlComments) {
      const isHydrateAnnotation = nodeValue.startsWith(CONTENT_REF_ID + '.') ||
        nodeValue.startsWith(ORG_LOCATION_ID + '.') ||
        nodeValue.startsWith(SLOT_NODE_ID + '.') ||
        nodeValue.startsWith(TEXT_NODE_ID + '.');
      if (!isHydrateAnnotation) {
        return;
      }
    }
    const isWithinWhitespaceSensitiveNode = opts.newLines || opts.indentSpaces > 0 ? isWithinWhitespaceSensitive(node) : false;
    if (opts.newLines && !isWithinWhitespaceSensitiveNode) {
      output.text.push('\n');
      output.currentLineWidth = 0;
    }
    if (opts.indentSpaces > 0 && !isWithinWhitespaceSensitiveNode) {
      for (let i = 0; i < output.indent; i++) {
        output.text.push(' ');
      }
      output.currentLineWidth += output.indent;
    }
    output.text.push('<!--' + nodeValue + '-->');
    output.currentLineWidth += nodeValue.length + 7;
  }
  else if (node.nodeType === 10 /* DOCUMENT_TYPE_NODE */) {
    output.text.push('<!doctype html>');
  }
}
const AMP_REGEX = /&/g;
const NBSP_REGEX = /\u00a0/g;
const DOUBLE_QUOTE_REGEX = /"/g;
const LT_REGEX = /</g;
const GT_REGEX = />/g;
const CAN_REMOVE_ATTR_QUOTES = /^[^ \t\n\f\r"'`=<>\/\\-]+$/;
function getTagName(element) {
  if (element.namespaceURI === 'http://www.w3.org/1999/xhtml') {
    return element.nodeName.toLowerCase();
  }
  else {
    return element.nodeName;
  }
}
function escapeString(str, attrMode) {
  str = str.replace(AMP_REGEX, '&amp;').replace(NBSP_REGEX, '&nbsp;');
  if (attrMode) {
    return str.replace(DOUBLE_QUOTE_REGEX, '&quot;');
  }
  return str.replace(LT_REGEX, '&lt;').replace(GT_REGEX, '&gt;');
}
function isWithinWhitespaceSensitive(node) {
  while (node != null) {
    if (WHITESPACE_SENSITIVE.has(node.nodeName)) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
/*@__PURE__*/ const NON_ESCAPABLE_CONTENT = new Set([
  'STYLE',
  'SCRIPT',
  'IFRAME',
  'NOSCRIPT',
  'XMP',
  'NOEMBED',
  'NOFRAMES',
  'PLAINTEXT',
]);
/*@__PURE__*/ const WHITESPACE_SENSITIVE = new Set([
  'CODE',
  'OUTPUT',
  'PLAINTEXT',
  'PRE',
  'SCRIPT',
  'TEMPLATE',
  'TEXTAREA',
]);
/*@__PURE__*/ const EMPTY_ELEMENTS = new Set([
  'area',
  'base',
  'basefont',
  'bgsound',
  'br',
  'col',
  'embed',
  'frame',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'trace',
  'wbr',
]);
/*@__PURE__*/ const REMOVE_EMPTY_ATTR = new Set(['class', 'dir', 'id', 'lang', 'name', 'title']);
/*@__PURE__*/ const BOOLEAN_ATTR = new Set([
  'allowfullscreen',
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'compact',
  'controls',
  'declare',
  'default',
  'defaultchecked',
  'defaultmuted',
  'defaultselected',
  'defer',
  'disabled',
  'enabled',
  'formnovalidate',
  'hidden',
  'indeterminate',
  'inert',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'nohref',
  'nomodule',
  'noresize',
  'noshade',
  'novalidate',
  'nowrap',
  'open',
  'pauseonexit',
  'readonly',
  'required',
  'reversed',
  'scoped',
  'seamless',
  'selected',
  'sortable',
  'truespeed',
  'typemustmatch',
  'visible',
]);
/*@__PURE__*/ const STRUCTURE_ELEMENTS = new Set([
  'html',
  'body',
  'head',
  'iframe',
  'meta',
  'link',
  'base',
  'title',
  'script',
  'style',
]);

// Parse5 6.0.1
const e=function(e){const t=[65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111];var n="�",s={EOF:-1,NULL:0,TABULATION:9,CARRIAGE_RETURN:13,LINE_FEED:10,FORM_FEED:12,SPACE:32,EXCLAMATION_MARK:33,QUOTATION_MARK:34,NUMBER_SIGN:35,AMPERSAND:38,APOSTROPHE:39,HYPHEN_MINUS:45,SOLIDUS:47,DIGIT_0:48,DIGIT_9:57,SEMICOLON:59,LESS_THAN_SIGN:60,EQUALS_SIGN:61,GREATER_THAN_SIGN:62,QUESTION_MARK:63,LATIN_CAPITAL_A:65,LATIN_CAPITAL_F:70,LATIN_CAPITAL_X:88,LATIN_CAPITAL_Z:90,RIGHT_SQUARE_BRACKET:93,GRAVE_ACCENT:96,LATIN_SMALL_A:97,LATIN_SMALL_F:102,LATIN_SMALL_X:120,LATIN_SMALL_Z:122,REPLACEMENT_CHARACTER:65533},r=function(e){return e>=55296&&e<=57343},i=function(e){return 32!==e&&10!==e&&13!==e&&9!==e&&12!==e&&e>=1&&e<=31||e>=127&&e<=159},o=function(e){return e>=64976&&e<=65007||t.indexOf(e)>-1},a="unexpected-null-character",T="invalid-first-character-of-tag-name",E="missing-semicolon-after-character-reference",h="eof-before-tag-name",c="eof-in-tag",_="missing-whitespace-after-doctype-public-keyword",l="missing-whitespace-between-doctype-public-and-system-identifiers",m="missing-whitespace-after-doctype-system-keyword",p="missing-quote-before-doctype-public-identifier",A="missing-quote-before-doctype-system-identifier",u="missing-doctype-public-identifier",N="missing-doctype-system-identifier",d="abrupt-doctype-public-identifier",C="abrupt-doctype-system-identifier",O="eof-in-script-html-comment-like-text",f="eof-in-doctype",S="abrupt-closing-of-empty-comment",R="eof-in-comment",I="absence-of-digits-in-numeric-character-reference",L="end-tag-without-matching-open-element",k="misplaced-start-tag-for-head-element";const M=s;var g=new Uint16Array([4,52,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,106,303,412,810,1432,1701,1796,1987,2114,2360,2420,2484,3170,3251,4140,4393,4575,4610,5106,5512,5728,6117,6274,6315,6345,6427,6516,7002,7910,8733,9323,9870,10170,10631,10893,11318,11386,11467,12773,13092,14474,14922,15448,15542,16419,17666,18166,18611,19004,19095,19298,19397,4,16,69,77,97,98,99,102,103,108,109,110,111,112,114,115,116,117,140,150,158,169,176,194,199,210,216,222,226,242,256,266,283,294,108,105,103,5,198,1,59,148,1,198,80,5,38,1,59,156,1,38,99,117,116,101,5,193,1,59,167,1,193,114,101,118,101,59,1,258,4,2,105,121,182,191,114,99,5,194,1,59,189,1,194,59,1,1040,114,59,3,55349,56580,114,97,118,101,5,192,1,59,208,1,192,112,104,97,59,1,913,97,99,114,59,1,256,100,59,1,10835,4,2,103,112,232,237,111,110,59,1,260,102,59,3,55349,56632,112,108,121,70,117,110,99,116,105,111,110,59,1,8289,105,110,103,5,197,1,59,264,1,197,4,2,99,115,272,277,114,59,3,55349,56476,105,103,110,59,1,8788,105,108,100,101,5,195,1,59,292,1,195,109,108,5,196,1,59,301,1,196,4,8,97,99,101,102,111,114,115,117,321,350,354,383,388,394,400,405,4,2,99,114,327,336,107,115,108,97,115,104,59,1,8726,4,2,118,119,342,345,59,1,10983,101,100,59,1,8966,121,59,1,1041,4,3,99,114,116,362,369,379,97,117,115,101,59,1,8757,110,111,117,108,108,105,115,59,1,8492,97,59,1,914,114,59,3,55349,56581,112,102,59,3,55349,56633,101,118,101,59,1,728,99,114,59,1,8492,109,112,101,113,59,1,8782,4,14,72,79,97,99,100,101,102,104,105,108,111,114,115,117,442,447,456,504,542,547,569,573,577,616,678,784,790,796,99,121,59,1,1063,80,89,5,169,1,59,454,1,169,4,3,99,112,121,464,470,497,117,116,101,59,1,262,4,2,59,105,476,478,1,8914,116,97,108,68,105,102,102,101,114,101,110,116,105,97,108,68,59,1,8517,108,101,121,115,59,1,8493,4,4,97,101,105,111,514,520,530,535,114,111,110,59,1,268,100,105,108,5,199,1,59,528,1,199,114,99,59,1,264,110,105,110,116,59,1,8752,111,116,59,1,266,4,2,100,110,553,560,105,108,108,97,59,1,184,116,101,114,68,111,116,59,1,183,114,59,1,8493,105,59,1,935,114,99,108,101,4,4,68,77,80,84,591,596,603,609,111,116,59,1,8857,105,110,117,115,59,1,8854,108,117,115,59,1,8853,105,109,101,115,59,1,8855,111,4,2,99,115,623,646,107,119,105,115,101,67,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8754,101,67,117,114,108,121,4,2,68,81,658,671,111,117,98,108,101,81,117,111,116,101,59,1,8221,117,111,116,101,59,1,8217,4,4,108,110,112,117,688,701,736,753,111,110,4,2,59,101,696,698,1,8759,59,1,10868,4,3,103,105,116,709,717,722,114,117,101,110,116,59,1,8801,110,116,59,1,8751,111,117,114,73,110,116,101,103,114,97,108,59,1,8750,4,2,102,114,742,745,59,1,8450,111,100,117,99,116,59,1,8720,110,116,101,114,67,108,111,99,107,119,105,115,101,67,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8755,111,115,115,59,1,10799,99,114,59,3,55349,56478,112,4,2,59,67,803,805,1,8915,97,112,59,1,8781,4,11,68,74,83,90,97,99,101,102,105,111,115,834,850,855,860,865,888,903,916,921,1011,1415,4,2,59,111,840,842,1,8517,116,114,97,104,100,59,1,10513,99,121,59,1,1026,99,121,59,1,1029,99,121,59,1,1039,4,3,103,114,115,873,879,883,103,101,114,59,1,8225,114,59,1,8609,104,118,59,1,10980,4,2,97,121,894,900,114,111,110,59,1,270,59,1,1044,108,4,2,59,116,910,912,1,8711,97,59,1,916,114,59,3,55349,56583,4,2,97,102,927,998,4,2,99,109,933,992,114,105,116,105,99,97,108,4,4,65,68,71,84,950,957,978,985,99,117,116,101,59,1,180,111,4,2,116,117,964,967,59,1,729,98,108,101,65,99,117,116,101,59,1,733,114,97,118,101,59,1,96,105,108,100,101,59,1,732,111,110,100,59,1,8900,102,101,114,101,110,116,105,97,108,68,59,1,8518,4,4,112,116,117,119,1021,1026,1048,1249,102,59,3,55349,56635,4,3,59,68,69,1034,1036,1041,1,168,111,116,59,1,8412,113,117,97,108,59,1,8784,98,108,101,4,6,67,68,76,82,85,86,1065,1082,1101,1189,1211,1236,111,110,116,111,117,114,73,110,116,101,103,114,97,108,59,1,8751,111,4,2,116,119,1089,1092,59,1,168,110,65,114,114,111,119,59,1,8659,4,2,101,111,1107,1141,102,116,4,3,65,82,84,1117,1124,1136,114,114,111,119,59,1,8656,105,103,104,116,65,114,114,111,119,59,1,8660,101,101,59,1,10980,110,103,4,2,76,82,1149,1177,101,102,116,4,2,65,82,1158,1165,114,114,111,119,59,1,10232,105,103,104,116,65,114,114,111,119,59,1,10234,105,103,104,116,65,114,114,111,119,59,1,10233,105,103,104,116,4,2,65,84,1199,1206,114,114,111,119,59,1,8658,101,101,59,1,8872,112,4,2,65,68,1218,1225,114,114,111,119,59,1,8657,111,119,110,65,114,114,111,119,59,1,8661,101,114,116,105,99,97,108,66,97,114,59,1,8741,110,4,6,65,66,76,82,84,97,1264,1292,1299,1352,1391,1408,114,114,111,119,4,3,59,66,85,1276,1278,1283,1,8595,97,114,59,1,10515,112,65,114,114,111,119,59,1,8693,114,101,118,101,59,1,785,101,102,116,4,3,82,84,86,1310,1323,1334,105,103,104,116,86,101,99,116,111,114,59,1,10576,101,101,86,101,99,116,111,114,59,1,10590,101,99,116,111,114,4,2,59,66,1345,1347,1,8637,97,114,59,1,10582,105,103,104,116,4,2,84,86,1362,1373,101,101,86,101,99,116,111,114,59,1,10591,101,99,116,111,114,4,2,59,66,1384,1386,1,8641,97,114,59,1,10583,101,101,4,2,59,65,1399,1401,1,8868,114,114,111,119,59,1,8615,114,114,111,119,59,1,8659,4,2,99,116,1421,1426,114,59,3,55349,56479,114,111,107,59,1,272,4,16,78,84,97,99,100,102,103,108,109,111,112,113,115,116,117,120,1466,1470,1478,1489,1515,1520,1525,1536,1544,1593,1609,1617,1650,1664,1668,1677,71,59,1,330,72,5,208,1,59,1476,1,208,99,117,116,101,5,201,1,59,1487,1,201,4,3,97,105,121,1497,1503,1512,114,111,110,59,1,282,114,99,5,202,1,59,1510,1,202,59,1,1069,111,116,59,1,278,114,59,3,55349,56584,114,97,118,101,5,200,1,59,1534,1,200,101,109,101,110,116,59,1,8712,4,2,97,112,1550,1555,99,114,59,1,274,116,121,4,2,83,86,1563,1576,109,97,108,108,83,113,117,97,114,101,59,1,9723,101,114,121,83,109,97,108,108,83,113,117,97,114,101,59,1,9643,4,2,103,112,1599,1604,111,110,59,1,280,102,59,3,55349,56636,115,105,108,111,110,59,1,917,117,4,2,97,105,1624,1640,108,4,2,59,84,1631,1633,1,10869,105,108,100,101,59,1,8770,108,105,98,114,105,117,109,59,1,8652,4,2,99,105,1656,1660,114,59,1,8496,109,59,1,10867,97,59,1,919,109,108,5,203,1,59,1675,1,203,4,2,105,112,1683,1689,115,116,115,59,1,8707,111,110,101,110,116,105,97,108,69,59,1,8519,4,5,99,102,105,111,115,1713,1717,1722,1762,1791,121,59,1,1060,114,59,3,55349,56585,108,108,101,100,4,2,83,86,1732,1745,109,97,108,108,83,113,117,97,114,101,59,1,9724,101,114,121,83,109,97,108,108,83,113,117,97,114,101,59,1,9642,4,3,112,114,117,1770,1775,1781,102,59,3,55349,56637,65,108,108,59,1,8704,114,105,101,114,116,114,102,59,1,8497,99,114,59,1,8497,4,12,74,84,97,98,99,100,102,103,111,114,115,116,1822,1827,1834,1848,1855,1877,1882,1887,1890,1896,1978,1984,99,121,59,1,1027,5,62,1,59,1832,1,62,109,109,97,4,2,59,100,1843,1845,1,915,59,1,988,114,101,118,101,59,1,286,4,3,101,105,121,1863,1869,1874,100,105,108,59,1,290,114,99,59,1,284,59,1,1043,111,116,59,1,288,114,59,3,55349,56586,59,1,8921,112,102,59,3,55349,56638,101,97,116,101,114,4,6,69,70,71,76,83,84,1915,1933,1944,1953,1959,1971,113,117,97,108,4,2,59,76,1925,1927,1,8805,101,115,115,59,1,8923,117,108,108,69,113,117,97,108,59,1,8807,114,101,97,116,101,114,59,1,10914,101,115,115,59,1,8823,108,97,110,116,69,113,117,97,108,59,1,10878,105,108,100,101,59,1,8819,99,114,59,3,55349,56482,59,1,8811,4,8,65,97,99,102,105,111,115,117,2005,2012,2026,2032,2036,2049,2073,2089,82,68,99,121,59,1,1066,4,2,99,116,2018,2023,101,107,59,1,711,59,1,94,105,114,99,59,1,292,114,59,1,8460,108,98,101,114,116,83,112,97,99,101,59,1,8459,4,2,112,114,2055,2059,102,59,1,8461,105,122,111,110,116,97,108,76,105,110,101,59,1,9472,4,2,99,116,2079,2083,114,59,1,8459,114,111,107,59,1,294,109,112,4,2,68,69,2097,2107,111,119,110,72,117,109,112,59,1,8782,113,117,97,108,59,1,8783,4,14,69,74,79,97,99,100,102,103,109,110,111,115,116,117,2144,2149,2155,2160,2171,2189,2194,2198,2209,2245,2307,2329,2334,2341,99,121,59,1,1045,108,105,103,59,1,306,99,121,59,1,1025,99,117,116,101,5,205,1,59,2169,1,205,4,2,105,121,2177,2186,114,99,5,206,1,59,2184,1,206,59,1,1048,111,116,59,1,304,114,59,1,8465,114,97,118,101,5,204,1,59,2207,1,204,4,3,59,97,112,2217,2219,2238,1,8465,4,2,99,103,2225,2229,114,59,1,298,105,110,97,114,121,73,59,1,8520,108,105,101,115,59,1,8658,4,2,116,118,2251,2281,4,2,59,101,2257,2259,1,8748,4,2,103,114,2265,2271,114,97,108,59,1,8747,115,101,99,116,105,111,110,59,1,8898,105,115,105,98,108,101,4,2,67,84,2293,2300,111,109,109,97,59,1,8291,105,109,101,115,59,1,8290,4,3,103,112,116,2315,2320,2325,111,110,59,1,302,102,59,3,55349,56640,97,59,1,921,99,114,59,1,8464,105,108,100,101,59,1,296,4,2,107,109,2347,2352,99,121,59,1,1030,108,5,207,1,59,2358,1,207,4,5,99,102,111,115,117,2372,2386,2391,2397,2414,4,2,105,121,2378,2383,114,99,59,1,308,59,1,1049,114,59,3,55349,56589,112,102,59,3,55349,56641,4,2,99,101,2403,2408,114,59,3,55349,56485,114,99,121,59,1,1032,107,99,121,59,1,1028,4,7,72,74,97,99,102,111,115,2436,2441,2446,2452,2467,2472,2478,99,121,59,1,1061,99,121,59,1,1036,112,112,97,59,1,922,4,2,101,121,2458,2464,100,105,108,59,1,310,59,1,1050,114,59,3,55349,56590,112,102,59,3,55349,56642,99,114,59,3,55349,56486,4,11,74,84,97,99,101,102,108,109,111,115,116,2508,2513,2520,2562,2585,2981,2986,3004,3011,3146,3167,99,121,59,1,1033,5,60,1,59,2518,1,60,4,5,99,109,110,112,114,2532,2538,2544,2548,2558,117,116,101,59,1,313,98,100,97,59,1,923,103,59,1,10218,108,97,99,101,116,114,102,59,1,8466,114,59,1,8606,4,3,97,101,121,2570,2576,2582,114,111,110,59,1,317,100,105,108,59,1,315,59,1,1051,4,2,102,115,2591,2907,116,4,10,65,67,68,70,82,84,85,86,97,114,2614,2663,2672,2728,2735,2760,2820,2870,2888,2895,4,2,110,114,2620,2633,103,108,101,66,114,97,99,107,101,116,59,1,10216,114,111,119,4,3,59,66,82,2644,2646,2651,1,8592,97,114,59,1,8676,105,103,104,116,65,114,114,111,119,59,1,8646,101,105,108,105,110,103,59,1,8968,111,4,2,117,119,2679,2692,98,108,101,66,114,97,99,107,101,116,59,1,10214,110,4,2,84,86,2699,2710,101,101,86,101,99,116,111,114,59,1,10593,101,99,116,111,114,4,2,59,66,2721,2723,1,8643,97,114,59,1,10585,108,111,111,114,59,1,8970,105,103,104,116,4,2,65,86,2745,2752,114,114,111,119,59,1,8596,101,99,116,111,114,59,1,10574,4,2,101,114,2766,2792,101,4,3,59,65,86,2775,2777,2784,1,8867,114,114,111,119,59,1,8612,101,99,116,111,114,59,1,10586,105,97,110,103,108,101,4,3,59,66,69,2806,2808,2813,1,8882,97,114,59,1,10703,113,117,97,108,59,1,8884,112,4,3,68,84,86,2829,2841,2852,111,119,110,86,101,99,116,111,114,59,1,10577,101,101,86,101,99,116,111,114,59,1,10592,101,99,116,111,114,4,2,59,66,2863,2865,1,8639,97,114,59,1,10584,101,99,116,111,114,4,2,59,66,2881,2883,1,8636,97,114,59,1,10578,114,114,111,119,59,1,8656,105,103,104,116,97,114,114,111,119,59,1,8660,115,4,6,69,70,71,76,83,84,2922,2936,2947,2956,2962,2974,113,117,97,108,71,114,101,97,116,101,114,59,1,8922,117,108,108,69,113,117,97,108,59,1,8806,114,101,97,116,101,114,59,1,8822,101,115,115,59,1,10913,108,97,110,116,69,113,117,97,108,59,1,10877,105,108,100,101,59,1,8818,114,59,3,55349,56591,4,2,59,101,2992,2994,1,8920,102,116,97,114,114,111,119,59,1,8666,105,100,111,116,59,1,319,4,3,110,112,119,3019,3110,3115,103,4,4,76,82,108,114,3030,3058,3070,3098,101,102,116,4,2,65,82,3039,3046,114,114,111,119,59,1,10229,105,103,104,116,65,114,114,111,119,59,1,10231,105,103,104,116,65,114,114,111,119,59,1,10230,101,102,116,4,2,97,114,3079,3086,114,114,111,119,59,1,10232,105,103,104,116,97,114,114,111,119,59,1,10234,105,103,104,116,97,114,114,111,119,59,1,10233,102,59,3,55349,56643,101,114,4,2,76,82,3123,3134,101,102,116,65,114,114,111,119,59,1,8601,105,103,104,116,65,114,114,111,119,59,1,8600,4,3,99,104,116,3154,3158,3161,114,59,1,8466,59,1,8624,114,111,107,59,1,321,59,1,8810,4,8,97,99,101,102,105,111,115,117,3188,3192,3196,3222,3227,3237,3243,3248,112,59,1,10501,121,59,1,1052,4,2,100,108,3202,3213,105,117,109,83,112,97,99,101,59,1,8287,108,105,110,116,114,102,59,1,8499,114,59,3,55349,56592,110,117,115,80,108,117,115,59,1,8723,112,102,59,3,55349,56644,99,114,59,1,8499,59,1,924,4,9,74,97,99,101,102,111,115,116,117,3271,3276,3283,3306,3422,3427,4120,4126,4137,99,121,59,1,1034,99,117,116,101,59,1,323,4,3,97,101,121,3291,3297,3303,114,111,110,59,1,327,100,105,108,59,1,325,59,1,1053,4,3,103,115,119,3314,3380,3415,97,116,105,118,101,4,3,77,84,86,3327,3340,3365,101,100,105,117,109,83,112,97,99,101,59,1,8203,104,105,4,2,99,110,3348,3357,107,83,112,97,99,101,59,1,8203,83,112,97,99,101,59,1,8203,101,114,121,84,104,105,110,83,112,97,99,101,59,1,8203,116,101,100,4,2,71,76,3389,3405,114,101,97,116,101,114,71,114,101,97,116,101,114,59,1,8811,101,115,115,76,101,115,115,59,1,8810,76,105,110,101,59,1,10,114,59,3,55349,56593,4,4,66,110,112,116,3437,3444,3460,3464,114,101,97,107,59,1,8288,66,114,101,97,107,105,110,103,83,112,97,99,101,59,1,160,102,59,1,8469,4,13,59,67,68,69,71,72,76,78,80,82,83,84,86,3492,3494,3517,3536,3578,3657,3685,3784,3823,3860,3915,4066,4107,1,10988,4,2,111,117,3500,3510,110,103,114,117,101,110,116,59,1,8802,112,67,97,112,59,1,8813,111,117,98,108,101,86,101,114,116,105,99,97,108,66,97,114,59,1,8742,4,3,108,113,120,3544,3552,3571,101,109,101,110,116,59,1,8713,117,97,108,4,2,59,84,3561,3563,1,8800,105,108,100,101,59,3,8770,824,105,115,116,115,59,1,8708,114,101,97,116,101,114,4,7,59,69,70,71,76,83,84,3600,3602,3609,3621,3631,3637,3650,1,8815,113,117,97,108,59,1,8817,117,108,108,69,113,117,97,108,59,3,8807,824,114,101,97,116,101,114,59,3,8811,824,101,115,115,59,1,8825,108,97,110,116,69,113,117,97,108,59,3,10878,824,105,108,100,101,59,1,8821,117,109,112,4,2,68,69,3666,3677,111,119,110,72,117,109,112,59,3,8782,824,113,117,97,108,59,3,8783,824,101,4,2,102,115,3692,3724,116,84,114,105,97,110,103,108,101,4,3,59,66,69,3709,3711,3717,1,8938,97,114,59,3,10703,824,113,117,97,108,59,1,8940,115,4,6,59,69,71,76,83,84,3739,3741,3748,3757,3764,3777,1,8814,113,117,97,108,59,1,8816,114,101,97,116,101,114,59,1,8824,101,115,115,59,3,8810,824,108,97,110,116,69,113,117,97,108,59,3,10877,824,105,108,100,101,59,1,8820,101,115,116,101,100,4,2,71,76,3795,3812,114,101,97,116,101,114,71,114,101,97,116,101,114,59,3,10914,824,101,115,115,76,101,115,115,59,3,10913,824,114,101,99,101,100,101,115,4,3,59,69,83,3838,3840,3848,1,8832,113,117,97,108,59,3,10927,824,108,97,110,116,69,113,117,97,108,59,1,8928,4,2,101,105,3866,3881,118,101,114,115,101,69,108,101,109,101,110,116,59,1,8716,103,104,116,84,114,105,97,110,103,108,101,4,3,59,66,69,3900,3902,3908,1,8939,97,114,59,3,10704,824,113,117,97,108,59,1,8941,4,2,113,117,3921,3973,117,97,114,101,83,117,4,2,98,112,3933,3952,115,101,116,4,2,59,69,3942,3945,3,8847,824,113,117,97,108,59,1,8930,101,114,115,101,116,4,2,59,69,3963,3966,3,8848,824,113,117,97,108,59,1,8931,4,3,98,99,112,3981,4e3,4045,115,101,116,4,2,59,69,3990,3993,3,8834,8402,113,117,97,108,59,1,8840,99,101,101,100,115,4,4,59,69,83,84,4015,4017,4025,4037,1,8833,113,117,97,108,59,3,10928,824,108,97,110,116,69,113,117,97,108,59,1,8929,105,108,100,101,59,3,8831,824,101,114,115,101,116,4,2,59,69,4056,4059,3,8835,8402,113,117,97,108,59,1,8841,105,108,100,101,4,4,59,69,70,84,4080,4082,4089,4100,1,8769,113,117,97,108,59,1,8772,117,108,108,69,113,117,97,108,59,1,8775,105,108,100,101,59,1,8777,101,114,116,105,99,97,108,66,97,114,59,1,8740,99,114,59,3,55349,56489,105,108,100,101,5,209,1,59,4135,1,209,59,1,925,4,14,69,97,99,100,102,103,109,111,112,114,115,116,117,118,4170,4176,4187,4205,4212,4217,4228,4253,4259,4292,4295,4316,4337,4346,108,105,103,59,1,338,99,117,116,101,5,211,1,59,4185,1,211,4,2,105,121,4193,4202,114,99,5,212,1,59,4200,1,212,59,1,1054,98,108,97,99,59,1,336,114,59,3,55349,56594,114,97,118,101,5,210,1,59,4226,1,210,4,3,97,101,105,4236,4241,4246,99,114,59,1,332,103,97,59,1,937,99,114,111,110,59,1,927,112,102,59,3,55349,56646,101,110,67,117,114,108,121,4,2,68,81,4272,4285,111,117,98,108,101,81,117,111,116,101,59,1,8220,117,111,116,101,59,1,8216,59,1,10836,4,2,99,108,4301,4306,114,59,3,55349,56490,97,115,104,5,216,1,59,4314,1,216,105,4,2,108,109,4323,4332,100,101,5,213,1,59,4330,1,213,101,115,59,1,10807,109,108,5,214,1,59,4344,1,214,101,114,4,2,66,80,4354,4380,4,2,97,114,4360,4364,114,59,1,8254,97,99,4,2,101,107,4372,4375,59,1,9182,101,116,59,1,9140,97,114,101,110,116,104,101,115,105,115,59,1,9180,4,9,97,99,102,104,105,108,111,114,115,4413,4422,4426,4431,4435,4438,4448,4471,4561,114,116,105,97,108,68,59,1,8706,121,59,1,1055,114,59,3,55349,56595,105,59,1,934,59,1,928,117,115,77,105,110,117,115,59,1,177,4,2,105,112,4454,4467,110,99,97,114,101,112,108,97,110,101,59,1,8460,102,59,1,8473,4,4,59,101,105,111,4481,4483,4526,4531,1,10939,99,101,100,101,115,4,4,59,69,83,84,4498,4500,4507,4519,1,8826,113,117,97,108,59,1,10927,108,97,110,116,69,113,117,97,108,59,1,8828,105,108,100,101,59,1,8830,109,101,59,1,8243,4,2,100,112,4537,4543,117,99,116,59,1,8719,111,114,116,105,111,110,4,2,59,97,4555,4557,1,8759,108,59,1,8733,4,2,99,105,4567,4572,114,59,3,55349,56491,59,1,936,4,4,85,102,111,115,4585,4594,4599,4604,79,84,5,34,1,59,4592,1,34,114,59,3,55349,56596,112,102,59,1,8474,99,114,59,3,55349,56492,4,12,66,69,97,99,101,102,104,105,111,114,115,117,4636,4642,4650,4681,4704,4763,4767,4771,5047,5069,5081,5094,97,114,114,59,1,10512,71,5,174,1,59,4648,1,174,4,3,99,110,114,4658,4664,4668,117,116,101,59,1,340,103,59,1,10219,114,4,2,59,116,4675,4677,1,8608,108,59,1,10518,4,3,97,101,121,4689,4695,4701,114,111,110,59,1,344,100,105,108,59,1,342,59,1,1056,4,2,59,118,4710,4712,1,8476,101,114,115,101,4,2,69,85,4722,4748,4,2,108,113,4728,4736,101,109,101,110,116,59,1,8715,117,105,108,105,98,114,105,117,109,59,1,8651,112,69,113,117,105,108,105,98,114,105,117,109,59,1,10607,114,59,1,8476,111,59,1,929,103,104,116,4,8,65,67,68,70,84,85,86,97,4792,4840,4849,4905,4912,4972,5022,5040,4,2,110,114,4798,4811,103,108,101,66,114,97,99,107,101,116,59,1,10217,114,111,119,4,3,59,66,76,4822,4824,4829,1,8594,97,114,59,1,8677,101,102,116,65,114,114,111,119,59,1,8644,101,105,108,105,110,103,59,1,8969,111,4,2,117,119,4856,4869,98,108,101,66,114,97,99,107,101,116,59,1,10215,110,4,2,84,86,4876,4887,101,101,86,101,99,116,111,114,59,1,10589,101,99,116,111,114,4,2,59,66,4898,4900,1,8642,97,114,59,1,10581,108,111,111,114,59,1,8971,4,2,101,114,4918,4944,101,4,3,59,65,86,4927,4929,4936,1,8866,114,114,111,119,59,1,8614,101,99,116,111,114,59,1,10587,105,97,110,103,108,101,4,3,59,66,69,4958,4960,4965,1,8883,97,114,59,1,10704,113,117,97,108,59,1,8885,112,4,3,68,84,86,4981,4993,5004,111,119,110,86,101,99,116,111,114,59,1,10575,101,101,86,101,99,116,111,114,59,1,10588,101,99,116,111,114,4,2,59,66,5015,5017,1,8638,97,114,59,1,10580,101,99,116,111,114,4,2,59,66,5033,5035,1,8640,97,114,59,1,10579,114,114,111,119,59,1,8658,4,2,112,117,5053,5057,102,59,1,8477,110,100,73,109,112,108,105,101,115,59,1,10608,105,103,104,116,97,114,114,111,119,59,1,8667,4,2,99,104,5087,5091,114,59,1,8475,59,1,8625,108,101,68,101,108,97,121,101,100,59,1,10740,4,13,72,79,97,99,102,104,105,109,111,113,115,116,117,5134,5150,5157,5164,5198,5203,5259,5265,5277,5283,5374,5380,5385,4,2,67,99,5140,5146,72,99,121,59,1,1065,121,59,1,1064,70,84,99,121,59,1,1068,99,117,116,101,59,1,346,4,5,59,97,101,105,121,5176,5178,5184,5190,5195,1,10940,114,111,110,59,1,352,100,105,108,59,1,350,114,99,59,1,348,59,1,1057,114,59,3,55349,56598,111,114,116,4,4,68,76,82,85,5216,5227,5238,5250,111,119,110,65,114,114,111,119,59,1,8595,101,102,116,65,114,114,111,119,59,1,8592,105,103,104,116,65,114,114,111,119,59,1,8594,112,65,114,114,111,119,59,1,8593,103,109,97,59,1,931,97,108,108,67,105,114,99,108,101,59,1,8728,112,102,59,3,55349,56650,4,2,114,117,5289,5293,116,59,1,8730,97,114,101,4,4,59,73,83,85,5306,5308,5322,5367,1,9633,110,116,101,114,115,101,99,116,105,111,110,59,1,8851,117,4,2,98,112,5329,5347,115,101,116,4,2,59,69,5338,5340,1,8847,113,117,97,108,59,1,8849,101,114,115,101,116,4,2,59,69,5358,5360,1,8848,113,117,97,108,59,1,8850,110,105,111,110,59,1,8852,99,114,59,3,55349,56494,97,114,59,1,8902,4,4,98,99,109,112,5395,5420,5475,5478,4,2,59,115,5401,5403,1,8912,101,116,4,2,59,69,5411,5413,1,8912,113,117,97,108,59,1,8838,4,2,99,104,5426,5468,101,101,100,115,4,4,59,69,83,84,5440,5442,5449,5461,1,8827,113,117,97,108,59,1,10928,108,97,110,116,69,113,117,97,108,59,1,8829,105,108,100,101,59,1,8831,84,104,97,116,59,1,8715,59,1,8721,4,3,59,101,115,5486,5488,5507,1,8913,114,115,101,116,4,2,59,69,5498,5500,1,8835,113,117,97,108,59,1,8839,101,116,59,1,8913,4,11,72,82,83,97,99,102,104,105,111,114,115,5536,5546,5552,5567,5579,5602,5607,5655,5695,5701,5711,79,82,78,5,222,1,59,5544,1,222,65,68,69,59,1,8482,4,2,72,99,5558,5563,99,121,59,1,1035,121,59,1,1062,4,2,98,117,5573,5576,59,1,9,59,1,932,4,3,97,101,121,5587,5593,5599,114,111,110,59,1,356,100,105,108,59,1,354,59,1,1058,114,59,3,55349,56599,4,2,101,105,5613,5631,4,2,114,116,5619,5627,101,102,111,114,101,59,1,8756,97,59,1,920,4,2,99,110,5637,5647,107,83,112,97,99,101,59,3,8287,8202,83,112,97,99,101,59,1,8201,108,100,101,4,4,59,69,70,84,5668,5670,5677,5688,1,8764,113,117,97,108,59,1,8771,117,108,108,69,113,117,97,108,59,1,8773,105,108,100,101,59,1,8776,112,102,59,3,55349,56651,105,112,108,101,68,111,116,59,1,8411,4,2,99,116,5717,5722,114,59,3,55349,56495,114,111,107,59,1,358,4,14,97,98,99,100,102,103,109,110,111,112,114,115,116,117,5758,5789,5805,5823,5830,5835,5846,5852,5921,5937,6089,6095,6101,6108,4,2,99,114,5764,5774,117,116,101,5,218,1,59,5772,1,218,114,4,2,59,111,5781,5783,1,8607,99,105,114,59,1,10569,114,4,2,99,101,5796,5800,121,59,1,1038,118,101,59,1,364,4,2,105,121,5811,5820,114,99,5,219,1,59,5818,1,219,59,1,1059,98,108,97,99,59,1,368,114,59,3,55349,56600,114,97,118,101,5,217,1,59,5844,1,217,97,99,114,59,1,362,4,2,100,105,5858,5905,101,114,4,2,66,80,5866,5892,4,2,97,114,5872,5876,114,59,1,95,97,99,4,2,101,107,5884,5887,59,1,9183,101,116,59,1,9141,97,114,101,110,116,104,101,115,105,115,59,1,9181,111,110,4,2,59,80,5913,5915,1,8899,108,117,115,59,1,8846,4,2,103,112,5927,5932,111,110,59,1,370,102,59,3,55349,56652,4,8,65,68,69,84,97,100,112,115,5955,5985,5996,6009,6026,6033,6044,6075,114,114,111,119,4,3,59,66,68,5967,5969,5974,1,8593,97,114,59,1,10514,111,119,110,65,114,114,111,119,59,1,8645,111,119,110,65,114,114,111,119,59,1,8597,113,117,105,108,105,98,114,105,117,109,59,1,10606,101,101,4,2,59,65,6017,6019,1,8869,114,114,111,119,59,1,8613,114,114,111,119,59,1,8657,111,119,110,97,114,114,111,119,59,1,8661,101,114,4,2,76,82,6052,6063,101,102,116,65,114,114,111,119,59,1,8598,105,103,104,116,65,114,114,111,119,59,1,8599,105,4,2,59,108,6082,6084,1,978,111,110,59,1,933,105,110,103,59,1,366,99,114,59,3,55349,56496,105,108,100,101,59,1,360,109,108,5,220,1,59,6115,1,220,4,9,68,98,99,100,101,102,111,115,118,6137,6143,6148,6152,6166,6250,6255,6261,6267,97,115,104,59,1,8875,97,114,59,1,10987,121,59,1,1042,97,115,104,4,2,59,108,6161,6163,1,8873,59,1,10982,4,2,101,114,6172,6175,59,1,8897,4,3,98,116,121,6183,6188,6238,97,114,59,1,8214,4,2,59,105,6194,6196,1,8214,99,97,108,4,4,66,76,83,84,6209,6214,6220,6231,97,114,59,1,8739,105,110,101,59,1,124,101,112,97,114,97,116,111,114,59,1,10072,105,108,100,101,59,1,8768,84,104,105,110,83,112,97,99,101,59,1,8202,114,59,3,55349,56601,112,102,59,3,55349,56653,99,114,59,3,55349,56497,100,97,115,104,59,1,8874,4,5,99,101,102,111,115,6286,6292,6298,6303,6309,105,114,99,59,1,372,100,103,101,59,1,8896,114,59,3,55349,56602,112,102,59,3,55349,56654,99,114,59,3,55349,56498,4,4,102,105,111,115,6325,6330,6333,6339,114,59,3,55349,56603,59,1,926,112,102,59,3,55349,56655,99,114,59,3,55349,56499,4,9,65,73,85,97,99,102,111,115,117,6365,6370,6375,6380,6391,6405,6410,6416,6422,99,121,59,1,1071,99,121,59,1,1031,99,121,59,1,1070,99,117,116,101,5,221,1,59,6389,1,221,4,2,105,121,6397,6402,114,99,59,1,374,59,1,1067,114,59,3,55349,56604,112,102,59,3,55349,56656,99,114,59,3,55349,56500,109,108,59,1,376,4,8,72,97,99,100,101,102,111,115,6445,6450,6457,6472,6477,6501,6505,6510,99,121,59,1,1046,99,117,116,101,59,1,377,4,2,97,121,6463,6469,114,111,110,59,1,381,59,1,1047,111,116,59,1,379,4,2,114,116,6483,6497,111,87,105,100,116,104,83,112,97,99,101,59,1,8203,97,59,1,918,114,59,1,8488,112,102,59,1,8484,99,114,59,3,55349,56501,4,16,97,98,99,101,102,103,108,109,110,111,112,114,115,116,117,119,6550,6561,6568,6612,6622,6634,6645,6672,6699,6854,6870,6923,6933,6963,6974,6983,99,117,116,101,5,225,1,59,6559,1,225,114,101,118,101,59,1,259,4,6,59,69,100,105,117,121,6582,6584,6588,6591,6600,6609,1,8766,59,3,8766,819,59,1,8767,114,99,5,226,1,59,6598,1,226,116,101,5,180,1,59,6607,1,180,59,1,1072,108,105,103,5,230,1,59,6620,1,230,4,2,59,114,6628,6630,1,8289,59,3,55349,56606,114,97,118,101,5,224,1,59,6643,1,224,4,2,101,112,6651,6667,4,2,102,112,6657,6663,115,121,109,59,1,8501,104,59,1,8501,104,97,59,1,945,4,2,97,112,6678,6692,4,2,99,108,6684,6688,114,59,1,257,103,59,1,10815,5,38,1,59,6697,1,38,4,2,100,103,6705,6737,4,5,59,97,100,115,118,6717,6719,6724,6727,6734,1,8743,110,100,59,1,10837,59,1,10844,108,111,112,101,59,1,10840,59,1,10842,4,7,59,101,108,109,114,115,122,6753,6755,6758,6762,6814,6835,6848,1,8736,59,1,10660,101,59,1,8736,115,100,4,2,59,97,6770,6772,1,8737,4,8,97,98,99,100,101,102,103,104,6790,6793,6796,6799,6802,6805,6808,6811,59,1,10664,59,1,10665,59,1,10666,59,1,10667,59,1,10668,59,1,10669,59,1,10670,59,1,10671,116,4,2,59,118,6821,6823,1,8735,98,4,2,59,100,6830,6832,1,8894,59,1,10653,4,2,112,116,6841,6845,104,59,1,8738,59,1,197,97,114,114,59,1,9084,4,2,103,112,6860,6865,111,110,59,1,261,102,59,3,55349,56658,4,7,59,69,97,101,105,111,112,6886,6888,6891,6897,6900,6904,6908,1,8776,59,1,10864,99,105,114,59,1,10863,59,1,8778,100,59,1,8779,115,59,1,39,114,111,120,4,2,59,101,6917,6919,1,8776,113,59,1,8778,105,110,103,5,229,1,59,6931,1,229,4,3,99,116,121,6941,6946,6949,114,59,3,55349,56502,59,1,42,109,112,4,2,59,101,6957,6959,1,8776,113,59,1,8781,105,108,100,101,5,227,1,59,6972,1,227,109,108,5,228,1,59,6981,1,228,4,2,99,105,6989,6997,111,110,105,110,116,59,1,8755,110,116,59,1,10769,4,16,78,97,98,99,100,101,102,105,107,108,110,111,112,114,115,117,7036,7041,7119,7135,7149,7155,7219,7224,7347,7354,7463,7489,7786,7793,7814,7866,111,116,59,1,10989,4,2,99,114,7047,7094,107,4,4,99,101,112,115,7058,7064,7073,7080,111,110,103,59,1,8780,112,115,105,108,111,110,59,1,1014,114,105,109,101,59,1,8245,105,109,4,2,59,101,7088,7090,1,8765,113,59,1,8909,4,2,118,119,7100,7105,101,101,59,1,8893,101,100,4,2,59,103,7113,7115,1,8965,101,59,1,8965,114,107,4,2,59,116,7127,7129,1,9141,98,114,107,59,1,9142,4,2,111,121,7141,7146,110,103,59,1,8780,59,1,1073,113,117,111,59,1,8222,4,5,99,109,112,114,116,7167,7181,7188,7193,7199,97,117,115,4,2,59,101,7176,7178,1,8757,59,1,8757,112,116,121,118,59,1,10672,115,105,59,1,1014,110,111,117,59,1,8492,4,3,97,104,119,7207,7210,7213,59,1,946,59,1,8502,101,101,110,59,1,8812,114,59,3,55349,56607,103,4,7,99,111,115,116,117,118,119,7241,7262,7288,7305,7328,7335,7340,4,3,97,105,117,7249,7253,7258,112,59,1,8898,114,99,59,1,9711,112,59,1,8899,4,3,100,112,116,7270,7275,7281,111,116,59,1,10752,108,117,115,59,1,10753,105,109,101,115,59,1,10754,4,2,113,116,7294,7300,99,117,112,59,1,10758,97,114,59,1,9733,114,105,97,110,103,108,101,4,2,100,117,7318,7324,111,119,110,59,1,9661,112,59,1,9651,112,108,117,115,59,1,10756,101,101,59,1,8897,101,100,103,101,59,1,8896,97,114,111,119,59,1,10509,4,3,97,107,111,7362,7436,7458,4,2,99,110,7368,7432,107,4,3,108,115,116,7377,7386,7394,111,122,101,110,103,101,59,1,10731,113,117,97,114,101,59,1,9642,114,105,97,110,103,108,101,4,4,59,100,108,114,7411,7413,7419,7425,1,9652,111,119,110,59,1,9662,101,102,116,59,1,9666,105,103,104,116,59,1,9656,107,59,1,9251,4,2,49,51,7442,7454,4,2,50,52,7448,7451,59,1,9618,59,1,9617,52,59,1,9619,99,107,59,1,9608,4,2,101,111,7469,7485,4,2,59,113,7475,7478,3,61,8421,117,105,118,59,3,8801,8421,116,59,1,8976,4,4,112,116,119,120,7499,7504,7517,7523,102,59,3,55349,56659,4,2,59,116,7510,7512,1,8869,111,109,59,1,8869,116,105,101,59,1,8904,4,12,68,72,85,86,98,100,104,109,112,116,117,118,7549,7571,7597,7619,7655,7660,7682,7708,7715,7721,7728,7750,4,4,76,82,108,114,7559,7562,7565,7568,59,1,9559,59,1,9556,59,1,9558,59,1,9555,4,5,59,68,85,100,117,7583,7585,7588,7591,7594,1,9552,59,1,9574,59,1,9577,59,1,9572,59,1,9575,4,4,76,82,108,114,7607,7610,7613,7616,59,1,9565,59,1,9562,59,1,9564,59,1,9561,4,7,59,72,76,82,104,108,114,7635,7637,7640,7643,7646,7649,7652,1,9553,59,1,9580,59,1,9571,59,1,9568,59,1,9579,59,1,9570,59,1,9567,111,120,59,1,10697,4,4,76,82,108,114,7670,7673,7676,7679,59,1,9557,59,1,9554,59,1,9488,59,1,9484,4,5,59,68,85,100,117,7694,7696,7699,7702,7705,1,9472,59,1,9573,59,1,9576,59,1,9516,59,1,9524,105,110,117,115,59,1,8863,108,117,115,59,1,8862,105,109,101,115,59,1,8864,4,4,76,82,108,114,7738,7741,7744,7747,59,1,9563,59,1,9560,59,1,9496,59,1,9492,4,7,59,72,76,82,104,108,114,7766,7768,7771,7774,7777,7780,7783,1,9474,59,1,9578,59,1,9569,59,1,9566,59,1,9532,59,1,9508,59,1,9500,114,105,109,101,59,1,8245,4,2,101,118,7799,7804,118,101,59,1,728,98,97,114,5,166,1,59,7812,1,166,4,4,99,101,105,111,7824,7829,7834,7846,114,59,3,55349,56503,109,105,59,1,8271,109,4,2,59,101,7841,7843,1,8765,59,1,8909,108,4,3,59,98,104,7855,7857,7860,1,92,59,1,10693,115,117,98,59,1,10184,4,2,108,109,7872,7885,108,4,2,59,101,7879,7881,1,8226,116,59,1,8226,112,4,3,59,69,101,7894,7896,7899,1,8782,59,1,10926,4,2,59,113,7905,7907,1,8783,59,1,8783,4,15,97,99,100,101,102,104,105,108,111,114,115,116,117,119,121,7942,8021,8075,8080,8121,8126,8157,8279,8295,8430,8446,8485,8491,8707,8726,4,3,99,112,114,7950,7956,8007,117,116,101,59,1,263,4,6,59,97,98,99,100,115,7970,7972,7977,7984,7998,8003,1,8745,110,100,59,1,10820,114,99,117,112,59,1,10825,4,2,97,117,7990,7994,112,59,1,10827,112,59,1,10823,111,116,59,1,10816,59,3,8745,65024,4,2,101,111,8013,8017,116,59,1,8257,110,59,1,711,4,4,97,101,105,117,8031,8046,8056,8061,4,2,112,114,8037,8041,115,59,1,10829,111,110,59,1,269,100,105,108,5,231,1,59,8054,1,231,114,99,59,1,265,112,115,4,2,59,115,8069,8071,1,10828,109,59,1,10832,111,116,59,1,267,4,3,100,109,110,8088,8097,8104,105,108,5,184,1,59,8095,1,184,112,116,121,118,59,1,10674,116,5,162,2,59,101,8112,8114,1,162,114,100,111,116,59,1,183,114,59,3,55349,56608,4,3,99,101,105,8134,8138,8154,121,59,1,1095,99,107,4,2,59,109,8146,8148,1,10003,97,114,107,59,1,10003,59,1,967,114,4,7,59,69,99,101,102,109,115,8174,8176,8179,8258,8261,8268,8273,1,9675,59,1,10691,4,3,59,101,108,8187,8189,8193,1,710,113,59,1,8791,101,4,2,97,100,8200,8223,114,114,111,119,4,2,108,114,8210,8216,101,102,116,59,1,8634,105,103,104,116,59,1,8635,4,5,82,83,97,99,100,8235,8238,8241,8246,8252,59,1,174,59,1,9416,115,116,59,1,8859,105,114,99,59,1,8858,97,115,104,59,1,8861,59,1,8791,110,105,110,116,59,1,10768,105,100,59,1,10991,99,105,114,59,1,10690,117,98,115,4,2,59,117,8288,8290,1,9827,105,116,59,1,9827,4,4,108,109,110,112,8305,8326,8376,8400,111,110,4,2,59,101,8313,8315,1,58,4,2,59,113,8321,8323,1,8788,59,1,8788,4,2,109,112,8332,8344,97,4,2,59,116,8339,8341,1,44,59,1,64,4,3,59,102,108,8352,8354,8358,1,8705,110,59,1,8728,101,4,2,109,120,8365,8371,101,110,116,59,1,8705,101,115,59,1,8450,4,2,103,105,8382,8395,4,2,59,100,8388,8390,1,8773,111,116,59,1,10861,110,116,59,1,8750,4,3,102,114,121,8408,8412,8417,59,3,55349,56660,111,100,59,1,8720,5,169,2,59,115,8424,8426,1,169,114,59,1,8471,4,2,97,111,8436,8441,114,114,59,1,8629,115,115,59,1,10007,4,2,99,117,8452,8457,114,59,3,55349,56504,4,2,98,112,8463,8474,4,2,59,101,8469,8471,1,10959,59,1,10961,4,2,59,101,8480,8482,1,10960,59,1,10962,100,111,116,59,1,8943,4,7,100,101,108,112,114,118,119,8507,8522,8536,8550,8600,8697,8702,97,114,114,4,2,108,114,8516,8519,59,1,10552,59,1,10549,4,2,112,115,8528,8532,114,59,1,8926,99,59,1,8927,97,114,114,4,2,59,112,8545,8547,1,8630,59,1,10557,4,6,59,98,99,100,111,115,8564,8566,8573,8587,8592,8596,1,8746,114,99,97,112,59,1,10824,4,2,97,117,8579,8583,112,59,1,10822,112,59,1,10826,111,116,59,1,8845,114,59,1,10821,59,3,8746,65024,4,4,97,108,114,118,8610,8623,8663,8672,114,114,4,2,59,109,8618,8620,1,8631,59,1,10556,121,4,3,101,118,119,8632,8651,8656,113,4,2,112,115,8639,8645,114,101,99,59,1,8926,117,99,99,59,1,8927,101,101,59,1,8910,101,100,103,101,59,1,8911,101,110,5,164,1,59,8670,1,164,101,97,114,114,111,119,4,2,108,114,8684,8690,101,102,116,59,1,8630,105,103,104,116,59,1,8631,101,101,59,1,8910,101,100,59,1,8911,4,2,99,105,8713,8721,111,110,105,110,116,59,1,8754,110,116,59,1,8753,108,99,116,121,59,1,9005,4,19,65,72,97,98,99,100,101,102,104,105,106,108,111,114,115,116,117,119,122,8773,8778,8783,8821,8839,8854,8887,8914,8930,8944,9036,9041,9058,9197,9227,9258,9281,9297,9305,114,114,59,1,8659,97,114,59,1,10597,4,4,103,108,114,115,8793,8799,8805,8809,103,101,114,59,1,8224,101,116,104,59,1,8504,114,59,1,8595,104,4,2,59,118,8816,8818,1,8208,59,1,8867,4,2,107,108,8827,8834,97,114,111,119,59,1,10511,97,99,59,1,733,4,2,97,121,8845,8851,114,111,110,59,1,271,59,1,1076,4,3,59,97,111,8862,8864,8880,1,8518,4,2,103,114,8870,8876,103,101,114,59,1,8225,114,59,1,8650,116,115,101,113,59,1,10871,4,3,103,108,109,8895,8902,8907,5,176,1,59,8900,1,176,116,97,59,1,948,112,116,121,118,59,1,10673,4,2,105,114,8920,8926,115,104,116,59,1,10623,59,3,55349,56609,97,114,4,2,108,114,8938,8941,59,1,8643,59,1,8642,4,5,97,101,103,115,118,8956,8986,8989,8996,9001,109,4,3,59,111,115,8965,8967,8983,1,8900,110,100,4,2,59,115,8975,8977,1,8900,117,105,116,59,1,9830,59,1,9830,59,1,168,97,109,109,97,59,1,989,105,110,59,1,8946,4,3,59,105,111,9009,9011,9031,1,247,100,101,5,247,2,59,111,9020,9022,1,247,110,116,105,109,101,115,59,1,8903,110,120,59,1,8903,99,121,59,1,1106,99,4,2,111,114,9048,9053,114,110,59,1,8990,111,112,59,1,8973,4,5,108,112,116,117,119,9070,9076,9081,9130,9144,108,97,114,59,1,36,102,59,3,55349,56661,4,5,59,101,109,112,115,9093,9095,9109,9116,9122,1,729,113,4,2,59,100,9102,9104,1,8784,111,116,59,1,8785,105,110,117,115,59,1,8760,108,117,115,59,1,8724,113,117,97,114,101,59,1,8865,98,108,101,98,97,114,119,101,100,103,101,59,1,8966,110,4,3,97,100,104,9153,9160,9172,114,114,111,119,59,1,8595,111,119,110,97,114,114,111,119,115,59,1,8650,97,114,112,111,111,110,4,2,108,114,9184,9190,101,102,116,59,1,8643,105,103,104,116,59,1,8642,4,2,98,99,9203,9211,107,97,114,111,119,59,1,10512,4,2,111,114,9217,9222,114,110,59,1,8991,111,112,59,1,8972,4,3,99,111,116,9235,9248,9252,4,2,114,121,9241,9245,59,3,55349,56505,59,1,1109,108,59,1,10742,114,111,107,59,1,273,4,2,100,114,9264,9269,111,116,59,1,8945,105,4,2,59,102,9276,9278,1,9663,59,1,9662,4,2,97,104,9287,9292,114,114,59,1,8693,97,114,59,1,10607,97,110,103,108,101,59,1,10662,4,2,99,105,9311,9315,121,59,1,1119,103,114,97,114,114,59,1,10239,4,18,68,97,99,100,101,102,103,108,109,110,111,112,113,114,115,116,117,120,9361,9376,9398,9439,9444,9447,9462,9495,9531,9585,9598,9614,9659,9755,9771,9792,9808,9826,4,2,68,111,9367,9372,111,116,59,1,10871,116,59,1,8785,4,2,99,115,9382,9392,117,116,101,5,233,1,59,9390,1,233,116,101,114,59,1,10862,4,4,97,105,111,121,9408,9414,9430,9436,114,111,110,59,1,283,114,4,2,59,99,9421,9423,1,8790,5,234,1,59,9428,1,234,108,111,110,59,1,8789,59,1,1101,111,116,59,1,279,59,1,8519,4,2,68,114,9453,9458,111,116,59,1,8786,59,3,55349,56610,4,3,59,114,115,9470,9472,9482,1,10906,97,118,101,5,232,1,59,9480,1,232,4,2,59,100,9488,9490,1,10902,111,116,59,1,10904,4,4,59,105,108,115,9505,9507,9515,9518,1,10905,110,116,101,114,115,59,1,9191,59,1,8467,4,2,59,100,9524,9526,1,10901,111,116,59,1,10903,4,3,97,112,115,9539,9544,9564,99,114,59,1,275,116,121,4,3,59,115,118,9554,9556,9561,1,8709,101,116,59,1,8709,59,1,8709,112,4,2,49,59,9571,9583,4,2,51,52,9577,9580,59,1,8196,59,1,8197,1,8195,4,2,103,115,9591,9594,59,1,331,112,59,1,8194,4,2,103,112,9604,9609,111,110,59,1,281,102,59,3,55349,56662,4,3,97,108,115,9622,9635,9640,114,4,2,59,115,9629,9631,1,8917,108,59,1,10723,117,115,59,1,10865,105,4,3,59,108,118,9649,9651,9656,1,949,111,110,59,1,949,59,1,1013,4,4,99,115,117,118,9669,9686,9716,9747,4,2,105,111,9675,9680,114,99,59,1,8790,108,111,110,59,1,8789,4,2,105,108,9692,9696,109,59,1,8770,97,110,116,4,2,103,108,9705,9710,116,114,59,1,10902,101,115,115,59,1,10901,4,3,97,101,105,9724,9729,9734,108,115,59,1,61,115,116,59,1,8799,118,4,2,59,68,9741,9743,1,8801,68,59,1,10872,112,97,114,115,108,59,1,10725,4,2,68,97,9761,9766,111,116,59,1,8787,114,114,59,1,10609,4,3,99,100,105,9779,9783,9788,114,59,1,8495,111,116,59,1,8784,109,59,1,8770,4,2,97,104,9798,9801,59,1,951,5,240,1,59,9806,1,240,4,2,109,114,9814,9822,108,5,235,1,59,9820,1,235,111,59,1,8364,4,3,99,105,112,9834,9838,9843,108,59,1,33,115,116,59,1,8707,4,2,101,111,9849,9859,99,116,97,116,105,111,110,59,1,8496,110,101,110,116,105,97,108,101,59,1,8519,4,12,97,99,101,102,105,106,108,110,111,112,114,115,9896,9910,9914,9921,9954,9960,9967,9989,9994,10027,10036,10164,108,108,105,110,103,100,111,116,115,101,113,59,1,8786,121,59,1,1092,109,97,108,101,59,1,9792,4,3,105,108,114,9929,9935,9950,108,105,103,59,1,64259,4,2,105,108,9941,9945,103,59,1,64256,105,103,59,1,64260,59,3,55349,56611,108,105,103,59,1,64257,108,105,103,59,3,102,106,4,3,97,108,116,9975,9979,9984,116,59,1,9837,105,103,59,1,64258,110,115,59,1,9649,111,102,59,1,402,4,2,112,114,1e4,10005,102,59,3,55349,56663,4,2,97,107,10011,10016,108,108,59,1,8704,4,2,59,118,10022,10024,1,8916,59,1,10969,97,114,116,105,110,116,59,1,10765,4,2,97,111,10042,10159,4,2,99,115,10048,10155,4,6,49,50,51,52,53,55,10062,10102,10114,10135,10139,10151,4,6,50,51,52,53,54,56,10076,10083,10086,10093,10096,10099,5,189,1,59,10081,1,189,59,1,8531,5,188,1,59,10091,1,188,59,1,8533,59,1,8537,59,1,8539,4,2,51,53,10108,10111,59,1,8532,59,1,8534,4,3,52,53,56,10122,10129,10132,5,190,1,59,10127,1,190,59,1,8535,59,1,8540,53,59,1,8536,4,2,54,56,10145,10148,59,1,8538,59,1,8541,56,59,1,8542,108,59,1,8260,119,110,59,1,8994,99,114,59,3,55349,56507,4,17,69,97,98,99,100,101,102,103,105,106,108,110,111,114,115,116,118,10206,10217,10247,10254,10268,10273,10358,10363,10374,10380,10385,10406,10458,10464,10470,10497,10610,4,2,59,108,10212,10214,1,8807,59,1,10892,4,3,99,109,112,10225,10231,10244,117,116,101,59,1,501,109,97,4,2,59,100,10239,10241,1,947,59,1,989,59,1,10886,114,101,118,101,59,1,287,4,2,105,121,10260,10265,114,99,59,1,285,59,1,1075,111,116,59,1,289,4,4,59,108,113,115,10283,10285,10288,10308,1,8805,59,1,8923,4,3,59,113,115,10296,10298,10301,1,8805,59,1,8807,108,97,110,116,59,1,10878,4,4,59,99,100,108,10318,10320,10324,10345,1,10878,99,59,1,10921,111,116,4,2,59,111,10332,10334,1,10880,4,2,59,108,10340,10342,1,10882,59,1,10884,4,2,59,101,10351,10354,3,8923,65024,115,59,1,10900,114,59,3,55349,56612,4,2,59,103,10369,10371,1,8811,59,1,8921,109,101,108,59,1,8503,99,121,59,1,1107,4,4,59,69,97,106,10395,10397,10400,10403,1,8823,59,1,10898,59,1,10917,59,1,10916,4,4,69,97,101,115,10416,10419,10434,10453,59,1,8809,112,4,2,59,112,10426,10428,1,10890,114,111,120,59,1,10890,4,2,59,113,10440,10442,1,10888,4,2,59,113,10448,10450,1,10888,59,1,8809,105,109,59,1,8935,112,102,59,3,55349,56664,97,118,101,59,1,96,4,2,99,105,10476,10480,114,59,1,8458,109,4,3,59,101,108,10489,10491,10494,1,8819,59,1,10894,59,1,10896,5,62,6,59,99,100,108,113,114,10512,10514,10527,10532,10538,10545,1,62,4,2,99,105,10520,10523,59,1,10919,114,59,1,10874,111,116,59,1,8919,80,97,114,59,1,10645,117,101,115,116,59,1,10876,4,5,97,100,101,108,115,10557,10574,10579,10599,10605,4,2,112,114,10563,10570,112,114,111,120,59,1,10886,114,59,1,10616,111,116,59,1,8919,113,4,2,108,113,10586,10592,101,115,115,59,1,8923,108,101,115,115,59,1,10892,101,115,115,59,1,8823,105,109,59,1,8819,4,2,101,110,10616,10626,114,116,110,101,113,113,59,3,8809,65024,69,59,3,8809,65024,4,10,65,97,98,99,101,102,107,111,115,121,10653,10658,10713,10718,10724,10760,10765,10786,10850,10875,114,114,59,1,8660,4,4,105,108,109,114,10668,10674,10678,10684,114,115,112,59,1,8202,102,59,1,189,105,108,116,59,1,8459,4,2,100,114,10690,10695,99,121,59,1,1098,4,3,59,99,119,10703,10705,10710,1,8596,105,114,59,1,10568,59,1,8621,97,114,59,1,8463,105,114,99,59,1,293,4,3,97,108,114,10732,10748,10754,114,116,115,4,2,59,117,10741,10743,1,9829,105,116,59,1,9829,108,105,112,59,1,8230,99,111,110,59,1,8889,114,59,3,55349,56613,115,4,2,101,119,10772,10779,97,114,111,119,59,1,10533,97,114,111,119,59,1,10534,4,5,97,109,111,112,114,10798,10803,10809,10839,10844,114,114,59,1,8703,116,104,116,59,1,8763,107,4,2,108,114,10816,10827,101,102,116,97,114,114,111,119,59,1,8617,105,103,104,116,97,114,114,111,119,59,1,8618,102,59,3,55349,56665,98,97,114,59,1,8213,4,3,99,108,116,10858,10863,10869,114,59,3,55349,56509,97,115,104,59,1,8463,114,111,107,59,1,295,4,2,98,112,10881,10887,117,108,108,59,1,8259,104,101,110,59,1,8208,4,15,97,99,101,102,103,105,106,109,110,111,112,113,115,116,117,10925,10936,10958,10977,10990,11001,11039,11045,11101,11192,11220,11226,11237,11285,11299,99,117,116,101,5,237,1,59,10934,1,237,4,3,59,105,121,10944,10946,10955,1,8291,114,99,5,238,1,59,10953,1,238,59,1,1080,4,2,99,120,10964,10968,121,59,1,1077,99,108,5,161,1,59,10975,1,161,4,2,102,114,10983,10986,59,1,8660,59,3,55349,56614,114,97,118,101,5,236,1,59,10999,1,236,4,4,59,105,110,111,11011,11013,11028,11034,1,8520,4,2,105,110,11019,11024,110,116,59,1,10764,116,59,1,8749,102,105,110,59,1,10716,116,97,59,1,8489,108,105,103,59,1,307,4,3,97,111,112,11053,11092,11096,4,3,99,103,116,11061,11065,11088,114,59,1,299,4,3,101,108,112,11073,11076,11082,59,1,8465,105,110,101,59,1,8464,97,114,116,59,1,8465,104,59,1,305,102,59,1,8887,101,100,59,1,437,4,5,59,99,102,111,116,11113,11115,11121,11136,11142,1,8712,97,114,101,59,1,8453,105,110,4,2,59,116,11129,11131,1,8734,105,101,59,1,10717,100,111,116,59,1,305,4,5,59,99,101,108,112,11154,11156,11161,11179,11186,1,8747,97,108,59,1,8890,4,2,103,114,11167,11173,101,114,115,59,1,8484,99,97,108,59,1,8890,97,114,104,107,59,1,10775,114,111,100,59,1,10812,4,4,99,103,112,116,11202,11206,11211,11216,121,59,1,1105,111,110,59,1,303,102,59,3,55349,56666,97,59,1,953,114,111,100,59,1,10812,117,101,115,116,5,191,1,59,11235,1,191,4,2,99,105,11243,11248,114,59,3,55349,56510,110,4,5,59,69,100,115,118,11261,11263,11266,11271,11282,1,8712,59,1,8953,111,116,59,1,8949,4,2,59,118,11277,11279,1,8948,59,1,8947,59,1,8712,4,2,59,105,11291,11293,1,8290,108,100,101,59,1,297,4,2,107,109,11305,11310,99,121,59,1,1110,108,5,239,1,59,11316,1,239,4,6,99,102,109,111,115,117,11332,11346,11351,11357,11363,11380,4,2,105,121,11338,11343,114,99,59,1,309,59,1,1081,114,59,3,55349,56615,97,116,104,59,1,567,112,102,59,3,55349,56667,4,2,99,101,11369,11374,114,59,3,55349,56511,114,99,121,59,1,1112,107,99,121,59,1,1108,4,8,97,99,102,103,104,106,111,115,11404,11418,11433,11438,11445,11450,11455,11461,112,112,97,4,2,59,118,11413,11415,1,954,59,1,1008,4,2,101,121,11424,11430,100,105,108,59,1,311,59,1,1082,114,59,3,55349,56616,114,101,101,110,59,1,312,99,121,59,1,1093,99,121,59,1,1116,112,102,59,3,55349,56668,99,114,59,3,55349,56512,4,23,65,66,69,72,97,98,99,100,101,102,103,104,106,108,109,110,111,112,114,115,116,117,118,11515,11538,11544,11555,11560,11721,11780,11818,11868,12136,12160,12171,12203,12208,12246,12275,12327,12509,12523,12569,12641,12732,12752,4,3,97,114,116,11523,11528,11532,114,114,59,1,8666,114,59,1,8656,97,105,108,59,1,10523,97,114,114,59,1,10510,4,2,59,103,11550,11552,1,8806,59,1,10891,97,114,59,1,10594,4,9,99,101,103,109,110,112,113,114,116,11580,11586,11594,11600,11606,11624,11627,11636,11694,117,116,101,59,1,314,109,112,116,121,118,59,1,10676,114,97,110,59,1,8466,98,100,97,59,1,955,103,4,3,59,100,108,11615,11617,11620,1,10216,59,1,10641,101,59,1,10216,59,1,10885,117,111,5,171,1,59,11634,1,171,114,4,8,59,98,102,104,108,112,115,116,11655,11657,11669,11673,11677,11681,11685,11690,1,8592,4,2,59,102,11663,11665,1,8676,115,59,1,10527,115,59,1,10525,107,59,1,8617,112,59,1,8619,108,59,1,10553,105,109,59,1,10611,108,59,1,8610,4,3,59,97,101,11702,11704,11709,1,10923,105,108,59,1,10521,4,2,59,115,11715,11717,1,10925,59,3,10925,65024,4,3,97,98,114,11729,11734,11739,114,114,59,1,10508,114,107,59,1,10098,4,2,97,107,11745,11758,99,4,2,101,107,11752,11755,59,1,123,59,1,91,4,2,101,115,11764,11767,59,1,10635,108,4,2,100,117,11774,11777,59,1,10639,59,1,10637,4,4,97,101,117,121,11790,11796,11811,11815,114,111,110,59,1,318,4,2,100,105,11802,11807,105,108,59,1,316,108,59,1,8968,98,59,1,123,59,1,1083,4,4,99,113,114,115,11828,11832,11845,11864,97,59,1,10550,117,111,4,2,59,114,11840,11842,1,8220,59,1,8222,4,2,100,117,11851,11857,104,97,114,59,1,10599,115,104,97,114,59,1,10571,104,59,1,8626,4,5,59,102,103,113,115,11880,11882,12008,12011,12031,1,8804,116,4,5,97,104,108,114,116,11895,11913,11935,11947,11996,114,114,111,119,4,2,59,116,11905,11907,1,8592,97,105,108,59,1,8610,97,114,112,111,111,110,4,2,100,117,11925,11931,111,119,110,59,1,8637,112,59,1,8636,101,102,116,97,114,114,111,119,115,59,1,8647,105,103,104,116,4,3,97,104,115,11959,11974,11984,114,114,111,119,4,2,59,115,11969,11971,1,8596,59,1,8646,97,114,112,111,111,110,115,59,1,8651,113,117,105,103,97,114,114,111,119,59,1,8621,104,114,101,101,116,105,109,101,115,59,1,8907,59,1,8922,4,3,59,113,115,12019,12021,12024,1,8804,59,1,8806,108,97,110,116,59,1,10877,4,5,59,99,100,103,115,12043,12045,12049,12070,12083,1,10877,99,59,1,10920,111,116,4,2,59,111,12057,12059,1,10879,4,2,59,114,12065,12067,1,10881,59,1,10883,4,2,59,101,12076,12079,3,8922,65024,115,59,1,10899,4,5,97,100,101,103,115,12095,12103,12108,12126,12131,112,112,114,111,120,59,1,10885,111,116,59,1,8918,113,4,2,103,113,12115,12120,116,114,59,1,8922,103,116,114,59,1,10891,116,114,59,1,8822,105,109,59,1,8818,4,3,105,108,114,12144,12150,12156,115,104,116,59,1,10620,111,111,114,59,1,8970,59,3,55349,56617,4,2,59,69,12166,12168,1,8822,59,1,10897,4,2,97,98,12177,12198,114,4,2,100,117,12184,12187,59,1,8637,4,2,59,108,12193,12195,1,8636,59,1,10602,108,107,59,1,9604,99,121,59,1,1113,4,5,59,97,99,104,116,12220,12222,12227,12235,12241,1,8810,114,114,59,1,8647,111,114,110,101,114,59,1,8990,97,114,100,59,1,10603,114,105,59,1,9722,4,2,105,111,12252,12258,100,111,116,59,1,320,117,115,116,4,2,59,97,12267,12269,1,9136,99,104,101,59,1,9136,4,4,69,97,101,115,12285,12288,12303,12322,59,1,8808,112,4,2,59,112,12295,12297,1,10889,114,111,120,59,1,10889,4,2,59,113,12309,12311,1,10887,4,2,59,113,12317,12319,1,10887,59,1,8808,105,109,59,1,8934,4,8,97,98,110,111,112,116,119,122,12345,12359,12364,12421,12446,12467,12474,12490,4,2,110,114,12351,12355,103,59,1,10220,114,59,1,8701,114,107,59,1,10214,103,4,3,108,109,114,12373,12401,12409,101,102,116,4,2,97,114,12382,12389,114,114,111,119,59,1,10229,105,103,104,116,97,114,114,111,119,59,1,10231,97,112,115,116,111,59,1,10236,105,103,104,116,97,114,114,111,119,59,1,10230,112,97,114,114,111,119,4,2,108,114,12433,12439,101,102,116,59,1,8619,105,103,104,116,59,1,8620,4,3,97,102,108,12454,12458,12462,114,59,1,10629,59,3,55349,56669,117,115,59,1,10797,105,109,101,115,59,1,10804,4,2,97,98,12480,12485,115,116,59,1,8727,97,114,59,1,95,4,3,59,101,102,12498,12500,12506,1,9674,110,103,101,59,1,9674,59,1,10731,97,114,4,2,59,108,12517,12519,1,40,116,59,1,10643,4,5,97,99,104,109,116,12535,12540,12548,12561,12564,114,114,59,1,8646,111,114,110,101,114,59,1,8991,97,114,4,2,59,100,12556,12558,1,8651,59,1,10605,59,1,8206,114,105,59,1,8895,4,6,97,99,104,105,113,116,12583,12589,12594,12597,12614,12635,113,117,111,59,1,8249,114,59,3,55349,56513,59,1,8624,109,4,3,59,101,103,12606,12608,12611,1,8818,59,1,10893,59,1,10895,4,2,98,117,12620,12623,59,1,91,111,4,2,59,114,12630,12632,1,8216,59,1,8218,114,111,107,59,1,322,5,60,8,59,99,100,104,105,108,113,114,12660,12662,12675,12680,12686,12692,12698,12705,1,60,4,2,99,105,12668,12671,59,1,10918,114,59,1,10873,111,116,59,1,8918,114,101,101,59,1,8907,109,101,115,59,1,8905,97,114,114,59,1,10614,117,101,115,116,59,1,10875,4,2,80,105,12711,12716,97,114,59,1,10646,4,3,59,101,102,12724,12726,12729,1,9667,59,1,8884,59,1,9666,114,4,2,100,117,12739,12746,115,104,97,114,59,1,10570,104,97,114,59,1,10598,4,2,101,110,12758,12768,114,116,110,101,113,113,59,3,8808,65024,69,59,3,8808,65024,4,14,68,97,99,100,101,102,104,105,108,110,111,112,115,117,12803,12809,12893,12908,12914,12928,12933,12937,13011,13025,13032,13049,13052,13069,68,111,116,59,1,8762,4,4,99,108,112,114,12819,12827,12849,12887,114,5,175,1,59,12825,1,175,4,2,101,116,12833,12836,59,1,9794,4,2,59,101,12842,12844,1,10016,115,101,59,1,10016,4,2,59,115,12855,12857,1,8614,116,111,4,4,59,100,108,117,12869,12871,12877,12883,1,8614,111,119,110,59,1,8615,101,102,116,59,1,8612,112,59,1,8613,107,101,114,59,1,9646,4,2,111,121,12899,12905,109,109,97,59,1,10793,59,1,1084,97,115,104,59,1,8212,97,115,117,114,101,100,97,110,103,108,101,59,1,8737,114,59,3,55349,56618,111,59,1,8487,4,3,99,100,110,12945,12954,12985,114,111,5,181,1,59,12952,1,181,4,4,59,97,99,100,12964,12966,12971,12976,1,8739,115,116,59,1,42,105,114,59,1,10992,111,116,5,183,1,59,12983,1,183,117,115,4,3,59,98,100,12995,12997,13e3,1,8722,59,1,8863,4,2,59,117,13006,13008,1,8760,59,1,10794,4,2,99,100,13017,13021,112,59,1,10971,114,59,1,8230,112,108,117,115,59,1,8723,4,2,100,112,13038,13044,101,108,115,59,1,8871,102,59,3,55349,56670,59,1,8723,4,2,99,116,13058,13063,114,59,3,55349,56514,112,111,115,59,1,8766,4,3,59,108,109,13077,13079,13087,1,956,116,105,109,97,112,59,1,8888,97,112,59,1,8888,4,24,71,76,82,86,97,98,99,100,101,102,103,104,105,106,108,109,111,112,114,115,116,117,118,119,13142,13165,13217,13229,13247,13330,13359,13414,13420,13508,13513,13579,13602,13626,13631,13762,13767,13855,13936,13995,14214,14285,14312,14432,4,2,103,116,13148,13152,59,3,8921,824,4,2,59,118,13158,13161,3,8811,8402,59,3,8811,824,4,3,101,108,116,13173,13200,13204,102,116,4,2,97,114,13181,13188,114,114,111,119,59,1,8653,105,103,104,116,97,114,114,111,119,59,1,8654,59,3,8920,824,4,2,59,118,13210,13213,3,8810,8402,59,3,8810,824,105,103,104,116,97,114,114,111,119,59,1,8655,4,2,68,100,13235,13241,97,115,104,59,1,8879,97,115,104,59,1,8878,4,5,98,99,110,112,116,13259,13264,13270,13275,13308,108,97,59,1,8711,117,116,101,59,1,324,103,59,3,8736,8402,4,5,59,69,105,111,112,13287,13289,13293,13298,13302,1,8777,59,3,10864,824,100,59,3,8779,824,115,59,1,329,114,111,120,59,1,8777,117,114,4,2,59,97,13316,13318,1,9838,108,4,2,59,115,13325,13327,1,9838,59,1,8469,4,2,115,117,13336,13344,112,5,160,1,59,13342,1,160,109,112,4,2,59,101,13352,13355,3,8782,824,59,3,8783,824,4,5,97,101,111,117,121,13371,13385,13391,13407,13411,4,2,112,114,13377,13380,59,1,10819,111,110,59,1,328,100,105,108,59,1,326,110,103,4,2,59,100,13399,13401,1,8775,111,116,59,3,10861,824,112,59,1,10818,59,1,1085,97,115,104,59,1,8211,4,7,59,65,97,100,113,115,120,13436,13438,13443,13466,13472,13478,13494,1,8800,114,114,59,1,8663,114,4,2,104,114,13450,13454,107,59,1,10532,4,2,59,111,13460,13462,1,8599,119,59,1,8599,111,116,59,3,8784,824,117,105,118,59,1,8802,4,2,101,105,13484,13489,97,114,59,1,10536,109,59,3,8770,824,105,115,116,4,2,59,115,13503,13505,1,8708,59,1,8708,114,59,3,55349,56619,4,4,69,101,115,116,13523,13527,13563,13568,59,3,8807,824,4,3,59,113,115,13535,13537,13559,1,8817,4,3,59,113,115,13545,13547,13551,1,8817,59,3,8807,824,108,97,110,116,59,3,10878,824,59,3,10878,824,105,109,59,1,8821,4,2,59,114,13574,13576,1,8815,59,1,8815,4,3,65,97,112,13587,13592,13597,114,114,59,1,8654,114,114,59,1,8622,97,114,59,1,10994,4,3,59,115,118,13610,13612,13623,1,8715,4,2,59,100,13618,13620,1,8956,59,1,8954,59,1,8715,99,121,59,1,1114,4,7,65,69,97,100,101,115,116,13647,13652,13656,13661,13665,13737,13742,114,114,59,1,8653,59,3,8806,824,114,114,59,1,8602,114,59,1,8229,4,4,59,102,113,115,13675,13677,13703,13725,1,8816,116,4,2,97,114,13684,13691,114,114,111,119,59,1,8602,105,103,104,116,97,114,114,111,119,59,1,8622,4,3,59,113,115,13711,13713,13717,1,8816,59,3,8806,824,108,97,110,116,59,3,10877,824,4,2,59,115,13731,13734,3,10877,824,59,1,8814,105,109,59,1,8820,4,2,59,114,13748,13750,1,8814,105,4,2,59,101,13757,13759,1,8938,59,1,8940,105,100,59,1,8740,4,2,112,116,13773,13778,102,59,3,55349,56671,5,172,3,59,105,110,13787,13789,13829,1,172,110,4,4,59,69,100,118,13800,13802,13806,13812,1,8713,59,3,8953,824,111,116,59,3,8949,824,4,3,97,98,99,13820,13823,13826,59,1,8713,59,1,8951,59,1,8950,105,4,2,59,118,13836,13838,1,8716,4,3,97,98,99,13846,13849,13852,59,1,8716,59,1,8958,59,1,8957,4,3,97,111,114,13863,13892,13899,114,4,4,59,97,115,116,13874,13876,13883,13888,1,8742,108,108,101,108,59,1,8742,108,59,3,11005,8421,59,3,8706,824,108,105,110,116,59,1,10772,4,3,59,99,101,13907,13909,13914,1,8832,117,101,59,1,8928,4,2,59,99,13920,13923,3,10927,824,4,2,59,101,13929,13931,1,8832,113,59,3,10927,824,4,4,65,97,105,116,13946,13951,13971,13982,114,114,59,1,8655,114,114,4,3,59,99,119,13961,13963,13967,1,8603,59,3,10547,824,59,3,8605,824,103,104,116,97,114,114,111,119,59,1,8603,114,105,4,2,59,101,13990,13992,1,8939,59,1,8941,4,7,99,104,105,109,112,113,117,14011,14036,14060,14080,14085,14090,14106,4,4,59,99,101,114,14021,14023,14028,14032,1,8833,117,101,59,1,8929,59,3,10928,824,59,3,55349,56515,111,114,116,4,2,109,112,14045,14050,105,100,59,1,8740,97,114,97,108,108,101,108,59,1,8742,109,4,2,59,101,14067,14069,1,8769,4,2,59,113,14075,14077,1,8772,59,1,8772,105,100,59,1,8740,97,114,59,1,8742,115,117,4,2,98,112,14098,14102,101,59,1,8930,101,59,1,8931,4,3,98,99,112,14114,14157,14171,4,4,59,69,101,115,14124,14126,14130,14133,1,8836,59,3,10949,824,59,1,8840,101,116,4,2,59,101,14141,14144,3,8834,8402,113,4,2,59,113,14151,14153,1,8840,59,3,10949,824,99,4,2,59,101,14164,14166,1,8833,113,59,3,10928,824,4,4,59,69,101,115,14181,14183,14187,14190,1,8837,59,3,10950,824,59,1,8841,101,116,4,2,59,101,14198,14201,3,8835,8402,113,4,2,59,113,14208,14210,1,8841,59,3,10950,824,4,4,103,105,108,114,14224,14228,14238,14242,108,59,1,8825,108,100,101,5,241,1,59,14236,1,241,103,59,1,8824,105,97,110,103,108,101,4,2,108,114,14254,14269,101,102,116,4,2,59,101,14263,14265,1,8938,113,59,1,8940,105,103,104,116,4,2,59,101,14279,14281,1,8939,113,59,1,8941,4,2,59,109,14291,14293,1,957,4,3,59,101,115,14301,14303,14308,1,35,114,111,59,1,8470,112,59,1,8199,4,9,68,72,97,100,103,105,108,114,115,14332,14338,14344,14349,14355,14369,14376,14408,14426,97,115,104,59,1,8877,97,114,114,59,1,10500,112,59,3,8781,8402,97,115,104,59,1,8876,4,2,101,116,14361,14365,59,3,8805,8402,59,3,62,8402,110,102,105,110,59,1,10718,4,3,65,101,116,14384,14389,14393,114,114,59,1,10498,59,3,8804,8402,4,2,59,114,14399,14402,3,60,8402,105,101,59,3,8884,8402,4,2,65,116,14414,14419,114,114,59,1,10499,114,105,101,59,3,8885,8402,105,109,59,3,8764,8402,4,3,65,97,110,14440,14445,14468,114,114,59,1,8662,114,4,2,104,114,14452,14456,107,59,1,10531,4,2,59,111,14462,14464,1,8598,119,59,1,8598,101,97,114,59,1,10535,4,18,83,97,99,100,101,102,103,104,105,108,109,111,112,114,115,116,117,118,14512,14515,14535,14560,14597,14603,14618,14643,14657,14662,14701,14741,14747,14769,14851,14877,14907,14916,59,1,9416,4,2,99,115,14521,14531,117,116,101,5,243,1,59,14529,1,243,116,59,1,8859,4,2,105,121,14541,14557,114,4,2,59,99,14548,14550,1,8858,5,244,1,59,14555,1,244,59,1,1086,4,5,97,98,105,111,115,14572,14577,14583,14587,14591,115,104,59,1,8861,108,97,99,59,1,337,118,59,1,10808,116,59,1,8857,111,108,100,59,1,10684,108,105,103,59,1,339,4,2,99,114,14609,14614,105,114,59,1,10687,59,3,55349,56620,4,3,111,114,116,14626,14630,14640,110,59,1,731,97,118,101,5,242,1,59,14638,1,242,59,1,10689,4,2,98,109,14649,14654,97,114,59,1,10677,59,1,937,110,116,59,1,8750,4,4,97,99,105,116,14672,14677,14693,14698,114,114,59,1,8634,4,2,105,114,14683,14687,114,59,1,10686,111,115,115,59,1,10683,110,101,59,1,8254,59,1,10688,4,3,97,101,105,14709,14714,14719,99,114,59,1,333,103,97,59,1,969,4,3,99,100,110,14727,14733,14736,114,111,110,59,1,959,59,1,10678,117,115,59,1,8854,112,102,59,3,55349,56672,4,3,97,101,108,14755,14759,14764,114,59,1,10679,114,112,59,1,10681,117,115,59,1,8853,4,7,59,97,100,105,111,115,118,14785,14787,14792,14831,14837,14841,14848,1,8744,114,114,59,1,8635,4,4,59,101,102,109,14802,14804,14817,14824,1,10845,114,4,2,59,111,14811,14813,1,8500,102,59,1,8500,5,170,1,59,14822,1,170,5,186,1,59,14829,1,186,103,111,102,59,1,8886,114,59,1,10838,108,111,112,101,59,1,10839,59,1,10843,4,3,99,108,111,14859,14863,14873,114,59,1,8500,97,115,104,5,248,1,59,14871,1,248,108,59,1,8856,105,4,2,108,109,14884,14893,100,101,5,245,1,59,14891,1,245,101,115,4,2,59,97,14901,14903,1,8855,115,59,1,10806,109,108,5,246,1,59,14914,1,246,98,97,114,59,1,9021,4,12,97,99,101,102,104,105,108,109,111,114,115,117,14948,14992,14996,15033,15038,15068,15090,15189,15192,15222,15427,15441,114,4,4,59,97,115,116,14959,14961,14976,14989,1,8741,5,182,2,59,108,14968,14970,1,182,108,101,108,59,1,8741,4,2,105,108,14982,14986,109,59,1,10995,59,1,11005,59,1,8706,121,59,1,1087,114,4,5,99,105,109,112,116,15009,15014,15019,15024,15027,110,116,59,1,37,111,100,59,1,46,105,108,59,1,8240,59,1,8869,101,110,107,59,1,8241,114,59,3,55349,56621,4,3,105,109,111,15046,15057,15063,4,2,59,118,15052,15054,1,966,59,1,981,109,97,116,59,1,8499,110,101,59,1,9742,4,3,59,116,118,15076,15078,15087,1,960,99,104,102,111,114,107,59,1,8916,59,1,982,4,2,97,117,15096,15119,110,4,2,99,107,15103,15115,107,4,2,59,104,15110,15112,1,8463,59,1,8462,118,59,1,8463,115,4,9,59,97,98,99,100,101,109,115,116,15140,15142,15148,15151,15156,15168,15171,15179,15184,1,43,99,105,114,59,1,10787,59,1,8862,105,114,59,1,10786,4,2,111,117,15162,15165,59,1,8724,59,1,10789,59,1,10866,110,5,177,1,59,15177,1,177,105,109,59,1,10790,119,111,59,1,10791,59,1,177,4,3,105,112,117,15200,15208,15213,110,116,105,110,116,59,1,10773,102,59,3,55349,56673,110,100,5,163,1,59,15220,1,163,4,10,59,69,97,99,101,105,110,111,115,117,15244,15246,15249,15253,15258,15334,15347,15367,15416,15421,1,8826,59,1,10931,112,59,1,10935,117,101,59,1,8828,4,2,59,99,15264,15266,1,10927,4,6,59,97,99,101,110,115,15280,15282,15290,15299,15303,15329,1,8826,112,112,114,111,120,59,1,10935,117,114,108,121,101,113,59,1,8828,113,59,1,10927,4,3,97,101,115,15311,15319,15324,112,112,114,111,120,59,1,10937,113,113,59,1,10933,105,109,59,1,8936,105,109,59,1,8830,109,101,4,2,59,115,15342,15344,1,8242,59,1,8473,4,3,69,97,115,15355,15358,15362,59,1,10933,112,59,1,10937,105,109,59,1,8936,4,3,100,102,112,15375,15378,15404,59,1,8719,4,3,97,108,115,15386,15392,15398,108,97,114,59,1,9006,105,110,101,59,1,8978,117,114,102,59,1,8979,4,2,59,116,15410,15412,1,8733,111,59,1,8733,105,109,59,1,8830,114,101,108,59,1,8880,4,2,99,105,15433,15438,114,59,3,55349,56517,59,1,968,110,99,115,112,59,1,8200,4,6,102,105,111,112,115,117,15462,15467,15472,15478,15485,15491,114,59,3,55349,56622,110,116,59,1,10764,112,102,59,3,55349,56674,114,105,109,101,59,1,8279,99,114,59,3,55349,56518,4,3,97,101,111,15499,15520,15534,116,4,2,101,105,15506,15515,114,110,105,111,110,115,59,1,8461,110,116,59,1,10774,115,116,4,2,59,101,15528,15530,1,63,113,59,1,8799,116,5,34,1,59,15540,1,34,4,21,65,66,72,97,98,99,100,101,102,104,105,108,109,110,111,112,114,115,116,117,120,15586,15609,15615,15620,15796,15855,15893,15931,15977,16001,16039,16183,16204,16222,16228,16285,16312,16318,16363,16408,16416,4,3,97,114,116,15594,15599,15603,114,114,59,1,8667,114,59,1,8658,97,105,108,59,1,10524,97,114,114,59,1,10511,97,114,59,1,10596,4,7,99,100,101,110,113,114,116,15636,15651,15656,15664,15687,15696,15770,4,2,101,117,15642,15646,59,3,8765,817,116,101,59,1,341,105,99,59,1,8730,109,112,116,121,118,59,1,10675,103,4,4,59,100,101,108,15675,15677,15680,15683,1,10217,59,1,10642,59,1,10661,101,59,1,10217,117,111,5,187,1,59,15694,1,187,114,4,11,59,97,98,99,102,104,108,112,115,116,119,15721,15723,15727,15739,15742,15746,15750,15754,15758,15763,15767,1,8594,112,59,1,10613,4,2,59,102,15733,15735,1,8677,115,59,1,10528,59,1,10547,115,59,1,10526,107,59,1,8618,112,59,1,8620,108,59,1,10565,105,109,59,1,10612,108,59,1,8611,59,1,8605,4,2,97,105,15776,15781,105,108,59,1,10522,111,4,2,59,110,15788,15790,1,8758,97,108,115,59,1,8474,4,3,97,98,114,15804,15809,15814,114,114,59,1,10509,114,107,59,1,10099,4,2,97,107,15820,15833,99,4,2,101,107,15827,15830,59,1,125,59,1,93,4,2,101,115,15839,15842,59,1,10636,108,4,2,100,117,15849,15852,59,1,10638,59,1,10640,4,4,97,101,117,121,15865,15871,15886,15890,114,111,110,59,1,345,4,2,100,105,15877,15882,105,108,59,1,343,108,59,1,8969,98,59,1,125,59,1,1088,4,4,99,108,113,115,15903,15907,15914,15927,97,59,1,10551,100,104,97,114,59,1,10601,117,111,4,2,59,114,15922,15924,1,8221,59,1,8221,104,59,1,8627,4,3,97,99,103,15939,15966,15970,108,4,4,59,105,112,115,15950,15952,15957,15963,1,8476,110,101,59,1,8475,97,114,116,59,1,8476,59,1,8477,116,59,1,9645,5,174,1,59,15975,1,174,4,3,105,108,114,15985,15991,15997,115,104,116,59,1,10621,111,111,114,59,1,8971,59,3,55349,56623,4,2,97,111,16007,16028,114,4,2,100,117,16014,16017,59,1,8641,4,2,59,108,16023,16025,1,8640,59,1,10604,4,2,59,118,16034,16036,1,961,59,1,1009,4,3,103,110,115,16047,16167,16171,104,116,4,6,97,104,108,114,115,116,16063,16081,16103,16130,16143,16155,114,114,111,119,4,2,59,116,16073,16075,1,8594,97,105,108,59,1,8611,97,114,112,111,111,110,4,2,100,117,16093,16099,111,119,110,59,1,8641,112,59,1,8640,101,102,116,4,2,97,104,16112,16120,114,114,111,119,115,59,1,8644,97,114,112,111,111,110,115,59,1,8652,105,103,104,116,97,114,114,111,119,115,59,1,8649,113,117,105,103,97,114,114,111,119,59,1,8605,104,114,101,101,116,105,109,101,115,59,1,8908,103,59,1,730,105,110,103,100,111,116,115,101,113,59,1,8787,4,3,97,104,109,16191,16196,16201,114,114,59,1,8644,97,114,59,1,8652,59,1,8207,111,117,115,116,4,2,59,97,16214,16216,1,9137,99,104,101,59,1,9137,109,105,100,59,1,10990,4,4,97,98,112,116,16238,16252,16257,16278,4,2,110,114,16244,16248,103,59,1,10221,114,59,1,8702,114,107,59,1,10215,4,3,97,102,108,16265,16269,16273,114,59,1,10630,59,3,55349,56675,117,115,59,1,10798,105,109,101,115,59,1,10805,4,2,97,112,16291,16304,114,4,2,59,103,16298,16300,1,41,116,59,1,10644,111,108,105,110,116,59,1,10770,97,114,114,59,1,8649,4,4,97,99,104,113,16328,16334,16339,16342,113,117,111,59,1,8250,114,59,3,55349,56519,59,1,8625,4,2,98,117,16348,16351,59,1,93,111,4,2,59,114,16358,16360,1,8217,59,1,8217,4,3,104,105,114,16371,16377,16383,114,101,101,59,1,8908,109,101,115,59,1,8906,105,4,4,59,101,102,108,16394,16396,16399,16402,1,9657,59,1,8885,59,1,9656,116,114,105,59,1,10702,108,117,104,97,114,59,1,10600,59,1,8478,4,19,97,98,99,100,101,102,104,105,108,109,111,112,113,114,115,116,117,119,122,16459,16466,16472,16572,16590,16672,16687,16746,16844,16850,16924,16963,16988,17115,17121,17154,17206,17614,17656,99,117,116,101,59,1,347,113,117,111,59,1,8218,4,10,59,69,97,99,101,105,110,112,115,121,16494,16496,16499,16513,16518,16531,16536,16556,16564,16569,1,8827,59,1,10932,4,2,112,114,16505,16508,59,1,10936,111,110,59,1,353,117,101,59,1,8829,4,2,59,100,16524,16526,1,10928,105,108,59,1,351,114,99,59,1,349,4,3,69,97,115,16544,16547,16551,59,1,10934,112,59,1,10938,105,109,59,1,8937,111,108,105,110,116,59,1,10771,105,109,59,1,8831,59,1,1089,111,116,4,3,59,98,101,16582,16584,16587,1,8901,59,1,8865,59,1,10854,4,7,65,97,99,109,115,116,120,16606,16611,16634,16642,16646,16652,16668,114,114,59,1,8664,114,4,2,104,114,16618,16622,107,59,1,10533,4,2,59,111,16628,16630,1,8600,119,59,1,8600,116,5,167,1,59,16640,1,167,105,59,1,59,119,97,114,59,1,10537,109,4,2,105,110,16659,16665,110,117,115,59,1,8726,59,1,8726,116,59,1,10038,114,4,2,59,111,16679,16682,3,55349,56624,119,110,59,1,8994,4,4,97,99,111,121,16697,16702,16716,16739,114,112,59,1,9839,4,2,104,121,16708,16713,99,121,59,1,1097,59,1,1096,114,116,4,2,109,112,16724,16729,105,100,59,1,8739,97,114,97,108,108,101,108,59,1,8741,5,173,1,59,16744,1,173,4,2,103,109,16752,16770,109,97,4,3,59,102,118,16762,16764,16767,1,963,59,1,962,59,1,962,4,8,59,100,101,103,108,110,112,114,16788,16790,16795,16806,16817,16828,16832,16838,1,8764,111,116,59,1,10858,4,2,59,113,16801,16803,1,8771,59,1,8771,4,2,59,69,16812,16814,1,10910,59,1,10912,4,2,59,69,16823,16825,1,10909,59,1,10911,101,59,1,8774,108,117,115,59,1,10788,97,114,114,59,1,10610,97,114,114,59,1,8592,4,4,97,101,105,116,16860,16883,16891,16904,4,2,108,115,16866,16878,108,115,101,116,109,105,110,117,115,59,1,8726,104,112,59,1,10803,112,97,114,115,108,59,1,10724,4,2,100,108,16897,16900,59,1,8739,101,59,1,8995,4,2,59,101,16910,16912,1,10922,4,2,59,115,16918,16920,1,10924,59,3,10924,65024,4,3,102,108,112,16932,16938,16958,116,99,121,59,1,1100,4,2,59,98,16944,16946,1,47,4,2,59,97,16952,16954,1,10692,114,59,1,9023,102,59,3,55349,56676,97,4,2,100,114,16970,16985,101,115,4,2,59,117,16978,16980,1,9824,105,116,59,1,9824,59,1,8741,4,3,99,115,117,16996,17028,17089,4,2,97,117,17002,17015,112,4,2,59,115,17009,17011,1,8851,59,3,8851,65024,112,4,2,59,115,17022,17024,1,8852,59,3,8852,65024,117,4,2,98,112,17035,17062,4,3,59,101,115,17043,17045,17048,1,8847,59,1,8849,101,116,4,2,59,101,17056,17058,1,8847,113,59,1,8849,4,3,59,101,115,17070,17072,17075,1,8848,59,1,8850,101,116,4,2,59,101,17083,17085,1,8848,113,59,1,8850,4,3,59,97,102,17097,17099,17112,1,9633,114,4,2,101,102,17106,17109,59,1,9633,59,1,9642,59,1,9642,97,114,114,59,1,8594,4,4,99,101,109,116,17131,17136,17142,17148,114,59,3,55349,56520,116,109,110,59,1,8726,105,108,101,59,1,8995,97,114,102,59,1,8902,4,2,97,114,17160,17172,114,4,2,59,102,17167,17169,1,9734,59,1,9733,4,2,97,110,17178,17202,105,103,104,116,4,2,101,112,17188,17197,112,115,105,108,111,110,59,1,1013,104,105,59,1,981,115,59,1,175,4,5,98,99,109,110,112,17218,17351,17420,17423,17427,4,9,59,69,100,101,109,110,112,114,115,17238,17240,17243,17248,17261,17267,17279,17285,17291,1,8834,59,1,10949,111,116,59,1,10941,4,2,59,100,17254,17256,1,8838,111,116,59,1,10947,117,108,116,59,1,10945,4,2,69,101,17273,17276,59,1,10955,59,1,8842,108,117,115,59,1,10943,97,114,114,59,1,10617,4,3,101,105,117,17299,17335,17339,116,4,3,59,101,110,17308,17310,17322,1,8834,113,4,2,59,113,17317,17319,1,8838,59,1,10949,101,113,4,2,59,113,17330,17332,1,8842,59,1,10955,109,59,1,10951,4,2,98,112,17345,17348,59,1,10965,59,1,10963,99,4,6,59,97,99,101,110,115,17366,17368,17376,17385,17389,17415,1,8827,112,112,114,111,120,59,1,10936,117,114,108,121,101,113,59,1,8829,113,59,1,10928,4,3,97,101,115,17397,17405,17410,112,112,114,111,120,59,1,10938,113,113,59,1,10934,105,109,59,1,8937,105,109,59,1,8831,59,1,8721,103,59,1,9834,4,13,49,50,51,59,69,100,101,104,108,109,110,112,115,17455,17462,17469,17476,17478,17481,17496,17509,17524,17530,17536,17548,17554,5,185,1,59,17460,1,185,5,178,1,59,17467,1,178,5,179,1,59,17474,1,179,1,8835,59,1,10950,4,2,111,115,17487,17491,116,59,1,10942,117,98,59,1,10968,4,2,59,100,17502,17504,1,8839,111,116,59,1,10948,115,4,2,111,117,17516,17520,108,59,1,10185,98,59,1,10967,97,114,114,59,1,10619,117,108,116,59,1,10946,4,2,69,101,17542,17545,59,1,10956,59,1,8843,108,117,115,59,1,10944,4,3,101,105,117,17562,17598,17602,116,4,3,59,101,110,17571,17573,17585,1,8835,113,4,2,59,113,17580,17582,1,8839,59,1,10950,101,113,4,2,59,113,17593,17595,1,8843,59,1,10956,109,59,1,10952,4,2,98,112,17608,17611,59,1,10964,59,1,10966,4,3,65,97,110,17622,17627,17650,114,114,59,1,8665,114,4,2,104,114,17634,17638,107,59,1,10534,4,2,59,111,17644,17646,1,8601,119,59,1,8601,119,97,114,59,1,10538,108,105,103,5,223,1,59,17664,1,223,4,13,97,98,99,100,101,102,104,105,111,112,114,115,119,17694,17709,17714,17737,17742,17749,17754,17860,17905,17957,17964,18090,18122,4,2,114,117,17700,17706,103,101,116,59,1,8982,59,1,964,114,107,59,1,9140,4,3,97,101,121,17722,17728,17734,114,111,110,59,1,357,100,105,108,59,1,355,59,1,1090,111,116,59,1,8411,108,114,101,99,59,1,8981,114,59,3,55349,56625,4,4,101,105,107,111,17764,17805,17836,17851,4,2,114,116,17770,17786,101,4,2,52,102,17777,17780,59,1,8756,111,114,101,59,1,8756,97,4,3,59,115,118,17795,17797,17802,1,952,121,109,59,1,977,59,1,977,4,2,99,110,17811,17831,107,4,2,97,115,17818,17826,112,112,114,111,120,59,1,8776,105,109,59,1,8764,115,112,59,1,8201,4,2,97,115,17842,17846,112,59,1,8776,105,109,59,1,8764,114,110,5,254,1,59,17858,1,254,4,3,108,109,110,17868,17873,17901,100,101,59,1,732,101,115,5,215,3,59,98,100,17884,17886,17898,1,215,4,2,59,97,17892,17894,1,8864,114,59,1,10801,59,1,10800,116,59,1,8749,4,3,101,112,115,17913,17917,17953,97,59,1,10536,4,4,59,98,99,102,17927,17929,17934,17939,1,8868,111,116,59,1,9014,105,114,59,1,10993,4,2,59,111,17945,17948,3,55349,56677,114,107,59,1,10970,97,59,1,10537,114,105,109,101,59,1,8244,4,3,97,105,112,17972,17977,18082,100,101,59,1,8482,4,7,97,100,101,109,112,115,116,17993,18051,18056,18059,18066,18072,18076,110,103,108,101,4,5,59,100,108,113,114,18009,18011,18017,18032,18035,1,9653,111,119,110,59,1,9663,101,102,116,4,2,59,101,18026,18028,1,9667,113,59,1,8884,59,1,8796,105,103,104,116,4,2,59,101,18045,18047,1,9657,113,59,1,8885,111,116,59,1,9708,59,1,8796,105,110,117,115,59,1,10810,108,117,115,59,1,10809,98,59,1,10701,105,109,101,59,1,10811,101,122,105,117,109,59,1,9186,4,3,99,104,116,18098,18111,18116,4,2,114,121,18104,18108,59,3,55349,56521,59,1,1094,99,121,59,1,1115,114,111,107,59,1,359,4,2,105,111,18128,18133,120,116,59,1,8812,104,101,97,100,4,2,108,114,18143,18154,101,102,116,97,114,114,111,119,59,1,8606,105,103,104,116,97,114,114,111,119,59,1,8608,4,18,65,72,97,98,99,100,102,103,104,108,109,111,112,114,115,116,117,119,18204,18209,18214,18234,18250,18268,18292,18308,18319,18343,18379,18397,18413,18504,18547,18553,18584,18603,114,114,59,1,8657,97,114,59,1,10595,4,2,99,114,18220,18230,117,116,101,5,250,1,59,18228,1,250,114,59,1,8593,114,4,2,99,101,18241,18245,121,59,1,1118,118,101,59,1,365,4,2,105,121,18256,18265,114,99,5,251,1,59,18263,1,251,59,1,1091,4,3,97,98,104,18276,18281,18287,114,114,59,1,8645,108,97,99,59,1,369,97,114,59,1,10606,4,2,105,114,18298,18304,115,104,116,59,1,10622,59,3,55349,56626,114,97,118,101,5,249,1,59,18317,1,249,4,2,97,98,18325,18338,114,4,2,108,114,18332,18335,59,1,8639,59,1,8638,108,107,59,1,9600,4,2,99,116,18349,18374,4,2,111,114,18355,18369,114,110,4,2,59,101,18363,18365,1,8988,114,59,1,8988,111,112,59,1,8975,114,105,59,1,9720,4,2,97,108,18385,18390,99,114,59,1,363,5,168,1,59,18395,1,168,4,2,103,112,18403,18408,111,110,59,1,371,102,59,3,55349,56678,4,6,97,100,104,108,115,117,18427,18434,18445,18470,18475,18494,114,114,111,119,59,1,8593,111,119,110,97,114,114,111,119,59,1,8597,97,114,112,111,111,110,4,2,108,114,18457,18463,101,102,116,59,1,8639,105,103,104,116,59,1,8638,117,115,59,1,8846,105,4,3,59,104,108,18484,18486,18489,1,965,59,1,978,111,110,59,1,965,112,97,114,114,111,119,115,59,1,8648,4,3,99,105,116,18512,18537,18542,4,2,111,114,18518,18532,114,110,4,2,59,101,18526,18528,1,8989,114,59,1,8989,111,112,59,1,8974,110,103,59,1,367,114,105,59,1,9721,99,114,59,3,55349,56522,4,3,100,105,114,18561,18566,18572,111,116,59,1,8944,108,100,101,59,1,361,105,4,2,59,102,18579,18581,1,9653,59,1,9652,4,2,97,109,18590,18595,114,114,59,1,8648,108,5,252,1,59,18601,1,252,97,110,103,108,101,59,1,10663,4,15,65,66,68,97,99,100,101,102,108,110,111,112,114,115,122,18643,18648,18661,18667,18847,18851,18857,18904,18909,18915,18931,18937,18943,18949,18996,114,114,59,1,8661,97,114,4,2,59,118,18656,18658,1,10984,59,1,10985,97,115,104,59,1,8872,4,2,110,114,18673,18679,103,114,116,59,1,10652,4,7,101,107,110,112,114,115,116,18695,18704,18711,18720,18742,18754,18810,112,115,105,108,111,110,59,1,1013,97,112,112,97,59,1,1008,111,116,104,105,110,103,59,1,8709,4,3,104,105,114,18728,18732,18735,105,59,1,981,59,1,982,111,112,116,111,59,1,8733,4,2,59,104,18748,18750,1,8597,111,59,1,1009,4,2,105,117,18760,18766,103,109,97,59,1,962,4,2,98,112,18772,18791,115,101,116,110,101,113,4,2,59,113,18784,18787,3,8842,65024,59,3,10955,65024,115,101,116,110,101,113,4,2,59,113,18803,18806,3,8843,65024,59,3,10956,65024,4,2,104,114,18816,18822,101,116,97,59,1,977,105,97,110,103,108,101,4,2,108,114,18834,18840,101,102,116,59,1,8882,105,103,104,116,59,1,8883,121,59,1,1074,97,115,104,59,1,8866,4,3,101,108,114,18865,18884,18890,4,3,59,98,101,18873,18875,18880,1,8744,97,114,59,1,8891,113,59,1,8794,108,105,112,59,1,8942,4,2,98,116,18896,18901,97,114,59,1,124,59,1,124,114,59,3,55349,56627,116,114,105,59,1,8882,115,117,4,2,98,112,18923,18927,59,3,8834,8402,59,3,8835,8402,112,102,59,3,55349,56679,114,111,112,59,1,8733,116,114,105,59,1,8883,4,2,99,117,18955,18960,114,59,3,55349,56523,4,2,98,112,18966,18981,110,4,2,69,101,18973,18977,59,3,10955,65024,59,3,8842,65024,110,4,2,69,101,18988,18992,59,3,10956,65024,59,3,8843,65024,105,103,122,97,103,59,1,10650,4,7,99,101,102,111,112,114,115,19020,19026,19061,19066,19072,19075,19089,105,114,99,59,1,373,4,2,100,105,19032,19055,4,2,98,103,19038,19043,97,114,59,1,10847,101,4,2,59,113,19050,19052,1,8743,59,1,8793,101,114,112,59,1,8472,114,59,3,55349,56628,112,102,59,3,55349,56680,59,1,8472,4,2,59,101,19081,19083,1,8768,97,116,104,59,1,8768,99,114,59,3,55349,56524,4,14,99,100,102,104,105,108,109,110,111,114,115,117,118,119,19125,19146,19152,19157,19173,19176,19192,19197,19202,19236,19252,19269,19286,19291,4,3,97,105,117,19133,19137,19142,112,59,1,8898,114,99,59,1,9711,112,59,1,8899,116,114,105,59,1,9661,114,59,3,55349,56629,4,2,65,97,19163,19168,114,114,59,1,10234,114,114,59,1,10231,59,1,958,4,2,65,97,19182,19187,114,114,59,1,10232,114,114,59,1,10229,97,112,59,1,10236,105,115,59,1,8955,4,3,100,112,116,19210,19215,19230,111,116,59,1,10752,4,2,102,108,19221,19225,59,3,55349,56681,117,115,59,1,10753,105,109,101,59,1,10754,4,2,65,97,19242,19247,114,114,59,1,10233,114,114,59,1,10230,4,2,99,113,19258,19263,114,59,3,55349,56525,99,117,112,59,1,10758,4,2,112,116,19275,19281,108,117,115,59,1,10756,114,105,59,1,9651,101,101,59,1,8897,101,100,103,101,59,1,8896,4,8,97,99,101,102,105,111,115,117,19316,19335,19349,19357,19362,19367,19373,19379,99,4,2,117,121,19323,19332,116,101,5,253,1,59,19330,1,253,59,1,1103,4,2,105,121,19341,19346,114,99,59,1,375,59,1,1099,110,5,165,1,59,19355,1,165,114,59,3,55349,56630,99,121,59,1,1111,112,102,59,3,55349,56682,99,114,59,3,55349,56526,4,2,99,109,19385,19389,121,59,1,1102,108,5,255,1,59,19395,1,255,4,10,97,99,100,101,102,104,105,111,115,119,19419,19426,19441,19446,19462,19467,19472,19480,19486,19492,99,117,116,101,59,1,378,4,2,97,121,19432,19438,114,111,110,59,1,382,59,1,1079,111,116,59,1,380,4,2,101,116,19452,19458,116,114,102,59,1,8488,97,59,1,950,114,59,3,55349,56631,99,121,59,1,1078,103,114,97,114,114,59,1,8669,112,102,59,3,55349,56683,99,114,59,3,55349,56527,4,2,106,110,19498,19501,59,1,8205,106,59,1,8204]);const P=s,H={DASH_DASH_STRING:[45,45],DOCTYPE_STRING:[68,79,67,84,89,80,69],CDATA_START_STRING:[91,67,68,65,84,65,91],SCRIPT_STRING:[115,99,114,105,112,116],PUBLIC_STRING:[80,85,66,76,73,67],SYSTEM_STRING:[83,89,83,84,69,77]},D={128:8364,130:8218,131:402,132:8222,133:8230,134:8224,135:8225,136:710,137:8240,138:352,139:8249,140:338,142:381,145:8216,146:8217,147:8220,148:8221,149:8226,150:8211,151:8212,152:732,153:8482,154:353,155:8250,156:339,158:382,159:376},F="DATA_STATE",U="RCDATA_STATE",G="RAWTEXT_STATE",B="SCRIPT_DATA_STATE",K="PLAINTEXT_STATE",b="TAG_OPEN_STATE",x="END_TAG_OPEN_STATE",y="TAG_NAME_STATE",v="RCDATA_LESS_THAN_SIGN_STATE",Y="RCDATA_END_TAG_OPEN_STATE",w="RCDATA_END_TAG_NAME_STATE",Q="RAWTEXT_LESS_THAN_SIGN_STATE",X="RAWTEXT_END_TAG_OPEN_STATE",W="RAWTEXT_END_TAG_NAME_STATE",V="SCRIPT_DATA_LESS_THAN_SIGN_STATE",j="SCRIPT_DATA_END_TAG_OPEN_STATE",z="SCRIPT_DATA_END_TAG_NAME_STATE",q="SCRIPT_DATA_ESCAPE_START_STATE",J="SCRIPT_DATA_ESCAPE_START_DASH_STATE",Z="SCRIPT_DATA_ESCAPED_STATE",$="SCRIPT_DATA_ESCAPED_DASH_STATE",ee="SCRIPT_DATA_ESCAPED_DASH_DASH_STATE",te="SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN_STATE",ne="SCRIPT_DATA_ESCAPED_END_TAG_OPEN_STATE",se="SCRIPT_DATA_ESCAPED_END_TAG_NAME_STATE",re="SCRIPT_DATA_DOUBLE_ESCAPE_START_STATE",ie="SCRIPT_DATA_DOUBLE_ESCAPED_STATE",oe="SCRIPT_DATA_DOUBLE_ESCAPED_DASH_STATE",ae="SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH_STATE",Te="SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN_STATE",Ee="SCRIPT_DATA_DOUBLE_ESCAPE_END_STATE",he="BEFORE_ATTRIBUTE_NAME_STATE",ce="ATTRIBUTE_NAME_STATE",_e="AFTER_ATTRIBUTE_NAME_STATE",le="BEFORE_ATTRIBUTE_VALUE_STATE",me="ATTRIBUTE_VALUE_DOUBLE_QUOTED_STATE",pe="ATTRIBUTE_VALUE_SINGLE_QUOTED_STATE",Ae="ATTRIBUTE_VALUE_UNQUOTED_STATE",ue="AFTER_ATTRIBUTE_VALUE_QUOTED_STATE",Ne="SELF_CLOSING_START_TAG_STATE",de="BOGUS_COMMENT_STATE",Ce="MARKUP_DECLARATION_OPEN_STATE",Oe="COMMENT_START_STATE",fe="COMMENT_START_DASH_STATE",Se="COMMENT_STATE",Re="COMMENT_LESS_THAN_SIGN_STATE",Ie="COMMENT_LESS_THAN_SIGN_BANG_STATE",Le="COMMENT_LESS_THAN_SIGN_BANG_DASH_STATE",ke="COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH_STATE",Me="COMMENT_END_DASH_STATE",ge="COMMENT_END_STATE",Pe="COMMENT_END_BANG_STATE",He="DOCTYPE_STATE",De="BEFORE_DOCTYPE_NAME_STATE",Fe="DOCTYPE_NAME_STATE",Ue="AFTER_DOCTYPE_NAME_STATE",Ge="AFTER_DOCTYPE_PUBLIC_KEYWORD_STATE",Be="BEFORE_DOCTYPE_PUBLIC_IDENTIFIER_STATE",Ke="DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED_STATE",be="DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED_STATE",xe="AFTER_DOCTYPE_PUBLIC_IDENTIFIER_STATE",ye="BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS_STATE",ve="AFTER_DOCTYPE_SYSTEM_KEYWORD_STATE",Ye="BEFORE_DOCTYPE_SYSTEM_IDENTIFIER_STATE",we="DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED_STATE",Qe="DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED_STATE",Xe="AFTER_DOCTYPE_SYSTEM_IDENTIFIER_STATE",We="BOGUS_DOCTYPE_STATE",Ve="CDATA_SECTION_STATE",je="CDATA_SECTION_BRACKET_STATE",ze="CDATA_SECTION_END_STATE",qe="CHARACTER_REFERENCE_STATE",Je="NAMED_CHARACTER_REFERENCE_STATE",Ze="AMBIGUOS_AMPERSAND_STATE",$e="NUMERIC_CHARACTER_REFERENCE_STATE",et="HEXADEMICAL_CHARACTER_REFERENCE_START_STATE",tt="DECIMAL_CHARACTER_REFERENCE_START_STATE",nt="HEXADEMICAL_CHARACTER_REFERENCE_STATE",st="DECIMAL_CHARACTER_REFERENCE_STATE",rt="NUMERIC_CHARACTER_REFERENCE_END_STATE";function it(e){return e===P.SPACE||e===P.LINE_FEED||e===P.TABULATION||e===P.FORM_FEED}function ot(e){return e>=P.DIGIT_0&&e<=P.DIGIT_9}function at(e){return e>=P.LATIN_CAPITAL_A&&e<=P.LATIN_CAPITAL_Z}function Tt(e){return e>=P.LATIN_SMALL_A&&e<=P.LATIN_SMALL_Z}function Et(e){return Tt(e)||at(e)}function ht(e){return Et(e)||ot(e)}function ct(e){return e>=P.LATIN_CAPITAL_A&&e<=P.LATIN_CAPITAL_F}function _t(e){return e>=P.LATIN_SMALL_A&&e<=P.LATIN_SMALL_F}function lt(e){return e+32}function mt(e){return e<=65535?String.fromCharCode(e):(e-=65536,String.fromCharCode(e>>>10&1023|55296)+String.fromCharCode(56320|1023&e))}function pt(e){return String.fromCharCode(lt(e))}function At(e,t){const n=g[++e];let s=++e,r=s+n-1;for(;s<=r;){const e=s+r>>>1,i=g[e];if(i<t)s=e+1;else {if(!(i>t))return g[e+n];r=e-1;}}return -1}class ut{constructor(){this.preprocessor=new class{constructor(){this.html=null,this.pos=-1,this.lastGapPos=-1,this.lastCharPos=-1,this.gapStack=[],this.skipNextNewLine=!1,this.lastChunkWritten=!1,this.endOfChunkHit=!1,this.bufferWaterline=65536;}_err(){}_addGap(){this.gapStack.push(this.lastGapPos),this.lastGapPos=this.pos;}_processSurrogate(e){if(this.pos!==this.lastCharPos){const t=this.html.charCodeAt(this.pos+1);if(function(e){return e>=56320&&e<=57343}(t))return this.pos++,this._addGap(),1024*(e-55296)+9216+t}else if(!this.lastChunkWritten)return this.endOfChunkHit=!0,M.EOF;return this._err("surrogate-in-input-stream"),e}dropParsedChunk(){this.pos>this.bufferWaterline&&(this.lastCharPos-=this.pos,this.html=this.html.substring(this.pos),this.pos=0,this.lastGapPos=-1,this.gapStack=[]);}write(e,t){this.html?this.html+=e:this.html=e,this.lastCharPos=this.html.length-1,this.endOfChunkHit=!1,this.lastChunkWritten=t;}insertHtmlAtCurrentPos(e){this.html=this.html.substring(0,this.pos+1)+e+this.html.substring(this.pos+1,this.html.length),this.lastCharPos=this.html.length-1,this.endOfChunkHit=!1;}advance(){if(this.pos++,this.pos>this.lastCharPos)return this.endOfChunkHit=!this.lastChunkWritten,M.EOF;let e=this.html.charCodeAt(this.pos);return this.skipNextNewLine&&e===M.LINE_FEED?(this.skipNextNewLine=!1,this._addGap(),this.advance()):e===M.CARRIAGE_RETURN?(this.skipNextNewLine=!0,M.LINE_FEED):(this.skipNextNewLine=!1,r(e)&&(e=this._processSurrogate(e)),e>31&&e<127||e===M.LINE_FEED||e===M.CARRIAGE_RETURN||e>159&&e<64976||this._checkForProblematicCharacters(e),e)}_checkForProblematicCharacters(e){i(e)?this._err("control-character-in-input-stream"):o(e)&&this._err("noncharacter-in-input-stream");}retreat(){this.pos===this.lastGapPos&&(this.lastGapPos=this.gapStack.pop(),this.pos--),this.pos--;}},this.tokenQueue=[],this.allowCDATA=!1,this.state=F,this.returnState="",this.charRefCode=-1,this.tempBuff=[],this.lastStartTagName="",this.consumedAfterSnapshot=-1,this.active=!1,this.currentCharacterToken=null,this.currentToken=null,this.currentAttr=null;}_err(){}_errOnNextCodePoint(e){this._consume(),this._err(e),this._unconsume();}getNextToken(){for(;!this.tokenQueue.length&&this.active;){this.consumedAfterSnapshot=0;const e=this._consume();this._ensureHibernation()||this[this.state](e);}return this.tokenQueue.shift()}write(e,t){this.active=!0,this.preprocessor.write(e,t);}insertHtmlAtCurrentPos(e){this.active=!0,this.preprocessor.insertHtmlAtCurrentPos(e);}_ensureHibernation(){if(this.preprocessor.endOfChunkHit){for(;this.consumedAfterSnapshot>0;this.consumedAfterSnapshot--)this.preprocessor.retreat();return this.active=!1,this.tokenQueue.push({type:ut.HIBERNATION_TOKEN}),!0}return !1}_consume(){return this.consumedAfterSnapshot++,this.preprocessor.advance()}_unconsume(){this.consumedAfterSnapshot--,this.preprocessor.retreat();}_reconsumeInState(e){this.state=e,this._unconsume();}_consumeSequenceIfMatch(e,t,n){let s=0,r=!0;const i=e.length;let o,a=0,T=t;for(;a<i;a++){if(a>0&&(T=this._consume(),s++),T===P.EOF){r=!1;break}if(o=e[a],T!==o&&(n||T!==lt(o))){r=!1;break}}if(!r)for(;s--;)this._unconsume();return r}_isTempBufferEqualToScriptString(){if(this.tempBuff.length!==H.SCRIPT_STRING.length)return !1;for(let e=0;e<this.tempBuff.length;e++)if(this.tempBuff[e]!==H.SCRIPT_STRING[e])return !1;return !0}_createStartTagToken(){this.currentToken={type:ut.START_TAG_TOKEN,tagName:"",selfClosing:!1,ackSelfClosing:!1,attrs:[]};}_createEndTagToken(){this.currentToken={type:ut.END_TAG_TOKEN,tagName:"",selfClosing:!1,attrs:[]};}_createCommentToken(){this.currentToken={type:ut.COMMENT_TOKEN,data:""};}_createDoctypeToken(e){this.currentToken={type:ut.DOCTYPE_TOKEN,name:e,forceQuirks:!1,publicId:null,systemId:null};}_createCharacterToken(e,t){this.currentCharacterToken={type:e,chars:t};}_createEOFToken(){this.currentToken={type:ut.EOF_TOKEN};}_createAttr(e){this.currentAttr={name:e,value:""};}_leaveAttrName(e){null===ut.getTokenAttr(this.currentToken,this.currentAttr.name)?this.currentToken.attrs.push(this.currentAttr):this._err("duplicate-attribute"),this.state=e;}_leaveAttrValue(e){this.state=e;}_emitCurrentToken(){this._emitCurrentCharacterToken();const e=this.currentToken;this.currentToken=null,e.type===ut.START_TAG_TOKEN?this.lastStartTagName=e.tagName:e.type===ut.END_TAG_TOKEN&&(e.attrs.length>0&&this._err("end-tag-with-attributes"),e.selfClosing&&this._err("end-tag-with-trailing-solidus")),this.tokenQueue.push(e);}_emitCurrentCharacterToken(){this.currentCharacterToken&&(this.tokenQueue.push(this.currentCharacterToken),this.currentCharacterToken=null);}_emitEOFToken(){this._createEOFToken(),this._emitCurrentToken();}_appendCharToCurrentCharacterToken(e,t){this.currentCharacterToken&&this.currentCharacterToken.type!==e&&this._emitCurrentCharacterToken(),this.currentCharacterToken?this.currentCharacterToken.chars+=t:this._createCharacterToken(e,t);}_emitCodePoint(e){let t=ut.CHARACTER_TOKEN;it(e)?t=ut.WHITESPACE_CHARACTER_TOKEN:e===P.NULL&&(t=ut.NULL_CHARACTER_TOKEN),this._appendCharToCurrentCharacterToken(t,mt(e));}_emitSeveralCodePoints(e){for(let t=0;t<e.length;t++)this._emitCodePoint(e[t]);}_emitChars(e){this._appendCharToCurrentCharacterToken(ut.CHARACTER_TOKEN,e);}_matchNamedCharacterReference(e){let t=null,n=1,s=At(0,e);for(this.tempBuff.push(e);s>-1;){const e=g[s],r=e<7;r&&1&e&&(t=2&e?[g[++s],g[++s]]:[g[++s]],n=0);const i=this._consume();if(this.tempBuff.push(i),n++,i===P.EOF)break;s=r?4&e?At(s,i):-1:i===e?++s:-1;}for(;n--;)this.tempBuff.pop(),this._unconsume();return t}_isCharacterReferenceInAttribute(){return this.returnState===me||this.returnState===pe||this.returnState===Ae}_isCharacterReferenceAttributeQuirk(e){if(!e&&this._isCharacterReferenceInAttribute()){const e=this._consume();return this._unconsume(),e===P.EQUALS_SIGN||ht(e)}return !1}_flushCodePointsConsumedAsCharacterReference(){if(this._isCharacterReferenceInAttribute())for(let e=0;e<this.tempBuff.length;e++)this.currentAttr.value+=mt(this.tempBuff[e]);else this._emitSeveralCodePoints(this.tempBuff);this.tempBuff=[];}[F](e){this.preprocessor.dropParsedChunk(),e===P.LESS_THAN_SIGN?this.state=b:e===P.AMPERSAND?(this.returnState=F,this.state=qe):e===P.NULL?(this._err(a),this._emitCodePoint(e)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[U](e){this.preprocessor.dropParsedChunk(),e===P.AMPERSAND?(this.returnState=U,this.state=qe):e===P.LESS_THAN_SIGN?this.state=v:e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[G](e){this.preprocessor.dropParsedChunk(),e===P.LESS_THAN_SIGN?this.state=Q:e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[B](e){this.preprocessor.dropParsedChunk(),e===P.LESS_THAN_SIGN?this.state=V:e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[K](e){this.preprocessor.dropParsedChunk(),e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?this._emitEOFToken():this._emitCodePoint(e);}[b](e){e===P.EXCLAMATION_MARK?this.state=Ce:e===P.SOLIDUS?this.state=x:Et(e)?(this._createStartTagToken(),this._reconsumeInState(y)):e===P.QUESTION_MARK?(this._err("unexpected-question-mark-instead-of-tag-name"),this._createCommentToken(),this._reconsumeInState(de)):e===P.EOF?(this._err(h),this._emitChars("<"),this._emitEOFToken()):(this._err(T),this._emitChars("<"),this._reconsumeInState(F));}[x](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(y)):e===P.GREATER_THAN_SIGN?(this._err("missing-end-tag-name"),this.state=F):e===P.EOF?(this._err(h),this._emitChars("</"),this._emitEOFToken()):(this._err(T),this._createCommentToken(),this._reconsumeInState(de));}[y](e){it(e)?this.state=he:e===P.SOLIDUS?this.state=Ne:e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):at(e)?this.currentToken.tagName+=pt(e):e===P.NULL?(this._err(a),this.currentToken.tagName+=n):e===P.EOF?(this._err(c),this._emitEOFToken()):this.currentToken.tagName+=mt(e);}[v](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=Y):(this._emitChars("<"),this._reconsumeInState(U));}[Y](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(w)):(this._emitChars("</"),this._reconsumeInState(U));}[w](e){if(at(e))this.currentToken.tagName+=pt(e),this.tempBuff.push(e);else if(Tt(e))this.currentToken.tagName+=mt(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(it(e))return void(this.state=he);if(e===P.SOLIDUS)return void(this.state=Ne);if(e===P.GREATER_THAN_SIGN)return this.state=F,void this._emitCurrentToken()}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState(U);}}[Q](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=X):(this._emitChars("<"),this._reconsumeInState(G));}[X](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(W)):(this._emitChars("</"),this._reconsumeInState(G));}[W](e){if(at(e))this.currentToken.tagName+=pt(e),this.tempBuff.push(e);else if(Tt(e))this.currentToken.tagName+=mt(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(it(e))return void(this.state=he);if(e===P.SOLIDUS)return void(this.state=Ne);if(e===P.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=F)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState(G);}}[V](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=j):e===P.EXCLAMATION_MARK?(this.state=q,this._emitChars("<!")):(this._emitChars("<"),this._reconsumeInState(B));}[j](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(z)):(this._emitChars("</"),this._reconsumeInState(B));}[z](e){if(at(e))this.currentToken.tagName+=pt(e),this.tempBuff.push(e);else if(Tt(e))this.currentToken.tagName+=mt(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(it(e))return void(this.state=he);if(e===P.SOLIDUS)return void(this.state=Ne);if(e===P.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=F)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState(B);}}[q](e){e===P.HYPHEN_MINUS?(this.state=J,this._emitChars("-")):this._reconsumeInState(B);}[J](e){e===P.HYPHEN_MINUS?(this.state=ee,this._emitChars("-")):this._reconsumeInState(B);}[Z](e){e===P.HYPHEN_MINUS?(this.state=$,this._emitChars("-")):e===P.LESS_THAN_SIGN?this.state=te:e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):this._emitCodePoint(e);}[$](e){e===P.HYPHEN_MINUS?(this.state=ee,this._emitChars("-")):e===P.LESS_THAN_SIGN?this.state=te:e===P.NULL?(this._err(a),this.state=Z,this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):(this.state=Z,this._emitCodePoint(e));}[ee](e){e===P.HYPHEN_MINUS?this._emitChars("-"):e===P.LESS_THAN_SIGN?this.state=te:e===P.GREATER_THAN_SIGN?(this.state=B,this._emitChars(">")):e===P.NULL?(this._err(a),this.state=Z,this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):(this.state=Z,this._emitCodePoint(e));}[te](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=ne):Et(e)?(this.tempBuff=[],this._emitChars("<"),this._reconsumeInState(re)):(this._emitChars("<"),this._reconsumeInState(Z));}[ne](e){Et(e)?(this._createEndTagToken(),this._reconsumeInState(se)):(this._emitChars("</"),this._reconsumeInState(Z));}[se](e){if(at(e))this.currentToken.tagName+=pt(e),this.tempBuff.push(e);else if(Tt(e))this.currentToken.tagName+=mt(e),this.tempBuff.push(e);else {if(this.lastStartTagName===this.currentToken.tagName){if(it(e))return void(this.state=he);if(e===P.SOLIDUS)return void(this.state=Ne);if(e===P.GREATER_THAN_SIGN)return this._emitCurrentToken(),void(this.state=F)}this._emitChars("</"),this._emitSeveralCodePoints(this.tempBuff),this._reconsumeInState(Z);}}[re](e){it(e)||e===P.SOLIDUS||e===P.GREATER_THAN_SIGN?(this.state=this._isTempBufferEqualToScriptString()?ie:Z,this._emitCodePoint(e)):at(e)?(this.tempBuff.push(lt(e)),this._emitCodePoint(e)):Tt(e)?(this.tempBuff.push(e),this._emitCodePoint(e)):this._reconsumeInState(Z);}[ie](e){e===P.HYPHEN_MINUS?(this.state=oe,this._emitChars("-")):e===P.LESS_THAN_SIGN?(this.state=Te,this._emitChars("<")):e===P.NULL?(this._err(a),this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):this._emitCodePoint(e);}[oe](e){e===P.HYPHEN_MINUS?(this.state=ae,this._emitChars("-")):e===P.LESS_THAN_SIGN?(this.state=Te,this._emitChars("<")):e===P.NULL?(this._err(a),this.state=ie,this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):(this.state=ie,this._emitCodePoint(e));}[ae](e){e===P.HYPHEN_MINUS?this._emitChars("-"):e===P.LESS_THAN_SIGN?(this.state=Te,this._emitChars("<")):e===P.GREATER_THAN_SIGN?(this.state=B,this._emitChars(">")):e===P.NULL?(this._err(a),this.state=ie,this._emitChars(n)):e===P.EOF?(this._err(O),this._emitEOFToken()):(this.state=ie,this._emitCodePoint(e));}[Te](e){e===P.SOLIDUS?(this.tempBuff=[],this.state=Ee,this._emitChars("/")):this._reconsumeInState(ie);}[Ee](e){it(e)||e===P.SOLIDUS||e===P.GREATER_THAN_SIGN?(this.state=this._isTempBufferEqualToScriptString()?Z:ie,this._emitCodePoint(e)):at(e)?(this.tempBuff.push(lt(e)),this._emitCodePoint(e)):Tt(e)?(this.tempBuff.push(e),this._emitCodePoint(e)):this._reconsumeInState(ie);}[he](e){it(e)||(e===P.SOLIDUS||e===P.GREATER_THAN_SIGN||e===P.EOF?this._reconsumeInState(_e):e===P.EQUALS_SIGN?(this._err("unexpected-equals-sign-before-attribute-name"),this._createAttr("="),this.state=ce):(this._createAttr(""),this._reconsumeInState(ce)));}[ce](e){it(e)||e===P.SOLIDUS||e===P.GREATER_THAN_SIGN||e===P.EOF?(this._leaveAttrName(_e),this._unconsume()):e===P.EQUALS_SIGN?this._leaveAttrName(le):at(e)?this.currentAttr.name+=pt(e):e===P.QUOTATION_MARK||e===P.APOSTROPHE||e===P.LESS_THAN_SIGN?(this._err("unexpected-character-in-attribute-name"),this.currentAttr.name+=mt(e)):e===P.NULL?(this._err(a),this.currentAttr.name+=n):this.currentAttr.name+=mt(e);}[_e](e){it(e)||(e===P.SOLIDUS?this.state=Ne:e===P.EQUALS_SIGN?this.state=le:e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(c),this._emitEOFToken()):(this._createAttr(""),this._reconsumeInState(ce)));}[le](e){it(e)||(e===P.QUOTATION_MARK?this.state=me:e===P.APOSTROPHE?this.state=pe:e===P.GREATER_THAN_SIGN?(this._err("missing-attribute-value"),this.state=F,this._emitCurrentToken()):this._reconsumeInState(Ae));}[me](e){e===P.QUOTATION_MARK?this.state=ue:e===P.AMPERSAND?(this.returnState=me,this.state=qe):e===P.NULL?(this._err(a),this.currentAttr.value+=n):e===P.EOF?(this._err(c),this._emitEOFToken()):this.currentAttr.value+=mt(e);}[pe](e){e===P.APOSTROPHE?this.state=ue:e===P.AMPERSAND?(this.returnState=pe,this.state=qe):e===P.NULL?(this._err(a),this.currentAttr.value+=n):e===P.EOF?(this._err(c),this._emitEOFToken()):this.currentAttr.value+=mt(e);}[Ae](e){it(e)?this._leaveAttrValue(he):e===P.AMPERSAND?(this.returnState=Ae,this.state=qe):e===P.GREATER_THAN_SIGN?(this._leaveAttrValue(F),this._emitCurrentToken()):e===P.NULL?(this._err(a),this.currentAttr.value+=n):e===P.QUOTATION_MARK||e===P.APOSTROPHE||e===P.LESS_THAN_SIGN||e===P.EQUALS_SIGN||e===P.GRAVE_ACCENT?(this._err("unexpected-character-in-unquoted-attribute-value"),this.currentAttr.value+=mt(e)):e===P.EOF?(this._err(c),this._emitEOFToken()):this.currentAttr.value+=mt(e);}[ue](e){it(e)?this._leaveAttrValue(he):e===P.SOLIDUS?this._leaveAttrValue(Ne):e===P.GREATER_THAN_SIGN?(this._leaveAttrValue(F),this._emitCurrentToken()):e===P.EOF?(this._err(c),this._emitEOFToken()):(this._err("missing-whitespace-between-attributes"),this._reconsumeInState(he));}[Ne](e){e===P.GREATER_THAN_SIGN?(this.currentToken.selfClosing=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(c),this._emitEOFToken()):(this._err("unexpected-solidus-in-tag"),this._reconsumeInState(he));}[de](e){e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.EOF?(this._emitCurrentToken(),this._emitEOFToken()):e===P.NULL?(this._err(a),this.currentToken.data+=n):this.currentToken.data+=mt(e);}[Ce](e){this._consumeSequenceIfMatch(H.DASH_DASH_STRING,e,!0)?(this._createCommentToken(),this.state=Oe):this._consumeSequenceIfMatch(H.DOCTYPE_STRING,e,!1)?this.state=He:this._consumeSequenceIfMatch(H.CDATA_START_STRING,e,!0)?this.allowCDATA?this.state=Ve:(this._err("cdata-in-html-content"),this._createCommentToken(),this.currentToken.data="[CDATA[",this.state=de):this._ensureHibernation()||(this._err("incorrectly-opened-comment"),this._createCommentToken(),this._reconsumeInState(de));}[Oe](e){e===P.HYPHEN_MINUS?this.state=fe:e===P.GREATER_THAN_SIGN?(this._err(S),this.state=F,this._emitCurrentToken()):this._reconsumeInState(Se);}[fe](e){e===P.HYPHEN_MINUS?this.state=ge:e===P.GREATER_THAN_SIGN?(this._err(S),this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="-",this._reconsumeInState(Se));}[Se](e){e===P.HYPHEN_MINUS?this.state=Me:e===P.LESS_THAN_SIGN?(this.currentToken.data+="<",this.state=Re):e===P.NULL?(this._err(a),this.currentToken.data+=n):e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.data+=mt(e);}[Re](e){e===P.EXCLAMATION_MARK?(this.currentToken.data+="!",this.state=Ie):e===P.LESS_THAN_SIGN?this.currentToken.data+="!":this._reconsumeInState(Se);}[Ie](e){e===P.HYPHEN_MINUS?this.state=Le:this._reconsumeInState(Se);}[Le](e){e===P.HYPHEN_MINUS?this.state=ke:this._reconsumeInState(Me);}[ke](e){e!==P.GREATER_THAN_SIGN&&e!==P.EOF&&this._err("nested-comment"),this._reconsumeInState(ge);}[Me](e){e===P.HYPHEN_MINUS?this.state=ge:e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="-",this._reconsumeInState(Se));}[ge](e){e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.EXCLAMATION_MARK?this.state=Pe:e===P.HYPHEN_MINUS?this.currentToken.data+="-":e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="--",this._reconsumeInState(Se));}[Pe](e){e===P.HYPHEN_MINUS?(this.currentToken.data+="--!",this.state=Me):e===P.GREATER_THAN_SIGN?(this._err("incorrectly-closed-comment"),this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(R),this._emitCurrentToken(),this._emitEOFToken()):(this.currentToken.data+="--!",this._reconsumeInState(Se));}[He](e){it(e)?this.state=De:e===P.GREATER_THAN_SIGN?this._reconsumeInState(De):e===P.EOF?(this._err(f),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("missing-whitespace-before-doctype-name"),this._reconsumeInState(De));}[De](e){it(e)||(at(e)?(this._createDoctypeToken(pt(e)),this.state=Fe):e===P.NULL?(this._err(a),this._createDoctypeToken(n),this.state=Fe):e===P.GREATER_THAN_SIGN?(this._err("missing-doctype-name"),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this._createDoctypeToken(null),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._createDoctypeToken(mt(e)),this.state=Fe));}[Fe](e){it(e)?this.state=Ue:e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):at(e)?this.currentToken.name+=pt(e):e===P.NULL?(this._err(a),this.currentToken.name+=n):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.name+=mt(e);}[Ue](e){it(e)||(e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this._consumeSequenceIfMatch(H.PUBLIC_STRING,e,!1)?this.state=Ge:this._consumeSequenceIfMatch(H.SYSTEM_STRING,e,!1)?this.state=ve:this._ensureHibernation()||(this._err("invalid-character-sequence-after-doctype-name"),this.currentToken.forceQuirks=!0,this._reconsumeInState(We)));}[Ge](e){it(e)?this.state=Be:e===P.QUOTATION_MARK?(this._err(_),this.currentToken.publicId="",this.state=Ke):e===P.APOSTROPHE?(this._err(_),this.currentToken.publicId="",this.state=be):e===P.GREATER_THAN_SIGN?(this._err(u),this.currentToken.forceQuirks=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(p),this.currentToken.forceQuirks=!0,this._reconsumeInState(We));}[Be](e){it(e)||(e===P.QUOTATION_MARK?(this.currentToken.publicId="",this.state=Ke):e===P.APOSTROPHE?(this.currentToken.publicId="",this.state=be):e===P.GREATER_THAN_SIGN?(this._err(u),this.currentToken.forceQuirks=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(p),this.currentToken.forceQuirks=!0,this._reconsumeInState(We)));}[Ke](e){e===P.QUOTATION_MARK?this.state=xe:e===P.NULL?(this._err(a),this.currentToken.publicId+=n):e===P.GREATER_THAN_SIGN?(this._err(d),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.publicId+=mt(e);}[be](e){e===P.APOSTROPHE?this.state=xe:e===P.NULL?(this._err(a),this.currentToken.publicId+=n):e===P.GREATER_THAN_SIGN?(this._err(d),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.publicId+=mt(e);}[xe](e){it(e)?this.state=ye:e===P.GREATER_THAN_SIGN?(this.state=F,this._emitCurrentToken()):e===P.QUOTATION_MARK?(this._err(l),this.currentToken.systemId="",this.state=we):e===P.APOSTROPHE?(this._err(l),this.currentToken.systemId="",this.state=Qe):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(A),this.currentToken.forceQuirks=!0,this._reconsumeInState(We));}[ye](e){it(e)||(e===P.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=F):e===P.QUOTATION_MARK?(this.currentToken.systemId="",this.state=we):e===P.APOSTROPHE?(this.currentToken.systemId="",this.state=Qe):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(A),this.currentToken.forceQuirks=!0,this._reconsumeInState(We)));}[ve](e){it(e)?this.state=Ye:e===P.QUOTATION_MARK?(this._err(m),this.currentToken.systemId="",this.state=we):e===P.APOSTROPHE?(this._err(m),this.currentToken.systemId="",this.state=Qe):e===P.GREATER_THAN_SIGN?(this._err(N),this.currentToken.forceQuirks=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(A),this.currentToken.forceQuirks=!0,this._reconsumeInState(We));}[Ye](e){it(e)||(e===P.QUOTATION_MARK?(this.currentToken.systemId="",this.state=we):e===P.APOSTROPHE?(this.currentToken.systemId="",this.state=Qe):e===P.GREATER_THAN_SIGN?(this._err(N),this.currentToken.forceQuirks=!0,this.state=F,this._emitCurrentToken()):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err(A),this.currentToken.forceQuirks=!0,this._reconsumeInState(We)));}[we](e){e===P.QUOTATION_MARK?this.state=Xe:e===P.NULL?(this._err(a),this.currentToken.systemId+=n):e===P.GREATER_THAN_SIGN?(this._err(C),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.systemId+=mt(e);}[Qe](e){e===P.APOSTROPHE?this.state=Xe:e===P.NULL?(this._err(a),this.currentToken.systemId+=n):e===P.GREATER_THAN_SIGN?(this._err(C),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):this.currentToken.systemId+=mt(e);}[Xe](e){it(e)||(e===P.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=F):e===P.EOF?(this._err(f),this.currentToken.forceQuirks=!0,this._emitCurrentToken(),this._emitEOFToken()):(this._err("unexpected-character-after-doctype-system-identifier"),this._reconsumeInState(We)));}[We](e){e===P.GREATER_THAN_SIGN?(this._emitCurrentToken(),this.state=F):e===P.NULL?this._err(a):e===P.EOF&&(this._emitCurrentToken(),this._emitEOFToken());}[Ve](e){e===P.RIGHT_SQUARE_BRACKET?this.state=je:e===P.EOF?(this._err("eof-in-cdata"),this._emitEOFToken()):this._emitCodePoint(e);}[je](e){e===P.RIGHT_SQUARE_BRACKET?this.state=ze:(this._emitChars("]"),this._reconsumeInState(Ve));}[ze](e){e===P.GREATER_THAN_SIGN?this.state=F:e===P.RIGHT_SQUARE_BRACKET?this._emitChars("]"):(this._emitChars("]]"),this._reconsumeInState(Ve));}[qe](e){this.tempBuff=[P.AMPERSAND],e===P.NUMBER_SIGN?(this.tempBuff.push(e),this.state=$e):ht(e)?this._reconsumeInState(Je):(this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState));}[Je](e){const t=this._matchNamedCharacterReference(e);if(this._ensureHibernation())this.tempBuff=[P.AMPERSAND];else if(t){const e=this.tempBuff[this.tempBuff.length-1]===P.SEMICOLON;this._isCharacterReferenceAttributeQuirk(e)||(e||this._errOnNextCodePoint(E),this.tempBuff=t),this._flushCodePointsConsumedAsCharacterReference(),this.state=this.returnState;}else this._flushCodePointsConsumedAsCharacterReference(),this.state=Ze;}[Ze](e){ht(e)?this._isCharacterReferenceInAttribute()?this.currentAttr.value+=mt(e):this._emitCodePoint(e):(e===P.SEMICOLON&&this._err("unknown-named-character-reference"),this._reconsumeInState(this.returnState));}[$e](e){this.charRefCode=0,e===P.LATIN_SMALL_X||e===P.LATIN_CAPITAL_X?(this.tempBuff.push(e),this.state=et):this._reconsumeInState(tt);}[et](e){!function(e){return ot(e)||ct(e)||_t(e)}(e)?(this._err(I),this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState)):this._reconsumeInState(nt);}[tt](e){ot(e)?this._reconsumeInState(st):(this._err(I),this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState));}[nt](e){ct(e)?this.charRefCode=16*this.charRefCode+e-55:_t(e)?this.charRefCode=16*this.charRefCode+e-87:ot(e)?this.charRefCode=16*this.charRefCode+e-48:e===P.SEMICOLON?this.state=rt:(this._err(E),this._reconsumeInState(rt));}[st](e){ot(e)?this.charRefCode=10*this.charRefCode+e-48:e===P.SEMICOLON?this.state=rt:(this._err(E),this._reconsumeInState(rt));}[rt](){if(this.charRefCode===P.NULL)this._err("null-character-reference"),this.charRefCode=P.REPLACEMENT_CHARACTER;else if(this.charRefCode>1114111)this._err("character-reference-outside-unicode-range"),this.charRefCode=P.REPLACEMENT_CHARACTER;else if(r(this.charRefCode))this._err("surrogate-character-reference"),this.charRefCode=P.REPLACEMENT_CHARACTER;else if(o(this.charRefCode))this._err("noncharacter-character-reference");else if(i(this.charRefCode)||this.charRefCode===P.CARRIAGE_RETURN){this._err("control-character-reference");const e=D[this.charRefCode];e&&(this.charRefCode=e);}this.tempBuff=[this.charRefCode],this._flushCodePointsConsumedAsCharacterReference(),this._reconsumeInState(this.returnState);}}ut.CHARACTER_TOKEN="CHARACTER_TOKEN",ut.NULL_CHARACTER_TOKEN="NULL_CHARACTER_TOKEN",ut.WHITESPACE_CHARACTER_TOKEN="WHITESPACE_CHARACTER_TOKEN",ut.START_TAG_TOKEN="START_TAG_TOKEN",ut.END_TAG_TOKEN="END_TAG_TOKEN",ut.COMMENT_TOKEN="COMMENT_TOKEN",ut.DOCTYPE_TOKEN="DOCTYPE_TOKEN",ut.EOF_TOKEN="EOF_TOKEN",ut.HIBERNATION_TOKEN="HIBERNATION_TOKEN",ut.MODE={DATA:F,RCDATA:U,RAWTEXT:G,SCRIPT_DATA:B,PLAINTEXT:K},ut.getTokenAttr=function(e,t){for(let n=e.attrs.length-1;n>=0;n--)if(e.attrs[n].name===t)return e.attrs[n].value;return null};var Nt=ut;function dt(e,t,n){return e(n={path:t,exports:{},require:function(e,t){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==t&&n.path)}},n.exports),n.exports}var Ct=dt((function(e,t){const n=t.NAMESPACES={HTML:"http://www.w3.org/1999/xhtml",MATHML:"http://www.w3.org/1998/Math/MathML",SVG:"http://www.w3.org/2000/svg",XLINK:"http://www.w3.org/1999/xlink",XML:"http://www.w3.org/XML/1998/namespace",XMLNS:"http://www.w3.org/2000/xmlns/"};t.ATTRS={TYPE:"type",ACTION:"action",ENCODING:"encoding",PROMPT:"prompt",NAME:"name",COLOR:"color",FACE:"face",SIZE:"size"},t.DOCUMENT_MODE={NO_QUIRKS:"no-quirks",QUIRKS:"quirks",LIMITED_QUIRKS:"limited-quirks"};const s=t.TAG_NAMES={A:"a",ADDRESS:"address",ANNOTATION_XML:"annotation-xml",APPLET:"applet",AREA:"area",ARTICLE:"article",ASIDE:"aside",B:"b",BASE:"base",BASEFONT:"basefont",BGSOUND:"bgsound",BIG:"big",BLOCKQUOTE:"blockquote",BODY:"body",BR:"br",BUTTON:"button",CAPTION:"caption",CENTER:"center",CODE:"code",COL:"col",COLGROUP:"colgroup",DD:"dd",DESC:"desc",DETAILS:"details",DIALOG:"dialog",DIR:"dir",DIV:"div",DL:"dl",DT:"dt",EM:"em",EMBED:"embed",FIELDSET:"fieldset",FIGCAPTION:"figcaption",FIGURE:"figure",FONT:"font",FOOTER:"footer",FOREIGN_OBJECT:"foreignObject",FORM:"form",FRAME:"frame",FRAMESET:"frameset",H1:"h1",H2:"h2",H3:"h3",H4:"h4",H5:"h5",H6:"h6",HEAD:"head",HEADER:"header",HGROUP:"hgroup",HR:"hr",HTML:"html",I:"i",IMG:"img",IMAGE:"image",INPUT:"input",IFRAME:"iframe",KEYGEN:"keygen",LABEL:"label",LI:"li",LINK:"link",LISTING:"listing",MAIN:"main",MALIGNMARK:"malignmark",MARQUEE:"marquee",MATH:"math",MENU:"menu",META:"meta",MGLYPH:"mglyph",MI:"mi",MO:"mo",MN:"mn",MS:"ms",MTEXT:"mtext",NAV:"nav",NOBR:"nobr",NOFRAMES:"noframes",NOEMBED:"noembed",NOSCRIPT:"noscript",OBJECT:"object",OL:"ol",OPTGROUP:"optgroup",OPTION:"option",P:"p",PARAM:"param",PLAINTEXT:"plaintext",PRE:"pre",RB:"rb",RP:"rp",RT:"rt",RTC:"rtc",RUBY:"ruby",S:"s",SCRIPT:"script",SECTION:"section",SELECT:"select",SOURCE:"source",SMALL:"small",SPAN:"span",STRIKE:"strike",STRONG:"strong",STYLE:"style",SUB:"sub",SUMMARY:"summary",SUP:"sup",TABLE:"table",TBODY:"tbody",TEMPLATE:"template",TEXTAREA:"textarea",TFOOT:"tfoot",TD:"td",TH:"th",THEAD:"thead",TITLE:"title",TR:"tr",TRACK:"track",TT:"tt",U:"u",UL:"ul",SVG:"svg",VAR:"var",WBR:"wbr",XMP:"xmp"};t.SPECIAL_ELEMENTS={[n.HTML]:{[s.ADDRESS]:!0,[s.APPLET]:!0,[s.AREA]:!0,[s.ARTICLE]:!0,[s.ASIDE]:!0,[s.BASE]:!0,[s.BASEFONT]:!0,[s.BGSOUND]:!0,[s.BLOCKQUOTE]:!0,[s.BODY]:!0,[s.BR]:!0,[s.BUTTON]:!0,[s.CAPTION]:!0,[s.CENTER]:!0,[s.COL]:!0,[s.COLGROUP]:!0,[s.DD]:!0,[s.DETAILS]:!0,[s.DIR]:!0,[s.DIV]:!0,[s.DL]:!0,[s.DT]:!0,[s.EMBED]:!0,[s.FIELDSET]:!0,[s.FIGCAPTION]:!0,[s.FIGURE]:!0,[s.FOOTER]:!0,[s.FORM]:!0,[s.FRAME]:!0,[s.FRAMESET]:!0,[s.H1]:!0,[s.H2]:!0,[s.H3]:!0,[s.H4]:!0,[s.H5]:!0,[s.H6]:!0,[s.HEAD]:!0,[s.HEADER]:!0,[s.HGROUP]:!0,[s.HR]:!0,[s.HTML]:!0,[s.IFRAME]:!0,[s.IMG]:!0,[s.INPUT]:!0,[s.LI]:!0,[s.LINK]:!0,[s.LISTING]:!0,[s.MAIN]:!0,[s.MARQUEE]:!0,[s.MENU]:!0,[s.META]:!0,[s.NAV]:!0,[s.NOEMBED]:!0,[s.NOFRAMES]:!0,[s.NOSCRIPT]:!0,[s.OBJECT]:!0,[s.OL]:!0,[s.P]:!0,[s.PARAM]:!0,[s.PLAINTEXT]:!0,[s.PRE]:!0,[s.SCRIPT]:!0,[s.SECTION]:!0,[s.SELECT]:!0,[s.SOURCE]:!0,[s.STYLE]:!0,[s.SUMMARY]:!0,[s.TABLE]:!0,[s.TBODY]:!0,[s.TD]:!0,[s.TEMPLATE]:!0,[s.TEXTAREA]:!0,[s.TFOOT]:!0,[s.TH]:!0,[s.THEAD]:!0,[s.TITLE]:!0,[s.TR]:!0,[s.TRACK]:!0,[s.UL]:!0,[s.WBR]:!0,[s.XMP]:!0},[n.MATHML]:{[s.MI]:!0,[s.MO]:!0,[s.MN]:!0,[s.MS]:!0,[s.MTEXT]:!0,[s.ANNOTATION_XML]:!0},[n.SVG]:{[s.TITLE]:!0,[s.FOREIGN_OBJECT]:!0,[s.DESC]:!0}};}));const Ot=Ct.TAG_NAMES,ft=Ct.NAMESPACES;function St(e){switch(e.length){case 1:return e===Ot.P;case 2:return e===Ot.RB||e===Ot.RP||e===Ot.RT||e===Ot.DD||e===Ot.DT||e===Ot.LI;case 3:return e===Ot.RTC;case 6:return e===Ot.OPTION;case 8:return e===Ot.OPTGROUP}return !1}function Rt(e){switch(e.length){case 1:return e===Ot.P;case 2:return e===Ot.RB||e===Ot.RP||e===Ot.RT||e===Ot.DD||e===Ot.DT||e===Ot.LI||e===Ot.TD||e===Ot.TH||e===Ot.TR;case 3:return e===Ot.RTC;case 5:return e===Ot.TBODY||e===Ot.TFOOT||e===Ot.THEAD;case 6:return e===Ot.OPTION;case 7:return e===Ot.CAPTION;case 8:return e===Ot.OPTGROUP||e===Ot.COLGROUP}return !1}function It(e,t){switch(e.length){case 2:if(e===Ot.TD||e===Ot.TH)return t===ft.HTML;if(e===Ot.MI||e===Ot.MO||e===Ot.MN||e===Ot.MS)return t===ft.MATHML;break;case 4:if(e===Ot.HTML)return t===ft.HTML;if(e===Ot.DESC)return t===ft.SVG;break;case 5:if(e===Ot.TABLE)return t===ft.HTML;if(e===Ot.MTEXT)return t===ft.MATHML;if(e===Ot.TITLE)return t===ft.SVG;break;case 6:return (e===Ot.APPLET||e===Ot.OBJECT)&&t===ft.HTML;case 7:return (e===Ot.CAPTION||e===Ot.MARQUEE)&&t===ft.HTML;case 8:return e===Ot.TEMPLATE&&t===ft.HTML;case 13:return e===Ot.FOREIGN_OBJECT&&t===ft.SVG;case 14:return e===Ot.ANNOTATION_XML&&t===ft.MATHML}return !1}class Lt{constructor(e){this.length=0,this.entries=[],this.treeAdapter=e,this.bookmark=null;}_getNoahArkConditionCandidates(e){const t=[];if(this.length>=3){const n=this.treeAdapter.getAttrList(e).length,s=this.treeAdapter.getTagName(e),r=this.treeAdapter.getNamespaceURI(e);for(let e=this.length-1;e>=0;e--){const i=this.entries[e];if(i.type===Lt.MARKER_ENTRY)break;const o=i.element,a=this.treeAdapter.getAttrList(o);this.treeAdapter.getTagName(o)===s&&this.treeAdapter.getNamespaceURI(o)===r&&a.length===n&&t.push({idx:e,attrs:a});}}return t.length<3?[]:t}_ensureNoahArkCondition(e){const t=this._getNoahArkConditionCandidates(e);let n=t.length;if(n){const s=this.treeAdapter.getAttrList(e),r=s.length,i=Object.create(null);for(let e=0;e<r;e++){const t=s[e];i[t.name]=t.value;}for(let e=0;e<r;e++)for(let s=0;s<n;s++){const r=t[s].attrs[e];if(i[r.name]!==r.value&&(t.splice(s,1),n--),t.length<3)return}for(let e=n-1;e>=2;e--)this.entries.splice(t[e].idx,1),this.length--;}}insertMarker(){this.entries.push({type:Lt.MARKER_ENTRY}),this.length++;}pushElement(e,t){this._ensureNoahArkCondition(e),this.entries.push({type:Lt.ELEMENT_ENTRY,element:e,token:t}),this.length++;}insertElementAfterBookmark(e,t){let n=this.length-1;for(;n>=0&&this.entries[n]!==this.bookmark;n--);this.entries.splice(n+1,0,{type:Lt.ELEMENT_ENTRY,element:e,token:t}),this.length++;}removeEntry(e){for(let t=this.length-1;t>=0;t--)if(this.entries[t]===e){this.entries.splice(t,1),this.length--;break}}clearToLastMarker(){for(;this.length;){const e=this.entries.pop();if(this.length--,e.type===Lt.MARKER_ENTRY)break}}getElementEntryInScopeWithTagName(e){for(let t=this.length-1;t>=0;t--){const n=this.entries[t];if(n.type===Lt.MARKER_ENTRY)return null;if(this.treeAdapter.getTagName(n.element)===e)return n}return null}getElementEntry(e){for(let t=this.length-1;t>=0;t--){const n=this.entries[t];if(n.type===Lt.ELEMENT_ENTRY&&n.element===e)return n}return null}}Lt.MARKER_ENTRY="MARKER_ENTRY",Lt.ELEMENT_ENTRY="ELEMENT_ENTRY";var kt=Lt;class Mt{constructor(e){const t={},n=this._getOverriddenMethods(this,t);for(const s of Object.keys(n))"function"==typeof n[s]&&(t[s]=e[s],e[s]=n[s]);}_getOverriddenMethods(){throw new Error("Not implemented")}}Mt.install=function(e,t,n){e.__mixins||(e.__mixins=[]);for(let n=0;n<e.__mixins.length;n++)if(e.__mixins[n].constructor===t)return e.__mixins[n];const s=new t(e,n);return e.__mixins.push(s),s};var gt=Mt,Pt=class extends gt{constructor(e){super(e),this.preprocessor=e,this.isEol=!1,this.lineStartPos=0,this.droppedBufferSize=0,this.offset=0,this.col=0,this.line=1;}_getOverriddenMethods(e,t){return {advance(){const n=this.pos+1,s=this.html[n];return e.isEol&&(e.isEol=!1,e.line++,e.lineStartPos=n),("\n"===s||"\r"===s&&"\n"!==this.html[n+1])&&(e.isEol=!0),e.col=n-e.lineStartPos+1,e.offset=e.droppedBufferSize+n,t.advance.call(this)},retreat(){t.retreat.call(this),e.isEol=!1,e.col=this.pos-e.lineStartPos+1;},dropParsedChunk(){const n=this.pos;t.dropParsedChunk.call(this);const s=n-this.pos;e.lineStartPos-=s,e.droppedBufferSize+=s,e.offset=e.droppedBufferSize+this.pos;}}}},Ht=class extends gt{constructor(e){super(e),this.tokenizer=e,this.posTracker=gt.install(e.preprocessor,Pt),this.currentAttrLocation=null,this.ctLoc=null;}_getCurrentLocation(){return {startLine:this.posTracker.line,startCol:this.posTracker.col,startOffset:this.posTracker.offset,endLine:-1,endCol:-1,endOffset:-1}}_attachCurrentAttrLocationInfo(){this.currentAttrLocation.endLine=this.posTracker.line,this.currentAttrLocation.endCol=this.posTracker.col,this.currentAttrLocation.endOffset=this.posTracker.offset;const e=this.tokenizer.currentToken,t=this.tokenizer.currentAttr;e.location.attrs||(e.location.attrs=Object.create(null)),e.location.attrs[t.name]=this.currentAttrLocation;}_getOverriddenMethods(e,t){const n={_createStartTagToken(){t._createStartTagToken.call(this),this.currentToken.location=e.ctLoc;},_createEndTagToken(){t._createEndTagToken.call(this),this.currentToken.location=e.ctLoc;},_createCommentToken(){t._createCommentToken.call(this),this.currentToken.location=e.ctLoc;},_createDoctypeToken(n){t._createDoctypeToken.call(this,n),this.currentToken.location=e.ctLoc;},_createCharacterToken(n,s){t._createCharacterToken.call(this,n,s),this.currentCharacterToken.location=e.ctLoc;},_createEOFToken(){t._createEOFToken.call(this),this.currentToken.location=e._getCurrentLocation();},_createAttr(n){t._createAttr.call(this,n),e.currentAttrLocation=e._getCurrentLocation();},_leaveAttrName(n){t._leaveAttrName.call(this,n),e._attachCurrentAttrLocationInfo();},_leaveAttrValue(n){t._leaveAttrValue.call(this,n),e._attachCurrentAttrLocationInfo();},_emitCurrentToken(){const n=this.currentToken.location;this.currentCharacterToken&&(this.currentCharacterToken.location.endLine=n.startLine,this.currentCharacterToken.location.endCol=n.startCol,this.currentCharacterToken.location.endOffset=n.startOffset),this.currentToken.type===Nt.EOF_TOKEN?(n.endLine=n.startLine,n.endCol=n.startCol,n.endOffset=n.startOffset):(n.endLine=e.posTracker.line,n.endCol=e.posTracker.col+1,n.endOffset=e.posTracker.offset+1),t._emitCurrentToken.call(this);},_emitCurrentCharacterToken(){const n=this.currentCharacterToken&&this.currentCharacterToken.location;n&&-1===n.endOffset&&(n.endLine=e.posTracker.line,n.endCol=e.posTracker.col,n.endOffset=e.posTracker.offset),t._emitCurrentCharacterToken.call(this);}};return Object.keys(Nt.MODE).forEach((s=>{const r=Nt.MODE[s];n[r]=function(n){e.ctLoc=e._getCurrentLocation(),t[r].call(this,n);};})),n}},Dt=class extends gt{constructor(e,t){super(e),this.onItemPop=t.onItemPop;}_getOverriddenMethods(e,t){return {pop(){e.onItemPop(this.current),t.pop.call(this);},popAllUpToHtmlElement(){for(let t=this.stackTop;t>0;t--)e.onItemPop(this.items[t]);t.popAllUpToHtmlElement.call(this);},remove(n){e.onItemPop(this.current),t.remove.call(this,n);}}}};const Ft=Ct.TAG_NAMES;var Ut=class extends gt{constructor(e){super(e),this.parser=e,this.treeAdapter=this.parser.treeAdapter,this.posTracker=null,this.lastStartTagToken=null,this.lastFosterParentingLocation=null,this.currentToken=null;}_setStartLocation(e){let t=null;this.lastStartTagToken&&(t=Object.assign({},this.lastStartTagToken.location),t.startTag=this.lastStartTagToken.location),this.treeAdapter.setNodeSourceCodeLocation(e,t);}_setEndLocation(e,t){if(this.treeAdapter.getNodeSourceCodeLocation(e)&&t.location){const n=t.location,s=this.treeAdapter.getTagName(e),r={};t.type===Nt.END_TAG_TOKEN&&s===t.tagName?(r.endTag=Object.assign({},n),r.endLine=n.endLine,r.endCol=n.endCol,r.endOffset=n.endOffset):(r.endLine=n.startLine,r.endCol=n.startCol,r.endOffset=n.startOffset),this.treeAdapter.updateNodeSourceCodeLocation(e,r);}}_getOverriddenMethods(e,t){return {_bootstrap(n,s){t._bootstrap.call(this,n,s),e.lastStartTagToken=null,e.lastFosterParentingLocation=null,e.currentToken=null;const r=gt.install(this.tokenizer,Ht);e.posTracker=r.posTracker,gt.install(this.openElements,Dt,{onItemPop:function(t){e._setEndLocation(t,e.currentToken);}});},_runParsingLoop(n){t._runParsingLoop.call(this,n);for(let t=this.openElements.stackTop;t>=0;t--)e._setEndLocation(this.openElements.items[t],e.currentToken);},_processTokenInForeignContent(n){e.currentToken=n,t._processTokenInForeignContent.call(this,n);},_processToken(n){if(e.currentToken=n,t._processToken.call(this,n),n.type===Nt.END_TAG_TOKEN&&(n.tagName===Ft.HTML||n.tagName===Ft.BODY&&this.openElements.hasInScope(Ft.BODY)))for(let t=this.openElements.stackTop;t>=0;t--){const s=this.openElements.items[t];if(this.treeAdapter.getTagName(s)===n.tagName){e._setEndLocation(s,n);break}}},_setDocumentType(e){t._setDocumentType.call(this,e);const n=this.treeAdapter.getChildNodes(this.document),s=n.length;for(let t=0;t<s;t++){const s=n[t];if(this.treeAdapter.isDocumentTypeNode(s)){this.treeAdapter.setNodeSourceCodeLocation(s,e.location);break}}},_attachElementToTree(n){e._setStartLocation(n),e.lastStartTagToken=null,t._attachElementToTree.call(this,n);},_appendElement(n,s){e.lastStartTagToken=n,t._appendElement.call(this,n,s);},_insertElement(n,s){e.lastStartTagToken=n,t._insertElement.call(this,n,s);},_insertTemplate(n){e.lastStartTagToken=n,t._insertTemplate.call(this,n);const s=this.treeAdapter.getTemplateContent(this.openElements.current);this.treeAdapter.setNodeSourceCodeLocation(s,null);},_insertFakeRootElement(){t._insertFakeRootElement.call(this),this.treeAdapter.setNodeSourceCodeLocation(this.openElements.current,null);},_appendCommentNode(e,n){t._appendCommentNode.call(this,e,n);const s=this.treeAdapter.getChildNodes(n),r=s[s.length-1];this.treeAdapter.setNodeSourceCodeLocation(r,e.location);},_findFosterParentingLocation(){return e.lastFosterParentingLocation=t._findFosterParentingLocation.call(this),e.lastFosterParentingLocation},_insertCharacters(n){t._insertCharacters.call(this,n);const s=this._shouldFosterParentOnInsertion(),r=s&&e.lastFosterParentingLocation.parent||this.openElements.currentTmplContent||this.openElements.current,i=this.treeAdapter.getChildNodes(r),o=s&&e.lastFosterParentingLocation.beforeElement?i.indexOf(e.lastFosterParentingLocation.beforeElement)-1:i.length-1,a=i[o];if(this.treeAdapter.getNodeSourceCodeLocation(a)){const{endLine:e,endCol:t,endOffset:s}=n.location;this.treeAdapter.updateNodeSourceCodeLocation(a,{endLine:e,endCol:t,endOffset:s});}else this.treeAdapter.setNodeSourceCodeLocation(a,n.location);}}}},Gt=class extends gt{constructor(e,t){super(e),this.posTracker=null,this.onParseError=t.onParseError;}_setErrorLocation(e){e.startLine=e.endLine=this.posTracker.line,e.startCol=e.endCol=this.posTracker.col,e.startOffset=e.endOffset=this.posTracker.offset;}_reportError(e){const t={code:e,startLine:-1,startCol:-1,startOffset:-1,endLine:-1,endCol:-1,endOffset:-1};this._setErrorLocation(t),this.onParseError(t);}_getOverriddenMethods(e){return {_err(t){e._reportError(t);}}}},Bt=class extends Gt{constructor(e,t){super(e,t),this.posTracker=gt.install(e,Pt),this.lastErrOffset=-1;}_reportError(e){this.lastErrOffset!==this.posTracker.offset&&(this.lastErrOffset=this.posTracker.offset,super._reportError(e));}},Kt=class extends Gt{constructor(e,t){super(e,t);const n=gt.install(e.preprocessor,Bt,t);this.posTracker=n.posTracker;}},bt=class extends Gt{constructor(e,t){super(e,t),this.opts=t,this.ctLoc=null,this.locBeforeToken=!1;}_setErrorLocation(e){this.ctLoc&&(e.startLine=this.ctLoc.startLine,e.startCol=this.ctLoc.startCol,e.startOffset=this.ctLoc.startOffset,e.endLine=this.locBeforeToken?this.ctLoc.startLine:this.ctLoc.endLine,e.endCol=this.locBeforeToken?this.ctLoc.startCol:this.ctLoc.endCol,e.endOffset=this.locBeforeToken?this.ctLoc.startOffset:this.ctLoc.endOffset);}_getOverriddenMethods(e,t){return {_bootstrap(n,s){t._bootstrap.call(this,n,s),gt.install(this.tokenizer,Kt,e.opts),gt.install(this.tokenizer,Ht);},_processInputToken(n){e.ctLoc=n.location,t._processInputToken.call(this,n);},_err(t,n){e.locBeforeToken=n&&n.beforeToken,e._reportError(t);}}}},xt=dt((function(e,t){const{DOCUMENT_MODE:n}=Ct;t.createDocument=function(){return {nodeName:"#document",mode:n.NO_QUIRKS,childNodes:[]}},t.createDocumentFragment=function(){return {nodeName:"#document-fragment",childNodes:[]}},t.createElement=function(e,t,n){return {nodeName:e,tagName:e,attrs:n,namespaceURI:t,childNodes:[],parentNode:null}},t.createCommentNode=function(e){return {nodeName:"#comment",data:e,parentNode:null}};const s=function(e){return {nodeName:"#text",value:e,parentNode:null}},r=t.appendChild=function(e,t){e.childNodes.push(t),t.parentNode=e;},i=t.insertBefore=function(e,t,n){const s=e.childNodes.indexOf(n);e.childNodes.splice(s,0,t),t.parentNode=e;};t.setTemplateContent=function(e,t){e.content=t;},t.getTemplateContent=function(e){return e.content},t.setDocumentType=function(e,t,n,s){let i=null;for(let t=0;t<e.childNodes.length;t++)if("#documentType"===e.childNodes[t].nodeName){i=e.childNodes[t];break}i?(i.name=t,i.publicId=n,i.systemId=s):r(e,{nodeName:"#documentType",name:t,publicId:n,systemId:s});},t.setDocumentMode=function(e,t){e.mode=t;},t.getDocumentMode=function(e){return e.mode},t.detachNode=function(e){if(e.parentNode){const t=e.parentNode.childNodes.indexOf(e);e.parentNode.childNodes.splice(t,1),e.parentNode=null;}},t.insertText=function(e,t){if(e.childNodes.length){const n=e.childNodes[e.childNodes.length-1];if("#text"===n.nodeName)return void(n.value+=t)}r(e,s(t));},t.insertTextBefore=function(e,t,n){const r=e.childNodes[e.childNodes.indexOf(n)-1];r&&"#text"===r.nodeName?r.value+=t:i(e,s(t),n);},t.adoptAttributes=function(e,t){const n=[];for(let t=0;t<e.attrs.length;t++)n.push(e.attrs[t].name);for(let s=0;s<t.length;s++)-1===n.indexOf(t[s].name)&&e.attrs.push(t[s]);},t.getFirstChild=function(e){return e.childNodes[0]},t.getChildNodes=function(e){return e.childNodes},t.getParentNode=function(e){return e.parentNode},t.getAttrList=function(e){return e.attrs},t.getTagName=function(e){return e.tagName},t.getNamespaceURI=function(e){return e.namespaceURI},t.getTextNodeContent=function(e){return e.value},t.getCommentNodeContent=function(e){return e.data},t.getDocumentTypeNodeName=function(e){return e.name},t.getDocumentTypeNodePublicId=function(e){return e.publicId},t.getDocumentTypeNodeSystemId=function(e){return e.systemId},t.isTextNode=function(e){return "#text"===e.nodeName},t.isCommentNode=function(e){return "#comment"===e.nodeName},t.isDocumentTypeNode=function(e){return "#documentType"===e.nodeName},t.isElementNode=function(e){return !!e.tagName},t.setNodeSourceCodeLocation=function(e,t){e.sourceCodeLocation=t;},t.getNodeSourceCodeLocation=function(e){return e.sourceCodeLocation},t.updateNodeSourceCodeLocation=function(e,t){e.sourceCodeLocation=Object.assign(e.sourceCodeLocation,t);};}));const{DOCUMENT_MODE:yt}=Ct,vt="html",Yt=["+//silmaril//dtd html pro v0r11 19970101//","-//as//dtd html 3.0 aswedit + extensions//","-//advasoft ltd//dtd html 3.0 aswedit + extensions//","-//ietf//dtd html 2.0 level 1//","-//ietf//dtd html 2.0 level 2//","-//ietf//dtd html 2.0 strict level 1//","-//ietf//dtd html 2.0 strict level 2//","-//ietf//dtd html 2.0 strict//","-//ietf//dtd html 2.0//","-//ietf//dtd html 2.1e//","-//ietf//dtd html 3.0//","-//ietf//dtd html 3.2 final//","-//ietf//dtd html 3.2//","-//ietf//dtd html 3//","-//ietf//dtd html level 0//","-//ietf//dtd html level 1//","-//ietf//dtd html level 2//","-//ietf//dtd html level 3//","-//ietf//dtd html strict level 0//","-//ietf//dtd html strict level 1//","-//ietf//dtd html strict level 2//","-//ietf//dtd html strict level 3//","-//ietf//dtd html strict//","-//ietf//dtd html//","-//metrius//dtd metrius presentational//","-//microsoft//dtd internet explorer 2.0 html strict//","-//microsoft//dtd internet explorer 2.0 html//","-//microsoft//dtd internet explorer 2.0 tables//","-//microsoft//dtd internet explorer 3.0 html strict//","-//microsoft//dtd internet explorer 3.0 html//","-//microsoft//dtd internet explorer 3.0 tables//","-//netscape comm. corp.//dtd html//","-//netscape comm. corp.//dtd strict html//","-//o'reilly and associates//dtd html 2.0//","-//o'reilly and associates//dtd html extended 1.0//","-//o'reilly and associates//dtd html extended relaxed 1.0//","-//sq//dtd html 2.0 hotmetal + extensions//","-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//","-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//","-//spyglass//dtd html 2.0 extended//","-//sun microsystems corp.//dtd hotjava html//","-//sun microsystems corp.//dtd hotjava strict html//","-//w3c//dtd html 3 1995-03-24//","-//w3c//dtd html 3.2 draft//","-//w3c//dtd html 3.2 final//","-//w3c//dtd html 3.2//","-//w3c//dtd html 3.2s draft//","-//w3c//dtd html 4.0 frameset//","-//w3c//dtd html 4.0 transitional//","-//w3c//dtd html experimental 19960712//","-//w3c//dtd html experimental 970421//","-//w3c//dtd w3 html//","-//w3o//dtd w3 html 3.0//","-//webtechs//dtd mozilla html 2.0//","-//webtechs//dtd mozilla html//"],wt=Yt.concat(["-//w3c//dtd html 4.01 frameset//","-//w3c//dtd html 4.01 transitional//"]),Qt=["-//w3o//dtd w3 html strict 3.0//en//","-/w3c/dtd html 4.0 transitional/en","html"],Xt=["-//w3c//dtd xhtml 1.0 frameset//","-//w3c//dtd xhtml 1.0 transitional//"],Wt=Xt.concat(["-//w3c//dtd html 4.01 frameset//","-//w3c//dtd html 4.01 transitional//"]);function Vt(e,t){for(let n=0;n<t.length;n++)if(0===e.indexOf(t[n]))return !0;return !1}var jt=dt((function(e,t){const n=Ct.TAG_NAMES,s=Ct.NAMESPACES,r=Ct.ATTRS,i={attributename:"attributeName",attributetype:"attributeType",basefrequency:"baseFrequency",baseprofile:"baseProfile",calcmode:"calcMode",clippathunits:"clipPathUnits",diffuseconstant:"diffuseConstant",edgemode:"edgeMode",filterunits:"filterUnits",glyphref:"glyphRef",gradienttransform:"gradientTransform",gradientunits:"gradientUnits",kernelmatrix:"kernelMatrix",kernelunitlength:"kernelUnitLength",keypoints:"keyPoints",keysplines:"keySplines",keytimes:"keyTimes",lengthadjust:"lengthAdjust",limitingconeangle:"limitingConeAngle",markerheight:"markerHeight",markerunits:"markerUnits",markerwidth:"markerWidth",maskcontentunits:"maskContentUnits",maskunits:"maskUnits",numoctaves:"numOctaves",pathlength:"pathLength",patterncontentunits:"patternContentUnits",patterntransform:"patternTransform",patternunits:"patternUnits",pointsatx:"pointsAtX",pointsaty:"pointsAtY",pointsatz:"pointsAtZ",preservealpha:"preserveAlpha",preserveaspectratio:"preserveAspectRatio",primitiveunits:"primitiveUnits",refx:"refX",refy:"refY",repeatcount:"repeatCount",repeatdur:"repeatDur",requiredextensions:"requiredExtensions",requiredfeatures:"requiredFeatures",specularconstant:"specularConstant",specularexponent:"specularExponent",spreadmethod:"spreadMethod",startoffset:"startOffset",stddeviation:"stdDeviation",stitchtiles:"stitchTiles",surfacescale:"surfaceScale",systemlanguage:"systemLanguage",tablevalues:"tableValues",targetx:"targetX",targety:"targetY",textlength:"textLength",viewbox:"viewBox",viewtarget:"viewTarget",xchannelselector:"xChannelSelector",ychannelselector:"yChannelSelector",zoomandpan:"zoomAndPan"},o={"xlink:actuate":{prefix:"xlink",name:"actuate",namespace:s.XLINK},"xlink:arcrole":{prefix:"xlink",name:"arcrole",namespace:s.XLINK},"xlink:href":{prefix:"xlink",name:"href",namespace:s.XLINK},"xlink:role":{prefix:"xlink",name:"role",namespace:s.XLINK},"xlink:show":{prefix:"xlink",name:"show",namespace:s.XLINK},"xlink:title":{prefix:"xlink",name:"title",namespace:s.XLINK},"xlink:type":{prefix:"xlink",name:"type",namespace:s.XLINK},"xml:base":{prefix:"xml",name:"base",namespace:s.XML},"xml:lang":{prefix:"xml",name:"lang",namespace:s.XML},"xml:space":{prefix:"xml",name:"space",namespace:s.XML},xmlns:{prefix:"",name:"xmlns",namespace:s.XMLNS},"xmlns:xlink":{prefix:"xmlns",name:"xlink",namespace:s.XMLNS}},a=t.SVG_TAG_NAMES_ADJUSTMENT_MAP={altglyph:"altGlyph",altglyphdef:"altGlyphDef",altglyphitem:"altGlyphItem",animatecolor:"animateColor",animatemotion:"animateMotion",animatetransform:"animateTransform",clippath:"clipPath",feblend:"feBlend",fecolormatrix:"feColorMatrix",fecomponenttransfer:"feComponentTransfer",fecomposite:"feComposite",feconvolvematrix:"feConvolveMatrix",fediffuselighting:"feDiffuseLighting",fedisplacementmap:"feDisplacementMap",fedistantlight:"feDistantLight",feflood:"feFlood",fefunca:"feFuncA",fefuncb:"feFuncB",fefuncg:"feFuncG",fefuncr:"feFuncR",fegaussianblur:"feGaussianBlur",feimage:"feImage",femerge:"feMerge",femergenode:"feMergeNode",femorphology:"feMorphology",feoffset:"feOffset",fepointlight:"fePointLight",fespecularlighting:"feSpecularLighting",fespotlight:"feSpotLight",fetile:"feTile",feturbulence:"feTurbulence",foreignobject:"foreignObject",glyphref:"glyphRef",lineargradient:"linearGradient",radialgradient:"radialGradient",textpath:"textPath"},T={[n.B]:!0,[n.BIG]:!0,[n.BLOCKQUOTE]:!0,[n.BODY]:!0,[n.BR]:!0,[n.CENTER]:!0,[n.CODE]:!0,[n.DD]:!0,[n.DIV]:!0,[n.DL]:!0,[n.DT]:!0,[n.EM]:!0,[n.EMBED]:!0,[n.H1]:!0,[n.H2]:!0,[n.H3]:!0,[n.H4]:!0,[n.H5]:!0,[n.H6]:!0,[n.HEAD]:!0,[n.HR]:!0,[n.I]:!0,[n.IMG]:!0,[n.LI]:!0,[n.LISTING]:!0,[n.MENU]:!0,[n.META]:!0,[n.NOBR]:!0,[n.OL]:!0,[n.P]:!0,[n.PRE]:!0,[n.RUBY]:!0,[n.S]:!0,[n.SMALL]:!0,[n.SPAN]:!0,[n.STRONG]:!0,[n.STRIKE]:!0,[n.SUB]:!0,[n.SUP]:!0,[n.TABLE]:!0,[n.TT]:!0,[n.U]:!0,[n.UL]:!0,[n.VAR]:!0};t.causesExit=function(e){const t=e.tagName;return !(t!==n.FONT||null===Nt.getTokenAttr(e,r.COLOR)&&null===Nt.getTokenAttr(e,r.SIZE)&&null===Nt.getTokenAttr(e,r.FACE))||T[t]},t.adjustTokenMathMLAttrs=function(e){for(let t=0;t<e.attrs.length;t++)if("definitionurl"===e.attrs[t].name){e.attrs[t].name="definitionURL";break}},t.adjustTokenSVGAttrs=function(e){for(let t=0;t<e.attrs.length;t++){const n=i[e.attrs[t].name];n&&(e.attrs[t].name=n);}},t.adjustTokenXMLAttrs=function(e){for(let t=0;t<e.attrs.length;t++){const n=o[e.attrs[t].name];n&&(e.attrs[t].prefix=n.prefix,e.attrs[t].name=n.name,e.attrs[t].namespace=n.namespace);}},t.adjustTokenSVGTagName=function(e){const t=a[e.tagName];t&&(e.tagName=t);},t.isIntegrationPoint=function(e,t,i,o){return !(o&&o!==s.HTML||!function(e,t,i){if(t===s.MATHML&&e===n.ANNOTATION_XML)for(let e=0;e<i.length;e++)if(i[e].name===r.ENCODING){const t=i[e].value.toLowerCase();return "text/html"===t||"application/xhtml+xml"===t}return t===s.SVG&&(e===n.FOREIGN_OBJECT||e===n.DESC||e===n.TITLE)}(e,t,i))||!(o&&o!==s.MATHML||!function(e,t){return t===s.MATHML&&(e===n.MI||e===n.MO||e===n.MN||e===n.MS||e===n.MTEXT)}(e,t))};}));const zt=Ct.TAG_NAMES,qt=Ct.NAMESPACES,Jt=Ct.ATTRS,Zt={scriptingEnabled:!0,sourceCodeLocationInfo:!1,onParseError:null,treeAdapter:xt},$t="hidden",en="INITIAL_MODE",tn="BEFORE_HTML_MODE",nn="BEFORE_HEAD_MODE",sn="IN_HEAD_MODE",rn="IN_HEAD_NO_SCRIPT_MODE",on="AFTER_HEAD_MODE",an="IN_BODY_MODE",Tn="TEXT_MODE",En="IN_TABLE_MODE",hn="IN_TABLE_TEXT_MODE",cn="IN_CAPTION_MODE",_n="IN_COLUMN_GROUP_MODE",ln="IN_TABLE_BODY_MODE",mn="IN_ROW_MODE",pn="IN_CELL_MODE",An="IN_SELECT_MODE",un="IN_SELECT_IN_TABLE_MODE",Nn="IN_TEMPLATE_MODE",dn="AFTER_BODY_MODE",Cn="IN_FRAMESET_MODE",On="AFTER_FRAMESET_MODE",fn="AFTER_AFTER_BODY_MODE",Sn="AFTER_AFTER_FRAMESET_MODE",Rn={[zt.TR]:mn,[zt.TBODY]:ln,[zt.THEAD]:ln,[zt.TFOOT]:ln,[zt.CAPTION]:cn,[zt.COLGROUP]:_n,[zt.TABLE]:En,[zt.BODY]:an,[zt.FRAMESET]:Cn},In={[zt.CAPTION]:En,[zt.COLGROUP]:En,[zt.TBODY]:En,[zt.TFOOT]:En,[zt.THEAD]:En,[zt.COL]:_n,[zt.TR]:ln,[zt.TD]:mn,[zt.TH]:mn},Ln={[en]:{[Nt.CHARACTER_TOKEN]:vn,[Nt.NULL_CHARACTER_TOKEN]:vn,[Nt.WHITESPACE_CHARACTER_TOKEN]:Gn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:function(e,t){e._setDocumentType(t);const n=t.forceQuirks?Ct.DOCUMENT_MODE.QUIRKS:function(e){if(e.name!==vt)return yt.QUIRKS;const t=e.systemId;if(t&&"http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd"===t.toLowerCase())return yt.QUIRKS;let n=e.publicId;if(null!==n){if(n=n.toLowerCase(),Qt.indexOf(n)>-1)return yt.QUIRKS;let e=null===t?wt:Yt;if(Vt(n,e))return yt.QUIRKS;if(e=null===t?Xt:Wt,Vt(n,e))return yt.LIMITED_QUIRKS}return yt.NO_QUIRKS}(t);(function(e){return e.name===vt&&null===e.publicId&&(null===e.systemId||"about:legacy-compat"===e.systemId)})(t)||e._err("non-conforming-doctype"),e.treeAdapter.setDocumentMode(e.document,n),e.insertionMode=tn;},[Nt.START_TAG_TOKEN]:vn,[Nt.END_TAG_TOKEN]:vn,[Nt.EOF_TOKEN]:vn},[tn]:{[Nt.CHARACTER_TOKEN]:Yn,[Nt.NULL_CHARACTER_TOKEN]:Yn,[Nt.WHITESPACE_CHARACTER_TOKEN]:Gn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML?(e._insertElement(t,qt.HTML),e.insertionMode=nn):Yn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n!==zt.HTML&&n!==zt.HEAD&&n!==zt.BODY&&n!==zt.BR||Yn(e,t);},[Nt.EOF_TOKEN]:Yn},[nn]:{[Nt.CHARACTER_TOKEN]:wn,[Nt.NULL_CHARACTER_TOKEN]:wn,[Nt.WHITESPACE_CHARACTER_TOKEN]:Gn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Bn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.HEAD?(e._insertElement(t,qt.HTML),e.headElement=e.openElements.current,e.insertionMode=sn):wn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HEAD||n===zt.BODY||n===zt.HTML||n===zt.BR?wn(e,t):e._err(L);},[Nt.EOF_TOKEN]:wn},[sn]:{[Nt.CHARACTER_TOKEN]:Wn,[Nt.NULL_CHARACTER_TOKEN]:Wn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Bn,[Nt.START_TAG_TOKEN]:Qn,[Nt.END_TAG_TOKEN]:Xn,[Nt.EOF_TOKEN]:Wn},[rn]:{[Nt.CHARACTER_TOKEN]:Vn,[Nt.NULL_CHARACTER_TOKEN]:Vn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Bn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.BASEFONT||n===zt.BGSOUND||n===zt.HEAD||n===zt.LINK||n===zt.META||n===zt.NOFRAMES||n===zt.STYLE?Qn(e,t):n===zt.NOSCRIPT?e._err("nested-noscript-in-head"):Vn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.NOSCRIPT?(e.openElements.pop(),e.insertionMode=sn):n===zt.BR?Vn(e,t):e._err(L);},[Nt.EOF_TOKEN]:Vn},[on]:{[Nt.CHARACTER_TOKEN]:jn,[Nt.NULL_CHARACTER_TOKEN]:jn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Bn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.BODY?(e._insertElement(t,qt.HTML),e.framesetOk=!1,e.insertionMode=an):n===zt.FRAMESET?(e._insertElement(t,qt.HTML),e.insertionMode=Cn):n===zt.BASE||n===zt.BASEFONT||n===zt.BGSOUND||n===zt.LINK||n===zt.META||n===zt.NOFRAMES||n===zt.SCRIPT||n===zt.STYLE||n===zt.TEMPLATE||n===zt.TITLE?(e._err("abandoned-head-element-child"),e.openElements.push(e.headElement),Qn(e,t),e.openElements.remove(e.headElement)):n===zt.HEAD?e._err(k):jn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.BODY||n===zt.HTML||n===zt.BR?jn(e,t):n===zt.TEMPLATE?Xn(e,t):e._err(L);},[Nt.EOF_TOKEN]:jn},[an]:{[Nt.CHARACTER_TOKEN]:qn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:as,[Nt.END_TAG_TOKEN]:cs,[Nt.EOF_TOKEN]:_s},[Tn]:{[Nt.CHARACTER_TOKEN]:xn,[Nt.NULL_CHARACTER_TOKEN]:xn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Gn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:Gn,[Nt.END_TAG_TOKEN]:function(e,t){t.tagName===zt.SCRIPT&&(e.pendingScript=e.openElements.current),e.openElements.pop(),e.insertionMode=e.originalInsertionMode;},[Nt.EOF_TOKEN]:function(e,t){e._err("eof-in-element-that-can-contain-only-text"),e.openElements.pop(),e.insertionMode=e.originalInsertionMode,e._processToken(t);}},[En]:{[Nt.CHARACTER_TOKEN]:ls,[Nt.NULL_CHARACTER_TOKEN]:ls,[Nt.WHITESPACE_CHARACTER_TOKEN]:ls,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:ms,[Nt.END_TAG_TOKEN]:ps,[Nt.EOF_TOKEN]:_s},[hn]:{[Nt.CHARACTER_TOKEN]:function(e,t){e.pendingCharacterTokens.push(t),e.hasNonWhitespacePendingCharacterToken=!0;},[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:function(e,t){e.pendingCharacterTokens.push(t);},[Nt.COMMENT_TOKEN]:us,[Nt.DOCTYPE_TOKEN]:us,[Nt.START_TAG_TOKEN]:us,[Nt.END_TAG_TOKEN]:us,[Nt.EOF_TOKEN]:us},[cn]:{[Nt.CHARACTER_TOKEN]:qn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.COL||n===zt.COLGROUP||n===zt.TBODY||n===zt.TD||n===zt.TFOOT||n===zt.TH||n===zt.THEAD||n===zt.TR?e.openElements.hasInTableScope(zt.CAPTION)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(zt.CAPTION),e.activeFormattingElements.clearToLastMarker(),e.insertionMode=En,e._processToken(t)):as(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.TABLE?e.openElements.hasInTableScope(zt.CAPTION)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(zt.CAPTION),e.activeFormattingElements.clearToLastMarker(),e.insertionMode=En,n===zt.TABLE&&e._processToken(t)):n!==zt.BODY&&n!==zt.COL&&n!==zt.COLGROUP&&n!==zt.HTML&&n!==zt.TBODY&&n!==zt.TD&&n!==zt.TFOOT&&n!==zt.TH&&n!==zt.THEAD&&n!==zt.TR&&cs(e,t);},[Nt.EOF_TOKEN]:_s},[_n]:{[Nt.CHARACTER_TOKEN]:Ns,[Nt.NULL_CHARACTER_TOKEN]:Ns,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.COL?(e._appendElement(t,qt.HTML),t.ackSelfClosing=!0):n===zt.TEMPLATE?Qn(e,t):Ns(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.COLGROUP?e.openElements.currentTagName===zt.COLGROUP&&(e.openElements.pop(),e.insertionMode=En):n===zt.TEMPLATE?Xn(e,t):n!==zt.COL&&Ns(e,t);},[Nt.EOF_TOKEN]:_s},[ln]:{[Nt.CHARACTER_TOKEN]:ls,[Nt.NULL_CHARACTER_TOKEN]:ls,[Nt.WHITESPACE_CHARACTER_TOKEN]:ls,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TR?(e.openElements.clearBackToTableBodyContext(),e._insertElement(t,qt.HTML),e.insertionMode=mn):n===zt.TH||n===zt.TD?(e.openElements.clearBackToTableBodyContext(),e._insertFakeElement(zt.TR),e.insertionMode=mn,e._processToken(t)):n===zt.CAPTION||n===zt.COL||n===zt.COLGROUP||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD?e.openElements.hasTableBodyContextInTableScope()&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=En,e._processToken(t)):ms(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD?e.openElements.hasInTableScope(n)&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=En):n===zt.TABLE?e.openElements.hasTableBodyContextInTableScope()&&(e.openElements.clearBackToTableBodyContext(),e.openElements.pop(),e.insertionMode=En,e._processToken(t)):(n!==zt.BODY&&n!==zt.CAPTION&&n!==zt.COL&&n!==zt.COLGROUP||n!==zt.HTML&&n!==zt.TD&&n!==zt.TH&&n!==zt.TR)&&ps(e,t);},[Nt.EOF_TOKEN]:_s},[mn]:{[Nt.CHARACTER_TOKEN]:ls,[Nt.NULL_CHARACTER_TOKEN]:ls,[Nt.WHITESPACE_CHARACTER_TOKEN]:ls,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TH||n===zt.TD?(e.openElements.clearBackToTableRowContext(),e._insertElement(t,qt.HTML),e.insertionMode=pn,e.activeFormattingElements.insertMarker()):n===zt.CAPTION||n===zt.COL||n===zt.COLGROUP||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR?e.openElements.hasInTableScope(zt.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode=ln,e._processToken(t)):ms(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TR?e.openElements.hasInTableScope(zt.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode=ln):n===zt.TABLE?e.openElements.hasInTableScope(zt.TR)&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode=ln,e._processToken(t)):n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD?(e.openElements.hasInTableScope(n)||e.openElements.hasInTableScope(zt.TR))&&(e.openElements.clearBackToTableRowContext(),e.openElements.pop(),e.insertionMode=ln,e._processToken(t)):(n!==zt.BODY&&n!==zt.CAPTION&&n!==zt.COL&&n!==zt.COLGROUP||n!==zt.HTML&&n!==zt.TD&&n!==zt.TH)&&ps(e,t);},[Nt.EOF_TOKEN]:_s},[pn]:{[Nt.CHARACTER_TOKEN]:qn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.COL||n===zt.COLGROUP||n===zt.TBODY||n===zt.TD||n===zt.TFOOT||n===zt.TH||n===zt.THEAD||n===zt.TR?(e.openElements.hasInTableScope(zt.TD)||e.openElements.hasInTableScope(zt.TH))&&(e._closeTableCell(),e._processToken(t)):as(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.TD||n===zt.TH?e.openElements.hasInTableScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n),e.activeFormattingElements.clearToLastMarker(),e.insertionMode=mn):n===zt.TABLE||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR?e.openElements.hasInTableScope(n)&&(e._closeTableCell(),e._processToken(t)):n!==zt.BODY&&n!==zt.CAPTION&&n!==zt.COL&&n!==zt.COLGROUP&&n!==zt.HTML&&cs(e,t);},[Nt.EOF_TOKEN]:_s},[An]:{[Nt.CHARACTER_TOKEN]:xn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:ds,[Nt.END_TAG_TOKEN]:Cs,[Nt.EOF_TOKEN]:_s},[un]:{[Nt.CHARACTER_TOKEN]:xn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.TABLE||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR||n===zt.TD||n===zt.TH?(e.openElements.popUntilTagNamePopped(zt.SELECT),e._resetInsertionMode(),e._processToken(t)):ds(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.CAPTION||n===zt.TABLE||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR||n===zt.TD||n===zt.TH?e.openElements.hasInTableScope(n)&&(e.openElements.popUntilTagNamePopped(zt.SELECT),e._resetInsertionMode(),e._processToken(t)):Cs(e,t);},[Nt.EOF_TOKEN]:_s},[Nn]:{[Nt.CHARACTER_TOKEN]:qn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;if(n===zt.BASE||n===zt.BASEFONT||n===zt.BGSOUND||n===zt.LINK||n===zt.META||n===zt.NOFRAMES||n===zt.SCRIPT||n===zt.STYLE||n===zt.TEMPLATE||n===zt.TITLE)Qn(e,t);else {const s=In[n]||an;e._popTmplInsertionMode(),e._pushTmplInsertionMode(s),e.insertionMode=s,e._processToken(t);}},[Nt.END_TAG_TOKEN]:function(e,t){t.tagName===zt.TEMPLATE&&Xn(e,t);},[Nt.EOF_TOKEN]:Os},[dn]:{[Nt.CHARACTER_TOKEN]:fs,[Nt.NULL_CHARACTER_TOKEN]:fs,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:function(e,t){e._appendCommentNode(t,e.openElements.items[0]);},[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML?as(e,t):fs(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML?e.fragmentContext||(e.insertionMode=fn):fs(e,t);},[Nt.EOF_TOKEN]:yn},[Cn]:{[Nt.CHARACTER_TOKEN]:Gn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.FRAMESET?e._insertElement(t,qt.HTML):n===zt.FRAME?(e._appendElement(t,qt.HTML),t.ackSelfClosing=!0):n===zt.NOFRAMES&&Qn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){t.tagName!==zt.FRAMESET||e.openElements.isRootHtmlElementCurrent()||(e.openElements.pop(),e.fragmentContext||e.openElements.currentTagName===zt.FRAMESET||(e.insertionMode=On));},[Nt.EOF_TOKEN]:yn},[On]:{[Nt.CHARACTER_TOKEN]:Gn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:xn,[Nt.COMMENT_TOKEN]:Kn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.NOFRAMES&&Qn(e,t);},[Nt.END_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML&&(e.insertionMode=Sn);},[Nt.EOF_TOKEN]:yn},[fn]:{[Nt.CHARACTER_TOKEN]:Ss,[Nt.NULL_CHARACTER_TOKEN]:Ss,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:bn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){t.tagName===zt.HTML?as(e,t):Ss(e,t);},[Nt.END_TAG_TOKEN]:Ss,[Nt.EOF_TOKEN]:yn},[Sn]:{[Nt.CHARACTER_TOKEN]:Gn,[Nt.NULL_CHARACTER_TOKEN]:Gn,[Nt.WHITESPACE_CHARACTER_TOKEN]:zn,[Nt.COMMENT_TOKEN]:bn,[Nt.DOCTYPE_TOKEN]:Gn,[Nt.START_TAG_TOKEN]:function(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.NOFRAMES&&Qn(e,t);},[Nt.END_TAG_TOKEN]:Gn,[Nt.EOF_TOKEN]:yn}};var kn=class{constructor(e){this.options=function(e,t){return [e,t=t||Object.create(null)].reduce(((e,t)=>(Object.keys(t).forEach((n=>{e[n]=t[n];})),e)),Object.create(null))}(Zt,e),this.treeAdapter=this.options.treeAdapter,this.pendingScript=null,this.options.sourceCodeLocationInfo&&gt.install(this,Ut),this.options.onParseError&&gt.install(this,bt,{onParseError:this.options.onParseError});}parse(e){const t=this.treeAdapter.createDocument();return this._bootstrap(t,null),this.tokenizer.write(e,!0),this._runParsingLoop(null),t}parseFragment(e,t){t||(t=this.treeAdapter.createElement(zt.TEMPLATE,qt.HTML,[]));const n=this.treeAdapter.createElement("documentmock",qt.HTML,[]);this._bootstrap(n,t),this.treeAdapter.getTagName(t)===zt.TEMPLATE&&this._pushTmplInsertionMode(Nn),this._initTokenizerForFragmentParsing(),this._insertFakeRootElement(),this._resetInsertionMode(),this._findFormInFragmentContext(),this.tokenizer.write(e,!0),this._runParsingLoop(null);const s=this.treeAdapter.getFirstChild(n),r=this.treeAdapter.createDocumentFragment();return this._adoptNodes(s,r),r}_bootstrap(e,t){this.tokenizer=new Nt(this.options),this.stopped=!1,this.insertionMode=en,this.originalInsertionMode="",this.document=e,this.fragmentContext=t,this.headElement=null,this.formElement=null,this.openElements=new class{constructor(e,t){this.stackTop=-1,this.items=[],this.current=e,this.currentTagName=null,this.currentTmplContent=null,this.tmplCount=0,this.treeAdapter=t;}_indexOf(e){let t=-1;for(let n=this.stackTop;n>=0;n--)if(this.items[n]===e){t=n;break}return t}_isInTemplate(){return this.currentTagName===Ot.TEMPLATE&&this.treeAdapter.getNamespaceURI(this.current)===ft.HTML}_updateCurrentElement(){this.current=this.items[this.stackTop],this.currentTagName=this.current&&this.treeAdapter.getTagName(this.current),this.currentTmplContent=this._isInTemplate()?this.treeAdapter.getTemplateContent(this.current):null;}push(e){this.items[++this.stackTop]=e,this._updateCurrentElement(),this._isInTemplate()&&this.tmplCount++;}pop(){this.stackTop--,this.tmplCount>0&&this._isInTemplate()&&this.tmplCount--,this._updateCurrentElement();}replace(e,t){const n=this._indexOf(e);this.items[n]=t,n===this.stackTop&&this._updateCurrentElement();}insertAfter(e,t){const n=this._indexOf(e)+1;this.items.splice(n,0,t),n===++this.stackTop&&this._updateCurrentElement();}popUntilTagNamePopped(e){for(;this.stackTop>-1;){const t=this.currentTagName,n=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),t===e&&n===ft.HTML)break}}popUntilElementPopped(e){for(;this.stackTop>-1;){const t=this.current;if(this.pop(),t===e)break}}popUntilNumberedHeaderPopped(){for(;this.stackTop>-1;){const e=this.currentTagName,t=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),e===Ot.H1||e===Ot.H2||e===Ot.H3||e===Ot.H4||e===Ot.H5||e===Ot.H6&&t===ft.HTML)break}}popUntilTableCellPopped(){for(;this.stackTop>-1;){const e=this.currentTagName,t=this.treeAdapter.getNamespaceURI(this.current);if(this.pop(),e===Ot.TD||e===Ot.TH&&t===ft.HTML)break}}popAllUpToHtmlElement(){this.stackTop=0,this._updateCurrentElement();}clearBackToTableContext(){for(;this.currentTagName!==Ot.TABLE&&this.currentTagName!==Ot.TEMPLATE&&this.currentTagName!==Ot.HTML||this.treeAdapter.getNamespaceURI(this.current)!==ft.HTML;)this.pop();}clearBackToTableBodyContext(){for(;this.currentTagName!==Ot.TBODY&&this.currentTagName!==Ot.TFOOT&&this.currentTagName!==Ot.THEAD&&this.currentTagName!==Ot.TEMPLATE&&this.currentTagName!==Ot.HTML||this.treeAdapter.getNamespaceURI(this.current)!==ft.HTML;)this.pop();}clearBackToTableRowContext(){for(;this.currentTagName!==Ot.TR&&this.currentTagName!==Ot.TEMPLATE&&this.currentTagName!==Ot.HTML||this.treeAdapter.getNamespaceURI(this.current)!==ft.HTML;)this.pop();}remove(e){for(let t=this.stackTop;t>=0;t--)if(this.items[t]===e){this.items.splice(t,1),this.stackTop--,this._updateCurrentElement();break}}tryPeekProperlyNestedBodyElement(){const e=this.items[1];return e&&this.treeAdapter.getTagName(e)===Ot.BODY?e:null}contains(e){return this._indexOf(e)>-1}getCommonAncestor(e){let t=this._indexOf(e);return --t>=0?this.items[t]:null}isRootHtmlElementCurrent(){return 0===this.stackTop&&this.currentTagName===Ot.HTML}hasInScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===ft.HTML)return !0;if(It(n,s))return !1}return !0}hasNumberedHeaderInScope(){for(let e=this.stackTop;e>=0;e--){const t=this.treeAdapter.getTagName(this.items[e]),n=this.treeAdapter.getNamespaceURI(this.items[e]);if((t===Ot.H1||t===Ot.H2||t===Ot.H3||t===Ot.H4||t===Ot.H5||t===Ot.H6)&&n===ft.HTML)return !0;if(It(t,n))return !1}return !0}hasInListItemScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===ft.HTML)return !0;if((n===Ot.UL||n===Ot.OL)&&s===ft.HTML||It(n,s))return !1}return !0}hasInButtonScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]),s=this.treeAdapter.getNamespaceURI(this.items[t]);if(n===e&&s===ft.HTML)return !0;if(n===Ot.BUTTON&&s===ft.HTML||It(n,s))return !1}return !0}hasInTableScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]);if(this.treeAdapter.getNamespaceURI(this.items[t])===ft.HTML){if(n===e)return !0;if(n===Ot.TABLE||n===Ot.TEMPLATE||n===Ot.HTML)return !1}}return !0}hasTableBodyContextInTableScope(){for(let e=this.stackTop;e>=0;e--){const t=this.treeAdapter.getTagName(this.items[e]);if(this.treeAdapter.getNamespaceURI(this.items[e])===ft.HTML){if(t===Ot.TBODY||t===Ot.THEAD||t===Ot.TFOOT)return !0;if(t===Ot.TABLE||t===Ot.HTML)return !1}}return !0}hasInSelectScope(e){for(let t=this.stackTop;t>=0;t--){const n=this.treeAdapter.getTagName(this.items[t]);if(this.treeAdapter.getNamespaceURI(this.items[t])===ft.HTML){if(n===e)return !0;if(n!==Ot.OPTION&&n!==Ot.OPTGROUP)return !1}}return !0}generateImpliedEndTags(){for(;St(this.currentTagName);)this.pop();}generateImpliedEndTagsThoroughly(){for(;Rt(this.currentTagName);)this.pop();}generateImpliedEndTagsWithExclusion(e){for(;St(this.currentTagName)&&this.currentTagName!==e;)this.pop();}}(this.document,this.treeAdapter),this.activeFormattingElements=new kt(this.treeAdapter),this.tmplInsertionModeStack=[],this.tmplInsertionModeStackTop=-1,this.currentTmplInsertionMode=null,this.pendingCharacterTokens=[],this.hasNonWhitespacePendingCharacterToken=!1,this.framesetOk=!0,this.skipNextNewLine=!1,this.fosterParentingEnabled=!1;}_err(){}_runParsingLoop(e){for(;!this.stopped;){this._setupTokenizerCDATAMode();const t=this.tokenizer.getNextToken();if(t.type===Nt.HIBERNATION_TOKEN)break;if(this.skipNextNewLine&&(this.skipNextNewLine=!1,t.type===Nt.WHITESPACE_CHARACTER_TOKEN&&"\n"===t.chars[0])){if(1===t.chars.length)continue;t.chars=t.chars.substr(1);}if(this._processInputToken(t),e&&this.pendingScript)break}}runParsingLoopForCurrentChunk(e,t){if(this._runParsingLoop(t),t&&this.pendingScript){const e=this.pendingScript;return this.pendingScript=null,void t(e)}e&&e();}_setupTokenizerCDATAMode(){const e=this._getAdjustedCurrentElement();this.tokenizer.allowCDATA=e&&e!==this.document&&this.treeAdapter.getNamespaceURI(e)!==qt.HTML&&!this._isIntegrationPoint(e);}_switchToTextParsing(e,t){this._insertElement(e,qt.HTML),this.tokenizer.state=t,this.originalInsertionMode=this.insertionMode,this.insertionMode=Tn;}switchToPlaintextParsing(){this.insertionMode=Tn,this.originalInsertionMode=an,this.tokenizer.state=Nt.MODE.PLAINTEXT;}_getAdjustedCurrentElement(){return 0===this.openElements.stackTop&&this.fragmentContext?this.fragmentContext:this.openElements.current}_findFormInFragmentContext(){let e=this.fragmentContext;do{if(this.treeAdapter.getTagName(e)===zt.FORM){this.formElement=e;break}e=this.treeAdapter.getParentNode(e);}while(e)}_initTokenizerForFragmentParsing(){if(this.treeAdapter.getNamespaceURI(this.fragmentContext)===qt.HTML){const e=this.treeAdapter.getTagName(this.fragmentContext);e===zt.TITLE||e===zt.TEXTAREA?this.tokenizer.state=Nt.MODE.RCDATA:e===zt.STYLE||e===zt.XMP||e===zt.IFRAME||e===zt.NOEMBED||e===zt.NOFRAMES||e===zt.NOSCRIPT?this.tokenizer.state=Nt.MODE.RAWTEXT:e===zt.SCRIPT?this.tokenizer.state=Nt.MODE.SCRIPT_DATA:e===zt.PLAINTEXT&&(this.tokenizer.state=Nt.MODE.PLAINTEXT);}}_setDocumentType(e){const t=e.name||"",n=e.publicId||"",s=e.systemId||"";this.treeAdapter.setDocumentType(this.document,t,n,s);}_attachElementToTree(e){if(this._shouldFosterParentOnInsertion())this._fosterParentElement(e);else {const t=this.openElements.currentTmplContent||this.openElements.current;this.treeAdapter.appendChild(t,e);}}_appendElement(e,t){const n=this.treeAdapter.createElement(e.tagName,t,e.attrs);this._attachElementToTree(n);}_insertElement(e,t){const n=this.treeAdapter.createElement(e.tagName,t,e.attrs);this._attachElementToTree(n),this.openElements.push(n);}_insertFakeElement(e){const t=this.treeAdapter.createElement(e,qt.HTML,[]);this._attachElementToTree(t),this.openElements.push(t);}_insertTemplate(e){const t=this.treeAdapter.createElement(e.tagName,qt.HTML,e.attrs),n=this.treeAdapter.createDocumentFragment();this.treeAdapter.setTemplateContent(t,n),this._attachElementToTree(t),this.openElements.push(t);}_insertFakeRootElement(){const e=this.treeAdapter.createElement(zt.HTML,qt.HTML,[]);this.treeAdapter.appendChild(this.openElements.current,e),this.openElements.push(e);}_appendCommentNode(e,t){const n=this.treeAdapter.createCommentNode(e.data);this.treeAdapter.appendChild(t,n);}_insertCharacters(e){if(this._shouldFosterParentOnInsertion())this._fosterParentText(e.chars);else {const t=this.openElements.currentTmplContent||this.openElements.current;this.treeAdapter.insertText(t,e.chars);}}_adoptNodes(e,t){for(let n=this.treeAdapter.getFirstChild(e);n;n=this.treeAdapter.getFirstChild(e))this.treeAdapter.detachNode(n),this.treeAdapter.appendChild(t,n);}_shouldProcessTokenInForeignContent(e){const t=this._getAdjustedCurrentElement();if(!t||t===this.document)return !1;const n=this.treeAdapter.getNamespaceURI(t);if(n===qt.HTML)return !1;if(this.treeAdapter.getTagName(t)===zt.ANNOTATION_XML&&n===qt.MATHML&&e.type===Nt.START_TAG_TOKEN&&e.tagName===zt.SVG)return !1;const s=e.type===Nt.CHARACTER_TOKEN||e.type===Nt.NULL_CHARACTER_TOKEN||e.type===Nt.WHITESPACE_CHARACTER_TOKEN;return !((e.type===Nt.START_TAG_TOKEN&&e.tagName!==zt.MGLYPH&&e.tagName!==zt.MALIGNMARK||s)&&this._isIntegrationPoint(t,qt.MATHML)||(e.type===Nt.START_TAG_TOKEN||s)&&this._isIntegrationPoint(t,qt.HTML)||e.type===Nt.EOF_TOKEN)}_processToken(e){Ln[this.insertionMode][e.type](this,e);}_processTokenInBodyMode(e){Ln.IN_BODY_MODE[e.type](this,e);}_processTokenInForeignContent(e){e.type===Nt.CHARACTER_TOKEN?function(e,t){e._insertCharacters(t),e.framesetOk=!1;}(this,e):e.type===Nt.NULL_CHARACTER_TOKEN?function(e,t){t.chars=n,e._insertCharacters(t);}(this,e):e.type===Nt.WHITESPACE_CHARACTER_TOKEN?xn(this,e):e.type===Nt.COMMENT_TOKEN?Kn(this,e):e.type===Nt.START_TAG_TOKEN?function(e,t){if(jt.causesExit(t)&&!e.fragmentContext){for(;e.treeAdapter.getNamespaceURI(e.openElements.current)!==qt.HTML&&!e._isIntegrationPoint(e.openElements.current);)e.openElements.pop();e._processToken(t);}else {const n=e._getAdjustedCurrentElement(),s=e.treeAdapter.getNamespaceURI(n);s===qt.MATHML?jt.adjustTokenMathMLAttrs(t):s===qt.SVG&&(jt.adjustTokenSVGTagName(t),jt.adjustTokenSVGAttrs(t)),jt.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,s):e._insertElement(t,s),t.ackSelfClosing=!0;}}(this,e):e.type===Nt.END_TAG_TOKEN&&function(e,t){for(let n=e.openElements.stackTop;n>0;n--){const s=e.openElements.items[n];if(e.treeAdapter.getNamespaceURI(s)===qt.HTML){e._processToken(t);break}if(e.treeAdapter.getTagName(s).toLowerCase()===t.tagName){e.openElements.popUntilElementPopped(s);break}}}(this,e);}_processInputToken(e){this._shouldProcessTokenInForeignContent(e)?this._processTokenInForeignContent(e):this._processToken(e),e.type===Nt.START_TAG_TOKEN&&e.selfClosing&&!e.ackSelfClosing&&this._err("non-void-html-element-start-tag-with-trailing-solidus");}_isIntegrationPoint(e,t){const n=this.treeAdapter.getTagName(e),s=this.treeAdapter.getNamespaceURI(e),r=this.treeAdapter.getAttrList(e);return jt.isIntegrationPoint(n,s,r,t)}_reconstructActiveFormattingElements(){const e=this.activeFormattingElements.length;if(e){let t=e,n=null;do{if(t--,n=this.activeFormattingElements.entries[t],n.type===kt.MARKER_ENTRY||this.openElements.contains(n.element)){t++;break}}while(t>0);for(let s=t;s<e;s++)n=this.activeFormattingElements.entries[s],this._insertElement(n.token,this.treeAdapter.getNamespaceURI(n.element)),n.element=this.openElements.current;}}_closeTableCell(){this.openElements.generateImpliedEndTags(),this.openElements.popUntilTableCellPopped(),this.activeFormattingElements.clearToLastMarker(),this.insertionMode=mn;}_closePElement(){this.openElements.generateImpliedEndTagsWithExclusion(zt.P),this.openElements.popUntilTagNamePopped(zt.P);}_resetInsertionMode(){for(let e=this.openElements.stackTop,t=!1;e>=0;e--){let n=this.openElements.items[e];0===e&&(t=!0,this.fragmentContext&&(n=this.fragmentContext));const s=this.treeAdapter.getTagName(n),r=Rn[s];if(r){this.insertionMode=r;break}if(!(t||s!==zt.TD&&s!==zt.TH)){this.insertionMode=pn;break}if(!t&&s===zt.HEAD){this.insertionMode=sn;break}if(s===zt.SELECT){this._resetInsertionModeForSelect(e);break}if(s===zt.TEMPLATE){this.insertionMode=this.currentTmplInsertionMode;break}if(s===zt.HTML){this.insertionMode=this.headElement?on:nn;break}if(t){this.insertionMode=an;break}}}_resetInsertionModeForSelect(e){if(e>0)for(let t=e-1;t>0;t--){const e=this.openElements.items[t],n=this.treeAdapter.getTagName(e);if(n===zt.TEMPLATE)break;if(n===zt.TABLE)return void(this.insertionMode=un)}this.insertionMode=An;}_pushTmplInsertionMode(e){this.tmplInsertionModeStack.push(e),this.tmplInsertionModeStackTop++,this.currentTmplInsertionMode=e;}_popTmplInsertionMode(){this.tmplInsertionModeStack.pop(),this.tmplInsertionModeStackTop--,this.currentTmplInsertionMode=this.tmplInsertionModeStack[this.tmplInsertionModeStackTop];}_isElementCausesFosterParenting(e){const t=this.treeAdapter.getTagName(e);return t===zt.TABLE||t===zt.TBODY||t===zt.TFOOT||t===zt.THEAD||t===zt.TR}_shouldFosterParentOnInsertion(){return this.fosterParentingEnabled&&this._isElementCausesFosterParenting(this.openElements.current)}_findFosterParentingLocation(){const e={parent:null,beforeElement:null};for(let t=this.openElements.stackTop;t>=0;t--){const n=this.openElements.items[t],s=this.treeAdapter.getTagName(n),r=this.treeAdapter.getNamespaceURI(n);if(s===zt.TEMPLATE&&r===qt.HTML){e.parent=this.treeAdapter.getTemplateContent(n);break}if(s===zt.TABLE){e.parent=this.treeAdapter.getParentNode(n),e.parent?e.beforeElement=n:e.parent=this.openElements.items[t-1];break}}return e.parent||(e.parent=this.openElements.items[0]),e}_fosterParentElement(e){const t=this._findFosterParentingLocation();t.beforeElement?this.treeAdapter.insertBefore(t.parent,e,t.beforeElement):this.treeAdapter.appendChild(t.parent,e);}_fosterParentText(e){const t=this._findFosterParentingLocation();t.beforeElement?this.treeAdapter.insertTextBefore(t.parent,e,t.beforeElement):this.treeAdapter.insertText(t.parent,e);}_isSpecialElement(e){const t=this.treeAdapter.getTagName(e),n=this.treeAdapter.getNamespaceURI(e);return Ct.SPECIAL_ELEMENTS[n][t]}};function Mn(e,t){let n=e.activeFormattingElements.getElementEntryInScopeWithTagName(t.tagName);return n?e.openElements.contains(n.element)?e.openElements.hasInScope(t.tagName)||(n=null):(e.activeFormattingElements.removeEntry(n),n=null):hs(e,t),n}function gn(e,t){let n=null;for(let s=e.openElements.stackTop;s>=0;s--){const r=e.openElements.items[s];if(r===t.element)break;e._isSpecialElement(r)&&(n=r);}return n||(e.openElements.popUntilElementPopped(t.element),e.activeFormattingElements.removeEntry(t)),n}function Pn(e,t,n){let s=t,r=e.openElements.getCommonAncestor(t);for(let i=0,o=r;o!==n;i++,o=r){r=e.openElements.getCommonAncestor(o);const n=e.activeFormattingElements.getElementEntry(o),a=n&&i>=3;!n||a?(a&&e.activeFormattingElements.removeEntry(n),e.openElements.remove(o)):(o=Hn(e,n),s===t&&(e.activeFormattingElements.bookmark=n),e.treeAdapter.detachNode(s),e.treeAdapter.appendChild(o,s),s=o);}return s}function Hn(e,t){const n=e.treeAdapter.getNamespaceURI(t.element),s=e.treeAdapter.createElement(t.token.tagName,n,t.token.attrs);return e.openElements.replace(t.element,s),t.element=s,s}function Dn(e,t,n){if(e._isElementCausesFosterParenting(t))e._fosterParentElement(n);else {const s=e.treeAdapter.getTagName(t),r=e.treeAdapter.getNamespaceURI(t);s===zt.TEMPLATE&&r===qt.HTML&&(t=e.treeAdapter.getTemplateContent(t)),e.treeAdapter.appendChild(t,n);}}function Fn(e,t,n){const s=e.treeAdapter.getNamespaceURI(n.element),r=n.token,i=e.treeAdapter.createElement(r.tagName,s,r.attrs);e._adoptNodes(t,i),e.treeAdapter.appendChild(t,i),e.activeFormattingElements.insertElementAfterBookmark(i,n.token),e.activeFormattingElements.removeEntry(n),e.openElements.remove(n.element),e.openElements.insertAfter(t,i);}function Un(e,t){let n;for(let s=0;s<8&&(n=Mn(e,t),n);s++){const t=gn(e,n);if(!t)break;e.activeFormattingElements.bookmark=n;const s=Pn(e,t,n.element),r=e.openElements.getCommonAncestor(n.element);e.treeAdapter.detachNode(s),Dn(e,r,s),Fn(e,t,n);}}function Gn(){}function Bn(e){e._err("misplaced-doctype");}function Kn(e,t){e._appendCommentNode(t,e.openElements.currentTmplContent||e.openElements.current);}function bn(e,t){e._appendCommentNode(t,e.document);}function xn(e,t){e._insertCharacters(t);}function yn(e){e.stopped=!0;}function vn(e,t){e._err("missing-doctype",{beforeToken:!0}),e.treeAdapter.setDocumentMode(e.document,Ct.DOCUMENT_MODE.QUIRKS),e.insertionMode=tn,e._processToken(t);}function Yn(e,t){e._insertFakeRootElement(),e.insertionMode=nn,e._processToken(t);}function wn(e,t){e._insertFakeElement(zt.HEAD),e.headElement=e.openElements.current,e.insertionMode=sn,e._processToken(t);}function Qn(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.BASE||n===zt.BASEFONT||n===zt.BGSOUND||n===zt.LINK||n===zt.META?(e._appendElement(t,qt.HTML),t.ackSelfClosing=!0):n===zt.TITLE?e._switchToTextParsing(t,Nt.MODE.RCDATA):n===zt.NOSCRIPT?e.options.scriptingEnabled?e._switchToTextParsing(t,Nt.MODE.RAWTEXT):(e._insertElement(t,qt.HTML),e.insertionMode=rn):n===zt.NOFRAMES||n===zt.STYLE?e._switchToTextParsing(t,Nt.MODE.RAWTEXT):n===zt.SCRIPT?e._switchToTextParsing(t,Nt.MODE.SCRIPT_DATA):n===zt.TEMPLATE?(e._insertTemplate(t,qt.HTML),e.activeFormattingElements.insertMarker(),e.framesetOk=!1,e.insertionMode=Nn,e._pushTmplInsertionMode(Nn)):n===zt.HEAD?e._err(k):Wn(e,t);}function Xn(e,t){const n=t.tagName;n===zt.HEAD?(e.openElements.pop(),e.insertionMode=on):n===zt.BODY||n===zt.BR||n===zt.HTML?Wn(e,t):n===zt.TEMPLATE&&e.openElements.tmplCount>0?(e.openElements.generateImpliedEndTagsThoroughly(),e.openElements.currentTagName!==zt.TEMPLATE&&e._err("closing-of-element-with-open-child-elements"),e.openElements.popUntilTagNamePopped(zt.TEMPLATE),e.activeFormattingElements.clearToLastMarker(),e._popTmplInsertionMode(),e._resetInsertionMode()):e._err(L);}function Wn(e,t){e.openElements.pop(),e.insertionMode=on,e._processToken(t);}function Vn(e,t){const n=t.type===Nt.EOF_TOKEN?"open-elements-left-after-eof":"disallowed-content-in-noscript-in-head";e._err(n),e.openElements.pop(),e.insertionMode=sn,e._processToken(t);}function jn(e,t){e._insertFakeElement(zt.BODY),e.insertionMode=an,e._processToken(t);}function zn(e,t){e._reconstructActiveFormattingElements(),e._insertCharacters(t);}function qn(e,t){e._reconstructActiveFormattingElements(),e._insertCharacters(t),e.framesetOk=!1;}function Jn(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML);}function Zn(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML),e.skipNextNewLine=!0,e.framesetOk=!1;}function $n(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}function es(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.activeFormattingElements.insertMarker(),e.framesetOk=!1;}function ts(e,t){e._reconstructActiveFormattingElements(),e._appendElement(t,qt.HTML),e.framesetOk=!1,t.ackSelfClosing=!0;}function ns(e,t){e._appendElement(t,qt.HTML),t.ackSelfClosing=!0;}function ss(e,t){e._switchToTextParsing(t,Nt.MODE.RAWTEXT);}function rs(e,t){e.openElements.currentTagName===zt.OPTION&&e.openElements.pop(),e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML);}function is(e,t){e.openElements.hasInScope(zt.RUBY)&&e.openElements.generateImpliedEndTags(),e._insertElement(t,qt.HTML);}function os(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML);}function as(e,t){const n=t.tagName;switch(n.length){case 1:n===zt.I||n===zt.S||n===zt.B||n===zt.U?$n(e,t):n===zt.P?Jn(e,t):n===zt.A?function(e,t){const n=e.activeFormattingElements.getElementEntryInScopeWithTagName(zt.A);n&&(Un(e,t),e.openElements.remove(n.element),e.activeFormattingElements.removeEntry(n)),e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}(e,t):os(e,t);break;case 2:n===zt.DL||n===zt.OL||n===zt.UL?Jn(e,t):n===zt.H1||n===zt.H2||n===zt.H3||n===zt.H4||n===zt.H5||n===zt.H6?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement();const n=e.openElements.currentTagName;n!==zt.H1&&n!==zt.H2&&n!==zt.H3&&n!==zt.H4&&n!==zt.H5&&n!==zt.H6||e.openElements.pop(),e._insertElement(t,qt.HTML);}(e,t):n===zt.LI||n===zt.DD||n===zt.DT?function(e,t){e.framesetOk=!1;const n=t.tagName;for(let t=e.openElements.stackTop;t>=0;t--){const s=e.openElements.items[t],r=e.treeAdapter.getTagName(s);let i=null;if(n===zt.LI&&r===zt.LI?i=zt.LI:n!==zt.DD&&n!==zt.DT||r!==zt.DD&&r!==zt.DT||(i=r),i){e.openElements.generateImpliedEndTagsWithExclusion(i),e.openElements.popUntilTagNamePopped(i);break}if(r!==zt.ADDRESS&&r!==zt.DIV&&r!==zt.P&&e._isSpecialElement(s))break}e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML);}(e,t):n===zt.EM||n===zt.TT?$n(e,t):n===zt.BR?ts(e,t):n===zt.HR?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._appendElement(t,qt.HTML),e.framesetOk=!1,t.ackSelfClosing=!0;}(e,t):n===zt.RB?is(e,t):n===zt.RT||n===zt.RP?function(e,t){e.openElements.hasInScope(zt.RUBY)&&e.openElements.generateImpliedEndTagsWithExclusion(zt.RTC),e._insertElement(t,qt.HTML);}(e,t):n!==zt.TH&&n!==zt.TD&&n!==zt.TR&&os(e,t);break;case 3:n===zt.DIV||n===zt.DIR||n===zt.NAV?Jn(e,t):n===zt.PRE?Zn(e,t):n===zt.BIG?$n(e,t):n===zt.IMG||n===zt.WBR?ts(e,t):n===zt.XMP?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._reconstructActiveFormattingElements(),e.framesetOk=!1,e._switchToTextParsing(t,Nt.MODE.RAWTEXT);}(e,t):n===zt.SVG?function(e,t){e._reconstructActiveFormattingElements(),jt.adjustTokenSVGAttrs(t),jt.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,qt.SVG):e._insertElement(t,qt.SVG),t.ackSelfClosing=!0;}(e,t):n===zt.RTC?is(e,t):n!==zt.COL&&os(e,t);break;case 4:n===zt.HTML?function(e,t){0===e.openElements.tmplCount&&e.treeAdapter.adoptAttributes(e.openElements.items[0],t.attrs);}(e,t):n===zt.BASE||n===zt.LINK||n===zt.META?Qn(e,t):n===zt.BODY?function(e,t){const n=e.openElements.tryPeekProperlyNestedBodyElement();n&&0===e.openElements.tmplCount&&(e.framesetOk=!1,e.treeAdapter.adoptAttributes(n,t.attrs));}(e,t):n===zt.MAIN||n===zt.MENU?Jn(e,t):n===zt.FORM?function(e,t){const n=e.openElements.tmplCount>0;e.formElement&&!n||(e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML),n||(e.formElement=e.openElements.current));}(e,t):n===zt.CODE||n===zt.FONT?$n(e,t):n===zt.NOBR?function(e,t){e._reconstructActiveFormattingElements(),e.openElements.hasInScope(zt.NOBR)&&(Un(e,t),e._reconstructActiveFormattingElements()),e._insertElement(t,qt.HTML),e.activeFormattingElements.pushElement(e.openElements.current,t);}(e,t):n===zt.AREA?ts(e,t):n===zt.MATH?function(e,t){e._reconstructActiveFormattingElements(),jt.adjustTokenMathMLAttrs(t),jt.adjustTokenXMLAttrs(t),t.selfClosing?e._appendElement(t,qt.MATHML):e._insertElement(t,qt.MATHML),t.ackSelfClosing=!0;}(e,t):n===zt.MENU?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML);}(e,t):n!==zt.HEAD&&os(e,t);break;case 5:n===zt.STYLE||n===zt.TITLE?Qn(e,t):n===zt.ASIDE?Jn(e,t):n===zt.SMALL?$n(e,t):n===zt.TABLE?function(e,t){e.treeAdapter.getDocumentMode(e.document)!==Ct.DOCUMENT_MODE.QUIRKS&&e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML),e.framesetOk=!1,e.insertionMode=En;}(e,t):n===zt.EMBED?ts(e,t):n===zt.INPUT?function(e,t){e._reconstructActiveFormattingElements(),e._appendElement(t,qt.HTML);const n=Nt.getTokenAttr(t,Jt.TYPE);n&&n.toLowerCase()===$t||(e.framesetOk=!1),t.ackSelfClosing=!0;}(e,t):n===zt.PARAM||n===zt.TRACK?ns(e,t):n===zt.IMAGE?function(e,t){t.tagName=zt.IMG,ts(e,t);}(e,t):n!==zt.FRAME&&n!==zt.TBODY&&n!==zt.TFOOT&&n!==zt.THEAD&&os(e,t);break;case 6:n===zt.SCRIPT?Qn(e,t):n===zt.CENTER||n===zt.FIGURE||n===zt.FOOTER||n===zt.HEADER||n===zt.HGROUP||n===zt.DIALOG?Jn(e,t):n===zt.BUTTON?function(e,t){e.openElements.hasInScope(zt.BUTTON)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(zt.BUTTON)),e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.framesetOk=!1;}(e,t):n===zt.STRIKE||n===zt.STRONG?$n(e,t):n===zt.APPLET||n===zt.OBJECT?es(e,t):n===zt.KEYGEN?ts(e,t):n===zt.SOURCE?ns(e,t):n===zt.IFRAME?function(e,t){e.framesetOk=!1,e._switchToTextParsing(t,Nt.MODE.RAWTEXT);}(e,t):n===zt.SELECT?function(e,t){e._reconstructActiveFormattingElements(),e._insertElement(t,qt.HTML),e.framesetOk=!1,e.insertionMode===En||e.insertionMode===cn||e.insertionMode===ln||e.insertionMode===mn||e.insertionMode===pn?e.insertionMode=un:e.insertionMode=An;}(e,t):n===zt.OPTION?rs(e,t):os(e,t);break;case 7:n===zt.BGSOUND?Qn(e,t):n===zt.DETAILS||n===zt.ADDRESS||n===zt.ARTICLE||n===zt.SECTION||n===zt.SUMMARY?Jn(e,t):n===zt.LISTING?Zn(e,t):n===zt.MARQUEE?es(e,t):n===zt.NOEMBED?ss(e,t):n!==zt.CAPTION&&os(e,t);break;case 8:n===zt.BASEFONT?Qn(e,t):n===zt.FRAMESET?function(e,t){const n=e.openElements.tryPeekProperlyNestedBodyElement();e.framesetOk&&n&&(e.treeAdapter.detachNode(n),e.openElements.popAllUpToHtmlElement(),e._insertElement(t,qt.HTML),e.insertionMode=Cn);}(e,t):n===zt.FIELDSET?Jn(e,t):n===zt.TEXTAREA?function(e,t){e._insertElement(t,qt.HTML),e.skipNextNewLine=!0,e.tokenizer.state=Nt.MODE.RCDATA,e.originalInsertionMode=e.insertionMode,e.framesetOk=!1,e.insertionMode=Tn;}(e,t):n===zt.TEMPLATE?Qn(e,t):n===zt.NOSCRIPT?e.options.scriptingEnabled?ss(e,t):os(e,t):n===zt.OPTGROUP?rs(e,t):n!==zt.COLGROUP&&os(e,t);break;case 9:n===zt.PLAINTEXT?function(e,t){e.openElements.hasInButtonScope(zt.P)&&e._closePElement(),e._insertElement(t,qt.HTML),e.tokenizer.state=Nt.MODE.PLAINTEXT;}(e,t):os(e,t);break;case 10:n===zt.BLOCKQUOTE||n===zt.FIGCAPTION?Jn(e,t):os(e,t);break;default:os(e,t);}}function Ts(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n));}function Es(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilTagNamePopped(n),e.activeFormattingElements.clearToLastMarker());}function hs(e,t){const n=t.tagName;for(let t=e.openElements.stackTop;t>0;t--){const s=e.openElements.items[t];if(e.treeAdapter.getTagName(s)===n){e.openElements.generateImpliedEndTagsWithExclusion(n),e.openElements.popUntilElementPopped(s);break}if(e._isSpecialElement(s))break}}function cs(e,t){const n=t.tagName;switch(n.length){case 1:n===zt.A||n===zt.B||n===zt.I||n===zt.S||n===zt.U?Un(e,t):n===zt.P?function(e){e.openElements.hasInButtonScope(zt.P)||e._insertFakeElement(zt.P),e._closePElement();}(e):hs(e,t);break;case 2:n===zt.DL||n===zt.UL||n===zt.OL?Ts(e,t):n===zt.LI?function(e){e.openElements.hasInListItemScope(zt.LI)&&(e.openElements.generateImpliedEndTagsWithExclusion(zt.LI),e.openElements.popUntilTagNamePopped(zt.LI));}(e):n===zt.DD||n===zt.DT?function(e,t){const n=t.tagName;e.openElements.hasInScope(n)&&(e.openElements.generateImpliedEndTagsWithExclusion(n),e.openElements.popUntilTagNamePopped(n));}(e,t):n===zt.H1||n===zt.H2||n===zt.H3||n===zt.H4||n===zt.H5||n===zt.H6?function(e){e.openElements.hasNumberedHeaderInScope()&&(e.openElements.generateImpliedEndTags(),e.openElements.popUntilNumberedHeaderPopped());}(e):n===zt.BR?function(e){e._reconstructActiveFormattingElements(),e._insertFakeElement(zt.BR),e.openElements.pop(),e.framesetOk=!1;}(e):n===zt.EM||n===zt.TT?Un(e,t):hs(e,t);break;case 3:n===zt.BIG?Un(e,t):n===zt.DIR||n===zt.DIV||n===zt.NAV||n===zt.PRE?Ts(e,t):hs(e,t);break;case 4:n===zt.BODY?function(e){e.openElements.hasInScope(zt.BODY)&&(e.insertionMode=dn);}(e):n===zt.HTML?function(e,t){e.openElements.hasInScope(zt.BODY)&&(e.insertionMode=dn,e._processToken(t));}(e,t):n===zt.FORM?function(e){const t=e.openElements.tmplCount>0,n=e.formElement;t||(e.formElement=null),(n||t)&&e.openElements.hasInScope(zt.FORM)&&(e.openElements.generateImpliedEndTags(),t?e.openElements.popUntilTagNamePopped(zt.FORM):e.openElements.remove(n));}(e):n===zt.CODE||n===zt.FONT||n===zt.NOBR?Un(e,t):n===zt.MAIN||n===zt.MENU?Ts(e,t):hs(e,t);break;case 5:n===zt.ASIDE?Ts(e,t):n===zt.SMALL?Un(e,t):hs(e,t);break;case 6:n===zt.CENTER||n===zt.FIGURE||n===zt.FOOTER||n===zt.HEADER||n===zt.HGROUP||n===zt.DIALOG?Ts(e,t):n===zt.APPLET||n===zt.OBJECT?Es(e,t):n===zt.STRIKE||n===zt.STRONG?Un(e,t):hs(e,t);break;case 7:n===zt.ADDRESS||n===zt.ARTICLE||n===zt.DETAILS||n===zt.SECTION||n===zt.SUMMARY||n===zt.LISTING?Ts(e,t):n===zt.MARQUEE?Es(e,t):hs(e,t);break;case 8:n===zt.FIELDSET?Ts(e,t):n===zt.TEMPLATE?Xn(e,t):hs(e,t);break;case 10:n===zt.BLOCKQUOTE||n===zt.FIGCAPTION?Ts(e,t):hs(e,t);break;default:hs(e,t);}}function _s(e,t){e.tmplInsertionModeStackTop>-1?Os(e,t):e.stopped=!0;}function ls(e,t){const n=e.openElements.currentTagName;n===zt.TABLE||n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD||n===zt.TR?(e.pendingCharacterTokens=[],e.hasNonWhitespacePendingCharacterToken=!1,e.originalInsertionMode=e.insertionMode,e.insertionMode=hn,e._processToken(t)):As(e,t);}function ms(e,t){const n=t.tagName;switch(n.length){case 2:n===zt.TD||n===zt.TH||n===zt.TR?function(e,t){e.openElements.clearBackToTableContext(),e._insertFakeElement(zt.TBODY),e.insertionMode=ln,e._processToken(t);}(e,t):As(e,t);break;case 3:n===zt.COL?function(e,t){e.openElements.clearBackToTableContext(),e._insertFakeElement(zt.COLGROUP),e.insertionMode=_n,e._processToken(t);}(e,t):As(e,t);break;case 4:n===zt.FORM?function(e,t){e.formElement||0!==e.openElements.tmplCount||(e._insertElement(t,qt.HTML),e.formElement=e.openElements.current,e.openElements.pop());}(e,t):As(e,t);break;case 5:n===zt.TABLE?function(e,t){e.openElements.hasInTableScope(zt.TABLE)&&(e.openElements.popUntilTagNamePopped(zt.TABLE),e._resetInsertionMode(),e._processToken(t));}(e,t):n===zt.STYLE?Qn(e,t):n===zt.TBODY||n===zt.TFOOT||n===zt.THEAD?function(e,t){e.openElements.clearBackToTableContext(),e._insertElement(t,qt.HTML),e.insertionMode=ln;}(e,t):n===zt.INPUT?function(e,t){const n=Nt.getTokenAttr(t,Jt.TYPE);n&&n.toLowerCase()===$t?e._appendElement(t,qt.HTML):As(e,t),t.ackSelfClosing=!0;}(e,t):As(e,t);break;case 6:n===zt.SCRIPT?Qn(e,t):As(e,t);break;case 7:n===zt.CAPTION?function(e,t){e.openElements.clearBackToTableContext(),e.activeFormattingElements.insertMarker(),e._insertElement(t,qt.HTML),e.insertionMode=cn;}(e,t):As(e,t);break;case 8:n===zt.COLGROUP?function(e,t){e.openElements.clearBackToTableContext(),e._insertElement(t,qt.HTML),e.insertionMode=_n;}(e,t):n===zt.TEMPLATE?Qn(e,t):As(e,t);break;default:As(e,t);}}function ps(e,t){const n=t.tagName;n===zt.TABLE?e.openElements.hasInTableScope(zt.TABLE)&&(e.openElements.popUntilTagNamePopped(zt.TABLE),e._resetInsertionMode()):n===zt.TEMPLATE?Xn(e,t):n!==zt.BODY&&n!==zt.CAPTION&&n!==zt.COL&&n!==zt.COLGROUP&&n!==zt.HTML&&n!==zt.TBODY&&n!==zt.TD&&n!==zt.TFOOT&&n!==zt.TH&&n!==zt.THEAD&&n!==zt.TR&&As(e,t);}function As(e,t){const n=e.fosterParentingEnabled;e.fosterParentingEnabled=!0,e._processTokenInBodyMode(t),e.fosterParentingEnabled=n;}function us(e,t){let n=0;if(e.hasNonWhitespacePendingCharacterToken)for(;n<e.pendingCharacterTokens.length;n++)As(e,e.pendingCharacterTokens[n]);else for(;n<e.pendingCharacterTokens.length;n++)e._insertCharacters(e.pendingCharacterTokens[n]);e.insertionMode=e.originalInsertionMode,e._processToken(t);}function Ns(e,t){e.openElements.currentTagName===zt.COLGROUP&&(e.openElements.pop(),e.insertionMode=En,e._processToken(t));}function ds(e,t){const n=t.tagName;n===zt.HTML?as(e,t):n===zt.OPTION?(e.openElements.currentTagName===zt.OPTION&&e.openElements.pop(),e._insertElement(t,qt.HTML)):n===zt.OPTGROUP?(e.openElements.currentTagName===zt.OPTION&&e.openElements.pop(),e.openElements.currentTagName===zt.OPTGROUP&&e.openElements.pop(),e._insertElement(t,qt.HTML)):n===zt.INPUT||n===zt.KEYGEN||n===zt.TEXTAREA||n===zt.SELECT?e.openElements.hasInSelectScope(zt.SELECT)&&(e.openElements.popUntilTagNamePopped(zt.SELECT),e._resetInsertionMode(),n!==zt.SELECT&&e._processToken(t)):n!==zt.SCRIPT&&n!==zt.TEMPLATE||Qn(e,t);}function Cs(e,t){const n=t.tagName;if(n===zt.OPTGROUP){const t=e.openElements.items[e.openElements.stackTop-1],n=t&&e.treeAdapter.getTagName(t);e.openElements.currentTagName===zt.OPTION&&n===zt.OPTGROUP&&e.openElements.pop(),e.openElements.currentTagName===zt.OPTGROUP&&e.openElements.pop();}else n===zt.OPTION?e.openElements.currentTagName===zt.OPTION&&e.openElements.pop():n===zt.SELECT&&e.openElements.hasInSelectScope(zt.SELECT)?(e.openElements.popUntilTagNamePopped(zt.SELECT),e._resetInsertionMode()):n===zt.TEMPLATE&&Xn(e,t);}function Os(e,t){e.openElements.tmplCount>0?(e.openElements.popUntilTagNamePopped(zt.TEMPLATE),e.activeFormattingElements.clearToLastMarker(),e._popTmplInsertionMode(),e._resetInsertionMode(),e._processToken(t)):e.stopped=!0;}function fs(e,t){e.insertionMode=an,e._processToken(t);}function Ss(e,t){e.insertionMode=an,e._processToken(t);}return Ct.TAG_NAMES,Ct.NAMESPACES,e.parse=function(e,t){return new kn(t).parse(e)},e.parseFragment=function(e,t,n){return "string"==typeof e&&(n=t,t=e,e=null),new kn(n).parseFragment(t,e)},Object.defineProperty(e,"__esModule",{value:!0}),e}({});const parse=e.parse;const parseFragment=e.parseFragment;

const docParser = new WeakMap();
function parseDocumentUtil(ownerDocument, html) {
  const doc = parse(html.trim(), getParser(ownerDocument));
  doc.documentElement = doc.firstElementChild;
  doc.head = doc.documentElement.firstElementChild;
  doc.body = doc.head.nextElementSibling;
  return doc;
}
function parseFragmentUtil(ownerDocument, html) {
  if (typeof html === 'string') {
    html = html.trim();
  }
  else {
    html = '';
  }
  const frag = parseFragment(html, getParser(ownerDocument));
  return frag;
}
function getParser(ownerDocument) {
  let parseOptions = docParser.get(ownerDocument);
  if (parseOptions != null) {
    return parseOptions;
  }
  const treeAdapter = {
    createDocument() {
      const doc = ownerDocument.createElement("#document" /* DOCUMENT_NODE */);
      doc['x-mode'] = 'no-quirks';
      return doc;
    },
    setNodeSourceCodeLocation(node, location) {
      node.sourceCodeLocation = location;
    },
    getNodeSourceCodeLocation(node) {
      return node.sourceCodeLocation;
    },
    createDocumentFragment() {
      return ownerDocument.createDocumentFragment();
    },
    createElement(tagName, namespaceURI, attrs) {
      const elm = ownerDocument.createElementNS(namespaceURI, tagName);
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (attr.namespace == null || attr.namespace === 'http://www.w3.org/1999/xhtml') {
          elm.setAttribute(attr.name, attr.value);
        }
        else {
          elm.setAttributeNS(attr.namespace, attr.name, attr.value);
        }
      }
      return elm;
    },
    createCommentNode(data) {
      return ownerDocument.createComment(data);
    },
    appendChild(parentNode, newNode) {
      parentNode.appendChild(newNode);
    },
    insertBefore(parentNode, newNode, referenceNode) {
      parentNode.insertBefore(newNode, referenceNode);
    },
    setTemplateContent(templateElement, contentElement) {
      templateElement.content = contentElement;
    },
    getTemplateContent(templateElement) {
      return templateElement.content;
    },
    setDocumentType(doc, name, publicId, systemId) {
      let doctypeNode = doc.childNodes.find((n) => n.nodeType === 10 /* DOCUMENT_TYPE_NODE */);
      if (doctypeNode == null) {
        doctypeNode = ownerDocument.createDocumentTypeNode();
        doc.insertBefore(doctypeNode, doc.firstChild);
      }
      doctypeNode.nodeValue = '!DOCTYPE';
      doctypeNode['x-name'] = name;
      doctypeNode['x-publicId'] = publicId;
      doctypeNode['x-systemId'] = systemId;
    },
    setDocumentMode(doc, mode) {
      doc['x-mode'] = mode;
    },
    getDocumentMode(doc) {
      return doc['x-mode'];
    },
    detachNode(node) {
      node.remove();
    },
    insertText(parentNode, text) {
      const lastChild = parentNode.lastChild;
      if (lastChild != null && lastChild.nodeType === 3 /* TEXT_NODE */) {
        lastChild.nodeValue += text;
      }
      else {
        parentNode.appendChild(ownerDocument.createTextNode(text));
      }
    },
    insertTextBefore(parentNode, text, referenceNode) {
      const prevNode = parentNode.childNodes[parentNode.childNodes.indexOf(referenceNode) - 1];
      if (prevNode != null && prevNode.nodeType === 3 /* TEXT_NODE */) {
        prevNode.nodeValue += text;
      }
      else {
        parentNode.insertBefore(ownerDocument.createTextNode(text), referenceNode);
      }
    },
    adoptAttributes(recipient, attrs) {
      for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (recipient.hasAttributeNS(attr.namespace, attr.name) === false) {
          recipient.setAttributeNS(attr.namespace, attr.name, attr.value);
        }
      }
    },
    getFirstChild(node) {
      return node.childNodes[0];
    },
    getChildNodes(node) {
      return node.childNodes;
    },
    getParentNode(node) {
      return node.parentNode;
    },
    getAttrList(element) {
      const attrs = element.attributes.__items.map((attr) => {
        return {
          name: attr.name,
          value: attr.value,
          namespace: attr.namespaceURI,
          prefix: null,
        };
      });
      return attrs;
    },
    getTagName(element) {
      if (element.namespaceURI === 'http://www.w3.org/1999/xhtml') {
        return element.nodeName.toLowerCase();
      }
      else {
        return element.nodeName;
      }
    },
    getNamespaceURI(element) {
      return element.namespaceURI;
    },
    getTextNodeContent(textNode) {
      return textNode.nodeValue;
    },
    getCommentNodeContent(commentNode) {
      return commentNode.nodeValue;
    },
    getDocumentTypeNodeName(doctypeNode) {
      return doctypeNode['x-name'];
    },
    getDocumentTypeNodePublicId(doctypeNode) {
      return doctypeNode['x-publicId'];
    },
    getDocumentTypeNodeSystemId(doctypeNode) {
      return doctypeNode['x-systemId'];
    },
    isTextNode(node) {
      return node.nodeType === 3 /* TEXT_NODE */;
    },
    isCommentNode(node) {
      return node.nodeType === 8 /* COMMENT_NODE */;
    },
    isDocumentTypeNode(node) {
      return node.nodeType === 10 /* DOCUMENT_TYPE_NODE */;
    },
    isElementNode(node) {
      return node.nodeType === 1 /* ELEMENT_NODE */;
    },
  };
  parseOptions = {
    treeAdapter: treeAdapter,
  };
  docParser.set(ownerDocument, parseOptions);
  return parseOptions;
}

class MockNode {
  constructor(ownerDocument, nodeType, nodeName, nodeValue) {
    this.ownerDocument = ownerDocument;
    this.nodeType = nodeType;
    this.nodeName = nodeName;
    this._nodeValue = nodeValue;
    this.parentNode = null;
    this.childNodes = [];
  }
  appendChild(newNode) {
    if (newNode.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
      const nodes = newNode.childNodes.slice();
      for (const child of nodes) {
        this.appendChild(child);
      }
    }
    else {
      newNode.remove();
      newNode.parentNode = this;
      this.childNodes.push(newNode);
      connectNode(this.ownerDocument, newNode);
    }
    return newNode;
  }
  append(...items) {
    items.forEach((item) => {
      const isNode = typeof item === 'object' && item !== null && 'nodeType' in item;
      this.appendChild(isNode ? item : this.ownerDocument.createTextNode(String(item)));
    });
  }
  prepend(...items) {
    const firstChild = this.firstChild;
    items.forEach((item) => {
      const isNode = typeof item === 'object' && item !== null && 'nodeType' in item;
      this.insertBefore(isNode ? item : this.ownerDocument.createTextNode(String(item)), firstChild);
    });
  }
  cloneNode(deep) {
    throw new Error(`invalid node type to clone: ${this.nodeType}, deep: ${deep}`);
  }
  compareDocumentPosition(_other) {
    // unimplemented
    // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
    return -1;
  }
  get firstChild() {
    return this.childNodes[0] || null;
  }
  insertBefore(newNode, referenceNode) {
    if (newNode.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
      for (let i = 0, ii = newNode.childNodes.length; i < ii; i++) {
        insertBefore(this, newNode.childNodes[i], referenceNode);
      }
    }
    else {
      insertBefore(this, newNode, referenceNode);
    }
    return newNode;
  }
  get isConnected() {
    let node = this;
    while (node != null) {
      if (node.nodeType === 9 /* DOCUMENT_NODE */) {
        return true;
      }
      node = node.parentNode;
      if (node != null && node.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */) {
        node = node.host;
      }
    }
    return false;
  }
  isSameNode(node) {
    return this === node;
  }
  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] || null;
  }
  get nextSibling() {
    if (this.parentNode != null) {
      const index = this.parentNode.childNodes.indexOf(this) + 1;
      return this.parentNode.childNodes[index] || null;
    }
    return null;
  }
  get nodeValue() {
    return this._nodeValue;
  }
  set nodeValue(value) {
    this._nodeValue = value;
  }
  get parentElement() {
    return this.parentNode || null;
  }
  set parentElement(value) {
    this.parentNode = value;
  }
  get previousSibling() {
    if (this.parentNode != null) {
      const index = this.parentNode.childNodes.indexOf(this) - 1;
      return this.parentNode.childNodes[index] || null;
    }
    return null;
  }
  contains(otherNode) {
    if (otherNode === this) {
      return true;
    }
    const childNodes = Array.from(this.childNodes);
    if (childNodes.includes(otherNode)) {
      return true;
    }
    return childNodes.some((node) => this.contains.bind(node)(otherNode));
  }
  removeChild(childNode) {
    const index = this.childNodes.indexOf(childNode);
    if (index > -1) {
      this.childNodes.splice(index, 1);
      if (this.nodeType === 1 /* ELEMENT_NODE */) {
        const wasConnected = this.isConnected;
        childNode.parentNode = null;
        if (wasConnected === true) {
          disconnectNode(childNode);
        }
      }
      else {
        childNode.parentNode = null;
      }
    }
    else {
      throw new Error(`node not found within childNodes during removeChild`);
    }
    return childNode;
  }
  remove() {
    if (this.parentNode != null) {
      this.parentNode.removeChild(this);
    }
  }
  replaceChild(newChild, oldChild) {
    if (oldChild.parentNode === this) {
      this.insertBefore(newChild, oldChild);
      oldChild.remove();
      return newChild;
    }
    return null;
  }
  get textContent() {
    return this._nodeValue;
  }
  set textContent(value) {
    this._nodeValue = String(value);
  }
}
MockNode.ELEMENT_NODE = 1;
MockNode.TEXT_NODE = 3;
MockNode.PROCESSING_INSTRUCTION_NODE = 7;
MockNode.COMMENT_NODE = 8;
MockNode.DOCUMENT_NODE = 9;
MockNode.DOCUMENT_TYPE_NODE = 10;
MockNode.DOCUMENT_FRAGMENT_NODE = 11;
class MockNodeList {
  constructor(ownerDocument, childNodes, length) {
    this.ownerDocument = ownerDocument;
    this.childNodes = childNodes;
    this.length = length;
  }
}
class MockElement extends MockNode {
  constructor(ownerDocument, nodeName) {
    super(ownerDocument, 1 /* ELEMENT_NODE */, typeof nodeName === 'string' ? nodeName : null, null);
    this.namespaceURI = null;
  }
  addEventListener(type, handler) {
    addEventListener(this, type, handler);
  }
  attachShadow(_opts) {
    const shadowRoot = this.ownerDocument.createDocumentFragment();
    this.shadowRoot = shadowRoot;
    return shadowRoot;
  }
  blur() {
    /**/
  }
  get shadowRoot() {
    return this.__shadowRoot || null;
  }
  set shadowRoot(shadowRoot) {
    if (shadowRoot != null) {
      shadowRoot.host = this;
      this.__shadowRoot = shadowRoot;
    }
    else {
      delete this.__shadowRoot;
    }
  }
  get attributes() {
    if (this.__attributeMap == null) {
      this.__attributeMap = createAttributeProxy(false);
    }
    return this.__attributeMap;
  }
  set attributes(attrs) {
    this.__attributeMap = attrs;
  }
  get children() {
    return this.childNodes.filter((n) => n.nodeType === 1 /* ELEMENT_NODE */);
  }
  get childElementCount() {
    return this.childNodes.filter((n) => n.nodeType === 1 /* ELEMENT_NODE */).length;
  }
  get className() {
    return this.getAttributeNS(null, 'class') || '';
  }
  set className(value) {
    this.setAttributeNS(null, 'class', value);
  }
  get classList() {
    return new MockClassList(this);
  }
  click() {
    dispatchEvent(this, new MockEvent('click', { bubbles: true, cancelable: true, composed: true }));
  }
  cloneNode(_deep) {
    // implemented on MockElement.prototype from within element.ts
    return null;
  }
  closest(selector) {
    let elm = this;
    while (elm != null) {
      if (elm.matches(selector)) {
        return elm;
      }
      elm = elm.parentNode;
    }
    return null;
  }
  get dataset() {
    return dataset(this);
  }
  get dir() {
    return this.getAttributeNS(null, 'dir') || '';
  }
  set dir(value) {
    this.setAttributeNS(null, 'dir', value);
  }
  dispatchEvent(ev) {
    return dispatchEvent(this, ev);
  }
  get firstElementChild() {
    return this.children[0] || null;
  }
  focus(_options) { }
  getAttribute(attrName) {
    if (attrName === 'style') {
      if (this.__style != null && this.__style.length > 0) {
        return this.style.cssText;
      }
      return null;
    }
    const attr = this.attributes.getNamedItem(attrName);
    if (attr != null) {
      return attr.value;
    }
    return null;
  }
  getAttributeNS(namespaceURI, attrName) {
    const attr = this.attributes.getNamedItemNS(namespaceURI, attrName);
    if (attr != null) {
      return attr.value;
    }
    return null;
  }
  getBoundingClientRect() {
    return { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0, x: 0, y: 0 };
  }
  getRootNode(opts) {
    const isComposed = opts != null && opts.composed === true;
    let node = this;
    while (node.parentNode != null) {
      node = node.parentNode;
      if (isComposed === true && node.parentNode == null && node.host != null) {
        node = node.host;
      }
    }
    return node;
  }
  get draggable() {
    return this.getAttributeNS(null, 'draggable') === 'true';
  }
  set draggable(value) {
    this.setAttributeNS(null, 'draggable', value);
  }
  hasChildNodes() {
    return this.childNodes.length > 0;
  }
  get id() {
    return this.getAttributeNS(null, 'id') || '';
  }
  set id(value) {
    this.setAttributeNS(null, 'id', value);
  }
  get innerHTML() {
    if (this.childNodes.length === 0) {
      return '';
    }
    return serializeNodeToHtml(this, {
      newLines: false,
      indentSpaces: 0,
    });
  }
  set innerHTML(html) {
    if (NON_ESCAPABLE_CONTENT.has(this.nodeName) === true) {
      setTextContent(this, html);
    }
    else {
      for (let i = this.childNodes.length - 1; i >= 0; i--) {
        this.removeChild(this.childNodes[i]);
      }
      if (typeof html === 'string') {
        const frag = parseFragmentUtil(this.ownerDocument, html);
        while (frag.childNodes.length > 0) {
          this.appendChild(frag.childNodes[0]);
        }
      }
    }
  }
  get innerText() {
    const text = [];
    getTextContent(this.childNodes, text);
    return text.join('');
  }
  set innerText(value) {
    setTextContent(this, value);
  }
  insertAdjacentElement(position, elm) {
    if (position === 'beforebegin') {
      insertBefore(this.parentNode, elm, this);
    }
    else if (position === 'afterbegin') {
      this.prepend(elm);
    }
    else if (position === 'beforeend') {
      this.appendChild(elm);
    }
    else if (position === 'afterend') {
      insertBefore(this.parentNode, elm, this.nextSibling);
    }
    return elm;
  }
  insertAdjacentHTML(position, html) {
    const frag = parseFragmentUtil(this.ownerDocument, html);
    if (position === 'beforebegin') {
      while (frag.childNodes.length > 0) {
        insertBefore(this.parentNode, frag.childNodes[0], this);
      }
    }
    else if (position === 'afterbegin') {
      while (frag.childNodes.length > 0) {
        this.prepend(frag.childNodes[frag.childNodes.length - 1]);
      }
    }
    else if (position === 'beforeend') {
      while (frag.childNodes.length > 0) {
        this.appendChild(frag.childNodes[0]);
      }
    }
    else if (position === 'afterend') {
      while (frag.childNodes.length > 0) {
        insertBefore(this.parentNode, frag.childNodes[frag.childNodes.length - 1], this.nextSibling);
      }
    }
  }
  insertAdjacentText(position, text) {
    const elm = this.ownerDocument.createTextNode(text);
    if (position === 'beforebegin') {
      insertBefore(this.parentNode, elm, this);
    }
    else if (position === 'afterbegin') {
      this.prepend(elm);
    }
    else if (position === 'beforeend') {
      this.appendChild(elm);
    }
    else if (position === 'afterend') {
      insertBefore(this.parentNode, elm, this.nextSibling);
    }
  }
  hasAttribute(attrName) {
    if (attrName === 'style') {
      return this.__style != null && this.__style.length > 0;
    }
    return this.getAttribute(attrName) !== null;
  }
  hasAttributeNS(namespaceURI, name) {
    return this.getAttributeNS(namespaceURI, name) !== null;
  }
  get hidden() {
    return this.hasAttributeNS(null, 'hidden');
  }
  set hidden(isHidden) {
    if (isHidden === true) {
      this.setAttributeNS(null, 'hidden', '');
    }
    else {
      this.removeAttributeNS(null, 'hidden');
    }
  }
  get lang() {
    return this.getAttributeNS(null, 'lang') || '';
  }
  set lang(value) {
    this.setAttributeNS(null, 'lang', value);
  }
  get lastElementChild() {
    const children = this.children;
    return children[children.length - 1] || null;
  }
  matches(selector) {
    return matches(selector, this);
  }
  get nextElementSibling() {
    const parentElement = this.parentElement;
    if (parentElement != null &&
      (parentElement.nodeType === 1 /* ELEMENT_NODE */ ||
        parentElement.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */ ||
        parentElement.nodeType === 9 /* DOCUMENT_NODE */)) {
      const children = parentElement.children;
      const index = children.indexOf(this) + 1;
      return parentElement.children[index] || null;
    }
    return null;
  }
  get outerHTML() {
    return serializeNodeToHtml(this, {
      newLines: false,
      outerHtml: true,
      indentSpaces: 0,
    });
  }
  get previousElementSibling() {
    const parentElement = this.parentElement;
    if (parentElement != null &&
      (parentElement.nodeType === 1 /* ELEMENT_NODE */ ||
        parentElement.nodeType === 11 /* DOCUMENT_FRAGMENT_NODE */ ||
        parentElement.nodeType === 9 /* DOCUMENT_NODE */)) {
      const children = parentElement.children;
      const index = children.indexOf(this) - 1;
      return parentElement.children[index] || null;
    }
    return null;
  }
  getElementsByClassName(classNames) {
    const classes = classNames
      .trim()
      .split(' ')
      .filter((c) => c.length > 0);
    const results = [];
    getElementsByClassName(this, classes, results);
    return results;
  }
  getElementsByTagName(tagName) {
    const results = [];
    getElementsByTagName(this, tagName.toLowerCase(), results);
    return results;
  }
  querySelector(selector) {
    return selectOne(selector, this);
  }
  querySelectorAll(selector) {
    return selectAll(selector, this);
  }
  removeAttribute(attrName) {
    if (attrName === 'style') {
      delete this.__style;
    }
    else {
      const attr = this.attributes.getNamedItem(attrName);
      if (attr != null) {
        this.attributes.removeNamedItemNS(attr);
        if (checkAttributeChanged(this) === true) {
          attributeChanged(this, attrName, attr.value, null);
        }
      }
    }
  }
  removeAttributeNS(namespaceURI, attrName) {
    const attr = this.attributes.getNamedItemNS(namespaceURI, attrName);
    if (attr != null) {
      this.attributes.removeNamedItemNS(attr);
      if (checkAttributeChanged(this) === true) {
        attributeChanged(this, attrName, attr.value, null);
      }
    }
  }
  removeEventListener(type, handler) {
    removeEventListener(this, type, handler);
  }
  setAttribute(attrName, value) {
    if (attrName === 'style') {
      this.style = value;
    }
    else {
      const attributes = this.attributes;
      let attr = attributes.getNamedItem(attrName);
      const checkAttrChanged = checkAttributeChanged(this);
      if (attr != null) {
        if (checkAttrChanged === true) {
          const oldValue = attr.value;
          attr.value = value;
          if (oldValue !== attr.value) {
            attributeChanged(this, attr.name, oldValue, attr.value);
          }
        }
        else {
          attr.value = value;
        }
      }
      else {
        if (attributes.caseInsensitive) {
          attrName = attrName.toLowerCase();
        }
        attr = new MockAttr(attrName, value);
        attributes.__items.push(attr);
        if (checkAttrChanged === true) {
          attributeChanged(this, attrName, null, attr.value);
        }
      }
    }
  }
  setAttributeNS(namespaceURI, attrName, value) {
    const attributes = this.attributes;
    let attr = attributes.getNamedItemNS(namespaceURI, attrName);
    const checkAttrChanged = checkAttributeChanged(this);
    if (attr != null) {
      if (checkAttrChanged === true) {
        const oldValue = attr.value;
        attr.value = value;
        if (oldValue !== attr.value) {
          attributeChanged(this, attr.name, oldValue, attr.value);
        }
      }
      else {
        attr.value = value;
      }
    }
    else {
      attr = new MockAttr(attrName, value, namespaceURI);
      attributes.__items.push(attr);
      if (checkAttrChanged === true) {
        attributeChanged(this, attrName, null, attr.value);
      }
    }
  }
  get style() {
    if (this.__style == null) {
      this.__style = createCSSStyleDeclaration();
    }
    return this.__style;
  }
  set style(val) {
    if (typeof val === 'string') {
      if (this.__style == null) {
        this.__style = createCSSStyleDeclaration();
      }
      this.__style.cssText = val;
    }
    else {
      this.__style = val;
    }
  }
  get tabIndex() {
    return parseInt(this.getAttributeNS(null, 'tabindex') || '-1', 10);
  }
  set tabIndex(value) {
    this.setAttributeNS(null, 'tabindex', value);
  }
  get tagName() {
    return this.nodeName;
  }
  set tagName(value) {
    this.nodeName = value;
  }
  get textContent() {
    const text = [];
    getTextContent(this.childNodes, text);
    return text.join('');
  }
  set textContent(value) {
    setTextContent(this, value);
  }
  get title() {
    return this.getAttributeNS(null, 'title') || '';
  }
  set title(value) {
    this.setAttributeNS(null, 'title', value);
  }
  onanimationstart() {
    /**/
  }
  onanimationend() {
    /**/
  }
  onanimationiteration() {
    /**/
  }
  onabort() {
    /**/
  }
  onauxclick() {
    /**/
  }
  onbeforecopy() {
    /**/
  }
  onbeforecut() {
    /**/
  }
  onbeforepaste() {
    /**/
  }
  onblur() {
    /**/
  }
  oncancel() {
    /**/
  }
  oncanplay() {
    /**/
  }
  oncanplaythrough() {
    /**/
  }
  onchange() {
    /**/
  }
  onclick() {
    /**/
  }
  onclose() {
    /**/
  }
  oncontextmenu() {
    /**/
  }
  oncopy() {
    /**/
  }
  oncuechange() {
    /**/
  }
  oncut() {
    /**/
  }
  ondblclick() {
    /**/
  }
  ondrag() {
    /**/
  }
  ondragend() {
    /**/
  }
  ondragenter() {
    /**/
  }
  ondragleave() {
    /**/
  }
  ondragover() {
    /**/
  }
  ondragstart() {
    /**/
  }
  ondrop() {
    /**/
  }
  ondurationchange() {
    /**/
  }
  onemptied() {
    /**/
  }
  onended() {
    /**/
  }
  onerror() {
    /**/
  }
  onfocus() {
    /**/
  }
  onfocusin() {
    /**/
  }
  onfocusout() {
    /**/
  }
  onformdata() {
    /**/
  }
  onfullscreenchange() {
    /**/
  }
  onfullscreenerror() {
    /**/
  }
  ongotpointercapture() {
    /**/
  }
  oninput() {
    /**/
  }
  oninvalid() {
    /**/
  }
  onkeydown() {
    /**/
  }
  onkeypress() {
    /**/
  }
  onkeyup() {
    /**/
  }
  onload() {
    /**/
  }
  onloadeddata() {
    /**/
  }
  onloadedmetadata() {
    /**/
  }
  onloadstart() {
    /**/
  }
  onlostpointercapture() {
    /**/
  }
  onmousedown() {
    /**/
  }
  onmouseenter() {
    /**/
  }
  onmouseleave() {
    /**/
  }
  onmousemove() {
    /**/
  }
  onmouseout() {
    /**/
  }
  onmouseover() {
    /**/
  }
  onmouseup() {
    /**/
  }
  onmousewheel() {
    /**/
  }
  onpaste() {
    /**/
  }
  onpause() {
    /**/
  }
  onplay() {
    /**/
  }
  onplaying() {
    /**/
  }
  onpointercancel() {
    /**/
  }
  onpointerdown() {
    /**/
  }
  onpointerenter() {
    /**/
  }
  onpointerleave() {
    /**/
  }
  onpointermove() {
    /**/
  }
  onpointerout() {
    /**/
  }
  onpointerover() {
    /**/
  }
  onpointerup() {
    /**/
  }
  onprogress() {
    /**/
  }
  onratechange() {
    /**/
  }
  onreset() {
    /**/
  }
  onresize() {
    /**/
  }
  onscroll() {
    /**/
  }
  onsearch() {
    /**/
  }
  onseeked() {
    /**/
  }
  onseeking() {
    /**/
  }
  onselect() {
    /**/
  }
  onselectstart() {
    /**/
  }
  onstalled() {
    /**/
  }
  onsubmit() {
    /**/
  }
  onsuspend() {
    /**/
  }
  ontimeupdate() {
    /**/
  }
  ontoggle() {
    /**/
  }
  onvolumechange() {
    /**/
  }
  onwaiting() {
    /**/
  }
  onwebkitfullscreenchange() {
    /**/
  }
  onwebkitfullscreenerror() {
    /**/
  }
  onwheel() {
    /**/
  }
  toString(opts) {
    return serializeNodeToHtml(this, opts);
  }
}
function getElementsByClassName(elm, classNames, foundElms) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    for (let j = 0, jj = classNames.length; j < jj; j++) {
      if (childElm.classList.contains(classNames[j])) {
        foundElms.push(childElm);
      }
    }
    getElementsByClassName(childElm, classNames, foundElms);
  }
}
function getElementsByTagName(elm, tagName, foundElms) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (tagName === '*' || childElm.nodeName.toLowerCase() === tagName) {
      foundElms.push(childElm);
    }
    getElementsByTagName(childElm, tagName, foundElms);
  }
}
function resetElement(elm) {
  resetEventListeners(elm);
  delete elm.__attributeMap;
  delete elm.__shadowRoot;
  delete elm.__style;
}
function insertBefore(parentNode, newNode, referenceNode) {
  if (newNode !== referenceNode) {
    newNode.remove();
    newNode.parentNode = parentNode;
    newNode.ownerDocument = parentNode.ownerDocument;
    if (referenceNode != null) {
      const index = parentNode.childNodes.indexOf(referenceNode);
      if (index > -1) {
        parentNode.childNodes.splice(index, 0, newNode);
      }
      else {
        throw new Error(`referenceNode not found in parentNode.childNodes`);
      }
    }
    else {
      parentNode.childNodes.push(newNode);
    }
    connectNode(parentNode.ownerDocument, newNode);
  }
  return newNode;
}
class MockHTMLElement extends MockElement {
  constructor(ownerDocument, nodeName) {
    super(ownerDocument, typeof nodeName === 'string' ? nodeName.toUpperCase() : null);
    this.namespaceURI = 'http://www.w3.org/1999/xhtml';
  }
  get tagName() {
    return this.nodeName;
  }
  set tagName(value) {
    this.nodeName = value;
  }
  get attributes() {
    if (this.__attributeMap == null) {
      this.__attributeMap = createAttributeProxy(true);
    }
    return this.__attributeMap;
  }
  set attributes(attrs) {
    this.__attributeMap = attrs;
  }
}
class MockTextNode extends MockNode {
  constructor(ownerDocument, text) {
    super(ownerDocument, 3 /* TEXT_NODE */, "#text" /* TEXT_NODE */, text);
  }
  cloneNode(_deep) {
    return new MockTextNode(null, this.nodeValue);
  }
  get textContent() {
    return this.nodeValue;
  }
  set textContent(text) {
    this.nodeValue = text;
  }
  get data() {
    return this.nodeValue;
  }
  set data(text) {
    this.nodeValue = text;
  }
  get wholeText() {
    if (this.parentNode != null) {
      const text = [];
      for (let i = 0, ii = this.parentNode.childNodes.length; i < ii; i++) {
        const childNode = this.parentNode.childNodes[i];
        if (childNode.nodeType === 3 /* TEXT_NODE */) {
          text.push(childNode.nodeValue);
        }
      }
      return text.join('');
    }
    return this.nodeValue;
  }
}
function getTextContent(childNodes, text) {
  for (let i = 0, ii = childNodes.length; i < ii; i++) {
    const childNode = childNodes[i];
    if (childNode.nodeType === 3 /* TEXT_NODE */) {
      text.push(childNode.nodeValue);
    }
    else if (childNode.nodeType === 1 /* ELEMENT_NODE */) {
      getTextContent(childNode.childNodes, text);
    }
  }
}
function setTextContent(elm, text) {
  for (let i = elm.childNodes.length - 1; i >= 0; i--) {
    elm.removeChild(elm.childNodes[i]);
  }
  const textNode = new MockTextNode(elm.ownerDocument, text);
  elm.appendChild(textNode);
}

class MockComment extends MockNode {
  constructor(ownerDocument, data) {
    super(ownerDocument, 8 /* COMMENT_NODE */, "#comment" /* COMMENT_NODE */, data);
  }
  cloneNode(_deep) {
    return new MockComment(null, this.nodeValue);
  }
  get textContent() {
    return this.nodeValue;
  }
  set textContent(text) {
    this.nodeValue = text;
  }
}

class MockDocumentFragment extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, null);
    this.nodeName = "#document-fragment" /* DOCUMENT_FRAGMENT_NODE */;
    this.nodeType = 11 /* DOCUMENT_FRAGMENT_NODE */;
  }
  getElementById(id) {
    return getElementById(this, id);
  }
  cloneNode(deep) {
    const cloned = new MockDocumentFragment(null);
    if (deep) {
      for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
        const childNode = this.childNodes[i];
        if (childNode.nodeType === 1 /* ELEMENT_NODE */ ||
          childNode.nodeType === 3 /* TEXT_NODE */ ||
          childNode.nodeType === 8 /* COMMENT_NODE */) {
          const clonedChildNode = this.childNodes[i].cloneNode(true);
          cloned.appendChild(clonedChildNode);
        }
      }
    }
    return cloned;
  }
}

class MockDocumentTypeNode extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, '!DOCTYPE');
    this.nodeType = 10 /* DOCUMENT_TYPE_NODE */;
    this.setAttribute('html', '');
  }
}

class MockCSSRule {
  constructor(parentStyleSheet) {
    this.parentStyleSheet = parentStyleSheet;
    this.cssText = '';
    this.type = 0;
  }
}
class MockCSSStyleSheet {
  constructor(ownerNode) {
    this.type = 'text/css';
    this.parentStyleSheet = null;
    this.cssRules = [];
    this.ownerNode = ownerNode;
  }
  get rules() {
    return this.cssRules;
  }
  set rules(rules) {
    this.cssRules = rules;
  }
  deleteRule(index) {
    if (index >= 0 && index < this.cssRules.length) {
      this.cssRules.splice(index, 1);
      updateStyleTextNode(this.ownerNode);
    }
  }
  insertRule(rule, index = 0) {
    if (typeof index !== 'number') {
      index = 0;
    }
    if (index < 0) {
      index = 0;
    }
    if (index > this.cssRules.length) {
      index = this.cssRules.length;
    }
    const cssRule = new MockCSSRule(this);
    cssRule.cssText = rule;
    this.cssRules.splice(index, 0, cssRule);
    updateStyleTextNode(this.ownerNode);
    return index;
  }
}
function getStyleElementText(styleElm) {
  const output = [];
  for (let i = 0; i < styleElm.childNodes.length; i++) {
    output.push(styleElm.childNodes[i].nodeValue);
  }
  return output.join('');
}
function setStyleElementText(styleElm, text) {
  // keeping the innerHTML and the sheet.cssRules connected
  // is not technically correct, but since we're doing
  // SSR we'll need to turn any assigned cssRules into
  // real text, not just properties that aren't rendered
  const sheet = styleElm.sheet;
  sheet.cssRules.length = 0;
  sheet.insertRule(text);
  updateStyleTextNode(styleElm);
}
function updateStyleTextNode(styleElm) {
  const childNodeLen = styleElm.childNodes.length;
  if (childNodeLen > 1) {
    for (let i = childNodeLen - 1; i >= 1; i--) {
      styleElm.removeChild(styleElm.childNodes[i]);
    }
  }
  else if (childNodeLen < 1) {
    styleElm.appendChild(styleElm.ownerDocument.createTextNode(''));
  }
  const textNode = styleElm.childNodes[0];
  textNode.nodeValue = styleElm.sheet.cssRules.map((r) => r.cssText).join('\n');
}

function createElement(ownerDocument, tagName) {
  if (typeof tagName !== 'string' || tagName === '' || !/^[a-z0-9-_:]+$/i.test(tagName)) {
    throw new Error(`The tag name provided (${tagName}) is not a valid name.`);
  }
  tagName = tagName.toLowerCase();
  switch (tagName) {
    case 'a':
      return new MockAnchorElement(ownerDocument);
    case 'base':
      return new MockBaseElement(ownerDocument);
    case 'button':
      return new MockButtonElement(ownerDocument);
    case 'canvas':
      return new MockCanvasElement(ownerDocument);
    case 'form':
      return new MockFormElement(ownerDocument);
    case 'img':
      return new MockImageElement(ownerDocument);
    case 'input':
      return new MockInputElement(ownerDocument);
    case 'link':
      return new MockLinkElement(ownerDocument);
    case 'meta':
      return new MockMetaElement(ownerDocument);
    case 'script':
      return new MockScriptElement(ownerDocument);
    case 'style':
      return new MockStyleElement(ownerDocument);
    case 'template':
      return new MockTemplateElement(ownerDocument);
    case 'title':
      return new MockTitleElement(ownerDocument);
  }
  if (ownerDocument != null && tagName.includes('-')) {
    const win = ownerDocument.defaultView;
    if (win != null && win.customElements != null) {
      return createCustomElement(win.customElements, ownerDocument, tagName);
    }
  }
  return new MockHTMLElement(ownerDocument, tagName);
}
function createElementNS(ownerDocument, namespaceURI, tagName) {
  if (namespaceURI === 'http://www.w3.org/1999/xhtml') {
    return createElement(ownerDocument, tagName);
  }
  else if (namespaceURI === 'http://www.w3.org/2000/svg') {
    switch (tagName.toLowerCase()) {
      case 'text':
      case 'tspan':
      case 'tref':
      case 'altglyph':
      case 'textpath':
        return new MockSVGTextContentElement(ownerDocument, tagName);
      case 'circle':
      case 'ellipse':
      case 'image':
      case 'line':
      case 'path':
      case 'polygon':
      case 'polyline':
      case 'rect':
      case 'use':
        return new MockSVGGraphicsElement(ownerDocument, tagName);
      case 'svg':
        return new MockSVGSVGElement(ownerDocument, tagName);
      default:
        return new MockSVGElement(ownerDocument, tagName);
    }
  }
  else {
    return new MockElement(ownerDocument, tagName);
  }
}
class MockAnchorElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'a');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
  get pathname() {
    return new URL(this.href).pathname;
  }
}
class MockButtonElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'button');
  }
}
patchPropAttributes(MockButtonElement.prototype, {
  type: String,
}, {
  type: 'submit',
});
class MockImageElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'img');
  }
  get draggable() {
    return this.getAttributeNS(null, 'draggable') !== 'false';
  }
  set draggable(value) {
    this.setAttributeNS(null, 'draggable', value);
  }
  get src() {
    return fullUrl(this, 'src');
  }
  set src(value) {
    this.setAttribute('src', value);
  }
}
patchPropAttributes(MockImageElement.prototype, {
  height: Number,
  width: Number,
});
class MockInputElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'input');
  }
  get list() {
    const listId = this.getAttribute('list');
    if (listId) {
      return this.ownerDocument.getElementById(listId);
    }
    return null;
  }
}
patchPropAttributes(MockInputElement.prototype, {
  accept: String,
  autocomplete: String,
  autofocus: Boolean,
  capture: String,
  checked: Boolean,
  disabled: Boolean,
  form: String,
  formaction: String,
  formenctype: String,
  formmethod: String,
  formnovalidate: String,
  formtarget: String,
  height: Number,
  inputmode: String,
  max: String,
  maxLength: Number,
  min: String,
  minLength: Number,
  multiple: Boolean,
  name: String,
  pattern: String,
  placeholder: String,
  required: Boolean,
  readOnly: Boolean,
  size: Number,
  spellCheck: Boolean,
  src: String,
  step: String,
  type: String,
  value: String,
  width: Number,
}, {
  type: 'text',
});
class MockFormElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'form');
  }
}
patchPropAttributes(MockFormElement.prototype, {
  name: String,
});
class MockLinkElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'link');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
patchPropAttributes(MockLinkElement.prototype, {
  crossorigin: String,
  media: String,
  rel: String,
  type: String,
});
class MockMetaElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'meta');
  }
}
patchPropAttributes(MockMetaElement.prototype, {
  charset: String,
  content: String,
  name: String,
});
class MockScriptElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'script');
  }
  get src() {
    return fullUrl(this, 'src');
  }
  set src(value) {
    this.setAttribute('src', value);
  }
}
patchPropAttributes(MockScriptElement.prototype, {
  type: String,
});
class MockDOMMatrix {
  constructor() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
    this.m11 = 1;
    this.m12 = 0;
    this.m13 = 0;
    this.m14 = 0;
    this.m21 = 0;
    this.m22 = 1;
    this.m23 = 0;
    this.m24 = 0;
    this.m31 = 0;
    this.m32 = 0;
    this.m33 = 1;
    this.m34 = 0;
    this.m41 = 0;
    this.m42 = 0;
    this.m43 = 0;
    this.m44 = 1;
    this.is2D = true;
    this.isIdentity = true;
  }
  static fromMatrix() {
    return new MockDOMMatrix();
  }
  inverse() {
    return new MockDOMMatrix();
  }
  flipX() {
    return new MockDOMMatrix();
  }
  flipY() {
    return new MockDOMMatrix();
  }
  multiply() {
    return new MockDOMMatrix();
  }
  rotate() {
    return new MockDOMMatrix();
  }
  rotateAxisAngle() {
    return new MockDOMMatrix();
  }
  rotateFromVector() {
    return new MockDOMMatrix();
  }
  scale() {
    return new MockDOMMatrix();
  }
  scaleNonUniform() {
    return new MockDOMMatrix();
  }
  skewX() {
    return new MockDOMMatrix();
  }
  skewY() {
    return new MockDOMMatrix();
  }
  toJSON() { }
  toString() { }
  transformPoint() {
    return new MockDOMPoint();
  }
  translate() {
    return new MockDOMMatrix();
  }
}
class MockDOMPoint {
  constructor() {
    this.w = 1;
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
  toJSON() { }
  matrixTransform() {
    return new MockDOMMatrix();
  }
}
class MockSVGRect {
  constructor() {
    this.height = 10;
    this.width = 10;
    this.x = 0;
    this.y = 0;
  }
}
class MockStyleElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'style');
    this.sheet = new MockCSSStyleSheet(this);
  }
  get innerHTML() {
    return getStyleElementText(this);
  }
  set innerHTML(value) {
    setStyleElementText(this, value);
  }
  get innerText() {
    return getStyleElementText(this);
  }
  set innerText(value) {
    setStyleElementText(this, value);
  }
  get textContent() {
    return getStyleElementText(this);
  }
  set textContent(value) {
    setStyleElementText(this, value);
  }
}
class MockSVGElement extends MockElement {
  // SVGElement properties and methods
  get ownerSVGElement() {
    return null;
  }
  get viewportElement() {
    return null;
  }
  onunload() {
    /**/
  }
  // SVGGeometryElement properties and methods
  get pathLength() {
    return 0;
  }
  isPointInFill(_pt) {
    return false;
  }
  isPointInStroke(_pt) {
    return false;
  }
  getTotalLength() {
    return 0;
  }
}
class MockSVGGraphicsElement extends MockSVGElement {
  getBBox(_options) {
    return new MockSVGRect();
  }
  getCTM() {
    return new MockDOMMatrix();
  }
  getScreenCTM() {
    return new MockDOMMatrix();
  }
}
class MockSVGSVGElement extends MockSVGGraphicsElement {
  createSVGPoint() {
    return new MockDOMPoint();
  }
}
class MockSVGTextContentElement extends MockSVGGraphicsElement {
  getComputedTextLength() {
    return 0;
  }
}
class MockBaseElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'base');
  }
  get href() {
    return fullUrl(this, 'href');
  }
  set href(value) {
    this.setAttribute('href', value);
  }
}
class MockTemplateElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'template');
    this.content = new MockDocumentFragment(ownerDocument);
  }
  get innerHTML() {
    return this.content.innerHTML;
  }
  set innerHTML(html) {
    this.content.innerHTML = html;
  }
  cloneNode(deep) {
    const cloned = new MockTemplateElement(null);
    cloned.attributes = cloneAttributes(this.attributes);
    const styleCssText = this.getAttribute('style');
    if (styleCssText != null && styleCssText.length > 0) {
      cloned.setAttribute('style', styleCssText);
    }
    cloned.content = this.content.cloneNode(deep);
    if (deep) {
      for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
        const clonedChildNode = this.childNodes[i].cloneNode(true);
        cloned.appendChild(clonedChildNode);
      }
    }
    return cloned;
  }
}
class MockTitleElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'title');
  }
  get text() {
    return this.textContent;
  }
  set text(value) {
    this.textContent = value;
  }
}
class MockCanvasElement extends MockHTMLElement {
  constructor(ownerDocument) {
    super(ownerDocument, 'canvas');
  }
  getContext() {
    return {
      fillRect() {
        return;
      },
      clearRect() { },
      getImageData: function (_, __, w, h) {
        return {
          data: new Array(w * h * 4),
        };
      },
      putImageData() { },
      createImageData: function () {
        return [];
      },
      setTransform() { },
      drawImage() { },
      save() { },
      fillText() { },
      restore() { },
      beginPath() { },
      moveTo() { },
      lineTo() { },
      closePath() { },
      stroke() { },
      translate() { },
      scale() { },
      rotate() { },
      arc() { },
      fill() { },
      measureText() {
        return { width: 0 };
      },
      transform() { },
      rect() { },
      clip() { },
    };
  }
}
function fullUrl(elm, attrName) {
  const val = elm.getAttribute(attrName) || '';
  if (elm.ownerDocument != null) {
    const win = elm.ownerDocument.defaultView;
    if (win != null) {
      const loc = win.location;
      if (loc != null) {
        try {
          const url = new URL(val, loc.href);
          return url.href;
        }
        catch (e) { }
      }
    }
  }
  return val.replace(/\'|\"/g, '').trim();
}
function patchPropAttributes(prototype, attrs, defaults = {}) {
  Object.keys(attrs).forEach((propName) => {
    const attr = attrs[propName];
    const defaultValue = defaults[propName];
    if (attr === Boolean) {
      Object.defineProperty(prototype, propName, {
        get() {
          return this.hasAttribute(propName);
        },
        set(value) {
          if (value) {
            this.setAttribute(propName, '');
          }
          else {
            this.removeAttribute(propName);
          }
        },
      });
    }
    else if (attr === Number) {
      Object.defineProperty(prototype, propName, {
        get() {
          const value = this.getAttribute(propName);
          return value ? parseInt(value, 10) : defaultValue === undefined ? 0 : defaultValue;
        },
        set(value) {
          this.setAttribute(propName, value);
        },
      });
    }
    else {
      Object.defineProperty(prototype, propName, {
        get() {
          return this.hasAttribute(propName) ? this.getAttribute(propName) : defaultValue || '';
        },
        set(value) {
          this.setAttribute(propName, value);
        },
      });
    }
  });
}
MockElement.prototype.cloneNode = function (deep) {
  // because we're creating elements, which extending specific HTML base classes there
  // is a MockElement circular reference that bundling has trouble dealing with so
  // the fix is to add cloneNode() to MockElement's prototype after the HTML classes
  const cloned = createElement(this.ownerDocument, this.nodeName);
  cloned.attributes = cloneAttributes(this.attributes);
  const styleCssText = this.getAttribute('style');
  if (styleCssText != null && styleCssText.length > 0) {
    cloned.setAttribute('style', styleCssText);
  }
  if (deep) {
    for (let i = 0, ii = this.childNodes.length; i < ii; i++) {
      const clonedChildNode = this.childNodes[i].cloneNode(true);
      cloned.appendChild(clonedChildNode);
    }
  }
  return cloned;
};

let sharedDocument;
function parseHtmlToDocument(html, ownerDocument = null) {
  if (ownerDocument == null) {
    if (sharedDocument == null) {
      sharedDocument = new MockDocument();
    }
    ownerDocument = sharedDocument;
  }
  return parseDocumentUtil(ownerDocument, html);
}
function parseHtmlToFragment(html, ownerDocument = null) {
  if (ownerDocument == null) {
    if (sharedDocument == null) {
      sharedDocument = new MockDocument();
    }
    ownerDocument = sharedDocument;
  }
  return parseFragmentUtil(ownerDocument, html);
}

class MockHeaders {
  constructor(init) {
    this._values = [];
    if (typeof init === 'object') {
      if (typeof init[Symbol.iterator] === 'function') {
        const kvs = [];
        for (const kv of init) {
          if (typeof kv[Symbol.iterator] === 'function') {
            kvs.push([...kv]);
          }
        }
        for (const kv of kvs) {
          this.append(kv[0], kv[1]);
        }
      }
      else {
        for (const key in init) {
          this.append(key, init[key]);
        }
      }
    }
  }
  append(key, value) {
    this._values.push([key, value + '']);
  }
  delete(key) {
    key = key.toLowerCase();
    for (let i = this._values.length - 1; i >= 0; i--) {
      if (this._values[i][0].toLowerCase() === key) {
        this._values.splice(i, 1);
      }
    }
  }
  entries() {
    const entries = [];
    for (const kv of this.keys()) {
      entries.push([kv, this.get(kv)]);
    }
    let index = -1;
    return {
      next() {
        index++;
        return {
          value: entries[index],
          done: !entries[index],
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  forEach(cb) {
    for (const kv of this.entries()) {
      cb(kv[1], kv[0]);
    }
  }
  get(key) {
    const rtn = [];
    key = key.toLowerCase();
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key) {
        rtn.push(kv[1]);
      }
    }
    return rtn.length > 0 ? rtn.join(', ') : null;
  }
  has(key) {
    key = key.toLowerCase();
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key) {
        return true;
      }
    }
    return false;
  }
  keys() {
    const keys = [];
    for (const kv of this._values) {
      const key = kv[0].toLowerCase();
      if (!keys.includes(key)) {
        keys.push(key);
      }
    }
    let index = -1;
    return {
      next() {
        index++;
        return {
          value: keys[index],
          done: !keys[index],
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  set(key, value) {
    for (const kv of this._values) {
      if (kv[0].toLowerCase() === key.toLowerCase()) {
        kv[1] = value + '';
        return;
      }
    }
    this.append(key, value);
  }
  values() {
    const values = this._values;
    let index = -1;
    return {
      next() {
        index++;
        const done = !values[index];
        return {
          value: done ? undefined : values[index][1],
          done,
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
  [Symbol.iterator]() {
    return this.entries();
  }
}

class MockRequest {
  constructor(input, init = {}) {
    this._method = 'GET';
    this._url = '/';
    this.bodyUsed = false;
    this.cache = 'default';
    this.credentials = 'same-origin';
    this.integrity = '';
    this.keepalive = false;
    this.mode = 'cors';
    this.redirect = 'follow';
    this.referrer = 'about:client';
    this.referrerPolicy = '';
    if (typeof input === 'string') {
      this.url = input;
    }
    else if (input) {
      Object.assign(this, input);
      this.headers = new MockHeaders(input.headers);
    }
    Object.assign(this, init);
    if (init.headers) {
      this.headers = new MockHeaders(init.headers);
    }
    if (!this.headers) {
      this.headers = new MockHeaders();
    }
  }
  get url() {
    if (typeof this._url === 'string') {
      return new URL(this._url, location.href).href;
    }
    return new URL('/', location.href).href;
  }
  set url(value) {
    this._url = value;
  }
  get method() {
    if (typeof this._method === 'string') {
      return this._method.toUpperCase();
    }
    return 'GET';
  }
  set method(value) {
    this._method = value;
  }
  clone() {
    const clone = { ...this };
    clone.headers = new MockHeaders(this.headers);
    return new MockRequest(clone);
  }
}
class MockResponse {
  constructor(body, init = {}) {
    this.ok = true;
    this.status = 200;
    this.statusText = '';
    this.type = 'default';
    this.url = '';
    this._body = body;
    if (init) {
      Object.assign(this, init);
    }
    this.headers = new MockHeaders(init.headers);
  }
  async json() {
    return JSON.parse(this._body);
  }
  async text() {
    return this._body;
  }
  clone() {
    const initClone = { ...this };
    initClone.headers = new MockHeaders(this.headers);
    return new MockResponse(this._body, initClone);
  }
}

class MockDOMParser {
  parseFromString(htmlToParse, mimeType) {
    if (mimeType !== 'text/html') {
      console.error('XML parsing not implemented yet, continuing as html');
    }
    return parseHtmlToDocument(htmlToParse);
  }
}

function setupGlobal(gbl) {
  if (gbl.window == null) {
    const win = (gbl.window = new MockWindow());
    WINDOW_FUNCTIONS.forEach((fnName) => {
      if (!(fnName in gbl)) {
        gbl[fnName] = win[fnName].bind(win);
      }
    });
    WINDOW_PROPS.forEach((propName) => {
      if (!(propName in gbl)) {
        Object.defineProperty(gbl, propName, {
          get() {
            return win[propName];
          },
          set(val) {
            win[propName] = val;
          },
          configurable: true,
          enumerable: true,
        });
      }
    });
    GLOBAL_CONSTRUCTORS.forEach(([cstrName]) => {
      gbl[cstrName] = win[cstrName];
    });
  }
  return gbl.window;
}
function teardownGlobal(gbl) {
  const win = gbl.window;
  if (win && typeof win.close === 'function') {
    win.close();
  }
}
function patchWindow(winToBePatched) {
  const mockWin = new MockWindow(false);
  WINDOW_FUNCTIONS.forEach((fnName) => {
    if (typeof winToBePatched[fnName] !== 'function') {
      winToBePatched[fnName] = mockWin[fnName].bind(mockWin);
    }
  });
  WINDOW_PROPS.forEach((propName) => {
    if (winToBePatched === undefined) {
      Object.defineProperty(winToBePatched, propName, {
        get() {
          return mockWin[propName];
        },
        set(val) {
          mockWin[propName] = val;
        },
        configurable: true,
        enumerable: true,
      });
    }
  });
}
function addGlobalsToWindowPrototype(mockWinPrototype) {
  GLOBAL_CONSTRUCTORS.forEach(([cstrName, Cstr]) => {
    Object.defineProperty(mockWinPrototype, cstrName, {
      get() {
        return this['__' + cstrName] || Cstr;
      },
      set(cstr) {
        this['__' + cstrName] = cstr;
      },
      configurable: true,
      enumerable: true,
    });
  });
}
const WINDOW_FUNCTIONS = [
  'addEventListener',
  'alert',
  'blur',
  'cancelAnimationFrame',
  'cancelIdleCallback',
  'clearInterval',
  'clearTimeout',
  'close',
  'confirm',
  'dispatchEvent',
  'focus',
  'getComputedStyle',
  'matchMedia',
  'open',
  'prompt',
  'removeEventListener',
  'requestAnimationFrame',
  'requestIdleCallback',
  'URL',
];
const WINDOW_PROPS = [
  'customElements',
  'devicePixelRatio',
  'document',
  'history',
  'innerHeight',
  'innerWidth',
  'localStorage',
  'location',
  'navigator',
  'pageXOffset',
  'pageYOffset',
  'performance',
  'screenLeft',
  'screenTop',
  'screenX',
  'screenY',
  'scrollX',
  'scrollY',
  'sessionStorage',
  'CSS',
  'CustomEvent',
  'Event',
  'Element',
  'HTMLElement',
  'Node',
  'NodeList',
  'KeyboardEvent',
  'MouseEvent',
];
const GLOBAL_CONSTRUCTORS = [
  ['CustomEvent', MockCustomEvent],
  ['Event', MockEvent],
  ['Headers', MockHeaders],
  ['KeyboardEvent', MockKeyboardEvent],
  ['MouseEvent', MockMouseEvent],
  ['Request', MockRequest],
  ['Response', MockResponse],
  ['DOMParser', MockDOMParser],
  ['HTMLAnchorElement', MockAnchorElement],
  ['HTMLBaseElement', MockBaseElement],
  ['HTMLButtonElement', MockButtonElement],
  ['HTMLCanvasElement', MockCanvasElement],
  ['HTMLFormElement', MockFormElement],
  ['HTMLImageElement', MockImageElement],
  ['HTMLInputElement', MockInputElement],
  ['HTMLLinkElement', MockLinkElement],
  ['HTMLMetaElement', MockMetaElement],
  ['HTMLScriptElement', MockScriptElement],
  ['HTMLStyleElement', MockStyleElement],
  ['HTMLTemplateElement', MockTemplateElement],
  ['HTMLTitleElement', MockTitleElement],
];

const consoleNoop = () => {
  /**/
};
function createConsole() {
  return {
    debug: consoleNoop,
    error: consoleNoop,
    info: consoleNoop,
    log: consoleNoop,
    warn: consoleNoop,
    dir: consoleNoop,
    dirxml: consoleNoop,
    table: consoleNoop,
    trace: consoleNoop,
    group: consoleNoop,
    groupCollapsed: consoleNoop,
    groupEnd: consoleNoop,
    clear: consoleNoop,
    count: consoleNoop,
    countReset: consoleNoop,
    assert: consoleNoop,
    profile: consoleNoop,
    profileEnd: consoleNoop,
    time: consoleNoop,
    timeLog: consoleNoop,
    timeEnd: consoleNoop,
    timeStamp: consoleNoop,
    context: consoleNoop,
    memory: consoleNoop,
  };
}

class MockHistory {
  constructor() {
    this.items = [];
  }
  get length() {
    return this.items.length;
  }
  back() {
    this.go(-1);
  }
  forward() {
    this.go(1);
  }
  go(_value) {
    //
  }
  pushState(_state, _title, _url) {
    //
  }
  replaceState(_state, _title, _url) {
    //
  }
}

class MockIntersectionObserver {
  constructor() {
    /**/
  }
  disconnect() {
    /**/
  }
  observe() {
    /**/
  }
  takeRecords() {
    return [];
  }
  unobserve() {
    /**/
  }
}

class MockLocation {
  constructor() {
    this.ancestorOrigins = null;
    this.protocol = '';
    this.host = '';
    this.hostname = '';
    this.port = '';
    this.pathname = '';
    this.search = '';
    this.hash = '';
    this.username = '';
    this.password = '';
    this.origin = '';
    this._href = '';
  }
  get href() {
    return this._href;
  }
  set href(value) {
    const url = new URL(value, 'http://mockdoc.stenciljs.com');
    this._href = url.href;
    this.protocol = url.protocol;
    this.host = url.host;
    this.hostname = url.hostname;
    this.port = url.port;
    this.pathname = url.pathname;
    this.search = url.search;
    this.hash = url.hash;
    this.username = url.username;
    this.password = url.password;
    this.origin = url.origin;
  }
  assign(_url) {
    //
  }
  reload(_forcedReload) {
    //
  }
  replace(_url) {
    //
  }
  toString() {
    return this.href;
  }
}

class MockNavigator {
  constructor() {
    this.appCodeName = 'MockNavigator';
    this.appName = 'MockNavigator';
    this.appVersion = 'MockNavigator';
    this.platform = 'MockNavigator';
    this.userAgent = 'MockNavigator';
  }
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Performance
 */
class MockPerformance {
  constructor() {
    this.timeOrigin = Date.now();
  }
  addEventListener() {
    //
  }
  clearMarks() {
    //
  }
  clearMeasures() {
    //
  }
  clearResourceTimings() {
    //
  }
  dispatchEvent() {
    return true;
  }
  getEntries() {
    return [];
  }
  getEntriesByName() {
    return [];
  }
  getEntriesByType() {
    return [];
  }
  // Stencil's implementation of `mark` is non-compliant with the `Performance` interface. Because Stencil will
  // instantiate an instance of this class and may attempt to assign it to a variable of type `Performance`, the return
  // type must match the `Performance` interface (rather than typing this function as returning `void` and ignoring the
  // associated errors returned by the type checker)
  // @ts-ignore
  mark() {
    //
  }
  // Stencil's implementation of `measure` is non-compliant with the `Performance` interface. Because Stencil will
  // instantiate an instance of this class and may attempt to assign it to a variable of type `Performance`, the return
  // type must match the `Performance` interface (rather than typing this function as returning `void` and ignoring the
  // associated errors returned by the type checker)
  // @ts-ignore
  measure() {
    //
  }
  get navigation() {
    return {};
  }
  now() {
    return Date.now() - this.timeOrigin;
  }
  get onresourcetimingbufferfull() {
    return null;
  }
  removeEventListener() {
    //
  }
  setResourceTimingBufferSize() {
    //
  }
  get timing() {
    return {};
  }
  toJSON() {
    //
  }
}
function resetPerformance(perf) {
  if (perf != null) {
    try {
      perf.timeOrigin = Date.now();
    }
    catch (e) { }
  }
}

class MockStorage {
  constructor() {
    this.items = new Map();
  }
  key(_value) {
    //
  }
  getItem(key) {
    key = String(key);
    if (this.items.has(key)) {
      return this.items.get(key);
    }
    return null;
  }
  setItem(key, value) {
    if (value == null) {
      value = 'null';
    }
    this.items.set(String(key), String(value));
  }
  removeItem(key) {
    this.items.delete(String(key));
  }
  clear() {
    this.items.clear();
  }
}

const nativeClearInterval = clearInterval;
const nativeClearTimeout = clearTimeout;
const nativeSetInterval = setInterval;
const nativeSetTimeout = setTimeout;
const nativeURL = URL;
class MockWindow {
  constructor(html = null) {
    if (html !== false) {
      this.document = new MockDocument(html, this);
    }
    else {
      this.document = null;
    }
    this.performance = new MockPerformance();
    this.customElements = new MockCustomElementRegistry(this);
    this.console = createConsole();
    resetWindowDefaults(this);
    resetWindowDimensions(this);
  }
  addEventListener(type, handler) {
    addEventListener(this, type, handler);
  }
  alert(msg) {
    if (this.console) {
      this.console.debug(msg);
    }
    else {
      console.debug(msg);
    }
  }
  blur() {
    /**/
  }
  cancelAnimationFrame(id) {
    this.__clearTimeout(id);
  }
  cancelIdleCallback(id) {
    this.__clearTimeout(id);
  }
  get CharacterData() {
    if (this.__charDataCstr == null) {
      const ownerDocument = this.document;
      this.__charDataCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct CharacterData');
        }
      };
    }
    return this.__charDataCstr;
  }
  set CharacterData(charDataCstr) {
    this.__charDataCstr = charDataCstr;
  }
  clearInterval(id) {
    this.__clearInterval(id);
  }
  clearTimeout(id) {
    this.__clearTimeout(id);
  }
  close() {
    resetWindow(this);
  }
  confirm() {
    return false;
  }
  get CSS() {
    return {
      supports: () => true,
    };
  }
  get Document() {
    if (this.__docCstr == null) {
      const win = this;
      this.__docCstr = class extends MockDocument {
        constructor() {
          super(false, win);
          throw new Error('Illegal constructor: cannot construct Document');
        }
      };
    }
    return this.__docCstr;
  }
  set Document(docCstr) {
    this.__docCstr = docCstr;
  }
  get DocumentFragment() {
    if (this.__docFragCstr == null) {
      const ownerDocument = this.document;
      this.__docFragCstr = class extends MockDocumentFragment {
        constructor() {
          super(ownerDocument);
          throw new Error('Illegal constructor: cannot construct DocumentFragment');
        }
      };
    }
    return this.__docFragCstr;
  }
  set DocumentFragment(docFragCstr) {
    this.__docFragCstr = docFragCstr;
  }
  get DocumentType() {
    if (this.__docTypeCstr == null) {
      const ownerDocument = this.document;
      this.__docTypeCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct DocumentType');
        }
      };
    }
    return this.__docTypeCstr;
  }
  set DocumentType(docTypeCstr) {
    this.__docTypeCstr = docTypeCstr;
  }
  get DOMTokenList() {
    if (this.__domTokenListCstr == null) {
      this.__domTokenListCstr = class MockDOMTokenList {
      };
    }
    return this.__domTokenListCstr;
  }
  set DOMTokenList(domTokenListCstr) {
    this.__domTokenListCstr = domTokenListCstr;
  }
  dispatchEvent(ev) {
    return dispatchEvent(this, ev);
  }
  get Element() {
    if (this.__elementCstr == null) {
      const ownerDocument = this.document;
      this.__elementCstr = class extends MockElement {
        constructor() {
          super(ownerDocument, '');
          throw new Error('Illegal constructor: cannot construct Element');
        }
      };
    }
    return this.__elementCstr;
  }
  fetch(input, init) {
    if (typeof fetch === 'function') {
      return fetch(input, init);
    }
    throw new Error(`fetch() not implemented`);
  }
  focus() {
    /**/
  }
  getComputedStyle(_) {
    return {
      cssText: '',
      length: 0,
      parentRule: null,
      getPropertyPriority() {
        return null;
      },
      getPropertyValue() {
        return '';
      },
      item() {
        return null;
      },
      removeProperty() {
        return null;
      },
      setProperty() {
        return null;
      },
    };
  }
  get globalThis() {
    return this;
  }
  get history() {
    if (this.__history == null) {
      this.__history = new MockHistory();
    }
    return this.__history;
  }
  set history(hsty) {
    this.__history = hsty;
  }
  get JSON() {
    return JSON;
  }
  get HTMLElement() {
    if (this.__htmlElementCstr == null) {
      const ownerDocument = this.document;
      this.__htmlElementCstr = class extends MockHTMLElement {
        constructor() {
          super(ownerDocument, '');
          const observedAttributes = this.constructor.observedAttributes;
          if (Array.isArray(observedAttributes) && typeof this.attributeChangedCallback === 'function') {
            observedAttributes.forEach((attrName) => {
              const attrValue = this.getAttribute(attrName);
              if (attrValue != null) {
                this.attributeChangedCallback(attrName, null, attrValue);
              }
            });
          }
        }
      };
    }
    return this.__htmlElementCstr;
  }
  set HTMLElement(htmlElementCstr) {
    this.__htmlElementCstr = htmlElementCstr;
  }
  get IntersectionObserver() {
    return MockIntersectionObserver;
  }
  get localStorage() {
    if (this.__localStorage == null) {
      this.__localStorage = new MockStorage();
    }
    return this.__localStorage;
  }
  set localStorage(locStorage) {
    this.__localStorage = locStorage;
  }
  get location() {
    if (this.__location == null) {
      this.__location = new MockLocation();
    }
    return this.__location;
  }
  set location(val) {
    if (typeof val === 'string') {
      if (this.__location == null) {
        this.__location = new MockLocation();
      }
      this.__location.href = val;
    }
    else {
      this.__location = val;
    }
  }
  matchMedia() {
    return {
      matches: false,
    };
  }
  get Node() {
    if (this.__nodeCstr == null) {
      const ownerDocument = this.document;
      this.__nodeCstr = class extends MockNode {
        constructor() {
          super(ownerDocument, 0, 'test', '');
          throw new Error('Illegal constructor: cannot construct Node');
        }
      };
    }
    return this.__nodeCstr;
  }
  get NodeList() {
    if (this.__nodeListCstr == null) {
      const ownerDocument = this.document;
      this.__nodeListCstr = class extends MockNodeList {
        constructor() {
          super(ownerDocument, [], 0);
          throw new Error('Illegal constructor: cannot construct NodeList');
        }
      };
    }
    return this.__nodeListCstr;
  }
  get navigator() {
    if (this.__navigator == null) {
      this.__navigator = new MockNavigator();
    }
    return this.__navigator;
  }
  set navigator(nav) {
    this.__navigator = nav;
  }
  get parent() {
    return null;
  }
  prompt() {
    return '';
  }
  open() {
    return null;
  }
  get origin() {
    return this.location.origin;
  }
  removeEventListener(type, handler) {
    removeEventListener(this, type, handler);
  }
  requestAnimationFrame(callback) {
    return this.setTimeout(() => {
      callback(Date.now());
    }, 0);
  }
  requestIdleCallback(callback) {
    return this.setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => 0,
      });
    }, 0);
  }
  scroll(_x, _y) {
    /**/
  }
  scrollBy(_x, _y) {
    /**/
  }
  scrollTo(_x, _y) {
    /**/
  }
  get self() {
    return this;
  }
  get sessionStorage() {
    if (this.__sessionStorage == null) {
      this.__sessionStorage = new MockStorage();
    }
    return this.__sessionStorage;
  }
  set sessionStorage(locStorage) {
    this.__sessionStorage = locStorage;
  }
  setInterval(callback, ms, ...args) {
    if (this.__timeouts == null) {
      this.__timeouts = new Set();
    }
    ms = Math.min(ms, this.__maxTimeout);
    if (this.__allowInterval) {
      const intervalId = this.__setInterval(() => {
        if (this.__timeouts) {
          this.__timeouts.delete(intervalId);
          try {
            callback(...args);
          }
          catch (e) {
            if (this.console) {
              this.console.error(e);
            }
            else {
              console.error(e);
            }
          }
        }
      }, ms);
      if (this.__timeouts) {
        this.__timeouts.add(intervalId);
      }
      return intervalId;
    }
    const timeoutId = this.__setTimeout(() => {
      if (this.__timeouts) {
        this.__timeouts.delete(timeoutId);
        try {
          callback(...args);
        }
        catch (e) {
          if (this.console) {
            this.console.error(e);
          }
          else {
            console.error(e);
          }
        }
      }
    }, ms);
    if (this.__timeouts) {
      this.__timeouts.add(timeoutId);
    }
    return timeoutId;
  }
  setTimeout(callback, ms, ...args) {
    if (this.__timeouts == null) {
      this.__timeouts = new Set();
    }
    ms = Math.min(ms, this.__maxTimeout);
    const timeoutId = this.__setTimeout(() => {
      if (this.__timeouts) {
        this.__timeouts.delete(timeoutId);
        try {
          callback(...args);
        }
        catch (e) {
          if (this.console) {
            this.console.error(e);
          }
          else {
            console.error(e);
          }
        }
      }
    }, ms);
    if (this.__timeouts) {
      this.__timeouts.add(timeoutId);
    }
    return timeoutId;
  }
  get top() {
    return this;
  }
  get window() {
    return this;
  }
  onanimationstart() {
    /**/
  }
  onanimationend() {
    /**/
  }
  onanimationiteration() {
    /**/
  }
  onabort() {
    /**/
  }
  onauxclick() {
    /**/
  }
  onbeforecopy() {
    /**/
  }
  onbeforecut() {
    /**/
  }
  onbeforepaste() {
    /**/
  }
  onblur() {
    /**/
  }
  oncancel() {
    /**/
  }
  oncanplay() {
    /**/
  }
  oncanplaythrough() {
    /**/
  }
  onchange() {
    /**/
  }
  onclick() {
    /**/
  }
  onclose() {
    /**/
  }
  oncontextmenu() {
    /**/
  }
  oncopy() {
    /**/
  }
  oncuechange() {
    /**/
  }
  oncut() {
    /**/
  }
  ondblclick() {
    /**/
  }
  ondrag() {
    /**/
  }
  ondragend() {
    /**/
  }
  ondragenter() {
    /**/
  }
  ondragleave() {
    /**/
  }
  ondragover() {
    /**/
  }
  ondragstart() {
    /**/
  }
  ondrop() {
    /**/
  }
  ondurationchange() {
    /**/
  }
  onemptied() {
    /**/
  }
  onended() {
    /**/
  }
  onerror() {
    /**/
  }
  onfocus() {
    /**/
  }
  onfocusin() {
    /**/
  }
  onfocusout() {
    /**/
  }
  onformdata() {
    /**/
  }
  onfullscreenchange() {
    /**/
  }
  onfullscreenerror() {
    /**/
  }
  ongotpointercapture() {
    /**/
  }
  oninput() {
    /**/
  }
  oninvalid() {
    /**/
  }
  onkeydown() {
    /**/
  }
  onkeypress() {
    /**/
  }
  onkeyup() {
    /**/
  }
  onload() {
    /**/
  }
  onloadeddata() {
    /**/
  }
  onloadedmetadata() {
    /**/
  }
  onloadstart() {
    /**/
  }
  onlostpointercapture() {
    /**/
  }
  onmousedown() {
    /**/
  }
  onmouseenter() {
    /**/
  }
  onmouseleave() {
    /**/
  }
  onmousemove() {
    /**/
  }
  onmouseout() {
    /**/
  }
  onmouseover() {
    /**/
  }
  onmouseup() {
    /**/
  }
  onmousewheel() {
    /**/
  }
  onpaste() {
    /**/
  }
  onpause() {
    /**/
  }
  onplay() {
    /**/
  }
  onplaying() {
    /**/
  }
  onpointercancel() {
    /**/
  }
  onpointerdown() {
    /**/
  }
  onpointerenter() {
    /**/
  }
  onpointerleave() {
    /**/
  }
  onpointermove() {
    /**/
  }
  onpointerout() {
    /**/
  }
  onpointerover() {
    /**/
  }
  onpointerup() {
    /**/
  }
  onprogress() {
    /**/
  }
  onratechange() {
    /**/
  }
  onreset() {
    /**/
  }
  onresize() {
    /**/
  }
  onscroll() {
    /**/
  }
  onsearch() {
    /**/
  }
  onseeked() {
    /**/
  }
  onseeking() {
    /**/
  }
  onselect() {
    /**/
  }
  onselectstart() {
    /**/
  }
  onstalled() {
    /**/
  }
  onsubmit() {
    /**/
  }
  onsuspend() {
    /**/
  }
  ontimeupdate() {
    /**/
  }
  ontoggle() {
    /**/
  }
  onvolumechange() {
    /**/
  }
  onwaiting() {
    /**/
  }
  onwebkitfullscreenchange() {
    /**/
  }
  onwebkitfullscreenerror() {
    /**/
  }
  onwheel() {
    /**/
  }
}
addGlobalsToWindowPrototype(MockWindow.prototype);
function resetWindowDefaults(win) {
  win.__clearInterval = nativeClearInterval;
  win.__clearTimeout = nativeClearTimeout;
  win.__setInterval = nativeSetInterval;
  win.__setTimeout = nativeSetTimeout;
  win.__maxTimeout = 30000;
  win.__allowInterval = true;
  win.URL = nativeURL;
}
function cloneWindow(srcWin, opts = {}) {
  if (srcWin == null) {
    return null;
  }
  const clonedWin = new MockWindow(false);
  if (!opts.customElementProxy) {
    // TODO(STENCIL-345) - Evaluate reconciling MockWindow, Window differences
    // @ts-ignore
    srcWin.customElements = null;
  }
  if (srcWin.document != null) {
    const clonedDoc = new MockDocument(false, clonedWin);
    clonedWin.document = clonedDoc;
    clonedDoc.documentElement = srcWin.document.documentElement.cloneNode(true);
  }
  else {
    clonedWin.document = new MockDocument(null, clonedWin);
  }
  return clonedWin;
}
function cloneDocument(srcDoc) {
  if (srcDoc == null) {
    return null;
  }
  const dstWin = cloneWindow(srcDoc.defaultView);
  return dstWin.document;
}
// TODO(STENCIL-345) - Evaluate reconciling MockWindow, Window differences
/**
 * Constrain setTimeout() to 1ms, but still async. Also
 * only allow setInterval() to fire once, also constrained to 1ms.
 * @param win the mock window instance to update
 */
function constrainTimeouts(win) {
  win.__allowInterval = false;
  win.__maxTimeout = 0;
}
function resetWindow(win) {
  if (win != null) {
    if (win.__timeouts) {
      win.__timeouts.forEach((timeoutId) => {
        nativeClearInterval(timeoutId);
        nativeClearTimeout(timeoutId);
      });
      win.__timeouts.clear();
    }
    if (win.customElements && win.customElements.clear) {
      win.customElements.clear();
    }
    resetDocument(win.document);
    resetPerformance(win.performance);
    for (const key in win) {
      if (win.hasOwnProperty(key) && key !== 'document' && key !== 'performance' && key !== 'customElements') {
        delete win[key];
      }
    }
    resetWindowDefaults(win);
    resetWindowDimensions(win);
    resetEventListeners(win);
    if (win.document != null) {
      try {
        win.document.defaultView = win;
      }
      catch (e) { }
    }
    // ensure we don't hold onto nodeFetch values
    win.fetch = null;
    win.Headers = null;
    win.Request = null;
    win.Response = null;
    win.FetchError = null;
  }
}
function resetWindowDimensions(win) {
  try {
    win.devicePixelRatio = 1;
    win.innerHeight = 768;
    win.innerWidth = 1366;
    win.pageXOffset = 0;
    win.pageYOffset = 0;
    win.screenLeft = 0;
    win.screenTop = 0;
    win.screenX = 0;
    win.screenY = 0;
    win.scrollX = 0;
    win.scrollY = 0;
    win.screen = {
      availHeight: win.innerHeight,
      availLeft: 0,
      availTop: 0,
      availWidth: win.innerWidth,
      colorDepth: 24,
      height: win.innerHeight,
      keepAwake: false,
      orientation: {
        angle: 0,
        type: 'portrait-primary',
      },
      pixelDepth: 24,
      width: win.innerWidth,
    };
  }
  catch (e) { }
}

class MockDocument extends MockHTMLElement {
  constructor(html = null, win = null) {
    super(null, null);
    this.nodeName = "#document" /* DOCUMENT_NODE */;
    this.nodeType = 9 /* DOCUMENT_NODE */;
    this.defaultView = win;
    this.cookie = '';
    this.referrer = '';
    this.appendChild(this.createDocumentTypeNode());
    if (typeof html === 'string') {
      const parsedDoc = parseDocumentUtil(this, html);
      const documentElement = parsedDoc.children.find((elm) => elm.nodeName === 'HTML');
      if (documentElement != null) {
        this.appendChild(documentElement);
        setOwnerDocument(documentElement, this);
      }
    }
    else if (html !== false) {
      const documentElement = new MockHTMLElement(this, 'html');
      this.appendChild(documentElement);
      documentElement.appendChild(new MockHTMLElement(this, 'head'));
      documentElement.appendChild(new MockHTMLElement(this, 'body'));
    }
  }
  get dir() {
    return this.documentElement.dir;
  }
  set dir(value) {
    this.documentElement.dir = value;
  }
  get location() {
    if (this.defaultView != null) {
      return this.defaultView.location;
    }
    return null;
  }
  set location(val) {
    if (this.defaultView != null) {
      this.defaultView.location = val;
    }
  }
  get baseURI() {
    const baseNode = this.head.childNodes.find((node) => node.nodeName === 'BASE');
    if (baseNode) {
      return baseNode.href;
    }
    return this.URL;
  }
  get URL() {
    return this.location.href;
  }
  get styleSheets() {
    return this.querySelectorAll('style');
  }
  get scripts() {
    return this.querySelectorAll('script');
  }
  get forms() {
    return this.querySelectorAll('form');
  }
  get images() {
    return this.querySelectorAll('img');
  }
  get scrollingElement() {
    return this.documentElement;
  }
  get documentElement() {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      if (this.childNodes[i].nodeName === 'HTML') {
        return this.childNodes[i];
      }
    }
    const documentElement = new MockHTMLElement(this, 'html');
    this.appendChild(documentElement);
    return documentElement;
  }
  set documentElement(documentElement) {
    for (let i = this.childNodes.length - 1; i >= 0; i--) {
      if (this.childNodes[i].nodeType !== 10 /* DOCUMENT_TYPE_NODE */) {
        this.childNodes[i].remove();
      }
    }
    if (documentElement != null) {
      this.appendChild(documentElement);
      setOwnerDocument(documentElement, this);
    }
  }
  get head() {
    const documentElement = this.documentElement;
    for (let i = 0; i < documentElement.childNodes.length; i++) {
      if (documentElement.childNodes[i].nodeName === 'HEAD') {
        return documentElement.childNodes[i];
      }
    }
    const head = new MockHTMLElement(this, 'head');
    documentElement.insertBefore(head, documentElement.firstChild);
    return head;
  }
  set head(head) {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'HEAD') {
        documentElement.childNodes[i].remove();
      }
    }
    if (head != null) {
      documentElement.insertBefore(head, documentElement.firstChild);
      setOwnerDocument(head, this);
    }
  }
  get body() {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'BODY') {
        return documentElement.childNodes[i];
      }
    }
    const body = new MockHTMLElement(this, 'body');
    documentElement.appendChild(body);
    return body;
  }
  set body(body) {
    const documentElement = this.documentElement;
    for (let i = documentElement.childNodes.length - 1; i >= 0; i--) {
      if (documentElement.childNodes[i].nodeName === 'BODY') {
        documentElement.childNodes[i].remove();
      }
    }
    if (body != null) {
      documentElement.appendChild(body);
      setOwnerDocument(body, this);
    }
  }
  appendChild(newNode) {
    newNode.remove();
    newNode.parentNode = this;
    this.childNodes.push(newNode);
    return newNode;
  }
  createComment(data) {
    return new MockComment(this, data);
  }
  createAttribute(attrName) {
    return new MockAttr(attrName.toLowerCase(), '');
  }
  createAttributeNS(namespaceURI, attrName) {
    return new MockAttr(attrName, '', namespaceURI);
  }
  createElement(tagName) {
    if (tagName === "#document" /* DOCUMENT_NODE */) {
      const doc = new MockDocument(false);
      doc.nodeName = tagName;
      doc.parentNode = null;
      return doc;
    }
    return createElement(this, tagName);
  }
  createElementNS(namespaceURI, tagName) {
    const elmNs = createElementNS(this, namespaceURI, tagName);
    elmNs.namespaceURI = namespaceURI;
    return elmNs;
  }
  createTextNode(text) {
    return new MockTextNode(this, text);
  }
  createDocumentFragment() {
    return new MockDocumentFragment(this);
  }
  createDocumentTypeNode() {
    return new MockDocumentTypeNode(this);
  }
  getElementById(id) {
    return getElementById(this, id);
  }
  getElementsByName(elmName) {
    return getElementsByName(this, elmName.toLowerCase());
  }
  get title() {
    const title = this.head.childNodes.find((elm) => elm.nodeName === 'TITLE');
    if (title != null && typeof title.textContent === 'string') {
      return title.textContent.trim();
    }
    return '';
  }
  set title(value) {
    const head = this.head;
    let title = head.childNodes.find((elm) => elm.nodeName === 'TITLE');
    if (title == null) {
      title = this.createElement('title');
      head.appendChild(title);
    }
    title.textContent = value;
  }
}
function createDocument(html = null) {
  return new MockWindow(html).document;
}
function createFragment(html) {
  return parseHtmlToFragment(html, null);
}
function resetDocument(doc) {
  if (doc != null) {
    resetEventListeners(doc);
    const documentElement = doc.documentElement;
    if (documentElement != null) {
      resetElement(documentElement);
      for (let i = 0, ii = documentElement.childNodes.length; i < ii; i++) {
        const childNode = documentElement.childNodes[i];
        resetElement(childNode);
        childNode.childNodes.length = 0;
      }
    }
    for (const key in doc) {
      if (doc.hasOwnProperty(key) && !DOC_KEY_KEEPERS.has(key)) {
        delete doc[key];
      }
    }
    try {
      doc.nodeName = "#document" /* DOCUMENT_NODE */;
    }
    catch (e) { }
    try {
      doc.nodeType = 9 /* DOCUMENT_NODE */;
    }
    catch (e) { }
    try {
      doc.cookie = '';
    }
    catch (e) { }
    try {
      doc.referrer = '';
    }
    catch (e) { }
  }
}
const DOC_KEY_KEEPERS = new Set([
  'nodeName',
  'nodeType',
  'nodeValue',
  'ownerDocument',
  'parentNode',
  'childNodes',
  '_shadowRoot',
]);
function getElementById(elm, id) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (childElm.id === id) {
      return childElm;
    }
    const childElmFound = getElementById(childElm, id);
    if (childElmFound != null) {
      return childElmFound;
    }
  }
  return null;
}
function getElementsByName(elm, elmName, foundElms = []) {
  const children = elm.children;
  for (let i = 0, ii = children.length; i < ii; i++) {
    const childElm = children[i];
    if (childElm.name && childElm.name.toLowerCase() === elmName) {
      foundElms.push(childElm);
    }
    getElementsByName(childElm, elmName, foundElms);
  }
  return foundElms;
}
function setOwnerDocument(elm, ownerDocument) {
  for (let i = 0, ii = elm.childNodes.length; i < ii; i++) {
    elm.childNodes[i].ownerDocument = ownerDocument;
    if (elm.childNodes[i].nodeType === 1 /* ELEMENT_NODE */) {
      setOwnerDocument(elm.childNodes[i], ownerDocument);
    }
  }
}

function hydrateFactory($stencilWindow, $stencilHydrateOpts, $stencilHydrateResults, $stencilAfterHydrate, $stencilHydrateResolve) {
  var globalThis = $stencilWindow;
  var self = $stencilWindow;
  var top = $stencilWindow;
  var parent = $stencilWindow;

  var addEventListener = $stencilWindow.addEventListener.bind($stencilWindow);
  var alert = $stencilWindow.alert.bind($stencilWindow);
  var blur = $stencilWindow.blur.bind($stencilWindow);
  var cancelAnimationFrame = $stencilWindow.cancelAnimationFrame.bind($stencilWindow);
  var cancelIdleCallback = $stencilWindow.cancelIdleCallback.bind($stencilWindow);
  var clearInterval = $stencilWindow.clearInterval.bind($stencilWindow);
  var clearTimeout = $stencilWindow.clearTimeout.bind($stencilWindow);
  var close = () => {};
  var confirm = $stencilWindow.confirm.bind($stencilWindow);
  var dispatchEvent = $stencilWindow.dispatchEvent.bind($stencilWindow);
  var focus = $stencilWindow.focus.bind($stencilWindow);
  var getComputedStyle = $stencilWindow.getComputedStyle.bind($stencilWindow);
  var matchMedia = $stencilWindow.matchMedia.bind($stencilWindow);
  var open = $stencilWindow.open.bind($stencilWindow);
  var prompt = $stencilWindow.prompt.bind($stencilWindow);
  var removeEventListener = $stencilWindow.removeEventListener.bind($stencilWindow);
  var requestAnimationFrame = $stencilWindow.requestAnimationFrame.bind($stencilWindow);
  var requestIdleCallback = $stencilWindow.requestIdleCallback.bind($stencilWindow);
  var setInterval = $stencilWindow.setInterval.bind($stencilWindow);
  var setTimeout = $stencilWindow.setTimeout.bind($stencilWindow);

  var CharacterData = $stencilWindow.CharacterData;
  var CSS = $stencilWindow.CSS;
  var CustomEvent = $stencilWindow.CustomEvent;
  var Document = $stencilWindow.Document;
  var DocumentFragment = $stencilWindow.DocumentFragment;
  var DocumentType = $stencilWindow.DocumentType;
  var DOMTokenList = $stencilWindow.DOMTokenList;
  var Element = $stencilWindow.Element;
  var Event = $stencilWindow.Event;
  var HTMLAnchorElement = $stencilWindow.HTMLAnchorElement;
  var HTMLBaseElement = $stencilWindow.HTMLBaseElement;
  var HTMLButtonElement = $stencilWindow.HTMLButtonElement;
  var HTMLCanvasElement = $stencilWindow.HTMLCanvasElement;
  var HTMLElement = $stencilWindow.HTMLElement;
  var HTMLFormElement = $stencilWindow.HTMLFormElement;
  var HTMLImageElement = $stencilWindow.HTMLImageElement;
  var HTMLInputElement = $stencilWindow.HTMLInputElement;
  var HTMLLinkElement = $stencilWindow.HTMLLinkElement;
  var HTMLMetaElement = $stencilWindow.HTMLMetaElement;
  var HTMLScriptElement = $stencilWindow.HTMLScriptElement;
  var HTMLStyleElement = $stencilWindow.HTMLStyleElement;
  var HTMLTemplateElement = $stencilWindow.HTMLTemplateElement;
  var HTMLTitleElement = $stencilWindow.HTMLTitleElement;
  var IntersectionObserver = $stencilWindow.IntersectionObserver;
  var KeyboardEvent = $stencilWindow.KeyboardEvent;
  var MouseEvent = $stencilWindow.MouseEvent;
  var Node = $stencilWindow.Node;
  var NodeList = $stencilWindow.NodeList;
  var URL = $stencilWindow.URL;

  var console = $stencilWindow.console;
  var customElements = $stencilWindow.customElements;
  var history = $stencilWindow.history;
  var localStorage = $stencilWindow.localStorage;
  var location = $stencilWindow.location;
  var navigator = $stencilWindow.navigator;
  var performance = $stencilWindow.performance;
  var sessionStorage = $stencilWindow.sessionStorage;

  var devicePixelRatio = $stencilWindow.devicePixelRatio;
  var innerHeight = $stencilWindow.innerHeight;
  var innerWidth = $stencilWindow.innerWidth;
  var origin = $stencilWindow.origin;
  var pageXOffset = $stencilWindow.pageXOffset;
  var pageYOffset = $stencilWindow.pageYOffset;
  var screen = $stencilWindow.screen;
  var screenLeft = $stencilWindow.screenLeft;
  var screenTop = $stencilWindow.screenTop;
  var screenX = $stencilWindow.screenX;
  var screenY = $stencilWindow.screenY;
  var scrollX = $stencilWindow.scrollX;
  var scrollY = $stencilWindow.scrollY;
  var exports = {};

  var fetch, FetchError, Headers, Request, Response;

  if (typeof $stencilWindow.fetch === 'function') {
  fetch = $stencilWindow.fetch;
  } else {
  fetch = $stencilWindow.fetch = function() { throw new Error('fetch() is not implemented'); };
  }

  if (typeof $stencilWindow.FetchError === 'function') {
  FetchError = $stencilWindow.FetchError;
  } else {
  FetchError = $stencilWindow.FetchError = class FetchError { constructor() { throw new Error('FetchError is not implemented'); } };
  }

  if (typeof $stencilWindow.Headers === 'function') {
  Headers = $stencilWindow.Headers;
  } else {
  Headers = $stencilWindow.Headers = class Headers { constructor() { throw new Error('Headers is not implemented'); } };
  }

  if (typeof $stencilWindow.Request === 'function') {
  Request = $stencilWindow.Request;
  } else {
  Request = $stencilWindow.Request = class Request { constructor() { throw new Error('Request is not implemented'); } };
  }

  if (typeof $stencilWindow.Response === 'function') {
  Response = $stencilWindow.Response;
  } else {
  Response = $stencilWindow.Response = class Response { constructor() { throw new Error('Response is not implemented'); } };
  }

  function hydrateAppClosure($stencilWindow) {
  const window = $stencilWindow;
  const document = $stencilWindow.document;
  /*hydrateAppClosure start*/


const NAMESPACE = 'gwds';
const BUILD = /* gwds */ { allRenderFn: true, appendChildSlotFix: false, asyncLoading: true, attachStyles: true, cloneNodeFix: false, cmpDidLoad: true, cmpDidRender: false, cmpDidUnload: false, cmpDidUpdate: false, cmpShouldUpdate: false, cmpWillLoad: true, cmpWillRender: false, cmpWillUpdate: false, connectedCallback: false, constructableCSS: false, cssAnnotations: true, cssVarShim: false, devTools: false, disconnectedCallback: false, dynamicImportShim: false, element: false, event: false, hasRenderFn: true, hostListener: false, hostListenerTarget: false, hostListenerTargetBody: false, hostListenerTargetDocument: false, hostListenerTargetParent: false, hostListenerTargetWindow: false, hotModuleReplacement: false, hydrateClientSide: true, hydrateServerSide: true, hydratedAttribute: false, hydratedClass: true, isDebug: false, isDev: false, isTesting: false, lazyLoad: true, lifecycle: true, lifecycleDOMEvents: false, member: true, method: false, mode: false, observeAttribute: true, profile: false, prop: true, propBoolean: true, propMutable: false, propNumber: false, propString: true, reflect: false, safari10: false, scoped: false, scriptDataOpts: false, shadowDelegatesFocus: false, shadowDom: true, shadowDomShim: true, slot: true, slotChildNodesFix: false, slotRelocation: true, state: true, style: true, svg: false, taskQueue: true, updatable: true, vdomAttribute: true, vdomClass: true, vdomFunctional: false, vdomKey: false, vdomListener: false, vdomPropOrAttr: true, vdomRef: true, vdomRender: true, vdomStyle: true, vdomText: true, vdomXlink: false, watchCallback: false };

function componentOnReady() {
 return getHostRef(this).$onReadyPromise$;
}

function forceUpdate() {}

function hydrateApp(e, t, o, n, s) {
 function l() {
  if (global.clearTimeout(p), i.clear(), r.clear(), !h) {
   h = !0;
   try {
    t.clientHydrateAnnotations && insertVdomAnnotations(e.document, t.staticComponents), 
    e.dispatchEvent(new e.Event("DOMContentLoaded")), e.document.createElement = c, 
    e.document.createElementNS = $;
   } catch (e) {
    renderCatchError(t, o, e);
   }
  }
  n(e, t, o, s);
 }
 function a(e) {
  renderCatchError(t, o, e), l();
 }
 const r = new Set, i = new Set, d = new Set, c = e.document.createElement, $ = e.document.createElementNS, m = Promise.resolve();
 let p, h = !1;
 try {
  function u() {
   return g(this);
  }
  function f(e) {
   if (isValidComponent(e, t) && !getHostRef(e)) {
    const t = loadModule({
     $tagName$: e.nodeName.toLowerCase(),
     $flags$: null
    });
    null != t && null != t.cmpMeta && (i.add(e), e.connectedCallback = u, registerHost(e, t.cmpMeta), 
    function o(e, t) {
     if ("function" != typeof e.componentOnReady && (e.componentOnReady = componentOnReady), 
     "function" != typeof e.forceUpdate && (e.forceUpdate = forceUpdate), 1 & t.$flags$ && (e.shadowRoot = e), 
     null != t.$members$) {
      const o = getHostRef(e);
      Object.entries(t.$members$).forEach((([n, s]) => {
       const l = s[0];
       if (31 & l) {
        const a = s[1] || n, r = e.getAttribute(a);
        if (null != r) {
         const e = parsePropertyValue(r, l);
         o.$instanceValues$.set(n, e);
        }
        const i = e[n];
        void 0 !== i && (o.$instanceValues$.set(n, i), delete e[n]), Object.defineProperty(e, n, {
         get() {
          return getValue(this, n);
         },
         set(e) {
          setValue(this, n, e, t);
         },
         configurable: !0,
         enumerable: !0
        });
       } else 64 & l && Object.defineProperty(e, n, {
        value(...e) {
         const t = getHostRef(this);
         return t.$onInstancePromise$.then((() => t.$lazyInstance$[n](...e))).catch(consoleError);
        }
       });
      }));
     }
    }(e, t.cmpMeta));
   }
  }
  function g(n) {
   return i.delete(n), isValidComponent(n, t) && o.hydratedCount < t.maxHydrateCount && !r.has(n) && shouldHydrate(n) ? (r.add(n), 
   async function s(e, t, o, n, l) {
    o = o.toLowerCase();
    const a = loadModule({
     $tagName$: o,
     $flags$: null
    });
    if (null != a && null != a.cmpMeta) {
     l.add(n);
     try {
      connectedCallback(n), await n.componentOnReady(), t.hydratedCount++;
      const e = getHostRef(n), s = e.$modeName$ ? e.$modeName$ : "$";
      t.components.some((e => e.tag === o && e.mode === s)) || t.components.push({
       tag: o,
       mode: s,
       count: 0,
       depth: -1
      });
     } catch (t) {
      e.console.error(t);
     }
     l.delete(n);
    }
   }(e, o, n.nodeName, n, d)) : m;
  }
  e.document.createElement = function t(o) {
   const n = c.call(e.document, o);
   return f(n), n;
  }, e.document.createElementNS = function t(o, n) {
   const s = $.call(e.document, o, n);
   return f(s), s;
  }, p = global.setTimeout((function L() {
   a(`Hydrate exceeded timeout${function e(t) {
    return Array.from(t).map(waitingOnElementMsg);
   }(d)}`);
  }), t.timeout), plt.$resourcesUrl$ = new URL(t.resourcesUrl || "./", doc.baseURI).href, 
  function e(t) {
   if (null != t && 1 === t.nodeType) {
    f(t);
    const o = t.children;
    for (let t = 0, n = o.length; t < n; t++) e(o[t]);
   }
  }(e.document.body), function e() {
   const t = Array.from(i).filter((e => e.parentElement));
   return t.length > 0 ? Promise.all(t.map(g)).then(e) : m;
  }().then(l).catch(a);
 } catch (e) {
  a(e);
 }
}

function isValidComponent(e, t) {
 if (null != e && 1 === e.nodeType) {
  const o = e.nodeName;
  if ("string" == typeof o && o.includes("-")) return !t.excludeComponents.includes(o.toLowerCase());
 }
 return !1;
}

function shouldHydrate(e) {
 if (9 === e.nodeType) return !0;
 if (NO_HYDRATE_TAGS.has(e.nodeName)) return !1;
 if (e.hasAttribute("no-prerender")) return !1;
 const t = e.parentNode;
 return null == t || shouldHydrate(t);
}

function renderCatchError(e, t, o) {
 const n = {
  level: "error",
  type: "build",
  header: "Hydrate Error",
  messageText: "",
  relFilePath: null,
  absFilePath: null,
  lines: []
 };
 if (e.url) try {
  const t = new URL(e.url);
  "/" !== t.pathname && (n.header += ": " + t.pathname);
 } catch (e) {}
 null != o && (null != o.stack ? n.messageText = o.stack.toString() : null != o.message ? n.messageText = o.message.toString() : n.messageText = o.toString()), 
 t.diagnostics.push(n);
}

function printTag(e) {
 let t = `<${e.nodeName.toLowerCase()}`;
 if (Array.isArray(e.attributes)) for (let o = 0; o < e.attributes.length; o++) {
  const n = e.attributes[o];
  t += ` ${n.name}`, "" !== n.value && (t += `="${n.value}"`);
 }
 return t += ">", t;
}

function waitingOnElementMsg(e) {
 let t = "";
 if (e) {
  const o = [];
  t = " - waiting on:";
  let n = e;
  for (;n && 9 !== n.nodeType && "BODY" !== n.nodeName; ) o.unshift(printTag(n)), 
  n = n.parentElement;
  let s = "";
  for (const e of o) s += "  ", t += `\n${s}${e}`;
 }
 return t;
}

const createTime = (e, t = "") => {
 return () => {};
}, rootAppliedStyles = new WeakMap, registerStyle = (e, t, o) => {
 let n = styles.get(e);
 n = t, styles.set(e, n);
}, addStyle = (e, t, o, n) => {
 let s = getScopeId(t);
 const l = styles.get(s);
 if (e = 11 === e.nodeType ? e : doc, l) if ("string" == typeof l) {
  e = e.head || e;
  let o, a = rootAppliedStyles.get(e);
  if (a || rootAppliedStyles.set(e, a = new Set), !a.has(s)) {
   if (e.host && (o = e.querySelector(`[sty-id="${s}"]`))) o.innerHTML = l; else {
    o = doc.createElement("style"), o.innerHTML = l;
    o.setAttribute("sty-id", s), 
    e.insertBefore(o, e.querySelector("link"));
   }
   a && a.add(s);
  }
 }
 return s;
}, attachStyles = e => {
 const t = e.$cmpMeta$, o = e.$hostElement$, n = t.$flags$, s = createTime("attachStyles", t.$tagName$), l = addStyle(o.getRootNode(), t);
 10 & n && (o["s-sc"] = l, 
 o.classList.add(l + "-h"), BUILD.scoped  ), 
 s();
}, getScopeId = (e, t) => "sc-" + (e.$tagName$), EMPTY_OBJ = {}, isComplexType = e => "object" == (e = typeof e) || "function" === e, isPromise = e => !!e && ("object" == typeof e || "function" == typeof e) && "function" == typeof e.then, h = (e, t, ...o) => {
 let n = null, l = null, a = !1, r = !1;
 const i = [], d = t => {
  for (let o = 0; o < t.length; o++) n = t[o], Array.isArray(n) ? d(n) : null != n && "boolean" != typeof n && ((a = "function" != typeof e && !isComplexType(n)) ? n = String(n) : BUILD.isDev  , 
  a && r ? i[i.length - 1].$text$ += n : i.push(a ? newVNode(null, n) : n), r = a);
 };
 if (d(o), t && (t.name && (l = t.name), BUILD.vdomClass)) {
  const e = t.className || t.class;
  e && (t.class = "object" != typeof e ? e : Object.keys(e).filter((t => e[t])).join(" "));
 }
 const c = newVNode(e, null);
 return c.$attrs$ = t, i.length > 0 && (c.$children$ = i), (c.$name$ = l), c;
}, newVNode = (e, t) => {
 const o = {
  $flags$: 0,
  $tag$: e,
  $text$: t,
  $elm$: null,
  $children$: null
 };
 return (o.$attrs$ = null), (o.$name$ = null), o;
}, Host = {}, isHost = e => e && e.$tag$ === Host, setAccessor = (e, t, o, n, s, l) => {
 if (o !== n) {
  let a = isMemberInElement(e, t); t.toLowerCase();
  if ("class" === t) {
   const t = e.classList, s = parseClassList(o), l = parseClassList(n);
   t.remove(...s.filter((e => e && !l.includes(e)))), t.add(...l.filter((e => e && !s.includes(e))));
  } else if ("style" === t) {
   for (const t in o) n && null != n[t] || (e.style[t] = "");
   for (const t in n) o && n[t] === o[t] || (e.style[t] = n[t]);
  } else if ("ref" === t) n && n(e); else {
   {
    const i = isComplexType(n);
    if ((a || i && null !== n) && !s) try {
     if (e.tagName.includes("-")) e[t] = n; else {
      const s = null == n ? "" : n;
      "list" === t ? a = !1 : null != o && e[t] == s || (e[t] = s);
     }
    } catch (e) {}
    null == n || !1 === n ? !1 === n && "" !== e.getAttribute(t) || (e.removeAttribute(t)) : (!a || 4 & l || s) && !i && (n = !0 === n ? "" : n, 
    e.setAttribute(t, n));
   }
  }
 }
}, parseClassListRegex = /\s/, parseClassList = e => e ? e.split(parseClassListRegex) : [], updateElement = (e, t, o, n) => {
 const s = 11 === t.$elm$.nodeType && t.$elm$.host ? t.$elm$.host : t.$elm$, l = e && e.$attrs$ || EMPTY_OBJ, a = t.$attrs$ || EMPTY_OBJ;
 for (n in l) n in a || setAccessor(s, n, l[n], void 0, o, t.$flags$);
 for (n in a) setAccessor(s, n, l[n], a[n], o, t.$flags$);
};

let scopeId, contentRef, hostTagName, useNativeShadowDom = !1, checkSlotFallbackVisibility = !1, checkSlotRelocate = !1, isSvgMode = !1;

const createElm = (e, t, o, n) => {
 const s = t.$children$[o];
 let l, a, r, i = 0;
 if (!useNativeShadowDom && (checkSlotRelocate = !0, "slot" === s.$tag$ && (scopeId && n.classList.add(scopeId + "-s"), 
 s.$flags$ |= s.$children$ ? 2 : 1)), null !== s.$text$) l = s.$elm$ = doc.createTextNode(s.$text$); else if (1 & s.$flags$) l = s.$elm$ = slotReferenceDebugNode(s) ; else {
  if (l = s.$elm$ = doc.createElement(2 & s.$flags$ ? "slot-fb" : s.$tag$), 
  updateElement(null, s, isSvgMode), 
  null != scopeId && l["s-si"] !== scopeId && l.classList.add(l["s-si"] = scopeId), 
  s.$children$) for (i = 0; i < s.$children$.length; ++i) a = createElm(e, s, i, l), 
  a && l.appendChild(a);
 }
 return (l["s-hn"] = hostTagName, 3 & s.$flags$ && (l["s-sr"] = !0, 
 l["s-cr"] = contentRef, l["s-sn"] = s.$name$ || "", r = e && e.$children$ && e.$children$[o], 
 r && r.$tag$ === s.$tag$ && e.$elm$ && putBackInOriginalLocation(e.$elm$, !1))), 
 l;
}, putBackInOriginalLocation = (e, t) => {
 plt.$flags$ |= 1;
 const o = e.childNodes;
 for (let e = o.length - 1; e >= 0; e--) {
  const n = o[e];
  n["s-hn"] !== hostTagName && n["s-ol"] && (parentReferenceNode(n).insertBefore(n, referenceNode(n)), 
  n["s-ol"].remove(), n["s-ol"] = void 0, checkSlotRelocate = !0), t && putBackInOriginalLocation(n, t);
 }
 plt.$flags$ &= -2;
}, addVnodes = (e, t, o, n, s, l) => {
 let a, r = e["s-cr"] && e["s-cr"].parentNode || e;
 for (r.shadowRoot && r.tagName === hostTagName && (r = r.shadowRoot); s <= l; ++s) n[s] && (a = createElm(null, o, s, e), 
 a && (n[s].$elm$ = a, r.insertBefore(a, referenceNode(t) )));
}, removeVnodes = (e, t, o, n, s) => {
 for (;t <= o; ++t) (n = e[t]) && (s = n.$elm$, callNodeRefs(n), (checkSlotFallbackVisibility = !0, 
 s["s-ol"] ? s["s-ol"].remove() : putBackInOriginalLocation(s, !0)), s.remove());
}, isSameVnode = (e, t) => e.$tag$ === t.$tag$ && ("slot" === e.$tag$ ? e.$name$ === t.$name$ : !BUILD.vdomKey ), referenceNode = e => e && e["s-ol"] || e, parentReferenceNode = e => (e["s-ol"] ? e["s-ol"] : e).parentNode, patch = (e, t) => {
 const o = t.$elm$ = e.$elm$, n = e.$children$, s = t.$children$, l = t.$tag$, a = t.$text$;
 let r;
 null !== a ? (r = o["s-cr"]) ? r.parentNode.textContent = a : e.$text$ !== a && (o.data = a) : (("slot" === l || updateElement(e, t, isSvgMode)), 
 null !== n && null !== s ? ((e, t, o, n) => {
  let s, a = 0, r = 0, c = t.length - 1, $ = t[0], m = t[c], p = n.length - 1, h = n[0], u = n[p];
  for (;a <= c && r <= p; ) if (null == $) $ = t[++a]; else if (null == m) m = t[--c]; else if (null == h) h = n[++r]; else if (null == u) u = n[--p]; else if (isSameVnode($, h)) patch($, h), 
  $ = t[++a], h = n[++r]; else if (isSameVnode(m, u)) patch(m, u), m = t[--c], u = n[--p]; else if (isSameVnode($, u)) "slot" !== $.$tag$ && "slot" !== u.$tag$ || putBackInOriginalLocation($.$elm$.parentNode, !1), 
  patch($, u), e.insertBefore($.$elm$, m.$elm$.nextSibling), $ = t[++a], u = n[--p]; else if (isSameVnode(m, h)) "slot" !== $.$tag$ && "slot" !== u.$tag$ || putBackInOriginalLocation(m.$elm$.parentNode, !1), 
  patch(m, h), e.insertBefore(m.$elm$, $.$elm$), m = t[--c], h = n[++r]; else {
   (s = createElm(t && t[r], o, r, e), h = n[++r]), 
   s && (parentReferenceNode($.$elm$).insertBefore(s, referenceNode($.$elm$)) );
  }
  a > c ? addVnodes(e, null == n[p + 1] ? null : n[p + 1].$elm$, o, n, r, p) : r > p && removeVnodes(t, a, c);
 })(o, n, t, s) : null !== s ? (null !== e.$text$ && (o.textContent = ""), 
 addVnodes(o, null, t, s, 0, s.length - 1)) : null !== n && removeVnodes(n, 0, n.length - 1), 
 BUILD.svg   );
}, updateFallbackSlotVisibility = e => {
 const t = e.childNodes;
 let o, n, s, l, a, r;
 for (n = 0, s = t.length; n < s; n++) if (o = t[n], 1 === o.nodeType) {
  if (o["s-sr"]) for (a = o["s-sn"], o.hidden = !1, l = 0; l < s; l++) if (r = t[l].nodeType, 
  t[l]["s-hn"] !== o["s-hn"] || "" !== a) {
   if (1 === r && a === t[l].getAttribute("slot")) {
    o.hidden = !0;
    break;
   }
  } else if (1 === r || 3 === r && "" !== t[l].textContent.trim()) {
   o.hidden = !0;
   break;
  }
  updateFallbackSlotVisibility(o);
 }
}, relocateNodes = [], relocateSlotContent = e => {
 let t, o, n, s, l, a, r = 0;
 const i = e.childNodes, d = i.length;
 for (;r < d; r++) {
  if (t = i[r], t["s-sr"] && (o = t["s-cr"]) && o.parentNode) for (n = o.parentNode.childNodes, 
  s = t["s-sn"], a = n.length - 1; a >= 0; a--) o = n[a], o["s-cn"] || o["s-nr"] || o["s-hn"] === t["s-hn"] || (isNodeLocatedInSlot(o, s) ? (l = relocateNodes.find((e => e.$nodeToRelocate$ === o)), 
  checkSlotFallbackVisibility = !0, o["s-sn"] = o["s-sn"] || s, l ? l.$slotRefNode$ = t : relocateNodes.push({
   $slotRefNode$: t,
   $nodeToRelocate$: o
  }), o["s-sr"] && relocateNodes.map((e => {
   isNodeLocatedInSlot(e.$nodeToRelocate$, o["s-sn"]) && (l = relocateNodes.find((e => e.$nodeToRelocate$ === o)), 
   l && !e.$slotRefNode$ && (e.$slotRefNode$ = l.$slotRefNode$));
  }))) : relocateNodes.some((e => e.$nodeToRelocate$ === o)) || relocateNodes.push({
   $nodeToRelocate$: o
  }));
  1 === t.nodeType && relocateSlotContent(t);
 }
}, isNodeLocatedInSlot = (e, t) => 1 === e.nodeType ? null === e.getAttribute("slot") && "" === t || e.getAttribute("slot") === t : e["s-sn"] === t || "" === t, callNodeRefs = e => {
 (e.$attrs$ && e.$attrs$.ref && e.$attrs$.ref(null), e.$children$ && e.$children$.map(callNodeRefs));
}, renderVdom = (e, t) => {
 const o = e.$hostElement$, s = e.$vnode$ || newVNode(null, null), l = isHost(t) ? t : h(null, null, t);
 if (hostTagName = o.tagName, BUILD.isDev  ) ;
 if (l.$tag$ = null, l.$flags$ |= 4, e.$vnode$ = l, l.$elm$ = s.$elm$ = o.shadowRoot || o, 
 (scopeId = o["s-sc"]), (contentRef = o["s-cr"], 
 useNativeShadowDom = supportsShadow, checkSlotFallbackVisibility = !1), patch(s, l), 
 BUILD.slotRelocation) {
  if (plt.$flags$ |= 1, checkSlotRelocate) {
   let e, t, o, n, s, a;
   relocateSlotContent(l.$elm$);
   let r = 0;
   for (;r < relocateNodes.length; r++) e = relocateNodes[r], t = e.$nodeToRelocate$, 
   t["s-ol"] || (o = originalLocationDebugNode(t) , 
   o["s-nr"] = t, t.parentNode.insertBefore(t["s-ol"] = o, t));
   for (r = 0; r < relocateNodes.length; r++) if (e = relocateNodes[r], t = e.$nodeToRelocate$, 
   e.$slotRefNode$) {
    for (n = e.$slotRefNode$.parentNode, s = e.$slotRefNode$.nextSibling, o = t["s-ol"]; o = o.previousSibling; ) if (a = o["s-nr"], 
    a && a["s-sn"] === t["s-sn"] && n === a.parentNode && (a = a.nextSibling, !a || !a["s-nr"])) {
     s = a;
     break;
    }
    (!s && n !== t.parentNode || t.nextSibling !== s) && t !== s && (!t["s-hn"] && t["s-ol"] && (t["s-hn"] = t["s-ol"].parentNode.nodeName), 
    n.insertBefore(t, s));
   } else 1 === t.nodeType && (t.hidden = !0);
  }
  checkSlotFallbackVisibility && updateFallbackSlotVisibility(l.$elm$), plt.$flags$ &= -2, 
  relocateNodes.length = 0;
 }
}, slotReferenceDebugNode = e => doc.createComment(`<slot${e.$name$ ? ' name="' + e.$name$ + '"' : ""}> (host=${hostTagName.toLowerCase()})`), originalLocationDebugNode = e => doc.createComment("org-location for " + (e.localName ? `<${e.localName}> (host=${e["s-hn"]})` : `[${e.textContent}]`)), emitEvent = (e, t, o) => {
 const n = plt.ce(t, o);
 return e.dispatchEvent(n), n;
}, attachToAncestor = (e, t) => {
 t && !e.$onRenderResolve$ && t["s-p"] && t["s-p"].push(new Promise((t => e.$onRenderResolve$ = t)));
}, scheduleUpdate = (e, t) => {
 if ((e.$flags$ |= 16), 4 & e.$flags$) return void (e.$flags$ |= 512);
 attachToAncestor(e, e.$ancestorComponent$);
 const o = () => dispatchHooks(e, t);
 return writeTask(o) ;
}, dispatchHooks = (e, t) => {
 const n = createTime("scheduleUpdate", e.$cmpMeta$.$tagName$), s = e.$lazyInstance$ ;
 let l;
 return t ? ((l = safeCall(s, "componentWillLoad"))) : (BUILD.cmpWillUpdate ), n(), then(l, (() => updateComponent(e, s, t)));
}, updateComponent = async (e, t, o) => {
 const n = e.$hostElement$, s = createTime("update", e.$cmpMeta$.$tagName$), l = n["s-rc"];
 o && attachStyles(e);
 const a = createTime("render", e.$cmpMeta$.$tagName$);
 if (await callRender(e, t) , 
 BUILD.hydrateServerSide) try {
  serverSideConnected(n), o && (1 & e.$cmpMeta$.$flags$ ? n["s-en"] = "" : 2 & e.$cmpMeta$.$flags$ && (n["s-en"] = "c"));
 } catch (e) {
  consoleError(e, n);
 }
 if (l && (l.map((e => e())), n["s-rc"] = void 0), a(), s(), 
 BUILD.asyncLoading) {
  const t = n["s-p"], o = () => postUpdateComponent(e);
  0 === t.length ? o() : (Promise.all(t).then(o), e.$flags$ |= 4, t.length = 0);
 }
};

const callRender = (e, t, o) => {
 try {
  if (t = t.render(), (e.$flags$ &= -17), 
  (e.$flags$ |= 2), BUILD.hasRenderFn ) {
   return Promise.resolve(t).then((t => renderVdom(e, t)));
  }
 } catch (t) {
  consoleError(t, e.$hostElement$);
 }
 return null;
}, postUpdateComponent = e => {
 const t = e.$cmpMeta$.$tagName$, o = e.$hostElement$, n = createTime("postUpdate", t), s = e.$lazyInstance$ , l = e.$ancestorComponent$;
 64 & e.$flags$ ? (n()) : (e.$flags$ |= 64, addHydratedFlag(o), 
 (safeCall(s, "componentDidLoad"), 
 BUILD.isDev ), n(), (e.$onReadyResolve$(o), l || appDidLoad())), (e.$onRenderResolve$ && (e.$onRenderResolve$(), 
 e.$onRenderResolve$ = void 0), 512 & e.$flags$ && nextTick((() => scheduleUpdate(e, !1))), 
 e.$flags$ &= -517);
}, appDidLoad = e => {
 addHydratedFlag(doc.documentElement), nextTick((() => emitEvent(win, "appload", {
  detail: {
   namespace: NAMESPACE
  }
 }))), BUILD.profile  ;
}, safeCall = (e, t, o) => {
 if (e && e[t]) try {
  return e[t](o);
 } catch (e) {
  consoleError(e);
 }
}, then = (e, t) => e && e.then ? e.then(t) : t(), addHydratedFlag = e => e.classList.add("hydrated") , serverSideConnected = e => {
 const t = e.children;
 if (null != t) for (let e = 0, o = t.length; e < o; e++) {
  const o = t[e];
  "function" == typeof o.connectedCallback && o.connectedCallback(), serverSideConnected(o);
 }
}, clientHydrate = (e, t, o, n, s, l, a) => {
 let r, i, d, c;
 if (1 === l.nodeType) {
  for (r = l.getAttribute("c-id"), r && (i = r.split("."), i[0] !== a && "0" !== i[0] || (d = {
   $flags$: 0,
   $hostId$: i[0],
   $nodeId$: i[1],
   $depth$: i[2],
   $index$: i[3],
   $tag$: l.tagName.toLowerCase(),
   $elm$: l,
   $attrs$: null,
   $children$: null,
   $key$: null,
   $name$: null,
   $text$: null
  }, t.push(d), l.removeAttribute("c-id"), e.$children$ || (e.$children$ = []), e.$children$[d.$index$] = d, 
  e = d, n && "0" === d.$depth$ && (n[d.$index$] = d.$elm$))), c = l.childNodes.length - 1; c >= 0; c--) clientHydrate(e, t, o, n, s, l.childNodes[c], a);
  if (l.shadowRoot) for (c = l.shadowRoot.childNodes.length - 1; c >= 0; c--) clientHydrate(e, t, o, n, s, l.shadowRoot.childNodes[c], a);
 } else if (8 === l.nodeType) i = l.nodeValue.split("."), i[1] !== a && "0" !== i[1] || (r = i[0], 
 d = {
  $flags$: 0,
  $hostId$: i[1],
  $nodeId$: i[2],
  $depth$: i[3],
  $index$: i[4],
  $elm$: l,
  $attrs$: null,
  $children$: null,
  $key$: null,
  $name$: null,
  $tag$: null,
  $text$: null
 }, "t" === r ? (d.$elm$ = l.nextSibling, d.$elm$ && 3 === d.$elm$.nodeType && (d.$text$ = d.$elm$.textContent, 
 t.push(d), l.remove(), e.$children$ || (e.$children$ = []), e.$children$[d.$index$] = d, 
 n && "0" === d.$depth$ && (n[d.$index$] = d.$elm$))) : d.$hostId$ === a && ("s" === r ? (d.$tag$ = "slot", 
 i[5] ? l["s-sn"] = d.$name$ = i[5] : l["s-sn"] = "", l["s-sr"] = !0, n && (d.$elm$ = doc.createElement(d.$tag$), 
 d.$name$ && d.$elm$.setAttribute("name", d.$name$), l.parentNode.insertBefore(d.$elm$, l), 
 l.remove(), "0" === d.$depth$ && (n[d.$index$] = d.$elm$)), o.push(d), e.$children$ || (e.$children$ = []), 
 e.$children$[d.$index$] = d) : "r" === r && (n ? l.remove() : (s["s-cr"] = l, 
 l["s-cn"] = !0)))); else if (e && "style" === e.$tag$) {
  const t = newVNode(null, l.textContent);
  t.$elm$ = l, t.$index$ = "0", e.$children$ = [ t ];
 }
}, initializeDocumentHydrate = (e, t) => {
 if (1 === e.nodeType) {
  let o = 0;
  for (;o < e.childNodes.length; o++) initializeDocumentHydrate(e.childNodes[o], t);
  if (e.shadowRoot) for (o = 0; o < e.shadowRoot.childNodes.length; o++) initializeDocumentHydrate(e.shadowRoot.childNodes[o], t);
 } else if (8 === e.nodeType) {
  const o = e.nodeValue.split(".");
  "o" === o[0] && (t.set(o[1] + "." + o[2], e), e.nodeValue = "", e["s-en"] = o[3]);
 }
}, parsePropertyValue = (e, t) => null == e || isComplexType(e) ? e : 4 & t ? "false" !== e && ("" === e || !!e) : 1 & t ? String(e) : e, getValue = (e, t) => getHostRef(e).$instanceValues$.get(t), setValue = (e, t, o, n) => {
 const s = getHostRef(e), a = s.$instanceValues$.get(t), r = s.$flags$, i = s.$lazyInstance$ ;
 o = parsePropertyValue(o, n.$members$[t][0]);
 const d = Number.isNaN(a) && Number.isNaN(o), c = o !== a && !d;
 if ((!(8 & r) || void 0 === a) && c && (s.$instanceValues$.set(t, o), 
 i)) {
  if (2 == (18 & r)) {
   scheduleUpdate(s, !1);
  }
 }
}, proxyComponent = (e, t, o) => {
 if (t.$members$) {
  const n = Object.entries(t.$members$), s = e.prototype;
  if (n.map((([e, [n]]) => {
   (31 & n || (2 & o) && 32 & n) ? Object.defineProperty(s, e, {
    get() {
     return getValue(this, e);
    },
    set(s) {
     setValue(this, e, s, t);
    },
    configurable: !0,
    enumerable: !0
   }) : BUILD.method   ;
  })), (1 & o)) {
   const o = new Map;
   s.attributeChangedCallback = function(e, t, n) {
    plt.jmp((() => {
     const t = o.get(e);
     if (this.hasOwnProperty(t)) n = this[t], delete this[t]; else if (s.hasOwnProperty(t) && "number" == typeof this[t] && this[t] == n) return;
     this[t] = (null !== n || "boolean" != typeof this[t]) && n;
    }));
   }, e.observedAttributes = n.filter((([e, t]) => 15 & t[0])).map((([e, n]) => {
    const s = n[1] || e;
    return o.set(s, e), s;
   }));
  }
 }
 return e;
}, initializeComponent = async (e, t, o, n, s) => {
 if (0 == (32 & t.$flags$)) {
  {
   if (t.$flags$ |= 32, (s = loadModule(o)).then) {
    const e = (() => {});
    s = await s, e();
   }
   !s.isProxied && (proxyComponent(s, o, 2), s.isProxied = !0);
   const e = createTime("createInstance", o.$tagName$);
   (t.$flags$ |= 8);
   try {
    new s(t);
   } catch (e) {
    consoleError(e);
   }
   (t.$flags$ &= -9), e(), 
   fireConnectedCallback();
  }
  if (s.style) {
   let n = s.style;
   const l = getScopeId(o);
   if (!styles.has(l)) {
    const e = createTime("registerStyles", o.$tagName$);
    registerStyle(l, n), e();
   }
  }
 }
 const r = t.$ancestorComponent$, i = () => scheduleUpdate(t, !0);
 r && r["s-rc"] ? r["s-rc"].push(i) : i();
}, fireConnectedCallback = e => {
}, connectedCallback = e => {
 if (0 == (1 & plt.$flags$)) {
  const t = getHostRef(e), o = t.$cmpMeta$, n = createTime("connectedCallback", o.$tagName$);
  if (1 & t.$flags$) ; else {
   let n;
   if (t.$flags$ |= 1, (n = e.getAttribute("s-id"), n)) {
    ((e, t, o, n) => {
     const s = createTime("hydrateClient", t), l = e.shadowRoot, a = [], r = l ? [] : null, i = n.$vnode$ = newVNode(t, null);
     plt.$orgLocNodes$ || initializeDocumentHydrate(doc.body, plt.$orgLocNodes$ = new Map), 
     e["s-id"] = o, e.removeAttribute("s-id"), clientHydrate(i, a, [], r, e, e, o), a.map((e => {
      const o = e.$hostId$ + "." + e.$nodeId$, n = plt.$orgLocNodes$.get(o), s = e.$elm$;
      n && supportsShadow && "" === n["s-en"] && n.parentNode.insertBefore(s, n.nextSibling), 
      l || (s["s-hn"] = t, n && (s["s-ol"] = n, s["s-ol"]["s-nr"] = s)), plt.$orgLocNodes$.delete(o);
     })), l && r.map((e => {
      e && l.appendChild(e);
     })), s();
    })(e, o.$tagName$, n, t);
   }
   if (!n && (BUILD.hydrateServerSide ) && setContentReference(e), 
   BUILD.asyncLoading) {
    let o = e;
    for (;o = o.parentNode || o.host; ) if (1 === o.nodeType && o.hasAttribute("s-id") && o["s-p"] || o["s-p"]) {
     attachToAncestor(t, t.$ancestorComponent$ = o);
     break;
    }
   }
   initializeComponent(e, t, o);
  }
  n();
 }
}, setContentReference = e => {
 const t = e["s-cr"] = doc.createComment("");
 t["s-cn"] = !0, e.insertBefore(t, e.firstChild);
}, insertVdomAnnotations = (e, t) => {
 if (null != e) {
  const o = {
   hostIds: 0,
   rootLevelIds: 0,
   staticComponents: new Set(t)
  }, n = [];
  parseVNodeAnnotations(e, e.body, o, n), n.forEach((t => {
   if (null != t) {
    const n = t["s-nr"];
    let s = n["s-host-id"], l = n["s-node-id"], a = `${s}.${l}`;
    if (null == s) if (s = 0, o.rootLevelIds++, l = o.rootLevelIds, a = `${s}.${l}`, 
    1 === n.nodeType) n.setAttribute("c-id", a); else if (3 === n.nodeType) {
     if (0 === s && "" === n.nodeValue.trim()) return void t.remove();
     const o = e.createComment(a);
     o.nodeValue = `t.${a}`, n.parentNode.insertBefore(o, n);
    }
    let r = `o.${a}`;
    const i = t.parentElement;
    i && ("" === i["s-en"] ? r += "." : "c" === i["s-en"] && (r += ".c")), t.nodeValue = r;
   }
  }));
 }
}, parseVNodeAnnotations = (e, t, o, n) => {
 null != t && (null != t["s-nr"] && n.push(t), 1 === t.nodeType && t.childNodes.forEach((t => {
  const s = getHostRef(t);
  if (null != s && !o.staticComponents.has(t.nodeName.toLowerCase())) {
   const n = {
    nodeIds: 0
   };
   insertVNodeAnnotations(e, t, s.$vnode$, o, n);
  }
  parseVNodeAnnotations(e, t, o, n);
 })));
}, insertVNodeAnnotations = (e, t, o, n, s) => {
 if (null != o) {
  const l = ++n.hostIds;
  if (t.setAttribute("s-id", l), null != t["s-cr"] && (t["s-cr"].nodeValue = `r.${l}`), 
  null != o.$children$) {
   const t = 0;
   o.$children$.forEach(((o, n) => {
    insertChildVNodeAnnotations(e, o, s, l, t, n);
   }));
  }
  if (t && o && o.$elm$ && !t.hasAttribute("c-id")) {
   const e = t.parentElement;
   if (e && e.childNodes) {
    const n = Array.from(e.childNodes), s = n.find((e => 8 === e.nodeType && e["s-sr"]));
    if (s) {
     const e = n.indexOf(t) - 1;
     o.$elm$.setAttribute("c-id", `${s["s-host-id"]}.${s["s-node-id"]}.0.${e}`);
    }
   }
  }
 }
}, insertChildVNodeAnnotations = (e, t, o, n, s, l) => {
 const a = t.$elm$;
 if (null == a) return;
 const r = o.nodeIds++, i = `${n}.${r}.${s}.${l}`;
 if (a["s-host-id"] = n, a["s-node-id"] = r, 1 === a.nodeType) a.setAttribute("c-id", i); else if (3 === a.nodeType) {
  const t = a.parentNode, o = t.nodeName;
  if ("STYLE" !== o && "SCRIPT" !== o) {
   const o = `t.${i}`, n = e.createComment(o);
   t.insertBefore(n, a);
  }
 } else if (8 === a.nodeType && a["s-sr"]) {
  const e = `s.${i}.${a["s-sn"] || ""}`;
  a.nodeValue = e;
 }
 if (null != t.$children$) {
  const l = s + 1;
  t.$children$.forEach(((t, s) => {
   insertChildVNodeAnnotations(e, t, o, n, l, s);
  }));
 }
}, NO_HYDRATE_TAGS = new Set([ "CODE", "HEAD", "IFRAME", "INPUT", "OBJECT", "OUTPUT", "NOSCRIPT", "PRE", "SCRIPT", "SELECT", "STYLE", "TEMPLATE", "TEXTAREA" ]), hAsync = (e, t, ...o) => {
 if (Array.isArray(o) && o.length > 0) {
  const n = o.flat(1 / 0);
  return n.some(isPromise) ? Promise.all(n).then((o => h(e, t, ...o))).catch((o => h(e, t))) : h(e, t, ...o);
 }
 return h(e, t);
};

const cmpModules = new Map, getModule = e => {
 if ("string" == typeof e) {
  e = e.toLowerCase();
  const t = cmpModules.get(e);
  if (null != t) return t[e];
 }
 return null;
}, loadModule = (e, t, o) => getModule(e.$tagName$), isMemberInElement = (e, t) => {
 if (null != e) {
  if (t in e) return !0;
  const o = getModule(e.nodeName);
  if (null != o) {
   const e = o;
   if (null != e && null != e.cmpMeta && null != e.cmpMeta.$members$) return t in e.cmpMeta.$members$;
  }
 }
 return !1;
}, registerComponents = e => {
 for (const t of e) {
  const e = t.cmpMeta.$tagName$;
  cmpModules.set(e, {
   [e]: t
  });
 }
}, win = window, doc = win.document, writeTask = e => {
 process.nextTick((() => {
  try {
   e();
  } catch (e) {
   consoleError(e);
  }
 }));
}, resolved = Promise.resolve(), nextTick = e => resolved.then(e), defaultConsoleError = e => {
 null != e && console.error(e.stack || e.message || e);
}, consoleError = (e, t) => (defaultConsoleError)(e, t), plt = {
 $flags$: 0,
 $resourcesUrl$: "",
 jmp: e => e(),
 raf: e => requestAnimationFrame(e),
 ael: (e, t, o, n) => e.addEventListener(t, o, n),
 rel: (e, t, o, n) => e.removeEventListener(t, o, n),
 ce: (e, t) => new win.CustomEvent(e, t)
}, supportsShadow = !1, hostRefs = new WeakMap, getHostRef = e => hostRefs.get(e), registerInstance = (e, t) => hostRefs.set(t.$lazyInstance$ = e, t), registerHost = (e, t) => {
 const o = {
  $flags$: 0,
  $cmpMeta$: t,
  $hostElement$: e,
  $instanceValues$: new Map,
  $renderCount$: 0
 };
 return o.$onInstancePromise$ = new Promise((e => o.$onInstanceResolve$ = e)), o.$onReadyPromise$ = new Promise((e => o.$onReadyResolve$ = e)), 
 e["s-p"] = [], e["s-rc"] = [], hostRefs.set(e, o);
}, styles = new Map;

const gwButtonCss = "/*!@*,\n*::before,\n*::after*/*.sc-gw-button,*.sc-gw-button::before,*.sc-gw-button::after{box-sizing:border-box}@media (prefers-reduced-motion: no-preference){/*!@:root*/.sc-gw-button:root{scroll-behavior:smooth}}/*!@body*/body.sc-gw-button{margin:0;font-family:system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", \"Liberation Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";font-size:1rem;font-weight:400;line-height:1.5;color:#212529;background-color:#fff;-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:rgba(0, 0, 0, 0)}/*!@hr*/hr.sc-gw-button{margin:1rem 0;color:inherit;background-color:currentColor;border:0;opacity:0.25}/*!@hr:not([size])*/hr.sc-gw-button:not([size]){height:1px}/*!@h6,\nh5,\nh4,\nh3,\nh2,\nh1*/h6.sc-gw-button,h5.sc-gw-button,h4.sc-gw-button,h3.sc-gw-button,h2.sc-gw-button,h1.sc-gw-button{margin-top:0;margin-bottom:0.5rem;font-weight:500;line-height:1.2}/*!@h1*/h1.sc-gw-button{font-size:calc(1.375rem + 1.5vw)}@media (min-width: 1200px){/*!@h1*/h1.sc-gw-button{font-size:2.5rem}}/*!@h2*/h2.sc-gw-button{font-size:calc(1.325rem + 0.9vw)}@media (min-width: 1200px){/*!@h2*/h2.sc-gw-button{font-size:2rem}}/*!@h3*/h3.sc-gw-button{font-size:calc(1.3rem + 0.6vw)}@media (min-width: 1200px){/*!@h3*/h3.sc-gw-button{font-size:1.75rem}}/*!@h4*/h4.sc-gw-button{font-size:calc(1.275rem + 0.3vw)}@media (min-width: 1200px){/*!@h4*/h4.sc-gw-button{font-size:1.5rem}}/*!@h5*/h5.sc-gw-button{font-size:1.25rem}/*!@h6*/h6.sc-gw-button{font-size:1rem}/*!@p*/p.sc-gw-button{margin-top:0;margin-bottom:1rem}/*!@abbr[title],\nabbr[data-bs-original-title]*/abbr[title].sc-gw-button,abbr[data-bs-original-title].sc-gw-button{-webkit-text-decoration:underline dotted;text-decoration:underline dotted;cursor:help;-webkit-text-decoration-skip-ink:none;text-decoration-skip-ink:none}/*!@address*/address.sc-gw-button{margin-bottom:1rem;font-style:normal;line-height:inherit}/*!@ol,\nul*/ol.sc-gw-button,ul.sc-gw-button{padding-left:2rem}/*!@ol,\nul,\ndl*/ol.sc-gw-button,ul.sc-gw-button,dl.sc-gw-button{margin-top:0;margin-bottom:1rem}/*!@ol ol,\nul ul,\nol ul,\nul ol*/ol.sc-gw-button ol.sc-gw-button,ul.sc-gw-button ul.sc-gw-button,ol.sc-gw-button ul.sc-gw-button,ul.sc-gw-button ol.sc-gw-button{margin-bottom:0}/*!@dt*/dt.sc-gw-button{font-weight:700}/*!@dd*/dd.sc-gw-button{margin-bottom:0.5rem;margin-left:0}/*!@blockquote*/blockquote.sc-gw-button{margin:0 0 1rem}/*!@b,\nstrong*/b.sc-gw-button,strong.sc-gw-button{font-weight:bolder}/*!@small*/small.sc-gw-button{font-size:0.875em}/*!@mark*/mark.sc-gw-button{padding:0.2em;background-color:#fcf8e3}/*!@sub,\nsup*/sub.sc-gw-button,sup.sc-gw-button{position:relative;font-size:0.75em;line-height:0;vertical-align:baseline}/*!@sub*/sub.sc-gw-button{bottom:-0.25em}/*!@sup*/sup.sc-gw-button{top:-0.5em}/*!@a*/a.sc-gw-button{color:#0d6efd;text-decoration:underline}/*!@a:hover*/a.sc-gw-button:hover{color:#0a58ca}/*!@a:not([href]):not([class]),\na:not([href]):not([class]):hover*/a.sc-gw-button:not([href]):not([class]),a.sc-gw-button:not([href]):not([class]):hover{color:inherit;text-decoration:none}/*!@pre,\ncode,\nkbd,\nsamp*/pre.sc-gw-button,code.sc-gw-button,kbd.sc-gw-button,samp.sc-gw-button{font-family:SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;font-size:1em;direction:ltr;unicode-bidi:bidi-override}/*!@pre*/pre.sc-gw-button{display:block;margin-top:0;margin-bottom:1rem;overflow:auto;font-size:0.875em}/*!@pre code*/pre.sc-gw-button code.sc-gw-button{font-size:inherit;color:inherit;word-break:normal}/*!@code*/code.sc-gw-button{font-size:0.875em;color:#d63384;word-wrap:break-word}/*!@a > code*/a.sc-gw-button>code.sc-gw-button{color:inherit}/*!@kbd*/kbd.sc-gw-button{padding:0.2rem 0.4rem;font-size:0.875em;color:#fff;background-color:#212529;border-radius:0.2rem}/*!@kbd kbd*/kbd.sc-gw-button kbd.sc-gw-button{padding:0;font-size:1em;font-weight:700}/*!@figure*/figure.sc-gw-button{margin:0 0 1rem}/*!@img,\nsvg*/img.sc-gw-button,svg.sc-gw-button{vertical-align:middle}/*!@table*/table.sc-gw-button{caption-side:bottom;border-collapse:collapse}/*!@caption*/caption.sc-gw-button{padding-top:0.5rem;padding-bottom:0.5rem;color:#6c757d;text-align:left}/*!@th*/th.sc-gw-button{text-align:inherit;text-align:-webkit-match-parent}/*!@thead,\ntbody,\ntfoot,\ntr,\ntd,\nth*/thead.sc-gw-button,tbody.sc-gw-button,tfoot.sc-gw-button,tr.sc-gw-button,td.sc-gw-button,th.sc-gw-button{border-color:inherit;border-style:solid;border-width:0}/*!@label*/label.sc-gw-button{display:inline-block}/*!@button*/button.sc-gw-button{border-radius:0}/*!@button:focus:not(:focus-visible)*/button.sc-gw-button:focus:not(:focus-visible){outline:0}/*!@input,\nbutton,\nselect,\noptgroup,\ntextarea*/input.sc-gw-button,button.sc-gw-button,select.sc-gw-button,optgroup.sc-gw-button,textarea.sc-gw-button{margin:0;font-family:inherit;font-size:inherit;line-height:inherit}/*!@button,\nselect*/button.sc-gw-button,select.sc-gw-button{text-transform:none}/*!@[role=button]*/[role=button].sc-gw-button{cursor:pointer}/*!@select*/select.sc-gw-button{word-wrap:normal}/*!@select:disabled*/select.sc-gw-button:disabled{opacity:1}/*!@[list]::-webkit-calendar-picker-indicator*/[list].sc-gw-button::-webkit-calendar-picker-indicator{display:none}/*!@button,\n[type=button],\n[type=reset],\n[type=submit]*/button.sc-gw-button,[type=button].sc-gw-button,[type=reset].sc-gw-button,[type=submit].sc-gw-button{-webkit-appearance:button}/*!@button:not(:disabled),\n[type=button]:not(:disabled),\n[type=reset]:not(:disabled),\n[type=submit]:not(:disabled)*/button.sc-gw-button:not(:disabled),[type=button].sc-gw-button:not(:disabled),[type=reset].sc-gw-button:not(:disabled),[type=submit].sc-gw-button:not(:disabled){cursor:pointer}/*!@::-moz-focus-inner*/.sc-gw-button::-moz-focus-inner{padding:0;border-style:none}/*!@textarea*/textarea.sc-gw-button{resize:vertical}/*!@fieldset*/fieldset.sc-gw-button{min-width:0;padding:0;margin:0;border:0}/*!@legend*/legend.sc-gw-button{float:left;width:100%;padding:0;margin-bottom:0.5rem;font-size:calc(1.275rem + 0.3vw);line-height:inherit}@media (min-width: 1200px){/*!@legend*/legend.sc-gw-button{font-size:1.5rem}}/*!@legend + **/legend.sc-gw-button+*.sc-gw-button{clear:left}/*!@::-webkit-datetime-edit-fields-wrapper,\n::-webkit-datetime-edit-text,\n::-webkit-datetime-edit-minute,\n::-webkit-datetime-edit-hour-field,\n::-webkit-datetime-edit-day-field,\n::-webkit-datetime-edit-month-field,\n::-webkit-datetime-edit-year-field*/.sc-gw-button::-webkit-datetime-edit-fields-wrapper,.sc-gw-button::-webkit-datetime-edit-text,.sc-gw-button::-webkit-datetime-edit-minute,.sc-gw-button::-webkit-datetime-edit-hour-field,.sc-gw-button::-webkit-datetime-edit-day-field,.sc-gw-button::-webkit-datetime-edit-month-field,.sc-gw-button::-webkit-datetime-edit-year-field{padding:0}/*!@::-webkit-inner-spin-button*/.sc-gw-button::-webkit-inner-spin-button{height:auto}/*!@[type=search]*/[type=search].sc-gw-button{outline-offset:-2px;-webkit-appearance:textfield}/*!@::-webkit-search-decoration*/.sc-gw-button::-webkit-search-decoration{-webkit-appearance:none}/*!@::-webkit-color-swatch-wrapper*/.sc-gw-button::-webkit-color-swatch-wrapper{padding:0}/*!@::file-selector-button*/.sc-gw-button::file-selector-button{font:inherit}/*!@::-webkit-file-upload-button*/.sc-gw-button::-webkit-file-upload-button{font:inherit;-webkit-appearance:button}/*!@output*/output.sc-gw-button{display:inline-block}/*!@iframe*/iframe.sc-gw-button{border:0}/*!@summary*/summary.sc-gw-button{display:list-item;cursor:pointer}/*!@progress*/progress.sc-gw-button{vertical-align:baseline}/*!@[hidden]*/[hidden].sc-gw-button{display:none !important}/*!@.container,\n.container-fluid,\n.container-xxl,\n.container-xl,\n.container-lg,\n.container-md,\n.container-sm*/.container.sc-gw-button,.container-fluid.sc-gw-button,.container-xxl.sc-gw-button,.container-xl.sc-gw-button,.container-lg.sc-gw-button,.container-md.sc-gw-button,.container-sm.sc-gw-button{width:100%;padding-right:var(--bs-gutter-x, 0.75rem);padding-left:var(--bs-gutter-x, 0.75rem);margin-right:auto;margin-left:auto}@media (min-width: 576px){/*!@.container-sm,\n.container*/.container-sm.sc-gw-button,.container.sc-gw-button{max-width:540px}}@media (min-width: 768px){/*!@.container-md,\n.container-sm,\n.container*/.container-md.sc-gw-button,.container-sm.sc-gw-button,.container.sc-gw-button{max-width:720px}}@media (min-width: 992px){/*!@.container-lg,\n.container-md,\n.container-sm,\n.container*/.container-lg.sc-gw-button,.container-md.sc-gw-button,.container-sm.sc-gw-button,.container.sc-gw-button{max-width:960px}}@media (min-width: 1200px){/*!@.container-xl,\n.container-lg,\n.container-md,\n.container-sm,\n.container*/.container-xl.sc-gw-button,.container-lg.sc-gw-button,.container-md.sc-gw-button,.container-sm.sc-gw-button,.container.sc-gw-button{max-width:1140px}}@media (min-width: 1400px){/*!@.container-xxl,\n.container-xl,\n.container-lg,\n.container-md,\n.container-sm,\n.container*/.container-xxl.sc-gw-button,.container-xl.sc-gw-button,.container-lg.sc-gw-button,.container-md.sc-gw-button,.container-sm.sc-gw-button,.container.sc-gw-button{max-width:1320px}}/*!@.row*/.row.sc-gw-button{--bs-gutter-x:1.5rem;--bs-gutter-y:0;display:flex;flex-wrap:wrap;margin-top:calc(var(--bs-gutter-y) * -1);margin-right:calc(var(--bs-gutter-x) * -0.5);margin-left:calc(var(--bs-gutter-x) * -0.5)}/*!@.row > **/.row.sc-gw-button>*.sc-gw-button{box-sizing:border-box;flex-shrink:0;width:100%;max-width:100%;padding-right:calc(var(--bs-gutter-x) * 0.5);padding-left:calc(var(--bs-gutter-x) * 0.5);margin-top:var(--bs-gutter-y)}/*!@.col*/.col.sc-gw-button{flex:1 0 0%}/*!@.row-cols-auto > **/.row-cols-auto.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:auto}/*!@.row-cols-1 > **/.row-cols-1.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:100%}/*!@.row-cols-2 > **/.row-cols-2.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:50%}/*!@.row-cols-3 > **/.row-cols-3.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-4 > **/.row-cols-4.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:25%}/*!@.row-cols-5 > **/.row-cols-5.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:20%}/*!@.row-cols-6 > **/.row-cols-6.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:16.6666666667%}@media (min-width: 576px){/*!@.col-sm*/.col-sm.sc-gw-button{flex:1 0 0%}/*!@.row-cols-sm-auto > **/.row-cols-sm-auto.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:auto}/*!@.row-cols-sm-1 > **/.row-cols-sm-1.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:100%}/*!@.row-cols-sm-2 > **/.row-cols-sm-2.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:50%}/*!@.row-cols-sm-3 > **/.row-cols-sm-3.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-sm-4 > **/.row-cols-sm-4.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:25%}/*!@.row-cols-sm-5 > **/.row-cols-sm-5.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:20%}/*!@.row-cols-sm-6 > **/.row-cols-sm-6.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:16.6666666667%}}@media (min-width: 768px){/*!@.col-md*/.col-md.sc-gw-button{flex:1 0 0%}/*!@.row-cols-md-auto > **/.row-cols-md-auto.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:auto}/*!@.row-cols-md-1 > **/.row-cols-md-1.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:100%}/*!@.row-cols-md-2 > **/.row-cols-md-2.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:50%}/*!@.row-cols-md-3 > **/.row-cols-md-3.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-md-4 > **/.row-cols-md-4.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:25%}/*!@.row-cols-md-5 > **/.row-cols-md-5.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:20%}/*!@.row-cols-md-6 > **/.row-cols-md-6.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:16.6666666667%}}@media (min-width: 992px){/*!@.col-lg*/.col-lg.sc-gw-button{flex:1 0 0%}/*!@.row-cols-lg-auto > **/.row-cols-lg-auto.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:auto}/*!@.row-cols-lg-1 > **/.row-cols-lg-1.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:100%}/*!@.row-cols-lg-2 > **/.row-cols-lg-2.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:50%}/*!@.row-cols-lg-3 > **/.row-cols-lg-3.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-lg-4 > **/.row-cols-lg-4.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:25%}/*!@.row-cols-lg-5 > **/.row-cols-lg-5.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:20%}/*!@.row-cols-lg-6 > **/.row-cols-lg-6.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:16.6666666667%}}@media (min-width: 1200px){/*!@.col-xl*/.col-xl.sc-gw-button{flex:1 0 0%}/*!@.row-cols-xl-auto > **/.row-cols-xl-auto.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:auto}/*!@.row-cols-xl-1 > **/.row-cols-xl-1.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:100%}/*!@.row-cols-xl-2 > **/.row-cols-xl-2.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:50%}/*!@.row-cols-xl-3 > **/.row-cols-xl-3.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-xl-4 > **/.row-cols-xl-4.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:25%}/*!@.row-cols-xl-5 > **/.row-cols-xl-5.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:20%}/*!@.row-cols-xl-6 > **/.row-cols-xl-6.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:16.6666666667%}}@media (min-width: 1400px){/*!@.col-xxl*/.col-xxl.sc-gw-button{flex:1 0 0%}/*!@.row-cols-xxl-auto > **/.row-cols-xxl-auto.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:auto}/*!@.row-cols-xxl-1 > **/.row-cols-xxl-1.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:100%}/*!@.row-cols-xxl-2 > **/.row-cols-xxl-2.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:50%}/*!@.row-cols-xxl-3 > **/.row-cols-xxl-3.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-xxl-4 > **/.row-cols-xxl-4.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:25%}/*!@.row-cols-xxl-5 > **/.row-cols-xxl-5.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:20%}/*!@.row-cols-xxl-6 > **/.row-cols-xxl-6.sc-gw-button>*.sc-gw-button{flex:0 0 auto;width:16.6666666667%}}/*!@.col-auto*/.col-auto.sc-gw-button{flex:0 0 auto;width:auto}/*!@.col-1*/.col-1.sc-gw-button{flex:0 0 auto;width:8.33333333%}/*!@.col-2*/.col-2.sc-gw-button{flex:0 0 auto;width:16.66666667%}/*!@.col-3*/.col-3.sc-gw-button{flex:0 0 auto;width:25%}/*!@.col-4*/.col-4.sc-gw-button{flex:0 0 auto;width:33.33333333%}/*!@.col-5*/.col-5.sc-gw-button{flex:0 0 auto;width:41.66666667%}/*!@.col-6*/.col-6.sc-gw-button{flex:0 0 auto;width:50%}/*!@.col-7*/.col-7.sc-gw-button{flex:0 0 auto;width:58.33333333%}/*!@.col-8*/.col-8.sc-gw-button{flex:0 0 auto;width:66.66666667%}/*!@.col-9*/.col-9.sc-gw-button{flex:0 0 auto;width:75%}/*!@.col-10*/.col-10.sc-gw-button{flex:0 0 auto;width:83.33333333%}/*!@.col-11*/.col-11.sc-gw-button{flex:0 0 auto;width:91.66666667%}/*!@.col-12*/.col-12.sc-gw-button{flex:0 0 auto;width:100%}/*!@.offset-1*/.offset-1.sc-gw-button{margin-left:8.33333333%}/*!@.offset-2*/.offset-2.sc-gw-button{margin-left:16.66666667%}/*!@.offset-3*/.offset-3.sc-gw-button{margin-left:25%}/*!@.offset-4*/.offset-4.sc-gw-button{margin-left:33.33333333%}/*!@.offset-5*/.offset-5.sc-gw-button{margin-left:41.66666667%}/*!@.offset-6*/.offset-6.sc-gw-button{margin-left:50%}/*!@.offset-7*/.offset-7.sc-gw-button{margin-left:58.33333333%}/*!@.offset-8*/.offset-8.sc-gw-button{margin-left:66.66666667%}/*!@.offset-9*/.offset-9.sc-gw-button{margin-left:75%}/*!@.offset-10*/.offset-10.sc-gw-button{margin-left:83.33333333%}/*!@.offset-11*/.offset-11.sc-gw-button{margin-left:91.66666667%}/*!@.g-0,\n.gx-0*/.g-0.sc-gw-button,.gx-0.sc-gw-button{--bs-gutter-x:0}/*!@.g-0,\n.gy-0*/.g-0.sc-gw-button,.gy-0.sc-gw-button{--bs-gutter-y:0}/*!@.g-1,\n.gx-1*/.g-1.sc-gw-button,.gx-1.sc-gw-button{--bs-gutter-x:0.25rem}/*!@.g-1,\n.gy-1*/.g-1.sc-gw-button,.gy-1.sc-gw-button{--bs-gutter-y:0.25rem}/*!@.g-2,\n.gx-2*/.g-2.sc-gw-button,.gx-2.sc-gw-button{--bs-gutter-x:0.5rem}/*!@.g-2,\n.gy-2*/.g-2.sc-gw-button,.gy-2.sc-gw-button{--bs-gutter-y:0.5rem}/*!@.g-3,\n.gx-3*/.g-3.sc-gw-button,.gx-3.sc-gw-button{--bs-gutter-x:1rem}/*!@.g-3,\n.gy-3*/.g-3.sc-gw-button,.gy-3.sc-gw-button{--bs-gutter-y:1rem}/*!@.g-4,\n.gx-4*/.g-4.sc-gw-button,.gx-4.sc-gw-button{--bs-gutter-x:1.5rem}/*!@.g-4,\n.gy-4*/.g-4.sc-gw-button,.gy-4.sc-gw-button{--bs-gutter-y:1.5rem}/*!@.g-5,\n.gx-5*/.g-5.sc-gw-button,.gx-5.sc-gw-button{--bs-gutter-x:3rem}/*!@.g-5,\n.gy-5*/.g-5.sc-gw-button,.gy-5.sc-gw-button{--bs-gutter-y:3rem}@media (min-width: 576px){/*!@.col-sm-auto*/.col-sm-auto.sc-gw-button{flex:0 0 auto;width:auto}/*!@.col-sm-1*/.col-sm-1.sc-gw-button{flex:0 0 auto;width:8.33333333%}/*!@.col-sm-2*/.col-sm-2.sc-gw-button{flex:0 0 auto;width:16.66666667%}/*!@.col-sm-3*/.col-sm-3.sc-gw-button{flex:0 0 auto;width:25%}/*!@.col-sm-4*/.col-sm-4.sc-gw-button{flex:0 0 auto;width:33.33333333%}/*!@.col-sm-5*/.col-sm-5.sc-gw-button{flex:0 0 auto;width:41.66666667%}/*!@.col-sm-6*/.col-sm-6.sc-gw-button{flex:0 0 auto;width:50%}/*!@.col-sm-7*/.col-sm-7.sc-gw-button{flex:0 0 auto;width:58.33333333%}/*!@.col-sm-8*/.col-sm-8.sc-gw-button{flex:0 0 auto;width:66.66666667%}/*!@.col-sm-9*/.col-sm-9.sc-gw-button{flex:0 0 auto;width:75%}/*!@.col-sm-10*/.col-sm-10.sc-gw-button{flex:0 0 auto;width:83.33333333%}/*!@.col-sm-11*/.col-sm-11.sc-gw-button{flex:0 0 auto;width:91.66666667%}/*!@.col-sm-12*/.col-sm-12.sc-gw-button{flex:0 0 auto;width:100%}/*!@.offset-sm-0*/.offset-sm-0.sc-gw-button{margin-left:0}/*!@.offset-sm-1*/.offset-sm-1.sc-gw-button{margin-left:8.33333333%}/*!@.offset-sm-2*/.offset-sm-2.sc-gw-button{margin-left:16.66666667%}/*!@.offset-sm-3*/.offset-sm-3.sc-gw-button{margin-left:25%}/*!@.offset-sm-4*/.offset-sm-4.sc-gw-button{margin-left:33.33333333%}/*!@.offset-sm-5*/.offset-sm-5.sc-gw-button{margin-left:41.66666667%}/*!@.offset-sm-6*/.offset-sm-6.sc-gw-button{margin-left:50%}/*!@.offset-sm-7*/.offset-sm-7.sc-gw-button{margin-left:58.33333333%}/*!@.offset-sm-8*/.offset-sm-8.sc-gw-button{margin-left:66.66666667%}/*!@.offset-sm-9*/.offset-sm-9.sc-gw-button{margin-left:75%}/*!@.offset-sm-10*/.offset-sm-10.sc-gw-button{margin-left:83.33333333%}/*!@.offset-sm-11*/.offset-sm-11.sc-gw-button{margin-left:91.66666667%}/*!@.g-sm-0,\n.gx-sm-0*/.g-sm-0.sc-gw-button,.gx-sm-0.sc-gw-button{--bs-gutter-x:0}/*!@.g-sm-0,\n.gy-sm-0*/.g-sm-0.sc-gw-button,.gy-sm-0.sc-gw-button{--bs-gutter-y:0}/*!@.g-sm-1,\n.gx-sm-1*/.g-sm-1.sc-gw-button,.gx-sm-1.sc-gw-button{--bs-gutter-x:0.25rem}/*!@.g-sm-1,\n.gy-sm-1*/.g-sm-1.sc-gw-button,.gy-sm-1.sc-gw-button{--bs-gutter-y:0.25rem}/*!@.g-sm-2,\n.gx-sm-2*/.g-sm-2.sc-gw-button,.gx-sm-2.sc-gw-button{--bs-gutter-x:0.5rem}/*!@.g-sm-2,\n.gy-sm-2*/.g-sm-2.sc-gw-button,.gy-sm-2.sc-gw-button{--bs-gutter-y:0.5rem}/*!@.g-sm-3,\n.gx-sm-3*/.g-sm-3.sc-gw-button,.gx-sm-3.sc-gw-button{--bs-gutter-x:1rem}/*!@.g-sm-3,\n.gy-sm-3*/.g-sm-3.sc-gw-button,.gy-sm-3.sc-gw-button{--bs-gutter-y:1rem}/*!@.g-sm-4,\n.gx-sm-4*/.g-sm-4.sc-gw-button,.gx-sm-4.sc-gw-button{--bs-gutter-x:1.5rem}/*!@.g-sm-4,\n.gy-sm-4*/.g-sm-4.sc-gw-button,.gy-sm-4.sc-gw-button{--bs-gutter-y:1.5rem}/*!@.g-sm-5,\n.gx-sm-5*/.g-sm-5.sc-gw-button,.gx-sm-5.sc-gw-button{--bs-gutter-x:3rem}/*!@.g-sm-5,\n.gy-sm-5*/.g-sm-5.sc-gw-button,.gy-sm-5.sc-gw-button{--bs-gutter-y:3rem}}@media (min-width: 768px){/*!@.col-md-auto*/.col-md-auto.sc-gw-button{flex:0 0 auto;width:auto}/*!@.col-md-1*/.col-md-1.sc-gw-button{flex:0 0 auto;width:8.33333333%}/*!@.col-md-2*/.col-md-2.sc-gw-button{flex:0 0 auto;width:16.66666667%}/*!@.col-md-3*/.col-md-3.sc-gw-button{flex:0 0 auto;width:25%}/*!@.col-md-4*/.col-md-4.sc-gw-button{flex:0 0 auto;width:33.33333333%}/*!@.col-md-5*/.col-md-5.sc-gw-button{flex:0 0 auto;width:41.66666667%}/*!@.col-md-6*/.col-md-6.sc-gw-button{flex:0 0 auto;width:50%}/*!@.col-md-7*/.col-md-7.sc-gw-button{flex:0 0 auto;width:58.33333333%}/*!@.col-md-8*/.col-md-8.sc-gw-button{flex:0 0 auto;width:66.66666667%}/*!@.col-md-9*/.col-md-9.sc-gw-button{flex:0 0 auto;width:75%}/*!@.col-md-10*/.col-md-10.sc-gw-button{flex:0 0 auto;width:83.33333333%}/*!@.col-md-11*/.col-md-11.sc-gw-button{flex:0 0 auto;width:91.66666667%}/*!@.col-md-12*/.col-md-12.sc-gw-button{flex:0 0 auto;width:100%}/*!@.offset-md-0*/.offset-md-0.sc-gw-button{margin-left:0}/*!@.offset-md-1*/.offset-md-1.sc-gw-button{margin-left:8.33333333%}/*!@.offset-md-2*/.offset-md-2.sc-gw-button{margin-left:16.66666667%}/*!@.offset-md-3*/.offset-md-3.sc-gw-button{margin-left:25%}/*!@.offset-md-4*/.offset-md-4.sc-gw-button{margin-left:33.33333333%}/*!@.offset-md-5*/.offset-md-5.sc-gw-button{margin-left:41.66666667%}/*!@.offset-md-6*/.offset-md-6.sc-gw-button{margin-left:50%}/*!@.offset-md-7*/.offset-md-7.sc-gw-button{margin-left:58.33333333%}/*!@.offset-md-8*/.offset-md-8.sc-gw-button{margin-left:66.66666667%}/*!@.offset-md-9*/.offset-md-9.sc-gw-button{margin-left:75%}/*!@.offset-md-10*/.offset-md-10.sc-gw-button{margin-left:83.33333333%}/*!@.offset-md-11*/.offset-md-11.sc-gw-button{margin-left:91.66666667%}/*!@.g-md-0,\n.gx-md-0*/.g-md-0.sc-gw-button,.gx-md-0.sc-gw-button{--bs-gutter-x:0}/*!@.g-md-0,\n.gy-md-0*/.g-md-0.sc-gw-button,.gy-md-0.sc-gw-button{--bs-gutter-y:0}/*!@.g-md-1,\n.gx-md-1*/.g-md-1.sc-gw-button,.gx-md-1.sc-gw-button{--bs-gutter-x:0.25rem}/*!@.g-md-1,\n.gy-md-1*/.g-md-1.sc-gw-button,.gy-md-1.sc-gw-button{--bs-gutter-y:0.25rem}/*!@.g-md-2,\n.gx-md-2*/.g-md-2.sc-gw-button,.gx-md-2.sc-gw-button{--bs-gutter-x:0.5rem}/*!@.g-md-2,\n.gy-md-2*/.g-md-2.sc-gw-button,.gy-md-2.sc-gw-button{--bs-gutter-y:0.5rem}/*!@.g-md-3,\n.gx-md-3*/.g-md-3.sc-gw-button,.gx-md-3.sc-gw-button{--bs-gutter-x:1rem}/*!@.g-md-3,\n.gy-md-3*/.g-md-3.sc-gw-button,.gy-md-3.sc-gw-button{--bs-gutter-y:1rem}/*!@.g-md-4,\n.gx-md-4*/.g-md-4.sc-gw-button,.gx-md-4.sc-gw-button{--bs-gutter-x:1.5rem}/*!@.g-md-4,\n.gy-md-4*/.g-md-4.sc-gw-button,.gy-md-4.sc-gw-button{--bs-gutter-y:1.5rem}/*!@.g-md-5,\n.gx-md-5*/.g-md-5.sc-gw-button,.gx-md-5.sc-gw-button{--bs-gutter-x:3rem}/*!@.g-md-5,\n.gy-md-5*/.g-md-5.sc-gw-button,.gy-md-5.sc-gw-button{--bs-gutter-y:3rem}}@media (min-width: 992px){/*!@.col-lg-auto*/.col-lg-auto.sc-gw-button{flex:0 0 auto;width:auto}/*!@.col-lg-1*/.col-lg-1.sc-gw-button{flex:0 0 auto;width:8.33333333%}/*!@.col-lg-2*/.col-lg-2.sc-gw-button{flex:0 0 auto;width:16.66666667%}/*!@.col-lg-3*/.col-lg-3.sc-gw-button{flex:0 0 auto;width:25%}/*!@.col-lg-4*/.col-lg-4.sc-gw-button{flex:0 0 auto;width:33.33333333%}/*!@.col-lg-5*/.col-lg-5.sc-gw-button{flex:0 0 auto;width:41.66666667%}/*!@.col-lg-6*/.col-lg-6.sc-gw-button{flex:0 0 auto;width:50%}/*!@.col-lg-7*/.col-lg-7.sc-gw-button{flex:0 0 auto;width:58.33333333%}/*!@.col-lg-8*/.col-lg-8.sc-gw-button{flex:0 0 auto;width:66.66666667%}/*!@.col-lg-9*/.col-lg-9.sc-gw-button{flex:0 0 auto;width:75%}/*!@.col-lg-10*/.col-lg-10.sc-gw-button{flex:0 0 auto;width:83.33333333%}/*!@.col-lg-11*/.col-lg-11.sc-gw-button{flex:0 0 auto;width:91.66666667%}/*!@.col-lg-12*/.col-lg-12.sc-gw-button{flex:0 0 auto;width:100%}/*!@.offset-lg-0*/.offset-lg-0.sc-gw-button{margin-left:0}/*!@.offset-lg-1*/.offset-lg-1.sc-gw-button{margin-left:8.33333333%}/*!@.offset-lg-2*/.offset-lg-2.sc-gw-button{margin-left:16.66666667%}/*!@.offset-lg-3*/.offset-lg-3.sc-gw-button{margin-left:25%}/*!@.offset-lg-4*/.offset-lg-4.sc-gw-button{margin-left:33.33333333%}/*!@.offset-lg-5*/.offset-lg-5.sc-gw-button{margin-left:41.66666667%}/*!@.offset-lg-6*/.offset-lg-6.sc-gw-button{margin-left:50%}/*!@.offset-lg-7*/.offset-lg-7.sc-gw-button{margin-left:58.33333333%}/*!@.offset-lg-8*/.offset-lg-8.sc-gw-button{margin-left:66.66666667%}/*!@.offset-lg-9*/.offset-lg-9.sc-gw-button{margin-left:75%}/*!@.offset-lg-10*/.offset-lg-10.sc-gw-button{margin-left:83.33333333%}/*!@.offset-lg-11*/.offset-lg-11.sc-gw-button{margin-left:91.66666667%}/*!@.g-lg-0,\n.gx-lg-0*/.g-lg-0.sc-gw-button,.gx-lg-0.sc-gw-button{--bs-gutter-x:0}/*!@.g-lg-0,\n.gy-lg-0*/.g-lg-0.sc-gw-button,.gy-lg-0.sc-gw-button{--bs-gutter-y:0}/*!@.g-lg-1,\n.gx-lg-1*/.g-lg-1.sc-gw-button,.gx-lg-1.sc-gw-button{--bs-gutter-x:0.25rem}/*!@.g-lg-1,\n.gy-lg-1*/.g-lg-1.sc-gw-button,.gy-lg-1.sc-gw-button{--bs-gutter-y:0.25rem}/*!@.g-lg-2,\n.gx-lg-2*/.g-lg-2.sc-gw-button,.gx-lg-2.sc-gw-button{--bs-gutter-x:0.5rem}/*!@.g-lg-2,\n.gy-lg-2*/.g-lg-2.sc-gw-button,.gy-lg-2.sc-gw-button{--bs-gutter-y:0.5rem}/*!@.g-lg-3,\n.gx-lg-3*/.g-lg-3.sc-gw-button,.gx-lg-3.sc-gw-button{--bs-gutter-x:1rem}/*!@.g-lg-3,\n.gy-lg-3*/.g-lg-3.sc-gw-button,.gy-lg-3.sc-gw-button{--bs-gutter-y:1rem}/*!@.g-lg-4,\n.gx-lg-4*/.g-lg-4.sc-gw-button,.gx-lg-4.sc-gw-button{--bs-gutter-x:1.5rem}/*!@.g-lg-4,\n.gy-lg-4*/.g-lg-4.sc-gw-button,.gy-lg-4.sc-gw-button{--bs-gutter-y:1.5rem}/*!@.g-lg-5,\n.gx-lg-5*/.g-lg-5.sc-gw-button,.gx-lg-5.sc-gw-button{--bs-gutter-x:3rem}/*!@.g-lg-5,\n.gy-lg-5*/.g-lg-5.sc-gw-button,.gy-lg-5.sc-gw-button{--bs-gutter-y:3rem}}@media (min-width: 1200px){/*!@.col-xl-auto*/.col-xl-auto.sc-gw-button{flex:0 0 auto;width:auto}/*!@.col-xl-1*/.col-xl-1.sc-gw-button{flex:0 0 auto;width:8.33333333%}/*!@.col-xl-2*/.col-xl-2.sc-gw-button{flex:0 0 auto;width:16.66666667%}/*!@.col-xl-3*/.col-xl-3.sc-gw-button{flex:0 0 auto;width:25%}/*!@.col-xl-4*/.col-xl-4.sc-gw-button{flex:0 0 auto;width:33.33333333%}/*!@.col-xl-5*/.col-xl-5.sc-gw-button{flex:0 0 auto;width:41.66666667%}/*!@.col-xl-6*/.col-xl-6.sc-gw-button{flex:0 0 auto;width:50%}/*!@.col-xl-7*/.col-xl-7.sc-gw-button{flex:0 0 auto;width:58.33333333%}/*!@.col-xl-8*/.col-xl-8.sc-gw-button{flex:0 0 auto;width:66.66666667%}/*!@.col-xl-9*/.col-xl-9.sc-gw-button{flex:0 0 auto;width:75%}/*!@.col-xl-10*/.col-xl-10.sc-gw-button{flex:0 0 auto;width:83.33333333%}/*!@.col-xl-11*/.col-xl-11.sc-gw-button{flex:0 0 auto;width:91.66666667%}/*!@.col-xl-12*/.col-xl-12.sc-gw-button{flex:0 0 auto;width:100%}/*!@.offset-xl-0*/.offset-xl-0.sc-gw-button{margin-left:0}/*!@.offset-xl-1*/.offset-xl-1.sc-gw-button{margin-left:8.33333333%}/*!@.offset-xl-2*/.offset-xl-2.sc-gw-button{margin-left:16.66666667%}/*!@.offset-xl-3*/.offset-xl-3.sc-gw-button{margin-left:25%}/*!@.offset-xl-4*/.offset-xl-4.sc-gw-button{margin-left:33.33333333%}/*!@.offset-xl-5*/.offset-xl-5.sc-gw-button{margin-left:41.66666667%}/*!@.offset-xl-6*/.offset-xl-6.sc-gw-button{margin-left:50%}/*!@.offset-xl-7*/.offset-xl-7.sc-gw-button{margin-left:58.33333333%}/*!@.offset-xl-8*/.offset-xl-8.sc-gw-button{margin-left:66.66666667%}/*!@.offset-xl-9*/.offset-xl-9.sc-gw-button{margin-left:75%}/*!@.offset-xl-10*/.offset-xl-10.sc-gw-button{margin-left:83.33333333%}/*!@.offset-xl-11*/.offset-xl-11.sc-gw-button{margin-left:91.66666667%}/*!@.g-xl-0,\n.gx-xl-0*/.g-xl-0.sc-gw-button,.gx-xl-0.sc-gw-button{--bs-gutter-x:0}/*!@.g-xl-0,\n.gy-xl-0*/.g-xl-0.sc-gw-button,.gy-xl-0.sc-gw-button{--bs-gutter-y:0}/*!@.g-xl-1,\n.gx-xl-1*/.g-xl-1.sc-gw-button,.gx-xl-1.sc-gw-button{--bs-gutter-x:0.25rem}/*!@.g-xl-1,\n.gy-xl-1*/.g-xl-1.sc-gw-button,.gy-xl-1.sc-gw-button{--bs-gutter-y:0.25rem}/*!@.g-xl-2,\n.gx-xl-2*/.g-xl-2.sc-gw-button,.gx-xl-2.sc-gw-button{--bs-gutter-x:0.5rem}/*!@.g-xl-2,\n.gy-xl-2*/.g-xl-2.sc-gw-button,.gy-xl-2.sc-gw-button{--bs-gutter-y:0.5rem}/*!@.g-xl-3,\n.gx-xl-3*/.g-xl-3.sc-gw-button,.gx-xl-3.sc-gw-button{--bs-gutter-x:1rem}/*!@.g-xl-3,\n.gy-xl-3*/.g-xl-3.sc-gw-button,.gy-xl-3.sc-gw-button{--bs-gutter-y:1rem}/*!@.g-xl-4,\n.gx-xl-4*/.g-xl-4.sc-gw-button,.gx-xl-4.sc-gw-button{--bs-gutter-x:1.5rem}/*!@.g-xl-4,\n.gy-xl-4*/.g-xl-4.sc-gw-button,.gy-xl-4.sc-gw-button{--bs-gutter-y:1.5rem}/*!@.g-xl-5,\n.gx-xl-5*/.g-xl-5.sc-gw-button,.gx-xl-5.sc-gw-button{--bs-gutter-x:3rem}/*!@.g-xl-5,\n.gy-xl-5*/.g-xl-5.sc-gw-button,.gy-xl-5.sc-gw-button{--bs-gutter-y:3rem}}@media (min-width: 1400px){/*!@.col-xxl-auto*/.col-xxl-auto.sc-gw-button{flex:0 0 auto;width:auto}/*!@.col-xxl-1*/.col-xxl-1.sc-gw-button{flex:0 0 auto;width:8.33333333%}/*!@.col-xxl-2*/.col-xxl-2.sc-gw-button{flex:0 0 auto;width:16.66666667%}/*!@.col-xxl-3*/.col-xxl-3.sc-gw-button{flex:0 0 auto;width:25%}/*!@.col-xxl-4*/.col-xxl-4.sc-gw-button{flex:0 0 auto;width:33.33333333%}/*!@.col-xxl-5*/.col-xxl-5.sc-gw-button{flex:0 0 auto;width:41.66666667%}/*!@.col-xxl-6*/.col-xxl-6.sc-gw-button{flex:0 0 auto;width:50%}/*!@.col-xxl-7*/.col-xxl-7.sc-gw-button{flex:0 0 auto;width:58.33333333%}/*!@.col-xxl-8*/.col-xxl-8.sc-gw-button{flex:0 0 auto;width:66.66666667%}/*!@.col-xxl-9*/.col-xxl-9.sc-gw-button{flex:0 0 auto;width:75%}/*!@.col-xxl-10*/.col-xxl-10.sc-gw-button{flex:0 0 auto;width:83.33333333%}/*!@.col-xxl-11*/.col-xxl-11.sc-gw-button{flex:0 0 auto;width:91.66666667%}/*!@.col-xxl-12*/.col-xxl-12.sc-gw-button{flex:0 0 auto;width:100%}/*!@.offset-xxl-0*/.offset-xxl-0.sc-gw-button{margin-left:0}/*!@.offset-xxl-1*/.offset-xxl-1.sc-gw-button{margin-left:8.33333333%}/*!@.offset-xxl-2*/.offset-xxl-2.sc-gw-button{margin-left:16.66666667%}/*!@.offset-xxl-3*/.offset-xxl-3.sc-gw-button{margin-left:25%}/*!@.offset-xxl-4*/.offset-xxl-4.sc-gw-button{margin-left:33.33333333%}/*!@.offset-xxl-5*/.offset-xxl-5.sc-gw-button{margin-left:41.66666667%}/*!@.offset-xxl-6*/.offset-xxl-6.sc-gw-button{margin-left:50%}/*!@.offset-xxl-7*/.offset-xxl-7.sc-gw-button{margin-left:58.33333333%}/*!@.offset-xxl-8*/.offset-xxl-8.sc-gw-button{margin-left:66.66666667%}/*!@.offset-xxl-9*/.offset-xxl-9.sc-gw-button{margin-left:75%}/*!@.offset-xxl-10*/.offset-xxl-10.sc-gw-button{margin-left:83.33333333%}/*!@.offset-xxl-11*/.offset-xxl-11.sc-gw-button{margin-left:91.66666667%}/*!@.g-xxl-0,\n.gx-xxl-0*/.g-xxl-0.sc-gw-button,.gx-xxl-0.sc-gw-button{--bs-gutter-x:0}/*!@.g-xxl-0,\n.gy-xxl-0*/.g-xxl-0.sc-gw-button,.gy-xxl-0.sc-gw-button{--bs-gutter-y:0}/*!@.g-xxl-1,\n.gx-xxl-1*/.g-xxl-1.sc-gw-button,.gx-xxl-1.sc-gw-button{--bs-gutter-x:0.25rem}/*!@.g-xxl-1,\n.gy-xxl-1*/.g-xxl-1.sc-gw-button,.gy-xxl-1.sc-gw-button{--bs-gutter-y:0.25rem}/*!@.g-xxl-2,\n.gx-xxl-2*/.g-xxl-2.sc-gw-button,.gx-xxl-2.sc-gw-button{--bs-gutter-x:0.5rem}/*!@.g-xxl-2,\n.gy-xxl-2*/.g-xxl-2.sc-gw-button,.gy-xxl-2.sc-gw-button{--bs-gutter-y:0.5rem}/*!@.g-xxl-3,\n.gx-xxl-3*/.g-xxl-3.sc-gw-button,.gx-xxl-3.sc-gw-button{--bs-gutter-x:1rem}/*!@.g-xxl-3,\n.gy-xxl-3*/.g-xxl-3.sc-gw-button,.gy-xxl-3.sc-gw-button{--bs-gutter-y:1rem}/*!@.g-xxl-4,\n.gx-xxl-4*/.g-xxl-4.sc-gw-button,.gx-xxl-4.sc-gw-button{--bs-gutter-x:1.5rem}/*!@.g-xxl-4,\n.gy-xxl-4*/.g-xxl-4.sc-gw-button,.gy-xxl-4.sc-gw-button{--bs-gutter-y:1.5rem}/*!@.g-xxl-5,\n.gx-xxl-5*/.g-xxl-5.sc-gw-button,.gx-xxl-5.sc-gw-button{--bs-gutter-x:3rem}/*!@.g-xxl-5,\n.gy-xxl-5*/.g-xxl-5.sc-gw-button,.gy-xxl-5.sc-gw-button{--bs-gutter-y:3rem}}/*!@.d-inline*/.d-inline.sc-gw-button{display:inline !important}/*!@.d-inline-block*/.d-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-block*/.d-block.sc-gw-button{display:block !important}/*!@.d-grid*/.d-grid.sc-gw-button{display:grid !important}/*!@.d-table*/.d-table.sc-gw-button{display:table !important}/*!@.d-table-row*/.d-table-row.sc-gw-button{display:table-row !important}/*!@.d-table-cell*/.d-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-flex*/.d-flex.sc-gw-button{display:flex !important}/*!@.d-inline-flex*/.d-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-none*/.d-none.sc-gw-button{display:none !important}/*!@.flex-fill*/.flex-fill.sc-gw-button{flex:1 1 auto !important}/*!@.flex-row*/.flex-row.sc-gw-button{flex-direction:row !important}/*!@.flex-column*/.flex-column.sc-gw-button{flex-direction:column !important}/*!@.flex-row-reverse*/.flex-row-reverse.sc-gw-button{flex-direction:row-reverse !important}/*!@.flex-column-reverse*/.flex-column-reverse.sc-gw-button{flex-direction:column-reverse !important}/*!@.flex-grow-0*/.flex-grow-0.sc-gw-button{flex-grow:0 !important}/*!@.flex-grow-1*/.flex-grow-1.sc-gw-button{flex-grow:1 !important}/*!@.flex-shrink-0*/.flex-shrink-0.sc-gw-button{flex-shrink:0 !important}/*!@.flex-shrink-1*/.flex-shrink-1.sc-gw-button{flex-shrink:1 !important}/*!@.flex-wrap*/.flex-wrap.sc-gw-button{flex-wrap:wrap !important}/*!@.flex-nowrap*/.flex-nowrap.sc-gw-button{flex-wrap:nowrap !important}/*!@.flex-wrap-reverse*/.flex-wrap-reverse.sc-gw-button{flex-wrap:wrap-reverse !important}/*!@.justify-content-start*/.justify-content-start.sc-gw-button{justify-content:flex-start !important}/*!@.justify-content-end*/.justify-content-end.sc-gw-button{justify-content:flex-end !important}/*!@.justify-content-center*/.justify-content-center.sc-gw-button{justify-content:center !important}/*!@.justify-content-between*/.justify-content-between.sc-gw-button{justify-content:space-between !important}/*!@.justify-content-around*/.justify-content-around.sc-gw-button{justify-content:space-around !important}/*!@.justify-content-evenly*/.justify-content-evenly.sc-gw-button{justify-content:space-evenly !important}/*!@.align-items-start*/.align-items-start.sc-gw-button{align-items:flex-start !important}/*!@.align-items-end*/.align-items-end.sc-gw-button{align-items:flex-end !important}/*!@.align-items-center*/.align-items-center.sc-gw-button{align-items:center !important}/*!@.align-items-baseline*/.align-items-baseline.sc-gw-button{align-items:baseline !important}/*!@.align-items-stretch*/.align-items-stretch.sc-gw-button{align-items:stretch !important}/*!@.align-content-start*/.align-content-start.sc-gw-button{align-content:flex-start !important}/*!@.align-content-end*/.align-content-end.sc-gw-button{align-content:flex-end !important}/*!@.align-content-center*/.align-content-center.sc-gw-button{align-content:center !important}/*!@.align-content-between*/.align-content-between.sc-gw-button{align-content:space-between !important}/*!@.align-content-around*/.align-content-around.sc-gw-button{align-content:space-around !important}/*!@.align-content-stretch*/.align-content-stretch.sc-gw-button{align-content:stretch !important}/*!@.align-self-auto*/.align-self-auto.sc-gw-button{align-self:auto !important}/*!@.align-self-start*/.align-self-start.sc-gw-button{align-self:flex-start !important}/*!@.align-self-end*/.align-self-end.sc-gw-button{align-self:flex-end !important}/*!@.align-self-center*/.align-self-center.sc-gw-button{align-self:center !important}/*!@.align-self-baseline*/.align-self-baseline.sc-gw-button{align-self:baseline !important}/*!@.align-self-stretch*/.align-self-stretch.sc-gw-button{align-self:stretch !important}/*!@.order-first*/.order-first.sc-gw-button{order:-1 !important}/*!@.order-0*/.order-0.sc-gw-button{order:0 !important}/*!@.order-1*/.order-1.sc-gw-button{order:1 !important}/*!@.order-2*/.order-2.sc-gw-button{order:2 !important}/*!@.order-3*/.order-3.sc-gw-button{order:3 !important}/*!@.order-4*/.order-4.sc-gw-button{order:4 !important}/*!@.order-5*/.order-5.sc-gw-button{order:5 !important}/*!@.order-last*/.order-last.sc-gw-button{order:6 !important}/*!@.m-0*/.m-0.sc-gw-button{margin:0 !important}/*!@.m-1*/.m-1.sc-gw-button{margin:0.25rem !important}/*!@.m-2*/.m-2.sc-gw-button{margin:0.5rem !important}/*!@.m-3*/.m-3.sc-gw-button{margin:1rem !important}/*!@.m-4*/.m-4.sc-gw-button{margin:1.5rem !important}/*!@.m-5*/.m-5.sc-gw-button{margin:3rem !important}/*!@.m-auto*/.m-auto.sc-gw-button{margin:auto !important}/*!@.mx-0*/.mx-0.sc-gw-button{margin-right:0 !important;margin-left:0 !important}/*!@.mx-1*/.mx-1.sc-gw-button{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-2*/.mx-2.sc-gw-button{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-3*/.mx-3.sc-gw-button{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-4*/.mx-4.sc-gw-button{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-5*/.mx-5.sc-gw-button{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-auto*/.mx-auto.sc-gw-button{margin-right:auto !important;margin-left:auto !important}/*!@.my-0*/.my-0.sc-gw-button{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-1*/.my-1.sc-gw-button{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-2*/.my-2.sc-gw-button{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-3*/.my-3.sc-gw-button{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-4*/.my-4.sc-gw-button{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-5*/.my-5.sc-gw-button{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-auto*/.my-auto.sc-gw-button{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-0*/.mt-0.sc-gw-button{margin-top:0 !important}/*!@.mt-1*/.mt-1.sc-gw-button{margin-top:0.25rem !important}/*!@.mt-2*/.mt-2.sc-gw-button{margin-top:0.5rem !important}/*!@.mt-3*/.mt-3.sc-gw-button{margin-top:1rem !important}/*!@.mt-4*/.mt-4.sc-gw-button{margin-top:1.5rem !important}/*!@.mt-5*/.mt-5.sc-gw-button{margin-top:3rem !important}/*!@.mt-auto*/.mt-auto.sc-gw-button{margin-top:auto !important}/*!@.me-0*/.me-0.sc-gw-button{margin-right:0 !important}/*!@.me-1*/.me-1.sc-gw-button{margin-right:0.25rem !important}/*!@.me-2*/.me-2.sc-gw-button{margin-right:0.5rem !important}/*!@.me-3*/.me-3.sc-gw-button{margin-right:1rem !important}/*!@.me-4*/.me-4.sc-gw-button{margin-right:1.5rem !important}/*!@.me-5*/.me-5.sc-gw-button{margin-right:3rem !important}/*!@.me-auto*/.me-auto.sc-gw-button{margin-right:auto !important}/*!@.mb-0*/.mb-0.sc-gw-button{margin-bottom:0 !important}/*!@.mb-1*/.mb-1.sc-gw-button{margin-bottom:0.25rem !important}/*!@.mb-2*/.mb-2.sc-gw-button{margin-bottom:0.5rem !important}/*!@.mb-3*/.mb-3.sc-gw-button{margin-bottom:1rem !important}/*!@.mb-4*/.mb-4.sc-gw-button{margin-bottom:1.5rem !important}/*!@.mb-5*/.mb-5.sc-gw-button{margin-bottom:3rem !important}/*!@.mb-auto*/.mb-auto.sc-gw-button{margin-bottom:auto !important}/*!@.ms-0*/.ms-0.sc-gw-button{margin-left:0 !important}/*!@.ms-1*/.ms-1.sc-gw-button{margin-left:0.25rem !important}/*!@.ms-2*/.ms-2.sc-gw-button{margin-left:0.5rem !important}/*!@.ms-3*/.ms-3.sc-gw-button{margin-left:1rem !important}/*!@.ms-4*/.ms-4.sc-gw-button{margin-left:1.5rem !important}/*!@.ms-5*/.ms-5.sc-gw-button{margin-left:3rem !important}/*!@.ms-auto*/.ms-auto.sc-gw-button{margin-left:auto !important}/*!@.p-0*/.p-0.sc-gw-button{padding:0 !important}/*!@.p-1*/.p-1.sc-gw-button{padding:0.25rem !important}/*!@.p-2*/.p-2.sc-gw-button{padding:0.5rem !important}/*!@.p-3*/.p-3.sc-gw-button{padding:1rem !important}/*!@.p-4*/.p-4.sc-gw-button{padding:1.5rem !important}/*!@.p-5*/.p-5.sc-gw-button{padding:3rem !important}/*!@.px-0*/.px-0.sc-gw-button{padding-right:0 !important;padding-left:0 !important}/*!@.px-1*/.px-1.sc-gw-button{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-2*/.px-2.sc-gw-button{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-3*/.px-3.sc-gw-button{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-4*/.px-4.sc-gw-button{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-5*/.px-5.sc-gw-button{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-0*/.py-0.sc-gw-button{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-1*/.py-1.sc-gw-button{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-2*/.py-2.sc-gw-button{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-3*/.py-3.sc-gw-button{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-4*/.py-4.sc-gw-button{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-5*/.py-5.sc-gw-button{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-0*/.pt-0.sc-gw-button{padding-top:0 !important}/*!@.pt-1*/.pt-1.sc-gw-button{padding-top:0.25rem !important}/*!@.pt-2*/.pt-2.sc-gw-button{padding-top:0.5rem !important}/*!@.pt-3*/.pt-3.sc-gw-button{padding-top:1rem !important}/*!@.pt-4*/.pt-4.sc-gw-button{padding-top:1.5rem !important}/*!@.pt-5*/.pt-5.sc-gw-button{padding-top:3rem !important}/*!@.pe-0*/.pe-0.sc-gw-button{padding-right:0 !important}/*!@.pe-1*/.pe-1.sc-gw-button{padding-right:0.25rem !important}/*!@.pe-2*/.pe-2.sc-gw-button{padding-right:0.5rem !important}/*!@.pe-3*/.pe-3.sc-gw-button{padding-right:1rem !important}/*!@.pe-4*/.pe-4.sc-gw-button{padding-right:1.5rem !important}/*!@.pe-5*/.pe-5.sc-gw-button{padding-right:3rem !important}/*!@.pb-0*/.pb-0.sc-gw-button{padding-bottom:0 !important}/*!@.pb-1*/.pb-1.sc-gw-button{padding-bottom:0.25rem !important}/*!@.pb-2*/.pb-2.sc-gw-button{padding-bottom:0.5rem !important}/*!@.pb-3*/.pb-3.sc-gw-button{padding-bottom:1rem !important}/*!@.pb-4*/.pb-4.sc-gw-button{padding-bottom:1.5rem !important}/*!@.pb-5*/.pb-5.sc-gw-button{padding-bottom:3rem !important}/*!@.ps-0*/.ps-0.sc-gw-button{padding-left:0 !important}/*!@.ps-1*/.ps-1.sc-gw-button{padding-left:0.25rem !important}/*!@.ps-2*/.ps-2.sc-gw-button{padding-left:0.5rem !important}/*!@.ps-3*/.ps-3.sc-gw-button{padding-left:1rem !important}/*!@.ps-4*/.ps-4.sc-gw-button{padding-left:1.5rem !important}/*!@.ps-5*/.ps-5.sc-gw-button{padding-left:3rem !important}@media (min-width: 576px){/*!@.d-sm-inline*/.d-sm-inline.sc-gw-button{display:inline !important}/*!@.d-sm-inline-block*/.d-sm-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-sm-block*/.d-sm-block.sc-gw-button{display:block !important}/*!@.d-sm-grid*/.d-sm-grid.sc-gw-button{display:grid !important}/*!@.d-sm-table*/.d-sm-table.sc-gw-button{display:table !important}/*!@.d-sm-table-row*/.d-sm-table-row.sc-gw-button{display:table-row !important}/*!@.d-sm-table-cell*/.d-sm-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-sm-flex*/.d-sm-flex.sc-gw-button{display:flex !important}/*!@.d-sm-inline-flex*/.d-sm-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-sm-none*/.d-sm-none.sc-gw-button{display:none !important}/*!@.flex-sm-fill*/.flex-sm-fill.sc-gw-button{flex:1 1 auto !important}/*!@.flex-sm-row*/.flex-sm-row.sc-gw-button{flex-direction:row !important}/*!@.flex-sm-column*/.flex-sm-column.sc-gw-button{flex-direction:column !important}/*!@.flex-sm-row-reverse*/.flex-sm-row-reverse.sc-gw-button{flex-direction:row-reverse !important}/*!@.flex-sm-column-reverse*/.flex-sm-column-reverse.sc-gw-button{flex-direction:column-reverse !important}/*!@.flex-sm-grow-0*/.flex-sm-grow-0.sc-gw-button{flex-grow:0 !important}/*!@.flex-sm-grow-1*/.flex-sm-grow-1.sc-gw-button{flex-grow:1 !important}/*!@.flex-sm-shrink-0*/.flex-sm-shrink-0.sc-gw-button{flex-shrink:0 !important}/*!@.flex-sm-shrink-1*/.flex-sm-shrink-1.sc-gw-button{flex-shrink:1 !important}/*!@.flex-sm-wrap*/.flex-sm-wrap.sc-gw-button{flex-wrap:wrap !important}/*!@.flex-sm-nowrap*/.flex-sm-nowrap.sc-gw-button{flex-wrap:nowrap !important}/*!@.flex-sm-wrap-reverse*/.flex-sm-wrap-reverse.sc-gw-button{flex-wrap:wrap-reverse !important}/*!@.justify-content-sm-start*/.justify-content-sm-start.sc-gw-button{justify-content:flex-start !important}/*!@.justify-content-sm-end*/.justify-content-sm-end.sc-gw-button{justify-content:flex-end !important}/*!@.justify-content-sm-center*/.justify-content-sm-center.sc-gw-button{justify-content:center !important}/*!@.justify-content-sm-between*/.justify-content-sm-between.sc-gw-button{justify-content:space-between !important}/*!@.justify-content-sm-around*/.justify-content-sm-around.sc-gw-button{justify-content:space-around !important}/*!@.justify-content-sm-evenly*/.justify-content-sm-evenly.sc-gw-button{justify-content:space-evenly !important}/*!@.align-items-sm-start*/.align-items-sm-start.sc-gw-button{align-items:flex-start !important}/*!@.align-items-sm-end*/.align-items-sm-end.sc-gw-button{align-items:flex-end !important}/*!@.align-items-sm-center*/.align-items-sm-center.sc-gw-button{align-items:center !important}/*!@.align-items-sm-baseline*/.align-items-sm-baseline.sc-gw-button{align-items:baseline !important}/*!@.align-items-sm-stretch*/.align-items-sm-stretch.sc-gw-button{align-items:stretch !important}/*!@.align-content-sm-start*/.align-content-sm-start.sc-gw-button{align-content:flex-start !important}/*!@.align-content-sm-end*/.align-content-sm-end.sc-gw-button{align-content:flex-end !important}/*!@.align-content-sm-center*/.align-content-sm-center.sc-gw-button{align-content:center !important}/*!@.align-content-sm-between*/.align-content-sm-between.sc-gw-button{align-content:space-between !important}/*!@.align-content-sm-around*/.align-content-sm-around.sc-gw-button{align-content:space-around !important}/*!@.align-content-sm-stretch*/.align-content-sm-stretch.sc-gw-button{align-content:stretch !important}/*!@.align-self-sm-auto*/.align-self-sm-auto.sc-gw-button{align-self:auto !important}/*!@.align-self-sm-start*/.align-self-sm-start.sc-gw-button{align-self:flex-start !important}/*!@.align-self-sm-end*/.align-self-sm-end.sc-gw-button{align-self:flex-end !important}/*!@.align-self-sm-center*/.align-self-sm-center.sc-gw-button{align-self:center !important}/*!@.align-self-sm-baseline*/.align-self-sm-baseline.sc-gw-button{align-self:baseline !important}/*!@.align-self-sm-stretch*/.align-self-sm-stretch.sc-gw-button{align-self:stretch !important}/*!@.order-sm-first*/.order-sm-first.sc-gw-button{order:-1 !important}/*!@.order-sm-0*/.order-sm-0.sc-gw-button{order:0 !important}/*!@.order-sm-1*/.order-sm-1.sc-gw-button{order:1 !important}/*!@.order-sm-2*/.order-sm-2.sc-gw-button{order:2 !important}/*!@.order-sm-3*/.order-sm-3.sc-gw-button{order:3 !important}/*!@.order-sm-4*/.order-sm-4.sc-gw-button{order:4 !important}/*!@.order-sm-5*/.order-sm-5.sc-gw-button{order:5 !important}/*!@.order-sm-last*/.order-sm-last.sc-gw-button{order:6 !important}/*!@.m-sm-0*/.m-sm-0.sc-gw-button{margin:0 !important}/*!@.m-sm-1*/.m-sm-1.sc-gw-button{margin:0.25rem !important}/*!@.m-sm-2*/.m-sm-2.sc-gw-button{margin:0.5rem !important}/*!@.m-sm-3*/.m-sm-3.sc-gw-button{margin:1rem !important}/*!@.m-sm-4*/.m-sm-4.sc-gw-button{margin:1.5rem !important}/*!@.m-sm-5*/.m-sm-5.sc-gw-button{margin:3rem !important}/*!@.m-sm-auto*/.m-sm-auto.sc-gw-button{margin:auto !important}/*!@.mx-sm-0*/.mx-sm-0.sc-gw-button{margin-right:0 !important;margin-left:0 !important}/*!@.mx-sm-1*/.mx-sm-1.sc-gw-button{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-sm-2*/.mx-sm-2.sc-gw-button{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-sm-3*/.mx-sm-3.sc-gw-button{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-sm-4*/.mx-sm-4.sc-gw-button{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-sm-5*/.mx-sm-5.sc-gw-button{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-sm-auto*/.mx-sm-auto.sc-gw-button{margin-right:auto !important;margin-left:auto !important}/*!@.my-sm-0*/.my-sm-0.sc-gw-button{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-sm-1*/.my-sm-1.sc-gw-button{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-sm-2*/.my-sm-2.sc-gw-button{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-sm-3*/.my-sm-3.sc-gw-button{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-sm-4*/.my-sm-4.sc-gw-button{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-sm-5*/.my-sm-5.sc-gw-button{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-sm-auto*/.my-sm-auto.sc-gw-button{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-sm-0*/.mt-sm-0.sc-gw-button{margin-top:0 !important}/*!@.mt-sm-1*/.mt-sm-1.sc-gw-button{margin-top:0.25rem !important}/*!@.mt-sm-2*/.mt-sm-2.sc-gw-button{margin-top:0.5rem !important}/*!@.mt-sm-3*/.mt-sm-3.sc-gw-button{margin-top:1rem !important}/*!@.mt-sm-4*/.mt-sm-4.sc-gw-button{margin-top:1.5rem !important}/*!@.mt-sm-5*/.mt-sm-5.sc-gw-button{margin-top:3rem !important}/*!@.mt-sm-auto*/.mt-sm-auto.sc-gw-button{margin-top:auto !important}/*!@.me-sm-0*/.me-sm-0.sc-gw-button{margin-right:0 !important}/*!@.me-sm-1*/.me-sm-1.sc-gw-button{margin-right:0.25rem !important}/*!@.me-sm-2*/.me-sm-2.sc-gw-button{margin-right:0.5rem !important}/*!@.me-sm-3*/.me-sm-3.sc-gw-button{margin-right:1rem !important}/*!@.me-sm-4*/.me-sm-4.sc-gw-button{margin-right:1.5rem !important}/*!@.me-sm-5*/.me-sm-5.sc-gw-button{margin-right:3rem !important}/*!@.me-sm-auto*/.me-sm-auto.sc-gw-button{margin-right:auto !important}/*!@.mb-sm-0*/.mb-sm-0.sc-gw-button{margin-bottom:0 !important}/*!@.mb-sm-1*/.mb-sm-1.sc-gw-button{margin-bottom:0.25rem !important}/*!@.mb-sm-2*/.mb-sm-2.sc-gw-button{margin-bottom:0.5rem !important}/*!@.mb-sm-3*/.mb-sm-3.sc-gw-button{margin-bottom:1rem !important}/*!@.mb-sm-4*/.mb-sm-4.sc-gw-button{margin-bottom:1.5rem !important}/*!@.mb-sm-5*/.mb-sm-5.sc-gw-button{margin-bottom:3rem !important}/*!@.mb-sm-auto*/.mb-sm-auto.sc-gw-button{margin-bottom:auto !important}/*!@.ms-sm-0*/.ms-sm-0.sc-gw-button{margin-left:0 !important}/*!@.ms-sm-1*/.ms-sm-1.sc-gw-button{margin-left:0.25rem !important}/*!@.ms-sm-2*/.ms-sm-2.sc-gw-button{margin-left:0.5rem !important}/*!@.ms-sm-3*/.ms-sm-3.sc-gw-button{margin-left:1rem !important}/*!@.ms-sm-4*/.ms-sm-4.sc-gw-button{margin-left:1.5rem !important}/*!@.ms-sm-5*/.ms-sm-5.sc-gw-button{margin-left:3rem !important}/*!@.ms-sm-auto*/.ms-sm-auto.sc-gw-button{margin-left:auto !important}/*!@.p-sm-0*/.p-sm-0.sc-gw-button{padding:0 !important}/*!@.p-sm-1*/.p-sm-1.sc-gw-button{padding:0.25rem !important}/*!@.p-sm-2*/.p-sm-2.sc-gw-button{padding:0.5rem !important}/*!@.p-sm-3*/.p-sm-3.sc-gw-button{padding:1rem !important}/*!@.p-sm-4*/.p-sm-4.sc-gw-button{padding:1.5rem !important}/*!@.p-sm-5*/.p-sm-5.sc-gw-button{padding:3rem !important}/*!@.px-sm-0*/.px-sm-0.sc-gw-button{padding-right:0 !important;padding-left:0 !important}/*!@.px-sm-1*/.px-sm-1.sc-gw-button{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-sm-2*/.px-sm-2.sc-gw-button{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-sm-3*/.px-sm-3.sc-gw-button{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-sm-4*/.px-sm-4.sc-gw-button{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-sm-5*/.px-sm-5.sc-gw-button{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-sm-0*/.py-sm-0.sc-gw-button{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-sm-1*/.py-sm-1.sc-gw-button{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-sm-2*/.py-sm-2.sc-gw-button{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-sm-3*/.py-sm-3.sc-gw-button{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-sm-4*/.py-sm-4.sc-gw-button{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-sm-5*/.py-sm-5.sc-gw-button{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-sm-0*/.pt-sm-0.sc-gw-button{padding-top:0 !important}/*!@.pt-sm-1*/.pt-sm-1.sc-gw-button{padding-top:0.25rem !important}/*!@.pt-sm-2*/.pt-sm-2.sc-gw-button{padding-top:0.5rem !important}/*!@.pt-sm-3*/.pt-sm-3.sc-gw-button{padding-top:1rem !important}/*!@.pt-sm-4*/.pt-sm-4.sc-gw-button{padding-top:1.5rem !important}/*!@.pt-sm-5*/.pt-sm-5.sc-gw-button{padding-top:3rem !important}/*!@.pe-sm-0*/.pe-sm-0.sc-gw-button{padding-right:0 !important}/*!@.pe-sm-1*/.pe-sm-1.sc-gw-button{padding-right:0.25rem !important}/*!@.pe-sm-2*/.pe-sm-2.sc-gw-button{padding-right:0.5rem !important}/*!@.pe-sm-3*/.pe-sm-3.sc-gw-button{padding-right:1rem !important}/*!@.pe-sm-4*/.pe-sm-4.sc-gw-button{padding-right:1.5rem !important}/*!@.pe-sm-5*/.pe-sm-5.sc-gw-button{padding-right:3rem !important}/*!@.pb-sm-0*/.pb-sm-0.sc-gw-button{padding-bottom:0 !important}/*!@.pb-sm-1*/.pb-sm-1.sc-gw-button{padding-bottom:0.25rem !important}/*!@.pb-sm-2*/.pb-sm-2.sc-gw-button{padding-bottom:0.5rem !important}/*!@.pb-sm-3*/.pb-sm-3.sc-gw-button{padding-bottom:1rem !important}/*!@.pb-sm-4*/.pb-sm-4.sc-gw-button{padding-bottom:1.5rem !important}/*!@.pb-sm-5*/.pb-sm-5.sc-gw-button{padding-bottom:3rem !important}/*!@.ps-sm-0*/.ps-sm-0.sc-gw-button{padding-left:0 !important}/*!@.ps-sm-1*/.ps-sm-1.sc-gw-button{padding-left:0.25rem !important}/*!@.ps-sm-2*/.ps-sm-2.sc-gw-button{padding-left:0.5rem !important}/*!@.ps-sm-3*/.ps-sm-3.sc-gw-button{padding-left:1rem !important}/*!@.ps-sm-4*/.ps-sm-4.sc-gw-button{padding-left:1.5rem !important}/*!@.ps-sm-5*/.ps-sm-5.sc-gw-button{padding-left:3rem !important}}@media (min-width: 768px){/*!@.d-md-inline*/.d-md-inline.sc-gw-button{display:inline !important}/*!@.d-md-inline-block*/.d-md-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-md-block*/.d-md-block.sc-gw-button{display:block !important}/*!@.d-md-grid*/.d-md-grid.sc-gw-button{display:grid !important}/*!@.d-md-table*/.d-md-table.sc-gw-button{display:table !important}/*!@.d-md-table-row*/.d-md-table-row.sc-gw-button{display:table-row !important}/*!@.d-md-table-cell*/.d-md-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-md-flex*/.d-md-flex.sc-gw-button{display:flex !important}/*!@.d-md-inline-flex*/.d-md-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-md-none*/.d-md-none.sc-gw-button{display:none !important}/*!@.flex-md-fill*/.flex-md-fill.sc-gw-button{flex:1 1 auto !important}/*!@.flex-md-row*/.flex-md-row.sc-gw-button{flex-direction:row !important}/*!@.flex-md-column*/.flex-md-column.sc-gw-button{flex-direction:column !important}/*!@.flex-md-row-reverse*/.flex-md-row-reverse.sc-gw-button{flex-direction:row-reverse !important}/*!@.flex-md-column-reverse*/.flex-md-column-reverse.sc-gw-button{flex-direction:column-reverse !important}/*!@.flex-md-grow-0*/.flex-md-grow-0.sc-gw-button{flex-grow:0 !important}/*!@.flex-md-grow-1*/.flex-md-grow-1.sc-gw-button{flex-grow:1 !important}/*!@.flex-md-shrink-0*/.flex-md-shrink-0.sc-gw-button{flex-shrink:0 !important}/*!@.flex-md-shrink-1*/.flex-md-shrink-1.sc-gw-button{flex-shrink:1 !important}/*!@.flex-md-wrap*/.flex-md-wrap.sc-gw-button{flex-wrap:wrap !important}/*!@.flex-md-nowrap*/.flex-md-nowrap.sc-gw-button{flex-wrap:nowrap !important}/*!@.flex-md-wrap-reverse*/.flex-md-wrap-reverse.sc-gw-button{flex-wrap:wrap-reverse !important}/*!@.justify-content-md-start*/.justify-content-md-start.sc-gw-button{justify-content:flex-start !important}/*!@.justify-content-md-end*/.justify-content-md-end.sc-gw-button{justify-content:flex-end !important}/*!@.justify-content-md-center*/.justify-content-md-center.sc-gw-button{justify-content:center !important}/*!@.justify-content-md-between*/.justify-content-md-between.sc-gw-button{justify-content:space-between !important}/*!@.justify-content-md-around*/.justify-content-md-around.sc-gw-button{justify-content:space-around !important}/*!@.justify-content-md-evenly*/.justify-content-md-evenly.sc-gw-button{justify-content:space-evenly !important}/*!@.align-items-md-start*/.align-items-md-start.sc-gw-button{align-items:flex-start !important}/*!@.align-items-md-end*/.align-items-md-end.sc-gw-button{align-items:flex-end !important}/*!@.align-items-md-center*/.align-items-md-center.sc-gw-button{align-items:center !important}/*!@.align-items-md-baseline*/.align-items-md-baseline.sc-gw-button{align-items:baseline !important}/*!@.align-items-md-stretch*/.align-items-md-stretch.sc-gw-button{align-items:stretch !important}/*!@.align-content-md-start*/.align-content-md-start.sc-gw-button{align-content:flex-start !important}/*!@.align-content-md-end*/.align-content-md-end.sc-gw-button{align-content:flex-end !important}/*!@.align-content-md-center*/.align-content-md-center.sc-gw-button{align-content:center !important}/*!@.align-content-md-between*/.align-content-md-between.sc-gw-button{align-content:space-between !important}/*!@.align-content-md-around*/.align-content-md-around.sc-gw-button{align-content:space-around !important}/*!@.align-content-md-stretch*/.align-content-md-stretch.sc-gw-button{align-content:stretch !important}/*!@.align-self-md-auto*/.align-self-md-auto.sc-gw-button{align-self:auto !important}/*!@.align-self-md-start*/.align-self-md-start.sc-gw-button{align-self:flex-start !important}/*!@.align-self-md-end*/.align-self-md-end.sc-gw-button{align-self:flex-end !important}/*!@.align-self-md-center*/.align-self-md-center.sc-gw-button{align-self:center !important}/*!@.align-self-md-baseline*/.align-self-md-baseline.sc-gw-button{align-self:baseline !important}/*!@.align-self-md-stretch*/.align-self-md-stretch.sc-gw-button{align-self:stretch !important}/*!@.order-md-first*/.order-md-first.sc-gw-button{order:-1 !important}/*!@.order-md-0*/.order-md-0.sc-gw-button{order:0 !important}/*!@.order-md-1*/.order-md-1.sc-gw-button{order:1 !important}/*!@.order-md-2*/.order-md-2.sc-gw-button{order:2 !important}/*!@.order-md-3*/.order-md-3.sc-gw-button{order:3 !important}/*!@.order-md-4*/.order-md-4.sc-gw-button{order:4 !important}/*!@.order-md-5*/.order-md-5.sc-gw-button{order:5 !important}/*!@.order-md-last*/.order-md-last.sc-gw-button{order:6 !important}/*!@.m-md-0*/.m-md-0.sc-gw-button{margin:0 !important}/*!@.m-md-1*/.m-md-1.sc-gw-button{margin:0.25rem !important}/*!@.m-md-2*/.m-md-2.sc-gw-button{margin:0.5rem !important}/*!@.m-md-3*/.m-md-3.sc-gw-button{margin:1rem !important}/*!@.m-md-4*/.m-md-4.sc-gw-button{margin:1.5rem !important}/*!@.m-md-5*/.m-md-5.sc-gw-button{margin:3rem !important}/*!@.m-md-auto*/.m-md-auto.sc-gw-button{margin:auto !important}/*!@.mx-md-0*/.mx-md-0.sc-gw-button{margin-right:0 !important;margin-left:0 !important}/*!@.mx-md-1*/.mx-md-1.sc-gw-button{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-md-2*/.mx-md-2.sc-gw-button{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-md-3*/.mx-md-3.sc-gw-button{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-md-4*/.mx-md-4.sc-gw-button{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-md-5*/.mx-md-5.sc-gw-button{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-md-auto*/.mx-md-auto.sc-gw-button{margin-right:auto !important;margin-left:auto !important}/*!@.my-md-0*/.my-md-0.sc-gw-button{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-md-1*/.my-md-1.sc-gw-button{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-md-2*/.my-md-2.sc-gw-button{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-md-3*/.my-md-3.sc-gw-button{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-md-4*/.my-md-4.sc-gw-button{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-md-5*/.my-md-5.sc-gw-button{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-md-auto*/.my-md-auto.sc-gw-button{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-md-0*/.mt-md-0.sc-gw-button{margin-top:0 !important}/*!@.mt-md-1*/.mt-md-1.sc-gw-button{margin-top:0.25rem !important}/*!@.mt-md-2*/.mt-md-2.sc-gw-button{margin-top:0.5rem !important}/*!@.mt-md-3*/.mt-md-3.sc-gw-button{margin-top:1rem !important}/*!@.mt-md-4*/.mt-md-4.sc-gw-button{margin-top:1.5rem !important}/*!@.mt-md-5*/.mt-md-5.sc-gw-button{margin-top:3rem !important}/*!@.mt-md-auto*/.mt-md-auto.sc-gw-button{margin-top:auto !important}/*!@.me-md-0*/.me-md-0.sc-gw-button{margin-right:0 !important}/*!@.me-md-1*/.me-md-1.sc-gw-button{margin-right:0.25rem !important}/*!@.me-md-2*/.me-md-2.sc-gw-button{margin-right:0.5rem !important}/*!@.me-md-3*/.me-md-3.sc-gw-button{margin-right:1rem !important}/*!@.me-md-4*/.me-md-4.sc-gw-button{margin-right:1.5rem !important}/*!@.me-md-5*/.me-md-5.sc-gw-button{margin-right:3rem !important}/*!@.me-md-auto*/.me-md-auto.sc-gw-button{margin-right:auto !important}/*!@.mb-md-0*/.mb-md-0.sc-gw-button{margin-bottom:0 !important}/*!@.mb-md-1*/.mb-md-1.sc-gw-button{margin-bottom:0.25rem !important}/*!@.mb-md-2*/.mb-md-2.sc-gw-button{margin-bottom:0.5rem !important}/*!@.mb-md-3*/.mb-md-3.sc-gw-button{margin-bottom:1rem !important}/*!@.mb-md-4*/.mb-md-4.sc-gw-button{margin-bottom:1.5rem !important}/*!@.mb-md-5*/.mb-md-5.sc-gw-button{margin-bottom:3rem !important}/*!@.mb-md-auto*/.mb-md-auto.sc-gw-button{margin-bottom:auto !important}/*!@.ms-md-0*/.ms-md-0.sc-gw-button{margin-left:0 !important}/*!@.ms-md-1*/.ms-md-1.sc-gw-button{margin-left:0.25rem !important}/*!@.ms-md-2*/.ms-md-2.sc-gw-button{margin-left:0.5rem !important}/*!@.ms-md-3*/.ms-md-3.sc-gw-button{margin-left:1rem !important}/*!@.ms-md-4*/.ms-md-4.sc-gw-button{margin-left:1.5rem !important}/*!@.ms-md-5*/.ms-md-5.sc-gw-button{margin-left:3rem !important}/*!@.ms-md-auto*/.ms-md-auto.sc-gw-button{margin-left:auto !important}/*!@.p-md-0*/.p-md-0.sc-gw-button{padding:0 !important}/*!@.p-md-1*/.p-md-1.sc-gw-button{padding:0.25rem !important}/*!@.p-md-2*/.p-md-2.sc-gw-button{padding:0.5rem !important}/*!@.p-md-3*/.p-md-3.sc-gw-button{padding:1rem !important}/*!@.p-md-4*/.p-md-4.sc-gw-button{padding:1.5rem !important}/*!@.p-md-5*/.p-md-5.sc-gw-button{padding:3rem !important}/*!@.px-md-0*/.px-md-0.sc-gw-button{padding-right:0 !important;padding-left:0 !important}/*!@.px-md-1*/.px-md-1.sc-gw-button{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-md-2*/.px-md-2.sc-gw-button{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-md-3*/.px-md-3.sc-gw-button{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-md-4*/.px-md-4.sc-gw-button{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-md-5*/.px-md-5.sc-gw-button{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-md-0*/.py-md-0.sc-gw-button{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-md-1*/.py-md-1.sc-gw-button{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-md-2*/.py-md-2.sc-gw-button{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-md-3*/.py-md-3.sc-gw-button{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-md-4*/.py-md-4.sc-gw-button{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-md-5*/.py-md-5.sc-gw-button{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-md-0*/.pt-md-0.sc-gw-button{padding-top:0 !important}/*!@.pt-md-1*/.pt-md-1.sc-gw-button{padding-top:0.25rem !important}/*!@.pt-md-2*/.pt-md-2.sc-gw-button{padding-top:0.5rem !important}/*!@.pt-md-3*/.pt-md-3.sc-gw-button{padding-top:1rem !important}/*!@.pt-md-4*/.pt-md-4.sc-gw-button{padding-top:1.5rem !important}/*!@.pt-md-5*/.pt-md-5.sc-gw-button{padding-top:3rem !important}/*!@.pe-md-0*/.pe-md-0.sc-gw-button{padding-right:0 !important}/*!@.pe-md-1*/.pe-md-1.sc-gw-button{padding-right:0.25rem !important}/*!@.pe-md-2*/.pe-md-2.sc-gw-button{padding-right:0.5rem !important}/*!@.pe-md-3*/.pe-md-3.sc-gw-button{padding-right:1rem !important}/*!@.pe-md-4*/.pe-md-4.sc-gw-button{padding-right:1.5rem !important}/*!@.pe-md-5*/.pe-md-5.sc-gw-button{padding-right:3rem !important}/*!@.pb-md-0*/.pb-md-0.sc-gw-button{padding-bottom:0 !important}/*!@.pb-md-1*/.pb-md-1.sc-gw-button{padding-bottom:0.25rem !important}/*!@.pb-md-2*/.pb-md-2.sc-gw-button{padding-bottom:0.5rem !important}/*!@.pb-md-3*/.pb-md-3.sc-gw-button{padding-bottom:1rem !important}/*!@.pb-md-4*/.pb-md-4.sc-gw-button{padding-bottom:1.5rem !important}/*!@.pb-md-5*/.pb-md-5.sc-gw-button{padding-bottom:3rem !important}/*!@.ps-md-0*/.ps-md-0.sc-gw-button{padding-left:0 !important}/*!@.ps-md-1*/.ps-md-1.sc-gw-button{padding-left:0.25rem !important}/*!@.ps-md-2*/.ps-md-2.sc-gw-button{padding-left:0.5rem !important}/*!@.ps-md-3*/.ps-md-3.sc-gw-button{padding-left:1rem !important}/*!@.ps-md-4*/.ps-md-4.sc-gw-button{padding-left:1.5rem !important}/*!@.ps-md-5*/.ps-md-5.sc-gw-button{padding-left:3rem !important}}@media (min-width: 992px){/*!@.d-lg-inline*/.d-lg-inline.sc-gw-button{display:inline !important}/*!@.d-lg-inline-block*/.d-lg-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-lg-block*/.d-lg-block.sc-gw-button{display:block !important}/*!@.d-lg-grid*/.d-lg-grid.sc-gw-button{display:grid !important}/*!@.d-lg-table*/.d-lg-table.sc-gw-button{display:table !important}/*!@.d-lg-table-row*/.d-lg-table-row.sc-gw-button{display:table-row !important}/*!@.d-lg-table-cell*/.d-lg-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-lg-flex*/.d-lg-flex.sc-gw-button{display:flex !important}/*!@.d-lg-inline-flex*/.d-lg-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-lg-none*/.d-lg-none.sc-gw-button{display:none !important}/*!@.flex-lg-fill*/.flex-lg-fill.sc-gw-button{flex:1 1 auto !important}/*!@.flex-lg-row*/.flex-lg-row.sc-gw-button{flex-direction:row !important}/*!@.flex-lg-column*/.flex-lg-column.sc-gw-button{flex-direction:column !important}/*!@.flex-lg-row-reverse*/.flex-lg-row-reverse.sc-gw-button{flex-direction:row-reverse !important}/*!@.flex-lg-column-reverse*/.flex-lg-column-reverse.sc-gw-button{flex-direction:column-reverse !important}/*!@.flex-lg-grow-0*/.flex-lg-grow-0.sc-gw-button{flex-grow:0 !important}/*!@.flex-lg-grow-1*/.flex-lg-grow-1.sc-gw-button{flex-grow:1 !important}/*!@.flex-lg-shrink-0*/.flex-lg-shrink-0.sc-gw-button{flex-shrink:0 !important}/*!@.flex-lg-shrink-1*/.flex-lg-shrink-1.sc-gw-button{flex-shrink:1 !important}/*!@.flex-lg-wrap*/.flex-lg-wrap.sc-gw-button{flex-wrap:wrap !important}/*!@.flex-lg-nowrap*/.flex-lg-nowrap.sc-gw-button{flex-wrap:nowrap !important}/*!@.flex-lg-wrap-reverse*/.flex-lg-wrap-reverse.sc-gw-button{flex-wrap:wrap-reverse !important}/*!@.justify-content-lg-start*/.justify-content-lg-start.sc-gw-button{justify-content:flex-start !important}/*!@.justify-content-lg-end*/.justify-content-lg-end.sc-gw-button{justify-content:flex-end !important}/*!@.justify-content-lg-center*/.justify-content-lg-center.sc-gw-button{justify-content:center !important}/*!@.justify-content-lg-between*/.justify-content-lg-between.sc-gw-button{justify-content:space-between !important}/*!@.justify-content-lg-around*/.justify-content-lg-around.sc-gw-button{justify-content:space-around !important}/*!@.justify-content-lg-evenly*/.justify-content-lg-evenly.sc-gw-button{justify-content:space-evenly !important}/*!@.align-items-lg-start*/.align-items-lg-start.sc-gw-button{align-items:flex-start !important}/*!@.align-items-lg-end*/.align-items-lg-end.sc-gw-button{align-items:flex-end !important}/*!@.align-items-lg-center*/.align-items-lg-center.sc-gw-button{align-items:center !important}/*!@.align-items-lg-baseline*/.align-items-lg-baseline.sc-gw-button{align-items:baseline !important}/*!@.align-items-lg-stretch*/.align-items-lg-stretch.sc-gw-button{align-items:stretch !important}/*!@.align-content-lg-start*/.align-content-lg-start.sc-gw-button{align-content:flex-start !important}/*!@.align-content-lg-end*/.align-content-lg-end.sc-gw-button{align-content:flex-end !important}/*!@.align-content-lg-center*/.align-content-lg-center.sc-gw-button{align-content:center !important}/*!@.align-content-lg-between*/.align-content-lg-between.sc-gw-button{align-content:space-between !important}/*!@.align-content-lg-around*/.align-content-lg-around.sc-gw-button{align-content:space-around !important}/*!@.align-content-lg-stretch*/.align-content-lg-stretch.sc-gw-button{align-content:stretch !important}/*!@.align-self-lg-auto*/.align-self-lg-auto.sc-gw-button{align-self:auto !important}/*!@.align-self-lg-start*/.align-self-lg-start.sc-gw-button{align-self:flex-start !important}/*!@.align-self-lg-end*/.align-self-lg-end.sc-gw-button{align-self:flex-end !important}/*!@.align-self-lg-center*/.align-self-lg-center.sc-gw-button{align-self:center !important}/*!@.align-self-lg-baseline*/.align-self-lg-baseline.sc-gw-button{align-self:baseline !important}/*!@.align-self-lg-stretch*/.align-self-lg-stretch.sc-gw-button{align-self:stretch !important}/*!@.order-lg-first*/.order-lg-first.sc-gw-button{order:-1 !important}/*!@.order-lg-0*/.order-lg-0.sc-gw-button{order:0 !important}/*!@.order-lg-1*/.order-lg-1.sc-gw-button{order:1 !important}/*!@.order-lg-2*/.order-lg-2.sc-gw-button{order:2 !important}/*!@.order-lg-3*/.order-lg-3.sc-gw-button{order:3 !important}/*!@.order-lg-4*/.order-lg-4.sc-gw-button{order:4 !important}/*!@.order-lg-5*/.order-lg-5.sc-gw-button{order:5 !important}/*!@.order-lg-last*/.order-lg-last.sc-gw-button{order:6 !important}/*!@.m-lg-0*/.m-lg-0.sc-gw-button{margin:0 !important}/*!@.m-lg-1*/.m-lg-1.sc-gw-button{margin:0.25rem !important}/*!@.m-lg-2*/.m-lg-2.sc-gw-button{margin:0.5rem !important}/*!@.m-lg-3*/.m-lg-3.sc-gw-button{margin:1rem !important}/*!@.m-lg-4*/.m-lg-4.sc-gw-button{margin:1.5rem !important}/*!@.m-lg-5*/.m-lg-5.sc-gw-button{margin:3rem !important}/*!@.m-lg-auto*/.m-lg-auto.sc-gw-button{margin:auto !important}/*!@.mx-lg-0*/.mx-lg-0.sc-gw-button{margin-right:0 !important;margin-left:0 !important}/*!@.mx-lg-1*/.mx-lg-1.sc-gw-button{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-lg-2*/.mx-lg-2.sc-gw-button{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-lg-3*/.mx-lg-3.sc-gw-button{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-lg-4*/.mx-lg-4.sc-gw-button{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-lg-5*/.mx-lg-5.sc-gw-button{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-lg-auto*/.mx-lg-auto.sc-gw-button{margin-right:auto !important;margin-left:auto !important}/*!@.my-lg-0*/.my-lg-0.sc-gw-button{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-lg-1*/.my-lg-1.sc-gw-button{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-lg-2*/.my-lg-2.sc-gw-button{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-lg-3*/.my-lg-3.sc-gw-button{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-lg-4*/.my-lg-4.sc-gw-button{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-lg-5*/.my-lg-5.sc-gw-button{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-lg-auto*/.my-lg-auto.sc-gw-button{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-lg-0*/.mt-lg-0.sc-gw-button{margin-top:0 !important}/*!@.mt-lg-1*/.mt-lg-1.sc-gw-button{margin-top:0.25rem !important}/*!@.mt-lg-2*/.mt-lg-2.sc-gw-button{margin-top:0.5rem !important}/*!@.mt-lg-3*/.mt-lg-3.sc-gw-button{margin-top:1rem !important}/*!@.mt-lg-4*/.mt-lg-4.sc-gw-button{margin-top:1.5rem !important}/*!@.mt-lg-5*/.mt-lg-5.sc-gw-button{margin-top:3rem !important}/*!@.mt-lg-auto*/.mt-lg-auto.sc-gw-button{margin-top:auto !important}/*!@.me-lg-0*/.me-lg-0.sc-gw-button{margin-right:0 !important}/*!@.me-lg-1*/.me-lg-1.sc-gw-button{margin-right:0.25rem !important}/*!@.me-lg-2*/.me-lg-2.sc-gw-button{margin-right:0.5rem !important}/*!@.me-lg-3*/.me-lg-3.sc-gw-button{margin-right:1rem !important}/*!@.me-lg-4*/.me-lg-4.sc-gw-button{margin-right:1.5rem !important}/*!@.me-lg-5*/.me-lg-5.sc-gw-button{margin-right:3rem !important}/*!@.me-lg-auto*/.me-lg-auto.sc-gw-button{margin-right:auto !important}/*!@.mb-lg-0*/.mb-lg-0.sc-gw-button{margin-bottom:0 !important}/*!@.mb-lg-1*/.mb-lg-1.sc-gw-button{margin-bottom:0.25rem !important}/*!@.mb-lg-2*/.mb-lg-2.sc-gw-button{margin-bottom:0.5rem !important}/*!@.mb-lg-3*/.mb-lg-3.sc-gw-button{margin-bottom:1rem !important}/*!@.mb-lg-4*/.mb-lg-4.sc-gw-button{margin-bottom:1.5rem !important}/*!@.mb-lg-5*/.mb-lg-5.sc-gw-button{margin-bottom:3rem !important}/*!@.mb-lg-auto*/.mb-lg-auto.sc-gw-button{margin-bottom:auto !important}/*!@.ms-lg-0*/.ms-lg-0.sc-gw-button{margin-left:0 !important}/*!@.ms-lg-1*/.ms-lg-1.sc-gw-button{margin-left:0.25rem !important}/*!@.ms-lg-2*/.ms-lg-2.sc-gw-button{margin-left:0.5rem !important}/*!@.ms-lg-3*/.ms-lg-3.sc-gw-button{margin-left:1rem !important}/*!@.ms-lg-4*/.ms-lg-4.sc-gw-button{margin-left:1.5rem !important}/*!@.ms-lg-5*/.ms-lg-5.sc-gw-button{margin-left:3rem !important}/*!@.ms-lg-auto*/.ms-lg-auto.sc-gw-button{margin-left:auto !important}/*!@.p-lg-0*/.p-lg-0.sc-gw-button{padding:0 !important}/*!@.p-lg-1*/.p-lg-1.sc-gw-button{padding:0.25rem !important}/*!@.p-lg-2*/.p-lg-2.sc-gw-button{padding:0.5rem !important}/*!@.p-lg-3*/.p-lg-3.sc-gw-button{padding:1rem !important}/*!@.p-lg-4*/.p-lg-4.sc-gw-button{padding:1.5rem !important}/*!@.p-lg-5*/.p-lg-5.sc-gw-button{padding:3rem !important}/*!@.px-lg-0*/.px-lg-0.sc-gw-button{padding-right:0 !important;padding-left:0 !important}/*!@.px-lg-1*/.px-lg-1.sc-gw-button{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-lg-2*/.px-lg-2.sc-gw-button{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-lg-3*/.px-lg-3.sc-gw-button{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-lg-4*/.px-lg-4.sc-gw-button{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-lg-5*/.px-lg-5.sc-gw-button{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-lg-0*/.py-lg-0.sc-gw-button{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-lg-1*/.py-lg-1.sc-gw-button{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-lg-2*/.py-lg-2.sc-gw-button{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-lg-3*/.py-lg-3.sc-gw-button{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-lg-4*/.py-lg-4.sc-gw-button{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-lg-5*/.py-lg-5.sc-gw-button{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-lg-0*/.pt-lg-0.sc-gw-button{padding-top:0 !important}/*!@.pt-lg-1*/.pt-lg-1.sc-gw-button{padding-top:0.25rem !important}/*!@.pt-lg-2*/.pt-lg-2.sc-gw-button{padding-top:0.5rem !important}/*!@.pt-lg-3*/.pt-lg-3.sc-gw-button{padding-top:1rem !important}/*!@.pt-lg-4*/.pt-lg-4.sc-gw-button{padding-top:1.5rem !important}/*!@.pt-lg-5*/.pt-lg-5.sc-gw-button{padding-top:3rem !important}/*!@.pe-lg-0*/.pe-lg-0.sc-gw-button{padding-right:0 !important}/*!@.pe-lg-1*/.pe-lg-1.sc-gw-button{padding-right:0.25rem !important}/*!@.pe-lg-2*/.pe-lg-2.sc-gw-button{padding-right:0.5rem !important}/*!@.pe-lg-3*/.pe-lg-3.sc-gw-button{padding-right:1rem !important}/*!@.pe-lg-4*/.pe-lg-4.sc-gw-button{padding-right:1.5rem !important}/*!@.pe-lg-5*/.pe-lg-5.sc-gw-button{padding-right:3rem !important}/*!@.pb-lg-0*/.pb-lg-0.sc-gw-button{padding-bottom:0 !important}/*!@.pb-lg-1*/.pb-lg-1.sc-gw-button{padding-bottom:0.25rem !important}/*!@.pb-lg-2*/.pb-lg-2.sc-gw-button{padding-bottom:0.5rem !important}/*!@.pb-lg-3*/.pb-lg-3.sc-gw-button{padding-bottom:1rem !important}/*!@.pb-lg-4*/.pb-lg-4.sc-gw-button{padding-bottom:1.5rem !important}/*!@.pb-lg-5*/.pb-lg-5.sc-gw-button{padding-bottom:3rem !important}/*!@.ps-lg-0*/.ps-lg-0.sc-gw-button{padding-left:0 !important}/*!@.ps-lg-1*/.ps-lg-1.sc-gw-button{padding-left:0.25rem !important}/*!@.ps-lg-2*/.ps-lg-2.sc-gw-button{padding-left:0.5rem !important}/*!@.ps-lg-3*/.ps-lg-3.sc-gw-button{padding-left:1rem !important}/*!@.ps-lg-4*/.ps-lg-4.sc-gw-button{padding-left:1.5rem !important}/*!@.ps-lg-5*/.ps-lg-5.sc-gw-button{padding-left:3rem !important}}@media (min-width: 1200px){/*!@.d-xl-inline*/.d-xl-inline.sc-gw-button{display:inline !important}/*!@.d-xl-inline-block*/.d-xl-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-xl-block*/.d-xl-block.sc-gw-button{display:block !important}/*!@.d-xl-grid*/.d-xl-grid.sc-gw-button{display:grid !important}/*!@.d-xl-table*/.d-xl-table.sc-gw-button{display:table !important}/*!@.d-xl-table-row*/.d-xl-table-row.sc-gw-button{display:table-row !important}/*!@.d-xl-table-cell*/.d-xl-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-xl-flex*/.d-xl-flex.sc-gw-button{display:flex !important}/*!@.d-xl-inline-flex*/.d-xl-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-xl-none*/.d-xl-none.sc-gw-button{display:none !important}/*!@.flex-xl-fill*/.flex-xl-fill.sc-gw-button{flex:1 1 auto !important}/*!@.flex-xl-row*/.flex-xl-row.sc-gw-button{flex-direction:row !important}/*!@.flex-xl-column*/.flex-xl-column.sc-gw-button{flex-direction:column !important}/*!@.flex-xl-row-reverse*/.flex-xl-row-reverse.sc-gw-button{flex-direction:row-reverse !important}/*!@.flex-xl-column-reverse*/.flex-xl-column-reverse.sc-gw-button{flex-direction:column-reverse !important}/*!@.flex-xl-grow-0*/.flex-xl-grow-0.sc-gw-button{flex-grow:0 !important}/*!@.flex-xl-grow-1*/.flex-xl-grow-1.sc-gw-button{flex-grow:1 !important}/*!@.flex-xl-shrink-0*/.flex-xl-shrink-0.sc-gw-button{flex-shrink:0 !important}/*!@.flex-xl-shrink-1*/.flex-xl-shrink-1.sc-gw-button{flex-shrink:1 !important}/*!@.flex-xl-wrap*/.flex-xl-wrap.sc-gw-button{flex-wrap:wrap !important}/*!@.flex-xl-nowrap*/.flex-xl-nowrap.sc-gw-button{flex-wrap:nowrap !important}/*!@.flex-xl-wrap-reverse*/.flex-xl-wrap-reverse.sc-gw-button{flex-wrap:wrap-reverse !important}/*!@.justify-content-xl-start*/.justify-content-xl-start.sc-gw-button{justify-content:flex-start !important}/*!@.justify-content-xl-end*/.justify-content-xl-end.sc-gw-button{justify-content:flex-end !important}/*!@.justify-content-xl-center*/.justify-content-xl-center.sc-gw-button{justify-content:center !important}/*!@.justify-content-xl-between*/.justify-content-xl-between.sc-gw-button{justify-content:space-between !important}/*!@.justify-content-xl-around*/.justify-content-xl-around.sc-gw-button{justify-content:space-around !important}/*!@.justify-content-xl-evenly*/.justify-content-xl-evenly.sc-gw-button{justify-content:space-evenly !important}/*!@.align-items-xl-start*/.align-items-xl-start.sc-gw-button{align-items:flex-start !important}/*!@.align-items-xl-end*/.align-items-xl-end.sc-gw-button{align-items:flex-end !important}/*!@.align-items-xl-center*/.align-items-xl-center.sc-gw-button{align-items:center !important}/*!@.align-items-xl-baseline*/.align-items-xl-baseline.sc-gw-button{align-items:baseline !important}/*!@.align-items-xl-stretch*/.align-items-xl-stretch.sc-gw-button{align-items:stretch !important}/*!@.align-content-xl-start*/.align-content-xl-start.sc-gw-button{align-content:flex-start !important}/*!@.align-content-xl-end*/.align-content-xl-end.sc-gw-button{align-content:flex-end !important}/*!@.align-content-xl-center*/.align-content-xl-center.sc-gw-button{align-content:center !important}/*!@.align-content-xl-between*/.align-content-xl-between.sc-gw-button{align-content:space-between !important}/*!@.align-content-xl-around*/.align-content-xl-around.sc-gw-button{align-content:space-around !important}/*!@.align-content-xl-stretch*/.align-content-xl-stretch.sc-gw-button{align-content:stretch !important}/*!@.align-self-xl-auto*/.align-self-xl-auto.sc-gw-button{align-self:auto !important}/*!@.align-self-xl-start*/.align-self-xl-start.sc-gw-button{align-self:flex-start !important}/*!@.align-self-xl-end*/.align-self-xl-end.sc-gw-button{align-self:flex-end !important}/*!@.align-self-xl-center*/.align-self-xl-center.sc-gw-button{align-self:center !important}/*!@.align-self-xl-baseline*/.align-self-xl-baseline.sc-gw-button{align-self:baseline !important}/*!@.align-self-xl-stretch*/.align-self-xl-stretch.sc-gw-button{align-self:stretch !important}/*!@.order-xl-first*/.order-xl-first.sc-gw-button{order:-1 !important}/*!@.order-xl-0*/.order-xl-0.sc-gw-button{order:0 !important}/*!@.order-xl-1*/.order-xl-1.sc-gw-button{order:1 !important}/*!@.order-xl-2*/.order-xl-2.sc-gw-button{order:2 !important}/*!@.order-xl-3*/.order-xl-3.sc-gw-button{order:3 !important}/*!@.order-xl-4*/.order-xl-4.sc-gw-button{order:4 !important}/*!@.order-xl-5*/.order-xl-5.sc-gw-button{order:5 !important}/*!@.order-xl-last*/.order-xl-last.sc-gw-button{order:6 !important}/*!@.m-xl-0*/.m-xl-0.sc-gw-button{margin:0 !important}/*!@.m-xl-1*/.m-xl-1.sc-gw-button{margin:0.25rem !important}/*!@.m-xl-2*/.m-xl-2.sc-gw-button{margin:0.5rem !important}/*!@.m-xl-3*/.m-xl-3.sc-gw-button{margin:1rem !important}/*!@.m-xl-4*/.m-xl-4.sc-gw-button{margin:1.5rem !important}/*!@.m-xl-5*/.m-xl-5.sc-gw-button{margin:3rem !important}/*!@.m-xl-auto*/.m-xl-auto.sc-gw-button{margin:auto !important}/*!@.mx-xl-0*/.mx-xl-0.sc-gw-button{margin-right:0 !important;margin-left:0 !important}/*!@.mx-xl-1*/.mx-xl-1.sc-gw-button{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-xl-2*/.mx-xl-2.sc-gw-button{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-xl-3*/.mx-xl-3.sc-gw-button{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-xl-4*/.mx-xl-4.sc-gw-button{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-xl-5*/.mx-xl-5.sc-gw-button{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-xl-auto*/.mx-xl-auto.sc-gw-button{margin-right:auto !important;margin-left:auto !important}/*!@.my-xl-0*/.my-xl-0.sc-gw-button{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-xl-1*/.my-xl-1.sc-gw-button{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-xl-2*/.my-xl-2.sc-gw-button{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-xl-3*/.my-xl-3.sc-gw-button{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-xl-4*/.my-xl-4.sc-gw-button{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-xl-5*/.my-xl-5.sc-gw-button{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-xl-auto*/.my-xl-auto.sc-gw-button{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-xl-0*/.mt-xl-0.sc-gw-button{margin-top:0 !important}/*!@.mt-xl-1*/.mt-xl-1.sc-gw-button{margin-top:0.25rem !important}/*!@.mt-xl-2*/.mt-xl-2.sc-gw-button{margin-top:0.5rem !important}/*!@.mt-xl-3*/.mt-xl-3.sc-gw-button{margin-top:1rem !important}/*!@.mt-xl-4*/.mt-xl-4.sc-gw-button{margin-top:1.5rem !important}/*!@.mt-xl-5*/.mt-xl-5.sc-gw-button{margin-top:3rem !important}/*!@.mt-xl-auto*/.mt-xl-auto.sc-gw-button{margin-top:auto !important}/*!@.me-xl-0*/.me-xl-0.sc-gw-button{margin-right:0 !important}/*!@.me-xl-1*/.me-xl-1.sc-gw-button{margin-right:0.25rem !important}/*!@.me-xl-2*/.me-xl-2.sc-gw-button{margin-right:0.5rem !important}/*!@.me-xl-3*/.me-xl-3.sc-gw-button{margin-right:1rem !important}/*!@.me-xl-4*/.me-xl-4.sc-gw-button{margin-right:1.5rem !important}/*!@.me-xl-5*/.me-xl-5.sc-gw-button{margin-right:3rem !important}/*!@.me-xl-auto*/.me-xl-auto.sc-gw-button{margin-right:auto !important}/*!@.mb-xl-0*/.mb-xl-0.sc-gw-button{margin-bottom:0 !important}/*!@.mb-xl-1*/.mb-xl-1.sc-gw-button{margin-bottom:0.25rem !important}/*!@.mb-xl-2*/.mb-xl-2.sc-gw-button{margin-bottom:0.5rem !important}/*!@.mb-xl-3*/.mb-xl-3.sc-gw-button{margin-bottom:1rem !important}/*!@.mb-xl-4*/.mb-xl-4.sc-gw-button{margin-bottom:1.5rem !important}/*!@.mb-xl-5*/.mb-xl-5.sc-gw-button{margin-bottom:3rem !important}/*!@.mb-xl-auto*/.mb-xl-auto.sc-gw-button{margin-bottom:auto !important}/*!@.ms-xl-0*/.ms-xl-0.sc-gw-button{margin-left:0 !important}/*!@.ms-xl-1*/.ms-xl-1.sc-gw-button{margin-left:0.25rem !important}/*!@.ms-xl-2*/.ms-xl-2.sc-gw-button{margin-left:0.5rem !important}/*!@.ms-xl-3*/.ms-xl-3.sc-gw-button{margin-left:1rem !important}/*!@.ms-xl-4*/.ms-xl-4.sc-gw-button{margin-left:1.5rem !important}/*!@.ms-xl-5*/.ms-xl-5.sc-gw-button{margin-left:3rem !important}/*!@.ms-xl-auto*/.ms-xl-auto.sc-gw-button{margin-left:auto !important}/*!@.p-xl-0*/.p-xl-0.sc-gw-button{padding:0 !important}/*!@.p-xl-1*/.p-xl-1.sc-gw-button{padding:0.25rem !important}/*!@.p-xl-2*/.p-xl-2.sc-gw-button{padding:0.5rem !important}/*!@.p-xl-3*/.p-xl-3.sc-gw-button{padding:1rem !important}/*!@.p-xl-4*/.p-xl-4.sc-gw-button{padding:1.5rem !important}/*!@.p-xl-5*/.p-xl-5.sc-gw-button{padding:3rem !important}/*!@.px-xl-0*/.px-xl-0.sc-gw-button{padding-right:0 !important;padding-left:0 !important}/*!@.px-xl-1*/.px-xl-1.sc-gw-button{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-xl-2*/.px-xl-2.sc-gw-button{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-xl-3*/.px-xl-3.sc-gw-button{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-xl-4*/.px-xl-4.sc-gw-button{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-xl-5*/.px-xl-5.sc-gw-button{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-xl-0*/.py-xl-0.sc-gw-button{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-xl-1*/.py-xl-1.sc-gw-button{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-xl-2*/.py-xl-2.sc-gw-button{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-xl-3*/.py-xl-3.sc-gw-button{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-xl-4*/.py-xl-4.sc-gw-button{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-xl-5*/.py-xl-5.sc-gw-button{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-xl-0*/.pt-xl-0.sc-gw-button{padding-top:0 !important}/*!@.pt-xl-1*/.pt-xl-1.sc-gw-button{padding-top:0.25rem !important}/*!@.pt-xl-2*/.pt-xl-2.sc-gw-button{padding-top:0.5rem !important}/*!@.pt-xl-3*/.pt-xl-3.sc-gw-button{padding-top:1rem !important}/*!@.pt-xl-4*/.pt-xl-4.sc-gw-button{padding-top:1.5rem !important}/*!@.pt-xl-5*/.pt-xl-5.sc-gw-button{padding-top:3rem !important}/*!@.pe-xl-0*/.pe-xl-0.sc-gw-button{padding-right:0 !important}/*!@.pe-xl-1*/.pe-xl-1.sc-gw-button{padding-right:0.25rem !important}/*!@.pe-xl-2*/.pe-xl-2.sc-gw-button{padding-right:0.5rem !important}/*!@.pe-xl-3*/.pe-xl-3.sc-gw-button{padding-right:1rem !important}/*!@.pe-xl-4*/.pe-xl-4.sc-gw-button{padding-right:1.5rem !important}/*!@.pe-xl-5*/.pe-xl-5.sc-gw-button{padding-right:3rem !important}/*!@.pb-xl-0*/.pb-xl-0.sc-gw-button{padding-bottom:0 !important}/*!@.pb-xl-1*/.pb-xl-1.sc-gw-button{padding-bottom:0.25rem !important}/*!@.pb-xl-2*/.pb-xl-2.sc-gw-button{padding-bottom:0.5rem !important}/*!@.pb-xl-3*/.pb-xl-3.sc-gw-button{padding-bottom:1rem !important}/*!@.pb-xl-4*/.pb-xl-4.sc-gw-button{padding-bottom:1.5rem !important}/*!@.pb-xl-5*/.pb-xl-5.sc-gw-button{padding-bottom:3rem !important}/*!@.ps-xl-0*/.ps-xl-0.sc-gw-button{padding-left:0 !important}/*!@.ps-xl-1*/.ps-xl-1.sc-gw-button{padding-left:0.25rem !important}/*!@.ps-xl-2*/.ps-xl-2.sc-gw-button{padding-left:0.5rem !important}/*!@.ps-xl-3*/.ps-xl-3.sc-gw-button{padding-left:1rem !important}/*!@.ps-xl-4*/.ps-xl-4.sc-gw-button{padding-left:1.5rem !important}/*!@.ps-xl-5*/.ps-xl-5.sc-gw-button{padding-left:3rem !important}}@media (min-width: 1400px){/*!@.d-xxl-inline*/.d-xxl-inline.sc-gw-button{display:inline !important}/*!@.d-xxl-inline-block*/.d-xxl-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-xxl-block*/.d-xxl-block.sc-gw-button{display:block !important}/*!@.d-xxl-grid*/.d-xxl-grid.sc-gw-button{display:grid !important}/*!@.d-xxl-table*/.d-xxl-table.sc-gw-button{display:table !important}/*!@.d-xxl-table-row*/.d-xxl-table-row.sc-gw-button{display:table-row !important}/*!@.d-xxl-table-cell*/.d-xxl-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-xxl-flex*/.d-xxl-flex.sc-gw-button{display:flex !important}/*!@.d-xxl-inline-flex*/.d-xxl-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-xxl-none*/.d-xxl-none.sc-gw-button{display:none !important}/*!@.flex-xxl-fill*/.flex-xxl-fill.sc-gw-button{flex:1 1 auto !important}/*!@.flex-xxl-row*/.flex-xxl-row.sc-gw-button{flex-direction:row !important}/*!@.flex-xxl-column*/.flex-xxl-column.sc-gw-button{flex-direction:column !important}/*!@.flex-xxl-row-reverse*/.flex-xxl-row-reverse.sc-gw-button{flex-direction:row-reverse !important}/*!@.flex-xxl-column-reverse*/.flex-xxl-column-reverse.sc-gw-button{flex-direction:column-reverse !important}/*!@.flex-xxl-grow-0*/.flex-xxl-grow-0.sc-gw-button{flex-grow:0 !important}/*!@.flex-xxl-grow-1*/.flex-xxl-grow-1.sc-gw-button{flex-grow:1 !important}/*!@.flex-xxl-shrink-0*/.flex-xxl-shrink-0.sc-gw-button{flex-shrink:0 !important}/*!@.flex-xxl-shrink-1*/.flex-xxl-shrink-1.sc-gw-button{flex-shrink:1 !important}/*!@.flex-xxl-wrap*/.flex-xxl-wrap.sc-gw-button{flex-wrap:wrap !important}/*!@.flex-xxl-nowrap*/.flex-xxl-nowrap.sc-gw-button{flex-wrap:nowrap !important}/*!@.flex-xxl-wrap-reverse*/.flex-xxl-wrap-reverse.sc-gw-button{flex-wrap:wrap-reverse !important}/*!@.justify-content-xxl-start*/.justify-content-xxl-start.sc-gw-button{justify-content:flex-start !important}/*!@.justify-content-xxl-end*/.justify-content-xxl-end.sc-gw-button{justify-content:flex-end !important}/*!@.justify-content-xxl-center*/.justify-content-xxl-center.sc-gw-button{justify-content:center !important}/*!@.justify-content-xxl-between*/.justify-content-xxl-between.sc-gw-button{justify-content:space-between !important}/*!@.justify-content-xxl-around*/.justify-content-xxl-around.sc-gw-button{justify-content:space-around !important}/*!@.justify-content-xxl-evenly*/.justify-content-xxl-evenly.sc-gw-button{justify-content:space-evenly !important}/*!@.align-items-xxl-start*/.align-items-xxl-start.sc-gw-button{align-items:flex-start !important}/*!@.align-items-xxl-end*/.align-items-xxl-end.sc-gw-button{align-items:flex-end !important}/*!@.align-items-xxl-center*/.align-items-xxl-center.sc-gw-button{align-items:center !important}/*!@.align-items-xxl-baseline*/.align-items-xxl-baseline.sc-gw-button{align-items:baseline !important}/*!@.align-items-xxl-stretch*/.align-items-xxl-stretch.sc-gw-button{align-items:stretch !important}/*!@.align-content-xxl-start*/.align-content-xxl-start.sc-gw-button{align-content:flex-start !important}/*!@.align-content-xxl-end*/.align-content-xxl-end.sc-gw-button{align-content:flex-end !important}/*!@.align-content-xxl-center*/.align-content-xxl-center.sc-gw-button{align-content:center !important}/*!@.align-content-xxl-between*/.align-content-xxl-between.sc-gw-button{align-content:space-between !important}/*!@.align-content-xxl-around*/.align-content-xxl-around.sc-gw-button{align-content:space-around !important}/*!@.align-content-xxl-stretch*/.align-content-xxl-stretch.sc-gw-button{align-content:stretch !important}/*!@.align-self-xxl-auto*/.align-self-xxl-auto.sc-gw-button{align-self:auto !important}/*!@.align-self-xxl-start*/.align-self-xxl-start.sc-gw-button{align-self:flex-start !important}/*!@.align-self-xxl-end*/.align-self-xxl-end.sc-gw-button{align-self:flex-end !important}/*!@.align-self-xxl-center*/.align-self-xxl-center.sc-gw-button{align-self:center !important}/*!@.align-self-xxl-baseline*/.align-self-xxl-baseline.sc-gw-button{align-self:baseline !important}/*!@.align-self-xxl-stretch*/.align-self-xxl-stretch.sc-gw-button{align-self:stretch !important}/*!@.order-xxl-first*/.order-xxl-first.sc-gw-button{order:-1 !important}/*!@.order-xxl-0*/.order-xxl-0.sc-gw-button{order:0 !important}/*!@.order-xxl-1*/.order-xxl-1.sc-gw-button{order:1 !important}/*!@.order-xxl-2*/.order-xxl-2.sc-gw-button{order:2 !important}/*!@.order-xxl-3*/.order-xxl-3.sc-gw-button{order:3 !important}/*!@.order-xxl-4*/.order-xxl-4.sc-gw-button{order:4 !important}/*!@.order-xxl-5*/.order-xxl-5.sc-gw-button{order:5 !important}/*!@.order-xxl-last*/.order-xxl-last.sc-gw-button{order:6 !important}/*!@.m-xxl-0*/.m-xxl-0.sc-gw-button{margin:0 !important}/*!@.m-xxl-1*/.m-xxl-1.sc-gw-button{margin:0.25rem !important}/*!@.m-xxl-2*/.m-xxl-2.sc-gw-button{margin:0.5rem !important}/*!@.m-xxl-3*/.m-xxl-3.sc-gw-button{margin:1rem !important}/*!@.m-xxl-4*/.m-xxl-4.sc-gw-button{margin:1.5rem !important}/*!@.m-xxl-5*/.m-xxl-5.sc-gw-button{margin:3rem !important}/*!@.m-xxl-auto*/.m-xxl-auto.sc-gw-button{margin:auto !important}/*!@.mx-xxl-0*/.mx-xxl-0.sc-gw-button{margin-right:0 !important;margin-left:0 !important}/*!@.mx-xxl-1*/.mx-xxl-1.sc-gw-button{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-xxl-2*/.mx-xxl-2.sc-gw-button{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-xxl-3*/.mx-xxl-3.sc-gw-button{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-xxl-4*/.mx-xxl-4.sc-gw-button{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-xxl-5*/.mx-xxl-5.sc-gw-button{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-xxl-auto*/.mx-xxl-auto.sc-gw-button{margin-right:auto !important;margin-left:auto !important}/*!@.my-xxl-0*/.my-xxl-0.sc-gw-button{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-xxl-1*/.my-xxl-1.sc-gw-button{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-xxl-2*/.my-xxl-2.sc-gw-button{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-xxl-3*/.my-xxl-3.sc-gw-button{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-xxl-4*/.my-xxl-4.sc-gw-button{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-xxl-5*/.my-xxl-5.sc-gw-button{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-xxl-auto*/.my-xxl-auto.sc-gw-button{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-xxl-0*/.mt-xxl-0.sc-gw-button{margin-top:0 !important}/*!@.mt-xxl-1*/.mt-xxl-1.sc-gw-button{margin-top:0.25rem !important}/*!@.mt-xxl-2*/.mt-xxl-2.sc-gw-button{margin-top:0.5rem !important}/*!@.mt-xxl-3*/.mt-xxl-3.sc-gw-button{margin-top:1rem !important}/*!@.mt-xxl-4*/.mt-xxl-4.sc-gw-button{margin-top:1.5rem !important}/*!@.mt-xxl-5*/.mt-xxl-5.sc-gw-button{margin-top:3rem !important}/*!@.mt-xxl-auto*/.mt-xxl-auto.sc-gw-button{margin-top:auto !important}/*!@.me-xxl-0*/.me-xxl-0.sc-gw-button{margin-right:0 !important}/*!@.me-xxl-1*/.me-xxl-1.sc-gw-button{margin-right:0.25rem !important}/*!@.me-xxl-2*/.me-xxl-2.sc-gw-button{margin-right:0.5rem !important}/*!@.me-xxl-3*/.me-xxl-3.sc-gw-button{margin-right:1rem !important}/*!@.me-xxl-4*/.me-xxl-4.sc-gw-button{margin-right:1.5rem !important}/*!@.me-xxl-5*/.me-xxl-5.sc-gw-button{margin-right:3rem !important}/*!@.me-xxl-auto*/.me-xxl-auto.sc-gw-button{margin-right:auto !important}/*!@.mb-xxl-0*/.mb-xxl-0.sc-gw-button{margin-bottom:0 !important}/*!@.mb-xxl-1*/.mb-xxl-1.sc-gw-button{margin-bottom:0.25rem !important}/*!@.mb-xxl-2*/.mb-xxl-2.sc-gw-button{margin-bottom:0.5rem !important}/*!@.mb-xxl-3*/.mb-xxl-3.sc-gw-button{margin-bottom:1rem !important}/*!@.mb-xxl-4*/.mb-xxl-4.sc-gw-button{margin-bottom:1.5rem !important}/*!@.mb-xxl-5*/.mb-xxl-5.sc-gw-button{margin-bottom:3rem !important}/*!@.mb-xxl-auto*/.mb-xxl-auto.sc-gw-button{margin-bottom:auto !important}/*!@.ms-xxl-0*/.ms-xxl-0.sc-gw-button{margin-left:0 !important}/*!@.ms-xxl-1*/.ms-xxl-1.sc-gw-button{margin-left:0.25rem !important}/*!@.ms-xxl-2*/.ms-xxl-2.sc-gw-button{margin-left:0.5rem !important}/*!@.ms-xxl-3*/.ms-xxl-3.sc-gw-button{margin-left:1rem !important}/*!@.ms-xxl-4*/.ms-xxl-4.sc-gw-button{margin-left:1.5rem !important}/*!@.ms-xxl-5*/.ms-xxl-5.sc-gw-button{margin-left:3rem !important}/*!@.ms-xxl-auto*/.ms-xxl-auto.sc-gw-button{margin-left:auto !important}/*!@.p-xxl-0*/.p-xxl-0.sc-gw-button{padding:0 !important}/*!@.p-xxl-1*/.p-xxl-1.sc-gw-button{padding:0.25rem !important}/*!@.p-xxl-2*/.p-xxl-2.sc-gw-button{padding:0.5rem !important}/*!@.p-xxl-3*/.p-xxl-3.sc-gw-button{padding:1rem !important}/*!@.p-xxl-4*/.p-xxl-4.sc-gw-button{padding:1.5rem !important}/*!@.p-xxl-5*/.p-xxl-5.sc-gw-button{padding:3rem !important}/*!@.px-xxl-0*/.px-xxl-0.sc-gw-button{padding-right:0 !important;padding-left:0 !important}/*!@.px-xxl-1*/.px-xxl-1.sc-gw-button{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-xxl-2*/.px-xxl-2.sc-gw-button{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-xxl-3*/.px-xxl-3.sc-gw-button{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-xxl-4*/.px-xxl-4.sc-gw-button{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-xxl-5*/.px-xxl-5.sc-gw-button{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-xxl-0*/.py-xxl-0.sc-gw-button{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-xxl-1*/.py-xxl-1.sc-gw-button{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-xxl-2*/.py-xxl-2.sc-gw-button{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-xxl-3*/.py-xxl-3.sc-gw-button{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-xxl-4*/.py-xxl-4.sc-gw-button{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-xxl-5*/.py-xxl-5.sc-gw-button{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-xxl-0*/.pt-xxl-0.sc-gw-button{padding-top:0 !important}/*!@.pt-xxl-1*/.pt-xxl-1.sc-gw-button{padding-top:0.25rem !important}/*!@.pt-xxl-2*/.pt-xxl-2.sc-gw-button{padding-top:0.5rem !important}/*!@.pt-xxl-3*/.pt-xxl-3.sc-gw-button{padding-top:1rem !important}/*!@.pt-xxl-4*/.pt-xxl-4.sc-gw-button{padding-top:1.5rem !important}/*!@.pt-xxl-5*/.pt-xxl-5.sc-gw-button{padding-top:3rem !important}/*!@.pe-xxl-0*/.pe-xxl-0.sc-gw-button{padding-right:0 !important}/*!@.pe-xxl-1*/.pe-xxl-1.sc-gw-button{padding-right:0.25rem !important}/*!@.pe-xxl-2*/.pe-xxl-2.sc-gw-button{padding-right:0.5rem !important}/*!@.pe-xxl-3*/.pe-xxl-3.sc-gw-button{padding-right:1rem !important}/*!@.pe-xxl-4*/.pe-xxl-4.sc-gw-button{padding-right:1.5rem !important}/*!@.pe-xxl-5*/.pe-xxl-5.sc-gw-button{padding-right:3rem !important}/*!@.pb-xxl-0*/.pb-xxl-0.sc-gw-button{padding-bottom:0 !important}/*!@.pb-xxl-1*/.pb-xxl-1.sc-gw-button{padding-bottom:0.25rem !important}/*!@.pb-xxl-2*/.pb-xxl-2.sc-gw-button{padding-bottom:0.5rem !important}/*!@.pb-xxl-3*/.pb-xxl-3.sc-gw-button{padding-bottom:1rem !important}/*!@.pb-xxl-4*/.pb-xxl-4.sc-gw-button{padding-bottom:1.5rem !important}/*!@.pb-xxl-5*/.pb-xxl-5.sc-gw-button{padding-bottom:3rem !important}/*!@.ps-xxl-0*/.ps-xxl-0.sc-gw-button{padding-left:0 !important}/*!@.ps-xxl-1*/.ps-xxl-1.sc-gw-button{padding-left:0.25rem !important}/*!@.ps-xxl-2*/.ps-xxl-2.sc-gw-button{padding-left:0.5rem !important}/*!@.ps-xxl-3*/.ps-xxl-3.sc-gw-button{padding-left:1rem !important}/*!@.ps-xxl-4*/.ps-xxl-4.sc-gw-button{padding-left:1.5rem !important}/*!@.ps-xxl-5*/.ps-xxl-5.sc-gw-button{padding-left:3rem !important}}@media print{/*!@.d-print-inline*/.d-print-inline.sc-gw-button{display:inline !important}/*!@.d-print-inline-block*/.d-print-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-print-block*/.d-print-block.sc-gw-button{display:block !important}/*!@.d-print-grid*/.d-print-grid.sc-gw-button{display:grid !important}/*!@.d-print-table*/.d-print-table.sc-gw-button{display:table !important}/*!@.d-print-table-row*/.d-print-table-row.sc-gw-button{display:table-row !important}/*!@.d-print-table-cell*/.d-print-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-print-flex*/.d-print-flex.sc-gw-button{display:flex !important}/*!@.d-print-inline-flex*/.d-print-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-print-none*/.d-print-none.sc-gw-button{display:none !important}}/*!@.clearfix::after*/.clearfix.sc-gw-button::after{display:block;clear:both;content:\"\"}/*!@.link-primary*/.link-primary.sc-gw-button{color:#0d6efd}/*!@.link-primary:hover,\n.link-primary:focus*/.link-primary.sc-gw-button:hover,.link-primary.sc-gw-button:focus{color:#0a58ca}/*!@.link-secondary*/.link-secondary.sc-gw-button{color:#6c757d}/*!@.link-secondary:hover,\n.link-secondary:focus*/.link-secondary.sc-gw-button:hover,.link-secondary.sc-gw-button:focus{color:#565e64}/*!@.link-success*/.link-success.sc-gw-button{color:#198754}/*!@.link-success:hover,\n.link-success:focus*/.link-success.sc-gw-button:hover,.link-success.sc-gw-button:focus{color:#146c43}/*!@.link-info*/.link-info.sc-gw-button{color:#0dcaf0}/*!@.link-info:hover,\n.link-info:focus*/.link-info.sc-gw-button:hover,.link-info.sc-gw-button:focus{color:#3dd5f3}/*!@.link-warning*/.link-warning.sc-gw-button{color:#ffc107}/*!@.link-warning:hover,\n.link-warning:focus*/.link-warning.sc-gw-button:hover,.link-warning.sc-gw-button:focus{color:#ffcd39}/*!@.link-danger*/.link-danger.sc-gw-button{color:#dc3545}/*!@.link-danger:hover,\n.link-danger:focus*/.link-danger.sc-gw-button:hover,.link-danger.sc-gw-button:focus{color:#b02a37}/*!@.link-light*/.link-light.sc-gw-button{color:#f8f9fa}/*!@.link-light:hover,\n.link-light:focus*/.link-light.sc-gw-button:hover,.link-light.sc-gw-button:focus{color:#f9fafb}/*!@.link-dark*/.link-dark.sc-gw-button{color:#212529}/*!@.link-dark:hover,\n.link-dark:focus*/.link-dark.sc-gw-button:hover,.link-dark.sc-gw-button:focus{color:#1a1e21}/*!@.ratio*/.ratio.sc-gw-button{position:relative;width:100%}/*!@.ratio::before*/.ratio.sc-gw-button::before{display:block;padding-top:var(--bs-aspect-ratio);content:\"\"}/*!@.ratio > **/.ratio.sc-gw-button>*.sc-gw-button{position:absolute;top:0;left:0;width:100%;height:100%}/*!@.ratio-1x1*/.ratio-1x1.sc-gw-button{--bs-aspect-ratio:100%}/*!@.ratio-4x3*/.ratio-4x3.sc-gw-button{--bs-aspect-ratio:calc(3 / 4 * 100%)}/*!@.ratio-16x9*/.ratio-16x9.sc-gw-button{--bs-aspect-ratio:calc(9 / 16 * 100%)}/*!@.ratio-21x9*/.ratio-21x9.sc-gw-button{--bs-aspect-ratio:calc(9 / 21 * 100%)}/*!@.fixed-top*/.fixed-top.sc-gw-button{position:fixed;top:0;right:0;left:0;z-index:1030}/*!@.fixed-bottom*/.fixed-bottom.sc-gw-button{position:fixed;right:0;bottom:0;left:0;z-index:1030}/*!@.sticky-top*/.sticky-top.sc-gw-button{position:-webkit-sticky;position:sticky;top:0;z-index:1020}@media (min-width: 576px){/*!@.sticky-sm-top*/.sticky-sm-top.sc-gw-button{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}@media (min-width: 768px){/*!@.sticky-md-top*/.sticky-md-top.sc-gw-button{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}@media (min-width: 992px){/*!@.sticky-lg-top*/.sticky-lg-top.sc-gw-button{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}@media (min-width: 1200px){/*!@.sticky-xl-top*/.sticky-xl-top.sc-gw-button{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}@media (min-width: 1400px){/*!@.sticky-xxl-top*/.sticky-xxl-top.sc-gw-button{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}/*!@.visually-hidden,\n.visually-hidden-focusable:not(:focus):not(:focus-within)*/.visually-hidden.sc-gw-button,.visually-hidden-focusable.sc-gw-button:not(:focus):not(:focus-within){position:absolute !important;width:1px !important;height:1px !important;padding:0 !important;margin:-1px !important;overflow:hidden !important;clip:rect(0, 0, 0, 0) !important;white-space:nowrap !important;border:0 !important}/*!@.stretched-link::after*/.stretched-link.sc-gw-button::after{position:absolute;top:0;right:0;bottom:0;left:0;z-index:1;content:\"\"}/*!@.text-truncate*/.text-truncate.sc-gw-button{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}/*!@.align-baseline*/.align-baseline.sc-gw-button{vertical-align:baseline !important}/*!@.align-top*/.align-top.sc-gw-button{vertical-align:top !important}/*!@.align-middle*/.align-middle.sc-gw-button{vertical-align:middle !important}/*!@.align-bottom*/.align-bottom.sc-gw-button{vertical-align:bottom !important}/*!@.align-text-bottom*/.align-text-bottom.sc-gw-button{vertical-align:text-bottom !important}/*!@.align-text-top*/.align-text-top.sc-gw-button{vertical-align:text-top !important}/*!@.float-start*/.float-start.sc-gw-button{float:left !important}/*!@.float-end*/.float-end.sc-gw-button{float:right !important}/*!@.float-none*/.float-none.sc-gw-button{float:none !important}/*!@.overflow-auto*/.overflow-auto.sc-gw-button{overflow:auto !important}/*!@.overflow-hidden*/.overflow-hidden.sc-gw-button{overflow:hidden !important}/*!@.overflow-visible*/.overflow-visible.sc-gw-button{overflow:visible !important}/*!@.overflow-scroll*/.overflow-scroll.sc-gw-button{overflow:scroll !important}/*!@.d-inline*/.d-inline.sc-gw-button{display:inline !important}/*!@.d-inline-block*/.d-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-block*/.d-block.sc-gw-button{display:block !important}/*!@.d-grid*/.d-grid.sc-gw-button{display:grid !important}/*!@.d-table*/.d-table.sc-gw-button{display:table !important}/*!@.d-table-row*/.d-table-row.sc-gw-button{display:table-row !important}/*!@.d-table-cell*/.d-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-flex*/.d-flex.sc-gw-button{display:flex !important}/*!@.d-inline-flex*/.d-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-none*/.d-none.sc-gw-button{display:none !important}/*!@.shadow*/.shadow.sc-gw-button{box-shadow:0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important}/*!@.shadow-sm*/.shadow-sm.sc-gw-button{box-shadow:0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important}/*!@.shadow-lg*/.shadow-lg.sc-gw-button{box-shadow:0 1rem 3rem rgba(0, 0, 0, 0.175) !important}/*!@.shadow-none*/.shadow-none.sc-gw-button{box-shadow:none !important}/*!@.position-static*/.position-static.sc-gw-button{position:static !important}/*!@.position-relative*/.position-relative.sc-gw-button{position:relative !important}/*!@.position-absolute*/.position-absolute.sc-gw-button{position:absolute !important}/*!@.position-fixed*/.position-fixed.sc-gw-button{position:fixed !important}/*!@.position-sticky*/.position-sticky.sc-gw-button{position:-webkit-sticky !important;position:sticky !important}/*!@.top-0*/.top-0.sc-gw-button{top:0 !important}/*!@.top-50*/.top-50.sc-gw-button{top:50% !important}/*!@.top-100*/.top-100.sc-gw-button{top:100% !important}/*!@.bottom-0*/.bottom-0.sc-gw-button{bottom:0 !important}/*!@.bottom-50*/.bottom-50.sc-gw-button{bottom:50% !important}/*!@.bottom-100*/.bottom-100.sc-gw-button{bottom:100% !important}/*!@.start-0*/.start-0.sc-gw-button{left:0 !important}/*!@.start-50*/.start-50.sc-gw-button{left:50% !important}/*!@.start-100*/.start-100.sc-gw-button{left:100% !important}/*!@.end-0*/.end-0.sc-gw-button{right:0 !important}/*!@.end-50*/.end-50.sc-gw-button{right:50% !important}/*!@.end-100*/.end-100.sc-gw-button{right:100% !important}/*!@.translate-middle*/.translate-middle.sc-gw-button{transform:translate(-50%, -50%) !important}/*!@.translate-middle-x*/.translate-middle-x.sc-gw-button{transform:translateX(-50%) !important}/*!@.translate-middle-y*/.translate-middle-y.sc-gw-button{transform:translateY(-50%) !important}/*!@.border*/.border.sc-gw-button{border:1px solid #dee2e6 !important}/*!@.border-0*/.border-0.sc-gw-button{border:0 !important}/*!@.border-top*/.border-top.sc-gw-button{border-top:1px solid #dee2e6 !important}/*!@.border-top-0*/.border-top-0.sc-gw-button{border-top:0 !important}/*!@.border-end*/.border-end.sc-gw-button{border-right:1px solid #dee2e6 !important}/*!@.border-end-0*/.border-end-0.sc-gw-button{border-right:0 !important}/*!@.border-bottom*/.border-bottom.sc-gw-button{border-bottom:1px solid #dee2e6 !important}/*!@.border-bottom-0*/.border-bottom-0.sc-gw-button{border-bottom:0 !important}/*!@.border-start*/.border-start.sc-gw-button{border-left:1px solid #dee2e6 !important}/*!@.border-start-0*/.border-start-0.sc-gw-button{border-left:0 !important}/*!@.border-primary*/.border-primary.sc-gw-button{border-color:#0d6efd !important}/*!@.border-secondary*/.border-secondary.sc-gw-button{border-color:#6c757d !important}/*!@.border-success*/.border-success.sc-gw-button{border-color:#198754 !important}/*!@.border-info*/.border-info.sc-gw-button{border-color:#0dcaf0 !important}/*!@.border-warning*/.border-warning.sc-gw-button{border-color:#ffc107 !important}/*!@.border-danger*/.border-danger.sc-gw-button{border-color:#dc3545 !important}/*!@.border-light*/.border-light.sc-gw-button{border-color:#f8f9fa !important}/*!@.border-dark*/.border-dark.sc-gw-button{border-color:#212529 !important}/*!@.border-white*/.border-white.sc-gw-button{border-color:#fff !important}/*!@.border-1*/.border-1.sc-gw-button{border-width:1px !important}/*!@.border-2*/.border-2.sc-gw-button{border-width:2px !important}/*!@.border-3*/.border-3.sc-gw-button{border-width:3px !important}/*!@.border-4*/.border-4.sc-gw-button{border-width:4px !important}/*!@.border-5*/.border-5.sc-gw-button{border-width:5px !important}/*!@.w-25*/.w-25.sc-gw-button{width:25% !important}/*!@.w-50*/.w-50.sc-gw-button{width:50% !important}/*!@.w-75*/.w-75.sc-gw-button{width:75% !important}/*!@.w-100*/.w-100.sc-gw-button{width:100% !important}/*!@.w-auto*/.w-auto.sc-gw-button{width:auto !important}/*!@.mw-100*/.mw-100.sc-gw-button{max-width:100% !important}/*!@.vw-100*/.vw-100.sc-gw-button{width:100vw !important}/*!@.min-vw-100*/.min-vw-100.sc-gw-button{min-width:100vw !important}/*!@.h-25*/.h-25.sc-gw-button{height:25% !important}/*!@.h-50*/.h-50.sc-gw-button{height:50% !important}/*!@.h-75*/.h-75.sc-gw-button{height:75% !important}/*!@.h-100*/.h-100.sc-gw-button{height:100% !important}/*!@.h-auto*/.h-auto.sc-gw-button{height:auto !important}/*!@.mh-100*/.mh-100.sc-gw-button{max-height:100% !important}/*!@.vh-100*/.vh-100.sc-gw-button{height:100vh !important}/*!@.min-vh-100*/.min-vh-100.sc-gw-button{min-height:100vh !important}/*!@.flex-fill*/.flex-fill.sc-gw-button{flex:1 1 auto !important}/*!@.flex-row*/.flex-row.sc-gw-button{flex-direction:row !important}/*!@.flex-column*/.flex-column.sc-gw-button{flex-direction:column !important}/*!@.flex-row-reverse*/.flex-row-reverse.sc-gw-button{flex-direction:row-reverse !important}/*!@.flex-column-reverse*/.flex-column-reverse.sc-gw-button{flex-direction:column-reverse !important}/*!@.flex-grow-0*/.flex-grow-0.sc-gw-button{flex-grow:0 !important}/*!@.flex-grow-1*/.flex-grow-1.sc-gw-button{flex-grow:1 !important}/*!@.flex-shrink-0*/.flex-shrink-0.sc-gw-button{flex-shrink:0 !important}/*!@.flex-shrink-1*/.flex-shrink-1.sc-gw-button{flex-shrink:1 !important}/*!@.flex-wrap*/.flex-wrap.sc-gw-button{flex-wrap:wrap !important}/*!@.flex-nowrap*/.flex-nowrap.sc-gw-button{flex-wrap:nowrap !important}/*!@.flex-wrap-reverse*/.flex-wrap-reverse.sc-gw-button{flex-wrap:wrap-reverse !important}/*!@.gap-0*/.gap-0.sc-gw-button{gap:0 !important}/*!@.gap-1*/.gap-1.sc-gw-button{gap:0.25rem !important}/*!@.gap-2*/.gap-2.sc-gw-button{gap:0.5rem !important}/*!@.gap-3*/.gap-3.sc-gw-button{gap:1rem !important}/*!@.gap-4*/.gap-4.sc-gw-button{gap:1.5rem !important}/*!@.gap-5*/.gap-5.sc-gw-button{gap:3rem !important}/*!@.justify-content-start*/.justify-content-start.sc-gw-button{justify-content:flex-start !important}/*!@.justify-content-end*/.justify-content-end.sc-gw-button{justify-content:flex-end !important}/*!@.justify-content-center*/.justify-content-center.sc-gw-button{justify-content:center !important}/*!@.justify-content-between*/.justify-content-between.sc-gw-button{justify-content:space-between !important}/*!@.justify-content-around*/.justify-content-around.sc-gw-button{justify-content:space-around !important}/*!@.justify-content-evenly*/.justify-content-evenly.sc-gw-button{justify-content:space-evenly !important}/*!@.align-items-start*/.align-items-start.sc-gw-button{align-items:flex-start !important}/*!@.align-items-end*/.align-items-end.sc-gw-button{align-items:flex-end !important}/*!@.align-items-center*/.align-items-center.sc-gw-button{align-items:center !important}/*!@.align-items-baseline*/.align-items-baseline.sc-gw-button{align-items:baseline !important}/*!@.align-items-stretch*/.align-items-stretch.sc-gw-button{align-items:stretch !important}/*!@.align-content-start*/.align-content-start.sc-gw-button{align-content:flex-start !important}/*!@.align-content-end*/.align-content-end.sc-gw-button{align-content:flex-end !important}/*!@.align-content-center*/.align-content-center.sc-gw-button{align-content:center !important}/*!@.align-content-between*/.align-content-between.sc-gw-button{align-content:space-between !important}/*!@.align-content-around*/.align-content-around.sc-gw-button{align-content:space-around !important}/*!@.align-content-stretch*/.align-content-stretch.sc-gw-button{align-content:stretch !important}/*!@.align-self-auto*/.align-self-auto.sc-gw-button{align-self:auto !important}/*!@.align-self-start*/.align-self-start.sc-gw-button{align-self:flex-start !important}/*!@.align-self-end*/.align-self-end.sc-gw-button{align-self:flex-end !important}/*!@.align-self-center*/.align-self-center.sc-gw-button{align-self:center !important}/*!@.align-self-baseline*/.align-self-baseline.sc-gw-button{align-self:baseline !important}/*!@.align-self-stretch*/.align-self-stretch.sc-gw-button{align-self:stretch !important}/*!@.order-first*/.order-first.sc-gw-button{order:-1 !important}/*!@.order-0*/.order-0.sc-gw-button{order:0 !important}/*!@.order-1*/.order-1.sc-gw-button{order:1 !important}/*!@.order-2*/.order-2.sc-gw-button{order:2 !important}/*!@.order-3*/.order-3.sc-gw-button{order:3 !important}/*!@.order-4*/.order-4.sc-gw-button{order:4 !important}/*!@.order-5*/.order-5.sc-gw-button{order:5 !important}/*!@.order-last*/.order-last.sc-gw-button{order:6 !important}/*!@.m-0*/.m-0.sc-gw-button{margin:0 !important}/*!@.m-1*/.m-1.sc-gw-button{margin:0.25rem !important}/*!@.m-2*/.m-2.sc-gw-button{margin:0.5rem !important}/*!@.m-3*/.m-3.sc-gw-button{margin:1rem !important}/*!@.m-4*/.m-4.sc-gw-button{margin:1.5rem !important}/*!@.m-5*/.m-5.sc-gw-button{margin:3rem !important}/*!@.m-auto*/.m-auto.sc-gw-button{margin:auto !important}/*!@.mx-0*/.mx-0.sc-gw-button{margin-right:0 !important;margin-left:0 !important}/*!@.mx-1*/.mx-1.sc-gw-button{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-2*/.mx-2.sc-gw-button{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-3*/.mx-3.sc-gw-button{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-4*/.mx-4.sc-gw-button{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-5*/.mx-5.sc-gw-button{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-auto*/.mx-auto.sc-gw-button{margin-right:auto !important;margin-left:auto !important}/*!@.my-0*/.my-0.sc-gw-button{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-1*/.my-1.sc-gw-button{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-2*/.my-2.sc-gw-button{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-3*/.my-3.sc-gw-button{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-4*/.my-4.sc-gw-button{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-5*/.my-5.sc-gw-button{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-auto*/.my-auto.sc-gw-button{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-0*/.mt-0.sc-gw-button{margin-top:0 !important}/*!@.mt-1*/.mt-1.sc-gw-button{margin-top:0.25rem !important}/*!@.mt-2*/.mt-2.sc-gw-button{margin-top:0.5rem !important}/*!@.mt-3*/.mt-3.sc-gw-button{margin-top:1rem !important}/*!@.mt-4*/.mt-4.sc-gw-button{margin-top:1.5rem !important}/*!@.mt-5*/.mt-5.sc-gw-button{margin-top:3rem !important}/*!@.mt-auto*/.mt-auto.sc-gw-button{margin-top:auto !important}/*!@.me-0*/.me-0.sc-gw-button{margin-right:0 !important}/*!@.me-1*/.me-1.sc-gw-button{margin-right:0.25rem !important}/*!@.me-2*/.me-2.sc-gw-button{margin-right:0.5rem !important}/*!@.me-3*/.me-3.sc-gw-button{margin-right:1rem !important}/*!@.me-4*/.me-4.sc-gw-button{margin-right:1.5rem !important}/*!@.me-5*/.me-5.sc-gw-button{margin-right:3rem !important}/*!@.me-auto*/.me-auto.sc-gw-button{margin-right:auto !important}/*!@.mb-0*/.mb-0.sc-gw-button{margin-bottom:0 !important}/*!@.mb-1*/.mb-1.sc-gw-button{margin-bottom:0.25rem !important}/*!@.mb-2*/.mb-2.sc-gw-button{margin-bottom:0.5rem !important}/*!@.mb-3*/.mb-3.sc-gw-button{margin-bottom:1rem !important}/*!@.mb-4*/.mb-4.sc-gw-button{margin-bottom:1.5rem !important}/*!@.mb-5*/.mb-5.sc-gw-button{margin-bottom:3rem !important}/*!@.mb-auto*/.mb-auto.sc-gw-button{margin-bottom:auto !important}/*!@.ms-0*/.ms-0.sc-gw-button{margin-left:0 !important}/*!@.ms-1*/.ms-1.sc-gw-button{margin-left:0.25rem !important}/*!@.ms-2*/.ms-2.sc-gw-button{margin-left:0.5rem !important}/*!@.ms-3*/.ms-3.sc-gw-button{margin-left:1rem !important}/*!@.ms-4*/.ms-4.sc-gw-button{margin-left:1.5rem !important}/*!@.ms-5*/.ms-5.sc-gw-button{margin-left:3rem !important}/*!@.ms-auto*/.ms-auto.sc-gw-button{margin-left:auto !important}/*!@.p-0*/.p-0.sc-gw-button{padding:0 !important}/*!@.p-1*/.p-1.sc-gw-button{padding:0.25rem !important}/*!@.p-2*/.p-2.sc-gw-button{padding:0.5rem !important}/*!@.p-3*/.p-3.sc-gw-button{padding:1rem !important}/*!@.p-4*/.p-4.sc-gw-button{padding:1.5rem !important}/*!@.p-5*/.p-5.sc-gw-button{padding:3rem !important}/*!@.px-0*/.px-0.sc-gw-button{padding-right:0 !important;padding-left:0 !important}/*!@.px-1*/.px-1.sc-gw-button{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-2*/.px-2.sc-gw-button{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-3*/.px-3.sc-gw-button{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-4*/.px-4.sc-gw-button{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-5*/.px-5.sc-gw-button{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-0*/.py-0.sc-gw-button{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-1*/.py-1.sc-gw-button{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-2*/.py-2.sc-gw-button{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-3*/.py-3.sc-gw-button{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-4*/.py-4.sc-gw-button{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-5*/.py-5.sc-gw-button{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-0*/.pt-0.sc-gw-button{padding-top:0 !important}/*!@.pt-1*/.pt-1.sc-gw-button{padding-top:0.25rem !important}/*!@.pt-2*/.pt-2.sc-gw-button{padding-top:0.5rem !important}/*!@.pt-3*/.pt-3.sc-gw-button{padding-top:1rem !important}/*!@.pt-4*/.pt-4.sc-gw-button{padding-top:1.5rem !important}/*!@.pt-5*/.pt-5.sc-gw-button{padding-top:3rem !important}/*!@.pe-0*/.pe-0.sc-gw-button{padding-right:0 !important}/*!@.pe-1*/.pe-1.sc-gw-button{padding-right:0.25rem !important}/*!@.pe-2*/.pe-2.sc-gw-button{padding-right:0.5rem !important}/*!@.pe-3*/.pe-3.sc-gw-button{padding-right:1rem !important}/*!@.pe-4*/.pe-4.sc-gw-button{padding-right:1.5rem !important}/*!@.pe-5*/.pe-5.sc-gw-button{padding-right:3rem !important}/*!@.pb-0*/.pb-0.sc-gw-button{padding-bottom:0 !important}/*!@.pb-1*/.pb-1.sc-gw-button{padding-bottom:0.25rem !important}/*!@.pb-2*/.pb-2.sc-gw-button{padding-bottom:0.5rem !important}/*!@.pb-3*/.pb-3.sc-gw-button{padding-bottom:1rem !important}/*!@.pb-4*/.pb-4.sc-gw-button{padding-bottom:1.5rem !important}/*!@.pb-5*/.pb-5.sc-gw-button{padding-bottom:3rem !important}/*!@.ps-0*/.ps-0.sc-gw-button{padding-left:0 !important}/*!@.ps-1*/.ps-1.sc-gw-button{padding-left:0.25rem !important}/*!@.ps-2*/.ps-2.sc-gw-button{padding-left:0.5rem !important}/*!@.ps-3*/.ps-3.sc-gw-button{padding-left:1rem !important}/*!@.ps-4*/.ps-4.sc-gw-button{padding-left:1.5rem !important}/*!@.ps-5*/.ps-5.sc-gw-button{padding-left:3rem !important}/*!@.font-monospace*/.font-monospace.sc-gw-button{font-family:var(--bs-font-monospace) !important}/*!@.fs-1*/.fs-1.sc-gw-button{font-size:calc(1.375rem + 1.5vw) !important}/*!@.fs-2*/.fs-2.sc-gw-button{font-size:calc(1.325rem + 0.9vw) !important}/*!@.fs-3*/.fs-3.sc-gw-button{font-size:calc(1.3rem + 0.6vw) !important}/*!@.fs-4*/.fs-4.sc-gw-button{font-size:calc(1.275rem + 0.3vw) !important}/*!@.fs-5*/.fs-5.sc-gw-button{font-size:1.25rem !important}/*!@.fs-6*/.fs-6.sc-gw-button{font-size:1rem !important}/*!@.fst-italic*/.fst-italic.sc-gw-button{font-style:italic !important}/*!@.fst-normal*/.fst-normal.sc-gw-button{font-style:normal !important}/*!@.fw-light*/.fw-light.sc-gw-button{font-weight:300 !important}/*!@.fw-lighter*/.fw-lighter.sc-gw-button{font-weight:lighter !important}/*!@.fw-normal*/.fw-normal.sc-gw-button{font-weight:400 !important}/*!@.fw-bold*/.fw-bold.sc-gw-button{font-weight:700 !important}/*!@.fw-bolder*/.fw-bolder.sc-gw-button{font-weight:bolder !important}/*!@.lh-1*/.lh-1.sc-gw-button{line-height:1 !important}/*!@.lh-sm*/.lh-sm.sc-gw-button{line-height:1.25 !important}/*!@.lh-base*/.lh-base.sc-gw-button{line-height:1.5 !important}/*!@.lh-lg*/.lh-lg.sc-gw-button{line-height:2 !important}/*!@.text-start*/.text-start.sc-gw-button{text-align:left !important}/*!@.text-end*/.text-end.sc-gw-button{text-align:right !important}/*!@.text-center*/.text-center.sc-gw-button{text-align:center !important}/*!@.text-decoration-none*/.text-decoration-none.sc-gw-button{text-decoration:none !important}/*!@.text-decoration-underline*/.text-decoration-underline.sc-gw-button{text-decoration:underline !important}/*!@.text-decoration-line-through*/.text-decoration-line-through.sc-gw-button{text-decoration:line-through !important}/*!@.text-lowercase*/.text-lowercase.sc-gw-button{text-transform:lowercase !important}/*!@.text-uppercase*/.text-uppercase.sc-gw-button{text-transform:uppercase !important}/*!@.text-capitalize*/.text-capitalize.sc-gw-button{text-transform:capitalize !important}/*!@.text-wrap*/.text-wrap.sc-gw-button{white-space:normal !important}/*!@.text-nowrap*/.text-nowrap.sc-gw-button{white-space:nowrap !important}/*!@.text-break*/.text-break.sc-gw-button{word-wrap:break-word !important;word-break:break-word !important}/*!@.text-primary*/.text-primary.sc-gw-button{color:#0d6efd !important}/*!@.text-secondary*/.text-secondary.sc-gw-button{color:#6c757d !important}/*!@.text-success*/.text-success.sc-gw-button{color:#198754 !important}/*!@.text-info*/.text-info.sc-gw-button{color:#0dcaf0 !important}/*!@.text-warning*/.text-warning.sc-gw-button{color:#ffc107 !important}/*!@.text-danger*/.text-danger.sc-gw-button{color:#dc3545 !important}/*!@.text-light*/.text-light.sc-gw-button{color:#f8f9fa !important}/*!@.text-dark*/.text-dark.sc-gw-button{color:#212529 !important}/*!@.text-white*/.text-white.sc-gw-button{color:#fff !important}/*!@.text-body*/.text-body.sc-gw-button{color:#212529 !important}/*!@.text-muted*/.text-muted.sc-gw-button{color:#6c757d !important}/*!@.text-black-50*/.text-black-50.sc-gw-button{color:rgba(0, 0, 0, 0.5) !important}/*!@.text-white-50*/.text-white-50.sc-gw-button{color:rgba(255, 255, 255, 0.5) !important}/*!@.text-reset*/.text-reset.sc-gw-button{color:inherit !important}/*!@.bg-primary*/.bg-primary.sc-gw-button{background-color:#0d6efd !important}/*!@.bg-secondary*/.bg-secondary.sc-gw-button{background-color:#6c757d !important}/*!@.bg-success*/.bg-success.sc-gw-button{background-color:#198754 !important}/*!@.bg-info*/.bg-info.sc-gw-button{background-color:#0dcaf0 !important}/*!@.bg-warning*/.bg-warning.sc-gw-button{background-color:#ffc107 !important}/*!@.bg-danger*/.bg-danger.sc-gw-button{background-color:#dc3545 !important}/*!@.bg-light*/.bg-light.sc-gw-button{background-color:#f8f9fa !important}/*!@.bg-dark*/.bg-dark.sc-gw-button{background-color:#212529 !important}/*!@.bg-body*/.bg-body.sc-gw-button{background-color:#fff !important}/*!@.bg-white*/.bg-white.sc-gw-button{background-color:#fff !important}/*!@.bg-transparent*/.bg-transparent.sc-gw-button{background-color:transparent !important}/*!@.bg-gradient*/.bg-gradient.sc-gw-button{background-image:var(--bs-gradient) !important}/*!@.user-select-all*/.user-select-all.sc-gw-button{-webkit-user-select:all !important;-moz-user-select:all !important;user-select:all !important}/*!@.user-select-auto*/.user-select-auto.sc-gw-button{-webkit-user-select:auto !important;-moz-user-select:auto !important;user-select:auto !important}/*!@.user-select-none*/.user-select-none.sc-gw-button{-webkit-user-select:none !important;-moz-user-select:none !important;user-select:none !important}/*!@.pe-none*/.pe-none.sc-gw-button{pointer-events:none !important}/*!@.pe-auto*/.pe-auto.sc-gw-button{pointer-events:auto !important}/*!@.rounded*/.rounded.sc-gw-button{border-radius:0.25rem !important}/*!@.rounded-0*/.rounded-0.sc-gw-button{border-radius:0 !important}/*!@.rounded-1*/.rounded-1.sc-gw-button{border-radius:0.2rem !important}/*!@.rounded-2*/.rounded-2.sc-gw-button{border-radius:0.25rem !important}/*!@.rounded-3*/.rounded-3.sc-gw-button{border-radius:0.3rem !important}/*!@.rounded-circle*/.rounded-circle.sc-gw-button{border-radius:50% !important}/*!@.rounded-pill*/.rounded-pill.sc-gw-button{border-radius:50rem !important}/*!@.rounded-top*/.rounded-top.sc-gw-button{border-top-left-radius:0.25rem !important;border-top-right-radius:0.25rem !important}/*!@.rounded-end*/.rounded-end.sc-gw-button{border-top-right-radius:0.25rem !important;border-bottom-right-radius:0.25rem !important}/*!@.rounded-bottom*/.rounded-bottom.sc-gw-button{border-bottom-right-radius:0.25rem !important;border-bottom-left-radius:0.25rem !important}/*!@.rounded-start*/.rounded-start.sc-gw-button{border-bottom-left-radius:0.25rem !important;border-top-left-radius:0.25rem !important}/*!@.visible*/.visible.sc-gw-button{visibility:visible !important}/*!@.invisible*/.invisible.sc-gw-button{visibility:hidden !important}@media (min-width: 576px){/*!@.float-sm-start*/.float-sm-start.sc-gw-button{float:left !important}/*!@.float-sm-end*/.float-sm-end.sc-gw-button{float:right !important}/*!@.float-sm-none*/.float-sm-none.sc-gw-button{float:none !important}/*!@.d-sm-inline*/.d-sm-inline.sc-gw-button{display:inline !important}/*!@.d-sm-inline-block*/.d-sm-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-sm-block*/.d-sm-block.sc-gw-button{display:block !important}/*!@.d-sm-grid*/.d-sm-grid.sc-gw-button{display:grid !important}/*!@.d-sm-table*/.d-sm-table.sc-gw-button{display:table !important}/*!@.d-sm-table-row*/.d-sm-table-row.sc-gw-button{display:table-row !important}/*!@.d-sm-table-cell*/.d-sm-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-sm-flex*/.d-sm-flex.sc-gw-button{display:flex !important}/*!@.d-sm-inline-flex*/.d-sm-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-sm-none*/.d-sm-none.sc-gw-button{display:none !important}/*!@.flex-sm-fill*/.flex-sm-fill.sc-gw-button{flex:1 1 auto !important}/*!@.flex-sm-row*/.flex-sm-row.sc-gw-button{flex-direction:row !important}/*!@.flex-sm-column*/.flex-sm-column.sc-gw-button{flex-direction:column !important}/*!@.flex-sm-row-reverse*/.flex-sm-row-reverse.sc-gw-button{flex-direction:row-reverse !important}/*!@.flex-sm-column-reverse*/.flex-sm-column-reverse.sc-gw-button{flex-direction:column-reverse !important}/*!@.flex-sm-grow-0*/.flex-sm-grow-0.sc-gw-button{flex-grow:0 !important}/*!@.flex-sm-grow-1*/.flex-sm-grow-1.sc-gw-button{flex-grow:1 !important}/*!@.flex-sm-shrink-0*/.flex-sm-shrink-0.sc-gw-button{flex-shrink:0 !important}/*!@.flex-sm-shrink-1*/.flex-sm-shrink-1.sc-gw-button{flex-shrink:1 !important}/*!@.flex-sm-wrap*/.flex-sm-wrap.sc-gw-button{flex-wrap:wrap !important}/*!@.flex-sm-nowrap*/.flex-sm-nowrap.sc-gw-button{flex-wrap:nowrap !important}/*!@.flex-sm-wrap-reverse*/.flex-sm-wrap-reverse.sc-gw-button{flex-wrap:wrap-reverse !important}/*!@.gap-sm-0*/.gap-sm-0.sc-gw-button{gap:0 !important}/*!@.gap-sm-1*/.gap-sm-1.sc-gw-button{gap:0.25rem !important}/*!@.gap-sm-2*/.gap-sm-2.sc-gw-button{gap:0.5rem !important}/*!@.gap-sm-3*/.gap-sm-3.sc-gw-button{gap:1rem !important}/*!@.gap-sm-4*/.gap-sm-4.sc-gw-button{gap:1.5rem !important}/*!@.gap-sm-5*/.gap-sm-5.sc-gw-button{gap:3rem !important}/*!@.justify-content-sm-start*/.justify-content-sm-start.sc-gw-button{justify-content:flex-start !important}/*!@.justify-content-sm-end*/.justify-content-sm-end.sc-gw-button{justify-content:flex-end !important}/*!@.justify-content-sm-center*/.justify-content-sm-center.sc-gw-button{justify-content:center !important}/*!@.justify-content-sm-between*/.justify-content-sm-between.sc-gw-button{justify-content:space-between !important}/*!@.justify-content-sm-around*/.justify-content-sm-around.sc-gw-button{justify-content:space-around !important}/*!@.justify-content-sm-evenly*/.justify-content-sm-evenly.sc-gw-button{justify-content:space-evenly !important}/*!@.align-items-sm-start*/.align-items-sm-start.sc-gw-button{align-items:flex-start !important}/*!@.align-items-sm-end*/.align-items-sm-end.sc-gw-button{align-items:flex-end !important}/*!@.align-items-sm-center*/.align-items-sm-center.sc-gw-button{align-items:center !important}/*!@.align-items-sm-baseline*/.align-items-sm-baseline.sc-gw-button{align-items:baseline !important}/*!@.align-items-sm-stretch*/.align-items-sm-stretch.sc-gw-button{align-items:stretch !important}/*!@.align-content-sm-start*/.align-content-sm-start.sc-gw-button{align-content:flex-start !important}/*!@.align-content-sm-end*/.align-content-sm-end.sc-gw-button{align-content:flex-end !important}/*!@.align-content-sm-center*/.align-content-sm-center.sc-gw-button{align-content:center !important}/*!@.align-content-sm-between*/.align-content-sm-between.sc-gw-button{align-content:space-between !important}/*!@.align-content-sm-around*/.align-content-sm-around.sc-gw-button{align-content:space-around !important}/*!@.align-content-sm-stretch*/.align-content-sm-stretch.sc-gw-button{align-content:stretch !important}/*!@.align-self-sm-auto*/.align-self-sm-auto.sc-gw-button{align-self:auto !important}/*!@.align-self-sm-start*/.align-self-sm-start.sc-gw-button{align-self:flex-start !important}/*!@.align-self-sm-end*/.align-self-sm-end.sc-gw-button{align-self:flex-end !important}/*!@.align-self-sm-center*/.align-self-sm-center.sc-gw-button{align-self:center !important}/*!@.align-self-sm-baseline*/.align-self-sm-baseline.sc-gw-button{align-self:baseline !important}/*!@.align-self-sm-stretch*/.align-self-sm-stretch.sc-gw-button{align-self:stretch !important}/*!@.order-sm-first*/.order-sm-first.sc-gw-button{order:-1 !important}/*!@.order-sm-0*/.order-sm-0.sc-gw-button{order:0 !important}/*!@.order-sm-1*/.order-sm-1.sc-gw-button{order:1 !important}/*!@.order-sm-2*/.order-sm-2.sc-gw-button{order:2 !important}/*!@.order-sm-3*/.order-sm-3.sc-gw-button{order:3 !important}/*!@.order-sm-4*/.order-sm-4.sc-gw-button{order:4 !important}/*!@.order-sm-5*/.order-sm-5.sc-gw-button{order:5 !important}/*!@.order-sm-last*/.order-sm-last.sc-gw-button{order:6 !important}/*!@.m-sm-0*/.m-sm-0.sc-gw-button{margin:0 !important}/*!@.m-sm-1*/.m-sm-1.sc-gw-button{margin:0.25rem !important}/*!@.m-sm-2*/.m-sm-2.sc-gw-button{margin:0.5rem !important}/*!@.m-sm-3*/.m-sm-3.sc-gw-button{margin:1rem !important}/*!@.m-sm-4*/.m-sm-4.sc-gw-button{margin:1.5rem !important}/*!@.m-sm-5*/.m-sm-5.sc-gw-button{margin:3rem !important}/*!@.m-sm-auto*/.m-sm-auto.sc-gw-button{margin:auto !important}/*!@.mx-sm-0*/.mx-sm-0.sc-gw-button{margin-right:0 !important;margin-left:0 !important}/*!@.mx-sm-1*/.mx-sm-1.sc-gw-button{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-sm-2*/.mx-sm-2.sc-gw-button{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-sm-3*/.mx-sm-3.sc-gw-button{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-sm-4*/.mx-sm-4.sc-gw-button{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-sm-5*/.mx-sm-5.sc-gw-button{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-sm-auto*/.mx-sm-auto.sc-gw-button{margin-right:auto !important;margin-left:auto !important}/*!@.my-sm-0*/.my-sm-0.sc-gw-button{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-sm-1*/.my-sm-1.sc-gw-button{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-sm-2*/.my-sm-2.sc-gw-button{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-sm-3*/.my-sm-3.sc-gw-button{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-sm-4*/.my-sm-4.sc-gw-button{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-sm-5*/.my-sm-5.sc-gw-button{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-sm-auto*/.my-sm-auto.sc-gw-button{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-sm-0*/.mt-sm-0.sc-gw-button{margin-top:0 !important}/*!@.mt-sm-1*/.mt-sm-1.sc-gw-button{margin-top:0.25rem !important}/*!@.mt-sm-2*/.mt-sm-2.sc-gw-button{margin-top:0.5rem !important}/*!@.mt-sm-3*/.mt-sm-3.sc-gw-button{margin-top:1rem !important}/*!@.mt-sm-4*/.mt-sm-4.sc-gw-button{margin-top:1.5rem !important}/*!@.mt-sm-5*/.mt-sm-5.sc-gw-button{margin-top:3rem !important}/*!@.mt-sm-auto*/.mt-sm-auto.sc-gw-button{margin-top:auto !important}/*!@.me-sm-0*/.me-sm-0.sc-gw-button{margin-right:0 !important}/*!@.me-sm-1*/.me-sm-1.sc-gw-button{margin-right:0.25rem !important}/*!@.me-sm-2*/.me-sm-2.sc-gw-button{margin-right:0.5rem !important}/*!@.me-sm-3*/.me-sm-3.sc-gw-button{margin-right:1rem !important}/*!@.me-sm-4*/.me-sm-4.sc-gw-button{margin-right:1.5rem !important}/*!@.me-sm-5*/.me-sm-5.sc-gw-button{margin-right:3rem !important}/*!@.me-sm-auto*/.me-sm-auto.sc-gw-button{margin-right:auto !important}/*!@.mb-sm-0*/.mb-sm-0.sc-gw-button{margin-bottom:0 !important}/*!@.mb-sm-1*/.mb-sm-1.sc-gw-button{margin-bottom:0.25rem !important}/*!@.mb-sm-2*/.mb-sm-2.sc-gw-button{margin-bottom:0.5rem !important}/*!@.mb-sm-3*/.mb-sm-3.sc-gw-button{margin-bottom:1rem !important}/*!@.mb-sm-4*/.mb-sm-4.sc-gw-button{margin-bottom:1.5rem !important}/*!@.mb-sm-5*/.mb-sm-5.sc-gw-button{margin-bottom:3rem !important}/*!@.mb-sm-auto*/.mb-sm-auto.sc-gw-button{margin-bottom:auto !important}/*!@.ms-sm-0*/.ms-sm-0.sc-gw-button{margin-left:0 !important}/*!@.ms-sm-1*/.ms-sm-1.sc-gw-button{margin-left:0.25rem !important}/*!@.ms-sm-2*/.ms-sm-2.sc-gw-button{margin-left:0.5rem !important}/*!@.ms-sm-3*/.ms-sm-3.sc-gw-button{margin-left:1rem !important}/*!@.ms-sm-4*/.ms-sm-4.sc-gw-button{margin-left:1.5rem !important}/*!@.ms-sm-5*/.ms-sm-5.sc-gw-button{margin-left:3rem !important}/*!@.ms-sm-auto*/.ms-sm-auto.sc-gw-button{margin-left:auto !important}/*!@.p-sm-0*/.p-sm-0.sc-gw-button{padding:0 !important}/*!@.p-sm-1*/.p-sm-1.sc-gw-button{padding:0.25rem !important}/*!@.p-sm-2*/.p-sm-2.sc-gw-button{padding:0.5rem !important}/*!@.p-sm-3*/.p-sm-3.sc-gw-button{padding:1rem !important}/*!@.p-sm-4*/.p-sm-4.sc-gw-button{padding:1.5rem !important}/*!@.p-sm-5*/.p-sm-5.sc-gw-button{padding:3rem !important}/*!@.px-sm-0*/.px-sm-0.sc-gw-button{padding-right:0 !important;padding-left:0 !important}/*!@.px-sm-1*/.px-sm-1.sc-gw-button{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-sm-2*/.px-sm-2.sc-gw-button{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-sm-3*/.px-sm-3.sc-gw-button{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-sm-4*/.px-sm-4.sc-gw-button{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-sm-5*/.px-sm-5.sc-gw-button{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-sm-0*/.py-sm-0.sc-gw-button{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-sm-1*/.py-sm-1.sc-gw-button{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-sm-2*/.py-sm-2.sc-gw-button{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-sm-3*/.py-sm-3.sc-gw-button{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-sm-4*/.py-sm-4.sc-gw-button{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-sm-5*/.py-sm-5.sc-gw-button{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-sm-0*/.pt-sm-0.sc-gw-button{padding-top:0 !important}/*!@.pt-sm-1*/.pt-sm-1.sc-gw-button{padding-top:0.25rem !important}/*!@.pt-sm-2*/.pt-sm-2.sc-gw-button{padding-top:0.5rem !important}/*!@.pt-sm-3*/.pt-sm-3.sc-gw-button{padding-top:1rem !important}/*!@.pt-sm-4*/.pt-sm-4.sc-gw-button{padding-top:1.5rem !important}/*!@.pt-sm-5*/.pt-sm-5.sc-gw-button{padding-top:3rem !important}/*!@.pe-sm-0*/.pe-sm-0.sc-gw-button{padding-right:0 !important}/*!@.pe-sm-1*/.pe-sm-1.sc-gw-button{padding-right:0.25rem !important}/*!@.pe-sm-2*/.pe-sm-2.sc-gw-button{padding-right:0.5rem !important}/*!@.pe-sm-3*/.pe-sm-3.sc-gw-button{padding-right:1rem !important}/*!@.pe-sm-4*/.pe-sm-4.sc-gw-button{padding-right:1.5rem !important}/*!@.pe-sm-5*/.pe-sm-5.sc-gw-button{padding-right:3rem !important}/*!@.pb-sm-0*/.pb-sm-0.sc-gw-button{padding-bottom:0 !important}/*!@.pb-sm-1*/.pb-sm-1.sc-gw-button{padding-bottom:0.25rem !important}/*!@.pb-sm-2*/.pb-sm-2.sc-gw-button{padding-bottom:0.5rem !important}/*!@.pb-sm-3*/.pb-sm-3.sc-gw-button{padding-bottom:1rem !important}/*!@.pb-sm-4*/.pb-sm-4.sc-gw-button{padding-bottom:1.5rem !important}/*!@.pb-sm-5*/.pb-sm-5.sc-gw-button{padding-bottom:3rem !important}/*!@.ps-sm-0*/.ps-sm-0.sc-gw-button{padding-left:0 !important}/*!@.ps-sm-1*/.ps-sm-1.sc-gw-button{padding-left:0.25rem !important}/*!@.ps-sm-2*/.ps-sm-2.sc-gw-button{padding-left:0.5rem !important}/*!@.ps-sm-3*/.ps-sm-3.sc-gw-button{padding-left:1rem !important}/*!@.ps-sm-4*/.ps-sm-4.sc-gw-button{padding-left:1.5rem !important}/*!@.ps-sm-5*/.ps-sm-5.sc-gw-button{padding-left:3rem !important}/*!@.text-sm-start*/.text-sm-start.sc-gw-button{text-align:left !important}/*!@.text-sm-end*/.text-sm-end.sc-gw-button{text-align:right !important}/*!@.text-sm-center*/.text-sm-center.sc-gw-button{text-align:center !important}}@media (min-width: 768px){/*!@.float-md-start*/.float-md-start.sc-gw-button{float:left !important}/*!@.float-md-end*/.float-md-end.sc-gw-button{float:right !important}/*!@.float-md-none*/.float-md-none.sc-gw-button{float:none !important}/*!@.d-md-inline*/.d-md-inline.sc-gw-button{display:inline !important}/*!@.d-md-inline-block*/.d-md-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-md-block*/.d-md-block.sc-gw-button{display:block !important}/*!@.d-md-grid*/.d-md-grid.sc-gw-button{display:grid !important}/*!@.d-md-table*/.d-md-table.sc-gw-button{display:table !important}/*!@.d-md-table-row*/.d-md-table-row.sc-gw-button{display:table-row !important}/*!@.d-md-table-cell*/.d-md-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-md-flex*/.d-md-flex.sc-gw-button{display:flex !important}/*!@.d-md-inline-flex*/.d-md-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-md-none*/.d-md-none.sc-gw-button{display:none !important}/*!@.flex-md-fill*/.flex-md-fill.sc-gw-button{flex:1 1 auto !important}/*!@.flex-md-row*/.flex-md-row.sc-gw-button{flex-direction:row !important}/*!@.flex-md-column*/.flex-md-column.sc-gw-button{flex-direction:column !important}/*!@.flex-md-row-reverse*/.flex-md-row-reverse.sc-gw-button{flex-direction:row-reverse !important}/*!@.flex-md-column-reverse*/.flex-md-column-reverse.sc-gw-button{flex-direction:column-reverse !important}/*!@.flex-md-grow-0*/.flex-md-grow-0.sc-gw-button{flex-grow:0 !important}/*!@.flex-md-grow-1*/.flex-md-grow-1.sc-gw-button{flex-grow:1 !important}/*!@.flex-md-shrink-0*/.flex-md-shrink-0.sc-gw-button{flex-shrink:0 !important}/*!@.flex-md-shrink-1*/.flex-md-shrink-1.sc-gw-button{flex-shrink:1 !important}/*!@.flex-md-wrap*/.flex-md-wrap.sc-gw-button{flex-wrap:wrap !important}/*!@.flex-md-nowrap*/.flex-md-nowrap.sc-gw-button{flex-wrap:nowrap !important}/*!@.flex-md-wrap-reverse*/.flex-md-wrap-reverse.sc-gw-button{flex-wrap:wrap-reverse !important}/*!@.gap-md-0*/.gap-md-0.sc-gw-button{gap:0 !important}/*!@.gap-md-1*/.gap-md-1.sc-gw-button{gap:0.25rem !important}/*!@.gap-md-2*/.gap-md-2.sc-gw-button{gap:0.5rem !important}/*!@.gap-md-3*/.gap-md-3.sc-gw-button{gap:1rem !important}/*!@.gap-md-4*/.gap-md-4.sc-gw-button{gap:1.5rem !important}/*!@.gap-md-5*/.gap-md-5.sc-gw-button{gap:3rem !important}/*!@.justify-content-md-start*/.justify-content-md-start.sc-gw-button{justify-content:flex-start !important}/*!@.justify-content-md-end*/.justify-content-md-end.sc-gw-button{justify-content:flex-end !important}/*!@.justify-content-md-center*/.justify-content-md-center.sc-gw-button{justify-content:center !important}/*!@.justify-content-md-between*/.justify-content-md-between.sc-gw-button{justify-content:space-between !important}/*!@.justify-content-md-around*/.justify-content-md-around.sc-gw-button{justify-content:space-around !important}/*!@.justify-content-md-evenly*/.justify-content-md-evenly.sc-gw-button{justify-content:space-evenly !important}/*!@.align-items-md-start*/.align-items-md-start.sc-gw-button{align-items:flex-start !important}/*!@.align-items-md-end*/.align-items-md-end.sc-gw-button{align-items:flex-end !important}/*!@.align-items-md-center*/.align-items-md-center.sc-gw-button{align-items:center !important}/*!@.align-items-md-baseline*/.align-items-md-baseline.sc-gw-button{align-items:baseline !important}/*!@.align-items-md-stretch*/.align-items-md-stretch.sc-gw-button{align-items:stretch !important}/*!@.align-content-md-start*/.align-content-md-start.sc-gw-button{align-content:flex-start !important}/*!@.align-content-md-end*/.align-content-md-end.sc-gw-button{align-content:flex-end !important}/*!@.align-content-md-center*/.align-content-md-center.sc-gw-button{align-content:center !important}/*!@.align-content-md-between*/.align-content-md-between.sc-gw-button{align-content:space-between !important}/*!@.align-content-md-around*/.align-content-md-around.sc-gw-button{align-content:space-around !important}/*!@.align-content-md-stretch*/.align-content-md-stretch.sc-gw-button{align-content:stretch !important}/*!@.align-self-md-auto*/.align-self-md-auto.sc-gw-button{align-self:auto !important}/*!@.align-self-md-start*/.align-self-md-start.sc-gw-button{align-self:flex-start !important}/*!@.align-self-md-end*/.align-self-md-end.sc-gw-button{align-self:flex-end !important}/*!@.align-self-md-center*/.align-self-md-center.sc-gw-button{align-self:center !important}/*!@.align-self-md-baseline*/.align-self-md-baseline.sc-gw-button{align-self:baseline !important}/*!@.align-self-md-stretch*/.align-self-md-stretch.sc-gw-button{align-self:stretch !important}/*!@.order-md-first*/.order-md-first.sc-gw-button{order:-1 !important}/*!@.order-md-0*/.order-md-0.sc-gw-button{order:0 !important}/*!@.order-md-1*/.order-md-1.sc-gw-button{order:1 !important}/*!@.order-md-2*/.order-md-2.sc-gw-button{order:2 !important}/*!@.order-md-3*/.order-md-3.sc-gw-button{order:3 !important}/*!@.order-md-4*/.order-md-4.sc-gw-button{order:4 !important}/*!@.order-md-5*/.order-md-5.sc-gw-button{order:5 !important}/*!@.order-md-last*/.order-md-last.sc-gw-button{order:6 !important}/*!@.m-md-0*/.m-md-0.sc-gw-button{margin:0 !important}/*!@.m-md-1*/.m-md-1.sc-gw-button{margin:0.25rem !important}/*!@.m-md-2*/.m-md-2.sc-gw-button{margin:0.5rem !important}/*!@.m-md-3*/.m-md-3.sc-gw-button{margin:1rem !important}/*!@.m-md-4*/.m-md-4.sc-gw-button{margin:1.5rem !important}/*!@.m-md-5*/.m-md-5.sc-gw-button{margin:3rem !important}/*!@.m-md-auto*/.m-md-auto.sc-gw-button{margin:auto !important}/*!@.mx-md-0*/.mx-md-0.sc-gw-button{margin-right:0 !important;margin-left:0 !important}/*!@.mx-md-1*/.mx-md-1.sc-gw-button{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-md-2*/.mx-md-2.sc-gw-button{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-md-3*/.mx-md-3.sc-gw-button{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-md-4*/.mx-md-4.sc-gw-button{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-md-5*/.mx-md-5.sc-gw-button{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-md-auto*/.mx-md-auto.sc-gw-button{margin-right:auto !important;margin-left:auto !important}/*!@.my-md-0*/.my-md-0.sc-gw-button{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-md-1*/.my-md-1.sc-gw-button{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-md-2*/.my-md-2.sc-gw-button{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-md-3*/.my-md-3.sc-gw-button{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-md-4*/.my-md-4.sc-gw-button{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-md-5*/.my-md-5.sc-gw-button{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-md-auto*/.my-md-auto.sc-gw-button{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-md-0*/.mt-md-0.sc-gw-button{margin-top:0 !important}/*!@.mt-md-1*/.mt-md-1.sc-gw-button{margin-top:0.25rem !important}/*!@.mt-md-2*/.mt-md-2.sc-gw-button{margin-top:0.5rem !important}/*!@.mt-md-3*/.mt-md-3.sc-gw-button{margin-top:1rem !important}/*!@.mt-md-4*/.mt-md-4.sc-gw-button{margin-top:1.5rem !important}/*!@.mt-md-5*/.mt-md-5.sc-gw-button{margin-top:3rem !important}/*!@.mt-md-auto*/.mt-md-auto.sc-gw-button{margin-top:auto !important}/*!@.me-md-0*/.me-md-0.sc-gw-button{margin-right:0 !important}/*!@.me-md-1*/.me-md-1.sc-gw-button{margin-right:0.25rem !important}/*!@.me-md-2*/.me-md-2.sc-gw-button{margin-right:0.5rem !important}/*!@.me-md-3*/.me-md-3.sc-gw-button{margin-right:1rem !important}/*!@.me-md-4*/.me-md-4.sc-gw-button{margin-right:1.5rem !important}/*!@.me-md-5*/.me-md-5.sc-gw-button{margin-right:3rem !important}/*!@.me-md-auto*/.me-md-auto.sc-gw-button{margin-right:auto !important}/*!@.mb-md-0*/.mb-md-0.sc-gw-button{margin-bottom:0 !important}/*!@.mb-md-1*/.mb-md-1.sc-gw-button{margin-bottom:0.25rem !important}/*!@.mb-md-2*/.mb-md-2.sc-gw-button{margin-bottom:0.5rem !important}/*!@.mb-md-3*/.mb-md-3.sc-gw-button{margin-bottom:1rem !important}/*!@.mb-md-4*/.mb-md-4.sc-gw-button{margin-bottom:1.5rem !important}/*!@.mb-md-5*/.mb-md-5.sc-gw-button{margin-bottom:3rem !important}/*!@.mb-md-auto*/.mb-md-auto.sc-gw-button{margin-bottom:auto !important}/*!@.ms-md-0*/.ms-md-0.sc-gw-button{margin-left:0 !important}/*!@.ms-md-1*/.ms-md-1.sc-gw-button{margin-left:0.25rem !important}/*!@.ms-md-2*/.ms-md-2.sc-gw-button{margin-left:0.5rem !important}/*!@.ms-md-3*/.ms-md-3.sc-gw-button{margin-left:1rem !important}/*!@.ms-md-4*/.ms-md-4.sc-gw-button{margin-left:1.5rem !important}/*!@.ms-md-5*/.ms-md-5.sc-gw-button{margin-left:3rem !important}/*!@.ms-md-auto*/.ms-md-auto.sc-gw-button{margin-left:auto !important}/*!@.p-md-0*/.p-md-0.sc-gw-button{padding:0 !important}/*!@.p-md-1*/.p-md-1.sc-gw-button{padding:0.25rem !important}/*!@.p-md-2*/.p-md-2.sc-gw-button{padding:0.5rem !important}/*!@.p-md-3*/.p-md-3.sc-gw-button{padding:1rem !important}/*!@.p-md-4*/.p-md-4.sc-gw-button{padding:1.5rem !important}/*!@.p-md-5*/.p-md-5.sc-gw-button{padding:3rem !important}/*!@.px-md-0*/.px-md-0.sc-gw-button{padding-right:0 !important;padding-left:0 !important}/*!@.px-md-1*/.px-md-1.sc-gw-button{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-md-2*/.px-md-2.sc-gw-button{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-md-3*/.px-md-3.sc-gw-button{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-md-4*/.px-md-4.sc-gw-button{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-md-5*/.px-md-5.sc-gw-button{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-md-0*/.py-md-0.sc-gw-button{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-md-1*/.py-md-1.sc-gw-button{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-md-2*/.py-md-2.sc-gw-button{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-md-3*/.py-md-3.sc-gw-button{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-md-4*/.py-md-4.sc-gw-button{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-md-5*/.py-md-5.sc-gw-button{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-md-0*/.pt-md-0.sc-gw-button{padding-top:0 !important}/*!@.pt-md-1*/.pt-md-1.sc-gw-button{padding-top:0.25rem !important}/*!@.pt-md-2*/.pt-md-2.sc-gw-button{padding-top:0.5rem !important}/*!@.pt-md-3*/.pt-md-3.sc-gw-button{padding-top:1rem !important}/*!@.pt-md-4*/.pt-md-4.sc-gw-button{padding-top:1.5rem !important}/*!@.pt-md-5*/.pt-md-5.sc-gw-button{padding-top:3rem !important}/*!@.pe-md-0*/.pe-md-0.sc-gw-button{padding-right:0 !important}/*!@.pe-md-1*/.pe-md-1.sc-gw-button{padding-right:0.25rem !important}/*!@.pe-md-2*/.pe-md-2.sc-gw-button{padding-right:0.5rem !important}/*!@.pe-md-3*/.pe-md-3.sc-gw-button{padding-right:1rem !important}/*!@.pe-md-4*/.pe-md-4.sc-gw-button{padding-right:1.5rem !important}/*!@.pe-md-5*/.pe-md-5.sc-gw-button{padding-right:3rem !important}/*!@.pb-md-0*/.pb-md-0.sc-gw-button{padding-bottom:0 !important}/*!@.pb-md-1*/.pb-md-1.sc-gw-button{padding-bottom:0.25rem !important}/*!@.pb-md-2*/.pb-md-2.sc-gw-button{padding-bottom:0.5rem !important}/*!@.pb-md-3*/.pb-md-3.sc-gw-button{padding-bottom:1rem !important}/*!@.pb-md-4*/.pb-md-4.sc-gw-button{padding-bottom:1.5rem !important}/*!@.pb-md-5*/.pb-md-5.sc-gw-button{padding-bottom:3rem !important}/*!@.ps-md-0*/.ps-md-0.sc-gw-button{padding-left:0 !important}/*!@.ps-md-1*/.ps-md-1.sc-gw-button{padding-left:0.25rem !important}/*!@.ps-md-2*/.ps-md-2.sc-gw-button{padding-left:0.5rem !important}/*!@.ps-md-3*/.ps-md-3.sc-gw-button{padding-left:1rem !important}/*!@.ps-md-4*/.ps-md-4.sc-gw-button{padding-left:1.5rem !important}/*!@.ps-md-5*/.ps-md-5.sc-gw-button{padding-left:3rem !important}/*!@.text-md-start*/.text-md-start.sc-gw-button{text-align:left !important}/*!@.text-md-end*/.text-md-end.sc-gw-button{text-align:right !important}/*!@.text-md-center*/.text-md-center.sc-gw-button{text-align:center !important}}@media (min-width: 992px){/*!@.float-lg-start*/.float-lg-start.sc-gw-button{float:left !important}/*!@.float-lg-end*/.float-lg-end.sc-gw-button{float:right !important}/*!@.float-lg-none*/.float-lg-none.sc-gw-button{float:none !important}/*!@.d-lg-inline*/.d-lg-inline.sc-gw-button{display:inline !important}/*!@.d-lg-inline-block*/.d-lg-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-lg-block*/.d-lg-block.sc-gw-button{display:block !important}/*!@.d-lg-grid*/.d-lg-grid.sc-gw-button{display:grid !important}/*!@.d-lg-table*/.d-lg-table.sc-gw-button{display:table !important}/*!@.d-lg-table-row*/.d-lg-table-row.sc-gw-button{display:table-row !important}/*!@.d-lg-table-cell*/.d-lg-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-lg-flex*/.d-lg-flex.sc-gw-button{display:flex !important}/*!@.d-lg-inline-flex*/.d-lg-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-lg-none*/.d-lg-none.sc-gw-button{display:none !important}/*!@.flex-lg-fill*/.flex-lg-fill.sc-gw-button{flex:1 1 auto !important}/*!@.flex-lg-row*/.flex-lg-row.sc-gw-button{flex-direction:row !important}/*!@.flex-lg-column*/.flex-lg-column.sc-gw-button{flex-direction:column !important}/*!@.flex-lg-row-reverse*/.flex-lg-row-reverse.sc-gw-button{flex-direction:row-reverse !important}/*!@.flex-lg-column-reverse*/.flex-lg-column-reverse.sc-gw-button{flex-direction:column-reverse !important}/*!@.flex-lg-grow-0*/.flex-lg-grow-0.sc-gw-button{flex-grow:0 !important}/*!@.flex-lg-grow-1*/.flex-lg-grow-1.sc-gw-button{flex-grow:1 !important}/*!@.flex-lg-shrink-0*/.flex-lg-shrink-0.sc-gw-button{flex-shrink:0 !important}/*!@.flex-lg-shrink-1*/.flex-lg-shrink-1.sc-gw-button{flex-shrink:1 !important}/*!@.flex-lg-wrap*/.flex-lg-wrap.sc-gw-button{flex-wrap:wrap !important}/*!@.flex-lg-nowrap*/.flex-lg-nowrap.sc-gw-button{flex-wrap:nowrap !important}/*!@.flex-lg-wrap-reverse*/.flex-lg-wrap-reverse.sc-gw-button{flex-wrap:wrap-reverse !important}/*!@.gap-lg-0*/.gap-lg-0.sc-gw-button{gap:0 !important}/*!@.gap-lg-1*/.gap-lg-1.sc-gw-button{gap:0.25rem !important}/*!@.gap-lg-2*/.gap-lg-2.sc-gw-button{gap:0.5rem !important}/*!@.gap-lg-3*/.gap-lg-3.sc-gw-button{gap:1rem !important}/*!@.gap-lg-4*/.gap-lg-4.sc-gw-button{gap:1.5rem !important}/*!@.gap-lg-5*/.gap-lg-5.sc-gw-button{gap:3rem !important}/*!@.justify-content-lg-start*/.justify-content-lg-start.sc-gw-button{justify-content:flex-start !important}/*!@.justify-content-lg-end*/.justify-content-lg-end.sc-gw-button{justify-content:flex-end !important}/*!@.justify-content-lg-center*/.justify-content-lg-center.sc-gw-button{justify-content:center !important}/*!@.justify-content-lg-between*/.justify-content-lg-between.sc-gw-button{justify-content:space-between !important}/*!@.justify-content-lg-around*/.justify-content-lg-around.sc-gw-button{justify-content:space-around !important}/*!@.justify-content-lg-evenly*/.justify-content-lg-evenly.sc-gw-button{justify-content:space-evenly !important}/*!@.align-items-lg-start*/.align-items-lg-start.sc-gw-button{align-items:flex-start !important}/*!@.align-items-lg-end*/.align-items-lg-end.sc-gw-button{align-items:flex-end !important}/*!@.align-items-lg-center*/.align-items-lg-center.sc-gw-button{align-items:center !important}/*!@.align-items-lg-baseline*/.align-items-lg-baseline.sc-gw-button{align-items:baseline !important}/*!@.align-items-lg-stretch*/.align-items-lg-stretch.sc-gw-button{align-items:stretch !important}/*!@.align-content-lg-start*/.align-content-lg-start.sc-gw-button{align-content:flex-start !important}/*!@.align-content-lg-end*/.align-content-lg-end.sc-gw-button{align-content:flex-end !important}/*!@.align-content-lg-center*/.align-content-lg-center.sc-gw-button{align-content:center !important}/*!@.align-content-lg-between*/.align-content-lg-between.sc-gw-button{align-content:space-between !important}/*!@.align-content-lg-around*/.align-content-lg-around.sc-gw-button{align-content:space-around !important}/*!@.align-content-lg-stretch*/.align-content-lg-stretch.sc-gw-button{align-content:stretch !important}/*!@.align-self-lg-auto*/.align-self-lg-auto.sc-gw-button{align-self:auto !important}/*!@.align-self-lg-start*/.align-self-lg-start.sc-gw-button{align-self:flex-start !important}/*!@.align-self-lg-end*/.align-self-lg-end.sc-gw-button{align-self:flex-end !important}/*!@.align-self-lg-center*/.align-self-lg-center.sc-gw-button{align-self:center !important}/*!@.align-self-lg-baseline*/.align-self-lg-baseline.sc-gw-button{align-self:baseline !important}/*!@.align-self-lg-stretch*/.align-self-lg-stretch.sc-gw-button{align-self:stretch !important}/*!@.order-lg-first*/.order-lg-first.sc-gw-button{order:-1 !important}/*!@.order-lg-0*/.order-lg-0.sc-gw-button{order:0 !important}/*!@.order-lg-1*/.order-lg-1.sc-gw-button{order:1 !important}/*!@.order-lg-2*/.order-lg-2.sc-gw-button{order:2 !important}/*!@.order-lg-3*/.order-lg-3.sc-gw-button{order:3 !important}/*!@.order-lg-4*/.order-lg-4.sc-gw-button{order:4 !important}/*!@.order-lg-5*/.order-lg-5.sc-gw-button{order:5 !important}/*!@.order-lg-last*/.order-lg-last.sc-gw-button{order:6 !important}/*!@.m-lg-0*/.m-lg-0.sc-gw-button{margin:0 !important}/*!@.m-lg-1*/.m-lg-1.sc-gw-button{margin:0.25rem !important}/*!@.m-lg-2*/.m-lg-2.sc-gw-button{margin:0.5rem !important}/*!@.m-lg-3*/.m-lg-3.sc-gw-button{margin:1rem !important}/*!@.m-lg-4*/.m-lg-4.sc-gw-button{margin:1.5rem !important}/*!@.m-lg-5*/.m-lg-5.sc-gw-button{margin:3rem !important}/*!@.m-lg-auto*/.m-lg-auto.sc-gw-button{margin:auto !important}/*!@.mx-lg-0*/.mx-lg-0.sc-gw-button{margin-right:0 !important;margin-left:0 !important}/*!@.mx-lg-1*/.mx-lg-1.sc-gw-button{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-lg-2*/.mx-lg-2.sc-gw-button{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-lg-3*/.mx-lg-3.sc-gw-button{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-lg-4*/.mx-lg-4.sc-gw-button{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-lg-5*/.mx-lg-5.sc-gw-button{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-lg-auto*/.mx-lg-auto.sc-gw-button{margin-right:auto !important;margin-left:auto !important}/*!@.my-lg-0*/.my-lg-0.sc-gw-button{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-lg-1*/.my-lg-1.sc-gw-button{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-lg-2*/.my-lg-2.sc-gw-button{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-lg-3*/.my-lg-3.sc-gw-button{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-lg-4*/.my-lg-4.sc-gw-button{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-lg-5*/.my-lg-5.sc-gw-button{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-lg-auto*/.my-lg-auto.sc-gw-button{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-lg-0*/.mt-lg-0.sc-gw-button{margin-top:0 !important}/*!@.mt-lg-1*/.mt-lg-1.sc-gw-button{margin-top:0.25rem !important}/*!@.mt-lg-2*/.mt-lg-2.sc-gw-button{margin-top:0.5rem !important}/*!@.mt-lg-3*/.mt-lg-3.sc-gw-button{margin-top:1rem !important}/*!@.mt-lg-4*/.mt-lg-4.sc-gw-button{margin-top:1.5rem !important}/*!@.mt-lg-5*/.mt-lg-5.sc-gw-button{margin-top:3rem !important}/*!@.mt-lg-auto*/.mt-lg-auto.sc-gw-button{margin-top:auto !important}/*!@.me-lg-0*/.me-lg-0.sc-gw-button{margin-right:0 !important}/*!@.me-lg-1*/.me-lg-1.sc-gw-button{margin-right:0.25rem !important}/*!@.me-lg-2*/.me-lg-2.sc-gw-button{margin-right:0.5rem !important}/*!@.me-lg-3*/.me-lg-3.sc-gw-button{margin-right:1rem !important}/*!@.me-lg-4*/.me-lg-4.sc-gw-button{margin-right:1.5rem !important}/*!@.me-lg-5*/.me-lg-5.sc-gw-button{margin-right:3rem !important}/*!@.me-lg-auto*/.me-lg-auto.sc-gw-button{margin-right:auto !important}/*!@.mb-lg-0*/.mb-lg-0.sc-gw-button{margin-bottom:0 !important}/*!@.mb-lg-1*/.mb-lg-1.sc-gw-button{margin-bottom:0.25rem !important}/*!@.mb-lg-2*/.mb-lg-2.sc-gw-button{margin-bottom:0.5rem !important}/*!@.mb-lg-3*/.mb-lg-3.sc-gw-button{margin-bottom:1rem !important}/*!@.mb-lg-4*/.mb-lg-4.sc-gw-button{margin-bottom:1.5rem !important}/*!@.mb-lg-5*/.mb-lg-5.sc-gw-button{margin-bottom:3rem !important}/*!@.mb-lg-auto*/.mb-lg-auto.sc-gw-button{margin-bottom:auto !important}/*!@.ms-lg-0*/.ms-lg-0.sc-gw-button{margin-left:0 !important}/*!@.ms-lg-1*/.ms-lg-1.sc-gw-button{margin-left:0.25rem !important}/*!@.ms-lg-2*/.ms-lg-2.sc-gw-button{margin-left:0.5rem !important}/*!@.ms-lg-3*/.ms-lg-3.sc-gw-button{margin-left:1rem !important}/*!@.ms-lg-4*/.ms-lg-4.sc-gw-button{margin-left:1.5rem !important}/*!@.ms-lg-5*/.ms-lg-5.sc-gw-button{margin-left:3rem !important}/*!@.ms-lg-auto*/.ms-lg-auto.sc-gw-button{margin-left:auto !important}/*!@.p-lg-0*/.p-lg-0.sc-gw-button{padding:0 !important}/*!@.p-lg-1*/.p-lg-1.sc-gw-button{padding:0.25rem !important}/*!@.p-lg-2*/.p-lg-2.sc-gw-button{padding:0.5rem !important}/*!@.p-lg-3*/.p-lg-3.sc-gw-button{padding:1rem !important}/*!@.p-lg-4*/.p-lg-4.sc-gw-button{padding:1.5rem !important}/*!@.p-lg-5*/.p-lg-5.sc-gw-button{padding:3rem !important}/*!@.px-lg-0*/.px-lg-0.sc-gw-button{padding-right:0 !important;padding-left:0 !important}/*!@.px-lg-1*/.px-lg-1.sc-gw-button{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-lg-2*/.px-lg-2.sc-gw-button{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-lg-3*/.px-lg-3.sc-gw-button{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-lg-4*/.px-lg-4.sc-gw-button{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-lg-5*/.px-lg-5.sc-gw-button{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-lg-0*/.py-lg-0.sc-gw-button{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-lg-1*/.py-lg-1.sc-gw-button{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-lg-2*/.py-lg-2.sc-gw-button{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-lg-3*/.py-lg-3.sc-gw-button{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-lg-4*/.py-lg-4.sc-gw-button{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-lg-5*/.py-lg-5.sc-gw-button{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-lg-0*/.pt-lg-0.sc-gw-button{padding-top:0 !important}/*!@.pt-lg-1*/.pt-lg-1.sc-gw-button{padding-top:0.25rem !important}/*!@.pt-lg-2*/.pt-lg-2.sc-gw-button{padding-top:0.5rem !important}/*!@.pt-lg-3*/.pt-lg-3.sc-gw-button{padding-top:1rem !important}/*!@.pt-lg-4*/.pt-lg-4.sc-gw-button{padding-top:1.5rem !important}/*!@.pt-lg-5*/.pt-lg-5.sc-gw-button{padding-top:3rem !important}/*!@.pe-lg-0*/.pe-lg-0.sc-gw-button{padding-right:0 !important}/*!@.pe-lg-1*/.pe-lg-1.sc-gw-button{padding-right:0.25rem !important}/*!@.pe-lg-2*/.pe-lg-2.sc-gw-button{padding-right:0.5rem !important}/*!@.pe-lg-3*/.pe-lg-3.sc-gw-button{padding-right:1rem !important}/*!@.pe-lg-4*/.pe-lg-4.sc-gw-button{padding-right:1.5rem !important}/*!@.pe-lg-5*/.pe-lg-5.sc-gw-button{padding-right:3rem !important}/*!@.pb-lg-0*/.pb-lg-0.sc-gw-button{padding-bottom:0 !important}/*!@.pb-lg-1*/.pb-lg-1.sc-gw-button{padding-bottom:0.25rem !important}/*!@.pb-lg-2*/.pb-lg-2.sc-gw-button{padding-bottom:0.5rem !important}/*!@.pb-lg-3*/.pb-lg-3.sc-gw-button{padding-bottom:1rem !important}/*!@.pb-lg-4*/.pb-lg-4.sc-gw-button{padding-bottom:1.5rem !important}/*!@.pb-lg-5*/.pb-lg-5.sc-gw-button{padding-bottom:3rem !important}/*!@.ps-lg-0*/.ps-lg-0.sc-gw-button{padding-left:0 !important}/*!@.ps-lg-1*/.ps-lg-1.sc-gw-button{padding-left:0.25rem !important}/*!@.ps-lg-2*/.ps-lg-2.sc-gw-button{padding-left:0.5rem !important}/*!@.ps-lg-3*/.ps-lg-3.sc-gw-button{padding-left:1rem !important}/*!@.ps-lg-4*/.ps-lg-4.sc-gw-button{padding-left:1.5rem !important}/*!@.ps-lg-5*/.ps-lg-5.sc-gw-button{padding-left:3rem !important}/*!@.text-lg-start*/.text-lg-start.sc-gw-button{text-align:left !important}/*!@.text-lg-end*/.text-lg-end.sc-gw-button{text-align:right !important}/*!@.text-lg-center*/.text-lg-center.sc-gw-button{text-align:center !important}}@media (min-width: 1200px){/*!@.float-xl-start*/.float-xl-start.sc-gw-button{float:left !important}/*!@.float-xl-end*/.float-xl-end.sc-gw-button{float:right !important}/*!@.float-xl-none*/.float-xl-none.sc-gw-button{float:none !important}/*!@.d-xl-inline*/.d-xl-inline.sc-gw-button{display:inline !important}/*!@.d-xl-inline-block*/.d-xl-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-xl-block*/.d-xl-block.sc-gw-button{display:block !important}/*!@.d-xl-grid*/.d-xl-grid.sc-gw-button{display:grid !important}/*!@.d-xl-table*/.d-xl-table.sc-gw-button{display:table !important}/*!@.d-xl-table-row*/.d-xl-table-row.sc-gw-button{display:table-row !important}/*!@.d-xl-table-cell*/.d-xl-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-xl-flex*/.d-xl-flex.sc-gw-button{display:flex !important}/*!@.d-xl-inline-flex*/.d-xl-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-xl-none*/.d-xl-none.sc-gw-button{display:none !important}/*!@.flex-xl-fill*/.flex-xl-fill.sc-gw-button{flex:1 1 auto !important}/*!@.flex-xl-row*/.flex-xl-row.sc-gw-button{flex-direction:row !important}/*!@.flex-xl-column*/.flex-xl-column.sc-gw-button{flex-direction:column !important}/*!@.flex-xl-row-reverse*/.flex-xl-row-reverse.sc-gw-button{flex-direction:row-reverse !important}/*!@.flex-xl-column-reverse*/.flex-xl-column-reverse.sc-gw-button{flex-direction:column-reverse !important}/*!@.flex-xl-grow-0*/.flex-xl-grow-0.sc-gw-button{flex-grow:0 !important}/*!@.flex-xl-grow-1*/.flex-xl-grow-1.sc-gw-button{flex-grow:1 !important}/*!@.flex-xl-shrink-0*/.flex-xl-shrink-0.sc-gw-button{flex-shrink:0 !important}/*!@.flex-xl-shrink-1*/.flex-xl-shrink-1.sc-gw-button{flex-shrink:1 !important}/*!@.flex-xl-wrap*/.flex-xl-wrap.sc-gw-button{flex-wrap:wrap !important}/*!@.flex-xl-nowrap*/.flex-xl-nowrap.sc-gw-button{flex-wrap:nowrap !important}/*!@.flex-xl-wrap-reverse*/.flex-xl-wrap-reverse.sc-gw-button{flex-wrap:wrap-reverse !important}/*!@.gap-xl-0*/.gap-xl-0.sc-gw-button{gap:0 !important}/*!@.gap-xl-1*/.gap-xl-1.sc-gw-button{gap:0.25rem !important}/*!@.gap-xl-2*/.gap-xl-2.sc-gw-button{gap:0.5rem !important}/*!@.gap-xl-3*/.gap-xl-3.sc-gw-button{gap:1rem !important}/*!@.gap-xl-4*/.gap-xl-4.sc-gw-button{gap:1.5rem !important}/*!@.gap-xl-5*/.gap-xl-5.sc-gw-button{gap:3rem !important}/*!@.justify-content-xl-start*/.justify-content-xl-start.sc-gw-button{justify-content:flex-start !important}/*!@.justify-content-xl-end*/.justify-content-xl-end.sc-gw-button{justify-content:flex-end !important}/*!@.justify-content-xl-center*/.justify-content-xl-center.sc-gw-button{justify-content:center !important}/*!@.justify-content-xl-between*/.justify-content-xl-between.sc-gw-button{justify-content:space-between !important}/*!@.justify-content-xl-around*/.justify-content-xl-around.sc-gw-button{justify-content:space-around !important}/*!@.justify-content-xl-evenly*/.justify-content-xl-evenly.sc-gw-button{justify-content:space-evenly !important}/*!@.align-items-xl-start*/.align-items-xl-start.sc-gw-button{align-items:flex-start !important}/*!@.align-items-xl-end*/.align-items-xl-end.sc-gw-button{align-items:flex-end !important}/*!@.align-items-xl-center*/.align-items-xl-center.sc-gw-button{align-items:center !important}/*!@.align-items-xl-baseline*/.align-items-xl-baseline.sc-gw-button{align-items:baseline !important}/*!@.align-items-xl-stretch*/.align-items-xl-stretch.sc-gw-button{align-items:stretch !important}/*!@.align-content-xl-start*/.align-content-xl-start.sc-gw-button{align-content:flex-start !important}/*!@.align-content-xl-end*/.align-content-xl-end.sc-gw-button{align-content:flex-end !important}/*!@.align-content-xl-center*/.align-content-xl-center.sc-gw-button{align-content:center !important}/*!@.align-content-xl-between*/.align-content-xl-between.sc-gw-button{align-content:space-between !important}/*!@.align-content-xl-around*/.align-content-xl-around.sc-gw-button{align-content:space-around !important}/*!@.align-content-xl-stretch*/.align-content-xl-stretch.sc-gw-button{align-content:stretch !important}/*!@.align-self-xl-auto*/.align-self-xl-auto.sc-gw-button{align-self:auto !important}/*!@.align-self-xl-start*/.align-self-xl-start.sc-gw-button{align-self:flex-start !important}/*!@.align-self-xl-end*/.align-self-xl-end.sc-gw-button{align-self:flex-end !important}/*!@.align-self-xl-center*/.align-self-xl-center.sc-gw-button{align-self:center !important}/*!@.align-self-xl-baseline*/.align-self-xl-baseline.sc-gw-button{align-self:baseline !important}/*!@.align-self-xl-stretch*/.align-self-xl-stretch.sc-gw-button{align-self:stretch !important}/*!@.order-xl-first*/.order-xl-first.sc-gw-button{order:-1 !important}/*!@.order-xl-0*/.order-xl-0.sc-gw-button{order:0 !important}/*!@.order-xl-1*/.order-xl-1.sc-gw-button{order:1 !important}/*!@.order-xl-2*/.order-xl-2.sc-gw-button{order:2 !important}/*!@.order-xl-3*/.order-xl-3.sc-gw-button{order:3 !important}/*!@.order-xl-4*/.order-xl-4.sc-gw-button{order:4 !important}/*!@.order-xl-5*/.order-xl-5.sc-gw-button{order:5 !important}/*!@.order-xl-last*/.order-xl-last.sc-gw-button{order:6 !important}/*!@.m-xl-0*/.m-xl-0.sc-gw-button{margin:0 !important}/*!@.m-xl-1*/.m-xl-1.sc-gw-button{margin:0.25rem !important}/*!@.m-xl-2*/.m-xl-2.sc-gw-button{margin:0.5rem !important}/*!@.m-xl-3*/.m-xl-3.sc-gw-button{margin:1rem !important}/*!@.m-xl-4*/.m-xl-4.sc-gw-button{margin:1.5rem !important}/*!@.m-xl-5*/.m-xl-5.sc-gw-button{margin:3rem !important}/*!@.m-xl-auto*/.m-xl-auto.sc-gw-button{margin:auto !important}/*!@.mx-xl-0*/.mx-xl-0.sc-gw-button{margin-right:0 !important;margin-left:0 !important}/*!@.mx-xl-1*/.mx-xl-1.sc-gw-button{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-xl-2*/.mx-xl-2.sc-gw-button{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-xl-3*/.mx-xl-3.sc-gw-button{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-xl-4*/.mx-xl-4.sc-gw-button{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-xl-5*/.mx-xl-5.sc-gw-button{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-xl-auto*/.mx-xl-auto.sc-gw-button{margin-right:auto !important;margin-left:auto !important}/*!@.my-xl-0*/.my-xl-0.sc-gw-button{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-xl-1*/.my-xl-1.sc-gw-button{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-xl-2*/.my-xl-2.sc-gw-button{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-xl-3*/.my-xl-3.sc-gw-button{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-xl-4*/.my-xl-4.sc-gw-button{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-xl-5*/.my-xl-5.sc-gw-button{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-xl-auto*/.my-xl-auto.sc-gw-button{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-xl-0*/.mt-xl-0.sc-gw-button{margin-top:0 !important}/*!@.mt-xl-1*/.mt-xl-1.sc-gw-button{margin-top:0.25rem !important}/*!@.mt-xl-2*/.mt-xl-2.sc-gw-button{margin-top:0.5rem !important}/*!@.mt-xl-3*/.mt-xl-3.sc-gw-button{margin-top:1rem !important}/*!@.mt-xl-4*/.mt-xl-4.sc-gw-button{margin-top:1.5rem !important}/*!@.mt-xl-5*/.mt-xl-5.sc-gw-button{margin-top:3rem !important}/*!@.mt-xl-auto*/.mt-xl-auto.sc-gw-button{margin-top:auto !important}/*!@.me-xl-0*/.me-xl-0.sc-gw-button{margin-right:0 !important}/*!@.me-xl-1*/.me-xl-1.sc-gw-button{margin-right:0.25rem !important}/*!@.me-xl-2*/.me-xl-2.sc-gw-button{margin-right:0.5rem !important}/*!@.me-xl-3*/.me-xl-3.sc-gw-button{margin-right:1rem !important}/*!@.me-xl-4*/.me-xl-4.sc-gw-button{margin-right:1.5rem !important}/*!@.me-xl-5*/.me-xl-5.sc-gw-button{margin-right:3rem !important}/*!@.me-xl-auto*/.me-xl-auto.sc-gw-button{margin-right:auto !important}/*!@.mb-xl-0*/.mb-xl-0.sc-gw-button{margin-bottom:0 !important}/*!@.mb-xl-1*/.mb-xl-1.sc-gw-button{margin-bottom:0.25rem !important}/*!@.mb-xl-2*/.mb-xl-2.sc-gw-button{margin-bottom:0.5rem !important}/*!@.mb-xl-3*/.mb-xl-3.sc-gw-button{margin-bottom:1rem !important}/*!@.mb-xl-4*/.mb-xl-4.sc-gw-button{margin-bottom:1.5rem !important}/*!@.mb-xl-5*/.mb-xl-5.sc-gw-button{margin-bottom:3rem !important}/*!@.mb-xl-auto*/.mb-xl-auto.sc-gw-button{margin-bottom:auto !important}/*!@.ms-xl-0*/.ms-xl-0.sc-gw-button{margin-left:0 !important}/*!@.ms-xl-1*/.ms-xl-1.sc-gw-button{margin-left:0.25rem !important}/*!@.ms-xl-2*/.ms-xl-2.sc-gw-button{margin-left:0.5rem !important}/*!@.ms-xl-3*/.ms-xl-3.sc-gw-button{margin-left:1rem !important}/*!@.ms-xl-4*/.ms-xl-4.sc-gw-button{margin-left:1.5rem !important}/*!@.ms-xl-5*/.ms-xl-5.sc-gw-button{margin-left:3rem !important}/*!@.ms-xl-auto*/.ms-xl-auto.sc-gw-button{margin-left:auto !important}/*!@.p-xl-0*/.p-xl-0.sc-gw-button{padding:0 !important}/*!@.p-xl-1*/.p-xl-1.sc-gw-button{padding:0.25rem !important}/*!@.p-xl-2*/.p-xl-2.sc-gw-button{padding:0.5rem !important}/*!@.p-xl-3*/.p-xl-3.sc-gw-button{padding:1rem !important}/*!@.p-xl-4*/.p-xl-4.sc-gw-button{padding:1.5rem !important}/*!@.p-xl-5*/.p-xl-5.sc-gw-button{padding:3rem !important}/*!@.px-xl-0*/.px-xl-0.sc-gw-button{padding-right:0 !important;padding-left:0 !important}/*!@.px-xl-1*/.px-xl-1.sc-gw-button{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-xl-2*/.px-xl-2.sc-gw-button{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-xl-3*/.px-xl-3.sc-gw-button{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-xl-4*/.px-xl-4.sc-gw-button{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-xl-5*/.px-xl-5.sc-gw-button{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-xl-0*/.py-xl-0.sc-gw-button{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-xl-1*/.py-xl-1.sc-gw-button{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-xl-2*/.py-xl-2.sc-gw-button{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-xl-3*/.py-xl-3.sc-gw-button{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-xl-4*/.py-xl-4.sc-gw-button{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-xl-5*/.py-xl-5.sc-gw-button{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-xl-0*/.pt-xl-0.sc-gw-button{padding-top:0 !important}/*!@.pt-xl-1*/.pt-xl-1.sc-gw-button{padding-top:0.25rem !important}/*!@.pt-xl-2*/.pt-xl-2.sc-gw-button{padding-top:0.5rem !important}/*!@.pt-xl-3*/.pt-xl-3.sc-gw-button{padding-top:1rem !important}/*!@.pt-xl-4*/.pt-xl-4.sc-gw-button{padding-top:1.5rem !important}/*!@.pt-xl-5*/.pt-xl-5.sc-gw-button{padding-top:3rem !important}/*!@.pe-xl-0*/.pe-xl-0.sc-gw-button{padding-right:0 !important}/*!@.pe-xl-1*/.pe-xl-1.sc-gw-button{padding-right:0.25rem !important}/*!@.pe-xl-2*/.pe-xl-2.sc-gw-button{padding-right:0.5rem !important}/*!@.pe-xl-3*/.pe-xl-3.sc-gw-button{padding-right:1rem !important}/*!@.pe-xl-4*/.pe-xl-4.sc-gw-button{padding-right:1.5rem !important}/*!@.pe-xl-5*/.pe-xl-5.sc-gw-button{padding-right:3rem !important}/*!@.pb-xl-0*/.pb-xl-0.sc-gw-button{padding-bottom:0 !important}/*!@.pb-xl-1*/.pb-xl-1.sc-gw-button{padding-bottom:0.25rem !important}/*!@.pb-xl-2*/.pb-xl-2.sc-gw-button{padding-bottom:0.5rem !important}/*!@.pb-xl-3*/.pb-xl-3.sc-gw-button{padding-bottom:1rem !important}/*!@.pb-xl-4*/.pb-xl-4.sc-gw-button{padding-bottom:1.5rem !important}/*!@.pb-xl-5*/.pb-xl-5.sc-gw-button{padding-bottom:3rem !important}/*!@.ps-xl-0*/.ps-xl-0.sc-gw-button{padding-left:0 !important}/*!@.ps-xl-1*/.ps-xl-1.sc-gw-button{padding-left:0.25rem !important}/*!@.ps-xl-2*/.ps-xl-2.sc-gw-button{padding-left:0.5rem !important}/*!@.ps-xl-3*/.ps-xl-3.sc-gw-button{padding-left:1rem !important}/*!@.ps-xl-4*/.ps-xl-4.sc-gw-button{padding-left:1.5rem !important}/*!@.ps-xl-5*/.ps-xl-5.sc-gw-button{padding-left:3rem !important}/*!@.text-xl-start*/.text-xl-start.sc-gw-button{text-align:left !important}/*!@.text-xl-end*/.text-xl-end.sc-gw-button{text-align:right !important}/*!@.text-xl-center*/.text-xl-center.sc-gw-button{text-align:center !important}}@media (min-width: 1400px){/*!@.float-xxl-start*/.float-xxl-start.sc-gw-button{float:left !important}/*!@.float-xxl-end*/.float-xxl-end.sc-gw-button{float:right !important}/*!@.float-xxl-none*/.float-xxl-none.sc-gw-button{float:none !important}/*!@.d-xxl-inline*/.d-xxl-inline.sc-gw-button{display:inline !important}/*!@.d-xxl-inline-block*/.d-xxl-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-xxl-block*/.d-xxl-block.sc-gw-button{display:block !important}/*!@.d-xxl-grid*/.d-xxl-grid.sc-gw-button{display:grid !important}/*!@.d-xxl-table*/.d-xxl-table.sc-gw-button{display:table !important}/*!@.d-xxl-table-row*/.d-xxl-table-row.sc-gw-button{display:table-row !important}/*!@.d-xxl-table-cell*/.d-xxl-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-xxl-flex*/.d-xxl-flex.sc-gw-button{display:flex !important}/*!@.d-xxl-inline-flex*/.d-xxl-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-xxl-none*/.d-xxl-none.sc-gw-button{display:none !important}/*!@.flex-xxl-fill*/.flex-xxl-fill.sc-gw-button{flex:1 1 auto !important}/*!@.flex-xxl-row*/.flex-xxl-row.sc-gw-button{flex-direction:row !important}/*!@.flex-xxl-column*/.flex-xxl-column.sc-gw-button{flex-direction:column !important}/*!@.flex-xxl-row-reverse*/.flex-xxl-row-reverse.sc-gw-button{flex-direction:row-reverse !important}/*!@.flex-xxl-column-reverse*/.flex-xxl-column-reverse.sc-gw-button{flex-direction:column-reverse !important}/*!@.flex-xxl-grow-0*/.flex-xxl-grow-0.sc-gw-button{flex-grow:0 !important}/*!@.flex-xxl-grow-1*/.flex-xxl-grow-1.sc-gw-button{flex-grow:1 !important}/*!@.flex-xxl-shrink-0*/.flex-xxl-shrink-0.sc-gw-button{flex-shrink:0 !important}/*!@.flex-xxl-shrink-1*/.flex-xxl-shrink-1.sc-gw-button{flex-shrink:1 !important}/*!@.flex-xxl-wrap*/.flex-xxl-wrap.sc-gw-button{flex-wrap:wrap !important}/*!@.flex-xxl-nowrap*/.flex-xxl-nowrap.sc-gw-button{flex-wrap:nowrap !important}/*!@.flex-xxl-wrap-reverse*/.flex-xxl-wrap-reverse.sc-gw-button{flex-wrap:wrap-reverse !important}/*!@.gap-xxl-0*/.gap-xxl-0.sc-gw-button{gap:0 !important}/*!@.gap-xxl-1*/.gap-xxl-1.sc-gw-button{gap:0.25rem !important}/*!@.gap-xxl-2*/.gap-xxl-2.sc-gw-button{gap:0.5rem !important}/*!@.gap-xxl-3*/.gap-xxl-3.sc-gw-button{gap:1rem !important}/*!@.gap-xxl-4*/.gap-xxl-4.sc-gw-button{gap:1.5rem !important}/*!@.gap-xxl-5*/.gap-xxl-5.sc-gw-button{gap:3rem !important}/*!@.justify-content-xxl-start*/.justify-content-xxl-start.sc-gw-button{justify-content:flex-start !important}/*!@.justify-content-xxl-end*/.justify-content-xxl-end.sc-gw-button{justify-content:flex-end !important}/*!@.justify-content-xxl-center*/.justify-content-xxl-center.sc-gw-button{justify-content:center !important}/*!@.justify-content-xxl-between*/.justify-content-xxl-between.sc-gw-button{justify-content:space-between !important}/*!@.justify-content-xxl-around*/.justify-content-xxl-around.sc-gw-button{justify-content:space-around !important}/*!@.justify-content-xxl-evenly*/.justify-content-xxl-evenly.sc-gw-button{justify-content:space-evenly !important}/*!@.align-items-xxl-start*/.align-items-xxl-start.sc-gw-button{align-items:flex-start !important}/*!@.align-items-xxl-end*/.align-items-xxl-end.sc-gw-button{align-items:flex-end !important}/*!@.align-items-xxl-center*/.align-items-xxl-center.sc-gw-button{align-items:center !important}/*!@.align-items-xxl-baseline*/.align-items-xxl-baseline.sc-gw-button{align-items:baseline !important}/*!@.align-items-xxl-stretch*/.align-items-xxl-stretch.sc-gw-button{align-items:stretch !important}/*!@.align-content-xxl-start*/.align-content-xxl-start.sc-gw-button{align-content:flex-start !important}/*!@.align-content-xxl-end*/.align-content-xxl-end.sc-gw-button{align-content:flex-end !important}/*!@.align-content-xxl-center*/.align-content-xxl-center.sc-gw-button{align-content:center !important}/*!@.align-content-xxl-between*/.align-content-xxl-between.sc-gw-button{align-content:space-between !important}/*!@.align-content-xxl-around*/.align-content-xxl-around.sc-gw-button{align-content:space-around !important}/*!@.align-content-xxl-stretch*/.align-content-xxl-stretch.sc-gw-button{align-content:stretch !important}/*!@.align-self-xxl-auto*/.align-self-xxl-auto.sc-gw-button{align-self:auto !important}/*!@.align-self-xxl-start*/.align-self-xxl-start.sc-gw-button{align-self:flex-start !important}/*!@.align-self-xxl-end*/.align-self-xxl-end.sc-gw-button{align-self:flex-end !important}/*!@.align-self-xxl-center*/.align-self-xxl-center.sc-gw-button{align-self:center !important}/*!@.align-self-xxl-baseline*/.align-self-xxl-baseline.sc-gw-button{align-self:baseline !important}/*!@.align-self-xxl-stretch*/.align-self-xxl-stretch.sc-gw-button{align-self:stretch !important}/*!@.order-xxl-first*/.order-xxl-first.sc-gw-button{order:-1 !important}/*!@.order-xxl-0*/.order-xxl-0.sc-gw-button{order:0 !important}/*!@.order-xxl-1*/.order-xxl-1.sc-gw-button{order:1 !important}/*!@.order-xxl-2*/.order-xxl-2.sc-gw-button{order:2 !important}/*!@.order-xxl-3*/.order-xxl-3.sc-gw-button{order:3 !important}/*!@.order-xxl-4*/.order-xxl-4.sc-gw-button{order:4 !important}/*!@.order-xxl-5*/.order-xxl-5.sc-gw-button{order:5 !important}/*!@.order-xxl-last*/.order-xxl-last.sc-gw-button{order:6 !important}/*!@.m-xxl-0*/.m-xxl-0.sc-gw-button{margin:0 !important}/*!@.m-xxl-1*/.m-xxl-1.sc-gw-button{margin:0.25rem !important}/*!@.m-xxl-2*/.m-xxl-2.sc-gw-button{margin:0.5rem !important}/*!@.m-xxl-3*/.m-xxl-3.sc-gw-button{margin:1rem !important}/*!@.m-xxl-4*/.m-xxl-4.sc-gw-button{margin:1.5rem !important}/*!@.m-xxl-5*/.m-xxl-5.sc-gw-button{margin:3rem !important}/*!@.m-xxl-auto*/.m-xxl-auto.sc-gw-button{margin:auto !important}/*!@.mx-xxl-0*/.mx-xxl-0.sc-gw-button{margin-right:0 !important;margin-left:0 !important}/*!@.mx-xxl-1*/.mx-xxl-1.sc-gw-button{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-xxl-2*/.mx-xxl-2.sc-gw-button{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-xxl-3*/.mx-xxl-3.sc-gw-button{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-xxl-4*/.mx-xxl-4.sc-gw-button{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-xxl-5*/.mx-xxl-5.sc-gw-button{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-xxl-auto*/.mx-xxl-auto.sc-gw-button{margin-right:auto !important;margin-left:auto !important}/*!@.my-xxl-0*/.my-xxl-0.sc-gw-button{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-xxl-1*/.my-xxl-1.sc-gw-button{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-xxl-2*/.my-xxl-2.sc-gw-button{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-xxl-3*/.my-xxl-3.sc-gw-button{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-xxl-4*/.my-xxl-4.sc-gw-button{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-xxl-5*/.my-xxl-5.sc-gw-button{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-xxl-auto*/.my-xxl-auto.sc-gw-button{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-xxl-0*/.mt-xxl-0.sc-gw-button{margin-top:0 !important}/*!@.mt-xxl-1*/.mt-xxl-1.sc-gw-button{margin-top:0.25rem !important}/*!@.mt-xxl-2*/.mt-xxl-2.sc-gw-button{margin-top:0.5rem !important}/*!@.mt-xxl-3*/.mt-xxl-3.sc-gw-button{margin-top:1rem !important}/*!@.mt-xxl-4*/.mt-xxl-4.sc-gw-button{margin-top:1.5rem !important}/*!@.mt-xxl-5*/.mt-xxl-5.sc-gw-button{margin-top:3rem !important}/*!@.mt-xxl-auto*/.mt-xxl-auto.sc-gw-button{margin-top:auto !important}/*!@.me-xxl-0*/.me-xxl-0.sc-gw-button{margin-right:0 !important}/*!@.me-xxl-1*/.me-xxl-1.sc-gw-button{margin-right:0.25rem !important}/*!@.me-xxl-2*/.me-xxl-2.sc-gw-button{margin-right:0.5rem !important}/*!@.me-xxl-3*/.me-xxl-3.sc-gw-button{margin-right:1rem !important}/*!@.me-xxl-4*/.me-xxl-4.sc-gw-button{margin-right:1.5rem !important}/*!@.me-xxl-5*/.me-xxl-5.sc-gw-button{margin-right:3rem !important}/*!@.me-xxl-auto*/.me-xxl-auto.sc-gw-button{margin-right:auto !important}/*!@.mb-xxl-0*/.mb-xxl-0.sc-gw-button{margin-bottom:0 !important}/*!@.mb-xxl-1*/.mb-xxl-1.sc-gw-button{margin-bottom:0.25rem !important}/*!@.mb-xxl-2*/.mb-xxl-2.sc-gw-button{margin-bottom:0.5rem !important}/*!@.mb-xxl-3*/.mb-xxl-3.sc-gw-button{margin-bottom:1rem !important}/*!@.mb-xxl-4*/.mb-xxl-4.sc-gw-button{margin-bottom:1.5rem !important}/*!@.mb-xxl-5*/.mb-xxl-5.sc-gw-button{margin-bottom:3rem !important}/*!@.mb-xxl-auto*/.mb-xxl-auto.sc-gw-button{margin-bottom:auto !important}/*!@.ms-xxl-0*/.ms-xxl-0.sc-gw-button{margin-left:0 !important}/*!@.ms-xxl-1*/.ms-xxl-1.sc-gw-button{margin-left:0.25rem !important}/*!@.ms-xxl-2*/.ms-xxl-2.sc-gw-button{margin-left:0.5rem !important}/*!@.ms-xxl-3*/.ms-xxl-3.sc-gw-button{margin-left:1rem !important}/*!@.ms-xxl-4*/.ms-xxl-4.sc-gw-button{margin-left:1.5rem !important}/*!@.ms-xxl-5*/.ms-xxl-5.sc-gw-button{margin-left:3rem !important}/*!@.ms-xxl-auto*/.ms-xxl-auto.sc-gw-button{margin-left:auto !important}/*!@.p-xxl-0*/.p-xxl-0.sc-gw-button{padding:0 !important}/*!@.p-xxl-1*/.p-xxl-1.sc-gw-button{padding:0.25rem !important}/*!@.p-xxl-2*/.p-xxl-2.sc-gw-button{padding:0.5rem !important}/*!@.p-xxl-3*/.p-xxl-3.sc-gw-button{padding:1rem !important}/*!@.p-xxl-4*/.p-xxl-4.sc-gw-button{padding:1.5rem !important}/*!@.p-xxl-5*/.p-xxl-5.sc-gw-button{padding:3rem !important}/*!@.px-xxl-0*/.px-xxl-0.sc-gw-button{padding-right:0 !important;padding-left:0 !important}/*!@.px-xxl-1*/.px-xxl-1.sc-gw-button{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-xxl-2*/.px-xxl-2.sc-gw-button{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-xxl-3*/.px-xxl-3.sc-gw-button{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-xxl-4*/.px-xxl-4.sc-gw-button{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-xxl-5*/.px-xxl-5.sc-gw-button{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-xxl-0*/.py-xxl-0.sc-gw-button{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-xxl-1*/.py-xxl-1.sc-gw-button{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-xxl-2*/.py-xxl-2.sc-gw-button{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-xxl-3*/.py-xxl-3.sc-gw-button{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-xxl-4*/.py-xxl-4.sc-gw-button{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-xxl-5*/.py-xxl-5.sc-gw-button{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-xxl-0*/.pt-xxl-0.sc-gw-button{padding-top:0 !important}/*!@.pt-xxl-1*/.pt-xxl-1.sc-gw-button{padding-top:0.25rem !important}/*!@.pt-xxl-2*/.pt-xxl-2.sc-gw-button{padding-top:0.5rem !important}/*!@.pt-xxl-3*/.pt-xxl-3.sc-gw-button{padding-top:1rem !important}/*!@.pt-xxl-4*/.pt-xxl-4.sc-gw-button{padding-top:1.5rem !important}/*!@.pt-xxl-5*/.pt-xxl-5.sc-gw-button{padding-top:3rem !important}/*!@.pe-xxl-0*/.pe-xxl-0.sc-gw-button{padding-right:0 !important}/*!@.pe-xxl-1*/.pe-xxl-1.sc-gw-button{padding-right:0.25rem !important}/*!@.pe-xxl-2*/.pe-xxl-2.sc-gw-button{padding-right:0.5rem !important}/*!@.pe-xxl-3*/.pe-xxl-3.sc-gw-button{padding-right:1rem !important}/*!@.pe-xxl-4*/.pe-xxl-4.sc-gw-button{padding-right:1.5rem !important}/*!@.pe-xxl-5*/.pe-xxl-5.sc-gw-button{padding-right:3rem !important}/*!@.pb-xxl-0*/.pb-xxl-0.sc-gw-button{padding-bottom:0 !important}/*!@.pb-xxl-1*/.pb-xxl-1.sc-gw-button{padding-bottom:0.25rem !important}/*!@.pb-xxl-2*/.pb-xxl-2.sc-gw-button{padding-bottom:0.5rem !important}/*!@.pb-xxl-3*/.pb-xxl-3.sc-gw-button{padding-bottom:1rem !important}/*!@.pb-xxl-4*/.pb-xxl-4.sc-gw-button{padding-bottom:1.5rem !important}/*!@.pb-xxl-5*/.pb-xxl-5.sc-gw-button{padding-bottom:3rem !important}/*!@.ps-xxl-0*/.ps-xxl-0.sc-gw-button{padding-left:0 !important}/*!@.ps-xxl-1*/.ps-xxl-1.sc-gw-button{padding-left:0.25rem !important}/*!@.ps-xxl-2*/.ps-xxl-2.sc-gw-button{padding-left:0.5rem !important}/*!@.ps-xxl-3*/.ps-xxl-3.sc-gw-button{padding-left:1rem !important}/*!@.ps-xxl-4*/.ps-xxl-4.sc-gw-button{padding-left:1.5rem !important}/*!@.ps-xxl-5*/.ps-xxl-5.sc-gw-button{padding-left:3rem !important}/*!@.text-xxl-start*/.text-xxl-start.sc-gw-button{text-align:left !important}/*!@.text-xxl-end*/.text-xxl-end.sc-gw-button{text-align:right !important}/*!@.text-xxl-center*/.text-xxl-center.sc-gw-button{text-align:center !important}}@media (min-width: 1200px){/*!@.fs-1*/.fs-1.sc-gw-button{font-size:2.5rem !important}/*!@.fs-2*/.fs-2.sc-gw-button{font-size:2rem !important}/*!@.fs-3*/.fs-3.sc-gw-button{font-size:1.75rem !important}/*!@.fs-4*/.fs-4.sc-gw-button{font-size:1.5rem !important}}@media print{/*!@.d-print-inline*/.d-print-inline.sc-gw-button{display:inline !important}/*!@.d-print-inline-block*/.d-print-inline-block.sc-gw-button{display:inline-block !important}/*!@.d-print-block*/.d-print-block.sc-gw-button{display:block !important}/*!@.d-print-grid*/.d-print-grid.sc-gw-button{display:grid !important}/*!@.d-print-table*/.d-print-table.sc-gw-button{display:table !important}/*!@.d-print-table-row*/.d-print-table-row.sc-gw-button{display:table-row !important}/*!@.d-print-table-cell*/.d-print-table-cell.sc-gw-button{display:table-cell !important}/*!@.d-print-flex*/.d-print-flex.sc-gw-button{display:flex !important}/*!@.d-print-inline-flex*/.d-print-inline-flex.sc-gw-button{display:inline-flex !important}/*!@.d-print-none*/.d-print-none.sc-gw-button{display:none !important}}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Light.woff\");font-weight:300}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Regular.woff\");font-weight:400}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Medium.woff\");font-weight:500}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Semibold.woff\");font-weight:600}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Bold.woff\");font-weight:700}@font-face{font-family:Rubik;src:url(\"../assets/fonts/rubik/Rubik-Light.woff\");font-weight:300}@font-face{font-family:Rubik;src:url(\"../assets/fonts/rubik/Rubik-Regular.woff\");font-weight:400}@font-face{font-family:Rubik;src:url(\"../assets/fonts/rubik/Rubik-Medium.woff\");font-weight:500}@font-face{font-family:Rubik;src:url(\"../assets/fonts/rubik/Rubik-Bold.woff\");font-weight:700}/*!@p*/p.sc-gw-button{font-family:var(--gw-font-family-body);font-weight:var(--gw-font-wight-regular);font-size:var(--gw-font-size-m);line-height:var(--gw-line-height-spaced);margin:var(--gw-space-s) 0 var(--gw-space-s) 0}/*!@section*/section.sc-gw-button{padding-top:var(--gw-space-m);padding-bottom:var(--gw-space-m)}@media (min-width: 768px){/*!@section*/section.sc-gw-button{padding-top:var(--gw-space-l);padding-bottom:var(--gw-space-l)}}@media (min-width: 992px){/*!@section*/section.sc-gw-button{padding-top:var(--gw-space-xl);padding-bottom:var(--gw-space-xl)}}/*!@*:focus-visible*/*.sc-gw-button:focus-visible{--borderWidth:3px;outline-width:var(--borderWidth);outline-style:solid;outline-color:var(--gw-color-fuchsia-500)}/*!@:host*/.sc-gw-button-h{display:inline-block}/*!@.button*/.button.sc-gw-button{display:inline-block;font-family:var(--gw-font-family-body);font-size:var(--gw-font-size-m);font-weight:var(--gw-font-weight-medium);cursor:pointer;padding:var(--gw-space-s) var(--gw-space-m);border-radius:var(--gw-radius-m);background-color:black;text-decoration:none;margin:var(--gw-space-s) var(--gw-space-s) var(--gw-space-s) 0;transition:var(--gw-transition-super-fast) all}/*!@.button:hover*/.button.sc-gw-button:hover{transform:scale(1.05)}/*!@.button--primary*/.button--primary.sc-gw-button{color:var(--gw-color-white);background-color:var(--gw-color-fuchsia-500)}/*!@.button--primary:hover*/.button--primary.sc-gw-button:hover{color:var(--gw-color-white)}/*!@.button--secondary*/.button--secondary.sc-gw-button{color:var(--gw-color-black);background-color:var(--gw-color-white)}/*!@.button--secondary:hover*/.button--secondary.sc-gw-button:hover{color:var(--gw-color-black)}/*!@.button--tertiary*/.button--tertiary.sc-gw-button{color:inherit;background-color:transparent}/*!@.button--tertiary:hover*/.button--tertiary.sc-gw-button:hover{color:inherit}";

class GwButton {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.label = null;
    this.type = 'primary';
    this.size = 'regular';
    this.url = null;
    this.blank = false;
  }
  render() {
    return (hAsync(Host, null, hAsync("a", { tabindex: "0", class: {
        'button': true,
        'button--primary': this.type === 'primary',
        'button--secondary': this.type === 'secondary',
        'button--tertiary': this.type === 'tertiary',
        'button--small': this.size === 'small',
        'button--regular': this.size === 'regular',
      }, href: this.url, target: this.blank ? '_blank' : '_self' }, this.label)));
  }
  static get style() { return gwButtonCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "gw-button",
    "$members$": {
      "label": [1],
      "type": [1],
      "size": [1],
      "url": [1],
      "blank": [4]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const gwLookAtMeCss = "/*!@*,\n*::before,\n*::after*/*.sc-gw-look-at-me,*.sc-gw-look-at-me::before,*.sc-gw-look-at-me::after{box-sizing:border-box}@media (prefers-reduced-motion: no-preference){/*!@:root*/.sc-gw-look-at-me:root{scroll-behavior:smooth}}/*!@body*/body.sc-gw-look-at-me{margin:0;font-family:system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", \"Liberation Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";font-size:1rem;font-weight:400;line-height:1.5;color:#212529;background-color:#fff;-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:rgba(0, 0, 0, 0)}/*!@hr*/hr.sc-gw-look-at-me{margin:1rem 0;color:inherit;background-color:currentColor;border:0;opacity:0.25}/*!@hr:not([size])*/hr.sc-gw-look-at-me:not([size]){height:1px}/*!@h6,\nh5,\nh4,\nh3,\nh2,\nh1*/h6.sc-gw-look-at-me,h5.sc-gw-look-at-me,h4.sc-gw-look-at-me,h3.sc-gw-look-at-me,h2.sc-gw-look-at-me,h1.sc-gw-look-at-me{margin-top:0;margin-bottom:0.5rem;font-weight:500;line-height:1.2}/*!@h1*/h1.sc-gw-look-at-me{font-size:calc(1.375rem + 1.5vw)}@media (min-width: 1200px){/*!@h1*/h1.sc-gw-look-at-me{font-size:2.5rem}}/*!@h2*/h2.sc-gw-look-at-me{font-size:calc(1.325rem + 0.9vw)}@media (min-width: 1200px){/*!@h2*/h2.sc-gw-look-at-me{font-size:2rem}}/*!@h3*/h3.sc-gw-look-at-me{font-size:calc(1.3rem + 0.6vw)}@media (min-width: 1200px){/*!@h3*/h3.sc-gw-look-at-me{font-size:1.75rem}}/*!@h4*/h4.sc-gw-look-at-me{font-size:calc(1.275rem + 0.3vw)}@media (min-width: 1200px){/*!@h4*/h4.sc-gw-look-at-me{font-size:1.5rem}}/*!@h5*/h5.sc-gw-look-at-me{font-size:1.25rem}/*!@h6*/h6.sc-gw-look-at-me{font-size:1rem}/*!@p*/p.sc-gw-look-at-me{margin-top:0;margin-bottom:1rem}/*!@abbr[title],\nabbr[data-bs-original-title]*/abbr[title].sc-gw-look-at-me,abbr[data-bs-original-title].sc-gw-look-at-me{-webkit-text-decoration:underline dotted;text-decoration:underline dotted;cursor:help;-webkit-text-decoration-skip-ink:none;text-decoration-skip-ink:none}/*!@address*/address.sc-gw-look-at-me{margin-bottom:1rem;font-style:normal;line-height:inherit}/*!@ol,\nul*/ol.sc-gw-look-at-me,ul.sc-gw-look-at-me{padding-left:2rem}/*!@ol,\nul,\ndl*/ol.sc-gw-look-at-me,ul.sc-gw-look-at-me,dl.sc-gw-look-at-me{margin-top:0;margin-bottom:1rem}/*!@ol ol,\nul ul,\nol ul,\nul ol*/ol.sc-gw-look-at-me ol.sc-gw-look-at-me,ul.sc-gw-look-at-me ul.sc-gw-look-at-me,ol.sc-gw-look-at-me ul.sc-gw-look-at-me,ul.sc-gw-look-at-me ol.sc-gw-look-at-me{margin-bottom:0}/*!@dt*/dt.sc-gw-look-at-me{font-weight:700}/*!@dd*/dd.sc-gw-look-at-me{margin-bottom:0.5rem;margin-left:0}/*!@blockquote*/blockquote.sc-gw-look-at-me{margin:0 0 1rem}/*!@b,\nstrong*/b.sc-gw-look-at-me,strong.sc-gw-look-at-me{font-weight:bolder}/*!@small*/small.sc-gw-look-at-me{font-size:0.875em}/*!@mark*/mark.sc-gw-look-at-me{padding:0.2em;background-color:#fcf8e3}/*!@sub,\nsup*/sub.sc-gw-look-at-me,sup.sc-gw-look-at-me{position:relative;font-size:0.75em;line-height:0;vertical-align:baseline}/*!@sub*/sub.sc-gw-look-at-me{bottom:-0.25em}/*!@sup*/sup.sc-gw-look-at-me{top:-0.5em}/*!@a*/a.sc-gw-look-at-me{color:#0d6efd;text-decoration:underline}/*!@a:hover*/a.sc-gw-look-at-me:hover{color:#0a58ca}/*!@a:not([href]):not([class]),\na:not([href]):not([class]):hover*/a.sc-gw-look-at-me:not([href]):not([class]),a.sc-gw-look-at-me:not([href]):not([class]):hover{color:inherit;text-decoration:none}/*!@pre,\ncode,\nkbd,\nsamp*/pre.sc-gw-look-at-me,code.sc-gw-look-at-me,kbd.sc-gw-look-at-me,samp.sc-gw-look-at-me{font-family:SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;font-size:1em;direction:ltr;unicode-bidi:bidi-override}/*!@pre*/pre.sc-gw-look-at-me{display:block;margin-top:0;margin-bottom:1rem;overflow:auto;font-size:0.875em}/*!@pre code*/pre.sc-gw-look-at-me code.sc-gw-look-at-me{font-size:inherit;color:inherit;word-break:normal}/*!@code*/code.sc-gw-look-at-me{font-size:0.875em;color:#d63384;word-wrap:break-word}/*!@a > code*/a.sc-gw-look-at-me>code.sc-gw-look-at-me{color:inherit}/*!@kbd*/kbd.sc-gw-look-at-me{padding:0.2rem 0.4rem;font-size:0.875em;color:#fff;background-color:#212529;border-radius:0.2rem}/*!@kbd kbd*/kbd.sc-gw-look-at-me kbd.sc-gw-look-at-me{padding:0;font-size:1em;font-weight:700}/*!@figure*/figure.sc-gw-look-at-me{margin:0 0 1rem}/*!@img,\nsvg*/img.sc-gw-look-at-me,svg.sc-gw-look-at-me{vertical-align:middle}/*!@table*/table.sc-gw-look-at-me{caption-side:bottom;border-collapse:collapse}/*!@caption*/caption.sc-gw-look-at-me{padding-top:0.5rem;padding-bottom:0.5rem;color:#6c757d;text-align:left}/*!@th*/th.sc-gw-look-at-me{text-align:inherit;text-align:-webkit-match-parent}/*!@thead,\ntbody,\ntfoot,\ntr,\ntd,\nth*/thead.sc-gw-look-at-me,tbody.sc-gw-look-at-me,tfoot.sc-gw-look-at-me,tr.sc-gw-look-at-me,td.sc-gw-look-at-me,th.sc-gw-look-at-me{border-color:inherit;border-style:solid;border-width:0}/*!@label*/label.sc-gw-look-at-me{display:inline-block}/*!@button*/button.sc-gw-look-at-me{border-radius:0}/*!@button:focus:not(:focus-visible)*/button.sc-gw-look-at-me:focus:not(:focus-visible){outline:0}/*!@input,\nbutton,\nselect,\noptgroup,\ntextarea*/input.sc-gw-look-at-me,button.sc-gw-look-at-me,select.sc-gw-look-at-me,optgroup.sc-gw-look-at-me,textarea.sc-gw-look-at-me{margin:0;font-family:inherit;font-size:inherit;line-height:inherit}/*!@button,\nselect*/button.sc-gw-look-at-me,select.sc-gw-look-at-me{text-transform:none}/*!@[role=button]*/[role=button].sc-gw-look-at-me{cursor:pointer}/*!@select*/select.sc-gw-look-at-me{word-wrap:normal}/*!@select:disabled*/select.sc-gw-look-at-me:disabled{opacity:1}/*!@[list]::-webkit-calendar-picker-indicator*/[list].sc-gw-look-at-me::-webkit-calendar-picker-indicator{display:none}/*!@button,\n[type=button],\n[type=reset],\n[type=submit]*/button.sc-gw-look-at-me,[type=button].sc-gw-look-at-me,[type=reset].sc-gw-look-at-me,[type=submit].sc-gw-look-at-me{-webkit-appearance:button}/*!@button:not(:disabled),\n[type=button]:not(:disabled),\n[type=reset]:not(:disabled),\n[type=submit]:not(:disabled)*/button.sc-gw-look-at-me:not(:disabled),[type=button].sc-gw-look-at-me:not(:disabled),[type=reset].sc-gw-look-at-me:not(:disabled),[type=submit].sc-gw-look-at-me:not(:disabled){cursor:pointer}/*!@::-moz-focus-inner*/.sc-gw-look-at-me::-moz-focus-inner{padding:0;border-style:none}/*!@textarea*/textarea.sc-gw-look-at-me{resize:vertical}/*!@fieldset*/fieldset.sc-gw-look-at-me{min-width:0;padding:0;margin:0;border:0}/*!@legend*/legend.sc-gw-look-at-me{float:left;width:100%;padding:0;margin-bottom:0.5rem;font-size:calc(1.275rem + 0.3vw);line-height:inherit}@media (min-width: 1200px){/*!@legend*/legend.sc-gw-look-at-me{font-size:1.5rem}}/*!@legend + **/legend.sc-gw-look-at-me+*.sc-gw-look-at-me{clear:left}/*!@::-webkit-datetime-edit-fields-wrapper,\n::-webkit-datetime-edit-text,\n::-webkit-datetime-edit-minute,\n::-webkit-datetime-edit-hour-field,\n::-webkit-datetime-edit-day-field,\n::-webkit-datetime-edit-month-field,\n::-webkit-datetime-edit-year-field*/.sc-gw-look-at-me::-webkit-datetime-edit-fields-wrapper,.sc-gw-look-at-me::-webkit-datetime-edit-text,.sc-gw-look-at-me::-webkit-datetime-edit-minute,.sc-gw-look-at-me::-webkit-datetime-edit-hour-field,.sc-gw-look-at-me::-webkit-datetime-edit-day-field,.sc-gw-look-at-me::-webkit-datetime-edit-month-field,.sc-gw-look-at-me::-webkit-datetime-edit-year-field{padding:0}/*!@::-webkit-inner-spin-button*/.sc-gw-look-at-me::-webkit-inner-spin-button{height:auto}/*!@[type=search]*/[type=search].sc-gw-look-at-me{outline-offset:-2px;-webkit-appearance:textfield}/*!@::-webkit-search-decoration*/.sc-gw-look-at-me::-webkit-search-decoration{-webkit-appearance:none}/*!@::-webkit-color-swatch-wrapper*/.sc-gw-look-at-me::-webkit-color-swatch-wrapper{padding:0}/*!@::file-selector-button*/.sc-gw-look-at-me::file-selector-button{font:inherit}/*!@::-webkit-file-upload-button*/.sc-gw-look-at-me::-webkit-file-upload-button{font:inherit;-webkit-appearance:button}/*!@output*/output.sc-gw-look-at-me{display:inline-block}/*!@iframe*/iframe.sc-gw-look-at-me{border:0}/*!@summary*/summary.sc-gw-look-at-me{display:list-item;cursor:pointer}/*!@progress*/progress.sc-gw-look-at-me{vertical-align:baseline}/*!@[hidden]*/[hidden].sc-gw-look-at-me{display:none !important}/*!@.container,\n.container-fluid,\n.container-xxl,\n.container-xl,\n.container-lg,\n.container-md,\n.container-sm*/.container.sc-gw-look-at-me,.container-fluid.sc-gw-look-at-me,.container-xxl.sc-gw-look-at-me,.container-xl.sc-gw-look-at-me,.container-lg.sc-gw-look-at-me,.container-md.sc-gw-look-at-me,.container-sm.sc-gw-look-at-me{width:100%;padding-right:var(--bs-gutter-x, 0.75rem);padding-left:var(--bs-gutter-x, 0.75rem);margin-right:auto;margin-left:auto}@media (min-width: 576px){/*!@.container-sm,\n.container*/.container-sm.sc-gw-look-at-me,.container.sc-gw-look-at-me{max-width:540px}}@media (min-width: 768px){/*!@.container-md,\n.container-sm,\n.container*/.container-md.sc-gw-look-at-me,.container-sm.sc-gw-look-at-me,.container.sc-gw-look-at-me{max-width:720px}}@media (min-width: 992px){/*!@.container-lg,\n.container-md,\n.container-sm,\n.container*/.container-lg.sc-gw-look-at-me,.container-md.sc-gw-look-at-me,.container-sm.sc-gw-look-at-me,.container.sc-gw-look-at-me{max-width:960px}}@media (min-width: 1200px){/*!@.container-xl,\n.container-lg,\n.container-md,\n.container-sm,\n.container*/.container-xl.sc-gw-look-at-me,.container-lg.sc-gw-look-at-me,.container-md.sc-gw-look-at-me,.container-sm.sc-gw-look-at-me,.container.sc-gw-look-at-me{max-width:1140px}}@media (min-width: 1400px){/*!@.container-xxl,\n.container-xl,\n.container-lg,\n.container-md,\n.container-sm,\n.container*/.container-xxl.sc-gw-look-at-me,.container-xl.sc-gw-look-at-me,.container-lg.sc-gw-look-at-me,.container-md.sc-gw-look-at-me,.container-sm.sc-gw-look-at-me,.container.sc-gw-look-at-me{max-width:1320px}}/*!@.row*/.row.sc-gw-look-at-me{--bs-gutter-x:1.5rem;--bs-gutter-y:0;display:flex;flex-wrap:wrap;margin-top:calc(var(--bs-gutter-y) * -1);margin-right:calc(var(--bs-gutter-x) * -0.5);margin-left:calc(var(--bs-gutter-x) * -0.5)}/*!@.row > **/.row.sc-gw-look-at-me>*.sc-gw-look-at-me{box-sizing:border-box;flex-shrink:0;width:100%;max-width:100%;padding-right:calc(var(--bs-gutter-x) * 0.5);padding-left:calc(var(--bs-gutter-x) * 0.5);margin-top:var(--bs-gutter-y)}/*!@.col*/.col.sc-gw-look-at-me{flex:1 0 0%}/*!@.row-cols-auto > **/.row-cols-auto.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:auto}/*!@.row-cols-1 > **/.row-cols-1.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:100%}/*!@.row-cols-2 > **/.row-cols-2.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:50%}/*!@.row-cols-3 > **/.row-cols-3.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-4 > **/.row-cols-4.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:25%}/*!@.row-cols-5 > **/.row-cols-5.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:20%}/*!@.row-cols-6 > **/.row-cols-6.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:16.6666666667%}@media (min-width: 576px){/*!@.col-sm*/.col-sm.sc-gw-look-at-me{flex:1 0 0%}/*!@.row-cols-sm-auto > **/.row-cols-sm-auto.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:auto}/*!@.row-cols-sm-1 > **/.row-cols-sm-1.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:100%}/*!@.row-cols-sm-2 > **/.row-cols-sm-2.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:50%}/*!@.row-cols-sm-3 > **/.row-cols-sm-3.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-sm-4 > **/.row-cols-sm-4.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:25%}/*!@.row-cols-sm-5 > **/.row-cols-sm-5.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:20%}/*!@.row-cols-sm-6 > **/.row-cols-sm-6.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:16.6666666667%}}@media (min-width: 768px){/*!@.col-md*/.col-md.sc-gw-look-at-me{flex:1 0 0%}/*!@.row-cols-md-auto > **/.row-cols-md-auto.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:auto}/*!@.row-cols-md-1 > **/.row-cols-md-1.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:100%}/*!@.row-cols-md-2 > **/.row-cols-md-2.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:50%}/*!@.row-cols-md-3 > **/.row-cols-md-3.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-md-4 > **/.row-cols-md-4.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:25%}/*!@.row-cols-md-5 > **/.row-cols-md-5.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:20%}/*!@.row-cols-md-6 > **/.row-cols-md-6.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:16.6666666667%}}@media (min-width: 992px){/*!@.col-lg*/.col-lg.sc-gw-look-at-me{flex:1 0 0%}/*!@.row-cols-lg-auto > **/.row-cols-lg-auto.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:auto}/*!@.row-cols-lg-1 > **/.row-cols-lg-1.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:100%}/*!@.row-cols-lg-2 > **/.row-cols-lg-2.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:50%}/*!@.row-cols-lg-3 > **/.row-cols-lg-3.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-lg-4 > **/.row-cols-lg-4.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:25%}/*!@.row-cols-lg-5 > **/.row-cols-lg-5.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:20%}/*!@.row-cols-lg-6 > **/.row-cols-lg-6.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:16.6666666667%}}@media (min-width: 1200px){/*!@.col-xl*/.col-xl.sc-gw-look-at-me{flex:1 0 0%}/*!@.row-cols-xl-auto > **/.row-cols-xl-auto.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:auto}/*!@.row-cols-xl-1 > **/.row-cols-xl-1.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:100%}/*!@.row-cols-xl-2 > **/.row-cols-xl-2.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:50%}/*!@.row-cols-xl-3 > **/.row-cols-xl-3.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-xl-4 > **/.row-cols-xl-4.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:25%}/*!@.row-cols-xl-5 > **/.row-cols-xl-5.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:20%}/*!@.row-cols-xl-6 > **/.row-cols-xl-6.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:16.6666666667%}}@media (min-width: 1400px){/*!@.col-xxl*/.col-xxl.sc-gw-look-at-me{flex:1 0 0%}/*!@.row-cols-xxl-auto > **/.row-cols-xxl-auto.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:auto}/*!@.row-cols-xxl-1 > **/.row-cols-xxl-1.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:100%}/*!@.row-cols-xxl-2 > **/.row-cols-xxl-2.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:50%}/*!@.row-cols-xxl-3 > **/.row-cols-xxl-3.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-xxl-4 > **/.row-cols-xxl-4.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:25%}/*!@.row-cols-xxl-5 > **/.row-cols-xxl-5.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:20%}/*!@.row-cols-xxl-6 > **/.row-cols-xxl-6.sc-gw-look-at-me>*.sc-gw-look-at-me{flex:0 0 auto;width:16.6666666667%}}/*!@.col-auto*/.col-auto.sc-gw-look-at-me{flex:0 0 auto;width:auto}/*!@.col-1*/.col-1.sc-gw-look-at-me{flex:0 0 auto;width:8.33333333%}/*!@.col-2*/.col-2.sc-gw-look-at-me{flex:0 0 auto;width:16.66666667%}/*!@.col-3*/.col-3.sc-gw-look-at-me{flex:0 0 auto;width:25%}/*!@.col-4*/.col-4.sc-gw-look-at-me{flex:0 0 auto;width:33.33333333%}/*!@.col-5*/.col-5.sc-gw-look-at-me{flex:0 0 auto;width:41.66666667%}/*!@.col-6*/.col-6.sc-gw-look-at-me{flex:0 0 auto;width:50%}/*!@.col-7*/.col-7.sc-gw-look-at-me{flex:0 0 auto;width:58.33333333%}/*!@.col-8*/.col-8.sc-gw-look-at-me{flex:0 0 auto;width:66.66666667%}/*!@.col-9*/.col-9.sc-gw-look-at-me{flex:0 0 auto;width:75%}/*!@.col-10*/.col-10.sc-gw-look-at-me{flex:0 0 auto;width:83.33333333%}/*!@.col-11*/.col-11.sc-gw-look-at-me{flex:0 0 auto;width:91.66666667%}/*!@.col-12*/.col-12.sc-gw-look-at-me{flex:0 0 auto;width:100%}/*!@.offset-1*/.offset-1.sc-gw-look-at-me{margin-left:8.33333333%}/*!@.offset-2*/.offset-2.sc-gw-look-at-me{margin-left:16.66666667%}/*!@.offset-3*/.offset-3.sc-gw-look-at-me{margin-left:25%}/*!@.offset-4*/.offset-4.sc-gw-look-at-me{margin-left:33.33333333%}/*!@.offset-5*/.offset-5.sc-gw-look-at-me{margin-left:41.66666667%}/*!@.offset-6*/.offset-6.sc-gw-look-at-me{margin-left:50%}/*!@.offset-7*/.offset-7.sc-gw-look-at-me{margin-left:58.33333333%}/*!@.offset-8*/.offset-8.sc-gw-look-at-me{margin-left:66.66666667%}/*!@.offset-9*/.offset-9.sc-gw-look-at-me{margin-left:75%}/*!@.offset-10*/.offset-10.sc-gw-look-at-me{margin-left:83.33333333%}/*!@.offset-11*/.offset-11.sc-gw-look-at-me{margin-left:91.66666667%}/*!@.g-0,\n.gx-0*/.g-0.sc-gw-look-at-me,.gx-0.sc-gw-look-at-me{--bs-gutter-x:0}/*!@.g-0,\n.gy-0*/.g-0.sc-gw-look-at-me,.gy-0.sc-gw-look-at-me{--bs-gutter-y:0}/*!@.g-1,\n.gx-1*/.g-1.sc-gw-look-at-me,.gx-1.sc-gw-look-at-me{--bs-gutter-x:0.25rem}/*!@.g-1,\n.gy-1*/.g-1.sc-gw-look-at-me,.gy-1.sc-gw-look-at-me{--bs-gutter-y:0.25rem}/*!@.g-2,\n.gx-2*/.g-2.sc-gw-look-at-me,.gx-2.sc-gw-look-at-me{--bs-gutter-x:0.5rem}/*!@.g-2,\n.gy-2*/.g-2.sc-gw-look-at-me,.gy-2.sc-gw-look-at-me{--bs-gutter-y:0.5rem}/*!@.g-3,\n.gx-3*/.g-3.sc-gw-look-at-me,.gx-3.sc-gw-look-at-me{--bs-gutter-x:1rem}/*!@.g-3,\n.gy-3*/.g-3.sc-gw-look-at-me,.gy-3.sc-gw-look-at-me{--bs-gutter-y:1rem}/*!@.g-4,\n.gx-4*/.g-4.sc-gw-look-at-me,.gx-4.sc-gw-look-at-me{--bs-gutter-x:1.5rem}/*!@.g-4,\n.gy-4*/.g-4.sc-gw-look-at-me,.gy-4.sc-gw-look-at-me{--bs-gutter-y:1.5rem}/*!@.g-5,\n.gx-5*/.g-5.sc-gw-look-at-me,.gx-5.sc-gw-look-at-me{--bs-gutter-x:3rem}/*!@.g-5,\n.gy-5*/.g-5.sc-gw-look-at-me,.gy-5.sc-gw-look-at-me{--bs-gutter-y:3rem}@media (min-width: 576px){/*!@.col-sm-auto*/.col-sm-auto.sc-gw-look-at-me{flex:0 0 auto;width:auto}/*!@.col-sm-1*/.col-sm-1.sc-gw-look-at-me{flex:0 0 auto;width:8.33333333%}/*!@.col-sm-2*/.col-sm-2.sc-gw-look-at-me{flex:0 0 auto;width:16.66666667%}/*!@.col-sm-3*/.col-sm-3.sc-gw-look-at-me{flex:0 0 auto;width:25%}/*!@.col-sm-4*/.col-sm-4.sc-gw-look-at-me{flex:0 0 auto;width:33.33333333%}/*!@.col-sm-5*/.col-sm-5.sc-gw-look-at-me{flex:0 0 auto;width:41.66666667%}/*!@.col-sm-6*/.col-sm-6.sc-gw-look-at-me{flex:0 0 auto;width:50%}/*!@.col-sm-7*/.col-sm-7.sc-gw-look-at-me{flex:0 0 auto;width:58.33333333%}/*!@.col-sm-8*/.col-sm-8.sc-gw-look-at-me{flex:0 0 auto;width:66.66666667%}/*!@.col-sm-9*/.col-sm-9.sc-gw-look-at-me{flex:0 0 auto;width:75%}/*!@.col-sm-10*/.col-sm-10.sc-gw-look-at-me{flex:0 0 auto;width:83.33333333%}/*!@.col-sm-11*/.col-sm-11.sc-gw-look-at-me{flex:0 0 auto;width:91.66666667%}/*!@.col-sm-12*/.col-sm-12.sc-gw-look-at-me{flex:0 0 auto;width:100%}/*!@.offset-sm-0*/.offset-sm-0.sc-gw-look-at-me{margin-left:0}/*!@.offset-sm-1*/.offset-sm-1.sc-gw-look-at-me{margin-left:8.33333333%}/*!@.offset-sm-2*/.offset-sm-2.sc-gw-look-at-me{margin-left:16.66666667%}/*!@.offset-sm-3*/.offset-sm-3.sc-gw-look-at-me{margin-left:25%}/*!@.offset-sm-4*/.offset-sm-4.sc-gw-look-at-me{margin-left:33.33333333%}/*!@.offset-sm-5*/.offset-sm-5.sc-gw-look-at-me{margin-left:41.66666667%}/*!@.offset-sm-6*/.offset-sm-6.sc-gw-look-at-me{margin-left:50%}/*!@.offset-sm-7*/.offset-sm-7.sc-gw-look-at-me{margin-left:58.33333333%}/*!@.offset-sm-8*/.offset-sm-8.sc-gw-look-at-me{margin-left:66.66666667%}/*!@.offset-sm-9*/.offset-sm-9.sc-gw-look-at-me{margin-left:75%}/*!@.offset-sm-10*/.offset-sm-10.sc-gw-look-at-me{margin-left:83.33333333%}/*!@.offset-sm-11*/.offset-sm-11.sc-gw-look-at-me{margin-left:91.66666667%}/*!@.g-sm-0,\n.gx-sm-0*/.g-sm-0.sc-gw-look-at-me,.gx-sm-0.sc-gw-look-at-me{--bs-gutter-x:0}/*!@.g-sm-0,\n.gy-sm-0*/.g-sm-0.sc-gw-look-at-me,.gy-sm-0.sc-gw-look-at-me{--bs-gutter-y:0}/*!@.g-sm-1,\n.gx-sm-1*/.g-sm-1.sc-gw-look-at-me,.gx-sm-1.sc-gw-look-at-me{--bs-gutter-x:0.25rem}/*!@.g-sm-1,\n.gy-sm-1*/.g-sm-1.sc-gw-look-at-me,.gy-sm-1.sc-gw-look-at-me{--bs-gutter-y:0.25rem}/*!@.g-sm-2,\n.gx-sm-2*/.g-sm-2.sc-gw-look-at-me,.gx-sm-2.sc-gw-look-at-me{--bs-gutter-x:0.5rem}/*!@.g-sm-2,\n.gy-sm-2*/.g-sm-2.sc-gw-look-at-me,.gy-sm-2.sc-gw-look-at-me{--bs-gutter-y:0.5rem}/*!@.g-sm-3,\n.gx-sm-3*/.g-sm-3.sc-gw-look-at-me,.gx-sm-3.sc-gw-look-at-me{--bs-gutter-x:1rem}/*!@.g-sm-3,\n.gy-sm-3*/.g-sm-3.sc-gw-look-at-me,.gy-sm-3.sc-gw-look-at-me{--bs-gutter-y:1rem}/*!@.g-sm-4,\n.gx-sm-4*/.g-sm-4.sc-gw-look-at-me,.gx-sm-4.sc-gw-look-at-me{--bs-gutter-x:1.5rem}/*!@.g-sm-4,\n.gy-sm-4*/.g-sm-4.sc-gw-look-at-me,.gy-sm-4.sc-gw-look-at-me{--bs-gutter-y:1.5rem}/*!@.g-sm-5,\n.gx-sm-5*/.g-sm-5.sc-gw-look-at-me,.gx-sm-5.sc-gw-look-at-me{--bs-gutter-x:3rem}/*!@.g-sm-5,\n.gy-sm-5*/.g-sm-5.sc-gw-look-at-me,.gy-sm-5.sc-gw-look-at-me{--bs-gutter-y:3rem}}@media (min-width: 768px){/*!@.col-md-auto*/.col-md-auto.sc-gw-look-at-me{flex:0 0 auto;width:auto}/*!@.col-md-1*/.col-md-1.sc-gw-look-at-me{flex:0 0 auto;width:8.33333333%}/*!@.col-md-2*/.col-md-2.sc-gw-look-at-me{flex:0 0 auto;width:16.66666667%}/*!@.col-md-3*/.col-md-3.sc-gw-look-at-me{flex:0 0 auto;width:25%}/*!@.col-md-4*/.col-md-4.sc-gw-look-at-me{flex:0 0 auto;width:33.33333333%}/*!@.col-md-5*/.col-md-5.sc-gw-look-at-me{flex:0 0 auto;width:41.66666667%}/*!@.col-md-6*/.col-md-6.sc-gw-look-at-me{flex:0 0 auto;width:50%}/*!@.col-md-7*/.col-md-7.sc-gw-look-at-me{flex:0 0 auto;width:58.33333333%}/*!@.col-md-8*/.col-md-8.sc-gw-look-at-me{flex:0 0 auto;width:66.66666667%}/*!@.col-md-9*/.col-md-9.sc-gw-look-at-me{flex:0 0 auto;width:75%}/*!@.col-md-10*/.col-md-10.sc-gw-look-at-me{flex:0 0 auto;width:83.33333333%}/*!@.col-md-11*/.col-md-11.sc-gw-look-at-me{flex:0 0 auto;width:91.66666667%}/*!@.col-md-12*/.col-md-12.sc-gw-look-at-me{flex:0 0 auto;width:100%}/*!@.offset-md-0*/.offset-md-0.sc-gw-look-at-me{margin-left:0}/*!@.offset-md-1*/.offset-md-1.sc-gw-look-at-me{margin-left:8.33333333%}/*!@.offset-md-2*/.offset-md-2.sc-gw-look-at-me{margin-left:16.66666667%}/*!@.offset-md-3*/.offset-md-3.sc-gw-look-at-me{margin-left:25%}/*!@.offset-md-4*/.offset-md-4.sc-gw-look-at-me{margin-left:33.33333333%}/*!@.offset-md-5*/.offset-md-5.sc-gw-look-at-me{margin-left:41.66666667%}/*!@.offset-md-6*/.offset-md-6.sc-gw-look-at-me{margin-left:50%}/*!@.offset-md-7*/.offset-md-7.sc-gw-look-at-me{margin-left:58.33333333%}/*!@.offset-md-8*/.offset-md-8.sc-gw-look-at-me{margin-left:66.66666667%}/*!@.offset-md-9*/.offset-md-9.sc-gw-look-at-me{margin-left:75%}/*!@.offset-md-10*/.offset-md-10.sc-gw-look-at-me{margin-left:83.33333333%}/*!@.offset-md-11*/.offset-md-11.sc-gw-look-at-me{margin-left:91.66666667%}/*!@.g-md-0,\n.gx-md-0*/.g-md-0.sc-gw-look-at-me,.gx-md-0.sc-gw-look-at-me{--bs-gutter-x:0}/*!@.g-md-0,\n.gy-md-0*/.g-md-0.sc-gw-look-at-me,.gy-md-0.sc-gw-look-at-me{--bs-gutter-y:0}/*!@.g-md-1,\n.gx-md-1*/.g-md-1.sc-gw-look-at-me,.gx-md-1.sc-gw-look-at-me{--bs-gutter-x:0.25rem}/*!@.g-md-1,\n.gy-md-1*/.g-md-1.sc-gw-look-at-me,.gy-md-1.sc-gw-look-at-me{--bs-gutter-y:0.25rem}/*!@.g-md-2,\n.gx-md-2*/.g-md-2.sc-gw-look-at-me,.gx-md-2.sc-gw-look-at-me{--bs-gutter-x:0.5rem}/*!@.g-md-2,\n.gy-md-2*/.g-md-2.sc-gw-look-at-me,.gy-md-2.sc-gw-look-at-me{--bs-gutter-y:0.5rem}/*!@.g-md-3,\n.gx-md-3*/.g-md-3.sc-gw-look-at-me,.gx-md-3.sc-gw-look-at-me{--bs-gutter-x:1rem}/*!@.g-md-3,\n.gy-md-3*/.g-md-3.sc-gw-look-at-me,.gy-md-3.sc-gw-look-at-me{--bs-gutter-y:1rem}/*!@.g-md-4,\n.gx-md-4*/.g-md-4.sc-gw-look-at-me,.gx-md-4.sc-gw-look-at-me{--bs-gutter-x:1.5rem}/*!@.g-md-4,\n.gy-md-4*/.g-md-4.sc-gw-look-at-me,.gy-md-4.sc-gw-look-at-me{--bs-gutter-y:1.5rem}/*!@.g-md-5,\n.gx-md-5*/.g-md-5.sc-gw-look-at-me,.gx-md-5.sc-gw-look-at-me{--bs-gutter-x:3rem}/*!@.g-md-5,\n.gy-md-5*/.g-md-5.sc-gw-look-at-me,.gy-md-5.sc-gw-look-at-me{--bs-gutter-y:3rem}}@media (min-width: 992px){/*!@.col-lg-auto*/.col-lg-auto.sc-gw-look-at-me{flex:0 0 auto;width:auto}/*!@.col-lg-1*/.col-lg-1.sc-gw-look-at-me{flex:0 0 auto;width:8.33333333%}/*!@.col-lg-2*/.col-lg-2.sc-gw-look-at-me{flex:0 0 auto;width:16.66666667%}/*!@.col-lg-3*/.col-lg-3.sc-gw-look-at-me{flex:0 0 auto;width:25%}/*!@.col-lg-4*/.col-lg-4.sc-gw-look-at-me{flex:0 0 auto;width:33.33333333%}/*!@.col-lg-5*/.col-lg-5.sc-gw-look-at-me{flex:0 0 auto;width:41.66666667%}/*!@.col-lg-6*/.col-lg-6.sc-gw-look-at-me{flex:0 0 auto;width:50%}/*!@.col-lg-7*/.col-lg-7.sc-gw-look-at-me{flex:0 0 auto;width:58.33333333%}/*!@.col-lg-8*/.col-lg-8.sc-gw-look-at-me{flex:0 0 auto;width:66.66666667%}/*!@.col-lg-9*/.col-lg-9.sc-gw-look-at-me{flex:0 0 auto;width:75%}/*!@.col-lg-10*/.col-lg-10.sc-gw-look-at-me{flex:0 0 auto;width:83.33333333%}/*!@.col-lg-11*/.col-lg-11.sc-gw-look-at-me{flex:0 0 auto;width:91.66666667%}/*!@.col-lg-12*/.col-lg-12.sc-gw-look-at-me{flex:0 0 auto;width:100%}/*!@.offset-lg-0*/.offset-lg-0.sc-gw-look-at-me{margin-left:0}/*!@.offset-lg-1*/.offset-lg-1.sc-gw-look-at-me{margin-left:8.33333333%}/*!@.offset-lg-2*/.offset-lg-2.sc-gw-look-at-me{margin-left:16.66666667%}/*!@.offset-lg-3*/.offset-lg-3.sc-gw-look-at-me{margin-left:25%}/*!@.offset-lg-4*/.offset-lg-4.sc-gw-look-at-me{margin-left:33.33333333%}/*!@.offset-lg-5*/.offset-lg-5.sc-gw-look-at-me{margin-left:41.66666667%}/*!@.offset-lg-6*/.offset-lg-6.sc-gw-look-at-me{margin-left:50%}/*!@.offset-lg-7*/.offset-lg-7.sc-gw-look-at-me{margin-left:58.33333333%}/*!@.offset-lg-8*/.offset-lg-8.sc-gw-look-at-me{margin-left:66.66666667%}/*!@.offset-lg-9*/.offset-lg-9.sc-gw-look-at-me{margin-left:75%}/*!@.offset-lg-10*/.offset-lg-10.sc-gw-look-at-me{margin-left:83.33333333%}/*!@.offset-lg-11*/.offset-lg-11.sc-gw-look-at-me{margin-left:91.66666667%}/*!@.g-lg-0,\n.gx-lg-0*/.g-lg-0.sc-gw-look-at-me,.gx-lg-0.sc-gw-look-at-me{--bs-gutter-x:0}/*!@.g-lg-0,\n.gy-lg-0*/.g-lg-0.sc-gw-look-at-me,.gy-lg-0.sc-gw-look-at-me{--bs-gutter-y:0}/*!@.g-lg-1,\n.gx-lg-1*/.g-lg-1.sc-gw-look-at-me,.gx-lg-1.sc-gw-look-at-me{--bs-gutter-x:0.25rem}/*!@.g-lg-1,\n.gy-lg-1*/.g-lg-1.sc-gw-look-at-me,.gy-lg-1.sc-gw-look-at-me{--bs-gutter-y:0.25rem}/*!@.g-lg-2,\n.gx-lg-2*/.g-lg-2.sc-gw-look-at-me,.gx-lg-2.sc-gw-look-at-me{--bs-gutter-x:0.5rem}/*!@.g-lg-2,\n.gy-lg-2*/.g-lg-2.sc-gw-look-at-me,.gy-lg-2.sc-gw-look-at-me{--bs-gutter-y:0.5rem}/*!@.g-lg-3,\n.gx-lg-3*/.g-lg-3.sc-gw-look-at-me,.gx-lg-3.sc-gw-look-at-me{--bs-gutter-x:1rem}/*!@.g-lg-3,\n.gy-lg-3*/.g-lg-3.sc-gw-look-at-me,.gy-lg-3.sc-gw-look-at-me{--bs-gutter-y:1rem}/*!@.g-lg-4,\n.gx-lg-4*/.g-lg-4.sc-gw-look-at-me,.gx-lg-4.sc-gw-look-at-me{--bs-gutter-x:1.5rem}/*!@.g-lg-4,\n.gy-lg-4*/.g-lg-4.sc-gw-look-at-me,.gy-lg-4.sc-gw-look-at-me{--bs-gutter-y:1.5rem}/*!@.g-lg-5,\n.gx-lg-5*/.g-lg-5.sc-gw-look-at-me,.gx-lg-5.sc-gw-look-at-me{--bs-gutter-x:3rem}/*!@.g-lg-5,\n.gy-lg-5*/.g-lg-5.sc-gw-look-at-me,.gy-lg-5.sc-gw-look-at-me{--bs-gutter-y:3rem}}@media (min-width: 1200px){/*!@.col-xl-auto*/.col-xl-auto.sc-gw-look-at-me{flex:0 0 auto;width:auto}/*!@.col-xl-1*/.col-xl-1.sc-gw-look-at-me{flex:0 0 auto;width:8.33333333%}/*!@.col-xl-2*/.col-xl-2.sc-gw-look-at-me{flex:0 0 auto;width:16.66666667%}/*!@.col-xl-3*/.col-xl-3.sc-gw-look-at-me{flex:0 0 auto;width:25%}/*!@.col-xl-4*/.col-xl-4.sc-gw-look-at-me{flex:0 0 auto;width:33.33333333%}/*!@.col-xl-5*/.col-xl-5.sc-gw-look-at-me{flex:0 0 auto;width:41.66666667%}/*!@.col-xl-6*/.col-xl-6.sc-gw-look-at-me{flex:0 0 auto;width:50%}/*!@.col-xl-7*/.col-xl-7.sc-gw-look-at-me{flex:0 0 auto;width:58.33333333%}/*!@.col-xl-8*/.col-xl-8.sc-gw-look-at-me{flex:0 0 auto;width:66.66666667%}/*!@.col-xl-9*/.col-xl-9.sc-gw-look-at-me{flex:0 0 auto;width:75%}/*!@.col-xl-10*/.col-xl-10.sc-gw-look-at-me{flex:0 0 auto;width:83.33333333%}/*!@.col-xl-11*/.col-xl-11.sc-gw-look-at-me{flex:0 0 auto;width:91.66666667%}/*!@.col-xl-12*/.col-xl-12.sc-gw-look-at-me{flex:0 0 auto;width:100%}/*!@.offset-xl-0*/.offset-xl-0.sc-gw-look-at-me{margin-left:0}/*!@.offset-xl-1*/.offset-xl-1.sc-gw-look-at-me{margin-left:8.33333333%}/*!@.offset-xl-2*/.offset-xl-2.sc-gw-look-at-me{margin-left:16.66666667%}/*!@.offset-xl-3*/.offset-xl-3.sc-gw-look-at-me{margin-left:25%}/*!@.offset-xl-4*/.offset-xl-4.sc-gw-look-at-me{margin-left:33.33333333%}/*!@.offset-xl-5*/.offset-xl-5.sc-gw-look-at-me{margin-left:41.66666667%}/*!@.offset-xl-6*/.offset-xl-6.sc-gw-look-at-me{margin-left:50%}/*!@.offset-xl-7*/.offset-xl-7.sc-gw-look-at-me{margin-left:58.33333333%}/*!@.offset-xl-8*/.offset-xl-8.sc-gw-look-at-me{margin-left:66.66666667%}/*!@.offset-xl-9*/.offset-xl-9.sc-gw-look-at-me{margin-left:75%}/*!@.offset-xl-10*/.offset-xl-10.sc-gw-look-at-me{margin-left:83.33333333%}/*!@.offset-xl-11*/.offset-xl-11.sc-gw-look-at-me{margin-left:91.66666667%}/*!@.g-xl-0,\n.gx-xl-0*/.g-xl-0.sc-gw-look-at-me,.gx-xl-0.sc-gw-look-at-me{--bs-gutter-x:0}/*!@.g-xl-0,\n.gy-xl-0*/.g-xl-0.sc-gw-look-at-me,.gy-xl-0.sc-gw-look-at-me{--bs-gutter-y:0}/*!@.g-xl-1,\n.gx-xl-1*/.g-xl-1.sc-gw-look-at-me,.gx-xl-1.sc-gw-look-at-me{--bs-gutter-x:0.25rem}/*!@.g-xl-1,\n.gy-xl-1*/.g-xl-1.sc-gw-look-at-me,.gy-xl-1.sc-gw-look-at-me{--bs-gutter-y:0.25rem}/*!@.g-xl-2,\n.gx-xl-2*/.g-xl-2.sc-gw-look-at-me,.gx-xl-2.sc-gw-look-at-me{--bs-gutter-x:0.5rem}/*!@.g-xl-2,\n.gy-xl-2*/.g-xl-2.sc-gw-look-at-me,.gy-xl-2.sc-gw-look-at-me{--bs-gutter-y:0.5rem}/*!@.g-xl-3,\n.gx-xl-3*/.g-xl-3.sc-gw-look-at-me,.gx-xl-3.sc-gw-look-at-me{--bs-gutter-x:1rem}/*!@.g-xl-3,\n.gy-xl-3*/.g-xl-3.sc-gw-look-at-me,.gy-xl-3.sc-gw-look-at-me{--bs-gutter-y:1rem}/*!@.g-xl-4,\n.gx-xl-4*/.g-xl-4.sc-gw-look-at-me,.gx-xl-4.sc-gw-look-at-me{--bs-gutter-x:1.5rem}/*!@.g-xl-4,\n.gy-xl-4*/.g-xl-4.sc-gw-look-at-me,.gy-xl-4.sc-gw-look-at-me{--bs-gutter-y:1.5rem}/*!@.g-xl-5,\n.gx-xl-5*/.g-xl-5.sc-gw-look-at-me,.gx-xl-5.sc-gw-look-at-me{--bs-gutter-x:3rem}/*!@.g-xl-5,\n.gy-xl-5*/.g-xl-5.sc-gw-look-at-me,.gy-xl-5.sc-gw-look-at-me{--bs-gutter-y:3rem}}@media (min-width: 1400px){/*!@.col-xxl-auto*/.col-xxl-auto.sc-gw-look-at-me{flex:0 0 auto;width:auto}/*!@.col-xxl-1*/.col-xxl-1.sc-gw-look-at-me{flex:0 0 auto;width:8.33333333%}/*!@.col-xxl-2*/.col-xxl-2.sc-gw-look-at-me{flex:0 0 auto;width:16.66666667%}/*!@.col-xxl-3*/.col-xxl-3.sc-gw-look-at-me{flex:0 0 auto;width:25%}/*!@.col-xxl-4*/.col-xxl-4.sc-gw-look-at-me{flex:0 0 auto;width:33.33333333%}/*!@.col-xxl-5*/.col-xxl-5.sc-gw-look-at-me{flex:0 0 auto;width:41.66666667%}/*!@.col-xxl-6*/.col-xxl-6.sc-gw-look-at-me{flex:0 0 auto;width:50%}/*!@.col-xxl-7*/.col-xxl-7.sc-gw-look-at-me{flex:0 0 auto;width:58.33333333%}/*!@.col-xxl-8*/.col-xxl-8.sc-gw-look-at-me{flex:0 0 auto;width:66.66666667%}/*!@.col-xxl-9*/.col-xxl-9.sc-gw-look-at-me{flex:0 0 auto;width:75%}/*!@.col-xxl-10*/.col-xxl-10.sc-gw-look-at-me{flex:0 0 auto;width:83.33333333%}/*!@.col-xxl-11*/.col-xxl-11.sc-gw-look-at-me{flex:0 0 auto;width:91.66666667%}/*!@.col-xxl-12*/.col-xxl-12.sc-gw-look-at-me{flex:0 0 auto;width:100%}/*!@.offset-xxl-0*/.offset-xxl-0.sc-gw-look-at-me{margin-left:0}/*!@.offset-xxl-1*/.offset-xxl-1.sc-gw-look-at-me{margin-left:8.33333333%}/*!@.offset-xxl-2*/.offset-xxl-2.sc-gw-look-at-me{margin-left:16.66666667%}/*!@.offset-xxl-3*/.offset-xxl-3.sc-gw-look-at-me{margin-left:25%}/*!@.offset-xxl-4*/.offset-xxl-4.sc-gw-look-at-me{margin-left:33.33333333%}/*!@.offset-xxl-5*/.offset-xxl-5.sc-gw-look-at-me{margin-left:41.66666667%}/*!@.offset-xxl-6*/.offset-xxl-6.sc-gw-look-at-me{margin-left:50%}/*!@.offset-xxl-7*/.offset-xxl-7.sc-gw-look-at-me{margin-left:58.33333333%}/*!@.offset-xxl-8*/.offset-xxl-8.sc-gw-look-at-me{margin-left:66.66666667%}/*!@.offset-xxl-9*/.offset-xxl-9.sc-gw-look-at-me{margin-left:75%}/*!@.offset-xxl-10*/.offset-xxl-10.sc-gw-look-at-me{margin-left:83.33333333%}/*!@.offset-xxl-11*/.offset-xxl-11.sc-gw-look-at-me{margin-left:91.66666667%}/*!@.g-xxl-0,\n.gx-xxl-0*/.g-xxl-0.sc-gw-look-at-me,.gx-xxl-0.sc-gw-look-at-me{--bs-gutter-x:0}/*!@.g-xxl-0,\n.gy-xxl-0*/.g-xxl-0.sc-gw-look-at-me,.gy-xxl-0.sc-gw-look-at-me{--bs-gutter-y:0}/*!@.g-xxl-1,\n.gx-xxl-1*/.g-xxl-1.sc-gw-look-at-me,.gx-xxl-1.sc-gw-look-at-me{--bs-gutter-x:0.25rem}/*!@.g-xxl-1,\n.gy-xxl-1*/.g-xxl-1.sc-gw-look-at-me,.gy-xxl-1.sc-gw-look-at-me{--bs-gutter-y:0.25rem}/*!@.g-xxl-2,\n.gx-xxl-2*/.g-xxl-2.sc-gw-look-at-me,.gx-xxl-2.sc-gw-look-at-me{--bs-gutter-x:0.5rem}/*!@.g-xxl-2,\n.gy-xxl-2*/.g-xxl-2.sc-gw-look-at-me,.gy-xxl-2.sc-gw-look-at-me{--bs-gutter-y:0.5rem}/*!@.g-xxl-3,\n.gx-xxl-3*/.g-xxl-3.sc-gw-look-at-me,.gx-xxl-3.sc-gw-look-at-me{--bs-gutter-x:1rem}/*!@.g-xxl-3,\n.gy-xxl-3*/.g-xxl-3.sc-gw-look-at-me,.gy-xxl-3.sc-gw-look-at-me{--bs-gutter-y:1rem}/*!@.g-xxl-4,\n.gx-xxl-4*/.g-xxl-4.sc-gw-look-at-me,.gx-xxl-4.sc-gw-look-at-me{--bs-gutter-x:1.5rem}/*!@.g-xxl-4,\n.gy-xxl-4*/.g-xxl-4.sc-gw-look-at-me,.gy-xxl-4.sc-gw-look-at-me{--bs-gutter-y:1.5rem}/*!@.g-xxl-5,\n.gx-xxl-5*/.g-xxl-5.sc-gw-look-at-me,.gx-xxl-5.sc-gw-look-at-me{--bs-gutter-x:3rem}/*!@.g-xxl-5,\n.gy-xxl-5*/.g-xxl-5.sc-gw-look-at-me,.gy-xxl-5.sc-gw-look-at-me{--bs-gutter-y:3rem}}/*!@.d-inline*/.d-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-inline-block*/.d-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-block*/.d-block.sc-gw-look-at-me{display:block !important}/*!@.d-grid*/.d-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-table*/.d-table.sc-gw-look-at-me{display:table !important}/*!@.d-table-row*/.d-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-table-cell*/.d-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-flex*/.d-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-inline-flex*/.d-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-none*/.d-none.sc-gw-look-at-me{display:none !important}/*!@.flex-fill*/.flex-fill.sc-gw-look-at-me{flex:1 1 auto !important}/*!@.flex-row*/.flex-row.sc-gw-look-at-me{flex-direction:row !important}/*!@.flex-column*/.flex-column.sc-gw-look-at-me{flex-direction:column !important}/*!@.flex-row-reverse*/.flex-row-reverse.sc-gw-look-at-me{flex-direction:row-reverse !important}/*!@.flex-column-reverse*/.flex-column-reverse.sc-gw-look-at-me{flex-direction:column-reverse !important}/*!@.flex-grow-0*/.flex-grow-0.sc-gw-look-at-me{flex-grow:0 !important}/*!@.flex-grow-1*/.flex-grow-1.sc-gw-look-at-me{flex-grow:1 !important}/*!@.flex-shrink-0*/.flex-shrink-0.sc-gw-look-at-me{flex-shrink:0 !important}/*!@.flex-shrink-1*/.flex-shrink-1.sc-gw-look-at-me{flex-shrink:1 !important}/*!@.flex-wrap*/.flex-wrap.sc-gw-look-at-me{flex-wrap:wrap !important}/*!@.flex-nowrap*/.flex-nowrap.sc-gw-look-at-me{flex-wrap:nowrap !important}/*!@.flex-wrap-reverse*/.flex-wrap-reverse.sc-gw-look-at-me{flex-wrap:wrap-reverse !important}/*!@.justify-content-start*/.justify-content-start.sc-gw-look-at-me{justify-content:flex-start !important}/*!@.justify-content-end*/.justify-content-end.sc-gw-look-at-me{justify-content:flex-end !important}/*!@.justify-content-center*/.justify-content-center.sc-gw-look-at-me{justify-content:center !important}/*!@.justify-content-between*/.justify-content-between.sc-gw-look-at-me{justify-content:space-between !important}/*!@.justify-content-around*/.justify-content-around.sc-gw-look-at-me{justify-content:space-around !important}/*!@.justify-content-evenly*/.justify-content-evenly.sc-gw-look-at-me{justify-content:space-evenly !important}/*!@.align-items-start*/.align-items-start.sc-gw-look-at-me{align-items:flex-start !important}/*!@.align-items-end*/.align-items-end.sc-gw-look-at-me{align-items:flex-end !important}/*!@.align-items-center*/.align-items-center.sc-gw-look-at-me{align-items:center !important}/*!@.align-items-baseline*/.align-items-baseline.sc-gw-look-at-me{align-items:baseline !important}/*!@.align-items-stretch*/.align-items-stretch.sc-gw-look-at-me{align-items:stretch !important}/*!@.align-content-start*/.align-content-start.sc-gw-look-at-me{align-content:flex-start !important}/*!@.align-content-end*/.align-content-end.sc-gw-look-at-me{align-content:flex-end !important}/*!@.align-content-center*/.align-content-center.sc-gw-look-at-me{align-content:center !important}/*!@.align-content-between*/.align-content-between.sc-gw-look-at-me{align-content:space-between !important}/*!@.align-content-around*/.align-content-around.sc-gw-look-at-me{align-content:space-around !important}/*!@.align-content-stretch*/.align-content-stretch.sc-gw-look-at-me{align-content:stretch !important}/*!@.align-self-auto*/.align-self-auto.sc-gw-look-at-me{align-self:auto !important}/*!@.align-self-start*/.align-self-start.sc-gw-look-at-me{align-self:flex-start !important}/*!@.align-self-end*/.align-self-end.sc-gw-look-at-me{align-self:flex-end !important}/*!@.align-self-center*/.align-self-center.sc-gw-look-at-me{align-self:center !important}/*!@.align-self-baseline*/.align-self-baseline.sc-gw-look-at-me{align-self:baseline !important}/*!@.align-self-stretch*/.align-self-stretch.sc-gw-look-at-me{align-self:stretch !important}/*!@.order-first*/.order-first.sc-gw-look-at-me{order:-1 !important}/*!@.order-0*/.order-0.sc-gw-look-at-me{order:0 !important}/*!@.order-1*/.order-1.sc-gw-look-at-me{order:1 !important}/*!@.order-2*/.order-2.sc-gw-look-at-me{order:2 !important}/*!@.order-3*/.order-3.sc-gw-look-at-me{order:3 !important}/*!@.order-4*/.order-4.sc-gw-look-at-me{order:4 !important}/*!@.order-5*/.order-5.sc-gw-look-at-me{order:5 !important}/*!@.order-last*/.order-last.sc-gw-look-at-me{order:6 !important}/*!@.m-0*/.m-0.sc-gw-look-at-me{margin:0 !important}/*!@.m-1*/.m-1.sc-gw-look-at-me{margin:0.25rem !important}/*!@.m-2*/.m-2.sc-gw-look-at-me{margin:0.5rem !important}/*!@.m-3*/.m-3.sc-gw-look-at-me{margin:1rem !important}/*!@.m-4*/.m-4.sc-gw-look-at-me{margin:1.5rem !important}/*!@.m-5*/.m-5.sc-gw-look-at-me{margin:3rem !important}/*!@.m-auto*/.m-auto.sc-gw-look-at-me{margin:auto !important}/*!@.mx-0*/.mx-0.sc-gw-look-at-me{margin-right:0 !important;margin-left:0 !important}/*!@.mx-1*/.mx-1.sc-gw-look-at-me{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-2*/.mx-2.sc-gw-look-at-me{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-3*/.mx-3.sc-gw-look-at-me{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-4*/.mx-4.sc-gw-look-at-me{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-5*/.mx-5.sc-gw-look-at-me{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-auto*/.mx-auto.sc-gw-look-at-me{margin-right:auto !important;margin-left:auto !important}/*!@.my-0*/.my-0.sc-gw-look-at-me{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-1*/.my-1.sc-gw-look-at-me{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-2*/.my-2.sc-gw-look-at-me{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-3*/.my-3.sc-gw-look-at-me{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-4*/.my-4.sc-gw-look-at-me{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-5*/.my-5.sc-gw-look-at-me{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-auto*/.my-auto.sc-gw-look-at-me{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-0*/.mt-0.sc-gw-look-at-me{margin-top:0 !important}/*!@.mt-1*/.mt-1.sc-gw-look-at-me{margin-top:0.25rem !important}/*!@.mt-2*/.mt-2.sc-gw-look-at-me{margin-top:0.5rem !important}/*!@.mt-3*/.mt-3.sc-gw-look-at-me{margin-top:1rem !important}/*!@.mt-4*/.mt-4.sc-gw-look-at-me{margin-top:1.5rem !important}/*!@.mt-5*/.mt-5.sc-gw-look-at-me{margin-top:3rem !important}/*!@.mt-auto*/.mt-auto.sc-gw-look-at-me{margin-top:auto !important}/*!@.me-0*/.me-0.sc-gw-look-at-me{margin-right:0 !important}/*!@.me-1*/.me-1.sc-gw-look-at-me{margin-right:0.25rem !important}/*!@.me-2*/.me-2.sc-gw-look-at-me{margin-right:0.5rem !important}/*!@.me-3*/.me-3.sc-gw-look-at-me{margin-right:1rem !important}/*!@.me-4*/.me-4.sc-gw-look-at-me{margin-right:1.5rem !important}/*!@.me-5*/.me-5.sc-gw-look-at-me{margin-right:3rem !important}/*!@.me-auto*/.me-auto.sc-gw-look-at-me{margin-right:auto !important}/*!@.mb-0*/.mb-0.sc-gw-look-at-me{margin-bottom:0 !important}/*!@.mb-1*/.mb-1.sc-gw-look-at-me{margin-bottom:0.25rem !important}/*!@.mb-2*/.mb-2.sc-gw-look-at-me{margin-bottom:0.5rem !important}/*!@.mb-3*/.mb-3.sc-gw-look-at-me{margin-bottom:1rem !important}/*!@.mb-4*/.mb-4.sc-gw-look-at-me{margin-bottom:1.5rem !important}/*!@.mb-5*/.mb-5.sc-gw-look-at-me{margin-bottom:3rem !important}/*!@.mb-auto*/.mb-auto.sc-gw-look-at-me{margin-bottom:auto !important}/*!@.ms-0*/.ms-0.sc-gw-look-at-me{margin-left:0 !important}/*!@.ms-1*/.ms-1.sc-gw-look-at-me{margin-left:0.25rem !important}/*!@.ms-2*/.ms-2.sc-gw-look-at-me{margin-left:0.5rem !important}/*!@.ms-3*/.ms-3.sc-gw-look-at-me{margin-left:1rem !important}/*!@.ms-4*/.ms-4.sc-gw-look-at-me{margin-left:1.5rem !important}/*!@.ms-5*/.ms-5.sc-gw-look-at-me{margin-left:3rem !important}/*!@.ms-auto*/.ms-auto.sc-gw-look-at-me{margin-left:auto !important}/*!@.p-0*/.p-0.sc-gw-look-at-me{padding:0 !important}/*!@.p-1*/.p-1.sc-gw-look-at-me{padding:0.25rem !important}/*!@.p-2*/.p-2.sc-gw-look-at-me{padding:0.5rem !important}/*!@.p-3*/.p-3.sc-gw-look-at-me{padding:1rem !important}/*!@.p-4*/.p-4.sc-gw-look-at-me{padding:1.5rem !important}/*!@.p-5*/.p-5.sc-gw-look-at-me{padding:3rem !important}/*!@.px-0*/.px-0.sc-gw-look-at-me{padding-right:0 !important;padding-left:0 !important}/*!@.px-1*/.px-1.sc-gw-look-at-me{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-2*/.px-2.sc-gw-look-at-me{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-3*/.px-3.sc-gw-look-at-me{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-4*/.px-4.sc-gw-look-at-me{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-5*/.px-5.sc-gw-look-at-me{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-0*/.py-0.sc-gw-look-at-me{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-1*/.py-1.sc-gw-look-at-me{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-2*/.py-2.sc-gw-look-at-me{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-3*/.py-3.sc-gw-look-at-me{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-4*/.py-4.sc-gw-look-at-me{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-5*/.py-5.sc-gw-look-at-me{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-0*/.pt-0.sc-gw-look-at-me{padding-top:0 !important}/*!@.pt-1*/.pt-1.sc-gw-look-at-me{padding-top:0.25rem !important}/*!@.pt-2*/.pt-2.sc-gw-look-at-me{padding-top:0.5rem !important}/*!@.pt-3*/.pt-3.sc-gw-look-at-me{padding-top:1rem !important}/*!@.pt-4*/.pt-4.sc-gw-look-at-me{padding-top:1.5rem !important}/*!@.pt-5*/.pt-5.sc-gw-look-at-me{padding-top:3rem !important}/*!@.pe-0*/.pe-0.sc-gw-look-at-me{padding-right:0 !important}/*!@.pe-1*/.pe-1.sc-gw-look-at-me{padding-right:0.25rem !important}/*!@.pe-2*/.pe-2.sc-gw-look-at-me{padding-right:0.5rem !important}/*!@.pe-3*/.pe-3.sc-gw-look-at-me{padding-right:1rem !important}/*!@.pe-4*/.pe-4.sc-gw-look-at-me{padding-right:1.5rem !important}/*!@.pe-5*/.pe-5.sc-gw-look-at-me{padding-right:3rem !important}/*!@.pb-0*/.pb-0.sc-gw-look-at-me{padding-bottom:0 !important}/*!@.pb-1*/.pb-1.sc-gw-look-at-me{padding-bottom:0.25rem !important}/*!@.pb-2*/.pb-2.sc-gw-look-at-me{padding-bottom:0.5rem !important}/*!@.pb-3*/.pb-3.sc-gw-look-at-me{padding-bottom:1rem !important}/*!@.pb-4*/.pb-4.sc-gw-look-at-me{padding-bottom:1.5rem !important}/*!@.pb-5*/.pb-5.sc-gw-look-at-me{padding-bottom:3rem !important}/*!@.ps-0*/.ps-0.sc-gw-look-at-me{padding-left:0 !important}/*!@.ps-1*/.ps-1.sc-gw-look-at-me{padding-left:0.25rem !important}/*!@.ps-2*/.ps-2.sc-gw-look-at-me{padding-left:0.5rem !important}/*!@.ps-3*/.ps-3.sc-gw-look-at-me{padding-left:1rem !important}/*!@.ps-4*/.ps-4.sc-gw-look-at-me{padding-left:1.5rem !important}/*!@.ps-5*/.ps-5.sc-gw-look-at-me{padding-left:3rem !important}@media (min-width: 576px){/*!@.d-sm-inline*/.d-sm-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-sm-inline-block*/.d-sm-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-sm-block*/.d-sm-block.sc-gw-look-at-me{display:block !important}/*!@.d-sm-grid*/.d-sm-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-sm-table*/.d-sm-table.sc-gw-look-at-me{display:table !important}/*!@.d-sm-table-row*/.d-sm-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-sm-table-cell*/.d-sm-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-sm-flex*/.d-sm-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-sm-inline-flex*/.d-sm-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-sm-none*/.d-sm-none.sc-gw-look-at-me{display:none !important}/*!@.flex-sm-fill*/.flex-sm-fill.sc-gw-look-at-me{flex:1 1 auto !important}/*!@.flex-sm-row*/.flex-sm-row.sc-gw-look-at-me{flex-direction:row !important}/*!@.flex-sm-column*/.flex-sm-column.sc-gw-look-at-me{flex-direction:column !important}/*!@.flex-sm-row-reverse*/.flex-sm-row-reverse.sc-gw-look-at-me{flex-direction:row-reverse !important}/*!@.flex-sm-column-reverse*/.flex-sm-column-reverse.sc-gw-look-at-me{flex-direction:column-reverse !important}/*!@.flex-sm-grow-0*/.flex-sm-grow-0.sc-gw-look-at-me{flex-grow:0 !important}/*!@.flex-sm-grow-1*/.flex-sm-grow-1.sc-gw-look-at-me{flex-grow:1 !important}/*!@.flex-sm-shrink-0*/.flex-sm-shrink-0.sc-gw-look-at-me{flex-shrink:0 !important}/*!@.flex-sm-shrink-1*/.flex-sm-shrink-1.sc-gw-look-at-me{flex-shrink:1 !important}/*!@.flex-sm-wrap*/.flex-sm-wrap.sc-gw-look-at-me{flex-wrap:wrap !important}/*!@.flex-sm-nowrap*/.flex-sm-nowrap.sc-gw-look-at-me{flex-wrap:nowrap !important}/*!@.flex-sm-wrap-reverse*/.flex-sm-wrap-reverse.sc-gw-look-at-me{flex-wrap:wrap-reverse !important}/*!@.justify-content-sm-start*/.justify-content-sm-start.sc-gw-look-at-me{justify-content:flex-start !important}/*!@.justify-content-sm-end*/.justify-content-sm-end.sc-gw-look-at-me{justify-content:flex-end !important}/*!@.justify-content-sm-center*/.justify-content-sm-center.sc-gw-look-at-me{justify-content:center !important}/*!@.justify-content-sm-between*/.justify-content-sm-between.sc-gw-look-at-me{justify-content:space-between !important}/*!@.justify-content-sm-around*/.justify-content-sm-around.sc-gw-look-at-me{justify-content:space-around !important}/*!@.justify-content-sm-evenly*/.justify-content-sm-evenly.sc-gw-look-at-me{justify-content:space-evenly !important}/*!@.align-items-sm-start*/.align-items-sm-start.sc-gw-look-at-me{align-items:flex-start !important}/*!@.align-items-sm-end*/.align-items-sm-end.sc-gw-look-at-me{align-items:flex-end !important}/*!@.align-items-sm-center*/.align-items-sm-center.sc-gw-look-at-me{align-items:center !important}/*!@.align-items-sm-baseline*/.align-items-sm-baseline.sc-gw-look-at-me{align-items:baseline !important}/*!@.align-items-sm-stretch*/.align-items-sm-stretch.sc-gw-look-at-me{align-items:stretch !important}/*!@.align-content-sm-start*/.align-content-sm-start.sc-gw-look-at-me{align-content:flex-start !important}/*!@.align-content-sm-end*/.align-content-sm-end.sc-gw-look-at-me{align-content:flex-end !important}/*!@.align-content-sm-center*/.align-content-sm-center.sc-gw-look-at-me{align-content:center !important}/*!@.align-content-sm-between*/.align-content-sm-between.sc-gw-look-at-me{align-content:space-between !important}/*!@.align-content-sm-around*/.align-content-sm-around.sc-gw-look-at-me{align-content:space-around !important}/*!@.align-content-sm-stretch*/.align-content-sm-stretch.sc-gw-look-at-me{align-content:stretch !important}/*!@.align-self-sm-auto*/.align-self-sm-auto.sc-gw-look-at-me{align-self:auto !important}/*!@.align-self-sm-start*/.align-self-sm-start.sc-gw-look-at-me{align-self:flex-start !important}/*!@.align-self-sm-end*/.align-self-sm-end.sc-gw-look-at-me{align-self:flex-end !important}/*!@.align-self-sm-center*/.align-self-sm-center.sc-gw-look-at-me{align-self:center !important}/*!@.align-self-sm-baseline*/.align-self-sm-baseline.sc-gw-look-at-me{align-self:baseline !important}/*!@.align-self-sm-stretch*/.align-self-sm-stretch.sc-gw-look-at-me{align-self:stretch !important}/*!@.order-sm-first*/.order-sm-first.sc-gw-look-at-me{order:-1 !important}/*!@.order-sm-0*/.order-sm-0.sc-gw-look-at-me{order:0 !important}/*!@.order-sm-1*/.order-sm-1.sc-gw-look-at-me{order:1 !important}/*!@.order-sm-2*/.order-sm-2.sc-gw-look-at-me{order:2 !important}/*!@.order-sm-3*/.order-sm-3.sc-gw-look-at-me{order:3 !important}/*!@.order-sm-4*/.order-sm-4.sc-gw-look-at-me{order:4 !important}/*!@.order-sm-5*/.order-sm-5.sc-gw-look-at-me{order:5 !important}/*!@.order-sm-last*/.order-sm-last.sc-gw-look-at-me{order:6 !important}/*!@.m-sm-0*/.m-sm-0.sc-gw-look-at-me{margin:0 !important}/*!@.m-sm-1*/.m-sm-1.sc-gw-look-at-me{margin:0.25rem !important}/*!@.m-sm-2*/.m-sm-2.sc-gw-look-at-me{margin:0.5rem !important}/*!@.m-sm-3*/.m-sm-3.sc-gw-look-at-me{margin:1rem !important}/*!@.m-sm-4*/.m-sm-4.sc-gw-look-at-me{margin:1.5rem !important}/*!@.m-sm-5*/.m-sm-5.sc-gw-look-at-me{margin:3rem !important}/*!@.m-sm-auto*/.m-sm-auto.sc-gw-look-at-me{margin:auto !important}/*!@.mx-sm-0*/.mx-sm-0.sc-gw-look-at-me{margin-right:0 !important;margin-left:0 !important}/*!@.mx-sm-1*/.mx-sm-1.sc-gw-look-at-me{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-sm-2*/.mx-sm-2.sc-gw-look-at-me{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-sm-3*/.mx-sm-3.sc-gw-look-at-me{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-sm-4*/.mx-sm-4.sc-gw-look-at-me{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-sm-5*/.mx-sm-5.sc-gw-look-at-me{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-sm-auto*/.mx-sm-auto.sc-gw-look-at-me{margin-right:auto !important;margin-left:auto !important}/*!@.my-sm-0*/.my-sm-0.sc-gw-look-at-me{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-sm-1*/.my-sm-1.sc-gw-look-at-me{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-sm-2*/.my-sm-2.sc-gw-look-at-me{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-sm-3*/.my-sm-3.sc-gw-look-at-me{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-sm-4*/.my-sm-4.sc-gw-look-at-me{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-sm-5*/.my-sm-5.sc-gw-look-at-me{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-sm-auto*/.my-sm-auto.sc-gw-look-at-me{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-sm-0*/.mt-sm-0.sc-gw-look-at-me{margin-top:0 !important}/*!@.mt-sm-1*/.mt-sm-1.sc-gw-look-at-me{margin-top:0.25rem !important}/*!@.mt-sm-2*/.mt-sm-2.sc-gw-look-at-me{margin-top:0.5rem !important}/*!@.mt-sm-3*/.mt-sm-3.sc-gw-look-at-me{margin-top:1rem !important}/*!@.mt-sm-4*/.mt-sm-4.sc-gw-look-at-me{margin-top:1.5rem !important}/*!@.mt-sm-5*/.mt-sm-5.sc-gw-look-at-me{margin-top:3rem !important}/*!@.mt-sm-auto*/.mt-sm-auto.sc-gw-look-at-me{margin-top:auto !important}/*!@.me-sm-0*/.me-sm-0.sc-gw-look-at-me{margin-right:0 !important}/*!@.me-sm-1*/.me-sm-1.sc-gw-look-at-me{margin-right:0.25rem !important}/*!@.me-sm-2*/.me-sm-2.sc-gw-look-at-me{margin-right:0.5rem !important}/*!@.me-sm-3*/.me-sm-3.sc-gw-look-at-me{margin-right:1rem !important}/*!@.me-sm-4*/.me-sm-4.sc-gw-look-at-me{margin-right:1.5rem !important}/*!@.me-sm-5*/.me-sm-5.sc-gw-look-at-me{margin-right:3rem !important}/*!@.me-sm-auto*/.me-sm-auto.sc-gw-look-at-me{margin-right:auto !important}/*!@.mb-sm-0*/.mb-sm-0.sc-gw-look-at-me{margin-bottom:0 !important}/*!@.mb-sm-1*/.mb-sm-1.sc-gw-look-at-me{margin-bottom:0.25rem !important}/*!@.mb-sm-2*/.mb-sm-2.sc-gw-look-at-me{margin-bottom:0.5rem !important}/*!@.mb-sm-3*/.mb-sm-3.sc-gw-look-at-me{margin-bottom:1rem !important}/*!@.mb-sm-4*/.mb-sm-4.sc-gw-look-at-me{margin-bottom:1.5rem !important}/*!@.mb-sm-5*/.mb-sm-5.sc-gw-look-at-me{margin-bottom:3rem !important}/*!@.mb-sm-auto*/.mb-sm-auto.sc-gw-look-at-me{margin-bottom:auto !important}/*!@.ms-sm-0*/.ms-sm-0.sc-gw-look-at-me{margin-left:0 !important}/*!@.ms-sm-1*/.ms-sm-1.sc-gw-look-at-me{margin-left:0.25rem !important}/*!@.ms-sm-2*/.ms-sm-2.sc-gw-look-at-me{margin-left:0.5rem !important}/*!@.ms-sm-3*/.ms-sm-3.sc-gw-look-at-me{margin-left:1rem !important}/*!@.ms-sm-4*/.ms-sm-4.sc-gw-look-at-me{margin-left:1.5rem !important}/*!@.ms-sm-5*/.ms-sm-5.sc-gw-look-at-me{margin-left:3rem !important}/*!@.ms-sm-auto*/.ms-sm-auto.sc-gw-look-at-me{margin-left:auto !important}/*!@.p-sm-0*/.p-sm-0.sc-gw-look-at-me{padding:0 !important}/*!@.p-sm-1*/.p-sm-1.sc-gw-look-at-me{padding:0.25rem !important}/*!@.p-sm-2*/.p-sm-2.sc-gw-look-at-me{padding:0.5rem !important}/*!@.p-sm-3*/.p-sm-3.sc-gw-look-at-me{padding:1rem !important}/*!@.p-sm-4*/.p-sm-4.sc-gw-look-at-me{padding:1.5rem !important}/*!@.p-sm-5*/.p-sm-5.sc-gw-look-at-me{padding:3rem !important}/*!@.px-sm-0*/.px-sm-0.sc-gw-look-at-me{padding-right:0 !important;padding-left:0 !important}/*!@.px-sm-1*/.px-sm-1.sc-gw-look-at-me{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-sm-2*/.px-sm-2.sc-gw-look-at-me{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-sm-3*/.px-sm-3.sc-gw-look-at-me{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-sm-4*/.px-sm-4.sc-gw-look-at-me{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-sm-5*/.px-sm-5.sc-gw-look-at-me{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-sm-0*/.py-sm-0.sc-gw-look-at-me{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-sm-1*/.py-sm-1.sc-gw-look-at-me{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-sm-2*/.py-sm-2.sc-gw-look-at-me{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-sm-3*/.py-sm-3.sc-gw-look-at-me{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-sm-4*/.py-sm-4.sc-gw-look-at-me{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-sm-5*/.py-sm-5.sc-gw-look-at-me{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-sm-0*/.pt-sm-0.sc-gw-look-at-me{padding-top:0 !important}/*!@.pt-sm-1*/.pt-sm-1.sc-gw-look-at-me{padding-top:0.25rem !important}/*!@.pt-sm-2*/.pt-sm-2.sc-gw-look-at-me{padding-top:0.5rem !important}/*!@.pt-sm-3*/.pt-sm-3.sc-gw-look-at-me{padding-top:1rem !important}/*!@.pt-sm-4*/.pt-sm-4.sc-gw-look-at-me{padding-top:1.5rem !important}/*!@.pt-sm-5*/.pt-sm-5.sc-gw-look-at-me{padding-top:3rem !important}/*!@.pe-sm-0*/.pe-sm-0.sc-gw-look-at-me{padding-right:0 !important}/*!@.pe-sm-1*/.pe-sm-1.sc-gw-look-at-me{padding-right:0.25rem !important}/*!@.pe-sm-2*/.pe-sm-2.sc-gw-look-at-me{padding-right:0.5rem !important}/*!@.pe-sm-3*/.pe-sm-3.sc-gw-look-at-me{padding-right:1rem !important}/*!@.pe-sm-4*/.pe-sm-4.sc-gw-look-at-me{padding-right:1.5rem !important}/*!@.pe-sm-5*/.pe-sm-5.sc-gw-look-at-me{padding-right:3rem !important}/*!@.pb-sm-0*/.pb-sm-0.sc-gw-look-at-me{padding-bottom:0 !important}/*!@.pb-sm-1*/.pb-sm-1.sc-gw-look-at-me{padding-bottom:0.25rem !important}/*!@.pb-sm-2*/.pb-sm-2.sc-gw-look-at-me{padding-bottom:0.5rem !important}/*!@.pb-sm-3*/.pb-sm-3.sc-gw-look-at-me{padding-bottom:1rem !important}/*!@.pb-sm-4*/.pb-sm-4.sc-gw-look-at-me{padding-bottom:1.5rem !important}/*!@.pb-sm-5*/.pb-sm-5.sc-gw-look-at-me{padding-bottom:3rem !important}/*!@.ps-sm-0*/.ps-sm-0.sc-gw-look-at-me{padding-left:0 !important}/*!@.ps-sm-1*/.ps-sm-1.sc-gw-look-at-me{padding-left:0.25rem !important}/*!@.ps-sm-2*/.ps-sm-2.sc-gw-look-at-me{padding-left:0.5rem !important}/*!@.ps-sm-3*/.ps-sm-3.sc-gw-look-at-me{padding-left:1rem !important}/*!@.ps-sm-4*/.ps-sm-4.sc-gw-look-at-me{padding-left:1.5rem !important}/*!@.ps-sm-5*/.ps-sm-5.sc-gw-look-at-me{padding-left:3rem !important}}@media (min-width: 768px){/*!@.d-md-inline*/.d-md-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-md-inline-block*/.d-md-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-md-block*/.d-md-block.sc-gw-look-at-me{display:block !important}/*!@.d-md-grid*/.d-md-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-md-table*/.d-md-table.sc-gw-look-at-me{display:table !important}/*!@.d-md-table-row*/.d-md-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-md-table-cell*/.d-md-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-md-flex*/.d-md-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-md-inline-flex*/.d-md-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-md-none*/.d-md-none.sc-gw-look-at-me{display:none !important}/*!@.flex-md-fill*/.flex-md-fill.sc-gw-look-at-me{flex:1 1 auto !important}/*!@.flex-md-row*/.flex-md-row.sc-gw-look-at-me{flex-direction:row !important}/*!@.flex-md-column*/.flex-md-column.sc-gw-look-at-me{flex-direction:column !important}/*!@.flex-md-row-reverse*/.flex-md-row-reverse.sc-gw-look-at-me{flex-direction:row-reverse !important}/*!@.flex-md-column-reverse*/.flex-md-column-reverse.sc-gw-look-at-me{flex-direction:column-reverse !important}/*!@.flex-md-grow-0*/.flex-md-grow-0.sc-gw-look-at-me{flex-grow:0 !important}/*!@.flex-md-grow-1*/.flex-md-grow-1.sc-gw-look-at-me{flex-grow:1 !important}/*!@.flex-md-shrink-0*/.flex-md-shrink-0.sc-gw-look-at-me{flex-shrink:0 !important}/*!@.flex-md-shrink-1*/.flex-md-shrink-1.sc-gw-look-at-me{flex-shrink:1 !important}/*!@.flex-md-wrap*/.flex-md-wrap.sc-gw-look-at-me{flex-wrap:wrap !important}/*!@.flex-md-nowrap*/.flex-md-nowrap.sc-gw-look-at-me{flex-wrap:nowrap !important}/*!@.flex-md-wrap-reverse*/.flex-md-wrap-reverse.sc-gw-look-at-me{flex-wrap:wrap-reverse !important}/*!@.justify-content-md-start*/.justify-content-md-start.sc-gw-look-at-me{justify-content:flex-start !important}/*!@.justify-content-md-end*/.justify-content-md-end.sc-gw-look-at-me{justify-content:flex-end !important}/*!@.justify-content-md-center*/.justify-content-md-center.sc-gw-look-at-me{justify-content:center !important}/*!@.justify-content-md-between*/.justify-content-md-between.sc-gw-look-at-me{justify-content:space-between !important}/*!@.justify-content-md-around*/.justify-content-md-around.sc-gw-look-at-me{justify-content:space-around !important}/*!@.justify-content-md-evenly*/.justify-content-md-evenly.sc-gw-look-at-me{justify-content:space-evenly !important}/*!@.align-items-md-start*/.align-items-md-start.sc-gw-look-at-me{align-items:flex-start !important}/*!@.align-items-md-end*/.align-items-md-end.sc-gw-look-at-me{align-items:flex-end !important}/*!@.align-items-md-center*/.align-items-md-center.sc-gw-look-at-me{align-items:center !important}/*!@.align-items-md-baseline*/.align-items-md-baseline.sc-gw-look-at-me{align-items:baseline !important}/*!@.align-items-md-stretch*/.align-items-md-stretch.sc-gw-look-at-me{align-items:stretch !important}/*!@.align-content-md-start*/.align-content-md-start.sc-gw-look-at-me{align-content:flex-start !important}/*!@.align-content-md-end*/.align-content-md-end.sc-gw-look-at-me{align-content:flex-end !important}/*!@.align-content-md-center*/.align-content-md-center.sc-gw-look-at-me{align-content:center !important}/*!@.align-content-md-between*/.align-content-md-between.sc-gw-look-at-me{align-content:space-between !important}/*!@.align-content-md-around*/.align-content-md-around.sc-gw-look-at-me{align-content:space-around !important}/*!@.align-content-md-stretch*/.align-content-md-stretch.sc-gw-look-at-me{align-content:stretch !important}/*!@.align-self-md-auto*/.align-self-md-auto.sc-gw-look-at-me{align-self:auto !important}/*!@.align-self-md-start*/.align-self-md-start.sc-gw-look-at-me{align-self:flex-start !important}/*!@.align-self-md-end*/.align-self-md-end.sc-gw-look-at-me{align-self:flex-end !important}/*!@.align-self-md-center*/.align-self-md-center.sc-gw-look-at-me{align-self:center !important}/*!@.align-self-md-baseline*/.align-self-md-baseline.sc-gw-look-at-me{align-self:baseline !important}/*!@.align-self-md-stretch*/.align-self-md-stretch.sc-gw-look-at-me{align-self:stretch !important}/*!@.order-md-first*/.order-md-first.sc-gw-look-at-me{order:-1 !important}/*!@.order-md-0*/.order-md-0.sc-gw-look-at-me{order:0 !important}/*!@.order-md-1*/.order-md-1.sc-gw-look-at-me{order:1 !important}/*!@.order-md-2*/.order-md-2.sc-gw-look-at-me{order:2 !important}/*!@.order-md-3*/.order-md-3.sc-gw-look-at-me{order:3 !important}/*!@.order-md-4*/.order-md-4.sc-gw-look-at-me{order:4 !important}/*!@.order-md-5*/.order-md-5.sc-gw-look-at-me{order:5 !important}/*!@.order-md-last*/.order-md-last.sc-gw-look-at-me{order:6 !important}/*!@.m-md-0*/.m-md-0.sc-gw-look-at-me{margin:0 !important}/*!@.m-md-1*/.m-md-1.sc-gw-look-at-me{margin:0.25rem !important}/*!@.m-md-2*/.m-md-2.sc-gw-look-at-me{margin:0.5rem !important}/*!@.m-md-3*/.m-md-3.sc-gw-look-at-me{margin:1rem !important}/*!@.m-md-4*/.m-md-4.sc-gw-look-at-me{margin:1.5rem !important}/*!@.m-md-5*/.m-md-5.sc-gw-look-at-me{margin:3rem !important}/*!@.m-md-auto*/.m-md-auto.sc-gw-look-at-me{margin:auto !important}/*!@.mx-md-0*/.mx-md-0.sc-gw-look-at-me{margin-right:0 !important;margin-left:0 !important}/*!@.mx-md-1*/.mx-md-1.sc-gw-look-at-me{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-md-2*/.mx-md-2.sc-gw-look-at-me{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-md-3*/.mx-md-3.sc-gw-look-at-me{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-md-4*/.mx-md-4.sc-gw-look-at-me{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-md-5*/.mx-md-5.sc-gw-look-at-me{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-md-auto*/.mx-md-auto.sc-gw-look-at-me{margin-right:auto !important;margin-left:auto !important}/*!@.my-md-0*/.my-md-0.sc-gw-look-at-me{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-md-1*/.my-md-1.sc-gw-look-at-me{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-md-2*/.my-md-2.sc-gw-look-at-me{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-md-3*/.my-md-3.sc-gw-look-at-me{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-md-4*/.my-md-4.sc-gw-look-at-me{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-md-5*/.my-md-5.sc-gw-look-at-me{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-md-auto*/.my-md-auto.sc-gw-look-at-me{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-md-0*/.mt-md-0.sc-gw-look-at-me{margin-top:0 !important}/*!@.mt-md-1*/.mt-md-1.sc-gw-look-at-me{margin-top:0.25rem !important}/*!@.mt-md-2*/.mt-md-2.sc-gw-look-at-me{margin-top:0.5rem !important}/*!@.mt-md-3*/.mt-md-3.sc-gw-look-at-me{margin-top:1rem !important}/*!@.mt-md-4*/.mt-md-4.sc-gw-look-at-me{margin-top:1.5rem !important}/*!@.mt-md-5*/.mt-md-5.sc-gw-look-at-me{margin-top:3rem !important}/*!@.mt-md-auto*/.mt-md-auto.sc-gw-look-at-me{margin-top:auto !important}/*!@.me-md-0*/.me-md-0.sc-gw-look-at-me{margin-right:0 !important}/*!@.me-md-1*/.me-md-1.sc-gw-look-at-me{margin-right:0.25rem !important}/*!@.me-md-2*/.me-md-2.sc-gw-look-at-me{margin-right:0.5rem !important}/*!@.me-md-3*/.me-md-3.sc-gw-look-at-me{margin-right:1rem !important}/*!@.me-md-4*/.me-md-4.sc-gw-look-at-me{margin-right:1.5rem !important}/*!@.me-md-5*/.me-md-5.sc-gw-look-at-me{margin-right:3rem !important}/*!@.me-md-auto*/.me-md-auto.sc-gw-look-at-me{margin-right:auto !important}/*!@.mb-md-0*/.mb-md-0.sc-gw-look-at-me{margin-bottom:0 !important}/*!@.mb-md-1*/.mb-md-1.sc-gw-look-at-me{margin-bottom:0.25rem !important}/*!@.mb-md-2*/.mb-md-2.sc-gw-look-at-me{margin-bottom:0.5rem !important}/*!@.mb-md-3*/.mb-md-3.sc-gw-look-at-me{margin-bottom:1rem !important}/*!@.mb-md-4*/.mb-md-4.sc-gw-look-at-me{margin-bottom:1.5rem !important}/*!@.mb-md-5*/.mb-md-5.sc-gw-look-at-me{margin-bottom:3rem !important}/*!@.mb-md-auto*/.mb-md-auto.sc-gw-look-at-me{margin-bottom:auto !important}/*!@.ms-md-0*/.ms-md-0.sc-gw-look-at-me{margin-left:0 !important}/*!@.ms-md-1*/.ms-md-1.sc-gw-look-at-me{margin-left:0.25rem !important}/*!@.ms-md-2*/.ms-md-2.sc-gw-look-at-me{margin-left:0.5rem !important}/*!@.ms-md-3*/.ms-md-3.sc-gw-look-at-me{margin-left:1rem !important}/*!@.ms-md-4*/.ms-md-4.sc-gw-look-at-me{margin-left:1.5rem !important}/*!@.ms-md-5*/.ms-md-5.sc-gw-look-at-me{margin-left:3rem !important}/*!@.ms-md-auto*/.ms-md-auto.sc-gw-look-at-me{margin-left:auto !important}/*!@.p-md-0*/.p-md-0.sc-gw-look-at-me{padding:0 !important}/*!@.p-md-1*/.p-md-1.sc-gw-look-at-me{padding:0.25rem !important}/*!@.p-md-2*/.p-md-2.sc-gw-look-at-me{padding:0.5rem !important}/*!@.p-md-3*/.p-md-3.sc-gw-look-at-me{padding:1rem !important}/*!@.p-md-4*/.p-md-4.sc-gw-look-at-me{padding:1.5rem !important}/*!@.p-md-5*/.p-md-5.sc-gw-look-at-me{padding:3rem !important}/*!@.px-md-0*/.px-md-0.sc-gw-look-at-me{padding-right:0 !important;padding-left:0 !important}/*!@.px-md-1*/.px-md-1.sc-gw-look-at-me{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-md-2*/.px-md-2.sc-gw-look-at-me{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-md-3*/.px-md-3.sc-gw-look-at-me{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-md-4*/.px-md-4.sc-gw-look-at-me{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-md-5*/.px-md-5.sc-gw-look-at-me{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-md-0*/.py-md-0.sc-gw-look-at-me{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-md-1*/.py-md-1.sc-gw-look-at-me{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-md-2*/.py-md-2.sc-gw-look-at-me{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-md-3*/.py-md-3.sc-gw-look-at-me{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-md-4*/.py-md-4.sc-gw-look-at-me{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-md-5*/.py-md-5.sc-gw-look-at-me{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-md-0*/.pt-md-0.sc-gw-look-at-me{padding-top:0 !important}/*!@.pt-md-1*/.pt-md-1.sc-gw-look-at-me{padding-top:0.25rem !important}/*!@.pt-md-2*/.pt-md-2.sc-gw-look-at-me{padding-top:0.5rem !important}/*!@.pt-md-3*/.pt-md-3.sc-gw-look-at-me{padding-top:1rem !important}/*!@.pt-md-4*/.pt-md-4.sc-gw-look-at-me{padding-top:1.5rem !important}/*!@.pt-md-5*/.pt-md-5.sc-gw-look-at-me{padding-top:3rem !important}/*!@.pe-md-0*/.pe-md-0.sc-gw-look-at-me{padding-right:0 !important}/*!@.pe-md-1*/.pe-md-1.sc-gw-look-at-me{padding-right:0.25rem !important}/*!@.pe-md-2*/.pe-md-2.sc-gw-look-at-me{padding-right:0.5rem !important}/*!@.pe-md-3*/.pe-md-3.sc-gw-look-at-me{padding-right:1rem !important}/*!@.pe-md-4*/.pe-md-4.sc-gw-look-at-me{padding-right:1.5rem !important}/*!@.pe-md-5*/.pe-md-5.sc-gw-look-at-me{padding-right:3rem !important}/*!@.pb-md-0*/.pb-md-0.sc-gw-look-at-me{padding-bottom:0 !important}/*!@.pb-md-1*/.pb-md-1.sc-gw-look-at-me{padding-bottom:0.25rem !important}/*!@.pb-md-2*/.pb-md-2.sc-gw-look-at-me{padding-bottom:0.5rem !important}/*!@.pb-md-3*/.pb-md-3.sc-gw-look-at-me{padding-bottom:1rem !important}/*!@.pb-md-4*/.pb-md-4.sc-gw-look-at-me{padding-bottom:1.5rem !important}/*!@.pb-md-5*/.pb-md-5.sc-gw-look-at-me{padding-bottom:3rem !important}/*!@.ps-md-0*/.ps-md-0.sc-gw-look-at-me{padding-left:0 !important}/*!@.ps-md-1*/.ps-md-1.sc-gw-look-at-me{padding-left:0.25rem !important}/*!@.ps-md-2*/.ps-md-2.sc-gw-look-at-me{padding-left:0.5rem !important}/*!@.ps-md-3*/.ps-md-3.sc-gw-look-at-me{padding-left:1rem !important}/*!@.ps-md-4*/.ps-md-4.sc-gw-look-at-me{padding-left:1.5rem !important}/*!@.ps-md-5*/.ps-md-5.sc-gw-look-at-me{padding-left:3rem !important}}@media (min-width: 992px){/*!@.d-lg-inline*/.d-lg-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-lg-inline-block*/.d-lg-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-lg-block*/.d-lg-block.sc-gw-look-at-me{display:block !important}/*!@.d-lg-grid*/.d-lg-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-lg-table*/.d-lg-table.sc-gw-look-at-me{display:table !important}/*!@.d-lg-table-row*/.d-lg-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-lg-table-cell*/.d-lg-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-lg-flex*/.d-lg-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-lg-inline-flex*/.d-lg-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-lg-none*/.d-lg-none.sc-gw-look-at-me{display:none !important}/*!@.flex-lg-fill*/.flex-lg-fill.sc-gw-look-at-me{flex:1 1 auto !important}/*!@.flex-lg-row*/.flex-lg-row.sc-gw-look-at-me{flex-direction:row !important}/*!@.flex-lg-column*/.flex-lg-column.sc-gw-look-at-me{flex-direction:column !important}/*!@.flex-lg-row-reverse*/.flex-lg-row-reverse.sc-gw-look-at-me{flex-direction:row-reverse !important}/*!@.flex-lg-column-reverse*/.flex-lg-column-reverse.sc-gw-look-at-me{flex-direction:column-reverse !important}/*!@.flex-lg-grow-0*/.flex-lg-grow-0.sc-gw-look-at-me{flex-grow:0 !important}/*!@.flex-lg-grow-1*/.flex-lg-grow-1.sc-gw-look-at-me{flex-grow:1 !important}/*!@.flex-lg-shrink-0*/.flex-lg-shrink-0.sc-gw-look-at-me{flex-shrink:0 !important}/*!@.flex-lg-shrink-1*/.flex-lg-shrink-1.sc-gw-look-at-me{flex-shrink:1 !important}/*!@.flex-lg-wrap*/.flex-lg-wrap.sc-gw-look-at-me{flex-wrap:wrap !important}/*!@.flex-lg-nowrap*/.flex-lg-nowrap.sc-gw-look-at-me{flex-wrap:nowrap !important}/*!@.flex-lg-wrap-reverse*/.flex-lg-wrap-reverse.sc-gw-look-at-me{flex-wrap:wrap-reverse !important}/*!@.justify-content-lg-start*/.justify-content-lg-start.sc-gw-look-at-me{justify-content:flex-start !important}/*!@.justify-content-lg-end*/.justify-content-lg-end.sc-gw-look-at-me{justify-content:flex-end !important}/*!@.justify-content-lg-center*/.justify-content-lg-center.sc-gw-look-at-me{justify-content:center !important}/*!@.justify-content-lg-between*/.justify-content-lg-between.sc-gw-look-at-me{justify-content:space-between !important}/*!@.justify-content-lg-around*/.justify-content-lg-around.sc-gw-look-at-me{justify-content:space-around !important}/*!@.justify-content-lg-evenly*/.justify-content-lg-evenly.sc-gw-look-at-me{justify-content:space-evenly !important}/*!@.align-items-lg-start*/.align-items-lg-start.sc-gw-look-at-me{align-items:flex-start !important}/*!@.align-items-lg-end*/.align-items-lg-end.sc-gw-look-at-me{align-items:flex-end !important}/*!@.align-items-lg-center*/.align-items-lg-center.sc-gw-look-at-me{align-items:center !important}/*!@.align-items-lg-baseline*/.align-items-lg-baseline.sc-gw-look-at-me{align-items:baseline !important}/*!@.align-items-lg-stretch*/.align-items-lg-stretch.sc-gw-look-at-me{align-items:stretch !important}/*!@.align-content-lg-start*/.align-content-lg-start.sc-gw-look-at-me{align-content:flex-start !important}/*!@.align-content-lg-end*/.align-content-lg-end.sc-gw-look-at-me{align-content:flex-end !important}/*!@.align-content-lg-center*/.align-content-lg-center.sc-gw-look-at-me{align-content:center !important}/*!@.align-content-lg-between*/.align-content-lg-between.sc-gw-look-at-me{align-content:space-between !important}/*!@.align-content-lg-around*/.align-content-lg-around.sc-gw-look-at-me{align-content:space-around !important}/*!@.align-content-lg-stretch*/.align-content-lg-stretch.sc-gw-look-at-me{align-content:stretch !important}/*!@.align-self-lg-auto*/.align-self-lg-auto.sc-gw-look-at-me{align-self:auto !important}/*!@.align-self-lg-start*/.align-self-lg-start.sc-gw-look-at-me{align-self:flex-start !important}/*!@.align-self-lg-end*/.align-self-lg-end.sc-gw-look-at-me{align-self:flex-end !important}/*!@.align-self-lg-center*/.align-self-lg-center.sc-gw-look-at-me{align-self:center !important}/*!@.align-self-lg-baseline*/.align-self-lg-baseline.sc-gw-look-at-me{align-self:baseline !important}/*!@.align-self-lg-stretch*/.align-self-lg-stretch.sc-gw-look-at-me{align-self:stretch !important}/*!@.order-lg-first*/.order-lg-first.sc-gw-look-at-me{order:-1 !important}/*!@.order-lg-0*/.order-lg-0.sc-gw-look-at-me{order:0 !important}/*!@.order-lg-1*/.order-lg-1.sc-gw-look-at-me{order:1 !important}/*!@.order-lg-2*/.order-lg-2.sc-gw-look-at-me{order:2 !important}/*!@.order-lg-3*/.order-lg-3.sc-gw-look-at-me{order:3 !important}/*!@.order-lg-4*/.order-lg-4.sc-gw-look-at-me{order:4 !important}/*!@.order-lg-5*/.order-lg-5.sc-gw-look-at-me{order:5 !important}/*!@.order-lg-last*/.order-lg-last.sc-gw-look-at-me{order:6 !important}/*!@.m-lg-0*/.m-lg-0.sc-gw-look-at-me{margin:0 !important}/*!@.m-lg-1*/.m-lg-1.sc-gw-look-at-me{margin:0.25rem !important}/*!@.m-lg-2*/.m-lg-2.sc-gw-look-at-me{margin:0.5rem !important}/*!@.m-lg-3*/.m-lg-3.sc-gw-look-at-me{margin:1rem !important}/*!@.m-lg-4*/.m-lg-4.sc-gw-look-at-me{margin:1.5rem !important}/*!@.m-lg-5*/.m-lg-5.sc-gw-look-at-me{margin:3rem !important}/*!@.m-lg-auto*/.m-lg-auto.sc-gw-look-at-me{margin:auto !important}/*!@.mx-lg-0*/.mx-lg-0.sc-gw-look-at-me{margin-right:0 !important;margin-left:0 !important}/*!@.mx-lg-1*/.mx-lg-1.sc-gw-look-at-me{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-lg-2*/.mx-lg-2.sc-gw-look-at-me{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-lg-3*/.mx-lg-3.sc-gw-look-at-me{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-lg-4*/.mx-lg-4.sc-gw-look-at-me{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-lg-5*/.mx-lg-5.sc-gw-look-at-me{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-lg-auto*/.mx-lg-auto.sc-gw-look-at-me{margin-right:auto !important;margin-left:auto !important}/*!@.my-lg-0*/.my-lg-0.sc-gw-look-at-me{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-lg-1*/.my-lg-1.sc-gw-look-at-me{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-lg-2*/.my-lg-2.sc-gw-look-at-me{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-lg-3*/.my-lg-3.sc-gw-look-at-me{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-lg-4*/.my-lg-4.sc-gw-look-at-me{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-lg-5*/.my-lg-5.sc-gw-look-at-me{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-lg-auto*/.my-lg-auto.sc-gw-look-at-me{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-lg-0*/.mt-lg-0.sc-gw-look-at-me{margin-top:0 !important}/*!@.mt-lg-1*/.mt-lg-1.sc-gw-look-at-me{margin-top:0.25rem !important}/*!@.mt-lg-2*/.mt-lg-2.sc-gw-look-at-me{margin-top:0.5rem !important}/*!@.mt-lg-3*/.mt-lg-3.sc-gw-look-at-me{margin-top:1rem !important}/*!@.mt-lg-4*/.mt-lg-4.sc-gw-look-at-me{margin-top:1.5rem !important}/*!@.mt-lg-5*/.mt-lg-5.sc-gw-look-at-me{margin-top:3rem !important}/*!@.mt-lg-auto*/.mt-lg-auto.sc-gw-look-at-me{margin-top:auto !important}/*!@.me-lg-0*/.me-lg-0.sc-gw-look-at-me{margin-right:0 !important}/*!@.me-lg-1*/.me-lg-1.sc-gw-look-at-me{margin-right:0.25rem !important}/*!@.me-lg-2*/.me-lg-2.sc-gw-look-at-me{margin-right:0.5rem !important}/*!@.me-lg-3*/.me-lg-3.sc-gw-look-at-me{margin-right:1rem !important}/*!@.me-lg-4*/.me-lg-4.sc-gw-look-at-me{margin-right:1.5rem !important}/*!@.me-lg-5*/.me-lg-5.sc-gw-look-at-me{margin-right:3rem !important}/*!@.me-lg-auto*/.me-lg-auto.sc-gw-look-at-me{margin-right:auto !important}/*!@.mb-lg-0*/.mb-lg-0.sc-gw-look-at-me{margin-bottom:0 !important}/*!@.mb-lg-1*/.mb-lg-1.sc-gw-look-at-me{margin-bottom:0.25rem !important}/*!@.mb-lg-2*/.mb-lg-2.sc-gw-look-at-me{margin-bottom:0.5rem !important}/*!@.mb-lg-3*/.mb-lg-3.sc-gw-look-at-me{margin-bottom:1rem !important}/*!@.mb-lg-4*/.mb-lg-4.sc-gw-look-at-me{margin-bottom:1.5rem !important}/*!@.mb-lg-5*/.mb-lg-5.sc-gw-look-at-me{margin-bottom:3rem !important}/*!@.mb-lg-auto*/.mb-lg-auto.sc-gw-look-at-me{margin-bottom:auto !important}/*!@.ms-lg-0*/.ms-lg-0.sc-gw-look-at-me{margin-left:0 !important}/*!@.ms-lg-1*/.ms-lg-1.sc-gw-look-at-me{margin-left:0.25rem !important}/*!@.ms-lg-2*/.ms-lg-2.sc-gw-look-at-me{margin-left:0.5rem !important}/*!@.ms-lg-3*/.ms-lg-3.sc-gw-look-at-me{margin-left:1rem !important}/*!@.ms-lg-4*/.ms-lg-4.sc-gw-look-at-me{margin-left:1.5rem !important}/*!@.ms-lg-5*/.ms-lg-5.sc-gw-look-at-me{margin-left:3rem !important}/*!@.ms-lg-auto*/.ms-lg-auto.sc-gw-look-at-me{margin-left:auto !important}/*!@.p-lg-0*/.p-lg-0.sc-gw-look-at-me{padding:0 !important}/*!@.p-lg-1*/.p-lg-1.sc-gw-look-at-me{padding:0.25rem !important}/*!@.p-lg-2*/.p-lg-2.sc-gw-look-at-me{padding:0.5rem !important}/*!@.p-lg-3*/.p-lg-3.sc-gw-look-at-me{padding:1rem !important}/*!@.p-lg-4*/.p-lg-4.sc-gw-look-at-me{padding:1.5rem !important}/*!@.p-lg-5*/.p-lg-5.sc-gw-look-at-me{padding:3rem !important}/*!@.px-lg-0*/.px-lg-0.sc-gw-look-at-me{padding-right:0 !important;padding-left:0 !important}/*!@.px-lg-1*/.px-lg-1.sc-gw-look-at-me{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-lg-2*/.px-lg-2.sc-gw-look-at-me{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-lg-3*/.px-lg-3.sc-gw-look-at-me{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-lg-4*/.px-lg-4.sc-gw-look-at-me{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-lg-5*/.px-lg-5.sc-gw-look-at-me{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-lg-0*/.py-lg-0.sc-gw-look-at-me{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-lg-1*/.py-lg-1.sc-gw-look-at-me{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-lg-2*/.py-lg-2.sc-gw-look-at-me{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-lg-3*/.py-lg-3.sc-gw-look-at-me{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-lg-4*/.py-lg-4.sc-gw-look-at-me{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-lg-5*/.py-lg-5.sc-gw-look-at-me{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-lg-0*/.pt-lg-0.sc-gw-look-at-me{padding-top:0 !important}/*!@.pt-lg-1*/.pt-lg-1.sc-gw-look-at-me{padding-top:0.25rem !important}/*!@.pt-lg-2*/.pt-lg-2.sc-gw-look-at-me{padding-top:0.5rem !important}/*!@.pt-lg-3*/.pt-lg-3.sc-gw-look-at-me{padding-top:1rem !important}/*!@.pt-lg-4*/.pt-lg-4.sc-gw-look-at-me{padding-top:1.5rem !important}/*!@.pt-lg-5*/.pt-lg-5.sc-gw-look-at-me{padding-top:3rem !important}/*!@.pe-lg-0*/.pe-lg-0.sc-gw-look-at-me{padding-right:0 !important}/*!@.pe-lg-1*/.pe-lg-1.sc-gw-look-at-me{padding-right:0.25rem !important}/*!@.pe-lg-2*/.pe-lg-2.sc-gw-look-at-me{padding-right:0.5rem !important}/*!@.pe-lg-3*/.pe-lg-3.sc-gw-look-at-me{padding-right:1rem !important}/*!@.pe-lg-4*/.pe-lg-4.sc-gw-look-at-me{padding-right:1.5rem !important}/*!@.pe-lg-5*/.pe-lg-5.sc-gw-look-at-me{padding-right:3rem !important}/*!@.pb-lg-0*/.pb-lg-0.sc-gw-look-at-me{padding-bottom:0 !important}/*!@.pb-lg-1*/.pb-lg-1.sc-gw-look-at-me{padding-bottom:0.25rem !important}/*!@.pb-lg-2*/.pb-lg-2.sc-gw-look-at-me{padding-bottom:0.5rem !important}/*!@.pb-lg-3*/.pb-lg-3.sc-gw-look-at-me{padding-bottom:1rem !important}/*!@.pb-lg-4*/.pb-lg-4.sc-gw-look-at-me{padding-bottom:1.5rem !important}/*!@.pb-lg-5*/.pb-lg-5.sc-gw-look-at-me{padding-bottom:3rem !important}/*!@.ps-lg-0*/.ps-lg-0.sc-gw-look-at-me{padding-left:0 !important}/*!@.ps-lg-1*/.ps-lg-1.sc-gw-look-at-me{padding-left:0.25rem !important}/*!@.ps-lg-2*/.ps-lg-2.sc-gw-look-at-me{padding-left:0.5rem !important}/*!@.ps-lg-3*/.ps-lg-3.sc-gw-look-at-me{padding-left:1rem !important}/*!@.ps-lg-4*/.ps-lg-4.sc-gw-look-at-me{padding-left:1.5rem !important}/*!@.ps-lg-5*/.ps-lg-5.sc-gw-look-at-me{padding-left:3rem !important}}@media (min-width: 1200px){/*!@.d-xl-inline*/.d-xl-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-xl-inline-block*/.d-xl-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-xl-block*/.d-xl-block.sc-gw-look-at-me{display:block !important}/*!@.d-xl-grid*/.d-xl-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-xl-table*/.d-xl-table.sc-gw-look-at-me{display:table !important}/*!@.d-xl-table-row*/.d-xl-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-xl-table-cell*/.d-xl-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-xl-flex*/.d-xl-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-xl-inline-flex*/.d-xl-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-xl-none*/.d-xl-none.sc-gw-look-at-me{display:none !important}/*!@.flex-xl-fill*/.flex-xl-fill.sc-gw-look-at-me{flex:1 1 auto !important}/*!@.flex-xl-row*/.flex-xl-row.sc-gw-look-at-me{flex-direction:row !important}/*!@.flex-xl-column*/.flex-xl-column.sc-gw-look-at-me{flex-direction:column !important}/*!@.flex-xl-row-reverse*/.flex-xl-row-reverse.sc-gw-look-at-me{flex-direction:row-reverse !important}/*!@.flex-xl-column-reverse*/.flex-xl-column-reverse.sc-gw-look-at-me{flex-direction:column-reverse !important}/*!@.flex-xl-grow-0*/.flex-xl-grow-0.sc-gw-look-at-me{flex-grow:0 !important}/*!@.flex-xl-grow-1*/.flex-xl-grow-1.sc-gw-look-at-me{flex-grow:1 !important}/*!@.flex-xl-shrink-0*/.flex-xl-shrink-0.sc-gw-look-at-me{flex-shrink:0 !important}/*!@.flex-xl-shrink-1*/.flex-xl-shrink-1.sc-gw-look-at-me{flex-shrink:1 !important}/*!@.flex-xl-wrap*/.flex-xl-wrap.sc-gw-look-at-me{flex-wrap:wrap !important}/*!@.flex-xl-nowrap*/.flex-xl-nowrap.sc-gw-look-at-me{flex-wrap:nowrap !important}/*!@.flex-xl-wrap-reverse*/.flex-xl-wrap-reverse.sc-gw-look-at-me{flex-wrap:wrap-reverse !important}/*!@.justify-content-xl-start*/.justify-content-xl-start.sc-gw-look-at-me{justify-content:flex-start !important}/*!@.justify-content-xl-end*/.justify-content-xl-end.sc-gw-look-at-me{justify-content:flex-end !important}/*!@.justify-content-xl-center*/.justify-content-xl-center.sc-gw-look-at-me{justify-content:center !important}/*!@.justify-content-xl-between*/.justify-content-xl-between.sc-gw-look-at-me{justify-content:space-between !important}/*!@.justify-content-xl-around*/.justify-content-xl-around.sc-gw-look-at-me{justify-content:space-around !important}/*!@.justify-content-xl-evenly*/.justify-content-xl-evenly.sc-gw-look-at-me{justify-content:space-evenly !important}/*!@.align-items-xl-start*/.align-items-xl-start.sc-gw-look-at-me{align-items:flex-start !important}/*!@.align-items-xl-end*/.align-items-xl-end.sc-gw-look-at-me{align-items:flex-end !important}/*!@.align-items-xl-center*/.align-items-xl-center.sc-gw-look-at-me{align-items:center !important}/*!@.align-items-xl-baseline*/.align-items-xl-baseline.sc-gw-look-at-me{align-items:baseline !important}/*!@.align-items-xl-stretch*/.align-items-xl-stretch.sc-gw-look-at-me{align-items:stretch !important}/*!@.align-content-xl-start*/.align-content-xl-start.sc-gw-look-at-me{align-content:flex-start !important}/*!@.align-content-xl-end*/.align-content-xl-end.sc-gw-look-at-me{align-content:flex-end !important}/*!@.align-content-xl-center*/.align-content-xl-center.sc-gw-look-at-me{align-content:center !important}/*!@.align-content-xl-between*/.align-content-xl-between.sc-gw-look-at-me{align-content:space-between !important}/*!@.align-content-xl-around*/.align-content-xl-around.sc-gw-look-at-me{align-content:space-around !important}/*!@.align-content-xl-stretch*/.align-content-xl-stretch.sc-gw-look-at-me{align-content:stretch !important}/*!@.align-self-xl-auto*/.align-self-xl-auto.sc-gw-look-at-me{align-self:auto !important}/*!@.align-self-xl-start*/.align-self-xl-start.sc-gw-look-at-me{align-self:flex-start !important}/*!@.align-self-xl-end*/.align-self-xl-end.sc-gw-look-at-me{align-self:flex-end !important}/*!@.align-self-xl-center*/.align-self-xl-center.sc-gw-look-at-me{align-self:center !important}/*!@.align-self-xl-baseline*/.align-self-xl-baseline.sc-gw-look-at-me{align-self:baseline !important}/*!@.align-self-xl-stretch*/.align-self-xl-stretch.sc-gw-look-at-me{align-self:stretch !important}/*!@.order-xl-first*/.order-xl-first.sc-gw-look-at-me{order:-1 !important}/*!@.order-xl-0*/.order-xl-0.sc-gw-look-at-me{order:0 !important}/*!@.order-xl-1*/.order-xl-1.sc-gw-look-at-me{order:1 !important}/*!@.order-xl-2*/.order-xl-2.sc-gw-look-at-me{order:2 !important}/*!@.order-xl-3*/.order-xl-3.sc-gw-look-at-me{order:3 !important}/*!@.order-xl-4*/.order-xl-4.sc-gw-look-at-me{order:4 !important}/*!@.order-xl-5*/.order-xl-5.sc-gw-look-at-me{order:5 !important}/*!@.order-xl-last*/.order-xl-last.sc-gw-look-at-me{order:6 !important}/*!@.m-xl-0*/.m-xl-0.sc-gw-look-at-me{margin:0 !important}/*!@.m-xl-1*/.m-xl-1.sc-gw-look-at-me{margin:0.25rem !important}/*!@.m-xl-2*/.m-xl-2.sc-gw-look-at-me{margin:0.5rem !important}/*!@.m-xl-3*/.m-xl-3.sc-gw-look-at-me{margin:1rem !important}/*!@.m-xl-4*/.m-xl-4.sc-gw-look-at-me{margin:1.5rem !important}/*!@.m-xl-5*/.m-xl-5.sc-gw-look-at-me{margin:3rem !important}/*!@.m-xl-auto*/.m-xl-auto.sc-gw-look-at-me{margin:auto !important}/*!@.mx-xl-0*/.mx-xl-0.sc-gw-look-at-me{margin-right:0 !important;margin-left:0 !important}/*!@.mx-xl-1*/.mx-xl-1.sc-gw-look-at-me{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-xl-2*/.mx-xl-2.sc-gw-look-at-me{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-xl-3*/.mx-xl-3.sc-gw-look-at-me{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-xl-4*/.mx-xl-4.sc-gw-look-at-me{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-xl-5*/.mx-xl-5.sc-gw-look-at-me{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-xl-auto*/.mx-xl-auto.sc-gw-look-at-me{margin-right:auto !important;margin-left:auto !important}/*!@.my-xl-0*/.my-xl-0.sc-gw-look-at-me{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-xl-1*/.my-xl-1.sc-gw-look-at-me{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-xl-2*/.my-xl-2.sc-gw-look-at-me{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-xl-3*/.my-xl-3.sc-gw-look-at-me{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-xl-4*/.my-xl-4.sc-gw-look-at-me{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-xl-5*/.my-xl-5.sc-gw-look-at-me{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-xl-auto*/.my-xl-auto.sc-gw-look-at-me{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-xl-0*/.mt-xl-0.sc-gw-look-at-me{margin-top:0 !important}/*!@.mt-xl-1*/.mt-xl-1.sc-gw-look-at-me{margin-top:0.25rem !important}/*!@.mt-xl-2*/.mt-xl-2.sc-gw-look-at-me{margin-top:0.5rem !important}/*!@.mt-xl-3*/.mt-xl-3.sc-gw-look-at-me{margin-top:1rem !important}/*!@.mt-xl-4*/.mt-xl-4.sc-gw-look-at-me{margin-top:1.5rem !important}/*!@.mt-xl-5*/.mt-xl-5.sc-gw-look-at-me{margin-top:3rem !important}/*!@.mt-xl-auto*/.mt-xl-auto.sc-gw-look-at-me{margin-top:auto !important}/*!@.me-xl-0*/.me-xl-0.sc-gw-look-at-me{margin-right:0 !important}/*!@.me-xl-1*/.me-xl-1.sc-gw-look-at-me{margin-right:0.25rem !important}/*!@.me-xl-2*/.me-xl-2.sc-gw-look-at-me{margin-right:0.5rem !important}/*!@.me-xl-3*/.me-xl-3.sc-gw-look-at-me{margin-right:1rem !important}/*!@.me-xl-4*/.me-xl-4.sc-gw-look-at-me{margin-right:1.5rem !important}/*!@.me-xl-5*/.me-xl-5.sc-gw-look-at-me{margin-right:3rem !important}/*!@.me-xl-auto*/.me-xl-auto.sc-gw-look-at-me{margin-right:auto !important}/*!@.mb-xl-0*/.mb-xl-0.sc-gw-look-at-me{margin-bottom:0 !important}/*!@.mb-xl-1*/.mb-xl-1.sc-gw-look-at-me{margin-bottom:0.25rem !important}/*!@.mb-xl-2*/.mb-xl-2.sc-gw-look-at-me{margin-bottom:0.5rem !important}/*!@.mb-xl-3*/.mb-xl-3.sc-gw-look-at-me{margin-bottom:1rem !important}/*!@.mb-xl-4*/.mb-xl-4.sc-gw-look-at-me{margin-bottom:1.5rem !important}/*!@.mb-xl-5*/.mb-xl-5.sc-gw-look-at-me{margin-bottom:3rem !important}/*!@.mb-xl-auto*/.mb-xl-auto.sc-gw-look-at-me{margin-bottom:auto !important}/*!@.ms-xl-0*/.ms-xl-0.sc-gw-look-at-me{margin-left:0 !important}/*!@.ms-xl-1*/.ms-xl-1.sc-gw-look-at-me{margin-left:0.25rem !important}/*!@.ms-xl-2*/.ms-xl-2.sc-gw-look-at-me{margin-left:0.5rem !important}/*!@.ms-xl-3*/.ms-xl-3.sc-gw-look-at-me{margin-left:1rem !important}/*!@.ms-xl-4*/.ms-xl-4.sc-gw-look-at-me{margin-left:1.5rem !important}/*!@.ms-xl-5*/.ms-xl-5.sc-gw-look-at-me{margin-left:3rem !important}/*!@.ms-xl-auto*/.ms-xl-auto.sc-gw-look-at-me{margin-left:auto !important}/*!@.p-xl-0*/.p-xl-0.sc-gw-look-at-me{padding:0 !important}/*!@.p-xl-1*/.p-xl-1.sc-gw-look-at-me{padding:0.25rem !important}/*!@.p-xl-2*/.p-xl-2.sc-gw-look-at-me{padding:0.5rem !important}/*!@.p-xl-3*/.p-xl-3.sc-gw-look-at-me{padding:1rem !important}/*!@.p-xl-4*/.p-xl-4.sc-gw-look-at-me{padding:1.5rem !important}/*!@.p-xl-5*/.p-xl-5.sc-gw-look-at-me{padding:3rem !important}/*!@.px-xl-0*/.px-xl-0.sc-gw-look-at-me{padding-right:0 !important;padding-left:0 !important}/*!@.px-xl-1*/.px-xl-1.sc-gw-look-at-me{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-xl-2*/.px-xl-2.sc-gw-look-at-me{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-xl-3*/.px-xl-3.sc-gw-look-at-me{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-xl-4*/.px-xl-4.sc-gw-look-at-me{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-xl-5*/.px-xl-5.sc-gw-look-at-me{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-xl-0*/.py-xl-0.sc-gw-look-at-me{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-xl-1*/.py-xl-1.sc-gw-look-at-me{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-xl-2*/.py-xl-2.sc-gw-look-at-me{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-xl-3*/.py-xl-3.sc-gw-look-at-me{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-xl-4*/.py-xl-4.sc-gw-look-at-me{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-xl-5*/.py-xl-5.sc-gw-look-at-me{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-xl-0*/.pt-xl-0.sc-gw-look-at-me{padding-top:0 !important}/*!@.pt-xl-1*/.pt-xl-1.sc-gw-look-at-me{padding-top:0.25rem !important}/*!@.pt-xl-2*/.pt-xl-2.sc-gw-look-at-me{padding-top:0.5rem !important}/*!@.pt-xl-3*/.pt-xl-3.sc-gw-look-at-me{padding-top:1rem !important}/*!@.pt-xl-4*/.pt-xl-4.sc-gw-look-at-me{padding-top:1.5rem !important}/*!@.pt-xl-5*/.pt-xl-5.sc-gw-look-at-me{padding-top:3rem !important}/*!@.pe-xl-0*/.pe-xl-0.sc-gw-look-at-me{padding-right:0 !important}/*!@.pe-xl-1*/.pe-xl-1.sc-gw-look-at-me{padding-right:0.25rem !important}/*!@.pe-xl-2*/.pe-xl-2.sc-gw-look-at-me{padding-right:0.5rem !important}/*!@.pe-xl-3*/.pe-xl-3.sc-gw-look-at-me{padding-right:1rem !important}/*!@.pe-xl-4*/.pe-xl-4.sc-gw-look-at-me{padding-right:1.5rem !important}/*!@.pe-xl-5*/.pe-xl-5.sc-gw-look-at-me{padding-right:3rem !important}/*!@.pb-xl-0*/.pb-xl-0.sc-gw-look-at-me{padding-bottom:0 !important}/*!@.pb-xl-1*/.pb-xl-1.sc-gw-look-at-me{padding-bottom:0.25rem !important}/*!@.pb-xl-2*/.pb-xl-2.sc-gw-look-at-me{padding-bottom:0.5rem !important}/*!@.pb-xl-3*/.pb-xl-3.sc-gw-look-at-me{padding-bottom:1rem !important}/*!@.pb-xl-4*/.pb-xl-4.sc-gw-look-at-me{padding-bottom:1.5rem !important}/*!@.pb-xl-5*/.pb-xl-5.sc-gw-look-at-me{padding-bottom:3rem !important}/*!@.ps-xl-0*/.ps-xl-0.sc-gw-look-at-me{padding-left:0 !important}/*!@.ps-xl-1*/.ps-xl-1.sc-gw-look-at-me{padding-left:0.25rem !important}/*!@.ps-xl-2*/.ps-xl-2.sc-gw-look-at-me{padding-left:0.5rem !important}/*!@.ps-xl-3*/.ps-xl-3.sc-gw-look-at-me{padding-left:1rem !important}/*!@.ps-xl-4*/.ps-xl-4.sc-gw-look-at-me{padding-left:1.5rem !important}/*!@.ps-xl-5*/.ps-xl-5.sc-gw-look-at-me{padding-left:3rem !important}}@media (min-width: 1400px){/*!@.d-xxl-inline*/.d-xxl-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-xxl-inline-block*/.d-xxl-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-xxl-block*/.d-xxl-block.sc-gw-look-at-me{display:block !important}/*!@.d-xxl-grid*/.d-xxl-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-xxl-table*/.d-xxl-table.sc-gw-look-at-me{display:table !important}/*!@.d-xxl-table-row*/.d-xxl-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-xxl-table-cell*/.d-xxl-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-xxl-flex*/.d-xxl-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-xxl-inline-flex*/.d-xxl-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-xxl-none*/.d-xxl-none.sc-gw-look-at-me{display:none !important}/*!@.flex-xxl-fill*/.flex-xxl-fill.sc-gw-look-at-me{flex:1 1 auto !important}/*!@.flex-xxl-row*/.flex-xxl-row.sc-gw-look-at-me{flex-direction:row !important}/*!@.flex-xxl-column*/.flex-xxl-column.sc-gw-look-at-me{flex-direction:column !important}/*!@.flex-xxl-row-reverse*/.flex-xxl-row-reverse.sc-gw-look-at-me{flex-direction:row-reverse !important}/*!@.flex-xxl-column-reverse*/.flex-xxl-column-reverse.sc-gw-look-at-me{flex-direction:column-reverse !important}/*!@.flex-xxl-grow-0*/.flex-xxl-grow-0.sc-gw-look-at-me{flex-grow:0 !important}/*!@.flex-xxl-grow-1*/.flex-xxl-grow-1.sc-gw-look-at-me{flex-grow:1 !important}/*!@.flex-xxl-shrink-0*/.flex-xxl-shrink-0.sc-gw-look-at-me{flex-shrink:0 !important}/*!@.flex-xxl-shrink-1*/.flex-xxl-shrink-1.sc-gw-look-at-me{flex-shrink:1 !important}/*!@.flex-xxl-wrap*/.flex-xxl-wrap.sc-gw-look-at-me{flex-wrap:wrap !important}/*!@.flex-xxl-nowrap*/.flex-xxl-nowrap.sc-gw-look-at-me{flex-wrap:nowrap !important}/*!@.flex-xxl-wrap-reverse*/.flex-xxl-wrap-reverse.sc-gw-look-at-me{flex-wrap:wrap-reverse !important}/*!@.justify-content-xxl-start*/.justify-content-xxl-start.sc-gw-look-at-me{justify-content:flex-start !important}/*!@.justify-content-xxl-end*/.justify-content-xxl-end.sc-gw-look-at-me{justify-content:flex-end !important}/*!@.justify-content-xxl-center*/.justify-content-xxl-center.sc-gw-look-at-me{justify-content:center !important}/*!@.justify-content-xxl-between*/.justify-content-xxl-between.sc-gw-look-at-me{justify-content:space-between !important}/*!@.justify-content-xxl-around*/.justify-content-xxl-around.sc-gw-look-at-me{justify-content:space-around !important}/*!@.justify-content-xxl-evenly*/.justify-content-xxl-evenly.sc-gw-look-at-me{justify-content:space-evenly !important}/*!@.align-items-xxl-start*/.align-items-xxl-start.sc-gw-look-at-me{align-items:flex-start !important}/*!@.align-items-xxl-end*/.align-items-xxl-end.sc-gw-look-at-me{align-items:flex-end !important}/*!@.align-items-xxl-center*/.align-items-xxl-center.sc-gw-look-at-me{align-items:center !important}/*!@.align-items-xxl-baseline*/.align-items-xxl-baseline.sc-gw-look-at-me{align-items:baseline !important}/*!@.align-items-xxl-stretch*/.align-items-xxl-stretch.sc-gw-look-at-me{align-items:stretch !important}/*!@.align-content-xxl-start*/.align-content-xxl-start.sc-gw-look-at-me{align-content:flex-start !important}/*!@.align-content-xxl-end*/.align-content-xxl-end.sc-gw-look-at-me{align-content:flex-end !important}/*!@.align-content-xxl-center*/.align-content-xxl-center.sc-gw-look-at-me{align-content:center !important}/*!@.align-content-xxl-between*/.align-content-xxl-between.sc-gw-look-at-me{align-content:space-between !important}/*!@.align-content-xxl-around*/.align-content-xxl-around.sc-gw-look-at-me{align-content:space-around !important}/*!@.align-content-xxl-stretch*/.align-content-xxl-stretch.sc-gw-look-at-me{align-content:stretch !important}/*!@.align-self-xxl-auto*/.align-self-xxl-auto.sc-gw-look-at-me{align-self:auto !important}/*!@.align-self-xxl-start*/.align-self-xxl-start.sc-gw-look-at-me{align-self:flex-start !important}/*!@.align-self-xxl-end*/.align-self-xxl-end.sc-gw-look-at-me{align-self:flex-end !important}/*!@.align-self-xxl-center*/.align-self-xxl-center.sc-gw-look-at-me{align-self:center !important}/*!@.align-self-xxl-baseline*/.align-self-xxl-baseline.sc-gw-look-at-me{align-self:baseline !important}/*!@.align-self-xxl-stretch*/.align-self-xxl-stretch.sc-gw-look-at-me{align-self:stretch !important}/*!@.order-xxl-first*/.order-xxl-first.sc-gw-look-at-me{order:-1 !important}/*!@.order-xxl-0*/.order-xxl-0.sc-gw-look-at-me{order:0 !important}/*!@.order-xxl-1*/.order-xxl-1.sc-gw-look-at-me{order:1 !important}/*!@.order-xxl-2*/.order-xxl-2.sc-gw-look-at-me{order:2 !important}/*!@.order-xxl-3*/.order-xxl-3.sc-gw-look-at-me{order:3 !important}/*!@.order-xxl-4*/.order-xxl-4.sc-gw-look-at-me{order:4 !important}/*!@.order-xxl-5*/.order-xxl-5.sc-gw-look-at-me{order:5 !important}/*!@.order-xxl-last*/.order-xxl-last.sc-gw-look-at-me{order:6 !important}/*!@.m-xxl-0*/.m-xxl-0.sc-gw-look-at-me{margin:0 !important}/*!@.m-xxl-1*/.m-xxl-1.sc-gw-look-at-me{margin:0.25rem !important}/*!@.m-xxl-2*/.m-xxl-2.sc-gw-look-at-me{margin:0.5rem !important}/*!@.m-xxl-3*/.m-xxl-3.sc-gw-look-at-me{margin:1rem !important}/*!@.m-xxl-4*/.m-xxl-4.sc-gw-look-at-me{margin:1.5rem !important}/*!@.m-xxl-5*/.m-xxl-5.sc-gw-look-at-me{margin:3rem !important}/*!@.m-xxl-auto*/.m-xxl-auto.sc-gw-look-at-me{margin:auto !important}/*!@.mx-xxl-0*/.mx-xxl-0.sc-gw-look-at-me{margin-right:0 !important;margin-left:0 !important}/*!@.mx-xxl-1*/.mx-xxl-1.sc-gw-look-at-me{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-xxl-2*/.mx-xxl-2.sc-gw-look-at-me{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-xxl-3*/.mx-xxl-3.sc-gw-look-at-me{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-xxl-4*/.mx-xxl-4.sc-gw-look-at-me{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-xxl-5*/.mx-xxl-5.sc-gw-look-at-me{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-xxl-auto*/.mx-xxl-auto.sc-gw-look-at-me{margin-right:auto !important;margin-left:auto !important}/*!@.my-xxl-0*/.my-xxl-0.sc-gw-look-at-me{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-xxl-1*/.my-xxl-1.sc-gw-look-at-me{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-xxl-2*/.my-xxl-2.sc-gw-look-at-me{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-xxl-3*/.my-xxl-3.sc-gw-look-at-me{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-xxl-4*/.my-xxl-4.sc-gw-look-at-me{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-xxl-5*/.my-xxl-5.sc-gw-look-at-me{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-xxl-auto*/.my-xxl-auto.sc-gw-look-at-me{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-xxl-0*/.mt-xxl-0.sc-gw-look-at-me{margin-top:0 !important}/*!@.mt-xxl-1*/.mt-xxl-1.sc-gw-look-at-me{margin-top:0.25rem !important}/*!@.mt-xxl-2*/.mt-xxl-2.sc-gw-look-at-me{margin-top:0.5rem !important}/*!@.mt-xxl-3*/.mt-xxl-3.sc-gw-look-at-me{margin-top:1rem !important}/*!@.mt-xxl-4*/.mt-xxl-4.sc-gw-look-at-me{margin-top:1.5rem !important}/*!@.mt-xxl-5*/.mt-xxl-5.sc-gw-look-at-me{margin-top:3rem !important}/*!@.mt-xxl-auto*/.mt-xxl-auto.sc-gw-look-at-me{margin-top:auto !important}/*!@.me-xxl-0*/.me-xxl-0.sc-gw-look-at-me{margin-right:0 !important}/*!@.me-xxl-1*/.me-xxl-1.sc-gw-look-at-me{margin-right:0.25rem !important}/*!@.me-xxl-2*/.me-xxl-2.sc-gw-look-at-me{margin-right:0.5rem !important}/*!@.me-xxl-3*/.me-xxl-3.sc-gw-look-at-me{margin-right:1rem !important}/*!@.me-xxl-4*/.me-xxl-4.sc-gw-look-at-me{margin-right:1.5rem !important}/*!@.me-xxl-5*/.me-xxl-5.sc-gw-look-at-me{margin-right:3rem !important}/*!@.me-xxl-auto*/.me-xxl-auto.sc-gw-look-at-me{margin-right:auto !important}/*!@.mb-xxl-0*/.mb-xxl-0.sc-gw-look-at-me{margin-bottom:0 !important}/*!@.mb-xxl-1*/.mb-xxl-1.sc-gw-look-at-me{margin-bottom:0.25rem !important}/*!@.mb-xxl-2*/.mb-xxl-2.sc-gw-look-at-me{margin-bottom:0.5rem !important}/*!@.mb-xxl-3*/.mb-xxl-3.sc-gw-look-at-me{margin-bottom:1rem !important}/*!@.mb-xxl-4*/.mb-xxl-4.sc-gw-look-at-me{margin-bottom:1.5rem !important}/*!@.mb-xxl-5*/.mb-xxl-5.sc-gw-look-at-me{margin-bottom:3rem !important}/*!@.mb-xxl-auto*/.mb-xxl-auto.sc-gw-look-at-me{margin-bottom:auto !important}/*!@.ms-xxl-0*/.ms-xxl-0.sc-gw-look-at-me{margin-left:0 !important}/*!@.ms-xxl-1*/.ms-xxl-1.sc-gw-look-at-me{margin-left:0.25rem !important}/*!@.ms-xxl-2*/.ms-xxl-2.sc-gw-look-at-me{margin-left:0.5rem !important}/*!@.ms-xxl-3*/.ms-xxl-3.sc-gw-look-at-me{margin-left:1rem !important}/*!@.ms-xxl-4*/.ms-xxl-4.sc-gw-look-at-me{margin-left:1.5rem !important}/*!@.ms-xxl-5*/.ms-xxl-5.sc-gw-look-at-me{margin-left:3rem !important}/*!@.ms-xxl-auto*/.ms-xxl-auto.sc-gw-look-at-me{margin-left:auto !important}/*!@.p-xxl-0*/.p-xxl-0.sc-gw-look-at-me{padding:0 !important}/*!@.p-xxl-1*/.p-xxl-1.sc-gw-look-at-me{padding:0.25rem !important}/*!@.p-xxl-2*/.p-xxl-2.sc-gw-look-at-me{padding:0.5rem !important}/*!@.p-xxl-3*/.p-xxl-3.sc-gw-look-at-me{padding:1rem !important}/*!@.p-xxl-4*/.p-xxl-4.sc-gw-look-at-me{padding:1.5rem !important}/*!@.p-xxl-5*/.p-xxl-5.sc-gw-look-at-me{padding:3rem !important}/*!@.px-xxl-0*/.px-xxl-0.sc-gw-look-at-me{padding-right:0 !important;padding-left:0 !important}/*!@.px-xxl-1*/.px-xxl-1.sc-gw-look-at-me{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-xxl-2*/.px-xxl-2.sc-gw-look-at-me{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-xxl-3*/.px-xxl-3.sc-gw-look-at-me{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-xxl-4*/.px-xxl-4.sc-gw-look-at-me{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-xxl-5*/.px-xxl-5.sc-gw-look-at-me{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-xxl-0*/.py-xxl-0.sc-gw-look-at-me{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-xxl-1*/.py-xxl-1.sc-gw-look-at-me{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-xxl-2*/.py-xxl-2.sc-gw-look-at-me{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-xxl-3*/.py-xxl-3.sc-gw-look-at-me{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-xxl-4*/.py-xxl-4.sc-gw-look-at-me{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-xxl-5*/.py-xxl-5.sc-gw-look-at-me{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-xxl-0*/.pt-xxl-0.sc-gw-look-at-me{padding-top:0 !important}/*!@.pt-xxl-1*/.pt-xxl-1.sc-gw-look-at-me{padding-top:0.25rem !important}/*!@.pt-xxl-2*/.pt-xxl-2.sc-gw-look-at-me{padding-top:0.5rem !important}/*!@.pt-xxl-3*/.pt-xxl-3.sc-gw-look-at-me{padding-top:1rem !important}/*!@.pt-xxl-4*/.pt-xxl-4.sc-gw-look-at-me{padding-top:1.5rem !important}/*!@.pt-xxl-5*/.pt-xxl-5.sc-gw-look-at-me{padding-top:3rem !important}/*!@.pe-xxl-0*/.pe-xxl-0.sc-gw-look-at-me{padding-right:0 !important}/*!@.pe-xxl-1*/.pe-xxl-1.sc-gw-look-at-me{padding-right:0.25rem !important}/*!@.pe-xxl-2*/.pe-xxl-2.sc-gw-look-at-me{padding-right:0.5rem !important}/*!@.pe-xxl-3*/.pe-xxl-3.sc-gw-look-at-me{padding-right:1rem !important}/*!@.pe-xxl-4*/.pe-xxl-4.sc-gw-look-at-me{padding-right:1.5rem !important}/*!@.pe-xxl-5*/.pe-xxl-5.sc-gw-look-at-me{padding-right:3rem !important}/*!@.pb-xxl-0*/.pb-xxl-0.sc-gw-look-at-me{padding-bottom:0 !important}/*!@.pb-xxl-1*/.pb-xxl-1.sc-gw-look-at-me{padding-bottom:0.25rem !important}/*!@.pb-xxl-2*/.pb-xxl-2.sc-gw-look-at-me{padding-bottom:0.5rem !important}/*!@.pb-xxl-3*/.pb-xxl-3.sc-gw-look-at-me{padding-bottom:1rem !important}/*!@.pb-xxl-4*/.pb-xxl-4.sc-gw-look-at-me{padding-bottom:1.5rem !important}/*!@.pb-xxl-5*/.pb-xxl-5.sc-gw-look-at-me{padding-bottom:3rem !important}/*!@.ps-xxl-0*/.ps-xxl-0.sc-gw-look-at-me{padding-left:0 !important}/*!@.ps-xxl-1*/.ps-xxl-1.sc-gw-look-at-me{padding-left:0.25rem !important}/*!@.ps-xxl-2*/.ps-xxl-2.sc-gw-look-at-me{padding-left:0.5rem !important}/*!@.ps-xxl-3*/.ps-xxl-3.sc-gw-look-at-me{padding-left:1rem !important}/*!@.ps-xxl-4*/.ps-xxl-4.sc-gw-look-at-me{padding-left:1.5rem !important}/*!@.ps-xxl-5*/.ps-xxl-5.sc-gw-look-at-me{padding-left:3rem !important}}@media print{/*!@.d-print-inline*/.d-print-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-print-inline-block*/.d-print-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-print-block*/.d-print-block.sc-gw-look-at-me{display:block !important}/*!@.d-print-grid*/.d-print-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-print-table*/.d-print-table.sc-gw-look-at-me{display:table !important}/*!@.d-print-table-row*/.d-print-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-print-table-cell*/.d-print-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-print-flex*/.d-print-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-print-inline-flex*/.d-print-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-print-none*/.d-print-none.sc-gw-look-at-me{display:none !important}}/*!@.clearfix::after*/.clearfix.sc-gw-look-at-me::after{display:block;clear:both;content:\"\"}/*!@.link-primary*/.link-primary.sc-gw-look-at-me{color:#0d6efd}/*!@.link-primary:hover,\n.link-primary:focus*/.link-primary.sc-gw-look-at-me:hover,.link-primary.sc-gw-look-at-me:focus{color:#0a58ca}/*!@.link-secondary*/.link-secondary.sc-gw-look-at-me{color:#6c757d}/*!@.link-secondary:hover,\n.link-secondary:focus*/.link-secondary.sc-gw-look-at-me:hover,.link-secondary.sc-gw-look-at-me:focus{color:#565e64}/*!@.link-success*/.link-success.sc-gw-look-at-me{color:#198754}/*!@.link-success:hover,\n.link-success:focus*/.link-success.sc-gw-look-at-me:hover,.link-success.sc-gw-look-at-me:focus{color:#146c43}/*!@.link-info*/.link-info.sc-gw-look-at-me{color:#0dcaf0}/*!@.link-info:hover,\n.link-info:focus*/.link-info.sc-gw-look-at-me:hover,.link-info.sc-gw-look-at-me:focus{color:#3dd5f3}/*!@.link-warning*/.link-warning.sc-gw-look-at-me{color:#ffc107}/*!@.link-warning:hover,\n.link-warning:focus*/.link-warning.sc-gw-look-at-me:hover,.link-warning.sc-gw-look-at-me:focus{color:#ffcd39}/*!@.link-danger*/.link-danger.sc-gw-look-at-me{color:#dc3545}/*!@.link-danger:hover,\n.link-danger:focus*/.link-danger.sc-gw-look-at-me:hover,.link-danger.sc-gw-look-at-me:focus{color:#b02a37}/*!@.link-light*/.link-light.sc-gw-look-at-me{color:#f8f9fa}/*!@.link-light:hover,\n.link-light:focus*/.link-light.sc-gw-look-at-me:hover,.link-light.sc-gw-look-at-me:focus{color:#f9fafb}/*!@.link-dark*/.link-dark.sc-gw-look-at-me{color:#212529}/*!@.link-dark:hover,\n.link-dark:focus*/.link-dark.sc-gw-look-at-me:hover,.link-dark.sc-gw-look-at-me:focus{color:#1a1e21}/*!@.ratio*/.ratio.sc-gw-look-at-me{position:relative;width:100%}/*!@.ratio::before*/.ratio.sc-gw-look-at-me::before{display:block;padding-top:var(--bs-aspect-ratio);content:\"\"}/*!@.ratio > **/.ratio.sc-gw-look-at-me>*.sc-gw-look-at-me{position:absolute;top:0;left:0;width:100%;height:100%}/*!@.ratio-1x1*/.ratio-1x1.sc-gw-look-at-me{--bs-aspect-ratio:100%}/*!@.ratio-4x3*/.ratio-4x3.sc-gw-look-at-me{--bs-aspect-ratio:calc(3 / 4 * 100%)}/*!@.ratio-16x9*/.ratio-16x9.sc-gw-look-at-me{--bs-aspect-ratio:calc(9 / 16 * 100%)}/*!@.ratio-21x9*/.ratio-21x9.sc-gw-look-at-me{--bs-aspect-ratio:calc(9 / 21 * 100%)}/*!@.fixed-top*/.fixed-top.sc-gw-look-at-me{position:fixed;top:0;right:0;left:0;z-index:1030}/*!@.fixed-bottom*/.fixed-bottom.sc-gw-look-at-me{position:fixed;right:0;bottom:0;left:0;z-index:1030}/*!@.sticky-top*/.sticky-top.sc-gw-look-at-me{position:-webkit-sticky;position:sticky;top:0;z-index:1020}@media (min-width: 576px){/*!@.sticky-sm-top*/.sticky-sm-top.sc-gw-look-at-me{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}@media (min-width: 768px){/*!@.sticky-md-top*/.sticky-md-top.sc-gw-look-at-me{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}@media (min-width: 992px){/*!@.sticky-lg-top*/.sticky-lg-top.sc-gw-look-at-me{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}@media (min-width: 1200px){/*!@.sticky-xl-top*/.sticky-xl-top.sc-gw-look-at-me{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}@media (min-width: 1400px){/*!@.sticky-xxl-top*/.sticky-xxl-top.sc-gw-look-at-me{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}/*!@.visually-hidden,\n.visually-hidden-focusable:not(:focus):not(:focus-within)*/.visually-hidden.sc-gw-look-at-me,.visually-hidden-focusable.sc-gw-look-at-me:not(:focus):not(:focus-within){position:absolute !important;width:1px !important;height:1px !important;padding:0 !important;margin:-1px !important;overflow:hidden !important;clip:rect(0, 0, 0, 0) !important;white-space:nowrap !important;border:0 !important}/*!@.stretched-link::after*/.stretched-link.sc-gw-look-at-me::after{position:absolute;top:0;right:0;bottom:0;left:0;z-index:1;content:\"\"}/*!@.text-truncate*/.text-truncate.sc-gw-look-at-me{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}/*!@.align-baseline*/.align-baseline.sc-gw-look-at-me{vertical-align:baseline !important}/*!@.align-top*/.align-top.sc-gw-look-at-me{vertical-align:top !important}/*!@.align-middle*/.align-middle.sc-gw-look-at-me{vertical-align:middle !important}/*!@.align-bottom*/.align-bottom.sc-gw-look-at-me{vertical-align:bottom !important}/*!@.align-text-bottom*/.align-text-bottom.sc-gw-look-at-me{vertical-align:text-bottom !important}/*!@.align-text-top*/.align-text-top.sc-gw-look-at-me{vertical-align:text-top !important}/*!@.float-start*/.float-start.sc-gw-look-at-me{float:left !important}/*!@.float-end*/.float-end.sc-gw-look-at-me{float:right !important}/*!@.float-none*/.float-none.sc-gw-look-at-me{float:none !important}/*!@.overflow-auto*/.overflow-auto.sc-gw-look-at-me{overflow:auto !important}/*!@.overflow-hidden*/.overflow-hidden.sc-gw-look-at-me{overflow:hidden !important}/*!@.overflow-visible*/.overflow-visible.sc-gw-look-at-me{overflow:visible !important}/*!@.overflow-scroll*/.overflow-scroll.sc-gw-look-at-me{overflow:scroll !important}/*!@.d-inline*/.d-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-inline-block*/.d-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-block*/.d-block.sc-gw-look-at-me{display:block !important}/*!@.d-grid*/.d-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-table*/.d-table.sc-gw-look-at-me{display:table !important}/*!@.d-table-row*/.d-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-table-cell*/.d-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-flex*/.d-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-inline-flex*/.d-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-none*/.d-none.sc-gw-look-at-me{display:none !important}/*!@.shadow*/.shadow.sc-gw-look-at-me{box-shadow:0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important}/*!@.shadow-sm*/.shadow-sm.sc-gw-look-at-me{box-shadow:0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important}/*!@.shadow-lg*/.shadow-lg.sc-gw-look-at-me{box-shadow:0 1rem 3rem rgba(0, 0, 0, 0.175) !important}/*!@.shadow-none*/.shadow-none.sc-gw-look-at-me{box-shadow:none !important}/*!@.position-static*/.position-static.sc-gw-look-at-me{position:static !important}/*!@.position-relative*/.position-relative.sc-gw-look-at-me{position:relative !important}/*!@.position-absolute*/.position-absolute.sc-gw-look-at-me{position:absolute !important}/*!@.position-fixed*/.position-fixed.sc-gw-look-at-me{position:fixed !important}/*!@.position-sticky*/.position-sticky.sc-gw-look-at-me{position:-webkit-sticky !important;position:sticky !important}/*!@.top-0*/.top-0.sc-gw-look-at-me{top:0 !important}/*!@.top-50*/.top-50.sc-gw-look-at-me{top:50% !important}/*!@.top-100*/.top-100.sc-gw-look-at-me{top:100% !important}/*!@.bottom-0*/.bottom-0.sc-gw-look-at-me{bottom:0 !important}/*!@.bottom-50*/.bottom-50.sc-gw-look-at-me{bottom:50% !important}/*!@.bottom-100*/.bottom-100.sc-gw-look-at-me{bottom:100% !important}/*!@.start-0*/.start-0.sc-gw-look-at-me{left:0 !important}/*!@.start-50*/.start-50.sc-gw-look-at-me{left:50% !important}/*!@.start-100*/.start-100.sc-gw-look-at-me{left:100% !important}/*!@.end-0*/.end-0.sc-gw-look-at-me{right:0 !important}/*!@.end-50*/.end-50.sc-gw-look-at-me{right:50% !important}/*!@.end-100*/.end-100.sc-gw-look-at-me{right:100% !important}/*!@.translate-middle*/.translate-middle.sc-gw-look-at-me{transform:translate(-50%, -50%) !important}/*!@.translate-middle-x*/.translate-middle-x.sc-gw-look-at-me{transform:translateX(-50%) !important}/*!@.translate-middle-y*/.translate-middle-y.sc-gw-look-at-me{transform:translateY(-50%) !important}/*!@.border*/.border.sc-gw-look-at-me{border:1px solid #dee2e6 !important}/*!@.border-0*/.border-0.sc-gw-look-at-me{border:0 !important}/*!@.border-top*/.border-top.sc-gw-look-at-me{border-top:1px solid #dee2e6 !important}/*!@.border-top-0*/.border-top-0.sc-gw-look-at-me{border-top:0 !important}/*!@.border-end*/.border-end.sc-gw-look-at-me{border-right:1px solid #dee2e6 !important}/*!@.border-end-0*/.border-end-0.sc-gw-look-at-me{border-right:0 !important}/*!@.border-bottom*/.border-bottom.sc-gw-look-at-me{border-bottom:1px solid #dee2e6 !important}/*!@.border-bottom-0*/.border-bottom-0.sc-gw-look-at-me{border-bottom:0 !important}/*!@.border-start*/.border-start.sc-gw-look-at-me{border-left:1px solid #dee2e6 !important}/*!@.border-start-0*/.border-start-0.sc-gw-look-at-me{border-left:0 !important}/*!@.border-primary*/.border-primary.sc-gw-look-at-me{border-color:#0d6efd !important}/*!@.border-secondary*/.border-secondary.sc-gw-look-at-me{border-color:#6c757d !important}/*!@.border-success*/.border-success.sc-gw-look-at-me{border-color:#198754 !important}/*!@.border-info*/.border-info.sc-gw-look-at-me{border-color:#0dcaf0 !important}/*!@.border-warning*/.border-warning.sc-gw-look-at-me{border-color:#ffc107 !important}/*!@.border-danger*/.border-danger.sc-gw-look-at-me{border-color:#dc3545 !important}/*!@.border-light*/.border-light.sc-gw-look-at-me{border-color:#f8f9fa !important}/*!@.border-dark*/.border-dark.sc-gw-look-at-me{border-color:#212529 !important}/*!@.border-white*/.border-white.sc-gw-look-at-me{border-color:#fff !important}/*!@.border-1*/.border-1.sc-gw-look-at-me{border-width:1px !important}/*!@.border-2*/.border-2.sc-gw-look-at-me{border-width:2px !important}/*!@.border-3*/.border-3.sc-gw-look-at-me{border-width:3px !important}/*!@.border-4*/.border-4.sc-gw-look-at-me{border-width:4px !important}/*!@.border-5*/.border-5.sc-gw-look-at-me{border-width:5px !important}/*!@.w-25*/.w-25.sc-gw-look-at-me{width:25% !important}/*!@.w-50*/.w-50.sc-gw-look-at-me{width:50% !important}/*!@.w-75*/.w-75.sc-gw-look-at-me{width:75% !important}/*!@.w-100*/.w-100.sc-gw-look-at-me{width:100% !important}/*!@.w-auto*/.w-auto.sc-gw-look-at-me{width:auto !important}/*!@.mw-100*/.mw-100.sc-gw-look-at-me{max-width:100% !important}/*!@.vw-100*/.vw-100.sc-gw-look-at-me{width:100vw !important}/*!@.min-vw-100*/.min-vw-100.sc-gw-look-at-me{min-width:100vw !important}/*!@.h-25*/.h-25.sc-gw-look-at-me{height:25% !important}/*!@.h-50*/.h-50.sc-gw-look-at-me{height:50% !important}/*!@.h-75*/.h-75.sc-gw-look-at-me{height:75% !important}/*!@.h-100*/.h-100.sc-gw-look-at-me{height:100% !important}/*!@.h-auto*/.h-auto.sc-gw-look-at-me{height:auto !important}/*!@.mh-100*/.mh-100.sc-gw-look-at-me{max-height:100% !important}/*!@.vh-100*/.vh-100.sc-gw-look-at-me{height:100vh !important}/*!@.min-vh-100*/.min-vh-100.sc-gw-look-at-me{min-height:100vh !important}/*!@.flex-fill*/.flex-fill.sc-gw-look-at-me{flex:1 1 auto !important}/*!@.flex-row*/.flex-row.sc-gw-look-at-me{flex-direction:row !important}/*!@.flex-column*/.flex-column.sc-gw-look-at-me{flex-direction:column !important}/*!@.flex-row-reverse*/.flex-row-reverse.sc-gw-look-at-me{flex-direction:row-reverse !important}/*!@.flex-column-reverse*/.flex-column-reverse.sc-gw-look-at-me{flex-direction:column-reverse !important}/*!@.flex-grow-0*/.flex-grow-0.sc-gw-look-at-me{flex-grow:0 !important}/*!@.flex-grow-1*/.flex-grow-1.sc-gw-look-at-me{flex-grow:1 !important}/*!@.flex-shrink-0*/.flex-shrink-0.sc-gw-look-at-me{flex-shrink:0 !important}/*!@.flex-shrink-1*/.flex-shrink-1.sc-gw-look-at-me{flex-shrink:1 !important}/*!@.flex-wrap*/.flex-wrap.sc-gw-look-at-me{flex-wrap:wrap !important}/*!@.flex-nowrap*/.flex-nowrap.sc-gw-look-at-me{flex-wrap:nowrap !important}/*!@.flex-wrap-reverse*/.flex-wrap-reverse.sc-gw-look-at-me{flex-wrap:wrap-reverse !important}/*!@.gap-0*/.gap-0.sc-gw-look-at-me{gap:0 !important}/*!@.gap-1*/.gap-1.sc-gw-look-at-me{gap:0.25rem !important}/*!@.gap-2*/.gap-2.sc-gw-look-at-me{gap:0.5rem !important}/*!@.gap-3*/.gap-3.sc-gw-look-at-me{gap:1rem !important}/*!@.gap-4*/.gap-4.sc-gw-look-at-me{gap:1.5rem !important}/*!@.gap-5*/.gap-5.sc-gw-look-at-me{gap:3rem !important}/*!@.justify-content-start*/.justify-content-start.sc-gw-look-at-me{justify-content:flex-start !important}/*!@.justify-content-end*/.justify-content-end.sc-gw-look-at-me{justify-content:flex-end !important}/*!@.justify-content-center*/.justify-content-center.sc-gw-look-at-me{justify-content:center !important}/*!@.justify-content-between*/.justify-content-between.sc-gw-look-at-me{justify-content:space-between !important}/*!@.justify-content-around*/.justify-content-around.sc-gw-look-at-me{justify-content:space-around !important}/*!@.justify-content-evenly*/.justify-content-evenly.sc-gw-look-at-me{justify-content:space-evenly !important}/*!@.align-items-start*/.align-items-start.sc-gw-look-at-me{align-items:flex-start !important}/*!@.align-items-end*/.align-items-end.sc-gw-look-at-me{align-items:flex-end !important}/*!@.align-items-center*/.align-items-center.sc-gw-look-at-me{align-items:center !important}/*!@.align-items-baseline*/.align-items-baseline.sc-gw-look-at-me{align-items:baseline !important}/*!@.align-items-stretch*/.align-items-stretch.sc-gw-look-at-me{align-items:stretch !important}/*!@.align-content-start*/.align-content-start.sc-gw-look-at-me{align-content:flex-start !important}/*!@.align-content-end*/.align-content-end.sc-gw-look-at-me{align-content:flex-end !important}/*!@.align-content-center*/.align-content-center.sc-gw-look-at-me{align-content:center !important}/*!@.align-content-between*/.align-content-between.sc-gw-look-at-me{align-content:space-between !important}/*!@.align-content-around*/.align-content-around.sc-gw-look-at-me{align-content:space-around !important}/*!@.align-content-stretch*/.align-content-stretch.sc-gw-look-at-me{align-content:stretch !important}/*!@.align-self-auto*/.align-self-auto.sc-gw-look-at-me{align-self:auto !important}/*!@.align-self-start*/.align-self-start.sc-gw-look-at-me{align-self:flex-start !important}/*!@.align-self-end*/.align-self-end.sc-gw-look-at-me{align-self:flex-end !important}/*!@.align-self-center*/.align-self-center.sc-gw-look-at-me{align-self:center !important}/*!@.align-self-baseline*/.align-self-baseline.sc-gw-look-at-me{align-self:baseline !important}/*!@.align-self-stretch*/.align-self-stretch.sc-gw-look-at-me{align-self:stretch !important}/*!@.order-first*/.order-first.sc-gw-look-at-me{order:-1 !important}/*!@.order-0*/.order-0.sc-gw-look-at-me{order:0 !important}/*!@.order-1*/.order-1.sc-gw-look-at-me{order:1 !important}/*!@.order-2*/.order-2.sc-gw-look-at-me{order:2 !important}/*!@.order-3*/.order-3.sc-gw-look-at-me{order:3 !important}/*!@.order-4*/.order-4.sc-gw-look-at-me{order:4 !important}/*!@.order-5*/.order-5.sc-gw-look-at-me{order:5 !important}/*!@.order-last*/.order-last.sc-gw-look-at-me{order:6 !important}/*!@.m-0*/.m-0.sc-gw-look-at-me{margin:0 !important}/*!@.m-1*/.m-1.sc-gw-look-at-me{margin:0.25rem !important}/*!@.m-2*/.m-2.sc-gw-look-at-me{margin:0.5rem !important}/*!@.m-3*/.m-3.sc-gw-look-at-me{margin:1rem !important}/*!@.m-4*/.m-4.sc-gw-look-at-me{margin:1.5rem !important}/*!@.m-5*/.m-5.sc-gw-look-at-me{margin:3rem !important}/*!@.m-auto*/.m-auto.sc-gw-look-at-me{margin:auto !important}/*!@.mx-0*/.mx-0.sc-gw-look-at-me{margin-right:0 !important;margin-left:0 !important}/*!@.mx-1*/.mx-1.sc-gw-look-at-me{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-2*/.mx-2.sc-gw-look-at-me{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-3*/.mx-3.sc-gw-look-at-me{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-4*/.mx-4.sc-gw-look-at-me{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-5*/.mx-5.sc-gw-look-at-me{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-auto*/.mx-auto.sc-gw-look-at-me{margin-right:auto !important;margin-left:auto !important}/*!@.my-0*/.my-0.sc-gw-look-at-me{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-1*/.my-1.sc-gw-look-at-me{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-2*/.my-2.sc-gw-look-at-me{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-3*/.my-3.sc-gw-look-at-me{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-4*/.my-4.sc-gw-look-at-me{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-5*/.my-5.sc-gw-look-at-me{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-auto*/.my-auto.sc-gw-look-at-me{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-0*/.mt-0.sc-gw-look-at-me{margin-top:0 !important}/*!@.mt-1*/.mt-1.sc-gw-look-at-me{margin-top:0.25rem !important}/*!@.mt-2*/.mt-2.sc-gw-look-at-me{margin-top:0.5rem !important}/*!@.mt-3*/.mt-3.sc-gw-look-at-me{margin-top:1rem !important}/*!@.mt-4*/.mt-4.sc-gw-look-at-me{margin-top:1.5rem !important}/*!@.mt-5*/.mt-5.sc-gw-look-at-me{margin-top:3rem !important}/*!@.mt-auto*/.mt-auto.sc-gw-look-at-me{margin-top:auto !important}/*!@.me-0*/.me-0.sc-gw-look-at-me{margin-right:0 !important}/*!@.me-1*/.me-1.sc-gw-look-at-me{margin-right:0.25rem !important}/*!@.me-2*/.me-2.sc-gw-look-at-me{margin-right:0.5rem !important}/*!@.me-3*/.me-3.sc-gw-look-at-me{margin-right:1rem !important}/*!@.me-4*/.me-4.sc-gw-look-at-me{margin-right:1.5rem !important}/*!@.me-5*/.me-5.sc-gw-look-at-me{margin-right:3rem !important}/*!@.me-auto*/.me-auto.sc-gw-look-at-me{margin-right:auto !important}/*!@.mb-0*/.mb-0.sc-gw-look-at-me{margin-bottom:0 !important}/*!@.mb-1*/.mb-1.sc-gw-look-at-me{margin-bottom:0.25rem !important}/*!@.mb-2*/.mb-2.sc-gw-look-at-me{margin-bottom:0.5rem !important}/*!@.mb-3*/.mb-3.sc-gw-look-at-me{margin-bottom:1rem !important}/*!@.mb-4*/.mb-4.sc-gw-look-at-me{margin-bottom:1.5rem !important}/*!@.mb-5*/.mb-5.sc-gw-look-at-me{margin-bottom:3rem !important}/*!@.mb-auto*/.mb-auto.sc-gw-look-at-me{margin-bottom:auto !important}/*!@.ms-0*/.ms-0.sc-gw-look-at-me{margin-left:0 !important}/*!@.ms-1*/.ms-1.sc-gw-look-at-me{margin-left:0.25rem !important}/*!@.ms-2*/.ms-2.sc-gw-look-at-me{margin-left:0.5rem !important}/*!@.ms-3*/.ms-3.sc-gw-look-at-me{margin-left:1rem !important}/*!@.ms-4*/.ms-4.sc-gw-look-at-me{margin-left:1.5rem !important}/*!@.ms-5*/.ms-5.sc-gw-look-at-me{margin-left:3rem !important}/*!@.ms-auto*/.ms-auto.sc-gw-look-at-me{margin-left:auto !important}/*!@.p-0*/.p-0.sc-gw-look-at-me{padding:0 !important}/*!@.p-1*/.p-1.sc-gw-look-at-me{padding:0.25rem !important}/*!@.p-2*/.p-2.sc-gw-look-at-me{padding:0.5rem !important}/*!@.p-3*/.p-3.sc-gw-look-at-me{padding:1rem !important}/*!@.p-4*/.p-4.sc-gw-look-at-me{padding:1.5rem !important}/*!@.p-5*/.p-5.sc-gw-look-at-me{padding:3rem !important}/*!@.px-0*/.px-0.sc-gw-look-at-me{padding-right:0 !important;padding-left:0 !important}/*!@.px-1*/.px-1.sc-gw-look-at-me{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-2*/.px-2.sc-gw-look-at-me{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-3*/.px-3.sc-gw-look-at-me{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-4*/.px-4.sc-gw-look-at-me{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-5*/.px-5.sc-gw-look-at-me{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-0*/.py-0.sc-gw-look-at-me{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-1*/.py-1.sc-gw-look-at-me{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-2*/.py-2.sc-gw-look-at-me{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-3*/.py-3.sc-gw-look-at-me{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-4*/.py-4.sc-gw-look-at-me{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-5*/.py-5.sc-gw-look-at-me{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-0*/.pt-0.sc-gw-look-at-me{padding-top:0 !important}/*!@.pt-1*/.pt-1.sc-gw-look-at-me{padding-top:0.25rem !important}/*!@.pt-2*/.pt-2.sc-gw-look-at-me{padding-top:0.5rem !important}/*!@.pt-3*/.pt-3.sc-gw-look-at-me{padding-top:1rem !important}/*!@.pt-4*/.pt-4.sc-gw-look-at-me{padding-top:1.5rem !important}/*!@.pt-5*/.pt-5.sc-gw-look-at-me{padding-top:3rem !important}/*!@.pe-0*/.pe-0.sc-gw-look-at-me{padding-right:0 !important}/*!@.pe-1*/.pe-1.sc-gw-look-at-me{padding-right:0.25rem !important}/*!@.pe-2*/.pe-2.sc-gw-look-at-me{padding-right:0.5rem !important}/*!@.pe-3*/.pe-3.sc-gw-look-at-me{padding-right:1rem !important}/*!@.pe-4*/.pe-4.sc-gw-look-at-me{padding-right:1.5rem !important}/*!@.pe-5*/.pe-5.sc-gw-look-at-me{padding-right:3rem !important}/*!@.pb-0*/.pb-0.sc-gw-look-at-me{padding-bottom:0 !important}/*!@.pb-1*/.pb-1.sc-gw-look-at-me{padding-bottom:0.25rem !important}/*!@.pb-2*/.pb-2.sc-gw-look-at-me{padding-bottom:0.5rem !important}/*!@.pb-3*/.pb-3.sc-gw-look-at-me{padding-bottom:1rem !important}/*!@.pb-4*/.pb-4.sc-gw-look-at-me{padding-bottom:1.5rem !important}/*!@.pb-5*/.pb-5.sc-gw-look-at-me{padding-bottom:3rem !important}/*!@.ps-0*/.ps-0.sc-gw-look-at-me{padding-left:0 !important}/*!@.ps-1*/.ps-1.sc-gw-look-at-me{padding-left:0.25rem !important}/*!@.ps-2*/.ps-2.sc-gw-look-at-me{padding-left:0.5rem !important}/*!@.ps-3*/.ps-3.sc-gw-look-at-me{padding-left:1rem !important}/*!@.ps-4*/.ps-4.sc-gw-look-at-me{padding-left:1.5rem !important}/*!@.ps-5*/.ps-5.sc-gw-look-at-me{padding-left:3rem !important}/*!@.font-monospace*/.font-monospace.sc-gw-look-at-me{font-family:var(--bs-font-monospace) !important}/*!@.fs-1*/.fs-1.sc-gw-look-at-me{font-size:calc(1.375rem + 1.5vw) !important}/*!@.fs-2*/.fs-2.sc-gw-look-at-me{font-size:calc(1.325rem + 0.9vw) !important}/*!@.fs-3*/.fs-3.sc-gw-look-at-me{font-size:calc(1.3rem + 0.6vw) !important}/*!@.fs-4*/.fs-4.sc-gw-look-at-me{font-size:calc(1.275rem + 0.3vw) !important}/*!@.fs-5*/.fs-5.sc-gw-look-at-me{font-size:1.25rem !important}/*!@.fs-6*/.fs-6.sc-gw-look-at-me{font-size:1rem !important}/*!@.fst-italic*/.fst-italic.sc-gw-look-at-me{font-style:italic !important}/*!@.fst-normal*/.fst-normal.sc-gw-look-at-me{font-style:normal !important}/*!@.fw-light*/.fw-light.sc-gw-look-at-me{font-weight:300 !important}/*!@.fw-lighter*/.fw-lighter.sc-gw-look-at-me{font-weight:lighter !important}/*!@.fw-normal*/.fw-normal.sc-gw-look-at-me{font-weight:400 !important}/*!@.fw-bold*/.fw-bold.sc-gw-look-at-me{font-weight:700 !important}/*!@.fw-bolder*/.fw-bolder.sc-gw-look-at-me{font-weight:bolder !important}/*!@.lh-1*/.lh-1.sc-gw-look-at-me{line-height:1 !important}/*!@.lh-sm*/.lh-sm.sc-gw-look-at-me{line-height:1.25 !important}/*!@.lh-base*/.lh-base.sc-gw-look-at-me{line-height:1.5 !important}/*!@.lh-lg*/.lh-lg.sc-gw-look-at-me{line-height:2 !important}/*!@.text-start*/.text-start.sc-gw-look-at-me{text-align:left !important}/*!@.text-end*/.text-end.sc-gw-look-at-me{text-align:right !important}/*!@.text-center*/.text-center.sc-gw-look-at-me{text-align:center !important}/*!@.text-decoration-none*/.text-decoration-none.sc-gw-look-at-me{text-decoration:none !important}/*!@.text-decoration-underline*/.text-decoration-underline.sc-gw-look-at-me{text-decoration:underline !important}/*!@.text-decoration-line-through*/.text-decoration-line-through.sc-gw-look-at-me{text-decoration:line-through !important}/*!@.text-lowercase*/.text-lowercase.sc-gw-look-at-me{text-transform:lowercase !important}/*!@.text-uppercase*/.text-uppercase.sc-gw-look-at-me{text-transform:uppercase !important}/*!@.text-capitalize*/.text-capitalize.sc-gw-look-at-me{text-transform:capitalize !important}/*!@.text-wrap*/.text-wrap.sc-gw-look-at-me{white-space:normal !important}/*!@.text-nowrap*/.text-nowrap.sc-gw-look-at-me{white-space:nowrap !important}/*!@.text-break*/.text-break.sc-gw-look-at-me{word-wrap:break-word !important;word-break:break-word !important}/*!@.text-primary*/.text-primary.sc-gw-look-at-me{color:#0d6efd !important}/*!@.text-secondary*/.text-secondary.sc-gw-look-at-me{color:#6c757d !important}/*!@.text-success*/.text-success.sc-gw-look-at-me{color:#198754 !important}/*!@.text-info*/.text-info.sc-gw-look-at-me{color:#0dcaf0 !important}/*!@.text-warning*/.text-warning.sc-gw-look-at-me{color:#ffc107 !important}/*!@.text-danger*/.text-danger.sc-gw-look-at-me{color:#dc3545 !important}/*!@.text-light*/.text-light.sc-gw-look-at-me{color:#f8f9fa !important}/*!@.text-dark*/.text-dark.sc-gw-look-at-me{color:#212529 !important}/*!@.text-white*/.text-white.sc-gw-look-at-me{color:#fff !important}/*!@.text-body*/.text-body.sc-gw-look-at-me{color:#212529 !important}/*!@.text-muted*/.text-muted.sc-gw-look-at-me{color:#6c757d !important}/*!@.text-black-50*/.text-black-50.sc-gw-look-at-me{color:rgba(0, 0, 0, 0.5) !important}/*!@.text-white-50*/.text-white-50.sc-gw-look-at-me{color:rgba(255, 255, 255, 0.5) !important}/*!@.text-reset*/.text-reset.sc-gw-look-at-me{color:inherit !important}/*!@.bg-primary*/.bg-primary.sc-gw-look-at-me{background-color:#0d6efd !important}/*!@.bg-secondary*/.bg-secondary.sc-gw-look-at-me{background-color:#6c757d !important}/*!@.bg-success*/.bg-success.sc-gw-look-at-me{background-color:#198754 !important}/*!@.bg-info*/.bg-info.sc-gw-look-at-me{background-color:#0dcaf0 !important}/*!@.bg-warning*/.bg-warning.sc-gw-look-at-me{background-color:#ffc107 !important}/*!@.bg-danger*/.bg-danger.sc-gw-look-at-me{background-color:#dc3545 !important}/*!@.bg-light*/.bg-light.sc-gw-look-at-me{background-color:#f8f9fa !important}/*!@.bg-dark*/.bg-dark.sc-gw-look-at-me{background-color:#212529 !important}/*!@.bg-body*/.bg-body.sc-gw-look-at-me{background-color:#fff !important}/*!@.bg-white*/.bg-white.sc-gw-look-at-me{background-color:#fff !important}/*!@.bg-transparent*/.bg-transparent.sc-gw-look-at-me{background-color:transparent !important}/*!@.bg-gradient*/.bg-gradient.sc-gw-look-at-me{background-image:var(--bs-gradient) !important}/*!@.user-select-all*/.user-select-all.sc-gw-look-at-me{-webkit-user-select:all !important;-moz-user-select:all !important;user-select:all !important}/*!@.user-select-auto*/.user-select-auto.sc-gw-look-at-me{-webkit-user-select:auto !important;-moz-user-select:auto !important;user-select:auto !important}/*!@.user-select-none*/.user-select-none.sc-gw-look-at-me{-webkit-user-select:none !important;-moz-user-select:none !important;user-select:none !important}/*!@.pe-none*/.pe-none.sc-gw-look-at-me{pointer-events:none !important}/*!@.pe-auto*/.pe-auto.sc-gw-look-at-me{pointer-events:auto !important}/*!@.rounded*/.rounded.sc-gw-look-at-me{border-radius:0.25rem !important}/*!@.rounded-0*/.rounded-0.sc-gw-look-at-me{border-radius:0 !important}/*!@.rounded-1*/.rounded-1.sc-gw-look-at-me{border-radius:0.2rem !important}/*!@.rounded-2*/.rounded-2.sc-gw-look-at-me{border-radius:0.25rem !important}/*!@.rounded-3*/.rounded-3.sc-gw-look-at-me{border-radius:0.3rem !important}/*!@.rounded-circle*/.rounded-circle.sc-gw-look-at-me{border-radius:50% !important}/*!@.rounded-pill*/.rounded-pill.sc-gw-look-at-me{border-radius:50rem !important}/*!@.rounded-top*/.rounded-top.sc-gw-look-at-me{border-top-left-radius:0.25rem !important;border-top-right-radius:0.25rem !important}/*!@.rounded-end*/.rounded-end.sc-gw-look-at-me{border-top-right-radius:0.25rem !important;border-bottom-right-radius:0.25rem !important}/*!@.rounded-bottom*/.rounded-bottom.sc-gw-look-at-me{border-bottom-right-radius:0.25rem !important;border-bottom-left-radius:0.25rem !important}/*!@.rounded-start*/.rounded-start.sc-gw-look-at-me{border-bottom-left-radius:0.25rem !important;border-top-left-radius:0.25rem !important}/*!@.visible*/.visible.sc-gw-look-at-me{visibility:visible !important}/*!@.invisible*/.invisible.sc-gw-look-at-me{visibility:hidden !important}@media (min-width: 576px){/*!@.float-sm-start*/.float-sm-start.sc-gw-look-at-me{float:left !important}/*!@.float-sm-end*/.float-sm-end.sc-gw-look-at-me{float:right !important}/*!@.float-sm-none*/.float-sm-none.sc-gw-look-at-me{float:none !important}/*!@.d-sm-inline*/.d-sm-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-sm-inline-block*/.d-sm-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-sm-block*/.d-sm-block.sc-gw-look-at-me{display:block !important}/*!@.d-sm-grid*/.d-sm-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-sm-table*/.d-sm-table.sc-gw-look-at-me{display:table !important}/*!@.d-sm-table-row*/.d-sm-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-sm-table-cell*/.d-sm-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-sm-flex*/.d-sm-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-sm-inline-flex*/.d-sm-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-sm-none*/.d-sm-none.sc-gw-look-at-me{display:none !important}/*!@.flex-sm-fill*/.flex-sm-fill.sc-gw-look-at-me{flex:1 1 auto !important}/*!@.flex-sm-row*/.flex-sm-row.sc-gw-look-at-me{flex-direction:row !important}/*!@.flex-sm-column*/.flex-sm-column.sc-gw-look-at-me{flex-direction:column !important}/*!@.flex-sm-row-reverse*/.flex-sm-row-reverse.sc-gw-look-at-me{flex-direction:row-reverse !important}/*!@.flex-sm-column-reverse*/.flex-sm-column-reverse.sc-gw-look-at-me{flex-direction:column-reverse !important}/*!@.flex-sm-grow-0*/.flex-sm-grow-0.sc-gw-look-at-me{flex-grow:0 !important}/*!@.flex-sm-grow-1*/.flex-sm-grow-1.sc-gw-look-at-me{flex-grow:1 !important}/*!@.flex-sm-shrink-0*/.flex-sm-shrink-0.sc-gw-look-at-me{flex-shrink:0 !important}/*!@.flex-sm-shrink-1*/.flex-sm-shrink-1.sc-gw-look-at-me{flex-shrink:1 !important}/*!@.flex-sm-wrap*/.flex-sm-wrap.sc-gw-look-at-me{flex-wrap:wrap !important}/*!@.flex-sm-nowrap*/.flex-sm-nowrap.sc-gw-look-at-me{flex-wrap:nowrap !important}/*!@.flex-sm-wrap-reverse*/.flex-sm-wrap-reverse.sc-gw-look-at-me{flex-wrap:wrap-reverse !important}/*!@.gap-sm-0*/.gap-sm-0.sc-gw-look-at-me{gap:0 !important}/*!@.gap-sm-1*/.gap-sm-1.sc-gw-look-at-me{gap:0.25rem !important}/*!@.gap-sm-2*/.gap-sm-2.sc-gw-look-at-me{gap:0.5rem !important}/*!@.gap-sm-3*/.gap-sm-3.sc-gw-look-at-me{gap:1rem !important}/*!@.gap-sm-4*/.gap-sm-4.sc-gw-look-at-me{gap:1.5rem !important}/*!@.gap-sm-5*/.gap-sm-5.sc-gw-look-at-me{gap:3rem !important}/*!@.justify-content-sm-start*/.justify-content-sm-start.sc-gw-look-at-me{justify-content:flex-start !important}/*!@.justify-content-sm-end*/.justify-content-sm-end.sc-gw-look-at-me{justify-content:flex-end !important}/*!@.justify-content-sm-center*/.justify-content-sm-center.sc-gw-look-at-me{justify-content:center !important}/*!@.justify-content-sm-between*/.justify-content-sm-between.sc-gw-look-at-me{justify-content:space-between !important}/*!@.justify-content-sm-around*/.justify-content-sm-around.sc-gw-look-at-me{justify-content:space-around !important}/*!@.justify-content-sm-evenly*/.justify-content-sm-evenly.sc-gw-look-at-me{justify-content:space-evenly !important}/*!@.align-items-sm-start*/.align-items-sm-start.sc-gw-look-at-me{align-items:flex-start !important}/*!@.align-items-sm-end*/.align-items-sm-end.sc-gw-look-at-me{align-items:flex-end !important}/*!@.align-items-sm-center*/.align-items-sm-center.sc-gw-look-at-me{align-items:center !important}/*!@.align-items-sm-baseline*/.align-items-sm-baseline.sc-gw-look-at-me{align-items:baseline !important}/*!@.align-items-sm-stretch*/.align-items-sm-stretch.sc-gw-look-at-me{align-items:stretch !important}/*!@.align-content-sm-start*/.align-content-sm-start.sc-gw-look-at-me{align-content:flex-start !important}/*!@.align-content-sm-end*/.align-content-sm-end.sc-gw-look-at-me{align-content:flex-end !important}/*!@.align-content-sm-center*/.align-content-sm-center.sc-gw-look-at-me{align-content:center !important}/*!@.align-content-sm-between*/.align-content-sm-between.sc-gw-look-at-me{align-content:space-between !important}/*!@.align-content-sm-around*/.align-content-sm-around.sc-gw-look-at-me{align-content:space-around !important}/*!@.align-content-sm-stretch*/.align-content-sm-stretch.sc-gw-look-at-me{align-content:stretch !important}/*!@.align-self-sm-auto*/.align-self-sm-auto.sc-gw-look-at-me{align-self:auto !important}/*!@.align-self-sm-start*/.align-self-sm-start.sc-gw-look-at-me{align-self:flex-start !important}/*!@.align-self-sm-end*/.align-self-sm-end.sc-gw-look-at-me{align-self:flex-end !important}/*!@.align-self-sm-center*/.align-self-sm-center.sc-gw-look-at-me{align-self:center !important}/*!@.align-self-sm-baseline*/.align-self-sm-baseline.sc-gw-look-at-me{align-self:baseline !important}/*!@.align-self-sm-stretch*/.align-self-sm-stretch.sc-gw-look-at-me{align-self:stretch !important}/*!@.order-sm-first*/.order-sm-first.sc-gw-look-at-me{order:-1 !important}/*!@.order-sm-0*/.order-sm-0.sc-gw-look-at-me{order:0 !important}/*!@.order-sm-1*/.order-sm-1.sc-gw-look-at-me{order:1 !important}/*!@.order-sm-2*/.order-sm-2.sc-gw-look-at-me{order:2 !important}/*!@.order-sm-3*/.order-sm-3.sc-gw-look-at-me{order:3 !important}/*!@.order-sm-4*/.order-sm-4.sc-gw-look-at-me{order:4 !important}/*!@.order-sm-5*/.order-sm-5.sc-gw-look-at-me{order:5 !important}/*!@.order-sm-last*/.order-sm-last.sc-gw-look-at-me{order:6 !important}/*!@.m-sm-0*/.m-sm-0.sc-gw-look-at-me{margin:0 !important}/*!@.m-sm-1*/.m-sm-1.sc-gw-look-at-me{margin:0.25rem !important}/*!@.m-sm-2*/.m-sm-2.sc-gw-look-at-me{margin:0.5rem !important}/*!@.m-sm-3*/.m-sm-3.sc-gw-look-at-me{margin:1rem !important}/*!@.m-sm-4*/.m-sm-4.sc-gw-look-at-me{margin:1.5rem !important}/*!@.m-sm-5*/.m-sm-5.sc-gw-look-at-me{margin:3rem !important}/*!@.m-sm-auto*/.m-sm-auto.sc-gw-look-at-me{margin:auto !important}/*!@.mx-sm-0*/.mx-sm-0.sc-gw-look-at-me{margin-right:0 !important;margin-left:0 !important}/*!@.mx-sm-1*/.mx-sm-1.sc-gw-look-at-me{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-sm-2*/.mx-sm-2.sc-gw-look-at-me{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-sm-3*/.mx-sm-3.sc-gw-look-at-me{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-sm-4*/.mx-sm-4.sc-gw-look-at-me{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-sm-5*/.mx-sm-5.sc-gw-look-at-me{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-sm-auto*/.mx-sm-auto.sc-gw-look-at-me{margin-right:auto !important;margin-left:auto !important}/*!@.my-sm-0*/.my-sm-0.sc-gw-look-at-me{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-sm-1*/.my-sm-1.sc-gw-look-at-me{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-sm-2*/.my-sm-2.sc-gw-look-at-me{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-sm-3*/.my-sm-3.sc-gw-look-at-me{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-sm-4*/.my-sm-4.sc-gw-look-at-me{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-sm-5*/.my-sm-5.sc-gw-look-at-me{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-sm-auto*/.my-sm-auto.sc-gw-look-at-me{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-sm-0*/.mt-sm-0.sc-gw-look-at-me{margin-top:0 !important}/*!@.mt-sm-1*/.mt-sm-1.sc-gw-look-at-me{margin-top:0.25rem !important}/*!@.mt-sm-2*/.mt-sm-2.sc-gw-look-at-me{margin-top:0.5rem !important}/*!@.mt-sm-3*/.mt-sm-3.sc-gw-look-at-me{margin-top:1rem !important}/*!@.mt-sm-4*/.mt-sm-4.sc-gw-look-at-me{margin-top:1.5rem !important}/*!@.mt-sm-5*/.mt-sm-5.sc-gw-look-at-me{margin-top:3rem !important}/*!@.mt-sm-auto*/.mt-sm-auto.sc-gw-look-at-me{margin-top:auto !important}/*!@.me-sm-0*/.me-sm-0.sc-gw-look-at-me{margin-right:0 !important}/*!@.me-sm-1*/.me-sm-1.sc-gw-look-at-me{margin-right:0.25rem !important}/*!@.me-sm-2*/.me-sm-2.sc-gw-look-at-me{margin-right:0.5rem !important}/*!@.me-sm-3*/.me-sm-3.sc-gw-look-at-me{margin-right:1rem !important}/*!@.me-sm-4*/.me-sm-4.sc-gw-look-at-me{margin-right:1.5rem !important}/*!@.me-sm-5*/.me-sm-5.sc-gw-look-at-me{margin-right:3rem !important}/*!@.me-sm-auto*/.me-sm-auto.sc-gw-look-at-me{margin-right:auto !important}/*!@.mb-sm-0*/.mb-sm-0.sc-gw-look-at-me{margin-bottom:0 !important}/*!@.mb-sm-1*/.mb-sm-1.sc-gw-look-at-me{margin-bottom:0.25rem !important}/*!@.mb-sm-2*/.mb-sm-2.sc-gw-look-at-me{margin-bottom:0.5rem !important}/*!@.mb-sm-3*/.mb-sm-3.sc-gw-look-at-me{margin-bottom:1rem !important}/*!@.mb-sm-4*/.mb-sm-4.sc-gw-look-at-me{margin-bottom:1.5rem !important}/*!@.mb-sm-5*/.mb-sm-5.sc-gw-look-at-me{margin-bottom:3rem !important}/*!@.mb-sm-auto*/.mb-sm-auto.sc-gw-look-at-me{margin-bottom:auto !important}/*!@.ms-sm-0*/.ms-sm-0.sc-gw-look-at-me{margin-left:0 !important}/*!@.ms-sm-1*/.ms-sm-1.sc-gw-look-at-me{margin-left:0.25rem !important}/*!@.ms-sm-2*/.ms-sm-2.sc-gw-look-at-me{margin-left:0.5rem !important}/*!@.ms-sm-3*/.ms-sm-3.sc-gw-look-at-me{margin-left:1rem !important}/*!@.ms-sm-4*/.ms-sm-4.sc-gw-look-at-me{margin-left:1.5rem !important}/*!@.ms-sm-5*/.ms-sm-5.sc-gw-look-at-me{margin-left:3rem !important}/*!@.ms-sm-auto*/.ms-sm-auto.sc-gw-look-at-me{margin-left:auto !important}/*!@.p-sm-0*/.p-sm-0.sc-gw-look-at-me{padding:0 !important}/*!@.p-sm-1*/.p-sm-1.sc-gw-look-at-me{padding:0.25rem !important}/*!@.p-sm-2*/.p-sm-2.sc-gw-look-at-me{padding:0.5rem !important}/*!@.p-sm-3*/.p-sm-3.sc-gw-look-at-me{padding:1rem !important}/*!@.p-sm-4*/.p-sm-4.sc-gw-look-at-me{padding:1.5rem !important}/*!@.p-sm-5*/.p-sm-5.sc-gw-look-at-me{padding:3rem !important}/*!@.px-sm-0*/.px-sm-0.sc-gw-look-at-me{padding-right:0 !important;padding-left:0 !important}/*!@.px-sm-1*/.px-sm-1.sc-gw-look-at-me{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-sm-2*/.px-sm-2.sc-gw-look-at-me{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-sm-3*/.px-sm-3.sc-gw-look-at-me{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-sm-4*/.px-sm-4.sc-gw-look-at-me{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-sm-5*/.px-sm-5.sc-gw-look-at-me{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-sm-0*/.py-sm-0.sc-gw-look-at-me{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-sm-1*/.py-sm-1.sc-gw-look-at-me{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-sm-2*/.py-sm-2.sc-gw-look-at-me{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-sm-3*/.py-sm-3.sc-gw-look-at-me{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-sm-4*/.py-sm-4.sc-gw-look-at-me{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-sm-5*/.py-sm-5.sc-gw-look-at-me{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-sm-0*/.pt-sm-0.sc-gw-look-at-me{padding-top:0 !important}/*!@.pt-sm-1*/.pt-sm-1.sc-gw-look-at-me{padding-top:0.25rem !important}/*!@.pt-sm-2*/.pt-sm-2.sc-gw-look-at-me{padding-top:0.5rem !important}/*!@.pt-sm-3*/.pt-sm-3.sc-gw-look-at-me{padding-top:1rem !important}/*!@.pt-sm-4*/.pt-sm-4.sc-gw-look-at-me{padding-top:1.5rem !important}/*!@.pt-sm-5*/.pt-sm-5.sc-gw-look-at-me{padding-top:3rem !important}/*!@.pe-sm-0*/.pe-sm-0.sc-gw-look-at-me{padding-right:0 !important}/*!@.pe-sm-1*/.pe-sm-1.sc-gw-look-at-me{padding-right:0.25rem !important}/*!@.pe-sm-2*/.pe-sm-2.sc-gw-look-at-me{padding-right:0.5rem !important}/*!@.pe-sm-3*/.pe-sm-3.sc-gw-look-at-me{padding-right:1rem !important}/*!@.pe-sm-4*/.pe-sm-4.sc-gw-look-at-me{padding-right:1.5rem !important}/*!@.pe-sm-5*/.pe-sm-5.sc-gw-look-at-me{padding-right:3rem !important}/*!@.pb-sm-0*/.pb-sm-0.sc-gw-look-at-me{padding-bottom:0 !important}/*!@.pb-sm-1*/.pb-sm-1.sc-gw-look-at-me{padding-bottom:0.25rem !important}/*!@.pb-sm-2*/.pb-sm-2.sc-gw-look-at-me{padding-bottom:0.5rem !important}/*!@.pb-sm-3*/.pb-sm-3.sc-gw-look-at-me{padding-bottom:1rem !important}/*!@.pb-sm-4*/.pb-sm-4.sc-gw-look-at-me{padding-bottom:1.5rem !important}/*!@.pb-sm-5*/.pb-sm-5.sc-gw-look-at-me{padding-bottom:3rem !important}/*!@.ps-sm-0*/.ps-sm-0.sc-gw-look-at-me{padding-left:0 !important}/*!@.ps-sm-1*/.ps-sm-1.sc-gw-look-at-me{padding-left:0.25rem !important}/*!@.ps-sm-2*/.ps-sm-2.sc-gw-look-at-me{padding-left:0.5rem !important}/*!@.ps-sm-3*/.ps-sm-3.sc-gw-look-at-me{padding-left:1rem !important}/*!@.ps-sm-4*/.ps-sm-4.sc-gw-look-at-me{padding-left:1.5rem !important}/*!@.ps-sm-5*/.ps-sm-5.sc-gw-look-at-me{padding-left:3rem !important}/*!@.text-sm-start*/.text-sm-start.sc-gw-look-at-me{text-align:left !important}/*!@.text-sm-end*/.text-sm-end.sc-gw-look-at-me{text-align:right !important}/*!@.text-sm-center*/.text-sm-center.sc-gw-look-at-me{text-align:center !important}}@media (min-width: 768px){/*!@.float-md-start*/.float-md-start.sc-gw-look-at-me{float:left !important}/*!@.float-md-end*/.float-md-end.sc-gw-look-at-me{float:right !important}/*!@.float-md-none*/.float-md-none.sc-gw-look-at-me{float:none !important}/*!@.d-md-inline*/.d-md-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-md-inline-block*/.d-md-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-md-block*/.d-md-block.sc-gw-look-at-me{display:block !important}/*!@.d-md-grid*/.d-md-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-md-table*/.d-md-table.sc-gw-look-at-me{display:table !important}/*!@.d-md-table-row*/.d-md-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-md-table-cell*/.d-md-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-md-flex*/.d-md-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-md-inline-flex*/.d-md-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-md-none*/.d-md-none.sc-gw-look-at-me{display:none !important}/*!@.flex-md-fill*/.flex-md-fill.sc-gw-look-at-me{flex:1 1 auto !important}/*!@.flex-md-row*/.flex-md-row.sc-gw-look-at-me{flex-direction:row !important}/*!@.flex-md-column*/.flex-md-column.sc-gw-look-at-me{flex-direction:column !important}/*!@.flex-md-row-reverse*/.flex-md-row-reverse.sc-gw-look-at-me{flex-direction:row-reverse !important}/*!@.flex-md-column-reverse*/.flex-md-column-reverse.sc-gw-look-at-me{flex-direction:column-reverse !important}/*!@.flex-md-grow-0*/.flex-md-grow-0.sc-gw-look-at-me{flex-grow:0 !important}/*!@.flex-md-grow-1*/.flex-md-grow-1.sc-gw-look-at-me{flex-grow:1 !important}/*!@.flex-md-shrink-0*/.flex-md-shrink-0.sc-gw-look-at-me{flex-shrink:0 !important}/*!@.flex-md-shrink-1*/.flex-md-shrink-1.sc-gw-look-at-me{flex-shrink:1 !important}/*!@.flex-md-wrap*/.flex-md-wrap.sc-gw-look-at-me{flex-wrap:wrap !important}/*!@.flex-md-nowrap*/.flex-md-nowrap.sc-gw-look-at-me{flex-wrap:nowrap !important}/*!@.flex-md-wrap-reverse*/.flex-md-wrap-reverse.sc-gw-look-at-me{flex-wrap:wrap-reverse !important}/*!@.gap-md-0*/.gap-md-0.sc-gw-look-at-me{gap:0 !important}/*!@.gap-md-1*/.gap-md-1.sc-gw-look-at-me{gap:0.25rem !important}/*!@.gap-md-2*/.gap-md-2.sc-gw-look-at-me{gap:0.5rem !important}/*!@.gap-md-3*/.gap-md-3.sc-gw-look-at-me{gap:1rem !important}/*!@.gap-md-4*/.gap-md-4.sc-gw-look-at-me{gap:1.5rem !important}/*!@.gap-md-5*/.gap-md-5.sc-gw-look-at-me{gap:3rem !important}/*!@.justify-content-md-start*/.justify-content-md-start.sc-gw-look-at-me{justify-content:flex-start !important}/*!@.justify-content-md-end*/.justify-content-md-end.sc-gw-look-at-me{justify-content:flex-end !important}/*!@.justify-content-md-center*/.justify-content-md-center.sc-gw-look-at-me{justify-content:center !important}/*!@.justify-content-md-between*/.justify-content-md-between.sc-gw-look-at-me{justify-content:space-between !important}/*!@.justify-content-md-around*/.justify-content-md-around.sc-gw-look-at-me{justify-content:space-around !important}/*!@.justify-content-md-evenly*/.justify-content-md-evenly.sc-gw-look-at-me{justify-content:space-evenly !important}/*!@.align-items-md-start*/.align-items-md-start.sc-gw-look-at-me{align-items:flex-start !important}/*!@.align-items-md-end*/.align-items-md-end.sc-gw-look-at-me{align-items:flex-end !important}/*!@.align-items-md-center*/.align-items-md-center.sc-gw-look-at-me{align-items:center !important}/*!@.align-items-md-baseline*/.align-items-md-baseline.sc-gw-look-at-me{align-items:baseline !important}/*!@.align-items-md-stretch*/.align-items-md-stretch.sc-gw-look-at-me{align-items:stretch !important}/*!@.align-content-md-start*/.align-content-md-start.sc-gw-look-at-me{align-content:flex-start !important}/*!@.align-content-md-end*/.align-content-md-end.sc-gw-look-at-me{align-content:flex-end !important}/*!@.align-content-md-center*/.align-content-md-center.sc-gw-look-at-me{align-content:center !important}/*!@.align-content-md-between*/.align-content-md-between.sc-gw-look-at-me{align-content:space-between !important}/*!@.align-content-md-around*/.align-content-md-around.sc-gw-look-at-me{align-content:space-around !important}/*!@.align-content-md-stretch*/.align-content-md-stretch.sc-gw-look-at-me{align-content:stretch !important}/*!@.align-self-md-auto*/.align-self-md-auto.sc-gw-look-at-me{align-self:auto !important}/*!@.align-self-md-start*/.align-self-md-start.sc-gw-look-at-me{align-self:flex-start !important}/*!@.align-self-md-end*/.align-self-md-end.sc-gw-look-at-me{align-self:flex-end !important}/*!@.align-self-md-center*/.align-self-md-center.sc-gw-look-at-me{align-self:center !important}/*!@.align-self-md-baseline*/.align-self-md-baseline.sc-gw-look-at-me{align-self:baseline !important}/*!@.align-self-md-stretch*/.align-self-md-stretch.sc-gw-look-at-me{align-self:stretch !important}/*!@.order-md-first*/.order-md-first.sc-gw-look-at-me{order:-1 !important}/*!@.order-md-0*/.order-md-0.sc-gw-look-at-me{order:0 !important}/*!@.order-md-1*/.order-md-1.sc-gw-look-at-me{order:1 !important}/*!@.order-md-2*/.order-md-2.sc-gw-look-at-me{order:2 !important}/*!@.order-md-3*/.order-md-3.sc-gw-look-at-me{order:3 !important}/*!@.order-md-4*/.order-md-4.sc-gw-look-at-me{order:4 !important}/*!@.order-md-5*/.order-md-5.sc-gw-look-at-me{order:5 !important}/*!@.order-md-last*/.order-md-last.sc-gw-look-at-me{order:6 !important}/*!@.m-md-0*/.m-md-0.sc-gw-look-at-me{margin:0 !important}/*!@.m-md-1*/.m-md-1.sc-gw-look-at-me{margin:0.25rem !important}/*!@.m-md-2*/.m-md-2.sc-gw-look-at-me{margin:0.5rem !important}/*!@.m-md-3*/.m-md-3.sc-gw-look-at-me{margin:1rem !important}/*!@.m-md-4*/.m-md-4.sc-gw-look-at-me{margin:1.5rem !important}/*!@.m-md-5*/.m-md-5.sc-gw-look-at-me{margin:3rem !important}/*!@.m-md-auto*/.m-md-auto.sc-gw-look-at-me{margin:auto !important}/*!@.mx-md-0*/.mx-md-0.sc-gw-look-at-me{margin-right:0 !important;margin-left:0 !important}/*!@.mx-md-1*/.mx-md-1.sc-gw-look-at-me{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-md-2*/.mx-md-2.sc-gw-look-at-me{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-md-3*/.mx-md-3.sc-gw-look-at-me{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-md-4*/.mx-md-4.sc-gw-look-at-me{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-md-5*/.mx-md-5.sc-gw-look-at-me{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-md-auto*/.mx-md-auto.sc-gw-look-at-me{margin-right:auto !important;margin-left:auto !important}/*!@.my-md-0*/.my-md-0.sc-gw-look-at-me{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-md-1*/.my-md-1.sc-gw-look-at-me{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-md-2*/.my-md-2.sc-gw-look-at-me{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-md-3*/.my-md-3.sc-gw-look-at-me{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-md-4*/.my-md-4.sc-gw-look-at-me{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-md-5*/.my-md-5.sc-gw-look-at-me{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-md-auto*/.my-md-auto.sc-gw-look-at-me{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-md-0*/.mt-md-0.sc-gw-look-at-me{margin-top:0 !important}/*!@.mt-md-1*/.mt-md-1.sc-gw-look-at-me{margin-top:0.25rem !important}/*!@.mt-md-2*/.mt-md-2.sc-gw-look-at-me{margin-top:0.5rem !important}/*!@.mt-md-3*/.mt-md-3.sc-gw-look-at-me{margin-top:1rem !important}/*!@.mt-md-4*/.mt-md-4.sc-gw-look-at-me{margin-top:1.5rem !important}/*!@.mt-md-5*/.mt-md-5.sc-gw-look-at-me{margin-top:3rem !important}/*!@.mt-md-auto*/.mt-md-auto.sc-gw-look-at-me{margin-top:auto !important}/*!@.me-md-0*/.me-md-0.sc-gw-look-at-me{margin-right:0 !important}/*!@.me-md-1*/.me-md-1.sc-gw-look-at-me{margin-right:0.25rem !important}/*!@.me-md-2*/.me-md-2.sc-gw-look-at-me{margin-right:0.5rem !important}/*!@.me-md-3*/.me-md-3.sc-gw-look-at-me{margin-right:1rem !important}/*!@.me-md-4*/.me-md-4.sc-gw-look-at-me{margin-right:1.5rem !important}/*!@.me-md-5*/.me-md-5.sc-gw-look-at-me{margin-right:3rem !important}/*!@.me-md-auto*/.me-md-auto.sc-gw-look-at-me{margin-right:auto !important}/*!@.mb-md-0*/.mb-md-0.sc-gw-look-at-me{margin-bottom:0 !important}/*!@.mb-md-1*/.mb-md-1.sc-gw-look-at-me{margin-bottom:0.25rem !important}/*!@.mb-md-2*/.mb-md-2.sc-gw-look-at-me{margin-bottom:0.5rem !important}/*!@.mb-md-3*/.mb-md-3.sc-gw-look-at-me{margin-bottom:1rem !important}/*!@.mb-md-4*/.mb-md-4.sc-gw-look-at-me{margin-bottom:1.5rem !important}/*!@.mb-md-5*/.mb-md-5.sc-gw-look-at-me{margin-bottom:3rem !important}/*!@.mb-md-auto*/.mb-md-auto.sc-gw-look-at-me{margin-bottom:auto !important}/*!@.ms-md-0*/.ms-md-0.sc-gw-look-at-me{margin-left:0 !important}/*!@.ms-md-1*/.ms-md-1.sc-gw-look-at-me{margin-left:0.25rem !important}/*!@.ms-md-2*/.ms-md-2.sc-gw-look-at-me{margin-left:0.5rem !important}/*!@.ms-md-3*/.ms-md-3.sc-gw-look-at-me{margin-left:1rem !important}/*!@.ms-md-4*/.ms-md-4.sc-gw-look-at-me{margin-left:1.5rem !important}/*!@.ms-md-5*/.ms-md-5.sc-gw-look-at-me{margin-left:3rem !important}/*!@.ms-md-auto*/.ms-md-auto.sc-gw-look-at-me{margin-left:auto !important}/*!@.p-md-0*/.p-md-0.sc-gw-look-at-me{padding:0 !important}/*!@.p-md-1*/.p-md-1.sc-gw-look-at-me{padding:0.25rem !important}/*!@.p-md-2*/.p-md-2.sc-gw-look-at-me{padding:0.5rem !important}/*!@.p-md-3*/.p-md-3.sc-gw-look-at-me{padding:1rem !important}/*!@.p-md-4*/.p-md-4.sc-gw-look-at-me{padding:1.5rem !important}/*!@.p-md-5*/.p-md-5.sc-gw-look-at-me{padding:3rem !important}/*!@.px-md-0*/.px-md-0.sc-gw-look-at-me{padding-right:0 !important;padding-left:0 !important}/*!@.px-md-1*/.px-md-1.sc-gw-look-at-me{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-md-2*/.px-md-2.sc-gw-look-at-me{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-md-3*/.px-md-3.sc-gw-look-at-me{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-md-4*/.px-md-4.sc-gw-look-at-me{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-md-5*/.px-md-5.sc-gw-look-at-me{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-md-0*/.py-md-0.sc-gw-look-at-me{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-md-1*/.py-md-1.sc-gw-look-at-me{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-md-2*/.py-md-2.sc-gw-look-at-me{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-md-3*/.py-md-3.sc-gw-look-at-me{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-md-4*/.py-md-4.sc-gw-look-at-me{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-md-5*/.py-md-5.sc-gw-look-at-me{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-md-0*/.pt-md-0.sc-gw-look-at-me{padding-top:0 !important}/*!@.pt-md-1*/.pt-md-1.sc-gw-look-at-me{padding-top:0.25rem !important}/*!@.pt-md-2*/.pt-md-2.sc-gw-look-at-me{padding-top:0.5rem !important}/*!@.pt-md-3*/.pt-md-3.sc-gw-look-at-me{padding-top:1rem !important}/*!@.pt-md-4*/.pt-md-4.sc-gw-look-at-me{padding-top:1.5rem !important}/*!@.pt-md-5*/.pt-md-5.sc-gw-look-at-me{padding-top:3rem !important}/*!@.pe-md-0*/.pe-md-0.sc-gw-look-at-me{padding-right:0 !important}/*!@.pe-md-1*/.pe-md-1.sc-gw-look-at-me{padding-right:0.25rem !important}/*!@.pe-md-2*/.pe-md-2.sc-gw-look-at-me{padding-right:0.5rem !important}/*!@.pe-md-3*/.pe-md-3.sc-gw-look-at-me{padding-right:1rem !important}/*!@.pe-md-4*/.pe-md-4.sc-gw-look-at-me{padding-right:1.5rem !important}/*!@.pe-md-5*/.pe-md-5.sc-gw-look-at-me{padding-right:3rem !important}/*!@.pb-md-0*/.pb-md-0.sc-gw-look-at-me{padding-bottom:0 !important}/*!@.pb-md-1*/.pb-md-1.sc-gw-look-at-me{padding-bottom:0.25rem !important}/*!@.pb-md-2*/.pb-md-2.sc-gw-look-at-me{padding-bottom:0.5rem !important}/*!@.pb-md-3*/.pb-md-3.sc-gw-look-at-me{padding-bottom:1rem !important}/*!@.pb-md-4*/.pb-md-4.sc-gw-look-at-me{padding-bottom:1.5rem !important}/*!@.pb-md-5*/.pb-md-5.sc-gw-look-at-me{padding-bottom:3rem !important}/*!@.ps-md-0*/.ps-md-0.sc-gw-look-at-me{padding-left:0 !important}/*!@.ps-md-1*/.ps-md-1.sc-gw-look-at-me{padding-left:0.25rem !important}/*!@.ps-md-2*/.ps-md-2.sc-gw-look-at-me{padding-left:0.5rem !important}/*!@.ps-md-3*/.ps-md-3.sc-gw-look-at-me{padding-left:1rem !important}/*!@.ps-md-4*/.ps-md-4.sc-gw-look-at-me{padding-left:1.5rem !important}/*!@.ps-md-5*/.ps-md-5.sc-gw-look-at-me{padding-left:3rem !important}/*!@.text-md-start*/.text-md-start.sc-gw-look-at-me{text-align:left !important}/*!@.text-md-end*/.text-md-end.sc-gw-look-at-me{text-align:right !important}/*!@.text-md-center*/.text-md-center.sc-gw-look-at-me{text-align:center !important}}@media (min-width: 992px){/*!@.float-lg-start*/.float-lg-start.sc-gw-look-at-me{float:left !important}/*!@.float-lg-end*/.float-lg-end.sc-gw-look-at-me{float:right !important}/*!@.float-lg-none*/.float-lg-none.sc-gw-look-at-me{float:none !important}/*!@.d-lg-inline*/.d-lg-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-lg-inline-block*/.d-lg-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-lg-block*/.d-lg-block.sc-gw-look-at-me{display:block !important}/*!@.d-lg-grid*/.d-lg-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-lg-table*/.d-lg-table.sc-gw-look-at-me{display:table !important}/*!@.d-lg-table-row*/.d-lg-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-lg-table-cell*/.d-lg-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-lg-flex*/.d-lg-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-lg-inline-flex*/.d-lg-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-lg-none*/.d-lg-none.sc-gw-look-at-me{display:none !important}/*!@.flex-lg-fill*/.flex-lg-fill.sc-gw-look-at-me{flex:1 1 auto !important}/*!@.flex-lg-row*/.flex-lg-row.sc-gw-look-at-me{flex-direction:row !important}/*!@.flex-lg-column*/.flex-lg-column.sc-gw-look-at-me{flex-direction:column !important}/*!@.flex-lg-row-reverse*/.flex-lg-row-reverse.sc-gw-look-at-me{flex-direction:row-reverse !important}/*!@.flex-lg-column-reverse*/.flex-lg-column-reverse.sc-gw-look-at-me{flex-direction:column-reverse !important}/*!@.flex-lg-grow-0*/.flex-lg-grow-0.sc-gw-look-at-me{flex-grow:0 !important}/*!@.flex-lg-grow-1*/.flex-lg-grow-1.sc-gw-look-at-me{flex-grow:1 !important}/*!@.flex-lg-shrink-0*/.flex-lg-shrink-0.sc-gw-look-at-me{flex-shrink:0 !important}/*!@.flex-lg-shrink-1*/.flex-lg-shrink-1.sc-gw-look-at-me{flex-shrink:1 !important}/*!@.flex-lg-wrap*/.flex-lg-wrap.sc-gw-look-at-me{flex-wrap:wrap !important}/*!@.flex-lg-nowrap*/.flex-lg-nowrap.sc-gw-look-at-me{flex-wrap:nowrap !important}/*!@.flex-lg-wrap-reverse*/.flex-lg-wrap-reverse.sc-gw-look-at-me{flex-wrap:wrap-reverse !important}/*!@.gap-lg-0*/.gap-lg-0.sc-gw-look-at-me{gap:0 !important}/*!@.gap-lg-1*/.gap-lg-1.sc-gw-look-at-me{gap:0.25rem !important}/*!@.gap-lg-2*/.gap-lg-2.sc-gw-look-at-me{gap:0.5rem !important}/*!@.gap-lg-3*/.gap-lg-3.sc-gw-look-at-me{gap:1rem !important}/*!@.gap-lg-4*/.gap-lg-4.sc-gw-look-at-me{gap:1.5rem !important}/*!@.gap-lg-5*/.gap-lg-5.sc-gw-look-at-me{gap:3rem !important}/*!@.justify-content-lg-start*/.justify-content-lg-start.sc-gw-look-at-me{justify-content:flex-start !important}/*!@.justify-content-lg-end*/.justify-content-lg-end.sc-gw-look-at-me{justify-content:flex-end !important}/*!@.justify-content-lg-center*/.justify-content-lg-center.sc-gw-look-at-me{justify-content:center !important}/*!@.justify-content-lg-between*/.justify-content-lg-between.sc-gw-look-at-me{justify-content:space-between !important}/*!@.justify-content-lg-around*/.justify-content-lg-around.sc-gw-look-at-me{justify-content:space-around !important}/*!@.justify-content-lg-evenly*/.justify-content-lg-evenly.sc-gw-look-at-me{justify-content:space-evenly !important}/*!@.align-items-lg-start*/.align-items-lg-start.sc-gw-look-at-me{align-items:flex-start !important}/*!@.align-items-lg-end*/.align-items-lg-end.sc-gw-look-at-me{align-items:flex-end !important}/*!@.align-items-lg-center*/.align-items-lg-center.sc-gw-look-at-me{align-items:center !important}/*!@.align-items-lg-baseline*/.align-items-lg-baseline.sc-gw-look-at-me{align-items:baseline !important}/*!@.align-items-lg-stretch*/.align-items-lg-stretch.sc-gw-look-at-me{align-items:stretch !important}/*!@.align-content-lg-start*/.align-content-lg-start.sc-gw-look-at-me{align-content:flex-start !important}/*!@.align-content-lg-end*/.align-content-lg-end.sc-gw-look-at-me{align-content:flex-end !important}/*!@.align-content-lg-center*/.align-content-lg-center.sc-gw-look-at-me{align-content:center !important}/*!@.align-content-lg-between*/.align-content-lg-between.sc-gw-look-at-me{align-content:space-between !important}/*!@.align-content-lg-around*/.align-content-lg-around.sc-gw-look-at-me{align-content:space-around !important}/*!@.align-content-lg-stretch*/.align-content-lg-stretch.sc-gw-look-at-me{align-content:stretch !important}/*!@.align-self-lg-auto*/.align-self-lg-auto.sc-gw-look-at-me{align-self:auto !important}/*!@.align-self-lg-start*/.align-self-lg-start.sc-gw-look-at-me{align-self:flex-start !important}/*!@.align-self-lg-end*/.align-self-lg-end.sc-gw-look-at-me{align-self:flex-end !important}/*!@.align-self-lg-center*/.align-self-lg-center.sc-gw-look-at-me{align-self:center !important}/*!@.align-self-lg-baseline*/.align-self-lg-baseline.sc-gw-look-at-me{align-self:baseline !important}/*!@.align-self-lg-stretch*/.align-self-lg-stretch.sc-gw-look-at-me{align-self:stretch !important}/*!@.order-lg-first*/.order-lg-first.sc-gw-look-at-me{order:-1 !important}/*!@.order-lg-0*/.order-lg-0.sc-gw-look-at-me{order:0 !important}/*!@.order-lg-1*/.order-lg-1.sc-gw-look-at-me{order:1 !important}/*!@.order-lg-2*/.order-lg-2.sc-gw-look-at-me{order:2 !important}/*!@.order-lg-3*/.order-lg-3.sc-gw-look-at-me{order:3 !important}/*!@.order-lg-4*/.order-lg-4.sc-gw-look-at-me{order:4 !important}/*!@.order-lg-5*/.order-lg-5.sc-gw-look-at-me{order:5 !important}/*!@.order-lg-last*/.order-lg-last.sc-gw-look-at-me{order:6 !important}/*!@.m-lg-0*/.m-lg-0.sc-gw-look-at-me{margin:0 !important}/*!@.m-lg-1*/.m-lg-1.sc-gw-look-at-me{margin:0.25rem !important}/*!@.m-lg-2*/.m-lg-2.sc-gw-look-at-me{margin:0.5rem !important}/*!@.m-lg-3*/.m-lg-3.sc-gw-look-at-me{margin:1rem !important}/*!@.m-lg-4*/.m-lg-4.sc-gw-look-at-me{margin:1.5rem !important}/*!@.m-lg-5*/.m-lg-5.sc-gw-look-at-me{margin:3rem !important}/*!@.m-lg-auto*/.m-lg-auto.sc-gw-look-at-me{margin:auto !important}/*!@.mx-lg-0*/.mx-lg-0.sc-gw-look-at-me{margin-right:0 !important;margin-left:0 !important}/*!@.mx-lg-1*/.mx-lg-1.sc-gw-look-at-me{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-lg-2*/.mx-lg-2.sc-gw-look-at-me{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-lg-3*/.mx-lg-3.sc-gw-look-at-me{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-lg-4*/.mx-lg-4.sc-gw-look-at-me{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-lg-5*/.mx-lg-5.sc-gw-look-at-me{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-lg-auto*/.mx-lg-auto.sc-gw-look-at-me{margin-right:auto !important;margin-left:auto !important}/*!@.my-lg-0*/.my-lg-0.sc-gw-look-at-me{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-lg-1*/.my-lg-1.sc-gw-look-at-me{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-lg-2*/.my-lg-2.sc-gw-look-at-me{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-lg-3*/.my-lg-3.sc-gw-look-at-me{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-lg-4*/.my-lg-4.sc-gw-look-at-me{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-lg-5*/.my-lg-5.sc-gw-look-at-me{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-lg-auto*/.my-lg-auto.sc-gw-look-at-me{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-lg-0*/.mt-lg-0.sc-gw-look-at-me{margin-top:0 !important}/*!@.mt-lg-1*/.mt-lg-1.sc-gw-look-at-me{margin-top:0.25rem !important}/*!@.mt-lg-2*/.mt-lg-2.sc-gw-look-at-me{margin-top:0.5rem !important}/*!@.mt-lg-3*/.mt-lg-3.sc-gw-look-at-me{margin-top:1rem !important}/*!@.mt-lg-4*/.mt-lg-4.sc-gw-look-at-me{margin-top:1.5rem !important}/*!@.mt-lg-5*/.mt-lg-5.sc-gw-look-at-me{margin-top:3rem !important}/*!@.mt-lg-auto*/.mt-lg-auto.sc-gw-look-at-me{margin-top:auto !important}/*!@.me-lg-0*/.me-lg-0.sc-gw-look-at-me{margin-right:0 !important}/*!@.me-lg-1*/.me-lg-1.sc-gw-look-at-me{margin-right:0.25rem !important}/*!@.me-lg-2*/.me-lg-2.sc-gw-look-at-me{margin-right:0.5rem !important}/*!@.me-lg-3*/.me-lg-3.sc-gw-look-at-me{margin-right:1rem !important}/*!@.me-lg-4*/.me-lg-4.sc-gw-look-at-me{margin-right:1.5rem !important}/*!@.me-lg-5*/.me-lg-5.sc-gw-look-at-me{margin-right:3rem !important}/*!@.me-lg-auto*/.me-lg-auto.sc-gw-look-at-me{margin-right:auto !important}/*!@.mb-lg-0*/.mb-lg-0.sc-gw-look-at-me{margin-bottom:0 !important}/*!@.mb-lg-1*/.mb-lg-1.sc-gw-look-at-me{margin-bottom:0.25rem !important}/*!@.mb-lg-2*/.mb-lg-2.sc-gw-look-at-me{margin-bottom:0.5rem !important}/*!@.mb-lg-3*/.mb-lg-3.sc-gw-look-at-me{margin-bottom:1rem !important}/*!@.mb-lg-4*/.mb-lg-4.sc-gw-look-at-me{margin-bottom:1.5rem !important}/*!@.mb-lg-5*/.mb-lg-5.sc-gw-look-at-me{margin-bottom:3rem !important}/*!@.mb-lg-auto*/.mb-lg-auto.sc-gw-look-at-me{margin-bottom:auto !important}/*!@.ms-lg-0*/.ms-lg-0.sc-gw-look-at-me{margin-left:0 !important}/*!@.ms-lg-1*/.ms-lg-1.sc-gw-look-at-me{margin-left:0.25rem !important}/*!@.ms-lg-2*/.ms-lg-2.sc-gw-look-at-me{margin-left:0.5rem !important}/*!@.ms-lg-3*/.ms-lg-3.sc-gw-look-at-me{margin-left:1rem !important}/*!@.ms-lg-4*/.ms-lg-4.sc-gw-look-at-me{margin-left:1.5rem !important}/*!@.ms-lg-5*/.ms-lg-5.sc-gw-look-at-me{margin-left:3rem !important}/*!@.ms-lg-auto*/.ms-lg-auto.sc-gw-look-at-me{margin-left:auto !important}/*!@.p-lg-0*/.p-lg-0.sc-gw-look-at-me{padding:0 !important}/*!@.p-lg-1*/.p-lg-1.sc-gw-look-at-me{padding:0.25rem !important}/*!@.p-lg-2*/.p-lg-2.sc-gw-look-at-me{padding:0.5rem !important}/*!@.p-lg-3*/.p-lg-3.sc-gw-look-at-me{padding:1rem !important}/*!@.p-lg-4*/.p-lg-4.sc-gw-look-at-me{padding:1.5rem !important}/*!@.p-lg-5*/.p-lg-5.sc-gw-look-at-me{padding:3rem !important}/*!@.px-lg-0*/.px-lg-0.sc-gw-look-at-me{padding-right:0 !important;padding-left:0 !important}/*!@.px-lg-1*/.px-lg-1.sc-gw-look-at-me{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-lg-2*/.px-lg-2.sc-gw-look-at-me{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-lg-3*/.px-lg-3.sc-gw-look-at-me{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-lg-4*/.px-lg-4.sc-gw-look-at-me{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-lg-5*/.px-lg-5.sc-gw-look-at-me{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-lg-0*/.py-lg-0.sc-gw-look-at-me{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-lg-1*/.py-lg-1.sc-gw-look-at-me{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-lg-2*/.py-lg-2.sc-gw-look-at-me{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-lg-3*/.py-lg-3.sc-gw-look-at-me{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-lg-4*/.py-lg-4.sc-gw-look-at-me{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-lg-5*/.py-lg-5.sc-gw-look-at-me{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-lg-0*/.pt-lg-0.sc-gw-look-at-me{padding-top:0 !important}/*!@.pt-lg-1*/.pt-lg-1.sc-gw-look-at-me{padding-top:0.25rem !important}/*!@.pt-lg-2*/.pt-lg-2.sc-gw-look-at-me{padding-top:0.5rem !important}/*!@.pt-lg-3*/.pt-lg-3.sc-gw-look-at-me{padding-top:1rem !important}/*!@.pt-lg-4*/.pt-lg-4.sc-gw-look-at-me{padding-top:1.5rem !important}/*!@.pt-lg-5*/.pt-lg-5.sc-gw-look-at-me{padding-top:3rem !important}/*!@.pe-lg-0*/.pe-lg-0.sc-gw-look-at-me{padding-right:0 !important}/*!@.pe-lg-1*/.pe-lg-1.sc-gw-look-at-me{padding-right:0.25rem !important}/*!@.pe-lg-2*/.pe-lg-2.sc-gw-look-at-me{padding-right:0.5rem !important}/*!@.pe-lg-3*/.pe-lg-3.sc-gw-look-at-me{padding-right:1rem !important}/*!@.pe-lg-4*/.pe-lg-4.sc-gw-look-at-me{padding-right:1.5rem !important}/*!@.pe-lg-5*/.pe-lg-5.sc-gw-look-at-me{padding-right:3rem !important}/*!@.pb-lg-0*/.pb-lg-0.sc-gw-look-at-me{padding-bottom:0 !important}/*!@.pb-lg-1*/.pb-lg-1.sc-gw-look-at-me{padding-bottom:0.25rem !important}/*!@.pb-lg-2*/.pb-lg-2.sc-gw-look-at-me{padding-bottom:0.5rem !important}/*!@.pb-lg-3*/.pb-lg-3.sc-gw-look-at-me{padding-bottom:1rem !important}/*!@.pb-lg-4*/.pb-lg-4.sc-gw-look-at-me{padding-bottom:1.5rem !important}/*!@.pb-lg-5*/.pb-lg-5.sc-gw-look-at-me{padding-bottom:3rem !important}/*!@.ps-lg-0*/.ps-lg-0.sc-gw-look-at-me{padding-left:0 !important}/*!@.ps-lg-1*/.ps-lg-1.sc-gw-look-at-me{padding-left:0.25rem !important}/*!@.ps-lg-2*/.ps-lg-2.sc-gw-look-at-me{padding-left:0.5rem !important}/*!@.ps-lg-3*/.ps-lg-3.sc-gw-look-at-me{padding-left:1rem !important}/*!@.ps-lg-4*/.ps-lg-4.sc-gw-look-at-me{padding-left:1.5rem !important}/*!@.ps-lg-5*/.ps-lg-5.sc-gw-look-at-me{padding-left:3rem !important}/*!@.text-lg-start*/.text-lg-start.sc-gw-look-at-me{text-align:left !important}/*!@.text-lg-end*/.text-lg-end.sc-gw-look-at-me{text-align:right !important}/*!@.text-lg-center*/.text-lg-center.sc-gw-look-at-me{text-align:center !important}}@media (min-width: 1200px){/*!@.float-xl-start*/.float-xl-start.sc-gw-look-at-me{float:left !important}/*!@.float-xl-end*/.float-xl-end.sc-gw-look-at-me{float:right !important}/*!@.float-xl-none*/.float-xl-none.sc-gw-look-at-me{float:none !important}/*!@.d-xl-inline*/.d-xl-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-xl-inline-block*/.d-xl-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-xl-block*/.d-xl-block.sc-gw-look-at-me{display:block !important}/*!@.d-xl-grid*/.d-xl-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-xl-table*/.d-xl-table.sc-gw-look-at-me{display:table !important}/*!@.d-xl-table-row*/.d-xl-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-xl-table-cell*/.d-xl-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-xl-flex*/.d-xl-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-xl-inline-flex*/.d-xl-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-xl-none*/.d-xl-none.sc-gw-look-at-me{display:none !important}/*!@.flex-xl-fill*/.flex-xl-fill.sc-gw-look-at-me{flex:1 1 auto !important}/*!@.flex-xl-row*/.flex-xl-row.sc-gw-look-at-me{flex-direction:row !important}/*!@.flex-xl-column*/.flex-xl-column.sc-gw-look-at-me{flex-direction:column !important}/*!@.flex-xl-row-reverse*/.flex-xl-row-reverse.sc-gw-look-at-me{flex-direction:row-reverse !important}/*!@.flex-xl-column-reverse*/.flex-xl-column-reverse.sc-gw-look-at-me{flex-direction:column-reverse !important}/*!@.flex-xl-grow-0*/.flex-xl-grow-0.sc-gw-look-at-me{flex-grow:0 !important}/*!@.flex-xl-grow-1*/.flex-xl-grow-1.sc-gw-look-at-me{flex-grow:1 !important}/*!@.flex-xl-shrink-0*/.flex-xl-shrink-0.sc-gw-look-at-me{flex-shrink:0 !important}/*!@.flex-xl-shrink-1*/.flex-xl-shrink-1.sc-gw-look-at-me{flex-shrink:1 !important}/*!@.flex-xl-wrap*/.flex-xl-wrap.sc-gw-look-at-me{flex-wrap:wrap !important}/*!@.flex-xl-nowrap*/.flex-xl-nowrap.sc-gw-look-at-me{flex-wrap:nowrap !important}/*!@.flex-xl-wrap-reverse*/.flex-xl-wrap-reverse.sc-gw-look-at-me{flex-wrap:wrap-reverse !important}/*!@.gap-xl-0*/.gap-xl-0.sc-gw-look-at-me{gap:0 !important}/*!@.gap-xl-1*/.gap-xl-1.sc-gw-look-at-me{gap:0.25rem !important}/*!@.gap-xl-2*/.gap-xl-2.sc-gw-look-at-me{gap:0.5rem !important}/*!@.gap-xl-3*/.gap-xl-3.sc-gw-look-at-me{gap:1rem !important}/*!@.gap-xl-4*/.gap-xl-4.sc-gw-look-at-me{gap:1.5rem !important}/*!@.gap-xl-5*/.gap-xl-5.sc-gw-look-at-me{gap:3rem !important}/*!@.justify-content-xl-start*/.justify-content-xl-start.sc-gw-look-at-me{justify-content:flex-start !important}/*!@.justify-content-xl-end*/.justify-content-xl-end.sc-gw-look-at-me{justify-content:flex-end !important}/*!@.justify-content-xl-center*/.justify-content-xl-center.sc-gw-look-at-me{justify-content:center !important}/*!@.justify-content-xl-between*/.justify-content-xl-between.sc-gw-look-at-me{justify-content:space-between !important}/*!@.justify-content-xl-around*/.justify-content-xl-around.sc-gw-look-at-me{justify-content:space-around !important}/*!@.justify-content-xl-evenly*/.justify-content-xl-evenly.sc-gw-look-at-me{justify-content:space-evenly !important}/*!@.align-items-xl-start*/.align-items-xl-start.sc-gw-look-at-me{align-items:flex-start !important}/*!@.align-items-xl-end*/.align-items-xl-end.sc-gw-look-at-me{align-items:flex-end !important}/*!@.align-items-xl-center*/.align-items-xl-center.sc-gw-look-at-me{align-items:center !important}/*!@.align-items-xl-baseline*/.align-items-xl-baseline.sc-gw-look-at-me{align-items:baseline !important}/*!@.align-items-xl-stretch*/.align-items-xl-stretch.sc-gw-look-at-me{align-items:stretch !important}/*!@.align-content-xl-start*/.align-content-xl-start.sc-gw-look-at-me{align-content:flex-start !important}/*!@.align-content-xl-end*/.align-content-xl-end.sc-gw-look-at-me{align-content:flex-end !important}/*!@.align-content-xl-center*/.align-content-xl-center.sc-gw-look-at-me{align-content:center !important}/*!@.align-content-xl-between*/.align-content-xl-between.sc-gw-look-at-me{align-content:space-between !important}/*!@.align-content-xl-around*/.align-content-xl-around.sc-gw-look-at-me{align-content:space-around !important}/*!@.align-content-xl-stretch*/.align-content-xl-stretch.sc-gw-look-at-me{align-content:stretch !important}/*!@.align-self-xl-auto*/.align-self-xl-auto.sc-gw-look-at-me{align-self:auto !important}/*!@.align-self-xl-start*/.align-self-xl-start.sc-gw-look-at-me{align-self:flex-start !important}/*!@.align-self-xl-end*/.align-self-xl-end.sc-gw-look-at-me{align-self:flex-end !important}/*!@.align-self-xl-center*/.align-self-xl-center.sc-gw-look-at-me{align-self:center !important}/*!@.align-self-xl-baseline*/.align-self-xl-baseline.sc-gw-look-at-me{align-self:baseline !important}/*!@.align-self-xl-stretch*/.align-self-xl-stretch.sc-gw-look-at-me{align-self:stretch !important}/*!@.order-xl-first*/.order-xl-first.sc-gw-look-at-me{order:-1 !important}/*!@.order-xl-0*/.order-xl-0.sc-gw-look-at-me{order:0 !important}/*!@.order-xl-1*/.order-xl-1.sc-gw-look-at-me{order:1 !important}/*!@.order-xl-2*/.order-xl-2.sc-gw-look-at-me{order:2 !important}/*!@.order-xl-3*/.order-xl-3.sc-gw-look-at-me{order:3 !important}/*!@.order-xl-4*/.order-xl-4.sc-gw-look-at-me{order:4 !important}/*!@.order-xl-5*/.order-xl-5.sc-gw-look-at-me{order:5 !important}/*!@.order-xl-last*/.order-xl-last.sc-gw-look-at-me{order:6 !important}/*!@.m-xl-0*/.m-xl-0.sc-gw-look-at-me{margin:0 !important}/*!@.m-xl-1*/.m-xl-1.sc-gw-look-at-me{margin:0.25rem !important}/*!@.m-xl-2*/.m-xl-2.sc-gw-look-at-me{margin:0.5rem !important}/*!@.m-xl-3*/.m-xl-3.sc-gw-look-at-me{margin:1rem !important}/*!@.m-xl-4*/.m-xl-4.sc-gw-look-at-me{margin:1.5rem !important}/*!@.m-xl-5*/.m-xl-5.sc-gw-look-at-me{margin:3rem !important}/*!@.m-xl-auto*/.m-xl-auto.sc-gw-look-at-me{margin:auto !important}/*!@.mx-xl-0*/.mx-xl-0.sc-gw-look-at-me{margin-right:0 !important;margin-left:0 !important}/*!@.mx-xl-1*/.mx-xl-1.sc-gw-look-at-me{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-xl-2*/.mx-xl-2.sc-gw-look-at-me{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-xl-3*/.mx-xl-3.sc-gw-look-at-me{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-xl-4*/.mx-xl-4.sc-gw-look-at-me{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-xl-5*/.mx-xl-5.sc-gw-look-at-me{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-xl-auto*/.mx-xl-auto.sc-gw-look-at-me{margin-right:auto !important;margin-left:auto !important}/*!@.my-xl-0*/.my-xl-0.sc-gw-look-at-me{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-xl-1*/.my-xl-1.sc-gw-look-at-me{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-xl-2*/.my-xl-2.sc-gw-look-at-me{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-xl-3*/.my-xl-3.sc-gw-look-at-me{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-xl-4*/.my-xl-4.sc-gw-look-at-me{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-xl-5*/.my-xl-5.sc-gw-look-at-me{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-xl-auto*/.my-xl-auto.sc-gw-look-at-me{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-xl-0*/.mt-xl-0.sc-gw-look-at-me{margin-top:0 !important}/*!@.mt-xl-1*/.mt-xl-1.sc-gw-look-at-me{margin-top:0.25rem !important}/*!@.mt-xl-2*/.mt-xl-2.sc-gw-look-at-me{margin-top:0.5rem !important}/*!@.mt-xl-3*/.mt-xl-3.sc-gw-look-at-me{margin-top:1rem !important}/*!@.mt-xl-4*/.mt-xl-4.sc-gw-look-at-me{margin-top:1.5rem !important}/*!@.mt-xl-5*/.mt-xl-5.sc-gw-look-at-me{margin-top:3rem !important}/*!@.mt-xl-auto*/.mt-xl-auto.sc-gw-look-at-me{margin-top:auto !important}/*!@.me-xl-0*/.me-xl-0.sc-gw-look-at-me{margin-right:0 !important}/*!@.me-xl-1*/.me-xl-1.sc-gw-look-at-me{margin-right:0.25rem !important}/*!@.me-xl-2*/.me-xl-2.sc-gw-look-at-me{margin-right:0.5rem !important}/*!@.me-xl-3*/.me-xl-3.sc-gw-look-at-me{margin-right:1rem !important}/*!@.me-xl-4*/.me-xl-4.sc-gw-look-at-me{margin-right:1.5rem !important}/*!@.me-xl-5*/.me-xl-5.sc-gw-look-at-me{margin-right:3rem !important}/*!@.me-xl-auto*/.me-xl-auto.sc-gw-look-at-me{margin-right:auto !important}/*!@.mb-xl-0*/.mb-xl-0.sc-gw-look-at-me{margin-bottom:0 !important}/*!@.mb-xl-1*/.mb-xl-1.sc-gw-look-at-me{margin-bottom:0.25rem !important}/*!@.mb-xl-2*/.mb-xl-2.sc-gw-look-at-me{margin-bottom:0.5rem !important}/*!@.mb-xl-3*/.mb-xl-3.sc-gw-look-at-me{margin-bottom:1rem !important}/*!@.mb-xl-4*/.mb-xl-4.sc-gw-look-at-me{margin-bottom:1.5rem !important}/*!@.mb-xl-5*/.mb-xl-5.sc-gw-look-at-me{margin-bottom:3rem !important}/*!@.mb-xl-auto*/.mb-xl-auto.sc-gw-look-at-me{margin-bottom:auto !important}/*!@.ms-xl-0*/.ms-xl-0.sc-gw-look-at-me{margin-left:0 !important}/*!@.ms-xl-1*/.ms-xl-1.sc-gw-look-at-me{margin-left:0.25rem !important}/*!@.ms-xl-2*/.ms-xl-2.sc-gw-look-at-me{margin-left:0.5rem !important}/*!@.ms-xl-3*/.ms-xl-3.sc-gw-look-at-me{margin-left:1rem !important}/*!@.ms-xl-4*/.ms-xl-4.sc-gw-look-at-me{margin-left:1.5rem !important}/*!@.ms-xl-5*/.ms-xl-5.sc-gw-look-at-me{margin-left:3rem !important}/*!@.ms-xl-auto*/.ms-xl-auto.sc-gw-look-at-me{margin-left:auto !important}/*!@.p-xl-0*/.p-xl-0.sc-gw-look-at-me{padding:0 !important}/*!@.p-xl-1*/.p-xl-1.sc-gw-look-at-me{padding:0.25rem !important}/*!@.p-xl-2*/.p-xl-2.sc-gw-look-at-me{padding:0.5rem !important}/*!@.p-xl-3*/.p-xl-3.sc-gw-look-at-me{padding:1rem !important}/*!@.p-xl-4*/.p-xl-4.sc-gw-look-at-me{padding:1.5rem !important}/*!@.p-xl-5*/.p-xl-5.sc-gw-look-at-me{padding:3rem !important}/*!@.px-xl-0*/.px-xl-0.sc-gw-look-at-me{padding-right:0 !important;padding-left:0 !important}/*!@.px-xl-1*/.px-xl-1.sc-gw-look-at-me{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-xl-2*/.px-xl-2.sc-gw-look-at-me{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-xl-3*/.px-xl-3.sc-gw-look-at-me{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-xl-4*/.px-xl-4.sc-gw-look-at-me{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-xl-5*/.px-xl-5.sc-gw-look-at-me{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-xl-0*/.py-xl-0.sc-gw-look-at-me{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-xl-1*/.py-xl-1.sc-gw-look-at-me{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-xl-2*/.py-xl-2.sc-gw-look-at-me{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-xl-3*/.py-xl-3.sc-gw-look-at-me{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-xl-4*/.py-xl-4.sc-gw-look-at-me{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-xl-5*/.py-xl-5.sc-gw-look-at-me{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-xl-0*/.pt-xl-0.sc-gw-look-at-me{padding-top:0 !important}/*!@.pt-xl-1*/.pt-xl-1.sc-gw-look-at-me{padding-top:0.25rem !important}/*!@.pt-xl-2*/.pt-xl-2.sc-gw-look-at-me{padding-top:0.5rem !important}/*!@.pt-xl-3*/.pt-xl-3.sc-gw-look-at-me{padding-top:1rem !important}/*!@.pt-xl-4*/.pt-xl-4.sc-gw-look-at-me{padding-top:1.5rem !important}/*!@.pt-xl-5*/.pt-xl-5.sc-gw-look-at-me{padding-top:3rem !important}/*!@.pe-xl-0*/.pe-xl-0.sc-gw-look-at-me{padding-right:0 !important}/*!@.pe-xl-1*/.pe-xl-1.sc-gw-look-at-me{padding-right:0.25rem !important}/*!@.pe-xl-2*/.pe-xl-2.sc-gw-look-at-me{padding-right:0.5rem !important}/*!@.pe-xl-3*/.pe-xl-3.sc-gw-look-at-me{padding-right:1rem !important}/*!@.pe-xl-4*/.pe-xl-4.sc-gw-look-at-me{padding-right:1.5rem !important}/*!@.pe-xl-5*/.pe-xl-5.sc-gw-look-at-me{padding-right:3rem !important}/*!@.pb-xl-0*/.pb-xl-0.sc-gw-look-at-me{padding-bottom:0 !important}/*!@.pb-xl-1*/.pb-xl-1.sc-gw-look-at-me{padding-bottom:0.25rem !important}/*!@.pb-xl-2*/.pb-xl-2.sc-gw-look-at-me{padding-bottom:0.5rem !important}/*!@.pb-xl-3*/.pb-xl-3.sc-gw-look-at-me{padding-bottom:1rem !important}/*!@.pb-xl-4*/.pb-xl-4.sc-gw-look-at-me{padding-bottom:1.5rem !important}/*!@.pb-xl-5*/.pb-xl-5.sc-gw-look-at-me{padding-bottom:3rem !important}/*!@.ps-xl-0*/.ps-xl-0.sc-gw-look-at-me{padding-left:0 !important}/*!@.ps-xl-1*/.ps-xl-1.sc-gw-look-at-me{padding-left:0.25rem !important}/*!@.ps-xl-2*/.ps-xl-2.sc-gw-look-at-me{padding-left:0.5rem !important}/*!@.ps-xl-3*/.ps-xl-3.sc-gw-look-at-me{padding-left:1rem !important}/*!@.ps-xl-4*/.ps-xl-4.sc-gw-look-at-me{padding-left:1.5rem !important}/*!@.ps-xl-5*/.ps-xl-5.sc-gw-look-at-me{padding-left:3rem !important}/*!@.text-xl-start*/.text-xl-start.sc-gw-look-at-me{text-align:left !important}/*!@.text-xl-end*/.text-xl-end.sc-gw-look-at-me{text-align:right !important}/*!@.text-xl-center*/.text-xl-center.sc-gw-look-at-me{text-align:center !important}}@media (min-width: 1400px){/*!@.float-xxl-start*/.float-xxl-start.sc-gw-look-at-me{float:left !important}/*!@.float-xxl-end*/.float-xxl-end.sc-gw-look-at-me{float:right !important}/*!@.float-xxl-none*/.float-xxl-none.sc-gw-look-at-me{float:none !important}/*!@.d-xxl-inline*/.d-xxl-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-xxl-inline-block*/.d-xxl-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-xxl-block*/.d-xxl-block.sc-gw-look-at-me{display:block !important}/*!@.d-xxl-grid*/.d-xxl-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-xxl-table*/.d-xxl-table.sc-gw-look-at-me{display:table !important}/*!@.d-xxl-table-row*/.d-xxl-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-xxl-table-cell*/.d-xxl-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-xxl-flex*/.d-xxl-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-xxl-inline-flex*/.d-xxl-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-xxl-none*/.d-xxl-none.sc-gw-look-at-me{display:none !important}/*!@.flex-xxl-fill*/.flex-xxl-fill.sc-gw-look-at-me{flex:1 1 auto !important}/*!@.flex-xxl-row*/.flex-xxl-row.sc-gw-look-at-me{flex-direction:row !important}/*!@.flex-xxl-column*/.flex-xxl-column.sc-gw-look-at-me{flex-direction:column !important}/*!@.flex-xxl-row-reverse*/.flex-xxl-row-reverse.sc-gw-look-at-me{flex-direction:row-reverse !important}/*!@.flex-xxl-column-reverse*/.flex-xxl-column-reverse.sc-gw-look-at-me{flex-direction:column-reverse !important}/*!@.flex-xxl-grow-0*/.flex-xxl-grow-0.sc-gw-look-at-me{flex-grow:0 !important}/*!@.flex-xxl-grow-1*/.flex-xxl-grow-1.sc-gw-look-at-me{flex-grow:1 !important}/*!@.flex-xxl-shrink-0*/.flex-xxl-shrink-0.sc-gw-look-at-me{flex-shrink:0 !important}/*!@.flex-xxl-shrink-1*/.flex-xxl-shrink-1.sc-gw-look-at-me{flex-shrink:1 !important}/*!@.flex-xxl-wrap*/.flex-xxl-wrap.sc-gw-look-at-me{flex-wrap:wrap !important}/*!@.flex-xxl-nowrap*/.flex-xxl-nowrap.sc-gw-look-at-me{flex-wrap:nowrap !important}/*!@.flex-xxl-wrap-reverse*/.flex-xxl-wrap-reverse.sc-gw-look-at-me{flex-wrap:wrap-reverse !important}/*!@.gap-xxl-0*/.gap-xxl-0.sc-gw-look-at-me{gap:0 !important}/*!@.gap-xxl-1*/.gap-xxl-1.sc-gw-look-at-me{gap:0.25rem !important}/*!@.gap-xxl-2*/.gap-xxl-2.sc-gw-look-at-me{gap:0.5rem !important}/*!@.gap-xxl-3*/.gap-xxl-3.sc-gw-look-at-me{gap:1rem !important}/*!@.gap-xxl-4*/.gap-xxl-4.sc-gw-look-at-me{gap:1.5rem !important}/*!@.gap-xxl-5*/.gap-xxl-5.sc-gw-look-at-me{gap:3rem !important}/*!@.justify-content-xxl-start*/.justify-content-xxl-start.sc-gw-look-at-me{justify-content:flex-start !important}/*!@.justify-content-xxl-end*/.justify-content-xxl-end.sc-gw-look-at-me{justify-content:flex-end !important}/*!@.justify-content-xxl-center*/.justify-content-xxl-center.sc-gw-look-at-me{justify-content:center !important}/*!@.justify-content-xxl-between*/.justify-content-xxl-between.sc-gw-look-at-me{justify-content:space-between !important}/*!@.justify-content-xxl-around*/.justify-content-xxl-around.sc-gw-look-at-me{justify-content:space-around !important}/*!@.justify-content-xxl-evenly*/.justify-content-xxl-evenly.sc-gw-look-at-me{justify-content:space-evenly !important}/*!@.align-items-xxl-start*/.align-items-xxl-start.sc-gw-look-at-me{align-items:flex-start !important}/*!@.align-items-xxl-end*/.align-items-xxl-end.sc-gw-look-at-me{align-items:flex-end !important}/*!@.align-items-xxl-center*/.align-items-xxl-center.sc-gw-look-at-me{align-items:center !important}/*!@.align-items-xxl-baseline*/.align-items-xxl-baseline.sc-gw-look-at-me{align-items:baseline !important}/*!@.align-items-xxl-stretch*/.align-items-xxl-stretch.sc-gw-look-at-me{align-items:stretch !important}/*!@.align-content-xxl-start*/.align-content-xxl-start.sc-gw-look-at-me{align-content:flex-start !important}/*!@.align-content-xxl-end*/.align-content-xxl-end.sc-gw-look-at-me{align-content:flex-end !important}/*!@.align-content-xxl-center*/.align-content-xxl-center.sc-gw-look-at-me{align-content:center !important}/*!@.align-content-xxl-between*/.align-content-xxl-between.sc-gw-look-at-me{align-content:space-between !important}/*!@.align-content-xxl-around*/.align-content-xxl-around.sc-gw-look-at-me{align-content:space-around !important}/*!@.align-content-xxl-stretch*/.align-content-xxl-stretch.sc-gw-look-at-me{align-content:stretch !important}/*!@.align-self-xxl-auto*/.align-self-xxl-auto.sc-gw-look-at-me{align-self:auto !important}/*!@.align-self-xxl-start*/.align-self-xxl-start.sc-gw-look-at-me{align-self:flex-start !important}/*!@.align-self-xxl-end*/.align-self-xxl-end.sc-gw-look-at-me{align-self:flex-end !important}/*!@.align-self-xxl-center*/.align-self-xxl-center.sc-gw-look-at-me{align-self:center !important}/*!@.align-self-xxl-baseline*/.align-self-xxl-baseline.sc-gw-look-at-me{align-self:baseline !important}/*!@.align-self-xxl-stretch*/.align-self-xxl-stretch.sc-gw-look-at-me{align-self:stretch !important}/*!@.order-xxl-first*/.order-xxl-first.sc-gw-look-at-me{order:-1 !important}/*!@.order-xxl-0*/.order-xxl-0.sc-gw-look-at-me{order:0 !important}/*!@.order-xxl-1*/.order-xxl-1.sc-gw-look-at-me{order:1 !important}/*!@.order-xxl-2*/.order-xxl-2.sc-gw-look-at-me{order:2 !important}/*!@.order-xxl-3*/.order-xxl-3.sc-gw-look-at-me{order:3 !important}/*!@.order-xxl-4*/.order-xxl-4.sc-gw-look-at-me{order:4 !important}/*!@.order-xxl-5*/.order-xxl-5.sc-gw-look-at-me{order:5 !important}/*!@.order-xxl-last*/.order-xxl-last.sc-gw-look-at-me{order:6 !important}/*!@.m-xxl-0*/.m-xxl-0.sc-gw-look-at-me{margin:0 !important}/*!@.m-xxl-1*/.m-xxl-1.sc-gw-look-at-me{margin:0.25rem !important}/*!@.m-xxl-2*/.m-xxl-2.sc-gw-look-at-me{margin:0.5rem !important}/*!@.m-xxl-3*/.m-xxl-3.sc-gw-look-at-me{margin:1rem !important}/*!@.m-xxl-4*/.m-xxl-4.sc-gw-look-at-me{margin:1.5rem !important}/*!@.m-xxl-5*/.m-xxl-5.sc-gw-look-at-me{margin:3rem !important}/*!@.m-xxl-auto*/.m-xxl-auto.sc-gw-look-at-me{margin:auto !important}/*!@.mx-xxl-0*/.mx-xxl-0.sc-gw-look-at-me{margin-right:0 !important;margin-left:0 !important}/*!@.mx-xxl-1*/.mx-xxl-1.sc-gw-look-at-me{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-xxl-2*/.mx-xxl-2.sc-gw-look-at-me{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-xxl-3*/.mx-xxl-3.sc-gw-look-at-me{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-xxl-4*/.mx-xxl-4.sc-gw-look-at-me{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-xxl-5*/.mx-xxl-5.sc-gw-look-at-me{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-xxl-auto*/.mx-xxl-auto.sc-gw-look-at-me{margin-right:auto !important;margin-left:auto !important}/*!@.my-xxl-0*/.my-xxl-0.sc-gw-look-at-me{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-xxl-1*/.my-xxl-1.sc-gw-look-at-me{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-xxl-2*/.my-xxl-2.sc-gw-look-at-me{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-xxl-3*/.my-xxl-3.sc-gw-look-at-me{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-xxl-4*/.my-xxl-4.sc-gw-look-at-me{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-xxl-5*/.my-xxl-5.sc-gw-look-at-me{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-xxl-auto*/.my-xxl-auto.sc-gw-look-at-me{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-xxl-0*/.mt-xxl-0.sc-gw-look-at-me{margin-top:0 !important}/*!@.mt-xxl-1*/.mt-xxl-1.sc-gw-look-at-me{margin-top:0.25rem !important}/*!@.mt-xxl-2*/.mt-xxl-2.sc-gw-look-at-me{margin-top:0.5rem !important}/*!@.mt-xxl-3*/.mt-xxl-3.sc-gw-look-at-me{margin-top:1rem !important}/*!@.mt-xxl-4*/.mt-xxl-4.sc-gw-look-at-me{margin-top:1.5rem !important}/*!@.mt-xxl-5*/.mt-xxl-5.sc-gw-look-at-me{margin-top:3rem !important}/*!@.mt-xxl-auto*/.mt-xxl-auto.sc-gw-look-at-me{margin-top:auto !important}/*!@.me-xxl-0*/.me-xxl-0.sc-gw-look-at-me{margin-right:0 !important}/*!@.me-xxl-1*/.me-xxl-1.sc-gw-look-at-me{margin-right:0.25rem !important}/*!@.me-xxl-2*/.me-xxl-2.sc-gw-look-at-me{margin-right:0.5rem !important}/*!@.me-xxl-3*/.me-xxl-3.sc-gw-look-at-me{margin-right:1rem !important}/*!@.me-xxl-4*/.me-xxl-4.sc-gw-look-at-me{margin-right:1.5rem !important}/*!@.me-xxl-5*/.me-xxl-5.sc-gw-look-at-me{margin-right:3rem !important}/*!@.me-xxl-auto*/.me-xxl-auto.sc-gw-look-at-me{margin-right:auto !important}/*!@.mb-xxl-0*/.mb-xxl-0.sc-gw-look-at-me{margin-bottom:0 !important}/*!@.mb-xxl-1*/.mb-xxl-1.sc-gw-look-at-me{margin-bottom:0.25rem !important}/*!@.mb-xxl-2*/.mb-xxl-2.sc-gw-look-at-me{margin-bottom:0.5rem !important}/*!@.mb-xxl-3*/.mb-xxl-3.sc-gw-look-at-me{margin-bottom:1rem !important}/*!@.mb-xxl-4*/.mb-xxl-4.sc-gw-look-at-me{margin-bottom:1.5rem !important}/*!@.mb-xxl-5*/.mb-xxl-5.sc-gw-look-at-me{margin-bottom:3rem !important}/*!@.mb-xxl-auto*/.mb-xxl-auto.sc-gw-look-at-me{margin-bottom:auto !important}/*!@.ms-xxl-0*/.ms-xxl-0.sc-gw-look-at-me{margin-left:0 !important}/*!@.ms-xxl-1*/.ms-xxl-1.sc-gw-look-at-me{margin-left:0.25rem !important}/*!@.ms-xxl-2*/.ms-xxl-2.sc-gw-look-at-me{margin-left:0.5rem !important}/*!@.ms-xxl-3*/.ms-xxl-3.sc-gw-look-at-me{margin-left:1rem !important}/*!@.ms-xxl-4*/.ms-xxl-4.sc-gw-look-at-me{margin-left:1.5rem !important}/*!@.ms-xxl-5*/.ms-xxl-5.sc-gw-look-at-me{margin-left:3rem !important}/*!@.ms-xxl-auto*/.ms-xxl-auto.sc-gw-look-at-me{margin-left:auto !important}/*!@.p-xxl-0*/.p-xxl-0.sc-gw-look-at-me{padding:0 !important}/*!@.p-xxl-1*/.p-xxl-1.sc-gw-look-at-me{padding:0.25rem !important}/*!@.p-xxl-2*/.p-xxl-2.sc-gw-look-at-me{padding:0.5rem !important}/*!@.p-xxl-3*/.p-xxl-3.sc-gw-look-at-me{padding:1rem !important}/*!@.p-xxl-4*/.p-xxl-4.sc-gw-look-at-me{padding:1.5rem !important}/*!@.p-xxl-5*/.p-xxl-5.sc-gw-look-at-me{padding:3rem !important}/*!@.px-xxl-0*/.px-xxl-0.sc-gw-look-at-me{padding-right:0 !important;padding-left:0 !important}/*!@.px-xxl-1*/.px-xxl-1.sc-gw-look-at-me{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-xxl-2*/.px-xxl-2.sc-gw-look-at-me{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-xxl-3*/.px-xxl-3.sc-gw-look-at-me{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-xxl-4*/.px-xxl-4.sc-gw-look-at-me{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-xxl-5*/.px-xxl-5.sc-gw-look-at-me{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-xxl-0*/.py-xxl-0.sc-gw-look-at-me{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-xxl-1*/.py-xxl-1.sc-gw-look-at-me{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-xxl-2*/.py-xxl-2.sc-gw-look-at-me{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-xxl-3*/.py-xxl-3.sc-gw-look-at-me{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-xxl-4*/.py-xxl-4.sc-gw-look-at-me{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-xxl-5*/.py-xxl-5.sc-gw-look-at-me{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-xxl-0*/.pt-xxl-0.sc-gw-look-at-me{padding-top:0 !important}/*!@.pt-xxl-1*/.pt-xxl-1.sc-gw-look-at-me{padding-top:0.25rem !important}/*!@.pt-xxl-2*/.pt-xxl-2.sc-gw-look-at-me{padding-top:0.5rem !important}/*!@.pt-xxl-3*/.pt-xxl-3.sc-gw-look-at-me{padding-top:1rem !important}/*!@.pt-xxl-4*/.pt-xxl-4.sc-gw-look-at-me{padding-top:1.5rem !important}/*!@.pt-xxl-5*/.pt-xxl-5.sc-gw-look-at-me{padding-top:3rem !important}/*!@.pe-xxl-0*/.pe-xxl-0.sc-gw-look-at-me{padding-right:0 !important}/*!@.pe-xxl-1*/.pe-xxl-1.sc-gw-look-at-me{padding-right:0.25rem !important}/*!@.pe-xxl-2*/.pe-xxl-2.sc-gw-look-at-me{padding-right:0.5rem !important}/*!@.pe-xxl-3*/.pe-xxl-3.sc-gw-look-at-me{padding-right:1rem !important}/*!@.pe-xxl-4*/.pe-xxl-4.sc-gw-look-at-me{padding-right:1.5rem !important}/*!@.pe-xxl-5*/.pe-xxl-5.sc-gw-look-at-me{padding-right:3rem !important}/*!@.pb-xxl-0*/.pb-xxl-0.sc-gw-look-at-me{padding-bottom:0 !important}/*!@.pb-xxl-1*/.pb-xxl-1.sc-gw-look-at-me{padding-bottom:0.25rem !important}/*!@.pb-xxl-2*/.pb-xxl-2.sc-gw-look-at-me{padding-bottom:0.5rem !important}/*!@.pb-xxl-3*/.pb-xxl-3.sc-gw-look-at-me{padding-bottom:1rem !important}/*!@.pb-xxl-4*/.pb-xxl-4.sc-gw-look-at-me{padding-bottom:1.5rem !important}/*!@.pb-xxl-5*/.pb-xxl-5.sc-gw-look-at-me{padding-bottom:3rem !important}/*!@.ps-xxl-0*/.ps-xxl-0.sc-gw-look-at-me{padding-left:0 !important}/*!@.ps-xxl-1*/.ps-xxl-1.sc-gw-look-at-me{padding-left:0.25rem !important}/*!@.ps-xxl-2*/.ps-xxl-2.sc-gw-look-at-me{padding-left:0.5rem !important}/*!@.ps-xxl-3*/.ps-xxl-3.sc-gw-look-at-me{padding-left:1rem !important}/*!@.ps-xxl-4*/.ps-xxl-4.sc-gw-look-at-me{padding-left:1.5rem !important}/*!@.ps-xxl-5*/.ps-xxl-5.sc-gw-look-at-me{padding-left:3rem !important}/*!@.text-xxl-start*/.text-xxl-start.sc-gw-look-at-me{text-align:left !important}/*!@.text-xxl-end*/.text-xxl-end.sc-gw-look-at-me{text-align:right !important}/*!@.text-xxl-center*/.text-xxl-center.sc-gw-look-at-me{text-align:center !important}}@media (min-width: 1200px){/*!@.fs-1*/.fs-1.sc-gw-look-at-me{font-size:2.5rem !important}/*!@.fs-2*/.fs-2.sc-gw-look-at-me{font-size:2rem !important}/*!@.fs-3*/.fs-3.sc-gw-look-at-me{font-size:1.75rem !important}/*!@.fs-4*/.fs-4.sc-gw-look-at-me{font-size:1.5rem !important}}@media print{/*!@.d-print-inline*/.d-print-inline.sc-gw-look-at-me{display:inline !important}/*!@.d-print-inline-block*/.d-print-inline-block.sc-gw-look-at-me{display:inline-block !important}/*!@.d-print-block*/.d-print-block.sc-gw-look-at-me{display:block !important}/*!@.d-print-grid*/.d-print-grid.sc-gw-look-at-me{display:grid !important}/*!@.d-print-table*/.d-print-table.sc-gw-look-at-me{display:table !important}/*!@.d-print-table-row*/.d-print-table-row.sc-gw-look-at-me{display:table-row !important}/*!@.d-print-table-cell*/.d-print-table-cell.sc-gw-look-at-me{display:table-cell !important}/*!@.d-print-flex*/.d-print-flex.sc-gw-look-at-me{display:flex !important}/*!@.d-print-inline-flex*/.d-print-inline-flex.sc-gw-look-at-me{display:inline-flex !important}/*!@.d-print-none*/.d-print-none.sc-gw-look-at-me{display:none !important}}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Light.woff\");font-weight:300}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Regular.woff\");font-weight:400}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Medium.woff\");font-weight:500}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Semibold.woff\");font-weight:600}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Bold.woff\");font-weight:700}@font-face{font-family:Rubik;src:url(\"../assets/fonts/rubik/Rubik-Light.woff\");font-weight:300}@font-face{font-family:Rubik;src:url(\"../assets/fonts/rubik/Rubik-Regular.woff\");font-weight:400}@font-face{font-family:Rubik;src:url(\"../assets/fonts/rubik/Rubik-Medium.woff\");font-weight:500}@font-face{font-family:Rubik;src:url(\"../assets/fonts/rubik/Rubik-Bold.woff\");font-weight:700}/*!@p*/p.sc-gw-look-at-me{font-family:var(--gw-font-family-body);font-weight:var(--gw-font-wight-regular);font-size:var(--gw-font-size-m);line-height:var(--gw-line-height-spaced);margin:var(--gw-space-s) 0 var(--gw-space-s) 0}/*!@section*/section.sc-gw-look-at-me{padding-top:var(--gw-space-m);padding-bottom:var(--gw-space-m)}@media (min-width: 768px){/*!@section*/section.sc-gw-look-at-me{padding-top:var(--gw-space-l);padding-bottom:var(--gw-space-l)}}@media (min-width: 992px){/*!@section*/section.sc-gw-look-at-me{padding-top:var(--gw-space-xl);padding-bottom:var(--gw-space-xl)}}/*!@*:focus-visible*/*.sc-gw-look-at-me:focus-visible{--borderWidth:3px;outline-width:var(--borderWidth);outline-style:solid;outline-color:var(--gw-color-fuchsia-500)}/*!@:host*/.sc-gw-look-at-me-h{display:block;background-repeat:no-repeat;background-size:1600px;background-position:bottom right;position:relative}/*!@:host(.white-text)*/.white-text.sc-gw-look-at-me-h{color:var(--gw-color-white)}/*!@.container*/.container.sc-gw-look-at-me{position:relative;z-index:10}/*!@.bg-image*/.bg-image.sc-gw-look-at-me{display:block;background-repeat:no-repeat;background-size:1600px;background-position:bottom right;position:absolute;width:100%;height:100%;top:0;left:0;opacity:0;transition:var(--gw-transition-regular)}/*!@.bg-image--one*/.bg-image--one.sc-gw-look-at-me{z-index:5}/*!@.bg-image--two*/.bg-image--two.sc-gw-look-at-me{z-index:4}/*!@.bg-image--three*/.bg-image--three.sc-gw-look-at-me{z-index:3}/*!@.bg-image--four*/.bg-image--four.sc-gw-look-at-me{z-index:2}/*!@.bg-image--show*/.bg-image--show.sc-gw-look-at-me{opacity:1}@media (max-width: 991px){/*!@:host*/.sc-gw-look-at-me-h{background-image:none !important}/*!@.bg-image*/.bg-image.sc-gw-look-at-me{display:none}}";

class GwLookAtMe {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.bgColor = null;
    this.preTitle = null;
    this.mainTitle = null;
    this.whiteText = false;
    this.pT0 = false; //padding-top:0
    this.pB0 = false; //padding-bottom:0
    this.alignContent = 'left';
    this.bgImage = null;
    this.bgImageOne = null;
    this.bgImageTwo = null;
    this.bgImageThree = null;
    this.bgImageFour = null;
    this.bgSize = '1600px';
    this.test = null;
    this.rowClasses = null;
    this.colClasses = null;
    this.bgPosition = 'bottom right';
  }
  componentWillLoad() {
    //define this.rowClasses and this.colClasses css classes.
    if (this.alignContent === 'center') {
      this.rowClasses = 'row justify-content-md-center text-md-center';
      this.colClasses = 'col-12 col-lg-7 col-xl-6';
    }
    else if (this.alignContent === 'right') {
      this.rowClasses = 'row justify-content-md-end';
      this.colClasses = 'col-12 col-lg-7 col-xl-6';
    }
    else {
      //is left
      this.rowClasses = 'row';
      this.colClasses = 'col-12 col-lg-7 col-xl-6';
    }
    //define backgroundPosition
    if (this.alignContent === 'right') {
      this.bgPosition = 'bottom left';
    }
  }
  componentDidLoad() {
    console.log(this.test);
    this.animateBackgrounds();
  }
  animateBackgrounds() {
    setTimeout(() => {
      this.bgImageOne ? this.bgImageOneEl.classList.add('bg-image--show') : null;
    }, 250);
    setTimeout(() => {
      this.bgImageTwo ? this.bgImageTwoEl.classList.add('bg-image--show') : null;
    }, 350);
    setTimeout(() => {
      this.bgImageThree ? this.bgImageThreeEl.classList.add('bg-image--show') : null;
    }, 450);
    setTimeout(() => {
      this.bgImageFour ? this.bgImageFourEl.classList.add('bg-image--show') : null;
    }, 700);
  }
  render() {
    return (hAsync(Host, { style: {
        backgroundColor: `var(--gw-color-${this.bgColor})`,
        backgroundImage: `url(${this.bgImage})`,
        backgroundSize: this.bgSize,
        backgroundPosition: this.bgPosition,
      }, class: { 'white-text': this.whiteText } }, hAsync("section", { class: {
        'container': true,
        'pt-0': this.pT0,
        'pb-0': this.pB0,
      } }, hAsync("div", { class: this.rowClasses }, hAsync("div", { class: this.colClasses }, this.preTitle ? (hAsync("gw-title", { type: "h3", looks: "h3", light: true, class: { 'pre-title': true }, "mt-0": true }, this.preTitle)) : null, this.mainTitle ? (hAsync("gw-title", { type: "h2", looks: "h1", mt0: !this.preTitle ? true : false }, this.mainTitle)) : null, hAsync("slot", null)))), this.bgImageOne ? (hAsync("div", { ref: el => (this.bgImageOneEl = el), class: "bg-image bg-image--one", style: { backgroundImage: `url(${this.bgImageOne})` } })) : null, this.bgImageTwo ? (hAsync("div", { ref: el => (this.bgImageTwoEl = el), class: "bg-image bg-image--two", style: { backgroundImage: `url(${this.bgImageTwo})` } })) : null, this.bgImageThree ? (hAsync("div", { ref: el => (this.bgImageThreeEl = el), class: "bg-image bg-image--three", style: { backgroundImage: `url(${this.bgImageThree})` } })) : null, this.bgImageFour ? (hAsync("div", { ref: el => (this.bgImageFourEl = el), class: "bg-image bg-image--four", style: { backgroundImage: `url(${this.bgImageFour})` } })) : null));
  }
  static get style() { return gwLookAtMeCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "gw-look-at-me",
    "$members$": {
      "bgColor": [1, "bg-color"],
      "preTitle": [1, "pre-title"],
      "mainTitle": [1, "main-title"],
      "whiteText": [4, "white-text"],
      "pT0": [4, "p-t-0"],
      "pB0": [4, "p-b-0"],
      "alignContent": [1, "align-content"],
      "bgImage": [1, "bg-image"],
      "bgImageOne": [1, "bg-image-one"],
      "bgImageTwo": [1, "bg-image-two"],
      "bgImageThree": [1, "bg-image-three"],
      "bgImageFour": [1, "bg-image-four"],
      "bgSize": [1, "bg-size"],
      "test": [1],
      "rowClasses": [32],
      "colClasses": [32],
      "bgPosition": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

const gwShowAndTellCss = "/*!@*,\n*::before,\n*::after*/*.sc-gw-show-and-tell,*.sc-gw-show-and-tell::before,*.sc-gw-show-and-tell::after{box-sizing:border-box}@media (prefers-reduced-motion: no-preference){/*!@:root*/.sc-gw-show-and-tell:root{scroll-behavior:smooth}}/*!@body*/body.sc-gw-show-and-tell{margin:0;font-family:system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", \"Liberation Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";font-size:1rem;font-weight:400;line-height:1.5;color:#212529;background-color:#fff;-webkit-text-size-adjust:100%;-webkit-tap-highlight-color:rgba(0, 0, 0, 0)}/*!@hr*/hr.sc-gw-show-and-tell{margin:1rem 0;color:inherit;background-color:currentColor;border:0;opacity:0.25}/*!@hr:not([size])*/hr.sc-gw-show-and-tell:not([size]){height:1px}/*!@h6,\nh5,\nh4,\nh3,\nh2,\nh1*/h6.sc-gw-show-and-tell,h5.sc-gw-show-and-tell,h4.sc-gw-show-and-tell,h3.sc-gw-show-and-tell,h2.sc-gw-show-and-tell,h1.sc-gw-show-and-tell{margin-top:0;margin-bottom:0.5rem;font-weight:500;line-height:1.2}/*!@h1*/h1.sc-gw-show-and-tell{font-size:calc(1.375rem + 1.5vw)}@media (min-width: 1200px){/*!@h1*/h1.sc-gw-show-and-tell{font-size:2.5rem}}/*!@h2*/h2.sc-gw-show-and-tell{font-size:calc(1.325rem + 0.9vw)}@media (min-width: 1200px){/*!@h2*/h2.sc-gw-show-and-tell{font-size:2rem}}/*!@h3*/h3.sc-gw-show-and-tell{font-size:calc(1.3rem + 0.6vw)}@media (min-width: 1200px){/*!@h3*/h3.sc-gw-show-and-tell{font-size:1.75rem}}/*!@h4*/h4.sc-gw-show-and-tell{font-size:calc(1.275rem + 0.3vw)}@media (min-width: 1200px){/*!@h4*/h4.sc-gw-show-and-tell{font-size:1.5rem}}/*!@h5*/h5.sc-gw-show-and-tell{font-size:1.25rem}/*!@h6*/h6.sc-gw-show-and-tell{font-size:1rem}/*!@p*/p.sc-gw-show-and-tell{margin-top:0;margin-bottom:1rem}/*!@abbr[title],\nabbr[data-bs-original-title]*/abbr[title].sc-gw-show-and-tell,abbr[data-bs-original-title].sc-gw-show-and-tell{-webkit-text-decoration:underline dotted;text-decoration:underline dotted;cursor:help;-webkit-text-decoration-skip-ink:none;text-decoration-skip-ink:none}/*!@address*/address.sc-gw-show-and-tell{margin-bottom:1rem;font-style:normal;line-height:inherit}/*!@ol,\nul*/ol.sc-gw-show-and-tell,ul.sc-gw-show-and-tell{padding-left:2rem}/*!@ol,\nul,\ndl*/ol.sc-gw-show-and-tell,ul.sc-gw-show-and-tell,dl.sc-gw-show-and-tell{margin-top:0;margin-bottom:1rem}/*!@ol ol,\nul ul,\nol ul,\nul ol*/ol.sc-gw-show-and-tell ol.sc-gw-show-and-tell,ul.sc-gw-show-and-tell ul.sc-gw-show-and-tell,ol.sc-gw-show-and-tell ul.sc-gw-show-and-tell,ul.sc-gw-show-and-tell ol.sc-gw-show-and-tell{margin-bottom:0}/*!@dt*/dt.sc-gw-show-and-tell{font-weight:700}/*!@dd*/dd.sc-gw-show-and-tell{margin-bottom:0.5rem;margin-left:0}/*!@blockquote*/blockquote.sc-gw-show-and-tell{margin:0 0 1rem}/*!@b,\nstrong*/b.sc-gw-show-and-tell,strong.sc-gw-show-and-tell{font-weight:bolder}/*!@small*/small.sc-gw-show-and-tell{font-size:0.875em}/*!@mark*/mark.sc-gw-show-and-tell{padding:0.2em;background-color:#fcf8e3}/*!@sub,\nsup*/sub.sc-gw-show-and-tell,sup.sc-gw-show-and-tell{position:relative;font-size:0.75em;line-height:0;vertical-align:baseline}/*!@sub*/sub.sc-gw-show-and-tell{bottom:-0.25em}/*!@sup*/sup.sc-gw-show-and-tell{top:-0.5em}/*!@a*/a.sc-gw-show-and-tell{color:#0d6efd;text-decoration:underline}/*!@a:hover*/a.sc-gw-show-and-tell:hover{color:#0a58ca}/*!@a:not([href]):not([class]),\na:not([href]):not([class]):hover*/a.sc-gw-show-and-tell:not([href]):not([class]),a.sc-gw-show-and-tell:not([href]):not([class]):hover{color:inherit;text-decoration:none}/*!@pre,\ncode,\nkbd,\nsamp*/pre.sc-gw-show-and-tell,code.sc-gw-show-and-tell,kbd.sc-gw-show-and-tell,samp.sc-gw-show-and-tell{font-family:SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;font-size:1em;direction:ltr;unicode-bidi:bidi-override}/*!@pre*/pre.sc-gw-show-and-tell{display:block;margin-top:0;margin-bottom:1rem;overflow:auto;font-size:0.875em}/*!@pre code*/pre.sc-gw-show-and-tell code.sc-gw-show-and-tell{font-size:inherit;color:inherit;word-break:normal}/*!@code*/code.sc-gw-show-and-tell{font-size:0.875em;color:#d63384;word-wrap:break-word}/*!@a > code*/a.sc-gw-show-and-tell>code.sc-gw-show-and-tell{color:inherit}/*!@kbd*/kbd.sc-gw-show-and-tell{padding:0.2rem 0.4rem;font-size:0.875em;color:#fff;background-color:#212529;border-radius:0.2rem}/*!@kbd kbd*/kbd.sc-gw-show-and-tell kbd.sc-gw-show-and-tell{padding:0;font-size:1em;font-weight:700}/*!@figure*/figure.sc-gw-show-and-tell{margin:0 0 1rem}/*!@img,\nsvg*/img.sc-gw-show-and-tell,svg.sc-gw-show-and-tell{vertical-align:middle}/*!@table*/table.sc-gw-show-and-tell{caption-side:bottom;border-collapse:collapse}/*!@caption*/caption.sc-gw-show-and-tell{padding-top:0.5rem;padding-bottom:0.5rem;color:#6c757d;text-align:left}/*!@th*/th.sc-gw-show-and-tell{text-align:inherit;text-align:-webkit-match-parent}/*!@thead,\ntbody,\ntfoot,\ntr,\ntd,\nth*/thead.sc-gw-show-and-tell,tbody.sc-gw-show-and-tell,tfoot.sc-gw-show-and-tell,tr.sc-gw-show-and-tell,td.sc-gw-show-and-tell,th.sc-gw-show-and-tell{border-color:inherit;border-style:solid;border-width:0}/*!@label*/label.sc-gw-show-and-tell{display:inline-block}/*!@button*/button.sc-gw-show-and-tell{border-radius:0}/*!@button:focus:not(:focus-visible)*/button.sc-gw-show-and-tell:focus:not(:focus-visible){outline:0}/*!@input,\nbutton,\nselect,\noptgroup,\ntextarea*/input.sc-gw-show-and-tell,button.sc-gw-show-and-tell,select.sc-gw-show-and-tell,optgroup.sc-gw-show-and-tell,textarea.sc-gw-show-and-tell{margin:0;font-family:inherit;font-size:inherit;line-height:inherit}/*!@button,\nselect*/button.sc-gw-show-and-tell,select.sc-gw-show-and-tell{text-transform:none}/*!@[role=button]*/[role=button].sc-gw-show-and-tell{cursor:pointer}/*!@select*/select.sc-gw-show-and-tell{word-wrap:normal}/*!@select:disabled*/select.sc-gw-show-and-tell:disabled{opacity:1}/*!@[list]::-webkit-calendar-picker-indicator*/[list].sc-gw-show-and-tell::-webkit-calendar-picker-indicator{display:none}/*!@button,\n[type=button],\n[type=reset],\n[type=submit]*/button.sc-gw-show-and-tell,[type=button].sc-gw-show-and-tell,[type=reset].sc-gw-show-and-tell,[type=submit].sc-gw-show-and-tell{-webkit-appearance:button}/*!@button:not(:disabled),\n[type=button]:not(:disabled),\n[type=reset]:not(:disabled),\n[type=submit]:not(:disabled)*/button.sc-gw-show-and-tell:not(:disabled),[type=button].sc-gw-show-and-tell:not(:disabled),[type=reset].sc-gw-show-and-tell:not(:disabled),[type=submit].sc-gw-show-and-tell:not(:disabled){cursor:pointer}/*!@::-moz-focus-inner*/.sc-gw-show-and-tell::-moz-focus-inner{padding:0;border-style:none}/*!@textarea*/textarea.sc-gw-show-and-tell{resize:vertical}/*!@fieldset*/fieldset.sc-gw-show-and-tell{min-width:0;padding:0;margin:0;border:0}/*!@legend*/legend.sc-gw-show-and-tell{float:left;width:100%;padding:0;margin-bottom:0.5rem;font-size:calc(1.275rem + 0.3vw);line-height:inherit}@media (min-width: 1200px){/*!@legend*/legend.sc-gw-show-and-tell{font-size:1.5rem}}/*!@legend + **/legend.sc-gw-show-and-tell+*.sc-gw-show-and-tell{clear:left}/*!@::-webkit-datetime-edit-fields-wrapper,\n::-webkit-datetime-edit-text,\n::-webkit-datetime-edit-minute,\n::-webkit-datetime-edit-hour-field,\n::-webkit-datetime-edit-day-field,\n::-webkit-datetime-edit-month-field,\n::-webkit-datetime-edit-year-field*/.sc-gw-show-and-tell::-webkit-datetime-edit-fields-wrapper,.sc-gw-show-and-tell::-webkit-datetime-edit-text,.sc-gw-show-and-tell::-webkit-datetime-edit-minute,.sc-gw-show-and-tell::-webkit-datetime-edit-hour-field,.sc-gw-show-and-tell::-webkit-datetime-edit-day-field,.sc-gw-show-and-tell::-webkit-datetime-edit-month-field,.sc-gw-show-and-tell::-webkit-datetime-edit-year-field{padding:0}/*!@::-webkit-inner-spin-button*/.sc-gw-show-and-tell::-webkit-inner-spin-button{height:auto}/*!@[type=search]*/[type=search].sc-gw-show-and-tell{outline-offset:-2px;-webkit-appearance:textfield}/*!@::-webkit-search-decoration*/.sc-gw-show-and-tell::-webkit-search-decoration{-webkit-appearance:none}/*!@::-webkit-color-swatch-wrapper*/.sc-gw-show-and-tell::-webkit-color-swatch-wrapper{padding:0}/*!@::file-selector-button*/.sc-gw-show-and-tell::file-selector-button{font:inherit}/*!@::-webkit-file-upload-button*/.sc-gw-show-and-tell::-webkit-file-upload-button{font:inherit;-webkit-appearance:button}/*!@output*/output.sc-gw-show-and-tell{display:inline-block}/*!@iframe*/iframe.sc-gw-show-and-tell{border:0}/*!@summary*/summary.sc-gw-show-and-tell{display:list-item;cursor:pointer}/*!@progress*/progress.sc-gw-show-and-tell{vertical-align:baseline}/*!@[hidden]*/[hidden].sc-gw-show-and-tell{display:none !important}/*!@.container,\n.container-fluid,\n.container-xxl,\n.container-xl,\n.container-lg,\n.container-md,\n.container-sm*/.container.sc-gw-show-and-tell,.container-fluid.sc-gw-show-and-tell,.container-xxl.sc-gw-show-and-tell,.container-xl.sc-gw-show-and-tell,.container-lg.sc-gw-show-and-tell,.container-md.sc-gw-show-and-tell,.container-sm.sc-gw-show-and-tell{width:100%;padding-right:var(--bs-gutter-x, 0.75rem);padding-left:var(--bs-gutter-x, 0.75rem);margin-right:auto;margin-left:auto}@media (min-width: 576px){/*!@.container-sm,\n.container*/.container-sm.sc-gw-show-and-tell,.container.sc-gw-show-and-tell{max-width:540px}}@media (min-width: 768px){/*!@.container-md,\n.container-sm,\n.container*/.container-md.sc-gw-show-and-tell,.container-sm.sc-gw-show-and-tell,.container.sc-gw-show-and-tell{max-width:720px}}@media (min-width: 992px){/*!@.container-lg,\n.container-md,\n.container-sm,\n.container*/.container-lg.sc-gw-show-and-tell,.container-md.sc-gw-show-and-tell,.container-sm.sc-gw-show-and-tell,.container.sc-gw-show-and-tell{max-width:960px}}@media (min-width: 1200px){/*!@.container-xl,\n.container-lg,\n.container-md,\n.container-sm,\n.container*/.container-xl.sc-gw-show-and-tell,.container-lg.sc-gw-show-and-tell,.container-md.sc-gw-show-and-tell,.container-sm.sc-gw-show-and-tell,.container.sc-gw-show-and-tell{max-width:1140px}}@media (min-width: 1400px){/*!@.container-xxl,\n.container-xl,\n.container-lg,\n.container-md,\n.container-sm,\n.container*/.container-xxl.sc-gw-show-and-tell,.container-xl.sc-gw-show-and-tell,.container-lg.sc-gw-show-and-tell,.container-md.sc-gw-show-and-tell,.container-sm.sc-gw-show-and-tell,.container.sc-gw-show-and-tell{max-width:1320px}}/*!@.row*/.row.sc-gw-show-and-tell{--bs-gutter-x:1.5rem;--bs-gutter-y:0;display:flex;flex-wrap:wrap;margin-top:calc(var(--bs-gutter-y) * -1);margin-right:calc(var(--bs-gutter-x) * -0.5);margin-left:calc(var(--bs-gutter-x) * -0.5)}/*!@.row > **/.row.sc-gw-show-and-tell>*.sc-gw-show-and-tell{box-sizing:border-box;flex-shrink:0;width:100%;max-width:100%;padding-right:calc(var(--bs-gutter-x) * 0.5);padding-left:calc(var(--bs-gutter-x) * 0.5);margin-top:var(--bs-gutter-y)}/*!@.col*/.col.sc-gw-show-and-tell{flex:1 0 0%}/*!@.row-cols-auto > **/.row-cols-auto.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:auto}/*!@.row-cols-1 > **/.row-cols-1.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:100%}/*!@.row-cols-2 > **/.row-cols-2.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:50%}/*!@.row-cols-3 > **/.row-cols-3.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-4 > **/.row-cols-4.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:25%}/*!@.row-cols-5 > **/.row-cols-5.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:20%}/*!@.row-cols-6 > **/.row-cols-6.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:16.6666666667%}@media (min-width: 576px){/*!@.col-sm*/.col-sm.sc-gw-show-and-tell{flex:1 0 0%}/*!@.row-cols-sm-auto > **/.row-cols-sm-auto.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:auto}/*!@.row-cols-sm-1 > **/.row-cols-sm-1.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:100%}/*!@.row-cols-sm-2 > **/.row-cols-sm-2.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:50%}/*!@.row-cols-sm-3 > **/.row-cols-sm-3.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-sm-4 > **/.row-cols-sm-4.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:25%}/*!@.row-cols-sm-5 > **/.row-cols-sm-5.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:20%}/*!@.row-cols-sm-6 > **/.row-cols-sm-6.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:16.6666666667%}}@media (min-width: 768px){/*!@.col-md*/.col-md.sc-gw-show-and-tell{flex:1 0 0%}/*!@.row-cols-md-auto > **/.row-cols-md-auto.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:auto}/*!@.row-cols-md-1 > **/.row-cols-md-1.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:100%}/*!@.row-cols-md-2 > **/.row-cols-md-2.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:50%}/*!@.row-cols-md-3 > **/.row-cols-md-3.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-md-4 > **/.row-cols-md-4.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:25%}/*!@.row-cols-md-5 > **/.row-cols-md-5.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:20%}/*!@.row-cols-md-6 > **/.row-cols-md-6.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:16.6666666667%}}@media (min-width: 992px){/*!@.col-lg*/.col-lg.sc-gw-show-and-tell{flex:1 0 0%}/*!@.row-cols-lg-auto > **/.row-cols-lg-auto.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:auto}/*!@.row-cols-lg-1 > **/.row-cols-lg-1.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:100%}/*!@.row-cols-lg-2 > **/.row-cols-lg-2.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:50%}/*!@.row-cols-lg-3 > **/.row-cols-lg-3.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-lg-4 > **/.row-cols-lg-4.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:25%}/*!@.row-cols-lg-5 > **/.row-cols-lg-5.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:20%}/*!@.row-cols-lg-6 > **/.row-cols-lg-6.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:16.6666666667%}}@media (min-width: 1200px){/*!@.col-xl*/.col-xl.sc-gw-show-and-tell{flex:1 0 0%}/*!@.row-cols-xl-auto > **/.row-cols-xl-auto.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:auto}/*!@.row-cols-xl-1 > **/.row-cols-xl-1.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:100%}/*!@.row-cols-xl-2 > **/.row-cols-xl-2.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:50%}/*!@.row-cols-xl-3 > **/.row-cols-xl-3.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-xl-4 > **/.row-cols-xl-4.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:25%}/*!@.row-cols-xl-5 > **/.row-cols-xl-5.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:20%}/*!@.row-cols-xl-6 > **/.row-cols-xl-6.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:16.6666666667%}}@media (min-width: 1400px){/*!@.col-xxl*/.col-xxl.sc-gw-show-and-tell{flex:1 0 0%}/*!@.row-cols-xxl-auto > **/.row-cols-xxl-auto.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:auto}/*!@.row-cols-xxl-1 > **/.row-cols-xxl-1.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:100%}/*!@.row-cols-xxl-2 > **/.row-cols-xxl-2.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:50%}/*!@.row-cols-xxl-3 > **/.row-cols-xxl-3.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:33.3333333333%}/*!@.row-cols-xxl-4 > **/.row-cols-xxl-4.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:25%}/*!@.row-cols-xxl-5 > **/.row-cols-xxl-5.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:20%}/*!@.row-cols-xxl-6 > **/.row-cols-xxl-6.sc-gw-show-and-tell>*.sc-gw-show-and-tell{flex:0 0 auto;width:16.6666666667%}}/*!@.col-auto*/.col-auto.sc-gw-show-and-tell{flex:0 0 auto;width:auto}/*!@.col-1*/.col-1.sc-gw-show-and-tell{flex:0 0 auto;width:8.33333333%}/*!@.col-2*/.col-2.sc-gw-show-and-tell{flex:0 0 auto;width:16.66666667%}/*!@.col-3*/.col-3.sc-gw-show-and-tell{flex:0 0 auto;width:25%}/*!@.col-4*/.col-4.sc-gw-show-and-tell{flex:0 0 auto;width:33.33333333%}/*!@.col-5*/.col-5.sc-gw-show-and-tell{flex:0 0 auto;width:41.66666667%}/*!@.col-6*/.col-6.sc-gw-show-and-tell{flex:0 0 auto;width:50%}/*!@.col-7*/.col-7.sc-gw-show-and-tell{flex:0 0 auto;width:58.33333333%}/*!@.col-8*/.col-8.sc-gw-show-and-tell{flex:0 0 auto;width:66.66666667%}/*!@.col-9*/.col-9.sc-gw-show-and-tell{flex:0 0 auto;width:75%}/*!@.col-10*/.col-10.sc-gw-show-and-tell{flex:0 0 auto;width:83.33333333%}/*!@.col-11*/.col-11.sc-gw-show-and-tell{flex:0 0 auto;width:91.66666667%}/*!@.col-12*/.col-12.sc-gw-show-and-tell{flex:0 0 auto;width:100%}/*!@.offset-1*/.offset-1.sc-gw-show-and-tell{margin-left:8.33333333%}/*!@.offset-2*/.offset-2.sc-gw-show-and-tell{margin-left:16.66666667%}/*!@.offset-3*/.offset-3.sc-gw-show-and-tell{margin-left:25%}/*!@.offset-4*/.offset-4.sc-gw-show-and-tell{margin-left:33.33333333%}/*!@.offset-5*/.offset-5.sc-gw-show-and-tell{margin-left:41.66666667%}/*!@.offset-6*/.offset-6.sc-gw-show-and-tell{margin-left:50%}/*!@.offset-7*/.offset-7.sc-gw-show-and-tell{margin-left:58.33333333%}/*!@.offset-8*/.offset-8.sc-gw-show-and-tell{margin-left:66.66666667%}/*!@.offset-9*/.offset-9.sc-gw-show-and-tell{margin-left:75%}/*!@.offset-10*/.offset-10.sc-gw-show-and-tell{margin-left:83.33333333%}/*!@.offset-11*/.offset-11.sc-gw-show-and-tell{margin-left:91.66666667%}/*!@.g-0,\n.gx-0*/.g-0.sc-gw-show-and-tell,.gx-0.sc-gw-show-and-tell{--bs-gutter-x:0}/*!@.g-0,\n.gy-0*/.g-0.sc-gw-show-and-tell,.gy-0.sc-gw-show-and-tell{--bs-gutter-y:0}/*!@.g-1,\n.gx-1*/.g-1.sc-gw-show-and-tell,.gx-1.sc-gw-show-and-tell{--bs-gutter-x:0.25rem}/*!@.g-1,\n.gy-1*/.g-1.sc-gw-show-and-tell,.gy-1.sc-gw-show-and-tell{--bs-gutter-y:0.25rem}/*!@.g-2,\n.gx-2*/.g-2.sc-gw-show-and-tell,.gx-2.sc-gw-show-and-tell{--bs-gutter-x:0.5rem}/*!@.g-2,\n.gy-2*/.g-2.sc-gw-show-and-tell,.gy-2.sc-gw-show-and-tell{--bs-gutter-y:0.5rem}/*!@.g-3,\n.gx-3*/.g-3.sc-gw-show-and-tell,.gx-3.sc-gw-show-and-tell{--bs-gutter-x:1rem}/*!@.g-3,\n.gy-3*/.g-3.sc-gw-show-and-tell,.gy-3.sc-gw-show-and-tell{--bs-gutter-y:1rem}/*!@.g-4,\n.gx-4*/.g-4.sc-gw-show-and-tell,.gx-4.sc-gw-show-and-tell{--bs-gutter-x:1.5rem}/*!@.g-4,\n.gy-4*/.g-4.sc-gw-show-and-tell,.gy-4.sc-gw-show-and-tell{--bs-gutter-y:1.5rem}/*!@.g-5,\n.gx-5*/.g-5.sc-gw-show-and-tell,.gx-5.sc-gw-show-and-tell{--bs-gutter-x:3rem}/*!@.g-5,\n.gy-5*/.g-5.sc-gw-show-and-tell,.gy-5.sc-gw-show-and-tell{--bs-gutter-y:3rem}@media (min-width: 576px){/*!@.col-sm-auto*/.col-sm-auto.sc-gw-show-and-tell{flex:0 0 auto;width:auto}/*!@.col-sm-1*/.col-sm-1.sc-gw-show-and-tell{flex:0 0 auto;width:8.33333333%}/*!@.col-sm-2*/.col-sm-2.sc-gw-show-and-tell{flex:0 0 auto;width:16.66666667%}/*!@.col-sm-3*/.col-sm-3.sc-gw-show-and-tell{flex:0 0 auto;width:25%}/*!@.col-sm-4*/.col-sm-4.sc-gw-show-and-tell{flex:0 0 auto;width:33.33333333%}/*!@.col-sm-5*/.col-sm-5.sc-gw-show-and-tell{flex:0 0 auto;width:41.66666667%}/*!@.col-sm-6*/.col-sm-6.sc-gw-show-and-tell{flex:0 0 auto;width:50%}/*!@.col-sm-7*/.col-sm-7.sc-gw-show-and-tell{flex:0 0 auto;width:58.33333333%}/*!@.col-sm-8*/.col-sm-8.sc-gw-show-and-tell{flex:0 0 auto;width:66.66666667%}/*!@.col-sm-9*/.col-sm-9.sc-gw-show-and-tell{flex:0 0 auto;width:75%}/*!@.col-sm-10*/.col-sm-10.sc-gw-show-and-tell{flex:0 0 auto;width:83.33333333%}/*!@.col-sm-11*/.col-sm-11.sc-gw-show-and-tell{flex:0 0 auto;width:91.66666667%}/*!@.col-sm-12*/.col-sm-12.sc-gw-show-and-tell{flex:0 0 auto;width:100%}/*!@.offset-sm-0*/.offset-sm-0.sc-gw-show-and-tell{margin-left:0}/*!@.offset-sm-1*/.offset-sm-1.sc-gw-show-and-tell{margin-left:8.33333333%}/*!@.offset-sm-2*/.offset-sm-2.sc-gw-show-and-tell{margin-left:16.66666667%}/*!@.offset-sm-3*/.offset-sm-3.sc-gw-show-and-tell{margin-left:25%}/*!@.offset-sm-4*/.offset-sm-4.sc-gw-show-and-tell{margin-left:33.33333333%}/*!@.offset-sm-5*/.offset-sm-5.sc-gw-show-and-tell{margin-left:41.66666667%}/*!@.offset-sm-6*/.offset-sm-6.sc-gw-show-and-tell{margin-left:50%}/*!@.offset-sm-7*/.offset-sm-7.sc-gw-show-and-tell{margin-left:58.33333333%}/*!@.offset-sm-8*/.offset-sm-8.sc-gw-show-and-tell{margin-left:66.66666667%}/*!@.offset-sm-9*/.offset-sm-9.sc-gw-show-and-tell{margin-left:75%}/*!@.offset-sm-10*/.offset-sm-10.sc-gw-show-and-tell{margin-left:83.33333333%}/*!@.offset-sm-11*/.offset-sm-11.sc-gw-show-and-tell{margin-left:91.66666667%}/*!@.g-sm-0,\n.gx-sm-0*/.g-sm-0.sc-gw-show-and-tell,.gx-sm-0.sc-gw-show-and-tell{--bs-gutter-x:0}/*!@.g-sm-0,\n.gy-sm-0*/.g-sm-0.sc-gw-show-and-tell,.gy-sm-0.sc-gw-show-and-tell{--bs-gutter-y:0}/*!@.g-sm-1,\n.gx-sm-1*/.g-sm-1.sc-gw-show-and-tell,.gx-sm-1.sc-gw-show-and-tell{--bs-gutter-x:0.25rem}/*!@.g-sm-1,\n.gy-sm-1*/.g-sm-1.sc-gw-show-and-tell,.gy-sm-1.sc-gw-show-and-tell{--bs-gutter-y:0.25rem}/*!@.g-sm-2,\n.gx-sm-2*/.g-sm-2.sc-gw-show-and-tell,.gx-sm-2.sc-gw-show-and-tell{--bs-gutter-x:0.5rem}/*!@.g-sm-2,\n.gy-sm-2*/.g-sm-2.sc-gw-show-and-tell,.gy-sm-2.sc-gw-show-and-tell{--bs-gutter-y:0.5rem}/*!@.g-sm-3,\n.gx-sm-3*/.g-sm-3.sc-gw-show-and-tell,.gx-sm-3.sc-gw-show-and-tell{--bs-gutter-x:1rem}/*!@.g-sm-3,\n.gy-sm-3*/.g-sm-3.sc-gw-show-and-tell,.gy-sm-3.sc-gw-show-and-tell{--bs-gutter-y:1rem}/*!@.g-sm-4,\n.gx-sm-4*/.g-sm-4.sc-gw-show-and-tell,.gx-sm-4.sc-gw-show-and-tell{--bs-gutter-x:1.5rem}/*!@.g-sm-4,\n.gy-sm-4*/.g-sm-4.sc-gw-show-and-tell,.gy-sm-4.sc-gw-show-and-tell{--bs-gutter-y:1.5rem}/*!@.g-sm-5,\n.gx-sm-5*/.g-sm-5.sc-gw-show-and-tell,.gx-sm-5.sc-gw-show-and-tell{--bs-gutter-x:3rem}/*!@.g-sm-5,\n.gy-sm-5*/.g-sm-5.sc-gw-show-and-tell,.gy-sm-5.sc-gw-show-and-tell{--bs-gutter-y:3rem}}@media (min-width: 768px){/*!@.col-md-auto*/.col-md-auto.sc-gw-show-and-tell{flex:0 0 auto;width:auto}/*!@.col-md-1*/.col-md-1.sc-gw-show-and-tell{flex:0 0 auto;width:8.33333333%}/*!@.col-md-2*/.col-md-2.sc-gw-show-and-tell{flex:0 0 auto;width:16.66666667%}/*!@.col-md-3*/.col-md-3.sc-gw-show-and-tell{flex:0 0 auto;width:25%}/*!@.col-md-4*/.col-md-4.sc-gw-show-and-tell{flex:0 0 auto;width:33.33333333%}/*!@.col-md-5*/.col-md-5.sc-gw-show-and-tell{flex:0 0 auto;width:41.66666667%}/*!@.col-md-6*/.col-md-6.sc-gw-show-and-tell{flex:0 0 auto;width:50%}/*!@.col-md-7*/.col-md-7.sc-gw-show-and-tell{flex:0 0 auto;width:58.33333333%}/*!@.col-md-8*/.col-md-8.sc-gw-show-and-tell{flex:0 0 auto;width:66.66666667%}/*!@.col-md-9*/.col-md-9.sc-gw-show-and-tell{flex:0 0 auto;width:75%}/*!@.col-md-10*/.col-md-10.sc-gw-show-and-tell{flex:0 0 auto;width:83.33333333%}/*!@.col-md-11*/.col-md-11.sc-gw-show-and-tell{flex:0 0 auto;width:91.66666667%}/*!@.col-md-12*/.col-md-12.sc-gw-show-and-tell{flex:0 0 auto;width:100%}/*!@.offset-md-0*/.offset-md-0.sc-gw-show-and-tell{margin-left:0}/*!@.offset-md-1*/.offset-md-1.sc-gw-show-and-tell{margin-left:8.33333333%}/*!@.offset-md-2*/.offset-md-2.sc-gw-show-and-tell{margin-left:16.66666667%}/*!@.offset-md-3*/.offset-md-3.sc-gw-show-and-tell{margin-left:25%}/*!@.offset-md-4*/.offset-md-4.sc-gw-show-and-tell{margin-left:33.33333333%}/*!@.offset-md-5*/.offset-md-5.sc-gw-show-and-tell{margin-left:41.66666667%}/*!@.offset-md-6*/.offset-md-6.sc-gw-show-and-tell{margin-left:50%}/*!@.offset-md-7*/.offset-md-7.sc-gw-show-and-tell{margin-left:58.33333333%}/*!@.offset-md-8*/.offset-md-8.sc-gw-show-and-tell{margin-left:66.66666667%}/*!@.offset-md-9*/.offset-md-9.sc-gw-show-and-tell{margin-left:75%}/*!@.offset-md-10*/.offset-md-10.sc-gw-show-and-tell{margin-left:83.33333333%}/*!@.offset-md-11*/.offset-md-11.sc-gw-show-and-tell{margin-left:91.66666667%}/*!@.g-md-0,\n.gx-md-0*/.g-md-0.sc-gw-show-and-tell,.gx-md-0.sc-gw-show-and-tell{--bs-gutter-x:0}/*!@.g-md-0,\n.gy-md-0*/.g-md-0.sc-gw-show-and-tell,.gy-md-0.sc-gw-show-and-tell{--bs-gutter-y:0}/*!@.g-md-1,\n.gx-md-1*/.g-md-1.sc-gw-show-and-tell,.gx-md-1.sc-gw-show-and-tell{--bs-gutter-x:0.25rem}/*!@.g-md-1,\n.gy-md-1*/.g-md-1.sc-gw-show-and-tell,.gy-md-1.sc-gw-show-and-tell{--bs-gutter-y:0.25rem}/*!@.g-md-2,\n.gx-md-2*/.g-md-2.sc-gw-show-and-tell,.gx-md-2.sc-gw-show-and-tell{--bs-gutter-x:0.5rem}/*!@.g-md-2,\n.gy-md-2*/.g-md-2.sc-gw-show-and-tell,.gy-md-2.sc-gw-show-and-tell{--bs-gutter-y:0.5rem}/*!@.g-md-3,\n.gx-md-3*/.g-md-3.sc-gw-show-and-tell,.gx-md-3.sc-gw-show-and-tell{--bs-gutter-x:1rem}/*!@.g-md-3,\n.gy-md-3*/.g-md-3.sc-gw-show-and-tell,.gy-md-3.sc-gw-show-and-tell{--bs-gutter-y:1rem}/*!@.g-md-4,\n.gx-md-4*/.g-md-4.sc-gw-show-and-tell,.gx-md-4.sc-gw-show-and-tell{--bs-gutter-x:1.5rem}/*!@.g-md-4,\n.gy-md-4*/.g-md-4.sc-gw-show-and-tell,.gy-md-4.sc-gw-show-and-tell{--bs-gutter-y:1.5rem}/*!@.g-md-5,\n.gx-md-5*/.g-md-5.sc-gw-show-and-tell,.gx-md-5.sc-gw-show-and-tell{--bs-gutter-x:3rem}/*!@.g-md-5,\n.gy-md-5*/.g-md-5.sc-gw-show-and-tell,.gy-md-5.sc-gw-show-and-tell{--bs-gutter-y:3rem}}@media (min-width: 992px){/*!@.col-lg-auto*/.col-lg-auto.sc-gw-show-and-tell{flex:0 0 auto;width:auto}/*!@.col-lg-1*/.col-lg-1.sc-gw-show-and-tell{flex:0 0 auto;width:8.33333333%}/*!@.col-lg-2*/.col-lg-2.sc-gw-show-and-tell{flex:0 0 auto;width:16.66666667%}/*!@.col-lg-3*/.col-lg-3.sc-gw-show-and-tell{flex:0 0 auto;width:25%}/*!@.col-lg-4*/.col-lg-4.sc-gw-show-and-tell{flex:0 0 auto;width:33.33333333%}/*!@.col-lg-5*/.col-lg-5.sc-gw-show-and-tell{flex:0 0 auto;width:41.66666667%}/*!@.col-lg-6*/.col-lg-6.sc-gw-show-and-tell{flex:0 0 auto;width:50%}/*!@.col-lg-7*/.col-lg-7.sc-gw-show-and-tell{flex:0 0 auto;width:58.33333333%}/*!@.col-lg-8*/.col-lg-8.sc-gw-show-and-tell{flex:0 0 auto;width:66.66666667%}/*!@.col-lg-9*/.col-lg-9.sc-gw-show-and-tell{flex:0 0 auto;width:75%}/*!@.col-lg-10*/.col-lg-10.sc-gw-show-and-tell{flex:0 0 auto;width:83.33333333%}/*!@.col-lg-11*/.col-lg-11.sc-gw-show-and-tell{flex:0 0 auto;width:91.66666667%}/*!@.col-lg-12*/.col-lg-12.sc-gw-show-and-tell{flex:0 0 auto;width:100%}/*!@.offset-lg-0*/.offset-lg-0.sc-gw-show-and-tell{margin-left:0}/*!@.offset-lg-1*/.offset-lg-1.sc-gw-show-and-tell{margin-left:8.33333333%}/*!@.offset-lg-2*/.offset-lg-2.sc-gw-show-and-tell{margin-left:16.66666667%}/*!@.offset-lg-3*/.offset-lg-3.sc-gw-show-and-tell{margin-left:25%}/*!@.offset-lg-4*/.offset-lg-4.sc-gw-show-and-tell{margin-left:33.33333333%}/*!@.offset-lg-5*/.offset-lg-5.sc-gw-show-and-tell{margin-left:41.66666667%}/*!@.offset-lg-6*/.offset-lg-6.sc-gw-show-and-tell{margin-left:50%}/*!@.offset-lg-7*/.offset-lg-7.sc-gw-show-and-tell{margin-left:58.33333333%}/*!@.offset-lg-8*/.offset-lg-8.sc-gw-show-and-tell{margin-left:66.66666667%}/*!@.offset-lg-9*/.offset-lg-9.sc-gw-show-and-tell{margin-left:75%}/*!@.offset-lg-10*/.offset-lg-10.sc-gw-show-and-tell{margin-left:83.33333333%}/*!@.offset-lg-11*/.offset-lg-11.sc-gw-show-and-tell{margin-left:91.66666667%}/*!@.g-lg-0,\n.gx-lg-0*/.g-lg-0.sc-gw-show-and-tell,.gx-lg-0.sc-gw-show-and-tell{--bs-gutter-x:0}/*!@.g-lg-0,\n.gy-lg-0*/.g-lg-0.sc-gw-show-and-tell,.gy-lg-0.sc-gw-show-and-tell{--bs-gutter-y:0}/*!@.g-lg-1,\n.gx-lg-1*/.g-lg-1.sc-gw-show-and-tell,.gx-lg-1.sc-gw-show-and-tell{--bs-gutter-x:0.25rem}/*!@.g-lg-1,\n.gy-lg-1*/.g-lg-1.sc-gw-show-and-tell,.gy-lg-1.sc-gw-show-and-tell{--bs-gutter-y:0.25rem}/*!@.g-lg-2,\n.gx-lg-2*/.g-lg-2.sc-gw-show-and-tell,.gx-lg-2.sc-gw-show-and-tell{--bs-gutter-x:0.5rem}/*!@.g-lg-2,\n.gy-lg-2*/.g-lg-2.sc-gw-show-and-tell,.gy-lg-2.sc-gw-show-and-tell{--bs-gutter-y:0.5rem}/*!@.g-lg-3,\n.gx-lg-3*/.g-lg-3.sc-gw-show-and-tell,.gx-lg-3.sc-gw-show-and-tell{--bs-gutter-x:1rem}/*!@.g-lg-3,\n.gy-lg-3*/.g-lg-3.sc-gw-show-and-tell,.gy-lg-3.sc-gw-show-and-tell{--bs-gutter-y:1rem}/*!@.g-lg-4,\n.gx-lg-4*/.g-lg-4.sc-gw-show-and-tell,.gx-lg-4.sc-gw-show-and-tell{--bs-gutter-x:1.5rem}/*!@.g-lg-4,\n.gy-lg-4*/.g-lg-4.sc-gw-show-and-tell,.gy-lg-4.sc-gw-show-and-tell{--bs-gutter-y:1.5rem}/*!@.g-lg-5,\n.gx-lg-5*/.g-lg-5.sc-gw-show-and-tell,.gx-lg-5.sc-gw-show-and-tell{--bs-gutter-x:3rem}/*!@.g-lg-5,\n.gy-lg-5*/.g-lg-5.sc-gw-show-and-tell,.gy-lg-5.sc-gw-show-and-tell{--bs-gutter-y:3rem}}@media (min-width: 1200px){/*!@.col-xl-auto*/.col-xl-auto.sc-gw-show-and-tell{flex:0 0 auto;width:auto}/*!@.col-xl-1*/.col-xl-1.sc-gw-show-and-tell{flex:0 0 auto;width:8.33333333%}/*!@.col-xl-2*/.col-xl-2.sc-gw-show-and-tell{flex:0 0 auto;width:16.66666667%}/*!@.col-xl-3*/.col-xl-3.sc-gw-show-and-tell{flex:0 0 auto;width:25%}/*!@.col-xl-4*/.col-xl-4.sc-gw-show-and-tell{flex:0 0 auto;width:33.33333333%}/*!@.col-xl-5*/.col-xl-5.sc-gw-show-and-tell{flex:0 0 auto;width:41.66666667%}/*!@.col-xl-6*/.col-xl-6.sc-gw-show-and-tell{flex:0 0 auto;width:50%}/*!@.col-xl-7*/.col-xl-7.sc-gw-show-and-tell{flex:0 0 auto;width:58.33333333%}/*!@.col-xl-8*/.col-xl-8.sc-gw-show-and-tell{flex:0 0 auto;width:66.66666667%}/*!@.col-xl-9*/.col-xl-9.sc-gw-show-and-tell{flex:0 0 auto;width:75%}/*!@.col-xl-10*/.col-xl-10.sc-gw-show-and-tell{flex:0 0 auto;width:83.33333333%}/*!@.col-xl-11*/.col-xl-11.sc-gw-show-and-tell{flex:0 0 auto;width:91.66666667%}/*!@.col-xl-12*/.col-xl-12.sc-gw-show-and-tell{flex:0 0 auto;width:100%}/*!@.offset-xl-0*/.offset-xl-0.sc-gw-show-and-tell{margin-left:0}/*!@.offset-xl-1*/.offset-xl-1.sc-gw-show-and-tell{margin-left:8.33333333%}/*!@.offset-xl-2*/.offset-xl-2.sc-gw-show-and-tell{margin-left:16.66666667%}/*!@.offset-xl-3*/.offset-xl-3.sc-gw-show-and-tell{margin-left:25%}/*!@.offset-xl-4*/.offset-xl-4.sc-gw-show-and-tell{margin-left:33.33333333%}/*!@.offset-xl-5*/.offset-xl-5.sc-gw-show-and-tell{margin-left:41.66666667%}/*!@.offset-xl-6*/.offset-xl-6.sc-gw-show-and-tell{margin-left:50%}/*!@.offset-xl-7*/.offset-xl-7.sc-gw-show-and-tell{margin-left:58.33333333%}/*!@.offset-xl-8*/.offset-xl-8.sc-gw-show-and-tell{margin-left:66.66666667%}/*!@.offset-xl-9*/.offset-xl-9.sc-gw-show-and-tell{margin-left:75%}/*!@.offset-xl-10*/.offset-xl-10.sc-gw-show-and-tell{margin-left:83.33333333%}/*!@.offset-xl-11*/.offset-xl-11.sc-gw-show-and-tell{margin-left:91.66666667%}/*!@.g-xl-0,\n.gx-xl-0*/.g-xl-0.sc-gw-show-and-tell,.gx-xl-0.sc-gw-show-and-tell{--bs-gutter-x:0}/*!@.g-xl-0,\n.gy-xl-0*/.g-xl-0.sc-gw-show-and-tell,.gy-xl-0.sc-gw-show-and-tell{--bs-gutter-y:0}/*!@.g-xl-1,\n.gx-xl-1*/.g-xl-1.sc-gw-show-and-tell,.gx-xl-1.sc-gw-show-and-tell{--bs-gutter-x:0.25rem}/*!@.g-xl-1,\n.gy-xl-1*/.g-xl-1.sc-gw-show-and-tell,.gy-xl-1.sc-gw-show-and-tell{--bs-gutter-y:0.25rem}/*!@.g-xl-2,\n.gx-xl-2*/.g-xl-2.sc-gw-show-and-tell,.gx-xl-2.sc-gw-show-and-tell{--bs-gutter-x:0.5rem}/*!@.g-xl-2,\n.gy-xl-2*/.g-xl-2.sc-gw-show-and-tell,.gy-xl-2.sc-gw-show-and-tell{--bs-gutter-y:0.5rem}/*!@.g-xl-3,\n.gx-xl-3*/.g-xl-3.sc-gw-show-and-tell,.gx-xl-3.sc-gw-show-and-tell{--bs-gutter-x:1rem}/*!@.g-xl-3,\n.gy-xl-3*/.g-xl-3.sc-gw-show-and-tell,.gy-xl-3.sc-gw-show-and-tell{--bs-gutter-y:1rem}/*!@.g-xl-4,\n.gx-xl-4*/.g-xl-4.sc-gw-show-and-tell,.gx-xl-4.sc-gw-show-and-tell{--bs-gutter-x:1.5rem}/*!@.g-xl-4,\n.gy-xl-4*/.g-xl-4.sc-gw-show-and-tell,.gy-xl-4.sc-gw-show-and-tell{--bs-gutter-y:1.5rem}/*!@.g-xl-5,\n.gx-xl-5*/.g-xl-5.sc-gw-show-and-tell,.gx-xl-5.sc-gw-show-and-tell{--bs-gutter-x:3rem}/*!@.g-xl-5,\n.gy-xl-5*/.g-xl-5.sc-gw-show-and-tell,.gy-xl-5.sc-gw-show-and-tell{--bs-gutter-y:3rem}}@media (min-width: 1400px){/*!@.col-xxl-auto*/.col-xxl-auto.sc-gw-show-and-tell{flex:0 0 auto;width:auto}/*!@.col-xxl-1*/.col-xxl-1.sc-gw-show-and-tell{flex:0 0 auto;width:8.33333333%}/*!@.col-xxl-2*/.col-xxl-2.sc-gw-show-and-tell{flex:0 0 auto;width:16.66666667%}/*!@.col-xxl-3*/.col-xxl-3.sc-gw-show-and-tell{flex:0 0 auto;width:25%}/*!@.col-xxl-4*/.col-xxl-4.sc-gw-show-and-tell{flex:0 0 auto;width:33.33333333%}/*!@.col-xxl-5*/.col-xxl-5.sc-gw-show-and-tell{flex:0 0 auto;width:41.66666667%}/*!@.col-xxl-6*/.col-xxl-6.sc-gw-show-and-tell{flex:0 0 auto;width:50%}/*!@.col-xxl-7*/.col-xxl-7.sc-gw-show-and-tell{flex:0 0 auto;width:58.33333333%}/*!@.col-xxl-8*/.col-xxl-8.sc-gw-show-and-tell{flex:0 0 auto;width:66.66666667%}/*!@.col-xxl-9*/.col-xxl-9.sc-gw-show-and-tell{flex:0 0 auto;width:75%}/*!@.col-xxl-10*/.col-xxl-10.sc-gw-show-and-tell{flex:0 0 auto;width:83.33333333%}/*!@.col-xxl-11*/.col-xxl-11.sc-gw-show-and-tell{flex:0 0 auto;width:91.66666667%}/*!@.col-xxl-12*/.col-xxl-12.sc-gw-show-and-tell{flex:0 0 auto;width:100%}/*!@.offset-xxl-0*/.offset-xxl-0.sc-gw-show-and-tell{margin-left:0}/*!@.offset-xxl-1*/.offset-xxl-1.sc-gw-show-and-tell{margin-left:8.33333333%}/*!@.offset-xxl-2*/.offset-xxl-2.sc-gw-show-and-tell{margin-left:16.66666667%}/*!@.offset-xxl-3*/.offset-xxl-3.sc-gw-show-and-tell{margin-left:25%}/*!@.offset-xxl-4*/.offset-xxl-4.sc-gw-show-and-tell{margin-left:33.33333333%}/*!@.offset-xxl-5*/.offset-xxl-5.sc-gw-show-and-tell{margin-left:41.66666667%}/*!@.offset-xxl-6*/.offset-xxl-6.sc-gw-show-and-tell{margin-left:50%}/*!@.offset-xxl-7*/.offset-xxl-7.sc-gw-show-and-tell{margin-left:58.33333333%}/*!@.offset-xxl-8*/.offset-xxl-8.sc-gw-show-and-tell{margin-left:66.66666667%}/*!@.offset-xxl-9*/.offset-xxl-9.sc-gw-show-and-tell{margin-left:75%}/*!@.offset-xxl-10*/.offset-xxl-10.sc-gw-show-and-tell{margin-left:83.33333333%}/*!@.offset-xxl-11*/.offset-xxl-11.sc-gw-show-and-tell{margin-left:91.66666667%}/*!@.g-xxl-0,\n.gx-xxl-0*/.g-xxl-0.sc-gw-show-and-tell,.gx-xxl-0.sc-gw-show-and-tell{--bs-gutter-x:0}/*!@.g-xxl-0,\n.gy-xxl-0*/.g-xxl-0.sc-gw-show-and-tell,.gy-xxl-0.sc-gw-show-and-tell{--bs-gutter-y:0}/*!@.g-xxl-1,\n.gx-xxl-1*/.g-xxl-1.sc-gw-show-and-tell,.gx-xxl-1.sc-gw-show-and-tell{--bs-gutter-x:0.25rem}/*!@.g-xxl-1,\n.gy-xxl-1*/.g-xxl-1.sc-gw-show-and-tell,.gy-xxl-1.sc-gw-show-and-tell{--bs-gutter-y:0.25rem}/*!@.g-xxl-2,\n.gx-xxl-2*/.g-xxl-2.sc-gw-show-and-tell,.gx-xxl-2.sc-gw-show-and-tell{--bs-gutter-x:0.5rem}/*!@.g-xxl-2,\n.gy-xxl-2*/.g-xxl-2.sc-gw-show-and-tell,.gy-xxl-2.sc-gw-show-and-tell{--bs-gutter-y:0.5rem}/*!@.g-xxl-3,\n.gx-xxl-3*/.g-xxl-3.sc-gw-show-and-tell,.gx-xxl-3.sc-gw-show-and-tell{--bs-gutter-x:1rem}/*!@.g-xxl-3,\n.gy-xxl-3*/.g-xxl-3.sc-gw-show-and-tell,.gy-xxl-3.sc-gw-show-and-tell{--bs-gutter-y:1rem}/*!@.g-xxl-4,\n.gx-xxl-4*/.g-xxl-4.sc-gw-show-and-tell,.gx-xxl-4.sc-gw-show-and-tell{--bs-gutter-x:1.5rem}/*!@.g-xxl-4,\n.gy-xxl-4*/.g-xxl-4.sc-gw-show-and-tell,.gy-xxl-4.sc-gw-show-and-tell{--bs-gutter-y:1.5rem}/*!@.g-xxl-5,\n.gx-xxl-5*/.g-xxl-5.sc-gw-show-and-tell,.gx-xxl-5.sc-gw-show-and-tell{--bs-gutter-x:3rem}/*!@.g-xxl-5,\n.gy-xxl-5*/.g-xxl-5.sc-gw-show-and-tell,.gy-xxl-5.sc-gw-show-and-tell{--bs-gutter-y:3rem}}/*!@.d-inline*/.d-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-inline-block*/.d-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-block*/.d-block.sc-gw-show-and-tell{display:block !important}/*!@.d-grid*/.d-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-table*/.d-table.sc-gw-show-and-tell{display:table !important}/*!@.d-table-row*/.d-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-table-cell*/.d-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-flex*/.d-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-inline-flex*/.d-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-none*/.d-none.sc-gw-show-and-tell{display:none !important}/*!@.flex-fill*/.flex-fill.sc-gw-show-and-tell{flex:1 1 auto !important}/*!@.flex-row*/.flex-row.sc-gw-show-and-tell{flex-direction:row !important}/*!@.flex-column*/.flex-column.sc-gw-show-and-tell{flex-direction:column !important}/*!@.flex-row-reverse*/.flex-row-reverse.sc-gw-show-and-tell{flex-direction:row-reverse !important}/*!@.flex-column-reverse*/.flex-column-reverse.sc-gw-show-and-tell{flex-direction:column-reverse !important}/*!@.flex-grow-0*/.flex-grow-0.sc-gw-show-and-tell{flex-grow:0 !important}/*!@.flex-grow-1*/.flex-grow-1.sc-gw-show-and-tell{flex-grow:1 !important}/*!@.flex-shrink-0*/.flex-shrink-0.sc-gw-show-and-tell{flex-shrink:0 !important}/*!@.flex-shrink-1*/.flex-shrink-1.sc-gw-show-and-tell{flex-shrink:1 !important}/*!@.flex-wrap*/.flex-wrap.sc-gw-show-and-tell{flex-wrap:wrap !important}/*!@.flex-nowrap*/.flex-nowrap.sc-gw-show-and-tell{flex-wrap:nowrap !important}/*!@.flex-wrap-reverse*/.flex-wrap-reverse.sc-gw-show-and-tell{flex-wrap:wrap-reverse !important}/*!@.justify-content-start*/.justify-content-start.sc-gw-show-and-tell{justify-content:flex-start !important}/*!@.justify-content-end*/.justify-content-end.sc-gw-show-and-tell{justify-content:flex-end !important}/*!@.justify-content-center*/.justify-content-center.sc-gw-show-and-tell{justify-content:center !important}/*!@.justify-content-between*/.justify-content-between.sc-gw-show-and-tell{justify-content:space-between !important}/*!@.justify-content-around*/.justify-content-around.sc-gw-show-and-tell{justify-content:space-around !important}/*!@.justify-content-evenly*/.justify-content-evenly.sc-gw-show-and-tell{justify-content:space-evenly !important}/*!@.align-items-start*/.align-items-start.sc-gw-show-and-tell{align-items:flex-start !important}/*!@.align-items-end*/.align-items-end.sc-gw-show-and-tell{align-items:flex-end !important}/*!@.align-items-center*/.align-items-center.sc-gw-show-and-tell{align-items:center !important}/*!@.align-items-baseline*/.align-items-baseline.sc-gw-show-and-tell{align-items:baseline !important}/*!@.align-items-stretch*/.align-items-stretch.sc-gw-show-and-tell{align-items:stretch !important}/*!@.align-content-start*/.align-content-start.sc-gw-show-and-tell{align-content:flex-start !important}/*!@.align-content-end*/.align-content-end.sc-gw-show-and-tell{align-content:flex-end !important}/*!@.align-content-center*/.align-content-center.sc-gw-show-and-tell{align-content:center !important}/*!@.align-content-between*/.align-content-between.sc-gw-show-and-tell{align-content:space-between !important}/*!@.align-content-around*/.align-content-around.sc-gw-show-and-tell{align-content:space-around !important}/*!@.align-content-stretch*/.align-content-stretch.sc-gw-show-and-tell{align-content:stretch !important}/*!@.align-self-auto*/.align-self-auto.sc-gw-show-and-tell{align-self:auto !important}/*!@.align-self-start*/.align-self-start.sc-gw-show-and-tell{align-self:flex-start !important}/*!@.align-self-end*/.align-self-end.sc-gw-show-and-tell{align-self:flex-end !important}/*!@.align-self-center*/.align-self-center.sc-gw-show-and-tell{align-self:center !important}/*!@.align-self-baseline*/.align-self-baseline.sc-gw-show-and-tell{align-self:baseline !important}/*!@.align-self-stretch*/.align-self-stretch.sc-gw-show-and-tell{align-self:stretch !important}/*!@.order-first*/.order-first.sc-gw-show-and-tell{order:-1 !important}/*!@.order-0*/.order-0.sc-gw-show-and-tell{order:0 !important}/*!@.order-1*/.order-1.sc-gw-show-and-tell{order:1 !important}/*!@.order-2*/.order-2.sc-gw-show-and-tell{order:2 !important}/*!@.order-3*/.order-3.sc-gw-show-and-tell{order:3 !important}/*!@.order-4*/.order-4.sc-gw-show-and-tell{order:4 !important}/*!@.order-5*/.order-5.sc-gw-show-and-tell{order:5 !important}/*!@.order-last*/.order-last.sc-gw-show-and-tell{order:6 !important}/*!@.m-0*/.m-0.sc-gw-show-and-tell{margin:0 !important}/*!@.m-1*/.m-1.sc-gw-show-and-tell{margin:0.25rem !important}/*!@.m-2*/.m-2.sc-gw-show-and-tell{margin:0.5rem !important}/*!@.m-3*/.m-3.sc-gw-show-and-tell{margin:1rem !important}/*!@.m-4*/.m-4.sc-gw-show-and-tell{margin:1.5rem !important}/*!@.m-5*/.m-5.sc-gw-show-and-tell{margin:3rem !important}/*!@.m-auto*/.m-auto.sc-gw-show-and-tell{margin:auto !important}/*!@.mx-0*/.mx-0.sc-gw-show-and-tell{margin-right:0 !important;margin-left:0 !important}/*!@.mx-1*/.mx-1.sc-gw-show-and-tell{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-2*/.mx-2.sc-gw-show-and-tell{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-3*/.mx-3.sc-gw-show-and-tell{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-4*/.mx-4.sc-gw-show-and-tell{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-5*/.mx-5.sc-gw-show-and-tell{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-auto*/.mx-auto.sc-gw-show-and-tell{margin-right:auto !important;margin-left:auto !important}/*!@.my-0*/.my-0.sc-gw-show-and-tell{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-1*/.my-1.sc-gw-show-and-tell{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-2*/.my-2.sc-gw-show-and-tell{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-3*/.my-3.sc-gw-show-and-tell{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-4*/.my-4.sc-gw-show-and-tell{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-5*/.my-5.sc-gw-show-and-tell{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-auto*/.my-auto.sc-gw-show-and-tell{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-0*/.mt-0.sc-gw-show-and-tell{margin-top:0 !important}/*!@.mt-1*/.mt-1.sc-gw-show-and-tell{margin-top:0.25rem !important}/*!@.mt-2*/.mt-2.sc-gw-show-and-tell{margin-top:0.5rem !important}/*!@.mt-3*/.mt-3.sc-gw-show-and-tell{margin-top:1rem !important}/*!@.mt-4*/.mt-4.sc-gw-show-and-tell{margin-top:1.5rem !important}/*!@.mt-5*/.mt-5.sc-gw-show-and-tell{margin-top:3rem !important}/*!@.mt-auto*/.mt-auto.sc-gw-show-and-tell{margin-top:auto !important}/*!@.me-0*/.me-0.sc-gw-show-and-tell{margin-right:0 !important}/*!@.me-1*/.me-1.sc-gw-show-and-tell{margin-right:0.25rem !important}/*!@.me-2*/.me-2.sc-gw-show-and-tell{margin-right:0.5rem !important}/*!@.me-3*/.me-3.sc-gw-show-and-tell{margin-right:1rem !important}/*!@.me-4*/.me-4.sc-gw-show-and-tell{margin-right:1.5rem !important}/*!@.me-5*/.me-5.sc-gw-show-and-tell{margin-right:3rem !important}/*!@.me-auto*/.me-auto.sc-gw-show-and-tell{margin-right:auto !important}/*!@.mb-0*/.mb-0.sc-gw-show-and-tell{margin-bottom:0 !important}/*!@.mb-1*/.mb-1.sc-gw-show-and-tell{margin-bottom:0.25rem !important}/*!@.mb-2*/.mb-2.sc-gw-show-and-tell{margin-bottom:0.5rem !important}/*!@.mb-3*/.mb-3.sc-gw-show-and-tell{margin-bottom:1rem !important}/*!@.mb-4*/.mb-4.sc-gw-show-and-tell{margin-bottom:1.5rem !important}/*!@.mb-5*/.mb-5.sc-gw-show-and-tell{margin-bottom:3rem !important}/*!@.mb-auto*/.mb-auto.sc-gw-show-and-tell{margin-bottom:auto !important}/*!@.ms-0*/.ms-0.sc-gw-show-and-tell{margin-left:0 !important}/*!@.ms-1*/.ms-1.sc-gw-show-and-tell{margin-left:0.25rem !important}/*!@.ms-2*/.ms-2.sc-gw-show-and-tell{margin-left:0.5rem !important}/*!@.ms-3*/.ms-3.sc-gw-show-and-tell{margin-left:1rem !important}/*!@.ms-4*/.ms-4.sc-gw-show-and-tell{margin-left:1.5rem !important}/*!@.ms-5*/.ms-5.sc-gw-show-and-tell{margin-left:3rem !important}/*!@.ms-auto*/.ms-auto.sc-gw-show-and-tell{margin-left:auto !important}/*!@.p-0*/.p-0.sc-gw-show-and-tell{padding:0 !important}/*!@.p-1*/.p-1.sc-gw-show-and-tell{padding:0.25rem !important}/*!@.p-2*/.p-2.sc-gw-show-and-tell{padding:0.5rem !important}/*!@.p-3*/.p-3.sc-gw-show-and-tell{padding:1rem !important}/*!@.p-4*/.p-4.sc-gw-show-and-tell{padding:1.5rem !important}/*!@.p-5*/.p-5.sc-gw-show-and-tell{padding:3rem !important}/*!@.px-0*/.px-0.sc-gw-show-and-tell{padding-right:0 !important;padding-left:0 !important}/*!@.px-1*/.px-1.sc-gw-show-and-tell{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-2*/.px-2.sc-gw-show-and-tell{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-3*/.px-3.sc-gw-show-and-tell{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-4*/.px-4.sc-gw-show-and-tell{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-5*/.px-5.sc-gw-show-and-tell{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-0*/.py-0.sc-gw-show-and-tell{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-1*/.py-1.sc-gw-show-and-tell{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-2*/.py-2.sc-gw-show-and-tell{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-3*/.py-3.sc-gw-show-and-tell{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-4*/.py-4.sc-gw-show-and-tell{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-5*/.py-5.sc-gw-show-and-tell{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-0*/.pt-0.sc-gw-show-and-tell{padding-top:0 !important}/*!@.pt-1*/.pt-1.sc-gw-show-and-tell{padding-top:0.25rem !important}/*!@.pt-2*/.pt-2.sc-gw-show-and-tell{padding-top:0.5rem !important}/*!@.pt-3*/.pt-3.sc-gw-show-and-tell{padding-top:1rem !important}/*!@.pt-4*/.pt-4.sc-gw-show-and-tell{padding-top:1.5rem !important}/*!@.pt-5*/.pt-5.sc-gw-show-and-tell{padding-top:3rem !important}/*!@.pe-0*/.pe-0.sc-gw-show-and-tell{padding-right:0 !important}/*!@.pe-1*/.pe-1.sc-gw-show-and-tell{padding-right:0.25rem !important}/*!@.pe-2*/.pe-2.sc-gw-show-and-tell{padding-right:0.5rem !important}/*!@.pe-3*/.pe-3.sc-gw-show-and-tell{padding-right:1rem !important}/*!@.pe-4*/.pe-4.sc-gw-show-and-tell{padding-right:1.5rem !important}/*!@.pe-5*/.pe-5.sc-gw-show-and-tell{padding-right:3rem !important}/*!@.pb-0*/.pb-0.sc-gw-show-and-tell{padding-bottom:0 !important}/*!@.pb-1*/.pb-1.sc-gw-show-and-tell{padding-bottom:0.25rem !important}/*!@.pb-2*/.pb-2.sc-gw-show-and-tell{padding-bottom:0.5rem !important}/*!@.pb-3*/.pb-3.sc-gw-show-and-tell{padding-bottom:1rem !important}/*!@.pb-4*/.pb-4.sc-gw-show-and-tell{padding-bottom:1.5rem !important}/*!@.pb-5*/.pb-5.sc-gw-show-and-tell{padding-bottom:3rem !important}/*!@.ps-0*/.ps-0.sc-gw-show-and-tell{padding-left:0 !important}/*!@.ps-1*/.ps-1.sc-gw-show-and-tell{padding-left:0.25rem !important}/*!@.ps-2*/.ps-2.sc-gw-show-and-tell{padding-left:0.5rem !important}/*!@.ps-3*/.ps-3.sc-gw-show-and-tell{padding-left:1rem !important}/*!@.ps-4*/.ps-4.sc-gw-show-and-tell{padding-left:1.5rem !important}/*!@.ps-5*/.ps-5.sc-gw-show-and-tell{padding-left:3rem !important}@media (min-width: 576px){/*!@.d-sm-inline*/.d-sm-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-sm-inline-block*/.d-sm-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-sm-block*/.d-sm-block.sc-gw-show-and-tell{display:block !important}/*!@.d-sm-grid*/.d-sm-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-sm-table*/.d-sm-table.sc-gw-show-and-tell{display:table !important}/*!@.d-sm-table-row*/.d-sm-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-sm-table-cell*/.d-sm-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-sm-flex*/.d-sm-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-sm-inline-flex*/.d-sm-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-sm-none*/.d-sm-none.sc-gw-show-and-tell{display:none !important}/*!@.flex-sm-fill*/.flex-sm-fill.sc-gw-show-and-tell{flex:1 1 auto !important}/*!@.flex-sm-row*/.flex-sm-row.sc-gw-show-and-tell{flex-direction:row !important}/*!@.flex-sm-column*/.flex-sm-column.sc-gw-show-and-tell{flex-direction:column !important}/*!@.flex-sm-row-reverse*/.flex-sm-row-reverse.sc-gw-show-and-tell{flex-direction:row-reverse !important}/*!@.flex-sm-column-reverse*/.flex-sm-column-reverse.sc-gw-show-and-tell{flex-direction:column-reverse !important}/*!@.flex-sm-grow-0*/.flex-sm-grow-0.sc-gw-show-and-tell{flex-grow:0 !important}/*!@.flex-sm-grow-1*/.flex-sm-grow-1.sc-gw-show-and-tell{flex-grow:1 !important}/*!@.flex-sm-shrink-0*/.flex-sm-shrink-0.sc-gw-show-and-tell{flex-shrink:0 !important}/*!@.flex-sm-shrink-1*/.flex-sm-shrink-1.sc-gw-show-and-tell{flex-shrink:1 !important}/*!@.flex-sm-wrap*/.flex-sm-wrap.sc-gw-show-and-tell{flex-wrap:wrap !important}/*!@.flex-sm-nowrap*/.flex-sm-nowrap.sc-gw-show-and-tell{flex-wrap:nowrap !important}/*!@.flex-sm-wrap-reverse*/.flex-sm-wrap-reverse.sc-gw-show-and-tell{flex-wrap:wrap-reverse !important}/*!@.justify-content-sm-start*/.justify-content-sm-start.sc-gw-show-and-tell{justify-content:flex-start !important}/*!@.justify-content-sm-end*/.justify-content-sm-end.sc-gw-show-and-tell{justify-content:flex-end !important}/*!@.justify-content-sm-center*/.justify-content-sm-center.sc-gw-show-and-tell{justify-content:center !important}/*!@.justify-content-sm-between*/.justify-content-sm-between.sc-gw-show-and-tell{justify-content:space-between !important}/*!@.justify-content-sm-around*/.justify-content-sm-around.sc-gw-show-and-tell{justify-content:space-around !important}/*!@.justify-content-sm-evenly*/.justify-content-sm-evenly.sc-gw-show-and-tell{justify-content:space-evenly !important}/*!@.align-items-sm-start*/.align-items-sm-start.sc-gw-show-and-tell{align-items:flex-start !important}/*!@.align-items-sm-end*/.align-items-sm-end.sc-gw-show-and-tell{align-items:flex-end !important}/*!@.align-items-sm-center*/.align-items-sm-center.sc-gw-show-and-tell{align-items:center !important}/*!@.align-items-sm-baseline*/.align-items-sm-baseline.sc-gw-show-and-tell{align-items:baseline !important}/*!@.align-items-sm-stretch*/.align-items-sm-stretch.sc-gw-show-and-tell{align-items:stretch !important}/*!@.align-content-sm-start*/.align-content-sm-start.sc-gw-show-and-tell{align-content:flex-start !important}/*!@.align-content-sm-end*/.align-content-sm-end.sc-gw-show-and-tell{align-content:flex-end !important}/*!@.align-content-sm-center*/.align-content-sm-center.sc-gw-show-and-tell{align-content:center !important}/*!@.align-content-sm-between*/.align-content-sm-between.sc-gw-show-and-tell{align-content:space-between !important}/*!@.align-content-sm-around*/.align-content-sm-around.sc-gw-show-and-tell{align-content:space-around !important}/*!@.align-content-sm-stretch*/.align-content-sm-stretch.sc-gw-show-and-tell{align-content:stretch !important}/*!@.align-self-sm-auto*/.align-self-sm-auto.sc-gw-show-and-tell{align-self:auto !important}/*!@.align-self-sm-start*/.align-self-sm-start.sc-gw-show-and-tell{align-self:flex-start !important}/*!@.align-self-sm-end*/.align-self-sm-end.sc-gw-show-and-tell{align-self:flex-end !important}/*!@.align-self-sm-center*/.align-self-sm-center.sc-gw-show-and-tell{align-self:center !important}/*!@.align-self-sm-baseline*/.align-self-sm-baseline.sc-gw-show-and-tell{align-self:baseline !important}/*!@.align-self-sm-stretch*/.align-self-sm-stretch.sc-gw-show-and-tell{align-self:stretch !important}/*!@.order-sm-first*/.order-sm-first.sc-gw-show-and-tell{order:-1 !important}/*!@.order-sm-0*/.order-sm-0.sc-gw-show-and-tell{order:0 !important}/*!@.order-sm-1*/.order-sm-1.sc-gw-show-and-tell{order:1 !important}/*!@.order-sm-2*/.order-sm-2.sc-gw-show-and-tell{order:2 !important}/*!@.order-sm-3*/.order-sm-3.sc-gw-show-and-tell{order:3 !important}/*!@.order-sm-4*/.order-sm-4.sc-gw-show-and-tell{order:4 !important}/*!@.order-sm-5*/.order-sm-5.sc-gw-show-and-tell{order:5 !important}/*!@.order-sm-last*/.order-sm-last.sc-gw-show-and-tell{order:6 !important}/*!@.m-sm-0*/.m-sm-0.sc-gw-show-and-tell{margin:0 !important}/*!@.m-sm-1*/.m-sm-1.sc-gw-show-and-tell{margin:0.25rem !important}/*!@.m-sm-2*/.m-sm-2.sc-gw-show-and-tell{margin:0.5rem !important}/*!@.m-sm-3*/.m-sm-3.sc-gw-show-and-tell{margin:1rem !important}/*!@.m-sm-4*/.m-sm-4.sc-gw-show-and-tell{margin:1.5rem !important}/*!@.m-sm-5*/.m-sm-5.sc-gw-show-and-tell{margin:3rem !important}/*!@.m-sm-auto*/.m-sm-auto.sc-gw-show-and-tell{margin:auto !important}/*!@.mx-sm-0*/.mx-sm-0.sc-gw-show-and-tell{margin-right:0 !important;margin-left:0 !important}/*!@.mx-sm-1*/.mx-sm-1.sc-gw-show-and-tell{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-sm-2*/.mx-sm-2.sc-gw-show-and-tell{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-sm-3*/.mx-sm-3.sc-gw-show-and-tell{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-sm-4*/.mx-sm-4.sc-gw-show-and-tell{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-sm-5*/.mx-sm-5.sc-gw-show-and-tell{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-sm-auto*/.mx-sm-auto.sc-gw-show-and-tell{margin-right:auto !important;margin-left:auto !important}/*!@.my-sm-0*/.my-sm-0.sc-gw-show-and-tell{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-sm-1*/.my-sm-1.sc-gw-show-and-tell{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-sm-2*/.my-sm-2.sc-gw-show-and-tell{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-sm-3*/.my-sm-3.sc-gw-show-and-tell{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-sm-4*/.my-sm-4.sc-gw-show-and-tell{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-sm-5*/.my-sm-5.sc-gw-show-and-tell{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-sm-auto*/.my-sm-auto.sc-gw-show-and-tell{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-sm-0*/.mt-sm-0.sc-gw-show-and-tell{margin-top:0 !important}/*!@.mt-sm-1*/.mt-sm-1.sc-gw-show-and-tell{margin-top:0.25rem !important}/*!@.mt-sm-2*/.mt-sm-2.sc-gw-show-and-tell{margin-top:0.5rem !important}/*!@.mt-sm-3*/.mt-sm-3.sc-gw-show-and-tell{margin-top:1rem !important}/*!@.mt-sm-4*/.mt-sm-4.sc-gw-show-and-tell{margin-top:1.5rem !important}/*!@.mt-sm-5*/.mt-sm-5.sc-gw-show-and-tell{margin-top:3rem !important}/*!@.mt-sm-auto*/.mt-sm-auto.sc-gw-show-and-tell{margin-top:auto !important}/*!@.me-sm-0*/.me-sm-0.sc-gw-show-and-tell{margin-right:0 !important}/*!@.me-sm-1*/.me-sm-1.sc-gw-show-and-tell{margin-right:0.25rem !important}/*!@.me-sm-2*/.me-sm-2.sc-gw-show-and-tell{margin-right:0.5rem !important}/*!@.me-sm-3*/.me-sm-3.sc-gw-show-and-tell{margin-right:1rem !important}/*!@.me-sm-4*/.me-sm-4.sc-gw-show-and-tell{margin-right:1.5rem !important}/*!@.me-sm-5*/.me-sm-5.sc-gw-show-and-tell{margin-right:3rem !important}/*!@.me-sm-auto*/.me-sm-auto.sc-gw-show-and-tell{margin-right:auto !important}/*!@.mb-sm-0*/.mb-sm-0.sc-gw-show-and-tell{margin-bottom:0 !important}/*!@.mb-sm-1*/.mb-sm-1.sc-gw-show-and-tell{margin-bottom:0.25rem !important}/*!@.mb-sm-2*/.mb-sm-2.sc-gw-show-and-tell{margin-bottom:0.5rem !important}/*!@.mb-sm-3*/.mb-sm-3.sc-gw-show-and-tell{margin-bottom:1rem !important}/*!@.mb-sm-4*/.mb-sm-4.sc-gw-show-and-tell{margin-bottom:1.5rem !important}/*!@.mb-sm-5*/.mb-sm-5.sc-gw-show-and-tell{margin-bottom:3rem !important}/*!@.mb-sm-auto*/.mb-sm-auto.sc-gw-show-and-tell{margin-bottom:auto !important}/*!@.ms-sm-0*/.ms-sm-0.sc-gw-show-and-tell{margin-left:0 !important}/*!@.ms-sm-1*/.ms-sm-1.sc-gw-show-and-tell{margin-left:0.25rem !important}/*!@.ms-sm-2*/.ms-sm-2.sc-gw-show-and-tell{margin-left:0.5rem !important}/*!@.ms-sm-3*/.ms-sm-3.sc-gw-show-and-tell{margin-left:1rem !important}/*!@.ms-sm-4*/.ms-sm-4.sc-gw-show-and-tell{margin-left:1.5rem !important}/*!@.ms-sm-5*/.ms-sm-5.sc-gw-show-and-tell{margin-left:3rem !important}/*!@.ms-sm-auto*/.ms-sm-auto.sc-gw-show-and-tell{margin-left:auto !important}/*!@.p-sm-0*/.p-sm-0.sc-gw-show-and-tell{padding:0 !important}/*!@.p-sm-1*/.p-sm-1.sc-gw-show-and-tell{padding:0.25rem !important}/*!@.p-sm-2*/.p-sm-2.sc-gw-show-and-tell{padding:0.5rem !important}/*!@.p-sm-3*/.p-sm-3.sc-gw-show-and-tell{padding:1rem !important}/*!@.p-sm-4*/.p-sm-4.sc-gw-show-and-tell{padding:1.5rem !important}/*!@.p-sm-5*/.p-sm-5.sc-gw-show-and-tell{padding:3rem !important}/*!@.px-sm-0*/.px-sm-0.sc-gw-show-and-tell{padding-right:0 !important;padding-left:0 !important}/*!@.px-sm-1*/.px-sm-1.sc-gw-show-and-tell{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-sm-2*/.px-sm-2.sc-gw-show-and-tell{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-sm-3*/.px-sm-3.sc-gw-show-and-tell{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-sm-4*/.px-sm-4.sc-gw-show-and-tell{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-sm-5*/.px-sm-5.sc-gw-show-and-tell{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-sm-0*/.py-sm-0.sc-gw-show-and-tell{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-sm-1*/.py-sm-1.sc-gw-show-and-tell{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-sm-2*/.py-sm-2.sc-gw-show-and-tell{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-sm-3*/.py-sm-3.sc-gw-show-and-tell{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-sm-4*/.py-sm-4.sc-gw-show-and-tell{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-sm-5*/.py-sm-5.sc-gw-show-and-tell{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-sm-0*/.pt-sm-0.sc-gw-show-and-tell{padding-top:0 !important}/*!@.pt-sm-1*/.pt-sm-1.sc-gw-show-and-tell{padding-top:0.25rem !important}/*!@.pt-sm-2*/.pt-sm-2.sc-gw-show-and-tell{padding-top:0.5rem !important}/*!@.pt-sm-3*/.pt-sm-3.sc-gw-show-and-tell{padding-top:1rem !important}/*!@.pt-sm-4*/.pt-sm-4.sc-gw-show-and-tell{padding-top:1.5rem !important}/*!@.pt-sm-5*/.pt-sm-5.sc-gw-show-and-tell{padding-top:3rem !important}/*!@.pe-sm-0*/.pe-sm-0.sc-gw-show-and-tell{padding-right:0 !important}/*!@.pe-sm-1*/.pe-sm-1.sc-gw-show-and-tell{padding-right:0.25rem !important}/*!@.pe-sm-2*/.pe-sm-2.sc-gw-show-and-tell{padding-right:0.5rem !important}/*!@.pe-sm-3*/.pe-sm-3.sc-gw-show-and-tell{padding-right:1rem !important}/*!@.pe-sm-4*/.pe-sm-4.sc-gw-show-and-tell{padding-right:1.5rem !important}/*!@.pe-sm-5*/.pe-sm-5.sc-gw-show-and-tell{padding-right:3rem !important}/*!@.pb-sm-0*/.pb-sm-0.sc-gw-show-and-tell{padding-bottom:0 !important}/*!@.pb-sm-1*/.pb-sm-1.sc-gw-show-and-tell{padding-bottom:0.25rem !important}/*!@.pb-sm-2*/.pb-sm-2.sc-gw-show-and-tell{padding-bottom:0.5rem !important}/*!@.pb-sm-3*/.pb-sm-3.sc-gw-show-and-tell{padding-bottom:1rem !important}/*!@.pb-sm-4*/.pb-sm-4.sc-gw-show-and-tell{padding-bottom:1.5rem !important}/*!@.pb-sm-5*/.pb-sm-5.sc-gw-show-and-tell{padding-bottom:3rem !important}/*!@.ps-sm-0*/.ps-sm-0.sc-gw-show-and-tell{padding-left:0 !important}/*!@.ps-sm-1*/.ps-sm-1.sc-gw-show-and-tell{padding-left:0.25rem !important}/*!@.ps-sm-2*/.ps-sm-2.sc-gw-show-and-tell{padding-left:0.5rem !important}/*!@.ps-sm-3*/.ps-sm-3.sc-gw-show-and-tell{padding-left:1rem !important}/*!@.ps-sm-4*/.ps-sm-4.sc-gw-show-and-tell{padding-left:1.5rem !important}/*!@.ps-sm-5*/.ps-sm-5.sc-gw-show-and-tell{padding-left:3rem !important}}@media (min-width: 768px){/*!@.d-md-inline*/.d-md-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-md-inline-block*/.d-md-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-md-block*/.d-md-block.sc-gw-show-and-tell{display:block !important}/*!@.d-md-grid*/.d-md-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-md-table*/.d-md-table.sc-gw-show-and-tell{display:table !important}/*!@.d-md-table-row*/.d-md-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-md-table-cell*/.d-md-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-md-flex*/.d-md-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-md-inline-flex*/.d-md-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-md-none*/.d-md-none.sc-gw-show-and-tell{display:none !important}/*!@.flex-md-fill*/.flex-md-fill.sc-gw-show-and-tell{flex:1 1 auto !important}/*!@.flex-md-row*/.flex-md-row.sc-gw-show-and-tell{flex-direction:row !important}/*!@.flex-md-column*/.flex-md-column.sc-gw-show-and-tell{flex-direction:column !important}/*!@.flex-md-row-reverse*/.flex-md-row-reverse.sc-gw-show-and-tell{flex-direction:row-reverse !important}/*!@.flex-md-column-reverse*/.flex-md-column-reverse.sc-gw-show-and-tell{flex-direction:column-reverse !important}/*!@.flex-md-grow-0*/.flex-md-grow-0.sc-gw-show-and-tell{flex-grow:0 !important}/*!@.flex-md-grow-1*/.flex-md-grow-1.sc-gw-show-and-tell{flex-grow:1 !important}/*!@.flex-md-shrink-0*/.flex-md-shrink-0.sc-gw-show-and-tell{flex-shrink:0 !important}/*!@.flex-md-shrink-1*/.flex-md-shrink-1.sc-gw-show-and-tell{flex-shrink:1 !important}/*!@.flex-md-wrap*/.flex-md-wrap.sc-gw-show-and-tell{flex-wrap:wrap !important}/*!@.flex-md-nowrap*/.flex-md-nowrap.sc-gw-show-and-tell{flex-wrap:nowrap !important}/*!@.flex-md-wrap-reverse*/.flex-md-wrap-reverse.sc-gw-show-and-tell{flex-wrap:wrap-reverse !important}/*!@.justify-content-md-start*/.justify-content-md-start.sc-gw-show-and-tell{justify-content:flex-start !important}/*!@.justify-content-md-end*/.justify-content-md-end.sc-gw-show-and-tell{justify-content:flex-end !important}/*!@.justify-content-md-center*/.justify-content-md-center.sc-gw-show-and-tell{justify-content:center !important}/*!@.justify-content-md-between*/.justify-content-md-between.sc-gw-show-and-tell{justify-content:space-between !important}/*!@.justify-content-md-around*/.justify-content-md-around.sc-gw-show-and-tell{justify-content:space-around !important}/*!@.justify-content-md-evenly*/.justify-content-md-evenly.sc-gw-show-and-tell{justify-content:space-evenly !important}/*!@.align-items-md-start*/.align-items-md-start.sc-gw-show-and-tell{align-items:flex-start !important}/*!@.align-items-md-end*/.align-items-md-end.sc-gw-show-and-tell{align-items:flex-end !important}/*!@.align-items-md-center*/.align-items-md-center.sc-gw-show-and-tell{align-items:center !important}/*!@.align-items-md-baseline*/.align-items-md-baseline.sc-gw-show-and-tell{align-items:baseline !important}/*!@.align-items-md-stretch*/.align-items-md-stretch.sc-gw-show-and-tell{align-items:stretch !important}/*!@.align-content-md-start*/.align-content-md-start.sc-gw-show-and-tell{align-content:flex-start !important}/*!@.align-content-md-end*/.align-content-md-end.sc-gw-show-and-tell{align-content:flex-end !important}/*!@.align-content-md-center*/.align-content-md-center.sc-gw-show-and-tell{align-content:center !important}/*!@.align-content-md-between*/.align-content-md-between.sc-gw-show-and-tell{align-content:space-between !important}/*!@.align-content-md-around*/.align-content-md-around.sc-gw-show-and-tell{align-content:space-around !important}/*!@.align-content-md-stretch*/.align-content-md-stretch.sc-gw-show-and-tell{align-content:stretch !important}/*!@.align-self-md-auto*/.align-self-md-auto.sc-gw-show-and-tell{align-self:auto !important}/*!@.align-self-md-start*/.align-self-md-start.sc-gw-show-and-tell{align-self:flex-start !important}/*!@.align-self-md-end*/.align-self-md-end.sc-gw-show-and-tell{align-self:flex-end !important}/*!@.align-self-md-center*/.align-self-md-center.sc-gw-show-and-tell{align-self:center !important}/*!@.align-self-md-baseline*/.align-self-md-baseline.sc-gw-show-and-tell{align-self:baseline !important}/*!@.align-self-md-stretch*/.align-self-md-stretch.sc-gw-show-and-tell{align-self:stretch !important}/*!@.order-md-first*/.order-md-first.sc-gw-show-and-tell{order:-1 !important}/*!@.order-md-0*/.order-md-0.sc-gw-show-and-tell{order:0 !important}/*!@.order-md-1*/.order-md-1.sc-gw-show-and-tell{order:1 !important}/*!@.order-md-2*/.order-md-2.sc-gw-show-and-tell{order:2 !important}/*!@.order-md-3*/.order-md-3.sc-gw-show-and-tell{order:3 !important}/*!@.order-md-4*/.order-md-4.sc-gw-show-and-tell{order:4 !important}/*!@.order-md-5*/.order-md-5.sc-gw-show-and-tell{order:5 !important}/*!@.order-md-last*/.order-md-last.sc-gw-show-and-tell{order:6 !important}/*!@.m-md-0*/.m-md-0.sc-gw-show-and-tell{margin:0 !important}/*!@.m-md-1*/.m-md-1.sc-gw-show-and-tell{margin:0.25rem !important}/*!@.m-md-2*/.m-md-2.sc-gw-show-and-tell{margin:0.5rem !important}/*!@.m-md-3*/.m-md-3.sc-gw-show-and-tell{margin:1rem !important}/*!@.m-md-4*/.m-md-4.sc-gw-show-and-tell{margin:1.5rem !important}/*!@.m-md-5*/.m-md-5.sc-gw-show-and-tell{margin:3rem !important}/*!@.m-md-auto*/.m-md-auto.sc-gw-show-and-tell{margin:auto !important}/*!@.mx-md-0*/.mx-md-0.sc-gw-show-and-tell{margin-right:0 !important;margin-left:0 !important}/*!@.mx-md-1*/.mx-md-1.sc-gw-show-and-tell{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-md-2*/.mx-md-2.sc-gw-show-and-tell{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-md-3*/.mx-md-3.sc-gw-show-and-tell{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-md-4*/.mx-md-4.sc-gw-show-and-tell{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-md-5*/.mx-md-5.sc-gw-show-and-tell{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-md-auto*/.mx-md-auto.sc-gw-show-and-tell{margin-right:auto !important;margin-left:auto !important}/*!@.my-md-0*/.my-md-0.sc-gw-show-and-tell{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-md-1*/.my-md-1.sc-gw-show-and-tell{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-md-2*/.my-md-2.sc-gw-show-and-tell{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-md-3*/.my-md-3.sc-gw-show-and-tell{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-md-4*/.my-md-4.sc-gw-show-and-tell{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-md-5*/.my-md-5.sc-gw-show-and-tell{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-md-auto*/.my-md-auto.sc-gw-show-and-tell{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-md-0*/.mt-md-0.sc-gw-show-and-tell{margin-top:0 !important}/*!@.mt-md-1*/.mt-md-1.sc-gw-show-and-tell{margin-top:0.25rem !important}/*!@.mt-md-2*/.mt-md-2.sc-gw-show-and-tell{margin-top:0.5rem !important}/*!@.mt-md-3*/.mt-md-3.sc-gw-show-and-tell{margin-top:1rem !important}/*!@.mt-md-4*/.mt-md-4.sc-gw-show-and-tell{margin-top:1.5rem !important}/*!@.mt-md-5*/.mt-md-5.sc-gw-show-and-tell{margin-top:3rem !important}/*!@.mt-md-auto*/.mt-md-auto.sc-gw-show-and-tell{margin-top:auto !important}/*!@.me-md-0*/.me-md-0.sc-gw-show-and-tell{margin-right:0 !important}/*!@.me-md-1*/.me-md-1.sc-gw-show-and-tell{margin-right:0.25rem !important}/*!@.me-md-2*/.me-md-2.sc-gw-show-and-tell{margin-right:0.5rem !important}/*!@.me-md-3*/.me-md-3.sc-gw-show-and-tell{margin-right:1rem !important}/*!@.me-md-4*/.me-md-4.sc-gw-show-and-tell{margin-right:1.5rem !important}/*!@.me-md-5*/.me-md-5.sc-gw-show-and-tell{margin-right:3rem !important}/*!@.me-md-auto*/.me-md-auto.sc-gw-show-and-tell{margin-right:auto !important}/*!@.mb-md-0*/.mb-md-0.sc-gw-show-and-tell{margin-bottom:0 !important}/*!@.mb-md-1*/.mb-md-1.sc-gw-show-and-tell{margin-bottom:0.25rem !important}/*!@.mb-md-2*/.mb-md-2.sc-gw-show-and-tell{margin-bottom:0.5rem !important}/*!@.mb-md-3*/.mb-md-3.sc-gw-show-and-tell{margin-bottom:1rem !important}/*!@.mb-md-4*/.mb-md-4.sc-gw-show-and-tell{margin-bottom:1.5rem !important}/*!@.mb-md-5*/.mb-md-5.sc-gw-show-and-tell{margin-bottom:3rem !important}/*!@.mb-md-auto*/.mb-md-auto.sc-gw-show-and-tell{margin-bottom:auto !important}/*!@.ms-md-0*/.ms-md-0.sc-gw-show-and-tell{margin-left:0 !important}/*!@.ms-md-1*/.ms-md-1.sc-gw-show-and-tell{margin-left:0.25rem !important}/*!@.ms-md-2*/.ms-md-2.sc-gw-show-and-tell{margin-left:0.5rem !important}/*!@.ms-md-3*/.ms-md-3.sc-gw-show-and-tell{margin-left:1rem !important}/*!@.ms-md-4*/.ms-md-4.sc-gw-show-and-tell{margin-left:1.5rem !important}/*!@.ms-md-5*/.ms-md-5.sc-gw-show-and-tell{margin-left:3rem !important}/*!@.ms-md-auto*/.ms-md-auto.sc-gw-show-and-tell{margin-left:auto !important}/*!@.p-md-0*/.p-md-0.sc-gw-show-and-tell{padding:0 !important}/*!@.p-md-1*/.p-md-1.sc-gw-show-and-tell{padding:0.25rem !important}/*!@.p-md-2*/.p-md-2.sc-gw-show-and-tell{padding:0.5rem !important}/*!@.p-md-3*/.p-md-3.sc-gw-show-and-tell{padding:1rem !important}/*!@.p-md-4*/.p-md-4.sc-gw-show-and-tell{padding:1.5rem !important}/*!@.p-md-5*/.p-md-5.sc-gw-show-and-tell{padding:3rem !important}/*!@.px-md-0*/.px-md-0.sc-gw-show-and-tell{padding-right:0 !important;padding-left:0 !important}/*!@.px-md-1*/.px-md-1.sc-gw-show-and-tell{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-md-2*/.px-md-2.sc-gw-show-and-tell{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-md-3*/.px-md-3.sc-gw-show-and-tell{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-md-4*/.px-md-4.sc-gw-show-and-tell{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-md-5*/.px-md-5.sc-gw-show-and-tell{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-md-0*/.py-md-0.sc-gw-show-and-tell{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-md-1*/.py-md-1.sc-gw-show-and-tell{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-md-2*/.py-md-2.sc-gw-show-and-tell{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-md-3*/.py-md-3.sc-gw-show-and-tell{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-md-4*/.py-md-4.sc-gw-show-and-tell{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-md-5*/.py-md-5.sc-gw-show-and-tell{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-md-0*/.pt-md-0.sc-gw-show-and-tell{padding-top:0 !important}/*!@.pt-md-1*/.pt-md-1.sc-gw-show-and-tell{padding-top:0.25rem !important}/*!@.pt-md-2*/.pt-md-2.sc-gw-show-and-tell{padding-top:0.5rem !important}/*!@.pt-md-3*/.pt-md-3.sc-gw-show-and-tell{padding-top:1rem !important}/*!@.pt-md-4*/.pt-md-4.sc-gw-show-and-tell{padding-top:1.5rem !important}/*!@.pt-md-5*/.pt-md-5.sc-gw-show-and-tell{padding-top:3rem !important}/*!@.pe-md-0*/.pe-md-0.sc-gw-show-and-tell{padding-right:0 !important}/*!@.pe-md-1*/.pe-md-1.sc-gw-show-and-tell{padding-right:0.25rem !important}/*!@.pe-md-2*/.pe-md-2.sc-gw-show-and-tell{padding-right:0.5rem !important}/*!@.pe-md-3*/.pe-md-3.sc-gw-show-and-tell{padding-right:1rem !important}/*!@.pe-md-4*/.pe-md-4.sc-gw-show-and-tell{padding-right:1.5rem !important}/*!@.pe-md-5*/.pe-md-5.sc-gw-show-and-tell{padding-right:3rem !important}/*!@.pb-md-0*/.pb-md-0.sc-gw-show-and-tell{padding-bottom:0 !important}/*!@.pb-md-1*/.pb-md-1.sc-gw-show-and-tell{padding-bottom:0.25rem !important}/*!@.pb-md-2*/.pb-md-2.sc-gw-show-and-tell{padding-bottom:0.5rem !important}/*!@.pb-md-3*/.pb-md-3.sc-gw-show-and-tell{padding-bottom:1rem !important}/*!@.pb-md-4*/.pb-md-4.sc-gw-show-and-tell{padding-bottom:1.5rem !important}/*!@.pb-md-5*/.pb-md-5.sc-gw-show-and-tell{padding-bottom:3rem !important}/*!@.ps-md-0*/.ps-md-0.sc-gw-show-and-tell{padding-left:0 !important}/*!@.ps-md-1*/.ps-md-1.sc-gw-show-and-tell{padding-left:0.25rem !important}/*!@.ps-md-2*/.ps-md-2.sc-gw-show-and-tell{padding-left:0.5rem !important}/*!@.ps-md-3*/.ps-md-3.sc-gw-show-and-tell{padding-left:1rem !important}/*!@.ps-md-4*/.ps-md-4.sc-gw-show-and-tell{padding-left:1.5rem !important}/*!@.ps-md-5*/.ps-md-5.sc-gw-show-and-tell{padding-left:3rem !important}}@media (min-width: 992px){/*!@.d-lg-inline*/.d-lg-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-lg-inline-block*/.d-lg-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-lg-block*/.d-lg-block.sc-gw-show-and-tell{display:block !important}/*!@.d-lg-grid*/.d-lg-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-lg-table*/.d-lg-table.sc-gw-show-and-tell{display:table !important}/*!@.d-lg-table-row*/.d-lg-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-lg-table-cell*/.d-lg-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-lg-flex*/.d-lg-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-lg-inline-flex*/.d-lg-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-lg-none*/.d-lg-none.sc-gw-show-and-tell{display:none !important}/*!@.flex-lg-fill*/.flex-lg-fill.sc-gw-show-and-tell{flex:1 1 auto !important}/*!@.flex-lg-row*/.flex-lg-row.sc-gw-show-and-tell{flex-direction:row !important}/*!@.flex-lg-column*/.flex-lg-column.sc-gw-show-and-tell{flex-direction:column !important}/*!@.flex-lg-row-reverse*/.flex-lg-row-reverse.sc-gw-show-and-tell{flex-direction:row-reverse !important}/*!@.flex-lg-column-reverse*/.flex-lg-column-reverse.sc-gw-show-and-tell{flex-direction:column-reverse !important}/*!@.flex-lg-grow-0*/.flex-lg-grow-0.sc-gw-show-and-tell{flex-grow:0 !important}/*!@.flex-lg-grow-1*/.flex-lg-grow-1.sc-gw-show-and-tell{flex-grow:1 !important}/*!@.flex-lg-shrink-0*/.flex-lg-shrink-0.sc-gw-show-and-tell{flex-shrink:0 !important}/*!@.flex-lg-shrink-1*/.flex-lg-shrink-1.sc-gw-show-and-tell{flex-shrink:1 !important}/*!@.flex-lg-wrap*/.flex-lg-wrap.sc-gw-show-and-tell{flex-wrap:wrap !important}/*!@.flex-lg-nowrap*/.flex-lg-nowrap.sc-gw-show-and-tell{flex-wrap:nowrap !important}/*!@.flex-lg-wrap-reverse*/.flex-lg-wrap-reverse.sc-gw-show-and-tell{flex-wrap:wrap-reverse !important}/*!@.justify-content-lg-start*/.justify-content-lg-start.sc-gw-show-and-tell{justify-content:flex-start !important}/*!@.justify-content-lg-end*/.justify-content-lg-end.sc-gw-show-and-tell{justify-content:flex-end !important}/*!@.justify-content-lg-center*/.justify-content-lg-center.sc-gw-show-and-tell{justify-content:center !important}/*!@.justify-content-lg-between*/.justify-content-lg-between.sc-gw-show-and-tell{justify-content:space-between !important}/*!@.justify-content-lg-around*/.justify-content-lg-around.sc-gw-show-and-tell{justify-content:space-around !important}/*!@.justify-content-lg-evenly*/.justify-content-lg-evenly.sc-gw-show-and-tell{justify-content:space-evenly !important}/*!@.align-items-lg-start*/.align-items-lg-start.sc-gw-show-and-tell{align-items:flex-start !important}/*!@.align-items-lg-end*/.align-items-lg-end.sc-gw-show-and-tell{align-items:flex-end !important}/*!@.align-items-lg-center*/.align-items-lg-center.sc-gw-show-and-tell{align-items:center !important}/*!@.align-items-lg-baseline*/.align-items-lg-baseline.sc-gw-show-and-tell{align-items:baseline !important}/*!@.align-items-lg-stretch*/.align-items-lg-stretch.sc-gw-show-and-tell{align-items:stretch !important}/*!@.align-content-lg-start*/.align-content-lg-start.sc-gw-show-and-tell{align-content:flex-start !important}/*!@.align-content-lg-end*/.align-content-lg-end.sc-gw-show-and-tell{align-content:flex-end !important}/*!@.align-content-lg-center*/.align-content-lg-center.sc-gw-show-and-tell{align-content:center !important}/*!@.align-content-lg-between*/.align-content-lg-between.sc-gw-show-and-tell{align-content:space-between !important}/*!@.align-content-lg-around*/.align-content-lg-around.sc-gw-show-and-tell{align-content:space-around !important}/*!@.align-content-lg-stretch*/.align-content-lg-stretch.sc-gw-show-and-tell{align-content:stretch !important}/*!@.align-self-lg-auto*/.align-self-lg-auto.sc-gw-show-and-tell{align-self:auto !important}/*!@.align-self-lg-start*/.align-self-lg-start.sc-gw-show-and-tell{align-self:flex-start !important}/*!@.align-self-lg-end*/.align-self-lg-end.sc-gw-show-and-tell{align-self:flex-end !important}/*!@.align-self-lg-center*/.align-self-lg-center.sc-gw-show-and-tell{align-self:center !important}/*!@.align-self-lg-baseline*/.align-self-lg-baseline.sc-gw-show-and-tell{align-self:baseline !important}/*!@.align-self-lg-stretch*/.align-self-lg-stretch.sc-gw-show-and-tell{align-self:stretch !important}/*!@.order-lg-first*/.order-lg-first.sc-gw-show-and-tell{order:-1 !important}/*!@.order-lg-0*/.order-lg-0.sc-gw-show-and-tell{order:0 !important}/*!@.order-lg-1*/.order-lg-1.sc-gw-show-and-tell{order:1 !important}/*!@.order-lg-2*/.order-lg-2.sc-gw-show-and-tell{order:2 !important}/*!@.order-lg-3*/.order-lg-3.sc-gw-show-and-tell{order:3 !important}/*!@.order-lg-4*/.order-lg-4.sc-gw-show-and-tell{order:4 !important}/*!@.order-lg-5*/.order-lg-5.sc-gw-show-and-tell{order:5 !important}/*!@.order-lg-last*/.order-lg-last.sc-gw-show-and-tell{order:6 !important}/*!@.m-lg-0*/.m-lg-0.sc-gw-show-and-tell{margin:0 !important}/*!@.m-lg-1*/.m-lg-1.sc-gw-show-and-tell{margin:0.25rem !important}/*!@.m-lg-2*/.m-lg-2.sc-gw-show-and-tell{margin:0.5rem !important}/*!@.m-lg-3*/.m-lg-3.sc-gw-show-and-tell{margin:1rem !important}/*!@.m-lg-4*/.m-lg-4.sc-gw-show-and-tell{margin:1.5rem !important}/*!@.m-lg-5*/.m-lg-5.sc-gw-show-and-tell{margin:3rem !important}/*!@.m-lg-auto*/.m-lg-auto.sc-gw-show-and-tell{margin:auto !important}/*!@.mx-lg-0*/.mx-lg-0.sc-gw-show-and-tell{margin-right:0 !important;margin-left:0 !important}/*!@.mx-lg-1*/.mx-lg-1.sc-gw-show-and-tell{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-lg-2*/.mx-lg-2.sc-gw-show-and-tell{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-lg-3*/.mx-lg-3.sc-gw-show-and-tell{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-lg-4*/.mx-lg-4.sc-gw-show-and-tell{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-lg-5*/.mx-lg-5.sc-gw-show-and-tell{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-lg-auto*/.mx-lg-auto.sc-gw-show-and-tell{margin-right:auto !important;margin-left:auto !important}/*!@.my-lg-0*/.my-lg-0.sc-gw-show-and-tell{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-lg-1*/.my-lg-1.sc-gw-show-and-tell{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-lg-2*/.my-lg-2.sc-gw-show-and-tell{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-lg-3*/.my-lg-3.sc-gw-show-and-tell{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-lg-4*/.my-lg-4.sc-gw-show-and-tell{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-lg-5*/.my-lg-5.sc-gw-show-and-tell{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-lg-auto*/.my-lg-auto.sc-gw-show-and-tell{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-lg-0*/.mt-lg-0.sc-gw-show-and-tell{margin-top:0 !important}/*!@.mt-lg-1*/.mt-lg-1.sc-gw-show-and-tell{margin-top:0.25rem !important}/*!@.mt-lg-2*/.mt-lg-2.sc-gw-show-and-tell{margin-top:0.5rem !important}/*!@.mt-lg-3*/.mt-lg-3.sc-gw-show-and-tell{margin-top:1rem !important}/*!@.mt-lg-4*/.mt-lg-4.sc-gw-show-and-tell{margin-top:1.5rem !important}/*!@.mt-lg-5*/.mt-lg-5.sc-gw-show-and-tell{margin-top:3rem !important}/*!@.mt-lg-auto*/.mt-lg-auto.sc-gw-show-and-tell{margin-top:auto !important}/*!@.me-lg-0*/.me-lg-0.sc-gw-show-and-tell{margin-right:0 !important}/*!@.me-lg-1*/.me-lg-1.sc-gw-show-and-tell{margin-right:0.25rem !important}/*!@.me-lg-2*/.me-lg-2.sc-gw-show-and-tell{margin-right:0.5rem !important}/*!@.me-lg-3*/.me-lg-3.sc-gw-show-and-tell{margin-right:1rem !important}/*!@.me-lg-4*/.me-lg-4.sc-gw-show-and-tell{margin-right:1.5rem !important}/*!@.me-lg-5*/.me-lg-5.sc-gw-show-and-tell{margin-right:3rem !important}/*!@.me-lg-auto*/.me-lg-auto.sc-gw-show-and-tell{margin-right:auto !important}/*!@.mb-lg-0*/.mb-lg-0.sc-gw-show-and-tell{margin-bottom:0 !important}/*!@.mb-lg-1*/.mb-lg-1.sc-gw-show-and-tell{margin-bottom:0.25rem !important}/*!@.mb-lg-2*/.mb-lg-2.sc-gw-show-and-tell{margin-bottom:0.5rem !important}/*!@.mb-lg-3*/.mb-lg-3.sc-gw-show-and-tell{margin-bottom:1rem !important}/*!@.mb-lg-4*/.mb-lg-4.sc-gw-show-and-tell{margin-bottom:1.5rem !important}/*!@.mb-lg-5*/.mb-lg-5.sc-gw-show-and-tell{margin-bottom:3rem !important}/*!@.mb-lg-auto*/.mb-lg-auto.sc-gw-show-and-tell{margin-bottom:auto !important}/*!@.ms-lg-0*/.ms-lg-0.sc-gw-show-and-tell{margin-left:0 !important}/*!@.ms-lg-1*/.ms-lg-1.sc-gw-show-and-tell{margin-left:0.25rem !important}/*!@.ms-lg-2*/.ms-lg-2.sc-gw-show-and-tell{margin-left:0.5rem !important}/*!@.ms-lg-3*/.ms-lg-3.sc-gw-show-and-tell{margin-left:1rem !important}/*!@.ms-lg-4*/.ms-lg-4.sc-gw-show-and-tell{margin-left:1.5rem !important}/*!@.ms-lg-5*/.ms-lg-5.sc-gw-show-and-tell{margin-left:3rem !important}/*!@.ms-lg-auto*/.ms-lg-auto.sc-gw-show-and-tell{margin-left:auto !important}/*!@.p-lg-0*/.p-lg-0.sc-gw-show-and-tell{padding:0 !important}/*!@.p-lg-1*/.p-lg-1.sc-gw-show-and-tell{padding:0.25rem !important}/*!@.p-lg-2*/.p-lg-2.sc-gw-show-and-tell{padding:0.5rem !important}/*!@.p-lg-3*/.p-lg-3.sc-gw-show-and-tell{padding:1rem !important}/*!@.p-lg-4*/.p-lg-4.sc-gw-show-and-tell{padding:1.5rem !important}/*!@.p-lg-5*/.p-lg-5.sc-gw-show-and-tell{padding:3rem !important}/*!@.px-lg-0*/.px-lg-0.sc-gw-show-and-tell{padding-right:0 !important;padding-left:0 !important}/*!@.px-lg-1*/.px-lg-1.sc-gw-show-and-tell{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-lg-2*/.px-lg-2.sc-gw-show-and-tell{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-lg-3*/.px-lg-3.sc-gw-show-and-tell{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-lg-4*/.px-lg-4.sc-gw-show-and-tell{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-lg-5*/.px-lg-5.sc-gw-show-and-tell{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-lg-0*/.py-lg-0.sc-gw-show-and-tell{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-lg-1*/.py-lg-1.sc-gw-show-and-tell{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-lg-2*/.py-lg-2.sc-gw-show-and-tell{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-lg-3*/.py-lg-3.sc-gw-show-and-tell{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-lg-4*/.py-lg-4.sc-gw-show-and-tell{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-lg-5*/.py-lg-5.sc-gw-show-and-tell{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-lg-0*/.pt-lg-0.sc-gw-show-and-tell{padding-top:0 !important}/*!@.pt-lg-1*/.pt-lg-1.sc-gw-show-and-tell{padding-top:0.25rem !important}/*!@.pt-lg-2*/.pt-lg-2.sc-gw-show-and-tell{padding-top:0.5rem !important}/*!@.pt-lg-3*/.pt-lg-3.sc-gw-show-and-tell{padding-top:1rem !important}/*!@.pt-lg-4*/.pt-lg-4.sc-gw-show-and-tell{padding-top:1.5rem !important}/*!@.pt-lg-5*/.pt-lg-5.sc-gw-show-and-tell{padding-top:3rem !important}/*!@.pe-lg-0*/.pe-lg-0.sc-gw-show-and-tell{padding-right:0 !important}/*!@.pe-lg-1*/.pe-lg-1.sc-gw-show-and-tell{padding-right:0.25rem !important}/*!@.pe-lg-2*/.pe-lg-2.sc-gw-show-and-tell{padding-right:0.5rem !important}/*!@.pe-lg-3*/.pe-lg-3.sc-gw-show-and-tell{padding-right:1rem !important}/*!@.pe-lg-4*/.pe-lg-4.sc-gw-show-and-tell{padding-right:1.5rem !important}/*!@.pe-lg-5*/.pe-lg-5.sc-gw-show-and-tell{padding-right:3rem !important}/*!@.pb-lg-0*/.pb-lg-0.sc-gw-show-and-tell{padding-bottom:0 !important}/*!@.pb-lg-1*/.pb-lg-1.sc-gw-show-and-tell{padding-bottom:0.25rem !important}/*!@.pb-lg-2*/.pb-lg-2.sc-gw-show-and-tell{padding-bottom:0.5rem !important}/*!@.pb-lg-3*/.pb-lg-3.sc-gw-show-and-tell{padding-bottom:1rem !important}/*!@.pb-lg-4*/.pb-lg-4.sc-gw-show-and-tell{padding-bottom:1.5rem !important}/*!@.pb-lg-5*/.pb-lg-5.sc-gw-show-and-tell{padding-bottom:3rem !important}/*!@.ps-lg-0*/.ps-lg-0.sc-gw-show-and-tell{padding-left:0 !important}/*!@.ps-lg-1*/.ps-lg-1.sc-gw-show-and-tell{padding-left:0.25rem !important}/*!@.ps-lg-2*/.ps-lg-2.sc-gw-show-and-tell{padding-left:0.5rem !important}/*!@.ps-lg-3*/.ps-lg-3.sc-gw-show-and-tell{padding-left:1rem !important}/*!@.ps-lg-4*/.ps-lg-4.sc-gw-show-and-tell{padding-left:1.5rem !important}/*!@.ps-lg-5*/.ps-lg-5.sc-gw-show-and-tell{padding-left:3rem !important}}@media (min-width: 1200px){/*!@.d-xl-inline*/.d-xl-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-xl-inline-block*/.d-xl-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-xl-block*/.d-xl-block.sc-gw-show-and-tell{display:block !important}/*!@.d-xl-grid*/.d-xl-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-xl-table*/.d-xl-table.sc-gw-show-and-tell{display:table !important}/*!@.d-xl-table-row*/.d-xl-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-xl-table-cell*/.d-xl-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-xl-flex*/.d-xl-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-xl-inline-flex*/.d-xl-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-xl-none*/.d-xl-none.sc-gw-show-and-tell{display:none !important}/*!@.flex-xl-fill*/.flex-xl-fill.sc-gw-show-and-tell{flex:1 1 auto !important}/*!@.flex-xl-row*/.flex-xl-row.sc-gw-show-and-tell{flex-direction:row !important}/*!@.flex-xl-column*/.flex-xl-column.sc-gw-show-and-tell{flex-direction:column !important}/*!@.flex-xl-row-reverse*/.flex-xl-row-reverse.sc-gw-show-and-tell{flex-direction:row-reverse !important}/*!@.flex-xl-column-reverse*/.flex-xl-column-reverse.sc-gw-show-and-tell{flex-direction:column-reverse !important}/*!@.flex-xl-grow-0*/.flex-xl-grow-0.sc-gw-show-and-tell{flex-grow:0 !important}/*!@.flex-xl-grow-1*/.flex-xl-grow-1.sc-gw-show-and-tell{flex-grow:1 !important}/*!@.flex-xl-shrink-0*/.flex-xl-shrink-0.sc-gw-show-and-tell{flex-shrink:0 !important}/*!@.flex-xl-shrink-1*/.flex-xl-shrink-1.sc-gw-show-and-tell{flex-shrink:1 !important}/*!@.flex-xl-wrap*/.flex-xl-wrap.sc-gw-show-and-tell{flex-wrap:wrap !important}/*!@.flex-xl-nowrap*/.flex-xl-nowrap.sc-gw-show-and-tell{flex-wrap:nowrap !important}/*!@.flex-xl-wrap-reverse*/.flex-xl-wrap-reverse.sc-gw-show-and-tell{flex-wrap:wrap-reverse !important}/*!@.justify-content-xl-start*/.justify-content-xl-start.sc-gw-show-and-tell{justify-content:flex-start !important}/*!@.justify-content-xl-end*/.justify-content-xl-end.sc-gw-show-and-tell{justify-content:flex-end !important}/*!@.justify-content-xl-center*/.justify-content-xl-center.sc-gw-show-and-tell{justify-content:center !important}/*!@.justify-content-xl-between*/.justify-content-xl-between.sc-gw-show-and-tell{justify-content:space-between !important}/*!@.justify-content-xl-around*/.justify-content-xl-around.sc-gw-show-and-tell{justify-content:space-around !important}/*!@.justify-content-xl-evenly*/.justify-content-xl-evenly.sc-gw-show-and-tell{justify-content:space-evenly !important}/*!@.align-items-xl-start*/.align-items-xl-start.sc-gw-show-and-tell{align-items:flex-start !important}/*!@.align-items-xl-end*/.align-items-xl-end.sc-gw-show-and-tell{align-items:flex-end !important}/*!@.align-items-xl-center*/.align-items-xl-center.sc-gw-show-and-tell{align-items:center !important}/*!@.align-items-xl-baseline*/.align-items-xl-baseline.sc-gw-show-and-tell{align-items:baseline !important}/*!@.align-items-xl-stretch*/.align-items-xl-stretch.sc-gw-show-and-tell{align-items:stretch !important}/*!@.align-content-xl-start*/.align-content-xl-start.sc-gw-show-and-tell{align-content:flex-start !important}/*!@.align-content-xl-end*/.align-content-xl-end.sc-gw-show-and-tell{align-content:flex-end !important}/*!@.align-content-xl-center*/.align-content-xl-center.sc-gw-show-and-tell{align-content:center !important}/*!@.align-content-xl-between*/.align-content-xl-between.sc-gw-show-and-tell{align-content:space-between !important}/*!@.align-content-xl-around*/.align-content-xl-around.sc-gw-show-and-tell{align-content:space-around !important}/*!@.align-content-xl-stretch*/.align-content-xl-stretch.sc-gw-show-and-tell{align-content:stretch !important}/*!@.align-self-xl-auto*/.align-self-xl-auto.sc-gw-show-and-tell{align-self:auto !important}/*!@.align-self-xl-start*/.align-self-xl-start.sc-gw-show-and-tell{align-self:flex-start !important}/*!@.align-self-xl-end*/.align-self-xl-end.sc-gw-show-and-tell{align-self:flex-end !important}/*!@.align-self-xl-center*/.align-self-xl-center.sc-gw-show-and-tell{align-self:center !important}/*!@.align-self-xl-baseline*/.align-self-xl-baseline.sc-gw-show-and-tell{align-self:baseline !important}/*!@.align-self-xl-stretch*/.align-self-xl-stretch.sc-gw-show-and-tell{align-self:stretch !important}/*!@.order-xl-first*/.order-xl-first.sc-gw-show-and-tell{order:-1 !important}/*!@.order-xl-0*/.order-xl-0.sc-gw-show-and-tell{order:0 !important}/*!@.order-xl-1*/.order-xl-1.sc-gw-show-and-tell{order:1 !important}/*!@.order-xl-2*/.order-xl-2.sc-gw-show-and-tell{order:2 !important}/*!@.order-xl-3*/.order-xl-3.sc-gw-show-and-tell{order:3 !important}/*!@.order-xl-4*/.order-xl-4.sc-gw-show-and-tell{order:4 !important}/*!@.order-xl-5*/.order-xl-5.sc-gw-show-and-tell{order:5 !important}/*!@.order-xl-last*/.order-xl-last.sc-gw-show-and-tell{order:6 !important}/*!@.m-xl-0*/.m-xl-0.sc-gw-show-and-tell{margin:0 !important}/*!@.m-xl-1*/.m-xl-1.sc-gw-show-and-tell{margin:0.25rem !important}/*!@.m-xl-2*/.m-xl-2.sc-gw-show-and-tell{margin:0.5rem !important}/*!@.m-xl-3*/.m-xl-3.sc-gw-show-and-tell{margin:1rem !important}/*!@.m-xl-4*/.m-xl-4.sc-gw-show-and-tell{margin:1.5rem !important}/*!@.m-xl-5*/.m-xl-5.sc-gw-show-and-tell{margin:3rem !important}/*!@.m-xl-auto*/.m-xl-auto.sc-gw-show-and-tell{margin:auto !important}/*!@.mx-xl-0*/.mx-xl-0.sc-gw-show-and-tell{margin-right:0 !important;margin-left:0 !important}/*!@.mx-xl-1*/.mx-xl-1.sc-gw-show-and-tell{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-xl-2*/.mx-xl-2.sc-gw-show-and-tell{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-xl-3*/.mx-xl-3.sc-gw-show-and-tell{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-xl-4*/.mx-xl-4.sc-gw-show-and-tell{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-xl-5*/.mx-xl-5.sc-gw-show-and-tell{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-xl-auto*/.mx-xl-auto.sc-gw-show-and-tell{margin-right:auto !important;margin-left:auto !important}/*!@.my-xl-0*/.my-xl-0.sc-gw-show-and-tell{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-xl-1*/.my-xl-1.sc-gw-show-and-tell{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-xl-2*/.my-xl-2.sc-gw-show-and-tell{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-xl-3*/.my-xl-3.sc-gw-show-and-tell{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-xl-4*/.my-xl-4.sc-gw-show-and-tell{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-xl-5*/.my-xl-5.sc-gw-show-and-tell{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-xl-auto*/.my-xl-auto.sc-gw-show-and-tell{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-xl-0*/.mt-xl-0.sc-gw-show-and-tell{margin-top:0 !important}/*!@.mt-xl-1*/.mt-xl-1.sc-gw-show-and-tell{margin-top:0.25rem !important}/*!@.mt-xl-2*/.mt-xl-2.sc-gw-show-and-tell{margin-top:0.5rem !important}/*!@.mt-xl-3*/.mt-xl-3.sc-gw-show-and-tell{margin-top:1rem !important}/*!@.mt-xl-4*/.mt-xl-4.sc-gw-show-and-tell{margin-top:1.5rem !important}/*!@.mt-xl-5*/.mt-xl-5.sc-gw-show-and-tell{margin-top:3rem !important}/*!@.mt-xl-auto*/.mt-xl-auto.sc-gw-show-and-tell{margin-top:auto !important}/*!@.me-xl-0*/.me-xl-0.sc-gw-show-and-tell{margin-right:0 !important}/*!@.me-xl-1*/.me-xl-1.sc-gw-show-and-tell{margin-right:0.25rem !important}/*!@.me-xl-2*/.me-xl-2.sc-gw-show-and-tell{margin-right:0.5rem !important}/*!@.me-xl-3*/.me-xl-3.sc-gw-show-and-tell{margin-right:1rem !important}/*!@.me-xl-4*/.me-xl-4.sc-gw-show-and-tell{margin-right:1.5rem !important}/*!@.me-xl-5*/.me-xl-5.sc-gw-show-and-tell{margin-right:3rem !important}/*!@.me-xl-auto*/.me-xl-auto.sc-gw-show-and-tell{margin-right:auto !important}/*!@.mb-xl-0*/.mb-xl-0.sc-gw-show-and-tell{margin-bottom:0 !important}/*!@.mb-xl-1*/.mb-xl-1.sc-gw-show-and-tell{margin-bottom:0.25rem !important}/*!@.mb-xl-2*/.mb-xl-2.sc-gw-show-and-tell{margin-bottom:0.5rem !important}/*!@.mb-xl-3*/.mb-xl-3.sc-gw-show-and-tell{margin-bottom:1rem !important}/*!@.mb-xl-4*/.mb-xl-4.sc-gw-show-and-tell{margin-bottom:1.5rem !important}/*!@.mb-xl-5*/.mb-xl-5.sc-gw-show-and-tell{margin-bottom:3rem !important}/*!@.mb-xl-auto*/.mb-xl-auto.sc-gw-show-and-tell{margin-bottom:auto !important}/*!@.ms-xl-0*/.ms-xl-0.sc-gw-show-and-tell{margin-left:0 !important}/*!@.ms-xl-1*/.ms-xl-1.sc-gw-show-and-tell{margin-left:0.25rem !important}/*!@.ms-xl-2*/.ms-xl-2.sc-gw-show-and-tell{margin-left:0.5rem !important}/*!@.ms-xl-3*/.ms-xl-3.sc-gw-show-and-tell{margin-left:1rem !important}/*!@.ms-xl-4*/.ms-xl-4.sc-gw-show-and-tell{margin-left:1.5rem !important}/*!@.ms-xl-5*/.ms-xl-5.sc-gw-show-and-tell{margin-left:3rem !important}/*!@.ms-xl-auto*/.ms-xl-auto.sc-gw-show-and-tell{margin-left:auto !important}/*!@.p-xl-0*/.p-xl-0.sc-gw-show-and-tell{padding:0 !important}/*!@.p-xl-1*/.p-xl-1.sc-gw-show-and-tell{padding:0.25rem !important}/*!@.p-xl-2*/.p-xl-2.sc-gw-show-and-tell{padding:0.5rem !important}/*!@.p-xl-3*/.p-xl-3.sc-gw-show-and-tell{padding:1rem !important}/*!@.p-xl-4*/.p-xl-4.sc-gw-show-and-tell{padding:1.5rem !important}/*!@.p-xl-5*/.p-xl-5.sc-gw-show-and-tell{padding:3rem !important}/*!@.px-xl-0*/.px-xl-0.sc-gw-show-and-tell{padding-right:0 !important;padding-left:0 !important}/*!@.px-xl-1*/.px-xl-1.sc-gw-show-and-tell{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-xl-2*/.px-xl-2.sc-gw-show-and-tell{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-xl-3*/.px-xl-3.sc-gw-show-and-tell{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-xl-4*/.px-xl-4.sc-gw-show-and-tell{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-xl-5*/.px-xl-5.sc-gw-show-and-tell{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-xl-0*/.py-xl-0.sc-gw-show-and-tell{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-xl-1*/.py-xl-1.sc-gw-show-and-tell{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-xl-2*/.py-xl-2.sc-gw-show-and-tell{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-xl-3*/.py-xl-3.sc-gw-show-and-tell{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-xl-4*/.py-xl-4.sc-gw-show-and-tell{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-xl-5*/.py-xl-5.sc-gw-show-and-tell{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-xl-0*/.pt-xl-0.sc-gw-show-and-tell{padding-top:0 !important}/*!@.pt-xl-1*/.pt-xl-1.sc-gw-show-and-tell{padding-top:0.25rem !important}/*!@.pt-xl-2*/.pt-xl-2.sc-gw-show-and-tell{padding-top:0.5rem !important}/*!@.pt-xl-3*/.pt-xl-3.sc-gw-show-and-tell{padding-top:1rem !important}/*!@.pt-xl-4*/.pt-xl-4.sc-gw-show-and-tell{padding-top:1.5rem !important}/*!@.pt-xl-5*/.pt-xl-5.sc-gw-show-and-tell{padding-top:3rem !important}/*!@.pe-xl-0*/.pe-xl-0.sc-gw-show-and-tell{padding-right:0 !important}/*!@.pe-xl-1*/.pe-xl-1.sc-gw-show-and-tell{padding-right:0.25rem !important}/*!@.pe-xl-2*/.pe-xl-2.sc-gw-show-and-tell{padding-right:0.5rem !important}/*!@.pe-xl-3*/.pe-xl-3.sc-gw-show-and-tell{padding-right:1rem !important}/*!@.pe-xl-4*/.pe-xl-4.sc-gw-show-and-tell{padding-right:1.5rem !important}/*!@.pe-xl-5*/.pe-xl-5.sc-gw-show-and-tell{padding-right:3rem !important}/*!@.pb-xl-0*/.pb-xl-0.sc-gw-show-and-tell{padding-bottom:0 !important}/*!@.pb-xl-1*/.pb-xl-1.sc-gw-show-and-tell{padding-bottom:0.25rem !important}/*!@.pb-xl-2*/.pb-xl-2.sc-gw-show-and-tell{padding-bottom:0.5rem !important}/*!@.pb-xl-3*/.pb-xl-3.sc-gw-show-and-tell{padding-bottom:1rem !important}/*!@.pb-xl-4*/.pb-xl-4.sc-gw-show-and-tell{padding-bottom:1.5rem !important}/*!@.pb-xl-5*/.pb-xl-5.sc-gw-show-and-tell{padding-bottom:3rem !important}/*!@.ps-xl-0*/.ps-xl-0.sc-gw-show-and-tell{padding-left:0 !important}/*!@.ps-xl-1*/.ps-xl-1.sc-gw-show-and-tell{padding-left:0.25rem !important}/*!@.ps-xl-2*/.ps-xl-2.sc-gw-show-and-tell{padding-left:0.5rem !important}/*!@.ps-xl-3*/.ps-xl-3.sc-gw-show-and-tell{padding-left:1rem !important}/*!@.ps-xl-4*/.ps-xl-4.sc-gw-show-and-tell{padding-left:1.5rem !important}/*!@.ps-xl-5*/.ps-xl-5.sc-gw-show-and-tell{padding-left:3rem !important}}@media (min-width: 1400px){/*!@.d-xxl-inline*/.d-xxl-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-xxl-inline-block*/.d-xxl-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-xxl-block*/.d-xxl-block.sc-gw-show-and-tell{display:block !important}/*!@.d-xxl-grid*/.d-xxl-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-xxl-table*/.d-xxl-table.sc-gw-show-and-tell{display:table !important}/*!@.d-xxl-table-row*/.d-xxl-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-xxl-table-cell*/.d-xxl-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-xxl-flex*/.d-xxl-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-xxl-inline-flex*/.d-xxl-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-xxl-none*/.d-xxl-none.sc-gw-show-and-tell{display:none !important}/*!@.flex-xxl-fill*/.flex-xxl-fill.sc-gw-show-and-tell{flex:1 1 auto !important}/*!@.flex-xxl-row*/.flex-xxl-row.sc-gw-show-and-tell{flex-direction:row !important}/*!@.flex-xxl-column*/.flex-xxl-column.sc-gw-show-and-tell{flex-direction:column !important}/*!@.flex-xxl-row-reverse*/.flex-xxl-row-reverse.sc-gw-show-and-tell{flex-direction:row-reverse !important}/*!@.flex-xxl-column-reverse*/.flex-xxl-column-reverse.sc-gw-show-and-tell{flex-direction:column-reverse !important}/*!@.flex-xxl-grow-0*/.flex-xxl-grow-0.sc-gw-show-and-tell{flex-grow:0 !important}/*!@.flex-xxl-grow-1*/.flex-xxl-grow-1.sc-gw-show-and-tell{flex-grow:1 !important}/*!@.flex-xxl-shrink-0*/.flex-xxl-shrink-0.sc-gw-show-and-tell{flex-shrink:0 !important}/*!@.flex-xxl-shrink-1*/.flex-xxl-shrink-1.sc-gw-show-and-tell{flex-shrink:1 !important}/*!@.flex-xxl-wrap*/.flex-xxl-wrap.sc-gw-show-and-tell{flex-wrap:wrap !important}/*!@.flex-xxl-nowrap*/.flex-xxl-nowrap.sc-gw-show-and-tell{flex-wrap:nowrap !important}/*!@.flex-xxl-wrap-reverse*/.flex-xxl-wrap-reverse.sc-gw-show-and-tell{flex-wrap:wrap-reverse !important}/*!@.justify-content-xxl-start*/.justify-content-xxl-start.sc-gw-show-and-tell{justify-content:flex-start !important}/*!@.justify-content-xxl-end*/.justify-content-xxl-end.sc-gw-show-and-tell{justify-content:flex-end !important}/*!@.justify-content-xxl-center*/.justify-content-xxl-center.sc-gw-show-and-tell{justify-content:center !important}/*!@.justify-content-xxl-between*/.justify-content-xxl-between.sc-gw-show-and-tell{justify-content:space-between !important}/*!@.justify-content-xxl-around*/.justify-content-xxl-around.sc-gw-show-and-tell{justify-content:space-around !important}/*!@.justify-content-xxl-evenly*/.justify-content-xxl-evenly.sc-gw-show-and-tell{justify-content:space-evenly !important}/*!@.align-items-xxl-start*/.align-items-xxl-start.sc-gw-show-and-tell{align-items:flex-start !important}/*!@.align-items-xxl-end*/.align-items-xxl-end.sc-gw-show-and-tell{align-items:flex-end !important}/*!@.align-items-xxl-center*/.align-items-xxl-center.sc-gw-show-and-tell{align-items:center !important}/*!@.align-items-xxl-baseline*/.align-items-xxl-baseline.sc-gw-show-and-tell{align-items:baseline !important}/*!@.align-items-xxl-stretch*/.align-items-xxl-stretch.sc-gw-show-and-tell{align-items:stretch !important}/*!@.align-content-xxl-start*/.align-content-xxl-start.sc-gw-show-and-tell{align-content:flex-start !important}/*!@.align-content-xxl-end*/.align-content-xxl-end.sc-gw-show-and-tell{align-content:flex-end !important}/*!@.align-content-xxl-center*/.align-content-xxl-center.sc-gw-show-and-tell{align-content:center !important}/*!@.align-content-xxl-between*/.align-content-xxl-between.sc-gw-show-and-tell{align-content:space-between !important}/*!@.align-content-xxl-around*/.align-content-xxl-around.sc-gw-show-and-tell{align-content:space-around !important}/*!@.align-content-xxl-stretch*/.align-content-xxl-stretch.sc-gw-show-and-tell{align-content:stretch !important}/*!@.align-self-xxl-auto*/.align-self-xxl-auto.sc-gw-show-and-tell{align-self:auto !important}/*!@.align-self-xxl-start*/.align-self-xxl-start.sc-gw-show-and-tell{align-self:flex-start !important}/*!@.align-self-xxl-end*/.align-self-xxl-end.sc-gw-show-and-tell{align-self:flex-end !important}/*!@.align-self-xxl-center*/.align-self-xxl-center.sc-gw-show-and-tell{align-self:center !important}/*!@.align-self-xxl-baseline*/.align-self-xxl-baseline.sc-gw-show-and-tell{align-self:baseline !important}/*!@.align-self-xxl-stretch*/.align-self-xxl-stretch.sc-gw-show-and-tell{align-self:stretch !important}/*!@.order-xxl-first*/.order-xxl-first.sc-gw-show-and-tell{order:-1 !important}/*!@.order-xxl-0*/.order-xxl-0.sc-gw-show-and-tell{order:0 !important}/*!@.order-xxl-1*/.order-xxl-1.sc-gw-show-and-tell{order:1 !important}/*!@.order-xxl-2*/.order-xxl-2.sc-gw-show-and-tell{order:2 !important}/*!@.order-xxl-3*/.order-xxl-3.sc-gw-show-and-tell{order:3 !important}/*!@.order-xxl-4*/.order-xxl-4.sc-gw-show-and-tell{order:4 !important}/*!@.order-xxl-5*/.order-xxl-5.sc-gw-show-and-tell{order:5 !important}/*!@.order-xxl-last*/.order-xxl-last.sc-gw-show-and-tell{order:6 !important}/*!@.m-xxl-0*/.m-xxl-0.sc-gw-show-and-tell{margin:0 !important}/*!@.m-xxl-1*/.m-xxl-1.sc-gw-show-and-tell{margin:0.25rem !important}/*!@.m-xxl-2*/.m-xxl-2.sc-gw-show-and-tell{margin:0.5rem !important}/*!@.m-xxl-3*/.m-xxl-3.sc-gw-show-and-tell{margin:1rem !important}/*!@.m-xxl-4*/.m-xxl-4.sc-gw-show-and-tell{margin:1.5rem !important}/*!@.m-xxl-5*/.m-xxl-5.sc-gw-show-and-tell{margin:3rem !important}/*!@.m-xxl-auto*/.m-xxl-auto.sc-gw-show-and-tell{margin:auto !important}/*!@.mx-xxl-0*/.mx-xxl-0.sc-gw-show-and-tell{margin-right:0 !important;margin-left:0 !important}/*!@.mx-xxl-1*/.mx-xxl-1.sc-gw-show-and-tell{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-xxl-2*/.mx-xxl-2.sc-gw-show-and-tell{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-xxl-3*/.mx-xxl-3.sc-gw-show-and-tell{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-xxl-4*/.mx-xxl-4.sc-gw-show-and-tell{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-xxl-5*/.mx-xxl-5.sc-gw-show-and-tell{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-xxl-auto*/.mx-xxl-auto.sc-gw-show-and-tell{margin-right:auto !important;margin-left:auto !important}/*!@.my-xxl-0*/.my-xxl-0.sc-gw-show-and-tell{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-xxl-1*/.my-xxl-1.sc-gw-show-and-tell{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-xxl-2*/.my-xxl-2.sc-gw-show-and-tell{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-xxl-3*/.my-xxl-3.sc-gw-show-and-tell{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-xxl-4*/.my-xxl-4.sc-gw-show-and-tell{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-xxl-5*/.my-xxl-5.sc-gw-show-and-tell{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-xxl-auto*/.my-xxl-auto.sc-gw-show-and-tell{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-xxl-0*/.mt-xxl-0.sc-gw-show-and-tell{margin-top:0 !important}/*!@.mt-xxl-1*/.mt-xxl-1.sc-gw-show-and-tell{margin-top:0.25rem !important}/*!@.mt-xxl-2*/.mt-xxl-2.sc-gw-show-and-tell{margin-top:0.5rem !important}/*!@.mt-xxl-3*/.mt-xxl-3.sc-gw-show-and-tell{margin-top:1rem !important}/*!@.mt-xxl-4*/.mt-xxl-4.sc-gw-show-and-tell{margin-top:1.5rem !important}/*!@.mt-xxl-5*/.mt-xxl-5.sc-gw-show-and-tell{margin-top:3rem !important}/*!@.mt-xxl-auto*/.mt-xxl-auto.sc-gw-show-and-tell{margin-top:auto !important}/*!@.me-xxl-0*/.me-xxl-0.sc-gw-show-and-tell{margin-right:0 !important}/*!@.me-xxl-1*/.me-xxl-1.sc-gw-show-and-tell{margin-right:0.25rem !important}/*!@.me-xxl-2*/.me-xxl-2.sc-gw-show-and-tell{margin-right:0.5rem !important}/*!@.me-xxl-3*/.me-xxl-3.sc-gw-show-and-tell{margin-right:1rem !important}/*!@.me-xxl-4*/.me-xxl-4.sc-gw-show-and-tell{margin-right:1.5rem !important}/*!@.me-xxl-5*/.me-xxl-5.sc-gw-show-and-tell{margin-right:3rem !important}/*!@.me-xxl-auto*/.me-xxl-auto.sc-gw-show-and-tell{margin-right:auto !important}/*!@.mb-xxl-0*/.mb-xxl-0.sc-gw-show-and-tell{margin-bottom:0 !important}/*!@.mb-xxl-1*/.mb-xxl-1.sc-gw-show-and-tell{margin-bottom:0.25rem !important}/*!@.mb-xxl-2*/.mb-xxl-2.sc-gw-show-and-tell{margin-bottom:0.5rem !important}/*!@.mb-xxl-3*/.mb-xxl-3.sc-gw-show-and-tell{margin-bottom:1rem !important}/*!@.mb-xxl-4*/.mb-xxl-4.sc-gw-show-and-tell{margin-bottom:1.5rem !important}/*!@.mb-xxl-5*/.mb-xxl-5.sc-gw-show-and-tell{margin-bottom:3rem !important}/*!@.mb-xxl-auto*/.mb-xxl-auto.sc-gw-show-and-tell{margin-bottom:auto !important}/*!@.ms-xxl-0*/.ms-xxl-0.sc-gw-show-and-tell{margin-left:0 !important}/*!@.ms-xxl-1*/.ms-xxl-1.sc-gw-show-and-tell{margin-left:0.25rem !important}/*!@.ms-xxl-2*/.ms-xxl-2.sc-gw-show-and-tell{margin-left:0.5rem !important}/*!@.ms-xxl-3*/.ms-xxl-3.sc-gw-show-and-tell{margin-left:1rem !important}/*!@.ms-xxl-4*/.ms-xxl-4.sc-gw-show-and-tell{margin-left:1.5rem !important}/*!@.ms-xxl-5*/.ms-xxl-5.sc-gw-show-and-tell{margin-left:3rem !important}/*!@.ms-xxl-auto*/.ms-xxl-auto.sc-gw-show-and-tell{margin-left:auto !important}/*!@.p-xxl-0*/.p-xxl-0.sc-gw-show-and-tell{padding:0 !important}/*!@.p-xxl-1*/.p-xxl-1.sc-gw-show-and-tell{padding:0.25rem !important}/*!@.p-xxl-2*/.p-xxl-2.sc-gw-show-and-tell{padding:0.5rem !important}/*!@.p-xxl-3*/.p-xxl-3.sc-gw-show-and-tell{padding:1rem !important}/*!@.p-xxl-4*/.p-xxl-4.sc-gw-show-and-tell{padding:1.5rem !important}/*!@.p-xxl-5*/.p-xxl-5.sc-gw-show-and-tell{padding:3rem !important}/*!@.px-xxl-0*/.px-xxl-0.sc-gw-show-and-tell{padding-right:0 !important;padding-left:0 !important}/*!@.px-xxl-1*/.px-xxl-1.sc-gw-show-and-tell{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-xxl-2*/.px-xxl-2.sc-gw-show-and-tell{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-xxl-3*/.px-xxl-3.sc-gw-show-and-tell{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-xxl-4*/.px-xxl-4.sc-gw-show-and-tell{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-xxl-5*/.px-xxl-5.sc-gw-show-and-tell{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-xxl-0*/.py-xxl-0.sc-gw-show-and-tell{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-xxl-1*/.py-xxl-1.sc-gw-show-and-tell{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-xxl-2*/.py-xxl-2.sc-gw-show-and-tell{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-xxl-3*/.py-xxl-3.sc-gw-show-and-tell{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-xxl-4*/.py-xxl-4.sc-gw-show-and-tell{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-xxl-5*/.py-xxl-5.sc-gw-show-and-tell{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-xxl-0*/.pt-xxl-0.sc-gw-show-and-tell{padding-top:0 !important}/*!@.pt-xxl-1*/.pt-xxl-1.sc-gw-show-and-tell{padding-top:0.25rem !important}/*!@.pt-xxl-2*/.pt-xxl-2.sc-gw-show-and-tell{padding-top:0.5rem !important}/*!@.pt-xxl-3*/.pt-xxl-3.sc-gw-show-and-tell{padding-top:1rem !important}/*!@.pt-xxl-4*/.pt-xxl-4.sc-gw-show-and-tell{padding-top:1.5rem !important}/*!@.pt-xxl-5*/.pt-xxl-5.sc-gw-show-and-tell{padding-top:3rem !important}/*!@.pe-xxl-0*/.pe-xxl-0.sc-gw-show-and-tell{padding-right:0 !important}/*!@.pe-xxl-1*/.pe-xxl-1.sc-gw-show-and-tell{padding-right:0.25rem !important}/*!@.pe-xxl-2*/.pe-xxl-2.sc-gw-show-and-tell{padding-right:0.5rem !important}/*!@.pe-xxl-3*/.pe-xxl-3.sc-gw-show-and-tell{padding-right:1rem !important}/*!@.pe-xxl-4*/.pe-xxl-4.sc-gw-show-and-tell{padding-right:1.5rem !important}/*!@.pe-xxl-5*/.pe-xxl-5.sc-gw-show-and-tell{padding-right:3rem !important}/*!@.pb-xxl-0*/.pb-xxl-0.sc-gw-show-and-tell{padding-bottom:0 !important}/*!@.pb-xxl-1*/.pb-xxl-1.sc-gw-show-and-tell{padding-bottom:0.25rem !important}/*!@.pb-xxl-2*/.pb-xxl-2.sc-gw-show-and-tell{padding-bottom:0.5rem !important}/*!@.pb-xxl-3*/.pb-xxl-3.sc-gw-show-and-tell{padding-bottom:1rem !important}/*!@.pb-xxl-4*/.pb-xxl-4.sc-gw-show-and-tell{padding-bottom:1.5rem !important}/*!@.pb-xxl-5*/.pb-xxl-5.sc-gw-show-and-tell{padding-bottom:3rem !important}/*!@.ps-xxl-0*/.ps-xxl-0.sc-gw-show-and-tell{padding-left:0 !important}/*!@.ps-xxl-1*/.ps-xxl-1.sc-gw-show-and-tell{padding-left:0.25rem !important}/*!@.ps-xxl-2*/.ps-xxl-2.sc-gw-show-and-tell{padding-left:0.5rem !important}/*!@.ps-xxl-3*/.ps-xxl-3.sc-gw-show-and-tell{padding-left:1rem !important}/*!@.ps-xxl-4*/.ps-xxl-4.sc-gw-show-and-tell{padding-left:1.5rem !important}/*!@.ps-xxl-5*/.ps-xxl-5.sc-gw-show-and-tell{padding-left:3rem !important}}@media print{/*!@.d-print-inline*/.d-print-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-print-inline-block*/.d-print-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-print-block*/.d-print-block.sc-gw-show-and-tell{display:block !important}/*!@.d-print-grid*/.d-print-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-print-table*/.d-print-table.sc-gw-show-and-tell{display:table !important}/*!@.d-print-table-row*/.d-print-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-print-table-cell*/.d-print-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-print-flex*/.d-print-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-print-inline-flex*/.d-print-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-print-none*/.d-print-none.sc-gw-show-and-tell{display:none !important}}/*!@.clearfix::after*/.clearfix.sc-gw-show-and-tell::after{display:block;clear:both;content:\"\"}/*!@.link-primary*/.link-primary.sc-gw-show-and-tell{color:#0d6efd}/*!@.link-primary:hover,\n.link-primary:focus*/.link-primary.sc-gw-show-and-tell:hover,.link-primary.sc-gw-show-and-tell:focus{color:#0a58ca}/*!@.link-secondary*/.link-secondary.sc-gw-show-and-tell{color:#6c757d}/*!@.link-secondary:hover,\n.link-secondary:focus*/.link-secondary.sc-gw-show-and-tell:hover,.link-secondary.sc-gw-show-and-tell:focus{color:#565e64}/*!@.link-success*/.link-success.sc-gw-show-and-tell{color:#198754}/*!@.link-success:hover,\n.link-success:focus*/.link-success.sc-gw-show-and-tell:hover,.link-success.sc-gw-show-and-tell:focus{color:#146c43}/*!@.link-info*/.link-info.sc-gw-show-and-tell{color:#0dcaf0}/*!@.link-info:hover,\n.link-info:focus*/.link-info.sc-gw-show-and-tell:hover,.link-info.sc-gw-show-and-tell:focus{color:#3dd5f3}/*!@.link-warning*/.link-warning.sc-gw-show-and-tell{color:#ffc107}/*!@.link-warning:hover,\n.link-warning:focus*/.link-warning.sc-gw-show-and-tell:hover,.link-warning.sc-gw-show-and-tell:focus{color:#ffcd39}/*!@.link-danger*/.link-danger.sc-gw-show-and-tell{color:#dc3545}/*!@.link-danger:hover,\n.link-danger:focus*/.link-danger.sc-gw-show-and-tell:hover,.link-danger.sc-gw-show-and-tell:focus{color:#b02a37}/*!@.link-light*/.link-light.sc-gw-show-and-tell{color:#f8f9fa}/*!@.link-light:hover,\n.link-light:focus*/.link-light.sc-gw-show-and-tell:hover,.link-light.sc-gw-show-and-tell:focus{color:#f9fafb}/*!@.link-dark*/.link-dark.sc-gw-show-and-tell{color:#212529}/*!@.link-dark:hover,\n.link-dark:focus*/.link-dark.sc-gw-show-and-tell:hover,.link-dark.sc-gw-show-and-tell:focus{color:#1a1e21}/*!@.ratio*/.ratio.sc-gw-show-and-tell{position:relative;width:100%}/*!@.ratio::before*/.ratio.sc-gw-show-and-tell::before{display:block;padding-top:var(--bs-aspect-ratio);content:\"\"}/*!@.ratio > **/.ratio.sc-gw-show-and-tell>*.sc-gw-show-and-tell{position:absolute;top:0;left:0;width:100%;height:100%}/*!@.ratio-1x1*/.ratio-1x1.sc-gw-show-and-tell{--bs-aspect-ratio:100%}/*!@.ratio-4x3*/.ratio-4x3.sc-gw-show-and-tell{--bs-aspect-ratio:calc(3 / 4 * 100%)}/*!@.ratio-16x9*/.ratio-16x9.sc-gw-show-and-tell{--bs-aspect-ratio:calc(9 / 16 * 100%)}/*!@.ratio-21x9*/.ratio-21x9.sc-gw-show-and-tell{--bs-aspect-ratio:calc(9 / 21 * 100%)}/*!@.fixed-top*/.fixed-top.sc-gw-show-and-tell{position:fixed;top:0;right:0;left:0;z-index:1030}/*!@.fixed-bottom*/.fixed-bottom.sc-gw-show-and-tell{position:fixed;right:0;bottom:0;left:0;z-index:1030}/*!@.sticky-top*/.sticky-top.sc-gw-show-and-tell{position:-webkit-sticky;position:sticky;top:0;z-index:1020}@media (min-width: 576px){/*!@.sticky-sm-top*/.sticky-sm-top.sc-gw-show-and-tell{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}@media (min-width: 768px){/*!@.sticky-md-top*/.sticky-md-top.sc-gw-show-and-tell{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}@media (min-width: 992px){/*!@.sticky-lg-top*/.sticky-lg-top.sc-gw-show-and-tell{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}@media (min-width: 1200px){/*!@.sticky-xl-top*/.sticky-xl-top.sc-gw-show-and-tell{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}@media (min-width: 1400px){/*!@.sticky-xxl-top*/.sticky-xxl-top.sc-gw-show-and-tell{position:-webkit-sticky;position:sticky;top:0;z-index:1020}}/*!@.visually-hidden,\n.visually-hidden-focusable:not(:focus):not(:focus-within)*/.visually-hidden.sc-gw-show-and-tell,.visually-hidden-focusable.sc-gw-show-and-tell:not(:focus):not(:focus-within){position:absolute !important;width:1px !important;height:1px !important;padding:0 !important;margin:-1px !important;overflow:hidden !important;clip:rect(0, 0, 0, 0) !important;white-space:nowrap !important;border:0 !important}/*!@.stretched-link::after*/.stretched-link.sc-gw-show-and-tell::after{position:absolute;top:0;right:0;bottom:0;left:0;z-index:1;content:\"\"}/*!@.text-truncate*/.text-truncate.sc-gw-show-and-tell{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}/*!@.align-baseline*/.align-baseline.sc-gw-show-and-tell{vertical-align:baseline !important}/*!@.align-top*/.align-top.sc-gw-show-and-tell{vertical-align:top !important}/*!@.align-middle*/.align-middle.sc-gw-show-and-tell{vertical-align:middle !important}/*!@.align-bottom*/.align-bottom.sc-gw-show-and-tell{vertical-align:bottom !important}/*!@.align-text-bottom*/.align-text-bottom.sc-gw-show-and-tell{vertical-align:text-bottom !important}/*!@.align-text-top*/.align-text-top.sc-gw-show-and-tell{vertical-align:text-top !important}/*!@.float-start*/.float-start.sc-gw-show-and-tell{float:left !important}/*!@.float-end*/.float-end.sc-gw-show-and-tell{float:right !important}/*!@.float-none*/.float-none.sc-gw-show-and-tell{float:none !important}/*!@.overflow-auto*/.overflow-auto.sc-gw-show-and-tell{overflow:auto !important}/*!@.overflow-hidden*/.overflow-hidden.sc-gw-show-and-tell{overflow:hidden !important}/*!@.overflow-visible*/.overflow-visible.sc-gw-show-and-tell{overflow:visible !important}/*!@.overflow-scroll*/.overflow-scroll.sc-gw-show-and-tell{overflow:scroll !important}/*!@.d-inline*/.d-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-inline-block*/.d-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-block*/.d-block.sc-gw-show-and-tell{display:block !important}/*!@.d-grid*/.d-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-table*/.d-table.sc-gw-show-and-tell{display:table !important}/*!@.d-table-row*/.d-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-table-cell*/.d-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-flex*/.d-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-inline-flex*/.d-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-none*/.d-none.sc-gw-show-and-tell{display:none !important}/*!@.shadow*/.shadow.sc-gw-show-and-tell{box-shadow:0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important}/*!@.shadow-sm*/.shadow-sm.sc-gw-show-and-tell{box-shadow:0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important}/*!@.shadow-lg*/.shadow-lg.sc-gw-show-and-tell{box-shadow:0 1rem 3rem rgba(0, 0, 0, 0.175) !important}/*!@.shadow-none*/.shadow-none.sc-gw-show-and-tell{box-shadow:none !important}/*!@.position-static*/.position-static.sc-gw-show-and-tell{position:static !important}/*!@.position-relative*/.position-relative.sc-gw-show-and-tell{position:relative !important}/*!@.position-absolute*/.position-absolute.sc-gw-show-and-tell{position:absolute !important}/*!@.position-fixed*/.position-fixed.sc-gw-show-and-tell{position:fixed !important}/*!@.position-sticky*/.position-sticky.sc-gw-show-and-tell{position:-webkit-sticky !important;position:sticky !important}/*!@.top-0*/.top-0.sc-gw-show-and-tell{top:0 !important}/*!@.top-50*/.top-50.sc-gw-show-and-tell{top:50% !important}/*!@.top-100*/.top-100.sc-gw-show-and-tell{top:100% !important}/*!@.bottom-0*/.bottom-0.sc-gw-show-and-tell{bottom:0 !important}/*!@.bottom-50*/.bottom-50.sc-gw-show-and-tell{bottom:50% !important}/*!@.bottom-100*/.bottom-100.sc-gw-show-and-tell{bottom:100% !important}/*!@.start-0*/.start-0.sc-gw-show-and-tell{left:0 !important}/*!@.start-50*/.start-50.sc-gw-show-and-tell{left:50% !important}/*!@.start-100*/.start-100.sc-gw-show-and-tell{left:100% !important}/*!@.end-0*/.end-0.sc-gw-show-and-tell{right:0 !important}/*!@.end-50*/.end-50.sc-gw-show-and-tell{right:50% !important}/*!@.end-100*/.end-100.sc-gw-show-and-tell{right:100% !important}/*!@.translate-middle*/.translate-middle.sc-gw-show-and-tell{transform:translate(-50%, -50%) !important}/*!@.translate-middle-x*/.translate-middle-x.sc-gw-show-and-tell{transform:translateX(-50%) !important}/*!@.translate-middle-y*/.translate-middle-y.sc-gw-show-and-tell{transform:translateY(-50%) !important}/*!@.border*/.border.sc-gw-show-and-tell{border:1px solid #dee2e6 !important}/*!@.border-0*/.border-0.sc-gw-show-and-tell{border:0 !important}/*!@.border-top*/.border-top.sc-gw-show-and-tell{border-top:1px solid #dee2e6 !important}/*!@.border-top-0*/.border-top-0.sc-gw-show-and-tell{border-top:0 !important}/*!@.border-end*/.border-end.sc-gw-show-and-tell{border-right:1px solid #dee2e6 !important}/*!@.border-end-0*/.border-end-0.sc-gw-show-and-tell{border-right:0 !important}/*!@.border-bottom*/.border-bottom.sc-gw-show-and-tell{border-bottom:1px solid #dee2e6 !important}/*!@.border-bottom-0*/.border-bottom-0.sc-gw-show-and-tell{border-bottom:0 !important}/*!@.border-start*/.border-start.sc-gw-show-and-tell{border-left:1px solid #dee2e6 !important}/*!@.border-start-0*/.border-start-0.sc-gw-show-and-tell{border-left:0 !important}/*!@.border-primary*/.border-primary.sc-gw-show-and-tell{border-color:#0d6efd !important}/*!@.border-secondary*/.border-secondary.sc-gw-show-and-tell{border-color:#6c757d !important}/*!@.border-success*/.border-success.sc-gw-show-and-tell{border-color:#198754 !important}/*!@.border-info*/.border-info.sc-gw-show-and-tell{border-color:#0dcaf0 !important}/*!@.border-warning*/.border-warning.sc-gw-show-and-tell{border-color:#ffc107 !important}/*!@.border-danger*/.border-danger.sc-gw-show-and-tell{border-color:#dc3545 !important}/*!@.border-light*/.border-light.sc-gw-show-and-tell{border-color:#f8f9fa !important}/*!@.border-dark*/.border-dark.sc-gw-show-and-tell{border-color:#212529 !important}/*!@.border-white*/.border-white.sc-gw-show-and-tell{border-color:#fff !important}/*!@.border-1*/.border-1.sc-gw-show-and-tell{border-width:1px !important}/*!@.border-2*/.border-2.sc-gw-show-and-tell{border-width:2px !important}/*!@.border-3*/.border-3.sc-gw-show-and-tell{border-width:3px !important}/*!@.border-4*/.border-4.sc-gw-show-and-tell{border-width:4px !important}/*!@.border-5*/.border-5.sc-gw-show-and-tell{border-width:5px !important}/*!@.w-25*/.w-25.sc-gw-show-and-tell{width:25% !important}/*!@.w-50*/.w-50.sc-gw-show-and-tell{width:50% !important}/*!@.w-75*/.w-75.sc-gw-show-and-tell{width:75% !important}/*!@.w-100*/.w-100.sc-gw-show-and-tell{width:100% !important}/*!@.w-auto*/.w-auto.sc-gw-show-and-tell{width:auto !important}/*!@.mw-100*/.mw-100.sc-gw-show-and-tell{max-width:100% !important}/*!@.vw-100*/.vw-100.sc-gw-show-and-tell{width:100vw !important}/*!@.min-vw-100*/.min-vw-100.sc-gw-show-and-tell{min-width:100vw !important}/*!@.h-25*/.h-25.sc-gw-show-and-tell{height:25% !important}/*!@.h-50*/.h-50.sc-gw-show-and-tell{height:50% !important}/*!@.h-75*/.h-75.sc-gw-show-and-tell{height:75% !important}/*!@.h-100*/.h-100.sc-gw-show-and-tell{height:100% !important}/*!@.h-auto*/.h-auto.sc-gw-show-and-tell{height:auto !important}/*!@.mh-100*/.mh-100.sc-gw-show-and-tell{max-height:100% !important}/*!@.vh-100*/.vh-100.sc-gw-show-and-tell{height:100vh !important}/*!@.min-vh-100*/.min-vh-100.sc-gw-show-and-tell{min-height:100vh !important}/*!@.flex-fill*/.flex-fill.sc-gw-show-and-tell{flex:1 1 auto !important}/*!@.flex-row*/.flex-row.sc-gw-show-and-tell{flex-direction:row !important}/*!@.flex-column*/.flex-column.sc-gw-show-and-tell{flex-direction:column !important}/*!@.flex-row-reverse*/.flex-row-reverse.sc-gw-show-and-tell{flex-direction:row-reverse !important}/*!@.flex-column-reverse*/.flex-column-reverse.sc-gw-show-and-tell{flex-direction:column-reverse !important}/*!@.flex-grow-0*/.flex-grow-0.sc-gw-show-and-tell{flex-grow:0 !important}/*!@.flex-grow-1*/.flex-grow-1.sc-gw-show-and-tell{flex-grow:1 !important}/*!@.flex-shrink-0*/.flex-shrink-0.sc-gw-show-and-tell{flex-shrink:0 !important}/*!@.flex-shrink-1*/.flex-shrink-1.sc-gw-show-and-tell{flex-shrink:1 !important}/*!@.flex-wrap*/.flex-wrap.sc-gw-show-and-tell{flex-wrap:wrap !important}/*!@.flex-nowrap*/.flex-nowrap.sc-gw-show-and-tell{flex-wrap:nowrap !important}/*!@.flex-wrap-reverse*/.flex-wrap-reverse.sc-gw-show-and-tell{flex-wrap:wrap-reverse !important}/*!@.gap-0*/.gap-0.sc-gw-show-and-tell{gap:0 !important}/*!@.gap-1*/.gap-1.sc-gw-show-and-tell{gap:0.25rem !important}/*!@.gap-2*/.gap-2.sc-gw-show-and-tell{gap:0.5rem !important}/*!@.gap-3*/.gap-3.sc-gw-show-and-tell{gap:1rem !important}/*!@.gap-4*/.gap-4.sc-gw-show-and-tell{gap:1.5rem !important}/*!@.gap-5*/.gap-5.sc-gw-show-and-tell{gap:3rem !important}/*!@.justify-content-start*/.justify-content-start.sc-gw-show-and-tell{justify-content:flex-start !important}/*!@.justify-content-end*/.justify-content-end.sc-gw-show-and-tell{justify-content:flex-end !important}/*!@.justify-content-center*/.justify-content-center.sc-gw-show-and-tell{justify-content:center !important}/*!@.justify-content-between*/.justify-content-between.sc-gw-show-and-tell{justify-content:space-between !important}/*!@.justify-content-around*/.justify-content-around.sc-gw-show-and-tell{justify-content:space-around !important}/*!@.justify-content-evenly*/.justify-content-evenly.sc-gw-show-and-tell{justify-content:space-evenly !important}/*!@.align-items-start*/.align-items-start.sc-gw-show-and-tell{align-items:flex-start !important}/*!@.align-items-end*/.align-items-end.sc-gw-show-and-tell{align-items:flex-end !important}/*!@.align-items-center*/.align-items-center.sc-gw-show-and-tell{align-items:center !important}/*!@.align-items-baseline*/.align-items-baseline.sc-gw-show-and-tell{align-items:baseline !important}/*!@.align-items-stretch*/.align-items-stretch.sc-gw-show-and-tell{align-items:stretch !important}/*!@.align-content-start*/.align-content-start.sc-gw-show-and-tell{align-content:flex-start !important}/*!@.align-content-end*/.align-content-end.sc-gw-show-and-tell{align-content:flex-end !important}/*!@.align-content-center*/.align-content-center.sc-gw-show-and-tell{align-content:center !important}/*!@.align-content-between*/.align-content-between.sc-gw-show-and-tell{align-content:space-between !important}/*!@.align-content-around*/.align-content-around.sc-gw-show-and-tell{align-content:space-around !important}/*!@.align-content-stretch*/.align-content-stretch.sc-gw-show-and-tell{align-content:stretch !important}/*!@.align-self-auto*/.align-self-auto.sc-gw-show-and-tell{align-self:auto !important}/*!@.align-self-start*/.align-self-start.sc-gw-show-and-tell{align-self:flex-start !important}/*!@.align-self-end*/.align-self-end.sc-gw-show-and-tell{align-self:flex-end !important}/*!@.align-self-center*/.align-self-center.sc-gw-show-and-tell{align-self:center !important}/*!@.align-self-baseline*/.align-self-baseline.sc-gw-show-and-tell{align-self:baseline !important}/*!@.align-self-stretch*/.align-self-stretch.sc-gw-show-and-tell{align-self:stretch !important}/*!@.order-first*/.order-first.sc-gw-show-and-tell{order:-1 !important}/*!@.order-0*/.order-0.sc-gw-show-and-tell{order:0 !important}/*!@.order-1*/.order-1.sc-gw-show-and-tell{order:1 !important}/*!@.order-2*/.order-2.sc-gw-show-and-tell{order:2 !important}/*!@.order-3*/.order-3.sc-gw-show-and-tell{order:3 !important}/*!@.order-4*/.order-4.sc-gw-show-and-tell{order:4 !important}/*!@.order-5*/.order-5.sc-gw-show-and-tell{order:5 !important}/*!@.order-last*/.order-last.sc-gw-show-and-tell{order:6 !important}/*!@.m-0*/.m-0.sc-gw-show-and-tell{margin:0 !important}/*!@.m-1*/.m-1.sc-gw-show-and-tell{margin:0.25rem !important}/*!@.m-2*/.m-2.sc-gw-show-and-tell{margin:0.5rem !important}/*!@.m-3*/.m-3.sc-gw-show-and-tell{margin:1rem !important}/*!@.m-4*/.m-4.sc-gw-show-and-tell{margin:1.5rem !important}/*!@.m-5*/.m-5.sc-gw-show-and-tell{margin:3rem !important}/*!@.m-auto*/.m-auto.sc-gw-show-and-tell{margin:auto !important}/*!@.mx-0*/.mx-0.sc-gw-show-and-tell{margin-right:0 !important;margin-left:0 !important}/*!@.mx-1*/.mx-1.sc-gw-show-and-tell{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-2*/.mx-2.sc-gw-show-and-tell{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-3*/.mx-3.sc-gw-show-and-tell{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-4*/.mx-4.sc-gw-show-and-tell{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-5*/.mx-5.sc-gw-show-and-tell{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-auto*/.mx-auto.sc-gw-show-and-tell{margin-right:auto !important;margin-left:auto !important}/*!@.my-0*/.my-0.sc-gw-show-and-tell{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-1*/.my-1.sc-gw-show-and-tell{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-2*/.my-2.sc-gw-show-and-tell{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-3*/.my-3.sc-gw-show-and-tell{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-4*/.my-4.sc-gw-show-and-tell{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-5*/.my-5.sc-gw-show-and-tell{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-auto*/.my-auto.sc-gw-show-and-tell{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-0*/.mt-0.sc-gw-show-and-tell{margin-top:0 !important}/*!@.mt-1*/.mt-1.sc-gw-show-and-tell{margin-top:0.25rem !important}/*!@.mt-2*/.mt-2.sc-gw-show-and-tell{margin-top:0.5rem !important}/*!@.mt-3*/.mt-3.sc-gw-show-and-tell{margin-top:1rem !important}/*!@.mt-4*/.mt-4.sc-gw-show-and-tell{margin-top:1.5rem !important}/*!@.mt-5*/.mt-5.sc-gw-show-and-tell{margin-top:3rem !important}/*!@.mt-auto*/.mt-auto.sc-gw-show-and-tell{margin-top:auto !important}/*!@.me-0*/.me-0.sc-gw-show-and-tell{margin-right:0 !important}/*!@.me-1*/.me-1.sc-gw-show-and-tell{margin-right:0.25rem !important}/*!@.me-2*/.me-2.sc-gw-show-and-tell{margin-right:0.5rem !important}/*!@.me-3*/.me-3.sc-gw-show-and-tell{margin-right:1rem !important}/*!@.me-4*/.me-4.sc-gw-show-and-tell{margin-right:1.5rem !important}/*!@.me-5*/.me-5.sc-gw-show-and-tell{margin-right:3rem !important}/*!@.me-auto*/.me-auto.sc-gw-show-and-tell{margin-right:auto !important}/*!@.mb-0*/.mb-0.sc-gw-show-and-tell{margin-bottom:0 !important}/*!@.mb-1*/.mb-1.sc-gw-show-and-tell{margin-bottom:0.25rem !important}/*!@.mb-2*/.mb-2.sc-gw-show-and-tell{margin-bottom:0.5rem !important}/*!@.mb-3*/.mb-3.sc-gw-show-and-tell{margin-bottom:1rem !important}/*!@.mb-4*/.mb-4.sc-gw-show-and-tell{margin-bottom:1.5rem !important}/*!@.mb-5*/.mb-5.sc-gw-show-and-tell{margin-bottom:3rem !important}/*!@.mb-auto*/.mb-auto.sc-gw-show-and-tell{margin-bottom:auto !important}/*!@.ms-0*/.ms-0.sc-gw-show-and-tell{margin-left:0 !important}/*!@.ms-1*/.ms-1.sc-gw-show-and-tell{margin-left:0.25rem !important}/*!@.ms-2*/.ms-2.sc-gw-show-and-tell{margin-left:0.5rem !important}/*!@.ms-3*/.ms-3.sc-gw-show-and-tell{margin-left:1rem !important}/*!@.ms-4*/.ms-4.sc-gw-show-and-tell{margin-left:1.5rem !important}/*!@.ms-5*/.ms-5.sc-gw-show-and-tell{margin-left:3rem !important}/*!@.ms-auto*/.ms-auto.sc-gw-show-and-tell{margin-left:auto !important}/*!@.p-0*/.p-0.sc-gw-show-and-tell{padding:0 !important}/*!@.p-1*/.p-1.sc-gw-show-and-tell{padding:0.25rem !important}/*!@.p-2*/.p-2.sc-gw-show-and-tell{padding:0.5rem !important}/*!@.p-3*/.p-3.sc-gw-show-and-tell{padding:1rem !important}/*!@.p-4*/.p-4.sc-gw-show-and-tell{padding:1.5rem !important}/*!@.p-5*/.p-5.sc-gw-show-and-tell{padding:3rem !important}/*!@.px-0*/.px-0.sc-gw-show-and-tell{padding-right:0 !important;padding-left:0 !important}/*!@.px-1*/.px-1.sc-gw-show-and-tell{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-2*/.px-2.sc-gw-show-and-tell{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-3*/.px-3.sc-gw-show-and-tell{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-4*/.px-4.sc-gw-show-and-tell{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-5*/.px-5.sc-gw-show-and-tell{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-0*/.py-0.sc-gw-show-and-tell{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-1*/.py-1.sc-gw-show-and-tell{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-2*/.py-2.sc-gw-show-and-tell{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-3*/.py-3.sc-gw-show-and-tell{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-4*/.py-4.sc-gw-show-and-tell{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-5*/.py-5.sc-gw-show-and-tell{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-0*/.pt-0.sc-gw-show-and-tell{padding-top:0 !important}/*!@.pt-1*/.pt-1.sc-gw-show-and-tell{padding-top:0.25rem !important}/*!@.pt-2*/.pt-2.sc-gw-show-and-tell{padding-top:0.5rem !important}/*!@.pt-3*/.pt-3.sc-gw-show-and-tell{padding-top:1rem !important}/*!@.pt-4*/.pt-4.sc-gw-show-and-tell{padding-top:1.5rem !important}/*!@.pt-5*/.pt-5.sc-gw-show-and-tell{padding-top:3rem !important}/*!@.pe-0*/.pe-0.sc-gw-show-and-tell{padding-right:0 !important}/*!@.pe-1*/.pe-1.sc-gw-show-and-tell{padding-right:0.25rem !important}/*!@.pe-2*/.pe-2.sc-gw-show-and-tell{padding-right:0.5rem !important}/*!@.pe-3*/.pe-3.sc-gw-show-and-tell{padding-right:1rem !important}/*!@.pe-4*/.pe-4.sc-gw-show-and-tell{padding-right:1.5rem !important}/*!@.pe-5*/.pe-5.sc-gw-show-and-tell{padding-right:3rem !important}/*!@.pb-0*/.pb-0.sc-gw-show-and-tell{padding-bottom:0 !important}/*!@.pb-1*/.pb-1.sc-gw-show-and-tell{padding-bottom:0.25rem !important}/*!@.pb-2*/.pb-2.sc-gw-show-and-tell{padding-bottom:0.5rem !important}/*!@.pb-3*/.pb-3.sc-gw-show-and-tell{padding-bottom:1rem !important}/*!@.pb-4*/.pb-4.sc-gw-show-and-tell{padding-bottom:1.5rem !important}/*!@.pb-5*/.pb-5.sc-gw-show-and-tell{padding-bottom:3rem !important}/*!@.ps-0*/.ps-0.sc-gw-show-and-tell{padding-left:0 !important}/*!@.ps-1*/.ps-1.sc-gw-show-and-tell{padding-left:0.25rem !important}/*!@.ps-2*/.ps-2.sc-gw-show-and-tell{padding-left:0.5rem !important}/*!@.ps-3*/.ps-3.sc-gw-show-and-tell{padding-left:1rem !important}/*!@.ps-4*/.ps-4.sc-gw-show-and-tell{padding-left:1.5rem !important}/*!@.ps-5*/.ps-5.sc-gw-show-and-tell{padding-left:3rem !important}/*!@.font-monospace*/.font-monospace.sc-gw-show-and-tell{font-family:var(--bs-font-monospace) !important}/*!@.fs-1*/.fs-1.sc-gw-show-and-tell{font-size:calc(1.375rem + 1.5vw) !important}/*!@.fs-2*/.fs-2.sc-gw-show-and-tell{font-size:calc(1.325rem + 0.9vw) !important}/*!@.fs-3*/.fs-3.sc-gw-show-and-tell{font-size:calc(1.3rem + 0.6vw) !important}/*!@.fs-4*/.fs-4.sc-gw-show-and-tell{font-size:calc(1.275rem + 0.3vw) !important}/*!@.fs-5*/.fs-5.sc-gw-show-and-tell{font-size:1.25rem !important}/*!@.fs-6*/.fs-6.sc-gw-show-and-tell{font-size:1rem !important}/*!@.fst-italic*/.fst-italic.sc-gw-show-and-tell{font-style:italic !important}/*!@.fst-normal*/.fst-normal.sc-gw-show-and-tell{font-style:normal !important}/*!@.fw-light*/.fw-light.sc-gw-show-and-tell{font-weight:300 !important}/*!@.fw-lighter*/.fw-lighter.sc-gw-show-and-tell{font-weight:lighter !important}/*!@.fw-normal*/.fw-normal.sc-gw-show-and-tell{font-weight:400 !important}/*!@.fw-bold*/.fw-bold.sc-gw-show-and-tell{font-weight:700 !important}/*!@.fw-bolder*/.fw-bolder.sc-gw-show-and-tell{font-weight:bolder !important}/*!@.lh-1*/.lh-1.sc-gw-show-and-tell{line-height:1 !important}/*!@.lh-sm*/.lh-sm.sc-gw-show-and-tell{line-height:1.25 !important}/*!@.lh-base*/.lh-base.sc-gw-show-and-tell{line-height:1.5 !important}/*!@.lh-lg*/.lh-lg.sc-gw-show-and-tell{line-height:2 !important}/*!@.text-start*/.text-start.sc-gw-show-and-tell{text-align:left !important}/*!@.text-end*/.text-end.sc-gw-show-and-tell{text-align:right !important}/*!@.text-center*/.text-center.sc-gw-show-and-tell{text-align:center !important}/*!@.text-decoration-none*/.text-decoration-none.sc-gw-show-and-tell{text-decoration:none !important}/*!@.text-decoration-underline*/.text-decoration-underline.sc-gw-show-and-tell{text-decoration:underline !important}/*!@.text-decoration-line-through*/.text-decoration-line-through.sc-gw-show-and-tell{text-decoration:line-through !important}/*!@.text-lowercase*/.text-lowercase.sc-gw-show-and-tell{text-transform:lowercase !important}/*!@.text-uppercase*/.text-uppercase.sc-gw-show-and-tell{text-transform:uppercase !important}/*!@.text-capitalize*/.text-capitalize.sc-gw-show-and-tell{text-transform:capitalize !important}/*!@.text-wrap*/.text-wrap.sc-gw-show-and-tell{white-space:normal !important}/*!@.text-nowrap*/.text-nowrap.sc-gw-show-and-tell{white-space:nowrap !important}/*!@.text-break*/.text-break.sc-gw-show-and-tell{word-wrap:break-word !important;word-break:break-word !important}/*!@.text-primary*/.text-primary.sc-gw-show-and-tell{color:#0d6efd !important}/*!@.text-secondary*/.text-secondary.sc-gw-show-and-tell{color:#6c757d !important}/*!@.text-success*/.text-success.sc-gw-show-and-tell{color:#198754 !important}/*!@.text-info*/.text-info.sc-gw-show-and-tell{color:#0dcaf0 !important}/*!@.text-warning*/.text-warning.sc-gw-show-and-tell{color:#ffc107 !important}/*!@.text-danger*/.text-danger.sc-gw-show-and-tell{color:#dc3545 !important}/*!@.text-light*/.text-light.sc-gw-show-and-tell{color:#f8f9fa !important}/*!@.text-dark*/.text-dark.sc-gw-show-and-tell{color:#212529 !important}/*!@.text-white*/.text-white.sc-gw-show-and-tell{color:#fff !important}/*!@.text-body*/.text-body.sc-gw-show-and-tell{color:#212529 !important}/*!@.text-muted*/.text-muted.sc-gw-show-and-tell{color:#6c757d !important}/*!@.text-black-50*/.text-black-50.sc-gw-show-and-tell{color:rgba(0, 0, 0, 0.5) !important}/*!@.text-white-50*/.text-white-50.sc-gw-show-and-tell{color:rgba(255, 255, 255, 0.5) !important}/*!@.text-reset*/.text-reset.sc-gw-show-and-tell{color:inherit !important}/*!@.bg-primary*/.bg-primary.sc-gw-show-and-tell{background-color:#0d6efd !important}/*!@.bg-secondary*/.bg-secondary.sc-gw-show-and-tell{background-color:#6c757d !important}/*!@.bg-success*/.bg-success.sc-gw-show-and-tell{background-color:#198754 !important}/*!@.bg-info*/.bg-info.sc-gw-show-and-tell{background-color:#0dcaf0 !important}/*!@.bg-warning*/.bg-warning.sc-gw-show-and-tell{background-color:#ffc107 !important}/*!@.bg-danger*/.bg-danger.sc-gw-show-and-tell{background-color:#dc3545 !important}/*!@.bg-light*/.bg-light.sc-gw-show-and-tell{background-color:#f8f9fa !important}/*!@.bg-dark*/.bg-dark.sc-gw-show-and-tell{background-color:#212529 !important}/*!@.bg-body*/.bg-body.sc-gw-show-and-tell{background-color:#fff !important}/*!@.bg-white*/.bg-white.sc-gw-show-and-tell{background-color:#fff !important}/*!@.bg-transparent*/.bg-transparent.sc-gw-show-and-tell{background-color:transparent !important}/*!@.bg-gradient*/.bg-gradient.sc-gw-show-and-tell{background-image:var(--bs-gradient) !important}/*!@.user-select-all*/.user-select-all.sc-gw-show-and-tell{-webkit-user-select:all !important;-moz-user-select:all !important;user-select:all !important}/*!@.user-select-auto*/.user-select-auto.sc-gw-show-and-tell{-webkit-user-select:auto !important;-moz-user-select:auto !important;user-select:auto !important}/*!@.user-select-none*/.user-select-none.sc-gw-show-and-tell{-webkit-user-select:none !important;-moz-user-select:none !important;user-select:none !important}/*!@.pe-none*/.pe-none.sc-gw-show-and-tell{pointer-events:none !important}/*!@.pe-auto*/.pe-auto.sc-gw-show-and-tell{pointer-events:auto !important}/*!@.rounded*/.rounded.sc-gw-show-and-tell{border-radius:0.25rem !important}/*!@.rounded-0*/.rounded-0.sc-gw-show-and-tell{border-radius:0 !important}/*!@.rounded-1*/.rounded-1.sc-gw-show-and-tell{border-radius:0.2rem !important}/*!@.rounded-2*/.rounded-2.sc-gw-show-and-tell{border-radius:0.25rem !important}/*!@.rounded-3*/.rounded-3.sc-gw-show-and-tell{border-radius:0.3rem !important}/*!@.rounded-circle*/.rounded-circle.sc-gw-show-and-tell{border-radius:50% !important}/*!@.rounded-pill*/.rounded-pill.sc-gw-show-and-tell{border-radius:50rem !important}/*!@.rounded-top*/.rounded-top.sc-gw-show-and-tell{border-top-left-radius:0.25rem !important;border-top-right-radius:0.25rem !important}/*!@.rounded-end*/.rounded-end.sc-gw-show-and-tell{border-top-right-radius:0.25rem !important;border-bottom-right-radius:0.25rem !important}/*!@.rounded-bottom*/.rounded-bottom.sc-gw-show-and-tell{border-bottom-right-radius:0.25rem !important;border-bottom-left-radius:0.25rem !important}/*!@.rounded-start*/.rounded-start.sc-gw-show-and-tell{border-bottom-left-radius:0.25rem !important;border-top-left-radius:0.25rem !important}/*!@.visible*/.visible.sc-gw-show-and-tell{visibility:visible !important}/*!@.invisible*/.invisible.sc-gw-show-and-tell{visibility:hidden !important}@media (min-width: 576px){/*!@.float-sm-start*/.float-sm-start.sc-gw-show-and-tell{float:left !important}/*!@.float-sm-end*/.float-sm-end.sc-gw-show-and-tell{float:right !important}/*!@.float-sm-none*/.float-sm-none.sc-gw-show-and-tell{float:none !important}/*!@.d-sm-inline*/.d-sm-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-sm-inline-block*/.d-sm-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-sm-block*/.d-sm-block.sc-gw-show-and-tell{display:block !important}/*!@.d-sm-grid*/.d-sm-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-sm-table*/.d-sm-table.sc-gw-show-and-tell{display:table !important}/*!@.d-sm-table-row*/.d-sm-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-sm-table-cell*/.d-sm-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-sm-flex*/.d-sm-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-sm-inline-flex*/.d-sm-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-sm-none*/.d-sm-none.sc-gw-show-and-tell{display:none !important}/*!@.flex-sm-fill*/.flex-sm-fill.sc-gw-show-and-tell{flex:1 1 auto !important}/*!@.flex-sm-row*/.flex-sm-row.sc-gw-show-and-tell{flex-direction:row !important}/*!@.flex-sm-column*/.flex-sm-column.sc-gw-show-and-tell{flex-direction:column !important}/*!@.flex-sm-row-reverse*/.flex-sm-row-reverse.sc-gw-show-and-tell{flex-direction:row-reverse !important}/*!@.flex-sm-column-reverse*/.flex-sm-column-reverse.sc-gw-show-and-tell{flex-direction:column-reverse !important}/*!@.flex-sm-grow-0*/.flex-sm-grow-0.sc-gw-show-and-tell{flex-grow:0 !important}/*!@.flex-sm-grow-1*/.flex-sm-grow-1.sc-gw-show-and-tell{flex-grow:1 !important}/*!@.flex-sm-shrink-0*/.flex-sm-shrink-0.sc-gw-show-and-tell{flex-shrink:0 !important}/*!@.flex-sm-shrink-1*/.flex-sm-shrink-1.sc-gw-show-and-tell{flex-shrink:1 !important}/*!@.flex-sm-wrap*/.flex-sm-wrap.sc-gw-show-and-tell{flex-wrap:wrap !important}/*!@.flex-sm-nowrap*/.flex-sm-nowrap.sc-gw-show-and-tell{flex-wrap:nowrap !important}/*!@.flex-sm-wrap-reverse*/.flex-sm-wrap-reverse.sc-gw-show-and-tell{flex-wrap:wrap-reverse !important}/*!@.gap-sm-0*/.gap-sm-0.sc-gw-show-and-tell{gap:0 !important}/*!@.gap-sm-1*/.gap-sm-1.sc-gw-show-and-tell{gap:0.25rem !important}/*!@.gap-sm-2*/.gap-sm-2.sc-gw-show-and-tell{gap:0.5rem !important}/*!@.gap-sm-3*/.gap-sm-3.sc-gw-show-and-tell{gap:1rem !important}/*!@.gap-sm-4*/.gap-sm-4.sc-gw-show-and-tell{gap:1.5rem !important}/*!@.gap-sm-5*/.gap-sm-5.sc-gw-show-and-tell{gap:3rem !important}/*!@.justify-content-sm-start*/.justify-content-sm-start.sc-gw-show-and-tell{justify-content:flex-start !important}/*!@.justify-content-sm-end*/.justify-content-sm-end.sc-gw-show-and-tell{justify-content:flex-end !important}/*!@.justify-content-sm-center*/.justify-content-sm-center.sc-gw-show-and-tell{justify-content:center !important}/*!@.justify-content-sm-between*/.justify-content-sm-between.sc-gw-show-and-tell{justify-content:space-between !important}/*!@.justify-content-sm-around*/.justify-content-sm-around.sc-gw-show-and-tell{justify-content:space-around !important}/*!@.justify-content-sm-evenly*/.justify-content-sm-evenly.sc-gw-show-and-tell{justify-content:space-evenly !important}/*!@.align-items-sm-start*/.align-items-sm-start.sc-gw-show-and-tell{align-items:flex-start !important}/*!@.align-items-sm-end*/.align-items-sm-end.sc-gw-show-and-tell{align-items:flex-end !important}/*!@.align-items-sm-center*/.align-items-sm-center.sc-gw-show-and-tell{align-items:center !important}/*!@.align-items-sm-baseline*/.align-items-sm-baseline.sc-gw-show-and-tell{align-items:baseline !important}/*!@.align-items-sm-stretch*/.align-items-sm-stretch.sc-gw-show-and-tell{align-items:stretch !important}/*!@.align-content-sm-start*/.align-content-sm-start.sc-gw-show-and-tell{align-content:flex-start !important}/*!@.align-content-sm-end*/.align-content-sm-end.sc-gw-show-and-tell{align-content:flex-end !important}/*!@.align-content-sm-center*/.align-content-sm-center.sc-gw-show-and-tell{align-content:center !important}/*!@.align-content-sm-between*/.align-content-sm-between.sc-gw-show-and-tell{align-content:space-between !important}/*!@.align-content-sm-around*/.align-content-sm-around.sc-gw-show-and-tell{align-content:space-around !important}/*!@.align-content-sm-stretch*/.align-content-sm-stretch.sc-gw-show-and-tell{align-content:stretch !important}/*!@.align-self-sm-auto*/.align-self-sm-auto.sc-gw-show-and-tell{align-self:auto !important}/*!@.align-self-sm-start*/.align-self-sm-start.sc-gw-show-and-tell{align-self:flex-start !important}/*!@.align-self-sm-end*/.align-self-sm-end.sc-gw-show-and-tell{align-self:flex-end !important}/*!@.align-self-sm-center*/.align-self-sm-center.sc-gw-show-and-tell{align-self:center !important}/*!@.align-self-sm-baseline*/.align-self-sm-baseline.sc-gw-show-and-tell{align-self:baseline !important}/*!@.align-self-sm-stretch*/.align-self-sm-stretch.sc-gw-show-and-tell{align-self:stretch !important}/*!@.order-sm-first*/.order-sm-first.sc-gw-show-and-tell{order:-1 !important}/*!@.order-sm-0*/.order-sm-0.sc-gw-show-and-tell{order:0 !important}/*!@.order-sm-1*/.order-sm-1.sc-gw-show-and-tell{order:1 !important}/*!@.order-sm-2*/.order-sm-2.sc-gw-show-and-tell{order:2 !important}/*!@.order-sm-3*/.order-sm-3.sc-gw-show-and-tell{order:3 !important}/*!@.order-sm-4*/.order-sm-4.sc-gw-show-and-tell{order:4 !important}/*!@.order-sm-5*/.order-sm-5.sc-gw-show-and-tell{order:5 !important}/*!@.order-sm-last*/.order-sm-last.sc-gw-show-and-tell{order:6 !important}/*!@.m-sm-0*/.m-sm-0.sc-gw-show-and-tell{margin:0 !important}/*!@.m-sm-1*/.m-sm-1.sc-gw-show-and-tell{margin:0.25rem !important}/*!@.m-sm-2*/.m-sm-2.sc-gw-show-and-tell{margin:0.5rem !important}/*!@.m-sm-3*/.m-sm-3.sc-gw-show-and-tell{margin:1rem !important}/*!@.m-sm-4*/.m-sm-4.sc-gw-show-and-tell{margin:1.5rem !important}/*!@.m-sm-5*/.m-sm-5.sc-gw-show-and-tell{margin:3rem !important}/*!@.m-sm-auto*/.m-sm-auto.sc-gw-show-and-tell{margin:auto !important}/*!@.mx-sm-0*/.mx-sm-0.sc-gw-show-and-tell{margin-right:0 !important;margin-left:0 !important}/*!@.mx-sm-1*/.mx-sm-1.sc-gw-show-and-tell{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-sm-2*/.mx-sm-2.sc-gw-show-and-tell{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-sm-3*/.mx-sm-3.sc-gw-show-and-tell{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-sm-4*/.mx-sm-4.sc-gw-show-and-tell{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-sm-5*/.mx-sm-5.sc-gw-show-and-tell{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-sm-auto*/.mx-sm-auto.sc-gw-show-and-tell{margin-right:auto !important;margin-left:auto !important}/*!@.my-sm-0*/.my-sm-0.sc-gw-show-and-tell{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-sm-1*/.my-sm-1.sc-gw-show-and-tell{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-sm-2*/.my-sm-2.sc-gw-show-and-tell{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-sm-3*/.my-sm-3.sc-gw-show-and-tell{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-sm-4*/.my-sm-4.sc-gw-show-and-tell{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-sm-5*/.my-sm-5.sc-gw-show-and-tell{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-sm-auto*/.my-sm-auto.sc-gw-show-and-tell{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-sm-0*/.mt-sm-0.sc-gw-show-and-tell{margin-top:0 !important}/*!@.mt-sm-1*/.mt-sm-1.sc-gw-show-and-tell{margin-top:0.25rem !important}/*!@.mt-sm-2*/.mt-sm-2.sc-gw-show-and-tell{margin-top:0.5rem !important}/*!@.mt-sm-3*/.mt-sm-3.sc-gw-show-and-tell{margin-top:1rem !important}/*!@.mt-sm-4*/.mt-sm-4.sc-gw-show-and-tell{margin-top:1.5rem !important}/*!@.mt-sm-5*/.mt-sm-5.sc-gw-show-and-tell{margin-top:3rem !important}/*!@.mt-sm-auto*/.mt-sm-auto.sc-gw-show-and-tell{margin-top:auto !important}/*!@.me-sm-0*/.me-sm-0.sc-gw-show-and-tell{margin-right:0 !important}/*!@.me-sm-1*/.me-sm-1.sc-gw-show-and-tell{margin-right:0.25rem !important}/*!@.me-sm-2*/.me-sm-2.sc-gw-show-and-tell{margin-right:0.5rem !important}/*!@.me-sm-3*/.me-sm-3.sc-gw-show-and-tell{margin-right:1rem !important}/*!@.me-sm-4*/.me-sm-4.sc-gw-show-and-tell{margin-right:1.5rem !important}/*!@.me-sm-5*/.me-sm-5.sc-gw-show-and-tell{margin-right:3rem !important}/*!@.me-sm-auto*/.me-sm-auto.sc-gw-show-and-tell{margin-right:auto !important}/*!@.mb-sm-0*/.mb-sm-0.sc-gw-show-and-tell{margin-bottom:0 !important}/*!@.mb-sm-1*/.mb-sm-1.sc-gw-show-and-tell{margin-bottom:0.25rem !important}/*!@.mb-sm-2*/.mb-sm-2.sc-gw-show-and-tell{margin-bottom:0.5rem !important}/*!@.mb-sm-3*/.mb-sm-3.sc-gw-show-and-tell{margin-bottom:1rem !important}/*!@.mb-sm-4*/.mb-sm-4.sc-gw-show-and-tell{margin-bottom:1.5rem !important}/*!@.mb-sm-5*/.mb-sm-5.sc-gw-show-and-tell{margin-bottom:3rem !important}/*!@.mb-sm-auto*/.mb-sm-auto.sc-gw-show-and-tell{margin-bottom:auto !important}/*!@.ms-sm-0*/.ms-sm-0.sc-gw-show-and-tell{margin-left:0 !important}/*!@.ms-sm-1*/.ms-sm-1.sc-gw-show-and-tell{margin-left:0.25rem !important}/*!@.ms-sm-2*/.ms-sm-2.sc-gw-show-and-tell{margin-left:0.5rem !important}/*!@.ms-sm-3*/.ms-sm-3.sc-gw-show-and-tell{margin-left:1rem !important}/*!@.ms-sm-4*/.ms-sm-4.sc-gw-show-and-tell{margin-left:1.5rem !important}/*!@.ms-sm-5*/.ms-sm-5.sc-gw-show-and-tell{margin-left:3rem !important}/*!@.ms-sm-auto*/.ms-sm-auto.sc-gw-show-and-tell{margin-left:auto !important}/*!@.p-sm-0*/.p-sm-0.sc-gw-show-and-tell{padding:0 !important}/*!@.p-sm-1*/.p-sm-1.sc-gw-show-and-tell{padding:0.25rem !important}/*!@.p-sm-2*/.p-sm-2.sc-gw-show-and-tell{padding:0.5rem !important}/*!@.p-sm-3*/.p-sm-3.sc-gw-show-and-tell{padding:1rem !important}/*!@.p-sm-4*/.p-sm-4.sc-gw-show-and-tell{padding:1.5rem !important}/*!@.p-sm-5*/.p-sm-5.sc-gw-show-and-tell{padding:3rem !important}/*!@.px-sm-0*/.px-sm-0.sc-gw-show-and-tell{padding-right:0 !important;padding-left:0 !important}/*!@.px-sm-1*/.px-sm-1.sc-gw-show-and-tell{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-sm-2*/.px-sm-2.sc-gw-show-and-tell{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-sm-3*/.px-sm-3.sc-gw-show-and-tell{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-sm-4*/.px-sm-4.sc-gw-show-and-tell{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-sm-5*/.px-sm-5.sc-gw-show-and-tell{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-sm-0*/.py-sm-0.sc-gw-show-and-tell{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-sm-1*/.py-sm-1.sc-gw-show-and-tell{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-sm-2*/.py-sm-2.sc-gw-show-and-tell{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-sm-3*/.py-sm-3.sc-gw-show-and-tell{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-sm-4*/.py-sm-4.sc-gw-show-and-tell{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-sm-5*/.py-sm-5.sc-gw-show-and-tell{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-sm-0*/.pt-sm-0.sc-gw-show-and-tell{padding-top:0 !important}/*!@.pt-sm-1*/.pt-sm-1.sc-gw-show-and-tell{padding-top:0.25rem !important}/*!@.pt-sm-2*/.pt-sm-2.sc-gw-show-and-tell{padding-top:0.5rem !important}/*!@.pt-sm-3*/.pt-sm-3.sc-gw-show-and-tell{padding-top:1rem !important}/*!@.pt-sm-4*/.pt-sm-4.sc-gw-show-and-tell{padding-top:1.5rem !important}/*!@.pt-sm-5*/.pt-sm-5.sc-gw-show-and-tell{padding-top:3rem !important}/*!@.pe-sm-0*/.pe-sm-0.sc-gw-show-and-tell{padding-right:0 !important}/*!@.pe-sm-1*/.pe-sm-1.sc-gw-show-and-tell{padding-right:0.25rem !important}/*!@.pe-sm-2*/.pe-sm-2.sc-gw-show-and-tell{padding-right:0.5rem !important}/*!@.pe-sm-3*/.pe-sm-3.sc-gw-show-and-tell{padding-right:1rem !important}/*!@.pe-sm-4*/.pe-sm-4.sc-gw-show-and-tell{padding-right:1.5rem !important}/*!@.pe-sm-5*/.pe-sm-5.sc-gw-show-and-tell{padding-right:3rem !important}/*!@.pb-sm-0*/.pb-sm-0.sc-gw-show-and-tell{padding-bottom:0 !important}/*!@.pb-sm-1*/.pb-sm-1.sc-gw-show-and-tell{padding-bottom:0.25rem !important}/*!@.pb-sm-2*/.pb-sm-2.sc-gw-show-and-tell{padding-bottom:0.5rem !important}/*!@.pb-sm-3*/.pb-sm-3.sc-gw-show-and-tell{padding-bottom:1rem !important}/*!@.pb-sm-4*/.pb-sm-4.sc-gw-show-and-tell{padding-bottom:1.5rem !important}/*!@.pb-sm-5*/.pb-sm-5.sc-gw-show-and-tell{padding-bottom:3rem !important}/*!@.ps-sm-0*/.ps-sm-0.sc-gw-show-and-tell{padding-left:0 !important}/*!@.ps-sm-1*/.ps-sm-1.sc-gw-show-and-tell{padding-left:0.25rem !important}/*!@.ps-sm-2*/.ps-sm-2.sc-gw-show-and-tell{padding-left:0.5rem !important}/*!@.ps-sm-3*/.ps-sm-3.sc-gw-show-and-tell{padding-left:1rem !important}/*!@.ps-sm-4*/.ps-sm-4.sc-gw-show-and-tell{padding-left:1.5rem !important}/*!@.ps-sm-5*/.ps-sm-5.sc-gw-show-and-tell{padding-left:3rem !important}/*!@.text-sm-start*/.text-sm-start.sc-gw-show-and-tell{text-align:left !important}/*!@.text-sm-end*/.text-sm-end.sc-gw-show-and-tell{text-align:right !important}/*!@.text-sm-center*/.text-sm-center.sc-gw-show-and-tell{text-align:center !important}}@media (min-width: 768px){/*!@.float-md-start*/.float-md-start.sc-gw-show-and-tell{float:left !important}/*!@.float-md-end*/.float-md-end.sc-gw-show-and-tell{float:right !important}/*!@.float-md-none*/.float-md-none.sc-gw-show-and-tell{float:none !important}/*!@.d-md-inline*/.d-md-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-md-inline-block*/.d-md-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-md-block*/.d-md-block.sc-gw-show-and-tell{display:block !important}/*!@.d-md-grid*/.d-md-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-md-table*/.d-md-table.sc-gw-show-and-tell{display:table !important}/*!@.d-md-table-row*/.d-md-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-md-table-cell*/.d-md-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-md-flex*/.d-md-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-md-inline-flex*/.d-md-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-md-none*/.d-md-none.sc-gw-show-and-tell{display:none !important}/*!@.flex-md-fill*/.flex-md-fill.sc-gw-show-and-tell{flex:1 1 auto !important}/*!@.flex-md-row*/.flex-md-row.sc-gw-show-and-tell{flex-direction:row !important}/*!@.flex-md-column*/.flex-md-column.sc-gw-show-and-tell{flex-direction:column !important}/*!@.flex-md-row-reverse*/.flex-md-row-reverse.sc-gw-show-and-tell{flex-direction:row-reverse !important}/*!@.flex-md-column-reverse*/.flex-md-column-reverse.sc-gw-show-and-tell{flex-direction:column-reverse !important}/*!@.flex-md-grow-0*/.flex-md-grow-0.sc-gw-show-and-tell{flex-grow:0 !important}/*!@.flex-md-grow-1*/.flex-md-grow-1.sc-gw-show-and-tell{flex-grow:1 !important}/*!@.flex-md-shrink-0*/.flex-md-shrink-0.sc-gw-show-and-tell{flex-shrink:0 !important}/*!@.flex-md-shrink-1*/.flex-md-shrink-1.sc-gw-show-and-tell{flex-shrink:1 !important}/*!@.flex-md-wrap*/.flex-md-wrap.sc-gw-show-and-tell{flex-wrap:wrap !important}/*!@.flex-md-nowrap*/.flex-md-nowrap.sc-gw-show-and-tell{flex-wrap:nowrap !important}/*!@.flex-md-wrap-reverse*/.flex-md-wrap-reverse.sc-gw-show-and-tell{flex-wrap:wrap-reverse !important}/*!@.gap-md-0*/.gap-md-0.sc-gw-show-and-tell{gap:0 !important}/*!@.gap-md-1*/.gap-md-1.sc-gw-show-and-tell{gap:0.25rem !important}/*!@.gap-md-2*/.gap-md-2.sc-gw-show-and-tell{gap:0.5rem !important}/*!@.gap-md-3*/.gap-md-3.sc-gw-show-and-tell{gap:1rem !important}/*!@.gap-md-4*/.gap-md-4.sc-gw-show-and-tell{gap:1.5rem !important}/*!@.gap-md-5*/.gap-md-5.sc-gw-show-and-tell{gap:3rem !important}/*!@.justify-content-md-start*/.justify-content-md-start.sc-gw-show-and-tell{justify-content:flex-start !important}/*!@.justify-content-md-end*/.justify-content-md-end.sc-gw-show-and-tell{justify-content:flex-end !important}/*!@.justify-content-md-center*/.justify-content-md-center.sc-gw-show-and-tell{justify-content:center !important}/*!@.justify-content-md-between*/.justify-content-md-between.sc-gw-show-and-tell{justify-content:space-between !important}/*!@.justify-content-md-around*/.justify-content-md-around.sc-gw-show-and-tell{justify-content:space-around !important}/*!@.justify-content-md-evenly*/.justify-content-md-evenly.sc-gw-show-and-tell{justify-content:space-evenly !important}/*!@.align-items-md-start*/.align-items-md-start.sc-gw-show-and-tell{align-items:flex-start !important}/*!@.align-items-md-end*/.align-items-md-end.sc-gw-show-and-tell{align-items:flex-end !important}/*!@.align-items-md-center*/.align-items-md-center.sc-gw-show-and-tell{align-items:center !important}/*!@.align-items-md-baseline*/.align-items-md-baseline.sc-gw-show-and-tell{align-items:baseline !important}/*!@.align-items-md-stretch*/.align-items-md-stretch.sc-gw-show-and-tell{align-items:stretch !important}/*!@.align-content-md-start*/.align-content-md-start.sc-gw-show-and-tell{align-content:flex-start !important}/*!@.align-content-md-end*/.align-content-md-end.sc-gw-show-and-tell{align-content:flex-end !important}/*!@.align-content-md-center*/.align-content-md-center.sc-gw-show-and-tell{align-content:center !important}/*!@.align-content-md-between*/.align-content-md-between.sc-gw-show-and-tell{align-content:space-between !important}/*!@.align-content-md-around*/.align-content-md-around.sc-gw-show-and-tell{align-content:space-around !important}/*!@.align-content-md-stretch*/.align-content-md-stretch.sc-gw-show-and-tell{align-content:stretch !important}/*!@.align-self-md-auto*/.align-self-md-auto.sc-gw-show-and-tell{align-self:auto !important}/*!@.align-self-md-start*/.align-self-md-start.sc-gw-show-and-tell{align-self:flex-start !important}/*!@.align-self-md-end*/.align-self-md-end.sc-gw-show-and-tell{align-self:flex-end !important}/*!@.align-self-md-center*/.align-self-md-center.sc-gw-show-and-tell{align-self:center !important}/*!@.align-self-md-baseline*/.align-self-md-baseline.sc-gw-show-and-tell{align-self:baseline !important}/*!@.align-self-md-stretch*/.align-self-md-stretch.sc-gw-show-and-tell{align-self:stretch !important}/*!@.order-md-first*/.order-md-first.sc-gw-show-and-tell{order:-1 !important}/*!@.order-md-0*/.order-md-0.sc-gw-show-and-tell{order:0 !important}/*!@.order-md-1*/.order-md-1.sc-gw-show-and-tell{order:1 !important}/*!@.order-md-2*/.order-md-2.sc-gw-show-and-tell{order:2 !important}/*!@.order-md-3*/.order-md-3.sc-gw-show-and-tell{order:3 !important}/*!@.order-md-4*/.order-md-4.sc-gw-show-and-tell{order:4 !important}/*!@.order-md-5*/.order-md-5.sc-gw-show-and-tell{order:5 !important}/*!@.order-md-last*/.order-md-last.sc-gw-show-and-tell{order:6 !important}/*!@.m-md-0*/.m-md-0.sc-gw-show-and-tell{margin:0 !important}/*!@.m-md-1*/.m-md-1.sc-gw-show-and-tell{margin:0.25rem !important}/*!@.m-md-2*/.m-md-2.sc-gw-show-and-tell{margin:0.5rem !important}/*!@.m-md-3*/.m-md-3.sc-gw-show-and-tell{margin:1rem !important}/*!@.m-md-4*/.m-md-4.sc-gw-show-and-tell{margin:1.5rem !important}/*!@.m-md-5*/.m-md-5.sc-gw-show-and-tell{margin:3rem !important}/*!@.m-md-auto*/.m-md-auto.sc-gw-show-and-tell{margin:auto !important}/*!@.mx-md-0*/.mx-md-0.sc-gw-show-and-tell{margin-right:0 !important;margin-left:0 !important}/*!@.mx-md-1*/.mx-md-1.sc-gw-show-and-tell{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-md-2*/.mx-md-2.sc-gw-show-and-tell{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-md-3*/.mx-md-3.sc-gw-show-and-tell{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-md-4*/.mx-md-4.sc-gw-show-and-tell{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-md-5*/.mx-md-5.sc-gw-show-and-tell{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-md-auto*/.mx-md-auto.sc-gw-show-and-tell{margin-right:auto !important;margin-left:auto !important}/*!@.my-md-0*/.my-md-0.sc-gw-show-and-tell{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-md-1*/.my-md-1.sc-gw-show-and-tell{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-md-2*/.my-md-2.sc-gw-show-and-tell{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-md-3*/.my-md-3.sc-gw-show-and-tell{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-md-4*/.my-md-4.sc-gw-show-and-tell{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-md-5*/.my-md-5.sc-gw-show-and-tell{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-md-auto*/.my-md-auto.sc-gw-show-and-tell{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-md-0*/.mt-md-0.sc-gw-show-and-tell{margin-top:0 !important}/*!@.mt-md-1*/.mt-md-1.sc-gw-show-and-tell{margin-top:0.25rem !important}/*!@.mt-md-2*/.mt-md-2.sc-gw-show-and-tell{margin-top:0.5rem !important}/*!@.mt-md-3*/.mt-md-3.sc-gw-show-and-tell{margin-top:1rem !important}/*!@.mt-md-4*/.mt-md-4.sc-gw-show-and-tell{margin-top:1.5rem !important}/*!@.mt-md-5*/.mt-md-5.sc-gw-show-and-tell{margin-top:3rem !important}/*!@.mt-md-auto*/.mt-md-auto.sc-gw-show-and-tell{margin-top:auto !important}/*!@.me-md-0*/.me-md-0.sc-gw-show-and-tell{margin-right:0 !important}/*!@.me-md-1*/.me-md-1.sc-gw-show-and-tell{margin-right:0.25rem !important}/*!@.me-md-2*/.me-md-2.sc-gw-show-and-tell{margin-right:0.5rem !important}/*!@.me-md-3*/.me-md-3.sc-gw-show-and-tell{margin-right:1rem !important}/*!@.me-md-4*/.me-md-4.sc-gw-show-and-tell{margin-right:1.5rem !important}/*!@.me-md-5*/.me-md-5.sc-gw-show-and-tell{margin-right:3rem !important}/*!@.me-md-auto*/.me-md-auto.sc-gw-show-and-tell{margin-right:auto !important}/*!@.mb-md-0*/.mb-md-0.sc-gw-show-and-tell{margin-bottom:0 !important}/*!@.mb-md-1*/.mb-md-1.sc-gw-show-and-tell{margin-bottom:0.25rem !important}/*!@.mb-md-2*/.mb-md-2.sc-gw-show-and-tell{margin-bottom:0.5rem !important}/*!@.mb-md-3*/.mb-md-3.sc-gw-show-and-tell{margin-bottom:1rem !important}/*!@.mb-md-4*/.mb-md-4.sc-gw-show-and-tell{margin-bottom:1.5rem !important}/*!@.mb-md-5*/.mb-md-5.sc-gw-show-and-tell{margin-bottom:3rem !important}/*!@.mb-md-auto*/.mb-md-auto.sc-gw-show-and-tell{margin-bottom:auto !important}/*!@.ms-md-0*/.ms-md-0.sc-gw-show-and-tell{margin-left:0 !important}/*!@.ms-md-1*/.ms-md-1.sc-gw-show-and-tell{margin-left:0.25rem !important}/*!@.ms-md-2*/.ms-md-2.sc-gw-show-and-tell{margin-left:0.5rem !important}/*!@.ms-md-3*/.ms-md-3.sc-gw-show-and-tell{margin-left:1rem !important}/*!@.ms-md-4*/.ms-md-4.sc-gw-show-and-tell{margin-left:1.5rem !important}/*!@.ms-md-5*/.ms-md-5.sc-gw-show-and-tell{margin-left:3rem !important}/*!@.ms-md-auto*/.ms-md-auto.sc-gw-show-and-tell{margin-left:auto !important}/*!@.p-md-0*/.p-md-0.sc-gw-show-and-tell{padding:0 !important}/*!@.p-md-1*/.p-md-1.sc-gw-show-and-tell{padding:0.25rem !important}/*!@.p-md-2*/.p-md-2.sc-gw-show-and-tell{padding:0.5rem !important}/*!@.p-md-3*/.p-md-3.sc-gw-show-and-tell{padding:1rem !important}/*!@.p-md-4*/.p-md-4.sc-gw-show-and-tell{padding:1.5rem !important}/*!@.p-md-5*/.p-md-5.sc-gw-show-and-tell{padding:3rem !important}/*!@.px-md-0*/.px-md-0.sc-gw-show-and-tell{padding-right:0 !important;padding-left:0 !important}/*!@.px-md-1*/.px-md-1.sc-gw-show-and-tell{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-md-2*/.px-md-2.sc-gw-show-and-tell{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-md-3*/.px-md-3.sc-gw-show-and-tell{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-md-4*/.px-md-4.sc-gw-show-and-tell{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-md-5*/.px-md-5.sc-gw-show-and-tell{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-md-0*/.py-md-0.sc-gw-show-and-tell{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-md-1*/.py-md-1.sc-gw-show-and-tell{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-md-2*/.py-md-2.sc-gw-show-and-tell{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-md-3*/.py-md-3.sc-gw-show-and-tell{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-md-4*/.py-md-4.sc-gw-show-and-tell{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-md-5*/.py-md-5.sc-gw-show-and-tell{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-md-0*/.pt-md-0.sc-gw-show-and-tell{padding-top:0 !important}/*!@.pt-md-1*/.pt-md-1.sc-gw-show-and-tell{padding-top:0.25rem !important}/*!@.pt-md-2*/.pt-md-2.sc-gw-show-and-tell{padding-top:0.5rem !important}/*!@.pt-md-3*/.pt-md-3.sc-gw-show-and-tell{padding-top:1rem !important}/*!@.pt-md-4*/.pt-md-4.sc-gw-show-and-tell{padding-top:1.5rem !important}/*!@.pt-md-5*/.pt-md-5.sc-gw-show-and-tell{padding-top:3rem !important}/*!@.pe-md-0*/.pe-md-0.sc-gw-show-and-tell{padding-right:0 !important}/*!@.pe-md-1*/.pe-md-1.sc-gw-show-and-tell{padding-right:0.25rem !important}/*!@.pe-md-2*/.pe-md-2.sc-gw-show-and-tell{padding-right:0.5rem !important}/*!@.pe-md-3*/.pe-md-3.sc-gw-show-and-tell{padding-right:1rem !important}/*!@.pe-md-4*/.pe-md-4.sc-gw-show-and-tell{padding-right:1.5rem !important}/*!@.pe-md-5*/.pe-md-5.sc-gw-show-and-tell{padding-right:3rem !important}/*!@.pb-md-0*/.pb-md-0.sc-gw-show-and-tell{padding-bottom:0 !important}/*!@.pb-md-1*/.pb-md-1.sc-gw-show-and-tell{padding-bottom:0.25rem !important}/*!@.pb-md-2*/.pb-md-2.sc-gw-show-and-tell{padding-bottom:0.5rem !important}/*!@.pb-md-3*/.pb-md-3.sc-gw-show-and-tell{padding-bottom:1rem !important}/*!@.pb-md-4*/.pb-md-4.sc-gw-show-and-tell{padding-bottom:1.5rem !important}/*!@.pb-md-5*/.pb-md-5.sc-gw-show-and-tell{padding-bottom:3rem !important}/*!@.ps-md-0*/.ps-md-0.sc-gw-show-and-tell{padding-left:0 !important}/*!@.ps-md-1*/.ps-md-1.sc-gw-show-and-tell{padding-left:0.25rem !important}/*!@.ps-md-2*/.ps-md-2.sc-gw-show-and-tell{padding-left:0.5rem !important}/*!@.ps-md-3*/.ps-md-3.sc-gw-show-and-tell{padding-left:1rem !important}/*!@.ps-md-4*/.ps-md-4.sc-gw-show-and-tell{padding-left:1.5rem !important}/*!@.ps-md-5*/.ps-md-5.sc-gw-show-and-tell{padding-left:3rem !important}/*!@.text-md-start*/.text-md-start.sc-gw-show-and-tell{text-align:left !important}/*!@.text-md-end*/.text-md-end.sc-gw-show-and-tell{text-align:right !important}/*!@.text-md-center*/.text-md-center.sc-gw-show-and-tell{text-align:center !important}}@media (min-width: 992px){/*!@.float-lg-start*/.float-lg-start.sc-gw-show-and-tell{float:left !important}/*!@.float-lg-end*/.float-lg-end.sc-gw-show-and-tell{float:right !important}/*!@.float-lg-none*/.float-lg-none.sc-gw-show-and-tell{float:none !important}/*!@.d-lg-inline*/.d-lg-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-lg-inline-block*/.d-lg-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-lg-block*/.d-lg-block.sc-gw-show-and-tell{display:block !important}/*!@.d-lg-grid*/.d-lg-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-lg-table*/.d-lg-table.sc-gw-show-and-tell{display:table !important}/*!@.d-lg-table-row*/.d-lg-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-lg-table-cell*/.d-lg-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-lg-flex*/.d-lg-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-lg-inline-flex*/.d-lg-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-lg-none*/.d-lg-none.sc-gw-show-and-tell{display:none !important}/*!@.flex-lg-fill*/.flex-lg-fill.sc-gw-show-and-tell{flex:1 1 auto !important}/*!@.flex-lg-row*/.flex-lg-row.sc-gw-show-and-tell{flex-direction:row !important}/*!@.flex-lg-column*/.flex-lg-column.sc-gw-show-and-tell{flex-direction:column !important}/*!@.flex-lg-row-reverse*/.flex-lg-row-reverse.sc-gw-show-and-tell{flex-direction:row-reverse !important}/*!@.flex-lg-column-reverse*/.flex-lg-column-reverse.sc-gw-show-and-tell{flex-direction:column-reverse !important}/*!@.flex-lg-grow-0*/.flex-lg-grow-0.sc-gw-show-and-tell{flex-grow:0 !important}/*!@.flex-lg-grow-1*/.flex-lg-grow-1.sc-gw-show-and-tell{flex-grow:1 !important}/*!@.flex-lg-shrink-0*/.flex-lg-shrink-0.sc-gw-show-and-tell{flex-shrink:0 !important}/*!@.flex-lg-shrink-1*/.flex-lg-shrink-1.sc-gw-show-and-tell{flex-shrink:1 !important}/*!@.flex-lg-wrap*/.flex-lg-wrap.sc-gw-show-and-tell{flex-wrap:wrap !important}/*!@.flex-lg-nowrap*/.flex-lg-nowrap.sc-gw-show-and-tell{flex-wrap:nowrap !important}/*!@.flex-lg-wrap-reverse*/.flex-lg-wrap-reverse.sc-gw-show-and-tell{flex-wrap:wrap-reverse !important}/*!@.gap-lg-0*/.gap-lg-0.sc-gw-show-and-tell{gap:0 !important}/*!@.gap-lg-1*/.gap-lg-1.sc-gw-show-and-tell{gap:0.25rem !important}/*!@.gap-lg-2*/.gap-lg-2.sc-gw-show-and-tell{gap:0.5rem !important}/*!@.gap-lg-3*/.gap-lg-3.sc-gw-show-and-tell{gap:1rem !important}/*!@.gap-lg-4*/.gap-lg-4.sc-gw-show-and-tell{gap:1.5rem !important}/*!@.gap-lg-5*/.gap-lg-5.sc-gw-show-and-tell{gap:3rem !important}/*!@.justify-content-lg-start*/.justify-content-lg-start.sc-gw-show-and-tell{justify-content:flex-start !important}/*!@.justify-content-lg-end*/.justify-content-lg-end.sc-gw-show-and-tell{justify-content:flex-end !important}/*!@.justify-content-lg-center*/.justify-content-lg-center.sc-gw-show-and-tell{justify-content:center !important}/*!@.justify-content-lg-between*/.justify-content-lg-between.sc-gw-show-and-tell{justify-content:space-between !important}/*!@.justify-content-lg-around*/.justify-content-lg-around.sc-gw-show-and-tell{justify-content:space-around !important}/*!@.justify-content-lg-evenly*/.justify-content-lg-evenly.sc-gw-show-and-tell{justify-content:space-evenly !important}/*!@.align-items-lg-start*/.align-items-lg-start.sc-gw-show-and-tell{align-items:flex-start !important}/*!@.align-items-lg-end*/.align-items-lg-end.sc-gw-show-and-tell{align-items:flex-end !important}/*!@.align-items-lg-center*/.align-items-lg-center.sc-gw-show-and-tell{align-items:center !important}/*!@.align-items-lg-baseline*/.align-items-lg-baseline.sc-gw-show-and-tell{align-items:baseline !important}/*!@.align-items-lg-stretch*/.align-items-lg-stretch.sc-gw-show-and-tell{align-items:stretch !important}/*!@.align-content-lg-start*/.align-content-lg-start.sc-gw-show-and-tell{align-content:flex-start !important}/*!@.align-content-lg-end*/.align-content-lg-end.sc-gw-show-and-tell{align-content:flex-end !important}/*!@.align-content-lg-center*/.align-content-lg-center.sc-gw-show-and-tell{align-content:center !important}/*!@.align-content-lg-between*/.align-content-lg-between.sc-gw-show-and-tell{align-content:space-between !important}/*!@.align-content-lg-around*/.align-content-lg-around.sc-gw-show-and-tell{align-content:space-around !important}/*!@.align-content-lg-stretch*/.align-content-lg-stretch.sc-gw-show-and-tell{align-content:stretch !important}/*!@.align-self-lg-auto*/.align-self-lg-auto.sc-gw-show-and-tell{align-self:auto !important}/*!@.align-self-lg-start*/.align-self-lg-start.sc-gw-show-and-tell{align-self:flex-start !important}/*!@.align-self-lg-end*/.align-self-lg-end.sc-gw-show-and-tell{align-self:flex-end !important}/*!@.align-self-lg-center*/.align-self-lg-center.sc-gw-show-and-tell{align-self:center !important}/*!@.align-self-lg-baseline*/.align-self-lg-baseline.sc-gw-show-and-tell{align-self:baseline !important}/*!@.align-self-lg-stretch*/.align-self-lg-stretch.sc-gw-show-and-tell{align-self:stretch !important}/*!@.order-lg-first*/.order-lg-first.sc-gw-show-and-tell{order:-1 !important}/*!@.order-lg-0*/.order-lg-0.sc-gw-show-and-tell{order:0 !important}/*!@.order-lg-1*/.order-lg-1.sc-gw-show-and-tell{order:1 !important}/*!@.order-lg-2*/.order-lg-2.sc-gw-show-and-tell{order:2 !important}/*!@.order-lg-3*/.order-lg-3.sc-gw-show-and-tell{order:3 !important}/*!@.order-lg-4*/.order-lg-4.sc-gw-show-and-tell{order:4 !important}/*!@.order-lg-5*/.order-lg-5.sc-gw-show-and-tell{order:5 !important}/*!@.order-lg-last*/.order-lg-last.sc-gw-show-and-tell{order:6 !important}/*!@.m-lg-0*/.m-lg-0.sc-gw-show-and-tell{margin:0 !important}/*!@.m-lg-1*/.m-lg-1.sc-gw-show-and-tell{margin:0.25rem !important}/*!@.m-lg-2*/.m-lg-2.sc-gw-show-and-tell{margin:0.5rem !important}/*!@.m-lg-3*/.m-lg-3.sc-gw-show-and-tell{margin:1rem !important}/*!@.m-lg-4*/.m-lg-4.sc-gw-show-and-tell{margin:1.5rem !important}/*!@.m-lg-5*/.m-lg-5.sc-gw-show-and-tell{margin:3rem !important}/*!@.m-lg-auto*/.m-lg-auto.sc-gw-show-and-tell{margin:auto !important}/*!@.mx-lg-0*/.mx-lg-0.sc-gw-show-and-tell{margin-right:0 !important;margin-left:0 !important}/*!@.mx-lg-1*/.mx-lg-1.sc-gw-show-and-tell{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-lg-2*/.mx-lg-2.sc-gw-show-and-tell{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-lg-3*/.mx-lg-3.sc-gw-show-and-tell{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-lg-4*/.mx-lg-4.sc-gw-show-and-tell{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-lg-5*/.mx-lg-5.sc-gw-show-and-tell{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-lg-auto*/.mx-lg-auto.sc-gw-show-and-tell{margin-right:auto !important;margin-left:auto !important}/*!@.my-lg-0*/.my-lg-0.sc-gw-show-and-tell{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-lg-1*/.my-lg-1.sc-gw-show-and-tell{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-lg-2*/.my-lg-2.sc-gw-show-and-tell{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-lg-3*/.my-lg-3.sc-gw-show-and-tell{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-lg-4*/.my-lg-4.sc-gw-show-and-tell{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-lg-5*/.my-lg-5.sc-gw-show-and-tell{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-lg-auto*/.my-lg-auto.sc-gw-show-and-tell{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-lg-0*/.mt-lg-0.sc-gw-show-and-tell{margin-top:0 !important}/*!@.mt-lg-1*/.mt-lg-1.sc-gw-show-and-tell{margin-top:0.25rem !important}/*!@.mt-lg-2*/.mt-lg-2.sc-gw-show-and-tell{margin-top:0.5rem !important}/*!@.mt-lg-3*/.mt-lg-3.sc-gw-show-and-tell{margin-top:1rem !important}/*!@.mt-lg-4*/.mt-lg-4.sc-gw-show-and-tell{margin-top:1.5rem !important}/*!@.mt-lg-5*/.mt-lg-5.sc-gw-show-and-tell{margin-top:3rem !important}/*!@.mt-lg-auto*/.mt-lg-auto.sc-gw-show-and-tell{margin-top:auto !important}/*!@.me-lg-0*/.me-lg-0.sc-gw-show-and-tell{margin-right:0 !important}/*!@.me-lg-1*/.me-lg-1.sc-gw-show-and-tell{margin-right:0.25rem !important}/*!@.me-lg-2*/.me-lg-2.sc-gw-show-and-tell{margin-right:0.5rem !important}/*!@.me-lg-3*/.me-lg-3.sc-gw-show-and-tell{margin-right:1rem !important}/*!@.me-lg-4*/.me-lg-4.sc-gw-show-and-tell{margin-right:1.5rem !important}/*!@.me-lg-5*/.me-lg-5.sc-gw-show-and-tell{margin-right:3rem !important}/*!@.me-lg-auto*/.me-lg-auto.sc-gw-show-and-tell{margin-right:auto !important}/*!@.mb-lg-0*/.mb-lg-0.sc-gw-show-and-tell{margin-bottom:0 !important}/*!@.mb-lg-1*/.mb-lg-1.sc-gw-show-and-tell{margin-bottom:0.25rem !important}/*!@.mb-lg-2*/.mb-lg-2.sc-gw-show-and-tell{margin-bottom:0.5rem !important}/*!@.mb-lg-3*/.mb-lg-3.sc-gw-show-and-tell{margin-bottom:1rem !important}/*!@.mb-lg-4*/.mb-lg-4.sc-gw-show-and-tell{margin-bottom:1.5rem !important}/*!@.mb-lg-5*/.mb-lg-5.sc-gw-show-and-tell{margin-bottom:3rem !important}/*!@.mb-lg-auto*/.mb-lg-auto.sc-gw-show-and-tell{margin-bottom:auto !important}/*!@.ms-lg-0*/.ms-lg-0.sc-gw-show-and-tell{margin-left:0 !important}/*!@.ms-lg-1*/.ms-lg-1.sc-gw-show-and-tell{margin-left:0.25rem !important}/*!@.ms-lg-2*/.ms-lg-2.sc-gw-show-and-tell{margin-left:0.5rem !important}/*!@.ms-lg-3*/.ms-lg-3.sc-gw-show-and-tell{margin-left:1rem !important}/*!@.ms-lg-4*/.ms-lg-4.sc-gw-show-and-tell{margin-left:1.5rem !important}/*!@.ms-lg-5*/.ms-lg-5.sc-gw-show-and-tell{margin-left:3rem !important}/*!@.ms-lg-auto*/.ms-lg-auto.sc-gw-show-and-tell{margin-left:auto !important}/*!@.p-lg-0*/.p-lg-0.sc-gw-show-and-tell{padding:0 !important}/*!@.p-lg-1*/.p-lg-1.sc-gw-show-and-tell{padding:0.25rem !important}/*!@.p-lg-2*/.p-lg-2.sc-gw-show-and-tell{padding:0.5rem !important}/*!@.p-lg-3*/.p-lg-3.sc-gw-show-and-tell{padding:1rem !important}/*!@.p-lg-4*/.p-lg-4.sc-gw-show-and-tell{padding:1.5rem !important}/*!@.p-lg-5*/.p-lg-5.sc-gw-show-and-tell{padding:3rem !important}/*!@.px-lg-0*/.px-lg-0.sc-gw-show-and-tell{padding-right:0 !important;padding-left:0 !important}/*!@.px-lg-1*/.px-lg-1.sc-gw-show-and-tell{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-lg-2*/.px-lg-2.sc-gw-show-and-tell{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-lg-3*/.px-lg-3.sc-gw-show-and-tell{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-lg-4*/.px-lg-4.sc-gw-show-and-tell{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-lg-5*/.px-lg-5.sc-gw-show-and-tell{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-lg-0*/.py-lg-0.sc-gw-show-and-tell{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-lg-1*/.py-lg-1.sc-gw-show-and-tell{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-lg-2*/.py-lg-2.sc-gw-show-and-tell{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-lg-3*/.py-lg-3.sc-gw-show-and-tell{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-lg-4*/.py-lg-4.sc-gw-show-and-tell{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-lg-5*/.py-lg-5.sc-gw-show-and-tell{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-lg-0*/.pt-lg-0.sc-gw-show-and-tell{padding-top:0 !important}/*!@.pt-lg-1*/.pt-lg-1.sc-gw-show-and-tell{padding-top:0.25rem !important}/*!@.pt-lg-2*/.pt-lg-2.sc-gw-show-and-tell{padding-top:0.5rem !important}/*!@.pt-lg-3*/.pt-lg-3.sc-gw-show-and-tell{padding-top:1rem !important}/*!@.pt-lg-4*/.pt-lg-4.sc-gw-show-and-tell{padding-top:1.5rem !important}/*!@.pt-lg-5*/.pt-lg-5.sc-gw-show-and-tell{padding-top:3rem !important}/*!@.pe-lg-0*/.pe-lg-0.sc-gw-show-and-tell{padding-right:0 !important}/*!@.pe-lg-1*/.pe-lg-1.sc-gw-show-and-tell{padding-right:0.25rem !important}/*!@.pe-lg-2*/.pe-lg-2.sc-gw-show-and-tell{padding-right:0.5rem !important}/*!@.pe-lg-3*/.pe-lg-3.sc-gw-show-and-tell{padding-right:1rem !important}/*!@.pe-lg-4*/.pe-lg-4.sc-gw-show-and-tell{padding-right:1.5rem !important}/*!@.pe-lg-5*/.pe-lg-5.sc-gw-show-and-tell{padding-right:3rem !important}/*!@.pb-lg-0*/.pb-lg-0.sc-gw-show-and-tell{padding-bottom:0 !important}/*!@.pb-lg-1*/.pb-lg-1.sc-gw-show-and-tell{padding-bottom:0.25rem !important}/*!@.pb-lg-2*/.pb-lg-2.sc-gw-show-and-tell{padding-bottom:0.5rem !important}/*!@.pb-lg-3*/.pb-lg-3.sc-gw-show-and-tell{padding-bottom:1rem !important}/*!@.pb-lg-4*/.pb-lg-4.sc-gw-show-and-tell{padding-bottom:1.5rem !important}/*!@.pb-lg-5*/.pb-lg-5.sc-gw-show-and-tell{padding-bottom:3rem !important}/*!@.ps-lg-0*/.ps-lg-0.sc-gw-show-and-tell{padding-left:0 !important}/*!@.ps-lg-1*/.ps-lg-1.sc-gw-show-and-tell{padding-left:0.25rem !important}/*!@.ps-lg-2*/.ps-lg-2.sc-gw-show-and-tell{padding-left:0.5rem !important}/*!@.ps-lg-3*/.ps-lg-3.sc-gw-show-and-tell{padding-left:1rem !important}/*!@.ps-lg-4*/.ps-lg-4.sc-gw-show-and-tell{padding-left:1.5rem !important}/*!@.ps-lg-5*/.ps-lg-5.sc-gw-show-and-tell{padding-left:3rem !important}/*!@.text-lg-start*/.text-lg-start.sc-gw-show-and-tell{text-align:left !important}/*!@.text-lg-end*/.text-lg-end.sc-gw-show-and-tell{text-align:right !important}/*!@.text-lg-center*/.text-lg-center.sc-gw-show-and-tell{text-align:center !important}}@media (min-width: 1200px){/*!@.float-xl-start*/.float-xl-start.sc-gw-show-and-tell{float:left !important}/*!@.float-xl-end*/.float-xl-end.sc-gw-show-and-tell{float:right !important}/*!@.float-xl-none*/.float-xl-none.sc-gw-show-and-tell{float:none !important}/*!@.d-xl-inline*/.d-xl-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-xl-inline-block*/.d-xl-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-xl-block*/.d-xl-block.sc-gw-show-and-tell{display:block !important}/*!@.d-xl-grid*/.d-xl-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-xl-table*/.d-xl-table.sc-gw-show-and-tell{display:table !important}/*!@.d-xl-table-row*/.d-xl-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-xl-table-cell*/.d-xl-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-xl-flex*/.d-xl-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-xl-inline-flex*/.d-xl-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-xl-none*/.d-xl-none.sc-gw-show-and-tell{display:none !important}/*!@.flex-xl-fill*/.flex-xl-fill.sc-gw-show-and-tell{flex:1 1 auto !important}/*!@.flex-xl-row*/.flex-xl-row.sc-gw-show-and-tell{flex-direction:row !important}/*!@.flex-xl-column*/.flex-xl-column.sc-gw-show-and-tell{flex-direction:column !important}/*!@.flex-xl-row-reverse*/.flex-xl-row-reverse.sc-gw-show-and-tell{flex-direction:row-reverse !important}/*!@.flex-xl-column-reverse*/.flex-xl-column-reverse.sc-gw-show-and-tell{flex-direction:column-reverse !important}/*!@.flex-xl-grow-0*/.flex-xl-grow-0.sc-gw-show-and-tell{flex-grow:0 !important}/*!@.flex-xl-grow-1*/.flex-xl-grow-1.sc-gw-show-and-tell{flex-grow:1 !important}/*!@.flex-xl-shrink-0*/.flex-xl-shrink-0.sc-gw-show-and-tell{flex-shrink:0 !important}/*!@.flex-xl-shrink-1*/.flex-xl-shrink-1.sc-gw-show-and-tell{flex-shrink:1 !important}/*!@.flex-xl-wrap*/.flex-xl-wrap.sc-gw-show-and-tell{flex-wrap:wrap !important}/*!@.flex-xl-nowrap*/.flex-xl-nowrap.sc-gw-show-and-tell{flex-wrap:nowrap !important}/*!@.flex-xl-wrap-reverse*/.flex-xl-wrap-reverse.sc-gw-show-and-tell{flex-wrap:wrap-reverse !important}/*!@.gap-xl-0*/.gap-xl-0.sc-gw-show-and-tell{gap:0 !important}/*!@.gap-xl-1*/.gap-xl-1.sc-gw-show-and-tell{gap:0.25rem !important}/*!@.gap-xl-2*/.gap-xl-2.sc-gw-show-and-tell{gap:0.5rem !important}/*!@.gap-xl-3*/.gap-xl-3.sc-gw-show-and-tell{gap:1rem !important}/*!@.gap-xl-4*/.gap-xl-4.sc-gw-show-and-tell{gap:1.5rem !important}/*!@.gap-xl-5*/.gap-xl-5.sc-gw-show-and-tell{gap:3rem !important}/*!@.justify-content-xl-start*/.justify-content-xl-start.sc-gw-show-and-tell{justify-content:flex-start !important}/*!@.justify-content-xl-end*/.justify-content-xl-end.sc-gw-show-and-tell{justify-content:flex-end !important}/*!@.justify-content-xl-center*/.justify-content-xl-center.sc-gw-show-and-tell{justify-content:center !important}/*!@.justify-content-xl-between*/.justify-content-xl-between.sc-gw-show-and-tell{justify-content:space-between !important}/*!@.justify-content-xl-around*/.justify-content-xl-around.sc-gw-show-and-tell{justify-content:space-around !important}/*!@.justify-content-xl-evenly*/.justify-content-xl-evenly.sc-gw-show-and-tell{justify-content:space-evenly !important}/*!@.align-items-xl-start*/.align-items-xl-start.sc-gw-show-and-tell{align-items:flex-start !important}/*!@.align-items-xl-end*/.align-items-xl-end.sc-gw-show-and-tell{align-items:flex-end !important}/*!@.align-items-xl-center*/.align-items-xl-center.sc-gw-show-and-tell{align-items:center !important}/*!@.align-items-xl-baseline*/.align-items-xl-baseline.sc-gw-show-and-tell{align-items:baseline !important}/*!@.align-items-xl-stretch*/.align-items-xl-stretch.sc-gw-show-and-tell{align-items:stretch !important}/*!@.align-content-xl-start*/.align-content-xl-start.sc-gw-show-and-tell{align-content:flex-start !important}/*!@.align-content-xl-end*/.align-content-xl-end.sc-gw-show-and-tell{align-content:flex-end !important}/*!@.align-content-xl-center*/.align-content-xl-center.sc-gw-show-and-tell{align-content:center !important}/*!@.align-content-xl-between*/.align-content-xl-between.sc-gw-show-and-tell{align-content:space-between !important}/*!@.align-content-xl-around*/.align-content-xl-around.sc-gw-show-and-tell{align-content:space-around !important}/*!@.align-content-xl-stretch*/.align-content-xl-stretch.sc-gw-show-and-tell{align-content:stretch !important}/*!@.align-self-xl-auto*/.align-self-xl-auto.sc-gw-show-and-tell{align-self:auto !important}/*!@.align-self-xl-start*/.align-self-xl-start.sc-gw-show-and-tell{align-self:flex-start !important}/*!@.align-self-xl-end*/.align-self-xl-end.sc-gw-show-and-tell{align-self:flex-end !important}/*!@.align-self-xl-center*/.align-self-xl-center.sc-gw-show-and-tell{align-self:center !important}/*!@.align-self-xl-baseline*/.align-self-xl-baseline.sc-gw-show-and-tell{align-self:baseline !important}/*!@.align-self-xl-stretch*/.align-self-xl-stretch.sc-gw-show-and-tell{align-self:stretch !important}/*!@.order-xl-first*/.order-xl-first.sc-gw-show-and-tell{order:-1 !important}/*!@.order-xl-0*/.order-xl-0.sc-gw-show-and-tell{order:0 !important}/*!@.order-xl-1*/.order-xl-1.sc-gw-show-and-tell{order:1 !important}/*!@.order-xl-2*/.order-xl-2.sc-gw-show-and-tell{order:2 !important}/*!@.order-xl-3*/.order-xl-3.sc-gw-show-and-tell{order:3 !important}/*!@.order-xl-4*/.order-xl-4.sc-gw-show-and-tell{order:4 !important}/*!@.order-xl-5*/.order-xl-5.sc-gw-show-and-tell{order:5 !important}/*!@.order-xl-last*/.order-xl-last.sc-gw-show-and-tell{order:6 !important}/*!@.m-xl-0*/.m-xl-0.sc-gw-show-and-tell{margin:0 !important}/*!@.m-xl-1*/.m-xl-1.sc-gw-show-and-tell{margin:0.25rem !important}/*!@.m-xl-2*/.m-xl-2.sc-gw-show-and-tell{margin:0.5rem !important}/*!@.m-xl-3*/.m-xl-3.sc-gw-show-and-tell{margin:1rem !important}/*!@.m-xl-4*/.m-xl-4.sc-gw-show-and-tell{margin:1.5rem !important}/*!@.m-xl-5*/.m-xl-5.sc-gw-show-and-tell{margin:3rem !important}/*!@.m-xl-auto*/.m-xl-auto.sc-gw-show-and-tell{margin:auto !important}/*!@.mx-xl-0*/.mx-xl-0.sc-gw-show-and-tell{margin-right:0 !important;margin-left:0 !important}/*!@.mx-xl-1*/.mx-xl-1.sc-gw-show-and-tell{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-xl-2*/.mx-xl-2.sc-gw-show-and-tell{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-xl-3*/.mx-xl-3.sc-gw-show-and-tell{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-xl-4*/.mx-xl-4.sc-gw-show-and-tell{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-xl-5*/.mx-xl-5.sc-gw-show-and-tell{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-xl-auto*/.mx-xl-auto.sc-gw-show-and-tell{margin-right:auto !important;margin-left:auto !important}/*!@.my-xl-0*/.my-xl-0.sc-gw-show-and-tell{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-xl-1*/.my-xl-1.sc-gw-show-and-tell{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-xl-2*/.my-xl-2.sc-gw-show-and-tell{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-xl-3*/.my-xl-3.sc-gw-show-and-tell{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-xl-4*/.my-xl-4.sc-gw-show-and-tell{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-xl-5*/.my-xl-5.sc-gw-show-and-tell{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-xl-auto*/.my-xl-auto.sc-gw-show-and-tell{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-xl-0*/.mt-xl-0.sc-gw-show-and-tell{margin-top:0 !important}/*!@.mt-xl-1*/.mt-xl-1.sc-gw-show-and-tell{margin-top:0.25rem !important}/*!@.mt-xl-2*/.mt-xl-2.sc-gw-show-and-tell{margin-top:0.5rem !important}/*!@.mt-xl-3*/.mt-xl-3.sc-gw-show-and-tell{margin-top:1rem !important}/*!@.mt-xl-4*/.mt-xl-4.sc-gw-show-and-tell{margin-top:1.5rem !important}/*!@.mt-xl-5*/.mt-xl-5.sc-gw-show-and-tell{margin-top:3rem !important}/*!@.mt-xl-auto*/.mt-xl-auto.sc-gw-show-and-tell{margin-top:auto !important}/*!@.me-xl-0*/.me-xl-0.sc-gw-show-and-tell{margin-right:0 !important}/*!@.me-xl-1*/.me-xl-1.sc-gw-show-and-tell{margin-right:0.25rem !important}/*!@.me-xl-2*/.me-xl-2.sc-gw-show-and-tell{margin-right:0.5rem !important}/*!@.me-xl-3*/.me-xl-3.sc-gw-show-and-tell{margin-right:1rem !important}/*!@.me-xl-4*/.me-xl-4.sc-gw-show-and-tell{margin-right:1.5rem !important}/*!@.me-xl-5*/.me-xl-5.sc-gw-show-and-tell{margin-right:3rem !important}/*!@.me-xl-auto*/.me-xl-auto.sc-gw-show-and-tell{margin-right:auto !important}/*!@.mb-xl-0*/.mb-xl-0.sc-gw-show-and-tell{margin-bottom:0 !important}/*!@.mb-xl-1*/.mb-xl-1.sc-gw-show-and-tell{margin-bottom:0.25rem !important}/*!@.mb-xl-2*/.mb-xl-2.sc-gw-show-and-tell{margin-bottom:0.5rem !important}/*!@.mb-xl-3*/.mb-xl-3.sc-gw-show-and-tell{margin-bottom:1rem !important}/*!@.mb-xl-4*/.mb-xl-4.sc-gw-show-and-tell{margin-bottom:1.5rem !important}/*!@.mb-xl-5*/.mb-xl-5.sc-gw-show-and-tell{margin-bottom:3rem !important}/*!@.mb-xl-auto*/.mb-xl-auto.sc-gw-show-and-tell{margin-bottom:auto !important}/*!@.ms-xl-0*/.ms-xl-0.sc-gw-show-and-tell{margin-left:0 !important}/*!@.ms-xl-1*/.ms-xl-1.sc-gw-show-and-tell{margin-left:0.25rem !important}/*!@.ms-xl-2*/.ms-xl-2.sc-gw-show-and-tell{margin-left:0.5rem !important}/*!@.ms-xl-3*/.ms-xl-3.sc-gw-show-and-tell{margin-left:1rem !important}/*!@.ms-xl-4*/.ms-xl-4.sc-gw-show-and-tell{margin-left:1.5rem !important}/*!@.ms-xl-5*/.ms-xl-5.sc-gw-show-and-tell{margin-left:3rem !important}/*!@.ms-xl-auto*/.ms-xl-auto.sc-gw-show-and-tell{margin-left:auto !important}/*!@.p-xl-0*/.p-xl-0.sc-gw-show-and-tell{padding:0 !important}/*!@.p-xl-1*/.p-xl-1.sc-gw-show-and-tell{padding:0.25rem !important}/*!@.p-xl-2*/.p-xl-2.sc-gw-show-and-tell{padding:0.5rem !important}/*!@.p-xl-3*/.p-xl-3.sc-gw-show-and-tell{padding:1rem !important}/*!@.p-xl-4*/.p-xl-4.sc-gw-show-and-tell{padding:1.5rem !important}/*!@.p-xl-5*/.p-xl-5.sc-gw-show-and-tell{padding:3rem !important}/*!@.px-xl-0*/.px-xl-0.sc-gw-show-and-tell{padding-right:0 !important;padding-left:0 !important}/*!@.px-xl-1*/.px-xl-1.sc-gw-show-and-tell{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-xl-2*/.px-xl-2.sc-gw-show-and-tell{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-xl-3*/.px-xl-3.sc-gw-show-and-tell{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-xl-4*/.px-xl-4.sc-gw-show-and-tell{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-xl-5*/.px-xl-5.sc-gw-show-and-tell{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-xl-0*/.py-xl-0.sc-gw-show-and-tell{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-xl-1*/.py-xl-1.sc-gw-show-and-tell{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-xl-2*/.py-xl-2.sc-gw-show-and-tell{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-xl-3*/.py-xl-3.sc-gw-show-and-tell{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-xl-4*/.py-xl-4.sc-gw-show-and-tell{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-xl-5*/.py-xl-5.sc-gw-show-and-tell{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-xl-0*/.pt-xl-0.sc-gw-show-and-tell{padding-top:0 !important}/*!@.pt-xl-1*/.pt-xl-1.sc-gw-show-and-tell{padding-top:0.25rem !important}/*!@.pt-xl-2*/.pt-xl-2.sc-gw-show-and-tell{padding-top:0.5rem !important}/*!@.pt-xl-3*/.pt-xl-3.sc-gw-show-and-tell{padding-top:1rem !important}/*!@.pt-xl-4*/.pt-xl-4.sc-gw-show-and-tell{padding-top:1.5rem !important}/*!@.pt-xl-5*/.pt-xl-5.sc-gw-show-and-tell{padding-top:3rem !important}/*!@.pe-xl-0*/.pe-xl-0.sc-gw-show-and-tell{padding-right:0 !important}/*!@.pe-xl-1*/.pe-xl-1.sc-gw-show-and-tell{padding-right:0.25rem !important}/*!@.pe-xl-2*/.pe-xl-2.sc-gw-show-and-tell{padding-right:0.5rem !important}/*!@.pe-xl-3*/.pe-xl-3.sc-gw-show-and-tell{padding-right:1rem !important}/*!@.pe-xl-4*/.pe-xl-4.sc-gw-show-and-tell{padding-right:1.5rem !important}/*!@.pe-xl-5*/.pe-xl-5.sc-gw-show-and-tell{padding-right:3rem !important}/*!@.pb-xl-0*/.pb-xl-0.sc-gw-show-and-tell{padding-bottom:0 !important}/*!@.pb-xl-1*/.pb-xl-1.sc-gw-show-and-tell{padding-bottom:0.25rem !important}/*!@.pb-xl-2*/.pb-xl-2.sc-gw-show-and-tell{padding-bottom:0.5rem !important}/*!@.pb-xl-3*/.pb-xl-3.sc-gw-show-and-tell{padding-bottom:1rem !important}/*!@.pb-xl-4*/.pb-xl-4.sc-gw-show-and-tell{padding-bottom:1.5rem !important}/*!@.pb-xl-5*/.pb-xl-5.sc-gw-show-and-tell{padding-bottom:3rem !important}/*!@.ps-xl-0*/.ps-xl-0.sc-gw-show-and-tell{padding-left:0 !important}/*!@.ps-xl-1*/.ps-xl-1.sc-gw-show-and-tell{padding-left:0.25rem !important}/*!@.ps-xl-2*/.ps-xl-2.sc-gw-show-and-tell{padding-left:0.5rem !important}/*!@.ps-xl-3*/.ps-xl-3.sc-gw-show-and-tell{padding-left:1rem !important}/*!@.ps-xl-4*/.ps-xl-4.sc-gw-show-and-tell{padding-left:1.5rem !important}/*!@.ps-xl-5*/.ps-xl-5.sc-gw-show-and-tell{padding-left:3rem !important}/*!@.text-xl-start*/.text-xl-start.sc-gw-show-and-tell{text-align:left !important}/*!@.text-xl-end*/.text-xl-end.sc-gw-show-and-tell{text-align:right !important}/*!@.text-xl-center*/.text-xl-center.sc-gw-show-and-tell{text-align:center !important}}@media (min-width: 1400px){/*!@.float-xxl-start*/.float-xxl-start.sc-gw-show-and-tell{float:left !important}/*!@.float-xxl-end*/.float-xxl-end.sc-gw-show-and-tell{float:right !important}/*!@.float-xxl-none*/.float-xxl-none.sc-gw-show-and-tell{float:none !important}/*!@.d-xxl-inline*/.d-xxl-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-xxl-inline-block*/.d-xxl-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-xxl-block*/.d-xxl-block.sc-gw-show-and-tell{display:block !important}/*!@.d-xxl-grid*/.d-xxl-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-xxl-table*/.d-xxl-table.sc-gw-show-and-tell{display:table !important}/*!@.d-xxl-table-row*/.d-xxl-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-xxl-table-cell*/.d-xxl-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-xxl-flex*/.d-xxl-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-xxl-inline-flex*/.d-xxl-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-xxl-none*/.d-xxl-none.sc-gw-show-and-tell{display:none !important}/*!@.flex-xxl-fill*/.flex-xxl-fill.sc-gw-show-and-tell{flex:1 1 auto !important}/*!@.flex-xxl-row*/.flex-xxl-row.sc-gw-show-and-tell{flex-direction:row !important}/*!@.flex-xxl-column*/.flex-xxl-column.sc-gw-show-and-tell{flex-direction:column !important}/*!@.flex-xxl-row-reverse*/.flex-xxl-row-reverse.sc-gw-show-and-tell{flex-direction:row-reverse !important}/*!@.flex-xxl-column-reverse*/.flex-xxl-column-reverse.sc-gw-show-and-tell{flex-direction:column-reverse !important}/*!@.flex-xxl-grow-0*/.flex-xxl-grow-0.sc-gw-show-and-tell{flex-grow:0 !important}/*!@.flex-xxl-grow-1*/.flex-xxl-grow-1.sc-gw-show-and-tell{flex-grow:1 !important}/*!@.flex-xxl-shrink-0*/.flex-xxl-shrink-0.sc-gw-show-and-tell{flex-shrink:0 !important}/*!@.flex-xxl-shrink-1*/.flex-xxl-shrink-1.sc-gw-show-and-tell{flex-shrink:1 !important}/*!@.flex-xxl-wrap*/.flex-xxl-wrap.sc-gw-show-and-tell{flex-wrap:wrap !important}/*!@.flex-xxl-nowrap*/.flex-xxl-nowrap.sc-gw-show-and-tell{flex-wrap:nowrap !important}/*!@.flex-xxl-wrap-reverse*/.flex-xxl-wrap-reverse.sc-gw-show-and-tell{flex-wrap:wrap-reverse !important}/*!@.gap-xxl-0*/.gap-xxl-0.sc-gw-show-and-tell{gap:0 !important}/*!@.gap-xxl-1*/.gap-xxl-1.sc-gw-show-and-tell{gap:0.25rem !important}/*!@.gap-xxl-2*/.gap-xxl-2.sc-gw-show-and-tell{gap:0.5rem !important}/*!@.gap-xxl-3*/.gap-xxl-3.sc-gw-show-and-tell{gap:1rem !important}/*!@.gap-xxl-4*/.gap-xxl-4.sc-gw-show-and-tell{gap:1.5rem !important}/*!@.gap-xxl-5*/.gap-xxl-5.sc-gw-show-and-tell{gap:3rem !important}/*!@.justify-content-xxl-start*/.justify-content-xxl-start.sc-gw-show-and-tell{justify-content:flex-start !important}/*!@.justify-content-xxl-end*/.justify-content-xxl-end.sc-gw-show-and-tell{justify-content:flex-end !important}/*!@.justify-content-xxl-center*/.justify-content-xxl-center.sc-gw-show-and-tell{justify-content:center !important}/*!@.justify-content-xxl-between*/.justify-content-xxl-between.sc-gw-show-and-tell{justify-content:space-between !important}/*!@.justify-content-xxl-around*/.justify-content-xxl-around.sc-gw-show-and-tell{justify-content:space-around !important}/*!@.justify-content-xxl-evenly*/.justify-content-xxl-evenly.sc-gw-show-and-tell{justify-content:space-evenly !important}/*!@.align-items-xxl-start*/.align-items-xxl-start.sc-gw-show-and-tell{align-items:flex-start !important}/*!@.align-items-xxl-end*/.align-items-xxl-end.sc-gw-show-and-tell{align-items:flex-end !important}/*!@.align-items-xxl-center*/.align-items-xxl-center.sc-gw-show-and-tell{align-items:center !important}/*!@.align-items-xxl-baseline*/.align-items-xxl-baseline.sc-gw-show-and-tell{align-items:baseline !important}/*!@.align-items-xxl-stretch*/.align-items-xxl-stretch.sc-gw-show-and-tell{align-items:stretch !important}/*!@.align-content-xxl-start*/.align-content-xxl-start.sc-gw-show-and-tell{align-content:flex-start !important}/*!@.align-content-xxl-end*/.align-content-xxl-end.sc-gw-show-and-tell{align-content:flex-end !important}/*!@.align-content-xxl-center*/.align-content-xxl-center.sc-gw-show-and-tell{align-content:center !important}/*!@.align-content-xxl-between*/.align-content-xxl-between.sc-gw-show-and-tell{align-content:space-between !important}/*!@.align-content-xxl-around*/.align-content-xxl-around.sc-gw-show-and-tell{align-content:space-around !important}/*!@.align-content-xxl-stretch*/.align-content-xxl-stretch.sc-gw-show-and-tell{align-content:stretch !important}/*!@.align-self-xxl-auto*/.align-self-xxl-auto.sc-gw-show-and-tell{align-self:auto !important}/*!@.align-self-xxl-start*/.align-self-xxl-start.sc-gw-show-and-tell{align-self:flex-start !important}/*!@.align-self-xxl-end*/.align-self-xxl-end.sc-gw-show-and-tell{align-self:flex-end !important}/*!@.align-self-xxl-center*/.align-self-xxl-center.sc-gw-show-and-tell{align-self:center !important}/*!@.align-self-xxl-baseline*/.align-self-xxl-baseline.sc-gw-show-and-tell{align-self:baseline !important}/*!@.align-self-xxl-stretch*/.align-self-xxl-stretch.sc-gw-show-and-tell{align-self:stretch !important}/*!@.order-xxl-first*/.order-xxl-first.sc-gw-show-and-tell{order:-1 !important}/*!@.order-xxl-0*/.order-xxl-0.sc-gw-show-and-tell{order:0 !important}/*!@.order-xxl-1*/.order-xxl-1.sc-gw-show-and-tell{order:1 !important}/*!@.order-xxl-2*/.order-xxl-2.sc-gw-show-and-tell{order:2 !important}/*!@.order-xxl-3*/.order-xxl-3.sc-gw-show-and-tell{order:3 !important}/*!@.order-xxl-4*/.order-xxl-4.sc-gw-show-and-tell{order:4 !important}/*!@.order-xxl-5*/.order-xxl-5.sc-gw-show-and-tell{order:5 !important}/*!@.order-xxl-last*/.order-xxl-last.sc-gw-show-and-tell{order:6 !important}/*!@.m-xxl-0*/.m-xxl-0.sc-gw-show-and-tell{margin:0 !important}/*!@.m-xxl-1*/.m-xxl-1.sc-gw-show-and-tell{margin:0.25rem !important}/*!@.m-xxl-2*/.m-xxl-2.sc-gw-show-and-tell{margin:0.5rem !important}/*!@.m-xxl-3*/.m-xxl-3.sc-gw-show-and-tell{margin:1rem !important}/*!@.m-xxl-4*/.m-xxl-4.sc-gw-show-and-tell{margin:1.5rem !important}/*!@.m-xxl-5*/.m-xxl-5.sc-gw-show-and-tell{margin:3rem !important}/*!@.m-xxl-auto*/.m-xxl-auto.sc-gw-show-and-tell{margin:auto !important}/*!@.mx-xxl-0*/.mx-xxl-0.sc-gw-show-and-tell{margin-right:0 !important;margin-left:0 !important}/*!@.mx-xxl-1*/.mx-xxl-1.sc-gw-show-and-tell{margin-right:0.25rem !important;margin-left:0.25rem !important}/*!@.mx-xxl-2*/.mx-xxl-2.sc-gw-show-and-tell{margin-right:0.5rem !important;margin-left:0.5rem !important}/*!@.mx-xxl-3*/.mx-xxl-3.sc-gw-show-and-tell{margin-right:1rem !important;margin-left:1rem !important}/*!@.mx-xxl-4*/.mx-xxl-4.sc-gw-show-and-tell{margin-right:1.5rem !important;margin-left:1.5rem !important}/*!@.mx-xxl-5*/.mx-xxl-5.sc-gw-show-and-tell{margin-right:3rem !important;margin-left:3rem !important}/*!@.mx-xxl-auto*/.mx-xxl-auto.sc-gw-show-and-tell{margin-right:auto !important;margin-left:auto !important}/*!@.my-xxl-0*/.my-xxl-0.sc-gw-show-and-tell{margin-top:0 !important;margin-bottom:0 !important}/*!@.my-xxl-1*/.my-xxl-1.sc-gw-show-and-tell{margin-top:0.25rem !important;margin-bottom:0.25rem !important}/*!@.my-xxl-2*/.my-xxl-2.sc-gw-show-and-tell{margin-top:0.5rem !important;margin-bottom:0.5rem !important}/*!@.my-xxl-3*/.my-xxl-3.sc-gw-show-and-tell{margin-top:1rem !important;margin-bottom:1rem !important}/*!@.my-xxl-4*/.my-xxl-4.sc-gw-show-and-tell{margin-top:1.5rem !important;margin-bottom:1.5rem !important}/*!@.my-xxl-5*/.my-xxl-5.sc-gw-show-and-tell{margin-top:3rem !important;margin-bottom:3rem !important}/*!@.my-xxl-auto*/.my-xxl-auto.sc-gw-show-and-tell{margin-top:auto !important;margin-bottom:auto !important}/*!@.mt-xxl-0*/.mt-xxl-0.sc-gw-show-and-tell{margin-top:0 !important}/*!@.mt-xxl-1*/.mt-xxl-1.sc-gw-show-and-tell{margin-top:0.25rem !important}/*!@.mt-xxl-2*/.mt-xxl-2.sc-gw-show-and-tell{margin-top:0.5rem !important}/*!@.mt-xxl-3*/.mt-xxl-3.sc-gw-show-and-tell{margin-top:1rem !important}/*!@.mt-xxl-4*/.mt-xxl-4.sc-gw-show-and-tell{margin-top:1.5rem !important}/*!@.mt-xxl-5*/.mt-xxl-5.sc-gw-show-and-tell{margin-top:3rem !important}/*!@.mt-xxl-auto*/.mt-xxl-auto.sc-gw-show-and-tell{margin-top:auto !important}/*!@.me-xxl-0*/.me-xxl-0.sc-gw-show-and-tell{margin-right:0 !important}/*!@.me-xxl-1*/.me-xxl-1.sc-gw-show-and-tell{margin-right:0.25rem !important}/*!@.me-xxl-2*/.me-xxl-2.sc-gw-show-and-tell{margin-right:0.5rem !important}/*!@.me-xxl-3*/.me-xxl-3.sc-gw-show-and-tell{margin-right:1rem !important}/*!@.me-xxl-4*/.me-xxl-4.sc-gw-show-and-tell{margin-right:1.5rem !important}/*!@.me-xxl-5*/.me-xxl-5.sc-gw-show-and-tell{margin-right:3rem !important}/*!@.me-xxl-auto*/.me-xxl-auto.sc-gw-show-and-tell{margin-right:auto !important}/*!@.mb-xxl-0*/.mb-xxl-0.sc-gw-show-and-tell{margin-bottom:0 !important}/*!@.mb-xxl-1*/.mb-xxl-1.sc-gw-show-and-tell{margin-bottom:0.25rem !important}/*!@.mb-xxl-2*/.mb-xxl-2.sc-gw-show-and-tell{margin-bottom:0.5rem !important}/*!@.mb-xxl-3*/.mb-xxl-3.sc-gw-show-and-tell{margin-bottom:1rem !important}/*!@.mb-xxl-4*/.mb-xxl-4.sc-gw-show-and-tell{margin-bottom:1.5rem !important}/*!@.mb-xxl-5*/.mb-xxl-5.sc-gw-show-and-tell{margin-bottom:3rem !important}/*!@.mb-xxl-auto*/.mb-xxl-auto.sc-gw-show-and-tell{margin-bottom:auto !important}/*!@.ms-xxl-0*/.ms-xxl-0.sc-gw-show-and-tell{margin-left:0 !important}/*!@.ms-xxl-1*/.ms-xxl-1.sc-gw-show-and-tell{margin-left:0.25rem !important}/*!@.ms-xxl-2*/.ms-xxl-2.sc-gw-show-and-tell{margin-left:0.5rem !important}/*!@.ms-xxl-3*/.ms-xxl-3.sc-gw-show-and-tell{margin-left:1rem !important}/*!@.ms-xxl-4*/.ms-xxl-4.sc-gw-show-and-tell{margin-left:1.5rem !important}/*!@.ms-xxl-5*/.ms-xxl-5.sc-gw-show-and-tell{margin-left:3rem !important}/*!@.ms-xxl-auto*/.ms-xxl-auto.sc-gw-show-and-tell{margin-left:auto !important}/*!@.p-xxl-0*/.p-xxl-0.sc-gw-show-and-tell{padding:0 !important}/*!@.p-xxl-1*/.p-xxl-1.sc-gw-show-and-tell{padding:0.25rem !important}/*!@.p-xxl-2*/.p-xxl-2.sc-gw-show-and-tell{padding:0.5rem !important}/*!@.p-xxl-3*/.p-xxl-3.sc-gw-show-and-tell{padding:1rem !important}/*!@.p-xxl-4*/.p-xxl-4.sc-gw-show-and-tell{padding:1.5rem !important}/*!@.p-xxl-5*/.p-xxl-5.sc-gw-show-and-tell{padding:3rem !important}/*!@.px-xxl-0*/.px-xxl-0.sc-gw-show-and-tell{padding-right:0 !important;padding-left:0 !important}/*!@.px-xxl-1*/.px-xxl-1.sc-gw-show-and-tell{padding-right:0.25rem !important;padding-left:0.25rem !important}/*!@.px-xxl-2*/.px-xxl-2.sc-gw-show-and-tell{padding-right:0.5rem !important;padding-left:0.5rem !important}/*!@.px-xxl-3*/.px-xxl-3.sc-gw-show-and-tell{padding-right:1rem !important;padding-left:1rem !important}/*!@.px-xxl-4*/.px-xxl-4.sc-gw-show-and-tell{padding-right:1.5rem !important;padding-left:1.5rem !important}/*!@.px-xxl-5*/.px-xxl-5.sc-gw-show-and-tell{padding-right:3rem !important;padding-left:3rem !important}/*!@.py-xxl-0*/.py-xxl-0.sc-gw-show-and-tell{padding-top:0 !important;padding-bottom:0 !important}/*!@.py-xxl-1*/.py-xxl-1.sc-gw-show-and-tell{padding-top:0.25rem !important;padding-bottom:0.25rem !important}/*!@.py-xxl-2*/.py-xxl-2.sc-gw-show-and-tell{padding-top:0.5rem !important;padding-bottom:0.5rem !important}/*!@.py-xxl-3*/.py-xxl-3.sc-gw-show-and-tell{padding-top:1rem !important;padding-bottom:1rem !important}/*!@.py-xxl-4*/.py-xxl-4.sc-gw-show-and-tell{padding-top:1.5rem !important;padding-bottom:1.5rem !important}/*!@.py-xxl-5*/.py-xxl-5.sc-gw-show-and-tell{padding-top:3rem !important;padding-bottom:3rem !important}/*!@.pt-xxl-0*/.pt-xxl-0.sc-gw-show-and-tell{padding-top:0 !important}/*!@.pt-xxl-1*/.pt-xxl-1.sc-gw-show-and-tell{padding-top:0.25rem !important}/*!@.pt-xxl-2*/.pt-xxl-2.sc-gw-show-and-tell{padding-top:0.5rem !important}/*!@.pt-xxl-3*/.pt-xxl-3.sc-gw-show-and-tell{padding-top:1rem !important}/*!@.pt-xxl-4*/.pt-xxl-4.sc-gw-show-and-tell{padding-top:1.5rem !important}/*!@.pt-xxl-5*/.pt-xxl-5.sc-gw-show-and-tell{padding-top:3rem !important}/*!@.pe-xxl-0*/.pe-xxl-0.sc-gw-show-and-tell{padding-right:0 !important}/*!@.pe-xxl-1*/.pe-xxl-1.sc-gw-show-and-tell{padding-right:0.25rem !important}/*!@.pe-xxl-2*/.pe-xxl-2.sc-gw-show-and-tell{padding-right:0.5rem !important}/*!@.pe-xxl-3*/.pe-xxl-3.sc-gw-show-and-tell{padding-right:1rem !important}/*!@.pe-xxl-4*/.pe-xxl-4.sc-gw-show-and-tell{padding-right:1.5rem !important}/*!@.pe-xxl-5*/.pe-xxl-5.sc-gw-show-and-tell{padding-right:3rem !important}/*!@.pb-xxl-0*/.pb-xxl-0.sc-gw-show-and-tell{padding-bottom:0 !important}/*!@.pb-xxl-1*/.pb-xxl-1.sc-gw-show-and-tell{padding-bottom:0.25rem !important}/*!@.pb-xxl-2*/.pb-xxl-2.sc-gw-show-and-tell{padding-bottom:0.5rem !important}/*!@.pb-xxl-3*/.pb-xxl-3.sc-gw-show-and-tell{padding-bottom:1rem !important}/*!@.pb-xxl-4*/.pb-xxl-4.sc-gw-show-and-tell{padding-bottom:1.5rem !important}/*!@.pb-xxl-5*/.pb-xxl-5.sc-gw-show-and-tell{padding-bottom:3rem !important}/*!@.ps-xxl-0*/.ps-xxl-0.sc-gw-show-and-tell{padding-left:0 !important}/*!@.ps-xxl-1*/.ps-xxl-1.sc-gw-show-and-tell{padding-left:0.25rem !important}/*!@.ps-xxl-2*/.ps-xxl-2.sc-gw-show-and-tell{padding-left:0.5rem !important}/*!@.ps-xxl-3*/.ps-xxl-3.sc-gw-show-and-tell{padding-left:1rem !important}/*!@.ps-xxl-4*/.ps-xxl-4.sc-gw-show-and-tell{padding-left:1.5rem !important}/*!@.ps-xxl-5*/.ps-xxl-5.sc-gw-show-and-tell{padding-left:3rem !important}/*!@.text-xxl-start*/.text-xxl-start.sc-gw-show-and-tell{text-align:left !important}/*!@.text-xxl-end*/.text-xxl-end.sc-gw-show-and-tell{text-align:right !important}/*!@.text-xxl-center*/.text-xxl-center.sc-gw-show-and-tell{text-align:center !important}}@media (min-width: 1200px){/*!@.fs-1*/.fs-1.sc-gw-show-and-tell{font-size:2.5rem !important}/*!@.fs-2*/.fs-2.sc-gw-show-and-tell{font-size:2rem !important}/*!@.fs-3*/.fs-3.sc-gw-show-and-tell{font-size:1.75rem !important}/*!@.fs-4*/.fs-4.sc-gw-show-and-tell{font-size:1.5rem !important}}@media print{/*!@.d-print-inline*/.d-print-inline.sc-gw-show-and-tell{display:inline !important}/*!@.d-print-inline-block*/.d-print-inline-block.sc-gw-show-and-tell{display:inline-block !important}/*!@.d-print-block*/.d-print-block.sc-gw-show-and-tell{display:block !important}/*!@.d-print-grid*/.d-print-grid.sc-gw-show-and-tell{display:grid !important}/*!@.d-print-table*/.d-print-table.sc-gw-show-and-tell{display:table !important}/*!@.d-print-table-row*/.d-print-table-row.sc-gw-show-and-tell{display:table-row !important}/*!@.d-print-table-cell*/.d-print-table-cell.sc-gw-show-and-tell{display:table-cell !important}/*!@.d-print-flex*/.d-print-flex.sc-gw-show-and-tell{display:flex !important}/*!@.d-print-inline-flex*/.d-print-inline-flex.sc-gw-show-and-tell{display:inline-flex !important}/*!@.d-print-none*/.d-print-none.sc-gw-show-and-tell{display:none !important}}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Light.woff\");font-weight:300}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Regular.woff\");font-weight:400}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Medium.woff\");font-weight:500}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Semibold.woff\");font-weight:600}@font-face{font-family:Graphik;src:url(\"../assets/fonts/graphik/Graphik-Bold.woff\");font-weight:700}@font-face{font-family:Rubik;src:url(\"../assets/fonts/rubik/Rubik-Light.woff\");font-weight:300}@font-face{font-family:Rubik;src:url(\"../assets/fonts/rubik/Rubik-Regular.woff\");font-weight:400}@font-face{font-family:Rubik;src:url(\"../assets/fonts/rubik/Rubik-Medium.woff\");font-weight:500}@font-face{font-family:Rubik;src:url(\"../assets/fonts/rubik/Rubik-Bold.woff\");font-weight:700}/*!@p*/p.sc-gw-show-and-tell{font-family:var(--gw-font-family-body);font-weight:var(--gw-font-wight-regular);font-size:var(--gw-font-size-m);line-height:var(--gw-line-height-spaced);margin:var(--gw-space-s) 0 var(--gw-space-s) 0}/*!@section*/section.sc-gw-show-and-tell{padding-top:var(--gw-space-m);padding-bottom:var(--gw-space-m)}@media (min-width: 768px){/*!@section*/section.sc-gw-show-and-tell{padding-top:var(--gw-space-l);padding-bottom:var(--gw-space-l)}}@media (min-width: 992px){/*!@section*/section.sc-gw-show-and-tell{padding-top:var(--gw-space-xl);padding-bottom:var(--gw-space-xl)}}/*!@*:focus-visible*/*.sc-gw-show-and-tell:focus-visible{--borderWidth:3px;outline-width:var(--borderWidth);outline-style:solid;outline-color:var(--gw-color-fuchsia-500)}/*!@:host*/.sc-gw-show-and-tell-h{display:block}/*!@:host(.white-text)*/.white-text.sc-gw-show-and-tell-h{color:var(--gw-color-white)}/*!@.image*/.image.sc-gw-show-and-tell{margin-top:var(--gw-space-m)}@media (min-width: 992px){/*!@.image*/.image.sc-gw-show-and-tell{margin-top:0}}";

class GwShowAndTell {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.bgColor = null;
    this.preTitle = null;
    this.mainTitle = null;
    this.whiteText = false;
    this.pt0 = false; //padding-top:0
    this.pb0 = false; //padding-bottom:0
    this.alignContent = 'left';
    this.imageUrl = null;
    this.imageAlt = null;
    this.rowClasses = null;
    this.leftColClasses = null;
    this.rightColClasses = null;
  }
  componentWillLoad() {
    //define this.rowClasses and this.colClasses css classes.
    if (this.alignContent === 'right') {
      this.rowClasses = 'row justify-content-between';
      this.leftColClasses = 'col-12 col-lg-6 order-lg-2';
      this.rightColClasses = 'col-12 col-lg-5 d-flex align-items-center order-lg-1';
    }
    else {
      //is left
      this.rowClasses = 'row justify-content-between';
      this.leftColClasses = 'col-12 col-lg-6 order-lg-1';
      this.rightColClasses = 'col-12 col-lg-5 d-flex align-items-center order-lg-2';
    }
  }
  componentDidLoad() { }
  render() {
    return (hAsync(Host, { style: {
        backgroundColor: `var(--gw-color-${this.bgColor})`,
      }, class: { 'white-text': this.whiteText } }, hAsync("section", { class: {
        'container': true,
        'pt-0': this.pt0,
        'pb-0': this.pb0,
      } }, hAsync("div", { class: this.rowClasses }, hAsync("div", { class: this.leftColClasses }, this.preTitle ? (hAsync("gw-title", { type: "h3", looks: "h4", light: true, class: { 'pre-title': true } }, this.preTitle)) : null, this.mainTitle ? (hAsync("gw-title", { type: "h2", looks: "h3" }, this.mainTitle)) : null, hAsync("slot", null)), hAsync("div", { class: this.rightColClasses }, this.imageUrl ? hAsync("img", { class: "image", src: this.imageUrl, alt: this.imageAlt }) : null)))));
  }
  static get style() { return gwShowAndTellCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "gw-show-and-tell",
    "$members$": {
      "bgColor": [1, "bg-color"],
      "preTitle": [1, "pre-title"],
      "mainTitle": [1, "main-title"],
      "whiteText": [4, "white-text"],
      "pt0": [4, "pt-0"],
      "pb0": [4, "pb-0"],
      "alignContent": [1, "align-content"],
      "imageUrl": [1, "image-url"],
      "imageAlt": [1, "image-alt"],
      "rowClasses": [32],
      "leftColClasses": [32],
      "rightColClasses": [32]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}


class GwTest {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.theTitle = 'The title';
    this.bgColor = 'auto';
  }
  componentDidLoad() {
    setTimeout(() => {
      this.bgColor = '#7ca51b';
    }, 1000);
  }
  render() {
    return (hAsync(Host, null, hAsync("div", { class: "container" }, hAsync("div", { class: "row" }, hAsync("div", { class: "col" }, "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsam, et perferendis numquam maiores fuga asperiores repellendus doloremque laboriosam eos quae consequatur quisquam commodi cum incidunt nam quos aliquid maxime eum!"), hAsync("div", { class: "col" }, "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor impedit quia, doloribus, deserunt iusto illo nemo et rerum magni recusandae, maiores ipsam. Deserunt, iure aliquam rerum rem perferendis sequi odit."))), hAsync("section", { class: "section", style: { backgroundColor: this.bgColor } }, hAsync("h1", { class: "title" }, this.theTitle), hAsync("slot", null))));
  }
  static get style() { return gwTestCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "gw-test",
    "$members$": {
      "theTitle": [1, "the-title"],
      "bgColor": [1, "bg-color"]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}


class GwTitle {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.type = 'h1'     ;
    this.looks = this.type;
    this.light = false;
    this.mt0 = false;
  }
  createTitle() {
    switch (this.type) {
      case 'h1':
        return (hAsync("h1", { class: this.titleClasses() }, hAsync("slot", null)));
      case 'h2':
        return (hAsync("h2", { class: this.titleClasses() }, hAsync("slot", null)));
      case 'h3':
        return (hAsync("h3", { class: this.titleClasses() }, hAsync("slot", null)));
      case 'h4':
        return (hAsync("h4", { class: this.titleClasses() }, hAsync("slot", null)));
      case 'h5':
        return (hAsync("h5", { class: this.titleClasses() }, hAsync("slot", null)));
      case 'h6':
        return (hAsync("h6", { class: this.titleClasses() }, hAsync("slot", null)));
      default:
        return (hAsync("h1", { class: {
            'title': true,
            'looks-h1': true,
            'light': this.light,
            'mt-0': this.mt0,
          } }, hAsync("slot", null)));
    }
  }
  titleClasses() {
    return {
      'title': true,
      'looks-h1': this.looks === 'h1',
      'looks-h2': this.looks === 'h2',
      'looks-h3': this.looks === 'h3',
      'looks-h4': this.looks === 'h4',
      'looks-h5': this.looks === 'h5',
      'looks-h6': this.looks === 'h6',
      'light': this.light,
      'mt-0': this.mt0,
    };
  }
  render() {
    return hAsync(Host, null, this.createTitle());
  }
  static get style() { return gwTitleCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "gw-title",
    "$members$": {
      "type": [1],
      "looks": [1],
      "light": [4],
      "mt0": [4, "mt-0"]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

function format(first, middle, last) {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

const myComponentCss = "/*!@:host*/.sc-my-component-h{display:block}";

class MyComponent {
  constructor(hostRef) {
    registerInstance(this, hostRef);
  }
  getText() {
    return format(this.first, this.middle, this.last);
  }
  render() {
    return hAsync("div", null, "Hello, World! I'm ", this.getText());
  }
  static get style() { return myComponentCss; }
  static get cmpMeta() { return {
    "$flags$": 9,
    "$tagName$": "my-component",
    "$members$": {
      "first": [1],
      "middle": [1],
      "last": [1]
    },
    "$listeners$": undefined,
    "$lazyBundleId$": "-",
    "$attrsToReflect$": []
  }; }
}

registerComponents([
  GwButton,
  GwLookAtMe,
  GwShowAndTell,
  GwTest,
  GwTitle,
  MyComponent,
]);

exports.hydrateApp = hydrateApp;


  /*hydrateAppClosure end*/
  hydrateApp(window, $stencilHydrateOpts, $stencilHydrateResults, $stencilAfterHydrate, $stencilHydrateResolve);
  }

  hydrateAppClosure($stencilWindow);
}

function createWindowFromHtml(e, t) {
 let r = templateWindows.get(t);
 return null == r && (r = new MockWindow(e), templateWindows.set(t, r)), cloneWindow(r);
}

function normalizeHydrateOptions(e) {
 const t = Object.assign({
  serializeToHtml: !1,
  destroyWindow: !1,
  destroyDocument: !1
 }, e || {});
 return "boolean" != typeof t.clientHydrateAnnotations && (t.clientHydrateAnnotations = !0), 
 "boolean" != typeof t.constrainTimeouts && (t.constrainTimeouts = !0), "number" != typeof t.maxHydrateCount && (t.maxHydrateCount = 300), 
 "boolean" != typeof t.runtimeLogging && (t.runtimeLogging = !1), "number" != typeof t.timeout && (t.timeout = 15e3), 
 Array.isArray(t.excludeComponents) ? t.excludeComponents = t.excludeComponents.filter(filterValidTags).map(mapValidTags) : t.excludeComponents = [], 
 Array.isArray(t.staticComponents) ? t.staticComponents = t.staticComponents.filter(filterValidTags).map(mapValidTags) : t.staticComponents = [], 
 t;
}

function filterValidTags(e) {
 return "string" == typeof e && e.includes("-");
}

function mapValidTags(e) {
 return e.trim().toLowerCase();
}

function generateHydrateResults(e) {
 "string" != typeof e.url && (e.url = "https://hydrate.stenciljs.com/"), "string" != typeof e.buildId && (e.buildId = createHydrateBuildId());
 const t = {
  buildId: e.buildId,
  diagnostics: [],
  url: e.url,
  host: null,
  hostname: null,
  href: null,
  pathname: null,
  port: null,
  search: null,
  hash: null,
  html: null,
  httpStatus: null,
  hydratedCount: 0,
  anchors: [],
  components: [],
  imgs: [],
  scripts: [],
  staticData: [],
  styles: [],
  title: null
 };
 try {
  const r = new URL(e.url, "https://hydrate.stenciljs.com/");
  t.url = r.href, t.host = r.host, t.hostname = r.hostname, t.href = r.href, t.port = r.port, 
  t.pathname = r.pathname, t.search = r.search, t.hash = r.hash;
 } catch (e) {
  renderCatchError(t, e);
 }
 return t;
}

function renderBuildDiagnostic(e, t, r, s) {
 const n = {
  level: t,
  type: "build",
  header: r,
  messageText: s,
  relFilePath: null,
  absFilePath: null,
  lines: []
 };
 return e.pathname ? "/" !== e.pathname && (n.header += ": " + e.pathname) : e.url && (n.header += ": " + e.url), 
 e.diagnostics.push(n), n;
}

function renderBuildError(e, t) {
 return renderBuildDiagnostic(e, "error", "Hydrate Error", t);
}

function renderCatchError(e, t) {
 const r = renderBuildError(e, null);
 return null != t && (null != t.stack ? r.messageText = t.stack.toString() : null != t.message ? r.messageText = t.message.toString() : r.messageText = t.toString()), 
 r;
}

function runtimeLog(e, t, r) {
 global.console[t].apply(global.console, [ `[ ${e}  ${t} ] `, ...r ]);
}

function inspectElement(e, t, r) {
 const s = t.children;
 for (let t = 0, n = s.length; t < n; t++) {
  const n = s[t], o = n.nodeName.toLowerCase();
  if (o.includes("-")) {
   const t = e.components.find((e => e.tag === o));
   null != t && (t.count++, r > t.depth && (t.depth = r));
  } else switch (o) {
  case "a":
   const t = collectAttributes(n);
   t.href = n.href, "string" == typeof t.href && (e.anchors.some((e => e.href === t.href)) || e.anchors.push(t));
   break;

  case "img":
   const r = collectAttributes(n);
   r.src = n.src, "string" == typeof r.src && (e.imgs.some((e => e.src === r.src)) || e.imgs.push(r));
   break;

  case "link":
   const s = collectAttributes(n);
   s.href = n.href, "string" == typeof s.rel && "stylesheet" === s.rel.toLowerCase() && "string" == typeof s.href && (e.styles.some((e => e.link === s.href)) || (delete s.rel, 
   delete s.type, e.styles.push(s)));
   break;

  case "script":
   const o = collectAttributes(n);
   if (n.hasAttribute("src")) o.src = n.src, "string" == typeof o.src && (e.scripts.some((e => e.src === o.src)) || e.scripts.push(o)); else {
    const t = n.getAttribute("data-stencil-static");
    t && e.staticData.push({
     id: t,
     type: n.getAttribute("type"),
     content: n.textContent
    });
   }
  }
  inspectElement(e, n, ++r);
 }
}

function collectAttributes(e) {
 const t = {}, r = e.attributes;
 for (let e = 0, s = r.length; e < s; e++) {
  const s = r.item(e), n = s.nodeName.toLowerCase();
  if (SKIP_ATTRS.has(n)) continue;
  const o = s.nodeValue;
  "class" === n && "" === o || (t[n] = o);
 }
 return t;
}

function patchDomImplementation(e, t) {
 let r;
 if (null != e.defaultView ? (t.destroyWindow = !0, patchWindow(e.defaultView), r = e.defaultView) : (t.destroyWindow = !0, 
 t.destroyDocument = !1, r = new MockWindow(!1)), r.document !== e && (r.document = e), 
 e.defaultView !== r && (e.defaultView = r), "function" != typeof e.documentElement.constructor.prototype.getRootNode && (e.createElement("unknown-element").constructor.prototype.getRootNode = getRootNode), 
 "function" == typeof e.createEvent) {
  const t = e.createEvent("CustomEvent").constructor;
  r.CustomEvent !== t && (r.CustomEvent = t);
 }
 try {
  e.baseURI;
 } catch (t) {
  Object.defineProperty(e, "baseURI", {
   get() {
    const t = e.querySelector("base[href]");
    return t ? new URL(t.getAttribute("href"), r.location.href).href : r.location.href;
   }
  });
 }
 return r;
}

function getRootNode(e) {
 const t = null != e && !0 === e.composed;
 let r = this;
 for (;null != r.parentNode; ) r = r.parentNode, !0 === t && null == r.parentNode && null != r.host && (r = r.host);
 return r;
}

function renderToString(e, t) {
 const r = normalizeHydrateOptions(t);
 return r.serializeToHtml = !0, new Promise((t => {
  let s;
  const n = generateHydrateResults(r);
  if (hasError(n.diagnostics)) t(n); else if ("string" == typeof e) try {
   r.destroyWindow = !0, r.destroyDocument = !0, s = new MockWindow(e), render(s, r, n, t);
  } catch (e) {
   s && s.close && s.close(), s = null, renderCatchError(n, e), t(n);
  } else if (isValidDocument(e)) try {
   r.destroyDocument = !1, s = patchDomImplementation(e, r), render(s, r, n, t);
  } catch (e) {
   s && s.close && s.close(), s = null, renderCatchError(n, e), t(n);
  } else renderBuildError(n, 'Invalid html or document. Must be either a valid "html" string, or DOM "document".'), 
  t(n);
 }));
}

function hydrateDocument(e, t) {
 const r = normalizeHydrateOptions(t);
 return r.serializeToHtml = !1, new Promise((t => {
  let s;
  const n = generateHydrateResults(r);
  if (hasError(n.diagnostics)) t(n); else if ("string" == typeof e) try {
   r.destroyWindow = !0, r.destroyDocument = !0, s = new MockWindow(e), render(s, r, n, t);
  } catch (e) {
   s && s.close && s.close(), s = null, renderCatchError(n, e), t(n);
  } else if (isValidDocument(e)) try {
   r.destroyDocument = !1, s = patchDomImplementation(e, r), render(s, r, n, t);
  } catch (e) {
   s && s.close && s.close(), s = null, renderCatchError(n, e), t(n);
  } else renderBuildError(n, 'Invalid html or document. Must be either a valid "html" string, or DOM "document".'), 
  t(n);
 }));
}

function render(e, t, r, s) {
 if (process.__stencilErrors || (process.__stencilErrors = !0, process.on("unhandledRejection", (e => {
  console.log("unhandledRejection", e);
 }))), function n(e, t, r, s) {
  try {
   e.location.href = r.url;
  } catch (e) {
   renderCatchError(s, e);
  }
  if ("string" == typeof r.userAgent) try {
   e.navigator.userAgent = r.userAgent;
  } catch (e) {}
  if ("string" == typeof r.cookie) try {
   t.cookie = r.cookie;
  } catch (e) {}
  if ("string" == typeof r.referrer) try {
   t.referrer = r.referrer;
  } catch (e) {}
  if ("string" == typeof r.direction) try {
   t.documentElement.setAttribute("dir", r.direction);
  } catch (e) {}
  if ("string" == typeof r.language) try {
   t.documentElement.setAttribute("lang", r.language);
  } catch (e) {}
  if ("string" == typeof r.buildId) try {
   t.documentElement.setAttribute("data-stencil-build", r.buildId);
  } catch (e) {}
  try {
   e.customElements = null;
  } catch (e) {}
  return r.constrainTimeouts && constrainTimeouts(e), function n(e, t, r) {
   try {
    const s = e.location.pathname;
    e.console.error = (...e) => {
     const n = e.reduce(((e, t) => {
      if (t) {
       if (null != t.stack) return e + " " + String(t.stack);
       if (null != t.message) return e + " " + String(t.message);
      }
      return String(t);
     }), "").trim();
     "" !== n && (renderCatchError(r, n), t.runtimeLogging && runtimeLog(s, "error", [ n ]));
    }, e.console.debug = (...e) => {
     renderBuildDiagnostic(r, "debug", "Hydrate Debug", [ ...e ].join(", ")), t.runtimeLogging && runtimeLog(s, "debug", e);
    }, t.runtimeLogging && [ "log", "warn", "assert", "info", "trace" ].forEach((t => {
     e.console[t] = (...e) => {
      runtimeLog(s, t, e);
     };
    }));
   } catch (e) {
    renderCatchError(r, e);
   }
  }(e, r, s), e;
 }(e, e.document, t, r), "function" == typeof t.beforeHydrate) try {
  const n = t.beforeHydrate(e.document);
  isPromise(n) ? n.then((() => {
   hydrateFactory(e, t, r, afterHydrate, s);
  })) : hydrateFactory(e, t, r, afterHydrate, s);
 } catch (n) {
  renderCatchError(r, n), finalizeHydrate(e, e.document, t, r, s);
 } else hydrateFactory(e, t, r, afterHydrate, s);
}

function afterHydrate(e, t, r, s) {
 if ("function" == typeof t.afterHydrate) try {
  const n = t.afterHydrate(e.document);
  isPromise(n) ? n.then((() => {
   finalizeHydrate(e, e.document, t, r, s);
  })) : finalizeHydrate(e, e.document, t, r, s);
 } catch (n) {
  renderCatchError(r, n), finalizeHydrate(e, e.document, t, r, s);
 } else finalizeHydrate(e, e.document, t, r, s);
}

function finalizeHydrate(e, t, r, s, n) {
 try {
  if (inspectElement(s, t.documentElement, 0), !1 !== r.removeUnusedStyles) try {
   ((e, t) => {
    try {
     const r = e.head.querySelectorAll("style[data-styles]"), s = r.length;
     if (s > 0) {
      const n = (e => {
       const t = {
        attrs: new Set,
        classNames: new Set,
        ids: new Set,
        tags: new Set
       };
       return collectUsedSelectors(t, e), t;
      })(e.documentElement);
      for (let e = 0; e < s; e++) removeUnusedStyleText(n, t, r[e]);
     }
    } catch (e) {
     ((e, t, r) => {
      const s = {
       level: "error",
       type: "build",
       header: "Build Error",
       messageText: "build error",
       relFilePath: null,
       absFilePath: null,
       lines: []
      };
      null != t && (null != t.stack ? s.messageText = t.stack.toString() : null != t.message ? s.messageText = t.message.length ? t.message : "UNKNOWN ERROR" : s.messageText = t.toString()), 
      null == e || shouldIgnoreError(s.messageText) || e.push(s);
     })(t, e);
    }
   })(t, s.diagnostics);
  } catch (e) {
   renderCatchError(s, e);
  }
  if ("string" == typeof r.title) try {
   t.title = r.title;
  } catch (e) {
   renderCatchError(s, e);
  }
  s.title = t.title, r.removeScripts && removeScripts(t.documentElement);
  try {
   ((e, t) => {
    let r = e.head.querySelector('link[rel="canonical"]');
    "string" == typeof t ? (null == r && (r = e.createElement("link"), r.setAttribute("rel", "canonical"), 
    e.head.appendChild(r)), r.setAttribute("href", t)) : null != r && (r.getAttribute("href") || r.parentNode.removeChild(r));
   })(t, r.canonicalUrl);
  } catch (e) {
   renderCatchError(s, e);
  }
  try {
   (e => {
    const t = e.head;
    let r = t.querySelector("meta[charset]");
    null == r ? (r = e.createElement("meta"), r.setAttribute("charset", "utf-8")) : r.remove(), 
    t.insertBefore(r, t.firstChild);
   })(t);
  } catch (e) {}
  hasError(s.diagnostics) || (s.httpStatus = 200);
  try {
   const e = t.head.querySelector('meta[http-equiv="status"]');
   if (null != e) {
    const t = e.getAttribute("content");
    t && t.length > 0 && (s.httpStatus = parseInt(t, 10));
   }
  } catch (e) {}
  r.clientHydrateAnnotations && t.documentElement.classList.add("hydrated"), r.serializeToHtml && (s.html = serializeDocumentToString(t, r));
 } catch (e) {
  renderCatchError(s, e);
 }
 if (r.destroyWindow) try {
  r.destroyDocument || (e.document = null, t.defaultView = null), e.close && e.close();
 } catch (e) {
  renderCatchError(s, e);
 }
 n(s);
}

function serializeDocumentToString(e, t) {
 return serializeNodeToHtml(e, {
  approximateLineWidth: t.approximateLineWidth,
  outerHtml: !1,
  prettyHtml: t.prettyHtml,
  removeAttributeQuotes: t.removeAttributeQuotes,
  removeBooleanAttributeQuotes: t.removeBooleanAttributeQuotes,
  removeEmptyAttributes: t.removeEmptyAttributes,
  removeHtmlComments: t.removeHtmlComments,
  serializeShadowRoot: !1
 });
}

function isValidDocument(e) {
 return null != e && 9 === e.nodeType && null != e.documentElement && 1 === e.documentElement.nodeType && null != e.body && 1 === e.body.nodeType;
}

function removeScripts(e) {
 const t = e.children;
 for (let e = t.length - 1; e >= 0; e--) {
  const r = t[e];
  removeScripts(r), ("SCRIPT" === r.nodeName || "LINK" === r.nodeName && "modulepreload" === r.getAttribute("rel")) && r.remove();
 }
}

const templateWindows = new Map, createHydrateBuildId = () => {
 let e = "abcdefghijklmnopqrstuvwxyz", t = "";
 for (;t.length < 8; ) t += e[Math.floor(Math.random() * e.length)], 1 === t.length && (e += "0123456789");
 return t;
}, isPromise = e => !!e && ("object" == typeof e || "function" == typeof e) && "function" == typeof e.then, hasError = e => null != e && 0 !== e.length && e.some((e => "error" === e.level && "runtime" !== e.type)), shouldIgnoreError = e => e === TASK_CANCELED_MSG, TASK_CANCELED_MSG = "task canceled", SKIP_ATTRS = new Set([ "s-id", "c-id" ]), collectUsedSelectors = (e, t) => {
 if (null != t && 1 === t.nodeType) {
  const r = t.children, s = t.nodeName.toLowerCase();
  e.tags.add(s);
  const n = t.attributes;
  for (let r = 0, s = n.length; r < s; r++) {
   const s = n.item(r), o = s.name.toLowerCase();
   if (e.attrs.add(o), "class" === o) {
    const r = t.classList;
    for (let t = 0, s = r.length; t < s; t++) e.classNames.add(r.item(t));
   } else "id" === o && e.ids.add(s.value);
  }
  if (r) for (let t = 0, s = r.length; t < s; t++) collectUsedSelectors(e, r[t]);
 }
}, parseCss = (e, t) => {
 let r = 1, s = 1;
 const n = [], o = e => {
  const t = e.match(/\n/g);
  t && (r += t.length);
  const n = e.lastIndexOf("\n");
  s = ~n ? e.length - n : s + e.length;
 }, i = () => {
  const e = {
   line: r,
   column: s
  };
  return t => (t.position = new z(e), m(), t);
 }, a = o => {
  const i = e.split("\n"), a = {
   level: "error",
   type: "css",
   language: "css",
   header: "CSS Parse",
   messageText: o,
   absFilePath: t,
   lines: [ {
    lineIndex: r - 1,
    lineNumber: r,
    errorCharStart: s,
    text: e[r - 1]
   } ]
  };
  if (r > 1) {
   const t = {
    lineIndex: r - 1,
    lineNumber: r - 1,
    text: e[r - 2],
    errorCharStart: -1,
    errorLength: -1
   };
   a.lines.unshift(t);
  }
  if (r + 2 < i.length) {
   const e = {
    lineIndex: r,
    lineNumber: r + 1,
    text: i[r],
    errorCharStart: -1,
    errorLength: -1
   };
   a.lines.push(e);
  }
  return n.push(a), null;
 }, l = () => u(/^{\s*/), c = () => u(/^}/), u = t => {
  const r = t.exec(e);
  if (!r) return;
  const s = r[0];
  return o(s), e = e.slice(s.length), r;
 }, d = () => {
  let t;
  const r = [];
  for (m(), h(r); e.length && "}" !== e.charAt(0) && (t = w() || A()); ) !1 !== t && (r.push(t), 
  h(r));
  return r;
 }, m = () => u(/^\s*/), h = e => {
  let t;
  for (e = e || []; t = p(); ) !1 !== t && e.push(t);
  return e;
 }, p = () => {
  const t = i();
  if ("/" !== e.charAt(0) || "*" !== e.charAt(1)) return null;
  let r = 2;
  for (;"" !== e.charAt(r) && ("*" !== e.charAt(r) || "/" !== e.charAt(r + 1)); ) ++r;
  if (r += 2, "" === e.charAt(r - 1)) return a("End of comment missing");
  const n = e.slice(2, r - 2);
  return s += 2, o(n), e = e.slice(r), s += 2, t({
   type: 1,
   comment: n
  });
 }, f = () => {
  const e = u(/^([^{]+)/);
  return e ? trim(e[0]).replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, (function(e) {
   return e.replace(/,/g, "‌");
  })).split(/\s*(?![^(]*\)),\s*/).map((function(e) {
   return e.replace(/\u200C/g, ",");
  })) : null;
 }, g = () => {
  const e = i();
  let t = u(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
  if (!t) return null;
  if (t = trim(t[0]), !u(/^:\s*/)) return a("property missing ':'");
  const r = u(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/), s = e({
   type: 4,
   property: t.replace(commentre, ""),
   value: r ? trim(r[0]).replace(commentre, "") : ""
  });
  return u(/^[;\s]*/), s;
 }, y = () => {
  const e = [];
  if (!l()) return a("missing '{'");
  let t;
  for (h(e); t = g(); ) !1 !== t && (e.push(t), h(e));
  return c() ? e : a("missing '}'");
 }, C = () => {
  let e;
  const t = [], r = i();
  for (;e = u(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/); ) t.push(e[1]), u(/^,\s*/);
  return t.length ? r({
   type: 9,
   values: t,
   declarations: y()
  }) : null;
 }, S = (e, t) => {
  const r = new RegExp("^@" + e + "\\s*([^;]+);");
  return () => {
   const s = i(), n = u(r);
   if (!n) return null;
   const o = {
    type: t
   };
   return o[e] = n[1].trim(), s(o);
  };
 }, E = S("import", 7), b = S("charset", 0), T = S("namespace", 11), w = () => "@" !== e[0] ? null : (() => {
  const e = i();
  let t = u(/^@([-\w]+)?keyframes\s*/);
  if (!t) return null;
  const r = t[1];
  if (t = u(/^([-\w]+)\s*/), !t) return a("@keyframes missing name");
  const s = t[1];
  if (!l()) return a("@keyframes missing '{'");
  let n, o = h();
  for (;n = C(); ) o.push(n), o = o.concat(h());
  return c() ? e({
   type: 8,
   name: s,
   vendor: r,
   keyframes: o
  }) : a("@keyframes missing '}'");
 })() || (() => {
  const e = i(), t = u(/^@media *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]);
  if (!l()) return a("@media missing '{'");
  const s = h().concat(d());
  return c() ? e({
   type: 10,
   media: r,
   rules: s
  }) : a("@media missing '}'");
 })() || (() => {
  const e = i(), t = u(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
  return t ? e({
   type: 2,
   name: trim(t[1]),
   media: trim(t[2])
  }) : null;
 })() || (() => {
  const e = i(), t = u(/^@supports *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]);
  if (!l()) return a("@supports missing '{'");
  const s = h().concat(d());
  return c() ? e({
   type: 15,
   supports: r,
   rules: s
  }) : a("@supports missing '}'");
 })() || E() || b() || T() || (() => {
  const e = i(), t = u(/^@([-\w]+)?document *([^{]+)/);
  if (!t) return null;
  const r = trim(t[1]), s = trim(t[2]);
  if (!l()) return a("@document missing '{'");
  const n = h().concat(d());
  return c() ? e({
   type: 3,
   document: s,
   vendor: r,
   rules: n
  }) : a("@document missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@page */)) return null;
  const t = f() || [];
  if (!l()) return a("@page missing '{'");
  let r, s = h();
  for (;r = g(); ) s.push(r), s = s.concat(h());
  return c() ? e({
   type: 12,
   selectors: t,
   declarations: s
  }) : a("@page missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@host\s*/)) return null;
  if (!l()) return a("@host missing '{'");
  const t = h().concat(d());
  return c() ? e({
   type: 6,
   rules: t
  }) : a("@host missing '}'");
 })() || (() => {
  const e = i();
  if (!u(/^@font-face\s*/)) return null;
  if (!l()) return a("@font-face missing '{'");
  let t, r = h();
  for (;t = g(); ) r.push(t), r = r.concat(h());
  return c() ? e({
   type: 5,
   declarations: r
  }) : a("@font-face missing '}'");
 })(), A = () => {
  const e = i(), t = f();
  return t ? (h(), e({
   type: 13,
   selectors: t,
   declarations: y()
  })) : a("selector missing");
 };
 class z {
  constructor(e) {
   this.start = e, this.end = {
    line: r,
    column: s
   }, this.source = t;
  }
 }
 return z.prototype.content = e, {
  diagnostics: n,
  ...addParent((() => {
   const e = d();
   return {
    type: 14,
    stylesheet: {
     source: t,
     rules: e
    }
   };
  })())
 };
}, trim = e => e ? e.trim() : "", addParent = (e, t) => {
 const r = e && "string" == typeof e.type, s = r ? e : t;
 for (const t in e) {
  const r = e[t];
  Array.isArray(r) ? r.forEach((function(e) {
   addParent(e, s);
  })) : r && "object" == typeof r && addParent(r, s);
 }
 return r && Object.defineProperty(e, "parent", {
  configurable: !0,
  writable: !0,
  enumerable: !1,
  value: t || null
 }), e;
}, commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, getCssSelectors = e => {
 SELECTORS.all.length = SELECTORS.tags.length = SELECTORS.classNames.length = SELECTORS.ids.length = SELECTORS.attrs.length = 0;
 const t = (e = e.replace(/\./g, " .").replace(/\#/g, " #").replace(/\[/g, " [").replace(/\>/g, " > ").replace(/\+/g, " + ").replace(/\~/g, " ~ ").replace(/\*/g, " * ").replace(/\:not\((.*?)\)/g, " ")).split(" ");
 for (let e = 0, r = t.length; e < r; e++) t[e] = t[e].split(":")[0], 0 !== t[e].length && ("." === t[e].charAt(0) ? SELECTORS.classNames.push(t[e].slice(1)) : "#" === t[e].charAt(0) ? SELECTORS.ids.push(t[e].slice(1)) : "[" === t[e].charAt(0) ? (t[e] = t[e].slice(1).split("=")[0].split("]")[0].trim(), 
 SELECTORS.attrs.push(t[e].toLowerCase())) : /[a-z]/g.test(t[e].charAt(0)) && SELECTORS.tags.push(t[e].toLowerCase()));
 return SELECTORS.classNames = SELECTORS.classNames.sort(((e, t) => e.length < t.length ? -1 : e.length > t.length ? 1 : 0)), 
 SELECTORS;
}, SELECTORS = {
 all: [],
 tags: [],
 classNames: [],
 ids: [],
 attrs: []
}, serializeCssVisitNode = (e, t, r, s) => {
 const n = t.type;
 return 4 === n ? serializeCssDeclaration(t, r, s) : 13 === n ? serializeCssRule(e, t) : 1 === n ? "!" === t.comment[0] ? `/*${t.comment}*/` : "" : 10 === n ? serializeCssMedia(e, t) : 8 === n ? serializeCssKeyframes(e, t) : 9 === n ? serializeCssKeyframe(e, t) : 5 === n ? serializeCssFontFace(e, t) : 15 === n ? serializeCssSupports(e, t) : 7 === n ? "@import " + t.import + ";" : 0 === n ? "@charset " + t.charset + ";" : 12 === n ? serializeCssPage(e, t) : 6 === n ? "@host{" + serializeCssMapVisit(e, t.rules) + "}" : 2 === n ? "@custom-media " + t.name + " " + t.media + ";" : 3 === n ? serializeCssDocument(e, t) : 11 === n ? "@namespace " + t.namespace + ";" : "";
}, serializeCssRule = (e, t) => {
 const r = t.declarations, s = e.usedSelectors, n = t.selectors.slice();
 if (null == r || 0 === r.length) return "";
 if (s) {
  let t, r, o = !0;
  for (t = n.length - 1; t >= 0; t--) {
   const i = getCssSelectors(n[t]);
   o = !0;
   let a = i.classNames.length;
   if (a > 0 && e.hasUsedClassNames) for (r = 0; r < a; r++) if (!s.classNames.has(i.classNames[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedTags && (a = i.tags.length, a > 0)) for (r = 0; r < a; r++) if (!s.tags.has(i.tags[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedAttrs && (a = i.attrs.length, a > 0)) for (r = 0; r < a; r++) if (!s.attrs.has(i.attrs[r])) {
    o = !1;
    break;
   }
   if (o && e.hasUsedIds && (a = i.ids.length, a > 0)) for (r = 0; r < a; r++) if (!s.ids.has(i.ids[r])) {
    o = !1;
    break;
   }
   o || n.splice(t, 1);
  }
 }
 if (0 === n.length) return "";
 const o = [];
 let i = "";
 for (const e of t.selectors) i = removeSelectorWhitespace(e), o.includes(i) || o.push(i);
 return `${o}{${serializeCssMapVisit(e, r)}}`;
}, serializeCssDeclaration = (e, t, r) => "" === e.value ? "" : r - 1 === t ? e.property + ":" + e.value : e.property + ":" + e.value + ";", serializeCssMedia = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules);
 return "" === r ? "" : "@media " + removeMediaWhitespace(t.media) + "{" + r + "}";
}, serializeCssKeyframes = (e, t) => {
 const r = serializeCssMapVisit(e, t.keyframes);
 return "" === r ? "" : "@" + (t.vendor || "") + "keyframes " + t.name + "{" + r + "}";
}, serializeCssKeyframe = (e, t) => t.values.join(",") + "{" + serializeCssMapVisit(e, t.declarations) + "}", serializeCssFontFace = (e, t) => {
 const r = serializeCssMapVisit(e, t.declarations);
 return "" === r ? "" : "@font-face{" + r + "}";
}, serializeCssSupports = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules);
 return "" === r ? "" : "@supports " + t.supports + "{" + r + "}";
}, serializeCssPage = (e, t) => "@page " + t.selectors.join(", ") + "{" + serializeCssMapVisit(e, t.declarations) + "}", serializeCssDocument = (e, t) => {
 const r = serializeCssMapVisit(e, t.rules), s = "@" + (t.vendor || "") + "document " + t.document;
 return "" === r ? "" : s + "{" + r + "}";
}, serializeCssMapVisit = (e, t) => {
 let r = "";
 if (t) for (let s = 0, n = t.length; s < n; s++) r += serializeCssVisitNode(e, t[s], s, n);
 return r;
}, removeSelectorWhitespace = e => {
 let t = "", r = "", s = !1;
 for (let n = 0, o = (e = e.trim()).length; n < o; n++) if (r = e[n], "[" === r && "\\" !== t[t.length - 1] ? s = !0 : "]" === r && "\\" !== t[t.length - 1] && (s = !1), 
 !s && CSS_WS_REG.test(r)) {
  if (CSS_NEXT_CHAR_REG.test(e[n + 1])) continue;
  if (CSS_PREV_CHAR_REG.test(t[t.length - 1])) continue;
  t += " ";
 } else t += r;
 return t;
}, removeMediaWhitespace = e => {
 let t = "", r = "";
 for (let s = 0, n = (e = e.trim()).length; s < n; s++) if (r = e[s], CSS_WS_REG.test(r)) {
  if (CSS_WS_REG.test(t[t.length - 1])) continue;
  t += " ";
 } else t += r;
 return t;
}, CSS_WS_REG = /\s/, CSS_NEXT_CHAR_REG = /[>\(\)\~\,\+\s]/, CSS_PREV_CHAR_REG = /[>\(\~\,\+]/, removeUnusedStyleText = (e, t, r) => {
 try {
  const s = parseCss(r.innerHTML);
  if (t.push(...s.diagnostics), hasError(t)) return;
  try {
   r.innerHTML = ((e, t) => {
    const r = t.usedSelectors || null, s = {
     usedSelectors: r || null,
     hasUsedAttrs: !!r && r.attrs.size > 0,
     hasUsedClassNames: !!r && r.classNames.size > 0,
     hasUsedIds: !!r && r.ids.size > 0,
     hasUsedTags: !!r && r.tags.size > 0
    }, n = e.rules;
    if (!n) return "";
    const o = n.length, i = [];
    for (let e = 0; e < o; e++) i.push(serializeCssVisitNode(s, n[e], e, o));
    return i.join("");
   })(s.stylesheet, {
    usedSelectors: e
   });
  } catch (e) {
   t.push({
    level: "warn",
    type: "css",
    header: "CSS Stringify",
    messageText: e
   });
  }
 } catch (e) {
  t.push({
   level: "warn",
   type: "css",
   header: "CSS Parse",
   messageText: e
  });
 }
};

exports.createWindowFromHtml = createWindowFromHtml;
exports.hydrateDocument = hydrateDocument;
exports.renderToString = renderToString;
exports.serializeDocumentToString = serializeDocumentToString;