/**
 * AngularUI Tabs directive for filters and filter options
 */
angular.module('angular-ui.tabs', [])

.controller('TabsetController', ['$scope', function TabsetCtrl($scope) {
	var ctrl = this,
		tabs = ctrl.tabs = $scope.tabs = [];

	ctrl.select = function(selectedTab) {
		angular.forEach(tabs, function(tab) {
			if (tab.active && tab !== selectedTab) {
				tab.active = false;
				tab.onDeselect();
			}
		});
		selectedTab.active = true;
		selectedTab.onSelect();
	};

	ctrl.addTab = function addTab(tab) {
		tabs.push(tab);
		if ( tabs.length === 1 && angular.isDefined(tab.active) ) {
			tab.active = true;
		} else if (tab.active) {
			ctrl.select(tab);
		}
	};

	ctrl.removeTab = function removeTab(tab) {
		var index = tabs.indexOf(tab);
		if (tab.active && tabs.length > 1) {
			var newActiveIndex = index == tabs.length - 1 ? index - 1 : index + 1;
			ctrl.select(tabs[newActiveIndex]);
		}
		tabs.splice(index, 1);
	};
}])

.directive('tabset', function() {
	return {
		restrict: 'EA',
		transclude: true,
		replace: true,
		scope: {
			type: '@'
		},
		controller: 'TabsetController',
		template: '<div><div><ul class="nav nav-{{type || \'tabs\'}}" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}" ng-transclude></div></ul><div class="tab-content"><div class="tab-pane animated" ng-repeat="tab in tabs" ng-class="{active: tab.active, fadeInDown: tab.active}" tab-content-transclude="tab"></div></div></div>',
		link: function(scope, element, attrs) {
			scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
			scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
		}
	};
})

.directive('tab', ['$parse', function($parse) {
	return {
		require: '^tabset',
		restrict: 'EA',
		replace: true,
		template: '<li ng-class="{active: active, disabled: disabled}"><a ng-click="select()" tab-heading-transclude>{{heading}}</a></li>',
		transclude: true,
		scope: {
			active: '=?',
			heading: '@',
			onSelect: '&select',
			onDeselect: '&deselect'
		},
		controller: function() {
		},
		compile: function(elm, attrs, transclude) {
			return function postLink(scope, elm, attrs, tabsetCtrl) {
				scope.$watch('active', function(active) {
					if (active) {
						tabsetCtrl.select(scope);
					}
				});

				scope.disabled = false;
				if ( attrs.disabled ) {
					scope.$parent.$watch($parse(attrs.disabled), function(value) {
						scope.disabled = !! value;
					});
				}

				scope.select = function() {
					if ( !scope.disabled ) {
						scope.active = true;
					}
				};

				tabsetCtrl.addTab(scope);
				scope.$on('$destroy', function() {
					tabsetCtrl.removeTab(scope);
				});

				scope.$transcludeFn = transclude;
			};
		}
	};
}])

.directive('tabHeadingTransclude', [function() {
	return {
		restrict: 'A',
		require: '^tab',
		link: function(scope, elm, attrs, tabCtrl) {
			scope.$watch('headingElement', function updateHeadingElement(heading) {
				if (heading) {
					elm.html('');
					elm.append(heading);
				}
			});
		}
	};
}])

.directive('tabContentTransclude', function() {
	return {
		restrict: 'A',
		require: '^tabset',
		link: function(scope, elm, attrs) {
			var tab = scope.$eval(attrs.tabContentTransclude);

			tab.$transcludeFn(tab.$parent, function(contents) {
				angular.forEach(contents, function(node) {
					if (isTabHeading(node)) {
						//Let tabHeadingTransclude know.
						tab.headingElement = node;
					} else {
						elm.append(node);
					}
				});
			});
		}
	};
	function isTabHeading(node) {
		return node.tagName &&  (
			node.hasAttribute('tab-heading') ||
			node.hasAttribute('data-tab-heading') ||
			node.tagName.toLowerCase() === 'tab-heading' ||
			node.tagName.toLowerCase() === 'data-tab-heading'
		);
	}
});
