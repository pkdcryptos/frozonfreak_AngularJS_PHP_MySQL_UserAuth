var phpuserauth = angular.module('phpuserauth',['ui.bootstrap','ui.router','mobile-angular-ui','mobile-angular-ui.gestures','mobile-angular-ui.migrate','angular-md5', 'cgNotify', 'ngCookies']).run(function($rootScope){
      $rootScope.userAgent = navigator.userAgent;
      
      // Needed for the loading screen
      $rootScope.$on('$routeChangeStart', function(){
        $rootScope.loading = true;
      });

      $rootScope.$on('$routeChangeSuccess', function(){
        $rootScope.loading = false;
      });

      // Fake text i used here and there.
      $rootScope.lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel explicabo, aliquid eaque soluta nihil eligendi adipisci error, illum corrupti nam fuga omnis quod quaerat mollitia expedita impedit dolores ipsam. Obcaecati.';

      // 
      // 'Scroll' screen
      // 
      var scrollItems = [];

      for (var i=1; i<=100; i++) {
        scrollItems.push('Item ' + i);
      }

      $rootScope.scrollItems = scrollItems;

      

});

phpuserauth.factory('appSession', function($http){
    return {
        registerUser: function(user_name, first_name, last_name, email, dob, password, verify_password) {
          return $http.post('server/updateTask.php',{
            type      : 'registerUser',
            userName  : user_name,
            firstName : first_name,
            lastName  : last_name,
            email     : email, 
            dob       : dob,
            password  : password,
            verifyPassword: verify_password
          });
        },
        verifyUserLogin: function(user_name, user_password){
          return $http.post('server/updateTask.php',{
            type      : 'verifyUserLogin',
            userName  : user_name,
            password  : user_password
          });
        }, 
        checkValidSession: function(TokenID){
          return $http.post('server/updateTask.php',{
            type       : 'checkValidSession',
            sessionId  : TokenID
          });
        },
        logOffUser: function(){
          return $http.post('server/updateTask.php',{
            type       : 'logOffUser'
          });
        }, 
        forgotpassword: function(user_email){
          return $http.post('server/updateTask.php',{
            type       : 'forgotpassword',
            email      : user_email
          });
        }, 
        updatepassword: function(email, token, password, verifypassword){
          return $http.post('server/updateTask.php',{
            type       : 'updatepassword',
            email      : email,
            token      : token,
            password   : password,
            verifypassword : verifypassword
          });
        }
    }
});

phpuserauth.config(function($stateProvider, $urlRouterProvider) {

  // Now set up the states
  $stateProvider
    .state('home', {
      url: "/",
      templateUrl: "partials/home.html",
      controller: 'appHomeController',
    })
    .state('login', {
      url: "/login",
      templateUrl: "partials/login.html",
      controller: 'appLoginController',
    })
    .state('register', {
      url: "/register",
      templateUrl: "partials/register.html",
      controller: 'appRegisterController',
    })
    .state('logoff', {
      url: "/logoff",
      templateUrl: "partials/logoff.html",
      controller: 'appLogOffController',
    })
    .state('forgotpassword', {
      url: "/forgotpassword",
      templateUrl: "partials/forgotpassword.html",
      controller: 'appForgotPassController',
    })
    .state('resetpassword', {
      url: "/resetpassword/:email/:token",
      templateUrl: "partials/resetpassword.html",
      controller: 'appResetPassController',
    })
    .state('404', {
      url: "/404",
      templateUrl: "404.html",
      controller: 'app404Controller',
    })
    // For any unmatched url, redirect to /state1
     $urlRouterProvider.otherwise("/");

});

phpuserauth.controller('appLoginController', function($scope, $timeout, $rootScope, $location, $cookieStore, md5, notify, appSession){
  
  $scope.rememberMe = true;
  $scope.username;
  $scope.password;
  $scope.login = function() {
      appSession.verifyUserLogin($scope.username, md5.createHash($scope.password)).success($scope.updateTasks).error($scope.displayError);
  };

  $scope.updateTasks= function(data, status){
      if(data["status"] == 0){
        $cookieStore.put('TokenID',data["message"]);
        $location.path('/');
        console.log("Success");
        notify("success");
      }
      else{
        console.log(data["message"]);
        notify(data["message"]);
      }
  };
  $scope.displayError = function(data, status){
      console.log("Error");
      notify("Error");
  };

  init();
  function init(){
      
  };

});

