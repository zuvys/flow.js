;
(function(g, fn) {
    'use strict'
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = fn()
        return
    }

    if (typeof define === 'function' && define.amd) {
        define([], fn)
        return
    }

    g.Flow = fn()
}(typeof window === 'object' ? window : this, function() {
    'use strict'

    var nextTick = typeof setImmediate === 'function' ? setImmediate : function(fn) {
        setTimeout(fn, 0)
    }

    function toArray(args, start, end) {
        start = start || 0
        end = end || args.length - 1
        if (end < start) return []
        var ret = new Array(end - start + 1)
        while (end >= start) ret[end - start] = args[end--]
        return ret
    }

    function combineErrorHandler(e1, e2) {
        return !e1 ? e2 : function(e) {
            e1(e)
            e2(e)
        }
    }

    function _for(array, fn, cont, error, v, ret) {
        var i = 0
        var len = array.length

        function next(retV) {
            if (--len < 0)
                typeof retV !== 'undefined' ? cont(retV) : cont()
            else
                typeof retV !== 'undefined' ? fn(next, array[i], i++, retV, error) : fn(next, array[i], i++, error)
        }

        v ? next(ret) : next()
    }

    function forAsync(array, fn, cont, error, v, ret) {
        var len = array.length

        function next() {
            if (--len === 0) v ? cont(ret) : cont()
        }

        var i = 0
        while (i < array.length)
            v ? fn(next, array[i], i++, ret, error) : fn(next, array[i], i++, error)
    }

    function createFlowItem() {
        if (!arguments || !arguments.length) return null
        return FlowItem.apply(null, arguments)
    }

    function FlowItem(fn, error) {
        if (!fn) return null
        if (!(this instanceof FlowItem)) return new FlowItem(fn, error)
        this._fn = fn
        this._error = typeof error !== 'function' ? null : error
        return this
    }

    function Flow(fn, error) {
        if (!(this instanceof Flow)) return new Flow(fn, error)
        this._items = []
        return this.then.apply(this, arguments)
    }

    Flow.prototype.then = function(fn, error) {
        if (fn instanceof Array) {
            return Flow.prototype.for.apply(this, [fn,
                function(cont, fn, i, arg3, arg4) {
                    typeof arg4 === 'function' ? fn(arg3, cont, arg4) : fn(cont, arg3)
                },
                arguments[1]
            ])
        }

        var item = createFlowItem.apply(null, arguments)
        if (item) this._items.push(item)
        return this
    }

    //ͬ��ѭ��,��һ��Ԫ�ؽ��յ�������һ�����񴫵ݵ�ֵ �ڶ���Ԫ�ؽ��յ����ǵ�һ��Ԫ�ش��ݵ�ֵ
    Flow.prototype.for = function(array, fn) {
        var item = createFlowItem.apply(null, [
            function(arg1, arg2, arg3) {
                _for(array || [], fn, arg3 ? arg2 : arg1, arg3 ? arg3 : arg2, !!arg3, arg1)
            },
            toArray(arguments).splice(2, 1)
        ]);

        if (item) this._items.push(item)
        return this
    }

    //����ѭ��,ѭ�������д����м�ֵ��һ�������ֵ ѭ����ɺ�,��������һ�����񴫵�����ֵ����һ��������
    Flow.prototype.forAsync = function(array, fn) {
        var item = createFlowItem.apply(null, [
            function(arg1, arg2, arg3) {
                forAsync(array || [], fn, arg3 ? arg2 : arg1, arg3 ? arg3 : arg2, !!arg3, arg1)
            },
            toArray(arguments).splice(2, 1)
        ])

        if (item) this._items.push(item)
        return this
    }

    Flow.prototype.async = function(array) {
        return Flow.prototype.forAsync.apply(this, [array,
            function(cont, fn, i, arg3, arg4) {
                typeof arg4 === 'function' ? fn(arg3, cont, arg4) : fn(cont, arg3)
            },
            arguments[1]
        ])
    }

    Flow.prototype.fail = function(error) {
        var len = this._items.length
        while (--len >= 0)
            this._items[len]._error = combineErrorHandler(this._items[len]._error, error)
        return this
    }

    Flow.prototype.start = function() {
        var self = this
        nextTick(function() {
            self._started || (self._started = true, self._start())
        })
    }

    Flow.prototype._start = function() {
        this._current = this._items.shift()
        this._started = !!this._items.length
        this._current && this._current._fn && this._current._fn.apply(null, toArray(arguments).splice(0, 1).concat([this._start.bind(this), this._current._error || function() {}]))
    }

    Flow.for = function() {
        return Flow.prototype.for.apply(Flow.run(), arguments)
    }

    Flow.forAsync = function() {
        return Flow.prototype.forAsync.apply(Flow.run(), arguments)
    }

    Flow.async = function() {
        return Flow.prototype.async.apply(Flow.run(), arguments)
    }

    Flow.then = function() {
        return Flow.prototype.then.apply(Flow.run(), arguments)
    }

    Flow.Version = '0.0.1'
    return Flow
}));