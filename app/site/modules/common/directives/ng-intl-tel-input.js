angular.module('ngIntlTelInput', []); angular.module('ngIntlTelInput')
  .provider('ngIntlTelInput', function () {
    var me = this;
    var props = {};
    var setFn = function (obj) {
      if (typeof obj === 'object') {
        for (var key in obj) {
          props[key] = obj[key];
        }
      }
    };
    me.set = setFn;

    me.$get = ['$log', function ($log) {
      return Object.create(me, {
        init: {
          value: function (elm) {
            if (!window.intlTelInputUtils) {
              $log.warn('intlTelInputUtils is not defined. Formatting and validation will not work.');
            }
            elm.intlTelInput(props);
          }
        },
      });
    }];
  });
angular.module('ngIntlTelInput')
  .directive('ngIntlTelInput', ['ngIntlTelInput', '$log', '$http',
    function (ngIntlTelInput, $log, $http) {
      return {
        restrict: 'A',
        require: 'ngModel',
        scope: { 'country': '@' },
        link: function (scope, elm, attr, ctrl) {
          // Warning for bad directive usage.
          if ((!!attr.type && (attr.type !== 'text' && attr.type !== 'tel')) || elm[0].tagName !== 'INPUT') {
            $log.warn('ng-intl-tel-input can only be applied to a *text* or *tel* input');
            return;
          }
          // Validation.
          ctrl.$validators.ngIntlTelInput = function (value) {
            if (value || elm[0].value.length > 0) {
              return elm.intlTelInput("isValidNumber");
            } else {
              return true;
            }
          };
          // Set model value to valid, formatted version.
          ctrl.$parsers.push(function (value) {
            var phone = {};
            phone.code = '+' + elm.intlTelInput('getSelectedCountryData').dialCode;
            phone.number = elm.intlTelInput('getNumber');
            phone.number = phone.number.replace(phone.code, '');
            return phone;
          });
          // Set input value to model value and trigger evaluation.
          ctrl.$formatters.push(function (phone) {
            return ($http.get('//ipinfo.io').then(function (response) {
              var countryCode = (response && response.data.country) ? response.data.country : "";
              ngIntlTelInput.set({ defaultCountry: countryCode });
              ngIntlTelInput.init(elm);
              if (phone) {
                elm.intlTelInput('setNumber', phone.code + phone.number);
                return phone.number;
              } else {
                return;
              }
            }));
          });
        }
      };
    }]);
