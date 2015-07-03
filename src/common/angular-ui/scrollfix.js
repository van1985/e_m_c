/**
 * AngularUI Scrollfix directive for docked navigation
 */
angular.module('angular-ui.scrollfix',[])

/**
 * Adds a 'ui-scrollfix' class to the element when the page scrolls past its position.
 * @param [offset] {int} optional Y-offset to override the detected offset.
 *   Takes 300 (absolute) or -300 or +300 (relative to detected)
 */
.directive('uiScrollfix', ['$window', function ($window) {
	return {
		require: '^?uiScrollfixTarget',
		link: function (scope, elm, attrs, uiScrollfixTarget) {
			var top = elm[0].offsetTop,
				$target = uiScrollfixTarget && uiScrollfixTarget.$element || angular.element($window);

			if (!attrs.uiScrollfix) {
				attrs.uiScrollfix = top;
			} else if (typeof(attrs.uiScrollfix) === 'string') {
				// charAt is generally faster than indexOf: http://jsperf.com/indexof-vs-charat
				if (attrs.uiScrollfix.charAt(0) === '-') {
					attrs.uiScrollfix = top - parseFloat(attrs.uiScrollfix.substr(1));
				} else if (attrs.uiScrollfix.charAt(0) === '+') {
					attrs.uiScrollfix = top + parseFloat(attrs.uiScrollfix.substr(1));
				}
			}

			function onScroll() {
				var offset;

				if ($target[0] === $window) {
					// if pageYOffset is defined use it, otherwise use other crap for IE
					if (angular.isDefined($window.pageYOffset)) {
						offset = $window.pageYOffset;
					} else {
						var iebody = (document.compatMode && document.compatMode !== 'BackCompat') ?
							document.documentElement : document.body;
						offset = iebody.scrollTop;
					}
				} else {
					offset = $target[0].scrollTop;
				}

				if (!elm.hasClass('ui-scrollfix') && offset > attrs.uiScrollfix) {
					elm.addClass('ui-scrollfix');
				} else if ( elm.hasClass('ui-scrollfix') ) {
					if ( offset < attrs.uiScrollfix || ($target[0] === $window && offset === 0) ) {
						elm.removeClass('ui-scrollfix');
					}
				}
			}

			$target.on('scroll', onScroll);

			// Unbind scroll event handler when directive is removed
			scope.$on('$destroy', function() {
				$target.off('scroll', onScroll);
			});
		}
	};
}]).directive('uiScrollfixTarget', [function () {
	return {
		controller: ['$element', function($element) {
			this.$element = $element;
		}]
	};
}]);
