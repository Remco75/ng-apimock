(function () {
    'use strict';

    function MockingController(mockService, variableService, $interval) {
        var vm = this;
        var interval;

        vm.echoMock = echoMock;
        vm.toggleRecording = toggleRecording;
        vm.selectMock = selectMock;
        vm.defaultMocks = defaultMocks;
        vm.passThroughMocks = passThroughMocks;
        vm.addVariable = addVariable;
        vm.updateVariable = updateVariable;
        vm.deleteVariable = deleteVariable;

        vm.$onInit = function() {
            fetchMocks();
            fetchVariables();

            vm.variable = {
                key: undefined,
                value: undefined
            };
        };

        /** Fetch all the mocks and make them available. */
        function fetchMocks() {
            mockService.get({}, function (response) {
                vm.mocks = response.mocks;
                vm.selections = response.selections;
                vm.record = response.record;
                if (vm.record) {
                    interval = $interval(refreshMocks, 5000);
                }
            });
        }

        /** Fetch all the variables and make them available. */
        function fetchVariables() {
            variableService.get({}, function (response) {
                vm.variables = response;
            });
        }

        /**
         * Refresh the mocks from the connect server
         */
        function refreshMocks() {
            mockService.get({}, function (response) {
                angular.merge(vm.mocks, response.mocks);
                vm.selections = response.selections;
            });
        }

        /**
         * Update the given Echo indicator.
         * @param mock The mock.
         * @param echo The echo.
         */
        function echoMock(mock, echo) {
            mockService.update({'identifier': mock.identifier, 'echo': echo}, function () {
                console.log(vm.mocks.find(function (m) {
                    return m.name === mock.name;
                }).echo = echo);
            });
        }

        /** Toggle the recording. */
        function toggleRecording() {
            mockService.toggleRecord({}, function (response) {
                vm.record = response.record;
                if (vm.record) {
                    interval = $interval(refreshMocks, 5000);
                } else {
                    $interval.cancel(interval);
                    refreshMocks();
                }
            });
        }

        /**
         * Select the given response.
         * @param mock The mock.
         * @param selection The selection.
         */
        function selectMock(mock, selection) {
            mockService.update({'identifier': mock.identifier, 'scenario': selection}, function () {
                vm.selections[mock.identifier] = selection;
            });
        }

        /** Reset all selections to default. */
        function defaultMocks() {
            mockService.setAllToDefault({}, function (response) {
                vm.mocks = response.mocks;
                vm.selections = response.selections;
            });
        }

        /** Reset all selections to passThrough. */
        function passThroughMocks() {
            mockService.setAllToPassThrough({}, function (response) {
                vm.mocks = response.mocks;
                vm.selections = response.selections;
            });
        }

        /** Adds the given variable. */
        function addVariable() {
            variableService.addOrUpdate(vm.variable, function() {
                vm.variables[vm.variable.key] = vm.variable.value;
                vm.variable = {
                    key: undefined,
                    value: undefined
                };
            });
        }

        /**
         * Update the given variable.
         * @param key The key.
         * @param value The value.
         */
        function updateVariable(key, value) {
            variableService.addOrUpdate({key: key, value: value}, function () {
                vm.variables[key] = value;
                vm.variable = {
                    key: undefined,
                    value: undefined
                };
            });
        }

        /**
         * Delete the variable matching the given key.
         * @param key The key.
         */
        function deleteVariable(key) {
            variableService.delete({key: key}, function () {
                delete vm.variables[key];
            });
        }
    }

    MockingController.$inject = ['mockService', 'variableService', '$interval'];

    /**
     * @ngdoc controller
     * @module ng-apimock
     * @name NgApimockController
     * @description
     * # Controller for selecting mocks.
     * Controller in the ng-apimock
     */
    angular
        .module('ng-apimock')
        .controller('NgApimockController', MockingController);
})();