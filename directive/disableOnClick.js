app.directive('disableOnClick', function ($window) {
    return {
        link: function(scope, element, attrs) {
            element.on('click', () => {
                let thisElement = element[0];
                thisElement.disabled = true;

                thisElement.unbindEventHandler = scope.$on('finished', (event, data) => {
                    event.preventDefault();
                    thisElement.disabled = false;
                    thisElement.unbindEventHandler();
                    thisElement.unbindEventHandler = undefined;
               });
            });
        }
    };
});
