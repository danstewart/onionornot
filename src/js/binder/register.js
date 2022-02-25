import { pascalToKebab } from './util.js';

/**
 * 
 * @param {Class} cls The controller class to register
 * @param {string} name [Optional] The tag name to use for the controller (default will be the class name converted to kebab-case)
 * @param {object} opts [Optional] Options to pass to window.customElements.define
 */
const registerController = (cls, { name = null } = {}) => {
    const controllerName = cls.name;
    const controllerTag = name ? name : pascalToKebab(controllerName.replace("Controller", ""));

    if (!controllerTag.includes("-")) {
        console.error(`[${controllerName}] Controller tag name must contain a hyphen but got <${controllerTag}>`);
    }

    // If our controller has a __tag__ property then it
    // extends that tag
    let opts = {};
    if (cls.__extendTag__) opts.extends = cls.__extendTag__;

    window.customElements.define(controllerTag, cls, opts);
};

/**
 * Register a controller (or multiple controllers)
 * 
 * Example
 * ```js
 * registerControllers(MyController, MyOtherController);
 * ```
 * 
 * ```js
 * registerControllers(
 *  [ MyController ],
 *  [ MyOtherController, { name: "my-custom-controller" } ],
 * )
 * ```
 * @param  {...any} controllers 
 */
const registerControllers = (...controllers) => {
    // The reason we must register all controllers together is because we set the `data-controller` attribute during registration
    // and we use this to check which controller a given DOM element belongs to (See `belongsToController`)

    let controllerRegistry = [];

    for (let controller of controllers) {
        let config = {};
        if (Array.isArray(controller)) {
            [controller, config={}] = controller;
        }

        const controllerName = controller.name;
        const controllerTag = config && config.name ? config.name : pascalToKebab(controllerName.replace("Controller", ""));
        document.querySelectorAll(controllerTag).forEach(el => el.setAttribute("data-controller", controllerTag.toLowerCase()));

        controllerRegistry.push([ controller, config ]);
    }

    for (let [controller, config] of controllerRegistry) {
        registerController(controller, config);
    }
};

export {
    registerControllers,
};
