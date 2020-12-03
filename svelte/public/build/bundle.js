
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.30.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const view = writable('Main');

    /* src/Login.svelte generated by Svelte v3.30.0 */
    const file = "src/Login.svelte";

    function create_fragment(ctx) {
    	let div0;
    	let button0;
    	let i;
    	let t0;
    	let div2;
    	let div1;
    	let input0;
    	let t1;
    	let input1;
    	let t2;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			button0 = element("button");
    			i = element("i");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			input0 = element("input");
    			t1 = space();
    			input1 = element("input");
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "Enter";
    			attr_dev(i, "class", "fas fa-caret-left");
    			add_location(i, file, 17, 44, 274);
    			attr_dev(button0, "class", "bck svelte-1yrgawz");
    			add_location(button0, file, 17, 4, 234);
    			attr_dev(div0, "class", "Back svelte-1yrgawz");
    			add_location(div0, file, 16, 0, 211);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "placeholder", "Email");
    			attr_dev(input0, "class", "svelte-1yrgawz");
    			add_location(input0, file, 22, 16, 406);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "class", "svelte-1yrgawz");
    			add_location(input1, file, 23, 16, 463);
    			attr_dev(div1, "class", "inputs svelte-1yrgawz");
    			add_location(div1, file, 21, 12, 369);
    			attr_dev(button1, "class", "entrar svelte-1yrgawz");
    			add_location(button1, file, 26, 16, 546);
    			attr_dev(div2, "class", "login-content svelte-1yrgawz");
    			add_location(div2, file, 20, 4, 329);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button0);
    			append_dev(button0, i);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, input0);
    			append_dev(div1, t1);
    			append_dev(div1, input1);
    			append_dev(div2, t2);
    			append_dev(div2, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*goToMain*/ ctx[0], false, false, false),
    					listen_dev(button1, "click", /*goToContent*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $view;
    	validate_store(view, "view");
    	component_subscribe($$self, view, $$value => $$invalidate(2, $view = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Login", slots, []);

    	function goToMain() {
    		set_store_value(view, $view = "Main", $view);
    	}

    	function goToContent() {
    		set_store_value(view, $view = "Content", $view);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ view, goToMain, goToContent, $view });
    	return [goToMain, goToContent];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Main.svelte generated by Svelte v3.30.0 */
    const file$1 = "src/Main.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let button0;
    	let t2;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "LOGIN";
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "SIGN UP";
    			attr_dev(img, "class", "Logo svelte-1rf8qfb");
    			if (img.src !== (img_src_value = "/img/EL-PADRINO-solo-LOGO-blanco.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$1, 19, 8, 291);
    			attr_dev(div0, "class", "El_Padrino_Logo");
    			add_location(div0, file$1, 18, 4, 253);
    			attr_dev(button0, "class", "svelte-1rf8qfb");
    			add_location(button0, file$1, 23, 12, 416);
    			attr_dev(button1, "class", "svelte-1rf8qfb");
    			add_location(button1, file$1, 24, 12, 472);
    			attr_dev(div1, "class", "Buttons svelte-1rf8qfb");
    			add_location(div1, file$1, 22, 8, 382);
    			attr_dev(div2, "class", "Content svelte-1rf8qfb");
    			add_location(div2, file$1, 17, 0, 227);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t2);
    			append_dev(div1, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*goToLogin*/ ctx[0], false, false, false),
    					listen_dev(button1, "click", /*goToSignUp*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $view;
    	validate_store(view, "view");
    	component_subscribe($$self, view, $$value => $$invalidate(2, $view = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Main", slots, []);

    	function goToLogin() {
    		set_store_value(view, $view = "Login", $view);
    	}

    	function goToSignUp() {
    		set_store_value(view, $view = "SignUp", $view);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ view, goToLogin, goToSignUp, $view });
    	return [goToLogin, goToSignUp];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/SignUp.svelte generated by Svelte v3.30.0 */
    const file$2 = "src/SignUp.svelte";

    function create_fragment$2(ctx) {
    	let div0;
    	let button0;
    	let i;
    	let t0;
    	let div2;
    	let div1;
    	let input0;
    	let t1;
    	let input1;
    	let t2;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			button0 = element("button");
    			i = element("i");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			input0 = element("input");
    			t1 = space();
    			input1 = element("input");
    			t2 = space();
    			button1 = element("button");
    			button1.textContent = "Sign Up";
    			attr_dev(i, "class", "fas fa-caret-left");
    			add_location(i, file$2, 17, 44, 264);
    			attr_dev(button0, "class", "bck svelte-8hh6ul");
    			add_location(button0, file$2, 17, 4, 224);
    			attr_dev(div0, "class", "Back svelte-8hh6ul");
    			add_location(div0, file$2, 16, 0, 201);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "placeholder", "Email");
    			attr_dev(input0, "class", "svelte-8hh6ul");
    			add_location(input0, file$2, 22, 12, 387);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "class", "svelte-8hh6ul");
    			add_location(input1, file$2, 23, 12, 440);
    			attr_dev(div1, "class", "inputs svelte-8hh6ul");
    			add_location(div1, file$2, 21, 8, 354);
    			attr_dev(button1, "class", "signup svelte-8hh6ul");
    			add_location(button1, file$2, 26, 12, 515);
    			attr_dev(div2, "class", "sign-content svelte-8hh6ul");
    			add_location(div2, file$2, 20, 4, 319);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button0);
    			append_dev(button0, i);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, input0);
    			append_dev(div1, t1);
    			append_dev(div1, input1);
    			append_dev(div2, t2);
    			append_dev(div2, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*goToMain*/ ctx[0], false, false, false),
    					listen_dev(button1, "click", /*goToContent*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $view;
    	validate_store(view, "view");
    	component_subscribe($$self, view, $$value => $$invalidate(2, $view = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SignUp", slots, []);

    	function goToMain() {
    		set_store_value(view, $view = "Main", $view);
    	}

    	function goToContent() {
    		set_store_value(view, $view = "Content", $view);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SignUp> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ view, goToMain, goToContent, $view });
    	return [goToMain, goToContent];
    }

    class SignUp extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SignUp",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Offer.svelte generated by Svelte v3.30.0 */

    const file$3 = "src/Offer.svelte";

    function create_fragment$3(ctx) {
    	let section;
    	let ol0;
    	let li0;
    	let div0;
    	let a0;
    	let t1;
    	let a1;
    	let t3;
    	let li1;
    	let div1;
    	let t4;
    	let a2;
    	let t6;
    	let a3;
    	let t8;
    	let li2;
    	let div2;
    	let t9;
    	let a4;
    	let t11;
    	let a5;
    	let t13;
    	let li3;
    	let div3;
    	let t14;
    	let a6;
    	let t16;
    	let a7;
    	let t18;
    	let aside;
    	let ol1;
    	let li4;
    	let a8;
    	let t20;
    	let li5;
    	let a9;
    	let t22;
    	let li6;
    	let a10;
    	let t24;
    	let li7;
    	let a11;

    	const block = {
    		c: function create() {
    			section = element("section");
    			ol0 = element("ol");
    			li0 = element("li");
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "Go to last slide";
    			t1 = space();
    			a1 = element("a");
    			a1.textContent = "Go to next slide";
    			t3 = space();
    			li1 = element("li");
    			div1 = element("div");
    			t4 = space();
    			a2 = element("a");
    			a2.textContent = "Go to previous slide";
    			t6 = space();
    			a3 = element("a");
    			a3.textContent = "Go to next slide";
    			t8 = space();
    			li2 = element("li");
    			div2 = element("div");
    			t9 = space();
    			a4 = element("a");
    			a4.textContent = "Go to previous slide";
    			t11 = space();
    			a5 = element("a");
    			a5.textContent = "Go to next slide";
    			t13 = space();
    			li3 = element("li");
    			div3 = element("div");
    			t14 = space();
    			a6 = element("a");
    			a6.textContent = "Go to previous slide";
    			t16 = space();
    			a7 = element("a");
    			a7.textContent = "Go to first slide";
    			t18 = space();
    			aside = element("aside");
    			ol1 = element("ol");
    			li4 = element("li");
    			a8 = element("a");
    			a8.textContent = "Go to slide 1";
    			t20 = space();
    			li5 = element("li");
    			a9 = element("a");
    			a9.textContent = "Go to slide 2";
    			t22 = space();
    			li6 = element("li");
    			a10 = element("a");
    			a10.textContent = "Go to slide 3";
    			t24 = space();
    			li7 = element("li");
    			a11 = element("a");
    			a11.textContent = "Go to slide 4";
    			attr_dev(a0, "href", "#carousel__slide4");
    			attr_dev(a0, "class", "carousel__prev svelte-11i10jb");
    			add_location(a0, file$3, 21, 8, 456);
    			attr_dev(a1, "href", "#carousel__slide2");
    			attr_dev(a1, "class", "carousel__next svelte-11i10jb");
    			add_location(a1, file$3, 23, 8, 547);
    			attr_dev(div0, "class", "carousel__snapper svelte-11i10jb");
    			add_location(div0, file$3, 20, 6, 416);
    			attr_dev(li0, "id", "carousel__slide1");
    			attr_dev(li0, "tabindex", "0");
    			attr_dev(li0, "class", "carousel__slide svelte-11i10jb");
    			add_location(li0, file$3, 17, 4, 330);
    			attr_dev(div1, "class", "carousel__snapper svelte-11i10jb");
    			add_location(div1, file$3, 30, 6, 743);
    			attr_dev(a2, "href", "#carousel__slide1");
    			attr_dev(a2, "class", "carousel__prev svelte-11i10jb");
    			add_location(a2, file$3, 31, 6, 787);
    			attr_dev(a3, "href", "#carousel__slide3");
    			attr_dev(a3, "class", "carousel__next svelte-11i10jb");
    			add_location(a3, file$3, 33, 6, 878);
    			attr_dev(li1, "id", "carousel__slide2");
    			attr_dev(li1, "tabindex", "0");
    			attr_dev(li1, "class", "carousel__slide svelte-11i10jb");
    			add_location(li1, file$3, 27, 4, 657);
    			attr_dev(div2, "class", "carousel__snapper svelte-11i10jb");
    			add_location(div2, file$3, 39, 6, 1059);
    			attr_dev(a4, "href", "#carousel__slide2");
    			attr_dev(a4, "class", "carousel__prev svelte-11i10jb");
    			add_location(a4, file$3, 40, 6, 1103);
    			attr_dev(a5, "href", "#carousel__slide4");
    			attr_dev(a5, "class", "carousel__next svelte-11i10jb");
    			add_location(a5, file$3, 42, 6, 1194);
    			attr_dev(li2, "id", "carousel__slide3");
    			attr_dev(li2, "tabindex", "0");
    			attr_dev(li2, "class", "carousel__slide svelte-11i10jb");
    			add_location(li2, file$3, 36, 4, 973);
    			attr_dev(div3, "class", "carousel__snapper svelte-11i10jb");
    			add_location(div3, file$3, 48, 6, 1375);
    			attr_dev(a6, "href", "#carousel__slide3");
    			attr_dev(a6, "class", "carousel__prev svelte-11i10jb");
    			add_location(a6, file$3, 49, 6, 1419);
    			attr_dev(a7, "href", "#carousel__slide1");
    			attr_dev(a7, "class", "carousel__next svelte-11i10jb");
    			add_location(a7, file$3, 51, 6, 1510);
    			attr_dev(li3, "id", "carousel__slide4");
    			attr_dev(li3, "tabindex", "0");
    			attr_dev(li3, "class", "carousel__slide svelte-11i10jb");
    			add_location(li3, file$3, 45, 4, 1289);
    			attr_dev(ol0, "class", "carousel__viewport svelte-11i10jb");
    			add_location(ol0, file$3, 16, 2, 294);
    			attr_dev(a8, "href", "#carousel__slide1");
    			attr_dev(a8, "class", "carousel__navigation-button svelte-11i10jb");
    			add_location(a8, file$3, 58, 8, 1745);
    			attr_dev(li4, "class", "carousel__navigation-item svelte-11i10jb");
    			add_location(li4, file$3, 57, 6, 1698);
    			attr_dev(a9, "href", "#carousel__slide2");
    			attr_dev(a9, "class", "carousel__navigation-button svelte-11i10jb");
    			add_location(a9, file$3, 62, 8, 1903);
    			attr_dev(li5, "class", "carousel__navigation-item svelte-11i10jb");
    			add_location(li5, file$3, 61, 6, 1856);
    			attr_dev(a10, "href", "#carousel__slide3");
    			attr_dev(a10, "class", "carousel__navigation-button svelte-11i10jb");
    			add_location(a10, file$3, 66, 8, 2061);
    			attr_dev(li6, "class", "carousel__navigation-item svelte-11i10jb");
    			add_location(li6, file$3, 65, 6, 2014);
    			attr_dev(a11, "href", "#carousel__slide4");
    			attr_dev(a11, "class", "carousel__navigation-button svelte-11i10jb");
    			add_location(a11, file$3, 70, 8, 2219);
    			attr_dev(li7, "class", "carousel__navigation-item svelte-11i10jb");
    			add_location(li7, file$3, 69, 6, 2172);
    			attr_dev(ol1, "class", "carousel__navigation-list svelte-11i10jb");
    			add_location(ol1, file$3, 56, 4, 1653);
    			attr_dev(aside, "class", "carousel__navigation svelte-11i10jb");
    			add_location(aside, file$3, 55, 2, 1612);
    			attr_dev(section, "class", "carousel svelte-11i10jb");
    			attr_dev(section, "aria-label", "Gallery");
    			add_location(section, file$3, 15, 0, 244);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, ol0);
    			append_dev(ol0, li0);
    			append_dev(li0, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t1);
    			append_dev(div0, a1);
    			append_dev(ol0, t3);
    			append_dev(ol0, li1);
    			append_dev(li1, div1);
    			append_dev(li1, t4);
    			append_dev(li1, a2);
    			append_dev(li1, t6);
    			append_dev(li1, a3);
    			append_dev(ol0, t8);
    			append_dev(ol0, li2);
    			append_dev(li2, div2);
    			append_dev(li2, t9);
    			append_dev(li2, a4);
    			append_dev(li2, t11);
    			append_dev(li2, a5);
    			append_dev(ol0, t13);
    			append_dev(ol0, li3);
    			append_dev(li3, div3);
    			append_dev(li3, t14);
    			append_dev(li3, a6);
    			append_dev(li3, t16);
    			append_dev(li3, a7);
    			append_dev(section, t18);
    			append_dev(section, aside);
    			append_dev(aside, ol1);
    			append_dev(ol1, li4);
    			append_dev(li4, a8);
    			append_dev(ol1, t20);
    			append_dev(ol1, li5);
    			append_dev(li5, a9);
    			append_dev(ol1, t22);
    			append_dev(ol1, li6);
    			append_dev(li6, a10);
    			append_dev(ol1, t24);
    			append_dev(ol1, li7);
    			append_dev(li7, a11);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Offer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Offer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Offer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Offer",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Products.svelte generated by Svelte v3.30.0 */

    const file$4 = "src/Products.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (26:4) {#each products as product (product.id)}
    function create_each_block(key_1, ctx) {
    	let div2;
    	let div1;
    	let h1;
    	let t0_value = /*product*/ ctx[5].name + "";
    	let t0;
    	let t1;
    	let div0;
    	let span0;
    	let i0;
    	let t2;
    	let span1;
    	let t3_value = /*product*/ ctx[5].count + "";
    	let t3;
    	let t4;
    	let span2;
    	let i1;
    	let t5;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*product*/ ctx[5]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[4](/*product*/ ctx[5]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			span0 = element("span");
    			i0 = element("i");
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			span2 = element("span");
    			i1 = element("i");
    			t5 = space();
    			add_location(h1, file$4, 29, 24, 697);
    			attr_dev(i0, "class", "fas fa-plus-circle");
    			add_location(i0, file$4, 31, 87, 856);
    			attr_dev(span0, "class", "plus");
    			add_location(span0, file$4, 31, 32, 801);
    			add_location(span1, file$4, 32, 32, 930);
    			attr_dev(i1, "class", "fas fa-minus-circle");
    			add_location(i1, file$4, 33, 89, 1048);
    			attr_dev(span2, "class", "minus");
    			add_location(span2, file$4, 33, 32, 991);
    			attr_dev(div0, "class", "count svelte-1ji1wp8");
    			add_location(div0, file$4, 30, 28, 749);
    			attr_dev(div1, "class", "product-card");
    			add_location(div1, file$4, 27, 16, 588);
    			attr_dev(div2, "class", "section-product svelte-1ji1wp8");
    			add_location(div2, file$4, 26, 8, 542);
    			this.first = div2;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(span0, i0);
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			append_dev(span1, t3);
    			append_dev(div0, t4);
    			append_dev(div0, span2);
    			append_dev(span2, i1);
    			append_dev(div2, t5);

    			if (!mounted) {
    				dispose = [
    					listen_dev(span0, "click", click_handler, false, false, false),
    					listen_dev(span2, "click", click_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*products*/ 1 && t0_value !== (t0_value = /*product*/ ctx[5].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*products*/ 1 && t3_value !== (t3_value = /*product*/ ctx[5].count + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(26:4) {#each products as product (product.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*products*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*product*/ ctx[5].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "content-products svelte-1ji1wp8");
    			add_location(div, file$4, 24, 0, 458);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*minusCount, products, plusCount*/ 7) {
    				const each_value = /*products*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Products", slots, []);

    	var products = [
    		{ id: 1, name: "Pan Francés", count: 0 },
    		{ id: 2, name: "Canillas", count: 0 },
    		{ id: 3, name: "Piñitas Saladas", count: 0 },
    		{ id: 4, name: "Bombas Saladas", count: 0 },
    		{ id: 5, name: "Golfeados", count: 0 }
    	];

    	function plusCount(product) {
    		product.count += 1;
    		$$invalidate(0, products);
    	}

    	function minusCount(product) {
    		product.count -= 1;

    		if (product.count < 0) {
    			product.count = 0;
    		}

    		$$invalidate(0, products);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Products> was created with unknown prop '${key}'`);
    	});

    	const click_handler = product => {
    		plusCount(product);
    	};

    	const click_handler_1 = product => {
    		minusCount(product);
    	};

    	$$self.$capture_state = () => ({ products, plusCount, minusCount });

    	$$self.$inject_state = $$props => {
    		if ("products" in $$props) $$invalidate(0, products = $$props.products);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [products, plusCount, minusCount, click_handler, click_handler_1];
    }

    class Products extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Products",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Content.svelte generated by Svelte v3.30.0 */
    const file$5 = "src/Content.svelte";

    function create_fragment$5(ctx) {
    	let nav;
    	let span;
    	let i;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let offer;
    	let t2;
    	let products;
    	let current;
    	offer = new Offer({ $$inline: true });
    	products = new Products({ $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			span = element("span");
    			i = element("i");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			create_component(offer.$$.fragment);
    			t2 = space();
    			create_component(products.$$.fragment);
    			attr_dev(i, "class", "fas fa-ellipsis-h");
    			set_style(i, "margin-top", "30px");
    			add_location(i, file$5, 8, 8, 137);
    			attr_dev(span, "class", "Menu svelte-wuezbq");
    			add_location(span, file$5, 7, 4, 109);
    			attr_dev(img, "class", "Logo svelte-wuezbq");
    			if (img.src !== (img_src_value = "/img/Logo.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$5, 10, 0, 209);
    			attr_dev(nav, "class", "svelte-wuezbq");
    			add_location(nav, file$5, 6, 0, 99);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, span);
    			append_dev(span, i);
    			append_dev(nav, t0);
    			append_dev(nav, img);
    			insert_dev(target, t1, anchor);
    			mount_component(offer, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(products, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(offer.$$.fragment, local);
    			transition_in(products.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(offer.$$.fragment, local);
    			transition_out(products.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t1);
    			destroy_component(offer, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(products, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Content", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Offer, Products });
    	return [];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.30.0 */
    const file$6 = "src/App.svelte";

    // (22:1) {#if $view == 'Main'}
    function create_if_block_3(ctx) {
    	let main;
    	let current;
    	main = new Main({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(main.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(main, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(main.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(main.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(main, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(22:1) {#if $view == 'Main'}",
    		ctx
    	});

    	return block;
    }

    // (26:1) {#if $view == 'Login'}
    function create_if_block_2(ctx) {
    	let login;
    	let current;
    	login = new Login({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(26:1) {#if $view == 'Login'}",
    		ctx
    	});

    	return block;
    }

    // (30:1) {#if $view == 'SignUp'}
    function create_if_block_1(ctx) {
    	let signup;
    	let current;
    	signup = new SignUp({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(signup.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(signup, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(signup.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(signup.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(signup, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(30:1) {#if $view == 'SignUp'}",
    		ctx
    	});

    	return block;
    }

    // (34:1) {#if $view == 'Content'}
    function create_if_block(ctx) {
    	let content;
    	let current;
    	content = new Content({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(content.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(content, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(content, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(34:1) {#if $view == 'Content'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let link0;
    	let link1;
    	let link2;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let if_block3_anchor;
    	let current;
    	let if_block0 = /*$view*/ ctx[0] == "Main" && create_if_block_3(ctx);
    	let if_block1 = /*$view*/ ctx[0] == "Login" && create_if_block_2(ctx);
    	let if_block2 = /*$view*/ ctx[0] == "SignUp" && create_if_block_1(ctx);
    	let if_block3 = /*$view*/ ctx[0] == "Content" && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			link2 = element("link");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    			attr_dev(link0, "rel", "preconnect");
    			attr_dev(link0, "href", "https://fonts.gstatic.com");
    			add_location(link0, file$6, 14, 4, 233);
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap");
    			attr_dev(link1, "rel", "stylesheet");
    			add_location(link1, file$6, 15, 1, 291);
    			attr_dev(link2, "rel", "stylesheet");
    			attr_dev(link2, "href", "https://use.fontawesome.com/releases/v5.14.0/css/all.css");
    			attr_dev(link2, "integrity", "sha384-HzLeBuhoNPvSl5KYnjx0BT+WB0QEEqLprO+NBkkk5gbc67FTaL7XIGa2w1L0Xbgc");
    			attr_dev(link2, "crossorigin", "anonymous");
    			add_location(link2, file$6, 18, 1, 424);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			append_dev(document.head, link2);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, if_block3_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$view*/ ctx[0] == "Main") {
    				if (if_block0) {
    					if (dirty & /*$view*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t1.parentNode, t1);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$view*/ ctx[0] == "Login") {
    				if (if_block1) {
    					if (dirty & /*$view*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t2.parentNode, t2);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*$view*/ ctx[0] == "SignUp") {
    				if (if_block2) {
    					if (dirty & /*$view*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t3.parentNode, t3);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*$view*/ ctx[0] == "Content") {
    				if (if_block3) {
    					if (dirty & /*$view*/ 1) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			detach_dev(link2);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(if_block3_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $view;
    	validate_store(view, "view");
    	component_subscribe($$self, view, $$value => $$invalidate(0, $view = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Login,
    		Main,
    		SignUp,
    		Content,
    		view,
    		$view
    	});

    	return [$view];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
