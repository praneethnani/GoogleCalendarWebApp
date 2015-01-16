var googlecalapp = angular.module('GoogleCalendar', ["googleApi", 'ui.calendar', 'ui.bootstrap']);

/*
Using Google Client Api to authenticate a user and connect to calendar
*/
googlecalapp.config(function(googleLoginProvider) {
    googleLoginProvider.configure({
        clientId: '603173009698-vrh62ib7vad7qea0jngrufr58a216nm6.apps.googleusercontent.com',
        scopes: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/plus.login"
        ]
    });
});

/*
 controller for GoogleCalendarCtrl
*/
googlecalapp.controller('GoogleCalendarCtrl', ['$scope', 'googleLogin',
 'googleCalendar', 'googlePlus', '$rootScope', '$compile', 'uiCalendarConfig', '$modal','$log',
    function($scope, googleLogin, googleCalendar, googlePlus, $rootScope, $compile, uiCalendarConfig, $modal,$log) {
    /*
 	Login 
	*/
        $scope.login = function() {
            googleLogin.login();
        };
        
        $scope.$on("googlePlus:loaded", function() {
            googlePlus.getCurrentUser().then(function(user) {
                $scope.currentUser = user;
                $scope.loadCalendars();
            });
        })
        $scope.currentUser = googleLogin.currentUser;

    /*
    load events from google calender
    */
        $scope.loadEvents = function() {
            var jsondata = [];
             if (typeof $scope.selectedCalendarid =='undefined' || 
             $scope.selectedCalendarid !=this.selectedCalendar.id){
            this.calendarItems = googleCalendar.listEvents({
                calendarId: this.selectedCalendar.id
            }).then(function(response) {
                $scope.calendarItems = response;
                getEvents();
                
                /* configure calendar */
                
                $scope.uiConfig = {
                    calendar: {
                        height: 450,
                        editable: true,
                        header: {
                            left: 'title',
                            center: '',
                            right: 'today prev,next'
                        },
                        eventClick: $scope.alertOnEventClick,
                        eventDrop: $scope.alertOnDrop,
                        eventResize: $scope.alertOnResize,
                        eventRender: $scope.eventRender,
                        dayClick: $scope.dayClick
                    }
                };
            });
            $scope.selectedCalendarid=this.selectedCalendar.id
         }   
        }
        $scope.displayToday=new Date();
        /*
        load all calendars for an user account
        */
        $scope.loadCalendars = function() {
            $scope.calendars = googleCalendar.listCalendars();
        }
        
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        /* event source that contains custom events on the scope */
        /* sample event */
        $scope.events = [{
            title: 'Click for Google',
            start: new Date(y, m, 28),
            end: new Date(y, m, 29),
            url: 'http://google.com/'
        }];
        
        /*
        pushes the events from google calendar to events 
        */

        function getEvents() {
            var response = $scope.calendarItems
            var events = [];
            for (event in response) {

                var end = ""
                var start = ""
                try {
                    end = response[event]["end"].dateTime;
                } catch (err) {
                    end = response[event]["end"].date;
                }
                try {
                    start = response[event]["start"].dateTime;
                } catch (err) {
                    start = response[event]["start"].date;
                }
                var endDate = new Date(end);
                var startDate = new Date(start);

                $scope.events.push({
                    '_id': parseInt(event) + 1,
                    title: response[event].summary,
                    start: startDate,
                    end: endDate

                });
            }
        };


        $scope.date_clicked = new Date();
        $scope.displayClickDate = new Date();
        /*
        checking the input and creating a new event  and
        adding it to google calendar
        */
        $scope.addEvent = function() {
            var error = "";
            if (typeof $scope.startTimeHours == 'undefined') {
                alert("please enter startTimeHours");
            } else if (typeof $scope.startTimeMinutes == 'undefined') {
                alert("please enter startTimeMinutes");
            } else if (typeof $scope.endTimeHours == 'undefined') {
                alert("please enter endTimeHours");
            } else if (typeof $scope.endTimeMinutes == 'undefined') {
                alert("please enter endTimeMinutes");
            } else if ($scope.startTimeHours > $scope.endTimeHours) {
                alert("startTime should be less than endTime");
            } else if (($scope.startTimeHours == $scope.endTimeHours) && ($scope.endTimeMinutes < $scope.startTimeMinutes)) {
                alert("startTimeMinutes should be less than endTimeMinutes");
            } else {
                var d = $scope.date_clicked.getDate();
                var m = $scope.date_clicked.getMonth();
                var y = $scope.date_clicked.getFullYear();
                var startDate = new Date(y, m, d, $scope.startTimeHours, $scope.startTimeMinutes);
                var endDate = new Date(y, m, d, $scope.endTimeHours, $scope.endTimeMinutes);
                /*
                push to new event to display on calendar
                */
                $scope.events.push({
                    title: $scope.newTitle,
                    start: startDate,
                    end: endDate,

                });
            $scope.newTitle="";
            $scope.startTimeHours="";
            $scope.startTimeMinutes="";
            $scope.endTimeHours="";
            $scope.endTimeMinutes="";
                /* 
                adding the new event to google calendar
                */
                var resource = {
                    "summary": $scope.newTitle,
                    "start": {
                        "dateTime": startDate
                    },
                    "end": {
                        "dateTime": endDate
                    }
                };

                var request = googleCalendar.createEvent({
                    'calendarId': this.selectedCalendar.id,
                    'resource': resource
                }).then(function(response) {
                    console.log("add to googleCalendar");
                });
            }
            
        };

    
        /* Change View */
        $scope.changeView = function(view, calendar) {
            uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
        };
        /* Change View */
        $scope.renderCalendar = function(calendar) {
            if (uiCalendarConfig.calendars[calendar]) {
                uiCalendarConfig.calendars[calendar].fullCalendar('render');
            }
        };
        /* Render Tooltip */
        $scope.eventRender = function(event, element, view) {
            element.attr({
                'tooltip': event.title,
                'tooltip-append-to-body': true
            });
            $compile(element)($scope);
        };

        $scope.pre_css = '';
        
        /* handles click on calendar */
        $scope.dayClick = function(date, jsEvent, view) {
            if ($scope.pre_css != '') {
                $scope.pre_css.css('background-color', 'transparent');
            }
            $scope.date_clicked = new Date(date.format());
            var dateClick = $scope.date_clicked;
            $scope.displayClickDate = dateClick.setDate(dateClick.getDate() + 1);
            $(this).css('background-color', '#fcf8e3');
            $scope.pre_css = $(this);
         
        };

        /* handles show events*/
        $scope.showEvents = function(){
            var eve = $scope.events;
            $scope.items = [];
            var clickDate = $scope.date_clicked
            var clickd = $scope.date_clicked.getDate();
            var clickm = $scope.date_clicked.getMonth();
            var clicky = $scope.date_clicked.getFullYear();
         /* 
         compares the date clicked with dates of events from events from calendar and
         pushes the matching to items
          */
            if (typeof clickDate != 'undefined') {
                for (each in eve) {
                    if (typeof eve[each]["start"] != 'undefined') {
                        var dateJson = eve[each]["start"]
                        var jsond = dateJson.getDate();
                        var jsonm = dateJson.getMonth();
                        var jsony = dateJson.getFullYear();

                        if (clickd == jsond && clicky == jsony && clickm == jsonm) {
                            $scope.items.push({
                                'title': eve[each]["title"],
                                'startTime': eve[each]["start"],
                                'endTime': eve[each]["end"]
                            });

                        }

                    }


                }
                $scope.open();
            }

        };
      /* handles modal "show events" */
        $scope.open = function(size) {
            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                resolve: {
                    items: function() {
                        return $scope.items;
                    }
                }
            });
            modalInstance.result.then(function(selectedItem) {
                $scope.selected = selectedItem;
            }, function() {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
        /* event sources array*/
        $scope.eventSources = [$scope.events];
    }

]);

/* controller for modal "show events" */
googlecalapp.controller('ModalInstanceCtrl', function($scope, $modalInstance, items) {
    $scope.items = items;
    $scope.selected = {
        item: $scope.items[0]
    };
    $scope.ok = function() {
        $modalInstance.close($scope.selected.item);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});