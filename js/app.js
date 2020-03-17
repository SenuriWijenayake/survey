var app = angular.module('app', []);
// var api = 'https://stark-sands-60128.herokuapp.com';
var api = 'http://localhost:5000';

app.controller('BigFiveController', function($scope, $http, $window) {

  $scope.startTimer = function() {
    // Set the date we're counting down to
    var dt = new Date();
    dt.setMinutes(dt.getMinutes() + 5);
    var countDownDate = dt;

    // Update the count down every 1 second
    x = setInterval(function() {
      // Get today's date and time
      var now = new Date().getTime();
      // Find the distance between now and the count down date
      var distance = countDownDate - now;
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Display the result in the element with id="demo"
      document.getElementById("timer").innerHTML = "Time remaining : " + minutes + "m " + seconds + "s ";

      // If the count down is finished, write some text
      if (distance < 0) {
        //Stop the timer
        clearInterval(x);
        document.getElementById("timer").innerHTML = "Your time is up!";
      }
    }, 500);
  };

  $scope.startTimer();

  $http({
    method: 'GET',
    url: api + '/bigFiveQuestions'
  }).then(function(response) {
    $scope.questions = response.data;
    document.getElementById('userId').value = $window.sessionStorage.getItem('userId');
  }, function(error) {
    console.log("Error occured when loading the big five questions");
  });

});

app.controller('HomeController', function($scope, $http, $window, $timeout) {
  $scope.user = {};
  $scope.user.questionSet = "2"; // This will be hardcoded based on the question set

  $scope.display = function() {
    $window.sessionStorage.setItem('consentTime', Date.now());
    $(".landing-page").css("display", "none");
    $("#demographics").css("display", "block");
  };

  $('.gender-radio-button').change(function() {
    if (this.id == "gender-specified") {
      $('#gender-text').prop('disabled', false);
      $('#gender-text').prop('required', true);
    } else {
      $('#gender-text').prop('required', false);
      $('#gender-text').val("");
      $('#gender-text').prop('disabled', true);
    }
  });

  $('.edu-radio-button').change(function() {
    if (this.id == "education-specified") {
      $('#education-text').prop('disabled', false);
      $('#education-text').prop('required', true);
    } else {
      $('#education-text').prop('required', false);
      $('#education-text').val("");
      $('#education-text').prop('disabled', true);
    }
  });

  $scope.indexNext = function(user) {
    if (user.gender && user.age && user.age >= 18 && user.education && user.socialmedia && (user.gender == "gender-specified" ? user.genderSpecified : true) && (user.education == "education-specified" ? user.educationSpecified : true)) {

      $("#index-next").attr('disabled', true);
      $(".input-text").attr('disabled', true);
      $(".specify-text").attr('disabled', true);
      $(".edu-specify-text").attr('disabled', true);

      $(".radio-button").attr('disabled', true);
      $(".gender-radio-button").attr('disabled', true);
      $(".edu-radio-button").attr('disabled', true);

      $("#index-next").css('background-color', 'grey');

      $("#demographics").css("display", "none");
      $("#index-instructions").css("display", "block");
      $("#index-submit-button").attr('disabled', true);

      $timeout(function() {
        $("#index-submit-button").css("background-color", "#117A65");
        $("#index-submit-button").attr('disabled', false);
      }, 10000);
    }
  };

  $scope.submitDetails = function(user) {
    $("#index-submit-button").attr('disabled', true);

    //Set up the user object
    if (user.gender != "gender-specified") {
      delete user.genderSpecified;
    }
    if (user.education != "education-specified") {
      delete user.educationSpecified;
    }

    $http({
      method: 'POST',
      url: api + '/user',
      data: user,
      type: JSON,
    }).then(function(response) {
      $window.sessionStorage.setItem('userId', response.data.id);
      $window.sessionStorage.setItem('questionSet', user.questionSet);
      $window.sessionStorage.setItem('order', JSON.stringify(response.data.order));
      $window.location.href = './quiz.html';
    }, function(error) {
      console.log("Error occured when submitting user details");
    });

  };

});

