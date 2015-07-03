/**
 * AngularUI Popover directive for provider detail; uses AngularUI Tooltip
 */
angular.module( 'angular-ui.popover', [ 'angular-ui.tooltip', 'template/popover/popover.html' ] )

.directive( 'popoverPopup', function () {
	return {
		restrict: 'EA',
		replace: true,
		scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
		templateUrl: 'template/popover/popover.html'
	};
})

.directive( 'popover', [ '$tooltip', function ( $tooltip ) {
	return $tooltip( 'popover', 'popover', 'click' );
}]);


angular.module('template/popover/popover.html', []).run(['$templateCache', function($templateCache) {
	$templateCache.put('template/popover/popover.html',
		"<tr class=\"popover animated {{placement}}\" ng-class=\"{ fadeInDown: isOpen(), fadeOutUp: !isOpen() }\">\n" +
		"  <td class=\"popover-inner\">\n" +
		"      <div class=\"popover-content\" bind-html-unsafe=\"content\"></div>\n" +
		"  </td>\n" +
		"</tr>\n" +
		"");
}]);
