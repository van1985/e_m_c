
angular.module('Controllers')
.controller('MainCtrl', ['$scope', '$filter', '$q', '$timeout', '$modal', 'getResource', '$location','UrlHelperSrv','$rootScope',
	function($scope, $filter, $q, $timeout, $modal, getResource, $location,UrlHelperSrv, $rootScope) {



	$scope.toggleOptions = function(action, filter_id) {
		$scope.data.filtered.filters = $filter('toggleOptions')($scope, action, filter_id);
		var transferObject={
			data: $scope.data
		};
		$rootScope.$broadcast('updateCacheData', JSON.stringify(transferObject));
		//updateCheckboxSstatus(); // Calling to this function to update checkmarks while copy/paste
	};

	$scope.applyFilters = function(action, filter_id) {
		if ( action === 'single' && !_.isNull($scope.data.filtered.search) ) {
			if ($scope.data.selected.search.id === $scope.data.filtered.search.id) {
				return;
			}
		}
		$scope.data.filtered.main = $filter('applyFilters')($scope, action, filter_id);
		$scope.applySort();
	};


	$scope.resetFilters = function(action, option_clicked) {
		var selected             = $scope.data.selected;

		selected.filters         = {};
		selected.filters_display = [];
		selected.option_desc     = {};
		selected.filter_primary  = null;

		if (action === 'single') {
			$scope.data.filtered.search = selected.search;
			selected.search = null;
		} else {
			$scope.data.filtered.search = null;
			_($scope.data.filters).forEach(function(item) {
				item.has_selected = '';
			});
			$scope.applyFilters('reset');
			//$location.search(''); // removes all URL's Filter Params queried
		}

		_(selected.filters_options).forEach(function(item, index, filter) {
			if ( _.isPlainObject(item) ) {
				if (_.isUndefined(option_clicked) || !option_clicked) {
					_(item).forEach(function(value, key, option) {
						option[key] = false;
					});
				}
			} else if ( _.isUndefined(item) ) {  // FIX: empty value
				delete filter[index];
			} else {
				filter[index] = [];
			}
		});

		if ( !_.isNull(selected.filter_active) &&
			( !_.isNull($scope.data.filters[selected.filter_active.index].parent_display) ||
			action === 'single') ) {
			$scope.data.filters[selected.filter_active.index].active = false;
			selected.filter_active = null;
		}

		angular.element(
			document.querySelectorAll('.filters > div > div:first-child')
		).css({'margin-left': '0px'});
		};

/**************************************************************************************************/
//Reset all filter from URL
//Author: jKraut
//Date: 04/07/2015

	$scope.resetUrl = function () {
		$location.search('');
		//disableCheckMarks();
	};  
/**************************************************************************************************/
	

	$scope.toggleReset = function() {
		if ( ( _.isUndefined($scope.data.selected) || _.isEmpty($scope.data.selected.filters) ) &&
			( _.isUndefined($scope.data.filtered) || _.isNull($scope.data.filtered.search) ) ) {
			return true;
		} else {
			return false;
		}
	};

/**************************************************************************************************/
//Update Location URL
//Author: Globant
//Date: 02/07/2015
// This method help to mantain URL from browser update with all the neccesary information
/**************************************************************************************************/



function removeCheckboxFilterURL(item,option){
	//remove checkbox option from URL - Special case multiple checkbox
	var values=window.location.search.replace('?',''),
		result='';
	values = UrlHelperSrv.parseURL(item.id);
	values = values.split(',');

	for (var z = 0, len = values.length; z < len; z++) {
		if ( values[z]!==option.id){
			result += result ==='' ? values[z] : ','+values[z];
		}
	}
	if (result !=='')
		{$location.search(item.id,result);}
	else
		{$location.search(item.id,null);}
}



$scope.addFilter = function(filter, option) {

console.log($scope.data);
console.log(filter);
console.log(option);

		if ( !_.isUndefined(filter) ) {
			this.item   = filter;
			this.option = option;
		}
		console.log(filter);
		console.log(option);
		if (this.option.disabled) {
			return;
		}
		console.log(filter);
		console.log(option);
		

		var selected   = $scope.data.selected;
		var element_id = 'filter-' + this.item.id;
		var cascade_values; //cascade values have the values por select in cascade

		

		if ( this.item.form_type === 'checkbox' &&
			_.contains(selected.filters[this.item.id], this.option.id) ) {
			$scope.removeFilter(this.item.id, this.option.id);
			//remove checkbox filter from URL
			removeCheckboxFilterURL(this.item,this.option);
			return true;
		}
		

		if (_.isNull(this.item.parent_display) && this.item.has_children) {
			selected.filter_primary = this.item.id;
		}

		if ( this.item.form_type === 'select' || !_.has(selected.filters, this.item.id) ) {
			selected.filters[this.item.id] = [this.option.id];
		} else {
			if (this.item.form_type === 'select_cascade') {
				cascade_values = selected.filters[this.item.id].slice(0, this.parent_idx);
				cascade_values.push(this.option.id);
				selected.filters[this.item.id] = cascade_values;
			} else if (this.item.form_type === 'checkbox') {
				selected.filters[this.item.id].push(this.option.id);
			}
		}

		this.item.has_selected = 'has_selected';

		if ( _.isUndefined(this.option.desc) ) {
			_.assign( selected.option_desc, _.zipObject([this.item.id], ['']) );
		} else {
			_.assign( selected.option_desc, _.zipObject([this.item.id], [this.option.desc]) );
		}

		$scope.updateOptionsDisplay(this.item, 'add', false);

		if ( !_.isNull(this.item.parent_display) ) {
			$timeout(function() {
				angular.element( document.getElementById(element_id) ).triggerHandler('click');
			}, 0);
		}
		$scope.toggleDetail();
		$scope.applyFilters('update', this.item.id);

/**************************************************************************************************/
//UpdateUrl
//Author: Globant
//Date: 02/07/2015

UrlHelperSrv.updateLocationURL(cascade_values,this.item,this.option,refreshPage);
/**************************************************************************************************/
	};


	$scope.removeFilter = function(filter_id, option_id) {
		var this_filter;
		var filters        = $scope.data.filters;
		var selected       = $scope.data.selected;
		var selected_count = _.size(selected.filters);
		var items_remove   = [];
		var element_id     = 'filter-' + filter_id;

		$scope.toggleDetail();

		if ( selected_count === 1 && _.isUndefined(option_id) ) {
			$scope.resetFilters('all');
			$location.search(''); //Clears URL's Filter Params queried

			return;
		}

		this_filter = _.find(filters, {'id': filter_id});

		if (!_.isUndefined(option_id) && selected.filters[filter_id].length > 1) {
			// FIX: Potential clash for select_cascade
			selected.filters[filter_id] = _.without(selected.filters[filter_id], option_id);


			return $q.when().then(function() {
				$scope.updateOptionsDisplay(this_filter, 'remove', false);
			}).then(function() {
				if (_.size(selected.filters) === 0) {
					$scope.resetFilters('all');
					//$location.search('');	// Removes all query filters
				} else {
					if (this_filter.form_type === 'select_cascade') {
						this_filter.has_selected = '';
					}
					$scope.applyFilters('update', filter_id);
				}
			});
		}

		items_remove.push(this_filter);

		if (items_remove[0].has_children) {
			items_remove = _.union(
				items_remove, _.where(filters, {'parent_display': filter_id})
			);

			if (selected.filter_primary === filter_id) {
				selected.filter_primary = true;
			}
		}

		return $q.when().then(function() {
			_(items_remove).forEach(function(item) {
				if ( _.has(selected.option_desc, item.id) ) {
					selected.option_desc[item.id] = null;
				}

				if ( !_.has(selected.filters, item.id) ) {
					return;
				}

				if ( _.isUndefined(option_id) ) {
					selected.filters_options[item.id] = (item.form_type === 'checkbox') ?
						_.zipObject(_.pluck(item.options, 'id'), [false]) : {};
				}

				if (item.id !== filter_id) {
					item.active = false;
					_.find(filters, {'id': item.id}).active = false;
				}

				_.find(filters, {'id': item.id}).has_selected = '';

				delete selected.filters[item.id];
				$scope.updateOptionsDisplay(item, 'remove', true);
			});
		}).then(function() {
			if (_.size(selected.filters) === 0) {
				$scope.resetFilters( 'all', !_.isUndefined(option_id) );
			} else {
				$scope.applyFilters('update', filter_id);

				if (
					( filters[selected.filter_active.index].id === filter_id &&
						!_.isNull(this_filter.parent_display) ) ||
					( filters[selected.filter_active.index].id !== filter_id &&
						!_.has(selected.filters, filters[selected.filter_active.index].id) &&
						this_filter.has_children )
					) {
					$timeout(function() {
						angular.element( document.getElementById(element_id) ).triggerHandler('click');
					}, 0);
				}
			}
		});

	};

	$scope.updateOptionsDisplay = function(this_filter, action, display_update) {
		var display_index, join_str;
		var selected   = $scope.data.selected;
		var titles_obj = {};

		var getTitles = function() {
			var titles = [];
			_(selected.filters[this_filter.id]).forOwn(function(option, index, group) {
				if ( _.contains(['select', 'checkbox'], this_filter.form_type) ) {
					titles.push( _.pluck(_.where(this_filter.options, {'id': option}), 'title') );
					join_str = ', ';
				} else if ( _.contains(['select_cascade'], this_filter.form_type) ) {
					join_str = ' > ';
					if (index > 0) {
						titles.push( _.pluck(
							_.where(this_filter.options[index][group[index - 1]], {'id': option}), 'title') );
					} else {
						titles.push( _.pluck(_.where(this_filter.options[index], {'id': option}), 'title') );
					}
				}

				if (action === 'add') {
					if ( _.contains(['select', 'select_cascade'], this_filter.form_type) ) {
						_.assign(
							selected.filters_options, _.zipObject([this_filter.id], [_.flatten(titles)])
						);
					}
				}
			});
			return titles;
		};

		if (display_update) {
			display_index = _.findIndex(selected.filters_display, this_filter.id);
			if (display_index >= 0) {
				selected.filters_display.splice(display_index, 1);
			}
		} else {
			titles_obj[this_filter.id] = [this_filter.title, _( getTitles() ).flatten().join(join_str)];

			display_index = _.findIndex(selected.filters_display, this_filter.id);
			if (display_index >= 0) {
				selected.filters_display[display_index] = titles_obj;
			} else {
				selected.filters_display.push(titles_obj);
			}
		}
	};

	$scope.changeSort = function(index) {
		var selected = $scope.data.labels.main.columns[index];
		if ( !selected.sort_by && _.isNull($scope.data.filtered.search) ) {
			_($scope.data.labels.main.columns).forEach(function(column) {
				column.sort_by = _.isEqual(column.sort_keys, selected.sort_keys) ? true : false;
			});
			$scope.toggleDetail();
			$scope.applySort();
		}
	};

	$scope.applySort = function() {
		var column    = _.find($scope.data.labels.main.columns, {'sort_by': true});
		var sort_keys = [];

		_(column.sort_order).forEach(function(order, index) {
			if ( !_.isNull(column.sort_keys[index]) ) {
				sort_keys.push( (order === 'desc' ? '-' : '+') + column.sort_keys[index] );
			}
		});
		$scope.data.filtered.main = $filter('orderBy')($scope.data.filtered.main, sort_keys);
	};

	$scope.toggleDetail = function(provider_id) {
		var doToggleDetail = function() {

			_( document.querySelectorAll('[popover]') ).forEach(function(item) {
				var scope  = angular.element(item).scope();
				var offset = 0;

				if (scope.$last && !scope.tt_isOpen) {
					if (_.isUndefined(scope.provider.is_open) || !scope.provider.is_open) {
						return;
					}
				}

				var popover = angular.element(item).next();

				if ( angular.element(popover).hasClass('popover') ) {
					if (!_.isUndefined(provider_id) && scope.provider.id === selected.id) {
						if (scope.tt_isOpen) {
							scope.provider.is_open = true;

							if ( !_.isNull($scope.data.filtered.search) ) {
								$scope.scrollTo();
							} else {
								if (_.isEmpty( document.querySelectorAll('main > .app-content.ui-scrollfix') ) ) {
									if ( $scope.isXSmall() ) {
										if ( _.isUndefined($scope.data.selected.xs_nav_open) ||
											_.isNull($scope.data.selected.xs_nav_open) ) {
											offset = -57 + item.parentElement.offsetTop - item.offsetHeight;
										} else {
											offset = -237 + item.parentElement.offsetTop - item.offsetHeight;
										}
									} else {
										offset = -197 + item.parentElement.offsetTop - item.offsetHeight;
									}
								} else {
									if ( $scope.isXSmall() ) {
										if ( _.isUndefined($scope.data.selected.xs_nav_open) ||
											_.isNull($scope.data.selected.xs_nav_open) ) {
											offset = -120;
										} else {
											offset = -300;
										}
									} else {
										offset = -235;
									}
								}

								$scope.scrollTo('#provider-' + selected.id, offset);
							}
						} else {
							selected.is_open = false;
						}
					} else {
						scope.tt_isOpen           = false;
						scope.provider.is_open    = false;
						angular.element(popover).remove();
					}
				}
			});
		};

		if ( _.isUndefined(provider_id) ) {
			doToggleDetail();
			return;
		}

		var selected = _.find($scope.data.providers, {'id': provider_id});
		var element  = angular.element( document.getElementById('provider-' + selected.id) );
		var labels   = $scope.data.labels.detail;

		var doShowHide = function() {
			if (element.scope().tt_isOpen) {
				element.triggerHandler('hide');
			} else {
				element.triggerHandler('show');
			}
		};

		if ( _.isUndefined(selected.detail) ) {
			selected.detail = getResource.get(
				{'resource': 'ServiceProviderSearchSpecDetail', 'serviceProviderId': selected.id}
			);
			selected.detail.$promise.then(function() {
				var services = _.find($scope.data.filters, {'id': labels.keys.services});
				var products = _.find($scope.data.filters, {'id': labels.keys.products});
				var html     = '';

				if ( !_.isEmpty(selected.detail.resources) ) {
					html += '<h5 class="resources">' + labels.titles.resources + '</h5>' +
						'<ul class="list-inline">';
					_(selected.detail.resources).forEach(function(resource) {
						html += '<li><a href="' + resource.url + '" target="_blank">';
						html += resource.title + '</a></li>';
					});
					html += '</ul>';
				}

				if ( !_.isEmpty(selected.detail.contacts) ) {
					html += '<h5 class="contacts">' + labels.titles.contacts + '</h5>';
					html += '<div>';
					_(selected.detail.contacts).forEach(function(contact) {
						html += '<p>' +
							'<span class="contact-title">' + contact.title + '</span><br />' +
							contact.name + '<br />' + contact.phone + '<br />' +
							'<a href="mailto:' + contact.email + '">' + contact.email + '</a></span></p>';
					});
					html += '</div>';
				}

				if ( !_.isEmpty(selected.filters[labels.keys.services]) ) {
					html += '<table class="services-resellers table table-responsive"><thead><tr>' +
						'<th><h5>' + labels.titles.offerings + '</h5></th>' +
						'<th><h5>' + labels.titles.products + '</h5></th>' +
						'</tr></thead><tbody>';
					_(selected.filters[labels.keys.services]).forEach(function(val, key) {
						var service       = _.find(services.options, {'id': key});
						var product_ids   = _.uniq( _.flatten( _.pluck(val, labels.keys.products) ) );
						var product_names = [];
						var get_product;

						if ( _.isUndefined(service) || _.isEmpty(service) ) {
							return;
						}

						_(product_ids).forEach(function(product_id) {
							if ( !_.isEmpty(product_id) ) {
								get_product = _.find(products.options, {'id': product_id});
								if ( !_.isEmpty(get_product) ) {
									product_names.push(get_product.title);
								}
							}
						});
						html += '<tr><td>' + service.title + '</td><td>' +
							product_names.join(', ') + '</td></tr>';
					});
					html += '</tbody></table>';
				}

				if ( !_.isEmpty(selected.detail.resellers) ) {
					html += '<table class="services-resellers table table-responsive"><thead><tr>' +
						'<th><h5>' + labels.titles.reseller_coverage + '</h5></th>';
					if ( !_.isEmpty( _.flatten( _.pluck(selected.detail.resellers, 'providers') ) ) ) {
						html += '<th><h5>' + labels.titles.reseller_providers + '</h5></th>';
					}
					html += '</tr></thead><tbody>';
					_(selected.detail.resellers).forEach(function(resellers) {
						html += '<tr><td>' + resellers.theater + '</td>';
						if ( !_.isEmpty(resellers.providers) ) {
							html += '<td>';
							_(resellers.providers).forEach(function(provider) {
								html += '<a href="' + provider.url + '" target="_blank">';
								html += provider.name + '</a><br />';
							});
							html += '</td>';
						}
						html += '</tr>';
					});
					html += '</tbody></table>';
				}

				selected.detail.html = html;
			}).then(function() {
				$timeout(function() {
					doShowHide();
				}, 0).then(function() {
					return $timeout(function() {
						doToggleDetail();
					}, 0);
				});
			});
		} else {
			$timeout(function() {
				doShowHide();
			}, 0).then(function() {
				return $timeout(function() {
					doToggleDetail();
				}, 0);
			});
		}
	};

	$scope.toggleFilterLevel = function() {
		var is_secondary  = !_.isNull(this.item.parent_display);
		var filters       = $scope.data.filters;
		var active        = $scope.data.selected.filter_active;

		if ( !_.isNull(active) && (active.index !== this.$index) &&
			(filters[active.index].parent_display !== is_secondary) ) {
			filters[active.index].active = false;
		}

		$scope.data.selected.filter_active = {'index': this.$index, 'is_secondary': is_secondary};
	};

	$scope.confirmAction = function(action) {
		var modal, filter, filter_id, option, has_children;
		var selected     = $scope.data.selected;
		var labels       = $scope.data.labels.remove;
		var items_remove = [];


		if (action === 'add') {
			filter       = this.item;
			filter_id    = filter.id;
			has_children = filter.has_children;
			option       = this.option;


			if (option.disabled) {
				return;
			} else if ( !has_children || ( has_children && !_.has(selected.filters, filter_id) ) ||
				( has_children && (_.size(selected.filters) < 1) ) ) {
				$scope.addFilter(filter, option);
$location.search(this.item.id, this.option.id);
				return;
			}

			items_remove = _.pluck(_.where($scope.data.filters, {'parent': filter_id}), 'id');
		} else if (action === 'remove') {
			filter_id    = this.id;
			has_children = _.find($scope.data.filters, {'id': filter_id}).has_children;
			if ( !has_children || ( has_children && (_.size(selected.filters) === 1) ) ) {
				$scope.removeFilter(filter_id);
// Unset from query filter removed
$location.search(filter_id, null);
				return;
			}
		} else if (action === 'single') {
			if ( !_.isNull($scope.data.filtered.search) || _.isEmpty(selected.filters) ) {
				$scope.toggleXSmall('search');
				$scope.applyFilters('single');
				return;
			}
		}

		modal = $modal.open({
			controller: $scope.confirmActionCtrl,
			template:   '<div class="modal-body"><h6>' + labels.header + '</h6><p>' +
						(action === 'single' ? labels.body.single : labels.body[filter_id]) +
						'</p></div><div class="modal-footer">' +
						'<button class="btn" ng-click="cancel()">' + labels.confirm.no + '</button>' +
						'<button class="btn" ng-click="ok()">' + labels.confirm.yes + '</button></div>'
		});

		if (action === 'add') {
			modal.result.then(function() {
				$q.when().then(function() {
					_(items_remove).forEach(function(id) {
						if ( _.has(selected.filters, id) ) {
							$scope.removeFilter(id);
						}
					});
				}).then(function() {
					//need to change the url
					$scope.addFilter(filter, option);
				});
			}, function() {});
		} else if (action === 'remove') {
			modal.result.then(function() {
				$scope.removeFilter(filter_id);
				// Unset from query filter removed
				$location.search(filter_id, null);
			}, function() {});
		} else if (action === 'single') {
			modal.result.then(function() {
				$scope.toggleXSmall('search');
				$scope.applyFilters('single');
			}, function() {
				$scope.data.selected.search = null;
			});
		}
	};

	$scope.confirmActionCtrl = ['$scope', '$modalInstance', function($scope, $modalInstance) {
		$scope.ok = function() {
			$modalInstance.close('result');
			$location.search('');
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};
	}];

	$scope.isXSmall = function() {
		var width = window.innerWidth || document.documentElement.clientWidth;
		return (width < 768);
	};

	$scope.toggleXSmall = function(str) {
		if ( !$scope.isXSmall() || !_.isString(str) ) {
			return;
		}

		var selected = $scope.data.selected;

		_(['nav', 'search', 'filters']).forEach(function(type) {
			var type_str = 'xs_' + type + '_open';
			if (type === str) {
				if ( _.isUndefined(selected[type_str]) || _.isNull(selected[type_str]) ) {
					selected[type_str] = 'Done';
				} else {
					selected[type_str] = null;
				}
			} else {
				selected[type_str] = null;
			}
		});

		if (str !== 'nav') {
			$scope.scrollTo();
		}
	};

	$scope.isXSmallDevice = function() {
		return (window.matchMedia && window.matchMedia('(max-device-width: 400px)').matches);
	};

	$scope.scrollTo = function(element, offset) {
		var top = 0;

		if ( !_.isUndefined(element) ) {
			top = document.querySelectorAll(element)[0].offsetTop + (_.isUndefined(offset) ? 0 : offset);
		}

		if ( _.isFunction(window.jQuery) ) {
			jQuery('html, body').animate({ scrollTop: top }, 'slow');
		} else {
			window.scrollTo(0, top);
		}
	};

	$scope.slideFilters = function(event) {
		if ( !$scope.isXSmall() ) {
			return;
		}

		if ( _.contains(['panmove', 'panend'], event.type) &&
			( !_.contains(['LI', 'UL'], event.target.parentNode.nodeName) ||
				_.isNull($scope.data.selected.filter_primary) ) ) {
				return;
		}

		var margin_left     = 0;
		var get_margin_left = 0;
		var filter_ref      = [];
		var distance;

		if ( _.isUndefined($scope.data.slide_stops) ) {
			$scope.data.slide_stops = [{
				'id':       $scope.data.filters[0].id,
				'html_id':  'filter-' + $scope.data.filters[0].id,
				'position': 0
			}];
			_.filter($scope.data.filters, 'parent_display').forEach(function(item, index) {
				$scope.data.slide_stops.push({
					'id':       item.id,
					'html_id':  'filter-' + item.id,
					'position': 0 - ( (index + 1) * 128 )
				});
			});
		}

		if (event.type === 'click') {
			margin_left = _.find($scope.data.slide_stops, {'id': this.item.id}).position;
		} else {
			distance    = _.parseInt(event.distance * 0.25);
		}

		_( document.querySelectorAll('.filters > div > div:first-child') ).forEach(function(item) {
			var item_dom = angular.element(item);

			if ( !_.isEmpty( item_dom.css('margin-left') ) ) {
				get_margin_left = _.parseInt(item_dom.css('margin-left').split('px')[0]);
			}

			if ( event.type === 'click' && (margin_left === get_margin_left) ) {
				return false;
			}

			$q.when().then(function() {
				if (event.direction === 2) {
					if (event.type === 'panmove') {
						margin_left = get_margin_left - distance;
					} else if (event.type === 'panend') {
						margin_left = ( get_margin_left - (get_margin_left % 128) ) - 128;
					}
				} else if (event.direction === 4) {
					if (event.type === 'panmove') {
						margin_left = get_margin_left + (distance);
					} else if (event.type === 'panend') {
						margin_left = get_margin_left - (get_margin_left % 128);
					}
					if (margin_left > -128) {
						margin_left = 0;
					}
				}
			}).then(function() {
				if (event.type !== 'click' && margin_left < _.findLast($scope.data.slide_stops).position) {
					margin_left = _.findLast($scope.data.slide_stops);
				}
				$timeout(function() {
					item_dom.css({'margin-left': margin_left + 'px'});

					if (event.type === 'panend') {
						filter_ref[0] = _.find($scope.data.slide_stops, {'position': margin_left});
						filter_ref[1] = angular.element( document.getElementById(filter_ref[0].html_id) ),
						angular.element(filter_ref[1]).triggerHandler('click');
						filter_ref[1].children().triggerHandler('click');
					}
				}, 0);
			});
		});
	};

	$scope.setFilterCSS = function() {
		_($scope.data.filters).forEach(function(item) {
			if (_.isString(item.icon) && item.icon.length > 0) {
				item.css = {"background-image": "url('" + $scope.data.base_url + item.icon + "')"};
			}
		});
	};


/**************************************************************************************************/
// Author: Globant
// Date: 02/07/2015
// Init function declaration - This function is the responsible for load all the information from 
// cache when the user refresh the page or copy/paste the link into another page
/**************************************************************************************************/
var refreshPage = false;
var flagAddFilter = false;
$scope.init = function(){
	var deferred = $q.defer();
	if ($scope.data.filters){
		var keyFilters = UrlHelperSrv.getKeysFilters();
		for (var i = 0, len = keyFilters.length; i < len; i++) {
			var option = UrlHelperSrv.parseURL(keyFilters[i]);
			if (option){
				var filterObject = UrlHelperSrv.getFilter(keyFilters[i],option,$scope.data.filters);
				if (filterObject.filter){
					refreshPage = true;
					for (var j = 0, lenj = filterObject.option.length; j < lenj; j++) {
						$scope.addFilter(filterObject.filter, filterObject.option[j]); // u
						if (filterObject.filter.form_type === 'checkbox'){
							flagAddFilter = true;
							$scope.checkbox.push(filterObject);
							flagAddFilter = false;
							//updateCheckboxSstatus();
						}
					}
				}
			}
		}
		//updateCheckboxSstatus();

	}
	refreshPage=false;
	deferred.resolve();
	//updateCheckboxSstatus();
	return deferred.promise;
};


/**************************************************************************************************/
// Author: Globant
// Date: 02/07/2015
// Update css class checkbox (Active) & URL QueryString - refresh
/**************************************************************************************************/
$scope.checkbox=[];
function updateCheckboxSstatus(){
	for (var i=0, leni = $scope.checkbox.length; i < leni; i++){
		var filterObject = $scope.checkbox[i];
		for (var j = 0, lenj = filterObject.option.length; j < lenj; j++) {
			if ( !jQuery('#'+filterObject.filter.id+'-'+filterObject.option[j].id).hasClass('active') ){
				jQuery('#'+filterObject.filter.id+'-'+filterObject.option[j].id).addClass('active');
				if (filterObject.filter.id ==='public_sector' || filterObject.filter.id ==='credit_card_swipe'){
					$location.search(filterObject.filter.id, filterObject.option[j].id);
				}
			}
		}	
	}
}

/**************************************************************************************************/
// Author: Globant
// Date: 21/07/2015
// Watches the $scope.checkbox variable at change
/**************************************************************************************************/

$scope.$watch('checkbox', function() {
	if(!flagAddFilter){
  updateCheckboxSstatus();
 }
}, true);

/**************************************************************************************************/
// Author: Globant
// Date: 21/07/2015
// Unchecks the checkbox on Reset Filter button  
/**************************************************************************************************/

function disableCheckMarks(){
	//for (var i=0, leni = checkmarks.length; i < leni; i++){
		//var filterObject = checkmarks[i];
		//for (var j = 0, lenj = filterObject.option.length; j < lenj; j++) {
			if ( jQuery('.checkbox').hasClass('active') ){
				jQuery('.checkbox').removeClass('active');
				flagAddFilter = true;
				}
    }
		//}
	//}
/**************************************************************************************************/
 $scope.resetActiveCheckbox = function(){
  disableCheckMarks();
};

/**************************************************************************************************/

	function refresh(){
	$scope.data = getResource.get({'resource': 'ServiceProviderSearchSpecArchive'});
	$scope.data.$promise.then(function() {
		$scope.data.is_cpc = false;
		var search         = window.location.search;
		var params         = {};

		if (search.indexOf('?cpc=') > -1 || search.indexOf('&cpc=') > -1) {
			_( search.split('?')[1].split('&') ).forEach(function(param) {
				params[param.split('=')[0]] = param.split('=')[1];
			});

			if (params.cpc && params.cpc === 'yes') {
				$scope.data.is_cpc    = true;
				$scope.data.providers = _.filter($scope.data.providers, {'cloud_partner_connect': 'Yes'});
			}
		}

		$scope.data.filtered = {
			'main':    {},
			'search':  null,
			'filters': {},
			'counts':  {
				'main':   $scope.data.providers.length,
				'groups': [[], []]
			}
		};
		$scope.data.selected = {
			'filters':         {},
			'filters_display': [],
			'filters_options': {},
			'filter_primary':  null,
			'filter_active':   null,
			'option_desc':     {},
			'search':          null
		};

/**************************************************************************************************/
// Author: Globant
// Date: 02/07/2015
// Init Function - Copy/Paste link feature
/**************************************************************************************************/

		$scope.init().then(function(){
			$scope.applyFilters();
			$scope.setFilterCSS();
			//updateCheckboxSstatus();
		});

	});
	}
/**************************************************************************************************/
// Author: Globant
// Date: 02/07/2015
// Encapsulate Refresh in a function for reuse in other functions
/**************************************************************************************************/
refresh();


}]);