app.controller('QuizController', function($scope, $http, $window, $timeout) {


  $scope.startTimer = function() {
    // Set the date we're counting down to
    var dt = new Date();
    dt.setMinutes(dt.getMinutes() + 50);
    var countDownDate = dt;

    // Update the count down every 1 second
    x = setInterval(function() {
      // Get today's date and time
      var now = new Date().getTime();
      // Find the distance between now and the count down date
      var distance = countDownDate - now;
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Display the result in the element with id="demo"
      document.getElementById("timer").innerHTML = "Time remaining : " + minutes + "m " + seconds + "s ";

      // If the count down is finished, write some text
      if (distance < 0) {
        //Stop the timer
        clearInterval(x);
        document.getElementById("timer").innerHTML = "Your time is up!";
      }
    }, 500);
  };

  $scope.currentQIndex = 0;

  $scope.userId = $window.sessionStorage.getItem('userId');
  $scope.questionSet = $window.sessionStorage.getItem('questionSet');
  $scope.order = JSON.parse($window.sessionStorage.getItem('order'));

  $scope.question = {};

  $scope.initialFamiliarityChanged = false;
  $scope.initialOpinionChanged = false;
  $scope.initialTextOpinionChanged = false;
  $scope.initialConfChanged = false;

  $scope.onbeforeunloadEnabled = true;
  $scope.question = {};

  //Start timer
  $scope.startTimer();

  $(".slider-familiarity").change(function() {
    $scope.initialFamiliarityChanged = true;
    $("#outputFamiliarity").css("color", "green");
    $(".question-radio-opinion").css("display", "block");
  });

  $(".slider-old-opinion").change(function() {
    $scope.initialOpinionChanged = true;
    $("#outputInitialOpinion").css("color", "green");
    if($scope.myAnswer.initialOpinion != 0){
      $(".question-confidence").css("display", "block");
    } else {
      $(".question-confidence").css("display", "none");
    }
  });

  $(".slider-one").change(function() {
    $scope.initialConfChanged = true;
    $("#output").css("color", "green");
    $(".question-opinion").css("display", "block");
    $(document).scrollTop($(document).height());
  });

  $(".opinion-textarea").keypress(function() {
    $scope.initialTextOpinionChanged = true;
    if ($.trim($('.opinion-textarea').val()) != "") {
      $("#submit-button").css("display", "block");
      $(document).scrollTop($(document).height());
    }
  });


  //Confirmation message before reload and back
  $window.onbeforeunload = function(e) {
    if ($scope.onbeforeunloadEnabled) {
      var dialogText = 'You have unsaved changes. Are you sure you want to leave the site?';
      e.returnValue = dialogText;
      return dialogText;
    }
  };

  //Setting the question one
  $http({
    method: 'POST',
    url: api + '/question',
    data: {
      set: $scope.questionSet,
      id: $scope.order[$scope.currentQIndex]
    },
    type: JSON,
  }).then(function(response) {
    $scope.currentQIndex += 1;
    $scope.question = response.data;

  }, function(error) {
    console.log("Error occured when getting the first question");
  });

  //Initialization
  $scope.myAnswer = {};
  $scope.myAnswer.initialOpinion = 0;
  $scope.myAnswer.initialConfidence = 50;
  $scope.myAnswer.initialFamiliarity = 50;
  $scope.myAnswer.userId = $scope.userId;
  $scope.myAnswer.questionSet = $scope.questionSet;

  $scope.submitAnswer = function() {

    if ($scope.initialOpinionChanged && $scope.initialConfChanged && $scope.initialTextOpinionChanged && $scope.initialFamiliarityChanged) {
      //Remove the button
      $("#submit-button").css("display", "none");
      //Disbling the input
      $("input[type=radio]").attr('disabled', true);
      $("input[type=range]").attr('disabled', true);
      $("input[type=textarea]").attr('disabled', true);
      //Loader activated
      $("#index-loader").css("display", "block");

      $scope.myAnswer.questionId = $scope.question.questionNumber;
      $scope.myAnswer.userId = $scope.userId;
      $scope.myAnswer.questionSet = $scope.questionSet;

      console.log($scope.myAnswer);

      $http({
        method: 'POST',
        url: api + '/feedback',
        data: $scope.myAnswer,
        type: JSON,
      }).then(function(response) {
        //Loader removed
        $("#index-loader").css("display", "none");

        $scope.newAnswer = {};
        $scope.newAnswer.newOpinion = 0;
        $scope.newAnswer.newConfidence = 50;
        $scope.newAnswer.like = 50;
        $scope.newAnswer.comment = 50;
        $scope.newAnswer.share = 50;
        $scope.newAnswer.report = 50;

        $scope.manipulationChanged = false;
        $scope.newOpinionChanged = false;
        $scope.newTextOpinionChanged = false;
        $scope.newConfChanged = false;

        $scope.sliderLikeChanged = false;
        $scope.sliderCommChanged = false;
        $scope.sliderShareChanged = false;
        $scope.sliderReportChanged = false;

        $("#outputTwo").val("Not Specified");
        $("#outputTwo").css("color", "red");
        $("#outputNewOpinion").val("Not Specified");
        $("#outputNewOpinion").css("color", "red");
        $("#outputLike").val("Not Specified");
        $("#outputLike").css("color", "red");
        $("#outputComment").val("Not Specified");
        $("#outputComment").css("color", "red");
        $("#outputShare").val("Not Specified");
        $("#outputShare").css("color", "red");
        $("#outputReport").val("Not Specified");
        $("#outputReport").css("color", "red");

        $(".image-area").css("display", "none");
        $(".image-area-two").css("display", "block");

        $(".question-area").css("display", "none");
        $(".change-area").css("display", "block");

        $("input[type=radio]").attr('disabled', false);
        $("input[type=range]").attr('disabled', false);
        $("input[type=textarea]").attr('disabled', false);
        window.scrollTo(0, 0);

      }, function(error) {
        console.log("Error occured when loading the chart");
      });
    }
  };

  $(".manipulation-radio-opinion").change(function() {
    $scope.manipulationChanged = true;
    $(".change-radio-opinion").css("display", "block");
  });

  $(".slider-new-opinion").change(function() {
    $scope.newOpinionChanged = true;
    $("#outputNewOpinion").css("color", "green");
    if ($scope.newAnswer.newOpinion != 0){
      $(".change-confidence").css("display", "block");
    } else {
      $(".change-confidence").css("display", "none");
    }
  });

  $(".slider-two").change(function() {
    $scope.newConfChanged = true;
    $("#outputTwo").css("color", "green");
    $(".change-opinion").css("display", "block");
    $(document).scrollTop($(document).height());
  });

  $(".new-opinion-textarea").keypress(function() {
    $scope.newTextOpinionChanged = true;
    if ($.trim($('.new-opinion-textarea').val()) != "") {
      $(".responses").css("display", "block");
      $(document).scrollTop($(document).height());
    }
  });


  $(".slider-like").change(function() {
    $scope.sliderLikeChanged = true;
    $("#outputLike").css("color", "green");
  });

  $(".slider-comm").change(function() {
    $scope.sliderCommChanged = true;
    $("#outputComment").css("color", "green");
  });

  $(".slider-share").change(function() {
    $scope.sliderShareChanged = true;
    $("#outputShare").css("color", "green");
  });

  $(".slider-report").change(function() {
    $scope.sliderReportChanged = true;
    $("#outputReport").css("color", "green");
    $("#next-button").css("display", "block");
    $(document).scrollTop($(document).height());
  });

  $scope.update = function() {

    if ($scope.manipulationChanged && $scope.newOpinionChanged && $scope.newConfChanged && $scope.newTextOpinionChanged && $scope.sliderLikeChanged &&
      $scope.sliderCommChanged && $scope.sliderShareChanged && $scope.sliderReportChanged) {

      //Remove the question area and chart area
      $(".change-area").css("display", "none");
      $(".image-area-two").css("display", "none");

      $scope.newAnswer.questionId = $scope.question.questionNumber;
      $scope.newAnswer.userId = $scope.userId;
      $scope.newAnswer.questionSet = $scope.questionSet;
      console.log($scope.newAnswer);

      $http({
        method: 'POST',
        url: api + '/updateAnswer',
        data: $scope.newAnswer,
        type: JSON,
      }).then(function(response) {
        $scope.next();
      }, function(error) {
        console.log("Error occured when updating the answers");
      });
    }
  };

  $scope.next = function() {

    $scope.myAnswer = {};

    $("input[type=radio]").attr('disabled', false);
    $("input[type=range]").attr('disabled', false);
    $("input[type=textarea]").attr('disabled', false);

    //Handling the ending of the quiz and directing to the big five questionnaire
    if ($scope.currentQIndex == 28) {
      //Disable the confirmation message
      $scope.onbeforeunloadEnabled = false;
      $window.location.href = './big-five.html';
    } else {
      $scope.userId = $window.sessionStorage.getItem('userId');
      var data = {
        set: $scope.questionSet,
        id: $scope.order[$scope.currentQIndex]
      };
      console.log($scope.currentQIndex);

      $http({
        method: 'POST',
        url: api + '/question',
        data: data,
        type: JSON,
      }).then(function(response) {

        //Display the new question area
        $(".question-area").css("display", "block");
        $(".image-area").css("display", "block");
        $(".question-radio-opinion").css("display", "none");
        $(".question-confidence").css("display", "none");
        $(".question-opinion").css("display", "none");

        $(".change-radio-opinion").css("display", "none");
        $(".change-confidence").css("display", "none");
        $(".change-opinion").css("display", "none");
        $(".responses").css("display", "none");
        $("#next-button").css("display", "none");

        $scope.myAnswer = {};
        $scope.myAnswer.initialOpinion = 0;
        $scope.myAnswer.initialConfidence = 50;
        $scope.myAnswer.initialFamiliarity = 50;

        $scope.initialOpinionChanged = false;
        $scope.initialTextOpinionChanged = false;
        $scope.initialConfChanged = false;
        $scope.initialFamiliarityChanged = false;

        $scope.question = response.data;

        $("#submit-button").prop("disabled", false);
        $("#output").val("Not Specified");
        $("#output").css("color", "red");
        $("#outputFamiliarity").val("Not Specified");
        $("#outputFamiliarity").css("color", "red");
        $("#outputInitialOpinion").val("Not Specified");
        $("#outputInitialOpinion").css("color", "red");

        $scope.currentQIndex += 1;
        window.scrollTo(0, 0);

      }, function(error) {
        console.log("Error occured when loading the question");
      });
    }
  };


});
