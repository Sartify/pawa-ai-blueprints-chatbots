"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/space-separated-tokens";
exports.ids = ["vendor-chunks/space-separated-tokens"];
exports.modules = {

/***/ "(ssr)/./node_modules/space-separated-tokens/index.js":
/*!******************************************************!*\
  !*** ./node_modules/space-separated-tokens/index.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n\nexports.parse = parse\nexports.stringify = stringify\n\nvar empty = ''\nvar space = ' '\nvar whiteSpace = /[ \\t\\n\\r\\f]+/g\n\nfunction parse(value) {\n  var input = String(value || empty).trim()\n  return input === empty ? [] : input.split(whiteSpace)\n}\n\nfunction stringify(values) {\n  return values.join(space).trim()\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvc3BhY2Utc2VwYXJhdGVkLXRva2Vucy9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBWTs7QUFFWixhQUFhO0FBQ2IsaUJBQWlCOztBQUVqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBIiwic291cmNlcyI6WyJEOlxcQ09ERUJBU0VcXFBhd2EtYWktYmx1ZXByaW50cy1jaGF0Ym90XFx3Y2Zib3RcXGZyb250LWVuZFxcbm9kZV9tb2R1bGVzXFxzcGFjZS1zZXBhcmF0ZWQtdG9rZW5zXFxpbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCdcblxuZXhwb3J0cy5wYXJzZSA9IHBhcnNlXG5leHBvcnRzLnN0cmluZ2lmeSA9IHN0cmluZ2lmeVxuXG52YXIgZW1wdHkgPSAnJ1xudmFyIHNwYWNlID0gJyAnXG52YXIgd2hpdGVTcGFjZSA9IC9bIFxcdFxcblxcclxcZl0rL2dcblxuZnVuY3Rpb24gcGFyc2UodmFsdWUpIHtcbiAgdmFyIGlucHV0ID0gU3RyaW5nKHZhbHVlIHx8IGVtcHR5KS50cmltKClcbiAgcmV0dXJuIGlucHV0ID09PSBlbXB0eSA/IFtdIDogaW5wdXQuc3BsaXQod2hpdGVTcGFjZSlcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KHZhbHVlcykge1xuICByZXR1cm4gdmFsdWVzLmpvaW4oc3BhY2UpLnRyaW0oKVxufVxuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/space-separated-tokens/index.js\n");

/***/ })

};
;