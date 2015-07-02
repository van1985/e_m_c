/**
 * Application filters
 */
angular.module('appFilters', [
	'ngSanitize'
])

/**
 * Enables/disables filter options based on selected providers.
 *
 * @return {array} Updated filter object.
 */
.filter('toggleOptions', [function() {
	return function($scope, action, filter_id) {
		var filters           = $scope.data.filters;
		var selected          = $scope.data.selected;
		var providers         = $scope.data.filtered.main;
		var this_filter       = {};
		var selected_siblings = {};
		var siblings          = [];

		if ( _.isUndefined(action) ) {
			return filters;
		}

		var doToggleOptions = function(filter, filter_option, cascade_index) {
			var prvdr_fltr;
			var option_disabled = true;

			_(providers).forEach(function(provider, provider_index) {
				if (provider.hide && !provider.use_filters) {
					return;
				}

				if ( _.isNull(filter.parent) ) {
					if (filter.has_children) {
						prvdr_fltr = _.keys(provider.filters[filter.id]);
					} else {
						prvdr_fltr = provider.filters[filter.id];
					}

					if ( _.contains(['select', 'checkbox'], filter.form_type) ) {
						if ( _.contains(prvdr_fltr, filter_option[filter.id][0]) ) {
							option_disabled = false;
							return false;
						} else {
							option_disabled = true;
						}
					} else if ( _.contains(['select_cascade'], filter.form_type) ) {
						if ( _.contains(
							prvdr_fltr[cascade_index], filter_option[filter.id][cascade_index][0]
							) ) {
							option_disabled = false;
							return false;
						} else {
							option_disabled = true;
						}
					}
				} else {
					if ( _.isUndefined(selected.filters[filter.parent]) ) {
						option_disabled = false;
						return false;
					}

					prvdr_fltr = provider.filters[filter.parent][selected.filters[filter.parent][0]];
					if ( _.isEmpty( _.where(prvdr_fltr, filter_option) ) ) {
						option_disabled = true;
					} else {
						option_disabled = false;
						return false;
					}
				}
			});

			return option_disabled;
		};

		var cascadeFilterOption = function(option_index, cascade) {
			var set_filter_option             = _.zipObject([this_filter.id], []);
			set_filter_option[this_filter.id] = [];
			for (var i = 0; i < this_filter.options.length; i++) {
				set_filter_option[this_filter.id].push(option_index === i ? [cascade.id] : []);
			}
			if ( !_.isNull(this_filter.parent) && !_.isEmpty(selected_siblings) ) {
				set_filter_option = _.assign(set_filter_option, selected_siblings);
			}
			return set_filter_option;
		};

		this_filter = _.find(filters, {'id': filter_id});

		if ( !_.isNull(this_filter.parent) ) {
			siblings = _.without(_.pluck(
				_.where(filters, {parent: this_filter.parent}), 'id'
			), this_filter.id);
			if ( !_.isEmpty(siblings) ) {
				_(selected.filters).forOwn(function(value, key) {
					var this_sibling = _.find(filters, {'id': key});
					if ( _.contains(siblings, key) ) {
						if (this_sibling.form_type === 'select_cascade') {
							selected_siblings[key] = [];
							_(value).forOwn(function(value, index) {
								selected_siblings[key][index] = [value];
							});
						} else {
							selected_siblings[key] = value;
						}
					}
				});
			}
		}

		_(this_filter.options).forEach(function(option, option_index) {
			if ( _.isEmpty(option) ) {
				return;
			}

			var filter_option = {};

			if ( _.contains(['select', 'checkbox'], this_filter.form_type) ) {
				filter_option = _.zipObject([this_filter.id], [[option.id]]);
				if ( !_.isNull(this_filter.parent) && !_.isEmpty(selected_siblings) ) {
					filter_option = _.assign(filter_option, selected_siblings);
				}
				option.disabled = doToggleOptions(this_filter, filter_option);
			} else if ( _.contains(['select_cascade'], this_filter.form_type) ) {
				if (option_index === 0) {
					_(option).forEach(function(cascade) {
						cascade.disabled = doToggleOptions(
							this_filter, cascadeFilterOption(option_index, cascade), option_index
						);
					});
				} else {
					_.flatten( _.values(option) ).forEach(function(cascade) {
						if ( !_.isPlainObject(cascade) ) {
							return;
						}
						cascade.disabled = doToggleOptions(
							this_filter, cascadeFilterOption(option_index, cascade), option_index
						);
					});
				}
			} else {
				return;
			}
		});

		return filters;
	};
}])

