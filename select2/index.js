var _ = require('underscore')
  , _s = require('underscore.string');

exports.create = function (model, dom) {
  if (typeof $ === 'undefined') {
    return console.log('jQuery required to run select2');
  }

  if (typeof $.fn.select2 === 'undefined') {
    return console.log('select2.jquery.js required to run select2')
  }

  var self = this
    , defaults = model.get('defaults') || {}
    , optfns = [
        'changefn'
      , 'containercssfn'
      , 'containercssclassfn'
      , 'createsearchchoicefn'
      , 'dropdowncssfn'
      , 'dropdowncssclassfn'
      , 'escapemarkupfn'
      , 'formatinputtooshortfn'
      , 'formatnomatchesfn'
      , 'formatresultfn'
      , 'formatresultcssfn'
      , 'formatresultcssclassfn'
      , 'formatsearchingfn'
      , 'formatselectionfn'
      , 'formatselectiontoobigfn'
      , 'idfn'
      , 'initselectionfn'
      , 'matcherfn'
      , 'maximumselectionsizefn'
      , 'queryfn'
      , 'sortresultsfn'
      , 'tokenizerfn'
    ]
    , opts = [
        'ajax'
      , 'allowclear'
      , 'close'
      , 'closeonselect'
      , 'container'
      , 'containercss'
      , 'containercssclass'
      , 'data'
      , 'dataval'
      , 'destroy'
      , 'disable'
      , 'dropdowncss'
      , 'dropdowncssclass'
      , 'enable'
      , 'inputtype'
      , 'loadmorepadding'
      , 'maximuminputlength'
      , 'maximumselectionsize'
      , 'minimuminputlength'
      , 'minimumresultsforsearch'
      , 'multiple'
      , 'onsortend'
      , 'onsortstart'
      , 'open'
      , 'openonenter'
      , 'openonselect'
      , 'placeholder'
      , 'selectonblur'
      , 'separator'
      , 'tags'
      , 'tokenseparators'
      , 'width'
      , 'val'
    ].concat(optfns);

  function unrecognized(param) {
    if (!_.contains(opts)) {
      console.log('unrecognized parameter "' + key + '"');
    }
  }

  _.keys(model.get(), unrecognized);
  _.keys(defaults, unrecognized);

  // convert option values to scoped models
  opts = _.object(opts, _.map(opts, function (opt) { return model.at(opt); }));

  // set option defaults
  _.each(_.keys(defaults), function (key) {
    var val = defaults[key];
    if (typeof val === 'undefined') return;
    if (!opts[key]) return;
    if (typeof opts[key].get() !== 'undefined') return;
    if (_.isFunction(val)) return (opts[key] = val);
    opts[key].set(val);
  });
  
  // resolve function option names to their actual functions
  _.each(optfns, function (optfn) {
    if (_.isFunction(opts[optfn])) return;

    var name = opts[optfn].get()
      , nofn = function () { return ''; };

    opts[optfn] = undefined;
    if (typeof name === 'undefined') return;
    if (_s.isBlank(name)) return (opts[optfn] = nofn);
    if (DERBY.app[name]) return (opts[optfn] = DERBY.app[name]);
    console.log('cannot find function "' + name + '"');
  });

  // infer input type if it is not specified
  if (typeof opts.inputtype.get() === 'undefined') {
    var requireHidden = 
      opts.ajax.get() ||
      opts.data.get() ||
      opts.queryfn;
    opts.inputtype.set(requireHidden ? 'hidden' : 'select');
  }

  var isHidden = opts.inputtype.get() === 'hidden'
    , el = dom.element(isHidden ? 'input' : 'select');

  if (typeof opts.multiple.get() === 'undefined') {
    if (opts.closeonselect.get()) opts.multiple.set(true);
  }

  var params = {
      ajax: opts.ajax.get()
    , allowClear: opts.allowclear.get()
    , containerCss: opts.contaienrcssfn || opts.containercss.get()
    , containerCssClass: opts.containercssclassfn || opts.containercssclass.get()
    , data: opts.data.get()
    , dropdownCss: opts.dropdowncssfn || opts.dropdowncss.get()
    , dropdownCssClass: opts.dropdowncssclassfn || opts.dropdowncssclass.get()
    , escapeMarkup: opts.escapemarkupfn
    , formatInputTooShort: opts.formatinputtooshortfn
    , formatNoMatches: opts.formatnotmatchesfn
    , formatResult: opts.formatresultfn
    , formatResultCss: opts.formatresultcssfn
    , formatResultCssClass: opts.formatresultcssclassfn
    , formatSearching: opts.formatsearchingfn
    , formatSelection: opts.formatselectionfn
    , formatSelectionTooBig: opts.formatselectiontoobigfn
    , id: opts.idfn
    , initSelection: opts.initselectionfn
    , maximumInputLength: opts.maximuminputlength.get()
    , maximumSelectionSize: opts.maximumselectionsizefn || opts.maximumselectionsize.get()
    , minimumInputLength: opts.minimuminputlength.get()
    , minimumResultsForSearch: opts.minimumresultsforsearch.get()
    , matcher: opts.matcherfn
    , multiple: isHidden ? opts.multiple.get() : undefined
    , openOnEnter: opts.openonenter.get()
    , openOnSelect: opts.openonselect.get()
    , placeholder: opts.placeholder.get()
    , query: opts.queryfn
    , separator: opts.separator.get()
    , selectOnBlur: opts.selectonblur.get()
    , sortResults: opts.sortresultsfn
    , tags: opts.tags.get()
    , tokenizer: opts.tokenizerfn
    , tokenSeparators: opts.tokenseparators.get()
    , width: opts.width.get()
  };

  $(function () {
    var datavalSet = valSet = false;

    el = $(el).select2(params);
    opts.container.set(el.select2('container'));

    el.on('change', function (e) {
      datavalSet = valSet = true;
      opts.val.set(el.select2('val'));
      opts.dataval.set(el.select2('data'));
      self.emit('change', e);
    });

    el.on('open', function () {
      self.emit('open'); 
    });

    opts.close.on('set', function (close) {
      el.select2(close ? 'close' : 'open');
    });

    opts.dataval.on('set', function (val) {
      if (!datavalSet) el.select2('data', val);
      datavalSet = false;
    });

    opts.destroy.on('set', function (destroy) {
      if (destroy) el.select2('destroy');
    });

    opts.disable.on('set', function (disable) {
      el.select2(disable ? 'disable' : 'enable');
    });

    opts.enable.on('set', function (enable) {
      el.select2(enable ? 'enable' : 'disable');
    });

    opts.onsortstart.on('set', function (onSortStart) {
      if (onSortEnd) el.select2('onSortEnd');
    });

    opts.onsortstart.on('set', function (onsortstart) {
      if (onSortStart) el.select2('onSortStart');
    });

    opts.open.on('set', function (open) {
      el.select2(open ? 'open' : 'close');
    });

    opts.val.on('set', function (val) {
      if (!valSet) el.select2('val', val);
      valSet = false;
    });
  });
}