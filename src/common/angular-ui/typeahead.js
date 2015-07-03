/**
 * AngularUI Typeahead directive for provider name search
 */
angular.module('angular-ui.typeahead', ['angular-ui.position', 'template/typeahead/typeahead-match.html',
	'template/typeahead/typeahead-popup.html'])

.factory('typeaheadParser', ['$parse', function ($parse) {
	var TYPEAHEAD_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;

	return {
		parse:function (input) {

			var match = input.match(TYPEAHEAD_REGEXP);
			if (!match) {
				throw new Error(
					'Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_"' +
						' but got "' + input + '".');
			}

			return {
				itemName:match[3],
				source:$parse(match[4]),
				viewMapper:$parse(match[2] || match[1]),
				modelMapper:$parse(match[1])
			};
		}
	};
}])

.directive('typeahead', ['$compile', '$parse', '$q', '$timeout', '$window', '$document', '$position', 'typeaheadParser',
	function ($compile, $parse, $q, $timeout, $window, $document, $position, typeaheadParser) {

	var HOT_KEYS = [9, 13, 27, 38, 40];

	return {
		require:'ngModel',
		link:function (originalScope, element, attrs, modelCtrl) {
			var minSearch = originalScope.$eval(attrs.typeaheadMinLength) || 1;
			var waitTime = originalScope.$eval(attrs.typeaheadWaitMs) || 0;
			var isEditable = originalScope.$eval(attrs.typeaheadEditable) !== false;
			var isLoadingSetter = $parse(attrs.typeaheadLoading).assign || angular.noop;
			var onSelectCallback = $parse(attrs.typeaheadOnSelect);
			var inputFormatter = attrs.typeaheadInputFormatter ? $parse(attrs.typeaheadInputFormatter) : undefined;
			var appendToBody =  attrs.typeaheadAppendToBody ? originalScope.$eval(attrs.typeaheadAppendToBody) : false;

			var $setModelValue = $parse(attrs.ngModel).assign;
			var parserResult = typeaheadParser.parse(attrs.typeahead);
			var hasFocus;

			var $html         = angular.element( $document[0].querySelector('html') );
			var enterDropdown = function() {
				$html.addClass('no-scroll');
			};

			var leaveDropdown = function() {
				$html.removeClass('no-scroll');
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

			var scope = originalScope.$new();
			originalScope.$on('$destroy', function(){
				scope.$destroy();
			});

			var popupId = 'typeahead-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
			element.attr({
				'aria-autocomplete': 'list',
				'aria-expanded': false,
				'aria-owns': popupId
			});

			var popUpEl = angular.element('<div typeahead-popup></div>');
			popUpEl.attr({
				id: popupId,
				matches: 'matches',
				active: 'activeIdx',
				select: 'select(activeIdx)',
				query: 'query',
				position: 'position'
			});
			if (angular.isDefined(attrs.typeaheadTemplateUrl)) {
				popUpEl.attr('template-url', attrs.typeaheadTemplateUrl);
			}

			var resetMatches = function() {
				scope.matches = [];
				scope.activeIdx = -1;
				element.attr('aria-expanded', false);
			};

			var getMatchId = function(index) {
				return popupId + '-option-' + index;
			};

			scope.$watch('activeIdx', function(index) {
				if (index < 0) {
					element.removeAttr('aria-activedescendant');
				} else {
					element.attr('aria-activedescendant', getMatchId(index));
				}
			});

			var getMatchesAsync = function(inputValue) {

				var locals = {$viewValue: inputValue};
				isLoadingSetter(originalScope, true);
				$q.when(parserResult.source(originalScope, locals)).then(function(matches) {

					var onCurrentRequest = (inputValue === modelCtrl.$viewValue);
					if (onCurrentRequest && hasFocus) {
						if (matches.length > 0) {

							scope.activeIdx = 0;
							scope.matches.length = 0;

							for(var i=0; i<matches.length; i++) {
								locals[parserResult.itemName] = matches[i];
								scope.matches.push({
									id: getMatchId(i),
									label: parserResult.viewMapper(scope, locals),
									model: matches[i]
								});
							}

							scope.query = inputValue;
							scope.position = appendToBody ? $position.offset(element) : $position.position(element);
							scope.position.top = scope.position.top + element.prop('offsetHeight');

							element.attr('aria-expanded', true);
						} else {
							resetMatches();
						}
					}
					if (onCurrentRequest) {
						isLoadingSetter(originalScope, false);
					}
				}, function(){
					resetMatches();
					isLoadingSetter(originalScope, false);
				});
			};

			resetMatches();

			scope.query = undefined;

			var timeoutPromise;

			var scheduleSearchWithTimeout = function(inputValue) {
				timeoutPromise = $timeout(function () {
					getMatchesAsync(inputValue);
				}, waitTime);
			};

			var cancelPreviousTimeout = function() {
				if (timeoutPromise) {
					$timeout.cancel(timeoutPromise);
				}
			};

			modelCtrl.$parsers.unshift(function (inputValue) {
				hasFocus = true;

				if (inputValue && inputValue.length >= minSearch) {
					if (waitTime > 0) {
						cancelPreviousTimeout();
						scheduleSearchWithTimeout(inputValue);
					} else {
						getMatchesAsync(inputValue);
					}
				} else {
					isLoadingSetter(originalScope, false);
					cancelPreviousTimeout();
					resetMatches();
				}

				if (isEditable) {
					return inputValue;
				} else {
					if (!inputValue) {
						modelCtrl.$setValidity('editable', true);
						return inputValue;
					} else {
						modelCtrl.$setValidity('editable', false);
						return undefined;
					}
				}
			});

			modelCtrl.$formatters.push(function (modelValue) {

				var candidateViewValue, emptyViewValue;
				var locals = {};

				if (inputFormatter) {

					locals['$model'] = modelValue;
					return inputFormatter(originalScope, locals);

				} else {

					locals[parserResult.itemName] = modelValue;
					candidateViewValue = parserResult.viewMapper(originalScope, locals);
					locals[parserResult.itemName] = undefined;
					emptyViewValue = parserResult.viewMapper(originalScope, locals);

					return candidateViewValue!== emptyViewValue ? candidateViewValue : modelValue;
				}
			});

			scope.select = function (activeIdx) {
				var locals = {};
				var model, item;

				locals[parserResult.itemName] = item = scope.matches[activeIdx].model;
				model = parserResult.modelMapper(originalScope, locals);
				$setModelValue(originalScope, model);
				modelCtrl.$setValidity('editable', true);

				onSelectCallback(originalScope, {
					$item: item,
					$model: model,
					$label: parserResult.viewMapper(originalScope, locals)
				});

				resetMatches();

				$timeout(function() { element[0].focus(); }, 0, false);
			};

			element.bind('keydown', function (evt) {

				if (scope.matches.length === 0 || HOT_KEYS.indexOf(evt.which) === -1) {
					return;
				}

				evt.preventDefault();

				if (evt.which === 40) {
					scope.activeIdx = (scope.activeIdx + 1) % scope.matches.length;
					scope.$digest();

				} else if (evt.which === 38) {
					scope.activeIdx = (scope.activeIdx ? scope.activeIdx : scope.matches.length) - 1;
					scope.$digest();

				} else if (evt.which === 13 || evt.which === 9) {
					scope.$apply(function () {
						scope.select(scope.activeIdx);
					});

				} else if (evt.which === 27) {
					evt.stopPropagation();

					if ( !isFirefox() && !isChrome() ) {
						leaveDropdown();
					}

					resetMatches();
					scope.$digest();
				}
			});

			element.bind('blur', function (evt) {
				hasFocus = false;
			});

			var dismissClickHandler = function (evt) {
				if (element[0] !== evt.target) {
					resetMatches();
					scope.$digest();
				}
			};

			$document.bind('click', dismissClickHandler);

			originalScope.$on('$destroy', function(){
				$document.unbind('click', dismissClickHandler);
			});

			var $popup = $compile(popUpEl)(scope);
			if (appendToBody) {
				$document.find('body').append($popup);
			} else {
				element.after($popup);
			}

			$popup.ready(function() {
				if ( ( isFirefox() || isChrome() ) && !isXSmall() ) {
					angular.element($popup[0]).bind('wheel', function(evt) {
						var offsetTop    = $popup[0].scrollTop + parseInt(evt.deltaY, 10);
						var offsetBottom = $popup[0].scrollHeight - $popup[0].getBoundingClientRect().height - offsetTop;

						if (offsetTop < 0 || offsetBottom < 0) {
							evt.preventDefault();
						} else {
							evt.stopImmediatePropagation();
						}
					});
				} else if ( !isXSmall() ) {
					popUpEl.bind('mouseenter', enterDropdown);
					popUpEl.bind('mouseleave', leaveDropdown);
				}
			});
		}
	};

}])

.directive('typeaheadPopup', function () {
	return {
		restrict:'EA',
		scope:{
			matches:'=',
			query:'=',
			active:'=',
			position:'=',
			select:'&'
		},
		replace:true,
		templateUrl:'template/typeahead/typeahead-popup.html',
		link:function (scope, element, attrs) {
			scope.templateUrl = attrs.templateUrl;

			scope.isOpen = function () {
				return scope.matches.length > 0;
			};

			scope.isActive = function (matchIdx) {
				return scope.active == matchIdx;
			};

			scope.selectActive = function (matchIdx) {
				scope.active = matchIdx;
			};

			scope.selectMatch = function (activeIdx) {
				scope.select({activeIdx:activeIdx});
			};
		}
	};
})

.directive('typeaheadMatch', ['$http', '$templateCache', '$compile', '$parse', function ($http, $templateCache, $compile, $parse) {
	return {
		restrict:'EA',
		scope:{
			index:'=',
			match:'=',
			query:'='
		},
		link:function (scope, element, attrs) {
			var tplUrl = $parse(attrs.templateUrl)(scope.$parent) || 'template/typeahead/typeahead-match.html';
			$http.get(tplUrl, {cache: $templateCache}).success(function(tplContent) {
				element.replaceWith($compile(tplContent.trim())(scope));
			});
		}
	};
}])

.filter('typeaheadHighlight', function() {
	function escapeRegexp(queryToEscape) {
		return queryToEscape.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
	}

	return function(matchItem, query) {
		return query ? ('' + matchItem).replace(new RegExp(escapeRegexp(query), 'gi'), '<strong>$&</strong>') : matchItem;
	};
})

.directive('bindHtmlUnsafe', function () {
	return function (scope, element, attr) {
		element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
		scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
			element.html(value || '');
		});
	};
});

angular.module('template/typeahead/typeahead-match.html', []).run(['$templateCache', function($templateCache) {
	$templateCache.put('template/typeahead/typeahead-match.html',
	"<a tabindex=\"-1\" bind-html-unsafe=\"match.label | typeaheadHighlight:query\"></a>");
}]);

angular.module('template/typeahead/typeahead-popup.html', []).run(['$templateCache', function($templateCache) {
	$templateCache.put('template/typeahead/typeahead-popup.html',
		"<ul class=\"dropdown-menu\" ng-style=\"{display: isOpen()&&'block' || 'none', top: position.top+'px', left: position.left+'px'}\">\n" +
		"    <li ng-repeat=\"match in matches\" ng-class=\"{active: isActive($index) }\" ng-mouseenter=\"selectActive($index)\" ng-click=\"selectMatch($index)\">\n" +
		"        <div typeahead-match index=\"$index\" match=\"match\" query=\"query\" template-url=\"templateUrl\"></div>\n" +
		"    </li>\n" +
		"</ul>");
}]);