/**
 * Updates provider results based on selected filters.
 * @param  {function} $q        AngularJS promise service.
 * @return {array}    providers Filtered list of providers.
 */
.filter('applyFilters', ['$q', function($q) {
	return function($scope, action, filter_id) {
		var providers      = $scope.data.providers;
		var selected       = $scope.data.selected;
		var counts         = $scope.data.filtered.counts;
		var filtered_count = {
			'main':   0,
			'groups': _.map($scope.data.labels.main.groups.headers, function() { return 0; })
		};

		if ( _.isUndefined(action) ) {
			$scope.toggleOptions();

			counts.groups[0] = filtered_count.groups;

			_(providers).forEach(function(provider) {
				counts.groups[0][provider[$scope.data.labels.main.groups.group_key]]++;
			});

			if ( _.isEmpty(counts.groups[1]) ) {
				counts.groups[1] = _.clone(counts.groups[0]);
			}

			return providers;
		}

		if (action === 'update') {
			$scope.data.filtered.search = null;
		}

		$q.when().then(function() {
			_(providers).forEach(function(provider) {
				if (action === 'reset') {
					provider.hide        = false;
					provider.use_filters = false;
					return;
				} else if (action === 'single') {
					if (provider.id === selected.search.id) {
						provider.hide        = false;
						provider.use_filters = false;
						$scope.toggleDetail(provider.id);
					} else {
						provider.hide = true;
					}
					return;
				}

				provider.use_filters = false;

				_(selected.filters).forOwn(function(item, group) {
					var this_item         = _.find($scope.data.filters, {'id': group});
					var selected_children = {};
					var item_children, prvdr_fltr;

					if (_.isNull(this_item.parent) && this_item.has_children) {
						prvdr_fltr    = _.keys(provider.filters[group]);
						item_children = _.pluck(_.where($scope.data.filters, {parent: group}), 'id');
					} else if ( _.isNull(this_item.parent) ) {
						prvdr_fltr    = provider.filters[group];
					} else {
						return;
					}

					if ( _.isNull(this_item.parent) ) {
						if (this_item.form_type === 'checkbox') {
							provider.hide = !_.isEqual( _.sortBy(item), _.intersection(prvdr_fltr, item) );
						} else {
							_(item).forOwn(function(value, index) {
								if (this_item.form_type === 'select') {
									provider.hide = !_.contains(prvdr_fltr, value);
								} else if (this_item.form_type === 'select_cascade') {
									provider.hide = !_.contains(prvdr_fltr[index], value);
								} else {
									return false;
								}
							});
						}
					}

					if (!_.isEmpty(item_children) && provider.hide !== true) {
						_(selected.filters).forOwn(function(value, key) {
							var this_child = _.find($scope.data.filters, {'id': key});
							if ( _.contains(item_children, key) ) {
								if (this_child.form_type === 'select_cascade') {
									selected_children[key] = [];
									_(value).forOwn(function(value, index) {
										selected_children[key][index] = [value];
									});
								} else {
									selected_children[key] = value;
								}
							}
						});

						if ( !_.isEmpty(selected_children) ) {
							provider.hide = _.isEmpty(
								_.where(_.values(provider.filters[group][item]), selected_children)
							);
						}
					}

					if (!_.isUndefined(provider.hide) && provider.hide) {
						filtered_count.main++;
						filtered_count.groups[provider[$scope.data.labels.main.groups.group_key]]++;

						if ( filter_id === this_item.id || _.has(selected_children, filter_id) ) {
							provider.use_filters = true;
						}
						return false;
					}
				});
			});
		}).then(function() {
			counts.main = $scope.data.providers.length - filtered_count.main;
			_(counts.groups[0]).forEach(function(item, index) {
				counts.groups[0][index] = counts.groups[1][index] - filtered_count.groups[index];
			});

			if ( action === 'update' && !_.isNull(selected.filter_active) ) {
				$scope.toggleOptions('update', $scope.data.filters[selected.filter_active.index].id);
			} else if ( action === 'single' ) {
				$scope.resetFilters('single');
			}
		});

		return providers;
	};
}])

/**
 * Escapes HTML character entities for output.
 *
 * @param  {function} $sce AngularJS Strict Contextual Escaping (SCE) service.
 * @return {string}        Escaped string.
 */
.filter('trustHTML', ['$sce', function($sce){
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);
