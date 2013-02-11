var config = {
  filename: __filename
  , ns: 'select2'
	, scripts: {
		select2: require('./select2')
	}
};

module.exports = select2;
select2.decorate = 'derby';

function select2(derby, options) {
  derby.createLibrary(config, options);
  return this;
}