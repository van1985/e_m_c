angular.module('templates-app', ['home.tpl.html']);

angular.module("home.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("home.tpl.html",
    "<header class=\"page-nav\">\n" +
    "	<div class=\"navbar\">\n" +
    "		<a href=\"/\" class=\"navbar-brand\">EMC Corporation</a>\n" +
    "		<a class=\"navbar-top dropup\" ng-click=\"scrollTo()\">Back to top <span class=\"caret\"></span></a>\n" +
    "	</div>\n" +
    "</header>\n" +
    "\n" +
    "<div class=\"app-nav\" ng-class=\"{'is-secondary-open': data.selected.filter_primary,\n" +
    "	'xs-nav-open': data.selected.xs_nav_open, 'xs-search-open': data.selected.xs_search_open,\n" +
    "	'xs-filters-open': data.selected.xs_filters_open}\" ui-scrollfix=\"-40\">\n" +
    "	<section class=\"app-header\" data-ng-init=\"init()\">\n" +
    "		<div>\n" +
    "			<div class=\"app-title\">\n" +
    "				<h1 ng-click=\"toggleXSmall('nav')\">{{data.labels.header_app}}</h1>\n" +
    "				<h2 ng-click=\"toggleXSmall('filters')\">\n" +
    "					<span class=\"sm-min\">{{data.labels.header_filters.lg}}:</span>\n" +
    "					<span class=\"xs-max\">\n" +
    "						{{data.selected.xs_filters_open || data.labels.header_filters.sm}}\n" +
    "					</span>\n" +
    "				</h2>\n" +
    "				<span ng-show=\"data.selected.xs_filters_open\">{{data.labels.header_filters.sm}}</span>\n" +
    "			</div>\n" +
    "\n" +
    "			<form class=\"app-search\">\n" +
    "				<div class=\"form-group has-feedback app-typeahead\">\n" +
    "					<label for=\"name\" ng-click=\"toggleXSmall('search')\">\n" +
    "						{{data.selected.xs_search_open || data.labels.search.sm}}\n" +
    "					</label>\n" +
    "					<span ng-show=\"data.selected.xs_search_open\">{{data.labels.search.sm}}</span>\n" +
    "					<input name=\"name\" class=\"form-control\" type=\"text\" ng-model=\"data.selected.search\"\n" +
    "						typeahead=\"p as p.name for p in data.providers | filter:{name:$viewValue}\"\n" +
    "						typeahead-on-select=\"confirmAction('single')\" placeholder=\"{{data.labels.search.lg}}\"\n" +
    "						ng-class=\"{'is-empty': !data.selected.search}\" />\n" +
    "					<span class=\"glyphicon glyphicon-search form-control-feedback\"></span>\n" +
    "				</div>\n" +
    "				<div class=\"form-group app-reset\">\n" +
    "					<button type=\"button\" class=\"btn\" ng-class=\"{'disabled': toggleReset()}\"\n" +
    "						ng-disabled=\"toggleReset()\" ng-click=\"resetFilters('all'); toggleDetail(); resetUrl(); resetActiveCheckbox();\">\n" +
    "						<span class=\"sm-min\">{{data.labels.reset.lg}}</span>\n" +
    "						<span class=\"xs-max\">\n" +
    "							<span>{{data.labels.reset.lg}}</span>\n" +
    "							<span>{{data.labels.reset.sm}}</span>\n" +
    "						</span>\n" +
    "					</button>\n" +
    "				</div>\n" +
    "			</form>\n" +
    "		</div>\n" +
    "	</section>\n" +
    "\n" +
    "	<section id=\"filters\" class=\"filters\" ui-scrollfix=\"-90\">\n" +
    "		<tabset justified=\"true\" class=\"filters-primary\">\n" +
    "			<tab ng-repeat=\"item in data.filtered.filters\" ng-if=\"!item.parent_display\"\n" +
    "				heading=\"{{item.title}}\" active=\"item.active\" id=\"filter-{{item.id}}\"\n" +
    "				class=\"parent-{{item.has_children}} {{item.has_selected}}\" ng-style=\"item.css\"\n" +
    "				hm-panmove=\"slideFilters($event)\" hm-panend=\"slideFilters($event)\"\n" +
    "				ng-click=\"toggleFilterLevel(); toggleDetail(); applyFilters('update', item.id); slideFilters($event)\">\n" +
    "\n" +
    "				<button type=\"button\" class=\"close\"\n" +
    "					ng-click=\"toggleDetail(); item.active = false; data.selected.filter_recent = null;\n" +
    "						data.selected.filter_active = null\">\n" +
    "					<span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span>\n" +
    "				</button>\n" +
    "\n" +
    "				<div class=\"question\">\n" +
    "					<p>{{item.question | trustHTML}}</p>\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"options form-type-{{item.form_type}}\">\n" +
    "					<h3 class=\"filter-title\">{{item.title}}</h3>\n" +
    "\n" +
    "					<!-- Single-select -->\n" +
    "					<div class=\"btn-group\" ng-if=\"item.form_type == 'select'\" dropdown>\n" +
    "						<button type=\"button\" class=\"btn dropdown-toggle\" dropdown-toggle>\n" +
    "							<span class=\"dropdown-title\">\n" +
    "								{{data.selected.filters_options[item.id][0] || 'Select One'}}\n" +
    "							</span>\n" +
    "							<span class=\"caret\"></span>\n" +
    "						</button>\n" +
    "						<ul class=\"dropdown-menu\">\n" +
    "							<li ng-repeat=\"option in item.options track by option.id\"\n" +
    "								ng-class=\"{'disabled': option.disabled, 'active': data.selected.filters_options[item.id][0] == option.title}\"\n" +
    "								ng-click=\"confirmAction('add')\">\n" +
    "								<a>{{option.title}}</a>\n" +
    "							</li>\n" +
    "						</ul>\n" +
    "					</div>\n" +
    "\n" +
    "					<!-- Cascading single-selects -->\n" +
    "					<div class=\"btn-group\" ng-if=\"item.form_type == 'select_cascade'\"\n" +
    "						ng-repeat=\"option_group in item.options\" dropdown>\n" +
    "						<button type=\"button\" class=\"btn dropdown-toggle\" dropdown-toggle\n" +
    "							ng-hide=\"$index > 0 && !item.options[$index][data.selected.filters[item.id][$index - 1]]\">\n" +
    "							<span class=\"dropdown-title\">\n" +
    "								{{data.selected.filters_options[item.id][$index] || item.form_select_title[$index]}}\n" +
    "							</span>\n" +
    "							<span class=\"caret\"></span>\n" +
    "						</button>\n" +
    "						<ul class=\"dropdown-menu\" ng-if=\"$index == 0\" ng-init=\"parent_idx = $index\">\n" +
    "							<li ng-repeat=\"option in option_group track by option.id\"\n" +
    "								ng-class=\"{'disabled': option.disabled, 'active': data.selected.filters_options[item.id][parent_idx] == option.title}\"\n" +
    "								ng-click=\"addFilter()\">\n" +
    "								<a>{{option.title}}</a>\n" +
    "							</li>\n" +
    "						</ul>\n" +
    "						<ul class=\"dropdown-menu\" ng-if=\"$index > 0\" ng-init=\"parent_idx = $index\">\n" +
    "							<li ng-repeat=\"option in item.options[$index][data.selected.filters[item.id][$index - 1]] track by option.id\"\n" +
    "								ng-class=\"{'disabled': option.disabled, 'active': data.selected.filters_options[item.id][parent_idx] == option.title}\"\n" +
    "								ng-click=\"addFilter()\">\n" +
    "								<a>{{option.title}}</a>\n" +
    "							</li>\n" +
    "						</ul>\n" +
    "					</div>\n" +
    "\n" +
    "					<!-- Checkboxes -->\n" +
    "					<div class=\"btn-group checkboxes\" ng-if=\"item.form_type == 'checkbox'\">\n" +
    "						<button type=\"button\" class=\"checkbox\"\n" +
    "							ng-repeat=\"option in item.options track by option.id\" btn-checkbox\n" +
    "							ng-model=\"data.selected.filters_options[item.id][option.id]\"\n" +
    "							ng-class=\"{'disabled': option.disabled}\" ng-disabled=\"option.disabled\"\n" +
    "							ng-click=\"addFilter()\"\n" +
    "							id=\"{{item.id}}-{{option.id}}\">\n" +
    "							<!-- this is the checkbox we chage the function called-->\n" +
    "							<span class=\"glyphicon glyphicon-ok\"></span> {{option.title}}\n" +
    "						</button>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"desc\">\n" +
    "					<p ng-show=\"data.selected.option_desc[item.id]\" ng-bind-html=\"data.selected.option_desc[item.id]\"></p>\n" +
    "				</div>\n" +
    "			</tab>\n" +
    "		</tabset>\n" +
    "\n" +
    "		<tabset justified=\"true\" class=\"filters-secondary\" ng-show=\"data.selected.filter_primary\">\n" +
    "			<tab ng-repeat=\"item in data.filtered.filters\" ng-if=\"item.parent_display\"\n" +
    "				heading=\"{{item.title}}\" active=\"item.active\" id=\"filter-{{item.id}}\"\n" +
    "				class=\"{{item.has_selected}}\" ng-style=\"item.css\"\n" +
    "				hm-panmove=\"slideFilters($event)\" hm-panend=\"slideFilters($event)\"\n" +
    "				ng-click=\"toggleFilterLevel(); toggleDetail(); applyFilters('update', item.id); slideFilters($event)\">\n" +
    "\n" +
    "				<button type=\"button\" class=\"close\"\n" +
    "					ng-click=\"toggleDetail(); item.active = false; data.selected.filter_recent = null;\n" +
    "						data.selected.filter_active = null\">\n" +
    "					<span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span>\n" +
    "				</button>\n" +
    "\n" +
    "				<div class=\"question\">\n" +
    "					<p>{{item.question | trustHTML}}</p>\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"options form-type-{{item.form_type}}\">\n" +
    "					<h3 class=\"filter-title\">{{item.title}}</h3>\n" +
    "\n" +
    "					<!-- Single-select -->\n" +
    "					<div class=\"btn-group\" ng-if=\"item.form_type == 'select'\" dropdown>\n" +
    "						<button type=\"button\" class=\"btn dropdown-toggle\" dropdown-toggle>\n" +
    "							<span class=\"dropdown-title\">\n" +
    "								{{data.selected.filters_options[item.id][0] || 'Select One'}}\n" +
    "							</span>\n" +
    "							<span class=\"caret\"></span>\n" +
    "						</button>\n" +
    "						<ul class=\"dropdown-menu\">\n" +
    "							<li ng-repeat=\"option in item.options track by option.id\"\n" +
    "								ng-class=\"{'disabled': option.disabled, 'active': data.selected.filters_options[item.id][0] == option.title}\"\n" +
    "								ng-click=\"addFilter()\">\n" +
    "								<a>{{option.title}}</a>\n" +
    "							</li>\n" +
    "						</ul>\n" +
    "					</div>\n" +
    "\n" +
    "					<!-- Cascading single-selects -->\n" +
    "					<div class=\"btn-group\" ng-if=\"item.form_type == 'select_cascade'\"\n" +
    "						ng-repeat=\"option_group in item.options\" dropdown>\n" +
    "						<button type=\"button\" class=\"btn dropdown-toggle\" dropdown-toggle\n" +
    "							ng-hide=\"$index > 0 && !item.options[$index][data.selected.filters[item.id][$index - 1]]\">\n" +
    "							<span class=\"dropdown-title\">\n" +
    "								{{data.selected.filters_options[item.id][$index] || item.form_select_title[$index]}}\n" +
    "							</span>\n" +
    "							<span class=\"caret\"></span>\n" +
    "						</button>\n" +
    "						<ul class=\"dropdown-menu\" ng-if=\"$index == 0\" ng-init=\"parent_idx = $index\">\n" +
    "							<li ng-repeat=\"option in option_group track by option.id\"\n" +
    "								ng-class=\"{'disabled': option.disabled, 'active': data.selected.filters_options[item.id][parent_idx] == option.title}\"\n" +
    "								ng-click=\"addFilter()\">\n" +
    "								<a>{{option.title}}</a>\n" +
    "							</li>\n" +
    "						</ul>\n" +
    "						<ul class=\"dropdown-menu\" ng-if=\"$index > 0\" ng-init=\"parent_idx = $index\">\n" +
    "							<li ng-repeat=\"option in item.options[$index][data.selected.filters[item.id][$index - 1]] track by option.id\"\n" +
    "								ng-class=\"{'disabled': option.disabled, 'active': data.selected.filters_options[item.id][parent_idx] == option.title}\"\n" +
    "								ng-click=\"addFilter()\">\n" +
    "								<a>{{option.title}}</a>\n" +
    "							</li>\n" +
    "						</ul>\n" +
    "					</div>\n" +
    "\n" +
    "					<!-- Checkboxes -->\n" +
    "					<div class=\"btn-group checkboxes\" ng-if=\"item.form_type == 'checkbox'\">\n" +
    "						<button type=\"button\" class=\"checkbox\"\n" +
    "							ng-repeat=\"option in item.options track by option.id\" btn-checkbox\n" +
    "							ng-model=\"data.selected.filters_options[item.id][option.id]\"\n" +
    "							ng-class=\"{'disabled': option.disabled}\" ng-disabled=\"option.disabled\"\n" +
    "							ng-click=\"addFilter()\"\n" +
    "							id=\"{{item.id}}-{{option.id}}\"\n" +
    "							>\n" +
    "							<span class=\"glyphicon glyphicon-ok\"></span> {{option.title}}\n" +
    "						</button>\n" +
    "					</div>\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"desc\">\n" +
    "					<p ng-show=\"data.selected.option_desc[item.id]\">\n" +
    "						{{data.selected.option_desc[item.id]}}\n" +
    "					</p>\n" +
    "				</div>\n" +
    "			</tab>\n" +
    "		</tabset>\n" +
    "	</section>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"app-content\" ng-class=\"{'single': data.filtered.search}\" ui-scrollfix=\"-160\">\n" +
    "	<section class=\"filters-selected\" ng-class=\"{'has_selected': data.selected.filters_display.length > 0}\">\n" +
    "		<div>\n" +
    "			<h4>\n" +
    "				<span ng-hide=\"data.selected.filters_display.length == 0\">\n" +
    "					{{data.labels.header_selected[0]}}\n" +
    "				</span>\n" +
    "				<span>\n" +
    "					{{data.labels.header_selected[1]}}\n" +
    "					<span class=\"count\">{{data.filtered.counts.main}}</span>\n" +
    "					{{data.labels.header_selected[2]}}\n" +
    "				</span>\n" +
    "				<span ng-hide=\"data.selected.filters_display.length == 0\">\n" +
    "					{{data.labels.header_selected[3]}}\n" +
    "				</span>\n" +
    "			</h4>\n" +
    "			<span ng-repeat=\"filter in data.selected.filters_display\">\n" +
    "				<span class=\"label\" ng-repeat=\"(id, title) in filter\">\n" +
    "					<span>{{title[0]}}: </span>{{title[1]}}\n" +
    "					<button type=\"button\" class=\"close\" ng-click=\"confirmAction('remove')\">\n" +
    "						<span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span>\n" +
    "					</button>\n" +
    "				</span>\n" +
    "			</span>\n" +
    "			<div class=\"providers-header-fixed\">\n" +
    "				<div ng-repeat=\"column in data.labels.main.columns\" class=\"providers-col-{{$index + 1}}\"\n" +
    "					ng-class=\"{'sort-by': column.sort_by}\">\n" +
    "					<a ng-click=\"changeSort($index)\">{{column.title}} <span class=\"caret\"></span></a>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "	</section>\n" +
    "\n" +
    "	<section class=\"providers\">\n" +
    "		<table class=\"table table-responsive\">\n" +
    "			<thead class=\"providers-header\">\n" +
    "				<tr>\n" +
    "					<th ng-repeat=\"column in data.labels.main.columns\" class=\"providers-col-{{$index + 1}}\"\n" +
    "						ng-class=\"{'sort-by': column.sort_by}\">\n" +
    "						<a ng-click=\"changeSort($index)\">{{column.title}} <span class=\"caret\"></span></a>\n" +
    "					</th>\n" +
    "				</tr>\n" +
    "			</thead>\n" +
    "			<tbody ng-repeat=\"(group_index, group_name) in data.labels.main.groups.headers\"\n" +
    "				ng-if=\"isXSmallDevice()\" class=\"providers-content is-grouped\">\n" +
    "				<tr class=\"providers-group\"\n" +
    "					ng-hide=\"data.filtered.counts.groups[0][group_index] < 1 || data.filtered.search\">\n" +
    "					<td>{{group_name}}</td>\n" +
    "				</tr>\n" +
    "				<tr ng-repeat=\"provider in data.filtered.main track by provider.id\" ng-show=\"!provider.hide\"\n" +
    "					ng-if=\"group_index == provider[data.labels.main.groups.group_key]\"\n" +
    "					id=\"provider-{{provider.id}}\" ng-class=\"{'is-open': provider.is_open}\"\n" +
    "					popover=\"<div class='arrow'></div><div class='detail'>{{provider.detail.html}}</div>\"\n" +
    "					popover-placement=\"bottom\" popover-trigger=\"show\" ng-click=\"toggleDetail(provider.id)\">\n" +
    "					<td class=\"providers-col-1\">\n" +
    "						<span>\n" +
    "							<span class=\"provider-logo\">\n" +
    "								<img ng-src=\"{{data.base_url}}{{provider.logo}}\" alt=\"\" />\n" +
    "							</span>\n" +
    "							<span class=\"provider-name\">\n" +
    "								<h5>{{provider.name}}</h5>\n" +
    "							</span>\n" +
    "						</span>\n" +
    "						<button type=\"button\" class=\"close\">\n" +
    "							<span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span>\n" +
    "						</button>\n" +
    "					</td>\n" +
    "				</tr>\n" +
    "			</tbody>\n" +
    "			<tbody class=\"providers-content\" ng-if=\"!isXSmallDevice()\">\n" +
    "				<tr ng-repeat=\"provider in data.filtered.main track by provider.id\" ng-show=\"!provider.hide\"\n" +
    "					id=\"provider-{{provider.id}}\" ng-class=\"{'is-open': provider.is_open}\"\n" +
    "					popover=\"<div class='arrow'></div><div class='detail'>{{provider.detail.html}}</div>\"\n" +
    "					popover-placement=\"bottom\" popover-trigger=\"show\" ng-click=\"toggleDetail(provider.id)\">\n" +
    "					<td class=\"providers-col-1\">\n" +
    "						<span>\n" +
    "							<span class=\"provider-logo\">\n" +
    "								<img ng-src=\"{{data.base_url}}{{provider.logo}}\" alt=\"\" />\n" +
    "							</span>\n" +
    "							<span class=\"provider-name\">\n" +
    "								<h5>{{provider.name}}</h5>\n" +
    "							</span>\n" +
    "						</span>\n" +
    "						<button type=\"button\" class=\"close\">\n" +
    "							<span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span>\n" +
    "						</button>\n" +
    "					</td>\n" +
    "					<td class=\"providers-col-2\"><span>{{provider.tier_name}}</span></td>\n" +
    "					<td class=\"providers-col-3\">\n" +
    "						<span>{{provider.cloud_partner_connect}}</span>\n" +
    "					</td>\n" +
    "				</tr>\n" +
    "			</tbody>\n" +
    "		</table>\n" +
    "	</section>\n" +
    "</div>\n" +
    "\n" +
    "<footer class=\"app-footer\">\n" +
    "	<div><p>{{data.labels.disclaimer}}</p></div>\n" +
    "</footer>\n" +
    "");
}]);