phpuserauth.controller('appRegisterController', function($scope, $timeout, $rootScope, md5, notify, appSession){
    
  $scope.user_name;
  $scope.first_name;
  $scope.last_name;
  $scope.dob;
  $scope.email;
  $scope.password;
  $scope.verify_password;

  $scope.register = function() {
      appSession.registerUser($scope.user_name, $scope.first_name, $scope.last_name, $scope.email, $scope.dob, md5.createHash($scope.password), md5.createHash($scope.verify_password)).success($scope.updateTasks).error($scope.displayError);
  };

  $scope.updateTasks= function(data, status){
      if(data["status"] == 0){
        console.log("Success");
        notify("Success");
      }
      else{
        console.log(data["message"]);
        notify(data["message"]);
      }
  };
  $scope.displayError = function(data, status){
      console.log("Error");
  };

  init();
  function init(){
      
  };

});

phpuserauth.controller('appHomeController', function($scope, $timeout, $rootScope, $cookieStore, $location, notify, appSession){

  $scope.updateTasks= function(data, status){
      if(data["status"] == 0)
        console.log("Success");
      else
        console.log(data["message"]);
  };
  
  $scope.displayError = function(data, status){
      console.log("Error");
  };

  $scope.aftValidSession = function(data, status){
    if(data["status"] == 1)
      $location.path('/login');
  };

  init();
  function init(){
      appSession.checkValidSession($cookieStore.get('TokenID')).success($scope.aftValidSession).error($scope.displayError);
  };

});

phpuserauth.controller('appLogOffController', function($scope, $timeout, $rootScope, $cookieStore, $location, notify, appSession){
  
  $scope.displayError = function(data, status){
      console.log("Error");
  };

  $scope.updAftLogout = function(data, status){
    if(data["status"] == 0){
      $cookieStore.remove("TokenID");
      $location.path("/login");
    }
    else{
      notify(data["message"]);
    }
  };

  init();
  function init(){
    $cookieStore.put('TokenID','');
    appSession.logOffUser().success($scope.updAftLogout).error($scope.displayError);
  };

});

phpuserauth.controller('appForgotPassController', function($scope, $timeout, $rootScope, $cookieStore, $location, notify, appSession){
  
  $scope.email;

  $scope.displayError = function(data, status){
      console.log("Error");
  };

  $scope.updAftLogout = function(data, status){
    if(data["status"] == 0){
      $cookieStore.remove("TokenID");
      $location.path("/login");
    }
    else{
      notify(data["message"]);
    }
  };

  $scope.forgotpassword = function(){
    appSession.forgotpassword($scope.email).success($scope.updAftLogout).error($scope.displayError);
  };

  init();
  function init(){
  
  };

});

phpuserauth.controller('appResetPassController', function($stateParams, $scope, $timeout, $rootScope, $cookieStore, $location, md5, notify, appSession){
  
  $scope.password;
  $scope.verifypassword;
  $scope.email;
  $scope.token;

  $scope.displayError = function(data, status){
      console.log("Error");
  };

  $scope.updtAftReset = function(data, status){
    if(data["status"] == 0){
      notify("password reset succesfull")
    }
    else{
      notify(data["message"]);
    }
  };

  $scope.updatepassword = function(){
    console.log($scope.password);
    console.log($scope.verifypassword);
      //if ($scope.password == $scope.verifypassword)
        appSession.updatepassword($stateParams.email, $stateParams.token, md5.createHash($scope.password), md5.createHash($scope.verifypassword)).success($scope.updtAftReset).error($scope.displayError);
      //else
      //  notify("password mismatch");
  };

  init();
  function init(){
    if($stateParams.email == '' || $stateParams.token == '')
      notify("Invalid URL");
    //console.log($stateParams.email);
    //console.log($stateParams.token);
  };

});

phpuserauth.controller('app404Controller', function($scope){

});

//Main Controller for body, handles loading and unloading along with preloader gif
phpuserauth.controller('MainController', function($rootScope, $scope){

  // User agent displayed in home page
  $scope.userAgent = navigator.userAgent;
  
  // Needed for the loading screen
  $rootScope.$on('$routeChangeStart', function(){
    $rootScope.loading = true;
  });

  $rootScope.$on('$routeChangeSuccess', function(){
    $rootScope.loading = false;
  });

  // Fake text i used here and there.
  $rootScope.lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vel explicabo, aliquid eaque soluta nihil eligendi adipisci error, illum corrupti nam fuga omnis quod quaerat mollitia expedita impedit dolores ipsam. Obcaecati.';

  
  // 'Forms' screen
  //  
  // 
  // 'Drag' screen
  // 
  $scope.notices = [];
  

  $scope.deleteNotice = function(notice) {
    var index = $scope.notices.indexOf(notice);
    if (index > -1) {
      $scope.notices.splice(index, 1);
    }
  };
});
