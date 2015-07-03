/**
 * AngularUI Dropdown directive for simulating form selects
 */
angular.module('angular-ui.dropdown', [])

.constant('dropdownConfig', {
	openClass: 'open'
})

.service('dropdownService', ['$window', '$document', function($window, $document ) {
	var openScope    = null;
	var dropdownMenu = null;
	var $html        = angular.element( $document[0].querySelector('html') );

	this.open = function(dropdownScope) {
		if (!openScope) {
			$document.bind('click', closeDropdown);
			$document.bind('keydown', escapeKeyBind);
		}

		if (openScope && openScope !== dropdownScope) {
			openScope.isOpen = false;
		}

		openScope    = dropdownScope;
		dropdownMenu = openScope.getToggleElement().next();

		if ( ( isFirefox() || isChrome() ) && !isXSmall() ) {
			dropdownMenu.bind('wheel', limitScroll);
		} else if ( !isXSmall() ) {
			dropdownMenu.bind('mouseenter', enterDropdown);
			dropdownMenu.bind('mouseleave', leaveDropdown);
		}
	};

	this.close = function(dropdownScope) {
		if (openScope === dropdownScope) {
			openScope = null;
			$document.unbind('click', closeDropdown);
			$document.unbind('keydown', escapeKeyBind);
			if ( isFirefox() || isChrome() ) {
				dropdownMenu.unbind('wheel', limitScroll);
			} else {
				leaveDropdown();
				dropdownMenu.unbind('mouseenter', enterDropdown);
				dropdownMenu.unbind('mouseleave', leaveDropdown);
			}
		}
	};

	var closeDropdown = function(evt) {
		var toggleElement = openScope.getToggleElement();
		if ( evt && toggleElement && toggleElement[0].contains(evt.target) ) {
			return;
		}

		openScope.$apply(function() {
			openScope.isOpen = false;
		});
	};

	var escapeKeyBind = function(evt) {
		if (evt.which === 27) {
			openScope.focusToggleElement();
			closeDropdown();
		}
	};

	var enterDropdown = function() {
		$html.addClass('no-scroll');
	};

	var leaveDropdown = function() {
		$html.removeClass('no-scroll');
	};

	var limitScroll = function(evt) {
		var offsetTop    = this.scrollTop + parseInt(evt.deltaY, 10);
		var offsetBottom = this.scrollHeight - this.getBoundingClientRect().height - offsetTop;

		if (offsetTop < 0 || offsetBottom < 0) {
			evt.preventDefault();
		} else {
			evt.stopImmediatePropagation();
		}
	};

	var isFirefox = function() {
		return navigator.userAgent.indexOf('Firefox') > -1;
	};

	var isChrome = function() {
		return navigator.userAgent.indexOf('Chrome') > -1 && navigator.userAgent.indexOf('Safari') === -1;
	};

	var isXSmall = function() {
		var width = $window.innerWidth || $document.documentElement.clientWidth;
		return (width < 768);
	};
}])

.controller('DropdownController', ['$scope', '$attrs', '$parse', 'dropdownConfig', 'dropdownService', '$animate', function($scope, $attrs, $parse, dropdownConfig, dropdownService, $animate) {
	var self = this,
		scope = $scope.$new(),
		openClass = dropdownConfig.openClass,
		getIsOpen,
		setIsOpen = angular.noop,
		toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop;

	this.init = function(element) {
		self.$element = element;

		if ($attrs.isOpen) {
			getIsOpen = $parse($attrs.isOpen);
			setIsOpen = getIsOpen.assign;

			$scope.$watch(getIsOpen, function(value) {
				scope.isOpen = !!value;
			});
		}
	};

	this.toggle = function(open) {
		return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
	};

	this.isOpen = function() {
		return scope.isOpen;
	};

	scope.getToggleElement = function() {
		return self.toggleElement;
	};

	scope.focusToggleElement = function() {
		if (self.toggleElement) {
			self.toggleElement[0].focus();
		}
	};

	scope.$watch('isOpen', function(isOpen, wasOpen) {
		$animate[isOpen ? 'addClass' : 'removeClass'](self.$element, openClass);

		if (isOpen) {
			scope.focusToggleElement();
			dropdownService.open(scope);
		} else {
			dropdownService.close(scope);
		}

		setIsOpen($scope, isOpen);
		if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
			toggleInvoker($scope, { open: !!isOpen });
		}
	});

	$scope.$on('$locationChangeSuccess', function() {
		scope.isOpen = false;
	});

	$scope.$on('$destroy', function() {
		scope.$destroy();
	});
}])

.directive('dropdown', function() {
	return {
		controller: 'DropdownController',
		link: function(scope, element, attrs, dropdownCtrl) {
			dropdownCtrl.init(element);
		}
	};
})

.directive('dropdownToggle', function() {
	return {
		require: '?^dropdown',
		link: function(scope, element, attrs, dropdownCtrl) {
			if (!dropdownCtrl) {
				return;
			}

			dropdownCtrl.toggleElement = element;

			var toggleDropdown = function(event) {
				event.preventDefault();

				if (!element.hasClass('disabled') && !attrs.disabled) {
					scope.$apply(function() {
						dropdownCtrl.toggle();
					});
				}
			};

			element.bind('click', toggleDropdown);

			element.attr({ 'aria-haspopup': true, 'aria-expanded': false });
			scope.$watch(dropdownCtrl.isOpen, function(isOpen) {
				element.attr('aria-expanded', !!isOpen);
			});

			scope.$on('$destroy', function() {
				element.unbind('click', toggleDropdown);
			});
		}
	};
});
