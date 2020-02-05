var app = angular.module('app', []);
// var api = 'https://stark-sands-60128.herokuapp.com';
var api = 'http://localhost:5000';

app.controller('BigFiveController', function($scope, $http, $window) {
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

app.controller('HomeController', function($scope, $http, $window) {
  $scope.user = {};
  $scope.user.questionSet = "1"; // This will be hardcoded based on the question set

  $('.gender-radio-button').change(function() {
    if (this.id == "gender-specified"){
      $('#gender-text').prop('disabled', false);
      $('#gender-text').prop('required', true);
    } else {
      $('#gender-text').prop('required', false);
      $('#gender-text').val("");
      $('#gender-text').prop('disabled', true);
    }
  });

  $('.edu-radio-button').change(function() {
    if (this.id == "education-specified"){
      $('#education-text').prop('disabled', false);
      $('#education-text').prop('required', true);
    } else {
      $('#education-text').prop('required', false);
      $('#education-text').val("");
      $('#education-text').prop('disabled', true);
    }
  });

  $scope.indexNext = function(user) {
    if (user.gender && user.age && user.age >=18 && user.education && user.socialmedia && (user.gender == "gender-specified" ? user.genderSpecified : true) && (user.education == "education-specified" ? user.educationSpecified : true)) {
      $("#index-next").attr('disabled', true);

      $(".input-text").attr('disabled', true);
      $(".specify-text").attr('disabled', true);
      $(".edu-specify-text").attr('disabled', true);

      $(".radio-button").attr('disabled', true);
      $(".gender-radio-button").attr('disabled', true);
      $(".edu-radio-button").attr('disabled', true);

      $("#index-next").css('background-color', 'grey');
      $("#index-instructions").css("display", "block");
    }
  };

  $scope.submitDetails = function(user) {
    $("#index-submit-button").attr('disabled', true);

    //Set up the user object
    if (user.gender != "gender-specified"){
      delete user.genderSpecified;
    }
    if (user.education != "education-specified"){
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

  $scope.currentQIndex = 0;

  $scope.userId = $window.sessionStorage.getItem('userId');
  $scope.questionSet = $window.sessionStorage.getItem('questionSet');
  $scope.order = JSON.parse($window.sessionStorage.getItem('order'));

  $scope.question = {};
  $scope.sliderChanged = false;
  $scope.opinionChanged = false;
  $scope.radioChanged = false;
  $scope.onbeforeunloadEnabled = true;
  $scope.count = 0;

  $scope.question = {};

  $(".question-radio-opinion").change(function() {
    $scope.radioChanged = true;
    $(".question-confidence").css("display", "block");
  });

  $(".slider-one").change(function() {
    $scope.sliderChanged = true;
    $("#output").css("color", "green");
    $(".question-opinion").css("display", "block");
  });

  $(".question-opinion").change(function() {
    $scope.opinionChanged = true;
    if ($.trim($('.opinion-textarea').val()) != "") {
      $("#submit-button").css("display", "block");
    } else {
      $("#submit-button").css("display", "none");
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
  $scope.myAnswer.initialConfidence = 50;
  $scope.myAnswer.userId = $scope.userId;
  $scope.myAnswer.questionSet = $scope.questionSet;

  $scope.submitAnswer = function() {

    if ($scope.sliderChanged && $scope.radioChanged && $scope.opinionChanged) {
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
        console.log(response.data);

        $scope.myAnswer = {};
        $(".image-area").css("display", "none");
        $(".image-area-two").css("display", "block");

        $(".question-area").css("display", "none");
        $(".change-area").css("display", "block");

        $("input[type=radio]").attr('disabled', false);
        $("input[type=range]").attr('disabled', false);
        $("input[type=textarea]").attr('disabled', false);

      }, function(error) {
        console.log("Error occured when loading the chart");
      });
    }
  };

  $scope.manipulationChanged = false;
  $scope.changeRadioChanged = false;
  $scope.sliderTwoChanged = false;
  $scope.newOpinionChanged = false;

  $scope.sliderLikeChanged = false;
  $scope.sliderCommChanged = false;
  $scope.sliderShareChanged = false;
  $scope.sliderReportChanged = false;

  $(".manipulation-radio-opinion").change(function() {
    $scope.manipulationChanged = true;
    $(".change-radio-opinion").css("display", "block");
  });

  $(".change-radio-opinion").change(function() {
    $scope.changeRadioChanged = true;
    $(".change-confidence").css("display", "block");
  });

  $(".slider-two").change(function() {
    $scope.sliderTwoChanged = true;
    $("#outputTwo").css("color", "green");
    $(".change-opinion").css("display", "block");
  });

  $(".change-opinion").change(function() {
    $scope.newOpinionChanged = true;
    if ($.trim($('.new-opinion-textarea').val()) != "") {
      $(".responses").css("display", "block");
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
  });


  $scope.update = function() {

    if ($scope.manipulationChanged && $scope.changeRadioChanged && $scope.sliderTwoChanged && $scope.newOpinionChanged && $scope.sliderLikeChanged &&
      $scope.sliderCommChanged && $scope.sliderShareChanged && $scope.sliderReportChanged) {

      //Remove the question area and chart area
      $("#change-area").css("display", "none");
      $("#image-area-two").css("display", "none");

      $scope.myAnswer.questionId = $scope.question.questionNumber;
      $scope.myAnswer.userId = $scope.userId;
      $scope.myAnswer.questionSet = $scope.questionSet;
      console.log($scope.myAnswer);

      $http({
        method: 'POST',
        url: api + '/updateAnswer',
        data: $scope.myAnswer,
        type: JSON,
      }).then(function(response) {
        $scope.next();
      }, function(error) {
        console.log("Error occured when updating the answers");
      });
    }
  };

  $scope.next = function(){
    alert("Here");
  };

  // $scope.next = function() {
  //   //Remove the question area and chart area
  //   $("#question-area").css("display", "none");
  //   $("#chart-area").css("display", "none");
  //   $("#avatar-area").css("display", "none");
  //   $("#names-area").css("display", "none");
  //   $("#change-section").css("display", "none");
  //
  //   $scope.count = 0;
  //
  //   //Make the input enabled and submit invisible
  //   $("input[type=radio]").attr('disabled', false);
  //   $("input[type=range]").attr('disabled', false);
  //   $("#submit-button").css("display", "none");
  //   $("#confidence-container").css("display", "none");
  //   $("#change-section").css("border", "none");
  //
  //   //Handling the ending of the quiz and directing to the big five questionnaire
  //   if ($scope.currentQIndex == 40) {
  //     //Disable the confirmation message
  //     $scope.onbeforeunloadEnabled = false;
  //     //Save chat messages to the database
  //     var data = {
  //       userId: $scope.userId,
  //       chats: JSON.parse(angular.toJson($scope.history))
  //     };
  //
  //     $http({
  //       method: 'POST',
  //       url: api + '/saveChats',
  //       data: data,
  //       type: JSON,
  //     }).then(function(response) {
  //         console.log("Chat messages saved successfully.");
  //         $window.location.href = './big-five.html';
  //       },
  //       function(error) {
  //         console.log("Error occured when saving the chat messages.");
  //       });
  //   } else {
  //     $scope.userId = $window.sessionStorage.getItem('userId');
  //     var data = {
  //       set: $scope.questionSet,
  //       id: $scope.order[$scope.currentQIndex]
  //     };
  //     console.log($scope.currentQIndex);
  //
  //     $http({
  //       method: 'POST',
  //       url: api + '/question',
  //       data: data,
  //       type: JSON,
  //     }).then(function(response) {
  //
  //       //Display the new question area and chart area
  //       $("#question-area").css("display", "block");
  //       $("#chart-area").css("display", "block");
  //       $("#avatar-area").css("display", "block");
  //       $("#names-area").css("display", "block");
  //       $("#change-section").css("display", "block");
  //
  //       $scope.myAnswer = {};
  //       $scope.sliderChanged = false;
  //       $scope.myAnswer.confidence = 50;
  //       $scope.question = response.data;
  //
  //       if ($scope.currentQIndex == 1) {
  //         $("#question-area").css("display", "none");
  //         $scope.userState = "trained";
  //         $scope.history.push({
  //           name: "QuizBot",
  //           msg: "The training is complete! You may now attempt the quiz. The quiz contains 39 multiple-choice questions. To start the quiz type 'GO'. Do NOT refresh the page or go back during the quiz."
  //         });
  //
  //         $timeout(function() {
  //           $scope.scrollAdjust();
  //         }, 500);
  //       } else {
  //         $scope.history.push({
  //           name: "QuizBot",
  //           msg: "Moving to the next question (" + $scope.currentQIndex.toString() + "/39). If you need my help with words type 'HELP'."
  //         });
  //         $timeout(function() {
  //           $scope.scrollAdjust();
  //         }, 500);
  //       }
  //
  //       if ($scope.question.img) {
  //         $("#image-container").css("display", "inline");
  //       } else {
  //         $("#image-container").css("display", "none");
  //       }
  //
  //       $("#loader").css("display", "none");
  //       $("#loader-text").css("display", "none");
  //       $("#chart_div").css("display", "none");
  //       $("#avatar_div").css("display", "none");
  //       $("#names_div").css("display", "none");
  //       $("#change-section").css("display", "none");
  //       $("#submit-button").prop("disabled", false);
  //       $("#output").val("Not Specified");
  //       $("#output").css("color", "red");
  //
  //       $scope.currentQIndex += 1;
  //
  //     }, function(error) {
  //       console.log("Error occured when loading the question");
  //     });
  //   }
  // };
  //
  // //Chatbot function to start the quiz
  // $scope.userState = "ready"; // Setting the inital stage
  //
  // //Function to adjust scrolling - not working
  // $scope.scrollAdjust = function() {
  //   var element = document.getElementById("text-area");
  //   element.scrollTop = element.scrollHeight;
  // };
  //
  // $scope.train = function() {
  //   $scope.userState = "trained"; //Started the training
  //   $("#question-area").css("display", "inline");
  //   $("#qBox").css("border", "solid red");
  //
  //   $scope.history.push({
  //     name: "QuizBot",
  //     msg: "Given above is an example question that could appear in the quiz. As your mentor I can help you understand the question, by explaining what certain words included in the question mean."
  //   });
  //
  //   $timeout(function() {
  //     $scope.scrollAdjust();
  //   }, 500);
  //
  //   $timeout(function() {
  //     $scope.history.push({
  //       msg: "Now, type 'HELP' to understand the meaning of difficult words in this question."
  //     });
  //   }, 500);
  //
  //   $timeout(function() {
  //     $scope.scrollAdjust();
  //   }, 500);
  // };
  //
  // $scope.go = function() {
  //   $("#question-area").css("display", "inline");
  //   $scope.history.push({
  //     name: "QuizBot",
  //     msg: "You just started the quiz! As your mentor, I can help you understand the question by explaining what certain words in the question mean. If you need my help type 'HELP'."
  //   });
  //
  //   $scope.userState = "started"; //Started the quiz
  //   $timeout(function() {
  //     $scope.scrollAdjust();
  //   }, 500);
  // };
  //
  // $scope.help = function(words) {
  //   if (words != undefined) {
  //     $scope.history.push({
  //       name: "QuizBot",
  //       msg: "I can explain the following words related to this question."
  //     });
  //
  //     for (var i = 0; i < words.length; i++) {
  //       var text = "";
  //       text += (i + 1).toString() + " : " + words[i].key;
  //       $scope.history.push({
  //         msg: text
  //       });
  //     }
  //     $scope.history.push({
  //       msg: "Type 'EXPLAIN' and the word to find the meaning. e.g. EXPLAIN " + words[0].key
  //     });
  //     $scope.message = "";
  //   } else {
  //     $scope.history.push({
  //       name: "QuizBot",
  //       msg: "Oops! Seems like there are no words I can help you with in this questions."
  //     });
  //     $scope.message = "";
  //   }
  //
  // };
  //
  // $scope.explain = function(handle) {
  //
  //   var splitWords = handle.split(" ");
  //   var word = "";
  //
  //   if (splitWords.length == 2) {
  //     //Get the word
  //     word = splitWords[1];
  //   } else {
  //     //For two word phrases
  //     if (splitWords.length > 2) {
  //       word = splitWords[1] + " " + splitWords[2];
  //     }
  //   }
  //
  //   var words = $scope.question.words;
  //
  //   //Check if a word was entered
  //   if (word == undefined) {
  //     $scope.history.push({
  //       name: "QuizBot",
  //       msg: "I am sorry. Seems like you did not enter a word. Type 'EXPLAIN' and the word to find the meaning. e.g. EXPLAIN " + words[0].key
  //     });
  //   } else {
  //     //Check if the word is available in the given list
  //     var index = $scope.isKeyAvailable(word.toLowerCase(), words);
  //     if (index != -1) {
  //       $scope.history.push({
  //         name: "QuizBot",
  //         msg: words[index].key + " => " + words[index].explaination
  //       });
  //
  //     } else {
  //       $scope.history.push({
  //         name: "QuizBot",
  //         msg: "I am sorry. I can't provide an interpretation for the word you entered."
  //       });
  //       $scope.help(words);
  //     }
  //   }
  //   $scope.message = "";
  // };
  //
  // $scope.error = function() {
  //   $scope.history.push({
  //     name: "QuizBot",
  //     msg: "Oops! I don't recognize this command. Please try again."
  //   });
  //
  //   //Check user state and repeat instruction
  //   switch ($scope.userState) {
  //     case 'help':
  //       $scope.help($scope.question.words)
  //       break;
  //     default:
  //       $scope.message = "";
  //   }
  // };
  //
  // //Call sendMessage on Enter
  //
  // var chatBox = document.getElementById("chat-text");
  //
  // // Execute a function when the user releases a key on the keyboard
  // chatBox.addEventListener("keyup", function(event) {
  //   // Cancel the default action, if needed
  //   event.preventDefault();
  //   // Number 13 is the "Enter" key on the keyboard
  //   if (event.keyCode === 13) {
  //     document.getElementById("sendButton").click();
  //   }
  // });
  //
  // $scope.sendMessage = function() {
  //
  //   if ($scope.message != undefined && $scope.message.trim().length != 0) {
  //     $scope.history.push({
  //       name: "You",
  //       msg: $scope.message.toString()
  //     });
  //     $timeout(function() {
  //       $scope.scrollAdjust();
  //     }, 500);
  //
  //     //Handle requests
  //     var handle = $scope.message.toLowerCase();
  //
  //     if (handle == 'go') {
  //       if ($scope.userState == "trained") {
  //         $scope.go();
  //       } else {
  //         $scope.history.push({
  //           name: "QuizBot",
  //           msg: "You have already started the quiz."
  //         });
  //       }
  //       $scope.message = "";
  //
  //     } else if (handle == 'train') {
  //       if ($scope.userState == "ready") {
  //         $scope.train();
  //       } else {
  //         $scope.history.push({
  //           name: "QuizBot",
  //           msg: "You have already started the training."
  //         });
  //       }
  //       $scope.message = "";
  //     } else if (handle == 'help') {
  //       $scope.userState = "help";
  //       $scope.help($scope.question.words);
  //
  //     } else if (handle.includes('explain')) {
  //       $scope.userState = "explain";
  //       $scope.explain(handle);
  //     } else {
  //       $scope.error(handle);
  //     }
  //   }
  // };
  //
  // $scope.isKeyAvailable = function(key, obj) {
  //   for (var i = 0; i < obj.length; i++) {
  //     if (key == obj[i].key) {
  //       return i;
  //     }
  //   }
  //   return -1;
  // };

});
